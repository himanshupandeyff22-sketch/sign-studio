import test from 'node:test';
import assert from 'node:assert/strict';
import {processInput,catalog,inputLimits} from './catalog.mjs';
import {signRegistry,isValidatedSign,entriesForMode} from '../web/sign-registry.mjs';
const demoInput=input=>processInput({...input,vocabularyMode:'demo'});
const ids=result=>result.sequence.map(item=>item.id);

test('a greeting and short sentence preserve known vocabulary and localized labels',()=>{
  const greeting=demoInput({text:'Hello!',language:'en'});
  assert.deepEqual(ids(greeting),['hello']);assert.equal(greeting.coverage.percent,100);
  const result=demoInput({text:'Hello. Thank you!',language:'hi'});
  assert.deepEqual(ids(result),['hello','thanks']);assert.equal(result.output,'नमस्ते · धन्यवाद');
  assert.equal(result.avatar.name,'Aarav');assert.equal(result.responseType,'vocabulary');
  assert.deepEqual(result.coverage,{totalWords:3,supportedWords:3,unsupportedWords:0,supportedPhrases:2,percent:100});
  assert.deepEqual(ids(demoInput({text:'नमस्ते धन्यवाद',language:'en'})),['hello','thanks']);
  assert.deepEqual(ids(demoInput({text:'Hi, thanks. Namaste! Salut.',language:'en'})),['hello','thanks','hello','hello']);
});

test('paragraphs produce an ordered queue, exact positions, and explicit missing coverage',()=>{
  const text='  Hello, please help. I love you! Thank you; tomorrow we travel. No.  ';
  const result=demoInput({text,language:'en'});
  assert.equal(result.input,text);assert.deepEqual(ids(result),['hello','help','love','thanks','no']);
  assert.deepEqual(result.sequence.map(item=>item.sourceText),['Hello','help','I love you','Thank you','No']);
  assert.deepEqual(result.unsupported.map(item=>item.term),['please','tomorrow','we','travel']);
  assert.deepEqual(result.timeline.map(item=>item.type),['supported','unsupported','supported','supported','supported','unsupported','unsupported','unsupported','supported']);
  for(const item of result.timeline)assert.equal(text.slice(item.startChar,item.endChar),item.sourceText);
  assert.equal(result.coverage.totalWords,12);assert.equal(result.coverage.supportedWords,8);assert.equal(result.coverage.unsupportedWords,4);
  assert.equal(result.playback.total,5);assert.equal(result.duration,result.sequence.reduce((sum,item)=>sum+item.duration,0));
  assert.ok(result.sequence.every(item=>item.validated===false));assert.equal(result.signLanguage,'ASL');
  assert.equal(result.validatedSignLanguage,false);assert.equal(result.fingerspelling,false);assert.match(result.notice,/prototype/);assert.match(result.notice,/unvalidated/);
});

test('500 words survive punctuation and keep every supported phrase and missing word',()=>{
  const text=Array.from({length:100},(_,index)=>index%2?'Hello, unknown. Thank you! Help.':'Hello. unknown; Thank you? Help!').join('\n');
  const result=demoInput({text,language:'en'});
  assert.equal(result.input,text);assert.equal(result.coverage.totalWords,500);
  assert.equal(result.sequence.length,300);assert.equal(result.unsupported.length,100);assert.equal(result.coverage.supportedWords,400);
  assert.deepEqual(result.unsupportedTerms,[{term:'unknown',count:100,wordIndices:Array.from({length:100},(_,index)=>index*5+1)}]);
  assert.equal(result.sequence.at(-1).sourceText,'Help');assert.equal(result.sequence.at(-1).order,299);
  assert.equal(result.timeline.at(-1).endWordIndex,500);assert.equal(result.playback.total,300);
});

test('all-unsupported words have no generic motion, and repeated processing is deterministic',()=>{
  const text="Quantum spaceship can't fly. Quantum.";
  const first=demoInput({text,language:'en'}),second=demoInput({text,language:'en'});
  assert.deepEqual(first,second);assert.deepEqual(first.sequence,[]);assert.equal(first.output,'');assert.equal(first.duration,0);
  assert.deepEqual(first.unsupported.map(item=>item.term),['Quantum','spaceship',"can't",'fly','Quantum']);
  assert.deepEqual(first.unsupportedTerms[0],{term:'Quantum',count:2,wordIndices:[0,4]});
  assert.equal(first.coverage.percent,0);assert.equal(first.playback.total,0);
  for(const {id:language} of catalog().languages){
    const localized=demoInput({text:'A message about our day',language,mode:'voice'});
    assert.equal(localized.avatar.name,'Aarav');assert.deepEqual(localized.sequence,[]);assert.equal(localized.unsupported.length,5);
  }
  for(const text of ['constructor','__proto__'])assert.deepEqual(ids(demoInput({text,language:'en'})),[]);
});

test('longest phrases match without manufacturing phrases across punctuation or within words',()=>{
  assert.deepEqual(ids(demoInput({text:'I LOVE YOU, thank you! Hello-world.',language:'en'})),['love','thanks','hello']);
  const split=demoInput({text:'I. love you! Thank, you. helpful helloworld.',language:'en'});
  assert.deepEqual(split.sequence,[]);assert.equal(split.unsupported.length,7);
  assert.deepEqual(ids(demoInput({text:'Je t’aime. நான் உன்னை காதலிக்கிறேன்.',language:'en'})),['love','love']);
});

test('input validation rejects excessive input explicitly without silent truncation',()=>{
  for(const text of ['',null,' !? '])assert.throws(()=>demoInput({text,language:'en'}));
  assert.throws(()=>demoInput({text:'x'.repeat(inputLimits.maxCharacters+1),language:'en'}),/Nothing has been processed or truncated/);
  assert.throws(()=>demoInput({text:'no '.repeat(inputLimits.maxWords+1),language:'en'}),/Nothing has been processed or truncated/);
  assert.equal(demoInput({text:'Hello. '.repeat(inputLimits.maxWords),language:'en'}).sequence.length,inputLimits.maxWords);
  assert.throws(()=>demoInput({text:'Hello',language:'__proto__'}));
  assert.throws(()=>demoInput({text:'Hello',language:'en',mode:'invalid'}));
});

test('camera demonstration requires known poses and never claims validated ASL recognition',()=>{
  const result=demoInput({mode:'camera',gesture:'Thumb_Up',confidence:.9,language:'hi'});
  assert.equal(result.output,'हाँ');assert.equal(result.responseType,'camera-demo');assert.match(result.notice,/not validated ASL/);
  for(const confidence of [.5,NaN,Infinity,1.1,'1'])assert.throws(()=>demoInput({mode:'camera',gesture:'Thumb_Up',confidence,language:'en'}));
  assert.throws(()=>demoInput({mode:'camera',gesture:'Fake_Gesture',confidence:1,language:'en'}));
  assert.equal(catalog().languages.length,6);assert.ok(catalog().languages.every(item=>item.avatar.name==='Aarav'));
  assert.ok(catalog().languages.every(language=>language.phrases.every(phrase=>phrase.validated===false)));
  assert.equal(catalog().capabilities.maxInput,100000);assert.equal(catalog().capabilities.fingerspelling,false);
});

test('validated mode is the default and cannot enable uncertain motion or client validation flags',()=>{
  const input='Hello. Thank you. Yes. No. Help. I love you.';
  const result=processInput({text:input,language:'en',validated:true,humanReview:{approved:true},senses:{no:'negative-answer',love:'affection'}});
  assert.equal(result.vocabularyMode,'validated');assert.deepEqual(result.sequence,[]);assert.equal(result.input,input);
  assert.equal(result.coverage.totalWords,9);assert.equal(result.coverage.supportedPhrases,0);assert.equal(result.coverage.percent,0);
  assert.ok(result.unsupported.some(item=>item.reason==='pending-validation'));assert.equal(result.validatedSignLanguage,false);
  assert.equal(catalog().capabilities.defaultVocabularyMode,'validated');assert.equal(catalog().capabilities.validatedCount,0);
  assert.deepEqual(entriesForMode('validated'),[]);assert.ok(signRegistry.every(entry=>!isValidatedSign(entry)&&entry.humanReview===null));
  assert.equal(processInput({text:'Hello. '.repeat(500),language:'en'}).coverage.totalWords,500);
  assert.deepEqual(processInput({mode:'camera',gesture:'Thumb_Up',confidence:.9,language:'en'}).sequence,[]);
});

test('recorded research motions require explicit opt-in and disclose source and review status',()=>{
  const result=processInput({text:'Help. Yes.',language:'hi',vocabularyMode:'research'});
  assert.deepEqual(ids(result),['3dlex-help','3dlex-yes']);assert.equal(result.output,'मदद · हाँ');
  assert.ok(result.sequence.every(item=>item.motionUrl.endsWith('.motion.json')&&item.source.license==='CC-BY-4.0'&&item.technicalReview.status==='pending'&&item.humanReview===null&&!item.validated));
  assert.equal(result.sequence[0].source.filename,'help.glb');assert.match(result.notice,/research preview/);
  const unavailable=processInput({text:'Hello. Thank you.',language:'en',vocabularyMode:'research'});
  assert.deepEqual(unavailable.sequence,[]);assert.ok(unavailable.unsupported.some(item=>item.reason==='not-in-selected-mode'));
  assert.equal(catalog().capabilities.researchCount,4);assert.equal(catalog().capabilities.demoCount,6);
  assert.equal(catalog().languages.find(item=>item.id==='en').phrases.find(item=>item.id==='3dlex-love').label,'Love (affection)');
});

test('love and no meanings are explicit; affection is not an I-love-you phrase or ILY mapping',()=>{
  const ambiguous=processInput({text:'No. Love. Yes.',language:'en',vocabularyMode:'research'});
  assert.deepEqual(ids(ambiguous),['3dlex-yes']);assert.deepEqual(ambiguous.ambiguousTerms.map(item=>item.meaningKey),['no','love']);
  assert.ok(ambiguous.unsupported.filter(item=>['No','Love'].includes(item.term)).every(item=>item.reason==='ambiguous'));
  const selected=processInput({text:'No. Love.',language:'en',vocabularyMode:'research',senses:{no:'negative-answer',love:'affection'}});
  assert.deepEqual(ids(selected),['3dlex-no','3dlex-love']);assert.deepEqual(selected.sequence.map(item=>item.sourceText),['No','Love']);
  assert.deepEqual(selected.unsupported.map(item=>item.term),[]);assert.deepEqual(selected.ambiguousTerms,[]);
  assert.deepEqual(processInput({text:'love no',language:'en',vocabularyMode:'research',senses:{love:'food-enjoyment',no:'none'}}).sequence,[]);
  assert.deepEqual(processInput({text:'любовь',language:'en',vocabularyMode:'research'}).sequence,[]);
  assert.throws(()=>processInput({text:'Help',language:'en',vocabularyMode:'unrestricted'}),/vocabulary mode/);
  assert.throws(()=>processInput({text:'Help',language:'en',vocabularyMode:'research',senses:[]}),/JSON object/);
});

test('500-word research paragraphs retain order, full coverage, explicit senses and closed validation gate',()=>{
  const text='  '+Array.from({length:100},()=> 'Yes, help; no. love? unknown!').join('\n')+'  ';
  const selected=processInput({text,language:'en',vocabularyMode:'research',senses:{no:'negative-answer',love:'affection'}});
  assert.equal(selected.input,text);assert.equal(selected.coverage.totalWords,500);
  assert.equal(selected.coverage.supportedWords,400);assert.equal(selected.sequence.length,400);assert.equal(selected.unsupported.length,100);
  assert.deepEqual(selected.ambiguousTerms,[]);assert.equal(selected.timeline.at(-1).endWordIndex,500);
  assert.deepEqual(ids(selected),Array.from({length:100},()=>['3dlex-yes','3dlex-help','3dlex-no','3dlex-love']).flat());
  assert.deepEqual(selected.unsupportedTerms,[{term:'unknown',count:100,wordIndices:Array.from({length:100},(_,index)=>index*5+4)}]);
  assert.deepEqual(selected.sequence.map(item=>item.order),Array.from({length:400},(_,index)=>index));
  assert.deepEqual(selected.sequence.map(item=>item.startWordIndex),Array.from({length:100},(_,index)=>[0,1,2,3].map(offset=>index*5+offset)).flat());
  for(const entry of selected.timeline)assert.equal(text.slice(entry.startChar,entry.endChar),entry.sourceText);
  for(const item of selected.sequence){
    assert.equal(item.endWordIndex-item.startWordIndex,1);assert.equal(item.validated,false);assert.equal(item.humanReview,null);assert.equal(item.technicalReview.status,'pending');
    assert.equal(item.source.license,'CC-BY-4.0');assert.equal(item.source.filename,item.id.slice('3dlex-'.length)+'.glb');
  }
  assert.ok(selected.sequence.filter(item=>item.id==='3dlex-love').every(item=>item.label==='Love (affection)'&&item.sourceText==='love'&&item.sense==='affection'));
  assert.ok(selected.sequence.filter(item=>item.id==='3dlex-no').every(item=>item.sense==='negative-answer'));
  assert.equal(selected.signLanguage,'ASL');assert.equal(selected.validatedSignLanguage,false);
  assert.deepEqual(processInput({text,language:'en',vocabularyMode:'research',senses:{no:'negative-answer',love:'affection'}}),selected);

  const unselected=processInput({text,language:'en',vocabularyMode:'research'});
  assert.equal(unselected.input,text);assert.equal(unselected.coverage.totalWords,500);assert.equal(unselected.sequence.length,200);
  assert.equal(unselected.unsupported.length,300);assert.equal(unselected.ambiguousTerms.length,200);
  assert.deepEqual(ids(unselected),Array.from({length:100},()=>['3dlex-yes','3dlex-help']).flat());
  assert.deepEqual(unselected.ambiguousTerms.map(item=>item.wordIndex),Array.from({length:100},(_,index)=>[index*5+2,index*5+3]).flat());
  assert.ok(unselected.unsupported.filter(item=>['no','love'].includes(item.term)).every(item=>item.reason==='ambiguous'));
  for(const entry of unselected.timeline)assert.equal(text.slice(entry.startChar,entry.endChar),entry.sourceText);

  const attemptedApproval=processInput({text,language:'en',senses:{no:'negative-answer',love:'affection'},validated:true,technicalReview:{status:'passed'},humanReview:{approved:true,signLanguage:'ASL',reviewer:'client supplied',date:'2026-10-12'}});
  assert.equal(attemptedApproval.vocabularyMode,'validated');assert.equal(attemptedApproval.input,text);assert.deepEqual(attemptedApproval.sequence,[]);
  assert.equal(attemptedApproval.coverage.totalWords,500);assert.equal(attemptedApproval.unsupported.length,500);assert.equal(attemptedApproval.validatedSignLanguage,false);
});

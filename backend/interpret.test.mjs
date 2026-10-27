import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretText,editDistance} from './interpret.mjs';
import {processInput} from './catalog.mjs';
import {concepts,animations} from '../web/vocabulary.mjs';
const research=(text,extra={})=>processInput({text,language:'en',vocabularyMode:'research',...extra});
const conceptIds=text=>interpretText(text).resolutions.map(r=>r.conceptId).filter(Boolean);
test('clear contextual transpositions preserve original spans and can be undone',()=>{
 const text='  I need hepl!  ',r=research(text);assert.equal(r.input,text);assert.equal(r.interpretedText,'  I need help!  ');assert.equal(r.interpretation.corrections[0].applied,true);assert.deepEqual(r.sequence.map(s=>s.id),['3dlex-help']);assert.equal(r.sequence[0].sourceText,'hepl');assert.equal(text.slice(r.sequence[0].startChar,r.sequence[0].endChar),'hepl');
 const undo=research(text,{correctionDecisions:{2:'keep'}});assert.equal(undo.input,text);assert.equal(undo.interpretedText,text);assert.equal(undo.interpretation.corrections[0].applied,false);assert.deepEqual(undo.sequence,[]);assert.equal(editDistance('hepl','help'),1);
 assert.throws(()=>research(text,{correctionDecisions:{2:'love'}}),/candidate list/);assert.throws(()=>research(text,{correctionDecisions:{99:'help'}}),/source word/);
});
test('unknown valid words, names, digits and negation are never aggressively corrected',()=>{
 for(const text of ['I need kelp','I need heap','My name is hepl.','I met Hepl.','Aarav has 12345678 baobab trees.','I do not want help.'])assert.equal(interpretText(text).interpretedText,text);
 assert(!conceptIds('My name is Right.').some(id=>id.startsWith('asl.right.')));
 const suggestion=interpretText('I need helo');assert.equal(suggestion.interpretedText,'I need helo');assert(suggestion.corrections.every(c=>!c.applied));
 assert.equal(processInput({text:'12345',language:'en'}).fingerspelling,false);
});
test('equivalent English candidate aliases share one concept but require ASL mapping review',()=>{
 const plain=interpretText('I need help'),synonym=interpretText('I need assistance');assert.equal(plain.resolutions.at(-1).conceptId,synonym.resolutions.at(-1).conceptId);assert.equal(synonym.resolutions.at(-1).mappingReviewed,false);assert.equal(research('I need assistance').sequence.length,0);
 const fixture=structuredClone(concepts),help=fixture.find(c=>c.id==='asl.help.assistance');const synthetic={status:'approved',reviewer:'SYNTHETIC TEST FIXTURE ONLY',date:'2000-01-01',signLanguage:'ASL'};help.linguisticReview=synthetic;help.aliases.find(a=>a.text==='assistance').aslMappingReview=synthetic;
 assert.equal(interpretText('I need assistance',{concepts:fixture}).resolutions.at(-1).mappingReviewed,true);assert.equal(concepts.find(c=>c.id===help.id).linguisticReview.status,'pending');
});

test('declared names cannot bypass interpretation through the raw vocabulary matcher',()=>{
 for(const text of ['My name is Help.','I am called Love.','Call me Help.','Dr. Help is here.','My name is No.']){
  const result=research(text,{senses:{love:'affection',no:'negative-answer'}});
  assert.deepEqual(result.sequence,[],text);
  assert.equal(result.input,text);assert.equal(result.interpretedText,text);
  const names=result.interpretation.protectedSpans;
  assert(names.length>0);
  for(const span of names){assert.equal(text.slice(span.startChar,span.endChar),span.sourceText);const missing=result.unsupported.find(w=>w.wordIndex===span.startWordIndex);assert.equal(missing.reason,'protected-name');assert.equal(missing.candidateId,undefined);}
 }
 const separated=research('My name is Help. I need help.');assert.equal(separated.sequence.length,1);assert.equal(separated.sequence[0].startWordIndex,6,'ordinary help in another clause must still play');
 assert.equal(research('Call me for help.').sequence.length,1,'a request to call for help is not a declared name');
 assert.deepEqual(processInput({text:'Hello, Thank you!',language:'en',vocabularyMode:'demo'}).sequence.map(s=>s.id),['hello','thanks'],'capitalized greetings stay available');
 const namedGreeting=processInput({text:'My name is Hello. Hello!',language:'en',vocabularyMode:'demo'});assert.deepEqual(namedGreeting.sequence.map(s=>s.id),['hello']);assert.equal(namedGreeting.sequence[0].startWordIndex,4);
});
test('financial and river bank senses remain distinct; uncertain context asks per occurrence',()=>{
 const uncertain=interpretText('I went to the bank.');assert.equal(uncertain.clarifications.length,1);assert.equal(uncertain.resolutions.at(-1).status,'ambiguous');assert.equal(uncertain.clarifications[0].senses.length,2);
 assert(conceptIds('I deposited money at the bank.').includes('asl.bank.financial'));assert(conceptIds('I sat on the river bank.').includes('asl.bank.river-edge'));
 const clarified=interpretText('I went to the bank.',{senses:{'occurrence:4':'asl.bank.financial'}});assert.equal(clarified.resolutions.at(-1).conceptId,'asl.bank.financial');assert.equal(clarified.clarifications.length,0);
 assert.throws(()=>interpretText('I went to the bank.',{senses:{'occurrence:4':'asl.help.assistance'}}),/not a candidate/);
 assert.equal(research('I deposited money at the bank.').sequence.length,0);
});
test('light/right senses and multiword meanings resolve before single-word matches',()=>{
 assert(conceptIds('Turn on the light.').includes('asl.light.illumination'));assert(conceptIds('This bag is light.').includes('asl.light.low-weight'));
 assert(conceptIds('Turn right.').includes('asl.right.direction'));assert(conceptIds('Your answer is right.').includes('asl.right.correct'));
 const now=interpretText('I need help right now.');assert.equal(now.resolutions.at(-1).conceptId,'asl.time.now');assert.equal(now.resolutions.at(-1).sourceText,'right now');
 assert.equal(interpretText('light right bank').clarifications.length,3);
});
test('negated clauses are held rather than rendered as positive HELP',()=>{
 assert.equal(research('I want help.').sequence.length,1);
 for(const text of ['I do not want help.',"I don't want help.",'I want no help.','No help.','I do nto want help.']){const r=research(text,{senses:{no:'negative-answer'}});assert.equal(r.sequence.length,0);assert.equal(r.interpretation.heldClauses.length,1);assert(r.unsupported.every(w=>w.reason==='negation-template-required'));assert.equal(r.input,text);}
 const mixed=research('I want help. I do not want help.');assert.equal(mixed.sequence.length,1);assert.equal(mixed.sequence[0].startWordIndex,2);assert.equal(mixed.interpretation.heldClauses.length,1);
});
test('unreviewed complete expressions never become a vaguely similar lexical sign',()=>{
 assert.equal(research('I love you.',{senses:{love:'affection'}}).sequence.length,0);assert.equal(research('Love.',{senses:{love:'affection'}}).sequence[0].id,'3dlex-love');
 const demo=processInput({text:'I love you.',language:'en',vocabularyMode:'demo'});assert.equal(demo.sequence[0].id,'love');assert.equal(demo.sequence[0].validated,false);
 const template={id:'TEST ONLY',englishPatterns:['i need help'],animationIds:['TEST ONLY'],review:{status:'approved',reviewer:'SYNTHETIC TEST FIXTURE ONLY',date:'2000-01-01',signLanguage:'ASL'}};
 assert.equal(interpretText('I need help',{templates:[template]}).plans[0].type,'reviewed-template');assert.equal(interpretText('I need help').plans[0].type,'lexical-prototype');
});
test('500 words retain exact original and interpreted punctuation, positions and concept decisions',()=>{
 const text=Array.from({length:100},()=> 'I need hepl. River bank.').join('\n');const r=research(text);assert.equal(r.coverage.totalWords,500);assert.equal(r.input,text);assert.equal(r.interpretation.corrections.filter(c=>c.applied).length,100);assert.equal(r.sequence.length,100);assert.equal(r.unsupported.length,400);assert.equal(r.interpretedText,text.replaceAll('hepl','help'));assert.equal(r.timeline.at(-1).endWordIndex,500);for(const entry of r.timeline)assert.equal(text.slice(entry.startChar,entry.endChar),entry.sourceText);
});
test('new motions are inspection-only and cannot be enabled by spelling/meaning matches or client flags',()=>{
 for(const id of ['3dlex-family','3dlex-water','3dlex-remember','3dlex-please','3dlex-you']){const asset=animations.find(a=>a.id===id);assert(asset.inspectionOnly);assert.equal(research(id.slice(6),{validated:true}).sequence.length,0);const inspection=processInput({mode:'asset-review',animationId:id,language:'en',motionUrl:'/private.glb',humanReview:{approved:true}});assert.equal(inspection.responseType,'asset-review');assert.equal(inspection.sequence[0].motionUrl,asset.motionUrl);assert.equal(inspection.sequence[0].validated,false);assert.match(inspection.notice,/not enabled/);}
 assert.throws(()=>processInput({mode:'asset-review',animationId:'../fake',language:'en'}),/not found/);
});

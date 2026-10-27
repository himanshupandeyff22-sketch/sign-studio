import {studioReadiness} from './readiness.mjs';
import { languages, gestures, normalize, cameraGestures } from '../web/phrases.mjs';
import {interpretText,tokenize} from './interpret.mjs';
import {concepts,animations,vocabularyManifest,conceptById} from '../web/vocabulary.mjs';
import {signRegistry,vocabularyModes,entriesForMode,isValidatedSign} from '../web/sign-registry.mjs';
import {phraseReadiness} from './phrase-readiness.mjs';
import {phraseStarterPack,completeExpressionOptions,findCompleteExpression} from './phrase-starter.mjs';
import {cameraPoses} from '../web/camera-policy.mjs';
import {planSentence} from './sentence-plan.mjs';
import {buildSentenceExamples} from './sentence-examples.mjs';
export { languages, gestures, cameraGestures };
const profiles = {
  en: {name:'Aarav',color:'#c3d1d8',skin:'#d5b7a3',hair:'#48352e'},
  hi: {name:'Aarav',color:'#d5b597',skin:'#bf967c',hair:'#29231f'},
  es: {name:'Aarav',color:'#98b8c1',skin:'#cfa78b',hair:'#543a2e'},
  fr: {name:'Aarav',color:'#b3acc9',skin:'#d9b5a0',hair:'#694333'},
  bn: {name:'Aarav',color:'#c8a5af',skin:'#bd947b',hair:'#25211d'},
  ta: {name:'Aarav',color:'#9db9ac',skin:'#ad826b',hair:'#28241f'}
};
export const inputLimits = Object.freeze({maxCharacters:100000,maxWords:10000});
const notices={
  validated:'Validated vocabulary mode. No current asset has completed technical and human ASL review. Uncertain motions are excluded. Missing terms have no signing or fingerspelling animation.',
  research:'ASL research preview: retargeted 3D-LEX motion, pending technical and human ASL review. Meanings require explicit selection where ambiguous. This vocabulary prototype is not grammatical sign-language translation.',
  demo:'Illustrative demo mode: six legacy procedural motions, all unvalidated. This vocabulary prototype is not grammatical sign-language translation. Missing terms receive no generic talk or fingerspelling fallback.'
};

// Positions refer to the complete, original input: zero-based word indices and
// UTF-16 character offsets, with exclusive ends. A contraction is one word.

// Recorded research entries accept exact English source glosses. Translated
// labels are display text, not automatically approved multilingual mappings.
const phraseEntries = signRegistry.flatMap(entry=>entry.inputMappings.map(text=>({entry,text,words:tokenize(text).map(token=>token.normalized)})))
  .filter(entry=>entry.words.length)
  .sort((a,b)=>b.words.length-a.words.length||b.text.length-a.text.length);
const researchPhraseEntries=signRegistry.filter(e=>e.motionUrl).flatMap(entry=>[...new Set([...(entry.researchInputMappings||[]),...entry.inputMappings])].map(text=>({entry,text,words:tokenize(text).map(t=>t.normalized)}))).sort((a,b)=>b.words.length-a.words.length||b.text.length-a.text.length);

function positions(tokens,start,count){
  return {startWordIndex:start,endWordIndex:start+count,startChar:tokens[start].start,endChar:tokens[start+count-1].end};
}
function matchAt(entries,tokens,index,input){
  return entries.find(entry=>entry.words.every((word,offset)=>{
    const token=tokens[index+offset];
    if(!token||token.normalized!==word)return false;
    // Never combine words across punctuation/sentences to invent a phrase.
    return offset===0||/^\s+$/u.test(input.slice(tokens[index+offset-1].end,token.start));
  }));
}
export const avatarFor = language => ({...profiles[language],id:`aarav-${language}`,model:'/web/assets/aarav.glb'});
function catalogReview(review){
  // Keep frame-level rig diagnostics in the local audit/manifest. Repeating
  // them for every language made a 729-motion catalogue over 21 MB.
  const {diagnostics,...summary}=review;
  return diagnostics?{...summary,evidenceFile:'docs/STUDIO_ASSET_AUDIT.json'}:summary;
}
let checkedSentenceCatalogue;
function sentenceExamples(){
  return checkedSentenceCatalogue??=buildSentenceExamples(text=>processInput({text,language:'en',vocabularyMode:'research',researchPreviewConsent:true,sentenceMode:true}));
}
export function catalog(){
  const counts=Object.fromEntries(vocabularyModes.map(mode=>[mode,entriesForMode(mode).length]));
  return {
    languages:Object.entries(languages).map(([id,config])=>({id,label:config.label,locale:config.locale,avatar:avatarFor(id),phrases:signRegistry.map(entry=>({id:entry.id,label:entry.labels[id],inputText:entry.inputMappings[0],duration:entry.duration,vocabularyMode:entry.vocabularyMode,validated:isValidatedSign(entry),motionUrl:entry.motionUrl,meaning:entry.meaning,meaningKey:entry.meaningKey,requiresSense:entry.requiresSense,senseOptions:entry.senseOptions,source:entry.source,technicalReview:catalogReview(entry.technicalReview),humanReview:entry.humanReview,conceptId:entry.conceptId,category:conceptById(entry.conceptId)?.category||'existing',inspectionOnly:entry.inspectionOnly||false}))})),
    registry:signRegistry.map(entry=>({...entry,technicalReview:catalogReview(entry.technicalReview)})),concepts,templates:vocabularyManifest.templates,sourceCatalog:vocabularyManifest.sourceCatalog||[],phraseStarterPack:phraseStarterPack(),completeExpressions:completeExpressionOptions(),sentenceExamples:sentenceExamples().examples,sentenceExampleAudit:sentenceExamples().audit,
    capabilities:{readiness:studioReadiness(),conceptCount:concepts.length,aliasCount:concepts.reduce((n,c)=>n+c.aliases.length,0),inflectionCount:concepts.reduce((n,c)=>n+c.inflections.length,0),recordedMotionCount:animations.length,inspectionOnlyCount:signRegistry.filter(e=>e.inspectionOnly).length,text:'Ordered vocabulary playback with validation gates, explicit ambiguity and missing coverage',camera:Object.keys(cameraGestures),cameraVocabularyMode:'demo',cameraModelPoseCount:7,cameraIllustrationPoseCount:5,cameraDistinctIllustrations:4,cameraControlCount:2,cameraValidatedSignCount:0,signLanguage:'ASL',validatedSignLanguage:false,responseTypes:['vocabulary','camera-demo','asset-review'],vocabularyModes,defaultVocabularyMode:'validated',vocabularyCounts:counts,validatedCount:counts.validated,researchCount:counts.research,demoCount:counts.demo,maxInput:inputLimits.maxCharacters,maxWords:inputLimits.maxWords,maxSequence:inputLimits.maxWords,fingerspelling:false,notice:notices.validated,notices}
  };
}
export function processInput({text,language,mode='text',gesture,confidence,vocabularyMode='validated',senses={},correctionDecisions={},animationId,animationIds,cameraReview,completePhraseOnly=false,researchPreviewConsent=false,sentenceMode=false}){
  if(!Object.hasOwn(languages,language))throw Object.assign(new Error('Choose a supported language.'),{status:400});
  if(!['text','voice','camera','asset-review'].includes(mode))throw Object.assign(new Error('Invalid input mode.'),{status:400});
  if(!vocabularyModes.includes(vocabularyMode))throw Object.assign(new Error('Choose validated, research, or demo vocabulary mode.'),{status:400});
  if(typeof researchPreviewConsent!=='boolean'||researchPreviewConsent&&(vocabularyMode!=='research'||!['text','voice'].includes(mode)))throw Object.assign(Error('Expanded research playback requires explicit opt-in in Research mode for text or reviewed voice input.'),{status:400});
  if(typeof completePhraseOnly!=='boolean')throw Object.assign(new Error('Complete sentence only must be true or false.'),{status:400});
  if(typeof sentenceMode!=='boolean'||sentenceMode&&(!['text','voice'].includes(mode)||language!=='en'||vocabularyMode==='demo'))throw Object.assign(new Error('Sentence planning supports English text or reviewed voice in validated/research mode only.'),{status:400});
  if(!senses||typeof senses!=='object'||Array.isArray(senses))throw Object.assign(new Error('Meaning selections must be a JSON object.'),{status:400});
  if(mode==='asset-review'){
    if(animationId!==undefined&&animationIds!==undefined)throw Object.assign(Error('Use animationId or animationIds, not both.'),{status:400});
    const ids=animationIds===undefined?[animationId]:animationIds;
    if(!Array.isArray(ids)||ids.length<1||ids.length>100||Array.from(ids).some(id=>typeof id!=='string'||!id.trim()||id.length>80))throw Object.assign(Error('Choose 1 to 100 registered motion IDs for manual inspection.'),{status:400});
    // Resolve the entire request before constructing a queue. Client-supplied
    // paths, review flags and text cannot enable or replace registered motions.
    const entries=ids.map(id=>signRegistry.find(item=>item.id===id&&item.motionUrl&&item.signLanguage==='ASL'));
    if(entries.some(entry=>!entry))throw Object.assign(Error('Registered research asset not found. No inspection queue was created.'),{status:422});
    const sequence=[],timeline=[];let input='',wordOffset=0;
    for(const entry of entries){
      if(sequence.length)input+=' · ';
      const sourceText=entry.gloss,startChar=input.length,wordCount=tokenize(sourceText).length;input+=sourceText;
      const position={startWordIndex:wordOffset,endWordIndex:wordOffset+wordCount,startChar,endChar:input.length};
      const item={...entry,label:entry.labels[language],sourceText,...position,order:sequence.length,vocabularyMode:'research'};
      timeline.push({type:'supported',sequenceIndex:sequence.length,sourceText,...position});sequence.push(item);wordOffset+=wordCount;
    }
    const duration=sequence.reduce((sum,item)=>sum+item.duration,0);
    return {input,language,mode,vocabularyMode:'research',responseType:'asset-review',animationIds:[...ids],avatar:avatarFor(language),sequence,timeline,unsupported:[],unsupportedTerms:[],ambiguousTerms:[],output:sequence.map(item=>item.label).join(' · '),duration,playback:{currentIndex:null,total:sequence.length,duration},coverage:{totalWords:wordOffset,supportedWords:wordOffset,unsupportedWords:0,supportedPhrases:sequence.length,percent:100,kind:'manual-inspection'},signLanguage:'ASL',validatedSignLanguage:false,fingerspelling:false,notice:'Manual asset inspection only. These motions are selected directly, not translated from a sentence. Coverage describes selected assets, not translation accuracy. This candidate is not enabled for text translation and has no fluent-signer approval.'};
  }
  if(animationId!==undefined||animationIds!==undefined)throw Object.assign(Error('Motion IDs are only accepted in manual asset inspection mode.'),{status:400});
  let input=text,responseType='vocabulary';
  if(mode==='camera'){
    if(cameraReview!==undefined&&(!cameraReview||Array.isArray(cameraReview)||!cameraPoses.some(p=>p.id===cameraReview.detectedPose)))throw Object.assign(new Error('Choose a known captured pose for review.'),{status:400});
    if(!Object.hasOwn(cameraGestures,gesture))throw Object.assign(new Error('This camera gesture is not supported.'),{status:422});
    if(typeof confidence!=='number'||!Number.isFinite(confidence)||confidence<.7||confidence>1)throw Object.assign(new Error('Hold the gesture steady for a higher-confidence result.'),{status:422});
    input=gesture.replaceAll('_',' ');responseType='camera-demo';
  }else{
    if(typeof text!=='string'||!text.trim())throw Object.assign(new Error('Enter a phrase to continue.'),{status:400});
    if(text.length>inputLimits.maxCharacters)throw Object.assign(new Error(`Keep input within ${inputLimits.maxCharacters.toLocaleString('en-US')} characters. Nothing has been processed or truncated.`),{status:400});
  }
  if(tokenize(input).length>inputLimits.maxWords)throw Object.assign(new Error('Keep input within 10,000 words. Nothing has been processed or truncated.'),{status:400});
  const interpretation=mode==='camera'?null:interpretText(input,{senses,correctionDecisions,sentenceMode});
  const expression=mode==='camera'?null:findCompleteExpression(input),requireComplete=mode!=='camera'&&(completePhraseOnly||['asl.template.greeting-wellbeing','asl.template.ask-name'].includes(expression?.id));
  const tokens=interpretation?.tokens||tokenize(input);
  if(!tokens.length)throw Object.assign(new Error('Enter at least one word to continue.'),{status:400});
  if(tokens.length>inputLimits.maxWords)throw Object.assign(new Error(`Keep input within ${inputLimits.maxWords.toLocaleString('en-US')} words. Nothing has been processed or truncated.`),{status:400});
  const allowedIds=new Set(entriesForMode(vocabularyMode).map(entry=>entry.id));
  if(researchPreviewConsent)for(const id of studioReadiness().motionIds)allowedIds.add(id);
  const activeEntries=(researchPreviewConsent?researchPhraseEntries:phraseEntries).filter(item=>allowedIds.has(item.entry.id));
  const sequence=[],timeline=[],unsupported=[],ambiguousTerms=[];
  let supportedWords=0;
  const resolutions=new Map((interpretation?.resolutions||[]).flatMap(r=>Array.from({length:r.endWordIndex-r.startWordIndex},(_,n)=>[r.startWordIndex+n,r])));
  const heldWords=new Set((interpretation?.heldClauses||[]).flatMap(c=>c.wordIndices));
  const nameWords=new Set((interpretation?.protectedSpans||[]).filter(span=>span.kind==='name').flatMap(span=>Array.from({length:span.endWordIndex-span.startWordIndex},(_,n)=>span.startWordIndex+n)));
  ambiguousTerms.push(...(interpretation?.clarifications||[]));
  const templatePlans=new Map((interpretation?.plans||[]).filter(p=>p.type==='reviewed-template').map(p=>[p.wordIndices[0],p]));
  for(let index=0;index<tokens.length;){
    const template=templatePlans.get(index);
    if(template){const clips=template.animationIds.map(id=>signRegistry.find(e=>e.id===id&&isValidatedSign(e)));if(clips.length&&clips.every(Boolean)){
      const count=template.wordIndices.length,position=positions(tokens,index,count),sourceText=input.slice(position.startChar,position.endChar),first=sequence.length;
      for(const entry of clips)sequence.push({id:entry.id,conceptId:entry.conceptId,label:entry.labels[language],duration:entry.duration,order:sequence.length,sourceText,...position,validated:true,vocabularyMode:'validated',motionUrl:entry.motionUrl,meaning:entry.meaning,source:entry.source,technicalReview:entry.technicalReview,humanReview:entry.humanReview,templateId:template.templateId});
      timeline.push({type:'supported',sequenceIndex:first,sourceText,...position});supportedWords+=count;index+=count;continue;
    }else{template.status='motion-review-missing';template.wordIndices.forEach(word=>heldWords.add(word));}}
    let match=mode==='camera'?(vocabularyMode==='demo'?{entry:signRegistry.find(item=>item.id===cameraGestures[gesture]),words:tokens}:null):matchAt(activeEntries,tokens,index,input);
    const semantic=resolutions.get(index),held=heldWords.has(index)||requireComplete,named=nameWords.has(index)||Boolean(match?.words.some((_,offset)=>nameWords.has(index+offset)));
    const mismatch=semantic&&(semantic.status==='ambiguous'||match&&match.entry.conceptId!==semantic.conceptId);
    if(held||mismatch||named)match=null;
    const potential=match||(mode==='camera'?null:matchAt(phraseEntries,tokens,index,input));
    const entry=potential?.entry,selectedSense=entry?.meaningKey&&Object.hasOwn(senses,entry.meaningKey)?senses[entry.meaningKey]:null;
    const ambiguous=Boolean(entry?.requiresSense&&!entry.senseOptions.some(option=>option.id===selectedSense));
    if(ambiguous&&!held&&!mismatch&&!named){const token=tokens[index];ambiguousTerms.push({term:token.text,wordIndex:index,startChar:token.start,endChar:token.end,meaningKey:entry.meaningKey,senses:entry.senseOptions,reason:'Select a meaning explicitly; no motion is assigned automatically.'});match=null;}
    if(held||mismatch||named)match=null;
    if(match){
      const count=match.words.length,position=positions(tokens,index,count),sourceText=input.slice(position.startChar,position.endChar);
      const item={id:entry.id,label:entry.labels[language],duration:entry.duration,order:sequence.length,sourceText,...position,conceptId:entry.conceptId,interpretedText:tokens.slice(index,index+count).map(t=>t.normalized).join(' '),validated:isValidatedSign(entry),vocabularyMode,motionUrl:entry.motionUrl,meaning:entry.meaning,sense:selectedSense||entry.senseOptions[0]?.id||null,source:entry.source,technicalReview:entry.technicalReview,humanReview:entry.humanReview};
      timeline.push({type:'supported',sequenceIndex:sequence.length,sourceText,...position});sequence.push(item);supportedWords+=count;index+=count;
    }else{
      const token=tokens[index],reason=named?'protected-name':requireComplete?'complete-phrase-required':held?'negation-template-required':semantic?.status==='ambiguous'?'ambiguous-concept':semantic?.status==='resolved'&&!match&&semantic.aliasKind!=='lemma'?'alias-or-inflection-review-required':entry?.inspectionOnly?'linguistic-review-required':mode==='camera'?'camera-requires-demo':ambiguous?'ambiguous':entry?(vocabularyMode==='validated'?'pending-validation':'not-in-selected-mode'):'missing-coverage';
      const missing={term:token.text,wordIndex:index,startChar:token.start,endChar:token.end,reason,...(entry&&!named?{candidateId:entry.id}:{})};
      unsupported.push(missing);timeline.push({type:'unsupported',term:token.text,sourceText:token.text,reason,...positions(tokens,index,1)});index++;
    }
  }
  let sentencePlan=null;
  if(sentenceMode){
    const planned=planSentence({input,interpretation,sequence,unsupported,registry:signRegistry,allowedIds,language,requireComplete});
    sequence.splice(0,sequence.length,...planned.sequence);unsupported.splice(0,unsupported.length,...planned.unsupported);timeline.splice(0,timeline.length,...planned.timeline);
    supportedWords=sequence.reduce((sum,item)=>sum+item.endWordIndex-item.startWordIndex,0);sentencePlan=planned.plan;
  }
  const terms=new Map();
  for(const item of unsupported){const key=normalize(item.term),term=terms.get(key)||{term:item.term,count:0,wordIndices:[]};term.count++;term.wordIndices.push(item.wordIndex);terms.set(key,term);}
  const duration=sequence.reduce((sum,item)=>sum+item.duration,0);
  const phrases=interpretation?phraseReadiness({input,tokens,interpretation,sequence,unsupported,concepts,animations,templates:vocabularyManifest.templates}):[];
  const completeExpression=requireComplete?{id:expression?.id||null,text:expression?.text||input,available:sequence.length>0&&unsupported.length===0&&sequence.every(c=>c.validated&&c.templateId),sourceStatus:expression?.sourceStatus||'missing',reason:expression?.reason||'A complete reviewed ASL expression is needed. Isolated word clips are held because Complete sentence only is selected.'}:null;
  if(completeExpression&&!completeExpression.available)for(const phrase of phrases){phrase.reason=completeExpression.reason;phrase.status='complete-phrase-required';}
  return {input,language,mode,vocabularyMode,responseType,...(researchPreviewConsent?{researchPreviewConsent:true}:{}),avatar:avatarFor(language),sequence,timeline,unsupported,unsupportedTerms:[...terms.values()],ambiguousTerms,
    ...(requireComplete?{completePhraseOnly:true,completeExpression}:{}),
    ...(sentenceMode?{sentenceMode:true,sentencePlan}:{}),
    ...(mode==='camera'&&cameraReview?{cameraReview:{detectedPose:cameraReview.detectedPose,confirmedPose:gesture,classifierScore:confidence,replayed:cameraReview.replayed===true,source:cameraReview.replayed===true?'saved-user-confirmation-replay':'client-reported-user-confirmed-illustration',notice:'A pose classifier score and user selection do not establish ASL recognition. No camera frame was sent to the server.'}}:{}),
    interpretation,phraseReadiness:phrases,interpretedText:interpretation?.interpretedText||input,output:sequence.map(item=>item.label).join(' · '),duration,signLanguage:'ASL',validatedSignLanguage:false,fingerspelling:false,
    coverage:{totalWords:tokens.length,supportedWords,unsupportedWords:unsupported.length,supportedPhrases:sequence.length,percent:Math.round(supportedWords/tokens.length*100)},
    playback:{currentIndex:null,total:sequence.length,duration},
    notice:mode==='camera'?(vocabularyMode==='demo'?'Camera pose demonstration. Detected hand poses are not validated ASL recognition or translation.':'Camera motions require explicit Demo mode. No pose motion was added to the validated signing queue.'):notices[vocabularyMode]};
}

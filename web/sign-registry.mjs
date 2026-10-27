import {languages,gestures} from './phrases.mjs';
import {animations,conceptById,reviewed,reviewedMapping} from './vocabulary.mjs';

export const vocabularyModes = Object.freeze(['validated','research','demo']);
const authors=['Oline Ranum','Gomèr Otterspeer','Jari I. Andersen','Robert G. Belleman','Floris Roelofsen'];
const recordedSource={
  dataset:'3D-LEX v1.0',authors,year:2024,
  projectUrl:'https://osf.io/mqzyk/',
  archiveUrl:'https://osf.io/download/tcnhs/',
  publicationUrl:'https://aclanthology.org/2024.signlang-1.33/',
  license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
  provenance:'Motion-only extraction from the public ASL animation archive; the source avatar mesh is not redistributed.'
};
const translated=index=>Object.fromEntries(Object.entries(languages).map(([id,item])=>[id,item.phrases[index]]));
const aliases={hello:['hi','namaste','salut'],thanks:['thanks','dhanyavad'],yes:['haan'],no:['nahi'],help:['madad'],love:[]};
const demos=gestures.map((id,index)=>({
  id,conceptId:{hello:'asl.greeting.hello',thanks:'asl.gratitude.thanks',yes:'asl.answer.affirmative',no:'asl.answer.negative',help:'asl.help.assistance',love:'asl.phrase.i-love-you'}[id],gloss:languages.en.phrases[index],labels:translated(index),
  inputMappings:[...new Set(Object.values(languages).map(item=>item.phrases[index]).concat(aliases[id]))],
  vocabularyMode:'demo',signLanguage:'ASL',duration:3.2,motionUrl:null,
  meaning:'Illustrative procedural demonstration only; not an approved ASL sign or sentence mapping.',
  meaningKey:null,senseOptions:[],requiresSense:false,
  source:{dataset:'Sign Studio legacy procedural demos',projectUrl:'https://github.com/harshbg/Sign-Language-Interpreter-using-Deep-Learning',license:'MIT',licenseUrl:'https://opensource.org/license/mit'},
  technicalReview:{status:'demo-only'},humanReview:null,validated:false,
  limitations:['Procedural motion has not been linguistically validated.','Translated interface labels do not establish sign-language accuracy.']
}));
const indices={help:4,yes:2,no:3};
const loveLabels={en:'Love (affection)',hi:'प्रेम / स्नेह',es:'Amor / afecto',fr:'Amour / affection',bn:'ভালোবাসা / স্নেহ',ta:'அன்பு / பாசம்'};
const research=animations.map(asset=>{
 const concept=conceptById(asset.conceptId),word=asset.id.slice(6),p=asset.sources[0],verified=asset.translationEligible&&asset.technicalReview.status==='passed'&&reviewed(asset.linguisticReview)&&reviewed(concept.linguisticReview);
 return {id:asset.id,conceptId:concept.id,gloss:word,labels:word==='love'?loveLabels:indices[word]===undefined?Object.fromEntries(Object.keys(languages).map(id=>[id,concept.label])):translated(indices[word]),inputMappings:concept.aliases.filter((a,index)=>index===0||reviewedMapping(concept,a)).map(a=>a.text),vocabularyMode:'research',signLanguage:'ASL',duration:asset.duration,motionUrl:asset.motionUrl,
 meaning:'Candidate mapping: '+concept.definition,meaningKey:word,senseOptions:[{id:concept.sense,label:({no:'A negative answer / refusal',love:'Affection / love'}[word]||concept.label)}],requiresSense:['no','love'].includes(word),
 source:{dataset:p.dataset,authors:p.authors,projectUrl:p.projectURL,archiveUrl:p.archiveURL,filename:p.archiveFile.split('/').at(-1),license:'CC-BY-4.0',licenseUrl:p.licenseURL,meaningReference:concept.sense==='source-gloss-unverified'?p.projectURL:concept.sources.find(s=>s.meaningReference)?.meaningReference,sourceGLBSHA256:asset.sourceGLBSHA256,runtimeSHA256:asset.sha256,format:'motion-only JSON derived from GLB'},
 technicalReview:asset.technicalReview,humanReview:reviewed(asset.linguisticReview)?{approved:true,signLanguage:'ASL',reviewer:asset.linguisticReview.reviewer,date:asset.linguisticReview.date}:null,validated:Boolean(verified),legacyResearchPreview:asset.legacyResearchPreview,inspectionOnly:!asset.legacyResearchPreview&&!verified,
 researchInputMappings:[word],meaningEvidence:concept.sense==='source-gloss-unverified'?'publisher-gloss-only':'candidate-sense-with-reference',
 limitations:['Filename/reference do not constitute fluent-signer approval.','No complete sentence grammar or facial capture is supplied.']};
});

export const signRegistry=Object.freeze([...research,...demos]);

// A source publication, filename or successful file load is not human approval.
// No client request can override this registry gate.
export function isValidatedSign(entry){
  return entry.validated===true&&entry.technicalReview?.status==='passed'&&entry.humanReview?.approved===true&&entry.humanReview?.signLanguage==='ASL'&&Boolean(entry.humanReview?.reviewer)&&Boolean(entry.humanReview?.date);
}
export function entriesForMode(mode){
  return signRegistry.filter(entry=>mode==='validated'?isValidatedSign(entry):entry.vocabularyMode===mode&&(mode!=='research'||entry.legacyResearchPreview||isValidatedSign(entry)));
}

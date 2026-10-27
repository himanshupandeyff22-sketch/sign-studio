import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,motionIdentity,sourceIdentity} from './motion-identity.mjs';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url))),file=path.join(root,'web/vocabulary-manifest.json');
if(fs.existsSync(file)){console.log('Vocabulary manifest already exists; preserved.');process.exit(0);}
const pending=()=>({status:'pending',reviewer:null,date:null});
const concept=(id,sense,label,definition,aliases,contexts=[],extra={})=>({id,signLanguage:'ASL',sense,label,definition,aliases:aliases.map(text=>({text,kind:text===aliases[0]?'lemma':text.includes(' ')?'phrase':'synonym',semanticStatus:'candidate',aslMappingReview:pending()})),inflections:[],exampleContexts:contexts,animationIds:[],sources:[],technicalStatus:'no-motion',linguisticReview:pending(),...extra});
const concepts=[
concept('asl.help.assistance','assistance','Help','Providing assistance; directional participants are not inferred.',['help','assistance','assist','lend a hand'],['I need help.','I need assistance.'],{inflections:['helps','helped','helping']}),
concept('asl.answer.affirmative','affirmative-answer','Yes','An affirmative answer, not an inferred sentence affirmation.',['yes'],['Yes.']),
concept('asl.answer.negative','negative-answer','No','A negative answer; distinct from absence, NOT, NONE and NOTHING.',['no'],['No.']),
concept('asl.love.affection','affection','Love (affection)','Affection as a lexical concept; not ILY, HUG or the complete sentence I love you.',['love','affection'],['I love my family.'],{inflections:['loves','loved','loving']}),
concept('asl.greeting.hello','greeting','Hello','Greeting; no reviewed motion currently supplied.',['hello','hi'],['Hello.']),
concept('asl.gratitude.thanks','gratitude','Thank you','Expression of gratitude; no reviewed motion currently supplied.',['thank you','thanks'],['Thank you.']),
concept('asl.phrase.i-love-you','complete-expression','I love you','Complete English expression; legacy illustration is not a validated ASL sentence.',['i love you'],['I love you.']),
concept('asl.water.liquid','liquid-water','Water','Water as a liquid, distinct from the verb to water plants.',['water'],['I need water.']),
concept('asl.family.relatives','relatives','Family','A group of relatives; variant and scope require ASL review.',['family'],['My family lives here.'],{inflections:['families']}),
concept('asl.remember.recall','recall','Remember','Recall or retain a memory; distinct from directional REMIND.',['remember','recall'],['I remember your name.'],{inflections:['remembers','remembered','remembering']}),
concept('asl.please.courtesy','courtesy-request','Please','Polite request marker, distinct from the verb meaning satisfy.',['please'],['Please help me.']),
concept('asl.person.second-person','addressee','You','Second-person addressee; signing location/direction and plural distinctions need review.',['you'],['You are here.']),
concept('asl.person.first-person','speaker','I / me','Speaker reference, distinct from the fingerspelled letter I.',['i','me'],['I am here.']),
concept('asl.like.enjoy','enjoy','Like (enjoy)','Enjoy or have a preference for; not resemblance or a filler word.',['like'],['I like apples.'],{inflections:['likes','liked','liking']}),
concept('asl.like.resemblance','resemblance','Like (similar)','Resemblance or comparison; not enjoyment.',['like','similar to'],['It looks like a boat.']),
concept('asl.bank.financial','financial-institution','Bank (financial)','A financial institution; not an edge of a river.',['bank','financial bank'],['I deposited money at the bank.']),
concept('asl.bank.river-edge','river-edge','Riverbank','Land at the edge of a river or stream.',['river bank','riverbank','bank'],['I sat on the river bank.']),
concept('asl.light.illumination','illumination','Light (illumination)','Visible illumination or a lamp; not low weight.',['light','illumination'],['Turn on the light.']),
concept('asl.light.low-weight','low-weight','Light (low weight)','Having little weight; not illumination.',['light','lightweight','low weight'],['This bag is light.']),
concept('asl.right.direction','right-direction','Right (direction)','Rightward direction; not correctness or a legal entitlement.',['right','rightward'],['Turn right.']),
concept('asl.right.correct','correctness','Right (correct)','Correct or true; not a direction.',['right','correct'],['Your answer is right.']),
concept('asl.time.now','current-time','Now','Current time; keeps the phrase right now distinct from rightward/correct.',['right now','now'],['I need help right now.']),
concept('asl.friend.relationship','friendship','Friend','A person with whom one has a friendship; no usable motion currently supplied.',['friend'],['My friend is here.'],{inflections:['friends']})
];
const ids={help:'asl.help.assistance',yes:'asl.answer.affirmative',no:'asl.answer.negative',love:'asl.love.affection'};
const animations=[];
for(const word of Object.keys(ids)){
 const relative=`web/assets/asl/${word}.motion.json`,bytes=fs.readFileSync(path.join(root,relative)),motion=JSON.parse(bytes),entry=concepts.find(item=>item.id===ids[word]);
 const animation={id:motion.id,conceptId:entry.id,sense:entry.sense,signLanguage:'ASL',variantId:'3dlex-v1-source',variantLabel:'3D-LEX source candidate',motionUrl:'/'+relative,duration:motion.duration,sha256:sha256(bytes),motionContentSHA256:motionIdentity(motion),sourceGLBSHA256:motion.provenance.sourceGLBSHA256,sourceIdentity:sourceIdentity(motion.provenance),sources:[motion.provenance],sourceLicenseVerified:true,technicalReview:{status:'pending',checksPassed:['load','finger/palm calibration','upright body','camera framing'],remaining:['skin contact','signing location','ASL handshape/meaning']},linguisticReview:pending(),translationEligible:false,legacyResearchPreview:true};
 animations.push(animation);entry.animationIds.push(animation.id);entry.technicalStatus='automated-checks-pass-review-pending';entry.sources.push({url:motion.provenance.projectURL,license:'CC-BY-4.0',meaningReference:`https://www.lifeprint.com/asl101/pages-signs/${word[0]}/${word}.htm`});
}
const templates=[{id:'asl.template.request-help',englishPatterns:['i need help','i want help'],conceptIds:['asl.help.assistance'],animationIds:[],review:pending(),status:'no-reviewed-complete-phrase',note:'Cannot drop subject, intent or negation and call the result a grammatical ASL sentence.'}];
fs.writeFileSync(file,JSON.stringify({schema:'asl-concept-library/1',signLanguage:'ASL',defaultVocabularyMode:'validated',concepts,animations,templates,importProvenance:[]},null,2)+'\n',{flag:'wx'});
console.log('Seeded canonical concepts and existing immutable animation references; no asset copied or enabled.');

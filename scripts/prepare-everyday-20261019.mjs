import fs from 'node:fs';
// Bounded candidate meanings. No automatic ASL equivalence or reviewer approval.
export const rows=[
 ['introduce','introducing-person','communication','Introduce a person; not a complete self-introduction or a supplied name sign.'],
 ['my','speaker-possessive','communication','First-person possession; not the personal pronoun I or a name.'],
 ['your','addressee-possessive','communication','Possession associated with the addressee; direction and context need review.'],
 ['meet','encounter-person','communication','People meeting; not a group meeting, romantic date or inferred participants.'],
 ['age','age-concept','people','Age as a concept; no age number or numerical incorporation is generated.'],
 ['can','ability','communication','Ability or being able to do something; not a food container or inferred permission.'],
 ['enough','sufficient-quantity','description','Sufficiency or enough of something; not satiation after eating.'],
 ['boss','workplace-supervisor','people','A workplace boss or supervisor; not an inferred identity or named person.'],
 ['counselor','advising-person','people','A person providing counsel; the source must preserve the agent marker, not only the verb advise.'],
 ['chocolate','cocoa-food','food','Chocolate as food; not an automatically composed hot-chocolate expression.'],
 ['pepper','pepper-seasoning','food','Pepper used as seasoning; not a bell pepper or an inferred colour/vegetable compound.'],
 ['toast','toasted-bread','food','Toasted bread as food; not a ceremonial toast or the verb propose a toast.'],
 ['now','current-time','time','Current time; no rightward or correctness sense.'],
 ['first','first-in-order','time','First in an order; source variant and scope need review, not every tournament/ordinal sense.'],
 ['next','next-in-sequence','time','Next in a sequence; not a mechanically concatenated next-week/month/year construction.'],
 ['future','future-time','time','Future time; distance, manner and modality are not inferred.'],
 ['here','nearby-location','travel','Here or this location, without inventing a spatial referent.'],
 ['office','workplace-room','travel','An office as a workplace room; not holding political office.'],
 ['room','enclosed-room','home','A room or enclosed space; not available capacity or a software room.'],
 ['inside','interior-location','travel','An interior location; perspective and spatial referents need review.'],
 ['near','near-distance','travel','Near in spatial distance; not necessarily near in time or a personal relationship.'],
 ['far','far-distance','travel','Far in spatial distance; degree and referents are not inferred.'],
 ['down','downward-direction','travel','A downward direction; not sadness, feather down or a phrasal verb.'],
 ['open','open-object','home','Open an object; source hand configuration/object specificity needs review.'],
 ['give','transfer-to-person','communication','Give or transfer something; directional participants and object are not inferred.'],
 ['take','take-object','communication','Take an object; not every English take idiom or take-a-class construction.'],
 ['use','use-object','communication','Use something; not an inferred English idiom or a complete instruction.'],
 ['enter','movement-into','travel','Enter or move into a place; not a keyboard Enter key or data submission.'],
 ['leave','departure','travel','Depart from a place; not leave behind an object or annual leave.'],
 ['start','begin-action','time','Start or begin; not a vehicle-specific ignition or a complete request.']
];
if(process.argv.includes('--write')){
 const m=JSON.parse(fs.readFileSync('web/vocabulary-manifest.json'));
 const proposals=[],entries=[],selection=[];
 for(const [word,sense,category,definition]of rows){
  const existing=m.concepts.filter(c=>c.aliases.some(a=>a.text===word)||c.inflections.includes(word));
  const matching=existing.find(c=>c.sense===sense);
  if(existing.length&&!matching)throw Error('Existing meaning requires explicit resolution: '+word);
  const conceptId=matching?.id||`asl.${word}.${sense}`;
  if(matching?.animationIds.length)throw Error('Concept already has an imported motion: '+word);
  const reference=`https://www.lifeprint.com/asl101/pages-signs/${word[0]}/${word==='counselor'?'counsel':word}.htm`;
  if(!matching)proposals.push({id:conceptId,signLanguage:'ASL',sense,label:word[0].toUpperCase()+word.slice(1),definition,category,aliases:[word],inflections:[],exampleContexts:[],sourceProject:'https://osf.io/mqzyk/',license:'CC-BY-4.0',meaningReference:reference});
  entries.push({id:'3dlex-'+word,word,conceptId,sense,signLanguage:'ASL',sourcePath:`asset-downloads/everyday-batch-20261019/${word}.glb`,variantId:'3dlex-v1-source',variantLabel:'3D-LEX original capture; candidate sense and linguistic review pending',sourceProject:'https://osf.io/mqzyk/',archiveURL:'https://osf.io/download/tcnhs/',license:'CC-BY-4.0',sourceLanguageVerified:true,meaningReference:reference});
  selection.push({word,conceptId,sense,category,reference,existingCanonicalConcept:Boolean(matching),linguisticValidation:'pending',referenceScope:'Same-ASL lexical comparison only, not approval of the source capture or retarget.'});
 }
 const batch={schema:'asl-motion-batch/1',id:'everyday-asl-20261019',conceptProposals:proposals,entries};
 fs.writeFileSync('imports/everyday-asl-20261019.json',JSON.stringify(batch,null,2)+'\n',{flag:'wx'});
 fs.writeFileSync('docs/EVERYDAY_SELECTION_20261019.json',JSON.stringify({selected:selection,skippedBeforeAcquisition:[{words:['me','need','friend','person','interpreter','bread','milk','lemon','later','ready','buy'],reason:'Existing canonical meanings; previous source inspections found no animation. No duplicate download or new playable-word claim.'},{words:['walk','wait'],reason:'Already imported canonical motions; skipped duplicates.'}],maximumConcepts:30,actualSelected:rows.length},null,2)+'\n',{flag:'wx'});
}

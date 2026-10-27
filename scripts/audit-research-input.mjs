import fs from 'node:fs';
import {sha256} from './motion-identity.mjs';
import {processInput} from '../backend/catalog.mjs';
import {signRegistry} from '../web/sign-registry.mjs';
const ids=new Set(),concepts=new Set(),plainIds=new Set(),excluded=[];
for(const entry of signRegistry.filter(e=>e.motionUrl)){
 const results=[];
 for(const text of new Set([entry.gloss,...entry.inputMappings])){
  const senses=entry.requiresSense?{[entry.meaningKey]:entry.senseOptions[0].id}:{};
  const plain=processInput({text,language:'en',vocabularyMode:'research',researchPreviewConsent:true,senses});results.push(plain);
  for(const clip of plain.sequence)plainIds.add(clip.id);
  try{results.push(processInput({text,language:'en',vocabularyMode:'research',researchPreviewConsent:true,senses:{...senses,'occurrence:0':entry.conceptId}}));}catch{/* A source label is not an arbitrary meaning choice. */}
 }
 for(const result of results)for(const clip of result.sequence){ids.add(clip.id);concepts.add(clip.conceptId);}
 if(!results.some(r=>r.sequence.some(c=>c.id===entry.id)))excluded.push({id:entry.id,gloss:entry.gloss,reasons:[...new Set(results.flatMap(r=>r.unsupported.map(w=>w.reason)))],note:'Inspection available; negation/meaning/variant protections prevent automatic text selection.'});
}
const paths=['web/vocabulary-manifest.json','backend/catalog.mjs','backend/interpret.mjs','web/sign-registry.mjs'];
fs.writeFileSync('docs/EXPANDED_RESEARCH_TEXT_AUDIT.json',JSON.stringify({schema:'research-text-audit/1',checkedAt:new Date().toISOString(),basis:paths.map(path=>({path,sha256:sha256(fs.readFileSync(path))})),conceptIds:[...concepts],motionIds:[...ids],withoutOccurrenceChoice:[...plainIds],excluded,linguisticApproval:false,notice:'Exact source/primary-label isolated-input paths tested with explicit Research consent; ambiguous meanings require user selection. This is not linguistic approval, alias equivalence or sentence translation.'},null,2)+'\n');
console.log(JSON.stringify({textConcepts:concepts.size,textMotions:ids.size,withoutOccurrenceChoice:plainIds.size,excluded:excluded.map(e=>e.gloss)}));

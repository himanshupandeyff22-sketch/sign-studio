import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planBatch,validateLibrary} from '../scripts/import-core.mjs';
import {sha256} from '../scripts/motion-identity.mjs';
import {vocabularyManifest as current} from '../web/vocabulary.mjs';
import {processInput} from './catalog.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
const json=file=>JSON.parse(read(file));
const baseline=json('docs/vocabulary-baseline-before-expansion-20261018.json'),batch=json('imports/asl-expansion-20261018.json');

test('new expansion adds only distinct inspection recordings and preserves every earlier record and file',()=>{
  const plan=planBatch(batch,baseline,read);assert.equal(plan.additions.length,54);
  assert.equal(plan.report.counts.conflicting,0);assert.equal(plan.report.counts.rejected,0);
  const postExpansion=json('docs/vocabulary-baseline-before-everyday-20261019.json');assert.equal(postExpansion.concepts.length,268);assert.equal(postExpansion.animations.length,207);validateLibrary(current);
  for(const c of baseline.concepts)assert.deepEqual(postExpansion.concepts.find(item=>item.id===c.id),c);
  for(const a of baseline.animations){assert.deepEqual(current.animations.find(item=>item.id===a.id),a);assert.equal(sha256(read(a.motionUrl.slice(1))),a.sha256);}
  const beforeIds=new Set(baseline.animations.map(a=>a.id));
  for(const a of current.animations.filter(a=>!beforeIds.has(a.id))){assert.equal(a.inspectionOnly,true);assert.equal(a.translationEligible,false);assert.equal(a.linguisticReview.reviewer,null);assert.equal(a.technicalReview.automatedStatus,'passed');}
  const held=json('docs/expansion-cross-label-audit-20261018.json').rows.filter(row=>row.status!=='candidate');
  for(const row of held)assert(!current.animations.some(a=>a.id===row.id));
  assert.equal(new Set(current.animations.map(a=>a.motionContentSHA256)).size,current.animations.length);
});

test('repeat batch adds no assets, concepts, aliases, provenance or eligibility',()=>{
  const plan=planBatch(batch,current,read,{technicalAudit:()=>{throw Error('An identical asset must not be re-imported');}});
  assert.equal(plan.additions.length,0);assert.equal(plan.report.counts.skipped,54);assert.deepEqual(plan.library,current);
  const committed=json('docs/import-reports/asl-expansion-20261018-repeat-commit.json');assert.deepEqual(committed.before,committed.after);
  for(const text of ['I need a ticket.','I study science.','Please send the email.','Where is the restaurant?']){
    const r=processInput({text,language:'en',vocabularyMode:'research'});assert.equal(r.input,text);assert(r.phraseReadiness.every(p=>!p.completeTranslation));
    assert(!r.sequence.some(item=>batch.entries.some(e=>e.id===item.id)),'inspection candidates cannot become automatic word or phrase translations');
  }
});

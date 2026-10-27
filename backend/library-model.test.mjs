import test from 'node:test';
import assert from 'node:assert/strict';
import {libraryRows,filterLibrary} from '../web/library-model.mjs';
import {catalog,processInput} from './catalog.mjs';
import {vocabularyManifest as current} from '../web/vocabulary.mjs';
import {planBatch} from '../scripts/import-core.mjs';
import fs from 'node:fs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
const json=file=>JSON.parse(read(file));

test('canonical library groups captures, searches aliases, separates senses and exposes real availability',()=>{
  const c=catalog(),rows=libraryRows(c),concepts=rows.filter(r=>!['video','catalogue'].includes(r.type));
  assert.equal(concepts.length,c.concepts.length);assert.equal(concepts.filter(r=>r.type==='avatar').length,c.capabilities.readiness.counts.uniqueMotionConcepts);
  assert.equal(rows.filter(r=>r.type==='catalogue').length,c.capabilities.readiness.counts.catalogueNotImported);
  const bathroom=rows.find(r=>r.id==='asl.bathroom.restroom');assert.equal(bathroom.playable.length,2);
  assert(filterLibrary(rows,{search:'assistance'}).some(r=>r.id==='asl.help.assistance'));
  assert.equal(filterLibrary(rows,{search:'bank'}).filter(r=>r.id.startsWith('asl.bank.')).length,2);
  assert.equal(filterLibrary(rows,{review:'approved'}).length,0);
  assert.equal(filterLibrary(rows,{type:'avatar',review:'inspection'}).length,c.capabilities.readiness.counts.uniqueMotionConcepts-4);
  assert(filterLibrary(rows,{category:'food',type:'avatar',search:'chocolate'}).some(r=>r.label==='Chocolate'));
  assert.equal(filterLibrary(rows,{category:'people',type:'avatar',search:'chocolate'}).length,0);
  assert(!filterLibrary(rows).some(r=>r.type==='catalogue'));
  assert.equal(rows.find(r=>r.label==='Now').textStatus,'Expanded research opt-in');
});

test('everyday batch is idempotent and preserves every existing asset and concept except the explicit now link',{skip:!fs.existsSync(new URL('../asset-downloads/',import.meta.url))?'Optional raw-source import cache is not distributed':false},()=>{
  const before=json('docs/vocabulary-baseline-before-everyday-20261019.json'),batch=json('imports/everyday-asl-20261019.json');
  const plan=planBatch(batch,before,read);assert.equal(plan.additions.length,30);assert.equal(plan.report.conceptChanges.added.length,29);
  for(const a of before.animations)assert.deepEqual(current.animations.find(r=>r.id===a.id),a);
  for(const c of before.concepts){const after=current.concepts.find(r=>r.id===c.id);if(c.id!=='asl.time.now')assert.deepEqual(after,c);else {assert.deepEqual(after.aliases,c.aliases);assert.deepEqual(after.inflections,c.inflections);assert.equal(after.sense,c.sense);assert.equal(after.linguisticReview.status,'pending');assert.deepEqual(after.animationIds,['3dlex-now']);}}
  const repeat=planBatch(batch,current,read,{technicalAudit:()=>{throw Error('Duplicate imported');}});assert.equal(repeat.report.counts.skipped,30);assert.deepEqual(repeat.library,current);
  for(const entry of batch.entries){
    const asset=current.animations.find(a=>a.id===entry.id);assert(asset.inspectionOnly);assert.equal(asset.translationEligible,false);assert.equal(asset.linguisticReview.reviewer,null);
    const result=processInput({text:entry.word,language:'en',vocabularyMode:'research'});assert(!result.sequence.some(r=>r.id===entry.id));
  }
});


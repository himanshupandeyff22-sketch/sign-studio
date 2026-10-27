import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {processInput,catalog} from './catalog.mjs';
import {vocabularyManifest as library} from '../web/vocabulary.mjs';
import {signRegistry} from '../web/sign-registry.mjs';
import {planBatch} from '../scripts/import-core.mjs';
const original=JSON.parse(fs.readFileSync(new URL('../imports/continuous/baseline.json',import.meta.url)));
const request=text=>({text,language:'en',vocabularyMode:'research',researchPreviewConsent:true});

test('expanded text previews require explicit consent and current technical evidence',()=>{
 const plain={text:'chocolate office accomplish',language:'en',vocabularyMode:'research'};
 assert.equal(processInput(plain).sequence.length,0);
 const preview=processInput({...plain,researchPreviewConsent:true});
 assert.equal(preview.sequence.length,3);assert(preview.researchPreviewConsent);assert(preview.sequence.every(s=>!s.validated));
 assert(preview.phraseReadiness.every(p=>!p.completeTranslation));assert.equal(processInput({...plain,vocabularyMode:'validated'}).sequence.length,0);
 assert.throws(()=>processInput({...plain,vocabularyMode:'validated',researchPreviewConsent:true}),/explicit opt-in/);
 assert.throws(()=>processInput({...plain,researchPreviewConsent:'true'}),/explicit opt-in/);
 const current=catalog();assert.equal(current.capabilities.validatedCount,0);assert(current.capabilities.readiness.counts.expandedResearchTextConcepts>700);
});

test('opt-in does not bypass names, numbers, negation, ambiguity or whole-expression gates',()=>{
 for(const text of ['I do not want chocolate.','How are you?','What is your name?'])assert.equal(processInput(request(text)).sequence.length,0,text);
 const named=processInput(request('My name is Alice. 42 quasar.'));
 assert(named.unsupported.some(w=>w.term==='Alice'));assert(named.unsupported.some(w=>w.term==='42'));assert(named.unsupported.some(w=>w.term==='quasar'));
 const bank=processInput(request('bank'));assert.equal(bank.sequence.length,0);assert(bank.ambiguousTerms.length);
 const aliases=processInput(request('assistance'));assert.equal(aliases.sequence.length,0,'Unreviewed synonym must not be silently enabled');
 const long=Array.from({length:100},()=> 'chocolate office accomplish unknown quasar.').join(' '),large=processInput(request(long));
 assert.equal(large.input,long);assert.equal(large.coverage.totalWords,500);assert.equal(large.sequence.length,300);assert.equal(large.unsupported.length,200);
});

test('all earlier manifest records and assets remain intact; new captures stay unapproved',()=>{
 for(const c of original.concepts)assert.deepEqual(library.concepts.find(r=>r.id===c.id),c);
 for(const a of original.animations)assert.deepEqual(library.animations.find(r=>r.id===a.id),a);
 const before=new Set(original.animations.map(a=>a.id)),added=library.animations.filter(a=>!before.has(a.id));assert.equal(added.length,492);
 assert.equal(new Set(library.animations.map(a=>a.motionContentSHA256)).size,library.animations.length);
 for(const a of added){assert(a.inspectionOnly);assert.equal(a.translationEligible,false);assert.equal(a.linguisticReview.reviewer,null);assert.equal(a.technicalReview.automatedStatus,'passed');}
 const state=JSON.parse(fs.readFileSync(new URL('../imports/continuous/state.json',import.meta.url)));assert.equal(state.pending,0);assert.equal(Object.keys(state.rows).length,701);
 assert.equal(Object.values(state.rows).filter(r=>r.status==='static-no-motion').length,203);
 assert.equal(Object.values(state.rows).filter(r=>r.status==='technical-rejected').length,6);
});

test('publisher-only evidence cannot approve or overwrite established senses',()=>{
 const batch={schema:'asl-motion-batch/1',id:'bad-source-evidence',entries:[],sourceEvidenceProposals:[{conceptId:'asl.help.assistance',evidence:'publisher-gloss-only',url:'https://osf.io/mqzyk/'}]};
 assert.throws(()=>planBatch(batch,library,()=>{}),/cannot modify reviewed meanings/);
 const concept=library.concepts.find(c=>c.sense==='source-gloss-unverified');
 const repeat=planBatch({...batch,sourceEvidenceProposals:[{...batch.sourceEvidenceProposals[0],conceptId:concept.id}]},library,()=>{});
 assert.deepEqual(repeat.library,library);assert.equal(repeat.report.metadataChanges.skipped.length,1);
});
test('public catalogue omits repeated rig diagnostics while preserving review gates and provenance',()=>{
 const data=catalog();
 for(const entry of data.registry.filter(e=>e.motionUrl)){
  const original=signRegistry.find(e=>e.id===entry.id);
  assert.equal(entry.technicalReview.status,original.technicalReview.status);
  assert.equal(entry.technicalReview.automatedStatus,original.technicalReview.automatedStatus);
  assert.deepEqual(entry.source,original.source);
  assert.equal(entry.validated,false);
  assert.equal(entry.humanReview,null);
  assert.equal(entry.technicalReview.diagnostics,undefined);
 }
 assert(JSON.stringify(data).length<10_000_000,'Catalogue should not repeat frame-level diagnostics per language');
});

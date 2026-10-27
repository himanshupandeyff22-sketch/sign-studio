import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planBatch,validateLibrary} from '../scripts/import-core.mjs';
import {sha256,motionIdentity} from '../scripts/motion-identity.mjs';
import {validateMotion,MAX_RESEARCH_MOTION_BYTES} from '../web/asl-loader.js';
import {entriesForMode} from '../web/sign-registry.mjs';
import {vocabularyManifest as current} from '../web/vocabulary.mjs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url));
const baseline=JSON.parse(read('docs/vocabulary-baseline-before-presentation-20261016.json'));
const batch=JSON.parse(read('imports/asl-presentation-20261016.json'));
const report=JSON.parse(read('docs/import-reports/asl-presentation-20261016-commit.json'));
const addedIds=new Set(report.rows.filter(r=>r.status==='added').map(r=>r.id));

test('presentation import grows actual recorded motions while preserving previous assets and approvals',()=>{
 const planned=planBatch(batch,baseline,read);
 assert.equal(planned.additions.length,75);
 assert.equal(planned.report.counts.conflicting,13);
 assert.equal(planned.report.counts.rejected,4);
 assert.equal(planned.library.animations.length,153);
 assert.equal(planned.report.after.reviewedEnabledSigns,0);
 // The subsequent bounded batch fills the existing NOW motion gap; its own
 // preservation test checks the exact allowed change against this snapshot.
 const beforeEveryday=JSON.parse(read('docs/vocabulary-baseline-before-everyday-20261019.json'));
 for(const c of baseline.concepts)assert.deepEqual(beforeEveryday.concepts.find(x=>x.id===c.id),c,'Existing concept/sense/alias record preserved by the historical presentation import');
 for(const a of baseline.animations){assert.deepEqual(current.animations.find(x=>x.id===a.id),a,'Existing source, variant and review preserved');assert.equal(sha256(read(a.motionUrl.slice(1))),a.sha256,'Existing runtime bytes preserved');}
 for(const row of report.rows.filter(r=>r.status==='conflicting'||r.status==='rejected'))assert(!current.animations.some(a=>a.id===row.id),'Held payload must not become playable');
});

test('reimport of the exact licensed batch changes no assets, concepts, aliases or provenance',()=>{
 const repeat=planBatch(batch,current,read);
 assert.equal(repeat.additions.length,0);
 assert.equal(repeat.report.counts.added,0);
 assert.equal(repeat.report.counts.merged,0);
 assert.equal(repeat.report.counts.skipped,75);
 assert.equal(repeat.report.conceptChanges.added.length,0);
 assert.deepEqual(repeat.library,current);
 const executed=JSON.parse(read('docs/import-reports/asl-presentation-20261016-repeat-commit.json'));
 assert.equal(executed.dryRun,false);assert.equal(executed.counts.added,0);assert.equal(executed.counts.merged,0);assert.deepEqual(executed.before,executed.after);
});

test('new registrations contain real distinct finger/arm motion with honest ASL review gates',()=>{
 validateLibrary(current);
 const sourceHashes=new Set(),contentHashes=new Set(),paths=new Set();
 for(const a of current.animations){assert(!sourceHashes.has(a.sourceGLBSHA256));sourceHashes.add(a.sourceGLBSHA256);assert(!contentHashes.has(a.motionContentSHA256));contentHashes.add(a.motionContentSHA256);assert(!paths.has(a.motionUrl));paths.add(a.motionUrl);}
 for(const a of current.animations.filter(a=>addedIds.has(a.id))){
  const bytes=read(a.motionUrl.slice(1)),motion=validateMotion(JSON.parse(bytes));
  assert(bytes.length<=MAX_RESEARCH_MOTION_BYTES,'Every installed motion fits the shared importer/loader bound');
  assert.equal(sha256(bytes),a.sha256);assert.equal(motionIdentity(motion),a.motionContentSHA256);
  assert.equal(a.signLanguage,'ASL');assert.equal(a.inspectionOnly,true);assert.equal(a.translationEligible,false);assert.equal(a.legacyResearchPreview,false);
  assert.equal(a.linguisticReview.status,'pending');assert.equal(a.linguisticReview.reviewer,null);
  assert.equal(a.technicalReview.automatedStatus,'passed');assert.equal(a.technicalReview.status,'pending');
  assert(motion.duration>0&&motion.duration<=30);assert(motion.tracks.some(t=>t.path==='rotation'&&t.times.length>1));
  for(const side of ['Left','Right'])for(const f of ['Thumb','Index','Middle','Ring','Pinky'])for(let i=1;i<=3;i++)assert(motion.tracks.some(t=>t.node===side+'Hand'+f+i&&t.path==='rotation'));
  assert.equal(motion.provenance.license,'CC BY 4.0');assert.equal(motion.provenance.sourceGLBSHA256,a.sourceGLBSHA256);
 }
 assert(entriesForMode('validated').every(a=>!addedIds.has(a.id)));
 assert(entriesForMode('research').every(a=>!addedIds.has(a.id)),'Manual inspection cannot silently become text-matched Research output');
});

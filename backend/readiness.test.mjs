import test from 'node:test';
import assert from 'node:assert/strict';
import {studioReadiness} from './readiness.mjs';
import {catalog} from './catalog.mjs';
import {animations} from '../web/vocabulary.mjs';
import {demoExamples} from '../web/demo-guide.mjs';

test('local demo eligibility requires current technical evidence and never grants linguistic approval',()=>{
  const audit=studioReadiness(),current=catalog();
  assert.equal(audit.counts.registeredFiles,animations.length);
  assert.equal(audit.counts.onDiskFiles,animations.length);
  assert.equal(audit.counts.technicallyPlayable,animations.length);
  assert.equal(audit.counts.aaravCompatible,animations.length);
  assert.equal(audit.counts.uniqueRegisteredFiles,animations.length);
  assert.equal(audit.counts.uniqueMotionConcepts,new Set(animations.map(a=>a.conceptId)).size);
  assert.equal(audit.counts.inspectionOnlyAssets,animations.filter(a=>a.inspectionOnly).length);
  assert.equal(audit.counts.catalogueEntries,938);assert.equal(audit.counts.catalogueNotImported,938-animations.length);
  assert.equal(audit.issues.length,0);
  assert.equal(audit.counts.approvedSigns,0);assert.equal(audit.counts.completeAvatarSentences,0);
  assert.equal(demoExamples(current).length,4);
  const unavailable=structuredClone(current);unavailable.capabilities.readiness.motionIds=[];
  assert.deepEqual(demoExamples(unavailable),[],'stale or absent technical eligibility must not advertise a demo example');
});

test('only the browser-observed complete source recording is publicly eligible',()=>{
  const current=catalog(),audit=studioReadiness();
  assert.equal(audit.sourceVideoIds.length,1);assert.equal(audit.counts.sourceVideoReferences,8);
  assert.equal(audit.counts.localSentenceVideos,0);
  const visible=current.completeExpressions.filter(item=>item.available||audit.sourceVideoIds.includes(item.id));
  assert.equal(visible.length,1);assert(visible[0].sourceVideoURL);assert.equal(visible[0].id,'asl.utterance.flores-dev-390');
  assert.equal(visible[0].translationEligible,false);assert.equal(visible[0].review.reviewer,null);
  assert(!visible.some(item=>['asl.template.ask-name','asl.template.greeting-wellbeing'].includes(item.id)));
});

test('presentation counts share current compatible evidence and explain text exclusions',()=>{
 const {counts:c,countDefinitions:d}=studioReadiness();
 assert.equal(c.aaravCompatible,729);assert.equal(c.uniqueMotionConcepts,728);
 assert.equal(c.expandedResearchTextMotions,726);assert.equal(c.expandedResearchTextConcepts,725);
 assert.equal(c.textUnavailableCaptures,3);
 assert.equal(c.expandedResearchTextMotions+c.textUnavailableCaptures,c.aaravCompatible);
 for(const key of ['aaravCompatible','uniqueMotionConcepts','expandedResearchTextMotions','approvedSigns'])assert(d[key].length>30);
 assert.equal(c.approvedSigns,0);
});

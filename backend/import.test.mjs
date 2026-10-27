import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {vocabularyManifest} from '../web/vocabulary.mjs';
import {planBatch,validateLibrary} from '../scripts/import-core.mjs';
import {motionIdentity,sha256} from '../scripts/motion-identity.mjs';
const batch=JSON.parse(fs.readFileSync(new URL('../imports/asl-concepts-20261012.json',import.meta.url)));
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
test('conversation expansion and archive discovery remain repeatable without duplicating concepts or files',()=>{
 const conversation=JSON.parse(read('imports/asl-conversation-20261012.json')),result=planBatch(conversation,vocabularyManifest,read);assert.deepEqual(result.library,vocabularyManifest);assert.equal(result.additions.length,0);assert.equal(result.report.conceptChanges.added.length,0);assert.equal(result.report.discoveryChanges.added,0);assert.equal(result.report.discoveryChanges.skipped,938);assert.equal(new Set(result.library.sourceCatalog.map(s=>s.id)).size,938);assert(result.library.sourceCatalog.every(s=>!s.translationEligible&&!s.conceptId));
 const changed=structuredClone(conversation);changed.sourceCatalogProposals[0].crc32++;changed.conceptProposals[0].definition='CONFLICTING TEST LABEL';const conflicts=planBatch(changed,vocabularyManifest,read);assert.deepEqual(conflicts.library,vocabularyManifest);assert.equal(conflicts.report.conceptChanges.conflicting.length,1);assert.equal(conflicts.report.discoveryChanges.conflicting.length,1);
});
test('same batch adds nothing on its second run and preserves all current registrations',()=>{
 const before=JSON.stringify(vocabularyManifest),again=planBatch(batch,vocabularyManifest,read);assert.equal(again.additions.length,0);assert.equal(again.report.counts.added,0);assert.equal(again.report.counts.merged,0);assert.equal(JSON.stringify(again.library),before);assert.equal(again.report.after.reviewedEnabledSigns,0);
 for(const a of vocabularyManifest.animations)assert.equal(sha256(read(a.motionUrl.slice(1))),a.sha256);
});
test('dry planning first batch is additive, keeps canonical concepts, and leaves approvals empty',()=>{
 const base=structuredClone(vocabularyManifest);base.animations=base.animations.filter(a=>a.legacyResearchPreview);const ids=new Set(base.animations.map(a=>a.id));for(const c of base.concepts){c.animationIds=c.animationIds.filter(id=>ids.has(id));if(!c.animationIds.length){c.sources=[];c.technicalStatus='no-motion';}}
 const original=JSON.stringify(base),first=planBatch(batch,base,read);assert.equal(JSON.stringify(base),original);assert.equal(first.additions.length,5);assert.equal(first.library.concepts.length,base.concepts.length);assert.equal(first.library.animations.length,9);assert.equal(first.report.counts.skipped,1);assert.equal(first.report.counts.conflicting,1);assert.equal(first.report.counts.rejected,2);assert(first.additions.every(a=>a.record.inspectionOnly&&!a.record.translationEligible&&a.record.linguisticReview.status==='pending'));
 assert.equal(planBatch(batch,first.library,read).additions.length,0);
});
test('hash/provenance/concept/language conflicts never replace a registered working entry',()=>{
 const help=batch.entries.find(e=>e.word==='help'),water=batch.entries.find(e=>e.word==='water');const candidates=[{...water,sourcePath:help.sourcePath},{...help,sourcePath:water.sourcePath},{...help,signLanguage:'NGT'},{...help,license:'MIT',sourceProject:'https://github.com/EvilPort2/Sign-Language'},{...help,id:'3dlex-../../escape'}];
 const result=planBatch({schema:'asl-motion-batch/1',id:'TEST ONLY',entries:candidates},vocabularyManifest,read);assert.equal(result.additions.length,0);assert.equal(result.report.counts.added,0);assert.deepEqual(result.library,vocabularyManifest);assert(result.report.rows.every(r=>['conflicting','rejected'].includes(r.status)));
 const relabel=planBatch({schema:'asl-motion-batch/1',id:'TEST ONLY',entries:[{...help,word:'assist'}]},vocabularyManifest,read);assert.equal(relabel.report.counts.conflicting,1);assert.deepEqual(relabel.library,vocabularyManifest);
});
test('motion identity deduplicates labels, whitespace, track order and quaternion signs',()=>{
 const a=vocabularyManifest.animations[0],motion=JSON.parse(read(a.motionUrl.slice(1))),copy=structuredClone(motion);copy.id='3dlex-renamed';copy.gloss='different label';copy.provenance.projectURL='different URL';copy.tracks.reverse();copy.nodes.reverse();for(const t of copy.tracks)if(t.path==='rotation')t.values=t.values.map(v=>-v);assert.equal(motionIdentity(copy),motionIdentity(motion));
 copy.tracks.find(t=>t.path==='translation').values[0]+=.05;assert.notEqual(motionIdentity(copy),motionIdentity(motion));
});
test('equivalent aliases merge only with an existing identified approval record; no duplicate concept',()=>{
 const proposal={conceptId:'asl.help.assistance',sense:'assistance',signLanguage:'ASL',text:'help out',reviewRecordId:'TEST ONLY'},input={schema:'asl-motion-batch/1',id:'TEST ONLY',entries:[],aliasProposals:[proposal]};const pending=planBatch(input,vocabularyManifest,read);assert.equal(pending.report.counts['pending-review'],1);assert.deepEqual(pending.library,vocabularyManifest);
 const fixture=structuredClone(vocabularyManifest);fixture.reviewRecords=[{id:'TEST ONLY',status:'approved',signLanguage:'ASL',conceptId:proposal.conceptId,alias:proposal.text,reviewer:'SYNTHETIC TEST FIXTURE ONLY',date:'2000-01-01'}];const merged=planBatch(input,fixture,read);assert.equal(merged.report.counts.merged,1);assert.equal(merged.library.concepts.length,fixture.concepts.length);assert.equal(merged.library.animations.length,fixture.animations.length);assert.equal(planBatch(input,merged.library,read).report.counts.skipped,1);assert.equal(vocabularyManifest.reviewRecords,undefined);
});
test('duplicate canonical meanings and paths are rejected while distinct senses remain separate',()=>{
 validateLibrary(vocabularyManifest);const duplicate=structuredClone(vocabularyManifest);duplicate.concepts.push({...structuredClone(duplicate.concepts.find(c=>c.id==='asl.help.assistance')),id:'asl.assist.assistance'});assert.throws(()=>validateLibrary(duplicate),/Duplicate/);
 const paths=structuredClone(vocabularyManifest);paths.animations[1].motionUrl=paths.animations[0].motionUrl;assert.throws(()=>validateLibrary(paths),/Duplicate/);assert.equal(vocabularyManifest.concepts.filter(c=>c.aliases.some(a=>a.text==='bank')).length,2);
 const links=structuredClone(vocabularyManifest);links.concepts[0].animationIds.push('3dlex-nonexistent');assert.throws(()=>validateLibrary(links),/conflicting/);
 const variant=structuredClone(vocabularyManifest),copy=structuredClone(variant.animations[0]);copy.id='3dlex-help-other';copy.motionUrl='/web/assets/asl/help-other.motion.json';copy.sourceIdentity+='-other';copy.motionContentSHA256='a'.repeat(64);variant.animations.push(copy);variant.concepts.find(c=>c.id===copy.conceptId).animationIds.push(copy.id);assert.throws(()=>validateLibrary(variant),/Duplicate/);
});

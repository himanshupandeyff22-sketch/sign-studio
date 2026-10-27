import test from 'node:test';
import assert from 'node:assert/strict';
import {processInput} from './catalog.mjs';
const research=text=>processInput({text,language:'en',vocabularyMode:'research'});
test('word matches never appear as complete translated phrases',()=>{
 const result=research('I need help.'),p=result.phraseReadiness[0];assert.equal(p.status,'partial-vocabulary');assert.equal(p.completeTranslation,false);assert.deepEqual(p.previewLabels,['Help']);assert.deepEqual(p.missingTerms.map(w=>w.term),['I','need']);assert.equal(p.templateReview,'pending');assert.equal(p.templateId,'asl.template.request-help');assert.deepEqual(result.sequence.map(c=>c.id),['3dlex-help']);
 const single=research('Help.').phraseReadiness[0];assert.equal(single.status,'unverified-preview');assert.equal(single.completeTranslation,false);assert.deepEqual(single.missingTerms,[]);
 const greeting=processInput({text:'Hi, How are you?',language:'en',vocabularyMode:'demo'}),g=greeting.phraseReadiness[0];assert.equal(g.sourceText,'Hi, How are you?');assert.equal(g.status,'partial-vocabulary');assert.equal(g.completeTranslation,false);assert.deepEqual(g.previewLabels,['Hello']);assert.deepEqual(g.missingTerms.map(w=>w.term),['How','are','you']);assert.deepEqual(g.missingTerms[0].inspectionAssetIds,['3dlex-how']);assert(greeting.interpretation.resolutions.some(r=>r.conceptId==='asl.how.manner-question'));
});
test('inspection-only words, missing vocabulary and negation explain different blockers',()=>{
 const result=research('I want water. Quasar. I do not want help.');assert.deepEqual(result.phraseReadiness.map(p=>p.status),['inspection-only','missing-coverage','held-negation']);assert.deepEqual(result.phraseReadiness[0].missingTerms.filter(w=>w.inspectionAssetIds.length).map(w=>[w.term,w.inspectionAssetIds]),[['want',['3dlex-want']],['water',['3dlex-water']]]);assert(result.phraseReadiness.every(p=>!p.completeTranslation));assert.deepEqual(result.sequence,[]);
});
test('paragraph diagnostics preserve spans and every segment of a 500-word input',()=>{
 const text=Array.from({length:100},()=> 'I need help. Want water.').join('\n'),result=research(text);assert.equal(result.coverage.totalWords,500);assert.equal(result.phraseReadiness.length,200);assert.equal(result.sequence.length,100);for(const p of result.phraseReadiness)assert.equal(text.slice(p.startChar,p.endChar),p.sourceText);assert.equal(result.phraseReadiness.at(-1).endWordIndex,500);
});
test('legacy phrase illustrations and camera/manual inspection cannot claim phrase approval',()=>{
 const demo=processInput({text:'I love you.',language:'en',vocabularyMode:'demo'});assert.equal(demo.phraseReadiness[0].status,'unverified-preview');assert.equal(demo.phraseReadiness[0].completeTranslation,false);assert.equal(demo.sequence[0].id,'love');assert.equal(processInput({mode:'asset-review',animationId:'3dlex-water',language:'en'}).phraseReadiness,undefined);
});

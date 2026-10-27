import test from 'node:test';
import assert from 'node:assert/strict';
import {processInput,catalog} from './catalog.mjs';
import {animations} from '../web/vocabulary.mjs';
const request=(text,extra={})=>processInput({text,language:'en',vocabularyMode:'research',researchPreviewConsent:true,sentenceMode:true,...extra});

test('expanded ideas have stable unique plans, useful categories, and explicit rejected-candidate accounting',()=>{
 const data=catalog(),examples=data.sentenceExamples,audit=data.sentenceExampleAudit;
 assert.equal(audit.candidates,audit.playableExamples+audit.blocked+audit.mergedEquivalentExamples);
 assert.equal(audit.playableExamples,examples.length);assert.equal(audit.linguisticallyApprovedSentences,0);assert(audit.blocked>0);
 assert.equal(new Set(examples.map(e=>e.id)).size,examples.length);
 assert(new Set(examples.map(e=>e.category)).size>=8);
 const signatures=examples.map(e=>{const r=request(e.text);return JSON.stringify({ids:r.sequence.map(c=>c.id),clauses:r.sentencePlan.clauses.map(c=>({question:c.question,count:c.unitIds.length}))});});
 assert.equal(new Set(signatures).size,examples.length,'Equivalent spelling/article variants must not inflate the count');
 assert.deepEqual(catalog().sentenceExamples,examples);
 for(const text of ['I need help.',"I don't need help.",'You want water?','You want qzxunknown.'])assert(!examples.some(e=>e.text===text));
});

test('sentence examples resolve existing real motions without approving grammar or assets',()=>{
 const examples=catalog().sentenceExamples;assert(examples.length>=500);
 assert.deepEqual(examples.slice(0,4).map(e=>e.text),['You want water.','Please drink water.','Your teacher works today.','Where is school?']);
 for(const example of examples){const result=request(example.text);assert.equal(result.sentencePlan.status,'approximate');assert.equal(result.sentencePlan.completeTranslation,false);assert.equal(result.sentencePlan.coverage.missingConcepts,0);assert.deepEqual(result.sequence.map(c=>c.id),example.motionIds);
  for(const clip of result.sequence){assert(animations.some(a=>a.id===clip.id&&a.motionUrl===clip.motionUrl));assert.equal(clip.validated,false);assert.equal(clip.humanReview,null);assert.equal(result.input.slice(clip.startChar,clip.endChar),clip.sourceText);}
 }
});
test('natural source order, punctuation, capitalization and explicit grammar notes are preserved',()=>{
 const result=request('  YOU want WATER! Please drink the water.  ');
 assert.deepEqual(result.sequence.map(c=>c.id),['3dlex-you','3dlex-want','3dlex-water','3dlex-please','3dlex-drink','3dlex-water']);
 assert.equal(result.sentencePlan.coverage.totalConcepts,6);assert.equal(result.sentencePlan.grammarNotes[0].sourceText,'the');assert.equal(result.sentencePlan.clauses.length,2);
 assert.equal(result.input,'  YOU want WATER! Please drink the water.  ');assert.equal(result.interpretedText,result.input);
});
test('missing people, actions, negation and incomplete clauses hold the entire message',()=>{
 const positive=request('I need help.');assert.equal(positive.sequence.length,0);assert.equal(positive.sentencePlan.coverage.availableConcepts,1);assert.equal(positive.sentencePlan.coverage.missingConcepts,2);
 for(const text of ["I don't need help.",'You never want water.',"You haven't wanted water.",'You want water. I need help.','You want medicine qzxunknown.']){const r=request(text);assert.equal(r.sequence.length,0,text);assert.equal(r.sentencePlan.status,'blocked');assert.equal(r.input,text);assert(r.sentencePlan.units.some(u=>u.status==='missing'));}
});
test('question intent is explicit; polar questions cannot turn into statements',()=>{
 const wh=request('Where is school?');assert.deepEqual(wh.sequence.map(c=>c.id),['3dlex-where','3dlex-school']);assert(wh.sentencePlan.clauses[0].question);assert.match(wh.sentencePlan.clauses[0].notes[0],/facial/);assert.equal(wh.sentencePlan.coverage.totalConcepts,2);
 const polar=request('You want water?');assert.equal(polar.sequence.length,0);assert(polar.sentencePlan.units.some(u=>u.kind==='question-marker'&&u.status==='missing'));
 for(const text of ['How are you?','What is your name?'])assert.equal(request(text).sequence.length,0);
});
test('narrow contraction/agreement normalization preserves source; tense/plural/ambiguous forms are held',()=>{
 const contraction=request("You're hungry.");assert.deepEqual(contraction.sequence.map(c=>c.id),['3dlex-you','3dlex-hungry']);assert.equal(contraction.sequence[0].sourceText,"You're");assert(contraction.sentencePlan.grammarNotes.length);
 const works=request('Your teacher works today.');assert.equal(works.sequence[2].id,'3dlex-work');assert.equal(works.sequence[2].sourceText,'works');
 for(const text of ['You walked.','You are walking.','Cats sleep.','You want drinks.'])assert.equal(request(text).sequence.length,0,text);
});
test('multiword meaning wins over shorter signs and unreviewed synonyms do not bypass review',()=>{
 const phrase=request('You want water right now.');const unit=phrase.sentencePlan.units.find(u=>u.sourceText==='right now');assert(unit);assert.equal(unit.status,'missing');assert.equal(phrase.sequence.length,0);assert.equal(phrase.sentencePlan.coverage.totalConcepts,4);
 for(const text of ['You want assistance.','You want a hot dog.','You give up.'])assert.equal(request(text).sequence.length,0,text);
});
test('names/numbers remain explicit, no fingerspelling is invented, ambiguity remains interactive',()=>{
 for(const text of ['Alice drinks water.','My name is Help.','You want 42 computers.','You want qzxunknown.','You want light.']){const r=request(text);assert.equal(r.sequence.length,0,text);assert.equal(r.fingerspelling,false);assert(r.sentencePlan.units.some(u=>u.status==='missing'));}
 assert(request('You want light.').ambiguousTerms.length);
 const uppercase=request('YOU WANT LIGHT.');assert.equal(uppercase.sequence.length,0);assert(uppercase.ambiguousTerms.length,'Capitalization cannot bypass sense selection');
 const capitalized=request('You want Assistance.');assert.equal(capitalized.sequence.length,0,'Capitalization cannot approve a synonym');
});
test('sentence mode obeys approval/consent gates and rejects invalid modes without changing legacy paths',()=>{
 assert.equal(request('You want water.',{researchPreviewConsent:false}).sequence.length,0);
 assert.equal(request('You want water.',{vocabularyMode:'validated',researchPreviewConsent:false}).sequence.length,0);
 assert.throws(()=>request('You want water.',{sentenceMode:'true'}),/Sentence planning/);
 assert.throws(()=>request('You want water.',{language:'hi'}),/Sentence planning/);
 assert.throws(()=>request('You want water.',{vocabularyMode:'demo',researchPreviewConsent:false}),/Sentence planning/);
 const legacy=request('I need help.',{sentenceMode:false});assert.equal(legacy.sequence[0].id,'3dlex-help');assert.equal(legacy.sentencePlan,undefined);
});
test('500-word planning is repeatable, untruncated and positions remain tied to the original',()=>{
 const text=Array.from({length:100},()=> 'You want water. Please wait.').join('\n'),first=request(text),second=request(text);
 assert.equal(first.coverage.totalWords,500);assert.equal(first.input,text);assert.equal(first.sequence.length,500);assert.equal(first.sentencePlan.coverage.totalConcepts,500);assert.equal(first.sentencePlan.clauses.length,200);assert.deepEqual(first,second);
 for(const clip of first.sequence)assert.equal(text.slice(clip.startChar,clip.endChar),clip.sourceText);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {processInput} from '../backend/catalog.mjs';
import {animations} from '../web/vocabulary.mjs';
const fixture=JSON.parse(readFileSync(new URL('./demo-inputs.json',import.meta.url),'utf8'));
for(const row of fixture.cases)test('Submission sample: '+row.id,()=>{
 const result=processInput(row.request);
 assert.equal(result.input,row.request.text);
 assert.equal(result.sentencePlan.status,row.expected.status);
 assert.equal(result.sentencePlan.completeTranslation,false);
 assert.deepEqual(result.sequence.map(c=>c.id),row.expected.motionIds);
 for(const clip of result.sequence){assert.equal(clip.validated,false);const asset=animations.find(a=>a.id===clip.id);assert(asset);assert.equal(asset.motionUrl,clip.motionUrl);assert(readFileSync(new URL('..'+asset.motionUrl,import.meta.url)).length>0);}
});
test('Submission sample: 500-word input preserves all original text and produces 500 eligible clips',()=>{
 const text=readFileSync(new URL('./long-input-500-words.txt',import.meta.url),'utf8').trimEnd();
 assert.equal(text.split(/\s+/).length,500);
 const result=processInput({text,language:'en',vocabularyMode:'research',researchPreviewConsent:true,sentenceMode:true});
 assert.equal(result.input,text);assert.equal(result.sequence.length,500);assert.equal(result.sentencePlan.status,'approximate');assert.equal(result.sentencePlan.completeTranslation,false);
});

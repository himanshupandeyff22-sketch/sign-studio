import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectShownMotions,inspectionSelectionLimit} from '../web/inspection-selection.mjs';
import {catalog,processInput} from './catalog.mjs';
import {completeExpressionOptions,findCompleteExpression} from './phrase-starter.mjs';

test('Select all shown preserves queue order, deduplicates and only removes the shown subset',()=>{
  const first=selectShownMotions(['old','b'],['b','a','b','c'],true);
  assert.deepEqual(first,{ids:['old','b','a','c'],limited:false});
  assert.deepEqual(selectShownMotions(first.ids,['a','c'],false).ids,['old','b']);
  assert.deepEqual(selectShownMotions(first.ids,['b','a','c'],true),first);
  assert.deepEqual(selectShownMotions(first.ids,[],true),first);
});
test('bulk selection is atomic at the existing 100-motion limit',()=>{
  const current=Array.from({length:98},(_,n)=>'motion-'+n);
  assert.equal(inspectionSelectionLimit,100);
  assert.equal(selectShownMotions(current,['new-1','new-2'],true).ids.length,100);
  assert.deepEqual(selectShownMotions(current,['new-1','new-2','new-3'],true),{ids:current,limited:true});
  assert.equal(selectShownMotions(current,current.slice(0,40),false).ids.length,58);
});
test('sentence options preserve source language, separate media types and retain exact provenance',()=>{
  const options=completeExpressionOptions();assert.equal(options.length,44);
  assert.equal(options.filter(o=>o.sourceVideoURL).length,8);assert.equal(new Set(options.map(o=>o.id)).size,44);
  assert(options.every(o=>o.signLanguage==='ASL'&&!o.available&&!o.translationEligible&&o.review.reviewer===null));
  assert.equal(findCompleteExpression('How are u?').id,'asl.template.greeting-wellbeing');
  assert.equal(findCompleteExpression('What’s your name?').id,'asl.template.ask-name');
  assert.equal(findCompleteExpression('How. are you?'),null,'punctuation must not join separate sentences into a greeting');
  for(const o of options.filter(o=>o.sourceVideoURL)){
    assert.equal(o.license,'CC-BY-SA-4.0');assert.match(o.sourceVideoURL,/\/c68240b1fe33d4a9745537a1cff048078376bc9b\/data\/dev\//);
    assert.equal(o.publisherHashVerifiedLocally,false);assert.equal(findCompleteExpression(o.text).id,o.id);
  }
  const repeat=JSON.parse(readFileSync(new URL('../docs/sentence-index-repeat-commit-20261018.json',import.meta.url)));
  assert.equal(repeat.added,0);assert.equal(repeat.skipped,44);assert.equal(repeat.runtimeMotionImports,0);
  assert.equal(catalog().capabilities.validatedCount,0);
});
test('whole-expression requests never fall back to isolated words in any vocabulary mode',()=>{
  for(const vocabularyMode of ['validated','research','demo'])for(const text of ['How are you?','how are u?','What is your name?','What’s your name?','I do not understand','Help. Yes. Love.']){
    const result=processInput({text,language:'en',vocabularyMode,completePhraseOnly:true});
    assert.equal(result.input,text);assert.equal(result.interpretedText,text);assert.equal(result.completePhraseOnly,true);
    assert.equal(result.sequence.length,0);assert.equal(result.completeExpression.available,false);
    assert(result.phraseReadiness.every(p=>!p.completeTranslation));
  }
  assert.equal(processInput({text:'Help',language:'en',vocabularyMode:'research'}).sequence.length,1,'existing word preview stays available');
  assert.equal(processInput({text:'Hello',language:'en',vocabularyMode:'demo'}).sequence.length,1,'existing illustrative greeting remains available');
  assert.throws(()=>processInput({text:'Help',language:'en',completePhraseOnly:'true'}),/true or false/);
});

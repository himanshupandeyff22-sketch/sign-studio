import test from 'node:test';
import assert from 'node:assert/strict';
import {processInput} from './catalog.mjs';
import {createStore} from './store.mjs';
import {signRegistry} from '../web/sign-registry.mjs';
import {vocabularyManifest} from '../web/vocabulary.mjs';
import {tokenize} from './interpret.mjs';

const recorded=()=>signRegistry.filter(entry=>entry.motionUrl&&entry.signLanguage==='ASL');
const inspect=options=>processInput({language:'en',mode:'asset-review',...options});

test('manual inspection supports one legacy ID and an ordered queue without sentence translation',()=>{
  const entries=recorded();assert.ok(entries.length>=2);
  const one=inspect({animationId:entries[0].id});
  const list=inspect({animationIds:[entries[0].id]});
  assert.deepEqual(one,list);
  const ids=[entries.at(-1).id,entries[0].id,entries.at(-1).id];
  const result=inspect({animationIds:ids,text:'An unrelated sentence must not be translated.',language:'hi'});
  assert.deepEqual(result.animationIds,ids);
  assert.deepEqual(result.sequence.map(item=>item.id),ids);
  assert.deepEqual(result.sequence.map(item=>item.order),[0,1,2]);
  assert.equal(result.input,ids.map(id=>entries.find(e=>e.id===id).gloss).join(' · '));
  assert.equal(result.responseType,'asset-review');assert.equal(result.vocabularyMode,'research');
  assert.equal(result.sequence[0].label,entries.at(-1).labels.hi);
  assert.equal(result.phraseReadiness,undefined);assert.equal(result.interpretation,undefined);
  assert.equal(result.validatedSignLanguage,false);assert.equal(result.fingerspelling,false);
  assert.match(result.notice,/not translated from a sentence/);assert.match(result.notice,/not translation accuracy/);
});

test('inspection spans, coverage and duration describe selected registered glosses exactly',()=>{
  const entries=recorded(),ids=[entries[1].id,entries[0].id,...entries.slice(-3).map(e=>e.id)];
  const result=inspect({animationIds:ids});let words=0;
  for(const [index,item] of result.sequence.entries()){
    const original=entries.find(e=>e.id===ids[index]);
    assert.equal(item.startWordIndex,words);words+=tokenize(original.gloss).length;
    assert.equal(item.endWordIndex,words);
    assert.equal(result.input.slice(item.startChar,item.endChar),original.gloss);
    assert.equal(item.duration,original.duration);
    assert.equal(result.timeline[index].sequenceIndex,index);
    assert.equal(result.timeline[index].sourceText,item.sourceText);
    assert.equal(result.timeline[index].startChar,item.startChar);
    assert.equal(result.timeline[index].endChar,item.endChar);
  }
  assert.deepEqual(result.coverage,{totalWords:words,supportedWords:words,unsupportedWords:0,supportedPhrases:ids.length,percent:100,kind:'manual-inspection'});
  assert.equal(result.duration,result.sequence.reduce((sum,item)=>sum+item.duration,0));
  assert.deepEqual(result.playback,{currentIndex:null,total:ids.length,duration:result.duration});
  assert.deepEqual(result.unsupported,[]);assert.deepEqual(result.ambiguousTerms,[]);
});

test('the complete queue is validated before playback and rejects malformed or unregistered IDs',()=>{
  const id=recorded()[0].id;
  for(const animationIds of [[],null,{},id,[null],[''],['  '],[id,undefined],Array(2),Array(101).fill(id),['x'.repeat(81)]]){
    assert.throws(()=>inspect({animationIds}),error=>error.status===400);
  }
  for(const bad of ['../private-motion','hello','__proto__','constructor','3dlex-nonexistent']){
    assert.throws(()=>inspect({animationIds:[id,bad,id]}),error=>error.status===422&&/No inspection queue/.test(error.message));
  }
  assert.throws(()=>inspect({animationId:id,animationIds:[id]}),error=>error.status===400&&/not both/.test(error.message));
  assert.throws(()=>processInput({text:'Help',language:'en',animationIds:[id]}),error=>error.status===400);
  assert.throws(()=>processInput({text:'Help',language:'en',animationId:id}),error=>error.status===400);
  assert.equal(inspect({animationIds:Array(100).fill(id)}).sequence.length,100);
});

test('manual inspection cannot inject assets, approval or mappings or enable translation',()=>{
  const baseline=JSON.stringify(vocabularyManifest),entry=recorded().find(item=>item.inspectionOnly);assert.ok(entry);
  const result=inspect({animationIds:[entry.id],motionUrl:'/private/model.glb',sequence:[{id:'forged',motionUrl:'/forged'}],validated:true,technicalReview:{status:'passed'},humanReview:{approved:true},signLanguage:'ISL',vocabularyMode:'validated'});
  assert.equal(result.sequence[0].motionUrl,entry.motionUrl);
  assert.equal(result.sequence[0].technicalReview,entry.technicalReview);
  assert.equal(result.sequence[0].humanReview,entry.humanReview);
  assert.equal(result.sequence[0].validated,false);assert.equal(result.signLanguage,'ASL');
  for(const vocabularyMode of ['validated','research']){
    const translated=processInput({text:entry.gloss,language:'en',vocabularyMode,validated:true,humanReview:{approved:true}});
    assert.ok(!translated.sequence.some(item=>item.id===entry.id));
  }
  assert.equal(JSON.stringify(vocabularyManifest),baseline);
});

test('saved inspection sequences replay all IDs through the current registry instead of cached paths',()=>{
  const entries=recorded(),store=createStore(':memory:');
  try{
    const {token}=store.createSession(),first=inspect({animationIds:[entries.at(-1).id,entries[0].id,entries[1].id]});
    store.save(token,first);const saved=store.history(token)[0];
    saved.sequence.forEach(item=>{item.motionUrl='/stale-untrusted-path';item.humanReview={approved:true};item.validated=true;});
    const replay=inspect({animationIds:saved.sequence.map(item=>item.id)});
    assert.deepEqual(replay,first);
    assert.ok(replay.sequence.every(item=>item.motionUrl!=='/stale-untrusted-path'&&!item.validated));
  }finally{store.close();}
});

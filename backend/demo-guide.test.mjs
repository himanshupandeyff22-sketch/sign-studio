import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog, processInput} from './catalog.mjs';
import {demoExamples} from '../web/demo-guide.mjs';

test('all first-visit research examples resolve to their intended recording and sense', () => {
  const data=catalog(),before=JSON.stringify(data),examples=demoExamples(data);
  assert.equal(examples.length,4);
  for(const example of examples){
    const result=processInput({text:example.text,language:'en',vocabularyMode:'research',senses:example.senses});
    assert.deepEqual(result.sequence.map(item=>item.id),[example.id],example.label);
    assert.equal(result.coverage.unsupportedWords,0);
    assert.equal(result.validatedSignLanguage,false);
    const gated=processInput({text:example.text,language:'en',vocabularyMode:'validated',senses:example.senses});
    assert.equal(gated.sequence.length,0,'examples must not bypass validated mode');
  }
  assert.equal(JSON.stringify(data),before,'curating examples must not change source data');
});

test('unavailable, wrong-language and inspection-only recordings cannot become guided examples', () => {
  const data=catalog();
  for(const transform of [entry=>({...entry,inspectionOnly:true}),entry=>({...entry,signLanguage:'ISL'}),entry=>({...entry,motionUrl:null}),entry=>({...entry,inputMappings:[]})]){
    assert.deepEqual(demoExamples({...data,registry:data.registry.map(transform)}),[]);
  }
  assert.deepEqual(demoExamples(null),[]);
  assert.deepEqual(demoExamples({...data,registry:[]}),[]);
});

test('guided examples cannot erase the meaning choice required for No and Love', () => {
  const data=catalog();
  for(const id of ['3dlex-no','3dlex-love']){
    const entry=data.registry.find(item=>item.id===id),example=demoExamples(data).find(item=>item.id===id);
    assert.equal(example.senses[entry.meaningKey],entry.senseOptions[0].id);
    const withoutSense={...data,registry:data.registry.map(item=>item.id===id?{...item,senseOptions:[]}:item)};
    assert(!demoExamples(withoutSense).some(item=>item.id===id));
  }
});

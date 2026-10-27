import test from 'node:test';
import assert from 'node:assert/strict';
import {languages,gestures,resolvePhrase,cameraGestures} from './phrases.mjs';
test('every supported phrase resolves in its selected language',()=>{
  for(const [language,config] of Object.entries(languages))config.phrases.forEach((phrase,index)=>assert.equal(resolvePhrase(phrase,language),gestures[index]));
});
test('input normalization handles punctuation, whitespace, and apostrophes',()=>{
  assert.equal(resolvePhrase('  HELLO!  ','en'),'hello');
  assert.equal(resolvePhrase('नमस्ते।','hi'),'hello');
  assert.equal(resolvePhrase("Je t'aime",'fr'),'love');
  assert.equal(resolvePhrase('namaste','hi'),'hello');
  assert.equal(resolvePhrase('Thank   you','en'),'thanks');
});
test('unsupported input never silently produces a gesture',()=>{
  for(const text of ['','   ','Translate this sentence','hello world'])assert.equal(resolvePhrase(text,'en'),null);
  assert.equal(resolvePhrase('Hello','hi'),null);assert.equal(resolvePhrase('Hello','unknown'),null);
  for(const text of ['constructor','__proto__','toString','hasOwnProperty'])assert.equal(resolvePhrase(text,'en'),null);
});
test('camera responses map only to supported animation identifiers',()=>{
  for(const gesture of Object.values(cameraGestures))assert.ok(gestures.includes(gesture));
  assert.equal(cameraGestures.Closed_Fist,undefined);
});

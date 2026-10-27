import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {createStore} from './store.mjs';
test('SQLite preserves preferences and conversations across restarts and isolates sessions',async()=>{
  const folder=path.resolve('test-output');await mkdir(folder,{recursive:true});const file=path.join(folder,'persistence-test.sqlite');
  let store=createStore(file);
  try{
    const {token}=store.createSession(),other=store.createSession().token;
    store.updateSession(token,'hi',.6);store.save(token,{output:'नमस्ते',sequence:[],language:'hi'});
    assert.equal(store.history(other).length,0);store.close();store=createStore(file);
    assert.equal(store.getSession(token).language,'hi');assert.equal(store.getSession(token).speed,.6);assert.equal(store.history(token)[0].output,'नमस्ते');
    assert.equal(store.clear(other),0);assert.equal(store.history(token).length,1);assert.equal(store.clear(token),1);assert.equal(store.history(token).length,0);
  }finally{store.close();for(const suffix of ['','-wal','-shm'])await rm(file+suffix,{force:true});}
});

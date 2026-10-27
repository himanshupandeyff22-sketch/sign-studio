import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,rm} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {createApplication} from '../server.mjs';
test('API supports sessions, preferences, translations, history, export and input protection',async()=>{
  const app=await createApplication({databasePath:':memory:'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${app.server.address().port}`;
  let cookie='';
  const request=async(route,method='GET',body,headers={})=>{const response=await fetch(base+route,{method,headers:{Cookie:cookie,...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},body:body!==undefined?JSON.stringify(body):undefined});return {response,value:await response.json()};};
  try{
    const malformed=await fetch(base+'/%E0%A4%A');assert.equal(malformed.status,400);assert.equal((await malformed.json()).error,'Invalid URL encoding.');
    assert.equal((await request('/api/health')).value.status,'ok');const catalog=(await request('/api/catalog')).value;assert.equal(catalog.languages.length,6);assert.ok(catalog.languages.every(item=>item.avatar.name==='Aarav'));
    assert.equal((await request('/api/history')).response.status,401);
    const start=await request('/api/session','POST');cookie=start.response.headers.get('set-cookie').split(';')[0];assert.match(start.response.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
    assert.equal((await request('/api/session','PATCH',{language:'hi',speed:.6})).value.language,'hi');
    assert.equal((await request('/api/session','PATCH',{language:'zz'})).response.status,400);
    const translation=await request('/api/translations','POST',{text:'Hello. Thank you.',mode:'text',vocabularyMode:'demo'});assert.equal(translation.response.status,201);assert.equal(translation.value.output,'नमस्ते · धन्यवाद');assert.ok(translation.value.id);
    const original='Hey this is how we work in real life.';
    const vocabulary=await request('/api/translations','POST',{text:original});assert.equal(vocabulary.response.status,201);assert.equal(vocabulary.value.responseType,'vocabulary');assert.equal(vocabulary.value.input,original);assert.equal(vocabulary.value.output,'');assert.equal(vocabulary.value.avatar.name,'Aarav');assert.equal(vocabulary.value.validatedSignLanguage,false);assert.deepEqual(vocabulary.value.sequence,[]);assert.equal(vocabulary.value.coverage.unsupportedWords,9);
    assert.equal((await request('/api/translations','POST',{mode:'camera',gesture:'Fake_Gesture',confidence:.88})).response.status,422);
    assert.equal((await request('/api/translations','POST',{mode:'camera',gesture:'Thumb_Up',confidence:.5})).response.status,422);
    assert.equal((await request('/api/translations','POST',{mode:'camera',gesture:'Thumb_Up',confidence:.88,vocabularyMode:'demo'})).response.status,201);
    const history=(await request('/api/history')).value.items;assert.equal(history.length,3);assert.equal(history[1].input,original);assert.equal(history[1].responseType,'vocabulary');assert.deepEqual(history[1].sequence,vocabulary.value.sequence);assert.deepEqual(history[1].unsupported,vocabulary.value.unsupported);
    const exported=await request('/api/history/export');assert.equal(exported.value.items.length,3);assert.match(exported.response.headers.get('content-disposition'),/attachment/);
    assert.equal((await request('/api/session','PATCH',{language:'en'},{Origin:'https://example.com'})).response.status,403);
    assert.equal((await request('/api/translations','POST',{text:'x'.repeat(1048576)})).response.status,413);
    const invalid=await fetch(base+'/api/translations',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:'not-json'});assert.equal(invalid.status,400);
    const wrongType=await fetch(base+'/api/translations',{method:'POST',headers:{Cookie:cookie,'Content-Type':'text/plain'},body:'Hello'});assert.equal(wrongType.status,415);
    const other=await fetch(base+'/api/session',{method:'POST'});const otherCookie=other.headers.get('set-cookie').split(';')[0];assert.equal((await request('/api/history','GET',undefined,{Cookie:otherCookie})).value.items.length,0);
    assert.equal((await request('/api/history','DELETE')).value.deleted,3);assert.equal((await request('/api/history')).value.items.length,0);
    for(const route of ['/server.mjs','/data/sign-studio.sqlite','/web/..%2Fbackend/store.mjs','/node_modules/three/..%2F..%2Fserver.mjs'])assert.equal((await fetch(base+route)).status,404);
    assert.equal((await fetch(base+'/web/assets/aarav.glb',{method:'HEAD'})).headers.get('content-type'),'model/gltf-binary');
  }finally{await app.close();}
});
test('API queues 500-word multi-sentence input, persists all text, and permits repeated submissions',async()=>{
  const app=await createApplication({databasePath:':memory:'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${app.server.address().port}`;
  try{
    const started=await fetch(base+'/api/session',{method:'POST'}),cookie=started.headers.get('set-cookie').split(';')[0];
    const send=async text=>{const response=await fetch(base+'/api/translations',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({text,vocabularyMode:'demo'})});return {status:response.status,value:await response.json()};};
    const text='  '+Array.from({length:100},()=> 'Hello, unknown. Thank you! Help.').join('\n')+'  ';
    const first=await send(text),second=await send(text);assert.equal(first.status,201);assert.equal(second.status,201);
    assert.equal(first.value.input,text);assert.equal(first.value.coverage.totalWords,500);assert.equal(first.value.sequence.length,300);assert.equal(first.value.unsupported.length,100);
    assert.equal(first.value.timeline.at(-1).endWordIndex,500);assert.notEqual(first.value.id,second.value.id);assert.deepEqual(first.value.sequence,second.value.sequence);
    const history=await fetch(base+'/api/history',{headers:{Cookie:cookie}});assert.deepEqual((await history.json()).items.map(item=>item.input),[text,text]);
    const unsupported=await send('Spaceship quantum.');assert.equal(unsupported.status,201);assert.deepEqual(unsupported.value.sequence,[]);assert.equal(unsupported.value.unsupportedTerms.length,2);
    const characters=await send('x'.repeat(100001));assert.equal(characters.status,400);assert.match(characters.value.error,/Nothing has been processed or truncated/);
    const words=await send('no '.repeat(10001));assert.equal(words.status,400);assert.match(words.value.error,/10,000 words/);
    assert.equal((await fetch(base+'/api/history',{headers:{Cookie:cookie}}).then(response=>response.json())).items.length,3);
  }finally{await app.close();}
});
test('API excludes unreviewed motions by default and requires explicit research meanings',async()=>{
  const app=await createApplication({databasePath:':memory:'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${app.server.address().port}`;
  try{
    const start=await fetch(base+'/api/session',{method:'POST'}),cookie=start.headers.get('set-cookie').split(';')[0];
    const send=async body=>{const response=await fetch(base+'/api/translations',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,value:await response.json()};};
    const safe=await send({text:'Hello. Yes. Help. I love you.',validated:true,humanReview:{approved:true}});
    assert.equal(safe.status,201);assert.equal(safe.value.vocabularyMode,'validated');assert.deepEqual(safe.value.sequence,[]);
    const research=await send({text:'Help. Yes. No. Love.',vocabularyMode:'research'});
    assert.equal(research.status,201);assert.deepEqual(research.value.sequence.map(item=>item.id),['3dlex-help','3dlex-yes']);
    assert.deepEqual(research.value.ambiguousTerms.map(item=>item.meaningKey),['no','love']);
    const selected=await send({text:'Love. No.',vocabularyMode:'research',senses:{love:'affection',no:'negative-answer'}});
    assert.deepEqual(selected.value.sequence.map(item=>item.id),['3dlex-love','3dlex-no']);assert.equal(selected.value.sequence[0].source.filename,'love.glb');
    assert.ok(selected.value.sequence.every(item=>!item.validated&&item.humanReview===null));assert.deepEqual(selected.value.unsupported.map(item=>item.term),[]);
    const camera=await send({mode:'camera',gesture:'Thumb_Up',confidence:.9});assert.equal(camera.status,201);assert.deepEqual(camera.value.sequence,[]);
    assert.equal((await send({text:'Help',vocabularyMode:'unsafe'})).status,400);
    const history=await fetch(base+'/api/history',{headers:{Cookie:cookie}});const items=(await history.json()).items;
    assert.deepEqual(items.find(item=>item.id===selected.value.id).sequence,selected.value.sequence);
  }finally{await app.close();}
});
test('an unrecognized session cookie can be replaced and an existing session resumes',async()=>{
  const app=await createApplication({databasePath:':memory:'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${app.server.address().port}`,staleCookie=`sign_session=${'0'.repeat(64)}`;
  try{
    assert.equal((await fetch(base+'/api/history',{headers:{Cookie:staleCookie}})).status,401);
    const replacement=await fetch(base+'/api/session',{method:'POST',headers:{Cookie:staleCookie}});assert.equal(replacement.status,200);
    const cookie=replacement.headers.get('set-cookie').split(';')[0],session=await replacement.json();assert.notEqual(cookie,staleCookie);
    const resumed=await fetch(base+'/api/session',{method:'POST',headers:{Cookie:cookie}});assert.equal(resumed.status,200);assert.equal(resumed.headers.get('set-cookie'),null);assert.deepEqual(await resumed.json(),session);
    const result=await fetch(base+'/api/translations',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({text:'We can work together today.'})});assert.equal(result.status,201);assert.equal((await result.json()).responseType,'vocabulary');
    assert.equal((await fetch(base+'/api/history',{headers:{Cookie:cookie}})).status,200);
  }finally{await app.close();}
});
test('API restores complete vocabulary coverage and preferences after a backend restart',async()=>{
  const folder=path.resolve('test-output');await mkdir(folder,{recursive:true});const databasePath=path.join(folder,`api-persistence-${randomUUID()}.sqlite`);
  let app,cookie,translation,session;
  const original='Hey this is how we work in real life.';
  async function start(){app=await createApplication({databasePath});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));return `http://127.0.0.1:${app.server.address().port}`;}
  try{
    let base=await start();
    const created=await fetch(base+'/api/session',{method:'POST'});cookie=created.headers.get('set-cookie').split(';')[0];
    const preferences=await fetch(base+'/api/session',{method:'PATCH',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({language:'ta',speed:1.5})});session=await preferences.json();
    const response=await fetch(base+'/api/translations',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({text:original,mode:'voice'})});assert.equal(response.status,201);translation=await response.json();
    await app.close();app=null;base=await start();
    const restored=await fetch(base+'/api/session',{headers:{Cookie:cookie}});assert.equal(restored.status,200);assert.deepEqual(await restored.json(),session);
    const history=await fetch(base+'/api/history',{headers:{Cookie:cookie}});assert.equal(history.status,200);assert.deepEqual((await history.json()).items,[translation]);
    assert.equal(translation.input,original);assert.equal(translation.output,'');assert.equal(translation.responseType,'vocabulary');assert.equal(translation.avatar.name,'Aarav');assert.equal(translation.language,'ta');assert.equal(translation.mode,'voice');assert.equal(translation.unsupported.length,9);
  }finally{if(app)await app.close();for(const suffix of ['','-wal','-shm'])await rm(databasePath+suffix,{force:true});}
});

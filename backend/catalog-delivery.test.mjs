import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {animations} from '../web/vocabulary.mjs';
import {gunzipSync} from 'node:zlib';
import {createApplication} from '../server.mjs';

test('cached catalog gzip preserves every record and respects explicit encoding refusal',async()=>{
  const app=await createApplication({databasePath:':memory:'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const port=app.server.address().port;
  const request=encoding=>new Promise((resolve,reject)=>{http.get({hostname:'127.0.0.1',port,path:'/api/catalog',headers:encoding===undefined?{}:{'Accept-Encoding':encoding}},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({headers:res.headers,bytes:Buffer.concat(chunks),status:res.statusCode}));}).on('error',reject);});
  try{
    const plain=await request();assert.equal(plain.status,200);assert(!plain.headers['content-encoding']);
    for(const encoding of ['gzip','br, gzip;q=0.8','*;q=0.5']){
      const zipped=await request(encoding);assert.equal(zipped.headers['content-encoding'],'gzip');assert.equal(zipped.headers.vary,'Accept-Encoding');assert.equal(Number(zipped.headers['content-length']),zipped.bytes.length);assert.deepEqual(gunzipSync(zipped.bytes),plain.bytes);assert(zipped.bytes.length<plain.bytes.length/2);
    }
    for(const encoding of ['gzip;q=0','br','gzip;q=0, *;q=1','gzip;q=invalid']){const rejected=await request(encoding);assert(!rejected.headers['content-encoding']);assert.deepEqual(rejected.bytes,plain.bytes);}
    const repeated=await request('gzip');assert.deepEqual(gunzipSync(repeated.bytes),plain.bytes);
    assert.equal(JSON.parse(plain.bytes).capabilities.recordedMotionCount,animations.length);
  }finally{await app.close();}
});

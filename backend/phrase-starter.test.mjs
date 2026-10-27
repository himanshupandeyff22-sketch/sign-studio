import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {phraseStarterPack} from './phrase-starter.mjs';
import {catalog,processInput} from './catalog.mjs';
import {vocabularyManifest} from '../web/vocabulary.mjs';

const read=path=>readFileSync(new URL(path,import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('five-expression kit reuses canonical concepts and templates without enabling candidates',()=>{
  const pack=phraseStarterPack();
  assert.deepEqual(pack.summary,{target:5,staged:3,missingSource:2,approved:0});
  assert.equal(new Set(pack.items.map(item=>item.id)).size,5);
  const proposals=readdirSync(new URL('../imports/phrase-proposals/',import.meta.url)).filter(name=>name.endsWith('.json')).map(name=>JSON.parse(read('../imports/phrase-proposals/'+name)));
  const ids=[...proposals.map(item=>item.id),...vocabularyManifest.templates.map(item=>item.id)];
  assert.equal(new Set(ids).size,ids.length,'one review record per canonical template');
  for(const item of pack.items){
    assert.equal(item.translationEligible,false);assert.equal(item.linguisticReview.reviewer,null);
    assert(item.conceptIds.every(id=>vocabularyManifest.concepts.some(concept=>concept.id===id)));
    const result=processInput({text:item.text,language:'en',vocabularyMode:'validated'});
    assert.equal(result.sequence.length,0);assert.equal(result.input,item.text);
    assert(result.phraseReadiness.length>0);
    assert(result.phraseReadiness.every(phrase=>phrase.completeTranslation===false));
  }
  assert.equal(catalog().capabilities.validatedCount,0);
  assert.deepEqual(catalog().phraseStarterPack,pack);
  assert.deepEqual(phraseStarterPack(),pack,'repeat kit generation must be stable');
});

test('staged candidates have pinned provenance, intact hashes, distinct numeric payloads and matching meanings',{skip:!existsSync(new URL('../imports/phrase-candidates/epee-v03/clerc_v03_0011.npy',import.meta.url))?'Optional quarantined source payloads are not distributed':false},()=>{
  const pack=phraseStarterPack(),hashes=new Set(),contentHashes=new Set();
  const manifest=JSON.parse(read('../imports/phrase-candidates/epee-v03/manifest.json'));
  assert.equal(manifest.runtimeImports,0);assert.equal(manifest.license,'CC-BY-NC-SA-4.0');
  for(const item of pack.items.filter(item=>item.candidate)){
    const asset=item.candidate,bytes=read('../'+asset.path);
    assert.equal(asset.signLanguage,'ASL');assert.equal(asset.humanReview,null);
    assert.equal(sha(bytes),asset.sha256);assert(!hashes.has(asset.sha256));hashes.add(asset.sha256);
    assert.match(asset.sourceURL,/\/93bc8aa0a6526e86af80db5f59af8d133292c9b5\//);
    assert(!asset.path.includes('..'));assert(asset.path.startsWith('imports/phrase-candidates/'));
    assert.equal(bytes.subarray(1,6).toString(),'NUMPY');
    const major=bytes[6],offset=major===1?10:12,headerLength=major===1?bytes.readUInt16LE(8):bytes.readUInt32LE(8);
    const payloadHash=sha(bytes.subarray(offset+headerLength));
    assert(!contentHashes.has(payloadHash),'header-only changes must not hide duplicate numeric content');contentHashes.add(payloadHash);
    const annotationBytes=read('../'+asset.path.replace(/\.npy$/,'.json')),annotation=JSON.parse(annotationBytes);
    assert.equal(sha(annotationBytes),asset.annotationSHA256);assert.equal(annotation.text_en,item.text);
    assert.equal(annotation.n_frames,asset.frames);
    assert(!vocabularyManifest.animations.some(animation=>animation.sha256===asset.sha256));
  }
  assert.match(pack.items.find(item=>item.text==='How are you?').reviewNotes,/repeated HOW\/YOU/);
});

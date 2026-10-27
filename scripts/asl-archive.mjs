// Private 3D-LEX archive inspection. This does not enable signs, publish assets,
// or copy the included third-party avatar into the website's public directory.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheRoot = path.join(root, 'asset-downloads');
const sourceUrl = 'https://osf.io/download/tcnhs/';
// Reuse the public redirect target within this process only. Do not persist a
// signed download URL. A new invocation always starts at the official source.
let downloadUrl = sourceUrl;
const options = Object.fromEntries(process.argv.slice(2).filter(value => value.startsWith('--')).map(value => {
  const split = value.indexOf('='); return split === -1 ? [value.slice(2), true] : [value.slice(2, split), value.slice(split + 1)];
}));
const output = path.resolve(cacheRoot, String(options.output || 'asl-inspection'));
const inCache = candidate => candidate === cacheRoot || candidate.startsWith(cacheRoot + path.sep);
if (!inCache(output)) throw Error('Inspection output must stay inside asset-downloads.');
fs.mkdirSync(output, {recursive: true});
const sampleFile=options['sample-file']?path.resolve(root,String(options['sample-file'])):null;
if(sampleFile&&(!sampleFile.startsWith(root+path.sep)||!sampleFile.endsWith('.json')))throw Error('Sample list must be a project JSON file.');
const sampleNames=sampleFile?JSON.parse(fs.readFileSync(sampleFile,'utf8')):String(options.sample || 'accomplish,act,add,alone,apple').split(',').filter(Boolean);
if(!Array.isArray(sampleNames)||sampleNames.length>1000||sampleNames.some(w=>typeof w!=='string'||!/^[a-z][a-z0-9-]{0,48}$/.test(w)))throw Error('Invalid bounded sample list.');
const requested = new Set(sampleNames);
const crcTable = Array.from({length: 256}, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});
function crc32(buffer) { let crc = 0xffffffff; for (const byte of buffer) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
function localEntries(buffer) {
  const entries = []; let offset = 0;
  while (offset + 30 <= buffer.length && buffer.readUInt32LE(offset) === 0x04034b50) {
    const flags = buffer.readUInt16LE(offset + 6), method = buffer.readUInt16LE(offset + 8), crc = buffer.readUInt32LE(offset + 14);
    const compressedSize = buffer.readUInt32LE(offset + 18), size = buffer.readUInt32LE(offset + 22);
    const nameLength = buffer.readUInt16LE(offset + 26), extraLength = buffer.readUInt16LE(offset + 28), start = offset + 30 + nameLength + extraLength;
    if (flags & 8) throw Error('Streaming ZIP descriptors require the central directory; the partial prefix cannot safely infer sizes.');
    if (start > buffer.length) break;
    const name = buffer.subarray(offset + 30, offset + 30 + nameLength).toString('utf8');
    const entry = {name, offset, flags, method, crc, compressedSize, size, dataStart: start, complete: start + compressedSize <= buffer.length};
    entries.push(entry); if (!entry.complete) break; offset = start + compressedSize;
  }
  return entries;
}
function decodeEntry(entry, compressed) {
  if (entry.flags & 1) throw Error('Encrypted ZIP entries cannot be inspected.');
  if (entry.size > 8 * 1024 * 1024 || compressed.length > 4 * 1024 * 1024) throw Error('Sample exceeds bounded inspection limits.');
  const decoded = entry.method === 8 ? inflateRawSync(compressed, {maxOutputLength: 8 * 1024 * 1024}) : entry.method === 0 ? compressed : null;
  if (!decoded) throw Error('Unsupported ZIP compression method ' + entry.method);
  if (decoded.length !== entry.size || crc32(decoded) !== entry.crc) throw Error('ZIP sample size or CRC mismatch: ' + entry.name);
  return decoded;
}
function parseGlb(binary) {
  if (binary.length < 28 || binary.readUInt32LE(0) !== 0x46546c67 || binary.readUInt32LE(4) !== 2 || binary.readUInt32LE(8) !== binary.length) throw Error('Invalid binary glTF sample.');
  const jsonLength = binary.readUInt32LE(12);
  if (binary.readUInt32LE(16) !== 0x4e4f534a || 20 + jsonLength > binary.length) throw Error('Invalid glTF JSON chunk.');
  const gltf = JSON.parse(binary.subarray(20, 20 + jsonLength));
  const binaryOffset = 28 + jsonLength;
  function accessor(index) {
    const a = gltf.accessors[index], view = gltf.bufferViews[a.bufferView];
    if (!a || !view || a.sparse || view.byteStride) throw Error('Unsupported sample accessor layout.');
    const types = {5121: [1, 'readUInt8'], 5123: [2, 'readUInt16LE'], 5125: [4, 'readUInt32LE'], 5126: [4, 'readFloatLE']};
    const [bytes, method] = types[a.componentType] || [], width = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16}[a.type];
    if (!bytes || !width) throw Error('Unsupported accessor component type.');
    const start = binaryOffset + (view.byteOffset || 0) + (a.byteOffset || 0), count = a.count * width;
    if (start + count * bytes > binary.length) throw Error('Accessor exceeds GLB bounds.');
    return Array.from({length: count}, (_, i) => binary[method](start + i * bytes));
  }
  return {gltf, accessor};
}
function summarize(binary, entry) {
  const {gltf, accessor} = parseGlb(binary);
  const jointIndices = [...new Set((gltf.skins || []).flatMap(skin => skin.joints))];
  const jointNames = jointIndices.map(index => gltf.nodes[index].name);
  const clips = (gltf.animations || []).map(animation => {
    let invalidValues = 0, invalidQuaternionKeys = 0, maxTranslationMagnitude = 0, maxFingerTranslationMagnitude = 0;
    const channels = animation.channels.map(channel => {
      const sampler = animation.samplers[channel.sampler], times = accessor(sampler.input), values = accessor(sampler.output), node = gltf.nodes[channel.target.node];
      invalidValues += times.filter(value => !Number.isFinite(value)).length + values.filter(value => !Number.isFinite(value)).length;
      let maxTranslation = 0;
      if (channel.target.path === 'rotation') for (let i = 0; i < values.length; i += 4) if (Math.abs(Math.hypot(...values.slice(i, i + 4)) - 1) > .01) invalidQuaternionKeys++;
      if (channel.target.path === 'translation') for (let i = 0; i < values.length; i += 3) maxTranslation = Math.max(maxTranslation, Math.hypot(...values.slice(i, i + 3)));
      maxTranslationMagnitude = Math.max(maxTranslationMagnitude, maxTranslation);
      if (/Hand/.test(node.name)) maxFingerTranslationMagnitude = Math.max(maxFingerTranslationMagnitude, maxTranslation);
      return {node: node.name, path: channel.target.path, interpolation: sampler.interpolation || 'LINEAR', keyframes: times.length, start: times[0], end: times.at(-1), maxTranslation};
    });
    return {name: animation.name, duration: Math.max(0, ...channels.map(channel => channel.end)), channels, invalidValues, invalidQuaternionKeys, maxTranslationMagnitude, maxFingerTranslationMagnitude};
  });
  const anomalousFingerEnds = gltf.nodes.filter(node => /Hand.*4$/.test(node.name) && Math.hypot(...(node.translation || [0, 0, 0])) > .1).map(node => ({name: node.name, translation: node.translation}));
  return {file: entry.name, size: binary.length, sha256: createHash('sha256').update(binary).digest('hex'), generator: gltf.asset?.generator, extras: gltf.asset?.extras || null,
    nodes: gltf.nodes.length, joints: jointNames.length, jointNames, clips,
    meshNames: (gltf.meshes || []).map(mesh => mesh.name), materialNames: (gltf.materials || []).map(material => material.name),
    facialMorphTargets: (gltf.meshes || []).flatMap(mesh => mesh.extras?.targetNames || []), anomalousFingerEnds,
    roots: gltf.scenes[gltf.scene || 0].nodes.map(index => ({name: gltf.nodes[index].name, rotation: gltf.nodes[index].rotation, scale: gltf.nodes[index].scale})),
    licenseNoticeEmbedded: JSON.stringify(gltf.asset || {}).match(/license|copyright|CC.BY/i)?.[0] || null};
}
function saveSample(entry, compressed) {
  const binary = decodeEntry(entry, compressed), name = path.basename(entry.name);
  if (!/^[\w .()-]+\.glb$/i.test(name)) throw Error('Unsafe sample filename.');
  const target=path.join(output,name),summary=summarize(binary,entry);
  if(fs.existsSync(target)){if(!fs.readFileSync(target).equals(binary))throw Error('Cached source conflict; existing file preserved: '+name);}else fs.writeFileSync(target,binary,{flag:'wx'});
  const report=target+'.inspection.json';if(fs.existsSync(report)){if(JSON.parse(fs.readFileSync(report)).sha256!==summary.sha256)throw Error('Cached inspection conflict; existing report preserved: '+name);}else fs.writeFileSync(report,JSON.stringify(summary,null,2),{flag:'wx'});
  return summary;
}
async function rangeOnce(start, end) {
  const requestedLength = end - start + 1;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || requestedLength < 1 || requestedLength > 4 * 1024 * 1024) throw Error('Invalid or oversized byte range.');
  const response = await fetch(downloadUrl, {headers: {Range: `bytes=${start}-${end}`}, signal: AbortSignal.timeout(30000)});
  if ([400,401,403,404].includes(response.status) && downloadUrl !== sourceUrl) {
    await response.body?.cancel(); downloadUrl = sourceUrl;
    return rangeOnce(start,end);
  }
  if (response.status !== 206) { await response.body?.cancel(); const error=Error('Archive server did not honor the bounded range request (HTTP ' + response.status + ').');error.transient=response.status>=500;throw error; }
  const contentRange = response.headers.get('content-range'), match = contentRange?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
  if (!match || Number(match[1]) !== start || Number(match[2]) !== end) { await response.body?.cancel(); throw Error('Unexpected Content-Range response.'); }
  downloadUrl = response.url;
  const chunks = []; let received = 0;
  for await (const chunk of response.body) { received += chunk.byteLength; if (received > requestedLength) throw Error('Range response exceeded its declared bound.'); chunks.push(Buffer.from(chunk)); }
  if (received !== requestedLength) throw Error('Archive range ended early.');
  return {buffer: Buffer.concat(chunks), total: Number(match[3])};
}
async function range(start,end){for(let attempt=0;attempt<3;attempt++){try{return await rangeOnce(start,end);}catch(error){const transient=error.transient||['TimeoutError','AbortError'].includes(error.name)||['ECONNRESET','ETIMEDOUT','UND_ERR_SOCKET'].includes(error.cause?.code)||['terminated','fetch failed'].includes(error.message);if(!transient||attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));}}}
async function remoteDirectory() {
  const expectedLength = Number(options.length || 392740736), tailStart = expectedLength - 65557;
  const tail = await range(tailStart, expectedLength - 1);
  let end = tail.buffer.length - 22;
  while (end >= 0 && tail.buffer.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw Error('ZIP end-of-directory record missing.');
  const count = tail.buffer.readUInt16LE(end + 10), size = tail.buffer.readUInt32LE(end + 12), offset = tail.buffer.readUInt32LE(end + 16);
  if (size > 512 * 1024 || offset + size > expectedLength || count === 0xffff) throw Error('Archive central directory exceeds bounded ZIP32 support.');
  const directory = offset >= tailStart && offset + size <= expectedLength ? tail.buffer.subarray(offset - tailStart, offset - tailStart + size) : (await range(offset, offset + size - 1)).buffer;
  const entries = []; let position = 0;
  while (position + 46 <= directory.length && directory.readUInt32LE(position) === 0x02014b50) {
    const nameLength = directory.readUInt16LE(position + 28), extraLength = directory.readUInt16LE(position + 30), commentLength = directory.readUInt16LE(position + 32);
    entries.push({name: directory.subarray(position + 46, position + 46 + nameLength).toString('utf8'), flags: directory.readUInt16LE(position + 8), method: directory.readUInt16LE(position + 10), crc: directory.readUInt32LE(position + 16), compressedSize: directory.readUInt32LE(position + 20), size: directory.readUInt32LE(position + 24), offset: directory.readUInt32LE(position + 42), complete: true});
    position += 46 + nameLength + extraLength + commentLength;
  }
  if (entries.length !== count || position !== size) throw Error('Central directory entry count or length mismatch.');
  fs.writeFileSync(path.join(output, 'central-directory.bin'), directory);
  return {entries, archiveLength: tail.total, directoryOffset: offset, directorySize: size};
}

const prefixPath = path.resolve(cacheRoot, String(options.input || 'ASL_ANIM_GLB.zip'));
if (!inCache(prefixPath)) throw Error('Archive input must stay inside asset-downloads.');
const prefix = fs.existsSync(prefixPath) ? fs.readFileSync(prefixPath) : null;
const entries = prefix ? localEntries(prefix) : [];
const metadata = {source: sourceUrl, project: 'https://osf.io/mqzyk/', datasetLicense: 'CC BY 4.0 (verified separately from OSF metadata; no included-avatar license assumed)',
  inspectedAt: new Date().toISOString(), defaultVocabularyEnabled: false, cacheOnly: true, prefixBytes: prefix?.length || 0, prefixEntries: entries.length,
  completePrefixEntries: entries.filter(entry => entry.complete).length, archiveComplete: false, entries, samples: []};
if (options.remote) Object.assign(metadata, await remoteDirectory());
const cachedPrefixEntries=prefix?localEntries(prefix):[];
const candidates=metadata.entries.filter(entry=>requested.has(path.basename(entry.name,'.glb'))&&entry.complete);
async function acquire(entry){
  const cached=path.join(output,path.basename(entry.name));
  if(fs.existsSync(cached)){const binary=fs.readFileSync(cached);if(binary.length!==entry.size||crc32(binary)!==entry.crc)throw Error('Cached source differs from the archive; preserved: '+entry.name);const summary=summarize(binary,entry),report=cached+'.inspection.json';if(fs.existsSync(report)){if(JSON.parse(fs.readFileSync(report)).sha256!==summary.sha256)throw Error('Cached inspection hash conflict.');}else fs.writeFileSync(report,JSON.stringify(summary,null,2),{flag:'wx'});return summary;}
  const prefixEntry=cachedPrefixEntries.find(p=>p.name===entry.name&&p.complete&&p.crc===entry.crc&&p.size===entry.size);
  let compressed;
  if(prefixEntry)compressed=prefix.subarray(prefixEntry.dataStart,prefixEntry.dataStart+prefixEntry.compressedSize);
  else {
    // One bounded range covers the local header, its maximum ZIP extra field,
    // and compressed payload. Avoid an extra round trip for every small file;
    // still parse the real local header and verify decoded CRC/size below.
    const maxEnvelope=30+Buffer.byteLength(entry.name)+65535+entry.compressedSize;
    if(maxEnvelope<=4*1024*1024 && metadata.archiveLength){
      const end=Math.min(entry.offset+maxEnvelope-1,metadata.archiveLength-1);
      const envelope=(await range(entry.offset,end)).buffer;
      if(envelope.readUInt32LE(0)!==0x04034b50)throw Error('Remote local-file header mismatch.');
      const start=30+envelope.readUInt16LE(26)+envelope.readUInt16LE(28);
      if(envelope.subarray(30,30+envelope.readUInt16LE(26)).toString('utf8')!==entry.name||start+entry.compressedSize>envelope.length)throw Error('Remote entry header/name/size mismatch.');
      compressed=envelope.subarray(start,start+entry.compressedSize);
    }else{
      const header = (await range(entry.offset, entry.offset + 29)).buffer;
      if (header.readUInt32LE(0) !== 0x04034b50) throw Error('Remote local-file header mismatch.');
      const start = entry.offset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
      compressed = (await range(start, start + entry.compressedSize - 1)).buffer;
    }
  }
  return saveSample(entry, compressed);
}
function checkpoint(){const target=path.join(output,'inventory.json'),temp=target+'.tmp';fs.writeFileSync(temp,JSON.stringify(metadata,null,2));fs.renameSync(temp,target);}
let nextEntry=0;
await Promise.all(Array.from({length:2},async()=>{
  while(nextEntry<candidates.length){
    const entry=candidates[nextEntry++];
    try{metadata.samples.push(await acquire(entry));}
    catch(error){metadata.failedSamples||=[];metadata.failedSamples.push({file:entry.name,error:error.message});}
    checkpoint();
    if((metadata.samples.length+(metadata.failedSamples?.length||0))%25===0)console.error('Acquired/checked '+(metadata.samples.length+(metadata.failedSamples?.length||0))+' / '+candidates.length);
  }
}));
metadata.samples.sort((a,b)=>a.file.localeCompare(b.file));
metadata.unavailableRequestedSamples = [...requested].filter(word => !metadata.samples.some(sample => path.basename(sample.file, '.glb') === word));
fs.writeFileSync(path.join(output, 'inventory.json'), JSON.stringify(metadata, null, 2));
console.log(JSON.stringify({source: sourceUrl, cache: path.relative(root, output), prefixBytes: metadata.prefixBytes, archiveEntries: metadata.entries.length,
  completePrefixEntries: metadata.completePrefixEntries, archiveLength: metadata.archiveLength || null, unavailable: metadata.unavailableRequestedSamples,
  samples: metadata.samples.map(sample => ({file: sample.file, size: sample.size, generator: sample.generator, joints: sample.joints, clips: sample.clips.map(clip => ({duration: clip.duration, channels: clip.channels.length, invalidValues: clip.invalidValues, invalidQuaternionKeys: clip.invalidQuaternionKeys, maxFingerTranslationMagnitude: clip.maxFingerTranslationMagnitude})), meshNames: sample.meshNames, materialNames: sample.materialNames, facialMorphTargets: sample.facialMorphTargets.length, anomalousFingerEnds: sample.anomalousFingerEnds.length}))}, null, 2));

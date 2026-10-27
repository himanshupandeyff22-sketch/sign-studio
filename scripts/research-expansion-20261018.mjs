import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {proposedRows} from './prepare-expansion-20261018.mjs';
const folder='asset-downloads/expansion-research-20261018';fs.mkdirSync(folder,{recursive:true});
async function read(url){const response=await fetch(url,{headers:{'User-Agent':'Sign-Studio-source-audit'},signal:AbortSignal.timeout(25000)});let count=0;const chunks=[];for await(const chunk of response.body){count+=chunk.length;if(count>2*1024*1024)throw Error('Public metadata exceeds audit bound.');chunks.push(chunk);}const bytes=Buffer.concat(chunks);return {status:response.status,bytes,text:bytes.toString('utf8'),sha256:createHash('sha256').update(bytes).digest('hex')};}
const targets=[
 ['sapa-readme','https://raw.githubusercontent.com/OlineRanum/SAPA/main/README.md'],
 ['sapa-commit','https://api.github.com/repos/OlineRanum/SAPA/commits/main'],
 ['osf-asl-license','https://api.osf.io/v2/licenses/563c1cf88c5e4a3877f9e96a/'],
 ['osf-asl-node','https://api.osf.io/v2/nodes/mqzyk/'],
 ['harshbg','https://api.github.com/repos/harshbg/Sign-Language-Interpreter-using-Deep-Learning/commits/master'],
 ['evilport','https://api.github.com/repos/EvilPort2/Sign-Language/commits/master'],
 ['asl-citizen-readme','https://raw.githubusercontent.com/microsoft/ASL-citizen-code/main/README.md'],
 ['asl-citizen-code-license','https://raw.githubusercontent.com/microsoft/ASL-citizen-code/main/LICENSE'],
 ['openasl-license','https://raw.githubusercontent.com/chevalierNoir/OpenASL/main/LICENSE'],
 ['skeleton3d-readme','https://raw.githubusercontent.com/amorim-cleison/asl-datasets-gen/main/README.md'],
 ['skeleton3d-code-license','https://raw.githubusercontent.com/amorim-cleison/asl-datasets-gen/main/LICENSE'],
 ['mediapipe-code-license','https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/LICENSE']
];
const checks=[];
for(const[name,url]of targets){try{const r=await read(url);checks.push({name,url,status:r.status,sha256:r.sha256,bytes:r.bytes.length});if(r.status===200)fs.writeFileSync(folder+'/'+name+'.txt',r.bytes);}catch(error){checks.push({name,url,error:error.message});}}
fs.writeFileSync(folder+'/source-checks.json',JSON.stringify({date:'2026-10-18',checks},null,2)+'\n');
const notice=fs.readFileSync(folder+'/sapa-readme.txt','utf8'),osf=fs.readFileSync(folder+'/osf-asl-license.txt','utf8');
if(!/CC BY 4\.0/.test(notice)||!osf.includes('creativecommons.org/licenses/by/4.0'))throw Error('Current explicit ASL source license could not be confirmed.');
const refs=[];let next=0;
await Promise.all(Array.from({length:2},async()=>{while(next<proposedRows.length){const row=proposedRows[next++];try{const r=await read(row.reference),title=(r.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s+/g,' ').trim();refs.push({word:row.word,url:row.reference,status:r.status,title,sha256:r.sha256,aslReference:r.status===200&&/American Sign Language|\bASL\b/i.test(r.text)&&!/404|not found/i.test(title),scope:'Reference page existence only; exact meaning, source handshape/orientation/location/movement/nonmanuals and target rendering still require human review. No reference media imported.'});}catch(error){refs.push({word:row.word,url:row.reference,status:null,error:error.message});}}}));
fs.writeFileSync(folder+'/reference-checks.json',JSON.stringify(refs.sort((a,b)=>a.word.localeCompare(b.word)),null,2)+'\n');
console.log(JSON.stringify({sources:checks.map(c=>({name:c.name,status:c.status,error:c.error})),referenceCount:refs.length,referencePagesFound:refs.filter(r=>r.aslReference).length,unresolved:refs.filter(r=>!r.aslReference).map(r=>r.word)}));

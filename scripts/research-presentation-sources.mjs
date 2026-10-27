// Bounded public primary-source checks. No credentials, form submissions or media scraping.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {presentationRows} from './prepare-presentation-batch.mjs';
const out='asset-downloads/presentation-research-20261016';
fs.mkdirSync(out,{recursive:true});
const digest=b=>createHash('sha256').update(b).digest('hex');
async function read(url,max=2*1024*1024){
 const r=await fetch(url,{headers:{'User-Agent':'Sign-Studio-public-source-audit'},signal:AbortSignal.timeout(25000)});
 const chunks=[];let n=0;for await(const b of r.body){n+=b.length;if(n>max)throw Error('Public audit response exceeds byte bound.');chunks.push(b);}
 const bytes=Buffer.concat(chunks);return {url:r.url,status:r.status,bytes,text:bytes.toString('utf8'),sha256:digest(bytes),contentType:r.headers.get('content-type')};
}
const checks=[];
for(const [name,url] of [
 ['osf-asl-node','https://api.osf.io/v2/nodes/mqzyk/'],
 ['osf-license','https://api.osf.io/v2/licenses/563c1cf88c5e4a3877f9e96a/'],
 ['osf-files','https://api.osf.io/v2/nodes/mqzyk/files/osfstorage/'],
 ['sapa-commit','https://api.github.com/repos/OlineRanum/SAPA/commits/main'],
 ['harshbg-commit','https://api.github.com/repos/harshbg/Sign-Language-Interpreter-using-Deep-Learning/commits/master'],
 ['evilport-commit','https://api.github.com/repos/EvilPort2/Sign-Language/commits/master'],
 ['nvidia-commit','https://api.github.com/repos/NVIDIA/Trustworthy-AI/commits/main'],
 ['nvidia-data-license','https://raw.githubusercontent.com/NVIDIA/Trustworthy-AI/main/ASL%20Developer%20Community/NVIDIA%20Data%20License%20for%20ASL%20Project.pdf'],
 ['signavatars-commit','https://api.github.com/repos/ZhengdiYu/SignAvatars/commits/main'],
 ['sapa-readme','https://raw.githubusercontent.com/OlineRanum/SAPA/main/README.md']
]){
 try{const r=await read(url);checks.push({name,url,status:r.status,finalURL:r.url,sha256:r.sha256,contentType:r.contentType,bytes:r.bytes.length});if(r.status===200){const file=out+'/'+name+(name==='nvidia-data-license'?'.pdf':name==='sapa-readme'?'.md':'.json');if(!fs.existsSync(file))fs.writeFileSync(file,r.bytes,{flag:'wx'});}}
 catch(e){checks.push({name,url,error:e.message});}
}
fs.writeFileSync(out+'/source-checks.json',JSON.stringify({checkedAt:new Date().toISOString(),checks},null,2)+'\n');
const refs=[];let next=0;
const override={sugar:'sugar',therapy:'therapy',vomit:'vomit',afternoon:'afternoon',new:'new',old:'old',parents:'parents',clothes:'clothes',shoes:'shoes'};
await Promise.all(Array.from({length:2},async()=>{while(next<presentationRows.length){const [word]=presentationRows[next++];const lookup=override[word]||word;const url=`https://www.lifeprint.com/asl101/pages-signs/${lookup[0]}/${lookup}.htm`;try{const r=await read(url);const title=(r.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s+/g,' ').trim();refs.push({word,url,status:r.status,finalURL:r.url,sha256:r.sha256,title,aslReference:r.status===200&&/American Sign Language|\bASL\b/i.test(r.text)&&!/(404|page not found)/i.test(title),scope:'Reference page existence/title checked only; source/target motion equivalence and exact meaning remain pending human ASL review. No reference image/video imported.'});}catch(e){refs.push({word,url,status:null,error:e.message,aslReference:false});}}}));
refs.sort((a,b)=>a.word.localeCompare(b.word));fs.writeFileSync(out+'/reference-checks.json',JSON.stringify(refs,null,2)+'\n');
console.log(JSON.stringify({sourceChecks:checks,referencePages:refs.length,acceptedReferencePages:refs.filter(r=>r.aslReference).length,unresolved:refs.filter(r=>!r.aslReference)},null,2));

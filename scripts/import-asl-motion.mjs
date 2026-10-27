import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {planBatch,importPlanFingerprint} from './import-core.mjs';
import {sha256} from './motion-identity.mjs';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url))),args=Object.fromEntries(process.argv.slice(2).map(a=>{const i=a.indexOf('=');return i<0?[a.replace(/^--/,''),true]:[a.slice(2,i),a.slice(i+1)];}));
if(!args.batch)throw Error('Use --batch=imports/batch.json. Dry-run is default; --commit requires --plan=saved-report.json.');
const inside=(base,file)=>file===base||file.startsWith(base+path.sep),safe=relative=>{const file=path.resolve(root,relative);if(!inside(root,file))throw Error('Paths must stay within this project.');return file;};
const batchPath=safe(args.batch),manifestPath=safe('web/vocabulary-manifest.json'),manifestBytes=fs.readFileSync(manifestPath),batchBytes=fs.readFileSync(batchPath),batch=JSON.parse(batchBytes),library=JSON.parse(manifestBytes);
const readAsset=relative=>{const file=fs.realpathSync(safe(relative)),cache=path.join(root,'asset-downloads');if(!inside(cache,file)||!file.endsWith('.glb'))throw Error('Sources must stay in private GLB cache.');if(fs.statSync(file).size>8*1024*1024)throw Error('Source exceeds bounded size.');const bytes=fs.readFileSync(file),audit=JSON.parse(fs.readFileSync(file+'.inspection.json','utf8'));if(audit.sha256!==sha256(bytes)||audit.file!=='ANIM_GLB/'+path.basename(file))throw Error('Source differs from verified archive inspection.');return bytes;};
const plan=planBatch(batch,library,readAsset),report={...plan.report,dryRun:!args.commit,batchSHA256:sha256(batchBytes),baselineManifestSHA256:sha256(manifestBytes),planFingerprint:importPlanFingerprint(plan)};
const reportPath=safe(args.report||`docs/import-reports/${batch.id}-${args.commit?'commit':'dry'}-${Date.now()}.json`);fs.mkdirSync(path.dirname(reportPath),{recursive:true});
if(fs.existsSync(reportPath))throw Error('Report already exists; choose a fresh report path.');
if(args.commit){
 if(!args.plan)throw Error('Saved dry-run required.');const saved=JSON.parse(fs.readFileSync(safe(args.plan),'utf8'));
 if(!saved.dryRun||saved.batchSHA256!==report.batchSHA256||saved.baselineManifestSHA256!==report.baselineManifestSHA256)throw Error('Batch or library changed; run fresh dry-run.');
 if(saved.planFingerprint!==report.planFingerprint)throw Error('Source data or import plan changed; run fresh dry-run.');
 const lock=safe('data/vocabulary-import.lock');fs.mkdirSync(path.dirname(lock),{recursive:true});const fd=fs.openSync(lock,'wx');
 try{
  if(sha256(fs.readFileSync(manifestPath))!==report.baselineManifestSHA256)throw Error('Library changed during import.');
  for(const a of plan.additions){const target=safe(a.record.motionUrl.slice(1));if(fs.existsSync(target)&&sha256(fs.readFileSync(target))!==a.record.sha256)throw Error('Asset path conflict; no files replaced.');}
  for(const a of plan.additions){const target=safe(a.record.motionUrl.slice(1));if(!fs.existsSync(target))fs.writeFileSync(target,a.bytes,{flag:'wx'});}
  if(report.counts.added||report.counts.merged||report.conceptChanges.added.length||report.discoveryChanges.added||report.metadataChanges.added.length){const temp=manifestPath+'.import-'+process.pid;fs.writeFileSync(temp,JSON.stringify(plan.library,null,2)+'\n',{flag:'wx'});fs.renameSync(temp,manifestPath);}
 }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({report:path.relative(root,reportPath),dryRun:report.dryRun,counts:report.counts,conceptChanges:report.conceptChanges,metadataChanges:report.metadataChanges,discoveryChanges:report.discoveryChanges,pendingReview:report.pendingReview,before:report.before,after:report.after},null,2));

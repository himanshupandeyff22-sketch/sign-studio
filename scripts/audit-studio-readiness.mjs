import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {animations} from '../web/vocabulary.mjs';
import {validateMotion} from '../web/asl-loader.js';
import {motionIdentity} from './motion-identity.mjs';
import {auditRetarget} from './retarget-audit.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schema:'studio-asset-readiness/1',checkedAt:new Date().toISOString(),rigSHA256:hash(readFileSync(new URL('../web/assets/aarav.glb',import.meta.url))),motions:[],sourceVideos:JSON.parse(readFileSync(new URL('../imports/phrase-candidates/source-playback-evidence.json',import.meta.url),'utf8')).items,linguisticApproval:false};
const ids=new Set(),files=new Set(),contents=new Set();
for(const asset of animations){
  if(ids.has(asset.id)||files.has(asset.sha256)||contents.has(asset.motionContentSHA256))throw Error('Duplicate motion registration: '+asset.id);
  ids.add(asset.id);files.add(asset.sha256);contents.add(asset.motionContentSHA256);
  const bytes=readFileSync(new URL('..'+asset.motionUrl,import.meta.url));if(hash(bytes)!==asset.sha256)throw Error('Hash mismatch: '+asset.id);
  const motion=validateMotion(JSON.parse(bytes));if(motion.id!==asset.id||motionIdentity(motion)!==asset.motionContentSHA256)throw Error('Identity mismatch: '+asset.id);
  const diagnostics=auditRetarget(motion);
  report.motions.push({id:asset.id,sha256:asset.sha256,structure:'passed',retarget:'passed',diagnostics});
  if(report.motions.length%40===0)console.log('Checked '+report.motions.length+' motions');
}
writeFileSync(new URL('../docs/STUDIO_ASSET_AUDIT.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checked:report.motions.length,duplicates:0,sourceVideoObservations:report.sourceVideos.length,linguisticApprovalsAdded:0}));

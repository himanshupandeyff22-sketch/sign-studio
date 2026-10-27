import {readdir,readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {animations} from '../web/vocabulary.mjs';
import {validateLibrary} from './import-core.mjs';
import {sha256,motionIdentity} from './motion-identity.mjs';
import {signRegistry} from '../web/sign-registry.mjs';
import {validateMotion} from '../web/asl-loader.js';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const files=['server.mjs'];
for(const folder of ['web','backend','scripts'])for(const file of await readdir(path.join(root,folder)))if(/\.(mjs|js)$/.test(file))files.push(`${folder}/${file}`);
for(const file of files){const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});if(result.status!==0){process.stderr.write(result.stderr);process.exit(1);}}
const html=await readFile(path.join(root,'web/index.html'),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
if(new Set(ids).size!==ids.length)throw Error('Duplicate HTML IDs.');
const app=await readFile(path.join(root,'web/app.js'),'utf8');
for(const match of app.matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(match[1]))throw Error(`Missing UI element: ${match[1]}`);
for(const relative of ['web/assets/aarav.glb','web/assets/AARAV-LICENSE.md','web/assets/gesture_recognizer.task','node_modules/three/build/three.module.js','node_modules/@mediapipe/tasks-vision/vision_bundle.mjs'])await access(path.join(root,relative));
validateLibrary(JSON.parse(await readFile(path.join(root,'web/vocabulary-manifest.json'),'utf8')));
for(const asset of animations)if(sha256(await readFile(path.join(root,asset.motionUrl.slice(1))))!==asset.sha256)throw Error('Asset hash mismatch: '+asset.id);
for(const entry of signRegistry.filter(item=>item.motionUrl)){
  const motion=validateMotion(JSON.parse(await readFile(path.join(root,entry.motionUrl.slice(1)),'utf8')));
  if(motion.id!==entry.id||Math.abs(motion.duration-entry.duration)>.01)throw Error(`Research clip differs from registry: ${entry.id}`);
  if(motionIdentity(motion)!==animations.find(a=>a.id===entry.id).motionContentSHA256)throw Error('Registered animation-content hash mismatch: '+entry.id);
}
for(const relative of ['THIRD_PARTY_NOTICES.md','SIGN_DATA_VALIDATION.md','web/assets/asl/ATTRIBUTION.md'])await access(path.join(root,relative));
const fonts=JSON.parse(await readFile(path.join(root,'web/assets/fonts/sources.json'),'utf8'));
for(const font of fonts.fonts){
  if(!/^[a-z-]+\.ttf$/.test(font.file)||!/^[a-z-]+\.txt$/i.test(font.licenseFile)||font.license!=='SIL OFL 1.1')throw Error('Invalid bundled font provenance.');
  if(sha256(await readFile(path.join(root,'web/assets/fonts',font.file)))!==font.sha256)throw Error('Bundled font hash mismatch.');
  if(!(await readFile(path.join(root,'web/assets/fonts',font.licenseFile),'utf8')).includes('SIL OPEN FONT LICENSE'))throw Error('Font license notice missing.');
}
console.log(`Checks passed: ${files.length} JavaScript files, ${ids.length} unique UI IDs, local model/runtime assets, ${animations.length} immutable motion-only research files and license/review notices.`);

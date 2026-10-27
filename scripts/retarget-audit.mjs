import fs from 'node:fs';
import * as THREE from 'three';
import {createResearchRetargeter} from '../web/asl-loader.js';
export function targetRig(){
 const b=fs.readFileSync(new URL('../web/assets/aarav.glb',import.meta.url)),g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),joints=new Set(g.skins.flatMap(s=>s.joints));
 const nodes=g.nodes.map((data,i)=>{const n=joints.has(i)?new THREE.Bone():new THREE.Object3D();n.name=THREE.PropertyBinding.sanitizeNodeName(data.name||'');if(data.translation)n.position.fromArray(data.translation);if(data.rotation)n.quaternion.fromArray(data.rotation);if(data.scale)n.scale.fromArray(data.scale);return n;});
 g.nodes.forEach((data,i)=>data.children?.forEach(child=>nodes[i].add(nodes[child])));const root=new THREE.Group();root.scale.setScalar(1.75/1.70);g.scenes[g.scene||0].nodes.forEach(i=>root.add(nodes[i]));root.updateMatrixWorld(true);
 const bones=Object.fromEntries(nodes.filter(n=>n.isBone).map(n=>[n.name,n]));const rest=Object.fromEntries(Object.entries(bones).map(([name,n])=>[name,{position:n.position.clone(),quaternion:n.quaternion.clone()}]));return {root,bones,rest};
}
export function auditRetarget(motion){
 const {bones,rest}=targetRig(),retarget=createResearchRetargeter(motion,bones,rest);
 for(let t=0;t<=motion.duration+1/30;t+=1/30)retarget.apply(Math.min(t,motion.duration));
 const d=retarget.diagnostics;
 if(d.maxReachError>.12||d.maxFingerDirectionError>.01||d.maxPalmAngleError>.02||d.maxNearContactSeparationError>.08)throw Error('Retarget distortion exceeds the existing lexical-preview bounds.');
 return {...d,automatedStatus:'passed',linguisticStatus:'pending',samplingHz:30,note:'Bone/landmark checks, not expert meaning or skin-contact approval.'};
}

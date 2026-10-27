import {createHash} from 'node:crypto';
export const sha256=data=>createHash('sha256').update(data).digest('hex');
const round=value=>Math.round(value*1e6)/1e6;
function quaternion(values){const q=values.map(round);const pivot=Math.abs(q[3])>1e-6?q[3]:q.find(value=>Math.abs(value)>1e-6)||1;return pivot<0?q.map(value=>-value):q;}
// Metadata, label, channel order, JSON whitespace and quaternion sign cannot
// create a second copy of the same skeletal animation.
export function motionIdentity(motion){
  const nodes=motion.nodes.map(node=>({name:node.name,parent:node.parent,position:node.position.map(round),quaternion:quaternion(node.quaternion),scale:node.scale.map(round)})).sort((a,b)=>a.name.localeCompare(b.name));
  const tracks=motion.tracks.map(track=>{const values=track.path==='rotation'?Array.from({length:track.values.length/4},(_,i)=>quaternion(track.values.slice(i*4,i*4+4))).flat():track.values.map(round);return {node:track.node,path:track.path,interpolation:track.interpolation,times:track.times.map(round),values};}).sort((a,b)=>(a.node+'.'+a.path).localeCompare(b.node+'.'+b.path));
  return sha256(JSON.stringify({duration:round(motion.duration),nodes,tracks}));
}
export const sourceIdentity=source=>`${source.archiveURL||source.archiveUrl}#${source.archiveFile||source.filename}`;

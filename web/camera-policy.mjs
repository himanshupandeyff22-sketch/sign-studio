export const cameraPoses=Object.freeze([
  {id:'Open_Palm',label:'Open palm',kind:'illustration',response:'Hello'},
  {id:'Thumb_Up',label:'Thumbs up',kind:'illustration',response:'Yes'},
  {id:'Thumb_Down',label:'Thumbs down',kind:'illustration',response:'No'},
  {id:'Victory',label:'Victory',kind:'illustration',response:'Hello'},
  {id:'ILoveYou',label:'I-love-you handshape',kind:'illustration',response:'Love'},
  {id:'Closed_Fist',label:'Closed fist',kind:'control',action:'pause',response:'Pause signing'},
  {id:'Pointing_Up',label:'Pointing up',kind:'control',action:'resume',response:'Resume signing'}
]);
export const cameraPose=id=>cameraPoses.find(pose=>pose.id===id);

// A history replay reuses the user's saved confirmation; it is not a new
// camera observation and must never fabricate a perfect classifier score.
export function cameraReplayInput(item){
  const review=item?.cameraReview,pose=cameraPose(review?.confirmedPose);
  if(!pose||pose.kind!=='illustration'||!cameraPose(review.detectedPose)||!Number.isFinite(review.classifierScore)||review.classifierScore<.7||review.classifierScore>1)return null;
  return {mode:'camera',gesture:pose.id,confidence:review.classifierScore,cameraReview:{detectedPose:review.detectedPose,replayed:true},autoPlay:false};
}

// A temporal pose filter, not a sign-language classifier. Conflicting hands
// and unknown classes never become a translation or an inferred ASL sentence.
export function createCameraPolicy({threshold=.8,dwell=750,release=450,cooldown=1800}={}){
  let candidate='',since=0,latched=false,neutralSince=null,lastEmission=-Infinity,lastNow=-Infinity;
  const reset=()=>{candidate='';since=0;latched=false;neutralSince=null;lastEmission=lastNow=-Infinity;};
  return {reset,observe(result,now){
    if(!Number.isFinite(now)||now<lastNow)return {state:'stale',proposal:null};lastNow=now;
    const hands=(result?.gestures||[]).map((list,i)=>({pose:list?.[0]?.categoryName,score:list?.[0]?.score,hand:result.handedness?.[i]?.[0]?.categoryName||String(i)}));
    let state=!hands.length?'no-hands':result.outOfFrame?'out-of-frame':hands.some(h=>!cameraPose(h.pose)||!Number.isFinite(h.score)||h.score<threshold)?'uncertain':new Set(hands.map(h=>h.pose)).size>1?'conflicting-hands':'holding';
    if(state!=='holding'){
      candidate='';if(neutralSince===null)neutralSince=now;
      // A second pose is not a release. Require a genuinely neutral/unknown
      // interval before another captured proposal can be offered.
      if(now-neutralSince>=release)latched=false;
      return {state,hands,proposal:null};
    }
    neutralSince=null;
    const key=hands.map(h=>h.hand+':'+h.pose).sort().join('|');
    if(key!==candidate){candidate=key;since=now;}
    const held=now-since;
    if(!latched&&held>=dwell&&now-lastEmission>=cooldown){
      latched=true;lastEmission=now;
      return {state:'captured',hands,proposal:{pose:hands[0].pose,score:Math.min(...hands.map(h=>h.score)),handCount:hands.length,capturedAt:now}};
    }
    return {state:latched?'release-to-repeat':'holding',hands,holdProgress:Math.min(1,held/dwell),proposal:null};
  }};
}

export function cameraAction(proposal,chosen,{demo=false,controls=false,playerState='idle',ready=false}={}){
  const pose=cameraPose(chosen);
  if(!proposal||!pose)return {enabled:false,label:'Capture a pose first'};
  if(pose.kind==='illustration')return {enabled:demo,label:demo?`Prepare ${pose.response} illustration`:'Enable illustrative responses below'};
  if(!controls)return {enabled:false,label:'Enable confirmed player controls below'};
  if(!ready)return {enabled:false,label:'Prepare a signing queue first'};
  const allowed=pose.action==='pause'?playerState==='playing':playerState==='paused';
  return {enabled:allowed,label:allowed?pose.response:pose.action==='pause'?'Signing is already paused or stopped':'Pause signing before resuming'};
}

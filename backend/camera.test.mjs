import test from 'node:test';
import assert from 'node:assert/strict';
import {createCameraPolicy,cameraAction,cameraPoses,cameraReplayInput} from '../web/camera-policy.mjs';
import {createCameraDetector} from '../web/camera-detector.mjs';
import {processInput,catalog} from './catalog.mjs';
const pose=(id='Open_Palm',score=.92,second)=>({gestures:[[{categoryName:id,score}],...(second?[[{categoryName:second,score}]]:[])],handedness:[[{categoryName:'Right'}],...(second?[[{categoryName:'Left'}]]:[])]});

test('camera captures stable poses once and requires neutral release/cooldown before repeat',()=>{
  const p=createCameraPolicy();assert(!p.observe(pose(),0).proposal);assert(!p.observe(pose(),700).proposal);
  assert.equal(p.observe(pose(),800).proposal.pose,'Open_Palm');assert(!p.observe(pose(),4000).proposal);
  assert(!p.observe(pose('Thumb_Up'),5000).proposal);assert(!p.observe(pose('Thumb_Up'),6000).proposal,'switching directly is not neutral release');
  p.observe({gestures:[]},6100);p.observe({gestures:[]},6600);p.observe(pose(),6800);assert(p.observe(pose(),7600).proposal);
  assert.equal(p.observe(pose(),10).state,'stale');p.reset();assert(!p.observe(pose(),0).proposal);
});

test('unknown, weak, conflicting and cropped hands never become a confirmed word',()=>{
  for(const sample of [pose('None'),pose('invented'),pose('Open_Palm',.79),pose('Open_Palm',NaN),pose('Open_Palm',.9,'Thumb_Up'),{...pose(),outOfFrame:true}]){
    const p=createCameraPolicy();assert(!p.observe(sample,0).proposal);assert(!p.observe(sample,1000).proposal);
  }
  const p=createCameraPolicy();p.observe(pose('Victory',.88,'Victory'),0);assert.equal(p.observe(pose('Victory',.88,'Victory'),800).proposal.handCount,2);
});

test('seven pose classes remain five opt-in illustrations plus two explicit controls, not seven ASL words',()=>{
  assert.equal(cameraPoses.length,7);assert.equal(cameraPoses.filter(p=>p.kind==='illustration').length,5);assert.equal(cameraPoses.filter(p=>p.kind==='control').length,2);
  const captured={pose:'Open_Palm',score:.92};assert(!cameraAction(null,'Open_Palm',{demo:true}).enabled);
  assert(!cameraAction(captured,'Open_Palm',{}).enabled);assert(cameraAction(captured,'Open_Palm',{demo:true}).enabled);
  assert(!cameraAction(captured,'Closed_Fist',{controls:true,ready:true,playerState:'paused'}).enabled);
  assert(cameraAction(captured,'Closed_Fist',{controls:true,ready:true,playerState:'playing'}).enabled);
  assert(cameraAction(captured,'Pointing_Up',{controls:true,ready:true,playerState:'paused'}).enabled);
  assert(!cameraAction(captured,'Pointing_Up',{controls:true,ready:false,playerState:'paused'}).enabled);
  for(const action of ['Closed_Fist','Pointing_Up'])assert.throws(()=>processInput({mode:'camera',language:'en',gesture:action,confidence:.99,vocabularyMode:'demo'}),/not supported/);
  const r=processInput({mode:'camera',language:'en',gesture:'Thumb_Up',confidence:.92,vocabularyMode:'demo',cameraReview:{detectedPose:'Open_Palm'}});
  assert.equal(r.cameraReview.detectedPose,'Open_Palm');assert.equal(r.cameraReview.confirmedPose,'Thumb_Up');assert.equal(r.validatedSignLanguage,false);
  assert.equal(processInput({mode:'camera',language:'en',gesture:'Thumb_Up',confidence:.92,vocabularyMode:'validated'}).sequence.length,0);
  assert.equal(catalog().capabilities.camera.length,5);
});

test('camera worker bounds frame size, rejects concurrent frames and releases pending work on stop',async()=>{
  let worker;const bitmaps=[];let timers=0;
  const environment={setTimeout(){return ++timers;},clearTimeout(){},createImageBitmap:async(source,options)=>{const b={options,closed:0,close(){this.closed++;}};bitmaps.push(b);return b;},Worker:class{
    constructor(){worker=this;this.messages=[];}
    postMessage(message){this.messages.push(message);if(message.type==='initialize')queueMicrotask(()=>this.onmessage({data:{id:message.id,ok:true,result:{}}}));}
    terminate(){this.terminated=true;}
  }};
  const detector=await createCameraDetector({environment});assert.equal(detector.runtime,'worker');
  const first=detector.detect({videoWidth:1920,videoHeight:1080},100);await Promise.resolve();
  assert.equal(bitmaps[0].options.resizeWidth,480);assert.equal(bitmaps[0].options.resizeHeight,270);
  await assert.rejects(detector.detect({videoWidth:640,videoHeight:480},200),/already processing/);assert.equal(bitmaps[1].closed,1);
  const message=worker.messages.at(-1);worker.onmessage({data:{id:message.id-1,ok:true,result:{stale:true}}});
  worker.onmessage({data:{id:message.id,ok:true,result:{inferenceMs:5,gestures:[]}}});assert.equal((await first).inferenceMs,5);
  const pending=detector.detect({videoWidth:640,videoHeight:480},300);await Promise.resolve();detector.close();
  await assert.rejects(pending,{name:'AbortError'});assert(worker.terminated);detector.close();
  await assert.rejects(detector.detect({},400),{name:'AbortError'});
});

test('camera history preserves original confirmation and score without claiming a new capture',()=>{
  assert.equal(cameraReplayInput({input:'Thumb Up'}),null);
  assert.equal(cameraReplayInput({cameraReview:{detectedPose:'Open_Palm',confirmedPose:'Closed_Fist',classifierScore:.96}}),null);
  const input=cameraReplayInput({cameraReview:{detectedPose:'Open_Palm',confirmedPose:'Thumb_Up',classifierScore:.93}});
  assert.equal(input.confidence,.93);assert.equal(input.autoPlay,false);
  const result=processInput({...input,language:'en',vocabularyMode:'demo'});
  assert.equal(result.cameraReview.classifierScore,.93);assert.equal(result.cameraReview.detectedPose,'Open_Palm');assert.equal(result.cameraReview.replayed,true);
  assert.equal(result.cameraReview.source,'saved-user-confirmation-replay');
});

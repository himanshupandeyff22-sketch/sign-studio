// Tasks Vision 0.10.14 loads Emscripten with importScripts. A classic worker
// preserves that supported loader; module workers cannot call importScripts.
self.exports={};
importScripts('/node_modules/@mediapipe/tasks-vision/vision_bundle.cjs');
const {FilesetResolver,GestureRecognizer}=self.exports;
let recognizer;
self.onmessage=async({data})=>{
  const {type,id,bitmap,timestamp}=data;
  try{
    if(type==='initialize'){
      const files=await FilesetResolver.forVisionTasks('/node_modules/@mediapipe/tasks-vision/wasm');
      recognizer=await GestureRecognizer.createFromOptions(files,{baseOptions:{modelAssetPath:'/web/assets/gesture_recognizer.task'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.6});
      self.postMessage({id,ok:true,result:{runtime:'worker'}});
    }else if(type==='frame'){
      if(!recognizer)throw Error('Camera model is not ready.');
      const start=performance.now(),result=recognizer.recognizeForVideo(bitmap,timestamp);
      self.postMessage({id,ok:true,result:{gestures:result.gestures,handedness:result.handedness,handCount:result.landmarks.length,outOfFrame:result.landmarks.some(hand=>hand.some(p=>p.x<.015||p.x>.985||p.y<.015||p.y>.985)),inferenceMs:performance.now()-start}});
    }
  }catch(error){self.postMessage({id,ok:false,error:error.message||'Local recognition failed.'});}
  finally{bitmap?.close();}
};

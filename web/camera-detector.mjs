// One bitmap and one request in flight; no frame/video leaves this origin.
export async function createCameraDetector({signal,environment=globalThis}={}){
  let worker,closed=false,serial=0,pending=null;
  const schedule=environment.setTimeout?.bind(environment)||setTimeout,clear=environment.clearTimeout?.bind(environment)||clearTimeout;
  const fail=error=>{if(pending){clear(pending.timer);pending.reject(error);pending=null;}};
  const close=()=>{if(closed)return;closed=true;fail(new DOMException('Camera stopped.','AbortError'));worker?.terminate();signal?.removeEventListener('abort',close);};
  signal?.throwIfAborted();
  try{
    if(!environment.Worker||!environment.createImageBitmap)throw Error('worker-unavailable');
    worker=new environment.Worker(new URL('./camera-worker.js',import.meta.url));
    worker.onmessage=({data})=>{if(!pending||pending.id!==data.id)return;const request=pending;pending=null;clear(request.timer);data.ok?request.resolve(data.result):request.reject(Error(data.error));};
    worker.onerror=()=>fail(Error('The local camera worker could not run.'));
    const request=(message,transfer=[])=>new Promise((resolve,reject)=>{
      if(closed){reject(new DOMException('Camera stopped.','AbortError'));return;}
      if(pending){reject(Error('A camera frame is already processing.'));return;}
      const id=++serial,timer=schedule(()=>{if(pending?.id===id){fail(Error('Local camera processing timed out. Stop and retry the camera.'));}},message.type==='initialize'?25000:10000);
      pending={id,resolve,reject,timer};
      try{worker.postMessage({...message,id},transfer);}catch(error){fail(error);}
    });
    signal?.addEventListener('abort',close,{once:true});
    await request({type:'initialize'});
    return {runtime:'worker',close,async detect(video,timestamp){
      if(closed)throw new DOMException('Camera stopped.','AbortError');
      const width=video.videoWidth||640,height=video.videoHeight||480,scale=Math.min(1,480/width,360/height);
      const bitmap=await environment.createImageBitmap(video,{resizeWidth:Math.max(1,Math.round(width*scale)),resizeHeight:Math.max(1,Math.round(height*scale))});
      if(closed){bitmap.close();throw new DOMException('Camera stopped.','AbortError');}
      try{return await request({type:'frame',bitmap,timestamp},[bitmap]);}catch(error){bitmap.close();throw error;}
    }};
  }catch(error){
    close();if(signal?.aborted)throw signal.reason;
    // Keep older browsers usable. This synchronous fallback remains throttled
    // by the caller and is explicitly identified in developer diagnostics.
    const {FilesetResolver,GestureRecognizer}=await import('/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs');
    const files=await FilesetResolver.forVisionTasks('/node_modules/@mediapipe/tasks-vision/wasm');
    const recognizer=await GestureRecognizer.createFromOptions(files,{baseOptions:{modelAssetPath:'/web/assets/gesture_recognizer.task'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.6});
    if(signal?.aborted){recognizer.close();throw signal.reason;}
    let disposed=false;
    return {runtime:'main-thread fallback',close:()=>{if(!disposed){disposed=true;recognizer.close();}},async detect(video,timestamp){if(disposed)throw new DOMException('Camera stopped.','AbortError');const start=performance.now(),result=recognizer.recognizeForVideo(video,timestamp);return {...result,handCount:result.landmarks.length,outOfFrame:result.landmarks.some(hand=>hand.some(p=>p.x<.015||p.x>.985||p.y<.015||p.y>.985)),inferenceMs:performance.now()-start};}};
  }
}

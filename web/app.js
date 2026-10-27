import {libraryRows,filterLibrary} from './library-model.mjs';
import {createSpeechController,createMicrophoneController} from './voice.js';
import {createRequestLifecycle} from './request-lifecycle.mjs';
import {demoExamples} from './demo-guide.mjs';
import {createMediaSession} from './media-session.mjs';
import {cameraPoses,cameraPose,createCameraPolicy,cameraAction,cameraReplayInput} from './camera-policy.mjs';
import {selectShownMotions,inspectionSelectionLimit} from './inspection-selection.mjs';
const $=id=>document.getElementById(id);
const wordTokens=text=>[...text.matchAll(/[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu)];
const formatTime=value=>{const seconds=Math.max(0,Math.floor(value||0));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
const symbols={hello:'↗',thanks:'♡',yes:'✓',no:'−',help:'✦',love:'♡'};
let sentenceLimit=60,sentenceIdeaLimit=12,sentenceIdeaRows=[];
let catalog=null,language='en',vocabularyMode='validated',senses={},correctionDecisions={},avatar=null,history=[],lastResult=null,queueReady=false,queueGeneration=0,requestMode=null,busy=false,starting=false,activeMode='text',currentView='studio',playerState='idle',currentIndex=-1;
let queueLimit=80,termLimit=60,sourceLimit=400,conceptLimit=80,meaningLimit=20,messageOrigin='text',speech,microphone,speechState='loading',micState='idle',manualVoice=false,visibilitySuspended=false,restoreSpeech=false;
let recognizer=null,stream=null,frame=null,cameraStarting=false,cameraToken=0,lastVideoTime=-1,lastInference=0,cameraAbort=null,pendingPose=null,inferenceInterval=125,trackCleanup=[],importedLimit=40,librarySearchTimer=null;
const cameraPolicy=createCameraPolicy();
const inspectionSelection=[];
let shownInspectionIds=[],sentencePlaybackToken=0,inspectionOrigin='library';
const requests=createRequestLifecycle();
const media=createMediaSession({avatar:()=>avatar,speech:()=>speech,microphone:()=>microphone});
let graphicsLost=false,exploreLimit=40,exploreRows=null,libraryConceptLimit=60;
const outputType=option=>option.motionUrl?'Aarav animation available':option.sourceVideoURL?'Recorded signer video available':'No supported output';
function primeDemoAssets(){
  const connection=navigator.connection;
  if(connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType||''))return;
  // A low-priority browser cache hint for two already registered research
  // examples. No vocabulary is enabled and no rig preflight blocks input.
  for(const example of demoExamples(catalog).slice(0,2)){
    const entry=catalog.registry.find(item=>item.id===example.id);
    if(document.querySelector(`link[data-demo-prefetch="${example.id}"]`))continue;
    const link=document.createElement('link');link.rel='prefetch';link.as='fetch';link.href=entry.motionUrl;link.dataset.demoPrefetch=example.id;document.head.append(link);
  }
}
let seekDragging=false,resumeAfterSeek=false;
function resetTimeline(){seekDragging=resumeAfterSeek=false;$('playback-position').value='0';$('playback-position').max='0';$('playback-position').setAttribute('aria-valuetext','0:00 of 0:00');}
function updateTimeline(position,total){const slider=$('playback-position');slider.max=String(Math.max(0,total||0));if(!seekDragging)slider.value=String(Math.max(0,Math.min(total||0,position||0)));slider.setAttribute('aria-valuetext',`${formatTime(position)} of ${formatTime(total)}`);}
function config(){return catalog?.languages.find(item=>item.id===language);}
const topicLabels={existing:'Existing library',health:'Health',food:'Food & drink',people:'People',education:'Education',communication:'Communication',time:'Time',travel:'Travel',shopping:'Shopping',description:'Descriptions'};
function conceptCategory(id){return catalog?.concepts.find(concept=>concept.id===id)?.category||'existing';}
function matchesTopic(id,topic){return !topic||conceptCategory(id)===topic;}
function renderTopicOptions(){
  const select=$('library-topic'),selected=select.value,categories=[...new Set((catalog?.concepts||[]).map(concept=>concept.category||'existing'))].sort((a,b)=>a.localeCompare(b));
  select.replaceChildren();const all=document.createElement('option');all.value='';all.textContent='All topics';select.append(all);
  for(const category of categories){const option=document.createElement('option');option.value=category;option.textContent=Object.hasOwn(topicLabels,category)?topicLabels[category]:category.replaceAll('-',' ').replace(/^./,letter=>letter.toUpperCase());select.append(option);}
  select.value=categories.includes(selected)?selected:'';
}
function activePhrases(){return (config()?.phrases||[]).filter(phrase=>phrase.vocabularyMode===vocabularyMode);}
function symbolFor(id){return symbols[id.replace(/^3dlex-/,'')]||'✦';}
function motionCaption(mode){return {validated:`VALIDATED VOCABULARY · ${catalog?.capabilities.validatedCount||0} APPROVED CLIPS`,research:'RECORDED ASL RESEARCH · UNVERIFIED',demo:'LEGACY ILLUSTRATIVE DEMO · UNVERIFIED'}[mode];}
function setMotionCaption(mode){$('motion-kind').textContent=motionCaption(mode);$('stage-mode').textContent=motionCaption(mode);}
function feedback(message,error=false){$('feedback').textContent=message;$('feedback').dataset.error=String(error);}
function setConnected(connected){$('service-dot').classList.toggle('online',connected);const label=connected?'Local studio connected':'Server disconnected';if($('service-state').textContent!==label)$('service-state').textContent=label;document.querySelector('.service-indicator').classList.toggle('failed',!connected);$('reconnect').hidden=connected;}
async function api(route,{method='GET',body,retrySession=true,signal}={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  const abort=()=>controller.abort();
  if(signal?.aborted){clearTimeout(timer);throw new DOMException('Request canceled.','AbortError');}
  signal?.addEventListener('abort',abort,{once:true});
  try{
    const response=await fetch('/api'+route,{method,signal:controller.signal,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
    const value=await response.json();
    if(signal?.aborted)throw new DOMException('Request canceled.','AbortError');
    if(response.status===401&&retrySession&&route!=='/session'){await api('/session',{method:'POST',retrySession:false,signal});return api(route,{method,body,retrySession:false,signal});}
    if(!response.ok)throw Object.assign(new Error(value.error||'Request failed.'),{status:response.status,details:value});setConnected(true);return value;
  }catch(error){if(signal?.aborted)throw new DOMException('Request canceled.','AbortError');if(error.name==='AbortError'||error instanceof TypeError){setConnected(false);throw new Error('Cannot reach the local server. Start Sign Studio, then click Reconnect studio.');}throw error;}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
function icon(id){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-'+id);svg.append(use);return svg;}
function empty(parent,message){const element=document.createElement('p');element.className='empty-state';element.textContent=message;parent.append(element);}
function updateCount(){const text=$('message').value,words=wordTokens(text).length;$('char-count').textContent=`${words.toLocaleString()} word${words===1?'':'s'} · ${text.length.toLocaleString()} characters`;updateButtons();}
function updateButtons(){
  $('research-consent').disabled=!catalog||starting;$('sentence-mode').disabled=!catalog||starting;
  const hasQueue=Boolean(lastResult?.sequence.length&&avatar&&queueReady&&!graphicsLost),playing=playerState==='playing',paused=playerState==='paused';
  $('playback-toggle').disabled=!hasQueue||busy;
  $('playback-toggle').textContent=busy?'Loading…':playing?'Ⅱ Pause':paused?'▶ Resume':playerState==='completed'?'↻ Replay':lastResult?.sentencePlan?'▶ Play sequence':'▶ Play';
  $('playback-toggle').setAttribute('aria-label',busy?'Loading animation':playing?'Pause signing':paused?'Resume signing':playerState==='completed'?'Replay signing':'Play signing');
  $('reset-camera').disabled=!avatar; $('fullscreen-avatar').disabled=!avatar; $('reset-preview').disabled=!avatar&&!lastResult&&!requests.active;
  $('replay').disabled=!hasQueue||busy;$('stop-animation').disabled=!hasQueue||!['playing','paused'].includes(playerState);
  $('playback-position').disabled=!hasQueue||busy||!avatar?.seek;
  $('submit').disabled=!catalog||!$('message').value.trim()||(busy&&!requests.active);$('language').disabled=busy||!catalog;$('vocabulary-mode').disabled=busy||!catalog;
  $('cancel-processing').hidden=!requests.active;$('phrase-form').setAttribute('aria-busy',String(busy));
  $('retry-studio').disabled=busy;$('reconnect').disabled=busy;
  $('retry-motion').disabled=busy||!avatar||graphicsLost||!lastResult?.sequence.length;
  $('restart-viewer').disabled=busy||starting;
  document.querySelectorAll('#phrases button,.library-item button').forEach(button=>button.disabled=busy||!avatar);
  document.querySelectorAll('#sense-choices select,#interpretation-panel button').forEach(select=>select.disabled=busy||!catalog);
  for(const button of document.querySelectorAll('#explore-results button'))button.disabled=busy||(!avatar&&button.dataset.output==='avatar');
  $('inspect-selected').disabled=busy||!avatar||!inspectionSelection.length;
  $('inspect-selected').textContent=inspectionSelection.length?`Play queue · ${inspectionSelection.length}`:'Play queue';
  $('clear-inspection').disabled=busy||!inspectionSelection.length;
  const selectedShown=shownInspectionIds.filter(id=>inspectionSelection.includes(id)).length,allShown=shownInspectionIds.length>0&&selectedShown===shownInspectionIds.length;
  $('select-all-inspection').setAttribute('aria-checked',allShown?'true':selectedShown>0?'mixed':'false');$('select-all-inspection').checked=allShown;$('select-all-inspection').indeterminate=selectedShown>0&&!allShown;
  $('select-all-inspection').disabled=Boolean(librarySearchTimer)||busy||!avatar||!shownInspectionIds.length||(!allShown&&selectShownMotions(inspectionSelection,shownInspectionIds,true).limited);
  $('select-all-inspection-label').textContent=`Select all shown${shownInspectionIds.length?` (${shownInspectionIds.length})`:''}`;
  $('return-to-library').hidden=lastResult?.responseType!=='asset-review';
  $('return-to-library').textContent=inspectionOrigin==='explore'?'← Explore ASL':'← Sources & Review';
  $('write-message-link').hidden=lastResult?.responseType==='asset-review';
  document.querySelectorAll('#asset-review-list input,#asset-review-list button,#inspection-selection button').forEach(control=>control.disabled=busy||!avatar);
  $('read-aloud').disabled=!speech?.supported||!($('message').value.trim()||lastResult?.input?.trim());
  $('speech-stop').disabled=!['queued','speaking','paused'].includes(speechState);
  $('microphone').disabled=!catalog||!microphone?.supported||['checking','starting','listening','processing'].includes(micState);
  $('microphone-stop').disabled=!['checking','starting','listening','processing'].includes(micState);
  $('use-transcript').disabled=!$('transcript').value.trim()||['checking','starting','listening','processing'].includes(micState);
  $('camera').disabled=!catalog;
  const proposed=cameraAction(pendingPose,$('camera-choice').value,{demo:$('camera-demo').checked,controls:$('camera-controls').checked,playerState,ready:hasQueue});
  $('camera-confirm').disabled=busy||!proposed.enabled;
  $('camera-confirm').textContent=proposed.label;
  $('camera-choice').disabled=!pendingPose||busy;
  $('camera-dismiss').disabled=!pendingPose;
  const examples=demoExamples(catalog);
  $('try-demo').disabled=!avatar||busy||!examples.length;
  document.querySelectorAll('[data-research-example],#sentence-examples button,#sentence-idea-results button').forEach(button=>button.disabled=!avatar||busy);
  $('review-play').disabled=!hasQueue||busy||playing;
  $('review-play').firstChild.textContent=lastResult?.sentencePlan?.status==='blocked'?'Incomplete message · playback held ':paused?'Resume reviewed preview ':playing?'Preview playing… ':playerState==='completed'?'Replay reviewed preview ':lastResult?.sentencePlan?'Play approximate sequence ':'Play reviewed preview ';
  for(const item of document.querySelectorAll('[data-flow-step]')){
    const step=['playing','paused','completed'].includes(playerState)?'play':lastResult?'review':'write';
    if(item.dataset.flowStep===step)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
  }
  renderDemoReview();
  renderCompleteExpressionStatus();
}
function lock(value){busy=value;updateButtons();}
function setView(name){if(name!=='studio')cancelProcessing({announce:false});if(name!=='studio')stopSentenceVideo();currentView=name;for(const id of ['studio','explore','library','history','about'])$(id+'-view').hidden=id!==name;document.querySelectorAll('.nav-item').forEach(button=>{button.classList.toggle('active',button.dataset.view===name);if(button.dataset.view===name)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(name==='studio'){if(!document.hidden)avatar?.wake();}else{avatar?.suspend();stopCamera();microphone?.abort();}
  if(name==='library'){renderLibrary();renderReadiness();}if(name==='history')renderHistory();if(name==='explore')renderExplore();
}
document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>{setView(button.dataset.view);focusSection($(button.dataset.view+'-view').querySelector('h2'));}));
$('return-to-library').addEventListener('click',()=>{avatar?.pause();speech.stop();setView(inspectionOrigin);focusSection($(inspectionOrigin==='explore'?'explore-search':'library-search'),true);});
$('open-library').addEventListener('click',()=>setView('library'));$('open-history').addEventListener('click',()=>setView('history'));
$('try-demo').addEventListener('click',()=>enterGuidedDemo('3dlex-help'));
$('review-play').addEventListener('click',()=>{if(playerState==='paused'){media.beforeResume();avatar?.resume();speech.resume();}else startPlayback();focusSection($('stage'),true);});
$('review-details').addEventListener('click',()=>focusSection(lastResult?.sentencePlan?$('sentence-plan'):$('interpretation-panel').hidden?document.querySelector('.queue-card h2'):$('interpretation-panel').querySelector('h2')));
function focusSection(element,instant=false){for(let parent=element.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;if(!element.matches('a[href],button,input,select,textarea,summary'))element.tabIndex=-1;element.focus({preventScroll:true});if(element===$('stage'))showSigningSpace();else element.scrollIntoView({block:'center',behavior:instant||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function showSigningSpace(){document.querySelector('.viewer-header').scrollIntoView({block:'start',behavior:'instant'});}
function renderGuidedExamples(){if(catalog)$('research-consent-note').textContent=(catalog.capabilities.readiness.counts.expandedResearchTextMotions||0)+' local source-word previews · ASL review pending.';
  const counts=catalog?.capabilities.readiness.counts;
  const inventory=$('studio-inventory');inventory.replaceChildren();
  if(counts){
    for(const [key,label] of [['uniqueMotionConcepts','concepts with motion'],['aaravCompatible','playable captures'],['expandedResearchTextMotions','opt-in text previews'],['approvedSigns','ASL-approved']]){
      if(inventory.childNodes.length)inventory.append(' \u00b7 ');
      const item=document.createElement('span');item.textContent=`${counts[key]} ${label}`;item.title=catalog.capabilities.readiness.countDefinitions[key];item.tabIndex=0;item.setAttribute('aria-label',item.textContent+'. '+item.title);inventory.append(item);
    }
  }else inventory.textContent='Checking local recordings...';
  $('sentence-examples').replaceChildren();
  for(const example of (catalog?.sentenceExamples||[]).slice(0,4)){const button=document.createElement('button');button.type='button';button.textContent=example.text;button.addEventListener('click',()=>loadSentenceExample(example));$('sentence-examples').append(button);}
  const ideas=(catalog?.sentenceExamples||[]).filter(e=>e.category!=='Quick start');
  $('sentence-ideas').hidden=!ideas.length;$('sentence-ideas-title').textContent=`Browse ${ideas.length} more sentence ideas`;
  $('sentence-idea-category').replaceChildren(new Option('All categories',''));for(const category of [...new Set(ideas.map(e=>e.category))].sort())$('sentence-idea-category').append(new Option(category,category));
  renderSentenceIdeas();
  const examples=demoExamples(catalog);
  for(const id of ['demo-examples','recovery-examples']){
    const host=$(id);host.replaceChildren();
    for(const example of examples){const button=document.createElement('button');button.type='button';button.dataset.researchExample=example.id;button.textContent=example.label;button.title=example.meaning;button.setAttribute('aria-label',`Load ${example.label} research preview`);button.addEventListener('click',()=>enterGuidedDemo(example.id));host.append(button);}
    if(!examples.length)empty(host,'Research examples are unavailable. You can still enter text and inspect its coverage.');
  }
  const capabilities=catalog?.capabilities;
  $('public-preview-count').textContent=String(capabilities?.readiness?.counts.expandedResearchTextMotions||0);
  $('public-motion-count').textContent=String(counts?.aaravCompatible||0);
  $('public-approved-count').textContent=String(counts?.approvedSigns||0);
  $('public-coverage-status').textContent=`${capabilities?.readiness?.counts.expandedResearchTextMotions||0} recordings support opt-in research text previews; ${examples.length} quick examples. ${counts?.aaravCompatible||0} technically playable captures, ${counts?.approvedSigns||0} approved ASL signs. Coverage is not accuracy.`;
  renderReadiness();if(currentView==='explore')renderExplore();
}
async function enterCompleteExpression(option){if(busy)return;setView('studio');selectMode('text');setInput(option.text);$('complete-phrase-only').checked=true;await submit({text:option.text,mode:'text',completePhraseOnly:true,autoPlay:false});if(lastResult?.input===option.text)focusSection($('complete-expression-status'),true);}
function renderCompleteExpressionStatus(){
  const expression=lastResult?.completeExpression,source=catalog?.completeExpressions.find(option=>option.id===expression?.id);
  $('complete-expression-status').textContent=expression?`${expression.text} — ${expression.available?'Complete Aarav expression ready.':source?.sourceVideoURL?'Complete source recording available.':'Aarav’s complete animation is not ready yet.'} ${expression.reason}`:'Sentence options request one complete expression. Current source captures still need Aarav retargeting and ASL review.';
  $('complete-expression-status').classList.toggle('needs-review',Boolean(expression&&!expression.available));
  const canWatch=Boolean(source?.sourceVideoURL&&catalog?.capabilities.readiness?.sourceVideoIds.includes(source.id));
  $('sentence-section').hidden=!canWatch;$('watch-source-sentence').hidden=!canWatch;$('watch-source-sentence').disabled=busy;
  if(source?.sourceVideoBytes)$('watch-source-sentence').textContent=`Watch complete source recording · ${(source.sourceVideoBytes/1024/1024).toFixed(0)} MB`;
}
function stopSentenceVideo(){sentencePlaybackToken++;const video=$('sentence-video'),active=video.hasAttribute('src');video.pause();if(active){video.removeAttribute('src');video.load();}$('source-sentence-player').hidden=true;if(active&&currentView==='studio'&&!document.hidden)avatar?.wake();}
$('watch-source-sentence').addEventListener('click',()=>{
  const option=catalog?.completeExpressions.find(item=>item.id===lastResult?.completeExpression?.id);
  if(!option?.sourceVideoURL||busy||!catalog.capabilities.readiness?.sourceVideoIds.includes(option.id))return;
  stopSentenceVideo();const token=sentencePlaybackToken;
  avatar?.pause();avatar?.suspend();speech.stop();microphone?.abort();stopCamera();
  $('source-sentence-player').hidden=false;$('source-sentence-title').textContent=`Recorded signer: ${option.text}`;
  $('sentence-video-status').textContent='Loading the complete source recording…';
  const attribution=$('sentence-video-attribution');attribution.replaceChildren();
  for(const [url,label] of [[option.sourceURL,option.dataset],[option.licenseURL,option.license]]){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent=label;attribution.append(link,document.createTextNode(' · '));}
  attribution.append(document.createTextNode('2M-Belebele authors · original recording, no edits. Team review pending.'));
  const video=$('sentence-video');video.src=option.sourceVideoURL;
  video.play().catch(()=>{if(token===sentencePlaybackToken&&video.hasAttribute('src'))$('sentence-video-status').textContent='Press Play in the video if playback was blocked. Internet access and a supported video codec are required.';});
  focusSection($('source-sentence-player'),true);
});
$('sentence-video').addEventListener('playing',()=>{avatar?.pause();avatar?.suspend();speech.stop();$('sentence-video-status').textContent='Playing one complete source utterance. This is a recorded signer, not Aarav.';});
$('sentence-video').addEventListener('pause',()=>{const video=$('sentence-video');if(video.hasAttribute('src')&&!video.ended)$('sentence-video-status').textContent='Source recording paused. Use its Play control to continue.';});
$('sentence-video').addEventListener('waiting',()=>{if($('sentence-video').hasAttribute('src'))$('sentence-video-status').textContent='Buffering the source recording… Larger videos may take a moment on this connection.';});
$('sentence-video').addEventListener('error',()=>{if($('sentence-video').hasAttribute('src'))$('sentence-video-status').textContent='The source recording could not load or this codec is unsupported. Retry Watch complete source recording, or choose another sentence. Aarav’s word library remains available.';});
$('close-source-sentence').addEventListener('click',stopSentenceVideo);
function updateSourceTimeline(){
  const video=$('sentence-video'),duration=Number.isFinite(video.duration)?video.duration:0,position=$('sentence-video-position');
  position.disabled=!duration;position.max=String(duration);position.value=String(video.currentTime||0);
  $('sentence-video-time').textContent=`${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  $('sentence-video-diagnostics').textContent=`${video.videoWidth} × ${video.videoHeight} · ${video.getVideoPlaybackQuality?.().totalVideoFrames||0} decoded frames. Source capture/meaning still needs human review.`;
}
for(const event of ['loadedmetadata','loadeddata','timeupdate','seeked','emptied'])$('sentence-video').addEventListener(event,updateSourceTimeline);
$('sentence-video-position').addEventListener('input',()=>{const video=$('sentence-video');video.pause();video.currentTime=Number($('sentence-video-position').value);$('sentence-video-status').textContent='Paused for frame inspection. Use the video’s Play control to resume.';});
$('sentence-video').addEventListener('ended',()=>{$('sentence-video-status').textContent='Complete source recording finished. Use the video’s Play control to replay.';});
async function enterGuidedDemo(id){
  if(busy||!avatar)return;
  const example=demoExamples(catalog).find(item=>item.id===id);
  if(!example){feedback('This example is unavailable. Open the library to check current coverage.',true);return;}
  setView('studio');selectMode('text');setInput(example.text);
  vocabularyMode='research';updateVocabulary();senses={...example.senses};
  $('auto-play').checked=false;$('auto-speak').checked=false;
  feedback('Research preview selected explicitly. We will prepare the recording; you review the meaning and press Play.');
  await submit({text:example.text,mode:'text',autoPlay:false,sentenceMode:false});
  if(lastResult?.input===example.text&&!['playing','paused'].includes(playerState))focusSection($('demo-review'));
}
function renderDemoReview(){
  $('demo-review').hidden=!lastResult;
  if(!lastResult)return;
  $('review-details').textContent=lastResult.sentencePlan?'Review sign plan & missing meanings ↓':'Review interpretation & missing words ↓';
  const original=lastResult.input||'',display=original.length>220?original.slice(0,220)+'… (full original below)':original;
  const text=`Input: “${display}”`;
  if($('review-text').textContent!==text)$('review-text').textContent=text;
  const labels=lastResult.sequence.map(item=>item.label);
  let meaning=labels.length===1?catalog.registry.find(item=>item.id===lastResult.sequence[0].id)?.meaning:'Vocabulary queue: '+labels.slice(0,6).join(' → ')+(labels.length>6?'…':'');
  if(lastResult.sentencePlan)meaning=lastResult.sentencePlan.status==='blocked'?'The entire message is held. Review the missing meanings in Your sign plan.':'Approximate sequence: '+labels.slice(0,8).join(' → ')+(labels.length>8?'…':'')+'. Unreviewed ASL; English source order.';
  else if(lastResult.responseType==='asset-review')meaning='Unverified source recording. Inspect it with the player; this is not sentence translation.';
  else if(!labels.length)meaning='No enabled motion for this message. Review the missing words below; your original meaning has not been replaced.';
  else meaning=(meaning||'Recorded vocabulary preview')+` ${lastResult.vocabularyMode==='validated'?'':'Unverified preview. '}${lastResult.coverage.unsupportedWords?lastResult.coverage.unsupportedWords+' words remain unassigned. ':''}Review the interpretation below before playback.`;
  if($('review-meaning').textContent!==meaning)$('review-meaning').textContent=meaning;
}
$('about-button').addEventListener('click',()=>{setView('about');focusSection($('how-title'));});$('close-about').addEventListener('click',()=>$('about').close());
function clearQueue(){stopSentenceVideo();queueGeneration++;$('motion-recovery').hidden=true;$('avatar-state').textContent=avatar?'Ready':'Loading model';setMotionCaption(vocabularyMode);lastResult=null;queueReady=false;currentIndex=-1;playerState='idle';resetTimeline();$('sequence').replaceChildren();$('gesture-caption').textContent='Build a queue to begin.';$('playback-status').textContent='No queue loaded';$('playback-count').textContent='0 / 0';$('playback-progress').value=0;$('playback-time').textContent='0:00 / 0:00';renderCoverage();updateButtons();}
function updateVocabulary(){
  const phrases=activePhrases();$('phrases').replaceChildren();$('vocabulary-mode').value=vocabularyMode;
  setMotionCaption(vocabularyMode);
  $('vocabulary-status').textContent=catalog?.capabilities.notices?.[vocabularyMode]||'Unreviewed signs stay outside the default vocabulary.';
  $('validation-summary').textContent=`${catalog?.capabilities.validatedCount||0} approved ASL clips`;
  if(!phrases.length){const note=document.createElement('p');note.className='empty-vocabulary';note.textContent='No clip is approved for default use yet. Research and legacy previews remain available through explicit mode selection.';$('phrases').append(note);}
  for(const phrase of phrases.slice(0,9)){const button=document.createElement('button');button.type='button';const mark=document.createElement('span');mark.textContent=symbolFor(phrase.id);const specific=phrase.inspectionOnly?`Inspect ${phrase.label} · unverified`:phrase.requiresSense?`${phrase.label} · ${phrase.senseOptions[0].label}`:phrase.label;button.append(mark,document.createTextNode(specific));button.addEventListener('click',()=>previewPhrase(phrase));$('phrases').append(button);}
  if(phrases.length>9){const more=document.createElement('button');more.textContent=`View all ${phrases.length} assets in the library`;more.addEventListener('click',()=>setView('library'));$('phrases').append(more);}
  if(currentView==='library')renderLibrary();updateButtons();
}
function cancelProcessing({announce=true}={}){if(!requests.cancel())return false;requestMode=null;avatar?.stop();speech?.stop();clearQueue();lock(false);if(announce)feedback('Processing canceled. Your message is still here and can be edited.');return true;}
function setInput(text,origin='text'){stopSentenceVideo();cancelProcessing({announce:false});avatar?.stop();speech.stop();senses={};correctionDecisions={};$('complete-phrase-only').checked=false;clearQueue();$('message').value=text;messageOrigin=origin;updateCount();}
function previewPhrase(phrase){if(phrase.inspectionOnly){inspectMotions([phrase.id]);return;}setInput(phrase.inputText||phrase.label);if(phrase.requiresSense)senses[phrase.meaningKey]=phrase.senseOptions[0].id;submit({text:$('message').value,mode:'text'});}
function inspectionEntry(id){return catalog?.registry.find(entry=>entry.id===id&&entry.motionUrl&&entry.signLanguage==='ASL');}
async function inspectMotions(ids){
  if(busy)return;
  if(!ids.length||ids.some(id=>!inspectionEntry(id))){$('inspection-selection-status').textContent='Choose registered recorded motions before inspection. No substitute motion will be used.';return;}
  inspectionOrigin=currentView==='explore'?'explore':'library';
  const ordered=[...ids],labels=ordered.map(id=>inspectionEntry(id).gloss).join(' · ');
  setView('studio');selectMode('text');setInput(labels);
  feedback(`Loading ${ordered.length===1?inspectionEntry(ordered[0]).gloss:ordered.length+' recordings'}… Playback starts when ready.`);
  focusSection($('stage'),true);
  await submit({mode:'asset-review',animationIds:ordered,autoPlay:true});
}
function renderInspectionSelection(){
  const list=$('inspection-selection');list.replaceChildren();
  for(const [index,id] of inspectionSelection.entries()){
    const entry=inspectionEntry(id);if(!entry)continue;
    const item=document.createElement('li'),label=document.createElement('span'),remove=document.createElement('button');
    label.textContent=`${index+1}. ${entry.gloss.toUpperCase()}`;remove.type='button';remove.className='subtle-button';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${entry.gloss} from inspection queue`);
    remove.addEventListener('click',()=>{inspectionSelection.splice(inspectionSelection.indexOf(id),1);renderInspectionSelection();for(const check of document.querySelectorAll('#asset-review-list input'))check.checked=inspectionSelection.includes(check.value);});
    item.append(label,remove);list.append(item);
  }
  const duration=inspectionSelection.reduce((sum,id)=>sum+(inspectionEntry(id)?.duration||0),0);
  $('inspection-selection-status').textContent=inspectionSelection.length?`${inspectionSelection.length} selected · ${formatTime(duration)} at 1× · plays in selection order. Your selection stays when you search.`:'Choose a motion to watch now, or select recordings below to build a queue.';
  updateButtons();
}
$('inspect-selected').addEventListener('click',()=>inspectMotions(inspectionSelection));
$('select-all-inspection').addEventListener('change',()=>{
  const result=selectShownMotions(inspectionSelection,shownInspectionIds,$('select-all-inspection').checked);
  if(result.limited){renderInspectionSelection();$('inspection-selection-status').textContent=`A queue holds ${inspectionSelectionLimit} motions. Narrow your filters or remove some selections first.`;return;}
  inspectionSelection.splice(0,inspectionSelection.length,...result.ids);renderInspectionSelection();
  for(const check of document.querySelectorAll('#asset-review-list input'))check.checked=inspectionSelection.includes(check.value);
});
$('clear-inspection').addEventListener('click',()=>{inspectionSelection.length=0;renderInspectionSelection();for(const check of document.querySelectorAll('#asset-review-list input'))check.checked=false;});

function applyLanguage(){senses={};correctionDecisions={};const item=config();avatar?.setLanguage(item.avatar);speech?.stop();$('avatar-name').textContent='Aarav';$('avatar-description').textContent=`${item.label.split(' · ').at(-1)} labels · signed language: ASL`;$('avatar-state').textContent=avatar?'Ready':'Loading model';clearQueue();
  $('message').placeholder='Type English here, or choose a research example below…';updateVocabulary();if(speech)renderVoices(speech.getVoices(item.locale));feedback('Start with a research example to prepare a recorded motion. The default validated mode currently has no approved signs.');updateButtons();
}
async function changeLanguage(value){if(busy)return;microphone?.abort();const old=language;lock(true);try{await api('/session',{method:'PATCH',body:{language:value}});language=value;$('language').value=value;applyLanguage();}catch(error){$('language').value=old;feedback(error.message,true);}finally{lock(false);}}
function step(index,item){currentIndex=index;renderCurrent();document.querySelectorAll('#sentence-units [data-sequence-index]').forEach(e=>e.classList.toggle('current',Number(e.dataset.sequenceIndex)===index));document.querySelectorAll('#queue-items li').forEach(element=>element.classList.toggle('current',Number(element.dataset.index)===index));
  if(lastResult?.sentencePlan&&index>=sentenceLimit){sentenceLimit=index+40;renderSentencePlan();}
  if(index>=queueLimit){queueLimit=Math.min(lastResult?.sequence.length||0,index+40);renderQueue();}
}
function renderCurrent(){const items=lastResult?.sequence||[],item=items[currentIndex];$('gesture-caption').textContent=item?((item.sourceText||'').toLocaleLowerCase()===item.label.toLocaleLowerCase()?item.label:`${item.sourceText||item.label} → ${item.label}`):items.length?'Queue ready. Press Play.':'No approved motion for this input in the selected mode.';$('sequence').replaceChildren();
  if(item){const chip=document.createElement('span');chip.className='current';chip.textContent=item.label;const count=document.createElement('span');count.className='queue-counter';count.textContent=lastResult.responseType==='asset-review'?`Inspection motion ${currentIndex+1} of ${items.length}`:`Phrase ${currentIndex+1} of ${items.length} · source word${item.endWordIndex-item.startWordIndex>1?'s':''} ${(item.startWordIndex??0)+1}–${item.endWordIndex??1}`;$('sequence').append(chip,count);}
}
function progress(state){
  if(!lastResult)return;playerState=state.state;const total=lastResult.sequence.length;
  $('avatar-state').textContent={playing:'Playing',paused:'Paused',completed:'Complete',idle:'Ready'}[playerState]||'Ready';
  $('playback-status').textContent={playing:lastResult.responseType==='asset-review'?'Inspecting selected motions':'Playing available prototype motions',paused:'Playback paused',completed:'Queue complete',idle:total?'Queue ready':'No clips available'}[playerState]||'Ready';
  $('playback-count').textContent=`${state.state==='completed'?total:state.length?state.index+1:0} / ${total}`;
  $('playback-progress').value=Math.round((state.progress||0)*10000)/100;
  $('playback-time').textContent=`${formatTime(state.queueElapsed)} / ${formatTime(state.totalDuration||lastResult.duration)}`;updateTimeline(state.queueElapsed,state.totalDuration||lastResult.duration);updateButtons();
}
function finished(event){if(!lastResult)return;if(event?.reason==='completed'){playerState='completed';$('avatar-state').textContent='Complete';$('playback-status').textContent='Queue complete';$('playback-progress').value=100;$('playback-count').textContent=`${lastResult.sequence.length} / ${lastResult.sequence.length}`;}else if(event?.reason==='stopped'){playerState='stopped';$('avatar-state').textContent='Ready';}updateButtons();}
function startPlayback({speak=true}={}){stopSentenceVideo();if(!avatar||graphicsLost||!lastResult?.sequence.length||!queueReady)return;media.beforePlayback();try{playerState='playing';avatar.play(lastResult.sequence);if(speak&&$('auto-speak').checked)speakMessage(lastResult.input,true);}catch(error){playerState='error';showMotionError(error.message);feedback(`Playback could not start: ${error.message}`,true);}updateButtons();}
function showMotionError(message){$('motion-error-message').textContent=message;$('motion-recovery').hidden=false;}
async function retryMotion(){
  if(busy||!avatar||!lastResult?.sequence.length)return;
  const result=lastResult;media.beforePlayback();avatar.stop();const operation=requests.start(),generation=++queueGeneration;
  lock(true);try{await loadResult(result,false,generation,operation.signal);}finally{if(requests.finish(operation))lock(false);}
}
$('retry-motion').addEventListener('click',retryMotion);
function renderState(state){
  graphicsLost=state.status==='lost';$('graphics-recovery').hidden=!graphicsLost;
  if(graphicsLost){speech?.stop();microphone?.abort();$('avatar-state').textContent='Graphics paused';feedback('The 3D graphics context was interrupted. Your text and queue are preserved. Wait for recovery or restart the viewer.',true);}
  else feedback('The 3D viewer recovered. Review the queue and press Resume or Play when ready.');
  updateButtons();
}
$('restart-viewer').addEventListener('click',async()=>{
  if(busy||starting)return;
  const result=lastResult,selectedSenses={...senses},decisions={...correctionDecisions};media.beforePlayback();avatar?.dispose();avatar=null;graphicsLost=false;$('graphics-recovery').hidden=true;
  await initialize();
  senses=selectedSenses;correctionDecisions=decisions;
  if(result&&avatar){const generation=++queueGeneration;lock(true);try{await loadResult(result,false,generation);}finally{lock(false);}}
});
async function loadResult(result,autoPlay=$('auto-play').checked,generation=queueGeneration,signal){if(generation!==queueGeneration)return;setMotionCaption(result.vocabularyMode);if(result.responseType==='asset-review'){$('stage-mode').textContent='ASSET INSPECTION · UNVERIFIED';$('motion-kind').textContent='MANUAL INSPECTION · NOT TEXT TRANSLATION';}lastResult=result;sentenceLimit=60;queueReady=false;queueLimit=80;termLimit=60;sourceLimit=400;conceptLimit=80;meaningLimit=20;currentIndex=-1;playerState='ready';resetTimeline();updateTimeline(0,result.duration);$('playback-progress').value=0;$('playback-count').textContent=`0 / ${result.sequence.length}`;$('playback-time').textContent=`0:00 / ${formatTime(result.duration)}`;$('playback-status').textContent=result.sequence.length?'Preparing selected motions…':'No motion assigned';renderCurrent();renderCoverage();updateButtons();
  $('motion-recovery').hidden=true;
  try{if(result.sequence.some(item=>item.motionUrl)){if(!avatar?.prepare)throw Error('The 3D viewer is unavailable. Your coverage is ready below. Reconnect the studio to enable motion playback.');$('avatar-state').textContent='Loading motion data';await avatar.prepare(result.sequence,{signal});}if(generation!==queueGeneration||signal?.aborted)return;queueReady=true;$('avatar-state').textContent=graphicsLost?'Graphics paused':avatar?'Ready':'Viewer unavailable';$('playback-status').textContent=result.sequence.length?'Queue ready':'No motion assigned';}catch(error){if(generation!==queueGeneration||signal?.aborted)return;playerState='error';$('avatar-state').textContent='Motion unavailable';$('playback-status').textContent='Motion preparation failed';showMotionError(error.message);feedback(error.message,true);updateButtons();return;}
  const c=result.coverage;
  if(result.completePhraseOnly)$('complete-phrase-only').checked=true;
  feedback(result.sentencePlan?(result.sentencePlan.status==='blocked'?'Playback held. Your sign plan explains the missing meanings.':'Plan ready. Review the sequence, then press Play.'):result.completeExpression&&!result.completeExpression.available?result.completeExpression.reason:result.responseType==='asset-review'?`${result.sequence.length} recordings prepared for manual inspection. This does not translate a sentence.`:result.sequence.length?`${c.supportedPhrases} motion${c.supportedPhrases===1?'':'s'} ready for review; ${c.unsupportedWords} words remain unassigned. ${result.vocabularyMode==='validated'?'':'These previews are unverified. '}${autoPlay?'Your optional playback preference is enabled.':'Press Play after reviewing the meaning.'}`:`No enabled motion for these ${c.totalWords} words in ${result.vocabularyMode} mode. Your text is unchanged. Review the missing vocabulary below or try a labelled research example.`);
  if(autoPlay&&result.sequence.length){startPlayback({speak:result.responseType!=='asset-review'});showSigningSpace();}updateButtons();
}
async function submit(input){if(busy&&!requests.active){feedback('Studio settings are loading. Please wait.');return;}if(!catalog){feedback('The vocabulary catalog is still loading. Please wait.',true);return;}const text=input.text;if(!['camera','asset-review'].includes(input.mode)){
  if(!text?.trim()){feedback('Enter a message before building a queue.',true);return;}
  if(text.length>(catalog.capabilities.maxInput||100000)||wordTokens(text).length>(catalog.capabilities.maxWords||10000)){feedback('Use at most 10,000 words and 100,000 characters. Your text has not been truncated.',true);return;}
  }
  stopSentenceVideo();cancelProcessing({announce:false});microphone?.abort();avatar?.stop();speech.stop();const operation=requests.start(),generation=++queueGeneration;requestMode=input.mode;lock(true);feedback(input.mode==='asset-review'?'Preparing selected recordings for manual inspection…':'Checking vocabulary coverage… You can cancel or edit your message.');
  try{const selectedMode=input.mode==='camera'?($('camera-demo').checked?'demo':'validated'):vocabularyMode;const result=await api('/translations',{method:'POST',signal:operation.signal,body:{...input,sentenceMode:input.sentenceMode??(!['camera','asset-review'].includes(input.mode)&&language==='en'&&selectedMode!=='demo'&&$('sentence-mode').checked),researchPreviewConsent:!['camera','asset-review'].includes(input.mode)&&selectedMode==='research'&&$('research-consent').checked,completePhraseOnly:input.completePhraseOnly??(!['camera','asset-review'].includes(input.mode)&&$('complete-phrase-only').checked),language,vocabularyMode:selectedMode,senses:{...senses},correctionDecisions:{...correctionDecisions}}});if(generation!==queueGeneration||!requests.isCurrent(operation))return;if(input.mode==='camera'&&result.vocabularyMode==='demo'&&!$('camera-demo').checked)return;await loadResult(result,input.autoPlay??$('auto-play').checked,generation,operation.signal);if(requests.isCurrent(operation))await loadHistory();}catch(error){if(generation===queueGeneration&&!operation.signal.aborted)feedback(error.message,true);}finally{if(requests.finish(operation)){requestMode=null;lock(false);}}
}
$('phrase-form').addEventListener('submit',event=>{event.preventDefault();submit({text:$('message').value,mode:messageOrigin});});$('message').addEventListener('input',()=>{$('complete-phrase-only').checked=false;cancelProcessing({announce:false});senses={};correctionDecisions={};avatar?.stop();speech.stop();clearQueue();messageOrigin='text';updateCount();});$('language').addEventListener('change',()=>changeLanguage($('language').value));
$('cancel-processing').addEventListener('click',()=>cancelProcessing());
$('complete-phrase-only').addEventListener('change',()=>{cancelProcessing({announce:false});avatar?.stop();speech.stop();clearQueue();feedback($('complete-phrase-only').checked?'Complete sentence only selected. We will hold individual word clips.':'Vocabulary preview selected. Missing coverage stays visible.');});
$('message').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&!event.isComposing){event.preventDefault();submit({text:$('message').value,mode:messageOrigin});}});
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{setView('studio');selectMode('text');setInput(button.dataset.example);feedback('Example loaded. Edit the text, then check coverage in your chosen vocabulary mode.');$('message').focus();}));
$('research-consent').addEventListener('change',()=>{cancelProcessing({announce:false});avatar?.stop();speech.stop();vocabularyMode=$('research-consent').checked?'research':'validated';senses={};clearQueue();updateVocabulary();feedback($('research-consent').checked?'Research opt-in enabled. Matching source-word recordings may be queued; meanings and ASL grammar are unverified.':'Research opt-in disabled. Default approved vocabulary restored.');});
$('vocabulary-mode').addEventListener('change',()=>{if($('vocabulary-mode').value!=='research')$('research-consent').checked=false;avatar?.stop();speech.stop();vocabularyMode=$('vocabulary-mode').value;senses={};correctionDecisions={};clearQueue();updateVocabulary();feedback(catalog.capabilities.notices[vocabularyMode]);});
$('sample-long').addEventListener('click',()=>{setInput(Array.from({length:100},()=>vocabularyMode==='demo'?'Hello, thank you, unknown help.':'Yes. Help. No. Love. unknown.').join(' '));feedback('Loaded exactly 500 words. Build the queue, then review meanings. No and Love are isolated lexical items, not a negative sentence.');});
$('playback-toggle').addEventListener('click',()=>{if(playerState==='playing'){avatar?.pause();speech.pause();}else if(playerState==='paused'){media.beforeResume();avatar?.resume();speech.resume();}else startPlayback();});$('replay').addEventListener('click',startPlayback);
function seekPlayback(){if(busy||!queueReady||!lastResult?.sequence.length||!avatar?.seek)return;const position=Number($('playback-position').value);speech.stop();if(!avatar.getState().length){avatar.play(lastResult.sequence);avatar.pause();}avatar.seek(position);}
function finishSeek(){if(!seekDragging)return;seekDragging=false;if(resumeAfterSeek&&!busy&&queueReady)avatar?.resume();resumeAfterSeek=false;const state=avatar?.getState();if(state&&lastResult)updateTimeline(state.queueElapsed,state.totalDuration||lastResult.duration);}
$('playback-position').addEventListener('pointerdown',()=>{if($('playback-position').disabled)return;seekDragging=true;resumeAfterSeek=playerState==='playing';avatar?.pause();speech.stop();});
$('playback-position').addEventListener('input',seekPlayback);$('playback-position').addEventListener('change',finishSeek);$('playback-position').addEventListener('blur',finishSeek);window.addEventListener('pointerup',finishSeek);window.addEventListener('pointercancel',finishSeek);
$('stop-animation').addEventListener('click',()=>{seekDragging=resumeAfterSeek=false;avatar?.stop();speech.stop();playerState='stopped';currentIndex=-1;$('playback-status').textContent='Stopped · queue retained for replay';$('playback-count').textContent=`0 / ${lastResult?.sequence.length||0}`;$('playback-progress').value=0;$('playback-time').textContent=`0:00 / ${formatTime(lastResult?.duration)}`;updateTimeline(0,lastResult?.duration);renderCurrent();updateButtons();});
for(const id of ['playback-toggle','replay','stop-animation'])$(id).addEventListener('click',showSigningSpace);
$('speed').addEventListener('change',async()=>{avatar?.setSpeed(Number($('speed').value));try{await api('/session',{method:'PATCH',body:{speed:Number($('speed').value)}});}catch(error){feedback(`Speed changed locally. ${error.message}`,true);}});
function renderQueue(){const list=$('queue-items');list.replaceChildren();const items=lastResult?.sequence||[];if(!items.length){const li=document.createElement('li');li.className='queue-empty';li.textContent=lastResult?'No available motion. Missing coverage is listed alongside.':'No queue yet.';list.append(li);}else items.slice(0,queueLimit).forEach((item,index)=>{
  const li=document.createElement('li');li.dataset.index=String(index);li.classList.toggle('current',index===currentIndex);const number=document.createElement('span');number.className='order';number.textContent=String(index+1);const content=document.createElement('div');const title=document.createElement('strong');title.textContent=item.label;const source=document.createElement('small');source.textContent=lastResult.responseType==='asset-review'?`Source asset gloss: “${item.sourceText}”`:`“${item.sourceText}” · source words ${item.startWordIndex+1}–${item.endWordIndex}`;content.append(title,source);const status=document.createElement('span');status.className='validation';status.textContent=lastResult.responseType==='asset-review'?'Inspection only':item.validated?'Approved':item.motionUrl?'Research · unverified':'Legacy demo';li.append(number,content,status);list.append(li);
  });$('more-queue').hidden=items.length<=queueLimit;$('more-queue').textContent=`Show more · ${Math.min(queueLimit,items.length)} of ${items.length} phrases displayed`;
}
function renderTerms(){const element=$('unsupported-items');element.replaceChildren();const terms=lastResult?.unsupportedTerms||[];
  if(lastResult&&!terms.length){const chip=document.createElement('span');chip.className='all-covered';chip.textContent=lastResult.responseType==='asset-review'?'Selected assets resolved; no sentence translated.':'No missing terms in this message.';element.append(chip);}else terms.slice(0,termLimit).forEach(term=>{const chip=document.createElement('span');chip.textContent=`${term.term}${term.count>1?` ×${term.count}`:''}`;const reasons=[...new Set(lastResult.unsupported.filter(item=>term.wordIndices.includes(item.wordIndex)).map(item=>item.reason))];chip.title=`${reasons.join(', ')}. Source word positions: ${term.wordIndices.map(index=>index+1).join(', ')}`;element.append(chip);});
  $('more-unsupported').hidden=terms.length<=termLimit;$('more-unsupported').textContent=`Show more · ${Math.min(termLimit,terms.length)} of ${terms.length} terms displayed`;
}
function renderSource(){const element=$('source-preview');element.replaceChildren();if(!lastResult){element.textContent='Your original text will appear here.';$('more-source').hidden=true;$('source-preview-note').textContent='';return;}const input=lastResult.input,entries=lastResult.timeline||[],limit=Math.min(entries.length,sourceLimit);let offset=0;
  for(const entry of entries.slice(0,limit)){element.append(document.createTextNode(input.slice(offset,entry.startChar)));const span=document.createElement('span');span.className=entry.type==='supported'?'known':'missing';span.textContent=input.slice(entry.startChar,entry.endChar);span.title=entry.type==='supported'?(lastResult.vocabularyMode==='research'?'Recorded ASL research preview; human approval absent':lastResult.vocabularyMode==='demo'?'Illustrative legacy demo; not validated ASL':'Approved vocabulary motion'):`No assigned motion: ${entry.reason||'missing coverage'}`;element.append(span);offset=entry.endChar;}
  if(limit===entries.length)element.append(document.createTextNode(input.slice(offset)));$('more-source').hidden=limit===entries.length;
  $('source-preview-note').textContent=lastResult.responseType==='asset-review'?`Showing ${limit} of ${entries.length} registered source glosses in manual inspection order. These labels are not translated sentence text.`:limit<entries.length?`Showing ${limit} of ${entries.length} coverage entries. The full original message is retained in the input, history, and export.`:`All ${entries.length} coverage entries shown. Original punctuation and spacing are preserved.`;
}
function renderCoverage(){const panel=document.querySelector('.queue-card');panel.dataset.hasResult=String(Boolean(lastResult));panel.dataset.inspection=String(lastResult?.responseType==='asset-review');const metrics=$('coverage-metrics');metrics.replaceChildren();const c=lastResult?.coverage;panel.dataset.hasMissing=String(Boolean(c?.unsupportedWords));$('coverage-summary').textContent=lastResult?.responseType==='asset-review'?`${lastResult.sequence.length} selected recordings ready for manual inspection. The gloss labels identify assets; this queue is not a sentence translation or an accuracy score.`:c?`${c.supportedWords} of ${c.totalWords} source words have motions in ${lastResult.vocabularyMode} mode. This count does not measure sign accuracy.`:'Process a message to see available motions and missing terms.';$('unsupported-count').textContent=String(c?.unsupportedWords||0);
  $('coverage-recovery').hidden=!c?.unsupportedWords||lastResult?.responseType==='asset-review';
  if(c)for(const[number,label]of (lastResult.responseType==='asset-review'?[[c.supportedPhrases,'Selected motions'],[c.totalWords,'Source gloss words']]:[[c.totalWords,'Input words'],[c.supportedPhrases,'Queued motions'],[c.unsupportedWords,'Unassigned words'],[c.supportedWords,'Words with motions']])){const card=document.createElement('div'),strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=String(number);span.textContent=label;card.append(strong,span);metrics.append(card);}
  renderSentencePlan();renderQueue();renderTerms();renderSource();renderSenses();renderInterpretation();renderPhraseSupport();
}
function renderPhraseSupport(limit=20){
 const phrases=lastResult?.phraseReadiness||[];$('phrase-support').hidden=!phrases.length;const list=$('phrase-support-items');list.replaceChildren();
 const complete=phrases.filter(p=>p.completeTranslation).length;$('phrase-support-summary').textContent=`${complete} of ${phrases.length} input segments have a complete reviewed phrase translation. Word previews do not count as translated phrases.`;
 for(const p of phrases.slice(0,limit)){const row=document.createElement('article'),title=document.createElement('strong'),status=document.createElement('p'),preview=document.createElement('p');title.textContent=`“${p.sourceText}”`;status.textContent=p.reason;preview.textContent=p.previewLabels.length?'Available preview: '+p.previewLabels.join(' → '):'Available preview: none';row.append(title,status,preview);
  if(p.missingTerms.length){const missing=document.createElement('p'),reasons={'protected-name':'name preserved; fingerspelling unavailable','negation-template-required':'held with negative clause','ambiguous':'meaning needs selection','ambiguous-concept':'meaning needs selection','alias-or-inflection-review-required':'mapping awaiting review','pending-validation':'not approved in validated mode','not-in-selected-mode':'unavailable in selected mode','linguistic-review-required':'motion awaiting review'};missing.textContent='Not played: '+p.missingTerms.map(w=>w.term+' ('+(reasons[w.reason]||(w.inspectionAssetIds.length?'motion awaiting review':'no enabled motion'))+')').join(', ');row.append(missing);}
  if(!p.completeTranslation){const next=document.createElement('small');next.textContent=p.templateReview==='pending'?'A candidate phrase template exists, but its mapping and complete motion sequence need ASL review.':'Next requirement: a reviewed complete phrase animation or ASL sentence template with approved motions.';row.append(next);}list.append(row);
 }
 $('more-phrase-support').hidden=phrases.length<=limit;$('more-phrase-support').textContent=`Show more · ${Math.min(limit,phrases.length)} of ${phrases.length} segments`; $('more-phrase-support').onclick=()=>renderPhraseSupport(limit+20);
}
async function loadSentenceExample(example){
  if(busy)return;
  $('sentence-ideas').open=false;
  if(language!=='en')await changeLanguage('en');
  if(language!=='en')return;
  setView('studio');selectMode('text');setInput(example.text);$('sentence-mode').checked=true;
  if($('research-consent').checked){await submit({text:example.text,mode:'text',autoPlay:false,sentenceMode:true});focusSection($('demo-review'));}
  else{feedback('Example loaded. Enable unreviewed research recordings, then build the plan. Nothing plays automatically.');focusSection($('research-consent'));}
}
function renderSentenceIdeas(){
  const query=$('sentence-idea-search').value.trim().toLowerCase(),category=$('sentence-idea-category').value;
  const rows=(catalog?.sentenceExamples||[]).filter(e=>e.category!=='Quick start'&&(!category||e.category===category)&&(!query||[e.text,...e.alternativeTexts].some(t=>t.toLowerCase().includes(query))));
  sentenceIdeaRows=rows;
  const host=$('sentence-idea-results'),scrollTop=host.scrollTop;host.replaceChildren();
  $('sentence-idea-count').textContent=`${rows.length} matching ideas · ${catalog?.sentenceExamples.length||0} checked plans in total · ASL review pending`;
  for(const example of rows.slice(0,sentenceIdeaLimit)){
    const button=document.createElement('button');button.type='button';button.className='sentence-idea';
    const label=document.createElement('strong'),meta=document.createElement('span');label.textContent=example.text;meta.textContent=`${example.category} · ${example.motionIds.length} clips · Load plan`;
    button.append(label,meta);button.addEventListener('click',()=>loadSentenceExample(example));button.disabled=busy||!avatar;host.append(button);
  }
  if(!rows.length)empty(host,'No matching sentence idea. Change the search/category, or type your own message for a coverage check.');
  host.scrollTop=scrollTop;
  $('sentence-idea-more').hidden=rows.length<=sentenceIdeaLimit;$('sentence-idea-more').textContent=`Show more · ${Math.min(sentenceIdeaLimit,rows.length)} of ${rows.length}`;
}
for(const id of ['sentence-idea-search','sentence-idea-category'])$(id).addEventListener(id.endsWith('search')?'input':'change',()=>{sentenceIdeaLimit=12;$('sentence-idea-results').scrollTop=0;renderSentenceIdeas();});
$('sentence-idea-search').addEventListener('keydown',event=>{if(event.key==='Enter')event.preventDefault();});
$('sentence-idea-more').addEventListener('click',()=>{sentenceIdeaLimit+=12;renderSentenceIdeas();});
// Append only the next batch near the bottom; retain existing focused cards.
$('sentence-idea-results').addEventListener('scroll',()=>{
  const host=$('sentence-idea-results');
  if(host.scrollHeight-host.scrollTop-host.clientHeight>90||sentenceIdeaLimit>=sentenceIdeaRows.length)return;
  const start=sentenceIdeaLimit;sentenceIdeaLimit+=12;
  for(const example of sentenceIdeaRows.slice(start,sentenceIdeaLimit)){
    const button=document.createElement('button');button.type='button';button.className='sentence-idea';
    const label=document.createElement('strong'),meta=document.createElement('span');label.textContent=example.text;meta.textContent=`${example.category} · ${example.motionIds.length} clips · Load plan`;
    button.append(label,meta);button.addEventListener('click',()=>loadSentenceExample(example));button.disabled=busy||!avatar;host.append(button);
  }
  $('sentence-idea-more').hidden=sentenceIdeaRows.length<=sentenceIdeaLimit;
  $('sentence-idea-more').textContent=`Show more · ${Math.min(sentenceIdeaLimit,sentenceIdeaRows.length)} of ${sentenceIdeaRows.length}`;
},{passive:true});
function renderSentencePlan(){
  const plan=lastResult?.sentencePlan,panel=document.querySelector('.queue-card');panel.dataset.sentence=String(Boolean(plan));$('sentence-plan').hidden=!plan;
  if(!plan){$('sentence-units').replaceChildren();return;}
  const c=plan.coverage,blocked=plan.status==='blocked';
  $('sentence-plan-status').textContent=blocked?'Incomplete meaning · playback held':'Approximate sign sequence';
  $('sentence-plan').dataset.status=plan.status;$('sentence-plan-summary').textContent=plan.summary;
  $('sentence-original').textContent=lastResult.input;
  $('sentence-question-note').hidden=!plan.clauses.some(c=>c.question);$('sentence-question-note').textContent='Question intent retained. Manual word previews do not supply validated ASL question facial/body grammar.';
  $('coverage-summary').textContent=`${c.availableConcepts} of ${c.totalConcepts} meaning units have enabled clips. ${c.missingConcepts} need attention. This measures lexical coverage, not ASL accuracy.`;
  const metrics=$('coverage-metrics');metrics.replaceChildren();
  for(const [number,label]of [[c.totalConcepts,'Meaning units'],[c.availableConcepts,'Available'],[c.missingConcepts,'Missing'],[c.queuedConcepts,'Queued clips']]){const card=document.createElement('div'),strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=number;span.textContent=label;card.append(strong,span);metrics.append(card);}
  const list=$('sentence-units');list.replaceChildren();let sequenceIndex=0;
  for(const unit of plan.units.slice(0,sentenceLimit)){
    const item=document.createElement('li'),label=document.createElement('strong'),status=document.createElement('span'),reason=document.createElement('p');item.className='sentence-unit '+unit.status;
    label.textContent=unit.sourceText.toLowerCase()===unit.label.toLowerCase()?unit.label:unit.sourceText+' → '+unit.label;
    status.textContent=unit.status==='missing'?'Missing meaning':blocked?'Available clip · held':'Unreviewed clip';reason.textContent=unit.status==='missing'?unit.reason:unit.normalization||'';
    if(!blocked&&unit.status==='available'){item.dataset.sequenceIndex=String(sequenceIndex++);item.classList.toggle('current',Number(item.dataset.sequenceIndex)===currentIndex);}
    item.append(label,status);if(reason.textContent)item.append(reason);list.append(item);
  }
  $('sentence-more').hidden=sentenceLimit>=plan.units.length;$('sentence-more').textContent=`Show more · ${Math.min(sentenceLimit,plan.units.length)} of ${plan.units.length} meaning units`;
  const notes=$('sentence-notes');notes.replaceChildren();
  for(const note of [...new Set([...plan.limitations,...plan.clauses.flatMap(c=>c.notes),...plan.grammarNotes.slice(0,30).map(n=>`“${n.sourceText}”: ${n.explanation}`)])]){const p=document.createElement('p');p.textContent=note;notes.append(p);}
  if(plan.grammarNotes.length>30){const p=document.createElement('p');p.textContent=`${plan.grammarNotes.length-30} further grammar notes are retained in the saved plan.`;notes.append(p);}
}
$('sentence-more').addEventListener('click',()=>{sentenceLimit+=60;renderSentencePlan();});
$('sentence-mode').addEventListener('change',()=>{cancelProcessing({announce:false});avatar?.stop();speech.stop();clearQueue();feedback($('sentence-mode').checked?'Whole-message planning enabled. Missing essential meaning holds playback.':'Isolated-word preview mode selected. Partial clips are not sentence translation.');});
function renderInterpretation(){
 const data=lastResult?.interpretation;$('interpretation-panel').hidden=!data;if(!data)return;
 $('review-original').textContent=lastResult.input;
 $('interpreted-text').textContent=data.interpretedText;const changed=data.corrections.filter(c=>c.applied).length;$('interpretation-summary').textContent=`Original text is preserved. ${changed} spelling correction${changed===1?'':'s'} applied. Concept recognition and ASL approval are separate.`;
 const fixes=$('correction-items');fixes.replaceChildren();for(const c of data.corrections){const row=document.createElement('div'),label=document.createElement('span'),button=document.createElement('button');label.textContent=c.applied?`“${c.original}” → “${c.proposed}” · ${c.basis}`:`“${c.original}” unchanged · candidate “${c.proposed}”`;button.className='control-button';button.textContent=c.applied?'Undo & rebuild':`Apply ${c.proposed} & rebuild`;button.disabled=busy||!avatar;button.addEventListener('click',()=>{correctionDecisions[c.wordIndex]=c.applied?'keep':c.proposed;submit({text:$('message').value,mode:messageOrigin,autoPlay:false});});row.append(label,button);fixes.append(row);}
 const planning=$('planning-notes');planning.replaceChildren();for(const held of data.heldClauses){const note=document.createElement('p');note.textContent=`Playback held for source words ${held.wordIndices[0]+1}–${held.wordIndices.at(-1)+1}: ${held.reason}`;planning.append(note);}
 if(!data.heldClauses.length){const note=document.createElement('p');note.textContent='No approved complete-sentence template is available for this result. Any lexical previews are a prototype, not grammatical ASL.';planning.append(note);}
 const list=$('concept-items');list.replaceChildren();for(const r of data.resolutions.slice(0,conceptLimit)){const row=document.createElement('article'),strong=document.createElement('strong'),meta=document.createElement('small');strong.textContent=`“${r.sourceText}” → ${r.status==='ambiguous'?'meaning needs clarification':r.label}`;meta.textContent=r.status==='ambiguous'?'No concept or motion was chosen.':`${r.conceptId} · ${r.sense} · ${r.basis} · ${r.mappingReviewed?'mapping reviewed':'ASL mapping pending review'}${r.inflection?' · inflection/tense retained, no automatic base-sign substitution':''}`;row.append(strong,meta);list.append(row);}
 if(!data.resolutions.length)empty(list,'No recognized concept candidate. Names, numbers, and unknown words remain unchanged and unsupported.');$('more-concepts').hidden=data.resolutions.length<=conceptLimit;$('more-concepts').textContent=`Show more · ${Math.min(conceptLimit,data.resolutions.length)} of ${data.resolutions.length} concept matches`;
}
$('edit-interpretation').addEventListener('click',()=>{if(lastResult?.interpretation){const text=lastResult.interpretedText;setInput(text);feedback('Interpreted text copied for editing. The previous original and interpretation remain in history.');$('message').focus();}});
$('more-concepts').addEventListener('click',()=>{conceptLimit+=80;renderInterpretation();});
$('more-meanings').addEventListener('click',()=>{meaningLimit+=20;renderSenses();});
function renderSenses(){const host=$('sense-choices');host.replaceChildren();const choices=new Map((lastResult?.ambiguousTerms||[]).map(item=>[item.meaningKey,item]));for(const motion of lastResult?.responseType==='asset-review'?[]:lastResult?.sequence||[]){const entry=catalog.registry.find(item=>item.id===motion.id&&item.requiresSense);if(entry)choices.set(entry.meaningKey,{term:motion.sourceText,meaningKey:entry.meaningKey,senses:entry.senseOptions});}for(const r of lastResult?.interpretation?.resolutions||[]){if(r.candidateSenses?.length>1)choices.set(r.meaningKey,{...choices.get(r.meaningKey),term:r.sourceText,meaningKey:r.meaningKey,senses:r.candidateSenses,selectedConcept:r.conceptId,wordIndex:r.startWordIndex});}$('sense-review').hidden=!choices.size;$('more-meanings').hidden=choices.size<=meaningLimit;$('more-meanings').textContent=`Show more · ${Math.min(meaningLimit,choices.size)} of ${choices.size} meaning choices`;
  for(const [key,item] of [...choices].slice(0,meaningLimit)){const label=document.createElement('label');label.textContent=`“${item.term}”${item.wordIndex!==undefined?` · source word ${item.wordIndex+1}`:''} means `;const select=document.createElement('select');select.setAttribute('aria-label',`Meaning of ${key}`);const pending=document.createElement('option');pending.value='';pending.textContent='Unselected · no motion';select.append(pending);for(const sense of item.senses){const option=document.createElement('option');option.value=sense.id;option.textContent=sense.label;select.append(option);}select.value=senses[key]||item.selectedConcept||'';select.disabled=busy||!avatar;select.addEventListener('change',()=>{if(select.value)senses[key]=select.value;else delete senses[key];queueGeneration++;avatar?.stop();speech.stop();queueReady=false;feedback('Meaning choice saved. Rebuild the queue to apply it. Existing playback is disabled until then.');updateButtons();});label.append(select);host.append(label);}
}
$('more-queue').addEventListener('click',()=>{queueLimit+=100;renderQueue();});$('more-unsupported').addEventListener('click',()=>{termLimit+=100;renderTerms();});$('more-source').addEventListener('click',()=>{sourceLimit=Infinity;renderSource();});
function renderVoices(voices){const select=$('speech-voice'),old=select.value;select.replaceChildren();const fallback=document.createElement('option');fallback.value='';fallback.textContent='Automatic recommended voice';select.append(fallback);for(const voice of voices){const option=document.createElement('option');option.value=voice.voiceURI;option.textContent=`${voice.name} · ${voice.lang}${voice.localService?' · installed':' · browser / online'}`;select.append(option);}select.value=manualVoice&&(old===''||voices.some(v=>v.voiceURI===old))?old:(voices[0]?.voiceURI||'');select.disabled=Boolean(speech&&!speech.supported)||!voices.length;}
speech=createSpeechController({onState:state=>{speechState=state.status;$('speech-status').textContent=state.message+(state.totalChunks?` (${state.chunk||1}/${state.totalChunks} speech chunks)`:'');updateButtons();},onVoices:voices=>renderVoices(speech?speech.getVoices(config()?.locale||'en-US'):voices),onError:event=>{$('speech-status').textContent=event.message;}});
renderVoices(speech.getVoices());$('speech-voice').addEventListener('change',()=>manualVoice=true);
function speakMessage(text=$('message').value.trim()?$('message').value:lastResult?.input||'',readAlong=false){stopSentenceVideo();media.beforeSpeech({readAlong});speech.speak(text,{voiceURI:$('speech-voice').value,lang:config()?.locale||'en-US',rate:Number($('speech-rate').value),volume:Number($('speech-volume').value),muted:$('speech-mute').checked});}
$('read-aloud').addEventListener('click',()=>speakMessage());$('speech-stop').addEventListener('click',()=>speech.stop());
$('speech-rate').addEventListener('input',()=>$('speech-rate-value').textContent=`${Number($('speech-rate').value).toFixed(1)}×`);$('speech-volume').addEventListener('input',()=>{$('speech-volume-value').textContent=`${Math.round(Number($('speech-volume').value)*100)}%`;if(Number($('speech-volume').value)===0)speech.stop();});$('speech-mute').addEventListener('change',()=>{if($('speech-mute').checked){speech.stop();$('speech-status').textContent='Speech muted. Motion playback remains available.';}else $('speech-status').textContent='Speech unmuted. Read the message to apply current settings.';});
microphone=createMicrophoneController({onState:state=>{micState=state.status;$('voice-status').textContent=state.message;$('microphone-engine').textContent=state.service||'Uses an installed on-device engine when available; otherwise the browser’s speech service.';$('microphone').textContent=state.status==='error'?'Retry microphone':'Start microphone';const recording=['checking','starting','listening','processing'].includes(state.status);$('transcript').readOnly=recording;document.querySelector('.voice-orb').classList.toggle('listening',state.status==='listening');updateButtons();},onTranscript:result=>{$('transcript').value=result.text;updateButtons();},onError:event=>{$('voice-status').textContent=event.message;}});
$('microphone').addEventListener('click',()=>{media.beforeListening();void microphone.startPreferred({lang:config()?.locale||'en-US'});});$('microphone-stop').addEventListener('click',()=>microphone.stop());
$('type-instead').addEventListener('click',()=>{microphone.abort();selectMode('text');focusSection($('message'));});
$('transcript').addEventListener('input',updateButtons);$('use-transcript').addEventListener('click',()=>{microphone.abort();setInput($('transcript').value,'voice');selectMode('text');updateCount();feedback('Reviewed transcript copied. You can edit it again before selecting Explore this message.');});$('clear-transcript').addEventListener('click',()=>{microphone.abort();$('transcript').value='';updateButtons();});
function selectMode(mode){if(mode!=='text')stopSentenceVideo();activeMode=mode;for(const name of ['text','voice','camera']){const selected=name===mode;$(name+'-tab').setAttribute('aria-selected',String(selected));$(name+'-tab').tabIndex=selected?0:-1;$(name+'-panel').hidden=!selected;}if(mode!=='camera')stopCamera();if(mode!=='voice')microphone?.abort();}
for(const name of ['text','voice','camera']){$(name+'-tab').addEventListener('click',()=>selectMode(name));$(name+'-tab').addEventListener('keydown',event=>{const modes=['text','voice','camera'];if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?2:(modes.indexOf(name)+(event.key==='ArrowLeft'?2:1))%3;selectMode(modes[index]);$(modes[index]+'-tab').focus();}});}
async function loadHistory(){try{history=(await api('/history')).items;renderRecent();renderHistory();}catch(error){$('history-status').textContent='History is temporarily unavailable. '+error.message;}}
async function replayItem(item){if(busy)return;if(item.researchPreviewConsent&&!$('research-consent').checked){setView('studio');feedback('Enable Use unreviewed research recordings before replaying this research word queue.');focusSection($('research-consent'));return;}setView('studio');if(item.language!==language)await changeLanguage(item.language);if(language!==item.language||!avatar)return;setInput(item.input||'',item.mode==='voice'?'voice':'text');selectMode('text');updateCount();
  const cameraReplay=item.mode==='camera'?cameraReplayInput(item):null;
  if(item.mode==='camera'&&!cameraReplay){selectMode('camera');feedback('This older camera entry has no saved detection score. Capture and confirm a pose again; no new score will be invented.');return;}
  await submit(item.mode==='asset-review'?{mode:'asset-review',animationIds:(item.sequence||[]).map(motion=>motion.id)}:cameraReplay||{text:item.input,mode:messageOrigin,completePhraseOnly:item.completePhraseOnly===true,sentenceMode:item.sentenceMode===true});
}
function historyCard(item,full=false){const article=document.createElement('article');article.className='recent-item';const mark=document.createElement('span');mark.className='recent-icon';mark.append(icon(item.mode==='camera'?'hand':item.mode==='voice'?'mic':'spark'));const content=document.createElement('div');content.className='recent-content';const strong=document.createElement('strong');strong.textContent=item.input||item.output||'Empty message';const meta=document.createElement('p');const label=catalog?.languages.find(l=>l.id===item.language)?.label.split(' · ').at(-1)||item.language;meta.textContent=`${label} · ${new Date(item.createdAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}${item.mode==='asset-review'?` · manual inspection · ${item.sequence.length} selected motions`:item.coverage?` · ${item.coverage.supportedPhrases} motions / ${item.coverage.unsupportedWords} missing words`:' · legacy demo'}`;content.append(strong,meta);
  if(full){const source=document.createElement('p');source.className='history-source';source.textContent=item.input;content.append(source);}const replay=document.createElement('button');replay.setAttribute('aria-label',`Replay conversation ${item.id}`);replay.append(icon('replay'));if(full)replay.append(document.createTextNode('Review / replay'));replay.addEventListener('click',()=>replayItem(item));article.append(mark,content,replay);return article;
}
function renderRecent(){$('recent-items').replaceChildren();if(!history.length)empty($('recent-items'),'Your first vocabulary preview starts above.');else history.slice(0,3).forEach(item=>$('recent-items').append(historyCard(item)));}
function renderHistory(){$('history-items').replaceChildren();if(!history.length)empty($('history-items'),'No conversations yet. Build a queue in the studio.');else history.forEach(item=>$('history-items').append(historyCard(item,true)));$('clear-history').disabled=!history.length;}
$('clear-history').addEventListener('click',async()=>{const button=$('clear-history');if(button.dataset.confirm!=='true'){button.dataset.confirm='true';button.textContent='Confirm clear';$('history-status').textContent='Click Confirm clear to remove saved conversations. Export first if you want a copy.';return;}button.disabled=true;try{await api('/history',{method:'DELETE'});history=[];renderHistory();renderRecent();$('history-status').textContent='Conversation history cleared.';}catch(error){$('history-status').textContent=error.message;button.disabled=false;}finally{button.dataset.confirm='false';button.textContent='Clear history';}});
function renderLibrary(){if(!catalog)return;renderTopicOptions();const search=$('library-search').value.toLocaleLowerCase().trim(),topic=$('library-topic').value;$('library-items').replaceChildren();$('library-mode-note').textContent=catalog.capabilities.notices[vocabularyMode];$('library-items').hidden=vocabularyMode!=='demo';for(const phrase of (vocabularyMode==='demo'?activePhrases():[])){if(!matchesTopic(phrase.conceptId,topic))continue;if(search&&!`${phrase.label} ${phrase.inputText} ${phrase.meaning}`.toLocaleLowerCase().includes(search))continue;const card=document.createElement('article');card.className='library-item';const mark=document.createElement('span');mark.className='gesture-symbol';mark.textContent=symbolFor(phrase.id);const title=document.createElement('h3');title.textContent=phrase.label;const status=document.createElement('p');status.className='validation-status';status.textContent=phrase.inspectionOnly?'Inspection only · excluded from text translation':phrase.validated?'Approved ASL vocabulary':phrase.motionUrl?'Recorded ASL · human review pending':'Illustrative demo · not validated ASL';const description=document.createElement('p');description.textContent=phrase.meaning;const button=document.createElement('button');button.className='primary';button.disabled=!avatar||busy;button.textContent=phrase.inspectionOnly?'Inspect unverified asset':phrase.requiresSense?`Preview: ${phrase.senseOptions[0].label}`:'Preview motion';button.append(icon('arrow'));button.addEventListener('click',()=>{setView('studio');previewPhrase(phrase);});card.append(mark,title,status,description,button);$('library-items').append(card);}if(!$('library-items').children.length)empty($('library-items'),vocabularyMode==='validated'?'No sign has passed both technical and human ASL review yet. Select Research preview in the studio to inspect unverified recordings.':'No matching phrase. Other words will be reported as missing coverage.');
  const caps=catalog.capabilities;$('library-counts').textContent=`${caps.conceptCount} candidate concepts · ${caps.aliasCount} aliases · ${caps.inflectionCount} inflections · ${caps.recordedMotionCount} recorded assets · ${caps.validatedCount} approved signs`;const canonical=$('concept-library');canonical.replaceChildren();const allConceptMatches=catalog.concepts.filter(c=>(!topic||(c.category||'existing')===topic)&&(!search||`${c.label} ${c.definition} ${c.aliases.map(a=>a.text).join(' ')}`.toLowerCase().includes(search)));for(const c of allConceptMatches.slice(0,libraryConceptLimit)){const card=document.createElement('article'),h=document.createElement('h4'),p=document.createElement('p'),meta=document.createElement('small');h.textContent=c.label;p.textContent=c.definition;meta.textContent=`${c.id} · ${c.sense} · aliases: ${c.aliases.map(a=>a.text).join(', ')} · ASL mapping review: ${c.linguisticReview.status} · motions: ${c.animationIds.length} · topic: ${Object.hasOwn(topicLabels,c.category||'existing')?topicLabels[c.category||'existing']:c.category}`;card.append(h,p,meta);canonical.append(card);}if(allConceptMatches.length>libraryConceptLimit){const more=document.createElement('button');more.type='button';more.className='control-button';more.textContent='Show more concepts';more.addEventListener('click',()=>{libraryConceptLimit+=60;renderLibrary();});canonical.append(more);}const conceptMatches=allConceptMatches.length,motionMatches=renderImportedReview(search,topic);if(!conceptMatches)empty(canonical,'No candidate concept matches these filters. Clear filters to browse the library.');$('library-filter-status').textContent=`${topic?$('library-topic').selectedOptions[0].textContent:'All topics'} · ${conceptMatches} matching concepts · ${motionMatches} matching recorded motions. Selected inspection motions are retained.`;$('clear-library-filters').disabled=!search&&!topic;
  renderSourceCatalog();
}
function renderImportedReview(search,topic){
  const reviews=$('asset-review-list');reviews.replaceChildren();
  const records=catalog.registry.filter(entry=>entry.motionUrl&&entry.signLanguage==='ASL');
  // A catalog reload may remove a record; never retain stale paths or IDs.
  for(let i=inspectionSelection.length-1;i>=0;i--)if(!records.some(record=>record.id===inspectionSelection[i]))inspectionSelection.splice(i,1);
  const matches=records.filter(entry=>matchesTopic(entry.conceptId,topic)&&(!search||(entry.gloss+' '+entry.meaning+' '+entry.id).toLowerCase().includes(search)));
  shownInspectionIds=matches.slice(0,importedLimit).map(item=>item.id);
  const limitReached=selectShownMotions(inspectionSelection,shownInspectionIds,true).limited;
  $('inspection-bulk-help').textContent=matches.length?`Showing ${shownInspectionIds.length} of ${matches.length} matching recordings. Select all applies to the recordings shown. ${limitReached?'Narrow the filters or remove selections to stay within the 100-motion queue limit.':'Up to 100 motions per queue.'}`:'No matching recordings. Try another search or clear the filters.';
  for(const item of matches.slice(0,importedLimit)){
    const row=document.createElement('article'),title=document.createElement('h4'),detail=document.createElement('p');
    title.textContent=`${item.gloss.toUpperCase()} · ${item.signLanguage}`;
    detail.textContent=`${item.meaning} Technical: ${item.technicalReview.status}. Human ASL approval: ${item.humanReview?.approved?'recorded':'absent'}. Format: motion-only JSON derived from GLB; no source mesh.`;
    const source=document.createElement('a'),license=document.createElement('a'),reference=document.createElement('a');
    for(const [link,url,label] of [[source,item.source.projectUrl,item.source.dataset],[license,item.source.licenseUrl,item.source.license],[reference,item.source.meaningReference,'ASL meaning reference']]){link.href=url;link.target='_blank';link.rel='noopener';link.textContent=label;}
    const actions=document.createElement('div'),label=document.createElement('label'),check=document.createElement('input'),inspect=document.createElement('button');
    actions.className='asset-inspection-actions';label.className='inspection-choice';check.type='checkbox';check.value=item.id;check.checked=inspectionSelection.includes(item.id);check.setAttribute('aria-label',`Select ${item.gloss} for manual inspection`);
    check.addEventListener('change',()=>{const index=inspectionSelection.indexOf(item.id);if(check.checked&&index===-1){if(inspectionSelection.length>=inspectionSelectionLimit){check.checked=false;$('inspection-selection-status').textContent='The inspection queue is limited to 100 motions. Remove a selection first.';return;}inspectionSelection.push(item.id);}else if(!check.checked&&index!==-1)inspectionSelection.splice(index,1);renderInspectionSelection();});
    label.append(check,document.createTextNode('Add to inspection queue'));
    inspect.type='button';inspect.className='control-button';inspect.textContent='▶ Inspect this motion';inspect.title='Watch this recording immediately with Aarav';inspect.setAttribute('aria-label',`Inspect ${item.gloss} motion only`);inspect.addEventListener('click',()=>inspectMotions([item.id]));
    actions.append(label,inspect);row.append(title,detail,source,document.createTextNode(' · '),license,document.createTextNode(' · '),reference,actions);reviews.append(row);
  }
  if(matches.length>importedLimit){const more=document.createElement('button');more.type='button';more.className='control-button';more.textContent=`Show more recordings · ${Math.min(importedLimit,matches.length)} of ${matches.length} shown`;more.addEventListener('click',()=>{importedLimit+=40;renderLibrary();});reviews.append(more);}
  if(!matches.length)empty(reviews,'No matching imported recording. Search another term; archive discovery records are not playable motions.');
  renderInspectionSelection();return matches.length;
}
function renderSourceCatalog(limit=40){
 const target=$('source-catalog');target.replaceChildren();const search=$('library-search').value.toLowerCase().trim(),matches=(catalog.sourceCatalog||[]).filter(s=>!search||s.sourceGloss.toLowerCase().includes(search));
 $('source-catalog-count').textContent=`${catalog.sourceCatalog?.length||0} indexed archive files · ${matches.length} matching · ${Math.min(limit,matches.length)} shown. These are discovery records, not approved vocabulary or imported animations. Topic filters do not classify these unverified filenames.`;
 for(const s of matches.slice(0,limit)){const row=document.createElement('article'),h=document.createElement('h4'),p=document.createElement('p'),a=document.createElement('a');h.textContent=s.sourceGloss;const imported=catalog.registry.find(r=>r.source.filename===s.archiveFile.slice(9));p.textContent=imported?'Motion imported for unverified inspection; excluded from validated translation.':'Not imported. Motion availability, exact meaning and variant are unverified.';a.href=s.projectURL;a.target='_blank';a.rel='noopener';a.textContent=`3D-LEX · ASL · ${s.license}`;row.append(h,p,a);target.append(row);}
 if(matches.length>limit){const more=document.createElement('button');more.className='subtle-button';more.textContent=`Show ${Math.min(40,matches.length-limit)} more source entries`;more.addEventListener('click',()=>renderSourceCatalog(limit+40));target.append(more);}
 if(!matches.length)empty(target,'No matching archive source. No substitute sign will be generated.');
}
$('library-search').addEventListener('input',()=>{importedLimit=40;libraryConceptLimit=60;clearTimeout(librarySearchTimer);$('select-all-inspection').disabled=true;librarySearchTimer=setTimeout(()=>{librarySearchTimer=null;if(currentView==='library')renderLibrary();},150);});$('library-topic').addEventListener('change',()=>{importedLimit=40;clearTimeout(librarySearchTimer);librarySearchTimer=null;renderLibrary();});$('clear-library-filters').addEventListener('click',()=>{importedLimit=40;clearTimeout(librarySearchTimer);librarySearchTimer=null;$('library-search').value='';$('library-topic').value='';renderLibrary();$('library-topic').focus();});
function renderCameraReview(){
  $('camera-proposal').hidden=!pendingPose;
  if(pendingPose){const pose=cameraPose(pendingPose.pose);$('camera-captured').textContent=`Captured ${pose.label} on ${pendingPose.handCount} hand${pendingPose.handCount===1?'':'s'} · classifier score ${pendingPose.score.toFixed(2)}. This score is not ASL accuracy.`;}
  updateButtons();
}
for(const pose of cameraPoses){const option=document.createElement('option');option.value=pose.id;option.textContent=pose.label;$('camera-choice').append(option);const item=document.createElement('li');item.textContent=`${pose.label} → ${pose.response} (${pose.kind==='control'?'player control':'unverified illustration'})`;$('camera-pose-list').append(item);}
$('camera-choice').addEventListener('change',updateButtons);
$('camera-controls').addEventListener('change',updateButtons);
$('camera-dismiss').addEventListener('click',()=>{pendingPose=null;renderCameraReview();$('camera-status').textContent='Capture dismissed. Release the pose before trying again.';});
$('camera-confirm').addEventListener('click',async()=>{
  const chosen=$('camera-choice').value,action=cameraAction(pendingPose,chosen,{demo:$('camera-demo').checked,controls:$('camera-controls').checked,playerState,ready:Boolean(avatar&&queueReady&&!graphicsLost&&lastResult?.sequence.length)});
  if(busy||!action.enabled)return;
  const captured=pendingPose,pose=cameraPose(chosen);pendingPose=null;renderCameraReview();
  if(pose.kind==='control'){
    if(pose.action==='pause'){avatar.pause();speech.pause();}else{media.beforeResume();avatar.resume();speech.resume();}
    $('camera-status').textContent=`Confirmed player control: ${pose.response}. This does not recognize an ASL word.`;return;
  }
  $('camera-status').textContent=`Confirmed illustration: ${pose.response}. Preparing a queue; press Play after review.`;
  await submit({mode:'camera',gesture:chosen,confidence:captured.score,cameraReview:{detectedPose:captured.pose},autoPlay:false});
});
function stopCamera(){
  cameraToken++;cameraStarting=false;cameraAbort?.abort();cameraAbort=null;
  if(frame)cancelAnimationFrame(frame);frame=null;
  trackCleanup.forEach(remove=>remove());trackCleanup=[];
  stream?.getTracks().forEach(track=>track.stop());stream=null;recognizer?.close();recognizer=null;
  $('video').srcObject=null;$('video-placeholder').hidden=false;$('camera').textContent='Enable camera';
  cameraPolicy.reset();pendingPose=null;lastVideoTime=-1;lastInference=0;inferenceInterval=125;
  $('camera-hold').value=0;$('camera-hands').textContent='';$('camera-observation').textContent='Camera is off. No pose has been captured.';
  $('camera-status').textContent='Camera is off. Nothing is recorded or submitted automatically.';renderCameraReview();
}
async function startCamera(){
  if(cameraStarting||stream)return;cameraStarting=true;const token=++cameraToken;cameraAbort=new AbortController();let opened=null,detector=null;
  $('camera').textContent='Cancel camera startup';updateButtons();$('camera-status').textContent='Loading the local pose detector…';
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera access needs localhost/HTTPS and a supported browser.');
    const {createCameraDetector}=await import('./camera-detector.mjs');detector=await createCameraDetector({signal:cameraAbort.signal});
    if(token!==cameraToken){detector.close();return;}recognizer=detector;
    $('camera-status').textContent='Waiting for camera permission…';
    opened=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640,max:960},height:{ideal:480,max:720},frameRate:{ideal:15,max:24},facingMode:'user'},audio:false});
    if(token!==cameraToken){opened.getTracks().forEach(track=>track.stop());detector.close();return;}
    stream=opened;$('video').srcObject=stream;await $('video').play();if(token!==cameraToken)return;
    for(const track of stream.getVideoTracks()){
      const ended=()=>{if(token===cameraToken){stopCamera();$('camera-status').textContent='Camera disconnected or permission was revoked. Reconnect it and enable the camera again.';}};
      track.addEventListener('ended',ended);trackCleanup.push(()=>track.removeEventListener('ended',ended));
    }
    cameraStarting=false;$('video-placeholder').hidden=true;$('camera').textContent='Stop camera';
    $('camera-status').textContent='Camera active. Hold a pose, review the capture, then explicitly confirm.';
    $('camera-runtime').textContent=`Local ${recognizer.runtime}; one frame in flight; adaptive cadence; frame resizing is bounded in worker mode.`;
    updateButtons();frame=requestAnimationFrame(scan);
  }catch(error){opened?.getTracks().forEach(track=>track.stop());detector?.close();if(token!==cameraToken)return;stopCamera();const reason=error.name==='NotAllowedError'?'Permission was denied. Allow this site in browser settings or keep using text.':error.name==='NotFoundError'?'No camera was found. Connect a camera or use text.':error.message;$('camera-status').textContent=`Camera unavailable: ${reason}`;}
}
async function scan(now){
  if(!stream)return;const token=cameraToken;
  try{
    const video=$('video');
    if(video.readyState>=2&&video.currentTime!==lastVideoTime&&now-lastInference>=inferenceInterval){
      lastVideoTime=video.currentTime;lastInference=now;
      const result=await recognizer.detect(video,now);if(token!==cameraToken||!stream)return;
      inferenceInterval=Math.min(500,Math.max(125,(result.inferenceMs||0)*1.5));
      const observation=cameraPolicy.observe(result,performance.now());
      const messages={'no-hands':'No hands detected. Keep your whole hand visible with even lighting.','out-of-frame':'Move your whole hand and fingers inside the frame.','uncertain':'Uncertain pose. Use a clear supported pose and even lighting.','conflicting-hands':'Different poses on two hands. Show one pose at a time.','holding':'Hold the same pose steadily…','captured':'Pose captured. Review it before confirming.','release-to-repeat':'Release your hand before capturing another pose.'};
      const message=messages[observation.state]||'Waiting for a clear pose.';
      if($('camera-observation').textContent!==message)$('camera-observation').textContent=message;
      $('camera-hands').textContent=(observation.hands||[]).map(hand=>`${hand.hand}: ${cameraPose(hand.pose)?.label||'unknown'} (${Number.isFinite(hand.score)?hand.score.toFixed(2):'no score'})`).join(' · ');
      $('camera-hold').value=observation.holdProgress||0;
      $('camera-runtime').textContent=`${recognizer.runtime} · ${result.inferenceMs.toFixed(1)} ms model inference · up to ${(1000/inferenceInterval).toFixed(1)} requests/s · one frame in flight. Classifier scores are not ASL accuracy.`;
      if(observation.proposal&&!pendingPose){pendingPose=observation.proposal;$('camera-choice').value=pendingPose.pose;renderCameraReview();}
    }
    if(token===cameraToken&&stream)frame=requestAnimationFrame(scan);
  }catch(error){if(token!==cameraToken)return;stopCamera();$('camera-status').textContent=`Local detection stopped: ${error.message}. Your text and signing queue are retained.`;}
}
$('camera').addEventListener('click',()=>stream||cameraStarting?stopCamera():startCamera());
$('camera-demo').addEventListener('change',()=>{if(!$( 'camera-demo').checked&&(requestMode==='camera'||lastResult?.mode==='camera')){cancelProcessing({announce:false});avatar?.stop();speech.stop();clearQueue();}updateButtons();feedback($('camera-demo').checked?'Illustrative camera responses enabled. Every capture still needs confirmation and explicit Play.':'Illustrative responses disabled. Detection can remain local without creating a queue.');});
function suspendPage(){stopSentenceVideo();if(!visibilitySuspended){restoreSpeech=['queued','speaking'].includes(speechState);if(restoreSpeech)speech.pause();visibilitySuspended=true;}stopCamera();microphone.abort();avatar?.suspend();}
function wakePage(){if(visibilitySuspended){visibilitySuspended=false;if(restoreSpeech)speech.resume();restoreSpeech=false;}if(currentView==='studio')avatar?.wake();}
document.addEventListener('visibilitychange',()=>document.hidden?suspendPage():wakePage());
window.addEventListener('pagehide',event=>{suspendPage();if(!event.persisted){clearTimeout(librarySearchTimer);clearInterval(heartbeat);recognizer?.close();avatar?.dispose();speech.dispose();microphone.dispose();}});
window.addEventListener('pageshow',event=>{if(event.persisted){wakePage();api('/health').catch(()=>{});}});

function renderReadiness(){
  const audit=catalog?.capabilities.readiness,counts=audit?.counts||{},target=$('readiness-counts');target.replaceChildren();
  $('readiness-note').textContent=audit?audit.notice+' Checked '+(audit.checkedAt?new Date(audit.checkedAt).toLocaleString():'not yet run')+'. '+(audit.issues.length?audit.issues.join('; '):'No missing or changed registered motion files.'):'Technical evidence is unavailable; run the documented asset audit before the demo.';
  const labels={expandedResearchTextConcepts:'Concepts available with expanded research opt-in',expandedResearchTextMotions:'Motions eligible for explicit text research opt-in',registeredFiles:'Motion files registered',onDiskFiles:'Registered files present',uniqueRegisteredFiles:'Unique registered file hashes',technicallyPlayable:'Motion format checks passed',aaravCompatible:'Aarav rig checks passed',candidateConcepts:'Unique candidate concepts',uniqueMotionConcepts:'Concepts with imported motions',inspectionOnlyAssets:'Manifest inspection-only flags (expanded opt-in separate)',catalogueEntries:'Source catalogue entries',catalogueNotImported:'Catalogue motions not imported',textUnavailableCaptures:'Playable captures without expanded text mapping',textMappedConcepts:'Legacy research mapped concepts (subset)',textLinkedPreviews:'Legacy research mappings (subset of text previews)',completeAvatarSentences:'Approved complete avatar sentences',localSentenceVideos:'Complete signer videos bundled locally',sourceVideoReferences:'External complete-recording references',browserCheckedSourceVideos:'Browser-checked source recordings',approvedSigns:'Linguistically approved signs'};
  for(const [key,label]of Object.entries(labels)){const row=document.createElement('div'),term=document.createElement('dt'),count=document.createElement('dd');term.textContent=label;term.title=audit.countDefinitions?.[key]||'';count.textContent=String(counts[key]??0);row.append(term,count);target.append(row);}
}
function renderExplore(){
  if(!catalog)return;
  exploreRows??=libraryRows(catalog);
  const category=$('explore-category');
  if(category.options.length===1)for(const value of [...new Set(exploreRows.map(r=>r.category))].sort()){
    const option=document.createElement('option');option.value=value;option.textContent=topicLabels[value]||value;category.append(option);
  }
  const options=filterLibrary(exploreRows,{search:$('explore-search').value,category:category.value,type:$('explore-type').value,review:$('explore-review').value});
  const counts=catalog.capabilities.readiness.counts;
  $('explore-count').textContent=`${options.length} matching entries · ${counts.uniqueMotionConcepts} concepts with motions · ${counts.aaravCompatible} technically checked captures · ${counts.expandedResearchTextConcepts} expanded research text candidates · ${counts.approvedSigns} approved signs`;
  const list=$('explore-results');list.replaceChildren();
  for(const item of options.slice(0,exploreLimit)){
    const card=document.createElement('article'),title=document.createElement('h3'),status=document.createElement('p'),text=document.createElement('p'),details=document.createElement('details'),summary=document.createElement('summary'),definition=document.createElement('p');
    card.dataset.concept=item.id;title.textContent=item.label;status.className='output-status';
    status.textContent=item.type==='avatar'?`Animation: preview available · ${item.playable.length} capture${item.playable.length===1?'':'s'}`:item.type==='video'?'Video: original signer recording':item.type==='catalogue'?'Animation: not imported':'Animation: unavailable';
    text.className='library-text-status';text.textContent=`Text input: ${item.textStatus} · ${item.review==='approved'?'ASL approved':'ASL review pending'}`;
    summary.textContent='Meaning, sources & license';definition.textContent=item.type==='catalogue'?'Unverified archive filename. No registered playable motion; inspect the developer audit for static or rejected sources.':item.definition||item.meaning||'Separate complete source recording; not an avatar translation.';
    details.append(summary,definition);
    if(item.aliases.length){const aliases=document.createElement('p');aliases.textContent='Candidate aliases: '+item.aliases.join(', ')+'. Search matches do not approve text mappings.';details.append(aliases);}
    const sources=item.type==='catalogue'?[{url:item.projectURL,license:item.license}]:item.captures.length?item.captures.map(a=>({url:a.source.projectUrl,license:a.source.license,licenseURL:a.source.licenseUrl,reference:a.source.meaningReference})):item.sources||[];
    for(const source of sources){const line=document.createElement('p'),reference=source.reference||source.meaningReference;for(const [label,url]of [['Source · '+(source.license||'see source'),source.url],['License',source.licenseURL|| (source.license==='CC-BY-4.0'?'https://creativecommons.org/licenses/by/4.0/':null)],[reference?.startsWith('https://osf.io/')?'Publisher gloss · meaning unverified':'ASL reference',reference]])if(url){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent=label;line.append(link,document.createTextNode(' · '));}details.append(line);}
    card.append(title,status,text);
    for(const capture of item.playable){const button=document.createElement('button');button.type='button';button.className='control-button';button.dataset.output='avatar';button.textContent=item.playable.length>1?'Preview capture: '+capture.gloss:'▶ Preview animation';button.setAttribute('aria-label',`Preview ${item.label}: ${capture.gloss}`);button.addEventListener('click',()=>inspectMotions([capture.id]));card.append(button);}
    if(item.type==='video'){const button=document.createElement('button');button.type='button';button.className='control-button';button.dataset.output='video';button.textContent='Open signer recording';button.addEventListener('click',()=>enterCompleteExpression(item));card.append(button);}
    card.append(details);list.append(card);
  }
  if(!options.length)empty(list,'No entries match. Clear a filter or search a different concept. Missing signs are never replaced with invented gestures.');
  $('explore-more').hidden=options.length<=exploreLimit;$('explore-more').textContent=`Show more · ${Math.min(exploreLimit,options.length)} of ${options.length}`;updateButtons();
}
for(const id of ['explore-search','explore-type','explore-category','explore-review'])$(id).addEventListener(id==='explore-search'?'input':'change',()=>{exploreLimit=40;renderExplore();});
$('explore-clear').addEventListener('click',()=>{for(const id of ['explore-search','explore-type','explore-category','explore-review'])$(id).value='';exploreLimit=40;renderExplore();$('explore-search').focus();});
for(const layout of ['grid','list'])$('explore-'+layout).addEventListener('click',()=>{for(const option of ['grid','list'])$('explore-'+option).setAttribute('aria-pressed',String(option===layout));$('explore-results').classList.toggle('library-list',layout==='list');});
$('explore-more').addEventListener('click',()=>{exploreLimit+=40;renderExplore();});
function updateFullscreen(){const viewer=$('avatar-viewer'),expanded=document.fullscreenElement===viewer||viewer.classList.contains('viewer-expanded');$('fullscreen-avatar').textContent=expanded?'Exit fullscreen':'Fullscreen';$('fullscreen-avatar').setAttribute('aria-pressed',String(expanded));avatar?.resetCamera();}
$('fullscreen-avatar').addEventListener('click',async()=>{const viewer=$('avatar-viewer');try{if(document.fullscreenElement===viewer)await document.exitFullscreen();else if(viewer.classList.contains('viewer-expanded'))viewer.classList.remove('viewer-expanded');else if(viewer.requestFullscreen)await viewer.requestFullscreen();else throw Error('Native fullscreen unavailable');$('viewer-tool-status').textContent='';}catch{viewer.classList.toggle('viewer-expanded');$('viewer-tool-status').textContent=viewer.classList.contains('viewer-expanded')?'Expanded viewer. Press Escape or Exit fullscreen to return.':'';}updateFullscreen();});
document.addEventListener('fullscreenchange',updateFullscreen);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('avatar-viewer').classList.contains('viewer-expanded')){$('avatar-viewer').classList.remove('viewer-expanded');$('viewer-tool-status').textContent='';updateFullscreen();$('fullscreen-avatar').focus();}});
$('reset-camera').addEventListener('click',()=>{avatar?.resetCamera();$('viewer-tool-status').textContent='Camera reset. Full signing space retained.';});
$('reset-preview').addEventListener('click',()=>{cancelProcessing({announce:false});microphone?.abort();stopCamera();speech.stop();avatar?.stop();clearQueue();avatar?.resetCamera();$('viewer-tool-status').textContent='Preview reset. Your typed text is preserved.';feedback('Choose a local example or process your message again.');});

async function initialize(){if(starting||busy)return;starting=true;$('stage').setAttribute('aria-busy','true');lock(true);$('render-error').hidden=true;$('render-loading').hidden=false;try{const[loaded,session]=await Promise.all([api('/catalog'),api('/session',{method:'POST'})]);catalog=loaded;renderGuidedExamples();language=session.language;$('language').replaceChildren();catalog.languages.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.label;$('language').append(option);});$('language').value=language;$('speed').value=String(session.speed);applyLanguage();const historyRequest=loadHistory();if(!avatar){const{createAvatar}=await import('./avatar.js?v=20261020-4');avatar=await createAvatar($('stage'),{onFinish:finished,onStep:step,onProgress:progress,onRenderState:renderState});}avatar.setLanguage(config().avatar);avatar.setSpeed(session.speed);if(document.hidden||currentView!=='studio')avatar.suspend();$('render-loading').hidden=true;$('avatar-state').textContent='Ready';updateCount();if(currentView==='library')renderLibrary();if(currentView==='explore')renderExplore();await historyRequest;primeDemoAssets();}catch(error){$('render-loading').hidden=true;$('render-error').hidden=false;const message=catalog?'Aarav could not load. Check the local server and WebGL support, then reconnect. You can still enter text and review vocabulary coverage.':error.message;$('render-error-message').textContent=message;$('avatar-state').textContent='Needs attention';feedback(message,true);console.error(error);}finally{starting=false;$('stage').setAttribute('aria-busy','false');lock(false);}}
$('retry-studio').addEventListener('click',initialize);$('reconnect').addEventListener('click',initialize);
const heartbeat=setInterval(()=>{if(!document.hidden)api('/health').catch(()=>{});},20000);
await initialize();

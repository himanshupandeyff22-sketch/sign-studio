import test from 'node:test';
import assert from 'node:assert/strict';
import {createMediaSession} from '../web/media-session.mjs';

test('microphone, manual speech and signing replace competing media without discarding the queue',()=>{
  const state={playing:true,speaking:true,listening:false,queue:['help']};
  const controls=createMediaSession({
    avatar:()=>({pause(){state.playing=false;}}),
    speech:()=>({stop(){state.speaking=false;}}),
    microphone:()=>({abort(){state.listening=false;}})
  });
  controls.beforeListening();state.listening=true;
  assert.equal(state.playing,false);assert.equal(state.speaking,false);
  assert.deepEqual(state.queue,['help'],'recording pauses rather than destroys the signing queue');
  controls.beforePlayback();state.playing=true;
  assert.equal(state.listening,false);assert.equal(state.speaking,false);
  controls.beforeSpeech();state.speaking=true;
  assert.equal(state.playing,false);assert.equal(state.listening,false);
  state.playing=true;controls.beforeSpeech({readAlong:true});
  assert.equal(state.playing,true,'explicit read-along may accompany signing');
  state.listening=true;controls.beforeResume();assert.equal(state.listening,false);
});

test('media cleanup works during initialization and after a viewer is disposed',()=>{
  const controls=createMediaSession({avatar:()=>null,speech:()=>undefined,microphone:()=>null});
  assert.doesNotThrow(()=>{controls.beforeListening();controls.beforePlayback();controls.beforeSpeech();controls.beforeResume();});
});

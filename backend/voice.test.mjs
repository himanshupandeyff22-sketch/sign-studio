import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpeechController, createMicrophoneController, rankVoices, splitSpeechText} from '../web/voice.js';

function speechEnvironment(initialVoices = []) {
  const listeners = new Map(), timers = new Map(), utterances = [];
  let voices = initialVoices, timer = 0;
  const synthesis = {
    paused: false, canceled: 0, resumed: 0,
    getVoices: () => voices,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
    cancel() { this.canceled++; },
    speak(utterance) { utterances.push(utterance); },
    pause() { this.paused = true; },
    resume() { this.paused = false; this.resumed++; }
  };
  return {
    environment: {
      speechSynthesis: synthesis,
      SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
      setTimeout(callback) { const id = ++timer; timers.set(id, callback); return id; },
      clearTimeout: id => timers.delete(id)
    },
    synthesis, utterances, listeners, timers,
    loadVoices(value) { voices = value; listeners.get('voiceschanged')?.(); }
  };
}

const installedVoices = [
  {voiceURI: 'david', name: 'Microsoft David', lang: 'en-US', localService: true, default: true},
  {voiceURI: 'aria', name: 'Microsoft Aria Online (Natural)', lang: 'en-GB', localService: false},
  {voiceURI: 'french', name: 'French Premium', lang: 'fr-FR', localService: true}
];

test('voice ranking prefers available natural English speech and respects other languages', () => {
  assert.equal(rankVoices(installedVoices, 'en-US')[0].voiceURI, 'aria');
  assert.equal(rankVoices(installedVoices, 'fr-FR')[0].voiceURI, 'french');
  assert.equal(installedVoices[0].voiceURI, 'david', 'ranking must not mutate the browser voice catalog');
});

test('speech chunking and playback preserve every character of at least 500 words', () => {
  const paragraph = 'Hello! Thank you. An unfamiliar word: accessibility. '; 
  const text = paragraph.repeat(120) + '😀'.repeat(90) + ' supercalifragilisticexpialidocious'.repeat(20);
  assert(text.trim().split(/\s+/).length >= 500);
  const chunks = splitSpeechText(text);
  assert.equal(chunks.join(''), text);
  assert(chunks.length > 1);
  assert(chunks.every(chunk => chunk.length <= 181));
  assert(chunks.every(chunk => !/^[\uDC00-\uDFFF]/.test(chunk) && !/[\uD800-\uDBFF]$/.test(chunk)));
  const fake = speechEnvironment(installedVoices), states = [];
  const speech = createSpeechController({onState: state => states.push(state)}, fake.environment);
  assert.equal(speech.speak(text, {rate: 1.15, volume: 0.8}), true);
  let played = '';
  for (let index = 0; index < chunks.length; index++) {
    const utterance = fake.utterances[index];
    assert(utterance, 'each chunk must be queued after the previous one finishes');
    played += utterance.text;
    assert.equal(utterance.rate, 1.15);
    assert.equal(utterance.volume, 0.8);
    assert.equal(utterance.voice.voiceURI, 'aria');
    utterance.onstart();
    utterance.onend();
  }
  assert.equal(played, text);
  assert.equal(speech.getState().status, 'idle');
  assert.equal(speech.getState().completed, true);
  assert(states.some(state => state.status === 'speaking'));
  speech.dispose();
});

test('speech selection, pause/resume, stop, mute and repeated playback ignore stale events', () => {
  const fake = speechEnvironment(installedVoices), errors = [];
  const speech = createSpeechController({onError: error => errors.push(error)}, fake.environment);
  speech.speak('Hello.', {voiceURI: 'david', rate: 8, volume: 4});
  const first = fake.utterances[0];
  assert.equal(first.voice.voiceURI, 'david');
  assert.equal(first.rate, 2);
  assert.equal(first.volume, 1);
  first.onstart();
  assert.equal(speech.pause(), true);
  assert.equal(speech.getState().status, 'paused');
  assert.equal(speech.resume(), true);
  assert.equal(speech.getState().status, 'speaking');
  speech.pause();
  speech.speak('New playback.');
  assert.equal(fake.synthesis.paused, false, 'replacing paused speech must unblock the synthesis engine');
  const current = fake.utterances.at(-1);
  first.onerror({error: 'network'});
  first.onend();
  assert.equal(errors.length, 0);
  assert.equal(fake.utterances.at(-1), current);
  current.onstart();
  speech.stop();
  current.onend();
  assert.equal(speech.getState().status, 'stopped');
  const beforeMute = fake.utterances.length;
  assert.equal(speech.speak('Silent.', {muted: true}), false);
  assert.equal(fake.utterances.length, beforeMute);
  assert.equal(speech.getState().status, 'muted');
  speech.dispose();
  assert.equal(fake.listeners.size, 0);
  assert.equal(speech.speak('After cleanup'), false);
});

test('late voices load, default-voice fallback, synthesis errors and unsupported browser have useful states', () => {
  const fake = speechEnvironment(), catalogs = [], errors = [];
  const speech = createSpeechController({onVoices: voices => catalogs.push(voices), onError: error => errors.push(error)}, fake.environment);
  assert.equal(speech.speak('Hello.'), true);
  assert.equal(fake.utterances[0].voice, undefined);
  fake.loadVoices(installedVoices);
  assert.equal(speech.getVoices()[0].voiceURI, 'aria');
  speech.speak('Thank you.');
  fake.utterances.at(-1).onerror({error: 'not-allowed'});
  assert.equal(speech.getState().status, 'error');
  assert.match(errors[0].message, /Click Read message/);
  assert(catalogs.some(catalog => catalog.length === 3));
  speech.dispose();
  assert.equal(fake.timers.size, 0);
  const unavailable = createSpeechController({}, {});
  assert.equal(unavailable.supported, false);
  assert.equal(unavailable.speak('Hello'), false);
  assert.equal(unavailable.getState().status, 'unavailable');
  unavailable.dispose();
});

function microphoneEnvironment() {
  const instances = [], timers = new Map(); let timer = 0;
  return {instances, timers, fireTimer(){const [id,callback]=timers.entries().next().value;timers.delete(id);callback();}, environment: {
    setTimeout(callback){const id=++timer;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id),SpeechRecognition: class {
    constructor() { instances.push(this); }
    start() { this.started = true; }
    stop() { this.stopped = true; }
    abort() { this.aborted = true; }
  }}};
}
function recognitionResult(text, final) {
  const result = [{transcript: text}];
  result.isFinal = final;
  return result;
}

test('passive microphone cleanup preserves the start prompt, reviewed text and permission guidance', () => {
  const fake = microphoneEnvironment();
  const mic = createMicrophoneController({}, fake.environment);
  const prompt = mic.getState();
  mic.abort();
  assert.deepEqual(mic.getState(), prompt, 'opening another tab is not a canceled recording');
  mic.start();
  fake.instances[0].onresult({results:[recognitionResult('Reviewed text',true)]});
  fake.instances[0].onend();
  const completed = mic.getState();
  mic.abort();
  assert.deepEqual(mic.getState(), completed, 'review guidance remains until the user starts again');
  mic.start();
  fake.instances[1].onerror({error:'not-allowed'});
  const denied = mic.getState();
  mic.abort();
  assert.equal(fake.instances[1].aborted,true);
  assert.deepEqual(mic.getState(),denied,'cleanup must not hide the useful permission error');
  mic.dispose();
});

test('network errors without onend release the microphone and ignore late results after retry', () => {
  const fake=microphoneEnvironment(), transcripts=[];
  const mic=createMicrophoneController({onTranscript:value=>transcripts.push(value)},fake.environment);
  mic.start();const first=fake.instances[0];first.onstart();
  first.onresult({results:[recognitionResult('Keep this text',false)]});
  first.onerror({error:'network'});
  assert.equal(first.aborted,true);assert.equal(fake.timers.size,0);
  assert.equal(mic.getState().status,'error');
  assert.equal(mic.start(),true,'retry must work even when the provider never sends onend');
  first.onresult({results:[recognitionResult('Stale',true)]});first.onend();
  assert.equal(transcripts.length,1);assert.equal(mic.getState().status,'starting');
  mic.dispose();assert.equal(fake.timers.size,0);
});

test('microphone watchdogs recover from a provider that never starts or finishes', () => {
  const fake=microphoneEnvironment();const mic=createMicrophoneController({},fake.environment);
  mic.start();fake.fireTimer();assert.equal(mic.getState().status,'error');
  assert.match(mic.getState().message,/did not start/);
  mic.start();const second=fake.instances[1];mic.stop();second.onstart();
  assert.equal(mic.getState().status,'processing','late onstart must not undo Stop');
  fake.fireTimer();assert.equal(mic.getState().status,'error');assert.equal(second.aborted,true);
  mic.start();fake.instances[2].onstart();fake.fireTimer();
  assert.equal(fake.instances[2].stopped,true,'a recording has a bounded session length');
  mic.dispose();assert.equal(fake.timers.size,0);
});

test('preferred microphone uses only an already installed local engine and otherwise falls back', async () => {
  for(const available of ['available','downloadable','unavailable']){
    const fake=microphoneEnvironment(),probes=[];
    fake.environment.SpeechRecognition.available=async options=>{probes.push(options);return available;};
    fake.environment.SpeechRecognition.install=()=>{throw Error('Never download language packs');};
    const mic=createMicrophoneController({},fake.environment);
    assert.equal(await mic.startPreferred({lang:'en-US'}),true);
    assert.deepEqual(probes,[{langs:['en-US'],processLocally:true}]);
    assert.equal(fake.instances[0].processLocally,available==='available'?true:undefined);
    assert.match(mic.getState().service,available==='available'?/On-device/:/Browser/);
    mic.dispose();assert.equal(fake.timers.size,0);
  }
});

test('a canceled, failed or stalled local-engine probe cannot start a stale microphone', async () => {
  const fake=microphoneEnvironment();let resolveProbe;
  fake.environment.SpeechRecognition.available=()=>new Promise(resolve=>{resolveProbe=resolve;});
  const mic=createMicrophoneController({},fake.environment);
  const pending=mic.startPreferred();await Promise.resolve();
  assert.equal(mic.getState().status,'checking');mic.stop();
  assert.equal(await pending,false);resolveProbe('available');await Promise.resolve();
  assert.equal(fake.instances.length,0);
  const stalled=mic.startPreferred();await Promise.resolve();fake.fireTimer();
  assert.equal(await stalled,true);assert.equal(fake.instances[0].processLocally,undefined);
  mic.abort();fake.environment.SpeechRecognition.available=async()=>{throw Error('policy blocked');};
  assert.equal(await mic.startPreferred(),true);assert.equal(fake.instances[1].processLocally,undefined);
  mic.dispose();assert.equal(fake.timers.size,0);
});

test('microphone returns editable interim/final transcripts without truncating or auto-submitting', () => {
  const fake = microphoneEnvironment(), transcripts = [];
  const mic = createMicrophoneController({onTranscript: transcript => transcripts.push(transcript)}, fake.environment);
  assert.equal(mic.start({lang: 'en-IN'}), true);
  assert.equal(mic.start(), false, 'repeat clicks must not start a second active microphone');
  const instance = fake.instances[0];
  assert.equal(instance.lang, 'en-IN');
  assert.equal(instance.interimResults, true);
  instance.onstart();
  assert.equal(mic.getState().status, 'listening');
  instance.onresult({results: [recognitionResult('Hello', false)]});
  assert.equal(transcripts[0].isFinal, false);
  assert.equal(transcripts[0].interimText, 'Hello');
  const text = 'this is recognized text '.repeat(150);
  instance.onresult({results: [recognitionResult(text, true), recognitionResult('another phrase', false)]});
  assert.equal(transcripts.at(-1).finalText, text.trim());
  instance.onresult({results: [recognitionResult(text, true), recognitionResult('another phrase', true)]});
  assert.equal(transcripts.at(-1).text, `${text.trim()} another phrase`);
  assert.equal(transcripts.at(-1).isFinal, true);
  mic.stop();
  assert.equal(instance.stopped, true);
  instance.onend();
  assert.equal(mic.getState().status, 'idle');
  assert.match(mic.getState().message, /Review and correct/);
  mic.dispose();
});

test('microphone handles permission denial, cancellation, restart and unsupported input', () => {
  const fake = microphoneEnvironment(), errors = [], transcripts = [];
  const mic = createMicrophoneController({onError: error => errors.push(error), onTranscript: value => transcripts.push(value)}, fake.environment);
  mic.start();
  fake.instances[0].onerror({error: 'not-allowed'});
  fake.instances[0].onend();
  assert.equal(mic.getState().status, 'error');
  assert.match(errors[0].message, /permission was denied/);
  assert.equal(mic.start(), true);
  const stale = fake.instances[1];
  mic.abort();
  assert.equal(stale.aborted, true);
  stale.onresult({results: [recognitionResult('stale transcript', true)]});
  stale.onend();
  assert.equal(transcripts.length, 0);
  assert.equal(mic.getState().status, 'idle');
  mic.dispose();
  assert.equal(mic.start(), false);
  const unavailable = createMicrophoneController({}, {});
  assert.equal(unavailable.supported, false);
  assert.equal(unavailable.start(), false);
  assert.equal(unavailable.getState().status, 'unavailable');
});


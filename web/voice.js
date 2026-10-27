// Browser-native speech. No credentials or external TTS service are required.
// Voice names and quality depend on the operating system and browser.
const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};
const baseLanguage = value => String(value || '').toLowerCase().split('-')[0];

export function rankVoices(voices, language = 'en-US') {
  const requested = language.toLowerCase();
  const score = voice => {
    const locale = String(voice.lang || '').toLowerCase();
    let result = locale === requested ? 1000 : baseLanguage(locale) === baseLanguage(requested) ? 940 : 0;
    if (/natural|neural|enhanced|premium/i.test(voice.name)) result += 100;
    if (/google|microsoft.*online|samantha|ava|aria|jenny|daniel/i.test(voice.name)) result += 40;
    if (voice.default) result += 10;
    return result;
  };
  return [...voices].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
}

// Avoid browser utterance-length limits while retaining every character.
// Sentence boundaries are preferred, then spaces; unbroken words are split.
export function splitSpeechText(text, maxLength = 180) {
  let remainder = String(text ?? '');
  const limit = Math.max(20, Number(maxLength) || 180);
  const chunks = [];
  while (remainder.length > limit) {
    const sample = remainder.slice(0, limit + 1);
    const endings = [...sample.matchAll(/[.!?;:\n](?:\s|$)/g)];
    let boundary = endings.at(-1)?.index;
    let length = boundary !== undefined && boundary >= limit / 3 ? boundary + 1 : sample.lastIndexOf(' ', limit);
    if (length < limit / 3) length = limit;
    else if (sample[length] === ' ') length++;
    // Never leave half a UTF-16 surrogate pair on each side of a chunk.
    if (/^[\uDC00-\uDFFF]$/.test(remainder[length]) && /[\uD800-\uDBFF]$/.test(remainder.slice(0, length))) length--;
    chunks.push(remainder.slice(0, length));
    remainder = remainder.slice(length);
  }
  if (remainder.length) chunks.push(remainder);
  return chunks;
}

const speechErrors = {
  'not-allowed': 'Audio was blocked. Click Read message to allow speech in this browser.',
  'audio-busy': 'The audio device is busy. Stop other audio and try again.',
  'audio-hardware': 'The audio device is unavailable. Check your output device.',
  'network': 'This voice needs a network connection. Try another installed voice.',
  'language-unavailable': 'No voice is available for this language. Choose an installed voice.',
  'voice-unavailable': 'The selected voice is unavailable. Choose another voice.',
  'synthesis-unavailable': 'Speech synthesis is unavailable. Captions and playback still work.',
  'synthesis-failed': 'Speech could not be generated. Choose another voice and try again.'
};

export function createSpeechController(callbacks = {}, environment = globalThis) {
  const synth = environment.speechSynthesis;
  const Utterance = environment.SpeechSynthesisUtterance;
  const supported = Boolean(synth && Utterance);
  const schedule = environment.setTimeout?.bind(environment) || setTimeout;
  const unschedule = environment.clearTimeout?.bind(environment) || clearTimeout;
  let state = {status: supported ? 'loading' : 'unavailable', message: supported ? 'Loading installed voices…' : 'This browser does not support speech output. Captions remain available.'};
  let voices = [], serial = 0, current = null, chunks = [], currentIndex = 0, options = {}, disposed = false, paused = false, voiceTimer = null, polls = 0;
  const emit = (status, message, detail = {}) => {
    state = {status, message, ...detail};
    callbacks.onState?.({...state});
  };
  const descriptors = (language = 'en-US') => rankVoices(voices, language).map(voice => ({
    voiceURI: voice.voiceURI, name: voice.name, lang: voice.lang,
    localService: Boolean(voice.localService), default: Boolean(voice.default)
  }));
  const refreshVoices = () => {
    if (disposed || !supported) return [];
    try { voices = synth.getVoices() || []; } catch { voices = []; }
    callbacks.onVoices?.(descriptors());
    if (['loading', 'idle'].includes(state.status)) emit('idle', voices.length ? 'Choose a voice, then read your text aloud.' : 'Using the browser default voice. Installed voices may load after the first playback.');
    return descriptors();
  };
  const pollVoices = () => {
    refreshVoices();
    if (!disposed && !voices.length && polls++ < 5) voiceTimer = schedule(pollVoices, 500);
    else voiceTimer = null;
  };
  const cancel = () => {
    serial++;
    current = null;
    chunks = [];
    currentIndex = 0;
    paused = false;
    if (supported) try { synth.cancel(); if (synth.paused) synth.resume(); } catch { /* Some embedded browsers lack audio access. */ }
  };
  const stop = () => {
    cancel();
    if (!disposed) emit(supported ? 'stopped' : 'unavailable', supported ? 'Speech stopped.' : 'Speech output is unavailable in this browser.');
  };
  const next = token => {
    if (disposed || token !== serial || paused) return;
    if (currentIndex >= chunks.length) {
      current = null;
      emit('idle', 'Finished reading aloud.', {completed: true});
      return;
    }
    const utterance = new Utterance(chunks[currentIndex]);
    current = utterance;
    utterance.lang = options.lang;
    utterance.rate = options.rate;
    utterance.volume = options.volume;
    utterance.pitch = 1;
    const selected = voices.find(voice => voice.voiceURI === options.voiceURI) || rankVoices(voices, options.lang)[0];
    if (selected) utterance.voice = selected;
    const detail = () => ({chunk: currentIndex + 1, totalChunks: chunks.length, voiceName: selected?.name || 'Browser default'});
    utterance.onstart = () => { if (!disposed && token === serial) emit(paused ? 'paused' : 'speaking', paused ? 'Speech paused.' : 'Reading aloud…', detail()); };
    utterance.onend = () => {
      if (disposed || token !== serial) return;
      current = null;
      currentIndex++;
      next(token);
    };
    utterance.onerror = event => {
      if (disposed || token !== serial) return;
      if (['interrupted', 'canceled'].includes(event.error)) { stop(); return; }
      const message = speechErrors[event.error] || 'Audio is unavailable. Try another voice or use the on-screen captions.';
      cancel();
      emit('error', message);
      callbacks.onError?.({code: event.error || 'synthesis-failed', message});
    };
    try { synth.speak(utterance); }
    catch (error) {
      if (token !== serial) return;
      cancel();
      const message = 'Audio could not start. Click Read message or choose another voice.';
      emit('error', message);
      callbacks.onError?.({code: 'start-failed', message, error});
    }
  };
  const speak = (text, settings = {}) => {
    if (disposed) return false;
    cancel();
    if (!supported) { emit('unavailable', 'Speech output is unavailable in this browser. Captions remain available.'); return false; }
    if (settings.muted || Number(settings.volume ?? 1) === 0) { emit('muted', 'Speech is muted.'); return false; }
    const value = String(text ?? '');
    if (!value.trim()) { emit('idle', 'Enter text before reading aloud.'); return false; }
    refreshVoices();
    options = {voiceURI: settings.voiceURI, lang: settings.lang || 'en-US', rate: clamp(settings.rate, 0.5, 2, 1), volume: clamp(settings.volume, 0, 1, 1)};
    chunks = splitSpeechText(value);
    emit('queued', 'Preparing speech…', {chunk: 1, totalChunks: chunks.length});
    next(serial);
    return true;
  };
  const onVoicesChanged = () => refreshVoices();
  if (supported) {
    if (synth.addEventListener) synth.addEventListener('voiceschanged', onVoicesChanged);
    else synth.onvoiceschanged = onVoicesChanged;
    pollVoices();
  } else callbacks.onState?.({...state});
  return {
    supported, speak, stop, refreshVoices,
    getVoices: descriptors,
    getState: () => ({...state}),
    pause() {
      if (!supported || disposed || !['queued', 'speaking'].includes(state.status)) return false;
      paused = true;
      try { synth.pause(); emit('paused', 'Speech paused.'); return true; }
      catch { paused = false; return false; }
    },
    resume() {
      if (!supported || disposed || !paused) return false;
      paused = false;
      try { synth.resume(); emit('speaking', 'Reading aloud…'); if (!current) next(serial); return true; }
      catch { stop(); return false; }
    },
    dispose() {
      disposed = true;
      cancel();
      if (voiceTimer !== null) unschedule(voiceTimer);
      if (synth?.removeEventListener) synth.removeEventListener('voiceschanged', onVoicesChanged);
      else if (synth?.onvoiceschanged === onVoicesChanged) synth.onvoiceschanged = null;
    }
  };
}

const microphoneErrors = {
  'not-allowed': 'Microphone permission was denied. Allow microphone access in browser settings, then try again. You can always type instead.',
  'service-not-allowed': 'Speech recognition is blocked by this browser. You can type your message instead.',
  'audio-capture': 'No microphone is available. Connect a microphone or type your message.',
  'no-speech': 'No speech was detected. Try again, or type your message.',
  'network': 'Speech recognition could not connect. Check your connection or type your message.',
  'language-not-supported': 'Speech recognition does not support this language. Choose another language or type your message.'
};

export function createMicrophoneController(callbacks = {}, environment = globalThis) {
  const Recognition = environment.SpeechRecognition || environment.webkitSpeechRecognition;
  const supported = Boolean(Recognition);
  let state = {status: supported ? 'idle' : 'unavailable', message: supported ? 'Start listening, then review the transcript before signing.' : 'Speech input is unavailable in this browser. Type your message instead.'};
  const schedule = environment.setTimeout?.bind(environment) || setTimeout;
  const unschedule = environment.clearTimeout?.bind(environment) || clearTimeout;
  let instance = null, token = 0, disposed = false, finalText = '', probing = false, timer = null, finishing = false, cancelProbe = null;
  const clearTimer = () => { if (timer !== null) unschedule(timer); timer = null; };
  const later = (callback, milliseconds) => { clearTimer(); timer = schedule(callback, milliseconds); timer?.unref?.(); };
  const emit = (status, message, detail = {}) => { state = {status, message, ...detail}; callbacks.onState?.({...state}); };
  const abort = () => {
    token++;
    clearTimer();
    cancelProbe?.(); cancelProbe = null;
    const previous = instance;
    const wasActive = Boolean(previous) || probing;
    probing = false;
    instance = null;
    try { previous?.abort(); } catch { /* Already ended recognition needs no cleanup. */ }
    // Switching tabs cleans up an active session, but must not replace an
    // untouched start prompt, completed transcript or useful permission error.
    if (!disposed && wasActive) emit('idle', 'Listening canceled. Your text remains editable.');
  };
  const start = ({lang = 'en-US', processLocally = false} = {}) => {
    if (!supported || disposed) { if (!disposed) emit('unavailable', state.message); return false; }
    if (instance || probing) return false;
    const activeToken = ++token;
    let recognition;
    try { recognition = new Recognition(); }
    catch (error) { const message = 'Could not create speech recognition. Type your message instead.'; emit('error', message); callbacks.onError?.({code: 'start-failed', message, error}); return false; }
    instance = recognition;
    finalText = '';
    finishing = false;
    const service = processLocally ? 'On-device recognition' : 'Browser speech service';
    const fail = (code, message, error) => {
      if (disposed || activeToken !== token) return;
      // Some engines emit an error without onend. Release immediately so Retry works.
      token++; clearTimer(); instance = null;
      try { recognition.abort(); } catch { /* The engine may already be closed. */ }
      emit(code === 'aborted' ? 'idle' : 'error', message, {recording:false, service});
      if (code !== 'aborted') callbacks.onError?.({code, message, error});
    };
    const finishWatchdog = () => later(() => fail('finish-timeout', 'The speech service did not finish. Your text is preserved and editable. Retry or type instead.'), 10000);
    recognition.lang = lang;
    if (processLocally) recognition.processLocally = true;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      if (disposed || activeToken !== token || finishing) return;
      later(() => stop(), 60000);
      emit('listening', 'Listening… speak your message.', {recording:true, service});
    };
    recognition.onspeechend = () => { if (!disposed && activeToken === token) { finishing = true; finishWatchdog(); emit('processing', 'Preparing your transcript…', {recording:false, service}); } };
    recognition.onresult = event => {
      if (disposed || activeToken !== token) return;
      const complete = [], partial = [];
      for (let index = 0; index < event.results.length; index++) {
        const result = event.results[index], transcript = (result[0]?.transcript || '').trim();
        (result.isFinal ? complete : partial).push(transcript);
      }
      finalText = complete.join(' ').trim();
      const interimText = partial.join(' ').trim();
      const text = [finalText, interimText].filter(Boolean).join(' ');
      callbacks.onTranscript?.({text, finalText, interimText, isFinal: !interimText && Boolean(finalText)});
      if (!interimText) { finishing = true; finishWatchdog(); }
      emit(interimText && !finishing ? 'listening' : 'processing', interimText ? 'Listening… recognized text is updating below.' : 'Transcript ready. Review and correct the text, then sign it.', {recording: Boolean(interimText) && !finishing, transcript:text, service});
    };
    recognition.onerror = event => {
      if (disposed || activeToken !== token) return;
      const message = event.error === 'aborted' ? 'Listening canceled. Your text remains editable.' : microphoneErrors[event.error] || 'Microphone input failed. Try again or type your message.';
      fail(event.error || 'recognition-failed', message);
    };
    recognition.onend = () => {
      if (disposed || activeToken !== token) return;
      token++; clearTimer(); instance = null;
      emit('idle', finalText ? 'Transcript ready. Review and correct the text, then sign it.' : 'Listening ended. Start again or type your message.', {recording:false, transcript:finalText, service});
    };
    emit('starting', 'Waiting for microphone access…', {recording:false, service});
    later(() => fail('start-timeout', 'Microphone access did not start. Check permissions, retry, or type your message.'), 12000);
    try { recognition.start(); return true; }
    catch (error) {
      const message = 'Could not start the microphone. Check browser permissions, or type your message.';
      fail('start-failed', message, error);
      return false;
    }
  };
  const startPreferred = async ({lang = 'en-US'} = {}) => {
    if (!supported || disposed || instance || probing) return false;
    if (typeof Recognition.available !== 'function') return start({lang});
    const probeToken = ++token;
    probing = true;
    emit('checking', 'Checking for an installed on-device speech engine…', {recording:false});
    // Never install a language pack or require a download. A blocked or slow probe
    // falls back to the existing browser provider after one second.
    const availability = Promise.resolve().then(() => Recognition.available({langs:[lang], processLocally:true})).catch(() => 'unavailable');
    const timeout = new Promise(resolve => { cancelProbe = () => resolve('canceled'); later(() => resolve('unavailable'), 1000); });
    const available = await Promise.race([availability, timeout]);
    if (disposed || probeToken !== token) return false;
    clearTimer(); probing = false; cancelProbe = null;
    return start({lang, processLocally:available === 'available'});
  };
  function stop() {
    if (probing) { abort(); return true; }
    if (!instance || disposed) return false;
    finishing = true;
    emit('processing', 'Finishing your transcript…', {recording:false, service:state.service});
    const activeToken = token, previous = instance;
    later(() => {
      if (disposed || activeToken !== token) return;
      abort();
      emit('error', 'The speech service did not finish. Your text is preserved and editable. Retry or type instead.', {recording:false});
    }, 10000);
    try { previous.stop(); return true; }
    catch { abort(); return false; }
  }
  callbacks.onState?.({...state});
  return {
    supported, start, startPreferred, stop, abort, getState: () => ({...state}),
    dispose() { disposed = true; abort(); }
  };
}

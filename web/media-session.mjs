// Coordinate the existing controllers. Explicit read-along is the only audio
// allowed alongside signing; recognition always gets an exclusive session.
export function createMediaSession({avatar, speech, microphone}) {
  return {
    beforePlayback(){microphone()?.abort();speech()?.stop();},
    beforeListening(){speech()?.stop();avatar()?.pause();},
    beforeSpeech({readAlong=false}={}){microphone()?.abort();if(!readAlong)avatar()?.pause();},
    beforeResume(){microphone()?.abort();}
  };
}

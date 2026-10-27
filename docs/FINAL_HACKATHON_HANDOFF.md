# Sign Studio — final hackathon prototype handoff

16 October 2026. Team: Beyond Words. Avatar: Aarav. This is an ASL research
vocabulary prototype, with explicit missing coverage and no claim of reviewed
sentence translation. There are **zero approved ASL clips**; four older word
recordings are available as explicit research previews. This polish pass adds
no signs, approved phrase templates or new linguistic claims.

## Start

In PowerShell:

```powershell
Set-Location 'C:\Users\himan\OneDrive\Desktop\Sing Lang\Sign-Language-Interpreter-using-Deep-Learning'
node server.mjs
```

Open http://127.0.0.1:3000/ . Keep the terminal running; Ctrl+C stops the server.
Alternatively double-click `start-studio.cmd` in the same folder. The launcher
checks Node.js 22.13+, both runtime dependencies, the optional bundled Node
fallback and `SIGN_PORT`. Re-running it recognizes an existing healthy studio.
For a fresh checkout with missing dependencies, install Node 22.13+ and run
`npm install` once. Dependencies are already present on this computer.

## Reliable demonstration

1. Explain the English-input / ASL-vocabulary scope and the unverified status.
2. Select **Try the demo**. Review Help and press **Play reviewed preview**.
3. Pause, resume, replay and change speed. Seeking holds the actual source
   frame; source timing, hand orientation and finger animation are preserved.
4. Try **Love · affection** to demonstrate an explicit meaning choice. The
   paused review card offers **Resume reviewed preview**.
5. Enter **Hi, How are you?**. Show that missing words and incomplete phrase
   support remain visible. Do not call the available word subset a sentence.
6. Optionally use Microphone → Start → Stop → correct text → Use reviewed
   text. If the browser speech provider cannot connect, choose **Type instead**.
7. Open Motion library → Developer & review for provenance, manual inspections
   and the five-expression review handoff. That kit contains pending sources,
   not five enabled phrase translations.

The longer timed script and first-time-user protocol are in
`docs/JUDGE_DEMO_AND_USER_TEST.md`. Its human sessions remain unrun.

## Changes in this pass

- Preserved the vanilla JS/Three.js/Node/SQLite stack, original Rocketbox GLB,
  grey hoodie, textured crop, clean-shaven face, source recordings and all
  uncommitted work. No public deployment, purchases or third-party contact.
- Added direct **Retry selected motions** after download/preparation failures.
  It retains exact input, interpretation and queue; it does not re-submit the
  API request, add history, autoplay or select substitute animations.
- Added visible graphics-loss feedback and **Restart 3D viewer**. Graphics
  recovery retains the queue and requires explicit resume. Restart reloads the
  viewer while retaining input and restoring the selected queue without a new
  translation history entry. Meaning choices and correction decisions survive.
- Text interpretation/coverage remains usable after initial model failure.
  Playback stays unavailable until the 3D viewer recovers. Errors explain the
  typed fallback and reconnect action in plain language.
- Coordinated speech, recognition and signing controllers. Starting recognition
  pauses signing/stops speech; starting playback/resuming ends recognition;
  manual Read message pauses signing. The existing explicit read-along option
  can accompany animation. Transcript corrections never auto-submit.
- Refined status typography, focus outlines, stage background, recovery panels
  and storage notice. The current sign caption is announced per sign; progress
  is not an aria-live stream. Recognition interim text updates the editable
  transcript without repeatedly announcing its entire contents. Unchanged
  connection labels are not rewritten on every heartbeat.
- Bundled the existing DM Sans/Manrope fonts with original OFL notices, pinned
  sources and hashes. Removed Google Fonts CSS requests. Font files total
  **404,864 bytes**. Static checking validates font hashes and licenses.
- Added low-priority cache hints only for Help and Yes after startup. Their
  bundled files total **1,749,417 bytes**. Hints may be ignored by the browser
  and are skipped when Save-Data/2G is reported. No rig preflight blocks input,
  no new vocabulary is enabled, and the full library is not prefetched.
- Retained DPR cap 1.5, bounded motion cache, lazy library DOM, source-pose
  framing, request cancellation and explicit review gates.
- Fixed malformed URL encoding returning a 500; it now returns a clear 400.
  The server remains bound to loopback, with same-origin API checks, bounded
  input, HttpOnly session cookie, safe text rendering and no frontend API keys.

## Recoverable checkpoint

`../.checkpoints/before-final-polish-20261016-192741/` contains `project.zip`
(793 entries, 222,956,666 bytes), per-file SHA-256 manifest, restore notes and
a consistent SQLite backup. Archive CRC verification passed; SQLite
`PRAGMA quick_check` returned `ok`. Git history and generated dependencies
are not copied; original source/assets and uncommitted files are included.
Extract into a separate directory to inspect; never overwrite a running DB.

## Verification evidence

| Area | Result |
| --- | --- |
| Baseline | Static checks and 30 focused existing behavior tests passed before edits. |
| Full test suite | **81 tests passed**, zero failures, 135.9 seconds; includes actual rig/framing, motion loading, immutable hashes, source/meaning gates, 500-word queue, repeated imports, voice recovery and media coordination. |
| Final focused tests | **25 tests passed**, covering API, media coordination, voice, demo routing and phrase-readiness gates; malformed URL regression included. |
| Static check | 47 JS files, 170 unique HTML IDs, existing local assets, all 153 immutable research motion files, provenance and local font hashes. |
| Missing motion in browser | Isolated local in-memory fixture deliberately returned 503 for Love. Play stayed disabled, exact text stayed visible, Retry reached Queue ready, and history remained one entry. Recovered playback/pause worked. |
| Missing model in browser | Isolated fixture returned 503 for GLB. Typed coverage still worked; Reconnect loaded Aarav and retained the exact typed message. |
| Main text journey | Ctrl+Enter processed `I need hepl!`; the correction was displayed, Undo & rebuild restored `hepl` and removed the unmatched motion. |
| Meaning preservation | Name Help, negation and `12345` retained; ambiguous bank exposed financial/riverbank choices; quasar stayed missing; 500-word input completed without truncation. |
| Playback | Main examples, Play/Pause/Resume/Replay/Stop, seeking, speed and the paused review-card action worked. Starting microphone while signing paused the avatar. |
| Keyboard | Enter activated playback/pause; input tabs responded to ArrowRight and Home; Ctrl+Enter submitted; native range keys sought source frames. Visible focus inspected. |
| Responsive | 320/390/768/1440 CSS widths had equal client/scroll widths. Actual desktop/mobile source frames inspected; face and both hands stayed inside the stage. |
| Fonts and startup | Local font files served as `font/ttf`; both families selected by CSS, source/license hashes verified. Launcher smoke test recognized the existing server. |
| Errors | Controlled fixture failures produced expected errors. Main studio has no unexpected console warnings/errors in final inspection. |

Logs: `docs/final-polish-tests-20261016.log` and
`docs/final-polish-focused-20261016.log`. Screenshots are under
`docs/screenshots/final-polish-20261016/`. In-app full-document captures can
misplace sticky/fixed elements; DOM bounds and normal viewport captures were
used to distinguish capture artifacts from actual overflow.

## Limitations and unverified areas

- No fluent-ASL approval, accurate general conversation translation, validated
  fingerspelling, reviewed complete sentence grammar or ISL output. Changing
  speech/interface language does not change the signed language. ASL/ISL stay
  explicitly separate. Cosmetic changes are not linguistic validation.
- The three CLERC candidates remain outside runtime. Their keypoint format
  needs compatible retargeting and linguistic/nonmanual review. Two target
  exact phrase sources remain missing. See the existing five-phrase audit.
- Real microphone startup/retry/stop was tested; the browser's provider still
  returns a network error here. Successful real transcription, acoustic voice
  quality, physical camera recognition, OS permission-denial UI and diverse
  actual phones/GPUs were not verified. Denial/unavailable/timeouts are covered
  with controlled automated provider tests.
- Graphics context loss/restoration is verified by the real player with its
  controlled renderer tests. Physical driver loss and the browser's actual
  native context-restoration event were not induced. Reduced-motion CSS and
  player behavior were inspected; no OS preference was changed for testing.
- There is no service-worker/PWA offline install. With dependencies installed
  and the local server running, typed text/assets use loopback. Browser speech
  recognition or remote TTS voices may require their providers/internet.
- History stores up to 200 results locally in SQLite for this browser token;
  messages are not anonymous, and cookie clearing can lose access to that
  history. Export/Clear are available. The app does not store microphone audio
  or camera video. The browser recognition provider's behavior is separate.
- No specialist accessibility audit or human usability study has occurred.
  No accuracy percentage, endorsement, partnership or human review was invented.

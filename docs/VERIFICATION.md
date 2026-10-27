# Verification record — 12 October 2026

This verifies the working vocabulary prototype, not sign-language correctness.
The original intended signed language is ASL. Default validated vocabulary is
empty; four recorded research candidates and six legacy demos remain unverified.

## Commands and automated results

Run from the repository root with Node 22.13 or newer:

```sh
node scripts/check.mjs
node --test web/phrases.test.mjs backend/*.test.mjs
node server.mjs
```

Syntax, 104 unique UI IDs, required local assets, four motion-only files and
license/review notices passed checking. All **31 automated tests passed**.
There is no separate bundler/build step in this static ES-module application.
API tests require local loopback sockets; the initial sandboxed attempt failed
with EACCES, and the authorized loopback-enabled run passed.

Tests cover API/session input protection, limits, SQLite persistence/restart,
history/export/delete in isolated test stores, text positions/order/punctuation,
review gates and forged approval rejection, 500 words, explicit meanings,
licensed motion structure, real avatar rig/skin samples, frame bounds,
upright/frontal posture, hand/finger/palm calibration, contact proxies,
playback cleanup/repetition, speech chunk preservation/controls/fallback, and
microphone transcription and permission-error behavior through API doubles.

## Browser results

The localhost app was inspected through the in-app browser. Viewport size was
measured in the DOM rather than inferred from device-pixel dimensions:
**1280×900 desktop** and **360×800 mobile**. The mobile document was 352 CSS
pixels wide; desktop was 1272. No horizontal overflow was observed, including
the 500-word input, coverage and long history cards.

| Scenario | Observed result |
| --- | --- |
| Greeting and multi-sentence paragraph, Validated mode | Full text retained; zero approved motions; missing/pending words visible; Play disabled |
| Old history replay, Validated mode | Reprocessed through the current gate; cached legacy motions did not become approved |
| `Hello, please help me.`, Demo mode | Two illustrative clips; `please` and `me` unsupported |
| `No love. I love you.`, Research mode without senses | Zero clips; No/Love meaning controls and all five unassigned words visible |
| `Help. Yes. No. I love you.`, Research mode with explicit senses | Four recorded lexical candidates; `I` and `you` unsupported; no complete-sentence/ILY claim |
| 500-word Research example with explicit No/Love senses | 400 ordered motions and 100 unsupported `unknown` words; all 400 queue rows expandable; highlighted source exactly equals original 2,799-character input |
| 500-word Demo example | 300 illustrative clips, 100 unsupported words; playback/pause/stop remained functional |
| `quasar astrophysics xylophone` | Zero clips; all three terms reported; no fallback; Play disabled |
| Repeated controls | Play, pause, resume, replay, stop, and speed exercised; Stop retained the queue; repeated submissions replaced prior playback |
| Source animation visual checks | YES upright/raised fist, HELP hands together, NO two-hand interval near face, LOVE crossed arms at chest; face and both hands visible on mobile; HELP also checked on desktop |
| Voice selection, rate, volume, read/stop/mute | Installed English voice selection worked; rate readout 1.1×, volume 90%; stop/mute canceled speech state |
| Transcript correction | Editable text copied to composer by Use reviewed text without automatically submitting |
| Library/search | Four sourced cards and four source/license/review records; Yes search filtered correctly |
| Server stopped/restarted | Useful disconnected error and enabled reconnect state; health polling restored connectivity after restart; reload restored usable controls and preserved history |

Normal playback and final interface checks produced no captured console errors.
The earlier whole-body tilt and HELP contact gap found during visual testing
were corrected and received new source/target posture/contact regressions.
Source terminal reset frames are excluded only from runtime sampling, with raw
tracks retained. See SIGN_DATA_VALIDATION.md for numerical results and limits.

Screenshot: `docs/screenshots/aarav-research-mobile.jpg` shows the corrected
HELP preview with the visible **unverified research** label. Browser screenshots
are observations, not fluent-signer approval. The browser's full-page capture
cropped incorrectly at the host display scale, so the saved proof uses its
normal viewport capture instead.

## Checks not completed / remaining blockers

- No fluent ASL signer or qualified interpreter reviewed the exact rendered
  assets and mappings. Default activation remains blocked by that review.
  NO's exact source variant/sense needs priority assessment.
- Full ASL grammar, directional agreement, semantic facial expressions, and
  reviewed fingerspelling are not supplied by the current resources.
- Real microphone audio, vendor transcription accuracy, live camera detection,
  and physical speaker/voice quality were not verified. Permission denial and
  cancellation were tested through browser API doubles; transcript editing and
  speech controls were tested in the browser.
- Mobile layout was emulated; no physical mobile device was used.
- Rylo's complete proprietary lexicon/latest hosted models were not obtained.
  Its generated outputs were not downloaded or imported. Public workflow,
  official code/docs and resource-specific licenses were investigated.
- Source avatar mesh/texture rights and complete compiled MediaPipe WASM
  third-party notice inventory remain unresolved; source meshes are private,
  and the software/model notice findings are documented separately.

No assets or valuable history were deleted. No public deployment, purchase,
third-party contact or private endpoint access was performed.

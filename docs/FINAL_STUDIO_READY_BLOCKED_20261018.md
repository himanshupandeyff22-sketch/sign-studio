# Final studio: READY / BLOCKED

18 October 2026 · Beyond Words · Aarav · American Sign Language (ASL)

## READY — working prototype demonstration

| Area | Result |
| --- | --- |
| Windows startup | Existing `start-studio.cmd` passed dependency/version checks, recognized the running studio and started a fresh server successfully. Node 22.13+ required; this machine uses Node 24.19.0. |
| First screen | Compact green/cream hero, working two-column studio. At the observed 1365 × 768 CSS viewport, the stage ended at y=722 and the primary action at y=650; avatar, text input and action were visible together. |
| Primary flow | Enter English → review interpretation/missing coverage → Play. Four technically checked local research examples; no load-time signing/speech/microphone autoplay. |
| Playback | One state-aware Play/Pause/Resume/Replay primary button, plus Replay, Stop, speed and seek bar. Keyboard Enter, pause/resume, seek-to-end, replay and stop passed in-browser. |
| Avatar visibility | Retained human model/appearance. A tighter initial envelope still expands using actual face/hand/finger bounds and full queued recording preflight. Automated actual-rig tests covered every recording at desktop/mobile/narrow stages. Help and two-handed Family were visually inspected. |
| Fullscreen/reset | Native fullscreen was observed (`:fullscreen` true; 767.8 px viewer in a 768 px viewport), exited successfully, and Reset Camera worked. Expanded-view fallback supports Escape. Reset Preview cancels media/loading, retains typed text and lets users rebuild. |
| Asset recovery | An isolated in-memory test deliberately failed Love with HTTP 503. Play disabled, exact input stayed intact, Retry restored the same queue, and playback/pause worked. No substitute motion or private-history deletion. |
| Mobile | Actual 390 × 844 CSS viewport; face, both hands and signing space visible during Help frame inspection. Keyboard controls and Sources/About navigation worked. Document client/scroll widths matched at 373 px; no horizontal overflow. |
| Navigation | Studio; Explore ASL; Sources & Review; About. History remains available through Recent activity. Each inspection returns to its originating search/review view. Team names/roles have equal cards in About; existing footer credits remain. |
| Interpretation | `I need hepl!` showed `I need help!`; Undo restored the original. Financial bank/riverbank clarification remained separate. Names, numbers, negation and unsupported terms stayed held. 500-word input completed with 200 mapped source words and explicit missing coverage; input acceptance is not full translation. |
| Microphone safeguards | Start is explicit; transcript editable before submission. Automated permission-denial, provider-error, restart/cancellation and unsupported-browser tests passed. Typed fallback remains available. |

## Current counts from files and manifests

`STUDIO_ASSET_AUDIT_20261018.json` records per-file structure, SHA-256/content
identity and target-rig checks. `backend/readiness.mjs` verifies current bytes
and the actual avatar hash against that report when the server starts.

| Measure | Count |
| --- | ---: |
| Registered motion files / present files | 207 / 207 |
| Unique registered file hashes / normalized content hashes | 207 / 207 |
| Format/hash checks passed | 207 |
| Aarav numeric rig checks passed | 207 |
| Missing files / duplicate registrations found | 0 / 0 |
| Candidate canonical concepts | 268 |
| Concepts with text-linked research previews | 4 |
| Local guided research examples | 4 |
| Approved ASL signs | 0 |
| Approved complete avatar sentence animations | 0 |
| Complete signer videos bundled locally | 0 |
| External complete-recording references retained | 8 |
| Browser-checked full recording offered publicly | 1 |

No signs, mappings or reviewer approvals were added. All original import,
provenance, sense/variant and review records remain. Technical compatibility
does not verify handshape meaning, physical skin contact, facial grammar or
source-to-target linguistic equivalence.

## Complete sentences: working output only

Pending CLERC captions/keypoints and seven untested video references are no
longer offered as public sentence choices. How are you? and What is your name?
remain removed. They survive in the source index and review worklist, not as
working options. Manually typed unsupported sentences still report coverage;
they do not silently receive invented or concatenated full-sentence output.

Explore ASL → Recorded signer video offers only the previously browser-observed
2M-Flores-ASL dev 390 recording (Sanskrit/Latin caption), separate from Aarav.
Its original unmodified recording and CC BY-SA 4.0 attribution remain visible.
It requires internet and a supported codec; its 57 MiB source size is disclosed.
Only this original recording has browser playback evidence; no full-file local
video hash verification or independent linguistic approval is claimed.

## Loading, resources and accessibility

- Motion downloads remain on demand; browsing/search does not fetch the full
  library. Only Help/Yes have optional low-priority cache hints, skipped for
  reported Save-Data/slow connections. The prepared cache is bounded to 40
  inactive entries; an active/replay queue may retain its needed unique clips.
- Source video starts only on an explicit Watch action. Closing/editing/switching
  input releases its source. During a recording, the avatar render loop is
  suspended; closing or starting an avatar action wakes it without undoing user
  pause. Streams, audio, pending requests, page listeners and rendering resources
  retain the existing cancellation/disposal paths.
- Native buttons, labelled selects/ranges, arrow-key input tabs, Ctrl+Enter
  submission and visible focus remain. Active controls have 44 px targets;
  reduced-motion rules disable decorative transitions. Clear loading, missing
  coverage, buffering and retry/reset states remain visible.
- No configured paid speech service or frontend API key. Browser speech
  synthesis uses available voices; microphone transcription may use the browser
  provider's service. Sign Studio stores reviewed text, not raw audio. The
  optional source video connects to Hugging Face; local fonts and demo motions
  stay local. Camera pose demonstrations remain separate from ASL recognition.

## Verification and limits of the evidence

- Full suite: **93 passed, 0 failed**, including the changed camera envelope,
  actual rig/framing, immutable motion data, meaning gates, long input, imports,
  voice/media lifecycle and existing camera regressions. Log:
  `final-studio-tests-20261018.log`.
- Follow-up: **30 focused tests passed**, including the two new readiness/
  public source eligibility checks, interpretation, voice permission failures,
  media coordination and cancellation. Log:
  `final-studio-focused-tests-20261018.log`.
- Five readiness/demo tests passed again after the final count-derivation change.
  Static checks validate JavaScript, unique HTML IDs, local model/dependencies,
  all 207 immutable motion files, fonts, licenses and source/review notices.
- Windows in-app Chromium browser: desktop/mobile screenshots, keyboard
  playback, fullscreen, resets, interpretation/500 words, navigation, missing
  asset recovery and recorded-video/animation handoff were inspected.
- The fixture's deliberate 503 is a simulated failure. Automated voice tests
  simulate permission/provider errors; **live microphone audio, actual OS
  permission prompts, real camera recordings and human ASL comprehension were
  not exercised in this pass**. No fabricated accuracy, benchmark FPS or
  multi-browser guarantee. No quantified speedup claim.

Screenshots are in `screenshots/final-studio-20261018/`, including
`desktop-first-screen.png`, `mobile-playback.png`, `fullscreen.png`,
`family-framing-desktop.png` and `recovered-motion.png`.

## BLOCKED — linguistic completeness, not the local demo

Full English-to-ASL grammatical translation, validated fingerspelling and
complete Aarav utterances still need compatible licensed assets, retargeting
of point/video sources and qualified ASL review. All 207 recordings remain
linguistically unapproved. The external recording needs its host/network/codec.
Live speech-provider availability varies by browser/device. None blocks the
typed four-example local vocabulary demonstration.

## Start and three dependable examples

```powershell
Set-Location 'C:\Users\himan\OneDrive\Desktop\Sing Lang\Sign-Language-Interpreter-using-Deep-Learning'
node server.mjs
```

Open http://127.0.0.1:3000/. Or double-click `start-studio.cmd`, leaving its
window open. For a fresh checkout, install Node 22.13+ and run `npm install`
once. Current dependencies are already installed; no paid service/API key.

1. **Try local demo → Help → Play**. Pause/resume, seek, replay and stop.
2. **Yes** research example → review → Play.
3. **Love · affection** research example → review its explicit sense → Play.
4. **No · negative answer** is also available. All four are unverified ASL
   research recordings, not reviewed conversation translations.

To regenerate technical eligibility after changing assets:
`node scripts/audit-studio-readiness.mjs`, then run the checks and restart the
server. Never change linguistic approval merely because this audit passes.

Pre-edit recoverable checkpoint:
`../.checkpoints/before-studio-final-20261018-215657/` (477 files, 118,632,820-byte
ZIP, CRC checked, consistent SQLite backup). The final tested snapshot is
identified by `TESTED_STUDIO_BUILD.json`. Extract snapshots into a separate
folder and use the consistent SQLite backup before startup; do not overwrite
a running database. Generated dependencies/download caches are excluded and
the original download archives remain untouched in the workspace.

The main demo is complete at this boundary. No further data/features, public
deployment, purchases, training, third-party contact or original-asset deletion
were performed after verification.

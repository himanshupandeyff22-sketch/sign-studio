# Vocabulary expansion verification — 12 October 2026

The earlier `VERIFICATION.md` records the four-motion baseline. This document describes the expanded current implementation. No expert approval or sign-language accuracy percentage is inferred from these results.

## Automated results

`node scripts/check.mjs` passed JavaScript syntax, all 117 UI IDs/references, canonical concept/variant/path invariants, immutable runtime motion hashes and local runtime/model/license files. The app serves native ES modules and has no separate production bundle build.

`node --test web/phrases.test.mjs backend/*.test.mjs` passed **47 tests, zero failures/skips**. API tests ran on temporary loopback servers. Coverage includes:

- Greeting, short sentence, paragraphs, longest phrases, exact source offsets, unsupported vocabulary, repeated submissions, SQLite/session/history/export and server restart.
- Exactly 500 words, all punctuation/text retained, ordered research/demo queues, 10,000-word limit and explicit overflow errors. Source display pagination never truncates stored input.
- Contextual `hepl` correction, undo via source-word decision, suggestions without automatic substitution, protected proper names/numbers/negation and unfamiliar valid words.
- Candidate HELP/assistance equivalence with review gating; bank financial/river edge, light illumination/weight, right direction/correct; per-occurrence clarification.
- Positive HELP vs negated-clause hold; complete `I love you` distinct from the affection clip; reviewed-template selection with clearly synthetic test fixtures. Actual approval records remain empty.
- Both batches remain idempotent. Source/hash/language/sense/variant/path/animation-content conflicts preserve old data. Alias proposals merge only against an existing identified review record; no actual unreviewed alias was merged. Source discovery never enters translation.
- All **28** retargeted clips preserve finite palm/finger calibration, upright/frontal posture and bounded landmark distortion. The real skinned face, hands/fingertips remain framed throughout each clip at desktop/mobile sizes. Repeated queues, pause/resume/stop, resize, hidden/context-loss handling and disposal are covered.
- Browser voice ranking/chunking, 500-word speech text preservation, stale events, stop/mute/errors and editable microphone transcription/permission denial through API doubles.

The CLI was also tried with an old dry-run after the manifest changed. It rejected the stale plan before writing assets or a commit report. Both saved repeat commits added zero motion files, concepts, sources or aliases. Existing source model and four motion paths/hashes remain unchanged.

Final import hardening also requires the claimed source gloss to match the
verified cached archive filename. The seven import regression tests and
project check passed again after that guard. Final importer/UI hashes are in
`vocabulary-final-code-hashes-20261012.json`; it supplements, rather than
overwrites, the earlier immutable asset/renderer snapshot.

## Browser results

The localhost app was inspected in the in-app browser at measured **1280×900 desktop** and **360×800 mobile** CSS viewports. DOM measurements showed no horizontal overflow in the interpretation, library, 500-word coverage and queue. Host display scaling affected desktop screenshot capture; saved evidence uses the mobile viewport.

| Scenario | Observed result |
| --- | --- |
| `I need hepl.` | Interpreted text became `I need help.`; Research queued the old HELP preview while retaining the original `hepl` source span. Undo rebuilt an empty queue with original text; reapply restored it. Edit interpreted text copied editable corrected text and cleared stale playback |
| Ambiguous bank vs money/river context | First bank requested a focused occurrence choice; other bank meanings stayed distinct. User clarification updated that occurrence. Illumination/weight and rightward/correct displayed the resolved selection and remained editable |
| `I do not want help.` plus names/numbers/uncommon text | Negated clause held; no positive HELP motion. Aarav, 12345 and baobab remained unchanged. No irrelevant function-word correction was shown |
| Full 500-word Research sample | 200 clips before No/Love choices, then 400 ordered clips and 100 unsupported `unknown` tokens. All 400 queue rows expanded; opening the source disclosure and expanding it showed exactly all 2,999 original characters |
| Long playback controls | Play, pause, resume, speed, stop and replay exercised. Stop retained the queue; replay worked; mobile had no horizontal overflow |
| Source discovery | 938 source files indexed; 40 then 80 shown via pagination; bank search gave one source filename and two distinct canonical concepts. Counts remained 48/66/49/28/0 |
| New asset inspection | Family, Water, Remember, Please and You inspected during paused mobile frames; Drink inspected on desktop; Want inspected during its later two-hand interval on mobile. Badges explicitly said inspection/unverified and not text translation |
| New text matches | `Family. Water. Remember. Please. You. Drink. Want.` produced zero Research translation clips; all seven terms were reported and Play stayed disabled |
| Greeting paragraph / reviewed transcript | Demo retained Hello → Help → Thank you for `Hello, please help me. Thank you!`. Editable microphone transcript copied `I need hepl.` to the composer without submitting and cleared stale playback |
| Rendering | Face and both hands remained visible in sampled poses; no gross body tilt or exploded finger rig observed. FAMILY handshape/contact, WATER/DRINK mouth location, REMEMBER forehead/contact, PLEASE chest position and YOU direction remain ASL review items. REMEMBER and WANT have substantial recorded idle lead-ins |

Captured normal-run console errors/warnings: **none**. Locator timeouts during inspection were browser-test timing/disclosure issues, not application console errors. Source expansion succeeded after opening its closed disclosure. Playback timers were sampled at slower speed where necessary.

Proof images: `screenshots/family-inspection-mobile.jpg` and `screenshots/vocabulary-library-mobile.jpg`. The JSON review snapshot links every asset to source/runtime/renderer hashes. Screenshots do not validate sign semantics.

## Remaining checks and limitations

No fluent signer/interpreter has reviewed any exact Aarav motion, alias or complete-sentence mapping. The default enabled vocabulary remains zero. The other new clips received full automated rig/framing tests but were not all individually sampled in the browser; no comprehensive visual/linguistic approval is claimed. Facial capture, general ASL grammar, agreement and valid fingerspelling assets remain absent. Bank/light/right have no enabled motions.

Real microphone audio, provider transcription, physical speaker/voice quality and live camera recognition were not tested. Their controls and failure paths are covered by existing API doubles and prior browser checks, not a real-device accuracy assessment. Mobile layout is emulated, not a physical device test. Original CNN models were not executed and historic recognition accuracy was not reproduced.

How2Sign, ASL Citizen, ASLLVD and Rylo resources were investigated but not imported. The 938-file archive index is not a download or validation of every file. No unrestricted translation, full-internet coverage, public deployment, purchase or third-party contact is claimed.

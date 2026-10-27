# Sign Studio expansion and camera handoff — 18 October 2026

Beyond Words · Aarav · American Sign Language (ASL).

54 permitted, unique recorded-motion candidates were integrated for **manual
inspection**, camera capture/confirmation and media cleanup were rebuilt, and
catalog delivery/library rendering were reduced. New recordings do not become
approved translations. Existing architecture, appearance, recordings, aliases,
review gates, footer credits and previously removed public sections are preserved.

## Before and after

| Measure | Before | After |
| --- | ---: | ---: |
| Canonical candidate concepts | 214 | 268 |
| English aliases (excluding inflections) | 233 | 287 |
| Inflections | 216 | 216 |
| Recorded skeletal-motion assets | 153 | 207 |
| Inspection-only recordings | 149 | 203 |
| Text-linked recorded Research previews, unverified | 4 | 4 |
| Fluent-signer-approved signs | 0 | 0 |
| Approved complete ASL phrases | 0 | 0 |
| Valid fingerspelling alphabet | 0 | 0 |
| Existing quarantined complete-phrase keypoint candidates | 3 | 3 |
| Actual model pose categories, excluding None | 7 | 7 |
| Poses handled in the camera UI | 5 | 7 |
| Illustrative pose mappings / distinct responses | 5 / 4 | 5 / 4 |
| Optional confirmed player controls | 0 | 2 |
| Validated camera ASL word classes | 0 | 0 |

Candidate concepts and playable inspection assets are not approved vocabulary.
The four older isolated word previews remain HELP, YES, NO (negative answer)
and LOVE (affection), explicitly unverified. Six older procedural demonstrations
also remain unverified, separate from recorded assets. No asset or synonym was
silently promoted. Ten English expressions were added to a **review worklist**,
not to runtime grammar or approved phrase counts.

## Data obtained and import outcomes

The official [SAPA repository](https://github.com/OlineRanum/SAPA) identifies
**3D-LEX v1.0 data as CC BY 4.0**, separately from its MIT code. The [OSF ASL
component](https://osf.io/mqzyk/) license was rechecked. Seventy bounded GLB
samples were obtained from archive version 1 for a concrete technical audit;
the full archive was not downloaded. Source authors: Oline Ranum, Gomèr
Otterspeer, Jari I. Andersen, Robert G. Belleman and Floris Roelofsen.

54 unique, animated skeletal derivatives were imported through the existing
`scripts/import-asl-motion.mjs` and `web/vocabulary-manifest.json`. New runtime
motions total 51,341,142 bytes and last approximately 2.54–9.17 seconds each.
Only selected motion files are fetched by the player. Raw geometry is not
served or redistributed as the signing avatar. Per-file provenance, exact
source/runtime/normalized-motion hashes, concept/sense, explicit source variant,
license, technical diagnostics and pending review remain in the canonical
manifest. Original source caches are private and recoverable.

| Outcome | Count and interpretation |
| --- | --- |
| Added | 54 new concepts and 54 unique inspection recordings |
| Merged | 0; no unverified synonym or variant merge |
| Skipped | 54 identical registrations on the second import; zero second-run additions |
| Conflicting | Preliminary dry-run: 12 duplicate raw payloads with conflicting labels; none imported |
| Rejected | Preliminary dry-run: 3 static GLBs; whole-batch inspection confirmed all 15 held GLBs were static |
| Pending review | All 54 new recordings; additionally KEYBOARD's lexical comparison/reference is unresolved and excluded |

The conflicting/rejected categories above describe the preliminary dry-run;
they overlap the later technical finding that all 15 held payloads have no
animation. They are not 27 different rejected assets. Of 70 downloads, 54
entered inspection, 15 were held for static/conflicting content, and one was
excluded for reference resolution. Final filtered dry-run and commit report
54 additions, zero merges/conflicts/rejections. The repeat reports 54 skips,
unchanged before/after counts, no alias/provenance changes and no new files.

Evidence:

- `imports/asl-expansion-20261018-initial-proposal.json`: original 69 proposals.
- `docs/expansion-cross-label-audit-20261018.json`: whole-batch content audit.
- `imports/asl-expansion-20261018.json`: persisted, filtered 54-entry batch.
- `docs/import-reports/asl-expansion-20261018-dry.json`: preliminary report.
- `docs/import-reports/asl-expansion-20261018-final-dry.json` and `-commit.json`.
- `docs/import-reports/asl-expansion-20261018-repeat-dry.json` and `-repeat-commit.json`.
- `docs/vocabulary-baseline-before-expansion-20261018.json`: preserved baseline.

The existing importer requires a saved matching dry-run fingerprint before
commit. Use a fresh report filename for every run; never overwrite old evidence.
Repeat runs use the persisted batch, not the date-specific proposal generator
(which intentionally filters out words already present). Example dry-run:

```powershell
node scripts/import-asl-motion.mjs --batch=imports/asl-expansion-20261018.json --report=docs/import-reports/my-repeat-dry.json
```

Commit requires `--commit --plan=<that dry-run path> --report=<fresh commit path>`.
Keep the source cache if repeating technical preflight from the baseline.
The runtime already contains these assets; importing again is unnecessary.

## Linguistic evidence and external blockers

Public ASLU/Lifeprint lexical pages were consulted. Direct scripted requests
were challenge-blocked despite HTTP 200; separate public web retrieval identified
69 relevant entries. No reference media was copied. These are lexical comparison
references, **not proof that the source or retargeted sign matches its intended
sense, variant, handshape, movement or nonmanual grammar**. KEYBOARD's page
resolved to KEY and was excluded. Read the
[source and license audit](research/expansion-source-audit-20261018.md).

All 207 registrations have distinct normalized motion hashes. Automated checks
cover finite tracks, skeletal calibration, finger/palm directions, wrist/contact
landmarks, timing and signing-space framing. They do not prove actual skin
contact or linguistic correctness. These source GLBs contain no facial capture.

The [54-item signer worklist](ASL_EXPANSION_REVIEW_WORKLIST_20261018.md) and
its JSON companion supply exact source URLs, senses, hashes, variants and review
questions. `ASL_SENTENCE_REVIEW_WORKLIST_20261018.json` contains ten complete
English utterance requests linked to existing concept/template IDs without
asserting ASL word order. No fluent signer has approved these assets. This is
the blocker to enabling them as validated translations. Existing CLERC phrase
candidates additionally need point-coordinate retargeting and nonmanual grammar.

No ASL Citizen dataset, OpenASL clips, How2Sign data, ASLLVD derivatives, Rylo
database, new avatar or recognition weights were imported. Code licenses were
not treated as data/video/weight grants. Restricted or unsuitable data remained
outside runtime. There is no newly working general-conversation ASL translator.

## Camera behavior

The actual existing task model contains None plus seven canned pose labels.
Five old mappings remain opt-in illustrations: Open_Palm → Hello, Thumb_Up →
Yes, Thumb_Down → No, Victory → Hello, ILoveYou → Love. These are not an ASL
recognition vocabulary. Closed_Fist → pause and Pointing_Up → resume are new
**player controls**, requiring separate opt-in, a suitable queue/player state
and explicit confirmation. The classifier itself was not expanded or retrained.

Capture requires score ≥0.80, a stable 750 ms hold, 450 ms neutral release and
1,800 ms repeat cooldown. Two hands are observed; conflicting, cropped, unknown,
weak or stale observations do not yield a proposal. Classifier scores are not
ASL accuracy. A capture can be corrected or dismissed. Nothing is automatically
submitted or played. Confirmation prepares a response and waits for Play.

One worker frame is in flight, resized within 480×360 while retaining aspect.
Inference adapts between 2 and 8 requests/second based on measured duration.
The worker runs the bundled local model/WASM. Unsupported worker initialization
falls back to explicitly labelled, throttled main-thread processing. Stop,
startup cancellation, visibility changes and disconnection release streams,
timers and detector resources. Late frames or permission results cannot restore
a canceled session. Only confirmed illustration labels/scores enter local SQLite;
video frames never leave the device. Controls remain browser-local.

History replay preserves the original captured/confirmed pose and classifier
score, flags the replay and waits for Play. Older entries without a saved score
ask for a new capture instead of fabricating a perfect score.

General camera ASL recognition still needs permitted, labelled temporal,
two-hand and nonmanual data; cleared training-data and weight terms; a new
classifier; separate multi-person held-out recordings; and linguistic mapping
review. No recognition accuracy, new ASL word class or human evaluation is claimed.

## Performance observations

Raw HTTP comparison of the **same current catalog**: 6,293,408 uncompressed bytes
versus **772,613 gzip wire bytes**, **87.72% less transfer**. Decompressed bytes
were identical. Catalog JSON and gzip are cached once per server start; private
translations/history are not cached by this change. Clients refusing gzip receive
the original JSON; quality-zero and wildcard negotiation are tested. The metadata
catalog is still large and parsed in the browser; this is not a claim of an
87.72% total-page speedup.

The old library rendered all 153 motion cards when opened. It now renders 40
initially despite containing 207 recordings; one Show more action renders 80.
Search is debounced 150 ms and resets the display limit while preserving manual
inspection selection. This bounds initial DOM work; it is not a measured FPS gain.
Existing lazy motion loading and a 40-motion cache remain (the active/replay queue
can retain its required clips beyond that cache target). At most two existing
research assets receive optional low-priority prefetch hints; data-saver skips them.

The actual worker processed synthetic blank frames in the browser and reported
one sample of **107.9 ms model inference / up to 6.2 requests per second**.
This is an observation on the available Windows desktop/IAB environment, not a
controlled hardware benchmark, comparison with the old inference speed, or an
accuracy result. Hardware model and CPU/GPU utilization were not measured.
See `expansion-performance-20261018.json` for machine-readable observations.

## Verification

`node scripts/check.mjs` passed: 55 JavaScript files, 182 unique UI IDs, bundled
runtime/model/license checks and 207 immutable motion files. The full test
command is `node --test web/phrases.test.mjs backend/*.test.mjs`.
The **final full suite passed all 89 tests**, zero failures/skips, in 190.94
seconds. This native-ESM stack has no separate bundler build step. Detailed
results and browser observations are recorded in
`expansion-final-suite-20261018.log` and
`expansion-browser-evaluation-20261018.json` alongside this document.

Automated checks cover old/new unique imports, unchanged prior registrations,
repeat no-op imports, approval gates, all-motion retargeting/framing, aliases,
typos, bank/light/right senses, names, digits, negation, unsupported input,
paragraphs/500 words, incomplete phrase reporting, queue timing/seek/interruption,
network cancellation/retry, API/session/history persistence, speech chunking,
microphone permission/provider failures, camera dwell/release/cooldown/conflicting
hands, worker cancellation and score-preserving replay, and gzip delivery.

Browser review used the production application for real playback on Aarav and
an isolated in-memory QA server for controlled camera/microphone/network failure
states. Bicycle, Cup and Weather were loaded in order and inspected at paused
frames; desktop/mobile face and both hands were visible. Play, pause, resume,
replay, stop, speed and keyboard seeking worked. The library displayed 40 then
80 cards, search found new entries, and selections survived search changes.

The greeting “Hi, How are you?” remained incomplete rather than receiving a
fabricated full ASL translation. The full 500-word browser example retained all
500 words / 2,999 characters and reported 200 unverified word motions with 300
missing words in Research mode. It was not labelled a complete ASL paragraph.
Controlled tests verified opt-in/correction/confirmation, no capture autoplay,
unknown/two-hand conflict rejection, pause/resume controls, permission denial,
missing camera, startup cancellation, disconnection, microphone typed fallback,
failed motion download and successful retry. Synthetic frames/results are
explicitly distinguished from real signer evaluation. Production camera startup
also succeeded and showed uncertain/out-of-frame feedback; no deliberate human
signing or multi-person recognition evaluation was performed.

At 390 and 320 CSS px widths, the production layout had no horizontal overflow;
at 320 px, playback buttons were 44 px high. The camera confirmation UI was also
checked at 351 px and a clipped option label was fixed and rechecked. Focus and
range-key interactions worked; the existing reduced-motion CSS was preserved.
No new console warnings/errors appeared in the inspected production/QA sessions.
No subjective speech-quality, physical microphone transcript, assistive-technology
or full real-camera lighting/accuracy evaluation is claimed. Fresh dependency
installation was not rerun: Node 24.19.0 and installed dependencies were used,
and npm itself was unavailable in the bundled runtime.

Screenshots: `screenshots/expansion-20261018/` contains desktop Bicycle/Cup/Weather,
390 px and 320 px mobile avatar views, and the clearly named controlled camera QA.

## Run and demonstrate

```powershell
cd 'C:\Users\himan\OneDrive\Desktop\Sing Lang\Sign-Language-Interpreter-using-Deep-Learning'
# Only if dependencies are missing (requires an installed Node/npm):
npm install
node server.mjs
```

Alternatively double-click `start-studio.cmd`. Open <http://127.0.0.1:3000/>.
Keep the terminal open. Ctrl+C stops the server. No API keys or paid service
are required. This is local only; no deployment was performed.

1. Choose **Try the demo**, review HELP and press **Play reviewed preview**.
   Pause, resume, change speed, replay, stop and inspect a frame.
2. Enter **Hi, How are you?** to show honest missing/full-phrase coverage.
   Use **Load a 500-word example** to demonstrate retained long input.
3. Open **Motion library**, search **bicycle**, **cup** or **weather**. Inspect
   a recording, or select several and choose **Inspect selected motions**.
   Explain that this is manual motion review, not a translated sentence.
4. In **Pose demo**, Enable camera, hold a clear supported pose, opt into
   illustrations, review/correct it and confirm. Press Play separately.
   Optional fist/pointing controls also require confirmation. Stop camera.

The recoverable pre-change checkpoint is
`../../.checkpoints/before-expansion-20261018-547f79d0/`: ZIP, per-file hashes,
restore notes and consistent SQLite backup. ZIP CRC was checked before edits.
Extract to a separate directory when recovering; preserve newer work/database
before restoring anything. No valuable originals were deleted.

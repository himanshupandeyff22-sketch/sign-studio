# Sign Studio implementation and verification — 16 October 2026

Sign Studio is a functioning **ASL vocabulary accessibility prototype** with
Beyond Words branding and the retained Aarav avatar. This update improves the
application itself; it does not turn lexical playback into grammatical ASL.

## Recoverable starting point

Before implementation, the current working project was saved in
`../checkpoints/2026-10-16-before-upgrade/` relative to the repository. The ZIP
contains 208 files (75,501,122 compressed bytes), a per-file SHA-256 inventory,
Git working-status record and a consistent SQLite history snapshot. ZIP CRC
integrity passed. `.git`, dependencies, raw download cache and generated test
outputs were excluded explicitly; original Git history and cached assets remain
in place. No reset, checkout, public deployment or source-model replacement was
performed. See the checkpoint's `CHECKPOINT.json` and `RESTORE.md`.

## What changed

- **Interface:** forest/ivory colors, Beyond Words identity, clearer typography,
  larger signing stage, an uncluttered composer, editable examples and the
  native mobile “Write a message” shortcut. Speech controls and detailed
  developer/source review information are collapsed until needed. Original UI
  hooks and existing text, microphone, camera, library and history paths remain.
- **Access:** labelled inputs, keyboard input tabs, visible focus, skip link,
  44-pixel action targets, larger core text and reduced-motion styles. The
  source-language notice and unverified/default-review gates remain visible.
- **Aarav:** retained Microsoft Rocketbox Male_Adult_04 GLB, 80-joint rig,
  articulated fingers, embedded textures and 67 facial controls. Tuned key,
  fill and rim lighting, soft shadows, skin roughness/normal detail, hair
  cutouts and filtering. A joint-weight cloth mask protects raised hands from
  clothing recoloring. The original model SHA-256 remains
  `ebe6b1596256f314d1356cfc2f42d28203b5bf1864d0bf139845cb9d13ee6500`.
- **Playback:** frames the posed neutral model rather than its initial T-pose,
  preflights recorded signing bounds, preserves source poses and registered
  durations, and removes decorative facial movement and start/end fading from
  recorded clips. Source data has no facial capture; neutral source playback
  does not supply grammatical nonmanuals. No sign is automatically mirrored.
- **Reliability:** foreground cancellation, edit-to-cancel and newer-submission
  guards prevent old results from replacing or autoplaying a newer queue.
  Motion preparation supports abort/retry; the recent 40-clip cache protects
  active/replay queues and releases older inspections. Intentionally longer
  queues may retain more than 40 clips until replaced. Shadow resources and
  animation loops are cleaned up.
- **Meaning:** declared-name spans now reach the playback gate, closing a raw
  word-match bypass. A person named Help does not become the assistance sign;
  later ordinary HELP, capitalized greetings and “Call me for help” still work.
- **Speech/transcript:** kept available browser voices and the no-key fallback;
  verified rate, volume, mute and reviewed-text handoff. Passive cleanup now
  preserves the initial microphone prompt, finished transcript guidance and
  permission errors instead of falsely saying that recording was canceled.

Canceling queue preparation does not delete a history row already saved by the
local server. Microphone text is still editable before processing and never
starts signing by itself.

## Actual vocabulary growth and licensing

| Measure | Before | After |
| --- | ---: | ---: |
| Unique recorded motion candidates | 78 | 153 |
| Inspection-only recordings | 74 | 149 |
| Retained explicit unverified Research previews | 4 | 4 |
| Approved translation signs | 0 | 0 |
| Candidate concept/sense records | 122 | 214 |
| English aliases | 141 | 233 |
| Inflection records | 122 | 216 |

**75 actual motion files were added**, not 75 approved translations. The first
import merged 0 records, held 13 conflicting labelled payloads and rejected four
static files. The second dry-run and real commit added 0 motions, concepts,
aliases or provenance entries and skipped the 75 existing recordings. All 122
previous concepts, 78 registrations and 78 runtime hashes remain unchanged.
The 938-entry source index remains discovery metadata, not playable vocabulary.

The added assets are motion-only derivatives of the official **3D-LEX v1.0 ASL
component**, licensed **CC BY 4.0**. Author/source/version/license notices remain
with each file. The Rocketbox model has separate MIT terms; source capture
meshes/textures were not redistributed. Other researched sources had access,
license or animation-format limitations and were not imported. No Rylo
database/model or recognition-image dataset was substituted for signing motion.

See [the batch report](PRESENTATION_EXPANSION_20261016.md),
[primary-source audit](research/presentation-source-audit-20261016.md),
[per-file evidence](presentation-import-evidence-20261016.json),
[human-review worklist](ASL_PRESENTATION_REVIEW_WORKLIST_20261016.md),
[THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md) and
[SIGN_DATA_VALIDATION](../SIGN_DATA_VALIDATION.md).

## Executed checks

The bundled environment provides Node.js 24.19.0 and existing dependencies, but
has no `npm` executable. The exact Node commands behind the package scripts ran:

```powershell
node scripts/check.mjs
node --test web/phrases.test.mjs backend/*.test.mjs
```

- **Checks passed:** 41 JavaScript files, 137 unique UI IDs, public model/runtime
  assets, all 153 immutable motion hashes, manifest identities and license gates.
- **Final full suite passed:** **70 tests, 0 failures, 0 skipped**, approximately
  322.6 seconds while the browser was also being exercised. Final local log:
  `test-output/presentation-ready-20261016-complete-tests.log`.
- [Machine-readable verification](presentation-ready-verification-20261016.json)
  records current renderer/backend/UI/manifest fingerprints, original asset
  preservation, test-log hash and screenshot hashes for this exact update.
- All 153 recordings were sampled through anatomical retargeting and the actual
  skinned avatar at desktop/mobile stage sizes. Checks retain upright/frontal
  posture, finite/unit rotations, finger directions, reach/contact limits and
  projected face, hand and fingertip framing. These are geometric checks, not
  proof of exact skin contact, lack of all occlusion or linguistic correctness.
- Tests cover source-pose fidelity, registered duration, seek boundaries,
  pause/resume/replay/stop, 500-item queues, cache cleanup, lost contexts,
  hidden stages, aborted preparation/retry, missing HTTP 404/503 resources,
  content hashes and importer idempotence.
- API/storage/meaning tests cover complete 500-word text, original offsets,
  repeated requests, sessions, saved preferences/history, contextual typo
  correction, distinct senses, protected names/numbers, negation and review gates.
- Voice tests use browser-API doubles for permission denial, unavailable
  devices/services, cancellation, late voices, long speech and stale callbacks.

Two real integration failures were fixed: Library's valid 2,412,919-byte motion
exceeded the previous 2 MiB loader bound; importer and loader now share a bounded
**4 MiB** limit checked against declared and actual streamed bytes before hash
and JSON validation. Also, the old calibration test incorrectly required every
source to contain a terminal exporter reset. Tomato has smooth continuous keys
and retains all 4.875 seconds; source-derived reset checks preserve all existing
upright, face, finger, reach and contact thresholds.

An additional end-to-end semantic bug was fixed after the initial full run:
declared names were protected during interpretation but could still reach the
raw playback matcher. Protected spans now reach that gate, and the live browser
confirmed that `My name is Help. I need help.` only queues the later assistance
word. Microphone cleanup also retains useful initial/permission/transcript
guidance when no recording is active. Both fixes have regression tests.

## Browser verification

The running loopback app was inspected with browser tools at measured CSS sizes
**1440×900, 768×900 and 390×844**. There was no horizontal page overflow, one
avatar canvas remained across resizes, and the observed source poses retained
the face and both hands in the signing stage. Captured console warnings/errors
were empty after the final inspection.

| Scenario | Observed result |
| --- | --- |
| `Hi, how are you?` in Demo | One unverified Hello illustration; HOW/ARE/YOU remain explicitly missing/pending; no complete phrase is claimed |
| `Hello. Please help. Thank you!` | Ordered Hello → Help → Thank you queue; pause, resume, 1.5× speed, stop and replay worked |
| `I need hepl.` in Research | Interpreted as `I need help.` with original span retained; Undo & rebuild restored `hepl` and removed HELP playback |
| `I went to the bank.` | Focused financial/riverbank choice; selecting the financial concept did not invent an animation |
| Negative clause, `My name is Hepl.`, `12345`, `quasar` | Complete input preserved; negative clause held, name uncorrected and no invented positive sign/fingerspelling |
| `My name is Help. I need help.` | Declared name held as `protected-name`; only the later assistance word can enter the explicit Research queue |
| 500-word Demo example using Ctrl+Enter | All 500 words retained; 300 queued motions, 100 unsupported words and an explicit initially displayed 80-item subset |
| Cancel during 16-clip preparation | Loading canceled; message retained; no queue/autoplay remained; later motion requests loaded successfully |
| New Library recording | Largest new file loaded, paused and keyboard-scrubbed into its active frames on mobile |
| New Nurse → Breathe manual queue | Selection order survived search; both recordings could be inspected and sought on desktop/mobile with explicit unverified captions |
| History and About | Saved inspection replay used current registry; dialog opened/closed with current scope notices |
| Voice and transcript controls | Rate/volume/mute changed status; manually edited transcript copied to composer without submitting; keyboard input tabs and mobile message focus worked |

Screenshots are actual app captures, not mockups:

- [Desktop, Nurse inspection](screenshots/upgrade-20261016/nurse-desktop.jpg)
- [Mobile, Breathe inspection](screenshots/upgrade-20261016/breathe-mobile.jpg)
- [Mobile, Library inspection](screenshots/upgrade-20261016/library-mobile.jpg)
- [Tablet composition](screenshots/upgrade-20261016/studio-tablet.jpg)

## Run and demonstrate

With a normal Node.js installation (22.13+):

```powershell
npm install
npm run check
npm test
npm start
```

The existing dependencies also allow `node server.mjs`. On Windows,
`start-studio.cmd` finds Node on PATH or the bundled runtime. Open
<http://127.0.0.1:3000/>. There is no separate bundler build step or paid API.

Default Validated mode intentionally excludes all unapproved signs. For an
honest demonstration, choose **Motion library**, search a candidate, then
**Inspect this motion** or select recordings in order. This is manual motion
review, not text translation. Demo mode remains an explicit opt-in for six
legacy illustrations and should be described as control testing.

## Remaining limits and checks not performed

- **No identified fluent-ASL approval.** The 153 recordings remain candidates;
  full conversational grammar, complete reviewed phrases, directional
  agreement, facial/nonmanual capture and validated fingerspelling are missing.
- Reference pages, successful downloads, motion differences and passing tests
  do not establish a sign's intended meaning, regional variant or grammatical
  suitability. A reviewer must compare the exact source and current Aarav
  rendering before any default approval.
- Browser checks used emulated viewport sizes, not a physical phone/tablet.
  Real touch hardware, a screen reader and an OS reduced-motion change were
  not manually exercised. Focus behavior, CSS support and geometric tests do
  not constitute a complete accessibility certification.
- No live microphone/camera permission was requested and no personal audio or
  video was recorded. Permission failures were tested with doubles. Actual
  transcription quality and physical voice/speaker quality remain device tests;
  available browser voices vary. No natural-voice quality claim is made.
- No restricted corpus, paid service, private endpoint, public deployment or
  third-party contact was used. STUDY's failed public download remained excluded.

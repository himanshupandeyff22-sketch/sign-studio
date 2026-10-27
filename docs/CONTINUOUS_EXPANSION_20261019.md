# Continuous vocabulary expansion and Studio presentation — 19 October 2026

Beyond Words · Sign Studio · Aarav · American Sign Language (ASL).

**READY for local, explicitly unreviewed motion exploration. BLOCKED for approved
ASL translation or complete grammatical sentence translation.** The compatible
public 3D-LEX ASL catalogue has been processed to completion. This is not a claim
that every dataset on the internet has been exhausted.

## Actual coverage

| Unit | Before | After |
| --- | ---: | ---: |
| Canonical candidate concept records | 297 | 789 |
| Distinct imported skeletal motion files | 237 | 729 |
| Motion files passing structural and Aarav rig checks | 237 | 729 |
| Candidate concepts with a motion | 236 | 728 |
| Legacy explicitly selected research text previews | 4 | 4 |
| Concepts usable with expanded research consent and necessary meaning choices | 4 | 725 |
| Captures reachable through that research text path | 4 | 726 |
| Manifest inspection-only captures, outside approved translation | 233 | 725 |
| Source catalogue entries without registered motion | 701 | 209 |
| Linguistically approved signs | 0 | 0 |
| Approved complete Aarav sentences / valid fingerspelling alphabets | 0 | 0 |
| External signer-video references / browser-checked recording / bundled videos | 8 / 1 / 0 | 8 / 1 / 0 |

The 492 new concept records use the explicit sense `source-gloss-unverified`.
These are unique source-gloss candidates, **not 492 expert-confirmed distinct
meanings**. Semantic overlap, variants, regional usage and synonym equivalence
remain review questions. No synonyms were silently merged or approved. Existing
297 concept records, 237 asset records and their immutable bytes are preserved.
Two existing BATHROOM/TOILET captures share a canonical concept, hence 729 files
cover 728 concepts. The inspection-only manifest flag remains unchanged even
when explicit research consent permits a technically checked lexical preview.

All source labels and eligible primary mappings were exercised offline with
consent; 719 captures need no occurrence-specific meaning choice. Seven more
are reachable with explicit choices/retained variants. CANNOT, NEVER and NOT
remain inspection-only because negation protection must not turn a clause into
an inaccurate positive word sequence. See
[the pinned text-path audit](EXPANDED_RESEARCH_TEXT_AUDIT.json).

## Imports, deduplication and recovery

All **701 previously unimported catalogue rows** are terminal:

- **492 added**: real motion-only JSON assets, unique source and normalized
  motion hashes, safe hashed runtime paths, stable concept/asset IDs.
- **0 automatic semantic merges** and **0 conflicting animated assets enabled**.
- **203 skipped static files**: no usable animation. These collapse to seven
  source hashes (196 repeated static payload copies under additional labels).
  They were not counted as vocabulary or imported runtime motions.
- **6 technical failures quarantined**: FLAG and LECTURE have internal actor-axis
  resets; FLUTE, VAMPIRE and WOLF exceed frontal face visibility bounds; STAFF
  lacks required finger articulation. Originals remain in the private cache.
- **492 new / 729 total assets pending linguistic review**. No reviewer, expert
  approval, accuracy metric or complete sentence animation was fabricated.

[Exact new source words, IDs, hashes and rejected rows](CONTINUOUS_EXPANSION_RESULTS.json)
are the machine-readable inventory; [the runner ledger](../imports/continuous/state.json)
contains per-entry status/reasons. `imports/continuous/continuous-asl-*.json`
contains the batches and matching dry-run, commit and repeat receipts.
Forty committed records were recovered after an interrupted run; the ledger calls
these `registered-recovered`, not another forty additions. Earlier failed
proposals/receipts are historical attempts, not extra imports.

Each committed batch was dry-run first and repeated with zero asset/concept
changes. Re-running the entire expansion also added nothing and left 729 motions,
zero unfinished rows. Cached source size/hash, source provenance, language,
canonical concept/sense, aliases, normalized motion and safe paths are checked.
Uncertain label conflicts, inflections and alternate captures are held rather
than replacing working data. Duplicate raw static payloads never create concepts.

The runner reuses `import-asl-motion.mjs` / `import-core.mjs`, a PID lock,
atomic progress writes, bounded public range downloads, bounded transient retries,
per-entry inspection and saved batch plans. It uses batches of 40 for checkpoints,
**not an overall vocabulary cap**. No approved translation flag is changed.

```powershell
node scripts/expand-library.mjs --resume
```

This resumes unfinished rows and recovers already committed batches safely.
The current catalogue is finished, so this command is presently a no-op. New
sources need their own verified permission evidence and supported conversion;
the runner does not treat arbitrary URLs as permission. Regenerate technical and
text-path audits after an intentional new manifest/renderer change and restart:

```powershell
node scripts/audit-studio-readiness.mjs
node scripts/audit-research-input.mjs
node server.mjs
```

## Resource actually obtained

**3D-LEX v1.0 ASL**: public [OSF component](https://osf.io/mqzyk/),
[archive tcnhs](https://osf.io/download/tcnhs/), version 1 dated 5 June 2024;
[official SAPA repository](https://github.com/OlineRanum/SAPA) pinned to
`0f636e119bccde2c035422f50820e3f8b94a5fb8`;
[publication](https://aclanthology.org/2024.signlang-1.33/).
Dataset **CC BY 4.0**, repository code MIT separately. Authors: Oline Ranum,
Gomèr Otterspeer, Jari I. Andersen, Robert G. Belleman and Floris Roelofsen (2024).

640 remaining raw GLBs were obtained through bounded archive requests and 61
already cached source files reused. No whole 393 MB archive download was needed.
Raw files stay under `asset-downloads/`; runtime extraction strips source meshes,
materials and textures, retaining skeletal motion and provenance. Source-avatar
reuse is not inferred from the code licence. Aarav's existing separately licensed
avatar and appearance were preserved. Permission evidence is hash pinned in
`imports/continuous/source-permission.json`. No new signer video, recognition
weight, third-party avatar or Rylo database was imported in this pass.

For previously unknown senses, current source links explicitly identify the
publisher's gloss, **not a dictionary-confirmed English meaning**. An early
candidate-reference proposal was corrected through the guarded metadata importer;
current entries use the verified OSF publisher URL and `publisher-gloss-only`.
Historical receipts are retained, not evidence that unvisited dictionary pages
were checked. Established same-language references are preserved for older senses.

## Further primary-source research and concrete limits

| Official resource inspected | Observed limitation / decision |
| --- | --- |
| [SignAvatar / ASL3DWord](https://github.com/dongludeeplearning/SignAvatar) | README requests email for dataset/checkpoints; research/education CC BY-NC conditions and separate SMPL-X resources. No email sent or unavailable dataset claimed. |
| [SignAvatars](https://github.com/ZhengdiYu/SignAvatars) | Dataset application/agreement and emailed access; SMPL-X/MANO dependencies; ASL/GSL/HamNoSys must be separated. No agreement submitted, contact made or download claimed. |
| [How2Sign](https://how2sign.github.io/) | CC BY-NC research data; public 2D body/face/hand keypoint sets are multi-GB, not compatible rig rotations. A calibrated reconstruction/finger adapter and separate review are missing. No speculative download. |
| [WLASL](https://github.com/dxli94/WLASL) | Academic/noncommercial video/recognition resources under C-UDA; these are not playable avatar animations. |
| [RIT/CUNY mocap](https://latlab.ist.rit.edu/downloads.html) | Public page obtained (HTTP 200; local source-page evidence retained). Corpus access requires contacting the authors. No private files downloaded or contact made. |
| [CLERC Épée](https://clerc.io/data) | Public keypoints have CC BY-NC-SA conditions; raw videos have separate terms. Existing phrase candidates still lack a validated 3D finger/orientation adapter. Metadata is not new animation. |
| [OpenASL](https://github.com/chevalierNoir/OpenASL) | Noncommercial/no-derivatives video terms do not permit assuming video-to-avatar adaptation rights. No new assets adapted. |
| Original harshbg and EvilPort2 repositories | Existing pinned repository audits retained. Recognition code/images or unlicensed assets do not provide new permitted skeletal ASL motion. |

Access, asset-specific licensing, conversion/calibration and fluent-signer review
are the remaining external blockers. No unrestricted global resource search or
linguistic validation is claimed.

## Studio changes

The compact banner and existing branding remain. The stage has more desktop
space; Aarav and the message stay side by side. Coverage follows the avatar with
a consistent 20 px desktop gap, independent of message/settings height. Mobile
stacks avatar, input and coverage with 16 px gaps. One primary player control
changes between Play/Pause/Resume/Replay; Stop and speed remain visible.
Fullscreen, Reset Camera, Reset Preview and separate Replay are grouped in
**View & playback options**. Input options, voice/settings, corrections, sentence
limitations and history use keyboard-operable native disclosures. Empty/missing
coverage panels avoid redundant filler. All developer credits remain in one footer.

Expanded source-word playback requires the unchecked **Use unreviewed research
recordings** consent. It clears old queues when toggled, does not survive page
reload and cannot be supplied for validated/camera modes. Legacy four-example
selection remains explicit. History cannot silently restore expanded consent.
Names/numbers, negation, ambiguous senses and incomplete phrases retain protection.
No “How are you?” / “What is your name?” full-sentence option was reintroduced.

Explore ASL retains concept/alias search, category/output/review filters,
list/grid layout, clear preview-versus-text status, expandable source/licence
links and 40-row progressive rendering. Developer concepts load 60 at a time;
asset/source review lists load 40. Animations load on demand, with a 40-entry
idle cache (active queues temporarily retain their required clips). A small
existing demo prefetch is retained; the full motion library is not fetched upfront.

## Verification and measured observations

See `continuous-static-check.log`, `continuous-functional-tests-final.log`,
`continuous-avatar-tests.log`, `STUDIO_ASSET_AUDIT.json`,
`continuous-browser-observations.json` and `CONTINUOUS_PERFORMANCE_20261019.json`.

- Static syntax/UI-ID/asset/hash/licence checks pass for all 729 motions.
- Functional suite covers protected/default versus consented input, ambiguity,
  aliases/typos, negation, names/numbers, whole-expression guards, 500 words,
  source-evidence restrictions, preservation and repeat import behavior.
- Final functional run: **98 passed / 0 failed**; separate actual-rig run:
  **4 passed / 0 failed**, **102 total**. Local loopback fixtures require the
  environment's network permission; the completed runs include that permission.
- Actual-rig suite passes all four tests, exercising registered motion trajectories,
  face/hands/fingertips across desktop/mobile/narrow viewports, pause/resume/seek,
  cancellation, retries, transfer bounds and renderer/context cleanup. Automated
  landmark checks do not prove skin contact or linguistic correctness.
- Fourteen representative newly added motions were inspected in the browser:
  BACON, BEAR, COUNTRY, EARTHQUAKE, ELEPHANT, GAME, WE, SUNRISE, JUMP, MONKEY,
  STUCK, SITUATION, DRUG, FRONT. Still frames include rest phases; they are not
  per-sign linguistic validation or a visual review of every one of the 492 clips.
- Browser checked default missing coverage, opt-in three-word queue, one-click
  inspection, controls, fullscreen geometry, reset, filters, 40→80 pagination,
  390×844 mobile layout, no horizontal overflow and keyboard-visible focus.
- A 500-word browser submission produced 300 source-word previews and 200
  explicitly unassigned words, rendering only the first 80 queue rows initially.
  A subsequent `monkey earthquake` submission replaced that queue and played,
  paused and sought successfully. Speech/camera tabs remained explicit and idle.
- An isolated in-memory HTTP fixture returned one model 503 and one motion 503.
  Reconnect and Retry restored the original LOVE queue; playback and seeking
  succeeded. These controlled failures are not production console errors.
- The existing `start-studio.cmd` was launched on temporary port 3001; startup
  reached SQLite-ready state and `/api/health` returned 200. That instance was
  stopped; the normal local Studio remains on port 3000.
- Physical microphone/camera, different people signing, audio voice naturalness,
  sustained FPS and fluent-signer meaning review were not tested. Camera remains
  seven general poses / five illustrative mappings / four distinct responses /
  two optional controls / **zero validated ASL recognition classes**.

On local Windows x64 / Node 24.19.0, removing repeated frame-level diagnostics
from the public catalogue reduced **21,658,680 → 8,558,460 JSON bytes** and
**2,451,415 → 857,738 gzip bytes** (about 65% less compressed transfer). The full
diagnostics remain in local immutable records. Separate single-process samples
observed 0.35 ms mean for 100 in-memory library filters and 25.7 ms for the
500-word interpretation (300 clips / 200 explicitly unsupported words). These
are measured local samples, not browser FPS or a statistically proven timing
speedup. The expanded catalogue still has material metadata cost.

## Run and demonstrate

Use Node **22.13+**. Existing local dependencies are installed; on a fresh checkout
run `npm install`. Double-click `start-studio.cmd`, or:

```powershell
cd 'C:\Users\himan\OneDrive\Desktop\Sing Lang\Sign-Language-Interpreter-using-Deep-Learning'
node server.mjs
```

Open http://127.0.0.1:3000/. No paid API key required. Keep the server window
open. Camera video stays local; microphone/browser recognition and remote speech
voices can use their provider's service only when explicitly started. No speech
or capture starts on page load. Transcripts remain editable.

Short demonstration:

1. Open **Explore ASL**, search **bacon**, click **Preview animation**. It starts
   automatically as an explicitly unverified inspection recording.
2. Try **jump**, **monkey** or **earthquake**. Pause, seek, Replay, speed and Reset
   Camera are available. Use Fullscreen to inspect the complete signing space.
3. In Studio, check **Use unreviewed research recordings**, enter
   `bacon bicycle music`, process, review, then Play. This is three lexical clips,
   not an ASL sentence.
4. Add `qzxunknown` and process again: missing content is reported and not invented.
5. Turn research consent off: the default validated mode correctly plays none of
   these unapproved signs.

For approval, use [the complete human-review worklist](ASL_REVIEW_WORKLIST_CONTINUOUS_20261019.md):
review exact sense, handshape, palm orientation, location, movement, two-hand
coordination, contact, variants and missing facial/body grammar against each
source and Aarav render. Record identified reviewer/date/evidence through the
existing approval workflow. Do not treat a successful import as that approval.

# Recorded ASL library expansion — 16 October 2026

This batch adds **75 unique, technically preflighted recorded motion candidates**
to the existing canonical manifest. They are available in the manual inspection
library. They are **not approved translations** and are excluded from automatic
text-matched/default output. No fluent signer or interpreter approval is invented.

| Measure | Before | After |
| --- | ---: | ---: |
| Candidate concept/sense records | 122 | 214 |
| English alias records | 141 | 233 |
| English inflection records | 122 | 216 |
| Unique recorded motion files | 78 | 153 |
| Inspection-only recorded candidates | 74 | 149 |
| Retained explicit unverified Research previews | 4 | 4 |
| Approved translation signs | 0 | 0 |
| Procedural control-testing demos | 6 | 6 |

The **92 new concept records and 94 inflections are metadata**, not 186 new
playable signs. Seventeen of those concepts have no imported motion. The
938-filename source catalog is unchanged and is not counted as playable data.
No reviewed sentence template, facial grammar or fingerspelling alphabet was
obtained. Longer input support does not imply general-conversation translation.

## Actual acquisition and license

One hundred useful everyday source glosses were investigated across healthcare,
home, food, family, learning, communication, time and feelings. Ninety-two actual
GLB samples were acquired from the official **3D-LEX v1.0 ASL** component; each
sample's ZIP filename, size, CRC32, GLB integrity and SHA-256 was checked. All
100 ASLU comparison-page requests returned HTTP 200. Reference-page existence
alone does not verify an exact meaning or a capture's correctness.

The ASL source component explicitly declares **CC BY 4.0**. Dataset attribution:
Oline Ranum, Gomèr Otterspeer, Jari I. Andersen, Robert G. Belleman and Floris
Roelofsen (2024), 3D-LEX v1.0. Sources:
[ASL animation data](https://osf.io/mqzyk/),
[GLB archive](https://osf.io/download/tcnhs/),
[paper](https://aclanthology.org/2024.signlang-1.33/),
[license record](https://api.osf.io/v2/licenses/563c1cf88c5e4a3877f9e96a/),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
The OSF file is version 1, dated 5 June 2024. Exact provider metadata, publisher
commits and further inspected sources are in
[the primary-source audit](research/presentation-source-audit-20261016.md) and
[machine-readable source checks](research/presentation-source-checks-20261016.json).

Only **motion-only JSON derivatives** were installed: original skeletal
transforms, inverse binds, timing and animation tracks. Source geometry,
textures and materials were excluded. Runtime retargeting uses Aarav's existing
separately MIT-licensed Rocketbox rig; anatomical/palm/finger calibration and
terminal exporter-reset handling remain the existing implementation. Every
new runtime file carries its exact source filename/hash, authors, CC BY 4.0 URL,
modification description and pending review notice. Source meshes are private;
their separate rights have not been inferred from the dataset license.

No Rylo database/model, EvilPort2 training images, NVIDIA data, How2Sign video,
SignAvatars annotations or restricted RIT corpus was imported. Those were
investigated and their distinct access/license/format limitations recorded.

## Dry-run, import and repeat results

| Outcome | First commit | Repeat commit | Decision |
| --- | ---: | ---: | --- |
| Added motion files | 75 | 0 | Unique recorded candidates, inspection only |
| Merged aliases or additional provenance | 0 | 0 | No unreviewed synonym equivalence was promoted |
| Skipped identical registered recordings | 0 | 75 | Existing canonical motion/provenance preserved |
| Conflicting labelled payloads held | 13 | 13 | No file imported for those labels |
| Rejected static payloads | 4 | 4 | A mesh without animation is not a sign |
| Added concept records | 92 | 0 | Candidate metadata, not playable vocabulary |
| New candidates pending ASL review | 75 | 75 remain | Technical success is not linguistic approval |

The canonical importer compared raw source SHA-256, primary/additional source
identity, normalized animation-content SHA-256, language, concept, sense,
explicit variant and safe stable ID/path. A saved dry-run fingerprint bound the
batch, baseline manifest and actual source plan before commit. No working
entry, source notice, variant, byte hash or approval was overwritten. Independent
checks verified **all 122 previous concept records, all 78 registrations and all
78 runtime file hashes remain unchanged**. A real second dry-run and commit
added zero files, concepts, aliases or sources.

Retained immutable reports:

- `docs/import-reports/asl-presentation-20261016-dry-run.json`
- `docs/import-reports/asl-presentation-20261016-commit.json`
- `docs/import-reports/asl-presentation-20261016-repeat-dry-run.json`
- `docs/import-reports/asl-presentation-20261016-repeat-commit.json`
- `docs/vocabulary-baseline-before-presentation-20261016.json`
- `docs/presentation-import-evidence-20261016.json`

Static: MEDICINE, BANANA, CHEESE, PENCIL. Conflicting labels reused one of
those exact static payload hashes: EGG, ORANGE, SALT, RESTAURANT, PERSON,
INTERPRETER, TALK, WORD, LESSON, MONDAY, LATER, LAUGH, READY. None was copied as
a playable sign. Source glosses SUGAR, EXPLAIN, MEAN, PRACTICE, EARLY, SAME and
NEW are absent from the inspected GLB archive. STUDY's download still returned
HTTP 400 on the final bounded attempt; it was excluded rather than fabricated.

The archive fetcher now reuses a process-local public redirect target and
one bounded member range instead of fetching each header separately. It refreshes
expired/failing public redirects through the official endpoint, preserves cached
CRC/hash-verified samples and records failed requests. It does not save temporary
download URLs or bypass authentication. The initial attempt's failures were
resumed; the final cache contains 92 samples, not a full archive download.

## Technical validation and human work

All 75 additions passed the existing 30 Hz Aarav retarget preflight: finite/unit
transforms, complete left/right shoulder/elbow/wrist chains, all **30 finger
segment rotation tracks**, safe first-pose calibration, terminal-reset handling,
reach, palm-frame/finger-direction and near-contact bounds. Each includes
changing finger transforms; durations span **2.292–9.167 seconds** with **55–129
tracks**. The motion-only additions total **65,445,490 bytes**. They are loaded
on request rather than bundled source meshes. This is evidence of actual motion
data, not metadata growth or an accuracy percentage.

The LIBRARY recording is 2,412,919 bytes, larger than the earlier loader's 2 MiB
limit. Verification caught that real playback failure. Importer and loader now
share a bounded **4 MiB** cap; every installed file fits it. Stream/content-length
checks still fail oversized downloads before hash/JSON validation. This fixes
loading without replacing, downsampling or falsifying recorded finger tracks.

Source/runtime/content hashes, per-file duration, tracks, changing finger tracks,
license, source URL, ASL concept/sense and automated diagnostics are in
[the evidence JSON](presentation-import-evidence-20261016.json).
[The human-review worklist](ASL_PRESENTATION_REVIEW_WORKLIST_20261016.md) keeps
all 75 pending. Review must compare source with the actual Aarav output for
handshape, palm orientation, signing location, movement/timing, two-hand
coordination, skin contact, facial/body expressions, variant and exact meaning.
FULL, TEST, HARD, OLD, SHOWER, BODY and COUGH require particular sense/variant
care. No sentence is approved by concatenating these word clips.

Three focused import tests passed with no failures/skips: original-data
preservation and exclusions; idempotent repeated import; distinct actual
finger/arm data and default/research review-gate protection. Run them with:

```powershell
node --test backend/presentation-import.test.mjs
```

The combined original/everyday/presentation import suites also passed **15
tests, zero failures/skips** after the shared runtime-size guard was added.

Those tests are separate from the final renderer's real skinned framing tests,
browser inspection, microphone checks and linguistic review. The overall
project verification record describes those checks; this document does not
claim that all new rendered signs received expert or comprehensive visual approval.

## Repeatable importer workflow

The committed proposal is `imports/asl-presentation-20261016.json`; it is a fixed
batch. Reimport it using **fresh report filenames**:

```powershell
node scripts/import-asl-motion.mjs --batch=imports/asl-presentation-20261016.json --report=docs/import-reports/local-repeat-dry.json
node scripts/import-asl-motion.mjs --batch=imports/asl-presentation-20261016.json --commit --plan=docs/import-reports/local-repeat-dry.json --report=docs/import-reports/local-repeat-commit.json
```

Source GLBs must already exist in the private checksum-verified cache. Research
and new-batch preparation are distinct steps; changing a batch, source payload
or manifest requires a fresh dry-run. Preparation and evidence scripts preserve
existing outputs using exclusive writes. New imports always require separate
source-specific permission/format checks; do not treat a classifier image,
software license, filename or downloaded video as an approved animation.

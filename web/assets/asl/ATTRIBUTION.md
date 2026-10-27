# 3D-LEX research motions — CC BY 4.0

**Current 19 October 2026:** 729 distinct motion-only captures, including 492
new continuous-expansion candidates. All retain the attribution, source archive,
source/runtime hashes, licence and modification records described below.
Dataset: 3D-LEX v1.0 ASL, OSF `tcnhs` version 1 (5 June 2024), **CC BY 4.0**.
Authors: Oline Ranum, Gomèr Otterspeer, Jari I. Andersen, Robert G. Belleman and
Floris Roelofsen (2024). Exact new assets and retained permission evidence:
`../../../docs/CONTINUOUS_EXPANSION_RESULTS.json` and
`../../../imports/continuous/source-permission.json`.
The new source-gloss meanings and all retargeted signs need human ASL review;
none has been linguistically approved. Preserve this notice and embedded
attribution with redistribution. The following dated counts are historical.

On **16 October 2026**, a further **75 unique motion-only candidates** were
installed from the same licensed ASL archive, following a dry-run and repeat
import. The complete canonical library now contains **153 recorded motions**:
149 inspection-only candidates and four retained unverified Research previews,
with zero approved translations. The 75 new files contain the same authors,
CC BY 4.0 notice, exact archive member/source hash and modification record.
Source OSF archive version: 1 (5 June 2024). Per-asset source/runtime/content
hashes, licenses, meanings and human-review status are in
`../../../docs/presentation-import-evidence-20261016.json`; outcomes and rejected
payloads are in `../../../docs/PRESENTATION_EXPANSION_20261016.md`. Source avatar
geometry, textures and materials were not redistributed. Preserve these notices
and embedded attribution with every motion derivative.

The 12 October records below describe earlier stages. The current canonical
manifest is `../../vocabulary-manifest.json`; language and sense/variant review
remain separate from technical loading success.

Expansion on 12 October 2026 added 24 content-addressed motion-only files to
the four recordings below. All 28 retain the same author/source/license notices
and embedded modification/provenance records. The canonical list and hashes
are in `../../vocabulary-manifest.json`; review evidence is in
`../../../docs/vocabulary-review-20261012.json`. New additions are inspection-only,
not enabled ASL translations. See THIRD_PARTY_NOTICES.md for the complete list.

The motion-only files `help.motion.json`, `yes.motion.json`, `no.motion.json`,
and `love.motion.json` derive from **3D-LEX v1.0** by Oline Ranum, Gomèr
Otterspeer, Jari I. Andersen, Robert G. Belleman, and Floris Roelofsen.

- Dataset/project: https://osf.io/mqzyk/
- Stable source archive: https://osf.io/download/tcnhs/
- Research paper: https://aclanthology.org/2024.signlang-1.33/
- Author repository/license statement: https://github.com/OlineRanum/SAPA
- Motion license: Creative Commons Attribution 4.0 International,
  https://creativecommons.org/licenses/by/4.0/

Each file records its source archive filename, source GLB SHA-256, authors,
license, and modifications. The extraction retains skeletal transforms,
inverse-bind metadata and animation keyframes; it removes all source meshes,
materials, textures, and images. Aarav remains the independently MIT-licensed
Microsoft Rocketbox model documented in the parent asset directory.

The runtime calibrates against the actual first animated anatomical pose because
the static node transforms use a different actor orientation. It applies target
arm-length, palm-axis and finger-axis calibration, and preserves recorded
near-contact landmark-pair vectors with symmetric wrist IK adjustments. Detected
terminal actor-axis reset keys are excluded from playback sampling: HELP ends
at 3.208333 s, YES at 3.000000 s, NO at 5.291667 s and LOVE at 8.458333 s.
All original raw keyframes and source hashes remain in these files. Outlying
joint-4/end nodes are excluded from target deformation and framing.

These transforms preserve source finger directions and palm frames, but target
hand sizes and torso proportions differ. Landmark contact is a skeletal proxy,
not a skin-contact guarantee; chest/wrist positions can shift by centimetres.
The retargeted output has **not** been validated by a fluent ASL
signer. Exact senses, variants, contact, and absent facial capture require
review. The four initial recordings remain explicit unverified Research
previews; subsequent additions are available only for manual inspection. All
remain excluded from the default validated vocabulary until the required reviews.

## Expansion — 18 October 2026

54 more unique skeletal-motion candidates from the same **3D-LEX v1.0** ASL
archive were imported under **CC BY 4.0**, by Oline Ranum, Gomèr Otterspeer,
Jari I. Andersen, Robert G. Belleman and Floris Roelofsen. Source:
https://osf.io/mqzyk/ ; https://osf.io/download/tcnhs/ , archive version 1
(5 June 2024). The data-license statement at SAPA revision
`0f636e119bccde2c035422f50820e3f8b94a5fb8` and OSF ASL license were rechecked.

Total: 207 recordings, including 203 inspection-only and four legacy
unverified Research previews, zero approved translations. Changes retain
skeleton transforms, inverse binds and keyframes and remove source geometry,
textures and materials; the existing calibration/IK/contact retargeter applies
them to Aarav. No facial capture is present. Per-file original member/source
hashes, runtime/content hashes, authors, license and modifications are embedded
and recorded in the canonical manifest. All 54 new files await source/target
meaning, variant, skin-contact, handshape and nonmanual review.

See `../../../docs/EXPANSION_AND_CAMERA_20261018.md` and
`../../../docs/ASL_EXPANSION_REVIEW_WORKLIST_20261018.json`.

# Signing resources and reference implementation

Checked on 12 October 2026. This is a source and licensing record, not a declaration that any resulting Aarav animation or sentence translation has passed linguistic review.

## Current local implementation

The registry is `web/sign-registry.mjs`; the backend enforces it independently of browser state. **Validated** is the default and contains zero approved entries. **Research** is explicit opt-in for four recorded 3D-LEX candidates (`help`, `yes`, `no`, `love`); **Demo** is explicit opt-in for the six retained procedural illustrations. None has human ASL approval. Missing terms have no generic talk or fingerspelling substitute.

Research accepts the exact English source glosses. `no` requires a negative-answer/refusal sense selection; `love` requires affection. Missing or unknown sense selections are reported through `ambiguousTerms` and do not play. Affection is one lexical item, not a full “I love you” phrase or an ILY handshape. Choosing a meaning does not approve the animation or enable it in validated mode. Camera pose demonstrations also require explicit Demo mode. Details and primary meaning references are recorded in [SIGN_DATA_VALIDATION.md](../SIGN_DATA_VALIDATION.md).

## Rylo Translate: official resources

### Direct browser observations

The public demo was inspected through its normal interface using the generic
test **`Hello. Thank you.`** (17 characters). No private user message was used.
Cookies were rejected; no login, download, sharing, feedback, or contact action
was performed.

| Observed in the UI | Scope of the observation |
| --- | --- |
| Separate spoken-language and signed-language choices | English/German/French spoken choices and American/German/French signed choices were visible. This is not a complete inventory of every supported language |
| Text input, voice input, and Listen action | The displayed counter changed from `0/500` to `17/500`; this suggests a character counter. A 500-word translation was not tested on Rylo |
| Processing followed by sentence text in the output area | The generic two-sentence input remained visible as `Hello. Thank you.`. This does not establish grammatical signing quality or full paragraph support |
| Download Translation, Share Translation, and Options | Controls were observed, not activated. Options exposed a Show SignWriting switch |
| No reliably visible avatar/pose animation during this observation | Signing quality, its rendering implementation, and playback-control behavior could not be verified visually in that output. Dependencies and source code do not establish what successfully rendered in this session |

The local implementation independently uses language separation, explicit
meaning review, source-text display, and clear processing states. It retains
its own design and adds a visible ordered queue and playback controls.
Architecture statements below come from published documentation/code, not
inference from the appearance of the demo. No Rylo database, hosted model,
generated output, dictionary video, or application source was imported.

[Rylo Translate](https://rylo.com/sign/translate/) and its [official source repository](https://github.com/sign/translate) identify the same project. The source repository inspected was commit `928d49ffe223fccedca64162851d4951b9152ecc`. The frontend's [license](https://github.com/sign/translate/blob/928d49ffe223fccedca64162851d4951b9152ecc/LICENSE.md) provides CC BY-NC-SA 4.0 for the free tier, with attribution and share-alike obligations. It names Nagish Inc. and requires a separate commercial license for for-profit organizations. The [Translate-specific terms](https://rylo.com/sign/translate/legal/terms/) publish the same licensing model. This is not an MIT-licensed application merely because it uses MIT dependencies.

The [software/dependency notices](https://rylo.com/sign/translate/legal/licenses/) list packages such as Three.js and pose-viewer under MIT, and model-viewer under Apache 2.0. Those notices cover the named libraries, not a blanket right to copy Rylo's sign videos, dictionary mappings, generated output, model weights, or branding.

Rylo's [technology documentation](https://rylo.com/sign/translate/docs/docs/technology/introduction.html) explains both dictionary/gloss and SignWriting approaches, and explicitly describes limitations of dictionary sequences for sign-language grammar and expressiveness. Its [published diagram source](https://github.com/sign/translate/blob/928d49ffe223fccedca64162851d4951b9152ecc/docs/docs/technology/introduction.md) links the following projects. Each resource has its own license and data requirements:

| Published resource | Verified scope | Reuse/license finding |
| --- | --- | --- |
| [spoken-to-signed-translation](https://github.com/sign-language-processing/spoken-to-signed-translation) | Text/gloss/pose pipeline; documented self-hosted HTTP service | [MIT code license](https://github.com/sign-language-processing/spoken-to-signed-translation/blob/main/LICENSE); separately sourced lexicon and poses are still required |
| [signwriting-translation](https://github.com/sign-language-processing/signwriting-translation) | Text ↔ SignWriting training/inference code | [MIT code license](https://github.com/sign-language-processing/signwriting-translation/blob/main/LICENSE); this does not change the model/data licenses |
| [SignBank+](https://github.com/sign-language-processing/signbank-plus) | Spoken text paired with SignWriting; raw, cleaned, expanded, and fingerspelling text data | [Repository license](https://github.com/sign-language-processing/signbank-plus/blob/main/LICENSE) and [Rylo's dataset card](https://huggingface.co/datasets/sign/signbank-plus) identify CC BY-NC 4.0; not a rigged 3D motion collection |
| [Sockeye text-to-factored-SignWriting model](https://huggingface.co/sign/sockeye-text-to-factored-signwriting) | Published model linked by the translation repository | Model card declares CC BY-NC 4.0; model-card content is otherwise empty, so quality and deployment guarantees are not established |
| [signwriting-animation](https://github.com/sign-language-processing/signwriting-animation) | Converts SignWriting to skeletal `.pose` animation | [MIT code license](https://github.com/sign-language-processing/signwriting-animation/blob/main/LICENSE); example data is described as DSGS, not a ready reviewed ASL GLB library; repository is archived |

The self-hosted spoken-to-signed README documents `POST /senses-to-gloss` and `POST /gloss-to-pose`. The latter needs a configured lexicon/database; the former describes lexical rules and downstream limitations. These are published interfaces for that code, not evidence that a public Rylo endpoint grants unrestricted third-party service access or dataset redistribution. Its fingerspelling option must not be enabled locally without suitable reviewed animation assets.

Published frontend code references hosted services: [SignWriting translation service](https://github.com/sign/translate/blob/928d49ffe223fccedca64162851d4951b9152ecc/src/app/modules/translate/signwriting-translation.service.ts) constructs `sw-translation.<apiDomain>` requests, while [translation service](https://github.com/sign/translate/blob/928d49ffe223fccedca64162851d4951b9152ecc/src/app/modules/translate/translate.service.ts) references text normalization, SignWriting description, and an older Cloud Functions pose service. The production environment uses `nagish.io`. Those published source references were read without directly invoking the APIs. Separately, the public Rylo demo UI received only the generic 17-character example `Hello. Thank you.` through its normal interface; no private user text, authenticated account, direct private API access, download, or sharing was used. No independent API access agreement, availability guarantee, or reusable-output license was established by this research, and the local app does not rely on Rylo's hosted services.

## Rylo Dictionary: data is separately licensed

The official [dictionary](https://rylo.com/sign/dictionary/en) organizes signs by concept/meaning. Its [About/source notices](https://rylo.com/sign/dictionary/about) distinguish several sources:

- WordNet words, definitions, and examples retain each underlying wordnet's license.
- Wikidata concepts/entities and lexemes are CC0.
- ARASAAC pictograms are CC BY-NC-SA 4.0.
- Expert-contributed sign videos and their concept links are licensed for noncommercial use only; the page directs commercial users to the provider.

The linked [general Rylo terms](https://rylo.com/legal/terms) restrict scraping and copying website/app material except where separately licensed. A visible dictionary result or a downloadable-looking browser URL is therefore not treated here as permission to collect its media. This research did not copy dictionary media, demo translations, protected data, or user-specific information. The permission record for any future integration must identify the particular code, model, text database, pose data, and video source independently.

## 3D-LEX: actual public ASL animation data

The earlier conclusion that OSF access was unavailable was corrected after inspecting the public API with network access and UTF-8 decoding. Empty top-level storage folders contain nested public components:

`g7u9c` → `cv276` (3D-LEX) → `2r8k5` (data) → `3wsed` (ASL) → `mqzyk` (Animation Data).

The [ASL Animation Data file API](https://api.osf.io/v2/nodes/mqzyk/files/osfstorage/?page%5Bsize%5D=100) returned HTTP 200 with two files and no next page:

| Archive | Published size | Official download |
| --- | --- | --- |
| `ASL_ANIM_GLB.zip` | 392,740,736 bytes | [GLB archive](https://osf.io/download/tcnhs/) |
| `ASL_ANIM_FBX.zip` | 438,863,837 bytes | [FBX archive](https://osf.io/download/39cmr/) |

The [animation component](https://osf.io/mqzyk/) has no further child components. Its [node metadata](https://api.osf.io/v2/nodes/mqzyk/) references license ID `563c1cf88c5e4a3877f9e96a`; the [license API](https://api.osf.io/v2/licenses/563c1cf88c5e4a3877f9e96a/) identifies CC BY 4.0. [The author repository](https://github.com/OlineRanum/SAPA) confirms this dataset license. The repository's older instruction to contact the authors does not negate the verified public archive listing.

Attribution: Oline Ranum, Gomèr Otterspeer, Jari I. Andersen, Robert G. Belleman, and Floris Roelofsen (2024), *3D-LEX v1.0 — 3D Lexicons for American Sign Language and Sign Language of the Netherlands*. Credit the authors, retain the source/license notices, and record extraction, retargeting, clipping, timing, or other modifications. [Primary paper and citation](https://aclanthology.org/2024.signlang-1.33/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The [paper](https://aclanthology.org/2024.signlang-1.33.pdf) describes captured body and finger motion, retargeted animation data, and signer review of capture quality. It also documents glove handshape limitations, orientation artifacts, limited signer diversity, and incomplete nonmanual evaluation. Source capture review is not equivalent to validation of retargeted Aarav clips or arbitrary sentence translation. Do not mark imported clips `validated: true` solely because they have a source gloss.

The [ASL component's official known-issues wiki](https://api.osf.io/v2/wikis/fq59z/content/) reports 62 missing GLB animations and 62 missing FBX animations, plus missing hand, face, and body data. The nominal 1,000-sign vocabulary is not a guarantee that every requested clip exists in either archive.

The implementation inspection recovered the ZIP central directory and selected samples through bounded HTTP Range requests, retaining the original interrupted archive prefix. The directory indexes **938 GLBs**. Ten samples were verified against decompressed length and ZIP CRC32. `hello.glb` and `add.glb` contain no animation; `thank_you.glb` is absent. Animated `help`, `yes`, `no`, and `love` samples contain finger rotations, but differ in rig/root/bind-pose details and contain no facial blendshape animation. These four are registered as research candidates rather than approved translations.

Only motion-only data is prepared for retargeting to the existing licensed Aarav rig. The source third-party avatar mesh has no separately established redistribution permission in the inspected archive, so its geometry stays private in the ignored inspection cache. No source GLB with that mesh is placed in public website assets. Record original filenames, extraction and calibration changes, source attribution, and runtime technical checks with the motion import. The private inspection record is `asset-downloads/asl-inspection/RETARGETING-NOTES.md`; its successful parsing and CRC checks do not constitute linguistic review.

## Gloss mapping findings and integration gates

No separate English-gloss table was exposed in the public top-level ASL/animation storage metadata. The author's [pose filename list](https://github.com/OlineRanum/SAPA/blob/main/data/data_lists/poses.txt) and [video filename list](https://github.com/OlineRanum/SAPA/blob/main/data/data_lists/videos.txt) contain opaque benchmark identifiers, not an authoritative ASL-animation filename-to-English mapping. `wlasl_subset.json` is benchmark metadata; it must not be assumed to map the animation archive without verifying identifiers.

The archive import retains each exact source filename and its provenance. A gloss inferred only from a filename is a source label awaiting verification, not a verified English sense or grammar rule. Do not invent mappings for opaque identifiers, equate all English synonyms with one sign, or treat the original project's 44 recognition labels as available signing animations. The four research mappings remain conditional/unreviewed; multiword glosses and contextual interpretation require separate review.

Before enabling a sourced clip in the default signing queue: confirm source identity and license; inspect bone/track compatibility; check both hands and face throughout playback and on mobile; correct mechanical defects without changing linguistic content; verify the gloss/meaning mapping; and record an appropriate ASL review status. Unreviewed sourced motions can be separated as research previews with their source and limitations visible. Full sentence grammar and valid fingerspelling remain separate requirements.

The backend's default review gate remains closed for all current recorded and procedural motions. This source record does not approve the catalog, default grammar translation, or any animation. Asset preparation and rendered runtime verification are recorded separately by the implementation work.

---
license: cc-by-nc-sa-4.0
language:
- ase
- en
tags:
- sign-language
- asl
- american-sign-language
- keypoints
- mediapipe
- pose-estimation
- multimodal
- accessibility
- deaf
- benchmark
pretty_name: "CLERC Épée v0.3 - Sign Language Data Layer"
size_categories:
- 1K<n<10K
task_categories:
- feature-extraction
- translation
- token-classification
---

# CLERC Épée v0.3

**The first AI-grade sign language data layer.**

![clips](https://img.shields.io/badge/clips-1,200-10b981) ![duration](https://img.shields.io/badge/signed_duration-70.86_min-10b981) ![signers](https://img.shields.io/badge/Deaf_signers-6-10b981) ![phrases](https://img.shields.io/badge/parallel_grid-201_phrases_×_5_signers-0ea5e9) ![keypoints](https://img.shields.io/badge/keypoints-128_per_frame-0ea5e9) ![license](https://img.shields.io/badge/license-CC_BY--NC--SA_4.0-64748b)

> **CLERC** builds the data infrastructure layer for sign language in multimodal AI.
> 🌐 [clerc.io](https://clerc.io) · 💻 [Toolkit on GitHub](https://github.com/melouxflorian-jpg/epee-asl-toolkit) · ✉️ [florian@clerc.io](mailto:florian@clerc.io)
> Commercial licensing and full corpus access on request.

The corpus is built around one idea: **the same phrase, signed by several Deaf signers, in a controlled recording protocol.** This is what that looks like, straight from the release keypoints:

![One phrase, five signers](assets/hero_parallel.gif)

Every clip in the parallel grid has this property. Inter-signer variation - style, rhythm, signing space, handshape choices - stops being noise you fight and becomes the thing you can measure.

**v0.3 expands the signer pool from 4 to 6 and the corpus from 600 to 1,200 clips**, widens the parallel grid from 150 to 201 phrases, and adds a signer recorded on a distinct register.

> CLERC builds the data layer underneath sign language AI - not a translation tool, not an accessibility app. Infrastructure.

## Quick start

```python
import json, numpy as np, pandas as pd
from pathlib import Path
from huggingface_hub import snapshot_download

ROOT = Path(snapshot_download(repo_id="CLERC-DATA/epee", repo_type="dataset"))
meta = pd.read_csv(ROOT / "metadata.csv")

# five renderings of the same phrase, ready to compare
grid = meta[meta.parallel == "yes"]
phrase = grid[grid.phrase_id == 1]
clips = {r.signer_id: np.load(ROOT / "keypoints" / f"{r.clip_id}.npy")
         for r in phrase.itertuples()}          # each (n_frames, 128, 3)
```

Or in five minutes with the open Python toolkit: [`epee-asl-toolkit`](https://github.com/melouxflorian-jpg/epee-asl-toolkit) - loaders, keypoint visualization, inter-signer variability analysis.

---

## Dataset Summary

- **1,200 ASL clips, 70.86 minutes of continuous signing** - 6 Deaf signers, 200 clips each
- **Parallel grid** - 200 phrases signed by 5 of the 6 signers, for direct inter-signer variability analysis
- **A second register** - the 6th signer (FOXTROT) contributes 200 declarative sentences from a disjoint prompt set, so the corpus is not only short conversational phrases
- **Explicit phrase alignment** - a `phrase_id` column pairs renderings of the same phrase across signers, no id arithmetic required
- **Multimodal keypoints** - hands, body, eyes, mouth, head silhouette (MediaPipe-extracted)
- **Linguistically validated** - ASL gloss annotations with temporal segmentation

> **This release ships extracted keypoints and annotations only - no raw video.** Source clips remain proprietary; access is reserved for commercial licensing (contact **florian@clerc.io**).

This is **v0.3**, a pilot release representing a portion of the full CLERC catalog. Full corpus access available via commercial license.

---

## Benchmark - why multi-signer data matters

A small BiLSTM trained on the six release signers and tested on signers held **entirely outside** the
training set shows the core result: **one signer does not generalize to a stranger, six do better than four.**

![benchmark](benchmark.png)

- Train on 1 → … → 6 signers, tested on a brand-new signer: **29% → 47% → 57% → 63% → 65% → 69%** accuracy (macro-F1 0.17 → 0.57).
- More data keeps lifting it: **22% → 71%** as training examples grow (1,393 segments in the v0.3 pool vs 858 in v0.2).
- Tested on two signers with **no clips in this release**, same 24-gloss subset and protocol as the v0.2 measurement, 8 seeds - the two curves are directly comparable and the v0.2 one is overlaid in the figure.

Full method, numbers, and honest caveats: **[BENCHMARK.md](BENCHMARK.md)**.

---

## Dataset Statistics

| Metric | Value |
|---|---|
| Total clips | 1,200 (200 per signer) |
| Signers | 6 (ALPHA, BRAVO, CHARLIE, DELTA, ECHO, FOXTROT) |
| Parallel grid | 1,000 clips over 201 phrases (5 signers) |
| Second register | 200 clips, 200 phrases (FOXTROT, disjoint prompt set) |
| Unique phrases | 401 |
| Total frames | 127,545 |
| Mean clip length | 106 frames (≈ 3.5 s @ 30 fps) |
| Total signed duration | 70.86 min |
| Gloss tokens | 3,788 |
| Unique glosses | 724 |
| Mean segments per clip | 3.16 |
| MediaPipe head-silhouette detection | 99.98% of frames |
| Frame rate | 29.9 – 30.1 fps |
| Coordinate space | MediaPipe image-normalized (signer perspective) |

**Top 10 glosses** (cumulative coverage of corpus):

| # | Gloss | Tokens | % of corpus |
|---|---|---|---|
| 1 | YOU | 418 | 11.0% |
| 2 | QUESTION | 293 | 7.7% |
| 3 | WHAT | 83 | 2.2% |
| 4 | HAVE | 77 | 2.0% |
| 5 | WHERE | 68 | 1.8% |
| 6 | LIKE | 63 | 1.7% |
| 7 | YOUR | 58 | 1.5% |
| 8 | I | 52 | 1.4% |
| 9 | WANT | 52 | 1.4% |
| 10 | HOW | 42 | 1.1% |

---

## Languages

- American Sign Language (ASL) - ISO 639-3: `ase`
- Written translations in English

---

## Dataset Structure

```
epee/
├── keypoints/           # 1,200 .npy arrays, shape (n_frames, 128, 3)
├── annotations/         # 1,200 .json files
└── metadata.csv         # master index (1 row per clip)
```

### Keypoint layout (128 landmarks per frame)

| Indices | Region | Source | Notes |
|---------|--------|--------|-------|
| 0–20 | Left hand (21 points) | MediaPipe Hands | |
| 21–41 | Right hand (21 points) | MediaPipe Hands | |
| 42–53 | Upper body (12 points) | MediaPipe Pose [11:23] | shoulders, elbows, wrists, finger anchors |
| 54–63 | Lower body (10 points) | MediaPipe Pose [23:33] | hips, knees, ankles, heels, feet - spatial context, optional |
| 64–91 | Eyes + mouth only (28 points) | MediaPipe Face | privacy-preserving subset |
| 92–127 | Head silhouette (36 points) | MediaPipe FaceMesh `FACE_OVAL` | forehead, jaw, ears - outline only, no internal features |

The 36 head-silhouette landmarks come from MediaPipe FaceMesh `FACE_OVAL` indices `10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109` (in that traversal order). The points form a closed polygon outlining the head - no internal facial features are included, so the privacy stance is preserved.

### Coordinate space

Coordinates are MediaPipe's **image-normalized space**, NOT clipped to `[0, 1]`:

- **x** is in `[0, 1]` (frame width); a landmark extrapolated just off-frame can fall slightly outside `[0, 1]`
- **y** is in `[0, 1]` for points visible in frame, but can exceed `1.0` for body landmarks extrapolated below the visible frame
- **z** is depth relative to the hips, roughly in MediaPipe Pose's world-scale units

Source clips are framed waist-up. Lower-body landmarks (dataset indices **54–63**) come from MediaPipe Pose's full-body prediction. For hand/face-only SLR pipelines, they can be dropped:

```python
kp_slr = np.concatenate([kp[:, :54], kp[:, 64:]], axis=1)  # → (n_frames, 118, 3)
```

Zero values `(0, 0, 0)` indicate a landmark was not detected for that frame (e.g. an off-screen hand).

### Gloss conventions

Glosses (uppercase ASL labels) follow a few conventions worth knowing before training:

**Base gloss** - `WHAT`, `YOU`, `BATHROOM`. The standard form of a sign.

**Variants - `BASE_N`** (e.g. `SIGN_2`, `WHAT_3`). Alternative ways to sign the same English concept (different handshape, location, or movement). The number `N` is an internal disambiguator, not an intensity marker. Treat `WHAT`, `WHAT_2`, `WHAT_3` as siblings sharing the same English target.

**Directional / movement suffixes** - `POINTER_RIGHT`, `GO_LEFT`, `HOW_RIGHT_MOVE`. These mark spatial/movement components inherent to the sign and should not be collapsed with their base form.

**Phrase repetitions** - Some clips contain the target phrase signed more than once (emphasis, demonstration, self-correction). Each occurrence is a separate gloss segment. This is natural signer behavior, not a labeling error.

**Recommended preprocessing**

```python
import re
def base_gloss(g):
    return re.sub(r"_\d+$", "", g)   # SIGN_2 → SIGN

from collections import Counter
def has_repeat(segments):
    return any(c >= 2 for c in Counter(s["gloss"] for s in segments).values())
```

### Annotation schema (per clip)

```json
{
  "clip_id": "clerc_v03_0001",
  "signer_id": "ALPHA",
  "sign_language": "ASL",
  "text_en": "What's up?",
  "fps": 30.0,
  "n_frames": 139,
  "phrase_id": 1,
  "parallel": true,
  "segments": [
    { "gloss": "WHAT'S UP", "start": 0.9, "end": 1.4 },
    { "gloss": "QUESTION",  "start": 2.0, "end": 2.8 }
  ]
}
```

`phrase_id` identifies the phrase, not the clip: two clips sharing a `phrase_id`
are two signers' renderings of the same phrase, and their `text_en` strings are
identical by construction. `parallel` is `true` for the 5-signer grid and
`false` for FOXTROT's own prompt set (whose `phrase_id`s start at 1001).

### metadata.csv columns

| Column | Meaning |
|---|---|
| `clip_id` | `clerc_v03_0001` … `clerc_v03_1200` |
| `signer_id` | pseudonym, ALPHA … FOXTROT |
| `phrase_id` | phrase identity, shared across signers (see above) |
| `parallel` | `yes` inside the 5-signer grid, `no` for FOXTROT |
| `text_en` | English phrase, identical for a given `phrase_id` |
| `fps`, `n_frames` | clip timing |
| `oval_detection` | fraction of frames where the head silhouette was found |
| `gloss_sequence` | ` \| `-joined glosses, in order |

---

## Signers

| signer_id | Gender | Age range | Language acquisition | Clips | Grid |
|-----------|--------|-----------|---------------------|-------|------|
| ALPHA | F | 30–40 | Native Deaf signer (ASL L1) | clerc_v03_0001 → 0200 | parallel |
| BRAVO | M | 30–40 | Native Deaf signer (ASL L1) | clerc_v03_0201 → 0400 | parallel |
| CHARLIE | M | 30–40 | Native Deaf signer (ASL L1) | clerc_v03_0401 → 0600 | parallel |
| DELTA | F | 30–40 | Native Deaf signer (ASL L1) | clerc_v03_0601 → 0800 | parallel |
| ECHO | F | 18–24 | Native Deaf signer (ASL L1) | clerc_v03_0801 → 1000 | parallel |
| FOXTROT | M | 35–45 | Native Deaf signer (ASL L1) | clerc_v03_1001 → 1200 | own set |

**Demographic distribution:** 3 female / 3 male, aged 18–45. All native ASL signers (Deaf, ASL as first language). Signer identities are pseudonymized. ALPHA–DELTA are the same four signers as v0.2, under the same pseudonyms.

Signers participated under written informed consent. The signing space, framing, lighting, and recording protocol were standardized across signers.

**Parallel structure:** five signers (ALPHA–ECHO) cover a grid of 201 phrases. Pair renderings through the `phrase_id` column rather than by arithmetic on `clip_id`: 5 signers on 199 phrases, 4 signers on 1 phrase, 1 signers on 1 phrase. The two phrases below full coverage are a v0.2 phrase ECHO did not record, and one extra phrase recorded by ECHO alone to bring her block to 200.

**FOXTROT is deliberately not parallel.** He was recorded on a different prompt set: full declarative sentences rather than the short conversational phrases and number expressions of the grid. Only one of his phrases occurs in the other signers' material, so aligning him would have meant either 61 clips instead of 200, or dropping him. He is included as a second register, and his 200 phrases are unique to him. Filter on `parallel == "no"` to isolate him, or on `parallel == "yes"` for strictly comparable inter-signer work.

**Stylistic note:** Phrase repetition rates vary by signer - natural inter-signer stylistic variation, annotated as separate gloss segments. See gloss conventions for filtering.

---

## Intended Use

### Designed for
- Inter-signer variability analysis (style, rhythm, signing space)
- Research on sign language linguistics, gesture recognition, multimodal AI
- Educational use in academic settings
- Prototyping sign language recognition (SLR) pipelines on a parallel multi-signer corpus

### Not designed for
- Speaker identification or biometric applications
- Surveillance or evaluation of individual signers

For production-grade systems or sign language generation models trained at scale, see commercial licensing for access to the full multi-signer corpus.

---

## Loading the Dataset

This release ships as plain `.npy` + `.json` files for transparency and zero-dependency loading.

```python
import json
import numpy as np
import pandas as pd
from pathlib import Path
from huggingface_hub import snapshot_download

ROOT = Path(snapshot_download(repo_id="CLERC-DATA/epee", repo_type="dataset"))

metadata = pd.read_csv(ROOT / "metadata.csv")

clip_id = "clerc_v03_0001"
with open(ROOT / "annotations" / f"{clip_id}.json") as f:
    annotation = json.load(f)
keypoints = np.load(ROOT / "keypoints" / f"{clip_id}.npy")

hands       = keypoints[:, :42]
upper_body  = keypoints[:, 42:54]
face_inner  = keypoints[:, 64:92]
head_oval   = keypoints[:, 92:128]
```

**Comparing signers on the same phrase** - group by `phrase_id` inside the parallel grid:

```python
grid = metadata[metadata.parallel == "yes"]
for phrase_id, group in grid.groupby("phrase_id"):
    # one row per signer, same text_en, directly comparable
    print(phrase_id, group.text_en.iloc[0], list(group.signer_id))
```

---

## License

**CC BY-NC-SA 4.0** - [creativecommons.org/licenses/by-nc-sa/4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**Commercial licensing:** for enterprise use, training of commercial models, or integration into commercial products, contact **florian@clerc.io**.

---

## Ethical Considerations

CLERC is Deaf-led infrastructure. This release adheres to:

- **Informed consent** - all signers have provided written consent for public release under this license
- **Privacy protection** - no video, no pixels; face landmarks restricted to non-identifying features (eyes + mouth + head outline), no face mesh, no blendshapes
- **Community benefit** - released to advance sign language technology research; commercial revenue supports continued Deaf-led data infrastructure
- **No surveillance use** - must not be used for individual identification, behavioral profiling, or signer surveillance

### Skeletons are body data

Removing the video removes the face, not the body. Body proportions in keypoint
data act as a **soft biometric**: on this release, a plain logistic regression
separates the six signers with **94% accuracy from nine limb-ratio features
alone** (chance is 17%), using no hand and no face landmarks at all. We measured
this rather than assume it, and we state it rather than let "anonymized
skeletons" imply more than it delivers.

What this means for you as a user of this data:

- Pseudonymization here protects **names, not bodies**. `ALPHA` is a stable
  identity across clips and across CLERC releases, by design, because parallel
  analysis requires it.
- Linking these skeletons to any other recording of the same person, in this
  dataset or outside it, is **identification**, and it is prohibited under the
  no-surveillance term above regardless of technical feasibility.
- If you redistribute derivatives under the share-alike term, this property
  travels with them. Carry this note forward.

We are a Deaf-led organization publishing data about Deaf bodies. Naming this
limitation is part of the job, not an admission against interest.

---

## Limitations

- **Pilot release** - 1,200 clips is a baseline pilot, not a production-scale corpus
- **6 signers** - limited inter-signer diversity; full catalog includes a broader signer pool
- **One signer outside the grid** - FOXTROT's 200 clips are not phrase-matched to the others, so strictly parallel analyses run on 1,000 clips, not 1,200
- **Uneven grid coverage** - 5 signers on 199 phrases, 4 signers on 1 phrase, 1 signers on 1 phrase inside the grid
- **Phrase domain** - conversational phrases, number expressions, and (FOXTROT) general declarative sentences; not domain-specific (medical, legal, technical)
- **Reduced face landmarks** - full facial grammar (brow, cheeks, head tilt) not included
- **Gloss only** - no morphological, prosodic, or spatial annotation layers in v0.3
- **Skeletons are a soft biometric** - signer identity is recoverable from body proportions (see Ethical Considerations); treat pseudonyms as stable identities, not as anonymity

---

## Versioning & Roadmap

| Version | Status | Content |
|---------|--------|---------|
| v0.1 | Superseded | 300 clips, 3 signers, gloss + timing |
| v0.2 | Superseded | 600 clips, 4 signers (ALPHA–DELTA), 150 parallel phrases |
| **v0.3** | ✅ Current | 1,200 clips, 6 signers (ALPHA–FOXTROT), 201-phrase grid + a second register |
| v1.0 | Planned 2027 | Multi-layer annotations, broader corpus |

Superseded versions stay reachable as git tags on this repo (`v0.1`, `v0.2`), so
earlier clip ids remain resolvable for anyone who cited them:

```python
snapshot_download(repo_id="CLERC-DATA/epee", repo_type="dataset", revision="v0.2")
```

---

## How to Cite

```bibtex
@dataset{clerc_epee_v03_2026,
  author       = {M{\'e}loux, Florian and {CLERC}},
  title        = {{CLERC} {\'E}p{\'e}e v0.3: Sign Language Data Layer},
  year         = {2026},
  publisher    = {Hugging Face},
  version      = {0.3},
  doi          = {10.5281/zenodo.22081248},
  url          = {https://huggingface.co/datasets/CLERC-DATA/epee}
}
```

---

## About CLERC

CLERC builds the data infrastructure that lets AI understand sign language as a first-class language - not an accessibility afterthought.

> Sign language is not to be translated. It is to be inscribed.

**Website:** [clerc.io](https://clerc.io) · **Contact:** florian@clerc.io · **LinkedIn:** [clerc-io](https://linkedin.com/company/clerc-io)

---

## Changelog

**v0.3 - August 2026**
- Signer pool 4 → 6: added ECHO and FOXTROT. Corpus 600 → 1,200 clips, 200 per signer
- Parallel grid widened 150 → 201 phrases across 5 signers. 5 signers on 199 phrases, 4 signers on 1 phrase, 1 signers on 1 phrase
- FOXTROT added as a second register: 200 declarative sentences on a prompt set disjoint from the grid, flagged `parallel = no`
- New `phrase_id` and `parallel` fields in `metadata.csv` and in each annotation, so cross-signer pairing no longer depends on clip-id arithmetic
- New `oval_detection` column reporting per-clip head-silhouette coverage
- Clips renumbered `clerc_v03_0001`–`clerc_v03_1200`; v0.2 ids stay resolvable under tag `v0.2`
- Head silhouette now extracted on a pose-guided head crop rather than the full frame. MediaPipe's face detector drops faces below roughly 8% of image width; on the clips where this happened the old path lost up to 21% of frames, the new one loses none. The 92 body/hand/face-subset keypoints are produced by the unchanged pipeline
- The four v0.2 signers keep their pseudonyms and their original recordings for the 150 phrases already published
- Signer-robustness benchmark re-run on the six v0.3 signers, same protocol, vocabulary and held-out signers as v0.2 - the two curves are directly comparable (v0.2 overlaid in the figure)
- Added a measured statement on skeletons as a soft biometric, replacing the v0.2 card's "full biometric data excluded" wording, which overstated what removing video achieves

**v0.2 - June 2026**
- Added 4th signer (DELTA) and expanded to 600 clips
- Restructured to 150 fully-parallel phrases × 4 signers (phrase-aligned clip blocks)
- Same 128 multimodal keypoints/frame and gloss schema as v0.1

**v0.1 - May 2026**
- Initial public release - 300 clips, 3 signers, parallel structure

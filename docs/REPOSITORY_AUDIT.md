# Repository audit — 12 October 2026

The active project targets ASL. English, Hindi and other interface/speech labels do not switch the signed language. Aarav, the existing licensed human model, was retained. No CNN images or weights were converted into animation.

A checkpoint was saved before edits at `../.checkpoints/before-concept-vocabulary-20261012-134753`: `project.zip`, `CHECKPOINT.json`, and a consistent SQLite backup. ZIP SHA256: `c85b8c97b0e34510d1070cb9b04bca706b18f04b732c89b484b8212c5f403ca0`. Existing source assets, old motion bytes and valuable history were preserved.

## harshbg/Sign-Language-Interpreter-using-Deep-Learning

[Original repository](https://github.com/harshbg/Sign-Language-Interpreter-using-Deep-Learning), local HEAD `6f594c03aa60c324e11cea03e2a17cb0d1677bff`. Eleven files exist under `Code`. `final.py` segments a hand image, calls a CNN classifier, obtains a database label and speaks text. The input is camera imagery and the output is a label/text; it does not generate signing from text. Local `gesture_db.db` has 44 rows. `cnn_model_keras2.h5`, training `gestures/`, and imported `cnn_tf.py` are absent from this clone, so the original interpreter is incomplete. MIT covers the original repository; linked Drive resources were not independently licensed or imported. README accuracy claims were not reproduced.

## EvilPort2/Sign-Language

[Repository](https://github.com/EvilPort2/Sign-Language) public tree snapshot `df1d62444340f70da6847601f30919ebdc914e73` (tree SHA, not claimed as a commit). Root scripts, database, H5 classifier and gesture directories were inspected through public GitHub endpoints. No root LICENSE or artifact-specific reuse permission was established for the inspected tree. No code, image dataset or classifier was integrated from it.

Its database is **byte-identical** to the existing database: SHA256 `1b07ca5177e2b5adf2a15385b4461b32033ad43befda4ed862bd44a29f4bae29`. The same schema and 44 class labels provide zero additional classes. Its classifier is 595,024 bytes, SHA256 `98adfad75a4e384fdb0f30cc3ddc054a7076a538922f1078c0545cc1a3226363`. Safely inspected embedded model configuration describes 50×50×1 image input, three convolution/pooling pairs, Dense 128, Dropout 0.2 and a 44-way softmax. This is recognition, with no articulated avatar/motion tracks. It was not deserialized or executed.

All 44 numbered training folders were listed. Only folder 0 was fully enumerated: 2,400 JPGs. One sample was 50×50 grayscale. This does not establish the total image count of every class, temporal motion, fingerspelling transitions or linguistic correctness. Pickled histogram data was not executed. Public inspection files remain in ignored, non-served `asset-downloads/repository-audit/`.

## Exact database classes

Schema: `CREATE TABLE gesture (g_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, g_name TEXT NOT NULL)`.

| IDs | Exact stored labels | Interpretation status |
| --- | --- | --- |
| 0–25 | A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z | Alphabet recognition labels; static images cannot establish J/Z movement or usable fingerspelling |
| 26–35 | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 | Number recognition labels; no numeric signing animations |
| 36 | `Best of Luck ` | Custom/phrase label; unverified |
| 37 | `You ` | Candidate pronoun; not a reviewed motion |
| 38 | `I/Me ` | Candidate pronoun; distinct from letter I |
| 39 | `Like ` | Sense unresolved; enjoyment and resemblance must remain separate |
| 40 | `Remember ` | Candidate lexical label; movement not established by image |
| 41 | `Love ` | Candidate affection label; not automatically ILY |
| 42 | `Fuck ` | Unverified custom/profanity label; not enabled |
| 43 | `I love you` | Phrase/ILY label; no sentence motion or grammar proof |

Only factual class metadata and provenance were reused for audit and planning. No recognition class was promoted into an enabled sign. The corresponding compatible motion candidates came separately from author-published 3D-LEX ASL data under CC BY 4.0.

## Wider public-source research

| Source | Directly established | Integration decision |
| --- | --- | --- |
| [3D-LEX / author repository](https://github.com/OlineRanum/SAPA), [ASL archive](https://osf.io/mqzyk/) | Dataset motion/data CC BY 4.0; ASL and NGT are separate components. The ASL archive directory contains 938 GLB files, including placeholders | Complete file-discovery index; bounded CRC/SHA-checked samples; 24 unique new motion-only inspection assets. Source meshes never redistributed |
| [How2Sign](https://how2sign.github.io/) | ASL continuous videos/transcripts/keypoints; research-only CC BY-NC 4.0. Not rigged Aarav animation | Not imported; commercial permission not established, no pose extraction or retarget validation performed |
| [ASL Citizen](https://www.microsoft.com/en-us/research/project/asl-citizen/) | Isolated recognition/dictionary-retrieval videos; commercial use requires separate permission according to publisher | Not imported; code license does not license its videos or turn them into signing animation |
| [ASLLVD / Boston University](https://www.bu.edu/asllrp/av/dai-asllvd.html) | Video lexicon with explicit variant/handshape annotation conventions; no compatible avatar motion established | Reference to variant handling only; no videos/spreadsheet imported. Artifact permission not resolved for redistribution |
| [Rylo](https://rylo.com/sign/translate/) | Prior public workflow/source investigation; separate restricted terms | No Rylo dictionary, implementation, generated output or model imported; see research-notes.md |

This is a targeted search of suitable authoritative public sources, not an exhaustive audit of the internet. Public accessibility, code licenses and readme labels do not license every hosted dataset or prove its animation/meaning.

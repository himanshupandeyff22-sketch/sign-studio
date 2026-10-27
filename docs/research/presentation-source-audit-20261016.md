# Public-source audit — 16 October 2026

The project's configured signed language is **American Sign Language (ASL)**.
English/Hindi interface or speech settings do not change it into Indian Sign
Language. No ISL or NGT capture is assigned to an ASL concept in this expansion.

These are direct observations of the linked primary pages/API responses. A
source being accessible, or a clip playing, does not establish that Aarav signs
the intended meaning correctly. Technical and linguistic decisions remain
separate in the canonical manifest.

## Sources with compatible, permitted motion

**3D-LEX v1.0, ASL component.** The [author project page](https://olineranum.github.io/SAPA/)
links the paper, code and OSF dataset. Its [repository](https://github.com/OlineRanum/SAPA)
explicitly distinguishes the data's CC BY 4.0 terms from its MIT code. On this
audit the [ASL animation component API](https://api.osf.io/v2/nodes/mqzyk/) returned
HTTP 200 and points to an explicit
[CC BY 4.0 license record](https://api.osf.io/v2/licenses/563c1cf88c5e4a3877f9e96a/).
SAPA commit: `0f636e119bccde2c035422f50820e3f8b94a5fb8`.

The [component file listing](https://api.osf.io/v2/nodes/mqzyk/files/osfstorage/)
returned the public [ASL_ANIM_GLB.zip](https://osf.io/download/tcnhs/) and
[ASL_ANIM_FBX.zip](https://osf.io/download/39cmr/). GLB archive version **1**,
dated **5 June 2024**, is **392,740,736 bytes**; provider-declared whole-archive
SHA-256 is `bac3e8ca0dbcc45eec0952a20dd04f28cc38131baddc8a354a72da673af0bdc7`.
That provider hash was read from metadata, not verified by downloading the full
archive. We obtain bounded ZIP members, checking the central directory,
filename, decompressed size, CRC32 and each member's actual SHA-256. The archive
index has 938 GLB filenames; filenames alone are not playable vocabulary.

Attribution: Oline Ranum, Gomèr Otterspeer, Jari I. Andersen, Robert G. Belleman
and Floris Roelofsen (2024), 3D-LEX v1.0.
[Publication](https://aclanthology.org/2024.signlang-1.33/),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Installed derivatives contain skeletal transforms, inverse-bind data, timing and
finger/arm tracks only. Source mesh/materials/textures remain private and are
not served. The Wolf3D mesh's separate redistribution rights are not inferred
from the motion data license. The active Rocketbox avatar has its own MIT notice.

**ASLU / Lifeprint.** One hundred comparison pages were fetched successfully;
their exact URLs, response hashes and titles are recorded in the reference
audit JSON. They support a human-review worklist, not an approval or permission
to copy ASLU image/video media. No such media was imported. Page-existence checks
are explicitly weaker than checking an exact recorded variant and its retargeted
handshape, orientation, location, timing and nonmanuals.

## Alternatives inspected; no runtime assets imported

| Source | What was directly observed | Suitability / decision |
| --- | --- | --- |
| [Rylo Translate](https://rylo.com/sign/translate/) | The public page exposes text/language controls, a 500-character counter and a notice that its latest Sign models are research-preview resources unavailable to the public. Its [licenses page](https://rylo.com/sign/translate/legal/licenses/) lists software dependencies. | No official downloadable sign dictionary, model or asset bundle was obtained. Dependency notices are not a license to Rylo's models/data. No private endpoints were used. |
| [Harshbg upstream](https://github.com/harshbg/Sign-Language-Interpreter-using-Deep-Learning) | Camera/CNN gesture-recognition code and image-training workflow, MIT repository notice; source commit `6f594c03aa60c324e11cea03e2a17cb0d1677bff`. | Preserve original code; no new articulated time-sequence motion identified. Historical recognition accuracy is not our translation accuracy. |
| [EvilPort2/Sign-Language](https://github.com/EvilPort2/Sign-Language) | CNN code, H5 model, gesture database, grayscale gesture images and image-flipping workflow; commit `df1d62444340f70da6847601f30919ebdc914e73`. | Recognition samples contain no complete 3D motion, timing, palm trajectory or rig bindings. No separately cleared motion library identified; no runtime import. |
| [How2Sign](https://how2sign.github.io/) | ASL sentence video, English translations and body/face/hand 2D keypoints; dataset page explicitly states CC BY-NC 4.0 and research use. | No drop-in Aarav joint tracks. 2D depth/orientation reconstruction and sentence alignment would require a separate validated pipeline; no dataset media copied. |
| [SignAvatars author repository](https://github.com/ZhengdiYu/SignAvatars) | Whole-body SMPL-X and MANO annotations described; access form/email and noncommercial research conditions; commit `bbfb35056aaad252ae67c60b44eb91618506d4a8`. | Not obtained. No access form submitted or author contacted. Underlying SMPL-X/MANO/model/video terms also require separate review; a repository link is not blanket asset clearance. |
| [RIT/CUNY ASL motion corpus](https://latlab.ist.rit.edu/downloads.html) | Multi-sentence ASL corpus described with BVH, FBX, gloss/timing, spatial-reference annotations and video. Access instructions require emailing the lab. | Not downloaded; no open redistribution terms or unauthenticated download established. No third party contacted. |
| [NVIDIA ASL 1000 / ASL Developer Community](https://github.com/NVIDIA/Trustworthy-AI/tree/main/ASL%20Developer%20Community) | Video and annotated 2D pose/hand/face pipeline; separate dataset-license PDF exists alongside Apache software license. Current repository commit `60685133a0140553efa4e78d1a6001a260d665ea`. | Specific PDF read: purpose-limited/internal authorized use and restrictions on making the data available to others. Not a permissive public runtime motion license. No dataset imported. |

The NVIDIA PDF is version February 4, 2025, SHA-256
`173f7955e1cb04f7da34effaac0d90078633a8759faca001a55faa4c9c2da1f1`.
Its terms were checked separately from the code license. This audit records an
import decision, not a general legal opinion about uses outside this prototype.

## Evidence retained

`asset-downloads/presentation-research-20261016/` is a private, git-ignored audit
cache. It contains OSF file/license records, exact current-commit responses,
the dataset-license PDF and reference-page URL/hash/title checks. This directory
is outside the application's static allowlist. `source-checks.json` records
request status, final public source, bytes and SHA-256; no credentials, temporary
signed download URLs, private endpoints or submitted forms are stored.

## Priority comparison criteria from ASLU

- [NURSE](https://www.lifeprint.com/asl101/pages-signs/n/nurse.htm): modified
  N hand, wrist contact and tap timing distinguish this from medical DOCTOR.
  Verify the target wrist contact rather than counting a generic arm motion.
- [MEDICINE](https://www.lifeprint.com/asl101/pages-signs/m/medicine.htm): middle
  finger/palm contact and pivoting are comparison cues; variants need review.
- [BREATHE](https://www.lifeprint.com/asl101/pages-signs/b/breathe.htm): compare
  both open hands and coordinated movement relative to the chest. This lexical
  item does not supply a clinical assessment or an entire question.
- [COUGH](https://www.lifeprint.com/asl101/pages-signs/c/cough.htm): the reference
  gives multiple legitimate variants and figurative meanings. Identify the
  source variant and exact intended sense before any eligibility decision.
- [HEADACHE](https://www.lifeprint.com/asl101/pages-signs/h/headache.htm): several
  versions are referenced. Review head location, handshape and motion for this
  exact capture; don't substitute generic HURT.
- [FULL](https://www.lifeprint.com/asl101/pages-signs/f/full.htm): capacity,
  satiation and fed-up meanings are distinct; exact sense is unresolved until
  an ASL reviewer checks the capture. Its English gloss is insufficient.
- [INTERPRETER](https://www.lifeprint.com/asl101/pages-signs/i/interpreter.htm):
  compare the hand configuration/rotation and person component. An isolated
  INTERPRET-like movement alone does not establish the occupational sign.

These criteria were paraphrased from the references, not used to synthesize
replacement movements. All installed candidates still require an identified,
dated fluent-ASL review of source and target, aliases, variants and nonmanuals.

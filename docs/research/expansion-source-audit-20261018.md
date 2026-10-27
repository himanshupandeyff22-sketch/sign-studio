# Public-source expansion audit — 18 October 2026

Scope: American Sign Language (ASL). English input is not a sign-language label.
No credentials, restricted endpoints, purchases, contact or public deployment
were used. Public availability was never treated as a license. Sources linked
from GitHub can host their data elsewhere; the actual new motion source was OSF,
identified by the official SAPA repository.

## Obtained and integrated

**3D-LEX v1.0 ASL**, by Oline Ranum, Gomèr Otterspeer, Jari I. Andersen,
Robert G. Belleman and Floris Roelofsen:

- Official repository: <https://github.com/OlineRanum/SAPA>, audited revision
  `0f636e119bccde2c035422f50820e3f8b94a5fb8`.
- Dataset: <https://osf.io/mqzyk/>; public archive
  <https://osf.io/download/tcnhs/>, version 1, 5 June 2024.
- The repository explicitly distinguishes **data CC BY 4.0** from code MIT.
  OSF's ASL component license was independently retrieved:
  <https://api.osf.io/v2/licenses/563c1cf88c5e4a3877f9e96a/>.
  Attribution and marking adaptations remain required.
- The bounded ZIP-range reader obtained **70 selected GLBs** for a concrete
  uniqueness/technical/review audit. The archive has 938 listed ASL filenames;
  filenames are discovery metadata, not 938 reviewed signs. It did not fetch
  the whole 392,740,736-byte archive. Raw files stay in the private download cache.
- **54 unique skeletal-motion derivatives** entered the existing importer and
  canonical manifest, all **inspection only**. Original tracks, skeletal
  transforms and inverse binds are retained; source geometry, textures and
  materials are removed. No source face animation exists in these GLBs.
- The preliminary dry-run classified three static files as rejected and twelve
  duplicate payloads under conflicting labels as conflicting. A whole-batch
  inspection confirmed that **all 15 held GLBs have no animation tracks**.
  Keyboard was excluded because its comparison URL returned a KEY entry;
  its intended sense/reference remains unresolved. Nothing held was enabled.
- Per-file provenance, language, concept/sense, variant label, license, raw SHA,
  normalized motion SHA, runtime SHA, technical diagnostics and pending human
  review are in `web/vocabulary-manifest.json` and the persisted import batch.
  The source author/license statement and OSF license evidence are retained in
  `imports/source-evidence/20261018/`.

## Reference evidence and its limits

Lifeprint / ASL University lexical pages were consulted for candidate meanings.
Direct scripted requests returned HTTP 200 challenge pages titled “One moment,
please…”. These are recorded as failures, not dictionary responses. Separately,
the public web tool retrieved the corresponding lexical pages for 69 entries;
their URLs, method and restricted evidential scope are in
`expansion-public-reference-checks-20261018.json`. Some entries are primarily
images. No reference image, video, dictionary export or lesson was copied.

This establishes a comparison reference for a candidate lexical label, **not**
that a captured motion matches the sense or reference variant. No automated or
human linguistic sign-off is implied. The direct challenge-response hash is
explicitly named `directFetchSHA256`; it is not a hash of web-tool page content.
Review handshape, orientation, location, contact, movement, coordination,
nonmanuals and contextual meaning on source and Aarav before approval.

## Other resources inspected, retained or excluded

| Resource | Observed permissions / suitability | Action |
| --- | --- | --- |
| [harshbg original](https://github.com/harshbg/Sign-Language-Interpreter-using-Deep-Learning) and [EvilPort2](https://github.com/EvilPort2/Sign-Language) | Refreshed public upstream revisions and checked existing audits. Recognition examples/images do not supply a new licensed, reviewed skeletal ASL utterance library. | No duplicate imports or new animation claims. |
| [ASL Citizen](https://www.microsoft.com/en-us/research/project/asl-citizen/) / [code](https://github.com/microsoft/ASL-citizen-code) | Code MIT; dataset terms are separately linked from the official project. Full dataset/weight permissions were not established in this pass. Video recognition data is not an avatar rotation track. | README/code-license metadata only; no videos, dataset or weights acquired. |
| [OpenASL](https://github.com/chevalierNoir/OpenASL) | Official README identifies CC BY-NC-ND 4.0. Direct LICENSE paths were unavailable. Public video references do not grant unrestricted adaptation. | No clips, poses, captions or model weights imported. No derivatives made. |
| [How2Sign](https://how2sign.github.io/) | Official site identifies CC BY-NC 4.0 data. Video/2D keypoints require a separate conversion, evaluation and non-commercial data workflow. | No new data or weights acquired; not treated as drop-in signing animations. |
| [ASL dataset generator](https://github.com/amorim-cleison/asl-datasets-gen) | Repository code GPL-3.0; ASLLVD-derived source data and resulting model/animation rights need separate clearance. | Read README and code license; no imported data or code. |
| CLERC Épée v0.3 | Three existing exact phrase NPY captures are quarantined, CC BY-NC-SA 4.0, pinned `93bc8aa0a6526e86af80db5f59af8d133292c9b5`. Share-alike/non-commercial restrictions and source-video rights remain distinct. | Kept the earlier files/approval gates. Point-coordinate retargeting, nonmanual grammar and fluent-signer review block runtime activation. |
| RIT / NVIDIA / WLASL resources in earlier audits | Earlier access/terms and media-permission blockers remain. A code license cannot clear third-party source videos. | No speculative downloads, new training or claim of acquisition. |

No Rylo database, course media, new avatar, new recognition weights or complete
ASL phrase library was obtained in this pass. No software dependency license
was used to clear a dataset, avatar or model weight.

## Camera model audit

The existing `gesture_recognizer.task` was inspected as a ZIP/TFLite bundle;
SHA-256 `97952348cf6a6a4915c2ea1496b4b37ebabc50cbbf80571435643c455f2b0482`.
Its actual classifier labels are **None, Closed_Fist, Open_Palm, Pointing_Up,
Thumb_Down, Thumb_Up, Victory, ILoveYou**. Seven non-None classes were already
in the model; no classes were trained or downloaded.

[Official guide](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer)
and [web implementation guide](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/web_js)
describe a canned gesture recognizer, not general ASL recognition.
[Official model card](https://storage.googleapis.com/mediapipe-assets/gesture_recognizer/model_card_hand_gesture_classification_with_faireness_2022.pdf)
was consulted. MediaPipe code has Apache-2.0 terms; this does not establish a
separate new training-data/weights grant. The existing model is retained;
no new classifier, weight redistribution or evaluation accuracy is claimed.

Two hands can now be observed, but no temporal ASL classifier has been added.
Five legacy pose mappings remain explicitly illustrative. The remaining two
poses are opt-in, confirmed player controls only. General ASL recognition needs
permitted, labelled temporal/two-hand/nonmanual data, cleared weights, a new
classifier, held-out multi-person evaluation and linguistic mapping review.

See `EXPANSION_AND_CAMERA_20261018.md` in the parent folder for import outcomes,
tests, performance observations, startup and current external blockers.

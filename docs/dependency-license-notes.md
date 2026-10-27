# Dependency and model license evidence

Audited on **12 October 2026**. These notes separate software, model weights,
fonts, and speech services. The project's own license does not replace their
upstream terms. They supplement the main third-party notices; they are not a
complete audit of every native dependency compiled into vendor WASM.

## Verified software licenses

| Resource | Local evidence | License and primary source |
| --- | --- | --- |
| Three.js `0.170.0` | `node_modules/three/package.json` identifies the installed version; `node_modules/three/LICENSE` contains the MIT terms and 2010–2024 Three.js authors' copyright notice. | **MIT**. [Pinned upstream license](https://github.com/mrdoob/three.js/blob/r170/LICENSE). Preserve the copyright and license when redistributing the library. |
| MediaPipe Tasks Vision `0.10.14` | `node_modules/@mediapipe/tasks-vision/package.json` declares `Apache-2.0`. The installed package includes JS and WASM files but no standalone `LICENSE` or `NOTICE` file. | **Apache-2.0** for MediaPipe software. [Upstream license](https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE); [maintainer's Web SDK clarification](https://github.com/google-ai-edge/mediapipe/issues/6306). The package declaration is evidence for the runtime software, not the independent reason for assigning a license to model weights. |

The exact source revision, full third-party component list, and component-specific
notices for the precompiled `0.10.14` WASM files were **not established** by this
audit. Do not describe the runtime dependency audit as a complete artifact-level
SBOM or assume MediaPipe's license overrides licenses of compiled dependencies.

## MediaPipe gesture model weights

### Evidence for the model license

An explicit statement from MediaPipe collaborator **schmidt-sebastian**, posted
on **5 October 2026** in the official MediaPipe repository, says that the project's
source **and models** are Apache-2.0 unless otherwise noted. This statement
explicitly includes models, unlike the npm package's software license declaration.
[Read the maintainer's statement](https://github.com/google-ai-edge/mediapipe/issues/6355).

The official [Gesture Recognizer guide](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer)
links the published model bundle and its
[hand gesture classification model card](https://storage.googleapis.com/mediapipe-assets/gesture_recognizer/model_card_hand_gesture_classification_with_faireness_2022.pdf).
No contrary model-license notice was found in those documents or in the local
bundle inspection below. The recorded license is therefore **Apache-2.0 based
on the maintainer's explicit model declaration**. Applying that general
declaration to this bundle is an inference; an artifact-specific signed license,
publisher attestation, and complete model-component rights manifest were not
provided by the sources reviewed.

The local file is `web/assets/gesture_recognizer.task`. Its acquisition URL,
recorded before this audit in `web/assets/ATTRIBUTION.md`, is:

```text
https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task
```

The official guide currently links a `latest` model URL. The application uses
its existing local file rather than downloading `latest` at runtime. This audit
did not replace the file or redownload the model to prove equality with current
remote bytes.

Local size: **8,373,440 bytes**. Local SHA-256:

```text
97952348cf6a6a4915c2ea1496b4b37ebabc50cbbf80571435643c455f2b0482
```

### Direct inspection of the local task bundle

The outer ZIP task bundle has two nested task bundles. The four model weights
were inspected as TFLite FlatBuffers; their embedded metadata was read using
the fields in the official
[TFLite schema](https://github.com/tensorflow/tensorflow/blob/v2.15.0/tensorflow/lite/schema/schema.fbs)
and [MediaPipe metadata schema](https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/tasks/metadata/metadata_schema.fbs).

| Nested model | Bytes | Embedded `TFLITE_METADATA` findings | Associated files |
| --- | ---: | --- | --- |
| `hand_landmarker.task/hand_detector.tflite` | 2,339,878 | Name: `Multi Hand Detection`; author: `MediaPipe`; version: `1`; license field absent. | `labels.txt` |
| `hand_landmarker.task/hand_landmarks_detector.tflite` | 5,478,949 | Name: `HandLandmarkDetector`; author: `MediaPipe`; version: `1`; license field absent. | `handedness.txt` |
| `hand_gesture_recognizer.task/gesture_embedder.tflite` | 546,000 | No `TFLITE_METADATA` entry found. | No appended associated-file ZIP archive found. |
| `hand_gesture_recognizer.task/canned_gesture_classifier.tflite` | 7,773 | Name: `Gesture Classifier`; author: `MediaPipe`; version: `1`; license field absent. | `labels.txt` |

No `LICENSE` or `NOTICE` was present in the inspected task or associated-file
archives. An absent metadata license field does not itself establish a license;
the independent maintainer statement above supplies the model-license evidence.

For exact-byte identification, the nested model SHA-256 hashes are:

```text
hand_detector.tflite
60d1bf8d70a80aba35b36290bb2a0e52e784ca2e524937d49ea80e8161a8a384

hand_landmarks_detector.tflite
6acda74af3fbf40e68265c20c7394b2bad81a16a481dcd79ad7a081887c3d6b9

gesture_embedder.tflite
54abe78de1d1cd5e3cdaa0dab01db18e3ec7e09a76e7c3b5fa278572f7a60977

canned_gesture_classifier.tflite
62a87ded76da05155f6a59c8babb4c537c138c25138b29450fb030e207a5c0e9
```

### Scope and accuracy

The model card classifies individual hand poses and explicitly places
sign-language translation, multi-hand gestures, and motion gestures outside
its intended scope. A successful camera run or a high confidence score is
therefore **not** evidence of accurate ASL recognition or translation.
[Model card](https://storage.googleapis.com/mediapipe-assets/gesture_recognizer/model_card_hand_gesture_classification_with_faireness_2022.pdf).

## Optional browser-delivered fonts

`web/style.css` requests **DM Sans** and **Manrope** from Google Fonts. No local
copies of font binaries were added during this task. If the request fails,
the existing CSS uses its system-font fallbacks.

| Family | License verified in Google's font repository | Copyright holder |
| --- | --- | --- |
| DM Sans | [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt) | DM Sans Project Authors, 2014 |
| Manrope | [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt) | Manrope Project Authors, 2018 |

If font files are later bundled or self-hosted, retain their own copyright and
OFL notices. Font software remains under OFL; the app's source-code license does
not relicense the fonts. The browser's Google Fonts requests are external
resource delivery, separate from locally served avatar and camera model files.

## Browser speech services and evidence limits

`web/voice.js` uses the browser's speech synthesis and speech recognition APIs.
No third-party TTS model weights, provider SDK, paid speech service, or API key
were added. Voice names, availability, language coverage, and local/remote
execution depend on the browser and operating system. Available system voices
are not project-owned assets and should not be redistributed under the
application's license.

The preference for voices with names such as “Natural,” “Neural,” or “Enhanced”
is a selection heuristic. A returned voice catalog, successful utterance events,
or a functioning microphone permission flow does **not** prove naturalness,
pronunciation quality, human likeness, or signing accuracy. Physical audio
listening and live transcription need device testing; fluent-signer review is
a separate requirement for validating sign motions. Recognition and remote
voices may use their browser/provider services under those providers' terms.

## Research references are not bundled assets

Third-party signing demonstrations examined during research are references,
not model, animation, or motion-capture assets incorporated into this project.
No Rylo video, image, animation, or signing coordinates were copied by this
dependency-audit task. A reference site's asset terms must be checked separately
before any later adaptation or redistribution; the software and model licenses
above do not authorize copying such demonstrations.

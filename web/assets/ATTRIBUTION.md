# Avatar and gesture model

The active **`aarav.glb`** is Microsoft Rocketbox `Male_Adult_04`, converted to glTF by the react-ai-voice-avatar maintainer. It is licensed under **MIT**, with Microsoft's original notice preserved in `AARAV-LICENSE.md`. Source links and rig verification are recorded in `AARAV-SOURCE.md`. The runtime adds appearance tints and procedural gestures. The upstream conversion license is https://github.com/927tanmay/react-ai-voice-avatar/blob/main/assets/avatars/LICENSE.md and the original license is https://github.com/microsoft/Microsoft-Rocketbox/blob/master/LICENSE.md.

The retained legacy `human.glb` is the `mpfb.glb` example by met4citizen, created with Blender and the MPFB extension, from https://github.com/met4citizen/TalkingHead/tree/main/avatars. It is not loaded by the current app.

The author identifies this particular avatar as **CC0** in https://github.com/met4citizen/TalkingHead#the-indexhtml-test-app. The geometry, skeleton, and textures are used here with runtime clothing, skin, and hair variants. Other TalkingHead example avatars have different licenses and are not included.

`gesture_recognizer.task` is Google's MediaPipe Gesture Recognizer model, from https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task. See the upstream MediaPipe license at https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE. It recognizes a small set of canned hand gestures, not continuous sign language.

The gesture and conversational animations are procedural application code and have not been validated by fluent signers. Expressive facial motion is not synchronized audio lip sync.

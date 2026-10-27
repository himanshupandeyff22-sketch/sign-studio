# Aarav human avatar

The file `aarav.glb` is the Microsoft Rocketbox `Male_Adult_04`
avatar, converted to binary glTF by the maintainer of react-ai-voice-avatar. The
source model is licensed under the MIT License. Keep the accompanying
`AARAV-LICENSE.md` copyright and permission notice with distributions.

- Converted asset: https://github.com/927tanmay/react-ai-voice-avatar/blob/main/assets/avatars/aarav.glb
- Direct download: https://raw.githubusercontent.com/927tanmay/react-ai-voice-avatar/main/assets/avatars/aarav.glb
- Conversion and provenance: https://github.com/927tanmay/react-ai-voice-avatar/blob/main/assets/avatars/LICENSE.md
- Conversion script: https://github.com/927tanmay/react-ai-voice-avatar/blob/main/scripts/convert-rocketbox.py
- Original library: https://github.com/microsoft/Microsoft-Rocketbox
- Original license: https://github.com/microsoft/Microsoft-Rocketbox/blob/master/LICENSE.md

Downloaded and inspected on 2026-10-11. File size: 4,673,948 bytes.

## Compatibility inspection

Node.js with Three.js 0.170.0 and GLTFLoader parses the asset successfully. It
contains 80 skin joints, including Left/RightArm, ForeArm, Hand and three joints
for all ten fingers. The coordinate convention is +Y up and +Z forward, verified
from the world position of the face bones. The posed mesh is approximately
1.70 metres tall. The runtime can normalize its height to 1.75 metres.

The 67 facial morph targets include ARKit eye blinks, mouth smiles, browInnerUp,
jawOpen, and Oculus visemes. Material names are `m006_body`, `m006_head` and
`m006_opacity`; colorway selection should target the body material. Optional gaze
bones are `Bip01_LEye` and `Bip01_REye` after GLTFLoader sanitizes their names.

This is the application's active human model. The regression suite exercises
its skeletal transforms, gesture completion, hidden-stage rendering, and lifecycle.

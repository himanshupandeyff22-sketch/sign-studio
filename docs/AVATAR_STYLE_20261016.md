# Aarav: textured crop and clean-shaven face

The short textured crop is original procedural geometry in `web/avatar.js`:
a fitted cap and 125 swept locks, sharing the source skeleton's Head joint.
It replaces the old crown cards at runtime. Old textured hair at the temples
is fitted beneath the cap using the original head atlas; facial cards and
skin are preserved. No Spider-Man model, actor scan, or third-party hair asset
was downloaded. The reference is stylistic, not an exact replica.

The clean-shaven diffuse texture is saved at
`web/assets/aarav-clean-shaven.png`. It was edited with the **built-in imagegen
tool**, then copied into the project. Source: the MIT-licensed Rocketbox head
atlas extracted from the unchanged `web/assets/aarav.glb`. That source atlas
is preserved at `docs/screenshots/theme-20261016/head-atlas-source.png`.
The source license remains in `web/assets/AARAV-LICENSE.md`.

Exact edit prompt:

> Use case: precise-object-edit. Asset type: production 3D character head UV diffuse texture atlas, square 512x512 layout. This image is the EDIT TARGET, not a portrait reference. Remove ONLY the beard, moustache, and stubble from the man's lower face and both jaw/cheek areas, replacing facial hair with clean-shaven natural skin matching adjacent skin color and pore detail. Preserve his exact identity, lips, eyebrows, eyelashes, eyes, ears, nose, scalp hair, lighting, original warm skin hue, UV distortions, all texture island boundaries, black unused background and bottom eye/mouth islands. Keep every landmark in exactly the same relative pixel position; do not reproject, recenter, crop, beautify, change expression or transform this UV atlas into a portrait. No new beard shadow, no text, no watermark. Output a same-layout square clean-shaven texture suitable to apply directly to the existing mesh.

Verification:
- All four `backend/avatar.test.mjs` tests passed after the hair geometry change,
  including playback, framing and cleanup. This run preceded the face texture
  substitution; it does not test that generated bitmap.
- The generated face texture was inspected on the rendered avatar in the
  browser. No rendering errors or warnings were returned.
- The new hair was inspected during paused recorded playback and at a 390px
  mobile viewport. It follows the head and leaves the face visible.
- The grey hoodie and source signing assets are retained. No sign mappings,
  motion timing, or language approval statuses changed.
- Before-hair-change code is preserved in
  `checkpoints/before-textured-crop/avatar.js`.

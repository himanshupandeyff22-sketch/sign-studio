# Spacious Studio presentation pass — 19 October 2026

Preserved Aarav, his appearance/rig, all 729 motion files, the existing planner, 520 checked English ideas and explicit unreviewed-research consent. This change reorganizes the interface, without adding vocabulary or claiming ASL approval.

- Primary workspace: a larger uninterrupted stage beside a roomier message composer. Player controls are together below the signing space; optional viewer tools remain expandable. Fullscreen and Reset Camera remain functional.
- Sentence ideas and the four quick examples moved out of the narrow composer into a separate full-width **Find something to say** section. Its right-hand vertical scrollbar, progressive rows, search/category filters and explicit review-before-play behavior remain. A message-field link jumps to that section.
- The sign plan spans the workspace width and appears only after a result. Empty coverage no longer consumes a card. Original text, missing concepts, corrections and research restrictions remain.
- Removed a redundant workflow step strip. Increased input height, whitespace and readable type; simplified borders/backgrounds. Settings and secondary playback preferences stay collapsed. Mobile/tablet stack the primary cards at 900 px and below; the sentence list uses a single column on phones.

## Checks

Static check passed: 71 JavaScript files, 238 unique UI IDs, runtime/model assets, 729 immutable motion hashes and licence/review notices. Seven existing focused demo/readiness/library checks passed, zero failed (node --test backend/demo-guide.test.mjs backend/readiness.test.mjs backend/library-model.test.mjs).

Browser checks: initial queue hidden; example loads without enabling consent/autoplay; explicit research consent; Please → Drink → Water and a new five-clip paragraph; current clip, pause/resume/replay/seek; full-width coverage; repeated input clears stale plans; negative request held entirely; microphone/camera tabs open without permission/device activation; Fullscreen and Reset Camera; sentence search/category and loading from its new location; visible keyboard focus; mobile/tablet stacking; no horizontal overflow; face and hands visible in inspected desktop/mobile playback frames; no captured console errors. Temporary viewport overrides reset.

Physical camera/microphone recognition, all 729 animation trajectories, device FPS and fluent ASL review were not rerun for this layout-only pass. Previously recorded technical checks remain evidence, not linguistic approval. There are still zero approved ASL signs/sentences; the output is an approximate lexical research sequence.

Run: double-click `start-studio.cmd` or run `node server.mjs` in the project; open http://127.0.0.1:3000/. No new dependencies.

Evidence: docs/screenshots/spacious-studio-20261019/ (initial desktop, desktop playback, mobile stage/input/library).

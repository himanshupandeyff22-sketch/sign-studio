# Motion queue and complete-expression source browser

18 October 2026 · Beyond Words / Sign Studio / Aarav · intended language: ASL

Subsequent user-requested UI change: **How are you?** and **What is your name?**
were removed from both public shortcuts and sentence-browser results because
their complete Aarav animations are unavailable. The browser now shows **42**
options (34 CLERC references and eight external recording links). The 44-entry
source index, canonical proposals and review evidence below remain intact;
earlier screenshots and counts describe the original implementation.

## What works

- **Inspect this motion** is an explicit playback action: load that registered
  recording, show Aarav and start it without another Play click. Speech does
  not start automatically for an inspection. Pause, resume, stop, replay, speed
  and frame inspection remain available. There is no page-load autoplay.
- **Select all shown** selects only the currently rendered motion cards. It
  preserves order, removes duplicates, retains selections across filters and
  shows a mixed checkbox when only some visible motions are selected. Uncheck
  it to remove the shown subset; **Clear selection** clears the whole queue.
  **Show more** exposes more cards. The existing 100-motion request limit is
  explicit; bulk changes that would exceed it are held rather than truncated.
  Search disables bulk selection while its debounce is pending.
- **Play queue · N** starts selected recordings in their selection order.
  **← Motion library** pauses playback and returns to the retained filters and
  selection. Selected duration is shown at 1×. A manual queue is not a sentence
  translation.
- The message form has **44 complete-expression source options**, searchable
  and filterable by source-video availability. How are you? and What is your
  name? are pinned. Their whole-expression requests never substitute word
  clips. How are u? and What's your name? resolve to the same existing canonical
  review proposals. Original input and punctuation remain in the result.
- Eight options offer **Watch complete source recording**: a native video
  player shows the original human signer separately from Aarav. It has playback,
  seeking, a paused-frame slider, close, loading/buffering and error feedback.
  Attribution and the license remain visible. Starting it stops competing
  speech, microphone/camera sessions and avatar playback. Editing input,
  processing another request, changing settings/views, playing Aarav or hiding
  the page releases the video source.

## Counts and import evidence

| Measure | Before this pass | After |
| --- | ---: | ---: |
| Candidate runtime concepts | 268 | 268 |
| Recorded Aarav motion assets | 207 | 207 |
| Approved ASL signs / complete phrases | 0 / 0 | 0 / 0 |
| Existing text-linked unverified Research examples | 4 | 4 |
| Exposed complete-expression source options | 0 in this browser | 44 |
| Source video links in this browser | 0 | 8 |
| Newly enabled complete Aarav expressions | 0 | 0 |

The 36 CLERC expressions are caption/keypoint discovery references, including
previously staged sources; they are not 36 newly downloaded or playable clips.
The eight 2M-Flores recordings are whole utterances, sometimes corresponding to
more than one punctuated English sentence. They are not concatenated word
animations. None has independent team linguistic approval.

Metadata dry-run/commit: **44 added, 0 merged, 0 skipped, 0 conflicts,
44 pending review, 0 runtime motion imports**. Repeat dry-run/commit:
**0 added, 44 skipped**, unchanged index hash
`1eb62f6226dba180568df3c6154e43594e3def9c2b470c035521486317f9f38e`.
See `sentence-index-dry-20261018.json`, `sentence-index-commit-20261018.json`,
`sentence-index-repeat-dry-20261018.json` and
`sentence-index-repeat-commit-20261018.json` in this directory.

The indexer reuses canonical proposal IDs, groups source signer variants,
rejects duplicate normalized captions/IDs and refuses to overwrite a differing
index without explicit merge review. Additional recording content hashes are
not asserted: full media were not acquired. A future motion import must still
use the existing importer and its provenance/content/sense deduplication gates.
No existing sign, recording, alias, approval or sense record was replaced.

## Resources actually obtained and used

1. **Existing CLERC Épée v0.3 ASL metadata**, revision
   `93bc8aa0a6526e86af80db5f59af8d133292c9b5`, by Florian Méloux / CLERC,
   [official dataset](https://huggingface.co/datasets/CLERC-DATA/epee).
   CC BY-NC-SA 4.0, with the publisher's body-data/no-surveillance notices.
   Selected 36 exact source captions and retained all matching signer variants.
   No further NPY files or source videos were downloaded. The existing How are
   you? capture needs contextual review of repeated HOW/YOU segments; the exact
   What is your name? source includes `clerc_v03_0018` (ALPHA, 126 frames).
2. **2M-Flores-ASL**, revision
   `c68240b1fe33d4a9745537a1cff048078376bc9b`,
   [official dataset/card](https://huggingface.co/datasets/alj68/2M-Flores-ASL).
   Its data card explicitly releases 2M-Flores under **CC BY-SA 4.0**, based on
   Flores200 under the same license. Obtained the card, public tree/file sizes,
   dev metadata (999 records) and devtest metadata (1,016 records). Indexed eight
   dev records: 390, 601, 602, 603, 604, 605, 531, 968. No full videos are bundled.
   One was streamed in the browser, and bounded head/tail bytes were inspected
   for format. No new model weights or rigged animation were obtained.

The source card describes ASL/native-signer translations and a publisher gloss
format check. This is a publisher statement, not an independently reproduced
review or our team's approval. Preserve the full author attribution/citation
in [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md) and the copied source card in
`imports/source-evidence/20261018/2m-flores-SOURCE_README.md`. Per-record licenses
remain separate; third-party data are not relicensed as app code.

[How2Sign](https://how2sign.github.io/) was inspected as a non-commercial
research alternative but not imported. The
[sign-language-translator dataset repository](https://github.com/sign-language-translator/sign-language-datasets)
publishes Pakistani Sign Language resources; these were excluded from ASL.
No public website or repository license was treated as permission for unrelated
videos, courses, avatars or recognition weights.

## Verification

- `node scripts/check.mjs`: passed, 57 JavaScript files, 207 unique UI IDs,
  207 immutable recorded motions, required local assets/notices.
- `node --test web/phrases.test.mjs backend/*.test.mjs`: **93 passed, 0 failed**,
  about 263 seconds. Log: `library-usability-full-tests-20261018.log`.
  This includes existing long-input, meaning/sense, import and actual-rig
  regressions plus focused bulk-selection, strict complete-expression and
  source-index/repeat-import tests. These are automated tests, not human ASL
  recognition or linguistic evaluation.
- In-app Chromium browser on this Windows laptop: one-click Help inspection
  started without Play; selected 40/80 entries, checked partial selection and
  the 100 cap; filtered Bicycle/Cup selections retained order and started as a
  two-recording queue; return-to-library, pause and frame seeking worked.
- How are you? / What is your name? preserved their exact text, queued zero
  isolated words and displayed the missing conversion/review requirement.
  Search/filter exposed the external complete-recording options.
- Dev 390 (Sanskrit / Latin caption) decoded with face and both hands visible.
  Native playback, seeking and close/source release worked. Observed source:
  3840 × 2160, about 10.18 seconds, 305 decoded frames near completion. These
  are observations for this file, separate from the card's general spec.
- Mobile sentence browser and queue were inspected at narrow widths. DOM
  content/scroll widths matched (375 px and 307 px in the checks), with no
  horizontal overflow. Aarav's face/hands were visible during Help inspection.
  Temporary browser viewport overrides were reset afterward.

Screenshots: `screenshots/library-ux-20261018/select-all-desktop.png`,
`complete-source-recording.png`, `sentences-mobile.png`,
`select-all-mobile.png`, `inspection-mobile-playback.png`.

The last frontend refinements add source-video cleanup on queue invalidation,
pause/buffering feedback and a 44 px return button. Static/focused checks and a
final browser cleanup/console check follow the full suite; the expensive full
rig suite was not rerun solely for those UI refinements.

Final polish verification: the static check passed again and **11 focused
tests passed**, 0 failed (`library-usability-post-polish-tests-20261018.log`).
In the final browser build, Watch assigned only the pinned source URL; typing
How are u? removed the video source, hid the player and preserved whole-sentence
mode. Submitting resolved to the existing wellbeing proposal with no isolated
word queue. No new console warnings/errors were captured after the final reload.

## Review work and concrete limitations

The machine-readable human-review list is
`COMPLETE_EXPRESSION_REVIEW_WORKLIST_20261018.json`; its 44 entries are all
pending. For each, a fluent ASL signer must check caption/sense, context,
handshape, palm orientation, signing location, movement/contact, coordination
and nonmanual grammar. A future conversion additionally needs a valid rig and
finger/face reconstruction with source-to-target comparison. Record actual
reviewer identity, evidence and decision before changing existing approvals.

**There are still no complete Aarav sentence animations.** CLERC point
coordinates cannot be loaded as the existing skeletal motion format. Video
preview does not solve retargeting or establish translation accuracy. There is
no validated fingerspelling or new camera recognition class in this pass.

Only one of the eight external recordings has been visually played; seven have
not. Full-source video hashes, all-browser/codec playback, live microphone or
camera hardware and real signer comprehension were not evaluated in this pass.
Network/codec errors have an explanatory retry path; that does not guarantee
availability of the external host. These source videos are large (the inspected
file is 59,631,981 bytes, about 57 MiB), so their button shows file size and
downloads do not begin on page load. No new performance benchmark is claimed.

## Run and short demonstration

Use Node.js 22.13+; dependencies are already present in this workspace. For a
fresh install run `npm install`, then `node server.mjs` (or double-click
`start-studio.cmd`). Open http://127.0.0.1:3000/. No paid service or API key.

1. Motion library → **Inspect this motion** on Help. Aarav starts; pause or stop.
2. **← Motion library** → select cards or **Select all shown** → **Play queue**.
3. Studio → **How are you?**. Show its honest pending full-expression status.
4. **Browse 44 sentence options** → **Source videos available** → search Sanskrit
   → select the caption → **Watch complete source recording**. Inspect a frame,
   then **Close recording**. This is the original signer, separate from Aarav.

Pre-edit UI/code copies are in `test-output/before-library-ux-20261018/`.
The earlier complete recoverable project checkpoint remains in
`../.checkpoints/before-expansion-20261018-547f79d0/`.
No deployment, purchase, contact, training or deletion of originals occurred.

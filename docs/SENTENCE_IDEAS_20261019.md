# Sentence ideas and larger Aarav — 19 October 2026

The Studio now offers 520 checked English sentence/paragraph ideas, up from four: **516 additional plans** using the existing motion library. These are approximate source-order lexical sequences, not 520 recorded utterances or approved ASL sentences. No new motion data, aliases, asset licences or linguistic approvals were added. Custom English input remains available; a finite example list cannot enumerate every possible sentence.

## Coverage and filtering

| Measure | Before | After |
|---|---:|---:|
| Checked example plans | 4 | 520 |
| Existing motion captures | 729 | 729 |
| Candidate concepts with motion | 728 | 728 |
| Linguistically approved signs | 0 | 0 |
| Approved complete ASL sentences | 0 | 0 |

1,077 English candidates were tested through the existing whole-message planner: 520 distinct plans published, 556 held for missing/uncertain meaning, one equivalent plan merged as alternative wording. Ordered motion IDs, clause boundaries and question intent prevent article/spelling variants inflating the count. Stable plan IDs make rebuilding repeatable. See [exact inventory and code hashes](SENTENCE_IDEAS_20261019.json).

Four quick examples remain visible. **Browse 516 more sentence ideas** opens searchable, category-filtered results, initially 12; Show more adds 12 at a time. Categories cover Requests, Food & drink, Feelings, People, Actions, Daily life, Questions, Descriptions and Paragraphs. Selecting an idea closes the browser and loads its original text. It never enables research consent or starts playback. With explicit research consent, it prepares the reviewable plan. Enter in the idea search does not submit the main message form.

Examples: **Your mother is happy.**, **Where is the hospital?**, **You are thirsty. Please drink water.**, **Your teacher works today. You want water. Please drink water.** Load, review and explicitly Play. Question previews disclose missing validated facial/body grammar. Essential unsupported meanings still hold the entire queue; negation, names, numbers and unreviewed synonyms never silently disappear. “How are you?” and “What is your name?” remain unavailable as complete supported phrases.

## Larger avatar

The desktop signing stage grows from a maximum 430 px to 520 px with a slightly wider desktop column; mobile stage height grows from 340 px to 400 px and narrower side margins. Existing camera bounds, signed motion tracks, appearance and rig are unchanged. Queue-specific signing-space fitting still protects the hands rather than applying a cropping zoom. Browser observations: desktop stage approximately 677 × 520 CSS px at a 1,393 × 918 CSS viewport, mobile approximately 342 × 400 at 398 × 861. Requested viewport overrides were 1,365 × 900 and 390 × 844; the app/browser scaling produced the reported observed sizes.

## Verification

- 37 affected backend/API/planner tests passed, zero failed. All 520 published plans were checked against registered real motion paths, permissions and exact ordered IDs; equivalent plans and stable IDs checked. Existing missing-meaning, negation, name, ambiguity, 500-word, consent and input-mode checks passed.
- Static JavaScript/HTML checks: 71 JS files, 236 unique UI IDs and all 729 registered immutable motion files passed, including hash, format and licence checks.
- Browser: desktop and mobile representative playback; new People, Paragraphs and Questions examples; opt-in remains explicit; no autoplay; pause/resume/replay/seek; search/category and 12→24 progressive rows; empty search result; search Enter does not submit; visible keyboard focus; no horizontal overflow or captured console errors. Face and both hands visible in the inspected desktop YOUR and mobile THIRSTY frames. These observations are not exhaustive visual inspection of every frame in all 520 plans.
- The previous 107-test full functional regression and 729-motion renderer evidence remain dated evidence; they were not rerun in full for this example/CSS-only change. No avatar rendering code or motion assets changed. Physical microphone/camera, different-device FPS and fluent-signer approval were not tested in this pass.

The catalogue builds/caches its idea list once per server process; one local Node build observation was approximately 2.0 seconds. This adds metadata generation work; no rendering/FPS speed improvement is claimed. Only 12 browse buttons are initially rendered. Full motion files remain lazy-loaded through the existing bounded cache.

## Run and demo

Double-click `start-studio.cmd`, or run `node server.mjs` in the project (Node 22.13+; `npm install` for a fresh checkout), then open http://127.0.0.1:3000/.

1. Studio → explicitly enable **Use unreviewed research recordings**.
2. Open **Browse 516 more sentence ideas** → People → search `mother`.
3. Load **Your mother is happy.**, review its three unreviewed clips, then Play.
4. Try Paragraphs → **You are thirsty. Please drink water.** (five clips), pause/resume/replay.
5. Enter **I don't need help.** to demonstrate the missing-essential-meaning safeguard.

Human review must assess meaning/context, handshape, orientation, movement, contact, participants, transitions and missing nonmanual grammar for every source/retargeted sign and sentence plan. Successful planning or animation playback does not establish ASL correctness. The default approved vocabulary remains empty.

## Sentence slider follow-up

Added a native range slider spanning all 516 additional ideas (four quick examples remain separate). Its selected card shows the sentence, category, clip count and review status; Previous/Next and Home/End/arrow keys work. Search/category filters reset the slider to the first matching result and adjust its range. Zero matches hide it. **Load this sentence** uses the existing explicit-consent, no-autoplay review flow. Navigating the slider downloads no animations and never changes the message or active queue.

Follow-up verification: static checks passed (71 JS files, 245 unique UI IDs, 729 immutable motions). Browser checks covered positions 1/516 and 516/516, boundaries, Previous, keyboard arrows/Home/End, category range 1–10, no results, explicit loading without consent, visible focus, mobile no-overflow and readable button contrast. No captured console errors. Fixed a white-on-white Load button found during visual review. No backend/asset behavior changed; the previous 37 backend tests were not rerun for this HTML/CSS/UI-only follow-up.

## Right-side vertical scrolling (current)

At the user's request, replaced the horizontal sentence slider/card with a bounded sentence list and visible native scrollbar on its right. Scroll with mouse wheel, drag, touch or keyboard. Rows append in batches of 12 near the bottom; Show more remains a keyboard fallback. Search/category reset the list. No animation loads or plays merely from scrolling. Browser checks verified automatic 12→24 row loading on End, all 516 accessible through progressive loading, last paragraph, filter reset, mobile no-overflow and no console errors. Static checks passed after the change. Earlier slider-specific instructions/screenshots above are historical.

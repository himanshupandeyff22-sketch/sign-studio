# Bounded vocabulary batch — 19 October 2026

READY for a local, explicitly labelled research-motion demonstration. BLOCKED for linguistically approved ASL translation: no fluent signer has approved the source/target captures or their English mappings. This batch stops at 30 actual motion imports; it does not enable new automatic text translations or complete sentences.

## Coverage measured from actual files and canonical records

| Unit | Before | After |
| --- | ---: | ---: |
| Unique canonical candidate concepts | 268 | 297 |
| Concepts with an imported motion | 206 | 236 |
| Imported, distinct motion files | 207 | 237 |
| Format/hash checks passed | 207 | 237 |
| Numeric retarget checks on Aarav passed | 207 | 237 |
| Concepts available from text with explicit Research opt-in | 4 | 4 |
| Concepts available from default approved text mode | 0 | 0 |
| Inspection-only motion assets | 203 | 233 |
| Linguistically approved signs | 0 | 0 |
| Approved complete Aarav sentences | 0 | 0 |
| Source catalogue entries | 938 | 938 |
| Catalogue entries without imported motions | 731 | 701 |

Two distinct source captures, BATHROOM and TOILET, share the existing restroom concept; they remain separately identified, unapproved capture candidates. Hence motion counts exceed motion-bearing concept counts by one. Registered concepts also include meanings with no playable motion. The 938 source filenames are discovery metadata, not 938 words available to Aarav.

Four older unverified text-linked previews (HELP, YES, NO as a negative answer, LOVE as affection) retain explicit Research opt-in. They are not approved translations. New imports are inspection-only: successful parsing, motion and rig compatibility cannot establish meaning, regional variant, contact, nonmanual grammar or safe English aliases. Alias search is discovery, not a new text mapping. No restrictions or review records were loosened.

## Actual imports, source and permission

30 motions added; 29 new canonical concepts. NOW fills the existing `asl.time.now` gap and preserves its aliases/sense. No synonyms were merged without review.

- Introductions/communication: INTRODUCE, MY, YOUR, MEET, CAN, ENOUGH.
- People: AGE, BOSS, COUNSELOR.
- Food: CHOCOLATE, PEPPER (seasoning), TOAST (bread).
- Time/order: NOW, FIRST, NEXT, FUTURE, START.
- Places/directions: HERE, OFFICE, ROOM, INSIDE, NEAR, FAR, DOWN.
- Actions: OPEN, GIVE, TAKE, USE, ENTER, LEAVE.

All 30 come from the ASL **3D-LEX v1.0 Animation Data** component, [OSF mqzyk](https://osf.io/mqzyk/), public [tcnhs archive](https://osf.io/download/tcnhs/), version 1 dated 5 June 2024. Official [SAPA repository](https://github.com/OlineRanum/SAPA) README pinned at `0f636e119bccde2c035422f50820e3f8b94a5fb8` explicitly licenses the dataset **CC BY 4.0**, separately from MIT code. The ASL component's own OSF licence relationship and licence record were fetched and retained. Authors: Oline Ranum, Gomèr Otterspeer, Jari I. Andersen, Robert G. Belleman, Floris Roelofsen. [Primary publication](https://aclanthology.org/2024.signlang-1.33/).

Bounded ZIP range requests obtained only the 30 selected GLBs, with ZIP entry size/CRC and SHA256 evidence in the private acquisition cache. No full speculative archive was downloaded. Runtime assets contain skeletal animation JSON, with source meshes/materials/images removed, retargeted to the retained separately licensed Aarav. No additional avatar/mesh permission is inferred from the data licence. Attribution, source hashes, original track data and modifications remain recorded. The public fetch initially failed under restricted network access; the authorized public-network retry succeeded. No authentication was bypassed.

Same-language ASLU/Lifeprint reference pages were accessed for all 30 candidate meanings; COUNSELOR uses the COUNSEL page's agent-marker discussion. Only reference links and our own sense descriptions are stored; no reference video, image, course or dictionary content was imported. A source label and reference access do not prove capture equivalence. Each exact sense, reference, source/runtime/content hash, finger measurements and pending decision is in `EVERYDAY_BATCH_EVIDENCE_20261019.json`.

## Import reconciliation and repeatability

| Outcome | Count | Evidence |
| --- | ---: | --- |
| Added motion assets | 30 | `everyday-20261019-commit.json` |
| New canonical concepts | 29 | Same report; NOW reused |
| Merged aliases/provenance | 0 | No verified equivalence newly asserted |
| Conflicting imports | 0 | Saved dry-run/commit plan |
| Rejected/failed selected imports | 0 | All selected GLBs animated and passed bounds |
| Newly pending linguistic review | 30 | Explicit flags, reviewer/date remain null |
| Skipped on repeat | 30 | Repeat dry-run AND repeat commit |
| Added/merged on repeat | 0 | Manifest hash unchanged |

Before acquisition, WALK and WAIT were skipped as existing canonical motions. ME, NEED, FRIEND, PERSON, INTERPRETER, BREAD, MILK, LEMON, LATER, READY and BUY were skipped using earlier no-animation inspections; they were not downloaded again or counted as playable additions. No new static-image, dictionary-link or classifier-only item counts toward the batch.

The existing pipeline checked canonical concept/sense/aliases, stable IDs, safe paths, source identity, source/runtime hashes and normalized animation content. Existing assets and all existing concepts except the explicit NOW asset/provenance/status link are byte/record-preserved in regression checks. Different senses and capture candidates remain separate. No original was overwritten.

## Technical and linguistic evidence

All 30 have one source animation, 55–125 source tracks, positive duration (2.125–5.333 seconds), 30 articulated finger rotation tracks and measurable finger change. Numeric checks sample 30 Hz on Aarav, including wrist location, palm angle, finger axes, body orientation and near-contact landmark constraints. The full actual-rig player suite checks all 237 motions, face/hand skin and fingertips at desktop/mobile/narrow stages, seeking, ordering, repeated playback, cancellation, context recovery and cleanup.

All 30 previews were individually started through Explore ASL, paused and sought to their midpoint in the browser. The inspected frames show face and both hands with no gross rig collapse; screenshots and the observation method are recorded. This is not exhaustive per-frame mesh collision inspection, source/target language equivalence, human comprehension testing or interpreter approval. Near-contact captures (NEAR, INSIDE, USE, START, COUNSELOR, CHOCOLATE, etc.) still need surface-contact/occlusion inspection against the source. Do not repair their meaning by inventing poses.

Priority human checks: COUNSELOR must include the person/agent construction; AGE must match the ordinary age variant; FIRST needs variant/scope identification; OPEN requires object-specific interpretation; MEET differs from MEETING; MY differs from I/MINE; YOUR is possessive and directional. PEPPER and TOAST have restricted food senses. GIVE/TAKE/ENTER/LEAVE do not cover all English idioms. The source recordings contain no facial capture. See `ASL_REVIEW_WORKLIST_20261019.md` and the per-asset evidence JSON; no reviewer is named or implied.

## Interface and framing

Explore ASL now groups captures by canonical concept, searches concept labels/senses/definitions/aliases/inflections, and combines category, output and review filters. Available avatar previews, unavailable concepts, original signer videos and unimported catalogue entries have distinct statuses. Catalogue-only records are excluded from the default concept collection and have no fake preview control. Grid/list layout, 40-entry progressive rendering, clear filters, helpful empty states and expandable meaning/source/licence details are keyboard accessible. Multiple capture buttons are labelled individually. One-click preview preserves the existing loading, cancellation and Retry UI.

The compact banner, two-column desktop studio, existing colours, Aarav appearance and footer developer credits remain. The duplicated About team section was removed. The ordinary desktop stage increased from 330 to 360 CSS pixels; the neutral camera envelope and margin were tightened with all-motion framing tests passing. Whole-recording hand movement still takes priority over a rigid head-to-waist crop: the camera widens when hands drop below the waist or extend sideways. Fullscreen and Reset Camera were exercised on desktop and mobile. Mobile 390 × 844 and desktop 1365 × 768 showed no horizontal overflow. Focus remains visible; existing reduced-motion behaviour is retained.

Animation downloads remain on demand with the existing bounded prepared-motion cache; browsing metadata does not prepare the whole library. No quantified FPS or startup-speed improvement is claimed. No new camera recognition class, microphone service, paid API or public deployment was introduced.

## Verification

- Static check passed: 64 JavaScript files, 216 unique UI IDs, model/runtime dependencies, all 237 immutable motion files and required notices.
- 93 non-avatar tests passed, 0 failed (`test-output/everyday-suite-20261019-final.log`). Four actual-rig/avatar tests passed, 0 failed (`test-output/avatar-everyday-20261019.log`), for **97 tests** across the two runs. Two historical tests were updated to use the frozen pre-batch snapshot for their earlier milestone, while the new test asserts exact current preservation and the permitted NOW link.
- Runtime audit: 237 distinct file/content registrations, current hashes/structure and retarget checks passed. Repeat import added nothing and left the manifest hash unchanged.
- Browser: all 30 new previews, an existing LOVE preview, aliases, composed filters, approved-empty state, imported entries excluded from catalogue-only results, list/grid, 40→80 rendering, source links, new words blocked in default text input, visible keyboard playback, pause/resume/replay/stop/speed, mobile framing, fullscreen and Reset Camera inspected. Main-page console showed no errors/warnings during these checks.
- Controlled isolated fixture: one model request and one existing LOVE motion request deliberately returned HTTP 503; Reconnect and Retry restored the original asset and playback. No production file was removed. These are simulated network failures, not live service reliability results.
- Existing automated tests cover 500-word text, typos, meanings, aliases, names/numbers/negation, interruption and camera/microphone lifecycle. Live microphone/camera capture, permission prompts, multiple physical devices, other browsers, human ASL correctness and full source/target skin-contact review were **not run** in this batch.
- Windows launcher tested against the running server and exited through its already-running path successfully. Direct Node startup also succeeded. No build/bundler step exists; the app serves ES modules directly.

Screenshots: `docs/screenshots/everyday-20261019/`. The previous checkpoint and this batch's pre-change checkpoint remain recoverable. The tested-build marker identifies the final saved snapshot.

## Run and demonstrate

From this project folder use `node server.mjs` (Node 22.13+) or double-click `start-studio.cmd`; open [the local studio](http://127.0.0.1:3000/). Dependencies are installed here; a fresh checkout needs `npm install` first.

1. Explore ASL → search **chocolate** → Preview animation. It starts immediately and is labelled inspection-only.
2. Pause, seek, Replay, Stop, change speed, Fullscreen and Reset Camera.
3. Search **my**, **now**, **office** or **start** for other new previews. Search **assistance** to find the existing HELP concept.
4. Try **Now introduce my boss.** in default text mode: all missing/unapproved terms remain explicit, with no invented translation.
5. For a text-triggered local demonstration, choose **Help** through the labelled research example, opt into Research preview and explicitly play. YES, NO (negative answer) and LOVE (affection) retain their previous restrictions.

Use `node scripts/check.mjs` and `node --test web/phrases.test.mjs backend/*.test.mjs` for checks. Re-run `node scripts/audit-studio-readiness.mjs` if registered asset bytes change, then restart the server. This writes `docs/STUDIO_ASSET_AUDIT.json`; the dated 18 October evidence remains historical.

# Everyday library and review tools — 12 October 2026

This expansion adds 50 unique licensed motion candidates and 74 candidate
concept/sense records. The current library has **122 concepts, 141 English
aliases, 122 inflections and 78 motion files**. There are **74 new inspection-only
motions**, four retained unverified Research previews, six procedural demos and
**zero approved translation signs**. The 938-file catalog remains discovery
metadata; it does not represent 938 downloaded or validated signs.

## What was obtained

64 samples were fetched from the author-published 3D-LEX ASL archive. ZIP CRC,
size, GLB integrity and full file hashes were checked. Dataset motion is CC BY
4.0; source meshes/materials/textures are not served or redistributed. See
THIRD_PARTY_NOTICES.md and embedded source notices in every runtime motion.

The first network attempt ended in a connection reset after two samples. The
archive helper now reuses checksum-verified cache files, uses bounded transient
retries and at most two parallel samples, and preserves conflicting cached
files. The resumed batch obtained all 64 samples with no final missing files.
No authentication or access restriction was bypassed.

| Import outcome | Count | Meaning |
| --- | ---: | --- |
| Added | 50 | Unique, permitted motion-only files passed technical preflight; inspection only |
| Merged | 0 | No synonym approval or source approval was invented |
| Skipped on first run | 0 | Selected samples excluded existing installed glosses |
| Conflicting | 9 | Distinct labels reused static placeholder payloads; none replaced existing data |
| Rejected | 5 | No animation tracks |
| Pending ASL review | All 50 additions | Technical load/retarget success does not prove the sign meaning |

Static: HOT, MILK, BREAD, HEARING, YEAR. Conflicting placeholders: VEGETABLE,
BUY, LANGUAGE, ENGLISH, WEEK, BIG, SMALL, IMPORTANT, THINK. These concepts have
no usable imported motion from this batch. Each row's hash/reason is preserved
in `docs/import-reports/asl-everyday-20261012-dry-run.json` and its commit report.
The repeat commit added **zero files, zero concepts and zero aliases**; it
skipped the 50 existing recordings. All 28 prior motion bytes, source hashes,
senses, variants and review flags were preserved.

The source set includes bathroom/toilet, sleep/tired, doctor/hospital/hurt,
coffee/tea/apple/fish, teacher/student/read/write/book, time words,
money/pay, people, transport, asking/telling, waiting and hunger/thirst.
Topics are interface grouping only, not linguistic approval. Forty-eight older
concepts received additive topic metadata via a separate dry-run/commit; a
second metadata commit added nothing. Missing meanings are not guessed from
the topic.

BATHROOM and TOILET-labelled captures are named source variants linked to the
same room/use-restroom concept. A separate fixture concept has no assigned
motion. Other common alternate meanings are kept separate: medical/academic
DOCTOR, temperature/illness COLD, temperature/spicy HOT, book/reserve BOOK,
vehicle/training TRAIN, hearing status/auditory perception/legal HEARING,
signed-language/notice/signature SIGN, speed/food-abstinence FAST. Candidate
aliases and variant mappings remain pending.

## New working controls

- **Topic** filters candidate concepts and imported motions. Text search also
  finds source filenames. The source discovery index is intentionally not
  classified by topic. **Clear filters** resets both controls.
- **Manual motion inspection queue** selects recordings in click order across
  topic/search changes. Remove individual selections, clear all, inspect one,
  or inspect the ordered queue. Up to 100 registered IDs are accepted; invalid
  IDs reject the entire request. Client paths/review flags cannot alter it.
- Play, pause, resume, replay, stop and speed work for inspection queues. History
  replay resolves every recorded ID through the current registry, rather than
  trusting cached paths or review flags.
- **Playback position** supports timeline scrubbing and keyboard seeking.
  Inspect paused source frames or jump across queue items/idle lead-ins without
  trimming any source data. A drag pauses temporarily and resumes only when
  it began during playback; speech is stopped when seeking.

Manual selection does not translate typed sentences, infer ASL grammar or
approve a sign. Coverage for this mode describes selected recordings only.
Normal text/voice gates remain unchanged. A reviewed complete phrase plan and
appropriate motions/nonmanuals are still required for phrase translation.

## Phrase and linguistic research

64 ASLU reference pages were retrieved as primary comparison references. No
reference media was copied. See `docs/research/everyday-reference-audit-20261012.md`
for 32 detailed audits; the additional 32 verified reference URLs are attached
to the corresponding canonical records. Exact source/target variants remain
unverified. Motion fingerprints do not establish semantic equivalence.

Four new pending proposals cover asking a name, self-introduction, requesting
water and expressing thanks. Existing request-help was reused for review
planning rather than duplicated. Together with the prior greeting proposal,
there are five review-proposal files and one pending runtime template, with no
enabled sentence mapping. Sources and missing motion/fingerspelling/nonmanual
requirements are in `docs/research/phrase-reference-audit-20261012.md`.

## Import and evidence safeguards

The importer compares primary and additional provenance hashes, normalized
animation content, language, canonical concept/sense, stable IDs and explicit
variants. A metadata-only re-encoded duplicate merges provenance once and skips
on its second run; changing that same source payload becomes a conflict. Source
filename and gloss must agree. Project check recomputes both runtime byte hashes
and motion-content hashes, and validates all provenance identities.

New dry-runs carry an import-plan fingerprint, so changed source data or outcomes
require a fresh dry-run before commit. This guard was added after the initial
everyday import. Historical reports are preserved and are not retroactively
claimed to contain it; the topic reports do. New imports must use a fresh report.

`docs/vocabulary-baseline-before-everyday-20261012.json` preserves the previous
48/28 library. Review snapshots, source/runtime/code hashes and pending human
worklists are generated separately, without changing runtime approval. None
provides expert linguistic approval. Current final checks/visual evidence are
recorded below after completion.

## Final verification

Project check passed: 35 JavaScript files, 133 unique UI IDs, all 78 runtime
byte/content hashes, canonical concepts/variants and every source-provenance
identity. The final full test suite passed **61 tests, zero failures/skips**.
It covered all 78 real skinned motions at desktop/mobile sizes, plus seeking,
pause/resume/replay/stop, exact boundaries/end/backwards seeking, context loss,
hidden/zero-size stages, cleanup, 500-word input, API/storage/voice regressions,
new queues, import fingerprinting and secondary-source deduplication.

The browser showed 122/141/122/78/0 counts. Food and Health topic filtering,
text search, ordered selection across filters, clear/remove states, a four-item
inspection queue and history replay worked. Selecting COFFEE → TEA → APPLE →
DOCTOR replayed all registered IDs. Keyboard timeline Home/End/PageUp/PageDown
and backward seeking updated motion/time/progress immediately while paused.
Coffee's two-hand active pose and Doctor's wrist-area pose were inspected;
face/hands stayed visible. These observations do not validate their ASL meaning.
Mobile was measured at **360×800 CSS pixels** with no horizontal overflow.
Desktop was also measured at **1280×900 CSS pixels** with no horizontal overflow.
The reused user tab retained earlier MediaPipe camera diagnostics (optional
feedback-tensor support warnings and an INFO CPU-delegate message captured on
the error channel). These were not new library/timeline failures. No new
application or asset-loading errors were observed during these checks; the
existing camera workflow was not treated as a validated ASL recognizer.
Source mesh proportions, fine handshape/contact, variants and nonmanuals still
require human review. No comprehensive visual/linguistic approval is claimed for
the remaining 50 assets merely because automated playback passed.

Current immutable review evidence:
`vocabulary-final-everyday-review-20261012.json` and
`ASL_FINAL_EVERYDAY_REVIEW_WORKLIST.md`. Earlier 4/28/78 snapshots remain history.
Proof: `screenshots/everyday-inspection-mobile.jpg` shows a paused registered
Doctor candidate and timeline with the explicit unverified/manual-inspection
labels. Real microphone/camera accuracy, physical voice quality and a physical
mobile device were not tested in this expansion. No fluent ASL reviewer has
approved a motion or complete phrase. No purchase, public deployment or external
contact was performed.

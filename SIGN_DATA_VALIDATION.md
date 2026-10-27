# ASL sign data and validation register

## Sentence idea expansion — 19 October 2026

**520 distinct checked lexical plans (516 additional), zero approved ASL
sentences.** All 1,077 candidate examples went through the existing permission,
meaning and whole-message planner: 556 held, one equivalent plan merged.
No new sign asset, approved alias, grammatical ASL template or reviewer was
introduced. English idea patterns are not ASL grammar rules. Source-order clips
remain unreviewed research previews requiring explicit opt-in. Missing essential
meaning and question/nonmanual limitations remain visible. Existing 729 motion
captures and all linguistic review restrictions are unchanged.

See [exact ideas, motion IDs, counts and generator hashes](docs/SENTENCE_IDEAS_20261019.json)
and [technical checks, representative browser evidence and human-review requirements](docs/SENTENCE_IDEAS_20261019.md).
A larger stage preserves existing signing-space bounds; successful loading does
not validate any sign or sequence. All 520 plans require contextual fluent ASL
review before being described as translations.

## Earlier sentence-planning behavior — 19 October 2026

No motion, concept, source or approval count changed: **729 distinct technically
playable captures / 728 candidate motion concepts / 0 linguistically approved**.
An additive English whole-message planner now holds all playback if an essential
meaning is missing. Enabled complete lexical plans remain explicitly
**approximate sign sequences in English source order**, not reviewed ASL sentences.
No ASL grammatical templates or fingerspelling were added or approved.

Phrase-first resolution, narrow English contraction/agreement normalization and
explicit grammar notes do not approve synonyms, new senses or sign morphology.
Unrepresented negative/polar-question/past/aspect/plural meanings are held. WH
question previews visibly disclose missing validated facial/body grammar. All
existing asset review gates and research consent remain; the legacy individual
preview path stays available. See the [current coverage audit](docs/SENTENCE_STUDIO_COVERAGE.json),
[sentence behavior report](docs/SENTENCE_STUDIO_20261019.md) and
[exact example asset review list](docs/SENTENCE_EXAMPLE_REVIEW.json).
Eleven example motions were technically inspected in the browser, not approved
by a fluent signer. Older sections below retain their dated historical context.

## Current evidence — 19 October 2026, continuous expansion

**789 canonical candidate records; 729 distinct technically checked motion files
covering 728 candidate concepts; zero linguistically approved signs and zero
approved complete Aarav sentences.** 492 new records are explicitly
`source-gloss-unverified`: publisher filenames do not establish expert-confirmed
distinct meanings, synonyms or variants. No approved mappings were manufactured.

All 701 formerly unimported source rows were processed: 492 imported, 203 static
files skipped, six technical failures quarantined. The 203 static files share
seven hashes; repeated labels are not extra vocabulary. Raw originals remain.
Current evidence: [per-asset results](docs/CONTINUOUS_EXPANSION_RESULTS.json),
[729-motion rig audit](docs/STUDIO_ASSET_AUDIT.json),
[pinned input audit](docs/EXPANDED_RESEARCH_TEXT_AUDIT.json),
[human review worklist](docs/ASL_REVIEW_WORKLIST_CONTINUOUS_20261019.md), and
[complete handoff](docs/CONTINUOUS_EXPANSION_20261019.md).

Default validated vocabulary remains empty. Four existing legacy research text
previews remain. A separate unchecked **Use unreviewed research recordings**
consent permits technically checked source-word previews: 725 candidate concepts,
726 captures with explicit meaning choices where necessary, 719 without such a
choice. This permission is not `translationEligible`, reviewer approval or a
claim of grammatical ASL. CANNOT/NEVER/NOT remain inspection-only to preserve
negation. All 729 motions need review of source and retargeted output by an
identified fluent signer or qualified interpreter, including handshape, palm
orientation, location, movement, contact, coordination and absent nonmanuals.

492 new meanings use only the verified publisher's gloss link, not an unvisited
dictionary page. The guarded importer corrected earlier proposed references to
that evidence. Full technical diagnostics remain in local manifests/audits;
the public catalogue carries compact status and provenance to avoid repeating
frame-level data in six interface languages. Changing labels does not change ASL.

The following dated records and mode tables describe earlier snapshots unless
explicitly updated. Use the current section and pinned audits for present counts.

The canonical source is `web/vocabulary-manifest.json`; `web/sign-registry.mjs` derives the runtime registry. The backend enforces review status; incoming requests cannot approve assets or supply a replacement registry. Default vocabulary mode is **validated**. At present it contains **zero approved signs**. Full grammatical translation and validated fingerspelling are unavailable.

As of **16 October 2026**, there are **214 candidate concepts and 153 recorded
motions**: 149 manual-inspection candidates and four retained explicit unverified
Research previews. All remain pending linguistic review. The latest batch's
source/runtime/content hashes, formats, meanings, licenses and automated
diagnostics are in [the current evidence](docs/presentation-import-evidence-20261016.json),
with a [75-asset human-review worklist](docs/ASL_PRESENTATION_REVIEW_WORKLIST_20261016.md).
[docs/sign-asset-manifest.json](docs/sign-asset-manifest.json) is the historical
four-clip snapshot, not the complete current library. No identified fluent
signer or qualified interpreter has approved the source-to-Aarav output.

## Playback modes

| Mode | Eligible assets | Meaning and accuracy |
| --- | --- | --- |
| `validated` — default | Only entries with `validated: true`, a passed technical review, and an identified/date-stamped human ASL approval | All current assets are excluded; input and missing coverage remain visible |
| `research` — explicit opt-in | Four sourced, unreviewed 3D-LEX motion previews | Exact English source glosses only; conditional meaning choices; neither source nor retargeting is claimed accurate |
| `demo` — explicit opt-in | Six retained procedural demonstrations | Existing multilingual display/input examples for testing controls; not ASL translation or an approved sign vocabulary |

Camera pose demonstrations obey the same gate and require explicit Demo mode. Camera confidence measures pose detection, not ASL correctness. Unsupported terms never trigger a generic talk animation or invented fingerspelling.

## Recorded research entries

These are candidate lexical meanings, informed by the primary reference pages below. Reading a reference is not approval of the motion. All four entries have `validated: false`, `humanReview: null`, and `technicalReview.status: "pending"`. Their motion-only runtime paths must be checked after extraction and retargeting; a path in the registry alone is not a file-load success.

| ID / source filename | English mapping | Meaning boundary | Primary meaning reference | Runtime motion path | Review |
| --- | --- | --- | --- | --- | --- |
| `3dlex-help` / `help.glb` | `help` | Assistance/help as a lexical item. Do not infer who helps whom, directional agreement, tense, or a question | [ASLU HELP](https://www.lifeprint.com/asl101/pages-signs/h/help.htm) | `/web/assets/asl/help.motion.json` | Technical pending; human approval absent |
| `3dlex-yes` / `yes.glb` | `yes` | Lexical affirmative answer. Contextual emphasis and nonmanual realization remain unreviewed | [ASLU YES](https://www.lifeprint.com/asl101/pages-signs/y/yes.htm) | `/web/assets/asl/yes.motion.json` | Technical pending; human approval absent |
| `3dlex-no` / `no.glb` | `no`, only after `senses.no: "negative-answer"` | Negative answer/refusal. Do not automatically substitute for NONE, NOTHING, NOT, or directional reported refusal | [ASLU NO](https://www.lifeprint.com/asl101/pages-signs/n/no.htm) | `/web/assets/asl/no.motion.json` | Technical pending; human approval absent |
| `3dlex-love` / `love.glb` | `love`, only after `senses.love: "affection"` | Affection/love as one lexical concept. This is not the complete phrase “I love you,” the ILY acronym handshape, LOVE-IT, or HUG | [ASLU LOVE](https://www.lifeprint.com/asl101/pages-signs/l/love.htm) | `/web/assets/asl/love.motion.json` | Technical pending; human approval absent |

The YES reference describes a fist/wrist movement. NO includes motion, direction, and nonmanual variations. HELP is directional and has handshape variants. LOVE and ILY are distinguished by the reference. These distinctions define what must be reviewed; they were not used to invent replacement animation tracks. Lifeprint media is not copied into the app and does not license the 3D-LEX motion data.

Research mode reports unselected or unknown `no`/`love` senses through `ambiguousTerms`; it does not animate them automatically. A meaning selection is a user choice, not expert approval, and does not enable an asset in validated mode. The complete expression `I love you` has a distinct concept and cannot fall back to the lexical LOVE recording. The existing complete-phrase illustration stays isolated in Demo mode.

## Source provenance and license

3D-LEX v1.0: Oline Ranum, Gomèr Otterspeer, Jari I. Andersen, Robert G. Belleman, and Floris Roelofsen (2024). [Paper and citation](https://aclanthology.org/2024.signlang-1.33/). Dataset: [ASL Animation Data](https://osf.io/mqzyk/); [GLB archive](https://osf.io/download/tcnhs/). The source [OSF license record](https://api.osf.io/v2/licenses/563c1cf88c5e4a3877f9e96a/) and [author repository](https://github.com/OlineRanum/SAPA) identify **CC BY 4.0**. Preserve authors, source and [license](https://creativecommons.org/licenses/by/4.0/) attribution, and describe extraction/retargeting modifications with each installed motion.

The public archive exists; an earlier access-gap assumption was corrected. Its inspected directory contains 938 GLBs. The source [known-issues wiki](https://api.osf.io/v2/wikis/fq59z/content/) reports 62 missing GLB animations. Private sample inspection found no animation in `hello.glb`, and `thank_you.glb` was absent. No recorded greetings or thanks are fabricated to fill those gaps. Source meshes are kept private because their separate redistribution rights were not established; Aarav's existing MIT-licensed Rocketbox model remains the runtime avatar.

Archive filenames are the available gloss labels, not independently reviewed English sense mappings. The paper records source capture review but also discusses handshape and orientation artifacts and limitations in facial/nonmanual assessment. Neither that paper nor a successful technical file parse approves the retargeted Aarav animation.

## Required review before default eligibility

For each exact installed asset, record:

1. Original filename, source archive, source gloss/meaning, license, attribution, and a content hash.
2. Target rig and all transformations: coordinates, bind pose, bone mapping, timing, trimming, interpolation, and finger/palm calibration.
3. Technical checks for loading, finite/unit rotation data, handshape, wrist orientation, elbow/shoulder deformation, contact, signing location, face visibility, transitions, and desktop/mobile framing throughout the clip.
4. Human ASL review of the rendered target animation, its intended sense and mapping, movement/orientation/location, regional variation, and required facial/nonmanual features. Identify the reviewer, date, exact reviewed asset, findings, and approval decision.
5. A separate sentence/grammar plan before presenting concatenated lexical clips as full ASL translation. Fingerspelling requires its own reviewed alphabet and transition assets.

Set `validated: true` only after the exact target asset and mapping pass the relevant technical and human checks. Reference pages, source filenames, user meaning selections, pose-recognizer confidence, and generated motion are insufficient substitutes for that review.

## Technical results and visual inspection — 12 October 2026

Four motion-only JSON files were actually extracted and installed. No source
mesh, texture, material, image, or source GLB is served by the website. Their
original tracks and original GLB hashes remain in the assets.

Initial browser inspection caught a whole-body tilt in YES that finite-transform
tests missed. Source static node axes differ from the first animated pose, and
the exports contain abrupt terminal actor-axis resets. Calibration now uses the
actual first animated anatomical pose. Playback holds the last usable pose
instead of sampling those defective terminal frames; original raw keys remain
available for inspection. Mid-clip resets, invalid frames, missing finger tracks,
or excessive distortion fail preparation rather than receive a demo substitute.

| Motion | Last usable source time | Maximum target body tilt | Maximum wrist-goal difference | Current review |
| --- | --- | --- | --- | --- |
| HELP | 3.208333 s | 4.35° | 3.96 cm | Automated checks pass; visual contact/meaning and human review pending |
| YES | 3.000000 s | 3.46° | 3.36 cm | Automated checks pass; wrist motion/handshape/nonmanual review pending |
| NO | 5.291667 s | 4.46° | 4.72 cm | Automated checks pass; exact sense/variant and nonmanual review pending |
| LOVE | 8.458333 s | 5.12° | 4.57 cm | Automated checks pass; chest location/handshape and human review pending |

These measurements describe this retargeter, not sign accuracy. Source and
target finger-segment directions and palm frames remain within 0.000002 radians
under anatomical calibration in the sampled tests. Near-contact wrist IK
preserves a selected source landmark-pair vector: HELP's closest pair remains
2.413 cm apart; NO's remains 4.881 cm apart. This is a skeletal proxy, not a
skin-contact guarantee; other near-contact landmarks can differ. LOVE's closest
mean wrist-to-Spine2 proxy differs by about 3.10 cm. Target hand size, torso
proportions, fine handshape, orientation, contact, and signing location still
require review.

The browser was inspected during paused/playback frames for all four recordings
at a measured 360 CSS-pixel mobile width. YES remained upright with a raised
fist, HELP showed both hands together, and LOVE showed crossed arms at the
chest. NO included a two-hand pose near the face during the inspected interval;
its exact source variant and negative-answer mapping need priority ASL review.
These descriptions are direct visual observations, not expert identification
or approval. No facial capture is supplied by these motion assets; neutral
blinking does not supply grammatical nonmanual features.

Automated avatar checks sample the real skinned face/hands throughout each
retargeted clip at desktop/mobile sizes, and test upright/frontal posture,
framing, transitions, repeated queues, pause/resume/stop, disposal, and missing
motion failures. Browser checks also cover a 500-word recorded queue, ambiguous
meaning choices, preserved punctuation/text, unsupported vocabulary, and legacy
history revalidation. See [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Human review worklist

Review the exact assets and renderer hashes in the manifest, comparing both
source motion and the rendered Aarav output with the same-language references.
For each candidate, record reviewer identity/qualification, date, regional
variant, intended sense, observed defects, and an approval or rejection:

- HELP: loose-thumb-A/S variation, palm support/contact, lift, signing location,
  and directional agreement; do not infer who helps whom from an isolated clip.
- YES: S hand, palm/wrist orientation and nodding movement, emphasis, and
  handshape capture artifacts.
- NO: verify the source gloss and exact negative-answer variant first; compare
  handshape, movement count, palm direction, location, two-hand involvement and
  required headshake. Do not equate it with NONE/NOTHING/NOT.
- LOVE: crossed-hand chest placement and handshape, affection sense versus ILY,
  HUG and LOVE-IT; it does not represent the complete sentence “I love you.”

Sentence grammar, semantic facial/body expressions, and reviewed fingerspelling
are separate missing capabilities. Passing the technical checks above does not
close any of these linguistic review items or enable the default vocabulary.

## Demo assets retained for control testing

`hello`, `thanks`, `yes`, `no`, `help`, and `love` are the prior procedural animations. They are retained to preserve existing control/playback testing, with unvalidated status displayed and explicit Demo opt-in required. Their old translated phrase labels do not establish ASL meanings. No procedural motion is promoted automatically when a similarly named recorded source appears.

## Expanded canonical library — 12 October 2026

**Historical state on 12 October:** 122 candidate concepts, 141 aliases, 122 inflections and
78 recordings after the additional everyday batch. All remain pending
linguistic review; 74 are inspection-only and four are retained explicit
unverified Research previews. Zero approved signs/templates are enabled.
The counts and 28-asset snapshot below describe the earlier expansion.
See [EVERYDAY_EXPANSION.md](docs/EVERYDAY_EXPANSION.md) for the new 50-asset
batch, source checks, sense distinctions, exclusions and review requirements.
That batch's renderer/source hashes and 30 Hz diagnostics are in
`docs/vocabulary-final-everyday-review-20261012.json`, with all 78 pending review
rows in `docs/ASL_FINAL_EVERYDAY_REVIEW_WORKLIST.md`. Manual queue selection and
timeline seeking do not change these review decisions or trim original tracks.

The earlier canonical snapshot in `web/vocabulary-manifest.json` contained 48 candidate
concepts, 66 aliases, 49 inflections, 28 recordings and zero approved signs.
The earlier four-clip results above remain historical evidence. Current
source/runtime/renderer hashes and 30 Hz retarget diagnostics for every clip
are recorded in [the expanded snapshot](docs/vocabulary-review-20261012.json).
[ASL_REVIEW_WORKLIST.md](docs/ASL_REVIEW_WORKLIST.md) lists each asset's
concept, sense, same-language reference and pending review. The source license
and ASL component were checked separately from any avatar license.

Both new batches were dry-run before commit, deduplicated by raw file hash,
source provenance, ASL/concept/sense, variant and normalized animation content,
then imported without replacing existing motion bytes. Repeat commits added
nothing. Static or conflicting labels stayed out. All 24 additions have
`inspectionOnly: true`, `translationEligible: false`, identified sources and
`linguisticReview.status: pending`. A manually selected `asset-review` request
can inspect a registered clip; no client path/approval or text match can enable
it. Default validated output stays empty. The four old explicit Research
previews are preserved under their existing unverified status.

Automated checks cover finite motion, three finger segments, rest/animated
axis calibration, palm/finger direction, reach/contact proxies, upright/frontal
posture, exact skinned face/hands and camera framing throughout all 28 clips
on desktop/mobile. These checks passed. They do not establish handshape
semantics, surface contact, regional variants or required nonmanuals. Facial
capture is absent from these assets. Published reference descriptions only
establish comparison criteria; no ASLU image/video was copied.

Direct browser observations of the first five additions: FAMILY's two hands
move in front of the torso; WATER raises the dominant hand near the face;
REMEMBER includes a long initial idle interval followed by two-hand contact;
PLEASE places one hand over the chest; YOU extends the dominant hand forward.
Face and both hands remain inside the mobile viewer in the inspected poses.
DRINK was additionally inspected on desktop with a curled hand near the face.
These are observations, not expert sign identification. Exact F/W/C handshape,
thumb/finger contact, mouth/forehead/chest placement and YOU direction require
human review. Browser sampling did not linguistically validate any of the 28.

Candidate meanings for bank (finance/river edge), light (illumination/weight),
right (direction/correctness), and like (enjoyment/resemblance) remain distinct.
English synonym candidates are not automatically approved ASL equivalences.
The pending request-help template has no approved full-sentence animation.
Negated clauses are held before lexical playback; a complete `I love you`
concept cannot become the affection clip. Tense, names, numbers and original
text remain visible. A semantic match or user clarification cannot approve
an animation, supply grammar or create fingerspelling.

The 938 source-discovery records have no canonical sense, playable path or
translation eligibility. They support locating future batches. Their filenames
and ZIP CRC/size do not replace SHA256, source evidence or review. All 938 files
were indexed, not downloaded/validated as 938 signs. For exclusions, counts,
licensing and actual reuse from both recognition repositories, see
[IMPORT_REPORT.md](docs/IMPORT_REPORT.md) and
[REPOSITORY_AUDIT.md](docs/REPOSITORY_AUDIT.md).

## Current expansion and renderer — 16 October 2026

The new batch added **75 unique recorded ASL candidates**: 78 → 153 recordings,
with 0 approved signs before and after. The dry-run excluded 13 conflicting
labelled payloads and four static assets. A real second import added zero files,
concepts, aliases or provenance; all previous 122 concepts, 78 registrations
and original runtime hashes remain unchanged. The new 92 concepts and 94
inflections are candidate metadata, not additional playable signs.

See [the expansion report](docs/PRESENTATION_EXPANSION_20261016.md),
[source/license audit](docs/research/presentation-source-audit-20261016.md),
and [current implementation verification](docs/PRESENTATION_READY_VERIFICATION_20261016.md).
Only licensed 3D-LEX skeletal motion derivatives were imported. Other languages,
recognition datasets, restricted corpora and unlicensed model resources were
not substituted into the ASL path.

The current renderer preserves the original Rocketbox GLB and raw motion bytes.
Hand skin is excluded from the runtime cloth tint using joint weights. Recorded
poses and registered durations do not receive artificial start/end fades,
lip-sync, random facial expression or idle blinking. Missing facial capture
therefore remains a linguistic limitation. Only detected terminal exporter
discontinuities are held out of sampling; continuous recordings such as TOMATO
retain their complete source duration. Technical checks distinguish those cases.

All 153 recordings are exercised through anatomical retargeting and actual
skinned desktop/mobile framing checks. Passing those checks establishes neither
skin contact nor expert ASL correctness. Review must inspect the exact current
renderer with the intended meaning, regional variant, handshape, orientation,
location, movement, two-hand coordination and nonmanual requirements before
enabling any default sign or complete phrase.

Explicit name spans also reach the final playback gate. A person declared as
“Help” or “Love” is not the similarly spelled assistance/affection concept,
even if an eligible unverified research clip exists or a client supplies a sense.
Names remain visible and unsupported without a separately reviewed name or
fingerspelling plan; subsequent ordinary words retain their normal review gates.
# First-visit research examples — 16 October 2026

The guided demo explicitly selects the existing Research preview mode and
loads one of four legacy recorded word examples: HELP, YES, NO (negative
answer/refusal), LOVE (affection). NO and LOVE retain explicit sense values;
the displayed example label identifies the chosen meaning. Each example must
resolve to its registered asset. The default validated vocabulary remains
unchanged and contains zero approved signs. These are isolated word previews,
not approved phrases, sentence templates, or a linguistic accuracy claim.
Loading an example prepares its recording and waits for an explicit Play.

No course data was imported from Start ASL, Alison or Udemy in this pass. See
[the reference/permissions audit](docs/research/learning-reference-audit-20261016.md).

# Five-expression review handoff — 16 October 2026

Three licensed CLERC Épée ASL phrase keypoint candidates were staged outside
runtime: Hello, Thank you and How are you?. They are linked to canonical
concepts/template proposals, not enabled as new playable signs. The current
loader cannot use their point-coordinate format. Technical array/hash checks
passed; motion retargeting, full nonmanual grammar and fluent-signer review
remain unresolved. The latter source contains repeated HOW/YOU segments that
need contextual review. Exact complete-phrase sources for I need help and
Please repeat were not found in this source; related expressions were not
silently substituted. Default approved vocabulary remains zero.

The second staging run added zero assets. No existing concept, recording,
alias, variant, review flag or manifest template was overwritten. Two pending
proposals were added only where no canonical template/proposal existed.
The developer review kit supplies source/annotation hashes, intended senses,
license and a human-review checklist, without adding a parallel translation
registry. See [the complete evidence and limitations](docs/FIVE_PHRASE_MILESTONE_20261016.md)
and `docs/epee-phrase-dry-run-20261016.json`.


# Expansion and camera audit — 18 October 2026

Current totals: **268 candidate concepts, 287 aliases, 216 inflections, 207
recorded motions**, of which 203 are inspection only. Four older unverified
Research word previews remain explicit opt-in; approved signs, approved complete
phrases and valid fingerspelling remain **zero**. Earlier dated counts above
are historical. All prior concepts, motions, aliases, variants and review flags
were preserved, verified by regression tests.

54 additions from the separately verified CC BY 4.0 ASL archive passed automated
structure, hashes, calibrated bone/finger orientation and landmark/framing
checks. Human technical inspection and linguistic review remain pending.
Passing numeric checks does not establish skin contact, correct sense, facial
grammar or translation quality. No new asset is translation eligible.
69 lexical comparison pages were retrieved through the public web tool;
direct scripted challenge responses are explicitly marked failures. The
KEYBOARD comparison resolved to KEY and was excluded. No comparison media was
copied. Exact source-to-reference equivalence was not established.

The preliminary dry-run reported 54 unique additions, 12 conflicting raw
payload labels and three rejected static files. Whole-batch inspection
confirmed all 15 held files were static, and kept them outside runtime. The
filtered dry-run/commit added 54 and changed no existing entries. Repeat dry
and commit added zero and skipped 54 identical registrations. Normalized motion
hashes are unique across all 207 registrations. No unverified synonyms merged.

The [new signer worklist](docs/ASL_EXPANSION_REVIEW_WORKLIST_20261018.md) and
JSON companion contain source URLs, exact language/concept/sense/variant,
license and hashes, bone/landmark diagnostics and a required human checklist.
Ten complete English expressions are queued as review requests in
`docs/ASL_SENTENCE_REVIEW_WORKLIST_20261018.json`, not runtime templates or
asserted ASL word order. Existing three CLERC phrase candidates stay quarantined;
point-coordinate conversion, nonmanuals and signer approval remain blockers.

The existing MediaPipe classifier has seven generic non-None poses plus None.
The app now observes two hands, rejects conflicting/cropped/uncertain poses,
requires score >=0.80 and a stable 750 ms hold, 450 ms neutral release and
1,800 ms repeat cooldown. Scores are not ASL accuracy. Five legacy mappings
remain illustrative; Closed_Fist and Pointing_Up are opt-in confirmed playback
controls, not new ASL words. A captured proposal never auto-submits or autoplays.
User correction retains the original detected pose in client-reported review
metadata; only confirmed illustration labels/scores reach local history.
Camera frames stay local, and Stop/visibility changes release tracks and model.

No new temporal ASL recognition model or multi-person held-out accuracy
evaluation was performed. See [the handoff and evaluation report](docs/EXPANSION_AND_CAMERA_20261018.md)
and [resource/license audit](docs/research/expansion-source-audit-20261018.md).

# Complete-expression source browser — 18 October 2026

The new source index exposes **44 distinct English-caption expression options**,
all labelled ASL: 36 CLERC Épée caption/keypoint references and eight
2M-Flores-ASL full-recording links. This is not an increase in approved signs,
rigged avatar motions or validated complete phrases. The respective totals stay
**0, 207 and 0**. All 44 entries have `translationEligible: false` and no human
review identity or approval. Their language, caption, stable ID, source, license,
format/availability and signer variants or recording provenance are retained.

Only metadata was newly indexed. How are you? already has a quarantined CLERC
point capture; What is your name? has an exact CLERC source-caption reference.
No point data was converted to Aarav. The repeated HOW/YOU sections in the
existing wellbeing capture still require contextual review. Names, negation and
caption punctuation are not discarded. Whole-expression mode queues no isolated
words when a reviewed complete animation is unavailable. A source video preview
is visibly separate from the articulated avatar.

Technical evidence: the dry run precedes the index commit. It added 44 metadata
entries, merged 0, skipped 0 and reported 0 conflicts; all 44 remain pending
review and runtime motion imports are 0. A second dry run and commit added 0,
skipped 44 and left the exact index hash unchanged. Reports are
`docs/sentence-index-{dry,commit,repeat-dry,repeat-commit}-20261018.json`.
No new aliases were merged into runtime concepts, and existing mappings,
recordings, sense distinctions and approvals were preserved. Content-level
motion equivalence was not evaluated for videos we did not acquire; their
metadata must not be promoted to motion imports on filename/caption matching.

The 2M-Flores source card, dev/devtest metadata, pinned public file tree and
bounded header/tail bytes were obtained for research. Full videos are streamed
only after an explicit user action. Dev record 390 (Sanskrit/Latin caption)
decoded in the in-app browser, with a visible signer, face and both hands. A
paused-frame inspection and cleanup were checked. The observed source was
3840 × 2160, about 10.18 seconds; this observation is distinct from the dataset
card's general recording specification. Seven other video links were indexed
but have not had full visual playback or independent linguistic review here.
No local full-video hash match, codec guarantee across browsers, retargeting
validation or fluent-signer endorsement is claimed.

Required review for each candidate: exact caption/sense equivalence; handshape,
palm orientation, location, movement, contact, two-hand coordination and
nonmanual grammar; source license/attribution; and preservation after any
future conversion. Record actual reviewer identity, decision and evidence in
the existing review architecture before approval. The source index cannot
approve runtime translations. See the dated
[handoff and review worklist](docs/LIBRARY_AND_SENTENCES_20261018.md).

# Final studio readiness boundary — 18 October 2026

All 207 registered recordings are present and have distinct file/content hashes.
The final numeric structure/retarget audit is in
`docs/STUDIO_ASSET_AUDIT_20261018.json`, bound to the current avatar and asset
bytes. Actual-rig/framing tests also pass with the final camera envelope. These
checks leave every linguistic approval unchanged: 0 approved signs, 0 approved
complete avatar sentences, 4 existing text-linked unverified research previews.

Following the user's working-options-only requirement, public sentence choices
now contain only the one browser-observed 2M-Flores original recording. All
pending conversions, including How are you? and What is your name?, are omitted
from public choices. The 44-entry source index, eight video references and
human-review worklists remain evidence, not enabled translations. The remaining
seven video references were not visually validated and are not offered as
working outputs. Full human ASL review and video/keypoint retargeting remain
blocked. See `docs/FINAL_STUDIO_READY_BLOCKED_20261018.md` for exact evidence,
checks not run and the tested build boundary.

# Current bounded vocabulary audit — 19 October 2026

The current manifest contains 297 unique candidate concepts and 237 distinct
motion files covering 236 concepts. All 237 pass current file/content identity,
structure and numeric retarget checks on Aarav. Two restroom captures share one
concept; no asset count is presented as a unique approved-word count. 233 assets
are inspection-only, four older unverified research concepts remain explicitly
opt-in from text, and approved signs/complete Aarav sentences remain zero.
The catalogue has 938 source entries, with 701 not imported.

The batch added 30 actual animated skeletal resources (29 new concepts and an
asset for existing NOW), not dictionary labels, images or classifier outputs.
All 30 have 30 finger rotation tracks and measurable finger change. They passed
30 Hz retarget diagnostics and actual-rig framing tests. Each was previewed,
paused and sought to a midpoint through the browser; face and both hands were
visible. Numeric/framing success and a screenshot do not establish ASL meaning,
full source/target equivalence, exhaustive mesh collision freedom or nonmanual
grammar. Source facial capture is absent. All new entries remain explicitly
inspection-only with pending reviews, null reviewer/date and text ineligible.

Source identity and data-specific CC BY 4.0 permission were verified against the
official ASL component and publisher records. Same-language Lifeprint references
were accessed for each proposed sense, without copying reference media. They
support the review package, not approval. Priority uncertainties include the
COUNSELOR agent marker, AGE/FIRST variants, MY versus I/MINE, MEET versus MEETING,
object-specific OPEN, restricted PEPPER/TOAST meanings, participant direction,
and hand contact/overlap in NEAR, INSIDE, USE, START and other two-hand signs.

See `docs/VOCABULARY_BATCH_20261019.md` for before/after counts, exact additions,
skips, test conditions and limits; `docs/EVERYDAY_BATCH_EVIDENCE_20261019.json`
for per-asset hashes, licence, references, measurements and pending human checks;
and `docs/ASL_REVIEW_WORKLIST_20261019.md` for the review list. The current runtime
technical report is `docs/STUDIO_ASSET_AUDIT.json`. Dated earlier reports remain
historical evidence. Import dry-run, commit and a repeated zero-change commit
are saved. No source restriction or approval gate was removed.


## Presentation stabilization — 20 October 2026

No assets, meanings or approvals changed. The shared readiness counter reconciles 728 playable concepts, 729 current compatible captures, 726 opt-in text captures representing 725 concepts, and three text-excluded captures. Linguistic approvals remain zero. Technical evidence still requires current file hashes and the retained rig hash. The four legacy mappings are a subset, not the size of expanded research text coverage. See docs/STABILIZED_COUNTS_20261020.json and docs/PRESENTATION_STABILIZATION_20261020.md. Camera framing and stage spacing changed without changing the motion or rig; current regression evidence is recorded in the stabilization logs. Browser-observed playback does not grant linguistic approval. Human review worklists remain applicable.

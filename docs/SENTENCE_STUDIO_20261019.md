# Sentence planning and Studio presentation — 19 October 2026

**READY:** local approximate lexical-sequence planning and motion exploration.
**UNSUPPORTED:** fluent ASL translation, approved complete sentences, validated
fingerspelling and unrestricted English-to-ASL grammar. No assets were added.

## Inventory verified from files

The [current inventory audit](SENTENCE_STUDIO_COVERAGE.json) checks actual file
hashes and the retained Aarav technical evidence, rather than dictionary counts:

| Unit | Verified count |
| --- | ---: |
| Existing motion files present, hash checked, structurally playable and rig-compatible | 729 |
| Distinct runtime / source / normalized animation hashes | 729 / 729 / 729 |
| Candidate concepts represented by those captures | 728 |
| Candidate concepts in the manifest, including missing assets | 789 |
| Concept records without an imported animation | 61 |
| Alias records / declared inflection records, not additional signs | 808 / 216 |
| Source catalogue entries without imported motion | 209 |
| Linguistically approved signs / complete approved Aarav sentences | 0 / 0 |

BATHROOM and TOILET are two different existing captures linked to one canonical
restroom concept. They are not two extra unique concepts. The 492 records added
in the previous task remain `source-gloss-unverified`; their semantic uniqueness
and source senses still need fluent-signer review. No duplicate was imported,
alias promoted, source changed, approval invented or existing motion overwritten.

All 729 files are bound to the existing actual-rig technical audit; the previous
full-rig trajectory run remains recorded in `continuous-avatar-tests.log`.
This change leaves avatar geometry, materials, retargeter and motion bytes alone.
The current static check rehashes every motion. Eleven motions used by the new
examples were also inspected in the browser at active source poses, including
SCHOOL's hand-contact phase. Successful rendering does not prove ASL correctness.

## What sentence mode does

The main Studio defaults to **Plan the whole message**. `sentenceMode: true`
is an additive English text/reviewed-voice API option. It reuses the existing
tokenizer, concept/sense resolver, consent checks, registry, motion loader,
ordered queue, history and player. Legacy isolated-word/manual inspection paths
remain available. The default approved vocabulary is still empty.

1. Preserve the original input and its character/word positions.
2. Resolve longest multiword concepts first, keeping unresolved phrase mappings
   together. An unreviewed “right now” mapping cannot fall through to unrelated
   RIGHT or tail NOW clips. Idiomatic candidates such as “give up” are held.
3. Resolve only enabled, source-linked concept captures. Synonyms remain subject
   to the existing mapping review; NEED is never substituted with WANT.
4. Record narrow English normalization separately: smart apostrophes/case,
   explicit copular contractions such as “you're”, and listed agreement forms
   such as “teacher works”. Agreement normalization requires an overt supported
   subject context; “You want drinks” cannot silently become the verb DRINK.
5. Recognize listed past/progressive/plural forms conservatively but **hold**
   them when the required tense/aspect/plural meaning is unrepresented. This is
   neither unrestricted stemming nor a new ASL inflection library.
6. Show every identified lexical meaning unit, available clip, missing meaning,
   original input and normalization/grammar note. Articles/copulas are explicitly
   retained in the written original and noted separately, not counted as signs.
   This is English coverage planning, not an assertion that ASL drops these words.
7. If any essential concept, person, number, protected name, ambiguous sense,
   negative clause or unrepresented question marker is missing, **hold playback
   for the entire message**. Available clips are labelled “held”. No partial
   positive sequence is presented as the translation of a negative sentence.
8. If all identified lexical concepts have enabled clips, allow an explicitly
   consented **Approximate sign sequence** in English source order. No ASL
   rearrangement, grammatical pattern or complete translation is claimed.

Coverage counts meaning-unit occurrences, not aliases, grammar filler or a
fabricated accuracy percentage. Complete lexical coverage does not imply complete
ASL meaning: direction, discourse referents, context, facial/body grammar and
exact source senses still need review. WH questions retain their manual question
concept and a visible warning; polar questions are held because no validated
question marking exists. Original punctuation and question intent remain visible.

The sentence planner is a conservative rule-based prototype, not a full English
parser or named-entity system. Declared names and unknown names remain explicit;
names sharing common words can need user clarification. Reviewed fingerspelling
is unavailable. No ASL sentence template is currently approved, so **none is
applied or invented**. Non-English interface labels retain their existing
isolated-word behavior and do not imply another signed language.

## Tested examples and honest results

| Input | Result |
| --- | --- |
| You want water. | YOU → WANT → WATER; approximate, unreviewed |
| Please drink water. | PLEASE → DRINK → WATER; approximate, unreviewed |
| Your teacher works today. | YOUR → TEACHER → WORK → TODAY; English agreement recorded; unreviewed |
| Where is school? | WHERE → SCHOOL; question intent retained, visible nonmanual-grammar warning |
| You're hungry. | YOU → HUNGRY; original contraction and normalization note retained |
| Your teacher works today. You want water. Please drink water. | Ten ordered clips across three source sentences; not grammatical ASL translation |
| I need help. | Held: I and NEED have no enabled motion; HELP is not played alone |
| I don't need help. | Entire message held; no positive HELP substitution |
| You want water? | Held: polar-question marking unavailable |
| My name is Alice. / You want qzxunknown. | Held: missing essential/name coverage; no invented spelling |
| You want light. / YOU WANT LIGHT. | Same sense-selection requirement; capitalization cannot bypass ambiguity |
| You want assistance. / You want water right now. | Held: unreviewed synonym/phrase mapping |
| You walked. / You are walking. / Cats sleep. | Held: past/aspect/plural meaning not encoded by reviewed patterns |

Examples are generated by exercising the current planner against technically
available captures. Example buttons only load text without consent, and do not
turn research consent on. With explicit consent, they prepare a plan for review;
Play remains a separate action. The original four single-sign examples remain
inside an expandable section. No unsupported complete-sentence button returns.

## Studio changes

ASL-focused headline, short explanation and live **728 concepts / 729 captures /
0 approved** inventory make the demonstration scope visible. The retained Aarav
stage remains prominent beside the input on desktop. Play/Pause/Resume, Replay,
Stop, speed, position and progress are accessible. Extra viewer tools, speech,
technical interpretation and history stay in disclosures. Missing meaning uses
plain language, not opaque technical codes. The review button focuses the sign
plan directly. Current sign highlighting appears in both player and meaning units.

Mobile stacks viewer, input and coverage with 16 px gaps and no horizontal
overflow. Source hands, face and signing space were visible in desktop and mobile
checks. Existing visible focus and reduced-motion styles remain; native page
scroll is immediate while explicit section navigation retains its motion policy.
Meaning units progressively render 60 at a time, and current playback extends
the rendered window when needed. Existing lazy motion loading, bounded idle
cache, cancellation, media coordination and Retry/Reset behavior are preserved.

Beyond Words branding, Aarav's appearance and the single developer footer for
Akshar Ratna, Himanshu Pandey and Anushk Singh remain. No new dependencies or
public learning/source/team sections were introduced.

## Verification

- `node scripts/check.mjs`: syntax, UI IDs, local assets, licences and immutable
  hashes pass. The final log is `sentence-studio-static.log`.
- Functional regression suite excluding the expensive unchanged renderer test:
  **107 passed / 0 failed** (`sentence-studio-functional.log`).
- After a final capitalization safety correction, **38 affected interpretation,
  sentence, API, consent, example and readiness tests passed / 0 failed**
  (`sentence-studio-final-focused.log`). This is an overlapping focused rerun,
  not 38 additional unique tests.
- Three current avatar-rig/asset-loader tests passed, including cancellation,
  failed transfer retry and byte bounds (`sentence-studio-loader.log`). The
  prior all-729 full renderer trajectory test was not repeated; renderer and
  asset bytes were not changed. New layout/playback was checked in the browser.
- Browser tested the required positive/missing NEED contrast, negation, question,
  unknown name/word, short and longer examples, repeated submission, Play/Pause/
  Resume/Replay, speed, seeking, current sign highlighting, mobile and focus.
- A 500-word browser input generated 500 meaning units/clips without truncation,
  rendering 60 initially and 120 after Show More. Separate tests preserve every
  original source span, all 200 clauses and repeatable plans.
- Controlled local fixture: model HTTP 503 → Reconnect recovered; LOVE motion
  HTTP 503 → Retry recovered. The real Studio console had no observed errors.
- Eleven distinct example motions inspected: PLEASE, DRINK, WATER, YOUR,
  TEACHER, WORK, TODAY, WHERE, SCHOOL, YOU, WANT. Framing/render observations and
  screenshots are in `sentence-browser-checks.json` and
  `screenshots/sentence-studio-20261019/`. These checks are not linguistic approval.
- Physical microphone/camera capture, independent fluent-signer sentence review,
  and sustained FPS across hardware were not performed. No claim of those tests.

There are no remaining observed technical test failures. The principal blockers
are missing lexical assets for many natural sentences (including I and NEED),
unreviewed source senses/retargeting, missing nonmanual grammar and no approved
sentence patterns or fingerspelling. The sentence planner exposes these limits.

## Sources, review and startup

No data was imported. Existing motions retain their **3D-LEX v1.0 ASL CC BY 4.0**
licence and source hashes; Aarav retains its independent existing licence.
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) is unchanged in substance.
[The example review package](SENTENCE_EXAMPLE_REVIEW.json) records exact concept,
asset, source, licence, review status and source/render evidence for each example.
The existing 729-motion fluent-signer worklist still applies. No expert identity
or meaning approval was invented.

Run from the project folder with Node **22.13+**:

```powershell
node server.mjs
```

Or double-click `start-studio.cmd`. Open http://127.0.0.1:3000/. Dependencies are
already installed locally; `npm install` is needed on a fresh checkout. No paid
key or new speech service is required. Enable unreviewed research recordings,
load **Please drink water**, review the plan and press Play. Microphone use stays
explicit, and browser recognition/remote voices can use provider services; no
new destination or model service was added. Camera frames stay local.

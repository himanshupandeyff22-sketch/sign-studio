# Five-expression milestone: review handoff

16 October 2026. This milestone is **partially completed**. No fluent-signer
approval is available; the project still has zero approved signs and zero
reviewed complete phrase translations. Existing working research previews
remain available through explicit opt-in.

## Actual additions

| Intended English expression | Canonical review record | New source obtained | Current blocker |
| --- | --- | --- | --- |
| Hello | `asl.template.greeting-hello` | CLERC ALPHA, `clerc_v03_0011`, 137 frames | Retargeting and complete-utterance ASL review |
| Thank you | Existing `asl.template.express-thanks` | CLERC ALPHA, `clerc_v03_0009`, 118 frames | Retargeting, addressee direction and ASL review |
| I need help | Existing manifest `asl.template.request-help` | No exact match in this source | Exact permitted source; preserve requester and intent |
| How are you? | Existing `asl.template.greeting-wellbeing` | CLERC ALPHA, `clerc_v03_0027`, 112 frames | Repeated HOW/YOU segments, question expression, retargeting and ASL review |
| Please repeat | `asl.template.request-repeat` | No exact match in this source | Complete request construction, permitted source and ASL review |

Only Hello and Please repeat needed new pending proposals. The other three
reuse existing template IDs. Existing lexical concepts are referenced without
adding duplicate signs, merging different senses or selecting an unreviewed
word order. Concept links are review scope, not an ASL sentence plan.

## Source and permissions

Publisher: CLERC / Florian Méloux. Dataset: [Épée v0.3](https://huggingface.co/datasets/CLERC-DATA/epee).
Pinned revision: `93bc8aa0a6526e86af80db5f59af8d133292c9b5`.
Publication information is the publisher's claim; it is not independent review
of the source or our avatar.

The dataset card permits non-commercial research and prototyping under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
Its raw source videos remain proprietary and were not obtained. Its body-data
and no-surveillance notices are preserved in
`imports/phrase-candidates/epee-v03/SOURCE_README.md`. Do not infer signer
identities or repurpose the captures for identification/profiling. Commercial
use needs separate permission; the app's MIT licensing does not relicense data.

Downloaded: three NPY files, their three JSON annotations, the source README
and metadata index. The metadata index describes more clips than the three
downloaded. This is not the full dataset or Rylo's database.

## Audit and technical validation

The dry-run report was saved before staging:
`docs/epee-phrase-dry-run-20261016.json`. The staging manifest records ASL,
exact English label, canonical link, source URL, license, pinned revision,
frame count, file and annotation hashes, format and pending review status.

All three arrays have the declared `(frames, 128, 3)` shape, floating values
and finite coordinates. Source annotations match the selected English labels.
Byte hashes and numeric payload hashes are distinct. Repeating the staging
command skipped all three captures and changed no candidate files. Existing
skeletal motion hashes and enabled vocabulary are unchanged. No conflicting
label or motion was substituted; no additional variants were imported.

Counts for this batch: **3 unique source candidates staged, 0 runtime additions,
0 runtime merges, 3 skipped on repeat, 0 conflicting candidates imported,
3 pending technical/linguistic review, 2 exact sources still missing.**
Linking candidates to existing concepts/templates supplies provenance, not
approval or a second copy of the same canonical sign.

The arrays are MediaPipe point coordinates, not the player's skeletal rotation
format. Shape/finiteness checks do not establish palm orientation, finger
accuracy, depth reliability, contact or grammatical correctness. No retargeting
has been performed. The source release has reduced face landmarks, without
full eyebrow/cheek grammar. The HOW/YOU annotation repeats segments; those
must not be treated as one automatic concatenated utterance.

## Linguistic review and activation requirements

The kit is available at **Motion library → Developer & review →
Five-expression review milestone → Download review kit**. Its five coverage
buttons use the existing validated meaning-resolution flow and never autoplay.
The JSON includes exact hashes, intended senses, source terms and review tasks.
It contains no user messages, history or private recordings.

A fluent ASL signer or qualified interpreter must review each exact utterance
and the final Aarav rendering, including handshape, palm orientation, location,
movement, two-hand coordination, contact, nonmanual expression, sentence
construction and transitions. Record reviewer identity/date, exact source and
derived hashes, English context and approved variants. Separate technical
acceptance from linguistic acceptance. Use the existing importer, canonical
manifest/template records and approval gates after review; this kit is not a
parallel playback registry.

Meaning references are reference-only, not licenses to copy media:
[ASLU Hello](https://www.lifeprint.com/asl101/pages-signs/h/hello.htm),
[Thank you](https://www.lifeprint.com/asl101/pages-signs/t/thank-you.htm),
[Help](https://www.lifeprint.com/asl101/pages-signs/h/help.htm),
[How](https://www.lifeprint.com/asl101/pages-signs/h/how.htm),
[Again/repeat](https://www.lifeprint.com/asl101/pages-signs/a/again.htm).
These describe concepts and distinctions; none establishes that these source
captures or any retargeting has passed expert review. No reference media copied.

## Microphone changes

Recognition releases failed sessions immediately, ignores stale events, and
bounds startup (12 s), finishing (10 s) and a listening session (60 s). A retry
works even if the browser never emits `onend`. Transcript text stays editable
after errors. Stop cancels a local-engine probe and late startup cannot undo it.

On-device recognition is preferred only when the browser reports that its
language engine is already installed. A one-second probe timeout, missing API
or failure falls back to the browser provider. No pack is installed/downloaded.
The engine status and Type instead control are visible. Experimental local
support follows [MDN availability](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static)
and [processLocally](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally).

In this browser the remote service still returns a network error. Startup,
retry after that error, stop, editable correction and transfer to text worked.
Successful real speech-to-text and audible voice quality were not verified.
On-device selection, denial, stale callbacks and timeout cases have automated
tests with controlled provider environments; that is not a hardware test.

## Reproduce

Run `node server.mjs`, then open http://127.0.0.1:3000/.
Run `node scripts/check.mjs` and
`node --test web/phrases.test.mjs backend/*.test.mjs`.

Optional dataset audit (Python + NumPy, internet needed):
`python scripts/audit-epee-phrases.py` writes the dry-run only;
`python scripts/audit-epee-phrases.py --stage` repeats the reviewed staging
batch, skips identical files and refuses conflicting replacements. It does not
modify runtime vocabulary or enable animations.

Human dependencies still outstanding: exact permitted recordings for the two
missing expressions; source-to-avatar adaptation with complete nonmanual
information; fluent-signer review; testing with three first-time human users.
No third parties were contacted, no service purchased, and nothing published.

## Finished verification

- Static checks passed: 45 JavaScript files, 163 unique HTML IDs, model/runtime
  assets, and all 153 immutable existing motion hashes.
- Full suite passed: **79 tests**, zero failures (108.6 seconds). This includes
  API persistence, 500-word input, ambiguity/negation gates, repeated import,
  source provenance, voice state recovery and avatar framing/rig checks.
- Updated the existing avatar test's path extractor to accept the loader's
  progress callback; this was a test parsing issue, not a model replacement.
- Browser: review kit JSON downloaded, all five review cards displayed, phrase
  checks retained validated mode and no autoplay; Hello/Thanks/How source
  candidates remained outside runtime. How are you? and Thank you coverage
  checks preserved the exact submitted text and disabled Play.
- Browser: microphone reached Listening; provider returned a real network
  error; Retry immediately restarted it, Stop ended it, manual correction
  copied to the form, and Type instead focused the input. No real successful
  transcription or local-engine hardware test was claimed.
- Browser: greeting/paragraph retained all punctuation and all three segments;
  500-word submission retained all 500 words; bank offered financial/riverbank
  senses and quasar stayed unsupported. Guided Help playback, pause, seek,
  resume, replay and stop worked on mobile. Sampled signing frame retained
  face and both hands within the rendered stage.
- Browser: 320/390/768/1440 CSS-pixel widths had no horizontal overflow. Review
  cards changed from one to two to five columns. No console errors/warnings.
- First-time human sessions and fluent-signer approval remain unrun.

Evidence: `docs/starter-checks-20261016.log` and images under
`docs/screenshots/judge-journey-20261016/` named `phrase-review-kit.jpg`,
`mobile-phrase-review.jpg` and `milestone-mobile-signing-frame.jpg`.

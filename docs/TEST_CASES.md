# Sample Data and Test Cases

Prepared 27 October 2026 for Sign Studio / Beyond Words.
Developers: Anushk Singh, Himanshu Pandey, Akshar Ratna.

## Sample data

- `samples/demo-inputs.json`: synthetic requests, expected plan status and ordered motion IDs. These are test fixtures, not new sign data or linguistic validation.
- `samples/long-input-500-words.txt`: exactly 500 words, using repeated supported lexical examples. It exercises length handling, not grammatical translation or conversational diversity.
- `samples/submission.test.mjs`: executable assertions against the real planner, registry and asset files.

Run from the project root:

```bash
node --test samples/submission.test.mjs
npm run check
npm test
```

The sample tests verify routing, preserved text, gates and file presence. They do not render or linguistically validate the motion. The existing avatar tests exercise the real rig through a simulated renderer; real browser checks and physical media tests remain distinct.

## Planner expectations

| ID | Input | Expected behavior |
| --- | --- | --- |
| request-water | You want water. | YOU → WANT → WATER after research opt-in |
| polite-request | Please drink water. | PLEASE → DRINK → WATER after research opt-in |
| inflection | Your teacher works today. | YOUR → TEACHER → WORK → TODAY; original retained |
| wh-question | Where is school? | WHERE → SCHOOL, approximate; facial/question grammar remains unvalidated |
| capitalization | YOU want WATER! | Same eligible lexical IDs; original punctuation/case retained |
| negation-held | I don't need help. | Entire queue held; no positive HELP substitute |
| missing-essential | You want qzxunknown. | Entire queue held; missing meaning explained |
| polar-question-held | You want water? | Entire queue held; unsupported question meaning is not dropped |
| validated-default | You want water. | No approved output in default validated mode |
| long input | Provided 500-word fixture | Original preserved; 500 research clips; no grammatical-ASL claim |

All approximate cases require `vocabularyMode: "research"`, `researchPreviewConsent: true`, and `sentenceMode: true`. `language: "en"` selects the interface/input label context; the signed language stays ASL. Sample expected IDs are technical lookup assertions, not expert ASL endorsements.

## Local API example

The server must be running. Use the public JSON request in `samples/demo-inputs.json` after establishing a session; stateful endpoints require its cookie. Example with curl:

```bash
curl -c cookies.txt -X POST http://127.0.0.1:3000/api/session
curl -b cookies.txt -H "Content-Type: application/json" -d '{"text":"You want water.","language":"en","vocabularyMode":"research","researchPreviewConsent":true,"sentenceMode":true}' http://127.0.0.1:3000/api/translations
```

The quoting example above targets a POSIX shell. In Windows PowerShell use `curl.exe` and place the JSON in a temporary file if shell quoting changes it (`--data-binary @request.json`). Do not commit session cookies or real user history. The browser UI manages its own session automatically.

## Manual presentation checks

| Test | Steps | Expected result |
| --- | --- | --- |
| Startup | Install dependencies; start server; open printed URL | Connected status; Aarav loads; no automatic speech/signing |
| Consent | Build first fixture before and after explicit research opt-in | Default held; eligible research plan becomes playable with pending-review label |
| Queue completion | Play each of the first three examples | Ordered signs, visible progress/current sign, completion |
| Controls | Pause/resume; stop; replay; change speed; seek | State-aware controls; no overlapping players; queue remains usable |
| Retry | Simulate a failed motion request in an isolated QA server | Loading error and Retry; original queue retained; no substitute sign |
| Reset | Use Reset Preview, rebuild | Text retained; playback clears; rebuilding works |
| Framing | Inspect two-hand/wide motions, fullscreen and reset | Face/hands stay visible; no signing-space clipping |
| Library | Search concept/alias; change filters; select inspection clips | Correct availability/review labels; no accidental approval |
| Repeated requests | Replace text during/after playback | Latest plan wins; older work cannot overwrite it |
| Voice | Choose available voice/rate/volume; mute/stop | Explicit speech only; failure/fallback understandable |
| Microphone | Deny permission, then use text | Clear feedback; no forced microphone requirement |
| Camera | Deny permission or remove hand from frame | Clear off/unknown/error state; no automatic ASL claim |
| Responsive | Desktop 1366×768; mobile 390×844; keyboard Tab/Enter | No horizontal overflow; usable controls and visible focus |

Physical camera recognition, microphone transcription and signer-reviewed language quality require real-device/human evaluation; automated fixtures do not substitute for them.

## Evidence and reproducibility

Historical presentation evidence is in `docs/PRESENTATION_STABILIZATION_20261020.md` and `docs/TESTED_STUDIO_BUILD.json`. The 20 October suite passed its 112 selected checks after six sandbox-blocked API checks were rerun with localhost access. The all-library rig simulation also passed. Those are historical results and were not rerun wholesale for this documentation update.

Current sample-test output: `docs/SUBMISSION_SAMPLE_TEST_RESULTS_20261027.txt`.
Current static output: `docs/SUBMISSION_STATIC_CHECKS_20261027.txt`.
No new linguistic review, physical camera evaluation or microphone recording is claimed by this documentation pass.

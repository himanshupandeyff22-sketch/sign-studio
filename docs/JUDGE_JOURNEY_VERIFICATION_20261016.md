# Sign Studio: first-visit and judging journey

Completed 16 October 2026. Existing Beyond Words styling, team credits,
Aarav's clean-shaven appearance, textured crop, grey hoodie, original rig,
source recordings and vocabulary validation architecture are retained.

## What changed

- A compact English-input/ASL-preview headline, audience explanation, clear
  prototype disclosure and prominent **Try the demo** action.
- Four curated, explicitly opt-in research examples: Help, Yes, No (negative
  answer/refusal), Love (affection). Each prepares the corresponding source
  recording with its intended sense and waits for Play. They are isolated
  word previews, not validated phrase translations.
- Enter → review → play guidance, a concise review card, original input
  alongside interpretation, and an explicit **Play reviewed preview** action.
- Plain-language missing coverage and optional alternative word examples.
  Missing text is not rewritten into unrelated supported signs.
- Playback controls above the viewer; playback actions bring the viewer
  header, controls and complete stage into view. Source pose/timing,
  meaningful finger movement and palm orientation are unchanged.
- How it works, coverage/review evidence, problem/approach/limitations,
  working features vs future plans, actual-source attribution and equal
  cards for Himanshu, Anushk and Akshar.
- Source diagnostics remain separate in Motion library → Developer & review.
  The source action opens and focuses that view's summary.
- Hidden library DOM is not built during first load. Recorded motion
  preparation remains tied to the selected queue, not the whole library.
  Pixel ratio is capped at 1.5. Model-download and texture-preparation feedback
  is visible; PNG assets now receive an `image/png` response.
- Both automatic playback and automatic speech are unchecked on a fresh
  visit. Guided examples also explicitly turn these preferences off.

## Verification

- Full command: `node --test web/phrases.test.mjs backend/*.test.mjs`:
  **73 passed, 0 failed, 0 skipped**, 104.2 seconds.
- Final focused rerun after UI refinements: `node --test
  backend/demo-guide.test.mjs backend/voice.test.mjs
  backend/request-lifecycle.test.mjs`: **12 passed, 0 failed**.
- Final static checks: `node scripts/check.mjs` passed: **43 JavaScript
  files, 160 unique UI IDs, 153 immutable recorded motion files** and required
  provenance/license notices. This app has no separate bundler build script.
- The local server was restarted successfully at port 3000 with SQLite.
  A HEAD request for the clean-shaven texture returned **200 image/png**.
- Browser: Try the demo; all four word examples; manual Play; Pause; Resume;
  Replay; Stop; speed; timeline frame inspection; view/source navigation;
  keyboard focus and arrow-key input tabs.
- All four examples reached **Queue ready**, one intended recording and
  **zero playback progress** before an explicit Play.
- Greeting `Hi, how are you?` and unsupported `Quasar xyzzy.` retained their
  text and reported missing coverage. Neither received substitute motion.
- `I need hepl.` preserved the original and displayed `I need help.` as the
  interpretation. `I went to the bank.` exposed financial-bank and riverbank
  choices without silently selecting a meaning.
- A multi-sentence paragraph reported its partial coverage; rapid Help → Yes
  resubmission kept the final Yes queue and did not autoplay.
- The 500-word browser sample retained every source word and the full
  original. Research mode queued 200 supported word occurrences; 300 remained
  explicitly unassigned, including unresolved meanings. That is vocabulary
  coverage, not grammatical translation or a correctness percentage.
- Browser microphone reached Listening and Stop returned to an editable
  idle state. On another attempt its recognition provider reported a network
  connection error. The useful error and typed-input fallback worked.
  Manually entering/correcting a transcript and transferring it into the
  message form did not submit or play automatically.
- Permission denial, unsupported recognition, late/stale microphone events,
  speech controls and asset errors/retry are covered by automated doubles.
- Desktop 1440px, tablet 768px, mobile 390px and narrow mobile 320px: no
  horizontal overflow. Mobile and desktop source playback were inspected
  visually with the face, both hands and signing space visible.
- Visible keyboard focus was verified on an example button. Primary text
  contrast spot checks exceeded 4.5:1 (body 10.93, hero action 8.35, supporting
  copy 5.77, research label 6.03, example description 5.08). This is not a
  comprehensive accessibility certification. Reduced-motion CSS and scripted
  scroll preference handling are present; an OS-level preference toggle was
  not tested.
- No broken in-page anchor targets and no browser warning/error logs were
  returned at the final check.

Screenshots: `docs/screenshots/judge-journey-20261016/`:
`desktop-home.jpg`, `desktop-playback.jpg`, `mobile-playback.jpg`,
`mobile-team.jpg`. Captures are unaltered browser output. The in-app browser's
zoom affected deep-page viewport captures; the team evidence uses its
document-relative capture API instead.

## Data and remaining limits

The registry still has **153 recordings, 149 inspection-only recordings,
four unverified text-linked research previews and zero approved ASL signs**.
No course content, sign mapping or animation was imported from Start ASL,
Alison or Udemy. Their public learning references, access evidence and reuse
decisions are in [the reference audit](research/learning-reference-audit-20261016.md).
The page does not imply those providers endorse the project.

Full grammatical ASL translation, validated sentence templates, validated
fingerspelling and captured facial grammar remain unavailable. The default
validated mode correctly plays no unapproved signs. Real recognition of a
spoken phrase could not be verified because the browser provider reported a
network error; audible TTS voice quality was not evaluated by listening.
Camera recognition was not tested with physical hardware in this pass and is
still clearly labelled as a pose demonstration, not continuous ASL recognition.
No public deployment, purchase or third-party contact occurred.

The source model SHA-256 remains
`ebe6b1596256f314d1356cfc2f42d28203b5bf1864d0bf139845cb9d13ee6500`.
Before-change frontend files are in `checkpoints/before-judge-journey/`.

## Run locally

From the repository root, with dependencies installed:

```sh
node server.mjs
```

Open `http://127.0.0.1:3000/`. For a fresh checkout, use Node.js 22.13+ and
`npm install` before starting. Full setup remains in `README.md`. The bundled
runtime on this machine has Node but no npm; checks were run via their exact
Node command equivalents. The server remains local to loopback.

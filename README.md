Sign Studio — Beyond Words

**Digital inclusion through visible communication.** Sign Studio lets users enter English, review available meanings and play existing American Sign Language (ASL) motion captures using Aarav, an articulated 3D avatar.

> ASL motion research prototype. Available word clips form approximate vocabulary sequences, not validated grammatical ASL sentence translations. Linguistically approved signs currently remain at zero.

## Developers

| Developer | Contribution area |
| --- | --- |
| Anushk Singh | Avatar and animation integration |
| Himanshu Pandey | Language, vocabulary and data review workflow |
| Akshar Ratna | Frontend and application integration |

Team: **Beyond Words** · Theme: **Digital inclusion**

## Features

- Editable English text and optional microphone transcription, reviewed before processing.
- Meaning resolution, phrase-first matching, cautious inflection handling and explicit missing coverage.
- Ordered research motion playback with Play/Pause/Resume, Stop, Replay, speed and timeline controls.
- Aarav with articulated fingers, adaptive signing-space framing, fullscreen and camera reset.
- Searchable motion library, filters, inspection queues and sentence ideas.
- Browser speech output with voice, rate, volume, mute and stop controls.
- Optional local camera **pose demonstration**, requiring confirmation; not continuous ASL recognition.
- Local SQLite sessions/history, review/replay and JSON export.
- Responsive layout, keyboard focus and reduced-motion behavior.

## Current coverage

| Metric | Count |
| --- | ---: |
| Distinct concepts with compatible motions | 728 |
| Technically playable motion captures | 729 |
| Captures eligible for explicit research text opt-in | 726 |
| Concepts reachable through those research mappings | 725 |
| Linguistically approved signs | 0 |

Counts describe different units and must not be added together. Two restroom captures share a concept. Three playable captures retain expanded-text restrictions. Aliases are not extra signs. Technical playback does not establish linguistic approval. Runtime counts come from `backend/readiness.mjs`; files must match retained technical evidence.

## Requirements

- Node.js **22.13 or newer**, with npm or pnpm.
- A modern browser with WebGL. Camera and microphone require browser support and explicit permission.
- The bundled `web/assets/aarav.glb`, registered motion JSON files and local camera assets must be present.

No API key or paid speech service is required for the basic demo. Python and the original training notebooks are not required to run the current Node.js Studio.

## Setup and run

Clone the public repository and enter the project folder:

```bash
git clone https://github.com/himanshupandeyff22-sketch/sign-studio.git
cd sign-studio
```

Install and start:

```bash
npm ci
npm start
```

Open **http://127.0.0.1:3000/**. Keep the server terminal running; use Ctrl+C to stop it.

On Windows, after installing dependencies, you can double-click **start-studio.cmd** instead. The launcher checks Node/dependencies and detects an already-running Studio. With pnpm, use `pnpm install` and `pnpm start`.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `SIGN_PORT` | `3000` | Port for the localhost HTTP server |

PowerShell example:

```powershell
$env:SIGN_PORT = '3001'
node server.mjs
```

macOS/Linux example:

```bash
SIGN_PORT=3001 node server.mjs
```

Then open http://127.0.0.1:3001/. The app does **not** automatically load `.env` files; set the variable in your shell. It binds to `127.0.0.1`, not a public network interface. There is no configurable cloud speech key, database URL or production authentication secret in this implementation. SQLite is created automatically at `data/sign-studio.sqlite`; database-path overrides exist only in the programmatic application factory used by tests.

## Try the demo

1. Enter **You want water.**
2. Explicitly select **Use unreviewed research recordings**.
3. Select **Build a sign plan**, read the sequence and its review status, then press **Play**.
4. Try **Please drink water.** and **Your teacher works today.**
5. Compare with **I don't need help.** Missing essential meaning holds the entire message rather than playing a positive substitute.

These examples demonstrate vocabulary planning and playback, not complete reviewed ASL expressions. Sentence ideas load a plan without automatically playing it. No valid fingerspelling fallback is enabled.

## Tests and sample data

```bash
npm run check
npm run test:quick
npm run test:samples
npm test
```

`npm run check` checks syntax, HTML IDs, bundled assets and license/review records. `npm test` runs the runtime suite plus sample cases; raw-source reimport tests are kept separately as `npm run test:imports`. Two optional source-only cases explicitly skip when the raw reimport cache or quarantined phrase payloads are absent. `npm run test:quick` omits the expensive graphics simulations; `npm run test:graphics` runs those separately. The full runtime suite includes graphics, and its all-library avatar simulation is CPU-intensive and can take about 27 minutes on the previously tested Windows machine. Local API tests need permission to connect to localhost. Physical microphone/camera and fluent-signer validation are separate from automated fixtures.

See [sample inputs](samples/demo-inputs.json), [500-word example](samples/long-input-500-words.txt), [test cases](docs/TEST_CASES.md), and [technical design](docs/TECHNICAL_DESIGN.md), including architecture, playback and data diagrams.

## Project structure

```text
server.mjs                 Local HTTP API and static asset server
backend/                   Meaning resolution, planning, catalogue and SQLite
web/                       Browser UI, Three.js player, camera and speech
web/vocabulary-manifest.json  Canonical concepts, assets and provenance
web/assets/                Avatar, motion recordings, model assets and notices
scripts/                   Integrity checks and controlled import tooling
samples/                   Synthetic demo requests and executable sample tests
docs/                      Technical design, test cases and validation evidence
start-studio.cmd            Windows launcher
```

## Privacy and limitations

Camera video stays in the browser. Confirmed pose responses and text can enter local history. Sign Studio does not store microphone audio; browser recognition or remote voices may use their provider's service. Read the browser permission prompts. History is local to this server and browser session; clear/export it through the UI. This localhost prototype is not a production, multi-user deployment.

Input limits are 10,000 words and 100,000 characters; oversized input is rejected explicitly. Missing people, negation, numbers, question markers or other essential meaning can block a whole message. ASL and Indian Sign Language are distinct; interface language or voice changes do not change the signed language. Source recordings and retargeted signs require fluent ASL review, including facial/nonmanual grammar.

## Troubleshooting

- **Site cannot be reached:** start the server, keep its terminal open and use the exact localhost URL/port printed there.
- **No default playback:** approved vocabulary is currently empty. Research playback requires explicit opt-in and a supported plan.
- **Motion fails:** use Retry or Reset Preview; check the bundled files rather than substituting another gesture.
- **Camera/microphone unavailable:** use text input; support and permissions depend on the browser/device.
- **Missing assets after cloning:** check that the actual files, rather than Git LFS pointer text, are present if you configured LFS.

See [GitHub release and clean-checkout verification](docs/GITHUB_RELEASE.md) for test groups, packaging and limitations.

## Submission documents

- [Technical Design Document](docs/TECHNICAL_DESIGN.md)
- [Sample Data and Test Cases](docs/TEST_CASES.md)
- [ASL validation evidence](SIGN_DATA_VALIDATION.md)
- [Presentation verification](docs/PRESENTATION_STABILIZATION_20261020.md)
- [MIT License](LICENSE)
- [Third-party licenses and attribution](THIRD_PARTY_NOTICES.md)

The project retains existing copyright notices. Third-party motion data, avatar geometry and model/runtime resources have separate licenses; the project's MIT license does not relicense those resources. Keep the accompanying notices when sharing the code or assets.

Do not commit private `.env` files, credentials, local databases/history, `node_modules`, raw download caches or checkpoint archives. Review large assets before pushing; this README does not configure Git LFS or upload the project for you.

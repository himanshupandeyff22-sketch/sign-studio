# Public release and clean-checkout verification

This package contains the runnable Beyond Words Sign Studio, its existing runtime motion assets, manifests, import metadata, technical evidence, setup instructions and synthetic submission samples. It preserves the actual source and license notices.

## Run

Install Node.js 24 LTS (minimum 22.13), then run from the repository root:

```bash
npm ci
npm start
```

Open http://127.0.0.1:3000/. On Windows, after installing dependencies, double-click `start-studio.cmd`. Keep its window open. If port 3000 is occupied, set `SIGN_PORT` to another available port before starting. No API keys are required. The server creates local SQLite data on first use; this is excluded from Git.

## Verification commands

```bash
npm run check
npm run test:quick
npm run test:samples
npm test
```

`test:quick` runs the runtime, API, planner, camera-state, speech-state, library and submission checks without the long avatar geometry simulation. `npm test` includes that simulation, which took approximately 27 minutes in the earlier frozen-build evaluation. `test:graphics` runs the geometry/retarget checks alone. Automated graphics checks do not establish linguistic accuracy.

`test:imports` is an optional maintainer check requiring the original raw-source cache, which is intentionally excluded from this public runtime package. Two source-only cases in otherwise useful runtime test files explicitly skip when raw imports/quarantined phrase payloads are absent. They are not runtime failures or passing linguistic validations. All planner, approval-gate and runtime cases still run.

The GitHub workflow runs a clean npm install, static checks, quick runtime checks and submission fixtures on Node.js 24. A workflow definition alone does not mean a remote CI run passed.

## Included and excluded files

All 729 registered runtime motion files and the active Aarav model are included. Full animations are loaded on demand. Historical import metadata records provenance and unresolved review issues; it does not enable quarantined candidates.

Excluded: dependency folders, local conversation databases, credentials, source-download caches, raw quarantined NPY payloads, unused source avatar geometry, original Git history, checkpoints and generated presentation/video exports. These remain in the original local workspace. No existing originals were deleted. External metadata links are references, not a promise that every upstream URL will remain available.

## Prototype limits

728 unique motion concepts and 729 technically playable captures are different units. 726 captures map to 725 concepts under explicit research text opt-in; three captures retain text restrictions. Linguistically approved signs remain zero. Approximate lexical sequences are not validated grammatical ASL sentences. Essential missing meaning, ambiguity and negation remain guarded. Camera input is a general pose demonstration rather than continuous ASL recognition. Real microphone/camera behavior depends on hardware, permissions and the browser. Browser speech recognition may use its provider's external service; the app's camera frames stay local.

See the technical design, test cases, validation record and third-party notices for evidence and responsibilities. No secrets or paid service are required for the basic demo.

## Clean-copy results — 27 October 2026

- Clean `npm ci`: two dependencies installed; npm reported zero known vulnerabilities at that time. This is not a guarantee against future advisories.
- `npm run check`: passed, including 72 JavaScript files, 238 unique UI IDs, required local assets and all 729 pinned runtime motion hashes.
- `npm run test:quick`: 100 cases; 98 passed, zero failed, two optional source-payload cases skipped. See `RELEASE_QUICK_TEST_RESULTS_20261027.log`.
- Fresh browser session on local port 3002: loaded Aarav, enabled explicit research consent, prepared YOU → WANT → WATER from “You want water.” and started actual queued playback.
- README, third-party notices and validation-record local Markdown links: no missing targets.
- The previous frozen-build desktop/mobile and all-library framing evidence remains applicable because no avatar, animation, layout or retargeting implementation changed in this packaging pass. The long graphics suite, real camera/microphone tests, fluent-signer review and remote GitHub CI were not rerun in this packaging pass.

The publication step requires an authenticated GitHub session and an existing destination repository. This local package does not itself establish that the remote repository exists.

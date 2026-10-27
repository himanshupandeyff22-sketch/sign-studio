# Presentation stabilization — 20 October 2026

Status: READY for the local research-prototype presentation. Regression: 112 checks passed across the initial run and a targeted localhost-permission rerun. Six initial EACCES failures were environmental and all six passed on retry; no unresolved failures. Frozen checkpoint: ../.checkpoints/presentation-stable-20261020-tested. See TESTED_STUDIO_BUILD.json for hashes.

## Scope and preserved work
Beyond Words design, ASL scope, Aarav's grey hoodie/appearance, animation bindings, developer credits and explicit research gates are preserved. No datasets, assets, linguistic approvals, sentence templates or recognition classes were added.

A before-edit checkpoint is at ../.checkpoints/presentation-stable-20261020-before. Its restore.json identifies the full base asset checkpoint and overlay. Presentation output folders and dependencies are excluded from the app overlay; originals remain untouched.

## One count implementation
backend/readiness.mjs is the common source of current readiness counts. It hashes every registered file, requires matching structural/retarget evidence and the retained rig hash, and intersects text mappings with current compatibility. The Studio banner, public capability cards and review audit use these counts. Each banner label has its own explanation and keyboard focus. Older four-entry research mappings are explicitly labelled as a subset, not the total text library.

| Measure | Before | After | Definition |
| --- | ---: | ---: | --- |
| Concepts with playable motion | 728 | 728 | Distinct canonical concept/sense IDs with compatible captures |
| Imported files present / unique hashes | 729 | 729 | Registered local motion files, all present and hash checked |
| Technically playable captures | 729 | 729 | Structure and Aarav rig evidence matches current bytes |
| Opt-in text-preview captures | 726 | 726 | Compatible captures eligible for expanded research mapping |
| Text-reachable concepts | 725 | 725 | Concept/sense IDs represented by those captures; some require a meaning choice |
| Text-excluded playable captures | 3 | 3 | Inspection remains available; expanded text mapping remains restricted |
| Candidate concepts (including missing motions) | 789 | 789 | Catalogue concepts, not a playable-word claim |
| Catalogue records not imported | 209 | 209 | Discovery records, not avatar animations |
| Linguistically approved signs / avatar sentences | 0 / 0 | 0 / 0 | No fluent-signer approval has been invented |

BATHROOM and TOILET are two captures of the same restroom concept. CANNOT, NEVER and NOT retain inspection-only text restrictions. The manifest marks 725 captures inspection-only; expanded research consent is a separate, opt-in route for 726 captures, not linguistic approval. Unreviewed synonyms, ambiguous senses and essential missing meanings can still prevent a text queue. See STABILIZED_COUNTS_20261020.json for machine-readable counts and definitions.

## Presentation changes
Tighter desktop header, form padding, textarea and review spacing. Larger stage with a smaller safe camera envelope and six-percent projection margin; all actual finger/face extents and preflight queue bounds can enlarge that envelope. The camera retains lower space when hands rest below the waist rather than cropping them for a strict portrait. No bone, motion timing or finger retargeting was altered. Playback scrolls to the signing space and keeps current sign, state-aware Play/Pause/Resume, Stop, Replay, speed and progress together. Mobile stacks naturally; optional settings remain collapsed.

## Demonstration sequence
1. Enter **You want water.** Build the plan with research disabled to see the restriction. Explicitly check **Use unreviewed research recordings**, rebuild and review YOU → WANT → WATER. Press Play.
2. Load **Please drink water.**, review PLEASE → DRINK → WATER, then explicitly play.
3. Load **Your teacher works today.**, review YOUR → TEACHER → WORK → TODAY, then explicitly play.

All three are approximate English-order vocabulary sequences, not approved grammatical ASL sentence translations. Original text is retained. Play, pause/resume, completion, replay, stop, speed, seeking and repeated submissions were exercised in the browser. “I don't need help.” holds the whole message rather than dropping negation. LOVE requires its affection sense choice; a deliberately injected HTTP 503 leaves the queue recoverable with Retry selected motions. Retrying loaded the original capture and reached completion.

## Browser verification
Desktop CSS viewport 1366×768 and mobile 390×844, calibrated for the app browser's scaling. No horizontal overflow. Player, current sign and playback controls fit together when playback brings the viewer into view. Checked face/both hands in the three examples and FAMILY/ALL two-hand captures, fullscreen entry/exit and Reset Camera. Main controls were activated by keyboard with visible focus. Saved desktop/mobile PNG evidence accompanies this report. Main page captured no console errors. The isolated in-memory QA page intentionally produced one HTTP 503; that expected error is not a production failure.

Full regression results and avatar trajectory checks are recorded in stabilization-regression-20261020.log. The all-729 real-rig renderer test passed (about 27 minutes of simulation). Six local API checks were initially blocked by sandbox socket permissions, EACCES; all six passed in the targeted permitted rerun recorded in stabilization-network-retry-20261020.log. Together these cover all 112 checks in the initial regression selection; the additional count test also passed in the separate three-test counts run. Static checks are in stabilization-static-20261020.log. Counts tests are in stabilization-counts-20261020.log. Failed-download and cancellation fixtures also run in avatar.test.mjs. Physical microphone/camera, different human signers, every animation frame of all 520 suggested plans, and sustained real-device frame rates are not verified by these browser sessions. Synthetic rig tests are technical checks, not a linguistic assessment.

## Startup
From the existing project directory, double-click **start-studio.cmd**, keep its terminal open, and open http://127.0.0.1:3000/. Alternatively run `node server.mjs` with Node 22.13 or newer. Existing dependencies are installed; for a fresh checkout install the package.json dependencies first. The launcher was executed successfully against the running server and detected it instead of starting a second copy. Stop using Ctrl+C in the terminal. SIGN_PORT can select another local port.

## Limitations
ASL motion research prototype. Zero approved signs, no grammatical ASL sentence translator, no valid fingerspelling. Source clips do not include validated facial grammar. Camera remains general pose illustration, not continuous ASL recognition. Microphone use is explicit; browser transcription/remote speech voices can use provider services. No paid key is required. Fluent ASL review and physical media testing remain external verification requirements, not grounds to bypass the research gate.

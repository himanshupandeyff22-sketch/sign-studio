# A dependable 60-second judge demonstration

Start `node server.mjs` in this project, open http://127.0.0.1:3000/, and wait
for Aarav to load. Keep automatic speech and playback off. Use the typed path
if the browser's speech service cannot connect. These are unverified recorded
word previews, not reviewed ASL sentence translation.

| Time | Action | What to say |
| --- | --- | --- |
| 0–10 s | Show the headline and Aarav | “We are Beyond Words. Sign Studio explores English input, meaning review and ASL motion playback.” |
| 10–22 s | Click Try the demo; review Help, then Play reviewed preview | “This loads an explicitly labelled research word recording. Playback starts only after review.” |
| 22–32 s | Load Love (affection), play, pause, resume and replay | “The meaning is explicit. The player supports pause, speed and replay while keeping the signing space visible.” |
| 32–45 s | Type “Hi, How are you?” and Explore this message | “A few word matches are not a complete sentence. We show missing coverage rather than inventing gestures.” |
| 45–55 s | Motion library → Developer & review; show five-expression milestone | “Three licensed source candidates are staged for our next milestone. None is approved or playable as a complete phrase yet.” |
| 55–60 s | Show the review kit download | “Next comes compatible phrase motion and fluent-signer review. We do not claim conversation translation today.” |

If demonstrating speech, do it after the timed path: Microphone → Start →
Stop → correct recognized text → Use reviewed text → review coverage. A
network/permission failure has a typed fallback. Do not promise offline
recognition on a browser without an already installed supported engine.

## First-time-user session script — prepared, not yet run

Invite three people who have not used this build. Explain that this is a
prototype and that this session tests usability, not ASL correctness. Let them
work without coaching; do not record personal audio or video by default.

1. “What does this project do, and what does it not yet do?” Give 10 seconds.
2. “Try one motion and tell me what it means.” Look for explicit Play and
   awareness that a research preview is unverified.
3. “Pause it, resume it, and play it again.” Check control discoverability.
4. “Check ‘Hi, How are you?’ Is the whole sentence translated?” The user
   should see missing coverage and distinguish a word from a complete phrase.
5. “Try the microphone. If it fails, keep going by typing.” Check editable
   correction, understandable permission/provider feedback and recovery.
6. Repeat the demo on a narrow phone layout. Check readable controls, face,
   both hands, no sideways scrolling and no accidental autoplay.

For each participant record: anonymous participant label, device/browser,
task completed without help (yes/no), time, misunderstanding, first failed
step and proposed fix. Do not turn three sessions into an accuracy claim.
Success requires all three users to find the demo and understand its scope;
any recurrent failure becomes the next UI fix. No participants or results
have been fabricated. Linguistic validation is a separate fluent-signer task.

# Studio spacing adjustment — 19 October 2026

The existing coverage/queue section now lives in the Studio grid immediately
below Aarav on desktop. The message panel spans the two left-column rows, so
its review card or expanded settings no longer create an empty area between
Aarav and “Your message, understood”. The first row fits the viewer content;
additional message-panel height belongs to the flexible second row.

The measured gap in the existing inspected-motion state was about 466.7 CSS
pixels before the change and 20 pixels afterward. It remained 20 pixels with
both language and voice settings expanded (message-panel height about 1904
pixels). The narrower coverage card wraps its heading and switches its inner
columns to a single column when needed. No animation, dataset, input mapping,
review gate, JavaScript handler or control ID changed.

Mobile retains DOM/visual order: avatar, message input, coverage. Gaps measured
16 pixels at 390 × 844, with no horizontal overflow. Desktop 1538 × 834 and
1365 × 768, and narrow desktop/tablet 900 × 768, were checked. Playback,
pause/resume, seeking, Reset Camera, keyboard fullscreen/exit, the review-results
focus link, and microphone/camera tab switching worked. Devices were not
started; no new live camera/microphone validation is claimed. The original
“delicious” message was retained and its selected motion restored from history.

`node scripts/check.mjs` passed for 64 JavaScript files, 216 UI IDs and the
unchanged 237 motion files. The previous 97-test suite belongs to the vocabulary
checkpoint; this HTML/CSS-only patch was checked with the static check and actual
browser layout/interaction checks, without rerunning that full suite. Screenshots
are in `screenshots/studio-spacing-20261019/`. The current tested-build marker
records the saved spacing delta and its full-build base checkpoint.

# Theme refresh — 16 October 2026

Added `web/theme.css` after the existing presentation layer. The refresh uses deep teal, apricot accents, a gradient hero, softer cards, refined tabs, pill examples, focus treatments, hover/press feedback and short panel entrance animations. Reduced-motion preferences disable decorative transitions and smooth scrolling. No signing assets, source timing, camera framing, vocabulary gates or backend logic were changed.

Before-change HTML and presentation CSS are preserved in `checkpoints/theme-before-20261016/`. Remove the theme stylesheet link to return to the previous visual layer.

Verification:
- `node scripts/check.mjs` passed: 41 JavaScript files, 137 unique UI IDs, 153 immutable research motion files.
- Browser: greeting example submitted successfully, with explicit missing coverage in validated mode.
- Motion library and history navigation worked.
- Desktop 1440px, tablet 768px and mobile 390px had no horizontal overflow. Avatar canvas loaded.
- No browser error/warning logs were returned during this check.
- Desktop and mobile captures: `docs/screenshots/theme-20261016/`.

The full backend/motion suite was not rerun for this CSS-only refresh. Earlier presentation verification is historical evidence for its recorded revision, not the new theme. Reduced-motion behavior is implemented in CSS; an OS-level preference toggle was not tested.

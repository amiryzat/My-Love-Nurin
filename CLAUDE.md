# Love Site — Project Context for Claude

## What this project is
A personal, single-page love letter / apology website from Amir to his girlfriend Sarah. Deployed by dragging the `/love-site` folder to Netlify. No frameworks, no build tools, no package.json.

---

## Folder structure

```
/love-site
  index.html     — HTML structure only, no inline CSS or JS
  style.css      — All styles
  script.js      — CONFIG block + all JavaScript logic
  /photos        — User drops photo1.jpg … photo6.jpg here
  /videos        — User drops video1.mp4 … video3.mp4 here
```

---

## Key constraints (never break these)
- **No frameworks** — vanilla HTML/CSS/JS only
- **No build tools** — no npm, no webpack, no package.json
- **No external JS** — no jQuery, no animation libraries
- **No SVGs, no icon libraries** — all shapes drawn with CSS (borders, pseudo-elements)
- **External dependency** — Google Fonts only (Playfair Display, Lato, Kalam), loaded with `font-display: swap`
- **Deploy target** — Netlify drag-and-drop. The whole `/love-site` folder is the deployable unit
- **iOS Safari** — all `<video>` elements must have `autoplay muted loop playsinline` (all four attributes)

---

## Design tokens

| Token | Value |
|---|---|
| Background | `#F7F0E6` (parchment) |
| Text | `#1A1A1A` (ink) |
| Accent | `#C97B7B` (dusty rose) |
| Letter paper | `#FDF6EC` |
| Heading font | Playfair Display |
| Body font | Lato |
| Handwriting font | Kalam |
| Mobile base | 390px |
| Desktop breakpoint | 768px |

---

## CONFIG block (in script.js)
The top of `script.js` holds a `const CONFIG = { … }` object. This is the **only thing Amir edits** to personalise the site. It contains:

```js
CONFIG.recipientName  // "Sarah"
CONFIG.senderName     // "Amir"
CONFIG.letterText     // template literal, \n = line break
CONFIG.reasons        // string[] — rendered as reason cards
CONFIG.photos         // string[] — paths like "photos/photo1.jpg"
CONFIG.videos         // string[] — paths like "videos/video1.mp4"
```

If `CONFIG.photos` or `CONFIG.videos` is empty, that entire section is hidden (`display: none`).

---

## Sections & how they work

### Section 1 — Envelope landing
- Full-viewport, vertically centered
- CSS-only envelope (divs + border-trick triangles + `::before`/`::after`)
- Wax seal: `.envelope-seal` with heart drawn in pseudo-elements
- Bob animation: `@keyframes envelope-bob` on `.envelope-wrapper`
- "tap to open" prompt: `.tap-prompt` with `@keyframes pulse-opacity`
- **Open sequence** (all CSS classes toggled by JS, no inline styles):
  1. `.envelope-flap.open` → `rotateX(-180deg)` (0.6s)
  2. `.envelope-letter-peek.visible` → slides up (0.4s delay)
  3. `#letter-section.visible` → shown; `.letter-card.revealed` → slides in
  4. `#envelope-section.fade-out` → opacity 0, scale 0.8; then `.hidden` → `display: none`

### Section 2 — The letter
- Card: `.letter-card` on `#FDF6EC` background, `border-radius: 12px`, `box-shadow`
- Letter text split on `\n`, each segment wrapped in `<p>` inside `.letter-body`
- Signature right-aligned in Kalam 22px
- CSS heart: `.heart-shape` using two rotated rectangles with `border-radius`
- Scroll indicator: `.scroll-indicator` fades in 1.5s after letter reveals; bouncing CSS chevron

### Section 3 — Reasons
- Cards built from `CONFIG.reasons` array in `buildReasons()`
- Animated in via `IntersectionObserver` → `.reason-card.revealed`
- Each card: white bg, `border-left: 3px solid #C97B7B`, `border-radius: 0 8px 8px 0`

### Section 4 — Photo gallery
- Built from `CONFIG.photos` in `buildGallery()`
- Mobile: horizontal scroll-snap strip (`.photo-strip` flex + `scroll-snap-type: x mandatory`)
- Desktop (≥768px): CSS grid, 3 columns, `max-width: 900px`
- Lightbox: `#lightbox` fixed overlay, prev/next/close buttons with CSS chevrons
- Keyboard: ArrowLeft, ArrowRight, Escape

### Section 5 — Video strip
- Built from `CONFIG.videos` in `buildVideoStrip()`
- Infinite marquee: list duplicated in DOM (2×), `@keyframes marquee` translates `-50%`
- Pauses on `mouseenter`/`touchstart`; resumes on `mouseleave`/`touchend` (unless video lightbox is open)
- Video lightbox: `#video-lightbox` — unmutes audio, pauses marquee while open

### Section 6 — Final message
- Hardcoded sentence: `"I'm sorry. I love you. That will never change."`
- Each word wrapped in `.word` span; revealed one by one with `setTimeout` (280ms gap)
- Triggered once by `IntersectionObserver` at `threshold: 0.3`
- Pulsing CSS heart: `.heart-beat` with `@keyframes heartbeat` (scale 1 → 1.15)

---

## Accessibility & motion
- `prefers-reduced-motion`: detected once at top of `script.js` as `const prefersReducedMotion`
- If true: all transitions/animations skip to end state immediately; no `setTimeout` chains
- All interactive elements have `aria-label`; lightboxes have `role="dialog" aria-modal="true"`

---

## JS architecture
- Single `DOMContentLoaded` listener calls all `build*` and `setup*` functions
- No inline event handlers in HTML
- State: `currentPhotoIndex` (number), `videoLightboxOpen` (boolean) — both module-level vars
- No classes, no modules — plain function declarations

---

## Change log

| Date | Change |
|---|---|
| 2026-06-28 | Initial build — single `index.html` |
| 2026-06-28 | Split into `index.html` + `style.css` + `script.js` |
| 2026-06-28 | Replaced CSS transition envelope animation with GSAP timeline. `#envelope-section` is now `position: fixed; z-index: 100` overlay. GSAP owns all transforms on `flap`, `peek`, `letterCard`, and `envelopeSection` — no CSS transitions on those elements. Sequence: flap rotates open → peek rises → envelope slides off top of viewport → letter card rises up. GSAP loaded from cdnjs. |
| 2026-06-28 | Added GSAP ScrollTrigger scroll-reveal to gallery section. Eyebrow fades up → title slides in → photo cards stagger up with scale (0.93→1). ScrollTrigger loaded from cdnjs. `setupGalleryAnimations()` runs after `buildGallery()` so items exist in DOM. |
| 2026-06-28 | iOS compatibility pass. CSS: added `-webkit-perspective`, `-webkit-backface-visibility: hidden`, `-webkit-transform-style: preserve-3d` to envelope flap; `will-change: transform` on flap/wrapper/track/card; `translateZ(0)` in marquee keyframes for GPU compositing; `min-height: 100svh` fallback alongside `100vh` on letter and final sections. JS: removed `touchstart`/`touchend` from marquee container (touchcancel on iOS scroll gesture permanently froze it — mouse hover pause kept for desktop); envelope exit changed from `y: '-100vh'` to `-(window.innerHeight + 100)` pixels to avoid iOS address-bar viewport unit mismatch; added all four video attributes as DOM attributes (not just properties) for iOS Safari; added `ScrollTrigger.refresh()` on `window load` event. |

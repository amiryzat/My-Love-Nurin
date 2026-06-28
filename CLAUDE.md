# Love Site — Project Context for Claude

## What this project is
A personal, single-page love letter / apology website from Amir to his girlfriend (Nurin Sayang). Deployed by dragging the `/love-site` folder to Netlify. No frameworks, no build tools, no package.json.

---

## Folder structure

```
/love-site
  index.html              — HTML structure only, no inline CSS or JS
  style.css               — All styles
  script.js               — CONFIG block + all JavaScript logic (regular script)
  circular-gallery.js     — CircularGallery WebGL component (ES module, imports ogl from esm.sh CDN)
  /photos                 — photo1.jpg … photo9.jpg
  /videos                 — video1.mp4 … video5.mp4
```

---

## Key constraints (never break these)
- **No frameworks** — vanilla HTML/CSS/JS only
- **No build tools** — no npm, no webpack, no package.json
- **No SVGs, no icon libraries** — all shapes drawn with CSS (borders, pseudo-elements)
- **External dependencies** — Google Fonts (Playfair Display, Lato, Kalam); GSAP + ScrollTrigger from cdnjs; ogl from esm.sh (ES module import inside circular-gallery.js only)
- **Deploy target** — Netlify drag-and-drop. The whole `/love-site` folder is the deployable unit
- **iOS Safari** — all `<video>` elements must have `autoplay muted loop playsinline` (all four attributes)
- **circular-gallery.js is an ES module** — loaded with `<script type="module">`. It cannot share `const` scope with script.js; reads photos via `window.__loveConfig` which script.js sets after CONFIG
- **Desktop-first** — full GSAP animations on desktop (≥768px); mobile uses simplified/instant fallbacks via `const isMobile = window.innerWidth < 768`

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
CONFIG.recipientName  // "Sayang"
CONFIG.senderName     // "Amir"
CONFIG.letterText     // template literal, \n = paragraph break
CONFIG.photos         // string[] — paths like "photos/photo1.jpg" (currently photo1–photo9)
CONFIG.videos         // string[] — paths like "videos/video1.mp4" (currently video1–video5)
```

After CONFIG, `window.__loveConfig = CONFIG` exposes it for the ES module circular-gallery.js.

If `CONFIG.photos` or `CONFIG.videos` is empty, that entire section is hidden.

**Adding photos**: drop file into `/photos/`, rename to `photoN.jpg` (always lowercase `.jpg` — Netlify is case-sensitive Linux), add path to `CONFIG.photos`.

**Adding videos**: original MOV/HEIC files must be converted first — use `avconvert --preset Preset1280x720` for video, `sips -s format jpeg` for HEIC. Rename output to `videoN.mp4` / `photoN.jpg`.

---

## Sections & how they work

### Section 1 — Envelope landing
- Full-viewport fixed overlay (`position: fixed; inset: 0; z-index: 100`)
- CSS-only envelope (300×208px desktop, 260×180px mobile) — border-trick triangles + `::before`/`::after`
- Wax seal: `.envelope-seal` with heart in pseudo-elements
- Bob animation: `@keyframes envelope-bob` on `.envelope-wrapper`
- **Desktop open sequence** (GSAP timeline):
  1. Flap `rotationX: -180` (0.65s)
  2. Peek rises `y: -30, opacity: 1` (0.55s, overlaps)
  3. `#letter-section.visible` added
  4. Envelope exits `y: -(window.innerHeight + 100)` (0.85s) — pixel value avoids iOS vh mismatch
  5. Letter card `y: 0, opacity: 1` (0.8s, overlaps)
  6. Scroll indicator shown
- **Mobile open sequence**: instant reveal — `envelopeSection.hidden`, `letterSection.visible`, `gsap.set(letterCard, {y:0, opacity:1})`

### Section 2 — The letter
- Card: `.letter-card` on `#FDF6EC`, `border-radius: 12px`, `box-shadow`
- `600px` max-width desktop / `480px` mobile; `56px 52px` padding desktop
- Letter text split on `\n` → `<p>` tags inside `.letter-body`; font: Kalam 18–19px
- Scroll indicator: `.scroll-indicator` bouncing chevron, shown after envelope animation

### Section 4 — Photo gallery (CircularGallery)
- **Replaced** the old CSS grid/lightbox with a WebGL circular gallery
- Powered by `circular-gallery.js` (ES module) using the `ogl` library from `https://esm.sh/ogl`
- Container: `#circular-gallery-container` — 500px tall mobile, 620px desktop
- `circular-gallery.js` reads `window.__loveConfig.photos` and maps them to `{ image, text: '' }`
- Props: `bend: 3`, `borderRadius: 0.05`, `scrollEase: 0.02`, `textColor: '#C97B7B'`
- Drag (mouse/touch) and wheel-over-container to scroll; ArrowLeft/Right keyboard nav
- Wheel is on container only (not window) so page scrolling is unaffected
- No lightbox — the circular gallery IS the experience
- `setupGalleryAnimations()` still runs for the "memories / Us." header animations (ScrollTrigger)

### Section 5 — Video strip
- Built from `CONFIG.videos` in `buildVideoStrip()`
- Infinite marquee: list duplicated (2×), `@keyframes marquee` `translateX(-50%) translateZ(0)`
- Duration: 45s; `will-change: transform` for GPU compositing
- Desktop: pauses on `mouseenter`, resumes on `mouseleave`
- Touch events removed from marquee (iOS `touchcancel` on scroll permanently froze it)
- Card width: 220px desktop, 200px mobile — `cardWidth` used in duplication formula
- Video lightbox: `#video-lightbox` — unmutes, pauses marquee while open

### Section 6 — Final message
- Custom Malay/English sentence in `buildFinalMessage()`
- Each word in `.word` span; desktop: staggered `setTimeout` 280ms; mobile: all revealed at once
- Triggered once by `IntersectionObserver` at `threshold: 0.3`
- Pulsing CSS heart: `.heart-beat` — each half exactly `W/2` wide so both halves pivot from same centre point (no gap)

---

## Accessibility & motion
- `prefers-reduced-motion`: detected once at top of `script.js` as `const prefersReducedMotion`
- If true: all transitions/animations skip to end state immediately; no `setTimeout` chains
- All interactive elements have `aria-label`; lightboxes have `role="dialog" aria-modal="true"`

---

## JS architecture
- `script.js` — regular script, runs synchronously. Sets `window.__loveConfig = CONFIG` immediately after CONFIG block so the ES module can read it
- `circular-gallery.js` — ES module (`<script type="module">`), deferred. Imports ogl from CDN. Initialises after DOM is ready
- `DOMContentLoaded` in script.js calls: `buildLetter → buildVideoStrip → buildFinalMessage → setupEnvelope → setupVideoLightbox → setupGalleryAnimations → setupFinalMessageObserver` (`buildGallery` and `setupLightbox` removed — replaced by circular gallery)
- `window.load` calls `ScrollTrigger.refresh()` for accurate measurements after fonts/images load
- `const isMobile = window.innerWidth < 768` — gates all complex GSAP animations
- `const prefersReducedMotion` — skips all animation when true
- State: `videoLightboxOpen` (boolean), `currentPhotoIndex` (number, unused now but kept)
- Scroll restoration: `history.scrollRestoration = 'manual'` + `window.scrollTo(0,0)` in an inline `<script>` in `<head>` — must stay there; doing it in body scripts is too late

---

## Change log

| Date | Change |
|---|---|
| 2026-06-28 | Initial build — single `index.html` |
| 2026-06-28 | Split into `index.html` + `style.css` + `script.js` |
| 2026-06-28 | Replaced CSS transition envelope animation with GSAP timeline. `#envelope-section` is now `position: fixed; z-index: 100` overlay. GSAP owns all transforms on `flap`, `peek`, `letterCard`, and `envelopeSection`. |
| 2026-06-28 | Added GSAP ScrollTrigger scroll-reveal to gallery section header + photo cards. |
| 2026-06-28 | iOS compatibility pass — webkit prefixes, `will-change`, `translateZ(0)` in marquee keyframes, `100svh` fallbacks, removed touch-pause from marquee, envelope exit uses `window.innerHeight` pixels, `ScrollTrigger.refresh()` on load. |
| 2026-06-28 | Scroll restoration fix — moved `history.scrollRestoration = 'manual'` and `window.scrollTo(0,0)` to inline `<script>` in `<head>`. Running it in body scripts was too late; browser had already restored scroll, causing ScrollTrigger to fire all animations at wrong positions. |
| 2026-06-28 | Desktop-first pass. Added `const isMobile = window.innerWidth < 768`. Mobile: instant envelope reveal, no ScrollTrigger gallery animations, no word stagger. Desktop: full GSAP. CSS: wider letter card (600px), bigger section titles (72px), taller photos (380px), larger envelope (300×208px), larger video cards (220×360px), bigger final message (56px). |
| 2026-06-28 | Replaced photo strip + lightbox with CircularGallery WebGL component. New file `circular-gallery.js` (ES module). Loads `ogl` from `https://esm.sh/ogl`. Reads photos from `window.__loveConfig`. Wheel scoped to container only. No text labels (empty string + null guard in `createTitle`). |
| 2026-06-28 | Fixed `.heart-beat` CSS gap — both pseudo-elements now exactly `W/2` wide with matching pivot points so the two halves join cleanly at the bottom tip. |
| 2026-06-29 | Content: photos expanded to photo1–photo9; videos expanded to video1–video5 (all MOV→MP4 via `avconvert --preset Preset1280x720`). Letter text and final message updated to Malay/English. Gallery header centred. |

# Love Site — UI Design Reference

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| Background | `#F7F0E6` | Page background (parchment) |
| Text | `#1A1A1A` | Body text (ink) |
| Accent | `#C97B7B` | Dusty rose — hearts, eyebrows, borders |
| Letter paper | `#FDF6EC` | Letter card background |
| Heading font | Playfair Display | Section titles, final message |
| Body font | Lato | Eyebrows, labels, scroll indicator |
| Handwriting font | Kalam | Letter body, signature |
| Mobile base | 390px | Design reference width |
| Desktop breakpoint | 768px | Grid and spacing switch |

---

## Section 1 — Envelope Landing

**Layout**: Full-viewport fixed overlay, flex column, centered

```
┌─────────────────────────────┐
│                             │
│      ┌───────────────┐      │
│      │   ╲  flap  ╱  │      │
│      │   ─────────   │      │
│      │   [  seal  ]  │      │
│      │               │      │
│      └───────────────┘      │
│                             │
│         tap to open         │
│                             │
└─────────────────────────────┘
```

**Envelope** (`#envelope`)
- Mobile: `260 × 180px` | Desktop: `300 × 208px`
- Background: `#F0E6D3`
- `border-radius: 4px`
- `box-shadow: 0 6px 30px rgba(0,0,0,0.15)`
- Built from 4 CSS shapes: left triangle, right triangle, bottom triangle (all `::after`/divs), top flap

**Flap** (`.envelope-flap`)
- Top triangle via `border-left/right/top` trick
- Color: `#DBC8B0`
- GSAP animates `rotationX: 0 → -180` around `transform-origin: top center`
- `-webkit-backface-visibility: hidden` to prevent face-flash on iOS

**Wax Seal** (`.envelope-seal`)
- `36px` circle, `background: #C97B7B`
- Heart drawn with `::before` + `::after` (two rounded rectangles)
- `box-shadow: 0 2px 8px rgba(201,123,123,0.5)`

**Letter Peek** (`.envelope-letter-peek`)
- `220px × 140px` (mobile), `256px × 160px` (desktop)
- `background: #FDF6EC`, `border-radius: 4px`
- GSAP animates `y: 60 → -30, opacity: 0 → 1`

**Bob animation**: `@keyframes envelope-bob` — `translateY(0 → -10px)`, 3s infinite

**Tap prompt**: Kalam 16px, `#999`, `@keyframes pulse-opacity` 0.5 → 1, 2.5s

---

## Section 2 — The Letter

**Layout**: `min-height: 100svh`, flex column, centered, `background: #F7F0E6`
- Mobile padding: `40px 20px 80px`
- Desktop padding: `80px 40px 100px`

```
┌────────────────────────────────┐
│ To: Sayang                     │
│                                │
│ Dear Sayang,                   │
│                                │
│ [letter body — Kalam font]     │
│                                │
│               With love, Amir  │
│                    ♥           │
└────────────────────────────────┘
        ∨  keep scrolling
```

**Letter Card** (`.letter-card`)
- Mobile: `max-width: 480px`, `padding: 32px 24px`
- Desktop: `max-width: 600px`, `padding: 56px 52px`
- `background: #FDF6EC`, `border-radius: 12px`
- `box-shadow: 0 8px 40px rgba(0,0,0,0.12)` (desktop: `0 12px 60px rgba(0,0,0,0.10)`)
- GSAP animates `y: 80 → 0, opacity: 0 → 1` on open

**Letter To** (`.letter-to`): Lato 13px, `#999`, `letter-spacing: 0.02em`

**Letter Body** (`.letter-body`): Kalam 18px (desktop 19px), `line-height: 1.9–2`, `#2A2A2A`

**Signature** (`.letter-signature`): Kalam 22px (desktop 24px), right-aligned, `margin-top: 32–40px`

**CSS Heart** (`.heart-shape`): `24 × 22px`, two rotated rectangles, `#C97B7B`

**Scroll Indicator** (`.scroll-indicator`)
- Bouncing CSS chevron (`.scroll-chevron`) + "keep scrolling" label
- Hidden by default, fades in after letter animation completes
- `@keyframes bounce-down` — `translateY(0 → 6px)`, 1s alternate

---

## Section 4 — Photo Gallery

**Layout**: `padding: 80px 0` (desktop: `100px 0`), `background: #F7F0E6`

```
        MEMORIES
        Us.
┌─────────────────────────────────────┐
│  [WebGL circular gallery canvas]    │
│   photos curve along an arc,        │
│   drag/scroll/arrow-key to browse   │
└─────────────────────────────────────┘
```

**Gallery Header** (`.gallery-header`)
- `text-align: center`
- Eyebrow: Lato 12px uppercase, `letter-spacing: 0.15em`, `#C97B7B`
- Title "Us.": Playfair Display 48px (desktop: 72px), `#1A1A1A`
- GSAP ScrollTrigger: eyebrow slides up (18px, 0.55s) → title drops in (50px, 0.85s)

**Circular Gallery Container** (`#circular-gallery-container`)
- Mobile: `height: 500px` | Desktop: `height: 620px`
- `width: 100%`, `position: relative`
- `ogl` WebGL canvas mounted inside by `circular-gallery.js`

**CircularGallery props in use**
- `bend: 3` (cards curve downward at edges)
- `borderRadius: 0.05` (rounded card corners in shader)
- `scrollEase: 0.02` (smooth, floaty momentum)
- `scrollSpeed: 2`
- `textColor: '#C97B7B'` (unused — text labels are empty)
- No text labels on photos

---

## Section 5 — Video Strip

**Layout**: `padding: 80px 0` (desktop: `100px 0`), `background: #F7F0E6`

```
        US, MOVING
        Moments.

← [vid] [vid] [vid] [vid] [vid] ← infinite scroll
```

**Video Header** (`.video-header`)
- Same eyebrow/title pattern as gallery
- Title "Moments.": 48px (desktop: 72px)
- Max-width `960px`, centered on desktop

**Marquee** (`.video-marquee-track`)
- `display: flex`, `gap: 16px`, `width: max-content`
- `@keyframes marquee`: `translateX(0) → translateX(-50%)`, 45s linear infinite
- `translateZ(0)` in keyframes for GPU compositing
- `will-change: transform`
- List is duplicated 2× in DOM so `-50%` lands exactly on loop point
- Number of duplicates: `Math.max(1, Math.ceil(1600 / (videoCount × cardWidth)))`

**Video Card** (`.video-card`)
- Mobile: `200 × 320px` | Desktop: `220 × 360px`
- `border-radius: 12px`, `overflow: hidden`
- Play icon overlay: circle (`48px`, `rgba(255,255,255,0.25)`) + CSS triangle

**Hover behaviour**: `mouseenter` → pauses marquee; `mouseleave` → resumes (desktop only)

**Video Lightbox** (`#video-lightbox`)
- `position: fixed; inset: 0`, `background: rgba(0,0,0,0.95)`
- Video `max-width: 90vw`, `max-height: 85vh`
- Opens with audio unmuted; marquee pauses while open

---

## Section 6 — Final Message

**Layout**: `min-height: 100svh`, flex column, centered, `padding: 40px 24px`

```
        Im sorry sayang :(
      i love you so much sayang.
  Sayang kamu hingga akhir hayat saya

                  ♥
```

**Final Message** (`.final-message`)
- Playfair Display
- Mobile: `28px`, `max-width: 320px`
- Desktop: `56px`, `max-width: 720px`
- `line-height: 1.5`, `text-align: center`
- Each word in `.word` span, `opacity: 0 → 1` (`transition: 0.4s ease`)
- Desktop: staggered reveal, 280ms per word
- Mobile: all words shown at once when section enters viewport

**Pulsing Heart** (`.heart-beat`)
- Desktop: `52 × 48px` | Mobile: `40 × 36px`
- Two pseudo-elements, each exactly `W/2` wide — both pivot from `x = W/2` so the bottom tip joins cleanly
- `@keyframes heartbeat`: `scale(1 → 1.15)`, 0.8s alternate infinite

---

## Shared Components

### Section Eyebrow (`.section-eyebrow`)
- Lato 12px, uppercase, `letter-spacing: 0.15em`, `#C97B7B`
- `display: block`, `margin-bottom: 12px`

### Section Title (`.section-title`)
- Playfair Display, `#1A1A1A`
- Base: 48px | Desktop: 72px

### CSS Hearts
Two variants used across the site:

| Class | Size | Location |
|---|---|---|
| `.heart-shape` | `24 × 22px` | Bottom of letter card |
| `.envelope-seal::before/after` | `10px circles` | Wax seal on envelope |
| `.heart-beat` | `40–52px` | Final message section |

All hearts: two rotated rectangles with `border-radius`, `background: #C97B7B`

### CSS Chevrons
Used for lightbox nav and scroll indicator — no SVG, no icon fonts:

| Class | Shape |
|---|---|
| `.chevron-left` | `border-top + border-left`, rotated -45° |
| `.chevron-right` | `border-top + border-right`, rotated 45° |
| `.chevron-x` | Two `::before/after` bars at ±45° |
| `.scroll-chevron` | Same as `.chevron-right` but pointing down |

---

## Animation Summary

| Element | Type | Trigger | Duration |
|---|---|---|---|
| Envelope bob | CSS `@keyframes` | Always | 3s infinite |
| Tap prompt | CSS `@keyframes` | Always | 2.5s infinite |
| Flap open | GSAP `rotationX` | Click (desktop) | 0.65s |
| Letter peek | GSAP `y + opacity` | Click (desktop) | 0.55s |
| Envelope exit | GSAP `y` | Click (desktop) | 0.85s |
| Letter card rise | GSAP `y + opacity` | Click (desktop) | 0.80s |
| Gallery eyebrow | GSAP ScrollTrigger | Scroll to 82% | 0.55s |
| Gallery title | GSAP ScrollTrigger | Scroll to 82% | 0.85s |
| Video marquee | CSS `@keyframes` | Always | 45s infinite |
| Final words | `setTimeout` stagger | IntersectionObserver 30% | 280ms/word |
| Heart pulse | CSS `@keyframes` | Always | 0.8s alternate |

**Mobile overrides**: Envelope → instant; Gallery ScrollTrigger → skipped; Word stagger → instant

---

## Responsive Behaviour

| Feature | Mobile (< 768px) | Desktop (≥ 768px) |
|---|---|---|
| Envelope | 260 × 180px, instant open | 300 × 208px, full GSAP |
| Letter card | 480px max, 32px padding | 600px max, 56px padding |
| Gallery | 500px canvas height | 620px canvas height |
| Gallery title | 40px | 72px |
| Video cards | 200 × 320px | 220 × 360px |
| Final message | 28px, 320px wide | 56px, 720px wide |
| Animations | Simplified/disabled | Full GSAP |
| Marquee pause | No touch pause | Hover pause |

/* ─── CONFIG BLOCK ───────────────────────────────────────────────────────
   This is the only block you need to edit to personalise the site.
─────────────────────────────────────────────────────────────────────────── */
const CONFIG = {
  recipientName: "Sayang",
  senderName: "Amir",
  letterText: `Dear Sayang,\n\nSayang, saya minta maaf dengan apa yang jadi semalam, sejujurnya memang salah saya sebab tak bagi kamu ruang untuk explain and just bertindak ikut emosi saya, saya minta maaf sangat ii sayang.\n\nSaya harap, sayang kamu tak berkurang dekat saya lepas apa yang jadi.. Saya janji dengan kamu, saya akan jadi lebih baik untuk kamu sayang ya, and if sayang still ada rasa sayang sikittt pun dekat saya, I hope we can work on this together and I want you to know that you're the one I want to be with for the rest of my life. I love you soo much sayang. ❤️`,
  photos: [
    "photos/photo1.jpg",
    "photos/photo2.jpg",
    "photos/photo3.jpg",
    "photos/photo4.jpg",
    "photos/photo5.jpg",
    "photos/photo6.jpg",
    "photos/photo7.jpg",
    "photos/photo8.jpg",
    "photos/photo9.jpg"
  ],
  videos: [
    "videos/video1.mp4",
    "videos/video2.mp4",
    "videos/video3.mp4",
    "videos/video4.mp4",
    "videos/video5.mp4"
  ]
};

// Expose CONFIG for circular-gallery.js (an ES module — it can't share
// const-scope variables with regular scripts, only window properties)
window.__loveConfig = CONFIG;

/* ─── GSAP PLUGINS ────────────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ─── REDUCED MOTION DETECTION ────────────────────────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── DEVICE TIER ─────────────────────────────────────────────────────── */
/* Desktop gets the full polished GSAP experience. Mobile gets safe fallbacks
   that keep content visible without risking broken animations. */
const isMobile = window.innerWidth < 768;

/* ─── MAIN INIT ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  buildLetter();
  // buildGallery() removed — photo section now uses CircularGallery (circular-gallery.js)
  buildVideoStrip();
  buildFinalMessage();
  setupEnvelope();
  // setupLightbox() removed — lightbox HTML is removed; CircularGallery handles its own interaction
  setupVideoLightbox();
  setupGalleryAnimations();  // still runs header eyebrow + title animations
  setupFinalMessageObserver();
});

/* Refresh ScrollTrigger after everything (fonts, images) has loaded so its
   scroll position measurements are accurate on iOS. */
window.addEventListener('load', function () {
  ScrollTrigger.refresh();
});

/* ─── BUILD LETTER ────────────────────────────────────────────────────── */
/* Populates the letter card from CONFIG */
function buildLetter() {
  document.getElementById('letter-to').textContent = 'To: ' + CONFIG.recipientName;
  document.getElementById('letter-signature').textContent = 'With love, ' + CONFIG.senderName;

  const body = document.getElementById('letter-body');
  // Split on \n and render each line as a <p>
  const lines = CONFIG.letterText.split('\n');
  lines.forEach(function (line) {
    const p = document.createElement('p');
    p.textContent = line;
    body.appendChild(p);
  });
}

/* ─── BUILD GALLERY ───────────────────────────────────────────────────── */
/* Builds photo strip from CONFIG.photos; hides section if empty */
function buildGallery() {
  const strip = document.getElementById('photo-strip');
  const section = document.getElementById('gallery-section');

  if (!CONFIG.photos || CONFIG.photos.length === 0) {
    section.classList.add('hidden-section');
    return;
  }

  CONFIG.photos.forEach(function (src, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'photo-item';
    wrapper.setAttribute('role', 'listitem');
    wrapper.dataset.index = index;

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Memory ' + (index + 1);
    img.loading = 'lazy';

    wrapper.appendChild(img);
    strip.appendChild(wrapper);

    // Open lightbox on click
    wrapper.addEventListener('click', function () {
      openLightbox(index);
    });
  });
}

/* ─── GALLERY SCROLL ANIMATIONS ──────────────────────────────────────── */
/* GSAP ScrollTrigger: header wipes in, then photos stagger up on scroll */
function setupGalleryAnimations() {
  if (prefersReducedMotion) return;
  if (!CONFIG.photos || CONFIG.photos.length === 0) return;

  // Mobile: skip ScrollTrigger entirely. Items are visible via CSS defaults.
  // This prevents GSAP from setting opacity:0 on items that might never animate
  // correctly if ScrollTrigger measurements are wrong on the first scroll.
  if (isMobile) return;

  // Eyebrow "MEMORIES" slides up first
  gsap.from('#gallery-section .section-eyebrow', {
    scrollTrigger: {
      trigger: '#gallery-section',
      start: 'top 82%',
      once: true
    },
    y: 18,
    opacity: 0,
    duration: 0.55,
    ease: 'power2.out'
  });

  // "Us." title drops in after eyebrow
  gsap.from('#gallery-section .section-title', {
    scrollTrigger: {
      trigger: '#gallery-section',
      start: 'top 82%',
      once: true
    },
    y: 50,
    opacity: 0,
    duration: 0.85,
    ease: 'power3.out',
    delay: 0.14
  });

  // Photo cards stagger up with a subtle scale, triggered when strip enters view
  gsap.from('.photo-item', {
    scrollTrigger: {
      trigger: '.photo-strip',
      start: 'top 88%',
      once: true
    },
    y: 55,
    opacity: 0,
    scale: 0.93,
    duration: 0.72,
    stagger: 0.1,
    ease: 'power3.out'
  });
}

/* ─── BUILD VIDEO STRIP ───────────────────────────────────────────────── */
/* Builds the infinite marquee strip; duplicates the list for seamless loop */
function buildVideoStrip() {
  const track = document.getElementById('video-marquee-track');
  const section = document.getElementById('video-section');

  if (!CONFIG.videos || CONFIG.videos.length === 0) {
    section.classList.add('hidden-section');
    return;
  }

  // Build cards and then duplicate the entire set
  function buildSet() {
    return CONFIG.videos.map(function (src) {
      const card = document.createElement('div');
      card.className = 'video-card';

      const vid = document.createElement('video');
      vid.src = src;
      vid.autoplay = true;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      // Both attribute and property forms needed for iOS Safari
      vid.setAttribute('autoplay', '');
      vid.setAttribute('muted', '');
      vid.setAttribute('loop', '');
      vid.setAttribute('playsinline', '');

      const overlay = document.createElement('div');
      overlay.className = 'video-play-overlay';
      const circle = document.createElement('div');
      circle.className = 'play-circle';
      const triangle = document.createElement('div');
      triangle.className = 'play-triangle';
      circle.appendChild(triangle);
      overlay.appendChild(circle);

      card.appendChild(vid);
      card.appendChild(overlay);

      // Open video lightbox on click/tap
      card.addEventListener('click', function () {
        openVideoLightbox(src);
      });

      return card;
    });
  }

  // Fill at least 1600px before duplicating so the scroll is visible
  // even with very few videos. Desktop card = 220px + 16px gap = 236px;
  // mobile card = 200px + 16px gap = 216px.
  var cardWidth = isMobile ? 216 : 236;
  var setsPerHalf = Math.max(1, Math.ceil(1600 / (CONFIG.videos.length * cardWidth)));

  for (var i = 0; i < setsPerHalf; i++) {
    buildSet().forEach(function (card) { track.appendChild(card); });
  }
  // Identical second half — CSS translateX(-50%) lands exactly on loop point
  for (var j = 0; j < setsPerHalf; j++) {
    buildSet().forEach(function (card) { track.appendChild(card); });
  }

  // Desktop hover: pause marquee while mouse is over it.
  // Touch events are intentionally NOT used here — on iOS, touchstart fires
  // during vertical page scroll (finger passes over the strip) and
  // touchcancel fires instead of touchend when the scroll gesture is captured,
  // permanently freezing the marquee. Tapping a card triggers click directly.
  var container = document.getElementById('video-marquee-container');
  container.addEventListener('mouseenter', function () {
    track.classList.add('paused');
  });
  container.addEventListener('mouseleave', function () {
    if (!videoLightboxOpen) track.classList.remove('paused');
  });
}

/* ─── BUILD FINAL MESSAGE ─────────────────────────────────────────────── */
/* Prepares word spans; animation triggered by Intersection Observer */
function buildFinalMessage() {
  const el = document.getElementById('final-message');
  const sentence = "Im sorry sayang :( i love you so much sayang. Sayang kamu hingga akhir hayat saya";
  const words = sentence.split(' ');

  words.forEach(function (word, i) {
    const span = document.createElement('span');
    span.className = 'word';
    // Add a trailing space after each word except the last
    span.textContent = word + (i < words.length - 1 ? ' ' : '');
    el.appendChild(span);
  });
}

/* ─── ENVELOPE OPEN SEQUENCE ──────────────────────────────────────────── */
/* GSAP timeline: flap flips → letter peeks → envelope slides off top → letter rises */
function setupEnvelope() {
  const envelope = document.getElementById('envelope');
  const wrapper = document.getElementById('envelope-wrapper');
  const flap = document.getElementById('envelope-flap');
  const peek = document.getElementById('letter-peek');
  const envelopeSection = document.getElementById('envelope-section');
  const letterSection = document.getElementById('letter-section');
  const letterCard = document.getElementById('letter-card');

  // Set GSAP initial states so elements start in the right position.
  // peek starts tucked inside the envelope; the y value accounts for the
  // envelope height (208px desktop / 180px mobile) minus some overlap.
  gsap.set(flap, { transformOrigin: 'top center', transformPerspective: 600, rotationX: 0 });
  gsap.set(peek, { y: isMobile ? 60 : 70, opacity: 0 });
  gsap.set(letterCard, { y: 80, opacity: 0 });

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    // Mobile: skip the GSAP 3D sequence — just instant-reveal the letter.
    // The envelope tap still feels intentional; the GSAP sequence is what caused
    // flicker and timing issues on iPhone. Content remains fully accessible.
    if (prefersReducedMotion || isMobile) {
      envelopeSection.classList.add('hidden');
      letterSection.classList.add('visible');
      gsap.set(letterCard, { y: 0, opacity: 1 });
      showScrollIndicator();
      return;
    }

    // Stop the CSS bob animation
    wrapper.classList.add('opening');

    const tl = gsap.timeline();

    // 1. Flap rotates open with a 3D flip
    tl.to(flap, {
      rotationX: -180,
      duration: 0.65,
      ease: 'power2.inOut'
    })

    // 2. Letter peeks up from inside the envelope (overlaps with flap end)
    .to(peek, {
      y: -30,
      opacity: 1,
      duration: 0.55,
      ease: 'back.out(1.4)'
    }, '-=0.3')

    // 3. Brief hold so the peek reads, then reveal the letter section
    .add(function () {
      letterSection.classList.add('visible');
    }, '+=0.2')

    // 4. Envelope slides UP off the viewport — use window.innerHeight in pixels
    //    instead of '-100vh' because iOS Safari measures vh differently when
    //    the address bar is visible vs hidden, which could leave a sliver.
    .to(envelopeSection, {
      y: -(window.innerHeight + 100),
      duration: 0.85,
      ease: 'power3.inOut',
      onComplete: function () {
        envelopeSection.classList.add('hidden');
      }
    })

    // 5. Letter card rises up as the envelope lifts away (overlaps the exit)
    .to(letterCard, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6')

    // 6. Scroll indicator after everything settles
    .call(showScrollIndicator, null, '+=0.8');
  }

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });
}

/* Show the scroll indicator below the letter */
function showScrollIndicator() {
  const indicator = document.getElementById('scroll-indicator');
  indicator.classList.add('visible');
}

/* ─── PHOTO LIGHTBOX ──────────────────────────────────────────────────── */
/* Manages the full-screen photo viewer */
let currentPhotoIndex = 0;

function setupLightbox() {
  const lb = document.getElementById('lightbox');
  const prev = document.getElementById('lb-prev');
  const next = document.getElementById('lb-next');
  const close = document.getElementById('lb-close');

  // Close on background click (not on image click)
  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLightbox();
  });

  close.addEventListener('click', closeLightbox);
  prev.addEventListener('click', function () { shiftPhoto(-1); });
  next.addEventListener('click', function () { shiftPhoto(1); });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  shiftPhoto(-1);
    if (e.key === 'ArrowRight') shiftPhoto(1);
    if (e.key === 'Escape')     closeLightbox();
  });
}

function openLightbox(index) {
  currentPhotoIndex = index;
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = CONFIG.photos[index];
  img.alt = 'Memory ' + (index + 1);
  lb.style.display = 'flex';
  // Force reflow then add class for transition
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      lb.classList.add('open');
    });
  });
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  setTimeout(function () { lb.style.display = 'none'; }, 300);
}

function shiftPhoto(direction) {
  const total = CONFIG.photos.length;
  currentPhotoIndex = (currentPhotoIndex + direction + total) % total;
  const img = document.getElementById('lightbox-img');
  img.src = CONFIG.photos[currentPhotoIndex];
  img.alt = 'Memory ' + (currentPhotoIndex + 1);
}

/* ─── VIDEO LIGHTBOX ──────────────────────────────────────────────────── */
/* Manages the full-screen video player */
let videoLightboxOpen = false;

function setupVideoLightbox() {
  const vl = document.getElementById('video-lightbox');
  const closeBtn = document.getElementById('vl-close');

  // Close on background click
  vl.addEventListener('click', function (e) {
    if (e.target === vl) closeVideoLightbox();
  });

  closeBtn.addEventListener('click', closeVideoLightbox);

  document.addEventListener('keydown', function (e) {
    if (!vl.classList.contains('open')) return;
    if (e.key === 'Escape') closeVideoLightbox();
  });
}

function openVideoLightbox(src) {
  const vl = document.getElementById('video-lightbox');
  const player = document.getElementById('video-lightbox-player');
  const track = document.getElementById('video-marquee-track');

  player.src = src;
  player.muted = false;
  player.play();

  vl.style.display = 'flex';
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      vl.classList.add('open');
    });
  });

  // Pause the marquee while lightbox is open
  videoLightboxOpen = true;
  if (track) track.classList.add('paused');
}

function closeVideoLightbox() {
  const vl = document.getElementById('video-lightbox');
  const player = document.getElementById('video-lightbox-player');
  const track = document.getElementById('video-marquee-track');

  vl.classList.remove('open');
  player.pause();
  player.src = '';

  setTimeout(function () { vl.style.display = 'none'; }, 300);

  videoLightboxOpen = false;
  if (track) track.classList.remove('paused');
}

/* ─── FINAL MESSAGE OBSERVER ──────────────────────────────────────────── */
/* Triggers word-by-word reveal when the final section enters viewport */
function setupFinalMessageObserver() {
  const section = document.getElementById('final-section');

  if (!window.IntersectionObserver) {
    revealFinalWords();
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        revealFinalWords();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}

/* Reveals each word in the final message with a staggered setTimeout */
function revealFinalWords() {
  const words = document.querySelectorAll('#final-message .word');

  // Mobile: reveal all words at once. The stagger relies on IntersectionObserver
  // firing at the right moment — on mobile scroll momentum this is unreliable.
  if (prefersReducedMotion || isMobile) {
    words.forEach(function (w) { w.classList.add('visible'); });
    return;
  }

  words.forEach(function (word, index) {
    setTimeout(function () {
      word.classList.add('visible');
    }, index * 280);
  });
}

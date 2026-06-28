/* ─── CONFIG BLOCK ───────────────────────────────────────────────────────
   This is the only block you need to edit to personalise the site.
─────────────────────────────────────────────────────────────────────────── */
const CONFIG = {
  recipientName: "Sarah",
  senderName: "Amir",
  letterText: `Dear Sarah,\n\nI know yesterday wasn't my best moment. I've been sitting with it and I want you to know I'm truly sorry. You deserve better from me and I promise I'm going to do better. You mean everything to me.`,
  reasons: [
    "The way you laugh at your own jokes before you finish telling them",
    "How you always check if I've eaten when I'm too busy to remember",
    "The way you look when you don't know I'm watching",
    "That you put up with me even when I make it hard",
    "Everything about you that I get to wake up knowing"
  ],
  photos: [
    "photos/photo1.jpg",
    "photos/photo2.jpg",
    "photos/photo3.jpg",
    "photos/photo4.jpg",
    "photos/photo5.jpg",
    "photos/photo6.jpg"
  ],
  videos: [
    "videos/video1.mp4",
    "videos/video2.mp4",
    "videos/video3.mp4"
  ]
};

/* ─── REDUCED MOTION DETECTION ────────────────────────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── MAIN INIT ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  buildLetter();
  buildReasons();
  buildGallery();
  buildVideoStrip();
  buildFinalMessage();
  setupEnvelope();
  setupLightbox();
  setupVideoLightbox();
  setupReasonObserver();
  setupFinalMessageObserver();
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

/* ─── BUILD REASONS ───────────────────────────────────────────────────── */
/* Creates one card per reason from CONFIG.reasons */
function buildReasons() {
  const list = document.getElementById('reasons-list');

  if (!CONFIG.reasons || CONFIG.reasons.length === 0) {
    document.getElementById('reasons-section').classList.add('hidden-section');
    return;
  }

  CONFIG.reasons.forEach(function (reason, index) {
    const li = document.createElement('li');
    li.className = 'reason-card';

    const num = document.createElement('span');
    num.className = 'reason-number';
    num.textContent = (index + 1).toString().padStart(2, '0') + '.';

    const text = document.createElement('p');
    text.className = 'reason-text';
    text.textContent = reason;

    li.appendChild(num);
    li.appendChild(text);
    list.appendChild(li);
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
      vid.setAttribute('playsinline', '');
      vid.setAttribute('muted', '');

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

      // Open video lightbox on click
      card.addEventListener('click', function () {
        openVideoLightbox(src);
      });

      return card;
    });
  }

  // Add two copies so the CSS marquee loops seamlessly
  buildSet().forEach(function (card) { track.appendChild(card); });
  buildSet().forEach(function (card) { track.appendChild(card); });

  // Pause on hover/touch, resume on leave
  const container = document.getElementById('video-marquee-container');
  container.addEventListener('mouseenter', function () {
    track.classList.add('paused');
  });
  container.addEventListener('mouseleave', function () {
    // Only resume if video lightbox is closed
    if (!videoLightboxOpen) track.classList.remove('paused');
  });
  container.addEventListener('touchstart', function () {
    track.classList.add('paused');
  }, { passive: true });
  container.addEventListener('touchend', function () {
    if (!videoLightboxOpen) track.classList.remove('paused');
  });
}

/* ─── BUILD FINAL MESSAGE ─────────────────────────────────────────────── */
/* Prepares word spans; animation triggered by Intersection Observer */
function buildFinalMessage() {
  const el = document.getElementById('final-message');
  const sentence = "I'm sorry. I love you. That will never change.";
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
/* Handles the multi-step envelope open animation */
function setupEnvelope() {
  const envelope = document.getElementById('envelope');
  const wrapper = document.getElementById('envelope-wrapper');
  const flap = document.getElementById('envelope-flap');
  const peek = document.getElementById('letter-peek');
  const envelopeSection = document.getElementById('envelope-section');
  const letterSection = document.getElementById('letter-section');
  const letterCard = document.getElementById('letter-card');

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    if (prefersReducedMotion) {
      // Skip directly to letter
      envelopeSection.classList.add('hidden');
      letterSection.classList.add('visible');
      letterCard.classList.add('revealed');
      showScrollIndicator();
      return;
    }

    // Step 1: Stop bob animation, open the flap
    wrapper.classList.add('opening');
    flap.classList.add('open');

    // Step 2: Letter peek slides up after 0.4s
    setTimeout(function () {
      peek.classList.add('visible');
    }, 400);

    // Step 3: Show letter section, then fade envelope out after letter appears
    setTimeout(function () {
      letterSection.classList.add('visible');
      // Slight stagger then reveal the card
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          letterCard.classList.add('revealed');
        });
      });

      // Fade and shrink envelope
      setTimeout(function () {
        envelopeSection.classList.add('fade-out');
        setTimeout(function () {
          envelopeSection.classList.add('hidden');
        }, 500);
      }, 300);

      // Show scroll indicator after letter is comfortably visible
      setTimeout(showScrollIndicator, 1500);
    }, 1200);
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

/* ─── REASON CARDS OBSERVER ───────────────────────────────────────────── */
/* Triggers fade-in animation for each reason card as it enters viewport */
function setupReasonObserver() {
  if (!window.IntersectionObserver) {
    // Fallback: reveal all immediately
    document.querySelectorAll('.reason-card').forEach(function (card) {
      card.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (prefersReducedMotion) {
          entry.target.style.transition = 'none';
        }
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reason-card').forEach(function (card) {
    observer.observe(card);
  });
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

  if (prefersReducedMotion) {
    words.forEach(function (w) { w.classList.add('visible'); });
    return;
  }

  words.forEach(function (word, index) {
    setTimeout(function () {
      word.classList.add('visible');
    }, index * 280);
  });
}

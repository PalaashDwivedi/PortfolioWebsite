'use strict';

/* ═══════════════════════════════════════════════════════════════
   PALAASH DWIVEDI — PORTFOLIO  |  Script.js
   Phase 4: Three.js terrain + crosshair cursor
            + nav scroll class, mobile menu, modal
   Phase 5: fade transitions, glitch-in, stat bars, scan line
   ═══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────
   THREE.JS WIREFRAME TERRAIN
   ────────────────────────────────────────────────────────────── */
function initTerrain() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth < 768;

  /* ── Scene ── */
  const scene = new THREE.Scene();
  // Fog colour matches --bg so the terrain fades naturally at distance
  scene.fog = new THREE.Fog(0x0c0d10, 18, 42);

  /* ── Camera ──
     Positioned above and behind, looking forward and down —
     classic game-engine viewport / low-altitude flyover feel  */
  const getSize = () => ({
    w: canvas.clientWidth  || window.innerWidth,
    h: canvas.clientHeight || window.innerHeight,
  });

  const { w, h } = getSize();
  const camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 60);
  camera.position.set(0, 5, 10);
  camera.lookAt(new THREE.Vector3(0, 0, -8));

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:     true,
    antialias: !isMobile,
  });
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0); // transparent — CSS bg shows through

  /* ── Terrain geometry ──
     PlaneGeometry rotated flat; vertices animated each frame
     with overlapping sine waves for an organic undulation.     */
  const segments = isMobile ? 28 : 55;
  const geometry = new THREE.PlaneGeometry(60, 60, segments, segments);
  geometry.rotateX(-Math.PI / 2); // lay flat

  const material = new THREE.MeshBasicMaterial({
    color:       0x00d4ff,  // --cyan
    wireframe:   true,
    transparent: true,
    opacity:     isMobile ? 0.12 : 0.18,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  /* ── Animate vertices ── */
  let time = 0;
  const posAttr = geometry.attributes.position;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.007;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Three overlapping waves — different frequencies & speeds
      const y =
        Math.sin(x * 0.38 + time)          * 0.55 +
        Math.sin(z * 0.32 + time * 0.75)   * 0.45 +
        Math.sin((x + z) * 0.22 + time * 0.5) * 0.3;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  /* ── Resize handler ── */
  window.addEventListener('resize', () => {
    const { w: nw, h: nh } = getSize();
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh, false);
  });
}

/* ──────────────────────────────────────────────────────────────
   CROSSHAIR CURSOR
   ────────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  // Skip on touch-only devices (CSS already restores default cursor)
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  /* Track exact mouse position — crosshairs don't lag behind */
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  /* Hide when pointer leaves the viewport */
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  /* Expand crosshair lines when hovering interactive elements.
     Event delegation — works for any dynamically added elements too. */
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .cert-highlight, .cert-item, .project-feature, [role="button"]')) {
      cursor.classList.add('cursor-expanded');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .cert-highlight, .cert-item, .project-feature, [role="button"]')) {
      cursor.classList.remove('cursor-expanded');
    }
  });

  /* Compress briefly on click for tactile feel */
  document.addEventListener('mousedown', () => cursor.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('cursor-click'));
}

/* ──────────────────────────────────────────────────────────────
   NAVBAR — scroll class
   ────────────────────────────────────────────────────────────── */
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ──────────────────────────────────────────────────────────────
   MOBILE MENU
   ────────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const btn   = document.getElementById('mobileMenuBtn');
  const menu  = document.getElementById('mobileMenu');
  const close = document.getElementById('mobileMenuClose');
  if (!btn || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    menu.removeAttribute('aria-hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  if (close) close.addEventListener('click', closeMenu);

  // Close on any mobile nav link click
  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
}

/* ──────────────────────────────────────────────────────────────
   CERTIFICATE MODAL
   ────────────────────────────────────────────────────────────── */
function initModal() {
  const modal    = document.getElementById('certificateModal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = document.getElementById('modalClose');
  if (!modal || !modalImg) return;

  function openModal(src, alt) {
    modalImg.src = src;
    modalImg.alt = alt || 'Certificate';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    // Clear src after transition so image doesn't flash on next open
    setTimeout(() => { modalImg.src = ''; }, 300);
  }

  // Cert highlight (award block)
  document.querySelectorAll('.cert-highlight').forEach(el => {
    el.addEventListener('click', () => {
      const img = el.querySelector('.cert-thumb');
      if (img) openModal(img.src, img.alt);
    });
  });

  // Individual cert items
  document.querySelectorAll('.cert-item').forEach(el => {
    el.addEventListener('click', () => {
      const img = el.querySelector('.cert-item-img');
      if (img) openModal(img.src, img.alt);
    });
  });

  // Close via button or backdrop click
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });
}

/* ──────────────────────────────────────────────────────────────
   INIT — run everything once the DOM is ready
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTerrain();
  initCursor();
  initNavScroll();
  initMobileMenu();
  initModal();
  initFadeTransitions();
  initGlitchIn();
  initStatBars();
  initScanLines();
  initNavActive();
});

/* ──────────────────────────────────────────────────────────────
   FADE-TO-BLACK NAV TRANSITIONS
   Intercepts every [data-scroll] link, fades to black, scrolls
   to the target (while screen is black), then fades back in.
   ────────────────────────────────────────────────────────────── */
function initFadeTransitions() {
  const overlay = document.getElementById('fade-overlay');
  if (!overlay) return;

  const FADE_MS = 340; // must match CSS transition duration on #fade-overlay

  document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // 1 — fade to black
      overlay.classList.add('fade-in');

      setTimeout(() => {
        // 2 — scroll while screen is black (instant, no jank visible)
        target.scrollIntoView({ behavior: 'instant', block: 'start' });

        // Small buffer so layout settles before revealing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 3 — fade back in
            overlay.classList.remove('fade-in');
          });
        });
      }, FADE_MS);
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   GLITCH-IN SCROLL ANIMATIONS
   Every .glitch-target starts invisible (CSS: opacity 0).
   When it enters the viewport the observer adds .glitch-visible,
   triggering the glitchIn keyframe defined in styles.css.
   Siblings within the same parent get a small stagger delay so
   they don't all fire at exactly the same moment.
   ────────────────────────────────────────────────────────────── */
function initGlitchIn() {
  const targets = document.querySelectorAll('.glitch-target');
  if (!targets.length) return;

  // Pre-compute stagger delays: siblings share a parent, each gets
  // +90ms per index so they cascade visually.
  const seen = new Set();
  targets.forEach(el => {
    const parent = el.parentElement;
    if (seen.has(parent)) return;
    seen.add(parent);

    const kids = Array.from(parent.querySelectorAll(':scope > .glitch-target'));
    kids.forEach((child, i) => {
      child._glitchDelay = i * 90;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el); // animate once only
      setTimeout(
        () => el.classList.add('glitch-visible'),
        el._glitchDelay || 0
      );
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });

  targets.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────────
   STAT BAR FILL ANIMATION  (Education section)
   Bars start at width: 0 (CSS default).
   When the stat container enters the viewport, each bar expands
   to its data-value percentage with a staggered delay.
   ────────────────────────────────────────────────────────────── */
function initStatBars() {
  const container = document.querySelector('.edu-stats');
  const bars = document.querySelectorAll('.stat-bar');
  if (!container || !bars.length) return;

  let fired = false;

  const observer = new IntersectionObserver((entries) => {
    if (fired || !entries[0].isIntersecting) return;
    fired = true;
    observer.disconnect();

    bars.forEach((bar, i) => {
      const value = parseFloat(bar.dataset.value) || 0;
      setTimeout(() => {
        bar.style.width = value + '%';
      }, 200 + i * 140); // initial pause + stagger per bar
    });
  }, { threshold: 0.35 });

  observer.observe(container);
}

/* ──────────────────────────────────────────────────────────────
   PROJECT HOVER SCAN LINE
   On mouseenter a bright 3px line sweeps from the top of the
   image to the bottom, then disappears — like a game scanning
   an object. Resets on mouseleave so it can fire again.
   ────────────────────────────────────────────────────────────── */
function initScanLines() {
  document.querySelectorAll('.project-feature').forEach(feature => {
    const scanLine = feature.querySelector('.project-scan-line');
    const imgWrap  = feature.querySelector('.project-img-wrap');
    if (!scanLine || !imgWrap) return;

    let sweeping = false;

    feature.addEventListener('mouseenter', () => {
      if (sweeping) return;
      sweeping = true;

      const travelPx = imgWrap.offsetHeight + 8;
      const DURATION = 580; // ms for the full sweep

      // Snap to top, make visible
      scanLine.style.transition = 'none';
      scanLine.style.transform  = 'translateY(0)';
      scanLine.style.opacity    = '1';

      // One rAF to let the reset paint, then start the sweep
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scanLine.style.transition = `transform ${DURATION}ms linear`;
          scanLine.style.transform  = `translateY(${travelPx}px)`;

          setTimeout(() => {
            // Fade out, reset silently so it's ready for next hover
            scanLine.style.transition = 'opacity 0.15s ease';
            scanLine.style.opacity    = '0';

            setTimeout(() => {
              scanLine.style.transition = 'none';
              scanLine.style.transform  = 'translateY(0)';
              sweeping = false;
            }, 160);
          }, DURATION);
        });
      });
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   NAV ACTIVE SECTION TRACKING
   Highlights the matching nav link as the user scrolls through
   sections. Uses IntersectionObserver with a top rootMargin
   offset matching the fixed nav height so the active link
   switches right when the section reaches the nav, not before.
   ────────────────────────────────────────────────────────────── */
function initNavActive() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  // Map section id → nav link element for O(1) lookup
  const linkMap = {};
  navLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) linkMap[id] = link;
  });

  function setActive(id) {
    navLinks.forEach(l => l.classList.remove('active'));
    if (linkMap[id]) linkMap[id].classList.add('active');
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, {
    // Shrink the observable area: top edge offset = nav height,
    // bottom threshold = middle of the viewport
    rootMargin: '-68px 0px -45% 0px',
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}

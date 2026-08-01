// ============================================================
// ACM NMIMS — Micro-Pixel Scroll Scrubbing Controller
// 60FPS RAF Lerp, Three.js 3D Constellation & Single-Viewport Stage
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- AOS Init ----
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      once: true,
      offset: 40,
      delay: 0,
    });
  }

  // ============================================================
  // CONTINUOUS MICRO-PIXEL SCROLL SCRUBBER ENGINE
  // ============================================================
  const pinnedWrapper = document.getElementById('pinned-wrapper');
  const slides = [...document.querySelectorAll('.content-slide')];
  const navBtns = [...document.querySelectorAll('#header-nav-list .nav-link')];
  const mobileNavBtns = [...document.querySelectorAll('.mobile-nav-btn')];
  const sideDots = [...document.querySelectorAll('#side-indicator-container .indicator-dot')];
  const hudCounter = document.getElementById('hud-view-counter');

  let rawProgress = 0;
  let smoothProgress = 0;
  let countersTriggered = false;

  if (pinnedWrapper && slides.length > 0) {
    const N = slides.length;

    // Read exact window scroll offset for continuous progress
    function updateScrollProgress() {
      const rect = pinnedWrapper.getBoundingClientRect();
      const scrollable = pinnedWrapper.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      if (rect.top <= 0 && Math.abs(rect.top) <= scrollable) {
        rawProgress = Math.abs(rect.top) / scrollable;
      } else if (rect.top > 0) {
        rawProgress = 0;
      } else {
        rawProgress = 1;
      }
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // 60FPS RAF loop for micro-pixel smooth lerping
    function renderFrame() {
      smoothProgress += (rawProgress - smoothProgress) * 0.08;

      const step = 1 / (N - 1);

      slides.forEach((slide, i) => {
        const center = i * step;
        const diff = smoothProgress - center;
        const norm = diff / step; // -1..0 = entering, 0..1 = exiting

        let opacity = 0;
        let ty = 0;
        let scale = 0.94;

        if (Math.abs(norm) < 1) {
          const t = 1 - Math.abs(norm);
          opacity = Math.pow(t, 1.3);
          ty = norm * -60;
          scale = 0.94 + t * 0.06;
        } else {
          opacity = 0;
          ty = norm > 0 ? -60 : 60;
          scale = 0.94;
        }

        slide.style.opacity = opacity.toFixed(4);
        slide.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
        slide.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
      });

      // Active section calculation
      const activeIdx = Math.min(Math.round(smoothProgress * (N - 1)), N - 1);
      navBtns.forEach((btn, i) => btn.classList.toggle('active', i === activeIdx));
      mobileNavBtns.forEach((btn, i) => btn.classList.toggle('text-primary', i === activeIdx));
      sideDots.forEach((dot, i) => dot.classList.toggle('active', i === activeIdx));

      // Real-time HUD view counter update
      if (hudCounter) {
        hudCounter.textContent = `SECTION 0${activeIdx + 1} / 0${N}`;
      }

      // Trigger stat count-up numbers when on Impact slide
      if (activeIdx === 1) {
        triggerCounters();
      }

      // Micro-pixel 3D particle constellation rotation & parallax
      if (window._threeParticles) {
        window._threeParticles.rotation.y = smoothProgress * Math.PI * 2.2;
        window._threeParticles.rotation.x = smoothProgress * Math.PI * 0.5;
      }

      requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);

    // Smooth Jump to Slide
    function jumpToSlide(index) {
      const scrollable = pinnedWrapper.offsetHeight - window.innerHeight;
      const targetScroll = pinnedWrapper.offsetTop + (index / (N - 1)) * scrollable;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    // Bind tab clicks & dot triggers
    document.querySelectorAll('[data-view]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const idx = parseInt(trigger.getAttribute('data-view') || '0', 10);
        jumpToSlide(idx);

        // Close mobile drawer if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          document.getElementById('menu-icon')?.classList.remove('hidden');
          document.getElementById('close-icon')?.classList.add('hidden');
        }
      });
    });

    // Hero scroll button
    const heroScrollBtn = document.getElementById('hero-scroll-btn');
    if (heroScrollBtn) {
      heroScrollBtn.addEventListener('click', () => jumpToSlide(1));
    }

    // Keyboard navigation (Arrow keys / W & S)
    window.addEventListener('keydown', (e) => {
      if (document.getElementById('gallery-lightbox')?.classList.contains('active')) return;
      const currentIdx = Math.round(smoothProgress * (N - 1));
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key.toLowerCase() === 's') {
        jumpToSlide(Math.min(N - 1, currentIdx + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key.toLowerCase() === 'w') {
        jumpToSlide(Math.max(0, currentIdx - 1));
      }
    });
  }

  // ============================================================
  // THREE.JS — Interactive 3D Particle Constellation
  // ============================================================
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const COUNT = 360;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT * 3; i += 3) {
      pos[i]   = (Math.random() - 0.5) * 20;
      pos[i+1] = (Math.random() - 0.5) * 20;
      pos[i+2] = (Math.random() - 0.5) * 20;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xe11d48,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
    window._threeParticles = particles;

    // Accent secondary cloud
    const geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(90 * 3);
    for (let i = 0; i < 90 * 3; i += 3) {
      pos2[i]   = (Math.random() - 0.5) * 24;
      pos2[i+1] = (Math.random() - 0.5) * 24;
      pos2[i+2] = (Math.random() - 0.5) * 24;
    }
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    const mat2 = new THREE.PointsMaterial({
      color: 0xff4d6d,
      size: 0.14,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(geo2, mat2));

    camera.position.z = 5;

    let mx = 0, my = 0;
    let camX = 0, camY = 0;

    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.5;
      my = (e.clientY / window.innerHeight - 0.5) * 0.5;
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    (function animateThree() {
      requestAnimationFrame(animateThree);
      particles.rotation.z += 0.0004;

      camX += (mx - camX) * 0.05;
      camY += (-my - camY) * 0.05;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    })();
  }

  // ============================================================
  // MOBILE MENU TOGGLE
  // ============================================================
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon   = document.getElementById('menu-icon');
  const closeIcon  = document.getElementById('close-icon');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', open);
      menuIcon?.classList.toggle('hidden', !open);
      closeIcon?.classList.toggle('hidden', open);
    });
  }

  // ============================================================
  // ANIMATED COUNT-UP NUMBERS
  // ============================================================
  function triggerCounters() {
    if (countersTriggered) return;
    countersTriggered = true;

    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseInt(el.getAttribute('data-count') || '0', 10);
      const dur = 1600;
      const t0  = performance.now();

      (function tick(now) {
        const p  = Math.min((now - t0) / dur, 1);
        const ep = 1 - Math.pow(1 - p, 3);  // ease-out cubic
        el.textContent = Math.floor(ep * end).toString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = end.toString();
      })(t0);
    });
  }

  // ============================================================
  // EXPANDABLE EVENT BRIEFS
  // ============================================================
  document.querySelectorAll('.toggle-brief-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.event-card');
      const brief  = card?.querySelector('.event-brief');
      const text   = btn.querySelector('.btn-text');
      const icon   = btn.querySelector('.btn-icon');

      if (!brief) return;
      const clamped = brief.classList.toggle('line-clamp-2');
      if (text) text.textContent = clamped ? 'Read Full Brief' : 'Close Brief';
      if (icon) icon.style.transform = clamped ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });

  // ============================================================
  // GALLERY LIGHTBOX MODAL
  // ============================================================
  const modal      = document.getElementById('gallery-lightbox');
  const lbImg      = document.getElementById('lightbox-img');
  const lbCounter  = document.getElementById('lightbox-counter');
  const lbClose    = document.getElementById('close-lightbox');
  const lbPrev     = document.getElementById('prev-lightbox');
  const lbNext     = document.getElementById('next-lightbox');

  const items = [...document.querySelectorAll('[data-lightbox-src]')];
  let cur = 0;

  function openLb(idx) {
    if (!modal || !lbImg || !items.length) return;
    cur = ((idx % items.length) + items.length) % items.length;
    lbImg.src = items[cur].getAttribute('data-lightbox-src') || '';
    if (lbCounter) lbCounter.textContent = `${cur + 1} / ${items.length}`;
    modal.classList.add('active');
  }

  function closeLb() {
    modal?.classList.remove('active');
  }

  items.forEach((item, idx) => {
    item.addEventListener('click', () => openLb(idx));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLb(idx);
      }
    });
  });
  lbClose?.addEventListener('click', e => { e.stopPropagation(); closeLb(); });
  lbPrev?.addEventListener('click',  e => { e.stopPropagation(); openLb(cur - 1); });
  lbNext?.addEventListener('click',  e => { e.stopPropagation(); openLb(cur + 1); });
  modal?.addEventListener('click', e => {
    if (e.target === modal) closeLb();
  });

  document.addEventListener('keydown', e => {
    if (!modal?.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowRight') openLb(cur + 1);
    if (e.key === 'ArrowLeft')  openLb(cur - 1);
  });

});

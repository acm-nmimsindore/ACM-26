// ============================================================
// ACM NMIMS — Main Interactive Logic
// Micro-level scroll scrubbing, Three.js, AOS, Lightbox & more
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- AOS Init ----
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 750,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      once: true,
      offset: 60,
      delay: 0,
    });
  }

  // ============================================================
  // MICRO-LEVEL CONTINUOUS SCROLL SCRUBBER (Home page)
  // requestAnimationFrame + lerp for butter-smooth pixel-perfect reveal
  // ============================================================
  const pinnedWrapper = document.getElementById('pinned-wrapper');
  const slides = document.querySelectorAll('.content-slide');
  const indicatorDots = document.querySelectorAll('.indicator-dot');

  let rawProgress = 0;
  let smoothProgress = 0;
  let countersTriggered = false;

  if (pinnedWrapper && slides.length > 0) {
    const N = slides.length;

    // Read raw scroll each frame
    window.addEventListener('scroll', () => {
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
    });

    // RAF loop — lerp smoothProgress towards rawProgress each frame
    function renderFrame() {
      smoothProgress += (rawProgress - smoothProgress) * 0.065;

      const step = 1 / (N - 1);

      slides.forEach((slide, i) => {
        const center = i * step;
        const diff = smoothProgress - center;
        const norm = diff / step; // -1..0 = entering, 0..1 = exiting

        let opacity = 0;
        let ty = 0;
        let scale = 0.93;

        if (Math.abs(norm) < 1) {
          const t = 1 - Math.abs(norm);
          opacity = Math.pow(t, 1.4);
          ty = norm * -55;
          scale = 0.93 + t * 0.07;
        } else {
          opacity = 0;
          ty = norm > 0 ? -55 : 55;
          scale = 0.93;
        }

        slide.style.opacity = opacity.toFixed(4);
        slide.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
        slide.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
      });

      // Active dot indicator
      const activeIdx = Math.min(Math.round(smoothProgress * (N - 1)), N - 1);
      indicatorDots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));

      // Trigger stat counters when on slide 1
      if (activeIdx === 1 && !countersTriggered) triggerCounters();

      // Three.js particle parallax on scroll
      if (window._threeParticles) {
        window._threeParticles.rotation.y = smoothProgress * Math.PI * 1.6;
        window._threeParticles.rotation.x = smoothProgress * Math.PI * 0.4;
      }

      requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);

    // Dot click → scroll to slide position
    indicatorDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const scrollable = pinnedWrapper.offsetHeight - window.innerHeight;
        const target = pinnedWrapper.offsetTop + (i / (N - 1)) * scrollable;
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
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

    // Main particle cloud
    const COUNT = 320;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT * 3; i += 3) {
      pos[i]   = (Math.random() - 0.5) * 18;
      pos[i+1] = (Math.random() - 0.5) * 18;
      pos[i+2] = (Math.random() - 0.5) * 18;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xe11d48,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
    window._threeParticles = particles;

    // Accent secondary cloud (slightly larger, dimmer)
    const geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(80 * 3);
    for (let i = 0; i < 80 * 3; i += 3) {
      pos2[i]   = (Math.random() - 0.5) * 22;
      pos2[i+1] = (Math.random() - 0.5) * 22;
      pos2[i+2] = (Math.random() - 0.5) * 22;
    }
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    const mat2 = new THREE.PointsMaterial({
      color: 0xff6080,
      size: 0.13,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(geo2, mat2));

    camera.position.z = 5;

    let mx = 0, my = 0;
    let camX = 0, camY = 0;

    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.45;
      my = (e.clientY / window.innerHeight - 0.5) * 0.45;
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
  // STICKY HEADER + SCROLL PROGRESS BAR
  // ============================================================
  const header = document.querySelector('header');
  const scrollProg = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    if (scrolled) {
      header?.setAttribute('data-scrolled', '1');
    } else {
      header?.removeAttribute('data-scrolled');
    }

    if (scrollProg) {
      const maxH = document.documentElement.scrollHeight - window.innerHeight;
      scrollProg.style.width = `${Math.min((window.scrollY / maxH) * 100, 100)}%`;
    }
  });

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
      document.body.style.overflow = open ? '' : 'hidden';
    });

    mobileMenu.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuIcon?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
        document.body.style.overflow = '';
      })
    );
  }

  // ============================================================
  // ANIMATED COUNT-UP NUMBERS
  // ============================================================
  function triggerCounters() {
    if (countersTriggered) return;
    countersTriggered = true;

    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseInt(el.getAttribute('data-count') || '0', 10);
      const dur = 1800;
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

  // Also trigger counters via IntersectionObserver for all viewports/pages
  const firstCountEl = document.querySelector('[data-count]');
  if (firstCountEl) {
    const targetObs = firstCountEl.closest('.content-slide') || firstCountEl.closest('.stat-card') || firstCountEl.parentElement;
    if (targetObs) {
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { triggerCounters(); obs.disconnect(); }
      }, { threshold: 0.15 }).observe(targetObs);
    }
  }

  // ============================================================
  // EXPANDABLE EVENT BRIEFS
  // ============================================================
  document.querySelectorAll('.toggle-brief-btn').forEach(btn => {
    btn.addEventListener('click', () => {
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
  // GALLERY LIGHTBOX MODAL (With Touch Swipe & Keyboard Support)
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
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    modal?.classList.remove('active');
    document.body.style.overflow = '';
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

  // Touch Swipe for mobile lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  modal?.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal?.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) openLb(cur + 1); // Swipe left -> Next
      else openLb(cur - 1);          // Swipe right -> Prev
    }
  }

  document.addEventListener('keydown', e => {
    if (!modal?.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowRight') openLb(cur + 1);
    if (e.key === 'ArrowLeft')  openLb(cur - 1);
  });

});

// ============================================================
// ACM NMIMS — Full-Scroll Website Controller
// Scroll Reveal · Active Nav · Three.js Hero · Timeline Drag
// Counter Animation · FAQ · Gallery Lightbox · Mobile Menu
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // SCROLL PROGRESS BAR + HEADER SCROLL STATE
  // ============================================================
  const header = document.getElementById('site-header') || document.querySelector('header');
  const progressBar = document.getElementById('scroll-progress');

  function updateHeader() {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollY / docH) * 100 : 0;
    if (progressBar) progressBar.style.width = pct.toFixed(2) + '%';
      if (header) {
      header.classList.toggle('scrolled', scrollY > 30);
      if (scrollY > 30) { header.setAttribute('data-scrolled', ''); }
      else { header.removeAttribute('data-scrolled'); }
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ============================================================
  // AOS INITIALIZATION & FAILSAFE (team.html, events.html, gallery.html)
  // ============================================================
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      once: true,
      offset: 30,
      easing: 'ease-out-cubic'
    });
  }

  // Failsafe: Ensure no element remains hidden if AOS fails or is delayed
  setTimeout(() => {
    document.querySelectorAll('[data-aos]').forEach(el => {
      if (window.getComputedStyle(el).opacity === '0') {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      }
    });
  }, 800);

  // ============================================================
  // SCROLL REVEAL — IntersectionObserver with transitionDelay
  // Key fix: set style.transitionDelay BEFORE adding 'revealed'
  // so the CSS transition picks up the stagger delay correctly.
  // ============================================================
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Resolve delay from data-delay (ms) or animation-delay inline style (s)
      let delayMs = 0;
      const dataDelay = el.getAttribute('data-delay');
      const animDelay = el.style.animationDelay;

      if (dataDelay !== null) {
        delayMs = parseInt(dataDelay, 10) || 0;
      } else if (animDelay) {
        delayMs = Math.round(parseFloat(animDelay) * 1000) || 0;
      }

      // Apply transition-delay so CSS transition fires after the stagger
      el.style.transitionDelay = delayMs + 'ms';
      // Force a reflow so the browser registers the delay before adding the class
      void el.offsetHeight;
      el.classList.add('revealed');
      revealObserver.unobserve(el);
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.05,
  });

  revealEls.forEach(el => revealObserver.observe(el));

  // ============================================================
  // ACTIVE NAV SECTION TRACKING
  // ============================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#desktop-nav .nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('data-section') === id);
        });
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach(sec => sectionObserver.observe(sec));

  // ============================================================
  // ANIMATED COUNTERS
  // ============================================================
  const counters = document.querySelectorAll('.counter[data-target]');
  let countersTriggered = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || countersTriggered) return;
      countersTriggered = true;
      counters.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const dur = 1800;
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString();
        })(t0);
      });
      counterObserver.disconnect();
    });
  }, { threshold: 0.3 });

  const impactSection = document.getElementById('impact');
  if (impactSection) counterObserver.observe(impactSection);

  // ============================================================
  // THREE.JS — Dynamic Full-Page 3D Constellation Background
  // Runs as a persistent fixed canvas behind the entire site.
  // Scroll drives Y rotation + camera drift; mouse drives X/Y.
  // ============================================================
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Primary constellation
    const COUNT = 420;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i += 3) {
      pos[i] = (Math.random()-0.5)*26; pos[i+1] = (Math.random()-0.5)*26; pos[i+2] = (Math.random()-0.5)*26;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe11d48, size: 0.08, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(geo, particleMat);
    scene.add(particles);

    // Secondary accent cloud (counter-rotates)
    const pos2 = new Float32Array(120 * 3);
    for (let i = 0; i < 120 * 3; i += 3) {
      pos2[i] = (Math.random()-0.5)*32; pos2[i+1] = (Math.random()-0.5)*32; pos2[i+2] = (Math.random()-0.5)*32;
    }
    const geo2 = new THREE.BufferGeometry();
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    const accentMat = new THREE.PointsMaterial({
      color: 0xff4d6d, size: 0.18, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const accent = new THREE.Points(geo2, accentMat);
    scene.add(accent);

    camera.position.z = 5;
    let mx = 0, my = 0, camX = 0, camY = 0;
    let rawScroll = 0, smoothScroll = 0, clock = 0;

    // Track scroll for scene-wide animation
    window.addEventListener('scroll', () => { rawScroll = window.scrollY; }, { passive: true });

    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    (function animateThree() {
      requestAnimationFrame(animateThree);
      clock += 0.0012;

      // Smooth scroll interpolation
      smoothScroll += (rawScroll - smoothScroll) * 0.055;
      const docH = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const scrollNorm = smoothScroll / docH; // 0 → 1 across full page

      // ── Primary constellation ──
      particles.rotation.z += 0.00035;                       // constant slow Z spin
      particles.rotation.y  = scrollNorm * Math.PI * 1.4;   // full 1.4π Y rotation over entire page
      particles.rotation.x  = Math.sin(clock * 0.7) * 0.08; // gentle X wobble

      // Breathing: size & opacity pulse
      particleMat.size    = 0.075 + Math.sin(clock * 2.2) * 0.02;
      particleMat.opacity = 0.75  + Math.sin(clock * 1.8) * 0.18;

      // ── Accent cloud (counter-rotates for depth) ──
      accent.rotation.z -= 0.00028;
      accent.rotation.y  = -scrollNorm * Math.PI * 0.9;
      accent.rotation.x  = Math.cos(clock * 0.6) * 0.06;
      accentMat.opacity   = 0.22 + Math.sin(clock * 2.5) * 0.1;

      // ── Camera: mouse parallax + scroll drift ──
      camX += (mx   - camX) * 0.05;
      camY += (-my  - camY) * 0.05;
      camera.position.x =  camX;
      camera.position.y =  camY - scrollNorm * 2.0;  // drifts down with scroll
      camera.position.z =  5    - scrollNorm * 1.5;  // pushes slightly into the field

      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    })();
  }

  // ============================================================
  // MOBILE MENU
  // ============================================================
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon   = document.getElementById('menu-icon');
  const closeIcon  = document.getElementById('close-icon');

  function closeMobileMenu() {
    mobileMenu?.classList.add('hidden');
    menuIcon?.classList.remove('hidden');
    closeIcon?.classList.add('hidden');
  }

  mobileBtn?.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden', isOpen);
    menuIcon?.classList.toggle('hidden', !isOpen);
    closeIcon?.classList.toggle('hidden', isOpen);
  });
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      const target = id === '#' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      const headerH = header ? header.offsetHeight : 68;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH, behavior: 'smooth' });
    });
  });

  // ============================================================
  // FAQ ACCORDION
  // ============================================================
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ============================================================
  // GALLERY LIGHTBOX
  // ============================================================
  const modal   = document.getElementById('gallery-lightbox');
  const lbImg   = document.getElementById('lightbox-img');
  const lbCount = document.getElementById('lightbox-counter');
  const lbClose = document.getElementById('close-lightbox');
  const lbPrev  = document.getElementById('prev-lightbox');
  const lbNext  = document.getElementById('next-lightbox');
  const galleryItems = [...document.querySelectorAll('[data-lightbox-src]')];
  let curIdx = 0;

  function openLightbox(idx) {
    if (!modal || !lbImg || !galleryItems.length) return;
    curIdx = ((idx % galleryItems.length) + galleryItems.length) % galleryItems.length;
    lbImg.src = galleryItems[curIdx].getAttribute('data-lightbox-src') || '';
    if (lbCount) lbCount.textContent = `${curIdx + 1} / ${galleryItems.length}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { modal?.classList.remove('active'); document.body.style.overflow = ''; }

  document.addEventListener('click', e => {
    const item = e.target.closest('[data-lightbox-src]');
    if (item) { const idx = galleryItems.indexOf(item); if (idx !== -1) openLightbox(idx); }
  });
  document.addEventListener('keydown', e => {
    const item = e.target.closest('[data-lightbox-src]');
    if (item && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const idx = galleryItems.indexOf(item); if (idx !== -1) openLightbox(idx); }
  });
  lbClose?.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
  lbPrev?.addEventListener('click',  e => { e.stopPropagation(); openLightbox(curIdx - 1); });
  lbNext?.addEventListener('click',  e => { e.stopPropagation(); openLightbox(curIdx + 1); });
  modal?.addEventListener('click',   e => { if (e.target === modal) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!modal?.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') openLightbox(curIdx + 1);
    if (e.key === 'ArrowLeft')  openLightbox(curIdx - 1);
  });
  // ============================================================
  // GALLERY FILTER & ABSTRACT GRID CONTROLS
  // ============================================================
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('.filter-item');
  const presetBtns  = document.querySelectorAll('.preset-btn');
  const galleryGrid = document.getElementById('gallery-grid');

  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        filterItems.forEach(item => {
          const match = filter === 'all' || item.getAttribute('data-category') === filter;
          item.style.display = match ? '' : 'none';
          // Reset AOS so items re-animate on show
          if (match) {
            item.style.opacity = '1';
            item.style.transform = 'none';
          }
        });
      });
    });
  }

  // Abstract Dynamic Grid Preset Switcher & Randomizer
  const mosaicPattern = [
    'span-2x2', 'span-1x2', 'span-1x1', 'span-2x1',
    'span-1x1', 'span-2x1', 'span-1x2', 'span-1x1',
    'span-1x1', 'span-2x2', 'span-1x1', 'span-2x1',
    'span-1x1', 'span-2x1', 'span-2x2', 'span-1x2',
    'span-2x1', 'span-1x1'
  ];

  const bentoPattern = [
    'span-2x2', 'span-2x1', 'span-1x2', 'span-1x1',
    'span-2x1', 'span-2x2', 'span-1x1', 'span-1x2'
  ];

  const possibleSpans = ['span-1x1', 'span-2x1', 'span-1x2', 'span-2x2'];

  function setGridPreset(mode) {
    if (!filterItems.length) return;
    
    // Animate container out slightly
    if (galleryGrid) {
      galleryGrid.style.opacity = '0.3';
      galleryGrid.style.transform = 'scale(0.98)';
    }

    setTimeout(() => {
      filterItems.forEach((item, idx) => {
        item.classList.remove('span-1x1', 'span-2x1', 'span-1x2', 'span-2x2', 'span-3x1', 'span-3x2');
        
        if (mode === 'mosaic') {
          item.classList.add(mosaicPattern[idx % mosaicPattern.length]);
        } else if (mode === 'bento') {
          item.classList.add(bentoPattern[idx % bentoPattern.length]);
        } else if (mode === 'compact') {
          item.classList.add('span-1x1');
        } else if (mode === 'random') {
          const randSpan = possibleSpans[Math.floor(Math.random() * possibleSpans.length)];
          item.classList.add(randSpan);
        }
      });

      if (galleryGrid) {
        galleryGrid.style.opacity = '1';
        galleryGrid.style.transform = 'scale(1)';
      }
    }, 200);
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.getAttribute('data-preset');
      setGridPreset(preset);
    });
  });


  // ============================================================
  // HORIZONTAL TIMELINE DRAG SCROLL
  // ============================================================
  const tlWrap = document.getElementById('tl-wrap');
  if (tlWrap) {
    let isDragging = false, startX = 0, scrollLeft = 0;
    tlWrap.addEventListener('mousedown', e => {
      isDragging = true; startX = e.pageX - tlWrap.offsetLeft; scrollLeft = tlWrap.scrollLeft;
      tlWrap.style.scrollBehavior = 'auto';
    });
    document.addEventListener('mouseup', () => { isDragging = false; tlWrap.style.scrollBehavior = ''; });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return; e.preventDefault();
      tlWrap.scrollLeft = scrollLeft - (e.pageX - tlWrap.offsetLeft - startX) * 1.4;
    });
    let touchStartX = 0, touchScrollLeft = 0;
    tlWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].pageX; touchScrollLeft = tlWrap.scrollLeft; }, { passive: true });
    tlWrap.addEventListener('touchmove',  e => { tlWrap.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].pageX); }, { passive: true });
  }

  // ============================================================
  // 3D TILT EFFECT — MEMBER CARDS
  // ============================================================
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(700px) rotateX(${dy * -7}deg) rotateY(${dx * 7}deg) translateY(-8px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // ============================================================
  // BACK TO TOP
  // ============================================================
  const bttBtn = document.getElementById('back-to-top');
  if (bttBtn) {
    window.addEventListener('scroll', () => bttBtn.classList.toggle('visible', window.scrollY > 500), { passive: true });
    bttBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

});

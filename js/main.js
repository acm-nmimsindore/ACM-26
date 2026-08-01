// ============================================================
// ACM NMIMS — Single Viewport Interactive Controller
// Navigation, Three.js 3D visuals, Lightbox, HUD & Micro-interactions
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
  // SINGLE VIEWPORT VIEW CONTROLLER
  // ============================================================
  const panels = [...document.querySelectorAll('.view-panel')];
  const navBtns = [...document.querySelectorAll('#header-nav-list .nav-link')];
  const mobileNavBtns = [...document.querySelectorAll('.mobile-nav-btn')];
  const sideDots = [...document.querySelectorAll('#side-indicator-container .indicator-dot')];
  const hudCounter = document.getElementById('hud-view-counter');

  let currentView = 0;
  let isTransitioning = false;
  let countersTriggered = false;

  function switchView(targetIdx) {
    if (panels.length === 0) return;
    const newIdx = Math.max(0, Math.min(panels.length - 1, targetIdx));
    if (newIdx === currentView && panels[newIdx].classList.contains('active')) return;

    const direction = newIdx > currentView ? 'down' : 'up';
    currentView = newIdx;

    // Update panels active / prev / next states
    panels.forEach((panel, i) => {
      panel.classList.remove('active', 'prev', 'next');
      if (i === currentView) {
        panel.classList.add('active');
      } else if (i < currentView) {
        panel.classList.add('prev');
      } else {
        panel.classList.add('next');
      }
    });

    // Update Nav links
    navBtns.forEach((btn, i) => btn.classList.toggle('active', i === currentView));
    mobileNavBtns.forEach((btn, i) => btn.classList.toggle('text-primary', i === currentView));

    // Update Side indicator dots
    sideDots.forEach((dot, i) => dot.classList.toggle('active', i === currentView));

    // Update HUD counter
    if (hudCounter) {
      hudCounter.textContent = `VIEW 0${currentView + 1} / 0${panels.length}`;
    }

    // Trigger Stat Counters when entering Impact View (index 1)
    if (currentView === 1) {
      triggerCounters();
    }

    // Animate Three.js particles
    if (window._threeParticles) {
      const targetRotationY = currentView * (Math.PI * 0.45);
      const targetRotationX = (currentView % 2 === 0 ? 1 : -1) * (currentView * 0.15);

      if (window._threeCamera) {
        window._threeCamera.position.z = 5 + (currentView * 0.3);
      }

      window._threeTargetRotY = targetRotationY;
      window._threeTargetRotX = targetRotationX;
    }
  }

  // Bind view switch triggers ([data-view])
  document.querySelectorAll('[data-view]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const idx = parseInt(trigger.getAttribute('data-view') || '0', 10);
      switchView(idx);

      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        document.getElementById('menu-icon')?.classList.remove('hidden');
        document.getElementById('close-icon')?.classList.add('hidden');
      }
    });
  });

  // Hero Scroll Caret Click
  const heroScrollBtn = document.getElementById('hero-scroll-btn');
  if (heroScrollBtn) {
    heroScrollBtn.addEventListener('click', () => switchView(1));
  }

  // Mouse Wheel Navigation (Throttled)
  let lastWheelTime = 0;
  window.addEventListener('wheel', (e) => {
    // Prevent wheel view switch if user is scrolling inside an expanded card
    const activePanel = panels[currentView];
    if (activePanel && activePanel.scrollHeight > activePanel.clientHeight) {
      const scrollTop = activePanel.scrollTop;
      const maxScroll = activePanel.scrollHeight - activePanel.clientHeight;
      if (e.deltaY > 0 && scrollTop < maxScroll - 5) return; // scroll internal panel down
      if (e.deltaY < 0 && scrollTop > 5) return;            // scroll internal panel up
    }

    const now = Date.now();
    if (now - lastWheelTime < 500) return; // Throttling threshold

    if (Math.abs(e.deltaY) > 20) {
      lastWheelTime = now;
      if (e.deltaY > 0) {
        switchView(currentView + 1);
      } else {
        switchView(currentView - 1);
      }
    }
  }, { passive: true });

  // Keyboard Navigation (Arrow Keys / W & S)
  window.addEventListener('keydown', (e) => {
    if (document.getElementById('gallery-lightbox')?.classList.contains('active')) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key.toLowerCase() === 's') {
      switchView(currentView + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key.toLowerCase() === 'w') {
      switchView(currentView - 1);
    }
  });

  // Touch Swipe Navigation for mobile
  let touchStartY = 0;
  let touchEndY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    const diffY = touchEndY - touchStartY;
    if (Math.abs(diffY) > 50) {
      if (diffY < 0) {
        switchView(currentView + 1); // Swipe up -> next view
      } else {
        switchView(currentView - 1); // Swipe down -> prev view
      }
    }
  }, { passive: true });

  // ============================================================
  // THREE.JS — Interactive 3D Particle Constellation
  // ============================================================
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    window._threeCamera = camera;

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

    // Accent cloud
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

      if (window._threeTargetRotY !== undefined) {
        particles.rotation.y += (window._threeTargetRotY - particles.rotation.y) * 0.04;
      }
      if (window._threeTargetRotX !== undefined) {
        particles.rotation.x += (window._threeTargetRotX - particles.rotation.x) * 0.04;
      }

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

  // Initialize View 0
  switchView(0);
});

// ============================================================
// ACM NMIMS Indore — Static Website Controller
// Interactive Navigation · Dropdown · Gallery Lightbox · Responsive
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll tracking
  const navbar = document.getElementById('mainNavbar');
  function handleScroll() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 18);
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile navigation toggle
  const navToggle = document.getElementById('navbarToggle');
  const navCollapse = document.getElementById('navbarNav');
  const iconMenu = document.getElementById('iconMenu');
  const iconClose = document.getElementById('iconClose');

  function closeMobileNav() {
    if (!navCollapse) return;
    navCollapse.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    if (iconMenu && iconClose) {
      iconMenu.style.display = 'block';
      iconClose.style.display = 'none';
    }
  }

  function toggleMobileNav() {
    if (!navCollapse) return;
    const isOpen = navCollapse.classList.toggle('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (iconMenu && iconClose) {
      iconMenu.style.display = isOpen ? 'none' : 'block';
      iconClose.style.display = isOpen ? 'block' : 'none';
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });
  }

  // Close mobile nav when clicking nav links
  if (navCollapse) {
    navCollapse.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // Close mobile nav on outside click
  document.addEventListener('click', (e) => {
    if (navCollapse && navCollapse.classList.contains('open')) {
      if (!navCollapse.contains(e.target) && (!navToggle || !navToggle.contains(e.target))) {
        closeMobileNav();
      }
    }
  });

  // 3. Join Us dropdown toggle
  const joinDropdown = document.getElementById('joinDropdown');
  const joinButton = document.getElementById('joinButton');

  function closeJoinDropdown() {
    if (!joinDropdown) return;
    joinDropdown.classList.remove('open');
    if (joinButton) joinButton.setAttribute('aria-expanded', 'false');
  }

  if (joinButton && joinDropdown) {
    joinButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = joinDropdown.classList.toggle('open');
      joinButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (joinDropdown.classList.contains('open') && !joinDropdown.contains(e.target)) {
        closeJoinDropdown();
      }
    });
  }

  // 4. Gallery modal lightbox
  const galleryModal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('modalImg');
  const closeModalBtn = document.getElementById('closeModalBtn');

  function openGalleryModal(src, alt) {
    if (!galleryModal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = alt || 'Enlarged gallery photo';
    galleryModal.classList.add('open');
    galleryModal.setAttribute('aria-modal', 'true');
    galleryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeGalleryModal() {
    if (!galleryModal) return;
    galleryModal.classList.remove('open');
    galleryModal.setAttribute('aria-modal', 'false');
    galleryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalImg) modalImg.src = '';
  }

  document.querySelectorAll('.photo-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        openGalleryModal(img.src, img.alt);
      }
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeGalleryModal);
  }

  if (galleryModal) {
    galleryModal.addEventListener('click', (e) => {
      if (e.target === galleryModal) {
        closeGalleryModal();
      }
    });
  }

  // 5. Global Escape key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (galleryModal && galleryModal.classList.contains('open')) {
        closeGalleryModal();
      }
      closeJoinDropdown();
      closeMobileNav();
    }
  });

  // 6. Image error fallbacks
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', function handleImgError() {
      this.removeEventListener('error', handleImgError);
      const fallback = this.getAttribute('data-fallback');
      if (fallback && this.src !== fallback) {
        this.src = fallback;
      }
    });
  });
});

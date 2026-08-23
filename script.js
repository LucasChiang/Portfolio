(function () {
  const menuBtn = document.getElementById('menuBtn');
  const navPanel = document.getElementById('navPanel');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = Array.from(document.querySelectorAll('.nav-list a'));
  const pages = Array.from(document.querySelectorAll('.page'));
  const yearEl = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');

  const pageIds = pages.map((p) => p.dataset.page);

  // ---------- Theme (light / dark) ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  if (themeToggle) {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current);

    themeToggle.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme');
      applyTheme(now === 'dark' ? 'light' : 'dark');
    });
  }

  function openNav() {
    navPanel.classList.add('is-open');
    navOverlay.classList.add('is-visible');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    navPanel.setAttribute('aria-hidden', 'false');
  }

  function closeNav() {
    navPanel.classList.remove('is-open');
    navOverlay.classList.remove('is-visible');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    navPanel.setAttribute('aria-hidden', 'true');
  }

  menuBtn.addEventListener('click', () => {
    if (navPanel.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  navOverlay.addEventListener('click', closeNav);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  function showPage(id) {
    if (!pageIds.includes(id)) id = 'home';

    pages.forEach((p) => {
      p.classList.toggle('is-active', p.dataset.page === id);
    });

    navLinks.forEach((a) => {
      a.classList.toggle('is-active', a.dataset.page === id);
    });

    document.title = id === 'home'
      ? 'Lucas - Portfolio'
      : `${capitalize(id)} - Lucas`;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---------- Interactive timeline: reveal on scroll ----------
  const htlItems = Array.from(document.querySelectorAll('.htl-item'));

  if (htlItems.length) {
    if ('IntersectionObserver' in window) {
      const htlObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              htlObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      htlItems.forEach((el) => htlObserver.observe(el));
    } else {
      htlItems.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // ---------- Interactive timeline: let mouse-wheel scroll horizontally ----------
  const htlScroll = document.querySelector('.htl-scroll');

  if (htlScroll) {
    htlScroll.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          htlScroll.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  navLinks.forEach((a) => {
    a.addEventListener('click', () => {
      closeNav();
    });
  });

  window.addEventListener('hashchange', () => {
    const id = window.location.hash.replace('#', '') || 'home';
    showPage(id);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  });

  // Initial load
  const initialId = window.location.hash.replace('#', '') || 'home';
  showPage(initialId);

  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

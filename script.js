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

    if (id === 'timeline') {
      requestAnimationFrame(() => requestAnimationFrame(drawEpochZigzag));
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---------- Interactive timeline scroll reveal ----------
  const epochs = Array.from(document.querySelectorAll('.epoch'));

  if (epochs.length) {
    if ('IntersectionObserver' in window) {
      const epochObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              epochObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );
      epochs.forEach((el) => epochObserver.observe(el));
    } else {
      epochs.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // ---------- Zigzag path connecting the timeline dots ----------
  const epochTimeline = document.querySelector('.epoch-timeline');
  const epochPathSvg = document.querySelector('.epoch-path');
  const epochPathEl = document.getElementById('epochZigzag');

  function drawEpochZigzag() {
    if (!epochTimeline || !epochPathSvg || !epochPathEl || !epochs.length) return;
    if (window.innerWidth <= 760) return; // path is hidden on mobile via CSS

    const width = epochTimeline.clientWidth;
    const height = epochTimeline.scrollHeight;
    if (!width || !height) return;

    epochPathSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    epochPathSvg.setAttribute('width', width);
    epochPathSvg.setAttribute('height', height);

    const points = epochs.map((el, i) => {
      const x = i % 2 === 0 ? width * 0.34 : width * 0.66;
      const y = el.offsetTop + el.offsetHeight / 2;
      return `${x},${y}`;
    });

    epochPathEl.setAttribute('d', `M ${points.join(' L ')}`);
  }

  drawEpochZigzag();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawEpochZigzag, 150);
  });

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

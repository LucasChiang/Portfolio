(function () {
  const menuBtn = document.getElementById('menuBtn');
  const navPanel = document.getElementById('navPanel');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = Array.from(document.querySelectorAll('.nav-list a'));
  const pages = Array.from(document.querySelectorAll('.page'));
  const yearEl = document.getElementById('year');

  const pageIds = pages.map((p) => p.dataset.page);

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
      ? 'Lucas Chiang — Portfolio'
      : `${capitalize(id)} — Lucas Chiang`;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

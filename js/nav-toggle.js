/* ==========================================================================
   GROCO SHARED MOBILE NAV TOGGLE
   Handles the hamburger button (#mobile-toggle) that slides #nav-menu
   in/out on narrow screens. Used on pages that don't load script.js
   (products.html, journal.html, article.html) — index.html already has
   its own copy of this behavior baked into script.js.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('active');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-menu-open');
  }

  function closeMenu() {
    menu.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-menu-open');
  }

  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close after picking a link (link navigates to a new page/section anyway).
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  // Close on outside click/tap.
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('active')) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });

  // Close on Escape.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) closeMenu();
  });

  // Close automatically if the viewport is resized back up to desktop.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && menu.classList.contains('active')) closeMenu();
  });
});

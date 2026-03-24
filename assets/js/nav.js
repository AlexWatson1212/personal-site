// assets/js/nav.js

(function () {
  const header = document.querySelector('.site-header');
  const btn = document.querySelector('.nav-toggle');
  const closeBtn = document.querySelector('.nav-close');
  const menu = document.getElementById('site-menu');

  if (!header || !btn || !menu || !closeBtn) return;

  const mqDesktop = window.matchMedia('(min-width: 861px)');

  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    header.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);

    // Lock background scroll (important for mobile feel)
    document.body.classList.toggle('menu-open', open);
  }

  function syncForBreakpoint() {
    // Desktop → always visible, no overlay behaviour
    if (mqDesktop.matches) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');

      header.classList.remove('is-open');
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      return;
    }

    // Mobile → closed by default
    setOpen(false);
  }

  // Initial setup
  syncForBreakpoint();

  // Toggle button (hamburger)
  btn.addEventListener('click', (e) => {
    if (mqDesktop.matches) return;

    e.stopPropagation();

    const open = btn.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });

  // Close button (X inside menu)
  closeBtn.addEventListener('click', (e) => {
    if (mqDesktop.matches) return;

    e.stopPropagation();
    setOpen(false);
  });

  // Close when clicking a link
  menu.addEventListener('click', (e) => {
    if (mqDesktop.matches) return;

    const link = e.target.closest('a');
    if (link) setOpen(false);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (mqDesktop.matches) return;

    if (e.key === 'Escape') {
      setOpen(false);
    }
  });

  // Close when clicking outside panel
  document.addEventListener('click', (e) => {
    if (mqDesktop.matches) return;

    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      setOpen(false);
    }
  });

  // Handle screen resize / breakpoint changes
  mqDesktop.addEventListener?.('change', syncForBreakpoint);
  window.addEventListener('resize', syncForBreakpoint);
})();
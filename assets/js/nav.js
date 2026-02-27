// assets/js/nav.js
(function () {
  const header = document.querySelector('.site-header');
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-menu');

  if (!header || !btn || !menu) return;

  const mqDesktop = window.matchMedia('(min-width: 861px)');

  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    header.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
  }

  function syncForBreakpoint() {
    // Desktop: menu always visible, no "open" state needed
    if (mqDesktop.matches) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      header.classList.remove('is-open');
      menu.classList.remove('is-open');
      return;
    }
    // Mobile: closed by default
    setOpen(false);
  }

  // Initial state
  syncForBreakpoint();

  // Toggle (mobile)
  btn.addEventListener('click', (e) => {
    if (mqDesktop.matches) return;
    e.stopPropagation();
    const open = btn.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });

  // Close menu after clicking a link (mobile)
  menu.addEventListener('click', (e) => {
    if (mqDesktop.matches) return;
    const a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (a) setOpen(false);
  });

  // Close on Escape key (mobile)
  document.addEventListener('keydown', (e) => {
    if (mqDesktop.matches) return;
    if (e.key === 'Escape') setOpen(false);
  });

  // Close when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    if (mqDesktop.matches) return;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    if (!header.contains(e.target)) setOpen(false);
  });

  // React to breakpoint changes
  mqDesktop.addEventListener?.('change', syncForBreakpoint);
  window.addEventListener('resize', syncForBreakpoint);
})();
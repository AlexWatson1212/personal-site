// assets/js/nav.js

(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const btn = header.querySelector('.nav__toggle');
  const menu = header.querySelector('#primary-nav');

  if (!btn || !menu) return;

  const mqDesktop = window.matchMedia('(min-width: 861px)');

  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    if (open) {
      menu.removeAttribute('hidden');
      document.body.classList.add('menu-open');
      header.classList.add('is-open');
    } else {
      menu.setAttribute('hidden', '');
      document.body.classList.remove('menu-open');
      header.classList.remove('is-open');
    }
  }

  function syncForBreakpoint() {
    if (mqDesktop.matches) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      menu.removeAttribute('hidden');
      document.body.classList.remove('menu-open');
      header.classList.remove('is-open');
      return;
    }

    setOpen(false);
  }

  function handleToggleClick(e) {
    if (mqDesktop.matches) return;

    e.stopPropagation();
    const open = btn.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  }

  function handleMenuClick(e) {
    if (mqDesktop.matches) return;

    const link = e.target.closest('a');
    if (link) {
      setOpen(false);
    }
  }

  function handleKeydown(e) {
    if (mqDesktop.matches) return;

    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleDocumentClick(e) {
    if (mqDesktop.matches) return;

    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;

    if (!header.contains(e.target)) {
      setOpen(false);
    }
  }

  syncForBreakpoint();

  btn.addEventListener('click', handleToggleClick);
  menu.addEventListener('click', handleMenuClick);
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleDocumentClick);

  if (mqDesktop.addEventListener) {
    mqDesktop.addEventListener('change', syncForBreakpoint);
  } else {
    mqDesktop.addListener(syncForBreakpoint);
  }

  window.addEventListener('resize', syncForBreakpoint);
})();
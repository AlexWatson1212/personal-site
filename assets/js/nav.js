(function () {
  const body = document.body;
  const toggle = document.querySelector('.nav__toggle');
  const overlay = document.querySelector('.nav__overlay');
  const panel = document.querySelector('.nav__panel');
  const links = document.querySelectorAll('.nav__links a, .nav__cta');
  const mobileMenu = window.matchMedia('(max-width: 860px)');

  if (!toggle || !panel) return;

  function getFocusableElements() {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (element) {
      return element.getClientRects().length > 0;
    });
  }

  function setMenu(open, restoreFocus) {
    const shouldOpen = Boolean(open && mobileMenu.matches);
    body.classList.toggle('menu-open', shouldOpen);
    toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', shouldOpen ? 'Close menu' : 'Open menu');

    if (shouldOpen) {
      const focusable = getFocusableElements();
      if (focusable.length) focusable[0].focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', function () {
    setMenu(!body.classList.contains('menu-open'), true);
  });

  if (overlay) {
    overlay.addEventListener('click', function () {
      setMenu(false, true);
    });
  }

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      setMenu(false, false);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (!body.classList.contains('menu-open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false, true);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      toggle.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mobileMenu.addEventListener('change', function (event) {
    if (!event.matches) setMenu(false, false);
  });
})();

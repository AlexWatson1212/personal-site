/* ===== Nav toggle (hamburger) ===== */
(function () {
  const btn  = document.querySelector('.nav-toggle');
  const list = document.getElementById('primary-nav');
  if (!btn || !list) return;

  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    list.classList.remove('open');
    list.hidden = true;
  }

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    list.hidden = false;
    requestAnimationFrame(() => list.classList.add('open'));
  }

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    open ? closeMenu() : openMenu();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!list.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });

  // Reset states on resize
  const mq = window.matchMedia('(min-width: 768px)');
  const handle = () => {
    if (mq.matches) {               // desktop
      list.hidden = false;
      list.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    } else {                        // mobile
      closeMenu();
    }
  };
  mq.addEventListener ? mq.addEventListener('change', handle) : mq.addListener(handle);
  handle();
})();

/* ===== Year stamp (no-op if missing) ===== */
(function () {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

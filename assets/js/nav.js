(function () {
  const body = document.body;
  const toggle = document.querySelector('.nav__toggle');
  const overlay = document.querySelector('.nav__overlay');
  const links = document.querySelectorAll('.nav__links a, .nav__cta');

  if (!toggle) return;

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    setMenu(!body.classList.contains('menu-open'));
  });

  overlay && overlay.addEventListener('click', function () {
    setMenu(false);
  });

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      setMenu(false);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenu(false);
  });
})();
// assets/js/nav.js

(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const btn = header.querySelector(".nav__toggle");
  const menu = header.querySelector("#primary-nav");
  const mqDesktop = window.matchMedia("(min-width: 861px)");

  if (!btn || !menu) return;

  function setOpen(open) {
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    menu.toggleAttribute("hidden", !open);
    document.body.classList.toggle("menu-open", open);
    header.classList.toggle("is-open", open);
  }

  function syncForBreakpoint() {
    if (mqDesktop.matches) {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      menu.removeAttribute("hidden");
      document.body.classList.remove("menu-open");
      header.classList.remove("is-open");
    } else {
      setOpen(false);
    }
  }

  btn.addEventListener("click", function (event) {
    if (mqDesktop.matches) return;

    event.stopPropagation();

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  menu.addEventListener("click", function (event) {
    if (mqDesktop.matches) return;

    const link = event.target.closest("a");
    if (link) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (mqDesktop.matches) return;

    if (event.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", function (event) {
    if (mqDesktop.matches) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;

    if (!header.contains(event.target)) setOpen(false);
  });

  if (mqDesktop.addEventListener) {
    mqDesktop.addEventListener("change", syncForBreakpoint);
  } else {
    mqDesktop.addListener(syncForBreakpoint);
  }

  syncForBreakpoint();
})();
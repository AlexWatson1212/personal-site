/* Navigation.
 *
 * Two jobs: the mobile panel, and the header's scrolled state. The scrolled
 * state could be done with a scroll() timeline and no JavaScript at all, but
 * that is unsupported in Firefox, and a navigation bar is not the place to
 * ship a state a third of visitors never see. Everything here is a class
 * toggle; all appearance lives in the stylesheet.
 */
(function () {
  "use strict";

  var header = document.querySelector("[data-site-header]");
  var toggle = document.querySelector(".nav__toggle");
  var panel = document.querySelector("[data-nav-panel]");
  var mobile = window.matchMedia("(max-width: 61.99rem)");

  /* ---- Header state ---- */

  if (header) {
    var scrolled = false;
    var onScroll = function () {
      var next = window.scrollY > 12;
      if (next !== scrolled) {
        scrolled = next;
        header.classList.toggle("is-scrolled", next);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile panel ---- */

  if (!toggle || !panel) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-open", open);
    panel.setAttribute("data-open", String(open));
    document.body.classList.toggle("is-locked", open && mobile.matches);
    var text = toggle.querySelector(".nav__toggle-text");
    if (text) text.textContent = open ? "Close" : "Menu";
  }

  setOpen(false);

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  panel.addEventListener("click", function (event) {
    if (event.target.closest("a") && mobile.matches) setOpen(false);
  });

  mobile.addEventListener("change", function () {
    setOpen(false);
  });

})();

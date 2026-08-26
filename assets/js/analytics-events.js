/* Named analytics events.
 *
 * Two rules, and the second one is the important one:
 *
 *   1. An event is sent only if its name is in ALLOWED below. Nothing else can
 *      be reported, whatever a future template adds.
 *   2. Nothing a person types is ever read. This file contains no reference to
 *      .value, FormData, or any field content, and the enquiry event carries a
 *      name and nothing else — no fields, no lengths, no counts. Treat that as
 *      a hard constraint: the site's promise is that nothing typed here is
 *      stored, and an analytics call is storing.
 *
 * Loaded only when analytics is configured; see _includes/analytics.html.
 */
(function () {
  "use strict";

  var ALLOWED = ["start-a-website", "enquiry-started", "enquiry-prepared"];

  function send(name) {
    if (ALLOWED.indexOf(name) === -1) return;
    if (typeof window.plausible === "function") window.plausible(name);
  }

  /* Tagged links and buttons: <a data-analytics="start-a-website"> */
  document.addEventListener(
    "click",
    function (event) {
      var el = event.target.closest("[data-analytics]");
      if (el) send(el.getAttribute("data-analytics"));
    },
    true
  );

  /* The enquiry form: that somebody began, and that somebody finished. The
     event names carry the whole payload — there is deliberately no second
     argument anywhere in this file. */
  var form = document.querySelector("[data-studio-enquiry]");
  if (!form) return;

  var started = false;
  form.addEventListener(
    "input",
    function () {
      if (started) return;
      started = true;
      send("enquiry-started");
    },
    { once: false }
  );

  form.addEventListener("submit", function () {
    send("enquiry-prepared");
  });
})();

/* The private client pages: /client/intake/ and /client/photography/.
 *
 * Intake. The page renders the Tally form address from _data/intake.yml. This
 * script does three small things and nothing else:
 *   1. reads ?ref= from the page address and accepts it ONLY if it has the
 *      project-reference shape AW-001 (AW- and three or four digits). Anything
 *      else is ignored, so nothing personal can travel through this page;
 *   2. adds the accepted reference to the form address, which is how Tally
 *      fills the form's hidden field `ref`, and shows it to the client;
 *   3. loads the embedded form (it is not loaded without this script — the
 *      "Open the form" button works either way) and, if Tally reports the
 *      form's height, sizes the frame to it so the page does not scroll twice.
 *
 * No data is read from, sent to or stored by this website. No Tally script is
 * loaded.
 *
 * Photography. Reveals a "Print or save as PDF" button, which is hidden when
 * scripting is unavailable because it would do nothing.
 */
(function () {
  "use strict";

  var REF_SHAPE = /^AW-\d{3,4}$/;

  function readRef() {
    try {
      var value = new URLSearchParams(window.location.search).get("ref");
      if (!value) return "";
      value = value.trim().toUpperCase();
      return REF_SHAPE.test(value) ? value : "";
    } catch (error) {
      return "";
    }
  }

  function withRef(address, ref) {
    if (!address) return "";
    if (!ref) return address;
    try {
      var url = new URL(address);
      url.searchParams.set("ref", ref);
      return url.toString();
    } catch (error) {
      return address;
    }
  }

  var intake = document.querySelector("[data-intake]");
  if (intake) {
    var ref = readRef();

    if (ref) {
      var refNote = document.querySelector("[data-intake-ref]");
      var refValue = document.querySelector("[data-intake-ref-value]");
      if (refNote && refValue) {
        refValue.textContent = ref;
        refNote.hidden = false;
      }
    }

    var link = intake.querySelector("[data-intake-link]");
    if (link) link.href = withRef(link.getAttribute("href"), ref);

    var embed = intake.getAttribute("data-intake-embed");
    var frameWrap = intake.querySelector("[data-intake-frame]");
    var iframe = intake.querySelector("[data-intake-iframe]");
    if (embed && frameWrap && iframe) {
      iframe.src = withRef(embed, ref);
      frameWrap.hidden = false;

      /* Tally's own embed script resizes the frame from messages the form
         posts to its parent. The same messages are read here, from the Tally
         origin only, and only a sensible numeric height is ever applied. If the
         format differs, nothing happens and the frame keeps its fixed height. */
      window.addEventListener("message", function (event) {
        if (event.origin !== "https://tally.so") return;
        if (event.source !== iframe.contentWindow) return;
        var data = event.data;
        if (typeof data === "string") {
          try { data = JSON.parse(data); } catch (error) { return; }
        }
        if (!data || typeof data !== "object") return;
        var payload = data.payload || {};
        var height = Number(payload.height);
        if (data.event === "Tally.FormHeightChanged" || (payload && "height" in payload)) {
          if (isFinite(height) && height >= 300 && height <= 20000) {
            iframe.style.height = Math.ceil(height) + "px";
          }
        }
      });
    }
  }

  var printButton = document.querySelector("[data-print]");
  if (printButton && typeof window.print === "function") {
    printButton.hidden = false;
    printButton.addEventListener("click", function () {
      window.print();
    });
  }
})();

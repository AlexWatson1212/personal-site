/* The private client pages: /client/photography/.
 *
 * Photography. Reveals a "Print or save as PDF" button, which is hidden when
 * scripting is unavailable because it would do nothing.
 *
 * 19 September 2026. This file used to carry a second, much larger job: the
 * Tally intake on /client/intake/. It read a ?ref= project reference from the
 * page address, appended it to the form address, loaded the embedded form in
 * an iframe and listened for Tally.FormHeightChanged messages from
 * https://tally.so to size the frame. All of that came out when the Tally
 * intake was retired in favour of Practice Discovery, a native form at
 * /client/practice-discovery/ that needs no embed, no cross-origin message
 * listener and no script of this kind at all. The frame-src allowance for
 * tally.so came out of netlify.toml at the same time. Nothing was archived
 * alongside this file: the retired page, its data file and the previous
 * version of this script are all in git history at e52cb8d, which is where a
 * deleted file belongs.
 *
 * /client/practice-discovery/ has its own script, assets/js/practice-discovery.js,
 * and does not load this one.
 */
(function () {
  "use strict";

  var printButton = document.querySelector("[data-print]");
  if (printButton && typeof window.print === "function") {
    printButton.hidden = false;
    printButton.addEventListener("click", function () {
      window.print();
    });
  }
})();

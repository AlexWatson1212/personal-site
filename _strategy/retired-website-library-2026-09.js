/* The collection filter.
 *
 * Filtering is a text match against each direction's data-search string, which
 * is authored in _data/collection.yml. No index, no library, no fetch: the
 * whole collection is already in the document, so filtering is a class of
 * `hidden` attributes and one live-region update.
 */
(function () {
  "use strict";

  var library = document.querySelector("[data-website-library]");
  if (!library) return;

  var buttons = Array.prototype.slice.call(library.querySelectorAll("[data-filter]"));
  var search = library.querySelector("[data-website-search]");
  var projects = Array.prototype.slice.call(library.querySelectorAll("[data-project]"));
  var count = library.querySelector("[data-results-count]");
  var message = library.querySelector("[data-results-message]");
  var empty = library.querySelector("[data-no-results]");
  var reset = library.querySelector("[data-reset-library]");
  var active = "all";

  function apply() {
    var query = (search.value || "").trim().toLowerCase();
    var visible = 0;

    projects.forEach(function (project) {
      var content = project.dataset.search || "";
      var matches = (active === "all" || content.indexOf(active) !== -1) &&
                    (!query || content.indexOf(query) !== -1);
      project.hidden = !matches;
      if (matches) visible += 1;
    });

    count.textContent = String(visible).padStart(2, "0") +
      (visible === 1 ? " direction" : " directions");
    message.textContent = active === "all" && !query
      ? "Showing the complete collection"
      : "Showing matching directions";
    empty.hidden = visible !== 0;
  }

  function setFilter(value) {
    active = value;
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === value));
    });
    apply();
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () { setFilter(button.dataset.filter); });
  });

  search.addEventListener("input", apply);

  if (reset) {
    reset.addEventListener("click", function () {
      search.value = "";
      setFilter("all");
      search.focus();
    });
  }

  apply();
})();

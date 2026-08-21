(function () {
  const library = document.querySelector("[data-website-library]");
  if (!library) return;

  const filterButtons = Array.from(library.querySelectorAll("[data-filter]"));
  const search = library.querySelector("[data-website-search]");
  const projects = Array.from(library.querySelectorAll("[data-project]"));
  const count = library.querySelector("[data-results-count]");
  const message = library.querySelector("[data-results-message]");
  const empty = library.querySelector("[data-no-results]");
  const reset = library.querySelector("[data-reset-library]");
  let activeFilter = "all";

  function applyFilters() {
    const query = (search.value || "").trim().toLowerCase();
    let visible = 0;

    projects.forEach(function (project) {
      const content = project.dataset.search || "";
      const filterMatch = activeFilter === "all" || content.includes(activeFilter);
      const searchMatch = !query || content.includes(query);
      const show = filterMatch && searchMatch;
      project.hidden = !show;
      if (show) visible += 1;
    });

    count.textContent = String(visible).padStart(2, "0") + (visible === 1 ? " design" : " designs");
    message.textContent = activeFilter === "all" && !query ? "Showing the complete collection" : "Showing matching website designs";
    empty.hidden = visible !== 0;
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      filterButtons.forEach(function (item) {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      applyFilters();
    });
  });

  search.addEventListener("input", applyFilters);
  reset.addEventListener("click", function () {
    activeFilter = "all";
    search.value = "";
    filterButtons.forEach(function (item) {
      const active = item.dataset.filter === "all";
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    applyFilters();
  });
})();

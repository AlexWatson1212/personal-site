(function () {
  "use strict";

  var documents = Array.prototype.slice.call(
    document.querySelectorAll(".acw-service-document-shell object[data-document-src]")
  );

  if (!documents.length) return;

  var desktop = window.matchMedia("(min-width: 761px)");
  var observer;

  function loadDocument(element) {
    if (element.hasAttribute("data")) return;
    element.setAttribute("data", element.getAttribute("data-document-src"));
    element.removeAttribute("data-document-src");
  }

  function beginLoading() {
    if (!desktop.matches) return;

    var remaining = documents.filter(function (element) {
      return element.hasAttribute("data-document-src");
    });

    if (!remaining.length) return;

    if (!("IntersectionObserver" in window)) {
      remaining.forEach(loadDocument);
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadDocument(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "900px 0px" });
    }

    remaining.forEach(function (element) {
      observer.observe(element);
    });
  }

  beginLoading();

  if (typeof desktop.addEventListener === "function") {
    desktop.addEventListener("change", beginLoading);
  } else if (typeof desktop.addListener === "function") {
    desktop.addListener(beginLoading);
  }
}());

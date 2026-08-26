(function () {
  const form = document.querySelector("[data-studio-enquiry]");
  if (!form) return;

  /* Arriving from a direction card or from the purchase page carries context
     in the query string. The design is a real question on the form; the
     service is not, so it rides along hidden rather than asking somebody to
     choose a route before they have spoken to anyone. */
  const params = new URLSearchParams(window.location.search);
  const design = params.get("design");
  const service = params.get("service");
  if (design && form.elements.design) form.elements.design.value = design;
  if (service && form.elements.service) form.elements.service.value = service;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const context = data.get("service");
    const body = [
      "Name: " + (data.get("name") || ""),
      "Email: " + (data.get("email") || ""),
      "Design: " + (data.get("design") || "Not sure yet"),
      "Current website: " + (data.get("currentWebsite") || "None"),
      context ? "Came from: " + context : "",
      "",
      "Practice, and where they are up to:",
      data.get("message") || ""
    ].filter(function (line, i) { return line !== "" || i > 4; }).join("\n");
    const subject = "Studio enquiry — " + (data.get("name") || "new website");
    form.querySelector("[data-form-status]").hidden = false;
    window.location.href = "mailto:hello@alexanderwatson.co.uk?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();

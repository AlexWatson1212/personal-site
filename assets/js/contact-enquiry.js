(function () {
  const form = document.querySelector("[data-studio-enquiry]");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const design = params.get("design");
  const service = params.get("service");
  if (design) form.elements.design.value = design;
  if (service) form.elements.service.value = service;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const selectedService = form.elements.service.options[form.elements.service.selectedIndex].text;
    const body = [
      "Name: " + (data.get("name") || ""),
      "Email: " + (data.get("email") || ""),
      "Website design: " + (data.get("design") || "Not sure yet"),
      "Support route: " + (selectedService || "Not sure yet"),
      "What is ready: " + (data.get("readiness") || ""),
      "Current website: " + (data.get("currentWebsite") || ""),
      "",
      "What I would like you to know:",
      data.get("message") || ""
    ].join("\n");
    const subject = "Studio enquiry — " + (data.get("name") || "new website");
    form.querySelector("[data-form-status]").hidden = false;
    window.location.href = "mailto:hello@alexanderwatson.co.uk?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();

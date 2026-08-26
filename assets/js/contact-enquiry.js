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

    /* The fallback is revealed on every submit, not only on failure: a browser
       does not tell us whether the mail app opened, so the honest thing is to
       put the message where it can be reached either way. It stays in the page
       and is never transmitted. */
    const fallback = document.querySelector("[data-form-fallback]");
    const prepared = document.querySelector("[data-form-prepared]");
    if (prepared) prepared.value = "To: hello@alexanderwatson.co.uk\nSubject: " + subject + "\n\n" + body;
    if (fallback) fallback.hidden = false;

    window.location.href =
      "mailto:hello@alexanderwatson.co.uk?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  });

  /* Copy to clipboard, with the selection fallback for browsers that refuse
     the async API outside a secure context. */
  const copyButton = document.querySelector("[data-form-copy]");
  const copied = document.querySelector("[data-form-copied]");
  if (copyButton) {
    copyButton.addEventListener("click", function () {
      const prepared = document.querySelector("[data-form-prepared]");
      if (!prepared) return;
      const done = function () {
        if (copied) copied.hidden = false;
        copyButton.textContent = "Copied";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prepared.value).then(done, function () {
          prepared.select();
        });
      } else {
        prepared.select();
        done();
      }
    });
  }
})();

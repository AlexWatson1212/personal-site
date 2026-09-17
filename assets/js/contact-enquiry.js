(function () {
  "use strict";

  const form = document.querySelector("[data-studio-enquiry]");
  if (!form) return;

  /* Arriving from the purchase page carries context in the query string; it
     rides along hidden rather than asking somebody to choose a route before
     they have spoken to anyone. */
  const params = new URLSearchParams(window.location.search);
  const service = params.get("service");
  if (service && form.elements.service) form.elements.service.value = service;

  /* ------------------------------------------------------------------ *
   * The conditional follow-up. 17 September 2026.
   *
   * "No, I need additional pages or functionality" reveals one field asking
   * what is needed. Without scripting the field simply stays visible, which is
   * harmless. The controlling radio carries aria-controls. (aria-expanded is
   * not permitted on a radio, so the field is announced by its own label when
   * the next Tab reaches it — it sits directly after the radio group.)
   * ------------------------------------------------------------------ */
  const revealers = Array.from(form.querySelectorAll("[data-reveals]"));

  function syncConditionals() {
    revealers.forEach(function (radio) {
      const target = document.getElementById(radio.getAttribute("data-reveals"));
      if (!target) return;
      const open = radio.checked;
      target.hidden = !open;
      if (!open) {
        target.querySelectorAll("textarea, input").forEach(function (field) {
          clearError(field.name);
        });
      }
    });
  }

  revealers.forEach(function (radio) {
    form.querySelectorAll('input[name="' + radio.name + '"]').forEach(function (member) {
      member.addEventListener("change", syncConditionals);
    });
  });
  syncConditionals();

  /* ------------------------------------------------------------------ *
   * Validation. The answers are never scored and nothing is ruled out by
   * them; this only makes sure the email has what it needs to be useful.
   * ------------------------------------------------------------------ */
  const summary = form.querySelector("[data-form-errors]");
  const summaryList = form.querySelector("[data-form-error-list]");

  function value(name) {
    const data = new FormData(form);
    return String(data.get(name) || "").trim();
  }

  function firstControl(name) {
    return form.querySelector('[name="' + name + '"]');
  }

  function errorNode(name) {
    return form.querySelector('[data-error-for="' + name + '"]');
  }

  function setError(name, message) {
    const node = errorNode(name);
    if (node) {
      node.textContent = message;
      node.hidden = false;
    }
    form.querySelectorAll('[name="' + name + '"]').forEach(function (control) {
      control.setAttribute("aria-invalid", "true");
    });
    const group = node && node.closest(".field");
    if (group) group.classList.add("field--error");
  }

  function clearError(name) {
    const node = errorNode(name);
    if (node) {
      node.textContent = "";
      node.hidden = true;
    }
    form.querySelectorAll('[name="' + name + '"]').forEach(function (control) {
      control.removeAttribute("aria-invalid");
    });
    const group = node && node.closest(".field");
    if (group) group.classList.remove("field--error");
  }

  function validate() {
    const problems = [];
    const need = function (name, message) {
      problems.push({ name: name, message: message });
    };

    if (!value("name")) need("name", "Enter your name.");
    const email = value("email");
    if (!email) need("email", "Enter your email address, so I can reply.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) need("email", "Enter a full email address, including the @ and the part after it.");
    if (!value("practice")) need("practice", "Tell me briefly what you do, and where.");
    if (!value("onePage")) need("onePage", "Choose one answer about a single page. If you are unsure, “I think so” is fine.");
    const noRadio = revealers[0];
    if (noRadio && noRadio.checked && !value("onePageNeeds")) {
      need("onePageNeeds", "Say roughly what you would need beyond one page.");
    }
    if (!value("domain")) need("domain", "Choose one answer about your domain name.");
    if (!value("photos")) need("photos", "Choose one answer about photographs.");

    ["name", "email", "practice", "onePage", "onePageNeeds", "domain", "photos"].forEach(clearError);
    problems.forEach(function (problem) { setError(problem.name, problem.message); });

    if (!summary || !summaryList) return problems.length === 0;
    summaryList.textContent = "";
    if (problems.length === 0) {
      summary.hidden = true;
      return true;
    }
    problems.forEach(function (problem) {
      const control = firstControl(problem.name);
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "inline-link";
      link.href = control && control.id ? "#" + control.id : "#";
      link.textContent = problem.message;
      link.addEventListener("click", function (event) {
        if (!control) return;
        event.preventDefault();
        const holder = control.closest(".field");
        if (holder) holder.scrollIntoView({ block: "center" });
        control.focus({ preventScroll: true });
      });
      item.appendChild(link);
      summaryList.appendChild(item);
    });
    summary.hidden = false;
    /* focus() alone does not reliably bring a just-revealed element into view,
       and the submit button can be a long way below it on a phone. */
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      summary.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    } catch (error) {
      summary.scrollIntoView();
    }
    summary.focus({ preventScroll: true });
    return false;
  }

  /* Once somebody has seen an error, correcting the field clears it without
     waiting for another submit. */
  form.addEventListener("input", function (event) {
    if (event.target && event.target.name && event.target.getAttribute("aria-invalid") === "true" && event.target.value.trim()) {
      clearError(event.target.name);
    }
  });
  form.addEventListener("change", function (event) {
    if (event.target && event.target.type === "radio") clearError(event.target.name);
  });

  /* ------------------------------------------------------------------ *
   * The email.
   * ------------------------------------------------------------------ */
  function buildBody() {
    const lines = [];
    const add = function () {
      for (let i = 0; i < arguments.length; i += 1) lines.push(arguments[i]);
    };
    add("Name: " + value("name"));
    add("Email: " + value("email"));
    add("Current website: " + (value("currentWebsite") || "None"));
    if (value("service")) add("Came from: " + value("service"));
    add("");
    add("What I do, and where:", value("practice"), "");
    add("Would a single, carefully designed page be enough for now?", value("onePage"));
    const needs = revealers[0] && revealers[0].checked ? value("onePageNeeds") : "";
    if (needs) add("What I would need: " + needs);
    add("");
    add("Do I already own a domain name?", value("domain"), "");
    add("Recent photographs, or could I arrange some within about two weeks?", value("photos"), "");
    add("Date I need the website by:", value("neededBy") || "No particular date", "");
    add("Anything else:", value("message") || "Nothing further.");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validate()) return;

    const body = buildBody();
    const subject = "Studio enquiry — " + (value("name") || "new website");

    /* The fallback is revealed on every submit, not only on failure: a browser
       does not tell us whether the mail app opened, so the honest thing is to
       put the message where it can be reached either way. It stays in the page
       and is never transmitted. */
    const fallback = document.querySelector("[data-form-fallback]");
    const prepared = document.querySelector("[data-form-prepared]");
    if (prepared) prepared.value = "To: hello@alexanderwatson.co.uk\nSubject: " + subject + "\n\n" + body;
    if (fallback) {
      fallback.hidden = false;
      /* On a phone the fallback can appear below the fold: bring it into view
         and put focus on it, so the next step is both visible and announced. */
      const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      try {
        fallback.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      } catch (error) {
        fallback.scrollIntoView();
      }
      fallback.setAttribute("tabindex", "-1");
      fallback.focus({ preventScroll: true });
    }

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

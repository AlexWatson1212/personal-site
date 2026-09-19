/* Practice Discovery — the eleven-step experience.
 *
 * The page is a complete, submittable form before this file runs. Every field
 * is in the HTML, native `required` is doing the validating, and the single
 * submit button works. Everything here is an improvement on that, and if it
 * throws, the catch at the bottom puts the page back the way it was rather
 * than leaving somebody looking at one eleventh of a questionnaire with no
 * way to reach the rest.
 *
 * Hiding a step uses the `hidden` attribute and nothing else. The fields stay
 * in the document, keep their values, and are still submitted — which is why
 * moving backwards and forwards loses nothing, and why `disabled` is never
 * used here: a disabled field is not submitted, and the answer would vanish.
 *
 * Nothing in this file reads, stores or transmits an answer. There is no
 * localStorage, no analytics call and no console logging of values: the only
 * copy of what somebody types is the one in the form, on its way to Netlify.
 */
(function () {
  "use strict";

  var form = document.querySelector("[data-practice-discovery]");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll("[data-pd-step]"));
  if (steps.length < 2) return;

  var prevBtn = form.querySelector("[data-pd-prev]");
  var nextBtn = form.querySelector("[data-pd-next]");
  var submitBtn = form.querySelector("[data-pd-submit]");
  var progress = form.querySelector("[data-pd-progress]");
  var stepName = form.querySelector("[data-pd-step-name]");
  var stepCurrent = form.querySelector("[data-pd-step-current]");
  var progressFill = form.querySelector("[data-pd-progress-fill]");
  var errorBox = form.querySelector("[data-form-errors]");
  var errorList = form.querySelector("[data-form-error-list]");
  var status = form.querySelector("[data-pd-status]");

  var total = steps.length;
  var index = 0;

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- validation ----------------------------------------------------- */

  /** The visible question, for an error message that names what is missing. */
  function labelFor(el) {
    var group = el.closest("fieldset.field");
    var source = group ? group.querySelector("legend") : null;
    if (!source && el.id) source = form.querySelector('label[for="' + el.id + '"]');
    if (!source) return "This question";
    var text = source.cloneNode(true);
    Array.prototype.forEach.call(text.querySelectorAll(".req, .opt"), function (n) {
      n.parentNode.removeChild(n);
    });
    return (text.textContent || "").replace(/\s+/g, " ").trim().replace(/[:?]$/, "") || "This question";
  }

  function message(el) {
    var label = labelFor(el);
    if (el.validity.valueMissing) {
      if (el.type === "checkbox") return label + " needs to be confirmed.";
      if (el.type === "radio") return label + " — please choose one.";
      return label + " — please add an answer.";
    }
    if (el.validity.typeMismatch && el.type === "email") {
      return label + " — this does not look like an email address.";
    }
    if (el.validity.typeMismatch && el.type === "url") {
      return label + " — a web address needs to start with http:// or https://.";
    }
    return label + " — " + el.validationMessage;
  }

  /** The controls in a step that can fail, one entry per radio group. */
  function controlsIn(step) {
    var all = Array.prototype.slice.call(step.querySelectorAll("input, select, textarea"));
    var seenRadio = {};
    return all.filter(function (el) {
      if (!el.name || el.type === "hidden" || el.type === "file") return false;
      if (el.type !== "radio") return true;
      if (seenRadio[el.name]) return false;
      seenRadio[el.name] = true;
      return true;
    });
  }

  function showFieldError(el, text) {
    var slot = form.querySelector('[data-error-for="' + el.name.replace(/\[\]$/, "") + '"]');
    if (slot) {
      slot.textContent = text;
      slot.hidden = false;
    }
    var wrap = el.closest(".field");
    if (wrap) wrap.classList.add("field--error");
    el.setAttribute("aria-invalid", "true");
  }

  function clearErrors(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll("[data-error-for]"), function (slot) {
      slot.textContent = "";
      slot.hidden = true;
    });
    Array.prototype.forEach.call(scope.querySelectorAll(".field--error"), function (wrap) {
      wrap.classList.remove("field--error");
    });
    Array.prototype.forEach.call(scope.querySelectorAll("[aria-invalid]"), function (el) {
      el.removeAttribute("aria-invalid");
    });
  }

  /** Validates one step. Returns the failures, and paints them. */
  function validate(step) {
    clearErrors(step);
    var failures = [];
    controlsIn(step).forEach(function (el) {
      if (el.checkValidity()) return;
      var text = message(el);
      showFieldError(el, text);
      failures.push({ el: el, text: text });
    });
    return failures;
  }

  function showSummary(failures) {
    if (!errorBox || !errorList) return;
    while (errorList.firstChild) errorList.removeChild(errorList.firstChild);
    failures.forEach(function (failure) {
      var li = document.createElement("li");
      /* A link rather than plain text: it is the shortest route from the
         summary to the control that needs the answer, for a mouse and a
         keyboard alike. */
      var a = document.createElement("a");
      a.href = "#" + (failure.el.id || "");
      a.textContent = failure.text;
      a.addEventListener("click", function (event) {
        event.preventDefault();
        focusControl(failure.el);
      });
      li.appendChild(a);
      errorList.appendChild(li);
    });
    errorBox.hidden = false;
    errorBox.focus();
  }

  function hideSummary() {
    if (errorBox) errorBox.hidden = true;
  }

  function focusControl(el) {
    var step = el.closest("[data-pd-step]");
    if (step) {
      var target = steps.indexOf(step);
      if (target !== -1 && target !== index) show(target, false);
    }
    el.focus();
    scrollTo(el);
  }

  function scrollTo(el) {
    if (!el.scrollIntoView) return;
    el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ---- navigation ------------------------------------------------------ */

  function show(target, moveFocus) {
    index = Math.max(0, Math.min(total - 1, target));

    steps.forEach(function (step, i) {
      step.hidden = i !== index;
    });

    var last = index === total - 1;
    if (prevBtn) prevBtn.hidden = index === 0;
    if (nextBtn) nextBtn.hidden = last;
    if (submitBtn) submitBtn.hidden = !last;

    var title = steps[index].getAttribute("data-pd-step-title") || "";
    if (stepName) stepName.textContent = title;
    if (stepCurrent) stepCurrent.textContent = String(index + 1);
    if (progressFill) progressFill.style.inlineSize = ((index + 1) / total) * 100 + "%";

    if (moveFocus) {
      var legend = steps[index].querySelector(".pd__legend");
      if (legend) {
        legend.focus();
        scrollTo(legend);
      }
    }
  }

  function goNext() {
    var failures = validate(steps[index]);
    if (failures.length) {
      showSummary(failures);
      return;
    }
    hideSummary();
    show(index + 1, true);
  }

  function goPrev() {
    /* No validation going backwards. Somebody stepping back to check an
       earlier answer must not be stopped by a question they have not reached
       a decision on yet. */
    hideSummary();
    show(index - 1, true);
  }

  /* ---- start ----------------------------------------------------------- */

  try {
    /* The browser's own validation bubbles would fire on the submit button
       while ten of the eleven steps were hidden, pointing at controls nobody
       can see. From here validation is this file's job. */
    form.noValidate = true;

    if (progress) progress.hidden = false;
    if (prevBtn) prevBtn.hidden = false;
    if (nextBtn) nextBtn.hidden = false;

    if (nextBtn) nextBtn.addEventListener("click", goNext);
    if (prevBtn) prevBtn.addEventListener("click", goPrev);

    /* Enter inside a text field would otherwise submit a form that is ten
       steps from finished. Textareas keep their newlines. */
    form.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      var el = event.target;
      if (!el || el.tagName !== "INPUT" || el.type === "submit") return;
      event.preventDefault();
      if (index < total - 1) goNext();
    });

    form.addEventListener("submit", function (event) {
      var failures = [];
      var firstBad = -1;
      steps.forEach(function (step, i) {
        var stepFailures = validate(step);
        if (stepFailures.length && firstBad === -1) firstBad = i;
        failures = failures.concat(stepFailures);
      });

      if (failures.length) {
        event.preventDefault();
        if (firstBad !== -1) show(firstBad, false);
        showSummary(failures);
        return;
      }

      hideSummary();
      if (status) status.textContent = "Sending your answers. This may take a moment if you have attached files.";
      if (submitBtn) submitBtn.disabled = true;
    });

    show(0, false);
  } catch (error) {
    /* Whatever went wrong, the questionnaire is more important than the step
       experience. Every section goes back on screen, the browser takes its
       validation back, and the page is the plain form it was in the markup. */
    steps.forEach(function (step) { step.hidden = false; });
    form.noValidate = false;
    if (progress) progress.hidden = true;
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
    if (submitBtn) submitBtn.hidden = false;
  }
})();

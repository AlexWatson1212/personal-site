/**
 * Website Content Questionnaire — Therapist Website.
 *
 * Assembles the visitor's answers in their own browser and hands them back as
 * text they can copy or open in their own email app. Nothing is transmitted to
 * or stored by this website, and no payment information is involved.
 */
(function () {
  "use strict";

  var form = document.querySelector("[data-questionnaire]");
  if (!form) return;

  var summaryField = document.querySelector("[data-questionnaire-summary]");
  var mailtoLink = document.querySelector("[data-questionnaire-mailto]");
  var copyButton = document.querySelector("[data-questionnaire-copy]");
  var statusEl = document.querySelector("[data-questionnaire-status]");
  var errorBox = form.querySelector("[data-questionnaire-errors]");

  var SECTIONS = [
    ["About you and your practice", [
      ["name", "Name"],
      ["email", "Email address"],
      ["practiceName", "Practice name"],
      ["checkoutEmail", "Email used at checkout"]
    ]],
    ["Chosen design", [
      ["design", "Design"],
      ["colours", "Colour direction"]
    ]],
    ["Pages and copy", [
      ["pages", "Pages"],
      ["copyStatus", "Copy status"],
      ["materialsLink", "Materials link"]
    ]],
    ["Practice details to publish", [
      ["credentials", "Qualifications and memberships"],
      ["fees", "Fees and session length"],
      ["modality", "How and where you work"],
      ["publicContact", "Contact details to publish"]
    ]],
    ["Images and logo", [
      ["photos", "Photographs"],
      ["logo", "Logo"]
    ]],
    ["Domain and hosting", [
      ["domain", "Domain name"],
      ["registrar", "Registrar and access"],
      ["currentWebsite", "Existing website"],
      ["hosting", "Hosting after launch"]
    ]],
    ["Working together", [
      ["access", "Accessibility or communication requirements"],
      ["notes", "Anything else"]
    ]],
    ["Acknowledgements", [
      ["ackAccurate", "Professional facts are accurate and current"],
      ["ackRights", "Owns or is licensed to use the supplied materials"],
      ["ackNoClientData", "Contains no information about the client's own clients"],
      ["ackTerms", "Service terms and privacy notice read"]
    ]]
  ];

  function valueOf(fieldName) {
    var field = form.elements[fieldName];
    if (!field) return "";
    if (field.type === "checkbox") return field.checked ? "Confirmed" : "";
    return (field.value || "").trim();
  }

  function labelFor(field) {
    var wrapper = field.closest("label");
    if (wrapper) {
      var span = wrapper.querySelector("span");
      if (span) return span.textContent.trim();
    }
    return field.name;
  }

  function findInvalidFields() {
    var required = form.querySelectorAll("[required]");
    var invalid = [];
    for (var i = 0; i < required.length; i += 1) {
      var f = required[i];
      var missing = f.type === "checkbox" ? !f.checked : !(f.value || "").trim();
      if (missing) invalid.push(f);
    }
    return invalid;
  }

  function showErrors(fields) {
    if (!errorBox) return;
    var names = fields.map(labelFor);
    errorBox.innerHTML =
      "<p><strong>Please complete these before preparing your answers:</strong></p><ul>" +
      names.map(function (n) {
        return "<li>" + n.replace(/[<>&]/g, "") + "</li>";
      }).join("") +
      "</ul>";
    errorBox.hidden = false;
    errorBox.focus();
  }

  function clearErrors() {
    if (!errorBox) return;
    errorBox.hidden = true;
    errorBox.innerHTML = "";
  }

  function buildSummary() {
    var lines = ["Website Content Questionnaire — Therapist Website", ""];
    SECTIONS.forEach(function (section) {
      var heading = section[0];
      var fields = section[1];
      var written = [];
      fields.forEach(function (pair) {
        var value = valueOf(pair[0]);
        if (value) written.push(pair[1] + ": " + value);
      });
      if (written.length) {
        lines.push(heading.toUpperCase());
        lines = lines.concat(written);
        lines.push("");
      }
    });
    lines.push("Sent from the Website Content Questionnaire at alexanderwatson.co.uk.");
    lines.push("Copy, images and logo are attached to this email or in the linked folder above.");
    return lines.join("\n");
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var invalid = findInvalidFields();
    if (invalid.length) {
      showErrors(invalid);
      return;
    }
    clearErrors();

    var summary = buildSummary();
    if (summaryField) summaryField.value = summary;

    if (mailtoLink) {
      var subject = "Website Content Questionnaire — " + (valueOf("practiceName") || valueOf("name") || "Therapist Website");
      mailtoLink.href =
        "mailto:hello@alexanderwatson.co.uk?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(summary);
    }

    setStatus("Your answers are ready below. Copy them, or open them in your email app.");
    if (summaryField) summaryField.focus();
  });

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      if (!summaryField || !summaryField.value) {
        setStatus("Press “Prepare my answers” first.");
        return;
      }
      var done = function () {
        setStatus("Copied. Paste it into an email to hello@alexanderwatson.co.uk.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryField.value).then(done, function () {
          summaryField.select();
          setStatus("Select the text above and copy it manually.");
        });
      } else {
        summaryField.select();
        setStatus("Select the text above and copy it manually.");
      }
    });
  }
})();

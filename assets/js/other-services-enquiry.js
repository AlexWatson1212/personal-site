(function () {
  "use strict";

  /* 26 September 2026. Arriving from "Help with your existing website" on
     /other-services/ carries ?area=website-help, and the matching option is
     preselected — the same query-string pattern contact-enquiry.js uses for
     `service`. It only fills an optional field the visitor can still change;
     without scripting the field is simply left blank. */
  const form = document.querySelector('form[name="smaller-work-enquiry"]');
  if (!form || !form.elements.area) return;

  const AREAS = {
    "website-help": "Help with my existing website",
  };

  const area = new URLSearchParams(window.location.search).get("area");
  const value = area && AREAS[area];
  if (!value) return;

  const select = form.elements.area;
  if (Array.prototype.some.call(select.options, function (option) { return option.value === value; })) {
    select.value = value;
  }
})();

/* ==============================================================
   READING OPTIONS — Alexander Watson Studio's own site
   Standard:  docs/reading-control-standard.md
   Component: _shared/reading-options/reading-options.js

   This is the shared component with the two per-project decisions
   made. Keep it in step with the shared file: the mechanism, the
   class names and the two <html> attributes are the contract, and
   changing them here would silently fork it.

     · MOUNT   the footer, in its own row above the legal line.
               The alternative was the navigation, which is where
               Maya Bennett puts it — but this site's nav panel
               only exists below 62rem, so a nav mount would be a
               control that disappears on a desktop. The footer is
               on every page at every width, it is already where
               this site keeps its meta links, and it needs no new
               furniture in the header.
     · GROUPS  the studio's wording. Plain words, no disability
               label, no claim about compliance.
   ============================================================== */
(function(){
  "use strict";
  var cfg = window.READING_OPTIONS;
  if (!cfg || !cfg.enabled) return;

  /* MOUNT. The element the footer emits when the capability is on. Absent
     means the site is switched off at the template level, so there is
     nothing to build and nothing to clean up. */
  var mount = document.querySelector("[data-reading-mount]");
  if (!mount) return;
  var doc = document.documentElement;

  var GROUPS = [
    { key:"size", attr:"data-read-size", legend:"Text size",
      options:[["default","Default"],["large","Larger"],["largest","Largest"]] },
    { key:"mode", attr:"data-read-mode", legend:"Reading mode",
      options:[["default","Default"],["contrast","Higher contrast"],["soft","Softer"]] }
  ];

  var state = { size:"default", mode:"default" };
  try{
    var saved = JSON.parse(localStorage.getItem(cfg.storageKey) || "{}");
    GROUPS.forEach(function(g){
      var v = saved[g.key];
      if (v && g.options.some(function(o){ return o[0] === v; })) state[g.key] = v;
    });
  }catch(e){}

  function apply(){
    GROUPS.forEach(function(g){
      if (state[g.key] === "default") doc.removeAttribute(g.attr);
      else doc.setAttribute(g.attr, state[g.key]);
    });
    try{ localStorage.setItem(cfg.storageKey, JSON.stringify(state)); }catch(e){}
  }

  var wrap = document.createElement("div");
  wrap.className = "ro";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ro__btn";
  btn.id = "ro-btn";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "ro-panel");
  btn.appendChild(document.createTextNode(cfg.label || "Reading options"));

  var panel = document.createElement("div");
  panel.className = "ro__panel";
  panel.id = "ro-panel";
  panel.hidden = true;

  GROUPS.forEach(function(g){
    var set = document.createElement("fieldset");
    set.className = "ro__group";
    var leg = document.createElement("legend");
    leg.className = "ro__legend";
    leg.textContent = g.legend;
    set.appendChild(leg);
    g.options.forEach(function(opt){
      var label = document.createElement("label");
      label.className = "ro__opt";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "ro-" + g.key;
      input.value = opt[0];
      input.checked = state[g.key] === opt[0];
      input.addEventListener("change", function(){ state[g.key] = opt[0]; apply(); });
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt[1]));
      set.appendChild(label);
    });
    panel.appendChild(set);
  });

  var note = document.createElement("p");
  note.className = "ro__note";
  note.textContent = "Kept on this device only, so the page opens this way next time. Nothing is sent anywhere.";
  panel.appendChild(note);

  wrap.appendChild(btn);
  wrap.appendChild(panel);

  mount.appendChild(wrap);

  function open(is){
    panel.hidden = !is;
    btn.setAttribute("aria-expanded", String(is));
  }
  btn.addEventListener("click", function(){ open(panel.hidden); });
  /* Capture, so that inside an open panel Escape closes the panel and stops
     there rather than also closing the menu the panel is sitting in. */
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && !panel.hidden){
      e.stopPropagation();
      open(false);
      btn.focus();
    }
  }, true);
  document.addEventListener("click", function(e){
    if (!panel.hidden && !e.target.closest(".ro")) open(false);
  });

  apply();
})();

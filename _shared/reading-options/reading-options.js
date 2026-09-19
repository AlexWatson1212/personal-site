/* ==============================================================
   READING OPTIONS — shared component
   Alexander Watson Studio · docs/reading-control-standard.md

   Pair with reading-options.css and reading-options.head.html.
   Reads window.READING_OPTIONS and returns immediately when the
   site has not switched the control on, so importing it costs a
   site that does not use it one function call.

   Two things to decide per project and change here:
     · MOUNT   — where the control belongs in this design
     · GROUPS  — the wording, in this practice's voice
   ============================================================== */
(function(){
  "use strict";
  var cfg = window.READING_OPTIONS;
  if (!cfg || !cfg.enabled) return;

  /* MOUNT. Maya Bennett puts it in the navigation, before the primary
     action. Another practice will want it somewhere else — that is the
     point. Change these two lines and the panel CSS follows. */
  var mount = document.getElementById("nav");
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

  var before = mount.querySelector(".btn");
  mount.insertBefore(wrap, before || null);

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

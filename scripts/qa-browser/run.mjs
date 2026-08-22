#!/usr/bin/env node
/**
 * aw-qa-browser — run.mjs
 *
 * Browser-based QA harness for the rendered `_preview/` tree.
 *
 * Usage (from the repo root):
 *   node scripts/preview/render.mjs        # produce _preview/
 *   node scripts/qa-browser/run.mjs        # run this harness
 *
 * Writes scripts/qa-browser/report.json and prints a grouped summary.
 * Exit code 1 when there are real failures; 0 otherwise.
 *
 * This harness NEVER modifies site sources. It only reads and reports.
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const PREVIEW = path.join(ROOT, "_preview");
const REPORT = path.join(HERE, "report.json");

const WIDTHS = [320, 375, 768, 1024, 1280, 1440];
const HEIGHT = 900;
const DEEP_WIDTH = 1280;
const MAX_TAB_STOPS = 25;

/* Per-route caps so a systemic issue cannot produce a 100MB report. */
const CAP_OVERFLOW = 40;
const CAP_CONTRAST = 60;
const CAP_MOTION = 40;

/* ───────────────────────────── binary discovery ─────────────────────────── */

function findChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers"];
  const names = new Set(["chrome", "headless_shell", "chrome-headless-shell", "chromium"]);
  const hits = [];
  const walk = (dir, depth) => {
    if (depth > 4) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (e.isFile() && names.has(e.name)) {
        try { fs.accessSync(p, fs.constants.X_OK); hits.push(p); } catch { /* not executable */ }
      }
    }
  };
  for (const r of roots) walk(r, 0);
  /* Prefer a full chromium build over the headless shell. */
  hits.sort((a, b) => {
    const score = (s) => (s.includes("chrome-linux/chrome") ? 0 : s.includes("headless") ? 1 : 2);
    return score(a) - score(b) || a.localeCompare(b);
  });
  return hits;
}

async function launchBrowser() {
  const attempts = [{ label: "default" }, ...findChromium().map((p) => ({ label: p, executablePath: p }))];
  const errs = [];
  for (const a of attempts) {
    try {
      const b = await chromium.launch({
        headless: true,
        ...(a.executablePath ? { executablePath: a.executablePath } : {}),
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
      });
      return { browser: b, via: a.label };
    } catch (e) {
      errs.push(`${a.label}: ${String(e.message).split("\n")[0]}`);
    }
  }
  throw new Error("Could not launch Chromium.\n" + errs.join("\n"));
}

/* ─────────────────────────────── static server ──────────────────────────── */

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
  ".pdf": "application/pdf", ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".xml": "application/xml",
};

function safeJoin(base, urlPath) {
  const rel = urlPath.replace(/^\/+/, "");
  const abs = path.resolve(base, rel);
  if (abs !== base && !abs.startsWith(base + path.sep)) return null;
  return abs;
}

function statFile(p) {
  if (!p) return null;
  try { const s = fs.statSync(p); return s.isFile() ? s : null; } catch { return null; }
}

function resolveRequest(urlPath) {
  /* Strip the ?v=… cache-buster (and any hash) before touching the filesystem. */
  let clean = urlPath.split("#")[0].split("?")[0];
  try { clean = decodeURIComponent(clean); } catch { /* keep raw */ }
  if (!clean.startsWith("/")) clean = "/" + clean;

  /* /assets/** falls through to the repo root — the preview harness does not copy assets. */
  if (clean.startsWith("/assets/")) {
    const p = safeJoin(ROOT, clean);
    return { file: statFile(p) ? p : null, urlPath: clean };
  }

  const candidates = [];
  if (clean.endsWith("/")) candidates.push(safeJoin(PREVIEW, clean + "index.html"));
  else {
    candidates.push(safeJoin(PREVIEW, clean));
    candidates.push(safeJoin(PREVIEW, clean + "/index.html"));
  }
  for (const c of candidates) if (statFile(c)) return { file: c, urlPath: clean };
  return { file: null, urlPath: clean };
}

/** Missing images/fonts are a known container artefact, not a site defect. */
const isEnvArtefact = (u) => u.startsWith("/assets/images/") || u.startsWith("/assets/fonts/");

function startServer(missingLog) {
  const server = http.createServer((req, res) => {
    const { file, urlPath } = resolveRequest(req.url || "/");
    if (!file) {
      missingLog.push({ url: urlPath, referer: req.headers.referer || null, envArtefact: isEnvArtefact(urlPath) });
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404");
      return;
    }
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

/* ────────────────────────────── route discovery ─────────────────────────── */

function enumerateRoutes() {
  const routes = [];
  const walk = (dir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && (e.name === "index.html" || e.name === "404.html")) {
        const rel = path.relative(PREVIEW, p).split(path.sep).join("/");
        routes.push(rel.endsWith("index.html") ? "/" + rel.slice(0, -"index.html".length) : "/" + rel);
      }
    }
  };
  walk(PREVIEW);
  return [...new Set(routes)].sort();
}

/* ───────────────────── in-page helper library (addInitScript) ───────────── */

const HELPERS = String.raw`
window.__qa = (function () {
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, TITLE: 1, HEAD: 1, META: 1, LINK: 1 };

  function selPath(el) {
    if (!el || el.nodeType !== 1) return "(none)";
    var parts = [], n = el, depth = 0;
    while (n && n.nodeType === 1 && depth < 6) {
      var s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(s + "#" + n.id); break; }
      var cls = (n.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
      if (cls.length) s += "." + cls.join(".");
      var par = n.parentElement;
      if (par) {
        var sibs = Array.prototype.filter.call(par.children, function (c) { return c.tagName === n.tagName; });
        if (sibs.length > 1) s += ":nth-of-type(" + (sibs.indexOf(n) + 1) + ")";
      }
      parts.unshift(s);
      n = par; depth++;
    }
    return parts.join(" > ");
  }

  function invisible(el, cs) {
    cs = cs || getComputedStyle(el);
    return cs.display === "none" || cs.visibility === "hidden" || cs.visibility === "collapse" || el.hasAttribute("hidden");
  }

  function insideScrollableX(el) {
    var n = el.parentElement, depth = 0;
    while (n && n !== document.documentElement && depth < 40) {
      var ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return selPath(n);
      n = n.parentElement; depth++;
    }
    return null;
  }

  /* ── horizontal overflow ────────────────────────────────────────────── */
  function overflow(vw, cap) {
    var out = [];
    var all = document.querySelectorAll("body *");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (SKIP_TAGS[el.tagName]) continue;
      var cs = getComputedStyle(el);
      if (cs.position === "fixed") continue;
      if (invisible(el, cs)) continue;
      var r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      var overRight = r.right - vw;
      var overLeft = -r.left;
      if (overRight <= 1 && overLeft <= 1) continue;
      var scroller = insideScrollableX(el);
      if (scroller) continue;
      out.push({
        selector: selPath(el),
        tag: el.tagName.toLowerCase(),
        width: Math.round(r.width * 10) / 10,
        left: Math.round(r.left * 10) / 10,
        right: Math.round(r.right * 10) / 10,
        overflowRightPx: overRight > 1 ? Math.round(overRight * 10) / 10 : 0,
        overflowLeftPx: overLeft > 1 ? Math.round(overLeft * 10) / 10 : 0,
        overflowPx: Math.round(Math.max(overRight, overLeft) * 10) / 10,
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80)
      });
    }
    out.sort(function (a, b) { return b.overflowPx - a.overflowPx || a.selector.localeCompare(b.selector); });
    return { total: out.length, items: out.slice(0, cap) };
  }

  /* ── heading wrapping quality ───────────────────────────────────────── */
  function lineBoxCount(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var tops = [], n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      var range = document.createRange();
      range.selectNodeContents(n);
      var rects = range.getClientRects();
      for (var i = 0; i < rects.length; i++) {
        var rc = rects[i];
        if (rc.width <= 0 && rc.height <= 0) continue;
        tops.push(Math.round(rc.top * 2) / 2);
      }
    }
    var uniq = [];
    tops.sort(function (a, b) { return a - b; });
    for (var j = 0; j < tops.length; j++) {
      if (!uniq.length || Math.abs(tops[j] - uniq[uniq.length - 1]) > 3) uniq.push(tops[j]);
    }
    return uniq.length;
  }

  function wordsByLine(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var entries = [], n;
    while ((n = walker.nextNode())) {
      var v = n.nodeValue || "";
      if (!v.trim()) continue;
      var re = /\S+/g, m;
      while ((m = re.exec(v))) {
        var range = document.createRange();
        range.setStart(n, m.index);
        range.setEnd(n, m.index + m[0].length);
        var rect = range.getBoundingClientRect();
        if (rect.width <= 0 && rect.height <= 0) continue;
        entries.push({ word: m[0], top: rect.top });
      }
    }
    var lines = [];
    for (var i = 0; i < entries.length; i++) {
      var last = lines[lines.length - 1];
      if (last && Math.abs(entries[i].top - last.top) <= 3) last.words.push(entries[i].word);
      else lines.push({ top: entries[i].top, words: [entries[i].word] });
    }
    return lines;
  }

  function headings(vw) {
    var out = [];
    var els = document.querySelectorAll("h1, h2");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var cs = getComputedStyle(el);
      if (invisible(el, cs)) continue;
      // Deliberately visually-hidden headings (the sr-only pattern) are 1px
      // and clipped on purpose. They are structure for assistive technology,
      // not layout, so they are not assessed for wrapping or clipping.
      var r0 = el.getBoundingClientRect();
      var srOnly =
        el.classList.contains("sr-only") ||
        el.classList.contains("visually-hidden") ||
        (cs.position === "absolute" && r0.width <= 1 && r0.height <= 1) ||
        /inset\(\s*50%/.test(cs.clipPath || "");
      if (srOnly) continue;
      var text = (el.textContent || "").trim().replace(/\s+/g, " ");
      if (!text) continue;
      var lines = wordsByLine(el);
      var lineBoxes = lineBoxCount(el);
      var totalWords = text.split(/\s+/).filter(Boolean).length;
      var lastLineWords = lines.length ? lines[lines.length - 1].words.length : 0;
      var fontSize = parseFloat(cs.fontSize) || 0;
      // A scrollHeight taller than clientHeight only means text is lost when
      // the box actually clips. On a heading whose overflow is visible it just
      // means the glyphs extend past the content box, which is what a display
      // serif with tight leading does: Instrument Serif overshoots a 1.2
      // line-height by two or three pixels on every two-line heading. Judge
      // the overflow only where something is there to cut it off.
      var clipsOwnOverflow =
        cs.overflow !== "visible" || cs.overflowY !== "visible" || cs.overflowX !== "visible";
      var clipped = clipsOwnOverflow && el.scrollHeight > el.clientHeight + 1;
      out.push({
        selector: selPath(el),
        level: el.tagName.toLowerCase(),
        text: text.slice(0, 160),
        lineBoxes: lineBoxes,
        linesByWord: lines.length,
        words: totalWords,
        lastLineWords: lastLineWords,
        lastLineText: lines.length ? lines[lines.length - 1].words.join(" ").slice(0, 80) : "",
        fontSizePx: Math.round(fontSize * 100) / 100,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        orphan: totalWords > 4 && lastLineWords === 1 && lines.length > 1,
        clipped: clipped,
        tooSmall: vw >= 1024 && fontSize > 0 && fontSize < 20
      });
    }
    out.sort(function (a, b) { return a.selector.localeCompare(b.selector); });
    return out;
  }

  /* ── clipped containers holding headings ────────────────────────────── */
  function clipping() {
    var out = [];
    var all = document.querySelectorAll("body *");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (SKIP_TAGS[el.tagName]) continue;
      var cs = getComputedStyle(el);
      if (cs.overflow !== "hidden" && cs.overflowY !== "hidden") continue;
      if (invisible(el, cs)) continue;
      var over = el.scrollHeight - el.clientHeight;
      if (over <= 4) continue;
      var h = el.querySelector("h1, h2, h3");
      if (!h) continue;
      out.push({
        selector: selPath(el),
        overflowMode: cs.overflow + " / " + cs.overflowY,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        clippedPx: over,
        heading: h.tagName.toLowerCase(),
        headingText: (h.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100)
      });
    }
    out.sort(function (a, b) { return b.clippedPx - a.clippedPx || a.selector.localeCompare(b.selector); });
    return out;
  }

  /* ── focus / keyboard ───────────────────────────────────────────────── */
  var FOCUS_SEL = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]),' +
    ' select:not([disabled]), textarea:not([disabled]), summary, iframe, audio[controls], video[controls],' +
    ' [contenteditable=""], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

  function styleSnap(el) {
    if (!el || el.nodeType !== 1) return null;
    var cs = getComputedStyle(el);
    return {
      outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor,
      outlineOffset: cs.outlineOffset,
      boxShadow: cs.boxShadow,
      border: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth,
               cs.borderTopStyle, cs.borderTopColor, cs.borderBottomColor].join("|"),
      background: cs.backgroundColor + " | " + cs.backgroundImage,
      color: cs.color,
      textDecoration: cs.textDecorationLine + " " + cs.textDecorationColor + " " + cs.textDecorationThickness,
      transform: cs.transform,
      filter: cs.filter,
      opacity: cs.opacity
    };
  }

  function markFocusables() {
    var els = Array.prototype.slice.call(document.querySelectorAll(FOCUS_SEL));
    var list = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.hasAttribute("hidden")) continue;
      if (el.closest("[inert]")) continue;
      el.setAttribute("data-qa-fidx", String(list.length));
      var r = el.getBoundingClientRect();
      list.push({
        domIndex: list.length,
        selector: selPath(el),
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.getAttribute("aria-label") || el.getAttribute("value") || "").trim().replace(/\s+/g, " ").slice(0, 60),
        href: el.getAttribute("href") || null,
        offscreen: r.width === 0 || r.height === 0 || r.bottom < 0 || r.right < 0,
        blurSnap: styleSnap(el)
      });
    }
    return list;
  }

  function activeInfo() {
    var el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) {
      return { none: true, tag: el ? el.tagName.toLowerCase() : "(null)" };
    }
    var idx = el.getAttribute && el.getAttribute("data-qa-fidx");
    var matchesFV = false;
    try { matchesFV = el.matches(":focus-visible"); } catch (e) { matchesFV = false; }
    return {
      none: false,
      domIndex: idx === null || idx === undefined ? -1 : parseInt(idx, 10),
      selector: selPath(el),
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 60),
      focusVisible: matchesFV,
      focusSnap: styleSnap(el)
    };
  }

  function unmarkFocusables() {
    var els = document.querySelectorAll("[data-qa-fidx]");
    for (var i = 0; i < els.length; i++) els[i].removeAttribute("data-qa-fidx");
  }

  /* ── landmarks & heading order ──────────────────────────────────────── */
  function landmarks() {
    var mains = document.querySelectorAll("main, [role=main]");
    var firstFocusable = null;
    var cands = document.querySelectorAll(FOCUS_SEL);
    for (var i = 0; i < cands.length; i++) {
      var cs = getComputedStyle(cands[i]);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      firstFocusable = cands[i]; break;
    }
    var skipOk = false, firstInfo = null;
    if (firstFocusable) {
      var t = (firstFocusable.textContent || "").trim().toLowerCase();
      var href = firstFocusable.getAttribute("href") || "";
      var cls = firstFocusable.getAttribute("class") || "";
      skipOk = /skip/.test(t) || /skip/.test(cls);
      if (skipOk && !(href.charAt(0) === "#")) skipOk = false;
      firstInfo = { selector: selPath(firstFocusable), text: t.slice(0, 60), href: href };
    }
    var hs = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    var seq = [], skips = [];
    var prev = 0;
    for (var j = 0; j < hs.length; j++) {
      var el = hs[j];
      if (invisible(el)) continue;
      var lvl = parseInt(el.tagName.charAt(1), 10);
      seq.push({ level: lvl, text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70), selector: selPath(el) });
      if (prev && lvl > prev + 1) {
        skips.push({ from: "h" + prev, to: "h" + lvl, selector: selPath(el), text: (el.textContent || "").trim().slice(0, 70) });
      }
      prev = lvl;
    }
    var h1s = seq.filter(function (s) { return s.level === 1; });
    return {
      mainCount: mains.length,
      hasHeader: !!document.querySelector("header, [role=banner]"),
      hasFooter: !!document.querySelector("footer, [role=contentinfo]"),
      hasNav: !!document.querySelector("nav, [role=navigation]"),
      skipLinkFirst: skipOk,
      firstFocusable: firstInfo,
      h1Count: h1s.length,
      h1Texts: h1s.map(function (s) { return s.text; }),
      headingSkips: skips,
      headingSequence: seq.map(function (s) { return s.level; }).join(",")
    };
  }

  /* ── reduced motion ─────────────────────────────────────────────────── */
  function maxDur(v) {
    if (!v) return 0;
    var parts = String(v).split(",");
    var max = 0;
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim();
      var n = parseFloat(s);
      if (isNaN(n)) continue;
      if (/ms$/.test(s)) n = n / 1000;
      if (n > max) max = n;
    }
    return max;
  }

  function motion(cap) {
    var out = [];
    var all = document.querySelectorAll("html, body, body *");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (SKIP_TAGS[el.tagName]) continue;
      var cs = getComputedStyle(el);
      var a = maxDur(cs.animationDuration);
      var t = maxDur(cs.transitionDuration);
      if (a <= 0.05 && t <= 0.05) continue;
      if (invisible(el, cs)) continue;
      out.push({
        selector: selPath(el),
        animationDurationS: Math.round(a * 1000) / 1000,
        animationName: cs.animationName,
        transitionDurationS: Math.round(t * 1000) / 1000,
        transitionProperty: String(cs.transitionProperty).slice(0, 80)
      });
    }
    /* Collapse to distinct selectors so one repeated rule is one finding. */
    var seen = {}, uniq = [];
    for (var k = 0; k < out.length; k++) {
      var key = out[k].selector + "|" + out[k].animationDurationS + "|" + out[k].transitionDurationS;
      if (seen[key]) { seen[key].count++; continue; }
      var rec = Object.assign({ count: 1 }, out[k]);
      seen[key] = rec; uniq.push(rec);
    }
    uniq.sort(function (a, b) {
      return (b.animationDurationS + b.transitionDurationS) - (a.animationDurationS + a.transitionDurationS)
        || a.selector.localeCompare(b.selector);
    });
    return { total: out.length, distinct: uniq.length, items: uniq.slice(0, cap) };
  }

  /* ── colour contrast (WCAG 2.2) ─────────────────────────────────────── */
  function parseColor(str) {
    if (!str) return null;
    var m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[,\s\/]+/).filter(function (s) { return s.length; }).map(parseFloat);
    if (p.length < 3 || p.some(isNaN)) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }

  function over(fg, bg) {
    var a = fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
  }

  function lum(c) {
    function ch(v) { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }

  function ratio(a, b) {
    var l1 = lum(a), l2 = lum(b);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* Walk ancestors compositing translucent backgrounds; bail out on images/gradients. */
  function resolveBackground(el) {
    var stack = [], n = el;
    while (n && n.nodeType === 1) {
      var cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") {
        return { skipped: true, reason: /gradient/i.test(cs.backgroundImage) ? "gradient background" : "image background",
                 detail: cs.backgroundImage.slice(0, 90), at: selPath(n) };
      }
      var c = parseColor(cs.backgroundColor);
      if (c && c.a > 0) {
        if (c.a >= 0.999) {
          var res = c;
          for (var i = stack.length - 1; i >= 0; i--) res = over(stack[i], res);
          return { skipped: false, color: res, at: selPath(n) };
        }
        stack.push(c);
      }
      n = n.parentElement;
    }
    var white = { r: 255, g: 255, b: 255, a: 1 };
    var out = white;
    for (var j = stack.length - 1; j >= 0; j--) out = over(stack[j], out);
    return { skipped: false, color: out, at: "(canvas default white)", assumed: true };
  }

  function contrast(cap) {
    var fails = [], skipped = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n, seen = {};
    while ((n = walker.nextNode())) {
      var raw = n.nodeValue || "";
      if (!raw.trim()) continue;
      var el = n.parentElement;
      if (!el || SKIP_TAGS[el.tagName]) continue;
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (parseFloat(cs.opacity) === 0) continue;
      if (el.closest("[aria-hidden=true]")) continue;
      var range = document.createRange();
      range.selectNodeContents(n);
      var rect = range.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      /* Clipped-to-nothing visually-hidden text (skip links etc.). */
      if (rect.bottom < -500 || rect.right < -500) continue;

      var fg = parseColor(cs.color);
      if (!fg || fg.a === 0) continue;
      var bgRes = resolveBackground(el);
      var size = parseFloat(cs.fontSize) || 16;
      var weight = parseInt(cs.fontWeight, 10) || 400;
      var bold = weight >= 700;
      var large = size >= 24 || (bold && size >= 18.66);
      var required = large ? 3 : 4.5;

      if (bgRes.skipped) {
        var sk = "S|" + selPath(el) + "|" + bgRes.reason;
        if (seen[sk]) { seen[sk].count++; continue; }
        var srec = { count: 1, selector: selPath(el), reason: bgRes.reason, backgroundAt: bgRes.at,
                     detail: bgRes.detail, color: cs.color, fontSizePx: size,
                     text: raw.trim().replace(/\s+/g, " ").slice(0, 70) };
        seen[sk] = srec; skipped.push(srec);
        continue;
      }
      var fgc = fg.a >= 0.999 ? fg : over(fg, bgRes.color);
      var cr = Math.round(ratio(fgc, bgRes.color) * 100) / 100;
      if (cr >= required) continue;
      var key = "F|" + selPath(el) + "|" + cs.color + "|" + Math.round(bgRes.color.r) + "," + Math.round(bgRes.color.g) + "," + Math.round(bgRes.color.b);
      if (seen[key]) { seen[key].count++; continue; }
      var rec = {
        count: 1, selector: selPath(el), text: raw.trim().replace(/\s+/g, " ").slice(0, 70),
        color: cs.color,
        background: "rgb(" + Math.round(bgRes.color.r) + ", " + Math.round(bgRes.color.g) + ", " + Math.round(bgRes.color.b) + ")",
        backgroundAt: bgRes.at, backgroundAssumed: !!bgRes.assumed,
        fontSizePx: Math.round(size * 100) / 100, fontWeight: weight, largeText: large,
        ratio: cr, required: required, shortfall: Math.round((required - cr) * 100) / 100
      };
      seen[key] = rec; fails.push(rec);
    }
    fails.sort(function (a, b) { return a.ratio - b.ratio || a.selector.localeCompare(b.selector); });
    skipped.sort(function (a, b) { return a.selector.localeCompare(b.selector); });
    return { total: fails.length, items: fails.slice(0, cap), skipped: skipped.slice(0, cap) };
  }

  return {
    selPath: selPath, overflow: overflow, headings: headings, clipping: clipping,
    markFocusables: markFocusables, activeInfo: activeInfo, unmarkFocusables: unmarkFocusables,
    landmarks: landmarks, motion: motion, contrast: contrast
  };
})();
`;

/* ────────────────────────────── page utilities ──────────────────────────── */

async function newContext(browser, opts) {
  const ctx = await browser.newContext({
    viewport: { width: opts.width, height: opts.height },
    deviceScaleFactor: opts.deviceScaleFactor || 1,
    ...(opts.reducedMotion ? { reducedMotion: opts.reducedMotion } : {}),
    javaScriptEnabled: true,
    bypassCSP: true,
  });
  await ctx.addInitScript({ content: HELPERS });
  return ctx;
}

async function gotoRoute(page, base, route) {
  const errors = [];
  const onErr = (e) => errors.push(String(e.message || e).slice(0, 200));
  page.on("pageerror", onErr);
  try {
    await page.goto(base + route, { waitUntil: "load", timeout: 30000 });
  } catch (e) {
    errors.push("navigation: " + String(e.message).split("\n")[0]);
  }
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch { /* ignore */ }
  await page.waitForTimeout(60);
  page.off("pageerror", onErr);
  return errors;
}

async function forceOverflowVisible(page) {
  await page.addStyleTag({
    content: "html, body { overflow-x: visible !important; overflow-y: visible !important; " +
             "max-width: none !important; width: auto !important; }",
  });
  await page.waitForTimeout(30);
}

/* ─────────────────────────────────── main ───────────────────────────────── */

async function main() {
  const t0 = Date.now();

  if (!fs.existsSync(PREVIEW)) {
    console.error("_preview/ not found. Run `node scripts/preview/render.mjs` from the repo root first.");
    process.exit(2);
  }
  const routes = enumerateRoutes();
  if (!routes.length) {
    console.error("No routes found under _preview/.");
    process.exit(2);
  }

  const missing = [];
  const { server, port } = await startServer(missing);
  const base = `http://127.0.0.1:${port}`;

  const { browser, via } = await launchBrowser();

  /** report.checks[checkName] = [findings…] */
  const findings = {
    overflow: [], headingQuality: [], clipping: [],
    zoomOverflow: [], zoomClipping: [],
    focus: [], landmarks: [], reducedMotion: [], contrast: [],
    pageErrors: [],
  };
  const notAssessed = { missingAssets: [], contrastSkipped: [], notes: [] };

  const perRouteStats = {};

  /* ── Phase 1: every route at every width ─────────────────────────────── */
  for (const width of WIDTHS) {
    const ctx = await newContext(browser, { width, height: HEIGHT });
    const page = await ctx.newPage();
    for (const route of routes) {
      const errs = await gotoRoute(page, base, route);
      for (const e of errs) findings.pageErrors.push({ route, viewport: width, message: e });

      const heads = await page.evaluate((w) => window.__qa.headings(w), width);
      const clips = await page.evaluate(() => window.__qa.clipping());

      for (const h of heads) {
        if (h.orphan || h.clipped || h.tooSmall) {
          findings.headingQuality.push({ route, viewport: width, ...h });
        }
      }
      for (const c of clips) findings.clipping.push({ route, viewport: width, ...c });

      /* Deep checks that must run before the layout is perturbed. */
      if (width === DEEP_WIDTH) {
        const lm = await page.evaluate(() => window.__qa.landmarks());
        const problems = [];
        if (lm.mainCount !== 1) problems.push(`<main> count is ${lm.mainCount} (expected exactly 1)`);
        if (!lm.hasHeader) problems.push("no <header>/[role=banner]");
        if (!lm.hasFooter) problems.push("no <footer>/[role=contentinfo]");
        if (!lm.skipLinkFirst) {
          problems.push("first focusable element is not a skip link: " +
            (lm.firstFocusable ? `${lm.firstFocusable.selector} ("${lm.firstFocusable.text}")` : "(no focusable elements)"));
        }
        if (lm.h1Count !== 1) problems.push(`h1 count is ${lm.h1Count} (expected exactly 1)`);
        for (const s of lm.headingSkips) problems.push(`heading level skips ${s.from} → ${s.to} at ${s.selector} ("${s.text}")`);
        if (problems.length) findings.landmarks.push({ route, viewport: width, problems, detail: lm });

        const con = await page.evaluate((cap) => window.__qa.contrast(cap), CAP_CONTRAST);
        for (const c of con.items) findings.contrast.push({ route, viewport: width, ...c });
        for (const s of con.skipped) notAssessed.contrastSkipped.push({ route, viewport: width, ...s });
        if (con.total > con.items.length) {
          notAssessed.notes.push(`${route}: contrast findings truncated (${con.total} distinct, first ${con.items.length} kept)`);
        }

        /* Keyboard order + focus visibility. */
        const focusables = await page.evaluate(() => window.__qa.markFocusables());
        const stops = [];
        await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
        for (let i = 0; i < Math.min(MAX_TAB_STOPS, Math.max(focusables.length, 1)); i++) {
          await page.keyboard.press("Tab");
          const info = await page.evaluate(() => window.__qa.activeInfo());
          if (info.none) break;
          stops.push(info);
        }
        await page.evaluate(() => window.__qa.unmarkFocusables());

        const fProblems = [];
        let expected = 0;
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          const src = s.domIndex >= 0 ? focusables[s.domIndex] : null;
          let visible = null;
          if (src && src.blurSnap && s.focusSnap) {
            visible = JSON.stringify(src.blurSnap) !== JSON.stringify(s.focusSnap);
          }
          const rec = {
            tabIndexInOrder: i + 1, domIndex: s.domIndex, selector: s.selector, tag: s.tag,
            text: s.text, focusVisibleMatched: s.focusVisible, indicatorChanged: visible,
            blurSnap: src ? src.blurSnap : null, focusSnap: s.focusSnap,
          };
          if (visible === false) fProblems.push({ type: "no-visible-focus-indicator", ...rec });
          if (s.domIndex >= 0) {
            if (s.domIndex < expected) fProblems.push({ type: "focus-order-out-of-dom-order", expectedAtLeastDomIndex: expected, ...rec });
            expected = Math.max(expected, s.domIndex + 1);
          } else {
            fProblems.push({ type: "focus-target-not-in-focusable-set", ...rec });
          }
        }
        if (!stops.length && focusables.length) fProblems.push({ type: "tab-produced-no-focus", focusableCount: focusables.length });
        if (fProblems.length) {
          findings.focus.push({ route, viewport: width, tabStops: stops.length, focusableCount: focusables.length, problems: fProblems });
        }
        perRouteStats[route] = { focusables: focusables.length, tabStops: stops.length };
      }

      /* Overflow last — it perturbs html/body overflow. */
      await forceOverflowVisible(page);
      const ov = await page.evaluate(([w, cap]) => window.__qa.overflow(w, cap), [width, CAP_OVERFLOW]);
      for (const o of ov.items) findings.overflow.push({ route, viewport: width, ...o });
      if (ov.total > ov.items.length) {
        notAssessed.notes.push(`${route} @${width}: overflow findings truncated (${ov.total} total, first ${ov.items.length} kept)`);
      }
    }
    await page.close();
    await ctx.close();
  }

  /* ── Phase 2: reduced motion at 1280 ─────────────────────────────────── */
  {
    const ctx = await newContext(browser, { width: DEEP_WIDTH, height: HEIGHT, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of routes) {
      await gotoRoute(page, base, route);
      const m = await page.evaluate((cap) => window.__qa.motion(cap), CAP_MOTION);
      if (m.distinct) {
        findings.reducedMotion.push({
          route, viewport: DEEP_WIDTH, totalElements: m.total, distinctRules: m.distinct, items: m.items,
        });
      }
    }
    await page.close();
    await ctx.close();
  }

  /* ── Phase 3: 200% zoom, two ways ────────────────────────────────────── */
  const zoomModes = [
    { label: "640x450@2x (deviceScaleFactor 2)", width: 640, height: 450, deviceScaleFactor: 2 },
    { label: "640x900@1x (re-run of overflow check at width 640)", width: 640, height: HEIGHT, deviceScaleFactor: 1 },
  ];
  for (const mode of zoomModes) {
    const ctx = await newContext(browser, mode);
    const page = await ctx.newPage();
    for (const route of routes) {
      await gotoRoute(page, base, route);
      const clips = await page.evaluate(() => window.__qa.clipping());
      for (const c of clips) findings.zoomClipping.push({ route, mode: mode.label, viewport: mode.width, ...c });
      await forceOverflowVisible(page);
      const ov = await page.evaluate(([w, cap]) => window.__qa.overflow(w, cap), [mode.width, CAP_OVERFLOW]);
      for (const o of ov.items) findings.zoomOverflow.push({ route, mode: mode.label, viewport: mode.width, ...o });
    }
    await page.close();
    await ctx.close();
  }

  await browser.close();
  await new Promise((r) => server.close(r));

  /* ── Classify ────────────────────────────────────────────────────────── */
  for (const m of missing) {
    const rec = { url: m.url, referer: m.referer };
    if (m.envArtefact) notAssessed.missingAssets.push(rec);
    else findings.pageErrors.push({ route: "(server)", viewport: null, message: `404 for ${m.url}` });
  }
  /* De-dup + order the not-assessed asset list. */
  {
    const seen = new Map();
    for (const r of notAssessed.missingAssets) {
      const k = r.url;
      if (!seen.has(k)) seen.set(k, { url: k, requests: 0 });
      seen.get(k).requests++;
    }
    notAssessed.missingAssets = [...seen.values()].sort((a, b) => a.url.localeCompare(b.url));
  }

  const orphans = findings.headingQuality.filter((h) => h.orphan && !h.clipped && !h.tooSmall);
  const headingFailures = findings.headingQuality.filter((h) => h.clipped || h.tooSmall);

  const sortBy = (arr, ...keys) =>
    arr.slice().sort((a, b) => {
      for (const k of keys) {
        const av = a[k] ?? "", bv = b[k] ?? "";
        if (typeof av === "number" && typeof bv === "number") { if (av !== bv) return av - bv; }
        else { const c = String(av).localeCompare(String(bv)); if (c) return c; }
      }
      return 0;
    });

  const report = {
    generatedAt: new Date().toISOString(),
    durationSeconds: Math.round((Date.now() - t0) / 100) / 10,
    chromium: { via, version: null },
    server: { root: PREVIEW, assetFallbackRoot: ROOT },
    routes,
    viewports: WIDTHS.map((w) => ({ width: w, height: HEIGHT })),
    counts: {
      routes: routes.length,
      viewports: WIDTHS.length,
      routeViewportChecks: routes.length * WIDTHS.length,
      zoomPasses: zoomModes.length,
    },
    failures: {
      overflow: sortBy(findings.overflow, "route", "viewport", "selector"),
      headingClippedOrTooSmall: sortBy(headingFailures, "route", "viewport", "selector"),
      containerClipping: sortBy(findings.clipping, "route", "viewport", "selector"),
      zoom200Overflow: sortBy(findings.zoomOverflow, "route", "mode", "selector"),
      zoom200Clipping: sortBy(findings.zoomClipping, "route", "mode", "selector"),
      focus: sortBy(findings.focus, "route"),
      landmarks: sortBy(findings.landmarks, "route"),
      reducedMotion: sortBy(findings.reducedMotion, "route"),
      contrast: sortBy(findings.contrast, "route", "selector"),
      pageErrors: sortBy(findings.pageErrors, "route", "viewport", "message"),
    },
    warnings: {
      headingOrphans: sortBy(orphans, "route", "viewport", "selector"),
    },
    notAssessed: {
      missingImagesAndFonts: notAssessed.missingAssets,
      contrastSkippedNonSolidBackground: sortBy(notAssessed.contrastSkipped, "route", "selector"),
      notes: [...new Set(notAssessed.notes)].sort(),
    },
    perRouteStats,
  };

  const failCounts = Object.fromEntries(Object.entries(report.failures).map(([k, v]) => [k, v.length]));
  const totalFailures = Object.values(failCounts).reduce((a, b) => a + b, 0);
  report.summary = {
    failureCounts: failCounts,
    totalFailures,
    warningCounts: { headingOrphans: report.warnings.headingOrphans.length },
    notAssessedCounts: {
      missingImagesAndFonts: report.notAssessed.missingImagesAndFonts.length,
      contrastSkippedNonSolidBackground: report.notAssessed.contrastSkippedNonSolidBackground.length,
    },
    result: totalFailures > 0 ? "FAIL" : "PASS",
  };

  await fsp.writeFile(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

  printSummary(report);
  process.exit(totalFailures > 0 ? 1 : 0);
}

/* ──────────────────────────────── summary ───────────────────────────────── */

function hr(title) { console.log("\n" + title + "\n" + "─".repeat(Math.max(12, title.length))); }
function bullet(s) { console.log("  " + s); }

function printSummary(r) {
  console.log("aw-qa-browser");
  console.log(`  chromium via ....... ${r.chromium.via}`);
  console.log(`  routes ............. ${r.counts.routes}`);
  console.log(`  viewports .......... ${r.counts.viewports} (${r.viewports.map((v) => v.width).join(", ")} × ${r.viewports[0].height})`);
  console.log(`  route × viewport ... ${r.counts.routeViewportChecks} checks (+ ${r.counts.zoomPasses} zoom passes, 1 reduced-motion pass)`);
  console.log(`  duration ........... ${r.durationSeconds}s`);
  console.log(`  report ............. ${path.relative(ROOT, REPORT)}`);

  const f = r.failures;

  hr(`1. Horizontal overflow — ${f.overflow.length} finding(s)`);
  if (!f.overflow.length) bullet("none");
  else {
    const byRoute = new Map();
    for (const o of f.overflow) {
      const k = `${o.route} @${o.viewport}`;
      if (!byRoute.has(k)) byRoute.set(k, []);
      byRoute.get(k).push(o);
    }
    /* Worst-first, ties broken by name, so the ordering is both useful and stable. */
    const groups = [...byRoute.entries()].sort((a, b) => {
      const mx = (l) => Math.max(...l.map((o) => o.overflowPx));
      return mx(b[1]) - mx(a[1]) || a[0].localeCompare(b[0]);
    });
    for (const [k, list] of groups.slice(0, 25)) {
      bullet(k);
      for (const o of list.slice(0, 5)) {
        console.log(`      ${o.selector}  w=${o.width}px  over=+${o.overflowPx}px${o.overflowLeftPx ? ` (left −${o.overflowLeftPx})` : ""}`);
      }
      if (list.length > 5) console.log(`      … ${list.length - 5} more`);
    }
    if (groups.length > 25) bullet(`… ${groups.length - 25} more route/viewport groups`);
  }

  hr(`2. Heading wrapping — ${f.headingClippedOrTooSmall.length} failure(s), ${r.warnings.headingOrphans.length} orphan warning(s)`);
  if (!f.headingClippedOrTooSmall.length) bullet("no clipped or undersized headings");
  for (const h of f.headingClippedOrTooSmall.slice(0, 20)) {
    const why = [h.clipped ? `clipped (${h.scrollHeight} > ${h.clientHeight})` : null, h.tooSmall ? `font-size ${h.fontSizePx}px < 20px` : null].filter(Boolean).join(", ");
    bullet(`${h.route} @${h.viewport} ${h.level} ${h.selector} — ${why} — "${h.text.slice(0, 60)}"`);
  }
  if (f.headingClippedOrTooSmall.length > 20) bullet(`… ${f.headingClippedOrTooSmall.length - 20} more`);
  for (const h of r.warnings.headingOrphans.slice(0, 20)) {
    bullet(`warn: ${h.route} @${h.viewport} ${h.level} — ${h.words} words over ${h.lineBoxes} line(s), last line = "${h.lastLineText}" — "${h.text.slice(0, 50)}"`);
  }
  if (r.warnings.headingOrphans.length > 20) bullet(`… ${r.warnings.headingOrphans.length - 20} more orphan warnings`);

  hr(`3. Clipped containers holding headings — ${f.containerClipping.length} finding(s)`);
  if (!f.containerClipping.length) bullet("none");
  for (const c of f.containerClipping.slice(0, 20)) {
    bullet(`${c.route} @${c.viewport} ${c.selector} — clipped ${c.clippedPx}px (${c.scrollHeight} > ${c.clientHeight}) around ${c.heading} "${c.headingText.slice(0, 45)}"`);
  }
  if (f.containerClipping.length > 20) bullet(`… ${f.containerClipping.length - 20} more`);

  hr(`4. 200% zoom — ${f.zoom200Overflow.length} overflow, ${f.zoom200Clipping.length} clipping finding(s)`);
  if (!f.zoom200Overflow.length && !f.zoom200Clipping.length) bullet("none");
  const zoomTop = f.zoom200Overflow.slice().sort((a, b) => b.overflowPx - a.overflowPx || a.route.localeCompare(b.route) || a.selector.localeCompare(b.selector));
  for (const o of zoomTop.slice(0, 15)) {
    bullet(`${o.route} [${o.mode}] ${o.selector} w=${o.width}px over=+${o.overflowPx}px`);
  }
  if (f.zoom200Overflow.length > 15) bullet(`… ${f.zoom200Overflow.length - 15} more zoom overflow findings`);
  for (const c of f.zoom200Clipping.slice(0, 10)) {
    bullet(`${c.route} [${c.mode}] ${c.selector} clipped ${c.clippedPx}px around ${c.heading}`);
  }
  if (f.zoom200Clipping.length > 10) bullet(`… ${f.zoom200Clipping.length - 10} more zoom clipping findings`);

  hr(`5. Keyboard order & focus visibility — ${f.focus.length} route(s) with problems`);
  if (!f.focus.length) bullet("all tab stops have a visible focus indicator and follow DOM order");
  for (const rt of f.focus.slice(0, 20)) {
    bullet(`${rt.route} (${rt.focusableCount} focusable, ${rt.tabStops} tab stops sampled)`);
    for (const p of rt.problems.slice(0, 6)) {
      console.log(`      ${p.type}: stop ${p.tabIndexInOrder} ${p.selector || ""} "${(p.text || "").slice(0, 40)}"`);
    }
    if (rt.problems.length > 6) console.log(`      … ${rt.problems.length - 6} more`);
  }

  hr(`6. Landmarks & heading order — ${f.landmarks.length} route(s) with problems`);
  if (!f.landmarks.length) bullet("exactly one <main>, header/footer present, skip link first, heading order sound on every route");
  for (const l of f.landmarks.slice(0, 25)) {
    bullet(l.route);
    for (const p of l.problems) console.log(`      ${p}`);
  }

  hr(`7. Reduced motion — ${f.reducedMotion.length} route(s) still animating`);
  if (!f.reducedMotion.length) bullet("no element exceeds 0.05s animation/transition under prefers-reduced-motion: reduce");
  for (const rm of f.reducedMotion.slice(0, 10)) {
    bullet(`${rm.route} — ${rm.totalElements} element(s), ${rm.distinctRules} distinct rule(s)`);
    for (const i of rm.items.slice(0, 5)) {
      console.log(`      ${i.selector}  anim=${i.animationDurationS}s (${i.animationName})  trans=${i.transitionDurationS}s [${i.transitionProperty.slice(0, 40)}]  ×${i.count}`);
    }
    if (rm.items.length > 5) console.log(`      … ${rm.items.length - 5} more`);
  }
  if (f.reducedMotion.length > 10) bullet(`… ${f.reducedMotion.length - 10} more routes`);

  hr(`8. Colour contrast (WCAG 2.2) — ${f.contrast.length} finding(s)`);
  if (!f.contrast.length) bullet("no text below its required ratio on a resolvable solid background");
  for (const c of f.contrast.slice(0, 25)) {
    bullet(`${c.route} ${c.selector} — ${c.ratio}:1 (needs ${c.required}:1) ${c.color} on ${c.background} @${c.fontSizePx}px/${c.fontWeight} — "${c.text.slice(0, 40)}"`);
  }
  if (f.contrast.length > 25) bullet(`… ${f.contrast.length - 25} more`);

  hr(`9. Page/runtime errors & non-asset 404s — ${f.pageErrors.length}`);
  if (!f.pageErrors.length) bullet("none");
  for (const e of f.pageErrors.slice(0, 20)) bullet(`${e.route}${e.viewport ? " @" + e.viewport : ""}: ${e.message}`);
  if (f.pageErrors.length > 20) bullet(`… ${f.pageErrors.length - 20} more`);

  hr("NOT ASSESSED (environment artefacts — never counted as failures)");
  const na = r.notAssessed;
  bullet(`missing /assets/images/ and /assets/fonts/ files: ${na.missingImagesAndFonts.length} distinct URL(s) — these directories are empty in this container`);
  for (const m of na.missingImagesAndFonts.slice(0, 12)) console.log(`      ${m.url}  (${m.requests} request(s))`);
  if (na.missingImagesAndFonts.length > 12) console.log(`      … ${na.missingImagesAndFonts.length - 12} more`);
  bullet(`contrast skipped because the background is an image or gradient: ${na.contrastSkippedNonSolidBackground.length} element(s) — background pixel colour was not guessed`);
  for (const s of na.contrastSkippedNonSolidBackground.slice(0, 12)) {
    console.log(`      ${s.route} ${s.selector} — ${s.reason} at ${s.backgroundAt} — "${(s.text || "").slice(0, 35)}"`);
  }
  if (na.contrastSkippedNonSolidBackground.length > 12) console.log(`      … ${na.contrastSkippedNonSolidBackground.length - 12} more`);
  for (const n of na.notes.slice(0, 12)) bullet(n);
  if (na.notes.length > 12) bullet(`… ${na.notes.length - 12} more notes`);

  hr("TOTALS");
  for (const [k, v] of Object.entries(r.summary.failureCounts)) console.log(`  ${k.padEnd(28, ".")} ${v}`);
  console.log(`  ${"headingOrphans (warning)".padEnd(28, ".")} ${r.summary.warningCounts.headingOrphans}`);
  console.log("");
  console.log(`${r.summary.result} — ${r.summary.totalFailures} real failure(s)`);
}

main().catch((e) => {
  console.error("aw-qa-browser crashed:", e);
  process.exit(2);
});

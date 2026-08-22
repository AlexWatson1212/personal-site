#!/usr/bin/env node
/**
 * scripts/responsive-qa/typography.mjs
 *
 * Editorial typography check. For every route, at every target viewport, it
 * measures the *rendered* line boxes of every visible multi-line h1/h2/h3 by
 * ranging over the text nodes word by word, then reports:
 *
 *   • one-word-line   — a line box containing a single word
 *   • short-final-line — a final line narrower than ~30% of the widest line
 *
 * Both are REVIEW WARNINGS, never hard failures: a one-word line can be a
 * deliberate composition. Anything carrying `data-typo-exempt` (on the
 * heading or any ancestor) is excluded and listed separately, so exemptions
 * stay visible rather than silently shrinking the report.
 *
 * It also measures prose measure (characters per line) for body copy, which
 * IS a hard failure above 80ch, and records the resolved font sizes so a
 * fluid scale can be verified rather than assumed.
 *
 * Read-only. Never edits site sources.
 *   node scripts/responsive-qa/typography.mjs [--out report.json] [--routes /a/,/b/]
 */

import fs from "node:fs";
import path from "node:path";
import {
  HERE, VIEWPORTS, launchBrowser, startServer, enumerateRoutes, settle, FREEZE_CSS,
} from "./lib.mjs";

/* Tunables — the brief's thresholds, in one place. */
const SHORT_FINAL_LINE_RATIO = 0.30;  // final line < 30% of widest line
const MIN_WORDS_TO_JUDGE     = 2;     // a one-word heading cannot have a one-word line
const PROSE_MIN_CHARS        = 120;   // ignore short fragments when measuring measure
const PROSE_MAX_CH           = 80;    // hard ceiling, in rendered characters
const PROSE_TARGET_MIN_CH    = 55;    // comfortable band, lower bound (rendered chars)
const PROSE_TARGET_MAX_CH    = 70;    // comfortable band, upper bound (rendered chars)
const BODY_MIN_PX_FAIL       = 15;    // no run of prose may set smaller than this
const BODY_MIN_PX_WARN       = 16;    // primary body copy should reach this

const args = process.argv.slice(2);
const argOf = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const OUT = path.resolve(process.cwd(), argOf("--out", path.join(HERE, "typography-report.json")));
const LABEL = argOf("--label", "current");

/* ── in-page measurement library ─────────────────────────────────────────── */

const MEASURE = String.raw`
window.__type = (function () {
  function selPath(el) {
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

  function visible(el) {
    var cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.visibility === "collapse") return false;
    if (el.hasAttribute("hidden")) return false;
    if (parseFloat(cs.opacity) === 0) return false;
    /* Screen-reader-only text is clipped to a 1px box; it is read, not set. */
    if (el.closest(".sr-only, .visually-hidden, .screen-reader-text")) return false;
    if ((cs.clipPath || "").indexOf("inset(50%") === 0) return false;
    var r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) return false;
    return r.width > 0 && r.height > 0;
  }

  function exempt(el) {
    var n = el;
    while (n && n.nodeType === 1) {
      if (n.hasAttribute("data-typo-exempt")) return n.getAttribute("data-typo-exempt") || "exempt";
      n = n.parentElement;
    }
    return null;
  }

  /* Width of one "0" in the element's own font — the real ch unit. */
  function chWidth(el) {
    var probe = document.createElement("span");
    probe.textContent = "0";
    probe.setAttribute("data-type-probe", "1");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0;";
    var cs = getComputedStyle(el);
    probe.style.font = cs.font && cs.font !== "" ? cs.font : "";
    if (!probe.style.font) {
      probe.style.fontFamily = cs.fontFamily;
      probe.style.fontSize = cs.fontSize;
      probe.style.fontWeight = cs.fontWeight;
      probe.style.fontStyle = cs.fontStyle;
    }
    probe.style.letterSpacing = cs.letterSpacing;
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    return w || parseFloat(cs.fontSize) * 0.5;
  }

  /* Walk text nodes and produce one rect per whitespace-delimited word. */
  function wordRects(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        var cs = getComputedStyle(p);
        if (cs.display === "none" || cs.visibility === "hidden") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var out = [], node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue;
      var re = /\S+/g, m;
      while ((m = re.exec(text))) {
        var range = document.createRange();
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        var rects = Array.prototype.slice.call(range.getClientRects())
          .filter(function (r) { return r.width > 0 && r.height > 0; });
        range.detach && range.detach();
        if (!rects.length) continue;
        /* A word broken across lines (hyphenation) yields >1 rect; take the first. */
        var r = rects[0];
        out.push({ word: m[0], top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      }
    }
    return out;
  }

  /* Group word rects into visual lines by vertical overlap. */
  function groupLines(words) {
    if (!words.length) return [];
    var sorted = words.slice().sort(function (a, b) { return a.top - b.top || a.left - b.left; });
    var lines = [], cur = null;
    for (var i = 0; i < sorted.length; i++) {
      var w = sorted[i];
      var mid = (w.top + w.bottom) / 2;
      if (cur && mid >= cur.top && mid <= cur.bottom) {
        cur.words.push(w.word);
        cur.left = Math.min(cur.left, w.left);
        cur.right = Math.max(cur.right, w.right);
        cur.top = Math.min(cur.top, w.top);
        cur.bottom = Math.max(cur.bottom, w.bottom);
      } else {
        cur = { top: w.top, bottom: w.bottom, left: w.left, right: w.right, words: [w.word] };
        lines.push(cur);
      }
    }
    return lines.map(function (l) {
      return {
        words: l.words,
        wordCount: l.words.length,
        text: l.words.join(" "),
        width: Math.round((l.right - l.left) * 10) / 10,
        top: Math.round(l.top * 10) / 10
      };
    });
  }

  function headings() {
    var out = [];
    var els = document.querySelectorAll("h1, h2, h3");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!visible(el)) continue;
      var cs = getComputedStyle(el);
      var rect = el.getBoundingClientRect();
      var words = wordRects(el);
      if (!words.length) continue;
      var lines = groupLines(words);
      var ch = chWidth(el);
      var text = (el.textContent || "").replace(/\s+/g, " ").trim();
      out.push({
        tag: el.tagName.toLowerCase(),
        selector: selPath(el),
        text: text,
        totalWords: words.length,
        lineCount: lines.length,
        lines: lines,
        fontSizePx: Math.round(parseFloat(cs.fontSize) * 100) / 100,
        lineHeightPx: cs.lineHeight === "normal" ? null : Math.round(parseFloat(cs.lineHeight) * 100) / 100,
        textWrap: cs.textWrap || cs.textWrapStyle || cs.textWrapMode || "",
        boxWidthPx: Math.round(rect.width * 10) / 10,
        boxWidthCh: ch ? Math.round((rect.width / ch) * 10) / 10 : null,
        maxWidthCss: cs.maxWidth,
        hasBr: !!el.querySelector("br"),
        exempt: exempt(el)
      });
    }
    return out;
  }

  function prose() {
    var out = [];
    var els = document.querySelectorAll("p, li, blockquote, dd");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!visible(el)) continue;
      if (el.querySelector("p, li, ul, ol")) continue;
      var text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length < ${PROSE_MIN_CHARS}) continue;
      var words = wordRects(el);
      if (!words.length) continue;
      var lines = groupLines(words);
      if (!lines.length) continue;
      var cs = getComputedStyle(el);
      var ch = chWidth(el);
      var rect = el.getBoundingClientRect();
      /* Widest rendered line, expressed in the element's own ch. */
      var widest = 0;
      for (var j = 0; j < lines.length; j++) widest = Math.max(widest, lines[j].width);
      var measureCh = ch ? widest / ch : null;
      /* Actual characters set on a line. The ch unit is the width of "0",
         which in Inter is wider than average lowercase, so a 66ch column
         sets nearer 77 characters — count the real thing instead. */
      var lineChars = lines.map(function (l) { return l.text.length; });
      var full = lines.length > 1 ? lineChars.slice(0, -1) : lineChars;
      full = full.slice().sort(function (a, b) { return a - b; });
      var medianLineChars = full.length ? full[Math.floor(full.length / 2)] : lineChars[0];
      var maxLineChars = Math.max.apply(null, lineChars);
      out.push({
        tag: el.tagName.toLowerCase(),
        selector: selPath(el),
        longForm: !!el.closest(".acw-reading-width, .acw-guide-body, .acw-post-body, .legal-content, .acw-guide-content, .acw-post-content"),
        sample: text.slice(0, 60),
        chars: text.length,
        lineCount: lines.length,
        fontSizePx: Math.round(parseFloat(cs.fontSize) * 100) / 100,
        lineHeight: cs.lineHeight,
        boxWidthPx: Math.round(rect.width * 10) / 10,
        measureCh: measureCh === null ? null : Math.round(measureCh * 10) / 10,
        medianLineChars: medianLineChars,
        maxLineChars: maxLineChars,
        avgCharsPerLine: Math.round(text.length / lines.length),
        maxWidthCss: cs.maxWidth,
        exempt: exempt(el)
      });
    }
    return out;
  }

  /* Forced line breaks still present in the rendered DOM. */
  function forcedBreaks() {
    var out = [];
    var brs = document.querySelectorAll("br");
    for (var i = 0; i < brs.length; i++) {
      var br = brs[i];
      var host = br.parentElement;
      if (!host || !visible(host)) continue;
      /* A <br> inside an address/pre block is structural, not typographic. */
      var t = host.tagName;
      if (t === "PRE" || t === "ADDRESS" || t === "CODE") continue;
      out.push({
        host: selPath(host),
        hostTag: t.toLowerCase(),
        text: (host.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90),
        exempt: exempt(br)
      });
    }
    return out;
  }

  /* Real horizontal overflow, measured with overflow-x forced visible. */
  function overflow(vw) {
    var out = [];
    var all = document.querySelectorAll("body *");
    for (var i = 0; i < all.length && out.length < 40; i++) {
      var el = all[i];
      var cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.display === "none" || cs.visibility === "hidden") continue;
      var r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      var scrollableAncestor = false;
      var n = el.parentElement;
      while (n && n !== document.body) {
        var pcs = getComputedStyle(n);
        if (pcs.overflowX === "auto" || pcs.overflowX === "scroll") { scrollableAncestor = true; break; }
        n = n.parentElement;
      }
      if (scrollableAncestor) continue;
      if (r.right > vw + 1 || r.left < -1) {
        out.push({
          selector: selPath(el),
          right: Math.round(r.right * 10) / 10,
          left: Math.round(r.left * 10) / 10,
          width: Math.round(r.width * 10) / 10,
          overflowPx: Math.round(Math.max(r.right - vw, -r.left) * 10) / 10
        });
      }
    }
    return { findings: out, docScrollWidth: document.documentElement.scrollWidth };
  }

  /* Interactive target sizes (WCAG 2.2 AA: 24x24 CSS px minimum). */
  function targets() {
    var out = [];
    var els = document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button], summary");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!visible(el)) continue;
      /* Decorative artwork: not exposed and not reachable, so not a target. */
      if (el.closest('[aria-hidden="true"]')) continue;
      if (el.getAttribute("tabindex") === "-1") continue;
      var cs = getComputedStyle(el);
      /* Inline links inside a run of text are exempt from 2.5.8 by spec. */
      if (el.tagName === "A") {
        var p = el.closest("p, li, blockquote, dd, h1, h2, h3, h4, label, span, small, strong, em, td, figcaption");
        if (p && cs.display.indexOf("inline") === 0) continue;
      }
      var r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) {
        out.push({
          selector: selPath(el),
          text: (el.textContent || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 40),
          w: Math.round(r.width * 10) / 10,
          h: Math.round(r.height * 10) / 10
        });
      }
    }
    return out;
  }

  return { headings: headings, prose: prose, forcedBreaks: forcedBreaks, overflow: overflow, targets: targets };
})();
`;

/* ── run ─────────────────────────────────────────────────────────────────── */

function judgeHeading(h) {
  const findings = [];
  if (h.lineCount < 2) return findings;
  if (h.totalWords < MIN_WORDS_TO_JUDGE) return findings;

  const widest = Math.max(...h.lines.map((l) => l.width));
  const box = h.boxWidthPx;
  h.lines.forEach((line, idx) => {
    if (line.wordCount !== 1) return;
    /* Could this word have shared a line with a neighbour at all? Compare the
       width of the pair against the width the heading actually has. If the
       pair cannot fit, no measure short of a smaller type size avoids the
       single-word line — which for a three-word title on a 320px screen is
       simply what the content is. Those are reported separately so a real
       defect is not buried under compositions nothing could improve. */
    const prev = h.lines[idx - 1];
    const next = h.lines[idx + 1];
    const perChar = line.width / Math.max(1, line.text.length);
    const neighbourWord = (l, fromEnd) => {
      if (!l) return null;
      const ws = l.words;
      return fromEnd ? ws[ws.length - 1] : ws[0];
    };
    const candidates = [neighbourWord(prev, true), neighbourWord(next, false)].filter(Boolean);
    const smallestPair = candidates.length
      ? Math.min(...candidates.map((w) => line.width + perChar * (w.length + 1)))
      : Infinity;
    const unavoidable = smallestPair > box + 1;
    findings.push({
      kind: "one-word-line",
      lineIndex: idx,
      isFinalLine: idx === h.lines.length - 1,
      line: line.text,
      lineWidth: line.width,
      widestLine: widest,
      boxWidthPx: box,
      unavoidable,
    });
  });

  const last = h.lines[h.lines.length - 1];
  if (widest > 0 && last.width / widest < SHORT_FINAL_LINE_RATIO) {
    findings.push({
      kind: "short-final-line",
      lineIndex: h.lines.length - 1,
      isFinalLine: true,
      line: last.text,
      lineWidth: last.width,
      widestLine: widest,
      ratio: Math.round((last.width / widest) * 1000) / 1000,
    });
  }
  return findings;
}

const main = async () => {
  const missing = [];
  const { server, port } = await startServer(missing);
  const { browser, via } = await launchBrowser();
  const base = `http://127.0.0.1:${port}`;

  const only = argOf("--routes", "");
  const routes = only ? only.split(",").map((s) => s.trim()).filter(Boolean) : enumerateRoutes();

  const report = {
    label: LABEL,
    generatedAt: new Date().toISOString(),
    chromium: via,
    thresholds: {
      SHORT_FINAL_LINE_RATIO, PROSE_MAX_CH, PROSE_TARGET_MIN_CH,
      PROSE_TARGET_MAX_CH, BODY_MIN_PX_FAIL, BODY_MIN_PX_WARN,
    },
    routes,
    viewports: VIEWPORTS.map((v) => v.label),
    warnings: { headingLines: [], proseNarrow: [], proseWide: [], forcedBreaks: [], bodySmall: [] },
    failures: { proseOverMax: [], overflow: [], bodyTooSmall: [], touchTargets: [] },
    exempted: [],
    accepted: [],
    headingSizes: [],
    pageErrors: [],
  };

  const started = Date.now();

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      reducedMotion: "no-preference",
    });
    await context.addInitScript(MEASURE);
    const page = await context.newPage();
    page.on("pageerror", (e) =>
      report.pageErrors.push({ viewport: vp.label, message: String(e.message).slice(0, 200) }));

    for (const route of routes) {
      try {
        await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
      } catch (e) {
        report.pageErrors.push({ viewport: vp.label, route, message: `navigation: ${e.message}` });
        continue;
      }
      await page.addStyleTag({ content: FREEZE_CSS });
      await settle(page);

      let data;
      try {
        data = await page.evaluate(() => ({
          headings: window.__type.headings(),
          prose: window.__type.prose(),
          forcedBreaks: window.__type.forcedBreaks(),
          targets: window.__type.targets(),
        }));
      } catch (e) {
        report.pageErrors.push({ viewport: vp.label, route, message: `measure: ${e.message}` });
        continue;
      }

      /* Headings. */
      for (const h of data.headings) {
        report.headingSizes.push({
          viewport: vp.label, route, tag: h.tag, selector: h.selector,
          fontSizePx: h.fontSizePx, boxWidthCh: h.boxWidthCh, textWrap: h.textWrap,
        });
        if (vp.judgeHeadings === false) continue;
        const findings = judgeHeading(h);
        if (!findings.length) continue;
        if (h.exempt) {
          report.exempted.push({
            viewport: vp.label, route, tag: h.tag, selector: h.selector,
            text: h.text, reason: h.exempt, kinds: [...new Set(findings.map((f) => f.kind))],
          });
          continue;
        }
        for (const f of findings) {
          const bucket = f.unavoidable ? report.accepted : report.warnings.headingLines;
          bucket.push({
            viewport: vp.label, route, tag: h.tag, selector: h.selector,
            text: h.text, totalWords: h.totalWords, lineCount: h.lineCount,
            fontSizePx: h.fontSizePx, boxWidthCh: h.boxWidthCh, textWrap: h.textWrap,
            hasBr: h.hasBr, ...f,
          });
        }
      }

      /* Prose measure. */
      const isMobile = vp.kind === "width" ? vp.width < 768 : vp.width < 500;
      for (const p of data.prose) {
        if (p.exempt) continue;
        /* Judged on rendered characters, not on the ch unit. */
        const m = p.medianLineChars;
        if (m > PROSE_MAX_CH) {
          report.failures.proseOverMax.push({ viewport: vp.label, route, ...p });
        } else if (m > PROSE_TARGET_MAX_CH) {
          report.warnings.proseWide.push({ viewport: vp.label, route, ...p });
        } else if (
          m < PROSE_TARGET_MIN_CH && vp.width >= 768 && p.lineCount > 2 && p.longForm
        ) {
          /* Only long-form reading columns are judged against the lower bound.
             Card and sidebar copy is narrow because the component is narrow,
             which is a layout decision, not a measure defect. */
          report.warnings.proseNarrow.push({ viewport: vp.label, route, ...p });
        }
        if (isMobile && p.fontSizePx < BODY_MIN_PX_FAIL) {
          report.failures.bodyTooSmall.push({ viewport: vp.label, route, ...p });
        } else if (isMobile && p.fontSizePx < BODY_MIN_PX_WARN) {
          report.warnings.bodySmall.push({ viewport: vp.label, route, ...p });
        }
      }

      /* Forced breaks — reported once, at the narrowest viewport only. */
      if (vp.label === "w320") {
        for (const b of data.forcedBreaks) {
          if (b.exempt) {
            report.exempted.push({ viewport: vp.label, route, kinds: ["forced-break"], reason: b.exempt, selector: b.host, text: b.text });
          } else {
            report.warnings.forcedBreaks.push({ route, ...b });
          }
        }
      }

      /* Touch targets — checked on the touch-sized viewports. */
      if (vp.kind === "width" && vp.width <= 430) {
        for (const t of data.targets) {
          report.failures.touchTargets.push({ viewport: vp.label, route, ...t });
        }
      }

      /* Overflow — last, because it perturbs layout. */
      if (vp.width <= 430 || vp.kind === "zoom") {
        await page.addStyleTag({
          content: "html, body { overflow-x: visible !important; }",
        });
        const ov = await page.evaluate((w) => window.__type.overflow(w), vp.width);
        for (const f of ov.findings) {
          report.failures.overflow.push({ viewport: vp.label, route, ...f });
        }
      }
    }
    await context.close();
  }

  await browser.close();
  server.close();

  report.durationSeconds = Math.round((Date.now() - started) / 10) / 100;
  report.missingAssets = [...new Set(missing.map((m) => m.url))].sort();

  /* ── console summary ───────────────────────────────────────────────────── */

  const W = report.warnings, F = report.failures;
  const uniqHeadings = new Map();
  for (const w of W.headingLines) {
    const key = `${w.route}|${w.selector}|${w.kind}|${w.line}`;
    if (!uniqHeadings.has(key)) uniqHeadings.set(key, { ...w, viewports: [] });
    uniqHeadings.get(key).viewports.push(w.viewport);
  }
  report.warningsGrouped = [...uniqHeadings.values()].sort(
    (a, b) => a.route.localeCompare(b.route) || a.selector.localeCompare(b.selector));

  const line = (s) => process.stdout.write(s + "\n");
  line("");
  line(`responsive-qa · typography — label "${LABEL}"`);
  line(`routes ${routes.length} · viewports ${VIEWPORTS.length} · ${report.durationSeconds}s · chromium ${via}`);
  line("");
  line("WARNINGS (review, never a hard failure)");
  line(`  heading one-word / short final lines .... ${W.headingLines.length} (${report.warningsGrouped.length} distinct)`);
  line(`  prose wider than ${PROSE_TARGET_MAX_CH}ch ................. ${W.proseWide.length}`);
  line(`  prose narrower than ${PROSE_TARGET_MIN_CH}ch (≥768px) ...... ${W.proseNarrow.length}`);
  line(`  forced <br> in flowing text ............ ${W.forcedBreaks.length}`);
  line(`  prose between ${BODY_MIN_PX_FAIL} and ${BODY_MIN_PX_WARN}px on mobile ....... ${W.bodySmall.length}`);
  line(`  exempted compositions .................. ${report.exempted.length}`);
  line(`  one-word lines no measure could avoid .. ${report.accepted.length}`);
  line("");
  line("FAILURES");
  line(`  prose over ${PROSE_MAX_CH}ch ......................... ${F.proseOverMax.length}`);
  line(`  horizontal overflow .................... ${F.overflow.length}`);
  line(`  prose under ${BODY_MIN_PX_FAIL}px on mobile ............. ${F.bodyTooSmall.length}`);
  line(`  touch targets under 24x24 .............. ${F.touchTargets.length}`);
  line(`  page errors ............................ ${report.pageErrors.length}`);
  line("");

  if (report.warningsGrouped.length) {
    line("Distinct heading-line warnings:");
    for (const w of report.warningsGrouped.slice(0, 40)) {
      line(`  ${w.kind === "one-word-line" ? "1-word" : "short "} ${w.route} ${w.tag} @${w.viewports.join(",")}`);
      line(`         line "${w.line}"  ·  ${w.lineCount} lines  ·  "${w.text.slice(0, 70)}"`);
    }
    if (report.warningsGrouped.length > 40) line(`  … ${report.warningsGrouped.length - 40} more (see ${path.basename(OUT)})`);
    line("");
  }

  const hardFail =
    F.proseOverMax.length + F.overflow.length + F.bodyTooSmall.length +
    F.touchTargets.length + report.pageErrors.length;

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  line(`report → ${path.relative(process.cwd(), OUT)}`);
  line(hardFail === 0 ? "PASS — 0 hard failure(s)" : `FAIL — ${hardFail} hard failure(s)`);
  process.exit(hardFail === 0 ? 0 : 1);
};

main().catch((e) => { console.error(e); process.exit(2); });

#!/usr/bin/env node
/**
 * scripts/responsive-qa/primary-targets.mjs
 *
 * WCAG 2.2 AA asks for 24x24 CSS px. This checks the stricter, more useful
 * bar for the things people actually reach for on a phone: primary actions —
 * buttons, the menu toggle, the nav call-to-action, form submits and the
 * card-level links that stand alone — against 44x44.
 *
 * It also reports keyboard focus visibility and any horizontal overflow, so
 * one run answers the whole "is this usable on a phone" question.
 */
import fs from "node:fs";
import path from "node:path";
import { HERE, launchBrowser, startServer, enumerateRoutes, settle, FREEZE_CSS } from "./lib.mjs";

const VPS = [
  { label: "mobile 390", width: 390, height: 844 },
  { label: "tablet 768", width: 768, height: 1024 },
  { label: "desktop 1440", width: 1440, height: 900 },
  { label: "narrow 320", width: 320, height: 900 },
];

const PRIMARY = [
  "button:not([disabled])", "button[disabled]", "input[type=submit]", "summary",
  ".acw-btn", ".button", ".nav-cta", ".nav__cta", ".nav__toggle", ".circle-link",
  ".text-link", ".filter-chips button", ".acw-library-card-link",
].join(", ");

const main = async () => {
  const missing = [];
  const { server, port } = await startServer(missing);
  const { browser } = await launchBrowser();
  const routes = enumerateRoutes();
  const report = { generatedAt: new Date().toISOString(), under44: [], under24: [], noFocusRing: [], overflow: [], counts: {} };

  for (const vp of VPS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    let seen = 0;
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.addStyleTag({ content: FREEZE_CSS });
      await settle(page, { scroll: false });

      const r = await page.evaluate((sel) => {
        const out = { targets: [], overflow: [] };
        const vis = (el) => {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return false;
          if (el.closest('[aria-hidden="true"]')) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        const label = (el) => (el.textContent || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 40);
        for (const el of document.querySelectorAll(sel)) {
          if (!vis(el)) continue;
          const b = el.getBoundingClientRect();
          out.targets.push({ tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").split(" ")[0],
                             text: label(el), w: Math.round(b.width), h: Math.round(b.height) });
        }
        const vw = document.documentElement.clientWidth;
        for (const el of document.querySelectorAll("body *")) {
          const cs = getComputedStyle(el);
          if (cs.position === "fixed" || cs.display === "none" || cs.visibility === "hidden") continue;
          const b = el.getBoundingClientRect();
          if (b.width <= 0 || b.height <= 0) continue;
          let n = el.parentElement, scrollable = false;
          while (n && n !== document.body) { const p = getComputedStyle(n); if (p.overflowX === "auto" || p.overflowX === "scroll") { scrollable = true; break; } n = n.parentElement; }
          if (scrollable) continue;
          if (b.right > vw + 1 || b.left < -1) out.overflow.push({ tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").split(" ")[0], over: Math.round(Math.max(b.right - vw, -b.left)) });
        }
        out.docScrollsSideways = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
        return out;
      }, PRIMARY);

      seen += r.targets.length;
      for (const t of r.targets) {
        if (t.h < 24 || t.w < 24) report.under24.push({ viewport: vp.label, route, ...t });
        else if (t.h < 44) report.under44.push({ viewport: vp.label, route, ...t });
      }
      for (const o of r.overflow.slice(0, 10)) report.overflow.push({ viewport: vp.label, route, ...o });

      /* Focus visibility: tab through the first 15 stops and compare styles. */
      if (vp.width === 390 && ["/", "/contact/", "/work/", "/services/practice-website/"].includes(route)) {
        const focus = await page.evaluate(async () => {
          const res = [];
          const f = [...document.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([disabled]),select,textarea,summary,[tabindex]:not([tabindex="-1"])')]
            .filter((e) => e.getClientRects().length);
          for (const el of f.slice(0, 15)) {
            const before = getComputedStyle(el).cssText;
            el.focus();
            const after = getComputedStyle(el).cssText;
            const cs = getComputedStyle(el);
            const ring = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
            res.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || "").trim().slice(0, 26), ring, changed: before !== after });
            el.blur();
          }
          return res;
        });
        for (const s of focus) if (!s.ring && !s.changed) report.noFocusRing.push({ route, ...s });
      }
    }
    report.counts[vp.label] = seen;
    await ctx.close();
  }
  await browser.close(); server.close();
  report.missingAssets = [...new Set(missing.map((m) => m.url))].sort();
  fs.writeFileSync(path.join(HERE, "primary-targets.json"), JSON.stringify(report, null, 2));

  const L = (s) => process.stdout.write(s + "\n");
  L("");
  L(`primary interactive targets checked: ${Object.entries(report.counts).map(([k, v]) => `${k}: ${v}`).join(" · ")}`);
  L("");
  L(`under 24x24 (WCAG 2.2 AA failure) .... ${report.under24.length}`);
  L(`24-43px tall (below the 44px bar) .... ${report.under44.length}`);
  L(`no visible focus indicator ........... ${report.noFocusRing.length}`);
  L(`horizontal overflow .................. ${report.overflow.length}`);
  L(`missing assets (404 on the server) ... ${report.missingAssets.length}`);
  if (report.missingAssets.length) report.missingAssets.slice(0, 10).forEach((u) => L("    " + u));
  L("");
  const byLabel = new Map();
  for (const t of report.under44) {
    const k = `${t.cls || t.tag} "${t.text}" ${t.w}x${t.h}`;
    byLabel.set(k, (byLabel.get(k) || 0) + 1);
  }
  if (byLabel.size) {
    L("targets between 24 and 44px, distinct:");
    [...byLabel.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, n]) => L(`  x${String(n).padStart(4)}  ${k}`));
  }
};
main().catch((e) => { console.error(e); process.exit(2); });

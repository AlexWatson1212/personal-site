#!/usr/bin/env node
/**
 * scripts/responsive-qa/computed-audit.mjs
 *
 * Dumps the computed value of a fixed set of typographic properties for every
 * heading and paragraph on every route, at a few viewports. Two runs diff
 * cleanly, so a cascade refactor can be proved to leave rendering unchanged
 * rather than assumed to.
 *
 *   node scripts/responsive-qa/computed-audit.mjs --out computed-before.json
 */

import fs from "node:fs";
import path from "node:path";
import { HERE, launchBrowser, startServer, enumerateRoutes, settle } from "./lib.mjs";

const args = process.argv.slice(2);
const argOf = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const OUT = path.resolve(process.cwd(), argOf("--out", path.join(HERE, "computed.json")));

const VPS = [
  { label: "w390", width: 390, height: 900 },
  { label: "w768", width: 768, height: 900 },
  { label: "w1440", width: 1440, height: 900 },
];

const PROPS = [
  "fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight",
  "color", "textWrap", "maxWidth", "textTransform", "fontStyle",
];

const main = async () => {
  const { server, port } = await startServer([]);
  const { browser } = await launchBrowser();
  const routes = enumerateRoutes();
  const out = { generatedAt: new Date().toISOString(), entries: {} };

  for (const vp of VPS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await settle(page, { scroll: false });
      const data = await page.evaluate((props) => {
        const rows = [];
        const els = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, blockquote");
        let i = 0;
        for (const el of els) {
          const cs = getComputedStyle(el);
          if (cs.display === "none") continue;
          const rec = { i: i++, tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").slice(0, 60) };
          for (const p of props) rec[p] = cs[p];
          rows.push(rec);
        }
        return rows;
      }, PROPS);
      out.entries[`${vp.label}|${route}`] = data;
    }
    await ctx.close();
  }
  await browser.close(); server.close();
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  const n = Object.values(out.entries).reduce((a, r) => a + r.length, 0);
  console.log(`computed audit: ${Object.keys(out.entries).length} route/viewport pairs, ${n} elements → ${path.relative(process.cwd(), OUT)}`);
};
main().catch((e) => { console.error(e); process.exit(2); });

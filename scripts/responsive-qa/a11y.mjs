#!/usr/bin/env node
/**
 * scripts/responsive-qa/a11y.mjs
 *
 * axe-core over every route at a mobile, tablet and desktop width, plus a
 * 200%-zoom pass. axe-core is the rule engine behind Lighthouse's
 * accessibility category, so this is the same audit without the rest of
 * Lighthouse's Chrome-driver machinery.
 *
 *   node scripts/responsive-qa/a11y.mjs [--out a11y-report.json]
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { HERE, launchBrowser, startServer, enumerateRoutes, settle, FREEZE_CSS } from "./lib.mjs";

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const args = process.argv.slice(2);
const argOf = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const OUT = path.resolve(process.cwd(), argOf("--out", path.join(HERE, "a11y-report.json")));

const VPS = [
  { label: "w390", width: 390, height: 844, dsf: 1 },
  { label: "w768", width: 768, height: 1024, dsf: 1 },
  { label: "w1440", width: 1440, height: 900, dsf: 1 },
  { label: "zoom200", width: 640, height: 450, dsf: 2 },
];

const main = async () => {
  const { server, port } = await startServer([]);
  const { browser, via } = await launchBrowser();
  const routes = enumerateRoutes();
  const report = {
    generatedAt: new Date().toISOString(), chromium: via,
    engine: "axe-core " + JSON.parse(fs.readFileSync(require.resolve("axe-core/package.json"), "utf8")).version,
    tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
    routes, viewports: VPS.map((v) => v.label),
    violations: [], incomplete: [], passesCount: 0,
  };

  for (const vp of VPS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dsf,
    });
    const page = await ctx.newPage();
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      /* axe composites the colour it actually sees. An element caught part
         way through its entrance animation reports the contrast of that
         frame, which is a transient state and not a WCAG failure — so the
         page is frozen in its settled state before it is audited. */
      await page.addStyleTag({ content: FREEZE_CSS });
      await settle(page, { scroll: false });
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async (tags) =>
        await window.axe.run(document, {
          runOnly: { type: "tag", values: tags },
          resultTypes: ["violations", "incomplete"],
        }), report.tags);
      report.passesCount += (res.passes || []).length;
      for (const v of res.violations) {
        report.violations.push({
          viewport: vp.label, route, id: v.id, impact: v.impact,
          help: v.help, helpUrl: v.helpUrl, nodes: v.nodes.length,
          sample: v.nodes.slice(0, 2).map((n) => n.target.join(" ")),
        });
      }
      for (const v of res.incomplete) {
        report.incomplete.push({
          viewport: vp.label, route, id: v.id, impact: v.impact,
          help: v.help, nodes: v.nodes.length,
        });
      }
    }
    await ctx.close();
  }
  await browser.close(); server.close();

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

  const byRule = new Map();
  for (const v of report.violations) {
    const k = `${v.id} (${v.impact})`;
    if (!byRule.has(k)) byRule.set(k, { routes: new Set(), nodes: 0, help: v.help });
    const e = byRule.get(k); e.routes.add(v.route); e.nodes += v.nodes;
  }
  console.log(`\naxe-core ${report.engine} · ${routes.length} routes x ${VPS.length} viewports`);
  console.log(`violations: ${report.violations.length} finding(s), ${byRule.size} distinct rule(s)`);
  for (const [k, e] of [...byRule.entries()].sort((a, b) => b[1].nodes - a[1].nodes)) {
    console.log(`  ${k} — ${e.nodes} node(s) on ${e.routes.size} route(s): ${e.help}`);
  }
  const inc = new Map();
  for (const v of report.incomplete) inc.set(v.id, (inc.get(v.id) || 0) + v.nodes);
  console.log(`needs review (axe could not decide): ${[...inc.entries()].map(([k, n]) => `${k} x${n}`).join(", ") || "none"}`);
  console.log(`report → ${path.relative(process.cwd(), OUT)}`);
  process.exit(report.violations.length ? 1 : 0);
};
main().catch((e) => { console.error(e); process.exit(2); });

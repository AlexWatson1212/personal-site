#!/usr/bin/env node
/**
 * scripts/responsive-qa/compare.mjs
 *
 * Compares the baseline and after screenshot sets. A raw pixel diff is not
 * very informative when the whole page has reflowed, so this reports what is
 * actually decision-useful: how much shorter or taller each page became at
 * each width, where the largest changes are, and — via `--sheets` — writes
 * side-by-side JPEGs for visual review.
 *
 *   node scripts/responsive-qa/compare.mjs [--sheets] [--routes /,/about/]
 */

import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { HERE, routeSlug } from "./lib.mjs";

const args = process.argv.slice(2);
const argOf = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const SHOTS = path.join(HERE, "shots");
const OUT = path.join(HERE, "comparison");
const wantSheets = args.includes("--sheets");

const load = (set) => JSON.parse(fs.readFileSync(path.join(SHOTS, set, "manifest.json"), "utf8"));

const a = load("baseline"), b = load("after");
const key = (m) => `${m.viewport}|${m.route}`;
const A = new Map(a.manifest.filter((m) => !m.error).map((m) => [key(m), m]));
const B = new Map(b.manifest.filter((m) => !m.error).map((m) => [key(m), m]));

const rows = [];
for (const [k, before] of A) {
  const after = B.get(k);
  if (!after) continue;
  const [viewport, route] = k.split("|");
  rows.push({
    viewport, route,
    beforeHeight: before.pageHeight, afterHeight: after.pageHeight,
    deltaPx: after.pageHeight - before.pageHeight,
    deltaPct: Math.round(((after.pageHeight - before.pageHeight) / before.pageHeight) * 1000) / 10,
  });
}
rows.sort((x, y) => x.deltaPct - y.deltaPct);

const byViewport = new Map();
for (const r of rows) {
  if (!byViewport.has(r.viewport)) byViewport.set(r.viewport, []);
  byViewport.get(r.viewport).push(r.deltaPct);
}

console.log("\npage height, baseline → after (negative = shorter, less scrolling)\n");
for (const [vp, deltas] of byViewport) {
  const sorted = deltas.slice().sort((m, n) => m - n);
  const median = sorted[Math.floor(sorted.length / 2)];
  console.log(`  ${vp.padEnd(16)} median ${String(median).padStart(6)}%   range ${sorted[0]}% … ${sorted[sorted.length - 1]}%`);
}
console.log("\nlargest reductions:");
for (const r of rows.slice(0, 10)) {
  console.log(`  ${r.deltaPct.toFixed(1).padStart(6)}%  ${r.viewport.padEnd(14)} ${r.route}  (${r.beforeHeight} → ${r.afterHeight}px)`);
}
const grew = rows.filter((r) => r.deltaPct > 2);
console.log(`\npages that grew by more than 2%: ${grew.length}`);
for (const r of grew.slice(0, 10)) {
  console.log(`  +${r.deltaPct.toFixed(1)}%  ${r.viewport.padEnd(14)} ${r.route}  (${r.beforeHeight} → ${r.afterHeight}px)`);
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "height-comparison.json"), JSON.stringify({ rows }, null, 2));

/* Side-by-side sheets, scaled to a common height so the pair reads as one image. */
if (wantSheets) {
  const routes = argOf("--routes", "/,/service/,/work/,/about/,/contact/,/blog/,/practice-clarity/,/services/straightforward-website/")
    .split(",").map((s) => s.trim());
  const viewports = argOf("--viewports", "w320,w390,w768,w1024,w1440").split(",");
  let n = 0;
  for (const route of routes) {
    for (const vp of viewports) {
      const slug = routeSlug(route);
      const pa = path.join(SHOTS, "baseline", vp, slug + ".png");
      const pb = path.join(SHOTS, "after", vp, slug + ".png");
      if (!fs.existsSync(pa) || !fs.existsSync(pb)) continue;
      const ia = PNG.sync.read(fs.readFileSync(pa));
      const ib = PNG.sync.read(fs.readFileSync(pb));
      const gap = 24;
      const h = Math.max(ia.height, ib.height);
      const out = new PNG({ width: ia.width + gap + ib.width, height: h });
      out.data.fill(0xff);
      const blit = (src, dx) => {
        for (let y = 0; y < src.height; y++) {
          for (let x = 0; x < src.width; x++) {
            const s = (y * src.width + x) << 2;
            const d = (y * out.width + (x + dx)) << 2;
            out.data[d] = src.data[s]; out.data[d + 1] = src.data[s + 1];
            out.data[d + 2] = src.data[s + 2]; out.data[d + 3] = 255;
          }
        }
      };
      blit(ia, 0); blit(ib, ia.width + gap);
      const file = path.join(OUT, `${slug}-${vp}.png`);
      fs.writeFileSync(file, PNG.sync.write(out));
      n++;
    }
  }
  console.log(`\n${n} side-by-side sheet(s) → ${path.relative(process.cwd(), OUT)}`);
}

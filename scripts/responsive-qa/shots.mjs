#!/usr/bin/env node
/**
 * scripts/responsive-qa/shots.mjs
 *
 * Full-page screenshots of every route at every target width, plus short
 * viewport heights and 200% zoom on a representative subset. Fonts are
 * awaited and animations frozen before every capture, so two runs of the
 * same tree are byte-comparable.
 *
 *   node scripts/responsive-qa/shots.mjs --set baseline
 *   node scripts/responsive-qa/shots.mjs --set after
 */

import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import {
  HERE, VIEWPORTS, launchBrowser, startServer, enumerateRoutes, routeSlug, settle, FREEZE_CSS,
} from "./lib.mjs";

/** Trims a screenshot to the viewport width, in device pixels. */
function cropToViewport(file, targetWidth) {
  const png = PNG.sync.read(fs.readFileSync(file));
  if (png.width <= targetWidth) return;
  const out = new PNG({ width: targetWidth, height: png.height });
  for (let y = 0; y < png.height; y++) {
    png.data.copy(
      out.data,
      (y * targetWidth) << 2,
      (y * png.width) << 2,
      ((y * png.width) + targetWidth) << 2
    );
  }
  fs.writeFileSync(file, PNG.sync.write(out));
}

const args = process.argv.slice(2);
const argOf = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const SET = argOf("--set", "baseline");
const OUTDIR = path.resolve(process.cwd(), argOf("--out", path.join(HERE, "shots", SET)));

/** Routes that also get the short-height and zoom captures. */
const DEEP_ROUTES = [
  "/", "/service/", "/work/", "/about/", "/contact/", "/practice-clarity/",
  "/blog/", "/services/straightforward-website/",
];

const main = async () => {
  const missing = [];
  const { server, port } = await startServer(missing);
  const { browser, via } = await launchBrowser();
  const base = `http://127.0.0.1:${port}`;
  const routes = enumerateRoutes();

  fs.mkdirSync(OUTDIR, { recursive: true });
  const manifest = [];
  const started = Date.now();
  let n = 0;

  for (const vp of VIEWPORTS) {
    const targets = vp.kind === "width" ? routes : routes.filter((r) => DEEP_ROUTES.includes(r));
    if (!targets.length) continue;
    const dir = path.join(OUTDIR, vp.label);
    fs.mkdirSync(dir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();

    for (const route of targets) {
      const file = path.join(dir, routeSlug(route) + ".png");
      try {
        await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.addStyleTag({ content: FREEZE_CSS });
        await settle(page);
        await page.screenshot({ path: file, fullPage: true, animations: "disabled", scale: "css" });
        /* `fullPage` asks Chromium for its content size, which includes the
           off-canvas mobile navigation panel: it is `position: fixed` and
           translated 100% to the right, so the canvas comes back exactly twice
           the viewport wide with the page in the left half. Crop the empty
           half off rather than switching to `clip`, which cannot capture
           beyond the viewport. */
        cropToViewport(file, vp.width * vp.deviceScaleFactor);
        const { size } = fs.statSync(file);
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        manifest.push({ set: SET, viewport: vp.label, width: vp.width, route, file: path.relative(OUTDIR, file), bytes: size, pageHeight: height });
        n++;
        if (n % 25 === 0) process.stdout.write(`  … ${n} captured\n`);
      } catch (e) {
        manifest.push({ set: SET, viewport: vp.label, route, error: String(e.message).slice(0, 160) });
        process.stdout.write(`  !! ${vp.label} ${route}: ${String(e.message).split("\n")[0]}\n`);
      }
    }
    await context.close();
  }

  await browser.close();
  server.close();

  fs.writeFileSync(path.join(OUTDIR, "manifest.json"), JSON.stringify({
    set: SET, generatedAt: new Date().toISOString(), chromium: via,
    routes: routes.length, shots: manifest.length,
    durationSeconds: Math.round((Date.now() - started) / 100) / 10,
    missingAssets: [...new Set(missing.map((m) => m.url))].sort(),
    manifest,
  }, null, 2));

  const bytes = manifest.reduce((a, m) => a + (m.bytes || 0), 0);
  console.log(`\n${SET}: ${manifest.length} screenshots · ${(bytes / 1048576).toFixed(1)} MB · ${Math.round((Date.now() - started) / 1000)}s`);
  console.log(`→ ${path.relative(process.cwd(), OUTDIR)}`);
  const missingReal = [...new Set(missing.map((m) => m.url))];
  if (missingReal.length) console.log(`missing assets (${missingReal.length}): ${missingReal.slice(0, 8).join(", ")}`);
};

main().catch((e) => { console.error(e); process.exit(2); });

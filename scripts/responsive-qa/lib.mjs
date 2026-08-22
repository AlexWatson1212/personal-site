/**
 * scripts/responsive-qa/lib.mjs
 *
 * Shared plumbing for the responsive QA harness: a static server over
 * `_preview/` (assets fall through to the repo root), Chromium discovery,
 * route enumeration, the target viewport matrix, and a font-aware settle
 * helper. Read-only with respect to site sources.
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..", "..");
export const PREVIEW = path.join(ROOT, "_preview");

/* ── viewport matrix ─────────────────────────────────────────────────────── */

/** The eight target widths. Height is generous so nothing is height-clipped. */
export const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440];

export const VIEWPORTS = [
  ...WIDTHS.map((w) => ({
    label: `w${w}`, kind: "width", width: w, height: 900, deviceScaleFactor: 1,
  })),
  /* Short viewport heights — a phone in landscape-ish crop and a short laptop. */
  { label: "short-mobile", kind: "short", width: 390, height: 560, deviceScaleFactor: 1 },
  { label: "short-laptop", kind: "short", width: 1280, height: 620, deviceScaleFactor: 1 },
  /* 200% browser zoom: the CSS viewport halves while the device pixel ratio doubles. */
  /* 200% zoom on a 390px phone leaves a 195px CSS viewport. Overflow there is
     a real defect; heading composition at 195px is not a meaningful judgement,
     so this viewport is excluded from the one-word-line review. */
  { label: "zoom200-mobile", kind: "zoom", width: 195, height: 450, deviceScaleFactor: 2, judgeHeadings: false },
  { label: "zoom200-laptop", kind: "zoom", width: 640, height: 450, deviceScaleFactor: 2 },
  { label: "zoom200-desktop", kind: "zoom", width: 720, height: 450, deviceScaleFactor: 2 },
];

/* ── chromium discovery (mirrors scripts/qa-browser/run.mjs) ─────────────── */

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
  hits.sort((a, b) => {
    const score = (s) => (s.includes("chrome-linux/chrome") ? 0 : s.includes("headless") ? 1 : 2);
    return score(a) - score(b) || a.localeCompare(b);
  });
  return hits;
}

export async function launchBrowser() {
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

/* ── static server ───────────────────────────────────────────────────────── */

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
  let clean = urlPath.split("#")[0].split("?")[0];
  try { clean = decodeURIComponent(clean); } catch { /* keep raw */ }
  if (!clean.startsWith("/")) clean = "/" + clean;
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

export function startServer(missingLog = []) {
  const server = http.createServer((req, res) => {
    const { file, urlPath } = resolveRequest(req.url || "/");
    if (!file) {
      missingLog.push({ url: urlPath, referer: req.headers.referer || null });
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

/* ── routes ──────────────────────────────────────────────────────────────── */

export function enumerateRoutes() {
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

export const routeSlug = (r) =>
  (r === "/" ? "home" : r.replace(/^\//, "").replace(/\/$/, "").replace(/[^a-z0-9]+/gi, "-")) || "home";

/* ── settle: fonts, images, lazy content, animations ─────────────────────── */

export async function settle(page, { scroll = true } = {}) {
  /* Fonts first — every measurement below depends on the real faces. */
  try {
    await page.evaluate(async () => {
      const cap = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
      if (document.fonts) {
        await cap(document.fonts.ready, 8000);
        /* `ready` can resolve before a face requested mid-layout has loaded. */
        await new Promise((r) => setTimeout(r, 0));
        await cap(document.fonts.ready, 4000);
      }
    });
  } catch { /* ignore */ }

  if (scroll) {
    /* Trip lazy-loaded images and any scroll-triggered reveal. */
    try {
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.85);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => requestAnimationFrame(() => r()));
        }
        window.scrollTo(0, 0);
      });
    } catch { /* ignore */ }
  }

  /* Decode images that have actually finished loading. A lazy image still
     below the fold never resolves `decode()`, so every wait is bounded. */
  try {
    await page.evaluate(async () => {
      const cap = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
      const imgs = Array.from(document.images).filter((i) => i.complete && i.naturalWidth > 0);
      await cap(
        Promise.all(imgs.map((i) => (i.decode ? cap(i.decode().catch(() => {}), 1500) : null))),
        3000
      );
    });
  } catch { /* ignore */ }

  try { await page.waitForLoadState("networkidle", { timeout: 8000 }); } catch { /* ignore */ }
  try {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  } catch { /* ignore */ }
}

/** Freeze transitions/animations so screenshots are deterministic. */
export const FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
  html { caret-color: transparent !important; }
`;

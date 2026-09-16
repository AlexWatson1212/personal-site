/**
 * Launch-readiness inspection.
 *
 * Serves the rendered site and walks every public route at desktop and phone
 * width, checking the things that matter for traffic arriving from Instagram
 * and referrals: no horizontal overflow, no console errors, readable tap
 * targets, a single clear enquiry route, and metadata that survives being
 * shared.
 *
 * Local QA only. Not part of the Netlify build.
 */

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright').catch(() =>
  import('/home/claude/.npm-global/lib/node_modules/playwright/index.js'),
);
const chromium = pw.chromium || (pw.default && pw.default.chromium);

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '_site');
const SHOTS = resolve(import.meta.dirname, '..', '.launch-shots');
const PORT = 5207;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml',
};

function serve() {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0]);
    const candidates = [join(ROOT, path), join(ROOT, path, 'index.html')];
    for (const file of candidates) {
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
        return res.end(body);
      } catch { /* try next */ }
    }
    res.writeHead(404).end('not found');
  });
  return new Promise((ok) => server.listen(PORT, () => ok(server)));
}

const ROUTES = [
  '/', '/work/', '/work/sofia-marin/', '/work/maya-bennett/', '/work/daniel-mercer/',
  '/service/', '/services/practice-website/', '/guidance/', '/practice-clarity/',
  '/about/', '/contact/', '/terms/', '/privacy/', '/cancellation-and-refunds/',
  '/service-terms/practice-website/', '/accessibility/', '/404.html',
];

const problems = [];
const passes = [];
const notes = [];
const consoleErrors = [];

function check(name, ok, detail = '') {
  if (ok) passes.push(name);
  else problems.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

async function audit(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > doc.clientWidth + 1) {
        offenders.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 40) || '(none)'}`);
      }
    }

    // Tap targets: anything interactive and visible must clear 40px.
    const small = [];
    const boxes = [];
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      // Inline links inside running text are exempt: they are words in a
      // sentence, not buttons, and WCAG 2.5.8 excludes them for that reason.
      const inline = el.tagName === 'A' &&
        (el.classList.contains('inline-link') ||
          (style.display.startsWith('inline') && el.closest('p, li, dd, figcaption, span')));
      if (inline) continue;
      // The hit area, not the ink: an ::after overlay enlarges what a thumb
      // can reach without moving anything on screen.
      const after = getComputedStyle(el, '::after');
      let hit = r.height;
      if (after.content && after.content !== 'none' && after.position === 'absolute') {
        const top = parseFloat(after.top) || 0;
        const bottom = parseFloat(after.bottom) || 0;
        if (top < 0 || bottom < 0) hit = r.height - top - bottom;
      }
      if (hit < 39.5) small.push(`${el.tagName.toLowerCase()}"${(el.textContent || '').trim().slice(0, 24)}" ${Math.round(hit)}px`);
      boxes.push({ label: (el.textContent || '').trim().slice(0, 20), top: r.top - Math.max(0, (hit - r.height) / 2), bottom: r.bottom + Math.max(0, (hit - r.height) / 2), left: r.left, right: r.right });
    }

    // Two targets that overlap are worse than one that is small: the upper one
    // swallows taps meant for the lower.
    const overlaps = [];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i]; const b = boxes[j];
        const vy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        const vx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        if (vy > 1 && vx > 1) overlaps.push(`"${a.label}" / "${b.label}"`);
      }
    }

    const imgs = [...document.querySelectorAll('img')];
    return {
      scrolls: doc.scrollWidth > doc.clientWidth + 1,
      width: doc.scrollWidth,
      client: doc.clientWidth,
      offenders: [...new Set(offenders)].slice(0, 5),
      small: [...new Set(small)].slice(0, 5),
      overlaps: [...new Set(overlaps)].slice(0, 5),
      h1s: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      imgsNoAlt: imgs.filter((i) => i.getAttribute('alt') === null).length,
      imgsBroken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')).slice(0, 5),
      title: document.title,
      desc: (document.querySelector('meta[name=description]') || {}).content || '',
      canonical: (document.querySelector('link[rel=canonical]') || {}).href || '',
      ogTitle: (document.querySelector('meta[property="og:title"]') || {}).content || '',
      ogImage: (document.querySelector('meta[property="og:image"]') || {}).content || '',
      robots: (document.querySelector('meta[name=robots]') || {}).content || '',
      bracketed: (document.body.innerText.match(/\[[^\]\n]{8,120}\]/g) || []).slice(0, 12),
      money: [...new Set(document.body.innerText.match(/£[\d,]+/g) || [])],
      internalLinks: [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')))],
    };
  });
}

const server = await serve();
await mkdir(SHOTS, { recursive: true });
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);

const allLinks = new Set();
const seenMoney = new Set();
const bracketPages = [];

for (const [label, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  // hasTouch makes the browser report `pointer: coarse`, which is what the
  // touch-target rules are keyed on. Without it they would never apply.
  for (const route of ROUTES) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      hasTouch: label === 'mobile',
      isMobile: label === 'mobile',
    });
    const page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${label} ${route}: ${m.text()}`); });
    page.on('pageerror', (e) => consoleErrors.push(`${label} ${route}: ${e.message}`));
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(120);
    const a = await audit(page);

    check(`${label} ${route} no sideways scroll`, !a.scrolls, `${a.width}px in ${a.client}px; ${a.offenders.join(', ')}`);
    check(`${label} ${route} exactly one h1`, a.h1s.length === 1, `${a.h1s.length} found`);
    check(`${label} ${route} every image has alt`, a.imgsNoAlt === 0, `${a.imgsNoAlt} without alt`);
    check(`${label} ${route} no broken images`, a.imgsBroken.length === 0, a.imgsBroken.join(', '));
    check(`${label} ${route} has a title`, a.title.length > 10, a.title);
    check(`${label} ${route} has a description`, a.desc.length > 40, `${a.desc.length} chars`);
    check(`${label} ${route} has a canonical`, a.canonical.startsWith('https://alexanderwatson.co.uk'), a.canonical);
    check(`${label} ${route} has an OG image`, a.ogImage.startsWith('https://'), a.ogImage);

    if (label === 'mobile') {
      check(`mobile ${route} tap targets clear 40px`, a.small.length === 0, a.small.join(' · '));
      check(`mobile ${route} no overlapping tap targets`, a.overlaps.length === 0, a.overlaps.join(' · '));
    }

    for (const l of a.internalLinks) allLinks.add(l);
    for (const m of a.money) seenMoney.add(m);
    if (a.bracketed.length) bracketPages.push({ route, found: a.bracketed });

    if (label === 'mobile' || ['/', '/work/', '/service/', '/contact/', '/about/'].includes(route)) {
      const name = route.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
      await page.screenshot({ path: join(SHOTS, `${label}-${name}.png`), fullPage: label === 'mobile' });
    }
    await context.close();
  }
}

/* Internal link resolution. */
const broken = [];
for (const href of allLinks) {
  const url = href.split('#')[0].split('?')[0];
  if (!url || url.startsWith('//')) continue;
  const res = await fetch(`http://localhost:${PORT}${url}`).catch(() => null);
  if (!res || !res.ok) broken.push(url);
}
check('every internal link resolves', broken.length === 0, broken.join(', '));

/* Enquiry flow. */
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.on('pageerror', (e) => consoleErrors.push(`enquiry: ${e.message}`));
await page.goto(`http://localhost:${PORT}/contact/`, { waitUntil: 'networkidle' });
await page.fill('#f-name', 'A Therapist');
await page.fill('#f-email', 'therapist@example.com');
await page.selectOption('#f-design', { index: 1 });
await page.fill('#f-message', 'Person-centred practice in Leeds, mostly adults. Words are rough notes.');
await page.click('form.form button[type=submit]').catch(() => {});
await page.waitForTimeout(400);
const prepared = await page.locator('#f-prepared').inputValue().catch(() => '');
check('enquiry form prepares a copyable message', prepared.includes('A Therapist') && prepared.length > 80, `${prepared.length} chars`);
const fallbackVisible = await page.locator('[data-form-fallback]').isVisible().catch(() => false);
check('enquiry fallback becomes visible', fallbackVisible);
await context.close();

await browser.close();
server.close();

notes.push(`Money figures across the whole site: ${[...seenMoney].sort().join(', ')}`);
if (bracketPages.length) {
  notes.push('Bracketed placeholder text rendered on public pages:');
  for (const b of bracketPages) notes.push(`   ${b.route} — ${b.found.length}: ${b.found.slice(0, 3).join(' | ')}`);
}

console.log(`\n${passes.length} checks passed.`);
for (const n of notes) console.log(n);
if (consoleErrors.length) {
  console.log('\nConsole errors:');
  for (const e of [...new Set(consoleErrors)].slice(0, 10)) console.log(`  ${e}`);
}
if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log('No problems found.');

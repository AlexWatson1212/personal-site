#!/usr/bin/env node
/**
 * QA checks for the studio site.
 *
 *   npm test          → checks the source files, and the built site if _site exists
 *   npm run test:site → builds first, then checks both
 *
 * Dependency-free on purpose: it must keep working on Netlify and on a laptop
 * with nothing installed beyond Node.
 *
 * Every check below asserts something about the architecture that actually
 * exists: the route table, the three service routes and their prices, the
 * single buy component, the generated purchasing configuration, the draft
 * state of the legal pages, and the questionnaire. A check that needs _site
 * skips rather than fails when the site has not been built.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "_site");
const hasSite = fs.existsSync(SITE);

const results = [];
let failures = 0;
let skipped = 0;

function check(group, name, fn) {
  try {
    const note = fn();
    results.push({ group, name, status: "pass", note: note || "" });
  } catch (error) {
    if (error && error.skip) {
      skipped += 1;
      results.push({ group, name, status: "skip", note: error.message });
      return;
    }
    failures += 1;
    results.push({ group, name, status: "FAIL", note: error.message });
  }
}

function skip(message) {
  const error = new Error(message);
  error.skip = true;
  throw error;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relative) {
  const file = path.join(ROOT, relative);
  assert(fs.existsSync(file), `missing file: ${relative}`);
  return fs.readFileSync(file, "utf8");
}

function exists(relative) {
  return fs.existsSync(path.join(ROOT, relative));
}

function readSite(relative) {
  const file = path.join(SITE, relative);
  assert(fs.existsSync(file), `missing built file: _site/${relative}`);
  return fs.readFileSync(file, "utf8");
}

function walk(dir, filter, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      walk(abs, filter, found);
    } else if (filter(abs)) {
      found.push(abs);
    }
  }
  return found;
}

/** Line number (1-based) of a character offset. */
function lineAt(body, index) {
  return body.slice(0, index).split("\n").length;
}

/* ------------------------------------------------------------------ *
 * Repository model
 * ------------------------------------------------------------------ */

const EXCLUDED_DIRS = new Set([
  ".git",
  ".jekyll-cache",
  "_legacy",
  "_preview",
  "_shots",
  "_site",
  "_transfer",
  "node_modules",
  "vendor",
]);

const EXCLUDED_PREFIXES = [
  "_legacy/",
  "_preview/",
  "_shots/",
  "_site/",
  "_transfer/",
  "node_modules/",
  "vendor/",
  "scripts/preview/",
  "scripts/qa-browser/",
];

function isExcludedPath(rel) {
  const posix = rel.split(path.sep).join("/");
  if (EXCLUDED_PREFIXES.some((p) => posix.startsWith(p))) return true;
  if (/^assets\/css\/.*\.min\.css$/.test(posix)) return true;
  return false;
}

/** Every file git knows about, minus the excluded trees. */
const trackedFiles = (() => {
  let listing = [];
  try {
    listing = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" })
      .split("\0")
      .filter(Boolean);
  } catch {
    listing = walk(ROOT, () => true).map((f) => path.relative(ROOT, f).split(path.sep).join("/"));
  }
  return listing.filter((rel) => !isExcludedPath(rel) && fs.existsSync(path.join(ROOT, rel)));
})();

const config = read("_config.yml");

/** Root-level notes Jekyll is told to leave out of the build. */
const excludedRootDocs = new Set(
  [...config.matchAll(/^\s*-\s*([A-Za-z0-9._-]+\.md)\s*$/gm)].map((m) => m[1])
);

/**
 * A source file that Jekyll turns into published output. Internal notes,
 * scripts, legacy pages and everything under the excluded trees are not.
 */
function isPublishedSource(rel) {
  const posix = rel.split(path.sep).join("/");
  if (isExcludedPath(posix)) return false;
  if (posix.startsWith("scripts/")) return false;
  if (!posix.includes("/") && excludedRootDocs.has(posix)) return false;
  return /\.(html|md|markdown)$/.test(posix);
}

const publishedSources = trackedFiles.filter(isPublishedSource);
const publishedBodies = new Map(
  publishedSources.map((rel) => [rel, fs.readFileSync(path.join(ROOT, rel), "utf8")])
);

/** Files whose text is rendered into pages but which are not pages themselves. */
const LEGAL_PAGES = [
  "_pages/privacy.html",
  "_pages/terms.html",
  "_pages/service-terms-straightforward-website.html",
  "_pages/cancellation-and-refunds.html",
];
const LEGAL_SURFACE = new Set([...LEGAL_PAGES, "_includes/legal-draft-notice.html", "_pages/accessibility.html"]);

/** The expected route table: source file → permalink. */
const ROUTES = [
  ["index.html", "/"],
  ["service.html", "/service/"],
  ["services/straightforward-website.html", "/services/straightforward-website/"],
  ["services/straightforward-website-questionnaire.html", "/services/straightforward-website/questionnaire/"],
  ["purchase-complete.html", "/purchase-complete/"],
  ["work.html", "/work/"],
  ["about.html", "/about/"],
  ["contact.html", "/contact/"],
  ["blog.html", "/blog/"],
  ["practice-clarity.html", "/practice-clarity/"],
  ["links/index.html", "/links/"],
  ["404.html", "/404.html"],
  ["_pages/privacy.html", "/privacy/"],
  ["_pages/terms.html", "/terms/"],
  ["_pages/service-terms-straightforward-website.html", "/service-terms/straightforward-website/"],
  ["_pages/cancellation-and-refunds.html", "/cancellation-and-refunds/"],
  ["_pages/accessibility.html", "/accessibility/"],
];

/** Routes that must never be indexed or listed. */
const PRIVATE_ROUTES = ["/purchase-complete/", "/services/straightforward-website/questionnaire/"];

const BUY_INCLUDE = "_includes/straightforward-website-buy.html";
const PURCHASE_PAGE = "services/straightforward-website.html";
const QUESTIONNAIRE = "services/straightforward-website-questionnaire.html";
const COMPLETE_PAGE = "purchase-complete.html";
const SUPPORT_EMAIL = "hello@alexanderwatson.co.uk";

/**
 * Assembled rather than written out, so this file never itself contains a
 * literal Stripe checkout URL or key prefix for the scans below to trip on.
 */
const STRIPE_BUY_PREFIX = "https://buy." + "stripe.com/";
const SANDBOX_LINK = STRIPE_BUY_PREFIX + "test_" + "qaSandboxLink";
const LIVE_LINK = STRIPE_BUY_PREFIX + "qaLiveLink";
const KEY_PREFIXES = [
  ["sk", "live"].join("_") + "_",
  ["sk", "test"].join("_") + "_",
  ["rk", "live"].join("_") + "_",
  ["rk", "test"].join("_") + "_",
  ["whsec"].join("_") + "_",
];
const PUBLISHABLE_PREFIXES = [["pk", "live"].join("_") + "_", ["pk", "test"].join("_") + "_"];
const STRIPE_SDK_HOST = "js." + "stripe.com";

const APPROVED_PRICES = new Set(["£495", "£995", "£1,995", "£29", "£290"]);
const RETIRED_PRICES = ["795", "1,495", "2,195"].map((n) => "£" + n);

const purchasingYml = read("_data/purchasing.yml");
const legalYml = read("_data/legal.yml");
const intakeYml = read("_data/intake.yml");
const buyInclude = read(BUY_INCLUDE);
const purchasePage = read(PURCHASE_PAGE);
const questionnaire = read(QUESTIONNAIRE);
const completePage = read(COMPLETE_PAGE);
const servicePage = read("service.html");
const homePage = read("index.html");
const layout = read("_layouts/default.html");

/** front matter block of a source file, or "" when there is none. */
function frontMatter(body) {
  const match = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : "";
}

function frontMatterValue(body, key) {
  const fm = frontMatter(body);
  const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

/* ------------------------------------------------------------------ *
 * 1. Routes
 * ------------------------------------------------------------------ */

check("Routes", "Every expected route has a source file with the right permalink", () => {
  const missing = [];
  for (const [file, permalink] of ROUTES) {
    if (!exists(file)) {
      missing.push(`${file} does not exist (expected to publish ${permalink})`);
      continue;
    }
    const found = frontMatterValue(read(file), "permalink");
    if (found !== permalink) {
      missing.push(`${file} declares permalink "${found ?? "(none)"}" — expected "${permalink}"`);
    }
  }
  assert(missing.length === 0, missing.join("\n"));
  return `${ROUTES.length} routes`;
});

check("Routes", "No two source files claim the same permalink", () => {
  const seen = new Map();
  const clashes = [];
  let counted = 0;
  for (const [rel, body] of publishedBodies) {
    const permalink = frontMatterValue(body, "permalink");
    if (!permalink) continue;
    counted += 1;
    if (seen.has(permalink)) clashes.push(`${permalink} claimed by ${seen.get(permalink)} and ${rel}`);
    else seen.set(permalink, rel);
  }
  assert(counted >= ROUTES.length, `only ${counted} permalinks found in published source — the scan is not seeing the pages`);
  assert(clashes.length === 0, clashes.join("\n"));
  return `${counted} permalinks, all distinct`;
});

/* ------------------------------------------------------------------ *
 * 2. Prices
 * ------------------------------------------------------------------ */

check("Prices", "Every £ amount in published source is an approved price", () => {
  const offenders = [];
  let scanned = 0;
  let amounts = 0;
  const sources = [...publishedBodies, ...["_data/purchasing.yml"].map((f) => [f, read(f)])];
  for (const [rel, body] of sources) {
    scanned += 1;
    for (const match of body.matchAll(/£\s*\d(?:[\d,]*\d)?(?:\.\d{2})?/g)) {
      amounts += 1;
      const amount = match[0].replace(/\s+/g, "");
      if (APPROVED_PRICES.has(amount)) continue;
      offenders.push(`${rel}:${lineAt(body, match.index)} — ${amount}`);
    }
  }
  assert(scanned > 10, `only ${scanned} files scanned — the price scan is not seeing the site`);
  assert(amounts > 10, `only ${amounts} £ amounts found — the price scan is not seeing the prices`);
  assert(offenders.length === 0, `unapproved amounts:\n${offenders.join("\n")}`);
  return `${amounts} amounts across ${scanned} files, all in {${[...APPROVED_PRICES].join(", ")}}`;
});

check("Prices", "Retired amounts appear nowhere in the repository", () => {
  const offenders = [];
  for (const rel of trackedFiles) {
    if (!/\.(html|md|markdown|yml|yaml|json|js|mjs|css|txt|toml)$/.test(rel)) continue;
    const body = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const price of RETIRED_PRICES) {
      let index = body.indexOf(price);
      while (index !== -1) {
        offenders.push(`${rel}:${lineAt(body, index)} — ${price}`);
        index = body.indexOf(price, index + 1);
      }
    }
  }
  assert(trackedFiles.length > 50, `only ${trackedFiles.length} tracked files listed — the scan is not seeing the repository`);
  assert(offenders.length === 0, `retired prices still present:\n${offenders.join("\n")}`);
  return `${RETIRED_PRICES.join(", ")} absent from ${trackedFiles.length} files`;
});

check("Prices", "The displayed prices come from _data/purchasing.yml", () => {
  assert(/^price_display:\s*"£495"\s*$/m.test(purchasingYml), "price_display is not £495");
  assert(/^guided_price_display:\s*"£995"\s*$/m.test(purchasingYml), "guided_price_display is not £995");
  assert(/^bespoke_price_display:\s*"£1,995"\s*$/m.test(purchasingYml), "bespoke_price_display is not £1,995");
  assert(/monthly:\s*"£29"/.test(purchasingYml), "Website Care monthly price is not £29");
  assert(/annual:\s*"£290"/.test(purchasingYml), "Website Care annual price is not £290");
});

/* ------------------------------------------------------------------ *
 * 3. Checkout scope
 * ------------------------------------------------------------------ */

check("Checkout scope", "Only the buy component can emit a checkout link", () => {
  const offenders = [];
  for (const rel of trackedFiles) {
    if (rel === BUY_INCLUDE) continue;
    if (rel === "scripts/purchasing-config.mjs" || rel === "scripts/qa.mjs") continue;
    // Documentation legitimately shows a placeholder URL; check 6 polices it.
    if (/^[A-Z0-9._-]+\.md$/.test(rel)) continue;
    if (!/\.(html|md|markdown|yml|yaml|json|js|mjs)$/.test(rel)) continue;
    const body = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const match of body.matchAll(/https:\/\/buy\.stripe\.com\/([A-Za-z0-9_-]+)/g)) {
      offenders.push(`${rel}:${lineAt(body, match.index)} hard-codes a checkout URL`);
    }
    if (/active_payment_link/.test(body)) {
      offenders.push(`${rel}:${lineAt(body, body.indexOf("active_payment_link"))} reads the resolved Payment Link outside the buy component`);
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
  assert(/active_payment_link/.test(buyInclude), `${BUY_INCLUDE} no longer reads the resolved Payment Link — the check would pass vacuously`);
});

check("Checkout scope", "The buy component is included only on the Straightforward Website route", () => {
  const including = [];
  for (const [rel, body] of publishedBodies) {
    if (rel === BUY_INCLUDE) continue; // its own usage comment is not a placement
    if (/\{%-?\s*include\s+straightforward-website-buy\.html/.test(body)) including.push(rel);
  }
  assert(including.length > 0, "nothing includes the buy component — the purchase journey has no buy action");
  assert(
    including.length === 1 && including[0] === PURCHASE_PAGE,
    `the buy component is included by: ${including.join(", ")} — only ${PURCHASE_PAGE} may include it`
  );
  const count = (purchasePage.match(/include straightforward-website-buy\.html/g) || []).length;
  assert(count >= 1, `${PURCHASE_PAGE} does not include the buy component`);
  return `${count} placements on ${PURCHASE_PAGE}`;
});

check("Checkout scope", "The buy component carries the stated Straightforward CTAs", () => {
  assert(
    /Pay \{\{ price \}\} and begin my website/.test(buyInclude),
    `${BUY_INCLUDE} no longer renders "Pay {{ price }} and begin my website"`
  );
  assert(/price_display/.test(buyInclude), `${BUY_INCLUDE} does not take its price from _data/purchasing.yml`);
  const secondaries = (buyInclude.match(/>Ask a question first</g) || []).length;
  assert(secondaries >= 2, `${BUY_INCLUDE} must offer "Ask a question first" in both the open and closed states (found ${secondaries})`);
});

/** Guided and Practice Clarity blocks, on the services page and the home page. */
function serviceBlocks() {
  const blocks = [];
  for (const match of servicePage.matchAll(/<article id="([^"]+)"[\s\S]*?<\/article>/g)) {
    blocks.push({ file: "service.html", id: match[1], body: match[0] });
  }
  const cards = homePage.split('<article class="offer-card"').slice(1);
  for (const card of cards) {
    const heading = (card.match(/<h3>([^<]+)<\/h3>/) || [])[1] || "(unnamed)";
    blocks.push({ file: "index.html", id: heading.trim(), body: card.split("</article>")[0] });
  }
  return blocks;
}

check("Checkout scope", "Guided and Practice Clarity carry no purchase action", () => {
  const blocks = serviceBlocks();
  assert(blocks.length >= 6, `only ${blocks.length} service blocks found across service.html and index.html`);
  const straightforward = /straightforward/i;
  let inspected = 0;
  for (const block of blocks) {
    if (straightforward.test(block.id)) continue;
    inspected += 1;
    assert(
      !/straightforward-website-buy\.html/.test(block.body),
      `${block.file} · ${block.id} includes the buy component`
    );
    assert(!/Pay\s+(£495|\{\{)/.test(block.body), `${block.file} · ${block.id} shows a pay action`);
    assert(
      !/\/services\/straightforward-website\//.test(block.body),
      `${block.file} · ${block.id} links into the checkout page`
    );
  }
  assert(inspected >= 4, `only ${inspected} non-Straightforward blocks inspected`);
  return `${inspected} Guided / Practice Clarity blocks`;
});

/* ------------------------------------------------------------------ *
 * 4. Service models
 * ------------------------------------------------------------------ */

check("Service routes", "Guided Website stays enquiry-led at £995", () => {
  const block = servicePage.split('<article id="guided"')[1] || "";
  assert(block.length > 200, "the Guided section could not be read from service.html");
  assert(/£995/.test(block), "the Guided section does not show £995");
  assert(/>Discuss your website</.test(block), 'the Guided CTA is not "Discuss your website"');
  assert(/\/contact\/\?service=guided/.test(block), "the Guided CTA does not lead to an enquiry");
  assert(/Not bought online/i.test(block), "the Guided section does not say it is not bought online");
  assert(/written scope/i.test(block), "the Guided section does not mention a written scope");
  assert(!/buy\.stripe\.com|straightforward-website-buy/.test(block), "the Guided section offers an online payment");
});

check("Service routes", "Practice Clarity stays proposal-led at £1,995", () => {
  const block = servicePage.split('<article id="practice-clarity"')[1] || "";
  assert(block.length > 200, "the Practice Clarity section could not be read from service.html");
  assert(/£1,995/.test(block), "the Practice Clarity section does not show £1,995");
  assert(/>Start a conversation</.test(block), 'the Practice Clarity CTA is not "Start a conversation"');
  assert(/\/contact\/\?service=practice-clarity/.test(block), "the Practice Clarity CTA does not lead to an enquiry");
  assert(/proposal/i.test(block), "the Practice Clarity section does not mention a proposal");
  assert(/Not bought online/i.test(block), "the Practice Clarity section does not say it is not bought online");
  assert(!/buy\.stripe\.com|straightforward-website-buy/.test(block), "the Practice Clarity section offers an online payment");
});

check("Service routes", "Straightforward Website is the only route with an online checkout", () => {
  const block = servicePage.split('<article id="straightforward-website"')[1] || "";
  assert(block.length > 200, "the Straightforward section could not be read from service.html");
  assert(/£495/.test(block), "the Straightforward section does not show £495");
  assert(/Buy it online/i.test(block), "the Straightforward section does not say it is bought online");
  assert(/\/services\/straightforward-website\//.test(block), "the Straightforward section does not link to the purchase page");
});

/* ------------------------------------------------------------------ *
 * 5. Website Care
 * ------------------------------------------------------------------ */

check("Website Care", "Presented as optional, at £29 per month or £290 per year", () => {
  let described = 0;
  for (const rel of [PURCHASE_PAGE, "service.html"]) {
    const body = read(rel);
    const index = body.indexOf("Website Care");
    assert(index !== -1, `${rel} does not mention Website Care`);
    const block = body.slice(Math.max(0, index - 900), index + 900);
    assert(/optional/i.test(block), `${rel} does not describe Website Care as optional`);
    assert(/£29 per month/.test(block) && /£290 per year/.test(block), `${rel} does not state £29 per month / £290 per year`);
    described += 1;
  }
  return `${described} pages`;
});

check("Website Care", "No subscription is built or activated", () => {
  assert(/subscriptions_enabled:\s*false/.test(purchasingYml), "_data/purchasing.yml does not set subscriptions_enabled: false");
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    const index = body.indexOf("Website Care");
    if (index === -1) continue;
    const block = body.slice(Math.max(0, index - 1200), index + 1200);
    if (/https:\/\/buy\.stripe\.com|straightforward-website-buy|data-purchase-action/.test(block)) {
      offenders.push(`${rel}:${lineAt(body, index)} places a checkout action beside Website Care`);
    }
  }
  for (const [rel, body] of publishedBodies) {
    for (const match of body.matchAll(/\b(subscribe now|start (your |a )?subscription|set up a subscription|recurring payment|direct debit|standing order)\b/gi)) {
      offenders.push(`${rel}:${lineAt(body, match.index)} offers a recurring payment ("${match[0]}")`);
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
});

/* ------------------------------------------------------------------ *
 * 6. Purchasing configuration
 * ------------------------------------------------------------------ */

check("Configuration", "The build-time resolver exists and _config.yml holds no Payment Link", () => {
  assert(exists("scripts/purchasing-config.mjs"), "scripts/purchasing-config.mjs is missing");
  assert(!/^\s*stripe_payment_link:/m.test(config), "_config.yml still carries a stripe_payment_link key");
  assert(/config:purchasing/.test(read("package.json")), "npm run build does not run the purchasing resolver");
  assert(
    /^_data\/purchasing_resolved\.yml$/m.test(read(".gitignore")),
    "_data/purchasing_resolved.yml is not gitignored"
  );
  assert(!trackedFiles.includes("_data/purchasing_resolved.yml"), "_data/purchasing_resolved.yml is committed");
  assert(trackedFiles.includes("_data/purchasing.yml"), "_data/purchasing.yml is not committed");
  assert(
    !/https:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]/.test(purchasingYml),
    "_data/purchasing.yml contains a Payment Link; it must hold no links"
  );
});

check("Configuration", "Any checkout URL in the documentation is a placeholder", () => {
  const docs = trackedFiles.filter((rel) => /\.md$/.test(rel) && !rel.includes("/"));
  assert(docs.length > 0, "no root documentation found to scan");
  let seen = 0;
  const offenders = [];
  for (const rel of docs) {
    const body = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const match of body.matchAll(/https:\/\/buy\.stripe\.com\/([A-Za-z0-9_-]+)(\.{3}|…)?/g)) {
      seen += 1;
      const [, token, ellipsis] = match;
      const placeholder = Boolean(ellipsis) || /YOUR|HERE|EXAMPLE|XXX|PLACEHOLDER|REPLACE/i.test(token);
      if (!placeholder) offenders.push(`${rel}:${lineAt(body, match.index)} — ${token}`);
    }
    // Any unpublished note may discuss checkout URLs. What matters is that a
    // real Payment Link never appears in one — that is checked above.
  }
  assert(offenders.length === 0, `documentation contains what looks like a real Payment Link:\n${offenders.join("\n")}`);
  assert(seen > 0, "STRIPE_SETUP.md shows no example Payment Link — this check would pass vacuously");
  return `${seen} documented URLs, all placeholders`;
});

check("Configuration", "The buy component gates on both the switch and the URL prefix", () => {
  assert(/resolved\.purchases_enabled/.test(buyInclude), "the include no longer gates on resolved.purchases_enabled");
  assert(/slice: 0, 23/.test(buyInclude), "the include no longer takes the 23-character URL prefix");
  assert(
    buyInclude.includes("link_prefix == 'https://buy.stripe.com/'"),
    "the include no longer compares the prefix against the Stripe checkout host"
  );
  assert(/assign purchase_enabled = false/.test(buyInclude), "the include no longer defaults to disabled");
  assert(
    buyInclude.indexOf("assign purchase_enabled = false") < buyInclude.indexOf("resolved.purchases_enabled"),
    "the include does not default to disabled before testing the switch"
  );
});

check("Configuration", "The unavailable state still offers a working route", () => {
  const closed = buyInclude.split("{%- else -%}")[1] || "";
  assert(closed.length > 100, "the include has no closed-state branch");
  assert(/Online purchasing is opening shortly/.test(closed), 'the closed state does not say "opening shortly"');
  assert(/<button[\s\S]*?disabled/.test(closed), "the closed state is not a genuinely disabled button");
  assert(/cfg\.urls\.enquiry/.test(closed), "the closed state has no working enquiry route");
  assert(/>Ask a question first</.test(closed), 'the closed state has no "Ask a question first" link');
});

/* ------------------------------------------------------------------ *
 * 7. Resolver behaviour, in a child process
 * ------------------------------------------------------------------ */

check("Configuration", "The resolver fails safe without a live Payment Link", () => {
  const script = path.join(ROOT, "scripts", "purchasing-config.mjs");
  assert(fs.existsSync(script), "scripts/purchasing-config.mjs is missing");
  const output = path.join(ROOT, "_data", "purchasing_resolved.yml");
  const original = fs.existsSync(output) ? fs.readFileSync(output, "utf8") : null;

  function run(overrides) {
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (/^(PUBLIC_|CONTEXT$|JEKYLL_ENV$)/.test(key)) delete env[key];
    }
    Object.assign(env, overrides);
    const result = spawnSync(process.execPath, [script], { cwd: ROOT, env, encoding: "utf8" });
    const yaml = fs.existsSync(output) ? fs.readFileSync(output, "utf8") : "";
    return { status: result.status, yaml, stderr: result.stderr || "" };
  }

  try {
    const bare = run({});
    assert(bare.status === 0, "a bare build should not fail");
    assert(/^purchases_enabled: false$/m.test(bare.yaml), "(a) no environment did not resolve to purchases_enabled: false");

    const prod = run({
      CONTEXT: "production",
      PUBLIC_PURCHASES_ENABLED: "true",
      PUBLIC_STRIPE_TEST_LINK: SANDBOX_LINK,
    });
    assert(prod.status === 0, "a production build with only a sandbox link should not fail");
    assert(/^purchases_enabled: false$/m.test(prod.yaml), "(b) production + sandbox link resolved to purchases_enabled: true");
    assert(/^active_payment_link: ""$/m.test(prod.yaml), "(b) production + sandbox link left a Payment Link in the output");
    assert(!prod.yaml.includes("test_"), "(b) the production output mentions the sandbox link");

    const preview = run({
      CONTEXT: "deploy-preview",
      PUBLIC_PURCHASES_ENABLED: "true",
      PUBLIC_STRIPE_TEST_LINK: SANDBOX_LINK,
    });
    assert(preview.status === 0, "a deploy preview with a sandbox link should not fail");
    assert(/^purchases_enabled: true$/m.test(preview.yaml), "(c) a deploy preview did not enable purchasing");
    assert(preview.yaml.includes(SANDBOX_LINK), "(c) a deploy preview did not use the sandbox link");
    assert(/^link_source: "sandbox"$/m.test(preview.yaml), "(c) the sandbox link was not recorded as such");

    const leaked = run({
      CONTEXT: "production",
      PUBLIC_PURCHASES_ENABLED: "true",
      PUBLIC_STRIPE_STRAIGHTFORWARD_LINK: KEY_PREFIXES[0] + "0123456789abcdef",
    });
    assert(leaked.status !== 0, "(d) a secret-shaped value in a link variable did not stop the build");
    assert(/secret or restricted key/i.test(leaked.stderr), "(d) the build stopped without explaining why");

    return "4 environments: bare, production+sandbox, preview+sandbox, leaked key";
  } finally {
    if (original !== null) fs.writeFileSync(output, original, "utf8");
    else spawnSync(process.execPath, [script], { cwd: ROOT, env: { ...process.env }, encoding: "utf8" });
  }
});

check("Configuration", "The resolver left the generated file as it found it", () => {
  const output = "_data/purchasing_resolved.yml";
  if (!exists(output)) skip("no _data/purchasing_resolved.yml — purchasing is off, which is the safe state");
  const body = read(output);
  assert(/^purchases_enabled:\s*(true|false)$/m.test(body), "the generated file has no purchases_enabled value");
  assert(!body.includes("test_"), `${output} still holds a sandbox link left over from the resolver checks`);
  assert(!body.includes(SANDBOX_LINK), `${output} still holds the QA sandbox link`);
  return body.match(/^purchases_enabled:\s*(\S+)$/m)[1] === "true" ? "purchasing on" : "purchasing off";
});

/* ------------------------------------------------------------------ *
 * 8. Sandbox links in built output
 * ------------------------------------------------------------------ */

check("Built site", "No sandbox checkout link reached the built output", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const built = walk(SITE, (f) => /\.(html|xml|json|txt|js|css)$/.test(f));
  assert(built.length > 0, "_site exists but contains no files to scan");
  const offenders = [];
  for (const file of built) {
    const body = fs.readFileSync(file, "utf8");
    if (body.includes("buy.stripe.com/test")) offenders.push(path.relative(SITE, file));
  }
  assert(offenders.length === 0, `sandbox links in built output: ${offenders.join(", ")}`);
  return `${built.length} built files`;
});

/* ------------------------------------------------------------------ *
 * 9. Secrets
 * ------------------------------------------------------------------ */

check("Secrets", "No Stripe secret or restricted key in any tracked file", () => {
  const offenders = [];
  let scanned = 0;
  for (const rel of trackedFiles) {
    let body;
    try {
      body = fs.readFileSync(path.join(ROOT, rel), "utf8");
    } catch {
      continue;
    }
    if (body.includes(" ")) continue;
    scanned += 1;
    for (const prefix of KEY_PREFIXES) {
      const pattern = new RegExp(prefix + "[0-9A-Za-z]");
      const index = body.search(pattern);
      if (index !== -1) offenders.push(`${rel}:${lineAt(body, index)} — ${prefix}…`);
    }
  }
  assert(scanned > 50, `only ${scanned} files scanned — the secret scan is not seeing the repository`);
  assert(offenders.length === 0, `possible secrets:\n${offenders.join("\n")}`);
  return `${scanned} tracked files scanned for ${KEY_PREFIXES.length} key shapes`;
});

check("Secrets", "No publishable key or Stripe SDK in the front end", () => {
  const front = trackedFiles.filter((rel) => /\.(html|md|markdown|js|json)$/.test(rel));
  assert(front.length > 20, `only ${front.length} front-end files found`);
  const offenders = [];
  for (const rel of front) {
    const body = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const prefix of PUBLISHABLE_PREFIXES) {
      const index = body.search(new RegExp(prefix + "[0-9A-Za-z]"));
      if (index !== -1) offenders.push(`${rel}:${lineAt(body, index)} — publishable key`);
    }
    const sdk = body.indexOf(STRIPE_SDK_HOST);
    if (sdk !== -1 && rel !== "scripts/qa.mjs") {
      offenders.push(`${rel}:${lineAt(body, sdk)} loads the Stripe SDK; Payment Links do not need it`);
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return `${front.length} files`;
});

/* ------------------------------------------------------------------ *
 * 10. Legal links from the purchase journey
 * ------------------------------------------------------------------ */

const JOURNEY_LEGAL = [
  ["/service-terms/straightforward-website/", "_pages/service-terms-straightforward-website.html"],
  ["/cancellation-and-refunds/", "_pages/cancellation-and-refunds.html"],
  ["/privacy/", "_pages/privacy.html"],
];

check("Legal", "Service terms, cancellation, privacy and terms are real routes", () => {
  const known = new Set(ROUTES.map(([, permalink]) => permalink));
  for (const [route] of JOURNEY_LEGAL) assert(known.has(route), `${route} is not in the route table`);
  assert(known.has("/terms/"), "/terms/ is not in the route table");
  for (const [route, file] of [...JOURNEY_LEGAL, ["/terms/", "_pages/terms.html"]]) {
    assert(exists(file), `${file} is missing`);
    assert(frontMatterValue(read(file), "permalink") === route, `${file} does not publish at ${route}`);
  }
});

check("Legal", "The purchase journey links to the terms it is made under", () => {
  const surfaces = [
    [PURCHASE_PAGE, purchasePage],
    [COMPLETE_PAGE, completePage],
    [BUY_INCLUDE, buyInclude],
    [QUESTIONNAIRE, questionnaire],
  ];
  const cfgAlias = {
    "/service-terms/straightforward-website/": "cfg.urls.service_terms",
    "/cancellation-and-refunds/": "cfg.urls.cancellation",
    "/privacy/": "cfg.urls.privacy",
  };
  for (const [rel, body] of surfaces) {
    for (const [route] of JOURNEY_LEGAL) {
      if (rel === QUESTIONNAIRE && route === "/cancellation-and-refunds/") continue;
      const linked = body.includes(route) || body.includes(cfgAlias[route]);
      assert(linked, `${rel} does not link to ${route}`);
    }
  }
  const footer = read("_includes/footer.html");
  for (const route of ["/privacy/", "/terms/", "/cancellation-and-refunds/", "/accessibility/"]) {
    assert(footer.includes(route), `the site footer does not link to ${route}`);
  }
  return `${surfaces.length} purchase surfaces plus the site footer`;
});

check("Legal", "The terms are readable before checkout", () => {
  const terms = read("_pages/service-terms-straightforward-website.html");
  assert(!/^noindex:\s*true/m.test(frontMatter(terms)), "the service terms are hidden from indexing");
  assert(!/<form/i.test(terms), "the service terms sit behind a form");
  assert(/cfg\.urls\.service_terms/.test(buyInclude), "the buy component does not link to the service terms");
});

/* ------------------------------------------------------------------ *
 * 11. The purchase-complete route is private
 * ------------------------------------------------------------------ */

check("Private routes", "/purchase-complete/ is noindex and out of the sitemap", () => {
  const fm = frontMatter(completePage);
  assert(/^noindex:\s*true\s*$/m.test(fm), "purchase-complete.html has no noindex: true");
  assert(/^sitemap:\s*false\s*$/m.test(fm), "purchase-complete.html has no sitemap: false");
  assert(/page\.noindex/.test(read("_includes/head.html")), "head.html emits no robots meta tag for noindex pages");
});

check("Private routes", "robots.txt disallows the private routes", () => {
  assert(exists("robots.txt"), "there is no robots.txt at the site root");
  const robots = read("robots.txt");
  for (const route of PRIVATE_ROUTES) {
    assert(
      new RegExp(`^Disallow:\\s*${route.replace(/\//g, "\\/")}`, "mi").test(robots),
      `robots.txt does not disallow ${route}`
    );
  }
});

check("Private routes", "The built private routes carry the robots tag and stay out of the sitemap", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  for (const route of PRIVATE_ROUTES) {
    const body = readSite(path.join(route.replace(/^\//, ""), "index.html"));
    assert(/name="robots"[^>]*noindex/.test(body), `the built ${route} has no noindex robots tag`);
  }
  const sitemap = readSite("sitemap.xml");
  for (const route of PRIVATE_ROUTES) {
    assert(!sitemap.includes(route), `${route} appears in sitemap.xml`);
  }
  return `${PRIVATE_ROUTES.length} private routes`;
});

/* ------------------------------------------------------------------ *
 * 12. The purchase-complete page tells the truth
 * ------------------------------------------------------------------ */

/** Page text with Liquid comments removed — build notes are not page copy. */
const completeCopy = completePage.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");

check("Purchase complete", "Never claims a verified payment", () => {
  const claims = [
    /payment (?:has been|was) taken/gi,
    /payment (?:has|had) gone through/gi,
    /payment (?:was|has been|is) (?:successful|confirmed|received|verified)/gi,
    /your payment is complete/gi,
  ];
  const offenders = [];
  for (const pattern of claims) {
    for (const match of completeCopy.matchAll(pattern)) {
      const before = completeCopy.slice(Math.max(0, match.index - 60), match.index);
      const after = completeCopy.slice(match.index + match[0].length, match.index + match[0].length + 30);
      const qualified =
        /\b(no|not|if|unless|whether|never|cannot|neither)\b/i.test(before) || /^\s*only\b/i.test(after);
      if (!qualified) offenders.push(`purchase-complete.html:${lineAt(completePage, completePage.indexOf(match[0]))} — "${match[0]}"`);
    }
  }
  assert(offenders.length === 0, `states a payment as fact:\n${offenders.join("\n")}`);
  const heading = (completeCopy.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || "";
  assert(heading.length > 0, "the page has no <h1>");
  assert(
    !/(successful|confirmed|received|receipt)/i.test(heading),
    `the heading claims more than the page can know: "${heading.trim()}"`
  );
});

check("Purchase complete", "Does not describe itself as a receipt", () => {
  assert(/not a receipt/i.test(completePage), "the page does not say it is not a receipt");
  assert(/not proof of payment/i.test(completePage), "the page does not say it is not proof of payment");
  const selfReceipt = completePage.match(/\b(this (?:page|is) (?:your |a )?receipt|here is your receipt|your receipt below)\b/i);
  assert(!selfReceipt, `the page calls itself a receipt: "${selfReceipt && selfReceipt[0]}"`);
  assert(
    !/receipt/i.test(frontMatterValue(completePage, "title") || ""),
    "the page title describes the page as a receipt"
  );
});

check("Purchase complete", "Explains that the project begins only after the intake is checked", () => {
  assert(
    /officially begins once your completed[\s\S]{0,200}questionnaire/i.test(completePage),
    "the page does not say the project begins once the questionnaire is complete"
  );
  assert(/materials have been received and checked/i.test(completePage), "the page does not say the materials are checked first");
  assert(/no project has been created automatically/i.test(completePage), "the page does not deny automatic project creation");
  assert(completePage.includes("/services/straightforward-website/questionnaire/"), "the page does not link to the questionnaire");
  assert(completePage.includes(SUPPORT_EMAIL), "the page gives no contact route if nothing arrives");
});

check("Purchase complete", "Carries no analytics call and reads no payment parameters", () => {
  const analytics = read("_includes/analytics.html").trim();
  const configured = analytics.length > 0 && !/^<!--[\s\S]*-->$/.test(analytics);
  assert(!configured, "an analytics system is now configured; this check needs revisiting");
  const surfaces = [
    [COMPLETE_PAGE, completePage],
    [PURCHASE_PAGE, purchasePage],
    [QUESTIONNAIRE, questionnaire],
    [BUY_INCLUDE, buyInclude],
    ["assets/js/straightforward-questionnaire.js", read("assets/js/straightforward-questionnaire.js")],
  ];
  for (const [rel, body] of surfaces) {
    assert(
      !/gtag\(|dataLayer|plausible\(|fathom|umami|posthog|analytics\.track/i.test(body),
      `${rel} fires an analytics event but no analytics system is configured`
    );
  }
  for (const [pattern, label] of [
    [/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/, "what looks like a card number"],
    [/ending in \d{4}|ends in \d{4}/i, "card digits"],
    [/\bcvc\b|\bcvv\b/i, "a security code"],
    [/pi_[A-Za-z0-9]{12}|cs_(live|test)_[A-Za-z0-9]/, "a Stripe object id"],
    [/session_id|payment_intent|checkout\.session/i, "a Stripe redirect parameter"],
    [/URLSearchParams|location\.search/, "a query-parameter read"],
  ]) {
    assert(!pattern.test(completePage), `purchase-complete.html contains ${label}`);
  }
  return `${surfaces.length} purchase surfaces`;
});

/* ------------------------------------------------------------------ *
 * 13. Questionnaire
 * ------------------------------------------------------------------ */

check("Questionnaire", "Exactly 15 required and 7 optional questions", () => {
  const required = (questionnaire.match(/class="req"/g) || []).length;
  const optional = (questionnaire.match(/class="opt"/g) || []).length;
  const expectedRequired = Number((intakeYml.match(/^required_questions:\s*(\d+)/m) || [])[1]);
  const expectedOptional = Number((intakeYml.match(/^optional_questions:\s*(\d+)/m) || [])[1]);
  assert(expectedRequired === 15, `_data/intake.yml says required_questions: ${expectedRequired}, expected 15`);
  assert(expectedOptional === 7, `_data/intake.yml says optional_questions: ${expectedOptional}, expected 7`);
  assert(required === 15, `${QUESTIONNAIRE} marks ${required} questions required, expected 15`);
  assert(optional === 7, `${QUESTIONNAIRE} marks ${optional} questions optional, expected 7`);
  const numbers = [...questionnaire.matchAll(/<(?:span|legend)>(\d{1,2})\. /g)].map((m) => Number(m[1]));
  for (let n = 1; n <= 15; n += 1) {
    assert(numbers.includes(n), `question ${n} is missing from the numbered sequence`);
  }
  assert(numbers.length === 15, `found ${numbers.length} numbered questions, expected 15`);
  return "15 required, 7 optional, numbered 1–15";
});

check("Questionnaire", "Every field is labelled and every fieldset has a legend", () => {
  const fields = [...questionnaire.matchAll(/<(input|select|textarea)\b([^>]*)>/g)];
  assert(fields.length >= 20, `only ${fields.length} form controls found`);
  const unlabelled = [];
  for (const match of fields) {
    const attrs = match[2];
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    if (id && new RegExp(`<label[^>]*for="${id}"`).test(questionnaire)) continue;
    // Otherwise it must sit inside a <label> element.
    const before = questionnaire.slice(0, match.index);
    const lastOpen = before.lastIndexOf("<label");
    const lastClose = before.lastIndexOf("</label>");
    if (lastOpen > lastClose) continue;
    const name = (attrs.match(/name="([^"]+)"/) || [])[1] || match[1];
    unlabelled.push(`${QUESTIONNAIRE}:${lineAt(questionnaire, match.index)} — ${name}`);
  }
  assert(unlabelled.length === 0, `fields with no label:\n${unlabelled.join("\n")}`);

  const fieldsets = [...questionnaire.matchAll(/<fieldset[^>]*>([\s\S]*?)<\/fieldset>/g)];
  assert(fieldsets.length >= 5, `only ${fieldsets.length} fieldsets found`);
  for (const set of fieldsets) {
    assert(/<legend[^>]*>/.test(set[1]), `a fieldset at line ${lineAt(questionnaire, set.index)} has no legend`);
  }
  return `${fields.length} controls, ${fieldsets.length} fieldsets`;
});

check("Questionnaire", "Errors are announced, and checkboxes are read by checked state", () => {
  assert(/data-questionnaire-errors[^>]*role="alert"/.test(questionnaire), "the error container has no role=\"alert\"");
  const js = read("assets/js/straightforward-questionnaire.js");
  assert(/type === "checkbox"/.test(js), "the questionnaire script does not distinguish checkboxes");
  assert(/checkbox"\s*\?\s*field\.checked/.test(js) || /field\.checked \? /.test(js), "checkbox answers are not read from .checked");
  assert(/f\.type === "checkbox" \? !f\.checked/.test(js), "checkbox validation does not use .checked");
  // Isolate the branch each checkbox test takes, and require it to use .checked.
  const branches = [
    ...js.matchAll(/type === "checkbox"\)\s*return\s+([^;]+);/g),
    ...js.matchAll(/type === "checkbox"\s*\?\s*([^:]+):/g),
  ];
  assert(branches.length >= 2, `only ${branches.length} checkbox branches found in the questionnaire script`);
  for (const branch of branches) {
    const expression = branch[1].trim();
    assert(
      /\.checked\b/.test(expression) && !/\.value\b/.test(expression),
      `a checkbox is read by .value rather than .checked: "${expression}" (assets/js/straightforward-questionnaire.js:${lineAt(js, branch.index)})`
    );
  }
});

check("Questionnaire", "Nothing is submitted to a server", () => {
  assert(/data-questionnaire\b/.test(questionnaire), "the questionnaire form has no data-questionnaire hook");
  assert(!/<form[^>]*\baction=/i.test(questionnaire), "the questionnaire form posts to a server");
  assert(/Nothing you type here is sent to or stored by this website/i.test(questionnaire), "the page does not say nothing is stored");
});

check("Questionnaire", "Shows a draft notice while the intake is unapproved", () => {
  assert(/^questionnaire_approved:\s*false\s*$/m.test(intakeYml), "_data/intake.yml no longer marks the questionnaire as a draft");
  assert(
    /\{%-?\s*unless site\.data\.intake\.questionnaire_approved/.test(questionnaire),
    "the draft notice is not guarded by site.data.intake.questionnaire_approved"
  );
  assert(/Draft questionnaire/i.test(questionnaire), "the draft notice text is missing");
});

/* ------------------------------------------------------------------ *
 * 14. No therapy-client data is requested
 * ------------------------------------------------------------------ */

check("Client data", "No form asks for anything about the visitor's own clients", () => {
  const formPages = publishedSources.filter((rel) => /<form\b/i.test(publishedBodies.get(rel)));
  assert(formPages.length >= 2, `only ${formPages.length} pages with forms found`);
  const banned = /(client name|clients? names?|case notes?|session notes?|case material|diagnosis|diagnoses|referral details|health (?:data|information)|patient)/i;
  const offenders = [];
  for (const rel of formPages) {
    const body = publishedBodies.get(rel);
    for (const match of body.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
      const name = (match[2].match(/name="([^"]+)"/) || [])[1] || "";
      if (banned.test(name)) offenders.push(`${rel}:${lineAt(body, match.index)} — field name "${name}"`);
    }
    for (const match of body.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/g)) {
      const text = match[1].replace(/<[^>]+>/g, " ");
      const hit = text.match(banned);
      if (!hit) continue;
      const before = text.slice(Math.max(0, hit.index - 90), hit.index);
      if (/\b(no|not|nothing|without|never)\b/i.test(before)) continue;
      offenders.push(`${rel}:${lineAt(body, match.index)} — label asks for "${hit[0]}"`);
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return `${formPages.length} pages with forms`;
});

check("Client data", "The questionnaire and the privacy notice both say not to send it", () => {
  assert(
    /do not include anything about your own clients/i.test(questionnaire),
    "the questionnaire does not tell people to leave client information out"
  );
  assert(
    /client names, session notes/i.test(questionnaire),
    "the questionnaire does not name what must not be sent"
  );
  const privacy = read("_pages/privacy.html");
  assert(
    /do not send client names, session notes/i.test(privacy),
    "the privacy notice does not tell people to leave client information out"
  );
});

/* ------------------------------------------------------------------ *
 * 15. Legal draft state
 * ------------------------------------------------------------------ */

check("Legal draft", "Legal wording is marked as not approved while approved is false", () => {
  assert(/^approved:\s*false\s*$/m.test(legalYml), "_data/legal.yml no longer marks the wording as unapproved");
  for (const rel of LEGAL_PAGES) {
    const body = read(rel);
    assert(/\{%\s*include legal-draft-notice\.html/.test(body), `${rel} does not include the draft notice`);
    assert(/\{%\s*include legal-version\.html/.test(body), `${rel} does not include the version block`);
  }
  return `${LEGAL_PAGES.length} legal pages`;
});

check("Legal draft", "The notice disappears when approval is set", () => {
  const notice = read("_includes/legal-draft-notice.html");
  assert(
    /\{%-?\s*unless site\.data\.legal\.approved\s*-?%\}/.test(notice),
    "the draft notice is not guarded by `unless site.data.legal.approved`"
  );
  assert(/\{%-?\s*endunless\s*-?%\}/.test(notice), "the draft notice guard is never closed");
  assert(/not.*been reviewed or approved by a solicitor/is.test(notice), "the notice does not say the wording is unreviewed");
  const version = read("_includes/legal-version.html");
  assert(/\{%-?\s*if site\.data\.legal\.approved\s*-?%\}/.test(version), "the version block does not branch on approval");
  assert(/Not legally approved/i.test(version), "the draft branch of the version block does not say it is not approved");
});

check("Legal draft", "No published page claims the wording is legally approved", () => {
  const pattern = /(legally approved|legally checked|solicitor[- ]approved|approved by (?:a|our) solicitor|professionally drafted)/gi;
  const offenders = [];
  let inspected = 0;
  for (const [rel, body] of publishedBodies) {
    inspected += 1;
    for (const match of body.matchAll(pattern)) {
      const context = body.slice(Math.max(0, match.index - 140), match.index + match[0].length);
      const denied = /\b(not|never|must not|no)\b/i.test(context) || /<strong>not<\/strong>/i.test(context);
      if (!denied) offenders.push(`${rel}:${lineAt(body, match.index)} — "${match[0]}"`);
    }
  }
  assert(inspected > 10, `only ${inspected} published files inspected`);
  assert(offenders.length === 0, `claims of legal approval:\n${offenders.join("\n")}`);
  return `${inspected} published files (internal notes excluded)`;
});

/* ------------------------------------------------------------------ *
 * 16. Internal notes stay out of the build
 * ------------------------------------------------------------------ */

const EXPECTED_ROOT_DOCS = [
  "README.md",
  "VISUAL-SYSTEM.md",
  "IMPLEMENTATION.md",
  "STRIPE_SETUP.md",
  "LEGAL_REVIEW.md",
  "OPEN_DECISIONS.md",
  "PHOTOGRAPHY-SHOT-LIST.md",
  "INSTALLATION.md",
];

check("Build hygiene", "Every root note is excluded from the published site", () => {
  const rootDocs = fs.readdirSync(ROOT).filter((name) => name.endsWith(".md"));
  assert(rootDocs.length > 0, "no root *.md files found — the scan is not seeing the repository");
  const leaked = [];
  for (const doc of rootDocs) {
    if (!excludedRootDocs.has(doc)) leaked.push(`${doc} is not listed under exclude: in _config.yml`);
    if (hasSite && fs.existsSync(path.join(SITE, doc))) leaked.push(`${doc} was copied into _site`);
  }
  assert(leaked.length === 0, leaked.join("\n"));
  return `${rootDocs.length} root notes, all excluded`;
});

check("Build hygiene", "The known internal notes are all accounted for", () => {
  const missing = EXPECTED_ROOT_DOCS.filter((doc) => !exists(doc));
  assert(
    missing.length === 0,
    `these notes are named by the project but are not in the repository: ${missing.join(", ")}`
  );
});

/* ------------------------------------------------------------------ *
 * 17. Accessibility, at source level
 * ------------------------------------------------------------------ */

check("Accessibility", "A skip link precedes the single main landmark", () => {
  assert(/class="skip-link"/.test(layout), "no skip link in the default layout");
  assert(layout.indexOf("skip-link") < layout.indexOf("<main"), "the skip link comes after the main landmark");
  assert(/href="#content"/.test(layout), "the skip link does not target #content");
  assert(/<main[^>]*id="content"/.test(layout), "the main landmark does not carry id=\"content\"");
  const mains = (layout.match(/<main\b/g) || []).length;
  assert(mains === 1, `the default layout declares ${mains} <main> elements, expected exactly 1`);
});

check("Accessibility", "No page body declares its own main landmark", () => {
  const pages = publishedSources.filter((rel) => !rel.startsWith("_layouts/") && !rel.startsWith("_includes/"));
  assert(pages.length > 10, `only ${pages.length} page bodies found`);
  const offenders = [];
  for (const rel of pages) {
    const body = publishedBodies.get(rel);
    const index = body.search(/<main\b/);
    if (index !== -1) offenders.push(`${rel}:${lineAt(body, index)}`);
  }
  assert(offenders.length === 0, `page bodies declaring <main>: ${offenders.join(", ")}`);
  return `${pages.length} page bodies`;
});

check("Accessibility", "Purchase actions are native controls with an explained disabled state", () => {
  assert(/<a\b[^>]*class="[^"]*buy-action/.test(buyInclude), "the live buy action is not an anchor");
  assert(/<button\b[\s\S]*?type="button"[\s\S]*?disabled/.test(buyInclude), "the unavailable state is not a disabled button");
  assert(!/onclick=/i.test(buyInclude), "the buy action relies on an inline click handler");
  assert(!/role="button"/.test(buyInclude), "the buy action fakes a button with a role attribute");
  assert(/aria-describedby="buy-terms-/.test(buyInclude), "the buy action has no accessible description");
  assert(/not open yet<\/button>/.test(buyInclude), "the disabled button label does not say it is not open yet");
  assert(/Online purchasing is opening shortly/.test(buyInclude), "the disabled state is not explained in text");
});

check("Accessibility", "Every image carries an alt attribute", () => {
  const offenders = [];
  let images = 0;
  for (const [rel, body] of publishedBodies) {
    for (const match of body.matchAll(/<img\b[^>]*>/g)) {
      images += 1;
      if (!/\balt\s*=/.test(match[0])) offenders.push(`${rel}:${lineAt(body, match.index)}`);
    }
  }
  assert(images > 0, "no <img> elements found in published source — the scan is not seeing the pages");
  assert(offenders.length === 0, `images with no alt attribute: ${offenders.join(", ")}`);
  return `${images} images`;
});

check("Accessibility", "No positive tabindex anywhere", () => {
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    for (const match of body.matchAll(/tabindex\s*=\s*"([^"]*)"/g)) {
      if (Number(match[1]) > 0) offenders.push(`${rel}:${lineAt(body, match.index)} — tabindex="${match[1]}"`);
    }
  }
  assert(offenders.length === 0, `positive tabindex values: ${offenders.join(", ")}`);
});

/* ------------------------------------------------------------------ *
 * 18. Front matter
 * ------------------------------------------------------------------ */

check("Front matter", "Valid YAML on every published page", () => {
  let inspected = 0;
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    const fm = frontMatter(body);
    if (!fm) continue;
    inspected += 1;
    fm.split(/\r?\n/).forEach((line, i) => {
      const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
      if (!kv) return;
      const value = kv[2].trim();
      if (!value || /^["'[{|>]/.test(value)) return;
      if (/:\s/.test(value)) {
        offenders.push(`${rel}:${i + 2} — key "${kv[1]}" has an unquoted value containing ": "`);
      }
      if (/^["'].*[^"']$|^[^"'].*["']$/.test(value) && /^["']|["']$/.test(value)) {
        offenders.push(`${rel}:${i + 2} — key "${kv[1]}" has an unbalanced quote`);
      }
    });
  }
  assert(inspected > 10, `only ${inspected} pages with front matter found`);
  assert(offenders.length === 0, offenders.join("\n"));
  return `${inspected} pages`;
});

check("Front matter", "Every published page has a unique, non-empty title and description", () => {
  const pages = publishedSources.filter(
    (rel) => !rel.startsWith("_layouts/") && !rel.startsWith("_includes/") && frontMatter(publishedBodies.get(rel))
  );
  assert(pages.length > 10, `only ${pages.length} pages found`);
  const titles = new Map();
  const descriptions = new Map();
  const offenders = [];
  for (const rel of pages) {
    const body = publishedBodies.get(rel);
    const title = frontMatterValue(body, "title");
    const description = frontMatterValue(body, "description");
    if (!title) offenders.push(`${rel} has no title`);
    if (!description) offenders.push(`${rel} has no description`);
    if (title) {
      if (titles.has(title)) offenders.push(`${rel} repeats the title of ${titles.get(title)}: "${title}"`);
      else titles.set(title, rel);
    }
    if (description) {
      if (descriptions.has(description)) {
        offenders.push(`${rel} repeats the description of ${descriptions.get(description)}`);
      } else descriptions.set(description, rel);
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return `${pages.length} pages`;
});

/* ------------------------------------------------------------------ *
 * 19. Internal links
 * ------------------------------------------------------------------ */

/** Every route the built site is expected to serve. */
const KNOWN_ROUTES = (() => {
  const routes = new Set(ROUTES.map(([, permalink]) => permalink));
  for (const rel of publishedSources) {
    const permalink = frontMatterValue(publishedBodies.get(rel), "permalink");
    if (permalink) routes.add(permalink);
  }
  for (const rel of publishedSources) {
    if (!rel.startsWith("_posts/")) continue;
    const slug = path.basename(rel).replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.(md|markdown|html)$/, "");
    routes.add(`/${slug}/`);
  }
  routes.add("/search.json");
  routes.add("/site.webmanifest");
  routes.add("/sitemap.xml");
  for (const line of read("_redirects").split("\n")) {
    const from = line.trim().split(/\s+/)[0];
    if (from && from.startsWith("/")) routes.add(from.endsWith("/") ? from : `${from}/`);
  }
  return routes;
})();

/** Source file that serves a route, when there is one. */
const ROUTE_SOURCE = (() => {
  const map = new Map();
  for (const rel of publishedSources) {
    const permalink = frontMatterValue(publishedBodies.get(rel), "permalink");
    if (permalink) map.set(permalink, rel);
  }
  return map;
})();

/** href values in published source, resolving the relative_url filter. */
function internalLinks() {
  const links = [];
  const patterns = [
    /href="\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}([^"]*)"/g,
    /href="(\/[^"{}]*)"/g,
    /href="(#[^"]+)"/g,
    /\]\((\/[^)\s]*)\)/g,
  ];
  for (const [rel, body] of publishedBodies) {
    for (const pattern of patterns) {
      for (const match of body.matchAll(pattern)) {
        const target = (match[1] || "") + (match[2] || "");
        links.push({ file: rel, line: lineAt(body, match.index), target });
      }
    }
  }
  return links;
}

const LINKS = internalLinks();

check("Links", "Every internal route link resolves to a known route", () => {
  assert(LINKS.length > 40, `only ${LINKS.length} internal links found — the crawl is not seeing the pages`);
  const offenders = [];
  let checked = 0;
  for (const link of LINKS) {
    const pathOnly = link.target.split("#")[0].split("?")[0];
    if (!pathOnly || pathOnly.startsWith("/assets/")) continue;
    checked += 1;
    if (KNOWN_ROUTES.has(pathOnly)) continue;
    if (KNOWN_ROUTES.has(pathOnly.endsWith("/") ? pathOnly : `${pathOnly}/`)) continue;
    offenders.push(`${link.file}:${link.line} → ${link.target}`);
  }
  assert(checked > 20, `only ${checked} route links inspected`);
  assert(offenders.length === 0, `links to unknown routes:\n${offenders.join("\n")}`);
  return `${checked} route links across ${KNOWN_ROUTES.size} known routes`;
});

check("Links", "Every anchor points at an id that exists", () => {
  const shared = layout + read("_includes/header.html") + read("_includes/footer.html");
  const offenders = [];
  let checked = 0;
  for (const link of LINKS) {
    const [pathOnly, fragment] = link.target.split("#");
    if (!fragment) continue;
    checked += 1;
    const targetFile = pathOnly ? ROUTE_SOURCE.get(pathOnly.endsWith("/") ? pathOnly : `${pathOnly}/`) : link.file;
    const haystack =
      (targetFile ? publishedBodies.get(targetFile) || "" : publishedBodies.get(link.file) || "") + shared;
    if (new RegExp(`id="${fragment}"`).test(haystack)) continue;
    offenders.push(`${link.file}:${link.line} → #${fragment}${pathOnly ? ` on ${pathOnly}` : ""}`);
  }
  assert(checked > 0, "no in-page anchors found — the anchor check is vacuous");
  assert(offenders.length === 0, `anchors with no matching id:\n${offenders.join("\n")}`);
  return `${checked} anchors`;
});

check("Links", "Every referenced asset exists on disk", () => {
  const referenced = new Set();
  const patterns = [
    /\{\{\s*'(\/assets\/[^']+)'\s*\|\s*(?:relative_url|absolute_url)\s*\}\}/g,
    /(?:src|href)="(\/assets\/[^"{}]+)"/g,
  ];
  for (const [, body] of publishedBodies) {
    for (const pattern of patterns) {
      for (const match of body.matchAll(pattern)) referenced.add(match[1].split("?")[0]);
    }
  }
  assert(referenced.size > 5, `only ${referenced.size} asset references found — the scan is not seeing the pages`);
  // Binary assets (images, fonts, documents) are tracked separately from the
  // source in some working copies, and are absent from a source-only export.
  // An empty assets/images directory means "not in this checkout", not
  // "missing from the site" — skip rather than report a false defect.
  const imageDir = path.join(ROOT, "assets", "images");
  const imagesPresent =
    fs.existsSync(imageDir) && walk(imageDir, () => true).length > 0;
  if (!imagesPresent) {
    skip("assets/images is empty in this working copy — binary assets are not part of this export, so their paths cannot be verified here");
  }
  const missing = [...referenced].filter((asset) => !exists(asset.replace(/^\//, ""))).sort();
  assert(
    missing.length === 0,
    `${missing.length} referenced assets are missing from the repository:\n${missing.join("\n")}`
  );
  return `${referenced.size} assets`;
});

/* ------------------------------------------------------------------ *
 * 20. Built output
 * ------------------------------------------------------------------ */

check("Built site", "Every expected route was produced", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const missing = [];
  for (const [, permalink] of ROUTES) {
    const file = permalink.endsWith(".html")
      ? path.join(SITE, permalink.replace(/^\//, ""))
      : path.join(SITE, permalink.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(file)) missing.push(permalink);
  }
  assert(missing.length === 0, `routes not built: ${missing.join(", ")}`);
  return `${ROUTES.length} routes`;
});

check("Built site", "The sitemap lists the public routes and none of the private ones", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const sitemap = readSite("sitemap.xml");
  const missing = [];
  for (const [, permalink] of ROUTES) {
    if (PRIVATE_ROUTES.includes(permalink) || permalink === "/404.html") continue;
    if (!sitemap.includes(permalink)) missing.push(permalink);
  }
  assert(missing.length === 0, `routes absent from sitemap.xml: ${missing.join(", ")}`);
  for (const route of PRIVATE_ROUTES) assert(!sitemap.includes(route), `${route} appears in sitemap.xml`);
});

check("Built site", "The purchase page loads its stylesheet", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const body = readSite("services/straightforward-website/index.html");
  assert(/purchase\.min\.css/.test(body), "the built purchase page loads no base stylesheet");
  assert(/catalogue-refresh\.css/.test(body), "the built purchase page does not load catalogue-refresh.css");
});

check("Built site", "No Liquid survived into the built pages", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const pages = walk(SITE, (f) => f.endsWith(".html"));
  assert(pages.length > 0, "_site contains no HTML pages");
  const offenders = [];
  for (const page of pages) {
    const body = fs.readFileSync(page, "utf8");
    if (/\{\{|\{%/.test(body)) offenders.push(path.relative(SITE, page));
  }
  assert(offenders.length === 0, `unrendered Liquid in: ${offenders.join(", ")}`);
  return `${pages.length} built pages`;
});

/* ------------------------------------------------------------------ *
 * 21. Placeholders and contradictions
 * ------------------------------------------------------------------ */

check("Content", "No placeholder or retired offer name in published source", () => {
  const banned = [
    [/\blorem\b/gi, "lorem"],
    [/\bTODO\b/g, "TODO"],
    [/\bFIXME\b/g, "FIXME"],
    [/\bcoming soon\b/gi, "coming soon"],
    [/\bunlimited revisions\b/gi, "unlimited revisions"],
    [/\bWebsite Launch\b/g, "Website Launch"],
    [/\bWebsite \+ Identity\b/g, "Website + Identity"],
    [/\bTemplate Website\b/g, "Template Website"],
    [/\bSemi-Custom\b/gi, "Semi-Custom"],
  ];
  const offenders = [];
  let inspected = 0;
  for (const [rel, body] of publishedBodies) {
    inspected += 1;
    for (const [pattern, label] of banned) {
      for (const match of body.matchAll(pattern)) {
        offenders.push(`${rel}:${lineAt(body, match.index)} — ${label}`);
      }
    }
  }
  assert(inspected > 10, `only ${inspected} published files inspected`);
  assert(offenders.length === 0, offenders.join("\n"));
  return `${inspected} published files`;
});

check("Content", "Square-bracket placeholders appear only in the legal pages", () => {
  const pattern = /\[[A-Z][^\]\n]{3,120}\]/g;
  const offenders = [];
  let legalPlaceholders = 0;
  for (const [rel, body] of publishedBodies) {
    const isLegal = LEGAL_SURFACE.has(rel);
    const withoutFrontMatter = body.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
    for (const match of withoutFrontMatter.matchAll(pattern)) {
      if (/\]\(/.test(withoutFrontMatter.slice(match.index + match[0].length, match.index + match[0].length + 2))) continue;
      if (isLegal) {
        legalPlaceholders += 1;
        continue;
      }
      offenders.push(`${rel}:${lineAt(body, body.indexOf(match[0]))} — ${match[0].slice(0, 60)}`);
    }
  }
  assert(offenders.length === 0, `placeholders outside the legal pages:\n${offenders.join("\n")}`);
  assert(legalPlaceholders > 0, "no placeholders found in the legal pages — the draft state looks wrong");
  return `note: ${legalPlaceholders} deliberate placeholders remain in the legal pages`;
});

/* ------------------------------------------------------------------ *
 * 22. Personal data
 * ------------------------------------------------------------------ */

check("Personal data", "No email address other than the studio address", () => {
  const offenders = [];
  let found = 0;
  for (const [rel, body] of publishedBodies) {
    for (const match of body.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      found += 1;
      if (match[0].toLowerCase() === SUPPORT_EMAIL) continue;
      offenders.push(`${rel}:${lineAt(body, match.index)} — ${match[0]}`);
    }
  }
  assert(found > 0, "no email addresses found at all — the scan is not seeing the pages");
  assert(offenders.length === 0, `stray addresses:\n${offenders.join("\n")}`);
  return `${found} addresses, all ${SUPPORT_EMAIL}`;
});

/**
 * Numbers that are deliberately published because they belong to a public
 * authority the legal pages have to name.
 */
const PUBLISHED_PHONE_NUMBERS = new Map([["0303 123 1113", "the ICO helpline, named in the privacy notice"]]);

check("Personal data", "No UK telephone number in published source", () => {
  const patterns = [
    /\+44\s?\(?0?\)?[\s-]?\d[\d\s-]{8,12}\d/g,
    /\b0(?:1\d{2,4}|2\d|3\d{2}|7\d{3})[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
  ];
  const offenders = [];
  const expected = [];
  for (const [rel, body] of publishedBodies) {
    const text = body.replace(/<[^>]+>/g, " ").replace(/\{\{[\s\S]*?\}\}/g, " ");
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) {
        const number = match[0].trim();
        if (PUBLISHED_PHONE_NUMBERS.has(number)) {
          expected.push(`${rel} — ${number} (${PUBLISHED_PHONE_NUMBERS.get(number)})`);
          continue;
        }
        offenders.push(`${rel} — ${number}`);
      }
    }
  }
  assert(offenders.length === 0, `telephone-shaped strings:\n${offenders.join("\n")}`);
  return expected.length ? `note: ${expected.join("; ")}` : "none found";
});

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

const width = Math.max(...results.map((r) => r.name.length)) + 2;
let currentGroup = "";
for (const r of results) {
  if (r.group !== currentGroup) {
    currentGroup = r.group;
    process.stdout.write(`\n${currentGroup}\n`);
  }
  const mark = r.status === "pass" ? "  ✓" : r.status === "skip" ? "  –" : "  ✗";
  process.stdout.write(`${mark} ${r.name.padEnd(width)}${r.note ? "  " + r.note.replace(/\n/g, "\n      ") : ""}\n`);
}

const passed = results.filter((r) => r.status === "pass").length;
process.stdout.write(`\n${passed} passed, ${failures} failed, ${skipped} skipped\n`);
if (!hasSite) {
  process.stdout.write("Note: _site was not found. Run `npm run build` for the full route and link checks.\n");
}
process.exit(failures > 0 ? 1 : 0);

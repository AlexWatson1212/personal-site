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
  /* Internal documentation and operational templates. Excluded from the build
     by _config.yml, so they are not published files and must not be scanned as
     though they were. The Direction Note template is deliberately full of
     [bracketed] fields; that is what a template is. Leakage is still caught:
     "Every root note is excluded from the published site" and the built-site
     checks below fail if anything here reaches _site. */
  "docs/",
  "_legacy/",
  "_preview/",
  "_responsive-pass/",
  "_shots/",
  "_site/",
  "_strategy/",
  "_to_delete/",
  "_transfer/",
  "node_modules/",
  "vendor/",
  ".git/",
  "scripts/preview/",
  "scripts/qa-browser/",
  "scripts/responsive-qa/",
];

/* Internal notes. They are excluded from the build by _config.yml, they
   record decisions the site has since moved past, and they are allowed to
   name retired prices in the course of explaining why those prices went. */
const INTERNAL_NOTES = new Set([
  "README.md", "INSTALLATION.md", "IMPLEMENTATION.md", "VISUAL-SYSTEM.md",
  "STRIPE_SETUP.md", "LEGAL_REVIEW.md", "OPEN_DECISIONS.md", "REBUILD-REPORT.md",
  "REDESIGN-REPORT.md", "PHOTOGRAPHY-SHOT-LIST.md", "REFINEMENT-CHANGELOG.md",
  "OFFER-RESOLUTION-CHANGELOG.md", "LEGAL-INFORMATION-REQUIRED.md",
  "PRE-LAUNCH-CHANGELOG.md",
  "APPLY-two-routes.txt", "APPLY-refinement.txt",
  /* August 2026. Strategy and review notes. They name retired figures in order
     to record that those figures are retired, which is the opposite of drift —
     and they are excluded from the build in _config.yml, so nothing here is
     published. The check "Every root note is excluded from the published site"
     is what keeps that true. */
  "TRUST-ARCHITECTURE-REVIEW.md", "MINIMAL-LAUNCH-V2.md",
  "LEGAL-REVIEW-PACK.md", "DIRECTION-NOTE-TEMPLATE.md",
  "CONCEPT-PUBLICATION-ASSESSMENT.md", "POST-LAUNCH.md",
]);

function isExcludedPath(rel) {
  const posix = rel.split(path.sep).join("/");
  if (EXCLUDED_PREFIXES.some((p) => posix.startsWith(p))) return true;
  if (/^assets\/css\/.*\.min\.css$/.test(posix)) return true;
  /* Generated at build time from environment variables, never committed. */
  if (posix === "_data/purchasing_resolved.yml") return true;
  return false;
}

/**
 * Every file git knows about, minus the excluded trees.
 *
 * Untracked-but-not-ignored files count too. A page written but not yet
 * `git add`ed is still a page, and a route table that cannot see it reports
 * every link into that page as broken — which is a fact about the index, not
 * about the site.
 */
const trackedFiles = (() => {
  const gitList = (args) => {
    try {
      return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).split("\0").filter(Boolean);
    } catch {
      return null;
    }
  };
  const tracked = gitList(["ls-files", "-z"]);
  let listing;
  if (tracked) {
    const untracked = gitList(["ls-files", "-z", "--others", "--exclude-standard"]) || [];
    listing = [...new Set([...tracked, ...untracked])];
  } else {
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
  "_pages/service-terms-practice-website.html",
  "_pages/cancellation-and-refunds.html",
];
const LEGAL_SURFACE = new Set([...LEGAL_PAGES, "_includes/legal-draft-notice.html", "_pages/accessibility.html"]);

/** The expected route table: source file → permalink. */
const ROUTES = [
  ["index.html", "/"],
  ["service.html", "/service/"],
  ["services/practice-website.html", "/services/practice-website/"],
  ["services/practice-website-questionnaire.html", "/services/practice-website/questionnaire/"],
  ["work.html", "/work/"],
  ["about.html", "/about/"],
  ["contact.html", "/contact/"],
  ["guidance.html", "/guidance/"],
  ["practice-clarity.html", "/practice-clarity/"],
  ["links/index.html", "/links/"],
  ["404.html", "/404.html"],
  ["_pages/privacy.html", "/privacy/"],
  ["_pages/terms.html", "/terms/"],
  ["_pages/service-terms-practice-website.html", "/service-terms/practice-website/"],
  ["_pages/cancellation-and-refunds.html", "/cancellation-and-refunds/"],
  ["_pages/accessibility.html", "/accessibility/"],
];

/** Routes that must never be indexed or listed. */
const PRIVATE_ROUTES = ["/services/practice-website/questionnaire/"];

const BUY_INCLUDE = "_includes/practice-website-buy.html";
const PURCHASE_PAGE = "services/practice-website.html";
const QUESTIONNAIRE = "services/practice-website-questionnaire.html";
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

/* The whole commercial architecture, as five figures. September 2026: the
   studio opened its first three places to real practices at a founding price,
   so the figure a visitor is quoted today is £495 and the standard price is
   published beside it as what the work returns to.
     £495    the Practice Identity & Website as sold today — the founding price, for the
             first three practices. The same service and the same scope as the
             standard price; only the figure differs.
     £100    the first instalment of the £495. Not half: the founding split is
             deliberately weighted to the end, because £495 is already a real
             risk for a therapist buying from a studio with no client case
             studies yet. The deposit establishes commitment; it is not income.
     £395    the balance instalment, due when the website has been through the
             agreed process including both revision rounds and is approved for
             launch — an objective milestone defined in clause 11, never a
             satisfaction condition
     £995    the standard price, after the three founding practices. Published
             so a reader can see what they are being offered against, never
             struck through and never used to dress £495 as a saving.
     £29     Website Care per month, after the included first year, optional
   £500 LEFT THE PUBLISHED SITE with the standard instalment split. Publishing
   that split alongside a £495 total would put two different meanings on one
   number, which is exactly the sort of detail that costs a reader their
   confidence. The standard split returns to the site when £995 does.
   £1,495 was retired in August 2026 along with the tier it implied. Any other
   amount in published source is a mistake until this list says otherwise. */
const APPROVED_PRICES = new Set(["£495", "£100", "£395", "£995", "£29"]);
/* Figures that are not studio prices. £60 is a session fee drawn inside the
   tailoring illustration on the home page, where the point being made is that
   this practice's visitors need the cost before anything else. Held separately
   so the studio's own price list stays exact and a stray offer price cannot
   hide among them. */
const CITED_AMOUNTS = new Set(["£60"]);
/* £495 is NOT in this list. It was the retired Straightforward Website price,
   re-entered service in August 2026 as the balance instalment, and since
   September 2026 is the founding price of the whole service — so the suite
   cannot guard the old offer by that number. What it guards instead is that
   £495 always arrives with the words that say which of those it is: see
   "The founding price is stated as a founding price wherever it appears". */
const RETIRED_PRICES = ["795", "1,495", "1,995", "2,195", "2,000", "290"].map((n) => "£" + n);

const purchasingYml = read("_data/purchasing.yml");
const legalYml = read("_data/legal.yml");
const intakeYml = read("_data/intake.yml");
const buyInclude = read(BUY_INCLUDE);
/* The include with its leading documentation comment stripped. Checks that ask
   what the component RENDERS must read this; checks that ask how it is wired
   may read the whole file. */
const buyMarkup = buyInclude.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
const purchasePage = read(PURCHASE_PAGE);
const questionnaire = read(QUESTIONNAIRE);
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
      if (APPROVED_PRICES.has(amount) || CITED_AMOUNTS.has(amount)) continue;
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
    /* This file names the retired figures in order to forbid them. */
    if (rel === "scripts/qa.mjs" || INTERNAL_NOTES.has(rel)) continue;
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
  /* September 2026. price_display means "what a client pays if they say yes
     today", so while the founding offer is open it is £495 and the standard
     price lives in founding.standard_price_display. Closing the offer means
     setting founding.active: false and moving £995 back into price_display —
     the check below enforces exactly those two states and nothing between. */
  const foundingActive = /^\s*active:\s*true\s*$/m.test(
    (purchasingYml.match(/^founding:\n(?:[ \t].*\n|\n)*/m) || [""])[0]
  );
  if (foundingActive) {
    assert(/^price_display:\s*"£495"\s*$/m.test(purchasingYml), "the founding offer is open but price_display is not £495");
    assert(/^deposit_display:\s*"£100"\s*$/m.test(purchasingYml), "the founding offer is open but deposit_display is not £100");
    assert(/^balance_display:\s*"£395"\s*$/m.test(purchasingYml), "the founding offer is open but balance_display is not £395");
    /* 100 + 395 = 495. The split is unusual enough that a future edit could
       plausibly leave one of the three figures behind. */
    assert(
      /^deposit_numeric:\s*"100\.00"\s*$/m.test(purchasingYml) &&
        /^balance_numeric:\s*"395\.00"\s*$/m.test(purchasingYml) &&
        /^price_numeric:\s*"495\.00"\s*$/m.test(purchasingYml),
      "the founding instalments do not add up to the founding price"
    );
    assert(/standard_price_display:\s*"£995"/.test(purchasingYml), "founding.standard_price_display is not £995");
    assert(/^\s*places:\s*3\s*$/m.test(purchasingYml), "founding.places is not 3");
  } else {
    assert(/^price_display:\s*"£995"\s*$/m.test(purchasingYml), "the founding offer is closed but price_display is not £995");
  }
  /* September 2026. Practice Clarity is inside the £995 and has no price of its
     own. The field was deleted rather than emptied so that a template asking
     for it fails loudly; re-declaring it is how the add-on grows back. */
  assert(
    !/^\s*clarity_display:/m.test(purchasingYml),
    "clarity_display is declared again — Practice Clarity is included in the £995 and must not carry a price"
  );
  assert(
    !/clarity_combined_display/.test(purchasingYml),
    "clarity_combined_display is still declared — the combined figure was retired with the tier it implied"
  );
  assert(!/bespoke_price_display/.test(purchasingYml), "bespoke_price_display is still declared — the bespoke route was retired");
  assert(!/guided_price_display/.test(purchasingYml), "guided_price_display is still declared — the Guided tier was retired");
  assert(/included_months:\s*12/.test(purchasingYml), "Website Care is not declared as twelve included months");
  assert(/monthly:\s*"£29"/.test(purchasingYml), "Website Care monthly price is not £29");
  assert(!/annual:/.test(purchasingYml), "Website Care still declares an annual price — Care is monthly after the included year");
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
  /* Until September 2026 this ended by asserting the include still read the
     resolved Payment Link, so that the sweep above could not pass vacuously.
     The include no longer reads one, because there is no checkout: the
     vacuity guard is now that the buy component exists and renders the
     written route. */
  assert(/How a project begins/.test(buyMarkup), `${BUY_INCLUDE} no longer renders the written route`);
});

check("Checkout scope", "The buy component is included only on the purchase page", () => {
  const including = [];
  for (const [rel, body] of publishedBodies) {
    if (rel === BUY_INCLUDE) continue; // its own usage comment is not a placement
    if (/\{%-?\s*include\s+practice-website-buy\.html/.test(body)) including.push(rel);
  }
  assert(including.length > 0, "nothing includes the buy component — the purchase journey has no buy action");
  assert(
    including.length === 1 && including[0] === PURCHASE_PAGE,
    `the buy component is included by: ${including.join(", ")} — only ${PURCHASE_PAGE} may include it`
  );
  const count = (purchasePage.match(/include practice-website-buy\.html/g) || []).length;
  assert(count >= 1, `${PURCHASE_PAGE} does not include the buy component`);
  return `${count} placements on ${PURCHASE_PAGE}`;
});

check("Checkout scope", "The buy component carries the stated calls to action", () => {
  /* August 2026. The purchase route is written rather than self-service, and
     the payment is taken in two instalments. Two things follow.

     September 2026: there is one state and one action. The component offers the
     written route as a real link, takes its figures from _data/purchasing.yml,
     and renders the canonical payment sentence. There is no paid action to
     mislabel and no disabled control to apologise with. */
  assert(/deposit_display/.test(buyInclude), `${BUY_INCLUDE} does not take the instalment from _data/purchasing.yml`);
  assert(/price_display/.test(buyInclude), `${BUY_INCLUDE} does not take its price from _data/purchasing.yml`);
  assert(/payment_sentence/.test(buyInclude), `${BUY_INCLUDE} does not render the canonical payment sentence`);

  const written = (buyInclude.match(/>Tell me which design you like</g) || []).length;
  assert(written >= 1, `${BUY_INCLUDE} must offer the written route (found ${written})`);
  /* Judge the markup, not the documentation comment above it — that comment
     explains why there is no disabled control, and naming the thing it forbids
     is not the same as rendering it. */
  assert(
    !/\bdisabled\b|is-unavailable|not open yet|opening shortly/i.test(buyMarkup),
    `${BUY_INCLUDE} renders a disabled or "not open yet" control; the written route is the route, not a fallback`
  );
});

/** The route blocks, on the services page and the home page. */
/* The commercial pages, as (path, body) pairs. The commercial architecture is
   now one product with one add-on rather than two competing routes, so these
   checks read whole pages instead of counting route cards. */
function commercialPages() {
  return [
    { file: "service.html", body: servicePage },
    { file: "index.html", body: homePage },
    { file: PURCHASE_PAGE, body: purchasePage },
  ];
}

check("Checkout scope", "Practice Clarity carries no purchase action", () => {
  /* Practice Clarity is an add-on agreed in writing and invoiced separately.
     Nothing that describes it may offer an online payment. */
  let inspected = 0;
  for (const { file, body } of commercialPages()) {
    const index = body.indexOf("Practice Clarity");
    if (index === -1) continue;
    inspected += 1;
    const block = body.slice(Math.max(0, index - 200), index + 1600);
    assert(!/practice-website-buy\.html/.test(block), `${file} · a Practice Clarity block includes the buy component`);
    assert(!/Pay\s+(£995|\{\{)/.test(block), `${file} · a Practice Clarity block shows a pay action`);
    assert(!/buy\.stripe\.com/.test(block), `${file} · a Practice Clarity block links to Stripe`);
  }
  assert(inspected >= 2, `only ${inspected} Practice Clarity blocks inspected`);
  return `${inspected} pages inspected`;
});

/* ------------------------------------------------------------------ *
 * 4. The commercial architecture
 * ------------------------------------------------------------------ */

check("Commercial architecture", "One product, one care plan, and nothing sold beside them", () => {
  /* service.html is the page that has to make the commercial decision easy.
     Every figure a buyer needs must be on it, and none of the retired offer
     structure may survive anywhere. */
  /* Every figure is rendered from _data/purchasing.yml, so what this asserts is
     that the fields are on the page rather than that the numerals are. */
  assert(/purchasing\.price_display/.test(servicePage), "service.html does not render the price");
  assert(/purchasing\.payment_sentence/.test(servicePage), "service.html does not render the payment sentence");
  assert(/£29/.test(servicePage), "service.html does not show the £29 Website Care price");
  assert(/[Cc]ustom project/.test(servicePage), "service.html does not offer a custom project route");
  assert(
    /founding\.standard_price_display/.test(servicePage),
    "service.html does not publish the standard price the founding price is measured against"
  );
  return "price + instalments rendered from data · £29 care · standard price published · custom quoted";
});

check("Commercial architecture", "One website price, and Practice Clarity is not sold", () => {
  /* August 2026 retired the £1,495 tier. September 2026 went further: Practice
     Clarity is no longer an optional purchase at all, because asking a client to
     decide how much strategic work their own website needs asks them to make the
     one judgement they are paying for. The work is inside the £995. These
     assertions are what stops the add-on growing back. */
  const offenders = [];

  /* Nothing may price Practice Clarity, or present it as an optional purchase. */
  for (const [rel, body] of publishedBodies) {
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    if (/\+\s*£\s?500/.test(body)) offenders.push(`${rel} — prices Practice Clarity as an add-on`);
    if (/clarity_display/.test(body)) offenders.push(`${rel} — renders the retired clarity price field`);
    const m = body.match(/[^.]{0,90}Practice Clarity[^.]{0,90}/g) || [];
    for (const sentence of m) {
      if (/\boptional\b|\badd-?on\b|\bupsell\b|invoiced separately/i.test(sentence)) {
        offenders.push(`${rel} — still presents Practice Clarity as optional or separately sold: "${sentence.trim().slice(0, 90)}"`);
      }
    }
  }

  /* No page may add the two into one figure again. */
  for (const [rel, body] of publishedBodies) {
    if (/£\s?1,?495/.test(body)) offenders.push(`${rel} — shows a combined website + Practice Clarity figure`);
  }

  /* The service hero is the first screen of the buying decision. The total and
     its two instalments belong in it; a fourth figure does not. Before August
     2026 this asserted exactly one price, when the payment terms were a phrase
     rather than two numbers. */
  const heroStart = servicePage.indexOf("<section");
  const heroEnd = servicePage.indexOf("</section>");
  assert(heroStart > -1 && heroEnd > heroStart, "service.html has no opening section to inspect");
  /* From the first tag, not from byte zero: the front matter description names
     the price in prose and is checked separately. */
  const hero = servicePage.slice(heroStart, heroEnd);
  const heroPrices = new Set((hero.match(/£[\d,]+/g) || []));
  const heroAllowed = new Set(["£495", "£100", "£395", "£995"]);
  for (const shown of heroPrices) {
    if (!heroAllowed.has(shown)) {
      offenders.push(`service.html — the hero shows ${shown}; only the price, its two instalments and the standard price belong there`);
    }
  }
  /* The figures themselves come from the data file, so the hero passes by
     rendering price_display rather than by containing a numeral. */
  if (!/purchasing\.price_display/.test(hero)) offenders.push("service.html — the hero does not render the price");

  /* The service page must still explain both, even though neither is priced
     separately any more. The ordering rule that used to sit here belonged to the
     add-on: it kept a second price away from the buying decision, and there is
     no second price now. */
  assert(/Practice Clarity/.test(servicePage), "service.html no longer explains Practice Clarity");
  assert(/Website Care/.test(servicePage), "service.html no longer explains Website Care");

  /* Language that rebuilds the tier. */
  const banned = [
    [/\bupgrades?\b/i, "calls something an upgrade"],
    [/two (ways to begin|routes|options|tiers)/i, "presents two priced routes"],
    [/\bbundle[ds]?\b/i, "describes a bundle"],
    [/\bpackages?\b/i, "describes a package"],
  ];
  for (const [rel, body] of publishedBodies) {
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    for (const [pattern, what] of banned) {
      if (pattern.test(body)) offenders.push(`${rel} — ${what}`);
    }
  }

  assert(offenders.length === 0, offenders.join("\n"));
  return "£995 is the only price; Practice Clarity is included and unpriced";
});

check("Provenance", "Every direction declares a permitted provenance, and Client Work stays reserved", () => {
  /* August 2026. Where a design came from is a factual claim about commissioned
     work, not a wording preference: presenting Studio designs as client projects
     would be a misleading commercial practice, and /terms/ clause 5 says as much.
     So the vocabulary is closed, every entry must carry one, and `client` is
     reserved until a real client website exists. */
  const collection = read("_data/collection.yml");
  const vocab = read("_data/provenance.yml");
  const permitted = new Set(["studio-fictional", "studio-redesign", "live-own", "client"]);

  for (const value of permitted) {
    assert(new RegExp(`^${value}:`, "m").test(vocab), `_data/provenance.yml has no label for "${value}"`);
  }

  const keys = (collection.match(/^  key: .+$/gm) || []).length;
  const declared = collection.match(/^  provenance: (.+)$/gm) || [];
  assert(keys > 0, "_data/collection.yml lists no directions");
  assert(
    declared.length === keys,
    `${keys} directions but ${declared.length} provenance values — every entry must declare one`
  );

  const offenders = [];
  let clientClaims = 0;
  for (const line of declared) {
    const value = line.replace(/^  provenance:\s*/, "").trim();
    if (!permitted.has(value)) offenders.push(`"${value}" is not a permitted provenance value`);
    if (value === "client") clientClaims += 1;
  }
  assert(offenders.length === 0, offenders.join("\n"));
  assert(
    clientClaims === 0,
    `${clientClaims} direction(s) claim Client Work. That value is reserved until a real, agreed client website exists — see _data/provenance.yml`
  );

  /* One include renders the label, so no page can word it differently. */
  const inventing = [];
  for (const [rel, body] of publishedBodies) {
    if (rel === "_includes/provenance.html") continue;
    if (/Studio Practice —|Live Practice —|Client Work/.test(body)) {
      inventing.push(`${rel} writes a provenance label directly instead of including provenance.html`);
    }
  }
  assert(inventing.length === 0, inventing.join("\n"));

  return `${keys} directions · ${permitted.size} permitted values · Client Work unused`;
});

check("Analytics", "Loads nothing until it is configured, and never reads what is typed", () => {
  /* The site's promise on the contact page is that nothing typed there is
     stored by the website. An analytics call is storing. These assertions are
     what keeps that promise true as the analytics layer grows. */
  const include = read("_includes/analytics.html");
  const events = read("assets/js/analytics-events.js");
  const config = read("_config.yml");

  /* 1. Off unless explicitly configured, and no default may fill the gap. */
  assert(
    /analytics:\s*\n\s*provider:\s*""/.test(config),
    "_config.yml no longer declares an empty analytics provider — a provider must be opted into, never defaulted"
  );
  assert(
    /provider == "plausible" and domain != "" and host != ""/.test(include),
    "_includes/analytics.html no longer requires provider, domain and host together before emitting anything"
  );
  if (hasSite) {
    for (const file of walk(SITE, (f) => /\.html$/.test(f))) {
      const body = fs.readFileSync(file, "utf8");
      assert(
        !/plausible|analytics-events\.js/.test(body),
        `${path.relative(SITE, file)} emits an analytics script while analytics is unconfigured`
      );
    }
  }

  /* 2. Only allowlisted event names can ever be sent. */
  const allow = events.match(/var ALLOWED = \[([^\]]*)\]/);
  assert(allow, "assets/js/analytics-events.js no longer declares an ALLOWED event list");
  const names = [...allow[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert(names.length > 0 && names.length <= 8, `the analytics allowlist holds ${names.length} names; keep it short and deliberate`);
  assert(
    /ALLOWED\.indexOf\(name\) === -1\) return;/.test(events),
    "the allowlist is declared but no longer enforced before sending"
  );

  /* 3. Nothing typed may reach it. A named event takes no payload, so any
        second argument to plausible() is the thing to forbid outright. */
  /* Strip comments first: this guard tests code, not the prose that explains
     the guard. The build-css !important check learned the same lesson. */
  const eventsCode = events.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const forbidden = [
    [/\.value\b/, "reads a field value"],
    [/FormData/, "reads form data"],
    [/\.elements\b/, "reads form elements"],
    [/plausible\((?![^)]*\)\s*;?\s*$)[^)]*,/, "passes a payload to plausible()"],
  ];
  for (const [pattern, what] of forbidden) {
    assert(!pattern.test(eventsCode), `assets/js/analytics-events.js ${what} — analytics must never see what somebody typed`);
  }
  return `off by default · ${names.length} allowlisted events · no field access`;
});

check("Information architecture", "One resource section, one front door", () => {
  /* The Journal index and the Library index folded into /guidance/ in August
     2026. The nav must offer exactly one way in, the retired indexes must
     redirect rather than 404, and nothing may link at /blog/ any more. */
  const header = read("_includes/header.html");
  const navLinks = [...header.matchAll(/<li><a href="\{\{ '([^']+)'/g)].map((m) => m[1]);
  assert(navLinks.length === 4, `expected four primary nav links, found ${navLinks.length}`);
  assert(navLinks.includes("/guidance/"), "the navigation does not offer /guidance/");
  assert(!header.includes("/blog/"), "the navigation still links to the retired Journal index");
  assert(!/<details/.test(header), "the navigation still uses a dropdown");

  const redirects = read("_redirects");
  for (const gone of ["/blog/", "/library/"]) {
    assert(new RegExp("^" + gone.replace(/\//g, "\\/") + "\\s", "m").test(redirects),
      `${gone} has no redirect`);
  }

  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    if (rel === "_redirects") continue;
    for (const m of body.matchAll(/'\/blog\/'/g)) {
      offenders.push(`${rel}:${lineAt(body, m.index)}`);
    }
  }
  assert(offenders.length === 0, `links to the retired Journal index: ${offenders.join(", ")}`);
  return `${navLinks.length} nav links, /blog/ and /library/ redirected`;
});

check("Commercial architecture", "The retired offer structure is gone", () => {
  /* "Practice Clarity Blueprint" was on this list while it named a purchasable
     tier. Since the September 2026 portfolio consolidation it is the published
     name of the six portfolio documents — /work/, the six case pages and
     _data/collection.yml all use it in that sense — so guarding the string
     itself failed the suite on correct copy. What replaced it is narrower and
     stronger: the checks below already forbid pricing Practice Clarity,
     presenting it as optional, and putting a purchase action beside it. */
  const retired = [
    "Choose Your Practice Website",
    "Bespoke Website",
    "Route one",
    "Route two",
    "two routes",
    "Around £2,000",
  ];
  const offenders = [];
  for (const rel of trackedFiles) {
    if (!/\.(html|md|markdown|ya?ml|js|mjs|json|txt|toml)$/.test(rel)) continue;
    if (rel === "scripts/qa.mjs") continue;
    if (rel.startsWith("_legacy/") || rel.startsWith("_strategy/") || rel.startsWith("_responsive-pass/")) continue;
    if (/^(REBUILD-REPORT|OPEN_DECISIONS|LEGAL_REVIEW|STRIPE_SETUP|IMPLEMENTATION|VISUAL-SYSTEM|README|INSTALLATION|PHOTOGRAPHY-SHOT-LIST|REDESIGN-REPORT)\.md$/.test(rel)) continue;
    const body = read(rel);
    for (const phrase of retired) {
      if (body.includes(phrase)) offenders.push(`${rel}: ${phrase}`);
    }
  }
  assert(offenders.length === 0, `retired offer language survives — ${offenders.slice(0, 8).join("; ")}`);
  return `${retired.length} retired phrases absent from ${trackedFiles.length} files`;
});

/* ------------------------------------------------------------------ *
 * 4b. The product is an identity, not a website
 *
 * September 2026. The Sofia Marin implementation established what the studio
 * actually delivers: practice clarity, a practice identity in words and in
 * visual decisions, the website built from it, and a handover the client can
 * use without the studio. Before that, the site sold a website with "a visual
 * identity for the website" attached, and excluded brand guidelines and
 * stationery by name — which is now the opposite of what is delivered.
 *
 * These three checks exist because that older, smaller description is the one
 * that will creep back: it is shorter, it is what most of the copy used to say,
 * and every sentence of it still reads plausibly.
 * ------------------------------------------------------------------ */

check("Product scope", "The offer is described as four stages, and the handover is one of them", () => {
  assert(/id="yours-to-keep"/.test(servicePage), 'service.html no longer carries the "Yours to keep" section');
  for (const term of ["Practice Clarity", "Practice Identity", "implementation", "Yours to keep"]) {
    assert(servicePage.includes(term), `service.html does not name "${term}" in the four-stage explanation`);
  }
  const purchase = read(PURCHASE_PAGE);
  assert(/id="keep"/.test(purchase), `${PURCHASE_PAGE} no longer carries the handover section`);
  assert(/Practice Identity Guide/.test(purchase), `${PURCHASE_PAGE} does not name the identity guide in the published scope`);
  return "four stages on the cost page; the handover in the published scope";
});

check("Product scope", "The website-only description of the offer has not come back", () => {
  /* Reverting any of these is not a wording regression. It is a scope claim that
     contradicts what the studio now hands over, and on the exclusion line it
     would promise the absence of something the client actually receives. */
  const retired = [
    "brand guidelines, stationery",
    "visual identity for the website",
    "Therapist Website",
  ];
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    for (const phrase of retired) {
      if (body.includes(phrase)) offenders.push(`${rel} — "${phrase}"`);
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return `${retired.length} retired descriptions absent from ${publishedBodies.size} published files`;
});

check("Product scope", "The handover is bounded as well as valuable", () => {
  /* The offer has to be extremely valuable and finite at the same time. What
     keeps it finite is a single distinction: three templates are made, and every
     other application is specified in the guide precisely enough for a supplier
     to produce. A page that loses that distinction has started selling an
     open-ended amount of design. */
  const overclaims = [
    [/unlimited (templates|design|applications|assets)/i, "promises an unlimited amount of design"],
    [/ongoing design support/i, "promises ongoing design support"],
    [/everything you (could ever )?need/i, "promises everything they need"],
    [/all your (marketing|print|brand) materials/i, "promises all their materials"],
    [/any (print|printed) item you/i, "promises any printed item"],
  ];
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    for (const [pattern, what] of overclaims) {
      if (pattern.test(body)) offenders.push(`${rel} — ${what}`);
    }
  }
  const purchase = read(PURCHASE_PAGE);
  assert(
    /specified in (your|the) guide/.test(purchase),
    `${PURCHASE_PAGE} does not distinguish what is made from what is specified`
  );
  assert(offenders.length === 0, offenders.join("\n"));
  return "no open-ended promise; made-versus-specified stated in the published scope";
});

check("Founding offer", "The founding price is never shown without the standard price beside it", () => {
  /* £495 has meant three different things in this project's history. While it is
     the founding price, any page that shows it must also show what the service
     returns to — otherwise a reader is quoted a number with nothing to measure
     it against, and the studio is one edit away from looking as though it
     quietly raised its prices. */
  if (!/^\s*active:\s*true\s*$/m.test((purchasingYml.match(/^founding:\n(?:[ \t].*\n|\n)*/m) || [""])[0])) {
    return "the founding offer is closed — check does not apply";
  }
  const offenders = [];
  let inspected = 0;
  for (const [rel, body] of publishedBodies) {
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    /* A partial is not a page. The buy component renders the price and nothing
       else; what a reader sees is the page it is rendered into, and that page is
       inspected on its own account below. Judging the fragment would either
       force a second price into a component whose whole guarantee is that it has
       one state, or duplicate the founding note twice on the only page it
       appears on. */
    if (rel.startsWith("_includes/")) continue;
    const showsFounding = /£495|purchasing\.price_display/.test(body);
    if (!showsFounding) continue;
    inspected += 1;
    const showsStandard = /£995|founding\.standard_price_display/.test(body);
    if (!showsStandard) offenders.push(`${rel} — shows the price without the standard price it returns to`);
  }
  /* The exemption above is only safe while every page that hosts the buy
     component carries both figures itself. */
  for (const [rel, body] of publishedBodies) {
    /* The component names itself in its own usage comment. */
    if (rel.startsWith("_includes/")) continue;
    if (!/practice-website-buy\.html/.test(body)) continue;
    assert(
      /£995|founding\.standard_price_display/.test(body),
      `${rel} hosts the buy component but does not itself publish the standard price`
    );
  }
  assert(inspected >= 4, `only ${inspected} pages show the price — the scan is not seeing the site`);
  assert(offenders.length === 0, offenders.join("\n"));
  return `${inspected} pages show both figures`;
});

check("Founding offer", "Nothing manufactures urgency or scarcity", () => {
  /* The truthful constraint is that there are three places. Everything past
     that — a countdown, a deadline, a remaining-places number that would have
     to be maintained by hand to stay honest, or a struck-through £995 — is a
     sales device, and the studio's whole proposition is that it does not use
     them. */
  const banned = [
    [/\bhurry\b|\bdon'?t miss\b|\bmiss out\b/i, "uses urgency language"],
    [/\blimited time\b|\bfor a limited\b|\bends (soon|on)\b|\bdeadline\b/i, "implies a deadline"],
    [/\bclaim (your|a) (spot|place)\b|\bbuy now\b|\bact (now|fast)\b/i, "uses an e-commerce call to action"],
    [/\b(only )?(one|two|1|2) (place|spot)s? (left|remaining)\b/i, "carries a remaining-places counter"],
    [/<s>|<del>|text-decoration:\s*line-through/i, "strikes through a price"],
    [/\bwas £|\bnormally £|\bsave £|\bRRP\b|\bdiscount(ed)?\b/i, "presents the price as a discount"],
  ];
  /* Saying "there is no deadline and nothing counts down" is the site keeping
     its promise, not breaking it, so a hit preceded by a negation is not a
     finding. The window is deliberately short: it catches "no deadline" and
     "never discounted" without excusing a sentence that merely contains "not"
     somewhere earlier. */
  const negated = (body, at) => /\b(no|not|never|without|nothing|neither)\b[^.]{0,40}$/i.test(body.slice(Math.max(0, at - 60), at));
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    for (const [pattern, what] of banned) {
      const global = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
      for (const hit of body.matchAll(global)) {
        if (negated(body, hit.index)) continue;
        offenders.push(`${rel}:${lineAt(body, hit.index)} — ${what} ("${hit[0]}")`);
      }
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return `${banned.length} patterns absent`;
});

check("Founding offer", "The balance milestone is objective, not a satisfaction condition", () => {
  /* The founding split is weighted to the end — £100 to begin, £395 on approval
     — and the obvious way to sell that is "pay nothing until you're happy".
     That formulation makes the balance conditional on a subjective state and
     would let a finished project go unpaid because somebody declined to use a
     particular word. The milestone is the completion of the agreed process and
     approval for launch, which clause 11 defines and bounds. These patterns are
     what stops the softer version growing back into the copy. */
  const banned = [
    [/pay\s+nothing\s+until/i, 'promises "pay nothing until…"'],
    [/only pay if you (like|are happy|'re happy)/i, "makes payment conditional on liking the work"],
    [/\b(risk[- ]free|no[- ]risk)\b/i, "calls the arrangement risk-free"],
    [/satisfaction (guarantee|guaranteed)|guaranteed satisfaction/i, "offers a satisfaction guarantee"],
    [/money[- ]back/i, "offers money back"],
    [/\bfull refund if\b|\brefund if you(?:'re| are)? not\b/i, "offers a conditional refund"],
    [/\buntil you(?:'re| are)? (happy|satisfied)\b/i, "ties payment or work to being happy"],
  ];
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    for (const [pattern, what] of banned) {
      const hit = body.match(pattern);
      if (hit) offenders.push(`${rel}:${lineAt(body, body.indexOf(hit[0]))} — ${what} ("${hit[0]}")`);
    }
  }
  /* And the definition the copy leans on has to actually exist. */
  const terms = read("_pages/service-terms-practice-website.html");
  assert(/id="approval"/.test(terms), "clause 11 has no approval anchor for the service page to link to");
  assert(
    /ten working days/i.test(terms) && /within the agreed scope/i.test(terms),
    "clause 11 no longer bounds approval — a completed project could sit unapproved and unpaid indefinitely"
  );
  assert(offenders.length === 0, offenders.join("\n"));
  return `${banned.length} patterns absent; clause 11 bounds approval`;
});

check("Founding offer", "The stages are described as one piece of work", () => {
  /* Practice Clarity, the identity and the website are stages of one job. A
     page that lists them as three deliverables invites the client to ask which
     they can drop, which is the one judgement they are least able to make. */
  assert(/what-you-are-buying/.test(servicePage), "service.html no longer carries the three-stage explanation");
  for (const term of ["Practice Clarity", "Identity", "implementation"]) {
    assert(servicePage.includes(term), `service.html does not name "${term}" in the three-stage explanation`);
  }
  return "stages named, one piece of work";
});

check("Commercial architecture", "The Practice Identity & Website is the only route that takes money", () => {
  assert(/purchasing\.price_display/.test(purchasePage), "the purchase page does not render the price");
  assert(/practice-website-buy\.html/.test(purchasePage), "the purchase page does not include the buy component");
  assert(/Practice Identity (&|&amp;) Website/.test(purchasePage), "the purchase page does not name the Practice Identity & Website");
  assert(/\/services\/practice-website\//.test(servicePage), "service.html does not link to the purchase page");
});

/* ------------------------------------------------------------------ *
 * 5. Website Care
 * ------------------------------------------------------------------ */

check("Website Care", "Described as included for twelve months, then £29 a month", () => {
  let described = 0;
  for (const rel of [PURCHASE_PAGE, "service.html"]) {
    const body = read(rel);
    assert(body.includes("Website Care"), `${rel} does not mention Website Care`);
    assert(
      /(first (twelve months|year)|twelve months of Website Care)/i.test(body),
      `${rel} does not say the first year of Website Care is included`
    );
    assert(/£29/.test(body), `${rel} does not state the £29 monthly price`);
    assert(/no\s+minimum\s+term/i.test(body), `${rel} does not say there is no minimum term`);
    described += 1;
  }
  return `${described} pages`;
});

check("Website Care", "Claims only what the infrastructure supports", () => {
  /* Care is a paid promise now that it is inside the £995, so it must not
     claim continuous monitoring or a backup guarantee: neither is provided.
     Version history and TLS are, and are named instead. */
  const forbidden = [
    /\buptime (guarantee|monitoring)\b/i,
    /24\/7/,
    /round-the-clock monitoring(?!\s*<\/li>)/i,
  ];
  const offenders = [];
  for (const rel of [PURCHASE_PAGE, "service.html", "_pages/service-terms-practice-website.html"]) {
    const body = read(rel);
    for (const pattern of forbidden) {
      /* The phrases are permitted where they appear in a "does not cover"
         list, which is exactly where they should appear. */
      const hit = body.match(pattern);
      if (!hit) continue;
      const at = body.indexOf(hit[0]);
      const around = body.slice(Math.max(0, at - 400), at + 200);
      if (/does not|not cover|Not included|is not:/i.test(around)) continue;
      offenders.push(`${rel}: ${hit[0]}`);
    }
  }
  assert(offenders.length === 0, `Website Care claims something unsupported — ${offenders.join("; ")}`);
  return "no monitoring or backup guarantee claimed";
});

check("Website Care", "No subscription is built or activated", () => {
  assert(/subscriptions_enabled:\s*false/.test(purchasingYml), "_data/purchasing.yml does not set subscriptions_enabled: false");
  const offenders = [];
  /* Care sits inside the £995 for its first twelve months, so the checkout
     action and the words "Website Care" now legitimately appear together —
     but only where the surrounding sentence says it is included. A checkout
     action beside Care described any other way would be selling a
     subscription this repository has not built. */
  for (const [rel, body] of publishedBodies) {
    let index = body.indexOf("Website Care");
    while (index !== -1) {
      const block = body.slice(Math.max(0, index - 1200), index + 1200);
      const hasAction = /https:\/\/buy\.stripe\.com|practice-website-buy|data-purchase-action/.test(block);
      const saysIncluded = /includ(ed|es|ing)/i.test(block);
      if (hasAction && !saysIncluded) {
        offenders.push(`${rel}:${lineAt(body, index)} places a checkout action beside Website Care without saying it is included`);
      }
      index = body.indexOf("Website Care", index + 1);
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

check("Configuration", "The buy component carries no checkout branch at all", () => {
  /* September 2026. The studio takes payment by invoice and bank transfer. The
     Stripe Payment Link branch was removed rather than switched off, so what is
     guarded here is its absence: a future edit that reintroduces a checkout
     link has to change this test deliberately, and changing it means revisiting
     the service terms, the privacy notice and the cancellation page, all three
     of which now describe a bank transfer. */
  assert(!/buy\.stripe\.com/.test(buyMarkup), "the buy component emits a Stripe checkout link again");
  assert(!/purchases_enabled/.test(buyMarkup), "the buy component gates on a purchasing switch again");
  assert(!/purchase_enabled/.test(buyMarkup), "the buy component has a conditional purchase state again");
  assert(
    /data-purchase-state="written"/.test(buyMarkup),
    "the buy component no longer declares the written route as its only state"
  );
  assert(!/\{%-?\s*if\b/.test(buyMarkup), "the buy component has grown a conditional branch");
});

check("Configuration", "The written route is stated positively, not as an apology", () => {
  /* Renamed twice. In August 2026 there ceased to be an "unavailable" state; in
     September 2026 there ceased to be a second branch at all. What is guarded
     now is that the one state the component has describes how a project begins,
     links somewhere a visitor can actually go, and does not apologise for the
     absence of a checkout that is never coming. */
  assert(/How a project begins/.test(buyMarkup), "the component does not describe how a project begins");
  assert(/cfg\.urls\.enquiry/.test(buyMarkup), "the component has no working enquiry route");
  assert(/>Tell me which design you like</.test(buyMarkup), "the component does not offer the written route");
  assert(
    !/(not open yet|opening shortly|coming soon|temporarily|for now|in the meantime)/i.test(buyMarkup),
    "the component apologises for the absence of a checkout"
  );
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
  ["/service-terms/practice-website/", "_pages/service-terms-practice-website.html"],
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
    [BUY_INCLUDE, buyInclude],
    [QUESTIONNAIRE, questionnaire],
  ];
  const cfgAlias = {
    "/service-terms/practice-website/": "cfg.urls.service_terms",
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

check("Legal", "The terms are readable before anything is agreed", () => {
  const terms = read("_pages/service-terms-practice-website.html");
  assert(!/^noindex:\s*true/m.test(frontMatter(terms)), "the service terms are hidden from indexing");
  assert(!/<form/i.test(terms), "the service terms sit behind a form");
  assert(/cfg\.urls\.service_terms/.test(buyInclude), "the buy component does not link to the service terms");
});

/* ------------------------------------------------------------------ *
 * 11. The private routes stay private
 * ------------------------------------------------------------------ */

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
 * 13. Questionnaire
 * ------------------------------------------------------------------ */

check("Questionnaire", "The page and _data/intake.yml agree on the question count", () => {
  /* Until September 2026 this asserted the literal 15/7 shape, which came from
     a brief describing an approved intake that was never found in the project.
     The questionnaire is no longer designed around that number: what matters is
     that the page and the data file agree, that every question is numbered, and
     that the sequence has no gaps. The counts move when the questionnaire
     legitimately changes; they are not a target it has to hit. */
  const required = (questionnaire.match(/class="req"/g) || []).length;
  const optional = (questionnaire.match(/class="opt"/g) || []).length;
  const expectedRequired = Number((intakeYml.match(/^required_questions:\s*(\d+)/m) || [])[1]);
  const expectedOptional = Number((intakeYml.match(/^optional_questions:\s*(\d+)/m) || [])[1]);
  assert(required > 0, `${QUESTIONNAIRE} marks no questions required`);
  assert(
    required === expectedRequired,
    `${QUESTIONNAIRE} marks ${required} questions required, _data/intake.yml says ${expectedRequired}`
  );
  assert(
    optional === expectedOptional,
    `${QUESTIONNAIRE} marks ${optional} questions optional, _data/intake.yml says ${expectedOptional}`
  );
  const numbers = [...questionnaire.matchAll(/<(?:span|legend)>(\d{1,2})\. /g)].map((m) => Number(m[1]));
  for (let n = 1; n <= required; n += 1) {
    assert(numbers.includes(n), `question ${n} is missing from the numbered sequence`);
  }
  assert(
    numbers.length === required,
    `found ${numbers.length} numbered questions but ${required} marked required`
  );
  return `${required} required, ${optional} optional, numbered 1–${required}`;
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
  const js = read("assets/js/practice-website-questionnaire.js");
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
      `a checkbox is read by .value rather than .checked: "${expression}" (assets/js/practice-website-questionnaire.js:${lineAt(js, branch.index)})`
    );
  }
});

check("Questionnaire", "Nothing is submitted to a server", () => {
  assert(/data-questionnaire\b/.test(questionnaire), "the questionnaire form has no data-questionnaire hook");
  assert(!/<form[^>]*\baction=/i.test(questionnaire), "the questionnaire form posts to a server");
  assert(/Nothing you type here is sent to or stored by this website/i.test(questionnaire), "the page does not say nothing is stored");
});

check("Questionnaire", "The draft notice is guarded by the approval flag, in either state", () => {
  /* This used to assert `questionnaire_approved: false` outright, which meant
     that approving the questionnaire — the thing the flag exists to allow —
     failed the suite. What matters is not which state the flag is in but that
     the notice is wired to it: unapproved shows the notice, approved removes it
     everywhere at once, and the guard survives either way so it can be flipped
     back. The flag itself is Alexander's to set, after reading the questions as
     a client would. */
  assert(
    /\{%-?\s*unless site\.data\.intake\.questionnaire_approved/.test(questionnaire),
    "the draft notice is not guarded by site.data.intake.questionnaire_approved"
  );
  assert(/\{%-?\s*endunless\s*-?%\}/.test(questionnaire), "the draft notice guard is never closed");
  assert(/Draft questionnaire/i.test(questionnaire), "the draft notice text is missing");
  const approved = /^questionnaire_approved:\s*true\s*$/m.test(intakeYml);
  const draft = /^questionnaire_approved:\s*false\s*$/m.test(intakeYml);
  assert(approved || draft, "_data/intake.yml does not declare questionnaire_approved as true or false");
  return approved
    ? "approved — the notice does not render"
    : "NOT YET APPROVED — a paying client would see the draft notice on the first page after paying";
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

check("Accessibility", "The purchase action is a real link, and it is described", () => {
  /* August 2026. The disabled button is gone, so what is checked is that every
     state offers a genuine anchor a keyboard user can reach and follow, that
     nothing fakes a control, and that the action carries its description. */
  const actions = (buyMarkup.match(/<a\b[^>]*class="[^"]*buy-action/g) || []).length;
  assert(actions >= 1, `expected a real buy-action anchor, found ${actions}`);
  assert(!/<button\b/.test(buyMarkup), "the buy component renders a button; both states should be links");
  assert(!/onclick=/i.test(buyMarkup), "the buy action relies on an inline click handler");
  assert(!/role="button"/.test(buyMarkup), "the buy action fakes a button with a role attribute");
  assert(!/\bdisabled\b/.test(buyMarkup), "the buy component still renders a disabled control");
  const described = (buyMarkup.match(/aria-describedby="buy-terms-/g) || []).length;
  assert(described >= 1, `the buy action must carry an accessible description (found ${described})`);
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

check("Built site", "Every page loads the one stylesheet, and only that one", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const body = readSite("services/practice-website/index.html");
  assert(/studio\.min\.css/.test(body), "the built purchase page loads no stylesheet");
  const sheets = [...body.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)];
  assert(sheets.length === 1, `the built purchase page loads ${sheets.length} stylesheets, expected 1`);
  assert(/studio\.min\.css/.test(body), "the built purchase page does not load studio.min.css");
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

/* The unfilled legal facts, read once and shared by the check below and the
   trailer at the end of the run. Each is a single quoted scalar in
   _data/legal.yml; empty means "Alexander has not supplied it yet". */
const LEGAL_FACT_KEYS = [
  ["identity.address", "address", "Terms, Service Terms, Privacy"],
  ["data_protection.ico_registration", "ico_registration", "Privacy"],
  ["data_protection.email_provider", "email_provider", "Privacy"],
  ["data_protection.accounting_provider", "accounting_provider", "Privacy"],
  ["data_protection.bank", "bank", "Privacy"],
  ["data_protection.transfer_mechanism", "transfer_mechanism", "Privacy"],
  ["data_protection.enquiry_retention", "enquiry_retention", "Privacy"],
  ["data_protection.project_retention", "project_retention", "Privacy"],
  ["data_protection.statutory_retention", "statutory_retention", "Privacy"],
  ["data_protection.security_measures", "security_measures", "Privacy"],
];

const unfilledLegalFacts = LEGAL_FACT_KEYS.filter(([, key]) => {
  const m = legalYml.match(new RegExp(`^\\s{2}${key}:\\s*"([^"]*)"\\s*$`, "m"));
  return !m || !m[1].trim();
});

check("Legal", "The unfilled identity and data-protection facts are declared, not hidden", () => {
  /* September 2026. While these are empty, _includes/legal-fact.html renders the
     bracketed placeholder in its place, which is the right design: an unfinished
     page must look unfinished. What was missing is that a green test run said
     nothing about it, so the state could ship unnoticed — and the placeholder
     text on the privacy notice is written as an instruction to the author, which
     a therapist reading it before paying should not be seeing.

     This does not fail by default, because these facts have been empty on the
     live site for some time and blocking every deploy on them would also block
     shipping unrelated corrections. It fails the moment
     STUDIO_REQUIRE_LEGAL_FACTS=true is set, which is what to set once they are
     filled so the state cannot regress. Either way the trailer at the end of the
     run names every one of them.

     Nothing here may supply a default. LEGAL-INFORMATION-REQUIRED.md records
     that not one of these is recoverable from the repository. */
  const required = process.env.STUDIO_REQUIRE_LEGAL_FACTS === "true";
  if (unfilledLegalFacts.length === 0) return "every identity and data-protection fact is supplied";
  const list = unfilledLegalFacts.map(([label, , where]) => `${label} (${where})`).join("\n      ");
  assert(
    !required,
    `STUDIO_REQUIRE_LEGAL_FACTS=true, but _data/legal.yml still has ${unfilledLegalFacts.length} empty:\n      ${list}`
  );
  return `NOT YET SUPPLIED — ${unfilledLegalFacts.length} facts render as public placeholders:\n      ${list}`;
});

check("Content", "Square-bracket placeholders appear only in the legal pages", () => {
  const pattern = /\[[A-Z][^\]\n]{3,120}\]/g;
  const offenders = [];
  let legalPlaceholders = 0;
  for (const [rel, body] of publishedBodies) {
    const isLegal = LEGAL_SURFACE.has(rel);
    const withoutFrontMatter = body.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
    for (const match of withoutFrontMatter.matchAll(pattern)) {
      /* match[0] already ends with the closing bracket, so the Markdown-link
         escape has to look at what follows it. Testing the slice for "](" 
         could never match, and every link with a capitalised label was
         reported as an unfilled placeholder. */
      if (withoutFrontMatter[match.index + match[0].length] === "(") continue;
      if (isLegal) {
        legalPlaceholders += 1;
        continue;
      }
      offenders.push(`${rel}:${lineAt(body, body.indexOf(match[0]))} — ${match[0].slice(0, 60)}`);
    }
  }
  assert(offenders.length === 0, `placeholders outside the legal pages:\n${offenders.join("\n")}`);

  /* The identity facts now come from _data/legal.yml through
     _includes/legal-fact.html, so the placeholder text lives in the include
     arguments rather than in the page bodies. What matters has not changed and
     is now checked where it actually shows: while a fact is empty, the reader
     must still see that it is empty. A page that renders as though it were
     finished while the value behind it is blank is the failure mode. */
  /* Read the values without a YAML parser: each is a single quoted scalar on
     its own line, and an empty string is exactly what we are looking for. */
  const legalFact = (key) => {
    const m = legalYml.match(new RegExp(`^\\s{2}${key}:\\s*"([^"]*)"\\s*$`, "m"));
    return m ? m[1] : "";
  };
  const facts = [
    ["identity.legal_name", legalFact("legal_name")],
    ["identity.address", legalFact("address")],
    ["tax.vat_position", legalFact("vat_position")],
  ];
  const unfilled = facts.filter(([, value]) => !String(value || "").trim()).map(([key]) => key);

  let rendered = 0;
  if (hasSite) {
    for (const file of walk(SITE, (f) => /\.html$/.test(f))) {
      const rel = path.relative(SITE, file).split(path.sep).join("/");
      if (!/^(terms|privacy|cancellation-and-refunds|service-terms)\b/.test(rel)) continue;
      rendered += (fs.readFileSync(file, "utf8").match(/class="legal-todo"/g) || []).length;
    }
    if (unfilled.length > 0) {
      assert(
        rendered > 0,
        `_data/legal.yml still has ${unfilled.join(", ")} empty, but no placeholder renders on the built legal pages — an unfinished page must look unfinished`
      );
    }
  }

  assert(
    legalPlaceholders + rendered > 0,
    "no placeholders found in the legal pages — the draft state looks wrong"
  );
  return unfilled.length
    ? `note: ${rendered || legalPlaceholders} placeholders still render · ${unfilled.length} identity facts unfilled`
    : `note: identity facts complete · ${rendered || legalPlaceholders} placeholders remain`;
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
/* A green run must not read as "ready to publish" while the legal pages are
   still showing brackets to a paying client. */
if (unfilledLegalFacts.length > 0) {
  process.stdout.write(
    `\nNOT READY TO PUBLISH AS FINISHED — ${unfilledLegalFacts.length} legal facts are still empty in _data/legal.yml.\n` +
      unfilledLegalFacts.map(([label, , where]) => `  · ${label} — renders as a bracketed placeholder on: ${where}`).join("\n") +
      "\nUntil they are supplied, /privacy/ and /terms/ publicly display placeholder text written as notes to the author.\n" +
      "What each one means: LEGAL-INFORMATION-REQUIRED.md. Set STUDIO_REQUIRE_LEGAL_FACTS=true once filled to lock it in.\n"
  );
}
process.exit(failures > 0 ? 1 : 0);

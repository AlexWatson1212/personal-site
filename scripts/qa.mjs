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
 * state of the legal pages, the enquiry fit check and the private intake
 * pages. A check that needs _site
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
  "_concepts",
  "_deploy",
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
  /* September 2026. These three are excluded from the build by _config.yml for
     the same reason as the trees above: they are working directories, not
     published source. They were missing here, so every file in them was scanned
     as though it were a page — which reported the commercial-architecture checks
     against an unrelated project's README that happens to be saved in "Claude
     outputs". A directory Jekyll does not publish cannot carry a claim about the
     offer, so it must not be judged as though it did.

     If a directory is added to the `exclude` list in _config.yml and it holds
     .html or .md files, add it here too. */
  /* September 2026. The concept websites and the shared components they use.
     Each concept is a separate deployment on its own subdomain — its own page,
     its own identity, its own offer — versioned here rather than left loose on
     a laptop. They are in the `exclude` list in _config.yml for that reason, so
     by the rule above they belong here too: a fictional counsellor's fee is not
     a studio price, her page's <main> is not a second landmark on a studio page,
     and her assets live beside her page rather than in /assets. */
  "_concepts/",
  "_deploy/",
  "_shared/",
  "Claude outputs/",
  "staging/",
  "legacy/",
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
  /* 16 September 2026. The single current-state register. */
  "DECISION-REGISTER.md",
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
  ["client/photography.html", "/client/photography/"],
  ["work.html", "/work/"],
  ["about.html", "/about/"],
  ["contact.html", "/contact/"],
  ["guidance.html", "/guidance/"],
  ["other-services.html", "/other-services/"],
  ["other-services-enquiry.html", "/other-services/enquiry/"],
  ["other-services-thanks.html", "/other-services/thanks/"],
  ["website-design-therapists-stockport.html", "/website-design-therapists-stockport/"],
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
/* 17 September 2026: the retired questionnaire route redirected to
   /client/intake/. 19 September 2026: that Tally intake was itself retired and
   its page removed, so /client/intake/ is now a redirect rather than a route.
   The private pages are Practice Discovery, the page its form action lands on,
   and the photography brief. */
const PRIVATE_ROUTES = [
  "/client/photography/",
  "/client/practice-discovery/",
  "/client/practice-discovery/thank-you/",
];

const BUY_INCLUDE = "_includes/practice-website-buy.html";
const PURCHASE_PAGE = "services/practice-website.html";
const PHOTO_BRIEF = "client/photography.html";
const DISCOVERY = "client/practice-discovery.html";
const DISCOVERY_THANKS = "client/practice-discovery-thank-you.html";
/** Every source file that is itself a client page. */
const CLIENT_PAGES = [PHOTO_BRIEF, DISCOVERY, DISCOVERY_THANKS];
const ENQUIRY = "contact.html";
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
     £395    the balance instalment, due once the client has approved the
             direction (the Practice Fundamentals and visual direction, at the
             end of the first feedback stage), before the build — a written
             decision defined in clause 11, never a satisfaction condition
     £995    the standard price, after the three founding practices. Published
             so a reader can see what they are being offered against, never
             struck through and never used to dress £495 as a saving.
     Practice Care's annual figure and the hourly rate for additional work are
     approved from _data/purchasing.yml below, so each is set in one place.
   £29 LEFT THE PUBLISHED SITE on 24 September 2026, when Website Care at £29 a
   month was replaced by Practice Care, charged annually. It is no longer an
   approved price, so the scan below fails if it reappears on a page.
   £500 LEFT THE PUBLISHED SITE with the standard instalment split (which,
   since 17 September 2026, is the £995 split: a sum to begin and the rest once
   the Practice Fundamentals is approved, recorded in OPEN_DECISIONS.md). Publishing
   that split alongside a £495 total would put two different meanings on one
   number, which is exactly the sort of detail that costs a reader their
   confidence. The standard split returns to the site when £995 does.
   £1,495 was retired in August 2026 along with the tier it implied. Any other
   amount in published source is a mistake until this list says otherwise. */
const APPROVED_PRICES = new Set(["£495", "£100", "£395", "£995"]);
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

/* 24 September 2026. The hourly rate for smaller work on /other-services/.
   It is set once, as `hourly_rate` in _data/purchasing.yml, and approved here
   from that file so that setting it is a one-line change. "£XX" is the
   unset placeholder: the page shows no figure while it stands. */
const HOURLY_RATE = (purchasingYml.match(/^hourly_rate:\s*"([^"]*)"\s*$/m) || [])[1] ?? null;
const HOURLY_RATE_SET = HOURLY_RATE !== null && /^£\d[\d,]*(\.\d{2})?$/.test(HOURLY_RATE);
if (HOURLY_RATE_SET) APPROVED_PRICES.add(HOURLY_RATE);

/* 24 September 2026. Practice Care, optional after the included first year,
   charged annually. Set once as practice_care.annual in _data/purchasing.yml. */
const CARE_ANNUAL = (purchasingYml.match(/^practice_care:[\s\S]*?^\s+annual:\s*"([^"]*)"/m) || [])[1] ?? null;
if (CARE_ANNUAL && /^£\d[\d,]*(\.\d{2})?$/.test(CARE_ANNUAL)) APPROVED_PRICES.add(CARE_ANNUAL);
const legalYml = read("_data/legal.yml");
const buyInclude = read(BUY_INCLUDE);
/* The include with its leading documentation comment stripped. Checks that ask
   what the component RENDERS must read this; checks that ask how it is wired
   may read the whole file. */
const buyMarkup = buyInclude.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
const purchasePage = read(PURCHASE_PAGE);
const photoBrief = read(PHOTO_BRIEF);
const enquiryPage = read(ENQUIRY);
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
  assert(/^practice_care:/m.test(purchasingYml), "_data/purchasing.yml does not declare practice_care");
  assert(/included_months:\s*12/.test(purchasingYml), "Practice Care is not declared as twelve included months");
  assert(CARE_ANNUAL && /^£\d/.test(CARE_ANNUAL), "practice_care.annual is not set to an amount");
  assert(!/^website_care:/m.test(purchasingYml), "website_care is still declared — Website Care was retired on 24 September 2026");
  assert(!/^\s+monthly:/m.test(purchasingYml), "a monthly care price is still declared — Practice Care is annual");
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

  const written = (buyInclude.match(/>Tell me about your practice</g) || []).length;
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

check("Checkout scope", "The Practice Fundamentals carries no purchase action", () => {
  /* The Practice Fundamentals is the first deliverable of the one product and
     has no price of its own. Nothing that describes it may offer a payment
     action. (Until 17 September 2026 this guarded "Practice Clarity", the
     deliverable's earlier name.) */
  let inspected = 0;
  for (const { file, body: source } of commercialPages()) {
    /* The front matter description names it in prose; judge the page body. */
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
    const index = body.indexOf("Practice Fundamentals");
    if (index === -1) continue;
    inspected += 1;
    const block = body.slice(Math.max(0, index - 200), index + 1600);
    assert(!/practice-website-buy\.html/.test(block), `${file} · a Practice Fundamentals block includes the buy component`);
    assert(!/Pay\s+(£995|\{\{)/.test(block), `${file} · a Practice Fundamentals block shows a pay action`);
    assert(!/buy\.stripe\.com/.test(block), `${file} · a Practice Fundamentals block links to Stripe`);
  }
  assert(inspected >= 2, `only ${inspected} Practice Fundamentals blocks inspected`);
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
  assert(/purchasing\.practice_care\.annual/.test(servicePage), "service.html does not render the Practice Care price");
  assert(/[Cc]ustom project/.test(servicePage), "service.html does not offer a custom project route");
  assert(
    /founding\.standard_price_display/.test(servicePage),
    "service.html does not publish the standard price the founding price is measured against"
  );
  return "price + instalments rendered from data · Practice Care from data · standard price published · custom quoted";
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
    const m = body.match(/[^.]{0,90}Practice (?:Clarity|Fundamentals)[^.]{0,90}/g) || [];
    for (const sentence of m) {
      if (/\boptional\b|\badd-?on\b|\bupsell\b|invoiced separately/i.test(sentence)) {
        offenders.push(`${rel} — presents Practice Clarity or the Practice Fundamentals as optional or separately sold: "${sentence.trim().slice(0, 90)}"`);
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
  assert(/Practice Fundamentals/.test(servicePage), "service.html no longer explains the Practice Fundamentals");
  assert(/Practice Care/.test(servicePage), "service.html no longer explains Practice Care");

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
  return "one website price; the Practice Fundamentals is included and unpriced";
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

check("Portfolio", "The public collection is exactly the three flagships, and nothing points at an archived case", () => {
  /* 16 September 2026. The collection was narrowed from six fictional practices
     to three flagships as a strategic decision (DECISION-REGISTER.md). Helen
     Calder, Harbour and Stillpoint are preserved, unpublished, in
     _strategy/archived-portfolio-2026-09/ and their old URLs redirect to /work/.
     This check keeps the narrowing from eroding: no fourth entry, no page
     reintroducing an archived case, and no copy still counting to six. Adding a
     case back is a decision, so it starts by changing FLAGSHIPS here. */
  const FLAGSHIPS = ["sofia-marin", "maya-bennett", "daniel-mercer"];
  const ARCHIVED = [
    ["helen-calder", "Helen Calder"],
    ["harbour", "Harbour"],
    ["stillpoint", "Stillpoint"],
  ];
  const collection = read("_data/collection.yml");
  const keys = [...collection.matchAll(/^  key: (.+)$/gm)].map((m) => m[1].trim());
  assert(
    JSON.stringify(keys) === JSON.stringify(FLAGSHIPS),
    `_data/collection.yml lists [${keys.join(", ")}] — the public collection is ${FLAGSHIPS.join(", ")}, in that order`
  );

  const offenders = [];
  const redirects = read("_redirects");
  for (const [slug] of ARCHIVED) {
    if (exists(`work/${slug}.html`)) offenders.push(`work/${slug}.html is back in the published tree`);
    if (exists(`assets/practice-clarity/practice-clarity-${slug}.pdf`)) {
      offenders.push(`assets/practice-clarity/practice-clarity-${slug}.pdf is back in the published tree`);
    }
    if (!new RegExp(`^/work/${slug}/\\s+/work/\\s+301`, "m").test(redirects)) {
      offenders.push(`_redirects no longer sends /work/${slug}/ to /work/`);
    }
  }

  const stripComments = (body) =>
    body.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
  const counting = /\b(of the six|all six|other five|six (finished|fictional|cases|practices|documents|sites|answers)|the six (cases|documents|sites|practices))\b/i;
  for (const [rel, raw] of publishedBodies) {
    const body = stripComments(raw);
    for (const [slug, name] of ARCHIVED) {
      if (body.includes(`/work/${slug}`) || body.includes(`practice-clarity-${slug}`)) {
        offenders.push(`${rel} links to the archived ${name} case`);
      }
      if (new RegExp(`\\b${name}\\b`).test(body)) offenders.push(`${rel} names the archived ${name} case`);
    }
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    const match = body.match(counting);
    if (match) offenders.push(`${rel} still counts the collection as six: "${match[0]}"`);
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return `${FLAGSHIPS.length} flagships · ${ARCHIVED.length} archived cases redirected and unreferenced`;
});

check("Founder video", "Nothing renders until a real recording is configured, and a video carries captions", () => {
  /* 17 September 2026. The home page is prepared for a 60–90 second founder
     video. Until _data/founder.yml names a real file or link, nothing about a
     video may appear; a self-hosted file must come with captions. */
  const founder = read("_data/founder.yml");
  const field = (name) => ((founder.match(new RegExp(`^  ${name}:\\s*"?([^"\\n]*)"?`, "m")) || [])[1] || "").trim();
  const file = field("file");
  const captions = field("captions");
  if (file) {
    assert(captions, "_data/founder.yml names a video file but no captions file");
    assert(exists(file.replace(/^\//, "")), `the founder video ${file} is not in the repository`);
    assert(exists(captions.replace(/^\//, "")), `the founder video captions ${captions} are not in the repository`);
  }
  const include = read("_includes/founder-media.html");
  assert(/fv\.file and fv\.file != ""/.test(include), "founder-media.html no longer guards the video on a configured file");
  assert(/include founder-media\.html/.test(homePage), "index.html no longer renders the founder media include");
  return file ? `video configured: ${file}` : "no video configured — the portrait renders, and no video link appears";
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

check("Analytics", "Google Analytics is configured in one place and waits for consent", () => {
  const config = read("_config.yml");
  const include = read("_includes/analytics.html");
  const consent = read("assets/js/analytics-consent.js");

  const declared = /ga4_measurement_id:\s*"([^"]*)"/.exec(config);
  assert(declared, "_config.yml no longer declares analytics.ga4_measurement_id");
  const id = declared[1];

  /* Unconfigured is a valid state and everything below is moot in it. */
  if (id === "") return "no measurement ID configured — nothing is emitted";

  assert(/^G-[A-Z0-9]+$/.test(id), `analytics.ga4_measurement_id is "${id}", which is not a GA4 measurement ID`);

  /* 1. One place. The ID belongs to the config; a template or a script that
        carries its own copy is a second place to forget. */
  const carriers = publishedSources.filter(
    (rel) => rel !== "_config.yml" && publishedBodies.get(rel).includes(id)
  );
  assert(carriers.length === 0, `the measurement ID is written into:\n${carriers.join("\n")}`);
  assert(!consent.includes(id), "assets/js/analytics-consent.js hardcodes the measurement ID");
  assert(
    /site\.analytics\.ga4_measurement_id/.test(include),
    "_includes/analytics.html no longer reads the measurement ID from _config.yml"
  );

  /* 2. The studio site only. The concept sites, the deployment packages and
        the shared components are separate builds; this property measures
        alexanderwatson.co.uk and must not appear in any of them. */
  const strays = [];
  for (const dir of ["_concepts", "_deploy", "_shared"]) {
    if (!exists(dir)) continue;
    for (const file of walk(path.join(ROOT, dir), () => true)) {
      let body;
      try { body = fs.readFileSync(file, "utf8"); } catch { continue; }
      if (body.includes(id) || /googletagmanager\.com/.test(body)) {
        strays.push(path.relative(ROOT, file));
      }
    }
  }
  assert(strays.length === 0, `this GA4 property reached files outside the studio site:\n${strays.slice(0, 10).join("\n")}`);

  /* 3. Nothing from Google is requested until a visitor has allowed it. The
        template must not contain a Google host at all — the tag is injected
        by the consent script, which is the only reason a first visit makes no
        request and sets no cookie. */
  /* Strip the Liquid comment first: this guard tests what the template emits,
     not the note that explains why it emits nothing. */
  const includeCode = include.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
  assert(
    !/googletagmanager\.com|google-analytics\.com/.test(includeCode),
    "_includes/analytics.html loads a Google host directly — the tag must be injected only after consent"
  );
  assert(
    /function load\(\)[\s\S]*?googletagmanager\.com/.test(consent),
    "the consent script no longer injects gtag.js from inside its load() function"
  );
  assert(
    /if \(loaded \|\| !measurable\) return;/.test(consent),
    "load() no longer refuses to run off a configured host — the production guard is gone"
  );
  assert(
    /choice === "granted"\) load\(\)/.test(consent),
    "the consent script no longer requires a stored \"granted\" choice before loading"
  );
  assert(
    /HOSTS\.indexOf\(window\.location\.hostname\) !== -1/.test(consent),
    "the host allowlist is no longer checked against the page's own hostname"
  );

  if (hasSite) {
    for (const file of walk(SITE, (f) => /\.html$/.test(f))) {
      const body = fs.readFileSync(file, "utf8");
      assert(
        !/googletagmanager\.com|google-analytics\.com/.test(body),
        `${path.relative(SITE, file)} ships a Google host in its HTML — the built page must request nothing until consent`
      );
    }
  }

  /* 4. Nothing typed may reach it, which is the same promise the cookieless
        provider is held to above. */
  const consentCode = consent.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const [pattern, what] of [
    [/\.value\b/, "reads a field value"],
    [/FormData/, "reads form data"],
    [/\.elements\b/, "reads form elements"],
  ]) {
    assert(!pattern.test(consentCode), `assets/js/analytics-consent.js ${what} — analytics must never see what somebody typed`);
  }

  /* 5. The policy has to permit what consent will cause, or the beacon is
        reported today and blocked the day the header is enforced. */
  const csp = read("netlify.toml");
  for (const [directive, host] of [
    ["script-src", "https://www.googletagmanager.com"],
    ["connect-src", "https://*.google-analytics.com"],
  ]) {
    const rule = new RegExp(`${directive}[^;"]*${host.replace(/[.*]/g, "\\$&")}`);
    assert(rule.test(csp), `netlify.toml does not permit ${host} in ${directive} — the GA4 beacon would be blocked`);
  }

  /* 6. The privacy notice has to describe what is actually configured. */
  const privacy = read("_pages/privacy.html");
  assert(
    /Google Analytics/.test(privacy),
    "/privacy/ does not mention Google Analytics while a measurement ID is configured"
  );
  assert(
    !/sets no cookies of its own and uses no analytics/.test(privacy.split("{%- else %}")[0]),
    "/privacy/ still claims the site uses no analytics in the branch that renders when it does"
  );

  const hosts = [...config.matchAll(/^\s{4}- ([a-z0-9.-]+)\s*$/gm)].map((m) => m[1]);
  return `${id} · ${hosts.length} measurable host(s) · injected on consent only`;
});

check("Other services", "The secondary page stays secondary, and its rate is set in one place", () => {
  /* 24 September 2026. /other-services/ lists smaller, adjacent work. It must
     not write a figure of its own, promise search results, offer paid
     advertising, or stop pointing back to the main service. */
  const page = read("other-services.html");
  const offenders = [];
  assert(HOURLY_RATE !== null, "_data/purchasing.yml has no hourly_rate");
  assert(HOURLY_RATE === "£XX" || HOURLY_RATE === "" || HOURLY_RATE_SET,
    `hourly_rate is "${HOURLY_RATE}" — set it as a single amount such as "£45", or leave it as "£XX"`);
  if (/£/.test(page)) offenders.push("writes a £ figure itself instead of rendering hourly_rate");
  if (!/purchasing[\s\S]{0,40}hourly_rate|cfg\.hourly_rate/.test(page)) offenders.push("does not render hourly_rate from the data file");
  if (!/contains "XX"/.test(page)) offenders.push("no longer hides the unset £XX placeholder");
  if (!/'\/service\/'/.test(page)) offenders.push("does not link back to the main service");
  const promises = [
    [/page one|first page of google|top of google|guaranteed? (rankings?|results|traffic)|rank(ing)? guarantee/i, "promises search results"],
    [/\b(we|I) (manage|run|offer) (PPC|paid ads|google ads)/i, "offers paid advertising"],
    [/\bunlimited\b/i, "promises something unlimited"],
    /* 25 September 2026. SEO here is a bounded setup and a later review
       (DECISION-REGISTER.md, "SEO setup and assessment"), never SEO by the month. */
    [/SEO (retainer|packages?|plans?)|\bmonthly SEO|per month|a month\b|backlink/i, "sells SEO as a monthly or packaged service"],
  ];
  for (const [pattern, what] of promises) if (pattern.test(page)) offenders.push(what);
  if (!/nobody can promise a ranking/i.test(page)) offenders.push("the SEO item no longer says a ranking cannot be promised");
  if (!/review is booked separately/i.test(page)) offenders.push("the SEO item no longer keeps the later review as separate, agreed work");
  /* 25 September 2026. The search visibility report is a plain-English reading
     of the evidence: never live rankings or guaranteed outcomes, and never
     described as software or an internal system. */
  if (/(live|real-time|real time) rankings?|exact (google )?position|guaranteed? (improvement|enquiries|traffic|results)/i.test(page)) offenders.push("the SEO item overstates what the report can show");
  if (/dashboard|software|localStorage|\bCSV\b|\bAI\b|operating system/i.test(page)) offenders.push("the page describes internal tooling instead of the report");
  if (!/search visibility report/i.test(page)) offenders.push("the SEO item no longer names the search visibility report");
  if (!/leave things alone/i.test(page)) offenders.push("the SEO item no longer allows that the right next step may be to change nothing");
  assert(offenders.length === 0, `other-services.html — ${offenders.join("; ")}`);
  return HOURLY_RATE_SET ? `hourly rate ${HOURLY_RATE}, approved from purchasing.yml` : "hourly rate not yet set — the page shows no figure";
});

check("Other services", "Every \"Tell me what you need\" reaches a short, working enquiry form", () => {
  /* 24 September 2026. The smaller-work enquiry: a native Netlify form, three
     required questions, nothing about domains, photographs, brand history or
     budget, and a thank-you page that exists. */
  const page = read("other-services.html");
  const ctas = [...page.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>\s*Tell me what you need/g)].map((m) => m[1]);
  assert(ctas.length >= 2, `expected at least two "Tell me what you need" calls to action, found ${ctas.length}`);
  for (const href of ctas) assert(/\/other-services\/enquiry\//.test(href), `a "Tell me what you need" points at ${href}`);
  assert(!/mailto:/.test(page), "other-services.html still uses a mailto link");

  const enquiry = read("other-services-enquiry.html");
  const form = (enquiry.match(/<form[\s\S]*?<\/form>/) || [""])[0];
  assert(form, "the smaller-work enquiry has no form");
  const name = (form.match(/<form[^>]*\bname="([^"]+)"/) || [])[1];
  assert(name, "the form has no name");
  assert(new RegExp(`name="form-name" value="${name}"`).test(form), "form-name does not match the form's name");
  assert(/<form[^>]*\bmethod="POST"/.test(form) && /<form[^>]*\bdata-netlify="true"/.test(form), "the form is not a POST Netlify form");
  const honeypot = (form.match(/netlify-honeypot="([^"]+)"/) || [])[1];
  assert(honeypot && new RegExp(`name="${honeypot}"`).test(form), "the honeypot field named by netlify-honeypot does not exist");
  assert(/action="\{\{ '\/other-services\/thanks\/'/.test(form), "the form action is not /other-services/thanks/");
  const required = [...form.matchAll(/<(?:input|textarea|select)\b[^>]*\bname="([^"]+)"[^>]*\brequired\b/g)].map((m) => m[1]).sort();
  assert(required.join(",") === "email,name,need", `required fields are ${required.join(", ")} — expected name, email and need only`);
  assert(!/type="file"/.test(form), "the enquiry asks for an upload");
  assert(!/name="(domain|photos?|budget|brandHistory)"/.test(form), "the enquiry asks for something that belongs to the main enquiry");
  for (const id of [...form.matchAll(/<(?:input|textarea|select)\b[^>]*\bid="([^"]+)"/g)].map((m) => m[1])) {
    assert(new RegExp(`<label[^>]*for="${id}"`).test(form), `field ${id} has no label`);
  }
  const thanks = read("other-services-thanks.html");
  assert(/^noindex:\s*true/m.test(thanks), "the thank-you page is indexable");
  assert(/other-services\/enquiry/.test(read("_pages/privacy.html")), "/privacy/ does not describe the smaller-work enquiry form");
  return `${ctas.length} calls to action → /other-services/enquiry/ · ${name} → /other-services/thanks/`;
});

check("Search", "One local page, form routes kept out of search, and no street address published", () => {
  /* 24 September 2026. The local + niche intent has exactly one page. Town
     clones are the doorway-page pattern this site does not use. */
  const localPages = publishedSources.filter((rel) => /^website-design-.*\.html$/.test(rel));
  assert(localPages.length === 1, `expected one local page, found ${localPages.length}: ${localPages.join(", ")}`);
  const local = read(localPages[0]);
  assert(/training as a counsellor/.test(local), "the local page no longer describes the counselling training accurately");
  assert(!/qualified (counsellor|therapist)|(registered|accredited) (counsellor|therapist|member)/i.test(local), "the local page claims a credential");
  for (const rel of ["other-services-enquiry.html", "other-services-thanks.html"]) {
    const body = read(rel);
    assert(/^noindex:\s*true/m.test(body) && /^sitemap:\s*false/m.test(body), `${rel} is not noindex and out of the sitemap`);
  }
  const schema = read("_includes/schema.html");
  assert(!/streetAddress|postalCode/.test(schema), "structured data publishes a street address or postcode");
  const legal = read("_data/legal.yml");
  const address = (legal.match(/^\s*address:\s*"([^"]+)"/m) || [])[1];
  if (address) {
    for (const [rel, body] of publishedBodies) {
      if (LEGAL_SURFACE.has(rel)) continue;
      assert(!body.includes(address), `${rel} publishes the business address outside the legal pages`);
    }
  }
  return `${localPages[0]} · form routes noindex · locality only in structured data`;
});

check("Information architecture", "One resource section, one front door", () => {
  /* The Journal index and the Library index folded into /guidance/ in August
     2026. The nav must offer exactly one way in, the retired indexes must
     redirect rather than 404, and nothing may link at /blog/ any more. */
  const header = read("_includes/header.html");
  const navLinks = [...header.matchAll(/<li><a href="\{\{ '([^']+)'/g)].map((m) => m[1]);
  /* Five since 24 September 2026, when /other-services/ joined, on Alexander's
     instruction, as a secondary page for smaller work. */
  assert(navLinks.length === 5, `expected five primary nav links, found ${navLinks.length}`);
  assert(navLinks.includes("/guidance/"), "the navigation does not offer /guidance/");
  assert(navLinks.includes("/other-services/"), "the navigation does not offer /other-services/");
  assert(navLinks.indexOf("/service/") < navLinks.indexOf("/other-services/"),
    "Other services sits before the main service in the navigation");
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
 * 4b. The product: the Practice Fundamentals first, then one page
 *
 * 17 September 2026, the Practice Fundamentals Intake System. The public
 * journey is six steps — enquire, reserve the project, complete the intake,
 * approve the direction, website build, review and launch — with two
 * consolidated feedback stages. The client receives the 11-page Practice
 * Fundamentals and one complete responsive page. "Practice Clarity" now names
 * only the published principles and the portfolio Blueprints. See
 * docs/operations/practice-fundamentals-intake-system.md.
 * ------------------------------------------------------------------ */

const JOURNEY_STEPS = [
  "Enquire",
  "Reserve the project",
  "Complete the intake",
  "Approve the direction",
  "Website build",
  "Review and launch",
];

check("Product scope", "The journey is six steps, with the Practice Fundamentals approved before the build", () => {
  assert(/id="yours-to-keep"/.test(servicePage), 'service.html no longer carries the "Yours to keep" section');
  assert(/id="practice-fundamentals"/.test(servicePage), 'service.html no longer carries the Practice Fundamentals section');
  for (const term of ["Practice Fundamentals", ...JOURNEY_STEPS]) {
    assert(servicePage.includes(term), `service.html does not name "${term}" in the journey`);
    assert(homePage.includes(term), `index.html does not name "${term}" in the journey`);
  }
  const purchase = read(PURCHASE_PAGE);
  assert(/id="keep"/.test(purchase), `${PURCHASE_PAGE} no longer carries the handover section`);
  assert(/id="feedback"/.test(purchase), `${PURCHASE_PAGE} no longer explains the two feedback stages`);
  assert(/Practice Fundamentals, eleven pages/.test(purchase), `${PURCHASE_PAGE} does not name the eleven-page Practice Fundamentals in the published scope`);
  assert(/One complete, responsive page/.test(purchase), `${PURCHASE_PAGE} does not state the one-page scope`);
  assert(/Additional pages/.test(purchase), `${PURCHASE_PAGE} does not say additional pages are quoted separately`);
  assert(/Corrections never use up a stage/.test(purchase), `${PURCHASE_PAGE} does not say corrections never use up a feedback stage`);
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    const text = body.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
    if (/Direction Note/.test(text)) offenders.push(`${rel} still describes the retired Direction Note`);
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return "six steps on the home and cost pages; the Fundamentals, one page and two feedback stages in the published scope";
});

check("Product scope", "The retired delivery model has not come back", () => {
  /* The model this replaced: up to five core pages, a Practice Clarity
     document with one revision, two website revision rounds, a browser-only
     Website Content Questionnaire, the balance on approval of the finished
     website, and factual updates inside Website Care. The principle articles in
     _guides/ are the method's own writing and may still mention a "Practice
     Clarity document" in image descriptions; they sell nothing. */
  const retired = [
    [/up to five (core )?pages/i, "up to five pages"],
    [/five core pages/i, "five core pages"],
    [/pages beyond the five/i, "pages beyond the five"],
    [/consolidated revision/i, "a consolidated revision"],
    [/revision rounds?\b/i, "revision rounds"],
    [/two rounds of changes/i, "two rounds of changes"],
    [/Website Content Questionnaire/, "the Website Content Questionnaire"],
    /* Whitespace-tolerant: the phrase slipped through once wrapped across two
       lines of an indented paragraph, which is exactly how it would come back. */
    [/Practice\s+Clarity\s+document/, "the Practice Clarity document as the deliverable"],
    [/approved? the finished website/i, "the balance or approval tied to the finished website"],
    [/when your website is approved/i, "the balance tied to website approval"],
    [/factual updates are included/i, "factual updates inside Website Care"],
    [/\bno quota\b/i, "unquoted content updates inside Website Care"],
    [/services\/practice-website\/questionnaire/, "a link to the retired questionnaire route"],
  ];
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    const text = body.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
    for (const [pattern, what] of retired) {
      const hit = text.match(pattern);
      if (hit) offenders.push(`${rel} — ${what} ("${hit[0]}")`);
    }
  }
  assert(!/^payment_sentence:.*\blaunch\b/m.test(purchasingYml), "payment_sentence still ties the balance to launch");
  assert(/^payment_sentence:.*Practice Fundamentals/m.test(purchasingYml), "payment_sentence does not tie the balance to approving the Practice Fundamentals");
  assert(offenders.length === 0, offenders.join("\n"));
  return `${retired.length} retired formulations absent from published source`;
});

check("Product scope", "The retired product name has not come back", () => {
  /* "Therapist Website" was the product name until 13 September 2026. Two
     further phrases were guarded here while the offer promised an identity
     package; since the 17 September simplification that package is gone and
     stationery is excluded again, so only the old name is guarded. */
  const retired = [
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

check("Product scope", "The identity is bounded, and no elaborate package is promised", () => {
  /* The offer has to be finite. Since 17 September 2026 the identity is the one
     set out in the Practice Fundamentals — a logo or wordmark, colours,
     typography and photography direction. Competing concepts, print design,
     stationery and social media templates are named as excluded, and supplier
     briefs are not made. */
  const overclaims = [
    [/unlimited (templates|design|applications|assets|changes|revisions)/i, "promises an unlimited amount of design or change"],
    [/ongoing design support/i, "promises ongoing design support"],
    [/everything you (could ever )?need/i, "promises everything they need"],
    [/all your (marketing|print|brand) materials/i, "promises all their materials"],
    [/any (print|printed) item you/i, "promises any printed item"],
    [/letterhead|email signature|business card|supplier briefs?/i, "promises the retired stationery templates or supplier briefs"],
  ];
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    if (rel.startsWith("_guides/") || rel.startsWith("_posts/")) continue;
    for (const [pattern, what] of overclaims) {
      /* /other-services/ offers business cards and print as separately quoted
         work (24 September 2026). That is the page saying what is outside the
         identity, not the identity promising it; every other guard still applies. */
      if (rel === "other-services.html" && /letterhead/.test(pattern.source)) continue;
      if (pattern.test(body)) offenders.push(`${rel} — ${what}`);
    }
  }
  const purchase = read(PURCHASE_PAGE);
  assert(/logo or wordmark/i.test(purchase), `${PURCHASE_PAGE} no longer says what the identity includes`);
  assert(/competing logo concepts/i.test(purchase), `${PURCHASE_PAGE} no longer says competing logo concepts are outside the scope`);
  assert(/social media templates/i.test(purchase), `${PURCHASE_PAGE} no longer says social media templates are outside the scope`);
  assert(offenders.length === 0, offenders.join("\n"));
  return "no open-ended promise; the identity is bounded and the exclusions are published";
});

check("Product scope", "The identity reads as a principal part of the service, not an extra", () => {
  /* 19 September 2026. The offer is a Practice Identity & Website, and for a
     long time the site described it as a website with some thinking in front of
     it: the home page's h1 named only the website, its title and description
     said "Websites for therapists", and the identity appeared as a trailing
     clause on one list item. A therapist reading it had no way to know they
     were buying a logo, a colour system and typography at all.

     This is the check that stops it sliding back, because it slides back one
     harmless-looking edit at a time — a shortened headline, a tightened
     description, a list item trimmed for length.

     It asserts presence and prominence, never particular sentences: the copy is
     meant to be rewritten. What it will not allow is the identity disappearing
     from the places a reader meets first. */
  const IDENTITY = /\b(identity|logo or wordmark|colour system|visual direction)\b/i;

  /* The home page, above everything else a reader scrolls past. */
  const fm = frontMatter(homePage);
  for (const [key, value] of [
    ["title", frontMatterValue(homePage, "title")],
    ["description", frontMatterValue(homePage, "description")],
  ]) {
    assert(
      IDENTITY.test(value),
      `index.html ${key} describes the service without naming the identity: "${value}"`
    );
  }
  const h1 = (homePage.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
  assert(
    IDENTITY.test(h1),
    `the home page headline names only the website: "${h1.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()}"`
  );

  /* The band that carries the message, and the three plates that show it
     rather than explaining it. */
  assert(/More than a website/.test(homePage), "index.html no longer carries the \"More than a website\" band");
  assert(
    /sofia-marin-identity-visual\.webp/.test(homePage) && /sofia-marin-identity-words\.webp/.test(homePage),
    "index.html no longer shows the identity pages beside the website; the progression is text-only again"
  );
  /* Concept imagery carries its disclosure wherever it appears. */
  assert(
    /fictional practice/i.test(homePage),
    "index.html shows concept work without saying the practice is fictional"
  );

  /* The cost page has to show the work as five parts, with the identity its
     own part rather than a line inside the document. */
  for (const stage of [
    "Practice clarity",
    "Visual identity",
    "Website design and build",
    "Assets and guidance",
    "Launch, ownership and support",
  ]) {
    assert(servicePage.includes(stage), `service.html does not name the stage "${stage}"`);
  }

  /* What a client leaves with, on both pages that promise it. */
  const purchase = read(PURCHASE_PAGE);
  for (const [rel, body] of [["service.html", servicePage], [PURCHASE_PAGE, purchase]]) {
    assert(
      /printer|another designer|future designer|supplier/i.test(body),
      `${rel} no longer says the assets can be handed to somebody else`
    );
  }

  /* The identity is a foundation that can develop — never one that lasts
     unchanged. A promise about the future is the one thing here nobody can
     keep. */
  const forLife = /(identity|brand)[^.]{0,80}\b(for life|forever|for ever|never need(s)? (to be )?chang|last(s)? a lifetime|permanent)\b/i;
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    if (forLife.test(body)) offenders.push(`${rel} promises an identity that never changes`);
  }
  assert(offenders.length === 0, offenders.join("\n"));

  return "named in the home page title, description and headline; five stages on the cost page; handover stated on both";
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
  /* The founding split is weighted — £100 to reserve the place, £395 once the
     direction is approved — and the obvious way to sell that is "pay nothing
     until you're happy". That formulation makes the balance conditional on a
     subjective state. Since 17 September 2026 the milestone is the client's
     written approval of the direction (the Practice Fundamentals and visual
     direction), before the build; clause 3 and clause 11 define it, and clause
     11 still bounds launch approval so a finished website cannot sit
     indefinitely. These patterns stop the softer version growing back. */
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
  assert(/Direction approval/.test(terms), "clause 11 does not define direction approval, which triggers the balance");
  assert(
    /built only once the balance\s+has been received/.test(terms),
    "clause 3 no longer says the build begins only once the balance has been received"
  );
  assert(
    /ten working days/i.test(terms) && /within the agreed scope/i.test(terms),
    "clause 11 no longer bounds launch approval — a completed website could sit unapproved indefinitely"
  );
  assert(offenders.length === 0, offenders.join("\n"));
  return `${banned.length} patterns absent; the balance follows direction approval; clause 11 bounds launch approval`;
});

check("Founding offer", "The stages are described as one piece of work", () => {
  /* The intake, the Practice Fundamentals and the website are one job. A
     page that lists them as three deliverables invites the client to ask which
     they can drop, which is the one judgement they are least able to make. */
  assert(/what-you-are-buying/.test(servicePage), "service.html no longer carries the four-stage explanation");
  return "stages named, one piece of work";
});

check("Commercial architecture", "The Practice Identity & Website is the only route that takes money", () => {
  assert(/purchasing\.price_display/.test(purchasePage), "the purchase page does not render the price");
  assert(/practice-website-buy\.html/.test(purchasePage), "the purchase page does not include the buy component");
  assert(/Practice Identity (&|&amp;) Website/.test(purchasePage), "the purchase page does not name the Practice Identity & Website");
  assert(/\/services\/practice-website\//.test(servicePage), "service.html does not link to the purchase page");
});

/* ------------------------------------------------------------------ *
 * 5. Practice Care (Website Care until 24 September 2026)
 * ------------------------------------------------------------------ */

check("Practice Care", "Included for twelve months, then optional and annual, rendered from data", () => {
  let described = 0;
  for (const rel of [PURCHASE_PAGE, "service.html"]) {
    const body = read(rel);
    assert(body.includes("Practice Care"), `${rel} does not mention Practice Care`);
    assert(
      /(first (twelve months|year)|twelve months of Practice Care)/i.test(body),
      `${rel} does not say the first year of Practice Care is included`
    );
    assert(/practice_care\.annual/.test(body), `${rel} does not render practice_care.annual`);
    assert(/a year/.test(body), `${rel} does not say Practice Care is charged a year`);
    assert(/optional/i.test(body), `${rel} does not say Practice Care is optional after the first year`);
    assert(/say yes/i.test(body), `${rel} does not say it continues only if the client says yes`);
    assert(/hourly_rate/.test(body), `${rel} does not say what additional work costs`);
    described += 1;
  }
  for (const rel of ["_pages/service-terms-practice-website.html", "_pages/terms.html"]) {
    assert(/practice_care\.annual/.test(read(rel)), `${rel} does not render practice_care.annual`);
  }
  return `${described} pages · terms agree`;
});

check("Practice Care", "The retired £29-a-month Website Care appears nowhere published", () => {
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    for (const [pattern, what] of [
      [/Website\s+Care/, "names Website Care"],
      [/website_care/, "reads the retired website_care data"],
      [/£\s?29\b/, "shows £29"],
      [/a month (after|if you want)|per month|no minimum term/i, "describes care as monthly"],
    ]) {
      const hit = body.match(pattern);
      if (hit) offenders.push(`${rel}:${lineAt(body, hit.index)} — ${what}`);
    }
  }
  assert(offenders.length === 0, offenders.join("\n"));
  return `${publishedBodies.size} published files clear`;
});

check("Practice Care", "Bounded: no development time, ongoing SEO or unlimited support inside it", () => {
  const surfaces = [PURCHASE_PAGE, "service.html", "_pages/service-terms-practice-website.html"];
  for (const rel of surfaces) {
    const body = read(rel);
    assert(/development time/i.test(body), `${rel} does not say Practice Care includes no development time`);
    assert(/ongoing SEO/i.test(body), `${rel} does not exclude ongoing SEO from Practice Care`);
    assert(/unlimited\s+support/i.test(body), `${rel} does not exclude unlimited support from Practice Care`);
    assert(!/unlimited (updates|changes|edits)/i.test(body), `${rel} promises unlimited updates`);
    assert(!/same[- ]day/i.test(body), `${rel} promises same-day work`);
  }
  return `${surfaces.length} surfaces bounded`;
});

check("Practice Care", "Claims only what the infrastructure supports", () => {
  /* Care is a paid promise now that it is inside the price, so it must not
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
  assert(offenders.length === 0, `Practice Care claims something unsupported — ${offenders.join("; ")}`);
  return "no monitoring or backup guarantee claimed";
});

check("Practice Care", "Care keeps the build working, and content changes are outside it", () => {
  /* 17 September 2026. Website Care covers genuine technical faults and support
     for the original build. Additions, redesigns and content changes are
     outside it. The three places that describe Care must say so, and none may
     promise free content updates. */
  const surfaces = [PURCHASE_PAGE, "service.html", "_pages/service-terms-practice-website.html"];
  for (const rel of surfaces) {
    const body = read(rel);
    assert(/technical/i.test(body), `${rel} does not describe Practice Care\'s technical upkeep`);
    assert(/content changes/i.test(body), `${rel} does not say content changes are outside Practice Care`);
    assert(!/Keeping your fees, availability/i.test(body), `${rel} still lists fee and availability updates as part of Care`);
    assert(!/no quota and no charge/i.test(body), `${rel} still promises free content updates`);
  }
  return `${surfaces.length} surfaces agree`;
});

check("Practice Care", "No subscription is built or activated", () => {
  assert(/subscriptions_enabled:\s*false/.test(purchasingYml), "_data/purchasing.yml does not set subscriptions_enabled: false");
  const offenders = [];
  /* Care sits inside the £995 for its first twelve months, so the checkout
     action and the words "Website Care" now legitimately appear together —
     but only where the surrounding sentence says it is included. A checkout
     action beside Care described any other way would be selling a
     subscription this repository has not built. */
  for (const [rel, body] of publishedBodies) {
    let index = body.indexOf("Practice Care");
    while (index !== -1) {
      const block = body.slice(Math.max(0, index - 1200), index + 1200);
      const hasAction = /https:\/\/buy\.stripe\.com|practice-website-buy|data-purchase-action/.test(block);
      const saysIncluded = /includ(ed|es|ing)/i.test(block);
      if (hasAction && !saysIncluded) {
        offenders.push(`${rel}:${lineAt(body, index)} places a checkout action beside Practice Care without saying it is included`);
      }
      index = body.indexOf("Practice Care", index + 1);
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
  assert(/>Tell me about your practice</.test(buyMarkup), "the component does not offer the written route");
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
    [DISCOVERY, read(DISCOVERY)],
  ];
  const cfgAlias = {
    "/service-terms/practice-website/": "cfg.urls.service_terms",
    "/cancellation-and-refunds/": "cfg.urls.cancellation",
    "/privacy/": "cfg.urls.privacy",
  };
  for (const [rel, body] of surfaces) {
    for (const [route] of JOURNEY_LEGAL) {
      /* The questionnaire links to the privacy notice, which is the one a
         client needs at the moment they are typing. The purchase surfaces
         carry the terms and the cancellation information. */
      if (rel === DISCOVERY && route !== "/privacy/") continue;
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
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)/gim)].map((m) => m[1]);
  for (const route of PRIVATE_ROUTES) {
    /* A Disallow for a parent path (Disallow: /client/) covers its children. */
    assert(
      disallowed.some((rule) => route.startsWith(rule)),
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
 * 12b. The private client pages stay private
 * ------------------------------------------------------------------ */

check("Private routes", "The client pages declare noindex and stay out of the sitemap at source", () => {
  for (const [rel, body] of [[DISCOVERY, read(DISCOVERY)], [PHOTO_BRIEF, photoBrief]]) {
    assert(/^noindex:\s*true\s*$/m.test(frontMatter(body)), `${rel} does not set noindex: true`);
    assert(/^sitemap:\s*false\s*$/m.test(frontMatter(body)), `${rel} does not set sitemap: false`);
  }
  const head = read("_includes/head.html");
  assert(/page\.noindex[\s\S]{0,80}noindex, nofollow/.test(head), "head.html no longer turns noindex: true into a noindex, nofollow robots tag");
  const toml = read("netlify.toml");
  assert(
    /for = "\/client\/\*"[\s\S]{0,160}X-Robots-Tag = "noindex, nofollow"/.test(toml),
    "netlify.toml does not send X-Robots-Tag: noindex, nofollow for /client/*"
  );
  return `${PRIVATE_ROUTES.length} client pages, three locks each at source`;
});

check("Private routes", "Nothing public links to the client pages", () => {
  /* Practice Discovery is reached only from the link in the welcome email.
     The only published files allowed to point at /client/ are the client pages
     themselves, the redirect table, and robots.txt. */
  const offenders = [];
  for (const [rel, body] of publishedBodies) {
    if (CLIENT_PAGES.includes(rel)) continue;
    const text = body.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "");
    if (/\/client\//.test(text)) offenders.push(`${rel} links to or names /client/`);
    if (/urls\.(intake|photography)/.test(text)) offenders.push(`${rel} renders a client-page URL`);
  }
  for (const shared of ["_includes/header.html", "_includes/footer.html", "_layouts/default.html"]) {
    if (/\/client\//.test(read(shared))) offenders.push(`${shared} links to /client/`);
  }
  assert(offenders.length === 0, offenders.join("\n"));
});

/* ------------------------------------------------------------------ *
 * 13. The enquiry fit check and the intake
 *
 * 17 September 2026. The browser-only Website Content Questionnaire was
 * retired. Its five checks are replaced by the checks below: the fit check on
 * the enquiry form, the Tally handoff on /client/intake/, the photography
 * brief, and the internal documents the intake is built and run from.
 * ------------------------------------------------------------------ */

check("Enquiry fit check", "The five questions are on the enquiry form, and the conditional field is wired", () => {
  const questions = [
    "What do you do, and where?",
    "Would a single, carefully designed page give you what you need for now?",
    "Do you already own a domain name?",
    "Do you have recent photographs of yourself, or could you arrange some within approximately two weeks?",
    "Is there a particular date you need the website by?",
  ];
  for (const q of questions) assert(enquiryPage.includes(q), `${ENQUIRY} does not ask "${q}"`);
  for (const answer of [
    "No, I need additional pages or functionality",
    "Yes, and I can access the account",
    "I could arrange them",
  ]) {
    assert(enquiryPage.includes(answer), `${ENQUIRY} is missing the answer "${answer}"`);
  }
  assert(/data-reveals="f-onepage-more-wrap"[^>]*>|aria-controls="f-onepage-more-wrap"/.test(enquiryPage), "the \"No\" answer does not control the follow-up field");
  assert(/id="f-onepage-more-wrap"/.test(enquiryPage), "the follow-up field container is missing");
  assert(/data-studio-enquiry novalidate/.test(enquiryPage), "the enquiry form does not hand validation to its script");
  assert(/data-form-errors/.test(enquiryPage) && /role="alert"/.test(enquiryPage), "the enquiry form has no announced error summary");
  assert(!/<form[^>]*\baction=/i.test(enquiryPage), "the enquiry form posts to a server");
  assert(!/netlify|data-netlify/i.test(enquiryPage.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "")), "the enquiry form has been wired to a form backend");
  return `${questions.length} questions; follow-up wired; no backend`;
});

check("Enquiry fit check", "Every answer reaches the prepared email and its copy-and-paste fallback", () => {
  const js = read("assets/js/contact-enquiry.js");
  for (const name of ["practice", "onePage", "onePageNeeds", "domain", "photos", "neededBy", "message", "currentWebsite"]) {
    assert(new RegExp(`value\\("${name}"\\)`).test(js), `contact-enquiry.js does not put "${name}" in the email`);
    assert(new RegExp(`name="${name}"`).test(enquiryPage), `${ENQUIRY} has no field named "${name}"`);
  }
  assert(/prepared\.value\s*=/.test(js) && /mailto:/.test(js), "the script does not fill both the email and the fallback");
  assert(/buildBody\(\)/.test(js), "the email body is not built in one place");
  assert(/fetch\(|XMLHttpRequest|sendBeacon/.test(js) === false, "contact-enquiry.js transmits something");
  assert(/Nothing is booked until/.test(enquiryPage), "the confirmation does not say nothing is booked before acceptance and the deposit");
  assert(/I read it myself/.test(enquiryPage), "the confirmation does not say the enquiry is read personally");
});

check("Enquiry fit check", "Every field is labelled and every fieldset has a legend", () => {
  const form = (enquiryPage.match(/<form[\s\S]*?<\/form>/) || [""])[0];
  const fields = [...form.matchAll(/<(input|select|textarea)\b([^>]*)>/g)].filter((m) => !/type="hidden"/.test(m[2]));
  assert(fields.length >= 14, `only ${fields.length} form controls found on the enquiry form`);
  const unlabelled = [];
  for (const match of fields) {
    const attrs = match[2];
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    if (id && new RegExp(`<label[^>]*for="${id}"`).test(form)) continue;
    const before = form.slice(0, match.index);
    if (before.lastIndexOf("<label") > before.lastIndexOf("</label>")) continue;
    unlabelled.push((attrs.match(/name="([^"]+)"/) || [])[1] || match[1]);
  }
  assert(unlabelled.length === 0, `fields with no label: ${unlabelled.join(", ")}`);
  const fieldsets = [...form.matchAll(/<fieldset[^>]*>([\s\S]*?)<\/fieldset>/g)];
  assert(fieldsets.length >= 3, `only ${fieldsets.length} fieldsets found`);
  for (const set of fieldsets) assert(/<legend[^>]*>/.test(set[1]), "a fieldset on the enquiry form has no legend");
  const radios = form.match(/type="radio"/g) || [];
  assert(radios.length >= 9, `only ${radios.length} radio answers found`);
  return `${fields.length} controls, ${fieldsets.length} fieldsets`;
});

check("Intake", "The retired Tally intake is gone from the active tree", () => {
  /* 19 September 2026. This slot used to hold three checks guarding the Tally
     embed: that its address lived in exactly one data file, that only an
     AW-000 project reference travelled in the page address, and that the CSP
     framed tally.so and nothing else. All three are obsolete, because the
     thing they guarded no longer exists. What replaces them is the opposite
     assertion — that it has not come back — which lives with the other
     Practice Discovery checks further down.

     Kept here: the client-side script, because it is the file that shrank. It
     used to read a URL parameter and listen for cross-origin messages. It now
     reveals a print button, and it should stay that small. */
  for (const gone of [
    "client/intake.html",
    "_data/intake.yml",
    "docs/operations/tally-intake-build-spec.md",
  ]) {
    assert(!exists(gone), `${gone} is back in the active tree; the Tally intake was retired`);
  }

  const js = read("assets/js/client.js");
  const code = js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const [pattern, what] of [
    [/addEventListener\("message"/, "listens for cross-origin messages again"],
    [/URLSearchParams|location\.search/, "reads the page address again"],
    [/<iframe|\.src\s*=/, "loads an embed again"],
    [/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/, "transmits or stores something"],
    [/tally/i, "refers to Tally in code"],
  ]) {
    assert(!pattern.test(code), `assets/js/client.js ${what}`);
  }
  assert(/data-print/.test(code), "assets/js/client.js no longer reveals the photography brief's print button");

  /* The removal is documented in the comment at the top of that file, in
     netlify.toml and in _redirects. That is deliberate: a reader who finds a
     redirect from /client/intake/ should be able to learn why. */
  assert(/Tally/.test(js), "the note explaining what was removed from client.js is gone");

  return "page, data file and build specification retired; client.js is the print button only";
});

check("Intake", "Every retired intake address leads to Practice Discovery", () => {
  assert(!exists("services/practice-website-questionnaire.html"), "the retired questionnaire page is still in the published tree");
  assert(!exists("assets/js/practice-website-questionnaire.js"), "the retired questionnaire script is still published");
  const redirects = read("_redirects");
  for (const from of [
    "/client/intake/",
    "/client/intake",
    "/services/practice-website/questionnaire/",
    "/services/practice-website/questionnaire",
    "/services/straightforward-website/questionnaire/",
  ]) {
    const line = redirects
      .split("\n")
      .find((l) => !l.trim().startsWith("#") && l.trim().startsWith(from + " "));
    assert(line, `no redirect for ${from} — an old intake link would 404`);
    assert(
      /\/client\/practice-discovery\/\s+301/.test(line),
      `${from} does not redirect to /client/practice-discovery/: ${line.trim()}`
    );
  }
  const robots = read("robots.txt");
  assert(/^Disallow:\s*\/client\//m.test(robots), "robots.txt does not disallow /client/");
  return "5 retired addresses → /client/practice-discovery/";
});

check("Intake", "The photography brief carries the approved requirements and prints", () => {
  const required = [
    "looking towards the camera",
    "Both portrait and landscape",
    "Leave space around you",
    "The room, empty",
    "Daylight",
    "Staged counselling scenes",
    "anyone pretending to be a client",
    "AI-generated",
    "client paperwork",
    "With a friend and a phone",
    "With a local photographer",
    "licensed for website and marketing use",
    "doesn&rsquo;t mean a formal headshot",
  ];
  for (const phrase of required) assert(photoBrief.includes(phrase), `${PHOTO_BRIEF} is missing "${phrase}"`);
  const css = read("assets/css/studio.css");
  assert(/@media print[\s\S]{0,400}\.brief/.test(css), "studio.css has no print rules for the photography brief");
  assert(/data-print/.test(photoBrief), `${PHOTO_BRIEF} has no print action`);
  return `${required.length} requirements present`;
});

check("Intake", "The intake source, the setup runbook and the email templates are in the repository", () => {
  /* 19 September 2026: the Tally build specification was retired with the form
     it described, and this check now guards the Netlify runbook in its place.
     The question-design source survives the change and carries a banner saying
     which half of it was superseded. */
  const source = "docs/operations/practice-fundamentals-intake-system.md";
  const runbook = "docs/operations/practice-discovery-netlify-setup.md";
  const emails = "docs/operations/client-email-templates.md";
  for (const rel of [source, runbook, emails]) assert(exists(rel), `${rel} is missing`);
  assert(
    /SUPERSEDED IN PART/.test(read(source)),
    `${source} describes a Tally form and no longer says so at the top`
  );
  const runbookBody = read(runbook);
  for (const phrase of ["practice-discovery", "Forms", "notification"]) {
    assert(runbookBody.includes(phrase), `${runbook} does not cover "${phrase}"`);
  }
  const templates = (read(emails).match(/^## Template \d+/gm) || []).length;
  assert(templates === 11, `${emails} has ${templates} templates; expected 11`);
  const outOfModel = /£395 (?:when|on) (?:your )?(?:website|launch)|approved? the finished website/i;
  assert(!outOfModel.test(read(emails)), `${emails} ties the balance to the finished website`);
  return `source, runbook and ${templates} templates present`;
});

/* ------------------------------------------------------------------ *
 * 14. No therapy-client data is requested
 * ------------------------------------------------------------------ */

check("Client data", "No form asks for anything about the visitor's own clients", () => {
  /* Two forms on the site: the public enquiry, and Practice Discovery behind
     its unlisted address. Both are held to this rule, and Practice Discovery's
     own checks add the closing confirmation a client has to tick. */
  const formPages = publishedSources.filter((rel) => /<form\b/i.test(publishedBodies.get(rel)));
  assert(formPages.length >= 1, `only ${formPages.length} pages with forms found`);
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
  const discovery = read(DISCOVERY)
    .replace(/<[^>]+>/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
  assert(
    /don.t send anything identifiable or confidential about your own clients/i.test(discovery),
    `${DISCOVERY} does not tell people to leave client information out`
  );
  /* The warning has to cover the route files now take, not only the form. */
  assert(
    /no names, no session notes, no case material/i.test(discovery),
    `${DISCOVERY} no longer names what must not be sent`
  );
  const privacy = read("_pages/privacy.html");
  assert(
    /do not send client names, session notes/i.test(privacy),
    "the privacy notice does not tell people to leave client information out"
  );
  assert(/Netlify, Inc\./.test(privacy), "the privacy notice does not name the form service's legal entity");
  assert(!/Tally/i.test(privacy), "the privacy notice still names Tally, which was retired on 19 September 2026");
  assert(/data_protection\.intake_retention/.test(privacy), "the privacy notice does not state how long responses are kept");
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
  "DECISION-REGISTER.md",
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
  /* Served as a file from the repository root, not from a page's permalink. */
  routes.add("/favicon.ico");
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
  /* 24 September 2026. An image that a page renders only when the file is in
     the build — `site.static_files | where: "path", ...` with a fallback —
     may be referenced before it exists. It is reported, not failed. */
  const guarded = new Set();
  for (const [, body] of publishedBodies) {
    for (const m of body.matchAll(/site\.static_files\s*\|\s*where:\s*"path",\s*"(\/assets\/[^"]+)"/g)) guarded.add(m[1]);
  }
  const absent = [...referenced].filter((asset) => !exists(asset.replace(/^\//, "")));
  const missing = absent.filter((asset) => !guarded.has(asset)).sort();
  const pending = absent.filter((asset) => guarded.has(asset)).sort();
  assert(
    missing.length === 0,
    `${missing.length} referenced assets are missing from the repository:\n${missing.join("\n")}`
  );
  return `${referenced.size} assets` + (pending.length ? ` · ${pending.length} optional image(s) not yet added, fallback shown: ${pending.join(", ")}` : "");
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

check("Built site", "No concept website or shared component is built into the studio site", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  /* Each concept is a separate deployment on its own subdomain, versioned in
     this repository but never published from it. If one were built into
     alexanderwatson.co.uk, a fictional counsellor's fee, room, email address
     and enquiry form would appear as studio pages — and the exclusions that
     stop that are three lines in two files, which is exactly the kind of thing
     that gets removed by someone tidying up. */
  for (const dir of ["_concepts", "concepts", "_deploy", "_shared"]) {
    assert(!fs.existsSync(path.join(SITE, dir)), `${dir}/ was built into _site`);
  }
  return "concept deployments stay separate";
});

check("Built site", "The sitemap lists the public routes and none of the private ones", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const sitemap = readSite("sitemap.xml");
  const missing = [];
  /* 24 September 2026. A route whose source says `sitemap: false` (the
     smaller-work enquiry form and its thank-you page) is meant to be absent. */
  const unlisted = [];
  for (const [file, permalink] of ROUTES) {
    if (PRIVATE_ROUTES.includes(permalink) || permalink === "/404.html") continue;
    if (/^sitemap:\s*false/m.test(frontMatter(read(file)))) { unlisted.push(permalink); continue; }
    if (!sitemap.includes(`${permalink}</loc>`)) missing.push(permalink);
  }
  assert(missing.length === 0, `routes absent from sitemap.xml: ${missing.join(", ")}`);
  for (const route of unlisted) assert(!sitemap.includes(`${route}</loc>`), `${route} is marked sitemap: false but appears in sitemap.xml`);
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
  ["data_protection.intake_provider", "intake_provider", "Privacy"],
  ["data_protection.enquiry_retention", "enquiry_retention", "Privacy"],
  ["data_protection.intake_retention", "intake_retention", "Privacy"],
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

  /* Without a build, the placeholders are the legal-fact includes that still
     carry a todo= argument for an unfilled fact. (Until 17 September 2026 this
     check failed whenever _site was absent, contrary to the header's promise
     that site-dependent checks skip rather than fail.) */
  let sourcePlaceholders = 0;
  if (!hasSite && unfilledLegalFacts.length > 0) {
    for (const rel of LEGAL_SURFACE) {
      if (!publishedBodies.has(rel)) continue;
      sourcePlaceholders += (publishedBodies.get(rel).match(/include legal-fact\.html[^%]*todo=/g) || []).length;
    }
  }
  assert(
    legalPlaceholders + rendered + sourcePlaceholders > 0,
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
 * 20. Identity mark and the reading control
 * ------------------------------------------------------------------ */

check("Favicon", "Every icon the head and the manifest reference is in the repository", () => {
  const head = read("_includes/head.html");
  const manifest = JSON.parse(read("site.webmanifest"));

  const referenced = new Set();
  for (const m of head.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*href="\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}"/g)) {
    referenced.add(m[1]);
  }
  for (const icon of manifest.icons || []) referenced.add(icon.src);

  assert(referenced.size >= 5, `only ${referenced.size} icons referenced — the head is not being read`);

  const missing = [...referenced].filter((src) => !exists(src.replace(/^\//, "")));
  assert(missing.length === 0, `referenced but not in the repository:\n${missing.join("\n")}`);

  /* The three that matter most, by the job each one does. An SVG icon is what
     a current browser uses; the .ico is what anything asking for nothing in
     particular gets; the apple-touch icon is the home screen. */
  for (const [what, src] of [
    ["an SVG icon", "/assets/images/brand/favicon.svg"],
    ["a root favicon.ico", "/favicon.ico"],
    ["an apple-touch-icon", "/assets/images/brand/apple-touch-icon.png"]
  ]) {
    assert(referenced.has(src), `the head does not reference ${what} (${src})`);
  }

  /* The SVG carries both browser chromes. Without the dark block a dark disc
     disappears into a dark tab strip. */
  const svg = read("assets/images/brand/favicon.svg");
  assert(
    /prefers-color-scheme:\s*dark/.test(svg),
    "assets/images/brand/favicon.svg has no dark-chrome block — it will vanish into a dark tab strip"
  );

  assert(
    manifest.theme_color.toLowerCase() === "#263835",
    `site.webmanifest theme_color is ${manifest.theme_color}, which is not the --ink token`
  );

  return `${referenced.size} icons, all present · SVG carries a dark-chrome variant`;
});

check("Reading options", "The capability is gated on one key, and every offered value is implemented", () => {
  const config = read("_config.yml");
  const enabled = /^accessibilityPreferences:\s*\n(?:\s{2}.*\n)*?\s{2}enabled:\s*(true|false)\s*$/m.exec(config);
  assert(enabled, "_config.yml has no accessibilityPreferences.enabled — the control has no switch");

  /* Every place that renders any part of the control must be behind the same
     key, or switching it off leaves something behind. */
  for (const [file, what] of [
    ["_includes/head.html", "the config object and the pre-paint snippet"],
    ["_includes/footer.html", "the mount element"],
    ["_layouts/default.html", "the component script"]
  ]) {
    assert(
      read(file).includes("site.accessibilityPreferences.enabled"),
      `${file} renders ${what} without gating it on site.accessibilityPreferences.enabled`
    );
  }

  /* The script offers a fixed set of values and the stylesheet decides what
     they mean. A value offered but not implemented is a control that does
     nothing when somebody presses it. */
  const js = read("assets/js/reading-options.js");
  const css = read("assets/css/studio.css");
  const shared = exists("_shared/reading-options/reading-options.css")
    ? read("_shared/reading-options/reading-options.css")
    : "";
  assert(shared, "_shared/reading-options/reading-options.css is missing — the scale is not being built in");

  const offered = [...js.matchAll(/\["(default|large|largest|contrast|soft)",/g)].map((m) => m[1]);
  assert(offered.length >= 6, `only ${offered.length} options found in the component — the parse is wrong`);

  const missing = [];
  for (const value of new Set(offered)) {
    if (value === "default") continue;
    const attr = ["large", "largest"].includes(value) ? "data-read-size" : "data-read-mode";
    const pattern = new RegExp(`\\[${attr}="${value}"\\]`);
    if (!pattern.test(css) && !pattern.test(shared)) missing.push(`${attr}="${value}"`);
  }
  assert(missing.length === 0, `offered by the control but not implemented in CSS:\n${missing.join("\n")}`);

  /* The default state has to be the absence of an attribute rather than a
     value of one, or "Default" becomes a theme that approximates the approved
     design instead of being it. */
  assert(
    /removeAttribute\(g\.attr\)/.test(js),
    "the component sets an attribute for the default state instead of removing it"
  );

  const state = enabled[1] === "true" ? "ON" : "off";
  return `switch present · ${new Set(offered).size} values, all implemented · currently ${state} on this site`;
});

/* ------------------------------------------------------------------ *
 * 21. Search
 * ------------------------------------------------------------------ */

/** Pages that are meant to be found. Excludes the private client routes. */
const INDEXABLE = publishedSources.filter((rel) => {
  if (rel.startsWith("_includes/") || rel.startsWith("_layouts/")) return false;
  const body = publishedBodies.get(rel);
  if (!frontMatterValue(body, "permalink") && !rel.startsWith("_guides/")) return false;
  return !/^noindex:\s*true/m.test(body);
});

check("Search", "Every indexable page declares a title and a description", () => {
  const missing = [];
  for (const rel of INDEXABLE) {
    const body = publishedBodies.get(rel);
    if (!frontMatterValue(body, "title")) missing.push(`${rel} — no title`);
    if (!frontMatterValue(body, "description")) missing.push(`${rel} — no description`);
  }
  assert(missing.length === 0, `a search result would be written by Google instead:\n${missing.join("\n")}`);
  return `${INDEXABLE.length} indexable pages, all titled and described`;
});

check("Search", "No two indexable pages claim the same title or description", () => {
  /* Two pages with one title is the shape of a duplicate-content problem, and
     it is also the shape of a template that stopped substituting. */
  for (const key of ["title", "description"]) {
    const seen = new Map();
    for (const rel of INDEXABLE) {
      const value = (frontMatterValue(publishedBodies.get(rel), key) || "").trim();
      if (!value) continue;
      if (seen.has(value)) {
        throw new Error(`${key} "${value.slice(0, 60)}…" is used by both ${seen.get(value)} and ${rel}`);
      }
      seen.set(value, rel);
    }
  }
  return "all distinct";
});

check("Search", "Titles and descriptions stay inside what a result shows", () => {
  /* Warnings, not failures: Google measures pixels, not characters, and it
     rewrites descriptions whenever it likes. These bounds are generous — they
     catch the 370-character description that is really a paragraph in the
     wrong field, not a title three characters over. */
  const BRAND = read("_config.yml").match(/^brand:\s*"([^"]+)"/m);
  const suffix = BRAND ? BRAND[1].length + 3 : 26;
  const long = [];
  for (const rel of INDEXABLE) {
    const body = publishedBodies.get(rel);
    const title = frontMatterValue(body, "seo_title") || frontMatterValue(body, "title") || "";
    const description = frontMatterValue(body, "seo_description") || frontMatterValue(body, "description") || "";
    if (title.length + suffix > 90) long.push(`${rel} — title ${title.length + suffix} chars`);
    if (description.length > 230) long.push(`${rel} — description ${description.length} chars`);
  }
  assert(long.length === 0, `too long to survive a search result:\n${long.join("\n")}`);
  return "within bounds";
});

check("Search", "The concept websites cannot be crawled as if they were real practices", () => {
  /* The three concepts are fictional therapy practices on their own
     subdomains. A concept indexed as a real practice is the one SEO mistake
     on this site that would matter to somebody other than the studio: a
     person in distress finding a counsellor who does not exist. Each copy in
     this repository is locked three ways, and all three have to hold. */
  const roots = ["_concepts", "_deploy"];
  const problems = [];
  for (const root of roots) {
    if (!exists(root)) continue;
    for (const dir of fs.readdirSync(path.join(ROOT, root), { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const base = path.join(ROOT, root, dir.name);
      const rel = `${root}/${dir.name}`;

      const robots = path.join(base, "robots.txt");
      if (!fs.existsSync(robots)) problems.push(`${rel} — no robots.txt`);
      else if (!/^\s*Disallow:\s*\/\s*$/m.test(fs.readFileSync(robots, "utf8"))) {
        problems.push(`${rel}/robots.txt does not Disallow: /`);
      }

      const index = path.join(base, "index.html");
      if (!fs.existsSync(index)) problems.push(`${rel} — no index.html`);
      else if (!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(fs.readFileSync(index, "utf8"))) {
        problems.push(`${rel}/index.html carries no noindex meta tag`);
      }

      const headers = path.join(base, "_headers");
      if (!fs.existsSync(headers)) problems.push(`${rel} — no _headers`);
      else if (!/X-Robots-Tag:\s*noindex/i.test(fs.readFileSync(headers, "utf8"))) {
        problems.push(`${rel}/_headers sends no noindex X-Robots-Tag`);
      }
    }
  }
  assert(problems.length === 0, `a fictional practice could be indexed as a real one:\n${problems.join("\n")}`);
  return "robots.txt, meta and header locks present on every concept in the repository";
});

check("Search", "robots.txt allows the site, blocks the private routes and names the sitemap", () => {
  const robots = read("robots.txt");
  assert(/^Allow:\s*\/$/m.test(robots), "robots.txt no longer allows the site");
  assert(/^Sitemap:\s*\{\{\s*site\.url\s*\}\}\/sitemap\.xml$/m.test(robots),
    "robots.txt no longer declares the sitemap as an absolute URL");
  for (const route of ["/client/"]) {
    assert(new RegExp(`^Disallow:\\s*${route}`, "m").test(robots), `robots.txt no longer disallows ${route}`);
  }
  assert(read("_config.yml").includes("jekyll-sitemap"), "the sitemap plugin is no longer configured");
  return "allow, 2 disallows, absolute sitemap";
});

check("Search", "Every page carries one canonical and exactly one h1", () => {
  if (!hasSite) skip("no _site directory — run `npm run build` first");
  const problems = [];
  for (const file of walk(SITE, (f) => /\.html$/.test(f))) {
    const rel = path.relative(SITE, file);
    const body = fs.readFileSync(file, "utf8");
    const canonical = body.match(/<link rel="canonical" href="([^"]+)"/g) || [];
    const h1 = body.match(/<h1\b/g) || [];
    if (canonical.length !== 1) problems.push(`${rel} — ${canonical.length} canonical tags`);
    if (h1.length !== 1) problems.push(`${rel} — ${h1.length} h1 elements`);
    if (!/href="https:\/\//.test(canonical[0] || "")) problems.push(`${rel} — canonical is not an absolute https URL`);
  }
  assert(problems.length === 0, problems.join("\n"));
  return "one canonical and one h1 on every built page";
});

check("Search", "Structured data parses, and claims nothing that cannot be checked", () => {
  /* The failure this guards against is not a typo. It is the day somebody
     pastes in an aggregateRating or a review to win a star in the results:
     there are no reviews, and markup that invents them is a manual action. */
  const FORBIDDEN = ["aggregateRating", "review", "Review", "award", "openingHours", "priceRange"];
  const sources = [read("_includes/schema.html"), ...publishedSources.map((r) => publishedBodies.get(r))];
  let blocks = 0;

  for (const body of sources) {
    for (const match of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      blocks += 1;
      const raw = match[1];
      for (const term of FORBIDDEN) {
        assert(!new RegExp(`"${term}"\\s*:`).test(raw), `structured data declares "${term}", which this site has no evidence for`);
      }
      /* Liquid is stripped to a placeholder so the JSON shape can be parsed
         without rendering the site. A brace that never closes fails here. */
      const json = raw
        .replace(/"\{\{[\s\S]*?\}\}"/g, '"x"')
        .replace(/\{\{[\s\S]*?\}\}/g, '"x"')
        .replace(/\{%[\s\S]*?%\}/g, "")
        .replace(/,(\s*[}\]])/g, "$1");
      if (!json.trim()) continue;
      try {
        JSON.parse(json);
      } catch (error) {
        throw new Error(`a JSON-LD block is malformed: ${String(error.message).slice(0, 120)}`);
      }
    }
  }
  assert(blocks >= 5, `only ${blocks} JSON-LD blocks found — the schema include is not being read`);
  return `${blocks} JSON-LD blocks, all parseable`;
});

/* ------------------------------------------------------------------ *
 * 22. Practice Discovery
 *
 * The questionnaire is a Netlify form. Netlify detects it at deploy time by
 * parsing the built HTML, and a submission is matched to that form by a
 * hidden field. Three values have to agree — the form's name, the hidden
 * form-name, and the field netlify-honeypot points at — or submissions are
 * rejected or filed under nothing. None of that fails loudly in a browser,
 * which is why it is checked here.
 * ------------------------------------------------------------------ */

const DISCOVERY_BODY = read(DISCOVERY);
const DISCOVERY_YAML = read("_data/practice_discovery.yml");

/**
 * The question set, read without a YAML library — this harness has no
 * dependencies and is not going to grow one for five keys.
 *
 * Deliberately forgiving: it keys off `name:` starting a field and collects
 * the handful of scalars that follow it, whatever the indentation, key order
 * or quoting. It assumes only that one field begins at each `name:`, which is
 * the one thing about the file's shape worth depending on.
 */
function discoveryFields() {
  const fields = [];
  let current = null;
  for (const raw of DISCOVERY_YAML.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (/^\s*#/.test(line) || line.trim() === "") continue;
    const match = /^\s*-?\s*([a-z_]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1];
    const value = match[2].replace(/^"(.*)"$/, "$1").trim();
    if (key === "name") {
      current = { name: value, type: "text", required: false, accept: "", label: "", hint: "", multiple: false };
      fields.push(current);
      continue;
    }
    if (!current) continue;
    if (key === "type") current.type = value;
    else if (key === "required") current.required = value === "true";
    else if (key === "accept") current.accept = value;
    else if (key === "label") current.label = value;
    else if (key === "hint") current.hint = value;
    else if (key === "multiple") current.multiple = value === "true";
  }
  return fields;
}

function discoveryScalar(key) {
  const match = new RegExp(`^${key}:\\s*"([^"]+)"`, "m").exec(DISCOVERY_YAML);
  return match ? match[1] : "";
}

check("Practice Discovery", "The form, the hidden name and the honeypot all agree", () => {
  const formName = discoveryScalar("form_name");
  const honeypot = discoveryScalar("honeypot");
  const action = discoveryScalar("action");
  assert(formName && honeypot && action, "_data/practice_discovery.yml is missing form_name, honeypot or action");

  for (const [pattern, what] of [
    [/<form[^>]*\bmethod="POST"/, 'method="POST"'],
    [/<form[^>]*\bdata-netlify="true"/, 'data-netlify="true"'],
    [/<input type="hidden" name="form-name" value="\{\{ pd\.form_name \}\}">/, "the hidden form-name field"],
    [/netlify-honeypot="\{\{ pd\.honeypot \}\}"/, "netlify-honeypot"],
    [/name="\{\{ pd\.honeypot \}\}"/, "a field matching the declared honeypot"],
  ]) {
    assert(pattern.test(DISCOVERY_BODY), `${DISCOVERY} no longer carries ${what}`);
  }

  /* One source for all three values, so they cannot drift apart. */
  assert(
    /<form[^>]*\bname="\{\{ pd\.form_name \}\}"/.test(DISCOVERY_BODY),
    "the form name is written out instead of coming from the data file"
  );
  assert(
    action === "/client/practice-discovery/thank-you/",
    `the form action is "${action}", which is not the confirmation route`
  );
  assert(
    PRIVATE_ROUTES.includes(action),
    "the form action points at a route that is not one of the private routes"
  );
  return `${formName} → ${action} · honeypot ${honeypot}`;
});

check("Practice Discovery", "Every question has a unique, readable name and only the last control submits", () => {
  const fields = discoveryFields();
  assert(fields.length > 20, `only ${fields.length} questions parsed — the data file is not being read`);
  const names = [];
  let required = 0;
  for (const field of fields) {
    names.push(field.name);
    if (field.required) required += 1;
    assert(
      /^[a-z][a-z0-9-]*$/.test(field.name),
      `"${field.name}" is not a readable field name — lower case, words separated by hyphens`
    );
    assert(
      !/^(q|question|field)[-_]?\d+$/i.test(field.name),
      `"${field.name}" is an identifier rather than a name; the Netlify column has to be readable`
    );
    assert(field.label && field.label.length > 2, `${field.name} has no label`);
  }
  const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
  assert(duplicates.length === 0, `duplicate field names: ${[...new Set(duplicates)].join(", ")}`);

  /* Only the final control may submit. Previous and Continue are ordinary
     buttons; a stray type="submit" on either would post ten steps early. */
  const buttons = [...DISCOVERY_BODY.matchAll(/<button\b([^>]*)>/g)].map((m) => m[1]);
  const submits = buttons.filter((a) => /type="submit"/.test(a));
  assert(submits.length === 1, `${submits.length} submit buttons in the questionnaire; there must be exactly one`);
  assert(/data-pd-submit/.test(submits[0]), "the submit button is not the one the script knows about");
  for (const marker of ["data-pd-prev", "data-pd-next"]) {
    const button = buttons.find((a) => a.includes(marker));
    assert(button, `${marker} is missing`);
    assert(/type="button"/.test(button), `${marker} is not type="button" — it would submit the form`);
  }
  return `${names.length} questions · ${required} required in data, plus the confirmation`;
});

/**
 * The question set grouped by step, for the length budget below. Same
 * dependency-free reading as discoveryFields(), one level up: a step begins at
 * `- id:` and owns every `- name:` until the next one.
 */
function discoverySteps() {
  const steps = [];
  for (const raw of DISCOVERY_YAML.split("\n")) {
    if (/^\s*#/.test(raw) || raw.trim() === "") continue;
    const step = /^\s*-\s*id:\s*"([^"]+)"/.exec(raw);
    if (step) {
      steps.push({ id: step[1], fields: 0 });
      continue;
    }
    if (/^\s*-\s*name:\s*"/.test(raw) && steps.length) steps[steps.length - 1].fields += 1;
  }
  return steps;
}

check("Practice Discovery", "The questionnaire stays short enough to finish in one sitting", () => {
  /* 19 September 2026. The first version asked 194 questions across these
     eleven steps: technically sound, and an examination to sit. It was cut to
     70 by merging narrow questions into open ones with helper prompts.

     This check exists because that is exactly the kind of decision that erodes
     one well-meaning addition at a time. A band, not a fixed number — the set
     is meant to be edited — but a band narrow enough that drifting back
     towards a hundred questions fails here first, in front of whoever is
     making the change, rather than in front of a client at step seven.

     "You and your practice" is allowed more because most of its questions are
     one-line factual fields — a name, a title, a telephone number — rather
     than anything that has to be thought about. */
  const MIN = 55;
  const MAX = 75;
  const PER_STEP_MAX = 8;
  const FACTUAL_STEP = "you-and-your-practice";
  const FACTUAL_STEP_MAX = 14;

  const steps = discoverySteps();
  const total = steps.reduce((sum, step) => sum + step.fields, 0);
  assert(steps.length === 11, `${steps.length} steps in the data file; the questionnaire is designed around eleven`);
  assert(total === discoveryFields().length, "the per-step reading and the flat reading disagree — one of the two parsers is wrong");
  assert(
    total >= MIN && total <= MAX,
    `${total} questions. The agreed range is ${MIN}–${MAX}: below it the discovery is too thin to work from, ` +
      `above it a client is sitting an examination. Merge before you add.`
  );
  for (const step of steps) {
    const ceiling = step.id === FACTUAL_STEP ? FACTUAL_STEP_MAX : PER_STEP_MAX;
    assert(
      step.fields <= ceiling,
      `step "${step.id}" asks ${step.fields} questions; the ceiling is ${ceiling}. ` +
        `Merge two into one open question with a helper prompt rather than raising it.`
    );
  }

  /* A merged question is only an improvement if the helper prompt survived
     with it. Without one, "How would a client experience working with you?"
     is four questions the client has to guess at. */
  const long = discoveryFields().filter((f) => f.type === "textarea");
  const withHint = long.filter((f) => f.hint).length;
  assert(
    withHint >= long.length / 3,
    `only ${withHint} of ${long.length} open questions carry a helper prompt; merged questions need them`
  );

  const counts = steps.map((s) => s.fields).join("/");
  return `${total} questions across ${steps.length} steps (${counts})`;
});

check("Practice Discovery", "Only the agreed questions are required, and the rest say so", () => {
  /* The questionnaire is long on purpose and compulsory almost nowhere. If a
     future edit marks a section required, a client meets a wall instead of an
     invitation. */
  const expected = [
    "full-name", "email", "practice-name", "preferred-professional-title",
    "practice-stage", "how-you-practise", "who-you-want-to-work-with",
    "most-important-message", "website-main-job",
  ];
  const actual = discoveryFields().filter((f) => f.required).map((f) => f.name);
  assert(
    actual.sort().join(",") === expected.sort().join(","),
    `the required questions have changed:\n  expected ${expected.join(", ")}\n  found    ${actual.join(", ")}`
  );
  assert(
    /name="confirmation"[^>]*required/.test(DISCOVERY_BODY.replace(/\s+/g, " ")),
    "the closing confirmation is no longer required"
  );
  /* Every question that is not required has to be visibly marked optional,
     or a long form reads as a long list of obligations. */
  assert(
    /<span class="opt">Optional<\/span>/.test(DISCOVERY_BODY),
    "optional questions are no longer marked Optional"
  );
  assert(
    /<span class="req">Required<\/span>/.test(DISCOVERY_BODY),
    "required questions are no longer marked Required"
  );
  return `${expected.length} required questions + the confirmation`;
});

check("Practice Discovery", "It works without JavaScript, and asks for nothing dangerous", () => {
  /* Without the script every step is visible and the browser validates. The
     two navigation controls start hidden because they would do nothing. */
  assert(
    /data-pd-prev hidden/.test(DISCOVERY_BODY) && /data-pd-next hidden/.test(DISCOVERY_BODY),
    "Previous and Continue no longer start hidden — without JavaScript they would be dead controls"
  );
  assert(
    !/<form[^>]*\bnovalidate/.test(DISCOVERY_BODY),
    "novalidate is in the markup — without JavaScript nothing would be validated at all"
  );
  assert(
    /form\.noValidate = true/.test(read("assets/js/practice-discovery.js")),
    "the script no longer takes over validation, so the browser and the script will compete"
  );

  /* Comments stripped first: this tests the code, not the note that explains
     why the code does not do these things. */
  const script = read("assets/js/practice-discovery.js")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  for (const [pattern, what] of [
    [/localStorage/, "writes answers to localStorage"],
    [/sessionStorage/, "writes answers to sessionStorage"],
    [/console\.(log|info|warn|error)/, "logs to the console"],
    [/gtag\(|dataLayer/, "sends answers to analytics"],
    [/\.disabled\s*=\s*true[\s\S]{0,40}input/, "disables inputs, which would drop their answers"],
  ]) {
    assert(!pattern.test(script), `assets/js/practice-discovery.js ${what}`);
  }

  /* A GET form would put every answer in the address bar, in history, and in
     any referrer header the confirmation page sends. */
  assert(!/<form[^>]*\bmethod="GET"/i.test(DISCOVERY_BODY), "the questionnaire would submit by GET, putting answers in the URL");

  /* Uploads: there are none, and the check that keeps it that way lives in
     "The questionnaire takes text only". What is asserted here is the one
     thing that check cannot see — that nothing has quietly started asking for
     a credential or an executable in a text field instead. */
  assert(
    discoveryFields().every((f) => f.type !== "file"),
    "the questionnaire has a file field again; it takes text only"
  );
  /* Per field, not across the joined text: two questions mention passwords in
     order to warn against them ("Do not enter passwords…", "a link that works
     without a password"), and a warning is the opposite of a request. A field
     that says password without one of those framings is asking for one. */
  const WARNING = /do not enter|don.t enter|without a password|never enter/i;
  for (const field of discoveryFields()) {
    const text = `${field.label} ${field.hint}`;
    if (WARNING.test(text)) continue;
    for (const [pattern, what] of [
      [/\bpasswords?\b/i, "asks for a password"],
      [/security answer|recovery code|two-factor|\b2fa\b/i, "asks for account recovery information"],
      [/\.exe\b|\.zip\b|\.rar\b/i, "asks for an executable or an archive"],
    ]) {
      assert(!pattern.test(text), `"${field.name}" ${what}`);
    }
  }
  return "no uploads, no credentials requested · no storage, no logging, no analytics";
});

check("Practice Discovery", "The questionnaire takes text only — no uploads, anywhere", () => {
  /* 19 September 2026. The questionnaire briefly had two single-file uploads.
     They are gone, and the privacy notice now states in public that "No files
     are uploaded through the questionnaire. It has no upload field of any
     kind." That sentence has to stay true, which is what this check is for.

     Four separate ways an upload could come back, so all four are closed:
     a `type: "file"` in the data file, a file branch in the template, a
     `multiple` attribute, and multipart encoding on the form. Any one of them
     alone is harmless; together they are a working upload, and a client's
     material would land in Netlify while the privacy notice said it could
     not. */
  const fields = discoveryFields();
  const uploads = fields.filter((f) => f.type === "file");
  assert(
    uploads.length === 0,
    `"${uploads.map((f) => f.name).join('", "')}" is type: file. The questionnaire is text only, ` +
      "and the privacy notice says so in public. Files reach the Studio by a shared-folder link " +
      "or by email."
  );

  /* Comments stripped: this tests the markup, not the note explaining why the
     markup does not do this. */
  const markup = DISCOVERY_BODY.replace(/\{%-?\s*comment[\s\S]*?endcomment\s*-?%\}/g, "");
  for (const [pattern, what] of [
    [/type="file"/, "renders a file input"],
    [/field\.type\s*==\s*'file'/, "still has a branch for file fields"],
    [/\bmultiple\b/, "can emit a multiple attribute"],
    [/enctype/, "still declares an encoding — multipart is only needed for uploads"],
    [/field\.accept/, "still emits an accept list"],
  ]) {
    assert(!pattern.test(markup), `${DISCOVERY} ${what}`);
  }

  /* The route files actually take has to exist, or the privacy notice's
     "share a folder link instead" is advice with nowhere to act on it. */
  const links = fields.find((f) => f.name === "file-links");
  assert(links, "the file-links question is gone — there is now nowhere to put a folder link");
  assert(links.type === "textarea", "file-links is no longer a free-text field");
  assert(
    /Google Drive|Dropbox/i.test(links.hint) && /WeTransfer/i.test(links.hint),
    "the file-links hint no longer names the sharing services a client can use"
  );
  assert(
    /without a password/i.test(links.hint),
    "the file-links hint no longer asks for a link that works without a password"
  );

  /* Promises about uploads are worse than useless once uploads are gone: they
     tell a client to do something the form cannot do. */
  const pageText = DISCOVERY_BODY.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const hints = fields.map((f) => `${f.label} ${f.hint}`).join(" ");
  for (const [pattern, what] of [
    [/\d+\s?MB/i, "a file-size promise"],
    [/one file per field|single file/i, "a one-file-per-field promise"],
    [/time\s?out|times out/i, "an upload timeout"],
    [/\.pdf|\.docx|\.webp|PDF, DOC/i, "a list of accepted file formats"],
    [/upload/i, "the word upload"],
  ]) {
    assert(!pattern.test(hints), `the questions still carry ${what}; nothing is uploaded any more`);
  }
  for (const [pattern, what] of [
    [/\d+\s?MB/i, "a file-size promise"],
    [/times out/i, "an upload timeout"],
  ]) {
    assert(!pattern.test(pageText), `the page still carries ${what}; nothing is uploaded any more`);
  }

  /* Said in public, so it has to be said on the page too. */
  assert(
    /Nothing is uploaded through this form/i.test(pageText),
    "the page no longer tells the client that nothing is uploaded through the form"
  );

  return `0 uploads · file-links present · no size, format or timeout promises`;
});

check("Practice Discovery", "No external embedded form service or retired Tally integration remains", () => {
  /* 19 September 2026. The intake was an embedded Tally form at /client/intake/
     for two days. It was retired in favour of Practice Discovery, whose form
     handling is native to this site. Three things had to move together — the
     page, the CSP allowance and the privacy notice — and it is the kind of
     change where one of the three gets left behind.

     What this check does NOT claim: that no third party is involved. Netlify,
     Inc. is a third-party processor, named as one in the privacy notice. What
     went away is the *embedded* service: a form hosted by someone else, framed
     into a page of ours, with its own script and its own origin.

     Comments are stripped first, everywhere. The removal is documented in
     assets/js/client.js, netlify.toml and _redirects on purpose: that is the
     record of an abandoned approach, and erasing it would make the history
     unreadable. What must not survive is anything that still WORKS. */
  const strip = (text) =>
    text
      .replace(/\{%-?\s*comment[\s\S]*?endcomment\s*-?%\}/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/^\s*#.*$/gm, "");

  const active = [
    "client/practice-discovery.html",
    "client/practice-discovery-thank-you.html",
    "client/photography.html",
    "assets/js/client.js",
    "assets/js/practice-discovery.js",
    "netlify.toml",
    "_redirects",
    "_pages/privacy.html",
  ];
  for (const file of active) {
    const body = strip(read(file));
    assert(
      !/tally/i.test(body),
      `${file} still refers to Tally outside a comment — the integration was retired on 19 September 2026`
    );
  }

  /* The page and its data file are gone from the active tree entirely. */
  for (const gone of ["client/intake.html", "_data/intake.yml"]) {
    assert(!exists(gone), `${gone} is back; the Tally intake was retired and belongs in _to_delete/`);
  }

  /* Every address anybody might still be holding lands on the live one. */
  const redirects = read("_redirects");
  for (const from of [
    "/client/intake/",
    "/services/practice-website/questionnaire/",
    "/services/straightforward-website/questionnaire/",
  ]) {
    const line = redirects
      .split("\n")
      .find((l) => !l.trim().startsWith("#") && l.trim().startsWith(from + " "));
    assert(line, `no redirect for ${from} — an old intake link would 404`);
    assert(
      /\/client\/practice-discovery\/\s+301/.test(line),
      `${from} does not redirect to /client/practice-discovery/: ${line.trim()}`
    );
  }

  /* The CSP allowed frames from tally.so for exactly one embed. No page frames
     anything now, so the allowance comes out rather than sitting open. */
  const csp = read("netlify.toml")
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n");
  assert(!/tally\.so/.test(csp), "netlify.toml still allows frames from tally.so in a live header");
  assert(
    /frame-src 'none'/.test(csp),
    "the Content-Security-Policy no longer sets frame-src 'none'; nothing on this site frames a third party"
  );

  /* The public statement is the one that matters. */
  const privacy = read("_pages/privacy.html");
  assert(/Netlify, Inc\./.test(privacy), "the privacy notice no longer names Netlify, Inc. as the form processor");
  assert(
    /No files are uploaded through the questionnaire/i.test(privacy),
    "the privacy notice no longer states that no files are uploaded through the questionnaire"
  );
  /* The hierarchy is Netlify's, and it has a direction: DPA s.14.2 puts the UK
     Extension to the EU–US Data Privacy Framework first for eligible transfers,
     and ss.14.3–14.4 bring in the Standard Contractual Clauses with the UK
     International Data Transfer Addendum only if the Framework is declared
     invalid or Netlify fails to re-certify. An earlier version of this notice
     had it the other way round. Both mechanisms must be named, the Framework
     must be described first, and the fallback condition must be stated —
     otherwise the notice is describing an arrangement that does not exist. */
  const flat = privacy.replace(/<[^>]+>/g, " ").replace(/&ndash;/g, "–").replace(/&rsquo;/g, "'").replace(/\s+/g, " ");
  const dpf = flat.indexOf("UK Extension to the EU–US Data Privacy Framework");
  const sccs = flat.indexOf("Standard Contractual Clauses");
  assert(dpf !== -1, "the privacy notice no longer names the UK Extension to the EU–US Data Privacy Framework");
  assert(sccs !== -1, "the privacy notice no longer names the Standard Contractual Clauses");
  assert(/International Data Transfer Addendum/.test(flat), "the privacy notice no longer names the UK International Data Transfer Addendum");
  assert(
    dpf < sccs,
    "the privacy notice describes the Standard Contractual Clauses before the UK Extension to the Data Privacy Framework — " +
      "Netlify's DPA s.14.2 makes the Framework primary and the clauses the fallback"
  );
  assert(
    /(unavailable|declared invalid|invalid)[\s\S]{0,120}re-certif/i.test(flat),
    "the privacy notice no longer states the condition on which the fallback applies " +
      "(the Extension being unavailable or invalid, or a failure to re-certify)"
  );
  /* Describing an arrangement is not endorsing it. */
  assert(
    !/(sufficient|adequate|compliant|lawful) (safeguard|mechanism|basis|transfer)/i.test(flat) ||
      /not offering a view on whether it is legally sufficient/i.test(flat),
    "the privacy notice claims a transfer mechanism is legally sufficient; it should describe, not certify"
  );

  /* 19 September 2026. Three claims about Netlify were written into this notice
     and had to come out, because the documents reviewed do not support them:

       "offers no UK or European storage region"  — the absence of a published
         region is not proof that none exists. Not finding a commitment and
         showing there is no capability are different things.
       "likely to be processed outside the UK"    — "likely" is a probability
         nothing in the sources establishes. Netlify's privacy statement says
         data MAY be transferred and stored outside the country of collection.
       "from the moment you submit"               — asserts a timing the
         documents say nothing about.

     They are easy to write because they read as candour: the stronger the
     statement against your own supplier, the more honest it sounds. That is
     exactly why they need a guard. The notice may say only what a source
     supports, and overstating a risk is as much a misstatement as hiding one.

     Scoped to the legal pages and the notes that feed them — not the whole
     repository, where a future note about some other supplier could legitimately
     use these words about a documented fact. */
  const EVIDENCE = [
    [/offers?\s+no\s+UK\s+or\s+Europe(an)?/i, '"offers no UK or European storage region" — not established by any reviewed source'],
    [/likely\s+to\s+be\s+(processed|held|stored)\s+outside/i, '"likely to be processed outside" — the sources say "may", not "likely"'],
    [/from\s+the\s+moment\s+(you|they)\s+submit/i, '"from the moment you submit" — asserts a timing no source states'],
    [/likely\s+to\s+sit\s+in\s+the\s+United\s+States/i, '"likely to sit in the United States" — same overstatement'],
  ];
  for (const file of [
    "_pages/privacy.html",
    "_data/legal.yml",
    "LEGAL-INFORMATION-REQUIRED.md",
    "docs/LEGAL-QUESTIONNAIRE-2026-09-19.md",
    "docs/operations/practice-discovery-netlify-setup.md",
  ]) {
    if (!exists(file)) continue;
    const body = read(file);
    for (const [pattern, why] of EVIDENCE) {
      const hit = body.split("\n").find((line) => pattern.test(line));
      assert(!hit, `${file} states ${why}\n      ${(hit || "").trim().slice(0, 100)}`);
    }
  }

  /* The replacement has to actually be there, or the guard above is satisfied
     by saying nothing at all about where the data goes. */
  assert(
    /based in the United States/.test(flat) &&
      /may be transferred to and stored outside the country in which it was collected/.test(flat),
    "the privacy notice no longer sources its transfer statement to Netlify's own privacy statement"
  );
  assert(
    /may therefore be processed outside the United Kingdom/.test(flat),
    "the privacy notice no longer tells the reader their answers may be processed outside the UK"
  );

  /* Comments are the record of the change, so they are allowed to say Tally —
     but only in the past tense. A current operational file must not present it
     as the provider in service. _data/legal.yml is called out by name because
     its comments are the instructions somebody reads while filling the fact in,
     and a stale one there would send them to the wrong supplier's terms.

     Allow-listed, and deliberately so: _legacy/ and _to_delete/ (archives),
     the decision records, docs/ (history and the superseded build source), and
     this file, whose Tally references are all assertions that it is gone. */
  const operational = [
    "_data/legal.yml",
    "_data/practice_discovery.yml",
    "_pages/privacy.html",
    "client/practice-discovery.html",
    "client/practice-discovery-thank-you.html",
    "docs/operations/practice-discovery-netlify-setup.md",
    "docs/operations/client-email-templates.md",
    "docs/handover-runbook.md",
    "docs/product-terminology.md",
  ];
  /* A line naming Tally has to place it in the past somewhere on that line.
     Checked per line rather than with a lookahead, because the past-tense
     marker is as likely to come before the name ("the intake WAS a Tally
     form") as after it. */
  const PAST = /\b(was|were|until|briefly|retired|replaced|superseded|former(ly)?|previously|abandoned|no longer|used to)\b/i;
  for (const file of operational) {
    if (!exists(file)) continue;
    const body = read(file);
    const offending = body
      .split("\n")
      .filter((line) => /\bTally\b/i.test(line) && !PAST.test(line))
      .map((line) => line.trim().slice(0, 90));
    assert(
      offending.length === 0,
      `${file} describes Tally as the current provider:\n      ${offending.join("\n      ")}`
    );
  }
  /* legal.yml is the one that matters most, so it is held to the stricter bar
     of not mentioning Tally at all: the history belongs in the decision
     records, not in the note beside an empty field. */
  assert(
    !/tally/i.test(read("_data/legal.yml")),
    "_data/legal.yml mentions Tally; the form service is Netlify, Inc. and the history belongs in DECISION-REGISTER.md"
  );

  return "no embedded form service · 3 redirects · frame-src none · Netlify named · DPF before SCCs";
});

check("Practice Discovery", "It says what not to send, and points at the privacy notice", () => {
  const text = DISCOVERY_BODY.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert(/do not include confidential information about clients/i.test(text),
    "the questionnaire no longer tells people to leave client information out");
  assert(/[Nn]ever enter passwords/.test(text),
    "the questionnaire no longer warns against entering passwords");
  assert(/Do not enter passwords, security answers or recovery codes/.test(DISCOVERY_YAML),
    "the access-issues question no longer warns against entering credentials");
  assert(/'\/privacy\/' \| relative_url/.test(DISCOVERY_BODY),
    "the questionnaire no longer links to the privacy notice");
  return "client information, passwords and the privacy link all stated";
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

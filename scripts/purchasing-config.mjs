#!/usr/bin/env node
/**
 * Resolves online-purchasing configuration at build time.
 *
 * Reads environment variables and writes _data/purchasing_resolved.yml, which
 * Liquid reads as site.data.purchasing_resolved. The generated file is
 * gitignored and must never be committed.
 *
 *   PUBLIC_PURCHASES_ENABLED        "true" to allow a checkout link to render
 *   PUBLIC_STRIPE_STRAIGHTFORWARD_LINK   live Stripe Payment Link
 *   PUBLIC_STRIPE_TEST_LINK         sandbox Payment Link, non-production only
 *
 * Rules, in order of precedence:
 *
 *   1. Only a URL beginning https://buy.stripe.com/ is ever accepted.
 *   2. In a production build, the sandbox link is ignored entirely and a
 *      sandbox-shaped URL in the live variable is REJECTED. A production build
 *      can therefore never emit a sandbox link.
 *   3. Purchasing stays OFF unless PUBLIC_PURCHASES_ENABLED is exactly "true"
 *      AND a valid link survived those checks.
 *   4. Anything that looks like a Stripe secret or restricted key aborts the
 *      build rather than being written anywhere.
 *
 * Failing safe means rendering the "Online purchasing opening shortly" state
 * and the "Ask a question first" route. That is never a build failure.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "_data", "purchasing_resolved.yml");

const LIVE_PREFIX = "https://buy.stripe.com/";
/** Stripe sandbox/test Payment Links carry a test marker in the path. */
const SANDBOX_MARKER = /^https:\/\/buy\.stripe\.com\/(test_|test\/)/i;
const SECRET_SHAPES = /\b(sk_live_|sk_test_|rk_live_|rk_test_|whsec_)/;

const env = process.env;
const notes = [];

/** Netlify sets CONTEXT: production | deploy-preview | branch-deploy. */
const context = (env.CONTEXT || "").toLowerCase();
const jekyllEnv = (env.JEKYLL_ENV || "").toLowerCase();
const isProduction = context === "production" || jekyllEnv === "production";
const environmentName = isProduction
  ? "production"
  : context || jekyllEnv || "development";

function clean(name) {
  const raw = (env[name] || "").trim();
  if (!raw) return "";
  if (SECRET_SHAPES.test(raw)) {
    console.error(
      `\n[purchasing-config] ${name} looks like a Stripe secret or restricted key.\n` +
        "Build stopped. Only a public Payment Link (https://buy.stripe.com/…) belongs in this variable.\n"
    );
    process.exit(1);
  }
  return raw;
}

const liveLink = clean("PUBLIC_STRIPE_STRAIGHTFORWARD_LINK");
const testLink = clean("PUBLIC_STRIPE_TEST_LINK");
const requested = (env.PUBLIC_PURCHASES_ENABLED || "").trim().toLowerCase() === "true";

let activeLink = "";
let linkSource = "none";

if (isProduction) {
  if (testLink) notes.push("sandbox Payment Link ignored: production build");
  if (liveLink && SANDBOX_MARKER.test(liveLink)) {
    notes.push("REJECTED: PUBLIC_STRIPE_STRAIGHTFORWARD_LINK is a sandbox link");
  } else if (liveLink && liveLink.startsWith(LIVE_PREFIX)) {
    activeLink = liveLink;
    linkSource = "live";
  } else if (liveLink) {
    notes.push("REJECTED: live link is not a https://buy.stripe.com/ URL");
  } else {
    notes.push("no live Payment Link configured");
  }
} else {
  if (liveLink && liveLink.startsWith(LIVE_PREFIX) && !SANDBOX_MARKER.test(liveLink)) {
    activeLink = liveLink;
    linkSource = "live";
  } else if (testLink && testLink.startsWith(LIVE_PREFIX)) {
    activeLink = testLink;
    linkSource = "sandbox";
    notes.push("using the sandbox Payment Link — non-production build only");
  } else if (liveLink || testLink) {
    notes.push("REJECTED: configured link is not a https://buy.stripe.com/ URL");
  } else {
    notes.push("no Payment Link configured");
  }
}

const enabled = requested && activeLink !== "";
if (requested && !enabled) notes.push("purchases requested but no usable link — staying off");
if (!requested && activeLink) notes.push("link present but PUBLIC_PURCHASES_ENABLED is not \"true\" — staying off");

const yaml = [
  "# GENERATED FILE — do not edit and do not commit.",
  "# Written by scripts/purchasing-config.mjs at build time.",
  `# environment: ${environmentName}`,
  ...notes.map((n) => `# note: ${n}`),
  "",
  `purchases_enabled: ${enabled}`,
  `active_payment_link: ${JSON.stringify(enabled ? activeLink : "")}`,
  `link_source: ${JSON.stringify(enabled ? linkSource : "none")}`,
  `is_production: ${isProduction}`,
  `environment: ${JSON.stringify(environmentName)}`,
  ""
].join("\n");

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, yaml, "utf8");

const summary = enabled
  ? `online purchasing ON (${linkSource} link, ${environmentName})`
  : `online purchasing OFF (${environmentName})`;
process.stdout.write(`[purchasing-config] ${summary}\n`);
for (const note of notes) process.stdout.write(`[purchasing-config]   ${note}\n`);

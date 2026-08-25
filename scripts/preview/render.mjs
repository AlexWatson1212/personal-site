#!/usr/bin/env node
/**
 * aw-preview-harness — render.mjs
 *
 * A Node stand-in for `bundle exec jekyll build`, used ONLY for local QA when
 * Ruby gems are unavailable. It reads the same sources Jekyll reads and writes
 * a `_preview/` tree that mirrors the HTML routes `_site/` would contain.
 *
 * It is an approximation. See README.md for what it does not guarantee.
 *
 * Usage (from the repo root):  node scripts/preview/render.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
import { Liquid } from "liquidjs";
import { marked } from "marked";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const OUT = path.join(ROOT, "_preview");

const INCLUDES_DIR = path.join(ROOT, "_includes");
const LAYOUTS_DIR = path.join(ROOT, "_layouts");
const DATA_DIR = path.join(ROOT, "_data");

/** Directories never walked, regardless of _config.yml. */
const HARD_SKIP_DIRS = new Set([
  ".git", "_legacy", "node_modules", "vendor", "_site", "_preview",
  "scripts", ".jekyll-cache", ".bundle", "_transfer", "assets",
]);

const errors = [];   // render failures
const conflicts = []; // url collisions
const warnings = [];

/* ────────────────────────────────────────────────────────────────────────────
 * Small utilities
 * ──────────────────────────────────────────────────────────────────────────*/

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function toS(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function toArray(v) {
  if (v === null || v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/** Walk a directory returning absolute file paths. */
function walk(dir, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (HARD_SKIP_DIRS.has(entry.name)) continue;
      walk(abs, found);
    } else if (entry.isFile()) {
      found.push(abs);
    }
  }
  return found;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Front matter
 * ──────────────────────────────────────────────────────────────────────────*/

const FM_RE = /^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

function parseFrontMatter(raw, source) {
  const m = FM_RE.exec(raw);
  if (!m) return { data: null, body: raw };
  let data = {};
  try {
    data = yaml.load(m[1]) || {};
  } catch (err) {
    throw new Error(`YAML front matter error in ${source}: ${err.message}`);
  }
  if (!isObj(data)) data = {};
  return { data, body: raw.slice(m[0].length) };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Ruby-ish strftime, evaluated in the site timezone
 * ──────────────────────────────────────────────────────────────────────────*/

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let SITE_TZ = "UTC";

function tzParts(date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23", weekday: "short", timeZoneName: "longOffset",
  });
  const out = {};
  for (const p of fmt.formatToParts(date)) out[p.type] = p.value;
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(out.weekday);
  // longOffset renders as "GMT+01:00" / "GMT"
  let off = (out.timeZoneName || "GMT").replace("GMT", "").trim();
  if (!off) off = "+00:00";
  return {
    Y: Number(out.year), M: Number(out.month), D: Number(out.day),
    h: Number(out.hour), m: Number(out.minute), s: Number(out.second),
    wd: wd < 0 ? 0 : wd, offset: off,
  };
}

const pad = (n, w = 2, c = "0") => String(n).padStart(w, c);

function strftime(date, format) {
  const p = tzParts(date);
  const startOfYear = Date.UTC(p.Y, 0, 1);
  const thisDay = Date.UTC(p.Y, p.M - 1, p.D);
  const yday = Math.round((thisDay - startOfYear) / 86400000) + 1;
  const hour12 = p.h % 12 === 0 ? 12 : p.h % 12;

  return format.replace(/%([-_0^#]?)(\d*)([a-zA-Z%])/g, (all, flag, width, conv) => {
    const nopad = flag === "-";
    const spacepad = flag === "_";
    const num = (n, w = 2) => {
      if (nopad) return String(n);
      if (spacepad) return String(n).padStart(w, " ");
      return pad(n, Number(width) || w);
    };
    switch (conv) {
      case "Y": return String(p.Y);
      case "y": return num(p.Y % 100);
      case "C": return num(Math.floor(p.Y / 100));
      case "m": return num(p.M);
      case "d": return num(p.D);
      case "e": return String(p.D).padStart(2, " ");
      case "j": return nopad ? String(yday) : pad(yday, 3);
      case "H": return num(p.h);
      case "k": return String(p.h).padStart(2, " ");
      case "I": return num(hour12);
      case "l": return String(hour12).padStart(2, " ");
      case "M": return num(p.m);
      case "S": return num(p.s);
      case "L": return pad(date.getUTCMilliseconds(), 3);
      case "p": return p.h < 12 ? "AM" : "PM";
      case "P": return p.h < 12 ? "am" : "pm";
      case "B": return MONTHS[p.M - 1];
      case "b": case "h": return MONTHS[p.M - 1].slice(0, 3);
      case "A": return DAYS[p.wd];
      case "a": return DAYS[p.wd].slice(0, 3);
      case "u": return String(p.wd === 0 ? 7 : p.wd);
      case "w": return String(p.wd);
      case "s": return String(Math.floor(date.getTime() / 1000));
      case "z": return p.offset.replace(":", "");
      case "Z": return SITE_TZ;
      case "D": return `${num(p.M)}/${num(p.D)}/${num(p.Y % 100)}`;
      case "F": return `${p.Y}-${pad(p.M)}-${pad(p.D)}`;
      case "T": return `${pad(p.h)}:${pad(p.m)}:${pad(p.s)}`;
      case "R": return `${pad(p.h)}:${pad(p.m)}`;
      case "n": return "\n";
      case "t": return "\t";
      case "%": return "%";
      default: return all;
    }
  });
}

function coerceDate(input) {
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input * 1000);
  const s = toS(input).trim();
  if (!s) return null;
  if (s === "now" || s === "today") return new Date();
  if (/^\d+$/.test(s)) return new Date(Number(s) * 1000);
  const d = new Date(s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function xmlSchema(date) {
  const p = tzParts(date);
  const off = p.offset === "+00:00" ? "+00:00" : p.offset;
  return `${p.Y}-${pad(p.M)}-${pad(p.D)}T${pad(p.h)}:${pad(p.m)}:${pad(p.s)}${off}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Config, data, site object
 * ──────────────────────────────────────────────────────────────────────────*/

const configRaw = readIfExists(path.join(ROOT, "_config.yml"));
if (configRaw === null) {
  console.error("FATAL: no _config.yml at repo root " + ROOT);
  process.exit(1);
}
let config;
try {
  config = yaml.load(configRaw) || {};
} catch (err) {
  console.error("FATAL: could not parse _config.yml — " + err.message);
  process.exit(1);
}

SITE_TZ = config.timezone || "UTC";

const EXCLUDE = toArray(config.exclude).map(toS);
const INCLUDE = toArray(config.include).map(toS);

function isExcluded(rel) {
  const norm = rel.split(path.sep).join("/");
  if (INCLUDE.some((i) => norm === i || norm.startsWith(i.replace(/\/$/, "") + "/"))) return false;
  return EXCLUDE.some((e) => {
    const ex = e.replace(/\/$/, "");
    return norm === ex || norm.startsWith(ex + "/");
  });
}

// _data/*.yml → site.data keyed by basename
const siteData = {};
if (fs.existsSync(DATA_DIR)) {
  for (const f of fs.readdirSync(DATA_DIR)) {
    if (!/\.(ya?ml|json)$/i.test(f)) continue;
    const key = f.replace(/\.(ya?ml|json)$/i, "");
    const text = fs.readFileSync(path.join(DATA_DIR, f), "utf8");
    try {
      siteData[key] = /\.json$/i.test(f) ? JSON.parse(text) : yaml.load(text);
    } catch (err) {
      warnings.push(`could not parse _data/${f}: ${err.message}`);
      siteData[key] = {};
    }
  }
}

// Every top-level config key is exposed verbatim on `site`, then the
// Jekyll-computed members are layered on top.
const site = {
  ...config,
  title: config.title,
  description: config.description,
  url: toS(config.url).replace(/\/$/, ""),
  baseurl: toS(config.baseurl).replace(/\/$/, ""),
  time: new Date(),
  data: siteData,
  pages: [],
  posts: [],
  guides: [],
  documents: [],
  static_files: [],
  categories: {},
  tags: {},
  collections: [],
};

/* ────────────────────────────────────────────────────────────────────────────
 * Liquid filters
 * ──────────────────────────────────────────────────────────────────────────*/

const liquid = new Liquid({
  root: [INCLUDES_DIR, LAYOUTS_DIR, ROOT],
  partials: [INCLUDES_DIR],
  layouts: [LAYOUTS_DIR],
  extname: ".html",
  jekyllInclude: true,
  dynamicPartials: false,
  relativeReference: false,
  strictFilters: true,   // an unimplemented filter must throw, never render empty
  strictVariables: false, // Jekyll renders unknown variables as empty
  greedy: false,
  jsTruthy: false,
});

marked.setOptions({ gfm: true, breaks: false, pedantic: false });

/**
 * kramdown inline attribute lists. `## Heading {#some-id}` sets the heading's
 * id in Jekyll; marked has no idea and renders the braces as literal text,
 * which then shows up in QA as a heading ending in "{#some-id". Strip the
 * trailing IAL and apply an id when one is given, so measurements are taken
 * against what Jekyll actually ships. Block-level `{: .class}` lines are
 * dropped for the same reason.
 */
const IAL_TRAILING = /[ \t]*\{:?([^{}\n]*)\}[ \t]*$/;
const HEADING_WITH_IAL = /^[ \t]{0,3}(#{1,6})\s+(.*?)[ \t]*\{:?\s*#([A-Za-z][\w:.-]*)[^{}\n]*\}[ \t]*$/;

/** Strips block-level IAL lines and pulls `{#id}` off headings. */
function extractInlineAttributeLists(md) {
  const ids = [];
  const out = md
    .split("\n")
    .filter((line) => !/^[ \t]*\{:[^{}\n]*\}[ \t]*$/.test(line))
    .map((line) => {
      const m = HEADING_WITH_IAL.exec(line);
      if (m) {
        ids.push({ level: m[1].length, text: m[2].trim(), id: m[3] });
        return `${m[1]} ${m[2].trim()}`;
      }
      return /^[ \t]{0,3}#{1,6}\s/.test(line) ? line.replace(IAL_TRAILING, "") : line;
    })
    .join("\n");
  return { md: out, ids };
}

/** Puts the ids back on the rendered headings, the way kramdown would. */
function applyHeadingIds(html, ids) {
  let result = html;
  for (const { level, text, id } of ids) {
    if (new RegExp(`id=["']${id}["']`).test(result)) continue;
    const norm = (v) =>
      v
        .replace(/<[^>]+>/g, "")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&apos;/g, "'")
        .replace(/[*_`\[\]()]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const plain = norm(text);
    const re = new RegExp(`<h${level}(?![^>]*\\bid=)([^>]*)>([\\s\\S]*?)</h${level}>`, "g");
    result = result.replace(re, (whole, attrs, inner) => {
      if (norm(inner) !== plain) return whole;
      return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
    });
  }
  return result;
}

function renderMarkdownWithIals(input, pre) {
  /* `pre` (the raw-HTML dedent) runs first: a heading written inside an HTML
     region can be indented, and an indented `## Heading {#id}` would not match
     the heading pattern. */
  const { md, ids } = extractInlineAttributeLists(pre ? pre(input) : input);
  return applyHeadingIds(marked.parse(md), ids);
}

/**
 * Kramdown treats a block-level HTML element as one raw region: everything
 * between `<section>` and `</section>` is passed through, blank lines and all,
 * and indentation inside it never becomes a code block. CommonMark (marked)
 * closes an HTML block at the first blank line, so the indented HTML that
 * follows is turned into `<pre><code>&lt;div ...`.
 *
 * These sources are HTML-heavy Markdown, so we reproduce the kramdown side of
 * that by flattening indentation while inside an HTML region. Markdown
 * structure at the top level (lists, fenced code, headings) is untouched.
 */
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img",
  "input", "link", "meta", "param", "source", "track", "wbr"]);
const TAG_RE = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:'[^']*'|"[^"]*"|[^'">])*)(\/?)>/g;

function dedentHtmlRegions(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let depth = 0;
  let carry = "";       // an unterminated start tag spilling onto the next line
  let fence = null;     // active ``` or ~~~ fence marker

  for (const line of lines) {
    const trimmed = line.trim();

    if (fence !== null) {
      out.push(line);
      if (trimmed.startsWith(fence)) fence = null;
      continue;
    }
    const fenceOpen = /^(```+|~~~+)/.exec(trimmed);
    if (fenceOpen && depth === 0 && carry === "") {
      fence = fenceOpen[1];
      out.push(line);
      continue;
    }

    const insideHtml = depth > 0 || carry !== "";
    const startsTag = /^<[!/]?[a-zA-Z]/.test(trimmed);
    out.push(insideHtml || startsTag ? line.replace(/^[ \t]+/, "") : line);

    // Track how this line changes HTML nesting depth.
    const work = carry + line;
    let m;
    let consumed = 0;
    TAG_RE.lastIndex = 0;
    while ((m = TAG_RE.exec(work)) !== null) {
      consumed = TAG_RE.lastIndex;
      const name = m[2];
      if (!name) continue; // comment
      const selfClosing = m[4] === "/";
      if (VOID_TAGS.has(name.toLowerCase()) || selfClosing) continue;
      if (m[1] === "/") depth = Math.max(0, depth - 1);
      else depth += 1;
    }
    const rest = work.slice(consumed);
    const open = rest.lastIndexOf("<");
    carry = open >= 0 && /^<[/]?[a-zA-Z]/.test(rest.slice(open)) ? rest.slice(open) + " " : "";
  }
  return out.join("\n");
}

const markdownify = (input) =>
  (toS(input).length ? renderMarkdownWithIals(toS(input)) : "");
const markdownifyDocument = (input) =>
  (toS(input).length ? renderMarkdownWithIals(toS(input), dedentHtmlRegions) : "");

function stripHtml(input) {
  return toS(input)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "");
}

function escapeHtml(input) {
  return toS(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(input, mode = "default") {
  let s = toS(input);
  if (mode === "none") return s;
  if (mode === "raw") return s.replace(/\s+/g, "-");
  s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  if (mode === "pretty") s = s.replace(/[^\p{L}\p{N}._~!$&'()+,;=@-]+/gu, "-");
  else if (mode === "ascii") s = s.replace(/[^a-zA-Z0-9]+/g, "-");
  else if (mode === "latin") s = s.replace(/[^\p{L}\p{N}]+/gu, "-");
  else s = s.replace(/[^\p{L}\p{N}]+/gu, "-");
  return s.replace(/^-+|-+$/g, "").toLowerCase();
}

function isAbsoluteUrl(s) {
  return /^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith("//");
}

function relativeUrl(input) {
  if (input === null || input === undefined) return "";
  const s = toS(input);
  if (!s) return site.baseurl || "";
  if (isAbsoluteUrl(s)) return s;
  const joined = (site.baseurl || "") + (s.startsWith("/") ? s : "/" + s);
  return joined.replace(/([^:])\/{2,}/g, "$1/");
}

function absoluteUrl(input) {
  const s = toS(input);
  if (isAbsoluteUrl(s)) return s;
  return (site.url || "") + relativeUrl(s);
}

/** Jekyll `where`: Array(item[prop]).map(&:to_s).include?(value.to_s) */
function jekyllWhere(input, property, value) {
  const list = toArray(input);
  if (value === undefined || value === null) {
    return list.filter((o) => isObj(o) && (o[property] === null || o[property] === undefined));
  }
  const target = toS(value);
  return list.filter((o) => {
    if (!isObj(o)) return false;
    return toArray(o[property]).map(toS).includes(target);
  });
}

function cmp(a, b) {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  const as = toS(a); const bs = toS(b);
  return as < bs ? -1 : as > bs ? 1 : 0;
}

function jekyllSort(input, property, nils = "first") {
  const list = toArray(input).slice();
  if (property === undefined || property === null) return list.sort(cmp);
  const nilFirst = toS(nils) !== "last";
  return list.sort((x, y) => {
    const a = isObj(x) ? x[property] : undefined;
    const b = isObj(y) ? y[property] : undefined;
    const aNil = a === null || a === undefined;
    const bNil = b === null || b === undefined;
    if (aNil && bNil) return 0;
    if (aNil) return nilFirst ? -1 : 1;
    if (bNil) return nilFirst ? 1 : -1;
    return cmp(a, b);
  });
}

/** Registered filters. Anything not here (and not built into liquidjs) throws. */
const FILTERS = {
  relative_url: relativeUrl,
  absolute_url: absoluteUrl,

  date: (input, format) => {
    const d = coerceDate(input);
    if (!d) return toS(input);
    if (format === undefined || format === null || format === "") return d.toString();
    return strftime(d, toS(format));
  },
  date_to_string: (i) => { const d = coerceDate(i); return d ? strftime(d, "%d %b %Y") : toS(i); },
  date_to_long_string: (i) => { const d = coerceDate(i); return d ? strftime(d, "%d %B %Y") : toS(i); },
  date_to_xmlschema: (i) => { const d = coerceDate(i); return d ? xmlSchema(d) : toS(i); },
  date_to_rfc822: (i) => { const d = coerceDate(i); return d ? strftime(d, "%a, %d %b %Y %H:%M:%S %z") : toS(i); },

  strip_html: stripHtml,
  strip_newlines: (i) => toS(i).replace(/\r?\n/g, ""),
  normalize_whitespace: (i) => toS(i).replace(/\s+/g, " ").trim(),
  xml_escape: escapeHtml,
  cgi_escape: (i) => encodeURIComponent(toS(i)).replace(/%20/g, "+").replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()),
  uri_escape: (i) => encodeURI(toS(i)).replace(/%5B/g, "[").replace(/%5D/g, "]"),

  number_of_words: (i) => { const t = toS(i).trim(); return t ? t.split(/\s+/).length : 0; },
  markdownify,
  jsonify: (i) => JSON.stringify(i === undefined ? null : i),
  slugify: (i, mode) => slugify(i, mode || "default"),
  inspect: (i) => JSON.stringify(i === undefined ? null : i),
  to_integer: (i) => parseInt(toS(i), 10) || 0,

  where: jekyllWhere,
  sort: jekyllSort,

  group_by: (input, prop) => {
    const groups = new Map();
    for (const item of toArray(input)) {
      const k = toS(isObj(item) ? item[prop] : undefined);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(item);
    }
    return [...groups].map(([name, items]) => ({ name, items, size: items.length }));
  },

  array_to_sentence_string: (input, connector = "and") => {
    const a = toArray(input).map(toS);
    if (a.length === 0) return "";
    if (a.length === 1) return a[0];
    if (a.length === 2) return `${a[0]} ${connector} ${a[1]}`;
    return `${a.slice(0, -1).join(", ")}, ${connector} ${a[a.length - 1]}`;
  },

  pop: (a) => { const c = toArray(a).slice(); c.pop(); return c; },
  shift: (a) => { const c = toArray(a).slice(); c.shift(); return c; },
  push: (a, v) => [...toArray(a), v],
  unshift: (a, v) => [v, ...toArray(a)],
  sample: (a, n = 1) => toArray(a).slice(0, Number(n) || 1),
};

for (const [name, fn] of Object.entries(FILTERS)) liquid.registerFilter(name, fn);

/** where_exp needs the render context to evaluate its expression per item. */
liquid.registerFilter("where_exp", function (input, varName, expr) {
  const list = toArray(input);
  const out = [];
  for (const item of list) {
    const scope = {}; scope[toS(varName)] = item;
    let keep = false;
    try {
      this.context.push(scope);
      keep = Boolean(this.liquid.evalValueSync(toS(expr), this.context));
    } finally {
      this.context.pop();
    }
    if (keep) out.push(item);
  }
  return out;
});

/**
 * Guard: any filter used anywhere in the sources that liquidjs does not know
 * and we have not registered is a hard failure, surfaced before rendering.
 */
const KNOWN_LIQUIDJS_FILTERS = new Set([
  "abs", "append", "at_least", "at_most", "capitalize", "ceil", "compact",
  "concat", "default", "divided_by", "downcase", "escape", "escape_once",
  "find", "find_exp", "find_index", "find_index_exp", "first", "floor",
  "has", "has_exp", "join", "json", "last", "lstrip", "map", "minus",
  "modulo", "newline_to_br", "plus", "prepend", "raw", "reject", "reject_exp",
  "remove", "remove_first", "remove_last", "replace", "replace_first",
  "replace_last", "reverse", "round", "rstrip", "size", "slice", "sort",
  "sort_natural", "split", "strip", "strip_html", "strip_newlines", "sum",
  "times", "truncate", "truncatewords", "uniq", "upcase", "url_decode",
  "url_encode", "where", "where_exp",
]);

/* ────────────────────────────────────────────────────────────────────────────
 * Document collection
 * ──────────────────────────────────────────────────────────────────────────*/

const POST_NAME_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|markdown|html)$/;

function relOf(abs) {
  return path.relative(ROOT, abs).split(path.sep).join("/");
}

function makeDoc(abs, kind, collection) {
  const rel = relOf(abs);
  const raw = fs.readFileSync(abs, "utf8");
  const { data, body } = parseFrontMatter(raw, rel);
  if (data === null) return null; // no front matter → Jekyll treats it as a static file
  const ext = path.extname(abs).toLowerCase();
  return {
    abs, rel, kind, collection,
    ext,
    basename: path.basename(abs, path.extname(abs)),
    data: { ...data },
    body,
    isMarkdown: ext === ".md" || ext === ".markdown",
  };
}

const docs = [];

// 1. Root-level *.html
for (const f of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!f.isFile() || !f.name.endsWith(".html")) continue;
  if (isExcluded(f.name)) continue;
  const d = makeDoc(path.join(ROOT, f.name), "page", null);
  if (d) docs.push(d); else warnings.push(`${f.name} has no front matter — treated as a static file`);
}

// 2. Every other root-level directory Jekyll would process (not _underscored,
//    not dot-prefixed, not excluded, not assets or tooling).
const SKIP_DIRS = new Set(["assets", "node_modules", "vendor", "scripts", "_site", "_preview"]);
const rootDirs = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((n) => !n.startsWith("_") && !n.startsWith(".") && !SKIP_DIRS.has(n) && !isExcluded(n));
for (const dir of rootDirs) {
  for (const abs of walk(path.join(ROOT, dir))) {
    if (!abs.endsWith(".html")) continue;
    if (isExcluded(relOf(abs))) continue;
    const d = makeDoc(abs, "page", null);
    if (d) docs.push(d);
  }
}

// 3. _pages/**  (*.html, *.md)
for (const abs of walk(path.join(ROOT, "_pages"))) {
  if (!/\.(html|md|markdown)$/i.test(abs)) continue;
  const d = makeDoc(abs, "page", null);
  if (d) docs.push(d);
}

// 4. _posts/*.md
const postDocs = [];
if (fs.existsSync(path.join(ROOT, "_posts"))) {
  for (const name of fs.readdirSync(path.join(ROOT, "_posts"))) {
    const m = POST_NAME_RE.exec(name);
    if (!m) continue;
    const d = makeDoc(path.join(ROOT, "_posts", name), "post", "posts");
    if (!d) continue;
    d.fileSlug = m[4];
    d.fileDate = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    postDocs.push(d);
  }
}

// 5. _guides/*.md  (collection: guides)
const guideDocs = [];
if (fs.existsSync(path.join(ROOT, "_guides"))) {
  for (const name of fs.readdirSync(path.join(ROOT, "_guides")).sort()) {
    if (!/\.(md|markdown|html)$/i.test(name)) continue;
    const d = makeDoc(path.join(ROOT, "_guides", name), "guide", "guides");
    if (d) guideDocs.push(d);
  }
}

docs.push(...postDocs, ...guideDocs);

// Drop anything explicitly unpublished (Jekyll's `published: false`)
const published = docs.filter((d) => d.data.published !== false);

/* ────────────────────────────────────────────────────────────────────────────
 * front matter defaults
 * ──────────────────────────────────────────────────────────────────────────*/

const defaultsList = toArray(config.defaults)
  .filter(isObj)
  .map((entry, index) => ({
    index,
    path: toS(entry?.scope?.path || ""),
    type: entry?.scope?.type ? toS(entry.scope.type) : null,
    values: isObj(entry.values) ? entry.values : {},
  }))
  // Jekyll: least specific first, so more specific defaults overwrite them.
  .sort((a, b) => (a.path.length - b.path.length) || ((a.type ? 1 : 0) - (b.type ? 1 : 0)) || (a.index - b.index));

function docType(d) {
  if (d.kind === "post") return "posts";
  if (d.collection) return d.collection;
  return "pages";
}

function applyDefaults(d) {
  const merged = {};
  for (const def of defaultsList) {
    const scopePath = def.path.replace(/^\/+|\/+$/g, "");
    if (scopePath && !(d.rel === scopePath || d.rel.startsWith(scopePath + "/"))) continue;
    if (def.type && def.type !== docType(d)) continue;
    Object.assign(merged, def.values);
  }
  d.data = { ...merged, ...d.data }; // explicit front matter always wins
}

published.forEach(applyDefaults);

/* ────────────────────────────────────────────────────────────────────────────
 * URL resolution
 * ──────────────────────────────────────────────────────────────────────────*/

const COLLECTION_CONFIG = isObj(config.collections) ? config.collections : {};
const GLOBAL_PERMALINK = toS(config.permalink || "date");

const BUILT_IN_STYLES = {
  date: "/:categories/:year/:month/:day/:title:output_ext",
  pretty: "/:categories/:year/:month/:day/:title/",
  ordinal: "/:categories/:year/:y_day/:title:output_ext",
  weekdate: "/:categories/:year/:week/:short_day/:title:output_ext",
  none: "/:categories/:title:output_ext",
};

function permalinkStyle(s) {
  return BUILT_IN_STYLES[s] || s;
}

function placeholders(d) {
  const date = d.data.date instanceof Date ? d.data.date
    : d.data.date ? coerceDate(d.data.date)
    : d.fileDate || null;
  const titleSlug = d.data.slug ? slugify(d.data.slug, "raw") : slugify(d.fileSlug || d.basename, "raw");
  const cats = toArray(d.data.categories || d.data.category).map((c) => slugify(c)).join("/");
  const relDir = path.dirname(d.rel) === "." ? "" : path.dirname(d.rel);
  return {
    ":year": date ? String(tzParts(date).Y) : "",
    ":month": date ? pad(tzParts(date).M) : "",
    ":i_month": date ? String(tzParts(date).M) : "",
    ":day": date ? pad(tzParts(date).D) : "",
    ":i_day": date ? String(tzParts(date).D) : "",
    ":short_year": date ? pad(tzParts(date).Y % 100) : "",
    ":title": titleSlug,
    ":slug": titleSlug,
    ":name": slugify(d.fileSlug || d.basename, "raw"),
    ":basename": d.basename,
    ":categories": cats,
    ":path": relDir,
    ":output_ext": ".html",
  };
}

function expandPermalink(pattern, d) {
  const ph = placeholders(d);
  let out = pattern;
  // longest placeholders first so :i_month is not eaten by :month, etc.
  for (const key of Object.keys(ph).sort((a, b) => b.length - a.length)) {
    out = out.split(key).join(ph[key]);
  }
  return out.replace(/\/{2,}/g, "/");
}

function resolveUrl(d) {
  const explicit = d.data.permalink;
  if (explicit !== undefined && explicit !== null && toS(explicit) !== "") {
    const p = toS(explicit);
    return p.startsWith("/") ? p : "/" + p;
  }
  if (d.collection && d.collection !== "posts") {
    const cfg = COLLECTION_CONFIG[d.collection];
    const pattern = isObj(cfg) && cfg.permalink ? toS(cfg.permalink) : "/:collection/:path/";
    return expandPermalink(permalinkStyle(pattern), d);
  }
  if (d.kind === "post") {
    return expandPermalink(permalinkStyle(GLOBAL_PERMALINK), d);
  }
  // pages: an explicit global permalink style applies, otherwise mirror the path
  if (GLOBAL_PERMALINK && !BUILT_IN_STYLES[GLOBAL_PERMALINK] && GLOBAL_PERMALINK.includes(":")) {
    return expandPermalink(GLOBAL_PERMALINK, d);
  }
  const relDir = path.dirname(d.rel) === "." ? "" : "/" + path.dirname(d.rel);
  return d.basename === "index" ? `${relDir}/` : `${relDir}/${d.basename}.html`;
}

function outputPathFor(url) {
  let u = url;
  if (!u.startsWith("/")) u = "/" + u;
  if (u.endsWith("/")) u += "index.html";
  return u.replace(/^\//, "");
}

for (const d of published) {
  d.url = resolveUrl(d);
  d.outputPath = outputPathFor(d.url);
}

/* ────────────────────────────────────────────────────────────────────────────
 * URL conflict detection
 * ──────────────────────────────────────────────────────────────────────────*/

const byOutput = new Map();
for (const d of published) {
  if (byOutput.has(d.outputPath)) {
    conflicts.push({ output: d.outputPath, url: d.url, a: byOutput.get(d.outputPath).rel, b: d.rel });
  } else {
    byOutput.set(d.outputPath, d);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Document drops (what `page`, `site.posts`, `site.guides` expose)
 * ──────────────────────────────────────────────────────────────────────────*/

function excerptOf(d) {
  if (d.data.excerpt !== undefined) return d.data.excerpt;
  const sep = toS(config.excerpt_separator ?? "\n\n");
  const first = d.body.trimStart().split(sep)[0] || "";
  return d.isMarkdown ? markdownify(first) : first;
}

for (const d of published) {
  const date = d.data.date instanceof Date ? d.data.date
    : d.data.date ? coerceDate(d.data.date)
    : d.fileDate || null;
  d.drop = {
    ...d.data,
    date,
    url: d.url,
    id: d.url.replace(/\/$/, ""),
    path: d.rel,
    slug: d.data.slug !== undefined ? toS(d.data.slug) : (d.fileSlug || d.basename),
    name: path.basename(d.abs),
    collection: d.collection,
    excerpt: excerptOf(d),
    content: "", // filled in at render time
    title: d.data.title,
    dir: "/" + (path.dirname(d.rel) === "." ? "" : path.dirname(d.rel) + "/"),
  };
}

site.posts = published.filter((d) => d.kind === "post")
  .sort((a, b) => (b.drop.date?.getTime() || 0) - (a.drop.date?.getTime() || 0))
  .map((d) => d.drop);

const ORDER_KEYS = ["order", "position"];
site.guides = published.filter((d) => d.kind === "guide")
  .sort((a, b) => {
    const key = ORDER_KEYS.find((k) => a.data[k] !== undefined || b.data[k] !== undefined);
    if (key) {
      const av = a.data[key]; const bv = b.data[key];
      const c = cmp(av === undefined ? null : av, bv === undefined ? null : bv);
      if (c !== 0) return c;
    }
    return a.basename < b.basename ? -1 : a.basename > b.basename ? 1 : 0;
  })
  .map((d) => d.drop);

site.pages = published.filter((d) => d.kind === "page").map((d) => d.drop);
site.documents = [...site.posts, ...site.guides];
site.collections = Object.keys(COLLECTION_CONFIG).map((label) => ({
  label, docs: label === "guides" ? site.guides : [], output: true,
}));
site.html_pages = site.pages;

for (const p of site.posts) {
  for (const c of toArray(p.categories || p.category)) {
    (site.categories[toS(c)] ||= []).push(p);
  }
  for (const t of toArray(p.tags)) {
    (site.tags[toS(t)] ||= []).push(p);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Layouts
 * ──────────────────────────────────────────────────────────────────────────*/

const layouts = new Map();
if (fs.existsSync(LAYOUTS_DIR)) {
  for (const name of fs.readdirSync(LAYOUTS_DIR)) {
    if (!/\.(html|md|markdown)$/i.test(name)) continue;
    const abs = path.join(LAYOUTS_DIR, name);
    const raw = fs.readFileSync(abs, "utf8");
    const { data, body } = parseFrontMatter(raw, relOf(abs));
    layouts.set(path.basename(name, path.extname(name)), {
      name: path.basename(name, path.extname(name)),
      data: data || {}, body, rel: relOf(abs),
    });
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Filter-coverage guard
 * ──────────────────────────────────────────────────────────────────────────*/

function scanFilterNames() {
  const used = new Set();
  const files = [
    ...published.map((d) => d.abs),
    ...[...layouts.values()].map((l) => path.join(LAYOUTS_DIR, l.name + ".html")),
    ...(fs.existsSync(INCLUDES_DIR) ? fs.readdirSync(INCLUDES_DIR).map((f) => path.join(INCLUDES_DIR, f)) : []),
  ];
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const s = fs.readFileSync(f, "utf8");
    for (const m of s.matchAll(/\{\{([\s\S]*?)\}\}|\{%([\s\S]*?)%\}/g)) {
      const body = m[1] || m[2] || "";
      for (const fm of body.matchAll(/\|\s*([a-zA-Z_][a-zA-Z_0-9]*)/g)) used.add(fm[1]);
    }
  }
  return used;
}

const usedFilters = scanFilterNames();
const missingFilters = [...usedFilters].filter(
  (f) => !FILTERS[f] && f !== "where_exp" && !KNOWN_LIQUIDJS_FILTERS.has(f)
);
if (missingFilters.length) {
  errors.push(`unimplemented Liquid filters used in the sources: ${missingFilters.join(", ")}`);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Rendering
 * ──────────────────────────────────────────────────────────────────────────*/

function renderLiquid(source, scope, label) {
  return liquid.parseAndRenderSync(source, scope);
}

function renderDoc(d) {
  const page = d.drop;
  const scope = { site, page, jekyll: { environment: "development", version: "4.3-preview" }, paginator: null };

  let body = renderLiquid(d.body, scope, d.rel);
  if (d.isMarkdown) body = markdownifyDocument(body);
  page.content = body;

  let content = body;
  let layoutName = d.data.layout;
  const seen = new Set();
  while (layoutName) {
    const key = toS(layoutName);
    if (seen.has(key)) throw new Error(`layout loop at '${key}'`);
    seen.add(key);
    const layout = layouts.get(key);
    if (!layout) throw new Error(`missing layout '${key}' (_layouts/${key}.html)`);
    content = renderLiquid(layout.body, { ...scope, content, layout: layout.data }, layout.rel);
    layoutName = layout.data.layout;
  }
  return content;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Write output
 * ──────────────────────────────────────────────────────────────────────────*/

rmrf(OUT);
mkdirp(OUT);

const routes = [];
let renderedCount = 0;

for (const d of published) {
  if (byOutput.get(d.outputPath) !== d) continue; // loser of a conflict — never written
  let html;
  try {
    html = renderDoc(d);
  } catch (err) {
    errors.push(`${d.rel} → ${d.url}: ${err.message}`);
    continue;
  }
  const dest = path.join(OUT, d.outputPath);
  mkdirp(path.dirname(dest));
  fs.writeFileSync(dest, html, "utf8");
  routes.push(d.url);
  renderedCount += 1;
}

// jekyll-sitemap
const sitemapDocs = published.filter(
  (d) => byOutput.get(d.outputPath) === d && d.data.sitemap !== false && routes.includes(d.url)
);
const sitemapXml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapDocs
    .map((d) => {
      const last = d.drop.last_modified_at || d.data.updated || d.drop.date || site.time;
      const lastDate = coerceDate(last) || site.time;
      return `  <url>\n    <loc>${escapeHtml(absoluteUrl(d.url))}</loc>\n    <lastmod>${xmlSchema(lastDate)}</lastmod>\n  </url>`;
    })
    .sort()
    .join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemapXml, "utf8");

// robots.txt — emitted only if the source has one
const robotsSrc = ["robots.txt", "assets/robots.txt"]
  .map((p) => path.join(ROOT, p))
  .find((p) => fs.existsSync(p));
let robotsNote = "no robots.txt in source — none emitted";
if (robotsSrc) {
  fs.writeFileSync(path.join(OUT, "robots.txt"), fs.readFileSync(robotsSrc, "utf8"), "utf8");
  robotsNote = `copied ${relOf(robotsSrc)}`;
}

// _redirects (listed under `include:` in _config.yml, so Jekyll ships it)
if (fs.existsSync(path.join(ROOT, "_redirects"))) {
  fs.copyFileSync(path.join(ROOT, "_redirects"), path.join(OUT, "_redirects"));
}

fs.writeFileSync(
  path.join(OUT, ".assets-are-not-copied"),
  [
    "This preview tree deliberately contains NO copy of assets/.",
    "",
    "The QA script validates asset references (CSS, JS, images, fonts) by",
    "checking that each referenced path exists in the SOURCE tree, not by",
    "checking a copied build output. Duplicating tens of megabytes of images",
    "into _preview/ would slow every run and prove nothing extra.",
    "",
    "So: a link such as /assets/css/site.min.css in a rendered page is",
    "validated against <repo>/assets/css/site.min.css on disk.",
    "",
    "Note that assets/css/*.min.css are produced by scripts/build-css.mjs and",
    "will be absent until `npm run build:css` has been run at least once.",
    "",
    "Generated by scripts/preview/render.mjs.",
    "",
  ].join("\n"),
  "utf8"
);

/* ────────────────────────────────────────────────────────────────────────────
 * Summary
 * ──────────────────────────────────────────────────────────────────────────*/

const sortedRoutes = routes.slice().sort();

console.log("aw-preview-harness — an approximation of `bundle exec jekyll build`");
console.log(`root:   ${ROOT}`);
console.log(`output: ${path.relative(ROOT, OUT)}/`);
console.log("");
console.log(`Documents found:    ${published.length}`);
console.log(`Documents rendered: ${renderedCount}`);
console.log(`  posts:  ${site.posts.length}`);
console.log(`  guides: ${site.guides.length}`);
console.log(`  pages:  ${site.pages.length}`);
console.log(`Sitemap entries:    ${sitemapDocs.length} (excluded by \`sitemap: false\`: ${routes.length - sitemapDocs.length})`);
console.log(`robots.txt:         ${robotsNote}`);
console.log("");
console.log(`Routes (${sortedRoutes.length}):`);
for (const r of sortedRoutes) console.log(`  ${r}  →  _preview/${outputPathFor(r)}`);

if (warnings.length) {
  console.log("");
  console.log(`Notes (${warnings.length}):`);
  for (const w of warnings) console.log(`  - ${w}`);
}

if (conflicts.length) {
  console.log("");
  console.log("!".repeat(76));
  for (const c of conflicts) {
    console.log(`!! URL CONFLICT: ${c.url}`);
    console.log(`!!   would be written to _preview/${c.output} by BOTH:`);
    console.log(`!!     ${c.a}   (rendered — won because it was collected first)`);
    console.log(`!!     ${c.b}   (NOT rendered)`);
    console.log(`!!   Jekyll would silently let one overwrite the other. Fix the source.`);
  }
  console.log("!".repeat(76));
}

if (errors.length) {
  console.log("");
  console.log(`Errors (${errors.length}):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
}

const failed = errors.length > 0 || conflicts.length > 0;
console.log("");
console.log(failed
  ? `FAILED — ${errors.length} render error(s), ${conflicts.length} URL conflict(s)`
  : `OK — ${renderedCount} routes rendered, no conflicts, no errors`);

process.exit(failed ? 1 : 0);

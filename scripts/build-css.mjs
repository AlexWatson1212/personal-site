/* Build the single stylesheet.
 *
 * The site previously shipped thirteen PurgeCSS bundles cut from a 14,899-line
 * source that had accumulated forty-three dated override passes. Purging was
 * necessary because most of what a page downloaded was rules for other pages.
 *
 * assets/css/studio.css is written rather than accumulated: roughly 76 KB of
 * source, ~13 KB over the wire, covering every route. One file is cached once
 * and reused on every subsequent page, which is faster in practice than
 * thirteen page-specific bundles that each miss the cache on first visit.
 *
 * So there is nothing to purge. This step minifies, and fails loudly if the
 * self-hosted faces or the token block ever go missing.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "lightningcss";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "assets/css/studio.css");
const output = path.join(root, "assets/css/studio.min.css");

const css = await fs.readFile(source, "utf8");

const required = [
  ['@font-face for Newsreader', /font-family:\s*"Newsreader"/],
  ['@font-face for Inter', /font-family:\s*"Inter"/],
  ['the token block', /--paper:\s*#f7f4ef/i],
  ['the reduced-motion guard', /prefers-reduced-motion:\s*no-preference/]
];

for (const [name, pattern] of required) {
  if (!pattern.test(css)) {
    console.error(`build-css: ${name} is missing from studio.css. Refusing to build.`);
    process.exit(1);
  }
}

/* No !important should ever re-enter this stylesheet. The old cascade needed
   1,100 of them; this one needs none, and that is worth protecting. */
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, "");
const important = (declarations.match(/!important/g) || []).length;
if (important > 0) {
  console.error(`build-css: found ${important} !important declarations in studio.css. Refusing to build.`);
  process.exit(1);
}

const { code, warnings } = transform({
  code: Buffer.from(css),
  filename: "studio.css",
  minify: true,
  sourceMap: false,
  targets: {
    chrome: 111 << 16,
    firefox: 121 << 16,
    safari: (17 << 16) | (4 << 8)
  },
  /* Container queries, colour-mix, nesting-free syntax and scroll-driven
     animations are all left as authored: lightningcss must not attempt to
     lower animation-timeline, which has no polyfillable equivalent. */
  drafts: { customMedia: false }
});

for (const warning of warnings) console.warn("build-css:", warning.message);

await fs.writeFile(output, code);

const before = Buffer.byteLength(css);
const after = code.length;
console.log(
  `build-css: studio.css ${(before / 1024).toFixed(1)} KB -> studio.min.css ${(after / 1024).toFixed(1)} KB`
);

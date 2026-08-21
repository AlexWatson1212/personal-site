import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PurgeCSS } from "purgecss";
import { transform } from "lightningcss";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputFiles = [
  path.join(projectRoot, "assets/css/main.css"),
  path.join(projectRoot, "assets/css/visual-system.css")
];
const combinedCss = (await Promise.all(
  inputFiles.map(file => fs.readFile(file, "utf8"))
)).join("\n");

const sharedContent = [
  path.join(projectRoot, "_includes/**/*.html"),
  path.join(projectRoot, "_layouts/default.html"),
  path.join(projectRoot, "assets/js/nav.js")
];
const allContent = [
  path.join(projectRoot, "*.html"),
  path.join(projectRoot, "services/**/*.html"),
  path.join(projectRoot, "links/**/*.html"),
  path.join(projectRoot, "_includes/**/*.html"),
  path.join(projectRoot, "_layouts/**/*.html"),
  path.join(projectRoot, "_pages/**/*.{html,md,markdown}"),
  path.join(projectRoot, "_posts/**/*.{html,md,markdown}"),
  path.join(projectRoot, "_guides/**/*.{html,md,markdown}"),
  path.join(projectRoot, "assets/js/*.js")
];
const bundles = [
  ["home", [path.join(projectRoot, "index.html")]],
  ["service", [path.join(projectRoot, "service.html"), path.join(projectRoot, "assets/js/service-documents.js")]],
  ["practice-clarity", [path.join(projectRoot, "practice-clarity.html")]],
  ["work", [path.join(projectRoot, "work.html")]],
  ["about", [path.join(projectRoot, "about.html")]],
  ["blog", [path.join(projectRoot, "blog.html"), path.join(projectRoot, "_posts/**/*.{html,md,markdown}")]],
  ["contact", [path.join(projectRoot, "contact.html"), path.join(projectRoot, "assets/js/contact-enquiry.js")]],
  ["guide", [path.join(projectRoot, "_guides/**/*.{html,md,markdown}"), path.join(projectRoot, "_layouts/guide.html")]],
  ["post", [path.join(projectRoot, "_posts/**/*.{html,md,markdown}"), path.join(projectRoot, "_layouts/post.html")]],
  ["legal", [path.join(projectRoot, "_pages/**/*.{html,md,markdown}"), path.join(projectRoot, "_layouts/page.html")]],
  ["404", [path.join(projectRoot, "404.html")]],
  ["purchase", [
    path.join(projectRoot, "services/**/*.html"),
    path.join(projectRoot, "purchase-complete.html"),
    path.join(projectRoot, "assets/js/straightforward-questionnaire.js")
  ]],
  ["site", allContent]
];

for (const [name, pageContent] of bundles) {
  const [{ css: purgedCss }] = await new PurgeCSS().purge({
    content: [...sharedContent, ...pageContent],
    css: [{ raw: combinedCss, extension: "css" }],
    safelist: {
      standard: ["active", "is-active", "is-open", "menu-open", "open"],
      greedy: [/^has-/, /^is-/, /^menu-/, /^nav__/]
    },
    fontFace: true,
    keyframes: true,
    variables: false
  });

  const { code } = transform({
    code: Buffer.from(purgedCss),
    filename: `${name}.css`,
    minify: true,
    sourceMap: false,
    targets: {
      chrome: 109 << 16,
      firefox: 115 << 16,
      safari: 16 << 16
    }
  });

  const outputFile = path.join(projectRoot, `assets/css/${name}.min.css`);
  await fs.writeFile(outputFile, code);
  process.stdout.write(`Built ${path.relative(projectRoot, outputFile)} (${code.length} bytes)\n`);
}

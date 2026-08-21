# aw-preview-harness

A small Node stand-in for `bundle exec jekyll build`, for local QA only.

## Why it exists

Ruby gems cannot always be installed (rubygems.org is unreachable from some
build/QA containers), so the real Jekyll build cannot run. This harness reads
the same sources Jekyll reads — `_config.yml`, `_data/`, `_includes/`,
`_layouts/`, `_pages/`, `_posts/`, `_guides/`, and the root/`contact/`/`links/`
HTML pages — and writes a `_preview/` tree at the repo root that mirrors the
HTML routes `_site/` would contain.

It is **local tooling**. It is deliberately kept out of the root
`package.json` so the Netlify build is completely unaffected: Netlify still
runs `npm run build` → `build:css` + `bundle exec jekyll build`, and never sees
this directory.

## What it does

- Parses `_config.yml` with `js-yaml` and exposes **every** top-level key on
  `site` verbatim (so `site.stripe_payment_link`, `site.template_website_price`
  and friends resolve), plus `site.title`, `site.description`, `site.url`,
  `site.baseurl`, `site.time`, `site.data.*`, `site.posts`, `site.guides`,
  `site.pages`, `site.categories`, `site.tags`.
- Applies `defaults:` (front matter defaults by scope path and type), honours
  `exclude:`/`include:`, and skips `published: false`.
- Resolves URLs the way Jekyll does: explicit `permalink` first, then the
  collection permalink (`guides` → `/guides/:name/`), then the global
  `permalink: /:title/`. `:title` uses front-matter `slug` when present, which
  is why `_posts/2026-07-03-beyond-counselling-directory-…md` lands on
  `/beyond-counselling-directory/`.
- Renders with `liquidjs` in Jekyll-include mode, so `{% include head.html %}`
  and `{% include template-website-buy.html id="hero" %}` both work and named
  arguments arrive as `include.id`.
- Chains layouts through front matter (`guide` → `default`) via `{{ content }}`.
- Implements the Jekyll filters this repo uses (`relative_url`, `absolute_url`,
  `date`, `date_to_*`, `strip_html`, `strip_newlines`, `normalize_whitespace`,
  `markdownify`, `jsonify`, `slugify`, `where`, `where_exp`, `sort`,
  `number_of_words`, `xml_escape`, `uri_escape`, …) on top of liquidjs's
  standard set. `strictFilters` is on and a pre-flight scan fails the run if
  the sources use a filter nothing implements — **a missing filter is a loud
  error, never a silently empty string**.
- Emits `_preview/sitemap.xml` (jekyll-sitemap emulation, honouring
  `sitemap: false`), copies `_redirects`, and copies `robots.txt` if one exists.
- Detects **URL conflicts**: if two sources resolve to the same output file it
  prints a `URL CONFLICT` block naming both and exits non-zero, rather than
  letting one silently overwrite the other the way Jekyll does.

## What it does NOT guarantee

**This is an approximation of Jekyll, not a substitute for
`bundle exec jekyll build`.** Ship nothing on the strength of this alone.

- **Markdown engine.** The site uses kramdown with `input: GFM`; this harness
  uses `marked`. Output differs on edge cases: attribute lists (`{: .class}`),
  footnotes, definition lists, typographic smart quotes, table quirks and
  heading ID generation. Where these sources put HTML inside Markdown, the
  harness flattens indentation inside HTML regions to reproduce kramdown's raw
  HTML block behaviour — close, but not identical.
- **Liquid engine.** liquidjs is not Shopify Liquid + Jekyll. Error messages,
  whitespace-control corner cases, `nil` semantics and filter edge cases
  (rounding, sorting of mixed types, date parsing of unusual strings) can vary.
- **Only HTML routes are produced.** Non-HTML templated outputs are skipped —
  notably `search.json`, and `site.webmanifest`.
- **No assets are copied.** See `_preview/.assets-are-not-copied`. Asset
  references are meant to be validated by path existence against the *source*
  tree. `assets/css/*.min.css` only exist after `npm run build:css`.
- **No plugins beyond a hand-rolled `jekyll-sitemap`.** Anything else in
  `plugins:` is ignored, and sitemap `lastmod` values are approximations.
- **Timestamps are "now".** `site.time` is the moment of the run, so cache-bust
  query strings (`?v={{ site.time | date: '%s' }}`) change on every run.
- Incremental builds, drafts, pagination, `future: false` filtering, data
  cascades from `_config.yml` overrides and Sass compilation are not modelled.

## Running it

From the repo root:

```sh
node scripts/preview/render.mjs
```

Install once first (this directory only — never the root project):

```sh
cd scripts/preview && npm install
```

Output goes to `_preview/` at the repo root, which is wiped and rebuilt on each
run. The command prints a summary — documents found and rendered, the sorted
list of routes, sitemap counts, any URL conflicts and any Liquid errors — and
**exits non-zero on any render error or URL conflict**, so it can gate CI.

`scripts/preview/node_modules/` is gitignored. Consider ignoring `_preview/`
too if you do not already.

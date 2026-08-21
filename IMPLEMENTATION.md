# Implementation notes — site architecture and the purchasing journey

Internal notes. Excluded from the published site in `_config.yml`.

This file describes how the site is put together *now*. It replaces the earlier
drop-in handoff note, which described a one-off page transplant that has since
been absorbed into the project.

---

## Two design systems, deliberately

The site runs two stylesheets and it is worth knowing which is which before
editing anything.

| System | Loaded by | Pages |
| --- | --- | --- |
| **Refresh** — `assets/css/catalogue-refresh.css`, served raw via `page_css`, classes like `.shell`, `.section-paper`, `.offer-card` | pages with `page_css:` front matter, wrapped in `<div class="catalogue-refresh">` | Home, Work, Service, About, Contact, the purchase journey |
| **acw** — `assets/css/main.css` + `assets/css/visual-system.css`, purged and minified into per-page `*.min.css` bundles by `scripts/build-css.mjs`, classes prefixed `acw-` | every page, via the bundle chosen in `_includes/head.html` | Practice Clarity Library, Journal, guides, the legal pages, 404, Links |

The refresh pages load **both**: their `*.min.css` bundle first, then
`catalogue-refresh.css`. That matters, because `main.css` contains a blanket
`h1…h6 { … !important }` rule that overrides contextual heading styling in both
systems. See `OPEN_DECISIONS.md`, item 5.

Shared typographic behaviour — the responsive scale, the heading measure
tokens, `text-wrap`, dark-section colours, focus and reduced motion — is
appended at the end of each stylesheet in a clearly marked refinements block.
Change both, or neither.

---

## Routes

| Route | Source |
| --- | --- |
| `/` | `index.html` |
| `/work/` | `work.html` |
| `/service/` | `service.html` |
| `/about/` | `about.html` |
| `/contact/` | `contact.html` |
| `/blog/` | `blog.html` |
| `/practice-clarity/` | `practice-clarity.html` |
| `/links/` | `links/index.html` |
| `/404.html` | `404.html` |
| `/robots.txt` | `robots.txt` |
| **`/services/straightforward-website/`** | `services/straightforward-website.html` |
| **`/services/straightforward-website/questionnaire/`** | `services/straightforward-website-questionnaire.html` — `noindex`, `sitemap: false` |
| **`/purchase-complete/`** | `purchase-complete.html` — `noindex`, `sitemap: false` |
| **`/service-terms/straightforward-website/`** | `_pages/service-terms-straightforward-website.html` |
| **`/cancellation-and-refunds/`** | `_pages/cancellation-and-refunds.html` |
| `/privacy/` | `_pages/privacy.html` |
| **`/terms/`** | `_pages/terms.html` |
| **`/accessibility/`** | `_pages/accessibility.html` |
| `/practice-clarity/<name>/` | `_guides/*.md` |
| `/<post-slug>/` | `_posts/*.md` |

Bold routes were added or moved in this pass. `/terms/` and `/accessibility/`
were linked from the footer of every page but did not exist.

---

## Purchasing configuration

Three files, one responsibility each.

- **`_data/purchasing.yml`** — committed. Prices, and the URLs the journey links
  to. No Payment Link, no secret, nothing environment-specific.
- **`scripts/purchasing-config.mjs`** — runs first in `npm run build`. Reads
  `PUBLIC_PURCHASES_ENABLED`, `PUBLIC_STRIPE_STRAIGHTFORWARD_LINK` and
  `PUBLIC_STRIPE_TEST_LINK` from the environment and writes
  `_data/purchasing_resolved.yml`.
- **`_data/purchasing_resolved.yml`** — generated, gitignored. If it is absent,
  `site.data.purchasing_resolved` is nil, the buy component falls through to its
  disabled branch, and the page shows "Online purchasing is opening shortly".
  **Absent is a safe state, not a broken one.**

`_includes/straightforward-website-buy.html` is the only file permitted to emit
a checkout link, and it re-validates the resolved URL rather than trusting it.
`npm test` fails if any other file hard-codes a `buy.stripe.com` URL.

Guard rules, implemented in `purchasing-config.mjs` and covered by tests:

- only `https://buy.stripe.com/…` is accepted;
- a production build ignores the sandbox variable entirely, and rejects a
  sandbox-shaped URL in the live variable;
- purchasing is off unless `PUBLIC_PURCHASES_ENABLED` is exactly `true` **and** a
  link survived;
- a `sk_`/`rk_`/`whsec_`-shaped value fails the build.

There is no server-side Stripe code, no webhook handler and no secret store.
`STRIPE_SETUP.md` explains what would be required before automatic fulfilment.

---

## Draft-state flags

Two data files control whether internal draft labels are shown:

- `_data/legal.yml` → `approved: false` shows the solicitor-review notice on
  every contractual page and switches the version block to "Draft version".
- `_data/intake.yml` → `questionnaire_approved: false` shows the draft notice on
  the questionnaire.

Flipping either flag removes its notice everywhere at once. There is no per-page
banner to remember to delete.

---

## Build and test

```sh
npm install
npm run build          # purchasing config → CSS bundles → jekyll build
npm test               # source-level QA (56 checks); adds route and link
                       # checks automatically when _site/ exists
npm run test:site      # build, then test
```

Two local-only QA tools, each with its own `package.json` so the Netlify build
is unaffected:

```sh
node scripts/preview/render.mjs   # renders every route to _preview/ without Ruby
node scripts/qa-browser/run.mjs   # 32 routes × 6 viewports + 200% zoom in headless Chromium
```

The preview renderer is an approximation of Jekyll for QA. It is **not** a
substitute for `bundle exec jekyll build`, which remains the authoritative
build.

---

## Things that will bite you

- `assets/css/*.min.css` are build artefacts. Editing them is pointless; edit
  `main.css` or `visual-system.css` and run `npm run build:css`.
- PurgeCSS decides what survives per page from the globs in
  `scripts/build-css.mjs`. Adding a page in a new directory means adding it
  there, or its styles will be purged away.
- Two source files claiming the same `permalink` is not an error in Jekyll — one
  silently wins. That is how `/contact/` came to show retired prices. The
  preview renderer now fails loudly on a permalink collision, and `npm test`
  checks for it.
- Netlify `_redirects` do not fire for a path that a real file already
  produces. A retired page must be deleted, not just redirected.

# Implementation notes

## One stylesheet

`assets/css/studio.css` is the only hand-edited stylesheet, and
`assets/css/studio.min.css` (built from it) is the only one any page loads.
`_includes/head.html` has no per-route bundle logic and no page ever declares
`page_css`. See `VISUAL-SYSTEM.md` for the token set and the motion grammar.

`npm run build:css` minifies and guards: it exits non-zero if a `!important`
declaration, either `@font-face`, the token block or the reduced-motion guard
goes missing.

## The collection is data

`_data/collection.yml` holds one entry per finished case — reference number,
practice type, atmosphere, provenance, the one strategic distinction, the note,
tags, the four palette colours, the approved screenshot and its alt text, and the
routes to the case study, the live concept website and its published document.
The home page, the collection page and the contact form's design select all read
from that one file. **Adding a case is adding an entry — and is currently not
permitted.** Since 16 September 2026 the file holds exactly three flagships
(Sofia Marin, Maya Bennett, Daniel Mercer), the freeze rule is in
`DECISION-REGISTER.md`, and the *Portfolio* check in `scripts/qa.mjs` fails on a
fourth entry. Helen Calder, Harbour and Stillpoint are preserved in
`_strategy/archived-portfolio-2026-09/`, and their URLs redirect to `/work/`.

Until September 2026 the same file held eight exploratory design directions,
drawn as CSS miniatures by `_includes/plate.html` because there was nothing
finished to photograph. Both were retired to `_strategy/`, along with the filter
script the collection page used while it had eight entries to filter, and later
deleted from there; they are recoverable from git history (commit `dd9eabc`).

## One product, and the rules that keep it

**The current commercial facts live in `DECISION-REGISTER.md`, and every figure
the site renders lives in `_data/purchasing.yml`.** This section describes how
the code keeps them true; it does not restate them. (Rewritten 16 September
2026: the previous version described the August 2026 model — £500 to begin,
£495 on approval, and Practice Clarity as a separate £500 job. Both are
superseded.)

- **Practice Identity & Website.** One product. `price_display` means "what a
  client pays if they say yes today"; while the founding offer is open that is
  the founding price, and the standard price is `founding.standard_price_display`.
  The payment terms are rendered from `payment_sentence` and nowhere else. The
  balance is triggered by the client's written **direction approval** (clause
  11) — approval of the Practice Fundamentals, before the build — never by the
  studio declaring anything finished. The build begins once it is paid.
- **Practice Fundamentals** (17 September 2026) is the 11-page client
  deliverable and has no price. It replaced the Practice Clarity document, which
  had replaced the Direction Note. `clarity_display` was deleted so a template
  that refers to it fails loudly. "Practice Clarity" now names only the
  principles and the portfolio Blueprints.
- **Scope.** One complete responsive page; two consolidated feedback stages;
  corrections never use up a stage. The *Product scope* checks guard the six
  public step names and the retired formulations.
- **Identity.** A logo or wordmark, colours, typography and photography
  direction, inside the Fundamentals — see `docs/product-terminology.md` §6.
- **Enquiry fit check and intake.** `contact.html` (five questions, a
  conditional follow-up, an error summary; still a browser-built email) and the
  private `client/practice-discovery.html` (a native Netlify form, text only,
  68 questions from `_data/practice_discovery.yml`). The *Enquiry fit check* and
  *Practice Discovery* checks guard both, and that the retired questionnaire and
  the retired Tally intake stay retired.
- **Founder video.** `_data/founder.yml`; empty until a real recording exists.
  See the *Founder video* check.
- **Website Care.** Included for the first twelve months, then `website_care.monthly`
  if wanted. Technical only since 17 September 2026: content changes, additions
  and redesigns are quoted. The *Care is technical* check keeps the service
  page, the scope page and clause 12 in agreement.
- **Custom projects.** Quoted, mentioned quietly.

`APPROVED_PRICES` and `RETIRED_PRICES` in `scripts/qa.mjs` are the enforcement.
Closing the founding offer is the five-step edit written at the top of
`_data/purchasing.yml` (and in `docs/founding-practices.md` §2); `npm test`
asserts both states are internally consistent.

## The closing plate

Every page used to end with a full-bleed `on-ink` band directly above the
`on-ink` footer. The two merged into an 850–950px slab of one colour containing
245px of dead space, because the band's bottom padding and the footer's top
padding were both a full `--band`. The closing call to action is now
`.closing > .wrap > .closing__plate.on-ink` — a plate on the page's own ground —
and the footer's top padding is `--s-8`. `/guidance/` has no closing plate at
all: a page of free writing ends with a sentence, not a pitch.

## One resource surface

`/guidance/` is the only free content front door. `guidance.html` reads the
six `category: Guidance` notes from `_guides/` in `guidance_order`, then lists
the two longer practical guides, then links out to `/practice-clarity/` for the
nine principles. `practice-clarity.html` is a reference page, not a second
index: it no longer carries its own guides or journal sections, and it opens by
saying most therapists do not need to read it.

`blog.html` has been deleted. `_redirects` sends `/blog`, `/blog/` and
`/practice-notes/` to `/guidance/`, and `/library`, `/library/` and
`/practice-clarity.html` to `/practice-clarity/`. The two Journal articles keep
their own permalinks and are surfaced from `/guidance/`. A QA check ("One
resource section, one front door") fails if the header grows past four links,
regains a `<details>` dropdown, loses `/guidance/`, drops either redirect, or if
any published file links to `/blog/` again.

## Article bodies

`_layouts/guide.html` and `_layouts/post.html` put the article body in a
three-track grid: a 55ch reading column with a wider track either side. Named
components — the chapter opener, figures, diagrams, the reflection grid, the
principle navigation — step out to the full container with `grid-column: wide`.
Rows carry the rhythm, so component margins are zeroed and empty paragraphs
left by markdown around raw HTML are hidden.

The guides keep their existing in-content class names (`acw-callout`,
`acw-framework`, `acw-exercise`, `acw-pullquote`, `acw-guide-figure` and the
rest). Renaming a hundred callouts would have been change without improvement;
they are restated on the new tokens in §20.

## What the QA harnesses will catch

- `scripts/qa.mjs` — 80 checks. Prices, retired offer language, checkout scope,
  Website Care claims, legal routes, private routes, the enquiry fit check, the
  intake handoff and photography brief,
  client-data hygiene, front matter, links, anchors, assets, built output.
- `scripts/qa-browser/run.mjs` — overflow at six widths, heading wrapping,
  200% zoom, real keyboard order and focus visibility, landmarks, reduced
  motion, WCAG contrast.
- `scripts/responsive-qa/typography.mjs` — rendered line length (80 char cap),
  prose size on phones, target sizes, per-word heading measurement.
- `scripts/responsive-qa/a11y.mjs` — axe-core over 31 routes × 4 viewports.
- `scripts/responsive-qa/primary-targets.mjs` — the stricter 44px bar.

Three harness fixes were made during this work, all because a check was
measuring the wrong thing: axe now freezes animations before auditing (it was
sampling a frame mid-entrance), the primary-target check presses a real Tab
before testing `:focus-visible` and skips elements that focus cannot land on
(the closed mobile panel is laid out but out of the tab order).

## Things that will break if you are not careful

1. **Any new price fails `npm test` three times.** `APPROVED_PRICES` and
   `RETIRED_PRICES` in `scripts/qa.mjs` both have to be edited, together with
   `_data/purchasing.yml`, and the service hero admits exactly one figure.
2. **`_includes/practice-website-buy.html` is the only file allowed to emit a
   checkout link**, and it may appear on `services/practice-website.html` only.
3. **Nothing describing the Practice Fundamentals may carry a purchase action or a
   price.** It is the first stage of the one product, not a separate piece of
   work, and it is never presented as a version of the website.
4. **Website Care must not claim uptime monitoring or a backup guarantee.**
   Neither is provided. Version history, TLS and fault-fixing are, and are named.
5. Changing a permalink means editing `scripts/qa.mjs` ROUTES, `_redirects`,
   `netlify.toml`, `robots.txt` and `_data/purchasing.yml` together. For the
   client pages, also `PRIVATE_ROUTES` and the welcome email template.
8. **No third-party form service, anywhere.** The intake is Practice Discovery,
   a native Netlify form. A `tally.so` address in active source or configuration
   fails the *Practice Discovery* checks, as does a file input, a `multiple`
   attribute or multipart encoding on that form. The CSP sets `frame-src 'none'`:
   no page frames a third party. (Until 19 September 2026 the intake was an
   embedded Tally form; the retired files are in git history at `e52cb8d`.)
6. Banned strings: `unlimited revisions`, `coming soon`, `Template Website`,
   `Semi-Custom`, plus the retired offer names.
7. **The collection is three cases.** Reintroducing an archived case, or copy
   that counts the collection as six, fails the *Portfolio* check.

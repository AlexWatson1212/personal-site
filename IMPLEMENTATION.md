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

`_data/collection.yml` holds one entry per design direction — reference number,
practice type, atmosphere, note, tags, search string, four palette colours, the
headline shown in the drawing, and which layout personality to use.
`_includes/plate.html` draws it; `assets/css/studio.css` §09 styles the eight
personalities. The home page, the collection page and the contact form's design
select all read from that one file. **Adding a direction is adding an entry.**

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

- `scripts/qa.mjs` — 64 checks. Prices, retired offer language, checkout scope,
  Website Care claims, legal routes, private routes, questionnaire structure,
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

1. **Any new price fails `npm test` twice.** `APPROVED_PRICES` and
   `RETIRED_PRICES` in `scripts/qa.mjs` both have to be edited, together with
   `_data/purchasing.yml`.
2. **`_includes/practice-website-buy.html` is the only file allowed to emit a
   checkout link**, and it may appear on `services/practice-website.html` only.
3. **Nothing describing Practice Clarity may carry a purchase action.** It is
   an add-on agreed in writing and invoiced separately.
4. **Website Care must not claim uptime monitoring or a backup guarantee.**
   Neither is provided. Version history, TLS and fault-fixing are, and are named.
5. Changing a permalink means editing `scripts/qa.mjs` ROUTES, `_redirects`,
   `netlify.toml`, `robots.txt` and `_data/purchasing.yml` together.
6. Banned strings: `unlimited revisions`, `coming soon`, `Template Website`,
   `Semi-Custom`, plus the retired offer names.

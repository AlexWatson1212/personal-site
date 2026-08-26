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

## One product, one preliminary, one aftercare

The commercial architecture, and the rules that keep it:

- **Therapist Website — £995.** The only headline price. Half before the project
  begins, half before launch; the online checkout, where it is open, takes it in
  one payment instead, and clause 3 of the service terms covers both.
- **Practice Clarity — £500.** A separate, earlier piece of work that produces
  the answers a website is built from. Its written Practice Direction is the
  client's whether or not a website follows. Never a tier, a bundle or a
  checkout option, and never added to £995 to make a second headline figure.
- **Website Care.** Included for the first twelve months, then £29 a month if
  wanted. Stated as conduct — "not a bonus; it is the end of the job" — and not
  as a row in a price table, so it is never asked to justify the £995.
- **Custom projects.** Quoted, mentioned quietly.

`£1,495` was retired in August 2026 with the tier it implied, and is now in
`RETIRED_PRICES`. The check *One website price, and one place it is decided*
fails the build if a combined figure reappears anywhere, if the `/service/` hero
shows more than one price, if Practice Clarity is introduced before Website Care
on that page, or if any published page says `upgrade`, `bundle`, `package` or
`two ways to begin`.

The one thing to watch when editing `/service/`: the hero price count is taken
from the first `<section>`, so a second figure added there fails the build even
if it is only illustrative.

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
five `category: Guidance` notes from `_guides/` in `guidance_order`, then lists
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

- `scripts/qa.mjs` — 66 checks. Prices, retired offer language, checkout scope,
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

1. **Any new price fails `npm test` three times.** `APPROVED_PRICES` and
   `RETIRED_PRICES` in `scripts/qa.mjs` both have to be edited, together with
   `_data/purchasing.yml`, and the service hero admits exactly one figure.
2. **`_includes/practice-website-buy.html` is the only file allowed to emit a
   checkout link**, and it may appear on `services/practice-website.html` only.
3. **Nothing describing Practice Clarity may carry a purchase action.** It is a
   separate piece of work, agreed in writing and invoiced separately, and it is
   never presented as a version of the website.
4. **Website Care must not claim uptime monitoring or a backup guarantee.**
   Neither is provided. Version history, TLS and fault-fixing are, and are named.
5. Changing a permalink means editing `scripts/qa.mjs` ROUTES, `_redirects`,
   `netlify.toml`, `robots.txt` and `_data/purchasing.yml` together.
6. Banned strings: `unlimited revisions`, `coming soon`, `Template Website`,
   `Semi-Custom`, plus the retired offer names.

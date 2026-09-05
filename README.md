# alexanderwatson.co.uk

Alexander Watson Studio — websites for therapists in private practice.
Jekyll 4.3, built and deployed by Netlify.

## The offer, as the site states it

| | |
|---|---|
| Therapist Website | **£995** — fixed. £500 to begin, £495 when the client approves the finished website, before it goes live. First twelve months of Website Care included |
| Practice Clarity | **£500** — a separate, earlier piece of work. Not a tier, not a bundle, not bought online. |
| Website Care | Included for twelve months, then **£29** a month, no minimum term |
| Custom project | Scoped and quoted individually |

The website and Practice Clarity are **never added into one figure**. The
website service turns the client's answers into a website; Practice Clarity
produces the answers, and its written Practice Direction is theirs whether or
not a website follows. `scripts/qa.mjs` fails the build if a combined price
reappears, if the service hero shows any figure other than £995 and the two
instalments, if Practice Clarity is introduced before Website Care on
`/service/`, or if any published page uses tier language (`upgrade`, `bundle`,
`package`, `two ways to begin`).

**£500 means two things and the distinction is load-bearing.** £500 to begin is
the first instalment of the £995 website. £500 on its own is Practice Clarity, a
separate piece of work. Never let the two appear in the same block without their
labels.

`_data/purchasing.yml` is the single source for those figures. `scripts/qa.mjs`
fails if any other amount appears in published source, or if a retired offer
name (`Choose Your Practice Website`, `Bespoke Website`, `Route one/two`,
`Around £2,000`) comes back.

## Information architecture

Four navigation links and one call to action:

| Nav | Route | Source |
|---|---|---|
| The collection | `/work/` | `work.html` |
| What it costs | `/service/` | `service.html` |
| Useful guidance | `/guidance/` | `guidance.html` |
| About | `/about/` | `about.html` |
| Start a website | `/contact/` | `contact.html` |

There is **one** free resource surface, `/guidance/`. It holds five short
notes (`_guides/`, `category: Guidance`), the two longer practical guides and a
link out to the nine Practice Clarity principles at `/practice-clarity/`, which
is now a reference page rather than a second front door. The Journal index has
been retired: `blog.html` is gone and `/blog/`, `/blog`, `/practice-notes/` and
`/library/` all redirect into the current pages. The two Journal articles keep
their own URLs and are linked from `/guidance/`.

## Layout of the repository

- `assets/css/studio.css` — the whole stylesheet. See `VISUAL-SYSTEM.md`.
- `assets/css/studio.min.css` — built by `npm run build:css`; the only one loaded.
- `_data/collection.yml` — the six finished portfolio cases: screenshot, provenance, the
  strategic distinction and the links to the live concept and its document. The eight
  exploratory directions it used to hold were retired in September 2026 to
  `_strategy/retired-direction-collection-2026-09.yml`.
- `_guides/` — the guidance notes, the practical guides and the nine principles.
- `_includes/practice-website-buy.html` — the only file permitted to emit a checkout link.
- `_pages/` — legal and statement pages. Draft until `_data/legal.yml` says otherwise.
- `_legacy/`, `_strategy/`, `_responsive-pass/` — not published; excluded in `_config.yml`.
- `scripts/` — build, purchasing resolver and four QA harnesses.

## Commands

```
npm run build          # purchasing config → css → jekyll build
npm test               # scripts/qa.mjs — 66 checks, no dependencies
npm run preview        # Node stand-in for the Jekyll build → _preview/
npm run qa:browser     # overflow, keyboard, landmarks, contrast, 200% zoom
npm run qa:a11y        # axe-core, 31 routes × 4 viewports
npm run qa:typography  # measure, rendered line length, target sizes
```

rubygems.org is unreachable from some build containers, which is why
`scripts/preview/render.mjs` exists: it re-implements enough of Jekyll to
render every route so the browser harnesses can run without Ruby.

## Before you change anything

`IMPLEMENTATION.md` lists the six things that break if you are not careful —
prices, the checkout scope, the Website Care claims, permalinks and the banned
strings. `VISUAL-SYSTEM.md` holds the token set and the motion grammar.

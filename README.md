# alexanderwatson.co.uk

Alexander Watson Studio — websites for therapists in private practice.
Jekyll 4.3, built and deployed by Netlify.

**Current decisions — niche, offer, payment, process, portfolio, freeze rule and
which documents are current — are in [`DECISION-REGISTER.md`](DECISION-REGISTER.md).**
Start there. This file describes how the repository implements them.

## The offer, as the site states it

September 2026. **One service, at the price it is being sold at today.**

| | |
|---|---|
| Practice Identity & Website | **£495** for the first three practices, then **£995**. £100 to reserve the place, £395 once the client approves the Practice Fundamentals, before the website is built. One complete responsive page. First twelve months of technical Website Care included either way |
| Practice Fundamentals | The 11-page document and identity, inside the price. It has no separate figure and must not acquire one |
| Website Care | Included for twelve months, then **£29** a month, no minimum term |
| Custom project | Scoped and quoted individually |

The founding price is not a tier, a trial, a discount or a stripped-down
version. It is the whole service at a deliberately reduced price for the first
three live client implementations of a process that has been built but never yet
run with a real therapist. What the studio receives in exchange is the
experience of running it, the feedback, and case studies and testimonials where
the client is willing. That explanation stays on the page: it is the honest
answer to "why is it cheaper", and the site never presents £995 as a saving.

There is **no countdown, no deadline and no remaining-places counter**. The
truthful constraint is that there are three places. A number that ticks down is
a sales device and would have to be maintained by hand to stay honest. When the
places are gone, the price on the page changes.

**Closing the founding offer is one edit**, in `_data/purchasing.yml`: the exact
sequence is written at the top of that file, and `npm test` asserts the two
states are internally consistent and names anything left behind.

`_data/purchasing.yml` is the single source for every figure. No template writes
its own. `scripts/qa.mjs` fails the build if any other amount appears in
published source, if a combined price reappears, if a retired offer name
(`Choose Your Practice Website`, `Bespoke Website`, `Route one/two`,
`Around £2,000`) comes back, if any published page uses tier language
(`upgrade`, `bundle`, `package`, `two ways to begin`), or if the balance is ever
described as conditional on the client being happy rather than on written
approval of the direction.

## The client journey (17 September 2026)

Enquire → reserve the project → complete the intake → approve the direction →
website build → review and launch. The approved source is
`docs/operations/practice-fundamentals-intake-system.md`; the operational files
beside it are the Tally build specification and the client email templates.

- **Enquiry:** `contact.html` + `assets/js/contact-enquiry.js`. Builds an email in
  the browser, with a five-question fit check and a copy-and-paste fallback.
  Nothing is posted or stored.
- **Intake:** `client/intake.html` → `/client/intake/?ref=AW-001`. Embeds the Tally
  form whose share link is `tally_url` in `_data/intake.yml` (empty = a calm
  "not connected yet" notice). `assets/js/client.js` accepts only the `AW-000`
  reference shape and passes it to Tally's hidden `ref` field.
- **Photography brief:** `client/photography.html` → `/client/photography/`,
  printable to one A4 page.
- Both client pages are unlisted: `noindex: true`, `sitemap: false`,
  `Disallow: /client/` in `robots.txt`, and `X-Robots-Tag` from `netlify.toml`.
  The retired questionnaire route redirects to `/client/intake/`; its files are in
  `_legacy/practice-website-questionnaire-2026-09/`.

## Information architecture

Four navigation links and one call to action:

| Nav | Route | Source |
|---|---|---|
| The collection | `/work/` | `work.html` |
| What it costs | `/service/` | `service.html` |
| Useful guidance | `/guidance/` | `guidance.html` |
| About | `/about/` | `about.html` |
| Start a website | `/contact/` | `contact.html` |

There is **one** free resource surface, `/guidance/`. It holds six short
notes (`_guides/`, `category: Guidance`), the two longer practical guides and a
link out to the nine Practice Clarity principles at `/practice-clarity/`, which
is now a reference page rather than a second front door. The Journal index has
been retired: `blog.html` is gone and `/blog/`, `/blog`, `/practice-notes/` and
`/library/` all redirect into the current pages. The two Journal articles keep
their own URLs and are linked from `/guidance/`.

## Layout of the repository

- `assets/css/studio.css` — the whole stylesheet. See `VISUAL-SYSTEM.md`.
- `assets/css/studio.min.css` — built by `npm run build:css`; the only one loaded.
- `_data/collection.yml` — the three flagship portfolio cases (Sofia Marin, Maya Bennett,
  Daniel Mercer): screenshot, provenance, the strategic distinction and the links to the
  live concept and its document. Narrowed from six on 16 September 2026; Helen Calder,
  Harbour and Stillpoint are preserved in `_strategy/archived-portfolio-2026-09/` and
  their URLs redirect to `/work/`. The eight exploratory directions it held before that
  are in `_strategy/retired-direction-collection-2026-09.yml (deleted since; recoverable from git history, see commit dd9eabc)`.
- `_data/founder.yml` — the founder video. Empty until a real recording exists; while it
  is empty the home page renders exactly as it does without it.
- `_guides/` — the guidance notes, the practical guides and the nine principles.
- `_includes/practice-website-buy.html` — the only file permitted to emit a checkout link.
- `_pages/` — legal and statement pages. Draft until `_data/legal.yml` says otherwise.
- `client/` — the two private client pages (intake, photography brief).
- `docs/operations/` — the intake system source, the Tally build specification and the client email templates. Not published.
- `_legacy/`, `_strategy/`, `_responsive-pass/` — not published; excluded in `_config.yml`.
- `scripts/` — build, purchasing resolver and four QA harnesses.

## Commands

```
npm run build          # purchasing config → css → jekyll build
npm test               # scripts/qa.mjs — 80 checks, no dependencies
npm run preview        # Node stand-in for the Jekyll build → _preview/
npm run qa:browser     # overflow, keyboard, landmarks, contrast, 200% zoom
npm run qa:a11y        # axe-core, 31 routes × 4 viewports
npm run qa:typography  # measure, rendered line length, target sizes
```

rubygems.org is unreachable from some build containers, which is why
`scripts/preview/render.mjs` exists: it re-implements enough of Jekyll to
render every route so the browser harnesses can run without Ruby.

## Before you change anything

`IMPLEMENTATION.md` lists the things that break if you are not careful —
prices, the checkout scope, the Website Care claims, permalinks, the banned
strings and the three-case collection. `VISUAL-SYSTEM.md` holds the token set and the motion grammar.

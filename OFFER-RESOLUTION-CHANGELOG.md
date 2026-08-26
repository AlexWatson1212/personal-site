# Offer resolution + final composition — changelog

Implementation of the approved decision document. One product, one occasional
preliminary, one aftercare arrangement. The site is shorter than it was.

## A. What changed

**Commercial**

- **£995 held.** No change to the number, and nothing added to justify it.
- **£1,495 removed everywhere it was user-facing** — the service hero, the
  homepage hero note, the homepage tier block, the 404 page, the guide layout's
  closing panel, the full-scope page and `_data/purchasing.yml`. It is now in
  `RETIRED_PRICES`, so it fails the build if it comes back.
- **"Two ways to begin" deleted** from the homepage. Two priced columns side by
  side were the tier drawn in layout, whatever the words said. In its place: one
  price on the left, one sentence on the right — *"You do not have to work out
  what you need. That is my job."* — deliberately asymmetric, so it cannot be
  read as a choice between two products.
- **The service hero shows one number.** The four-row ledger is gone; £995 sits
  alone with three lines that are terms of that price rather than other prices.
- **Practice Clarity moved to the end of the service page**, after Website Care,
  and reframed on the categorical line: *the website service turns your answers
  into a website; Practice Clarity produces the answers.* It states that the
  intake is part of the £995, that reading it is my job, and that the buyer is
  not asked to work out which of the two they are.
- **Website Care repositioned as conduct.** "The first year of that is included.
  It is not a bonus; it is the end of the job." It no longer carries any of the
  work of justifying £995.
- **"Half to begin, half at launch"** added in three places and nowhere else. No
  comparison to subscription providers was added — that was rejected.

**Composition**

- **The closing call to action is now a plate.** It was a full-bleed ink band
  sitting directly on the ink footer: 853–957px of one colour per page, with
  245px of empty dark inside it. It is now an inset ink plate on the page's own
  ground, with a quiet lift, and the footer's top padding dropped from a full
  band to `--s-8` so the wordmark is its first object. Applied to the homepage,
  the collection, About, What it costs, the nine principles, the guide layout,
  the full-scope page and the questionnaire.
- **Guidance lost its closing pitch entirely.** It ends on a sentence instead:
  *"None of this is here to sell you a website. If reading it means you fix your
  own and never write to me, the writing has done its job."*
- **Contact**: the readiness dropdown folded into the free-text prompt (six
  fields and two selects became five fields and one), the buy-directly note moved
  from the foot of the left column to under the form so both columns finish
  together, and the paper section now ends well clear of the pale band.
- **About**: the pull-quote lost its quotation marks and became the same
  `.statement` device the homepage uses; the air under the two attention cards
  was tightened by one step.
- **The collection**: the penultimate band moved from sage to paper-deep, so pale
  green no longer appears twice in three bands at the foot of that page.
- Dead CSS removed: the quoted-statement variant, which existed only to quote the
  studio to itself.

## B. Files changed

| File | Change |
|---|---|
| `index.html` | tier block replaced with one price and one statement; hero note |
| `service.html` | one-number hero; Care and Practice Clarity swapped and rewritten; band rhythm; closing plate |
| `services/practice-website.html` | Practice Clarity reframed; payment line; closing plate |
| `services/practice-website-questionnaire.html` | closing plate |
| `work.html` | penultimate band sage → paper-deep; closing plate |
| `about.html` | statement device; spacing under the lens pair; closing plate |
| `guidance.html` | closing ink CTA replaced with a quiet sentence |
| `practice-clarity.html` | closing plate |
| `contact.html` | one select removed; column restructure; section padding |
| `404.html` | combined price removed; description updated |
| `_layouts/guide.html` | Practice Clarity line rewritten; closing plate |
| `_includes/practice-website-buy.html` | payment sub-line |
| `_pages/terms.html` | Practice Clarity clause rewritten |
| `_pages/service-terms-practice-website.html` | **clause 3 rewritten** — two instalments, with the online checkout covered separately |
| `_data/purchasing.yml` | `clarity_combined_display` retired; `clarity_addon_display` → `clarity_display` |
| `assets/css/studio.css` | `.closing`/`.closing__plate`, footer padding, `.headline-price`, `.offer`, `.statement--sm`, `.contact-col`, `.contact-open`; `.way__said` removed |
| `assets/js/contact-enquiry.js` | readiness field removed from the enquiry body |
| `scripts/qa.mjs` | price table, retired prices, new architecture check |
| `README.md`, `IMPLEMENTATION.md` | architecture and rules documented |

## C. Offer architecture, before and after

| | Before | After |
|---|---|---|
| Headline prices on `/service/` | £995, +£500, £1,495, £29, quoted | **£995** |
| Practice Clarity | an add-on, third section, priced as `+£500` against a combined `£1,495` | a separate earlier job, last section, `£500`, never combined |
| How it is chosen | the buyer self-diagnosed from a priced fork | offered after the intake is read; most people never hear about it |
| Homepage | two priced columns, "Two ways to begin" | one price, one sentence, no fork |
| Website Care | a row in a price table | a statement about conduct in the after-launch section |
| Payment | in full before the project begins | half to begin, half before launch |

## D. Judgement calls

1. **The payment change collided with the legal spine, and I resolved it rather
   than shipping a contradiction.** Clause 3 of the service terms said the price
   was "payable in full before the project begins. There is no deposit stage and
   no later balance", and the Stripe checkout takes £995 in one payment. Approved
   copy saying "half to begin, half at launch" would have been untrue at the
   point it mattered most. Clause 3 now describes two equal instalments as the
   normal structure, with a second paragraph covering the online checkout, which
   takes the full price in one payment where it is used. **This is worth your
   decision:** online purchasing is currently OFF, so every sale today runs
   through the enquiry route where instalments are straightforward. If the
   checkout opens as it stands, the site will carry two payment structures. The
   cleaner end state is a 50% Payment Link, and I have not assumed that.
2. **Practice Clarity moved to `on-paper-deep`, and Website Care took the sage
   band.** Swapping the two sections would otherwise have put sage immediately
   before paper-deep and broken the page's alternation. The palette is unchanged.
3. **The service page's second section no longer repeats £995.** With the hero
   carrying one large figure, the "core service" block beneath it was showing the
   same number and the same sub-line within one screen. It now opens with a
   heading instead.
4. **Guidance lost its call to action rather than gaining a plate.** You asked me
   to consider it; a page of free writing that ends by selling undercuts the
   writing. It ends with a sentence that says so plainly.
5. **The QA suite now enforces the architecture, not just the prices.** A new
   check fails the build if a combined figure reappears anywhere, if the service
   hero shows more than one price, if Practice Clarity is introduced before
   Website Care on that page, or if any published page uses `upgrade`, `bundle`,
   `package` or `two ways`. The rule is what stops the tier growing back in six
   months.
6. **`clarity_addon_display` was renamed to `clarity_display`.** The old key
   name asserted the thing the change removes.

## E. QA

| Check | Result |
|---|---|
| `scripts/qa.mjs` | **66 passed, 0 failed** (was 65 — one new architecture check) |
| Preview render | **36 routes**, no conflicts, no errors |
| `scripts/qa-browser/run.mjs` | **PASS — 0 failures**: overflow, heading wrapping, clipping, 200% zoom, keyboard order and focus, landmarks, mobile navigation panel, reduced motion, contrast, page errors |
| `scripts/responsive-qa/a11y.mjs` | **0 axe violations**, 36 routes × 4 viewports |
| `scripts/responsive-qa/typography.mjs` | **0 hard failures** |
| `scripts/responsive-qa/primary-targets.mjs` | **0** undersized, 0 missing focus indicators, 0 overflow |
| `£1,495` in user-facing source | **absent** |
| `£995` as the single website price | **confirmed** — one figure in the service hero |
| Structured data | `"price": "995.00"`, unchanged and correct |

`bundle exec jekyll build` could not be run: rubygems.org returns 403 from this
container, which is why `scripts/preview/render.mjs` exists. Nothing in this pass
touched `_config.yml` collections, permalinks or plugins, so the Jekyll build
surface is unchanged; the render covers all 36 routes and the built-site checks
in `qa.mjs` pass against it.

## F. Deliberately not changed

- **£995.** Held, as approved.
- The palette, typography, spacing, plates, collection concept and photography.
- The homepage hero, the collection section and the You / You / Me / Yours
  sequence.
- The About page beyond the two specified fixes. No rewriting, no expansion.
- The guidance section's size — five notes, two guides, nine principles.
- Website Care's honest scope, including everything it says it does not cover.
- Contact's written-first approach, the ordinary-email alternative, and the
  absence of any booking calendar.
- Historical documents — `REBUILD-REPORT.md`, `REDESIGN-REPORT.md`,
  `REFINEMENT-CHANGELOG.md`, `OPEN_DECISIONS.md`, `_strategy/`, `_legacy/` — which
  record what the offer used to be and are excluded from the build.
- The FAQ. No question was added about Practice Clarity: the structure is meant
  to answer that, and adding a paragraph would have conceded that it does not.

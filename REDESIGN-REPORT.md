# Recomposition — before and after

Reviewable build. **Nothing has been deployed.**

---

## 1. Commercial architecture

| | Before | After |
|---|---|---|
| Core product | Choose Your Practice Website — £995 | **Therapist Website — £995**, including the first twelve months of Website Care |
| Second option | Practice Clarity + Bespoke Website — around £2,000 (a different, larger product) | **Practice Clarity — +£500**, an add-on to the same website. **£1,495** together |
| Edge cases | absorbed into the £2,000 route | **Custom project — quoted individually.** One quiet section, one link |
| Website Care | Optional extra, £29/month or £290/year, presented as a separate purchase | **First twelve months included**, then £29/month, no minimum term |
| Structural claim | lacking clarity ⇒ you need the more expensive website | clarity and website are separate dimensions |

**Where it changed:** `_data/purchasing.yml` (single source for every figure),
`index.html`, `service.html`, `services/practice-website.html`,
`services/practice-website-questionnaire.html`, `purchase-complete.html`,
`contact.html`, `_includes/practice-website-buy.html`, `_includes/footer.html`,
`_layouts/guide.html`, `_layouts/post.html`, `_pages/terms.html`,
`_pages/service-terms-practice-website.html`, `_pages/cancellation-and-refunds.html`,
`_pages/privacy.html`, `assets/js/practice-website-questionnaire.js`, `README.md`.

**The legal position was rewritten, not patched.** Bundling Care into £995 turns
it into a twelve-month paid obligation, and the old clause 12 said the opposite
("Hosting and maintenance are not included"). Clause 12 is now a full Website
Care clause: what it is, what it is not, what happens after twelve months,
thirty days' notice before removal, and the right to host elsewhere at any time.
`_pages/terms.html` now lists Practice Clarity as an add-on invoiced separately
and custom projects as quoted work, so the "nothing here is an offer capable of
acceptance except the checkout" clause still holds.

**Care claims only what the repository can substantiate.** The old five words —
"secure hosting, maintenance, backups, monitoring and small content amendments" —
included two things with no supporting artefact anywhere (no backup routine, no
uptime monitor, no alerting). Care now reads: hosting, the TLS certificate,
deployments, dependency and security updates, version history so a change can be
reverted, domain and DNS help, and fixing faults in the website or its
deployment. It explicitly does **not** cover design changes, content updates,
guaranteed uptime or continuous monitoring. `scripts/qa.mjs` fails the build if
an uptime or monitoring claim reappears outside a "does not cover" list.

**The old structure cannot come back quietly.** A QA check scans every tracked
file for `Choose Your Practice Website`, `Bespoke Website`, `Practice Clarity
Blueprint`, `Route one`, `Route two`, `two routes` and `Around £2,000`, and
another rejects any £ amount that is not £995, £500, £1,495, £29 (plus one
declared illustrative fee). Both cover metadata, JSON-LD, `_redirects`,
`netlify.toml`, `robots.txt`, JavaScript, YAML and page copy.

---

## 2. Copy

Measured on the rendered pages, with the drawn design specimens excluded
(they are artwork, marked `aria-hidden`):

| | Before | After | |
|---|---:|---:|---|
| All words, twelve main pages | 7,932 | 7,375 | **−7%** |
| Running prose (paragraph text) | 5,181 | 4,226 | **−18%** |

The prose figure is the one that matters: most of what remains is now in
ledgers, diagrams, stage rows and lists, which are scanned rather than read.

**Largest removals**

- The whole two-route apparatus: an eight-row comparison table, a "take route
  one if / take route two if" decider, two route cards on the home page and two
  more on the prices page, and the repeated "clarity first, website second"
  framing. ≈ 500 words.
- The directory-rent argument on the home page (£300–£550 a year, "rented shelf
  space"). Interesting, but it argued a point the price already makes.
- The six-step process rail written out in prose on the home page — replaced by
  the anatomy diagram.
- The "one technical standard, whichever route you take" strip — meaningless
  once there is one route.
- Four "before you enquire" cards on the contact page, cut to three
  definition-list rows.
- `/services/practice-website/` prose: 1,145 → 783 words, with no scope
  statement lost. It was largely re-set as three-column ledgers.
- The links page: 170 → 32 prose words.
- Two unused includes (`practice-clarity-farewell.html`, `guide-cta.html`) and
  one dead script (`assets/js/service-documents.js`, which selected an element
  that existed nowhere and was loaded on every `/service/` view).

**Where copy grew, deliberately:** the collection page (350 → 480 prose words).
Each of the eight directions now carries a two-sentence note explaining what it
is for and what it does differently. That is the evidence the page exists to
provide.

---

## 3. Visual system

`assets/css/studio.css` — one stylesheet, written rather than accumulated.

| | Before | After |
|---|---:|---:|
| Hand-edited stylesheets | 4 (`main`, `visual-system`, `catalogue-refresh`, `links`) | **1** |
| Generated bundles | 13 PurgeCSS route bundles | **1** minified file |
| Source lines | 19,094 | **3,255** |
| Source bytes | 485 KB | **92 KB** |
| `!important` declarations | **1,215** | **0** (the build refuses to run if one appears) |
| CSS over the wire, per page | 23.0 KB gzip, two files, not shared between pages | **13.1 KB gzip, one file, cached across the whole site** |

The old `main.css` was forty-three dated override passes with a blanket
`h1…h6 { … !important }` rule that every later section had to fight — the
reason dark-section headings needed `!important` of their own. That whole class
of problem is gone.

**Kept:** Newsreader and Inter, self-hosted; the cream / pale-green / deep-forest
palette; three surfaces and no more; the restrained editorial voice.

**Developed:**

- Contrast raised where it was marginal. `--text-faint` 4.5:1 → **5.6:1** on
  paper and 5.0:1 on sage; the accent 4.5:1 → **5.7:1**. Both previously failed
  on the sage sections.
- One accent (clay `#8A5238`), used only for marks — a final tick, a numbered
  annotation, a legal flag. Never a surface, which is what keeps the palette out
  of the sage-blush-terracotta cliché the category has settled into.
- Hairlines and space replace cards and shadows. Cards remain only where the
  grouping carries meaning: forms, the price panel, callouts.
- A measure: running text stops at 55ch, which renders at ~77 characters a line.
  Nothing on the site runs to 100 characters any more.
- Type scale rebuilt as eight fluid steps; small print comes up to 15–16px on
  phones rather than 13px.
- `text-box: trim-both` (guarded) for optical heading alignment.
- Utilities replaced ~120 inline styles; what remains are custom-property
  assignments, which is what they are for.

---

## 4. Motion

Grammar first: **every entrance on the site is 14px of travel, 620ms, one
curve.** Durations, easings, travel distance and stagger are tokens.

| Pattern | Where | Technique |
|---|---|---|
| Hero copy entrance | eyebrow → heading → lead → actions → price | CSS animation on load, 70ms stagger. Works everywhere. |
| Plate entrance | the three hero plates | **Transform only** — 30px, a fraction of a degree of counter-rotation, 0.982 scale, 820ms, staggered 0/90/170ms. Deliberately no opacity ramp: see Performance. |
| Depth on scroll | the same three plates | ±34/14/22px of `translate` on a `view()` timeline. Enough to register depth, not enough to notice as an effect. |
| Scroll reveals | section headings, collection entries, ledgers, the two-ways columns | `animation-timeline: view()`, `entry 8% → cover 26%` |
| Rule drawing | the £995 anatomy line | `scaleX` from 0 as the diagram enters |
| Pathway drawing | the Practice Clarity stages | `scaleY` from 0, per stage, so the line draws as you read down it |
| Image in a fixed frame | collection plates, article cards | `scale(1.022)` inside `overflow: clip` over 620ms. The frame holds still; the work moves. No lift, no shadow. |
| Link underline | every text link | the rule grows from 1px to 2px over 420ms |
| Arrow nudge | buttons and links | 3px over 240ms |
| Header state | on scroll past 12px | a class flip: hairline appears, ground becomes opaque. Nothing moves, nothing reflows. |

**No animation library.** Total JavaScript is unchanged at 24 KB across four
files, none of it animation. Scroll reveals are pure CSS.

**Two independent guards.** `prefers-reduced-motion` first, then
`@supports (animation-timeline: view())`. Where either is absent the page
renders in its final state — the state it was composed in. Nothing is hidden by
default; the reveals only ever remove themselves. Firefox has not shipped
scroll-driven animations, so roughly a third of visitors see the static
composition, and that was the design constraint rather than an afterthought.

Reduced motion is implemented by **flipping the motion tokens**, not by a
blanket `!important` reset — so it reaches every transition in the stylesheet,
including ones added later, without out-specifying anything.

---

## 5. Information design — what stopped being prose

| Was | Is |
|---|---|
| Six paragraphs of process on the home page | **The £995 anatomy**: one hairline, seven marks — direction, intake, tailoring, build, two rounds, launch, a year of care — with the final tick in clay. The rule draws itself as you reach it. |
| Two route cards with ten bullets and two "right for you if" paragraphs | **Two ways to begin**: two sentences a therapist might actually say, each with a name, a price and four lines. |
| "Included / What you bring / Not included" as three stacked lists inside cards | **The ledger**: three hairline-ruled columns, exclusions given the same typographic weight as inclusions. |
| Practice Clarity explained in prose on four separate pages | **The pathway**: Practice → People → Position → Message → Expression, drawn as a vertical line with the question each stage answers. |
| "These are not templates" asserted repeatedly | **The tailoring diff**: Rowan Hill as drawn, beside the same direction rebuilt for an example practice, with four numbered annotations — palette, typography, structure, words. Labelled as an illustration. |
| An eight-row route comparison table | Deleted. |
| Website Care as a paragraph | **Covers / does not cover**, as two lists. |
| Nine principles as a wall of cards | **A ruled index** in three stages, one row per principle. |
| Prices scattered across two pages | **A four-row price ledger** in the first screen of `/service/`: £995, +£500 / £1,495, Care, custom. |

---

## 6. Imagery

The website work is the hero, and it is drawn rather than photographed.

**The plate system** (`assets/css/studio.css` §09, `_data/collection.yml`,
`_includes/plate.html`) renders each direction as a miniature of its own home
page. Every dimension is in container-query units, so one plate is correct at
180px and at 900px. The container is identical for every direction; the palette,
the typographic behaviour and the **layout personality** inside it are what carry
the range — eight variants (warm, editorial, care, balance, choice, clinical,
community, direct) plus a phone view. They are treated as plates laid on a
table, not as browser screenshots: no chrome, no traffic lights, no glass.

**Photography introduced:** the existing studio portrait
(`about-hero-portrait.webp`), which was not being used — the About page opened
with an abstract green graphic instead. It now anchors both the About page and
the studio section of the home page. The library and journal keep their existing
desk and notes photography.

No stock photography was added. No mugs, pebbles, forests, empty chairs or
wistful windows.

**Still available and unused:** 104 art-directed editorial photographs in
`assets/images/image-library/` (172 MB of PNGs, excluded from the build). Several
would suit the collection page's detail-crop moments. They need selecting,
cropping and converting to WebP — a decision about the studio's image direction
rather than something to invent here.

---

## 7. Performance

Measured locally over gzip, cold cache, 1440×900.

| | Before | After |
|---|---|---|
| Requests, home | 9 | **8** |
| Transferred, home | 138.1 KB | **129.2 KB** |
| CSS transferred | 23.0 KB, two files, per page | **13.1 KB, one file, site-wide** |
| LCP, home | 240 ms | **236 ms** |
| CLS, `/work/` | 0.008 | **0** |
| JavaScript | 24 KB, five files | 24 KB, four files (one dead script removed) |

Two things worth naming:

1. **An opacity ramp on the hero cost 880ms of LCP.** The first version faded
   the plates in from zero; because they are the largest contentful element,
   Chromium reported LCP at **1,120ms**. Changing the entrance to transform-only
   — the plates settle rather than fade — brought it back to 236ms with the
   motion intact. This is the "animations that delay access to information"
   failure mode, and it was real.
2. The remaining page weight is almost entirely the two variable fonts (104 KB).
   Both are preloaded because both are used above the fold on every route.

---

## 8. Accessibility

Every harness is green.

- **axe-core**, 31 routes × 4 viewports (390 / 768 / 1440 / 200% zoom), tags
  `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice`: **0 violations.**
  It started at 128 findings; the fixes were real contrast changes, not
  suppressions.
- **Reduced motion**: 0 elements animating under `prefers-reduced-motion: reduce`,
  verified by computed style across every route. Confirmed behaviourally: a
  reveal element parked mid-entry reads opacity 0.16 with motion on and 1.0 with
  motion reduced.
- **Keyboard**: real Tab traversal on every route — tab order follows DOM order,
  every stop has a visible focus ring, the skip link is the first focusable
  element.
- **Landmarks**: exactly one `<main>`, header and footer present, one `<h1>`, no
  skipped heading level, on all 31 routes.
- **Target size**: 0 targets under 24×24 and 0 under the stricter 44px bar
  (filter chips, the Library disclosure and the questionnaire checkboxes all
  needed enlarging).
- **Contrast**: 0 findings on resolvable backgrounds. 2,691 "needs review" cases
  remain — almost all text inside the drawn specimens, where axe cannot resolve
  a composited background. Those were separately raised to a minimum of 4.5:1 by
  calculation across all eight palettes.
- **Typography**: 0 lines over 80 rendered characters, 0 instances of prose under
  15px on a phone.

Three harness bugs were fixed along the way, each because a check was measuring
the wrong thing: axe now freezes animations before auditing (it was sampling a
frame mid-entrance and reporting the transient contrast); the primary-target
check presses a real Tab before testing `:focus-visible` (a bare script `focus()`
does not match it in Chromium, so the check was demanding a `:focus` rule the
site is right not to have); and it now skips elements focus cannot land on (the
closed mobile panel is laid out but outside the tab order).

---

## 9. Responsive testing

Widths exercised by the harnesses: **320, 360, 375, 390, 430, 640, 768, 1024,
1280, 1440**, plus short-viewport (390×560, 1280×620) and 200% zoom at three
sizes — the tightest being a **195px** CSS viewport.

Recomposed rather than stacked:

- **The hero fan**: three overlapping plates at ≥992px with the right-hand one
  finishing flush to the page edge; three tighter, fully-contained plates from
  768–991px; two plates and no bleed below 720px.
- **The anatomy diagram**: seven columns at ≥1152px, four at ≥768px, two below.
- **The collection**: a full-measure feature entry beside its metadata at
  ≥992px, paired below, single column under 720px.
- **The pathway and ledgers**: two- and three-column at ≥864px, ruled rows below.
- **Navigation**: inline at ≥992px, full-screen panel below, with `Escape`,
  focus return and body scroll lock.
- Below 320px (the 200% zoom case) the display scale drops and headings hyphenate
  rather than running off the page.

---

## 10. Tests

| Suite | Result |
|---|---|
| `npm test` (`scripts/qa.mjs`) | **64 passed, 0 failed** (58 + 6 built-site checks) |
| `scripts/qa-browser/run.mjs` | **PASS — 0 failures**, 0 heading-orphan warnings |
| `scripts/responsive-qa/a11y.mjs` | **0 violations** |
| `scripts/responsive-qa/typography.mjs` | **0 hard failures** |
| `scripts/responsive-qa/primary-targets.mjs` | **0 failures** |
| `bundle exec jekyll build` | **Not run** — rubygems.org is unreachable from this container. `scripts/preview/render.mjs` rendered all 31 routes with no conflicts or errors, and the built-site checks were run against that output. |

Tests written or rewritten for the new architecture: the price sets, the
purchasing-config match, "one product, one add-on, one care plan", "the retired
offer structure is gone", "the Therapist Website is the only route with an online
checkout", "Practice Clarity carries no purchase action", "Care described as
included for twelve months, then £29 a month", "Care claims only what the
infrastructure supports", and "every page loads the one stylesheet, and only
that one".

---

## 11. Open — needs your decision, not my invention

1. **Website Care terms.** Care now sits inside the £995 and is described in
   clause 12 of the service terms. It has no separate agreement of its own, and
   the whole legal set is still `approved: false` / draft v0.1. A solicitor
   should see clause 12 in particular, along with the thirty-days'-notice
   commitment I drafted.
2. **Care is a real twelve-month obligation now.** Hosting client sites on the
   studio's Netlify account, keeping builds working and fixing faults for a year
   is an operational commitment, not a marketing line. Worth deciding whether you
   want that before this ships.
3. **£290/year was dropped.** Care is now one number, £29/month, to keep the
   price list to four figures. Say the word and the annual option comes back —
   it needs `_data/purchasing.yml`, the QA price set and two pages.
4. **The product name.** Your brief said "Therapist Website"; the repository and
   the legal documents said "Choose Your Practice Website". I followed the brief
   and updated the legal references. The URL is still
   `/services/practice-website/` — stable, but no longer matching the name. A
   rename plus a redirect is a small, separate job.
5. **Practice Clarity has no online checkout.** The Stripe link is £995 only, so
   the add-on is agreed in writing and invoiced separately. If you want it
   buyable, that is a second Payment Link and a fourth price.
6. **The £60 in the tailoring illustration.** The home page shows an example
   practice with a session fee, because the point being made is that this
   practice's visitors need the cost first. Change or remove it if you would
   rather not put a figure there at all.
7. **VAT.** Still `[VAT position to be confirmed]` in the service terms.
8. **Stripe.** Still no live Payment Link, so the buy action ships in its
   disabled state and the page routes to "ask a question first". Unchanged.
9. **The image library.** 104 editorial photographs, unused. See §6.
10. **Two unreferenced PDFs** (`assets/documents/`, 894 KB) and
    `assets/images/og-studio-refresh.png` (965 KB) are linked from nothing. Left
    in place in case they are shared externally.
11. **CSP could now be enforced.** Every inline `<script>` is gone except the
    two JSON-LD blocks on the purchase page; `netlify.toml` still ships the
    policy report-only. Tightening it is a deliberate step I did not take
    unilaterally.

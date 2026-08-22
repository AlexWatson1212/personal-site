# The two-route rebuild — August 2026

A record of what changed, why, and what is still open. Written for you, not
for a client.

---

## 1. The most important changes

**The offer is two routes, everywhere.** The site sold three services at
£495, £995 and £1,995. It now sells **Choose Your Practice Website at £995**
and **Practice Clarity + Bespoke Website at around £2,000**. Every page,
every price, every URL, every legal clause and every test now agrees on that.
The Guided tier is gone, not hidden.

**The home page is a decision, not a brochure.** It opens with one promise
and one action, then puts the two routes side by side as a direct comparison
— name, price, one line of positioning, five things included, and a "right
for you if" panel. A visitor can answer *which of these is me?* in about
fifteen seconds without reading a paragraph.

**"Clarity first. Website second." carries the distinction.** It is stated on
the home page and again at the top of `/service/`, and both route cards are
written against it: at £995 I confirm the clarity you already have; at around
£2,000 we develop it together. Route two is deliberately written so that
choosing it does not read as an admission of confusion — *"most people find
their own practice the hardest thing to describe."*

**The commercial framing is now on the site.** The strategy document called
the directory-rent comparison "the single most useful commercial framing
available to you and it is not currently on your site." It is now a section
on the home page: two directory listings cost £300–£550 every year,
indefinitely, for space in someone else's website; £995 is roughly two years
of that, once, and at the end of it the website is yours. It is stated as a
fact about the market, not as a claim about directories being bad.

**One heading system for the whole site.** There were two competing scales —
the `acw-` pages took theirs from `main.css`, the catalogue pages ran their
own 2.6–7.7rem ramp — so an h2 on `/about/` and an h2 on `/service/` were
different sizes. There is now one scale, in `visual-system.css` §13, and 240
per-component heading declarations have been deleted so nothing competes with
it. Every step carries a container-query ceiling, so a heading can never
outgrow the column it is sitting in.

**Newsreader replaces Instrument Serif as the heading face.** Reasoning in §2
below. Everything else about the brand — the palette, the wordmark, the body
face, the editorial restraint — is untouched.

**Dense prose became structure where it genuinely helps.** A two-card route
comparison, an eight-row comparison table, a two-column "take route one/two
if" decider, a six-step numbered process rail, and a six-question FAQ. No
diagram was added for decoration; each one replaced paragraphs.

**The purchase journey follows the offer.** `/services/straightforward-website/`
is now `/services/practice-website/`, with the questionnaire and service terms
renamed alongside it and 301 redirects for all three old paths. The £995 scope
now *includes* the visual identity — typography, palette, and a refined
typographic wordmark — and accepts **draft** copy rather than final approved
copy, because that is what you are actually selling. The service terms and the
intake were changed to match, not left behind.

---

## 2. The information hierarchy, and why

The site now answers your nine questions in the order a visitor asks them.

| Order | Question | Where it is answered |
|---|---|---|
| 1 | Is this for a therapist like me? | Home hero eyebrow, first line on the page |
| 2 | What is different about this? | Hero promise, then the collection section |
| 3 | What are the two ways to work? | Home, section two — the route cards |
| 4 | Which one is right for me? | "Right for you if" on each card; the decider on `/service/` |
| 5 | What will I receive? | Route card bullets; full scope on `/service/` and the £995 page |
| 6 | What will I need to do? | The process rail — "six steps, and you make two of them" |
| 7 | How much? | Hero note, both cards, the table, the footer link |
| 8 | What happens next? | Process rail, then "how you start" in the table |
| 9 | Why trust Alexander? | The studio note on the home page; `/about/` in full |

Three deliberate decisions inside that:

**Price appears above the fold, in the hero note.** Publishing the price before
anyone asks is a differentiator in this market and it filters the enquiries you
do not want. It is a small uppercase line rather than a banner, so it informs
without shouting.

**The route cards come before the collection.** Earlier the site led with the
designs. But a visitor who does not yet know *how* this works cannot evaluate
the designs — and the collection is the second question, not the first.

**Trust comes last on the home page, not first.** The counsellor-in-training
detail is powerful but it is a reason to *choose you over someone else*, not a
reason to keep reading. It sits near the closing action, where it does the most
work, and is written to avoid implying it is a design credential.

### The heading typeface

The brief left the heading face open, so this is a considered brand decision
rather than a preference.

Instrument Serif ships **one weight at one optical size**. A display line and a
17px card title were being set from the same master, which is why small headings
looked spindly and long ones looked cramped — and it is why the old CSS had
accumulated dozens of per-component size, tracking and weight corrections
fighting the face rather than using it.

**Newsreader** is a variable text serif with a 200–800 weight axis, drawn for
reading across a range of sizes. It holds a display line without becoming
theatrical, and a card title without becoming thin. It is open-licensed (OFL),
self-hosted from `assets/fonts/` as a single 58 KB woff2 covering the whole
range — replacing two Instrument Serif files, so the font payload went *down*.
It is a text serif rather than a fashion serif, which is the point: it should
still look right in five years.

The italic is not shipped, because nothing in the heading system sets italic.

---

## 3. The market this fits

Your hypothesis was right, and the research lets me sharpen it.

**Confirmed.** UK-based therapists and counsellors in private practice, mostly
women, established enough to spend £995–£2,000, not technically confident,
looking for someone trustworthy who understands the work rather than a loud
generic agency. The market is large and growing: BACP alone reports 73,528
members, roughly 70–77% of whom do private work, and net membership grew by
about 4,020 in a year.

**The sharpening.** The strongest buyer is not "a therapist who needs a
website" — it is **a therapist two to eight years into private practice who is
already paying directory rent and has started to resent it.** They have proof
the channel works, an income that supports the spend, and a specific
dissatisfaction the £995 route answers exactly. That is why the directory
comparison is on the home page: it speaks to a decision they are already half
making, rather than trying to create a need.

**Where £995 sits.** UK provider pricing forms a barbell, with a real gap
between about £999 and £1,200. £995 sits at the top of the lower band — high
enough to signal craft, and just below the psychological line where a therapist
starts requiring a proposal process. The nearest comparable studio starts at
£1,700 and typically lands between £2,000 and £4,000, on Squarespace. No UK
therapist-specific collection of complete website directions currently exists.
The positioning is defensible.

**What actually loses enquiries.** The documented failures of therapist websites
are informational and editorial, not aesthetic: missing fees, buried
specialisms, hidden contact routes, borrowed jargon. And a 2018 Brighton
doctorate on how clients choose a therapist found that a third-party
recommendation dominates; where there is none, people judge from the photograph
and the writing, with qualifications and modality weighing comparatively little.
That is why the copy across the site keeps returning to fees, specificity,
plain language and an easy first step, rather than to design vocabulary.

**Three professional constraints the site respects.** UKCP clause 13 prohibits
client testimonials outright, so none are used or invited anywhere. BACP
designation wording is exact, and the site promises to set it exactly as the
body permits. ASA rule 12.2 restricts treat/cure claims, so nothing on the site
promises an outcome for anyone's clients.

Accessibility is stated plainly — built and tested to WCAG 2.2 AA — and framed
as *a good proportion of the people arriving are reading on a phone, or
neurodivergent, or distressed.* It is deliberately not sold as compliance risk.

---

## 4. Assumptions, and things only you can decide

**1. The collection is described as seven directions, not twelve.** The brief
says clients choose "from approximately 12 complete website directions". Eight
exist, and one of those is your own practice site. Rather than claim a number
you cannot show, `/work/` now says *"seven directions to choose from"*, notes
that new directions are added as the collection grows, and marks Alexander
Watson Counselling as the Studio's own practice, not available. **If you build
more, the copy needs one edit** — the number appears in exactly one place.

**2. "Around £2,000" is left indicative.** A fixed number reads more
confidently than an approximate one. I left it approximate because the route is
proposal-led and the scope genuinely varies, but once you have written enough
proposals to know what they actually land at, fixing it would strengthen the
page. Logged in `OPEN_DECISIONS.md`.

**3. Two claims I wrote that you should confirm or change.** Both are on
`/service/` and both are the sort of specific, checkable thing that builds
trust — which is why they need to be true:
   - *"Most £995 projects run three to five weeks from a completed intake."*
   - *"You can change your chosen direction once, free, before I begin
     tailoring it."*

**4. The heading typeface is a brand change.** Reasoning is in §2 and in
`VISUAL-SYSTEM.md`. If you dislike it, the change is one `@font-face` block and
one custom property — but the old per-component sizes are gone for good, and
that part should stay gone whichever face you use.

**5. Nothing was launched.** Online purchasing is still in its safe closed
state, because no Stripe Payment Link is configured in the environment. The
button reads *"not open yet"* and points at the enquiry route. `STRIPE_SETUP.md`
now describes the £995 product.

**6. The intake questionnaire is still marked draft.** `questionnaire_approved`
is still `false` in `_data/intake.yml`, so the draft notice still shows. That
was already the case; I updated the questions that contradicted the new offer
but did not approve it on your behalf.

**7. Website Care is unchanged** at £29 per month or £290 per year, with
subscriptions still switched off.

---

## 5. Tests, and what could not be run

**Ran, and passed.**

| Check | Result |
|---|---|
| `npm test` — the project QA suite | 57 passed, 0 failed, 6 skipped |
| `scripts/qa-browser` — overflow, focus, landmarks, contrast, reduced motion | PASS, 0 failures, 4 heading-orphan warnings |
| axe-core 4.13 — 31 routes × 4 viewports | **0 violations** |
| `responsive-qa` typography — 31 routes × 13 viewports | see below |
| Node preview render — 31 routes | no conflicts, no errors |

The 6 skipped tests in `npm test` are the ones that read `_site`, which only
exists after a Jekyll build.

**Typography and responsive measurements**, at 320 / 360 / 390 / 430 / 768 /
1024 / 1280 / 1440, plus short mobile, short laptop, and three 200%-zoom
viewports, with document fonts awaited before every measurement:

| Measure | Result |
|---|---|
| Prose over 80 characters per line | 0 |
| Prose under 15px on mobile | 0 |
| Touch targets under 24×24 | 0 |
| Forced `<br>` in flowing text | 0 |
| Page errors | 0 |
| Horizontal overflow, at every viewport including 200% zoom | 0 |
| One-word heading lines | 23 distinct, 14 of which no measure can avoid |

Every remaining one-word heading line is a two-word title such as *"The
Simplicity Principle"* setting on a 320px screen, where no measure can hold it
on one line. The harness reports these as warnings rather than failures for
exactly that reason. None are on the commercial pages.

**Could not be run: `bundle exec jekyll build`.** rubygems.org is unreachable
from this environment — every fetch returns 403 through the proxy — so bundler
cannot install Jekyll here, and the real build has never run locally. I am not
claiming it passed. What I can say: the Node preview renders all 31 routes
without error, the QA suite's route and link checks pass against source, and
Netlify has previously built this repository successfully with the same
`netlify.toml`. The real build runs on deploy.

**Also could not be run: Lighthouse.** axe-core 4.13 is the engine behind
Lighthouse's accessibility category and was run directly instead, over four
viewports rather than one. Lighthouse's performance score needs a network the
proxy will not provide.

**Horizontal overflow is now zero at every viewport measured**, including the
195px CSS viewport that a phone at 200% zoom produces — down from 66 findings
at the end of the responsive pass. It took giving the numbered rails, the
project cards, the guide diagrams and the fenced code blocks a narrow-width
behaviour below 240px, plus one build fix: PurgeCSS was deleting every rule
that targeted `pre` or `code`, because fenced blocks are written as ``` in the
guide markdown and those two words never appear in the scanned source.

---

## 6. Old offers, stale prices and contradictions — removed

Checked by the QA suite, which now fails the build if any of them return.

- **`£495`, `£1,995`, `£795`, `£1,495`, `£2,195`** — asserted absent from every
  tracked file in the repository, documentation included.
- **Every `£` amount on every published page** is asserted to be one of
  `£995`, `£2,000`, `£29`, `£290` — or one of the two directory figures
  (`£300`, `£550`), which are held on a separate list so a stray offer price
  cannot hide among them.
- **"Straightforward Website" and "Guided Website"** appear nowhere. The Guided
  clause was removed from `/terms/`, and `guided_price_display` was removed from
  `_data/purchasing.yml` — the suite now fails if it comes back.
- **Only two route blocks exist** across `index.html` and `service.html`, and
  the suite asserts their ids.
- **Only the £995 route has a checkout.** Practice Clarity is asserted to carry
  no buy component, no pay action and no link into the purchase page.
- **The old URLs 301 to the new ones** — three redirects added; `robots.txt`,
  the sitemap exclusions and the `noindex` routes all follow the rename.
- **Contradictions fixed:** the £995 scope said it excluded identity work while
  the offer includes it; the terms required "final, approved page copy" while
  the offer takes a draft; the questionnaire offered "an AI-assisted logo
  direction" where the offer is a typographic wordmark; `/about/` implied that
  starting from a blank page was never worth it, which undercut route two.
- **Removed:** two unreferenced Instrument Serif font files and their licence,
  and a home-page preload of a hero image the home page no longer uses.

---

## 7. Deployment

The work is two commits on top of `7131edd`, delivered as a git bundle with
`APPLY-two-routes.txt` beside it in your repository folder.

I could not push. GitHub access from this session is refused at the proxy —
*"AlexWatson1212/personal-site is not in this session's authorized repository
set"* — so the last step is yours:

```
git checkout -- .
git fetch "studio-two-routes.bundle" main:studio-update
git merge --ff-only studio-update
git push origin main
```

Your working copy currently holds the responsive-pass files uncommitted;
commit `45a8964` contains exactly those files, so discarding them loses
nothing. Netlify builds from GitHub, so the push is the deploy.

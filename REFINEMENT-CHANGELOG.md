# Refinement pass — changelog

> **SUPERSEDED — historical record, August 2026.** This document describes the
> state of the project at the time it was written and is kept as a record. It is
> **not** a statement of the current offer and must not be used as a source when
> implementing. Prices, offer names and routes described here may since have been
> retired. The canonical position is in `README.md` and `IMPLEMENTATION.md`; the
> open questions are in `OPEN_DECISIONS.md`.

The brief was explicit that this was not a redesign. The existing project was
the source of truth and was edited directly. Nothing was rebuilt that was
already working.

The sentence the whole pass was measured against:

> *"I just want a professional website that feels like me, that explains what I
> do clearly, and that does not embarrass me when someone I respect looks at it.
> You do not need to become a marketer to have a good website."*

---

## Retained

- **The identity.** Wordmark, palette, the paper/ink/sage grounds, the editorial
  serif and the restraint. No visual language was replaced.
- **The plate system and the collection concept.** Eight named directions, drawn
  from `_data/collection.yml` by `_includes/plate.html`, still the centre of the
  site and still the thing the homepage leads with.
- **The commercial architecture** settled in the previous pass: £995, Practice
  Clarity at +£500 (£1,495 together), Website Care included for the first year
  then ~£29/month, custom work quoted individually. No figure moved.
- **The headline**, "A website your practice is recognised by." It was reviewed
  and kept: it is a claim about the reader's practice rather than about the
  studio, and nothing shorter said the same thing.
- **Photography.** The existing art direction — real desks, real paper, real
  light — was reused. No stock was added.
- **All nine Practice Clarity principles and the two longer guides**, unedited.
  They are good and they were not the problem.
- **The technical spine.** One stylesheet, zero `!important`, the container-query
  plate system, the reduced-motion token flip, the four QA harnesses.

## Changed

**Homepage**

- A new second section, "The short version", states the philosophy in plain
  English before any feature is described: *"You are good at your work. You
  should not have to be good at websites as well… There is no stage where you
  have to become a marketer."*
- The seven-step process anatomy was replaced by a **four-step sequence** —
  Choose a direction / Tell me about the practice / Adapt it and build it / It
  becomes your website — labelled **You · You · Me · Yours** rather than 01–04,
  so the division of labour is the thing the diagram communicates.
- The collection moved up and got more room; the tailoring example (one
  direction, redrawn for a different practice, with four numbered notes) now
  sits directly under the sequence as evidence rather than as a claim.

**Collection page**

- Every direction is now described in **perceptual terms**, not design theory:
  *Quiet and unhurried*, *Precise and calm*, *Warm, made for families*,
  *Even-handed*, *Direct and welcoming*, *Ordered and clinical*, *Local and
  practical*, *Plain and direct*. The filter chips and the search vocabulary
  were rewritten to match, so a therapist can search "families" or "quiet"
  rather than knowing what "editorial" means.

**Service page**

- Rebuilt as **progressive disclosure**: the proposition and a four-row price
  ledger, then a short three-column summary (what you get / what you bring /
  what I do), then the full thirty-item scope inside a closed
  `<details>` — "Open the full scope" — then how it runs, then the edge cases.
  The detail is all still there; it is no longer the first thing you meet.
- **Practice Clarity** now opens by making it acceptable not to need it:
  *"Most therapists do not need this. If you can already say who you work with
  and what you offer, the £995 website is a complete piece of work and I would
  rather you kept the £500."*
- **Website Care** now leads with reassurance rather than scope: *"You are not
  left holding it."* It also says plainly that there is no automatic renewal and
  that I write and ask before the year is up. No countdown, no scarcity, no
  pre-ticked anything.

**Contact**

- Seven fields became six, and the two selects that did not change the reply
  were reworked. The route selector was removed entirely and replaced by a
  hidden context field, so the form no longer asks the visitor to categorise
  themselves before they have spoken to anyone.

**Navigation**

- Four flat links and one action: **The collection · What it costs · Useful
  guidance · About · Start a website.** The dropdown is gone.

**Small contextual guidance**

- Three quiet in-context links were added where a decision actually happens: on
  the collection page ("not sure which fits?"), on the About page, and beside
  the prices. Each points at a specific note, not at a general index.

## Removed

- **The Journal as a destination.** `blog.html` is deleted.
- The `<details>` dropdown in the header, its CSS and its JavaScript.
- The route `<select>` on the contact form.
- The seven-step process diagram on the homepage.
- The duplicated guides and journal sections from the Practice Clarity page.
- Design-theory vocabulary from the collection ("editorial", "measured",
  "neuroaffirming" as a label) — the ideas survive in the descriptions, the
  jargon does not.
- Dead navigation CSS and JS left over from the dropdown (1.5 KB of stylesheet).

## Content

Five new short notes were written, at `/guidance/`, each five to six minutes:

1. **What actually needs to be on a therapist's homepage** — the five things a
   prospective client looks for and the order they look in.
2. **How much should you say about yourself?** — where the line usually sits
   between four lines and an autobiography.
3. **Do you need professional photographs?** — one of you, yes; a full shoot,
   usually not.
4. **Why a good website should put some people off** — specificity as
   recognition rather than as a marketing tactic.
5. **Before you redesign your website** — ten questions, three of which can be
   fixed this afternoon.

They are short, they are written in the same voice as the rest of the site, and
none of them is an SEO essay, a keyword exercise or a lead magnet. There is no
capture form on any of them.

## Library decision

The free content and the paid add-on were sharing a name, which made the free
writing look like an advert for the £500 and made the £500 look like something
you could get for nothing. They have been split:

- **`/guidance/` — "Useful guidance"** is now the one free front door. It holds
  the five notes, the two longer practical guides, and a link onward to the
  principles. It is what the navigation points at.
- **`/practice-clarity/` — "The nine principles"** is now a reference page
  rather than a second index. It opens by saying *"Most therapists do not need
  to read these to get a good website."*

`/blog`, `/blog/` and `/practice-notes/` redirect to `/guidance/`; `/library`,
`/library/` and `/practice-clarity.html` redirect to `/practice-clarity/`. Both
Journal articles keep their own URLs and are linked from `/guidance/`. A QA
check now fails the build if the header grows past four links, regains a
dropdown, loses `/guidance/`, drops either redirect, or if any published page
links to `/blog/` again.

## Why this version should work better

1. **The reader is told what is being asked of them, early and in plain
   English.** The old homepage described a service; this one says who does what.
   The four-step You/You/Me/Yours sequence answers the question a nervous
   visitor is actually asking — *how much of this is my job?* — before they have
   to ask it.
2. **The collection is now browsable by feeling rather than by vocabulary.** The
   directions are chosen by non-designers; they are now labelled in the words
   non-designers use.
3. **The service page no longer front-loads its own contract.** Thirty items of
   scope is a reason to trust someone, not an introduction to them. Putting it
   behind one honest click reduced the page's first impression from a document
   to a proposition without hiding anything.
4. **Two moments of deliberate un-selling.** "Most therapists do not need this"
   on Practice Clarity, and "I would rather you kept the £500", do more for
   trust than any amount of reassurance copy, because they cost something.
5. **One resource surface instead of two.** A visitor looking for help now has
   one place to look, and the free writing is no longer competing with the
   paid add-on for the same name.
6. **Nothing was polished out.** The specific, slightly awkward, human lines
   were kept on purpose: *"Six boxes. Two of them are your name and your
   email."*, *"Calls only where they genuinely help."*, *"if that is the
   cheaper option, or somebody else."*

---

## Fixed during verification

- **The mobile navigation panel did not open properly.** `backdrop-filter` on
  `.site-header` was making the header the containing block for every
  fixed-position descendant, so the full-screen panel was being clipped into the
  4.5rem header strip: the links rendered transparently over the hero. The blur
  moved to a `::before` pseudo-element, which keeps the effect and gives the
  panel the viewport back. A new browser check now opens the menu at 320, 375
  and 768 and fails if the panel does not cover the page or if any link falls
  outside it. This is a pre-existing bug, not a new one — it was invisible to
  every previous harness because none of them opened the menu.
- Two collection labels were mangled by a bulk edit ("Plain and direct and
  welcoming"); both corrected.
- Card excerpts on `/guidance/` and `/practice-clarity/` were being truncated
  mid-word. They now print the written summary in full, or cut on a word.
- `scripts/qa.mjs` built its route table from `git ls-files` alone, so a page
  written but not yet staged made every link into it look broken. It now counts
  untracked-but-not-ignored files too.

## Verification

| Harness | Result |
|---|---|
| `scripts/qa.mjs` | **65 passed, 0 failed** |
| `scripts/qa-browser/run.mjs` | **PASS** — 0 failures across 6 widths, plus 200% zoom, keyboard order, landmarks, reduced motion, contrast, and the new mobile-navigation check |
| `scripts/responsive-qa/a11y.mjs` | **0 axe violations**, 36 routes × 4 viewports |
| `scripts/responsive-qa/typography.mjs` | **0 hard failures** |
| `scripts/responsive-qa/primary-targets.mjs` | **0** under-size targets, 0 missing focus indicators, 0 overflow |
| Weight | ~129 KB gzipped per page, LCP 228–268 ms, CLS 0 |

Viewed and read at 320, 375/390, 768, 1024, 1280 and 1440.

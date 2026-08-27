# Final pre-launch pass — changelog

> **SUPERSEDED — historical record, August 2026.** This document describes the
> state of the project at the time it was written and is kept as a record. It is
> **not** a statement of the current offer and must not be used as a source when
> implementing. Prices, offer names and routes described here may since have been
> retired. The canonical position is in `README.md` and `IMPLEMENTATION.md`; the
> open questions are in `OPEN_DECISIONS.md`.

A convergence pass. Every change below fixes something the independent audit
identified, or a defect found while fixing one. Nothing was redesigned.

## Legal readiness

The eighteen bracketed placeholders across four pages resolve to **eleven
distinct facts**, repeated by hand and able to drift apart. They now come from
`_data/legal.yml` through a new `_includes/legal-fact.html`, which renders the
value when it exists and the original placeholder when it does not — so an
unfinished page still looks unfinished. No legal fact was invented, guessed or
defaulted, and `approved` remains `false`.

`LEGAL-INFORMATION-REQUIRED.md` lists all eleven, what each means, where it
appears, and which are urgent now versus gated on the checkout opening.

Three items are drafting rather than data (model cancellation form, ADR route,
liability cap) and were deliberately left as visible placeholders.

## Cost-page conversion

One primary action added to the closing plate of `/service/`: **Start a
website**, to `/contact/`. "Everything included" stays as the secondary. That
page previously carried one primary button and it pointed at another scope page,
so a reader who had finished and decided yes had no affirmative next step.

The rest of the journey was traced and no other genuine dead end was found. The
homepage closing CTA is a browse action because browsing is the correct next
step there; the scope page's "Ask a question first" is accurate while online
purchasing is off. Both left alone.

## Reading times

**Nineteen labels were wrong, not six.** Every one is now computed from the
actual body word count at 220 wpm, floored at two minutes.

The nine principles claimed 18–22 minutes and are 10–13. `closing-reflection`
claimed 10 and is 6. Two journal posts claimed "6 minute read" and are 340 and
376 words. One "longer guide" carried no label at all and is 514 words. Only
`counselling-directory-profile` was close, and it moved 18 → 19.

Category language corrected to match: "Five notes, ten minutes each" → "a few
minutes each"; "when you have more than ten minutes" → "once a directory is
doing the work", because one of the two guides in that section is a two-minute
read.

## Analytics

Architecture only. **Nothing loads until `_config.yml` is given a provider, a
domain and a host** — unconfigured, the include emits zero bytes and the site
still makes no third-party request. Plausible is the one implemented provider:
cookieless, no persistent identifier, no advertising network.

`assets/js/analytics-events.js` sends only three allowlisted event names and
**never reads what anybody types** — no `.value`, no `FormData`, no payload
argument anywhere. A new QA check enforces all of that, including that the
allowlist is actually enforced before sending.

`netlify.toml` documents the two CSP directives that must change when it is
switched on. Nothing there was loosened.

## Contact resilience

The `mailto:` approach is kept — it is right for this audience and the privacy
line stays true. What is new is a fallback revealed after submit: the prepared
message in a read-only field, a copy button, and the address. Built in the
browser from what is already on screen and never transmitted.

Revealed on every submit rather than on failure, because a browser does not
report whether a mail app opened.

## Housekeeping

- `404.html` gains `sitemap: false` and no longer appears in the sitemap.
- Structured data added: `ProfessionalService` (home), `Person` (about),
  `Article` (every guide and post). No rating, review, award, address or
  telephone number — none of those facts exists. All 23 JSON-LD blocks validate.
- `FAQPage` deliberately **not** added. The FAQ is real, but its rich result is
  now restricted to government and health sites, so the markup would buy nothing
  while duplicating hand-written copy somewhere it could silently drift.
- The guide layout's closing plate now branches on category. The nine principles
  still close on Practice Clarity. The five short notes and the practical guides
  close on the collection and the price instead — they were closing free,
  practical writing with a £500 offer, which contradicts diagnosing rather than
  selling it. This also supplies the commercial link the guidance cluster was
  missing.
- FAQ question "Why is this cheaper than a bespoke website?" → "How is this
  different from a bespoke website?", with the answer's opening "Because"
  removed. The old wording framed £995 as a discount on bespoke.

## Defects found and fixed while working

- **`.fallback` was visible before submit.** A class-level `display: grid` beats
  the user agent's `[hidden] { display: none }`, so the block showed with an
  empty field. Fixed with `.fallback[hidden] { display: none; }`. Checked every
  other element on the site carrying a real `hidden` attribute — `.notice` and
  the copy confirmation set no `display`, so they were never affected.
- **The fallback overflowed at 200% zoom on mobile** by 114px: grid and flex
  children default to a min-content floor that a textarea and a button row both
  exceed at 195px. Fixed with explicit `min-width: 0` floors, and
  `overflow-wrap: anywhere` on the studio address, which is one unbreakable
  token. Caught by the existing typography harness.

## QA

| Harness | Baseline | After |
|---|---|---|
| `scripts/qa.mjs` | 66 passed, 0 failed | **67 passed, 0 failed** |
| `qa-browser` | PASS, 0 failures, 6 warnings | **PASS, 0 failures, 6 warnings** |
| `a11y` (axe) | 0 violations | **0 violations**, 36 routes × 4 viewports |
| `typography` | 0 hard failures | **0 hard failures** |
| `primary-targets` | 0 | **0** under-size, 0 focus, 0 overflow |
| Page weight | 128.9 KB, CLS 0 | 129.3 KB, CLS 0 |

Two QA checks were rewritten rather than relaxed: the purchase-complete
analytics guard now forbids any payload argument instead of asserting analytics
does not exist, and the legal-placeholder check now inspects the **built** pages
and fails if a fact is empty while nothing renders to say so.

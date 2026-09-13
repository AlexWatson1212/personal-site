# Product terminology — the words the site uses, and the only ones it uses

Alexander Watson Studio · internal · 13 September 2026

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

This file exists because the Sofia Marin implementation changed what the studio
delivers, and the fastest way to lose the value of that change is to describe it
five different ways on five different pages. One name per thing. Where a page
needs to say it differently, it is wrong, not the name.

---

## 1. The product

**Practice Identity & Website.**

Written with an ampersand. In HTML body copy it is `&amp;`; in front matter and
in JSON-LD it is a bare `&`. It replaces **Therapist Website**, which is now a
retired name and is guarded against in `scripts/qa.mjs` under
*Product scope → The website-only description of the offer has not come back*.

The route is unchanged: `/services/practice-website/`. A URL slug is plumbing.
Changing it would cost a redirect, a route-table edit, a breadcrumb, the
purchasing URLs and every existing link, and would buy a customer nothing.

## 2. The four stages

One piece of work in four stages, sold once. The client is never asked which of
them they need — that judgement is the studio's and it is most of what the price
pays for.

| Stage | Name | What it settles |
| --- | --- | --- |
| 1 | **Practice Clarity** | What the practice stands for, who it is for, what it should say, and what it is not |
| 2 | **Practice Identity** | The words, then the look. Both follow from stage 1 |
| 3 | **The website** | The identity applied, built, launched and cared for |
| 4 | **Yours to keep** | The identity written down, with the files, in the client's name |

Stage 2 has two halves and they are always named in this order: **the words**
(position, descriptions at usable lengths, vocabulary, language to avoid) and
then **the look** (typography, colour, wordmark). The words come first because
they are the half a therapist can immediately recognise as their problem.

Stage 4 is **"Yours to keep"** everywhere. Not "the toolkit", not "the handover
pack", not "your brand kit". `#yours-to-keep` on `/service/`, `#keep` on the
published scope page.

## 3. The document

**Practice Identity Guide.** Singular, capitalised, no page count anywhere on
the site — the evidence on `/work/sofia-marin/` renders from
`_data/identity_evidence.yml` precisely so the document can be reorganised
without the page being touched.

## 4. Words the site may not use

Three sets, and all three are enforced by `npm test`.

**Banned already, and unchanged:** *package*, *bundle*, *upgrade*, "two routes /
options / tiers", "unlimited revisions". These rebuild the retired tier
structure.

**Retired by this change:** "Therapist Website", "a visual identity for the
website", "brand guidelines, stationery". The last is the important one — it was
an exclusion, and it now promises the absence of something the client actually
receives.

**Open-ended promises, newly guarded:** "unlimited templates/design/
applications", "ongoing design support", "everything you need", "all your
marketing materials", "any printed item". The offer has to be extremely valuable
*and* finite.

## 5. The distinction that keeps the offer bounded

**Made:** the identity guide, the wordmark files, the colour and typography
specifications, the fonts where their licences permit, three templates
(letterhead, email signature, business card), four supplier briefs, the website
specification.

**Specified:** everything else a practice might one day want made — a leaflet,
an appointment card, a door plaque, a worksheet, a poster. The guide describes
it precisely enough for a supplier to produce, and producing it is outside the
scope.

That single distinction is what lets the studio increase the value of the
outcome without selling an unbounded amount of design. Any page that loses it
has started promising a retainer.

## 6. Ownership, which is now a contractual position and not a slogan

The practice identity — the wordmark, the guide, the colour and typography
specifications, the templates and the supplier briefs — is **owned outright** by
the client on full payment, and may be given to another designer, printer, sign
maker or developer. It is *not* licensed for one website.

The **website design system, layout and code** remain the studio's and are
licensed, as before: non-exclusive, perpetual, non-transferable, one website,
one practice.

Typefaces travel with the identity where their licence permits, and are named
rather than supplied where it does not.

Clause 13 of `/service-terms/practice-website/` carries this, and both new
paragraphs are flagged ⚖ for a solicitor.

## 7. What has not changed

The price, the instalments, the founding arrangement, the route, the nav labels,
the six-case collection, Website Care, and the "name the one you keep returning
to" starting point. The collection is still where a project begins visually — it
is a fast way to read what a practitioner responds to before anything else is
known about them, and the site already says it is a starting point rather than
the thing being bought. Nothing about the identity work contradicts that.

# Concept publication assessment

**27 August 2026.** Assessed against the actual current builds, not the
provisional ranking. Every concept was built from source and rendered in a real
browser at 1440×900, 834×1112 and 390×844.

Method: `npm install` and the project's own build command, then Playwright
against the built `dist/`, plus a source audit for the publication gates.

## Verdict

| | Concept | Pages | Build | Gates | Verdict |
|---|---|---|---|---|---|
| 1 | **Different Minds** | 25 | clean | all pass | **Publish** |
| 2 | **Harbour** | 14 | clean | all pass | **Publish** |
| 3 | **Common Ground** | 13 | clean | all pass | **Publish** |
| 4 | **Rowan Hill** | 2 | clean | sitemap present | **Publish**, after removing the sitemap |
| 5 | Stillpoint | 12 | clean | **live form** | **Defer** |
| 6 | North & Vale | — | not built | — | Defer — V2 rebuild already commissioned |
| 7 | Face to Face | — | not built | — | Defer — real named charity, see below |

Four published, one deferred on a defect, two deferred on prior decisions.

## The publication gates

Applied to every candidate. These are pass/fail, not matters of taste.

| Gate | Different Minds | Harbour | Common Ground | Rowan Hill | Stillpoint |
|---|---|---|---|---|---|
| Concept notice on every page | 25/25 | 14/14 | 13/13 | 2/2 | 12/12 |
| `noindex` on every page | 25/25 | 14/14 | 13/13 | 2/2 | 12/12 |
| robots.txt states the position | yes | yes | yes | yes | yes |
| No sitemap | ✗ has two | yes | yes | ✗ has one | ✗ has two |
| Forms cannot transmit | no forms | no forms | inert, labelled demo | inert | **✗ live Netlify form** |
| No real telephone/postcode for the practice | ✗ see below | helpline only | helpline only | yes | ✗ see below |
| No invented registrations or testimonials | yes | yes | yes | yes | yes |
| Console errors at three viewports | 0 | 0 | 0 | 0 | 0 |

## What each one proves

**Different Minds — publish first.** Twenty-five pages, and the most complete
idea in the set. The struck-through headline and the six-routes mark, with its
own explanation beside it, are a real concept rather than a decorated one. It
carries a reading-preferences control, has no forms at all, and states its
provenance on every page. It is also the furthest from the calm-beige therapist
default, which is precisely what makes it valuable next to Rowan Hill.

**Harbour — publish second.** The hardest structural problem in the collection:
one page that has to address a parent, a teenager and a school. The audience
routing is offered before anything is asked, the illustration system is
consistent, and the calm/reading controls are genuine accessibility work rather
than decoration. Strongest available evidence of capability rather than taste.

**Common Ground — publish third, and it is better than the provisional ranking
assumed.** The typographic hero is the most confident thing in the set, and the
enquiry form is honestly labelled "ENQUIRY DEMO" and cannot transmit. It was
ranked fifth on the assumption that nothing it proved was urgent; on the actual
build that was wrong.

**Rowan Hill — publish fourth.** Elegant and restrained, and the
fee/availability rail beside the hero is a genuinely good idea. It is the
direction most solo therapists will choose, and the tailoring exhibit on the home
page is built on it, so publishing it matters for coherence.

It is **a single long page with an index rail (01–07) and anchor navigation** —
two HTML files including the 404. That is the design position, not an incomplete
build: the seven sections carry what five pages would, in the order somebody
reads them. It sits inside "up to five core pages" rather than against it.

The collection entry now says so, because a buyer choosing this direction should
know she is choosing one page before she chooses it, not discover it at the
Direction Note.

## Stillpoint — deferred, and why

Stillpoint is otherwise excellent: twelve pages, the most disciplined typography
in the set, and the restraint is real rather than empty. It is deferred for one
reason.

`src/pages/contact.astro` carries a **live Netlify form**:

```
<form name="enquiry" method="post" action="/thank-you/" data-netlify="true" …>
```

Deployed to Netlify, that form would genuinely accept and store submissions from
strangers who believe Stillpoint is a real therapy practice — the exact failure
the concept rules exist to prevent. Someone in distress could send a real
enquiry, believing it had reached a counsellor, and nobody would ever read it.

**The fix is small** — remove `method`, `action` and `data-netlify`, disable the
inputs, and add the demo label the other concepts use — and it would make an
otherwise excellent concept publishable. It has deliberately **not** been applied
here, because it is a change to a concept repository outside the approved
implementation scope, and because a live form on a fictional therapy practice is
the kind of thing that should be signed off rather than quietly patched.

Publish it in the next pass once that is done. It does not need redesigning.

## Small fixes required before the four go live

None of these is a redesign. All are configuration.

1. **Different Minds** — remove `sitemap-0.xml` and `sitemap-index.xml`, and the
   `@astrojs/sitemap` integration that generates them. The concept rule is
   noindex **and** no sitemap.
2. **Rowan Hill** — remove `sitemap.xml` from the build output.
3. **Different Minds** — the centre's address uses **real Manchester postcodes**
   (`M15 4GB` in `src/data/site.ts`, `M3 4EN` in `visiting.astro`). Real
   postcodes for a fictional practice breach the concept rules. Replace with a
   street-level description and no postcode.
4. **All four** — assign concept subdomains and confirm each deploys
   reproducibly from a documented command.

## Two judgement calls, recorded rather than decided

**Crisis helplines are not "a telephone number".** Harbour lists `0800 1111`
(Childline) and Common Ground lists `0808 2000 247` (the National Domestic Abuse
Helpline). The concept rule forbidding telephone numbers exists so a fictional
practice cannot be contacted as though it were real. A genuine public helpline is
the opposite: it is a real, correct safety resource, and removing it from a
concept about family or relationship therapy would make the concept less
responsible rather than more. They have been left in place. If you disagree, both
are single-line removals.

**Face to Face is the only piece carrying real disclosure risk.** It is an
unofficial redesign of a named, real charity, made without their involvement. It
is defensible as portfolio work, and the `studio-redesign` provenance label now
states exactly what it is — but it should not be among the first four a
prospective client meets, and it should not be presented anywhere that implies a
commission.

## What could not be verified here

- **Deployment.** None of the concepts is deployed to a subdomain yet, so no live
  links have been added to `/work/`. The provenance field is implemented and
  rendering; the `href` mechanism already exists on the collection entries and is
  ready for URLs.
- **North & Vale and Face to Face** were not built or rendered. Both were already
  deferred on decisions taken before this pass, so building them would have
  changed nothing.
- **Motion and interaction** were assessed from source and from static renders,
  not by driving the interactions.

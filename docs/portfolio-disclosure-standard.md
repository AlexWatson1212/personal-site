# Portfolio disclosure — the Studio standard

Alexander Watson Studio · internal · written 6 September 2026

Six concept websites are published as portfolio work for practices that do not exist.
This file is the standard each of them must meet. It is written now, and applied later,
for two reasons given in §"Why this is not implemented yet".

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

---

## The disclosure, in words

Every concept site must make four things unmistakable, in this order of importance:

1. **Whose work it is.** Alexander Watson Studio.
2. **What it is.** A portfolio concept.
3. **Who does not exist.** *[Name] is a fictional practitioner* — or, for Harbour,
   *a fictional practice*.
4. **What is not on offer.** No therapy or counselling service is offered.

The canonical short form, for the persistent element:

> **Alexander Watson Studio · portfolio concept**
> [Name] is a fictional practitioner. No counselling service is offered.

A concept may set this in its own typeface and palette. It may not shorten it below
those four facts, and it may not put it behind an interaction.

---

## The six mechanisms

A concept conforms when all six are true. These are derived from what the six already
do, not invented: Sofia established the pattern and the others followed it unevenly.

| # | Mechanism | Requirement |
|---|---|---|
| 1 | **Persistent attribution** | Visible on every screen at every width, without scrolling or opening anything. A fixed edge tab is the established form. |
| 2 | **Footer disclosure** | The full four facts in the footer of every page. |
| 3 | **Credentials note** | Wherever training, membership, registration, supervision or insurance appears, a note beside it that none is claimed and no number exists. No real professional body may be named. |
| 4 | **Inert enquiry** | Any form must transmit nothing, must say that nothing was sent, and must fail closed with scripting disabled. |
| 5 | **Out of search** | `noindex` on every page, no sitemap. |
| 6 | **Honest structured data** | Portfolio concept, or none. Never `LocalBusiness`, `MedicalBusiness`, `Physician` or any healthcare type. |

**Two carve-outs, both deliberate.** Crisis and helpline numbers stay real and correct —
a fictional practice is a poor reason to publish a wrong helpline number. Telephone
numbers use the Ofcom drama range and email addresses the reserved `.example` domain, so
neither can reach anyone.

---

## Where the six stand

Assembled from what each Studio case page states about its concept. **It is a reading of
the Studio's own descriptions, not an inspection of the six repositories**, which are not
reachable from this one. Verify against the source before acting on any row.

| Concept | Recorded as having | Not recorded either way |
|---|---|---|
| Sofia Marin | Disclosure on every screen · inert form · out of search | Structured data |
| Maya Bennett | Disclosure on every screen and width · credentials note · inert form · out of search | Structured data |
| Daniel Mercer | Out of search · no business or healthcare structured data | Persistent element · form |
| Helen Calder | Registration explicitly disclaimed, no body named | Persistent element · form · search · structured data |
| Harbour | Not commissioned by anyone · no client work represented · own contact route | Persistent element · search · structured data |
| Stillpoint | Fixed attribution tab on every screen · full footer disclosure · inert form · noindex, no sitemap · portfolio-concept structured data | — complete |

**Stillpoint is the reference implementation.** It is the only one recorded as meeting all
six, and it is the most recent. Standardise the other five *to Stillpoint*, rather than
writing anything new.

The gaps in column three are unknowns, not failures. Four of the five may already conform.

---

## Why this is not implemented yet

Two reasons, and either alone would be sufficient.

**The concepts are not in this repository.** They live in a separate location
(`Desktop/Sites/Concepts`), are Astro projects rather than Jekyll, and are not connected
to this session. Standardising them means editing six repositories and redeploying six
sites.

**Six individual concept passes are the next scheduled work** — Sofia, Maya, Daniel,
Helen, Harbour and Stillpoint each get a refinement pass. Touching their markup now would
collide with that, and a disclosure element inserted before a layout pass is a disclosure
element that has to be placed twice.

**So: apply this standard as the first item of each concept's own pass.** One repository
at a time, against the checklist above, with Stillpoint as the model. That is cheaper than
a seventh sweep and it cannot conflict with itself.

---

## The conformance test

For each concept, at 375px and 1440px, with JavaScript disabled for the last item:

1. Load any interior page. Is the attribution visible without scrolling?
2. Read the footer. Are all four facts there?
3. Find the credentials. Is the disclaimer beside them, and is no real body named?
4. Submit the form. Does it say nothing was sent — and with scripting off, does nothing happen?
5. View source. `noindex` present, no sitemap linked?
6. View source. Any healthcare structured data?

Six yes, one no. Anything else is a defect.

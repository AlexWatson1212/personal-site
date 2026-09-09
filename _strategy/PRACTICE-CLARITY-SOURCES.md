# Practice Clarity Blueprints — which file is canonical

`_strategy/` is excluded from the build and is never published. It holds the
working sources. The public site references exactly one asset per practice, and
those are the files in `assets/practice-clarity/`.

The source filenames carry working history (`_1`, mixed separators). That is
fine internally, but it means the newest-looking name is not evidence of
anything. This table is the evidence. Recorded 9 September 2026.

| Practice | Public asset (canonical) | Built from |
|---|---|---|
| Maya Bennett | `practice-clarity-maya-bennett.pdf` | `Practice Clarity Blueprint — Maya Bennett.pdf` |
| Daniel Mercer | `practice-clarity-daniel-mercer.pdf` | `Practice_Clarity_Blueprint_Daniel_Mercer_1.pdf` |
| Harbour | `practice-clarity-harbour.pdf` | `Practice Clarity Blueprint — Harbour_1.pdf` |
| Helen Calder | `practice-clarity-helen-calder.pdf` | `Practice Clarity Blueprint — Helen Calder_1.pdf` |
| Sofia Marin | `practice-clarity-sofia-marin.pdf` | `Practice Clarity Blueprint — Sofia Marin.pdf` |
| Stillpoint | `practice-clarity-stillpoint.pdf` | `stillpoint-practice-clarity-blueprint.html` |

Stillpoint is the exception: its source is HTML, not PDF. It is self-contained
(fonts inlined, no external requests) and renders with headless Chrome at the
page size its own stylesheet declares — `320mm × 180mm`, which is the 16:9 sheet
the other five use. Everything else in the set was already a PDF.

Maya's public PDF is not a copy of its source. The source embeds its two
photographs losslessly at 3.3 MB; the published file re-encodes those two images
as JPEG and is 1.0 MB. Nothing else about it is changed, and the text layer,
typography and layout are untouched.

## What changed on 9 September 2026

These six replaced the previous set, which were *portfolio editions*
reverse-engineered from finished websites — they said so on their own second
page. The current six are the opposite: written before design, addressed to the
practitioner for correction, and labelled throughout as **Established**,
**Interpretation** or **Recommendation**, with each page closing by naming what
it rests on. All six share one fourteen-section framework and end in an approval
page.

Public copy that described the old documents — "written after the website",
"reconstructed from the finished work", "separates evidence from inference",
"Strategic translation" — was corrected across `/work/`, the six case pages and
`/practice-clarity/` at the same time. If these documents are revised again,
those are the phrases to re-check, along with the page counts and file sizes
quoted on every case page.

## Pending correction — blocked on missing sources

Two sentences in all six Blueprints contradict the commercial offer and must be
corrected the next time these documents are built. They have **not** been
applied, because five of the six have no reachable HTML source (see below).
Applying them to one document and not the others would break the consistency
that is the whole point of the set, so all six wait together.

**1. The revision promise**, on the approval page (section 14), left column:

> from: `Two consolidated rounds of revision are included at this stage.`
> to:   `One consolidated round of revision is included at this stage.`

The offer is one consolidated revision of the Direction Note, and two
consolidated rounds on the website itself. The two-round sentence is byte
identical in all six, which is what identifies it as template boilerplate rather
than a decision: `/service/`, `services/practice-website.html`,
`DIRECTION-NOTE-TEMPLATE.md` and `docs/pre-launch.md` all say one, and
`OPEN_DECISIONS.md` records no intent to change it.

**2. The portfolio note**, foot of the same page:

> from: `This note appears only in portfolio editions.`
> to:   `This Blueprint is published at portfolio length. A commissioned practice
>        receives a concise Direction Note recording the agreed direction.`

The current wording presupposes client editions of this document. There are
none: a commissioned practice receives the one-page Direction Note.

**Why this is blocked.** Only `stillpoint-practice-clarity-blueprint.html` is
present. The five PDFs exported on 9 September have no HTML source in
`personal-site`, `Concepts` or `Alexander Watson Studio` — the
`practice-clarity-source/blueprint.html` files under `Concepts/*-studio-case/`
are the 8 September sources and produce the previous, reverse-engineered
documents. Editing the PDFs directly is not viable: the text is glyph-encoded
through subsetted fonts with absolute positioning, so a length change breaks the
line, and the portfolio note needs to reflow onto a third line.

This is a demonstration artefact rather than a promise to a live buyer — the
approval page belongs to a fictional practice — so the published set can wait
for the sources without misleading anyone who is actually buying.

## Known disagreement between a document and its build

The Helen Calder Blueprint recommends three photographs, one of them a portrait
of Helen. The built concept site has no portrait. The document is newer, and it
presents this as a recommendation for review rather than a description of what
exists, so the two are not in conflict — but no public page should claim either
that the site has a portrait or that the practice has decided against one. The
`/work/` page previously used "no portrait" as a worked example and no longer
does.

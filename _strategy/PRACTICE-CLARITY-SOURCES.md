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

## Known disagreement between a document and its build

The Helen Calder Blueprint recommends three photographs, one of them a portrait
of Helen. The built concept site has no portrait. The document is newer, and it
presents this as a recommendation for review rather than a description of what
exists, so the two are not in conflict — but no public page should claim either
that the site has a portrait or that the practice has decided against one. The
`/work/` page previously used "no portrait" as a worked example and no longer
does.

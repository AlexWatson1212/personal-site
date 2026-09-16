# Archived portfolio cases — Helen Calder, Harbour, Stillpoint

Archived 16 September 2026. **Not published**: `_strategy/` is excluded from the
Jekyll build.

## Why

The public collection was narrowed from six fictional practices to three
flagships — Sofia Marin, Maya Bennett and Daniel Mercer. This was a strategic
decision, not a temporary hide: three cases make the studio easier to
understand, concentrate attention on the strongest work, and stop the fictional
portfolio growing before real clients have been through the process. The
decision and the freeze rule are recorded in `DECISION-REGISTER.md` at the
repository root.

Nothing here was judged to be poor work. It is kept complete so it can be
reused later without reconstruction.

## What is here

| Path | Was published at |
|---|---|
| `case-pages/helen-calder.html` | `/work/helen-calder/` |
| `case-pages/harbour.html` | `/work/harbour/` |
| `case-pages/stillpoint.html` | `/work/stillpoint/` |
| `assets/practice-clarity/practice-clarity-*.pdf` | `/assets/practice-clarity/…` |
| `assets/images/work/*` | `/assets/images/work/…` |
| `collection-entries.yml` | entries 04–06 of `_data/collection.yml` |

The editable Blueprint sources stay where they were, in `_strategy/`
(`Practice Clarity Blueprint — Helen Calder_1.pdf`, `… — Harbour_1.pdf`,
`stillpoint-practice-clarity-blueprint.html`).

The case pages are kept exactly as they were published, so they still say
"one of the six cases" and link to one another. That is historical text; do
not republish a page without rewriting it for the collection as it then is.

## What happens to the old URLs

`_redirects` sends the three case routes and the three PDFs to `/work/` with a
301. Nothing on the published site links to them, and `scripts/qa.mjs` fails
the build if anything starts to.

## Outside this repository

The three concept websites are separate deployments and were **not** changed:

- https://helen-calder.alexanderwatson.co.uk/
- https://harbour-concept.alexanderwatson.co.uk/
- https://stillpoint.alexanderwatson.co.uk/

They carry their own fictional-practice disclosures and are kept out of search.
Whether to leave them up, unlinked, or take them down is Alexander's decision.
If any of them links back to its old case page, that link now lands on
`/work/`.

## To restore one

Move its case page back to `work/`, its PDF and images back under `assets/`,
its entry back into `_data/collection.yml`, remove its lines from `_redirects`,
update `scripts/qa.mjs` (the flagship check), rewrite every "three" on the
public pages — and record the reason in `DECISION-REGISTER.md` first.

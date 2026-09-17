# Retired: the Website Content Questionnaire (September 2026)

Retired on 17 September 2026, when the Practice Fundamentals Intake System was
adopted. The intake is now a Tally form opened from the private page
`/client/intake/`; the old route `/services/practice-website/questionnaire/`
redirects there (see `_redirects`).

These two files are kept for reference only. `_legacy/` is excluded from the
Jekyll build and from `scripts/qa.mjs`, so nothing here is published or tested.

- `practice-website-questionnaire.html` — the 16-question browser-only form
- `practice-website-questionnaire.js` — its validation and email assembly

The current questions, their order, classifications and logic are in
`docs/operations/practice-fundamentals-intake-system.md` (the approved source)
and `docs/operations/tally-intake-build-spec.md` (the build instructions).

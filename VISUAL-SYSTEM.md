# Alexander Watson Studio — visual system

One stylesheet, written rather than accumulated: `assets/css/studio.css`.
`npm run build:css` minifies it to `assets/css/studio.min.css`, which every
page loads and nothing else. Roughly 91 KB of source, 66 KB minified, **11 KB
over the wire**, cached once and reused on every subsequent page.

It replaced three hand-edited stylesheets and thirteen generated bundles:

| Retired | Size | Why |
|---|---:|---|
| `main.css` | 342 KB / 14,899 lines | Forty-three dated override passes, ~1,100 `!important` declarations, a blanket `h1…h6 { !important }` rule every later section had to fight |
| `visual-system.css` | 55 KB | Token layer plus corrective overrides for the above |
| `catalogue-refresh.css` | 78 KB, never purged or minified | A second, parallel system used by eight pages |
| `links.css` | 11 KB | A third system, used by one page |
| 13 × `*.min.css` | 36–90 KB each | PurgeCSS bundles cut from the above, one per route |

`scripts/build-css.mjs` refuses to build if a `!important` declaration, a
missing `@font-face`, the token block or the reduced-motion guard ever
disappears from the source.

---

## Tokens

All in `:root` at the top of §01.

**Surfaces** — three, and nothing else is ever a background.
`--paper #F7F4EF` · `--paper-deep #F0ECE4` · `--sage #E4E9E2` · `--ink #263835`
(`--ink-deep #1C2A27` for the pressed state).
Applied through `.on-paper`, `.on-paper-deep`, `.on-sage`, `.on-ink`, which
also flip the text and rule colours inside them.

**Content** — `--text #1D2622` (14.2:1 on paper) · `--text-quiet #4E5852`
(6.7:1) · `--text-faint #5B645E` (5.6:1 on paper, 5.0:1 on sage; labels and
captions only) · `--on-ink #F2EFE8` (10.8:1) · `--on-ink-quiet #B6C2BB` (6.7:1).

**Line work** — `--line #D9D3C8`, `--line-soft`, `--line-strong`,
`--line-on-ink`. Hairlines do the work cards and shadows used to.

**Accent** — `--clay #8A5238`, one colour, used only for marks: the final tick
on a diagram, a numbered annotation, a legal flag. Never a surface.

**Type** — Newsreader (variable, 200–800) for headings, Inter (variable) for
everything else. Both self-hosted from `assets/fonts/`, both preloaded, no
third-party request (`font-src 'self'`).

Scale, fluid: `--t-display` 44→88px · `--t-h1` 36→66px · `--t-h2` 29→47px ·
`--t-h3` 21→26px · `--t-lead` 17→21px · `--t-body` 17px · `--t-small` 15px ·
`--t-tiny` 14px (15px below 48rem) · `--t-label` 11px uppercase, 0.15em.

**Space** — one scale, `--s-1` 4px through `--s-11` 160px. Section rhythm:
`--band` 68→136px, `--band-lg` 88→192px, `--band-sm` 48→88px.

**Measure** — `--wrap` 1180px · `--wrap-wide` 1440px · `--wrap-mid` 46rem ·
`--wrap-text` 34rem, each with a `--gutter` of 22→56px. Running text is capped
at 55ch, which renders at roughly 77 characters a line.

**Form** — radii `--r-xs` 2px through `--r-lg` 10px; pills are 999px. Nothing
is a rounded card by default.

---

## Motion grammar

Consistency is what makes subtle motion read as expensive, so every entrance
on the site is the same shape: **14px of travel, 620ms, one curve.**

`--lift 14px` · `--dur-micro 140ms` · `--dur 240ms` · `--dur-slow 420ms` ·
`--dur-entrance 620ms` · `--dur-image 620ms` · `--stagger 70ms` ·
`--ease-out cubic-bezier(0, 0, 0.28, 1)` · `--ease-inout cubic-bezier(0.4, 0, 0.24, 1)`.

Reduced motion is expressed by **flipping those tokens**, not by a blanket
`!important` reset:

```css
@media (prefers-reduced-motion: reduce) {
  :root { --lift: 0px; --dur: 0.01ms; --dur-entrance: 0.01ms; --stagger: 0ms; … }
}
```

Every transition and animation in the stylesheet reads its duration from a
token, so the preference reaches all of them — including ones a later rule
adds — and nothing has to out-specify anything.

Patterns:

| Pattern | Where | How |
|---|---|---|
| Hero entrance | `.enter`, `.fan__item` | CSS animation on load, `--i` sets the stagger. Supported everywhere. |
| Scroll reveal | `.rise`, `.rise-group > *` | `animation-timeline: view()`, behind `@supports`. Unsupported browsers get the final composition. |
| Depth on scroll | `.fan__item` | ±34/14/22px of `translate` on a `view()` timeline |
| Rule drawing | `.anatomy__rule` | `scaleX` from 0 on a `view()` timeline |
| Pathway drawing | `.pathway__stage::before` | `scaleY` from 0 on a `view()` timeline |
| Image in a fixed frame | `.plate-frame`, `.article-card__media` | `scale(1.022)` inside `overflow: clip`. No lift, no shadow. |
| Link underline | `.tlink` | `background-size` grows the rule from 1px to 2px |
| Header state | `.site-header.is-scrolled` | class from `nav.js`; a hairline and an opaque ground appear. Nothing moves, so nothing reflows. |

Nothing is hidden by default and no script is required to reveal content: the
reveal animations only ever *remove* themselves.

---

## Components

`.plate` (§09) is the collection specimen: a miniature of a design direction's
home page, drawn in CSS. Every internal dimension is in container query units,
the drawn-plate system was retired in September 2026 with the directions it
drew. The collection is now six built websites shown as approved screenshots, and
`.plate-frame` is what survives of the system: the frame the work sits in, with
the caption and swatch rules that go with it. The retired drawing code is kept in
`_strategy/` for reference and is not part of the stylesheet.

Information design (§12) is a small, deliberate vocabulary: a rule, a tick, a
numeral, a label. `.anatomy` (a hairline with seven marks), `.ledger` (three
hairline-ruled columns), `.pathway` (a drawn vertical line with stages),
`.diff` (a direction beside its tailored version, with numbered annotations),
`.care`. No boxes, no arrows, no circled step numbers.

Actions (§06) are two treatments only: `.btn` (a solid ink pill, one per
section) and `.tlink` (an underlined text link). `.btn--quiet` is the outlined
variant used where two actions sit together on ink.

---

## Rules of thumb

- Three surfaces. One accent, used for marks.
- Space and hairlines separate things. Cards are for content whose grouping
  carries meaning — forms, prices, panels — not for every paragraph.
- One primary action per section.
- Every image holds one aspect ratio and sits inside `overflow: clip`.
- Running text stops at 55ch. Nothing on this site runs to 100 characters a line.
- If the motion were removed, the composition would still be finished. It is
  removed, for a third of browsers and for anyone who asks for it.

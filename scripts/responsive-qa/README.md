# aw-responsive-qa

Responsive and editorial-typography QA for the rendered `_preview/` site. It
only reads and reports — it never edits site sources.

It complements `scripts/qa-browser`, which checks structural accessibility
(landmarks, focus order, contrast, reduced motion). This harness is about the
things that make a page look considered or look accidental: where headings
break, how many characters a line of body copy carries, whether a column has
been squeezed below the width its content needs, and whether anything pushes
the page sideways.

## Prerequisites

```bash
node scripts/preview/render.mjs                       # writes _preview/
cd scripts/responsive-qa && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

Chromium is already at `$PLAYWRIGHT_BROWSERS_PATH`. Do **not** run
`npx playwright install`.

### Font fidelity on Linux

Before the August 2026 pass the refreshed pages set their serif with a system
stack (`"Iowan Old Style", "Palatino Linotype", …`). That is fixed in the
stylesheet now, but if you ever measure a page that still uses a system stack,
map those families to a metrically compatible face first, or every line-break
measurement is taken against the wrong metrics:

```xml
<!-- ~/.config/fontconfig/fonts.conf -->
<match target="pattern">
  <test name="family"><string>Palatino Linotype</string></test>
  <edit name="family" mode="assign" binding="strong"><string>TeX Gyre Pagella</string></edit>
</match>
```

## Viewports

Eight target widths — 320, 360, 390, 430, 768, 1024, 1280, 1440 — at height
900, plus:

| label | what it is |
| --- | --- |
| `short-mobile` | 390 x 560 — a phone with the browser chrome expanded |
| `short-laptop` | 1280 x 620 — a 13" laptop with a toolbar and a dock |
| `zoom200-mobile` | 195 x 450 @2x — 200% zoom on a 390px phone |
| `zoom200-laptop` | 640 x 450 @2x — 200% zoom at 1280 |
| `zoom200-desktop` | 720 x 450 @2x — 200% zoom at 1440 |

`zoom200-mobile` is excluded from heading-composition review: at a 195px CSS
viewport there is no composition to judge. It still runs the overflow check,
because a page that scrolls sideways there is still a page that scrolls
sideways.

Every page is settled before measurement: `document.fonts.ready` is awaited
twice (a face requested mid-layout can resolve after the first), the page is
scrolled to trip lazy images, images already loaded are decoded, and
animations and transitions are frozen. Every wait is bounded — a lazy image
below the fold never resolves `decode()`.

## `typography.mjs`

For every visible `h1`, `h2` and `h3` on every route at every viewport it
ranges over the text nodes word by word, takes each word's client rect, groups
the rects into visual lines by vertical overlap, and then reports:

* **one-word-line** — a line box holding a single word.
* **short-final-line** — a final line narrower than 30% of the widest line.

Both are **review warnings, never failures**. A one-word line can be a
deliberate composition; a hard failure would reject it.

Three things keep the warning list honest rather than merely long:

* **Exemptions.** `data-typo-exempt="reason"` on the heading — or on any
  ancestor — moves it to an `exempted` list that still prints, with the reason,
  so an exemption is a visible decision rather than a silent suppression.
* **Unavoidable lines.** If the stranded word could not have shared a line with
  either neighbour at the width the heading actually has, no measure fixes it —
  only a smaller type size would, and for a three-word title on a 320px screen
  that is simply what the content is. Those go to a separate `accepted` list.
* **Screen-reader-only headings** are not set on screen and are skipped.

It also measures, and these **are** failures:

| check | threshold |
| --- | --- |
| prose line length | over 80 rendered characters |
| horizontal overflow | any element past the viewport, with `overflow-x` forced visible |
| prose text size | under 15px on a phone (15–16px is a warning) |
| target size | interactive targets under 24 x 24 CSS px (WCAG 2.2 AA) |

Line length is counted in **rendered characters**, not in `ch`. The `ch` unit is
the width of "0", which is not the width of an average character: measured
across this site, Inter sets about 1.33 characters per ch at body sizes and
Instrument Serif about 0.92 at heading sizes. A `66ch` column sets nearer 88
characters, which is how copy that looked compliant in the stylesheet was
running well past eighty on screen.

## `a11y.mjs`

axe-core — the rule engine behind Lighthouse's accessibility category — over
every route at 390, 768, 1440 and at 200% zoom, with the `wcag2a`, `wcag2aa`,
`wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice` tags. Exits non-zero on
any violation.

## `shots.mjs` and `compare.mjs`

`shots.mjs --set baseline|after` writes a full-page screenshot of every route
at every target width, and of a representative subset at the short and zoomed
viewports. Screenshots are clipped to the viewport width rather than taken with
`fullPage`: Chromium's content size includes the off-canvas mobile navigation
panel, which is `position: fixed` and translated 100% to the right, so a
`fullPage` capture comes back exactly twice the viewport wide with the page in
the left half.

`compare.mjs [--sheets]` reports how much shorter or taller each page became at
each width, and writes side-by-side PNGs for visual review.

## `computed-audit.mjs` and `computed-diff.mjs`

Dumps the computed font family, size, weight, tracking, leading, colour, wrap
and measure of every heading and paragraph on every route at three widths.
Two runs diff cleanly, which is how a cascade refactor can be **proved** to
leave rendering unchanged rather than assumed to:

```bash
node scripts/responsive-qa/computed-audit.mjs --out before.json
# … make the change …
node scripts/responsive-qa/computed-audit.mjs --out after.json
node scripts/responsive-qa/computed-diff.mjs before.json after.json
```

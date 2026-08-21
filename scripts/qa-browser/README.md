# aw-qa-browser

A browser-based QA harness for this site. It renders every route in headless
Chromium at six viewport widths and reports layout, typography and accessibility
defects. **It only reads and reports — it never edits site sources.**

## Prerequisites

Ruby gems are unavailable in this container, so there is no `jekyll build`.
The Node preview harness stands in for it.

```bash
# from the repo root
node scripts/preview/render.mjs        # writes _preview/ ; exits non-zero on route conflicts
```

Install this harness's own dependency once:

```bash
cd scripts/qa-browser
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` matters: Chromium is already installed at
`$PLAYWRIGHT_BROWSERS_PATH` (`/opt/pw-browsers`) and must not be re-downloaded.
Do **not** run `npx playwright install`.

## Run

```bash
# from the repo root
node scripts/qa-browser/run.mjs
```

Runtime is about a minute for 32 routes. Exit code is `1` when there are real
failures, `0` on a clean run, `2` if the harness itself could not start
(no `_preview/`, no routes, or no launchable Chromium).

## What it does

### Static server

A throwaway Node server binds a free port on `127.0.0.1`:

* HTML is served from `_preview/`. Directory URLs resolve to `index.html`.
* `/assets/**` falls through to the **repo root** — the preview harness
  deliberately does not copy assets.
* Query strings are stripped before path resolution, so the site's
  `?v=…` cache-busting stylesheet links resolve correctly.
* Every 404 is logged. 404s under `/assets/images/` and `/assets/fonts/` are
  classified as **environment artefacts** (those directories are empty in this
  container) and reported under "not assessed" — they never fail the run.
  Any other 404 is a real failure.

### Routes

`_preview/` is walked for `index.html` and `404.html`; results are sorted so
output is diffable.

### Per route, at widths 320 / 375 / 768 / 1024 / 1280 / 1440 (height 900)

**Horizontal overflow.** The site forces `overflow-x: hidden` on `html` and
`body`, which *hides* real overflow — so `document.scrollWidth` is useless here.
Instead the harness injects `overflow-x: visible !important` on `html`/`body`
via `page.addStyleTag`, then flags every element whose
`getBoundingClientRect().right > viewportWidth + 1` or `.left < -1`. Excluded:
`position: fixed`, `visibility: hidden`, `display: none`, zero-sized elements,
and anything inside an ancestor whose computed `overflow-x` is `auto`/`scroll`
(legitimately scrollable regions). Each finding records the selector path,
rendered width, and the overflow in px. This runs **last** on each page so the
injected style cannot perturb the other measurements.

**Heading wrapping quality.** For every visible `h1`/`h2`: rendered text, the
number of visual line boxes (`Range` + `getClientRects()` over the text nodes),
and per-word rects grouped into lines to determine the last line's word count.
Flags:

* *orphan/widow* — the last line holds a single word while the heading has more
  than four words. Reported as a **warning**, not a failure: it is a typographic
  quality signal, not a defect.
* *too small* — computed `font-size` below 20px at widths ≥ 1024. **Failure.**
* *clipped* — `scrollHeight > clientHeight + 1`. **Failure.**

**Clipping.** Any element with `overflow`/`overflow-y: hidden` whose
`scrollHeight` exceeds `clientHeight` by more than 4px **and** which contains an
`h1`, `h2` or `h3`.

### Additionally at 1280

* **200% zoom**, emulated two ways: a `640×450` viewport with
  `deviceScaleFactor: 2`, and separately a plain re-run of the overflow and
  clipping checks at width `640`. Both are reported with their mode label.
* **Keyboard order and focus visibility.** The first 25 focusable elements are
  reached with real `Tab` presses (so `:focus-visible` genuinely applies).
  Every focusable is tagged with a `data-qa-fidx` DOM index — removed again
  afterwards — so the tab sequence can be compared against DOM order. For each
  stop the computed style is captured focused and unfocused (outline, box-shadow,
  border, background, colour, text-decoration, transform, filter, opacity); an
  element whose style is byte-identical in both states is flagged as having **no
  visible focus indicator**. Out-of-DOM-order stops are flagged separately.
* **Landmarks.** Exactly one `<main>`; a `<header>` and `<footer>` present;
  the first focusable element is a skip link (matching text/class plus a `#`
  href); exactly one `h1`; and no skipped heading level.
* **Reduced motion.** The page is reloaded under
  `page.emulateMedia({ reducedMotion: 'reduce' })` and any visible element with a
  computed `animation-duration` or `transition-duration` above 0.05s is reported.
  Findings are collapsed to distinct selector+duration rules with a repeat count.
* **Colour contrast (WCAG 2.2).** Every non-empty text node's computed colour is
  compared against the nearest **opaque** ancestor background, compositing any
  translucent layers on the way up. Threshold is 3:1 for large text
  (≥ 24px, or ≥ 18.66px bold) and 4.5:1 otherwise. If an ancestor carries a
  `background-image` — including a gradient — the harness **stops and says so**
  rather than guessing a pixel colour; those elements land under "not assessed".

## Output

* `scripts/qa-browser/report.json` — full detail. Keys: `counts`, `routes`,
  `viewports`, `failures` (per check), `warnings`, `notAssessed`, `summary`.
  All arrays are sorted deterministically so two runs diff cleanly (only
  `generatedAt` and `durationSeconds` change).
* A grouped console summary ending in a `PASS` / `FAIL` line.

### Failure classification

| Bucket | Contents | Affects exit code |
| --- | --- | --- |
| `failures` | overflow, clipped/undersized headings, clipped containers, zoom overflow & clipping, focus, landmarks, reduced motion, contrast, page errors and non-asset 404s | yes |
| `warnings` | heading orphans/widows | no |
| `notAssessed` | missing `/assets/images/` and `/assets/fonts/` files (empty in this container); contrast skipped because the background is an image or gradient; truncation notes | no |

## Implementation notes

* One browser process for the whole run; one context and one page per viewport,
  with routes looped inside — plus one extra context each for reduced motion and
  for the two zoom modes.
* All in-page measurement code lives in a single `window.__qa` helper library
  installed with `context.addInitScript`, so each check is one short
  `page.evaluate` round trip.
* Chromium launch tries Playwright's default first, then every executable found
  by searching `$PLAYWRIGHT_BROWSERS_PATH` (preferring a full `chrome-linux/chrome`
  build over the headless shell). In this container it resolves to
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
* Per-route caps (40 overflow, 60 contrast, 40 motion findings) keep a systemic
  issue from producing an unusable report; truncation is recorded in
  `notAssessed.notes`.

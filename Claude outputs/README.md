# Poker Development Dashboard

A private, local-first dashboard for developing as a tournament player. It exists to answer
three questions in about ten seconds before a session:

1. **Am I in the right state to play?**
2. **What stakes and table limit should I use today?**
3. **What single aspect of my game am I deliberately practising?**

Everything else — strengths, probable leaks, hand reviews, progress over time — is arranged
underneath those three so that historical numbers never crowd out the next decision.

This is a decision-quality system, not a results tracker. Money appears once, in grey, at the
bottom of the Progress page.

---

## Privacy

- Runs entirely in your browser. There is **no backend, no account and no network code** in
  this application.
- Data is stored in `localStorage` under the key `poker-development-dashboard/state`.
- No web fonts, no CDNs, no analytics, no telemetry. The only typeface used is the one already
  installed on your machine.
- A Content Security Policy in `index.html` blocks every off-origin request outright, so an
  accidental external reference would fail rather than leak.
- Hand-history files you select for the experimental importer are read in the browser with the
  File API and never leave it.

The one thing to understand: **browser storage is not a backup.** Clearing site data, switching
browser or reinstalling the machine will remove everything. Export a JSON backup regularly.

---

## Install and run

Requirements: [Node.js](https://nodejs.org) 20 or newer, only to serve the files. There are no
dependencies to install — `node_modules` stays empty.

```bash
cd poker-development-dashboard
npm run dev
```

Then open <http://127.0.0.1:4321/>. The server binds to localhost only.

To use a different port: `npm run dev -- 5050`, or `node tools/serve.mjs 5050`.

### Other ways to serve it

The app is plain ES modules, which browsers refuse to load over `file://`, so it needs a
static server. Any of these work:

```bash
python3 -m http.server 4321      # then open http://127.0.0.1:4321/
npx --yes serve .                # if you would rather use something familiar
```

Opening `index.html` directly by double-clicking will **not** work — the browser blocks module
loading from the filesystem. This is a browser security rule, not a limitation of the app.

### Running the tests

```bash
npm test
```

99 tests covering readiness scoring, the metric calculations, storage and recovery, schema
migrations, export/import round trips, formatting and the hand-history parser. No test runner
to install: it uses Node's built-in `node --test`.

---

## Using it

### 1. Today

The pre-session screen. Do the check-in, read three facts, start.

The check-in is seven questions: sleep and capacity, emotional regulation, urge to recover
losses, concentration, time available, other demands, and one integrity question — *would you
still play if there were no chance of recovering recent losses today?*

The six scored questions run 0–3, for a maximum of 18. By default:

| Band | Score | What it permits |
|---|---|---|
| **Green** ● | 14–18 | $5.50–$16.50, max two tables, one bullet per tournament, only scheduled tournaments |
| **Amber** ▲ | 8–13 | $5.50–$11 only, one table, no re-entry, smaller fields and slower structures |
| **Red** ■ | 0–7 | Do not play. Review marked hands or study one short topic instead |

Three hard stops sit on top of the score, all editable:

- answering **no** to the recovery question forces Red;
- the worst answer on **urge to recover losses** forces Red;
- **any** single worst answer caps the result at Amber.

Also shown every day: never deposit money to recover poker losses (non-negotiable); $22+
tournaments are paused except for an explicitly recorded exceptional reason; $33 and $55 are
not part of the rebuilding schedule; poker income is not part of personal financial planning.

**Overrides.** You can override the recommendation, but a written reason is required and it is
kept on the check-in and copied into the session record, so you can look back later and see
whether overriding was justified. Nothing is scored against you for it.

### 2. Game

The current player profile: recorded samples with their denominators, the movement between
them, and editable assessment cards for strengths and probable weaknesses. Each card carries a
status (Hypothesis / Confirmed / Improving / Stable), a confidence, the evidence, the relevant
sample size, the date last reviewed and a next action.

The page states plainly where a sample is too small to support a conclusion — 378 hands is a
direction of travel, and 13 big-blind defence opportunities have a plausible range of roughly
17% to 65%.

### 3. Leaks & Drills

One ordered development queue: 10–25bb late-position play, postflop overfolding, calling
reshoves, and big-blind defence. Each drill has what to study, how to practise it, and a log
of reps with a verdict (correct / too tight / too loose / unclear). The reshove drill captures
the structured fields — effective stack, positions, price required, estimated range, equity,
format, ICM, decision.

Reorder with the ↑ ↓ buttons. The tally is a record of work done, not evidence of improvement,
and the page says so while the sample is small.

### 4. Hand Reviews

Searchable review cards. Filter by text, error category, review status, format or tag. Each
card keeps *what you thought at the time* and *what you think now* apart, because losing that
distinction is how results-based thinking creeps back in.

Correct decisions with bad outcomes and outright coolers are recorded alongside the mistakes —
they are the reference points that stop the whole log becoming a list of self-criticism.

Below the reviews sits a short list of possible missed opens awaiting chart verification.
These are labelled hypotheses and are never counted as confirmed errors.

### 5. Progress

Decision quality first: rule compliance, average self-rated decision quality, confirmed
mistakes per 100 reviewed decisions, hands reviewed, sessions by starting readiness band.

Then frequencies (VPIP, PFR, RFI, 3-bet, big-blind defence) as one chart per measure, each with
its sample size in the caption and a "show data" table. Then breakdowns by position and stack
depth, entered by hand until hand-history import fills them in. Then the session log with a
compliance check against the rules for the band each session started in. Results come last, in
grey. The progression timeline sits at the bottom.

### 6. Data & Settings

Backup and restore, editable readiness thresholds and hard stops, editable stake and table
rules per band, standing rules, theme, currency symbol, bankroll (hidden from the homepage
unless you switch it on), metric definitions, and the experimental hand-history importer.

---

## Backing up, moving and restoring

**Export**: Data & Settings → *Export JSON backup*. You get
`poker-development-dashboard-backup-YYYY-MM-DD.json` — the complete state, human-readable.

**Import**: Data & Settings → *Import JSON backup*, then choose:

- **Replace** — everything in this browser is replaced by the file. Requires typing `replace`.
- **Merge** — records are matched by id: matching ids are updated, new ones added, local-only
  records left alone. You choose whose rules win.

Merge is the one to use when moving between two machines that have both been in use.

**Reset to seeded data** restores the starting profile (requires typing `reset`).
**Erase everything** empties the dashboard (requires typing `erase`). Both are irreversible;
export first.

If saved data is ever unreadable, the app does not wipe it: the raw string is kept under
`poker-development-dashboard/state.corrupt.<timestamp>` in local storage and the dashboard
starts from the seed so you can still work while you rescue it.

---

## Updating the app

Replace the project files. Your data is untouched — it lives in browser storage, not in the
project folder.

If the new version has a newer schema, the migration runs automatically on load. A backup from
a **newer** version imported into an **older** copy is refused with a clear message rather than
being silently downgraded.

### Adding a schema version

1. Bump `SCHEMA_VERSION` in `src/core/schema.js`.
2. Add a step to `MIGRATIONS` in `src/core/migrations.js`, keyed by the version it upgrades
   *from*, returning the payload at the next version. Steps must be pure and must not throw on
   missing fields — `normalise()` runs afterwards and repairs the rest.
3. Add a test in `tests/migrations.test.js`. There is already a test asserting that every
   version below the current one has a registered step, so a forgotten migration fails the
   suite rather than corrupting data.

---

## Hand-history import (experimental)

Data & Settings → *Hand-history import*. Select one or more PokerStars tournament `.txt` files.
They are parsed in the browser; nothing is uploaded.

The parser detects: hand ID, tournament ID, date, buy-in (summing the components, and treating
a three-part buy-in as a likely PKO), hero name, hole cards, position (derived from the seat
map and the button), blind level, starting stack in big blinds, preflop actions, board, hero's
actions by street, showdown, and the chip amount won or lost.

Then you can add the parsed hands as **unreviewed drafts** in Hand Reviews, or create a sample
from the aggregate figures.

### What it deliberately does not do

- **It does not claim exact results.** The chip figure is derived from what the file shows hero
  putting in and taking out. Where that cannot be verified the hand is flagged
  `netReliable: false` and the parse log says so. Tournament chips are not money and cannot be
  added across tournaments.
- VPIP and PFR from the importer count every hand dealt to hero, including big-blind walks, so
  they will be close to but not identical with a tracker's figures.
- Tournament Hold'em only. Cash games and other variants are skipped with a stated reason.
- Positions can be mislabelled at tables with a dead button or an unusual seat map.
- **ZIP archives are not supported.** Adding ZIP support would mean either bundling an
  inflate implementation or pulling in a dependency, and neither is worth it while extracting
  the archive first takes two seconds. Multiple `.txt` files at once work today; ZIP is noted
  as a future enhancement.

Every parse error and warning is shown in the parse log rather than swallowed.

---

## Project layout

```
index.html                 App shell, CSP, nothing else
styles/
  tokens.css               Colour, type scale, spacing; dark and soft-neutral themes
  base.css                 Reset, elements, app shell, navigation, focus styles
  components.css           Cards, badges, forms, tables, charts, dialogs
src/
  main.js                  Bootstrap and hash router
  core/
    schema.js              Version, vocabularies, default rules, empty state
    seed.js                The starting profile: samples, assessments, drills, hands
    migrations.js          Version detection, migration chain, normalisation/repair
    storage.js             localStorage adapter with quarantine and quota handling
    store.js               Observable state container; persists on every change
    readiness.js           Check-in scoring, band rules, session compliance
    metrics.js             Series, Wilson intervals, review and session aggregates
    transfer.js            Export, import, validation, merge
    format.js              Dates, money, percentages, card rendering
    id.js                  Ids and local calendar dates
  ui/
    dom.js                 Tiny element helper — no innerHTML anywhere in the app
    components.js          Badges, fields, dialogs, toasts, confirmations
    charts.js              Inline SVG line charts, bar rows, sparklines
  views/                   One module per area; each exports render(ctx) -> Node
  parser/pokerstars.js     Experimental hand-history parser
tools/serve.mjs            Dependency-free localhost static server
tests/                     node --test suites
```

### Design notes

- **No innerHTML.** Everything is built with `createElement` and `textContent`, so entered text
  can never be interpreted as markup.
- **Modules are pure where it matters.** `readiness.js`, `metrics.js`, `migrations.js`,
  `transfer.js`, `format.js` and the parser touch no DOM and no storage, which is why they can
  be tested directly in Node.
- **Colour never carries meaning alone.** Green, amber and red are hard to separate with
  red-green colour blindness, so every band is shown with a shape glyph (● ▲ ■) and its word.
- **One series per chart.** Small multiples instead of multi-line charts, so no legend is
  needed and no two colours have to be told apart.
- **Every percentage shows its denominator**, and proportions from small samples are given a
  Wilson interval rather than a falsely precise figure.

### Accessibility

Semantic landmarks and headings, a skip link, visible focus rings on every control, native
`<dialog>` for correct modal focus handling, radio groups with labels and hints, tables with
scoped headers and captions, `aria-current` on the active nav item, charts with text
alternatives and a data table, and `prefers-reduced-motion` respected. Contrast was checked
against both theme surfaces.

---

## Limitations

- Sample sizes are small. The dashboard is built to keep saying so; do not let a rising line
  over two readings persuade you otherwise.
- Positional and stack-depth breakdowns are entered by hand until the importer is extended to
  compute them.
- Session compliance uses the *average* buy-in, because buy-ins are recorded as a total. Four
  cheap tournaments and one expensive one can average inside the range; the tooltip says so.
- The importer's limits are listed above. It is explicitly experimental.
- There is no cloud sync, by design. Two machines are kept in step with export and merge.

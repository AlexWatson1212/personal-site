# Practice Clarity — presentation standard

Alexander Watson Studio · portfolio edition · canonical as of September 2026

This file is the authority for how a Practice Clarity document is *presented*. It does
not govern what any document says. Format, dressing and furniture are the Studio's and
do not vary; the accent colour, the argument and its length belong to the case.

It was written by reading the six finished documents and their sources rather than by
inventing a system: Sofia Marin (which established the standard), Maya Bennett, Daniel
Mercer, Helen Calder, Harbour and Stillpoint. Where the six disagree, this file records
which reading is canonical and why.

**Not published.** `docs` is in the `exclude` list in `_config.yml`, alongside every
other internal document in this repository.

---

## 1. The design canvas, and the unit question — read this before raising a blocker

**The canonical design canvas is 1440 × 810 CSS pixels, landscape 16:9.**

Conformity is judged on **that canvas and the resulting 16:9 presentation**. It is *not*
judged on the page dimensions a PDF reports in its metadata.

This needs stating plainly because it has already produced one false blocker. CSS pixels
and PDF points are different units: 1 pt = 1⁄72 in, 1 CSS px = 1⁄96 in. A document
authored on a 1440 × 810 px canvas and printed to PDF through Chromium is therefore
recorded as **1080 × 607.5 pt** — the same physical page, described in the other unit.
Chromium additionally quantises page height, so an untrimmed export usually reports
**607.92 pt**, about half a pixel taller than intended. Both are correct. Neither is a
fault.

A document's source may express the canvas in either unit:

- `width: 1440px; height: 810px` → PDF reports ≈ 1080 × 607.5–607.92 pt
- `width: 1440pt; height: 810pt` → PDF reports 1440 × 810 pt

Both give an identical 16:9 page and, displayed at the same size, an identical document.
The px form is canonical for new work, because it is the natural unit of a
browser-rendered document and because Sofia — the document that established this standard
— is built that way.

**Rules.**

1. New documents use the CSS-pixel canvas: `1440px × 810px`.
2. A document already built on the point canvas is **conformant**. Do not rebuild it,
   and do not upscale a document so that its PDF metadata reads 1440 × 810 pt.
3. Trimming the Chromium MediaBox from 607.92 pt to exactly 607.5 pt is optional
   tidiness, not a requirement. Stillpoint does it; Sofia and Harbour do not.
4. The only geometric test that must pass is the ratio: **width ÷ height = 1.7778 ± 0.002**.

### Where the six actually sit

| Case | Pages | Source canvas | PDF page size (pt) | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| Sofia Marin | 14 | 1440 × 810 px | 1080 × 607.92 | 1.7765 | Conformant |
| Maya Bennett | 13 | 1440 × 810 pt | 1440 × 810 | 1.7778 | Conformant |
| Daniel Mercer | 24 | 1440 × 810 pt | 1440 × 810 | 1.7778 | Conformant on canvas — see §9 |
| Helen Calder | 14 | 1440 × 810 pt | 1440 × 810 | 1.7778 | Conformant |
| Harbour | 14 | 1440 × 810 px | 1080 × 607.92 | 1.7765 | Conformant |
| Stillpoint | 13 | 1440 × 810 px | 1080 × 607.50 | 1.7778 | Conformant |

All six are 16:9 within tolerance. No document requires rebuilding on geometry.

---

## 2. Palette

Five Studio colours, constant in every document:

| Token | Value | Use |
| --- | --- | --- |
| `--ground` | `#283A38` | Forest. The dark pages only |
| `--paper` | `#F7F4EF` | The light pages |
| `--ink` | `#1A2119` | Body and display text on paper |
| `--rule` | `#CFCCC4` | Rules and table borders on paper |
| `--rule-dark` | `#43524F` | Rules and table borders on ground |

Supporting neutrals (soft ink on paper, soft paper on ground) are set per document to
carry secondary text at 4.5:1 or better. They are not part of the fixed palette but must
meet that contrast.

**One accent per case**, drawn from that practice's own website palette and used only for
the running-head rule, the evidence/quotation marker, the inference tag, and at most one
other small structural mark. It never carries body text and never signals mood.

| Case | Accent | Source |
| --- | --- | --- |
| Maya Bennett | `#EF7F4B` | her site |
| Helen Calder | `#8E5344` | her site's accent token |
| Harbour | `#F2B441` | the lantern, `--c-lantern` in the concept stylesheet |
| Stillpoint | `#8A4A2E` | the single colour the site spends on actions |

Where the accent is too light or too dark to carry small text at 4.5:1 against its
ground, a **tint or shade of the same hue** is permitted for that text alone — Harbour
uses `#8A5A0B` on paper, Stillpoint `#DCA684` on ground. This is one accent expressed at
two luminances, not a second colour.

---

## 3. Typography

Two families, and never the practice's own typefaces:

- **Newsreader** — display, page headings, pull quotes and verbatim evidence.
  Either the variable/16 pt optical face, or the Display + Text optical pair where a
  document wants a separate face below 24 pt. Both are in use and both are correct.
- **Instrument Sans** — body, labels, tables, running heads and page numbers.

Retired and forbidden: Instrument Serif, Aileron, Lora, Source Sans.

All faces are embedded and subset in the exported PDF. Text must remain selectable —
no page may be rasterised.

---

## 4. Page architecture

- **Landscape, one idea per page.**
- **Length follows the argument.** Fourteen pages is the usual ceiling; thirteen is
  common; a case with more to say may run longer. Padding a document to a page count is
  a fault, and so is compressing an argument to hit one.
- **Three dark pages**, and normally only three:
  1. the **cover**;
  2. a **philosophy or strategic hinge**, placed where the argument turns — page 5 in
     four of the six documents, page 6 in Helen;
  3. the **closing** page.
  The hinge is dark *where earned*. A document whose argument has no single turn may
  carry two dark pages rather than three; it may not scatter them.
- The eleven-part structure established by Sofia is the default spine, adapted to the
  case rather than followed mechanically: cover · about this document · practice at a
  glance · professional identity · philosophy of change · the people who come ·
  messaging and voice · intended client experience · strategic translation · snapshot ·
  closing.
  Sections may be renamed, split or added where the case demands it — Harbour has
  *organisational identity* rather than professional identity, four readerships over two
  pages, and a two-page translation table.

### Not to be copied for their own sake

Sofia's two-plane device, her four-item first-screen ledger and her "what I won't claim"
refusal section belong to Sofia. Reusing them makes a document look like a template
instead of an argument.

---

## 5. Furniture

Identical position on every page:

- **Running head**, top left: `NN · Section title`, Instrument Sans, ~10–10.5 px,
  ~0.16–0.17 em tracking, uppercase, in soft ink or soft paper.
- **Accent rule** immediately beneath it: **66 px wide**, 2–3 px tall, in the case accent.
- **Page number**, bottom right: two digits, Instrument Sans, ~11 px, tabular lining
  figures.
- **Studio attribution** on the cover and again in the closing reference block.

The cover carries the Studio line, the practice name, a standfirst, and a meta row
stating at minimum the practice, the central proposition, the method, and the fictional
status.

---

## 6. Evidence and inference

Every portfolio document is reverse-engineered: the website existed first and the
strategy was reconstructed from it. That is not a weakness, but it must be disclosed and
the two kinds of claim must be visually distinguishable throughout.

- **Evidence** — verbatim from the finished site, set in Newsreader, marked with the
  accent, and **attributed to the page it appears on**. Quotations must be checkable
  against the live concept, word for word.
- **Inference** — anything the site does not state, carrying an explicit `Inference`
  tag. Offered as strategic reading the reader is free to reject.
- **Description** — what the site demonstrably does, checkable by opening it.

The document must say, in its own words, that it was written after the website.

**Strategic translation.** At least one page setting each strategic insight against the
website decision it produced, in two columns. Every row must be pointable-at on the
finished site. Where a row and the site disagree, one of them changes and the document
records which.

---

## 7. Fictional disclosure and credential safety

**Portfolio-wide rule, adopted September 2026:**

> A fictional practitioner or practice must not claim membership, registration or
> accreditation with a named real professional body — BACP, MBACP, UKCP, HCPC, AFT or
> any equivalent.

A real body may still be named in general explanatory or reference copy. A fictional
person may not be presented as belonging to one. No registration or membership number,
no named awarding institution, no named supervisor and no named insurer appears anywhere
— in a document or on a concept site.

Where a concept needs to demonstrate where professional standing sits on a page, use
neutral wording that makes the fiction plain: *"In a real practice this is where
registration with the appropriate professional body would appear."*

Fictional status is stated **at least twice in full** in every document: once near the
front, once in the closing reference block. The cover status field is additional to
those two.

The same rule governs invented contact details on a concept site: no plausible real
street address, postcode or domain. Reserved domains (`.example`) and the Ofcom drama
telephone ranges exist for this purpose. Real emergency and helpline numbers are the one
exception — they must be real and correct.

---

## 8. Conformity checklist

A document is conformant when all of the following hold. Maya's `build.py` already
enforces most of them and is the reference implementation.

- [ ] Page ratio 1.7778 ± 0.002, on a 1440 × 810 canvas in either unit
- [ ] Page count follows the argument; no padding
- [ ] Palette: the five Studio colours, plus one case accent (and its tints only)
- [ ] Newsreader + Instrument Sans only; no retired typeface named or embedded
- [ ] All fonts embedded and subset; text selectable; no rasterised page
- [ ] Cover, hinge and closing dark; no other dark pages
- [ ] Running head, 66 px accent rule and two-digit folio on every page but the cover
- [ ] Studio attribution on the cover and in the closing block
- [ ] Evidence and inference both labelled, and visually distinct
- [ ] Every verbatim quotation checkable against the live concept
- [ ] Every translation row pointable-at on the finished site
- [ ] Fictional status stated at least twice in full
- [ ] No real professional body claimed for a fictional person
- [ ] No registration number, awarding institution, supervisor or insurer named
- [ ] No page overflow; nothing colliding with the page-number line

---

## 9. Known deviations, recorded rather than fixed

- **Daniel Mercer** — 24 pages, **no dark pages at all**, and paper `#F4F2ED` rather than
  `#F7F4EF`. This is a genuine divergence from the system on three counts. It is recorded
  here rather than corrected, because Daniel is already integrated and re-rendering it is
  a consolidation decision, not a portfolio-queue one. It is the one document that does
  not visibly belong to the same product as the other five.
- **Optical-size faces** — Sofia, Daniel and Stillpoint use one Newsreader optical face;
  Maya and Helen use the Display + Text pair. Both are permitted; recorded so the
  difference is not mistaken for an error.
- **Hinge position** — page 5 in Sofia, Maya, Harbour and Stillpoint; page 6 in Helen.
  Placement follows the argument, so this is not a deviation.

---

## 10. Change history

- **September 2026** — first written down. Derived from the six finished documents and
  their sources. Resolved the 1440 × 810 px/pt ambiguity in favour of the CSS-pixel
  canvas, with PDF point metadata explicitly excluded as a conformity test. Adopted the
  portfolio-wide fictional-credential rule in §7.

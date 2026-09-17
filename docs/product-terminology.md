# Product terminology — the words the site uses, and the only ones it uses

Alexander Watson Studio · internal · written 13 September 2026 · **revised 17 September 2026 for the Practice Fundamentals Intake System**

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

One name per thing. Where a page needs to say it differently, the page is wrong,
not the name. The current commercial facts are in `DECISION-REGISTER.md`; the
approved source for the process is
`docs/operations/practice-fundamentals-intake-system.md`. This file only fixes
the words.

---

## 1. The product

**Practice Identity & Website.** Written with an ampersand (`&amp;` in HTML body
copy, a bare `&` in front matter and JSON-LD). It replaced **Therapist Website**,
which stays retired and is guarded in `scripts/qa.mjs`.

In running copy the thing a client buys is *a one-page website built from your
Practice Fundamentals*. The product name is used where a name is needed (the
price, the scope page, the terms).

The route is unchanged: `/services/practice-website/`.

## 2. The six steps (public)

One piece of work, sold once. The client is never asked which parts they need.
These exact step names appear on `/` and `/service/`, and `npm test` checks them.

| # | Name | What happens |
| --- | --- | --- |
| 1 | **Enquire** | The enquiry form, with the five-question fit check. Alexander replies personally. |
| 2 | **Reserve the project** | Scope and price confirmed in writing; the £100 deposit reserves the place. |
| 3 | **Complete the intake** | The Tally intake form, with the photography brief alongside. |
| 4 | **Approve the direction** *(your decision)* | The Practice Fundamentals, with a preview of the opening screen. Feedback stage 1. The balance follows approval. |
| 5 | **Website build** | One complete page, built once the balance is paid. |
| 6 | **Review and launch** *(your decision)* | Feedback stage 2, corrections, domain, launch approval, launch. |

The `/service/` trace uses four headings for the same work: *Your intake*,
*Practice Fundamentals*, *Approve the direction*, *Build, review and launch*.

**Retired on 17 September 2026:** the four stages *Practice Clarity → Agree the
direction → Visual direction and website → Refine and launch*, and before them
*Practice Clarity → Practice Identity → the website → Yours to keep*. "Yours to
keep" survives only as the name of the handover section (`#yours-to-keep` on
`/service/`, `#keep` on the scope page).

## 3. The words for the process

- **Intake**, or **intake form**: never "questionnaire" for the current form.
- **Fit check**: internal name for the five enquiry questions. The site calls
  them "five short questions".
- **Feedback stage**: never "revision", "round" or "revision round". There are
  **two consolidated feedback stages**.
- **Correction**: a factual error, a misunderstanding, or a departure from the
  approved direction. It never uses up a stage.
- **Direction approval**: the client's written "go ahead" on the Practice
  Fundamentals and visual direction (or confirmation of the adjusted direction).
  It triggers the balance.
- **Launch approval**: the written confirmation before launch (clause 11).
- **Deposit** (£100, reserves the place) and **balance** (£395, after direction
  approval, before the build). Not "first instalment" in client-facing copy.
- **Website Care**: technical. Never "updates included".

## 4. The documents a client receives

- **Practice Fundamentals** (singular verb: "your Practice Fundamentals is
  attached"). The eleven-page document, with a facts table and a working
  preview of the opening screen. Issued as a draft for direction approval, and
  reissued at launch with facts confirmed.
- **Photography brief**: "Photographs for your website", one page.

**Practice Clarity** now names only the free material (the nine principles at
`/practice-clarity/`) and the three **Practice Clarity Blueprints** published
with the case studies. It never names something a client receives.

**Retired:** *Practice Clarity document* (as a deliverable), *Direction Note*,
*identity guide* and *Practice Identity Guide* as named deliverables, and the
*Website Content Questionnaire*.

## 5. Words the site may not use

Enforced by `npm test`.

- **Tier language:** *package*, *bundle*, *upgrade*, "two routes / options /
  tiers", "unlimited revisions" or "unlimited changes".
- **The old name:** "Therapist Website".
- **The retired model:** "up to five pages", "five core pages", "revision
  round(s)", "consolidated revision", "two rounds of changes", "Website Content
  Questionnaire", "Practice Clarity document", the balance tied to "the finished
  website", "factual updates are included", "no quota".
- **Open-ended promises:** "unlimited templates/design/applications", "ongoing
  design support", "everything you need", "all your marketing materials", "any
  printed item".
- **The retired identity package:** letterhead, email signature, business card,
  supplier briefs.
- **The retired approval note:** "Direction Note".
- **Portfolio counting:** anything that counts the collection as six.
- **Satisfaction conditions:** "pay nothing until…", "risk-free", "money back"
  and the like.

## 6. What keeps the offer bounded

**Made:** the Practice Fundamentals; a logo or wordmark (or the client's
existing logo applied); colour values and typefaces as files (fonts where
licences permit); one complete responsive page with its enquiry form and
reading control.

**Not made (quoted if wanted):** additional pages, booking systems, blogs,
advanced integrations, unusual functionality, several competing concepts,
trademark work, print design, stationery, social media templates, ongoing
marketing, a new direction after approval.

## 7. Ownership

The practice identity — the logo or wordmark, the Practice Fundamentals, the
colour and typography specifications — is **owned outright** by the client on
full payment and may be given to another designer, printer or developer. The
**website design system, layout and code** remain the studio's and are licensed:
non-exclusive, perpetual, non-transferable, one website, one practice. Clause 13
of `/service-terms/practice-website/`, flagged ⚖ for a solicitor. The client's
domain is always in the client's own account.

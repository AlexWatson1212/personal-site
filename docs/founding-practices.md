# The founding practices — the offer, and the path a real client takes

Alexander Watson Studio · internal · written 10 September 2026 · **revised 17 September 2026 for the Practice Fundamentals Intake System** (approved source: `docs/operations/practice-fundamentals-intake-system.md`)

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

This file exists because of one question: *if a therapist emailed today saying
"yes, I'd like one of the first three places", would Alexander know exactly what
to do next?* Everything below is written so the answer is yes without having to
work anything out on the day.

It supersedes nothing. `docs/pre-launch.md` is still what must be true before
money is accepted; `docs/handover-runbook.md` is still what a handover contains;
`docs/first-payment-checklist.md` is still the payment-mechanics answer. This is
the offer and the sequence.

---

## 1. The offer, in one paragraph

The first three practices pay **£495**. After those three, the price is **£995**.
It is the same service at both prices: the intake, the full **11-page Practice
Fundamentals** (identity included), the copy, **one complete responsive page**
with its enquiry route, **two consolidated feedback stages**, domain connection,
launch, handover, thirty days of corrections and the first twelve months of
**technical** Website Care. Nothing is removed at £495 and nothing extra is added
to it. The reason for the difference is that these are the first three times the
complete process runs with a real therapist, and what the Studio gets back — the
experience, the honest account of what was unclear, and case studies and
testimonials where the client is willing — is worth the difference.

**The £495 is taken as £100 to reserve the place and £395 once the client
approves the Practice Fundamentals, before the build.** The build begins only
when the balance has been paid. The two payments sit exactly where the client's
commitment changes: before the intake, and after the direction is approved.

**The £995 schedule** keeps the same shape: **£500 to begin, £495 after approving
the Practice Fundamentals, before the build.** (Recorded here and in
`OPEN_DECISIONS.md`; not published while the founding offer is open.)

**Accepted risk.** The deposit does not cover the Fundamentals work if a client
walks away after receiving it. The fit check is what keeps that rare.

**It is not a guarantee, and must never be sold as one.** Not "pay nothing until
you're happy", not "no risk", not "risk-free", not money-back, not "only pay if
you like it". The balance milestone is a written decision with a defined
meaning — direction approval, clause 11 — and launch approval is bounded by the
same clause (ten working days to name anything outstanding **within the agreed
scope**).

**It is not** a tier, a trial, a beta, a stripped-down version, or a discount off
an inflated figure. £995 is what the work is set at and is never struck through.

**Where it is stated publicly:** the home page hero and the "What it costs" band,
`/service/#founding` (the full explanation), `/services/practice-website/`, the
enquiry page, the buy component wherever it appears, the 404 page, and clause 3
of the service terms.

**Where the figures live:** `_data/purchasing.yml`, and nowhere else. No page
writes its own price.

---

## 2. Closing the offer

When the third founding practice has paid its deposit:

1. `_data/purchasing.yml` → `founding.active: false`
2. `price_display: "£995"`, `price_numeric: "995.00"`
3. `deposit_display: "£500"`, `balance_display: "£495"`, with the numerics, and
   rewrite `payment_sentence` ("£500 to begin. £495 once you approve your
   Practice Fundamentals, before the website is built.") and
   `payment_sentence_third_person` to match. Add `£500` to `APPROVED_PRICES` in
   `scripts/qa.mjs` in the same commit. **The £100 deposit does not survive the
   founding arrangement.**
4. Delete the founding sections from `index.html` and `service.html` — both are
   wrapped in `{% if site.data.purchasing.founding.active %}` for exactly this
5. Update Templates 1, 2 and 9 in `docs/operations/client-email-templates.md`
   and the two invoice templates
6. `npm test` — the suite asserts the two states are internally consistent and
   names anything left behind

A practice already booked at £495 stays at £495, on the £100/£395 schedule. The
price and terms stated in the written scope confirmation are the ones that govern
that project; clause 3 says so.

**There is no counter and no deadline, and neither should be added.** A
remaining-places number has to be maintained by hand to stay honest, and the
whole proposition of this studio is that it does not use sales devices. When the
places are gone, the price on the page changes.

---

## 3. The path, from enquiry to the first year of care

The public version is the six steps on `/` and `/service/`, and the longer
sequence on `/services/practice-website/#process`; they must not drift apart.
The client emails for every step are in `docs/operations/client-email-templates.md`.

| # | Step | Who decides | What Alexander does | Template / artefact |
| --- | --- | --- | --- | --- |
| 1 | Enquiry arrives, with the five fit-check answers | — | Read it personally. Reply within two working days. Never reject on an answer alone. | The email |
| 2 | Accept, confirm scope and price, invoice the deposit | Alexander | Assign the project reference (`AW-001`…). Confirm scope, price (£495, founding), payment schedule and terms **in writing**, citing the terms version. Attach the £100 invoice. | Template 1 · deposit invoice |
| 3 | Client accepts and pays £100 | Client | Nothing is booked until it arrives. | Paid invoice |
| 4 | Welcome and intake link | — | Same day: receipt, intake link `/client/intake/?ref=AW-00X`, printable questions, photography brief, suggested finish in 10 days. Set a calendar reminder for day 7. | Template 2 |
| 5 | Intake | Client | Day 7, if nothing has arrived: send Template 3. Netlify keeps no partial submissions, so there is nothing to check first. | Template 3 |
| 6 | Check the intake | Alexander | Within two working days. Enough to start = every required fact plus at least four of the seven core answers. Otherwise one message of up to five questions (Template 4), a thin-intake follow-up (Template 5) or a 20-minute call. Confirm in writing when work starts — **the point the project officially begins**. Download responses and files to the project folder. | Templates 4/5 |
| 7 | Practice Fundamentals | Alexander | About seven working days: strategy and words, visual system, the opening-screen preview built in code, the 11-page document from the template, the facts table, the approval page on top. | Template 6 · draft Fundamentals |
| 8 | Direction approval (feedback stage 1) | Client | Five working days. "A" → Template 8 with the £395 invoice. "B" → make one consolidated set of adjustments, send Template 7, wait for confirmation, then Template 8. Corrections don't use the stage. No reply → dormancy rules (clause 8); the balance is never invoiced without approval. | Templates 7/8 · balance invoice |
| 9 | Balance paid → build | — | Build from the approved preview (about four working days). | Template 9 |
| 10 | Website feedback (feedback stage 2) | Client | Private preview (noindex). One consolidated list; refinements, not a restart. Then send the changes back and ask for **launch approval** (ten working days, clause 11). | Template 10 · variant 10a |
| 11 | Launch, handover, care | — | Connect the domain, launch, reissue the Practice Fundamentals with facts confirmed, send the files, delete the Practice Discovery submission from Netlify, start the thirty days and the twelve months of technical Care. | Template 11 · `docs/handover-runbook.md` |

**Record on every founding project** (per the source): actual hours per step,
where the waiting happened, how many clarification questions were needed, what
each feedback stage asked for, and which intake questions produced material
you used.

### The founding-specific additions to that path

Three things happen in a founding project that will not happen at £995. None of
them is a deliverable and none is a condition of the price.

- **Step 2** says out loud that this is one of the first three, and offers the
  client the chance to say if that bothers them either way.
- **Between steps 9 and 11**, ask the three feedback questions that only work
  during the project: what was confusing, what took longer than expected, what
  they expected to be asked and were not. Write the answers down the same day.
- **After step 11**, ask for the testimonial and permission to publish the case.
  If the answer is no, the price does not change and it is not raised again.

---

## 4. What is genuinely manual, and stays manual

Not gaps. Decisions already taken, recorded here so they are not "fixed" later by
someone who mistakes them for oversights.

| Manual step | Why it stays manual |
| --- | --- |
| The enquiry arrives as an email the visitor's own client sends | Nothing is transmitted to or stored by the website. `OPEN_DECISIONS.md` item 9. |
| The intake is a form on this site, and every message around it is sent by hand | Settled 17 September 2026, revised 19 September 2026: no Zapier, CRM or client portal during the founding projects. The intake was briefly a Tally form; it is now Practice Discovery, a native Netlify form. Netlify holds the written answers as processor; Alexander downloads them and deletes them at launch. No files pass through the form at all — clients share a folder link or email them. |
| Scope and price are confirmed in a written exchange | There is no online checkout, and clause 4 makes the written exchange the point of acceptance. |
| Both instalments are invoiced and paid by bank transfer | Settled September 2026. Bank details live on the invoice and must never appear on the website. |
| Website Care after year one is invoiced, not subscribed | No recurring billing is built. `subscriptions_enabled: false`. |
| Closing the founding offer is a config edit | Deliberately not automated: no counter to go stale. |

---

## 5. What must still be true before founding client #1 pays

These are not new. They are `docs/pre-launch.md`, restated so this file can be
read alone. The founding price does not change any of them — a reduced price is
not a reduced obligation.

1. **A business/service address**, written into `_data/legal.yml` → `identity.address`,
   so no `[business address]` bracket survives on `/terms/`,
   `/service-terms/practice-website/` or `/privacy/`.
2. **An account that may lawfully receive business payments**, and a completed
   invoice template — legal name, trading name, address, VAT position, the AW
   numbering series, the 14-day term on the balance.
3. **The ICO data-protection-fee self-assessment completed**, and the number (or a
   confirmed "not required") recorded in `_data/legal.yml`.
4. ~~**The top-of-terms notice decided**~~ — **done, 10 September 2026.** The
   internal development label at the top of the legal pages was replaced with a
   client-facing status note: version and date, that the terms take effect on
   written acceptance rather than on being read, and that they were written by
   the Studio and not reviewed by a solicitor. `legal.approved` stays `false`,
   because that flag means a solicitor reviewed the wording and none has, and
   nothing on the pages claims otherwise. The remaining half of the decision is
   now an operational one and sits in step 2 of the table above: **the acceptance
   email must cite the terms version.**
5. **Practice Discovery confirmed live on Netlify** — deploy, then check Netlify
   → Forms has detected `practice-discovery`, per
   `docs/operations/practice-discovery-netlify-setup.md`. Until then `/client/practice-discovery/` is a
   "not connected yet" notice. (The old questionnaire was retired on 17 September 2026.)
6. **The privacy notice's remaining brackets filled** with what is actually
   operated today, including the two form-service facts (`intake_provider`,
   `intake_retention`).
7. **The new payment, feedback, cancellation and Care wording reviewed** —
   clauses 3, 7, 11 and 12 and the cancellation stages are flagged ⚖.

Items 5, 6 and 7 are the ones a founding client would actually notice.

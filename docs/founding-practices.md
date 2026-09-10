# The founding practices — the offer, and the path a real client takes

Alexander Watson Studio · internal · written 10 September 2026

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
It is the same service at both prices — Practice Clarity, the Direction Note, the
identity, the design and build, two consolidated revision rounds, launch,
handover, thirty days of corrections and the first twelve months of Website Care.
Nothing is removed at £495 and nothing extra is added to it. The reason for the
difference is that these are the first three times the complete process runs with
a real therapist, and what the Studio gets back — the experience, the honest
account of what was unclear, and case studies and testimonials where the client
is willing — is worth the difference.

**The £495 is taken as £100 to begin and £395 on approval for launch** — not half
and half. £495 is already a real risk for a therapist buying from a studio with
no client case studies yet, so most of the fee falls due at the point where there
is a finished website to look at. The deposit is not income; it is the smallest
sum that establishes commitment on both sides so the work can begin. This
weighting belongs to the founding arrangement and ends with it.

**It is not a guarantee, and must never be sold as one.** Not "pay nothing until
you're happy", not "no risk", not "risk-free", not money-back, not "only pay if
you like it". Each of those makes the balance conditional on a subjective state,
and a finished project could then sit unpaid because somebody declined to use a
particular word. The milestone is objective: the balance is due once the agreed
process is complete, including both revision rounds, and the website is approved
for launch. Clause 11 of the service terms defines approval, gives ten working
days to identify anything outstanding **within the agreed scope**, and treats the
website as approved if nothing in scope is raised in that time.

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

When the third founding practice has paid its first instalment:

1. `_data/purchasing.yml` → `founding.active: false`
2. `price_display: "£995"`, `price_numeric: "995.00"`
3. `deposit_display` / `balance_display` back to the standard halves (£500 and
   £495), with the numerics, and rewrite `payment_sentence` and
   `payment_sentence_third_person` to match. **The £100 deposit does not survive
   the founding arrangement** — a later client is not carrying the uncertainty it
   answers.
4. Delete the founding sections from `index.html` and `service.html` — both are
   wrapped in `{% if site.data.purchasing.founding.active %}` for exactly this
5. `npm test` — the suite asserts the two states are internally consistent and
   names anything left behind

A practice already booked at £495 stays at £495, on the £100/£395 schedule. The
price and terms stated in the written scope confirmation are the ones that govern
that project; clause 3 says so.

**There is no counter and no deadline, and neither should be added.** A
remaining-places number has to be maintained by hand to stay honest, and the
whole proposition of this studio is that it does not use sales devices. When the
places are gone, the price on the page changes.

---

## 3. The path, from "yes" to the first year of care

Eleven steps. The public version is on `/services/practice-website/#process`, and
the two must not drift apart. What follows is the same sequence with the Studio's
side of each step written down.

| # | Step | Who decides | What Alexander does | Artefact |
| --- | --- | --- | --- | --- |
| 1 | Enquiry arrives | — | Read it. Reply within two working days. | The email |
| 2 | Fit and confirmation | Alexander | Say plainly whether this is the right service. Confirm scope, price (£495, founding), timescale and terms **in writing**, and **cite the terms version** — the status note now tells the client that the version cited in their acceptance is the one that governs their project, so the acceptance email must name it (today: version 0.1). Say explicitly that this is one of the three founding places. | Acceptance email (Documents → Operations) |
| 3 | Client accepts | Client | Nothing until the acceptance is in writing. Acceptance is the written exchange, not a payment page — clause 4. | Client's written acceptance |
| 4 | First instalment | — | Invoice £100. Bank transfer. Record the payment against the project. | Invoice AW-000n |
| 5 | Intake | Client | Send the Website Content Questionnaire link. It is not a form that submits — the client assembles their answers in the browser and emails them. **This is a manual step by design.** | Completed questionnaire, by email |
| 6 | Check the intake | Alexander | Read it properly and say what is missing. Nothing starts until it is complete. | Written list of gaps |
| 7 | Confirm the start date | Alexander | In writing. **This is the point the project officially begins** — not the payment. Three to five weeks from here. | Start-date email |
| 8 | Practice Clarity → Direction Note | Alexander, then client approves | The thinking, then the note: what was understood, who the site speaks to, palette, typefaces, structure, the decisions made and what is deliberately not being done. One consolidated revision included. | Direction Note (`DIRECTION-NOTE-TEMPLATE.md`) |
| 9 | Build, then two rounds | Client, twice | Tailor and build to the approved note. Each round is one complete prioritised list from the client, not messages arriving singly. A correction to something that does not match an approved direction is **not** a revision round. | The staged website |
| 10 | Final approval and balance | Client | Ask for approval **once both revision rounds are done**. Written approval confirms they have checked factual and professional details. If they are not ready, they have ten working days to say in writing what is outstanding within the agreed scope; in-scope items are put right at no charge and do not use a round, then ask again. Then invoice £395. Nothing goes live before approval; launch follows payment. | Approval email, invoice |
| 11 | Launch, handover, care | — | Launch. Send the handover pack (`docs/handover-runbook.md`). Thirty days of corrections. Twelve months of Website Care, then write and ask before the year is up. | Handover pack |

### The founding-specific additions to that path

Three things happen in a founding project that will not happen at £995. None of
them is a deliverable and none is a condition of the price.

- **Step 2** says out loud that this is one of the first three, and offers the
  client the chance to say if that bothers them either way.
- **Between steps 9 and 10**, ask the three feedback questions that only work
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
| The questionnaire is completed and emailed, not submitted | Same reason. The page assembles the answers in the browser. |
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
5. **The questionnaire approved** — `_data/intake.yml` → `questionnaire_approved: true`.
   Until then a real client's first post-payment page carries a draft notice,
   which is the single most confidence-damaging thing left in the journey.
6. **The privacy notice's remaining brackets filled** with what is actually
   operated today.

Items 5 and 6 are the two that a founding client would actually notice.

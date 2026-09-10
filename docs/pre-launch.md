# Pre-launch — the shortest responsible route to client one

Alexander Watson Studio · internal · written 9 September 2026

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

This file exists because Business readiness answers a good but different
question — *what would a well-run version of this business have?* — and thirty-
nine sensible answers to that question had quietly become thirty-nine
conditions of being allowed to trade. They are not. This is the other list.

**The question:** what genuinely needs to be true before the Studio can accept
the first instalment from a real therapist?

**September 2026 note.** The figures below were written when the price was £995
in two instalments of £500 and £495. Since 10 September the first three practices
are £495, taken as **£100 to begin and £395 on approval for launch** — see
`docs/founding-practices.md`. Nothing in this list changes: a smaller deposit is
not a smaller obligation, and every item here is about being allowed to accept
money at all rather than about how much. If anything, the first sum arriving is
now £100 rather than £500, which makes item 3 easier and none of the others.

**The admission test, applied to every line below:** would taking the £500
without it be legally, financially, operationally or ethically irresponsible?
If the honest answer is no, it is not here. Best practice on its own is not a
reason. It supersedes nothing in Business readiness — everything else is still
there, marked *after launch*.

The interactive version, with the ticks, is the **Pre-launch** page in the
studio dashboard. This file is the reasoning behind it.

---

## What was already done before this list existed

- **The public site is published and correct.** Local `main` and `origin/main`
  are both at `4e12240`, pushed 8 September 2026; Netlify's deploy gate ran the
  site's own test suite and published. Verified against the live site on
  9 September: `/service/`, `/services/practice-website/`, `/privacy/` and
  `/service-terms/practice-website/` all describe invoice and bank transfer,
  three to five weeks and two consolidated rounds. No page mentions Stripe, a
  card or a payment link. The sitemap carries no retired route.
- **The client agreement is written.** Twenty-two clauses at
  `_pages/service-terms-practice-website.html`, plain English, and every point
  the offer needs is already covered: the parties, the scope, £995 in two
  instalments, what Practice Clarity means inside the service, what the client
  supplies, three to five weeks, two rounds, corrections, approval,
  cancellation, ownership and handover, the first Care year, £29 a month after
  it, third parties, liability, data, and ending the project.
- **The cancellation and refund position is fair and already published.** It
  does not declare the £500 non-refundable in every circumstance; it sets out a
  stage-by-stage position, distinguishes consumer from business purchases
  without assuming either, and says refunds are made by bank transfer.
- **The questionnaire does not ask the therapist to arrive with the work
  done.** No positioning, no finished copy, no typography, no palette, no logo.
  Colour is optional; the logo question offers "please make me a wordmark";
  copy "does not need to be finished"; question 4 asks which work they keep
  returning to rather than which design they have chosen.
- **The operational message set exists** — twelve documents in Documents →
  Operations, including the acceptance email, the invoice template and the
  handover record.

None of the above is on the list below, except where a decision inside it is
genuinely unsettled.

---

## The eight

Ordered by dependency, not importance. The address comes first because four
other things wait on it.

### 1. Public version published
*A therapist reading the site has to be reading the offer you would actually
honour.*

- [ ] Confirm the live site is the invoice-and-bank-transfer version — already
      checked 9 September and correct. A tick, not a job.

### 2. Business/address requirement resolved
*The agreement names no address, the invoice cannot be issued without one, and
three live pages show a bracket where a client is told where notices go.*

- [ ] Buy one business/service address usable for service of notices. Check
      that before buying rather than after. Your residential address stays
      private — that decision is already recorded.
- [ ] Write it into `_data/legal.yml` → `identity.address` and publish. One
      value, four places. Confirm no `[business address]` remains on `/terms/`,
      `/service-terms/practice-website/` or `/privacy/`.

### 3. Invoice + bank payment ready
*You are about to ask a stranger to transfer £500. The document that asks has
to be complete, the account has to be one that may lawfully receive it, and the
receipt has to be recordable.*

- [ ] Confirm the account receiving the £500 may be used for business receipts.
      A sole trader is not required to hold a business account; an existing
      account whose own terms permit business use is enough for client one.
      Mettle is not required here.
- [ ] Fill in the invoice template (Documents → Operations → 07): legal name,
      trading name, the new address, the VAT position, the AW-0001 series, the
      14-day term on the balance, the bank line.
- [ ] Issue one invoice to yourself and read it as a client would. Every field
      filled. Then check no bank detail has leaked onto the public site.
- [ ] Decide where a received payment is recorded. A dated line on the project
      in the dashboard is sufficient. FreeAgent is an after-launch improvement.

### 4. ICO assessment completed
*You will hold a named therapist's contact details, professional facts and
photographs. Whether the fee is payable is a statutory question with a short
official answer, and leaving it unasked while taking money is the part that is
not defensible.*

- [ ] Complete the ICO's own data-protection-fee self-assessment.
- [ ] If it says registration is required, register and pay the tier 1 fee —
      £52 at the time of writing, £5 less by direct debit; confirm the current
      figure on the day.
- [ ] Record the number, or the confirmed "not required", in `_data/legal.yml`.
      A confirmed "none" is an answer. An empty field is not.

This is a registration, not a GDPR programme.

### 5. Client agreement ready
*A client paying £500 has to be able to read what they are buying and what
happens if it goes wrong. The agreement itself is written and fair; what is
unsettled is what it says about its own status.*

- [x] **Done, 10 September 2026 — the first half.** What a client sees at the
      top of the terms is now a plain status note: version and date, that the
      terms take effect on written acceptance rather than on being read, and
      that they were written by the Studio and not reviewed by a solicitor.
      `_includes/legal-draft-notice.html` and `_includes/legal-version.html`
      carry it, and `legal.approved` stays `false` as intended.
- [ ] **The second half is operational and still open:** the acceptance email
      must cite the terms version, because the notice now tells the client that
      the version cited in their acceptance is the one that governs their
      project. Add the version line to the acceptance email template
      (Documents → Operations) before it is sent to anybody.
- [x] **Done, 10 September 2026.** A correction is not a revision round, stated
      once in clause 7 of the service terms in the wording suggested here, and
      once in the Revisions section of `/services/practice-website/` in the
      site's own voice. Read both and confirm they say what you meant.
- [ ] Decide professional indemnity insurance — buy it, or record why not.
      Clause 16 states plainly that no cap on liability is claimed, which is
      the honest position and also an uninsured one. Either answer is
      defensible; not having answered before money arrives is not.
- [ ] Read the agreement once, start to finish, as the person sending it.

### 6. Questionnaire approved
*It is the first thing a client sees after paying, and it currently carries a
draft notice.*

- [ ] Read the twenty questions once and decide they are yours.
- [ ] Decide question 6. Its three answers are *attached*, *in a folder* or
      *still in draft*. There is no answer for a therapist who has written
      nothing at all — a common state, and the one most likely to make somebody
      abandon the form. Add an option, or decide deliberately that copy is
      always the client's to supply.
- [ ] Set `questionnaire_approved: true` in `_data/intake.yml`.

### 7. Privacy notice truthful
*The notice is already published and makes statements of fact about a real
person's data. Ten of them are currently empty brackets. It has to describe
what the Studio actually does today, not what it intends to move to.*

- [ ] Name the suppliers actually in use today and how data reaches them — as
      things stand, Namecheap Private Email forwarding into a personal Gmail
      account, whatever bank receives the £500, and any bookkeeping
      arrangement in place.
- [ ] Write the three retention periods, as actually operated. Enquiries are
      already decided at 12 months; project files and the statutory period are
      not. A period you write down is one you have to keep.
- [ ] Write only the security measures you actually run.
- [ ] Fill the remaining fields in `_data/legal.yml` and confirm no bracket
      survives on any of the four legal pages.

### 8. First-client rehearsal passed
*Everything above is a document or a decision. This is the one item that tests
whether you know what to do on the day, in what order, with which file.*

- [ ] Run one fictional client end to end: enquiry → acceptance with scope and
      price → £500 invoice → payment recorded → questionnaire → Practice
      Clarity → Direction Note and approval → build → two rounds → final
      approval → £495 invoice → launch → handover → first-year Care. Produce
      the real artefacts, from the real templates.
- [ ] Fix only the gaps where you would not have known what to do. If the
      rehearsal makes you want to rebuild something, write it down and put it
      after launch.

---

## Three dependencies that were removed, and why

Business readiness had three chains that made the first client wait on things
it does not depend on. All three are corrected in `data/readiness.json`:

1. **A truthful privacy notice waited on a studio Google account, FreeAgent and
   Mettle.** A privacy notice describes the arrangement that exists on the day
   it is published. If a supplier changes later, the notice changes with it.
   `transfer-mechanisms` no longer depends on any of them.
2. **The rehearsal waited on solicitor approval of the wording.** Reviewed
   terms are a better position, not a precondition of a fair, plain-English
   agreement being in force. `rehearsal` no longer depends on `legal-approval`.
3. **`legal-approval` was recorded as "the sharpest single blocker on a first
   client".** That reflected an earlier decision not to contract on terms
   marked "Draft". It is superseded: what has to be settled first is narrower —
   what a client sees at the top of the terms, and how the acceptance email
   cites a version.

## What is explicitly after launch

Fifteen items, each with its reason, in Business readiness: Better Stack and
uptime monitoring, a Studio GitHub organisation, Mettle, FreeAgent, Making Tax
Digital, a separate studio Google account, moving the mailbox, the Article 28
question, the continuity person, the restoration procedure, the solicitor
instruction and wording approval, the clause 13 licence drafting, the broader
ICO question list, and the price review.

None of them is permission to trade. Also not on this list, and deliberately
so: more portfolio work, more Guidance, another technical audit, redesigning
the Studio, and retrofitting the six locked concepts.

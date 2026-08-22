# Legal review checklist — online purchasing

**Nothing in this repository has been reviewed by a solicitor.** The wording was
drafted to describe how the service actually operates, which is a different
thing from being legally sound. The pages say so on their face and must not be
described as approved, checked or professionally drafted.

This is what a UK commercial adviser needs to look at before the first online
sale.

## How the draft state is controlled

`_data/legal.yml` holds a single flag:

```yaml
approved: false
version: "0.1"
effective_date: ""
```

While `approved` is false, every contractual page shows

> **Draft — requires review by a UK commercial solicitor before live use.**

and the version block reads "Draft version 0.1 … not yet in force". Setting
`approved: true` and an `effective_date` removes that notice from every page at
once and switches the version block to "Version 1.0 — effective …". There is no
per-page notice to remember to delete, and the internal draft label is never
shown to customers after approval.

`npm test` fails if any page claims the terms are legally approved, so that
claim cannot be reintroduced by accident.

## Pages carrying draft contractual content

| Page | Route |
| --- | --- |
| Choose Your Practice Website Service Terms | `/service-terms/practice-website/` |
| Cancellation and Refund Information | `/cancellation-and-refunds/` |
| Terms and Conditions (general) | `/terms/` |
| Privacy Policy | `/privacy/` |

`/accessibility/` is a factual statement about the website rather than
contractual wording, and carries no draft notice. It should still be checked for
accuracy: it describes what is actually done, and it must not claim a
third-party audit that has not happened.

Passages needing review most are marked `⚖` in the page source and shown with a
marker on the page. Placeholders that must be completed before publication are
wrapped in `[square brackets]` and rendered in italics.

## Must be resolved before any payment is taken

1. **Trading identity.** Registered trading name, legal status (sole trader or
   limited company), company number if applicable, and a business address for
   service of notices. Placeholder in clause 1 of the service terms, clause 1 of
   `/terms/`, and the controller section of `/privacy/`. All three must say the
   same thing.
2. **VAT position.** Whether the Studio is VAT registered and, if so, whether
   £995 is inclusive or exclusive. Placeholder in clause 3 of the service terms.
   This also determines whether Stripe automatic tax should ever be switched on
   (see `STRIPE_SETUP.md`, step 10).
3. **Limitation of liability.** Clause 16 deliberately contains only the
   non-excludable carve-out and a placeholder. Any cap by reference to the fee,
   and the treatment of indirect or consequential loss, must be drafted and
   tested for fairness under the Consumer Rights Act 2015 and for reasonableness
   under the Unfair Contract Terms Act 1977.
4. **Consumer status.** The pages deliberately do not assert that the buyer is a
   consumer or a business, and explicitly do not claim that every therapist is
   automatically excluded from consumer rights. Confirm that approach, and
   confirm the description of the 14-day cancellation right for distance service
   contracts — including the express-request-to-begin exception and the
   full-performance exception.
5. **Model cancellation form.** If the statutory consumer regime applies, a
   model cancellation form should be provided and linked from
   `/cancellation-and-refunds/`. Currently a placeholder.
6. **Data protection.** Confirm the controller's registered name and address;
   whether ICO registration is required and the registration number; the actual
   processors used for email, file storage and accounting; the transfer
   mechanism each relies on; the retention periods actually operated; and the
   security controls genuinely in place. **Do not publish a security claim that
   is not true in practice.** Confirm the description of Stripe as an
   independent controller of payment data.
7. **Acceptance at checkout.** Clause 4 states that acceptance is recorded when
   Stripe requires the customer to accept the terms before paying. That is only
   true once the Payment Link is configured with a terms-of-service URL
   (`STRIPE_SETUP.md`, step 5). If that is not switched on, the clause is wrong.
8. **Alternative dispute resolution.** Decide whether an ADR route should be
   named for consumer purchases.

## Should also be checked

- **Clauses 5–6** — allocation of responsibility for factual accuracy and for
  professional and advertising compliance (BACP, UKCP, NCPS, and ASA/CAP rules
  on health claims and testimonials).
- **Clause 8 and dormancy** — whether a 60-day dormancy rule and its refund
  consequences are enforceable, particularly against a consumer.
- **Clause 13, intellectual property** — the perpetual, non-transferable licence
  to the underlying design system, and the portfolio-use permission. This is
  also open commercially: see `OPEN_DECISIONS.md`, item 2.
- **Clause 15** — the right to decline to publish content, and its refund
  effect.
- **Clause 17, confidentiality** — added in this pass, including the undertaking
  to delete client information received in error. Check it sits correctly
  alongside the therapist's own confidentiality obligations.
- **Clause 19, events outside reasonable control** — added in this pass,
  including the thirty-day termination right.
- **Clause 21** — applying the version of the terms current at the time of
  payment. Consider archiving each published version with its effective date so
  the applicable version can be produced later if it is ever disputed.
- **`/terms/` clause 2** — the statement that only the Choose Your Practice Website
  checkout is an offer capable of acceptance, and that prices shown elsewhere
  are indicative rather than quotations. This is what keeps the "around
  £2,000" figure from being treated as an offer.
- **`/terms/` clause 5** — the statement that the website collection designs are
  Studio work rather than commissioned client projects, and that the practices
  shown are illustrative. This matters: presenting Studio designs as client work
  would be a misleading commercial practice.
- **Website Care** — described everywhere as optional at £29 per month or £290
  per year, with no minimum term, but it has no terms of its own. If it is ever
  sold, it needs them, and a recurring subscription needs more than terms (see
  `OPEN_DECISIONS.md`, item 4).

## What is deliberately absent

- No claim that the wording is legally approved.
- No attempt to exclude or reduce a statutory right.
- No assertion about the buyer's consumer or business status.
- No invented figures — no cap, no VAT treatment, no retention period, no
  processor name has been guessed at. Where a real answer is needed, there is a
  placeholder instead.

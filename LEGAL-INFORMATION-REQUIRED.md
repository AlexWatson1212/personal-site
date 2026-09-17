# Legal information required before launch

**Updated 5 September 2026.** Alexander supplied the legal status and the VAT
position; both are now in `_data/legal.yml` and render on every page that uses
them. **Nine facts remain**, listed below. The business address was asked for and
not yet given as an actual address, so it is still empty — see the note under #2.

Originally eighteen bracketed placeholders across four pages resolving to **eleven
distinct facts**. They were repeated by hand; they are now driven from `_data/legal.yml`,
so each is supplied once and every page that uses it updates together.

**Nothing has been invented, guessed or defaulted.** While a value is empty the
page still renders the original bracketed placeholder, so an unfinished page
keeps looking unfinished. `npm test` fails if that stops being true.

## How to fill them in

Open `_data/legal.yml` and replace the empty strings. Nothing else needs editing.
Leave a value empty rather than approximating it — an empty field is honest, a
wrong one is not.

## Category A — determinable from the repository

**None.** I checked `_config.yml`, `_data/`, `LEGAL_REVIEW.md`, `OPEN_DECISIONS.md`
and the Netlify configuration. Not one of the eleven facts is recoverable from
anything in the project. They are all yours to supply or your adviser's to draft.

The category-A work was structural instead: the eleven facts now live in one
file, `_includes/legal-fact.html` renders either the value or the placeholder,
and the QA suite checks that an empty value still shows as empty.

## Category B — facts only you can supply

| # | `_data/legal.yml` key | What is needed | Appears on |
|---|---|---|---|
| ~~1~~ | `identity.legal_name` | ✅ **Supplied 5 Sep 2026** — "Alexander Watson, a sole trader" | Terms, Service Terms, Privacy |
| **2** | `identity.address` | **Still required.** Address for service of notices. The reply gave a bracketed token rather than an address, so nothing was written. See below. | Terms, Service Terms, Privacy |
| ~~3~~ | `tax.vat_position` | ✅ **Supplied 5 Sep 2026** — not registered; prices shown are the amounts charged | Service Terms cl. 3 |
| 4 | `data_protection.ico_registration` | ICO registration number, or confirmation that registration is not required | Privacy |
| 5 | `data_protection.email_provider` | The email and file-storage provider actually used | Privacy |
| 6 | `data_protection.accounting_provider` | Bookkeeping software or accountant, if any | Privacy |
| 7 | `data_protection.transfer_mechanism` | How personal data reaches each processor named above | Privacy |
| 8 | `data_protection.enquiry_retention` | How long enquiries that do not become projects are kept | Privacy |
| 9 | `data_protection.project_retention` | How long project files and correspondence are kept | Privacy |
| 10 | `data_protection.statutory_retention` | The statutory record-keeping period for your legal form | Privacy |
| 11 | `data_protection.security_measures` | The security measures actually operated — do not describe controls you do not run | Privacy |
| 12 | `data_protection.bank` | The bank that receives client payments (named in the privacy notice as an independent controller) | Privacy |
| 13 | `data_protection.intake_provider` | **Added 17 Sep 2026.** The intake form provider's legal entity and role — Tally, as processor — once its data processing terms are accepted. Check Tally's current GDPR page for the entity name and where data is held. | Privacy §3 and "Who else handles your information" |
| 14 | `data_protection.intake_retention` | **Added 17 Sep 2026.** How long intake answers and uploads stay in Tally, as actually operated (the source suggests "deleted from the form service at launch") | Privacy §3 and retention list |

> **17 September 2026 check (after the intake system):** twelve facts are
> empty — #2, #4–#14. The QA suite reports the same twelve.

## Category D — new wording to review (17 September 2026)

The Practice Fundamentals Intake System changed the commercial model. The
following wording was written by the Studio, is flagged ⚖ on the pages, and has
not been reviewed. Add these to `LEGAL-REVIEW-PACK.md` before it goes to a
solicitor.

| Where | What changed | Question for review |
| --- | --- | --- |
| Service terms cl. 2 | One-page scope, the Practice Fundamentals, identity now includes a logo or wordmark | Is the scope description precise enough to be the contract's definition? |
| Service terms cl. 3 | Balance now invoiced after **direction approval**, before the build; build starts only after payment | Is the trigger clear and fair to a consumer? |
| Service terms cl. 4 | The project "officially begins" when the intake is checked and work is confirmed as started | Does this interact correctly with the cooling-off period and "express request to begin"? |
| Service terms cl. 7 | Two feedback stages; what counts as a correction | Clear enough to prevent disputes? |
| Service terms cl. 11 | Direction approval defined; launch approval bounded (ten working days); a website with nothing in scope raised is "treated as delivered" and published once facts are confirmed | Is the deemed-delivery wording sound now that the balance is already paid at this point? What happens if the direction reply never comes (currently: dormancy, clause 8)? |
| Service terms cl. 12 | Website Care is now **technical only**; content changes (including fees and availability) moved out of Care | This narrows an earlier published promise. Any transitional issue for anyone who read the earlier wording? Is "genuine technical faults" and "support with the website as it was built" clear? |
| Service terms cl. 13 | The Practice Fundamentals is part of the identity owned on full payment | What may a client who withdraws before the balance do with the draft document and identity? |
| Cancellation page | New five-stage ladder: before start (deposit refunded); before Fundamentals (proportionate); after Fundamentals, before approval (deposit normally not refunded, balance not invoiced, client keeps the document for reference); after balance, before website delivered (proportionate); after website delivered (not usually refundable) | Is this lawful and fair for consumers, given the cooling-off rules? |
| Privacy notice §3 and processors | Tally named as intake processor; statement that "Tally states that it hosts form data in the European Union, and that some notification emails are sent through a provider in the United States" | Accurate against Tally's current terms? Transfer mechanism for the US email provider? |
| Enquiry page | "Nothing is booked until I have accepted the project in writing and the £100 deposit has been paid" | Consistent with cl. 4? |

### On #2, the address

A UK trader selling to consumers has to give an address at which notices can be
served, and it appears on three public pages. Two practical points, neither of
them legal advice:

- It does not have to be where you work. Many sole traders use a service address
  from an accountant or a registered-office provider precisely so that a home
  address does not sit on a public website next to their own name.
- Whatever you choose, give the full address as it should be printed. It is
  written once here and renders in all three places.

## Category C — professional judgement, not facts

These are drafting, not data entry, so they are not in `_data/legal.yml`. **On
5 September 2026 they were removed from the public pages** — they were
instructions addressed to a solicitor, and a client reading the terms should not
be reading them. Each is already a question in `LEGAL-REVIEW-PACK.md`, and clause
16 now states plainly that no cap on liability is claimed, which is the
conservative position until one is drafted.

| Where it was | What is needed | Now asked in |
|---|---|---|
| Cancellations, statutory regime | Whether a model cancellation form must be provided, and its wording | Review pack §9 |
| Cancellations, dispute section | Whether an alternative dispute resolution route should be named | Review pack §11 |
| Service Terms cl. 16 | Any further limitation of liability — a cap by reference to the fee, and the treatment of indirect loss | Review pack §8 |

## What is urgent, and what is not

**Corrected 10 September 2026.** This paragraph used to say that online
purchasing was off, that the buy button rendered "not open yet", and that the
payment-related items were therefore less urgent. Two of those three are no
longer true. There is no checkout and none is planned, but the buy component now
renders a written route with no disabled state, and money moves by invoice and
bank transfer the moment a founding practice says yes. A contract is formed in
the written exchange, not on the site — which is exactly why the identity facts
below are needed *before* the first client, not before a checkout opens.

- **Urgent, because the site is live and commercial:** #1 and #2. A UK business
  website that advertises services has to disclose who is behind it and where.
  #4, #5, #7–#11 matter too, because the privacy notice is published and makes
  statements about processing that must be accurate.
- **Before the checkout opens, not before launch:** the three category-C items,
  which are gated on taking payment online. #3 (VAT) is already supplied.

## Do not do

- Do not set `approved: true` until a UK commercial solicitor has actually
  reviewed the wording. `npm test` fails if any page claims approval it does not
  have, and that check is there on purpose.
- Do not delete the draft notice to make the site look finished. It is doing its
  job.
- Do not fill a field with something approximate to clear the placeholder.

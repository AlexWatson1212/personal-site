# Legal information required before launch

Eighteen bracketed placeholders across four pages resolve to **eleven distinct
facts**. They were repeated by hand; they are now driven from `_data/legal.yml`,
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
| 1 | `identity.legal_name` | Registered trading name and legal status — sole trader, or limited company with its company number | Terms, Service Terms, Privacy |
| 2 | `identity.address` | Business address for service of notices | Terms, Service Terms, Privacy |
| 3 | `tax.vat_position` | Whether the Studio is VAT registered, and if so whether £995 includes or excludes VAT | Service Terms cl. 3 |
| 4 | `data_protection.ico_registration` | ICO registration number, or confirmation that registration is not required | Privacy |
| 5 | `data_protection.email_provider` | The email and file-storage provider actually used | Privacy |
| 6 | `data_protection.accounting_provider` | Bookkeeping software or accountant, if any | Privacy |
| 7 | `data_protection.transfer_mechanism` | How personal data reaches each processor named above | Privacy |
| 8 | `data_protection.enquiry_retention` | How long enquiries that do not become projects are kept | Privacy |
| 9 | `data_protection.project_retention` | How long project files and correspondence are kept | Privacy |
| 10 | `data_protection.statutory_retention` | The statutory record-keeping period for your legal form | Privacy |
| 11 | `data_protection.security_measures` | The security measures actually operated — do not describe controls you do not run | Privacy |

## Category C — professional judgement, not facts

These three stay as visible placeholders until a solicitor drafts them. They are
not in `_data/legal.yml`, because filling them in is drafting, not data entry.

| Where | What is needed |
|---|---|
| Cancellations, cl. on the statutory regime | Whether a model cancellation form must be provided, and its wording |
| Cancellations, dispute section | Whether an alternative dispute resolution route should be named |
| Service Terms cl. 12 area | Any further limitation of liability — a cap by reference to the fee, and the treatment of indirect loss |

## What is urgent, and what is not

Online purchasing is **off in production** — the buy button renders "not open
yet". No distance contract is being formed on the site and no money moves
through it, which lowers the urgency of the payment-related items.

- **Urgent, because the site is live and commercial:** #1 and #2. A UK business
  website that advertises services has to disclose who is behind it and where.
  #4, #5, #7–#11 matter too, because the privacy notice is published and makes
  statements about processing that must be accurate.
- **Before the checkout opens, not before launch:** #3 (VAT), and all three
  category-C items, which are gated on taking payment online.

## Do not do

- Do not set `approved: true` until a UK commercial solicitor has actually
  reviewed the wording. `npm test` fails if any page claims approval it does not
  have, and that check is there on purpose.
- Do not delete the draft notice to make the site look finished. It is doing its
  job.
- Do not fill a field with something approximate to clear the placeholder.

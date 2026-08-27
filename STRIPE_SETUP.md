# Stripe setup — Therapist Website (£995, in two instalments)

**The commercial position this file must match:** £995 total. **£500 to begin.
£495 when the client approves the finished website, before it goes live.** The
balance is triggered by the client's explicit written approval, never by the
studio declaring the work finished.

That means **two** money movements, and only the first is a Payment Link:

| | Amount | Mechanism | Trigger |
|---|---|---|---|
| First instalment | £500 | Payment Link, sent directly by Alexander after the scope is confirmed in writing | The client says yes |
| Balance | £495 | Stripe invoice, raised by hand | The client's written approval of the finished website |

**At launch the Payment Link is not published on the website.** The route is
deliberately human: choose a direction → contact Alexander → scope confirmed in
writing → £500 payment link → questionnaire. `purchases_enabled` stays `false`
and the site shows no checkout control. This file remains the runbook for the
day that changes.

Manual steps for Alexander, in order, after the website has been reviewed.

**Nothing in this list is done for you.** No live product exists, no live
Payment Link exists, purchasing is off, and nothing has been deployed.

Two rules that never bend:

- **No Stripe key of any kind goes in this repository, in Netlify's build
  environment, or into a chat window.** The only Stripe value this website ever
  holds is a *Payment Link URL*, which is public by design. Secret and
  restricted keys (`sk_live_…`, `sk_test_…`, `rk_…`, `whsec_…`) are not needed
  for this release and are rejected by the build if one is ever pasted into a
  link variable.
- **The sandbox Payment Link never goes near production.** The build refuses to
  emit it in a production build even if it is configured.

---

## Stage A — before touching Stripe

### 1. Review and approve the service terms

Read `/service-terms/practice-website/` in full, then
`/cancellation-and-refunds/`, `/privacy/` and `/terms/`. Everything in
`LEGAL_REVIEW.md` needs answering, and the `[square bracket]` placeholders need
filling, before anything is sold under them.

Have a UK commercial solicitor review the wording. This is the step that
protects you; the rest is configuration.

### 2. Publish the service-terms and privacy URLs

Once approved, set `approved: true` and an `effective_date` in `_data/legal.yml`.
The "Draft — requires review by a UK commercial solicitor" notice then
disappears from every legal page at once, and the version block switches from
"Draft version" to "Version … effective …".

Deploy so the following URLs are publicly readable without logging in:

- `https://alexanderwatson.co.uk/service-terms/practice-website/`
- `https://alexanderwatson.co.uk/cancellation-and-refunds/`
- `https://alexanderwatson.co.uk/privacy/`
- `https://alexanderwatson.co.uk/purchase-complete/`

Stripe needs to be able to reach the first and third. Check each in a private
browser window.

---

## Stage B — the sandbox Payment Link

### 3. Add the public URLs to Stripe's business details

Stripe Dashboard → **Settings → Business → Public details**.

- Terms of service URL: `https://alexanderwatson.co.uk/service-terms/practice-website/`
- Privacy policy URL: `https://alexanderwatson.co.uk/privacy/`
- Support email: `hello@alexanderwatson.co.uk`

These appear on receipts and on the checkout page.

### 4. Edit the existing sandbox Payment Link

Sandbox → **Payment Links** → the *Therapist Website — first instalment* link.
Any link still configured for the retired £995-in-one-payment product, or under a
retired offer name, must be archived rather than edited, so it cannot be sent by
accident. Confirm the new link matches:

| Setting | Value |
| --- | --- |
| Product | Therapist Website — first instalment |
| Price | £500 GBP |
| Price type | One-off |
| Description | Must state that this is the first of two instalments and that the £495 balance falls due on approval, before launch |
| Product category | Website Design |
| Managed Payments | Disabled |
| Automatic tax | Disabled |
| Quantity adjustment | Disabled |
| Saved payment details | Disabled |
| Promotion codes | Disabled |
| Tax ID collection | Disabled |

### 5. Require acceptance of the service terms

In that Payment Link → **After payment / Options**, switch on *Require customers
to accept your terms of service* and point it at
`https://alexanderwatson.co.uk/service-terms/practice-website/`.

This is how acceptance is recorded, and clause 4 of the service terms says so.
Without it, the terms are published but not agreed.

### 6. Set the post-payment redirect

Same panel → *Don't show confirmation page* → **Redirect customers to**:

```
https://alexanderwatson.co.uk/purchase-complete/
```

No query parameters, no session ID in the URL. That page receives nothing from
Stripe, checks nothing, and says so.

### 7. Test the sandbox purchase end to end

Use a Stripe test card. Walk the whole journey as a client would:

design → service page → service terms → checkout → purchase-complete →
questionnaire.

### 8. Confirm the fields Stripe collected

In the sandbox payment, check that all of these came through:

- Customer name — required
- Business name — required
- Billing address — required
- Phone number — not collected
- Custom field: *Chosen website design*
- Optional custom field: *Current website or profile URL*

### 9. Verify the transaction in Stripe

Confirm the payment appears in the sandbox dashboard at £500.00 GBP, that the
receipt email arrived, that the receipt carries the terms and privacy links from
step 3, and that the redirect landed on `/purchase-complete/`.

### 9a. Set up the balance invoice, before the first project reaches approval

The £495 balance is a Stripe invoice raised by hand. Prepare the template now
rather than at the moment it is needed:

- One line item, £495 GBP, described as the balance of the Therapist Website.
- Payment terms stated on the invoice.
- Raised **only** after the client's written approval of the finished website,
  and before launch. The approval email is the record that it was due.
- No subscription, no saved card, no automatic collection.

### 10. Confirm no automatic tax collection

Leave automatic tax off unless a tax registration has actually been established
in the Stripe Tax settings. Turning it on without a registration produces
incorrect invoices, and correcting them afterwards is worse than not having
them.

---

## Stage C — live mode

### 11. Complete Stripe business verification

Live mode → **Settings → Business → Verification**. Bank details, identity
documents, business details. Do this before creating the live product, not
after.

### 12. Create the live product and Payment Link

Recreate the product and Payment Link in **live mode** with the identical
settings from steps 4, 5 and 6. Do not attempt to copy the sandbox link — a
sandbox link cannot take a real payment, and this website will refuse to publish
one.

### 13. Confirm Managed Payments stays disabled

Verify it in live mode explicitly. A different default in live mode changes how
funds settle.

### 14. Confirm the live product category

Live product → category → **Website Design**. It affects how Stripe classifies
the business and can affect payout review.

### 15. Add the live Payment Link to Netlify

Netlify → **Site configuration → Environment variables**. Three variables, no
keys:

| Variable | Value | Scope |
| --- | --- | --- |
| `PUBLIC_STRIPE_STRAIGHTFORWARD_LINK` | the live Payment Link, e.g. `https://buy.stripe.com/REPLACE_WITH_LIVE_LINK` | Production |
| `PUBLIC_PURCHASES_ENABLED` | `true` | Production |
| `PUBLIC_STRIPE_TEST_LINK` | the sandbox Payment Link, e.g. `https://buy.stripe.com/REPLACE_WITH_SANDBOX_LINK` | Deploy previews and branch deploys **only** — never Production |

What the build does with them (`scripts/purchasing-config.mjs`):

- Only a URL beginning `https://buy.stripe.com/` is ever accepted.
- In a production build the sandbox variable is ignored entirely, and a
  sandbox-shaped URL in the live variable is rejected.
- Purchasing stays **off** unless `PUBLIC_PURCHASES_ENABLED` is exactly `true`
  *and* a valid link survived those checks.
- A value shaped like a Stripe secret or restricted key **fails the build**
  rather than being written anywhere.
- If anything is missing or rejected, the page shows "Online purchasing is
  opening shortly" and keeps the "Ask a question first" route working. That is
  a safe state, not an error.

### 16. Deploy only after a final live-mode safety review

Before the production deploy, confirm on a deploy preview: the buy action points
at the live link; no `buy.stripe.com/test` string appears anywhere in the built
site; the terms, cancellation and privacy links work from the checkout section;
and `/purchase-complete/` still carries `noindex`.

`npm test` checks the last three automatically.

### 17. Make one controlled real payment

Buy it yourself, with a real card, at the real price. Then refund it in the
Stripe Dashboard. £995 through and back is a cheap way to find out that the
receipt has the wrong terms URL on it.

### 18. Verify the whole loop once more, in live mode

Receipt email arrives · terms link on the receipt resolves · redirect lands on
`/purchase-complete/` · the payment and the two custom fields appear in the live
dashboard · the refund also appears · your accounting record matches.

### 19. Never publish the sandbox URL

Not in the repository, not in a Netlify production variable, not in an email to
a client, not in a screenshot. A sandbox link looks like a working checkout and
takes no money — a client who "pays" through one has not paid, and will believe
they have.

---

## Before automatic fulfilment — read this first

This release deliberately has **no server-side Stripe integration**. It is a
static site: a link out to a Stripe-hosted page, and a page the customer is
returned to. Nothing is verified, created or sent by the website.

`/purchase-complete/` is a public URL that anyone can open directly. It is
therefore **not** evidence of payment, and nothing in this project treats it as
such. Fulfilment starts when you see the payment in Stripe and email the client
yourself.

If automatic fulfilment, project creation, a customer record or Website Care
subscriptions are ever wanted, they require **verified Stripe webhooks** and a
secure server-side component. That means:

- A server-side endpoint that verifies the `Stripe-Signature` header against the
  endpoint's signing secret before trusting a single byte of the payload.
- Handling `checkout.session.completed`,
  `checkout.session.async_payment_succeeded` and
  `checkout.session.async_payment_failed`, with fulfilment gated on
  `payment_status === "paid"` — `checkout.session.completed` alone does not mean
  the money arrived, because delayed payment methods complete the session first
  and settle later.
- Idempotent handling, because Stripe retries.
- Somewhere secure to keep the signing secret and any restricted key — a server
  environment, never this repository and never a Netlify build variable that
  ends up in the built output.

**Do not add any of that to this project as it stands.** This repository is a
static Jekyll site with no secure server-side architecture, no database and no
secret store. Introducing webhook code here would mean introducing all three,
and that is a separate piece of work with its own review.

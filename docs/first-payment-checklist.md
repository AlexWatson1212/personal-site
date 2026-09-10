# Taking the first instalment — what is actually left

Alexander Watson Studio · internal · written 5 September 2026

> **Superseded in two respects, 10 September 2026. Read `docs/pre-launch.md` and
> `docs/founding-practices.md` first.**
>
> 1. **The figures below are the old ones.** The first three practices pay £495,
>    taken as **£100 to begin and £395 on approval for launch**. Wherever this
>    file says £500 read £100, and wherever it says the £495 balance read £395.
> 2. **The mechanism is no longer Stripe.** The Studio settled on invoice and
>    bank transfer in September 2026, `PUBLIC_PURCHASES_ENABLED` stays unset, and
>    no Payment Link is needed to take a founding client. The Stripe steps below
>    are kept only as a record of what was set up, not as work to do.
>
> What is still current in this file: the two owner decisions at the end — approve
> the questionnaire, and supply the legal identity facts.

`STRIPE_SETUP.md` is the full nineteen-step runbook. This file is the short answer to
one question: **what still has to be true before a real therapist can pay the first
instalment?** It exists because the runbook is long enough to read as a project, and the
remaining work is not.

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

---

## Where things stand today

| Fact | State | Where it is recorded |
| --- | --- | --- |
| Online purchasing | **Off** | `_data/purchasing_resolved.yml` → `purchases_enabled: false`, `link_source: "none"` |
| Live Payment Link | **Does not exist** | `STRIPE_SETUP.md`, Stage C |
| Sandbox Payment Link | Exists, unverified | `STRIPE_SETUP.md` step 4 |
| Recurring billing for Website Care | **Does not exist, and is not needed yet** | `_data/purchasing.yml` → `subscriptions_enabled: false` |
| The £495 balance | Stripe invoice, raised by hand | `STRIPE_SETUP.md` step 9a |
| What the public site says | A written route: scope confirmed in writing, then a payment link is sent | `_includes/practice-website-buy.html` |

The public wording and the configuration now agree. Nothing on the site claims a
self-service checkout, so **the site is safe to show to therapists today.** What follows
is only what must be true before somebody can hand over money.

---

## The five things that remain

Each is an account or dashboard task. None of them is a change to this repository.

1. **Complete Stripe business verification.** Live mode cannot issue a Payment Link
   until identity and bank details are accepted. This is the longest-lead item and
   nothing else can start until it is done. `STRIPE_SETUP.md` step 11.

2. **Create the live product and a live Payment Link for £500.** One product,
   *Therapist Website — first instalment*, GBP 500.00. `STRIPE_SETUP.md` step 12.
   Do not create a £995 single-payment link unless a client has agreed a single
   payment in writing, which clause 3 of the service terms permits.

3. **Attach the service-terms URL to the Payment Link** so the terms travel with the
   payment. Note the change of purpose since the runbook was written: acceptance is now
   recorded in the written exchange, not at a payment page — clause 4 says so. The link
   to the terms is therefore a courtesy and a record, not the mechanism of agreement.
   Do not restore any wording that says otherwise.

4. **Set the post-payment redirect** to `https://alexanderwatson.co.uk/purchase-complete/`.
   That page already exists, is `noindex`, receives nothing from Stripe and says so.
   `STRIPE_SETUP.md` step 6.

5. **Prepare the £495 balance invoice as a Stripe invoice template**, before the first
   project reaches approval rather than on the day it does. `STRIPE_SETUP.md` step 9a.

**Deliberately not on this list:** adding the live Payment Link to Netlify environment
variables (steps 15–16). That switch turns on a self-service buy button. The offer is a
written route, and the site does not need it. Leave `PUBLIC_PURCHASES_ENABLED` unset.

---

## What a first sale looks like without any of the above

It is worth being clear that four of the five are conveniences. If a therapist agreed
tomorrow, the only hard blocker is **business verification**, because without it Stripe
cannot take a live payment at all. Everything else has a manual equivalent: a Payment
Link can be created in a few minutes once verification clears, and an invoice can be
raised by hand.

---

## The two owner decisions that are not Stripe's problem

1. **Approve the intake questionnaire.** `_data/intake.yml` → `questionnaire_approved: false`
   still puts a *"Draft questionnaire"* notice on the first page a client sees after
   paying. The questions have been re-checked against the September 2026 offer and match
   it — question 4 now asks which work in the collection the client keeps returning to,
   rather than which design they have chosen, and nothing in the form implies Practice
   Clarity is a separate purchase. What remains is Alexander reading the twenty-two
   questions once and deciding they are his. Then set the flag to `true`.

2. **Supply the legal identity facts.** See `LEGAL-INFORMATION-REQUIRED.md`. These do not
   block showing the site, but the terms name no legal entity until they are filled.

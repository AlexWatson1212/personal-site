# Open decisions

Things that were deliberately **not** decided during the purchasing-journey
build, because deciding them would have meant inventing a commercial, legal or
editorial position on Alexander's behalf.

Each item says what the current state is, what needs deciding, and what has to
change once it is decided. Nothing here blocks a review of the site; several
items block going live.

Legal wording that needs a solicitor is tracked separately in
`LEGAL_REVIEW.md`. Stripe Dashboard steps are in `STRIPE_SETUP.md`.

---

## 1. The approved Website Content Questionnaire is missing — BLOCKS INTAKE

**State.** The brief describes an approved intake of 15 required questions and
7 optional ones. That questionnaire is not in this project — not in the pages,
not in `_legacy/`, not in the git history, not in any data file. It was searched
for by name, by shape and by keyword before anything was written.

**What was built instead.** A clearly marked **draft** at
`/services/practice-website/questionnaire/`, built to exactly that shape
— 15 required questions, 7 optional — covering client and practice identity,
contact details, chosen design, required pages, approved copy, professional
facts, colour direction, logo status, image status and permissions, domain and
current website, accessibility and communication requirements, and final
acknowledgements. It deliberately requests no therapy-client information.

**Decision needed.** Supply the approved questionnaire, or approve this draft as
the questionnaire.

**Then.** Replace the wording, keep the 15/7 split, and set
`questionnaire_approved: true` in `_data/intake.yml`. The draft notice then
disappears from the page automatically.

---

## 2. Ownership of the underlying design system — BLOCKS GOING LIVE

**State.** The service terms (clause 13) and the service page both say the same
thing: your words, images, logo and the finished customised website are yours;
the underlying design system, layout and code remain the Studio's and are
licensed to you for one website, for your practice, indefinitely and
non-transferably.

**Why it is open.** No prior signed agreement was supplied that settles this, so
the wording above is a reconstruction of the commercial intent, not a record of
a decision already taken. Three questions are unanswered:

1. Is the licence perpetual, or does it end if Website Care ends?
2. Can the client move the finished website to another host or developer, and
   have that developer modify it? (The current wording allows moving and hosting
   it, and does not expressly address third-party modification.)
3. If the client later commissions a second practice website, does the licence
   extend to it or is a new licence required?

**August 2026 — the commercial position is now recorded; the wording is not
reviewed.** Alexander's intended commercial outcomes are:

1. The licence is **perpetual**. It does not end when Website Care ends.
2. The client **may appoint another developer** to maintain or modify that
   website.
3. The licence covers **that one website for that practice**. A second website
   needs a new licence.
4. **Resale or redistribution of the underlying design system is not
   permitted.**

These are intended outcomes, not reviewed contract wording. Clause 13 and the
service page must not be redrafted to assert them until a UK commercial
solicitor has settled the language. See `LEGAL-REVIEW-PACK.md`, item 3.

**Decision needed.** The drafting, from a solicitor.

**Then.** Update clause 13 of `_pages/service-terms-practice-website.html`
and the "Ownership and licensing" section of
`services/practice-website.html` together — the QA suite checks they
agree.

---

## 3. RESOLVED — the offer structure and the payment model

**August 2026.** Superseded. There are not two routes and there is no "around
£2,000". The settled position is one product with one add-on:

- **Therapist Website £995** — fixed, including the first twelve months of
  Website Care. **£500 to begin. £495 when you approve the finished website,
  before it goes live.** The balance is triggered by the client's explicit
  written approval, not by the studio declaring the work finished. A single
  payment is not offered publicly.
- **Practice Clarity £500** — a separate, earlier piece of work, agreed in
  writing and invoiced separately, offered only where the intake shows it is
  needed.
- **Website Care** — included for twelve months, then £29 a month, no minimum
  term. There is no annual price.

Retired and not to be reintroduced: the two-route structure, *Choose Your
Practice Website*, *Practice Clarity + Bespoke Website*, *Guided Website*,
*Straightforward Website*, *Template Website*, *Semi-Custom*, and the figures
£495 **as an offer price**, £795, £1,495, £1,995, £2,195, £2,000 and £290.

Note the one collision: **£495 is now in service as the balance instalment**, so
it is no longer in `RETIRED_PRICES` and is no longer guarded automatically.

## 4. Website Care as a subscription

**State.** Website Care is included for the first twelve months, then optional
at £29 per month with no minimum term. The annual price was retired in August
2026: there is no £290. `_data/purchasing.yml` carries
`subscriptions_enabled: false`. **No subscription product, Payment Link or
recurring checkout has been built or activated**, as instructed.

**Decision needed.** Whether Website Care is eventually sold online as a
recurring subscription, or invoiced.

**Then.** A recurring checkout is a materially different piece of work from a
one-off Payment Link: it needs verified Stripe webhooks, a record of who is
subscribed, dunning and cancellation handling, and its own terms. It should not
be added to this release. See `STRIPE_SETUP.md`, "Before automatic fulfilment".

---

## 5. RESOLVED — the blanket `!important` heading rule

**August 2026.** Obsolete. `assets/css/main.css` no longer exists: the site was
recomposed onto a single hand-written stylesheet, `assets/css/studio.css`, and
`npm run build:css` now fails if an `!important` declaration appears at all. The
decision this section described cannot recur.

## 6. Live demo links for the website collection

**State.** Of the eight designs in the collection, only *Alexander Watson
Counselling* links to a live website. The other seven link to the enquiry form.
`IMPLEMENTATION.md` recorded this as intentional pending subdomains.

**August 2026 — resolved in principle, pending build quality.** The directions
will be published as live concept sites, ranked by actual build quality rather
than by intent, and only where a concept meets the threshold: three exceptional
live concepts beat four where the fourth weakens the collection.

Disclosure is now a single field, `provenance`, in `_data/collection.yml`, with
four permitted values — *Studio Practice — fictional brief*, *Studio Practice —
unofficial redesign concept*, *Live Practice — the studio's own*, and *Client
Work*, which stays unused until it is factually true. No page may invent its own
disclosure wording.

**Decision needed.** Nothing further in principle. Per concept: whether the build
meets the threshold, which is a judgement made against the assessment in
`CONCEPT-PUBLICATION-ASSESSMENT.md`.

---

## 7. Legal identity and business details

**State.** Every legal page carries `[square bracket]` placeholders for the
registered trading name and legal status, company number if applicable, and the
business address for service of notices. The pages will not stand up without
them.

**Decision needed.** Sole trader or limited company, and the address to publish.

**Then.** Fill the placeholders on all four contractual pages at once. The QA
suite counts remaining placeholders and reports them.

---

## 8. Retention periods, processors and security claims in the privacy policy

**State.** The privacy policy now sets out lawful bases, processors,
international transfers, retention and security — with `[square bracket]`
placeholders where a real answer is needed rather than a plausible one.

**Decision needed.** The actual email, file storage and accounting providers;
the retention periods actually operated; the transfer mechanism each supplier
relies on; and the security controls genuinely in place.

**Then.** Do not describe a control that is not operated. A privacy policy that
claims two-factor authentication and device encryption is a statement of fact,
not an aspiration.

---

## 9. Where enquiry and questionnaire submissions should go

**State.** Both the enquiry form and the questionnaire assemble their content in
the visitor's own browser and hand it back as text to copy or open in their own
email client. Nothing is transmitted to or stored by this website. That is
honest, private and costs nothing — and it is also friction, and some people
will abandon at that step.

**Decision needed.** Whether to introduce real server-side form handling.

**Then.** It changes the privacy policy (a new processor, a new lawful basis, a
new retention period), and it needs spam handling. It was not invented here
because the brief said not to invent an external service.

---

## 10. The `/links/` page

**State.** `INSTALLATION.md` lists `links/index.html` among the sources to be
removed as obsolete. It was **not** removed, because `/links/` is the kind of
page that lives in a social-media bio, and deleting it would break that link
silently.

Cleared alongside it, because those really were dead: `search.json` and
`assets/js/search.js` (the retired site search, referenced by nothing),
`_includes/practice-notes-signup.html` (its page was retired),
`_data/theme.yml` (starter-template scaffold, read by nothing),
`practice-clarity/framework` (a stray extensionless file that Jekyll was
publishing verbatim at `/practice-clarity/framework`), and the duplicate
`_posts` copy of the Beyond Counselling Directory article, which was blocking
its own redirect.

**Decision needed.** Keep `/links/` or retire it. If it is retired, add a
redirect rather than letting it 404.

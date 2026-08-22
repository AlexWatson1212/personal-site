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

**Decision needed.** Answer all three, then have the clause reviewed.

**Then.** Update clause 13 of `_pages/service-terms-practice-website.html`
and the "Ownership and licensing" section of
`services/practice-website.html` together — the QA suite checks they
agree.

---

## 3. Whether the Practice Clarity price stays indicative

**State.** The site shows **£995** as a fixed price for Choose Your Practice
Website, and **around £2,000** for Practice Clarity + Bespoke Website. The
Guided Website tier has been retired: there are two routes, not three.

**Why it is open.** Practice Clarity is proposal-led, so "around £2,000" is
honest about a scope that genuinely varies — but a visitor comparing two
numbers reads a fixed figure more confidently than an approximate one. If most
proposals land at the same number in practice, fixing it would strengthen the
page.

**Decision needed.** Keep "around", or fix the figure once enough proposals
have been written to know what it actually is.

**Then.** If "from" is chosen, change it in `index.html`, `service.html`,
`_pages/terms.html` and `_data/purchasing.yml` together, and update the QA
price-consistency check, which currently asserts the flat figures.

---

## 4. Website Care as a subscription

**State.** Website Care is presented everywhere as optional, at £29 per month or
£290 per year, with no minimum term. `_data/purchasing.yml` carries
`subscriptions_enabled: false`. **No subscription product, Payment Link or
recurring checkout has been built or activated**, as instructed.

**Decision needed.** Whether Website Care is eventually sold online as a
recurring subscription, or invoiced.

**Then.** A recurring checkout is a materially different piece of work from a
one-off Payment Link: it needs verified Stripe webhooks, a record of who is
subscribed, dunning and cancellation handling, and its own terms. It should not
be added to this release. See `STRIPE_SETUP.md`, "Before automatic fulfilment".

---

## 5. Retiring the blanket `!important` heading rule

**State.** `assets/css/main.css` (section 43) contains:

```css
h1, h2, h3, h4, h5, h6, blockquote {
  color: var(--logo-ink) !important;
  font-family: var(--font-heading) !important;
  font-weight: 400 !important;
  letter-spacing: 0 !important;
}
```

This silently overrode every contextual heading colour on the site. It is why
the dark card on the About page rendered near-black text on dark green
(1.41:1 against a 3:1 requirement) — a defect confirmed in the browser, not
inferred.

**What was done.** The dark-section heading colours in
`assets/css/catalogue-refresh.css` now carry `!important` themselves, purely to
counter that one rule. It is commented as such. Contrast is now clean across
every route.

**Decision needed.** Whether to retire the blanket rule properly.

**Then.** Removing the four `!important` flags would let
`catalogue-refresh.css` apply its own intended heading face (`--serif`:
Iowan Old Style / Palatino / Georgia) instead of Instrument Serif. That is a
visible change to the whole site's headings, so it is a design decision, not a
tidy-up. Do it deliberately or not at all.

---

## 6. Live demo links for the website collection

**State.** Of the eight designs in the collection, only *Alexander Watson
Counselling* links to a live website. The other seven link to the enquiry form.
`IMPLEMENTATION.md` recorded this as intentional pending subdomains.

**Decision needed.** Whether to publish live demo subdomains for the other
seven, and under what wording — they are Studio designs, not commissioned
client work, and `/terms/` clause 5 now says so plainly.

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

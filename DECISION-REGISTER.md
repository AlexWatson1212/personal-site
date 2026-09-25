# Decision register — current state

Alexander Watson Studio · internal · **the source of truth** · last updated 17 September 2026 (Practice Fundamentals Intake System) · **FROZEN**

**Not published.** Listed under `exclude:` in `_config.yml`.

One page, current decisions only. Where any other document disagrees with this
one, this one wins and the other is out of date. Reasoning and history live in
the documents linked below, not here. Change a line only when the decision
itself changes, and date it.

---

## The business

| | Decision |
|---|---|
| **Niche** | Therapists and counsellors in UK private practice. |
| **Core idea** | Most therapist websites start with the website. Alexander Watson Studio starts by understanding the practice. The website is downstream of that. |
| **Who is behind it** | Alexander: more than fifteen years across marketing, e-commerce and personal branding — his own businesses, social channels grown for businesses in different markets, and individual clients' personal brands; now training as a counsellor, with supervised client work on placement. One person, not an agency. No invented figures, employers or credentials. **The site must not claim or imply a large personal YouTube audience** — the YouTube experience was through earlier businesses, and the wording was corrected on 19 September 2026. |
| **Current experiment** | Get three real founding clients at £495. The only question it has to answer now: will three real therapists pay £495 for this process? |
| **Next business target** | **Client one.** |
| **Next optional site asset** | A **60–90 second founder video** (Alexander at his own desk, to camera). The home page is ready for it (`_data/founder.yml`) and works without it. It is **not** a prerequisite for finding client one. |
| **Later, not now** | A 4–6 minute process video (the method → Sofia, Maya, Daniel → how decisions become design). A future marketing asset, not a launch blocker, and no funnel is to be built around it. |
| **Not the plan** | Giving a website away free as a validation project. No giveaway, competition or free-project call to action anywhere. |
| **Before the first £100** | Admin, plus the intake: the twelve empty facts in `_data/legal.yml` (address, ICO and ten privacy-notice facts, including the two form-service facts — asked in `LEGAL-QUESTIONNAIRE-2026-09-19.md`, listed in `LEGAL-INFORMATION-REQUIRED.md`); confirmation that Netlify has detected the Practice Discovery form after deploy (`docs/operations/practice-discovery-netlify-setup.md`); the legal review of the new payment, feedback, cancellation and Care wording. |
| **Freeze rule** | **In force from 17 September 2026.** No further speculative website or service redesign, no new fictional practices, no pricing or package exercise before real-client evidence. Corrections of fact, broken links, accessibility faults and the admin facts in `LEGAL-INFORMATION-REQUIRED.md` are not redesign. The Practice Fundamentals Intake System (below, same date) was a decision taken on Alexander's instruction, not an exception to this rule. |

## The service

**17 September 2026 — the Practice Fundamentals Intake System.** Approved source: `docs/operations/practice-fundamentals-intake-system.md`. It replaces the four-stage model, the Practice Clarity document, the Website Content Questionnaire and the "up to five pages" scope recorded here earlier the same day.

| | Decision |
|---|---|
| **Product** | **Practice Identity & Website** — one complete, responsive web page built from the client's **Practice Fundamentals**. |
| **Public journey** | **1 Enquire → 2 Reserve the project → 3 Complete the intake → 4 Approve the direction → 5 Website build → 6 Review and launch.** Production has more steps; the public explanation does not. |
| **Enquiry** | The existing browser-built email enquiry (`contact.html`, `assets/js/contact-enquiry.js`) with a **five-question fit check**: what and where; whether one page is enough (with a follow-up if not); domain; photographs; date needed. No form backend, no storage, no scoring, no automatic rejection. Alexander replies personally. |
| **Intake** | **Practice Discovery** — a native **Netlify** form at the private page `/client/practice-discovery/`, sent after the deposit. 68 text questions across 11 steps; nine are Required, plus the final confirmation before submission, and every other question is marked Optional. **No file uploads:** the form takes text only, and clients share a Google Drive, Dropbox or WeTransfer link, or email files. Enough to start = every required fact plus at least four of the seven core answers; one clarification message (five questions at most) or a 20-minute call if not. <br><br>*Superseded 19 September 2026:* a Tally form at `/client/intake/?ref=AW-000`, decided 17 September and retired two days later without ever being built or connected. It was a third-party embed holding client answers and uploads outside the site; Practice Discovery keeps the questionnaire in the repository, under QA, with no uploads to delete later. In git history at `e52cb8d`. |
| **Practice Fundamentals** | Included, no separate price. The full **11-page** document for every client, founding or not, produced from a controlled template: position, practical facts, beliefs and boundaries, descriptions at several lengths, voice and vocabulary, logo or wordmark, colours, typography, photography direction, and a quick check for later writing; with a facts table and a working preview of the opening screen built in code. Reissued at launch with facts confirmed. |
| **Identity** | A logo or wordmark (or the client's existing logo), a colour system, typography and photography direction, set out in the Practice Fundamentals and handed over as files. **Not included:** several competing concepts, trademark work, print design, stationery, social media templates. |
| **Website** | **One complete responsive page:** who the therapist is, how they work, fees, practical information, an enquiry form, and a reading control for text size and spacing. The words are written from the intake. **Quoted separately:** additional pages, booking systems, blogs, advanced integrations, unusual functionality, ongoing marketing, and a change to a new direction after approval. |
| **Photography** | A one-page brief (`/client/photography/`, printable), sent with the welcome email. The client arranges photographs alongside the intake. |
| **"Practice Clarity"** | Now names only the method's nine published principles and the three portfolio Blueprints. It no longer names anything a client receives. |
| **Portfolio's role** | Evidence, not choices. A client does not pick Sofia, Maya or Daniel as a starting design. |
| **Retired 17 Sep 2026** | The Website Content Questionnaire (its route now redirects to `/client/intake/`; files in `_legacy/`). The Practice Clarity document as a deliverable. "Up to five core pages". One document revision plus two website rounds. The four-stage public process. The one-page Direction Note, the "name the one you keep returning to" first step and the 13 Sep identity package (retired earlier the same day). |

## Commercial terms — settled

| | Decision |
|---|---|
| **Founding experiment** | The first **three** real practices: **£495**, the complete service, not a tier. No countdown, deadline or places counter. |
| **Payment** | **£100 to reserve your place. £395 once you approve your Practice Fundamentals, before the website is built.** Contractually (service terms clause 3, ⚖ unreviewed): deposit on written acceptance of the scope; the intake follows its receipt; the balance is invoiced after written **direction approval** (clause 11), payable within 14 days; the **build begins only once the balance is paid**. Never a guarantee or "pay only if happy". Invoice and bank transfer only — no Stripe, card checkout, subscriptions, automation, CRM or client portal. |
| **Standard price** | **£995**, intended after the founding three: **£500 to begin, £495 after approving the Practice Fundamentals, before the build** (not published while the founding offer is open; see `OPEN_DECISIONS.md` item 3). To be reviewed with real delivery evidence. |
| **Feedback** | **Two consolidated stages.** Stage 1: the Practice Fundamentals and visual direction — confirm each fact, then reply A (go ahead) or B (one set of adjustments, then confirm the adjusted direction). Stage 2: the built website — refining, not restarting. **Corrections never use up a stage** (factual errors, anything misunderstood, anything that departs from the approved direction). |
| **Launch and end** | Stage 2 → launch approval in writing (bounded by clause 11: ten working days to name anything outstanding within scope) → domain connected → launch → final Practice Fundamentals and files → thirty days of minor corrections → **project complete**. Nothing is published until every fact is confirmed. |
| **If a client withdraws** | Before the project begins: deposit refunded. After the Fundamentals is delivered, before approval: deposit normally not refunded, balance not invoiced, client keeps the document for reference (⚖ unreviewed). Accepted risk: the deposit does not cover the Fundamentals work. |
| **Handover** | The Practice Fundamentals (final issue), the logo or wordmark, colour values and typefaces as files, and the website and its files. |
| **Practice Care** | **24 September 2026 — replaces £29/month Website Care with £120/year Practice Care, plus £55/hour for additional work.** **First twelve months included** from launch. Covers hosting, TLS, security and technical upkeep, version history, DNS help, genuine technical faults, support for the original build, and **once a year a website, directory profile and basic SEO review with a short set of written recommendations**. Then **optional at £120 a year** (`practice_care.annual`), paid for the year ahead, renewed only if the client says yes; invoiced. **Not included:** development time, content or design changes, new pages, ongoing SEO, paid advertising, unlimited support — additional work at **£55 an hour** (`hourly_rate`) or a fixed quote where the scope is clear. Not uptime, monitoring or backups. |
| ~~Website Care~~ | **RETIRED 24 September 2026.** Technical care, first year included, then £29 a month with no minimum term. Replaced by Practice Care above; not offered, and not published anywhere. |
| **Other services** | **24 September 2026, on Alexander's instruction** (not an exception to the freeze rule's intent: the main offer is unchanged). A secondary page, `/other-services/`, for smaller adjacent work where it is a good fit: counselling profile review, SEO setup and assessment (no ranking promises), website improvements, brand and practice materials, focused messaging help. Fixed quote where scope is clear, otherwise hourly — rate in `_data/purchasing.yml` `hourly_rate`: **£55** (set 24 September 2026). New scope quoted separately. No PPC. Enquiries go to a short Netlify form at `/other-services/enquiry/` (thank-you at `/other-services/thanks/`), not to the main fit-check enquiry. |
| **SEO setup and assessment** | **25 September 2026, on Alexander's instruction.** The SEO item on `/other-services/` is a **bounded setup and assessment followed by a later review** — not SEO management. Sequence: understand what the website should achieve and which searches matter → check the foundations (indexing, sitemap, titles, descriptions, page structure, local relevance) → record a baseline (Search Console where appropriate) → make a **small number of evidence-led improvements** → set up sensible measurement → **leave it** for an agreed period (usually around 90 days) → review what Google is actually showing → decide the next step (which may be to leave things alone). Pricing uses the existing model only: the setup is a fixed quote where scoped, otherwise `hourly_rate`; **the review is booked separately**; **any further implementation is separately agreed work**. No SEO price of its own. **Search visibility report (added 25 September 2026, on Alexander's instruction):** the setup now includes a client-facing search visibility report, a simple visual report that shows, where the data exists: Google appearances (impressions), visits (clicks), selected relevant searches, visibility over time, client-visible changes made, before/later evidence, what we are learning, what happens next and the next review date. It is **intentionally plain English** — it translates Search Console into language a small-practice owner can read without knowing Search Console. It **does not guarantee rankings**, **does not claim causation** (it is a way of reading the evidence, not proof that a change caused a result), never shows "live" or "real-time" rankings or exact positions (Search Console position is directional and variable), and is **not ongoing SEO management** — it belongs to the setup → measure → review process. Publicly it is described as a report, never as software, a dashboard, a tool, AI or any internal system (the internal SEO tracking system, its data handling and hosting are never named on the site). The review may conclude that the right next step is to change nothing and keep collecting evidence; that is a legitimate recommendation, not a failure of the service. **Never:** ranking guarantees, SEO packages, retainers or monthly SEO, backlink packages, content churn, PPC, or changes made to look busy. Ongoing SEO management is **not offered at present**. No client SEO results or case studies exist — do not imply any. A dedicated SEO landing page is deferred (`OPEN_DECISIONS.md` item 11). |
| **Additional work** | Anything outside the scope: quoted in writing first, invoiced separately. There is no retainer. |
| **Ownership** | The client owns their domain throughout. Identity owned outright on full payment; the website is the client's to keep, host and move; the design system and code are licensed for that one website (clause 13, ⚖, unreviewed). |
| **Client data** | No client names, session notes or identifying details, anywhere. **Netlify, Inc.** is named in the privacy notice as the processor for Practice Discovery responses; responses are deleted from Netlify once copied to the project folder (period to be confirmed in `_data/legal.yml`). Netlify's Forms documentation does not state an automatic deletion schedule, so responses remain available until they are deleted. No files pass through the form, so there are no uploads held by a form service at all. |

## Not current decisions — deliberately left open until real clients have been through it

Do not turn any of these into policy, a package or a page.

- £595.
- Whether additional pages ever become a fixed-price option rather than a quote.
- Future package architecture, or a menu of extras.
- Logo add-ons.
- The long-term support model.
- A free website giveaway (not the plan).
- Whether £495 feels low, right or high; whether £995 is justified.
- Whether two feedback stages are enough in practice, and what each stage actually asks for.
- Whether the full 11-page Fundamentals holds at about 8 hours once templated (fallback: compress pages 5 and 8).
- ~~Whether Tally's same-device saving causes lost work~~ — moot since 19 September 2026. Practice Discovery keeps answers in the page while a client moves between steps but does not save an unfinished form for later, and says so on the page. Whether that is acceptable in practice is the open question now.
- How long the Fundamentals and production actually take, and how much AI shortens production (record hours on every project, per row of the source's journey table).
- Whether clients ask for logos, and whether a larger identity option is ever worth offering.
- Which parts of the internal system are genuinely useful.

## The portfolio

| | Decision |
|---|---|
| **Public** | **Sofia Marin** (editorial, precise, conceptual, restrained) · **Maya Bennett** (warm, conversational, permission-led) · **Daniel Mercer** (stark, practical, typographic, ordinary). Exactly three; enforced by `scripts/qa.mjs`. |
| **What they prove** | Practice → thinking → decisions → website, three times, with three different results. Not three templates, and no house style. |
| **Archived** (16 Sep 2026) | **Helen Calder · Harbour · Stillpoint.** Preserved unpublished in `_strategy/archived-portfolio-2026-09/`; old URLs 301 to `/work/`. |
| **Honesty** | All three are fictional and labelled so. Their Blueprints were written after the concept sites, in the form a client's is written before one, and public copy says so. Sofia's fuller identity is shown as how far the method can go, not as the scope. |

## Where the detail lives

| Topic | Current document |
|---|---|
| Every figure the site renders | `_data/purchasing.yml` |
| Words the site may use | `docs/product-terminology.md` |
| The founding path, step by step | `docs/founding-practices.md` |
| What must be true before the first £100 | `docs/pre-launch.md` |
| Handover | `docs/handover-runbook.md` |
| The founder video fields | `_data/founder.yml` |
| Questions to ask therapists | `docs/proposition-feedback.md` |
| Open repository questions | `OPEN_DECISIONS.md` |
| Legal facts still to supply | `LEGAL-INFORMATION-REQUIRED.md` |
| The intake system (approved source) | `docs/operations/practice-fundamentals-intake-system.md` |
| Confirming Practice Discovery on Netlify | `docs/operations/practice-discovery-netlify-setup.md` |
| Client emails and invoices | `docs/operations/client-email-templates.md` |
| The intake page and photography brief | `/client/intake/` and `/client/photography/` (private, noindex); form address in `_data/intake.yml` |
| Solicitor pack | `LEGAL-REVIEW-PACK.md` — **update its commercial sections first** (status note at its top) |
| How the code enforces all this | `README.md`, `IMPLEMENTATION.md`, `scripts/qa.mjs` |

## Document status (17 September 2026)

- **Current:** this file · `docs/operations/*` · `README.md` · `IMPLEMENTATION.md` · `VISUAL-SYSTEM.md` · `OPEN_DECISIONS.md` · `LEGAL-INFORMATION-REQUIRED.md` · `docs/product-terminology.md` · `docs/founding-practices.md` · `docs/pre-launch.md` · `docs/handover-runbook.md` · `docs/proposition-feedback.md` · `docs/portfolio-disclosure-standard.md` · `docs/reading-control-standard.md` · `_strategy/PRACTICE-CLARITY-SOURCES.md`
- **Update required:** `LEGAL-REVIEW-PACK.md` (commercial facts predate the founding offer and this simplification)
- **Superseded:** `_legacy/practice-website-questionnaire-2026-09/` · `docs/Practice Clarity — presentation standard.md` (as a client deliverable standard) · `DIRECTION-NOTE-TEMPLATE.md` · `docs/direction-note-template.html` · `STRIPE_SETUP.md` · `LEGAL_REVIEW.md` · `docs/first-payment-checklist.md`
- **Archive (historical record only):** `TRUST-ARCHITECTURE-REVIEW.md` · `MINIMAL-LAUNCH-V2.md` · `CONCEPT-PUBLICATION-ASSESSMENT.md` · `POST-LAUNCH.md` · `REBUILD-REPORT.md` · `REDESIGN-REPORT.md` · `REFINEMENT-CHANGELOG.md` · `OFFER-RESOLUTION-CHANGELOG.md` · `PRE-LAUNCH-CHANGELOG.md` · `APPLY-*.txt` · `INSTALLATION.md` · `PHOTOGRAPHY-SHOT-LIST.md` · `_strategy/archived-portfolio-2026-09/` · `_legacy/`

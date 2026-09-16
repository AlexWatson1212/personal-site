# Decision register — current state

Alexander Watson Studio · internal · **the source of truth** · last updated 16 September 2026

**Not published.** Listed under `exclude:` in `_config.yml`.

One page, current decisions only. Where any other document disagrees with this
one, this one wins and the other is out of date. Reasoning and history live in
the documents linked below, not here. Change a line only when the decision
itself changes, and date it.

---

## The business

| | Decision |
|---|---|
| **Niche** | Therapists and counsellors in UK private practice. The niche for this launch; revisited only at the launch finish line, on evidence. |
| **Core service** | **Practice Identity & Website** — one piece of work in four stages, sold once: **Practice Clarity → Practice Identity** (the words, then the look) **→ the website → Yours to keep**. The client is never asked which stages they need. |
| **Next phase** | Market exposure and real-client validation. |
| **Freeze rule** | No new fictional practices and no substantive portfolio or studio-site redesign before meaningful market exposure and real-client evidence. Corrections of fact, broken links and accessibility faults are not redesign. |

## The portfolio

| | Decision |
|---|---|
| **Public flagships** | **Sofia Marin** (editorial, precise, conceptual, restrained) · **Maya Bennett** (warm, conversational, permission before justification) · **Daniel Mercer** (stark, practical, typographic, ordinary rather than therapeutic) |
| **Public count** | **3.** Enforced by the *Portfolio* check in `scripts/qa.mjs`. |
| **Archived** (16 Sep 2026) | **Helen Calder · Harbour · Stillpoint.** A strategic narrowing, not a temporary hide. Preserved unpublished in `_strategy/archived-portfolio-2026-09/`; old URLs 301 to `/work/`. The concept subdomains themselves were not touched. |
| **How the cases are described** | Evidence of the method and starting references — never templates or products bought unchanged. All three are fictional and labelled so. Their Blueprints were written after the concept sites, in the form a client's is written before one, and public copy says so. |

## The offer

| | Decision |
|---|---|
| **Founding offer** | The first **three** real practices: **£495**, complete. The whole service at a lower price, not a reduced version, a tier, a trial or a discount. No countdown, deadline or remaining-places counter. |
| **Payment (founding)** | **£100 to begin. £395 when your website is approved and ready to launch.** (`_data/purchasing.yml` → `payment_sentence`.) Contractually (service terms clause 3): the first instalment is due on written acceptance of the scope and before the project begins; the second is invoiced after written approval of the finished website, payable within 14 days, and the website is made live once it is received. Approval is defined and bounded by clause 11. Never described as a guarantee or "pay only if happy". |
| **Standard price** | **£995** after the three founding places. Its instalment split returns to the site only when £995 does (steps at the top of `_data/purchasing.yml`). |
| **How payment is taken** | Invoice and bank transfer. No online checkout, no Stripe, no card payments. |
| **Practice Clarity** | **Included, and has no price.** It is the first stage of every project, not a separate £500 service, and the client is not asked to judge how much of it they need. The separate £500 Practice Clarity offer (August 2026) is retired. |
| **Custom work** | Scoped and quoted individually, in writing. |

## The process and what the client receives

| | Decision |
|---|---|
| **Client process** | Enquiry → written scope and price → **£100** → questionnaire → intake checked → start date confirmed (the project begins here) → **Practice Clarity → Direction Note, approved** → identity and build → **round one → round two** → **written approval** → **£395** → launch → handover → Website Care. Three to five weeks from the confirmed start. |
| **Client decisions** | Three: the work in the collection they respond to (or ask for a recommendation); approval of the Direction Note; approval of the finished website. |
| **Internal method** | Practice Clarity (the thinking). The published **Practice Clarity Blueprints** are portfolio-length demonstrations of it, not a client deliverable. |
| **Client deliverables** | The **Direction Note** (record of the Practice Clarity work, approved before the build). The website, up to five core pages. **Yours to keep:** the **Practice Identity Guide** (PDF and editable source), wordmark files, colour and typography specifications, font files where licences permit, three templates (letterhead, email signature, business card), four supplier briefs, and a written website specification. Other applications are specified for a supplier, not designed. |
| **Revisions** | **One consolidated revision of the Direction Note**, separate from **two consolidated revision rounds on the website**. Copy and design changes share the two rounds. Putting right something that does not match an approved direction is a correction, not a round. |
| **Copy** | The client supplies words or notes clear enough to edit from; editing for clarity is included; copywriting from a blank page is not. |
| **After launch** | Thirty days of minor corrections. |
| **Website Care** | **First twelve months included**, from launch. Then **£29 a month** only if the client says yes, no minimum term, invoiced. Covers hosting, TLS, deployments, updates, version history, DNS help, faults, and factual updates (fees, availability, contact details, address, qualifications). Does not claim uptime, monitoring or backups. |
| **Ownership** | Identity owned outright on full payment; the finished website is the client's to keep, host and move; the underlying design system and code are licensed for that one website (clause 13, flagged ⚖, unreviewed). |

## Where the detail lives

| Topic | Current document |
|---|---|
| Every figure the site renders | `_data/purchasing.yml` |
| Words the site may use | `docs/product-terminology.md` |
| The founding path, step by step | `docs/founding-practices.md` |
| What must be true before the first £100 | `docs/pre-launch.md` |
| The Direction Note | `DIRECTION-NOTE-TEMPLATE.md`, `docs/direction-note-template.html` |
| Handover | `docs/handover-runbook.md` |
| Open questions | `OPEN_DECISIONS.md` |
| Legal facts still to supply | `LEGAL-INFORMATION-REQUIRED.md` |
| Solicitor pack | `LEGAL-REVIEW-PACK.md` — **update its commercial sections first** (status note at its top) |
| How the code enforces all this | `README.md`, `IMPLEMENTATION.md`, `scripts/qa.mjs` |

## Document status (16 September 2026)

- **Current:** this file · `README.md` · `IMPLEMENTATION.md` · `VISUAL-SYSTEM.md` · `OPEN_DECISIONS.md` · `DIRECTION-NOTE-TEMPLATE.md` · `LEGAL-INFORMATION-REQUIRED.md` · `docs/product-terminology.md` · `docs/founding-practices.md` · `docs/pre-launch.md` · `docs/handover-runbook.md` · `docs/direction-note-template.html` · `docs/proposition-feedback.md` · `docs/portfolio-disclosure-standard.md` · `docs/reading-control-standard.md` · `docs/Practice Clarity — presentation standard.md` · `_strategy/PRACTICE-CLARITY-SOURCES.md`
- **Update required:** `LEGAL-REVIEW-PACK.md` (commercial facts in §1, §2, §4 are pre-founding)
- **Superseded:** `STRIPE_SETUP.md` · `LEGAL_REVIEW.md` · `docs/first-payment-checklist.md`
- **Archive (historical record only):** `TRUST-ARCHITECTURE-REVIEW.md` · `MINIMAL-LAUNCH-V2.md` · `CONCEPT-PUBLICATION-ASSESSMENT.md` · `POST-LAUNCH.md` · `REBUILD-REPORT.md` · `REDESIGN-REPORT.md` · `REFINEMENT-CHANGELOG.md` · `OFFER-RESOLUTION-CHANGELOG.md` · `PRE-LAUNCH-CHANGELOG.md` · `APPLY-*.txt` · `INSTALLATION.md` · `PHOTOGRAPHY-SHOT-LIST.md` · `_strategy/archived-portfolio-2026-09/` · `_legacy/`

# Minimal Launch V2 — specification

**27 August 2026. No repository file modified. Awaiting approval.**

Second planning pass on TRUST-ARCHITECTURE-REVIEW.md, reduced to the smallest
version of the service that can responsibly be sold for £995.

Full version: https://claude.ai/code/artifact/f5944407-26a1-41f3-b49c-c0795b5315fd
Source review: https://claude.ai/code/artifact/a57bdfbf-d73e-4212-a16f-253fa5e4f73c

**Accepted:** Direction Note · £500/£495 · three client decisions · publish the
concepts · fix the genuine blockers.
**Amended:** no `/what-happens/` page · provenance labels instead of an
"early studio" trust message.

---

## A. Launch blockers

### A1 — Decisions only Alexander can make

| # | Decision | Recommendation |
|---|---|---|
| 1 | Legal form — sole trader or limited company | None; turns on tax and risk appetite. The whole terms page hangs from this line. |
| 2 | Address for service of notices | Most likely to stall you, because the honest answer is usually a home address. A registered-office or mail-forwarding service solves it cheaply. Decide the route, not the wording. |
| 3 | VAT position | Almost certainly "not registered", but it is your fact to state and the threshold should be checked, not assumed. If not registered, £995 is £995 and one short line says so. |
| 4 | Licence Q1 — perpetual or ends with Care? | **Perpetual.** Tying it to a monthly payment turns "it is yours" into "it is rented" and contradicts Care being optional. Costs nothing real. |
| 5 | Licence Q2 — may another developer modify it? | **Yes**, for that one website, for her own practice. Refusing makes "it is yours either way" untrue and is unenforceable. The protection you need is the resale ban, a separate clause. |
| 6 | Licence Q3 — second website? | **No** — a new licence. Nobody is surprised by it. |
| 7 | Questionnaire — approve or replace | **Approve the existing draft.** It is good and holding it open blocks the intake. Two later additions: the express-begin acknowledgement, and the Direction Note turnaround. |
| 8 | Is full payment offered at all? | **No, not at launch.** One structure, one sentence, zero drift. Accept a single payment case-by-case in writing without publishing the option. |
| 9 | Checkout, or the written route? | **Written route as primary** — name the design → written scope → payment link. Removes the dead button without needing self-serve checkout, and describes how you will actually run the first projects. |

Also decide in the same sitting: **professional indemnity insurance**. Not a hard
blocker, but you will be hosting client sites and being asked with no answer
costs more than the premium.

### A2 — Facts to supply (all into `_data/legal.yml`)

`identity.legal_name` · `identity.address` · `tax.vat_position` ·
`data_protection.ico_registration` · `email_provider` · `accounting_provider` ·
`transfer_mechanism` · `enquiry_retention` · `project_retention` ·
`statutory_retention` · `security_measures`

Notes: confirm ICO registration via the ICO's own self-assessment rather than
reasoning it out — the enquiry route stores nothing, but email, files and
accounting are still processing. Describe only security controls you actually
operate; if the honest list is thin, turn on 2FA and disk encryption first and
then describe that.

### A3 — Requires UK legal review

**Launch-critical:** consumer/business classification and the distance-selling
cooling-off treatment · the express-request-to-begin wording and its waiver ·
the cancellation ladder as published · the licence clause once Q1–Q3 are
answered · the liability cap · whether a model cancellation form must be supplied.

**Can follow:** any ADR route to be named · whether twelve months of included
Care creates a continuing obligation better described differently.

Short engagement, not a project: the documents are drafted and the questions are
specific. **Send it first** — longest lead time, no dependencies.

**The draft notices stay until it returns.** Removed by `legal.approved: true`,
once, on the day the review lands. Never by deletion or page by page.

---

## B. Minimum process

Three client decisions: **01** choose the starting direction · **02** approve how
it is being tailored · **03** approve the finished website.

| # | Stage | Client | Alexander | Deliverable | Approval | Retained |
|---|---|---|---|---|---|---|
| 01 | Enquiry | Names the direction and where the practice is up to | Replies in 2 working days with a recommendation, or says he is not right | Written reply naming direction, scope, price | None | Enquiry + reply |
| 02 | Confirmation & **£500** | Reads scope and terms, pays | Sends written scope confirmation + payment link + questionnaire | Engagement confirmation (template exists) + Stripe receipt | Contract formed; project not begun | Confirmation, Stripe record, terms version |
| 03 | Questionnaire & materials | Completes intake (~1 hr), sends words/images/details | Reads it properly; returns specific questions rather than guessing | Completed intake; asset register | None | Intake, four acknowledgements, assets with provenance |
| 04 | Intake check & start date | — | Confirms complete in 2 working days; gives start date + launch window | Dated written confirmation | **Gate — Alexander confirms** the start, not the design | Confirmation and its dates |
| 05 | **Direction Note** | Replies in 5 working days: approved, or one message of changes | Sends within 5 working days of a complete intake | The Direction Note, one page | **Decision 02 — explicit, in writing.** One revision included; either party may end it here | Note, approval, any revision |
| 06 | Build & round one | Reviews the whole private version, sends one prioritised list | Builds to the approved Note; confirms in writing what is in scope before the round opens | Private working version, link only she has | None — feedback, not a gate | Feedback list, in-scope confirmation, version history |
| 07 | Round two, final approval & **£495** | Sends final list; approves in writing, confirming she has checked fees, qualifications, registrations, contact details | Completes the round, runs pre-launch checks, invoices **on receipt of that approval** | Finished website + list of what was checked | **Decision 03** | The approval email verbatim; check results |
| 08 | Launch, handover, aftercare | Nothing | Points domain, launches, issues handover guide, starts 30-day corrections and 12 months Care | Live site · handover and care guide · continuity note | Already given at 07 | Handover as issued, launch date, month-11 diary reminder |

**Records.** One folder per client on the existing `_New Client Template` stage
folders: enquiry · engagement and payment · intake and assets · direction note ·
rounds · approval · launch and handover. A document with no obvious home in that
list is probably a document you do not need.

---

## C. Direction Note — specification

One landscape page (1440×810) on the existing document system: Newsreader +
Instrument Sans, studio palette. A new template, not a new design project.

### Three rules that define it

1. **It contains no picture of the website.** A mockup turns Decision 02 into an
   early unstructured Round One — she reviews the layout instead of agreeing the
   reasoning, and the Note's purpose collapses. Palette and typefaces are shown
   because those are decisions rendered, not layouts proposed.
2. **It is written in her language.** Every noun for what she does comes from her
   intake. If she wrote "long-term work" you do not write "depth-oriented
   practice". Test of field 01: she reads it and thinks *yes, that is it*, not
   *that is interesting*.
3. **It is not Practice Clarity.** No personas, positioning statement, brand
   values, competitor reading or "your why". If a field tempts you that way, the
   practice may genuinely need Practice Clarity — a conversation, not a section.

### Fields

| # | Field | Cap | Purpose |
|---|---|---|---|
| 00 | Header | fixed | Practice name · direction · date · "Direction Note · for approval". Announces a decision, not a report. |
| 01 | What I have understood | ≤70 words | Her practice written back to her. Reflected, not reframed. |
| 02 | Who the website is speaking to | ≤40 words | The person arriving, and what they need to find first. Not a persona. |
| 03 | The direction, and why it fits | ≤45 words | Name it, two sentences on fit. If it does not fit, say so here — far cheaper than at Round One. |
| 04 | How it is being tailored | 4–6 lines | The substance. One decision + one clause of reasoning each. Draw from palette · typography and wordmark · page rhythm · imagery · the enquiry moment. Only what genuinely moved. |
| 05 | Palette and typefaces | visual | Swatch band + two faces at real size. No moodboard, no reference images, no mood words. |
| 06 | Site structure | ≤5 pages | Pages in menu order, one clause each. Matches the scope exactly — a quiet second confirmation of what she is buying. |
| 07 | What I am deliberately not doing | 2–3 lines | The most valuable field and the first to be cut in a busy week. Prevents the "why no blog / testimonials / booking" conversation at Round Two and demonstrates judgement rather than compliance. |
| 08 | Your decision | fixed | One action, with the consequence of each answer and the dates: reply "approved" and the build starts on *date*; or one message of changes, one revision included. |

### Format and turnaround

- PDF attached to an email whose body carries the approval question in plain
  text, so she can reply "approved" from a phone without opening anything.
- **Not a web page at launch.** A private web version is a second thing to build
  and maintain; the PDF forwards and prints. Revisit after six of them.
- Sent within 5 working days of a complete intake; reply expected within 5,
  matching the published obligation. One revision included.
- ~90 minutes once the template exists. If it takes three hours, the fields are
  too long.

### Worked example — Ashfield Counselling, Rowan Hill direction

Deliberately chosen: the four annotations on the home page tailoring exhibit are
exactly the output of field 04, so this Note is the written half of an asset that
already exists, and it invents nothing. Practitioner left unnamed on purpose.
Palette hexes illustrative.

> **ASHFIELD COUNSELLING** — Direction Note · for approval
> Direction 01 · Rowan Hill — Prepared 27 August 2026 — Reply by 3 September
>
> **What I have understood.** You work with adults on trauma and on the kind of
> difficulty that does not resolve in six sessions. Most of your clients stay a
> long time, and several have tried short-term work first and found it did not
> hold them. You want the website to be honest that this is slow work, without
> making it sound daunting.
>
> **Who the website is speaking to.** An adult who has already had some therapy,
> is considering starting again, and is quietly worried about being handed
> another short course. She needs to know how you work and what it costs before
> she needs anything else.
>
> **The direction, and why it fits.** Rowan Hill is the most unhurried direction
> in the collection, and its pace is doing real work here rather than decoration.
> Nothing on the page hurries the reader, which is the same promise your practice
> makes.
>
> **How it is being tailored.**
> · *Palette.* Rowan Hill's warm greens give way to a cooler, steadier set —
>   warmth reads as encouragement, and encouragement is the wrong note for work
>   measured in years.
> · *Wordmark.* The serif wordmark becomes a spaced sans and the headline drops a
>   size, so a longer, plainer sentence can carry the page without shouting.
> · *Page rhythm.* The three-panel strip below the hero is replaced by fees and
>   availability, because your reader needs the cost before she needs anything
>   else.
> · *Words.* Taken from your intake. "Begin here" becomes what she is actually
>   looking for, not what a website usually says.
> · *Imagery.* One photograph of you and one of the room. No stock imagery.
>
> *Palette:* #F0EFEA · #1E2B2E · #6E7B7E · #8C7A6B
>
> **Site structure.** Home — what you do, who it is for, what it costs · How I
> work — the long-term work explained once, properly · About — you, your
> training, why this work · Fees and availability — plainly, with the waiting
> position · Contact — one route, low demand, no fields you do not need.
>
> **What I am deliberately not doing.**
> · No list of conditions treated. It invites people to check whether they
>   qualify, which is the opposite of what your first page should do.
> · No online booking. A first appointment for this work should be arranged by a
>   person.
> · No blog. You have not said you want to write, and an empty one ages badly.
>
> **Your decision.** Reply "approved" and I start the build on 4 September, with
> the first version to you in the week of the 15th. If something here is wrong,
> send it in one message and I will revise this note — one revision is included,
> and it is much cheaper to change now than later. Nothing is built until you
> have replied.

**Test it against this:** if she read only this page and nothing else, would she
know what she is getting, feel understood, and be able to answer in one word?

---

## D. Website edits for launch

Hierarchy: home → confidence · service → decision · scope → detail · terms →
protection · onboarding → execution. Nothing repeats across two of them.

### On `/what-happens/` — not needed

Every piece of it was placed. The three decisions fit the service page's existing
"How it runs" strip at the same size, replacing five stages with three; the six
pieces of work between them become quiet connective text. The detail a process
page would carry — what is retained, the gate names, the full ten stages —
already has a home on the scope page.

The one item with no obvious home was **what happens if the answer at a gate is
"no"**. It fits as microcopy under each decision: *"one revision included"* under
02, *"the balance is not payable until you do"* under 03. Three clauses, not a
page.

**So: no new page.** If people later ask the same question twice before
enquiring, that is the evidence that would justify one — build it then.

### BLOCKER

| Page | Problem → change | Why |
|---|---|---|
| Seven files | Three contradictory payment statements → one sentence: **"£500 to begin. £495 when you approve the finished website, before it goes live."** Files: `index.html` ×2, `service.html` (headline, price block, meta description), `services/practice-website.html` (price line, process step 2), `_includes/practice-website-buy.html`, service-terms cl. 3, `README.md`, `IMPLEMENTATION.md`. Drop the "one payment instead" option entirely. | A contradiction about money is the fastest way to lose a careful buyer, and the meta descriptions carry the old wording into search results. |
| Legal pages | Eighteen placeholders + draft notice → eleven facts into `_data/legal.yml`; `approved: true` only when the review returns. | The proposition rests on the terms being readable. Failing your own invitation to read them is worse than not issuing it. |
| Buy component, contact, service, scope | Disabled "not open yet" button → the written route stated positively: name the design, receive a written scope, receive a payment link. | A greyed-out control reads as a business that is not running. The written route is how you will actually run the first projects. |
| Service FAQ · scope · terms cl. 13 | Ownership described three times around three unanswered questions → single settled wording after decisions 4–6. | The clause a careful buyer reads most closely; publishing around an open question is how three copies drift. |
| Questionnaire | Draft notice on the first thing a paying client touches → `questionnaire_approved: true`. | She has just paid £500. Wrong moment to show a work-in-progress. |
| Cancellations · scope | Current ladder → the five-row version restated against £500/£495. | Shorter and easier to honour. Publish after the review confirms the consumer position. |

### HIGH VALUE

| Page | Change | Why |
|---|---|---|
| Service | Five-stage strip → three decisions, "if you say no" microcopy, Direction Note named in 02 | This is where the decision is made |
| Scope | Ten steps → Note at 05, four gates marked, payment corrected; Direction Note added to Included | Detail belongs here; a new deliverable in Included is the concrete answer to "what does £995 buy" |
| Work | Live links on the published four + provenance label on every plate | Largest gap between what exists and what a buyer can see |
| Home | Four-step strip relabelled to agree with the service page | Home carries confidence, not process |
| Service | "Can I edit it myself?" FAQ + one block on what the year after launch costs | Top-three practical questions with honest answers that already exist in pieces |
| Contact | Three lines: I reply in two working days · I say if I am not right for it · nothing is agreed until it is agreed in writing | Three lines at the point of raising a hand |

### LATER

`/what-happens/` (not needed) · the About "studio is early" paragraph (dropped;
provenance labels do this job without anxiety, and contracting identity lands in
terms and footer) · client project record (no project to record yet) · VAT line
(only if registered).

---

## E. Portfolio publication plan

Four live, in this order. Ranking is **strategic** — `Desktop/Sites/Concepts` is
not connected to this session, so the builds were not inspected.

| # | Concept | What it proves that nothing else does |
|---|---|---|
| 1 | **Rowan Hill** | The direction most buyers will choose, and the one the home page uses as the tailoring exhibit. If only one is live it has to be this — the Ashfield exhibit stops being an illustration and becomes a demonstration. |
| 2 | **Different Minds** | The opposite pole. Rowan Hill alone proves you can do calm; Different Minds beside it proves the collection is a range rather than a recolour — the premise of the offer, and the thing a sceptic doubts. |
| 3 | **Stillpoint** | Second solo-therapist direction, compositionally distant from Rowan Hill while serving the same buyer. The moment "collection" becomes true for your largest group of prospects. |
| 4 | **Harbour** | The hardest structural problem — one page addressing a parent, a teenager and a school. Strongest evidence of capability rather than taste. |

**Deferred.** *North & Vale* — you have diagnosed V1 as reading like an annual
report and commissioned a V2; publishing work you privately judge weakest is an
odd first impression. *Common Ground* — good, but nothing it proves is urgent
once Harbour is live; natural fifth. *Face to Face* — already deployed, and the
only piece carrying real disclosure risk (an unofficial redesign of a named, real
charity). Keep it where it is, give it its own label, and do not make it one of
the first four a buyer meets.

### Provenance labels — one field, three places

| Label | Applies to |
|---|---|
| **Studio Practice — fictional brief** | Rowan Hill, Stillpoint, Harbour, Common Ground, Different Minds, North & Vale |
| **Studio Practice — unofficial redesign concept** | Face to Face. Needs an explicit unaffiliated / not-commissioned line. |
| **Live Practice — the studio's own** | Alexander Watson Counselling |
| **Client Work** | Reserved. Unused until true. |

Becomes a field in `_data/collection.yml`, rendered on the `/work/` plate, the
concept site's notice and its footer. One source, so it cannot drift.

### Readiness checklist — the same six checks per concept

1. Concept notice near the top of **every** page, carrying the label and linking
   to the studio. Build it once as a shared component.
2. `noindex` every page, no sitemap, robots configured.
3. No real domain, telephone, postcode, coordinates or mailbox. Forms
   demonstrably inert.
4. No invented registrations, qualifications, insurance, testimonials or clinical
   claims — check the footer too.
5. Responsive and WCAG AA at the three breakpoints, through your own QA rather
   than by eye.
6. Deploys reproducibly from a documented command, on an assigned subdomain.

The first concept is the expensive one (notice component, subdomain pattern,
deploy runbook). Connect `Desktop/Sites/Concepts` and the four builds can be
assessed against this list.

**One judgement for `/work/`:** eight plates with four carrying a prominent "View
the site", or only the four live? Eight-with-four risks the unlinked reading as
weaker; four-only risks reading as thin. Inclination: keep the eight and make the
live action visually dominant. Revisit once you see it.

---

## F. Deliberately NOT doing

- New portfolio concepts.
- The North & Vale V2 rebuild. A craft project, more enjoyable than any launch
  work, which is exactly the risk.
- Broadening beyond therapists.
- Any redesign of the studio site. Nothing in either review is a design problem.
- New pages of any kind, including `/what-happens/`.
- Additional tiers, bundles or a cheaper entry offer. The pressure to add a cheap
  tier arrives when you have no clients, and it is always wrong then.
- The client project record.
- A web version of the Direction Note. Build the PDF, run six, then decide.
- Stripe subscriptions for Website Care — no renewal exists for twelve months.
- Server-side form handling. The mailto route is adequate at present volume and
  is why the privacy notice is short and true.
- Analytics, email list, lead magnets, funnels.
- Rebuilding the Practice Clarity and Master Templates PDFs for the retired
  typefaces. Real debt, not launch debt.
- Case studies or process write-ups of the concepts. The sites are the argument.
- Any invented social proof, including softened forms ("trusted by therapists",
  "practices like yours").
- Volume marketing. Your own cohort, placement colleagues and supervisor is
  cheaper than anything you could build and fits two sites a month.

---

## G. Implementation order

**Phase 1 — desk work, no code**
1. Reconcile `OPEN_DECISIONS.md` against the settled offer (still names the
   retired two-route structure, ~£2,000, £290 Care, `main.css`). *20 min.*
   Do this first or an implementation pass will faithfully reintroduce them.
2. Make the nine A1 decisions; write them where the terms can cite them. *1 evening.*
3. Fill `_data/legal.yml`. *30 min.*
4. **Send the drafted legal set to a UK commercial solicitor** with the eight A3
   questions. *1 hour + wait.* Longest lead time, no dependencies.

**Phase 2 — make it honest**
5. Payment wording across seven files; run the price-consistency check. *1 hr.*
6. Replace the disabled buy control with the written route, all four places. *1 hr.*
7. Approve the questionnaire; `questionnaire_approved: true`. *30 min.*

**Phase 3 — make it real**
8. Build the Direction Note template + the Ashfield reference copy. *Half a day.*
9. Publish Rowan Hill end to end, incl. shared notice component, subdomain
   pattern, deploy runbook. *Unknown until the builds are inspected.*
10. Publish concepts 2–4 against the six checks.
11. Provenance labels into `_data/collection.yml`; live links on `/work/`. *2 hrs.*

**Phase 4 — make it clear**
12. Service page: three decisions, Direction Note in 02, "if you say no" microcopy. *2 hrs.*
13. Scope page: Note into Included, gates marked, payment corrected. *1 hr.*
14. Home strip aligned; contact page's three lines. *1 hr.*
15. "Can I edit it myself?" + year-after-launch costs. *1 hr.*

**Phase 5 — when the solicitor returns**
16. Apply reviewed wording · `legal.approved: true` · publish the cancellation
    ladder and licence clause · express-begin acknowledgement into the
    questionnaire. *Half a day.*

**Phase 6 — before the first client, not before launch**
17. Continuity note · Care runbook · insurance decision · refund arithmetic
    method · project folder shape. *Half a day.*

**Then stop building and sell.** Everything remaining — the project record, the
second wave of concepts, a process page if one proves necessary — waits until a
real project shows which of them you actually miss. You will guess wrong about at
least one, and one client is cheaper than three weeks building the wrong thing.

# Trust architecture review — the £995 Therapist Website

**27 August 2026. Nothing in the site was modified.** This is the approval
document for the trust/process pass. Implementation is a second pass, and only
after the architecture below is approved or amended.

Read against the repository source and the built output at `_site/`, not the
live site.

Full version, with the tables and the journey rail:
https://claude.ai/code/artifact/a57bdfbf-d73e-4212-a16f-253fa5e4f73c

---

## 00. The four findings that matter

1. **The published terms carry a draft warning and unfilled blanks.** Eighteen
   placeholder instances across the four contract pages, resolving to eleven
   unsupplied facts, plus the "Draft — requires review by a UK commercial
   solicitor" notice on every legal page. The whole trust strategy is "the terms
   are published, read them" — and a buyer who does finds a draft. Inviting
   scrutiny and then failing it is worse than not inviting it.
   `_data/legal.yml` · `approved: false`

2. **Payment says three different things.** Home + `/service/`: "Half to begin,
   half at launch." `/services/practice-website/` step 2: "You pay in full."
   `_includes/practice-website-buy.html`: "Paid here in one payment. Half now and
   half before launch instead, if you would rather — ask first."

3. **The thing being sold cannot be looked at.** Seven of eight directions link
   to the enquiry form. Only `alexander-watson-counselling` carries an `href`.
   The plates are pictures of websites. `work.html:61` · `_data/collection.yml`

4. **Nothing is shown between the money and the finished website.** Pay →
   questionnaire → intake check → start date → build → Round One. Two to four
   weeks committed with nothing seen, and the FAQ says a change of direction
   after the build starts is "a new brief rather than a revision, and is quoted."
   This is a structural risk in the service, not a copy problem.

None of the four is fixed by adding reassurance to the site. Three are half-built
already; the fourth needs one small new deliverable.

---

## 01. Trust audit

### Already working — do not disturb

- Price published, and the page names the norm it is breaking.
- Exclusions as visible as inclusions: "Anything not listed as included is not
  included."
- The questionnaire refuses client information. This is the strongest signal on
  the site that you understand the profession — a behaviour, not a claim — and
  it currently sits on a `noindex` page nobody sees before buying.
- Website Care under-claims deliberately (no uptime guarantee, no monitoring, no
  backups claimed).
- The purchase-complete page tells the buyer it proves nothing.
- Obligations run both ways with numbers: you 2 working days, her 5; dormancy
  30/60.
- "If I am not the right person, I will say so" — three occurrences — plus
  Practice Clarity actively telling people not to buy it ("I would rather you
  kept the £500").
- The Rowan Hill → Ashfield exhibit shows design *reasoning*. Best asset on the
  site for justifying the price.
- "The training is not a design credential… that is the whole of the claim."
- The site is its own portfolio, and the craft is consistent across every route.

### Hesitations

| # | Hesitation |
|---|---|
| H1 | Draft notices and blanks on the contract pages; the questionnaire also carries a draft notice pointing at `OPEN_DECISIONS.md`. |
| H2 | No trading name, legal status, address or VAT position anywhere. |
| H3 | Buy button disabled everywhere: "not open yet". |
| H4 | Cannot open any of the eight designs. |
| H5 | "Can I edit it myself?" answered nowhere. |
| H6 | Continuing costs true but scattered across four places. |
| H7 | Three processes with three step counts (4 / 5 / 10) and a fourth framing on purchase-complete. |
| H8 | "What if I don't like it" answered commercially, not structurally. |
| H9 | Sole-trader continuity answered only as a refund, not as what happens to her website. |
| H10 | Absence of clients neither claimed nor acknowledged — silence reads as concealment. |
| H11 | Contact page's entire forward view is "a reply within two working days." |
| H12 | The mailto route can fail silently. Handled well; revisit at volume. |

---

## 02. Risk map — placement

**A** main site · **B** cost/scope/FAQ · **C** checkout or quote · **D** agreement · **E** onboarding

| # | Question | Belongs | Action |
|---|---|---|---|
| R01 | What happens after I pay? | A B E | One canonical picture, visible before paying |
| R02 | Do I pay everything upfront? | A D | Settle (§04), one sentence everywhere |
| R03 | What must I provide? | B E | Keep. Add the honest time cost |
| R04 | What if I don't like the design? | A B D | **GAP** — Direction Note |
| R05 | What if you misunderstand me? | B E | **GAP** — Direction Note is the mechanism |
| R06 | How many revisions? | B D | Keep unchanged |
| R07 | Where do I approve? | A B D | Make the gates explicit and few |
| R08 | What if it isn't working? | B D | Two-line FAQ summary; detail stays in terms |
| R09 | Who owns the website? | B D | Settle the three licence questions first |
| R10 | Who owns the domain? | B | Keep |
| R11 | After launch? | A B D | Keep |
| R12 | If something breaks? | B | Keep; add a response expectation |
| R13 | Can I edit it myself? | B E | **GAP** |
| R14 | What will next year cost? | B | **GAP** — one block, facts already exist |
| R15 | What isn't included? | B D | Keep |
| R16 | How long? | A B | Keep; clarify "from confirmed start" |
| R17 | If I'm slow? | B D | Keep; soften public wording |
| R18 | If you become unavailable? | B D E | **GAP** — needs continuity, not only refund |
| R19 | What happens to my money? | B D | Split makes this a one-liner |
| R20 | Is £995 VAT inclusive? | B D | **GAP** |
| R21 | Who am I contracting with? | A D | **GAP** |
| R22 | Will this satisfy my professional body? | B D | Surface as FAQ — already well answered |
| R23 | What happens to my enquiry details? | A | Keep |
| R24 | Have you done this before? | A | **GAP** — one honest sentence |

Four need something new on the public site (R13, R14, R21, R24) and one needs a
diagram (R01/R07). Everything else already exists or belongs in a document she
only reads if she wants to.

---

## 03. Client journey — ten stages, two additions

Full stage-by-stage detail (what she does / what you do / what she receives /
what is approved / what if there is disagreement / what to retain) is in the
artifact. The two additions:

### NEW — Stage 05: The Direction Note

Within about five working days of a complete intake, a short written note —
one page, or one private web page — showing how her chosen direction is being
tailored to her: palette, typographic treatment, wordmark, the page plan in
order, and the three or four decisions made, one sentence of reasoning each.

- She approves in writing, or asks for changes once.
- One revision included. If it is still wrong, either party ends it: you retain
  the £500, nothing further is due, she keeps the Note.
- **Cost to you: about ninety minutes, most of it thinking you already do.**
- It converts the largest structural risk into a routine document, gives her
  something to *receive* within a week of paying, and makes the £500 first
  payment obviously fair.

**This is the highest-return item in the whole review.**

### NEW — the project record

One private page per client on your own infrastructure: ten stages, a date beside
each completed one, current stage marked. Hand-updated in under a minute. No
accounts, no logins — an unguessable URL is enough for content containing nothing
sensitive. Makes "there is always a visible next step" a link rather than a
promise, and removes most "any news?" emails.

---

## 04. Payment — recommendation

**£500 to begin. £495 when you approve the finished website, before it goes live.**

Balance triggered by *her approval*, not by your launch.

**Why not full upfront:** asks a stranger to carry all the risk of an unseen
creative outcome; it is what a template shop does, and the positioning is that
this is not a template; it makes every early cancellation an argument about
proportionate retention of £995. The one real argument for it — clients who pay
and vanish — is already handled by dormancy, and a dormant £500 is a smaller
problem than a buyer who never buys.

**Why 50/50 at these points:** her exposure caps at £500 until she has seen the
Direction Note and two full versions; £500 genuinely covers intake, tailoring,
the Note and the first build round; two Payment Links (or one link + one Stripe
invoice) — no subscription, no webhooks, no backend; the balance becomes the
consequence of a decision she made rather than a toll on something she wants.
Cash flow cost at two projects a month: about £1,000 in transit.

Offer full payment as the *option* on the scope page only ("pay it in one payment
instead if you would rather"), never as the default.

**Rejected:** full upfront (revisit in a year with real launches behind you);
three stages (more chasing, not worth it at £995); deposit + monthly (turns
bounded work into a subscription); pay on completion (removes the intake
discipline that makes the process work).

---

## 05. Checkpoints — three decisions, four gates

Ten stages, but only **three decisions the client makes**. Say that instead of
showing ten steps — it is calmer, shorter and true.

1. **Which direction** — before any money, from eight websites she can open.
2. **Whether the Direction Note is right** — about a week in. One revision. Either party may stop.
3. **Whether the finished website is right** — after two rounds. Nothing launches without it, and the balance is not due until she gives it.

Public framing, in your register:

> **You see where it is going before it is built.**
> Three points where you decide something, and the last one is the only one that
> launches anything. Between them, the work is mine.

Note what this avoids: it never says "you don't hand over your money and hope."
Naming the fear is defensive, and defensiveness reads as having something to
defend. State the structure; let the reader draw the conclusion.

**The four gates, for internal use:**

| Gate | What passes | Whose | Recorded as | If refused |
|---|---|---|---|---|
| G1 | Intake complete → start date | Yours | Dated written confirmation | Specific questions returned; clock does not start |
| G2 | Direction Note approved | Hers | Written approval | One revision, then either party may end it |
| G3 | Finished website approved | Hers | Written approval naming what she checked | Balance not payable; work may be taken as it stands |
| G4 | Launch | Hers | Launch date; handover issued | Held |

Everything else is progress, not permission. Ten equal steps look bureaucratic;
four gates look governed.

---

## 06. Disagreement and failure

**Five principles**

1. Say it early, in writing.
2. Her money is never more than one stage ahead of the work.
3. Nothing is charged that was not quoted first.
4. Taste, scope and fit are three different disputes — revision rounds, a written
   quote she can decline, and ending the contract, respectively.
5. No satisfaction guarantee. A process guarantee instead. "You will love it" is
   not a promise you can keep; "you will see it and agree it before it is built"
   is.

**Refund ladder against the split**

| Point reached | Paid | Refunded | Reasoning |
|---|---|---|---|
| Before start date confirmed | £500 | £500 less fee | No work carried out |
| After start, before the Note | £500 | Proportionate | Show the figure and how it was reached |
| After the Direction Note | £500 | Nil | She holds a completed deliverable |
| After the first version | £500 | Nil | Balance not payable; work may be taken as it stands |
| After launch | £995 | Nil | Delivered; 30 days of corrections; statutory rights unaffected |

Shorter and easier to say out loud than the current ladder, because the split has
done most of the arithmetic.

**Scenario handling** (full table in the artifact): she changes her mind; dislikes
the Note; dislikes the build; you misunderstood (your error, your cost, outside
the two rounds); out-of-scope requests; she goes quiet; you cannot continue; a
post-launch fault; mutual ending.

### ⚖ Needs a UK commercial solicitor before publication

Not my judgement to make, and nothing above is legal advice:

- Consumer vs business classification and the 14-day distance-selling regime.
- **The express request to begin and the waiver that follows it** — the
  questionnaire acknowledgements are the natural place. Do not draft this
  yourself; the wording is the whole of its effect.
- Model cancellation form, and whether one must be supplied.
- The licence terms — the three questions in `OPEN_DECISIONS.md` §2 are still open.
- The liability cap (currently a placeholder).
- VAT position, and whether £995 is stated inclusive or exclusive.
- An ADR route, if one should be named for consumers.
- Whether twelve months of included Care creates any continuing obligation that
  should be described differently.

**The review has to happen before the checkout opens.** The terms are
load-bearing for the entire proposition.

---

## 07. Website changes

Full KEEP / REFINE / ADD / REMOVE / MOVE table by page is in the artifact. Summary:

**Home** — KEEP hero, plates, "The short version", the Ashfield exhibit, "Who
makes it". REFINE the payment note and turn the four-step "How it works" into the
three decisions. ADD nothing; resist adding trust material here.

**/service/** — KEEP the price block, three columns, full-scope disclosure, Care
pair, Practice Clarity section, "Some projects are not this project". REFINE "How
it runs" to include the Note; reorder the wrong-direction FAQ to lead with the
checkpoint. ADD continuing costs, "Can I edit it myself?", "What if you are
unavailable?", VAT.

**/services/practice-website/** — KEEP the page; length is correct *here and
nowhere else*. REFINE the ten steps (Note inserted, gates marked, payment
corrected) and the cancellation summary. ADD the Note to Included. Ownership
section only after the licence questions are settled.

**/work/** — ADD live links for the seven directions, under the concept rules
already set (concept subdomain, persistent notice, noindex, no real business
details, inert forms). Two plate actions, with "View the site" primary.

**/contact/** — KEEP "that is genuinely the whole brief". ADD three lines of
forward view. REFINE the third "worth knowing" to point at the checkpoints page.
REMOVE the disabled buy control.

**/about/** — KEEP everything. ADD one accountability paragraph.

**NEW /what-happens/** — the canonical checkpoints page, linked from home, cost,
scope and contact. One page linked four times keeps every other page shorter,
which is how the restraint requirement gets met structurally rather than by
writing less.

**Legal pages** — REMOVE the draft notices by completing the review, never by
deleting the notice. ADD the eleven facts to `_data/legal.yml`.

---

## 08. Sections needing rewriting

1. Every payment statement — `index.html` (×2), `service.html` (headline, price
   block, meta description), `services/practice-website.html` (price line, process
   step 2), `_includes/practice-website-buy.html`,
   `_pages/service-terms-practice-website.html` cl. 3, `README.md`,
   `IMPLEMENTATION.md`.
2. Home "How it works" strip → three decisions.
3. `/service/` "How it runs" → five stages including the Note, gates marked.
4. Scope page ten-step process.
5. FAQ "What if I choose the wrong direction?" → reordered.
6. Cancellation summary and the cancellations page ladder.
7. About accountability paragraph — **new**. Substance: independent designer in
   Greater Manchester; the studio is early and the collection is Studio work
   rather than commissioned client sites; the counselling site is your own and is
   live; the price is published and the scope is fixed so being early costs the
   client nothing. No apology, no "founding client" framing, no discount.
8. `/what-happens/` — the only genuinely new writing of any length.
9. The buy component's unavailable state → a positive written route.
10. Questionnaire acknowledgements — after the solicitor drafts the express-request wording.

---

## 09. Do not touch

- The visual system. Nothing here is a design problem.
- Home hero and "The short version".
- The Ashfield exhibit, including its disclosure line.
- "Anything not listed as included is not included."
- The Care covers / does not cover pair. Refuse every temptation to soften an exclusion.
- The purchase-complete honesty block.
- The questionnaire's refusal of client information — word for word.
- "The training is not a design credential… that is the whole of the claim."
- Practice Clarity's refusal to upsell.
- "If I am not the right person, I will say so" — all three.
- The mailto architecture and the no-storage promise.
- The two-round revision definition, including stream-of-messages handling.
- The positioning. Therapists, unchanged.

---

## 10. Missing from the internal process

- **The Direction Note does not exist as a deliverable.** Needs a template on the
  Practice Clarity document system — one page, five fields, a worked example.
  Without a template it will not survive a busy week.
- **No client-facing project record.**
- **The questionnaire is unapproved** and carries a draft notice on the first
  paid touchpoint.
- **No solicitor engaged; eleven legal facts unsupplied.** Gates the checkout.
- **No continuity note per client** — where the code is, how it deploys, the
  domain/DNS arrangement, what a competent developer would need to take it over.
  An afternoon once, a paragraph per project after. It converts "what if you are
  ill?" from an awkward question into a document, and it is the answer that
  actually helps her: a refund does not keep her website online.
- **Refund arithmetic unrehearsed.** You promise to "show how the figure was
  worked out". Decide the method now — stage values or a day rate — so it is a
  policy rather than something invented during an uncomfortable email.
- **Care has no runbook.** TLS, dependency updates, deployments, version history,
  fault fixing — write down how and how often, so the claim stays true in month nine.
- **No insurance decision recorded.** Professional indemnity: decide, and note it
  either way.
- **No VAT position.**
- **Concept sites unpublished.** Seven built, one deployed. The gap between what
  exists and what a buyer can see is the largest unrealised asset in the business.
- **`OPEN_DECISIONS.md` is stale** — still describes the retired two-route
  structure, "around £2,000", £290 annual Care and `main.css`, which no longer
  exists. Reconcile it first or an implementation pass will reintroduce retired
  positions.
- **No diary item for the Care renewal conversation.** "I will write to you before
  the year is up" is a promise with a date attached.

---

## 11. Implementation plan, ranked

### Tier 0 — until this is done the site invites scrutiny it cannot survive

| | Action | Effort | Impact |
|---|---|---|---|
| T0.1 | Supply the eleven legal facts; engage a solicitor for the flagged clauses | Low + £ | Critical |
| T0.2 | Settle the payment structure; one sentence everywhere | Low | Critical |
| T0.3 | Open the checkout, or remove the disabled buttons and state the written route | Low | Critical |
| T0.4 | Settle the three licence questions | Low | High |

### Tier 1 — largest trust gain per hour

| | Action | Effort | Impact |
|---|---|---|---|
| T1.1 | Publish the seven concept sites and link them from the collection | Medium | Very high |
| T1.2 | Create the Direction Note template; add to process and scope | Medium | Very high |
| T1.3 | Build `/what-happens/`, linked from four pages | Medium | High |
| T1.4 | Answer "can I edit it myself" and "what will next year cost" | Low | High |

### Tier 2

| | Action | Effort | Impact |
|---|---|---|---|
| T2.1 | Reframe home and cost-page process strips as three decisions | Low | Medium |
| T2.2 | About accountability paragraph | Low | Medium |
| T2.3 | Contact page forward view; repoint the third "worth knowing" | Low | Medium |
| T2.4 | Adopt the shorter refund ladder in both places | Low | Medium |
| T2.5 | Stand up the client project record | Low | Medium |

### Tier 3

| | Action | Effort | Impact |
|---|---|---|---|
| T3.1 | Approve or replace the questionnaire | Low | Medium |
| T3.2 | Continuity note and Care runbook | Medium | Medium |
| T3.3 | Refund arithmetic and insurance position | Low | Low |
| T3.4 | Reconcile `OPEN_DECISIONS.md` | Low | Low |

---

## Is £995 justified?

Strip the language away and show only deliverables, process, portfolio and price,
and £995 is not merely justified — it is low. A complete tailored website, a
visual identity, five pages set properly, two revision rounds, launch, handover,
thirty days of corrections and twelve months of hosting and maintenance is a
£2,000–£3,000 engagement done badly and £4,000+ done well.

The problem is not the price. It is that the justification is invisible: she
cannot open a single finished example, so she is pricing a promise. Publish the
seven concepts and the value argument makes itself.

Resist itemising and totalling to prove it — that is agency behaviour and it
would undo the calm. And keep "It is not a bonus; it is the end of the job",
which is the right way to handle Care being inside the headline.

## Positioning

Unchanged: therapists. Worth noting what transfers — everything structural (the
split, the gates, the Direction Note, the refund ladder, the record, the
continuity note) is profession-neutral. Only two things are therapist-specific:
the questionnaire's refusal of client information, and the professional-body
clause. The trust architecture is built once; the positioning stays a decision
you can revisit later without rebuilding anything.

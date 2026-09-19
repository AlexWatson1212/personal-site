# Legal facts questionnaire — 19 September 2026

Twelve facts are still empty in `_data/legal.yml`. While they are empty, `/privacy/`,
`/terms/` and the Practice Identity & Website Service Terms publish bracketed notes
addressed to you, in public.

Answer inline. **Leave anything blank rather than approximating it** — a blank field
is honest and the page keeps looking unfinished, which is the point. Nothing below
will be inferred, defaulted or filled in on your behalf.

None of this is legal advice. Q2, Q10 and Q11 in particular are things your
accountant or a solicitor should confirm.

---

## Q0 — ANSWERED, 19 September 2026

**Practice Discovery permanently replaces the Tally intake**, and it takes
**text responses only** — both file-upload fields were removed the same day.

Implemented. `/client/intake/` and every other retired intake address now
redirect to `/client/practice-discovery/`; the Tally page, its data file, its
script and its build specification are preserved, unpublished, in
git history at `e52cb8d`; `https://tally.so` is gone from the
Content-Security-Policy; and the privacy notice names Netlify, Inc. instead.

Nothing below depends on that decision any more. What remains is the twelve
facts, and only you can supply them.

---

## 1. Identity and address

**Q1 — `identity.address`.** The address at which formal notices can be served. It
appears on `/terms/`, the Service Terms and `/privacy/`, next to your name.

It does not have to be where you work: a service address from an accountant or a
registered-office provider is common precisely so a home address is not published.
Give it exactly as it should be printed, including the postcode.

> _Answer:_

**Q2 — `data_protection.ico_registration`.** Are you registered with the Information
Commissioner's Office?

- [ ] Yes — registration number: `________`
- [ ] No, and I have confirmed registration is not required for what I do
- [ ] Not checked yet

The ICO's own self-assessment at ico.org.uk is the place to settle this. If the
answer is "no", the page will say so plainly rather than stay silent.

> _Answer:_

---

## 2. Actual suppliers and data transfers

Name only what you actually use. Each name is published.

**Q3 — `data_protection.email_provider`.** The email and file-storage provider you
actually run the studio on. One answer covering both, or two if they differ.

Examples of the shape wanted: "Google Workspace", "Microsoft 365", "Fastmail for
email and Dropbox for file storage".

> _Answer:_

**Q4 — `data_protection.accounting_provider`.** Bookkeeping software, an accountant,
both, or neither.

- [ ] Software: `________`
- [ ] Accountant (firm name): `________`
- [ ] Neither — I keep my own records in a spreadsheet

> _Answer:_

**Q5 — `data_protection.bank`.** The bank that receives client payments. Named in the
privacy notice as an *independent controller*, not a processor — a bank holds payment
information under its own regulatory duties, not on your instructions.

> _Answer:_

**Q6 — `data_protection.intake_provider`.** Practice Discovery is a **text-only
Netlify form**: no uploads, no third-party embed, no script from anyone else. The
answers a client types are posted to Netlify Forms and appear in your Netlify
dashboard, and nothing else leaves this website.

Most of the legal description is already established from Netlify's own documents
(§5 below) and is written into the privacy notice: Netlify, Inc. is the entity; it
states it acts as processor for customer data; its DPA is incorporated by reference
into its terms rather than separately signed.

What I cannot establish, and need from you:

- [ ] I have read Netlify's DPA and accept that it applies to my account
- [ ] My Netlify plan is: `________` (free / Starter / Pro / other)
- [ ] The account is held in the name of: `________`

> _Answer:_

**Q7 — `data_protection.transfer_mechanism`.** How personal data reaches each supplier
outside the UK.

For **Netlify** this is established (§5): EU Standard Contractual Clauses with the UK
International Data Transfer Addendum deemed executed, plus a claimed EU–US Data Privacy
Framework certification with the UK Extension. I will write that from the cited sources.

What I need is the same for whoever you named in **Q3, Q4 and Q5**:

| Supplier | Where is it based? | Which safeguard do its terms name? |
| --- | --- | --- |
| Email / file storage (Q3) | | |
| Accounting (Q4) | | |
| Bank (Q5) | | |

The answer is usually in that supplier's DPA or privacy page under "international
transfers". A UK-only supplier needs no safeguard — say "UK only" and that is a
complete answer.

> _Answer:_

---

## 3. Retention periods

These must describe what you will **actually do**, not what sounds tidy. The privacy
notice will state them as commitments.

**Q8 — `data_protection.enquiry_retention`.** How long you keep enquiries that never
become projects.

> _Answer (e.g. "12 months, then deleted"):_

**Q9 — `data_protection.intake_retention`.** How long a client's **written answers**
stay in Netlify before you delete them.

This is about text only. There are no uploads to retain, so the 24-hour upload-cache
question that was here has gone with them.

One thing to know before answering: Netlify's Forms documentation **states no
retention period and no automatic deletion**. A submission sits in your dashboard
until you delete it. So whatever you write here is a description of your own
practice, not of a supplier's default — and if you do not do it, the privacy notice
is wrong.

> _Answer (e.g. "Copied into the project folder and deleted from Netlify at launch"):_

**Q10 — `data_protection.project_retention`.** How long project files and correspondence
are kept after a project ends.

Six years is the usual choice because it matches the limitation period for a contract
claim in England and Wales — but that is a reason, not a rule, and it is your decision.

> _Answer:_

**Q11 — `data_protection.statutory_retention`.** The record-keeping period for your
legal form.

For a sole trader, gov.uk states: *"You must keep your records for at least 5 years
after the 31 January submission deadline of the relevant tax year"*, and *"If you send
your tax return more than 4 years after the deadline, you'll need to keep your records
for 15 months after you send your tax return."*

I have not written this in, because it is a statement about your tax affairs and your
accountant should confirm it applies to you as stated.

- [ ] Confirmed — use the gov.uk wording above
- [ ] Different, because: `________`

> _Answer:_

---

## 4. Security measures

**Q12 — `data_protection.security_measures`.** The page currently claims, unqualified,
that: accounts use strong unique passwords and two-factor authentication where offered;
devices are encrypted and kept up to date; access to project files is limited to you and
to any specialist brought in for a specific piece of work, who is told what they may and
may not see.

**Tick only what is true today.** Anything unticked comes out of the page.

- [ ] A password manager, with unique passwords on every studio account
- [ ] Two-factor authentication on email, Netlify, banking and file storage
- [ ] Full-disk encryption on every device that touches client files (FileVault / BitLocker)
- [ ] Automatic operating-system and browser updates
- [ ] Backups — where, and encrypted? `________`
- [ ] A locked screen / device passcode
- [ ] Specialists, when used, are told what they may and may not access
- [ ] Something else worth stating: `________`

Anything you want to add that is true and specific is better than the generic wording.

> _Answer:_

---

## 5. What Netlify's own documents say

Checked 19 September 2026, against Netlify's current published documents rather than
assumed. Cite these back to your solicitor; do not take my summary as the source.

| Fact | What the source says | Source |
| --- | --- | --- |
| Legal entity | "Netlify, Inc." | Privacy policy; DPA |
| Address | Privacy policy gives **101 2nd Street, San Francisco, CA 94105**; the DPA gives **512 2nd Street, Suite 200, San Francisco, CA 94107** | Both — see the discrepancy note below |
| Role | "we process such Personal Data as a processor on behalf of our customer" | Privacy policy |
| DPA | "Our DPA is incorporated by reference in Netlify's terms and conditions" — no separate signature mechanism; it "forms part of the Enterprise Master Subscription Agreement and the Self-Serve Subscription Agreement, as applicable" | GDPR/CCPA page; DPA |
| Transfer order | DPA s.14.2: a Restricted Transfer "shall take place on the basis of the EU-US Data Privacy Framework (\"EU-US DPF\"), or the UK Extension to the EU-US DPF, as applicable". The clauses are the **fallback**: "If the EU-US DPF or the UK Extension to the EU-US DPF is declared invalid, or if Netlify fails to re-certify for the EU-US DPF, then the transfer of Personal Data will be subject to the provisions below" | DPA ss.14.2–14.4 |
| UK fallback | s.14.4: "the IDTA shall be deemed executed between the transferring Customer and Netlify, and the EU Standard Contractual Clauses shall be deemed amended as specified by the IDTA" — reached only on the s.14.2 condition above | DPA |
| Data Privacy Framework | "Netlify, Inc. and Jamstack Innovation Fund have certified to the U.S. Department of Commerce that they adhere to the EU-U.S. Data Privacy Framework Principles", including "the UK Extension to the EU-U.S. DPF" | Privacy policy |
| Storage location | **No region guarantee.** "Your Personal Data may be collected, transferred to and stored by Netlify outside of the country of collection" and "may be processed outside your country or jurisdiction, including in places that are not subject to an adequacy decision" | Privacy policy |
| Forms — retention | **Nothing stated.** No retention period, no automatic deletion. Submissions persist until deleted | Forms submissions docs |
| Forms — deletion | "Once you confirm, your selected submissions will be deleted permanently" | Forms submissions docs |

The upload limits that used to be listed here — one file per field, an 8 MB request
ceiling, a 30-second timeout, and file URLs staying live for 24 hours after deletion —
no longer apply to anything. Practice Discovery takes no files.

**Three things I want to flag rather than paper over:**

1. **The two addresses do not match.** The privacy policy and the DPA give different
   San Francisco addresses. I have not chosen between them. Take the one in whichever
   document is current when you accept the terms.
2. **Netlify's documents make no EU or UK residency commitment for Forms.** Tally's did
   — the old privacy notice said it "hosts form data in the European Union". Nothing I
   reviewed from Netlify says the equivalent, and its privacy statement says the
   opposite direction: personal data "may be collected, transferred to and stored by
   Netlify outside of the country of collection".

   Note the shape of that carefully, because I overstated it twice before correcting
   myself. **The absence of a published commitment is not proof of an absence of
   capability.** I did not find a UK or EU region for Forms; I cannot show there is
   none. So the notice now says only what the source supports: Netlify is based in the
   United States, its privacy statement says data may be transferred and stored outside
   the country of collection, and your answers may therefore be processed outside the
   UK. If you want certainty rather than "may", ask Netlify directly — that is a
   question their support can answer and their public documents cannot.

   Removing the uploads narrows what this means considerably either way: a logo and a
   set of photographs no longer travel with the text.
3. **I could not verify the Data Privacy Framework certification independently, and it
   is the primary mechanism.** The official register at dataprivacyframework.gov requires
   JavaScript and did not render for me. The certification claim is Netlify's own.

   This matters more than I first wrote. My earlier note had the hierarchy backwards —
   I described the Standard Contractual Clauses as primary and the Framework as a
   secondary claim. Netlify's DPA says the opposite: eligible UK transfers take place
   **under the UK Extension to the Framework**, and the clauses apply only if the
   Framework is declared invalid or Netlify fails to re-certify. So an active
   certification is doing the work today, and checking the register directly is worth
   doing before the first client's answers are submitted. The privacy notice has been
   rewritten to mirror the DPA's order and states the fallback condition explicitly.

   It also describes the arrangement without asserting that either mechanism is legally
   sufficient — that is a question for your solicitor, not for a page I wrote.

---

## 6. Tally, after the retirement

**No active Tally integration remains.** Verified by stripping comments from every
file in the active tree and searching the code that is left.

**Removed or retired**

| What | Where it went |
| --- | --- |
| `client/intake.html` — the page that embedded the form | Deleted; in git history at `e52cb8d` |
| `_data/intake.yml` — `tally_url` and the reference pattern | Deleted; in git history at `e52cb8d` |
| `docs/operations/tally-intake-build-spec.md` — 30 references | Deleted; in git history at `e52cb8d` |
| The intake half of `assets/js/client.js` — the `?ref=` reader, the iframe loader and the `Tally.FormHeightChanged` listener | Removed; the previous version is in git history at `e52cb8d` |
| `frame-src https://tally.so` in the live Content-Security-Policy | Now `frame-src 'none'` — nothing on this site frames a third party |
| The Tally wording in `_pages/privacy.html` | Replaced with Netlify Forms wording |

**Kept on purpose, as the record of an abandoned approach**

Comments in `assets/js/client.js`, `netlify.toml` and `_redirects` say what was
removed and why, so that somebody who finds a redirect from `/client/intake/` can
learn where it went. Prose in `README.md`, `IMPLEMENTATION.md`,
`OPEN_DECISIONS.md`, `DECISION-REGISTER.md`, `docs/founding-practices.md` and
`docs/operations/client-email-templates.md` records the decision and its reversal.
`docs/operations/practice-fundamentals-intake-system.md` keeps its 27 references
under a banner marking the delivery mechanism superseded — its question design
survived the change, its plumbing did not. `scripts/qa.mjs` names Tally 22 times
in checks that assert its *absence*.

**Not references at all:** `_guides/enquiry-principle.md`,
`_guides/simplicity-principle.md` and `docs/pre-launch.md` match only on
*"acciden**tally**"*; `Claude outputs/README.md` and `docs/proposition-feedback.md`
use *tally* in its ordinary sense.

---

## What happens once you answer

Steps 2 and 3 of the original list are done: the Tally wording is gone and the
Netlify Forms wording, including the transfer position, is written and rendering.
What is left is the data.

1. `_data/legal.yml` filled with exactly what you give me, nothing more.
2. `/privacy/`, `/terms/` and the Service Terms rendered and read back to you verbatim.
3. Confirmation that no bracketed placeholder or author note survives.
4. `STUDIO_REQUIRE_LEGAL_FACTS=true npm test` — currently 97 passed, 1 failed on the
   twelve empty facts, which is the only thing still red.
5. `npm run build`.
6. A report of every changed file and the exact rendered wording.

Nothing committed, pushed or deployed.

**The `approved: false` flag stays false.** Filling these twelve facts makes the pages
*accurate*; it does not make them *reviewed*. A UK commercial solicitor still has to
read the wording before that flag moves, and the test suite fails if it moves early.

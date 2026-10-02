# Copy rewrite: voice and positioning (27 September 2026)

A positioning and copywriting pass, not a redesign. No layout, class, route,
form mechanism, price, instalment, scope item, revision allowance or legal term
was changed. Every figure is still rendered from `_data/purchasing.yml`.
Nothing has been committed, deployed or published.

## The direction

Calm, reassuring authority. Understand the practice, recommend, take
responsibility for the work, and give the client the decisions that are theirs.
Anchor line, used once on the home page: "You make the decisions that matter.
I handle everything else."

Patterns removed across the commercial pages:

- Repeated reassurance ("writing commits you to nothing" ×3, "if I'm not the
  right person I'll say so" ×8, "there are no wrong answers", "not a test").
  Kept once where it is a real commitment (contact page, About, scope page).
- Arguing against other studios ("Most therapist websites start with the
  website" ×4, template rebuttals). Now stated once on About, once as the
  template paragraph on What it costs, once in the template FAQ.
- Explaining the mechanics of the page ("Three columns: …", "That is the whole
  mechanism", "which is why it is long, the price is not").
- Softeners: "genuinely", "honestly", "feel free", "where they are a good fit".
- Em dashes, throughout the commercial pages, components, metadata, alt text
  and aria labels.

## Pages rewritten

index.html, service.html, contact.html, other-services.html,
other-services-enquiry.html, other-services-thanks.html, about.html,
website-design-therapists-stockport.html, work.html (plus the three case pages:
punctuation and titles only), guidance.html and practice-clarity.html (intros,
light), 404.html, links/index.html, services/practice-website.html (opening and
closing only; body punctuation only), _includes/practice-website-buy.html,
_layouts/guide.html (closing CTA line), client/practice-discovery-thank-you.html,
header and footer aria labels, head.html default image alt.

## Punctuation-only pass (no wording or meaning changed)

Legal: _pages/privacy.html, terms.html, service-terms-practice-website.html,
cancellation-and-refunds.html, accessibility.html, _includes/legal-version.html,
_includes/legal-draft-notice.html. Em dashes became colons, commas, semicolons
or parentheses. En dashes in ranges and in "EU–US" were kept (correct usage).

Guides: all em dashes in _guides/ replaced. Four places needed a connective
word to stay grammatical, with no change of meaning:
- before-you-redesign: 'Not "a better website", but something you…'
- consistency-principle: 'Not obvious contradictions, but small moments…'
- counselling-directory-profile: 'Not what you provide, but who you tend…'
- do-you-need-photographs: 'A full shoot, usually not. Here is how…' (was
  "…usually not — and here is how…"), and "…rain-streaked window. A
  prospective client…"
- enquiry-principle: the quoted example sentence "that's completely okay—we
  can explore" became "that's completely okay. We can explore".

Private client pages: client/practice-discovery.html (two dashes),
_data/practice_discovery.yml (hints and labels, e.g. "Website reference 1:
address"), client/photography.html description. Data: collection.yml (Maya
alt text), identity_evidence.yml (three captions/alt texts).

Scripts (visible strings only): the enquiry email subject is now
"Studio enquiry: <name>" (was "Studio enquiry — <name>"); the analytics
button aria-label and one intake validation message.

## Wording that affects commercial promises or client expectations

Read these before approving. None changes a price, scope item or term.

1. First reply includes a recommendation. Home step 01, What it costs step 01,
   the buy component and the contact page now say I reply "with my
   recommendation and the next step" (contact page previously said "with what
   I would suggest and the next step").
2. Smaller-work thank-you page: "usually within two working days" is now
   "within two working days", matching the contact page and enquiry page.
3. Practice Discovery thank-you page now states the scope page's sequence:
   read within two working days, one short message of questions if anything is
   unclear, written confirmation when work on the Practice Fundamentals begins.
   It previously said "I may come back to you with a small number of follow-up
   questions".
4. Contact form, one-page question hint: added "For most private practices it
   is the right place to start. If you are unsure, say so and I'll recommend."
   (Consistent with the existing FAQ answer "For most private practices, yes.")
5. What it costs hero: "I'll confirm the scope and price in writing before
   anything is payable." (Restates the existing term.)
6. Founding section: "What it has not had yet is a real practice going through
   the whole of it" became "The next step is running the whole process with
   real practices, from enquiry to launch." The offer to tell a prospective
   founding client exactly what has and hasn't been done before is kept.
   "Something you would be happy to be quoted saying" became "a comment I can
   quote". "Honest reaction" became "candid reaction".
7. FAQ, editing the site yourself: "I will tell you honestly that I am not the
   right person for it" became "if yours does, I am not the right person for
   it. I would rather tell you that than sell you something you will find
   frustrating."
8. Scope page closing: removed "if the answer is that you do not need me, I will
   say so"; now "Questions first are welcome. Send them with your enquiry and
   I'll answer them in my reply."
9. Counselling training: home and About now say the training gives "a working
   understanding of the profession I design for" / "of what these websites have
   to hold". The About caveat is now "The training is not a design or marketing
   credential, and I don't present it as one." No qualification is claimed.
10. Other services: "Not every request will be a good fit" became "If the
    complete service would serve you better, or the work is outside what I do,
    I'll tell you."

## Left unchanged, for a decision

- `_data/provenance.yml` labels ("Studio Practice — fictional brief" etc.)
  still contain em dashes. They must match the notice on the separately
  deployed concept sites, so changing them here alone would create a mismatch.
- Nav label "What it costs" for the main service page.

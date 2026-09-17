# Product terminology — the words the site uses, and the only ones it uses

Alexander Watson Studio · internal · written 13 September 2026 · **simplified 17 September 2026**

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

One name per thing. Where a page needs to say it differently, the page is wrong,
not the name. The current commercial facts are in `DECISION-REGISTER.md`; this
file only fixes the words.

---

## 1. The product

**Practice Identity & Website.** Written with an ampersand (`&amp;` in HTML body
copy, a bare `&` in front matter and JSON-LD). It replaced **Therapist Website**,
which stays retired and is guarded in `scripts/qa.mjs`.

In running copy the thing a client buys is simply *a website built from Practice
Clarity*. The product name is used where a name is needed (the price, the scope
page, the terms); the explanation leads with the website and the method, not
with "identity".

The route is unchanged: `/services/practice-website/`.

## 2. The four stages (public)

One piece of work in four stages, sold once. The client is never asked which of
them they need.

| # | Name | What happens |
| --- | --- | --- |
| 1 | **Practice Clarity** | The intake is worked into a Practice Clarity document: who the practice is for, how the therapist works, how it should sound, what a visitor needs to understand, what the website has to do |
| 2 | **Agree the direction** | The therapist reads it; it is refined (one consolidated revision); nothing is designed until both agree |
| 3 | **Visual direction and website** | Typography, colour, how the name is set, image direction where needed — then the website, up to five pages |
| 4 | **Refine and launch** | Two consolidated rounds, written approval, launch, handover, the first year of Website Care |

Production contains more steps than this. The public explanation does not.

**Retired on 17 September 2026:** the previous four stages (*Practice Clarity →
Practice Identity → the website → Yours to keep*) and the first step "name the
one you keep returning to". A client is not choosing Sofia, Maya or Daniel.
"Yours to keep" survives only as the name of the handover section
(`#yours-to-keep` on `/service/`, `#keep` on the scope page).

## 3. The documents a client receives

- **Practice Clarity document** — the client's own version of the document
  published with each case study (those are titled *Practice Clarity
  Blueprint*). It is what the client reads, corrects and agrees.
- **Identity guide** — short, lower case, no page count: the visual decisions
  and how to use them.

**Retired:** *Direction Note* (the one-page approval note — the client now
receives the Practice Clarity document itself) and *Practice Identity Guide* as
a named, extensive deliverable.

## 4. Words the site may not use

Enforced by `npm test`.

- **Tier language:** *package*, *bundle*, *upgrade*, "two routes / options /
  tiers", "unlimited revisions".
- **The old name:** "Therapist Website".
- **Open-ended promises:** "unlimited templates/design/applications", "ongoing
  design support", "everything you need", "all your marketing materials", "any
  printed item".
- **The retired identity package:** letterhead, email signature, business card,
  supplier briefs.
- **The retired approval note:** "Direction Note".
- **Portfolio counting:** anything that counts the collection as six.

## 5. What keeps the offer bounded

**Made:** the Practice Clarity document; a short identity guide; the wordmark or
name treatment, colour values and typefaces as files (fonts where licences
permit); the website.

**Not made:** a custom logo or symbol, logo concepts, stationery, print
templates, signage, leaflets or any other designed application. A client who
needs one is quoted in writing. The identity guide gives a supplier what they
need to follow the visual direction.

A custom logo or an extensive brand identity is not assumed to be necessary.
Whether real clients ask for one is one of the things the founding projects are
for (`DECISION-REGISTER.md`, open questions).

## 6. Ownership

The practice identity — the wordmark, the guide, the colour and typography
specifications — is **owned outright** by the client on full payment and may be
given to another designer, printer or developer. The **website design system,
layout and code** remain the studio's and are licensed: non-exclusive,
perpetual, non-transferable, one website, one practice. Clause 13 of
`/service-terms/practice-website/`, flagged ⚖ for a solicitor.

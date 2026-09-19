# Maya Bennett Counselling — build notes
Alexander Watson Studio · portfolio concept

This build is the site aligned to the finished Maya Bennett Practice Identity.
Where these notes and the CSS disagree, the CSS is the defect: every rule stated
here is one the file actually implements, and each is checked by the conformance
run described at the end.

## The mechanism

Bring the unfinished version and something useful happens immediately.

Many half-formed inputs; one steady kind of response. That is the whole site, and
it is deliberately the inverse of the Sofia Marin concept, where one stable account
holds many possible readings. Every decision below answers to it.

The argument the site has to win is about entitlement, not information. The visitor
is not asking what counselling costs; they are asking whether what they have is
allowed to be brought. So the site does not lower the threshold — it argues the
threshold was pointing the wrong way. The unfinished account is not a lesser
account. It may be the better material, because the polished version has already
been edited by the person who needs help with the editing.

The limit matters as much as the claim. The site says the untidy version is more
*useful* — it has not had the interesting parts smoothed out of it yet. It does not
say it is more true. Reassurance in place of that argument is a regression.

## The order

The section order is the Guide's (page 31), and it is part of the argument:

    01  First screen                where the reader is; adults individually,
                                    £60 per 50 minutes, Bristol or online
    02  There isn't a threshold     the position, unchanged, as the largest
                                    sentence on the page
    03  What brings people          eight sentences, answered; then, under a
                                    rule, twelve borrowed search terms
    04  You don't need to prepare   four tidy bars beside five loose cards
    05  What sessions are like      the room, the shape of an hour,
                                    integrative and relational glossed
    06  Maya                        legible rather than neutral; limits inside
                                    the warm passage
    07  Fees, practical, how to start (and stop), enquire

Entitlement is settled before credibility, and credibility before cost.

## Files

```
index.html                                     single page, no build step, no dependencies
robots.txt                                     Disallow: /
_headers                                       X-Robots-Tag: noindex, long cache on /assets/images and /fonts
fonts/fraunces-variable.woff2         121 KB   all axes: opsz, wght, SOFT, WONK
fonts/hanken-grotesk-variable.woff2    35 KB   wght
fonts/ofl-*.txt                                SIL Open Font License 1.1, both families
assets/images/maya-bennett-session-room.webp       1400 × 1050   the room, on the plum section
assets/images/maya-bennett-session-room-700.webp    700 ×  525   small-screen source
assets/images/maya-bennett-portrait.webp            700 ×  875   Maya, beside "I'm not a blank screen"
assets/images/maya-bennett-portrait-350.webp        350 ×  438   small-screen source
assets/images/maya-bennett-social-share.png        1200 ×  630   the Open Graph card
favicon.ico                                      16/32/48       the mark, met, three sizes
site.webmanifest                                               name, ground, the icon set
assets/images/maya-bennett-favicon.svg                         the identity's favicon asset
assets/images/maya-bennett-touch-icon.png           180 ×  180   the mark, met
assets/images/maya-bennett-icon-192.png             192 ×  192   manifest
assets/images/maya-bennett-icon-512.png             512 ×  512   manifest
assets/images/maya-bennett-icon-maskable-512.png    512 ×  512   manifest, maskable safe zone
```

Paths are absolute (`/assets/…`, `/fonts/…`), so serve from the domain root.
Nothing is requested from a third party: no Google Fonts, no preconnect, no visitor
IP address leaving the site. The first screen makes three requests (the page and the
two fonts); the two photographs load as they approach the viewport. All first-party.

The share card is the identity's `06-website/social-share-1200x630.png`, renamed on
deployment. The Open Graph image is a card and not a photograph: a 4:3 room
photograph is cropped by every link preview that shows one, and the card is the only
image drawn to the shape those previews use.

## The device — offered, then met

The eight things people have said are `<details>` elements. Each summary is the
sentence; each panel is Maya's reply.

- The page ships with **every row open**, so with no JavaScript the site is complete:
  eight sentences, eight answers, nothing hidden.
- Where there is script, all but the first are closed on load, so a visitor gets to
  be met rather than told. That is the only thing the script does to the content.
- Native `<details>`: Enter and Space toggle, every row is in the tab order, screen
  readers announce expanded and collapsed. No ARIA is invented for it.
- Above 48rem the reply sits in the second column, level with the sentence. Below
  it, the reply opens directly underneath, where the thumb already is.
- Replies accumulate. Opening one never closes another — a visitor who recognises
  three sentences is answered three times.
- Sentence and reply are set at the same size, the same weight and the same measure.

The five "genuinely enough" cards are **not** made interactive. They already
answer the question the section asks, and thirteen identical rows would be
repetition rather than argument.

## Equality of measure

The equality rule is a layout constraint, not a style, and it is held by
construction rather than by eye.

A sentence's text begins one mark-width plus one gap inside its column — 2.1rem plus
0.85rem. Stacked, the reply is given the same inset, so its first character sits
directly under the sentence's. Side by side, where the reply's apricot rule sits
flush at the column edge instead, the reply's box stops the same 1.1rem short of the
right: the same measure, arrived at from the other end.

Checked in the browser at 320, 375, 768, 992, 1200 and 1440 px, sentence and reply
are allowed identical measures to the pixel. Measure rendered *text* width instead
and the check will report failures that are not there — a sentence shrinks to its
content, a reply fills its column. Compare the measure each is allowed.

This is the rule a responsive breakpoint breaks first. Re-check it after any change
to the grid.

## Colour rule

**Apricot means one thing: the moment something is met.** It appears in two forms
only — the lens where the two forms of the mark overlap, and the short rule that
introduces a reply. That rule marks every reply on the page, including the form's
confirmation, which is the site meeting what a visitor has just sent. It is not a
general accent, and never a border, fill or highlight. Do not put it on navigation,
on rules, on step borders, on dots, or on card fills; every one of those uses costs
the page the only colour that carries an argument.

    paper / paper-deep   ground; paper deep also carries a loose card
    plum                 the one dark band a statement sits on (sessions)
    plum-ink             text, and the darkest ground (the enquiry, running
                         into the footer)
    lilac                the tidy version nobody has to bring
    lilac-deep + plum-mid  the two forms of the mark
    apricot              met
    blue                 links and focus on light
    butter               "this is your sentence": a loose card on paper; type,
                         links, focus and the one primary action on a dark ground

Plum is one band per surface (Guide page 23). Butter is never a decorative fill: the
pull quote sits on the dark ground, not on butter, and the only butter on paper is
two of the five loose cards, where it means the visitor's own sentence.

Every pairing clears WCAG AA against its actual painted background. No token is declared that the page does not use — `--apricot-ink` and
`--err` were both removed for that reason, and a dead token is how a fifth colour
eventually gets used.

## Type rule

**Fraunces is what the visitor brings and Hanken Grotesk is what Maya says.** The
Guide (pages 26–27) also gives the display headings to Fraunces.

    Fraunces      the headline (the reader's state), the position, section
                  headings (500, 27–41 px) and sub-headings (500, 22–30 px),
                  the eight sentences, the five loose cards, the hero's example
    Hanken        every reply, every label, every fact and number, the ledger,
                  the form, all running prose and the small print

The wordmark is identity rather than voice. Labels marked up as headings (`.label`)
stay in Hanken, because they are labels.

Fraunces carries SOFT and WONK raised, so an offered sentence looks provisional
rather than monumental. Maya's face is plain on purpose: her answers should read as
ordinary, not authoritative.

## The mark

Two forms; one variable — the distance between them, as `--sep`.

Apart is offered and there is no overlap. Closed is met and the overlap is apricot.
There is nothing between the two values: `0px` or `34px`. A mark at any other
separation is a defect, not a variant. The mark appears only where that distinction
is true — on each offered sentence, on the hero's example, and on the wordmark. It
is not an eyebrow bullet.

The wordmark is an identity artefact rather than content, so it is always drawn in
the met state — header, footer, favicon and touch icon alike. The offered state
appears only where something genuinely has not been answered yet, and never below
30 px, the size at which the five-unit gap between the two forms still resolves to
one device pixel.

The favicon is `06-website/favicon.svg` — the asset's own bytes, not a redrawing.
A hand-drawn favicon is how a second, slightly wrong mark enters a site: different
radius, different overlap, no clear space, and invisible at 32 px, which is exactly
why it survives. **If the asset changes, re-render the set from it; do not redraw
any member of it.**

It used to be inlined in the page as a data URI, which kept the first screen to
three requests but left the site with no `/favicon.ico` and no manifest — the two
paths a browser and an operating system ask for whether or not the document
mentions them. It is now a file set, all of it that one asset rendered:

    /assets/images/maya-bennett-favicon.svg    the asset itself, served as it is
    /favicon.ico                               16 / 32 / 48, one file
    /assets/images/maya-bennett-touch-icon.png 180, already in the build
    /assets/images/maya-bennett-icon-192.png   manifest
    /assets/images/maya-bennett-icon-512.png   manifest
    …-icon-maskable-512.png                    the same, inside the maskable
                                               safe zone, so a launcher's mask
                                               cannot crop the lens off the mark

The shipped 180 px touch icon and a fresh render of the SVG at 180 px differ by
0.17 of one channel level per pixel, which is the anti-aliasing and nothing else:
the check that the set and the asset are the same mark. The cream ground is part
of the asset, so the icon holds its own against light and dark browser chrome
rather than dropping the plum form into a dark tab strip. The icon requests are
made after the document, so the first screen is still the page and two fonts.

## Motion

Nothing moves unless the meeting changes. The only thing on the page that moves is
the mark closing when a sentence is met — 500 ms, one eased transition on
`transform`. Nothing else travels: no photograph reveals, no fragment staggers, no
settling arrangement, no hero animation, no sliding navigation underline, and no
smooth scrolling. The navigation underline is full width at rest and changes colour
only; hover states change colour only.

Under `prefers-reduced-motion: reduce`, transitions and animations are **removed**
(`transition: none`), not shortened to a near-zero duration that flickers. The
composition is identical and the mechanism still works: the mark arrives at the met
state instantly and the reply appears.

## Photography — evidence, not atmosphere

Two photographs, each answering a strategic point.

    session-room   a practice claiming there is no threshold cannot show a
                   threshold-looking room. The caption carries the reason:
                   "nobody has to look straight at anybody."
    portrait       an invitation to be unedited is only safe if the person
                   receiving it can be read. Framed close, and captioned with
                   the sentence it has to earn.

The hero window-light, the mug-and-glass detail and the notebook were removed, along
with the portrait's original-frame master. The notebook argued against the site — a
blank page and a sharpened pencil, beside copy that says you do not need to prepare
— and it was also the Open Graph image. That is now the share card.

Both photographs have `srcset` and `sizes`, so neither is under-resolved on a
high-DPI screen and neither is upscaled beyond its source.

## The enquiry

Two fields and one badly-put sentence. Name and email are required because a reply
needs somewhere to go; the message is not, and its hint says it can be badly put.
There is no third required control: the former consent tick-box was removed, and a
plain line says what the address is used for. A visitor who cannot yet say what is
wrong can send a complete enquiry — name, email, message empty — and it is
accepted, because a form that demands an account before it will take one has
reinstated the threshold the rest of the site spent its argument removing.

Errors are worded, not coloured, and focus moves to the first invalid field. The
confirmation is a reply like any other: Hanken, apricot rule, no second geometry
invented for the occasion.

## Studio disclosure

Portfolio disclosure is chrome, never a floating object. Below 60rem it is a strip
pinned above the page; at 60rem and above it is the vertical tab in the left margin,
clear of the measure. It is on screen at every scroll position and every width, and
a full-scroll sweep at seven widths finds it resting over no text and no control.
The "Professional standing" row in the Maya ledger, the footer statement and the
form's own confirmation carry the rest of the disclosure. No professional body,
qualification, registration number, supervisor, insurer or complaints route appears
anywhere: the Guide (page 10) leaves all of them blank until they are real.

## The phone

The page is one composition at every width, but the phone is where most of this
copy is actually read, and the first build let desktop typography shrink onto it.
Substantive counselling prose was arriving at 15–16 px, spacing was set for a
16 px line rather than a 17 px one, and several real targets were tappable
without being comfortable.

The fix is one block at the foot of the stylesheet, `max-width:47.99rem`, and
three raised clamp minimums:

    prose            17 px          claim, sentences, replies, Maya, the plum notes
    supporting       16.5 px        ledgers, steps, the loose cards, the footer
    captions, hints  15.2 px
    labels           14.4 px        eyebrows, ledger keys, the base line

Only the *minimum* of each step moved. The preferred term and the maximum are
the approved desktop values, so above roughly 820 px every step computes exactly
as it did before and the desktop page is the desktop page. What the pass also
did was replace a scatter of fixed `.85–1rem` font sizes with five prose tokens,
so every reading surface now answers to one place — which is what makes a reading
scale possible at all. Two of those tokens round the old values up by half a
pixel on desktop (`.95rem` → `.98rem` in the footer, the borrowed-terms row and
the enquiry aside) and two line-heights were opened by 0.05. That is the whole
desktop delta.

Targets: the sentence rows carry their own padding and give the same amount back
to the row, so a met list is the height it always was with a 44 px target inside
it; the footer's section links are 44 px rows; the format radios are 24 px inside
44 px labels. The two links that remain under 44 px are inline in running prose,
which is the exception 2.5.8 makes, and the studio strip is 29 px and the full
width of the screen.

Nothing was shortened. The argument needs its length, and a phone is not a reason
to make it thinner.

## Reading options

The site carries the studio's shared Reading control
(`_shared/reading-options/`), **configured off**. The six published concepts are
locked and `docs/reading-control-standard.md` is explicit that the standard is
not a retrofit programme — so this is the capability present and demonstrable,
with the published page still the page that was approved.

    window.READING_OPTIONS = { enabled:false, storageKey:"maya-bennett:reading" };

Set `enabled:true` and it builds one button in the navigation, before the primary
action, and a panel under it: three text sizes and three reading modes, both as
native radio groups. Two attributes on `<html>` carry the whole system —
`data-read-size` and `data-read-mode` — and neither is set unless a visitor asks,
so Default is not a theme that restores the design; it is the design, with
nothing applied.

The scale is four multipliers, not a second type system: reading text moves
furthest, headings a fraction of that, labels and numbers and controls least, so
the largest step is a larger page rather than a zoomed one. Higher contrast pulls
up the quiet end of each pairing and underlines links, so nothing is carried by
colour alone. Softer takes chroma out of the ground and the accents and keeps
every relationship — cream, plum, butter, apricot are all still doing their jobs,
at a lower volume. Both modes clear AA on every pairing at every step. The
preference is kept in the visitor's own browser, applied before first paint, and
transmitted nowhere; with JavaScript off the control is not offered at all,
because a control that cannot work should not be shown.

## Conformance run

The conformance run — `qa-mobile.py` beside this file, and `_source/qa-website.py`
in the identity pack — renders the page and checks, at 1920 / 1440 / 1200 / 1024 / 992 / 768 / 430 / 390 / 375 / 360 / 320 px:
console clean and third-party requests zero; no horizontal overflow; exactly two
mark states and no third; no reply larger, heavier or wider in measure than its
sentence; target sizes against WCAG 2.2 AA 2.5.8; every reply present with
JavaScript off; `transition-duration: 0s` under reduced motion with the met state
still reached; keyboard operation with a visible focus ring; replies accumulating;
worded errors with focus moved on an empty submit; and a name-plus-email enquiry
with an empty message succeeding, and no third required field.

`qa-mobile.py` is the half of that run this repository can execute on its own:
the eleven widths, the computed type scale at each, horizontal overflow, target
sizes, console and third-party requests, the page with JavaScript off, reduced
motion — and, with the Reading control switched on in a scratch copy, all nine
combinations of size and mode at 375 / 430 / 1200, each checked for overflow and
for AA on thirty-four pairings. Run it with `python3 qa-mobile.py`.

## Notes for handover

- The enquiry form validates in the browser and posts nowhere. Wire the `submit`
  handler to a real endpoint and keep the error behaviour (message text, focus move
  to the first invalid field, `role="alert"` nodes).
- `noindex, nofollow` is set in the page, in `_headers` and in `robots.txt` while
  this is a concept. Remove all three for a live site.
- The five "genuinely enough" cards are the Guide's off-register set (page 30):
  paper deep or butter, a 3 mm radius, no outline, each at its own indent and a
  small static rotation under 2°, beside the four uniform lilac bars. They are
  never animated into place, and straightening them is a change to the content.
- Before this becomes a real practice, supply the Guide's page 10 items (body,
  registration, qualification, insurance, supervision, complaints route, data
  protection and retention) and put them where the "Professional standing" row is.
- The Reading control is off. If a real practice wanted it, `enabled:true` is the
  whole change; then say one paragraph about it in the Website Handover and Care
  Guide, so the client can tell an enquirer it is there.
- The icons are renders of one asset. Re-render, never redraw — `qa-mobile.py`
  will not catch a second, slightly wrong mark, because a wrong mark is still a
  mark.
- `readme.md` and `qa-mobile.py` do not need to be deployed; `readme.md` is
  currently served at /readme.md.
- The visitor is allowed to be unfinished. The designer is not.

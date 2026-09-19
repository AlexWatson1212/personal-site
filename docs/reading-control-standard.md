# The Reading control — a build standard for client websites

Alexander Watson Studio · internal · recorded 9 September 2026
· policy revised 19 September 2026

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

---

## The standard

**Every client build carries the Reading control as a capability, and ships
with it off. It is switched on deliberately, per client, where that practice's
audience and needs make it useful.**

Two decisions, not one, and they are made at different moments:

1. **Build it in.** Not a decision — it is in every build. The shared
   component is inert until an attribute is set, so a site that never turns it
   on is the site it would have been without it, and a site that wants it in
   eighteen months is one line of configuration rather than a reopened design.
2. **Switch it on.** A decision, made with the client, for a reason that can
   be stated in a sentence and recorded in the project. Good reasons are about
   who is doing the reading: an older client group, a practice whose work is
   with chronic pain, fatigue, migraine, brain injury, neurodivergence or
   sight loss, a lot of long-form reading on the site, or a client who simply
   wants it. "Every site should have one" is not a reason, and neither is
   "it complicates the design".

**Off is the default, everywhere.** No published site gains a visible control
because it is live client work, and none gains one retrospectively: switching
it on is a change to that site, agreed with that client, and recorded.

Concept sites stay off too, unless the concept exists to demonstrate the
feature. Maya Bennett carries the capability, configured off, so that it can
be shown working on request without altering the published page.

## Why it is in every build

The people reading a therapist's website are, disproportionately, reading it
while tired, distressed, medicated, dyslexic, migrainous, on a phone in a car
park, or at an age where small grey type has stopped being legible. A control
that lets somebody make the page easier to read is not an accessibility
add-on for a minority; it is a straightforward improvement to the one thing
the website exists to do, which is let a person work out whether this
therapist might understand them.

It also happens to be the kind of thing a therapist notices and a competitor's
site does not have.

None of which makes it right for every practice's front door. A control that
is on where it is not needed is one more thing on the page to be read, decided
about and dismissed — and the people it would have helped are not helped by a
site that shows it to everyone, only by a site that shows it to them. So the
argument above is an argument for having it ready in every build, and for
raising it in every Practice Clarity conversation. It is not an argument for
switching it on without one.

## What it must do

Four things, and no more:

- **Text size.** At least two steps above the default. Everything reflows;
  nothing overlaps, truncates or scrolls sideways at any step.
- **Increased spacing.** Line height, paragraph spacing and, where it helps,
  letter and word spacing. One control, not four sliders.
- **A calm mode.** Reduced decoration: imagery, motion, colour intensity and
  ornament dialled back so the page is text and structure. It is not a dark
  mode and it is not a high-contrast mode; it is the page with the volume
  turned down.
- **Reset.** One control that returns everything to the designed default,
  clearly labelled, always reachable.

Plus one behaviour:

- **The preference persists locally.** Stored in the visitor's own browser,
  applied before first paint so the page does not flash from one state to the
  other, and never transmitted anywhere. Nothing about it is recorded by the
  studio, by the client, or by anyone else — which also means it introduces no
  new processor and needs no change to a client's privacy notice.

## What it must not do

- It must not be a widget bolted on. No third-party accessibility overlay, no
  floating badge from a vendor, nothing that injects its own styling.
- It must not claim compliance. The control improves a site; it does not make
  it conformant, and no page may say or imply that it does. Conformance is a
  matter of how the site is built, which is a separate and prior obligation.
- It must not be the practice's accessibility answer on its own. The base
  design still has to meet the standard set for the build.
- It must not be positioned as being for a category of person. It is a reading
  control, not a disability feature, and it is labelled as one.

## The visual implementation belongs to the practice

The capability is a studio standard. **The way it looks, where it sits, what it
is called, and how it opens are design decisions made inside each practice's
own identity.**

Harbour's implementation is Harbour's. It is not the pattern, it is one
solution, and copying its placement, its iconography or its motion into another
practice's site would reproduce exactly the sameness the collection exists to
avoid. Two client sites should not be identifiable as studio work by their
reading control.

In practice that means deciding per project: whether it lives in the header, in
a corner, at the foot of the first screen or inside the navigation; whether it
opens as a panel, a row of controls or a short menu; what the calm mode
actually removes, which depends on what that particular design is made of; and
what the control is called in that practice's voice.

## This is not a retrofit programme

The six published concepts are locked, and so is every site already delivered.
This standard governs what goes **into a build** from 9 September 2026 onward,
and what gets **asked** in a Practice Clarity conversation. It changes nothing
on a site that is already live: no delivered site acquires a visible control
because this document exists, and a site without one is not out of date.

A live site gains the control the same way it would gain anything else — the
client asks or agrees, it is recorded, it is tested, and it ships.

## Where it lands in the process

- **Practice Clarity document** (formerly the Direction Note). Raised in every
  project, and the answer recorded either way. If it is on: one line on why,
  one on where it will sit, and one on what it will be called in this
  practice's language. If it is off: the capability is still in the build, and
  the document says so, so a later yes is a configuration change.
- **Build.** The capability is present in every build. Where it is switched on,
  it is tested at every text-size step, in the calm mode, and with the
  preference already stored on a return visit. Where it is off, the check is
  that the page is unchanged by its presence.
- **Handover.** Where it is on, one paragraph in the Website Handover and Care
  Guide explaining what it does, so the client can tell an enquirer about it.
  Where it is off, one line saying it is available and what turning it on would
  involve.
- **Website Care.** It is part of the delivered site, so faults in it are
  faults in the site.

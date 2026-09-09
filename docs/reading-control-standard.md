# The Reading control — a build standard for real client websites

Alexander Watson Studio · internal · recorded 9 September 2026

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

---

## The standard

**Every new real client website includes a Reading control by default.**

It is omitted only where one of two things is true:

1. the client specifically does not want it; or
2. there is a genuine reason it is inappropriate for that practice — a reason
   that can be stated in a sentence, recorded in the project, and defended
   later. "It complicates the design" is not one.

The default is inclusion. The exception needs a reason; the rule does not.

## Why it is a default rather than an option

The people reading a therapist's website are, disproportionately, reading it
while tired, distressed, medicated, dyslexic, migrainous, on a phone in a car
park, or at an age where small grey type has stopped being legible. A control
that lets somebody make the page easier to read is not an accessibility
add-on for a minority; it is a straightforward improvement to the one thing
the website exists to do, which is let a person work out whether this
therapist might understand them.

It also happens to be the kind of thing a therapist notices and a competitor's
site does not have.

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

## This is not a reason to reopen the six portfolio concepts

The six published concepts are locked. This standard applies to **new real
client websites from 9 September 2026 onward** and to nothing else. It is not a
retrofit programme, it is not a reason to reopen a finished concept, and a
concept that does not have one is not thereby out of date.

## Where it lands in the process

- **Direction Note.** Named as included, with one line on where it will sit and
  what it will be called in this practice's language.
- **Build.** Implemented and tested at every text-size step, in the calm mode,
  and with the preference already stored on a return visit.
- **Handover.** One paragraph in the Website Handover and Care Guide explaining
  what it does, so the client can tell an enquirer about it.
- **Website Care.** It is part of the delivered site, so faults in it are
  faults in the site.

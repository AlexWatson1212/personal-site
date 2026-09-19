# Reading options — the shared display-preference control

Alexander Watson Studio · internal · first built for the Maya Bennett concept,
19 September 2026

This is the reusable half of the Reading control described in
`docs/reading-control-standard.md`. It exists so that a second site does not
get a second implementation, and so that turning the capability on for a client
is a configuration decision rather than a build.

## The policy, in four lines

- The capability is **included in every client build** and reusable across them.
- It is **off by default**, everywhere — client sites and concepts alike.
- It is **switched on deliberately, per client**, where that practice's audience
  and needs make it useful, for a reason recorded in the project.
- **No existing published site gains the visible control merely because it is
  live client work.** Turning it on is a change to that site, agreed with that
  client.

A concept stays off unless the concept exists to demonstrate the feature.

**Off costs nothing.** A site that does not switch it on is byte-for-byte the
site it was before, because nothing here paints until an attribute appears on
`<html>`, and no attribute appears unless a visitor asks for one. That is the
whole reason it can be in every build without being on any page.

---

## What is shared and what is not

Shared — this folder:

- the **scale**: three reading steps expressed as multipliers, not a second
  type system
- the **mechanism**: pre-paint application, `localStorage` persistence, the
  attribute contract, the control's markup, keyboard and screen-reader
  behaviour
- the **control's structure**: a button, a panel, two native radio groups

Not shared — decided inside each practice's identity:

- where the control sits, what it is called, and how it opens
- what the colour modes actually do, because they are made of that site's
  palette
- which type tokens the scale moves

The standard is explicit about this: *"Two client sites should not be
identifiable as studio work by their reading control."* Copying Maya Bennett's
placement or Harbour's iconography into a third site reproduces exactly the
sameness the collection exists to avoid. Copy the mechanism; design the control.

## The attribute contract

The whole system is two attributes on `<html>`:

    data-read-size   large | largest      (absent = default)
    data-read-mode   contrast | soft      (absent = default)

Absent means the approved design. Every rule in a site's stylesheet hangs off
one of those two attributes, so "Default" is not a theme that restores the
original — it is the original, with nothing applied.

## Configuration

One object, read by both scripts:

```js
window.READING_OPTIONS = { enabled:false, storageKey:"<site>:reading" };
```

On a Jekyll site, drive it from `_config.yml` or `_data/site.yml` instead, so
the decision lives with the project rather than in a template:

```yaml
accessibilityPreferences:
  enabled: false          # the studio default, on every build
  label: "Reading options"
  storageKey: "harbour:reading"
```

```liquid
{% assign ro = site.accessibilityPreferences %}
<script>window.READING_OPTIONS = {
  enabled: {{ ro.enabled | default: false }},
  label: {{ ro.label | default: "Reading options" | jsonify }},
  storageKey: {{ ro.storageKey | default: "reading" | jsonify }}
};</script>
{% include reading-options.head.html %}
```

To switch a site on, set `enabled: true`. To switch it off, set it back. There
is nothing else to remove: the CSS is inert and the script returns before it
touches the document.

**`enabled: false` is the value a new build starts with, and the value it keeps
unless someone decides otherwise for that client.** Being a real client site is
not that decision, and neither is being a concept. What changes the value is a
reason about the people who will read that practice's pages, recorded in the
Practice Clarity document. Maya Bennett carries the capability, configured off,
so it can be demonstrated on request without altering the published page.

## Files

    reading-options.head.html   the pre-paint script — must run in <head>
    reading-options.css         the scale, the control, and the mode slots
    reading-options.js          the control — build, wire, persist
    reading-options.html        the markup, for a site that prefers it in the
                                template rather than built by script

## Installing it on a site with a build step

1. `{% include reading-options.head.html %}` inside `<head>`, after the config
   object and before the stylesheet. It must be parser-blocking and in the head,
   or a returning visitor sees the default page repaint into their setting.
2. Import `reading-options.css` after the site's own tokens, and fill in the
   two mode blocks with that practice's palette. The file ships with the slots
   commented and empty — an unfilled mode is a mode that does nothing, which is
   the correct failure.
3. Load `reading-options.js` with the site's other script, or inline it.
4. Point the scale at the site's reading tokens: the script sets attributes,
   the stylesheet decides what they mean.

## Installing it on a single-file concept

Paste the three parts into the page, keeping the section comments. Maya Bennett
is the worked example: search that file for `READING OPTIONS`.

## What it must keep doing

Checked on every site that carries it, at every step and in every mode:

- the page does not overflow sideways, and nothing overlaps or truncates
- every text pairing still clears WCAG AA against the colour it is actually
  painted on — including the modes, which are the easiest place to lose it
- the control is operable from the keyboard, with a visible focus ring, and
  Escape closes the panel and returns focus to the button
- the site is complete and usable with JavaScript off, and the control is not
  offered at all in that case, because a control that cannot work should not
  be shown
- nothing is transmitted. The preference is in the visitor's own browser, it
  introduces no processor, and it needs no change to a client's privacy notice
- the control does not claim compliance, does not carry a disability label,
  and is not a vendor overlay or a floating badge

## What it deliberately does not do

- It does not zoom the interface. The scale moves reading text furthest,
  headings a fraction of that, and labels, numbers and controls least, so the
  hierarchy survives the largest step instead of being multiplied out of it.
- It does not offer novelty themes. Two modes, each with a reason.
- It does not use colour alone to show what is selected: the radios are native,
  and the state is in the control, not in a tint.

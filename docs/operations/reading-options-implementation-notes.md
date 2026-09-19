# Reading options — wiring it into a Jekyll site

Alexander Watson Studio · internal · 19 September 2026

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

Read first:

- `docs/reading-control-standard.md` — why the control exists and what it must
  and must not do. That is the standard; this is not.
- `_shared/reading-options/README.md` — the component, the attribute contract
  and the generic install.

This note is the third thing: the studio's own site is the first Jekyll build
to carry the component, and these are the decisions and the gotchas that only
turned up in the wiring. It exists so the second Jekyll site takes twenty
minutes rather than an afternoon.

---

## Where it is switched on and off

One key, in `_config.yml`:

```yaml
accessibilityPreferences:
  enabled: false
  label: "Reading options"
  storageKey: "aw-studio:reading"
```

`enabled: false` is the state this site ships in. With it false:

- the footer emits no mount element,
- `_includes/head.html` emits no config object and no pre-paint snippet,
- `_layouts/default.html` requests no script,
- the CSS is inert, because every rule in it hangs off an attribute that
  nothing sets.

Verified rather than assumed: the rendered home page at 390px is pixel-identical
with the capability off and with it on at Default, everywhere above the footer
row the control adds. The only difference in the built HTML is the absence of
four things that are conditional on that one key.

`storageKey` is per site on purpose. Two studio sites on the same domain would
otherwise share a preference, and a visitor's choice on a therapist's site is
not a choice they made about the studio's.

## The four files this site touches

| File | What it does |
|---|---|
| `_config.yml` | the switch, the label, the storage key |
| `_includes/head.html` | `window.READING_OPTIONS`, then the pre-paint snippet, inline and parser-blocking |
| `_includes/footer.html` | `<div class="footer-reading" data-reading-mount></div>` |
| `_layouts/default.html` | loads `assets/js/reading-options.js`, deferred, beside `nav.js` |

Plus two that carry the implementation:

| File | What it does |
|---|---|
| `assets/js/reading-options.js` | the shared component with MOUNT and GROUPS decided |
| `assets/css/studio.css` §22 | the two mode palettes and the control's skin |

`scripts/build-css.mjs` prepends `_shared/reading-options/reading-options.css`
to `studio.css` before minifying, so the scale and the control's structure stay
in one place and one stylesheet still reaches the browser. A build without the
shared folder warns and produces a working stylesheet without the control.

## The per-project decisions this site made

**Mount: the footer.** Maya Bennett puts the control in the navigation. This
site's navigation panel only exists below 62rem, so a nav mount would be a
control that vanishes on a desktop. The footer is on every page at every width
and is already where this site keeps its meta links. The mount is an empty
element with `data-reading-mount`; the component fills it.

If a future site wants it reachable from the middle of a long page, the honest
options are a navigation mount (where the nav exists at all widths) or a second
mount — **not** two instances of the markup, because two radio groups sharing a
`name` become one group and checking either leaves the other showing nothing.

**Which tokens ride which multiplier.** The component supplies four
multipliers; deciding what they move is the site's job:

| Multiplier | This site's tokens |
|---|---|
| `--read-text` | `--t-body`, `--t-small`, `--t-tiny`, `--t-lead` |
| `--read-head` | `--t-display`, `--t-h1` … `--t-h4` |
| `--read-ui` | `--t-label` |
| `--read-lead` | `--lh-body` |

`--read-ui` is 1 at every step in the shared file. That is deliberate: eyebrows,
step numbers and the control's own labels do not grow, so the control does not
move under the hand that is operating it.

**Modes.** `contrast` raises the written layer and leaves the three surfaces
alone. `soft` lowers paper, lifts ink, closes the gap a little, and stands the
motion tokens down — which reaches every animation in the stylesheet, because
they are the same tokens the reduced-motion preference flips. Both palettes are
in §22 with the measured ratio beside each colour.

## Gotchas worth knowing before the next one

**The hero headline will not appear to scale, and that is correct.** This site
caps it with `min(var(--t-display), 11.5cqi)` so it answers to its column. On a
phone the cap binds, so the largest text step leaves the headline where it is
and grows everything under it. Check this on any site that caps a display size
against a container query — it looks like a bug in the scale and is not.

**Put the config object and the snippet before the stylesheet.** The snippet has
to be parser-blocking and in `<head>`, or a returning visitor watches the page
repaint from the default into their setting on every navigation.

**Check the modes on every surface, not on paper.** This site has three grounds
plus an ink plate, and `--text-faint` on sage is the pairing that goes under
first. Every figure in §22 was measured against the colour it is actually
painted on.

**Do not add anything to the privacy notice.** The preference is two strings in
the visitor's own browser. It introduces no processor and is not personal data,
and the standard says so explicitly. A paragraph about it in a client's privacy
notice implies otherwise.

## Enabling it on another client site

1. Copy `_shared/reading-options/` in, or reference it from the studio repo.
2. Add `accessibilityPreferences` to that site's config, with its own
   `storageKey`.
3. Wire the four files above. Copy this site's versions and change the mount.
4. Express that site's type tokens through the four multipliers.
5. Fill the two mode slots from that site's palette, and measure every pairing
   against the ground it sits on.
6. Design the control in that practice's voice. Per the standard, two client
   sites must not be identifiable as studio work by their reading control —
   copy the mechanism, not the appearance.
7. Test: every size step, both modes, on a phone; keyboard open, choose, Escape,
   focus returns to the button; a return visit opens in the stored state; and
   the site with JavaScript off is complete and offers no control at all.

Per the standard, a real client site is on by default. A concept is off.

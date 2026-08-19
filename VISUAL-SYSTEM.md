# Alexander Watson Studio visual system

This is the single reference for page-level visual decisions. Source rules live in `assets/css/main.css` and `assets/css/visual-system.css`, with the visual-system file remaining authoritative in source order. `npm run build:css` removes unused selectors and creates minified route-specific bundles in `assets/css/`, plus `site.min.css` as a complete fallback. Each page downloads only the styles required by its template while the maintainable source remains unchanged.

The production site self-hosts its existing Instrument Serif and Inter families from `assets/fonts/`. The homepage uses responsive AVIF imagery with WebP fallbacks and preloads only the image the page actually displays.

## Surfaces

| Treatment | Token | Colour | Use |
|---|---|---:|---|
| Paper | `--paper` / `.acw-surface-paper` | `#F7F4EF` | Default page and section background |
| Recessed | `--recessed` / `.acw-surface-recessed` | `#E5E9E3` | Alternating sections and supporting content |
| Ink | `--ink` / `.acw-surface-ink` | `#283A38` | One closing or offer section per page at most |

Do not introduce additional section colours, white panels, tinted gradients or decorative surface variants. Photography may sit within any surface, but is not itself a fourth background treatment.

## Spacing

Use only `8 / 16 / 24 / 40 / 64 / 96 / 128 / 160` through `--space-*` tokens. Standard sections use `--section-space`, scaling from 64 to 128 px. Heroes deliberately use `--hero-space-top` and `--hero-space-bottom`, scaling from 96–160 px and 64–128 px respectively.

## Cards

Base card: Paper background, `#CBC6BE` warm-grey border, 16 px radius, 40 px desktop padding (24 px mobile), no shadow. Use `.acw-card-base` for new components. Existing card families are mapped to the same rule in the system stylesheet.

On mobile, explanatory sequences that do not need a contained surface become open editorial rows separated by warm-grey rules. Cards remain for actual deliverables, prices, examples, article previews, forms and other content whose grouping carries meaning. This prevents long pages becoming a repetitive stack of interchangeable boxes.

Raised card: the same base card plus `--founding-shadow` and an Ink border. Use `.acw-card-raised`. It is reserved for the Founding Client Offer; the current founding price cards inherit it automatically.

## Labels and type

Eyebrows use the shared `.acw-section-label`, `.acw-card-label`, `.acw-eyebrow` or `.acw-section-number` styles: Inter, 11.5 px, uppercase, 700 weight and `0.14em` tracking. Headings use Instrument Serif at its native 400 weight. Body copy uses Inter.

## Actions

There are two action treatments:

1. `.acw-btn.acw-btn-primary`: solid Ink pill. On an Ink section it automatically becomes Paper for contrast.
2. `.acw-link-tertiary`: underlined text link with no fill, outline, radius or shadow.

Use no more than one primary button within a section. Secondary actions must use the tertiary text link. Do not add outlined, ghost or additional button styles.

## Article grids and imagery

Journal and Library cards stretch to equal heights; copy regions share a minimum height and all images use the same `16 / 10` baseline. Imagery should show the actual work: Practice Clarity documents, identity sheets, annotated wireframes, project maps and working materials. Avoid stacked pebbles, empty tea-and-journal scenes, symbolic doorways and generic therapy-room stock photography.

On mobile, article cards return to content-led height and reserve a `16 / 10` image area so lazy-loaded imagery cannot leave an unexplained blank card. Embedded service PDFs are replaced by exact first-page previews below 760 px, while the full documents remain available through explicit links.

Desktop PDF embeds are activated only as they approach the viewport. Mobile visitors receive the lightweight preview and direct document link without downloading the embedded PDFs in the background.

Use `PHOTOGRAPHY-SHOT-LIST.md` when replacing the current process-led placeholders with real studio photography.

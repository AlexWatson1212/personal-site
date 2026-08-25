# alexanderwatson.co.uk

Jekyll 4.3 site, built and deployed by Netlify.

**The offer, as the site states it**

| | |
|---|---|
| Therapist Website | **£995** — fixed, paid once, first twelve months of Website Care included |
| Practice Clarity | **+£500** — an add-on, **£1,495** together. Not bought online. |
| Website Care | Included for twelve months, then **£29** a month, no minimum term |
| Custom project | Scoped and quoted individually |

`_data/purchasing.yml` is the single source for those figures. `scripts/qa.mjs`
fails the build if any other amount appears in published source, or if any
retired offer name (`Choose Your Practice Website`, `Bespoke Website`,
`Route one/two`, `Around £2,000`) comes back.

**Layout of the repository**

- `assets/css/studio.css` — the whole stylesheet. See `VISUAL-SYSTEM.md`.
- `_data/collection.yml` — the eight design directions, drawn by `_includes/plate.html`.
- `_includes/practice-website-buy.html` — the only file permitted to emit a checkout link.
- `_pages/` — legal and statement pages. Draft until `_data/legal.yml` says otherwise.
- `scripts/` — build, purchasing resolver, and four QA harnesses.

**Commands**

```
npm run build      # purchasing config → css → jekyll build
npm test           # scripts/qa.mjs — 64 checks, no dependencies
npm run preview    # Node stand-in for the Jekyll build → _preview/
npm run qa:browser # overflow, keyboard, landmarks, contrast, 200% zoom
npm run qa:a11y    # axe-core, 31 routes × 4 viewports
npm run qa:typography  # measure, rendered line length, target sizes
```

rubygems.org is unreachable from some build containers, which is why
`scripts/preview/render.mjs` exists: it re-implements enough of Jekyll to
render every route for the browser harnesses.

## Content consolidation

The current visual-system rules are documented in `VISUAL-SYSTEM.md` and implemented in `assets/css/visual-system.css`. The real-artefact image brief and replacement filenames are in `PHOTOGRAPHY-SHOT-LIST.md`.

Use `INSTALLATION.md` for the exact replacement and legacy-file removal order. The final package omits the unused `assets/images/image-library` working folder so the source remains small enough to upload and deploy comfortably.

This source set completes the consolidation into two public content surfaces:

- **Practice Clarity Library** at `/practice-clarity`
- **Journal** at `/blog/`

## What is included

- Shared `default`, `guide` and `post` layouts.
- Current header and footer partials using **Practice Clarity Library** and **Journal** consistently.
- The four shared Practice Clarity progress, navigation, roadmap and summary includes used by the principle files.
- The Library index with nine complete principle destinations.
- Two evergreen practical Library guides:
  - *How to Optimise Your Counselling Directory Profile*
  - *Beyond Counselling Directory: How to Build a More Sustainable Private Practice*
- The Journal index with dates removed from cards. Dates remain available on individual article pages.
- Shared contextual routes from every guide and Journal article into the Service and Work pages.
- Home, Service and About pages with FAQs consolidated:
  - Home links to the full Service FAQ instead of repeating it.
  - Service contains the full scope, process, pricing, ownership and aftercare FAQ.
  - About retains only questions about Alexander's background, experience and location.
- Redirect rules for retired Library, Practice Notes and Counselling Directory URLs.

## Drop-in locations

Copy the files into the equivalent paths in the Jekyll project:

| File in this folder | Destination |
| --- | --- |
| `_layouts/default.html` | `_layouts/default.html` |
| `_layouts/guide.html` | `_layouts/guide.html` |
| `_layouts/post.html` | `_layouts/post.html` |
| `_includes/*.html` | `_includes/` |
| `_guides/*.md` | `_guides/` |
| `practice-clarity.html` | the source page for `/practice-clarity` |
| `blog.html` | the source page for `/blog/` |
| `index.html` | the homepage source |
| `service.html` | the Service page source |
| `about.html` | the About page source |
| `_redirects` | project root |

## Consolidation status

The old `_posts` source for `beyond-counselling-directory` and the superseded
plain `practice-clarity/` sources have been removed. The maintained content now
lives only in `_guides/`, preventing duplicate public routes.

The Counselling Directory profile guide now uses the canonical URL:

`/practice-clarity/counselling-directory-profile/`

## Jekyll and Netlify checks

The existing `guides` collection must continue to output files. A typical
configuration is:

```yaml
collections:
  guides:
    output: true
```

Jekyll may ignore a root file whose name begins with an underscore. If the
generated `_site` folder does not contain `_redirects`, add this to `_config.yml`:

```yaml
include:
  - _redirects
```

If `_config.yml` already has an `include` list, add `_redirects` to that list
rather than creating a second `include` key.

After copying the files:

1. Run the normal Jekyll build.
2. Confirm `_site/_redirects` exists.
3. Confirm all 11 Library guide URLs build: nine principles plus two practical guides.
4. Confirm `/beyond-counselling-directory/` redirects to its new Library URL.
5. Confirm Journal cards show reading time but no publication date.
6. Confirm the mobile navigation opens on guide and Journal article pages.

## Launch decisions and future maintenance

- The Home page is intentionally a complete standalone pitch. The Service page
  remains the detailed scope, process and pricing destination, so the current
  overlap is deliberate and does not need a launch change.
- The page-specific styles in `service.html` and `work.html` should move into
  the shared styling system the next time either page receives a material
  redesign. They are intentionally left in place during this launch pass to
  avoid a high-risk mechanical refactor.
- Practice Notes and the unfinished site search are retired. Their public page,
  include, data file and JavaScript are not part of the production package.

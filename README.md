# Alexander Watson Studio content consolidation

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
  - Home links to the complete Service FAQ instead of repeating it.
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

## Important migration step

Delete the old `_posts` source for `beyond-counselling-directory` after adding
`_guides/beyond-counselling-directory.md`. Leaving both files in place would
publish duplicate copies of the same article. The supplied index templates
exclude the old post defensively, but it should still be removed from `_posts`.

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

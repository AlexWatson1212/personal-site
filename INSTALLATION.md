# Installation

This ZIP is a clean Jekyll source package. It deliberately omits `.git`, `_site`, caches, dependencies and the unused 172 MB `assets/images/image-library` working folder.

## Recommended replacement

1. Keep the `.git` folder in your current repository.
2. Make a backup or commit the current state.
3. Copy the contents of this package into the repository root and replace matching files.
4. Remove the obsolete sources listed below if they still exist.
5. Commit and push; Netlify will install the small CSS build dependencies, create the production stylesheet and then run Jekyll.

The production command is `npm run build`. For local development, run `npm install` once, then use `npm run build:css` before the normal Jekyll build whenever either source stylesheet changes.

## Obsolete sources to remove from an existing repository

These files have already been removed from this package. Delete them from the
destination repository if an older copy remains after merging:

```text
library/index.html
library/practice-clarity.html
library/Practical Guides/counselling-directory-profile.md
practice-clarity/*.md
practice-notes.html
_posts/2026-07-03-beyond-counselling-directory-sustainable-private-practice.md
_posts/framework
library/framework
practice-clarity/framework
_data/theme.yml
links/index.html
_includes/practice-notes-signup.html
assets/js/search.js
search.json
assets/images/brand/site.webmanifest
```

The current Library principles and evergreen guides now live in `_guides/`. Do
not remove that folder, the root `practice-clarity.html` Library index, or the
current `_pages/accessibility.html` statement.

## Live checks after deployment

- `/`, `/service/`, `/about/`, `/work/` and `/contact/`
- `/practice-clarity/` and all nine principle routes
- `/practice-clarity/counselling-directory-profile/`
- `/practice-clarity/beyond-counselling-directory/`
- `/blog/` and both Journal articles
- `/library/` redirects to `/practice-clarity/`
- `/practice-notes/` redirects to `/blog/`
- `/terms/` contains the Studio Terms
- `/accessibility/` contains the Studio Accessibility Statement
- `/links/`, `/library/framework` and `/practice-clarity/framework` expose no old content

Finish with one mobile pass and a Screaming Frog crawl. The photography replacement is optional and is specified in `PHOTOGRAPHY-SHOT-LIST.md`.

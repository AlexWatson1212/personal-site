# Installation

This ZIP is a clean Jekyll source package. It deliberately omits `.git`, `_site`, caches, dependencies and the unused 172 MB `assets/images/image-library` working folder.

## Recommended replacement

1. Keep the `.git` folder in your current repository.
2. Make a backup or commit the current state.
3. Copy the contents of this package into the repository root and replace matching files.
4. Remove the obsolete sources listed below if they still exist.
5. Commit and push; Netlify will run the existing Jekyll build command.

## Obsolete sources to remove

```text
library/index.html
library/practice-clarity.html
library/Practical Guides/counselling-directory-profile.md
practice-clarity/*.md
practice-notes.html
_posts/2026-07-03-beyond-counselling-directory-sustainable-private-practice.md
_pages/accessibility.html
_posts/framework
library/framework
practice-clarity/framework
_data/theme.yml
```

The current Library principles and evergreen guides now live in `_guides/`. Do not remove that folder.

## Live checks after deployment

- `/`, `/service/`, `/about/`, `/work/` and `/contact/`
- `/practice-clarity/` and all nine principle routes
- `/practice-clarity/counselling-directory-profile/`
- `/practice-clarity/beyond-counselling-directory/`
- `/blog/` and both Journal articles
- `/library/` redirects to `/practice-clarity/`
- `/practice-notes/` redirects to `/blog/`

Finish with one mobile pass and a Screaming Frog crawl. The photography replacement is optional and is specified in `PHOTOGRAPHY-SHOT-LIST.md`.

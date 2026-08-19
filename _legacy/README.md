# Legacy sources (not published)

Files here are retained for reference only. Jekyll never reads directories
beginning with `_`, and `_legacy` is also listed in `exclude:` in `_config.yml`,
so nothing in this folder is built or published.

## practice-clarity/ and library/Practical Guides/

Superseded copies of eleven Practice Clarity guides. Each declared the same
`permalink:` as its counterpart in the `_guides/` collection, so Jekyll built
both to the same destination and warned:

    Build Warning: Layout 'guide' ... destination is shared by multiple files

The `_guides/` collection is the canonical, actively linked source: it is what
`_includes/practice-clarity-navigation.html` reads (`site.guides`), and it holds
the current front matter (`excerpt`, `featured`, `featured_order`, `level`,
`self_contained_guide`) that the library index and guide navigation rely on.

The copies moved here are older drafts. They differ only in ways that were
already superseded:

  - they point at the retired `/assets/images/library/` image set rather than
    the current `/assets/images/brand/` images
  - they render the Homepage and Waiting Room sequence diagrams as flat images
    instead of the accessible `.acw-guide-process-diagram` markup
  - they link to `/practice-clarity` without the trailing slash
  - they use the retired `.acw-btn-secondary` button in place of
    `.acw-link-tertiary`
  - a few paragraphs are earlier drafts of sentences that were later rewritten

No prose, section or asset exists only in these copies.

## library/practice-clarity.html

A superseded copy of the Practice Clarity Library index. It declared
`permalink: /practice-clarity` (no trailing slash), so Jekyll built it to
`/practice-clarity.html` — a different destination from the canonical
`practice-clarity.html` at `/practice-clarity/`. That produced no build warning,
but served a stale near-duplicate of the same page at a second URL.

The canonical `practice-clarity.html` at the repository root is the live library
index. `_redirects` now 301s `/practice-clarity.html` to `/practice-clarity/`
so any existing link or bookmark still lands correctly.

## library/framework

An AI image-generation prompt with no front matter. Jekyll copied it verbatim to
`/library/framework`, publishing internal working notes. Nothing linked to it.

## _posts/framework

An empty post template stub. Jekyll never built it — files in `_posts` must be
named `YYYY-MM-DD-title.ext` — so removing it changes no output. Kept here as a
starting point for new posts.

Note: `practice-clarity/framework` is deliberately NOT here. It is the published
Practice Clarity framework text and still serves at `/practice-clarity/framework`.

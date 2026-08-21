# Alexander Watson Studio — HTML page replacements

These five Jekyll pages replace the five supplied pages without requiring a new
site architecture:

| File | Destination | Purpose |
| --- | --- | --- |
| `index.html` | repository root | Catalogue-first homepage |
| `work.html` | existing Work page file | Searchable website collection |
| `service.html` | existing Service page file | £495 / £995 / £1,995 routes |
| `about.html` | existing About page file | Studio story around the new model |
| `contact.html` | existing Contact page file | Design-first written enquiry |

Also copy:

- `assets/css/catalogue-refresh.css`
- `assets/js/website-library.js`
- `assets/js/contact-enquiry.js`
- `assets/images/og-studio-refresh.png`

## Two small default-layout additions

Add this inside `<head>` in `_layouts/default.html`:

```liquid
{% if page.page_css %}
  <link rel="stylesheet" href="{{ page.page_css | relative_url }}">
{% endif %}
```

Add this just before the closing `</body>` tag:

```liquid
{% if page.page_js %}
  <script src="{{ page.page_js | relative_url }}" defer></script>
{% endif %}
```

## Navigation wording

Keep the existing shared header and footer, but update the main navigation to:

1. Home
2. Websites — `/work/`
3. Services — `/service/`
4. About — `/about/`
5. Start with a design — `/contact/`

Practice Clarity can remain available through Services; it no longer needs to
occupy the main navigation.

## Social metadata

Use `assets/images/og-studio-refresh.png` as the default Open Graph and X/Twitter
image. Suggested metadata:

- Title: `Original Therapist Websites | Alexander Watson Studio`
- Description: `Explore original, pre-made therapist websites and choose the level of support you need to make one your own.`

## Important accuracy decision

The website cards are described as Studio designs or practice projects—not as
commissioned client work. Only Alexander Watson Counselling links to a verified
live website in this handoff. Add live demo links to the other cards after each
subdomain has been confirmed.

## Prices and boundaries used

- Straightforward Website — £495, up to five pages, client supplies approved copy.
- Guided Website — £995, up to six pages, focused messaging help and light copy shaping.
- Practice Clarity + Bespoke Website — £1,995, up to eight pages and substantial strategic/copy support.
- All three include two consolidated revision rounds and the same technical standard.

The contact form prepares a normal email locally. It does not transmit or store
form content on the website.

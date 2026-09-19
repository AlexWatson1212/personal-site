# Practice Discovery — bringing the form into service

Alexander Watson Studio · internal · 19 September 2026

**Not published.** `docs` is in the `exclude` list in `_config.yml`.

The questionnaire lives at `/client/practice-discovery/` and posts to Netlify
Forms. Everything in the repository is done. The steps below are the part that
cannot be done in code, because a build cannot tell whether Netlify has
registered the form or whether a notification actually arrived.

---

## What is already in place

| Piece | Where |
|---|---|
| The questions | `_data/practice_discovery.yml` — 70 across 11 steps |
| The page | `client/practice-discovery.html` |
| The confirmation | `client/practice-discovery-thank-you.html` |
| The step experience | `assets/js/practice-discovery.js` |
| The styling | section 24 of `assets/css/studio.css` |
| The guards | the seven **Practice Discovery** checks in `scripts/qa.mjs` |

Form name `practice-discovery`, honeypot `bot-field`, action
`/client/practice-discovery/thank-you/`. All three come from the data file, and
`npm test` fails if the page and the data file stop agreeing.

## Before the first client sees it

1. **Deploy.** Netlify detects forms by parsing the built HTML at deploy time,
   so the form does not exist until a deploy has finished. A deploy preview is
   enough to test with, and its submissions are kept separately from
   production's.
2. Open the site in Netlify.
3. Go to **Forms**.
4. Confirm **`practice-discovery`** is listed. If it is not, the deploy did not
   see the form: check that form detection is enabled for the site, and that
   the build actually produced `/client/practice-discovery/index.html`.
5. **Configure notifications.** Forms → `practice-discovery` → Settings and
   usage → Form notifications → Add notification → Email notification. Send it
   to the studio address. Set the reply-to to the form's `email` field so a
   reply goes to the client rather than to nobody.

   The address is entered in the Netlify dashboard and nowhere else. It is
   deliberately not in the page or in `assets/js/practice-discovery.js`: those
   are public files, and an address in them is an address a scraper collects.
6. **Submit a genuine test response** through the deployed URL — not a local
   build, which cannot post anywhere. Fill the ten required answers, attach a
   small file to **each** of the two uploads — `existing-materials` in step 9
   and `upload-anything-else` in step 11 — and submit. Both, not one: they are
   separate fields and a configuration that drops the second would look
   identical to a working one until a client lost a file.
7. Confirm the response appears under **Forms → practice-discovery**.
8. Confirm the notification email arrives, and that replying to it addresses
   the email you typed into the test.
9. Confirm **both** uploaded files are reachable from the submission in
   Netlify, and **only** from there — a file has an unguessable URL rather
   than a protected one, so treat that URL as the secret it is. If only one
   file arrived, stop: something in the form is dropping the other.
   Then repeat once with a file of roughly 6 MB, to see a large upload
   complete inside Netlify's 30-second window on a real connection rather
   than on a fast one.
10. Delete the test submission and its file once you are satisfied.
11. **Confirm the plan.** Netlify Forms has a free monthly submission
    allowance and a separate allowance for upload storage, both of which
    change from time to time and differ by plan. Check the current figures on
    the account before sending this to a client, and check what happens when
    an allowance is reached: submissions past the limit can be rejected, which
    on this form would mean losing forty minutes of somebody's writing.

## The file uploads

Two optional upload fields: one in "Existing presence and materials" for
anything the client already has, and one at the end for whatever they thought
of on the way through. (There were five; they were merged when the question set
was cut, because five labelled boxes made the client sort their own files and
produced no better result than one.) Accepted extensions are set per field in
the data file — PDF, DOC, DOCX, JPG, JPEG, PNG, WEBP. SVG, AI and EPS are
deliberately excluded and the page says to email those instead: an SVG is a
document that can carry script, and this is not the place to accept one.

### One file per field

Netlify Forms accepts **one file per file input**. Several files need several
fields. There is no `multiple` attribute on either control and no `multiple`
key in the data file, and `scripts/qa.mjs` fails on both — because a control
carrying `multiple` accepts five files in the picker and submits one, silently,
with nothing on the page to tell the client the other four were dropped.

If a client needs to send more than two files, they use the `file-links`
question — a shared Dropbox or Google Drive folder — or email them. The page
says so at both uploads and in the introduction.

### Size and time

| Limit | Value | Where it bites |
| --- | --- | --- |
| Maximum request size | **8 MB** for the whole submission, text and files together | Netlify rejects the request; the client loses everything they wrote |
| Upload timeout | **30 seconds** | A large file on a slow connection fails mid-submission |
| Files per field | **1** | Extra files are dropped without warning |

The page advises **7 MB across both uploads**, deliberately below the 8 MB
ceiling: the request carries seventy answers' worth of text as well as the
files, and a client who sizes a file at exactly 8 MB would be over. That number
lives in the two upload hints in `_data/practice_discovery.yml` and in the
introduction in `client/practice-discovery.html`.

Netlify's own figures change from time to time. Re-read their Forms
documentation before sending this to a client, and if 8 MB has moved, change
the advised figure in those two places — and nowhere else.

## Spam

The honeypot is Netlify's documented pattern: a real field named `bot-field`,
declared to Netlify through `netlify-honeypot`, moved off-screen and out of the
tab order. Netlify silently discards anything that fills it.

If real spam starts arriving, the next step is Netlify's built-in reCAPTCHA 2:
add `data-netlify-recaptcha="true"` to the form and a
`<div data-netlify-recaptcha="true"></div>` where the challenge should appear.
It is not there now because it costs every client an accessibility obstacle to
solve a problem this form does not yet have.

## What this page is, and is not

It is **unlisted and noindex**: nothing links to it, `noindex: true` renders the
robots meta tag, `sitemap: false` keeps it out of the sitemap, robots.txt
disallows `/client/`, and `netlify.toml` sends `X-Robots-Tag: noindex, nofollow`
for `/client/*`.

It is **not authenticated**. Anyone who has the address can open it and submit
it. That is the same arrangement as the existing intake page, and it is fine for
what it does — but do not describe it to a client as secure or private, and do
not put anything on it that would matter if a stranger read it.

## Sending it to a client

After the deposit is paid, send the address in the welcome email. There is no
per-client reference on this form — unlike the intake, which carries `?ref=`.
The client's name and email are the first two questions, which is enough to
match a submission to a project.

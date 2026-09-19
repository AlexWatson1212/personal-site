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
   build, which cannot post anywhere. Fill the nine required answers, tick the
   closing confirmation, paste a test link into the `file-links` question, and
   submit. There is nothing to attach: the questionnaire takes text only.
7. Confirm the response appears under **Forms → practice-discovery**.
8. Confirm the notification email arrives, and that replying to it addresses
   the email you typed into the test.
9. Confirm the `file-links` answer arrived intact, with the link readable and
   clickable in the dashboard. It is the only route a client's material now
   takes, so a truncated or mangled link is a silent failure.
10. Delete the test submission once you are satisfied.
11. **Confirm the plan.** Netlify Forms has a free monthly submission
    allowance, which changes from time to time and differs by plan. (There is
    no upload allowance to check: this form takes no files.) Check the current
    figure on the account before sending this to a client, and check what
    happens when the allowance is reached: submissions past the limit can be
    rejected, which on this form would mean losing forty minutes of somebody's
    writing.

## No file uploads

**The questionnaire takes text only.** There is no file input, no `accept`
list, no `multiple` attribute and no `enctype` on the form, and
`scripts/qa.mjs` fails if any of those returns.

That is a deliberate narrowing, made on 19 September 2026. Two single-file
uploads existed for a few hours (cut down from five). They came out because
every file a client uploaded would have sat in Netlify, in the United States,
until somebody remembered to delete it — and because Netlify Forms takes one
file per field, so a client attaching three would have lost two without being
told. Neither problem exists now.

**Files reach the Studio another way.** The `file-links` question asks for a
Google Drive or Dropbox folder, or a WeTransfer link, that works without a
password; emailing the files is offered as an equal alternative. The
introduction says the same thing before a client starts.

What this means for the privacy notice: it states in public that "No files are
uploaded through the questionnaire. It has no upload field of any kind." A
future edit that adds an upload has to change that sentence first, and the QA
suite will stop a change that does not.

The Netlify Forms limits that used to be recorded here — one file per field, an
8 MB request ceiling, a 30-second upload timeout — no longer bear on anything
and have been removed rather than left to look like live constraints.

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

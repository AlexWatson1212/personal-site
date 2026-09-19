/* Google Analytics 4, and the consent it waits for.
 *
 * Configuration is window.STUDIO_ANALYTICS, written by _includes/analytics.html
 * from _config.yml. This file contains no measurement ID and no hostname.
 *
 * The order of events matters more than anything else here:
 *
 *   1. This file loads. Nothing from Google has been requested.
 *   2. A stored choice is read. If there is none, a notice is shown.
 *   3. gtag.js is injected ONLY when the stored choice is "granted" AND the
 *      page is being served from one of the configured hosts.
 *
 * So a first-time visitor, and every visitor who has declined, loads this page
 * without a single request to googletagmanager.com or google-analytics.com and
 * without a _ga cookie. Declining later also deletes the cookies GA set, so
 * "no" removes what "yes" created rather than merely stopping more of it.
 *
 * Nothing a person types is measured. This file sends page views and nothing
 * else: there is no event, no form listener and no element-content read
 * anywhere in it. The contact page's promise is that nothing typed there is
 * stored by the website, and an analytics call is storing.
 *
 * Progressive enhancement: without JavaScript there is no analytics, no notice
 * and no preference control — which is a complete and correct state, not a
 * degraded one. The page is unchanged.
 */
(function () {
  "use strict";

  var cfg = window.STUDIO_ANALYTICS;
  if (!cfg || !cfg.measurementId) return;

  var KEY = cfg.storageKey || "aw-studio:analytics";
  var SESSION_KEY = KEY + ":deferred";
  var ID = cfg.measurementId;
  var HOSTS = cfg.hosts || [];

  /* The production guard. Expressed against the hostname the page is actually
     being served from, so it holds for `jekyll serve`, the Node preview
     renderer, a file:// open, a Netlify deploy preview and a branch deploy
     alike — none of which can report a visit even if this browser has already
     said yes on the live site. */
  var measurable = HOSTS.indexOf(window.location.hostname) !== -1;

  /* Storage throws rather than returning null in a private window and wherever
     site data is blocked. A preference is not worth an exception, and the
     fallback — no stored consent, therefore no analytics — is the safe one. */
  function readChoice() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === "granted" || v === "denied" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function writeChoice(value) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch (e) {
      /* The choice still governs this page; it just will not outlive it. */
    }
  }

  function deferredThisSession() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function deferThisSession() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {}
  }

  /* ---- Google Analytics ------------------------------------------------ */

  var loaded = false;

  function load() {
    if (loaded || !measurable) return;
    loaded = true;

    window.dataLayer = window.dataLayer || [];
    /* gtag pushes `arguments` itself — the array-like object, not a copy —
       which is how Google's own snippet is written and what the tag expects. */
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(s);

    gtag("js", new Date());
    gtag("config", ID);
  }

  /* Turning it off has to undo what turning it on did, or "no" would only mean
     "no more". The kill switch stops the tag on this page even though its
     script is already in memory; the cookies GA set are then cleared from both
     the exact host and the registrable domain, which is where _ga is written. */
  function unload() {
    window["ga-disable-" + ID] = true;

    var host = window.location.hostname;
    var parts = host.split(".");
    var domains = [host, "." + host];
    if (parts.length > 2) {
      var registrable = parts.slice(-3).join(".");
      domains.push(registrable, "." + registrable);
    }
    domains.push("." + parts.slice(-2).join("."));

    var cookies = document.cookie ? document.cookie.split(";") : [];
    for (var i = 0; i < cookies.length; i++) {
      var name = cookies[i].split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) continue;
      for (var d = 0; d < domains.length; d++) {
        document.cookie =
          name + "=; Max-Age=0; Path=/; SameSite=Lax; Domain=" + domains[d];
      }
      document.cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax";
    }
  }

  /* ---- The notice ------------------------------------------------------ */

  var notice = null;
  var returnFocusTo = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.appendChild(document.createTextNode(text));
    return node;
  }

  function buildNotice() {
    /* A labelled region rather than a dialog: it asks for something, it does
       not demand it, so it must not trap focus or block the page behind it.
       It is inserted at the top of the body and positioned at the foot of the
       screen — which puts it early in the tab order, where somebody using a
       keyboard can reach it in two stops, while leaving the page's own opening
       to be read first. */
    /* `on-ink` is the site's own way of saying "this block is dark": it is
       what re-points the button tokens, so the quiet button is legible here
       rather than dark ink on dark ink. */
    var wrap = el("section", "consent on-ink");
    wrap.setAttribute("aria-label", "Analytics");
    wrap.setAttribute("tabindex", "-1");

    var inner = el("div", "consent__inner");

    /* A paragraph rather than a heading. The notice appears on every page, and
       an <h2> here would put "Before I count this visit" into the heading
       outline of all of them, ahead of the page's own h1. The region carries
       the accessible name instead. */
    var title = el("p", "consent__title", "Before I count this visit");

    var body = el(
      "p",
      "consent__body",
      "I'd like to use Google Analytics to see which pages are read and how " +
        "people find the site. It sets cookies and is not used for " +
        "advertising. Nothing you type here is ever measured, and the site " +
        "works the same either way."
    );

    var actions = el("div", "consent__actions");

    var allow = el("button", "btn consent__allow", "Allow analytics");
    allow.type = "button";
    allow.addEventListener("click", function () { choose("granted"); });

    var deny = el("button", "btn btn--quiet consent__deny", "No thanks");
    deny.type = "button";
    deny.addEventListener("click", function () { choose("denied"); });

    var more = el("p", "consent__more");
    var link = el("a", "inline-link", "What is measured");
    link.href = (window.STUDIO_ANALYTICS.privacyUrl || "/privacy/") + "#cookies";
    more.appendChild(link);

    actions.appendChild(allow);
    actions.appendChild(deny);
    inner.appendChild(title);
    inner.appendChild(body);
    inner.appendChild(actions);
    inner.appendChild(more);
    wrap.appendChild(inner);

    return wrap;
  }

  /* Escape sets the question aside for this browsing session. It is not an
     answer, so nothing is stored against the visitor and they are asked again
     on a later visit — but not again on the next page of this one.

     Bound to the document rather than to the notice, because the notice does
     not hold focus: somebody reading the page, with focus anywhere in it, can
     still press Escape and expect the thing at the foot of their screen to go
     away. It is added when the notice opens and removed when it closes, so
     there is no listener on a page that is not asking anything. */
  function onKeydown(event) {
    if (event.key !== "Escape" || !notice) return;
    deferThisSession();
    closeNotice();
  }

  function openNotice(focusIt) {
    if (notice) return;
    notice = buildNotice();
    /* After the skip link, never before it: "skip to main content" has to stay
       the first thing a keyboard or screen-reader user reaches on every page.
       Second place still puts the two answers within two tab stops, which is
       the point of mounting it at the top of the document rather than at the
       bottom where it appears. */
    var skip = document.querySelector(".skip-link");
    if (skip && skip.parentNode === document.body) {
      document.body.insertBefore(notice, skip.nextSibling);
    } else {
      document.body.insertBefore(notice, document.body.firstChild);
    }
    document.addEventListener("keydown", onKeydown);
    /* Focus moves only when the visitor asked for the notice. On a first visit
       it appears without taking the page away from whoever is reading it. */
    if (focusIt) notice.focus();
  }

  function closeNotice() {
    if (!notice) return;
    document.removeEventListener("keydown", onKeydown);
    notice.parentNode.removeChild(notice);
    notice = null;
    /* The footer control is rebuilt whenever the answer changes, so the node
       that opened the notice may no longer be in the document. Focus goes to
       whatever is standing in its place, and only when the notice was opened
       from there — closing one that appeared on its own must not move focus. */
    if (returnFocusTo) {
      var target = document.contains(returnFocusTo)
        ? returnFocusTo
        : document.querySelector(".footer-analytics__button");
      if (target) target.focus();
    }
    returnFocusTo = null;
  }

  function choose(value) {
    writeChoice(value);
    if (value === "granted") load(); else unload();
    renderPreference();
    closeNotice();
  }

  /* ---- The preference control, in the footer --------------------------- */

  var mount = null;

  function renderPreference() {
    if (!mount) return;
    while (mount.firstChild) mount.removeChild(mount.firstChild);

    var choice = readChoice();
    var state =
      choice === "granted" ? "Analytics: allowed"
        : choice === "denied" ? "Analytics: not allowed"
          : "Analytics: not set";

    var button = el("button", "footer-analytics__button", state);
    button.type = "button";
    /* The visible label is the state; the accessible name has to be the
       action, because "Analytics: allowed" read on its own does not tell
       somebody that pressing it will do anything. */
    button.setAttribute("aria-label", state + " — change your analytics choice");
    button.addEventListener("click", function () {
      returnFocusTo = button;
      openNotice(true);
    });

    mount.appendChild(button);
  }

  /* ---- Start ----------------------------------------------------------- */

  function start() {
    mount = document.querySelector("[data-analytics-preference]");
    renderPreference();

    var choice = readChoice();
    if (choice === "granted") load();
    else if (choice === null && !deferredThisSession()) openNotice(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

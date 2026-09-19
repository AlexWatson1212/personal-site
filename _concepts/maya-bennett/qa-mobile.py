#!/usr/bin/env python3
"""Maya Bennett — conformance run.

Renders the built page and checks it at the eleven widths the site is meant to
hold, with JavaScript off, under reduced motion, and — in a scratch copy with
the Reading control switched on — at every combination of text size and reading
mode. Exits non-zero on the first failure, and prints what failed.

    python3 qa-mobile.py [root]          default: the folder this file is in

Needs Playwright with Chromium:  pip install playwright && playwright install chromium
"""
import functools, http.server, json, pathlib, shutil, socketserver, sys, tempfile, threading

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
if ROOT.is_file():
    ROOT = ROOT.parent
WIDTHS = [1920, 1440, 1200, 1024, 992, 768, 430, 390, 375, 360, 320]
PHONES = [430, 390, 375, 360, 320]
SIZES = ["default", "large", "largest"]
MODES = ["default", "contrast", "soft"]

failures, notes = [], []


def fail(what):
    failures.append(what)


def serve(root):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    class Quiet(socketserver.TCPServer):
        allow_reuse_address = True

        def handle_error(self, *a):
            pass  # a browser closing a connection mid-response is not a defect

    httpd = Quiet(("127.0.0.1", 0), functools.partial(Handler, directory=str(root)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


# The reading surfaces, and the size each should be holding on a phone.
PROBES = {
    ".claim__body p": 17, ".met > summary": 17, ".met__reply": 17, ".note p": 17,
    ".about__text > h2 + p": 17, ".prep__head > h2 + p": 17,
    ".creds dd": 16.4, ".prac__item dd": 16.4, ".step p": 16.4, ".enq__aside p": 16.4,
    ".index li": 16.4, ".enough li": 16.4, ".foot__brand p": 16.4,
    ".fig__cap": 15, ".form .hint": 15,
}

JS_SIZES = """(sels) => Object.fromEntries(sels.map(s => {
  const el = document.querySelector(s);
  return [s, el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * 100) / 100 : null];
}))"""

JS_OVERFLOW = """() => {
  const de = document.documentElement, vw = de.clientWidth;
  const bad = [...document.querySelectorAll('body *')].filter(e => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && (r.right > vw + 1 || r.left < -1);
  }).map(e => e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 30));
  return {scrollW: de.scrollWidth, clientW: vw, bad: bad.slice(0, 8)};
}"""

# Inline links in running prose are the exception WCAG 2.2 AA 2.5.8 makes — a
# link set in a sentence, whose size is the sentence's — and the studio strip is
# the full width of the screen. Everything else is measured.
JS_TARGETS = """() => {
  const inSentence = el => el.tagName === 'A' && getComputedStyle(el).display === 'inline' &&
      el.parentElement && el.parentElement.textContent.trim() !== el.textContent.trim();
  const out = [];
  for (const el of document.querySelectorAll('a[href], button, summary, input, textarea, label.choice')) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if ((r.width === 0 && r.height === 0) || cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (inSentence(el) || el.classList.contains('studio')) continue;
    if (Math.min(r.width, r.height) < 24) {
      out.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 24) +
               ' ' + Math.round(r.width) + '×' + Math.round(r.height));
    }
  }
  return out;
}"""

JS_MARKS = """() => {
  const seps = new Set();
  for (const m of document.querySelectorAll('.mark'))
    seps.add(getComputedStyle(m).getPropertyValue('--sep').trim());
  return [...seps];
}"""

# Every text pairing, against the colour it is actually painted on.
JS_CONTRAST = """() => {
  const srgb = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = c => 0.2126 * srgb(c[0]) + 0.7152 * srgb(c[1]) + 0.0722 * srgb(c[2]);
  const parse = s => s.match(/[\\d.]+/g).slice(0, 4).map(Number);
  const ground = el => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.length < 4 || c[3] > 0) return c.slice(0, 3);
    }
    return [255, 255, 255];
  };
  const sels = ['.hero__lede','.claim__body p','.met > summary','.met__reply','.meet__note','.fig__cap',
                '.demo__caption','.index li','.sess__sub','.note p','.pull','.on-plum .fig__cap',
                '.about__text p','.creds dd','.creds__note dd','.prac__item dt','.prac__item dd','.step p',
                '.enq__head > p','.enq__aside p','.hint','.formnote','.foot p','.foot__base','.foot__col a',
                '.nav a','.eyebrow','.on-plum .eyebrow','.tidy li','.enough li','.glance dd small',
                '.ro__opt','.ro__note','.ro__legend'];
  const out = [];
  for (const s of sels) {
    const el = document.querySelector(s); if (!el) continue;
    const cs = getComputedStyle(el), fg = parse(cs.color), bg = ground(el);
    const a = fg.length > 3 ? fg[3] : 1;
    let l1 = L([0,1,2].map(i => fg[i] * a + bg[i] * (1 - a))), l2 = L(bg);
    if (l1 < l2) [l1, l2] = [l2, l1];
    const r = (l1 + 0.05) / (l2 + 0.05);
    const px = parseFloat(cs.fontSize);
    const need = (px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700)) ? 3 : 4.5;
    if (r < need) out.push(s + ' ' + (Math.round(r * 100) / 100) + ':1 at ' + Math.round(px) + 'px');
  }
  return out;
}"""

SET_PREFS = """([size, mode]) => {
  const set = (n, v) => {
    const el = document.querySelector(`input[name=ro-${n}][value=${v}]`);
    el.checked = true;
    el.dispatchEvent(new Event('change', {bubbles: true}));
  };
  set('size', size); set('mode', mode);
}"""


def main():
    from playwright.sync_api import sync_playwright

    httpd, url = serve(ROOT)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        # ---- the eleven widths -------------------------------------------
        for w in WIDTHS:
            ctx = browser.new_context(viewport={"width": w, "height": 900}, device_scale_factor=2)
            page = ctx.new_page()
            console, third = [], []
            page.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console.append(str(e)))
            page.on("request", lambda r: third.append(r.url) if not r.url.startswith(("http://127.0.0.1", "data:")) else None)
            page.goto(url, wait_until="load")
            page.wait_for_timeout(250)

            if console:
                fail(f"{w}px console: {console[:3]}")
            if third:
                fail(f"{w}px third-party requests: {third[:3]}")

            ov = page.evaluate(JS_OVERFLOW)
            if ov["scrollW"] > ov["clientW"]:
                fail(f"{w}px horizontal overflow ({ov['scrollW']} > {ov['clientW']}): {ov['bad']}")

            marks = page.evaluate(JS_MARKS)
            if sorted(marks) != ["0px", "34px"]:
                fail(f"{w}px mark states are {marks}, not exactly offered and met")

            bad = page.evaluate(JS_CONTRAST)
            if bad:
                fail(f"{w}px contrast: {bad}")

            if w in PHONES:
                sizes = page.evaluate(JS_SIZES, list(PROBES))
                for sel, floor in PROBES.items():
                    got = sizes.get(sel)
                    if got is None:
                        fail(f"{w}px probe missing: {sel}")
                    elif got < floor - 0.05:
                        fail(f"{w}px {sel} reads at {got}px, below the {floor}px floor")
                small = page.evaluate(JS_TARGETS)
                if small:
                    fail(f"{w}px targets under 24px: {small}")
                notes.append(f"{w}px  prose {sizes['.claim__body p']}px  page {page.evaluate('document.documentElement.scrollHeight')}px")
            ctx.close()

        # ---- with JavaScript off -----------------------------------------
        ctx = browser.new_context(viewport={"width": 390, "height": 900}, java_script_enabled=False)
        page = ctx.new_page()
        page.goto(url, wait_until="load")
        rows = page.eval_on_selector_all(".met", "e => e.length")
        open_ = page.eval_on_selector_all(".met", "e => e.filter(x => x.open).length")
        if rows != open_:
            fail(f"no-JS: {open_} of {rows} replies present; every one must be")
        if page.eval_on_selector_all(".nav a", "e => e.filter(x => x.getBoundingClientRect().width > 0).length") < 4:
            fail("no-JS: the navigation is not in the page")
        if page.eval_on_selector_all(".ro", "e => e.length"):
            fail("no-JS: a reading control that cannot work is being offered")
        ctx.close()

        # ---- reduced motion ----------------------------------------------
        ctx = browser.new_context(viewport={"width": 390, "height": 900}, reduced_motion="reduce")
        page = ctx.new_page()
        page.goto(url, wait_until="load")
        d = page.evaluate("() => getComputedStyle(document.querySelector('.met .b')).transitionDuration")
        if d != "0s":
            fail(f"reduced motion: transition-duration is {d}, not 0s")
        page.eval_on_selector(".met", "e => e.open = true")
        if page.evaluate("() => getComputedStyle(document.querySelector('.met[open] .mark')).getPropertyValue('--sep').trim()") != "0px":
            fail("reduced motion: the met state is not reached")
        ctx.close()

        # ---- the reading control, in a scratch copy with it on -----------
        tmp = pathlib.Path(tempfile.mkdtemp(prefix="maya-ro-"))
        shutil.copytree(ROOT, tmp / "site")
        page_src = (tmp / "site" / "index.html").read_text(encoding="utf-8")
        if "enabled:false" not in page_src:
            notes.append("reading control: already on in the build; scratch copy skipped")
            ro_url, ro_httpd = url, None
        else:
            (tmp / "site" / "index.html").write_text(page_src.replace("enabled:false", "enabled:true"), encoding="utf-8")
            ro_httpd, ro_url = serve(tmp / "site")

        ctx = browser.new_context(viewport={"width": 390, "height": 900})
        page = ctx.new_page()
        page.goto(ro_url, wait_until="load")
        page.click(".navtoggle")
        page.focus(".ro__btn")
        page.keyboard.press("Enter")
        if not page.is_visible(".ro__panel"):
            fail("reading control: Enter does not open the panel")
        if page.evaluate("() => getComputedStyle(document.activeElement).outlineStyle") == "none":
            fail("reading control: no visible focus ring on the button")
        page.keyboard.press("Tab")
        if page.evaluate("() => document.activeElement.name") != "ro-size":
            fail("reading control: Tab does not reach the first group")
        page.keyboard.press("ArrowDown")
        if page.evaluate("() => document.documentElement.getAttribute('data-read-size')") != "large":
            fail("reading control: the arrow keys do not change the setting")
        page.keyboard.press("Escape")
        if page.is_visible(".ro__panel"):
            fail("reading control: Escape does not close the panel")
        if page.evaluate("() => document.activeElement.className") != "ro__btn":
            fail("reading control: focus does not return to the button")
        page.reload(wait_until="load")
        if page.evaluate("() => document.documentElement.getAttribute('data-read-size')") != "large":
            fail("reading control: the setting does not survive a reload")
        early = ctx.new_page()
        early.add_init_script("window.__early = null; document.addEventListener('readystatechange', () => "
                              "{ if (window.__early === null) window.__early = "
                              "document.documentElement.getAttribute('data-read-size'); }, true);")
        early.goto(ro_url, wait_until="load")
        if early.evaluate("() => window.__early") != "large":
            fail("reading control: the setting is applied after first paint, not before")
        page.evaluate(SET_PREFS, ["default", "default"])
        left = page.evaluate("() => [document.documentElement.getAttribute('data-read-size'),"
                             " document.documentElement.getAttribute('data-read-mode')]")
        if left != [None, None]:
            fail(f"reading control: Default leaves {left} on the page instead of restoring the design")
        ctx.close()

        for size in SIZES:
            for mode in MODES:
                for w in (375, 430, 1200):
                    ctx = browser.new_context(viewport={"width": w, "height": 900})
                    page = ctx.new_page()
                    page.goto(ro_url, wait_until="load")
                    page.evaluate(SET_PREFS, [size, mode])
                    page.wait_for_timeout(100)
                    ov = page.evaluate(JS_OVERFLOW)
                    if ov["scrollW"] > ov["clientW"]:
                        fail(f"{size}/{mode} at {w}px: horizontal overflow {ov['bad']}")
                    bad = page.evaluate(JS_CONTRAST)
                    if bad:
                        fail(f"{size}/{mode} at {w}px contrast: {bad}")
                    ctx.close()

        browser.close()
    if ro_httpd:
        ro_httpd.shutdown()
    httpd.shutdown()

    for n in notes:
        print("   ", n)
    if failures:
        print(f"\n{len(failures)} failure(s):")
        for f in failures:
            print("  ✗", f)
        return 1
    print(f"\nPass. {len(WIDTHS)} widths, no-JS, reduced motion, "
          f"{len(SIZES) * len(MODES)} reading combinations at three widths.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

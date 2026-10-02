/* Field Manual — runner.
   Builds a page from HTML/CSS/JS, runs it in an iframe, captures the console,
   stops runaway loops, and gives checks a toolkit to inspect the result. */
(function () {
  'use strict';
  const FM = window.FM;

  /* ── loop guard ──────────────────────────────────────────────────────── */
  // Rewrites `while (c)` to `while (__fmG() && (c))` and the middle of
  // `for (a; b; c)` the same way. No newlines are added, so line numbers in
  // error messages still match what the learner typed.

  function skipString(src, i) {
    const q = src[i];
    let j = i + 1;
    while (j < src.length && src[j] !== q) {
      if (src[j] === '\\') j++;
      j++;
    }
    return j + 1;
  }

  function matchParen(src, open) {
    let depth = 0;
    const semis = [];
    for (let j = open; j < src.length; j++) {
      const c = src[j];
      if (c === '"' || c === "'" || c === '`') {
        j = skipString(src, j) - 1;
        continue;
      }
      if (c === '/' && src[j + 1] === '/') {
        const k = src.indexOf('\n', j);
        j = k < 0 ? src.length : k;
        continue;
      }
      if (c === '/' && src[j + 1] === '*') {
        const k = src.indexOf('*/', j + 2);
        j = k < 0 ? src.length : k + 1;
        continue;
      }
      if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') {
        depth--;
        if (depth === 0) return { close: j, semis };
      } else if (c === ';' && depth === 1) semis.push(j);
    }
    return null;
  }

  FM.guard = function (src) {
    if (!src || !/\b(for|while)\b/.test(src)) return src;
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '"' || c === "'" || c === '`') {
        const j = skipString(src, i);
        out += src.slice(i, j);
        i = j;
        continue;
      }
      if (c === '/' && src[i + 1] === '/') {
        let j = src.indexOf('\n', i);
        if (j < 0) j = n;
        out += src.slice(i, j);
        i = j;
        continue;
      }
      if (c === '/' && src[i + 1] === '*') {
        let j = src.indexOf('*/', i + 2);
        j = j < 0 ? n : j + 2;
        out += src.slice(i, j);
        i = j;
        continue;
      }
      const m = /^(for|while)\b/.exec(src.slice(i, i + 6));
      if (m && !/[\w$.]/.test(src[i - 1] || '')) {
        const kw = m[1];
        let j = i + kw.length;
        while (j < n && /\s/.test(src[j])) j++;
        if (src[j] === '(') {
          const p = matchParen(src, j);
          if (p) {
            const head = src.slice(i, j + 1);
            if (kw === 'while') {
              out += head + '__fmG()&&(' + src.slice(j + 1, p.close) + ')' + ')';
            } else if (p.semis.length === 2) {
              const [s1, s2] = p.semis;
              const cond = src.slice(s1 + 1, s2);
              const guarded = cond.trim() ? '__fmG()&&(' + cond + ')' : '__fmG()';
              out += head + src.slice(j + 1, s1 + 1) + guarded + src.slice(s2, p.close + 1);
            } else {
              out += src.slice(i, p.close + 1); // for…of / for…in: always finite
            }
            i = p.close + 1;
            continue;
          }
        }
      }
      out += c;
      i++;
    }
    return out;
  };

  const GUARD_FN =
    'var __fmA=0,__fmT=0,__fmN=0;function __fmG(){if(!__fmA){__fmA=1;__fmT=performance.now();setTimeout(function(){__fmA=0})}' +
    'if(++__fmN%2000===0&&performance.now()-__fmT>1500){__fmA=0;throw new Error("This loop ran for over 1.5 seconds, so it was stopped. It is probably an infinite loop: check that the loop condition eventually becomes false.")}return true}';

  /* ── the page prelude ────────────────────────────────────────────────── */
  // Runs before any learner code: captures console output, errors and
  // alerts, and keeps link clicks from navigating the preview away.

  const PRELUDE = function () {
    var FMR = (window.__fm = { logs: [], errors: [], alerts: [], runId: '__RUNID__' });
    function fmt(v, depth) {
      depth = depth || 0;
      if (typeof v === 'string') return depth ? JSON.stringify(v) : v;
      if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonymous') + '()';
      if (typeof v === 'symbol') return v.toString();
      if (typeof v === 'bigint') return v + 'n';
      if (v === undefined) return 'undefined';
      if (v === null) return 'null';
      if (typeof v !== 'object') return String(v);
      if (depth > 3) return Array.isArray(v) ? '[…]' : '{…}';
      if (v instanceof Error) return v.name + ': ' + v.message;
      if (typeof Element !== 'undefined' && v instanceof Element) {
        var s = '<' + v.tagName.toLowerCase();
        if (v.id) s += ' id="' + v.id + '"';
        if (v.className && typeof v.className === 'string') s += ' class="' + v.className + '"';
        return s + '>';
      }
      if (typeof NodeList !== 'undefined' && v instanceof NodeList) v = Array.prototype.slice.call(v);
      if (Array.isArray(v)) return '[' + v.map(function (x) { return fmt(x, depth + 1); }).join(', ') + ']';
      try {
        var keys = Object.keys(v);
        if (!keys.length) return '{}';
        return '{ ' + keys.map(function (k) { return (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ': ' + fmt(v[k], depth + 1); }).join(', ') + ' }';
      } catch (e) {
        return String(v);
      }
    }
    function send(level, text) {
      try {
        parent.postMessage({ fm: 'log', runId: FMR.runId, level: level, text: text }, '*');
      } catch (e) {}
    }
    ['log', 'info', 'warn', 'error', 'debug', 'table'].forEach(function (level) {
      var orig = console[level];
      console[level] = function () {
        var text = Array.prototype.map.call(arguments, function (a) { return fmt(a, 0); }).join(' ');
        if (level === 'log' || level === 'info' || level === 'debug' || level === 'table') FMR.logs.push(text);
        if (level === 'error') FMR.errors.push(text);
        send(level === 'info' || level === 'debug' || level === 'table' ? 'log' : level, text);
        try { orig && orig.apply(console, arguments); } catch (e) {}
      };
    });
    // Learner code gets its own localStorage, so a lesson that calls
    // localStorage.clear() can't wipe the app's progress (same origin).
    try {
      var real = window.localStorage;
      var P = 'fm.sandbox:';
      var own = function () {
        var out = [];
        for (var i = 0; i < real.length; i++) {
          var k = real.key(i);
          if (k && k.indexOf(P) === 0) out.push(k.slice(P.length));
        }
        return out;
      };
      var box = {
        getItem: function (k) { return real.getItem(P + k); },
        setItem: function (k, v) { real.setItem(P + k, String(v)); },
        removeItem: function (k) { real.removeItem(P + k); },
        clear: function () { own().forEach(function (k) { real.removeItem(P + k); }); },
        key: function (i) { return own()[i] === undefined ? null : own()[i]; },
      };
      Object.defineProperty(box, 'length', { get: function () { return own().length; } });
      Object.defineProperty(window, 'localStorage', { value: box, configurable: true });
    } catch (e) {}
    window.alert = function (msg) {
      var text = fmt(msg === undefined ? '' : msg, 0);
      FMR.alerts.push(text);
      send('alert', text);
    };
    window.addEventListener('error', function (e) {
      if (e.target && e.target !== window && e.target.tagName) {
        var src = e.target.src || e.target.href || '';
        send('warn', 'Could not load ' + e.target.tagName.toLowerCase() + (src ? ': ' + src : ''));
        return;
      }
      var line = e.lineno && window.__fmJsLine ? e.lineno - window.__fmJsLine + 1 : 0;
      var msg = (e.error && e.error.name ? e.error.name + ': ' + e.error.message : e.message || 'Error').replace(/^Uncaught /, '');
      if (line > 0) msg += '  (JS line ' + line + ')';
      FMR.errors.push(msg);
      send('error', msg);
    }, true);
    window.addEventListener('unhandledrejection', function (e) {
      var r = e.reason;
      var msg = r && r.message ? (r.name || 'Error') + ': ' + r.message : String(r);
      FMR.errors.push(msg);
      send('error', msg);
    });
    window.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        e.preventDefault();
        var t = href.length > 1 && document.getElementById(decodeURIComponent(href.slice(1)));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      e.preventDefault();
      if (/^(https?:|mailto:|tel:)/i.test(href)) send('info', 'Link clicked → ' + href + ' (opens in a real site; the preview stays put)');
      else send('info', 'Link clicked → ' + href + ' (that page only exists on a real site)');
    });
    window.addEventListener('submit', function (e) {
      if (!e.defaultPrevented) {
        e.preventDefault();
        send('info', 'Form submitted (the preview blocked the page reload — use event.preventDefault() in your own code)');
      }
    });
  };

  const PRELUDE_SRC = '(' + PRELUDE.toString() + ')();';

  /* ── building the document ───────────────────────────────────────────── */

  const lineOf = (s, idx) => s.slice(0, idx).split('\n').length;

  FM.buildDoc = function (files, opts) {
    opts = opts || {};
    const runId = opts.runId || FM.uid();
    let html = files.html || '';
    const css = files.css || '';
    let js = files.js || '';
    const guard = opts.guard !== false;

    if (guard) html = html.replace(/(<script\b(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, a, b, c) => a + FM.guard(b) + c);
    if (guard && js) js = FM.guard(js);

    const prelude = '<script>' + PRELUDE_SRC.replace('__RUNID__', runId) + GUARD_FN + '</script>';
    const style = css ? '<style>\n' + css + '\n</style>' : '';
    const base = opts.base ? '<style>' + opts.base + '</style>' : '';

    let doc;
    const isFull = /<html[\s>]|<!doctype/i.test(html);
    if (isFull) {
      doc = html;
      const headOpen = /<head[^>]*>/i.exec(doc);
      const htmlOpen = /<html[^>]*>/i.exec(doc);
      if (headOpen) doc = doc.slice(0, headOpen.index + headOpen[0].length) + prelude + base + doc.slice(headOpen.index + headOpen[0].length);
      else if (htmlOpen) doc = doc.slice(0, htmlOpen.index + htmlOpen[0].length) + prelude + base + doc.slice(htmlOpen.index + htmlOpen[0].length);
      else doc = prelude + base + doc;
      if (style) {
        const hc = doc.search(/<\/head>/i);
        if (hc >= 0) doc = doc.slice(0, hc) + style + doc.slice(hc);
        else doc = doc.replace(/<body[^>]*>/i, (m) => style + m) || doc + style;
        if (!doc.includes(style)) doc = style + doc;
      }
    } else {
      doc = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' + prelude + base + style + '</head><body>\n' + html + '\n</body></html>';
    }

    if (js) {
      const marker = '<script>window.__fmJsLine=0;</script><script>';
      const bc = doc.search(/<\/body>\s*(<\/html>\s*)?$/i);
      let pre = bc >= 0 ? doc.slice(0, bc) : doc;
      const post = bc >= 0 ? doc.slice(bc) : '';
      pre += marker + '\n';
      const startLine = lineOf(pre, pre.length);
      pre = pre.replace('window.__fmJsLine=0;', 'window.__fmJsLine=' + startLine + ';');
      doc = pre + js + '\n</script>' + post;
    }
    return { doc, runId };
  };

  /* ── running ─────────────────────────────────────────────────────────── */

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  FM.sleep = sleep;

  // Load files into an iframe. Resolves once the page has loaded and settled.
  FM.load = function (iframe, files, opts) {
    opts = opts || {};
    const built = FM.buildDoc(files, opts);
    iframe.dataset.runId = built.runId;
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        iframe.removeEventListener('load', finish);
        setTimeout(() => resolve(built.runId), opts.settle == null ? 60 : opts.settle);
      };
      iframe.addEventListener('load', finish);
      setTimeout(finish, 4000);
      iframe.srcdoc = built.doc;
    });
  };

  /* ── the check toolkit ───────────────────────────────────────────────── */

  function normSel(s) {
    return String(s).replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1').replace(/::?(before|after)\b/g, '::$1').trim().toLowerCase();
  }

  FM.context = function (iframe, files) {
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    const rec = (win && win.__fm) || { logs: [], errors: [], alerts: [] };
    const el = (t) => (typeof t === 'string' ? doc.querySelector(t) : t);

    const allRules = () => {
      const out = [];
      const walk = (rules, media) => {
        for (const r of rules) {
          if (r.selectorText != null) out.push({ selector: r.selectorText, sel: normSel(r.selectorText), style: r.style, media, rule: r });
          else if (r.cssRules) walk(r.cssRules, r.conditionText || (r.media && r.media.mediaText) || media);
        }
      };
      for (const sh of doc.styleSheets) {
        try {
          walk(sh.cssRules, null);
        } catch (e) {}
      }
      return out;
    };

    const c = {
      win,
      doc,
      html: files.html || '',
      css: files.css || '',
      js: files.js || '',
      get code() {
        return [this.html, this.css, this.js].join('\n');
      },
      get logs() {
        return rec.logs.slice();
      },
      get errors() {
        return rec.errors.slice();
      },
      alerts: rec.alerts,
      $: (s) => doc.querySelector(s),
      $$: (s) => Array.from(doc.querySelectorAll(s)),
      text: (t) => {
        const e = el(t);
        return e ? e.textContent.replace(/\s+/g, ' ').trim() : '';
      },
      style: (t, prop) => {
        const e = el(t);
        return e ? win.getComputedStyle(e).getPropertyValue(prop).trim() : '';
      },
      px: (t, prop) => parseFloat(c.style(t, prop)) || 0,
      // Any CSS colour → the rgb() string getComputedStyle returns.
      rgb: (color) => {
        const probe = doc.createElement('span');
        probe.style.color = color;
        (doc.body || doc.documentElement).appendChild(probe);
        const v = win.getComputedStyle(probe).color;
        probe.remove();
        return v;
      },
      sameColor: (a, b) => c.rgb(a) === c.rgb(b),
      rules: allRules,
      rule: (selector, media) => {
        const want = normSel(selector);
        const found = allRules().filter((r) => r.sel === want || r.sel.split(',').includes(want));
        const pick = media === undefined ? found : found.filter((r) => (media ? r.media && r.media.includes(media) : !r.media));
        return pick.length ? pick[pick.length - 1].style : null;
      },
      // The value of a property in the CSS rule for a selector (as written).
      decl: (selector, prop, media) => {
        const st = c.rule(selector, media);
        return st ? st.getPropertyValue(prop).trim() : '';
      },
      media: () => allRules().filter((r) => r.media),
      val: (name) => {
        try {
          return win.eval(name);
        } catch (e) {
          return undefined;
        }
      },
      has: (name) => {
        try {
          return win.eval('typeof ' + name) !== 'undefined';
        } catch (e) {
          return false;
        }
      },
      fn: (name) => {
        const f = c.val(name);
        return typeof f === 'function' ? f : null;
      },
      // Call a learner's function, capturing anything it logs.
      call: (name, ...args) => {
        const f = c.fn(name);
        if (!f) throw new Error('no function ' + name);
        const before = rec.logs.length;
        const result = f.apply(win, args);
        return { result, logs: rec.logs.slice(before) };
      },
      newLogs: (since) => rec.logs.slice(since),
      logCount: () => rec.logs.length,
      liveLogs: () => rec.logs.slice(),
      click: (t) => {
        const e = el(t);
        if (!e) return false;
        e.click();
        return true;
      },
      type: (t, value) => {
        const e = el(t);
        if (!e) return false;
        e.focus && e.focus();
        e.value = value;
        e.dispatchEvent(new win.Event('input', { bubbles: true }));
        e.dispatchEvent(new win.Event('change', { bubbles: true }));
        return true;
      },
      submit: (t) => {
        const f = el(t || 'form');
        if (!f) return false;
        if (f.requestSubmit) f.requestSubmit();
        else f.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
        return true;
      },
      key: (t, key, type) => {
        const e = el(t) || doc;
        e.dispatchEvent(new win.KeyboardEvent(type || 'keydown', { key, bubbles: true }));
        return true;
      },
      wait: sleep,
      // Resize the preview so media queries can be tested. Always restored.
      viewport: async (w) => {
        if (!('fmWidth' in iframe.dataset)) iframe.dataset.fmWidth = iframe.style.width;
        iframe.style.width = w + 'px';
        iframe.style.maxWidth = 'none';
        await sleep(80);
      },
      // Strip comments so checks on source don't match commented-out code.
      src: (kind) => {
        const s = kind ? files[kind] || '' : [files.html, files.css, files.js].join('\n');
        return s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
      },
    };
    return c;
  };

  // Run every check. Each check is { text, test(c) } where test returns true
  // (pass), false (fail) or a string (fail, with that as the explanation).
  FM.check = async function (iframe, files, checks, opts) {
    opts = opts || {};
    await FM.load(iframe, files, { settle: opts.settle });
    if (opts.wait) await sleep(opts.wait);
    const c = FM.context(iframe, files);
    const results = [];
    for (const ch of checks) {
      let ok = false;
      let msg = '';
      try {
        const r = await ch.test(c);
        if (typeof r === 'string') msg = r;
        else ok = !!r;
      } catch (e) {
        msg = '';
        if (opts.debug) msg = 'check threw: ' + e.message;
      }
      results.push({ ok, msg: ok ? '' : msg || ch.fail || '' });
    }
    if ('fmWidth' in iframe.dataset) {
      iframe.style.width = iframe.dataset.fmWidth;
      iframe.style.maxWidth = '';
      delete iframe.dataset.fmWidth;
    }
    return { results, passed: results.every((r) => r.ok), errors: c.errors, logs: c.liveLogs() };
  };
})();

/* Field Manual — code editor.
   A textarea laid exactly over a highlighted <pre>. The textarea does the
   typing (so undo, selection and mobile keyboards all behave natively); the
   <pre> underneath shows the colours. */
(function () {
  'use strict';
  const FM = window.FM;

  const PAIRS = { '(': ')', '[': ']', '{': '}' };
  const CLOSERS = new Set([')', ']', '}']);
  const VOID = new Set('area base br col embed hr img input link meta source track wbr'.split(' '));
  const IND = '  ';

  const COMMENT = {
    html: ['<!-- ', ' -->'],
    css: ['/* ', ' */'],
    js: ['// ', ''],
  };

  function insert(ta, text, selStart, selEnd) {
    ta.focus();
    if (selStart != null) ta.setSelectionRange(selStart, selEnd == null ? selStart : selEnd);
    let ok = false;
    try {
      ok = document.execCommand('insertText', false, text);
    } catch (e) {}
    if (!ok) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  FM.Editor = function (host, opts) {
    opts = opts || {};
    const lang = opts.lang || 'html';
    const wrap = document.createElement('div');
    wrap.className = 'ed' + (opts.readOnly ? ' ed-ro' : '');
    wrap.dataset.lang = lang;
    wrap.innerHTML =
      '<pre class="ed-hl" aria-hidden="true"><code></code></pre>' +
      '<textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="soft"></textarea>';
    host.appendChild(wrap);
    const code = wrap.querySelector('code');
    const ta = wrap.querySelector('textarea');
    ta.setAttribute('aria-label', opts.label || lang.toUpperCase() + ' code');
    if (opts.readOnly) ta.readOnly = true;
    ta.value = opts.value || '';

    let raf = 0;
    const paint = () => {
      raf = 0;
      // The trailing space keeps a final empty line from collapsing.
      code.innerHTML = FM.hl(ta.value, lang) + ' ';
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();

    ta.addEventListener('input', () => {
      paint();
      opts.onChange && opts.onChange(ta.value);
    });

    ta.addEventListener('keydown', (e) => {
      if (ta.readOnly) return;
      const v = ta.value;
      const s = ta.selectionStart;
      const en = ta.selectionEnd;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') return; // handled by the page

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleComment();
        return;
      }

      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (wrap.dataset.tabEscape === '1') return; // let focus move on
        e.preventDefault();
        const multi = v.slice(s, en).includes('\n');
        if (!multi && !e.shiftKey) {
          insert(ta, IND);
          return;
        }
        const blockEnd = v.indexOf('\n', en - (en > s && v[en - 1] === '\n' ? 1 : 0));
        const end = blockEnd < 0 ? v.length : blockEnd;
        const block = v.slice(lineStart, end);
        const lines = block.split('\n');
        const changed = lines.map((l) => (e.shiftKey ? l.replace(/^ {1,2}/, '') : IND + l)).join('\n');
        insert(ta, changed, lineStart, end);
        ta.setSelectionRange(lineStart, lineStart + changed.length);
        return;
      }

      if (e.key === 'Escape') {
        // Escape, then Tab, moves focus out of the editor (keyboard users).
        wrap.dataset.tabEscape = '1';
        setTimeout(() => (wrap.dataset.tabEscape = ''), 1500);
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const line = v.slice(lineStart, s);
        const indent = line.match(/^\s*/)[0];
        const before = v.slice(0, s);
        const after = v.slice(en);
        const prevCh = before.replace(/[ \t]+$/, '').slice(-1);
        const nextCh = after.replace(/^[ \t]+/, '')[0];
        let extra = '';
        let closeLine = false;
        if (PAIRS[prevCh]) {
          extra = IND;
          if (nextCh === PAIRS[prevCh]) closeLine = true;
        } else if (lang === 'html') {
          const open = /<([a-zA-Z][\w-]*)(\s[^<>]*)?>\s*$/.exec(line);
          if (open && !VOID.has(open[1].toLowerCase()) && !/\/\s*>\s*$/.test(line)) {
            extra = IND;
            if (new RegExp('^\\s*</' + open[1] + '\\s*>', 'i').test(after)) closeLine = true;
          }
        }
        if (closeLine) {
          insert(ta, '\n' + indent + extra + '\n' + indent);
          const pos = s + 1 + indent.length + extra.length;
          ta.setSelectionRange(pos, pos);
        } else {
          insert(ta, '\n' + indent + extra);
        }
        return;
      }

      if (PAIRS[e.key] && !e.ctrlKey && !e.metaKey) {
        const next = v[en];
        if (s !== en) {
          e.preventDefault();
          insert(ta, e.key + v.slice(s, en) + PAIRS[e.key]);
          return;
        }
        if (!next || /[\s)\]};,]/.test(next)) {
          e.preventDefault();
          insert(ta, e.key + PAIRS[e.key]);
          ta.setSelectionRange(s + 1, s + 1);
        }
        return;
      }

      if (CLOSERS.has(e.key) && s === en && v[s] === e.key) {
        e.preventDefault();
        ta.setSelectionRange(s + 1, s + 1);
        return;
      }

      if (e.key === 'Backspace' && s === en && s > 0) {
        const prev = v[s - 1];
        if (PAIRS[prev] && v[s] === PAIRS[prev]) {
          e.preventDefault();
          insert(ta, '', s - 1, s + 1);
          return;
        }
        // Backspace through soft-tab indentation two spaces at a time.
        const lead = v.slice(lineStart, s);
        if (lead.length >= 2 && /^ +$/.test(lead) && lead.length % 2 === 0) {
          e.preventDefault();
          insert(ta, '', s - 2, s);
        }
      }

      // Typing "</" closes the nearest open tag.
      if (lang === 'html' && e.key === '/' && v[s - 1] === '<' && s === en) {
        const tag = openTagBefore(v.slice(0, s - 1));
        if (tag) {
          e.preventDefault();
          const line2 = v.slice(lineStart, s - 1);
          const dedentBy = /^\s+$/.test(line2) && line2.length >= 2 ? 2 : 0;
          insert(ta, '</' + tag + '>', s - 1 - dedentBy, s);
        }
      }
    });

    function openTagBefore(text) {
      const re = /<\/?([a-zA-Z][\w-]*)(?:\s[^<>]*)?(\/?)>/g;
      const stack = [];
      let m;
      const stripped = text.replace(/<!--[\s\S]*?-->/g, '');
      while ((m = re.exec(stripped))) {
        const name = m[1].toLowerCase();
        if (VOID.has(name) || m[2] === '/') continue;
        if (m[0][1] === '/') {
          const k = stack.lastIndexOf(name);
          if (k >= 0) stack.length = k;
        } else stack.push(name);
      }
      return stack.pop() || '';
    }

    function toggleComment() {
      const v = ta.value;
      const s = ta.selectionStart;
      const en = ta.selectionEnd;
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      let le = v.indexOf('\n', en);
      if (le < 0) le = v.length;
      const block = v.slice(ls, le);
      const [o, c] = COMMENT[lang] || COMMENT.js;
      let out;
      if (lang === 'js') {
        const lines = block.split('\n');
        const all = lines.filter((l) => l.trim()).every((l) => /^\s*\/\//.test(l));
        out = lines.map((l) => (all ? l.replace(/^(\s*)\/\/ ?/, '$1') : l.trim() ? l.replace(/^(\s*)/, '$1// ') : l)).join('\n');
      } else {
        const t = block.trim();
        const lead = block.match(/^\s*/)[0];
        if (t.startsWith(o.trim()) && t.endsWith(c.trim())) out = lead + t.slice(o.trim().length, t.length - c.trim().length).trim();
        else out = lead + o + t + c;
      }
      insert(ta, out, ls, le);
    }

    const api = {
      el: wrap,
      textarea: ta,
      lang,
      get value() {
        return ta.value;
      },
      set value(v) {
        ta.value = v == null ? '' : v;
        paint();
      },
      focus() {
        ta.focus();
      },
      insert(text) {
        if (ta.readOnly) return;
        const s = ta.selectionStart;
        insert(ta, text);
        if (PAIRS[text]) {
          insert(ta, PAIRS[text]);
          ta.setSelectionRange(s + 1, s + 1);
        }
      },
      refresh: schedule,
    };
    return api;
  };

  /* ── the symbol bar for touch screens ───────────────────────────────── */

  const SYMBOLS = {
    html: ['<', '>', '/', '=', '"', "'", '!', '-', '#', ':', ';', 'Tab'],
    css: ['{', '}', ':', ';', '.', '#', '-', '%', '(', ')', '"', 'Tab'],
    js: ['(', ')', '{', '}', '[', ']', ';', '=', '"', "'", '`', '.', '+', '<', '>', '!', '&', '|', '$', 'Tab'],
  };

  FM.symbolBar = function (getEditor) {
    const bar = document.createElement('div');
    bar.className = 'symbar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Insert symbol');
    const render = () => {
      const ed = getEditor();
      if (!ed) return;
      bar.innerHTML = (SYMBOLS[ed.lang] || SYMBOLS.js).map((s) => '<button type="button" data-sym="' + FM.esc(s) + '">' + FM.esc(s) + '</button>').join('');
    };
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) e.preventDefault(); // keep the keyboard open
    });
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const ed = getEditor();
      if (!ed) return;
      ed.insert(b.dataset.sym === 'Tab' ? '  ' : b.dataset.sym);
    });
    bar.render = render;
    render();
    return bar;
  };
})();

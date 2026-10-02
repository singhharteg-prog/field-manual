/* Field Manual — core.
   The FM namespace, course registration, a small Markdown renderer and a
   syntax highlighter for HTML, CSS and JavaScript. No dependencies. */
(function () {
  'use strict';

  const FM = (window.FM = window.FM || {});

  /* ── helpers ─────────────────────────────────────────────────────────── */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  FM.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);

  // Strip the common indent from a template literal so content files can be
  // indented naturally. Leading and trailing blank lines go too.
  FM.dedent = function (s) {
    if (typeof s !== 'string') return s;
    const lines = s.replace(/\r/g, '').replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    let min = Infinity;
    for (const l of lines) if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length);
    if (!isFinite(min)) min = 0;
    return lines.map((l) => l.slice(min)).join('\n');
  };

  /* ── course registry ─────────────────────────────────────────────────── */

  FM.tracks = [];
  FM.trackById = {};
  FM.missions = [];
  FM.missionById = {};

  FM.track = function (t) {
    t.modules = t.modules || [];
    FM.tracks.push(t);
    FM.trackById[t.id] = t;
  };

  FM.modules = function (trackId, mods) {
    const t = FM.trackById[trackId];
    if (!t) throw new Error('Unknown track ' + trackId);
    t.modules.push(...mods);
  };

  const CODE_KEYS = ['html', 'css', 'js'];

  FM.finalize = function () {
    FM.missions = [];
    FM.missionById = {};
    FM.tracks.sort((a, b) => (a.order || 0) - (b.order || 0));
    for (const t of FM.tracks) {
      t.missions = [];
      t.modules.forEach((mod, mi) => {
        mod.index = mi;
        mod.track = t;
        for (const m of mod.missions) {
          m.track = t;
          m.module = mod;
          m.trackIndex = t.missions.length;
          m.index = FM.missions.length;
          (m.steps || []).forEach((s, i) => {
            s.index = i;
            s.mission = m;
            for (const k of CODE_KEYS) if (typeof s[k] === 'string') s[k] = FM.dedent(s[k]);
            if (typeof s.code === 'string') s.code = FM.dedent(s.code);
            if (s.solution) for (const k of CODE_KEYS) if (typeof s.solution[k] === 'string') s.solution[k] = FM.dedent(s.solution[k]);
          });
          if (FM.missionById[m.id]) console.warn('Duplicate mission id', m.id);
          FM.missionById[m.id] = m;
          t.missions.push(m);
          FM.missions.push(m);
        }
      });
    }
    for (const t of FM.tracks) {
      t.missions.forEach((m, i) => {
        m.prev = t.missions[i - 1] || null;
        m.next = t.missions[i + 1] || null;
      });
    }
  };

  /* ── syntax highlighting ─────────────────────────────────────────────── */

  const sp = (cls, text) => '<span class="t-' + cls + '">' + FM.esc(text) + '</span>';

  const JS_KW = new Set(
    ('const let var function return if else for while do break continue switch case default new this ' +
      'class extends super import export from try catch finally throw typeof instanceof in of async await ' +
      'yield delete void').split(' ')
  );
  const JS_LIT = new Set('true false null undefined NaN Infinity'.split(' '));

  function hlJS(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (ch === '/' && src[i + 1] === '/') {
        let j = src.indexOf('\n', i);
        if (j < 0) j = n;
        out += sp('com', src.slice(i, j));
        i = j;
        continue;
      }
      if (ch === '/' && src[i + 1] === '*') {
        let j = src.indexOf('*/', i + 2);
        j = j < 0 ? n : j + 2;
        out += sp('com', src.slice(i, j));
        i = j;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        let j = i + 1;
        while (j < n && src[j] !== ch) {
          if (src[j] === '\\') j++;
          else if (ch !== '`' && src[j] === '\n') break;
          j++;
        }
        j = Math.min(j + 1, n);
        out += sp('str', src.slice(i, j));
        i = j;
        continue;
      }
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        const m = /^(0[xob][\da-f_]+|\d[\d_]*\.?\d*(?:e[+-]?\d+)?|\.\d+)n?/i.exec(src.slice(i));
        out += sp('num', m[0]);
        i += m[0].length;
        continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
        const w = m[0];
        const prev = src[i - 1];
        const after = src.slice(i + w.length).match(/^\s*(.)/);
        if (prev !== '.' && JS_KW.has(w)) out += sp('kw', w);
        else if (JS_LIT.has(w)) out += sp('num', w);
        else if (after && after[1] === '(') out += sp('fn', w);
        else if (prev === '.') out += sp('prop', w);
        else out += FM.esc(w);
        i += w.length;
        continue;
      }
      if (/[{}()[\];,.]/.test(ch)) {
        out += sp('punc', ch);
        i++;
        continue;
      }
      if (/[=+\-*/%<>!&|?:^~]/.test(ch)) {
        let j = i;
        while (j < n && /[=+\-*/%<>!&|?:^~]/.test(src[j]) && !(src[j] === '/' && /[/*]/.test(src[j + 1]))) j++;
        if (j === i) j++;
        out += sp('op', src.slice(i, j));
        i = j;
        continue;
      }
      out += FM.esc(ch);
      i++;
    }
    return out;
  }

  function hlCSSValue(v) {
    let out = '';
    let i = 0;
    const n = v.length;
    while (i < n) {
      const rest = v.slice(i);
      let m;
      if ((m = /^\/\*[\s\S]*?(\*\/|$)/.exec(rest))) out += sp('com', m[0]);
      else if ((m = /^("[^"\n]*"?|'[^'\n]*'?)/.exec(rest))) out += sp('str', m[0]);
      else if ((m = /^#[\da-fA-F]{3,8}\b/.exec(rest))) out += sp('num', m[0]);
      else if ((m = /^-?(\d+\.?\d*|\.\d+)([a-z%]+)?/i.exec(rest))) out += sp('num', m[0]);
      else if ((m = /^!important/.exec(rest))) out += sp('kw', m[0]);
      else if ((m = /^[a-zA-Z-][\w-]*(?=\()/.exec(rest))) out += sp('fn', m[0]);
      else if ((m = /^--[\w-]+/.exec(rest))) out += sp('prop', m[0]);
      else if ((m = /^[a-zA-Z-][\w-]*/.exec(rest))) out += sp('val', m[0]);
      else m = [rest[0]], (out += FM.esc(rest[0]));
      i += m[0].length;
    }
    return out;
  }

  function hlCSS(src) {
    let out = '';
    let i = 0;
    let depth = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (/\s/.test(ch)) {
        out += ch;
        i++;
        continue;
      }
      if (ch === '/' && src[i + 1] === '*') {
        let j = src.indexOf('*/', i + 2);
        j = j < 0 ? n : j + 2;
        out += sp('com', src.slice(i, j));
        i = j;
        continue;
      }
      if (ch === '}') {
        out += sp('punc', ch);
        depth = Math.max(0, depth - 1);
        i++;
        continue;
      }
      if (ch === '{') {
        out += sp('punc', ch);
        depth++;
        i++;
        continue;
      }
      // Is this a selector/at-rule (ends in "{") or a declaration (ends in ";" or "}")?
      let j = i;
      let end = n;
      let kind = depth === 0 ? 'sel' : 'decl';
      while (j < n) {
        const c = src[j];
        if (c === '/' && src[j + 1] === '*') {
          const k = src.indexOf('*/', j + 2);
          j = k < 0 ? n : k + 2;
          continue;
        }
        if (c === '"' || c === "'") {
          const k = src.indexOf(c, j + 1);
          j = k < 0 ? n : k + 1;
          continue;
        }
        if (c === '{') {
          kind = 'sel';
          end = j;
          break;
        }
        if (c === ';' || c === '}') {
          if (depth > 0) kind = 'decl';
          end = j;
          break;
        }
        j++;
      }
      if (j >= n) end = n;
      const chunk = src.slice(i, end);
      if (kind === 'sel') {
        if (chunk.trim().startsWith('@')) {
          const m = /^(@[\w-]+)([\s\S]*)$/.exec(chunk);
          out += sp('at', m[1]) + hlCSSValue(m[2]);
        } else {
          out += sp('sel', chunk);
        }
      } else {
        const c = chunk.indexOf(':');
        if (c < 0) out += chunk.trim().startsWith('@') ? sp('at', chunk) : sp('prop', chunk);
        else out += sp('prop', chunk.slice(0, c)) + sp('punc', ':') + hlCSSValue(chunk.slice(c + 1));
      }
      i = end;
      if (src[i] === ';') {
        out += sp('punc', ';');
        i++;
      }
    }
    return out;
  }

  function hlHTML(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      if (src.startsWith('<!--', i)) {
        let j = src.indexOf('-->', i + 4);
        j = j < 0 ? n : j + 3;
        out += sp('com', src.slice(i, j));
        i = j;
        continue;
      }
      if (src[i] === '<' && /[!/A-Za-z]/.test(src[i + 1] || '')) {
        let j = i + 1;
        const closing = src[j] === '/';
        if (closing) j++;
        if (src[j] === '!') {
          let k = src.indexOf('>', j);
          k = k < 0 ? n : k + 1;
          out += sp('doc', src.slice(i, k));
          i = k;
          continue;
        }
        const nm = /^[A-Za-z][\w-]*/.exec(src.slice(j));
        if (!nm) {
          out += FM.esc(src[i]);
          i++;
          continue;
        }
        const name = nm[0];
        out += sp('punc', closing ? '</' : '<') + sp('tag', name);
        j += name.length;
        let afterEq = false;
        while (j < n && src[j] !== '>' && src[j] !== '<') {
          const rest = src.slice(j);
          let m;
          if ((m = /^\s+/.exec(rest))) out += m[0];
          else if ((m = /^=/.exec(rest))) (out += sp('punc', '=')), (afterEq = true);
          else if ((m = /^("[^"]*"?|'[^']*'?)/.exec(rest))) (out += sp('str', m[0])), (afterEq = false);
          else if ((m = /^\/(?=\s*>)/.exec(rest))) out += sp('punc', '/');
          else if ((m = /^[^\s=>/"'<]+/.exec(rest))) (out += sp(afterEq ? 'str' : 'attr', m[0])), (afterEq = false);
          else m = [rest[0]], (out += FM.esc(rest[0]));
          j += m[0].length;
        }
        if (src[j] === '>') {
          out += sp('punc', '>');
          j++;
        }
        i = j;
        const lower = name.toLowerCase();
        if (!closing && (lower === 'style' || lower === 'script')) {
          const e0 = src.toLowerCase().indexOf('</' + lower, i);
          const e = e0 < 0 ? n : e0;
          out += (lower === 'style' ? hlCSS : hlJS)(src.slice(i, e));
          i = e;
        }
        continue;
      }
      if (src[i] === '&') {
        const m = /^&[#\w]+;/.exec(src.slice(i));
        if (m) {
          out += sp('ent', m[0]);
          i += m[0].length;
          continue;
        }
      }
      let j = i + 1;
      while (j < n && src[j] !== '<' && src[j] !== '&') j++;
      out += FM.esc(src.slice(i, j));
      i = j;
    }
    return out;
  }

  FM.hl = function (code, lang) {
    code = String(code == null ? '' : code);
    lang = (lang || '').toLowerCase();
    try {
      if (lang === 'html' || lang === 'xml' || lang === 'svg') return hlHTML(code);
      if (lang === 'css') return hlCSS(code);
      if (lang === 'js' || lang === 'javascript' || lang === 'json') return hlJS(code);
    } catch (e) {
      console.warn('highlight failed', e);
    }
    return FM.esc(code);
  };

  /* ── markdown (a small, predictable subset) ──────────────────────────── */
  // Supported: paragraphs, ## headings, **bold**, *italic*, `code`,
  // [links](url), - lists, 1. lists, ``` fenced code ```, | tables |,
  // "> " notes and ">! " warnings.

  function inline(s) {
    const codes = [];
    s = String(s).replace(/`([^`]+)`/g, (_, c) => {
      codes.push(c);
      return '\u0000' + (codes.length - 1) + '\u0000';
    });
    s = FM.esc(s);
    s = s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^\w*])\*(?![\s*])(.+?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|\s)--(\s)/g, '$1—$2');
    s = s.replace(/\u0000(\d+)\u0000/g, (_, k) => '<code class="icode">' + FM.esc(codes[k]) + '</code>');
    return s;
  }
  FM.inline = inline;

  const BLOCK_START = /^(```|>|\||#{2,4}\s|\s*[-*]\s+|\s*\d+\.\s+)/;

  FM.md = function (src) {
    if (!src) return '';
    const lines = FM.dedent(String(src)).split('\n');
    let html = '';
    let i = 0;
    const n = lines.length;
    while (i < n) {
      const line = lines[i];
      let m;
      if (!line.trim()) {
        i++;
        continue;
      }
      if ((m = /^```(\w*)\s*$/.exec(line))) {
        const lang = m[1];
        const buf = [];
        i++;
        while (i < n && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;
        html += '<pre class="code" data-lang="' + FM.esc(lang) + '"><code>' + FM.hl(buf.join('\n'), lang) + '</code></pre>';
        continue;
      }
      if ((m = /^#{2,4}\s+(.*)$/.exec(line))) {
        html += '<h4>' + inline(m[1]) + '</h4>';
        i++;
        continue;
      }
      if (/^>/.test(line)) {
        const warn = /^>!/.test(line);
        const buf = [];
        while (i < n && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>!?\s?/, ''));
        html += '<aside class="note' + (warn ? ' warn' : '') + '">' + FM.md(buf.join('\n')) + '</aside>';
        continue;
      }
      if (/^\|/.test(line)) {
        const rows = [];
        while (i < n && /^\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = (r) => r.replace(/^\||\|\s*$/g, '').split('|').map((c) => c.trim());
        let head = null;
        if (rows[1] && /^\|?\s*:?-{2,}/.test(rows[1])) {
          head = cells(rows[0]);
          rows.splice(0, 2);
        }
        html += '<div class="tbl"><table>';
        if (head) html += '<thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead>';
        html += '<tbody>' + rows.map((r) => '<tr>' + cells(r).map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
        continue;
      }
      if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
        const ordered = /^\s*\d+\.\s+/.test(line);
        const re = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
        const items = [];
        while (i < n && (re.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
          if (re.test(lines[i])) items.push(lines[i].replace(re, ''));
          else items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        }
        const tag = ordered ? 'ol' : 'ul';
        html += '<' + tag + '>' + items.map((t) => '<li>' + inline(t) + '</li>').join('') + '</' + tag + '>';
        continue;
      }
      const buf = [];
      while (i < n && lines[i].trim() && !(buf.length && BLOCK_START.test(lines[i]))) buf.push(lines[i++].trim());
      html += '<p>' + inline(buf.join(' ')) + '</p>';
    }
    return html;
  };

  /* ── misc ────────────────────────────────────────────────────────────── */

  FM.today = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  FM.uid = () => Math.random().toString(36).slice(2, 10);
})();

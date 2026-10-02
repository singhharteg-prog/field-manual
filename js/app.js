/* Field Manual — the app.
   Hash routes, every screen, the mission player and the shared workbench. */
(function () {
  'use strict';
  const FM = window.FM;
  const S = FM.store;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = FM.esc;
  const view = $('#view');

  /* ── events ──────────────────────────────────────────────────────────── */

  const listeners = {};
  FM.on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
  FM.emit = (ev, data) => (listeners[ev] || []).forEach((fn) => fn(data));

  /* ── icons ───────────────────────────────────────────────────────────── */

  const ICON = {
    hq: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    drill: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
    intel: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7M9 8h3"/>',
    safe: '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5v1M12 14.5v1M8.5 12h1M14.5 12h1M6 20v1.5M18 20v1.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5 15a7.5 7.5 0 1 0 1.5-8.5L4 10"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
    flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1 1.5 2 1.5 3 1.5-1.5 2-4.5 1.5-8z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/>',
    console: '<path d="M4 6l6 6-6 6M12 18h8"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  };
  const icon = (name, cls) => '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICON[name] || '') + '</svg>';
  FM.icon = icon;

  /* ── small UI pieces ─────────────────────────────────────────────────── */

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  FM.toast = function (msg, kind) {
    const host = $('#toasts');
    const t = el('<div class="toast ' + (kind || '') + '" role="status">' + msg + '</div>');
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => t.remove(), 400);
    }, kind === 'long' ? 5200 : 2600);
  };

  FM.on('xp', ({ n }) => {
    FM.toast('<b>+' + n + ' XP</b>', 'xp');
    renderTopbar();
  });

  // Typewriter reveal for headings. Text is set immediately for screen
  // readers; the animation is visual only.
  function typeOut(node, text, speed) {
    if (!S.state.settings.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = text;
      return;
    }
    node.setAttribute('aria-label', text);
    node.textContent = '';
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    const caret = el('<span class="caret" aria-hidden="true"></span>');
    node.append(span, caret);
    let i = 0;
    const tick = () => {
      if (!node.isConnected) return;
      span.textContent = text.slice(0, ++i);
      if (S.state.settings.sound && i % 2 && text[i - 1] !== ' ') FM.sound('key');
      if (i < text.length) setTimeout(tick, speed || 28 + Math.random() * 30);
      else setTimeout(() => caret.remove(), 900);
    };
    tick();
  }

  function confirmBox(title, body, okLabel) {
    return new Promise((resolve) => {
      const d = el(
        '<dialog class="modal"><form method="dialog"><h3>' + esc(title) + '</h3><div class="md">' + FM.md(body) + '</div>' +
          '<div class="modal-actions"><button value="no" class="btn ghost">Cancel</button><button value="yes" class="btn primary">' + esc(okLabel || 'OK') + '</button></div></form></dialog>'
      );
      document.body.appendChild(d);
      d.addEventListener('close', () => {
        resolve(d.returnValue === 'yes');
        d.remove();
      });
      d.showModal();
    });
  }

  /* ── sound ───────────────────────────────────────────────────────────── */

  let actx = null;
  FM.sound = function (kind) {
    if (!S.state.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const g = actx.createGain();
      g.connect(actx.destination);
      if (kind === 'key' || kind === 'stamp') {
        const len = kind === 'key' ? 0.03 : 0.12;
        const buf = actx.createBuffer(1, actx.sampleRate * len, actx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, kind === 'key' ? 6 : 2);
        const src = actx.createBufferSource();
        src.buffer = buf;
        const f = actx.createBiquadFilter();
        f.type = kind === 'key' ? 'highpass' : 'lowpass';
        f.frequency.value = kind === 'key' ? 1800 : 500;
        src.connect(f).connect(g);
        g.gain.value = kind === 'key' ? 0.18 : 0.7;
        src.start(t);
      } else {
        const o = actx.createOscillator();
        o.type = kind === 'wrong' ? 'square' : 'sine';
        const freq = { bell: 1320, ok: 880, wrong: 140 }[kind] || 660;
        o.frequency.setValueAtTime(freq, t);
        if (kind === 'ok') o.frequency.setValueAtTime(1320, t + 0.09);
        g.gain.setValueAtTime(kind === 'wrong' ? 0.06 : 0.22, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'bell' ? 1.4 : 0.35));
        o.connect(g);
        o.start(t);
        o.stop(t + 1.5);
      }
    } catch (e) {}
  };

  /* ── theme ───────────────────────────────────────────────────────────── */

  const mq = matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    const pref = S.state.settings.theme;
    const t = pref === 'auto' ? (mq.matches ? 'night' : 'paper') : pref;
    document.documentElement.dataset.theme = t;
    document.documentElement.style.setProperty('--code-size', (S.state.settings.codeSize || 15) + 'px');
    document.documentElement.classList.toggle('no-motion', !S.state.settings.motion);
    document.documentElement.classList.toggle('wrap-code', !!S.state.settings.wrap);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === 'night' ? '#14130f' : '#e7dcc3';
    try {
      localStorage.setItem('fieldmanual.theme', t);
    } catch (e) {}
  }
  mq.addEventListener && mq.addEventListener('change', applyTheme);

  /* ── console messages from previews ──────────────────────────────────── */

  const consoles = new Map(); // runId → handler
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.fm !== 'log') return;
    const h = consoles.get(d.runId);
    if (h) h(d.level, d.text);
  });

  /* ── the workbench: editors + preview + console ─────────────────────── */
  // Used by exhibits, tasks and the Safehouse.
  //   files: { html?, css?, js? }   which keys exist = which tabs show
  //   edit:  [keys] editable (default: all)
  //   auto:  re-run on every change (default: true unless JS is editable)

  const LABEL = { html: 'HTML', css: 'CSS', js: 'JS' };
  const ORDER = ['html', 'css', 'js'];

  FM.workbench = function (host, opts) {
    const files = Object.assign({}, opts.files);
    const keys = ORDER.filter((k) => typeof files[k] === 'string');
    const editable = opts.edit || keys;
    const hasPage = keys.includes('html') || keys.includes('css') || opts.preview;
    const jsEditable = editable.includes('js');
    const auto = opts.auto != null ? opts.auto : !jsEditable;
    const wb = el(
      '<div class="wb' + (hasPage ? '' : ' wb-nopage') + (opts.compact ? ' wb-compact' : '') + '">' +
        '<div class="wb-code"><div class="wb-tabs" role="tablist"></div><div class="wb-panes"></div></div>' +
        '<div class="wb-out">' +
        '<div class="wb-out-head"><span class="wb-out-label">' + (hasPage ? icon('eye') + ' Result' : icon('console') + ' Console') + '</span>' +
        '<span class="wb-out-tools">' +
        (!auto || opts.runButton ? '<button type="button" class="btn small run" data-act="run" title="Run (Ctrl+Enter)">' + icon('play') + ' Run</button>' : '') +
        '</span></div>' +
        (hasPage ? '<div class="wb-frame-wrap"><iframe class="wb-frame" title="Result of your code" sandbox="allow-scripts allow-same-origin allow-modals allow-forms"></iframe></div>' : '') +
        '<div class="wb-console' + (hasPage ? ' collapsed' : '') + '" aria-live="polite"><div class="wb-console-head">' + icon('console') + ' Console <span class="wb-console-count"></span><button type="button" class="link" data-act="clear">clear</button></div><div class="wb-console-body"></div></div>' +
        '</div></div>'
    );
    host.appendChild(wb);
    const tabs = $('.wb-tabs', wb);
    const panes = $('.wb-panes', wb);
    const frame = $('.wb-frame', wb) || el('<iframe class="wb-frame wb-hidden" sandbox="allow-scripts allow-same-origin allow-modals allow-forms" tabindex="-1" aria-hidden="true"></iframe>');
    if (!hasPage) wb.appendChild(frame);
    const cons = $('.wb-console', wb);
    const consBody = $('.wb-console-body', wb);
    const consCount = $('.wb-console-count', wb);
    const editors = {};
    let active = opts.active && keys.includes(opts.active) ? opts.active : editable.find((k) => keys.includes(k)) || keys[0];
    let timer = 0;
    let lines = 0;

    keys.forEach((k) => {
      const ro = !editable.includes(k);
      tabs.appendChild(
        el('<button type="button" role="tab" class="wb-tab" data-k="' + k + '">' + LABEL[k] + (ro ? icon('lock', 'tiny') : '') + '</button>')
      );
      const pane = el('<div class="wb-pane" data-k="' + k + '"></div>');
      panes.appendChild(pane);
      editors[k] = FM.Editor(pane, {
        lang: k,
        value: files[k],
        readOnly: ro,
        label: LABEL[k] + ' code' + (ro ? ' (read only)' : ''),
        onChange: (v) => {
          files[k] = v;
          opts.onChange && opts.onChange(Object.assign({}, files));
          if (auto) {
            clearTimeout(timer);
            timer = setTimeout(run, 350);
          }
        },
      });
    });
    if (keys.length < 2 && !opts.showSingleTab) tabs.classList.add('single');
    if (keys.length === 1) tabs.dataset.lang = LABEL[keys[0]];

    const touch = matchMedia('(pointer: coarse)').matches;
    let bar = null;
    if (touch && editable.length) {
      bar = FM.symbolBar(() => editors[active]);
      $('.wb-code', wb).appendChild(bar);
    }

    function show(k) {
      active = k;
      $$('.wb-tab', tabs).forEach((t) => t.setAttribute('aria-selected', t.dataset.k === k));
      $$('.wb-pane', panes).forEach((p) => (p.hidden = p.dataset.k !== k));
      bar && bar.render();
    }
    tabs.addEventListener('click', (e) => {
      const t = e.target.closest('.wb-tab');
      if (t) show(t.dataset.k);
    });
    show(active);

    function log(level, text) {
      lines++;
      consBody.appendChild(el('<div class="cl cl-' + level + '">' + (level === 'alert' ? '<b>alert</b> ' : '') + esc(text) + '</div>'));
      consBody.scrollTop = consBody.scrollHeight;
      cons.classList.remove('collapsed');
      consCount.textContent = lines;
    }
    function clearConsole() {
      consBody.innerHTML = '';
      lines = 0;
      consCount.textContent = '';
      if (hasPage) cons.classList.add('collapsed');
    }

    function fit() {
      if (!opts.fit || !hasPage) return;
      try {
        const d = frame.contentDocument;
        const h = Math.max(d.documentElement.scrollHeight, d.body ? d.body.scrollHeight : 0);
        frame.style.height = Math.min(opts.maxHeight || 420, Math.max(opts.minHeight || 70, h + 4)) + 'px';
      } catch (e) {}
    }

    let lastRun = null;
    function bind(runId) {
      if (lastRun) consoles.delete(lastRun);
      lastRun = runId;
      consoles.set(runId, log);
    }

    async function run() {
      clearConsole();
      const p = FM.load(frame, files, { settle: 30 });
      bind(frame.dataset.runId);
      await p;
      fit();
      setTimeout(fit, 250);
      if (!hasPage && !lines) setTimeout(() => !lines && log('muted', 'No output. Use console.log(…) to print something.'), 120);
    }

    async function check(checks, checkOpts) {
      clearConsole();
      const runP = FM.check(frame, files, checks, checkOpts);
      bind(frame.dataset.runId);
      const r = await runP;
      fit();
      return r;
    }

    wb.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'run') run();
      if (b.dataset.act === 'clear') clearConsole();
    });

    const api = {
      el: wb,
      frame,
      editors,
      run,
      check,
      log,
      get files() {
        return Object.assign({}, files);
      },
      set(next) {
        for (const k of keys) if (typeof next[k] === 'string') {
          files[k] = next[k];
          editors[k].value = next[k];
        }
        opts.onChange && opts.onChange(Object.assign({}, files));
        run();
      },
      focus() {
        editors[active] && editors[active].focus();
      },
      destroy() {
        if (lastRun) consoles.delete(lastRun);
      },
    };
    run();
    return api;
  };

  /* ── router ──────────────────────────────────────────────────────────── */

  let cleanup = [];
  const onLeave = (fn) => cleanup.push(fn);

  function route() {
    cleanup.forEach((fn) => {
      try {
        fn();
      } catch (e) {}
    });
    cleanup = [];
    keyHandler = null;
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').map(decodeURIComponent);
    document.body.dataset.route = parts[0] || 'hq';
    window.scrollTo(0, 0);
    if (!S.state.agent && parts[0] !== 'settings') return viewRecruit();
    switch (parts[0]) {
      case '':
      case 'hq':
        return viewHQ();
      case 'track':
        return viewTrack(parts[1]);
      case 'm':
        return viewMission(parts[1], parts[2]);
      case 'drills':
        return viewDrills();
      case 'intel':
        return viewIntel();
      case 'safehouse':
        return viewSafehouse();
      case 'settings':
        return viewSettings();
      default:
        return viewHQ();
    }
  }
  const go = (hash) => {
    if (location.hash === hash) route();
    else location.hash = hash;
  };
  FM.go = go;

  /* ── top bar ─────────────────────────────────────────────────────────── */

  function renderTopbar() {
    const r = S.rank();
    const streak = S.streak();
    $('#xpchip').innerHTML =
      '<span class="xc-rank">' + esc(r.name) + '</span><span class="xc-xp">' + S.state.xp + ' XP</span>' +
      (streak ? '<span class="xc-streak" title="Days in a row">' + icon('flame', 'tiny') + streak + '</span>' : '');
    const due = S.state.agent ? S.drillDue().length : 0;
    $$('[data-due]').forEach((b) => {
      b.textContent = due > 0 ? due : '';
      b.hidden = !due;
    });
    const route = document.body.dataset.route;
    $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === route || (a.dataset.nav === 'hq' && (route === 'track' || route === 'm'))));
  }

  /* ── recruit (first run) ─────────────────────────────────────────────── */

  function viewRecruit() {
    document.body.dataset.route = 'recruit';
    view.innerHTML =
      '<section class="recruit sheet">' +
      '<div class="stamp stamp-top">Top secret</div>' +
      '<p class="kicker">Recruitment file · Web operations</p>' +
      '<h1 class="type" id="rt"></h1>' +
      '<div class="md">' +
      FM.md(`
        You're about to learn the three languages every website is built with: **HTML**, **CSS** and **JavaScript**.

        Here's how it works:

        - Each **mission** is short: 5–10 minutes of reading, examples and practice.
        - Every few cards there's a **field test**. You write real code and it gets checked straight away.
        - **Exhibits** are live examples. You can edit them and see what changes.
        - Your progress saves automatically in this browser.

        First, every agent needs a codename.
      `) +
      '</div>' +
      '<form class="recruit-form"><label for="cn">Codename</label><div class="row"><input id="cn" maxlength="24" autocomplete="off" placeholder="e.g. Nightingale" required><button class="btn primary">Begin training ' + icon('next') + '</button></div></form>' +
      '</section>';
    typeOut($('#rt'), 'Welcome, recruit.');
    $('#cn').focus();
    $('.recruit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#cn').value.trim();
      if (!name) return;
      S.state.agent = name;
      S.activity();
      S.save();
      FM.sound('stamp');
      go('#/');
    });
  }

  /* ── HQ ──────────────────────────────────────────────────────────────── */

  function greeting() {
    const h = new Date().getHours();
    return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  function dutyLog() {
    const days = S.state.days;
    const cells = [];
    const start = new Date();
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7 * 11);
    for (let i = 0; i < 7 * 12; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = FM.today(day);
      const n = days[key] || 0;
      const lvl = n === 0 ? 0 : n < 4 ? 1 : n < 10 ? 2 : 3;
      const future = day > new Date();
      cells.push('<i class="dl' + lvl + (future ? ' fut' : '') + '" title="' + key + (n ? ' · ' + n + ' actions' : '') + '"></i>');
    }
    return '<div class="dutylog" aria-label="Activity over the last 12 weeks">' + cells.join('') + '</div>';
  }

  function viewHQ() {
    const st = S.state;
    const r = S.rank();
    const next = S.nextMission();
    const doneCount = FM.missions.filter((m) => (st.missions[m.id] || {}).done).length;
    const due = S.drillDue().length;
    const resume = next
      ? (() => {
          const ms = S.peekMission(next.id);
          const started = ms && ms.seen > 0;
          return (
            '<a class="assignment sheet" href="#/m/' + next.id + '">' +
            '<span class="kicker">' + (started ? 'Resume assignment' : 'Next assignment') + ' · ' + esc(next.track.codename) + '</span>' +
            '<span class="as-title">' + esc(next.title) + '</span>' +
            '<span class="as-meta">' + esc(next.track.name) + ' · ' + esc(next.module.title) + ' · ' + icon('clock', 'tiny') + ' ' + (next.minutes || 6) + ' min</span>' +
            '<span class="btn primary">' + (started ? 'Resume' : 'Start') + ' mission ' + icon('next') + '</span>' +
            '</a>'
          );
        })()
      : '<div class="assignment sheet"><span class="kicker">All missions complete</span><span class="as-title">Every dossier is closed.</span><span class="as-meta">Keep sharp in the Drills, or build something in the Safehouse.</span></div>';

    view.innerHTML =
      '<div class="hq">' +
      '<section class="hq-hello"><p class="kicker">Headquarters · ' + new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + '</p><h1 class="type" id="hello"></h1></section>' +
      '<div class="hq-grid">' +
      '<div class="hq-main">' +
      resume +
      '<h2 class="section-title">Dossiers</h2><div class="dossiers">' +
      FM.tracks
        .map((t) => {
          const p = S.trackProgress(t);
          return (
            '<a class="folder" href="#/track/' + t.id + '" data-track="' + t.id + '">' +
            '<span class="folder-tab">' + esc(t.name) + '</span>' +
            '<span class="folder-body">' +
            '<span class="kicker">' + esc(t.codename) + '</span>' +
            '<span class="folder-title">' + esc(t.name) + '</span>' +
            '<span class="folder-tag">' + esc(t.tagline) + '</span>' +
            '<span class="bar"><i style="width:' + Math.round(p.pct * 100) + '%"></i></span>' +
            '<span class="folder-meta">' + p.done + ' / ' + p.total + ' missions' + (p.done === p.total && p.total ? ' · <b class="mini-stamp">Closed</b>' : '') + '</span>' +
            '</span></a>'
          );
        })
        .join('') +
      '</div></div>' +
      '<aside class="hq-side">' +
      '<div class="agent sheet">' +
      '<div class="agent-top"><div class="badge" aria-hidden="true">' + r.level + '</div><div><span class="kicker">Agent</span><strong class="agent-name">' + esc(st.agent) + '</strong><span class="agent-rank">' + esc(r.name) + '</span></div></div>' +
      '<div class="bar xp"><i style="width:' + Math.round(r.pct * 100) + '%"></i></div>' +
      '<p class="small muted">' + (r.to ? st.xp + ' / ' + r.to + ' XP to ' + esc(r.nextName) : st.xp + ' XP · highest rank') + '</p>' +
      '<div class="stats"><div><b>' + doneCount + '</b><span>missions</span></div><div><b>' + S.streak() + '</b><span>day streak</span></div><div><b>' + Object.keys(st.days).length + '</b><span>days active</span></div></div>' +
      '<p class="kicker">Duty log · 12 weeks</p>' + dutyLog() +
      '</div>' +
      '<a class="side-link sheet" href="#/drills">' + icon('drill') + '<span><b>Drills</b><span>' + (due ? due + ' question' + (due === 1 ? '' : 's') + ' due for review' : 'Nothing due. Practice anyway.') + '</span></span></a>' +
      '<a class="side-link sheet" href="#/safehouse">' + icon('safe') + '<span><b>Safehouse</b><span>Your private code playground.</span></span></a>' +
      '<a class="side-link sheet" href="#/intel">' + icon('intel') + '<span><b>Intel archive</b><span>Key points from every mission you\'ve done.</span></span></a>' +
      '</aside></div></div>';
    typeOut($('#hello'), greeting() + ', Agent ' + st.agent + '.');
    renderTopbar();
  }

  /* ── track ───────────────────────────────────────────────────────────── */

  function missionStatus(m) {
    const ms = S.peekMission(m.id);
    if (ms && ms.done) return 'done';
    if (ms && ms.seen > 0) return 'active';
    return 'new';
  }

  function viewTrack(id) {
    const t = FM.trackById[id];
    if (!t) return go('#/');
    const p = S.trackProgress(t);
    const next = t.missions.find((m) => missionStatus(m) !== 'done');
    let n = 0;
    view.innerHTML =
      '<div class="track" data-track="' + t.id + '">' +
      '<a class="crumb" href="#/">' + icon('back', 'tiny') + ' HQ</a>' +
      '<header class="track-head sheet"><div class="stamp stamp-corner">Classified</div><p class="kicker">Dossier · ' + esc(t.name) + '</p><h1 class="type" id="th"></h1><p class="lede">' + esc(t.tagline) + '</p>' +
      '<div class="bar"><i style="width:' + Math.round(p.pct * 100) + '%"></i></div><p class="small muted">' + p.done + ' of ' + p.total + ' missions complete</p>' +
      (next ? '<a class="btn primary" href="#/m/' + next.id + '">' + (missionStatus(next) === 'active' ? 'Resume' : 'Start') + ': ' + esc(next.title) + ' ' + icon('next') + '</a>' : '') +
      '</header>' +
      t.modules
        .map(
          (mod, mi) =>
            '<section class="phase"><h2 class="section-title"><span>Phase ' + (mi + 1) + '</span> ' + esc(mod.title) + '</h2><ol class="mlist">' +
            mod.missions
              .map((m) => {
                n++;
                const s = missionStatus(m);
                const tasks = m.steps.filter((x) => x.type === 'task').length;
                return (
                  '<li><a class="mrow ' + s + (m === next ? ' next' : '') + '" href="#/m/' + m.id + '">' +
                  '<span class="mnum">' + String(n).padStart(2, '0') + '</span>' +
                  '<span class="mtitle">' + esc(m.title) + '<span class="mmeta">' + icon('clock', 'tiny') + (m.minutes || 6) + ' min · ' + tasks + ' field test' + (tasks === 1 ? '' : 's') + '</span></span>' +
                  '<span class="mstate">' + (s === 'done' ? '<b class="mini-stamp ok">Complete</b>' : s === 'active' ? '<b class="mini-stamp warn">In progress</b>' : m === next ? '<b class="mini-stamp">Up next</b>' : '') + '</span>' +
                  '</a></li>'
                );
              })
              .join('') +
            '</ol></section>'
        )
        .join('') +
      '</div>';
    typeOut($('#th'), t.codename);
    renderTopbar();
  }

  /* ── answer helpers for quiz and fill ───────────────────────────────── */

  const shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Renders a quiz card. cb(correct, firstTry) fires on the first correct
  // answer (or on reveal, with correct=false).
  function renderQuiz(host, step, cb, opts) {
    opts = opts || {};
    const multi = Array.isArray(step.answer);
    const correctSet = new Set(multi ? step.answer : [step.answer]);
    const order = step.shuffle === false ? step.options.map((_, i) => i) : shuffle(step.options.map((_, i) => i));
    let tries = 0;
    let done = !!opts.done;
    const card = el(
      '<div class="quiz">' +
        '<div class="q md">' + FM.md(step.q) + '</div>' +
        (multi ? '<p class="small muted">Select every correct answer.</p>' : '') +
        '<div class="opts" role="' + (multi ? 'group' : 'radiogroup') + '">' +
        order
          .map(
            (oi, k) =>
              '<button type="button" class="opt" role="' + (multi ? 'checkbox' : 'radio') + '" aria-checked="false" data-i="' + oi + '"><span class="opt-key">' + 'ABCDEFG'[k] + '</span><span class="opt-text">' + FM.inline(step.options[oi]) + '</span></button>'
          )
          .join('') +
        '</div>' +
        '<div class="q-actions"><button type="button" class="btn primary" data-act="check" disabled>Check</button><button type="button" class="btn ghost" data-act="reveal" hidden>Show answer</button></div>' +
        '<div class="q-feedback" aria-live="polite"></div>' +
        '</div>'
    );
    host.appendChild(card);
    const chosen = new Set();
    const checkBtn = $('[data-act=check]', card);
    const revealBtn = $('[data-act=reveal]', card);
    const fb = $('.q-feedback', card);

    function finish(correct) {
      done = true;
      $$('.opt', card).forEach((b) => {
        b.disabled = true;
        if (correctSet.has(+b.dataset.i)) b.classList.add('right');
      });
      checkBtn.hidden = true;
      revealBtn.hidden = true;
      fb.innerHTML = '<div class="verdict ' + (correct ? 'ok' : 'shown') + '">' + (correct ? icon('check') + ' Correct.' : icon('key') + ' Here is the answer.') + '</div>' + (step.explain ? '<div class="md">' + FM.md(step.explain) + '</div>' : '');
    }
    if (done) finish(true);

    card.addEventListener('click', (e) => {
      if (done) return;
      const o = e.target.closest('.opt');
      if (o) {
        const i = +o.dataset.i;
        if (multi) chosen.has(i) ? chosen.delete(i) : chosen.add(i);
        else {
          chosen.clear();
          chosen.add(i);
        }
        $$('.opt', card).forEach((b) => {
          const on = chosen.has(+b.dataset.i);
          b.setAttribute('aria-checked', on);
          b.classList.toggle('sel', on);
          b.classList.remove('wrong');
        });
        checkBtn.disabled = !chosen.size;
        if (opts.autoCheck && !multi) checkBtn.click();
        return;
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'check') {
        tries++;
        const ok = chosen.size === correctSet.size && [...chosen].every((i) => correctSet.has(i));
        if (ok) {
          FM.sound('ok');
          finish(true);
          cb(true, tries === 1);
        } else {
          FM.sound('wrong');
          $$('.opt.sel', card).forEach((b) => {
            b.classList.add('wrong');
            b.classList.remove('sel');
            b.setAttribute('aria-checked', 'false');
          });
          chosen.clear();
          checkBtn.disabled = true;
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
          fb.innerHTML = '<div class="verdict bad">' + icon('x') + ' Not quite. ' + (multi ? 'Check every option carefully.' : 'Try again.') + '</div>' + (tries >= 1 && step.wrongHint ? '<div class="md small">' + FM.md(step.wrongHint) + '</div>' : '');
          if (tries >= 2) revealBtn.hidden = false;
        }
      }
      if (a.dataset.act === 'reveal') {
        finish(false);
        cb(false, false);
      }
    });
    return card;
  }
  FM.renderQuiz = renderQuiz;

  // Blanks are written [[answer]] or [[answer|alternative]] inside step.code.
  function parseBlanks(code) {
    const answers = [];
    const tpl = code.replace(/\[\[(.+?)\]\]/g, (_, a) => {
      answers.push(a.split('|'));
      return 'zqzb' + (answers.length - 1) + 'zqz';
    });
    return { tpl, answers };
  }
  FM.parseBlanks = parseBlanks;

  const normAns = (s, ci) => {
    s = String(s).trim().replace(/\s+/g, ' ').replace(/'/g, '"');
    return ci ? s.toLowerCase() : s;
  };

  function renderFill(host, step, cb, opts) {
    opts = opts || {};
    const { tpl, answers } = parseBlanks(step.code);
    const lang = step.lang || (step.mission && step.mission.track.lang) || 'html';
    // A zero-width space keeps "16[[px]]" from being read as one number token.
    let hl = FM.hl(tpl.replace(/([\w.])(zqzb\d+zqz)/g, '$1\u200b$2'), lang).replace(/\u200b/g, '');
    hl = hl.replace(/zqzb(\d+)zqz/g, (_, k) => {
      const w = Math.max(2, ...answers[k].map((a) => a.length)) + 1;
      return '<input class="blank" data-k="' + k + '" style="width:' + w + 'ch" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Blank ' + (+k + 1) + '">';
    });
    const bank = step.options ? shuffle(step.options) : null;
    let tries = 0;
    let done = false;
    const card = el(
      '<div class="fill">' +
        '<div class="q md">' + FM.md(step.q) + '</div>' +
        '<pre class="code fill-code" data-lang="' + lang + '"><code>' + hl + '</code></pre>' +
        (bank ? '<div class="bank">' + bank.map((w) => '<button type="button" class="chip" data-w="' + esc(w) + '">' + esc(w) + '</button>').join('') + '</div>' : '') +
        '<div class="q-actions"><button type="button" class="btn primary" data-act="check">Check</button><button type="button" class="btn ghost" data-act="reveal" hidden>Show answer</button></div>' +
        '<div class="q-feedback" aria-live="polite"></div>' +
        '</div>'
    );
    host.appendChild(card);
    const inputs = $$('.blank', card);
    const fb = $('.q-feedback', card);
    let focused = inputs[0];
    inputs.forEach((inp) => {
      inp.addEventListener('focus', () => (focused = inp));
      inp.addEventListener('input', () => inp.classList.remove('wrong', 'right'));
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          $('[data-act=check]', card).click();
        }
      });
    });

    function finish(correct) {
      done = true;
      inputs.forEach((inp) => {
        inp.value = answers[inp.dataset.k][0];
        inp.readOnly = true;
        inp.classList.remove('wrong');
        inp.classList.add('right');
      });
      $('.q-actions', card).hidden = true;
      bank && ($('.bank', card).hidden = true);
      fb.innerHTML = '<div class="verdict ' + (correct ? 'ok' : 'shown') + '">' + (correct ? icon('check') + ' Correct.' : icon('key') + ' Here is the answer.') + '</div>' + (step.explain ? '<div class="md">' + FM.md(step.explain) + '</div>' : '');
    }
    if (opts.done) finish(true);

    card.addEventListener('click', (e) => {
      if (done) return;
      const chip = e.target.closest('.chip');
      if (chip) {
        const target = focused && !focused.value ? focused : inputs.find((i) => !i.value) || focused;
        if (target) {
          target.value = chip.dataset.w;
          target.classList.remove('wrong');
          const nextEmpty = inputs.find((i) => !i.value);
          focused = nextEmpty || target;
        }
        return;
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'check') {
        if (inputs.some((i) => !i.value.trim())) {
          fb.innerHTML = '<div class="verdict bad">Fill in every blank first.</div>';
          return;
        }
        tries++;
        let ok = true;
        inputs.forEach((inp) => {
          const good = answers[inp.dataset.k].some((ans) => normAns(ans, step.ci) === normAns(inp.value, step.ci));
          inp.classList.toggle('wrong', !good);
          inp.classList.toggle('right', good);
          if (!good) ok = false;
        });
        if (ok) {
          FM.sound('ok');
          finish(true);
          cb(true, tries === 1);
        } else {
          FM.sound('wrong');
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
          fb.innerHTML = '<div class="verdict bad">' + icon('x') + ' Not quite — the red blanks are wrong.</div>';
          if (tries >= 2) $('[data-act=reveal]', card).hidden = false;
        }
      }
      if (a.dataset.act === 'reveal') {
        finish(false);
        cb(false, false);
      }
    });
    setTimeout(() => !opts.done && !matchMedia('(pointer: coarse)').matches && inputs[0] && inputs[0].focus({ preventScroll: true }), 50);
    return card;
  }
  FM.renderFill = renderFill;

  /* ── mission player ─────────────────────────────────────────────────── */

  const STEP_LABEL = {
    brief: 'Briefing',
    exhibit: 'Exhibit',
    quiz: 'Interrogation',
    fill: 'Decrypt',
    task: 'Field test',
    debrief: 'Debrief',
  };
  const INTERACTIVE = new Set(['quiz', 'fill', 'task']);
  let keyHandler = null;

  function viewMission(id, stepArg) {
    const m = FM.missionById[id];
    if (!m) return go('#/');
    const ms = S.mission(id);
    ms.ok = ms.ok || {};
    S.state.last = id;
    S.save();
    const total = m.steps.length;
    let idx = stepArg != null && stepArg !== '' ? Math.max(0, Math.min(total - 1, +stepArg || 0)) : ms.done ? 0 : Math.min(ms.step || 0, total - 1);
    if (!ms.done && idx > ms.seen) idx = ms.seen;
    let bench = null;

    view.innerHTML =
      '<div class="mission" data-track="' + m.track.id + '">' +
      '<header class="m-head">' +
      '<a class="crumb" href="#/track/' + m.track.id + '">' + icon('back', 'tiny') + ' ' + esc(m.track.name) + '</a>' +
      '<div class="m-title"><span class="kicker">' + esc(m.track.codename) + ' · Mission ' + (m.trackIndex + 1) + '</span><h1>' + esc(m.title) + '</h1></div>' +
      '<div class="dots" role="tablist" aria-label="Steps"></div>' +
      '</header>' +
      '<div class="m-body" id="stage"></div>' +
      '<footer class="m-foot"><div class="m-foot-in">' +
      '<button type="button" class="btn ghost" data-act="prev">' + icon('back') + '<span>Back</span></button>' +
      '<span class="m-count"></span>' +
      '<button type="button" class="btn primary" data-act="next"><span>Continue</span>' + icon('next') + '</button>' +
      '</div></footer>' +
      '</div>';

    const stage = $('#stage');
    const dots = $('.dots', view);
    const prevBtn = $('[data-act=prev]', view);
    const nextBtn = $('[data-act=next]', view);
    const count = $('.m-count', view);
    const mission = $('.mission', view);

    const isOk = (i) => !INTERACTIVE.has(m.steps[i].type) || !!ms.ok[i];

    function paintDots() {
      dots.innerHTML = m.steps
        .map((s, i) => {
          const reach = ms.done || i <= ms.seen;
          const cls = ['dot', 'd-' + s.type, i === idx ? 'cur' : '', reach ? 'reach' : '', isOk(i) && reach ? 'ok' : ''].join(' ');
          return '<button type="button" class="' + cls + '" data-i="' + i + '" ' + (reach ? '' : 'disabled') + ' title="' + (i + 1) + '. ' + STEP_LABEL[s.type] + '" aria-label="Step ' + (i + 1) + ': ' + STEP_LABEL[s.type] + '"></button>';
        })
        .join('');
    }

    function paintFoot() {
      prevBtn.disabled = idx === 0;
      const ok = isOk(idx);
      nextBtn.disabled = !ok;
      nextBtn.classList.toggle('ready', ok && INTERACTIVE.has(m.steps[idx].type));
      $('span', nextBtn).textContent = idx === total - 1 ? (ms.done ? 'Finish' : 'Complete mission') : ok || !INTERACTIVE.has(m.steps[idx].type) ? 'Continue' : m.steps[idx].type === 'task' ? 'Pass the test to continue' : 'Answer to continue';
      count.textContent = idx + 1 + ' / ' + total;
    }

    function award(i, xp) {
      if (ms.ok[i]) return;
      ms.ok[i] = true;
      ms.xp = (ms.xp || 0) + xp;
      S.addXP(xp);
      S.save();
      paintDots();
      paintFoot();
    }

    function show(i, dir) {
      if (bench) bench.destroy();
      bench = null;
      idx = i;
      ms.step = i;
      if (i > ms.seen) ms.seen = i;
      S.save();
      const step = m.steps[i];
      keyHandler = null;
      mission.classList.toggle('wide', step.type === 'task');
      const card = el(
        '<article class="card sheet step-' + step.type + (dir ? ' enter-' + dir : '') + '">' +
          '<div class="card-label"><span>' + STEP_LABEL[step.type] + (step.type === 'exhibit' ? ' ' + exhibitLetter(i) : '') + '</span>' + (step.type === 'task' ? '<span class="xp-tag">+20 XP</span>' : INTERACTIVE.has(step.type) ? '<span class="xp-tag">+10 XP</span>' : '') + '</div>' +
          '</article>'
      );
      stage.innerHTML = '';
      stage.appendChild(card);
      renderStep(card, step, i);
      paintDots();
      paintFoot();
      if (location.hash !== '#/m/' + m.id + '/' + i) history.replaceState(null, '', '#/m/' + m.id + '/' + i);
      if (dir) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    function exhibitLetter(i) {
      let n = 0;
      for (let k = 0; k <= i; k++) if (m.steps[k].type === 'exhibit') n++;
      return 'ABCDEFGHIJ'[n - 1] || n;
    }

    function renderStep(card, step, i) {
      if (step.title) card.appendChild(el('<h2 class="card-title">' + esc(step.title) + '</h2>'));
      if (step.type === 'brief') {
        card.appendChild(el('<div class="md">' + FM.md(step.body) + '</div>'));
      } else if (step.type === 'exhibit') {
        if (step.body) card.appendChild(el('<div class="md">' + FM.md(step.body) + '</div>'));
        const host = el('<div class="exhibit-host"></div>');
        card.appendChild(host);
        const files = pickFiles(step);
        bench = FM.workbench(host, { files, edit: step.edit, fit: true, compact: true, runButton: true, active: step.active, maxHeight: step.height || 360 });
        const tools = el('<div class="ex-tools"><button type="button" class="link" data-ex="reset">' + icon('reset', 'tiny') + ' Reset</button><button type="button" class="link" data-ex="safe">' + icon('safe', 'tiny') + ' Open in Safehouse</button></div>');
        card.appendChild(tools);
        tools.addEventListener('click', (e) => {
          const b = e.target.closest('[data-ex]');
          if (!b) return;
          if (b.dataset.ex === 'reset') bench.set(files);
          if (b.dataset.ex === 'safe') openInSafehouse(bench.files, m.title);
        });
        if (step.after) card.appendChild(el('<div class="md">' + FM.md(step.after) + '</div>'));
      } else if (step.type === 'quiz') {
        renderQuiz(card, step, (correct, first) => award(i, correct ? (first ? 10 : 5) : 0), { done: !!ms.ok[i] });
      } else if (step.type === 'fill') {
        renderFill(card, step, (correct, first) => award(i, correct ? (first ? 10 : 5) : 0), { done: !!ms.ok[i] });
      } else if (step.type === 'task') {
        renderTask(card, step, i);
      } else if (step.type === 'debrief') {
        card.appendChild(
          el('<div class="debrief"><p class="kicker">Intel filed to your archive</p><ul class="points">' + (step.points || []).map((p) => '<li>' + FM.inline(p) + '</li>').join('') + '</ul>' + (step.body ? '<div class="md">' + FM.md(step.body) + '</div>' : '') + '</div>')
        );
      }
    }

    function pickFiles(step) {
      const f = {};
      for (const k of ORDER) if (typeof step[k] === 'string') f[k] = step[k];
      if (!Object.keys(f).length) f[m.track.lang] = '';
      return f;
    }

    function renderTask(card, step, i) {
      const key = m.id + '#' + i;
      const tk = S.task(key);
      const starter = pickFiles(step);
      const files = Object.assign({}, starter, tk.files || {});
      const solution = Object.assign({}, starter, step.solution || {});
      const layout = el(
        '<div class="task">' +
          '<div class="task-brief">' +
          '<div class="md">' + FM.md(step.body) + '</div>' +
          '<div class="checks-box"><p class="kicker">Checklist</p><ol class="checks">' +
          step.checks.map((c) => '<li data-state="idle"><span class="ck">' + icon('check', 'tiny') + '</span><span class="ck-text">' + FM.inline(c.text) + '<span class="ck-msg"></span></span></li>').join('') +
          '</ol><div class="task-verdict" aria-live="polite"></div></div>' +
          '<div class="task-help"></div>' +
          '</div>' +
          '<div class="task-bench"></div>' +
          '<div class="task-actions">' +
          '<button type="button" class="btn ghost small" data-t="reset">' + icon('reset', 'tiny') + ' Reset code</button>' +
          (step.hint ? '<button type="button" class="btn ghost small" data-t="hint">' + icon('bulb', 'tiny') + ' Hint</button>' : '') +
          '<button type="button" class="btn ghost small" data-t="solution"' + (tk.tries > 0 || tk.passed ? '' : ' hidden') + '>' + icon('key', 'tiny') + ' Solution</button>' +
          '<button type="button" class="btn primary check-btn" data-t="check" title="Ctrl+Enter">' + icon('play') + ' Check my code</button>' +
          '</div>' +
          '</div>'
      );
      card.appendChild(layout);
      const verdict = $('.task-verdict', layout);
      const help = $('.task-help', layout);
      const items = $$('.checks li', layout);
      bench = FM.workbench($('.task-bench', layout), {
        files,
        edit: step.edit,
        active: step.active,
        auto: step.auto,
        onChange: (f) => {
          tk.files = f;
          S.save();
        },
      });
      const myBench = bench;

      async function doCheck() {
        const btn = $('[data-t=check]', layout);
        btn.disabled = true;
        btn.classList.add('busy');
        items.forEach((li) => (li.dataset.state = 'run'));
        verdict.innerHTML = '';
        const r = await myBench.check(step.checks, { wait: step.wait });
        btn.disabled = false;
        btn.classList.remove('busy');
        r.results.forEach((res, k) => {
          const li = items[k];
          li.dataset.state = res.ok ? 'ok' : 'fail';
          $('.ck-msg', li).textContent = res.ok ? '' : res.msg;
        });
        tk.tries++;
        const passCount = r.results.filter((x) => x.ok).length;
        if (r.passed) {
          const first = !tk.passed;
          tk.passed = true;
          verdict.innerHTML = '<div class="stamp stamp-pass">Cleared</div>';
          FM.sound('stamp');
          if (first) {
            const xp = tk.revealed ? 5 : tk.tries === 1 ? 20 : 15;
            award(i, xp);
          } else award(i, 0);
          nextBtn.focus({ preventScroll: true });
        } else {
          FM.sound('wrong');
          const errs = r.errors.length ? '<div class="err-box"><b>Your code has an error:</b> ' + esc(r.errors[0]) + '</div>' : '';
          verdict.innerHTML = errs + '<div class="verdict bad">' + passCount + ' of ' + r.results.length + ' checks passing. ' + (passCount ? 'Close — fix the red ones.' : 'Read the checklist and try again.') + '</div>';
          $('[data-t=solution]', layout).hidden = false;
        }
        S.save();
      }

      layout.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-t]');
        if (!b) return;
        const t = b.dataset.t;
        if (t === 'check') doCheck();
        if (t === 'reset') {
          if (await confirmBox('Reset code?', 'This puts the starter code back. Your current code will be lost.', 'Reset')) {
            myBench.set(starter);
            items.forEach((li) => (li.dataset.state = 'idle'));
            verdict.innerHTML = '';
          }
        }
        if (t === 'hint') {
          help.innerHTML = '<aside class="note hint"><p class="kicker">' + icon('bulb', 'tiny') + ' Hint</p>' + FM.md(step.hint) + '</aside>';
        }
        if (t === 'solution') {
          const ok = tk.revealed || (await confirmBox('Reveal the solution?', "You'll learn more if you try a bit longer — but if you're stuck, seeing a worked answer is fine.\n\nYou'll still need to press **Check** after loading it.", 'Reveal'));
          if (!ok) return;
          tk.revealed = true;
          S.save();
          const parts = ORDER.filter((k) => step.solution && typeof step.solution[k] === 'string')
            .map((k) => '<p class="kicker">' + LABEL[k] + '</p><pre class="code" data-lang="' + k + '"><code>' + FM.hl(step.solution[k], k) + '</code></pre>')
            .join('');
          help.innerHTML = '<aside class="note solution"><p class="kicker">' + icon('key', 'tiny') + ' Declassified solution</p>' + parts + '<button type="button" class="btn small" data-t="use">Load it into the editor</button></aside>';
        }
        if (t === 'use') {
          myBench.set(solution);
          FM.toast('Solution loaded. Press <b>Check my code</b>.');
        }
      });

      if (tk.passed) {
        items.forEach((li) => (li.dataset.state = 'ok'));
        verdict.innerHTML = '<div class="stamp stamp-pass still">Cleared</div>';
        if (!ms.ok[i]) award(i, 0);
      }
      keyHandler = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          doCheck();
          return true;
        }
      };
    }

    function next() {
      if (!isOk(idx)) return;
      if (idx < total - 1) return show(idx + 1, 'next');
      complete();
    }

    function complete() {
      const first = !ms.done;
      if (first) {
        ms.done = true;
        ms.doneAt = Date.now();
        ms.xp = (ms.xp || 0) + 25;
        S.addXP(25);
      }
      S.save();
      FM.sound('bell');
      const nextM = m.next || FM.missions[m.index + 1];
      const d = el(
        '<dialog class="modal complete"><div class="complete-in">' +
          '<div class="stamp stamp-big">Mission accomplished</div>' +
          '<p class="kicker">' + esc(m.track.codename) + '</p><h2>' + esc(m.title) + '</h2>' +
          '<div class="stats"><div><b>' + (ms.xp || 0) + '</b><span>XP earned</span></div><div><b>' + m.steps.filter((s) => s.type === 'task').length + '</b><span>field tests</span></div><div><b>' + S.trackProgress(m.track).done + '/' + m.track.missions.length + '</b><span>' + esc(m.track.name) + ' done</span></div></div>' +
          '<div class="modal-actions">' +
          '<a class="btn ghost" href="#/">HQ</a>' +
          (nextM ? '<a class="btn primary" href="#/m/' + nextM.id + '">Next: ' + esc(nextM.title) + ' ' + icon('next') + '</a>' : '<a class="btn primary" href="#/safehouse">Build something in the Safehouse</a>') +
          '</div></div></dialog>'
      );
      document.body.appendChild(d);
      d.addEventListener('click', (e) => {
        if (e.target.closest('a')) d.close();
      });
      d.addEventListener('close', () => {
        d.remove();
        if (location.hash.startsWith('#/m/' + m.id)) paintDots();
      });
      d.showModal();
      onLeave(() => d.open && d.close());
      paintFoot();
    }

    prevBtn.addEventListener('click', () => idx > 0 && show(idx - 1, 'prev'));
    nextBtn.addEventListener('click', next);
    dots.addEventListener('click', (e) => {
      const d = e.target.closest('.dot');
      if (d && !d.disabled) show(+d.dataset.i, +d.dataset.i > idx ? 'next' : 'prev');
    });

    const missionKeys = (e) => {
      if (keyHandler && keyHandler(e)) return true;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea' || tag === 'input' || e.target.isContentEditable) return;
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.target.closest('button, a')) {
        e.preventDefault();
        next();
        return true;
      }
      if (e.key === 'ArrowRight' && isOk(idx)) return next(), true;
      if (e.key === 'ArrowLeft' && idx > 0) return show(idx - 1, 'prev'), true;
    };
    pageKeys = missionKeys;
    onLeave(() => {
      pageKeys = null;
      if (bench) bench.destroy();
    });

    show(idx);
    renderTopbar();
  }

  /* ── drills ──────────────────────────────────────────────────────────── */

  function viewDrills() {
    const due = S.drillDue();
    const all = S.drillItems();
    view.innerHTML =
      '<div class="drills narrow">' +
      '<header class="page-head"><p class="kicker">Training range</p><h1 class="type" id="dh"></h1>' +
      '<p class="lede">Questions from missions you\'ve done come back here on a schedule — the ones you get wrong come back sooner. Ten minutes here beats re-reading.</p></header>' +
      '<div class="sheet drill-start">' +
      (all.length
        ? '<div class="stats"><div><b>' + due.length + '</b><span>due now</span></div><div><b>' + all.length + '</b><span>in your pool</span></div><div><b>' + all.filter((it) => (S.state.drills[it.key] || {}).box >= 4).length + '</b><span>mastered</span></div></div>' +
          '<div class="row center">' +
          (due.length ? '<button class="btn primary" data-d="due">Start drill (' + Math.min(10, due.length) + ')</button>' : '') +
          '<button class="btn ' + (due.length ? 'ghost' : 'primary') + '" data-d="mix">Random practice</button></div>'
        : '<p>No questions yet. Complete a mission and its questions will appear here.</p><a class="btn primary" href="#/">Back to HQ</a>') +
      '</div><div id="drill"></div></div>';
    typeOut($('#dh'), 'Drills');
    renderTopbar();
    $('.drills').addEventListener('click', function start(e) {
      const b = e.target.closest('[data-d]');
      if (!b) return;
      this.removeEventListener('click', start);
      const pool = b.dataset.d === 'due' ? shuffle(due).slice(0, 10) : shuffle(all).slice(0, 10);
      runDrill(pool);
    });
  }

  function runDrill(pool) {
    let i = 0;
    let right = 0;
    $('.drill-start').remove();
    const host = $('#drill');
    const nextQ = () => {
      host.innerHTML = '';
      if (i >= pool.length) {
        FM.sound('bell');
        host.innerHTML =
          '<div class="sheet card center"><div class="stamp stamp-big">Drill complete</div><p class="big">' + right + ' / ' + pool.length + ' right first time</p>' +
          '<div class="row center"><a class="btn ghost" href="#/">HQ</a><button class="btn primary" onclick="FM.go(\'#/drills\')">Another round</button></div></div>';
        renderTopbar();
        return;
      }
      const it = pool[i];
      const card = el(
        '<article class="card sheet"><div class="card-label"><span>Question ' + (i + 1) + ' of ' + pool.length + '</span><a class="small" href="#/m/' + it.mission.id + '/' + it.step.index + '">' + esc(it.mission.title) + '</a></div></article>'
      );
      host.appendChild(card);
      const after = (correct, first) => {
        const good = correct && first;
        if (good) right++;
        S.drillAnswer(it.key, good);
        if (good) S.addXP(2);
        else S.activity();
        const nb = el('<div class="row end"><button class="btn primary" type="button">' + (i + 1 < pool.length ? 'Next question' : 'Finish') + ' ' + icon('next') + '</button></div>');
        card.appendChild(nb);
        nb.querySelector('button').addEventListener('click', () => {
          i++;
          nextQ();
        });
        nb.querySelector('button').focus();
      };
      if (it.step.type === 'quiz') renderQuiz(card, it.step, after);
      else renderFill(card, it.step, after);
    };
    nextQ();
  }

  /* ── intel archive ───────────────────────────────────────────────────── */

  function viewIntel() {
    view.innerHTML =
      '<div class="intel narrow">' +
      '<header class="page-head"><p class="kicker">Restricted · eyes only</p><h1 class="type" id="ih"></h1><p class="lede">The key points from every mission. Complete a mission to declassify its file.</p>' +
      '<input type="search" class="search" id="iq" placeholder="Search your intel… (e.g. flex, href, array)"></header>' +
      FM.tracks
        .map(
          (t) =>
            '<section class="intel-track" data-track="' + t.id + '"><h2 class="section-title"><span>' + esc(t.name) + '</span> ' + esc(t.codename) + '</h2>' +
            t.missions
              .map((m) => {
                const done = (S.peekMission(m.id) || {}).done;
                const deb = m.steps.find((s) => s.type === 'debrief');
                const pts = deb ? deb.points : [];
                if (!done)
                  return '<div class="intel-file locked"><h3>' + esc(m.title) + ' <b class="mini-stamp">Classified</b></h3>' + pts.map((p) => '<span class="redact" style="width:' + (40 + ((p.length * 7) % 55)) + '%"></span>').join('') + '</div>';
                return '<div class="intel-file" data-text="' + esc((m.title + ' ' + pts.join(' ')).toLowerCase()) + '"><h3><a href="#/m/' + m.id + '/0">' + esc(m.title) + '</a></h3><ul class="points">' + pts.map((p) => '<li>' + FM.inline(p) + '</li>').join('') + '</ul></div>';
              })
              .join('') +
            '</section>'
        )
        .join('') +
      '</div>';
    typeOut($('#ih'), 'Intel archive');
    $('#iq').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      $$('.intel-file', view).forEach((f) => {
        if (f.classList.contains('locked')) f.hidden = !!q;
        else f.hidden = q && !f.dataset.text.includes(q);
      });
    });
    renderTopbar();
  }

  /* ── safehouse ───────────────────────────────────────────────────────── */

  const BLANK = {
    html: '<h1>Safehouse</h1>\n<p>This is your private playground. Nothing here is checked — experiment freely.</p>\n<button id="btn">Click me</button>\n',
    css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n',
    js: "document.querySelector('#btn').addEventListener('click', () => {\n  console.log('Button clicked');\n});\n",
  };

  function openInSafehouse(files, name) {
    const sh = S.state.safehouse;
    const snip = { id: FM.uid(), name: (name || 'Untitled') + ' (copy)', updated: Date.now(), files: { html: files.html || '', css: files.css || '', js: files.js || '' } };
    sh.snippets.unshift(snip);
    sh.current = snip.id;
    S.save();
    go('#/safehouse');
  }
  FM.openInSafehouse = openInSafehouse;

  function viewSafehouse() {
    const sh = S.state.safehouse;
    if (!sh.snippets.length) {
      sh.snippets.push({ id: FM.uid(), name: 'First file', updated: Date.now(), files: Object.assign({}, BLANK) });
      sh.current = sh.snippets[0].id;
    }
    let cur = sh.snippets.find((s) => s.id === sh.current) || sh.snippets[0];
    sh.current = cur.id;
    S.save();

    view.innerHTML =
      '<div class="safehouse">' +
      '<header class="sh-head">' +
      '<div><p class="kicker">Safehouse · private playground</p><input class="sh-name" aria-label="File name" maxlength="60"></div>' +
      '<div class="sh-tools">' +
      '<select class="sh-pick" aria-label="Open a saved file"></select>' +
      '<button class="btn small ghost" data-s="new" title="New file">' + icon('plus', 'tiny') + ' New</button>' +
      '<button class="btn small ghost" data-s="dup" title="Duplicate">' + icon('copy', 'tiny') + ' Copy</button>' +
      '<button class="btn small ghost" data-s="open" title="Open the page in a new tab">' + icon('ext', 'tiny') + ' Full page</button>' +
      '<button class="btn small ghost" data-s="dl" title="Download as one .html file">' + icon('download', 'tiny') + ' Download</button>' +
      '<button class="btn small ghost danger" data-s="del" title="Delete">' + icon('trash', 'tiny') + '</button>' +
      '</div></header><div class="sh-bench"></div>' +
      '<p class="small muted center">HTML and CSS update as you type. Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> or <b>Run</b> to run JavaScript. Everything saves automatically.</p>' +
      '</div>';

    const nameIn = $('.sh-name');
    const pick = $('.sh-pick');
    let bench;

    function paintPick() {
      pick.innerHTML = sh.snippets.map((s) => '<option value="' + s.id + '"' + (s.id === cur.id ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('');
    }
    function load() {
      if (bench) {
        bench.destroy();
        $('.sh-bench').innerHTML = '';
      }
      nameIn.value = cur.name;
      bench = FM.workbench($('.sh-bench'), {
        files: { html: cur.files.html || '', css: cur.files.css || '', js: cur.files.js || '' },
        auto: true,
        runButton: true,
        showSingleTab: true,
        onChange: (f) => {
          cur.files = f;
          cur.updated = Date.now();
          S.save();
        },
      });
      paintPick();
    }
    load();

    nameIn.addEventListener('input', () => {
      cur.name = nameIn.value || 'Untitled';
      S.save();
      paintPick();
    });
    pick.addEventListener('change', () => {
      cur = sh.snippets.find((s) => s.id === pick.value);
      sh.current = cur.id;
      S.save();
      load();
    });

    const fullDoc = () => {
      const f = cur.files;
      if (/<html[\s>]|<!doctype/i.test(f.html || '')) {
        let d = f.html;
        if (f.css) d = d.replace(/<\/head>/i, '<style>\n' + f.css + '\n</style>\n</head>');
        if (f.js) d = d.replace(/<\/body>/i, '<script>\n' + f.js + '\n</script>\n</body>');
        return d;
      }
      return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + esc(cur.name) + '</title>\n<style>\n' + (f.css || '') + '\n</style>\n</head>\n<body>\n' + (f.html || '') + '\n<script>\n' + (f.js || '') + '\n</script>\n</body>\n</html>\n';
    };

    $('.sh-tools').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      const a = b.dataset.s;
      if (a === 'new') {
        cur = { id: FM.uid(), name: 'Untitled ' + (sh.snippets.length + 1), updated: Date.now(), files: { html: '', css: '', js: '' } };
        sh.snippets.unshift(cur);
      }
      if (a === 'dup') {
        cur = { id: FM.uid(), name: cur.name + ' (copy)', updated: Date.now(), files: Object.assign({}, cur.files) };
        sh.snippets.unshift(cur);
      }
      if (a === 'del') {
        if (!(await confirmBox('Delete "' + cur.name + '"?', 'This file will be gone for good.', 'Delete'))) return;
        sh.snippets = sh.snippets.filter((s) => s.id !== cur.id);
        if (!sh.snippets.length) sh.snippets.push({ id: FM.uid(), name: 'First file', updated: Date.now(), files: Object.assign({}, BLANK) });
        cur = sh.snippets[0];
      }
      if (a === 'dl') {
        const blob = new Blob([fullDoc()], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = (cur.name || 'page').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() + '.html';
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 2000);
        return;
      }
      if (a === 'open') {
        const blob = new Blob([fullDoc()], { type: 'text/html' });
        window.open(URL.createObjectURL(blob), '_blank');
        return;
      }
      sh.current = cur.id;
      S.save();
      load();
    });

    pageKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        bench.run();
        return true;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        S.persist();
        FM.toast('Saved.');
        return true;
      }
    };
    onLeave(() => {
      pageKeys = null;
      bench && bench.destroy();
    });
    renderTopbar();
  }

  /* ── settings ────────────────────────────────────────────────────────── */

  function viewSettings() {
    const st = S.state;
    const set = st.settings;
    view.innerHTML =
      '<div class="settings narrow">' +
      '<header class="page-head"><p class="kicker">Personnel file</p><h1 class="type" id="sh"></h1></header>' +
      '<form class="sheet form" onsubmit="return false">' +
      '<label class="field"><span>Codename</span><input name="agent" maxlength="24" value="' + esc(st.agent) + '"></label>' +
      '<fieldset class="field"><legend>Theme</legend><div class="seg">' +
      [['auto', 'Match device'], ['paper', 'Paper'], ['night', 'Night ops']].map(([v, l]) => '<label><input type="radio" name="theme" value="' + v + '"' + (set.theme === v ? ' checked' : '') + '><span>' + l + '</span></label>').join('') +
      '</div></fieldset>' +
      '<label class="field"><span>Code text size <output>' + set.codeSize + 'px</output></span><input type="range" name="codeSize" min="12" max="22" step="1" value="' + set.codeSize + '"></label>' +
      '<label class="field check"><input type="checkbox" name="wrap"' + (set.wrap ? ' checked' : '') + '><span>Wrap long lines <small>in the code editor, instead of scrolling sideways</small></span></label>' +
      '<label class="field check"><input type="checkbox" name="sound"' + (set.sound ? ' checked' : '') + '><span>Sound effects <small>typewriter keys, stamps and the bell</small></span></label>' +
      '<label class="field check"><input type="checkbox" name="motion"' + (set.motion ? ' checked' : '') + '><span>Animations <small>typewriter text and stamps</small></span></label>' +
      '</form>' +
      '<section class="sheet form"><h2 class="section-title">Backup</h2><p class="small">Progress is saved in this browser only. Download a backup now and then — and to move to another device, export here and import there.</p>' +
      '<div class="row"><button class="btn" data-x="export">' + icon('download', 'tiny') + ' Export progress</button><label class="btn ghost">' + icon('upload', 'tiny') + ' Import<input type="file" accept="application/json,.json" hidden data-x="import"></label></div></section>' +
      '<section class="sheet form"><h2 class="section-title">Keyboard</h2><div class="tbl"><table><tbody>' +
      '<tr><td><kbd>Enter</kbd> or <kbd>→</kbd></td><td>Continue to the next card</td></tr>' +
      '<tr><td><kbd>←</kbd></td><td>Previous card</td></tr>' +
      '<tr><td><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td><td>Check your code / run the Safehouse</td></tr>' +
      '<tr><td><kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>/</kbd></td><td>Search missions</td></tr>' +
      '<tr><td><kbd>Ctrl</kbd> + <kbd>/</kbd></td><td>Comment out a line (in the editor)</td></tr>' +
      '<tr><td><kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd></td><td>Indent / un-indent (in the editor). Press <kbd>Esc</kbd> first to leave the editor with Tab.</td></tr>' +
      '</tbody></table></div></section>' +
      '<section class="sheet form danger-zone"><h2 class="section-title">Burn file</h2><p class="small">Wipe all progress, XP and Safehouse files from this browser.</p><button class="btn danger" data-x="reset">Reset everything</button></section>' +
      '</div>';
    typeOut($('#sh'), 'Settings');
    const form = $('.form');
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t.name === 'agent') st.agent = t.value.trim() || st.agent;
      if (t.name === 'theme') set.theme = t.value;
      if (t.name === 'codeSize') {
        set.codeSize = +t.value;
        t.previousElementSibling.querySelector('output').textContent = t.value + 'px';
      }
      if (t.name === 'sound') {
        set.sound = t.checked;
        if (t.checked) FM.sound('bell');
      }
      if (t.name === 'motion') set.motion = t.checked;
      if (t.name === 'wrap') set.wrap = t.checked;
      S.save();
      applyTheme();
      renderTopbar();
    });
    $('.settings').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-x]');
      if (!b) return;
      if (b.dataset.x === 'export') {
        const blob = new Blob([S.exportJSON()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'field-manual-backup-' + FM.today() + '.json';
        a.click();
      }
      if (b.dataset.x === 'reset') {
        if (await confirmBox('Burn the file?', 'All progress, XP and Safehouse files in this browser will be deleted. **This cannot be undone.** Export a backup first if you might want it.', 'Delete everything')) {
          S.reset();
          applyTheme();
          go('#/');
        }
      }
    });
    $('[data-x=import]').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const text = await f.text();
        if (!(await confirmBox('Import this backup?', 'It will replace the progress currently in this browser.', 'Import'))) return;
        S.importJSON(text);
        applyTheme();
        FM.toast('Backup imported. Welcome back, Agent ' + esc(S.state.agent) + '.', 'long');
        go('#/');
      } catch (err) {
        FM.toast(esc(err.message), 'long');
      }
    });
    renderTopbar();
  }

  /* ── search palette ──────────────────────────────────────────────────── */

  function openPalette() {
    const d = $('#palette');
    if (d.open) return;
    const input = $('input', d);
    const list = $('.pal-list', d);
    input.value = '';
    const pages = [
      { label: 'HQ', hint: 'Home', href: '#/' },
      { label: 'Drills', hint: 'Review questions', href: '#/drills' },
      { label: 'Safehouse', hint: 'Code playground', href: '#/safehouse' },
      { label: 'Intel archive', hint: 'Key points', href: '#/intel' },
      { label: 'Settings', hint: 'Theme, backup', href: '#/settings' },
    ].concat(FM.tracks.map((t) => ({ label: t.name + ' dossier', hint: t.codename, href: '#/track/' + t.id })));
    const items = pages.concat(
      FM.missions.map((m) => {
        const deb = m.steps.find((s) => s.type === 'debrief');
        return { label: m.title, hint: m.track.name + ' · ' + m.module.title + ((S.peekMission(m.id) || {}).done ? ' · ✓' : ''), href: '#/m/' + m.id, text: (deb ? deb.points.join(' ') : '') + ' ' + m.steps.filter((s) => s.title).map((s) => s.title).join(' ') };
      })
    );
    let sel = 0;
    let shown = [];
    const paint = () => {
      const q = input.value.trim().toLowerCase();
      shown = !q
        ? items.slice(0, 12)
        : items
            .map((it) => {
              const l = it.label.toLowerCase();
              const score = l.startsWith(q) ? 3 : l.includes(q) ? 2 : (it.hint + ' ' + (it.text || '')).toLowerCase().includes(q) ? 1 : 0;
              return { it, score };
            })
            .filter((x) => x.score)
            .sort((a, b) => b.score - a.score)
            .slice(0, 14)
            .map((x) => x.it);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.length
        ? shown.map((it, i) => '<a class="pal-item' + (i === sel ? ' sel' : '') + '" href="' + it.href + '"><span>' + esc(it.label) + '</span><small>' + esc(it.hint) + '</small></a>').join('')
        : '<p class="muted small pad">Nothing found.</p>';
    };
    input.oninput = () => {
      sel = 0;
      paint();
    };
    input.onkeydown = (e) => {
      if (e.key === 'ArrowDown') (sel = Math.min(shown.length - 1, sel + 1)), paint(), e.preventDefault();
      if (e.key === 'ArrowUp') (sel = Math.max(0, sel - 1)), paint(), e.preventDefault();
      if (e.key === 'Enter' && shown[sel]) {
        e.preventDefault();
        d.close();
        go(shown[sel].href);
      }
    };
    list.onclick = (e) => {
      if (e.target.closest('a')) d.close();
    };
    d.onclick = (e) => {
      if (e.target === d) d.close();
    };
    paint();
    d.showModal();
    input.focus();
  }

  /* ── global keys ─────────────────────────────────────────────────────── */

  let pageKeys = null;
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
      return;
    }
    if (document.querySelector('dialog[open]')) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (pageKeys) pageKeys(e);
  });

  /* ── boot ────────────────────────────────────────────────────────────── */

  function boot() {
    FM.finalize();
    applyTheme();
    $('#search-btn').addEventListener('click', openPalette);
    window.addEventListener('hashchange', route);
    route();
    renderTopbar();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/[?&]nosw\b/.test(location.search)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  FM.boot = boot;
  if (!window.FM_NO_BOOT) boot();
})();

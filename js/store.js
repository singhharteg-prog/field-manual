/* Field Manual — progress store.
   Everything lives in localStorage under one key. Export/import in Settings
   is the backup, because browser storage can be cleared. */
(function () {
  'use strict';
  const FM = window.FM;
  const KEY = 'fieldmanual.v1';

  const fresh = () => ({
    v: 1,
    agent: '',
    created: Date.now(),
    xp: 0,
    missions: {}, // id → { step, seen, done, doneAt, xp }
    tasks: {}, // missionId#step → { files, passed, tries, revealed }
    days: {}, // YYYY-MM-DD → actions
    drills: {}, // missionId#step → { box, due }
    settings: { theme: 'auto', sound: false, codeSize: 15, motion: true },
    safehouse: { current: null, snippets: [] },
    last: null,
  });

  let state;
  try {
    state = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch (e) {
    state = null;
  }
  if (!state || state.v !== 1) state = fresh();
  const base = fresh();
  for (const k of Object.keys(base)) if (state[k] == null) state[k] = base[k];
  state.settings = Object.assign(base.settings, state.settings);

  let saveTimer = 0;
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  };
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 150);
  };
  window.addEventListener('pagehide', persist);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && persist());

  const RANKS = [
    [0, 'Recruit'],
    [150, 'Cadet'],
    [400, 'Field Agent'],
    [900, 'Operative'],
    [1600, 'Special Agent'],
    [2600, 'Handler'],
    [4000, 'Station Chief'],
    [6000, 'Spymaster'],
  ];

  const S = (FM.store = {
    get state() {
      return state;
    },
    save,
    persist,

    mission(id) {
      return state.missions[id] || (state.missions[id] = { step: 0, seen: 0, done: false, xp: 0 });
    },
    peekMission(id) {
      return state.missions[id] || null;
    },
    task(key) {
      return state.tasks[key] || (state.tasks[key] = { files: null, passed: false, tries: 0, revealed: false });
    },
    peekTask(key) {
      return state.tasks[key] || null;
    },

    addXP(n, reason) {
      if (!n) return 0;
      state.xp += n;
      S.activity();
      save();
      FM.emit && FM.emit('xp', { n, reason });
      return n;
    },

    activity() {
      const d = FM.today();
      state.days[d] = (state.days[d] || 0) + 1;
      save();
    },

    streak() {
      let n = 0;
      const d = new Date();
      if (!state.days[FM.today(d)]) d.setDate(d.getDate() - 1);
      while (state.days[FM.today(d)]) {
        n++;
        d.setDate(d.getDate() - 1);
      }
      return n;
    },

    rank(xp) {
      xp = xp == null ? state.xp : xp;
      let i = 0;
      while (i + 1 < RANKS.length && xp >= RANKS[i + 1][0]) i++;
      const [from, name] = RANKS[i];
      const next = RANKS[i + 1];
      return {
        name,
        level: i + 1,
        from,
        to: next ? next[0] : null,
        nextName: next ? next[1] : null,
        pct: next ? (xp - from) / (next[0] - from) : 1,
      };
    },
    RANKS,

    trackProgress(t) {
      const total = t.missions.length;
      const done = t.missions.filter((m) => (state.missions[m.id] || {}).done).length;
      return { done, total, pct: total ? done / total : 0 };
    },

    // The mission to resume: the last one touched if unfinished, else the
    // first unfinished mission in course order.
    nextMission() {
      const last = state.last && FM.missionById[state.last];
      if (last && !(state.missions[last.id] || {}).done) return last;
      if (last && last.next && !(state.missions[last.next.id] || {}).done) return last.next;
      return FM.missions.find((m) => !(state.missions[m.id] || {}).done) || null;
    },

    /* drills: a Leitner box per question */
    drillItems() {
      const out = [];
      for (const m of FM.missions) {
        const ms = state.missions[m.id];
        if (!ms || !ms.done) continue;
        m.steps.forEach((s, i) => {
          if (s.type === 'quiz' || s.type === 'fill') out.push({ key: m.id + '#' + i, mission: m, step: s, doneAt: ms.doneAt || 0 });
        });
      }
      return out;
    },
    // A question first comes up for review the day after its mission.
    drillDue() {
      const now = Date.now();
      return S.drillItems().filter((it) => {
        const d = state.drills[it.key];
        return d ? d.due <= now : it.doneAt + 20 * 36e5 <= now;
      });
    },
    drillAnswer(key, correct) {
      const d = state.drills[key] || { box: 1, due: 0 };
      d.box = correct ? Math.min(5, d.box + 1) : 1;
      const days = [0, 1, 2, 4, 8, 16][d.box];
      d.due = Date.now() + days * 864e5 - 36e5; // an hour's grace
      state.drills[key] = d;
      save();
    },

    exportJSON() {
      return JSON.stringify(state, null, 1);
    },
    importJSON(text) {
      const data = JSON.parse(text);
      if (!data || data.v !== 1 || typeof data.missions !== 'object') throw new Error('That file is not a Field Manual backup.');
      state = Object.assign(fresh(), data);
      state.settings = Object.assign(fresh().settings, data.settings);
      persist();
    },
    reset() {
      state = fresh();
      persist();
    },
  });
})();

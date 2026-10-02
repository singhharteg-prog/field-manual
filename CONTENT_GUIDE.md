# Writing missions for Field Manual

Course content lives in `content/*.js`. Each file adds modules ("phases") to a
track with `FM.modules(trackId, [...])`. The reference mission is the first one
in `content/html.js` — read it before writing anything.

After every change, run the self-test:

```bash
node tools/validate.cjs            # everything
node tools/validate.cjs css        # one track
node tools/validate.cjs js-loops   # one mission (id prefix)
```

It runs every field test twice, once with the starter code (which must **fail**
at least one check) and once with the solution (which must **pass every**
check, with no errors). It also checks that quiz answers are in range, fill-in
answers appear in their word bank, exhibits run without errors, and that every
mission ends with a debrief. Fix everything it reports.

---

## Who this is for

One learner: an adult who runs a small website business, uses AI to build
sites, and wants to actually understand the code. Not a child, not a CS
student. Smart and busy.

## Voice

- **Plain and direct.** Short sentences. Say what a thing is, show it, move on.
- **Explain the why in one line**, then show. "Use `alt` text: screen readers
  read it aloud, and Google uses it to understand the image."
- **Real-world examples** from small-business websites: a bakery, a plumber, a
  candle shop, a barber, an online shop's product cards, contact forms, price
  lists, opening hours. Not foo/bar.
- **British English** in prose (colour, behaviour, organise). Code keeps its own
  spelling (`color`, `center`), and when that differs, say so once.
- Spy-theme flavour belongs to the UI. Keep it out of the lessons, except
  perhaps one light line per mission. Clarity wins.
- No filler ("In this lesson we will learn…", "Great job!"). No emoji.
- Use `--` for a dash in Markdown (renders as an em dash), or just a full stop.

## Pace and shape of a mission

Each mission is **8–14 steps, about 5–10 minutes**. Alternate reading with
doing: **never more than two `brief`/`exhibit` steps in a row** without a
`quiz`, `fill` or `task`.

A typical shape:

1. `brief` -- the idea, with a small code sample
2. `exhibit` -- a live, editable example
3. `quiz` or `fill` -- a quick check of understanding
4. `task` -- write it yourself
5. `brief` -- the next idea or a gotcha
6. `fill` / `quiz`
7. `task` -- slightly harder, combining ideas
8. … (a third task in bigger missions)
9. `debrief` -- 4–6 key points (these go into the Intel archive)

Each mission needs **at least 2 `task` steps** (3 for big topics) and at least
2 `quiz`/`fill` steps. The final mission of a track is a bigger build with 3–4
tasks.

Introduce **one new concept at a time**. Do not use anything in a task that
hasn't been taught yet in this track or an earlier one (HTML → CSS → JS).

---

## Mission format

```js
{
  id: 'css-box-model',          // unique, lowercase, prefixed with the track id; never change once published
  title: 'The box model',       // short, plain
  minutes: 8,                   // honest estimate
  steps: [ ... ],
}
```

Modules:

```js
FM.modules('css', [
  { title: 'First disguise', missions: [ ... ] },
  { title: 'The box', missions: [ ... ] },
]);
```

All code fields (`html`, `css`, `js`, `code`, solution fields) and Markdown
fields are **dedented automatically**, so indent template literals naturally.
Escape backticks inside template literals (`` \` ``) and `${` as `\${`.

### `brief` -- reading

```js
{ type: 'brief', title: 'Optional heading', body: `Markdown…` }
```

### `exhibit` -- a live example (editable, not checked)

```js
{
  type: 'exhibit',
  title: 'See it run',
  body: 'Markdown shown above the code.',
  html: `<p class="note">Hi</p>`,     // any of html / css / js; only the keys you give appear as tabs
  css: `.note { color: crimson; }`,
  js: `console.log('hello')`,
  edit: ['css'],                        // optional: which tabs are editable (default: all)
  active: 'css',                        // optional: which tab is open first
  after: 'Markdown shown below the example.',
  height: 300,                          // optional max preview height
}
```

If there is no `html` or `css`, the example shows only a console (good for
pure JavaScript). The result updates as the learner types; JS runs on **Run**.

### `quiz` -- multiple choice

```js
{
  type: 'quiz',
  q: 'Markdown question',
  options: ['`<p>`', '`</p>`', '…'],   // inline Markdown allowed
  answer: 1,                            // index, or [0, 2] for "select all that apply"
  explain: 'Shown after answering. Say *why*.',
  shuffle: false,                       // only if order matters (options are shuffled by default)
}
```

Never use "all of the above" (options are shuffled). 3–4 options, all
plausible. Wrong options should be **real mistakes** beginners make.

### `fill` -- fill in the blanks

```js
{
  type: 'fill',
  q: 'Make the link open the contact page.',
  code: `<a [[href]]="contact.html">Contact</a>`,   // [[answer]] or [[answer|alternative]]
  lang: 'html',                                      // optional; defaults to the track's language
  options: ['href', 'src', 'link', 'url'],           // optional word bank (must include every answer)
  explain: 'Optional Markdown shown after.',
  ci: true,                                          // optional: case-insensitive
}
```

Answers are compared after trimming and collapsing spaces, and `'` and `"` count
as the same. Keep blanks short (one token). Use a word bank for most fills, and
leave it out for some so the learner has to recall.

### `task` -- write code, get it checked

```js
{
  type: 'task',
  title: 'Style the price',
  body: `Markdown instructions. Be concrete: exact text, exact colours, exact class names.`,
  html: `<p class="price">£4.50</p>`,       // starter files; the keys present = the tabs shown
  css: `/* Make the price bold and green */\n`,
  edit: ['css'],                             // optional: lock the other tabs (read-only)
  active: 'css',                             // optional
  checks: [
    { text: 'The price is bold', test: (c) => +c.style('.price', 'font-weight') >= 700 },
    { text: 'The price is green', test: (c) => c.sameColor(c.style('.price', 'color'), 'green') || 'It is ' + c.style('.price', 'color') + ' right now.' },
  ],
  hint: 'Markdown. A nudge, not the answer. Can include a partial code sample.',
  solution: { css: `.price { font-weight: bold; color: green; }` },   // only the edited files
  wait: 0,           // optional ms to wait after load before checking (timers)
  auto: true,        // optional: re-run on every keystroke (default: true unless JS is editable)
}
```

**Rules for tasks**

- The **starter must fail** at least one check, and the **solution must pass
  all** of them. The self-test enforces this.
- Starter code is usually a short comment saying what to do, or partial code
  to finish. For CSS tasks, give the HTML (often locked with `edit: ['css']`)
  and let the learner write the CSS.
- **3–5 checks per task**, each testing one thing, written as the thing that
  should be true ("The button has the class `primary`"). They show as a
  checklist and update on every check.
- A test returns `true` (pass), `false` (fail) or **a string**: a fail with a
  specific explanation. Use strings to explain likely mistakes ("Your `<img>`
  has no `alt` attribute.", "You logged 12; it should be 15.").
- **Be lenient where it doesn't matter.** Accept any reasonable text where the
  wording isn't the point, use case-insensitive regexes, trim whitespace,
  accept either quote style, and accept equivalent CSS values (`bold`/`700`,
  `#fff`/`white`). Check the **result** (DOM, computed style, logged output,
  return values) rather than matching source text. Use source checks
  (`c.src('css')`) only when the point is the syntax itself, like "use a
  template literal" or "use `const`", and strip comments first (`c.src` does).
- A test that throws counts as a fail, so `c.$('h1').textContent` is safe when
  there is no h1. Still, prefer guards like `c.$('h1') && …`.
- Never use `prompt()` or `confirm()`. Never fetch from the network: the
  self-test runs offline. For async/fetch lessons, put a fake API function in
  the starter code, one that returns a Promise and resolves with `setTimeout`.
- Don't make the learner type out long boilerplate. Give it in the starter.

### `debrief` -- end of mission

```js
{ type: 'debrief', points: ['Inline Markdown point', '…'] }
```

4–6 points, each a self-contained fact or rule worth remembering. They are
collected into the Intel archive, so write them as a cheat sheet.

---

## The check toolkit (`c`)

| | |
|---|---|
| `c.$(sel)`, `c.$$(sel)` | `querySelector` / `querySelectorAll` (as an array) in the preview |
| `c.doc`, `c.win` | the preview's `document` and `window` |
| `c.text(sel)` | trimmed `textContent` with collapsed spaces (`''` if missing) |
| `c.style(sel, prop)` | the computed style value, e.g. `c.style('h1', 'font-size')` → `'32px'` |
| `c.px(sel, prop)` | the computed value as a number: `c.px('.card', 'padding-top')` → `16` |
| `c.rgb(colour)` | any CSS colour → the `rgb(…)` string computed styles use |
| `c.sameColor(a, b)` | whether two CSS colours are the same |
| `c.rule(selector, media?)` | the `CSSStyleDeclaration` of a rule as written (last match), or `null`. Use it for `:hover`, `::before` and other states computed style can't see. `media`: a substring of the media condition, e.g. `'max-width'`; pass `null` for rules outside media queries |
| `c.decl(selector, prop, media?)` | the value of one property in that rule, as written (`''` if none) |
| `c.rules()` | every rule: `{ selector, sel, style, media }` |
| `c.media()` | the rules that sit inside a media query |
| `await c.viewport(px)` | resize the preview to test media queries (reset automatically after checks) |
| `c.html`, `c.css`, `c.js` | the learner's raw source |
| `c.src(kind?)` | the source with comments stripped (`'html'`, `'css'`, `'js'`, or all) |
| `c.logs` | every `console.log` line so far, as strings (live) |
| `c.errors` | runtime error messages |
| `c.alerts` | the text of any `alert()` calls |
| `c.val(name)` | the value of a global variable, including `let`/`const` at the top level (`undefined` if missing) |
| `c.has(name)` | whether a global exists |
| `c.fn(name)` | the learner's function, or `null` |
| `c.call(name, ...args)` | calls it: `{ result, logs }`, where logs are the lines it printed during that call |
| `c.click(sel)` | clicks an element |
| `c.type(sel, value)` | sets an input's value and fires `input` and `change` |
| `c.submit(sel?)` | submits a form (`requestSubmit`) |
| `c.key(sel, key, type?)` | dispatches a keyboard event (`keydown` by default) |
| `await c.wait(ms)` | waits (for timers and animations) |

Tests may be `async`. Typical patterns:

```js
// a log line
test: (c) => c.logs.includes('15') || 'Expected 15 in the console. You logged: ' + (c.logs.join(', ') || 'nothing')

// a function's return value, with several inputs
test: (c) => c.fn('add') && c.call('add', 2, 3).result === 5 && c.call('add', -1, 1).result === 0

// a click handler
test: (c) => { c.click('#plus'); c.click('#plus'); return c.text('#count') === '2'; }

// a media query
test: async (c) => { await c.viewport(400); return c.style('.cards', 'grid-template-columns').split(' ').length === 1; }

// a hover rule
test: (c) => !!c.decl('.btn:hover', 'background-color') || 'Add a .btn:hover rule that changes the background colour.'
```

The preview starts with the browser's default styles (white background, serif
font, 8px body margin). Each check run reloads the page from scratch, and
clicks inside checks happen in order.

**How the console formats values** (for log checks): a top-level string prints
as-is (`hello`), numbers as `String(n)`, booleans as `true`/`false`, arrays as
`[1, 2, "x"]`, objects as `{ name: "Sam", age: 3 }`, `undefined`/`null`
literally. Several arguments are joined with a space:
`console.log('Total:', 5)` → `Total: 5`.

## Markdown supported

Paragraphs, `## Heading` (renders small), **bold**, *italic*, `inline code`,
[links](https://developer.mozilla.org), `- lists`, `1. lists`, fenced code
blocks with a language (```` ```html ````, `css`, `js`), `| tables |` with a
header row, `> note` (amber box) and `>! warning` (red box). Raw HTML in
Markdown is **escaped and shown as text**, so you can write `<p>` in prose,
though backticks look better: `` `<p>` ``.

Inline code can't contain a backtick, so show template literals in fenced
code blocks.

`c.submit()` uses `requestSubmit()`, so the browser's own validation
(`required`, `type="email"`) runs first and can block the submit. Add
`novalidate` to the form when JavaScript does the validating.

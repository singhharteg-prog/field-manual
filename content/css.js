/* CSS — Operation Disguise. See ../CONTENT_GUIDE.md for the format. */
(function () {
  'use strict';

  /* ── check helpers (local to this file) ────────────────────────────── */

  // Compare a computed colour with the one we want, explaining a mismatch.
  const colourIs = (c, sel, prop, want, label) => {
    if (!c.$(sel)) return 'There is no ' + sel + ' on the page.';
    const got = c.style(sel, prop);
    if (c.sameColor(got, want)) return true;
    const w = c.rgb(want);
    return (label || 'It') + ' is ' + got + ' right now; it should be ' + want + (w !== want ? ' (' + w + ')' : '') + '.';
  };

  // A colour in the learner's source is wrong because of British spelling.
  const spelling = (c) => (/\bcolour\s*:/i.test(c.src('css')) ? 'CSS uses the American spelling: write `color`, not `colour`.' : '');

  const box = (c, sel) => {
    const e = typeof sel === 'string' ? c.$(sel) : sel;
    return e ? e.getBoundingClientRect() : null;
  };

  // How many columns a set of items sits in (distinct left edges).
  const colCount = (c, sel) => new Set(c.$$(sel).map((e) => Math.round(e.getBoundingClientRect().left))).size;
  // How many rows (distinct top edges).
  const rowCount = (c, sel) => new Set(c.$$(sel).map((e) => Math.round(e.getBoundingClientRect().top))).size;

  // Line height as a multiple of the font size.
  const lineRatio = (c, sel) => c.px(sel, 'line-height') / (c.px(sel, 'font-size') || 1);

  // A computed style of ::before / ::after.
  const pseudo = (c, sel, which, prop) => {
    const e = c.$(sel);
    return e ? c.win.getComputedStyle(e, which).getPropertyValue(prop).trim() : '';
  };

  // Resolve any value (including var(...)) to a computed value via a probe element.
  const resolve = (c, prop, value, read) => {
    const d = c.doc.createElement('div');
    d.style.setProperty(prop, value);
    c.doc.body.appendChild(d);
    const v = c.win.getComputedStyle(d).getPropertyValue(read || prop).trim();
    d.remove();
    return v;
  };

  // The first rule found among several selector spellings.
  const ruleOf = (c, sels, media) => {
    for (const s of sels) {
      const r = c.rule(s, media);
      if (r) return r;
    }
    return null;
  };

  // The background colour a rule sets (as written), resolved to rgb().
  const ruleBg = (c, sels, media) => {
    const st = ruleOf(c, sels, media);
    if (!st) return '';
    const v = st.getPropertyValue('background-color').trim() || st.getPropertyValue('background').trim();
    return v ? resolve(c, 'background', v, 'background-color') : '';
  };

  // How far a transform value moves something vertically (negative = up).
  const moveY = (c, transform) => {
    const m = resolve(c, 'transform', transform);
    if (!m || m === 'none') return 0;
    try {
      return new c.win.DOMMatrixReadOnly(m).m42;
    } catch (e) {
      return 0;
    }
  };

  // A @keyframes rule by name.
  const keyframes = (c, name) => {
    for (const sh of c.doc.styleSheets) {
      let rules;
      try {
        rules = sh.cssRules;
      } catch (e) {
        continue;
      }
      for (const r of rules) if (r.type === 7 && r.name === name) return r;
    }
    return null;
  };

  // Seconds from a computed duration like "0.3s" or "300ms" (first value).
  const secs = (v) => {
    const s = String(v || '').split(',')[0].trim();
    const n = parseFloat(s);
    if (isNaN(n)) return 0;
    return /ms$/.test(s) ? n / 1000 : n;
  };

  // A gap value for messages ("normal" means none was set).
  const gapOf = (c, sel) => {
    const g = c.style(sel, 'column-gap');
    return !g || g === 'normal' ? 'not set' : g;
  };

  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1 : tol);

  // Layout checks set the preview width explicitly, so they don't depend on
  // how wide the learner's screen (or the self-test frame) happens to be.
  const at = (c, w) => c.viewport(w || 800);

  /* ── the final operation: one locked page, CSS built up over 4 tasks ── */

  const FINAL_HTML = FM.dedent(`
    <header class="hero">
      <div class="container">
        <h1>Hearth &amp; Crumb</h1>
        <p class="tagline">Sourdough, pastries and good coffee, baked in Leicester every morning.</p>
        <a class="btn" href="#bakes">See this week's bakes</a>
      </div>
    </header>

    <main class="container" id="bakes">
      <h2>This week's bakes</h2>
      <div class="cards">
        <article class="card">
          <h3>Country sourdough</h3>
          <p>Slow-proved for 36 hours.</p>
          <p class="price">£4.80</p>
        </article>
        <article class="card">
          <h3>Cardamom buns</h3>
          <p>Swedish-style, twisted by hand.</p>
          <p class="price">£2.60</p>
        </article>
        <article class="card">
          <h3>Seeded rye</h3>
          <p>Dense, dark and full of seeds.</p>
          <p class="price">£4.50</p>
        </article>
        <article class="card">
          <h3>Almond croissant</h3>
          <p>Twice-baked with frangipane.</p>
          <p class="price">£3.20</p>
        </article>
      </div>
    </main>

    <footer class="site-footer">
      <p>Open Tuesday to Saturday, 7am to 3pm</p>
    </footer>
  `);

  const FINAL_1 = FM.dedent(`
    /* Brand */
    :root {
      --brand: #b5651d;
      --text: #2b2b2b;
      --bg: #fffaf3;
      --radius: 12px;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      color: var(--text);
      background-color: var(--bg);
      line-height: 1.6;
    }

    h1, h2, h3 {
      font-family: Georgia, serif;
    }
  `);

  const FINAL_2 =
    FINAL_1 +
    '\n\n' +
    FM.dedent(`
      /* Layout */
      .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 16px;
      }

      /* Hero */
      .hero {
        background: linear-gradient(135deg, var(--brand), #7a3e0f);
        color: white;
        text-align: center;
        padding: 64px 0;
      }
    `);

  const FINAL_3 =
    FINAL_2 +
    '\n\n' +
    FM.dedent(`
      /* Cards */
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 24px;
      }

      .card {
        background-color: white;
        padding: 24px;
        border-radius: var(--radius);
      }

      .price {
        color: var(--brand);
        font-weight: 700;
      }
    `);

  const FINAL_4 =
    FINAL_3 +
    '\n\n' +
    FM.dedent(`
      /* Button */
      .btn {
        display: inline-block;
        background-color: white;
        color: var(--brand);
        padding: 12px 24px;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 700;
        transition: background-color 0.2s;
      }

      .btn:hover {
        background-color: #ffe8cc;
      }

      /* Mobile first: small heading, bigger on wider screens */
      .hero h1 {
        font-size: 2rem;
      }

      @media (min-width: 700px) {
        .hero h1 {
          font-size: 3rem;
        }
      }
    `);

  // Does changing a variable on :root change this element's computed value?
  const followsVar = (c, name, sel, prop) => {
    const root = c.doc.documentElement;
    const before = c.style(sel, prop);
    root.style.setProperty(name, 'rgb(1, 2, 3)');
    const after = c.style(sel, prop);
    root.style.removeProperty(name);
    return before !== after && after.includes('rgb(1, 2, 3)');
  };

  FM.modules('css', [
    /* ═══════════════════════════════════════════════════════════════════
       MODULE 1 — First disguise
       ═══════════════════════════════════════════════════════════════════ */
    {
      title: 'First disguise',
      missions: [
        /* ── 1. What CSS is ─────────────────────────────────────────── */
        {
          id: 'css-what-is-css',
          title: 'What CSS is',
          minutes: 7,
          steps: [
            {
              type: 'brief',
              title: 'Your briefing',
              body: `
                HTML says **what** is on the page. CSS says **how it looks**: colours, fonts, spacing, layout.

                CSS is a list of **rules**. Each rule picks some elements and gives them a look:

                \`\`\`css
                h1 {
                  color: darkgreen;
                  font-size: 40px;
                }
                \`\`\`

                - \`h1\` is the **selector**: which elements this rule styles (here, every \`<h1>\`).
                - The curly braces \`{ }\` hold the **declarations**.
                - \`color: darkgreen;\` is one declaration: a **property** (\`color\`), a colon, a **value** (\`darkgreen\`), and a semicolon to end it.

                > CSS uses American spelling: \`color\`, and later \`center\`. Write \`colour\` and the browser silently ignores the line.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: `Two rules: one for the heading, one for the paragraph. **Edit the CSS**: try \`tomato\`, \`navy\` or \`purple\` as colours, or change \`20px\` to \`30px\`.`,
              html: `
                <h1>Rosie's Bakery</h1>
                <p>Fresh bread every morning.</p>
              `,
              css: `
                h1 {
                  color: saddlebrown;
                }

                p {
                  color: gray;
                  font-size: 20px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'In `p { color: red; }`, which part is the **property**?',
              options: ['`p`', '`color`', '`red`', '`{ }`'],
              answer: 1,
              explain: '`p` is the selector, `color` is the property, `red` is the value. The braces wrap the declarations.',
            },
            {
              type: 'task',
              title: 'Colour the bakery sign',
              body: `
                The HTML is done (it's locked). Write the CSS:

                1. Make the \`h1\` **saddlebrown**.
                2. Make the \`p\` **dimgray** and **20px**.

                Named colours like \`saddlebrown\` are written as one word, no spaces.
              `,
              html: `
                <h1>Rosie's Bakery</h1>
                <p>Fresh bread every morning.</p>
              `,
              css: `/* Write your rules here */\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The heading is `saddlebrown`', test: (c) => spelling(c) || colourIs(c, 'h1', 'color', 'saddlebrown', 'The heading') },
                { text: 'The paragraph is `dimgray`', test: (c) => spelling(c) || colourIs(c, 'p', 'color', 'dimgray', 'The paragraph') },
                { text: 'The paragraph is 20px', test: (c) => c.px('p', 'font-size') === 20 || 'The paragraph is ' + c.style('p', 'font-size') + '. Add font-size: 20px; to the p rule.' },
              ],
              hint: 'Two rules, one per selector:\n\n```css\nh1 {\n  color: …;\n}\n\np {\n  color: …;\n  font-size: …;\n}\n```',
              solution: {
                css: `
                  h1 {
                    color: saddlebrown;
                  }

                  p {
                    color: dimgray;
                    font-size: 20px;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Three places CSS can live',
              body: `
                **1. Inline**, in a \`style\` attribute on one element:

                \`\`\`html
                <p style="color: red;">Sold out</p>
                \`\`\`

                Quick, but it only styles that one element. Avoid it.

                **2. A \`<style>\` tag** in the page's \`<head>\`:

                \`\`\`html
                <style>
                  p { color: red; }
                </style>
                \`\`\`

                Styles the whole page, but only that page.

                **3. A linked file.** All the CSS goes in its own file, say \`styles.css\`, and every page links to it in the \`<head>\`:

                \`\`\`html
                <link rel="stylesheet" href="styles.css">
                \`\`\`

                This is what real sites use. One file styles every page: change the brand colour once and the whole site updates.

                > In this manual, the **CSS tab** works like that linked file. Whatever you write there applies to the HTML tab.
              `,
            },
            {
              type: 'quiz',
              q: 'A client has a 12-page site. Where should the CSS go?',
              options: ['In one linked `.css` file', 'In a `style` attribute on each element', 'In a `<style>` tag on each of the 12 pages', 'Inside the `<body>`, after the content'],
              answer: 0,
              explain: 'One linked file means one place to change things. With `<style>` tags on each page, a colour change means editing 12 files.',
            },
            {
              type: 'fill',
              q: 'Link a stylesheet called `styles.css` into the page.',
              code: `<link [[rel]]="stylesheet" [[href]]="styles.css">`,
              lang: 'html',
              options: ['rel', 'href', 'src', 'type', 'style'],
              explain: '`rel="stylesheet"` says what the file is; `href` says where it is. (`src` is for images and scripts.)',
            },
            {
              type: 'brief',
              title: 'Comments',
              body: `
                A **comment** is a note for humans. The browser skips it.

                \`\`\`css
                /* Specials board */
                h2 {
                  color: teal;
                  /* font-size: 50px; */
                }
                \`\`\`

                Use comments to label sections of a long file, or to switch a line off while you test something. CSS comments always use \`/* … */\`, even for one line.
              `,
            },
            {
              type: 'task',
              title: 'The specials board',
              body: `
                Style the specials board:

                1. Start with a comment that labels the section, like \`/* Specials board */\`.
                2. Make the \`h2\` **teal** and **32px**.
                3. Make every \`p\` **slategray**.
              `,
              html: `
                <h2>Today's specials</h2>
                <p>Cheese and onion pasty, £3.20</p>
                <p>Lemon drizzle slice, £2.50</p>
              `,
              css: `\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'There is a `/* … */` comment', test: (c) => /\/\*[\s\S]*?\*\//.test(c.css) || 'Add a comment: /* Specials board */' },
                { text: 'The heading is teal', test: (c) => spelling(c) || colourIs(c, 'h2', 'color', 'teal', 'The heading') },
                { text: 'The heading is 32px', test: (c) => c.px('h2', 'font-size') === 32 || 'The heading is ' + c.style('h2', 'font-size') + '; it should be 32px.' },
                { text: 'Both paragraphs are slategray', test: (c) => c.$$('p').every((p) => c.sameColor(c.style(p, 'color'), 'slategray')) },
              ],
              hint: 'One rule can hold several declarations, each ending in a semicolon:\n\n```css\n/* Specials board */\nh2 {\n  color: teal;\n  font-size: 32px;\n}\n```\n\nThen a second rule for `p`.',
              solution: {
                css: `
                  /* Specials board */
                  h2 {
                    color: teal;
                    font-size: 32px;
                  }

                  p {
                    color: slategray;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'A CSS **rule** = selector + `{ declarations }`. A declaration is `property: value;`.',
                'CSS spells it `color` and `center` (American). `colour` is silently ignored.',
                'Real sites put CSS in a linked file: `<link rel="stylesheet" href="styles.css">` in the `<head>`.',
                'A `<style>` tag styles one page; a `style` attribute styles one element. Avoid inline styles.',
                'Comments are `/* … */`. Use them to label sections or switch a line off.',
              ],
            },
          ],
        },

        /* ── 2. Selectors ───────────────────────────────────────────── */
        {
          id: 'css-selectors',
          title: 'Selectors',
          minutes: 9,
          steps: [
            {
              type: 'brief',
              title: 'Picking what to style',
              body: `
                The selector decides **which elements** a rule styles. The three you'll use most:

                \`\`\`css
                p { }          /* type: every <p> */
                .price { }     /* class: every element with class="price" */
                #title { }     /* id: the one element with id="title" */
                \`\`\`

                - A **type** selector is just the tag name.
                - A **class** selector starts with a dot. Use classes for almost everything: they're reusable, and one element can have several.
                - An **id** selector starts with \`#\`. An id is unique on the page, so the rule can only ever hit one element.

                The dot and the hash only appear in CSS. In the HTML it's \`class="price"\`, with no dot.
              `,
            },
            {
              type: 'exhibit',
              title: "A barber's price list",
              body: 'Each rule targets a different kind of selector. Try changing `.price` to `li` and see what happens.',
              html: `
                <h1 id="shop-name">Sharp &amp; Co. Barbers</h1>
                <ul>
                  <li>Haircut <span class="price">£18</span></li>
                  <li>Beard trim <span class="price">£10</span></li>
                  <li>Hot towel shave <span class="price">£22</span></li>
                </ul>
              `,
              css: `
                #shop-name {
                  color: navy;
                }

                li {
                  font-size: 18px;
                }

                .price {
                  color: crimson;
                  font-weight: bold;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'Which selector styles `<p class="note">Walk-ins welcome</p>`?',
              options: ['`.note`', '`#note`', '`note`', '`class=note`'],
              answer: 0,
              explain: 'A class selector is a dot plus the class name. `#note` would need `id="note"`, and plain `note` looks for a `<note>` tag.',
            },
            {
              type: 'task',
              title: 'Style the price list',
              body: `
                Write three rules:

                1. The element with id \`title\`: **navy**.
                2. Every element with class \`price\`: **green**.
                3. The element with class \`note\`: **gray**.
              `,
              html: `
                <h1 id="title">Price list</h1>
                <ul>
                  <li>Haircut <span class="price">£18</span></li>
                  <li>Beard trim <span class="price">£10</span></li>
                  <li>Hot towel shave <span class="price">£22</span></li>
                </ul>
                <p class="note">Walk-ins welcome.</p>
              `,
              css: `/* #title, .price and .note */\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The title is navy', test: (c) => spelling(c) || colourIs(c, '#title', 'color', 'navy', 'The title') },
                {
                  text: 'All three prices are green',
                  test: (c) => {
                    const n = c.$$('.price').filter((e) => c.sameColor(c.style(e, 'color'), 'green')).length;
                    return n === 3 || (n ? n + ' of 3 prices are green.' : 'No price is green yet. A class selector starts with a dot: .price');
                  },
                },
                { text: 'The note is gray', test: (c) => colourIs(c, '.note', 'color', 'gray', 'The note') },
                { text: 'The list items are not green', test: (c) => !c.sameColor(c.style('li', 'color'), 'green') || 'Only the prices should be green, not the whole list item.' },
              ],
              hint: '```css\n#title { color: navy; }\n.price { … }\n.note { … }\n```',
              solution: {
                css: `
                  #title {
                    color: navy;
                  }

                  .price {
                    color: green;
                  }

                  .note {
                    color: gray;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Combining selectors',
              body: `
                | Selector | Means |
                |---|---|
                | \`h2, h3\` | every \`h2\` **and** every \`h3\` (a comma groups them) |
                | \`nav a\` | every \`a\` **anywhere inside** a \`nav\` (a space: "descendant") |
                | \`ul > li\` | every \`li\` that is a **direct child** of a \`ul\` |
                | \`*\` | **every** element |

                \`\`\`css
                h2, h3 { color: darkred; }      /* both headings */
                .menu a { color: darkorange; }  /* only links in the menu */
                \`\`\`

                The descendant selector is the workhorse. \`.menu a\` styles the menu's links and leaves every other link on the page alone.
              `,
            },
            {
              type: 'exhibit',
              title: 'Descendant vs child',
              body: '`.footer a` hits every link in the footer, however deep. `.footer > a` only hits links sitting directly inside it. Which link turns red?',
              html: `
                <div class="footer">
                  <a href="#">Instagram</a>
                  <p>Questions? <a href="#">Email us</a></p>
                </div>
              `,
              css: `
                .footer a {
                  color: gray;
                }

                .footer > a {
                  color: crimson;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Fill in the selectors.',
              code: `
                /* every link inside the nav */
                nav [[a]] { color: white; }

                /* the element with id="hero" */
                [[#hero]] { color: navy; }

                /* every element with class="card" */
                [[.card]] { color: black; }
              `,
              options: ['a', '#hero', '.card', '.hero', '#card', 'link'],
            },
            {
              type: 'task',
              title: 'Group and nest',
              body: `
                1. Make the \`h2\` **and** the \`h3\` **darkred**, using **one** rule with a comma.
                2. Make the links **inside the \`.menu\`** **darkorange**. The "Read more" link in the article must stay as it is.
                3. Make the link in the \`footer\` **gray**.
              `,
              html: `
                <nav class="menu">
                  <a href="#">Home</a>
                  <a href="#">Cakes</a>
                  <a href="#">Contact</a>
                </nav>
                <article>
                  <h2>Our story</h2>
                  <p>Baking in Leicester since 1998. <a href="#">Read more</a></p>
                  <h3>Opening hours</h3>
                  <p>Tuesday to Saturday, 7am to 3pm.</p>
                </article>
                <footer>
                  <a href="#">Instagram</a>
                </footer>
              `,
              css: `\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The `h2` and `h3` are darkred',
                  test: (c) => (c.sameColor(c.style('h2', 'color'), 'darkred') && c.sameColor(c.style('h3', 'color'), 'darkred')) || 'h2 is ' + c.style('h2', 'color') + ', h3 is ' + c.style('h3', 'color') + '.',
                },
                {
                  text: 'One rule styles both, using a comma',
                  test: (c) => c.rules().some((r) => { const p = r.sel.split(','); return p.includes('h2') && p.includes('h3'); }) || 'Write a single rule that starts h2, h3 { … }',
                },
                { text: 'The three menu links are darkorange', test: (c) => c.$$('.menu a').every((a) => c.sameColor(c.style(a, 'color'), 'darkorange')) },
                { text: 'The "Read more" link is not orange', test: (c) => !c.sameColor(c.style('article a', 'color'), 'darkorange') || 'Your rule is hitting every link. Put .menu in front: .menu a' },
                { text: 'The footer link is gray', test: (c) => colourIs(c, 'footer a', 'color', 'gray', 'The footer link') },
              ],
              hint: '```css\nh2, h3 { … }\n.menu a { … }\nfooter a { … }\n```',
              solution: {
                css: `
                  h2, h3 {
                    color: darkred;
                  }

                  .menu a {
                    color: darkorange;
                  }

                  footer a {
                    color: gray;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`p` = every p. `.price` = class="price". `#title` = id="title". Prefer classes.',
                'A comma groups selectors: `h2, h3 { }` styles both.',
                'A space means "inside": `.menu a` = links anywhere in .menu.',
                '`>` means "direct child only": `ul > li`.',
                '`*` selects every element.',
              ],
            },
          ],
        },

        /* ── 3. Colours and backgrounds ─────────────────────────────── */
        {
          id: 'css-colours',
          title: 'Colours and backgrounds',
          minutes: 9,
          steps: [
            {
              type: 'brief',
              title: 'Four ways to write a colour',
              body: `
                | Format | Example | Notes |
                |---|---|---|
                | Name | \`tomato\` | About 140 names. Quick for testing. |
                | Hex | \`#ff6347\` | The most common. Pairs of red, green, blue from \`00\` to \`ff\`. \`#fff\` is short for \`#ffffff\`. |
                | rgb | \`rgb(255, 99, 71)\` | Red, green, blue from 0 to 255. |
                | hsl | \`hsl(9, 100%, 64%)\` | Hue (0–360 round the colour wheel), saturation, lightness. Easy to make a shade lighter or darker. |

                All four above are the **same colour**. The browser doesn't care which you use. Brand guides usually give hex codes, so you'll see hex the most.
              `,
            },
            {
              type: 'exhibit',
              title: 'Same colour, four spellings',
              body: 'Each box uses a different format. Try changing the lightness in the `hsl` one from `64%` to `40%`.',
              html: `
                <p class="a">Name: tomato</p>
                <p class="b">Hex: #ff6347</p>
                <p class="c">rgb(255, 99, 71)</p>
                <p class="d">hsl(9, 100%, 64%)</p>
              `,
              css: `
                p { color: white; padding: 10px; }

                .a { background-color: tomato; }
                .b { background-color: #ff6347; }
                .c { background-color: rgb(255, 99, 71); }
                .d { background-color: hsl(9, 100%, 64%); }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'Hex is red, green, blue, each from `00` (none) to `ff` (full). What colour is `#0000ff`?',
              options: ['Blue', 'Red', 'Black', 'White'],
              answer: 0,
              explain: 'No red (`00`), no green (`00`), full blue (`ff`). `#000000` is black and `#ffffff` is white.',
            },
            {
              type: 'brief',
              title: 'Text colour and background colour',
              body: `
                - \`color\` sets the **text** colour.
                - \`background-color\` fills the element's box behind the text.

                \`\`\`css
                .banner {
                  background-color: #1f3a5f;
                  color: white;
                }
                \`\`\`

                Set \`color\` on a box and the text inside it, including headings and paragraphs, takes it on (unless they have their own colour).

                > Keep enough **contrast** between text and background. Pale grey on white looks elegant and is hard to read, especially on a phone in the sun.
              `,
            },
            {
              type: 'task',
              title: 'The opening hours banner',
              body: `
                Style the banner:

                1. \`.banner\`: background colour **#1f3a5f** (dark blue), text colour **white**.
                2. The \`h2\` inside it: **#ffd166** (warm yellow).
              `,
              html: `
                <div class="banner">
                  <h2>Open today</h2>
                  <p>8am to 6pm, Monday to Saturday</p>
                </div>
              `,
              css: `\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The banner background is #1f3a5f', test: (c) => colourIs(c, '.banner', 'background-color', '#1f3a5f', 'The background') },
                { text: 'The paragraph text is white', test: (c) => spelling(c) || colourIs(c, '.banner p', 'color', 'white', 'The paragraph') },
                { text: 'The heading is #ffd166', test: (c) => colourIs(c, '.banner h2', 'color', '#ffd166', 'The heading') },
              ],
              hint: 'Two rules: `.banner { background-color: …; color: …; }` and `.banner h2 { color: …; }`.',
              solution: {
                css: `
                  .banner {
                    background-color: #1f3a5f;
                    color: white;
                  }

                  .banner h2 {
                    color: #ffd166;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'See-through colours and gradients',
              body: `
                **rgba** adds a fourth number, the alpha: \`0\` is invisible, \`1\` is solid.

                \`\`\`css
                .overlay { background-color: rgba(0, 0, 0, 0.5); }  /* half-transparent black */
                \`\`\`

                **opacity** fades the **whole element**, text and all:

                \`\`\`css
                .sold-out { opacity: 0.5; }
                \`\`\`

                **Gradients** blend colours. They're a kind of image, so they go in \`background\` (or \`background-image\`), not \`background-color\`:

                \`\`\`css
                .hero { background: linear-gradient(to right, #ff7e5f, #feb47b); }
                \`\`\`

                The direction can be \`to right\`, \`to bottom\` (the default) or an angle like \`135deg\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Gradient, rgba and opacity',
              body: 'Change `to right` to `135deg`, or the `0.6` to `0.2`.',
              html: `
                <div class="hero">
                  <p class="label">New season candles</p>
                </div>
                <p class="sold">Fig and cedar: sold out</p>
              `,
              css: `
                .hero {
                  background: linear-gradient(to right, #ff7e5f, #feb47b);
                  padding: 40px;
                }

                .label {
                  background-color: rgba(0, 0, 0, 0.6);
                  color: white;
                  padding: 10px;
                }

                .sold {
                  opacity: 0.4;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Give the hero a gradient, and fade the sold-out item to half strength.',
              code: `
                .hero { background: [[linear-gradient]](to right, navy, teal); }
                .sold { [[opacity]]: 0.5; }
              `,
              options: ['linear-gradient', 'gradient', 'rgba', 'opacity', 'alpha', 'fade'],
            },
            {
              type: 'quiz',
              q: 'You want a dark see-through box over a photo, with **crisp, solid white text** on it. What do you use?',
              options: ['`background-color: rgba(0, 0, 0, 0.6)`', '`opacity: 0.6` on the box', '`color: rgba(0, 0, 0, 0.6)`', '`background-color: black` and `opacity: 0.6`'],
              answer: 0,
              explain: '`opacity` fades everything in the box, text included. An rgba background fades only the background.',
            },
            {
              type: 'task',
              title: 'The summer sale hero',
              body: `
                1. \`.hero\`: a **linear-gradient** background, from **#ff7e5f** to **#feb47b**, going **to right**.
                2. \`.hero h1\`: **white**.
                3. \`.sub\`: white at 80% strength: **rgba(255, 255, 255, 0.8)**.
                4. \`.sold\`: **opacity 0.5**.
              `,
              html: `
                <section class="hero">
                  <h1>Summer sale</h1>
                  <p class="sub">Up to 30% off every candle</p>
                </section>
                <p class="sold">Lavender candle: sold out</p>
              `,
              css: `
                .hero {
                  padding: 32px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The hero has a linear gradient',
                  test: (c) => /^linear-gradient/.test(c.style('.hero', 'background-image')) || (/background-color\s*:\s*linear-gradient/i.test(c.src('css')) ? 'Gradients go in background (or background-image), not background-color.' : false),
                },
                {
                  text: 'It goes from #ff7e5f to #feb47b',
                  test: (c) => {
                    const g = c.style('.hero', 'background-image');
                    return (g.includes(c.rgb('#ff7e5f')) && g.includes(c.rgb('#feb47b'))) || (g === 'none' ? false : 'The gradient is ' + g);
                  },
                },
                { text: 'The heading is white', test: (c) => colourIs(c, '.hero h1', 'color', 'white', 'The heading') },
                { text: 'The subtitle is rgba(255, 255, 255, 0.8)', test: (c) => colourIs(c, '.sub', 'color', 'rgba(255, 255, 255, 0.8)', 'The subtitle') },
                { text: 'The sold-out line has opacity 0.5', test: (c) => near(+c.style('.sold', 'opacity'), 0.5, 0.01) || 'Its opacity is ' + c.style('.sold', 'opacity') + '.' },
              ],
              hint: '```css\n.hero {\n  padding: 32px;\n  background: linear-gradient(to right, #ff7e5f, #feb47b);\n}\n```\n\nThen rules for `.hero h1`, `.sub` and `.sold`.',
              solution: {
                css: `
                  .hero {
                    padding: 32px;
                    background: linear-gradient(to right, #ff7e5f, #feb47b);
                  }

                  .hero h1 {
                    color: white;
                  }

                  .sub {
                    color: rgba(255, 255, 255, 0.8);
                  }

                  .sold {
                    opacity: 0.5;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Colours can be names (`tomato`), hex (`#ff6347`), `rgb(255, 99, 71)` or `hsl(9, 100%, 64%)`. All equal.',
                '`color` is the text; `background-color` fills the box.',
                '`rgba(0, 0, 0, 0.5)`: the last number is transparency, 0 to 1.',
                '`opacity` fades the whole element, text included.',
                'Gradients go in `background`: `linear-gradient(to right, #ff7e5f, #feb47b)`.',
                'Keep strong contrast between text and its background.',
              ],
            },
          ],
        },

        /* ── 4. Text and fonts ──────────────────────────────────────── */
        {
          id: 'css-text',
          title: 'Text and fonts',
          minutes: 10,
          steps: [
            {
              type: 'brief',
              title: 'Font family, size and weight',
              body: `
                \`\`\`css
                h1 {
                  font-family: Georgia, 'Times New Roman', serif;
                  font-size: 40px;
                  font-weight: 700;
                }
                \`\`\`

                - **font-family** is a list (a "font stack"). The browser uses the first font the visitor has installed, so you always **end with a generic family**: \`serif\`, \`sans-serif\` or \`monospace\`. Names with spaces go in quotes.
                - **font-size** sets the size. Browsers default to 16px.
                - **font-weight** sets thickness: \`400\` is normal, \`700\` is bold. The words \`normal\` and \`bold\` work too.

                A common modern stack for body text: \`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif\`. It uses each device's own clean font.
              `,
            },
            {
              type: 'exhibit',
              title: 'A café menu card',
              body: 'Swap `Georgia` for `\'Courier New\'`, or try a font-weight of `400` on the heading.',
              html: `
                <h1>The Corner Café</h1>
                <p>Breakfast served all day. Locally roasted coffee, fresh pastries and proper tea.</p>
              `,
              css: `
                body {
                  font-family: Arial, Helvetica, sans-serif;
                }

                h1 {
                  font-family: Georgia, serif;
                  font-size: 40px;
                  font-weight: 700;
                }

                p {
                  font-size: 18px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'Why does a font stack end with a word like `sans-serif`?',
              options: [
                "It's a fallback: if none of the named fonts are installed, the browser picks any sans-serif font",
                'It makes the text bold',
                'It downloads the font from the internet',
                'It is required, or the whole rule is ignored',
              ],
              answer: 0,
              explain: "Without it, a visitor who doesn't have your fonts gets the browser's default, usually Times.",
            },
            {
              type: 'task',
              title: 'Set the menu fonts',
              body: `
                1. On \`body\`: the font stack **Arial, Helvetica, sans-serif**. Every element inside takes it on.
                2. On \`h1\`: the stack **Georgia, serif**, size **40px**.
                3. On \`p\`: size **18px**.
              `,
              html: `
                <h1>The Corner Café</h1>
                <p>Breakfast served all day.</p>
                <p>Locally roasted coffee and proper tea.</p>
              `,
              css: `\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'Body text uses Arial, ending in `sans-serif`',
                  test: (c) => {
                    const f = c.style('p', 'font-family').toLowerCase();
                    return (/arial/.test(f) && /sans-serif$/.test(f)) || 'The paragraphs use: ' + f;
                  },
                },
                {
                  text: 'The heading uses Georgia, ending in `serif`',
                  test: (c) => {
                    const f = c.style('h1', 'font-family').toLowerCase();
                    return (/georgia/.test(f) && /(^|,)\s*serif$/.test(f)) || 'The heading uses: ' + f;
                  },
                },
                { text: 'The heading is 40px', test: (c) => c.px('h1', 'font-size') === 40 || 'The heading is ' + c.style('h1', 'font-size') + '.' },
                { text: 'The paragraphs are 18px', test: (c) => c.px('p', 'font-size') === 18 || 'The paragraphs are ' + c.style('p', 'font-size') + '.' },
              ],
              hint: '```css\nbody {\n  font-family: Arial, Helvetica, sans-serif;\n}\n```\n\nThen an `h1` rule with `font-family` and `font-size`, and a `p` rule.',
              solution: {
                css: `
                  body {
                    font-family: Arial, Helvetica, sans-serif;
                  }

                  h1 {
                    font-family: Georgia, serif;
                    font-size: 40px;
                  }

                  p {
                    font-size: 18px;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Spacing, alignment and case',
              body: `
                | Property | Example | Does |
                |---|---|---|
                | \`line-height\` | \`1.6\` | Space between lines, as a multiple of the font size. 1.5 to 1.7 reads well for body text. |
                | \`text-align\` | \`center\` | \`left\`, \`center\`, \`right\`. American spelling again: \`center\`. |
                | \`text-transform\` | \`uppercase\` | Shows text in capitals without retyping it. |
                | \`letter-spacing\` | \`2px\` | Space between letters. Small capitals headings look better with a little. |
                | \`text-decoration\` | \`none\` | Removes (or adds) underlines. Most often used on links. |

                Write \`line-height\` with **no unit** (\`1.6\`, not \`1.6px\`): it then scales with the text.
              `,
            },
            {
              type: 'exhibit',
              title: 'Before and after',
              body: 'The second card uses every property in the table. Try `text-align: right`, or remove `line-height` and see how cramped the paragraph gets.',
              html: `
                <div class="plain">
                  <h2>Breakfast</h2>
                  <p>Two eggs any style, sourdough toast, roast tomatoes and mushrooms. Served until 11:30.</p>
                </div>
                <div class="styled">
                  <h2>Breakfast</h2>
                  <p>Two eggs any style, sourdough toast, roast tomatoes and mushrooms. Served until 11:30.</p>
                  <a href="#">Order ahead</a>
                </div>
              `,
              css: `
                .styled h2 {
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  text-align: center;
                }

                .styled p {
                  line-height: 1.7;
                }

                .styled a {
                  text-decoration: none;
                  font-weight: bold;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Centre the heading, show it in capitals, and remove the link underline.',
              code: `
                h2 {
                  text-align: [[center]];
                  text-transform: [[uppercase]];
                }

                a {
                  text-decoration: [[none]];
                }
              `,
              options: ['center', 'centre', 'middle', 'uppercase', 'capitals', 'none', 'off'],
              explain: '`centre` is the British spelling, and CSS ignores it. It is always `center`.',
            },
            {
              type: 'task',
              title: 'Polish the menu section',
              body: `
                1. \`h2\`: **uppercase**, **letter-spacing 2px**, **centred**.
                2. \`.desc\`: **line-height 1.6**.
                3. \`.order\` (a link): **no underline**, **bold**.
              `,
              html: `
                <h2>Lunch</h2>
                <p class="desc">Soup of the day with a hunk of sourdough, or a toasted sandwich with salad. Ask about our vegan options.</p>
                <a class="order" href="#">Order ahead</a>
              `,
              css: `\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The heading is uppercase', test: (c) => c.style('h2', 'text-transform') === 'uppercase' },
                { text: 'The heading has 2px letter-spacing', test: (c) => c.px('h2', 'letter-spacing') === 2 || 'letter-spacing is ' + c.style('h2', 'letter-spacing') + '.' },
                { text: 'The heading is centred', test: (c) => c.style('h2', 'text-align') === 'center' || (/centre/.test(c.src('css')) ? 'CSS spells it center.' : false) },
                { text: 'The description has a line-height of 1.6', test: (c) => near(lineRatio(c, '.desc'), 1.6, 0.02) || 'The line-height is ' + c.style('.desc', 'line-height') + ' on ' + c.style('.desc', 'font-size') + ' text. Use line-height: 1.6;' },
                {
                  text: 'The link has no underline and is bold',
                  test: (c) => (c.style('.order', 'text-decoration-line') === 'none' && +c.style('.order', 'font-weight') >= 700) || (c.style('.order', 'text-decoration-line') !== 'none' ? 'The link is still underlined.' : 'The link is not bold yet.'),
                },
              ],
              hint: 'Three rules: `h2 { … }`, `.desc { … }` and `.order { … }`. Bold is `font-weight: bold;` (or `700`).',
              solution: {
                css: `
                  h2 {
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-align: center;
                  }

                  .desc {
                    line-height: 1.6;
                  }

                  .order {
                    text-decoration: none;
                    font-weight: bold;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Using Google Fonts',
              body: `
                For a brand font that visitors won't have installed, real sites load it from a font service. Google Fonts is free:

                1. Pick a font at fonts.google.com and copy the \`<link>\` it gives you into your page's \`<head>\`:

                \`\`\`html
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap">
                \`\`\`

                2. Use the font by name in CSS, **with a fallback**:

                \`\`\`css
                h1 { font-family: 'Playfair Display', Georgia, serif; }
                \`\`\`

                The preview here has no internet, so the tasks stick to fonts every computer has. Two font families per site is plenty: one for headings, one for text.
              `,
            },
            {
              type: 'quiz',
              q: "You've linked Playfair Display from Google Fonts. How do you use it on headings?",
              options: ["`font-family: 'Playfair Display', serif;`", '`font: google(Playfair Display);`', '`font-family: url(fonts.googleapis.com);`', '`font-style: Playfair Display;`'],
              answer: 0,
              explain: 'Once linked, a web font is used by name like any other font, with a generic fallback at the end.',
            },
            {
              type: 'debrief',
              points: [
                '`font-family` is a stack: `Georgia, serif`. Always end with `serif`, `sans-serif` or `monospace`.',
                '`font-weight: 700` = bold, `400` = normal.',
                '`line-height: 1.6` (no unit) for readable body text.',
                '`text-align: center` (American spelling), `text-transform: uppercase`, `letter-spacing: 2px`.',
                '`text-decoration: none` removes link underlines.',
                'Web fonts: link them in the `<head>`, then use them by name with a fallback.',
              ],
            },
          ],
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════
       MODULE 2 — The box
       ═══════════════════════════════════════════════════════════════════ */
    {
      title: 'The box',
      missions: [
        /* ── 5. The box model ───────────────────────────────────────── */
        {
          id: 'css-box-model',
          title: 'The box model',
          minutes: 10,
          steps: [
            {
              type: 'brief',
              title: 'Every element is a box',
              body: `
                The browser draws every element as a rectangle with four layers, from the inside out:

                1. **Content**: the text or image.
                2. **Padding**: space *inside* the box, between the content and the border. It takes the background colour.
                3. **Border**: a line round the padding.
                4. **Margin**: space *outside* the border, pushing other boxes away. Always transparent.

                \`\`\`css
                .card {
                  padding: 20px;
                  border: 3px solid #b5651d;
                  margin: 16px;
                }
                \`\`\`

                Rule of thumb: **padding** for breathing room inside a card or button, **margin** for the gap between things.
              `,
            },
            {
              type: 'exhibit',
              title: 'Two product cards',
              body: 'Change `padding` to `40px` and watch the card grow inside. Change `margin` to `40px` and watch the gap between the cards grow.',
              html: `
                <div class="card">
                  <h3>Beeswax candle</h3>
                  <p>£12</p>
                </div>
                <div class="card">
                  <h3>Soy candle</h3>
                  <p>£9</p>
                </div>
              `,
              css: `
                .card {
                  background-color: #fff8e7;
                  padding: 20px;
                  border: 3px solid #b5651d;
                  margin: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'Which layer sits **inside** the border and is filled by the background colour?',
              options: ['Padding', 'Margin', 'Outline', 'Content only'],
              answer: 0,
              explain: 'Padding is inside the border and shows the background. Margin is outside and always transparent.',
            },
            {
              type: 'task',
              title: 'Give the card some room',
              body: `
                Style \`.card\`:

                1. **16px** of padding on every side.
                2. A border: **2px**, **solid**, colour **#333**.
                3. A background colour of **#fff8e7**.

                The border shorthand takes three values in one go: \`border: width style colour;\`.
              `,
              html: `
                <div class="card">
                  <h3>Beeswax candle</h3>
                  <p>Hand-poured in small batches. £12</p>
                </div>
              `,
              css: `\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The card has 16px padding on every side',
                  test: (c) => ['top', 'right', 'bottom', 'left'].every((s) => c.px('.card', 'padding-' + s) === 16) || 'Padding is ' + c.style('.card', 'padding') + '; it should be 16px all round.',
                },
                {
                  text: 'The border is 2px solid',
                  test: (c) => (['top', 'right', 'bottom', 'left'].every((s) => c.px('.card', 'border-' + s + '-width') === 2 && c.style('.card', 'border-' + s + '-style') === 'solid')) || 'The border is ' + c.style('.card', 'border-top-width') + ' ' + c.style('.card', 'border-top-style') + '.',
                },
                { text: 'The border colour is #333', test: (c) => colourIs(c, '.card', 'border-top-color', '#333', 'The border colour') },
                { text: 'The background is #fff8e7', test: (c) => colourIs(c, '.card', 'background-color', '#fff8e7', 'The background') },
              ],
              hint: '```css\n.card {\n  padding: 16px;\n  border: 2px solid #333;\n  background-color: …;\n}\n```',
              solution: {
                css: `
                  .card {
                    padding: 16px;
                    border: 2px solid #333;
                    background-color: #fff8e7;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Shorthand: 1, 2 or 4 values',
              body: `
                \`padding\` and \`margin\` take one to four values:

                | You write | Means |
                |---|---|
                | \`padding: 16px;\` | all four sides 16px |
                | \`padding: 10px 20px;\` | top and bottom 10px, left and right 20px |
                | \`padding: 5px 10px 15px 20px;\` | top, right, bottom, left (clockwise from the top) |

                Or set one side: \`margin-bottom: 24px;\`.

                **Borders**: \`border: 2px dashed darkred;\`. The style can be \`solid\`, \`dashed\`, \`dotted\` or \`none\`. One side only: \`border-bottom: 1px solid #ddd;\`.

                **Rounded corners**: \`border-radius: 8px;\`. A very large value (\`999px\`) gives a pill shape; \`50%\` on a square gives a circle.
              `,
            },
            {
              type: 'fill',
              q: 'Give the button 10px of padding top and bottom, and 20px left and right.',
              code: `.btn { padding: [[10px]] [[20px]]; }`,
              options: ['10px', '20px', '0', 'auto'],
              explain: 'With two values, the first is top and bottom, the second is left and right.',
            },
            {
              type: 'quiz',
              q: 'With `margin: 0 0 24px 0;`, which side gets 24px?',
              options: ['Bottom', 'Top', 'Right', 'Left'],
              answer: 0,
              explain: 'Four values go clockwise from the top: top, right, bottom, left. The third is the bottom.',
            },
            {
              type: 'exhibit',
              title: 'Borders and corners',
              body: 'A dashed coupon, a pill button and a round badge. Try `dotted` instead of `dashed`, or `border-radius: 8px` on the button.',
              html: `
                <p class="coupon">10% off with code BREAD10</p>
                <a class="pill" href="#">Order now</a>
                <p class="badge">NEW</p>
              `,
              css: `
                .coupon {
                  border: 2px dashed darkred;
                  padding: 12px 20px;
                }

                .pill {
                  background-color: #b5651d;
                  color: white;
                  text-decoration: none;
                  padding: 10px 24px;
                  border-radius: 999px;
                }

                .badge {
                  width: 60px;
                  height: 60px;
                  line-height: 60px;
                  text-align: center;
                  background-color: gold;
                  border-radius: 50%;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'task',
              title: 'A coupon and a pill button',
              body: `
                1. \`.coupon\`: a **2px dashed darkred** border, padding **12px top and bottom, 20px left and right**, and a **24px bottom margin**.
                2. \`.pill\`: padding **10px top and bottom, 24px left and right**, and fully rounded ends (a \`border-radius\` of at least **20px**; \`999px\` is the usual trick).
              `,
              html: `
                <div class="coupon">10% off with code BREAD10</div>
                <a class="pill" href="#">Order now</a>
              `,
              css: `
                .pill {
                  background-color: #b5651d;
                  color: white;
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The coupon has a 2px dashed darkred border',
                  test: (c) =>
                    (c.px('.coupon', 'border-top-width') === 2 && c.style('.coupon', 'border-left-style') === 'dashed' && c.sameColor(c.style('.coupon', 'border-right-color'), 'darkred')) ||
                    'The border is ' + c.style('.coupon', 'border-top-width') + ' ' + c.style('.coupon', 'border-top-style') + ' ' + c.style('.coupon', 'border-top-color') + '.',
                },
                {
                  text: 'The coupon padding is 12px 20px',
                  test: (c) => (c.px('.coupon', 'padding-top') === 12 && c.px('.coupon', 'padding-bottom') === 12 && c.px('.coupon', 'padding-left') === 20 && c.px('.coupon', 'padding-right') === 20) || 'Padding is ' + c.style('.coupon', 'padding') + '.',
                },
                { text: 'The coupon has a 24px bottom margin', test: (c) => c.px('.coupon', 'margin-bottom') === 24 || 'margin-bottom is ' + c.style('.coupon', 'margin-bottom') + '.' },
                {
                  text: 'The button padding is 10px 24px',
                  test: (c) => (c.px('.pill', 'padding-top') === 10 && c.px('.pill', 'padding-left') === 24 && c.px('.pill', 'padding-right') === 24) || 'Padding is ' + c.style('.pill', 'padding') + '.',
                },
                { text: 'The button has rounded ends', test: (c) => c.px('.pill', 'border-top-left-radius') >= 20 || 'border-radius is ' + c.style('.pill', 'border-top-left-radius') + '.' },
              ],
              hint: '```css\n.coupon {\n  border: 2px dashed darkred;\n  padding: 12px 20px;\n  margin-bottom: 24px;\n}\n```\n\nThen add `padding` and `border-radius` to `.pill`.',
              solution: {
                css: `
                  .coupon {
                    border: 2px dashed darkred;
                    padding: 12px 20px;
                    margin-bottom: 24px;
                  }

                  .pill {
                    background-color: #b5651d;
                    color: white;
                    text-decoration: none;
                    padding: 10px 24px;
                    border-radius: 999px;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Every element is a box: **content**, **padding** (inside), **border**, **margin** (outside).',
                'Padding takes the background colour; margin is always transparent.',
                '1 value = all sides; 2 = top/bottom then left/right; 4 = top, right, bottom, left (clockwise).',
                '`border: 2px solid #333;` = width, style, colour. Styles: solid, dashed, dotted, none.',
                '`border-radius: 8px` rounds corners; `999px` makes a pill; `50%` on a square makes a circle.',
              ],
            },
          ],
        },

        /* ── 6. Sizing and units ────────────────────────────────────── */
        {
          id: 'css-sizing-units',
          title: 'Sizing and units',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'Width, height and max-width',
              body: `
                \`\`\`css
                .card {
                  width: 300px;
                  height: 200px;
                }
                \`\`\`

                Usually you **don't** set a height: let the content decide, or text will spill out when it's longer than you planned.

                For widths, \`max-width\` is often better than \`width\`:

                \`\`\`css
                .card { max-width: 400px; }
                \`\`\`

                "Be as wide as you can, but never more than 400px." On a phone it shrinks to fit; on a laptop it stops at 400px.
              `,
            },
            {
              type: 'exhibit',
              title: 'The box-sizing surprise',
              body: 'Both boxes say `width: 300px`, but they are not the same width. By default, padding and border are **added on top** of the width.',
              html: `
                <div class="box a">content-box: 300 + 40 + 10 = 350px</div>
                <div class="box b">border-box: 300px total</div>
              `,
              css: `
                .box {
                  width: 300px;
                  padding: 20px;
                  border: 5px solid #1f3a5f;
                  margin-bottom: 12px;
                  background-color: #eef3f8;
                }

                .b {
                  box-sizing: border-box;
                }
              `,
              edit: ['css'],
              active: 'css',
              after: `
                \`box-sizing: border-box\` makes \`width\` mean the **whole** box, padding and border included. That's what people expect, so almost every site starts with:

                \`\`\`css
                *, *::before, *::after {
                  box-sizing: border-box;
                }
                \`\`\`
              `,
            },
            {
              type: 'quiz',
              q: 'Without `box-sizing: border-box`, how wide is a box with `width: 300px; padding: 20px; border: 5px solid;`?',
              options: ['350px', '300px', '340px', '325px'],
              answer: 0,
              explain: '300 content + 20 padding on each side (40) + 5 border on each side (10) = 350px.',
            },
            {
              type: 'task',
              title: 'Tame the card',
              body: `
                Style \`.card\`:

                1. \`box-sizing: border-box\`.
                2. **24px** of padding.
                3. A **max-width** (not width) of **400px**.

                The card should end up exactly 400px wide on a wide screen, padding and border included, and still fit a narrow phone.
              `,
              html: `
                <div class="card">
                  <h2>Emergency plumber</h2>
                  <p>Available 24/7 across Leicestershire. No call-out fee.</p>
                </div>
              `,
              css: `
                .card {
                  background-color: #eef3f8;
                  border: 2px solid #1f3a5f;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The card uses `box-sizing: border-box`', test: (c) => c.style('.card', 'box-sizing') === 'border-box' },
                { text: 'The card has 24px padding', test: (c) => c.px('.card', 'padding-left') === 24 && c.px('.card', 'padding-top') === 24 },
                {
                  text: 'The card is 400px wide in total',
                  test: async (c) => {
                    await at(c);
                    const w = Math.round(box(c, '.card').width);
                    return w === 400 || 'The card is ' + w + 'px wide' + (w > 400 && c.style('.card', 'box-sizing') !== 'border-box' ? ': the padding and border are being added on. Use box-sizing: border-box.' : '. Use max-width: 400px.');
                  },
                },
                {
                  text: 'It still fits on a 300px-wide phone',
                  test: async (c) => {
                    await c.viewport(300);
                    const w = Math.round(box(c, '.card').width);
                    return w <= 284 || 'At 300px the card is ' + w + 'px wide and spills off the screen. Use max-width rather than width.';
                  },
                },
              ],
              hint: '```css\n.card {\n  …\n  box-sizing: border-box;\n  padding: 24px;\n  max-width: 400px;\n}\n```',
              solution: {
                css: `
                  .card {
                    background-color: #eef3f8;
                    border: 2px solid #1f3a5f;
                    box-sizing: border-box;
                    padding: 24px;
                    max-width: 400px;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Units',
              body: `
                | Unit | Relative to | Good for |
                |---|---|---|
                | \`px\` | nothing: fixed | borders, small details |
                | \`%\` | the parent's width | widths inside a layout |
                | \`rem\` | the root font size (16px by default) | font sizes, spacing |
                | \`em\` | this element's own font size | padding on buttons, so it grows with the text |
                | \`vw\` / \`vh\` | 1% of the window's width / height | full-screen sections |

                So \`2rem\` = 32px, and \`1.5rem\` = 24px.

                Why \`rem\` for text? Some visitors set a bigger default font size in their browser. Sizes in \`rem\` respect that; sizes in \`px\` ignore it.
              `,
            },
            {
              type: 'quiz',
              q: 'The root font size is the default 16px. How big is `h1 { font-size: 2.5rem; }`?',
              options: ['40px', '25px', '32px', '2.5px'],
              answer: 0,
              explain: '2.5 × 16px = 40px.',
            },
            {
              type: 'brief',
              title: 'Centring a block',
              body: `
                To centre a box with a max-width on the page, give it **automatic left and right margins**:

                \`\`\`css
                .page {
                  max-width: 600px;
                  margin: 0 auto;
                }
                \`\`\`

                \`0 auto\` means 0 top and bottom, \`auto\` left and right. The browser splits the leftover space equally between the two sides.

                This centres the **box**. To centre the **text inside** a box, you'd use \`text-align: center\` instead.
              `,
            },
            {
              type: 'fill',
              q: 'Centre the page horizontally.',
              code: `
                .page {
                  max-width: 600px;
                  margin: [[0]] [[auto]];
                }
              `,
              options: ['0', 'auto', 'center', '50%'],
              explain: '`margin: center` is not a thing. `auto` margins on the left and right are what centre a block.',
            },
            {
              type: 'task',
              title: "Centre the plumber's page",
              body: `
                1. \`.page\`: **max-width 600px**, centred with **auto** side margins.
                2. \`h1\`: font size **2rem**.
                3. \`p\`: font size **1.125rem** (that's 18px).
              `,
              html: `
                <main class="page">
                  <h1>Plumbing you can trust</h1>
                  <p>Boilers, leaks and new bathrooms. Gas Safe registered, fixed prices, and we tidy up after ourselves.</p>
                </main>
              `,
              css: `
                .page {
                  background-color: #eef3f8;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The page is at most 600px wide', test: async (c) => { await at(c); return Math.round(box(c, '.page').width) === 600 || 'The page is ' + Math.round(box(c, '.page').width) + 'px wide.'; } },
                {
                  text: 'The page is centred',
                  test: async (c) => {
                    await at(c);
                    const r = box(c, '.page');
                    const right = c.doc.documentElement.clientWidth - r.right;
                    return (r.left > 20 && near(r.left, right, 1.5)) || 'There is ' + Math.round(r.left) + 'px on the left and ' + Math.round(right) + 'px on the right. Use margin: 0 auto;';
                  },
                },
                {
                  text: 'The heading is 2rem',
                  test: (c) => (c.px('h1', 'font-size') === 32 && /rem/.test(c.decl('h1', 'font-size'))) || (c.px('h1', 'font-size') === 32 ? 'That is the right size, but write it in rem: 2rem.' : 'The heading is ' + c.style('h1', 'font-size') + '; 2rem is 32px.'),
                },
                { text: 'The paragraph is 1.125rem (18px)', test: (c) => c.px('p', 'font-size') === 18 || 'The paragraph is ' + c.style('p', 'font-size') + '.' },
              ],
              hint: '```css\n.page {\n  …\n  max-width: 600px;\n  margin: 0 auto;\n}\n\nh1 { font-size: 2rem; }\n```',
              solution: {
                css: `
                  .page {
                    background-color: #eef3f8;
                    max-width: 600px;
                    margin: 0 auto;
                  }

                  h1 {
                    font-size: 2rem;
                  }

                  p {
                    font-size: 1.125rem;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Prefer `max-width` to `width`: it shrinks on small screens.',
                'Start every stylesheet with `*, *::before, *::after { box-sizing: border-box; }` so width includes padding and border.',
                '`rem` = multiples of the root font size (16px). Use it for text. `em` = this element\'s font size.',
                '`%` is relative to the parent; `vw`/`vh` to the window.',
                'Centre a block with `max-width` plus `margin: 0 auto`. Centre text with `text-align: center`.',
              ],
            },
          ],
        },

        /* ── 7. Display ─────────────────────────────────────────────── */
        {
          id: 'css-display',
          title: 'Display',
          minutes: 9,
          steps: [
            {
              type: 'brief',
              title: 'Block and inline',
              body: `
                Every element has a \`display\` type. The two basic ones:

                - **block**: starts on a new line and stretches the full width. \`div\`, \`p\`, \`h1\`, \`section\`, \`ul\`, \`li\`.
                - **inline**: sits inside a line of text, only as wide as its content. \`a\`, \`span\`, \`strong\`, \`em\`.

                The catch: **inline elements ignore \`width\` and \`height\`**, and their top and bottom margins don't push anything away. They flow like words.

                The fix is a hybrid:

                - **inline-block**: sits in the line like a word, but accepts width, height, padding and margins like a box.

                \`\`\`css
                .tag { display: inline-block; width: 100px; }
                \`\`\`
              `,
            },
            {
              type: 'exhibit',
              title: 'Width on an inline element',
              body: 'Both links have `width: 120px`. Only one listens. Change the first one to `inline-block` too.',
              html: `
                <p>
                  <a class="one" href="#">Inline</a>
                  <a class="two" href="#">Inline-block</a>
                </p>
              `,
              css: `
                a {
                  width: 120px;
                  background-color: #f3e5d0;
                  text-align: center;
                }

                .one { display: inline; }
                .two { display: inline-block; }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'You set `width: 200px` on an `<a>` and nothing changes. Why?',
              options: ['Links are inline, and inline elements ignore width', 'Links can never be styled', 'You need `!important`', 'Width only works in pixels on divs'],
              answer: 0,
              explain: 'Give it `display: inline-block` (or `block`) and the width applies.',
            },
            {
              type: 'task',
              title: 'Filter tags',
              body: `
                Turn the three links into equal-sized tags that stay **on one line**:

                1. \`display: inline-block\`
                2. \`width: 100px\`
                3. \`padding: 8px 0\` (top and bottom only)
                4. \`text-align: center\`
              `,
              html: `
                <p>Filter:
                  <a class="tag" href="#">Cakes</a>
                  <a class="tag" href="#">Bread</a>
                  <a class="tag" href="#">Pastries</a>
                </p>
              `,
              css: `
                .tag {
                  background-color: #f3e5d0;
                  color: #6b3e1d;
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The tags are inline-block', test: (c) => c.style('.tag', 'display') === 'inline-block' || 'display is ' + c.style('.tag', 'display') + '.' },
                {
                  text: 'Each tag is 100px wide',
                  test: async (c) => { await at(c); return c.$$('.tag').every((t) => near(box(c, t).width, 100)) || 'The first tag is ' + Math.round(box(c, '.tag').width) + 'px wide.'; },
                },
                { text: 'They stay on one line', test: async (c) => { await at(c); return rowCount(c, '.tag') === 1 || "They're stacked. block starts each on a new line; use inline-block."; } },
                { text: 'They have 8px padding top and bottom', test: (c) => c.px('.tag', 'padding-top') === 8 && c.px('.tag', 'padding-bottom') === 8 },
                { text: 'The text is centred', test: (c) => c.style('.tag', 'text-align') === 'center' },
              ],
              hint: 'Add four declarations to the `.tag` rule. Remember: `center`.',
              solution: {
                css: `
                  .tag {
                    background-color: #f3e5d0;
                    color: #6b3e1d;
                    text-decoration: none;
                    display: inline-block;
                    width: 100px;
                    padding: 8px 0;
                    text-align: center;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Block links, and hiding things',
              body: `
                \`display: block\` on a link makes the **whole row** clickable. That's how most mobile menus are built: each link is a full-width bar.

                Two ways to hide an element:

                | | Hidden? | Keeps its space? |
                |---|---|---|
                | \`display: none\` | yes | **no**: the page closes up |
                | \`visibility: hidden\` | yes | **yes**: leaves a blank gap |

                You'll use \`display: none\` far more. Later, JavaScript can switch it on and off to open a menu.
              `,
            },
            {
              type: 'exhibit',
              title: 'none vs hidden',
              body: 'Swap `display: none` for `visibility: hidden` and watch the gap appear.',
              html: `
                <p class="row">Monday: 9 to 5</p>
                <p class="row closed">Tuesday: closed</p>
                <p class="row">Wednesday: 9 to 5</p>
              `,
              css: `
                .row {
                  background-color: #eef3f8;
                  padding: 8px;
                }

                .closed {
                  display: none;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'An old promo box should vanish completely, with the content below moving up to fill the space. Which do you use?',
              options: ['`display: none`', '`visibility: hidden`', '`opacity: 0`', '`color: white`'],
              answer: 0,
              explain: '`visibility: hidden` and `opacity: 0` both leave an empty gap where the box was.',
            },
            {
              type: 'fill',
              q: 'Make the menu links full-width bars, and hide the promo.',
              code: `
                .menu a { display: [[block]]; }
                .promo { display: [[none]]; }
              `,
              options: ['block', 'inline', 'none', 'hidden', 'inline-block'],
            },
            {
              type: 'task',
              title: 'A mobile menu',
              body: `
                1. \`.menu a\`: **display block**, **12px** padding, and a bottom border of **1px solid #444**.
                2. \`.promo\`: hide it completely.
              `,
              html: `
                <nav class="menu">
                  <a href="#">Home</a>
                  <a href="#">Services</a>
                  <a href="#">Contact</a>
                </nav>
                <div class="promo">Spring offer: 20% off (ended)</div>
                <p>Ace Plumbing: Leicester's friendliest plumbers.</p>
              `,
              css: `
                .menu {
                  background-color: #222;
                }

                .menu a {
                  color: white;
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The links are block', test: (c) => c.style('.menu a', 'display') === 'block' || 'display is ' + c.style('.menu a', 'display') + '.' },
                { text: 'They stack, one per line, full width', test: async (c) => { await at(c); return rowCount(c, '.menu a') === 3 && near(box(c, '.menu a').width, box(c, '.menu').width); } },
                { text: 'Each link has 12px padding', test: (c) => c.px('.menu a', 'padding-top') === 12 && c.px('.menu a', 'padding-left') === 12 },
                {
                  text: 'Each link has a 1px solid #444 bottom border',
                  test: (c) => (c.px('.menu a', 'border-bottom-width') === 1 && c.style('.menu a', 'border-bottom-style') === 'solid' && c.sameColor(c.style('.menu a', 'border-bottom-color'), '#444')) || 'The bottom border is ' + c.style('.menu a', 'border-bottom-width') + ' ' + c.style('.menu a', 'border-bottom-style') + ' ' + c.style('.menu a', 'border-bottom-color') + '.',
                },
                { text: 'The promo is gone, with no gap', test: (c) => c.style('.promo', 'display') === 'none' || (c.style('.promo', 'visibility') === 'hidden' ? 'visibility: hidden leaves a gap. Use display: none.' : false) },
              ],
              hint: 'Add `display`, `padding` and `border-bottom` to `.menu a`. Then a new rule: `.promo { display: …; }`.',
              solution: {
                css: `
                  .menu {
                    background-color: #222;
                  }

                  .menu a {
                    color: white;
                    text-decoration: none;
                    display: block;
                    padding: 12px;
                    border-bottom: 1px solid #444;
                  }

                  .promo {
                    display: none;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '**block** (div, p, h1, li): new line, full width. **inline** (a, span, strong): flows in the text.',
                'Inline elements ignore `width` and `height`. Use `inline-block` to keep them in the line but sizeable.',
                '`display: block` on links makes full-width, fully clickable menu rows.',
                '`display: none` removes an element and its space. `visibility: hidden` hides it but keeps the gap.',
              ],
            },
          ],
        },

        /* ── 8. The cascade ─────────────────────────────────────────── */
        {
          id: 'css-cascade',
          title: 'Cascade, specificity and inheritance',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'When rules disagree',
              body: `
                Two rules can style the same element. The "C" in CSS stands for **cascade**: the set of rules that decides who wins.

                **Rule 1: the later rule wins**, if the selectors are equally strong.

                \`\`\`css
                p { color: black; }
                p { color: navy; }   /* this one wins: it comes later */
                \`\`\`

                Rules only clash on the **same property**. Different properties from both rules all apply.
              `,
            },
            {
              type: 'brief',
              title: 'Specificity: stronger selectors win',
              body: `
                **Rule 2: a more specific selector beats a less specific one**, wherever it is in the file.

                | Strength | Selector |
                |---|---|
                | strongest | \`style="…"\` attribute (inline) |
                | strong | \`#id\` |
                | medium | \`.class\` (and \`:hover\`, which you'll meet later) |
                | weak | \`p\`, \`h1\` (type) |

                Combined selectors add up: \`.menu a\` (a class and a type) beats \`nav a\` (two types). \`#nav a\` beats both.

                So if your rule "isn't working", check whether a **stronger** selector elsewhere is setting the same property.
              `,
            },
            {
              type: 'quiz',
              q: '```html\n<p id="intro" class="lead">Welcome</p>\n```\n\n```css\n#intro { color: red; }\n.lead  { color: green; }\np      { color: black; }\n```\n\nWhat colour is the text?',
              options: ['Red', 'Green', 'Black', 'The browser default'],
              answer: 0,
              explain: 'The id is the most specific selector, so red wins even though the other two come later.',
            },
            {
              type: 'exhibit',
              title: 'Specificity playground',
              body: 'Three rules fight over one paragraph. Delete the `#offer` rule and see who wins next. Then move the `p` rule to the bottom: does it win now?',
              html: `<p id="offer" class="price">Two loaves for £6</p>`,
              css: `
                #offer {
                  color: crimson;
                }

                .price {
                  color: green;
                }

                p {
                  color: navy;
                  font-size: 20px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'task',
              title: 'Fix the grey price',
              body: `
                The theme's \`#special\` rule makes the price grey, beating your \`.price\` rule. Make the price **green** again.

                - Don't delete or edit the theme rules.
                - Don't use \`!important\`.
                - Add one rule **below**, with a selector at least as strong as the id. \`#special\` itself works, and so does \`#special.price\` (no space: the element with that id *and* that class).
              `,
              html: `<p class="price" id="special">Today only: £4.50</p>`,
              css: `
                /* From the theme. Don't change these. */
                #special {
                  color: gray;
                }

                .price {
                  color: green;
                  font-weight: bold;
                }

                /* Your rule goes below */
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The price is green', test: (c) => colourIs(c, '.price', 'color', 'green', 'The price') },
                {
                  text: "The theme's `#special` rule is still there",
                  test: (c) => c.rules().some((r) => r.sel === '#special' && c.sameColor(r.style.getPropertyValue('color'), 'gray')) || "Put the theme's #special { color: gray; } rule back and add a new rule instead.",
                },
                { text: 'No `!important`', test: (c) => !/!\s*important/i.test(c.src('css')) || 'Solve it with a stronger selector instead of !important.' },
                { text: 'The price is still bold', test: (c) => +c.style('.price', 'font-weight') >= 700 },
              ],
              hint: '```css\n#special.price {\n  color: green;\n}\n```',
              solution: {
                css: `
                  /* From the theme. Don't change these. */
                  #special {
                    color: gray;
                  }

                  .price {
                    color: green;
                    font-weight: bold;
                  }

                  /* Your rule goes below */
                  #special.price {
                    color: green;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Inheritance',
              body: `
                Some properties **pass down** from a parent to everything inside it. Set them once on \`body\` and the whole page follows.

                - **Inherited**: \`color\`, \`font-family\`, \`font-size\`, \`font-weight\`, \`line-height\`, \`text-align\`, \`letter-spacing\`.
                - **Not inherited**: \`padding\`, \`margin\`, \`border\`, \`background\`, \`width\`, \`height\`, \`display\`.

                Rule of thumb: **text** properties inherit, **box** properties don't. (A border on \`body\` would be strange on every paragraph.)

                \`\`\`css
                body {
                  font-family: system-ui, sans-serif;
                  color: #333;
                  line-height: 1.6;
                }
                \`\`\`

                Any element with its own rule still overrides what it inherits.
              `,
            },
            {
              type: 'quiz',
              q: 'You put these on `body`. Which ones will the paragraphs inside inherit?',
              options: ['`color: #333`', '`font-family: Georgia, serif`', '`line-height: 1.6`', '`padding: 20px`', '`border: 1px solid`'],
              answer: [0, 1, 2],
              explain: 'Text properties inherit. Padding and border are box properties and stay on `body` only.',
            },
            {
              type: 'task',
              title: 'Set it once on body',
              body: `
                Write **one** rule on \`body\` so every bit of text on the page gets:

                - font: **system-ui, sans-serif**
                - colour: **#333**
                - line height: **1.6**

                Don't write separate rules for \`p\`, \`li\` or \`h1\`: let inheritance do it.
              `,
              html: `
                <header><h1>Ace Plumbing</h1></header>
                <main>
                  <p>Boilers, leaks and bathrooms. No call-out fee.</p>
                  <ul>
                    <li>Gas Safe registered</li>
                    <li>Fixed prices</li>
                  </ul>
                </main>
                <footer><p>Call 0116 000 0000</p></footer>
              `,
              css: `\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The rule is on `body`', test: (c) => !!c.rule('body') || 'Write a body { … } rule.' },
                {
                  text: 'All the text is #333',
                  test: (c) => ['h1', 'main p', 'li', 'footer p'].every((s) => c.sameColor(c.style(s, 'color'), '#333')) || 'The list items are ' + c.style('li', 'color') + '.',
                },
                { text: 'All the text uses a sans-serif stack', test: (c) => ['h1', 'li', 'footer p'].every((s) => /sans-serif$/i.test(c.style(s, 'font-family'))) || 'The list items use: ' + c.style('li', 'font-family') },
                { text: 'Line height is 1.6 everywhere', test: (c) => ['li', 'footer p', 'h1'].every((s) => near(lineRatio(c, s), 1.6, 0.02)) },
              ],
              hint: '```css\nbody {\n  font-family: system-ui, sans-serif;\n  color: …;\n  line-height: …;\n}\n```',
              solution: {
                css: `
                  body {
                    font-family: system-ui, sans-serif;
                    color: #333;
                    line-height: 1.6;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Avoid !important',
              body: `
                Adding \`!important\` after a value makes it beat everything:

                \`\`\`css
                .price { color: green !important; }
                \`\`\`

                It's tempting when a rule won't work. Don't. The next time you need to change that colour, the only way to beat an \`!important\` is another \`!important\`, and soon the whole file is shouting.

                Fix the cause instead: find the stronger rule and either change it or write a selector that's at least as specific. Keep \`!important\` for rare emergencies, like overriding a plugin's CSS you can't edit.
              `,
            },
            {
              type: 'fill',
              q: 'Order the selectors from strongest to weakest.',
              code: `[[inline style]]  beats  [[#id]]  beats  [[.class]]  beats  [[type]]`,
              lang: 'text',
              options: ['inline style', '#id', '.class', 'type'],
            },
            {
              type: 'debrief',
              points: [
                'Same strength: the **later** rule wins.',
                'Specificity: inline style > `#id` > `.class` / `:hover` > type (`p`). Combined selectors add up.',
                'Text properties (`color`, `font-*`, `line-height`, `text-align`) **inherit**. Box properties (padding, margin, border, background) don\'t.',
                'Set the base font, colour and line height once on `body`.',
                'Avoid `!important`: fix the selector instead.',
              ],
            },
          ],
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════
       MODULE 3 — Layout
       ═══════════════════════════════════════════════════════════════════ */
    {
      title: 'Layout',
      missions: [
        /* ── 9. Flexbox I ───────────────────────────────────────────── */
        {
          id: 'css-flex-1',
          title: 'Flexbox I',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'Things in a row',
              body: `
                Blocks stack top to bottom. To put them **side by side**, use **flexbox**. You switch it on for the **parent**:

                \`\`\`css
                .features {
                  display: flex;
                  gap: 16px;
                }
                \`\`\`

                Now every direct child of \`.features\` (a **flex item**) sits in one row, with 16px between them. \`gap\` only adds space *between* items, not round the outside.

                Flexbox is one-dimensional: it lays things out along one line, a row or a column.
              `,
            },
            {
              type: 'exhibit',
              title: 'Three features',
              body: 'Delete `display: flex` and they stack again. Change `gap` to `40px`.',
              html: `
                <div class="features">
                  <div class="feature">Free delivery</div>
                  <div class="feature">Hand-made</div>
                  <div class="feature">Eco wax</div>
                </div>
              `,
              css: `
                .features {
                  display: flex;
                  gap: 16px;
                }

                .feature {
                  background-color: #fff8e7;
                  border: 1px solid #e0c9a6;
                  padding: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'You want three `.card` elements inside a `.cards` div to sit in a row. Where does `display: flex` go?',
              options: ['On `.cards`, the parent', 'On each `.card`', 'On `body`', 'On both the parent and each card'],
              answer: 0,
              explain: 'Flex goes on the container. Its direct children become the flex items and line up.',
            },
            {
              type: 'task',
              title: 'Features in a row',
              body: `
                Put the three features side by side with **16px** between them. Style the parent, \`.features\`.
              `,
              html: `
                <div class="features">
                  <div class="feature"><h3>Free delivery</h3><p>On orders over £30.</p></div>
                  <div class="feature"><h3>Hand-made</h3><p>Poured in our Leicester workshop.</p></div>
                  <div class="feature"><h3>Eco wax</h3><p>Soy and beeswax, no paraffin.</p></div>
                </div>
              `,
              css: `
                .feature {
                  background-color: #fff8e7;
                  padding: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.features` is a flex container', test: (c) => c.style('.features', 'display') === 'flex' || (c.style('.feature', 'display') === 'flex' ? 'display: flex goes on the parent, .features, not on each .feature.' : false) },
                {
                  text: 'The three features sit in one row',
                  test: async (c) => {
                    await at(c);
                    return rowCount(c, '.feature') === 1 || 'They are still stacked. Put display: flex on .features.';
                  },
                },
                { text: 'There is a 16px gap between them', test: (c) => c.px('.features', 'column-gap') === 16 || 'The gap is ' + gapOf(c, '.features') + '.' },
              ],
              hint: '```css\n.features {\n  display: flex;\n  gap: 16px;\n}\n```',
              solution: {
                css: `
                  .features {
                    display: flex;
                    gap: 16px;
                  }

                  .feature {
                    background-color: #fff8e7;
                    padding: 16px;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Direction and alignment',
              body: `
                Flexbox has a **main axis** (the way items flow) and a **cross axis** (across it).

                | Property | Controls | Common values |
                |---|---|---|
                | \`flex-direction\` | which way items flow | \`row\` (default), \`column\` |
                | \`justify-content\` | spacing **along** the main axis | \`flex-start\`, \`center\`, \`space-between\`, \`flex-end\` |
                | \`align-items\` | alignment **across** it | \`stretch\` (default), \`center\`, \`flex-start\` |

                In a row, \`justify-content\` is left-to-right and \`align-items\` is top-to-bottom. Switch to \`flex-direction: column\` and they swap.

                \`space-between\` pushes the first item to the start, the last to the end, and spreads the rest evenly.
              `,
            },
            {
              type: 'exhibit',
              title: 'Alignment playground',
              body: 'Try `justify-content`: `center`, `space-between`, `flex-end`. Then `align-items`: `flex-start`, `center`, `stretch`.',
              html: `
                <div class="bar">
                  <div class="item">Logo</div>
                  <div class="item tall">Menu</div>
                  <div class="item">Call us</div>
                </div>
              `,
              css: `
                .bar {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  height: 120px;
                  background-color: #eef3f8;
                }

                .item {
                  background-color: #1f3a5f;
                  color: white;
                  padding: 10px;
                }

                .tall {
                  padding: 30px 10px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Spread the items out to both ends, and centre them vertically.',
              code: `
                .bar {
                  display: flex;
                  justify-content: [[space-between]];
                  align-items: [[center]];
                }
              `,
              options: ['space-between', 'center', 'stretch', 'middle', 'spread'],
            },
            {
              type: 'quiz',
              q: 'A container has `display: flex; flex-direction: column;`. Which property now moves the items **up and down**?',
              options: ['`justify-content`', '`align-items`', '`text-align`', '`vertical-align`'],
              answer: 0,
              explain: '`justify-content` always works along the main axis. In a column, the main axis runs top to bottom.',
            },
            {
              type: 'task',
              title: 'Centre the hero',
              body: `
                The hero is 300px tall. Stack its contents in a **column** and centre them **both ways**:

                1. \`display: flex\` and \`flex-direction: column\`
                2. Centre them top to bottom (in a column, that's \`justify-content\`)
                3. Centre them left to right (\`align-items\`)
              `,
              html: `
                <section class="hero">
                  <h1>Fresh flowers, delivered</h1>
                  <p>Same-day delivery across Leicester.</p>
                  <a href="#">Shop bouquets</a>
                </section>
              `,
              css: `
                .hero {
                  height: 300px;
                  background-color: #2d6a4f;
                  color: white;
                }

                .hero a {
                  color: #ffd166;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The hero is a flex column',
                  test: (c) => (c.style('.hero', 'display') === 'flex' && c.style('.hero', 'flex-direction') === 'column') || (c.style('.hero', 'display') !== 'flex' ? 'Add display: flex.' : 'flex-direction is ' + c.style('.hero', 'flex-direction') + '.'),
                },
                { text: 'The items are centred top to bottom', test: (c) => c.style('.hero', 'justify-content') === 'center' || 'justify-content is ' + c.style('.hero', 'justify-content') + '.' },
                {
                  text: 'The items are centred left to right',
                  test: async (c) => {
                    await at(c);
                    const h = box(c, '.hero');
                    const a = box(c, '.hero a');
                    return (c.style('.hero', 'align-items') === 'center' && a.width < h.width / 2 && near(a.left + a.width / 2, h.left + h.width / 2, 2)) || 'Use align-items: center; to centre them left to right.';
                  },
                },
              ],
              hint: '```css\n.hero {\n  …\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n```',
              solution: {
                css: `
                  .hero {
                    height: 300px;
                    background-color: #2d6a4f;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                  }

                  .hero a {
                    color: #ffd166;
                  }
                `,
              },
            },
            {
              type: 'task',
              title: 'Opening hours',
              body: `
                Make each \`.row\` a flex container with the day on the **left** and the time pushed to the **right**. One property on \`.row\` does the spreading.
              `,
              html: `
                <div class="hours">
                  <div class="row"><span>Monday to Friday</span><span>9am to 6pm</span></div>
                  <div class="row"><span>Saturday</span><span>10am to 4pm</span></div>
                  <div class="row"><span>Sunday</span><span>Closed</span></div>
                </div>
              `,
              css: `
                .hours {
                  max-width: 400px;
                }

                .row {
                  padding: 8px 0;
                  border-bottom: 1px solid #ddd;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'Each row is a flex container', test: (c) => c.$$('.row').every((r) => c.style(r, 'display') === 'flex') },
                {
                  text: 'The times line up on the right',
                  test: async (c) => {
                    await at(c);
                    return c.$$('.row').every((r) => near(box(c, r.lastElementChild).right, box(c, r).right)) || 'The times are not at the right edge yet. Try justify-content: space-between;';
                  },
                },
                {
                  text: 'The days stay on the left',
                  test: async (c) => {
                    await at(c);
                    return c.$$('.row').every((r) => near(box(c, r.firstElementChild).left, box(c, r).left));
                  },
                },
              ],
              hint: '```css\n.row {\n  …\n  display: flex;\n  justify-content: space-between;\n}\n```',
              solution: {
                css: `
                  .hours {
                    max-width: 400px;
                  }

                  .row {
                    padding: 8px 0;
                    border-bottom: 1px solid #ddd;
                    display: flex;
                    justify-content: space-between;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`display: flex` goes on the **parent**; its direct children line up in a row.',
                '`gap: 16px` puts space between flex items (not round the edges).',
                '`flex-direction: row | column` sets the main axis.',
                '`justify-content` spaces items **along** the main axis; `align-items` aligns them **across** it.',
                '`justify-content: space-between` pushes the first and last items to the two ends.',
              ],
            },
          ],
        },

        /* ── 10. Flexbox II ─────────────────────────────────────────── */
        {
          id: 'css-flex-2',
          title: 'Flexbox II',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'Wrapping',
              body: `
                By default flex items stay on **one line**, squashing themselves to fit. Six 220px cards in a 500px space all get thinner.

                \`flex-wrap: wrap\` lets them drop onto a new line instead:

                \`\`\`css
                .cards {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 16px;
                }

                .card {
                  width: 220px;
                }
                \`\`\`

                As the screen gets narrower, fewer cards fit on each line and the rest wrap underneath. A simple responsive layout without any extra code.
              `,
            },
            {
              type: 'exhibit',
              title: 'Wrap on, wrap off',
              body: 'Change `wrap` to `nowrap` and watch the tags squash onto one line.',
              html: `
                <div class="tags">
                  <span class="tag">Birthday cakes</span>
                  <span class="tag">Wedding cakes</span>
                  <span class="tag">Sourdough</span>
                  <span class="tag">Croissants</span>
                  <span class="tag">Vegan</span>
                  <span class="tag">Gluten-free</span>
                  <span class="tag">Gift boxes</span>
                  <span class="tag">Coffee</span>
                </div>
              `,
              css: `
                .tags {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  max-width: 360px;
                }

                .tag {
                  background-color: #f3e5d0;
                  padding: 6px 12px;
                  border-radius: 999px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'Without `flex-wrap: wrap`, what happens to flex items that don\'t fit on the line?',
              options: ['They shrink to squeeze onto one line', 'They wrap onto a new line automatically', 'They are hidden', 'They stack in a column'],
              answer: 0,
              explain: 'The default is `nowrap`: everything stays on one line and shrinks. Add `flex-wrap: wrap` to let items move down.',
            },
            {
              type: 'task',
              title: 'Let the cards wrap',
              body: `
                1. \`.cards\`: a flex container that **wraps**, with a **16px** gap.
                2. \`.card\`: **220px** wide.
              `,
              html: `
                <div class="cards">
                  <div class="card"><h3>Sourdough</h3><p>£4.80</p></div>
                  <div class="card"><h3>Rye</h3><p>£4.20</p></div>
                  <div class="card"><h3>Focaccia</h3><p>£3.90</p></div>
                  <div class="card"><h3>Baguette</h3><p>£2.50</p></div>
                  <div class="card"><h3>Brioche</h3><p>£3.60</p></div>
                  <div class="card"><h3>Bagels</h3><p>£3.00</p></div>
                </div>
              `,
              css: `
                .card {
                  background-color: #eef3f8;
                  padding: 16px;
                  box-sizing: border-box;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.cards` is a flex container', test: (c) => c.style('.cards', 'display') === 'flex' },
                { text: 'It wraps', test: (c) => c.style('.cards', 'flex-wrap') === 'wrap' || 'flex-wrap is ' + c.style('.cards', 'flex-wrap') + '.' },
                {
                  text: 'Each card is 220px wide',
                  test: async (c) => {
                    await at(c);
                    const w = Math.round(box(c, '.card').width);
                    return w === 220 || 'The cards are ' + w + 'px wide' + (c.style('.cards', 'flex-wrap') !== 'wrap' ? ': without wrapping they shrink to fit one line.' : '.');
                  },
                },
                {
                  text: 'The cards spread over more than one line',
                  test: async (c) => {
                    await at(c);
                    return rowCount(c, '.card') >= 2;
                  },
                },
                { text: 'There is a 16px gap', test: (c) => c.px('.cards', 'column-gap') === 16 && c.px('.cards', 'row-gap') === 16 },
              ],
              hint: '```css\n.cards {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n}\n```\n\nThen add `width` to `.card`.',
              solution: {
                css: `
                  .cards {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                  }

                  .card {
                    background-color: #eef3f8;
                    padding: 16px;
                    box-sizing: border-box;
                    width: 220px;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Growing and shrinking',
              body: `
                Flex items have three sizing powers, usually written together with the \`flex\` shorthand:

                - **flex-grow**: how much of the spare space it takes. \`0\` = none.
                - **flex-shrink**: whether it may get smaller than its size. \`0\` = never.
                - **flex-basis**: its starting size, like a width.

                Two you'll use constantly:

                \`\`\`css
                .search input { flex: 1; }          /* take all the spare space */
                .sidebar { flex: 0 0 200px; }       /* exactly 200px, never grow or shrink */
                \`\`\`

                **align-self** overrides \`align-items\` for one item: \`.badge { align-self: flex-start; }\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'flex: 1 at work',
              body: "The input takes whatever space the button doesn't need. Remove `flex: 1` to see the difference. In the second row, change the sidebar's `200px`.",
              html: `
                <form class="search">
                  <input type="text" placeholder="Search candles">
                  <button type="submit">Search</button>
                </form>
                <div class="layout">
                  <aside class="sidebar">Filters</aside>
                  <main class="main">Products</main>
                </div>
              `,
              css: `
                .search {
                  display: flex;
                  gap: 8px;
                  margin-bottom: 16px;
                }

                .search input {
                  flex: 1;
                }

                .layout {
                  display: flex;
                  gap: 16px;
                }

                .sidebar {
                  flex: 0 0 200px;
                  background-color: #f3e5d0;
                }

                .main {
                  flex: 1;
                  background-color: #eef3f8;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Make the input fill the spare space, and centre the badge on its own.',
              code: `
                .search input { flex: [[1]]; }
                .badge { [[align-self]]: center; }
              `,
              options: ['1', '0', 'auto', 'align-self', 'align-items', 'justify-content'],
              explain: '`align-items` goes on the container and affects every item; `align-self` goes on one item.',
            },
            {
              type: 'task',
              title: 'A search bar',
              body: `
                1. \`.search\`: a flex container with an **8px** gap.
                2. \`.search input\`: \`flex: 1\`, so it fills the row and the button stays its natural size.
              `,
              html: `
                <form class="search">
                  <input type="text" placeholder="Search candles">
                  <button type="submit">Search</button>
                </form>
              `,
              css: `
                input,
                button {
                  font-size: 16px;
                  padding: 8px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The form is a flex container', test: (c) => c.style('.search', 'display') === 'flex' },
                { text: 'The gap is 8px', test: (c) => c.px('.search', 'column-gap') === 8 || 'The gap is ' + gapOf(c, '.search') + '.' },
                { text: 'The input grows (`flex: 1`)', test: (c) => +c.style('.search input', 'flex-grow') >= 1 || 'flex-grow on the input is ' + c.style('.search input', 'flex-grow') + '.' },
                {
                  text: 'Input and button fill the whole row',
                  test: async (c) => {
                    await at(c);
                    const f = box(c, '.search');
                    const b = box(c, '.search button');
                    return near(b.right, f.right, 1.5) || 'There is ' + Math.round(f.right - b.right) + 'px of empty space at the end of the row.';
                  },
                },
              ],
              hint: '```css\n.search {\n  display: flex;\n  gap: 8px;\n}\n\n.search input {\n  flex: 1;\n}\n```',
              solution: {
                css: `
                  input,
                  button {
                    font-size: 16px;
                    padding: 8px;
                  }

                  .search {
                    display: flex;
                    gap: 8px;
                  }

                  .search input {
                    flex: 1;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'The navbar pattern',
              body: `
                Almost every site header is the same flexbox: logo on the left, links on the right.

                \`\`\`html
                <nav class="navbar">
                  <a class="logo" href="#">Sharp &amp; Co.</a>
                  <ul class="links">
                    <li><a href="#">Prices</a></li>
                    <li><a href="#">Book</a></li>
                  </ul>
                </nav>
                \`\`\`

                \`\`\`css
                .navbar {
                  display: flex;
                  justify-content: space-between;   /* logo left, list right */
                  align-items: center;              /* line them up vertically */
                }

                .links {
                  display: flex;                    /* the links in a row */
                  gap: 20px;
                  list-style: none;                 /* no bullets */
                  margin: 0;
                  padding: 0;
                }
                \`\`\`

                Two flex containers, one inside the other. A \`<ul>\` comes with bullets, margin and left padding from the browser, so reset them.
              `,
            },
            {
              type: 'quiz',
              q: 'In the navbar, what pushes the list of links over to the right?',
              options: ['`justify-content: space-between` on `.navbar`', '`text-align: right` on `.navbar`', '`align-items: flex-end` on `.navbar`', '`flex-wrap: wrap` on `.links`'],
              answer: 0,
              explain: 'With two items, `space-between` puts one at each end. `align-items` works on the other axis (up and down).',
            },
            {
              type: 'task',
              title: 'Build the navbar',
              body: `
                1. \`.navbar\`: logo on the **left**, links on the **right**, **centred vertically**.
                2. \`.links\`: the links **in a row** with a **20px** gap and **no bullets**.

                The \`ul\`'s margin and padding are already reset for you.
              `,
              html: `
                <nav class="navbar">
                  <a class="logo" href="#">Sharp &amp; Co.</a>
                  <ul class="links">
                    <li><a href="#">Prices</a></li>
                    <li><a href="#">Book</a></li>
                    <li><a href="#">Find us</a></li>
                  </ul>
                </nav>
              `,
              css: `
                .navbar {
                  background-color: #222;
                  padding: 12px 24px;
                }

                .navbar a {
                  color: white;
                  text-decoration: none;
                }

                .logo {
                  font-size: 24px;
                  font-weight: bold;
                }

                .links {
                  margin: 0;
                  padding: 0;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'Logo on the left, links on the right',
                  test: async (c) => {
                    await at(c);
                    const n = box(c, '.navbar');
                    const pad = c.px('.navbar', 'padding-right');
                    const l = box(c, '.links');
                    return (c.style('.navbar', 'display') === 'flex' && near(box(c, '.logo').left, n.left + pad, 2) && near(l.right, n.right - pad, 2)) || (c.style('.navbar', 'display') !== 'flex' ? 'Make .navbar a flex container.' : 'The links are not at the right edge. Try justify-content: space-between;');
                  },
                },
                {
                  text: 'Logo and links are centred vertically',
                  test: async (c) => {
                    await at(c);
                    const a = box(c, '.logo');
                    const l = box(c, '.links a');
                    return (c.style('.navbar', 'display') === 'flex' && near(a.top + a.height / 2, l.top + l.height / 2, 2)) || 'Use align-items: center; on .navbar.';
                  },
                },
                {
                  text: 'The links sit in a row',
                  test: async (c) => {
                    await at(c);
                    return rowCount(c, '.links li') === 1 || 'They are stacked. Make .links a flex container too.';
                  },
                },
                { text: 'There is a 20px gap between links', test: (c) => c.px('.links', 'column-gap') === 20 || 'The gap is ' + gapOf(c, '.links') + '.' },
                { text: 'No bullets', test: (c) => c.style('.links li', 'list-style-type') === 'none' || (c.style('.links li', 'display') !== 'list-item' && c.style('.links', 'display') === 'flex') || 'Add list-style: none; to .links.' },
              ],
              hint: 'Add `display: flex; justify-content: space-between; align-items: center;` to `.navbar`. Then make `.links` a flex container with `gap` and `list-style: none`.',
              solution: {
                css: `
                  .navbar {
                    background-color: #222;
                    padding: 12px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  }

                  .navbar a {
                    color: white;
                    text-decoration: none;
                  }

                  .logo {
                    font-size: 24px;
                    font-weight: bold;
                  }

                  .links {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    gap: 20px;
                    list-style: none;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`flex-wrap: wrap` lets items drop onto new lines instead of squashing.',
                '`flex: 1` = take the spare space. `flex: 0 0 200px` = exactly 200px.',
                '`align-self` aligns one item, overriding the container\'s `align-items`.',
                'Navbar: `display: flex; justify-content: space-between; align-items: center;` on the nav, and a flex `ul` for the links.',
                'Reset lists used for menus: `list-style: none; margin: 0; padding: 0;`.',
              ],
            },
          ],
        },

        /* ── 11. Grid I ─────────────────────────────────────────────── */
        {
          id: 'css-grid-1',
          title: 'Grid I',
          minutes: 10,
          steps: [
            {
              type: 'brief',
              title: 'Rows and columns',
              body: `
                **CSS Grid** lays things out in rows **and** columns at once. Like flex, it goes on the parent:

                \`\`\`css
                .gallery {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 20px;
                }
                \`\`\`

                - \`grid-template-columns\` lists the columns. Three values = three columns.
                - **fr** means "a fraction of the free space". \`1fr 1fr 1fr\` = three equal columns. \`2fr 1fr\` = the first column twice as wide as the second.
                - You can mix units: \`200px 1fr\` = a fixed 200px column, then the rest.

                Children fill the grid left to right, then start a new row. No wrapping rules needed.
              `,
            },
            {
              type: 'exhibit',
              title: 'A photo gallery',
              body: 'Try `1fr 1fr` (two columns), `2fr 1fr 1fr`, or `100px 1fr 1fr`.',
              html: `
                <div class="gallery">
                  <div>1</div><div>2</div><div>3</div>
                  <div>4</div><div>5</div><div>6</div>
                </div>
              `,
              css: `
                .gallery {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 12px;
                }

                .gallery div {
                  background: linear-gradient(135deg, #f6d365, #fda085);
                  padding: 24px;
                  text-align: center;
                  font-weight: bold;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'A 900px-wide grid has `grid-template-columns: 2fr 1fr;` and no gap. How wide are the columns?',
              options: ['600px and 300px', '450px and 450px', '200px and 100px', '600px and 450px'],
              answer: 0,
              explain: '3 fractions in total, so 1fr = 300px. 2fr = 600px.',
            },
            {
              type: 'task',
              title: 'A three-column menu',
              body: `
                Lay out the six menu items in **three equal columns** with a **20px** gap.
              `,
              html: `
                <div class="menu">
                  <div class="item"><h3>Flat white</h3><p>£3.20</p></div>
                  <div class="item"><h3>Latte</h3><p>£3.40</p></div>
                  <div class="item"><h3>Espresso</h3><p>£2.40</p></div>
                  <div class="item"><h3>Chai</h3><p>£3.30</p></div>
                  <div class="item"><h3>Hot chocolate</h3><p>£3.60</p></div>
                  <div class="item"><h3>Tea</h3><p>£2.20</p></div>
                </div>
              `,
              css: `
                .item {
                  background-color: #fff8e7;
                  padding: 12px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.menu` is a grid', test: (c) => c.style('.menu', 'display') === 'grid' || 'display is ' + c.style('.menu', 'display') + '.' },
                {
                  text: 'There are three columns',
                  test: async (c) => {
                    await at(c);
                    const n = colCount(c, '.item');
                    return n === 3 || 'The items sit in ' + n + ' column' + (n === 1 ? '' : 's') + '.';
                  },
                },
                {
                  text: 'The columns are equal',
                  test: async (c) => {
                    await at(c);
                    const w = c.$$('.item').slice(0, 3).map((e) => box(c, e).width);
                    return (w.length === 3 && near(w[0], w[1]) && near(w[1], w[2])) || 'Use 1fr for each column.';
                  },
                },
                { text: 'The gap is 20px', test: (c) => (c.px('.menu', 'column-gap') === 20 && c.px('.menu', 'row-gap') === 20) || 'The gap is ' + gapOf(c, '.menu') + '.' },
              ],
              hint: '```css\n.menu {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: …;\n}\n```',
              solution: {
                css: `
                  .menu {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 20px;
                  }

                  .item {
                    background-color: #fff8e7;
                    padding: 12px;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Grid or flex?',
              body: `
                - **Flex** is for **one line** of things: a navbar, a row of buttons, a search bar, a card's icon next to its text.
                - **Grid** is for **two dimensions**: a card grid, a gallery, a page with header, sidebar and content.

                Real pages use both, nested: a grid for the page, flex inside each part.

                Grid has rows too. They're created automatically as items fill up, but you can size them:

                \`\`\`css
                .page {
                  display: grid;
                  grid-template-columns: 200px 1fr;   /* sidebar + content */
                  grid-template-rows: auto 1fr auto;  /* header, middle, footer */
                  gap: 24px;                          /* or row-gap and column-gap separately */
                }
                \`\`\`
              `,
            },
            {
              type: 'quiz',
              q: 'Which job is a better fit for **grid** than flex?',
              options: ['A product page with 12 cards in neat rows and columns', 'A row of three social media icons', 'A search box next to its button', 'Centring one line of text in a button'],
              answer: 0,
              explain: 'Rows and columns at the same time is what grid is for. The others are a single line of items.',
            },
            {
              type: 'fill',
              q: 'A fixed 250px sidebar, and the content takes the rest.',
              code: `
                .layout {
                  display: grid;
                  grid-template-columns: [[250px]] [[1fr]];
                }
              `,
              options: ['250px', '1fr', '100%', 'auto', 'flex'],
              explain: '`1fr` takes whatever is left after the fixed column. `100%` would be the full width and overflow.',
            },
            {
              type: 'task',
              title: 'Sidebar layout',
              body: `
                Make \`.layout\` a grid: a **200px** sidebar column, then a column that takes **the rest**, with a **24px** gap.
              `,
              html: `
                <div class="layout">
                  <aside>
                    <h3>Shop</h3>
                    <p>Candles<br>Diffusers<br>Gift sets</p>
                  </aside>
                  <main>
                    <h2>Candles</h2>
                    <p>Hand-poured soy candles in twelve scents.</p>
                  </main>
                </div>
              `,
              css: `
                aside {
                  background-color: #f3e5d0;
                  padding: 16px;
                }

                main {
                  background-color: #eef3f8;
                  padding: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.layout` is a grid', test: (c) => c.style('.layout', 'display') === 'grid' },
                {
                  text: 'The sidebar is 200px wide',
                  test: async (c) => {
                    await at(c);
                    const w = Math.round(box(c, 'aside').width);
                    return w === 200 || 'The sidebar is ' + w + 'px wide.';
                  },
                },
                {
                  text: 'The content sits beside it and fills the rest',
                  test: async (c) => {
                    await at(c);
                    const l = box(c, '.layout');
                    const m = box(c, 'main');
                    return (near(m.top, box(c, 'aside').top) && near(m.right, l.right) && m.width > 400) || 'The main column should start level with the sidebar and reach the right edge. Use 1fr.';
                  },
                },
                { text: 'The gap is 24px', test: (c) => c.px('.layout', 'column-gap') === 24 || 'The gap is ' + gapOf(c, '.layout') + '.' },
              ],
              hint: '```css\n.layout {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n  gap: 24px;\n}\n```',
              solution: {
                css: `
                  .layout {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    gap: 24px;
                  }

                  aside {
                    background-color: #f3e5d0;
                    padding: 16px;
                  }

                  main {
                    background-color: #eef3f8;
                    padding: 16px;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`display: grid` on the parent; `grid-template-columns` lists the columns.',
                '`fr` = a share of the free space. `1fr 1fr 1fr` = three equal columns; `200px 1fr` = fixed sidebar plus the rest.',
                'Rows are created automatically; size them with `grid-template-rows` if you need to.',
                '`gap` spaces rows and columns (or use `row-gap` / `column-gap`).',
                'Flex for one line of things; grid for rows and columns. Nest them freely.',
              ],
            },
          ],
        },

        /* ── 12. Grid II ────────────────────────────────────────────── */
        {
          id: 'css-grid-2',
          title: 'Grid II',
          minutes: 13,
          steps: [
            {
              type: 'brief',
              title: 'repeat() and minmax()',
              body: `
                Two helpers save typing:

                \`\`\`css
                grid-template-columns: repeat(4, 1fr);           /* = 1fr 1fr 1fr 1fr */
                grid-template-columns: minmax(200px, 1fr) 2fr;   /* never under 200px */
                \`\`\`

                - \`repeat(count, size)\` repeats a column size.
                - \`minmax(min, max)\` lets a column flex between two sizes.
              `,
            },
            {
              type: 'fill',
              q: 'Four equal columns, the short way.',
              code: `grid-template-columns: [[repeat]](4, [[1fr]]);`,
              options: ['repeat', 'times', '1fr', '4fr', 'auto'],
            },
            {
              type: 'brief',
              title: 'The one-line responsive grid',
              body: `
                Combine them with \`auto-fit\` and you get a card grid that adapts to any screen with **no media queries**:

                \`\`\`css
                .products {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 16px;
                }
                \`\`\`

                Read it as: "fit as many columns as you can, each at least 200px; then stretch them to share any leftover space."

                On a phone that's one column; on a tablet two or three; on a laptop four or five. Worth memorising: you'll use it on almost every site.
              `,
            },
            {
              type: 'exhibit',
              title: 'Product cards',
              body: 'Change `200px` to `300px` or `120px` and watch the number of columns change. On a real site the same happens as the window gets wider or narrower.',
              html: `
                <div class="products">
                  <div class="product">Sourdough</div>
                  <div class="product">Rye</div>
                  <div class="product">Focaccia</div>
                  <div class="product">Baguette</div>
                  <div class="product">Brioche</div>
                  <div class="product">Bagels</div>
                </div>
              `,
              css: `
                .products {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 16px;
                }

                .product {
                  background-color: #fff8e7;
                  border: 1px solid #e0c9a6;
                  padding: 24px 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'A container is **500px** wide with `repeat(auto-fit, minmax(200px, 1fr))` and no gap. How many columns?',
              options: ['2', '3', '1', '5'],
              answer: 0,
              explain: 'Two 200px columns fit (400px); three would need 600px. The two then stretch to 250px each.',
            },
            {
              type: 'task',
              title: 'A responsive product grid',
              body: `
                Make \`.products\` a grid that fits as many columns as it can, **each at least 200px**, sharing leftover space. Gap: **16px**.

                The checks test it at three widths: a phone (400px), a tablet (600px) and a laptop (900px).
              `,
              html: `
                <div class="products">
                  <div class="product"><h3>Sourdough</h3><p>£4.80</p></div>
                  <div class="product"><h3>Rye</h3><p>£4.20</p></div>
                  <div class="product"><h3>Focaccia</h3><p>£3.90</p></div>
                  <div class="product"><h3>Baguette</h3><p>£2.50</p></div>
                  <div class="product"><h3>Brioche</h3><p>£3.60</p></div>
                  <div class="product"><h3>Bagels</h3><p>£3.00</p></div>
                </div>
              `,
              css: `
                .product {
                  background-color: white;
                  border: 1px solid #ddd;
                  padding: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.products` is a grid with a 16px gap', test: (c) => (c.style('.products', 'display') === 'grid' && c.px('.products', 'column-gap') === 16) },
                {
                  text: 'One column on a 400px phone',
                  test: async (c) => {
                    await c.viewport(400);
                    const n = colCount(c, '.product');
                    return n === 1 || 'At 400px there are ' + n + ' columns. Each should be at least 200px, so only one fits.';
                  },
                },
                {
                  text: 'Two columns on a 600px tablet',
                  test: async (c) => {
                    await c.viewport(600);
                    const n = colCount(c, '.product');
                    return n === 2 || 'At 600px there are ' + n + ' columns.';
                  },
                },
                {
                  text: 'Four columns on a 900px laptop',
                  test: async (c) => {
                    await c.viewport(900);
                    const n = colCount(c, '.product');
                    return n === 4 || 'At 900px there are ' + n + ' columns.';
                  },
                },
              ],
              hint: '```css\n.products {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 16px;\n}\n```',
              solution: {
                css: `
                  .products {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                  }

                  .product {
                    background-color: white;
                    border: 1px solid #ddd;
                    padding: 16px;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Spanning columns',
              body: `
                An item can take up more than one cell:

                \`\`\`css
                .featured { grid-column: span 2; }   /* two columns wide */
                .banner   { grid-column: 1 / -1; }   /* from the first line to the last: full width */
                \`\`\`

                Grid lines are numbered from 1 on the left; \`-1\` is always the last line on the right. So \`1 / -1\` stretches across every column, however many there are.

                \`grid-row: span 2\` does the same vertically.
              `,
            },
            {
              type: 'task',
              title: 'Feature a product',
              body: `
                The grid has three columns already.

                1. \`.featured\`: **two columns** wide.
                2. \`.banner\`: the **full width** of the grid, whatever the number of columns.
              `,
              html: `
                <div class="products">
                  <div class="product featured"><h3>Bread of the week: Seeded rye</h3><p>£4.50</p></div>
                  <div class="product"><h3>Sourdough</h3><p>£4.80</p></div>
                  <div class="product"><h3>Focaccia</h3><p>£3.90</p></div>
                  <div class="product"><h3>Baguette</h3><p>£2.50</p></div>
                  <div class="product"><h3>Brioche</h3><p>£3.60</p></div>
                  <div class="banner">Free delivery on orders over £30</div>
                </div>
              `,
              css: `
                .products {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 16px;
                }

                .product {
                  background-color: white;
                  border: 1px solid #ddd;
                  padding: 16px;
                }

                .banner {
                  background-color: #1f3a5f;
                  color: white;
                  padding: 16px;
                  text-align: center;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The featured product spans two columns',
                  test: async (c) => {
                    await at(c);
                    const one = box(c, '.product:not(.featured)').width;
                    const f = box(c, '.featured').width;
                    return near(f, one * 2 + 16, 2) || 'The featured card is ' + Math.round(f) + 'px wide; one column is ' + Math.round(one) + 'px.';
                  },
                },
                {
                  text: 'Another product sits next to it on the first row',
                  test: async (c) => {
                    await at(c);
                    return near(box(c, '.featured').top, box(c, '.product:not(.featured)').top);
                  },
                },
                {
                  text: 'The banner is full width',
                  test: async (c) => {
                    await at(c);
                    return near(box(c, '.banner').width, box(c, '.products').width) || 'The banner is ' + Math.round(box(c, '.banner').width) + 'px; the grid is ' + Math.round(box(c, '.products').width) + 'px.';
                  },
                },
                {
                  text: 'It stays full width with four columns',
                  test: async (c) => {
                    await at(c);
                    c.$('.products').style.gridTemplateColumns = 'repeat(4, 1fr)';
                    const ok = near(box(c, '.banner').width, box(c, '.products').width);
                    c.$('.products').style.gridTemplateColumns = '';
                    return ok || 'Use grid-column: 1 / -1 so it works for any number of columns.';
                  },
                },
              ],
              hint: '```css\n.featured {\n  grid-column: span 2;\n}\n\n.banner {\n  …\n  grid-column: 1 / -1;\n}\n```',
              solution: {
                css: `
                  .products {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                  }

                  .product {
                    background-color: white;
                    border: 1px solid #ddd;
                    padding: 16px;
                  }

                  .featured {
                    grid-column: span 2;
                  }

                  .banner {
                    background-color: #1f3a5f;
                    color: white;
                    padding: 16px;
                    text-align: center;
                    grid-column: 1 / -1;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Named areas',
              body: `
                For a whole-page layout, you can **draw** it with names:

                \`\`\`css
                .page {
                  display: grid;
                  grid-template-columns: 200px 1fr;
                  grid-template-areas:
                    "header  header"
                    "sidebar main"
                    "footer  footer";
                }

                header { grid-area: header; }
                nav    { grid-area: sidebar; }
                main   { grid-area: main; }
                footer { grid-area: footer; }
                \`\`\`

                Each quoted string is a row; each word is a cell. Repeat a name to make an area span cells. A \`.\` means an empty cell. Then \`grid-area\` puts each element in its named area.
              `,
            },
            {
              type: 'exhibit',
              title: 'A page drawn with areas',
              body: 'Swap `"sidebar main"` for `"main sidebar"` to move the sidebar to the right. No HTML changes.',
              html: `
                <div class="page">
                  <header>Header</header>
                  <nav>Sidebar</nav>
                  <main>Main content</main>
                  <footer>Footer</footer>
                </div>
              `,
              css: `
                .page {
                  display: grid;
                  grid-template-columns: 160px 1fr;
                  grid-template-areas:
                    "header  header"
                    "sidebar main"
                    "footer  footer";
                  gap: 8px;
                }

                header { grid-area: header; }
                nav    { grid-area: sidebar; }
                main   { grid-area: main; }
                footer { grid-area: footer; }

                .page > * {
                  background-color: #eef3f8;
                  padding: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'task',
              title: 'Lay out the page with areas',
              body: `
                1. \`.page\`: a grid with columns **200px 1fr** and these areas:

                \`\`\`
                "header  header"
                "sidebar main"
                "footer  footer"
                \`\`\`

                2. Place \`header\`, \`nav\`, \`main\` and \`footer\` in the areas \`header\`, \`sidebar\`, \`main\` and \`footer\`.
              `,
              html: `
                <div class="page">
                  <header>Hearth &amp; Crumb</header>
                  <nav>Bread<br>Cakes<br>Coffee</nav>
                  <main>This week's bakes</main>
                  <footer>Open Tuesday to Saturday</footer>
                </div>
              `,
              css: `
                .page {
                  gap: 8px;
                }

                .page > * {
                  background-color: #fff8e7;
                  padding: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.page` uses `grid-template-areas`', test: (c) => (c.style('.page', 'display') === 'grid' && c.style('.page', 'grid-template-areas') !== 'none') || 'Give .page display: grid and grid-template-areas.' },
                {
                  text: 'The header spans the full width',
                  test: async (c) => {
                    await at(c);
                    return near(box(c, 'header').width, box(c, '.page').width) || 'The header is ' + Math.round(box(c, 'header').width) + 'px wide.';
                  },
                },
                {
                  text: 'The 200px sidebar is beside the main content',
                  test: async (c) => {
                    await at(c);
                    const n = box(c, 'nav');
                    const m = box(c, 'main');
                    return (near(n.width, 200) && near(n.top, m.top) && n.right < m.left) || 'The sidebar is ' + Math.round(n.width) + 'px wide' + (near(n.top, m.top) ? '.' : ' and not level with main.');
                  },
                },
                {
                  text: 'The footer spans the full width at the bottom',
                  test: async (c) => {
                    await at(c);
                    const f = box(c, 'footer');
                    return near(f.width, box(c, '.page').width) && f.top > box(c, 'main').bottom;
                  },
                },
              ],
              hint: '```css\n.page {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n  gap: 8px;\n}\n\nheader { grid-area: header; }\n```\n\nThen the same for `nav`, `main` and `footer`.',
              solution: {
                css: `
                  .page {
                    gap: 8px;
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    grid-template-areas:
                      "header  header"
                      "sidebar main"
                      "footer  footer";
                  }

                  header { grid-area: header; }
                  nav    { grid-area: sidebar; }
                  main   { grid-area: main; }
                  footer { grid-area: footer; }

                  .page > * {
                    background-color: #fff8e7;
                    padding: 16px;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`repeat(3, 1fr)` = `1fr 1fr 1fr`. `minmax(200px, 1fr)` = at least 200px, up to a share of the space.',
                'Responsive cards in one line: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`.',
                '`grid-column: span 2` makes an item two columns wide; `grid-column: 1 / -1` makes it full width.',
                '`grid-template-areas` draws the layout with names; `grid-area: name` places each element.',
              ],
            },
          ],
        },

        /* ── 13. Positioning ────────────────────────────────────────── */
        {
          id: 'css-position',
          title: 'Positioning',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'static and relative',
              body: `
                Normally elements sit where the page flow puts them. That's \`position: static\`, the default.

                \`position: relative\` lets you **nudge** an element from where it would normally be, using \`top\`, \`right\`, \`bottom\` and \`left\`:

                \`\`\`css
                .stamp {
                  position: relative;
                  top: 10px;    /* 10px down from its normal place */
                  left: 20px;   /* 20px to the right */
                }
                \`\`\`

                Its original space is kept, so nothing else moves. On its own, nudging is rarely needed. The real use of \`relative\` is as an **anchor** for the next one.
              `,
            },
            {
              type: 'exhibit',
              title: 'A nudge',
              body: 'Change `top` to `-10px`, or `left` to `60px`. The other lines stay put.',
              html: `
                <p>First line</p>
                <p class="stamp">Nudged line</p>
                <p>Third line</p>
              `,
              css: `
                .stamp {
                  position: relative;
                  top: 10px;
                  left: 20px;
                  background-color: #ffd166;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: '`position: relative; top: 10px;` moves the element…',
              options: ['10px down', '10px up', 'To 10px from the top of the page', 'Nowhere: top only works with absolute'],
              answer: 0,
              explain: '`top: 10px` pushes it 10px away from its top edge, so down. It moves relative to its own normal spot, not the page.',
            },
            {
              type: 'brief',
              title: 'absolute inside relative',
              body: `
                \`position: absolute\` takes an element **out of the flow** (others act as if it isn't there) and places it relative to its nearest **positioned** ancestor: one with \`position\` other than static.

                The pattern, used everywhere for badges, close buttons and labels on images:

                \`\`\`css
                .product {
                  position: relative;      /* the anchor */
                }

                .badge {
                  position: absolute;      /* pinned inside .product */
                  top: 8px;
                  right: 8px;
                }
                \`\`\`

                Forget the \`relative\` on the parent and the badge pins itself to the corner of the whole page instead.
              `,
            },
            {
              type: 'task',
              title: 'A SALE badge',
              body: `
                Pin the \`.badge\` to the **top-right corner** of the product card, **8px** from the top and **8px** from the right.

                1. Make \`.product\` the anchor.
                2. Position \`.badge\` absolutely, with \`top\` and \`right\`.
              `,
              html: `
                <div class="product">
                  <span class="badge">SALE</span>
                  <div class="photo"></div>
                  <h3>Lavender candle</h3>
                  <p><s>£14</s> £10</p>
                </div>
              `,
              css: `
                .product {
                  width: 260px;
                  padding: 16px;
                  background-color: #fff8e7;
                }

                .photo {
                  height: 160px;
                  background: linear-gradient(135deg, #c8b6e2, #8e7cc3);
                }

                .badge {
                  background-color: crimson;
                  color: white;
                  padding: 4px 8px;
                  font-weight: bold;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.product` is `position: relative`', test: (c) => c.style('.product', 'position') === 'relative' || 'position on .product is ' + c.style('.product', 'position') + '.' },
                { text: '`.badge` is `position: absolute`', test: (c) => c.style('.badge', 'position') === 'absolute' || 'position on .badge is ' + c.style('.badge', 'position') + '.' },
                {
                  text: 'The badge is 8px from the top and right of the card',
                  test: async (c) => {
                    await at(c);
                    const p = box(c, '.product');
                    const b = box(c, '.badge');
                    const top = Math.round(b.top - p.top);
                    const right = Math.round(p.right - b.right);
                    if (right < -20) return 'The badge is pinned to the page, not the card. Give .product position: relative.';
                    return (near(top, 8) && near(right, 8)) || 'The badge is ' + top + 'px from the top and ' + right + 'px from the right.';
                  },
                },
              ],
              hint: '```css\n.product {\n  …\n  position: relative;\n}\n\n.badge {\n  …\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}\n```',
              solution: {
                css: `
                  .product {
                    width: 260px;
                    padding: 16px;
                    background-color: #fff8e7;
                    position: relative;
                  }

                  .photo {
                    height: 160px;
                    background: linear-gradient(135deg, #c8b6e2, #8e7cc3);
                  }

                  .badge {
                    background-color: crimson;
                    color: white;
                    padding: 4px 8px;
                    font-weight: bold;
                    position: absolute;
                    top: 8px;
                    right: 8px;
                  }
                `,
              },
            },
            {
              type: 'fill',
              q: 'Pin the close button to the top-right corner of the popup.',
              code: `
                .popup { position: [[relative]]; }
                .close { position: [[absolute]]; top: 0; right: 0; }
              `,
              options: ['relative', 'absolute', 'fixed', 'static', 'sticky'],
            },
            {
              type: 'brief',
              title: 'fixed, sticky and z-index',
              body: `
                - **fixed**: pinned to the **window**. It stays put while the page scrolls. Chat buttons, "Book now" buttons, cookie bars.
                - **sticky**: scrolls normally until it reaches an edge, then **sticks** there. Perfect for headers: \`position: sticky; top: 0;\`
                - **z-index**: when positioned elements overlap, the higher \`z-index\` is drawn on top. \`z-index: 10\` beats \`z-index: 1\`. It only works on positioned elements (anything except static).

                \`\`\`css
                .site-header { position: sticky; top: 0; z-index: 10; }
                .chat        { position: fixed; bottom: 16px; right: 16px; }
                \`\`\`
              `,
            },
            {
              type: 'exhibit',
              title: 'Scroll this',
              body: 'Scroll inside the preview: the header sticks, the button never moves. Remove `z-index` from the header and scroll again: the text slides over it.',
              html: `
                <header class="site-header">Ace Plumbing · 0116 000 0000</header>
                <p class="note">Boilers serviced from £70.</p>
                <p>Scroll down.</p>
                <p>Keep going.</p>
                <p>The header is still at the top.</p>
                <p>And the button is still in the corner.</p>
                <p>Fixed means fixed to the window.</p>
                <p>Sticky means "scroll, then stick".</p>
                <p>End of page.</p>
                <a class="chat" href="#">Book now</a>
              `,
              css: `
                p {
                  padding: 20px 0;
                }

                .note {
                  position: relative;
                }

                .site-header {
                  position: sticky;
                  top: 0;
                  z-index: 10;
                  background-color: #1f3a5f;
                  color: white;
                  padding: 12px;
                }

                .chat {
                  position: fixed;
                  bottom: 16px;
                  right: 16px;
                  background-color: #e76f51;
                  color: white;
                  padding: 10px 16px;
                  border-radius: 999px;
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
              height: 260,
            },
            {
              type: 'quiz',
              q: 'A "Call us" button should stay in the bottom-right corner of the screen **all the time**, even while scrolling. Which position?',
              options: ['`fixed`', '`sticky`', '`absolute`', '`relative`'],
              answer: 0,
              explain: '`fixed` pins it to the window. `sticky` only sticks once you scroll past it, and `absolute` scrolls away with the page.',
            },
            {
              type: 'task',
              title: 'Sticky header and a booking button',
              body: `
                1. \`.site-header\`: **sticky** at the **top** (\`top: 0\`), with a **z-index of 10** so content scrolls under it.
                2. \`.chat\`: **fixed**, **16px** from the bottom and **16px** from the right.
              `,
              html: `
                <header class="site-header">Ace Plumbing · 0116 000 0000</header>
                <main>
                  <p>Boilers serviced and repaired. Gas Safe registered engineers.</p>
                  <p>Leaks fixed fast, usually the same day.</p>
                  <p>New bathrooms, fitted and tiled.</p>
                  <p>Fixed prices, agreed before we start.</p>
                  <p>No call-out fee within Leicester.</p>
                  <p>Rated 4.9 by over 300 customers.</p>
                </main>
                <a class="chat" href="#">Book now</a>
              `,
              css: `
                main p {
                  padding: 24px 0;
                }

                .site-header {
                  background-color: #1f3a5f;
                  color: white;
                  padding: 12px 16px;
                }

                .chat {
                  background-color: #e76f51;
                  color: white;
                  padding: 12px 20px;
                  border-radius: 999px;
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The header is sticky at the top',
                  test: (c) => (c.style('.site-header', 'position') === 'sticky' && c.px('.site-header', 'top') === 0 && c.style('.site-header', 'top') !== 'auto') || (c.style('.site-header', 'position') !== 'sticky' ? 'position is ' + c.style('.site-header', 'position') + '.' : 'Add top: 0; or it has nowhere to stick.'),
                },
                { text: 'The header has a z-index of 10', test: (c) => parseInt(c.style('.site-header', 'z-index'), 10) === 10 || 'z-index is ' + c.style('.site-header', 'z-index') + '.' },
                { text: 'The button is fixed', test: (c) => c.style('.chat', 'position') === 'fixed' || 'position is ' + c.style('.chat', 'position') + '.' },
                {
                  text: 'It is 16px from the bottom and right',
                  test: (c) => (c.style('.chat', 'position') === 'fixed' && c.px('.chat', 'bottom') === 16 && c.px('.chat', 'right') === 16) || 'Set bottom: 16px; and right: 16px; on .chat.',
                },
              ],
              hint: '```css\n.site-header {\n  …\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}\n```\n\nThen `position: fixed` plus `bottom` and `right` on `.chat`.',
              solution: {
                css: `
                  main p {
                    padding: 24px 0;
                  }

                  .site-header {
                    background-color: #1f3a5f;
                    color: white;
                    padding: 12px 16px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                  }

                  .chat {
                    background-color: #e76f51;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 999px;
                    text-decoration: none;
                    position: fixed;
                    bottom: 16px;
                    right: 16px;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`static` is the default. `relative` nudges an element from its normal spot and keeps its space.',
                '`absolute` leaves the flow and positions itself inside the nearest positioned ancestor.',
                'Badge pattern: parent `position: relative`; child `position: absolute; top: 8px; right: 8px;`.',
                '`fixed` = pinned to the window. `sticky; top: 0` = scrolls, then sticks.',
                '`z-index`: higher is on top. Only works on positioned elements.',
              ],
            },
          ],
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════
       MODULE 4 — Polish
       ═══════════════════════════════════════════════════════════════════ */
    {
      title: 'Polish',
      missions: [
        /* ── 14. Responsive design ──────────────────────────────────── */
        {
          id: 'css-responsive',
          title: 'Responsive design',
          minutes: 13,
          steps: [
            {
              type: 'brief',
              title: 'The viewport tag',
              body: `
                Most visits to a small business site come from a phone. A **responsive** site rearranges itself to suit the screen.

                Step one is a line of HTML in every page's \`<head>\`:

                \`\`\`html
                <meta name="viewport" content="width=device-width, initial-scale=1">
                \`\`\`

                Without it, phones pretend to be a 980px-wide desktop and shrink the whole page down to unreadable. With it, the page is laid out at the phone's real width.

                (The preview here adds it for you.)
              `,
            },
            {
              type: 'fill',
              q: 'Complete the viewport tag.',
              code: `<meta name="[[viewport]]" content="width=[[device-width]], initial-scale=1">`,
              lang: 'html',
              options: ['viewport', 'device-width', 'mobile', 'screen', '100%'],
            },
            {
              type: 'brief',
              title: 'Media queries, mobile first',
              body: `
                A **media query** wraps rules that only apply when a condition is true, usually the screen width:

                \`\`\`css
                /* Phones (and everything else) */
                .services {
                  display: grid;
                  grid-template-columns: 1fr;
                }

                /* Screens 700px and wider */
                @media (min-width: 700px) {
                  .services {
                    grid-template-columns: repeat(2, 1fr);
                  }
                }
                \`\`\`

                This is **mobile first**: write the simple phone layout as normal CSS, then add \`min-width\` queries that upgrade it for bigger screens. Phones get the least CSS to deal with, and the base styles are the simple ones.

                Inside the query you only write what **changes**. Everything else carries on from the base rule.
              `,
            },
            {
              type: 'exhibit',
              title: 'One column, then two',
              body: 'If your preview is wider than 500px you see two columns. Change `500px` to `2000px` to see what a phone gets.',
              html: `
                <div class="services">
                  <div class="service">Boiler service</div>
                  <div class="service">Leak repair</div>
                  <div class="service">Bathrooms</div>
                  <div class="service">Radiators</div>
                </div>
              `,
              css: `
                .services {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 12px;
                }

                @media (min-width: 500px) {
                  .services {
                    grid-template-columns: repeat(2, 1fr);
                  }
                }

                .service {
                  background-color: #eef3f8;
                  padding: 16px;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: '```css\n.cards { display: block; }\n\n@media (min-width: 800px) {\n  .cards { display: grid; }\n}\n```\n\nWhat does a **375px** phone get?',
              options: ['`display: block`', '`display: grid`', 'Both at once', 'Nothing: the page breaks'],
              answer: 0,
              explain: '375px is less than 800px, so the media query doesn\'t apply and the base rule wins.',
            },
            {
              type: 'task',
              title: 'Two columns on bigger screens',
              body: `
                Mobile first:

                1. \`.services\`: a grid with **one** column and a **16px** gap.
                2. Add \`@media (min-width: 700px)\` that switches it to **two equal columns**.

                The checks test it at 400px and 900px wide.
              `,
              html: `
                <div class="services">
                  <div class="service"><h3>Boiler service</h3><p>From £70</p></div>
                  <div class="service"><h3>Leak repair</h3><p>From £60</p></div>
                  <div class="service"><h3>Bathrooms</h3><p>Free quote</p></div>
                  <div class="service"><h3>Radiators</h3><p>From £90</p></div>
                </div>
              `,
              css: `
                .service {
                  background-color: #eef3f8;
                  padding: 16px;
                }

                /* Mobile first: one column */
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: '`.services` is a grid with a 16px gap', test: (c) => (c.style('.services', 'display') === 'grid' && c.px('.services', 'row-gap') === 16) },
                {
                  text: 'One column at 400px',
                  test: async (c) => {
                    await c.viewport(400);
                    const n = colCount(c, '.service');
                    return n === 1 || 'At 400px there are ' + n + ' columns.';
                  },
                },
                {
                  text: 'Two columns at 900px',
                  test: async (c) => {
                    await c.viewport(900);
                    const n = colCount(c, '.service');
                    return n === 2 || 'At 900px there ' + (n === 1 ? 'is 1 column' : 'are ' + n + ' columns') + '.';
                  },
                },
                { text: 'You used a `min-width` media query', test: (c) => c.media().some((r) => /min-width/.test(r.media)) || 'Use @media (min-width: 700px) { … } (mobile first).' },
              ],
              hint: '```css\n.services {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 16px;\n}\n\n@media (min-width: 700px) {\n  .services {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n```',
              solution: {
                css: `
                  .service {
                    background-color: #eef3f8;
                    padding: 16px;
                  }

                  /* Mobile first: one column */
                  .services {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                  }

                  @media (min-width: 700px) {
                    .services {
                      grid-template-columns: repeat(2, 1fr);
                    }
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Images that fit',
              body: `
                A photo 1200px wide will burst out of a 400px phone screen. One rule fixes every image on the site:

                \`\`\`css
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                }
                \`\`\`

                - \`max-width: 100%\`: never wider than its container (small images stay small).
                - \`height: auto\`: keep the proportions as the width shrinks.
                - \`display: block\`: removes a small gap under images that comes from them being inline.

                Put it near the top of every stylesheet, next to \`box-sizing\`.
              `,
            },
            {
              type: 'quiz',
              q: 'Your `<img>` has `width="1200" height="400"` in the HTML. You add only `max-width: 100%`. On a phone, what goes wrong?',
              options: ['It fits the width but stays 400px tall, so it looks squashed', 'Nothing: it is perfect', 'It still bursts out of the screen', 'It disappears'],
              answer: 0,
              explain: 'The width shrinks but the height attribute keeps it at 400px. `height: auto` keeps the proportions.',
            },
            {
              type: 'task',
              title: 'Stop the image bursting out',
              body: `
                Write one \`img\` rule so the picture is **never wider than the article** and **keeps its shape** (3 times wider than tall).
              `,
              html: `
                <article class="post">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400'%3E%3Crect width='1200' height='400' fill='%23d9a066'/%3E%3Ccircle cx='600' cy='200' r='120' fill='%23f3e5d0'/%3E%3C/svg%3E" width="1200" height="400" alt="A round loaf on a wooden board">
                  <h2>Why we bake overnight</h2>
                  <p>A long, cool rise gives sourdough its flavour and its crackly crust.</p>
                </article>
              `,
              css: `
                .post {
                  max-width: 700px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The image fits a 400px phone',
                  test: async (c) => {
                    await c.viewport(400);
                    const i = box(c, 'img');
                    const p = box(c, '.post');
                    return i.width <= p.width + 0.5 || 'The image is ' + Math.round(i.width) + 'px wide in a ' + Math.round(p.width) + 'px article.';
                  },
                },
                {
                  text: 'It keeps its shape on the phone',
                  test: async (c) => {
                    await c.viewport(400);
                    const i = box(c, 'img');
                    return near(i.height, i.width / 3, 2) || 'It is ' + Math.round(i.width) + ' × ' + Math.round(i.height) + 'px: squashed. Add height: auto;';
                  },
                },
                {
                  text: 'It fits the article on a laptop too',
                  test: async (c) => {
                    await c.viewport(900);
                    const i = box(c, 'img');
                    return (near(i.width, box(c, '.post').width) && near(i.height, i.width / 3, 2)) || 'At 900px it is ' + Math.round(i.width) + ' × ' + Math.round(i.height) + 'px in a ' + Math.round(box(c, '.post').width) + 'px article.';
                  },
                },
              ],
              hint: '```css\nimg {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}\n```',
              solution: {
                css: `
                  .post {
                    max-width: 700px;
                  }

                  img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Choosing breakpoints',
              body: `
                The widths in your media queries are **breakpoints**. Common ones are around 600px (large phones), 900px (tablets) and 1200px (laptops), but the honest rule is: **add a breakpoint where your design starts to look wrong**, not for a particular device.

                Typical things that change at a breakpoint:

                - a stacked header becomes a row (logo left, links right)
                - one column of cards becomes two or three
                - headings get bigger
                - a hamburger menu becomes a full menu
              `,
            },
            {
              type: 'task',
              title: 'A responsive header',
              body: `
                On phones the header is a column (logo, then links). That's done already.

                Add \`@media (min-width: 700px)\` that:

                1. switches \`.site-header\` to a **row**, with the logo on the left and the links on the **right**, **centred vertically**;
                2. makes \`.logo\` **40px** (it is 28px on phones).
              `,
              html: `
                <header class="site-header">
                  <h1 class="logo">Sharp &amp; Co.</h1>
                  <nav class="links">
                    <a href="#">Prices</a>
                    <a href="#">Book</a>
                    <a href="#">Find us</a>
                  </nav>
                </header>
              `,
              css: `
                .site-header {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                  background-color: #222;
                  padding: 16px;
                }

                .logo {
                  color: white;
                  margin: 0;
                  font-size: 28px;
                }

                .links {
                  display: flex;
                  gap: 16px;
                }

                .links a {
                  color: white;
                }

                /* Screens 700px and wider */
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'There is a `min-width` media query', test: (c) => c.media().some((r) => /min-width/.test(r.media)) || 'Add @media (min-width: 700px) { … }' },
                {
                  text: 'At 400px: links under the logo, logo 28px',
                  test: async (c) => {
                    await c.viewport(400);
                    return (box(c, '.links').top >= box(c, '.logo').bottom - 1 && c.px('.logo', 'font-size') === 28) || 'The phone layout has changed. Put your changes inside the media query.';
                  },
                },
                {
                  text: 'At 900px: logo left, links right, in one row',
                  test: async (c) => {
                    await c.viewport(900);
                    const h = box(c, '.site-header');
                    const l = box(c, '.links');
                    const g = box(c, '.logo');
                    return (l.top < g.bottom && near(l.right, h.right - 16, 2)) || (l.top >= g.bottom - 1 ? 'Still stacked at 900px. Set flex-direction: row inside the query.' : 'The links are not at the right edge. Try justify-content: space-between;');
                  },
                },
                {
                  text: 'At 900px: centred vertically',
                  test: async (c) => {
                    await c.viewport(900);
                    const l = box(c, '.links');
                    const g = box(c, '.logo');
                    return near(l.top + l.height / 2, g.top + g.height / 2, 2) || 'Add align-items: center;';
                  },
                },
                { text: 'At 900px: the logo is 40px', test: async (c) => { await c.viewport(900); return c.px('.logo', 'font-size') === 40 || 'The logo is ' + c.style('.logo', 'font-size') + ' at 900px.'; } },
              ],
              hint: '```css\n@media (min-width: 700px) {\n  .site-header {\n    flex-direction: row;\n    justify-content: space-between;\n    align-items: center;\n  }\n\n  .logo {\n    font-size: 40px;\n  }\n}\n```',
              solution: {
                css: `
                  .site-header {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background-color: #222;
                    padding: 16px;
                  }

                  .logo {
                    color: white;
                    margin: 0;
                    font-size: 28px;
                  }

                  .links {
                    display: flex;
                    gap: 16px;
                  }

                  .links a {
                    color: white;
                  }

                  /* Screens 700px and wider */
                  @media (min-width: 700px) {
                    .site-header {
                      flex-direction: row;
                      justify-content: space-between;
                      align-items: center;
                    }

                    .logo {
                      font-size: 40px;
                    }
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Every page needs `<meta name="viewport" content="width=device-width, initial-scale=1">` in the head.',
                '`@media (min-width: 700px) { … }` applies only on screens at least 700px wide.',
                'Mobile first: phone styles as the base, `min-width` queries to upgrade. Only write what changes.',
                '`img { max-width: 100%; height: auto; display: block; }` keeps images inside their container.',
                'Put breakpoints where the design breaks, not at specific devices.',
              ],
            },
          ],
        },

        /* ── 15. Pseudo-classes and pseudo-elements ─────────────────── */
        {
          id: 'css-states',
          title: 'States and pseudo-elements',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'Pseudo-classes: hover, focus, active',
              body: `
                A **pseudo-class** styles an element in a particular **state**. It's written with a colon after the selector:

                \`\`\`css
                .btn:hover  { background-color: #8a4a14; }   /* mouse over it */
                .btn:focus  { outline: 3px solid #1f3a5f; }  /* selected with the keyboard (Tab) or clicked into */
                .btn:active { background-color: #6b3a10; }   /* while being pressed */
                \`\`\`

                Only write what changes; everything else carries over from \`.btn\`.

                >! Many people move round a site with the Tab key. Never remove the focus outline (\`outline: none\`) without putting a clear focus style in its place, or they can't see where they are.
              `,
            },
            {
              type: 'exhibit',
              title: 'Try the button',
              body: 'Hover over it, press it, and click into the preview and press Tab to focus it.',
              html: `<a class="btn" href="#">Book a table</a>`,
              css: `
                .btn {
                  display: inline-block;
                  background-color: #b5651d;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 6px;
                  text-decoration: none;
                }

                .btn:hover {
                  background-color: #8a4a14;
                }

                .btn:focus {
                  outline: 3px solid #1f3a5f;
                  outline-offset: 2px;
                }

                .btn:active {
                  background-color: #6b3a10;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'Someone is moving through your page with the **Tab** key. Which pseudo-class styles the link they are on?',
              options: ['`:focus`', '`:hover`', '`:active`', '`:visited`'],
              answer: 0,
              explain: '`:hover` needs a mouse. `:focus` is for whatever is currently selected, by keyboard or click.',
            },
            {
              type: 'task',
              title: 'Hover, focus and press',
              body: `
                The button's normal style is done. Add three state rules:

                1. \`.btn:hover\`: background **#8a4a14** (darker).
                2. \`.btn:focus\`: an outline of **3px solid #1f3a5f**.
                3. \`.btn:active\`: background **#6b3a10** (darker still).
              `,
              html: `<a class="btn" href="#">Book a table</a>`,
              css: `
                .btn {
                  display: inline-block;
                  background-color: #b5651d;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 6px;
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'Hover makes the background #8a4a14',
                  test: (c) => {
                    const v = ruleBg(c, ['.btn:hover', 'a.btn:hover']);
                    return c.sameColor(v || 'transparent', '#8a4a14') || (v ? 'The hover background is ' + v + '.' : 'Add a .btn:hover rule with a background-color.');
                  },
                },
                {
                  text: 'Focus shows a 3px solid outline',
                  test: (c) => {
                    const st = ruleOf(c, ['.btn:focus', '.btn:focus-visible', 'a.btn:focus']);
                    if (!st) return 'Add a .btn:focus rule.';
                    return (st.getPropertyValue('outline-style') === 'solid' && st.getPropertyValue('outline-width') === '3px') || 'Give it outline: 3px solid #1f3a5f;';
                  },
                },
                {
                  text: 'Pressing makes it #6b3a10',
                  test: (c) => {
                    const v = ruleBg(c, ['.btn:active', 'a.btn:active']);
                    return c.sameColor(v || 'transparent', '#6b3a10') || (v ? 'The active background is ' + v + '.' : 'Add a .btn:active rule with a background-color.');
                  },
                },
                { text: 'The normal button is still #b5651d', test: (c) => colourIs(c, '.btn', 'background-color', '#b5651d', 'The button') },
              ],
              hint: 'Three new rules, each with one declaration:\n\n```css\n.btn:hover {\n  background-color: #8a4a14;\n}\n```',
              solution: {
                css: `
                  .btn {
                    display: inline-block;
                    background-color: #b5651d;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 6px;
                    text-decoration: none;
                  }

                  .btn:hover {
                    background-color: #8a4a14;
                  }

                  .btn:focus {
                    outline: 3px solid #1f3a5f;
                  }

                  .btn:active {
                    background-color: #6b3a10;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Picking by position',
              body: `
                Some pseudo-classes pick elements by where they sit among their siblings:

                | Selector | Picks |
                |---|---|
                | \`li:first-child\` | the first item |
                | \`li:last-child\` | the last item |
                | \`li:nth-child(odd)\` / \`(even)\` | every other item: stripes |
                | \`li:nth-child(3)\` | the third item |

                The classic use: stripes on a price list, and no border under the last row.

                \`\`\`css
                .prices li:nth-child(even) { background-color: #f3efe6; }
                .prices li:last-child { border-bottom: none; }
                \`\`\`
              `,
            },
            {
              type: 'exhibit',
              title: 'A striped price list',
              body: 'Change `even` to `odd`, or to `3`.',
              html: `
                <ul class="prices">
                  <li>Haircut <span>£18</span></li>
                  <li>Skin fade <span>£22</span></li>
                  <li>Beard trim <span>£10</span></li>
                  <li>Hot towel shave <span>£22</span></li>
                  <li>Kids' cut <span>£12</span></li>
                </ul>
              `,
              css: `
                .prices {
                  list-style: none;
                  padding: 0;
                  max-width: 320px;
                }

                .prices li {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px;
                  border-bottom: 1px solid #ddd;
                }

                .prices li:nth-child(even) {
                  background-color: #f3efe6;
                }

                .prices li:last-child {
                  border-bottom: none;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Stripe every other row, and remove the border from the last item.',
              code: `
                tr:[[nth-child]](even) { background-color: #f5f5f5; }
                li:[[last-child]] { border-bottom: none; }
              `,
              options: ['nth-child', 'last-child', 'first-child', 'every', 'child', 'end'],
            },
            {
              type: 'task',
              title: 'Stripe the price list',
              body: `
                1. The **even** rows: background **#f3efe6**.
                2. The **first** row: **bold** (it's the most popular service).
                3. The **last** row: **no bottom border**.
              `,
              html: `
                <ul class="prices">
                  <li>Haircut <span>£18</span></li>
                  <li>Skin fade <span>£22</span></li>
                  <li>Beard trim <span>£10</span></li>
                  <li>Hot towel shave <span>£22</span></li>
                  <li>Kids' cut <span>£12</span></li>
                </ul>
              `,
              css: `
                .prices {
                  list-style: none;
                  padding: 0;
                  max-width: 320px;
                }

                .prices li {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px;
                  border-bottom: 1px solid #ddd;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'Rows 2 and 4 are #f3efe6, the others are not',
                  test: (c) => {
                    const li = c.$$('.prices li');
                    const on = li.map((e) => c.sameColor(c.style(e, 'background-color'), '#f3efe6'));
                    return (on[1] && on[3] && !on[0] && !on[2] && !on[4]) || 'Striped rows: ' + (on.map((x, i) => (x ? i + 1 : null)).filter(Boolean).join(', ') || 'none') + '. Use :nth-child(even).';
                  },
                },
                {
                  text: 'Only the first row is bold',
                  test: (c) => {
                    const li = c.$$('.prices li');
                    return (+c.style(li[0], 'font-weight') >= 700 && +c.style(li[1], 'font-weight') < 700) || (+c.style(li[1], 'font-weight') >= 700 ? 'Every row is bold. Use :first-child.' : 'The first row is not bold yet.');
                  },
                },
                {
                  text: 'The last row has no bottom border',
                  test: (c) => {
                    const li = c.$$('.prices li');
                    return c.px(li[4], 'border-bottom-width') === 0 && c.px(li[3], 'border-bottom-width') === 1;
                  },
                },
              ],
              hint: '```css\n.prices li:nth-child(even) { … }\n.prices li:first-child { … }\n.prices li:last-child { … }\n```',
              solution: {
                css: `
                  .prices {
                    list-style: none;
                    padding: 0;
                    max-width: 320px;
                  }

                  .prices li {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                  }

                  .prices li:nth-child(even) {
                    background-color: #f3efe6;
                  }

                  .prices li:first-child {
                    font-weight: bold;
                  }

                  .prices li:last-child {
                    border-bottom: none;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Pseudo-elements: ::before and ::after',
              body: `
                A **pseudo-element** adds a bit of content that isn't in the HTML: an icon, a symbol, a decorative line. Two colons:

                \`\`\`css
                .features li::before {
                  content: "✓ ";
                  color: green;
                }

                .price::before {
                  content: "£";
                }
                \`\`\`

                - \`::before\` goes at the start of the element's content; \`::after\` at the end.
                - The \`content\` property is **required**. Without it, nothing appears. For a purely decorative shape, use \`content: "";\` and give it a size and background.
                - Keep it decorative: screen readers may skip it, so don't put important information there.
              `,
            },
            {
              type: 'quiz',
              q: 'You write `.new::after { color: red; font-weight: bold; }` and nothing appears. Why?',
              options: ['It has no `content` property', '`::after` only works on images', 'It needs one colon, not two', 'Pseudo-elements can\'t be coloured'],
              answer: 0,
              explain: 'A pseudo-element only exists if it has `content`, even an empty string.',
            },
            {
              type: 'task',
              title: 'Ticks and pound signs',
              body: `
                1. Put a **"✓ "** before each \`.features li\`, coloured **green**. (Copy the tick from here, or use any symbol you like.)
                2. Put a **£** before each \`.price\`, so the HTML only needs the number.
              `,
              html: `
                <ul class="features">
                  <li>Gas Safe registered</li>
                  <li>Fixed prices</li>
                  <li>No call-out fee</li>
                </ul>
                <p>Boiler service: <span class="price">70</span></p>
              `,
              css: `
                .features {
                  list-style: none;
                  padding: 0;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'Each feature has something before it',
                  test: (c) => {
                    const v = pseudo(c, '.features li', '::before', 'content');
                    return (v && v !== 'none' && v !== 'normal' && v !== '""') || 'Add .features li::before with a content property.';
                  },
                },
                {
                  text: 'The tick is green',
                  test: (c) => {
                    const v = pseudo(c, '.features li', '::before', 'content');
                    if (!v || v === 'none' || v === 'normal') return false;
                    return c.sameColor(pseudo(c, '.features li', '::before', 'color'), 'green') || 'The ::before is ' + pseudo(c, '.features li', '::before', 'color') + '.';
                  },
                },
                {
                  text: 'The price shows a £ before it',
                  test: (c) => /£/.test(pseudo(c, '.price', '::before', 'content')) || (/£/.test(pseudo(c, '.price', '::after', 'content')) ? 'Use ::before, so the £ comes first.' : 'Add .price::before { content: "£"; }'),
                },
              ],
              hint: '```css\n.features li::before {\n  content: "✓ ";\n  color: green;\n}\n```',
              solution: {
                css: `
                  .features {
                    list-style: none;
                    padding: 0;
                  }

                  .features li::before {
                    content: "✓ ";
                    color: green;
                  }

                  .price::before {
                    content: "£";
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`:hover` (mouse over), `:focus` (keyboard or clicked into), `:active` (being pressed). Only write what changes.',
                'Never remove focus outlines without a visible replacement.',
                '`:first-child`, `:last-child`, `:nth-child(even)`, `:nth-child(3)` pick elements by position.',
                '`::before` / `::after` add decorative content. They need `content`, even `""`.',
                'One colon for a state (`:hover`), two for a pseudo-element (`::before`).',
              ],
            },
          ],
        },

        /* ── 16. Motion ─────────────────────────────────────────────── */
        {
          id: 'css-motion',
          title: 'Transitions, transforms and animation',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'Transitions',
              body: `
                A hover change normally snaps instantly. A **transition** smooths it:

                \`\`\`css
                .btn {
                  background-color: #b5651d;
                  transition: background-color 0.25s ease;
                }

                .btn:hover {
                  background-color: #8a4a14;
                }
                \`\`\`

                \`transition: property duration easing;\`

                - Put it on the **normal** rule (\`.btn\`), so it runs both on the way in and on the way out.
                - Keep it quick: 0.15s to 0.3s feels responsive. Slower feels sluggish.
                - \`transition: all 0.25s\` transitions every property that changes. Handy, but naming the property is clearer.
              `,
            },
            {
              type: 'exhibit',
              title: 'Snap vs smooth',
              body: 'Hover over both buttons. Try `0.25s` as `1s` to feel how slow that is.',
              html: `
                <a class="btn snap" href="#">No transition</a>
                <a class="btn smooth" href="#">With transition</a>
              `,
              css: `
                .btn {
                  display: inline-block;
                  background-color: #b5651d;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 6px;
                  text-decoration: none;
                }

                .btn:hover {
                  background-color: #1f3a5f;
                }

                .smooth {
                  transition: background-color 0.25s ease;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'quiz',
              q: 'Where should `transition` go, so the change is smooth both when the mouse arrives and when it leaves?',
              options: ['On the normal `.btn` rule', 'On `.btn:hover` only', 'On `body`', 'In a media query'],
              answer: 0,
              explain: 'On `.btn:hover` it only applies while hovering, so leaving snaps back instantly.',
            },
            {
              type: 'task',
              title: 'A smooth button',
              body: `
                The hover colour is set. Add a transition to \`.btn\` so the **background colour** changes over **0.25s**.
              `,
              html: `<a class="btn" href="#">Order flowers</a>`,
              css: `
                .btn {
                  display: inline-block;
                  background-color: #2a9d8f;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 6px;
                  text-decoration: none;
                }

                .btn:hover {
                  background-color: #1d6f65;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: '`.btn` has a transition',
                  test: (c) => secs(c.style('.btn', 'transition-duration')) > 0 || (c.decl('.btn:hover', 'transition-duration') ? 'Move the transition to the .btn rule, not .btn:hover.' : 'Add transition: background-color 0.25s; to .btn.'),
                },
                {
                  text: 'It transitions the background colour',
                  test: (c) => (secs(c.style('.btn', 'transition-duration')) > 0 && /background-color|all|background/.test(c.style('.btn', 'transition-property'))) || (secs(c.style('.btn', 'transition-duration')) > 0 ? 'It transitions ' + c.style('.btn', 'transition-property') + '.' : false),
                },
                {
                  text: 'It takes 0.25s',
                  test: (c) => near(secs(c.style('.btn', 'transition-duration')), 0.25, 0.001) || 'The duration is ' + c.style('.btn', 'transition-duration') + '.',
                },
              ],
              hint: 'Add one line to `.btn`: `transition: background-color 0.25s;`',
              solution: {
                css: `
                  .btn {
                    display: inline-block;
                    background-color: #2a9d8f;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 6px;
                    text-decoration: none;
                    transition: background-color 0.25s;
                  }

                  .btn:hover {
                    background-color: #1d6f65;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Transforms',
              body: `
                \`transform\` moves, resizes or turns an element **without** pushing anything else around:

                | Value | Does |
                |---|---|
                | \`translateY(-4px)\` | moves it 4px up (\`translateX\` for sideways) |
                | \`scale(1.05)\` | 5% bigger |
                | \`rotate(3deg)\` | turns it slightly clockwise |

                Combine several with spaces: \`transform: translateY(-4px) scale(1.02);\`

                The classic card hover: lift it slightly, with a transition so it glides.

                \`\`\`css
                .card { transition: transform 0.2s; }
                .card:hover { transform: translateY(-4px); }
                \`\`\`
              `,
            },
            {
              type: 'exhibit',
              title: 'Lift, grow, tilt',
              body: 'Hover over each card. Try `scale(1.2)` or `rotate(-5deg)`.',
              html: `
                <div class="row">
                  <div class="card lift">Lift</div>
                  <div class="card grow">Grow</div>
                  <div class="card tilt">Tilt</div>
                </div>
              `,
              css: `
                .row {
                  display: flex;
                  gap: 16px;
                  padding: 16px;
                }

                .card {
                  background-color: white;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  padding: 24px;
                  transition: transform 0.2s;
                }

                .lift:hover { transform: translateY(-6px); }
                .grow:hover { transform: scale(1.08); }
                .tilt:hover { transform: rotate(3deg); }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Lift the card 4px and make it 2% bigger on hover.',
              code: `.card:hover { transform: [[translateY]](-4px) [[scale]](1.02); }`,
              options: ['translateY', 'scale', 'rotate', 'move', 'grow'],
            },
            {
              type: 'task',
              title: 'Lift the product card',
              body: `
                1. \`.card:hover\`: move the card **up** (\`translateY\` with a negative value, like \`-4px\`).
                2. \`.card\`: transition the **transform** over **0.2s**.
              `,
              html: `
                <div class="card">
                  <h3>Peony bouquet</h3>
                  <p>Seasonal, hand-tied. £35</p>
                </div>
              `,
              css: `
                .card {
                  width: 240px;
                  padding: 16px;
                  background-color: white;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'Hovering moves the card up',
                  test: (c) => {
                    const t = c.decl('.card:hover', 'transform');
                    if (!t) return 'Add a .card:hover rule with a transform.';
                    const y = moveY(c, t);
                    return y < 0 || (y > 0 ? 'That moves it down. Use a negative value: translateY(-4px).' : 'That transform does not move it up.');
                  },
                },
                {
                  text: '`.card` transitions the transform',
                  test: (c) => (secs(c.style('.card', 'transition-duration')) > 0 && /transform|all/.test(c.style('.card', 'transition-property'))) || 'Add transition: transform 0.2s; to .card.',
                },
                { text: 'The transition takes 0.2s', test: (c) => near(secs(c.style('.card', 'transition-duration')), 0.2, 0.001) || 'It takes ' + c.style('.card', 'transition-duration') + '.' },
              ],
              hint: '```css\n.card {\n  …\n  transition: transform 0.2s;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n}\n```',
              solution: {
                css: `
                  .card {
                    width: 240px;
                    padding: 16px;
                    background-color: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    transition: transform 0.2s;
                  }

                  .card:hover {
                    transform: translateY(-4px);
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Keyframe animations',
              body: `
                A transition needs a change of state, like a hover. An **animation** runs on its own. You describe the steps with \`@keyframes\`, then attach it:

                \`\`\`css
                @keyframes pulse {
                  from { opacity: 1; }
                  to   { opacity: 0.6; }
                }

                .open-badge {
                  animation: pulse 2s ease-in-out infinite alternate;
                }
                \`\`\`

                \`animation: name duration easing repeat direction;\` Here \`infinite\` loops forever and \`alternate\` plays it backwards every other time, so it fades out and back in smoothly.

                Use animation sparingly: one gentle detail, not a page full of movement. Some people get dizzy from motion and turn it off in their device settings; you can respect that:

                \`\`\`css
                @media (prefers-reduced-motion: reduce) {
                  .open-badge { animation: none; }
                }
                \`\`\`
              `,
            },
            {
              type: 'quiz',
              q: 'What can an animation do that a transition can\'t?',
              options: ['Run by itself, without a hover or other change, and loop', 'Change colours', 'Use a duration', 'Work on links'],
              answer: 0,
              explain: 'Transitions only run when a value changes (say, on hover). Animations play on their own, as many times as you like.',
            },
            {
              type: 'task',
              title: 'A gentle "Open now" pulse',
              body: `
                1. Write \`@keyframes pulse\` that fades **from** \`opacity: 1\` **to** \`opacity: 0.6\`.
                2. Give \`.open-badge\` the animation: name **pulse**, **2s**, **infinite** (add \`ease-in-out\` and \`alternate\` for a smooth loop).
              `,
              html: `<span class="open-badge">Open now</span>`,
              css: `
                .open-badge {
                  display: inline-block;
                  background-color: #2d6a4f;
                  color: white;
                  padding: 6px 12px;
                  border-radius: 999px;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'There is a `@keyframes pulse`',
                  test: (c) => {
                    const k = keyframes(c, 'pulse');
                    return (k && k.cssRules.length >= 2) || 'Write @keyframes pulse { from { … } to { … } }';
                  },
                },
                {
                  text: 'It fades to opacity 0.6',
                  test: (c) => {
                    const k = keyframes(c, 'pulse');
                    return !!k && Array.from(k.cssRules).some((r) => near(parseFloat(r.style.getPropertyValue('opacity')), 0.6, 0.01));
                  },
                },
                { text: 'The badge uses the `pulse` animation', test: (c) => c.style('.open-badge', 'animation-name') === 'pulse' || 'animation-name is ' + c.style('.open-badge', 'animation-name') + '.' },
                {
                  text: 'It lasts 2s and loops forever',
                  test: (c) => (near(secs(c.style('.open-badge', 'animation-duration')), 2, 0.001) && c.style('.open-badge', 'animation-iteration-count') === 'infinite') || 'Duration ' + c.style('.open-badge', 'animation-duration') + ', repeats ' + c.style('.open-badge', 'animation-iteration-count') + '.',
                },
              ],
              hint: '```css\n@keyframes pulse {\n  from { opacity: 1; }\n  to { opacity: 0.6; }\n}\n```\n\nThen add `animation: pulse 2s ease-in-out infinite alternate;` to `.open-badge`.',
              solution: {
                css: `
                  .open-badge {
                    display: inline-block;
                    background-color: #2d6a4f;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 999px;
                    animation: pulse 2s ease-in-out infinite alternate;
                  }

                  @keyframes pulse {
                    from { opacity: 1; }
                    to { opacity: 0.6; }
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`transition: background-color 0.25s;` on the **normal** rule smooths changes in and out. Keep it 0.15–0.3s.',
                '`transform: translateY(-4px) | scale(1.05) | rotate(3deg)` moves things without shifting the layout.',
                'Card lift: `transition: transform 0.2s` on `.card`, `transform: translateY(-4px)` on `.card:hover`.',
                '`@keyframes name { from {…} to {…} }` plus `animation: name 2s infinite;` runs on its own.',
                'Use motion sparingly, and switch it off in `@media (prefers-reduced-motion: reduce)`.',
              ],
            },
          ],
        },

        /* ── 17. Custom properties ──────────────────────────────────── */
        {
          id: 'css-variables',
          title: 'Custom properties and theming',
          minutes: 10,
          steps: [
            {
              type: 'brief',
              title: 'CSS variables',
              body: `
                A brand colour used in twenty places means twenty edits when the client changes their mind. A **custom property** (a CSS variable) stores it once:

                \`\`\`css
                :root {
                  --brand: #2a9d8f;
                  --radius: 8px;
                }

                h1   { color: var(--brand); }
                .btn { background-color: var(--brand); border-radius: var(--radius); }
                \`\`\`

                - Names start with **two dashes**: \`--brand\`. They're case-sensitive.
                - \`:root\` means the \`<html>\` element, the top of the page, so every element can use them.
                - Read one with \`var(--brand)\`.

                Change \`--brand\` once and every heading and button follows.
              `,
            },
            {
              type: 'exhibit',
              title: 'One colour, three places',
              body: 'Change `--brand` to `crimson` or `#6a4c93` and watch the heading, the border and the button change together.',
              html: `
                <h1>Bloom &amp; Stem</h1>
                <div class="card">
                  <p>Seasonal bouquets, delivered across Leicester.</p>
                  <a class="btn" href="#">Order flowers</a>
                </div>
              `,
              css: `
                :root {
                  --brand: #2a9d8f;
                  --radius: 8px;
                }

                h1 {
                  color: var(--brand);
                }

                .card {
                  border: 2px solid var(--brand);
                  border-radius: var(--radius);
                  padding: 16px;
                }

                .btn {
                  display: inline-block;
                  background-color: var(--brand);
                  color: white;
                  padding: 10px 20px;
                  border-radius: var(--radius);
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
            },
            {
              type: 'fill',
              q: 'Define a brand colour, then use it.',
              code: `
                :root { [[--brand]]: #2a9d8f; }
                .btn { background-color: [[var]](--brand); }
              `,
              options: ['--brand', 'var', '$brand', 'brand', 'get'],
              explain: 'Define with two dashes, read with `var()`.',
            },
            {
              type: 'task',
              title: 'Set up brand variables',
              body: `
                1. On \`:root\`, define **--brand: #2a9d8f** and **--text: #222**.
                2. \`body\`: text colour **var(--text)**.
                3. \`h1\`: colour **var(--brand)**.
                4. \`.btn\`: background **var(--brand)**, text **white**.

                The checks swap your brand colour for a different one, so the variables really have to be used.
              `,
              html: `
                <h1>Bloom &amp; Stem</h1>
                <p>Florist in the heart of Leicester.</p>
                <a class="btn" href="#">Order flowers</a>
              `,
              css: `
                .btn {
                  display: inline-block;
                  padding: 10px 20px;
                  text-decoration: none;
                }
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: '`:root` defines `--brand` and `--text`',
                  test: (c) => (c.sameColor(c.style(':root', '--brand') || 'transparent', '#2a9d8f') && c.sameColor(c.style(':root', '--text') || 'transparent', '#222')) || '--brand is "' + c.style(':root', '--brand') + '", --text is "' + c.style(':root', '--text') + '".',
                },
                { text: 'The body text uses `var(--text)`', test: (c) => followsVar(c, '--text', 'p', 'color') || 'Set color: var(--text); on body.' },
                { text: 'The heading uses `var(--brand)`', test: (c) => followsVar(c, '--brand', 'h1', 'color') || (c.sameColor(c.style('h1', 'color'), '#2a9d8f') ? 'Right colour, but use var(--brand) instead of the hex code.' : 'Set color: var(--brand); on h1.') },
                {
                  text: 'The button uses `var(--brand)` with white text',
                  test: (c) => (followsVar(c, '--brand', '.btn', 'background-color') && c.sameColor(c.style('.btn', 'color'), 'white')) || 'Give .btn background-color: var(--brand); and color: white;',
                },
              ],
              hint: '```css\n:root {\n  --brand: #2a9d8f;\n  --text: #222;\n}\n\nbody {\n  color: var(--text);\n}\n```',
              solution: {
                css: `
                  :root {
                    --brand: #2a9d8f;
                    --text: #222;
                  }

                  body {
                    color: var(--text);
                  }

                  h1 {
                    color: var(--brand);
                  }

                  .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    text-decoration: none;
                    background-color: var(--brand);
                    color: white;
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Fallbacks',
              body: `
                \`var()\` takes an optional second value, used if the variable doesn't exist:

                \`\`\`css
                .badge { background-color: var(--accent, orange); }
                \`\`\`

                If \`--accent\` is defined, the badge uses it; if not, orange. Useful in shared components that might land on a site without your variables.

                Variables aren't just for colours: \`--radius: 8px\`, \`--space: 16px\`, \`--font-heading: Georgia, serif\` all work.
              `,
            },
            {
              type: 'quiz',
              q: '`--accent` is not defined anywhere. What colour is `color: var(--accent, crimson);`?',
              options: ['Crimson', 'Black (the default)', 'Transparent', 'The rule is ignored and nothing changes'],
              answer: 0,
              explain: 'The value after the comma is the fallback, used when the variable is missing.',
            },
            {
              type: 'brief',
              title: 'Theming by overriding',
              body: `
                Variables **inherit**, like \`color\`. Redefine one on an element and everything inside it sees the new value:

                \`\`\`css
                :root {
                  --bg: white;
                  --text: #222;
                }

                .dark {
                  --bg: #1d1d1f;
                  --text: #f5f5f7;
                }

                .panel {
                  background-color: var(--bg);
                  color: var(--text);
                }
                \`\`\`

                A \`.panel\` inside (or with) \`.dark\` turns dark. The \`.panel\` rule never changes. That's how dark mode and colour themes work on real sites: one set of components, different variables.
              `,
            },
            {
              type: 'task',
              title: 'A dark section',
              body: `
                The \`.panel\` rule already reads \`--bg\` and \`--text\`. Add a \`.dark\` rule that **redefines the variables**:

                - \`--bg\`: **#1d1d1f**
                - \`--text\`: **#f5f5f7**

                Don't set \`background-color\` or \`color\` in \`.dark\`, and don't change \`.panel\`.
              `,
              html: `
                <section class="panel">
                  <h2>Light</h2>
                  <p>Our standard look.</p>
                </section>
                <section class="panel dark">
                  <h2>Dark</h2>
                  <p>Same CSS, different variables.</p>
                </section>
              `,
              css: `
                :root {
                  --bg: white;
                  --text: #222;
                }

                .panel {
                  background-color: var(--bg);
                  color: var(--text);
                  padding: 24px;
                  border: 1px solid #ddd;
                }

                /* Add .dark here */
              `,
              edit: ['css'],
              active: 'css',
              checks: [
                { text: 'The dark panel is #1d1d1f', test: (c) => colourIs(c, '.dark', 'background-color', '#1d1d1f', 'The dark panel') },
                { text: 'Its text is #f5f5f7', test: (c) => colourIs(c, '.dark p', 'color', '#f5f5f7', 'The text') },
                {
                  text: 'It works by redefining `--bg` and `--text`',
                  test: (c) => (c.sameColor(c.style('.dark', '--bg') || 'transparent', '#1d1d1f') && c.sameColor(c.style('.dark', '--text') || 'transparent', '#f5f5f7')) || 'Inside .dark, set --bg and --text rather than background-color and color.',
                },
                {
                  text: 'The light panel is unchanged',
                  test: (c) => (c.sameColor(c.style('.panel:not(.dark)', 'background-color'), 'white') && c.sameColor(c.style('.panel:not(.dark) p', 'color'), '#222')) || 'The light panel should stay white with #222 text.',
                },
              ],
              hint: '```css\n.dark {\n  --bg: #1d1d1f;\n  --text: …;\n}\n```',
              solution: {
                css: `
                  :root {
                    --bg: white;
                    --text: #222;
                  }

                  .panel {
                    background-color: var(--bg);
                    color: var(--text);
                    padding: 24px;
                    border: 1px solid #ddd;
                  }

                  .dark {
                    --bg: #1d1d1f;
                    --text: #f5f5f7;
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Define variables on `:root`: `--brand: #2a9d8f;`. Use them with `var(--brand)`.',
                'Change one variable and everything using it updates.',
                '`var(--accent, orange)`: the second value is a fallback.',
                'Variables inherit. Redefine them in a class (`.dark { --bg: #111; }`) to theme everything inside.',
              ],
            },
          ],
        },

        /* ── 18. Final operation ────────────────────────────────────── */
        {
          id: 'css-final',
          title: 'Final operation: style a landing page',
          minutes: 25,
          steps: [
            {
              type: 'brief',
              title: 'The operation',
              body: `
                A bakery, Hearth & Crumb, needs its landing page styled. The HTML is written and locked. You write all the CSS, in four stages:

                1. **Base**: brand variables, box-sizing, body typography.
                2. **Hero and layout**: a gradient banner and a centred container.
                3. **Cards**: a responsive grid of this week's bakes.
                4. **Button and mobile**: a button with a hover state, and a heading that grows on bigger screens.

                Each stage starts from the finished CSS of the one before, so you can't fall behind. Everything you need is from earlier missions.
              `,
            },
            {
              type: 'exhibit',
              title: 'The raw page',
              body: "Here's the HTML with no CSS at all. Look at the classes you'll be styling: `hero`, `container`, `btn`, `cards`, `card` and `price`.",
              html: FINAL_HTML,
              edit: [],
              active: 'html',
              height: 320,
            },
            {
              type: 'task',
              title: 'Stage 1: the base',
              body: `
                1. On \`:root\`: \`--brand: #b5651d\`, \`--text: #2b2b2b\`, \`--bg: #fffaf3\` and \`--radius: 12px\`.
                2. Make **every** element use \`box-sizing: border-box\`.
                3. \`body\`: **no margin**, font **system-ui, sans-serif**, colour **var(--text)**, background **var(--bg)**, line-height **1.6**.
                4. \`h1\`, \`h2\` and \`h3\`: font **Georgia, serif**.
              `,
              html: FINAL_HTML,
              css: `/* Brand */\n`,
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The four variables are on `:root`',
                  test: (c) => {
                    const want = { '--brand': '#b5651d', '--text': '#2b2b2b', '--bg': '#fffaf3' };
                    for (const k in want) if (!c.sameColor(c.style(':root', k) || 'transparent', want[k])) return k + ' is "' + c.style(':root', k) + '"; it should be ' + want[k] + '.';
                    return c.style(':root', '--radius') === '12px' || '--radius is "' + c.style(':root', '--radius') + '".';
                  },
                },
                { text: 'Everything uses border-box', test: (c) => ['.hero', '.card', 'h1', 'body'].every((s) => c.style(s, 'box-sizing') === 'border-box') || 'Use the universal selector: *, *::before, *::after { box-sizing: border-box; }' },
                {
                  text: 'The body has no margin and the --bg background',
                  test: (c) => (c.px('body', 'margin-top') === 0 && c.px('body', 'margin-left') === 0 && followsVar(c, '--bg', 'body', 'background-color')) || (c.px('body', 'margin-left') ? 'The body still has a ' + c.style('body', 'margin-left') + ' margin.' : 'Set background-color: var(--bg); on body.'),
                },
                {
                  text: 'Body text: system-ui sans-serif, var(--text), line-height 1.6',
                  test: (c) =>
                    (/sans-serif$/.test(c.style('.card p', 'font-family')) && followsVar(c, '--text', '.card p', 'color') && near(lineRatio(c, '.card p'), 1.6, 0.02)) ||
                    'The card text is ' + c.style('.card p', 'font-family') + ', ' + c.style('.card p', 'color') + ', line-height ' + c.style('.card p', 'line-height') + '.',
                },
                { text: 'Headings use Georgia', test: (c) => ['h1', 'h2', 'h3'].every((s) => /^georgia,\s*serif$/i.test(c.style(s, 'font-family'))) || 'The h2 uses ' + c.style('h2', 'font-family') + '.' },
              ],
              hint: '```css\n:root {\n  --brand: #b5651d;\n  …\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  …\n}\n```',
              solution: { css: FINAL_1 },
            },
            {
              type: 'quiz',
              q: 'Next month the bakery rebrands from brown to green. With your stage 1 CSS, what is the least work?',
              options: ['Change `--brand` on `:root`', 'Find and replace every `#b5651d` in the file', 'Add `!important` to a new green rule', 'Change the HTML classes'],
              answer: 0,
              explain: 'Everything that uses `var(--brand)` follows the one value. That is the whole point of variables.',
            },
            {
              type: 'task',
              title: 'Stage 2: hero and layout',
              body: `
                Below your stage 1 CSS:

                1. \`.container\`: **max-width 1000px**, centred with auto margins, with **16px** padding on the left and right (\`padding: 0 16px\`).
                2. \`.hero\`: background **linear-gradient(135deg, var(--brand), #7a3e0f)**, text **white** and **centred**, padding **64px** top and bottom (\`64px 0\`).
              `,
              html: FINAL_HTML,
              css: FINAL_1 + '\n\n/* Layout */\n',
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The container is 1000px max, centred',
                  test: async (c) => {
                    await c.viewport(1200);
                    const m = box(c, 'main.container');
                    return (near(m.width, 1000) && near(m.left, 100)) || 'At 1200px wide, main is ' + Math.round(m.width) + 'px wide, starting at ' + Math.round(m.left) + 'px.';
                  },
                },
                { text: 'The container has 16px side padding', test: (c) => (c.px('main.container', 'padding-left') === 16 && c.px('main.container', 'padding-right') === 16) || 'Padding is ' + c.style('main.container', 'padding') + '.' },
                {
                  text: 'The hero has the brand gradient',
                  test: (c) => {
                    const g = c.style('.hero', 'background-image');
                    return (/^linear-gradient/.test(g) && g.includes(c.rgb('#b5651d')) && g.includes(c.rgb('#7a3e0f'))) || 'The hero background is ' + g + '.';
                  },
                },
                {
                  text: 'Hero text is white and centred',
                  test: (c) => (c.sameColor(c.style('.hero h1', 'color'), 'white') && c.sameColor(c.style('.tagline', 'color'), 'white') && c.style('.hero h1', 'text-align') === 'center') || 'The heading is ' + c.style('.hero h1', 'color') + ', aligned ' + c.style('.hero h1', 'text-align') + '.',
                },
                { text: 'The hero has 64px padding top and bottom', test: (c) => (c.px('.hero', 'padding-top') === 64 && c.px('.hero', 'padding-bottom') === 64) || 'Padding is ' + c.style('.hero', 'padding') + '.' },
              ],
              hint: '```css\n.container {\n  max-width: 1000px;\n  margin: 0 auto;\n  padding: 0 16px;\n}\n\n.hero {\n  background: linear-gradient(135deg, var(--brand), #7a3e0f);\n  …\n}\n```',
              solution: { css: FINAL_2 },
            },
            {
              type: 'fill',
              q: 'Recall the responsive card grid: as many columns as fit, each at least 220px.',
              code: `grid-template-columns: repeat([[auto-fit]], [[minmax]](220px, 1fr));`,
              options: ['auto-fit', 'minmax', 'auto', 'max', 'span'],
            },
            {
              type: 'task',
              title: 'Stage 3: the cards',
              body: `
                1. \`.cards\`: a grid with \`repeat(auto-fit, minmax(220px, 1fr))\` columns and a **24px** gap.
                2. \`.card\`: background **white**, padding **24px**, corners **var(--radius)**.
                3. \`.price\`: colour **var(--brand)**, **bold**.

                The checks look at a phone (400px) and a laptop (900px).
              `,
              html: FINAL_HTML,
              css: FINAL_2 + '\n\n/* Cards */\n',
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'One column at 400px',
                  test: async (c) => {
                    await c.viewport(400);
                    const n = colCount(c, '.card');
                    return (c.style('.cards', 'display') === 'grid' && n === 1) || 'At 400px there ' + (n === 1 ? 'is 1 column, but .cards is not a grid yet.' : 'are ' + n + ' columns.');
                  },
                },
                {
                  text: 'Three columns at 900px, 24px gap',
                  test: async (c) => {
                    await c.viewport(900);
                    const n = colCount(c, '.card');
                    return (n === 3 && c.px('.cards', 'column-gap') === 24) || 'At 900px: ' + n + ' column(s), gap ' + (c.style('.cards', 'column-gap') || 'none') + '.';
                  },
                },
                {
                  text: 'Cards are white, with 24px padding and var(--radius) corners',
                  test: (c) => (c.sameColor(c.style('.card', 'background-color'), 'white') && c.px('.card', 'padding-top') === 24 && c.px('.card', 'border-top-left-radius') === 12 && /var\(\s*--radius/.test(c.decl('.card', 'border-radius') + c.decl('.card', 'border-top-left-radius'))) || 'Background ' + c.style('.card', 'background-color') + ', padding ' + c.style('.card', 'padding-top') + ', radius ' + c.style('.card', 'border-top-left-radius') + ' (use var(--radius)).',
                },
                { text: 'Prices are bold, in var(--brand)', test: (c) => (+c.style('.price', 'font-weight') >= 700 && followsVar(c, '--brand', '.price', 'color')) || 'Give .price color: var(--brand); and font-weight: 700;' },
              ],
              hint: '```css\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 24px;\n}\n```\n\nThen `.card` and `.price` rules.',
              solution: { css: FINAL_3 },
            },
            {
              type: 'quiz',
              q: 'Base CSS sets `.hero h1 { font-size: 2rem; }` and `@media (min-width: 700px)` sets it to `3rem`. What size is it on a 1024px laptop?',
              options: ['3rem (48px)', '2rem (32px)', '5rem: they add up', 'It depends on which comes first in the file'],
              answer: 0,
              explain: '1024 is at least 700, so the query applies. It comes later with the same selector, so it wins.',
            },
            {
              type: 'task',
              title: 'Stage 4: button and mobile',
              body: `
                1. \`.btn\`: \`display: inline-block\`, background **white**, text **var(--brand)**, padding **12px 24px**, rounded (\`999px\`), **no underline**, **bold**, and a **0.2s** transition on \`background-color\`.
                2. \`.btn:hover\`: background **#ffe8cc**.
                3. Mobile first: \`.hero h1\` is **2rem**; in \`@media (min-width: 700px)\` it becomes **3rem**.
              `,
              html: FINAL_HTML,
              css: FINAL_3 + '\n\n/* Button */\n',
              edit: ['css'],
              active: 'css',
              checks: [
                {
                  text: 'The button is a white, bold, underline-free pill',
                  test: (c) =>
                    (c.style('.btn', 'display') === 'inline-block' && c.sameColor(c.style('.btn', 'background-color'), 'white') && +c.style('.btn', 'font-weight') >= 700 && c.style('.btn', 'text-decoration-line') === 'none' && c.px('.btn', 'border-top-left-radius') >= 20) ||
                    'display ' + c.style('.btn', 'display') + ', background ' + c.style('.btn', 'background-color') + ', weight ' + c.style('.btn', 'font-weight') + ', underline ' + c.style('.btn', 'text-decoration-line') + ', radius ' + c.style('.btn', 'border-top-left-radius') + '.',
                },
                {
                  text: 'Button text uses var(--brand), padding 12px 24px',
                  test: (c) => (followsVar(c, '--brand', '.btn', 'color') && c.px('.btn', 'padding-top') === 12 && c.px('.btn', 'padding-left') === 24) || 'Text ' + c.style('.btn', 'color') + ', padding ' + c.style('.btn', 'padding') + '.',
                },
                {
                  text: 'Hovering turns it #ffe8cc, smoothly',
                  test: (c) => {
                    const v = ruleBg(c, ['.btn:hover', 'a.btn:hover']);
                    if (!c.sameColor(v || 'transparent', '#ffe8cc')) return v ? 'The hover background is ' + v + '.' : 'Add a .btn:hover rule.';
                    return (near(secs(c.style('.btn', 'transition-duration')), 0.2, 0.001) && /background|all/.test(c.style('.btn', 'transition-property'))) || 'Add transition: background-color 0.2s; to .btn.';
                  },
                },
                {
                  text: 'The hero heading is 2rem on a phone, 3rem from 700px',
                  test: async (c) => {
                    await c.viewport(400);
                    const small = c.px('.hero h1', 'font-size');
                    await c.viewport(900);
                    const big = c.px('.hero h1', 'font-size');
                    if (!c.media().some((r) => /min-width/.test(r.media))) return 'Use @media (min-width: 700px) { … }.';
                    return (small === 32 && big === 48) || 'It is ' + small + 'px at 400px and ' + big + 'px at 900px.';
                  },
                },
              ],
              hint: '```css\n.btn:hover {\n  background-color: #ffe8cc;\n}\n\n.hero h1 {\n  font-size: 2rem;\n}\n\n@media (min-width: 700px) {\n  .hero h1 {\n    font-size: 3rem;\n  }\n}\n```',
              solution: { css: FINAL_4 },
            },
            {
              type: 'debrief',
              points: [
                'Start every stylesheet with variables on `:root`, `box-sizing: border-box` for everything, and base text on `body`.',
                'A centred container: `max-width` + `margin: 0 auto` + side padding.',
                'Responsive cards without media queries: `repeat(auto-fit, minmax(220px, 1fr))`.',
                'Buttons: a normal state, a `:hover` state, and a short `transition` on the normal rule.',
                'Mobile first: base styles for phones, `@media (min-width: …)` to upgrade for bigger screens.',
              ],
            },
          ],
        },
      ],
    },
  ]);
})();

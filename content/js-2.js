/* JavaScript, part 2 — the DOM, events, forms, timers, storage, async and
   the final build. Loads after js-1.js. See ../CONTENT_GUIDE.md. */
(function () {
  // Check helpers (kept inside this file so they don't leak into other files).

  // Reload the preview page and wait until the new document has loaded.
  // Anything saved in localStorage survives, exactly like a real reload.
  // After this, use c.win.document (not c.$ / c.text), which still point at
  // the old page.
  async function reloadPage(c) {
    const old = c.win.document;
    c.win.location.reload();
    for (let i = 0; i < 60; i++) {
      await c.wait(50);
      const d = c.win.document;
      if (d !== old && d.readyState === 'complete') break;
    }
    await c.wait(80);
    return c.win.document;
  }

  // querySelector on whatever page is loaded now (works after a reload).
  const q = (c, sel) => c.win.document.querySelector(sel);
  const qa = (c, sel) => Array.from(c.win.document.querySelectorAll(sel));
  const shown = (c, el) => !!el && c.win.getComputedStyle(el).display !== 'none';
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const store = (c, key) => c.win.localStorage.getItem(key);

  /* ── the final operation: shared page and staged JavaScript ───────────── */

  const FINAL_HTML = `
    <header class="top">
      <h1>Wick and Wax</h1>
      <p class="basket">Basket: <span id="basket-count">0</span></p>
    </header>
    <div class="controls">
      <button class="filter active" id="filter-all">All</button>
      <button class="filter" id="filter-candles">Candles</button>
      <button class="filter" id="filter-soaps">Soaps</button>
      <input id="search" type="search" placeholder="Search products">
    </div>
    <p id="empty" class="empty">No products match your search.</p>
    <div id="products" class="grid"></div>
  `;

  const FINAL_CSS = `
    body { margin: 0; font-family: system-ui, sans-serif; background: #faf7f2; color: #2b2b2b; }
    .top { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #2b2b2b; color: white; }
    .top h1 { font-size: 20px; margin: 0; }
    .basket { margin: 0; }
    .controls { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 16px; }
    .filter { padding: 6px 12px; border: 1px solid #2b2b2b; background: white; color: #2b2b2b; border-radius: 16px; cursor: pointer; font: inherit; }
    .filter.active { background: #2b2b2b; color: white; }
    #search { flex: 1; min-width: 140px; padding: 6px 10px; font: inherit; }
    .empty { display: none; padding: 0 16px; color: #777; }
    .empty.show { display: block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; padding: 0 16px 16px; }
    .card { background: white; border: 1px solid #e5e0d8; border-radius: 8px; padding: 12px; }
    .card h3 { font-size: 16px; margin: 0 0 4px; }
    .price { margin: 0 0 8px; color: #2a7d4f; font-weight: bold; }
    .add { width: 100%; padding: 6px; font: inherit; cursor: pointer; }
  `;

  // The JS for each stage of the final build. finalJs(n, false) is the starter
  // for task n (task n-1's solution plus scaffolding); finalJs(n, true) is its
  // solution.
  function finalJs(stage, done) {
    const d = FM.dedent;
    const out = [];
    out.push(d(`
      const products = [
        { id: 1, name: 'Lavender Candle', category: 'candles', price: 12 },
        { id: 2, name: 'Fig and Cedar Candle', category: 'candles', price: 14 },
        { id: 3, name: 'Oat Milk Soap', category: 'soaps', price: 6 },
        { id: 4, name: 'Rose Clay Soap', category: 'soaps', price: 7 },
        { id: 5, name: 'Sea Salt Candle', category: 'candles', price: 12 },
        { id: 6, name: 'Charcoal Soap', category: 'soaps', price: 6 },
      ];
    `));

    const els = ["const grid = document.querySelector('#products');"];
    if (stage >= 3) els.push("const searchInput = document.querySelector('#search');", "const emptyMessage = document.querySelector('#empty');");
    if (stage >= 4) els.push("const basketCount = document.querySelector('#basket-count');");
    out.push(els.join('\n'));

    if (stage >= 2) out.push(stage >= 3 ? "let category = 'all';\nlet searchText = '';" : "let category = 'all';");

    if (stage >= 4) {
      out.push(
        done
          ? d(`
              let basket = JSON.parse(localStorage.getItem('shopBasket')) || [];
              basketCount.textContent = basket.length;

              function addToBasket(product) {
                basket.push(product.id);
                localStorage.setItem('shopBasket', JSON.stringify(basket));
                basketCount.textContent = basket.length;
              }
            `)
          : d(`
              // NEW: load the basket from localStorage ('shopBasket'), or start with []
              let basket = [];
              basketCount.textContent = basket.length;

              function addToBasket(product) {
                // NEW: 1. add product.id to basket
                //      2. save basket as JSON under 'shopBasket'
                //      3. show basket.length in #basket-count
              }
            `)
      );
    }

    if (stage === 1 && !done) {
      out.push(d(`
        function render(list) {
          // 1. Empty the grid: grid.innerHTML = '';
          // 2. For each product in list, build a div.card containing:
          //      an <h3> with the name
          //      a <p class="price"> like £12
          //      a <button class="add"> that says Add to basket
          //    and append the card to grid.
        }
      `));
    } else {
      const listener =
        stage < 4
          ? ''
          : done
            ? "\n    button.addEventListener('click', () => {\n      addToBasket(product);\n    });\n"
            : '\n    // NEW: when this button is clicked, call addToBasket(product)\n';
      out.push(
        "function render(list) {\n" +
          "  grid.innerHTML = '';\n" +
          '  list.forEach((product) => {\n' +
          "    const card = document.createElement('div');\n" +
          "    card.classList.add('card');\n\n" +
          "    const title = document.createElement('h3');\n" +
          '    title.textContent = product.name;\n\n' +
          "    const price = document.createElement('p');\n" +
          "    price.classList.add('price');\n" +
          "    price.textContent = '£' + product.price;\n\n" +
          "    const button = document.createElement('button');\n" +
          "    button.classList.add('add');\n" +
          "    button.textContent = 'Add to basket';\n" +
          listener +
          '\n    card.append(title, price, button);\n' +
          '    grid.append(card);\n' +
          '  });\n' +
          '}'
      );
    }

    if (stage >= 2) {
      const catLine = done || stage >= 3
        ? "  if (category !== 'all') {\n    list = products.filter((product) => product.category === category);\n  }\n"
        : "  // NEW: if category isn't 'all', keep only the products in that category (filter)\n\n";
      let search = '';
      let empty = '';
      if (stage === 3 && !done) {
        search = '  // NEW: keep only products whose name includes searchText (ignore capitals)\n\n';
        empty = "\n  // NEW: if nothing is left, add 'show' to emptyMessage; otherwise remove it\n";
      } else if (stage >= 3) {
        search = '  list = list.filter((product) => product.name.toLowerCase().includes(searchText));\n';
        empty = "  if (list.length === 0) {\n    emptyMessage.classList.add('show');\n  } else {\n    emptyMessage.classList.remove('show');\n  }\n";
      }
      out.push('function update() {\n  let list = products;\n' + catLine + search + '  render(list);\n' + empty + '}');

      out.push(
        stage === 2 && !done
          ? d(`
              function setCategory(newCategory, button) {
                category = newCategory;
                // NEW: move the 'active' class: remove it from every .filter, then add it to button

                update();
              }
            `)
          : d(`
              function setCategory(newCategory, button) {
                category = newCategory;
                document.querySelectorAll('.filter').forEach((b) => {
                  b.classList.remove('active');
                });
                button.classList.add('active');
                update();
              }
            `)
      );

      const one = (id, cat) => "document.querySelector('#filter-" + id + "').addEventListener('click', (event) => {\n  setCategory('" + cat + "', event.target);\n});";
      out.push(
        stage === 2 && !done
          ? one('all', 'all') + '\n// NEW: the same for #filter-candles and #filter-soaps'
          : [one('all', 'all'), one('candles', 'candles'), one('soaps', 'soaps')].join('\n')
      );
    }

    if (stage >= 3) {
      out.push(
        stage === 3 && !done
          ? "// NEW: on 'input' in searchInput: set searchText to its value (trimmed, lower case), then update()"
          : d(`
              searchInput.addEventListener('input', () => {
                searchText = searchInput.value.trim().toLowerCase();
                update();
              });
            `)
      );
    }

    out.push(stage === 1 ? 'render(products);' : 'update();');
    return out.join('\n\n') + '\n';
  }

  const cardNames = (c) => c.$$('#products .card h3').map(txt);
  const CANDLES = 'Lavender Candle|Fig and Cedar Candle|Sea Salt Candle';
  const SOAPS = 'Oat Milk Soap|Rose Clay Soap|Charcoal Soap';

  FM.modules('js', [
    {
      title: 'The DOM',
      missions: [
        /* ── 15 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-dom-select',
          title: 'The DOM and selecting elements',
          minutes: 9,
          steps: [
            {
              type: 'brief',
              title: 'The page as objects',
              body: `
                Until now your code has only talked to the console. Now it talks to the **page**.

                When the browser reads your HTML, it turns every element into a JavaScript **object** and keeps them in a tree. That tree is the **DOM** (Document Object Model). JavaScript never edits your HTML file. It changes the DOM, the live page the visitor is looking at.

                The whole page is in a variable called \`document\`. To work with an element, you first **find** it with \`document.querySelector()\`, giving it a CSS selector, exactly like the ones you wrote in CSS:

                \`\`\`js
                const heading = document.querySelector('h1');       // the first <h1>
                const price = document.querySelector('.price');     // the first class="price"
                const basket = document.querySelector('#basket');   // the element with id="basket"
                \`\`\`

                It returns the **first** match, or \`null\` if nothing matches.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: 'The JS finds two elements and logs them. `textContent` is the text inside an element. Edit the JS and press **Run**: try selecting `.tagline` instead.',
              html: `
                <h1>Crumb and Co. Bakery</h1>
                <p class="tagline">Fresh bread every morning.</p>
                <p id="hours">Open 7am to 2pm</p>
              `,
              js: `
                const heading = document.querySelector('h1');
                console.log(heading);
                console.log(heading.textContent);

                const hours = document.querySelector('#hours');
                console.log(hours.textContent);
              `,
              active: 'js',
            },
            {
              type: 'quiz',
              q: 'A page has three elements with `class="price"`. What does `document.querySelector(\'.price\')` give you?',
              options: ['The first element with class `price`', 'All three, as a list', 'The last one on the page', '`null`, because there is more than one'],
              answer: 0,
              explain: '`querySelector` always returns **one** element: the first match from the top of the page. To get all of them you need `querySelectorAll`, coming up shortly.',
            },
            {
              type: 'brief',
              title: 'Changing text',
              body: `
                \`textContent\` works both ways. Read it to get the text; **assign** to it to replace the text:

                \`\`\`js
                const status = document.querySelector('#status');
                console.log(status.textContent);   // "Closed"
                status.textContent = 'Open now';   // the page changes straight away
                \`\`\`

                There is also \`document.getElementById('status')\`. It does the same as \`querySelector('#status')\`, but only works with ids, and you leave out the \`#\`. You'll see both in other people's code.
              `,
            },
            {
              type: 'task',
              title: 'Update the shop sign',
              body: `
                The HTML is locked: change the page with JavaScript only.

                1. Change the \`<h1>\` to say **Wick and Wax**
                2. Change the \`#status\` paragraph to say **Open today until 5pm**

                Leave the tagline alone. Press **Run** to see your changes, then **Check**.
              `,
              html: `
                <h1>Shop name</h1>
                <p id="status">Closed</p>
                <p class="tagline">Hand-poured candles from Leicester.</p>
              `,
              js: `
                // 1. Select the <h1> and change its text to: Wick and Wax

                // 2. Select #status and change its text to: Open today until 5pm

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'The heading says *Wick and Wax*',
                  test: (c) => /^wick (and|&) wax$/i.test(c.text('h1')) || 'The heading says "' + c.text('h1') + '".',
                },
                {
                  text: 'The status says *Open today until 5pm*',
                  test: (c) => /^open today until 5 ?pm\.?$/i.test(c.text('#status')) || 'The status says "' + c.text('#status') + '".',
                },
                {
                  text: 'The tagline is unchanged',
                  test: (c) => c.text('.tagline') === 'Hand-poured candles from Leicester.' || 'The tagline changed. Make sure you select `#status`, not `.tagline`.',
                },
                {
                  text: 'Uses `querySelector` or `getElementById`',
                  test: (c) => /querySelector|getElementById/.test(c.src('js')),
                },
              ],
              hint: 'Find the element, keep it in a constant, then assign to its `textContent`:\n\n```js\nconst heading = document.querySelector(\'h1\');\nheading.textContent = \'…\';\n```',
              solution: {
                js: `
                  const heading = document.querySelector('h1');
                  heading.textContent = 'Wick and Wax';

                  const status = document.querySelector('#status');
                  status.textContent = 'Open today until 5pm';
                `,
              },
            },
            {
              type: 'fill',
              q: 'Show the basket total on the page.',
              code: `
                const total = document.[[querySelector]]('#total');
                total.[[textContent]] = '£12.50';
              `,
              options: ['querySelector', 'textContent', 'select', 'text', 'value'],
            },
            {
              type: 'exhibit',
              title: 'All of them at once',
              body: '`document.querySelectorAll()` returns **every** match, as a list. A list has a `.length` and a `.forEach()`, just like an array, so you can change each one in a loop.',
              html: `
                <ul>
                  <li class="item">Sourdough</li>
                  <li class="item">Croissant</li>
                  <li class="item">Bagel</li>
                </ul>
              `,
              js: `
                const items = document.querySelectorAll('.item');
                console.log(items.length);

                items.forEach((item) => {
                  item.textContent = item.textContent + ' (fresh today)';
                });
              `,
              active: 'js',
            },
            {
              type: 'brief',
              title: 'textContent vs innerHTML',
              body: `
                \`textContent\` treats everything as plain text. \`innerHTML\` treats it as **HTML**, so tags become real elements:

                \`\`\`js
                offer.textContent = '<strong>20% off</strong>';  // shows the tags as text
                offer.innerHTML = '<strong>20% off</strong>';    // shows bold "20% off"
                \`\`\`

                >! Never put anything a visitor typed into \`innerHTML\`. If someone types \`<img src=x onerror="…">\` into your form, the browser builds that element and runs their code on your page. This is called **cross-site scripting** (XSS). For anything that came from a visitor, use \`textContent\`: it can never create elements.

                Rule of thumb: \`textContent\` by default, \`innerHTML\` only for HTML that **you** wrote.
              `,
            },
            {
              type: 'quiz',
              q: 'A visitor types their name into a box, and you want to show "Thanks, *name*!" on the page. Which line is safe?',
              options: [
                "`message.textContent = 'Thanks, ' + name + '!'`",
                "`message.innerHTML = 'Thanks, ' + name + '!'`",
                "`message.innerHTML = '<b>Thanks</b>, ' + name`",
              ],
              answer: 0,
              explain: '`textContent` shows the name as plain text, whatever it contains. With `innerHTML`, a "name" containing HTML tags would become real elements, and could run code.',
            },
            {
              type: 'task',
              title: 'Mark the sale',
              body: `
                The weekend sale has started.

                1. Every \`.badge\` should say **Sale**. There are three, so use \`querySelectorAll\` and \`forEach\`.
                2. Set the \`#offer\` heading's HTML to: \`<strong>20% off</strong> all candles this weekend\`

                (The badges are hidden by the CSS while they are empty, so they'll appear once they have text.)
              `,
              html: `
                <h2 id="offer">Offers</h2>
                <div class="product">Lavender <span class="badge"></span></div>
                <div class="product">Fig and Cedar <span class="badge"></span></div>
                <div class="product">Sea Salt <span class="badge"></span></div>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .product { padding: 8px 0; border-bottom: 1px solid #ddd; }
                .badge { background: crimson; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 6px; }
                .badge:empty { display: none; }
              `,
              js: `
                // 1. Select every .badge and set each one's text to: Sale

                // 2. Set the innerHTML of #offer

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'All three badges say *Sale*',
                  test: (c) => {
                    const done = c.$$('.badge').filter((b) => /^sale!?$/i.test(b.textContent.trim())).length;
                    if (done === 3) return true;
                    if (done === 1) return 'Only the first badge says Sale. `querySelector` finds just one; use `querySelectorAll`.';
                    return false;
                  },
                },
                {
                  text: '`#offer` contains a `<strong>` that says *20% off*',
                  test: (c) => {
                    const s = c.$('#offer strong');
                    if (s) return /^20% off$/i.test(s.textContent.trim()) || 'The <strong> says "' + s.textContent + '".';
                    return /<strong>/i.test(c.text('#offer')) ? 'The tags are showing as text. Use `innerHTML`, not `textContent`, for this one.' : false;
                  },
                },
                { text: 'The offer mentions *this weekend*', test: (c) => /all candles this weekend/i.test(c.text('#offer')) },
                { text: 'Uses `querySelectorAll`', test: (c) => /querySelectorAll/.test(c.src('js')) },
              ],
              hint: 'For the badges:\n\n```js\nconst badges = document.querySelectorAll(\'.badge\');\nbadges.forEach((badge) => {\n  badge.textContent = \'Sale\';\n});\n```\n\nFor the offer, assign the whole string (tags included) to `innerHTML`.',
              solution: {
                js: `
                  const badges = document.querySelectorAll('.badge');
                  badges.forEach((badge) => {
                    badge.textContent = 'Sale';
                  });

                  const offer = document.querySelector('#offer');
                  offer.innerHTML = '<strong>20% off</strong> all candles this weekend';
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'The **DOM** is the page as JavaScript objects. JS changes the DOM, never your HTML file.',
                "`document.querySelector('css selector')` returns the **first** match, or `null`. `getElementById('id')` does the same for ids (no `#`).",
                '`document.querySelectorAll(…)` returns **every** match; loop over it with `.forEach()`.',
                '`el.textContent` reads or replaces the text inside an element.',
                "`el.innerHTML` reads or replaces the HTML inside. **Never** put a visitor's input into it; use `textContent` instead.",
              ],
            },
          ],
        },

        /* ── 16 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-dom-style',
          title: 'Styles, classes and attributes',
          minutes: 9,
          steps: [
            {
              type: 'brief',
              title: 'Changing styles',
              body: `
                Every element has a \`style\` object. Set a property on it and the page updates:

                \`\`\`js
                const banner = document.querySelector('#banner');
                banner.style.color = 'white';
                banner.style.backgroundColor = 'crimson';
                banner.style.padding = '12px';
                \`\`\`

                Two things to notice:

                - CSS names with a dash become **camelCase**: \`background-color\` → \`backgroundColor\`, \`font-size\` → \`fontSize\`. (A dash would mean "minus" in JavaScript.)
                - Values are **strings** with their units: \`'12px'\`, not \`12\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: 'Change the colours or add another line, such as `banner.style.fontSize = \'24px\';`, then press **Run**.',
              html: `<div id="banner">Free delivery on orders over £30</div>`,
              js: `
                const banner = document.querySelector('#banner');
                banner.style.backgroundColor = 'gold';
                banner.style.padding = '12px';
                banner.style.fontWeight = 'bold';
              `,
              active: 'js',
            },
            {
              type: 'fill',
              q: 'Give the banner a gold background.',
              code: `banner.style.[[backgroundColor]] = 'gold';`,
              options: ['backgroundColor', 'background-color', 'bgColor', 'backgroundColour'],
              explain: 'Dashes become camelCase in JavaScript, and it keeps the American spelling `Color`, just like CSS.',
            },
            {
              type: 'task',
              title: 'Make the notice stand out',
              body: `
                The shop is closed on Monday. Use \`.style\` to make \`#notice\` hard to miss:

                - background colour **crimson**
                - text colour **white**
                - padding **10px**
                - text centred (\`textAlign\`, value \`'center'\`)
              `,
              html: `<p id="notice">Closed on Monday for the bank holiday.</p>`,
              js: `
                const notice = document.querySelector('#notice');
                // Set four styles on notice

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                { text: 'The background is crimson', test: (c) => c.sameColor(c.style('#notice', 'background-color'), 'crimson') },
                { text: 'The text is white', test: (c) => c.sameColor(c.style('#notice', 'color'), 'white') },
                {
                  text: 'The padding is 10px',
                  test: (c) => c.px('#notice', 'padding-top') === 10 || (/style\.padding\s*=\s*10\b/.test(c.src('js')) ? "Style values are strings with units: '10px'." : false),
                },
                { text: 'The text is centred', test: (c) => c.style('#notice', 'text-align') === 'center' },
              ],
              hint: "One line per property, all on `notice.style`:\n\n```js\nnotice.style.backgroundColor = 'crimson';\nnotice.style.color = 'white';\n```\n\nThen `padding` and `textAlign`.",
              solution: {
                js: `
                  const notice = document.querySelector('#notice');
                  notice.style.backgroundColor = 'crimson';
                  notice.style.color = 'white';
                  notice.style.padding = '10px';
                  notice.style.textAlign = 'center';
                `,
              },
            },
            {
              type: 'brief',
              title: 'Classes are usually better',
              body: `
                Setting styles one by one from JavaScript gets messy. The cleaner way: write the look in **CSS** as a class, and let JavaScript just switch the class on or off.

                \`\`\`css
                .sold-out { opacity: 0.5; text-decoration: line-through; }
                \`\`\`

                \`\`\`js
                const card = document.querySelector('#rose');
                card.classList.add('sold-out');       // switch it on
                card.classList.remove('sold-out');    // switch it off
                card.classList.toggle('sold-out');    // on if off, off if on
                card.classList.contains('sold-out');  // true or false
                \`\`\`

                Why it's better: all the styling stays in your CSS file, one class can change many properties at once, and removing the class undoes all of it cleanly.

                \`classList\` only touches the class you name. Other classes on the element stay put.
              `,
            },
            {
              type: 'quiz',
              q: 'Your dark-mode button should switch the `dark` class **on if it is off, and off if it is on**. Which do you use?',
              options: ["`classList.toggle('dark')`", "`classList.add('dark')`", "`classList.contains('dark')`", "`classList.switch('dark')`"],
              answer: 0,
              explain: '`toggle` flips the class each time. `add` only ever switches it on, and `contains` only *asks* whether it is there. There is no `switch` method.',
            },
            {
              type: 'task',
              title: 'Update the stock',
              body: `
                The CSS (locked) already has the classes \`featured\`, \`sold-out\` and \`hidden\`. Use \`classList\` to:

                1. Add \`featured\` to \`#lavender\`
                2. Remove \`sold-out\` from \`#rose\` (it's back in stock)
                3. Add \`sold-out\` to \`#cedar\`
                4. Show \`#notice\` by removing its \`hidden\` class

                Every card must keep its \`card\` class.
              `,
              html: `
                <p id="notice" class="hidden">Order by Thursday for weekend delivery.</p>
                <div class="card" id="lavender">Lavender candle</div>
                <div class="card sold-out" id="rose">Rose candle</div>
                <div class="card" id="cedar">Cedar candle</div>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .card { border: 2px solid #ccc; padding: 10px; margin-bottom: 8px; border-radius: 6px; }
                .featured { border-color: gold; background: #fffbea; }
                .sold-out { opacity: 0.4; text-decoration: line-through; }
                .hidden { display: none; }
              `,
              js: `
                // Use classList.add and classList.remove

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: '`#lavender` has the class `featured` (and still `card`)',
                  test: (c) => {
                    const l = c.$('#lavender');
                    if (!l.classList.contains('featured')) return false;
                    return l.classList.contains('card') || 'It lost its `card` class. Use `classList.add`, which keeps the other classes.';
                  },
                },
                { text: '`#rose` is no longer `sold-out`', test: (c) => !c.$('#rose').classList.contains('sold-out') && c.$('#rose').classList.contains('card') },
                { text: '`#cedar` is `sold-out`', test: (c) => c.$('#cedar').classList.contains('sold-out') && c.$('#cedar').classList.contains('card') },
                { text: 'The notice is showing', test: (c) => shown(c, c.$('#notice')) },
                { text: 'Uses `classList`', test: (c) => /classList\.(add|remove|toggle)/.test(c.src('js')) },
              ],
              hint: "Select each element and call one method on its `classList`:\n\n```js\ndocument.querySelector('#lavender').classList.add('featured');\n```",
              solution: {
                js: `
                  document.querySelector('#lavender').classList.add('featured');
                  document.querySelector('#rose').classList.remove('sold-out');
                  document.querySelector('#cedar').classList.add('sold-out');
                  document.querySelector('#notice').classList.remove('hidden');
                `,
              },
            },
            {
              type: 'brief',
              title: 'Attributes',
              body: `
                Attributes like \`src\`, \`href\` and \`alt\` can be changed too. The common ones are plain properties:

                \`\`\`js
                const photo = document.querySelector('#photo');
                photo.src = 'images/rose.jpg';
                photo.alt = 'Rose candle in a pink tin';

                const link = document.querySelector('#call');
                link.href = 'tel:01162555123';
                \`\`\`

                For any attribute at all, use \`setAttribute\` and \`getAttribute\`:

                \`\`\`js
                link.setAttribute('title', 'Call the shop');
                console.log(link.getAttribute('href'));   // "tel:01162555123"
                \`\`\`

                This is how image galleries work: click a thumbnail, and JavaScript swaps the big image's \`src\`.
              `,
            },
            {
              type: 'fill',
              q: 'Swap the product photo and its description.',
              code: `
                const photo = document.querySelector('#photo');
                photo.[[src]] = 'images/lavender.jpg';
                photo.[[alt]] = 'Lavender candle in a glass jar';
              `,
              options: ['src', 'alt', 'href', 'title', 'text'],
            },
            {
              type: 'task',
              title: 'Swap the photo and the link',
              body: `
                1. Set \`#photo\`'s \`src\` to \`images/lavender.jpg\`
                2. Give it an \`alt\` that describes it, mentioning **lavender**
                3. Set \`#call\`'s \`href\` to \`tel:01162555123\`
                4. Use \`setAttribute\` for at least one of these

                The image file doesn't exist in this preview, so you'll see a broken image with your alt text in its place. That is exactly what alt text is for.
              `,
              html: `
                <img id="photo" src="images/placeholder.jpg" alt="">
                <p><a id="call" href="#">Call us</a></p>
              `,
              js: `
                // Change the photo's src and alt, and the link's href

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'The photo\'s `src` is `images/lavender.jpg`',
                  test: (c) => c.$('#photo').getAttribute('src') === 'images/lavender.jpg' || 'The src is "' + c.$('#photo').getAttribute('src') + '".',
                },
                { text: 'The photo has alt text mentioning lavender', test: (c) => /lavender/i.test(c.$('#photo').getAttribute('alt') || '') },
                {
                  text: 'The link\'s `href` is `tel:01162555123`',
                  test: (c) => /^tel:0116 ?2555 ?123$/.test(c.$('#call').getAttribute('href') || '') || 'The href is "' + c.$('#call').getAttribute('href') + '".',
                },
                { text: 'Uses `setAttribute`', test: (c) => /\.setAttribute\s*\(/.test(c.src('js')) },
              ],
              hint: "Either style works:\n\n```js\nphoto.src = 'images/lavender.jpg';\nphoto.setAttribute('alt', 'Lavender candle');\n```",
              solution: {
                js: `
                  const photo = document.querySelector('#photo');
                  photo.src = 'images/lavender.jpg';
                  photo.alt = 'Lavender candle in a glass jar';

                  const call = document.querySelector('#call');
                  call.setAttribute('href', 'tel:01162555123');
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "`el.style.backgroundColor = 'gold'` sets an inline style. Dashed CSS names become camelCase; values are strings with units (`'12px'`).",
                'Prefer **classes**: style in CSS, then switch with `classList.add`, `.remove`, `.toggle` and `.contains`.',
                '`classList` changes only the class you name; the element keeps its other classes.',
                'Common attributes are properties: `img.src`, `img.alt`, `a.href`.',
                "`el.setAttribute('name', 'value')` and `el.getAttribute('name')` work for any attribute.",
              ],
            },
          ],
        },
        /* ── 17 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-events',
          title: 'Events: reacting to clicks and typing',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'Listening for events',
              body: `
                An **event** is something that happens on the page: a click, a key press, typing in a box, a form being sent. You tell an element "when *this* happens, run *this* function":

                \`\`\`js
                const button = document.querySelector('#book');

                button.addEventListener('click', () => {
                  console.log('Book button clicked');
                });
                \`\`\`

                - The first argument is the event name, as a string: \`'click'\`.
                - The second is a **function**. The browser calls it every time the event happens, not before.

                This is how almost every interactive thing on a website works.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: 'Press **Run**, then click the button in the result. Change the message and run it again.',
              html: `
                <button id="hello">Say hello</button>
                <p id="out"></p>
              `,
              js: `
                const button = document.querySelector('#hello');
                const out = document.querySelector('#out');

                button.addEventListener('click', () => {
                  out.textContent = 'Hello! Thanks for clicking.';
                  console.log('clicked');
                });
              `,
              active: 'js',
            },
            {
              type: 'quiz',
              q: "What's wrong with `menuButton.addEventListener('click', openMenu())`?",
              options: [
                'The brackets call `openMenu` straight away. Pass `openMenu` without them.',
                "The event should be called `'onclick'`.",
                '`addEventListener` only accepts arrow functions.',
                'Nothing. It opens the menu on every click.',
              ],
              answer: 0,
              explain: "`openMenu()` runs the function **now** and hands its result to `addEventListener`. You want to hand over the function itself, to be run later: `addEventListener('click', openMenu)`.",
            },
            {
              type: 'task',
              title: 'Basket counter',
              body: `
                Make the **Add to basket** button work. Each click should add 1 to \`items\` and show the new number in \`#count\`.

                Press **Run**, then try clicking it yourself before you **Check**.
              `,
              html: `
                <p>Basket: <span id="count">0</span> items</p>
                <button id="add">Add to basket</button>
              `,
              js: `
                const count = document.querySelector('#count');
                const addButton = document.querySelector('#add');
                let items = 0;

                // When addButton is clicked: add 1 to items, then show items in #count

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'One click shows *1*',
                  test: (c) => {
                    c.click('#add');
                    return c.text('#count') === '1' || 'After one click, #count says "' + c.text('#count') + '".';
                  },
                },
                {
                  text: 'Every click adds one more',
                  test: (c) => {
                    const before = Number(c.text('#count'));
                    c.click('#add');
                    c.click('#add');
                    return Number(c.text('#count')) === before + 2;
                  },
                },
                { text: 'Uses `addEventListener`', test: (c) => /addEventListener\s*\(\s*['"]click['"]/.test(c.src('js')) },
              ],
              hint: "Inside the listener, two lines:\n\n```js\naddButton.addEventListener('click', () => {\n  items = items + 1;\n  count.textContent = items;\n});\n```",
              solution: {
                js: `
                  const count = document.querySelector('#count');
                  const addButton = document.querySelector('#add');
                  let items = 0;

                  addButton.addEventListener('click', () => {
                    items = items + 1;
                    count.textContent = items;
                  });
                `,
              },
            },
            {
              type: 'brief',
              title: 'A mobile menu',
              body: `
                On phones, the menu is usually hidden behind a **Menu** button. The trick is the one from the last mission: CSS decides what "open" looks like, and JavaScript just toggles a class.

                \`\`\`css
                .nav { display: none; }
                .nav.open { display: block; }
                \`\`\`

                \`\`\`js
                menuButton.addEventListener('click', () => {
                  nav.classList.toggle('open');
                });
                \`\`\`

                To do something different depending on the state, ask with \`contains\`:

                \`\`\`js
                if (nav.classList.contains('open')) {
                  // it's open now
                } else {
                  // it's closed now
                }
                \`\`\`
              `,
            },
            {
              type: 'task',
              title: 'Build the mobile menu',
              body: `
                1. When \`#menu-btn\` is clicked, toggle the class \`open\` on \`#nav\`.
                2. Then change the button's text: **Close** while the menu is open, **Menu** while it is closed.
              `,
              html: `
                <header class="top">
                  <strong>Fade Barbers</strong>
                  <button id="menu-btn">Menu</button>
                </header>
                <nav id="nav" class="nav">
                  <a href="#">Prices</a>
                  <a href="#">Book</a>
                  <a href="#">Find us</a>
                </nav>
              `,
              css: `
                body { margin: 0; font-family: system-ui, sans-serif; }
                .top { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #222; color: white; }
                .nav { display: none; background: #333; }
                .nav.open { display: block; }
                .nav a { display: block; padding: 12px 16px; color: white; text-decoration: none; border-top: 1px solid #444; }
              `,
              js: `
                const menuButton = document.querySelector('#menu-btn');
                const nav = document.querySelector('#nav');

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                { text: 'The menu starts hidden', test: (c) => !shown(c, c.$('#nav')) },
                {
                  text: 'Clicking *Menu* opens it',
                  test: (c) => {
                    c.click('#menu-btn');
                    return (shown(c, c.$('#nav')) && c.$('#nav').classList.contains('open')) || 'After one click the menu should have the class `open`.';
                  },
                },
                {
                  text: 'Clicking again closes it',
                  test: (c) => {
                    const before = shown(c, c.$('#nav'));
                    c.click('#menu-btn');
                    return before && !shown(c, c.$('#nav'));
                  },
                },
                {
                  text: 'The button says *Close* while open and *Menu* while closed',
                  test: (c) => {
                    const pairs = [];
                    for (let i = 0; i < 2; i++) {
                      c.click('#menu-btn');
                      pairs.push([c.$('#nav').classList.contains('open'), c.text('#menu-btn')]);
                    }
                    if (pairs[0][0] === pairs[1][0]) return false;
                    return pairs.every(([open, t]) => (open ? /close/i.test(t) : /menu/i.test(t) && !/close/i.test(t))) || 'The menu is ' + (pairs[1][0] ? 'open' : 'closed') + ' but the button says "' + pairs[1][1] + '".';
                  },
                },
              ],
              hint: "After the toggle, use `if (nav.classList.contains('open'))` to choose the text, and set it with `menuButton.textContent = 'Close';` (or `'Menu'` in the `else`).",
              solution: {
                js: `
                  const menuButton = document.querySelector('#menu-btn');
                  const nav = document.querySelector('#nav');

                  menuButton.addEventListener('click', () => {
                    nav.classList.toggle('open');
                    if (nav.classList.contains('open')) {
                      menuButton.textContent = 'Close';
                    } else {
                      menuButton.textContent = 'Menu';
                    }
                  });
                `,
              },
            },
            {
              type: 'brief',
              title: 'The event object, typing and keys',
              body: `
                Your function is given an **event object** describing what happened. Name it \`event\` (or \`e\`):

                - \`event.target\` is the element the event happened on.
                - \`event.key\` is the key that was pressed, for keyboard events: \`'Enter'\`, \`'Escape'\`, \`'a'\`.

                Two more events you'll use all the time:

                - \`'input'\` fires on a text box **every time its text changes**. The box's current text is in its \`.value\` (always a string).
                - \`'keydown'\` fires when a key is pressed.

                \`\`\`js
                search.addEventListener('input', (event) => {
                  console.log(event.target.value);   // what's in the box right now
                });
                \`\`\`
              `,
            },
            {
              type: 'exhibit',
              title: 'Typing and keys',
              body: 'Press **Run**, then type your name into the box. Watch the greeting and the console.',
              html: `
                <label>Your name <input id="name"></label>
                <p id="greeting">Hello!</p>
              `,
              js: `
                const nameInput = document.querySelector('#name');
                const greeting = document.querySelector('#greeting');

                nameInput.addEventListener('input', (event) => {
                  greeting.textContent = 'Hello, ' + event.target.value + '!';
                });

                nameInput.addEventListener('keydown', (event) => {
                  console.log('You pressed', event.key);
                });
              `,
              active: 'js',
            },
            {
              type: 'fill',
              q: 'Log the search text every time it changes.',
              code: `
                search.addEventListener('[[input]]', (event) => {
                  console.log(event.[[target]].value);
                });
              `,
              options: ['input', 'target', 'click', 'type', 'element', 'key'],
            },
            {
              type: 'quiz',
              q: 'In a `keydown` listener, how do you check whether the visitor pressed Escape?',
              options: ["`if (event.key === 'Escape')`", "`if (event.target === 'Escape')`", "`if (event.value === 'Escape')`", "`if (event === 'Escape')`"],
              answer: 0,
              explain: '`event.key` holds the name of the key. `event.target` is the element, and the event itself is an object, never a string.',
            },
            {
              type: 'task',
              title: 'An FAQ accordion',
              body: `
                Each answer is hidden until its \`.faq\` box has the class \`open\` (that's in the locked CSS).

                1. Loop over the questions with \`forEach\`. When a question is clicked, toggle \`open\` on its **parent**: \`question.parentElement\` is the element that contains it, the \`.faq\` box.
                2. When **Escape** is pressed anywhere, close every \`.faq\`. Listen for \`'keydown'\` on \`document\`, and check \`event.key\`.
              `,
              html: `
                <h2>Questions</h2>
                <div class="faq">
                  <button class="question">Do you deliver?</button>
                  <div class="answer">Yes, anywhere in the UK. Free on orders over £30.</div>
                </div>
                <div class="faq">
                  <button class="question">How long do the candles burn?</button>
                  <div class="answer">About 40 hours.</div>
                </div>
                <div class="faq">
                  <button class="question">Can I return an order?</button>
                  <div class="answer">Yes, within 30 days if it's unused.</div>
                </div>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .faq { border-bottom: 1px solid #ddd; }
                .question { width: 100%; text-align: left; padding: 12px; font: inherit; font-weight: bold; background: none; border: 0; cursor: pointer; }
                .answer { display: none; padding: 0 12px 12px; color: #444; }
                .faq.open .answer { display: block; }
              `,
              js: `
                const questions = document.querySelectorAll('.question');
                const faqs = document.querySelectorAll('.faq');

                // 1. For each question: on click, toggle 'open' on question.parentElement

                // 2. On document keydown: if the key is 'Escape', remove 'open' from every faq

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Clicking a question shows its answer',
                  test: (c) => {
                    c.click(c.$$('.question')[0]);
                    return shown(c, c.$$('.answer')[0]);
                  },
                },
                {
                  text: 'The other answers stay hidden',
                  test: (c) => {
                    const a = c.$$('.answer');
                    return shown(c, a[0]) && !shown(c, a[1]) && !shown(c, a[2]);
                  },
                },
                {
                  text: 'Clicking the same question again hides it',
                  test: (c) => {
                    const q2 = c.$$('.question')[1];
                    const a2 = c.$$('.answer')[1];
                    const before = shown(c, a2);
                    c.click(q2);
                    const mid = shown(c, a2);
                    c.click(q2);
                    return mid !== before && shown(c, a2) === before;
                  },
                },
                {
                  text: 'Other keys leave the answers open',
                  test: (c) => {
                    const a1 = c.$$('.answer')[0];
                    if (!shown(c, a1)) c.click(c.$$('.question')[0]);
                    c.key('body', 'Enter');
                    return shown(c, a1) || 'Pressing Enter closed the answers. Only close them when `event.key` is `\'Escape\'`.';
                  },
                },
                {
                  text: 'Pressing Escape closes every answer',
                  test: (c) => {
                    const a = c.$$('.answer');
                    if (!shown(c, a[2])) c.click(c.$$('.question')[2]);
                    if (!shown(c, a[0]) || !shown(c, a[2])) return false;
                    c.key('body', 'Escape');
                    return a.every((x) => !shown(c, x));
                  },
                },
              ],
              hint: "The click part:\n\n```js\nquestions.forEach((question) => {\n  question.addEventListener('click', () => {\n    question.parentElement.classList.toggle('open');\n  });\n});\n```\n\nThe Escape part has the same shape: `document.addEventListener('keydown', (event) => { … })`, with an `if` inside and `faqs.forEach` to remove the class.",
              solution: {
                js: `
                  const questions = document.querySelectorAll('.question');
                  const faqs = document.querySelectorAll('.faq');

                  questions.forEach((question) => {
                    question.addEventListener('click', () => {
                      question.parentElement.classList.toggle('open');
                    });
                  });

                  document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                      faqs.forEach((faq) => {
                        faq.classList.remove('open');
                      });
                    }
                  });
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "`el.addEventListener('click', fn)` runs `fn` every time the event happens. Pass the function itself, without `()`.",
                'The listener receives an **event object**: `event.target` is the element, `event.key` the key pressed.',
                "`'input'` fires on every change to a text box; read the text from `.value`. `'keydown'` fires on key presses.",
                'For show/hide (menus, accordions), let CSS define the open state and **toggle a class** from JavaScript.',
                'To give many elements the same behaviour, `querySelectorAll` them and add a listener inside `forEach`.',
              ],
            },
          ],
        },

        /* ── 18 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-dom-create',
          title: 'Creating elements',
          minutes: 10,
          steps: [
            {
              type: 'brief',
              title: 'Making new elements',
              body: `
                JavaScript can build new elements, not just change existing ones. It's three moves: **create**, **fill in**, **put it on the page**.

                \`\`\`js
                const li = document.createElement('li');   // a new <li>, not on the page yet
                li.textContent = 'Oat milk latte';
                li.classList.add('special');

                const menu = document.querySelector('#menu');
                menu.append(li);    // add it as the last thing inside #menu
                \`\`\`

                - \`parent.append(el)\` adds at the **end**. \`parent.prepend(el)\` adds at the **start**.
                - \`append\` takes several at once: \`card.append(title, price)\`.
                - \`el.remove()\` takes an element off the page.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: 'Press **Run**, then click the button a few times. Try changing `append` to `prepend`.',
              html: `
                <ul id="reviews">
                  <li>Lovely candles, fast delivery. — Priya</li>
                </ul>
                <button id="add">Add a review</button>
              `,
              js: `
                const list = document.querySelector('#reviews');
                const button = document.querySelector('#add');

                button.addEventListener('click', () => {
                  const li = document.createElement('li');
                  li.textContent = 'Smells amazing. — Tom';
                  list.append(li);
                });
              `,
              active: 'js',
            },
            {
              type: 'quiz',
              q: "You wrote `const li = document.createElement('li'); li.textContent = 'Flat white';` but nothing appears on the page. Why?",
              options: [
                "It hasn't been added to the page yet: call `append` or `prepend` on a parent.",
                '`textContent` only works on elements that are already on the page.',
                "`createElement` needs the angle brackets: `createElement('<li>')`.",
                'You need to reload the page first.',
              ],
              answer: 0,
              explain: 'A new element lives only in memory until you put it somewhere with `append` or `prepend`.',
            },
            {
              type: 'task',
              title: "Update today's menu",
              body: `
                1. Create an \`<li>\` that says **Pumpkin spice latte**, give it the class \`special\`, and add it to the **start** of \`#menu\`.
                2. Create an \`<li>\` that says **Hot chocolate** and add it to the **end**.
                3. The iced mocha has sold out: remove \`#sold-out\`.
              `,
              html: `
                <h2>Today's menu</h2>
                <ul id="menu">
                  <li>Flat white</li>
                  <li>Cappuccino</li>
                  <li id="sold-out">Iced mocha</li>
                </ul>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .special { color: darkorange; font-weight: bold; }
              `,
              js: `
                const menu = document.querySelector('#menu');

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'The first item is *Pumpkin spice latte*',
                  test: (c) => {
                    const first = c.$('#menu li');
                    return /^pumpkin spice latte$/i.test(txt(first)) || 'The first item is "' + txt(first) + '". Use `prepend` to add at the start.';
                  },
                },
                { text: 'It has the class `special`', test: (c) => c.$('#menu li').classList.contains('special') },
                {
                  text: 'The last item is *Hot chocolate*',
                  test: (c) => {
                    const items = c.$$('#menu li');
                    return /^hot chocolate$/i.test(txt(items[items.length - 1]));
                  },
                },
                { text: 'The iced mocha is gone', test: (c) => !c.$('#sold-out') && !/iced mocha/i.test(c.text('#menu')) },
                { text: 'Uses `createElement`', test: (c) => /createElement\s*\(/.test(c.src('js')) },
              ],
              hint: "For the first item:\n\n```js\nconst latte = document.createElement('li');\nlatte.textContent = 'Pumpkin spice latte';\nlatte.classList.add('special');\nmenu.prepend(latte);\n```\n\nFor the last step, select `#sold-out` and call `.remove()` on it.",
              solution: {
                js: `
                  const menu = document.querySelector('#menu');

                  const latte = document.createElement('li');
                  latte.textContent = 'Pumpkin spice latte';
                  latte.classList.add('special');
                  menu.prepend(latte);

                  const chocolate = document.createElement('li');
                  chocolate.textContent = 'Hot chocolate';
                  menu.append(chocolate);

                  document.querySelector('#sold-out').remove();
                `,
              },
            },
            {
              type: 'brief',
              title: 'Building a page from data',
              body: `
                Here is where it clicks. Keep your products in an **array of objects**, then loop over it and build one element per product:

                \`\`\`js
                const products = [
                  { name: 'Lavender Candle', price: 12 },
                  { name: 'Oat Milk Soap', price: 6 },
                ];
                const list = document.querySelector('#products');

                products.forEach((product) => {
                  const li = document.createElement('li');
                  li.textContent = product.name + ': £' + product.price;
                  list.append(li);
                });
                \`\`\`

                Add a product to the array and the page grows by one card. No HTML to copy and paste. This is how shop grids, blog lists and search results are made.
              `,
            },
            {
              type: 'fill',
              q: 'Build one list item per product.',
              code: `
                products.forEach((product) => {
                  const li = document.[[createElement]]('li');
                  li.textContent = product.name;
                  list.[[append]](li);
                });
              `,
              options: ['createElement', 'append', 'push', 'newElement', 'add'],
              explain: '`push` adds to an **array**. `append` adds to an **element** on the page.',
            },
            {
              type: 'task',
              title: 'Product cards',
              body: `
                For each product in the array, build this and append it to \`#products\`:

                \`\`\`html
                <div class="card">
                  <h3>Lavender Candle</h3>
                  <p class="price">£12</p>
                </div>
                \`\`\`

                Create the \`div\`, the \`h3\` and the \`p\`, fill them in, put the \`h3\` and \`p\` inside the \`div\` with \`card.append(title, price)\`, then append the card to the grid.
              `,
              html: `<div id="products" class="grid"></div>`,
              css: `
                body { font-family: system-ui, sans-serif; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
                .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
                .card h3 { margin: 0 0 6px; font-size: 16px; }
                .price { margin: 0; color: #2a7d4f; font-weight: bold; }
              `,
              js: `
                const products = [
                  { name: 'Lavender Candle', price: 12 },
                  { name: 'Fig and Cedar Candle', price: 14 },
                  { name: 'Oat Milk Soap', price: 6 },
                  { name: 'Sea Salt Candle', price: 12 },
                ];
                const grid = document.querySelector('#products');

                // For each product: create a div.card with an h3 and a p.price inside,
                // then append the card to grid.

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'There are 4 cards',
                  test: (c) => {
                    const n = c.$$('#products .card').length;
                    return n === 4 || (n ? 'There are ' + n + ' cards.' : false);
                  },
                },
                {
                  text: 'Each card has an `<h3>` with the product name, in order',
                  test: (c) => {
                    const names = c.$$('#products .card h3').map(txt);
                    return names.join('|') === 'Lavender Candle|Fig and Cedar Candle|Oat Milk Soap|Sea Salt Candle';
                  },
                },
                {
                  text: 'Each card has a `.price` like *£12*',
                  test: (c) => {
                    const prices = c.$$('#products .card .price').map(txt);
                    if (prices.join('|') === '£12|£14|£6|£12') return true;
                    return prices.length ? 'The prices say: ' + prices.join(', ') : false;
                  },
                },
                { text: 'The cards are built in a loop with `createElement`', test: (c) => /createElement/.test(c.src('js')) && /forEach|for\s*\(/.test(c.src('js')) },
              ],
              hint: "Inside `products.forEach((product) => { … })`:\n\n```js\nconst card = document.createElement('div');\ncard.classList.add('card');\nconst title = document.createElement('h3');\ntitle.textContent = product.name;\n```\n\nThen the same for the price (with `'£' + product.price`), `card.append(title, price)` and `grid.append(card)`.",
              solution: {
                js: `
                  const products = [
                    { name: 'Lavender Candle', price: 12 },
                    { name: 'Fig and Cedar Candle', price: 14 },
                    { name: 'Oat Milk Soap', price: 6 },
                    { name: 'Sea Salt Candle', price: 12 },
                  ];
                  const grid = document.querySelector('#products');

                  products.forEach((product) => {
                    const card = document.createElement('div');
                    card.classList.add('card');

                    const title = document.createElement('h3');
                    title.textContent = product.name;

                    const price = document.createElement('p');
                    price.classList.add('price');
                    price.textContent = '£' + product.price;

                    card.append(title, price);
                    grid.append(card);
                  });
                `,
              },
            },
            {
              type: 'brief',
              title: 'The shortcut: template literals and innerHTML',
              body: `
                For lots of HTML, you'll often see this pattern instead:

                \`\`\`js
                list.innerHTML = hours
                  .map((h) => \`<li><strong>\${h.day}</strong> \${h.time}</li>\`)
                  .join('');
                \`\`\`

                - \`map\` turns each object into a string of HTML.
                - \`.join('')\` glues the array of strings into one string, with nothing between them. (Without it, you'd get commas on the page.)
                - \`innerHTML\` turns that string into elements, all at once.

                It's short and readable. The catches:

                - It **replaces** everything inside the element. Good for a fresh render; setting \`innerHTML = ''\` is a quick way to empty an element.
                - Only use it with data **you** control, like your own product list. Anything a visitor typed goes through \`textContent\`.
                - You can't add listeners while building the string. You'd have to select the new elements afterwards.
              `,
            },
            {
              type: 'quiz',
              q: 'When is the template literal + `innerHTML` pattern a **bad** idea?',
              options: [
                'Showing reviews that visitors typed into a form',
                'Showing your own list of opening hours',
                'Showing products from an array in your own code',
              ],
              answer: 0,
              explain: "Visitors' text could contain HTML tags (or a script attack), and `innerHTML` would build them. For their text, use `createElement` and `textContent`.",
            },
            {
              type: 'task',
              title: 'Opening hours',
              body: `
                Use \`map\`, a template literal and \`.join('')\` to build one \`<li>\` per day, then set \`list.innerHTML\` to the result. Each item should look like this:

                \`\`\`html
                <li><strong>Monday</strong> Closed</li>
                \`\`\`
              `,
              html: `
                <h2>Opening hours</h2>
                <ul id="hours"></ul>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                #hours { list-style: none; padding: 0; }
                #hours li { padding: 6px 0; border-bottom: 1px solid #eee; }
                #hours strong { display: inline-block; width: 110px; }
              `,
              js: `
                const hours = [
                  { day: 'Monday', time: 'Closed' },
                  { day: 'Tuesday', time: '9am to 5pm' },
                  { day: 'Wednesday', time: '9am to 5pm' },
                  { day: 'Thursday', time: '9am to 8pm' },
                  { day: 'Friday', time: '9am to 5pm' },
                  { day: 'Saturday', time: '8am to 4pm' },
                ];
                const list = document.querySelector('#hours');

                // list.innerHTML = hours.map(…).join('');

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'There are 6 list items',
                  test: (c) => {
                    const n = c.$$('#hours li').length;
                    return n === 6 || (n ? 'There are ' + n + ' items.' : false);
                  },
                },
                {
                  text: 'Each item starts with the day in `<strong>`',
                  test: (c) => c.$$('#hours li strong').map(txt).join('|') === 'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday',
                },
                {
                  text: 'Each item shows the times',
                  test: (c) => {
                    const li = c.$$('#hours li').map(txt);
                    return li.length === 6 && /closed/i.test(li[0]) && /9am to 8pm/.test(li[3]) && /8am to 4pm/.test(li[5]);
                  },
                },
                {
                  text: "No stray commas (`.join('')` is there)",
                  test: (c) => (c.$$('#hours li').length > 0 && !c.text('#hours').includes(',')) || (c.text('#hours').includes(',') ? "There are commas between the items. Add `.join('')` after the `map`." : false),
                },
                { text: 'Uses a template literal and `innerHTML`', test: (c) => /`/.test(c.src('js')) && /\.innerHTML\s*=/.test(c.src('js')) },
              ],
              hint: "The whole thing is one statement:\n\n```js\nlist.innerHTML = hours\n  .map((h) => `<li><strong>${h.day}</strong> ${h.time}</li>`)\n  .join('');\n```",
              solution: {
                js: `
                  const hours = [
                    { day: 'Monday', time: 'Closed' },
                    { day: 'Tuesday', time: '9am to 5pm' },
                    { day: 'Wednesday', time: '9am to 5pm' },
                    { day: 'Thursday', time: '9am to 8pm' },
                    { day: 'Friday', time: '9am to 5pm' },
                    { day: 'Saturday', time: '8am to 4pm' },
                  ];
                  const list = document.querySelector('#hours');

                  list.innerHTML = hours
                    .map((h) => \`<li><strong>\${h.day}</strong> \${h.time}</li>\`)
                    .join('');
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "`document.createElement('li')` makes a new element. It isn't on the page until you `append` or `prepend` it to a parent.",
                '`parent.append(a, b)` adds at the end, `parent.prepend(a)` at the start; `el.remove()` takes an element away.',
                'Keep data in an **array of objects** and build the page from it with a loop: change the data, and the page follows.',
                "Shortcut: `el.innerHTML = items.map(…).join('')`, with the `map` returning a template literal of HTML. Without `.join('')` you get commas.",
                "`innerHTML` replaces everything inside, and is only for data you control. Visitors' text goes in `textContent`.",
              ],
            },
          ],
        },

        /* ── 19 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-forms',
          title: 'Forms and validation',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'Handling a form',
              body: `
                Three things you need for any form:

                \`\`\`js
                const form = document.querySelector('#signup');
                const emailInput = document.querySelector('#email');

                form.addEventListener('submit', (event) => {
                  event.preventDefault();
                  const email = emailInput.value.trim();
                  console.log('Signing up', email);
                });
                \`\`\`

                - Listen for \`'submit'\` on the **form**, not \`'click'\` on the button. It also catches the visitor pressing Enter.
                - \`event.preventDefault()\` stops the browser's default action. For a form, that's sending it off and **loading a new page**, which would wipe out anything your JavaScript did.
                - \`.value\` is what's in the box, always as a string. \`.trim()\` removes spaces from both ends, so a box with only spaces counts as empty.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: 'Press **Run**, type an email (with some spaces around it) and press **Sign up** or Enter.',
              html: `
                <form id="signup">
                  <label>Email <input id="email"></label>
                  <button>Sign up</button>
                </form>
              `,
              js: `
                const form = document.querySelector('#signup');
                const emailInput = document.querySelector('#email');

                form.addEventListener('submit', (event) => {
                  event.preventDefault();
                  const email = emailInput.value.trim();
                  console.log('Signing up', email);
                });
              `,
              active: 'js',
            },
            {
              type: 'quiz',
              q: 'Why call `event.preventDefault()` in a submit listener?',
              options: [
                'Otherwise the browser sends the form and loads a new page, undoing what your code did',
                'Otherwise the submit event never fires',
                'It empties the form after sending',
                'It checks that every field is filled in',
              ],
              answer: 0,
              explain: "Submitting a form normally navigates to a new page. `preventDefault()` keeps the visitor where they are, so your code can check the form and show messages. It doesn't do any checking itself.",
            },
            {
              type: 'task',
              title: 'Newsletter sign-up',
              body: `
                When the form is submitted:

                1. Stop the page reload.
                2. Read the email and trim it.
                3. Show this in \`#msg\` (use \`textContent\`, since the visitor typed it): **Thanks! We'll send offers to** *the email*
              `,
              html: `
                <form id="signup">
                  <label>Email <input id="email"></label>
                  <button>Sign up</button>
                </form>
                <p id="msg"></p>
              `,
              js: `
                const form = document.querySelector('#signup');
                const emailInput = document.querySelector('#email');
                const msg = document.querySelector('#msg');

                // On submit: preventDefault, read and trim the email, show the message

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Submitting shows the thank-you with the email',
                  test: (c) => {
                    c.type('#email', 'sam@example.com');
                    c.submit('#signup');
                    return (/thanks/i.test(c.text('#msg')) && c.text('#msg').includes('sam@example.com')) || (c.text('#msg') ? '#msg says "' + c.text('#msg') + '".' : false);
                  },
                },
                {
                  text: 'The page reload is prevented',
                  test: (c) => {
                    let prevented = null;
                    c.doc.addEventListener('submit', (e) => (prevented = e.defaultPrevented), { once: true });
                    c.type('#email', 'sam@example.com');
                    c.submit('#signup');
                    return prevented === true || 'Call `event.preventDefault()` in your submit listener.';
                  },
                },
                {
                  text: 'Spaces around the email are trimmed',
                  test: (c) => {
                    c.type('#email', '   jo@example.com   ');
                    c.submit('#signup');
                    const t = c.$('#msg').textContent;
                    return (t.includes('jo@example.com') && !/\s{2}jo@|jo@example\.com\s/.test(t)) || (t.includes('jo@') ? 'The spaces are still there. Use `.trim()` on the value.' : false);
                  },
                },
                {
                  text: 'What the visitor typed is shown as text, not HTML',
                  test: (c) => {
                    c.type('#email', '<b>hi</b>@example.com');
                    c.submit('#signup');
                    if (c.$('#msg b')) return 'The <b> tag became a real element. Use `textContent`, not `innerHTML`.';
                    return c.text('#msg').includes('<b>hi</b>@example.com');
                  },
                },
              ],
              hint: "```js\nform.addEventListener('submit', (event) => {\n  event.preventDefault();\n  const email = emailInput.value.trim();\n  msg.textContent = \"Thanks! We'll send offers to \" + email;\n});\n```\n\nThe message has an apostrophe in it, so wrap it in double quotes or backticks.",
              solution: {
                js: `
                  const form = document.querySelector('#signup');
                  const emailInput = document.querySelector('#email');
                  const msg = document.querySelector('#msg');

                  form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const email = emailInput.value.trim();
                    msg.textContent = \`Thanks! We'll send offers to \${email}\`;
                  });
                `,
              },
            },
            {
              type: 'brief',
              title: 'Validation',
              body: `
                **Validation** means checking the form before accepting it, and telling the visitor what to fix. The pattern:

                1. **Clear** the old error messages.
                2. **Check** each rule. If one fails, show a message next to that field.
                3. Only if everything passed, carry on.

                Common rules:

                | Rule | Check that fails |
                |---|---|
                | Not empty | \`name === ''\` |
                | Looks like an email | \`!email.includes('@')\` |
                | Long enough | \`message.length < 10\` |

                \`!\` means "not", so \`!email.includes('@')\` is true when there's **no** @.

                > Checks in the browser help the visitor, but anyone can switch them off. A real site checks again on the server before trusting the data.
              `,
            },
            {
              type: 'fill',
              q: 'Complete the email check.',
              code: `
                form.addEventListener('submit', (event) => {
                  event.[[preventDefault]]();
                  const email = emailInput.[[value]].trim();
                  if (!email.[[includes]]('@')) {
                    emailError.textContent = 'Please enter a valid email address.';
                  }
                });
              `,
              options: ['preventDefault', 'value', 'includes', 'stop', 'text', 'contains'],
            },
            {
              type: 'task',
              title: 'Validate the contact form',
              body: `
                Finish the submit listener. The rules:

                - **Name** can't be empty. Error: *Please enter your name.*
                - **Email** must contain an @. Error: *Please enter a valid email address.*
                - **Message** must be at least 10 characters. Error: *Your message is too short.*

                Each error goes in the \`<p>\` under its field. Clear all errors (and \`#thanks\`) at the start, so fixed fields lose their message. If everything passes, show **Thanks, *name*. We'll be in touch.** in \`#thanks\`.

                The form has \`novalidate\`, which turns off the browser's own pop-up checks so that your code does the checking.
              `,
              html: `
                <form id="contact" novalidate>
                  <label>Name <input id="name"></label>
                  <p class="error" id="name-error"></p>
                  <label>Email <input id="email" type="email"></label>
                  <p class="error" id="email-error"></p>
                  <label>Message <textarea id="message"></textarea></label>
                  <p class="error" id="message-error"></p>
                  <button>Send</button>
                </form>
                <p id="thanks"></p>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                label { display: block; margin-top: 8px; }
                input, textarea { display: block; width: 100%; max-width: 320px; padding: 6px; font: inherit; box-sizing: border-box; }
                .error { color: crimson; font-size: 14px; margin: 4px 0 0; min-height: 1em; }
                #thanks { color: #2a7d4f; font-weight: bold; }
              `,
              js: `
                const form = document.querySelector('#contact');
                const nameInput = document.querySelector('#name');
                const emailInput = document.querySelector('#email');
                const messageInput = document.querySelector('#message');
                const nameError = document.querySelector('#name-error');
                const emailError = document.querySelector('#email-error');
                const messageError = document.querySelector('#message-error');
                const thanks = document.querySelector('#thanks');

                form.addEventListener('submit', (event) => {
                  event.preventDefault();
                  // 1. Clear the three error messages and #thanks

                  const name = nameInput.value.trim();
                  const email = emailInput.value.trim();
                  const message = messageInput.value.trim();
                  let ok = true;

                  // 2. Name empty?                   -> show nameError, set ok = false
                  // 3. Email has no @?               -> show emailError, set ok = false
                  // 4. Message under 10 characters?  -> show messageError, set ok = false

                  // 5. If ok is still true, show the thank-you in #thanks
                });
              `,
              edit: ['js'],
              active: 'js',
              checks: (() => {
                const send = (c, name, email, message) => {
                  c.type('#name', name);
                  c.type('#email', email);
                  c.type('#message', message);
                  c.submit('#contact');
                };
                const GOOD = 'Hello, could I get a quote for a wedding order?';
                return [
                  {
                    text: 'An empty name shows an error',
                    test: (c) => {
                      send(c, '   ', 'sam@example.com', GOOD);
                      if (!c.text('#name-error')) return false;
                      return !c.text('#thanks') || 'The thank-you appeared even though the name is empty. Only show it when `ok` is still true.';
                    },
                  },
                  {
                    text: 'An email without @ shows an error',
                    test: (c) => {
                      send(c, 'Sam', 'sam.example.com', GOOD);
                      return !!c.text('#email-error');
                    },
                  },
                  {
                    text: 'A message under 10 characters shows an error',
                    test: (c) => {
                      send(c, 'Sam', 'sam@example.com', 'Hi there');
                      return !!c.text('#message-error');
                    },
                  },
                  {
                    text: 'Errors disappear once the fields are fixed',
                    test: (c) => {
                      send(c, '', 'nope', 'Hi');
                      const all = ['#name-error', '#email-error', '#message-error'];
                      if (!all.every((s) => c.text(s))) return false;
                      send(c, 'Sam', 'sam@example.com', GOOD);
                      const left = all.filter((s) => c.text(s));
                      return !left.length || 'Still showing: "' + c.text(left[0]) + '". Clear every error at the start of the listener.';
                    },
                  },
                  {
                    text: 'A valid form shows *Thanks, Sam. We\'ll be in touch.*',
                    test: (c) => {
                      send(c, 'Sam', 'sam@example.com', GOOD);
                      return /^thanks,? sam[.!]? we('|’)ll be in touch\.?$/i.test(c.text('#thanks')) || (c.text('#thanks') ? '#thanks says "' + c.text('#thanks') + '".' : false);
                    },
                  },
                ];
              })(),
              hint: "Clearing is one line per element, e.g. `nameError.textContent = '';`. Each rule is an `if`:\n\n```js\nif (name === '') {\n  nameError.textContent = 'Please enter your name.';\n  ok = false;\n}\n```\n\nAt the end: `if (ok) { thanks.textContent = …; }`",
              solution: {
                js: `
                  const form = document.querySelector('#contact');
                  const nameInput = document.querySelector('#name');
                  const emailInput = document.querySelector('#email');
                  const messageInput = document.querySelector('#message');
                  const nameError = document.querySelector('#name-error');
                  const emailError = document.querySelector('#email-error');
                  const messageError = document.querySelector('#message-error');
                  const thanks = document.querySelector('#thanks');

                  form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    nameError.textContent = '';
                    emailError.textContent = '';
                    messageError.textContent = '';
                    thanks.textContent = '';

                    const name = nameInput.value.trim();
                    const email = emailInput.value.trim();
                    const message = messageInput.value.trim();
                    let ok = true;

                    if (name === '') {
                      nameError.textContent = 'Please enter your name.';
                      ok = false;
                    }
                    if (!email.includes('@')) {
                      emailError.textContent = 'Please enter a valid email address.';
                      ok = false;
                    }
                    if (message.length < 10) {
                      messageError.textContent = 'Your message is too short.';
                      ok = false;
                    }

                    if (ok) {
                      thanks.textContent = \`Thanks, \${name}. We'll be in touch.\`;
                    }
                  });
                `,
              },
            },
            {
              type: 'quiz',
              q: 'A visitor submits with an empty name, sees the error, types their name and submits again. Why does your code clear all the errors **first**?',
              options: [
                'Otherwise the old "Please enter your name" message stays on screen even though it is fixed',
                'The browser refuses to submit a form while any error text is showing',
                'Clearing them is what makes `preventDefault()` work',
              ],
              answer: 0,
              explain: 'Your code only ever *sets* messages when a rule fails. Nothing would remove an old one, so you wipe them all at the start of each submit.',
            },
            {
              type: 'brief',
              title: 'Checking as they type',
              body: `
                You don't have to wait for submit. The \`'input'\` event fires on every keystroke, so you can give live feedback, like the password hints on sign-up pages.

                A button can be switched off with its \`disabled\` property:

                \`\`\`js
                button.disabled = true;    // greyed out, can't be clicked
                button.disabled = false;   // working again
                \`\`\`

                And a string's \`.length\` is how many characters it has: \`'abc'.length\` is \`3\`.
              `,
            },
            {
              type: 'task',
              title: 'Live password check',
              body: `
                On every \`'input'\` in \`#password\`:

                - If it is **shorter than 8 characters**: \`#hint\` says **Too short: 3 of 8 characters** (with the real count), and the button is disabled.
                - Otherwise: \`#hint\` says **Looks good** and the button is enabled.
              `,
              html: `
                <form id="register" novalidate>
                  <label>Choose a password <input id="password" type="password"></label>
                  <p id="hint"></p>
                  <button id="create" disabled>Create account</button>
                </form>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                #hint { font-size: 14px; color: #555; }
              `,
              js: `
                const password = document.querySelector('#password');
                const hint = document.querySelector('#hint');
                const button = document.querySelector('#create');

                // Listen for 'input' on password and update hint and button.disabled

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'A short password shows *Too short*',
                  test: (c) => {
                    c.type('#password', 'abc');
                    return /too short/i.test(c.text('#hint'));
                  },
                },
                {
                  text: 'The hint shows how many characters so far',
                  test: (c) => {
                    c.type('#password', 'abcde');
                    return /\b5 of 8\b/.test(c.text('#hint')) || (c.text('#hint') ? 'With 5 characters the hint says "' + c.text('#hint') + '". Use `password.value.length`.' : false);
                  },
                },
                {
                  text: 'At 8 or more characters it says *Looks good* and the button works',
                  test: (c) => {
                    c.type('#password', 'abcdefgh');
                    if (!/looks good/i.test(c.text('#hint'))) return false;
                    return !c.$('#create').disabled || 'The hint is right, but the button is still disabled. Set `button.disabled = false`.';
                  },
                },
                {
                  text: 'Deleting characters disables the button again',
                  test: (c) => {
                    c.type('#password', 'abcdefghij');
                    const on = !c.$('#create').disabled;
                    c.type('#password', 'abcd');
                    return on && c.$('#create').disabled && /too short/i.test(c.text('#hint'));
                  },
                },
              ],
              hint: "```js\npassword.addEventListener('input', () => {\n  const length = password.value.length;\n  if (length < 8) {\n    hint.textContent = `Too short: ${length} of 8 characters`;\n    button.disabled = true;\n  } else {\n    // …\n  }\n});\n```",
              solution: {
                js: `
                  const password = document.querySelector('#password');
                  const hint = document.querySelector('#hint');
                  const button = document.querySelector('#create');

                  password.addEventListener('input', () => {
                    const length = password.value.length;
                    if (length < 8) {
                      hint.textContent = \`Too short: \${length} of 8 characters\`;
                      button.disabled = true;
                    } else {
                      hint.textContent = 'Looks good';
                      button.disabled = false;
                    }
                  });
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "Listen for `'submit'` on the **form** (it catches Enter too), and call `event.preventDefault()` first to stop the page reloading.",
                "`input.value` is the text in a box, always a string. `.trim()` it so spaces-only counts as empty.",
                "Validation pattern: clear old errors, check each rule with an `if`, show a message next to the field, and only continue if all passed.",
                "Typical rules: `value === ''`, `!email.includes('@')`, `value.length < 10`.",
                "The `'input'` event gives live feedback as they type; `button.disabled = true` switches a button off.",
                'Browser checks are a convenience. A real site validates again on the server.',
              ],
            },
          ],
        },
      ],
    },

    {
      title: 'Real-world operations',
      missions: [
        /* ── 20 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-timers',
          title: 'Timers and dates',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'Doing something later',
              body: `
                \`setTimeout\` runs a function **once**, after a delay in milliseconds (1000 ms = 1 second):

                \`\`\`js
                setTimeout(() => {
                  console.log('Two seconds later');
                }, 2000);

                console.log('This prints first');
                \`\`\`

                It does **not** pause your code. JavaScript sets the timer, carries straight on, and comes back to run the function when the time is up.

                Typical uses: hiding a "Saved" message after a few seconds, or showing a newsletter pop-up after the visitor has been reading for a while.
              `,
            },
            {
              type: 'exhibit',
              title: 'A message that hides itself',
              body: 'Press **Run**, then click **Save**. Change `1500` to a different delay and try again.',
              html: `
                <button id="save">Save</button>
                <p id="toast" class="toast">Saved</p>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .toast { opacity: 0; transition: opacity 0.3s; background: #222; color: white; display: inline-block; padding: 8px 14px; border-radius: 6px; }
                .toast.show { opacity: 1; }
              `,
              js: `
                const button = document.querySelector('#save');
                const toast = document.querySelector('#toast');

                button.addEventListener('click', () => {
                  toast.classList.add('show');
                  setTimeout(() => {
                    toast.classList.remove('show');
                  }, 1500);
                });
              `,
              active: 'js',
            },
            {
              type: 'quiz',
              q: "In what order are the letters logged?\n\n```js\nconsole.log('A');\nsetTimeout(() => console.log('B'), 500);\nconsole.log('C');\n```",
              options: ['A, C, B', 'A, B, C', 'B, A, C', 'A, C (B never runs)'],
              answer: 0,
              shuffle: false,
              explain: '`setTimeout` schedules B for later and the code carries on, so C prints straight away. Half a second later, B prints.',
            },
            {
              type: 'task',
              title: '"Added to basket" message',
              body: `
                When \`#add\` is clicked:

                1. Set \`#toast\`'s text to **Added to basket** and add the class \`show\`.
                2. After **300 ms**, remove \`show\` again.

                A real site would wait 2 or 3 seconds. 300 ms keeps the check quick.
              `,
              html: `
                <button id="add">Add to basket</button>
                <div id="toast" class="toast"></div>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .toast { display: none; margin-top: 10px; background: #222; color: white; padding: 8px 14px; border-radius: 6px; width: max-content; }
                .toast.show { display: block; }
              `,
              js: `
                const addButton = document.querySelector('#add');
                const toast = document.querySelector('#toast');

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Clicking shows *Added to basket*',
                  test: (c) => {
                    c.click('#add');
                    return (shown(c, c.$('#toast')) && /added to basket/i.test(c.text('#toast'))) || (shown(c, c.$('#toast')) ? 'It shows, but says "' + c.text('#toast') + '".' : false);
                  },
                },
                {
                  text: "It's still showing a moment later",
                  test: async (c) => {
                    await c.wait(120);
                    return shown(c, c.$('#toast')) || 'It disappeared almost at once. Is the delay 300?';
                  },
                },
                {
                  text: 'It hides itself after 300 ms',
                  test: async (c) => {
                    await c.wait(400);
                    return !shown(c, c.$('#toast'));
                  },
                },
              ],
              hint: "Inside the click listener, show the toast, then:\n\n```js\nsetTimeout(() => {\n  toast.classList.remove('show');\n}, 300);\n```",
              solution: {
                js: `
                  const addButton = document.querySelector('#add');
                  const toast = document.querySelector('#toast');

                  addButton.addEventListener('click', () => {
                    toast.textContent = 'Added to basket';
                    toast.classList.add('show');
                    setTimeout(() => {
                      toast.classList.remove('show');
                    }, 300);
                  });
                `,
              },
            },
            {
              type: 'brief',
              title: 'Repeating: setInterval',
              body: `
                \`setInterval\` runs a function **again and again**, every so many milliseconds. It gives back an id; pass that to \`clearInterval\` to stop it.

                \`\`\`js
                let seconds = 10;

                const timer = setInterval(() => {
                  seconds = seconds - 1;
                  display.textContent = seconds;
                  if (seconds === 0) {
                    clearInterval(timer);
                  }
                }, 1000);
                \`\`\`

                Forget the \`clearInterval\` and the countdown carries on into -1, -2, -3…
              `,
            },
            {
              type: 'fill',
              q: 'Count down every second and stop at zero.',
              code: `
                const timer = [[setInterval]](() => {
                  seconds = seconds - 1;
                  display.textContent = seconds;
                  if (seconds === 0) {
                    [[clearInterval]](timer);
                  }
                }, 1000);
              `,
              options: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'stopInterval'],
            },
            {
              type: 'task',
              title: 'Countdown to the sale',
              body: `
                Count \`#count\` down from 5 to 0, one step every **100 ms** (sped up so the check is quick; a real countdown would use 1000).

                When it reaches 0, stop the interval and show **The sale is live!** in \`#message\`.
              `,
              html: `
                <p class="sign">Sale starts in <span id="count">5</span></p>
                <p id="message"></p>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .sign { font-size: 22px; }
                #count { font-weight: bold; color: crimson; }
                #message { font-size: 22px; font-weight: bold; color: #2a7d4f; }
              `,
              js: `
                const count = document.querySelector('#count');
                const message = document.querySelector('#message');
                let seconds = 5;

                // Every 100 ms: take 1 off seconds and show it in #count.
                // At 0: clearInterval, then show the message.

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'The number counts down',
                  test: async (c) => {
                    const first = Number(c.text('#count'));
                    await c.wait(250);
                    return Number(c.text('#count')) < first;
                  },
                },
                {
                  text: 'It reaches 0',
                  test: async (c) => {
                    await c.wait(600);
                    return c.text('#count') === '0' || '#count says "' + c.text('#count') + '".';
                  },
                },
                {
                  text: 'It stops at 0',
                  test: async (c) => {
                    await c.wait(250);
                    return c.text('#count') === '0' || 'It went on to ' + c.text('#count') + '. Call `clearInterval(timer)` when seconds reaches 0.';
                  },
                },
                { text: 'The message says *The sale is live!*', test: (c) => /^the sale is live!?$/i.test(c.text('#message')) },
              ],
              hint: "Keep the id: `const timer = setInterval(() => { … }, 100);`. Inside, take 1 off `seconds`, show it, then `if (seconds === 0) { clearInterval(timer); message.textContent = …; }`.",
              solution: {
                js: `
                  const count = document.querySelector('#count');
                  const message = document.querySelector('#message');
                  let seconds = 5;

                  const timer = setInterval(() => {
                    seconds = seconds - 1;
                    count.textContent = seconds;
                    if (seconds === 0) {
                      clearInterval(timer);
                      message.textContent = 'The sale is live!';
                    }
                  }, 100);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Dates and times',
              body: `
                \`new Date()\` gives you the current date and time, from the visitor's device:

                \`\`\`js
                const now = new Date();
                now.getHours();      // 0 to 23 (2:30pm gives 14)
                now.getMinutes();    // 0 to 59
                now.getDay();        // 0 = Sunday, 1 = Monday … 6 = Saturday
                now.getFullYear();   // e.g. 2026
                \`\`\`

                For an "Open now" badge, put the rule in a **function that takes the hour**, rather than reading the clock inside it:

                \`\`\`js
                function isOpen(hour) {
                  return hour >= 9 && hour < 17;
                }

                isOpen(10);                     // true
                isOpen(18);                     // false
                isOpen(new Date().getHours());  // depends on the time right now
                \`\`\`

                Now you can test it for any time of day without waiting until 5pm. That's exactly how the checks below test yours.
              `,
            },
            {
              type: 'quiz',
              q: 'What does `new Date().getHours()` return at 5:30pm?',
              options: ['`17`', '`5`', '`17.5`', "`'5:30pm'`"],
              answer: 0,
              explain: '`getHours()` uses the 24-hour clock and only gives whole hours. The 30 minutes are in `getMinutes()`.',
            },
            {
              type: 'task',
              title: 'Open-now badge',
              body: `
                The bakery is open from **9am to 5pm**, but closes for lunch from **1pm to 2pm**.

                1. Finish \`isOpen(hour)\`: return \`true\` for hours 9 to 16, except 13 (lunch). Return \`false\` otherwise.
                2. Below it, call \`isOpen\` with the current hour. If open, \`#badge\` says **Open now** and gets the class \`open\`. If not, it says **Closed** and gets the class \`closed\`.
              `,
              html: `<p class="shop">Crumb and Co. Bakery <span id="badge" class="badge"></span></p>`,
              css: `
                body { font-family: system-ui, sans-serif; }
                .badge { color: white; padding: 3px 10px; border-radius: 12px; font-size: 14px; margin-left: 6px; }
                .badge.open { background: #2a7d4f; }
                .badge.closed { background: #888; }
              `,
              js: `
                const badge = document.querySelector('#badge');

                function isOpen(hour) {
                  // Open for hours 9 to 16, but closed at 13 (lunch)
                }

                // Use isOpen(new Date().getHours()) to set up the badge

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Open in the morning (9am, 12pm)',
                  test: (c) => {
                    if (!c.fn('isOpen')) return false;
                    const r = c.call('isOpen', 9).result;
                    if (r === undefined) return 'isOpen(9) returned undefined. Did you forget `return`?';
                    return (r === true && c.call('isOpen', 12).result === true) || 'isOpen(9) gave ' + r + ' and isOpen(12) gave ' + c.call('isOpen', 12).result + '.';
                  },
                },
                {
                  text: 'Closed before 9am and from 5pm',
                  test: (c) => [0, 7, 8, 17, 18, 23].every((h) => c.call('isOpen', h).result === false) || 'Check isOpen(8) and isOpen(17): both should be false.',
                },
                {
                  text: 'Closed for lunch at 1pm, open again at 2pm',
                  test: (c) => {
                    const lunch = c.call('isOpen', 13).result;
                    if (lunch !== false) return 'isOpen(13) gave ' + lunch + '. It should be false.';
                    return (c.call('isOpen', 14).result === true && c.call('isOpen', 16).result === true) || 'isOpen(14) and isOpen(16) should be true.';
                  },
                },
                {
                  text: 'The badge matches the current time',
                  test: (c) => {
                    const open = c.call('isOpen', new c.win.Date().getHours()).result;
                    const b = c.$('#badge');
                    if (open) return (/^open now$/i.test(txt(b)) && b.classList.contains('open')) || 'Right now isOpen gives true, so the badge should say Open now and have the class open.';
                    return (/^closed$/i.test(txt(b)) && b.classList.contains('closed')) || 'Right now isOpen gives false, so the badge should say Closed and have the class closed.';
                  },
                },
              ],
              hint: "One way to write the rule:\n\n```js\nreturn hour >= 9 && hour < 17 && hour !== 13;\n```\n\nThen:\n\n```js\nif (isOpen(new Date().getHours())) {\n  badge.textContent = 'Open now';\n  badge.classList.add('open');\n} else {\n  // …\n}\n```",
              solution: {
                js: `
                  const badge = document.querySelector('#badge');

                  function isOpen(hour) {
                    return hour >= 9 && hour < 17 && hour !== 13;
                  }

                  if (isOpen(new Date().getHours())) {
                    badge.textContent = 'Open now';
                    badge.classList.add('open');
                  } else {
                    badge.textContent = 'Closed';
                    badge.classList.add('closed');
                  }
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`setTimeout(fn, ms)` runs `fn` once, later. Your code does not wait for it; it carries straight on.',
                '`const id = setInterval(fn, ms)` repeats `fn` every `ms`; `clearInterval(id)` stops it. Always plan how it stops.',
                '1000 ms = 1 second.',
                "`new Date()` is now, on the visitor's device. `getHours()` is 0–23, `getDay()` is 0 (Sunday) to 6.",
                'Put time rules in a function that **takes** the hour (`isOpen(hour)`) so you can test any time of day.',
              ],
            },
          ],
        },
        /* ── 21 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-storage',
          title: 'Saving data in the browser',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'localStorage',
              body: `
                Normally everything your code does is forgotten when the page reloads. \`localStorage\` is a small store in the browser that **remembers**, even after the visitor closes the tab and comes back next week.

                \`\`\`js
                localStorage.setItem('theme', 'dark');   // save
                localStorage.getItem('theme');           // 'dark'
                localStorage.removeItem('theme');        // delete
                localStorage.getItem('nothing-here');    // null (never saved)
                \`\`\`

                - It works in **pairs**: a key (the name) and a value.
                - Both are always **strings**. Save the number 3 and you get back \`'3'\`.
                - Each website gets its own store, in that browser only. It doesn't follow the visitor to their phone.
                - Never keep anything secret in it, like passwords: any script on the page can read it.
              `,
            },
            {
              type: 'exhibit',
              title: 'A visit counter',
              body: 'Press **Run** several times. The number keeps going up, because it is saved between runs. `Number(null)` is `0`, so the very first run gives 1.',
              js: `
                const visits = Number(localStorage.getItem('visits')) + 1;
                localStorage.setItem('visits', visits);
                console.log('You have run this', visits, 'times');
              `,
            },
            {
              type: 'quiz',
              q: "What does `localStorage.getItem('basket')` give you if nothing was ever saved under `'basket'`?",
              options: ['`null`', "`''` (an empty string)", '`undefined`', 'An error'],
              answer: 0,
              explain: 'A missing key gives `null`. That is why you check for it, or provide a fallback, on a first visit.',
            },
            {
              type: 'task',
              title: 'Remember the cookie banner',
              body: `
                Nobody wants to dismiss the same banner on every page.

                1. When **OK** is clicked: add the class \`hidden\` to the banner, and save \`'cookiesOk'\` as \`'yes'\`.
                2. When the page loads: if \`'cookiesOk'\` is \`'yes'\`, hide the banner straight away.

                The check reloads the page to make sure it remembers.
              `,
              html: `
                <div id="banner" class="banner">
                  We use cookies to remember your basket.
                  <button id="ok">OK</button>
                </div>
                <h1>Wick and Wax</h1>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .banner { background: #222; color: white; padding: 12px 16px; display: flex; gap: 12px; align-items: center; justify-content: space-between; border-radius: 6px; }
                .banner.hidden { display: none; }
              `,
              js: `
                const banner = document.querySelector('#banner');
                const okButton = document.querySelector('#ok');

                // 1. When OK is clicked: hide the banner and save 'cookiesOk' as 'yes'

                // 2. When the page loads: if 'cookiesOk' is 'yes', hide the banner

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Clicking OK hides the banner',
                  test: (c) => {
                    c.click('#ok');
                    return !shown(c, c.$('#banner'));
                  },
                },
                {
                  text: "The choice is saved as `'cookiesOk'`",
                  test: (c) => {
                    c.win.localStorage.removeItem('cookiesOk');
                    c.click('#ok');
                    const v = store(c, 'cookiesOk');
                    return v === 'yes' || (v === null ? "Nothing is saved under 'cookiesOk'." : "'cookiesOk' is saved as '" + v + "'. Save 'yes'.");
                  },
                },
                {
                  text: 'After a reload, the banner stays hidden',
                  test: async (c) => {
                    c.win.localStorage.setItem('cookiesOk', 'yes');
                    await reloadPage(c);
                    return !shown(c, q(c, '#banner')) || 'After reloading, the banner came back. Check localStorage when the page loads.';
                  },
                },
                {
                  text: 'With nothing saved, the banner shows',
                  test: async (c) => {
                    c.win.localStorage.removeItem('cookiesOk');
                    await reloadPage(c);
                    return shown(c, q(c, '#banner')) || 'The banner is hidden even though nothing is saved.';
                  },
                },
              ],
              hint: "The load check:\n\n```js\nif (localStorage.getItem('cookiesOk') === 'yes') {\n  banner.classList.add('hidden');\n}\n```\n\nThe click listener adds the same class and calls `localStorage.setItem('cookiesOk', 'yes')`.",
              solution: {
                js: `
                  const banner = document.querySelector('#banner');
                  const okButton = document.querySelector('#ok');

                  okButton.addEventListener('click', () => {
                    banner.classList.add('hidden');
                    localStorage.setItem('cookiesOk', 'yes');
                  });

                  if (localStorage.getItem('cookiesOk') === 'yes') {
                    banner.classList.add('hidden');
                  }
                `,
              },
            },
            {
              type: 'fill',
              q: 'Save the choice, then check it on the next visit.',
              code: `
                localStorage.[[setItem]]('cookiesOk', 'yes');

                if (localStorage.[[getItem]]('cookiesOk') === 'yes') {
                  banner.classList.add('hidden');
                }
              `,
              options: ['setItem', 'getItem', 'removeItem', 'save', 'get'],
            },
            {
              type: 'task',
              title: 'Dark mode that remembers',
              body: `
                \`document.body\` is the page's \`<body>\` element. The CSS turns the page dark when it has the class \`dark\`.

                1. When \`#theme-btn\` is clicked: toggle \`dark\` on \`document.body\`, then save the result under \`'theme'\`: \`'dark'\` if the class is now on, \`'light'\` if it's off.
                2. When the page loads: if the saved theme is \`'dark'\`, add the class.
              `,
              html: `
                <header class="top">
                  <strong>Crumb and Co.</strong>
                  <button id="theme-btn">Dark mode</button>
                </header>
                <p>Fresh bread every morning, from 7am.</p>
              `,
              css: `
                body { font-family: system-ui, sans-serif; background: white; color: #222; transition: background 0.2s; }
                body.dark { background: #151515; color: #eee; }
                .top { display: flex; justify-content: space-between; align-items: center; }
              `,
              js: `
                const themeButton = document.querySelector('#theme-btn');

                // 1. On click: toggle 'dark' on document.body, then save 'dark' or 'light' under 'theme'

                // 2. On load: if the saved theme is 'dark', add 'dark' to document.body

              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Clicking switches dark mode on and off',
                  test: (c) => {
                    const dark = () => c.doc.body.classList.contains('dark');
                    const s0 = dark();
                    c.click('#theme-btn');
                    const s1 = dark();
                    c.click('#theme-btn');
                    return s1 !== s0 && dark() === s0;
                  },
                },
                {
                  text: "The choice is saved under `'theme'`",
                  test: (c) => {
                    for (let i = 0; i < 2; i++) {
                      c.click('#theme-btn');
                      const want = c.doc.body.classList.contains('dark') ? 'dark' : 'light';
                      const got = store(c, 'theme');
                      if (got !== want) return got === null ? "Nothing is saved under 'theme'." : "The page is " + want + " but 'theme' is saved as '" + got + "'.";
                    }
                    return true;
                  },
                },
                {
                  text: 'Dark mode survives a reload',
                  test: async (c) => {
                    c.win.localStorage.setItem('theme', 'dark');
                    await reloadPage(c);
                    return q(c, 'body').classList.contains('dark') || "With 'dark' saved, the page loaded light. Check the saved theme when the page loads.";
                  },
                },
                {
                  text: 'Light mode survives a reload too',
                  test: async (c) => {
                    c.win.localStorage.setItem('theme', 'light');
                    await reloadPage(c);
                    return !q(c, 'body').classList.contains('dark');
                  },
                },
              ],
              hint: "After the toggle, ask which way it went:\n\n```js\nif (document.body.classList.contains('dark')) {\n  localStorage.setItem('theme', 'dark');\n} else {\n  localStorage.setItem('theme', 'light');\n}\n```\n\nThe load part is like the cookie banner.",
              solution: {
                js: `
                  const themeButton = document.querySelector('#theme-btn');

                  themeButton.addEventListener('click', () => {
                    document.body.classList.toggle('dark');
                    if (document.body.classList.contains('dark')) {
                      localStorage.setItem('theme', 'dark');
                    } else {
                      localStorage.setItem('theme', 'light');
                    }
                  });

                  if (localStorage.getItem('theme') === 'dark') {
                    document.body.classList.add('dark');
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'Saving arrays and objects',
              body: `
                localStorage only stores strings, so an array or object needs converting first. **JSON** is the text format for that:

                \`\`\`js
                const basket = ['Lavender Candle', 'Oat Milk Soap'];

                // save: array -> JSON text
                localStorage.setItem('basket', JSON.stringify(basket));
                // stored as: ["Lavender Candle","Oat Milk Soap"]

                // load: JSON text -> a real array again
                const saved = JSON.parse(localStorage.getItem('basket'));
                \`\`\`

                On a first visit there is nothing saved, so \`getItem\` gives \`null\` and \`JSON.parse(null)\` gives \`null\` too. Add a fallback with \`||\` ("or"):

                \`\`\`js
                let basket = JSON.parse(localStorage.getItem('basket')) || [];
                \`\`\`

                To forget it: \`localStorage.removeItem('basket')\`.
              `,
            },
            {
              type: 'quiz',
              q: "You run `localStorage.setItem('user', { name: 'Sam' })`. What does `localStorage.getItem('user')` give back?",
              options: ["`'[object Object]'`", "`{ name: 'Sam' }`", "`'{\"name\":\"Sam\"}'`", '`null`'],
              answer: 0,
              explain: 'Without `JSON.stringify`, the object is turned into a string the lazy way, which gives the useless text `[object Object]`. The data is lost.',
            },
            {
              type: 'fill',
              q: 'Save the basket, and load it back (or start empty).',
              code: `
                localStorage.setItem('basket', JSON.[[stringify]](basket));

                let saved = JSON.[[parse]](localStorage.getItem('basket')) || [];
              `,
              options: ['stringify', 'parse', 'toString', 'string', 'load'],
            },
            {
              type: 'task',
              title: 'A basket that survives a reload',
              body: `
                Most of the basket is written for you: \`render()\` draws it, and the buttons push items into \`basket\`. Add the storage:

                1. **Load**: start \`basket\` from what's saved under \`'basket'\`, or \`[]\` if nothing is.
                2. **Save**: finish \`save()\` so it stores \`basket\` as JSON.
                3. **Empty**: when \`#empty\` is clicked, set \`basket\` to \`[]\`, remove \`'basket'\` from localStorage, and call \`render()\`.
              `,
              html: `
                <button id="add-candle">Add candle</button>
                <button id="add-soap">Add soap</button>
                <p><strong>Basket (<span id="count">0</span>)</strong></p>
                <ul id="items"></ul>
                <button id="empty">Empty basket</button>
              `,
              css: `body { font-family: system-ui, sans-serif; }`,
              js: `
                const count = document.querySelector('#count');
                const list = document.querySelector('#items');

                // 1. Load the saved basket here (or [] if nothing is saved)
                let basket = [];

                function render() {
                  count.textContent = basket.length;
                  list.innerHTML = '';
                  basket.forEach((item) => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    list.append(li);
                  });
                }

                function save() {
                  // 2. Save basket under 'basket', as JSON
                }

                document.querySelector('#add-candle').addEventListener('click', () => {
                  basket.push('Lavender Candle');
                  save();
                  render();
                });

                document.querySelector('#add-soap').addEventListener('click', () => {
                  basket.push('Oat Milk Soap');
                  save();
                  render();
                });

                // 3. Empty basket button

                render();
              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: "Adding an item saves the basket as JSON under `'basket'`",
                  test: (c) => {
                    c.click('#add-candle');
                    const raw = store(c, 'basket');
                    if (raw === null) return "Nothing is saved under 'basket'.";
                    let arr;
                    try {
                      arr = JSON.parse(raw);
                    } catch (e) {
                      return "'basket' is saved as \"" + raw + '", which is not JSON. Use `JSON.stringify(basket)`.';
                    }
                    return (Array.isArray(arr) && arr.length === Number(c.text('#count')) && arr[arr.length - 1] === 'Lavender Candle') || 'The saved basket does not match what is on the page.';
                  },
                },
                {
                  text: 'The basket survives a reload',
                  test: async (c) => {
                    c.click('#add-soap');
                    const n = Number(c.text('#count'));
                    await reloadPage(c);
                    const after = Number(txt(q(c, '#count')));
                    return (after === n && qa(c, '#items li').length === n) || 'Before the reload there were ' + n + ' items; after it, ' + after + '. Load the basket with `JSON.parse` when the page starts.';
                  },
                },
                {
                  text: '*Empty basket* clears the page and the storage',
                  test: (c) => {
                    const btn = q(c, '#empty');
                    btn.click();
                    if (txt(q(c, '#count')) !== '0' || qa(c, '#items li').length) return false;
                    return store(c, 'basket') === null || "The page is empty, but 'basket' is still saved. Use `localStorage.removeItem('basket')`.";
                  },
                },
                {
                  text: 'A first visit, with nothing saved, starts empty',
                  test: async (c) => {
                    c.win.localStorage.removeItem('basket');
                    await reloadPage(c);
                    const errs = (c.win.__fm && c.win.__fm.errors) || [];
                    if (errs.length) return 'With nothing saved, the page shows an error: ' + errs[0] + ". Did you add `|| []`?";
                    return txt(q(c, '#count')) === '0';
                  },
                },
              ],
              hint: "Load:\n\n```js\nlet basket = JSON.parse(localStorage.getItem('basket')) || [];\n```\n\nSave: `localStorage.setItem('basket', JSON.stringify(basket));`\n\nEmpty: a click listener on `#empty` with three lines inside.",
              solution: {
                js: `
                  const count = document.querySelector('#count');
                  const list = document.querySelector('#items');

                  let basket = JSON.parse(localStorage.getItem('basket')) || [];

                  function render() {
                    count.textContent = basket.length;
                    list.innerHTML = '';
                    basket.forEach((item) => {
                      const li = document.createElement('li');
                      li.textContent = item;
                      list.append(li);
                    });
                  }

                  function save() {
                    localStorage.setItem('basket', JSON.stringify(basket));
                  }

                  document.querySelector('#add-candle').addEventListener('click', () => {
                    basket.push('Lavender Candle');
                    save();
                    render();
                  });

                  document.querySelector('#add-soap').addEventListener('click', () => {
                    basket.push('Oat Milk Soap');
                    save();
                    render();
                  });

                  document.querySelector('#empty').addEventListener('click', () => {
                    basket = [];
                    localStorage.removeItem('basket');
                    render();
                  });

                  render();
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "`localStorage.setItem('key', 'value')` saves, `getItem('key')` loads (or gives `null`), `removeItem('key')` deletes.",
                'Saved data survives reloads and closing the browser, but only in that browser, and only as **strings**.',
                "Arrays and objects: save with `JSON.stringify(x)`, load with `JSON.parse(text)`. Without it you get `'[object Object]'`.",
                "First visit fallback: `JSON.parse(localStorage.getItem('basket')) || []`.",
                'Pattern for remembered settings: save on change, read once when the page loads.',
                'Never store passwords or secrets in localStorage.',
              ],
            },
          ],
        },

        /* ── 22 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-async',
          title: 'Async code and fetch',
          minutes: 13,
          steps: [
            {
              type: 'brief',
              title: 'Things that take time',
              body: `
                Some jobs aren't instant: loading products from a server, taking a payment, reading a file. JavaScript doesn't freeze the page while it waits. Instead, the job gives you a **Promise** straight away: an object that means "I'll have the answer for you later".

                Later, the promise either:

                - **resolves**: here's your value (the products), or
                - **rejects**: it went wrong, here's an error (the server is down).

                The preview here has no internet, so these lessons use **pretend servers**: functions that behave like a real one, answering after a short delay.

                \`\`\`js
                function getProducts() {
                  return new Promise((resolve) => {
                    setTimeout(() => resolve(['Lavender Candle', 'Oat Milk Soap']), 500);
                  });
                }
                \`\`\`

                You won't need to write these, only use them.
              `,
            },
            {
              type: 'quiz',
              q: 'You call `const result = getProducts();` with the pretend server above. What is in `result` straight away?',
              options: ['A Promise. The products are not there yet', 'The array of products', '`undefined`', 'An error, because the data has not arrived'],
              answer: 0,
              explain: 'The function returns a promise immediately; the products arrive half a second later. You need a way to *wait* for it, which is next.',
            },
            {
              type: 'brief',
              title: 'async and await',
              body: `
                To wait for a promise, put \`await\` in front of it. \`await\` only works inside a function marked \`async\`:

                \`\`\`js
                async function showProducts() {
                  const products = await getProducts();   // waits here...
                  console.log(products.length);            // ...then carries on with the real value
                }

                showProducts();
                \`\`\`

                \`await\` pauses **only that function**. The rest of the page carries on: buttons still work, animations still run.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: 'Press **Run** and watch the order of the lines. The last line of code prints *before* the products arrive.',
              js: `
                // A pretend server: answers after half a second
                function getProducts() {
                  return new Promise((resolve) => {
                    setTimeout(() => resolve(['Lavender Candle', 'Oat Milk Soap', 'Sea Salt Candle']), 500);
                  });
                }

                async function showProducts() {
                  console.log('Loading…');
                  const products = await getProducts();
                  console.log('Got', products.length, 'products');
                  console.log(products);
                }

                showProducts();
                console.log('The page keeps working while it waits');
              `,
            },
            {
              type: 'fill',
              q: 'Wait for the reviews before logging them.',
              code: `
                [[async]] function loadReviews() {
                  const reviews = [[await]] getReviews();
                  console.log(reviews);
                }
              `,
              options: ['async', 'await', 'wait', 'then', 'promise'],
            },
            {
              type: 'task',
              title: 'Load the products',
              body: `
                \`getProducts()\` lives in the locked HTML tab. It answers after 300 ms with an array of \`{ name, price }\` objects. Finish \`showProducts()\`:

                1. Show **Loading…** in \`#status\`.
                2. \`await\` the products.
                3. Add one \`<li>\` per product to \`#list\`, like **Lavender Candle: £12**.
                4. Show the count in \`#status\`: **3 products** (use the array's \`length\`).
              `,
              html: `
                <p id="status"></p>
                <ul id="list"></ul>

                <script>
                  // A pretend server. It answers after 300 ms, like a slow network.
                  function getProducts() {
                    return new Promise((resolve) => {
                      setTimeout(() => {
                        resolve([
                          { name: 'Lavender Candle', price: 12 },
                          { name: 'Oat Milk Soap', price: 6 },
                          { name: 'Sea Salt Candle', price: 12 },
                        ]);
                      }, 300);
                    });
                  }
                </script>
              `,
              js: `
                const status = document.querySelector('#status');
                const list = document.querySelector('#list');

                async function showProducts() {
                  // 1. Show "Loading…" in #status
                  // 2. const products = await …
                  // 3. One <li> per product, like "Lavender Candle: £12"
                  // 4. "3 products" in #status
                }

                showProducts();
              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Shows *Loading…* while it waits',
                  test: (c) => /^loading/i.test(c.text('#status')) && !c.$$('#list li').length,
                },
                {
                  text: 'Shows the 3 products when they arrive',
                  test: async (c) => {
                    await c.wait(400);
                    const n = c.$$('#list li').length;
                    return n === 3 || (n ? 'There are ' + n + ' items.' : false);
                  },
                },
                {
                  text: 'Each item shows the name and price',
                  test: (c) => {
                    const li = c.$$('#list li').map(txt);
                    return (li.length === 3 && /^lavender candle:? £12$/i.test(li[0]) && /^oat milk soap:? £6$/i.test(li[1])) || (li.length ? 'The first item says "' + li[0] + '".' : false);
                  },
                },
                { text: 'The status says *3 products*', test: (c) => /^3 products$/i.test(c.text('#status')) || 'The status says "' + c.text('#status') + '".' },
                { text: 'Uses `await`', test: (c) => /\bawait\s+getProducts\s*\(/.test(c.src('js')) },
              ],
              hint: "```js\nasync function showProducts() {\n  status.textContent = 'Loading…';\n  const products = await getProducts();\n  products.forEach((product) => {\n    const li = document.createElement('li');\n    li.textContent = product.name + ': £' + product.price;\n    list.append(li);\n  });\n  // …and the status\n}\n```",
              solution: {
                js: `
                  const status = document.querySelector('#status');
                  const list = document.querySelector('#list');

                  async function showProducts() {
                    status.textContent = 'Loading…';
                    const products = await getProducts();
                    products.forEach((product) => {
                      const li = document.createElement('li');
                      li.textContent = product.name + ': £' + product.price;
                      list.append(li);
                    });
                    status.textContent = products.length + ' products';
                  }

                  showProducts();
                `,
              },
            },
            {
              type: 'brief',
              title: 'When it goes wrong: try and catch',
              body: `
                Sometimes the promise **rejects**: the server is down, or the visitor's signal drops. With \`await\`, a rejection acts like an error on that line. Your function stops, an error lands in the console, and the visitor stares at "Loading…" for ever.

                Wrap the risky part in \`try\`, and say what to do instead in \`catch\`:

                \`\`\`js
                async function showStock() {
                  try {
                    const stock = await getStock();
                    message.textContent = stock + ' left in stock';
                  } catch (error) {
                    message.textContent = 'Sorry, we could not load stock levels.';
                    console.log(error.message);
                  }
                }
                \`\`\`

                If anything inside \`try\` fails, JavaScript jumps straight to \`catch\`, and \`error\` holds what went wrong. If nothing fails, \`catch\` is skipped.
              `,
            },
            {
              type: 'quiz',
              q: 'When does the code inside `catch { … }` run?',
              options: [
                'Only when something inside `try` throws an error or an awaited promise rejects',
                'Always, straight after the `try` block',
                'Before the `try` block, to get ready',
                'Only when you call `catch()` yourself',
              ],
              answer: 0,
              explain: '`catch` is the backup plan. When everything in `try` works, it is skipped entirely.',
            },
            {
              type: 'task',
              title: 'Handle a failing server',
              body: `
                The pretend \`getStock()\` in the HTML tab is having a bad day: it **always** fails. Without a plan B, that becomes an unhandled error in the console, and the visitor sees "Checking stock…" for ever.

                Uncomment the two lines in \`showStock()\`, wrap them in \`try { … }\`, and add a \`catch\` so that when it fails:

                - \`#stock\` says **Sorry, stock levels are unavailable right now.**
                - \`#stock\` gets the class \`error\`.
              `,
              html: `
                <p id="stock">Checking stock…</p>

                <script>
                  // A pretend server that always fails after 200 ms.
                  function getStock() {
                    return new Promise((resolve, reject) => {
                      setTimeout(() => reject(new Error('Server is down')), 200);
                    });
                  }
                </script>
              `,
              css: `
                body { font-family: system-ui, sans-serif; }
                .error { color: crimson; font-weight: bold; }
              `,
              js: `
                const stock = document.querySelector('#stock');

                async function showStock() {
                  // const count = await getStock();
                  // stock.textContent = count + ' left in stock';
                }

                showStock();
              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'After the failure, `#stock` shows the sorry message',
                  test: async (c) => {
                    await c.wait(350);
                    return /^sorry, stock levels are unavailable right now\.?$/i.test(c.text('#stock')) || '#stock says "' + c.text('#stock') + '".';
                  },
                },
                { text: '`#stock` has the class `error`', test: (c) => c.$('#stock').classList.contains('error') },
                { text: 'No unhandled errors in the console', test: (c) => !c.errors.length || 'The console shows: ' + c.errors[0] },
                { text: 'Uses `try` and `catch`', test: (c) => /\btry\s*\{/.test(c.src('js')) && /\bcatch\s*[({]/.test(c.src('js')) },
              ],
              hint: "Put the two existing lines inside `try { … }`, then add:\n\n```js\ncatch (error) {\n  stock.textContent = 'Sorry, stock levels are unavailable right now.';\n  stock.classList.add('error');\n}\n```",
              solution: {
                js: `
                  const stock = document.querySelector('#stock');

                  async function showStock() {
                    try {
                      const count = await getStock();
                      stock.textContent = count + ' left in stock';
                    } catch (error) {
                      stock.textContent = 'Sorry, stock levels are unavailable right now.';
                      stock.classList.add('error');
                    }
                  }

                  showStock();
                `,
              },
            },
            {
              type: 'brief',
              title: 'The real thing: fetch',
              body: `
                On a live site, the data comes from a server with \`fetch\`, which is built into the browser:

                \`\`\`js
                async function loadProducts() {
                  try {
                    const response = await fetch('https://api.example-shop.com/products');
                    const products = await response.json();
                    render(products);
                  } catch (error) {
                    status.textContent = 'Sorry, the shop could not be loaded.';
                  }
                }
                \`\`\`

                - \`fetch(url)\` asks the server, and gives a promise of a **response**: the reply's envelope. It has \`response.ok\` (true if it worked) and \`response.status\` (200, 404…), but not the data yet.
                - \`response.json()\` reads the body and turns the JSON text into arrays and objects. That takes time too, so it's **another** promise: a second \`await\`.
                - Networks fail, so it goes in \`try\` / \`catch\`.

                Next, you'll use \`fakeFetch\`, which answers exactly like \`fetch\` but works offline.
              `,
            },
            {
              type: 'fill',
              q: 'Get the reviews from the server.',
              code: `
                const response = await [[fetch]]('/api/reviews');
                const reviews = await response.[[json]]();
              `,
              options: ['fetch', 'json', 'get', 'parse', 'load'],
              explain: 'Two awaits: one for the response, one for reading its JSON body.',
            },
            {
              type: 'task',
              title: 'Show the reviews',
              body: `
                Write \`loadReviews()\` the real-world way, using \`fakeFetch\` in place of \`fetch\`:

                1. \`await fakeFetch('/api/reviews')\` to get the response.
                2. \`await response.json()\` to get the array of reviews.
                3. Add one \`<li>\` per review to \`#reviews\`, like **Priya (5 stars): Gorgeous scent, burns for ages.**

                Customers wrote these, so use \`textContent\`.
              `,
              html: `
                <h2>Reviews</h2>
                <ul id="reviews"></ul>

                <script>
                  // A pretend fetch(). It answers after 200 ms with a response whose
                  // .json() gives the reviews, just like the real thing.
                  function fakeFetch(url) {
                    const reviews = [
                      { name: 'Priya', stars: 5, text: 'Gorgeous scent, burns for ages.' },
                      { name: 'Tom', stars: 4, text: 'Lovely gift, quick delivery.' },
                      { name: 'Ade', stars: 5, text: 'My third order. Still love them.' },
                    ];
                    return new Promise((resolve) => {
                      setTimeout(() => {
                        resolve({ ok: true, status: 200, json: () => Promise.resolve(reviews) });
                      }, 200);
                    });
                  }
                </script>
              `,
              js: `
                const list = document.querySelector('#reviews');

                async function loadReviews() {
                  // 1. const response = await …
                  // 2. const reviews = await …
                  // 3. one <li> per review
                }

                loadReviews();
              `,
              edit: ['js'],
              active: 'js',
              checks: [
                {
                  text: 'Shows 3 reviews',
                  test: async (c) => {
                    await c.wait(350);
                    const n = c.$$('#reviews li').length;
                    return n === 3 || (n ? 'There are ' + n + ' items.' : false);
                  },
                },
                {
                  text: 'Each one shows the name, stars and text',
                  test: (c) => {
                    const li = c.$$('#reviews li').map(txt);
                    return (li.length === 3 && /^priya \(5 stars\):? gorgeous scent, burns for ages\.$/i.test(li[0]) && /^tom \(4 stars\)/i.test(li[1])) || (li.length ? 'The first review says "' + li[0] + '".' : false);
                  },
                },
                { text: 'Uses `fakeFetch` and `response.json()` with `await`', test: (c) => /await\s+fakeFetch\s*\(/.test(c.src('js')) && /await\s+\w+\.json\s*\(\s*\)/.test(c.src('js')) },
              ],
              hint: "```js\nconst response = await fakeFetch('/api/reviews');\nconst reviews = await response.json();\nreviews.forEach((review) => {\n  const li = document.createElement('li');\n  li.textContent = `${review.name} (${review.stars} stars): ${review.text}`;\n  list.append(li);\n});\n```",
              solution: {
                js: `
                  const list = document.querySelector('#reviews');

                  async function loadReviews() {
                    const response = await fakeFetch('/api/reviews');
                    const reviews = await response.json();
                    reviews.forEach((review) => {
                      const li = document.createElement('li');
                      li.textContent = \`\${review.name} (\${review.stars} stars): \${review.text}\`;
                      list.append(li);
                    });
                  }

                  loadReviews();
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'A **Promise** is a value that arrives later: it **resolves** with a result or **rejects** with an error.',
                'Inside an `async function`, `await somePromise` waits for the result. Only that function pauses; the page keeps working.',
                'Wrap awaits that can fail in `try { … } catch (error) { … }` and show the visitor a friendly message.',
                "`const response = await fetch(url)` gets the reply; `await response.json()` turns its body into data. Two awaits.",
                'While you wait, show a loading message; when it arrives, render it like any other array.',
              ],
            },
          ],
        },

        /* ── 23 ─────────────────────────────────────────────────────────── */
        {
          id: 'js-final',
          title: 'Final operation: an interactive product page',
          minutes: 20,
          steps: [
            {
              type: 'brief',
              title: 'The operation',
              body: `
                Time to put it all together. You'll build the product page of a small candle and soap shop, in four stages. The HTML and CSS are done and locked. Every stage starts from your finished code of the one before.

                1. **Render** the products from an array.
                2. **Filter** them: All, Candles, Soaps.
                3. **Search** by name.
                4. **Add to basket**, with the basket saved in localStorage.

                The plan is the one real apps use:

                - The **data** lives in one place (\`products\`), plus a few variables for the current state (\`category\`, \`searchText\`, \`basket\`).
                - \`render(list)\` draws whatever list it is given.
                - \`update()\` works out which products to show, then calls \`render\`.
                - Events (clicks, typing) change the state, then call \`update()\`.

                Never change the page by hand in an event. Change the state, then redraw.
              `,
            },
            {
              type: 'task',
              title: 'Stage 1: render the products',
              body: `
                Finish \`render(list)\`. It should empty the grid, then build one card per product in \`list\`:

                \`\`\`html
                <div class="card">
                  <h3>Lavender Candle</h3>
                  <p class="price">£12</p>
                  <button class="add">Add to basket</button>
                </div>
                \`\`\`

                Use \`list\` (the parameter), not \`products\`, inside the function. That's what lets the next stages draw just some of them.
              `,
              html: FINAL_HTML,
              css: FINAL_CSS,
              js: finalJs(1, false),
              edit: ['js'],
              active: 'js',
              height: 420,
              checks: [
                {
                  text: 'Six cards are shown',
                  test: (c) => {
                    const n = c.$$('#products .card').length;
                    return n === 6 || (n ? 'There are ' + n + ' cards.' : false);
                  },
                },
                {
                  text: 'Each card shows the name and the price',
                  test: (c) => {
                    if (cardNames(c).join('|') !== 'Lavender Candle|Fig and Cedar Candle|Oat Milk Soap|Rose Clay Soap|Sea Salt Candle|Charcoal Soap') return false;
                    const prices = c.$$('#products .card .price').map(txt).join(' ');
                    return prices === '£12 £14 £6 £7 £12 £6' || 'The prices say: ' + prices;
                  },
                },
                {
                  text: 'Each card has a `button.add` that says *Add to basket*',
                  test: (c) => {
                    const cards = c.$$('#products .card');
                    return cards.length > 0 && cards.every((card) => /^add to basket$/i.test(txt(card.querySelector('button.add'))));
                  },
                },
                {
                  text: '`render(list)` draws only the products it is given',
                  test: (c) => {
                    const all = c.val('products');
                    c.call('render', all.slice(2, 3));
                    const names = cardNames(c);
                    c.call('render', all);
                    if (names.length === 1 && names[0] === 'Oat Milk Soap') return true;
                    if (names.length > 1 && names.includes('Oat Milk Soap')) return 'render([one product]) showed ' + names.length + " cards. Empty the grid first, and loop over `list`, not `products`.";
                    return false;
                  },
                },
              ],
              hint: "Inside `list.forEach((product) => { … })`, build the card like you did in *Creating elements*:\n\n```js\nconst card = document.createElement('div');\ncard.classList.add('card');\nconst title = document.createElement('h3');\ntitle.textContent = product.name;\n```\n\nThen the price and the button the same way, `card.append(title, price, button)` and `grid.append(card)`.",
              solution: { js: finalJs(1, true) },
            },
            {
              type: 'quiz',
              q: 'Why does `render` take a `list` parameter instead of always drawing `products`?',
              options: [
                'So the same function can draw any selection: filtered, searched or all of them',
                'Because functions must always have at least one parameter',
                'So it runs faster',
                'Because `products` cannot be read from inside a function',
              ],
              answer: 0,
              explain: 'One `render` that draws whatever it is handed means filtering and searching only have to work out *which* products, never *how* to draw them.',
            },
            {
              type: 'task',
              title: 'Stage 2: filter buttons',
              body: `
                There's new scaffolding below \`render\`, marked **NEW**.

                1. In \`update()\`: if \`category\` isn't \`'all'\`, use \`filter\` to keep only the products whose \`category\` matches.
                2. In \`setCategory()\`: remove \`active\` from every \`.filter\` button, then add it to the clicked \`button\`.
                3. Add click listeners to \`#filter-candles\` and \`#filter-soaps\`, like the one for \`#filter-all\`.
              `,
              html: FINAL_HTML,
              css: FINAL_CSS,
              js: finalJs(2, false),
              edit: ['js'],
              active: 'js',
              height: 420,
              checks: [
                {
                  text: '*Candles* shows only the three candles',
                  test: (c) => {
                    c.click('#filter-candles');
                    const names = cardNames(c);
                    return names.join('|') === CANDLES || (names.length ? 'Showing: ' + names.join(', ') : false);
                  },
                },
                {
                  text: '*Soaps* shows only the three soaps',
                  test: (c) => {
                    c.click('#filter-soaps');
                    const names = cardNames(c);
                    return names.join('|') === SOAPS || (names.length ? 'Showing: ' + names.join(', ') : false);
                  },
                },
                {
                  text: '*All* shows all six again',
                  test: (c) => {
                    c.click('#filter-soaps');
                    c.click('#filter-all');
                    return c.$$('#products .card').length === 6;
                  },
                },
                {
                  text: 'Only the clicked button has the class `active`',
                  test: (c) => {
                    const active = () => c.$$('.filter.active').map((b) => b.id).join(',');
                    c.click('#filter-soaps');
                    const a = active();
                    c.click('#filter-all');
                    const b = active();
                    return (a === 'filter-soaps' && b === 'filter-all') || 'After clicking Soaps, the active buttons were: ' + (a || 'none') + '.';
                  },
                },
              ],
              hint: "The filter:\n\n```js\nif (category !== 'all') {\n  list = products.filter((product) => product.category === category);\n}\n```\n\nMoving the class: `document.querySelectorAll('.filter').forEach((b) => { b.classList.remove('active'); });`, then `button.classList.add('active');`.",
              solution: { js: finalJs(2, true) },
            },
            {
              type: 'fill',
              q: 'Keep only the products whose name contains the search text, ignoring capitals.',
              code: `
                list = list.filter((product) =>
                  product.name.[[toLowerCase]]().[[includes]](searchText)
                );
              `,
              options: ['toLowerCase', 'includes', 'toUpperCase', 'contains', 'lower'],
              explain: "`searchText` is lower-cased when it's stored, so lower-casing the name too makes *Lav*, *lav* and *LAV* all match.",
            },
            {
              type: 'task',
              title: 'Stage 3: search',
              body: `
                1. In \`update()\`, after the category filter, keep only the products whose name includes \`searchText\`, ignoring capitals.
                2. Still in \`update()\`, after rendering: if nothing is left, add \`show\` to \`emptyMessage\`; otherwise remove it.
                3. At the bottom: when the search box fires \`'input'\`, store its value (trimmed and lower-cased) in \`searchText\`, then call \`update()\`.

                Search and filter should work **together**: *Candles* plus "sea" shows only the Sea Salt Candle.
              `,
              html: FINAL_HTML,
              css: FINAL_CSS,
              js: finalJs(3, false),
              edit: ['js'],
              active: 'js',
              height: 420,
              checks: [
                {
                  text: 'Typing *lav* shows only the Lavender Candle',
                  test: (c) => {
                    c.click('#filter-all');
                    c.type('#search', 'lav');
                    const names = cardNames(c);
                    return names.join('|') === 'Lavender Candle' || 'Showing: ' + (names.join(', ') || 'nothing');
                  },
                },
                {
                  text: 'Search ignores capitals',
                  test: (c) => {
                    c.click('#filter-all');
                    c.type('#search', 'SOAP');
                    const names = cardNames(c);
                    return names.join('|') === SOAPS || (names.length ? 'Showing: ' + names.join(', ') : 'Nothing matched "SOAP". Lower-case both the name and the search text.');
                  },
                },
                {
                  text: 'Search and filter work together',
                  test: (c) => {
                    c.click('#filter-all');
                    c.type('#search', 'sea');
                    c.click('#filter-candles');
                    const a = cardNames(c).join('|');
                    c.click('#filter-soaps');
                    const b = cardNames(c).join('|');
                    return (a === 'Sea Salt Candle' && b === '') || 'With "sea" typed, Candles showed: ' + (a || 'nothing') + ', and Soaps showed: ' + (b || 'nothing') + '.';
                  },
                },
                {
                  text: 'The "No products match" message shows only when nothing matches',
                  test: (c) => {
                    c.click('#filter-candles');
                    c.type('#search', 'soap');
                    const none = shown(c, c.$('#empty')) && cardNames(c).length === 0;
                    c.type('#search', '');
                    const back = !shown(c, c.$('#empty')) && cardNames(c).length === 3;
                    if (!none) return false;
                    return back || 'The message should hide again when the search is cleared.';
                  },
                },
              ],
              hint: "The search filter is the line from the last question. For the message:\n\n```js\nif (list.length === 0) {\n  emptyMessage.classList.add('show');\n} else {\n  emptyMessage.classList.remove('show');\n}\n```\n\nThe listener: `searchInput.addEventListener('input', () => { searchText = searchInput.value.trim().toLowerCase(); update(); });`",
              solution: { js: finalJs(3, true) },
            },
            {
              type: 'quiz',
              q: 'Every time `render` runs it builds brand-new buttons. So where must the *Add to basket* click listener be added?',
              options: [
                'Inside `render`, on each new button as it is created',
                'Once at the top of the file, on `.add` buttons found with `querySelectorAll`',
                'In `update()`, before `render(list)` is called',
              ],
              answer: 0,
              explain: "Buttons found at the top of the file are thrown away the first time you filter (`grid.innerHTML = ''`). New buttons need their own listeners, so add them as you create them.",
            },
            {
              type: 'task',
              title: 'Stage 4: the basket',
              body: `
                1. In \`render\`, where it says **NEW**, add a click listener to \`button\` that calls \`addToBasket(product)\`.
                2. Finish \`addToBasket(product)\`: push \`product.id\` into \`basket\`, save \`basket\` as JSON under \`'shopBasket'\`, and show \`basket.length\` in \`#basket-count\`.
                3. Load the basket when the page starts: \`'shopBasket'\` from localStorage, or \`[]\` if nothing is saved.

                The check adds things, filters, and reloads the page to make sure the basket is remembered.
              `,
              html: FINAL_HTML,
              css: FINAL_CSS,
              js: finalJs(4, false),
              edit: ['js'],
              active: 'js',
              height: 420,
              checks: [
                {
                  text: 'Clicking *Add to basket* adds 1 to the count',
                  test: (c) => {
                    const before = Number(c.text('#basket-count'));
                    c.click('#products .add');
                    return Number(c.text('#basket-count')) === before + 1;
                  },
                },
                {
                  text: 'It still works after filtering',
                  test: (c) => {
                    c.click('#filter-soaps');
                    const before = Number(c.text('#basket-count'));
                    c.click('#products .add');
                    return Number(c.text('#basket-count')) === before + 1 || 'After filtering, the buttons stopped working. Add the listener inside `render`.';
                  },
                },
                {
                  text: "The basket is saved as JSON under `'shopBasket'`",
                  test: (c) => {
                    const raw = store(c, 'shopBasket');
                    if (raw === null) return "Nothing is saved under 'shopBasket'.";
                    let arr;
                    try {
                      arr = JSON.parse(raw);
                    } catch (e) {
                      return "'shopBasket' is saved as \"" + raw + '", which is not JSON. Use `JSON.stringify(basket)`.';
                    }
                    if (!Array.isArray(arr)) return "'shopBasket' should hold an array.";
                    const last = arr[arr.length - 1];
                    if (!(last === 3 || last === 'Oat Milk Soap' || (last && last.id === 3))) return 'The last item saved should be the Oat Milk Soap (id 3).';
                    return arr.length === Number(c.text('#basket-count')) || 'The count on the page and the saved basket do not match.';
                  },
                },
                {
                  text: 'The count survives a reload',
                  test: async (c) => {
                    const n = c.text('#basket-count');
                    await reloadPage(c);
                    const after = txt(q(c, '#basket-count'));
                    if (after !== n) return 'Before the reload the count was ' + n + '; after it, ' + after + ". Load 'shopBasket' when the page starts.";
                    return qa(c, '#products .card').length === 6 || 'After the reload the products are missing.';
                  },
                },
                {
                  text: 'A first visit, with nothing saved, starts at 0',
                  test: async (c) => {
                    c.win.localStorage.removeItem('shopBasket');
                    await reloadPage(c);
                    const errs = (c.win.__fm && c.win.__fm.errors) || [];
                    if (errs.length) return 'With nothing saved, the page shows an error: ' + errs[0] + '. Did you add `|| []`?';
                    return txt(q(c, '#basket-count')) === '0';
                  },
                },
              ],
              hint: "The listener, inside `render` after the button is made:\n\n```js\nbutton.addEventListener('click', () => {\n  addToBasket(product);\n});\n```\n\nLoading: `let basket = JSON.parse(localStorage.getItem('shopBasket')) || [];`",
              solution: { js: finalJs(4, true) },
            },
            {
              type: 'brief',
              title: 'Plugging in a real server',
              body: `
                Your page is built the way real shops are. To load the products from a server instead of an array, only the start changes: make \`products\` a \`let\` that starts as \`[]\`, and replace the final \`update()\` with:

                \`\`\`js
                async function start() {
                  try {
                    const response = await fetch('/api/products');
                    products = await response.json();
                    update();
                  } catch (error) {
                    emptyMessage.textContent = 'Sorry, the shop could not be loaded.';
                    emptyMessage.classList.add('show');
                  }
                }

                start();
                \`\`\`

                \`render\`, \`update\`, the filters, the search and the basket all stay exactly the same. That's the payoff of keeping data, drawing and events separate.
              `,
            },
            {
              type: 'debrief',
              points: [
                'Structure: **data and state** in variables, `render(list)` draws, `update()` decides what to draw, events change state and call `update()`.',
                'Filter and search are just `products.filter(…)` calls chained one after another before rendering.',
                'Case-insensitive search: lower-case both sides, then `name.includes(searchText)`.',
                'When `render` rebuilds elements, add their listeners inside `render`, as each element is created.',
                "Persist with `localStorage.setItem('shopBasket', JSON.stringify(basket))`; load with `JSON.parse(…) || []` at start-up.",
              ],
            },
          ],
        },
      ],
    },
  ]);
})();

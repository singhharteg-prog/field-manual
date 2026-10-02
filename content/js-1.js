/* JavaScript, part 1 — Operation Brain: the language itself (values, logic,
   loops, arrays, functions, objects). js-2.js adds the DOM, events and async.
   See ../CONTENT_GUIDE.md for the format. */
(function () {
  'use strict';

  /* ── small helpers for checks ──────────────────────────────────────── */

  // A value as it should appear in a fail message.
  const say = (v) => {
    if (v === undefined) return 'undefined';
    if (typeof v === 'string') return '"' + v + '"';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'function') return 'a function';
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  };
  // Everything logged so far, for fail messages.
  const logged = (c) => (c.logs.length ? c.logs.join(' | ') : 'nothing');
  const norm = (s) => String(s == null ? '' : s).trim().replace(/\s+/g, ' ');
  const hasLog = (c, re) => c.logs.some((l) => re.test(norm(l)));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const near = (a, b) => typeof a === 'number' && Math.abs(a - b) < 1e-9;
  const noFn = (name) => 'No function called ' + name + ' yet.';

  // Re-run the learner's code with one starting value swapped, so a check can
  // try several inputs. tryWith(c, 'stock', 0, 'label') runs the code with
  // `const stock = 0` (or let) and reads `label` back. Returns { value, logs, missing }.
  function tryWith(c, name, value, read) {
    const re = new RegExp('(\\b(?:const|let)\\s+' + name + '\\s*=\\s*)[^;\\n]+');
    if (!re.test(c.js)) return { value: undefined, logs: [], missing: true };
    const src = c.js.replace(re, (_, a) => a + JSON.stringify(value));
    const before = c.logCount();
    let out;
    try {
      out = new c.win.Function(window.FM.guard(src) + '\n;return typeof ' + read + " === 'undefined' ? undefined : " + read + ';')();
    } catch (e) {
      out = undefined;
    }
    return { value: out, logs: c.newLogs(before), missing: false };
  }

  FM.modules('js', [
    /* ════════════════════════════════════════════════════════════════════
       MODULE 1 — First words
       ════════════════════════════════════════════════════════════════════ */
    {
      title: 'First words',
      missions: [
        /* ── 1. What JavaScript does ─────────────────────────────────── */
        {
          id: 'js-intro',
          title: 'What JavaScript does',
          minutes: 8,
          steps: [
            {
              type: 'brief',
              title: 'Your briefing',
              body: `
                HTML gives a page its structure. CSS gives it its look. **JavaScript** gives it *behaviour*.

                JavaScript is a programming language: a list of instructions that the browser carries out, one after another, top to bottom. On a small-business site it is what:

                - updates the basket total when someone adds a candle
                - shows "Open now" or "Closed" depending on the time
                - checks an email address before a form is sent
                - opens the menu on a phone

                It runs **in the browser**, on the visitor's own device. On a real page you add it with a \`<script>\` tag, usually just before \`</body>\`:

                \`\`\`html
                <script src="script.js"></script>
                \`\`\`

                In this dossier you skip that step. The editor *is* the script, and what it prints appears in the **console** underneath.
              `,
            },
            {
              type: 'exhibit',
              title: 'See it run',
              body: `
                \`console.log()\` prints whatever is inside its brackets to the console. Text goes in quotes. Numbers and sums don't.

                Press **Run**. Then change the text or the numbers and run it again.
              `,
              js: `
                console.log('Welcome to the candle shop');
                console.log(4.5);
                console.log(2 + 2);
                console.log('2 + 2');
              `,
              after: `The last two lines look alike but aren't. Without quotes, JavaScript works out \`2 + 2\`. In quotes, it's just text, printed exactly as written.`,
            },
            {
              type: 'quiz',
              q: "What does `console.log('5 + 5')` print?",
              options: ['`5 + 5`', '`10`', "`'5 + 5'`", 'An error'],
              answer: 0,
              explain: 'The quotes make it text, so it is printed as it is: `5 + 5`. The quote marks themselves are not printed. Without the quotes you would get `10`.',
            },
            {
              type: 'task',
              title: 'Your first log',
              body: `
                Write two lines of JavaScript:

                1. Log the text **Hello from JavaScript**
                2. Log the sum \`12 + 8\` -- with no quotes, so JavaScript works it out

                Press **Run** to see the console, then **Check my code**.
              `,
              js: `
                // 1. Log the text: Hello from JavaScript

                // 2. Log the sum 12 + 8 (no quotes)

              `,
              checks: [
                {
                  text: 'You logged *Hello from JavaScript*',
                  test: (c) => hasLog(c, /^hello,? from javascript[.!]?$/i) || 'Expected Hello from JavaScript. You logged: ' + logged(c),
                },
                {
                  text: 'You logged `20`',
                  test: (c) =>
                    c.logs.includes('20') ||
                    (hasLog(c, /^12 ?\+ ?8$/) ? 'You logged the text "12 + 8". Take the quotes off so JavaScript does the sum.' : 'Expected 20 in the console. You logged: ' + logged(c)),
                },
                {
                  text: 'JavaScript did the sum (you typed `12 + 8`, not `20`)',
                  test: (c) => /console\.log\(\s*12\s*\+\s*8\s*\)/.test(c.src('js')) || 'Put the sum itself inside the brackets: console.log(12 + 8);',
                },
              ],
              hint: 'Text needs quotes, a sum does not:\n\n```js\nconsole.log(\'Some text\');\nconsole.log(1 + 1);\n```',
              solution: {
                js: `
                  console.log('Hello from JavaScript');
                  console.log(12 + 8);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Statements, semicolons and comments',
              body: `
                Each instruction is a **statement**. Write one per line and end it with a semicolon \`;\` -- the full stop of JavaScript. JavaScript usually copes if you forget one, but most code you'll read (AI-written code included) uses them, so do the same.

                **Comments** are notes for humans. JavaScript skips them completely:

                \`\`\`js
                // A one-line comment: everything after the two slashes is ignored
                console.log('Shop open'); // a comment can sit at the end of a line

                /* A longer comment
                   over several lines */
                \`\`\`

                Use comments to explain *why* code does something. They are also handy for switching a line off while testing: put \`//\` in front and it stops running. That's called **commenting out**.

                > Want to see the console on a real website? In Chrome, Edge or Firefox press **F12** (or right-click the page, choose **Inspect**) and open the **Console** tab.
              `,
            },
            {
              type: 'fill',
              q: 'Comment out this line so it no longer runs.',
              code: `[[//]] console.log('Sale ends Friday');`,
              options: ['//', '<!--', '#', '**'],
              explain: '`//` starts a comment in JavaScript. `<!--` is the HTML comment and `#` is used in some other languages.',
            },
            {
              type: 'brief',
              title: 'Reading error messages',
              body: `
                When JavaScript meets something it can't understand, it **stops** and shows an error in red:

                \`\`\`
                ReferenceError: consol is not defined  (JS line 2)
                \`\`\`

                Read it in three parts: the **type** of error, **what** went wrong, and **where** (the line number in your code). The most common ones:

                | Error | Usually means |
                |---|---|
                | \`ReferenceError: … is not defined\` | A name JavaScript doesn't know. Almost always a typo. |
                | \`SyntaxError\` | The grammar is broken: a missing quote or bracket. *Nothing* runs at all. |
                | \`TypeError\` | You used a value in a way it can't be used. |

                JavaScript is **case-sensitive**: \`console\` works, \`Console\` is an error.

                Errors are normal. Every developer sees dozens a day. Go to the line it names and look closely.
              `,
            },
            {
              type: 'exhibit',
              title: 'Make an error on purpose',
              body: `
                Press **Run**: three lines, no problems. Now break it:

                1. On line 2, change \`console\` to \`consol\` and press **Run**. Line 1 runs, line 2 throws a \`ReferenceError\`, and line 3 never gets a chance.
                2. Fix line 2. Then delete the closing quote \`'\` on line 3 and press **Run**. A \`SyntaxError\` -- and this time *nothing* runs, not even line 1.
              `,
              js: `
                console.log('Line 1 runs');
                console.log('Line 2 runs');
                console.log('Line 3 runs');
              `,
            },
            {
              type: 'quiz',
              q: 'The console shows `ReferenceError: totl is not defined  (JS line 4)`. What is the most likely cause?',
              options: ['A typo on line 4: it probably should say `total`', 'Line 4 is missing a semicolon', 'The browser does not support JavaScript', 'Line 3 has a missing quote'],
              answer: 0,
              explain: '"Not defined" means JavaScript doesn\'t know that name. When the name looks almost right, it\'s a typo. Go to the line it gives you.',
            },
            {
              type: 'task',
              title: 'Fix the broken script',
              body: `
                This script should log the shop's opening hours, but it has **two** mistakes.

                1. Press **Run** and read the error.
                2. Go to the line it names and fix it.
                3. Run again, and repeat until all four lines appear with no errors.

                Don't change the words being logged -- only fix what's broken.
              `,
              js: `
                console.log('Opening hours');
                console.log('Mon-Fri: 9am to 5pm');
                Console.log('Sat: 10am to 4pm');
                console.lg('Sun: closed');
              `,
              checks: [
                { text: 'The script runs without errors', test: (c) => !c.errors.length || 'There is still an error: ' + c.errors[0] },
                { text: 'It logs *Sat: 10am to 4pm*', test: (c) => c.logs.includes('Sat: 10am to 4pm') || 'Expected Sat: 10am to 4pm. You logged: ' + logged(c) },
                { text: 'It logs *Sun: closed*', test: (c) => c.logs.includes('Sun: closed') || 'Expected Sun: closed. You logged: ' + logged(c) },
                { text: 'All four lines are logged', test: (c) => c.logs.length >= 4 || 'Only ' + c.logs.length + ' line(s) logged so far.' },
              ],
              hint: 'The first error points at line 3: `ReferenceError: Console is not defined`. Look at the capital letters. Once that is fixed, a `TypeError` points at line 4: check the spelling after the dot.',
              solution: {
                js: `
                  console.log('Opening hours');
                  console.log('Mon-Fri: 9am to 5pm');
                  console.log('Sat: 10am to 4pm');
                  console.log('Sun: closed');
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'JavaScript is the **behaviour** of a page. It runs in the browser, top to bottom, one statement at a time.',
                'On a real page it goes in a `<script>` tag, usually just before `</body>`: `<script src="script.js"></script>`.',
                "`console.log(…)` prints to the console. Text goes in quotes: `console.log('Hi')`. Sums don't: `console.log(2 + 2)`.",
                'End each statement with `;`. `// comment` for one line, `/* comment */` for several.',
                'Errors give a type, a message and a line number. `ReferenceError` is usually a typo; a `SyntaxError` (missing quote or bracket) stops *everything* from running.',
                'JavaScript is case-sensitive: `console` works, `Console` does not.',
              ],
            },
          ],
        },

        /* ── 2. Variables ────────────────────────────────────────────── */
        {
          id: 'js-variables',
          title: 'Variables',
          minutes: 9,
          steps: [
            {
              type: 'brief',
              title: 'Labelled boxes',
              body: `
                A **variable** stores a value under a name, so you can use it later.

                \`\`\`js
                let customer = 'Priya';
                let itemsInBasket = 3;

                console.log(customer);       // Priya
                console.log(itemsInBasket);  // 3
                \`\`\`

                - \`let\` creates the variable.
                - \`customer\` is its name.
                - \`=\` puts a value in. Read it as "*becomes*", not "equals".

                To use the value, write the name **without quotes**. In quotes, \`'customer'\` is just the word *customer*.
              `,
            },
            {
              type: 'exhibit',
              title: 'Variables in action',
              body: 'Change the values at the top and press **Run**. The lines that use the names pick up the new values.',
              js: `
                let shopName = 'Wick & Wax';
                let candlePrice = 12;

                console.log(shopName);
                console.log(candlePrice);
                console.log('shopName');
              `,
              after: 'The last line logs the word *shopName*, not its value, because of the quotes.',
            },
            {
              type: 'quiz',
              q: "After `let city = 'Leeds';`, what does `console.log(city);` print?",
              options: ['`Leeds`', '`city`', "`'Leeds'`", '`undefined`'],
              answer: 0,
              explain: 'Without quotes, `city` is the name of a variable, so JavaScript prints the value inside it: `Leeds`.',
            },
            {
              type: 'brief',
              title: 'Changing the value',
              body: `
                A \`let\` variable can be given a new value later. Use \`=\` again, but **without** \`let\`:

                \`\`\`js
                let stock = 10;
                stock = 9;          // one sold
                console.log(stock); // 9
                \`\`\`

                The old value is replaced. \`let\` is only for *creating* a variable. Using it twice for the same name is an error: \`SyntaxError: Identifier 'stock' has already been declared\`.
              `,
            },
            {
              type: 'task',
              title: 'Update the stock',
              body: `
                The shop has 20 candles. A customer buys 3.

                On the empty line, change \`stock\` to **17**. Don't create it again with \`let\` -- just give it a new value.
              `,
              js: `
                let stock = 20;
                // A customer buys 3 candles. Set stock to 17 on the next line.

                console.log(stock);
              `,
              checks: [
                {
                  text: '`stock` is now 17',
                  test: (c) => c.val('stock') === 17 || (c.errors.length ? 'Your code has an error: ' + c.errors[0] : 'stock is ' + say(c.val('stock')) + '; it should be 17.'),
                },
                { text: 'The console shows `17`', test: (c) => c.logs.includes('17') || 'Expected 17, got ' + logged(c) },
                {
                  text: '`let stock` is only written once',
                  test: (c) => (c.src('js').match(/\blet\s+stock\b/g) || []).length === 1 || 'Use let only when you create the variable. To change it, write stock = 17;',
                },
              ],
              hint: 'A new value for an existing variable is just the name, `=`, and the value: `stock = …;`',
              solution: {
                js: `
                  let stock = 20;
                  // A customer buys 3 candles. Set stock to 17 on the next line.
                  stock = 17;
                  console.log(stock);
                `,
              },
            },
            {
              type: 'brief',
              title: 'const: values that stay put',
              body: `
                Some values should never change once set: the VAT rate, the shop's name, the delivery charge. Use \`const\` (short for *constant*):

                \`\`\`js
                const vatRate = 0.2;
                vatRate = 0.25; // TypeError: Assignment to constant variable.
                \`\`\`

                JavaScript refuses to change it, which protects you from overwriting it by mistake. It also tells anyone reading the code: *this stays the same*.

                **The rule:** use \`const\` by default. Use \`let\` only when you know the value will change (a counter, a running total).

                > You'll also see \`var\` in older code and some AI output. It's the original way to make a variable, with looser rules that cause hard-to-spot bugs. Use \`let\` and \`const\` instead.
              `,
            },
            {
              type: 'exhibit',
              title: 'Breaking a const',
              body: 'Press **Run**. `visitors` is a `let`, so it changes happily. `shopName` is a `const`.',
              js: `
                const shopName = 'Wick & Wax';
                let visitors = 40;

                visitors = 41;
                console.log(visitors);

                // shopName = 'Wax & Wick';
                console.log(shopName);
              `,
              after: 'Now remove the `//` from line 7 and press **Run**: `TypeError: Assignment to constant variable.` Then change `const` to `let` on line 1 and run again: the error goes. In real code, keep it `const` if the name should never change.',
            },
            {
              type: 'fill',
              q: "The delivery charge never changes. The number of items in the basket does. Pick the right keyword for each.",
              code: `
                [[const]] deliveryCharge = 4.95;
                [[let]] itemsInBasket = 0;
                itemsInBasket = 2;
              `,
              options: ['const', 'let', 'var', 'variable'],
              explain: '`const` for the value that stays the same, `let` for the one that is reassigned on line 3.',
            },
            {
              type: 'brief',
              title: 'Naming variables',
              body: `
                **Rules** (break these and you get an error):

                - Letters, digits, \`_\` and \`$\` only. No spaces, no hyphens.
                - Can't start with a digit.
                - Can't be a word JavaScript already uses, like \`let\`, \`const\` or \`if\`.
                - Case matters: \`price\` and \`Price\` are two different variables.

                **Style** (everyone follows this): use **camelCase**. Start lower case, and start each new word with a capital: \`openingTime\`, \`basketTotal\`, \`isOpen\`.

                | Name | |
                |---|---|
                | \`deliveryDate\` | Good |
                | \`delivery-date\` | Error: JavaScript reads the \`-\` as minus |
                | \`2ndItem\` | Error: starts with a digit |
                | \`x\` | Works, but says nothing. Name it after what it holds. |
              `,
            },
            {
              type: 'quiz',
              q: 'Which is a valid, well-styled variable name?',
              options: ['`deliveryDate`', '`delivery-date`', '`2deliveryDate`', '`Delivery date`'],
              answer: 0,
              explain: 'camelCase, letters only, no spaces or hyphens, and it does not start with a digit.',
            },
            {
              type: 'task',
              title: 'Set up a barber shop',
              body: `
                Create three variables for a barber's booking page:

                1. A \`const\` called \`businessName\` holding the text **Fade Masters**
                2. A \`const\` called \`haircutPrice\` holding the number **18**
                3. A \`let\` called \`slotsLeft\` holding **6**

                Then someone books: on a later line, change \`slotsLeft\` to **5**.

                Finally, log all three variables (one \`console.log\` each).
              `,
              js: `
                // Create businessName, haircutPrice and slotsLeft here

              `,
              checks: [
                {
                  text: '`businessName` holds *Fade Masters*',
                  test: (c) => {
                    const v = c.val('businessName');
                    if (v === undefined) return c.errors.length ? 'Your code has an error: ' + c.errors[0] : 'No variable called businessName yet.';
                    return /^fade masters$/i.test(norm(v)) || 'businessName is ' + say(v) + '. Make it Fade Masters.';
                  },
                },
                {
                  text: '`haircutPrice` is the number 18',
                  test: (c) => {
                    const v = c.val('haircutPrice');
                    if (v === '18') return 'haircutPrice is the text "18". Remove the quotes so it is a number.';
                    return v === 18 || (v === undefined ? 'No variable called haircutPrice yet.' : 'haircutPrice is ' + say(v) + '; it should be 18.');
                  },
                },
                {
                  text: '`slotsLeft` starts at 6 and is changed to 5',
                  test: (c) => {
                    const v = c.val('slotsLeft');
                    if (v === undefined) return 'No variable called slotsLeft yet.';
                    if (v === 6) return 'slotsLeft is still 6. Change it to 5 on a later line.';
                    return (v === 5 && /\blet\s+slotsLeft\s*=\s*6\b/.test(c.src('js'))) || 'Create it with let slotsLeft = 6; and then set it to 5.';
                  },
                },
                {
                  text: 'The two values that never change use `const`',
                  test: (c) => (/\bconst\s+businessName\b/.test(c.src('js')) && /\bconst\s+haircutPrice\b/.test(c.src('js'))) || 'Create businessName and haircutPrice with const.',
                },
                {
                  text: 'All three are logged',
                  test: (c) => (c.logs.includes(String(c.val('businessName'))) && c.logs.includes('18') && c.logs.includes('5')) || 'Expected the name, 18 and 5 in the console. You logged: ' + logged(c),
                },
              ],
              hint: 'Create each one with its keyword, then reassign the `let` one:\n\n```js\nconst businessName = \'…\';\n// …\nlet slotsLeft = 6;\nslotsLeft = 5;\n```\n\nLog them by name, without quotes.',
              solution: {
                js: `
                  const businessName = 'Fade Masters';
                  const haircutPrice = 18;
                  let slotsLeft = 6;

                  slotsLeft = 5; // someone booked

                  console.log(businessName);
                  console.log(haircutPrice);
                  console.log(slotsLeft);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "A **variable** stores a value under a name: `let customer = 'Priya';`. Use the name without quotes to get the value.",
                '`=` means *becomes*. Change a `let` variable by assigning again, without `let`: `stock = 9;`.',
                '`const` cannot be reassigned (`TypeError: Assignment to constant variable`). Use `const` by default, `let` only when the value will change.',
                "Don't use `var`. It's the old way, with looser rules that cause bugs.",
                'Names: letters, digits, `_`, `$`; no spaces or hyphens; not starting with a digit; case-sensitive. Write them in **camelCase**: `basketTotal`.',
              ],
            },
          ],
        },

        /* ── 3. Data types ───────────────────────────────────────────── */
        {
          id: 'js-types',
          title: 'Data types',
          minutes: 9,
          steps: [
            {
              type: 'brief',
              title: 'Kinds of value',
              body: `
                Every value in JavaScript has a **type**. The everyday ones:

                | Type | Examples | Used for |
                |---|---|---|
                | **string** | \`'Lavender candle'\`, \`"LE1 5AB"\` | Text. Always in quotes (single or double). |
                | **number** | \`12\`, \`4.99\`, \`-3\` | Prices, stock, quantities. Whole numbers and decimals are the same type. |
                | **boolean** | \`true\`, \`false\` | Yes/no facts: is the shop open, is it in stock. No quotes. |
                | **undefined** | \`undefined\` | "No value yet": a variable made without one. |
                | **null** | \`null\` | "Deliberately empty": you set it to nothing on purpose. |

                \`typeof\` tells you the type of a value: \`typeof 12\` gives \`'number'\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Checking types',
              body: 'Press **Run**, then try `typeof` on values of your own.',
              js: `
                console.log(typeof 'Candle');
                console.log(typeof 12.5);
                console.log(typeof true);

                let discountCode;
                console.log(discountCode);
                console.log(typeof discountCode);

                const giftMessage = null;
                console.log(giftMessage);
              `,
              after: 'One oddity: `typeof null` gives `"object"`. It\'s a mistake from 1995 that can\'t be fixed without breaking old websites. Just remember it.',
            },
            {
              type: 'quiz',
              q: "What does `typeof '42'` give?",
              options: ['`"string"`', '`"number"`', '`"boolean"`', '`"undefined"`'],
              answer: 0,
              explain: 'It is in quotes, so it is a string -- even though it looks like a number. This matters: text that looks like a number does not always behave like one.',
            },
            {
              type: 'quiz',
              q: 'You write `let couponCode;` and then `console.log(couponCode);`. What appears?',
              options: ['`undefined`', '`null`', 'An empty line', 'An error'],
              answer: 0,
              explain: 'A variable created without a value holds `undefined`. You only get `null` if you set it to `null` yourself.',
            },
            {
              type: 'task',
              title: 'Describe a product',
              body: `
                Create three \`const\` variables for a product card:

                1. \`productName\`: a **string**, any product name you like
                2. \`price\`: the **number** \`24.99\`
                3. \`inStock\`: the **boolean** \`true\`

                Then log \`typeof price\`.
              `,
              js: `
                // Create productName, price and inStock

                // Log the type of price

              `,
              checks: [
                {
                  text: '`productName` is a string',
                  test: (c) => {
                    const v = c.val('productName');
                    return (typeof v === 'string' && v.trim() !== '') || (v === undefined ? 'No variable called productName yet.' : 'productName is ' + say(v) + '. Put some text in quotes.');
                  },
                },
                {
                  text: '`price` is the number 24.99',
                  test: (c) => {
                    const v = c.val('price');
                    if (v === '24.99') return 'price is the text "24.99". Remove the quotes to make it a number.';
                    return v === 24.99 || (v === undefined ? 'No variable called price yet.' : 'price is ' + say(v) + '; it should be 24.99.');
                  },
                },
                {
                  text: '`inStock` is the boolean `true`',
                  test: (c) => {
                    const v = c.val('inStock');
                    if (v === 'true') return 'inStock is the text "true". Booleans have no quotes.';
                    return v === true || (v === undefined ? 'No variable called inStock yet.' : 'inStock is ' + say(v) + '; it should be true.');
                  },
                },
                { text: 'You logged `typeof price` (it shows `number`)', test: (c) => c.logs.includes('number') || 'Expected number in the console. You logged: ' + logged(c) },
              ],
              hint: "Strings have quotes, numbers and booleans don't:\n\n```js\nconst productName = 'Cedar candle';\n```\n\nThen `console.log(typeof price);`",
              solution: {
                js: `
                  const productName = 'Cedar candle';
                  const price = 24.99;
                  const inStock = true;

                  console.log(typeof price);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Text that should be a number',
              body: `
                Anything a visitor types into a form reaches JavaScript as a **string**, even \`3\` in a quantity box. Before you do maths with it, convert it.

                \`\`\`js
                Number('3')          // 3
                Number('12.50')      // 12.5
                Number('twelve')     // NaN
                parseFloat('2.5kg')  // 2.5
                String(250)          // '250'
                \`\`\`

                - \`Number(text)\` converts the whole text. If it can't, you get **\`NaN\`** ("Not a Number" -- which, oddly, is itself of type number).
                - \`parseFloat(text)\` reads a number from the *start* of the text and stops at the first thing that isn't part of one. Good for \`'2.5kg'\` or \`'4.50 GBP'\`.
                - \`String(value)\` goes the other way: a number to text.
              `,
            },
            {
              type: 'exhibit',
              title: 'Converting',
              body: 'Press **Run**. Try putting your own text into `Number()` and `parseFloat()`.',
              js: `
                const fromForm = '19.99';
                console.log(typeof fromForm);

                const price = Number(fromForm);
                console.log(price, typeof price);

                console.log(Number('twenty'));
                console.log(Number('7.5kg'));
                console.log(parseFloat('7.5kg'));
                console.log(typeof String(250));
              `,
            },
            {
              type: 'fill',
              q: 'Turn the text into a number, and the number into text.',
              code: `
                const qty = [[Number]]('3');
                const label = [[String]](42);
              `,
              options: ['Number', 'String', 'number', 'typeof'],
              explain: '`Number()` and `String()` start with a capital letter. Lower-case `number` is what `typeof` reports, not a function you can call.',
            },
            {
              type: 'quiz',
              q: "What does `parseFloat('4.50 per item')` give?",
              options: ['`4.5`', '`NaN`', "`'4.50'`", '`4`'],
              answer: 0,
              explain: '`parseFloat` reads the number at the start and ignores the rest. `Number(\'4.50 per item\')` would give `NaN`, because it needs the whole text to be a number.',
            },
            {
              type: 'task',
              title: 'Clean up form data',
              body: `
                These two values came from an order form, so they are strings.

                1. Make a \`const\` called \`quantity\`: \`quantityText\` converted to a number (\`3\`)
                2. Make a \`const\` called \`weight\`: the number from \`weightText\` (\`2.5\`). Pick the conversion that copes with the *kg*.
                3. Log \`typeof quantity\`
              `,
              js: `
                // These came from a form, so they are text
                const quantityText = '3';
                const weightText = '2.5kg';

                // 1. quantity

                // 2. weight

                // 3. log typeof quantity

              `,
              checks: [
                {
                  text: '`quantity` is the number 3',
                  test: (c) => {
                    const v = c.val('quantity');
                    if (v === '3') return 'quantity is still the text "3". Convert it with Number().';
                    return v === 3 || (v === undefined ? 'No variable called quantity yet.' : 'quantity is ' + say(v) + '; it should be 3.');
                  },
                },
                {
                  text: '`weight` is the number 2.5',
                  test: (c) => {
                    const v = c.val('weight');
                    if (typeof v === 'number' && Number.isNaN(v)) return 'weight is NaN: Number() can\'t read "2.5kg". Try parseFloat().';
                    return v === 2.5 || (v === undefined ? 'No variable called weight yet.' : 'weight is ' + say(v) + '; it should be 2.5.');
                  },
                },
                { text: 'You logged `typeof quantity` (it shows `number`)', test: (c) => c.logs.includes('number') || 'Expected number in the console. You logged: ' + logged(c) },
              ],
              hint: '`Number()` for text that is only a number. `parseFloat()` for text that starts with a number and has something after it.',
              solution: {
                js: `
                  // These came from a form, so they are text
                  const quantityText = '3';
                  const weightText = '2.5kg';

                  const quantity = Number(quantityText);
                  const weight = parseFloat(weightText);

                  console.log(typeof quantity);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'The everyday types: **string** (text, in quotes), **number** (`12`, `4.99`), **boolean** (`true`/`false`), `undefined` (no value yet) and `null` (deliberately empty).',
                '`typeof value` gives the type as text: `typeof 12` is `"number"`. (`typeof null` is `"object"` -- a famous old quirk.)',
                "`'42'` is a string, not a number. Form inputs always give you strings.",
                "`Number('12.5')` converts the whole text; if it can't, you get `NaN`. `parseFloat('2.5kg')` reads the number at the start.",
                '`String(250)` turns a number into text.',
              ],
            },
          ],
        },

        /* ── 4. Maths and operators ──────────────────────────────────── */
        {
          id: 'js-operators',
          title: 'Maths and operators',
          minutes: 10,
          steps: [
            {
              type: 'brief',
              title: 'Doing sums',
              body: `
                JavaScript does maths with **operators**:

                | Operator | Does | Example | Result |
                |---|---|---|---|
                | \`+\` | add | \`12 + 3.5\` | \`15.5\` |
                | \`-\` | subtract | \`20 - 4\` | \`16\` |
                | \`*\` | multiply | \`12 * 3\` | \`36\` |
                | \`/\` | divide | \`30 / 4\` | \`7.5\` |
                | \`%\` | remainder | \`17 % 5\` | \`2\` |
                | \`**\` | power | \`2 ** 3\` | \`8\` |

                \`%\` gives what's *left over* after dividing: 17 candles packed in boxes of 5 leaves 2 loose. You'll use it more than you'd think.

                Operators work on variables too: \`price * quantity\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Try the operators',
              body: 'Press **Run**, then change the numbers.',
              js: `
                const price = 12;
                const quantity = 3;

                console.log(price * quantity);
                console.log(50 - 12.5);
                console.log(100 / 8);
                console.log(17 % 5);
                console.log(2 ** 3);
              `,
            },
            {
              type: 'quiz',
              q: 'What is `14 % 4`?',
              options: ['`2`', '`3.5`', '`3`', '`0`'],
              answer: 0,
              explain: '4 goes into 14 three times (that makes 12), with **2** left over. `%` gives the leftover, not the result of the division.',
            },
            {
              type: 'task',
              title: 'Basket total',
              body: `
                Make a \`const\` called \`total\`: the cost of the candles plus delivery. Work it out **from the variables**, so it still works if a price changes.

                Then log \`total\`. It should be **51.5**.
              `,
              js: `
                const candlePrice = 12;
                const candlesBought = 4;
                const delivery = 3.5;

                // Make total here, then log it

              `,
              checks: [
                {
                  text: '`total` is 51.5',
                  test: (c) => near(c.val('total'), 51.5) || (c.val('total') === undefined ? 'No variable called total yet.' : 'total is ' + say(c.val('total')) + '; it should be 51.5.'),
                },
                {
                  text: 'It is worked out from the variables',
                  test: (c) => {
                    const s = c.src('js');
                    return (/candlePrice/.test(s.split(/total\s*=/)[1] || '') && /candlesBought/.test(s.split(/total\s*=/)[1] || '') && /delivery/.test(s.split(/total\s*=/)[1] || '')) || 'Use candlePrice, candlesBought and delivery in your sum, rather than typing the numbers.';
                  },
                },
                { text: 'The console shows `51.5`', test: (c) => c.logs.includes('51.5') || 'Expected 51.5, got ' + logged(c) },
              ],
              hint: 'Multiply the price by the number bought, then add the delivery: `const total = candlePrice * … + …;`',
              solution: {
                js: `
                  const candlePrice = 12;
                  const candlesBought = 4;
                  const delivery = 3.5;

                  const total = candlePrice * candlesBought + delivery;
                  console.log(total);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Which goes first',
              body: `
                Like the maths you did at school, \`*\` and \`/\` happen **before** \`+\` and \`-\`. Brackets go first of all.

                \`\`\`js
                10 + 5 * 2     // 20  (5 * 2 first, then + 10)
                (10 + 5) * 2   // 30  (the brackets first)
                \`\`\`

                That's why \`candlePrice * candlesBought + delivery\` worked without brackets. When in doubt, add brackets: they make your meaning clear to the next reader too.
              `,
            },
            {
              type: 'fill',
              q: 'Two items cost £12 and £8. Add them up, *then* add 20% VAT by multiplying by 1.2. The answer should be 24.',
              code: `const withVat = [[(]]12 + 8[[)]] * 1.2;`,
              options: ['(', ')', '[', ']'],
              explain: 'Without the brackets you would get `12 + 9.6`, which is 21.6. Square brackets mean something else in JavaScript (lists, later).',
            },
            {
              type: 'brief',
              title: 'Shortcuts, and the + trap',
              body: `
                Updating a number is so common it has shortcuts:

                \`\`\`js
                let basket = 0;
                basket += 12;  // same as basket = basket + 12
                basket -= 2;   // same as basket = basket - 2
                basket++;      // add 1
                basket--;      // take 1 away
                \`\`\`

                Now the trap. \`+\` does two jobs: it adds numbers and it **joins text**. If either side is a string, it joins:

                \`\`\`js
                'Total: £' + 20   // 'Total: £20'  (handy)
                '5' + 3           // '53'          (not 8!)
                '5' * 3           // 15            (* has no text meaning, so it converts)
                \`\`\`

                This is the classic form bug: the quantity box gives you \`'5'\`, you add 3, and the basket says 53. Convert first with \`Number()\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Watch the + trap',
              body: 'Press **Run** and compare each line with what you expected.',
              js: `
                console.log('5' + 3);
                console.log('5' - 3);
                console.log('5' * 3);
                console.log(Number('5') + 3);
                console.log('Total: £' + 20);

                let basket = 0;
                basket += 12;
                basket += 8;
                basket++;
                console.log(basket);
              `,
            },
            {
              type: 'quiz',
              q: "What does `'10' + 5` give?",
              options: ["`'105'`", '`15`', '`5`', '`NaN`'],
              answer: 0,
              explain: "One side is a string, so `+` joins them as text: `'105'`. Use `Number('10') + 5` to get 15.",
            },
            {
              type: 'task',
              title: 'Fix the basket count',
              body: `
                The basket shows **12** items when it should show **3**: the number added came from a form, as text.

                1. Fix the bug by converting \`added\` to a number.
                2. Rewrite the adding line using \`+=\`.
                3. The customer then adds one more item: on a new line, use \`++\`.

                The final log should show **4**.
              `,
              js: `
                let itemsInBasket = 1;
                const added = '2'; // from a form, so it's text

                itemsInBasket = itemsInBasket + added;

                console.log(itemsInBasket);
              `,
              checks: [
                {
                  text: '`itemsInBasket` ends up as the number 4',
                  test: (c) => {
                    const v = c.val('itemsInBasket');
                    if (typeof v === 'string') return 'itemsInBasket is the text ' + say(v) + ': the values were joined, not added. Convert added with Number().';
                    if (v === 13) return "itemsInBasket is 13: 1 and '2' were joined into '12', then ++ turned that into a number. Convert added with Number().";
                    return v === 4 || 'itemsInBasket is ' + say(v) + '; it should be 4.';
                  },
                },
                { text: 'You used `+=`', test: (c) => /itemsInBasket\s*\+=/.test(c.src('js')) || 'Rewrite the adding line as itemsInBasket += …' },
                { text: 'You used `++`', test: (c) => /itemsInBasket\s*\+\+|\+\+\s*itemsInBasket/.test(c.src('js')) || 'Add one more with itemsInBasket++;' },
                { text: 'The console shows `4`', test: (c) => c.logs.includes('4') || 'Expected 4, got ' + logged(c) },
              ],
              hint: '```js\nitemsInBasket += Number(added);\nitemsInBasket++;\n```',
              solution: {
                js: `
                  let itemsInBasket = 1;
                  const added = '2'; // from a form, so it's text

                  itemsInBasket += Number(added);
                  itemsInBasket++;

                  console.log(itemsInBasket);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Rounding prices',
              body: `
                Computers store decimals in binary, so some sums come out slightly off:

                \`\`\`js
                0.1 + 0.2   // 0.30000000000000004
                12 * 1.2    // 14.399999999999999
                \`\`\`

                Never show that to a customer. Two tools:

                - \`price.toFixed(2)\` gives exactly two decimal places, for **display**: \`(12 * 1.2).toFixed(2)\` is \`'14.40'\`. Note it gives back a **string**.
                - \`Math.round(x)\` rounds to the nearest whole **number**: \`Math.round(14.4)\` is \`14\`. (\`Math.floor\` always rounds down, \`Math.ceil\` always up.)

                To round to pennies and keep a number: \`Math.round(x * 100) / 100\`.
              `,
            },
            {
              type: 'quiz',
              q: 'What type is `shown` after `const shown = (12 * 1.2).toFixed(2);`?',
              options: ['string', 'number', 'boolean'],
              answer: 0,
              explain: '`toFixed` gives back text, ready to display, such as `"14.40"`. Do your maths with numbers first, and call `toFixed` at the end.',
            },
            {
              type: 'task',
              title: 'Price with VAT',
              body: `
                1. Make a \`const\` called \`priceIncVat\`: \`priceExVat\` plus 20% VAT (multiply by \`1 + vatRate\`)
                2. Log it with **two decimal places** using \`toFixed(2)\`. It should show **23.99**.
                3. Make a \`const\` called \`wholePounds\`: \`priceIncVat\` rounded to the nearest pound with \`Math.round\`. Log it too.
              `,
              js: `
                const priceExVat = 19.99;
                const vatRate = 0.2;

                // 1. priceIncVat

                // 2. log it with two decimals

                // 3. wholePounds, then log it

              `,
              checks: [
                {
                  text: '`priceIncVat` is 19.99 plus 20%',
                  test: (c) => {
                    const v = c.val('priceIncVat');
                    if (v === undefined) return 'No variable called priceIncVat yet.';
                    return (typeof v === 'number' && Math.abs(v - 23.988) < 0.006) || 'priceIncVat is ' + say(v) + '; it should be about 23.988.';
                  },
                },
                { text: 'You logged `23.99` using `toFixed(2)`', test: (c) => (c.logs.includes('23.99') && /toFixed\(\s*2\s*\)/.test(c.src('js'))) || 'Expected 23.99 from toFixed(2), got ' + logged(c) },
                {
                  text: '`wholePounds` is 24, using `Math.round`',
                  test: (c) => (c.val('wholePounds') === 24 && /Math\.round\(/.test(c.src('js'))) || (c.val('wholePounds') === undefined ? 'No variable called wholePounds yet.' : 'wholePounds is ' + say(c.val('wholePounds')) + '; it should be 24, from Math.round().'),
                },
                { text: 'You logged `24`', test: (c) => c.logs.includes('24') || 'Expected 24 in the console. You logged: ' + logged(c) },
              ],
              hint: '```js\nconst priceIncVat = priceExVat * (1 + vatRate);\nconsole.log(priceIncVat.toFixed(2));\n```\n\nThen `Math.round(priceIncVat)` for the whole pounds.',
              solution: {
                js: `
                  const priceExVat = 19.99;
                  const vatRate = 0.2;

                  const priceIncVat = priceExVat * (1 + vatRate);
                  console.log(priceIncVat.toFixed(2));

                  const wholePounds = Math.round(priceIncVat);
                  console.log(wholePounds);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Operators: `+ - * /`, `%` (remainder: `17 % 5` is `2`) and `**` (power).',
                '`*` and `/` go before `+` and `-`. Brackets go first: `(12 + 8) * 1.2`.',
                'Shortcuts: `total += 5`, `total -= 5`, `count++`, `count--`.',
                "`+` joins text if either side is a string: `'5' + 3` is `'53'`. Convert form values with `Number()` first.",
                "`x.toFixed(2)` gives a **string** with two decimals for display. `Math.round(x)` rounds to a whole number; `Math.round(x * 100) / 100` rounds to pennies.",
              ],
            },
          ],
        },

        /* ── 5. Strings ──────────────────────────────────────────────── */
        {
          id: 'js-strings',
          title: 'Strings',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'Template literals',
              body: `
                Building a sentence with \`+\` gets messy fast:

                \`\`\`js
                'Thanks, ' + name + '! Your total is £' + total + '.'
                \`\`\`

                A **template literal** is a string wrapped in **backticks** instead of quotes. Inside it, \`\${…}\` drops in a value:

                \`\`\`js
                const name = 'Priya';
                const total = 24;
                console.log(\`Thanks, \${name}! Your total is £\${total}.\`);
                // Thanks, Priya! Your total is £24.
                \`\`\`

                Anything can go inside \`\${…}\`, including sums: \`\${price * quantity}\`. Template literals can also run over several lines.

                > The backtick key is usually top-left on a UK keyboard, next to **1**. On a Mac it may be next to the left Shift key.
              `,
            },
            {
              type: 'exhibit',
              title: 'Filling in the blanks',
              body: 'Press **Run**. Change the variables, or the sentence.',
              js: `
                const guest = 'Sam';
                const guests = 4;
                const time = '7:30pm';
                const pricePerHead = 25;

                console.log(\`Table for \${guests} at \${time}, booked by \${guest}.\`);
                console.log(\`Set menu: £\${guests * pricePerHead}\`);
              `,
            },
            {
              type: 'fill',
              q: 'Complete the template literal so it drops in the value of `guests`.',
              code: `const msg = \`Table for [[\${]]guests} at \${time}\`;`,
              options: ['${', '$(', '{', '#{'],
              explain: 'A dollar sign and a curly bracket open the slot; a curly bracket closes it. And it only works inside backticks, not quotes.',
            },
            {
              type: 'task',
              title: 'Order confirmation',
              body: `
                Use **one template literal** to log this, built from the variables (work out the total inside \`\${…}\`):

                \`\`\`
                Thanks Sam, you ordered 2 x Lavender candle. Total: £24
                \`\`\`
              `,
              js: `
                const customer = 'Sam';
                const item = 'Lavender candle';
                const qty = 2;
                const price = 12;

                // Log the confirmation with a template literal

              `,
              checks: [
                {
                  text: 'You logged the confirmation',
                  test: (c) => hasLog(c, /^thanks,? sam,? you ordered 2 ?x ?lavender candle[.,]? total: £24(\.00)?\.?$/i) || 'Expected: Thanks Sam, you ordered 2 x Lavender candle. Total: £24. You logged: ' + logged(c),
                },
                { text: 'It uses a template literal with `${…}`', test: (c) => /`[^`]*\$\{[^`]*`/.test(c.src('js')) || 'Use backticks and ${…}, not quotes and +.' },
                { text: 'The values come from the variables', test: (c) => /\$\{\s*customer\s*\}/.test(c.src('js')) && /\$\{\s*item\s*\}/.test(c.src('js')) || 'Drop in ${customer} and ${item} rather than typing the words.' },
                { text: 'The total is worked out inside `${…}`', test: (c) => /\$\{[^}]*(qty\s*\*\s*price|price\s*\*\s*qty)[^}]*\}/.test(c.src('js')) || 'Work out the total in the slot: ${qty * price}' },
              ],
              hint: '```js\nconsole.log(`Thanks ${customer}, you ordered ${qty} x ${item}. Total: £${…}`);\n```',
              solution: {
                js: `
                  const customer = 'Sam';
                  const item = 'Lavender candle';
                  const qty = 2;
                  const price = 12;

                  console.log(\`Thanks \${customer}, you ordered \${qty} x \${item}. Total: £\${qty * price}\`);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Length, case and spaces',
              body: `
                Strings come with built-in tools. \`.length\` is a **property** (a fact about the string). The others are **methods** (actions), so they need brackets \`()\`.

                \`\`\`js
                const code = '  summer10 ';

                code.length          // 11 (spaces count)
                code.trim()          // 'summer10'  (spaces removed from both ends)
                code.toUpperCase()   // '  SUMMER10 '
                code.toLowerCase()   // '  summer10 '
                \`\`\`

                Methods give you a **new** string; the original is unchanged. Chain them to do several at once: \`code.trim().toUpperCase()\` is \`'SUMMER10'\`.

                Why it matters: people type codes, emails and names with stray spaces and random capitals. Trim and lower-case before comparing.
              `,
            },
            {
              type: 'exhibit',
              title: 'Tidying text',
              body: 'Press **Run**. Then try your own name with extra spaces.',
              js: `
                const typed = '  summer10 ';
                console.log(typed.length);

                const clean = typed.trim();
                console.log(clean.length);
                console.log(clean.toUpperCase());

                console.log('PRIYA@EXAMPLE.COM'.toLowerCase());
              `,
            },
            {
              type: 'quiz',
              q: "What is `' Sam '.trim().length`?",
              options: ['`3`', '`5`', '`4`', "`'Sam'`"],
              answer: 0,
              explain: '`trim()` removes the space at each end, leaving `Sam`, and its `length` is 3.',
            },
            {
              type: 'brief',
              title: 'Searching and cutting',
              body: `
                Positions in a string count from **0**: in \`'Candle'\`, \`C\` is at 0 and \`e\` at 5.

                \`\`\`js
                const product = 'Lavender soy candle (large)';

                product.includes('soy')            // true
                product.indexOf('candle')          // 13 (where it starts; -1 if not found)
                product.slice(0, 8)                // 'Lavender' (from 0 up to, not including, 8)
                product.slice(-7)                  // '(large)' (negative counts from the end)
                product.replace('large', 'small')  // 'Lavender soy candle (small)'
                'LE1 5AB'.split(' ')               // ['LE1', '5AB']
                \`\`\`

                - \`includes\` and \`indexOf\` are **case-sensitive**: \`'Soy'\` isn't found.
                - \`replace\` changes the *first* match only. \`replaceAll\` changes every one.
                - \`split\` cuts a string into a **list** at each separator. Lists (arrays) come up properly in a few missions.
              `,
            },
            {
              type: 'exhibit',
              title: 'Search and slice',
              body: 'Press **Run**, then experiment with the numbers in `slice`.',
              js: `
                const product = 'Lavender soy candle (large)';

                console.log(product.includes('soy'));
                console.log(product.includes('Soy'));
                console.log(product.indexOf('candle'));
                console.log(product.slice(0, 8));
                console.log(product.replace('large', 'small'));
                console.log('Mon,Tue,Wed'.split(','));
              `,
            },
            {
              type: 'fill',
              q: "Get the first three letters of the day (`'Sat'`), and check whether a product name mentions 'candle'.",
              code: `
                const short = 'Saturday'.[[slice]](0, 3);
                const isCandle = name.[[includes]]('candle');
              `,
              options: ['slice', 'includes', 'split', 'trim', 'indexOf'],
            },
            {
              type: 'task',
              title: 'Clean a discount code',
              body: `
                A customer typed their code as \`'  summer20 '\`.

                1. \`code\`: the typed text with the spaces removed and in **capitals** (\`'SUMMER20'\`)
                2. \`isSummer\`: whether \`code\` includes \`'SUMMER'\` (\`true\`)
                3. \`percent\`: the digits after \`SUMMER\`, as a **number** (\`20\`). Cut them out with \`slice\`, then convert.
                4. Log a template literal: **Code SUMMER20 gives 20% off**

                Use \`const\` for all three.
              `,
              js: `
                const typed = '  summer20 ';

                // 1. code

                // 2. isSummer

                // 3. percent

                // 4. log the message

              `,
              checks: [
                {
                  text: "`code` is `'SUMMER20'`",
                  test: (c) => c.val('code') === 'SUMMER20' || (c.val('code') === undefined ? 'No variable called code yet.' : 'code is ' + say(c.val('code')) + '. Use trim() and toUpperCase().'),
                },
                {
                  text: '`isSummer` is `true`, using `includes`',
                  test: (c) => (c.val('isSummer') === true && /\.includes\(/.test(c.src('js'))) || (c.val('isSummer') === undefined ? 'No variable called isSummer yet.' : 'isSummer is ' + say(c.val('isSummer')) + '. Use code.includes(\'SUMMER\').'),
                },
                {
                  text: '`percent` is the number 20',
                  test: (c) => {
                    const v = c.val('percent');
                    if (v === '20') return 'percent is the text "20". Convert it with Number().';
                    return v === 20 || (v === undefined ? 'No variable called percent yet.' : 'percent is ' + say(v) + '; it should be 20.');
                  },
                },
                { text: 'You logged *Code SUMMER20 gives 20% off*', test: (c) => hasLog(c, /^code summer20 gives 20% off\.?$/i) || 'Expected Code SUMMER20 gives 20% off, got ' + logged(c) },
                { text: 'The message is a template literal', test: (c) => /`[^`]*\$\{[^`]*`/.test(c.src('js')) || 'Build the message with backticks and ${…}.' },
              ],
              hint: "Chain the tidy-up: `typed.trim().toUpperCase()`. `SUMMER` is 6 letters, so the digits start at position 6: `code.slice(6)`. Wrap that in `Number()`.",
              solution: {
                js: `
                  const typed = '  summer20 ';

                  const code = typed.trim().toUpperCase();
                  const isSummer = code.includes('SUMMER');
                  const percent = Number(code.slice(6));

                  console.log(\`Code \${code} gives \${percent}% off\`);
                `,
              },
            },
            {
              type: 'task',
              title: 'Postcode area',
              body: `
                Delivery prices depend on the first half of the postcode. Starting from \`'le1 5ab'\`, make:

                1. \`upper\`: the postcode in capitals (\`'LE1 5AB'\`)
                2. \`space\`: the position of the space in \`upper\`, using \`indexOf\` (\`3\`)
                3. \`area\`: everything before the space, using \`slice\` and \`space\` (\`'LE1'\`)
                4. \`noSpace\`: \`upper\` with the space replaced by nothing (\`'LE15AB'\`)
              `,
              js: `
                const postcode = 'le1 5ab';

                // upper, space, area and noSpace

              `,
              checks: [
                { text: "`upper` is `'LE1 5AB'`", test: (c) => c.val('upper') === 'LE1 5AB' || 'upper is ' + say(c.val('upper')) + '.' },
                { text: '`space` is 3, using `indexOf`', test: (c) => (c.val('space') === 3 && /\.indexOf\(/.test(c.src('js'))) || 'space is ' + say(c.val('space')) + ". Use upper.indexOf(' ')." },
                {
                  text: "`area` is `'LE1'`, sliced up to `space`",
                  test: (c) => (c.val('area') === 'LE1' && /\.slice\(\s*0\s*,\s*space\s*\)/.test(c.src('js'))) || (c.val('area') === 'LE1' ? 'Right answer, but use upper.slice(0, space) so it works for any postcode.' : 'area is ' + say(c.val('area')) + '.'),
                },
                { text: "`noSpace` is `'LE15AB'`", test: (c) => c.val('noSpace') === 'LE15AB' || 'noSpace is ' + say(c.val('noSpace')) + ". Try upper.replace(' ', '')." },
              ],
              hint: "`slice(0, space)` takes everything from position 0 up to (not including) the space. To remove the space, replace it with an empty string: `''`.",
              solution: {
                js: `
                  const postcode = 'le1 5ab';

                  const upper = postcode.toUpperCase();
                  const space = upper.indexOf(' ');
                  const area = upper.slice(0, space);
                  const noSpace = upper.replace(' ', '');
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'A **template literal** is text in backticks with `${…}` slots for values, e.g. `${qty * price}`. Clearer than joining with `+`.',
                '`.length` counts characters. `.trim()` removes spaces from both ends. `.toUpperCase()` / `.toLowerCase()` change case.',
                'String methods return a **new** string and can be chained: `typed.trim().toLowerCase()`.',
                "Positions start at 0. `.slice(start, end)` cuts out a piece (end not included). `.indexOf('x')` finds a position, or `-1`.",
                "`.includes('soy')` is `true`/`false` and case-sensitive. `.replace(a, b)` swaps the first match. `.split(',')` cuts into a list.",
              ],
            },
          ],
        },
      ],
    },
    /* ════════════════════════════════════════════════════════════════════
       MODULE 2 — Decisions and loops
       ════════════════════════════════════════════════════════════════════ */
    {
      title: 'Decisions and loops',
      missions: [
        /* ── 6. Comparisons and logic ────────────────────────────────── */
        {
          id: 'js-comparisons',
          title: 'Comparisons and logic',
          minutes: 10,
          steps: [
            {
              type: 'brief',
              title: 'Yes-or-no questions',
              body: `
                A **comparison** asks a question and answers with a boolean: \`true\` or \`false\`.

                | Operator | Asks | Example |
                |---|---|---|
                | \`>\` / \`<\` | greater / less than | \`stock > 0\` |
                | \`>=\` / \`<=\` | greater / less than or equal | \`age >= 18\` |
                | \`===\` | exactly equal | \`code === 'SUMMER10'\` |
                | \`!==\` | not equal | \`status !== 'cancelled'\` |

                Watch the difference: a single \`=\` **puts a value in**. Three \`===\` **compares**. Mixing them up is one of the most common beginner bugs.
              `,
            },
            {
              type: 'exhibit',
              title: 'Asking questions',
              body: 'Press **Run**, then change `stock` and `price` and see which answers flip.',
              js: `
                const stock = 3;
                const price = 25;

                console.log(stock > 0);
                console.log(price <= 20);
                console.log(stock === 3);
                console.log(stock !== 0);
                console.log('summer10' === 'SUMMER10');
              `,
              after: 'The last one is `false`: string comparisons are case-sensitive.',
            },
            {
              type: 'quiz',
              q: 'Free delivery is for orders of **£30 or more**. Which test is right for `total`?',
              options: ['`total >= 30`', '`total > 30`', '`total => 30`', '`total = 30`'],
              answer: 0,
              explain: '`>=` includes 30 itself. `>` would leave out an order of exactly £30. `=>` is not a comparison (it means something else, as you\'ll see later), and `=` would set total to 30.',
            },
            {
              type: 'brief',
              title: '=== versus ==',
              body: `
                You'll also see \`==\` (two signs). It **converts types** before comparing, which gives surprising answers:

                \`\`\`js
                '5' == 5      // true  (the text is converted to a number)
                0 == ''       // true  (!)
                '5' === 5     // false (a string is not a number)
                \`\`\`

                \`===\` checks the value **and** the type, so there are no surprises. The same goes for \`!==\` over \`!=\`.

                **The rule: always use \`===\` and \`!==\`.** If the types might differ -- say, a quantity from a form -- convert first: \`Number(qtyText) === 5\`.
              `,
            },
            {
              type: 'fill',
              q: 'The quantity came from a form as text. Check that it is exactly 5, the safe way.',
              code: `const isFive = Number(qtyText) [[===]] 5;`,
              options: ['===', '==', '=', '=>'],
            },
            {
              type: 'task',
              title: 'Stock checks',
              body: `
                Make three \`const\` booleans, each worked out with a comparison:

                1. \`inStock\`: is \`stock\` more than 0? (\`true\`)
                2. \`canFulfil\`: is \`stock\` at least \`ordered\`? (\`false\`)
                3. \`isVip\`: is \`code\` exactly \`'VIP'\`? (\`true\`)

                Use \`===\`, not \`==\`.
              `,
              js: `
                const stock = 4;
                const ordered = 6;
                const code = 'VIP';

                // inStock, canFulfil and isVip

              `,
              checks: [
                { text: '`inStock` is `true`', test: (c) => c.val('inStock') === true || (c.val('inStock') === undefined ? 'No variable called inStock yet.' : 'inStock is ' + say(c.val('inStock')) + '; it should be true.') },
                { text: '`canFulfil` is `false`', test: (c) => c.val('canFulfil') === false || (c.val('canFulfil') === undefined ? 'No variable called canFulfil yet.' : 'canFulfil is ' + say(c.val('canFulfil')) + '; 4 is not at least 6, so it should be false.') },
                { text: '`isVip` is `true`', test: (c) => c.val('isVip') === true || (c.val('isVip') === undefined ? 'No variable called isVip yet.' : 'isVip is ' + say(c.val('isVip')) + '; it should be true.') },
                {
                  text: 'Each one uses a comparison (and `===`, not `==`)',
                  test: (c) => {
                    const s = c.src('js');
                    if (/=\s*(true|false)\s*;?\s*$/m.test(s)) return 'Work each answer out with a comparison rather than typing true or false.';
                    if (/[^=!<>]==[^=]/.test(s)) return 'Use === rather than ==.';
                    return /isVip\s*=\s*[^;\n]*===/.test(s) || "Compare code with ===: code === 'VIP'";
                  },
                },
              ],
              hint: "Each one is a name, `=`, then a question: `const inStock = stock > 0;`. For at least, use `>=`.",
              solution: {
                js: `
                  const stock = 4;
                  const ordered = 6;
                  const code = 'VIP';

                  const inStock = stock > 0;
                  const canFulfil = stock >= ordered;
                  const isVip = code === 'VIP';
                `,
              },
            },
            {
              type: 'brief',
              title: 'And, or, not',
              body: `
                Combine questions with **logical operators**:

                - \`&&\` means **and**: true when *both* sides are true.
                - \`||\` means **or**: true when *at least one* side is true.
                - \`!\` means **not**: it flips true to false, and false to true.

                \`\`\`js
                const isOpen = isWeekday && hour >= 9 && hour < 17;
                const freeDelivery = total >= 30 || isMember;
                const isClosed = !isOpen;
                \`\`\`

                Read them out loud: "is a weekday **and** after 9 **and** before 5".
              `,
            },
            {
              type: 'exhibit',
              title: 'Combining questions',
              body: 'Press **Run**. Try `hour = 18`, or `isMember = false`.',
              js: `
                const hour = 14;
                const isWeekday = true;
                const isOpen = isWeekday && hour >= 9 && hour < 17;
                console.log(isOpen);

                const total = 18;
                const isMember = true;
                console.log(total >= 30 || isMember);

                console.log(!isOpen);
              `,
            },
            {
              type: 'quiz',
              q: 'With `stock = 5` and `paid = false`, what is `stock > 0 && paid`?',
              options: ['`false`', '`true`', '`5`', '`undefined`'],
              answer: 0,
              explain: '`&&` needs both sides to be true. `stock > 0` is true, but `paid` is false, so the whole thing is `false`.',
            },
            {
              type: 'brief',
              title: 'Truthy and falsy',
              body: `
                Anywhere JavaScript expects true or false, it will accept *any* value and treat it as one or the other.

                These six are **falsy** (count as false):

                \`\`\`js
                false   0   ''   null   undefined   NaN
                \`\`\`

                **Everything else is truthy**, including \`'0'\`, \`'false'\` and \`' '\` (a space). They're non-empty text.

                \`Boolean(value)\` shows which way a value goes. A handy use: \`||\` gives back the first truthy value, so it makes a neat default:

                \`\`\`js
                const displayName = typedName || 'Guest';
                // typedName is '' (empty)? Then displayName is 'Guest'.
                \`\`\`
              `,
            },
            {
              type: 'exhibit',
              title: 'Which way does it go?',
              body: 'Press **Run**. Then put your name in `typedName` and run it again.',
              js: `
                console.log(Boolean(0));
                console.log(Boolean(''));
                console.log(Boolean('0'));
                console.log(Boolean('Sam'));
                console.log(Boolean(null));

                const typedName = '';
                const displayName = typedName || 'Guest';
                console.log(displayName);
              `,
            },
            {
              type: 'quiz',
              q: 'Which of these are **falsy**?',
              options: ['`0`', "`''` (empty text)", "`'0'`", '`null`', "`'false'`"],
              answer: [0, 1, 3],
              explain: "`0`, empty text and `null` are on the falsy list. `'0'` and `'false'` are non-empty strings, so they are truthy -- a classic trap.",
            },
            {
              type: 'task',
              title: 'Delivery rules',
              body: `
                Make three \`const\` variables:

                1. \`freeDelivery\`: \`true\` if the basket is £30 or more **or** the customer is a member
                2. \`canOrder\`: \`true\` if the basket is more than 0 **and** the customer is **not** banned
                3. \`displayName\`: \`typedName\`, or \`'Guest'\` if \`typedName\` is empty (use \`||\`)
              `,
              js: `
                const basketTotal = 24;
                const isMember = true;
                const isBanned = false;
                const typedName = '';

                // freeDelivery, canOrder and displayName

              `,
              checks: [
                {
                  text: '`freeDelivery` is `true`, using `||`',
                  test: (c) => (c.val('freeDelivery') === true && /freeDelivery\s*=[^;\n]*\|\|/.test(c.src('js'))) || (c.val('freeDelivery') === undefined ? 'No variable called freeDelivery yet.' : 'freeDelivery is ' + say(c.val('freeDelivery')) + '. Combine basketTotal >= 30 and isMember with ||.'),
                },
                {
                  text: '`canOrder` is `true`, using `&&` and `!`',
                  test: (c) => (c.val('canOrder') === true && /canOrder\s*=[^;\n]*&&/.test(c.src('js')) && /canOrder\s*=[^;\n]*!\s*isBanned/.test(c.src('js'))) || (c.val('canOrder') === undefined ? 'No variable called canOrder yet.' : 'canOrder is ' + say(c.val('canOrder')) + '. Combine basketTotal > 0 and !isBanned with &&.'),
                },
                {
                  text: "`displayName` is `'Guest'`, using `||`",
                  test: (c) => (c.val('displayName') === 'Guest' && /displayName\s*=\s*typedName\s*\|\|/.test(c.src('js'))) || (c.val('displayName') === undefined ? 'No variable called displayName yet.' : 'displayName is ' + say(c.val('displayName')) + ". Use typedName || 'Guest'."),
                },
              ],
              hint: "```js\nconst freeDelivery = basketTotal >= 30 || isMember;\n```\n\nFor `canOrder`, put `!` in front of `isBanned`.",
              solution: {
                js: `
                  const basketTotal = 24;
                  const isMember = true;
                  const isBanned = false;
                  const typedName = '';

                  const freeDelivery = basketTotal >= 30 || isMember;
                  const canOrder = basketTotal > 0 && !isBanned;
                  const displayName = typedName || 'Guest';
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Comparisons give `true` or `false`: `>`, `<`, `>=`, `<=`, `===`, `!==`.',
                '`=` puts a value in; `===` compares. **Always use `===` and `!==`**, never `==` or `!=`, which convert types first.',
                '`&&` is *and* (both true), `||` is *or* (at least one), `!` is *not*.',
                "Falsy values: `false`, `0`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy, even `'0'` and `'false'`.",
                "`value || 'default'` gives the first truthy value: a quick way to fill in a blank.",
              ],
            },
          ],
        },

        /* ── 7. Conditionals ─────────────────────────────────────────── */
        {
          id: 'js-conditionals',
          title: 'Making decisions',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'if',
              body: `
                \`if\` runs some code **only when** a condition is true:

                \`\`\`js
                if (stock === 0) {
                  console.log('Sold out');
                }
                \`\`\`

                - The condition goes in round brackets \`( )\`.
                - The code to run goes in curly brackets \`{ }\`, called a **block**.
                - If the condition is false (or falsy), the whole block is skipped.

                Indent the code inside the block by two spaces. JavaScript doesn't care, but people reading it do.
              `,
            },
            {
              type: 'exhibit',
              title: 'Skipping a block',
              body: 'Press **Run**. Then change `stock` to 5 and run it again.',
              js: `
                const stock = 0;

                if (stock === 0) {
                  console.log('Sold out');
                }

                console.log('This line always runs');
              `,
            },
            {
              type: 'quiz',
              q: "With `const total = 30;`, what does this print?\n\n```js\nif (total > 30) {\n  console.log('Free delivery');\n}\n```",
              options: ['Nothing', '`Free delivery`', '`true`', 'An error'],
              answer: 0,
              explain: '30 is not *more than* 30, so the condition is false and the block is skipped. Nothing is printed.',
            },
            {
              type: 'brief',
              title: 'else and else if',
              body: `
                \`else\` gives a block to run when the condition is false. \`else if\` adds another question in between:

                \`\`\`js
                let greeting;

                if (hour < 12) {
                  greeting = 'Good morning';
                } else if (hour < 18) {
                  greeting = 'Good afternoon';
                } else {
                  greeting = 'Good evening';
                }
                \`\`\`

                JavaScript checks from the top and runs the **first** block whose condition is true, then skips the rest. \`else\` catches everything left over. You can have as many \`else if\`s as you need.

                Notice \`let greeting;\` comes *before* the \`if\`, so the variable exists after it too.
              `,
            },
            {
              type: 'exhibit',
              title: 'Good morning, good evening',
              body: 'Press **Run**, then try `hour` at 9, 15 and 21.',
              js: `
                const hour = 15;
                let greeting;

                if (hour < 12) {
                  greeting = 'Good morning';
                } else if (hour < 18) {
                  greeting = 'Good afternoon';
                } else {
                  greeting = 'Good evening';
                }

                console.log(greeting);
              `,
            },
            {
              type: 'task',
              title: 'Stock label',
              body: `
                Product cards need a label. Make a \`let\` called \`label\` and set it with \`if\` / \`else if\` / \`else\`:

                | When \`stock\` is… | \`label\` is… |
                |---|---|
                | 0 | \`'Sold out'\` |
                | less than 5 | \`'Low stock'\` |
                | anything else | \`'In stock'\` |

                Then log \`label\`. The checker will also try your code with other values of \`stock\`, so test it yourself with 0, 3 and 12.
              `,
              js: `
                const stock = 3;

                // let label, then if / else if / else

              `,
              checks: [
                {
                  text: "With `stock = 3`, `label` is *Low stock*",
                  test: (c) => {
                    const v = c.val('label');
                    if (v === undefined) return c.has('label') ? 'label is undefined. Set it in every branch.' : 'No top-level variable called label. Create it before the if with let label; then set it inside each block.';
                    return /^low stock$/i.test(norm(v)) || 'label is ' + say(v) + '; expected "Low stock".';
                  },
                },
                {
                  text: 'With `stock = 0`, it is *Sold out*',
                  test: (c) => {
                    const r = tryWith(c, 'stock', 0, 'label');
                    return r.missing ? 'Keep the line const stock = 3; at the top so the checker can try other values.' : /^sold out$/i.test(norm(r.value)) || 'With stock = 0, label is ' + say(r.value) + '; expected "Sold out".';
                  },
                },
                {
                  text: 'With `stock = 12` (and 5), it is *In stock*',
                  test: (c) => {
                    const a = tryWith(c, 'stock', 12, 'label').value;
                    const b = tryWith(c, 'stock', 5, 'label').value;
                    if (!/^in stock$/i.test(norm(a))) return 'With stock = 12, label is ' + say(a) + '; expected "In stock".';
                    return /^in stock$/i.test(norm(b)) || 'With stock = 5, label is ' + say(b) + '. 5 is not less than 5, so it should be "In stock".';
                  },
                },
                { text: 'You used `else if` and `else`', test: (c) => (/\belse\s+if\b/.test(c.src('js')) && /\belse\s*\{/.test(c.src('js'))) || 'Use if, then else if, then else.' },
              ],
              hint: "Check for 0 first, then for less than 5:\n\n```js\nlet label;\n\nif (stock === 0) {\n  label = 'Sold out';\n} else if (…) {\n  …\n}\n```",
              solution: {
                js: `
                  const stock = 3;

                  let label;

                  if (stock === 0) {
                    label = 'Sold out';
                  } else if (stock < 5) {
                    label = 'Low stock';
                  } else {
                    label = 'In stock';
                  }

                  console.log(label);
                `,
              },
            },
            {
              type: 'fill',
              q: 'Complete the greeting.',
              code: `
                if (hour < 12) {
                  greeting = 'Good morning';
                } [[else if]] (hour < 18) {
                  greeting = 'Good afternoon';
                } [[else]] {
                  greeting = 'Good evening';
                }
              `,
              options: ['else if', 'else', 'elseif', 'if else'],
              explain: '`else if` is two words, followed by a condition. A plain `else` has no condition.',
            },
            {
              type: 'brief',
              title: 'The ternary operator',
              body: `
                Choosing between **two values** is so common that it has a one-line form:

                \`\`\`js
                const label = stock > 0 ? 'In stock' : 'Sold out';
                \`\`\`

                Read it as: *condition* \`?\` *value if true* \`:\` *value if false*. It's the same as:

                \`\`\`js
                let label;
                if (stock > 0) {
                  label = 'In stock';
                } else {
                  label = 'Sold out';
                }
                \`\`\`

                Use it for short either/or choices. For anything with more than two outcomes, an \`if\` is easier to read.
              `,
            },
            {
              type: 'quiz',
              q: 'With `total = 30`, what is `fee`?\n\n```js\nconst fee = total >= 30 ? 0 : 4.95;\n```',
              options: ['`0`', '`4.95`', '`true`', '`30`'],
              answer: 0,
              explain: '`30 >= 30` is true, so the value before the `:` is chosen: `0`.',
            },
            {
              type: 'task',
              title: 'Delivery fee',
              body: `
                1. Make a \`const\` called \`deliveryFee\` using a **ternary**: \`0\` if \`basketTotal\` is 30 or more, otherwise \`4.95\`.
                2. Log it with a template literal: **Delivery: £4.95**

                The checker will also try other basket totals.
              `,
              js: `
                const basketTotal = 22;

                // deliveryFee, then log it

              `,
              checks: [
                {
                  text: '`deliveryFee` is 4.95 for a £22 basket',
                  test: (c) => c.val('deliveryFee') === 4.95 || (c.val('deliveryFee') === undefined ? 'No variable called deliveryFee yet.' : 'deliveryFee is ' + say(c.val('deliveryFee')) + '; expected 4.95.'),
                },
                {
                  text: 'It is 0 for £30 and £45, and 4.95 for £29.99',
                  test: (c) => {
                    const r = tryWith(c, 'basketTotal', 30, 'deliveryFee');
                    if (r.missing) return 'Keep the line const basketTotal = 22; at the top.';
                    if (r.value !== 0) return 'With a £30 basket, deliveryFee is ' + say(r.value) + '; expected 0.';
                    const b = tryWith(c, 'basketTotal', 45, 'deliveryFee').value;
                    if (b !== 0) return 'With a £45 basket, deliveryFee is ' + say(b) + '; expected 0.';
                    const d = tryWith(c, 'basketTotal', 29.99, 'deliveryFee').value;
                    return d === 4.95 || 'With a £29.99 basket, deliveryFee is ' + say(d) + '; expected 4.95.';
                  },
                },
                { text: 'You used a ternary (`? :`)', test: (c) => /deliveryFee\s*=[^;]*\?[^;]*:/.test(c.src('js')) || 'Write it as const deliveryFee = condition ? 0 : 4.95;' },
                { text: 'You logged *Delivery: £4.95*', test: (c) => hasLog(c, /^delivery:? £?4\.95$/i) || 'Expected Delivery: £4.95, got ' + logged(c) },
              ],
              hint: '```js\nconst deliveryFee = basketTotal >= 30 ? … : …;\nconsole.log(`Delivery: £${deliveryFee}`);\n```',
              solution: {
                js: `
                  const basketTotal = 22;

                  const deliveryFee = basketTotal >= 30 ? 0 : 4.95;
                  console.log(\`Delivery: £\${deliveryFee}\`);
                `,
              },
            },
            {
              type: 'brief',
              title: 'switch, briefly',
              body: `
                When you compare **one value** against a list of exact options, you may see \`switch\`:

                \`\`\`js
                let hours;

                switch (day) {
                  case 'Saturday':
                    hours = '10am-4pm';
                    break;
                  case 'Sunday':
                    hours = 'Closed';
                    break;
                  default:
                    hours = '9am-5pm';
                }
                \`\`\`

                - Each \`case\` is compared with \`===\`.
                - \`break\` ends the switch. **Forget it and JavaScript carries on into the next case** too.
                - \`default\` is the catch-all, like \`else\`.

                An \`if\` / \`else if\` chain does the same job. Use whichever reads better; just recognise \`switch\` when you meet it.
              `,
            },
            {
              type: 'quiz',
              q: 'In a `switch`, what happens if you leave out `break` at the end of a case?',
              options: ['JavaScript carries on and runs the next case as well', 'You get a SyntaxError', 'That case is skipped', 'The switch starts again from the top'],
              answer: 0,
              explain: 'It "falls through" into the next case. Sometimes that is on purpose (two cases sharing one block), but usually it is a bug.',
            },
            {
              type: 'task',
              title: 'Opening hours',
              body: `
                Use a \`switch\` on \`day\` to set a \`let\` called \`hours\`:

                - \`'Saturday'\`: \`'10am-4pm'\`
                - \`'Sunday'\`: \`'Closed'\`
                - any other day: \`'9am-5pm'\`

                Then log a template literal like **Sunday: Closed**.
              `,
              js: `
                const day = 'Sunday';

                // let hours, then a switch

              `,
              checks: [
                { text: "For Sunday, `hours` is *Closed*", test: (c) => /^closed$/i.test(norm(c.val('hours'))) || (c.val('hours') === undefined ? 'No top-level variable called hours (or it is still undefined).' : 'hours is ' + say(c.val('hours')) + '; expected "Closed".') },
                {
                  text: 'Saturday gives *10am-4pm* and Monday gives *9am-5pm*',
                  test: (c) => {
                    const sat = tryWith(c, 'day', 'Saturday', 'hours');
                    if (sat.missing) return "Keep the line const day = 'Sunday'; at the top.";
                    if (norm(sat.value).replace(/\s/g, '').toLowerCase() !== '10am-4pm') return 'For Saturday, hours is ' + say(sat.value) + '; expected "10am-4pm". Did you forget a break?';
                    const mon = tryWith(c, 'day', 'Monday', 'hours').value;
                    return norm(mon).replace(/\s/g, '').toLowerCase() === '9am-5pm' || 'For Monday, hours is ' + say(mon) + '; expected "9am-5pm". Add a default.';
                  },
                },
                { text: 'You used a `switch` with `break`', test: (c) => (/\bswitch\s*\(/.test(c.src('js')) && /\bbreak\b/.test(c.src('js'))) || 'Use switch (day) { case …: …; break; }' },
                { text: 'You logged *Sunday: Closed*', test: (c) => hasLog(c, /^sunday:? closed$/i) || 'Expected Sunday: Closed, got ' + logged(c) },
              ],
              hint: "Copy the shape from the briefing: `case 'Saturday':`, set `hours`, then `break;`. Finish with `default:`.",
              solution: {
                js: `
                  const day = 'Sunday';

                  let hours;

                  switch (day) {
                    case 'Saturday':
                      hours = '10am-4pm';
                      break;
                    case 'Sunday':
                      hours = 'Closed';
                      break;
                    default:
                      hours = '9am-5pm';
                  }

                  console.log(\`\${day}: \${hours}\`);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`if (condition) { … }` runs the block only when the condition is truthy.',
                '`else if (…)` adds more questions; `else` catches the rest. The **first** true branch wins.',
                'Declare a variable *before* the `if` (`let label;`) if you need it afterwards.',
                "Ternary for two-way choices: `const fee = total >= 30 ? 0 : 4.95;`",
                '`switch (value) { case …: …; break; default: … }` compares one value with `===`. Without `break`, it falls through to the next case.',
              ],
            },
          ],
        },

        /* ── 8. Loops ────────────────────────────────────────────────── */
        {
          id: 'js-loops',
          title: 'Loops',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'Doing it again',
              body: `
                A **loop** repeats a block of code. The \`for\` loop is the one you'll use most when you know how many times:

                \`\`\`js
                for (let i = 1; i <= 3; i++) {
                  console.log('Candle ' + i);
                }
                // Candle 1, Candle 2, Candle 3
                \`\`\`

                The brackets hold three parts, separated by semicolons:

                1. **Start**: \`let i = 1\` makes a counter, once.
                2. **Keep going while**: \`i <= 3\` is checked before every round. When it's false, the loop ends.
                3. **After each round**: \`i++\` adds 1 to the counter.

                \`i\` is the traditional name for a counter, but any name works.
              `,
            },
            {
              type: 'exhibit',
              title: 'A price table',
              body: 'Press **Run**. Change `5` to `10`, or the price, and run it again.',
              js: `
                const price = 4;

                for (let qty = 1; qty <= 5; qty++) {
                  console.log(\`\${qty} x £\${price} = £\${qty * price}\`);
                }
              `,
            },
            {
              type: 'quiz',
              q: 'How many times does this loop run?\n\n```js\nfor (let i = 0; i < 4; i++) { … }\n```',
              options: ['4', '3', '5', 'Forever'],
              answer: 0,
              explain: '`i` takes the values 0, 1, 2 and 3. When it reaches 4, `i < 4` is false and the loop stops. Four rounds.',
            },
            {
              type: 'task',
              title: 'Price list',
              body: `
                Use a \`for\` loop to log the price of 1 to 5 candles, one line each, in this format:

                \`\`\`
                1 x £12 = £12
                2 x £12 = £24
                …
                5 x £12 = £60
                \`\`\`

                Use the \`price\` variable, so the list updates if the price changes.
              `,
              js: `
                const price = 12;

                // Your for loop here

              `,
              checks: [
                {
                  text: 'Five lines, from *1 x £12 = £12* to *5 x £12 = £60*',
                  test: (c) => {
                    for (let q = 1; q <= 5; q++) {
                      const want = q + ' x £12 = £' + q * 12;
                      if (!hasLog(c, new RegExp('^' + q + ' ?x ?£12 ?= ?£' + q * 12 + '$'))) return 'Missing the line ' + want + '. You logged: ' + logged(c);
                    }
                    return true;
                  },
                },
                { text: 'You used a `for` loop', test: (c) => /\bfor\s*\(\s*let\b/.test(c.src('js')) || 'Use for (let qty = 1; …; …) { … }' },
                {
                  text: 'It uses `price` (try `price = 5`: the last line becomes *£25*)',
                  test: (c) => {
                    const r = tryWith(c, 'price', 5, 'price');
                    return r.missing ? 'Keep the line const price = 12; at the top.' : r.logs.some((l) => /£25$/.test(norm(l))) || 'With price = 5 the last line should end £25. Work the totals out from price.';
                  },
                },
              ],
              hint: 'Copy the loop from the exhibit and change the numbers: start at 1, keep going while the counter is `<= 5`, and log a template literal with `${qty * price}` in it.',
              solution: {
                js: `
                  const price = 12;

                  for (let qty = 1; qty <= 5; qty++) {
                    console.log(\`\${qty} x £\${price} = £\${qty * price}\`);
                  }
                `,
              },
            },
            {
              type: 'brief',
              title: 'while',
              body: `
                A \`while\` loop keeps going **as long as** its condition is true. Use it when you don't know in advance how many rounds it will take:

                \`\`\`js
                let stock = 10;
                let days = 0;

                while (stock > 0) {
                  stock -= 3;  // sell 3 a day
                  days++;
                }
                console.log(days); // 4
                \`\`\`

                >! Something inside the loop **must** eventually make the condition false. If it never does, you've written an **infinite loop**: a real browser tab freezes. In this app, a loop that runs for more than 1.5 seconds is stopped with an error instead.
              `,
            },
            {
              type: 'exhibit',
              title: 'Selling out',
              body: 'Press **Run**. Then, to see the loop guard at work, put `//` in front of `stock -= 3;` and run it again.',
              js: `
                let stock = 10;
                let days = 0;

                while (stock > 0) {
                  stock -= 3;
                  days++;
                  console.log(\`Day \${days}: \${stock} left\`);
                }

                console.log(\`Sold out after \${days} days\`);
              `,
            },
            {
              type: 'fill',
              q: 'Count down the seats until none are left.',
              code: `
                let seats = 5;
                [[while]] (seats > 0) {
                  seats[[--]];
                }
              `,
              options: ['while', 'for', 'if', '--', '++'],
              explain: '`seats--` takes 1 away each round. With `++` the number would grow forever: an infinite loop.',
            },
            {
              type: 'task',
              title: 'Booking slots',
              body: `
                A barber takes bookings every 2 hours from 9:00, with the last slot **before** 17:00.

                Use a \`while\` loop that runs while \`hour\` is less than 17. In each round:

                1. log the time, like **9:00**
                2. add 1 to \`slots\`
                3. move \`hour\` on by 2

                After the loop, log \`slots\`.
              `,
              js: `
                let hour = 9;
                let slots = 0;

                // Your while loop here

              `,
              checks: [
                {
                  text: 'It logs 9:00, 11:00, 13:00 and 15:00',
                  test: (c) => {
                    const want = ['9:00', '11:00', '13:00', '15:00'];
                    const miss = want.filter((t) => !c.logs.includes(t));
                    return !miss.length || 'Missing ' + miss.join(', ') + '. You logged: ' + logged(c);
                  },
                },
                { text: 'It stops before 17:00', test: (c) => (c.logs.includes('15:00') && !c.logs.includes('17:00')) || (c.logs.includes('17:00') ? '17:00 is too late. Loop while hour < 17.' : false) },
                { text: '`slots` ends up as 4, and is logged', test: (c) => (c.val('slots') === 4 && c.logs.includes('4')) || 'slots is ' + say(c.val('slots')) + '; expected 4, logged after the loop.' },
                { text: 'You used a `while` loop', test: (c) => /\bwhile\s*\(/.test(c.src('js')) || 'Use while (hour < 17) { … }' },
              ],
              hint: '```js\nwhile (hour < 17) {\n  console.log(`${hour}:00`);\n  slots++;\n  hour += 2;\n}\n```\n\nThen log `slots` *after* the closing `}`.',
              solution: {
                js: `
                  let hour = 9;
                  let slots = 0;

                  while (hour < 17) {
                    console.log(\`\${hour}:00\`);
                    slots++;
                    hour += 2;
                  }

                  console.log(slots);
                `,
              },
            },
            {
              type: 'brief',
              title: 'break and continue',
              body: `
                Two keywords change a loop's course from inside:

                - \`break\` **stops the loop** completely. Good for "stop once you've found it".
                - \`continue\` **skips the rest of this round** and moves on to the next.

                \`\`\`js
                for (let hour = 9; hour < 17; hour++) {
                  if (hour === 13) {
                    continue; // lunch: no bookings
                  }
                  if (hour === 15) {
                    break;    // fully booked from 3pm
                  }
                  console.log(\`\${hour}:00\`);
                }
                // 9:00 10:00 11:00 12:00 14:00
                \`\`\`
              `,
            },
            {
              type: 'quiz',
              q: 'What does `continue` do inside a loop?',
              options: ['Skips the rest of this round and goes on to the next', 'Stops the loop completely', 'Starts the loop again from the beginning', 'Pauses the loop for a moment'],
              answer: 0,
              explain: '`continue` jumps straight to the next round. `break` is the one that stops the loop.',
            },
            {
              type: 'task',
              title: 'Hitting the target',
              body: `
                A shop sells 15 candles a day, but is **closed every 7th day** (days 7, 14, 21…). On which day does it reach **100** candles sold?

                Write a \`for\` loop over days 1 to 30:

                1. If the shop is closed that day (\`day % 7 === 0\`), skip it with \`continue\`.
                2. Otherwise add 15 to \`sold\`.
                3. When \`sold\` reaches 100 or more, set \`firstDay\` to the day and stop with \`break\`.
              `,
              js: `
                let sold = 0;
                let firstDay = 0;

                // Your loop here

                console.log(firstDay);
              `,
              checks: [
                {
                  text: '`firstDay` is 8',
                  test: (c) => {
                    const v = c.val('firstDay');
                    if (v === 7) return 'You got 7, but the shop is closed on day 7. Skip it with continue.';
                    return v === 8 || 'firstDay is ' + say(v) + '; expected 8.';
                  },
                },
                { text: '`sold` stops at 105 (the loop ends once the target is hit)', test: (c) => c.val('sold') === 105 || 'sold is ' + say(c.val('sold')) + '; expected 105. Use break when you reach 100.' },
                { text: 'You used `continue` and `break`', test: (c) => (/\bcontinue\b/.test(c.src('js')) && /\bbreak\b/.test(c.src('js'))) || 'Use continue for closed days and break once the target is hit.' },
                { text: 'The console shows `8`', test: (c) => c.logs.includes('8') || 'Expected 8, got ' + logged(c) },
              ],
              hint: '```js\nfor (let day = 1; day <= 30; day++) {\n  if (day % 7 === 0) {\n    continue;\n  }\n  sold += 15;\n  if (sold >= 100) {\n    …\n  }\n}\n```',
              solution: {
                js: `
                  let sold = 0;
                  let firstDay = 0;

                  for (let day = 1; day <= 30; day++) {
                    if (day % 7 === 0) {
                      continue; // closed
                    }
                    sold += 15;
                    if (sold >= 100) {
                      firstDay = day;
                      break;
                    }
                  }

                  console.log(firstDay);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`for (let i = 0; i < 5; i++) { … }`: start; keep going while; after each round.',
                '`while (condition) { … }` repeats as long as the condition is true. Use it when you don\'t know how many rounds.',
                'Make sure the condition eventually becomes false, or you have an **infinite loop**. (This app stops loops after 1.5 seconds; a real browser freezes.)',
                '`break` stops the loop. `continue` skips to the next round.',
                '`n % 7 === 0` is true for every 7th number: a handy way to spot "every so often".',
              ],
            },
          ],
        },

        /* ── 9. Arrays ───────────────────────────────────────────────── */
        {
          id: 'js-arrays',
          title: 'Arrays',
          minutes: 11,
          steps: [
            {
              type: 'brief',
              title: 'Lists of values',
              body: `
                An **array** holds a list of values, in order, inside square brackets:

                \`\`\`js
                const sizes = ['Small', 'Medium', 'Large'];
                const prices = [8, 12, 15];
                \`\`\`

                Each item has a numbered position, its **index**, counting from **0**:

                \`\`\`js
                sizes[0]                 // 'Small'
                sizes[2]                 // 'Large'
                sizes[3]                 // undefined (there's nothing there)
                sizes.length             // 3
                sizes[sizes.length - 1]  // 'Large' (always the last item)
                \`\`\`

                The console shows an array like this: \`["Small", "Medium", "Large"]\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Reading a list',
              body: 'Press **Run**. Add a fourth size and see what changes.',
              js: `
                const sizes = ['Small', 'Medium', 'Large'];

                console.log(sizes);
                console.log(sizes[0]);
                console.log(sizes.length);
                console.log(sizes[sizes.length - 1]);
                console.log(sizes[5]);
              `,
            },
            {
              type: 'quiz',
              q: "With `const sizes = ['S', 'M', 'L'];`, what is `sizes[1]`?",
              options: ["`'M'`", "`'S'`", "`'L'`", '`undefined`'],
              answer: 0,
              explain: "Indexes start at 0, so `sizes[0]` is `'S'` and `sizes[1]` is the *second* item, `'M'`.",
            },
            {
              type: 'task',
              title: "Today's specials",
              body: `
                1. Make a \`const\` array called \`specials\` with three strings: **Croissant**, **Sourdough** and **Brownie**, in that order.
                2. Log the first item.
                3. Log how many items there are.
                4. Make a \`const\` called \`lastItem\` holding the last item. Use \`length\`, so it would still work with a longer list.
              `,
              js: `
                // specials, then the logs, then lastItem

              `,
              checks: [
                {
                  text: '`specials` holds the three items',
                  test: (c) => {
                    const v = c.val('specials');
                    if (!Array.isArray(v)) return v === undefined ? 'No variable called specials yet.' : 'specials should be an array, in square brackets.';
                    return same(v, ['Croissant', 'Sourdough', 'Brownie']) || 'specials is ' + say(v) + '.';
                  },
                },
                { text: 'You logged the first item and the length', test: (c) => (c.logs.includes('Croissant') && c.logs.includes('3')) || 'Expected Croissant and 3 in the console. You logged: ' + logged(c) },
                {
                  text: "`lastItem` is *Brownie*, found with `length`",
                  test: (c) => (c.val('lastItem') === 'Brownie' && /specials\s*\[\s*specials\.length\s*-\s*1\s*\]/.test(c.src('js'))) || (c.val('lastItem') === 'Brownie' ? 'Right answer. Now get it with specials[specials.length - 1] so it works for any length.' : 'lastItem is ' + say(c.val('lastItem')) + '.'),
                },
              ],
              hint: "```js\nconst specials = ['Croissant', '…', '…'];\nconsole.log(specials[0]);\n```\n\nThe last index is always one less than the length.",
              solution: {
                js: `
                  const specials = ['Croissant', 'Sourdough', 'Brownie'];

                  console.log(specials[0]);
                  console.log(specials.length);

                  const lastItem = specials[specials.length - 1];
                `,
              },
            },
            {
              type: 'brief',
              title: 'Adding and removing',
              body: `
                Arrays can change, even when made with \`const\`. (\`const\` stops you replacing the whole list, not changing what's in it.)

                \`\`\`js
                const queue = ['Ali', 'Beth'];

                queue.push('Cara');      // add to the end    → ['Ali', 'Beth', 'Cara']
                queue.unshift('Zed');    // add to the start  → ['Zed', 'Ali', 'Beth', 'Cara']
                const last = queue.pop();    // remove the end   → last is 'Cara'
                const first = queue.shift(); // remove the start → first is 'Zed'

                queue[0] = 'Alice';      // replace an item by its index
                \`\`\`

                \`pop\` and \`shift\` give back the item they removed, so you can keep it in a variable.
              `,
            },
            {
              type: 'fill',
              q: 'Cara joins the end of the queue. Then the first person in the queue is served.',
              code: `
                const queue = ['Ali', 'Beth'];
                queue.[[push]]('Cara');
                const next = queue.[[shift]]();
              `,
              options: ['push', 'pop', 'shift', 'unshift'],
              explain: '`push` adds to the end. `shift` removes from the start, and gives you the item: `next` is `Ali`.',
            },
            {
              type: 'task',
              title: 'Waiting list',
              body: `
                A barber keeps a waiting list. In order:

                1. **Dan** arrives: add him to the end.
                2. **Eve** has a priority booking: add her to the front.
                3. Serve the first person: remove them from the front, into a \`const\` called \`served\`.
                4. Log \`waitingList\`.
              `,
              js: `
                const waitingList = ['Ali', 'Beth', 'Cara'];

                // 1. Dan joins the end

                // 2. Eve goes to the front

                // 3. const served = …

                // 4. log the list

              `,
              checks: [
                { text: "`served` is *Eve*", test: (c) => c.val('served') === 'Eve' || (c.val('served') === undefined ? 'No variable called served yet.' : 'served is ' + say(c.val('served')) + '; Eve should be at the front when you serve.') },
                {
                  text: 'The list ends as Ali, Beth, Cara, Dan',
                  test: (c) => same(c.val('waitingList'), ['Ali', 'Beth', 'Cara', 'Dan']) || 'waitingList is ' + say(c.val('waitingList')) + '.',
                },
                { text: 'You used `push`, `unshift` and `shift`', test: (c) => (/\.push\(/.test(c.src('js')) && /\.unshift\(/.test(c.src('js')) && /\.shift\(/.test(c.src('js'))) || 'Use push, unshift and shift.' },
                { text: 'You logged the list', test: (c) => c.logs.includes('["Ali", "Beth", "Cara", "Dan"]') || 'Expected ["Ali", "Beth", "Cara", "Dan"], got ' + logged(c) },
              ],
              hint: "```js\nwaitingList.push('Dan');\n```\n\nThen `unshift` for the front, and `const served = waitingList.shift();`.",
              solution: {
                js: `
                  const waitingList = ['Ali', 'Beth', 'Cara'];

                  waitingList.push('Dan');
                  waitingList.unshift('Eve');
                  const served = waitingList.shift();

                  console.log(waitingList);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Searching and slicing',
              body: `
                Several string tools have array versions:

                \`\`\`js
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                days.includes('Sun')   // false
                days.indexOf('Wed')    // 2 (or -1 if it isn't there)
                days.slice(0, 5)       // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] (a copy; days is unchanged)
                days.join(', ')        // 'Mon, Tue, Wed, Thu, Fri, Sat' (one string)
                \`\`\`

                \`join\` is the opposite of a string's \`split\`: it glues the items into text, with whatever you pass in between them.
              `,
            },
            {
              type: 'exhibit',
              title: 'Opening days',
              body: 'Press **Run**. Try a different separator in `join`, like `\' / \'`.',
              js: `
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                console.log(days.includes('Sun'));
                console.log(days.indexOf('Wed'));
                console.log(days.slice(0, 5));
                console.log(days.slice(-2));
                console.log(days.join(', '));
                console.log(\`Open \${days.join(', ')}\`);
              `,
            },
            {
              type: 'quiz',
              q: "What is `['Mon', 'Tue'].join(' and ')`?",
              options: ['`Mon and Tue`', '`["Mon", "Tue"]`', '`Mon,Tue`', '`Mon and Tue and`'],
              answer: 0,
              explain: '`join` puts the separator *between* the items, not after the last one, and gives back a single string.',
            },
            {
              type: 'task',
              title: 'Open or closed',
              body: `
                Using \`openDays\`, make:

                1. \`isOpenSunday\`: whether the list includes \`'Sun'\`
                2. \`wedPosition\`: the index of \`'Wed'\`
                3. \`weekdays\`: the first five days, using \`slice\`
                4. \`summary\`: all the days joined with \`', '\` (\`'Mon, Tue, Wed, Thu, Fri, Sat'\`)
              `,
              js: `
                const openDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                // isOpenSunday, wedPosition, weekdays and summary

              `,
              checks: [
                { text: '`isOpenSunday` is `false`, using `includes`', test: (c) => (c.val('isOpenSunday') === false && /\.includes\(/.test(c.src('js'))) || 'isOpenSunday is ' + say(c.val('isOpenSunday')) + ". Use openDays.includes('Sun')." },
                { text: '`wedPosition` is 2, using `indexOf`', test: (c) => (c.val('wedPosition') === 2 && /\.indexOf\(/.test(c.src('js'))) || 'wedPosition is ' + say(c.val('wedPosition')) + '.' },
                { text: '`weekdays` is Mon to Fri', test: (c) => same(c.val('weekdays'), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) || 'weekdays is ' + say(c.val('weekdays')) + '. slice(0, 5) takes indexes 0 to 4.' },
                { text: "`summary` is *Mon, Tue, Wed, Thu, Fri, Sat*", test: (c) => c.val('summary') === 'Mon, Tue, Wed, Thu, Fri, Sat' || 'summary is ' + say(c.val('summary')) + ". Use join(', ')." },
              ],
              hint: "Each one is a single method call on `openDays`: `includes('Sun')`, `indexOf('Wed')`, `slice(0, 5)`, `join(', ')`.",
              solution: {
                js: `
                  const openDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                  const isOpenSunday = openDays.includes('Sun');
                  const wedPosition = openDays.indexOf('Wed');
                  const weekdays = openDays.slice(0, 5);
                  const summary = openDays.join(', ');
                `,
              },
            },
            {
              type: 'task',
              title: 'Loop through a list',
              body: `
                A \`for\` loop and an index let you visit every item in turn:

                \`\`\`js
                for (let i = 0; i < prices.length; i++) {
                  console.log(prices[i]);
                }
                \`\`\`

                Use this pattern to add up \`prices\` into \`total\`, then log \`total\` (it should be **24.5**). Use \`prices.length\` rather than 3, so it works for any list.
              `,
              js: `
                const prices = [4, 12.5, 8];
                let total = 0;

                // Loop over prices and add each one to total

                console.log(total);
              `,
              checks: [
                { text: '`total` is 24.5', test: (c) => near(c.val('total'), 24.5) || 'total is ' + say(c.val('total')) + '; expected 24.5.' },
                { text: 'The loop uses `prices.length` and `prices[i]`', test: (c) => (/prices\.length/.test(c.src('js')) && /prices\s*\[\s*\w+\s*\]/.test(c.src('js'))) || 'Loop while i < prices.length, and add prices[i] each round.' },
                {
                  text: 'It works for any list (with `[1, 2, 3]` it gives 6)',
                  test: (c) => {
                    const r = tryWith(c, 'prices', [1, 2, 3], 'total');
                    return r.missing ? 'Keep the line const prices = [4, 12.5, 8]; at the top.' : r.value === 6 || 'With [1, 2, 3], total is ' + say(r.value) + '; expected 6.';
                  },
                },
                { text: 'The console shows `24.5`', test: (c) => c.logs.includes('24.5') || 'Expected 24.5, got ' + logged(c) },
              ],
              hint: 'Inside the loop: `total += prices[i];`',
              solution: {
                js: `
                  const prices = [4, 12.5, 8];
                  let total = 0;

                  for (let i = 0; i < prices.length; i++) {
                    total += prices[i];
                  }

                  console.log(total);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "An **array** is an ordered list: `const sizes = ['S', 'M', 'L'];`. Indexes start at **0**: `sizes[0]` is `'S'`.",
                '`.length` is the number of items. The last item is `list[list.length - 1]`.',
                '`push` / `pop` add and remove at the **end**; `unshift` / `shift` at the **start**. `pop` and `shift` give back the removed item.',
                "`includes(x)` is true/false, `indexOf(x)` gives a position or `-1`, `slice(a, b)` copies part, `join(', ')` makes one string.",
                'Loop with an index: `for (let i = 0; i < list.length; i++) { list[i] }`.',
              ],
            },
          ],
        },

        /* ── 10. Looping over arrays ─────────────────────────────────── */
        {
          id: 'js-array-methods',
          title: 'Looping over arrays',
          minutes: 13,
          steps: [
            {
              type: 'brief',
              title: 'for...of',
              body: `
                When you want every item and don't care about its index, \`for...of\` is simpler than counting:

                \`\`\`js
                const basket = ['Candle', 'Wax melts', 'Matches'];

                for (const item of basket) {
                  console.log(item);
                }
                \`\`\`

                Each round, \`item\` holds the next value in the list. There's no counter to set up and nothing to get wrong. You can use \`const\` here because each round gets a fresh \`item\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Every item',
              body: 'Press **Run**. Add an item to the list.',
              js: `
                const basket = ['Candle', 'Wax melts', 'Matches'];

                for (const item of basket) {
                  console.log(\`- \${item}\`);
                }

                let count = 0;
                for (const item of basket) {
                  count++;
                }
                console.log(\`\${count} items\`);
              `,
            },
            {
              type: 'task',
              title: 'Add up the basket',
              body: `
                Use a \`for...of\` loop to add every price into \`total\`. Then log **Total: £40** with a template literal.
              `,
              js: `
                const prices = [12, 4.5, 8, 15.5];
                let total = 0;

                // for...of loop here, then log the total

              `,
              checks: [
                { text: '`total` is 40', test: (c) => near(c.val('total'), 40) || 'total is ' + say(c.val('total')) + '; expected 40.' },
                { text: 'You used `for...of`', test: (c) => /\bfor\s*\(\s*(const|let)\s+\w+\s+of\s+prices\s*\)/.test(c.src('js')) || 'Use for (const price of prices) { … }' },
                {
                  text: 'It works for any list (with `[1, 2]` it gives 3)',
                  test: (c) => {
                    const r = tryWith(c, 'prices', [1, 2], 'total');
                    return r.missing ? 'Keep the line const prices = […]; at the top.' : r.value === 3 || 'With [1, 2], total is ' + say(r.value) + '; expected 3.';
                  },
                },
                { text: 'You logged *Total: £40*', test: (c) => hasLog(c, /^total:? £40(\.00)?$/i) || 'Expected Total: £40, got ' + logged(c) },
              ],
              hint: '```js\nfor (const price of prices) {\n  total += price;\n}\n```',
              solution: {
                js: `
                  const prices = [12, 4.5, 8, 15.5];
                  let total = 0;

                  for (const price of prices) {
                    total += price;
                  }

                  console.log(\`Total: £\${total}\`);
                `,
              },
            },
            {
              type: 'brief',
              title: 'forEach and map',
              body: `
                Arrays also have methods that do the looping for you. You hand them a tiny function saying what to do with each item:

                \`\`\`js
                price => price * 2
                \`\`\`

                Read \`=>\` as "*becomes*": each \`price\` becomes \`price * 2\`. (You'll learn functions properly in the next module. For now this pattern is all you need.)

                - \`forEach\` **does something** with each item:

                  \`\`\`js
                  names.forEach(name => console.log(\`Hi \${name}\`));
                  \`\`\`

                - \`map\` makes a **new array** of the results, same length as the original:

                  \`\`\`js
                  const prices = [10, 20, 30];
                  const withVat = prices.map(price => price * 1.2);   // [12, 24, 36]
                  \`\`\`

                The original array is left alone.
              `,
            },
            {
              type: 'exhibit',
              title: 'map in action',
              body: 'Press **Run**. Change what each item *becomes*.',
              js: `
                const names = ['Priya', 'Sam', 'Ali'];
                names.forEach(name => console.log(\`Hi \${name}\`));

                const prices = [10, 20, 30];
                const doubled = prices.map(price => price * 2);
                const labels = prices.map(price => \`£\${price}.00\`);

                console.log(doubled);
                console.log(labels);
                console.log(prices);
              `,
            },
            {
              type: 'quiz',
              q: 'What is `[1, 2, 3].map(n => n * 10)`?',
              options: ['`[10, 20, 30]`', '`60`', '`[1, 2, 3]`', '`[1, 2, 3, 10]`'],
              answer: 0,
              explain: '`map` gives a new array with each item transformed. It does not add them up (that is `reduce`, coming soon) or change the original.',
            },
            {
              type: 'brief',
              title: 'filter, find and some',
              body: `
                These three take a tiny function that answers **true or false** for each item:

                \`\`\`js
                const prices = [20, 8, 35, 4];

                prices.filter(p => p < 10)   // [8, 4]  every item that passes
                prices.find(p => p > 30)     // 35      the first item that passes
                prices.find(p => p > 100)    // undefined (none did)
                prices.some(p => p === 0)    // false   does *any* item pass?
                \`\`\`

                - \`filter\` gives an **array** (maybe empty).
                - \`find\` gives **one item** (or \`undefined\`).
                - \`some\` gives **true or false**.
              `,
            },
            {
              type: 'fill',
              q: 'Get every price under £10, then the first price over £100 (if any).',
              code: `
                const cheap = prices.[[filter]](p => p < 10);
                const luxury = prices.[[find]](p => p > 100);
              `,
              options: ['filter', 'find', 'map', 'some'],
              explain: '`filter` for all the matches, as an array. `find` for the first match only.',
            },
            {
              type: 'task',
              title: 'Half-price sale',
              body: `
                Using \`prices\`, make four \`const\` variables:

                1. \`salePrices\`: every price halved, using \`map\`
                2. \`under10\`: the original prices below 10, using \`filter\`
                3. \`firstOver30\`: the first original price over 30, using \`find\`
                4. \`anyFree\`: whether any price is exactly 0, using \`some\`
              `,
              js: `
                const prices = [20, 8, 35, 12.5, 4];

                // salePrices, under10, firstOver30 and anyFree

              `,
              checks: [
                { text: '`salePrices` is `[10, 4, 17.5, 6.25, 2]`', test: (c) => (same(c.val('salePrices'), [10, 4, 17.5, 6.25, 2]) && /\.map\(/.test(c.src('js'))) || 'salePrices is ' + say(c.val('salePrices')) + '. Use prices.map(p => p / 2).' },
                { text: '`under10` is `[8, 4]`', test: (c) => (same(c.val('under10'), [8, 4]) && /\.filter\(/.test(c.src('js'))) || 'under10 is ' + say(c.val('under10')) + '. Use prices.filter(…).' },
                { text: '`firstOver30` is 35', test: (c) => (c.val('firstOver30') === 35 && /\.find\(/.test(c.src('js'))) || 'firstOver30 is ' + say(c.val('firstOver30')) + '. Use prices.find(…).' },
                { text: '`anyFree` is `false`', test: (c) => (c.val('anyFree') === false && /\.some\(/.test(c.src('js'))) || 'anyFree is ' + say(c.val('anyFree')) + '. Use prices.some(p => p === 0).' },
              ],
              hint: "Each one is `prices.method(p => …)`. For `map`, say what each price *becomes*. For the other three, write a true/false question about `p`.",
              solution: {
                js: `
                  const prices = [20, 8, 35, 12.5, 4];

                  const salePrices = prices.map(p => p / 2);
                  const under10 = prices.filter(p => p < 10);
                  const firstOver30 = prices.find(p => p > 30);
                  const anyFree = prices.some(p => p === 0);
                `,
              },
            },
            {
              type: 'brief',
              title: 'reduce and sort',
              body: `
                \`reduce\` boils a whole array down to **one value**, such as a total:

                \`\`\`js
                const total = prices.reduce((sum, p) => sum + p, 0);
                \`\`\`

                The \`0\` is the starting value. Each round, \`sum\` is the total so far and \`p\` is the next item; what you return becomes the new \`sum\`.

                \`sort\` puts an array in order (and **changes the original**). But by default it sorts everything **as text**, so numbers go wrong:

                \`\`\`js
                [25, 100, 3].sort()                  // [100, 25, 3]  ('1' comes before '2' and '3')
                [25, 100, 3].sort((a, b) => a - b)   // [3, 25, 100]  low to high
                [25, 100, 3].sort((a, b) => b - a)   // [100, 25, 3]  high to low
                \`\`\`

                For numbers, always pass \`(a, b) => a - b\` (or \`b - a\`). Plain \`sort()\` is fine for words.
              `,
            },
            {
              type: 'exhibit',
              title: 'Totals and order',
              body: 'Press **Run**. Notice the first sorted list.',
              js: `
                const sales = [120, 45, 300, 8, 72];

                const total = sales.reduce((sum, s) => sum + s, 0);
                console.log(total);

                console.log(sales.slice().sort());
                console.log(sales.slice().sort((a, b) => a - b));

                const names = ['Sam', 'Priya', 'Ali'];
                console.log(names.sort());
              `,
              after: '`slice()` with nothing in the brackets makes a copy, so sorting the copy leaves `sales` as it was.',
            },
            {
              type: 'quiz',
              q: 'What does `[9, 10, 2].sort()` give?',
              options: ['`[10, 2, 9]`', '`[2, 9, 10]`', '`[10, 9, 2]`', '`[9, 10, 2]`'],
              answer: 0,
              explain: "Without a compare function, `sort` compares as text: `'10'` comes before `'2'` because `'1'` comes before `'2'`. Use `.sort((a, b) => a - b)` for numbers.",
            },
            {
              type: 'task',
              title: 'Best sellers',
              body: `
                1. \`totalSales\`: all the sales added up, using \`reduce\` (it should be 545)
                2. \`sorted\`: the sales from **highest to lowest**, using \`sort\` with a compare function
                3. Log the top sale as **Top sale: 300**, using \`sorted[0]\`
              `,
              js: `
                const sales = [120, 45, 300, 8, 72];

                // totalSales, sorted, then log the top sale

              `,
              checks: [
                { text: '`totalSales` is 545, using `reduce`', test: (c) => (c.val('totalSales') === 545 && /\.reduce\(/.test(c.src('js'))) || (c.val('totalSales') === undefined ? 'No variable called totalSales yet.' : 'totalSales is ' + say(c.val('totalSales')) + '. Did you start reduce at 0?') },
                {
                  text: '`sorted` is `[300, 120, 72, 45, 8]`',
                  test: (c) => {
                    const v = c.val('sorted');
                    if (same(v, [120, 300, 45, 72, 8])) return "That's text order. Pass a compare function: sort((a, b) => b - a).";
                    if (same(v, [8, 45, 72, 120, 300])) return "That's low to high. Swap it round: b - a.";
                    return same(v, [300, 120, 72, 45, 8]) || 'sorted is ' + say(v) + '.';
                  },
                },
                { text: 'You logged *Top sale: 300*', test: (c) => (hasLog(c, /^top sale:? £?300$/i) ? /sorted\s*\[\s*0\s*\]/.test(c.src('js')) || 'Use sorted[0] for the top sale rather than typing 300.' : 'Expected Top sale: 300 (from sorted[0]), got ' + logged(c)) },
              ],
              hint: '```js\nconst totalSales = sales.reduce((sum, s) => sum + s, 0);\nconst sorted = sales.slice().sort((a, b) => …);\n```',
              solution: {
                js: `
                  const sales = [120, 45, 300, 8, 72];

                  const totalSales = sales.reduce((sum, s) => sum + s, 0);
                  const sorted = sales.slice().sort((a, b) => b - a);

                  console.log(\`Top sale: \${sorted[0]}\`);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`for (const item of list) { … }` visits every item, no counter needed.',
                '`forEach(x => …)` does something with each item. `map(x => …)` makes a new array of results.',
                '`filter` gives every match (an array), `find` the first match (or `undefined`), `some` true/false.',
                '`reduce((sum, x) => sum + x, 0)` adds a list up. The `0` is the starting value.',
                '`sort()` sorts as **text**, so `[9, 10, 2]` becomes `[10, 2, 9]`. For numbers use `sort((a, b) => a - b)` (low to high) or `b - a`. `sort` changes the original; sort a `slice()` copy to keep it.',
              ],
            },
          ],
        },
      ],
    },
    /* ════════════════════════════════════════════════════════════════════
       MODULE 3 — Functions and objects
       ════════════════════════════════════════════════════════════════════ */
    {
      title: 'Functions and objects',
      missions: [
        /* ── 11. Functions ───────────────────────────────────────────── */
        {
          id: 'js-functions',
          title: 'Functions',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'Reusable recipes',
              body: `
                A **function** is a named block of code you can run whenever you like, as many times as you like. Write it once, use it everywhere.

                \`\`\`js
                function greet() {
                  console.log('Welcome to Fade Masters');
                }

                greet();
                greet();
                \`\`\`

                - \`function greet() { … }\` **defines** it. This doesn't run anything yet; it just stores the recipe.
                - \`greet()\` **calls** it: runs the code inside. The brackets are what make it run.

                Name functions after what they *do*: \`showBasket\`, \`addVat\`, \`isOpen\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Define once, call often',
              body: 'Press **Run**. Add a third `greet();` line, or delete them all and see what happens.',
              js: `
                function greet() {
                  console.log('Welcome to Fade Masters');
                  console.log('Book online or walk in');
                }

                greet();
                console.log('---');
                greet();
              `,
            },
            {
              type: 'quiz',
              q: "What does this code print?\n\n```js\nfunction sayHi() {\n  console.log('Hi');\n}\n```",
              options: ['Nothing', '`Hi`', '`sayHi`', 'An error'],
              answer: 0,
              explain: 'The function is defined but never **called**. Nothing runs until something writes `sayHi();`.',
            },
            {
              type: 'brief',
              title: 'Parameters',
              body: `
                A function gets more useful when you can hand it values. **Parameters** are named slots in the brackets:

                \`\`\`js
                function greet(name) {
                  console.log(\`Welcome back, \${name}!\`);
                }

                greet('Priya');  // Welcome back, Priya!
                greet('Sam');    // Welcome back, Sam!
                \`\`\`

                When you call \`greet('Priya')\`, the value \`'Priya'\` (the **argument**) goes into the slot \`name\` for that run. Several parameters are separated by commas: \`function book(name, time) { … }\`.
              `,
            },
            {
              type: 'task',
              title: 'A welcome message',
              body: `
                1. Write a function called \`welcome\` with one parameter, \`name\`. It logs **Welcome back, NAME!** (using the name it was given).
                2. Call it with \`'Priya'\`.

                The checker will also call it with other names.
              `,
              js: `
                // function welcome(name) { … }

                // call it with 'Priya'

              `,
              checks: [
                { text: 'There is a function called `welcome`', test: (c) => !!c.fn('welcome') || noFn('welcome') },
                { text: 'You called it: *Welcome back, Priya!* is logged', test: (c) => hasLog(c, /^welcome back,? priya!?$/i) || 'Expected Welcome back, Priya! in the console. You logged: ' + logged(c) },
                {
                  text: "It uses the name it is given (`welcome('Sam')` says *Sam*)",
                  test: (c) => {
                    const out = c.call('welcome', 'Sam').logs;
                    return out.some((l) => /^welcome back,? sam!?$/i.test(norm(l))) || "welcome('Sam') logged " + (out.join(' | ') || 'nothing') + '. Use ${name} in the message.';
                  },
                },
              ],
              hint: '```js\nfunction welcome(name) {\n  console.log(`Welcome back, ${name}!`);\n}\n```\n\nThen call it on its own line, outside the function.',
              solution: {
                js: `
                  function welcome(name) {
                    console.log(\`Welcome back, \${name}!\`);
                  }

                  welcome('Priya');
                `,
              },
            },
            {
              type: 'brief',
              title: 'return: handing back a result',
              body: `
                \`console.log\` only *shows* a value. To let the rest of your code **use** a function's answer, \`return\` it:

                \`\`\`js
                function addVat(price) {
                  return price * 1.2;
                }

                const shirt = addVat(10);              // 12
                const total = addVat(10) + addVat(5);  // 18
                \`\`\`

                - The call \`addVat(10)\` is replaced by whatever the function returns.
                - \`return\` ends the function straight away. Nothing after it runs.
                - A function with no \`return\` gives back \`undefined\`.

                Rule of thumb: functions that **work something out** should \`return\` it. Leave logging to the code that calls them.
              `,
            },
            {
              type: 'exhibit',
              title: 'Showing versus returning',
              body: 'Press **Run**. Both functions *look* like they work, but only one gives you something to keep.',
              js: `
                function showVat(price) {
                  console.log(price * 1.2);
                }

                function addVat(price) {
                  return price * 1.2;
                }

                const a = showVat(10);
                const b = addVat(10);

                console.log('a is', a);
                console.log('b is', b);
                console.log('b + 5 is', b + 5);
              `,
            },
            {
              type: 'quiz',
              q: 'Using the exhibit, what is stored in `a` after `const a = showVat(10);`?',
              options: ['`undefined`', '`12`', '`10`', "`'12'`"],
              answer: 0,
              explain: '`showVat` logs 12 but returns nothing, so `a` gets `undefined`. Only `return` hands a value back.',
            },
            {
              type: 'task',
              title: 'Line total',
              body: `
                Write a function called \`lineTotal\` with two parameters, \`price\` and \`quantity\`. It **returns** the price multiplied by the quantity.

                Then log \`lineTotal(12, 3)\`. The checker will call your function with other values too.
              `,
              js: `
                // function lineTotal(price, quantity) { … }

              `,
              checks: [
                { text: 'There is a function called `lineTotal`', test: (c) => !!c.fn('lineTotal') || noFn('lineTotal') },
                {
                  text: '`lineTotal(12, 3)` returns 36',
                  test: (c) => {
                    const r = c.call('lineTotal', 12, 3);
                    if (r.result === undefined && r.logs.includes('36')) return "Your function logs 36 but doesn't return it. Use return.";
                    return r.result === 36 || 'Expected 36, got ' + say(r.result);
                  },
                },
                {
                  text: 'It works for other values: `(4.5, 2)` is 9 and `(10, 0)` is 0',
                  test: (c) => {
                    const a = c.call('lineTotal', 4.5, 2).result;
                    if (a !== 9) return 'lineTotal(4.5, 2) returned ' + say(a) + '; expected 9.';
                    const b = c.call('lineTotal', 10, 0).result;
                    return b === 0 || 'lineTotal(10, 0) returned ' + say(b) + '; expected 0.';
                  },
                },
                { text: 'You logged `lineTotal(12, 3)`', test: (c) => /console\.log\(\s*lineTotal\(/.test(c.src('js')) || 'Log the result: console.log(lineTotal(12, 3));' },
              ],
              hint: '```js\nfunction lineTotal(price, quantity) {\n  return …;\n}\n\nconsole.log(lineTotal(12, 3));\n```',
              solution: {
                js: `
                  function lineTotal(price, quantity) {
                    return price * quantity;
                  }

                  console.log(lineTotal(12, 3));
                `,
              },
            },
            {
              type: 'brief',
              title: 'Default values',
              body: `
                Give a parameter a **default** with \`=\`. It's used when the caller leaves that argument out:

                \`\`\`js
                function addVat(price, rate = 0.2) {
                  return price * (1 + rate);
                }

                addVat(10);      // 12  (rate is 0.2)
                addVat(10, 0.05) // 10.5 (rate is 0.05, e.g. reduced-rate VAT)
                \`\`\`

                Put parameters with defaults **after** the ones without.
              `,
            },
            {
              type: 'fill',
              q: 'Give `fee` a default of 4.95, and hand back the total.',
              code: `
                function withDelivery(total, fee [[=]] 4.95) {
                  [[return]] total + fee;
                }
              `,
              options: ['=', '===', 'return', 'console.log'],
              explain: 'A default uses a single `=`. `return` hands the answer back to whoever called the function.',
            },
            {
              type: 'task',
              title: 'Apply a discount',
              body: `
                Write a function called \`applyDiscount\` with two parameters: \`price\` and \`percent\`, where \`percent\` defaults to **10**.

                It **returns** the price after taking off that percentage, **rounded to pennies** (two decimal places, as a number).

                - \`applyDiscount(50)\` returns 45
                - \`applyDiscount(50, 20)\` returns 40
                - \`applyDiscount(19.99, 15)\` returns 16.99

                Then log \`applyDiscount(80, 25)\`.
              `,
              js: `
                // function applyDiscount(price, percent = 10) { … }

              `,
              checks: [
                { text: 'There is a function called `applyDiscount`', test: (c) => !!c.fn('applyDiscount') || noFn('applyDiscount') },
                { text: 'You logged `applyDiscount(80, 25)` (60)', test: (c) => c.logs.includes('60') || 'Expected 60, got ' + logged(c) },
                {
                  text: '`applyDiscount(50, 20)` returns 40',
                  test: (c) => {
                    const r = c.call('applyDiscount', 50, 20);
                    if (r.result === undefined && r.logs.length) return "It logs but doesn't return. Use return.";
                    return r.result === 40 || 'Expected 40, got ' + say(r.result);
                  },
                },
                {
                  text: 'The default is 10%: `applyDiscount(50)` returns 45',
                  test: (c) => {
                    const r = c.call('applyDiscount', 50).result;
                    return r === 45 || 'applyDiscount(50) returned ' + say(r) + '. Give percent a default: percent = 10.';
                  },
                },
                {
                  text: 'It rounds to pennies: `applyDiscount(19.99, 15)` returns 16.99',
                  test: (c) => {
                    const r = c.call('applyDiscount', 19.99, 15).result;
                    if (r === '16.99') return 'You returned the text "16.99" (from toFixed). Return a number: Math.round(x * 100) / 100.';
                    if (typeof r === 'number' && Math.abs(r - 16.9915) < 1e-6) return 'You returned ' + r + '. Round it to pennies: Math.round(x * 100) / 100.';
                    return r === 16.99 || 'Expected 16.99, got ' + say(r);
                  },
                },
              ],
              hint: "Take off the percentage: `price * (1 - percent / 100)`. Then round to pennies: `Math.round(… * 100) / 100`.",
              solution: {
                js: `
                  function applyDiscount(price, percent = 10) {
                    const discounted = price * (1 - percent / 100);
                    return Math.round(discounted * 100) / 100;
                  }

                  console.log(applyDiscount(80, 25));
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                '`function name(params) { … }` **defines** a function; `name(args)` **calls** it. Nothing runs until it is called.',
                "Parameters are named slots; arguments are the values you pass in: `greet('Priya')`.",
                '`return value` hands a result back and ends the function. With no `return`, a function gives `undefined`.',
                '`console.log` only *shows* a value; `return` lets other code *use* it. Calculations should return.',
                'Defaults fill in missing arguments: `function addVat(price, rate = 0.2) { … }`.',
              ],
            },
          ],
        },

        /* ── 12. Arrow functions and scope ───────────────────────────── */
        {
          id: 'js-arrow-scope',
          title: 'Arrow functions and scope',
          minutes: 12,
          steps: [
            {
              type: 'brief',
              title: 'Arrow functions',
              body: `
                An **arrow function** is a shorter way to write a function, stored in a \`const\`. These three do the same thing:

                \`\`\`js
                function addVat(price) {
                  return price * 1.2;
                }

                const addVat = (price) => {
                  return price * 1.2;
                };

                const addVat = (price) => price * 1.2;
                \`\`\`

                The last form has an **implicit return**: with no curly brackets, the value after \`=>\` is returned automatically.

                - One parameter: the brackets are optional, \`price => price * 1.2\`.
                - No parameters: empty brackets, \`() => 'Hello'\`.
                - Several: \`(price, qty) => price * qty\`.

                You met this shape with \`map\` and \`filter\`: those tiny functions were arrow functions.
              `,
            },
            {
              type: 'exhibit',
              title: 'Short and sweet',
              body: 'Press **Run**. Try writing an arrow function of your own.',
              js: `
                const addVat = (price) => price * 1.2;
                const lineTotal = (price, qty) => price * qty;
                const shopName = () => 'Wick & Wax';

                console.log(addVat(10));
                console.log(lineTotal(4.5, 4));
                console.log(shopName());
              `,
            },
            {
              type: 'quiz',
              q: 'Which of these returns `undefined` instead of double the price?',
              options: ['`(p) => { p * 2 }`', '`(p) => p * 2`', '`p => p * 2`', '`(p) => { return p * 2; }`'],
              answer: 0,
              explain: 'With curly brackets, there is no implicit return: you must write `return`. Leave the brackets out and the value is returned for you.',
            },
            {
              type: 'task',
              title: 'Convert to arrows',
              body: `
                Rewrite both functions as \`const\` arrow functions with an **implicit return** (no curly brackets, no \`return\`). Keep the same names, and keep the two log lines working.
              `,
              js: `
                function toPence(pounds) {
                  return pounds * 100;
                }

                function isFreeDelivery(total) {
                  return total >= 30;
                }

                console.log(toPence(4.5));
                console.log(isFreeDelivery(32));
              `,
              checks: [
                {
                  text: '`toPence` works: 4.5 gives 450, 12 gives 1200',
                  test: (c) => {
                    if (!c.fn('toPence')) return noFn('toPence');
                    const a = c.call('toPence', 4.5).result;
                    const b = c.call('toPence', 12).result;
                    return (a === 450 && b === 1200) || 'toPence(4.5) returned ' + say(a) + ' and toPence(12) returned ' + say(b) + '.';
                  },
                },
                {
                  text: '`isFreeDelivery` works: 30 is `true`, 29.99 is `false`',
                  test: (c) => {
                    if (!c.fn('isFreeDelivery')) return noFn('isFreeDelivery');
                    const a = c.call('isFreeDelivery', 30).result;
                    const b = c.call('isFreeDelivery', 29.99).result;
                    return (a === true && b === false) || 'isFreeDelivery(30) returned ' + say(a) + ' and isFreeDelivery(29.99) returned ' + say(b) + '.';
                  },
                },
                {
                  text: 'Both are `const` arrow functions',
                  test: (c) => {
                    const s = c.src('js');
                    if (/\bfunction\b/.test(s)) return 'There is still a function keyword. Use const name = (param) => …;';
                    return (/const\s+toPence\s*=[^;\n]*=>/.test(s) && /const\s+isFreeDelivery\s*=[^;\n]*=>/.test(s)) || 'Write them as const toPence = (pounds) => …;';
                  },
                },
                { text: 'Both use an implicit return (no `return`)', test: (c) => (!/\breturn\b/.test(c.src('js')) && /=>/.test(c.src('js'))) || 'Remove the curly brackets and return: (pounds) => pounds * 100' },
              ],
              hint: '```js\nconst toPence = (pounds) => pounds * 100;\n```\n\nDo the same for `isFreeDelivery`.',
              solution: {
                js: `
                  const toPence = (pounds) => pounds * 100;
                  const isFreeDelivery = (total) => total >= 30;

                  console.log(toPence(4.5));
                  console.log(isFreeDelivery(32));
                `,
              },
            },
            {
              type: 'brief',
              title: 'Scope: where a variable lives',
              body: `
                A variable made with \`let\` or \`const\` exists only inside the **block** \`{ }\` it was made in. That area is its **scope**.

                \`\`\`js
                const shop = 'Wick & Wax';      // outside any block: usable everywhere

                function label() {
                  const note = 'Hand poured';   // only exists inside label()
                  console.log(shop, note);      // fine: inner code can see outer variables
                }

                label();
                console.log(note);  // ReferenceError: note is not defined
                \`\`\`

                The same goes for \`if\` blocks and loops. Code inside can see out; code outside can't see in.

                This is a good thing: two functions can each have their own \`total\` without clashing. But it means a variable you need *after* a block must be created *before* it.
              `,
            },
            {
              type: 'exhibit',
              title: 'Inside and outside',
              body: 'Press **Run**. Then remove the `//` from the last line and run again to see the `ReferenceError`.',
              js: `
                const shop = 'Wick & Wax';

                function label() {
                  const note = 'Hand poured';
                  console.log(shop, note);
                }

                label();

                if (true) {
                  const inside = 'only in here';
                  console.log(inside);
                }

                // console.log(note);
              `,
            },
            {
              type: 'quiz',
              q: "What does this print?\n\n```js\nlet total = 0;\n\nif (true) {\n  let total = 50;\n}\n\nconsole.log(total);\n```",
              options: ['`0`', '`50`', '`undefined`', 'An error'],
              answer: 0,
              explain: '`let total = 50` inside the block makes a **second**, separate `total` that only lives in there. The outer one is still 0. To change the outer one, leave out `let`: `total = 50;`.',
            },
            {
              type: 'task',
              title: 'Fix the scope bug',
              body: `
                This should add up the basket, but it logs **0**. A second \`total\` is being created inside the loop each round, so the outer one never changes.

                Fix it so the outer \`total\` ends up as **25**.
              `,
              js: `
                const prices = [12, 8, 5];
                let total = 0;

                for (const price of prices) {
                  let total = 0;
                  total += price;
                }

                console.log(total);
              `,
              checks: [
                { text: '`total` is 25', test: (c) => c.val('total') === 25 || 'total is ' + say(c.val('total')) + '; expected 25.' },
                { text: 'There is only one `let total`', test: (c) => (c.src('js').match(/\blet\s+total\b/g) || []).length === 1 || 'Remove the let total inside the loop, so it uses the outer total.' },
                { text: 'The console shows `25`', test: (c) => c.logs.includes('25') || 'Expected 25, got ' + logged(c) },
              ],
              hint: 'The loop body should only *add to* the outer `total`. Delete the line that creates a new one.',
              solution: {
                js: `
                  const prices = [12, 8, 5];
                  let total = 0;

                  for (const price of prices) {
                    total += price;
                  }

                  console.log(total);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Functions are values',
              body: `
                A function is a value, like a number or a string. You can store it, and **pass it to another function**:

                \`\`\`js
                const addVat = (price) => price * 1.2;

                [10, 20].map(addVat);   // [12, 24]
                \`\`\`

                A function you hand over like this is called a **callback**: the other function calls it back, once per item, when it needs to. You've been writing callbacks inline since \`map\` and \`filter\`.

                Notice: \`map(addVat)\`, **not** \`map(addVat())\`. Without brackets you pass the function itself; with brackets you'd run it straight away and pass its result.

                Your own functions can take callbacks too:

                \`\`\`js
                function updateAll(list, change) {
                  return list.map(change);
                }

                updateAll([10, 20], addVat);   // [12, 24]
                \`\`\`
              `,
            },
            {
              type: 'fill',
              q: 'Pass the `addVat` function to `map`, so every price gets VAT added.',
              code: `const withVat = prices.map([[addVat]]);`,
              options: ['addVat', 'addVat()', 'addVat(price)', "'addVat'"],
              explain: '`addVat` on its own is the function. `addVat()` would call it once, with no price, and hand `map` the result (`NaN`).',
            },
            {
              type: 'task',
              title: 'Price tools',
              body: `
                1. \`addVat\`: an arrow function that returns \`price * 1.2\`
                2. \`halfPrice\`: an arrow function that returns \`price / 2\`
                3. \`updateAll(list, change)\`: a function that returns \`list.map(change)\`
                4. \`withVat\`: the result of \`updateAll(prices, addVat)\`
                5. \`sale\`: the result of \`updateAll(prices, halfPrice)\`
              `,
              js: `
                const prices = [10, 25, 40];

                // addVat, halfPrice, updateAll, withVat and sale

              `,
              checks: [
                {
                  text: '`addVat` and `halfPrice` work',
                  test: (c) => {
                    if (!c.fn('addVat')) return noFn('addVat');
                    if (!c.fn('halfPrice')) return noFn('halfPrice');
                    const a = c.call('addVat', 10).result;
                    const b = c.call('halfPrice', 25).result;
                    return (a === 12 && b === 12.5) || 'addVat(10) returned ' + say(a) + ' (expected 12) and halfPrice(25) returned ' + say(b) + ' (expected 12.5).';
                  },
                },
                {
                  text: '`updateAll` applies any function it is given',
                  test: (c) => {
                    if (!c.fn('updateAll')) return noFn('updateAll');
                    const r = c.call('updateAll', [1, 2], (x) => x * 3).result;
                    return same(r, [3, 6]) || 'updateAll([1, 2], x => x * 3) returned ' + say(r) + '; expected [3, 6].';
                  },
                },
                { text: '`withVat` is `[12, 30, 48]`', test: (c) => same(c.val('withVat'), [12, 30, 48]) || 'withVat is ' + say(c.val('withVat')) + '.' },
                {
                  text: '`sale` is `[5, 12.5, 20]`, made with `updateAll`',
                  test: (c) => (same(c.val('sale'), [5, 12.5, 20]) && /updateAll\(\s*prices\s*,\s*halfPrice\s*\)/.test(c.src('js'))) || 'sale is ' + say(c.val('sale')) + '. Use updateAll(prices, halfPrice), with no brackets after halfPrice.',
                },
              ],
              hint: '```js\nconst addVat = (price) => price * 1.2;\n\nfunction updateAll(list, change) {\n  return list.map(change);\n}\n\nconst withVat = updateAll(prices, addVat);\n```',
              solution: {
                js: `
                  const prices = [10, 25, 40];

                  const addVat = (price) => price * 1.2;
                  const halfPrice = (price) => price / 2;

                  function updateAll(list, change) {
                    return list.map(change);
                  }

                  const withVat = updateAll(prices, addVat);
                  const sale = updateAll(prices, halfPrice);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Arrow function: `const addVat = (price) => price * 1.2;`. Without `{ }` the value is returned automatically.',
                'With curly brackets you need `return`: `(p) => { return p * 2; }`. `(p) => { p * 2 }` returns `undefined`.',
                '`let` and `const` live only inside the `{ }` block they were made in. Inner code can see outer variables, not the other way round.',
                'Writing `let` again inside a block makes a *new* variable with the same name. To change the outer one, leave out `let`.',
                'Functions are values. A **callback** is a function you pass to another one: `prices.map(addVat)` -- no brackets after `addVat`.',
              ],
            },
          ],
        },

        /* ── 13. Objects ─────────────────────────────────────────────── */
        {
          id: 'js-objects',
          title: 'Objects',
          minutes: 13,
          steps: [
            {
              type: 'brief',
              title: 'Things with properties',
              body: `
                An array is a list in order. An **object** groups related values under **names**: everything about one product, one customer or one booking.

                \`\`\`js
                const product = {
                  name: 'Lavender candle',
                  price: 12,
                  inStock: true,
                };
                \`\`\`

                - Curly brackets \`{ }\` hold the object.
                - Each **property** is \`name: value\`, separated by commas. (A comma after the last one is allowed and makes adding more easier.)
                - Values can be any type: strings, numbers, booleans, arrays, even other objects.

                Read a property with a dot: \`product.name\` is \`'Lavender candle'\`. A property that doesn't exist gives \`undefined\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'A product record',
              body: 'Press **Run**. Add a property of your own, then log it.',
              js: `
                const product = {
                  name: 'Lavender candle',
                  price: 12,
                  inStock: true,
                  sizes: ['Small', 'Large'],
                };

                console.log(product);
                console.log(product.name);
                console.log(product.price * 2);
                console.log(product.sizes[1]);
                console.log(product.colour);
              `,
            },
            {
              type: 'quiz',
              q: "With `const customer = { name: 'Priya', city: 'Leicester' };`, what is `customer.email`?",
              options: ['`undefined`', 'An error', '`null`', "`''` (empty text)"],
              answer: 0,
              explain: 'Reading a property that does not exist is not an error; it just gives `undefined`.',
            },
            {
              type: 'brief',
              title: 'Changing objects, and brackets',
              body: `
                Objects can change, even with \`const\`:

                \`\`\`js
                product.price = 14;          // update a property
                product.scent = 'lavender';  // add a new one
                delete product.inStock;      // remove one
                \`\`\`

                There's a second way to reach a property: **bracket notation**, with the name as a string.

                \`\`\`js
                product['price']        // 14, same as product.price

                const field = 'scent';
                product[field]          // 'lavender': the name comes from a variable
                \`\`\`

                Use dots normally. Use brackets when the property name is **in a variable**, or has a space or hyphen in it.
              `,
            },
            {
              type: 'fill',
              q: 'Add a `service` property to the booking, then remove its `notes`.',
              code: `
                const booking = { name: 'Sam', time: '10:30', notes: 'Running late' };
                booking.service [[=]] 'Skin fade';
                [[delete]] booking.notes;
              `,
              options: ['=', ':', 'delete', 'remove'],
              explain: 'Outside the curly brackets you assign with `=`. Inside an object literal you use `:`. `delete` removes a property.',
            },
            {
              type: 'task',
              title: 'Build a product',
              body: `
                1. Make a \`const\` object called \`product\` with \`name\` **Lavender candle**, \`price\` **12** and \`stock\` **8**.
                2. On a later line, change \`price\` to **14**.
                3. Add a property \`onSale\` set to \`true\`.
                4. Log the property whose name is in \`field\`, using bracket notation.
              `,
              js: `
                const field = 'name';

                // 1. product

                // 2. change the price

                // 3. add onSale

                // 4. log product[field]

              `,
              checks: [
                {
                  text: '`product` has the name and stock',
                  test: (c) => {
                    const p = c.val('product');
                    if (!p || typeof p !== 'object') return 'No object called product yet.';
                    return (p.name === 'Lavender candle' && p.stock === 8) || 'product is ' + say(p) + '.';
                  },
                },
                {
                  text: 'The price starts at 12 and is changed to 14',
                  test: (c) => {
                    const p = c.val('product') || {};
                    return (p.price === 14 && /price\s*:\s*12\b/.test(c.src('js'))) || 'Create it with price: 12, then change it on a later line with product.price = 14. It is ' + say(p.price) + ' now.';
                  },
                },
                { text: '`onSale` is `true`', test: (c) => (c.val('product') || {}).onSale === true || 'Add it with product.onSale = true;' },
                { text: 'You logged `product[field]`', test: (c) => (c.logs.includes('Lavender candle') ? /product\s*\[\s*field\s*\]/.test(c.src('js')) || 'Right text, but log it with product[field] (bracket notation).' : 'Expected Lavender candle from console.log(product[field]). You logged: ' + logged(c)) },
              ],
              hint: "```js\nconst product = {\n  name: 'Lavender candle',\n  price: 12,\n  stock: 8,\n};\n\nproduct.price = 14;\n```",
              solution: {
                js: `
                  const field = 'name';

                  const product = {
                    name: 'Lavender candle',
                    price: 12,
                    stock: 8,
                  };

                  product.price = 14;
                  product.onSale = true;

                  console.log(product[field]);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Methods and this',
              body: `
                A function stored in an object is called a **method**. You've been using them all along: \`console.log\`, \`name.trim()\`.

                \`\`\`js
                const basket = {
                  items: 2,
                  total: 30,
                  describe() {
                    return \`\${this.items} items, £\${this.total}\`;
                  },
                };

                basket.describe();  // '2 items, £30'
                \`\`\`

                Inside a method, \`this\` means **the object the method was called on**, so \`this.total\` is \`basket.total\`. If the total changes, \`describe()\` stays correct.

                > Write methods with the short form \`describe() { … }\`. An arrow function doesn't get its own \`this\`, so \`this.total\` wouldn't work inside one.
              `,
            },
            {
              type: 'exhibit',
              title: 'An object that does things',
              body: 'Press **Run**. Call `add` again before the second `describe`.',
              js: `
                const basket = {
                  items: 2,
                  total: 30,
                  describe() {
                    return \`\${this.items} items, £\${this.total}\`;
                  },
                  add(price) {
                    this.items++;
                    this.total += price;
                  },
                };

                console.log(basket.describe());
                basket.add(12);
                console.log(basket.describe());
              `,
            },
            {
              type: 'quiz',
              q: 'When you call `basket.describe()`, what is `this` inside `describe`?',
              options: ['The `basket` object', 'The `describe` function', 'The whole web page', 'Nothing until you set it'],
              answer: 0,
              explain: '`this` is whatever comes before the dot when the method is called. Here, `basket`.',
            },
            {
              type: 'task',
              title: 'A customer with methods',
              body: `
                Inside the \`customer\` object, add two methods:

                1. \`fullName()\`: **returns** the first and last name with a space between, using \`this\` (\`'Priya Shah'\`)
                2. \`addVisit()\`: adds 1 to \`this.visits\`

                Then, below the object, log \`customer.fullName()\`.
              `,
              js: `
                const customer = {
                  firstName: 'Priya',
                  lastName: 'Shah',
                  visits: 4,
                  // add fullName() and addVisit() here
                };

              `,
              checks: [
                {
                  text: "`customer.fullName()` returns *Priya Shah*",
                  test: (c) => {
                    const cu = c.val('customer');
                    if (!cu || typeof cu.fullName !== 'function') return 'customer has no fullName method yet.';
                    const v = cu.fullName();
                    return v === 'Priya Shah' || 'fullName() returned ' + say(v) + '; expected "Priya Shah".';
                  },
                },
                {
                  text: '`fullName` uses `this` (it works for other customers too)',
                  test: (c) => {
                    const cu = c.val('customer');
                    if (!cu || typeof cu.fullName !== 'function') return false;
                    const other = Object.assign({}, cu, { firstName: 'Sam', lastName: 'Lee' });
                    let v;
                    try {
                      v = other.fullName();
                    } catch (e) {
                      v = undefined;
                    }
                    return v === 'Sam Lee' || 'Use this.firstName and this.lastName, and the short method form fullName() { … } rather than an arrow function.';
                  },
                },
                {
                  text: '`addVisit()` adds 1 to `visits`',
                  test: (c) => {
                    const cu = c.val('customer');
                    if (!cu || typeof cu.addVisit !== 'function') return 'customer has no addVisit method yet.';
                    const before = cu.visits;
                    cu.addVisit();
                    cu.addVisit();
                    return cu.visits === before + 2 || 'After two calls, visits went from ' + say(before) + ' to ' + say(cu.visits) + '. Use this.visits++.';
                  },
                },
                { text: "You logged *Priya Shah*", test: (c) => c.logs.includes('Priya Shah') || 'Expected Priya Shah, got ' + logged(c) },
              ],
              hint: "Methods go inside the object, separated by commas like any property:\n\n```js\n  visits: 4,\n  fullName() {\n    return `${this.firstName} ${this.lastName}`;\n  },\n```",
              solution: {
                js: `
                  const customer = {
                    firstName: 'Priya',
                    lastName: 'Shah',
                    visits: 4,
                    fullName() {
                      return \`\${this.firstName} \${this.lastName}\`;
                    },
                    addVisit() {
                      this.visits++;
                    },
                  };

                  console.log(customer.fullName());
                `,
              },
            },
            {
              type: 'brief',
              title: 'Keys, values and nesting',
              body: `
                Three tools turn an object into arrays you can loop over:

                \`\`\`js
                const hours = { mon: '9-5', tue: '9-5', wed: 'Closed' };

                Object.keys(hours)     // ['mon', 'tue', 'wed']
                Object.values(hours)   // ['9-5', '9-5', 'Closed']
                Object.entries(hours)  // [['mon', '9-5'], ['tue', '9-5'], ['wed', 'Closed']]
                \`\`\`

                Each entry is a little \`[key, value]\` pair. In a loop you can unpack the pair straight into two variables:

                \`\`\`js
                for (const [day, time] of Object.entries(hours)) {
                  console.log(\`\${day}: \${time}\`);
                }
                \`\`\`

                Objects can hold other objects. Chain the dots to reach inside: \`shop.address.postcode\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'Opening hours',
              body: 'Press **Run**. Add `sun` to `hours` and run it again.',
              js: `
                const shop = {
                  name: 'The Crusty Loaf',
                  address: { town: 'Leicester', postcode: 'LE1 5AB' },
                  hours: { mon: '8-4', tue: '8-4', wed: 'Closed', sat: '9-2' },
                };

                console.log(shop.address.postcode);
                console.log(Object.keys(shop.hours));
                console.log(Object.keys(shop.hours).length);

                for (const [day, time] of Object.entries(shop.hours)) {
                  console.log(\`\${day}: \${time}\`);
                }
              `,
            },
            {
              type: 'task',
              title: 'Bakery details',
              body: `
                Using the \`shop\` object:

                1. \`postcode\`: the shop's postcode, from the nested \`address\`
                2. \`dayCount\`: how many days are listed in \`hours\`, using \`Object.keys\`
                3. Loop over \`Object.entries(shop.hours)\` and log each day like **mon: 8-4**
                4. \`closedDays\`: an array of the days whose hours are \`'Closed'\`. Filter the keys, looking each one up in \`shop.hours\`.
              `,
              js: `
                const shop = {
                  name: 'The Crusty Loaf',
                  address: { street: '12 High Street', town: 'Leicester', postcode: 'LE1 5AB' },
                  hours: { mon: '8-4', tue: '8-4', wed: 'Closed', thu: '8-4', fri: '8-6', sat: '9-2' },
                };

                // postcode, dayCount, the loop, closedDays

              `,
              checks: [
                { text: "`postcode` is *LE1 5AB*", test: (c) => c.val('postcode') === 'LE1 5AB' || 'postcode is ' + say(c.val('postcode')) + '. Use shop.address.postcode.' },
                { text: '`dayCount` is 6', test: (c) => (c.val('dayCount') === 6 && /Object\.keys\(/.test(c.src('js'))) || 'dayCount is ' + say(c.val('dayCount')) + '. Use Object.keys(shop.hours).length.' },
                {
                  text: 'Each day is logged, like *mon: 8-4*',
                  test: (c) => {
                    const want = ['mon: 8-4', 'wed: Closed', 'fri: 8-6', 'sat: 9-2'];
                    const miss = want.filter((w) => !hasLog(c, new RegExp('^' + w.replace(': ', ':? ?') + '$', 'i')));
                    return !miss.length || 'Missing ' + miss.join(', ') + '. You logged: ' + logged(c);
                  },
                },
                { text: "`closedDays` is `['wed']`", test: (c) => same(c.val('closedDays'), ['wed']) || 'closedDays is ' + say(c.val('closedDays')) + ". Try Object.keys(shop.hours).filter(day => shop.hours[day] === 'Closed')." },
              ],
              hint: "```js\nfor (const [day, time] of Object.entries(shop.hours)) {\n  console.log(`${day}: ${time}`);\n}\n```\n\nFor `closedDays`, the filter callback gets each key: `day => shop.hours[day] === 'Closed'`.",
              solution: {
                js: `
                  const shop = {
                    name: 'The Crusty Loaf',
                    address: { street: '12 High Street', town: 'Leicester', postcode: 'LE1 5AB' },
                    hours: { mon: '8-4', tue: '8-4', wed: 'Closed', thu: '8-4', fri: '8-6', sat: '9-2' },
                  };

                  const postcode = shop.address.postcode;
                  const dayCount = Object.keys(shop.hours).length;

                  for (const [day, time] of Object.entries(shop.hours)) {
                    console.log(\`\${day}: \${time}\`);
                  }

                  const closedDays = Object.keys(shop.hours).filter((day) => shop.hours[day] === 'Closed');
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                "An **object** groups named properties: `{ name: 'Candle', price: 12 }`. Read them with a dot: `product.price`.",
                "Update or add with `=` (`product.price = 14`), remove with `delete product.price`. A missing property gives `undefined`.",
                "Bracket notation takes the name as a string: `product['price']`, or from a variable: `product[field]`.",
                'A **method** is a function in an object: `describe() { … }`. Inside it, `this` is the object it was called on. Avoid arrow functions for methods that use `this`.',
                '`Object.keys`, `Object.values` and `Object.entries` turn an object into arrays. Reach into nested objects with more dots: `shop.address.postcode`.',
              ],
            },
          ],
        },

        /* ── 14. Working with data ───────────────────────────────────── */
        {
          id: 'js-data',
          title: 'Working with data',
          minutes: 15,
          steps: [
            {
              type: 'brief',
              title: 'Lists of records',
              body: `
                Real data is usually an **array of objects**: a product list, a day's bookings, a customer's orders. It's what a shop platform, a booking system or a database hands you.

                \`\`\`js
                const products = [
                  { id: 1, name: 'Lavender candle', price: 12, stock: 8 },
                  { id: 2, name: 'Cedar candle', price: 15, stock: 0 },
                  { id: 3, name: 'Wax melts', price: 4.5, stock: 30 },
                ];

                products[0].name     // 'Lavender candle'
                products.length      // 3
                \`\`\`

                Everything from the last few missions now comes together: \`filter\`, \`map\`, \`find\`, \`sort\` and \`reduce\`, with callbacks that look *inside* each object: \`p => p.stock > 0\`.
              `,
            },
            {
              type: 'exhibit',
              title: 'The shop shelf',
              body: 'Press **Run**. Change a price or stock level and run again.',
              js: `
                const products = [
                  { id: 1, name: 'Lavender candle', price: 12, stock: 8 },
                  { id: 2, name: 'Cedar candle', price: 15, stock: 0 },
                  { id: 3, name: 'Wax melts', price: 4.5, stock: 30 },
                  { id: 4, name: 'Gift box', price: 28, stock: 3 },
                ];

                console.log(products[2].name);
                console.log(products.length);

                for (const p of products) {
                  const label = p.stock > 0 ? \`£\${p.price.toFixed(2)}\` : 'Sold out';
                  console.log(\`\${p.name}: \${label}\`);
                }
              `,
            },
            {
              type: 'quiz',
              q: "Using the exhibit's list, what is `products[1].stock`?",
              options: ['`0`', '`8`', '`15`', '`undefined`'],
              answer: 0,
              explain: '`products[1]` is the *second* product, the Cedar candle, and its `stock` is 0.',
            },
            {
              type: 'task',
              title: 'Filter the shelf',
              body: `
                Make three \`const\` arrays:

                1. \`inStock\`: the products with \`stock\` above 0
                2. \`names\`: just the **names** of the \`inStock\` products, using \`map\`
                3. \`underTen\`: the products cheaper than £10
              `,
              js: `
                const products = [
                  { id: 1, name: 'Lavender candle', price: 12, stock: 8 },
                  { id: 2, name: 'Cedar candle', price: 15, stock: 0 },
                  { id: 3, name: 'Wax melts', price: 4.5, stock: 30 },
                  { id: 4, name: 'Gift box', price: 28, stock: 3 },
                  { id: 5, name: 'Matches', price: 2, stock: 0 },
                ];

                // inStock, names and underTen

              `,
              checks: [
                {
                  text: '`inStock` holds products 1, 3 and 4',
                  test: (c) => {
                    const v = c.val('inStock');
                    if (!Array.isArray(v)) return 'No array called inStock yet.';
                    const ids = v.map((p) => p && p.id);
                    return same(ids, [1, 3, 4]) || 'inStock holds the products with ids ' + say(ids) + '; expected [1, 3, 4].';
                  },
                },
                {
                  text: '`names` is `["Lavender candle", "Wax melts", "Gift box"]`',
                  test: (c) => (same(c.val('names'), ['Lavender candle', 'Wax melts', 'Gift box']) && /\.map\(/.test(c.src('js'))) || 'names is ' + say(c.val('names')) + '. Try inStock.map(p => p.name).',
                },
                {
                  text: '`underTen` holds products 3 and 5',
                  test: (c) => {
                    const v = c.val('underTen');
                    if (!Array.isArray(v)) return 'No array called underTen yet.';
                    const ids = v.map((p) => p && p.id);
                    return same(ids, [3, 5]) || 'underTen holds ids ' + say(ids) + '; expected [3, 5].';
                  },
                },
              ],
              hint: '```js\nconst inStock = products.filter(p => p.stock > 0);\n```\n\nThen `map` over `inStock` to pull out `p.name`.',
              solution: {
                js: `
                  const products = [
                    { id: 1, name: 'Lavender candle', price: 12, stock: 8 },
                    { id: 2, name: 'Cedar candle', price: 15, stock: 0 },
                    { id: 3, name: 'Wax melts', price: 4.5, stock: 30 },
                    { id: 4, name: 'Gift box', price: 28, stock: 3 },
                    { id: 5, name: 'Matches', price: 2, stock: 0 },
                  ];

                  const inStock = products.filter((p) => p.stock > 0);
                  const names = inStock.map((p) => p.name);
                  const underTen = products.filter((p) => p.price < 10);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Find by id, sort by price',
              body: `
                Every record has an \`id\` so you can pick out exactly one. \`find\` is made for this:

                \`\`\`js
                const giftBox = products.find((p) => p.id === 4);
                giftBox.name   // 'Gift box'
                \`\`\`

                To sort objects, tell \`sort\` which property to compare:

                \`\`\`js
                const cheapestFirst = products.slice().sort((a, b) => a.price - b.price);
                \`\`\`

                Remember that \`sort\` changes the array it's called on. \`.slice()\` first makes a copy, so \`products\` stays in its original order for the rest of your code.
              `,
            },
            {
              type: 'fill',
              q: 'Find the product with id 4.',
              code: `const giftBox = products.[[find]]((p) => p.id [[===]] 4);`,
              options: ['find', 'filter', '===', '='],
              explain: '`find` gives one product (`filter` would give an array holding it). And `===` compares, where `=` would try to change the id.',
            },
            {
              type: 'task',
              title: 'Find and sort',
              body: `
                1. Write a function called \`findProduct\` that takes an \`id\` and **returns** the matching product (or \`undefined\` if there isn't one).
                2. \`byPrice\`: a **copy** of \`products\` sorted from cheapest to dearest. Leave \`products\` in its original order.
                3. Log the name of product 4, using \`findProduct\`.
              `,
              js: `
                const products = [
                  { id: 1, name: 'Lavender candle', price: 12, stock: 8 },
                  { id: 2, name: 'Cedar candle', price: 15, stock: 0 },
                  { id: 3, name: 'Wax melts', price: 4.5, stock: 30 },
                  { id: 4, name: 'Gift box', price: 28, stock: 3 },
                  { id: 5, name: 'Matches', price: 2, stock: 0 },
                ];

                // findProduct, byPrice, then log product 4's name

              `,
              checks: [
                { text: 'There is a function called `findProduct`', test: (c) => !!c.fn('findProduct') || noFn('findProduct') },
                {
                  text: '`findProduct(3)` returns the Wax melts, and `findProduct(99)` returns `undefined`',
                  test: (c) => {
                    const r = c.call('findProduct', 3).result;
                    if (Array.isArray(r)) return 'findProduct returned an array. Use find (one item) rather than filter (an array).';
                    if (!r || r.name !== 'Wax melts') return 'findProduct(3) returned ' + say(r) + '.';
                    const none = c.call('findProduct', 99).result;
                    return none === undefined || 'findProduct(99) returned ' + say(none) + '; expected undefined.';
                  },
                },
                {
                  text: '`byPrice` is cheapest first',
                  test: (c) => {
                    const v = c.val('byPrice');
                    if (!Array.isArray(v)) return 'No array called byPrice yet.';
                    const ids = v.map((p) => p && p.id);
                    return same(ids, [5, 3, 1, 2, 4]) || 'byPrice has the ids in the order ' + say(ids) + '; expected [5, 3, 1, 2, 4].';
                  },
                },
                {
                  text: '`products` is still in its original order',
                  test: (c) => same((c.val('products') || []).map((p) => p.id), [1, 2, 3, 4, 5]) || 'sort changed products itself. Sort a copy: products.slice().sort(…).',
                },
                { text: "You logged *Gift box*", test: (c) => (c.logs.includes('Gift box') ? /findProduct\(\s*4\s*\)/.test(c.src('js')) || 'Get the name with findProduct(4).name rather than typing it.' : 'Expected Gift box from findProduct(4).name, got ' + logged(c)) },
              ],
              hint: '```js\nfunction findProduct(id) {\n  return products.find((p) => p.id === id);\n}\n\nconst byPrice = products.slice().sort((a, b) => a.price - b.price);\n```',
              solution: {
                js: `
                  const products = [
                    { id: 1, name: 'Lavender candle', price: 12, stock: 8 },
                    { id: 2, name: 'Cedar candle', price: 15, stock: 0 },
                    { id: 3, name: 'Wax melts', price: 4.5, stock: 30 },
                    { id: 4, name: 'Gift box', price: 28, stock: 3 },
                    { id: 5, name: 'Matches', price: 2, stock: 0 },
                  ];

                  function findProduct(id) {
                    return products.find((p) => p.id === id);
                  }

                  const byPrice = products.slice().sort((a, b) => a.price - b.price);

                  console.log(findProduct(4).name);
                `,
              },
            },
            {
              type: 'brief',
              title: 'Totalling a basket',
              body: `
                A basket is a list of lines, each with a price and a quantity. \`reduce\` adds them up in one go:

                \`\`\`js
                const basket = [
                  { name: 'Lavender candle', price: 12, qty: 2 },
                  { name: 'Wax melts', price: 4.5, qty: 4 },
                ];

                const total = basket.reduce((sum, item) => sum + item.price * item.qty, 0);
                // 0 + 24 = 24, then 24 + 18 = 42
                \`\`\`

                Wrap it in a function and the same code totals *any* basket.
              `,
            },
            {
              type: 'quiz',
              q: 'In `basket.reduce((sum, item) => sum + item.price * item.qty, 0)`, what is the `0` for?',
              options: ['It is the starting total, before any items are added', 'It tells reduce to start at index 0', 'It rounds the total to 0 decimal places', 'It is returned if something goes wrong'],
              answer: 0,
              explain: '`sum` starts at 0, then each item is added in turn. It also means an **empty** basket gives 0 rather than an error.',
            },
            {
              type: 'task',
              title: 'Basket total',
              body: `
                1. Write a function called \`basketTotal\` that takes a list of items and **returns** the total of \`price * qty\` for every line. An empty list should give 0.
                2. \`itemCount\`: the total number of items (add up the \`qty\`s, using \`reduce\`). It should be 7.
                3. Log **7 items, £70.00**, using \`basketTotal(basket)\` and \`toFixed(2)\`.
              `,
              js: `
                const basket = [
                  { name: 'Lavender candle', price: 12, qty: 2 },
                  { name: 'Wax melts', price: 4.5, qty: 4 },
                  { name: 'Gift box', price: 28, qty: 1 },
                ];

                // basketTotal, itemCount, then the log

              `,
              checks: [
                { text: 'There is a function called `basketTotal`', test: (c) => !!c.fn('basketTotal') || noFn('basketTotal') },
                {
                  text: '`basketTotal(basket)` returns 70',
                  test: (c) => {
                    const r = c.call('basketTotal', c.val('basket')).result;
                    if (typeof r === 'string') return 'basketTotal returned the text ' + say(r) + '. Give reduce a starting value: add , 0 before the closing bracket.';
                    return r === 70 || 'basketTotal(basket) returned ' + say(r) + '; expected 70.';
                  },
                },
                {
                  text: 'It works for other baskets, including an empty one',
                  test: (c) => {
                    const a = c.call('basketTotal', [{ name: 'Matches', price: 2.5, qty: 2 }]).result;
                    if (a !== 5) return 'For one line of 2 x £2.50 it returned ' + say(a) + '; expected 5. Use the items you are given, not basket.';
                    let b;
                    try {
                      b = c.call('basketTotal', []).result;
                    } catch (e) {
                      return 'An empty basket caused an error. Give reduce a starting value of 0.';
                    }
                    return b === 0 || 'An empty basket returned ' + say(b) + '; expected 0.';
                  },
                },
                { text: '`itemCount` is 7', test: (c) => (c.val('itemCount') === 7 && /\.reduce\(/.test(c.src('js'))) || 'itemCount is ' + say(c.val('itemCount')) + '; expected 7.' },
                { text: 'You logged *7 items, £70.00*', test: (c) => hasLog(c, /^7 items,? £70\.00$/i) || 'Expected 7 items, £70.00, got ' + logged(c) },
              ],
              hint: '```js\nfunction basketTotal(items) {\n  return items.reduce((sum, item) => sum + item.price * item.qty, 0);\n}\n```\n\nFor the count, add `item.qty` instead.',
              solution: {
                js: `
                  const basket = [
                    { name: 'Lavender candle', price: 12, qty: 2 },
                    { name: 'Wax melts', price: 4.5, qty: 4 },
                    { name: 'Gift box', price: 28, qty: 1 },
                  ];

                  function basketTotal(items) {
                    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
                  }

                  const itemCount = basket.reduce((count, item) => count + item.qty, 0);

                  console.log(\`\${itemCount} items, £\${basketTotal(basket).toFixed(2)}\`);
                `,
              },
            },
            {
              type: 'brief',
              title: 'A first look at JSON',
              body: `
                To send data to a server, or save it in the browser, it has to become **text**. The standard format is **JSON** (JavaScript Object Notation). It looks almost exactly like the objects you've been writing, but property names have double quotes.

                \`\`\`js
                const order = { id: 1042, customer: 'Priya', paid: true };

                const text = JSON.stringify(order);
                // '{"id":1042,"customer":"Priya","paid":true}'  (a string)

                const back = JSON.parse(text);
                back.customer   // 'Priya'  (a real object again)
                \`\`\`

                - \`JSON.stringify(value)\`: object or array → text.
                - \`JSON.parse(text)\`: text → object or array.

                Functions aren't saved: JSON is for data only. You'll use this for real when you save a basket in the browser, in the next part of the dossier.
              `,
            },
            {
              type: 'exhibit',
              title: 'There and back',
              body: 'Press **Run**. Notice the quotes in the stringified version.',
              js: `
                const order = { id: 1042, customer: 'Priya', items: ['Candle', 'Matches'], paid: true };

                const text = JSON.stringify(order);
                console.log(text);
                console.log(typeof text);

                const back = JSON.parse(text);
                console.log(back.customer);
                console.log(back.items.length);
              `,
            },
            {
              type: 'task',
              title: 'Save and restore',
              body: `
                1. \`saved\`: the basket turned into a JSON string
                2. Log \`saved\` to see what it looks like
                3. \`restored\`: \`saved\` turned back into an array
                4. Log the name of the first item in \`restored\`
              `,
              js: `
                const basket = [
                  { name: 'Lavender candle', price: 12, qty: 2 },
                  { name: 'Wax melts', price: 4.5, qty: 4 },
                ];

                // saved, log it, restored, log the first name

              `,
              checks: [
                {
                  text: '`saved` is the basket as a JSON string',
                  test: (c) => {
                    const v = c.val('saved');
                    if (typeof v !== 'string') return v === undefined ? 'No variable called saved yet.' : 'saved should be a string. Use JSON.stringify(basket).';
                    try {
                      return same(JSON.parse(v), c.val('basket')) || 'saved does not match the basket.';
                    } catch (e) {
                      return 'saved is not valid JSON. Use JSON.stringify(basket).';
                    }
                  },
                },
                { text: 'You logged `saved`', test: (c) => (typeof c.val('saved') === 'string' && c.logs.includes(c.val('saved'))) || 'Log it: console.log(saved);' },
                {
                  text: '`restored` is a fresh copy of the basket, from `JSON.parse`',
                  test: (c) => {
                    const v = c.val('restored');
                    if (!Array.isArray(v)) return v === undefined ? 'No variable called restored yet.' : 'restored should be an array. Use JSON.parse(saved).';
                    if (v === c.val('basket')) return 'restored is just basket again. Make it with JSON.parse(saved).';
                    return (same(v, c.val('basket')) && /JSON\.parse\(/.test(c.src('js'))) || 'restored should match the basket, made with JSON.parse(saved).';
                  },
                },
                { text: 'You logged *Lavender candle* from `restored`', test: (c) => (c.logs.includes('Lavender candle') ? /restored\s*\[\s*0\s*\]\s*\.\s*name/.test(c.src('js')) || 'Get the name with restored[0].name rather than typing it.' : 'Log restored[0].name. You logged: ' + logged(c)) },
              ],
              hint: '```js\nconst saved = JSON.stringify(basket);\nconst restored = JSON.parse(saved);\n```',
              solution: {
                js: `
                  const basket = [
                    { name: 'Lavender candle', price: 12, qty: 2 },
                    { name: 'Wax melts', price: 4.5, qty: 4 },
                  ];

                  const saved = JSON.stringify(basket);
                  console.log(saved);

                  const restored = JSON.parse(saved);
                  console.log(restored[0].name);
                `,
              },
            },
            {
              type: 'debrief',
              points: [
                'Real data is usually an **array of objects**: `products[0].name`. Callbacks look inside each one: `p => p.stock > 0`.',
                '`filter` to narrow a list, `map` to pull out one property (`p => p.name`), `find` to get one record by id.',
                'Sort objects by a property with `list.slice().sort((a, b) => a.price - b.price)`. The `slice()` copy keeps the original order.',
                'Total a basket: `items.reduce((sum, item) => sum + item.price * item.qty, 0)`.',
                '`JSON.stringify(data)` turns data into text for saving or sending; `JSON.parse(text)` turns it back.',
              ],
            },
          ],
        },
      ],
    },
  ]);
})();

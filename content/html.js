/* HTML — Operation Skeleton. See ../CONTENT_GUIDE.md for the format. */
FM.modules('html', [
  {
    title: 'First contact',
    missions: [
      {
        id: 'html-what-is-html',
        title: 'What a web page is made of',
        minutes: 6,
        steps: [
          {
            type: 'brief',
            title: 'Your briefing',
            body: `
              Every website you have ever visited is built from three languages:

              - **HTML** — the *structure*. What is on the page: headings, paragraphs, images, buttons.
              - **CSS** — the *look*. Colours, fonts, spacing, layout.
              - **JavaScript** — the *behaviour*. What happens when you click, type or scroll.

              Think of a house. HTML is the walls and rooms, CSS is the paint and furniture, JavaScript is the electricity.

              This dossier is HTML. You'll start writing it in about a minute.
            `,
          },
          {
            type: 'quiz',
            q: 'A client wants their buttons to be **dark green** instead of grey. Which language changes that?',
            options: ['HTML', 'CSS', 'JavaScript'],
            answer: 1,
            explain: 'Colour is part of the *look*, so it is CSS. HTML says "there is a button"; JavaScript says what happens when you click it.',
          },
          {
            type: 'brief',
            title: 'Tags',
            body: `
              HTML works by wrapping content in **tags**. A tag is a word inside angle brackets.

              \`\`\`html
              <h1>Welcome to my shop</h1>
              \`\`\`

              - \`<h1>\` is the **opening tag**. It says "a main heading starts here".
              - \`</h1>\` is the **closing tag**. Same word, with a \`/\` in front. It says "the heading ends here".
              - Everything in between is the **content**.

              Opening tag + content + closing tag together are called an **element**.
            `,
          },
          {
            type: 'exhibit',
            title: 'See it run',
            body: `Here are two elements: a heading (\`h1\`) and a paragraph (\`p\`). The result shows how the browser draws them. **You can edit this code** — try changing the words.`,
            html: `
              <h1>Welcome to my shop</h1>
              <p>We sell handmade candles.</p>
            `,
          },
          {
            type: 'quiz',
            q: 'Which one is a **closing** tag?',
            options: ['`<p>`', '`</p>`', '`<p/>`', '`<close p>`'],
            answer: 1,
            explain: 'A closing tag is the same tag name with a forward slash before it: `</p>`.',
          },
          {
            type: 'task',
            title: 'Your first element',
            body: `
              Write a main heading that says **Hello world**.

              Use an opening \`<h1>\`, the text, then a closing \`</h1>\`.
            `,
            html: `<!-- Write your heading below -->\n`,
            checks: [
              { text: 'There is an `<h1>` element', test: (c) => !!c.$('h1') },
              {
                text: 'The heading says *Hello world*',
                test: (c) => /^hello,? world!?$/i.test(c.text('h1')) || (c.$('h1') ? 'Your h1 says "' + c.text('h1') + '". Make it say Hello world.' : false),
              },
              {
                text: 'The heading is closed with `</h1>`',
                test: (c) => /<h1[^>]*>[\s\S]*<\/h1>/i.test(c.src('html')),
              },
            ],
            hint: 'Type it exactly like this, all on one line: an opening tag `<h1>`, the words `Hello world`, then the closing tag `</h1>`.',
            solution: { html: `<h1>Hello world</h1>` },
          },
          {
            type: 'brief',
            title: 'Paragraphs',
            body: `
              Normal text goes in a **paragraph**: the \`<p>\` tag.

              \`\`\`html
              <p>Open Monday to Friday.</p>
              <p>Free delivery over £30.</p>
              \`\`\`

              Each \`<p>\` starts on a new line with a little space above and below. You don't press Enter to get a new line in HTML -- you start a new element.

              >! Pressing Enter inside your code does **not** create a new line on the page. The browser squashes all spaces and line breaks in your text into a single space.
            `,
          },
          {
            type: 'fill',
            q: 'Complete the code so this text is a paragraph.',
            code: `<[[p]]>Free delivery over £30.</[[p]]>`,
            options: ['p', 'h1', '/p', 'para'],
          },
          {
            type: 'task',
            title: 'Heading and two paragraphs',
            body: `
              Build a tiny "About" section:

              1. A heading \`<h1>\` that says **About us**
              2. Underneath it, **two** paragraphs. Write anything you like in them.
            `,
            html: `\n`,
            checks: [
              { text: 'An `<h1>` that says *About us*', test: (c) => /^about us$/i.test(c.text('h1')) },
              {
                text: 'Two `<p>` paragraphs',
                test: (c) => {
                  const n = c.$$('p').length;
                  return n >= 2 || (n === 1 ? 'You have one paragraph. Add a second <p>…</p> underneath it.' : false);
                },
              },
              { text: 'The paragraphs have text in them', test: (c) => c.$$('p').length >= 2 && c.$$('p').every((p) => p.textContent.trim().length > 0) },
              { text: 'The heading comes first', test: (c) => c.$('h1') && c.$('p') && c.$('h1').compareDocumentPosition(c.$('p')) & 4 },
            ],
            hint: 'Three elements, one after another:\n\n```html\n<h1>About us</h1>\n<p>…</p>\n<p>…</p>\n```',
            solution: {
              html: `
                <h1>About us</h1>
                <p>We are a small family business in Leicester.</p>
                <p>Every candle is poured by hand.</p>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              'HTML is the **structure** of a page; CSS is the look; JavaScript is the behaviour.',
              'An **element** = opening tag + content + closing tag: `<p>Hi</p>`.',
              'A closing tag has a slash: `</p>`.',
              '`<h1>` is the main heading. `<p>` is a paragraph.',
              'Line breaks in your code are ignored — new lines on the page come from new elements.',
            ],
          },
        ],
      },

      /* ── 2 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-page-skeleton',
        title: 'The page skeleton',
        minutes: 8,
        steps: [
          {
            type: 'brief',
            title: 'Every page has the same skeleton',
            body: `
              So far you've written bits of a page. A real HTML file wraps those bits in a fixed skeleton. Every website you have ever built with AI starts like this:

              \`\`\`html
              <!doctype html>
              <html lang="en-GB">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Rosie's Bakery</title>
                </head>
                <body>
                  <h1>Rosie's Bakery</h1>
                  <p>Fresh bread every morning.</p>
                </body>
              </html>
              \`\`\`

              - \`<!doctype html>\` -- the first line. It tells the browser "this is modern HTML".
              - \`<html>\` -- wraps the whole page. \`lang="en-GB"\` says the page is in British English.
              - \`<head>\` -- information **about** the page. Nothing in here appears on the page itself.
              - \`<body>\` -- everything the visitor **sees**.
            `,
          },
          {
            type: 'exhibit',
            title: 'A complete page',
            body: `This is a whole HTML document. Only the \`<body>\` shows up in the result. Try changing the text in the \`<title>\`: nothing on the page changes.`,
            html: `
              <!doctype html>
              <html lang="en-GB">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Rosie's Bakery</title>
                </head>
                <body>
                  <h1>Rosie's Bakery</h1>
                  <p>Fresh bread every morning from 7am.</p>
                </body>
              </html>
            `,
            after: `The \`<title>\` isn't on the page. It shows in the **browser tab**, in bookmarks, and as the blue link in Google results.`,
          },
          {
            type: 'quiz',
            q: 'You want your shop name to appear in the **browser tab**. Where does the `<title>` go?',
            options: ['Inside `<head>`', 'Inside `<body>`', 'Above `<!doctype html>`', 'Inside the `<h1>`'],
            answer: 0,
            explain: '`<title>` is information *about* the page, so it lives in `<head>`. The visible heading on the page is a separate `<h1>` in the `<body>`.',
          },
          {
            type: 'brief',
            title: 'The three lines in the head',
            body: `
              You'll put these three in the \`<head>\` of every page you make:

              \`\`\`html
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Rosie's Bakery</title>
              \`\`\`

              - **\`meta charset\`** -- the character set. \`utf-8\` lets you use £, é, emoji and every alphabet. Without it, a "£" can turn into "Â£".
              - **\`meta viewport\`** -- makes the page fit a phone screen. Without it, phones show a tiny zoomed-out desktop version.
              - **\`title\`** -- the name in the tab and in Google.

              \`<meta>\` has no closing tag. Some tags are like that: they hold no content, so there is nothing to close.
            `,
          },
          {
            type: 'fill',
            q: 'Complete the head and start the body.',
            code: `
              <head>
                <meta [[charset]]="utf-8">
                <[[title]]>Rosie's Bakery</[[title]]>
              </head>
              <[[body]]>
                <h1>Rosie's Bakery</h1>
            `,
            options: ['charset', 'title', 'body', 'head', 'lang', 'meta'],
          },
          {
            type: 'task',
            title: 'Fill in the skeleton',
            body: `
              The skeleton is ready. Fill it in:

              1. Put **Rosie's Bakery** in the \`<title>\`.
              2. In the \`<body>\`, add an \`<h1>\` that says **Rosie's Bakery**.
              3. Under it, add a \`<p>\` with any sentence about the bakery.
            `,
            html: `
              <!doctype html>
              <html lang="en-GB">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title></title>
                </head>
                <body>
                  <!-- Add the heading and paragraph here -->
                </body>
              </html>
            `,
            checks: [
              {
                text: 'The `<title>` says *Rosie\'s Bakery*',
                test: (c) => /rosie/i.test(c.doc.title) || (c.doc.title.trim() ? 'Your title says "' + c.doc.title.trim() + '".' : 'The title is still empty. Type the name between <title> and </title>.'),
              },
              { text: 'An `<h1>` that says *Rosie\'s Bakery*', test: (c) => /rosie/i.test(c.text('h1')) },
              { text: 'A paragraph with some text', test: (c) => c.$$('p').some((p) => p.textContent.trim().length > 0) },
              {
                text: 'The heading is inside `<body>`',
                test: (c) => /<body[^>]*>[\s\S]*<h1[\s\S]*<\/body>/i.test(c.src('html')) || (c.$('h1') ? 'Move the <h1> so it sits between <body> and </body>.' : false),
              },
            ],
            hint: 'The title goes between `<title>` and `</title>`. Replace the comment in the body with:\n\n```html\n<h1>Rosie\'s Bakery</h1>\n<p>…</p>\n```',
            solution: {
              html: `
                <!doctype html>
                <html lang="en-GB">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Rosie's Bakery</title>
                  </head>
                  <body>
                    <h1>Rosie's Bakery</h1>
                    <p>Sourdough, croissants and cakes, baked fresh every morning.</p>
                  </body>
                </html>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Nesting and indentation',
            body: `
              Elements sit **inside** other elements: \`<title>\` inside \`<head>\`, \`<head>\` inside \`<html>\`. This is called **nesting**.

              The rule: **close the last one you opened first.** Like boxes inside boxes.

              \`\`\`html
              <head><title>Shop</title></head>   <!-- right -->
              <head><title>Shop</head></title>   <!-- wrong: crossed over -->
              \`\`\`

              **Indent** each level by two spaces so you can see the boxes at a glance. The browser ignores the spaces; they are for you.

              > Browsers are forgiving. Put a heading in the \`<head>\` or forget a closing tag and the browser quietly guesses what you meant. The page can *look* fine and still be broken for Google or a screen reader, so write it properly.
            `,
          },
          {
            type: 'quiz',
            q: 'Which one is nested correctly?',
            options: [
              '`<body><h1>Dave\'s Plumbing</h1></body>`',
              '`<body><h1>Dave\'s Plumbing</body></h1>`',
              '`<h1><body>Dave\'s Plumbing</h1></body>`',
              '`<body>Dave\'s Plumbing<h1></h1></body>`',
            ],
            answer: 0,
            explain: 'The `<h1>` opened last, so it closes first, then the `<body>`. The last option is valid HTML, but the heading is empty and the text sits outside it.',
          },
          {
            type: 'task',
            title: 'Build one from scratch',
            body: `
              Write a complete page for **Dave's Plumbing**, from the very first line:

              1. \`<!doctype html>\`
              2. \`<html>\` with \`lang="en-GB"\`
              3. A \`<head>\` with the \`charset\` and \`viewport\` meta tags, and a \`<title>\` that says **Dave's Plumbing**
              4. A \`<body>\` with an \`<h1>\` (any text)

              Indent as you go. If you get stuck, scroll up to the skeleton -- typing it out once is how it sticks.
            `,
            html: `<!-- Write the whole page here -->\n`,
            checks: [
              {
                text: 'It starts with `<!doctype html>`',
                test: (c) => /^\s*<!doctype html\s*>/i.test(c.src('html')) || (/<!doctype/i.test(c.src('html')) ? 'The doctype must be the very first thing in the file.' : false),
              },
              {
                text: '`<html>` has a `lang` attribute',
                test: (c) => (/<html[\s>]/i.test(c.src('html')) && !!c.doc.documentElement.lang) || (/<html[\s>]/i.test(c.src('html')) ? 'Add lang="en-GB" inside the opening <html> tag.' : false),
              },
              {
                text: 'The `<head>` has the `charset` and `viewport` meta tags',
                test: (c) => {
                  const s = c.src('html');
                  if (!/<head[\s>]/i.test(s)) return false;
                  if (!/<meta[^>]*charset\s*=\s*["']?utf-8/i.test(s)) return 'The charset meta tag is missing: <meta charset="utf-8">';
                  if (!/<meta[^>]*name\s*=\s*["']?viewport/i.test(s)) return 'The viewport meta tag is missing.';
                  return true;
                },
              },
              {
                text: 'The `<title>` says *Dave\'s Plumbing*',
                test: (c) => /dave/i.test(c.doc.title) || (c.doc.title.trim() ? 'Your title says "' + c.doc.title.trim() + '".' : false),
              },
              { text: 'The `<body>` has an `<h1>`', test: (c) => /<body[\s>]/i.test(c.src('html')) && !!c.$('body h1') && c.text('h1').length > 0 },
            ],
            hint: 'The order is: doctype, `<html lang="en-GB">`, `<head>` (the two `<meta>` tags and the `<title>`), `</head>`, `<body>` (your `<h1>`), `</body>`, `</html>`.',
            solution: {
              html: `
                <!doctype html>
                <html lang="en-GB">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Dave's Plumbing</title>
                  </head>
                  <body>
                    <h1>Dave's Plumbing</h1>
                  </body>
                </html>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              'Every page starts with `<!doctype html>`, then `<html lang="en-GB">` wrapping a `<head>` and a `<body>`.',
              '`<head>` is information *about* the page (not shown). `<body>` is what visitors see.',
              'Always put `<meta charset="utf-8">`, the `viewport` meta tag and a `<title>` in the head.',
              'The `<title>` shows in the browser tab and as the link in Google, not on the page.',
              'Nesting: close the last tag you opened first. Indent each level so you can see the structure.',
            ],
          },
        ],
      },

      /* ── 3 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-headings',
        title: 'Headings and structure',
        minutes: 8,
        steps: [
          {
            type: 'brief',
            title: 'Six levels of heading',
            body: `
              HTML has six headings, \`<h1>\` to \`<h6>\`. They work like the contents page of a book:

              \`\`\`html
              <h1>Sharp Cuts Barbers</h1>
                <h2>Services</h2>
                  <h3>Haircuts</h3>
                  <h3>Beard trims</h3>
                <h2>Opening hours</h2>
              \`\`\`

              - **One \`<h1>\` per page**: what the whole page is about.
              - \`<h2>\` for the main sections, \`<h3>\` for parts of a section, and so on.
              - **Don't skip levels.** An \`<h4>\` straight after an \`<h2>\` is like a book chapter that jumps from 2 to 2.1.1.

              Google reads your headings to work out what the page covers. Screen reader users jump from heading to heading to scan it.
            `,
          },
          {
            type: 'exhibit',
            title: 'Headings in the browser',
            body: `The browser makes higher-level headings bigger. (The indentation in the code is only there to show the outline; the browser ignores it.)`,
            html: `
              <h1>Sharp Cuts Barbers</h1>
              <h2>Services</h2>
                <h3>Haircuts</h3>
                <p>Skin fades, scissor cuts and kids' cuts.</p>
                <h3>Beard trims</h3>
                <p>Shape-up and hot towel finish.</p>
              <h2>Opening hours</h2>
              <p>Tuesday to Saturday, 9am to 6pm.</p>
            `,
            after: `>! Choose a heading by its **place in the outline**, never by its size. If an \`<h2>\` looks too big, you'll change its size with CSS later. Don't swap it for an \`<h4>\`.`,
          },
          {
            type: 'quiz',
            q: 'Your page has `<h2>Services</h2>`. Underneath it you want a heading for **Beard trims**, which is one of the services. Which tag?',
            options: ['`<h3>`', '`<h2>`', '`<h1>`', '`<h5>`, because it should look smaller'],
            answer: 0,
            explain: 'Beard trims is a part of the Services section, so it is one level down: `<h3>`. Size is never the reason to pick a level.',
          },
          {
            type: 'task',
            title: 'Outline a barber\'s page',
            body: `
              Build this outline, in this order:

              1. \`<h1>\` **Sharp Cuts**
              2. \`<h2>\` **Services**
              3. \`<h3>\` **Haircuts**
              4. \`<h3>\` **Beard trims**
              5. \`<h2>\` **Find us**

              You can add a paragraph under any heading if you like.
            `,
            html: `<!-- Build the outline here -->\n`,
            checks: [
              {
                text: 'One `<h1>` that says *Sharp Cuts*',
                test: (c) => {
                  const n = c.$$('h1').length;
                  if (n > 1) return 'You have ' + n + ' h1 headings. A page should have just one.';
                  return /sharp cuts/i.test(c.text('h1'));
                },
              },
              {
                text: 'Two `<h2>`s: *Services* and *Find us*',
                test: (c) => {
                  const t = c.$$('h2').map((h) => h.textContent.trim().toLowerCase());
                  return (t.some((x) => /services/.test(x)) && t.some((x) => /find us/.test(x))) || (t.length ? 'Your h2 headings say: ' + t.join(', ') : false);
                },
              },
              {
                text: 'Two `<h3>`s between *Services* and *Find us*',
                test: (c) => {
                  const h2 = c.$$('h2');
                  const s = h2.find((h) => /services/i.test(h.textContent));
                  const f = h2.find((h) => /find us/i.test(h.textContent));
                  if (!s || !f) return false;
                  const inside = c.$$('h3').filter((h) => s.compareDocumentPosition(h) & 4 && h.compareDocumentPosition(f) & 4);
                  return inside.length >= 2 || (c.$$('h3').length >= 2 ? 'Put the h3 headings after Services and before Find us.' : false);
                },
              },
              {
                text: 'No heading levels are skipped',
                test: (c) => {
                  const lv = c.$$('h1, h2, h3, h4, h5, h6').map((h) => +h.tagName[1]);
                  if (lv.length < 2) return false;
                  if (lv[0] !== 1) return 'The first heading should be the h1.';
                  for (let i = 1; i < lv.length; i++) if (lv[i] > lv[i - 1] + 1) return 'An h' + lv[i] + ' comes straight after an h' + lv[i - 1] + '. Go down one level at a time.';
                  return true;
                },
              },
            ],
            hint: 'Five headings, one after another. The first two lines are:\n\n```html\n<h1>Sharp Cuts</h1>\n<h2>Services</h2>\n```',
            solution: {
              html: `
                <h1>Sharp Cuts</h1>
                <h2>Services</h2>
                <h3>Haircuts</h3>
                <p>From £18.</p>
                <h3>Beard trims</h3>
                <p>From £10.</p>
                <h2>Find us</h2>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Line breaks and dividers',
            body: `
              Two tags with no closing tag and no content:

              - **\`<br>\`** -- a line break *inside* the same block of text. Perfect for addresses.
              - **\`<hr>\`** -- a divider between two topics. Browsers draw it as a horizontal line.

              \`\`\`html
              <p>
                12 High Street<br>
                Bristol BS1 4DJ
              </p>
              <hr>
              <p>Open Tuesday to Saturday.</p>
              \`\`\`

              >! Don't use a stack of \`<br>\` tags to add space between things. Spacing is CSS's job. Use \`<br>\` only where a line really breaks: addresses, poems, song lyrics.
            `,
          },
          {
            type: 'fill',
            q: 'Put the postcode on its own line, inside the same paragraph.',
            code: `
              <p>12 High Street[[<br>|<br/>|<br />]]
              Bristol BS1 4DJ</p>
            `,
            options: ['<br>', '</br>', '<hr>', '<p>'],
            explain: '`<br>` breaks the line without starting a new paragraph. It has no closing tag, so `</br>` is a mistake.',
          },
          {
            type: 'brief',
            title: 'Comments',
            body: `
              A **comment** is a note in your code that the browser ignores. It starts with \`<!--\` and ends with \`-->\`:

              \`\`\`html
              <!-- Summer hours: change back in September -->
              <p>Open 8am to 8pm.</p>
              \`\`\`

              Use comments to leave notes for yourself, or to switch a piece of code off for a while without deleting it. The starter code in these tasks uses them to tell you what to do.

              >! Comments are hidden on the page, but anyone can read them with "View source". Never put passwords, prices you haven't agreed, or rude notes about a client in them.
            `,
          },
          {
            type: 'quiz',
            q: 'What does the visitor see?\n\n```html\n<p>Open 9 to 5<!-- till 6 on Fridays --></p>\n```',
            options: ['Open 9 to 5', 'Open 9 to 5 till 6 on Fridays', 'Open 9 to 5<!-- till 6 on Fridays -->', 'Nothing: the comment hides the whole paragraph'],
            answer: 0,
            explain: 'Only the comment itself is hidden. The rest of the paragraph shows as normal.',
          },
          {
            type: 'task',
            title: 'The "Find us" block',
            body: `
              Finish the contact section under the heading:

              1. **One** paragraph with the address on three lines: **Sharp Cuts Barbers**, **12 High Street**, **Bristol BS1 4DJ**. Use \`<br>\` between the lines.
              2. An \`<hr>\` after the address.
              3. After that, a paragraph: **Call 0117 496 0123**.
              4. Above the phone paragraph, a comment that says **Summer hours start in June**. It must not show on the page.
            `,
            html: `
              <h2>Find us</h2>
              <!-- Your work goes here -->
            `,
            checks: [
              {
                text: 'One paragraph with the address, using `<br>`',
                test: (c) => c.$$('p').some((p) => p.querySelectorAll('br').length >= 2 && /high street/i.test(p.textContent)) || (c.$$('p').some((p) => /high street/i.test(p.textContent)) ? 'Keep the address in one <p>, with a <br> at the end of the first two lines.' : false),
              },
              {
                text: 'An `<hr>` after the address',
                test: (c) => {
                  const hr = c.$('hr');
                  const a = c.$$('p').find((p) => /high street/i.test(p.textContent));
                  return !!(hr && a && a.compareDocumentPosition(hr) & 4) || (hr ? 'The <hr> should come after the address paragraph.' : false);
                },
              },
              {
                text: 'A paragraph with the phone number after the `<hr>`',
                test: (c) => {
                  const hr = c.$('hr');
                  return !!hr && c.$$('p').some((p) => /0117\s*496\s*0123/.test(p.textContent) && hr.compareDocumentPosition(p) & 4);
                },
              },
              {
                text: 'A hidden comment about summer hours',
                test: (c) => {
                  if (/summer/i.test(c.doc.body.textContent)) return 'The note shows on the page. Wrap it in <!-- and -->.';
                  const w = c.doc.createTreeWalker(c.doc.body, 128);
                  let n;
                  while ((n = w.nextNode())) if (/summer/i.test(n.nodeValue)) return true;
                  return false;
                },
              },
            ],
            hint: 'The address paragraph looks like this:\n\n```html\n<p>\n  Sharp Cuts Barbers<br>\n  12 High Street<br>\n  Bristol BS1 4DJ\n</p>\n```\n\nThen `<hr>`, the comment `<!-- … -->`, and the phone paragraph.',
            solution: {
              html: `
                <h2>Find us</h2>
                <p>
                  Sharp Cuts Barbers<br>
                  12 High Street<br>
                  Bristol BS1 4DJ
                </p>
                <hr>
                <!-- Summer hours start in June -->
                <p>Call 0117 496 0123</p>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              'Headings `<h1>`–`<h6>` form an outline. Use **one `<h1>`** per page and never skip a level.',
              'Pick a heading level by its place in the outline, not by its size. Size is CSS\'s job.',
              '`<br>` breaks a line inside a block (addresses). `<hr>` divides two topics. Neither has a closing tag.',
              'Don\'t use `<br>` to make space. Use CSS for spacing.',
              'Comments `<!-- like this -->` are hidden on the page but readable in View source.',
            ],
          },
        ],
      },

      /* ── 4 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-text-meaning',
        title: 'Text with meaning',
        minutes: 9,
        steps: [
          {
            type: 'brief',
            title: 'Bold and italic, with meaning',
            body: `
              HTML has two tags that make text bold and two that make it italic. The difference is **meaning**:

              | Tag | Means | Use it for |
              |---|---|---|
              | \`<strong>\` | This is important | Warnings, key facts |
              | \`<b>\` | Bold, nothing more | Product names, keywords |
              | \`<em>\` | Say this word with stress | "We do *not* deliver on Sundays" |
              | \`<i>\` | A different voice | Foreign phrases, names of boats, a thought |

              \`\`\`html
              <p><strong>Warning:</strong> our brownies contain nuts.</p>
              <p>We are <em>not</em> open on bank holidays.</p>
              \`\`\`

              Screen readers and search engines treat \`<strong>\` and \`<em>\` as signals. \`<b>\` and \`<i>\` only change the look. When in doubt, use \`<strong>\` and \`<em>\`.
            `,
          },
          {
            type: 'exhibit',
            title: 'Try them',
            body: `Here are all four. Try wrapping other words in them.`,
            html: `
              <p><strong>Warning:</strong> our brownies contain nuts.</p>
              <p>We are <em>not</em> open on bank holidays.</p>
              <p>Try our <b>Lemon Drizzle</b> or our <b>Triple Chocolate</b> cake.</p>
              <p>Fresh <i>pain au chocolat</i> every morning.</p>
            `,
          },
          {
            type: 'quiz',
            q: 'A bakery wants **Contains nuts** to stand out on each product, because it is a safety warning. Which tag fits best?',
            options: ['`<strong>`', '`<b>`', '`<em>`', '`<h1>`'],
            answer: 0,
            explain: '`<strong>` means "this is important". `<b>` looks the same but carries no importance, and `<h1>` is for the page\'s main heading, not a warning.',
          },
          {
            type: 'brief',
            title: 'Highlights, fine print and little numbers',
            body: `
              A few more for everyday text:

              - **\`<mark>\`** -- highlighted, like a highlighter pen. "**New**", or a search match.
              - **\`<small>\`** -- fine print: "Prices include VAT", "T&Cs apply".
              - **\`<sup>\`** -- superscript (raised text): the "st" in 21st, written \`21<sup>st</sup>\`.
              - **\`<sub>\`** -- subscript (lowered text): the 2 in CO2, written \`CO<sub>2</sub>\`.

              \`\`\`html
              <p><mark>New:</mark> gluten-free loaves on Fridays.</p>
              <p><small>Prices include VAT.</small></p>
              \`\`\`

              They all sit *inside* a paragraph, around a few words.
            `,
          },
          {
            type: 'task',
            title: 'This week at the café',
            body: `
              Mark up the café's offers:

              1. Highlight the word **New:** with \`<mark>\`.
              2. Make **half price** important with \`<strong>\`.
              3. Put the whole text of the last paragraph in \`<small>\` (keep the \`<p>\` around it).
              4. Raise the **st** in **21st** with \`<sup>\`.
            `,
            html: `
              <h2>This week at Bean There Café</h2>
              <p>New: oat milk at no extra charge.</p>
              <p>Cakes are half price after 4pm.</p>
              <p>Offer ends Sunday 21st March.</p>
            `,
            checks: [
              {
                text: '*New:* is in a `<mark>`',
                test: (c) => c.$$('mark').some((m) => /^new:?$/i.test(m.textContent.trim())) || (c.$('mark') ? 'Only the word New: should be inside the <mark>.' : false),
              },
              {
                text: '*half price* is in a `<strong>`',
                test: (c) => c.$$('strong').some((s) => /^half price$/i.test(s.textContent.trim())) || (c.$('strong') ? 'Wrap just the words half price in <strong>.' : false),
              },
              {
                text: 'The last paragraph is fine print',
                test: (c) => c.$$('p small').some((s) => /offer ends/i.test(s.textContent)) || (c.$$('small').some((s) => /offer ends/i.test(s.textContent)) ? 'Keep the <p> and put <small> inside it.' : false),
              },
              { text: 'The *st* in 21st is raised', test: (c) => c.$$('sup').some((s) => s.textContent.trim() === 'st') },
            ],
            hint: 'Wrap only the words you want, inside the paragraph. For example: `<p><mark>New:</mark> oat milk…</p>` and `21<sup>st</sup>`.',
            solution: {
              html: `
                <h2>This week at Bean There Café</h2>
                <p><mark>New:</mark> oat milk at no extra charge.</p>
                <p>Cakes are <strong>half price</strong> after 4pm.</p>
                <p><small>Offer ends Sunday 21<sup>st</sup> March.</small></p>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Quotes and code',
            body: `
              **\`<blockquote>\`** is for a quote from someone else: customer reviews, a line from a newspaper. The browser indents it.

              \`\`\`html
              <blockquote>
                <p>Best fish and chips in Whitby. We come every summer!</p>
              </blockquote>
              <p>-- The Patel family</p>
              \`\`\`

              **\`<code>\`** is for bits of computer code shown on the page, for example on a help page you write for a client. Browsers show it in a typewriter-style font:

              \`\`\`html
              <p>Use <code>&lt;br&gt;</code> for a new line.</p>
              \`\`\`

              That \`&lt;\` is there for a reason. That's next.
            `,
          },
          {
            type: 'quiz',
            q: 'You want to show a five-star customer review on a plumber\'s home page. Which element should wrap the review text?',
            options: ['`<blockquote>`', '`<code>`', '`<em>`', '`<small>`'],
            answer: 0,
            explain: 'A review is a quote from someone else, so `<blockquote>`. `<em>` is for stressing a word, not a whole quote.',
          },
          {
            type: 'brief',
            title: 'Special characters',
            body: `
              Some characters mean something to HTML. A \`<\` starts a tag, so to *show* one you write a code called an **entity**. Every entity starts with \`&\` and ends with \`;\`.

              | Write | To show | Why |
              |---|---|---|
              | \`&lt;\` and \`&gt;\` | < and > | Otherwise the browser thinks it's a tag |
              | \`&amp;\` | & | The & itself starts an entity |
              | \`&copy;\` | © | Copyright lines in footers |
              | \`&pound;\` | £ | Works even if the file's encoding is wrong |
              | \`&nbsp;\` | a space that never breaks | Keeps "9 am" or "£5 off" together on one line |

              Thanks to \`utf-8\`, you can usually type £ and © directly. But \`&amp;\`, \`&lt;\` and \`&gt;\` are worth using every time.
            `,
          },
          {
            type: 'exhibit',
            title: 'Entities in action',
            body: `Try deleting the \`&lt;\` and \`&gt;\` and typing a real \`<br>\` instead. Watch the words disappear and the line break.`,
            html: `
              <p>Fish &amp; Chips, &pound;8.50</p>
              <p>Use the &lt;br&gt; tag for a new line.</p>
              <p>Open 9&nbsp;am to 5&nbsp;pm</p>
              <p>&copy; 2025 Harbour Fish &amp; Chips</p>
            `,
          },
          {
            type: 'fill',
            q: 'Write the footer line *© 2025 Fish & Chips. Cod from £8.50* using entities.',
            code: `<p>[[&copy;]] 2025 Fish [[&amp;]] Chips. Cod from [[&pound;]]8.50</p>`,
            options: ['&copy;', '&amp;', '&pound;', '&lt;', '&nbsp;'],
          },
          {
            type: 'task',
            title: 'Reviews and the footer',
            body: `
              1. Wrap the review paragraph (the one starting **Best fish**) in a \`<blockquote>\`.
              2. In the last line, replace the word **Copyright** with the © symbol, written as an entity.
              3. In the same line, change **and** in "Fish and Chips" to an ampersand, written as an entity.
            `,
            html: `
              <h2>What customers say</h2>
              <p>Best fish and chips in Whitby. We come every summer!</p>
              <p>-- The Patel family</p>

              <p>Copyright 2025 Harbour Fish and Chips</p>
            `,
            checks: [
              { text: 'The review is in a `<blockquote>`', test: (c) => /best fish/i.test(c.text('blockquote')) },
              {
                text: 'The last line has a ©',
                test: (c) => c.$$('p').some((p) => /©\s*2025/.test(p.textContent)) || (/copyright/i.test(c.doc.body.textContent) ? 'Replace the word Copyright with &copy;' : false),
              },
              {
                text: 'It says *Fish & Chips*, written with `&amp;`',
                test: (c) => {
                  if (!/fish\s*&\s*chips/i.test(c.doc.body.textContent)) return false;
                  return /fish\s*&amp;\s*chips/i.test(c.src('html')) || 'It works, but write the ampersand as &amp; to be safe.';
                },
              },
            ],
            hint: 'The last line becomes `<p>&copy; 2025 Harbour Fish &amp; Chips</p>`. The review goes inside `<blockquote>` … `</blockquote>`, with its `<p>` still inside.',
            solution: {
              html: `
                <h2>What customers say</h2>
                <blockquote>
                  <p>Best fish and chips in Whitby. We come every summer!</p>
                </blockquote>
                <p>-- The Patel family</p>

                <p>&copy; 2025 Harbour Fish &amp; Chips</p>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              '`<strong>` = important, `<em>` = stressed. `<b>` and `<i>` only change the look. When unsure, use strong and em.',
              '`<mark>` highlights, `<small>` is fine print, `<sup>` and `<sub>` raise and lower text: `21<sup>st</sup>`, `CO<sub>2</sub>`.',
              '`<blockquote>` is for quotes and reviews. `<code>` is for computer code.',
              'Entities start with `&` and end with `;`: `&lt;` `&gt;` `&amp;` `&copy;` `&pound;` `&nbsp;`.',
              'Always write a visible `&` as `&amp;` and a visible `<` as `&lt;`.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Links, images and lists',
    missions: [
      /* ── 5 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-links',
        title: 'Links',
        minutes: 9,
        steps: [
          {
            type: 'brief',
            title: 'The anchor tag',
            body: `
              A link is an \`<a>\` element (short for *anchor*):

              \`\`\`html
              <a href="prices.html">See our prices</a>
              \`\`\`

              - \`href\` says **where** the link goes.
              - The text between the tags is **what people click**.

              \`href\` is an **attribute**: extra information written inside the opening tag, as \`name="value"\`. You'll meet lots of attributes from here on.
            `,
          },
          {
            type: 'exhibit',
            title: 'Click a link',
            body: `Click the links in the result. The preview never leaves this page: a note appears underneath saying where the link would have gone.`,
            html: `
              <p>Have a look at <a href="prices.html">our prices</a>.</p>
              <p>Follow us on <a href="https://www.instagram.com/">Instagram</a>.</p>
            `,
            after: `Links are blue and underlined by default, and turn purple once visited. CSS can change all of that.`,
          },
          {
            type: 'fill',
            q: 'Make this link go to the prices page.',
            code: `<a [[href]]="prices.html">See our prices</a>`,
            options: ['href', 'src', 'link', 'url'],
            explain: '`href` stands for *hypertext reference*. `src` is used for images, which is next mission.',
          },
          {
            type: 'brief',
            title: 'Absolute and relative links',
            body: `
              There are two kinds of address:

              | Kind | Example | Use it for |
              |---|---|---|
              | **Absolute** | \`https://www.instagram.com/rosiesbakery\` | Other websites |
              | **Relative** | \`prices.html\` | Pages on your own site |

              A **relative** link is a path from the page you're on:

              - \`prices.html\` -- a file in the same folder
              - \`services/boilers.html\` -- a file inside the \`services\` folder
              - \`../index.html\` -- go **up** one folder first (\`..\` means "the folder above")

              Use relative links for your own pages: they keep working on your computer, on a test site and on the live domain. An absolute link must start with \`https://\`, or the browser thinks it's a file on your site.
            `,
          },
          {
            type: 'quiz',
            q: 'You are editing `services/boilers.html`. You want to link to the home page, `index.html`, which is in the main folder (one level up). Which `href`?',
            options: ['`../index.html`', '`index.html`', '`services/index.html`', '`/../index`'],
            answer: 0,
            explain: '`..` steps up out of the `services` folder, then `index.html` is found there. Plain `index.html` would look for `services/index.html`.',
          },
          {
            type: 'task',
            title: 'Link up the bakery',
            body: `
              Turn each paragraph's text into a link (keep the \`<p>\` around it):

              1. **Home** goes to \`index.html\`
              2. **Our prices** goes to \`prices.html\`
              3. **Instagram** goes to \`https://www.instagram.com/rosiesbakery\`
            `,
            html: `
              <h1>Rosie's Bakery</h1>
              <p>Home</p>
              <p>Our prices</p>
              <p>Instagram</p>
            `,
            checks: [
              {
                text: '*Home* links to `index.html`',
                test: (c) => {
                  const a = c.$$('a').find((x) => /home/i.test(x.textContent));
                  return (!!a && /^(\.\/)?index\.html$/.test((a.getAttribute('href') || '').trim())) || (a ? 'Your Home link goes to "' + a.getAttribute('href') + '".' : false);
                },
              },
              {
                text: '*Our prices* links to `prices.html`',
                test: (c) => {
                  const a = c.$$('a').find((x) => /prices/i.test(x.textContent));
                  return (!!a && /^(\.\/)?prices\.html$/.test((a.getAttribute('href') || '').trim())) || (a ? 'Your prices link goes to "' + a.getAttribute('href') + '".' : false);
                },
              },
              {
                text: '*Instagram* links to the full Instagram address',
                test: (c) => {
                  const a = c.$$('a').find((x) => /instagram/i.test(x.textContent));
                  if (!a) return false;
                  const h = (a.getAttribute('href') || '').trim();
                  if (/^https:\/\/(www\.)?instagram\.com\/rosiesbakery\/?$/i.test(h)) return true;
                  if (/^(www\.)?instagram\.com/i.test(h)) return 'Start it with https:// or the browser treats it as a file on your own site.';
                  return 'Your Instagram link goes to "' + h + '".';
                },
              },
              { text: 'The link text still shows on the page', test: (c) => c.$$('a').length >= 3 && c.$$('a').every((a) => a.textContent.trim().length > 0) },
            ],
            hint: 'Wrap the words in an `<a>` inside each paragraph:\n\n```html\n<p><a href="index.html">Home</a></p>\n```',
            solution: {
              html: `
                <h1>Rosie's Bakery</h1>
                <p><a href="index.html">Home</a></p>
                <p><a href="prices.html">Our prices</a></p>
                <p><a href="https://www.instagram.com/rosiesbakery">Instagram</a></p>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Opening in a new tab',
            body: `
              To open a link in a new tab, add \`target="_blank"\`. Add \`rel="noopener"\` with it:

              \`\`\`html
              <a href="https://www.facebook.com/rosiesbakery" target="_blank" rel="noopener">Facebook</a>
              \`\`\`

              - \`target="_blank"\` -- open in a new tab. Many business owners want this for links to *other* sites, so visitors don't lose their tab.
              - \`rel="noopener"\` -- stops the new tab from getting any control over your page. Modern browsers now do this by default, but you'll see it in nearly all AI-written code, and it does no harm.

              >! Don't open your *own* pages in new tabs. It breaks the Back button and annoys people.
            `,
          },
          {
            type: 'quiz',
            q: 'You link to a supplier\'s website and want it to open in a new tab, safely. What do you add to the `<a>`?',
            options: ['`target="_blank" rel="noopener"`', '`target="new"`', '`href="_blank"`', '`rel="_blank" target="noopener"`'],
            answer: 0,
            explain: '`target="_blank"` opens a new tab; `rel="noopener"` cuts the link back to your page. The values are easy to swap by mistake, as in the last option.',
          },
          {
            type: 'brief',
            title: 'Jump links, email and phone',
            body: `
              Three more kinds of \`href\`, all very useful on a business site:

              \`\`\`html
              <h2 id="hours">Opening hours</h2>
              <a href="#hours">See our opening hours</a>

              <a href="mailto:hello@sharpcuts.co.uk">Email us</a>
              <a href="tel:+441174960123">0117 496 0123</a>
              \`\`\`

              - **\`#hours\`** jumps to the element with \`id="hours"\` on the same page. Great for one-page sites and "Back to top" links.
              - **\`mailto:\`** opens the visitor's email app with your address filled in.
              - **\`tel:\`** lets phone users call with one tap. Write the number with **no spaces**, ideally in international form: \`+44\` and then the number without its first 0.

              Most visitors to a local business site are on a phone. A tappable phone number is often the most important link on the page.
            `,
          },
          {
            type: 'exhibit',
            title: 'Jump around',
            body: `Click **Opening hours** or **Contact** to jump down. The email and phone links show a note instead, since the preview can't open apps.`,
            html: `
              <h1 id="top">Sharp Cuts Barbers</h1>
              <p><a href="#hours">Opening hours</a> · <a href="#contact">Contact</a></p>
              <p>Walk-ins welcome. Skin fades, scissor cuts, beard trims and hot towel shaves.</p>
              <p>Family run since 1998. Kids' cuts on Saturday mornings.</p>
              <p>We use only cruelty-free products.</p>
              <h2 id="hours">Opening hours</h2>
              <p>Tuesday to Friday, 9am to 6pm.</p>
              <p>Saturday, 8am to 4pm.</p>
              <p>Sunday and Monday, closed.</p>
              <h2 id="contact">Contact</h2>
              <p><a href="mailto:hello@sharpcuts.co.uk">hello@sharpcuts.co.uk</a></p>
              <p><a href="tel:+441174960123">0117 496 0123</a></p>
              <p><a href="#top">Back to top</a></p>
            `,
            height: 260,
          },
          {
            type: 'fill',
            q: 'Complete the three links.',
            code: `
              <a href="[[mailto]]:hello@sharpcuts.co.uk">Email us</a>
              <a href="[[tel]]:+441174960123">Call 0117 496 0123</a>
              <a href="[[#hours]]">Opening hours</a>
            `,
            options: ['mailto', 'tel', '#hours', 'hours', 'email', 'phone'],
            explain: 'A jump link needs the `#`. Without it, `hours` would be treated as a page called *hours*.',
          },
          {
            type: 'task',
            title: 'The contact links',
            body: `
              Replace the comments with four links:

              1. **Email us** -- emails \`hello@sharpcuts.co.uk\`
              2. **0117 496 0123** -- calls \`+441174960123\`
              3. **Facebook** -- goes to \`https://www.facebook.com/sharpcuts\` in a new tab, safely
              4. **Back to top** -- jumps to the heading (it already has \`id="top"\`)
            `,
            html: `
              <h1 id="top">Sharp Cuts Barbers</h1>
              <p>Book a cut, or ask us anything.</p>

              <h2>Contact</h2>
              <!-- 1. Email link -->
              <!-- 2. Phone link -->
              <!-- 3. Facebook link -->

              <!-- 4. Back to top link -->
            `,
            checks: [
              {
                text: 'An email link to `hello@sharpcuts.co.uk`',
                test: (c) => {
                  const a = c.$$('a').find((x) => /@/.test(x.getAttribute('href') || ''));
                  if (!a) return false;
                  const h = a.getAttribute('href').trim();
                  return /^mailto:hello@sharpcuts\.co\.uk$/i.test(h) || (/^mailto:/i.test(h) ? 'Check the spelling of the address: "' + h + '".' : 'Start the href with mailto: so it opens an email.');
                },
              },
              {
                text: 'A phone link to `+441174960123`',
                test: (c) => {
                  const a = c.$$('a').find((x) => /^tel:/i.test(x.getAttribute('href') || ''));
                  if (!a) return c.$$('a').some((x) => /0117|4960123/.test(x.getAttribute('href') || '')) ? 'Start the href with tel:' : false;
                  const h = a.getAttribute('href').trim();
                  if (/\s/.test(h)) return 'Remove the spaces from the number in the href. The link text can keep them.';
                  return /^tel:(\+44|0)1174960123$/.test(h) || 'Your phone link goes to "' + h + '".';
                },
              },
              {
                text: 'A Facebook link that opens in a new tab, with `rel="noopener"`',
                test: (c) => {
                  const a = c.$$('a').find((x) => /facebook\.com/i.test(x.getAttribute('href') || ''));
                  if (!a) return false;
                  if (!/^https:\/\//i.test(a.getAttribute('href').trim())) return 'Start the Facebook address with https://';
                  if (a.getAttribute('target') !== '_blank') return 'Add target="_blank" to open a new tab.';
                  return a.relList.contains('noopener') || 'Add rel="noopener" as well.';
                },
              },
              {
                text: '*Back to top* jumps to `#top`',
                test: (c) => {
                  const a = c.$$('a').find((x) => /top/i.test(x.textContent));
                  return (!!a && a.getAttribute('href') === '#top') || (a ? 'The href should be #top, with the # in front.' : false);
                },
              },
            ],
            hint: 'Each one is an `<a>` with a different kind of `href`:\n\n```html\n<a href="mailto:…">Email us</a>\n<a href="tel:…">0117 496 0123</a>\n```\n\nThe Facebook link needs `target` and `rel`. The last one needs `href="#top"`.',
            solution: {
              html: `
                <h1 id="top">Sharp Cuts Barbers</h1>
                <p>Book a cut, or ask us anything.</p>

                <h2>Contact</h2>
                <p><a href="mailto:hello@sharpcuts.co.uk">Email us</a></p>
                <p><a href="tel:+441174960123">0117 496 0123</a></p>
                <p><a href="https://www.facebook.com/sharpcuts" target="_blank" rel="noopener">Facebook</a></p>

                <p><a href="#top">Back to top</a></p>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              'A link is `<a href="where">text to click</a>`.',
              'Absolute links (`https://…`) for other sites; relative links (`prices.html`, `../index.html`) for your own pages. `..` means "the folder above".',
              'Open other sites in a new tab with `target="_blank" rel="noopener"`. Never your own pages.',
              '`href="#hours"` jumps to the element with `id="hours"` on the same page.',
              '`mailto:you@example.co.uk` opens an email; `tel:+441174960123` calls. No spaces in a `tel:` link.',
            ],
          },
        ],
      },

      /* ── 6 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-images',
        title: 'Images',
        minutes: 10,
        steps: [
          {
            type: 'brief',
            title: 'The image tag',
            body: `
              \`\`\`html
              <img src="images/loaf.jpg" alt="A golden sourdough loaf on a wooden board">
              \`\`\`

              - \`src\` (*source*) -- the image file to show.
              - \`alt\` (*alternative text*) -- a short description. Screen readers read it aloud, Google uses it to understand the picture, and it shows if the image fails to load.

              \`<img>\` has **no closing tag**. The image *is* the content.
            `,
          },
          {
            type: 'exhibit',
            title: 'One works, one doesn\'t',
            body: `The first image is a picture written as code (a *data URI*), so it works here without a real file. The second points to a file that doesn't exist, so the browser shows its \`alt\` text instead.`,
            html: `
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='140' viewBox='0 0 240 140'%3E%3Crect width='240' height='140' fill='%23f6ead7'/%3E%3Cellipse cx='120' cy='84' rx='88' ry='40' fill='%23c98a43'/%3E%3Cpath d='M68 72q16-16 32 0M104 66q16-16 32 0M140 72q16-16 32 0' stroke='%23f6ead7' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E" alt="A golden sourdough loaf" width="240" height="140">

              <img src="images/croissant.jpg" alt="Three butter croissants on a tray" width="240" height="140">
            `,
            after: `On your own site, \`src\` is just a file path like \`images/croissant.jpg\`. Image files don't exist in this preview, so in the tasks the checks look at your attributes, not at the picture.`,
          },
          {
            type: 'quiz',
            q: 'On a plumber\'s home page there is a photo of Dave fitting a new boiler. Which `alt` text is best?',
            options: [
              '`alt="Dave fitting a new boiler in a customer\'s kitchen"`',
              '`alt="image"`',
              '`alt="IMG_4032.jpg"`',
              '`alt="plumber plumbing Bristol boiler cheap plumber"`',
            ],
            answer: 0,
            explain: 'Describe what the picture shows and why it\'s there. A file name tells nobody anything, and stuffing in keywords reads like spam to people and to Google.',
          },
          {
            type: 'task',
            title: 'Add the logo',
            body: `
              Above the heading, add the bakery's logo:

              - The file is \`images/logo.png\`.
              - The logo shows the words **Rosie's Bakery**, so that is the \`alt\` text.
              - Give it \`width="200"\` and \`height="80"\`.

              The image won't appear (the file isn't really there). The checks read your attributes.
            `,
            html: `
              <!-- Add the logo here -->
              <h1>Fresh bread every morning</h1>
            `,
            checks: [
              { text: 'There is an `<img>`', test: (c) => !!c.$('img') },
              {
                text: '`src` is `images/logo.png`',
                test: (c) => {
                  const s = (c.$('img') && c.$('img').getAttribute('src') || '').trim();
                  if (/^(\.\/)?images\/logo\.png$/.test(s)) return true;
                  if (/^(\.\/)?images\/logo\.png$/i.test(s)) return 'File names are case-sensitive on most servers. Use images/logo.png exactly.';
                  return s ? 'Your src is "' + s + '". Write the folder, a slash, then the file name.' : false;
                },
              },
              {
                text: '`alt` says *Rosie\'s Bakery*',
                test: (c) => {
                  const i = c.$('img');
                  if (!i) return false;
                  if (!i.hasAttribute('alt')) return 'Add an alt attribute.';
                  return /rosie/i.test(i.getAttribute('alt')) || 'The alt text should say what the logo says: Rosie\'s Bakery.';
                },
              },
              {
                text: '`width` is 200 and `height` is 80',
                test: (c) => {
                  const i = c.$('img');
                  if (!i) return false;
                  const w = i.getAttribute('width') || '';
                  const h = i.getAttribute('height') || '';
                  if (/px/i.test(w + h)) return 'Write width and height as plain numbers, without px.';
                  return (w.trim() === '200' && h.trim() === '80') || (w || h ? 'Width is "' + w + '" and height is "' + h + '".' : false);
                },
              },
            ],
            hint: 'One tag with four attributes, in any order:\n\n```html\n<img src="…" alt="…" width="…" height="…">\n```',
            solution: {
              html: `
                <img src="images/logo.png" alt="Rosie's Bakery" width="200" height="80">
                <h1>Fresh bread every morning</h1>
              `,
            },
          },
          {
            type: 'brief',
            title: 'File paths and folders',
            body: `
              A typical small site keeps its images in a folder:

              \`\`\`
              my-site/
                index.html
                prices.html
                about/
                  team.html
                images/
                  logo.png
                  shop.jpg
              \`\`\`

              The path in \`src\` starts from **the page you're on**, just like relative links:

              - From \`index.html\`: \`images/logo.png\`
              - From \`about/team.html\`: \`../images/logo.png\` (up out of \`about\`, then into \`images\`)

              >! On most web servers, \`Logo.PNG\` and \`logo.png\` are **different files**. A site that works on your computer can break when it goes live because of a capital letter. Keep file names lowercase, with hyphens instead of spaces: \`shop-front.jpg\`.
            `,
          },
          {
            type: 'quiz',
            q: 'Using the folder tree above, you are editing `about/team.html`. What is the `src` for `shop.jpg`?',
            options: ['`../images/shop.jpg`', '`images/shop.jpg`', '`about/images/shop.jpg`', '`..images/shop.jpg`'],
            answer: 0,
            explain: '`..` goes up from `about` to `my-site`, then `/images/shop.jpg` goes down into the images folder. Don\'t forget the slash after `..`.',
          },
          {
            type: 'brief',
            title: 'Good alt text',
            body: `
              - **Describe what matters here.** The same photo might be "Our shop on Park Street" on the contact page and "A blue shop front with flower boxes" in a gallery.
              - **Don't start with "Image of".** Screen readers already say "image".
              - **Keep it short**: a sentence at most.
              - **Text in the picture?** Put that text in the \`alt\` (logos, posters).
              - **Pure decoration** (a swirl, a divider line)? Use an **empty** alt: \`alt=""\`. Screen readers then skip it.

              >! Never leave \`alt\` out completely. A screen reader will read the file name instead: "IMG underscore 4032 dot jpeg".
            `,
          },
          {
            type: 'task',
            title: 'Fix the team page',
            body: `
              This code is the page \`about/team.html\`. The images are in the \`images\` folder at the top of the site (like the tree above). Fix it:

              1. Fix the path of Dave's photo so it works from inside the \`about\` folder.
              2. Give Dave's photo a useful \`alt\` that mentions him by name.
              3. Fix the path of the divider too.
              4. The divider is pure decoration: give it an empty \`alt\`.
            `,
            html: `
              <h1>Meet the team</h1>
              <img src="images/dave.jpg" alt="image" width="300" height="300">
              <p>Dave has been fixing boilers in Bristol for 20 years.</p>
              <img src="images/divider.svg" alt="divider.svg" width="300" height="20">
            `,
            checks: [
              {
                text: 'Dave\'s photo path works from the `about` folder',
                test: (c) => {
                  const i = c.$$('img').find((x) => /dave/i.test(x.getAttribute('src') || ''));
                  if (!i) return false;
                  const s = i.getAttribute('src').trim();
                  return /^(\.\.\/|\/)images\/dave\.jpg$/.test(s) || (s === 'images/dave.jpg' ? 'This page is inside the about folder, so go up one level first with ../' : 'The src is "' + s + '".');
                },
              },
              {
                text: 'Dave\'s photo has useful `alt` text',
                test: (c) => {
                  const i = c.$$('img').find((x) => /dave/i.test(x.getAttribute('src') || ''));
                  const a = i ? (i.getAttribute('alt') || '').trim() : '';
                  if (!i) return false;
                  if (/^(an? )?(image|picture|photo)( of)?\b/i.test(a)) return 'Drop "image of": screen readers already say it\'s an image.';
                  if (!/dave/i.test(a)) return 'Mention Dave in the alt text.';
                  return a.length >= 8 || 'Say a little more about the photo.';
                },
              },
              {
                text: 'The divider path works from the `about` folder',
                test: (c) => {
                  const i = c.$$('img').find((x) => /divider/i.test(x.getAttribute('src') || ''));
                  return !!i && /^(\.\.\/|\/)images\/divider\.svg$/.test(i.getAttribute('src').trim());
                },
              },
              {
                text: 'The divider has an empty `alt`',
                test: (c) => {
                  const i = c.$$('img').find((x) => /divider/i.test(x.getAttribute('src') || ''));
                  if (!i) return false;
                  if (!i.hasAttribute('alt')) return 'Keep the alt attribute, just empty: alt=""';
                  return i.getAttribute('alt').trim() === '' || 'Empty means nothing between the quotes: alt=""';
                },
              },
            ],
            hint: 'Both paths need `../` in front. Dave\'s alt could be something like *Dave, our lead plumber, in his work van*. The divider gets `alt=""`.',
            solution: {
              html: `
                <h1>Meet the team</h1>
                <img src="../images/dave.jpg" alt="Dave, our lead plumber, standing by his van" width="300" height="300">
                <p>Dave has been fixing boilers in Bristol for 20 years.</p>
                <img src="../images/divider.svg" alt="" width="300" height="20">
              `,
            },
          },
          {
            type: 'brief',
            title: 'Captions, sizes and lazy loading',
            body: `
              \`\`\`html
              <figure>
                <img src="images/cake.jpg" alt="Three-tier lemon cake with fresh flowers"
                     width="600" height="400" loading="lazy">
                <figcaption>Our lemon wedding cake, from £180.</figcaption>
              </figure>
              \`\`\`

              - **\`<figure>\`** groups an image with its caption. **\`<figcaption>\`** is the caption everyone sees; \`alt\` is for people who can't see the image.
              - **\`width\` and \`height\`** let the browser save the right amount of space before the image arrives, so the page doesn't jump about. Plain numbers (pixels), no \`px\`. CSS can still resize the image later.
              - **\`loading="lazy"\`** waits to download the image until the visitor scrolls near it. Faster pages, less data on phones. Leave it off the big image at the very top.
            `,
          },
          {
            type: 'exhibit',
            title: 'A figure',
            body: `The browser indents a \`<figure>\` a little by default. Try editing the caption.`,
            html: `
              <figure>
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23eef3f8'/%3E%3Crect x='70' y='130' width='160' height='50' rx='6' fill='%23f7e27a'/%3E%3Crect x='95' y='85' width='110' height='45' rx='6' fill='%23f9ea9a'/%3E%3Crect x='120' y='45' width='60' height='40' rx='6' fill='%23fbf2bf'/%3E%3Ccircle cx='150' cy='38' r='8' fill='%23e86a8a'/%3E%3C/svg%3E" alt="Three-tier lemon cake topped with a raspberry" width="300" height="200" loading="lazy">
                <figcaption>Our lemon wedding cake, from £180.</figcaption>
              </figure>
            `,
          },
          {
            type: 'fill',
            q: 'Complete the gallery item.',
            code: `
              <[[figure]]>
                <img src="images/candles.jpg" alt="Three amber candles on a shelf" [[loading]]="lazy">
                <[[figcaption]]>Our autumn range</[[figcaption]]>
              </[[figure]]>
            `,
            options: ['figure', 'figcaption', 'loading', 'caption', 'lazy', 'alt'],
          },
          {
            type: 'task',
            title: 'A gallery picture',
            body: `
              Add a captioned picture for a candle shop:

              1. A \`<figure>\` containing an \`<img>\` and a \`<figcaption>\`.
              2. The image file is \`images/autumn-candles.jpg\`. Write your own \`alt\` (imagine three amber candles on a wooden shelf).
              3. Give it \`width="600"\`, \`height="400"\` and lazy loading.
              4. The caption says **Our autumn range, from £12**.
            `,
            html: `
              <h2>Gallery</h2>
              <!-- Your figure here -->
            `,
            checks: [
              { text: 'A `<figure>` with an `<img>` and a `<figcaption>` inside', test: (c) => !!c.$('figure img') && !!c.$('figure figcaption') },
              {
                text: 'The image has a useful `alt`',
                test: (c) => {
                  const i = c.$('img');
                  if (!i) return false;
                  const a = (i.getAttribute('alt') || '').trim();
                  if (!a) return 'Add alt text describing the candles.';
                  if (/\.(jpe?g|png)$/i.test(a)) return 'Describe the picture rather than giving the file name.';
                  if (/^(an? )?(image|picture|photo)( of)?\b/i.test(a)) return 'Drop "image of": screen readers already say it\'s an image.';
                  return a.length >= 8 || 'Say a little more about the picture.';
                },
              },
              {
                text: '`src`, `width` and `height` are set',
                test: (c) => {
                  const i = c.$('img');
                  if (!i) return false;
                  if (!/^(\.\/)?images\/autumn-candles\.jpg$/.test((i.getAttribute('src') || '').trim())) return 'The src should be images/autumn-candles.jpg';
                  return (i.getAttribute('width') === '600' && i.getAttribute('height') === '400') || 'Set width="600" and height="400".';
                },
              },
              { text: 'The image loads lazily', test: (c) => !!c.$('img') && c.$('img').getAttribute('loading') === 'lazy' },
              { text: 'The caption says *Our autumn range, from £12*', test: (c) => /autumn range/i.test(c.text('figcaption')) && /£\s*12/.test(c.text('figcaption')) },
            ],
            hint: 'The shape is:\n\n```html\n<figure>\n  <img src="…" alt="…" width="…" height="…" loading="lazy">\n  <figcaption>…</figcaption>\n</figure>\n```',
            solution: {
              html: `
                <h2>Gallery</h2>
                <figure>
                  <img src="images/autumn-candles.jpg" alt="Three amber candles on a wooden shelf" width="600" height="400" loading="lazy">
                  <figcaption>Our autumn range, from £12</figcaption>
                </figure>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              '`<img src="images/logo.png" alt="…" width="200" height="80">`. No closing tag.',
              'Paths start from the current page. `../` goes up a folder. File names are case-sensitive on servers, so keep them lowercase.',
              'Good `alt` describes what matters in context. No "image of". Decorative images get `alt=""`. Never leave `alt` out.',
              '`width` and `height` stop the page jumping while images load. `loading="lazy"` delays images further down the page.',
              '`<figure>` + `<figcaption>` gives an image a visible caption.',
            ],
          },
        ],
      },

      /* ── 7 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-lists',
        title: 'Lists',
        minutes: 8,
        steps: [
          {
            type: 'brief',
            title: 'Bullets and numbers',
            body: `
              Two kinds of list:

              \`\`\`html
              <ul>
                <li>Lavender</li>
                <li>Fig and cedar</li>
              </ul>

              <ol>
                <li>Choose your scent</li>
                <li>Pick a size</li>
              </ol>
              \`\`\`

              - \`<ul>\` -- an **unordered** list (bullets). The order doesn't matter: services, features, ingredients.
              - \`<ol>\` -- an **ordered** list (numbers). The order matters: steps, top tens, directions.
              - \`<li>\` -- a **list item**. Every item goes in its own \`<li>\`, and *only* \`<li>\` goes directly inside a \`<ul>\` or \`<ol>\`.
            `,
          },
          {
            type: 'exhibit',
            title: 'Both lists',
            body: `The browser adds the bullets and numbers for you. Try moving a step: the numbers update themselves.`,
            html: `
              <h2>Our scents</h2>
              <ul>
                <li>Lavender</li>
                <li>Fig and cedar</li>
                <li>Sea salt</li>
              </ul>
              <h2>How to order</h2>
              <ol>
                <li>Choose your scent</li>
                <li>Pick a size</li>
                <li>Add a gift message if you like</li>
              </ol>
            `,
          },
          {
            type: 'quiz',
            q: 'A barber\'s site explains how to book: open the app, pick a barber, choose a time. Which list?',
            options: ['`<ol>`', '`<ul>`', 'Three `<p>` elements', 'Three `<li>` elements on their own'],
            answer: 0,
            explain: 'The steps have to happen in order, so an ordered list. `<li>` elements must always sit inside a `<ul>` or `<ol>`.',
          },
          {
            type: 'task',
            title: 'Scents and steps',
            body: `
              Replace each comment with a list:

              1. Under **Our scents**: a bullet list with **Lavender**, **Fig and cedar** and **Sea salt**.
              2. Under **How to order**: a numbered list with three steps (your own words).
            `,
            html: `
              <h2>Our scents</h2>
              <!-- Bullet list here -->

              <h2>How to order</h2>
              <!-- Numbered list here -->
            `,
            checks: [
              { text: 'A `<ul>` with three items', test: (c) => { const u = c.$('ul'); return !!u && u.querySelectorAll('li').length >= 3; } },
              {
                text: 'An `<ol>` with three items, under *How to order*',
                test: (c) => {
                  const o = c.$('ol');
                  const h = c.$$('h2').find((x) => /order/i.test(x.textContent));
                  if (!o) return false;
                  if (o.querySelectorAll('li').length < 3) return 'Your numbered list needs three <li> items.';
                  return !!(h && h.compareDocumentPosition(o) & 4) || 'Put the numbered list under the How to order heading.';
                },
              },
              {
                text: 'Every item is in an `<li>`',
                test: (c) => {
                  const lists = c.$$('ul, ol');
                  if (!lists.length) return false;
                  const ok = lists.every((l) => Array.from(l.childNodes).every((n) => (n.nodeType === 1 ? n.tagName === 'LI' : !n.textContent.trim())));
                  return ok || 'Everything directly inside a <ul> or <ol> must be in an <li>.';
                },
              },
              { text: 'No empty items', test: (c) => c.$$('li').length >= 6 && c.$$('li').every((li) => li.textContent.trim().length > 0) },
            ],
            hint: 'Each list is an outer tag with one `<li>` per item:\n\n```html\n<ul>\n  <li>Lavender</li>\n  …\n</ul>\n```\n\nThe numbered list uses `<ol>` instead.',
            solution: {
              html: `
                <h2>Our scents</h2>
                <ul>
                  <li>Lavender</li>
                  <li>Fig and cedar</li>
                  <li>Sea salt</li>
                </ul>

                <h2>How to order</h2>
                <ol>
                  <li>Choose your scent</li>
                  <li>Pick a size</li>
                  <li>Add your gift message and pay</li>
                </ol>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Lists inside lists',
            body: `
              To nest a list, put the whole inner list **inside an \`<li>\`**, after its text:

              \`\`\`html
              <ul>
                <li>Haircuts
                  <ul>
                    <li>Skin fade</li>
                    <li>Scissor cut</li>
                  </ul>
                </li>
                <li>Beard trims</li>
              </ul>
              \`\`\`

              The \`</li>\` for *Haircuts* comes **after** the inner list closes. A \`<ul>\` sitting directly inside another \`<ul>\` is a common mistake: browsers show it, but it's broken HTML.
            `,
          },
          {
            type: 'fill',
            q: 'Complete the nested list.',
            code: `
              <ul>
                <li>Haircuts
                  <[[ul]]>
                    <li>Skin fade</li>
                    <li>Scissor cut</li>
                  </[[ul]]>
                </[[li]]>
                <li>Beard trims</li>
              </ul>
            `,
            options: ['ul', 'li', 'ol', 'nav'],
          },
          {
            type: 'brief',
            title: 'Menus are lists',
            body: `
              A website's menu is a list of links, so it's written as one, inside a \`<nav>\` element (*navigation*):

              \`\`\`html
              <nav>
                <ul>
                  <li><a href="index.html">Home</a></li>
                  <li><a href="services.html">Services</a></li>
                  <li><a href="contact.html">Contact</a></li>
                </ul>
              </nav>
              \`\`\`

              A screen reader announces "navigation, list, 3 items", so the visitor knows what they're in and how big it is. The bullets look odd for now; CSS turns this into a neat menu bar. Nearly every site you'll see is built this way.
            `,
          },
          {
            type: 'quiz',
            q: 'Which menu has *Boiler repairs* nested correctly under *Services*?',
            options: [
              '`<ul><li><a href="services.html">Services</a><ul><li><a href="boilers.html">Boiler repairs</a></li></ul></li></ul>`',
              '`<ul><li><a href="services.html">Services</a></li><ul><li><a href="boilers.html">Boiler repairs</a></li></ul></ul>`',
              '`<ul><li><a href="services.html">Services</a><li><a href="boilers.html">Boiler repairs</a></li></li></ul>`',
            ],
            answer: 0,
            explain: 'The inner `<ul>` must sit inside the Services `<li>`. In the second, it sits directly in the outer `<ul>`; in the third, an `<li>` is inside an `<li>` with no list around it.',
          },
          {
            type: 'task',
            title: 'A plumber\'s menu',
            body: `
              Build the site menu:

              1. A \`<nav>\` with a \`<ul>\` of **four** links: **Home** (\`index.html\`), **Services** (\`services.html\`), **Prices** (\`prices.html\`), **Contact** (\`contact.html\`).
              2. Inside the *Services* item, after its link, a nested list with two links: **Boiler repairs** (\`boilers.html\`) and **Bathrooms** (\`bathrooms.html\`).
            `,
            html: `<!-- Build the menu here -->\n`,
            checks: [
              { text: 'A `<nav>` with a `<ul>` inside', test: (c) => !!c.$('nav > ul') || (c.$('nav') ? 'Put a <ul> directly inside the <nav>.' : false) },
              {
                text: 'Four top-level items, each with a link',
                test: (c) => {
                  const items = c.$$('nav > ul > li');
                  if (!items.length) return false;
                  if (items.length !== 4) return 'The main list has ' + items.length + ' items. It needs 4: Home, Services, Prices, Contact.';
                  return items.every((li) => li.querySelector(':scope > a[href]')) || 'Every item needs an <a href="…"> link inside it.';
                },
              },
              {
                text: 'The nested list is inside the *Services* item',
                test: (c) => {
                  if (c.$('nav ul > ul')) return 'A <ul> is sitting directly inside another <ul>. Move it inside the Services <li>, before its </li>.';
                  const li = c.$$('nav > ul > li').find((x) => /services/i.test((x.querySelector('a') || {}).textContent || ''));
                  return !!li && !!li.querySelector(':scope > ul');
                },
              },
              {
                text: 'The nested list has links to `boilers.html` and `bathrooms.html`',
                test: (c) => {
                  const hrefs = c.$$('nav li ul a').map((a) => (a.getAttribute('href') || '').trim());
                  return (hrefs.includes('boilers.html') && hrefs.includes('bathrooms.html')) || (hrefs.length ? 'The nested links go to: ' + hrefs.join(', ') : false);
                },
              },
            ],
            hint: 'Start with the plain menu from the briefing, with four items. Then change the Services item to:\n\n```html\n<li><a href="services.html">Services</a>\n  <ul>\n    <li><a href="boilers.html">Boiler repairs</a></li>\n    …\n  </ul>\n</li>\n```',
            solution: {
              html: `
                <nav>
                  <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="services.html">Services</a>
                      <ul>
                        <li><a href="boilers.html">Boiler repairs</a></li>
                        <li><a href="bathrooms.html">Bathrooms</a></li>
                      </ul>
                    </li>
                    <li><a href="prices.html">Prices</a></li>
                    <li><a href="contact.html">Contact</a></li>
                  </ul>
                </nav>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              '`<ul>` = bullets (order doesn\'t matter). `<ol>` = numbers (order matters).',
              'Every item goes in an `<li>`, and only `<li>` goes directly inside a `<ul>` or `<ol>`.',
              'To nest, put the inner list *inside* an `<li>`, before its `</li>`.',
              'A site menu is a list of links in a `<nav>`: `<nav><ul><li><a href="…">…</a></li></ul></nav>`.',
            ],
          },
        ],
      },

      /* ── 8 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-tables',
        title: 'Tables',
        minutes: 9,
        steps: [
          {
            type: 'brief',
            title: 'Rows and cells',
            body: `
              Tables are for information in **rows and columns**: price lists, opening hours, delivery charges.

              \`\`\`html
              <table>
                <tr>
                  <th>Day</th>
                  <th>Hours</th>
                </tr>
                <tr>
                  <td>Saturday</td>
                  <td>9am to 4pm</td>
                </tr>
              </table>
              \`\`\`

              - \`<table>\` wraps it all.
              - \`<tr>\` -- a **table row**.
              - \`<th>\` -- a **header** cell (bold and centred by default).
              - \`<td>\` -- a normal **data** cell.

              You build a table row by row, left to right. There is no tag for a column: a column is just the cells in the same position in each row.
            `,
          },
          {
            type: 'exhibit',
            title: 'Opening hours',
            body: `The CSS tab only adds lines so you can see the cells (tables have no borders by default). You'll learn CSS in the next dossier. Try adding a row for Sunday.`,
            html: `
              <table>
                <tr>
                  <th>Day</th>
                  <th>Hours</th>
                </tr>
                <tr>
                  <td>Monday to Friday</td>
                  <td>8am to 5pm</td>
                </tr>
                <tr>
                  <td>Saturday</td>
                  <td>9am to 4pm</td>
                </tr>
              </table>
            `,
            css: `
              th, td { border: 1px solid #999; padding: 4px 10px; }
              table { border-collapse: collapse; }
            `,
            edit: ['html'],
            active: 'html',
          },
          {
            type: 'quiz',
            q: 'Which tag makes a **header** cell, like *Day* or *Price* at the top of a column?',
            options: ['`<th>`', '`<td>`', '`<thead>`', '`<tr>`'],
            answer: 0,
            explain: '`<th>` is a header cell. `<thead>` is something else: a group of header rows, coming up shortly.',
          },
          {
            type: 'task',
            title: 'Café opening hours',
            body: `
              Build a table with two columns:

              | Day | Hours |
              |---|---|
              | Monday to Friday | 8am to 5pm |
              | Saturday | 9am to 4pm |
              | Sunday | Closed |

              The first row uses \`<th>\` cells; the others use \`<td>\`.
            `,
            html: `
              <h2>Opening hours</h2>
              <!-- Your table here -->
            `,
            checks: [
              {
                text: 'A table whose first row has two `<th>` cells',
                test: (c) => {
                  const r = c.$('table tr');
                  if (!r) return false;
                  const n = r.querySelectorAll('th').length;
                  return n === 2 || (n ? 'The first row has ' + n + ' header cells. It needs 2: Day and Hours.' : 'Use <th> for the cells in the first row.');
                },
              },
              { text: 'Three rows of `<td>` cells', test: (c) => c.$$('table tr').filter((r) => r.querySelectorAll('td').length === 2).length >= 3 },
              {
                text: 'Every row has two cells',
                test: (c) => {
                  const rows = c.$$('table tr');
                  if (rows.length < 4) return false;
                  const bad = rows.findIndex((r) => r.children.length !== 2);
                  return bad < 0 || 'Row ' + (bad + 1) + ' has ' + rows[bad].children.length + ' cells. Every row needs 2.';
                },
              },
              { text: 'Sunday says *Closed*', test: (c) => c.$$('td').some((td) => /^closed$/i.test(td.textContent.trim())) },
            ],
            hint: 'Four `<tr>` rows. The first:\n\n```html\n<tr>\n  <th>Day</th>\n  <th>Hours</th>\n</tr>\n```\n\nThe next three use `<td>` instead of `<th>`.',
            solution: {
              html: `
                <h2>Opening hours</h2>
                <table>
                  <tr>
                    <th>Day</th>
                    <th>Hours</th>
                  </tr>
                  <tr>
                    <td>Monday to Friday</td>
                    <td>8am to 5pm</td>
                  </tr>
                  <tr>
                    <td>Saturday</td>
                    <td>9am to 4pm</td>
                  </tr>
                  <tr>
                    <td>Sunday</td>
                    <td>Closed</td>
                  </tr>
                </table>
              `,
            },
          },
          {
            type: 'brief',
            title: 'A proper table',
            body: `
              A few more tags make a table clear to screen readers (and to you):

              \`\`\`html
              <table>
                <caption>Prices</caption>
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Skin fade</th>
                    <td>£20</td>
                  </tr>
                </tbody>
              </table>
              \`\`\`

              - **\`<caption>\`** -- the table's title. It goes straight after \`<table>\`.
              - **\`<thead>\`** wraps the header row; **\`<tbody>\`** wraps the rest.
              - **\`scope="col"\`** says "this header labels the column below it". **\`scope="row"\`** says "this header labels the row beside it". A screen reader can then say "Skin fade, Price, £20" instead of just "£20".
            `,
          },
          {
            type: 'fill',
            q: 'Fill in the table\'s structure.',
            code: `
              <table>
                <[[caption]]>Delivery charges</[[caption]]>
                <[[thead]]>
                  <tr><th scope="[[col]]">Distance</th><th scope="col">Charge</th></tr>
                </thead>
                <[[tbody]]>
                  <tr><th scope="[[row]]">Up to 5 miles</th><td>Free</td></tr>
                </tbody>
              </table>
            `,
            options: ['caption', 'thead', 'tbody', 'col', 'row', 'title', 'th'],
          },
          {
            type: 'brief',
            title: 'Not for layout',
            body: `
              In the 1990s, people built whole page layouts out of tables: a cell for the sidebar, a cell for the content. You may still see it in old sites and email templates.

              Don't. A screen reader reads a layout table as data ("row 1, column 2…"), and tables don't rearrange themselves to fit a phone. Layout is CSS's job.

              **Rule:** if it would make sense as a spreadsheet, it's a table. If not, it isn't.
            `,
          },
          {
            type: 'quiz',
            q: 'Which of these should be built as a table?',
            options: ['A price list with service, price and time for each item', 'The whole page: menu on the left, content on the right', 'A website\'s top menu', 'A list of five services, with no other details'],
            answer: 0,
            explain: 'A price list has rows and columns, like a spreadsheet. A layout is CSS\'s job, a menu is a list in a `<nav>`, and a single list of services is a `<ul>`.',
          },
          {
            type: 'task',
            title: 'The barber\'s price list',
            body: `
              The table works, but it isn't properly marked up. Upgrade it:

              1. Add a \`<caption>\` that says **Prices**.
              2. Wrap the header row in \`<thead>\`, and the other rows in \`<tbody>\`.
              3. Give the three header cells \`scope="col"\`.
              4. In each body row, change the first cell (the service name) to a \`<th scope="row">\`.
            `,
            html: `
              <table>
                <tr>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Time</th>
                </tr>
                <tr>
                  <td>Skin fade</td>
                  <td>£20</td>
                  <td>30 min</td>
                </tr>
                <tr>
                  <td>Scissor cut</td>
                  <td>£18</td>
                  <td>30 min</td>
                </tr>
                <tr>
                  <td>Beard trim</td>
                  <td>£10</td>
                  <td>15 min</td>
                </tr>
              </table>
            `,
            checks: [
              {
                text: 'A `<caption>` that says *Prices*, first inside the table',
                test: (c) => {
                  const cap = c.$('caption');
                  if (!cap) return false;
                  if (!/prices/i.test(cap.textContent)) return 'The caption should say Prices.';
                  return cap.parentElement.firstElementChild === cap || 'Put the <caption> straight after <table>.';
                },
              },
              {
                text: 'The header row is in a `<thead>`, with `scope="col"` on each header',
                test: (c) => {
                  const th = c.$$('thead th');
                  if (!th.length) return false;
                  return th.every((x) => x.getAttribute('scope') === 'col') || 'Add scope="col" to each header cell in the <thead>.';
                },
              },
              {
                text: 'The other rows are in a `<tbody>`',
                test: (c) => (/<tbody[\s>]/i.test(c.src('html')) && c.$$('tbody tr').length === 3) || (c.$('thead') ? 'Wrap the three other rows in <tbody> and </tbody>.' : false),
              },
              {
                text: 'Each body row starts with a `<th scope="row">`',
                test: (c) => {
                  const rows = c.$$('tbody tr');
                  if (rows.length < 3) return false;
                  const ok = rows.every((r) => r.firstElementChild && r.firstElementChild.tagName === 'TH' && r.firstElementChild.getAttribute('scope') === 'row');
                  return ok || 'Change the first <td> in each body row to <th scope="row">, and its </td> to </th>.';
                },
              },
            ],
            hint: 'The structure is `<table>`, `<caption>`, `<thead>` (first row), `<tbody>` (the other three rows), `</table>`. A body row then looks like:\n\n```html\n<tr>\n  <th scope="row">Skin fade</th>\n  <td>£20</td>\n  <td>30 min</td>\n</tr>\n```',
            solution: {
              html: `
                <table>
                  <caption>Prices</caption>
                  <thead>
                    <tr>
                      <th scope="col">Service</th>
                      <th scope="col">Price</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Skin fade</th>
                      <td>£20</td>
                      <td>30 min</td>
                    </tr>
                    <tr>
                      <th scope="row">Scissor cut</th>
                      <td>£18</td>
                      <td>30 min</td>
                    </tr>
                    <tr>
                      <th scope="row">Beard trim</th>
                      <td>£10</td>
                      <td>15 min</td>
                    </tr>
                  </tbody>
                </table>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              'A table is built row by row: `<table>` → `<tr>` → `<th>` (header) or `<td>` (data).',
              '`<caption>` titles the table and goes first. `<thead>` holds the header row; `<tbody>` holds the rest.',
              '`scope="col"` and `scope="row"` tell screen readers which cells a header labels.',
              'Every row should have the same number of cells.',
              'Tables are for data (if it fits a spreadsheet). Never for page layout.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Structure',
    missions: [
      /* ── 9 ─────────────────────────────────────────────────────────── */
      {
        id: 'html-attributes',
        title: 'Attributes, classes and ids',
        minutes: 9,
        steps: [
          {
            type: 'brief',
            title: 'How attributes are written',
            body: `
              You've already used \`href\`, \`src\`, \`alt\` and \`width\`. They're all **attributes**: extra settings for an element.

              \`\`\`html
              <a href="prices.html" target="_blank" rel="noopener">Prices</a>
              <img src="logo.png" alt="Rosie's Bakery" width="200">
              \`\`\`

              - They go in the **opening** tag, after the tag name.
              - Each is written \`name="value"\`, separated by **spaces**. Their order doesn't matter.
              - Always use quotes. Without them, a value with a space in it breaks.
              - A few are on/off switches with no value, like \`required\` on a form field. Being there means "yes". You'll use them in forms.
            `,
          },
          {
            type: 'quiz',
            q: 'Which one is written correctly?',
            options: [
              '`<img src="logo.png" alt="Rosie\'s Bakery">`',
              '`<img src="logo.png", alt="Rosie\'s Bakery">`',
              '`<img src="logo.png alt="Rosie\'s Bakery">`',
              '`<img> src="logo.png" alt="Rosie\'s Bakery"</img>`',
            ],
            answer: 0,
            explain: 'Attributes are separated by spaces (no commas), each value has an opening and closing quote, and they go *inside* the opening tag.',
          },
          {
            type: 'brief',
            title: 'id and class',
            body: `
              Two attributes work on any element and you'll see them everywhere:

              \`\`\`html
              <h2 id="opening-hours">Opening hours</h2>
              <p class="price">£12</p>
              <p class="price sale">£9</p>
              \`\`\`

              | | \`id\` | \`class\` |
              |---|---|---|
              | Unique? | Yes. Once per page | No. Reuse it as often as you like |
              | Per element | One | As many as you like, separated by spaces |
              | Used for | Jump links (\`#opening-hours\`), labels on forms, JavaScript | Styling groups of things with CSS, JavaScript |

              Think of an \`id\` as a passport number and a \`class\` as a job title. \`class="price sale"\` gives that paragraph **two** classes: \`price\` and \`sale\`.

              Write names in lowercase with hyphens: \`opening-hours\`, not \`Opening Hours\`.
            `,
          },
          {
            type: 'exhibit',
            title: 'Classes as labels',
            body: `Classes don't change anything by themselves. They're labels. Here the (locked) CSS tab colours every element labelled \`sale\`. Try adding \`sale\` to another product's class.`,
            html: `
              <h2 id="candles">Candles</h2>
              <p class="product">Lavender, £12</p>
              <p class="product sale">Fig and cedar, £10 (was £14)</p>
              <p class="product">Sea salt, £12</p>
            `,
            css: `
              .product { font-family: sans-serif; }
              .sale { color: crimson; font-weight: bold; }
            `,
            edit: ['html'],
            active: 'html',
          },
          {
            type: 'fill',
            q: 'Give the heading an id, give the paragraph two classes, and link to the heading.',
            code: `
              <h2 [[id]]="candles">Candles</h2>
              <p [[class]]="product sale">Fig and cedar, £10</p>
              <a href="[[#candles]]">See all candles</a>
            `,
            options: ['id', 'class', '#candles', 'candles', '.candles', 'name'],
          },
          {
            type: 'task',
            title: 'Label the products',
            body: `
              1. Give the heading the id **candles**.
              2. Give **every** paragraph the class **product**.
              3. Lavender and Sea salt are on offer: give those two the class **sale** as well (so they have both classes).
            `,
            html: `
              <h2>Candles</h2>
              <p>Lavender, £12</p>
              <p>Fig and cedar, £14</p>
              <p>Sea salt, £12</p>
            `,
            checks: [
              { text: 'The heading has the id `candles`', test: (c) => !!c.$('h2') && c.$('h2').id === 'candles' },
              {
                text: 'All three paragraphs have the class `product`',
                test: (c) => {
                  if (c.$$('p').some((p) => /,/.test(p.className))) return 'Separate class names with a space, not a comma.';
                  if (/<p[^>]*\bclass\s*=[^>]*\bclass\s*=/i.test(c.src('html'))) return 'An element can only have one class attribute. Put both names in it: class="product sale"';
                  return c.$$('p.product').length === 3;
                },
              },
              {
                text: 'Lavender and Sea salt also have the class `sale`',
                test: (c) => {
                  const sale = c.$$('p.sale').map((p) => p.textContent);
                  if (sale.some((t) => /fig/i.test(t))) return 'Fig and cedar is not on offer, so it shouldn\'t have the sale class.';
                  return (sale.length === 2 && sale.some((t) => /lavender/i.test(t)) && sale.some((t) => /sea salt/i.test(t))) || (sale.length ? 'Only ' + sale.length + ' paragraph has the sale class.' : false);
                },
              },
              {
                text: 'No id is used twice',
                test: (c) => {
                  const ids = c.$$('[id]').map((e) => e.id);
                  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
                  return dup ? 'The id "' + dup + '" is used more than once.' : ids.length > 0;
                },
              },
            ],
            hint: 'A paragraph with two classes looks like `<p class="product sale">…</p>`: one attribute, two names, a space between.',
            solution: {
              html: `
                <h2 id="candles">Candles</h2>
                <p class="product sale">Lavender, £12</p>
                <p class="product">Fig and cedar, £14</p>
                <p class="product sale">Sea salt, £12</p>
              `,
            },
          },
          {
            type: 'brief',
            title: 'div and span: plain boxes',
            body: `
              Sometimes you need to group things, but no tag with a meaning fits. That's what these are for:

              \`\`\`html
              <div class="card">
                <h3>Lavender candle</h3>
                <p>Only <span class="price">£12</span></p>
              </div>
              \`\`\`

              - **\`<div>\`** -- a box that groups other elements. It starts on a new line.
              - **\`<span>\`** -- wraps a few words *inside* a line of text, without breaking the line.

              Neither means anything on its own. They're hooks to hang a class on, so CSS or JavaScript can find them. Use them only when no meaningful tag fits: next mission shows the tags that usually do.

              >! AI tools often produce "div soup": dozens of nested \`<div>\`s. It works, but it's hard to read and tells Google and screen readers nothing.
            `,
          },
          {
            type: 'quiz',
            q: 'In the sentence *Candles from £12 this week*, you want to wrap just **£12** so CSS can colour it. Which element?',
            options: ['`<span>`', '`<div>`', '`<p>`', '`<h3>`'],
            answer: 0,
            explain: '`<span>` wraps words inside a line. A `<div>` or `<p>` would break the sentence onto separate lines.',
          },
          {
            type: 'brief',
            title: 'Two more: title and data-',
            body: `
              \`\`\`html
              <p>All prices include <abbr title="Value Added Tax">VAT</abbr>.</p>
              <div class="card" data-id="lav-01" data-price="12">…</div>
              \`\`\`

              - **\`title\`** shows a tooltip when you hover with a mouse. (\`<abbr>\` marks an abbreviation, and \`title\` spells it out.) Phones and keyboards can't hover, so never put anything important *only* in a title.
              - **\`data-\`** attributes are your own. Anything after \`data-\` is a name you choose. The browser ignores them; JavaScript reads them, for example a basket script that needs a product's id and price. Online shop code is full of them.
            `,
          },
          {
            type: 'task',
            title: 'A product card',
            body: `
              Build one product card:

              1. A \`<div>\` with the class **card** and a \`data-id\` of **lav-01**.
              2. Inside it, an \`<h3>\` that says **Lavender candle**.
              3. Under that, a paragraph **Only £12**, with **£12** wrapped in a \`<span>\` with the class **price**.
            `,
            html: `<!-- Your card here -->\n`,
            checks: [
              { text: 'A `<div>` with the class `card`', test: (c) => !!c.$('div.card') || (c.$('.card') ? 'Use a <div> for the card.' : false) },
              { text: 'The card has `data-id="lav-01"`', test: (c) => !!c.$('.card') && c.$('.card').getAttribute('data-id') === 'lav-01' },
              { text: 'An `<h3>` inside the card says *Lavender candle*', test: (c) => /lavender candle/i.test(c.text('.card h3')) || (c.$('h3') ? 'Put the <h3> inside the card <div>.' : false) },
              {
                text: 'The price is in a `<span class="price">` inside a paragraph',
                test: (c) => {
                  const s = c.$('.card p span.price');
                  if (!s) return c.$('.price') ? 'The span.price should be inside a <p> inside the card.' : false;
                  return /^£\s*12$/.test(s.textContent.trim()) || 'Only £12 should be inside the span.';
                },
              },
            ],
            hint: 'Start with the outer box and work inwards:\n\n```html\n<div class="card" data-id="lav-01">\n  <h3>…</h3>\n  <p>Only <span class="…">£12</span></p>\n</div>\n```',
            solution: {
              html: `
                <div class="card" data-id="lav-01">
                  <h3>Lavender candle</h3>
                  <p>Only <span class="price">£12</span></p>
                </div>
              `,
            },
          },
          {
            type: 'task',
            title: 'Find the bugs',
            body: `
              This code has three attribute mistakes. Fix them:

              1. Two elements have the id **book**. Keep it on the heading only.
              2. The link should have two classes, **btn** and **primary**. Fix how they're written.
              3. The last paragraph should have two classes, **note** and **small**. Fix how they're written.
            `,
            html: `
              <h2 id="book">Book a table</h2>
              <p id="book">Call us, or book online in a minute.</p>
              <a href="#book" class="btn, primary">Book now</a>
              <p class="note" class="small">Booking fee £5 per table.</p>
            `,
            checks: [
              {
                text: 'No id is used twice',
                test: (c) => {
                  const ids = c.$$('[id]').map((e) => e.id);
                  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
                  return !dup || 'The id "' + dup + '" is still used more than once.';
                },
              },
              { text: 'The heading still has the id `book`', test: (c) => !!c.$('h2') && c.$('h2').id === 'book' },
              {
                text: 'The link has the classes `btn` and `primary`',
                test: (c) => {
                  const a = c.$('a');
                  if (!a) return false;
                  if (/,/.test(a.className)) return 'There is still a comma in the class. Separate names with a space only.';
                  return (a.classList.contains('btn') && a.classList.contains('primary')) || 'The link\'s classes are: ' + (a.className || 'none');
                },
              },
              {
                text: 'The last paragraph has the classes `note` and `small`',
                test: (c) => {
                  const p = c.$$('p').find((x) => /booking fee/i.test(x.textContent));
                  if (!p) return false;
                  return (p.classList.contains('note') && p.classList.contains('small')) || 'The browser only reads the first class attribute. Use one: class="note small"';
                },
              },
            ],
            hint: 'Delete `id="book"` from the paragraph. A list of classes is one attribute with spaces between the names: `class="btn primary"`.',
            solution: {
              html: `
                <h2 id="book">Book a table</h2>
                <p>Call us, or book online in a minute.</p>
                <a href="#book" class="btn primary">Book now</a>
                <p class="note small">Booking fee £5 per table.</p>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              'Attributes go in the opening tag: `name="value"`, separated by spaces, always quoted.',
              'An `id` is unique on the page (one per element). A `class` can be reused, and an element can have several: `class="product sale"`.',
              'Never use commas between classes, and never write two `class` attributes on one element: the browser ignores the second.',
              '`<div>` groups elements in a box; `<span>` wraps words inside a line. Neither has meaning: use them only when nothing better fits.',
              '`title` adds a hover tooltip (don\'t rely on it). `data-*` attributes store your own information for JavaScript.',
            ],
          },
        ],
      },

      /* ── 10 ────────────────────────────────────────────────────────── */
      {
        id: 'html-semantic',
        title: 'Semantic layout',
        minutes: 9,
        steps: [
          {
            type: 'brief',
            title: 'Tags that name the parts of a page',
            body: `
              Almost every business site has the same parts. HTML has a tag for each:

              \`\`\`html
              <header>
                <nav>…</nav>
              </header>
              <main>
                …
              </main>
              <footer>…</footer>
              \`\`\`

              - **\`<header>\`** -- the top of the page: the business name or logo, and usually the menu.
              - **\`<nav>\`** -- the main menu.
              - **\`<main>\`** -- the main content of this page. Only **one** per page.
              - **\`<footer>\`** -- the bottom: copyright, contact details, small links.

              These are called **semantic** elements: their names say what they *mean*.

              >! \`<header>\` is not \`<head>\`. The \`<head>\` holds the title and meta tags and is never seen. A \`<header>\` sits in the \`<body>\` and is the visible top of the page.
            `,
          },
          {
            type: 'exhibit',
            title: 'A semantic page',
            body: `A small plumber's page. It looks like a plain page, because semantic elements don't change the look. They change what the page *means*.`,
            html: `
              <header>
                <p><strong>Dave's Plumbing</strong></p>
                <nav>
                  <ul>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                  </ul>
                </nav>
              </header>
              <main>
                <h1>Emergency plumber in Bristol</h1>
                <section id="services">
                  <h2>Services</h2>
                  <p>Boilers, leaks and bathrooms.</p>
                </section>
                <section id="contact">
                  <h2>Contact</h2>
                  <p><a href="tel:+441174960123">0117 496 0123</a></p>
                </section>
              </main>
              <footer>
                <p>&copy; 2025 Dave's Plumbing</p>
              </footer>
            `,
          },
          {
            type: 'quiz',
            q: 'Where do the copyright line and the small "Privacy policy" link at the bottom of every page go?',
            options: ['`<footer>`', '`<header>`', '`<head>`', '`<aside>`'],
            answer: 0,
            explain: 'The bottom strip of a page is the `<footer>`. `<head>` is never seen on the page at all.',
          },
          {
            type: 'brief',
            title: 'Why bother?',
            body: `
              The page looks the same with \`<div>\`s. So why use these?

              - **Screen readers** list them as *landmarks*. A blind visitor can jump straight to the \`<main>\` content or the \`<nav>\`, instead of listening to the whole header on every page.
              - **Google** can tell your real content from the menu and footer that repeat on every page.
              - **You**, in six months' time. \`</main>\` is far easier to find than the 14th \`</div>\` in a row.

              When you check AI-written code, look for these. If it's all \`<div class="header">\` and \`<div class="footer">\`, ask it to use semantic elements.
            `,
          },
          {
            type: 'fill',
            q: 'Fill in the four main parts of the page.',
            code: `
              <[[header]]>
                <[[nav]]>…</nav>
              </header>
              <[[main]]>
                <h1>Fresh bread every morning</h1>
              </main>
              <[[footer]]>&copy; 2025 Rosie's Bakery</footer>
            `,
            options: ['header', 'nav', 'main', 'footer', 'head', 'div', 'section'],
          },
          {
            type: 'task',
            title: 'Out of the div soup',
            body: `
              This page was built with \`<div>\`s. Replace each \`<div>\` with the right semantic element:

              - \`div class="header"\` → \`<header>\`
              - \`div class="menu"\` → \`<nav>\`
              - \`div class="content"\` → \`<main>\`
              - \`div class="bottom"\` → \`<footer>\`

              Change the closing tags too. You can keep or remove the classes.
            `,
            html: `
              <div class="header">
                <p><strong>Rosie's Bakery</strong></p>
                <div class="menu">
                  <ul>
                    <li><a href="#bread">Bread</a></li>
                    <li><a href="#cakes">Cakes</a></li>
                  </ul>
                </div>
              </div>
              <div class="content">
                <h1>Fresh bread every morning</h1>
                <p>Baked in Bristol since 1987.</p>
              </div>
              <div class="bottom">
                <p>&copy; 2025 Rosie's Bakery</p>
              </div>
            `,
            checks: [
              { text: 'A `<header>` with a `<nav>` inside it', test: (c) => !!c.$('header nav ul') || (c.$('header') ? 'Change the menu <div> inside the header into a <nav>.' : false) },
              { text: 'A `<main>` with the `<h1>`', test: (c) => !!c.$('main h1') },
              { text: 'A `<footer>` with the copyright line', test: (c) => /©/.test(c.text('footer')) },
              {
                text: 'The three parts sit one after another, not inside each other',
                test: (c) => {
                  const h = c.$('header');
                  const m = c.$('main');
                  const f = c.$('footer');
                  if (!h || !m || !f) return false;
                  if (h.contains(m) || m.contains(f) || h.contains(f)) return 'Check your closing tags: one part has ended up inside another.';
                  return !!(h.compareDocumentPosition(m) & 4 && m.compareDocumentPosition(f) & 4);
                },
              },
              { text: 'No `<div>`s left', test: (c) => { const n = c.$$('div').length; return n === 0 || 'There ' + (n === 1 ? 'is still 1 <div>' : 'are still ' + n + ' <div>s') + ' on the page.'; } },
            ],
            hint: 'Change both ends of each box. For example, `<div class="menu">` … `</div>` becomes `<nav>` … `</nav>`. Work from the inside out so you can match up the closing tags.',
            solution: {
              html: `
                <header>
                  <p><strong>Rosie's Bakery</strong></p>
                  <nav>
                    <ul>
                      <li><a href="#bread">Bread</a></li>
                      <li><a href="#cakes">Cakes</a></li>
                    </ul>
                  </nav>
                </header>
                <main>
                  <h1>Fresh bread every morning</h1>
                  <p>Baked in Bristol since 1987.</p>
                </main>
                <footer>
                  <p>&copy; 2025 Rosie's Bakery</p>
                </footer>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Inside main: section, article, aside',
            body: `
              \`\`\`html
              <main>
                <section>
                  <h2>Reviews</h2>
                  <article><p>"Best sourdough in town."</p></article>
                  <article><p>"The cinnamon buns!"</p></article>
                </section>
                <aside>
                  <h2>Opening hours</h2>
                  <p>Every day, 7am to 3pm.</p>
                </aside>
              </main>
              \`\`\`

              - **\`<section>\`** -- a themed part of the page, with its own heading: Services, Prices, Reviews.
              - **\`<article>\`** -- something that makes sense **on its own**, even if you lifted it off the page: a blog post, a review, a product card.
              - **\`<aside>\`** -- related, but not the main point: a box with opening hours, "related posts", a special offer.

              Not sure? Use \`<section>\` if it has a heading, and \`<div>\` if it's just a box for styling.
            `,
          },
          {
            type: 'quiz',
            q: 'A bakery site has a blog. Which element should wrap each blog post?',
            options: ['`<article>`', '`<section>`', '`<aside>`', '`<main>`'],
            answer: 0,
            explain: 'A blog post stands on its own: you could share it, or show it on another page, and it would still make sense. That\'s an `<article>`.',
          },
          {
            type: 'task',
            title: 'Fill the main area',
            body: `
              Replace the comments inside \`<main>\`:

              1. A \`<section>\` with an \`<h2>\` **Our bread** and a paragraph.
              2. A \`<section>\` with an \`<h2>\` **Reviews**, containing **two** \`<article>\`s, each with a short review in a paragraph.
              3. An \`<aside>\` with an \`<h2>\` **Opening hours** and a paragraph.
            `,
            html: `
              <main>
                <h1>Rosie's Bakery</h1>
                <!-- 1. Section: Our bread -->

                <!-- 2. Section: Reviews, with two articles -->

                <!-- 3. Aside: Opening hours -->
              </main>
            `,
            checks: [
              {
                text: 'Two `<section>`s, each with an `<h2>`',
                test: (c) => {
                  const s = c.$$('main section');
                  if (s.length < 2) return s.length ? 'You have one section. Add the Reviews section.' : false;
                  return s.every((x) => x.querySelector('h2')) || 'Every section needs an <h2> heading.';
                },
              },
              {
                text: 'The *Reviews* section has two `<article>`s',
                test: (c) => {
                  const s = c.$$('section').find((x) => /reviews/i.test(c.text(x.querySelector('h2') || x)));
                  if (!s) return false;
                  const n = s.querySelectorAll('article').length;
                  return n >= 2 || (c.$$('article').length >= 2 ? 'Put the articles inside the Reviews section.' : 'The Reviews section has ' + n + ' article(s).');
                },
              },
              { text: 'Each review has some text', test: (c) => c.$$('article').length >= 2 && c.$$('article').every((a) => a.textContent.trim().length > 0) },
              { text: 'An `<aside>` with the opening hours', test: (c) => !!c.$('main aside h2') && /opening hours/i.test(c.text('aside h2')) && !!c.$('aside p') },
            ],
            hint: 'Each part is a box with a heading inside:\n\n```html\n<section>\n  <h2>Reviews</h2>\n  <article><p>…</p></article>\n  <article><p>…</p></article>\n</section>\n```',
            solution: {
              html: `
                <main>
                  <h1>Rosie's Bakery</h1>
                  <section>
                    <h2>Our bread</h2>
                    <p>Sourdough, rye and seeded loaves, baked before dawn.</p>
                  </section>

                  <section>
                    <h2>Reviews</h2>
                    <article><p>"Best sourdough in Bristol." -- Sam</p></article>
                    <article><p>"The cinnamon buns are dangerous." -- Priya</p></article>
                  </section>

                  <aside>
                    <h2>Opening hours</h2>
                    <p>Every day, 7am to 3pm.</p>
                  </aside>
                </main>
              `,
            },
          },
          {
            type: 'quiz',
            q: 'Which of these should appear only **once** on a page?',
            options: ['`<main>`', '`<section>`', '`<article>`', '`<header>`'],
            answer: 0,
            explain: 'There is one main content area per page. Sections and articles repeat freely, and even `<header>` can appear inside an article (a blog post can have its own header).',
          },
          {
            type: 'debrief',
            points: [
              'Page parts: `<header>` (top, usually with `<nav>`), `<main>` (once per page), `<footer>` (bottom).',
              'Inside main: `<section>` for a themed part with a heading, `<article>` for something that stands alone, `<aside>` for related side content.',
              '`<header>` is the visible top of the page; `<head>` is the invisible information at the top of the file.',
              'Semantic elements help screen readers jump around, help Google find your real content, and make code easier to read.',
              'Use `<div>` only when no semantic element fits.',
            ],
          },
        ],
      },

      /* ── 11 ────────────────────────────────────────────────────────── */
      {
        id: 'html-forms-basics',
        title: 'Forms I: the basics',
        minutes: 10,
        steps: [
          {
            type: 'brief',
            title: 'A form',
            body: `
              Contact forms, bookings, newsletter sign-ups: they're all \`<form>\` elements.

              \`\`\`html
              <form>
                <input type="email" name="email">
                <button type="submit">Sign up</button>
              </form>
              \`\`\`

              - **\`<form>\`** wraps the fields. On a real site, its \`action\` attribute says where to send the answers: your own server, or a form service such as Formspree or Netlify Forms.
              - **\`<input>\`** is a single-line box. It has no closing tag.
              - **\`<button type="submit">\`** sends the form.
            `,
          },
          {
            type: 'exhibit',
            title: 'Sign up',
            body: `Type an address without an \`@\` and press **Sign up**: the browser stops you, because of \`type="email"\`. Then try a real-looking address. The preview blocks the actual sending and shows a note instead.`,
            html: `
              <form>
                <p>Get our weekly specials by email.</p>
                <input type="email" name="email">
                <button type="submit">Sign up</button>
              </form>
            `,
          },
          {
            type: 'quiz',
            q: 'What does `type="submit"` on a `<button>` inside a form do?',
            options: ['It sends the form when clicked', 'It clears all the fields', 'It checks the spelling of the answers', 'Nothing: it only changes how the button looks'],
            answer: 0,
            explain: 'A submit button sends the form. Always write the `type`: a plain `<button>` inside a form submits too, which surprises people when it\'s meant to do something else.',
          },
          {
            type: 'brief',
            title: 'Every field needs a label',
            body: `
              \`\`\`html
              <label for="email">Your email</label>
              <input type="email" id="email" name="email">
              \`\`\`

              The label's \`for\` matches the input's \`id\`. That link does two things:

              - **Clicking the label** puts the cursor in the box. A much bigger target on a phone.
              - **Screen readers** read the label out when the box is selected. Without one, a blind visitor hears just "edit text".

              >! A \`placeholder\` is **not** a label. It's the grey hint text inside the box, and it disappears as soon as you type. Use it for an example, like \`placeholder="you@example.co.uk"\`, and use a label as well.
            `,
          },
          {
            type: 'fill',
            q: 'Link the label to the field.',
            code: `
              <label [[for]]="phone">Phone</label>
              <input type="tel" [[id]]="phone" name="phone">
            `,
            options: ['for', 'id', 'name', 'class', 'label'],
          },
          {
            type: 'task',
            title: 'A newsletter sign-up',
            body: `
              Inside the form:

              1. A \`<label>\` that says **Your email**.
              2. An email \`<input>\` with \`id="email"\` and \`name="email"\`, linked to the label.
              3. A submit \`<button>\` that says **Sign up**.

              Press the button in the result to try it.
            `,
            html: `
              <form>
                <!-- label, email input, submit button -->
              </form>
            `,
            checks: [
              {
                text: 'An email input',
                test: (c) => !!c.$('form input[type="email"]') || (c.$('form input') ? 'Set type="email" on the input.' : false),
              },
              {
                text: 'The input has a label that says *Your email*',
                test: (c) => {
                  const i = c.$('input');
                  if (!i) return false;
                  if (!i.labels || !i.labels.length) return c.$('label') ? 'The label\'s for must match the input\'s id exactly.' : 'Add a <label>.';
                  return /email/i.test(i.labels[0].textContent) || 'The label should say Your email.';
                },
              },
              { text: 'The input has `name="email"`', test: (c) => !!c.$('input') && c.$('input').getAttribute('name') === 'email' },
              {
                text: 'A submit button that says *Sign up*',
                test: (c) => {
                  const b = c.$('form button');
                  if (!b) return false;
                  if (b.getAttribute('type') !== 'submit') return 'Add type="submit" to the button.';
                  return /sign up/i.test(b.textContent) || 'The button should say Sign up.';
                },
              },
            ],
            hint: 'Three lines:\n\n```html\n<label for="email">Your email</label>\n<input type="email" id="email" name="email">\n<button type="submit">…</button>\n```',
            solution: {
              html: `
                <form>
                  <label for="email">Your email</label>
                  <input type="email" id="email" name="email">
                  <button type="submit">Sign up</button>
                </form>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Input types and names',
            body: `
              The \`type\` changes how the box behaves, and which keyboard a phone shows:

              | \`type\` | For | On a phone |
              |---|---|---|
              | \`text\` | Names, anything short | Normal keyboard |
              | \`email\` | Email addresses | Keyboard with @. Checks the format |
              | \`tel\` | Phone numbers | Number pad |
              | \`number\` | Quantities, guests | Numbers, with up/down arrows |
              | \`password\` | Passwords | Hides what you type |

              The **\`name\`** is what each answer is called when the form is sent, like \`email=sam@example.co.uk\`. Whoever receives the form sees those names.

              >! A field without a \`name\` is **not sent at all**. It's the most common reason for "the form works but the email arrives empty".
            `,
          },
          {
            type: 'exhibit',
            title: 'Five types',
            body: `Click into each box. On a phone you'd get a different keyboard for each. Try typing letters into the number box.`,
            html: `
              <form>
                <p><label for="n">Name</label> <input type="text" id="n" name="name"></p>
                <p><label for="e">Email</label> <input type="email" id="e" name="email" placeholder="you@example.co.uk"></p>
                <p><label for="t">Phone</label> <input type="tel" id="t" name="phone"></p>
                <p><label for="g">Guests</label> <input type="number" id="g" name="guests"></p>
                <p><label for="p">Password</label> <input type="password" id="p" name="password"></p>
                <button type="submit">Send</button>
              </form>
            `,
          },
          {
            type: 'quiz',
            q: 'A customer fills in this form and presses Send. Which answer **won\'t** reach you?',
            options: [
              '`<input type="tel" id="phone">`',
              '`<input type="text" id="name" name="name">`',
              '`<input type="email" id="email" name="email">`',
              '`<input type="number" id="guests" name="guests">`',
            ],
            answer: 0,
            explain: 'The phone field has an `id` but no `name`. The `id` links it to a label; only the `name` gets it sent.',
          },
          {
            type: 'task',
            title: 'A booking form',
            body: `
              Build a table booking form with four fields. Each one needs a \`<label>\`, the right \`type\` and a \`name\`:

              1. **Name** -- text
              2. **Email** -- email
              3. **Phone** -- tel, with the placeholder **07700 900123**
              4. **Guests** -- number

              Finish with a submit button that says **Book**. Wrapping each label and input in a \`<p>\` keeps them on separate lines.
            `,
            html: `
              <h2>Book a table</h2>
              <form>
                <!-- Name, Email, Phone, Guests, then the button -->
              </form>
            `,
            checks: [
              {
                text: 'Four fields: text, email, tel and number',
                test: (c) => {
                  const types = c.$$('form input').map((i) => i.type);
                  const missing = ['text', 'email', 'tel', 'number'].filter((t) => !types.includes(t));
                  return !missing.length || (types.length ? 'Missing a field of type: ' + missing.join(', ') : false);
                },
              },
              {
                text: 'Every field has a label',
                test: (c) => {
                  const ins = c.$$('form input');
                  if (ins.length < 4) return false;
                  const bad = ins.find((i) => !i.labels || !i.labels.length);
                  return !bad || 'The ' + bad.type + ' field has no label linked to it. Check that for and id match.';
                },
              },
              {
                text: 'Every field has a `name`',
                test: (c) => {
                  const ins = c.$$('form input');
                  if (ins.length < 4) return false;
                  const bad = ins.find((i) => !i.name);
                  return !bad || 'The ' + bad.type + ' field has no name, so it would not be sent.';
                },
              },
              { text: 'The phone field has a placeholder', test: (c) => !!c.$('input[type="tel"]') && /07700/.test(c.$('input[type="tel"]').placeholder) },
              { text: 'A submit button that says *Book*', test: (c) => { const b = c.$('form button'); return !!b && b.getAttribute('type') === 'submit' && /book/i.test(b.textContent); } },
            ],
            hint: 'Repeat this pattern four times, changing the words, the `type`, the `id`/`for` and the `name`:\n\n```html\n<p>\n  <label for="name">Name</label>\n  <input type="text" id="name" name="name">\n</p>\n```',
            solution: {
              html: `
                <h2>Book a table</h2>
                <form>
                  <p>
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name">
                  </p>
                  <p>
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email">
                  </p>
                  <p>
                    <label for="phone">Phone</label>
                    <input type="tel" id="phone" name="phone" placeholder="07700 900123">
                  </p>
                  <p>
                    <label for="guests">Guests</label>
                    <input type="number" id="guests" name="guests">
                  </p>
                  <button type="submit">Book</button>
                </form>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              '`<form>` wraps the fields; `<input>` is a one-line box (no closing tag); `<button type="submit">` sends it.',
              'Every field needs a `<label>`. Link them with matching `for` and `id`.',
              'A `placeholder` is an example, not a label: it disappears when you type.',
              'Pick the right `type` (`text`, `email`, `tel`, `number`, `password`) for the right phone keyboard and basic checks.',
              'Every field needs a `name`, or its answer is never sent.',
            ],
          },
        ],
      },

      /* ── 12 ────────────────────────────────────────────────────────── */
      {
        id: 'html-forms-more',
        title: 'Forms II: choices and rules',
        minutes: 11,
        steps: [
          {
            type: 'brief',
            title: 'Big boxes and dropdowns',
            body: `
              \`\`\`html
              <label for="message">Describe the problem</label>
              <textarea id="message" name="message" rows="4"></textarea>

              <label for="service">Service</label>
              <select id="service" name="service">
                <option value="boiler">Boiler repair</option>
                <option value="leak">Leak</option>
              </select>
              \`\`\`

              - **\`<textarea>\`** -- a box for several lines of text. Unlike \`<input>\`, it **has** a closing tag. \`rows\` sets how many lines tall it is. Anything between the tags is pre-filled, so leave nothing in there, not even a space.
              - **\`<select>\`** -- a dropdown. Each choice is an **\`<option>\`**. The \`value\` is what gets sent; the text is what the visitor sees.
            `,
          },
          {
            type: 'exhibit',
            title: 'Try them',
            body: `Drag the corner of the message box to resize it. Open the dropdown.`,
            html: `
              <form>
                <p>
                  <label for="service">Service</label>
                  <select id="service" name="service">
                    <option value="boiler">Boiler repair</option>
                    <option value="leak">Leak</option>
                    <option value="bathroom">Bathroom fitting</option>
                  </select>
                </p>
                <p>
                  <label for="message">Describe the problem</label><br>
                  <textarea id="message" name="message" rows="4"></textarea>
                </p>
                <button type="submit">Get a quote</button>
              </form>
            `,
          },
          {
            type: 'quiz',
            q: 'Which one makes a box for a **multi-line** message?',
            options: ['`<textarea name="message"></textarea>`', '`<input type="textarea" name="message">`', '`<input type="text" rows="5" name="message">`', '`<text name="message"></text>`'],
            answer: 0,
            explain: '`<textarea>` is its own element, with a closing tag. There is no `type="textarea"`: the browser would quietly give you a single-line text box.',
          },
          {
            type: 'task',
            title: 'A quote request',
            body: `
              Add two fields to the plumber's form, each with a label and a \`name\`:

              1. A **Service** dropdown (\`name="service"\`) with three options: **Boiler repair**, **Leak**, **Bathroom fitting**. Give each option a \`value\`.
              2. A **Describe the problem** box (\`name="message"\`), 4 rows tall.
            `,
            html: `
              <h2>Get a quote</h2>
              <form>
                <p>
                  <label for="name">Name</label>
                  <input type="text" id="name" name="name">
                </p>

                <!-- 1. Service dropdown -->

                <!-- 2. Describe the problem -->

                <button type="submit">Get my quote</button>
              </form>
            `,
            checks: [
              {
                text: 'A `<select>` named `service`, with a label',
                test: (c) => {
                  const s = c.$('select');
                  if (!s) return false;
                  if (s.name !== 'service') return 'Give the select name="service".';
                  return s.labels.length > 0 || 'Link a label to the select with for and id.';
                },
              },
              {
                text: 'Three options, each with a `value`',
                test: (c) => {
                  const o = c.$$('select option');
                  if (o.length < 3) return o.length ? 'There are ' + o.length + ' options. You need 3.' : false;
                  return o.every((x) => (x.getAttribute('value') || '').trim()) || 'Give every <option> a value attribute.';
                },
              },
              {
                text: 'A `<textarea>` named `message`, with a label',
                test: (c) => {
                  const t = c.$('textarea');
                  if (!t) return c.$('input[type="textarea"]') ? 'There is no input type="textarea". Use a <textarea></textarea> element.' : false;
                  if (t.name !== 'message') return 'Give the textarea name="message".';
                  return t.labels.length > 0 || 'Link a label to the textarea with for and id.';
                },
              },
              {
                text: 'The textarea is 4 rows tall and starts empty',
                test: (c) => {
                  const t = c.$('textarea');
                  if (!t) return false;
                  if (t.value.length) return 'There is text (maybe just spaces) between <textarea> and </textarea>. Remove it.';
                  return t.getAttribute('rows') === '4' || 'Add rows="4".';
                },
              },
            ],
            hint: 'Follow the pattern from the briefing: a `<label for="…">`, then the `<select id="…" name="service">` with its `<option value="…">` items. The textarea is `<textarea id="…" name="message" rows="4"></textarea>`, with the closing tag straight after the opening one.',
            solution: {
              html: `
                <h2>Get a quote</h2>
                <form>
                  <p>
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name">
                  </p>

                  <p>
                    <label for="service">Service</label>
                    <select id="service" name="service">
                      <option value="boiler">Boiler repair</option>
                      <option value="leak">Leak</option>
                      <option value="bathroom">Bathroom fitting</option>
                    </select>
                  </p>

                  <p>
                    <label for="message">Describe the problem</label>
                    <textarea id="message" name="message" rows="4"></textarea>
                  </p>

                  <button type="submit">Get my quote</button>
                </form>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Radio buttons and checkboxes',
            body: `
              \`\`\`html
              <input type="radio" id="small" name="size" value="small">
              <label for="small">Small (£12)</label>
              <input type="radio" id="large" name="size" value="large">
              <label for="large">Large (£18)</label>

              <input type="checkbox" id="gift" name="gift" value="yes">
              <label for="gift">Gift wrap (+£2)</label>
              \`\`\`

              - **Radio buttons** -- pick **one** from a group. Radios with the **same \`name\`** form one group: choosing one unticks the others. The \`value\` says which was picked.
              - **Checkbox** -- a yes/no tick that works on its own.
              - Add \`checked\` (an on/off attribute, no value) to tick one in advance.

              For these two, the label usually goes *after* the box.
            `,
          },
          {
            type: 'exhibit',
            title: 'Click around',
            body: `Pick a size, then pick the other one. Now change the second radio's \`name\` to something else and try again: you can suddenly pick both.`,
            html: `
              <form>
                <p>Size</p>
                <input type="radio" id="small" name="size" value="small" checked>
                <label for="small">Small (£12)</label>
                <input type="radio" id="large" name="size" value="large">
                <label for="large">Large (£18)</label>
                <p>
                  <input type="checkbox" id="gift" name="gift" value="yes">
                  <label for="gift">Gift wrap (+£2)</label>
                </p>
              </form>
            `,
          },
          {
            type: 'fill',
            q: 'Make these two choices one group, so only one can be picked.',
            code: `
              <input type="[[radio]]" id="collect" name="[[delivery]]" value="collect">
              <label for="collect">Collect from the shop</label>
              <input type="radio" id="post" name="delivery" value="post">
              <label for="post">Send by post</label>
            `,
            options: ['radio', 'checkbox', 'delivery', 'post', 'collect'],
            explain: 'Both radios need the same `name` (`delivery`) to form one group. Their `value`s differ, so you know which was picked.',
          },
          {
            type: 'task',
            title: 'Order a candle',
            body: `
              1. Two radio buttons for the size: **Small** (value \`small\`) and **Large** (value \`large\`), in one group named **size**.
              2. A checkbox for **Gift wrap**, named **gift**.

              Give every box its own \`id\` and a label.
            `,
            html: `
              <h2>Order a candle</h2>
              <form>
                <p>Size</p>
                <!-- Two radio buttons -->

                <!-- The gift wrap checkbox -->

                <button type="submit">Add to basket</button>
              </form>
            `,
            checks: [
              {
                text: 'Two radio buttons, both named `size`',
                test: (c) => {
                  const r = c.$$('input[type="radio"]');
                  if (r.length < 2) return false;
                  return r.every((x) => x.name === 'size') || 'Give both radio buttons name="size", so they form one group.';
                },
              },
              {
                text: 'The radios have the values `small` and `large`',
                test: (c) => {
                  const v = c.$$('input[type="radio"]').map((x) => x.getAttribute('value'));
                  return (v.includes('small') && v.includes('large')) || (v.length ? 'Give each radio a value so the shop knows which was picked.' : false);
                },
              },
              {
                text: 'Only one size can be picked at a time',
                test: (c) => {
                  const r = c.$$('input[type="radio"]');
                  if (r.length < 2) return false;
                  c.click(r[0]);
                  c.click(r[1]);
                  return !r[0].checked && r[1].checked;
                },
              },
              { text: 'A checkbox named `gift`', test: (c) => !!c.$('input[type="checkbox"]') && c.$('input[type="checkbox"]').name === 'gift' },
              {
                text: 'Every box has a label',
                test: (c) => {
                  const ins = c.$$('input');
                  if (ins.length < 3) return false;
                  return ins.every((i) => i.labels && i.labels.length) || 'One of the boxes has no label linked to it.';
                },
              },
            ],
            hint: 'Each choice is a pair: the box, then its label.\n\n```html\n<input type="radio" id="small" name="size" value="small">\n<label for="small">Small</label>\n```\n\nThe second radio has the same `name` but a different `id` and `value`.',
            solution: {
              html: `
                <h2>Order a candle</h2>
                <form>
                  <p>Size</p>
                  <input type="radio" id="small" name="size" value="small">
                  <label for="small">Small</label>
                  <input type="radio" id="large" name="size" value="large">
                  <label for="large">Large</label>

                  <p>
                    <input type="checkbox" id="gift" name="gift" value="yes">
                    <label for="gift">Gift wrap</label>
                  </p>

                  <button type="submit">Add to basket</button>
                </form>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Rules the browser checks',
            body: `
              You can tell the browser what a valid answer looks like:

              \`\`\`html
              <input type="text" name="name" required>
              <input type="number" name="guests" min="1" max="8">
              <input type="text" name="postcode" minlength="5" maxlength="8">
              \`\`\`

              - **\`required\`** -- can't be left empty.
              - **\`min\` / \`max\`** -- the lowest and highest *number* allowed.
              - **\`minlength\` / \`maxlength\`** -- the shortest and longest *text* allowed.
              - \`type="email"\` already checks for an \`@\`.

              If a rule is broken, the browser shows a message and won't send the form.

              > This is a convenience for honest visitors, not security. Anyone can get around it, so whatever receives the form must check the answers again.
            `,
          },
          {
            type: 'quiz',
            q: 'A café takes bookings for 1 to 8 people. How do you stop someone booking for 0 or 20?',
            options: ['`min="1" max="8"`', '`minlength="1" maxlength="8"`', '`required`', '`placeholder="1 to 8"`'],
            answer: 0,
            explain: '`min` and `max` limit numbers. `minlength`/`maxlength` limit how many *characters* are typed, so "20" would pass. A placeholder is only a hint.',
          },
          {
            type: 'brief',
            title: 'Grouping with fieldset',
            body: `
              \`\`\`html
              <fieldset>
                <legend>Where would you like to sit?</legend>
                <input type="radio" id="inside" name="area" value="inside">
                <label for="inside">Inside</label>
                <input type="radio" id="outside" name="area" value="outside">
                <label for="outside">Outside</label>
              </fieldset>
              \`\`\`

              - **\`<fieldset>\`** groups related fields and draws a box round them.
              - **\`<legend>\`** is the group's caption. It must come first inside the fieldset.

              A screen reader reads the legend with each choice: "Where would you like to sit? Inside, radio button". Use it for every radio group, and for blocks like "Delivery address".
            `,
          },
          {
            type: 'task',
            title: 'Booking rules',
            body: `
              Make the café's booking form safer:

              1. The **name** must be filled in.
              2. **Guests** must be filled in, and between **1** and **8**.
              3. Wrap the seating question and its radios in a \`<fieldset>\`, and turn the question paragraph into its \`<legend>\`.

              Try sending the form empty in the result.
            `,
            html: `
              <h2>Book a table</h2>
              <form>
                <p>
                  <label for="name">Name</label>
                  <input type="text" id="name" name="name">
                </p>
                <p>
                  <label for="guests">Guests</label>
                  <input type="number" id="guests" name="guests">
                </p>

                <p>Where would you like to sit?</p>
                <input type="radio" id="inside" name="area" value="inside">
                <label for="inside">Inside</label>
                <input type="radio" id="outside" name="area" value="outside">
                <label for="outside">Outside</label>

                <p><button type="submit">Book</button></p>
              </form>
            `,
            checks: [
              { text: 'The name is required', test: (c) => !!c.$('[name="name"]') && c.$('[name="name"]').required },
              { text: 'Guests is required', test: (c) => !!c.$('[name="guests"]') && c.$('[name="guests"]').required },
              {
                text: 'Guests must be between 1 and 8',
                test: (c) => {
                  const g = c.$('[name="guests"]');
                  if (!g) return false;
                  c.type(g, '12');
                  if (!g.validity.rangeOverflow) return 'A booking for 12 guests is still allowed. Add max="8".';
                  c.type(g, '0');
                  if (!g.validity.rangeUnderflow) return 'A booking for 0 guests is still allowed. Add min="1".';
                  return true;
                },
              },
              {
                text: 'The seating radios are in a `<fieldset>` with a `<legend>`',
                test: (c) => {
                  const f = c.$('fieldset');
                  if (!f) return false;
                  if (f.querySelectorAll('input[type="radio"]').length < 2) return 'Put both radio buttons inside the fieldset.';
                  const l = f.querySelector('legend');
                  if (!l) return 'Turn the question into a <legend>.';
                  return (f.firstElementChild === l && /sit/i.test(l.textContent)) || 'The legend should hold the question and come first in the fieldset.';
                },
              },
              {
                text: 'A correctly filled-in form can be sent',
                test: (c) => {
                  const f = c.$('form');
                  if (!c.$('[name="name"]') || !c.$('[name="guests"]')) return false;
                  c.type('[name="name"]', 'Sam Patel');
                  c.type('[name="guests"]', '4');
                  const r = c.$('input[type="radio"]');
                  if (r) r.checked = true;
                  return f.checkValidity() || 'A booking for Sam, 4 guests, still fails one of your rules.';
                },
              },
            ],
            hint: 'Add `required` inside the two `<input>` tags, and `min="1" max="8"` on guests. Then replace `<p>Where would you like to sit?</p>` with:\n\n```html\n<fieldset>\n  <legend>Where would you like to sit?</legend>\n  …the radios and labels…\n</fieldset>\n```',
            solution: {
              html: `
                <h2>Book a table</h2>
                <form>
                  <p>
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                  </p>
                  <p>
                    <label for="guests">Guests</label>
                    <input type="number" id="guests" name="guests" min="1" max="8" required>
                  </p>

                  <fieldset>
                    <legend>Where would you like to sit?</legend>
                    <input type="radio" id="inside" name="area" value="inside">
                    <label for="inside">Inside</label>
                    <input type="radio" id="outside" name="area" value="outside">
                    <label for="outside">Outside</label>
                  </fieldset>

                  <p><button type="submit">Book</button></p>
                </form>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              '`<textarea>` is a multi-line box with a closing tag (keep it empty inside). `<select>` + `<option value="…">` makes a dropdown.',
              'Radios with the same `name` form a group: only one can be picked. Checkboxes are independent ticks.',
              '`required`, `min`/`max` (numbers) and `minlength`/`maxlength` (text) make the browser check answers before sending.',
              'Browser checks are a convenience, not security. Whatever receives the form must check again.',
              '`<fieldset>` groups related fields; its `<legend>` comes first and names the group.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Going live',
    missions: [
      /* ── 13 ────────────────────────────────────────────────────────── */
      {
        id: 'html-head-seo',
        title: 'The head and SEO',
        minutes: 10,
        steps: [
          {
            type: 'brief',
            title: 'The title does the selling',
            body: `
              The \`<head>\` is where you talk to machines: Google, browsers, and apps like WhatsApp. The most important line is the \`<title>\`. It's the **blue link** in Google results and the name in the browser tab.

              A good title:

              - Says **what** you do and **where**, then the business name: \`Emergency Plumber in Bristol | Dave's Plumbing\`
              - Is **under about 60 characters**, or Google cuts it off with "…"
              - Is **different on every page**: \`Boiler Repairs in Bristol | Dave's Plumbing\` on the boilers page

              People search for "plumber Bristol", not "Dave's Plumbing". Put the words they'd type near the start.
            `,
          },
          {
            type: 'quiz',
            q: 'Which is the best `<title>` for a plumber\'s home page?',
            options: [
              '`Emergency Plumber in Bristol | Dave\'s Plumbing`',
              '`Home`',
              '`Welcome to our website`',
              '`Plumber Bristol plumber cheap plumber best plumber Bristol`',
            ],
            answer: 0,
            explain: 'It says what, where and who, in under 60 characters. "Home" tells Google and searchers nothing, and keyword stuffing looks like spam to both.',
          },
          {
            type: 'brief',
            title: 'The meta description',
            body: `
              \`\`\`html
              <meta name="description" content="24-hour emergency plumber in Bristol. Boilers, leaks and blocked drains. No call-out fee. Call 0117 496 0123.">
              \`\`\`

              Google often shows this as the grey text under your blue link. It doesn't push you up the rankings by itself, but a clear one gets **more clicks**. Treat it like a small advert:

              - About **150–160 characters** at most
              - What you offer, where, and a reason to choose you
              - One per page, written for that page

              Google sometimes picks its own sentence from the page instead. Writing a good one still gives you the best chance.
            `,
          },
          {
            type: 'exhibit',
            title: 'How a result looks',
            body: `A mock-up of a search result. The locked CSS cuts the title and description off at roughly the point a search engine would. Try a much longer title, or a description of four sentences.`,
            html: `
              <div class="result">
                <p class="url">www.davesplumbing.co.uk</p>
                <p class="title">Emergency Plumber in Bristol | Dave's Plumbing</p>
                <p class="desc">24-hour emergency plumber in Bristol. Boilers, leaks and blocked drains. No call-out fee. Call 0117 496 0123.</p>
              </div>
            `,
            css: `
              .result { font-family: Arial, sans-serif; max-width: 560px; }
              .result p { margin: 2px 0; }
              .url { color: #202124; font-size: 14px; }
              .title { color: #1a0dab; font-size: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
              .desc { color: #4d5156; font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `,
            edit: ['html'],
            active: 'html',
          },
          {
            type: 'task',
            title: 'Fix the barber\'s head',
            body: `
              1. Replace the title **Home** with a proper one. Include **Barber**, **Bristol** and **Sharp Cuts**, in under 60 characters.
              2. Add a meta description, between 50 and 160 characters long.
            `,
            html: `
              <!doctype html>
              <html lang="en-GB">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Home</title>
                </head>
                <body>
                  <h1>Sharp Cuts Barbers</h1>
                  <p>Skin fades, beard trims and hot towel shaves on Gloucester Road, Bristol.</p>
                </body>
              </html>
            `,
            checks: [
              { text: 'The title mentions *Sharp Cuts*', test: (c) => /sharp cuts/i.test(c.doc.title) },
              {
                text: 'The title says what and where: *Barber* and *Bristol*',
                test: (c) => (/barber/i.test(c.doc.title) && /bristol/i.test(c.doc.title)) || (c.doc.title.trim() !== 'Home' ? 'Your title is "' + c.doc.title + '".' : false),
              },
              {
                text: 'The title is under 60 characters',
                test: (c) => {
                  const n = c.doc.title.trim().length;
                  return (n > 0 && n <= 60) || (n > 60 ? 'Your title is ' + n + ' characters. Google will cut it off.' : false);
                },
              },
              {
                text: 'A meta description of 50 to 160 characters',
                test: (c) => {
                  const m = c.$('meta[name="description"]');
                  if (!m) return false;
                  const n = (m.getAttribute('content') || '').trim().length;
                  if (!n) return 'Put the text in the content attribute.';
                  return (n >= 50 && n <= 160) || 'Your description is ' + n + ' characters. Aim for 50 to 160.';
                },
              },
            ],
            hint: 'Something like `<title>Barber in Bristol | Sharp Cuts</title>`. The description goes on its own line in the head:\n\n```html\n<meta name="description" content="…">\n```',
            solution: {
              html: `
                <!doctype html>
                <html lang="en-GB">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Barber in Bristol | Sharp Cuts</title>
                    <meta name="description" content="Walk-in barber on Gloucester Road, Bristol. Skin fades, beard trims and hot towel shaves, six days a week.">
                  </head>
                  <body>
                    <h1>Sharp Cuts Barbers</h1>
                    <p>Skin fades, beard trims and hot towel shaves on Gloucester Road, Bristol.</p>
                  </body>
                </html>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Link previews: Open Graph',
            body: `
              When someone shares your link on WhatsApp, Facebook, LinkedIn or iMessage, the app builds a little preview card. **Open Graph** tags tell it what to show:

              \`\`\`html
              <meta property="og:title" content="Sharp Cuts Barbers, Bristol">
              <meta property="og:description" content="Walk-in barber on Gloucester Road. Skin fades from £20.">
              <meta property="og:image" content="https://www.sharpcuts.co.uk/images/share.jpg">
              <meta property="og:url" content="https://www.sharpcuts.co.uk/">
              \`\`\`

              - They use **\`property\`**, not \`name\`.
              - \`og:image\` must be a **full address** starting \`https://\`. The app fetches it from outside your site, so a relative path won't work. An image of 1200 × 630 pixels suits every app.
              - Without these tags, the app guesses: often a random image from the page, or none at all.

              For a business, this is free advertising every time a customer shares your link.
            `,
          },
          {
            type: 'fill',
            q: 'Complete the description and the share image.',
            code: `
              <meta [[name]]="description" content="Hand-poured soy candles from York.">
              <meta [[property]]="og:image" [[content]]="https://www.wickandwax.co.uk/images/share.jpg">
            `,
            options: ['name', 'property', 'content', 'value', 'src'],
            explain: 'The description uses `name`; Open Graph tags use `property`. Both put their text in `content`.',
          },
          {
            type: 'brief',
            title: 'Favicon and language',
            body: `
              \`\`\`html
              <html lang="en-GB">
                <head>
                  …
                  <link rel="icon" href="images/favicon.png">
                  <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
                </head>
              \`\`\`

              - The **favicon** is the little icon in the browser tab and bookmarks. Google also shows it next to your result on phones. \`<link>\` connects a file to the page; like \`<meta>\`, it has no closing tag.
              - \`apple-touch-icon\` is the icon used when someone adds your site to an iPhone home screen (180 × 180 pixels).
              - **\`lang\`** on \`<html>\` tells Google which searchers to show the page to, and tells screen readers which accent to read it in. \`en-GB\` for British English.
            `,
          },
          {
            type: 'quiz',
            q: 'Which line adds a favicon?',
            options: [
              '`<link rel="icon" href="images/favicon.png">` in the `<head>`',
              '`<img src="images/favicon.png">` at the top of the `<body>`',
              '`<meta name="icon" content="images/favicon.png">` in the `<head>`',
              '`<icon src="images/favicon.png">` in the `<head>`',
            ],
            answer: 0,
            explain: 'A favicon is a file connected to the page with `<link rel="icon">`. An `<img>` would show on the page itself, and there is no `<icon>` tag.',
          },
          {
            type: 'task',
            title: 'Ready to share',
            body: `
              Finish the candle shop's head:

              1. Set the page language to British English.
              2. Add three Open Graph tags: \`og:title\`, \`og:description\` (your own words for both) and \`og:image\`, pointing to \`https://www.wickandwax.co.uk/images/share.jpg\`.
              3. Add a favicon: \`images/favicon.png\`.
            `,
            html: `
              <!doctype html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Hand-poured Candles in York | Wick &amp; Wax</title>
                  <meta name="description" content="Soy candles hand-poured in our York workshop. Free UK delivery over £30.">
                  <!-- Add the new tags here -->
                </head>
                <body>
                  <h1>Wick &amp; Wax</h1>
                </body>
              </html>
            `,
            checks: [
              { text: 'The page language is British English', test: (c) => /^en(-gb)?$/i.test(c.doc.documentElement.lang) || (c.doc.documentElement.lang ? 'The lang is "' + c.doc.documentElement.lang + '". Use en-GB.' : false) },
              {
                text: '`og:title` and `og:description` tags with text',
                test: (c) => {
                  if (c.$('meta[name^="og:"]')) return 'Open Graph tags use property="og:…", not name="og:…".';
                  const t = c.$('meta[property="og:title"]');
                  const d = c.$('meta[property="og:description"]');
                  if (!t && !d) return false;
                  if (!t || !d) return 'You have one of the two. Add the other.';
                  return (t.content.trim().length > 0 && d.content.trim().length > 0) || 'Put the text in the content attribute.';
                },
              },
              {
                text: '`og:image` is the full image address',
                test: (c) => {
                  const m = c.$('meta[property="og:image"]');
                  if (!m) return false;
                  const v = m.content.trim();
                  if (!/^https:\/\//i.test(v)) return 'Use the full address starting https:// so other apps can fetch it.';
                  return /wickandwax\.co\.uk\/images\/share\.jpg$/i.test(v) || 'The og:image is "' + v + '".';
                },
              },
              {
                text: 'A favicon `<link>` to `images/favicon.png`',
                test: (c) => {
                  const l = c.$('link[rel~="icon"]');
                  if (!l) return c.$('meta[name="icon"]') || c.$('body img') ? 'A favicon is added with <link rel="icon" href="…"> in the head.' : false;
                  return /^(\.\/)?images\/favicon\.png$/.test(l.getAttribute('href') || '') || 'The favicon href is "' + l.getAttribute('href') + '".';
                },
              },
            ],
            hint: 'The language goes in the opening tag: `<html lang="en-GB">`. Each Open Graph tag looks like:\n\n```html\n<meta property="og:title" content="…">\n```\n\nThe favicon is `<link rel="icon" href="…">`.',
            solution: {
              html: `
                <!doctype html>
                <html lang="en-GB">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Hand-poured Candles in York | Wick &amp; Wax</title>
                    <meta name="description" content="Soy candles hand-poured in our York workshop. Free UK delivery over £30.">
                    <meta property="og:title" content="Wick &amp; Wax candles">
                    <meta property="og:description" content="Hand-poured soy candles from our York workshop.">
                    <meta property="og:image" content="https://www.wickandwax.co.uk/images/share.jpg">
                    <link rel="icon" href="images/favicon.png">
                  </head>
                  <body>
                    <h1>Wick &amp; Wax</h1>
                  </body>
                </html>
              `,
            },
          },
          {
            type: 'brief',
            title: 'What Google actually reads',
            body: `
              There's no magic tag that puts you first. Google reads the whole page, and everything from this dossier counts:

              - The **title** and **description** (the result itself)
              - **Headings** in a sensible order, with one \`<h1>\`
              - **Alt text** and **link text** that describe things
              - **Semantic elements**, so it can tell your content from the menu and footer
              - \`lang\`, and the **viewport** tag: Google ranks the phone version of your site

              Beyond the code, what matters most is useful content and other sites linking to you. For local businesses, a complete Google Business Profile helps a lot too.

              > You may see \`<meta name="keywords">\` in old sites and AI code. Google has ignored it for over 15 years. Don't bother.
            `,
          },
          {
            type: 'quiz',
            q: 'Which of these does Google **ignore**?',
            options: ['`<meta name="keywords" content="plumber, Bristol, boiler">`', '`<title>`', 'Alt text on images', 'The heading structure'],
            answer: 0,
            explain: 'The keywords tag was abused so badly that Google stopped reading it. Titles, alt text and headings all help Google understand the page.',
          },
          {
            type: 'debrief',
            points: [
              'Title: what + where + business name, under 60 characters, different on every page.',
              '`<meta name="description" content="…">`: a 150–160 character advert shown under your Google result.',
              'Open Graph tags (`<meta property="og:title" content="…">`, `og:description`, `og:image`) control link previews. `og:image` needs a full `https://` address.',
              'Favicon: `<link rel="icon" href="images/favicon.png">`. Language: `<html lang="en-GB">`.',
              'Google reads the whole page: headings, alt text, link text and semantic structure all count. `meta keywords` is ignored.',
            ],
          },
        ],
      },

      /* ── 14 ────────────────────────────────────────────────────────── */
      {
        id: 'html-media',
        title: 'Video, audio and embeds',
        minutes: 9,
        steps: [
          {
            type: 'brief',
            title: 'Video',
            body: `
              \`\`\`html
              <video controls width="640" poster="images/tour-poster.jpg">
                <source src="videos/tour.webm" type="video/webm">
                <source src="videos/tour.mp4" type="video/mp4">
                Sorry, your browser can't play this video.
              </video>
              \`\`\`

              - **\`controls\`** shows the play button, volume and so on. Without it, visitors can't start the video.
              - **\`poster\`** is the image shown before it plays. Otherwise you get the first frame, which is often black.
              - **\`<source>\`** lists the same video in different formats. The browser plays the first one it understands. MP4 works almost everywhere; WebM files are often smaller.
              - The **text inside** shows only in very old browsers.

              For a silent background video, use \`autoplay muted loop playsinline\` instead of \`controls\`. Browsers block autoplay *with sound*, and visitors hate it anyway.
            `,
          },
          {
            type: 'exhibit',
            title: 'A video player',
            body: `The video file doesn't exist in this preview, so it won't play, but you can see the poster (a data URI again) and the controls. Try removing \`controls\`.`,
            html: `
              <video controls width="320" height="180" poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23384a5c'/%3E%3Crect x='40' y='60' width='240' height='90' fill='%23f6ead7'/%3E%3Cpath d='M30 60h260l-20-30H50z' fill='%23c98a43'/%3E%3Crect x='140' y='95' width='40' height='55' fill='%23384a5c'/%3E%3C/svg%3E">
                <source src="videos/tour.webm" type="video/webm">
                <source src="videos/tour.mp4" type="video/mp4">
                Sorry, your browser can't play this video.
              </video>
            `,
          },
          {
            type: 'quiz',
            q: 'A café wants a silent clip of coffee being poured to play by itself, over and over, at the top of the page. Which attributes?',
            options: ['`autoplay muted loop playsinline`', '`autoplay loop`', '`controls loop`', '`play="auto" repeat`'],
            answer: 0,
            explain: 'Browsers only autoplay video that is `muted`. `loop` repeats it and `playsinline` stops iPhones from opening it full screen. Without `muted`, the second option simply won\'t start.',
          },
          {
            type: 'task',
            title: 'The shop tour',
            body: `
              Add a video of the bakery:

              1. A \`<video>\` with **controls** and the poster \`images/tour-poster.jpg\`.
              2. Two \`<source>\`s: \`videos/tour.webm\` (type \`video/webm\`) and \`videos/tour.mp4\` (type \`video/mp4\`).
              3. A fallback sentence inside the video, after the sources.
            `,
            html: `
              <h2>Take a look inside</h2>
              <!-- Your video here -->
            `,
            checks: [
              { text: 'A `<video>` with controls', test: (c) => !!c.$('video') && (c.$('video').controls || 'Add the controls attribute so visitors can press play.') },
              { text: 'The poster is `images/tour-poster.jpg`', test: (c) => !!c.$('video') && /^(\.\/)?images\/tour-poster\.jpg$/.test(c.$('video').getAttribute('poster') || '') },
              {
                text: 'Two sources, WebM and MP4, each with a `type`',
                test: (c) => {
                  const s = c.$$('video source');
                  if (!s.length) return c.$('source') ? 'Put the <source> tags inside the <video>.' : false;
                  if (s.length < 2) return 'Add the second source.';
                  if (s.some((x) => !x.getAttribute('type'))) return 'Give each source a type, like type="video/mp4".';
                  const t = s.map((x) => x.getAttribute('type'));
                  return (t.includes('video/webm') && t.includes('video/mp4')) || 'The types are: ' + t.join(', ');
                },
              },
              { text: 'A fallback sentence inside the video', test: (c) => !!c.$('video') && c.$('video').textContent.trim().length > 5 },
            ],
            hint: 'The structure:\n\n```html\n<video controls poster="…">\n  <source src="…" type="video/webm">\n  <source src="…" type="video/mp4">\n  Sorry, …\n</video>\n```',
            solution: {
              html: `
                <h2>Take a look inside</h2>
                <video controls width="640" poster="images/tour-poster.jpg">
                  <source src="videos/tour.webm" type="video/webm">
                  <source src="videos/tour.mp4" type="video/mp4">
                  Sorry, your browser can't play this video.
                </video>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Audio',
            body: `
              Audio works the same way, for podcasts, a radio advert, or a sample of a band you book for weddings:

              \`\`\`html
              <audio controls src="audio/radio-advert.mp3">
                Sorry, your browser can't play this audio.
              </audio>
              \`\`\`

              With one file, \`src\` can go straight on the \`<audio>\` (or \`<video>\`) instead of a \`<source>\`. Never autoplay sound.
            `,
          },
          {
            type: 'fill',
            q: 'Give the visitor a play button.',
            code: `<audio [[controls]] src="audio/radio-advert.mp3"></audio>`,
            options: ['controls', 'autoplay', 'play', 'buttons'],
          },
          {
            type: 'brief',
            title: 'Embeds: YouTube and Google Maps',
            body: `
              An \`<iframe>\` is a window showing another web page inside yours. YouTube (**Share → Embed**) and Google Maps (**Share → Embed a map**) both give you one to paste in:

              \`\`\`html
              <iframe src="https://www.youtube-nocookie.com/embed/VIDEO-ID"
                      title="A tour of our bakery"
                      width="560" height="315"
                      loading="lazy" allowfullscreen></iframe>
              \`\`\`

              - **\`src\`** -- the address of the page to show.
              - **\`title\`** -- what's inside, for screen readers. Without it they just say "frame".
              - **\`width\`** and **\`height\`** -- the size of the window.
              - **\`loading="lazy"\`** -- maps and videos are heavy, so only load them when the visitor scrolls near.
              - **\`allowfullscreen\`** -- lets a video go full screen.

              The code YouTube and Google give you often has extra attributes (\`allow\`, \`referrerpolicy\`, \`style\`). It's fine to keep them. Add \`title\` and \`loading\` if they're missing.
            `,
          },
          {
            type: 'exhibit',
            title: 'A window in the page',
            body: `The preview has no internet, so this iframe uses \`srcdoc\` to hold a tiny stand-in page instead of a real map. On your site you'd use \`src\` with the address Google gives you.`,
            html: `
              <h2>Find us</h2>
              <iframe title="Map showing Sharp Cuts on Gloucester Road"
                      width="320" height="160"
                      srcdoc="<p>A Google map would load in this window.</p>"></iframe>
            `,
          },
          {
            type: 'quiz',
            q: 'Why give an `<iframe>` a `title`?',
            options: ['So screen readers can say what the frame contains', 'It shows as a heading above the frame', 'YouTube needs it to load the video', 'It makes the frame load faster'],
            answer: 0,
            explain: 'The title isn\'t shown on the page. It\'s read out by screen readers, which otherwise only announce "frame".',
          },
          {
            type: 'task',
            title: 'Embed the map',
            body: `
              Add the barber's Google map under the address:

              1. An \`<iframe>\` with \`src="https://www.google.com/maps/embed?pb=sharp-cuts-bristol"\` (a made-up address standing in for the long one Google gives you).
              2. A \`title\` describing the map.
              3. \`width="600"\` and \`height="450"\`.
              4. Lazy loading.

              The window will stay empty here, as the preview has no internet.
            `,
            html: `
              <h2>Find us</h2>
              <p>12 Gloucester Road, Bristol BS7 8AA</p>
              <!-- The map goes here -->
            `,
            checks: [
              {
                text: 'An `<iframe>` showing the Google map',
                test: (c) => {
                  const f = c.$('iframe');
                  if (!f) return false;
                  return /^https:\/\/www\.google\.com\/maps\/embed\?pb=sharp-cuts-bristol$/.test((f.getAttribute('src') || '').trim()) || 'Copy the src exactly: https://www.google.com/maps/embed?pb=sharp-cuts-bristol';
                },
              },
              {
                text: 'The iframe has a useful `title`',
                test: (c) => {
                  const f = c.$('iframe');
                  if (!f) return false;
                  const t = (f.getAttribute('title') || '').trim();
                  return t.length >= 8 || (t ? 'Say a bit more, for example: Map showing Sharp Cuts on Gloucester Road.' : false);
                },
              },
              { text: '`width` 600 and `height` 450', test: (c) => !!c.$('iframe') && c.$('iframe').getAttribute('width') === '600' && c.$('iframe').getAttribute('height') === '450' },
              { text: 'It loads lazily', test: (c) => !!c.$('iframe') && c.$('iframe').getAttribute('loading') === 'lazy' },
            ],
            hint: 'One tag with five attributes, closed with `</iframe>`:\n\n```html\n<iframe src="…" title="…" width="…" height="…" loading="lazy"></iframe>\n```',
            solution: {
              html: `
                <h2>Find us</h2>
                <p>12 Gloucester Road, Bristol BS7 8AA</p>
                <iframe src="https://www.google.com/maps/embed?pb=sharp-cuts-bristol"
                        title="Map showing Sharp Cuts on Gloucester Road"
                        width="600" height="450" loading="lazy"></iframe>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              '`<video controls poster="…">` with `<source src="…" type="video/mp4">` inside. Add fallback text after the sources.',
              'Autoplay only works `muted`. For background video: `autoplay muted loop playsinline`. Never autoplay sound.',
              '`<audio controls src="…">` works the same way as video.',
              '`<iframe>` embeds another page: YouTube, Google Maps. Give it `src`, `title`, `width`, `height` and `loading="lazy"`.',
              'Embed code from YouTube or Google can be pasted as it is; check it has a `title`.',
            ],
          },
        ],
      },

      /* ── 15 ────────────────────────────────────────────────────────── */
      {
        id: 'html-accessibility',
        title: 'Accessibility essentials',
        minutes: 11,
        steps: [
          {
            type: 'brief',
            title: 'Websites for everyone',
            body: `
              **Accessibility** means people can use your site however they use the web: with a screen reader that reads the page aloud, with only a keyboard, zoomed in to 200%, or with shaky hands on a small phone.

              That's a lot of your customers: about one in five people in the UK has a disability. It's also the law: the Equality Act 2010 expects businesses to make reasonable adjustments, and that includes websites. And nearly everything that helps a screen reader helps Google too.

              Good news: you already know most of it. Alt text, labels, headings in order and \`lang\` are all accessibility. This mission adds the rest and puts it together.
            `,
          },
          {
            type: 'brief',
            title: 'Link text that makes sense alone',
            body: `
              Screen reader users often pull up a list of every link on the page. Imagine hearing this:

              > "Click here. Read more. Here. Click here."

              Every link should say **where it goes**, even out of context:

              \`\`\`html
              <!-- Bad -->
              <p>To see our prices, <a href="prices.html">click here</a>.</p>

              <!-- Good -->
              <p><a href="prices.html">See our prices</a>.</p>
              \`\`\`

              It helps sighted visitors who scan the page too, and Google uses link text to understand the page being linked to.
            `,
          },
          {
            type: 'quiz',
            q: 'A screen reader user lists all the links on a plumber\'s page. Which link text is most useful?',
            options: ['See our boiler repair prices', 'Click here', 'Read more', 'prices.html'],
            answer: 0,
            explain: 'It makes sense on its own and says exactly where it goes. The others mean nothing out of context.',
          },
          {
            type: 'task',
            title: 'Rewrite the links',
            body: `
              Rewrite these three paragraphs so each **link's text** says where it goes. You can change the sentences around them. Keep each link's \`href\`.
            `,
            html: `
              <p>Want to know what we charge? <a href="prices.html">Click here</a>.</p>
              <p>We cover all of Bristol. <a href="areas.html">Read more</a></p>
              <p>You can book online <a href="booking.html">here</a>.</p>
            `,
            checks: [
              {
                text: 'No vague link text like *click here*, *here* or *read more*',
                test: (c) => {
                  const bad = c.$$('a').map((a) => a.textContent.trim()).filter((t) => /^(click here|click|here|read more|more|link|this|find out more|learn more)\.?$/i.test(t));
                  return !bad.length || 'Still vague: ' + bad.map((t) => '"' + t + '"').join(', ');
                },
              },
              {
                text: 'Every link has at least two words',
                test: (c) => {
                  const a = c.$$('a');
                  return a.length >= 3 && (a.every((x) => x.textContent.trim().split(/\s+/).length >= 2) || 'One of your links is a single word. Say where it goes.');
                },
              },
              {
                text: 'The links still go to `prices.html`, `areas.html` and `booking.html`',
                test: (c) => {
                  const h = c.$$('a').map((a) => (a.getAttribute('href') || '').trim());
                  const missing = ['prices.html', 'areas.html', 'booking.html'].filter((x) => !h.includes(x));
                  return !missing.length || 'Missing a link to: ' + missing.join(', ');
                },
              },
            ],
            hint: 'Move the meaning into the link. For example: `<p><a href="prices.html">See what we charge</a>.</p>`',
            solution: {
              html: `
                <p><a href="prices.html">See what we charge</a>.</p>
                <p>We cover all of Bristol. <a href="areas.html">Check the areas we cover</a>.</p>
                <p><a href="booking.html">Book a plumber online</a>.</p>
              `,
            },
          },
          {
            type: 'brief',
            title: 'Buttons do, links go',
            body: `
              - A **link** (\`<a href>\`) **goes somewhere**: another page, a section, a phone number.
              - A **button** (\`<button>\`) **does something** on this page: sends a form, opens a menu, adds to the basket.

              The browser gives each one keyboard support for free: you can reach both with **Tab**, open a link with **Enter**, and press a button with **Enter** or **Space**.

              >! Never make a "button" out of a \`<div>\` or \`<span>\`. It might look the same once styled, but a keyboard can't reach it and a screen reader doesn't know it's clickable. AI tools do this surprisingly often.
            `,
          },
          {
            type: 'exhibit',
            title: 'Try the keyboard',
            body: `Click in an empty part of the result, then press **Tab** a few times. The link and the real button each get a focus outline in turn. The fake button (a styled \`<div>\`) is skipped every time.`,
            html: `
              <p><a href="prices.html">See our prices</a></p>
              <p><button type="button">Open menu</button></p>
              <div class="fake-button">Book now</div>
            `,
            css: `
              .fake-button { display: inline-block; padding: 2px 8px; border: 1px solid #767676; border-radius: 3px; background: #efefef; font: 13px sans-serif; cursor: pointer; }
            `,
            edit: ['html'],
            active: 'html',
          },
          {
            type: 'quiz',
            q: 'On a shop\'s product page, which of these should be a `<button>`?',
            options: ['**Add to basket** (adds the item and stays on the page)', '**View basket** (goes to basket.html)', '**Open the mobile menu**', '**Our prices** (goes to prices.html)'],
            answer: [0, 2],
            explain: 'Adding to the basket and opening a menu *do* something on this page, so they are buttons. Going to another page is a link.',
          },
          {
            type: 'brief',
            title: 'Buttons with only an icon',
            body: `
              A button that shows only an icon, like ☰ or ×, has no words for a screen reader to say. Give it an **\`aria-label\`**:

              \`\`\`html
              <button type="button" aria-label="Open menu">☰</button>
              <button type="button" aria-label="Close">×</button>
              \`\`\`

              The label isn't shown on the page; it's read out instead of the symbol. For an icon *image* inside a link (an Instagram logo, say), the image's \`alt\` does the same job: \`alt="Instagram"\`.

              ARIA attributes can do a lot, but the rule is: **use plain HTML first**. A real \`<button>\` beats a \`<div>\` with five ARIA attributes. Reach for \`aria-label\` only when there are no words to use.
            `,
          },
          {
            type: 'fill',
            q: 'Give the close button a name a screen reader can say.',
            code: `<button type="button" [[aria-label]]="Close">×</button>`,
            options: ['aria-label', 'alt', 'title', 'name'],
            explain: '`alt` only works on images. `title` is a hover tooltip that screen readers don\'t reliably read. `aria-label` is the dependable one.',
          },
          {
            type: 'task',
            title: 'Fix the buttons',
            body: `
              1. The ☰ button has no words. Give it the \`aria-label\` **Open menu**.
              2. **Our prices** goes to another page, \`prices.html\`. Make it a link instead of a button.
              3. The **Send** "button" is a \`<div>\`: a keyboard can't reach it and it doesn't send the form. Make it a real submit button.
            `,
            html: `
              <header>
                <button type="button">☰</button>
                <nav>
                  <ul>
                    <li><button type="button">Our prices</button></li>
                  </ul>
                </nav>
              </header>
              <form>
                <label for="email">Email</label>
                <input type="email" id="email" name="email">
                <div class="button">Send</div>
              </form>
            `,
            checks: [
              {
                text: 'The ☰ button has the label *Open menu*',
                test: (c) => {
                  const b = c.$$('button').find((x) => /☰/.test(x.textContent));
                  if (!b) return false;
                  return /open menu/i.test(b.getAttribute('aria-label') || '') || (b.hasAttribute('title') ? 'Use aria-label rather than title.' : false);
                },
              },
              {
                text: '*Our prices* is a link to `prices.html`',
                test: (c) => {
                  if (c.$$('button').some((x) => /prices/i.test(x.textContent))) return 'Our prices is still a <button>. Change it to <a href="prices.html">.';
                  const a = c.$$('a').find((x) => /prices/i.test(x.textContent));
                  return !!a && (a.getAttribute('href') || '').trim() === 'prices.html';
                },
              },
              {
                text: '*Send* is a real submit button',
                test: (c) => {
                  if (c.$$('div').some((x) => /send/i.test(x.textContent))) return 'Send is still a <div>.';
                  const b = c.$$('form button').find((x) => /send/i.test(x.textContent));
                  return !!b && (b.getAttribute('type') === 'submit' || 'Give the Send button type="submit".');
                },
              },
            ],
            hint: 'The fixes are:\n\n```html\n<button type="button" aria-label="Open menu">☰</button>\n<li><a href="prices.html">Our prices</a></li>\n<button type="submit">Send</button>\n```',
            solution: {
              html: `
                <header>
                  <button type="button" aria-label="Open menu">☰</button>
                  <nav>
                    <ul>
                      <li><a href="prices.html">Our prices</a></li>
                    </ul>
                  </nav>
                </header>
                <form>
                  <label for="email">Email</label>
                  <input type="email" id="email" name="email">
                  <button type="submit">Send</button>
                </form>
              `,
            },
          },
          {
            type: 'brief',
            title: 'The five-minute check',
            body: `
              Run through this on every site you build or get from an AI tool:

              1. \`<html lang="en-GB">\` is set.
              2. Every \`<img>\` has \`alt\`: a description, or \`alt=""\` if it's decoration.
              3. Every form field has a linked \`<label>\`. Placeholders don't count.
              4. One \`<h1>\`, and headings go down one level at a time.
              5. Links say where they go; buttons are \`<button>\`s; icon buttons have an \`aria-label\`.
              6. Press **Tab** through the whole page. Can you reach and use everything?

              Colour contrast and text size matter as well. That's CSS, in the next dossier.
            `,
          },
          {
            type: 'task',
            title: 'Audit a page',
            body: `
              This candle shop page fails four points of the check. Fix them:

              1. The language isn't set. Make it British English.
              2. A heading skips levels. Fix it.
              3. The photo has no \`alt\`. It shows hand-poured candles on a workbench.
              4. The email field has only a placeholder. Give it a proper label (keep the placeholder if you like).
            `,
            html: `
              <!doctype html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Hand-poured Candles in York | Wick &amp; Wax</title>
                </head>
                <body>
                  <h1>Wick &amp; Wax</h1>
                  <h4>Our candles</h4>
                  <img src="images/candles.jpg" width="600" height="400">
                  <p>Soy candles, hand-poured in our York workshop.</p>

                  <h2>Newsletter</h2>
                  <form>
                    <input type="email" id="email" name="email" placeholder="Your email">
                    <button type="submit">Sign up</button>
                  </form>
                </body>
              </html>
            `,
            checks: [
              { text: 'The page language is British English', test: (c) => /^en(-gb)?$/i.test(c.doc.documentElement.lang) },
              {
                text: 'Headings go down one level at a time',
                test: (c) => {
                  const lv = c.$$('h1, h2, h3, h4, h5, h6').map((h) => +h.tagName[1]);
                  if (lv.filter((x) => x === 1).length !== 1) return 'Keep exactly one h1.';
                  for (let i = 1; i < lv.length; i++) if (lv[i] > lv[i - 1] + 1) return 'An h' + lv[i] + ' comes straight after an h' + lv[i - 1] + '.';
                  return true;
                },
              },
              {
                text: 'The photo has useful `alt` text',
                test: (c) => {
                  const i = c.$('img');
                  if (!i) return false;
                  const a = (i.getAttribute('alt') || '').trim();
                  if (!a) return false;
                  if (/^(an? )?(image|picture|photo)( of)?\b/i.test(a)) return 'Drop "image of": screen readers already say it\'s an image.';
                  return /candle/i.test(a) || 'Describe what the photo shows: the candles.';
                },
              },
              {
                text: 'The email field has a linked `<label>`',
                test: (c) => {
                  const i = c.$('input[type="email"]');
                  if (!i) return false;
                  return i.labels.length > 0 || (c.$('label') ? 'The label\'s for must match the input\'s id (email).' : false);
                },
              },
            ],
            hint: 'Four small edits: `<html lang="en-GB">`; change the `<h4>` (and its closing tag) to an `<h2>`; add `alt="…"` to the image; add `<label for="email">Your email</label>` before the input.',
            solution: {
              html: `
                <!doctype html>
                <html lang="en-GB">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Hand-poured Candles in York | Wick &amp; Wax</title>
                  </head>
                  <body>
                    <h1>Wick &amp; Wax</h1>
                    <h2>Our candles</h2>
                    <img src="images/candles.jpg" alt="Hand-poured candles cooling on a workbench" width="600" height="400">
                    <p>Soy candles, hand-poured in our York workshop.</p>

                    <h2>Newsletter</h2>
                    <form>
                      <label for="email">Your email</label>
                      <input type="email" id="email" name="email" placeholder="Your email">
                      <button type="submit">Sign up</button>
                    </form>
                  </body>
                </html>
              `,
            },
          },
          {
            type: 'debrief',
            points: [
              'Link text must make sense on its own: "See our prices", never "click here" or "read more".',
              'Links go somewhere (`<a href>`); buttons do something (`<button>`). Never fake a button with a `<div>`.',
              'Icon-only buttons need `aria-label="Open menu"`. Use plain HTML first, ARIA only when there are no words.',
              'The check: `lang`, `alt` on every image, a `<label>` on every field, headings in order, and Tab through the page.',
              'Accessibility helps disabled visitors, keyboard and phone users, and Google, and UK law expects it.',
            ],
          },
        ],
      },

      /* ── 16 ────────────────────────────────────────────────────────── */
      // The final build. Each task starts from the previous task's solution,
      // so the four stages of the page are defined once here.
      (function () {
        const S0 = `
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title></title>
            </head>
            <body>
              <!-- Task 1: the header -->

              <main>
                <!-- Task 2: the hero -->

                <!-- Task 3: the prices -->

                <!-- Task 4: the order form -->
              </main>

              <!-- Task 4: the footer -->
            </body>
          </html>
        `;

        const S1 = `
          <!doctype html>
          <html lang="en-GB">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Crumb &amp; Co | Bakery in Bath</title>
              <meta name="description" content="Independent bakery on Walcot Street, Bath. Sourdough, pastries and celebration cakes, baked fresh every morning.">
            </head>
            <body>
              <header id="top">
                <p><strong>Crumb &amp; Co</strong></p>
                <nav>
                  <ul>
                    <li><a href="#top">Home</a></li>
                    <li><a href="#prices">Prices</a></li>
                    <li><a href="#contact">Contact</a></li>
                  </ul>
                </nav>
              </header>

              <main>
                <!-- Task 2: the hero -->

                <!-- Task 3: the prices -->

                <!-- Task 4: the order form -->
              </main>

              <!-- Task 4: the footer -->
            </body>
          </html>
        `;

        const S2 = `
          <!doctype html>
          <html lang="en-GB">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Crumb &amp; Co | Bakery in Bath</title>
              <meta name="description" content="Independent bakery on Walcot Street, Bath. Sourdough, pastries and celebration cakes, baked fresh every morning.">
            </head>
            <body>
              <header id="top">
                <p><strong>Crumb &amp; Co</strong></p>
                <nav>
                  <ul>
                    <li><a href="#top">Home</a></li>
                    <li><a href="#prices">Prices</a></li>
                    <li><a href="#contact">Contact</a></li>
                  </ul>
                </nav>
              </header>

              <main>
                <section>
                  <h1>Fresh bread, baked in Bath every morning</h1>
                  <p>Sourdough, pastries and celebration cakes from our little shop on Walcot Street.</p>
                  <img src="images/shop-front.jpg" alt="The Crumb &amp; Co shop front, with loaves in the window" width="800" height="500">
                  <p><a href="#prices">See our prices</a></p>
                </section>

                <!-- Task 3: the prices -->

                <!-- Task 4: the order form -->
              </main>

              <!-- Task 4: the footer -->
            </body>
          </html>
        `;

        const S3 = `
          <!doctype html>
          <html lang="en-GB">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Crumb &amp; Co | Bakery in Bath</title>
              <meta name="description" content="Independent bakery on Walcot Street, Bath. Sourdough, pastries and celebration cakes, baked fresh every morning.">
            </head>
            <body>
              <header id="top">
                <p><strong>Crumb &amp; Co</strong></p>
                <nav>
                  <ul>
                    <li><a href="#top">Home</a></li>
                    <li><a href="#prices">Prices</a></li>
                    <li><a href="#contact">Contact</a></li>
                  </ul>
                </nav>
              </header>

              <main>
                <section>
                  <h1>Fresh bread, baked in Bath every morning</h1>
                  <p>Sourdough, pastries and celebration cakes from our little shop on Walcot Street.</p>
                  <img src="images/shop-front.jpg" alt="The Crumb &amp; Co shop front, with loaves in the window" width="800" height="500">
                  <p><a href="#prices">See our prices</a></p>
                </section>

                <section id="prices">
                  <h2>Prices</h2>
                  <table>
                    <caption>Bread and cakes</caption>
                    <thead>
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Sourdough loaf</th>
                        <td>£4.50</td>
                      </tr>
                      <tr>
                        <th scope="row">Almond croissant</th>
                        <td>£3.20</td>
                      </tr>
                      <tr>
                        <th scope="row">Celebration cake (serves 12)</th>
                        <td>£38</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <!-- Task 4: the order form -->
              </main>

              <!-- Task 4: the footer -->
            </body>
          </html>
        `;

        const S4 = `
          <!doctype html>
          <html lang="en-GB">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Crumb &amp; Co | Bakery in Bath</title>
              <meta name="description" content="Independent bakery on Walcot Street, Bath. Sourdough, pastries and celebration cakes, baked fresh every morning.">
            </head>
            <body>
              <header id="top">
                <p><strong>Crumb &amp; Co</strong></p>
                <nav>
                  <ul>
                    <li><a href="#top">Home</a></li>
                    <li><a href="#prices">Prices</a></li>
                    <li><a href="#contact">Contact</a></li>
                  </ul>
                </nav>
              </header>

              <main>
                <section>
                  <h1>Fresh bread, baked in Bath every morning</h1>
                  <p>Sourdough, pastries and celebration cakes from our little shop on Walcot Street.</p>
                  <img src="images/shop-front.jpg" alt="The Crumb &amp; Co shop front, with loaves in the window" width="800" height="500">
                  <p><a href="#prices">See our prices</a></p>
                </section>

                <section id="prices">
                  <h2>Prices</h2>
                  <table>
                    <caption>Bread and cakes</caption>
                    <thead>
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Sourdough loaf</th>
                        <td>£4.50</td>
                      </tr>
                      <tr>
                        <th scope="row">Almond croissant</th>
                        <td>£3.20</td>
                      </tr>
                      <tr>
                        <th scope="row">Celebration cake (serves 12)</th>
                        <td>£38</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section id="contact">
                  <h2>Order a cake</h2>
                  <form>
                    <p>
                      <label for="name">Name</label>
                      <input type="text" id="name" name="name" required>
                    </p>
                    <p>
                      <label for="email">Email</label>
                      <input type="email" id="email" name="email" required>
                    </p>
                    <p>
                      <label for="message">What would you like?</label>
                      <textarea id="message" name="message" rows="4"></textarea>
                    </p>
                    <button type="submit">Send</button>
                  </form>
                </section>
              </main>

              <footer>
                <p><a href="tel:+441632960456">01632 960 456</a> · <a href="mailto:hello@crumbandco.co.uk">hello@crumbandco.co.uk</a></p>
                <p>&copy; 2025 Crumb &amp; Co</p>
              </footer>
            </body>
          </html>
        `;

        const VAGUE = /^(click here|click|here|read more|more|link|this)\.?$/i;

        return {
          id: 'html-final',
          title: 'Final operation: a business landing page',
          minutes: 20,
          steps: [
            {
              type: 'brief',
              title: 'Your final operation',
              body: `
                Time to put it all together. You'll build a complete one-page site for **Crumb & Co**, an independent bakery in Bath, in four stages:

                1. **The head and header** -- language, title, description, and a menu of jump links
                2. **The hero** -- the big welcome at the top, with the \`<h1>\`
                3. **The prices** -- a proper table
                4. **The order form and footer** -- with phone and email links

                Each task starts with your page as it was at the end of the last one. The comments in the code show where each part goes. It's a complete, valid page: add CSS and it's ready to go live.
              `,
            },
            {
              type: 'task',
              title: '1. Head and header',
              body: `
                1. Set the language to British English.
                2. Title: **Crumb & Co | Bakery in Bath** (write the & as an entity).
                3. A meta description of 50 to 160 characters.
                4. Replace the *Task 1* comment with a \`<header>\` that has \`id="top"\`. Inside it: a paragraph with the name **Crumb & Co** in \`<strong>\`, then a \`<nav>\` with a list of three links: **Home** (\`#top\`), **Prices** (\`#prices\`) and **Contact** (\`#contact\`).

                The Prices and Contact links won't work yet: those sections come later.
              `,
              html: S0,
              checks: [
                { text: 'The language is British English', test: (c) => /^en(-gb)?$/i.test(c.doc.documentElement.lang) },
                {
                  text: 'The title says *Crumb & Co | Bakery in Bath*',
                  test: (c) => (/crumb\s*&\s*co/i.test(c.doc.title) && /bath/i.test(c.doc.title)) || (c.doc.title.trim() ? 'Your title is "' + c.doc.title + '".' : false),
                },
                {
                  text: 'A meta description of 50 to 160 characters',
                  test: (c) => {
                    const m = c.$('meta[name="description"]');
                    if (!m) return false;
                    const n = (m.getAttribute('content') || '').trim().length;
                    return (n >= 50 && n <= 160) || 'Your description is ' + n + ' characters. Aim for 50 to 160.';
                  },
                },
                {
                  text: 'A `<header id="top">` with the name and a `<nav>` list of three jump links',
                  test: (c) => {
                    const h = c.$('header');
                    if (!h) return false;
                    if (h.id !== 'top') return 'Give the header id="top".';
                    if (!/crumb\s*&\s*co/i.test(c.text(h.querySelector('strong') || h))) return 'Put the name Crumb & Co in a <strong> in the header.';
                    const hrefs = Array.from(h.querySelectorAll('nav ul li a')).map((a) => a.getAttribute('href'));
                    const want = ['#top', '#prices', '#contact'];
                    const missing = want.filter((x) => !hrefs.includes(x));
                    return !missing.length || (hrefs.length ? 'The menu needs links to: ' + missing.join(', ') : 'Add a <nav> with a <ul> of links inside the header.');
                  },
                },
                {
                  text: 'The header comes before `<main>`',
                  test: (c) => !!c.$('header') && !!c.$('main') && !c.$('main header') && !!(c.$('header').compareDocumentPosition(c.$('main')) & 4),
                },
              ],
              hint: 'The header looks like this:\n\n```html\n<header id="top">\n  <p><strong>Crumb &amp; Co</strong></p>\n  <nav>\n    <ul>\n      <li><a href="#top">Home</a></li>\n      …\n    </ul>\n  </nav>\n</header>\n```\n\nThe description goes in the head: `<meta name="description" content="…">`.',
              solution: { html: S1 },
            },
            {
              type: 'quiz',
              q: 'Your menu links to `#prices`. What has to exist on the page for that link to work?',
              options: ['An element with `id="prices"`', 'An element with `class="prices"`', 'A file called `prices.html`', 'A `<nav>` with `name="prices"`'],
              answer: 0,
              explain: 'A jump link finds the element whose `id` matches the part after the `#`. You\'ll add that element in task 3.',
            },
            {
              type: 'task',
              title: '2. The hero',
              body: `
                Replace the *Task 2* comment with a \`<section>\` containing:

                1. The page's only \`<h1>\`: **Fresh bread, baked in Bath every morning**.
                2. A paragraph about the bakery.
                3. An image: \`images/shop-front.jpg\`, 800 × 500, with your own \`alt\` text (it shows the shop front with loaves in the window). It's at the top of the page, so **don't** lazy-load it.
                4. A paragraph with a link to \`#prices\`, whose text makes sense on its own.
              `,
              html: S1,
              checks: [
                {
                  text: 'One `<h1>`, in a `<section>` inside `<main>`',
                  test: (c) => {
                    const n = c.$$('h1').length;
                    if (n > 1) return 'There are ' + n + ' h1 headings. Keep just one.';
                    if (c.$('header h1')) return 'Put the h1 in the hero section in <main>, not in the header.';
                    return !!c.$('main section h1') && /fresh bread/i.test(c.text('h1'));
                  },
                },
                {
                  text: 'A paragraph about the bakery',
                  test: (c) => {
                    const h = c.$('main section h1');
                    return !!h && Array.from(h.parentElement.querySelectorAll('p')).some((p) => !p.querySelector('a') && p.textContent.trim().length >= 10);
                  },
                },
                {
                  text: 'The shop-front image, with `alt`, `width` and `height`, not lazy',
                  test: (c) => {
                    const i = c.$('main img');
                    if (!i) return false;
                    if (!/^(\.\/)?images\/shop-front\.jpg$/.test((i.getAttribute('src') || '').trim())) return 'The src should be images/shop-front.jpg';
                    const a = (i.getAttribute('alt') || '').trim();
                    if (a.length < 8) return 'Describe the photo in the alt text.';
                    if (i.getAttribute('width') !== '800' || i.getAttribute('height') !== '500') return 'Set width="800" and height="500".';
                    return i.getAttribute('loading') !== 'lazy' || 'This image is at the top of the page, so remove loading="lazy".';
                  },
                },
                {
                  text: 'A link to `#prices` with clear text',
                  test: (c) => {
                    const a = c.$$('main a').find((x) => x.getAttribute('href') === '#prices');
                    if (!a) return false;
                    return !VAGUE.test(a.textContent.trim()) || 'Say where the link goes, like "See our prices".';
                  },
                },
              ],
              hint: 'The shape:\n\n```html\n<section>\n  <h1>…</h1>\n  <p>…</p>\n  <img src="…" alt="…" width="800" height="500">\n  <p><a href="#prices">…</a></p>\n</section>\n```',
              solution: { html: S2 },
            },
            {
              type: 'fill',
              q: 'Start the prices section so the menu link finds it.',
              code: `
                <section [[id]]="prices">
                  <h2>Prices</h2>
                  <table>
                    <[[caption]]>Bread and cakes</caption>
                    <thead>
                      <tr><th [[scope]]="col">Item</th><th scope="col">Price</th></tr>
              `,
              options: ['id', 'class', 'caption', 'title', 'scope', 'href'],
            },
            {
              type: 'task',
              title: '3. The prices',
              body: `
                Replace the *Task 3* comment with a \`<section id="prices">\` containing:

                1. An \`<h2>\` **Prices**.
                2. A table with the caption **Bread and cakes**, a \`<thead>\` with two column headers (**Item** and **Price**, with \`scope="col"\`), and a \`<tbody>\` with **three** items. Each row starts with a \`<th scope="row">\` for the item, then a \`<td>\` with a price in £.

                Then try the **Prices** link in the menu.
              `,
              html: S2,
              checks: [
                {
                  text: 'A `<section id="prices">` in `<main>`, with an `<h2>`',
                  test: (c) => {
                    const s = c.$('#prices');
                    if (!s) return false;
                    if (s.tagName !== 'SECTION') return 'Put id="prices" on the <section>.';
                    return (!!c.$('main #prices') && /prices/i.test(c.text(s.querySelector('h2') || s))) || 'The section needs an <h2> that says Prices, and must sit inside <main>.';
                  },
                },
                { text: 'The table has the caption *Bread and cakes*', test: (c) => /bread and cakes/i.test(c.text('#prices table caption')) },
                {
                  text: 'Column headers in a `<thead>`, with `scope="col"`',
                  test: (c) => {
                    const th = c.$$('#prices thead th');
                    if (th.length < 2) return false;
                    return th.every((x) => x.getAttribute('scope') === 'col') || 'Add scope="col" to each header cell.';
                  },
                },
                {
                  text: 'Three body rows: a `<th scope="row">` and a £ price',
                  test: (c) => {
                    if (!/<tbody[\s>]/i.test(c.src('html'))) return c.$('#prices table') ? 'Wrap the item rows in <tbody>.' : false;
                    const rows = c.$$('#prices tbody tr');
                    if (rows.length < 3) return 'There are ' + rows.length + ' rows in the tbody. Add three.';
                    const ok = rows.every((r) => r.firstElementChild && r.firstElementChild.tagName === 'TH' && r.firstElementChild.getAttribute('scope') === 'row' && /£\s*\d/.test(r.textContent));
                    return ok || 'Each row needs a <th scope="row"> for the item and a <td> with a price like £4.50.';
                  },
                },
              ],
              hint: 'It\'s the barber\'s price list from the tables mission, with two columns. A body row:\n\n```html\n<tr>\n  <th scope="row">Sourdough loaf</th>\n  <td>£4.50</td>\n</tr>\n```',
              solution: { html: S3 },
            },
            {
              type: 'quiz',
              q: 'A bakery\'s order form works, but the emails arrive without the customer\'s message. What\'s the most likely cause?',
              options: ['The `<textarea>` has no `name`', 'The `<textarea>` has no `rows`', 'The form has no `<fieldset>`', 'The `<label>` comes before the `<textarea>`'],
              answer: 0,
              explain: 'Only fields with a `name` are sent. It\'s the first thing to check when a form "loses" an answer.',
            },
            {
              type: 'task',
              title: '4. Order form and footer',
              body: `
                Replace the *order form* comment with a \`<section id="contact">\` containing an \`<h2>\` **Order a cake** and a form with:

                1. **Name** (text) and **Email** (email), both required.
                2. A **What would you like?** message box.
                3. A **Send** submit button.

                Every field needs a label and a \`name\`. Then replace the *footer* comment with a \`<footer>\` containing a phone link (**01632 960 456**, which is \`+441632960456\`), an email link (**hello@crumbandco.co.uk**) and a **©** line.
              `,
              html: S3,
              checks: [
                {
                  text: 'A `<section id="contact">` with a form and a submit button',
                  test: (c) => {
                    const s = c.$('#contact');
                    if (!s) return false;
                    if (s.tagName !== 'SECTION') return 'Put id="contact" on the <section>.';
                    if (!s.querySelector('form')) return 'Put the <form> inside the contact section.';
                    const b = s.querySelector('form button');
                    return (!!b && b.getAttribute('type') === 'submit') || 'Add <button type="submit">Send</button> at the end of the form.';
                  },
                },
                {
                  text: 'Name, email and message fields, each with a label and a `name`',
                  test: (c) => {
                    const f = c.$('#contact form');
                    if (!f) return false;
                    const fields = [f.querySelector('input[type="text"]'), f.querySelector('input[type="email"]'), f.querySelector('textarea')];
                    const what = ['name (type text)', 'email', 'message (textarea)'];
                    const gone = fields.findIndex((x) => !x);
                    if (gone >= 0) return 'Missing the ' + what[gone] + ' field.';
                    const noLabel = fields.findIndex((x) => !x.labels.length);
                    if (noLabel >= 0) return 'The ' + what[noLabel] + ' field has no linked label.';
                    const noName = fields.findIndex((x) => !x.name);
                    return noName < 0 || 'The ' + what[noName] + ' field has no name, so it would not be sent.';
                  },
                },
                {
                  text: 'Name and email are required',
                  test: (c) => {
                    const f = c.$('#contact form');
                    const n = f && f.querySelector('input[type="text"]');
                    const e = f && f.querySelector('input[type="email"]');
                    return !!(n && e) && (n.required && e.required || 'Add required to both the name and email inputs.');
                  },
                },
                {
                  text: 'A `<footer>` after `<main>`, with phone and email links and a ©',
                  test: (c) => {
                    const ft = c.$('footer');
                    if (!ft) return false;
                    if (c.$('main footer') || !(c.$('main').compareDocumentPosition(ft) & 4)) return 'Put the footer after </main>.';
                    const tel = Array.from(ft.querySelectorAll('a')).find((a) => /^tel:/i.test(a.getAttribute('href') || ''));
                    if (!tel) return 'Add a phone link: href="tel:+441632960456".';
                    if (!/^tel:(\+44|0)1632960456$/.test(tel.getAttribute('href').trim())) return 'Check the tel: link. No spaces: tel:+441632960456';
                    if (!Array.from(ft.querySelectorAll('a')).some((a) => /^mailto:hello@crumbandco\.co\.uk$/i.test((a.getAttribute('href') || '').trim()))) return 'Add an email link: href="mailto:hello@crumbandco.co.uk".';
                    return /©/.test(ft.textContent) || 'Add a © line (&copy;).';
                  },
                },
                {
                  text: 'Every jump link on the page now works',
                  test: (c) => {
                    const links = c.$$('a[href^="#"]');
                    if (!links.length) return false;
                    const broken = links.map((a) => a.getAttribute('href')).filter((h) => h.length < 2 || !c.doc.getElementById(h.slice(1)));
                    return !broken.length || 'Nothing on the page has the id for: ' + broken.join(', ');
                  },
                },
              ],
              hint: 'The form follows the pattern from the forms missions: a `<p>` per field, each with a `<label for="…">` and an input with matching `id`, plus a `name`. The footer:\n\n```html\n<footer>\n  <p><a href="tel:+441632960456">01632 960 456</a> · <a href="mailto:…">…</a></p>\n  <p>&copy; 2025 Crumb &amp; Co</p>\n</footer>\n```',
              solution: { html: S4 },
            },
            {
              type: 'debrief',
              points: [
                'A complete page: doctype, `<html lang>`, a `<head>` with charset, viewport, title and description, then `<header>`, `<main>` and `<footer>` in the body.',
                'The `<header>` holds the name and a `<nav>` list; jump links (`#prices`) need a matching `id`.',
                'One `<h1>` in a hero section. Don\'t lazy-load the top image; do give every image `alt`, `width` and `height`.',
                'Price lists are tables with `<caption>`, `<thead>`, `<tbody>` and `scope`. Forms need labels, names and `required` where it matters.',
                'Footers carry `tel:` and `mailto:` links and the `&copy;` line. You can now read, check and fix the HTML any AI tool gives you.',
              ],
            },
          ],
        };
      })(),
    ],
  },
]);

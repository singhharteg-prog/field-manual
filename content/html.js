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
    ],
  },
]);

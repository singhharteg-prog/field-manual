# Field Manual

A private course in **HTML, CSS and JavaScript**, in the spirit of Sololearn:
short missions, live examples you can edit, and code that gets checked as you
go. It has a typewriter-dossier look and modern features underneath.

No build step, no dependencies, no account. Open `index.html`.

## Using it

- **Locally:** double-click `learn/index.html`. Everything works from the
  file, apart from offline install.
- **Hosted:** serve the folder from any static host (GitHub Pages, Cloudflare
  Pages, Netlify). Over `https` it installs as an app on a phone or desktop
  ("Add to Home Screen" / the install icon) and works offline afterwards.
  The page sets `noindex`, so search engines leave it alone.

Progress is saved in the browser you use (localStorage). Use **Profile →
Export progress** now and then as a backup, and to move between devices
(export on one, import on the other).

## What's in it

| | |
|---|---|
| **Dossiers** | Three tracks: HTML (Operation Skeleton), CSS (Operation Disguise) and JavaScript (Operation Brain), split into phases and missions. |
| **Missions** | Cards, one at a time: *Briefing* (reading), *Exhibit* (a live, editable example), *Interrogation* (multiple choice), *Decrypt* (fill in the blanks), *Field test* (write code; it's run and checked against a checklist) and *Debrief* (the key points). |
| **Field tests** | A real editor (highlighting, auto-indent, auto-closing tags and brackets, Ctrl+/ to comment, and a symbol bar on touch screens), a live preview, a console, hints, and a solution you can reveal once you've had a go. |
| **Drills** | Every question from finished missions comes back on a spaced-repetition schedule. The ones you miss come back sooner. |
| **Intel archive** | The debrief points of every finished mission, searchable: your own cheat sheet. |
| **Safehouse** | A free HTML/CSS/JS playground with saved files, full-page preview, and download as a single `.html` file. |
| **Rank & XP** | XP for answers and field tests, ranks from Recruit to Spymaster, a day streak and a 12-week activity grid. |
| **Search** | `Ctrl+K` or `/` to jump to any mission or topic. |
| **Themes** | Paper and Night ops (or match the device), adjustable code size, optional sound effects. |

## Files

```
index.html            the app shell
css/app.css           all styles (tokens at the top)
js/core.js            course registry, Markdown renderer, syntax highlighter
js/store.js           progress, XP, ranks, drills, export/import
js/editor.js          the code editor
js/runner.js          runs code in a sandboxed iframe; the check toolkit; loop guard
js/app.js             routes, screens, mission player, workbench
content/tracks.js     the three tracks
content/html.js       HTML missions
content/css.js        CSS missions
content/js-1.js       JavaScript: basics to objects
content/js-2.js       JavaScript: the DOM to async
sw.js                 offline cache
tools/selftest.html   runs every exercise in the browser
tools/validate.cjs    the same, headless (needs Playwright)
CONTENT_GUIDE.md      how to write or edit missions
```

## Editing the course

Missions are plain JavaScript objects. See `CONTENT_GUIDE.md`. After any change:

```bash
node learn/tools/validate.cjs
```

It runs every field test with the starter code (which must fail) and the
solution (which must pass), and checks that every quiz is well-formed. Or open
`tools/selftest.html` in a browser.

Mission `id`s are the keys your progress is saved under. Don't rename them.

## Safety notes

Your code runs in an iframe on the same origin as the app, so the checker can
inspect it. Infinite `for`/`while` loops are stopped after 1.5 seconds, and
preview code gets its own sandboxed `localStorage`, so a lesson calling
`localStorage.clear()` can't wipe your progress.

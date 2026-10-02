#!/usr/bin/env node
/* Run the self-test headless.
   Usage: node tools/validate.cjs [track-or-mission-prefix] [--file js-1]
   --file limits which content files load (comma-separated, no .js).
   Exits non-zero if any exercise is broken. */
const path = require('path');
const { execSync } = require('child_process');
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')));
}

(async () => {
  const args = process.argv.slice(2);
  const fi = args.indexOf('--file');
  const files = fi >= 0 ? args.splice(fi, 2)[1] : '';
  const only = args[0] || '';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  // Course-file errors are collected by selftest.html itself (window.__loadErrors);
  // Playwright's pageerror also fires for learner code in preview iframes, so it isn't used.
  const file = 'file://' + path.resolve(__dirname, 'selftest.html') + '?only=' + encodeURIComponent(only) + (files ? '&files=' + encodeURIComponent(files) : '');
  await page.goto(file);
  await page.waitForFunction(() => window.__result, null, { timeout: 600000 });
  const r = await page.evaluate(() => window.__result);
  const loadErrors = await page.evaluate(() => window.__loadErrors || []);
  pageErrors.push(...loadErrors);
  await browser.close();
  console.log(JSON.stringify(r.stats));
  if (pageErrors.length) console.log('Page errors (usually a syntax error in a content file):\n  ' + pageErrors.join('\n  '));
  if (r.problems.length) {
    console.log(r.problems.length + ' problem(s):');
    for (const p of r.problems) console.log('  - ' + p);
    process.exit(1);
  }
  if (pageErrors.length) process.exit(1);
  console.log('All good.');
})();

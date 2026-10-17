// Storybook (npm run build-storybook first): every story and docs page renders without errors, and every
// story passes axe's WCAG 2.1 AA checks in all six themes (text in a disabled control is exempt from
// contrast, as WCAG 1.4.3 says).
//   node tools/test/storybook.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { PROJECT, browser, report } from './lib.mjs';

const DIR = path.join(PROJECT, 'storybook-static');
if (!fs.existsSync(path.join(DIR, 'index.json'))) {
  // In CI a missing build is a failure, not a skip, so the check can't pass by accident.
  if (process.env.CI) { console.log('FAIL  storybook-static/ is missing (npm run build-storybook)'); process.exit(1); }
  console.log('SKIP  Storybook is not built (npm run build-storybook)'); process.exit(0);
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(DIR) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const { entries } = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
const axe = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const THEMES = ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark'];

const b = await browser();
const page = await b.newPage({ viewport: { width: 1000, height: 800 } });
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
let errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

async function open(e, theme) {
  const [brand, mode] = theme.split('-');
  errors = [];
  // a11y.manual stops the a11y addon's own axe run after each story: it shares window.axe with this check's run.
  await page.goto(`${base}/iframe.html?id=${e.id}&viewMode=${e.type === 'docs' ? 'docs' : 'story'}&globals=brand:${brand};mode:${mode};a11y.manual:!true`);
  await page.waitForFunction(() => document.body.classList.contains('sb-show-main') || document.body.classList.contains('sb-show-errordisplay'), null, { timeout: 15000 }).catch(() => {});
  // Wait for the story and the icon font: before the font loads, an icon's ligature reads as words to axe.
  await page.waitForFunction(() => document.body.classList.contains('sb-show-errordisplay') || document.querySelector('#storybook-root')?.children.length > 0 || document.querySelector('#storybook-docs')?.children.length > 0, null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(150);
}

// DIKI_SHARD=2/4 checks every fourth story starting with the second (CI runs the shards in parallel);
// the docs pages are checked in the first shard.
const [shard, shards] = (process.env.DIKI_SHARD || '1/1').split('/').map(Number);
const docs = shard === 1 ? Object.values(entries).filter((e) => e.type === 'docs') : [];
const stories = Object.values(entries).filter((e) => e.type === 'story').filter((_, i) => i % shards === shard - 1);
for (const e of docs) {
  await open(e, 'blue-light');
  const ok = await page.evaluate(() => !document.body.classList.contains('sb-show-errordisplay') && (document.querySelector('#storybook-docs')?.textContent || '').trim().length > 50);
  const missing = await page.evaluate(() => [...document.querySelectorAll('blockquote')].map((q) => q.textContent).filter((x) => /Missing README section/.test(x)));
  t(`docs · ${e.title}`, ok && !errors.length && !missing.length, [...errors, ...missing].slice(0, 3).join(' | '));
  // In a dark mode the whole docs page follows the theme, so dark components aren't shown on white.
  await open(e, 'blue-dark');
  const dark = await page.evaluate(() => {
    const bg = (s) => { const el = document.querySelector(s); return el ? getComputedStyle(el).backgroundColor : null; };
    const want = getComputedStyle(document.body).backgroundColor, text = getComputedStyle(document.querySelector('.sbdocs-content') || document.body).color;
    const off = ['html', '.sbdocs-wrapper', '.sbdocs-preview', '.docs-story'].filter((s) => bg(s) !== null && bg(s) !== want);
    return { theme: document.documentElement.getAttribute('data-theme'), want, text, off };
  });
  t(`docs · ${e.title} · dark: the page, story frames and text follow the theme`, dark.theme === 'blue-dark' && dark.want === 'rgb(3, 7, 18)' && !dark.off.length && dark.text !== 'rgb(46, 52, 56)', JSON.stringify(dark));
}
for (const e of stories) {
  const problems = [];
  for (const th of THEMES) {
    await open(e, th);
    const shown = await page.evaluate((th) => !document.body.classList.contains('sb-show-errordisplay') && document.querySelector('#storybook-root')?.children.length > 0 && document.documentElement.getAttribute('data-theme') === th && getComputedStyle(document.documentElement).backgroundColor === getComputedStyle(document.body).backgroundColor, th);
    if (!shown || errors.length) { problems.push(`${th}: ${errors[0] || 'did not render'}`); continue; }
    await page.addScriptTag({ content: axe });
    const v = await page.evaluate(async () => {
      const r = await window.axe.run('#storybook-root', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      // WCAG 1.4.3 exempts text that is part of an inactive control: a disabled Field's dimmed label and hint.
      const inactive = (n) => document.querySelector(n.target.join(' '))?.closest('.dk-field--disabled, :disabled, [aria-disabled="true"]');
      return r.violations.map((x) => ({ ...x, nodes: x.id === 'color-contrast' ? x.nodes.filter((n) => !inactive(n)) : x.nodes }))
        .filter((x) => x.nodes.length).map((x) => `${x.id} (${x.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(', ')})`);
    });
    if (v.length) problems.push(`${th}: ${v.join('; ')}`);
  }
  t(`${e.title} · ${e.name}: renders and passes WCAG 2.1 AA in all six themes`, !problems.length, problems.slice(0, 3).join('\n      '));
}
await b.close();
server.close();
console.log(`(${docs.length} docs pages, ${stories.length} stories × ${THEMES.length} themes)`);
process.exit(report('Storybook', R) ? 0 : 1);

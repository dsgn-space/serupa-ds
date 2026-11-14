// The docs site (site/, npm run site) stays in step with Storybook: both are made from the same .mdx pages,
// stories and types, and this fails a change that would leave the site behind.
// Before a browser: every block the pages import from Storybook has a version on the site (site/src/blocks.tsx),
// every component, block and pattern folder has a page, and every component's props can be read from its types.
// Then it builds the site and opens every page in a browser: the page draws its title and its examples with no
// error, every link to another page of the site leads to one, and no Storybook address is left unanswered. The
// site's own frame passes axe's WCAG 2.2 AA checks in all six themes and doesn't scroll sideways at 320px (the
// stories inside the pages are Storybook's check's: tools/test/storybook.mjs).
//   node tools/test/site.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { PROJECT, PAGES, FOLDERS, browser, done, fail, inParallel, openUrl, read, report, tokens } from './lib.mjs';
import { sitePages } from '../site/pages.mjs';
import { componentProps } from '../site/props.mjs';
import { components } from '../build/registry.mjs';

const R = [];
const t = (name, ok, detail) => { R.push({ name, ok: !!ok, detail }); return !!ok; };

// ── Without a browser ──────────────────────────────────────────────────────────────────────────────────────────
const pages = sitePages(PROJECT);
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(dir, e.name), out); else if (/\.(mdx|tsx)$/.test(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
};
// The names the pages and the docs' helpers import from Storybook's blocks, and the ones the site exports.
const used = new Map();
for (const f of [...walk(path.join(PROJECT, 'docs')), ...walk(path.join(PROJECT, 'src'))]) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/import \{([^}]*)\} from '@storybook\/addon-docs\/blocks'/g)) {
    for (const n of m[1].split(',').map((x) => x.trim()).filter(Boolean)) if (!used.has(n)) used.set(n, path.relative(PROJECT, f));
  }
}
const blocks = read('site/src/blocks.tsx');
const have = new Set([...blocks.matchAll(/^export (?:function|const) (\w+)/gm), ...[...blocks.matchAll(/^export \{([^}]*)\}/gm)].flatMap((m) => m[1].split(',').map((x) => [0, x.trim()]))].map((m) => m[1]));
const missing = [...used].filter(([n]) => !have.has(n));
t(`the site has each of the ${used.size} Storybook blocks the pages use`, !missing.length,
  missing.map(([n, f]) => `${n} (${f})`).join(', ') + ': add it to site/src/blocks.tsx, so the site can draw the page');

const paged = new Set(pages.map((p) => p.file));
const folders = FOLDERS.flatMap((d) => fs.readdirSync(path.join(PROJECT, 'src', d), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => `src/${d}/${e.name}/${e.name}.mdx`));
const unpaged = folders.filter((f) => !paged.has(f));
t(`each of the ${folders.length} component, block and pattern folders has a page on the site`, !unpaged.length,
  `no page for ${unpaged.join(', ')}: the folder needs its <Name>.mdx with a <Meta of={…} />`);

const props = await componentProps(components(PROJECT), PROJECT);
const propless = pages.filter((p) => p.component && read(p.file).includes('<Controls') && !props[p.component]?.length).map((p) => p.component);
t('each component page with a props table has props the site can read from the types', !propless.length,
  `nothing read for ${propless.join(', ')}: tools/site/props.mjs found no exported component with props in its <Name>.tsx`);

// ── The built site, in a browser ───────────────────────────────────────────────────────────────────────────────
// Into the check's own folder, so a site someone built stays as it is, and as a development build either way the check
// runs (alone or under Vitest), so React reports invalid markup and unknown tags as errors the pages are held to.
const out = fs.mkdtempSync(path.join(PROJECT, '.test-tmp-site-'));
const clear = () => fs.rmSync(out, { recursive: true, force: true });
process.on('exit', clear);
const built = spawnSync(process.execPath, [path.join(PROJECT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--config', path.join(PROJECT, 'tools', 'site', 'vite.config.mjs'), '--outDir', out, '--emptyOutDir', '--logLevel', 'error'],
  { cwd: PROJECT, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'development' } });
if (!t('the site builds (npm run build-site)', built.status === 0, (built.stderr || built.stdout || '').trim().split('\n').slice(0, 12).join('\n')) || !fs.existsSync(path.join(out, 'index.html'))) {
  clear();
  done(report('Docs site', R));
  fail('The site did not build, so its pages can\'t be opened.');
}

// Every address is the one page; the router picks what to show, as a host set up for a single-page site would serve it.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let f = path.join(out, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(out) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(out, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://127.0.0.1:${/** @type {import('node:net').AddressInfo} */ (server.address()).port}`;

const b = await browser();
const known = new Set(['/', ...pages.map((p) => p.path), ...['foundations', 'components', 'patterns', 'blocks', 'guides'].map((s) => '/' + s)]);
const workers = await Promise.all(Array.from({ length: PAGES }, async () => {
  const context = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).split('\n')[0]));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().split('\n')[0]); });
  return { context, page, errors };
}));

// A page is ready once its article is there and no longer loading (or, for the front page and the indexes, its h1).
const ready = (page, doc) => page.waitForFunction((d) => (d ? !!document.querySelector('#article:not([aria-busy]) h1') : !!document.querySelector('main h1')), doc, { timeout: 30000 }).then(() => '', (e) => String(e.message).split('\n')[0]);

await inParallel(pages, workers, async (p, w) => {
  w.errors.length = 0;
  const failed = await openUrl(w.page, base + p.path) || await ready(w.page, true);
  if (!t(`${p.path} opens (${p.file})`, !failed, failed)) return;
  // The stories wake a moment after the page (site/src/blocks.tsx), and a late error is still an error.
  await w.page.waitForTimeout(500);
  const seen = await w.page.evaluate(() => ({
    h1: [...document.querySelectorAll('#article h1')].filter((h) => !h.closest('[data-site-demo]')).map((h) => h.textContent.trim()),
    broken: document.querySelectorAll('.site-broken').length,
    links: [...new Set([...document.querySelectorAll('#article a[href]')].filter((a) => !a.closest('[data-site-demo]')).map((a) => a.getAttribute('href')))],
    demos: document.querySelectorAll('.site-demo').length,
    api: !!document.getElementById('api'),
  }));
  t(`${p.path} draws with no error`, !w.errors.length && !seen.broken, [...w.errors.slice(0, 3), seen.broken ? `${seen.broken} part(s) of the page show an error instead of their content` : ''].filter(Boolean).join(' | '));
  t(`${p.path} has one title`, seen.h1.length === 1, `its h1s: ${JSON.stringify(seen.h1)}`);
  // On a 320px phone the page doesn't scroll sideways (WCAG 1.4.10); a wide example scrolls in its own box.
  await w.page.setViewportSize({ width: 320, height: 640 });
  // The frame swaps its sidebar for a drawer on the next render: measure two frames later.
  const wide = await w.page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(document.documentElement.scrollWidth - document.documentElement.clientWidth)))));
  await w.page.setViewportSize({ width: 1280, height: 800 });
  t(`${p.path} doesn't scroll sideways at 320px`, wide <= 0, `the page is ${wide}px wider than the screen`);
  // Storybook's own links have been pointed at the site's pages by now; one that is left has no page here.
  const lost = seen.links.filter((h) => h.startsWith('?path=') || (h.startsWith('/') && !known.has(h.split('#')[0].replace(/\/$/, '') || '/')));
  t(`${p.path}: every link to another page of the site leads to one`, !lost.length, `no page for ${lost.slice(0, 8).join(', ')}`);
  if (p.stories && /<(Primary|Stories|Canvas)\b/.test(read(p.file))) t(`${p.path} shows its stories`, seen.demos > 0, 'the page has no example in a frame');
  if (p.component && read(p.file).includes('<Controls')) t(`${p.path} shows its props`, seen.api, 'the page has no API table');
});

// The site's own frame: the front page, an index and a page of each kind, in every theme and on a phone.
const axe = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const FRAME = ['/', '/components', '/components/button', '/foundations/colors', '/getting-started'];
const themes = tokens().color.themes.map((x) => x.id);
const w = workers[0];
for (const at of FRAME) {
  const failed = await openUrl(w.page, base + at) || await ready(w.page, pages.some((p) => p.path === at));
  if (!t(`${at} opens for the frame's checks`, !failed, failed)) continue;
  // An anatomy picture (docs/anatomy.tsx) turns inert, and so leaves the tab order, once its story has opened what it opens.
  await w.page.waitForFunction(() => [...document.querySelectorAll('.sb-anatomy__stage')].every((x) => x instanceof HTMLElement && x.inert), null, { timeout: 5000 }).catch(() => {});
  await w.page.addScriptTag({ content: axe });
  for (const theme of themes) {
    await w.page.evaluate((th) => { const [brand, mode] = th.split('-'); window.Serupa.theme.set({ brand, mode }); }, theme);
    const v = await w.page.evaluate(async () => {
      // The stories are checked where they live (Storybook's check); here it's the frame and the page's own text.
      const r = await window.axe.run({ exclude: [['[data-site-demo]']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'] } });
      return r.violations.map((x) => `${x.id}: ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}`);
    });
    t(`${at} · axe (WCAG 2.2 AA), ${theme}`, !v.length, v.slice(0, 4).join(' | '));
  }
  await w.page.evaluate(() => window.Serupa.theme.reset());
}
await w.page.setViewportSize({ width: 320, height: 640 });
for (const at of FRAME) {
  const failed = await openUrl(w.page, base + at) || await ready(w.page, pages.some((p) => p.path === at));
  if (failed) { t(`${at} opens at 320px`, false, failed); continue; }
  const wide = await w.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t(`${at} doesn't scroll sideways at 320px`, wide <= 0, `the page is ${wide}px wider than the screen`);
}

for (const x of workers) await x.context.close();
await b.close();
server.close();
clear();
done(report('Docs site', R));

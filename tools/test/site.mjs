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
// The site's own pages, which no .mdx gives it: the story, the six themes side by side and the patterns as screens.
const OWN = ['/about', '/themes', '/showcase'];
const known = new Set(['/', ...pages.map((p) => p.path), ...['foundations', 'components', 'patterns', 'blocks', 'guides'].map((s) => '/' + s), ...OWN]);
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

let held = '';
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
    // What sits on top of the page: an open modal dialog, or an open menu or panel. A tooltip shown beside its button
    // is left: it is a line of text that takes no focus.
    over: [...document.querySelectorAll('dialog, [popover]')].filter((e) => e.matches(':modal, :popover-open') && e.getAttribute('role') !== 'tooltip').map((e) => String(e.className || e.localName).split(' ')[0]),
    heldInFrame: document.querySelectorAll('.site-demo .site-held').length,
  }));
  // A story that opens something as it arrives waits behind a button (site/src/blocks.tsx): the page itself comes first.
  t(`${p.path} opens nothing over the page on arrival`, !seen.over.length, `open on top of the page: ${[...new Set(seen.over)].join(', ')}`);
  if (seen.heldInFrame && !held) held = p.path;
  t(`${p.path} draws with no error`, !w.errors.length && !seen.broken, [...w.errors.slice(0, 3), seen.broken ? `${seen.broken} part(s) of the page show an error instead of their content` : ''].filter(Boolean).join(' | '));
  t(`${p.path} has one title`, seen.h1.length === 1, `its h1s: ${JSON.stringify(seen.h1)}`);
  // On a 320px phone the page doesn't scroll sideways (WCAG 1.4.10); a wide example scrolls in its own box.
  await w.page.setViewportSize({ width: 320, height: 640 });
  // The frame swaps its sidebar for a drawer on the next render, and the examples lay out again after it: the page has
  // up to 2s to stop scrolling sideways, then is measured two frames later. Two frames alone weren't always enough on a
  // busy runner (/components/chat, 228px wider once on 14 Nov, fine on the next run).
  await w.page.waitForFunction(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth, null, { timeout: 2000, polling: 100 }).catch(() => {});
  const wide = await w.page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(document.documentElement.scrollWidth - document.documentElement.clientWidth)))));
  await w.page.setViewportSize({ width: 1280, height: 800 });
  t(`${p.path} doesn't scroll sideways at 320px`, wide <= 0, `the page is ${wide}px wider than the screen`);
  // Storybook's own links have been pointed at the site's pages by now; one that is left has no page here.
  const lost = seen.links.filter((h) => h.startsWith('?path=') || (h.startsWith('/') && !known.has(h.split('#')[0].replace(/\/$/, '') || '/')));
  t(`${p.path}: every link to another page of the site leads to one`, !lost.length, `no page for ${lost.slice(0, 8).join(', ')}`);
  if (p.stories && /<(Primary|Stories|Canvas)\b/.test(read(p.file))) t(`${p.path} shows its stories`, seen.demos > 0, 'the page has no example in a frame');
  if (p.component && read(p.file).includes('<Controls')) t(`${p.path} shows its props`, seen.api, 'the page has no API table');
});

// A press inside an example leaves the page where it is. The main region once took focus on any press that landed on
// nothing focusable (closing a calendar with a press beside it, say), and the browser scrolled its top into view.
{
  const w = workers[0];
  await openUrl(w.page, base + '/guides/localization'); await ready(w.page, true);
  const stage = w.page.locator('#article .site-demo__stage').last();
  await stage.scrollIntoViewIfNeeded();
  await w.page.waitForTimeout(300);
  const before = await w.page.evaluate(() => window.scrollY);
  // The stage's own padding: no control sits there.
  await stage.click({ position: { x: 4, y: 4 } });
  await w.page.waitForTimeout(300);
  const after = await w.page.evaluate(() => window.scrollY);
  t('/guides/localization: a press inside an example keeps the page where it was', before > 0 && after === before, `the page was at ${before}px before the press and at ${after}px after it`);
}

// "On this page" is the contents' rail (site/src/Doc.tsx): pointing at it opens the list, inside the window even on a
// page with more headings than the window is tall.
{
  const w = workers[0];
  await w.page.setViewportSize({ width: 1280, height: 720 });
  await openUrl(w.page, base + '/components/button'); await ready(w.page, true);
  const rail = w.page.locator('.site-aside .dk-toc--rail');
  const hovered = await rail.hover({ timeout: 10000 }).then(() => '', (e) => String(e.message).split('\n')[0]);
  await w.page.waitForTimeout(500);
  const panel = hovered ? null : await w.page.evaluate(() => {
    const el = document.querySelector('.site-aside .dk-toc__panel');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { shown: getComputedStyle(el).opacity === '1', top: r.top, bottom: r.bottom, left: r.left, right: r.right, links: el.querySelectorAll('a').length };
  });
  t('/components/button: pointing at the rail opens "On this page", inside the window', !!panel && panel.shown && panel.links > 0 && panel.top >= 0 && panel.left >= 0 && panel.bottom <= 720 && panel.right <= 1280, hovered || JSON.stringify(panel));
  await w.page.mouse.move(0, 0);
  await w.page.setViewportSize({ width: 1280, height: 800 });
}

// A theme change on a page with a screen: the screen follows it, with no View Transition of its own inside the one
// the page runs (site/src/Frame.tsx), and the page is still there afterwards.
{
  const context = await workers[0].page.context().browser().newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  let crashed = false;
  page.on('crash', () => { crashed = true; });
  await page.goto(base + '/');
  const frame = page.frameLocator('.site-screen__page');
  await page.locator('.site-screen').scrollIntoViewIfNeeded();
  const drawn = await frame.locator('[data-site-frame]').waitFor({ timeout: 15000 }).then(() => '', (e) => String(e.message).split('\n')[0]);
  const inner = page.frames().find((f) => f.url().includes('/frame/'));
  const before = inner ? await inner.evaluate(() => document.documentElement.getAttribute('data-theme')) : null;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Switch to the dark theme' }).click();
  await page.waitForTimeout(1500);
  const after = crashed || !inner ? null : await inner.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), fades: typeof document.startViewTransition })).catch(() => null);
  const outer = crashed ? null : await page.evaluate(() => document.documentElement.getAttribute('data-theme')).catch(() => null);
  t('/: the light and dark switch changes the page and its screen together, the screen with no crossfade of its own',
    !drawn && !crashed && !!after && !!outer && outer.endsWith('-dark') && after.theme === outer && after.theme !== before && after.fades === 'undefined',
    drawn || JSON.stringify({ crashed, before, outer, after }));
  await context.close();
}

// A story held back on arrival runs when asked: its button puts the story's dialog, menu or tooltip on top of the page.
if (t('some page has a story that waits behind its button', !!held, 'no page shows "Open the example": is anything still held back?')) {
  const w = workers[0];
  await openUrl(w.page, base + held); await ready(w.page, true);
  const button = w.page.locator('.site-demo .site-held button').first();
  await button.scrollIntoViewIfNeeded();
  await w.page.waitForTimeout(500);
  const pressed = await button.click({ timeout: 10000 }).then(() => '', (e) => String(e.message).split('\n')[0]);
  const opened = pressed || await w.page.waitForFunction(() => [...document.querySelectorAll('dialog, [popover]')].some((e) => e.matches(':modal, :popover-open')), null, { timeout: 5000 }).then(() => '', (e) => String(e.message).split('\n')[0]);
  t(`${held}: "Open the example" runs the story, which opens`, !opened, opened);
}

// The front page and the site's own pages: each draws, has one title, and links only to pages the site has.
{
  const w = workers[0];
  for (const at of ['/', ...OWN]) {
    w.errors.length = 0;
    const failed = await openUrl(w.page, base + at) || await ready(w.page, false);
    if (!t(`${at} opens`, !failed, failed)) continue;
    // A screen (site/src/Screen.tsx) is a story on a page of its own, in a frame: it has drawn once that page has content.
    const screens = w.page.locator('iframe.site-screen__page');
    let drawn = '';
    if (await screens.count()) {
      await screens.first().scrollIntoViewIfNeeded();
      drawn = await screens.first().contentFrame().locator('[data-site-frame] > *').first().waitFor({ timeout: 30000 }).then(() => '', (e) => String(e.message).split('\n')[0]);
    }
    if (at === '/showcase') t('/showcase shows a pattern as a screen', (await screens.count()) === 1 && !drawn, drawn || 'the page has no screen');
    else if (await screens.count()) t(`${at} draws its screen`, !drawn, drawn);
    await w.page.waitForTimeout(500);
    const seen = await w.page.evaluate(() => ({
      h1: [...document.querySelectorAll('main h1')].map((h) => h.textContent.trim()),
      broken: document.querySelectorAll('.site-broken').length,
      links: [...new Set([...document.querySelectorAll('main a[href]')].map((a) => a.getAttribute('href')))],
    }));
    const inScreen = await screens.count() ? await screens.first().contentFrame().locator('.site-broken').count() : 0;
    t(`${at} draws with no error`, !w.errors.length && !seen.broken && !inScreen, [...w.errors.slice(0, 3), seen.broken || inScreen ? 'part of the page shows an error instead of its content' : ''].filter(Boolean).join(' | '));
    t(`${at} has one title`, seen.h1.length === 1, `its h1s: ${JSON.stringify(seen.h1)}`);
    const lost = seen.links.filter((h) => h.startsWith('/') && !known.has(h.split('#')[0].replace(/\/$/, '') || '/'));
    t(`${at}: every link to another page of the site leads to one`, !lost.length, `no page for ${lost.slice(0, 8).join(', ')}`);
  }
  // The themes page is the six themes at once, whatever the site's own theme is.
  await openUrl(w.page, base + '/themes'); await ready(w.page, false);
  const shown = await w.page.evaluate(() => [...document.querySelectorAll('.site-theme')].map((x) => `${x.getAttribute('data-brand')}-${x.getAttribute('data-mode')}`));
  const all = tokens().color.themes.map((x) => x.id);
  t('/themes shows every theme in tokens.json', all.every((id) => shown.includes(id)) && shown.length === all.length, `it shows ${shown.join(', ') || 'none'}`);
  // A story's own page that names no story says so, rather than staying blank.
  const none = await openUrl(w.page, base + '/frame/patterns-nothing--default') || await ready(w.page, false);
  t('/frame/… with no such story says there is none', !none, none);
}

// The site's own frame: the front page, the site's own pages, an index and a page of each kind, in every theme and on
// a phone.
const axe = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const FRAME = ['/', ...OWN, '/components', '/components/button', '/foundations/colors', '/getting-started'];
const themes = tokens().color.themes.map((x) => x.id);
const w = workers[0];
for (const at of FRAME) {
  const failed = await openUrl(w.page, base + at) || await ready(w.page, pages.some((p) => p.path === at));
  if (!t(`${at} opens for the frame's checks`, !failed, failed)) continue;
  // An anatomy picture (docs/anatomy.tsx) turns inert, and so leaves the tab order, once its story has opened what it opens.
  await w.page.waitForFunction(() => [...document.querySelectorAll('.sb-anatomy__stage')].every((x) => x instanceof HTMLElement && x.inert), null, { timeout: 5000 }).catch(() => {});
  // The showcase's screen arrives after the page (its State select is disabled until then).
  if (at === '/showcase') await w.page.waitForSelector('.site-screen__page', { timeout: 10000 }).catch(() => {});
  await w.page.addScriptTag({ content: axe });
  for (const theme of themes) {
    await w.page.evaluate((th) => { const [brand, mode] = th.split('-'); window.Serupa.theme.set({ brand, mode }); }, theme);
    // A color still fading (a control that just woke, the theme's own change) is read mid-way and fails by chance:
    // wait for the transitions under way, two seconds at most.
    await w.page.evaluate(() => Promise.race([new Promise((done) => setTimeout(done, 2000)),
      Promise.all(document.getAnimations().filter((x) => x instanceof CSSTransition && x.playState === 'running').map((x) => x.finished.catch(() => {})))]));
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

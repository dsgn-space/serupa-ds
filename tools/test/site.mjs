// The docs site (site/, npm run site) stays in step with Storybook: both are made from the same .mdx pages,
// stories and types, and this fails a change that would leave the site behind.
// Before a browser: every block the pages import from Storybook has a version on the site (site/src/blocks.tsx),
// every component, block and pattern folder has a page, and every component's props can be read from its types.
// Then it builds the site and opens every page in a browser: the page draws its title and its examples with no
// error, every link to another page of the site leads to one, and no Storybook address is left unanswered. The
// site's own frame passes axe's WCAG 2.2 AA checks in every theme and doesn't scroll sideways at 320px (the
// stories inside the pages are Storybook's check's: tools/test/storybook.mjs).
//   node tools/test/site.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { PROJECT, PAGES, FOLDERS, browser, done, fail, inParallel, onlyComponents, openUrl, sitePageKey, read, report, tokens } from './lib.mjs';
import { sitePages } from '../site/pages.mjs';
import { siteRoutes } from '../site/head.mjs';
import { componentProps } from '../site/props.mjs';
import { components } from '../build/registry.mjs';

// What sticks out past the right edge of a 320px screen, outside anything that scrolls by itself: the failure names it,
// since it can show in one browser only (WebKit's /foundations/colors, 282px wider, Cross-browser on 28 Nov 2026).
const STICKS_OUT = () => {
  const name = (e) => e.tagName.toLowerCase() + (e.id ? `#${e.id}` : '') + [...e.classList].slice(0, 2).map((c) => `.${c}`).join('');
  const out = [...document.querySelectorAll('body *')].filter((e) => {
    const r = e.getBoundingClientRect();
    if (!r.width || r.right <= document.documentElement.clientWidth + 1 || getComputedStyle(e).position === 'fixed') return false;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return false;
    return true;
  });
  // The outermost ones: their children stick out because they do.
  return out.filter((e) => !out.includes(e.parentElement)).slice(0, 3)
    .map((e) => `${[e.parentElement, e].filter((x) => x && x !== document.body).map(name).join(' > ')} (${Math.round(e.getBoundingClientRect().width)}px)`).join(', ');
};

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
// The address it's built for, as SERUPA_SITE_URL gives it where the site goes live: in its canonical links and sitemap.
const SITE_URL = 'https://serupa.test';
const clear = () => fs.rmSync(out, { recursive: true, force: true });
process.on('exit', clear);
const built = spawnSync(process.execPath, [path.join(PROJECT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--config', path.join(PROJECT, 'tools', 'site', 'vite.config.mjs'), '--outDir', out, '--emptyOutDir', '--logLevel', 'error'],
  { cwd: PROJECT, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'development', SERUPA_SITE_URL: SITE_URL } });
if (!t('the site builds (npm run build-site)', built.status === 0, (built.stderr || built.stdout || '').trim().split('\n').slice(0, 12).join('\n')) || !fs.existsSync(path.join(out, 'index.html'))) {
  clear();
  done(report('Docs site', R));
  fail('The site did not build, so its pages can\'t be opened.');
}

// The site keeps only the utility classes its sources name (tools/site/vite.config.mjs): every page is checked for a
// class utilities.css has that the built stylesheet lost, which would leave that part of the page unstyled.
const classesIn = (css) => new Set([...css.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => m[1].replace(/\\(.)/g, '$1')));
const UTILITIES = classesIn(fs.readFileSync(path.join(PROJECT, 'src', 'styles', 'utilities.css'), 'utf8'));
const SHEETS = fs.readdirSync(path.join(out, 'assets')).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(out, 'assets', f), 'utf8'));
const STYLED = classesIn(SHEETS.join('\n'));
// Every page downloads the main stylesheet before it shows anything: with every utility class it was 2.4 MB.
const sheet = Math.max(...SHEETS.map((css) => Buffer.byteLength(css)));
t('the site\'s stylesheet is under 1 MB', sheet < 1024 * 1024, `it is ${(sheet / 1024 / 1024).toFixed(2)} MB`);

// Served as Cloudflare Pages serves it (tools/site/host.mjs): /a/b from a/b.html, the rewrites in _redirects (a
// story's frame is index.html), 404.html with a 404 for any other address, and the headers in _headers, the
// Content-Security-Policy among them, so a script or style the policy would block on the live site fails here.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const glob = (pattern) => new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
/** @type {{ match: RegExp, headers: [string, string][] }[]} */
const headerRules = [];
for (const line of (fs.existsSync(path.join(out, '_headers')) ? fs.readFileSync(path.join(out, '_headers'), 'utf8') : '').split('\n')) {
  if (/^\S/.test(line)) headerRules.push({ match: glob(line.trim()), headers: [] });
  else if (line.trim() && headerRules.length) { const i = line.indexOf(':'); headerRules.at(-1).headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
}
const rewrites = (fs.existsSync(path.join(out, '_redirects')) ? fs.readFileSync(path.join(out, '_redirects'), 'utf8') : '').split('\n')
  .map((l) => l.trim().split(/\s+/)).filter((l) => l[2] === '200').map(([from, to]) => ({ match: glob(from), to }));
const isFile = (f) => f.startsWith(out) && fs.existsSync(f) && fs.statSync(f).isFile();
// While true, the built files answer 404, as an old version's do once a new one is live, until the browser asks for a
// page again (which, on the host, would be the new version's, naming its own files).
let gone = false;
const server = http.createServer((req, res) => {
  const at = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/(.)\/$/, '$1');
  if (gone && !at.startsWith('/assets/')) gone = false;
  if (gone) {
    res.writeHead(404, { 'content-type': 'text/html' });
    fs.createReadStream(path.join(out, '404.html')).pipe(res);
    return;
  }
  const rewrite = rewrites.find((r) => r.match.test(at));
  const asked = rewrite ? rewrite.to : at;
  const f = [path.join(out, asked), path.join(out, asked + '.html'), path.join(out, asked, 'index.html')].find(isFile);
  const headers = { 'content-type': f ? TYPES[path.extname(f)] || 'application/octet-stream' : 'text/html' };
  for (const rule of headerRules) if (rule.match.test(at)) for (const [k, v] of rule.headers) headers[k] = v;
  res.writeHead(f ? 200 : 404, headers);
  fs.createReadStream(f ?? path.join(out, '404.html')).pipe(res);
}).listen(0);
const base = `http://127.0.0.1:${/** @type {import('node:net').AddressInfo} */ (server.address()).port}`;

// Each address has a page of its own, with the head a crawler or a link preview reads before any script runs.
const routes = siteRoutes(PROJECT);
const titles = new Map(routes.map((r) => [r.path, r.title]));
const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const headless = routes.filter((r) => {
  const f = path.join(out, r.path === '/' ? 'index.html' : r.path.slice(1) + '.html');
  const html = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  return !html.includes(`<title>${esc(r.title)}</title>`) || !html.includes(`<meta name="description" content="${esc(r.description)}"`)
    || !html.includes(`<link rel="canonical" href="${SITE_URL}${r.path}"`) || !html.includes(`<meta property="og:image" content="${SITE_URL}/og.png"`);
}).map((r) => r.path);
t(`each of the ${routes.length} addresses has a page with its own title, description, canonical address and preview picture`, !headless.length,
  `missing or not its own for ${headless.slice(0, 8).join(', ')}`);
const sitemap = fs.existsSync(path.join(out, 'sitemap.xml')) ? fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8') : '';
const unmapped = routes.filter((r) => !sitemap.includes(`<loc>${SITE_URL}${r.path}</loc>`)).map((r) => r.path);
const robots = fs.existsSync(path.join(out, 'robots.txt')) ? fs.readFileSync(path.join(out, 'robots.txt'), 'utf8') : '';
t('the sitemap lists every address, and robots.txt points to it', !unmapped.length && robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`),
  unmapped.length ? `not in sitemap.xml: ${unmapped.slice(0, 8).join(', ')}` : 'robots.txt has no Sitemap line');

// Each page's HTML holds the page itself (tools/site/prerender.mjs), so a visitor reads it before any script has run,
// and the browser takes it over rather than drawing it again (any mismatch is an error on the page, checked below).
const undrawn = routes.filter((r) => {
  const f = path.join(out, r.path === '/' ? 'index.html' : r.path.slice(1) + '.html');
  const html = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  return !/<div id="root"><div class="site/.test(html) || !/<h1[\s>]/.test(html);
}).map((r) => r.path);
t(`each of the ${routes.length} addresses has its page drawn in its HTML, with its title`, !undrawn.length, `empty or without an h1: ${undrawn.slice(0, 8).join(', ')}`);

const b = await browser();
// The site's own pages, which no .mdx gives it: the story, the themes side by side and the patterns as screens.
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
// SERUPA_ONLY (run.mjs --since, a narrowed pull request or queue group): only the pages of the components, blocks and
// patterns it covers, as Storybook's check does; a change beyond their folders (site/, this check, shared code) leaves
// it unset and opens every page. Every page took 6 of the checks' 15 minutes in each run (16 Nov).
const only = onlyComponents();
const opened = only ? pages.filter((p) => only.has(sitePageKey(p.file))) : pages;
if (only) console.log(`Opening the ${opened.length} of ${pages.length} pages SERUPA_ONLY covers`);
await inParallel(opened, workers, async (p, w) => {
  w.errors.length = 0;
  const failed = await openUrl(w.page, base + p.path) || await ready(w.page, true);
  if (!t(`${p.path} opens (${p.file})`, !failed, failed)) return;
  // The stories wake a moment after the page (site/src/blocks.tsx), and a late error is still an error. The article is
  // there before the browser takes the page over (it is drawn ahead of time), so the wait starts once every stage has
  // woken: before that an anatomy diagram may still be opening its story's popover to copy it, for a moment.
  await w.page.waitForFunction(() => !document.querySelector('[data-site-demo][inert]'), null, { timeout: 15000 }).catch(() => {});
  await w.page.waitForTimeout(500);
  const seen = await w.page.evaluate(() => ({
    h1: [...document.querySelectorAll('#article h1')].filter((h) => !h.closest('[data-site-demo]')).map((h) => h.textContent.trim()),
    broken: document.querySelectorAll('.site-broken').length,
    links: [...new Set([...document.querySelectorAll('#article a[href]')].filter((a) => !a.closest('[data-site-demo]')).map((a) => a.getAttribute('href')))],
    // A link to a part of this page whose id isn't on it (a section that is on another page now) goes nowhere.
    noTarget: [...new Set([...document.querySelectorAll('#article a[href^="#"]')].filter((a) => !a.closest('[data-site-demo]') && a.getAttribute('href').length > 1
      && !document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)))).map((a) => a.getAttribute('href')))],
    demos: document.querySelectorAll('.site-demo').length,
    api: !!document.getElementById('api'),
    // What sits on top of the page: an open modal dialog, or an open menu or panel. A tooltip shown beside its button
    // is left: it is a line of text that takes no focus.
    over: [...document.querySelectorAll('dialog, [popover]')].filter((e) => e.matches(':modal, :popover-open') && e.getAttribute('role') !== 'tooltip').map((e) => String(e.className || e.localName).split(' ')[0]),
    heldInFrame: document.querySelectorAll('.site-demo .site-held').length,
    classes: [...new Set([...document.querySelectorAll('[class]')].flatMap((e) => [...e.classList]))],
    // A reference inside an example (a label's for, an aria-labelledby, -describedby or -controls, a #link) that leads
    // to an element outside that example: a label that focuses another example's field, a link into another example.
    crossed: [...document.querySelectorAll('[data-site-demo]')].flatMap((demo) => [...demo.querySelectorAll('label[for], [aria-labelledby], [aria-describedby], [aria-controls], a[href^="#"]')].flatMap((el) => {
      const ids = el.matches('label[for]') ? [el.getAttribute('for')] : el.matches('a[href^="#"]') ? [decodeURIComponent(el.getAttribute('href').slice(1))]
        : ['aria-labelledby', 'aria-describedby', 'aria-controls'].flatMap((a) => (el.getAttribute(a) || '').split(/\s+/));
      return ids.filter((id) => { const to = id && document.getElementById(id); return to && !demo.contains(to); });
    })),
  }));
  t(`${p.path}: each example's labels and links stay inside it`, !seen.crossed.length, `they lead out of their example to #${[...new Set(seen.crossed)].slice(0, 6).join(', #')}`);
  const unstyled = seen.classes.filter((c) => UTILITIES.has(c) && !STYLED.has(c));
  t(`${p.path} has the utility classes it uses`, !unstyled.length, `the site's stylesheet left out ${unstyled.slice(0, 8).join(', ')}`);
  // A story that opens something as it arrives waits behind a button (site/src/blocks.tsx): the page itself comes first.
  t(`${p.path} opens nothing over the page on arrival`, !seen.over.length, `open on top of the page: ${[...new Set(seen.over)].join(', ')}`);
  if (seen.heldInFrame && !held) held = p.path;
  t(`${p.path} draws with no error`, !w.errors.length && !seen.broken, [...w.errors.slice(0, 3), seen.broken ? `${seen.broken} part(s) of the page show an error instead of their content` : ''].filter(Boolean).join(' | '));
  t(`${p.path} has one title`, seen.h1.length === 1, `its h1s: ${JSON.stringify(seen.h1)}`);
  const title = await w.page.title();
  t(`${p.path} keeps the title its address serves`, title === titles.get(p.path), `it sets "${title}", its page says "${titles.get(p.path)}" (tools/site/head.mjs)`);
  // On a 320px phone the page doesn't scroll sideways (WCAG 1.4.10); a wide example scrolls in its own box.
  await w.page.setViewportSize({ width: 320, height: 640 });
  // The frame swaps its sidebar for a drawer on the next render, and the examples lay out again after it: the page has
  // up to 2s to stop scrolling sideways, then is measured two frames later. Two frames alone weren't always enough on a
  // busy runner (/components/chat, 228px wider once on 14 Nov, fine on the next run).
  await w.page.waitForFunction(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth, null, { timeout: 2000, polling: 100 }).catch(() => {});
  const wide = await w.page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(document.documentElement.scrollWidth - document.documentElement.clientWidth)))));
  // Nor does an example's own box, unless what's wide scrolls by itself (a table, a grid, code): a story that shows a
  // narrow column gives it a max-width, not a width, so on a phone the column is the screen's.
  // What's drawn is measured, not the box's scroll width, which a closed popup waiting off to the side adds to.
  const boxes = await w.page.evaluate(() => [...document.querySelectorAll('#article [data-site-demo]')].map((d) => {
    if (getComputedStyle(d).overflowX === 'visible') return '';
    const box = d.getBoundingClientRect();
    const e = [...d.querySelectorAll('*')].find((e) => {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height || (r.left >= box.left - 1 && r.right <= box.right + 1) || getComputedStyle(e).position === 'fixed' || getComputedStyle(e).visibility === 'hidden') return false;
      for (let a = e.parentElement; a && a !== d; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return false;
      return true;
    });
    if (!e) return '';
    // The first part that leaves the box, by tag and class, with how far it reaches past it.
    const r = e.getBoundingClientRect();
    const past = Math.round(Math.max(box.left - r.left, r.right - box.right));
    return `${d.closest('section, [id]')?.querySelector('h2, h3')?.textContent || 'an example'} (${e.tagName.toLowerCase()}${[...e.classList].slice(0, 2).map((c) => `.${c}`).join('')}, ${past}px out)`;
  }).filter(Boolean));
  // A written table of three columns or more stands each row as a block on a phone, each cell after the first under
  // its column's name: squeezed into 320px instead, it broke words a letter a line (site.css, markdown.tsx).
  const squeezed = await w.page.evaluate(() => [...document.querySelectorAll('#article .site-table:not(.site-table--props) table')]
    .filter((t) => !t.closest('[data-site-demo]') && t.querySelectorAll('thead th').length >= 3)
    .filter((t) => [...t.querySelectorAll('tbody tr')].some((tr) => getComputedStyle(tr).display !== 'block'
      || [...tr.children].slice(1).some((td) => td.textContent.trim() && !td.getAttribute('data-label'))))
    .map((t) => [...t.querySelectorAll('thead th')].map((th) => th.textContent.trim()).join(' | ')));
  const sticks = wide > 0 ? await w.page.evaluate(STICKS_OUT) : '';
  await w.page.setViewportSize({ width: 1280, height: 800 });
  t(`${p.path} doesn't scroll sideways at 320px`, wide <= 0, `the page is ${wide}px wider than the screen: ${sticks}`);
  t(`${p.path}: no example scrolls sideways in its box at 320px`, !boxes.length, `wider than their box: ${boxes.join(', ')}`);
  t(`${p.path}: its written tables stack their rows at 320px`, !squeezed.length, `squeezed into the width: ${squeezed.slice(0, 3).join('; ')}`);
  // Storybook's own links have been pointed at the site's pages by now; one that is left has no page here.
  const lost = seen.links.filter((h) => h.startsWith('?path=') || (h.startsWith('/') && !known.has(h.split('#')[0].replace(/\/$/, '') || '/')));
  t(`${p.path}: every link to another page of the site leads to one`, !lost.length, `no page for ${lost.slice(0, 8).join(', ')}`);
  t(`${p.path}: every link to a part of the page finds it`, !seen.noTarget.length, `nothing on the page has the id of ${seen.noTarget.slice(0, 8).join(', ')}`);
  if (p.stories && /<(Primary|Stories|Canvas)\b/.test(read(p.file))) t(`${p.path} shows its stories`, seen.demos > 0, 'the page has no example in a frame');
  if (p.component && read(p.file).includes('<Controls')) t(`${p.path} shows its props`, seen.api, 'the page has no API table');
});

// With no script at all, a component page shows its text and its examples.
{
  const context = await b.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const page = await context.newPage();
  const failed = await openUrl(page, base + '/components/button');
  const seen = failed ? null : await page.evaluate(() => ({ h1: document.querySelector('#article h1')?.textContent?.trim() ?? '', demos: document.querySelectorAll('.site-demo [data-component="button"]').length }));
  t('/components/button shows its title and its examples with no script', !failed && seen?.h1 === 'Button' && seen.demos > 0, failed || `its h1 is "${seen?.h1}", with ${seen?.demos} buttons in its examples`);
  await context.close();
}

// A page scrolled before its scripts arrive stays where the reader is once the browser takes it over.
{
  const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  /** @type {() => void} */
  let go = () => {};
  const held = new Promise((resolve) => { go = () => resolve(undefined); });
  await page.route(/\/assets\/index-[^/]*\.js$/, async (route) => { await held; await route.continue(); });
  // Not to "domcontentloaded": that waits for the scripts, which are held.
  const failed = await page.goto(base + '/components/button', { waitUntil: 'commit' }).then(() => page.waitForSelector('#article h1')).then(() => '', (e) => String(e.message).split('\n')[0]);
  let before = 0, after = 0;
  if (!failed) {
    await page.evaluate(() => window.scrollTo(0, 900));
    before = await page.evaluate(() => window.scrollY);
    go();
    await ready(page, true);
    await page.waitForTimeout(500);
    after = await page.evaluate(() => window.scrollY);
  }
  go();
  t('/components/button stays where it was scrolled to as its scripts arrive', !failed && before > 0 && after === before, failed || `scrolled to ${before}, then moved to ${after}`);
  await context.close();
}

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

// A component's own focus ring stays its own on the page. The site's ring for its scrolling regions once took over
// CodeBlock's: drawn outside the code, which the block clips, it showed as one line along the top.
{
  const w = workers[0];
  await openUrl(w.page, base + '/components/codeblock'); await ready(w.page, true);
  const pre = w.page.locator('#article [data-site-demo] [role="region"][tabindex="0"]').first();
  await pre.scrollIntoViewIfNeeded();
  await w.page.waitForTimeout(500);   // the example draws once it is in view
  // After a key press, as a keyboard user reaches it, so the ring shows.
  await w.page.keyboard.press('Shift');
  await pre.focus();
  const offset = await pre.evaluate((el) => (el.matches(':focus-visible') ? parseFloat(getComputedStyle(el).outlineOffset) : NaN));
  t('/components/codeblock: the code\'s focus ring is drawn inside it, where the block doesn\'t clip it', offset < 0, Number.isNaN(offset) ? 'Tab didn\'t reach the code' : `the ring is drawn ${offset}px outside the code`);
}

// A component's page says what it is before it shows it: the guide's lead comes under the title, then the first
// example, once (site/src/blocks.tsx Primary, docs/blocks.tsx Guide).
{
  const w = workers[0];
  await openUrl(w.page, base + '/components/button'); await ready(w.page, true);
  const order = await w.page.evaluate(() => {
    const lead = [...document.querySelectorAll('#article p')].find((p) => p.textContent.startsWith('Triggers an action'));
    const demos = [...document.querySelectorAll('#article [data-site-demo]')];
    const copy = [...document.querySelectorAll('#article button')].find((b) => b.textContent.includes('Copy for AI'));
    const before = demos.filter((d) => copy && copy.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_PRECEDING);
    return { lead: !!lead, leadFirst: !!lead && !!demos[0] && !!(lead.compareDocumentPosition(demos[0]) & Node.DOCUMENT_POSITION_FOLLOWING), above: before.length };
  });
  t('/components/button: the lead comes before the first example, which shows once above the guide', order.lead && order.leadFirst && order.above === 1,
    !order.lead ? 'no lead paragraph' : !order.leadFirst ? 'the example comes before the lead' : `${order.above} examples above the guide`);
}

// The search finds a page by the other names it gives (a guide's "**Also called:**", a page's {/* also: … */}): someone who types "modal"
// or "snackbar" is looking for Dialog or Toast, and "dark mode" for Themes.
{
  const w = workers[0];
  await w.page.setViewportSize({ width: 1280, height: 900 });
  await openUrl(w.page, base + '/components/button'); await ready(w.page, true);
  await w.page.locator('.site-search').click();
  const missed = [];
  for (const [query, page] of [['modal', 'Dialog'], ['snackbar', 'Toast'], ['spinner', 'Loader'], ['collapsible', 'Accordion'], ['facepile', 'AvatarGroup'], ['dark mode', 'Themes'], ['validation', 'Forms'], ['i18n', 'Localization']]) {
    await w.page.keyboard.press('ControlOrMeta+A'); await w.page.keyboard.type(query); await w.page.waitForTimeout(150);
    const found = await w.page.evaluate(() => [...document.querySelectorAll('[role="option"]')].map((o) => o.firstChild?.textContent?.trim() || o.textContent.trim()));
    if (!found.some((f) => f.startsWith(page))) missed.push(`"${query}" lists ${found.slice(0, 3).join(', ') || 'nothing'}, not ${page}`);
  }
  await w.page.keyboard.press('Escape');
  t('the search finds a page by its other names', !missed.length, missed.join('; '));
}

// Printed, a component's page is its guide: the screen's controls (search, the theme switches, the section list,
// "On this page", each example's Show code and the guide's Copy for AI) are left out, and the bar's links wrap
// instead of running under each other on the narrower page.
{
  const w = workers[0];
  await w.page.setViewportSize({ width: 1280, height: 900 });
  await openUrl(w.page, base + '/components/button'); await ready(w.page, true);
  await w.page.emulateMedia({ media: 'print' });
  const shown = await w.page.evaluate(() => ['.site-search', '.site-side', '.site-aside', '.site-browse', '.site-demo__bar', '.sb-copy-guide']
    .filter((s) => [...document.querySelectorAll(s)].some((e) => e.getClientRects().length > 0)));
  await w.page.emulateMedia({ media: 'screen' });
  t('/components/button printed leaves out the screen\'s controls', !shown.length, `still printed: ${shown.join(', ')}`);
}

// Each card on the Components index shows its component, drawn small (site/src/Index.tsx Preview): every card gets
// one as it comes near the screen, none opens anything over the page, each fits its card's width, is hidden from
// assistive technology and out of the tab order, and a click on it opens the component's page.
{
  const w = workers[0];
  await w.page.setViewportSize({ width: 1280, height: 900 });
  await openUrl(w.page, base + '/components'); await ready(w.page, true);
  const height = await w.page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 800) { await w.page.evaluate((top) => window.scrollTo(0, top), y); await w.page.waitForTimeout(300); }
  await w.page.waitForTimeout(800);
  const cards = await w.page.evaluate(() => {
    const boxes = [...document.querySelectorAll('.site-card__preview')];
    const name = (b) => b.closest('li')?.querySelector('h2, h3')?.textContent;
    return {
      count: boxes.length,
      empty: boxes.filter((b) => !b.querySelector('.site-card__stage')?.childElementCount).map(name),
      shown: boxes.filter((b) => b.getAttribute('aria-hidden') !== 'true' || !(b instanceof HTMLElement && b.inert)).map(name),
      // What's drawn, not the stage, which is a page's width and centered.
      wide: boxes.filter((b) => { const r = b.getBoundingClientRect(); return [...b.querySelector('.site-card__stage')?.children ?? []].some((c) => { const s = c.getBoundingClientRect(); return s.width > 0 && (s.left < r.left - 1 || s.right > r.right + 1); }); }).map(name),
      over: [...document.querySelectorAll('dialog[open], :popover-open')].map((e) => e.className),
      // A bar or button a story pins to the screen's edge is pinned to its picture, and shows whole there.
      pinned: boxes.filter((b) => { const r = b.getBoundingClientRect(); return [...b.querySelectorAll('.srp-bottom-nav, .srp-fab, .srp-offline-banner')].some((e) => { const s = e.getBoundingClientRect(); return s.top < r.top - 1 || s.bottom > r.bottom + 1 || s.left < r.left - 1 || s.right > r.right + 1; }); }).map(name),
    };
  });
  t('/components: every component card shows a preview', cards.count >= 100 && !cards.empty.length, `${cards.count} previews; none drawn in ${cards.empty.join(', ')}`);
  t('/components: no preview opens a dialog, menu or tooltip over the page', !cards.over.length, cards.over.join(', '));
  t('/components: every preview fits its card\'s width', !cards.wide.length, cards.wide.join(', '));
  t('/components: a BottomNav, FAB or OfflineBanner shows whole in its picture, not past its edge', !cards.pinned.length, cards.pinned.join(', '));
  t('/components: the previews are pictures, hidden from assistive technology and out of the tab order', !cards.shown.length, cards.shown.join(', '));
  await w.page.evaluate(() => window.scrollTo(0, 0));
  // By where it is: Playwright won't click an inert element, which is the point.
  const at = await w.page.locator('.site-card__preview').first().boundingBox();
  if (at) await w.page.mouse.click(at.x + at.width / 2, at.y + at.height / 2);
  await w.page.waitForURL(/\/components\/[a-z]/, { timeout: 5000 }).catch(() => {});
  t('/components: a click on a preview opens its component\'s page', /\/components\/[a-z]/.test(w.page.url()), w.page.url());
}

// "On this page" is the contents' rail (site/src/Doc.tsx): pointing at it opens the list, inside the window even on a
// page with more headings than the window is tall.
{
  const w = workers[0];
  await w.page.setViewportSize({ width: 1280, height: 720 });
  await openUrl(w.page, base + '/components/button'); await ready(w.page, true);
  const rail = w.page.locator('.site-aside .srp-toc--rail');
  const hovered = await rail.hover({ timeout: 10000 }).then(() => '', (e) => String(e.message).split('\n')[0]);
  await w.page.waitForTimeout(500);
  const panel = hovered ? null : await w.page.evaluate(() => {
    const el = document.querySelector('.site-aside .srp-toc__panel');
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
  // A link in "On this page" glides to its heading: the sticky bar's own focus scroll doesn't jump there first.
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(base + '/components/button');
  const link = page.locator('.site-aside .srp-toc__panel a').last();
  // Down the page a screen a frame and back first: WebKit's software rendering (CI) paints each part of a long page slowly
  // the first time, which held the main thread for the whole glide, so the first frame it drew was the end (16 Nov).
  // Once painted, it glides as Chromium does. This measures the glide, not the first paint.
  await page.evaluate(() => new Promise((done) => {
    const step = () => { if (scrollY + innerHeight < document.documentElement.scrollHeight - 1) { scrollBy(0, innerHeight); requestAnimationFrame(step); } else { scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(done)); } };
    requestAnimationFrame(step);
  }));
  const glide = await page.locator('.site-aside .srp-toc--rail').hover({ timeout: 15000 }).then(() => link.evaluate((a) => new Promise((done) => {
    const ys = [], t0 = performance.now();
    const tick = () => { ys.push(Math.round(window.scrollY)); if (performance.now() - t0 < 1500) requestAnimationFrame(tick); else done(ys); };
    a.addEventListener('click', () => requestAnimationFrame(tick), { once: true });
    /** @type {HTMLElement} */ (a).click();
  }))).catch((e) => String(e.message).split('\n')[0]);
  const end = Array.isArray(glide) ? glide[glide.length - 1] : 0;
  t('/components/button: a link in "On this page" glides to its heading rather than jumping there',
    Array.isArray(glide) && end > 720 && glide.filter((y) => y > 0 && y < end).length >= 2,   // WebKit glides in ~300ms: two or three frames on CI
    Array.isArray(glide) ? 'the page was at ' + glide.slice(0, 8).join(', ') + ' on the first frames, and ended at ' + end : glide);
  await context.close();
}

// A story held back on arrival runs when asked: its button puts the story's dialog, menu or tooltip on top of the page.
// A narrowed run may open no page with one: it leaves this to the runs that open every page.
if ((held || !only) && t('some page has a story that waits behind its button', !!held, 'no page shows "Open the example": is anything still held back?')) {
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
    // The showcase draws its screen once the pattern's stories have loaded, after the page is ready (WebKit can take longer).
    if (at === '/showcase') await screens.first().waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
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
    const title = await w.page.title();
    t(`${at} keeps the title its address serves`, title === titles.get(at), `it sets "${title}", its page says "${titles.get(at)}" (tools/site/head.mjs)`);
    const lost = seen.links.filter((h) => h.startsWith('/') && !known.has(h.split('#')[0].replace(/\/$/, '') || '/'));
    t(`${at}: every link to another page of the site leads to one`, !lost.length, `no page for ${lost.slice(0, 8).join(', ')}`);
  }
  // The themes page is the themes at once, whatever the site's own theme is.
  await openUrl(w.page, base + '/themes'); await ready(w.page, false);
  const shown = await w.page.evaluate(() => [...document.querySelectorAll('.site-theme')].map((x) => `${x.getAttribute('data-brand')}-${x.getAttribute('data-mode')}`));
  const all = tokens().color.themes.map((x) => x.id);
  t('/themes shows every theme in tokens.json', all.every((id) => shown.includes(id)) && shown.length === all.length, `it shows ${shown.join(', ') || 'none'}`);
  // A story's own page that names no story says so, rather than staying blank.
  const none = await openUrl(w.page, base + '/frame/patterns-nothing--default') || await ready(w.page, false);
  t('/frame/… with no such story says there is none', !none, none);
  // An address with no page is a real 404, and still shows the site's own "no page here". In a page of its own: the
  // frame page above can still be navigating, which Firefox and WebKit let interrupt this one (the Cross-browser run).
  const lost404 = await w.page.context().newPage();
  const response = await lost404.goto(base + '/components/no-such-component');
  const missing = await ready(lost404, false);
  const said = await lost404.evaluate(() => document.querySelector('main h1')?.textContent?.trim() ?? '');
  await lost404.close();
  t('an address with no page answers 404 and says there is no page', response?.status() === 404 && !missing && said === 'Page not found',
    `status ${response?.status()}, heading "${said}"${missing ? `, ${missing}` : ''}`);
}

// A tab opened before a new version went live asks for files the host no longer has (each version's files are named by
// their content) as soon as it moves to another page: it loads the page again, the new version's, rather than saying
// "Something went wrong".
{
  const context = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const failed = await openUrl(page, base + '/') || await ready(page, false);
  gone = true;
  await page.evaluate(() => /** @type {HTMLAnchorElement} */ (document.querySelector('a[href$="/getting-started"]')).click());
  const shown = failed || await ready(page, true);
  const broken = await page.evaluate(() => document.body.textContent?.includes('Something went wrong'));
  gone = false;
  t('a page still opens when the version it was loaded from is gone (it loads the new one)', !shown && !broken,
    shown || 'it says "Something went wrong"');
  await context.close();
}

// The Countdown page's live example ticks on the site, as it would in an app (its other examples hold a fixed time).
{
  const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const failed = await openUrl(page, base + '/components/countdown') || await ready(page, true);
  const read = () => page.evaluate(() => document.querySelector('#article')?.textContent ?? '');
  const before = failed ? '' : await read();
  await page.waitForTimeout(2200);
  t('/components/countdown has an example that ticks', !failed && before !== await read(), failed || 'nothing on the page changed in two seconds');
  await context.close();
}

// The search finds a component by another name it's known by (its README's "**Also called:**" line): "snackbar" is a
// Toast, "modal" a Dialog, so someone who comes from another system needn't know Serupa's word first.
{
  const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const failed = await openUrl(page, base + '/getting-started') || await ready(page, true);
  for (const [word, name] of [['snackbar', 'Toast'], ['modal', 'Dialog']]) {
    let found = '';
    if (!failed) {
      await page.getByRole('button', { name: /^Search/ }).first().click();
      const box = page.getByRole('combobox');
      await box.fill(word);
      found = await page.getByRole('option').first().innerText({ timeout: 2000 }).catch(() => '');
      await page.keyboard.press('Escape');
    }
    t(`the search finds ${name} by "${word}"`, !failed && found.split('\n')[0].trim() === name, failed || `its first result is "${found.split('\n')[0] || 'nothing'}"`);
  }
  await context.close();
}

// A page that shows no changes, no test list and no token explorer doesn't download the changelog, the tests' names
// or every component's tokens, the heaviest data in the docs: they load when a section that reads them is drawn
// (docs/blocks.tsx), not with every page.
{
  const changelog = (/[A-Za-z][A-Za-z ,]{40,}/.exec(fs.readFileSync(path.join(PROJECT, 'CHANGELOG.md'), 'utf8').split('\n').find((l) => /^- .{80,}/.test(l)) ?? '')?.[0] ?? '').slice(0, 40);
  // The longest description of a component token (<Name>.tokens.json), which only the token explorer shows.
  const said = [];
  for (const n of fs.readdirSync(path.join(PROJECT, 'src', 'components'))) {
    const dir = path.join(PROJECT, 'src', 'components', n);
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.tokens.json'))) {
      JSON.stringify(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), (k, v) => { if (k === '$description' && typeof v === 'string') said.push(v); return v; });
    }
  }
  const tokens = said.map((d) => /[A-Za-z][A-Za-z ,]{40,}/.exec(d)?.[0] ?? '').sort((a, c) => c.length - a.length)[0]?.slice(0, 40) ?? '';
  const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  /** @type {Promise<string>[]} */
  const scripts = [];
  page.on('response', (r) => { if (r.url().endsWith('.js')) scripts.push(r.text().catch(() => '')); });
  const failed = await openUrl(page, base + '/foundations/colors') || await ready(page, true);
  await page.waitForTimeout(1000);
  const loaded = await Promise.all(scripts);
  for (const [what, marker] of [['the changelog', changelog], ['every component\'s tokens', tokens]]) {
    const carried = loaded.some((js) => js.includes(marker));
    t(`/foundations/colors doesn't download ${what}`, !failed && marker.length === 40 && !carried,
      failed || (marker.length < 40 ? `nothing of ${what} to look for` : `a script it loads carries ${what} ("${marker}")`));
  }
  await context.close();
}

// On a phone, a page doesn't jump as it arrives: the footer once showed under the loading page, then jumped away when
// the page came (a layout shift of 0.11; under 0.1 is good, by Core Web Vitals). The CPU runs four times slower, as on
// a mid-range phone, so the loading page shows for long enough to be measured.
{
  const context = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await context.newCDPSession(page).then((cdp) => cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })).catch(() => {});
  await page.addInitScript(() => {
    /** @type {any} */ (window).__shift = 0;
    new PerformanceObserver((list) => { for (const e of /** @type {any[]} */ (list.getEntries())) if (!e.hadRecentInput) /** @type {any} */ (window).__shift += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const failed = await openUrl(page, base + '/components/button') || await ready(page, true);
  await page.waitForTimeout(1000);
  const shift = await page.evaluate(() => /** @type {any} */ (window).__shift);
  t('/components/button doesn\'t jump as it arrives on a phone (layout shift under 0.1)', !failed && shift < 0.1, failed || `layout shift ${shift.toFixed(3)}`);
  await context.close();
}

// The site's own frame: the front page, the site's own pages, an index and a page of each kind, in every theme and on
// a phone.
const axe = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const FRAME = ['/', ...OWN, '/components', '/components/button', '/foundations/colors', '/getting-started'];
const themes = tokens().color.themes.map((x) => x.id);
// A page to each worker: one after the other, the eight pages in every theme took three of the check's six minutes (16 Nov).
await inParallel(FRAME, workers, async (at, w) => {
  const failed = await openUrl(w.page, base + at) || await ready(w.page, pages.some((p) => p.path === at));
  if (!t(`${at} opens for the frame's checks`, !failed, failed)) return;
  // An anatomy picture (docs/anatomy.tsx) turns inert, and so leaves the tab order, once its story has opened what it opens.
  await w.page.waitForFunction(() => [...document.querySelectorAll('.sb-anatomy__stage')].every((x) => x instanceof HTMLElement && x.inert), null, { timeout: 5000 }).catch(() => {});
  // The showcase's screen arrives after the page (its State select is disabled until then).
  if (at === '/showcase') await w.page.waitForSelector('.site-screen__page', { timeout: 10000 }).catch(() => {});
  // Run in the page from outside rather than added as a <script>, which the site's Content-Security-Policy blocks.
  await w.page.evaluate(axe);
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
});
const w = workers[0];
await w.page.setViewportSize({ width: 320, height: 640 });
for (const at of FRAME) {
  const failed = await openUrl(w.page, base + at) || await ready(w.page, pages.some((p) => p.path === at));
  if (failed) { t(`${at} opens at 320px`, false, failed); continue; }
  const wide = await w.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  t(`${at} doesn't scroll sideways at 320px`, wide <= 0, `the page is ${wide}px wider than the screen: ${wide > 0 ? await w.page.evaluate(STICKS_OUT) : ''}`);
}

for (const x of workers) await x.context.close();
await b.close();
server.close();
clear();
done(report('Docs site', R));

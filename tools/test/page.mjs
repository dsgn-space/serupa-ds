// Page groundwork: responsive variants, base.css, theme.js (automatic dark mode), the CSS trimmer (bin/serupa-purge.mjs)
// and the plain-page sample in Getting started.
//   node tools/test/page.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { ENGINE, PROJECT, writePage, browser, cleanup, report, done, inParallel, serve } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const b = await browser();

// 1. Responsive variants apply from their breakpoint up
const RESP = '<div id="r" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-6"><i>1</i><i>2</i></div><p id="h" class="hidden md:block">x</p><p id="s" class="text-sm lg:text-xl">x</p>';
const respUrl = writePage('responsive.html', RESP);
const expect = [[390, 1, 'none', 14], [640, 2, 'none', 14], [768, 3, 'block', 14], [1024, 4, 'block', 20], [1280, 5, 'block', 20], [1536, 6, 'block', 20]];
for (const [w, cols, disp, fs_] of expect) {
  const p = await b.newPage({ viewport: { width: w, height: 600 } });
  await p.goto(respUrl);
  const r = await p.evaluate(() => ({ cols: getComputedStyle(document.getElementById('r')).gridTemplateColumns.split(' ').length, disp: getComputedStyle(document.getElementById('h')).display, fs: parseFloat(getComputedStyle(document.getElementById('s')).fontSize) }));
  t(`responsive at ${w}px: ${cols} columns, hidden→${disp}, text ${fs_}px`, r.cols === cols && r.disp === disp && r.fs === fs_, JSON.stringify(r));
  await p.close();
}

// 2. base.css
{
  const p = await b.newPage();
  await p.goto(writePage('base.html', '<h1 id="h1">Title</h1><a id="a" href="#">link</a><input id="in" placeholder="Name"><img id="img" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%222000%22 height=%2210%22/%3E"><p id="u" class="m-4 font-mono">utility wins</p>', { base: true }));
  const r = await p.evaluate(() => {
    const cs = (id, pr) => getComputedStyle(document.getElementById(id)).getPropertyValue(pr);
    const tmp = document.createElement('div'); document.body.appendChild(tmp);
    const col = (n) => { tmp.style.color = `var(${n})`; return getComputedStyle(tmp).color; };
    return { bodyBg: getComputedStyle(document.body).backgroundColor, surface: (() => { tmp.style.backgroundColor = 'var(--surface)'; return getComputedStyle(tmp).backgroundColor; })(), bodyColor: getComputedStyle(document.body).color, text: col('--text'),
      bodyMargin: getComputedStyle(document.body).margin, font: getComputedStyle(document.body).fontFamily, h1Margin: cs('h1', 'margin-top'), link: cs('a', 'color'), primary: col('--primary'),
      inputFont: cs('in', 'font-family'), ph: getComputedStyle(document.getElementById('in'), '::placeholder').color, placeholder: col('--placeholder'),
      imgW: document.getElementById('img').getBoundingClientRect().width, vw: document.body.clientWidth, boxSizing: cs('in', 'box-sizing'),
      utilMargin: cs('u', 'margin-top'), utilFont: cs('u', 'font-family'), scheme: getComputedStyle(document.documentElement).colorScheme };
  });
  t('base.css: body uses surface, text and font-sans, no margin', r.bodyBg === r.surface && r.bodyColor === r.text && r.bodyMargin === '0px' && /Inter/.test(r.font), JSON.stringify(r));
  t('base.css: no default heading margins, links in primary, border-box sizing', r.h1Margin === '0px' && r.link === r.primary && r.boxSizing === 'border-box');
  t('base.css: form fields use the page font and the placeholder color', /Inter/.test(r.inputFont) && r.ph === r.placeholder, `${r.inputFont} ${r.ph} vs ${r.placeholder}`);
  t('base.css: images never overflow their container', r.imgW <= r.vw, `${r.imgW} > ${r.vw}`);
  t('base.css: utility classes win over the defaults', r.utilMargin === '16px' && /ui-monospace/.test(r.utilFont));
  t('base.css: light themes use color-scheme light', r.scheme === 'light', r.scheme);
  await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'violet-dark'));
  t('base.css: dark themes use color-scheme dark (native controls, scrollbars)', (await p.evaluate(() => getComputedStyle(document.documentElement).colorScheme)) === 'dark');
  await p.close();
}

// 3. theme.js (with reduced motion, so a switch is synchronous; the crossfade it makes otherwise is checked after)
for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ colorScheme: scheme, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(writePage('theme.html', '<p>x</p>', { theme: true, base: true, htmlAttrs: 'data-brand="emerald" data-mode="auto"' }));
  t(`theme.js: data-mode="auto" follows the system (${scheme})`, (await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === `emerald-${scheme}`);
  await ctx.close();
}
{
  // A brand made with serupa-brand works once the page names it in data-brands; a brand it doesn't name is ignored.
  const ctx = await b.newContext({ colorScheme: 'dark' });
  const p = await ctx.newPage();
  await p.goto(writePage('theme-brands.html', '<p>x</p>', { theme: true, htmlAttrs: 'data-brands="acme ocean" data-brand="acme" data-mode="auto"' }));
  const own = await p.evaluate(() => [document.documentElement.getAttribute('data-theme'), Serupa.theme.set({ brand: 'ocean', mode: 'light' }).theme, Serupa.theme.set({ brand: 'nope' }).theme, Serupa.theme.set({ brand: 'violet' }).theme]);
  await p.evaluate(() => Serupa.theme.reset());
  t('theme.js: brands named in data-brands can be chosen, and others still can\'t', own.join() === 'acme-dark,ocean-light,ocean-light,violet-light', own.join());
  await ctx.close();
}
{
  // A page that sets data-theme itself keeps it, under a dark system too, and reset() goes back to it.
  const ctx = await b.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(writePage('theme-own.html', '<p>x</p>', { theme: true, htmlAttrs: 'data-theme="violet-dark"' }));
  const own = await p.evaluate(() => [document.documentElement.getAttribute('data-theme'), Serupa.theme.get().mode, Serupa.theme.set({ mode: 'light' }).theme, Serupa.theme.reset().theme]);
  t('theme.js: a page\'s own data-theme="violet-dark" is its default, not replaced by blue', own.join() === 'violet-dark,dark,violet-light,violet-dark', own.join());
  await ctx.close();
}
{
  const ctx = await b.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const url = writePage('theme.html', '<p>x</p>', { theme: true, htmlAttrs: 'data-brand="blue" data-mode="auto"' });
  await p.goto(url);
  await p.evaluate(() => { window.__seen = []; Serupa.theme.onChange((i) => window.__seen.push(i.theme)); });
  await p.emulateMedia({ colorScheme: 'dark' }); await p.waitForTimeout(100);
  t('theme.js: switches live when the system changes', (await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'blue-dark');
  t('theme.js: onChange hears the system switch', (await p.evaluate(() => window.__seen)).includes('blue-dark'));
  const r = await p.evaluate(() => Serupa.theme.set({ brand: 'violet', mode: 'light' }));
  t('theme.js: set() changes brand and mode', r.theme === 'violet-light' && (await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'violet-light');
  await p.reload();
  t('theme.js: the choice is remembered after a reload', (await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'violet-light');
  await p.evaluate(() => Serupa.theme.set({ brand: 'nope', mode: 'nope' }));
  t('theme.js: unknown values are ignored', (await p.evaluate(() => Serupa.theme.get().theme)) === 'violet-light');
  const back = await p.evaluate(() => Serupa.theme.reset());
  t('theme.js: reset() returns to the page default', back.theme === 'blue-dark' && back.mode === 'auto');
  await ctx.close();
}
{
  // After the first paint, a switch crossfades the page in one View Transition typed "serupa-theme", and onChange
  // hears it once the new theme is on; the first paint and reduced motion switch at once, with none.
  const ctx = await b.newContext({ colorScheme: 'light' });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__vt = [];
    const start = document.startViewTransition?.bind(document);
    if (start) document.startViewTransition = (o) => { window.__vt.push(typeof o === 'function' ? 'fn' : (o.types || []).join()); return start(o); };
  });
  await p.goto(writePage('theme-fade.html', '<p>x</p>', { theme: true, base: true, htmlAttrs: 'data-brand="blue" data-mode="light"' }));
  const first = await p.evaluate(() => [document.documentElement.getAttribute('data-theme'), window.__vt.length]);
  await p.evaluate(() => { window.__seen = []; Serupa.theme.onChange((i) => window.__seen.push([i.theme, document.documentElement.getAttribute('data-theme')].join())); Serupa.theme.set({ mode: 'dark' }); });
  await p.waitForFunction(() => window.__seen.length > 0);
  const after = await p.evaluate(() => [window.__vt.join('|'), window.__seen.join('|'), getComputedStyle(document.body).backgroundColor]);
  t('theme.js: the first paint sets the theme without a transition', first.join() === 'blue-light,0', first.join());
  t('theme.js: a switch crossfades the page in one View Transition (type serupa-theme), onChange after it', after.join(' ; ') === 'serupa-theme ; blue-dark,blue-dark ; rgb(24, 24, 27)', after.join(' ; '));
  await ctx.close();
  const still = await b.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const q = await still.newPage();
  await q.addInitScript(() => { window.__vt = 0; const start = document.startViewTransition?.bind(document); if (start) document.startViewTransition = (o) => { window.__vt++; return start(o); }; });
  await q.goto(writePage('theme-fade.html', '<p>x</p>', { theme: true, base: true, htmlAttrs: 'data-brand="blue" data-mode="light"' }));
  const now = await q.evaluate(() => { Serupa.theme.set({ mode: 'dark' }); return [document.documentElement.getAttribute('data-theme'), window.__vt].join(); });
  t('theme.js: with reduced motion a switch is at once, with no transition', now === 'blue-dark,0', now);
  await still.close();
  // Switches in a row end on the last, with no uncaught errors from the crossfades they skip (GR115); one made during
  // the app's own View Transition is at once, and leaves the app's to run.
  const row = await b.newContext({ colorScheme: 'light' });
  const r = await row.newPage();
  const errors = [];
  r.on('pageerror', (e) => errors.push(e.message));
  r.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await r.goto(writePage('theme-fade.html', '<p>x</p>', { theme: true, base: true, htmlAttrs: 'data-brand="blue" data-mode="light"' }));
  await r.evaluate(() => { window.__seen = []; Serupa.theme.onChange((i) => window.__seen.push(i.theme)); Serupa.theme.set({ mode: 'dark' }); Serupa.theme.set({ brand: 'violet' }); Serupa.theme.set({ mode: 'light' }); });
  await r.waitForFunction(() => !document.activeViewTransition && document.documentElement.getAttribute('data-theme') === 'violet-light');
  await r.waitForTimeout(100);
  const seen = await r.evaluate(() => window.__seen.join());
  t('theme.js: switches in a row end on the last, each theme heard once, with no uncaught errors', seen.endsWith('violet-light') && new Set(seen.split(',')).size === seen.split(',').length && !errors.length, `${seen} ; ${errors.join(' | ')}`);
  const own = await r.evaluate(async () => {
    const vt = document.startViewTransition(() => new Promise((ok) => setTimeout(ok, 50)));
    await new Promise((ok) => requestAnimationFrame(() => ok(null)));
    Serupa.theme.set({ mode: 'dark' });
    const at = document.documentElement.getAttribute('data-theme');
    const ran = await vt.ready.then(() => 'ran', () => 'skipped');
    await vt.finished.catch(() => {});
    return [at, ran].join();
  });
  t('theme.js: a switch during the app\'s own View Transition is at once and leaves it to run', own === 'violet-dark,ran', own);
  await row.close();
}
{
  // <meta name="theme-color"> follows the page's surface in all six themes, so a phone's bars change with the mode.
  // Before any stylesheet it is the token value (white, zinc-900); a page's own theme-color meta is left alone.
  const ctx = await b.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(writePage('theme-color.html', '<p>x</p>', { theme: true, base: true, htmlAttrs: 'data-brand="blue" data-mode="auto"' }));
  const tints = await p.evaluate(() => ['blue', 'violet', 'emerald'].flatMap((brand) => ['light', 'dark'].map((mode) => {
    Serupa.theme.set({ brand, mode });
    const m = document.querySelectorAll('meta[name="theme-color"]');
    return [m.length, m[0] && m[0].getAttribute('content'), getComputedStyle(document.body).backgroundColor].join(' ');
  })));
  t('theme.js: theme-color is the page\'s surface in all six themes', tints.every((x, k) => x === (k % 2 ? '1 rgb(24, 24, 27) rgb(24, 24, 27)' : '1 rgb(255, 255, 255) rgb(255, 255, 255)')), tints.join(', '));
  await p.evaluate(() => Serupa.theme.reset());
  await p.goto(writePage('theme-color-bare.html', '<p>x</p>', { theme: true, bundle: 'none.css', htmlAttrs: 'data-mode="dark"', extraHead: '<script>window.__early = document.querySelector(\'meta[name="theme-color"]\').content;</script>' }));
  const early = await p.evaluate(() => window.__early);
  t('theme.js: before the stylesheets, theme-color is the token value (zinc-900 in dark)', early === '#18181b', early);
  const own = writePage('theme-color-own.html', '<p>x</p>', { theme: true, base: true, htmlAttrs: 'data-mode="dark"' });
  fs.writeFileSync(fileURLToPath(own), fs.readFileSync(fileURLToPath(own), 'utf8').replace('<script src="../dist/theme.js">', '<meta name="theme-color" content="#123456"><script src="../dist/theme.js">'));
  await p.goto(own);
  const kept = await p.evaluate(() => [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.getAttribute('content')).join());
  t('theme.js: a theme-color meta the page wrote itself is left as it is', kept === '#123456', kept);
  await ctx.close();
}
{
  // A choice saved by 4.x (as "diki-theme") is kept, and reset() forgets it for good.
  const ctx = await b.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  // A reload straight after a storage write could start before the browser held the write, and read the old value
  // (it failed that way on a busy runner). Another page of the same origin sees the write only once the browser has
  // it, so each reload waits until that page reads the new value. It reads rather than waits for a storage event:
  // headless WebKit never sent the event to the other page, over file:// or http. Over http, so the two pages share
  // an origin (WebKit gives each file:// page one of its own).
  const srv = serve(PROJECT);
  const web = (file) => `${srv.base}/${path.relative(PROJECT, fileURLToPath(file)).split(path.sep).join('/')}`;
  const watch = await ctx.newPage();
  await watch.goto(web(writePage('theme-watch.html', '<p>x</p>')));
  const stored = (key) => watch.evaluate((k) => localStorage.getItem(k), key);
  const held = (key, before) => watch.waitForFunction(([k, b]) => localStorage.getItem(k) !== b, [key, before]);
  await p.goto(web(writePage('theme.html', '<p>x</p>', { theme: true, htmlAttrs: 'data-brand="blue" data-mode="auto"' })));
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('diki-theme', JSON.stringify({ brand: 'violet', mode: 'dark' })); });
  await held('diki-theme', null);
  await p.reload();
  const moved = await p.evaluate(() => [document.documentElement.getAttribute('data-theme'), localStorage.getItem('diki-theme'), !!localStorage.getItem('serupa-theme')].join());
  t('theme.js: a theme chosen on 4.x ("diki-theme") is kept and moved to "serupa-theme"', moved === 'violet-dark,,true', moved);
  await held('serupa-theme', null);
  const before = await stored('serupa-theme');
  await p.evaluate(() => Serupa.theme.reset());
  await held('serupa-theme', before);
  await p.reload();
  const after = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
  t('theme.js: after reset(), a reload stays on the page default (the 4.x choice doesn\'t come back)', after === 'blue-light', after);
  await ctx.close();
  srv.close();
}

{
  // DX1: loaded twice (an inline copy and the file), the second copy returns early, so the first's onChange still
  // hears set(); and another tab's localStorage.clear() (a storage event with key null) is followed like a reset.
  const ctx = await b.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(writePage('theme-twice.html', '<p>x</p>', { theme: true, htmlAttrs: 'data-brand="blue" data-mode="auto"', extraHead: '<script>window.__first = Serupa.theme; window.__heard = []; Serupa.theme.onChange(function (i) { window.__heard.push(i.theme); });</script><script src="../dist/theme.js"></script>' }));
  const twice = await p.evaluate(() => { Serupa.theme.set({ brand: 'violet', mode: 'dark' }); return [Serupa.theme === window.__first, window.__heard.join(), window.__first.get().theme]; });
  t('theme.js: loaded twice, the first copy keeps running the page and its onChange hears set()', twice.join() === 'true,violet-dark,violet-dark', twice.join());
  const other = await ctx.newPage();
  await other.goto(writePage('theme-twice.html', '<p>x</p>', { theme: true, htmlAttrs: 'data-brand="blue" data-mode="auto"' }));
  await other.evaluate(() => localStorage.clear());
  await p.waitForTimeout(100);
  const cleared = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
  t('theme.js: another tab clearing storage brings this tab back to the page default', cleared === 'blue-light', cleared);
  await ctx.close();
}

{
  // GD5, GF4: a theme switch changes every control's colors at once (each one's color transition finishes at once),
  // while motion started in the same tick runs on: a menu fading out as "Dark" is picked, a switch thumb sliding.
  const p = await b.newPage();
  const rows = '<p class="row" style="transition: background-color 150ms, color 150ms; background: var(--surface-muted); color: var(--text)">Row</p>'.repeat(20)
    + '<div class="menu" style="transition: opacity 150ms, scale 150ms; background: var(--surface)">Menu</div>'
    + '<div class="thumb" style="width: 16px; transition: translate 150ms, background-color 150ms; background: var(--surface-muted)"></div>'
    + '<p class="still" style="background: var(--surface-muted)">Row</p>';
  await p.goto(writePage('theme-switch.html', rows, { theme: true, htmlAttrs: 'data-brand="blue" data-mode="light"', extraHead: '<link rel="stylesheet" href="../tokens.css">' }));
  const r = await p.evaluate(() => {
    document.querySelector('.menu').style.cssText += ';opacity: 0; scale: 0.95';   // closing as "Dark" is picked
    void getComputedStyle(document.querySelector('.menu')).opacity;   // its fade has started
    Serupa.theme.set({ mode: 'dark' });
    document.querySelector('.thumb').style.translate = '16px';
    const bg = (s) => getComputedStyle(document.querySelector(s)).backgroundColor;
    return [document.getAnimations().map((a) => a.transitionProperty).sort().join(' '), bg('.row') === bg('.still')];
  });
  t('theme.js: switching theme changes every color at once, while a menu fading and a switch sliding in the same tick run on', r.join() === 'opacity scale translate,true', r.join());
  await p.close();
}

// 3b. debug.js (204): off until ?serupa-debug; then each component is outlined, pointing at one names it with its
// classes, state and the component tokens set on it, it survives a reload in the tab, and Escape turns it off. It
// shares window.Serupa with the components and theme.js.
{
  const body = '<div id="root"></div><script>ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Serupa.Button, { id: "b", style: { "--button-radius": "0px" } }, "Save"));</script>';
  const url = writePage('debug.html', body, { react: true, theme: true, extraHead: '<script src="../dist/debug.js"></script>' });
  const p = await b.newPage();
  await p.goto(url);
  await p.waitForSelector('#b');
  t('debug.js: off by default, and window.Serupa keeps the components and theme', await p.evaluate(() => !document.getElementById('serupa-debug') && !Serupa.debug.isOn() && typeof Serupa.Button === 'object' && typeof Serupa.theme.get === 'function'));
  await p.goto(url + '?serupa-debug');
  await p.waitForSelector('#b');
  t('debug.js: ?serupa-debug turns it on and outlines each component', await p.evaluate(() => Serupa.debug.isOn() && getComputedStyle(document.getElementById('b')).outlineStyle === 'dashed'));
  await p.hover('#b');
  const panel = await p.evaluate(() => document.getElementById('serupa-debug-panel')?.textContent || '');
  t('debug.js: pointing at a Button names it, its variant and size, and the token set on it', /button/.test(panel) && /primary/.test(panel) && /size-md/.test(panel) && /--button-radius\s*0px/.test(panel), panel);
  const info = await p.evaluate(() => { const i = Serupa.debug.inspect(document.querySelector('#b .dk-btn__label')); return i && { c: i.component, m: i.modifiers, r: i.tokens['--button-radius'], h: i.height }; });
  t('debug.js: inspect() finds the component from an element inside it', info?.c === 'button' && info.m.includes('primary') && info.r === '0px' && info.h === 32, JSON.stringify(info));
  await p.goto(url);
  await p.waitForSelector('#b');
  t('debug.js: it stays on for the tab after the address loses ?serupa-debug', await p.evaluate(() => Serupa.debug.isOn()));
  await p.keyboard.press('Escape');
  t('debug.js: Escape turns it off and takes its outline and panel away', await p.evaluate(() => !Serupa.debug.isOn() && !document.getElementById('serupa-debug') && !document.getElementById('serupa-debug-panel') && sessionStorage.getItem('serupa-debug') === null));
  await p.close();
}

// 3c. debug.js's contrast guard (203): the pairs foundation.mjs checks per theme, checked as drawn on the page, so an
// app's token override that breaks one shows: in the console when it turns on, and in the panel on the component.
{
  const body = '<div id="root"></div><section id="s" style="--on-primary: #8aa4ff"></section><script>ReactDOM.createRoot(document.getElementById("s")).render(React.createElement(Serupa.Button, { id: "b" }, "Save"));</script>';
  const url = writePage('debug-contrast.html', body, { react: true, extraHead: '<script src="../dist/debug.js"></script>' });
  const p = await b.newPage();
  const warned = [];
  p.on('console', (m) => { if (m.type() === 'warning' && /Serupa debug/.test(m.text())) warned.push(m.text()); });
  await p.goto(url);
  await p.waitForSelector('#b');
  const page = await p.evaluate(() => Serupa.debug.contrast());
  t('debug.js: contrast() checks every pair on the page, and Serupa\'s own tokens pass them all', page.length >= 40 && page.every((c) => c.ok), JSON.stringify(page.filter((c) => !c.ok)));
  const body1 = page.find((c) => c.foreground === '--text' && c.background === '--surface');
  t('debug.js: a ratio is the one WCAG gives (text on surface, over 4.5:1)', body1 && body1.ratio > 4.5 && body1.ratio <= 21 && body1.needs === 4.5, JSON.stringify(body1));
  const scoped = await p.evaluate(() => Serupa.debug.contrast(document.getElementById('b')).filter((c) => !c.ok).map((c) => `${c.foreground} on ${c.background}`));
  t('debug.js: a token set on a section counts on the components in it (light on-primary fails on primary)', scoped.includes('--on-primary on --primary'), scoped.join(', '));
  await p.evaluate(() => { document.documentElement.style.setProperty('--text-muted', 'rgb(0 0 0 / 0.2)'); Serupa.debug.on(); });
  t('debug.js: turning it on warns in the console about each pair that fails on the page, a translucent color as it looks', warned.length === 1 && /--text-muted on --surface/.test(warned[0]) && !/--on-primary/.test(warned[0]), warned.join(' | '));
  await p.hover('#b');
  const panel = await p.evaluate(() => document.getElementById('serupa-debug-panel')?.textContent || '');
  t('debug.js: the panel lists the pairs that fail on the component it points at, and not again the ones the console named', /low contrast/.test(panel) && /--on-primary on --primary/.test(panel) && !/--text-muted/.test(panel), panel);
  await p.evaluate(() => Serupa.debug.off());
  await p.close();
}

// 4. serupa-purge keeps exactly what a page needs
{
  const dir = path.join(PROJECT, '.test-tmp');
  fs.mkdirSync(dir, { recursive: true });
  const SAMPLE = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-surface-muted"><div class="rounded-lg shadow-md p-4 bg-surface text-sm md:text-base divide-y divide-border"><p class="py-2">a</p><p class="py-2">b</p></div><input class="h-control-md px-3 border border-field-border bg-field rounded-md placeholder-placeholder" placeholder="Name"><div class="bg-linear-to-r from-blue-500 to-violet-500 h-4 -translate-x-1/2 ring-2 ring-focus-ring ring-offset-2 animate-spin"></div><p class="hidden lg:block text-primary">x</p></div>';
  fs.writeFileSync(path.join(dir, 'sample.html'), SAMPLE);
  const out = path.join(dir, 'min.css');
  execFileSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-purge.mjs'), path.join(dir, 'sample.html'), '-o', out, '--css', path.join(PROJECT, 'dist', 'bundle.css')], { stdio: 'ignore' });
  // Component styles (dk-*) are always kept and grow with every component, so the size check trims utilities.css,
  // the part purge decides on.
  const full = fs.statSync(path.join(PROJECT, 'dist', 'bundle.css')).size, small = fs.statSync(out).size;
  const outU = path.join(dir, 'min-utilities.css');
  execFileSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-purge.mjs'), path.join(dir, 'sample.html'), '-o', outU, '--css', path.join(PROJECT, 'dist', 'utilities.css')], { stdio: 'ignore' });
  const fullU = fs.statSync(path.join(PROJECT, 'dist', 'utilities.css')).size, smallU = fs.statSync(outU).size;
  t(`serupa-purge: ${(small / 1024).toFixed(0)} KB instead of ${(full / 1024).toFixed(0)} KB (utilities: ${(smallU / 1024).toFixed(0)} KB of ${(fullU / 1024).toFixed(0)} KB)`, smallU > 0 && smallU < fullU / 20 && full - small > (fullU - smallU) * 0.9);   // the bundle sheds what the utilities shed
  const snap = async (bundle, w) => {
    const p = await b.newPage({ viewport: { width: w, height: 500 } });
    await p.goto(writePage(`purge-${w}.html`, SAMPLE, { bundle, extraHead: '<style>*{animation-play-state:paused!important;animation-delay:0s!important}</style>' }));   // a spinning element would be caught mid-turn
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(100);   // sizes depend on the font being loaded
    const r = await p.evaluate(() => [...document.querySelectorAll('body *')].map((e) => { const s = getComputedStyle(e); const o = []; for (let i = 0; i < s.length; i++) o.push(s[i] + ':' + s.getPropertyValue(s[i])); return o.sort().join(';'); }));
    await p.close(); return r;
  };
  t('serupa-purge: keeps the keyframes the page animates with', /@keyframes spin\b/.test(fs.readFileSync(out, 'utf8')));
  for (const w of [390, 1280]) {
    const a = await snap('../dist/bundle.css', w), c = await snap('min.css', w);
    const d = []; a.forEach((x, i) => { if (x !== c[i]) { const A = x.split(';'), C = c[i].split(';'); A.forEach((y, j) => { if (y !== C[j]) d.push(i + ' ' + y + ' ≠ ' + C[j]); }); } });
    t(`serupa-purge: the page renders identically with the trimmed CSS (${w}px)`, !d.length, d.slice(0, 4).join(' | '));
  }
}

// 5. serupa-purge --components: each component's preview, named as its only source, renders identically with the
// styles of every component it doesn't name dropped (components.json says which ones it needs)
{
  const dir = path.join(PROJECT, '.test-tmp');
  const comps = fs.readdirSync(path.join(PROJECT, 'src', 'components')).filter((c) => fs.existsSync(path.join(PROJECT, 'src', 'components', c, 'preview.html')));
  const styles = async (url) => {
    const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
    await p.goto(url);
    await p.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load())); await document.fonts.ready; });
    // Settled: React has mounted (the page renders it from a script) and nothing changed for 300 ms, which also
    // covers previews that open a popover on a 50 ms timer. A fixed wait wasn't enough on a busy CI runner, where
    // the trimmed page was compared while still half-rendered.
    await p.waitForLoadState('networkidle');
    await p.evaluate(() => new Promise((resolve) => {
      let quiet = setTimeout(done, 300);
      const mo = new MutationObserver(() => { clearTimeout(quiet); quiet = setTimeout(done, 300); });
      const cap = setTimeout(done, 10000);
      function done() { mo.disconnect(); clearTimeout(cap); requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))); }
      mo.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    }));
    const r = await p.evaluate(() => [...document.querySelectorAll('body *')].map((e) => { const s = getComputedStyle(e); const o = []; for (let i = 0; i < s.length; i++) o.push(s[i] + ':' + s.getPropertyValue(s[i])); return e.className + ' ' + o.sort().join(';'); }));
    await p.close(); return r;
  };
  // Four at a time: every page is written first (writePage rewrites the shared tokens file, which a page loading
  // meanwhile could read half-written), then the trims run as parallel processes and the pages load in parallel tabs.
  const jobs = comps.map((c) => {
    const src = path.join(PROJECT, 'src', 'components', c, 'preview.html');
    const html = fs.readFileSync(src, 'utf8');
    const head = (html.match(/<style>[\s\S]*?<\/style>/) || [''])[0] + '<style>*{animation:none!important;transition:none!important}</style>';
    const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
    const out = path.join(dir, `purge-${c}.css`);
    return { c, src, out, full: writePage(`pc-full-${c}.html`, body, { react: true, extraHead: head }), min: writePage(`pc-min-${c}.html`, body, { react: true, extraHead: head, bundle: `purge-${c}.css` }) };
  });
  // Tabs at once in Chromium only: Firefox and WebKit give focus to one tab of a browser, so a preview that opens a
  // panel or shows a focus ring in another tab differs (the cross-browser run, 8 Nov 2026).
  const four = ENGINE === 'chromium' ? [0, 1, 2, 3] : [0];
  await inParallel(jobs, four, ({ src, out }) => new Promise((resolve, reject) => execFile(process.execPath, [path.join(PROJECT, 'bin', 'serupa-purge.mjs'), src, '-o', out, '--css', path.join(PROJECT, 'dist', 'bundle.css'), '--components'], (err) => (err ? reject(err) : resolve()))));
  const diffs = await inParallel(jobs, four, async ({ full: fullUrl, min }) => {
    const a = await styles(fullUrl), z = await styles(min);
    const d = []; a.forEach((x, i) => { if (x !== z[i]) { const A = x.split(';'), Z = (z[i] || '').split(';'); A.forEach((y, j) => { if (y !== Z[j]) d.push(`${i} ${y} ≠ ${Z[j]}`); }); } });
    if (a.length !== z.length) d.unshift(`${a.length} elements with the full CSS, ${z.length} with the trimmed`);
    return d;
  });
  const bundleSize = fs.statSync(path.join(PROJECT, 'dist', 'bundle.css')).size;
  const full = bundleSize * jobs.length, small = jobs.reduce((n, { out }) => n + fs.statSync(out).size, 0);
  jobs.forEach(({ c }, i) => t(`serupa-purge --components: ${c}'s preview renders identically`, !diffs[i].length, diffs[i].slice(0, 3).join(' | ')));
  t(`serupa-purge --components: ${comps.length} previews average ${(small / comps.length / 1024).toFixed(0)} KB of CSS`, small < full);
}

// 6. The plain-page sample in docs/GettingStarted.mdx works as written: served from the project over HTTP (a font
// preload is fetched with CORS, which file:// doesn't do), it's in standards mode, UTF-8, titled, draws its Button in
// Inter inside main, gets a theme-color, fetches the font once (the preload is the one the page uses) and logs nothing.
{
  const html = fs.readFileSync(path.join(PROJECT, 'docs', 'GettingStarted.mdx'), 'utf8').match(/^## Or on a plain page\s+```html\n([\s\S]*?)```/m)?.[1] || '';
  const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url || '/', 'http://x').pathname);
    const file = path.join(PROJECT, url);
    if (url === '/') { res.setHeader('content-type', 'text/html'); res.end(html); }
    else if (!file.startsWith(PROJECT + path.sep) || !fs.existsSync(file)) { res.statusCode = 404; res.end(); }
    else { res.setHeader('content-type', TYPES[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', () => r(undefined)));
  const port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  const p = await b.newPage();
  const logged = [], fonts = [];
  p.on('console', (m) => logged.push(`${m.type()}: ${m.text()}`));
  p.on('pageerror', (e) => logged.push(e.message));
  p.on('request', (q) => { if (q.url().endsWith('.woff2')) fonts.push(new URL(q.url()).pathname); });
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForFunction(() => !!document.querySelector('#root button'), null, { timeout: 10000 }).catch(() => undefined);
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => {
    const btn = document.querySelector('main button');
    return { mode: document.compatMode, charset: document.characterSet, title: document.title, button: btn?.textContent, font: btn && getComputedStyle(btn).fontFamily.split(',')[0], themeColor: !!document.querySelector('meta[name="theme-color"]')?.getAttribute('content') };
  });
  await p.close();
  t('Getting started\'s plain page: standards mode, UTF-8, a title, its Button in Inter inside main, a theme-color', html && r.mode === 'CSS1Compat' && r.charset === 'UTF-8' && r.title && r.button === 'Hello' && r.font === 'Inter' && r.themeColor, html ? JSON.stringify(r) : 'no ```html block under "Or on a plain page"');
  t('Getting started\'s plain page: the font is fetched once, and nothing is logged', fonts.length === 1 && !logged.length, JSON.stringify({ fonts, logged }));

  // 7. The same page and the Back button (FEC6): it leaves and comes back through the back/forward cache (nothing in
  // theme.js, serupa.iife.js or the components keeps it out: no unload listener), and a theme picked in another tab
  // while it was away is applied on return even when the storage event never reaches it, as a cached page may miss
  // it (here theme.js never hears one). Chromium only, and its full build: the headless shell has no
  // back/forward cache, and Playwright turns it off unless asked.
  if (ENGINE === 'chromium') {
    const base = `http://127.0.0.1:${port}`;
    const full = await chromium.launch({ channel: 'chromium', ignoreDefaultArgs: ['--disable-back-forward-cache'] });
    const ctx = await full.newContext();
    const q = await ctx.newPage();
    // This page hears no storage events at all, as a cached page may not (Chromium does deliver them on return).
    await q.addInitScript(() => {
      const add = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (type, ...rest) { if (this === window && type === 'storage') return; return add.call(this, type, ...rest); };
    });
    await q.goto(`${base}/`);
    await q.waitForFunction(() => !!document.querySelector('#root button'), null, { timeout: 10000 }).catch(() => undefined);
    const before = await q.evaluate(() => { window.__stayed = true; return document.documentElement.getAttribute('data-theme'); });
    await q.goto(`${base}/?away`);
    const other = await ctx.newPage();
    await other.goto(`${base}/?away`);
    await other.evaluate(() => localStorage.setItem('serupa-theme', JSON.stringify({ brand: 'violet', mode: 'dark' })));
    await other.close();
    // Chromium hands another tab's write to a renderer's copy of the storage a moment later, not at once: on a loaded
    // machine the cached page could come back, read the old choice in pageshow and keep it (a flake in CI, blue-light →
    // blue-light). Wait until this tab's own renderer sees the write, as a real user's would long before pressing Back.
    await q.waitForFunction(() => (localStorage.getItem('serupa-theme') || '').includes('violet'), null, { timeout: 10000 }).catch(() => undefined);
    await q.goBack({ waitUntil: 'commit' });
    await q.waitForFunction(() => document.readyState === 'complete', null, { timeout: 10000 }).catch(() => undefined);
    // Since the crossfade (30), a theme change while the page is shown goes through a View Transition, which sets
    // data-theme in its update callback a frame or so later, not in pageshow itself: wait for it (or time out).
    await q.waitForFunction(() => document.documentElement.getAttribute('data-theme') === 'violet-dark', null, { timeout: 10000 }).catch(() => undefined);
    const back = await q.evaluate(() => ({ cached: window.__stayed === true, reasons: /** @type {any} */ (performance.getEntriesByType('navigation')[0]).notRestoredReasons, theme: document.documentElement.getAttribute('data-theme') }));
    await full.close();
    t('Getting started\'s plain page: Back brings it from the back/forward cache (nothing blocks it)', back.cached && !back.reasons, JSON.stringify(back.reasons));
    t('theme.js: back from the cache, a theme picked in another tab meanwhile is applied though its storage event never arrived', before !== 'violet-dark' && back.theme === 'violet-dark', `${before} → ${back.theme}`);
  }
  server.close();
}

await b.close();
cleanup();
done(report('Page groundwork', R));

// Docs site: builds it from the design system, then opens every page on desktop (1280px) and phone
// (390px) widths, in light and dark mode, and checks for broken links, script errors, outside
// requests, duplicate ids and sideways scrolling.
//   node tools/test/docs.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { HERE, PROJECT, browser, report } from './lib.mjs';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'diki-docs-'));
execFileSync('python3', ['-I', path.join(HERE, '..', 'docs', 'build.py'), PROJECT, out], { stdio: 'ignore' });
const pages = fs.readdirSync(out).filter((f) => f.endsWith('.html'));
const b = await browser();
const R = [];
for (const mode of ['light', 'dark']) {
  for (const w of [1280, 390]) {
    for (const f of pages) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
      await ctx.addInitScript((m) => { try { localStorage.setItem('dds-theme', 'blue-' + m); } catch (e) {} }, mode);
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      p.on('request', (r) => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:')) errs.push('outside request ' + u); });
      p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      await p.goto('file://' + path.join(out, f));
      await p.waitForTimeout(200);
      const r = await p.evaluate(() => ({ ov: document.documentElement.scrollWidth - innerWidth, links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')), ids: [...document.querySelectorAll('[id]')].map((e) => e.id), mode: document.documentElement.getAttribute('data-mode') }));
      const bad = r.links.filter((h) => !/^(https?:|mailto:|#)/.test(h) && !fs.existsSync(path.join(out, h.split('#')[0])));
      const dup = r.ids.filter((x, i) => r.ids.indexOf(x) !== i);
      const problems = [];
      if (r.ov > 0) problems.push(`scrolls sideways by ${r.ov}px`);
      if (errs.length) problems.push(errs.slice(0, 2).join('; '));
      if (bad.length) problems.push('broken links: ' + bad.slice(0, 3).join(', '));
      if (dup.length) problems.push('duplicate ids: ' + dup.slice(0, 3).join(', '));
      if (mode === 'dark' && r.mode !== 'dark') problems.push('dark mode not applied');
      R.push({ name: `${f} · ${w}px · ${mode}`, ok: !problems.length, detail: problems.join(' | ') });
      await ctx.close();
    }
  }
}
// the Changelog page lists every release in CHANGELOG.md, newest first, each with its own anchor
{
  const ctx = await b.newContext(); const p = await ctx.newPage();
  await p.goto('file://' + path.join(out, 'changelog.html')); await p.waitForTimeout(100);
  const want = [...fs.readFileSync(path.join(PROJECT, 'CHANGELOG.md'), 'utf8').matchAll(/^## \[([^\]]+)\](?: - (\S+))?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].filter((m) => m[1] !== 'Unreleased').map((m) => m[1]);
  const got = await p.evaluate(() => [...document.querySelectorAll('.cl-rel .cl-ver')].map((e) => e.textContent));
  const toc = await p.evaluate(() => [...document.querySelectorAll('.cl-toc a')].every((a) => document.getElementById(a.getAttribute('href').slice(1))));
  const unrel = await p.evaluate(() => !!document.getElementById('vunreleased') || [...document.querySelectorAll('.cl-toc a')].some((a) => /unreleased/i.test(a.textContent)));
  R.push({ name: 'Changelog page: every released version in CHANGELOG.md, in order, with working version links, and no Unreleased section', ok: JSON.stringify(got) === JSON.stringify(want) && toc && got.length > 0 && !unrel, detail: JSON.stringify({ got, want }) });
  await ctx.close();
}
// the Badge playground and demos
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.join(out, 'badge.html')); await p.waitForTimeout(400);
  const st = () => p.evaluate(() => { const e = document.querySelector('#bpg-preview .dk-badge'); return { cls: e ? e.className : '', text: e ? e.textContent : '', rm: e && e.querySelector('.dk-badge__remove') ? e.querySelector('.dk-badge__remove').getAttribute('aria-label') : '', code: document.getElementById('bpg-code').textContent, note: document.getElementById('bpg-note').textContent, empty: !e }; });
  const a = await st();
  R.push({ name: 'Badge playground: starts as <Badge>Active</Badge>, subtle and neutral', ok: a.code === '<Badge>Active</Badge>' && /dk-badge--subtle/.test(a.cls) && /tone-neutral/.test(a.cls), detail: JSON.stringify(a) });
  await p.check('#bpg-form input[name="variant"][value="solid"]', { force: true }); await p.selectOption('#bpg-tone', 'violet'); await p.check('#bpg-remove', { force: true }); await p.check('#bpg-dot', { force: true }); await p.waitForTimeout(50);
  const c = await st();
  R.push({ name: 'Badge playground: variant, tone, dot and onRemove update the preview, the code and the remove button\'s name', ok: /dk-badge--solid/.test(c.cls) && /tone-violet/.test(c.cls) && c.rm === 'Remove Active' && c.code === '<Badge variant="solid" tone="violet" dot onRemove={() => remove("Active")}>Active</Badge>', detail: JSON.stringify(c) });
  await p.fill('#bpg-count', '120'); await p.waitForTimeout(50);
  const n = await st();
  R.push({ name: 'Badge playground: a count shows "99+" past max, drops the label and remove button, and the code', ok: n.text === '99+' && /dk-badge--count/.test(n.cls) && !n.rm && n.code === '<Badge variant="solid" tone="violet" count={120} />', detail: JSON.stringify(n) });
  await p.fill('#bpg-count', '0'); await p.waitForTimeout(50);
  const z = await st();
  R.push({ name: 'Badge playground: a count of 0 shows nothing and the note says why', ok: z.empty && /showZero/.test(z.note), detail: JSON.stringify(z) });
  await p.fill('#bpg-count', ''); await p.check('#bpg-click', { force: true }); await p.check('#bpg-loading', { force: true }); await p.waitForTimeout(50);
  const ck = await p.evaluate(() => { const e = document.querySelector('#bpg-preview .dk-badge'); return { tag: e.tagName, cls: e.className, busy: e.getAttribute('aria-busy'), loader: !!e.querySelector('.dk-badge__loader .dk-loader'), rm: !!e.querySelector('.dk-badge__remove'), code: document.getElementById('bpg-code').textContent }; });
  R.push({ name: 'Badge playground: onClick makes a button (dropping onRemove) and loading adds the ring, in the preview and the code', ok: ck.tag === 'BUTTON' && /dk-badge--interactive/.test(ck.cls) && /dk-badge--loading/.test(ck.cls) && ck.busy === 'true' && ck.loader && !ck.rm && ck.code === '<Badge variant="solid" tone="violet" dot onClick={open} loading>Active</Badge>', detail: JSON.stringify(ck) });
  await p.check('#bpg-disabled', { force: true }); await p.waitForTimeout(50);
  const dz = await p.evaluate(() => { const e = document.querySelector('#bpg-preview .dk-badge'); return { dis: e.disabled, op: getComputedStyle(e).opacity, code: document.getElementById('bpg-code').textContent }; });
  R.push({ name: 'Badge playground: disabled (with onClick) disables the button at 50% and adds the prop to the code', ok: dz.dis && dz.op === '0.5' && / disabled>Active<\/Badge>$/.test(dz.code), detail: JSON.stringify(dz) });
  await p.uncheck('#bpg-click', { force: true }); await p.uncheck('#bpg-loading', { force: true }); await p.uncheck('#bpg-disabled', { force: true }); await p.fill('#bpg-label', ''); await p.waitForTimeout(50);
  const ip = await p.evaluate(() => { const e = document.querySelector('#bpg-preview .dk-badge'); return { cls: e && e.className, kids: e && e.children.length, code: document.getElementById('bpg-code').textContent, note: document.getElementById('bpg-note').textContent }; });
  R.push({ name: 'Badge playground: dot with an empty label shows the indicator dot, its code and a note', ok: /dk-badge--indicator/.test(ip.cls) && ip.kids === 0 && ip.code === '<Badge dot tone="violet" />' && /indicator/.test(ip.note), detail: JSON.stringify(ip) });
  await p.check('#bpg-ping', { force: true }); await p.waitForTimeout(50);
  const pp = await p.evaluate(() => { const e = document.querySelector('#bpg-preview .dk-badge'); return { cls: e.className, anim: getComputedStyle(e, '::after').animationName, code: document.getElementById('bpg-code').textContent }; });
  await p.fill('#bpg-label', 'Live'); await p.waitForTimeout(50);
  const pl = await p.evaluate(() => { const e = document.querySelector('#bpg-preview .dk-badge'); return { anim: getComputedStyle(e.querySelector('.dk-badge__dot'), '::after').animationName, code: document.getElementById('bpg-code').textContent }; });
  R.push({ name: 'Badge playground: ping makes the indicator and a labelled dot ping, and adds ping to the code', ok: /dk-badge--ping/.test(pp.cls) && pp.anim === 'ping' && pp.code === '<Badge dot tone="violet" ping />' && pl.anim === 'ping' && / dot ping[ >]/.test(pl.code) && />Live<\/Badge>$/.test(pl.code), detail: JSON.stringify([pp, pl]) });
  await p.uncheck('#bpg-ping', { force: true });
  await p.fill('#bpg-label', 'Active'); await p.waitForTimeout(50);
  const sts = await p.evaluate(() => { const c = [...document.querySelectorAll('.canvas')].find((x) => /Try it/.test(x.textContent)); return { btn: c.querySelectorAll('button.dk-badge--interactive').length, a: c.querySelectorAll('a.dk-badge--interactive').length, ld: c.querySelectorAll('.dk-badge--loading').length, dis: c.querySelectorAll('button.dk-badge:disabled').length }; });
  R.push({ name: 'Badge page: the States demo shows rest, hover, active, focus, loading and disabled for each style, and live clickable badges', ok: sts.btn === 20 && sts.a === 1 && sts.ld === 3 && sts.dis === 3, detail: JSON.stringify(sts) });
  const demo = await p.evaluate(() => ({ n: document.querySelectorAll('.canvas .dk-badge').length, rm: document.querySelectorAll('.canvas .dk-badge__remove').length, tones: new Set([...document.querySelectorAll('.canvas .dk-badge')].map((e) => e.dataset.tone)).size, ind: document.querySelectorAll('.canvas .dk-badge--indicator').length }));
  R.push({ name: 'Badge page: demos show every tone, the extras, removable tags and indicator dots', ok: demo.tones === 23 && demo.rm === 3 && demo.n > 40 && demo.ind >= 9, detail: JSON.stringify(demo) });
  R.push({ name: 'Badge page: no script errors', ok: !errs.length, detail: errs.join(' | ') });
  await ctx.close();
}
// the Loader playground: props change the preview and the code; the delay is shown on Replay
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.join(out, 'loader.html')); await p.waitForTimeout(500);
  const st = () => p.evaluate(() => { const e = document.querySelector('#spg-preview .dk-loader'); return { cls: e.className, role: e.getAttribute('role'), name: e.getAttribute('aria-label'), hidden: e.getAttribute('aria-hidden'), words: (e.querySelector('.dk-loader__label') || {}).textContent || '', svg: !!e.querySelector('svg'), code: document.getElementById('spg-code').textContent, dark: document.getElementById('spg-stage').classList.contains('is-dark'), note: document.getElementById('spg-note').textContent }; });
  const a = await st();
  R.push({ name: 'Loader playground: starts as <Loader />, a ring named "Loading"', ok: a.code === '<Loader />' && a.svg && a.role === 'progressbar' && a.name === 'Loading' && /dk-loader--ring/.test(a.cls) && !/waiting/.test(a.cls), detail: JSON.stringify(a) });
  const pick = (n, v) => p.check(`#spg-form input[name="${n}"][value="${v}"]`, { force: true });
  await pick('variant', 'text'); await pick('size', 'lg'); await pick('tone', 'inverse'); await p.fill('#spg-label', 'Thinking…'); await p.waitForTimeout(50);
  const c = await st();
  R.push({ name: 'Loader playground: variant, size, tone and label update the preview at once, the code and a dark stage for inverse', ok: c.code === '<Loader variant="text" size="lg" tone="inverse" label="Thinking…" />' && /dk-loader--text/.test(c.cls) && /size-lg/.test(c.cls) && /dk-loader--inverse/.test(c.cls) && c.words === 'Thinking…' && !/waiting/.test(c.cls) && c.dark, detail: JSON.stringify(c) });
  await pick('delay', '1000'); await p.waitForTimeout(100);
  const w = await st(); await p.waitForTimeout(1100); const sh = await st();
  R.push({ name: 'Loader playground: a new delay waits before showing (space kept), then shows; the code says delay={1000}', ok: /waiting/.test(w.cls) && w.hidden === 'true' && !/waiting/.test(sh.cls) && sh.role === 'progressbar' && /delay=\{1000\}/.test(sh.code), detail: JSON.stringify([w.cls, sh.cls, sh.code]) });
  await p.fill('#spg-label', ''); await pick('tone', 'primary'); await p.waitForTimeout(50);
  const e = await st();
  R.push({ name: 'Loader playground: an empty label is decorative and the note says so; primary on text explains it stays in the text color', ok: e.hidden === 'true' && e.role === null && e.words === 'Loading' && /decorative/.test(e.note) && /stays in the text color/.test(e.note) && /label=""/.test(e.code), detail: JSON.stringify(e) });
  await pick('variant', 'spokes'); await p.waitForTimeout(50);
  const spk = await p.evaluate(() => ({ n: document.querySelectorAll('#spg-preview line.dk-loader__spoke').length, anim: getComputedStyle(document.querySelector('#spg-preview svg')).animationName, code: document.getElementById('spg-code').textContent }));
  R.push({ name: 'Loader playground: spokes shows eight ticking spokes and the code', ok: spk.n === 8 && spk.anim === 'dk-loader-tick' && /^<Loader variant="spokes"/.test(spk.code), detail: JSON.stringify(spk) });
  await pick('variant', 'pixel'); await p.waitForTimeout(50);
  const pxp = await p.evaluate(() => ({ n: document.querySelectorAll('#spg-preview rect.dk-loader__px').length, code: document.getElementById('spg-code').textContent, anim: (() => { const r = document.querySelector('#spg-preview rect.dk-loader__px'); return r ? getComputedStyle(r).animationName : ''; })() }));
  R.push({ name: 'Loader playground: pixel shows the nine-square grid with its wave, and the code', ok: pxp.n === 9 && pxp.anim === 'dk-loader-pixel' && pxp.code === '<Loader variant="pixel" size="lg" tone="primary" label="" delay={1000} />', detail: JSON.stringify(pxp) });
  const patShown = await p.evaluate(() => !document.getElementById('spg-pattern-f').hidden);
  await pick('pattern', 'random'); await p.waitForTimeout(50);
  const pr = await p.evaluate(() => ({ cls: document.querySelector('#spg-preview .dk-loader').className, code: document.getElementById('spg-code').textContent, anim: getComputedStyle(document.querySelector('#spg-preview rect.dk-loader__px--r4')).animationName }));
  R.push({ name: 'Loader playground: pattern shows for pixel; random lights the squares at random and adds pattern="random" to the code', ok: patShown && /pattern-random/.test(pr.cls) && pr.anim === 'dk-loader-pixel' && /pattern="random"/.test(pr.code), detail: JSON.stringify(pr) });
  await pick('pattern', 'spiral'); await p.check('#spg-glow', { force: true }); await p.waitForTimeout(50);
  const sg = await p.evaluate(() => ({ cls: document.querySelector('#spg-preview .dk-loader').className, code: document.getElementById('spg-code').textContent, n: document.querySelectorAll('#spg-form input[name="pattern"]').length, step: document.querySelector('#spg-preview rect.dk-loader__px--s8') ? 'c' : '', filt: getComputedStyle(document.querySelector('#spg-preview svg')).filter }));
  R.push({ name: 'Loader playground: nine patterns and a glow toggle for pixel; spiral with glow updates the preview and the code', ok: sg.n === 9 && /pattern-spiral/.test(sg.cls) && /dk-loader--glow/.test(sg.cls) && sg.step === 'c' && /2px/.test(sg.filt) && / pattern="spiral" glow /.test(sg.code), detail: JSON.stringify(sg) });
  const gal = await p.evaluate(() => [...document.querySelectorAll('.sp-pats .dk-loader')].map((e) => (e.className.match(/pattern-(\w+)/) || [, 'wave'])[1]).join());
  R.push({ name: 'Loader page: the Pixel patterns gallery shows all nine', ok: gal === 'wave,random,sweep,fall,rise,snake,spiral,cross,checker', detail: gal });
  await p.uncheck('#spg-glow', { force: true });
  await pick('variant', 'skeleton'); await p.waitForTimeout(50);
  R.push({ name: 'Loader playground: pattern hides for other variants and leaves their code', ok: (await p.evaluate(() => document.getElementById('spg-pattern-f').hidden)) && !/pattern/.test(await p.evaluate(() => document.getElementById('spg-code').textContent)) });
  const sk = await p.evaluate(() => { const e = document.querySelector('#spg-preview .dk-loader'); return { cls: e.className, lines: e.querySelectorAll('.dk-loader__line').length, bones: e.querySelectorAll('.dk-loader__bone').length, w: Math.round(e.getBoundingClientRect().width), shapeShown: !document.getElementById('spg-shape-f').hidden, linesShown: !document.getElementById('spg-lines-f').hidden, code: document.getElementById('spg-code').textContent, anim: getComputedStyle(e.querySelector('.dk-loader__bone')).animationName }; });
  R.push({ name: 'Loader playground: skeleton shows shape and lines controls, three shimmering lines filling the preview, and the code', ok: /dk-loader--skeleton/.test(sk.cls) && /dk-loader--shape-text/.test(sk.cls) && sk.lines === 3 && sk.w >= 200 && sk.shapeShown && sk.linesShown && sk.anim === 'dk-loader-shine' && sk.code === '<Loader variant="skeleton" lines={3} size="lg" tone="primary" label="" delay={1000} />', detail: JSON.stringify(sk) });
  await pick('shape', 'rect'); await p.waitForTimeout(50);
  const rc = await p.evaluate(() => { const e = document.querySelector('#spg-preview .dk-loader'); const r = e.getBoundingClientRect(); return { cls: e.className, h: Math.round(r.height), bones: e.querySelectorAll('.dk-loader__bone').length, linesShown: !document.getElementById('spg-lines-f').hidden, code: document.getElementById('spg-code').textContent, note: document.getElementById('spg-note').textContent }; });
  R.push({ name: 'Loader playground: shape rect is one 96px block, hides lines, leaves size out of the code and explains className', ok: /shape-rect/.test(rc.cls) && rc.h === 96 && rc.bones === 1 && !rc.linesShown && rc.code === '<Loader variant="skeleton" shape="rect" tone="primary" label="" delay={1000} />' && /className/.test(rc.note), detail: JSON.stringify(rc) });
  await pick('shape', 'circle'); await p.waitForTimeout(50);
  const ci = await p.evaluate(() => { const r = document.querySelector('#spg-preview .dk-loader').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), document.getElementById('spg-code').textContent]; });
  R.push({ name: 'Loader playground: shape circle takes the loader size (lg: 40px)', ok: ci[0] === 40 && ci[1] === 40 && ci[2] === '<Loader variant="skeleton" shape="circle" size="lg" tone="primary" label="" delay={1000} />', detail: JSON.stringify(ci) });
  const demo = await p.evaluate(() => { const cards = [...document.querySelectorAll('.sp-card')]; return { cards: cards.length, named: cards.map((c) => c.querySelectorAll('[role="progressbar"]').length), busy: cards.every((c) => c.getAttribute('aria-busy') === 'true'), bones: document.querySelectorAll('.canvas .dk-loader__bone').length, overflow: cards.some((c) => [...c.querySelectorAll('.dk-loader')].some((l) => l.getBoundingClientRect().right > c.getBoundingClientRect().right + 0.5)) }; });
  R.push({ name: 'Loader page: skeleton demos, each busy card names one skeleton, nothing spills out of a card', ok: demo.cards === 2 && demo.named.every((n) => n === 1) && demo.busy && demo.bones >= 15 && !demo.overflow, detail: JSON.stringify(demo) });
  R.push({ name: 'Loader playground: no script errors', ok: !errs.length, detail: errs.join(' | ') });
  await ctx.close();
}
// Every ring on the docs pages, written out or built by a page's script, has the Loader's .dk-loader__art wrapper,
// which carries the turning animation (without it the arc only grows and shrinks in place, and looks laggy)
{
  const src = [fs.readFileSync(path.join(HERE, '..', 'docs', 'template.html'), 'utf8')].concat(fs.readdirSync(out).filter((f) => f.endsWith('.html') || f.endsWith('.js')).map((f) => fs.readFileSync(path.join(out, f), 'utf8')));
  const bare = src.reduce((n, t) => n + (t.match(/dk-loader--ring[^>]*>\s*<svg/g) || []).length, 0);
  R.push({ name: 'Docs: every Loader ring (static or built by a script) has its .dk-loader__art wrapper, so it turns', ok: bare === 0, detail: `${bare} rings without the wrapper` });
}
// Button demos and the playground behave like the component: a press makes a ripple (not on the link variant)
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  for (const [f, sel, want, label] of [['button.html', '#pg-preview .dk-btn', 1, 'the Button playground'], ['button.html', '.dk-btn--outline', 1, 'a Button page demo'], ['themes.html', '.dk-btn', 1, 'a hand-written demo button (themes page)']]) {
    await p.goto('file://' + path.join(out, f)); await p.waitForTimeout(200);
    const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded();
    const bb = await el.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(80);
    const n = await el.evaluate((e) => e.querySelectorAll('.dk-btn__ripple').length); await p.mouse.up();
    R.push({ name: `ripple on ${label}`, ok: n === want, detail: `${n} ripples` });
  }
  await p.goto('file://' + path.join(out, 'button.html')); await p.waitForTimeout(200);
  await p.check('input[name="variant"][value="link"]', { force: true }); await p.waitForTimeout(50);
  const el = p.locator('#pg-preview .dk-btn'); const bb = await el.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(80);
  const n = await el.evaluate((e) => e.querySelectorAll('.dk-btn__ripple').length); await p.mouse.up();
  R.push({ name: 'no ripple on the playground\'s link variant', ok: n === 0, detail: `${n} ripples` });
  await ctx.close();
}
await b.close();
fs.rmSync(out, { recursive: true, force: true });
const failed = R.filter((r) => !r.ok);
for (const r of failed) console.log(`FAIL  ${r.name}\n      ${r.detail}`);
console.log(`Docs: ${pages.length} pages × 2 widths × 2 modes, plus ripple checks: ${R.length - failed.length}/${R.length} passed`);
process.exit(failed.length ? 1 : 0);

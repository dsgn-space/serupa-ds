// Visual snapshots: renders every Storybook story (from storybook-static/, npm run build-storybook) and compares it
// with the saved image in baseline-visual/<Component>/: at rest in every theme, and hovered and focused in the
// first theme (blue-light), and for the components in FORCED once more with forced colors on (Windows High Contrast),
// where states shown only by colour disappear unless the CSS has a forced-colors rule. Every story is also shot once
// on the page's other axes together (right to left, more contrast, compact density; <Story>-axes.png), so a mirroring,
// contrast-token or control-height regression shows up too.
//   node tools/test/visual.mjs            check
//   node tools/test/visual.mjs --update   accept the current look as the new baseline (in Chromium a picture
//                                         that differs past 0.01%; in Firefox and WebKit past the tolerance)
//   SERUPA_SHARD=2/3 node tools/test/visual.mjs   every third story, starting with the second (CI runs the shards
//                                                in parallel)
// A story without a baseline fails the check; --update (or the "update-visual-baselines" label) writes one.
// Left out: the Playground stories (the default story with Storybook's controls, which another story shows), the
// components in SKIP, and any story tagged "!visual" (tags: ['!visual'] in its story file, which takes away the
// "visual" tag .storybook/preview.tsx gives every story: index.json lists the tags left, never the "!" ones).
// Hover and focus act on the element a story marks with data-visual-target (both states), or
// data-visual-target="hover" / ="focus" (one each); without one, hover is on the story's first enabled button, link
// or field, and focus wherever the first Tab lands. Focus comes from pressing Tab, so :focus-visible applies.
// Small anti-aliasing differences between machines are tolerated (TOLERANCE of pixels may differ).
// The token blocks on the Foundations pages (each element marked data-token-sheet in docs/blocks.tsx: the palette,
// the aliases, the type scale, the token tables) are shot too, as Foundations/<Page>-<sheet>.png, so a changed token
// value fails like a changed component. One theme is enough: the alias table writes out every theme's value, and the
// themes themselves are in every component picture. They run in the first shard, and not when the change
// touches only components (SERUPA_ONLY), since a component can't change them.
import fs from 'node:fs';
import path from 'node:path';
import { measure, print as printConsistency } from './consistency.mjs';
import { ENGINE, HERE, PAGES, PROJECT, browser, expectedVersion, fail, fixClock, inParallel, inParallelRetry, openUrl, report, serve, suffix, onlyComponents } from './lib.mjs';

const TOLERANCE = 0.002;          // share of pixels allowed to differ
const REDRAW = 0.0001;            // share past which Chromium's --update rewrites a picture (see "--update in Chromium")
const DIR = path.join(HERE, `baseline-visual${suffix}`);
const update = process.argv.includes('--update');
// Firefox and WebKit (SERUPA_BROWSER, baseline-visual-<engine>/): what differs between engines is layout, text and
// the CSS each supports, not the theme's colours, so a lighter set: each story at rest in blue-light and on the other
// axes, two pictures where Chromium has up to twenty. Nightly (cross-browser visual in .gitlab-ci.yml).
const LIGHT = ENGINE !== 'chromium';
const THEMES = LIGHT ? ['blue-light'] : ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark'];
const STATES = LIGHT ? [] : ['hover', 'focus'];
const SKIP = ['VisuallyHidden'];  // nothing to see
// Components whose states (checked, selected, current, progress, drag-over) are easy to lose in forced colors: each
// story is also shot with forced-colors: active, as <Story>-forced-colors.png.
// The other axes, all at once in blue-light at rest: one picture per story catches a change on any of them.
const AXES = 'dir:rtl;contrast:more;density:compact';
const FORCED = LIGHT ? [] : ['Checkbox', 'FileUpload', 'Loader', 'Menu', 'Progress', 'Radio', 'SegmentedControl', 'Select', 'Slider', 'Switch', 'Table', 'Tabs'];

const SB = path.join(PROJECT, 'storybook-static');
if (!fs.existsSync(path.join(SB, 'index.json'))) {
  console.log('FAIL  storybook-static/ is missing (npm run build-storybook)');
  process.exit(1);
}
const component = (e) => e.importPath.split('/')[3];   // ./src/components/<Name>/<Name>.stories.tsx
const [shard, shards] = (process.env.SERUPA_SHARD || '1/1').split('/').map(Number);
const all = Object.values(JSON.parse(fs.readFileSync(path.join(SB, 'index.json'), 'utf8')).entries)
  .filter((e) => e.type === 'story' && e.exportName !== 'Playground' && (e.tags || []).includes('visual') && !SKIP.includes(component(e)))
  .sort((a, b) => a.id.localeCompare(b.id));
// SERUPA_ONLY (run.mjs --since on a pull request): only the stories of the components the change touches.
const only = onlyComponents();
const stories = all.filter((e) => !only || only.has(component(e))).filter((_, i) => i % shards === shard - 1);
// Every baseline a story can have, to find the ones whose story is gone.
const expected = new Set(all.flatMap((e) => [
  ...THEMES.map((th) => `${component(e)}/${e.exportName}-${th}-rest.png`), ...STATES.map((s) => `${component(e)}/${e.exportName}-${THEMES[0]}-${s}.png`),
  ...(FORCED.includes(component(e)) ? [`${component(e)}/${e.exportName}-forced-colors.png`] : []),
  `${component(e)}/${e.exportName}-axes.png`,
]));
const saved = () => fs.readdirSync(DIR, { recursive: true }).map((f) => String(f).split(path.sep).join('/')).filter((f) => f.endsWith('.png') && !f.endsWith('.actual.png'));

const { base, close } = serve(SB);
const b = await browser();
// Pictures from another browser build than the baselines' differ in their text, so all would fail: say why instead.
const want = expectedVersion();
if (want && b.version() !== want) {
  await b.close();
  close();
  fail(`Visual snapshots need the browser the baselines are drawn with, ${want} (Playwright's own), but ${b.version()} is running. `
    + 'Run "npx playwright install". Where that download is blocked (a container whose network doesn\'t allow cdn.playwright.dev), '
    + 'leave this step to CI: node tools/ci.mjs --skip visual. Don\'t update baselines from another build.');
}
// The baselines' text is drawn with sub-pixel colour (fontconfig's stock settings on Linux). A machine whose
// fontconfig forces grayscale draws every picture with text differently: say so once instead of failing them all.
if (process.platform === 'linux' && !LIGHT) {
  const probe = await b.newPage({ viewport: { width: 200, height: 40 } });
  await probe.setContent('<p style="font:16px sans-serif;margin:8px">Sub-pixel text</p>');
  const png = (await probe.screenshot()).toString('base64');
  const colour = await probe.evaluate(async (src) => {
    const img = new Image();
    img.src = `data:image/png;base64,${src}`;
    await img.decode();
    const c = document.createElement('canvas');
    Object.assign(c, { width: img.width, height: img.height });
    const g = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 20) n++;
    return n;
  }, png);
  await probe.close();
  if (!colour) {
    await b.close();
    close();
    fail('Text is drawn in grayscale here, but the baselines have sub-pixel colour (fontconfig\'s stock settings, as on CI), '
      + 'so every picture with text would fail. A rule in /etc/fonts/conf.d forces it (some cloud images ship '
      + '12-unhinted-grayscale.conf): node tools/setup.mjs moves it aside. Don\'t update baselines from this machine.');
  }
}
// Several pages at once (PAGES), each in its own context so focus and the pointer stay its own.
async function newPage() {
  const context = await b.newContext({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
  await fixClock(context);   // today is CLOCK, so a story that shows today draws the same picture every day
  return context.newPage();
}
const pages = await Promise.all(Array.from({ length: PAGES }, newPage));
const R = [];

async function diff(page, a, bb) {   // share of differing pixels and the box they fall in, computed in the browser (no image libraries needed)
  return page.evaluate(async ([a, bb]) => {
    const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + s; });
    const [x, y] = await Promise.all([load(a), load(bb)]);
    if (x.width !== y.width || x.height !== y.height) return { share: 1, box: `${x.width}×${x.height} against ${y.width}×${y.height}` };
    const c = (i) => { const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const g = cv.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
    const d1 = c(x), d2 = c(y); let n = 0;
    // Where they differ too, so a failure in a log says which part of the picture changed.
    let x0 = x.width, y0 = x.height, x1 = -1, y1 = -1, first = '';
    const rgb = (d, k) => `rgb(${d[k]} ${d[k + 1]} ${d[k + 2]})`;
    for (let k = 0; k < d1.length; k += 4) {
      if (Math.abs(d1[k] - d2[k]) + Math.abs(d1[k + 1] - d2[k + 1]) + Math.abs(d1[k + 2] - d2[k + 2]) <= 24) continue;
      n++;
      const px = (k / 4) % x.width, py = Math.floor(k / 4 / x.width);
      if (!first) first = `; at ${px},${py} ${rgb(d1, k)} is now ${rgb(d2, k)}`;
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
    return { share: n / (d1.length / 4), box: n ? `x ${x0}–${x1}, y ${y0}–${y1}${first}` : '' };
  }, [a, bb]);
}

// Screenshot once the page has stopped changing: two captures 100 ms apart must match, so a late paint
// (a popover still placing itself, a glyph still loading on a slow runner) can't land in the image.
async function stableShot(page, el) {
  const shoot = () => (el ? el.screenshot() : page.screenshot({ fullPage: true }));
  let last = await shoot();
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    const next = await shoot();
    if (next.equals(last)) return next;
    last = next;
  }
  return last;
}

// Focus the way a keyboard does (so :focus-visible applies): press Tab from the top of the page until focus
// is on the element or inside it.
async function tabTo(page, el) {
  const handle = await el.elementHandle();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    if (await handle.evaluate((n) => n.contains(document.activeElement))) return true;
  }
  return false;
}

const measured = new Set(), consistency = [];
let measuring = 0;
// Opens a story in a theme, with motion off, once it has drawn and its fonts have loaded. '' when ready.
async function open(page, e, theme, more = '') {
  const [brand, mode] = theme.split('-');
  const notOpen = await openUrl(page, `${base}/iframe.html?id=${e.id}&viewMode=story&globals=brand:${brand};mode:${mode};${more ? `${more};` : ''}a11y.manual:!true`);
  if (notOpen) return notOpen;
  const drawn = await page.waitForFunction(() => document.body.classList.contains('sb-show-errordisplay') || document.querySelector('#storybook-root')?.children.length > 0, null, { timeout: 15000 }).then(() => true, () => false);
  if (!drawn) return 'did not render in 15 s';
  if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) return 'Storybook shows an error';
  // The cross-component consistency measurements (consistency.mjs), once a story, on the page already open and
  // before its transitions are turned off: warnings at the end of the run, never a failure.
  if (!LIGHT && !update && !more && theme === THEMES[0] && !measured.has(e.id)) {
    measured.add(e.id);
    const t = performance.now();
    consistency.push(...await measure(page));
    measuring += performance.now() - t;
  }
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  // Every font face loaded, so no glyph draws late. A face the engine can't load (WebKit rejected one with a
  // NetworkError) draws in its fallback, which the picture shows; it doesn't stop the run.
  await page.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load().catch(() => {}))); await document.fonts.ready; });
  await page.waitForTimeout(150);   // stories that open a popover do it on a short timer
  return '';
}

// The story already open at rest: the theme changes in place, through Storybook's own channel, as its toolbar changes
// it, instead of loading the page again (a load was three quarters of this check's time). '' when it rendered.
async function switchTo(page, theme) {
  const [brand, mode] = theme.split('-');
  const ok = await page.evaluate(({ brand, mode }) => new Promise((done) => {
    const ch = /** @type {any} */ (window).__STORYBOOK_ADDONS_CHANNEL__;
    if (!ch) { done(false); return; }
    const timer = setTimeout(() => done(false), 10000);
    ch.once('storyRendered', () => { clearTimeout(timer); done(true); });
    ch.emit('updateGlobals', { globals: { brand, mode } });
  }), { brand, mode }).catch(() => false);
  if (!ok || (await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) !== theme) return 'did not switch';
  await page.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load().catch(() => {}))); await document.fonts.ready; });
  await page.waitForTimeout(150);
  return '';
}

// Shoots the page (or one element of it) and compares it with baseline-visual/<name>.png (or writes it, with --update).
// null when nothing to report.
async function compare(page, name, el) {
  // A story that crashed after it first drew (on a theme switched in place, a hover, a focus) shows Storybook's error
  // screen instead: fail it, and never write that screen as a baseline (#1610 committed React's error #300 so). It is
  // asked again after the shot, since the screen can come up while the shot waits for the page to settle (#1620's
  // baseline run saved it so): a failure after a switched theme is then shot again from a fresh load.
  const crashed = async () => (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay')))
    && { name, ok: false, detail: `Storybook shows an error: ${(await page.locator('#error-message').textContent({ timeout: 1000 }).catch(() => '')).trim().slice(0, 200) || 'see the story'}` };
  const before = await crashed();
  if (before) return before;
  const shot = await stableShot(page, el);
  const after = await crashed();
  if (after) return after;
  const file = path.join(DIR, `${name}.png`);
  // --update in Chromium rewrites a baseline that differs past 0.01%, well under the tolerance: on CI's pinned image a
  // render is the same run to run, so such a difference is a real change, and keeping one under the tolerance leaves a
  // stale picture that the next pull request to redraw would commit instead (Menu kept ⌘ for weeks after it drew
  // Ctrl). The floor is for the few stories that flip a pixel or two between runs (Popover's arrow edge), which would
  // otherwise be rewritten every time. Firefox and WebKit keep the tolerance. Update baselines also redraws after each
  // push to main, since a picture redrawn before another change to a shared look merges with the old one.
  if (update) {
    if (!fs.existsSync(file) || (await diff(page, fs.readFileSync(file).toString('base64'), shot.toString('base64'))).share > (LIGHT ? TOLERANCE : REDRAW)) fs.writeFileSync(file, shot);
    return null;
  }
  // A missing baseline fails: only --update (or the "update-visual-baselines" label) writes one, so a
  // story can't pass without being compared.
  if (!fs.existsSync(file)) {
    fs.writeFileSync(path.join(DIR, `${name}.actual.png`), shot);
    return { name, ok: false, detail: 'no baseline; add the "update-visual-baselines" label to the pull request (or run node tools/test/visual.mjs --update) and review the new images' };
  }
  const { share, box } = await diff(page, fs.readFileSync(file).toString('base64'), shot.toString('base64'));
  if (share > TOLERANCE) fs.writeFileSync(path.join(DIR, `${name}.actual.png`), shot);
  return { name, ok: share <= TOLERANCE, detail: `${(share * 100).toFixed(2)}% of pixels differ (${box}); see ${name}.actual.png` };
}

async function checkStory(e, page) {
  const out = [];
  const c = component(e);
  fs.mkdirSync(path.join(DIR, c), { recursive: true });
  // Every theme at rest first, on one page load (each next theme switched in place), then hover and focus, which
  // each start from a fresh load.
  let atRest = false;
  for (const [th, state] of [...THEMES.map((th) => [th, 'rest']), ...STATES.map((st) => [THEMES[0], st])]) {
    {
      const name = `${c}/${e.exportName}-${th}-${state}`;
      const switched = atRest && state === 'rest' && !(await switchTo(page, th));
      const notReady = switched ? '' : await open(page, e, th);
      atRest = !notReady && state === 'rest';
      if (notReady) { out.push({ name, ok: false, detail: notReady }); continue; }
      if (state !== 'rest') {
        // What to hover and focus: the element marked data-visual-target="hover" / ="focus" for this state, else the one
        // marked data-visual-target, else the story's first enabled control (for focus, wherever the first Tab lands in
        // the story, since a radio group or tab list puts its Tab stop on the checked item). A story with none gets no
        // hover or focus shot.
        let el = page.locator(`#storybook-root [data-visual-target="${state}"]`).first();
        if (!(await el.count())) el = page.locator('#storybook-root [data-visual-target]:not([data-visual-target="hover"], [data-visual-target="focus"])').first();
        if (!(await el.count())) el = page.locator('#storybook-root :is(button, a[href], input, select, textarea, [tabindex="0"]):not(:disabled, [aria-disabled="true"]):visible').first();
        if (!(await el.count())) continue;
        if (state === 'focus' && !(await el.evaluate((n) => n.closest('[data-visual-target]')))) el = page.locator('#storybook-root');
        if (state === 'hover') {
          await el.hover({ timeout: 5000 }).catch(() => {});
          // A hovered tooltip trigger (an IconButton's label) opens its tooltip after the hover delay. The shot waits
          // for it: without the wait, a shot taken at about the delay caught it on some runs and not on others
          // (IconButton's Sizes and shapes, 0.19% apart).
          await page.waitForFunction(() => {
            const on = [...document.querySelectorAll(':hover')].pop()?.closest('[interestfor]');
            const tip = on && document.getElementById(on.getAttribute('interestfor') ?? '');
            return !tip || tip.dataset.state === 'open';
          }, null, { timeout: 3000 }).catch(() => {});
        } else if (!(await tabTo(page, el))) {
          out.push({ name, ok: false, detail: 'Tab never reaches the element to focus; mark one that takes keyboard focus with data-visual-target, or tag the story "!visual"' });
          continue;
        }
      }
      let r = await compare(page, name);
      // A story that keeps state across a re-render (an open context menu, a timer's warning, a playground's own
      // state) can differ after a switch: the fresh load decides, as it did before switching.
      if (switched && r && !r.ok && !(await open(page, e, th))) r = await compare(page, name);
      if (r) out.push(r);
    }
  }
  {
    const name = `${c}/${e.exportName}-axes`;
    const notReady = await open(page, e, THEMES[0], AXES);
    const on = !notReady && await page.evaluate(() => { const h = document.documentElement; return h.dir === 'rtl' && h.dataset.contrast === 'more' && h.dataset.density === 'compact'; });
    const r = notReady ? { name, ok: false, detail: notReady } : !on ? { name, ok: false, detail: 'the page did not take dir="rtl", data-contrast="more" and data-density="compact" from the globals' } : await compare(page, name);
    if (r) out.push(r);
  }
  if (FORCED.includes(c)) {
    // Forced colors replace every colour with the system's few, so one pass is enough (the theme doesn't show).
    const name = `${c}/${e.exportName}-forced-colors`;
    await page.emulateMedia({ forcedColors: 'active' });
    try {
      const notReady = await open(page, e, THEMES[0]);
      const r = notReady ? { name, ok: false, detail: notReady } : await compare(page, name);
      if (r) out.push(r);
    } finally { await page.emulateMedia({ forcedColors: 'none' }); }
  }
  return out;
}
// Each page starts a new context every RECYCLE stories: the browser keeps memory from story to story, and a long
// run crashed a tab (Slider's Read only, emerald-dark, 7 Nov 2026), which ended the whole step. A tab that crashes
// anyway now fails only its story, and the page is replaced.
const RECYCLE = 40;
const slots = pages.map((page) => ({ page, used: 0 }));
/** @type {(s: { page: import('playwright').Page, used: number }) => Promise<void>} */
const renew = async (s) => { await s.page.context().close().catch(() => {}); s.page = await newPage(); s.used = 0; };
const guarded = async (e, s) => {
  if (++s.used > RECYCLE) await renew(s);
  try { return await checkStory(e, s.page); }
  catch (err) {
    if (!/crash|closed/i.test(String(err?.message))) throw err;
    await renew(s);
    return [{ name: `${component(e)}/${e.exportName}`, ok: false, detail: `the tab crashed: ${String(err.message).split('\n')[0]}` }];
  }
};
// A story that fails is shot once more (not with --update, which writes what it shoots).
R.push(...(await (update ? inParallel(stories, slots, guarded) : inParallelRetry(stories, slots, guarded, (e) => e.id))).flat());
pages.splice(0, pages.length, ...slots.map((s) => s.page));

// The token sheets: each Foundations page, one picture per data-token-sheet element.
const sheetPages = shard === 1 && !only ? Object.values(JSON.parse(fs.readFileSync(path.join(SB, 'index.json'), 'utf8')).entries)
  .filter((e) => e.type === 'docs' && e.title.startsWith('Foundations/')).sort((a, b) => a.id.localeCompare(b.id)) : [];
let sheetsFailed = false;
async function checkSheets(e, page) {
  const out = [];
  const pageName = `Foundations/${e.title.split('/').pop().replace(/\s+/g, '-')}`;
  fs.mkdirSync(path.join(DIR, 'Foundations'), { recursive: true });
  const [brand, mode] = THEMES[0].split('-');
  const notOpen = await openUrl(page, `${base}/iframe.html?id=${e.id}&viewMode=docs&globals=brand:${brand};mode:${mode}`);
  if (notOpen) { sheetsFailed = true; return [{ name: pageName, ok: false, detail: notOpen }]; }
  const drawn = await page.waitForFunction(() => document.querySelector('#storybook-docs .sbdocs-content')?.children.length > 0, null, { timeout: 15000 }).then(() => true, () => false);
  if (!drawn) { sheetsFailed = true; return [{ name: pageName, ok: false, detail: 'did not render in 15 s' }]; }
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load().catch(() => {}))); await document.fonts.ready; });
  await page.waitForTimeout(150);
  // A page without token blocks (Accessibility, Icons) has nothing to shoot.
  for (const sheet of await page.locator('[data-token-sheet]').evaluateAll((ns) => ns.map((n) => n.dataset.tokenSheet))) {
    const name = `${pageName}-${sheet}`;
    expected.add(`${name}.png`);
    const r = await compare(page, name, page.locator(`[data-token-sheet="${sheet}"]`).first());
    if (r) out.push(r);
  }
  return out;
}
R.push(...(await inParallel(sheetPages, pages, checkSheets)).flat());
await b.close();
close();
// A baseline whose story is gone: --update removes it (in shard 1, since every shard knows every story), and the check fails on it.
// Foundations/ pictures count only when the sheets ran, and none is removed when a page didn't render.
const orphans = saved().filter((f) => !expected.has(f) && (!only || only.has(f.split('/')[0])) && (f.split('/')[0] !== 'Foundations' || (sheetPages.length && !sheetsFailed)));
if (update) {
  if (shard === 1) for (const f of orphans) fs.rmSync(path.join(DIR, f));
  console.log(`Visual baseline saved: ${stories.length} stories, ${sheetPages.length} Foundations pages.`);
  process.exit(sheetsFailed ? 1 : 0);
}
if (shard === 1) R.push({ name: 'every baseline belongs to a story', ok: !orphans.length, detail: `no story for: ${orphans.slice(0, 10).join(', ')}; add the "update-visual-baselines" label to remove them` });
console.log(`(${stories.length} stories, ${sheetPages.length} Foundations pages)`);
if (measured.size) printConsistency(consistency, measuring);
process.exitCode = report('Visual', R) ? 0 : 1;   // not process.exit: that cuts off a long report still going down a pipe

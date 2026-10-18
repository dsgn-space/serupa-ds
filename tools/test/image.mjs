// Image: the frame and its ratios (auto, square, 4:3, 16:9, a number), cover and contain, rounded, lazy
// loading, the placeholder while loading, the fallback on error (default and custom, named by alt), the viewer
// (a button named by the alt text that opens a Dialog with the full-size picture; Escape closes it and focus
// comes back), the remove button, contrast in every theme and tokens.
//   node tools/test/image.mjs
import fs from 'node:fs';
import { writePage, browser, cleanup, report, PROJECT } from './lib.mjs';

// Serve the test pages from an http origin: Firefox doesn't send a file:// page's requests through Playwright's
// routes, so the held (slow.test) and failing (broken.test) pictures would never reach them.
const ORIGIN = 'http://dk.test';
const served = async (page, file) => {
  await page.route(ORIGIN + '/**', (route) => {
    const u = decodeURIComponent(new URL(route.request().url()).pathname), f = u.startsWith(PROJECT) ? u : PROJECT + u;
    return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' });
  });
  return ORIGIN + file.slice('file://'.length).slice(PROJECT.length);
};

const PIC = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#3b82f6"/></svg>');
const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px;width:900px"></div>
<script>
var D = window.Serupa, h = React.createElement, PIC = ${JSON.stringify(PIC)};
window.removed = 0;
function App() {
  var w = function (id, extra) { return { frameProps: Object.assign({ 'data-testid': id, style: { width: 200 } }, extra || {}) }; };
  return h(React.Fragment, null,
    h(D.Image, Object.assign(w('auto', { className: 'frame-extra' }), { src: PIC, alt: 'A blue banner', className: 'extra', ref: window.ir = React.createRef() })),
    h(D.Image, Object.assign(w('square'), { src: PIC, alt: 'Square', ratio: 'square' })),
    h(D.Image, Object.assign(w('four'), { src: PIC, alt: 'Four by three', ratio: '4:3', fit: 'contain' })),
    h(D.Image, Object.assign(w('video'), { src: PIC, alt: 'Wide', ratio: 'video', rounded: false })),
    h(D.Image, Object.assign(w('num'), { src: PIC, alt: 'Two to one', ratio: 2 })),
    h(D.Image, Object.assign(w('slow'), { src: 'http://slow.test/pic.svg', alt: 'Slow', ratio: 'square' })),
    h(D.Image, Object.assign(w('broken'), { src: 'http://broken.test/none.png', alt: 'Team photo', ratio: 'square' })),
    h(D.Image, Object.assign(w('custom'), { src: 'http://broken.test/none.png', alt: 'Logo', ratio: 'square', fallback: h('span', { className: 'my-fallback' }, 'No logo') })),
    h(D.Image, Object.assign(w('view'), { src: PIC, fullSrc: PIC + '#full', alt: 'Harbor at dusk', ratio: 'video', viewable: true, onRemove: function () { window.removed++; } })),
    h(D.Image, Object.assign(w('tok', { style: { width: 200, '--image-radius': '3px' } }), { src: PIC, alt: 'Token', ratio: 'square' })));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
let release;
const held = new Promise((r) => { release = r; });
await p.route('http://slow.test/**', async (route) => { await held; await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>' }); });
await p.route('http://broken.test/**', (route) => route.fulfill({ status: 404, body: '' }));
await p.goto(await served(p, writePage('image.html', APP, { react: true })));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(400);
const box = (id) => p.evaluate((id) => { const f = document.querySelector(`[data-testid=${id}]`), r = f.getBoundingClientRect(), i = f.querySelector('img'); return { w: Math.round(r.width), h: Math.round(r.height), state: f.dataset.state, fit: i && getComputedStyle(i).objectFit, radius: getComputedStyle(f).borderTopLeftRadius }; }, id);

const a = await p.evaluate(() => { const f = document.querySelector('[data-testid=auto]'), i = f.querySelector('img'); return { ref: window.ir.current === i, cls: i.className, fcls: f.className, alt: i.alt, loading: i.loading, comp: f.dataset.component }; });
t('an <img> with alt and loading="lazy" in a frame; ref and className go to the img, frameProps to the frame', a.ref && /extra/.test(a.cls) && /frame-extra/.test(a.fcls) && a.alt === 'A blue banner' && a.loading === 'lazy' && a.comp === 'image', JSON.stringify(a));
const sizes = {}; for (const id of ['auto', 'square', 'four', 'video', 'num']) sizes[id] = await box(id);
t('ratio: auto keeps the picture\'s shape (200×100), square 200×200, 4:3 200×150, video 200×113, 2 → 200×100', sizes.auto.h === 100 && sizes.square.h === 200 && sizes.four.h === 150 && sizes.video.h === 113 && sizes.num.h === 100 && Object.values(sizes).every((s) => s.w === 200 && s.state === 'loaded'), JSON.stringify(sizes));
t('fit: cover by default, contain when asked', sizes.square.fit === 'cover' && sizes.four.fit === 'contain');
t('rounded by default (8px); rounded={false} is square', sizes.square.radius === '8px' && sizes.video.radius === '0px');
const slow = await p.evaluate(() => { const f = document.querySelector('[data-testid=slow]'); return { state: f.dataset.state, img: getComputedStyle(f.querySelector('img')).opacity, bg: getComputedStyle(f).backgroundColor, want: getComputedStyle(document.body).getPropertyValue('--surface-muted') }; });
release(); await p.waitForTimeout(200);
t('while loading: the picture is hidden and the frame shows the placeholder fill; then it appears', slow.state === 'loading' && slow.img === '0' && (await box('slow')).state === 'loaded', JSON.stringify(slow));
const br = await p.evaluate(() => { const f = document.querySelector('[data-testid=broken]'), fb = f.querySelector('.dk-image__fallback'); return { state: f.dataset.state, img: !!f.querySelector('img'), role: fb.getAttribute('role'), label: fb.getAttribute('aria-label'), icon: fb.querySelector('.dk-icon')?.dataset.icon, h: Math.round(f.getBoundingClientRect().height) }; });
t('on error: a broken-image icon named by the alt text (role="img") keeps the frame', br.state === 'error' && !br.img && br.role === 'img' && br.label === 'Team photo' && br.icon === 'broken_image' && br.h === 200, JSON.stringify(br));
t('fallback replaces the icon', await p.$eval('[data-testid=custom] .dk-image__fallback', (x) => x.textContent === 'No logo'));

const v = await p.evaluate(() => { const btn = document.querySelector('[data-testid=view] .dk-image__view'); return { label: btn.getAttribute('aria-label'), pop: btn.getAttribute('aria-haspopup'), cursor: getComputedStyle(btn).cursor, remove: document.querySelector('[data-testid=view] .dk-image__remove').getAttribute('aria-label') }; });
t('viewable: the picture is a button named "View image: <alt>" with a zoom-in cursor', v.label === 'View image: Harbor at dusk' && v.pop === 'dialog' && v.cursor === 'zoom-in', JSON.stringify(v));
await p.focus('[data-testid=view] .dk-image__view'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
const dlg = await p.evaluate(() => { const d = document.querySelector('[data-testid=view] dialog'); return { open: d.open, title: d.querySelector('.dk-dialog__title').textContent, src: d.querySelector('.dk-image__full').getAttribute('src').endsWith('#full'), alt: d.querySelector('.dk-image__full').alt, focus: d.contains(document.activeElement) }; });
t('Enter opens a Dialog titled with the alt text, showing fullSrc, with focus inside', dlg.open && dlg.title === 'Harbor at dusk' && dlg.src && dlg.alt === 'Harbor at dusk' && dlg.focus, JSON.stringify(dlg));
await p.keyboard.press('Escape'); await p.waitForTimeout(100);
t('Escape closes it and focus returns to the picture', await p.evaluate(() => !document.querySelector('[data-testid=view] dialog').open && document.activeElement.classList.contains('dk-image__view')));
await p.click('[data-testid=view] .dk-image__view'); await p.waitForTimeout(100);
await p.click('[data-testid=view] dialog .dk-dialog__close'); await p.waitForTimeout(100);
t('a click opens it too, and the × closes it', await p.evaluate(() => !document.querySelector('[data-testid=view] dialog').open));
await p.click('[data-testid=view] .dk-image__remove');
t('onRemove: a "Remove image: <alt>" button in the corner calls it, without opening the viewer', v.remove === 'Remove image: Harbor at dusk' && (await p.evaluate(() => window.removed)) === 1 && (await p.evaluate(() => !document.querySelector('[data-testid=view] dialog').open)));
const pos = await p.evaluate(() => { const f = document.querySelector('[data-testid=view]').getBoundingClientRect(), r = document.querySelector('[data-testid=view] .dk-image__remove').getBoundingClientRect(); return { top: Math.round(r.top - f.top), end: Math.round(f.right - r.right) }; });
t('the remove button sits 8px from the top end corner', pos.top === 8 && pos.end === 8, JSON.stringify(pos));

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const f = document.querySelector('[data-testid=broken]'), fb = f.querySelector('.dk-image__fallback'), rm = document.querySelector('[data-testid=view] .dk-image__remove');
    for (const [k, fg, bg, min] of [['fallback icon', getComputedStyle(fb).color, getComputedStyle(f).backgroundColor, 3], ['remove icon', getComputedStyle(rm).color, getComputedStyle(rm).backgroundColor, 3]]) { const x = ratio(rgb(fg), rgb(bg)); n++; if (x < min) low.push(`${th} ${k}: ${x.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the fallback icon and the remove button\'s icon keep 3:1 in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
t('--image-radius overrides one image', (await box('tok')).radius === '3px');
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Image', R) ? 0 : 1);

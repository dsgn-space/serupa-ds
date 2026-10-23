// Carousel: slides, buttons, dots and their keys, loop, controlled index, swipe, inert slides, names, RTL,
// reduced motion, contrast in every theme, component tokens and forced colors.
//   node tools/test/carousel.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:flex;flex-direction:column;gap:24px;width:400px"></div>
<script>
var D = window.Serupa, h = React.createElement;
function slides(n, p) { return Array.from({ length: n }, function (_, i) { return h('div', { key: i, style: { height: 120, background: '#ddd' } }, h('a', { href: '#' + p + i }, 'Link ' + (i + 1))); }); }
window.changes = [];
function Ctl() {
  var s = React.useState(1);
  window.setCtl = s[1];
  return h(D.Carousel, { id: 'ctl', label: 'Controlled', index: s[0], onIndexChange: function (i) { window.changes.push(i); } }, slides(3, 'c'));
}
function App() {
  return h(React.Fragment, null,
    h(D.Carousel, { id: 'car', label: 'Photos', ref: window.r = React.createRef(), className: 'extra', 'data-x': 'y' }, slides(4, 'a')),
    h(D.Carousel, { id: 'loop', label: 'Loop', loop: true, defaultIndex: 0, slideLabel: function (i, n) { return 'Photo ' + (i + 1) + ' / ' + n; }, previousLabel: 'Back', nextLabel: 'Forward' }, slides(3, 'l')),
    h(Ctl),
    h(D.Carousel, { id: 'one', label: 'One' }, slides(1, 'o')),
    h(D.Carousel, { id: 'bare', label: 'Bare', arrows: false, dots: false, defaultIndex: 9 }, slides(3, 'b')),
    h('div', { dir: 'rtl' }, h(D.Carousel, { id: 'rtl', label: 'RTL' }, slides(3, 'r'))),
    h(D.Carousel, { id: 'pics', label: 'Pictures' }, ['#c00', '#0c0', '#00c'].map(function (c) { return h('img', { key: c, alt: c, style: { display: 'block', width: '100%', height: 120 }, src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="' + c + '"/></svg>') }); })),
    h('div', { style: { direction: 'rtl' } }, h(D.Carousel, { id: 'cssrtl', label: 'CSS RTL', defaultIndex: 1 }, slides(3, 'x'))),
    h(D.Carousel, { id: 'fixed', label: 'Fixed', index: 0, onIndexChange: function () {} }, slides(3, 'f')),
    h(D.Carousel, { id: 'tok', label: 'Tokens', style: { '--carousel-dot-active': 'rgb(1, 2, 3)', '--carousel-radius': '3px' } }, slides(2, 't')));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ reducedMotion: 'reduce' })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await p.goto(writePage('carousel.html', APP, { react: true }));
await p.waitForTimeout(500);

const state = (id) => p.evaluate((id) => { const c = document.getElementById(id), v = c.querySelector('.dk-carousel__viewport').getBoundingClientRect(); const sl = [...c.querySelectorAll('.dk-carousel__slide')]; const shown = sl.findIndex((s) => { const r = s.getBoundingClientRect(); return Math.abs(r.left - v.left) < 1; }); return { index: +c.dataset.index, shown, active: sl.findIndex((s) => s.hasAttribute('data-active')), inert: sl.map((s) => s.inert ? 1 : 0).join(''), hidden: sl.map((s) => s.getAttribute('aria-hidden') === 'true' ? 1 : 0).join(''), dots: [...c.querySelectorAll('.dk-carousel__dot')].map((d) => (d.getAttribute('aria-current') === 'true' ? 'C' : '-') + d.tabIndex).join(' '), prev: c.querySelector('.dk-carousel__arrow--prev')?.disabled, next: c.querySelector('.dk-carousel__arrow--next')?.disabled }; }, id);

const s0 = await p.evaluate(() => { const c = document.getElementById('car'), s = c.querySelector('.dk-carousel__slide'); return { tag: c.tagName, rd: c.getAttribute('aria-roledescription'), name: c.getAttribute('aria-label'), sl: [s.getAttribute('role'), s.getAttribute('aria-roledescription'), s.getAttribute('aria-label')].join(), live: c.querySelector('.dk-carousel__track').getAttribute('aria-live'), btn: [...c.querySelectorAll('.dk-carousel__arrow')].map((x) => x.getAttribute('aria-label')).join(), dots: [...c.querySelectorAll('.dk-carousel__dot')].map((x) => x.getAttribute('aria-label')).join(), ref: window.r.current === c, cls: c.className, x: c.dataset.x, comp: c.dataset.component, w: Math.round(s.getBoundingClientRect().width), vw: Math.round(c.getBoundingClientRect().width) }; });
t('a <section> region (roledescription carousel, named by label); slides are groups named "1 of 4" in a polite live region; buttons and dots are named; ref, className and props reach it', s0.tag === 'SECTION' && s0.rd === 'carousel' && s0.name === 'Photos' && s0.sl === 'group,slide,1 of 4' && s0.live === 'polite' && s0.btn === 'Previous slide,Next slide' && s0.dots === '1 of 4,2 of 4,3 of 4,4 of 4' && s0.ref && /extra/.test(s0.cls) && s0.x === 'y' && s0.comp === 'carousel' && s0.w === s0.vw, JSON.stringify(s0));
let st = await state('car');
t('starts on the first slide: only it is shown and reachable (the rest inert and hidden), its dot is current and the only one in the Tab order, previous is hidden', st.index === 0 && st.shown === 0 && st.active === 0 && st.inert === '0111' && st.hidden === '0111' && st.dots === 'C0 --1 --1 --1' && st.prev === true && st.next === false, JSON.stringify(st));
const vis = await p.evaluate(() => getComputedStyle(document.querySelector('#car .dk-carousel__arrow--prev')).visibility);
t('a disabled button is hidden, not just greyed', vis === 'hidden', vis);
await p.click('#car .dk-carousel__arrow--next'); await p.click('#car .dk-carousel__arrow--next');
st = await state('car');
t('next moves one slide at a time', st.index === 2 && st.shown === 2 && st.inert === '1101' && st.dots === '--1 --1 C0 --1', JSON.stringify(st));
await p.click('#car .dk-carousel__arrow--next');
st = await state('car');
t('at the last slide next is hidden (no loop)', st.index === 3 && st.next === true && st.prev === false, JSON.stringify(st));
await p.click('#car .dk-carousel__arrow--prev');
await p.click('#car .dk-carousel__dot >> nth=0');
st = await state('car');
t('previous goes back, and a dot goes to its slide', st.index === 0 && st.shown === 0, JSON.stringify(st));
await p.focus('#car .dk-carousel__dot >> nth=0');
await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
let foc = await p.evaluate(() => document.activeElement.getAttribute('aria-label'));
st = await state('car');
t('on the dots, ArrowRight moves to the next slide and its dot takes focus', st.index === 2 && foc === '3 of 4', foc + ' ' + JSON.stringify(st));
await p.keyboard.press('End'); st = await state('car'); const e1 = st.index;
await p.keyboard.press('ArrowRight'); st = await state('car'); const e2 = st.index;
await p.keyboard.press('Home'); st = await state('car'); const e3 = st.index;
await p.keyboard.press('ArrowLeft'); st = await state('car');
t('End and Home go to the last and first; the arrows stop at the ends without loop', [e1, e2, e3, st.index].join() === '3,3,0,0', [e1, e2, e3, st.index].join());
await p.keyboard.press('Tab');
foc = await p.evaluate(() => document.activeElement.closest('.dk-carousel')?.id + ':' + document.activeElement.className);
t('Tab leaves the dots in one step (one dot in the Tab order)', !/dk-carousel__dot/.test(foc), foc);

const lp = await p.evaluate(() => { const c = document.getElementById('loop'); return [c.querySelector('.dk-carousel__arrow--prev').getAttribute('aria-label'), c.querySelector('.dk-carousel__arrow--next').getAttribute('aria-label'), c.querySelector('.dk-carousel__slide').getAttribute('aria-label')].join(); });
await p.click('#loop .dk-carousel__arrow--prev'); const l1 = (await state('loop')).index;
await p.click('#loop .dk-carousel__arrow--next'); const l2 = (await state('loop')).index;
await p.focus('#loop .dk-carousel__dot >> nth=0'); await p.keyboard.press('ArrowLeft'); const l3 = (await state('loop')).index;
t('loop: previous from the first goes to the last and next from the last to the first (buttons and keys); labels can be changed', lp === 'Back,Forward,Photo 1 / 3' && [l1, l2, l3].join() === '2,0,2' && (await state('loop')).prev === false, lp + ' ' + [l1, l2, l3].join());

await p.click('#ctl .dk-carousel__arrow--next');
let c1 = await state('ctl');
const ch = await p.evaluate(() => window.changes.join());
await p.evaluate(() => window.setCtl(0)); await p.waitForTimeout(50);
const c2 = await state('ctl');
t('controlled: index decides, a press only calls onIndexChange, and a new index moves it', c1.index === 1 && ch === '2' && c2.index === 0 && c2.shown === 0, JSON.stringify([c1.index, ch, c2.index]));

const one = await p.evaluate(() => { const c = document.getElementById('one'); return [c.querySelectorAll('button').length, c.querySelector('.dk-carousel__slide').inert].join(); });
t('one slide: no buttons and no dots', one === '0,false', one);
const bare = await p.evaluate(() => { const c = document.getElementById('bare'); return [c.querySelectorAll('button').length, c.dataset.index].join(); });
t('arrows={false} and dots={false} leave them out; an index past the end shows the last slide', bare === '0,2', bare);

const swipe = async (id, dx) => { const box = await p.locator(`#${id} .dk-carousel__viewport`).boundingBox(); const y = box.y + 40, x = box.x + box.width / 2; await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 5; i++) await p.mouse.move(x + (dx * i) / 5, y); await p.mouse.up(); await p.waitForTimeout(50); };
await p.locator('#car').scrollIntoViewIfNeeded();
await swipe('car', -120); const w1 = (await state('car')).index;
await swipe('car', -20); const w2 = (await state('car')).index;
await swipe('car', 120); const w3 = (await state('car')).index;
t('a swipe of 40px or more moves one slide (left = next, right = previous); a short one springs back', [w1, w2, w3].join() === '1,1,0', [w1, w2, w3].join());

await p.locator('#rtl').scrollIntoViewIfNeeded();
await p.click('#rtl .dk-carousel__arrow--next');
const rt = await p.evaluate(() => { const c = document.getElementById('rtl'), v = c.querySelector('.dk-carousel__viewport').getBoundingClientRect(), sl = [...c.querySelectorAll('.dk-carousel__slide')].map((s) => s.getBoundingClientRect()); const pr = c.querySelector('.dk-carousel__arrow--prev').getBoundingClientRect(), nx = c.querySelector('.dk-carousel__arrow--next').getBoundingClientRect(); return { shown: sl.findIndex((r) => Math.abs(r.left - v.left) < 1), order: sl[0].left > sl[1].left, prevRight: pr.left > nx.left, ltrIcon: getComputedStyle(c.querySelector('.dk-carousel__ltr')).display }; });
await swipe('rtl', 120); const rs = (await state('rtl')).index;
t('RTL: slides run right to left, next sits on the left with a flipped chevron, and a swipe to the right goes forward', rt.shown === 1 && rt.order && rt.prevRight && rt.ltrIcon === 'none' && rs === 2, JSON.stringify(rt) + ' ' + rs);

const mo = await p.evaluate(() => getComputedStyle(document.querySelector('#car .dk-carousel__track')).transitionDuration);
t('reduced motion: slides change at once', mo === '0s', mo);
const tok = await p.evaluate(() => { const c = document.getElementById('tok'); return [getComputedStyle(c.querySelector('.dk-carousel__dot[aria-current="true"]'), '::before').backgroundColor, getComputedStyle(c.querySelector('.dk-carousel__viewport')).borderTopLeftRadius].join(); });
t('component tokens (--carousel-dot-active, --carousel-radius) override one carousel', tok === 'rgb(1, 2, 3),3px', tok);
const dot = await p.evaluate(() => { const d = document.querySelector('#car .dk-carousel__dot:not([aria-current])'), r = d.getBoundingClientRect(), a = getComputedStyle(d, '::before'), c = getComputedStyle(document.querySelector('#car .dk-carousel__dot[aria-current="true"]'), '::before'); return [Math.round(r.width), Math.round(r.height), a.width, a.height, c.width].join(); });
t('dots: 8px, the current one 24px wide, each in a 24px target', dot === '24,24,8px,8px,24px', dot);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const surf = () => { const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const s = rgb(surf());
    const dot = rgb(getComputedStyle(document.querySelector('#car .dk-carousel__dot:not([aria-current])'), '::before').backgroundColor);
    const cur = rgb(getComputedStyle(document.querySelector('#car .dk-carousel__dot[aria-current="true"]'), '::before').backgroundColor);
    const btn = document.querySelector('#car .dk-carousel__arrow--next'), bc = getComputedStyle(btn);
    for (const [k, r] of [['dot', ratio(dot, s)], ['current dot', ratio(cur, s)], ['button icon', ratio(rgb(bc.color), rgb(bc.backgroundColor))]]) { n++; if (r < 3) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the dots and the button icons keep 3:1 in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
await p.locator('#pics').scrollIntoViewIfNeeded();
await swipe('pics', -120);
t('a mouse swipe over a picture works (the picture\'s own drag is stopped)', (await state('pics')).index === 1, String((await state('pics')).index));
await p.locator('#car').scrollIntoViewIfNeeded();
const h0 = await p.evaluate(() => location.hash);
{ const box = await p.locator('#car .dk-carousel__slide[data-active] a').boundingBox(); const x = box.x + box.width / 2, y = box.y + box.height / 2; await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 5; i++) await p.mouse.move(x - 24 * i, y); await p.mouse.up(); await p.waitForTimeout(50); }
t('a swipe that starts on a link doesn\'t follow it', (await p.evaluate(() => location.hash)) === h0, await p.evaluate(() => location.hash));
const i0 = (await state('car')).index;
await p.evaluate(() => { const v = document.querySelector('#car .dk-carousel__viewport'), o = { bubbles: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientY: v.getBoundingClientRect().top + 40 }; v.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: 300 })); v.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: 250 })); v.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: 180 })); v.dispatchEvent(new PointerEvent('pointercancel', { ...o, clientX: 180 })); });
await p.waitForTimeout(50);
const cs = await p.evaluate(() => document.querySelector('#car').style.getPropertyValue('--dk-carousel-drag'));
t('a cancelled touch (the browser scrolls instead) puts the slide back and doesn\'t change it', (await state('car')).index === i0 && cs === '0px', (await state('car')).index + ' ' + cs);
await p.click('#car .dk-carousel__dot >> nth=0');
await p.focus('#car .dk-carousel__arrow--next');
for (let i = 0; i < 3; i++) await p.keyboard.press('Enter');
const fe = await p.evaluate(() => [document.querySelector('#car').dataset.index, document.activeElement.getAttribute('aria-label')].join());
await p.keyboard.press('Enter'); await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
const fs2 = await p.evaluate(() => [document.querySelector('#car').dataset.index, document.activeElement.getAttribute('aria-label')].join());
t('without loop, reaching the last slide moves focus to Previous (and the first, to Next), so focus isn\'t lost', fe === '3,Previous slide' && fs2 === '0,Next slide', fe + ' / ' + fs2);
const cr = await p.evaluate(() => { const c = document.getElementById('cssrtl'), v = c.querySelector('.dk-carousel__viewport').getBoundingClientRect(), sl = [...c.querySelectorAll('.dk-carousel__slide')]; return sl.findIndex((x) => Math.abs(x.getBoundingClientRect().left - v.left) < 1); });
t('RTL from CSS direction alone (no dir attribute) shows the right slide', cr === 1, String(cr));
await p.focus('#fixed .dk-carousel__dot >> nth=0'); await p.keyboard.press('ArrowRight');
const fx = await p.evaluate(() => [document.getElementById('fixed').dataset.index, document.activeElement.getAttribute('aria-label')].join());
t('controlled: when the parent keeps the index, focus stays on the current dot', fx === '0,1 of 3', fx);
t('no errors on the page', errors.length === 0, errors.join('; '));

{
  const mp = await (await b.newContext()).newPage();
  await mp.goto(writePage('carousel-motion.html', APP, { react: true })); await mp.waitForTimeout(300);
  const d = await mp.evaluate(() => getComputedStyle(document.querySelector('#car .dk-carousel__track')).transitionDuration);
  t('slides move in 300ms without reduced motion', d === '0.3s', d);
  await mp.close();
  const fp = await (await b.newContext({ forcedColors: 'active' })).newPage();
  await fp.goto(writePage('carousel-fc.html', APP, { react: true })); await fp.waitForTimeout(300);
  const fc = await fp.evaluate(() => [getComputedStyle(document.querySelector('#car .dk-carousel__dot:not([aria-current])'), '::before').backgroundColor, getComputedStyle(document.querySelector('#car .dk-carousel__dot[aria-current="true"]'), '::before').backgroundColor]);
  t('forced colors: dots in CanvasText, the current one in Highlight', fc[0] !== fc[1] && !fc.includes('rgba(0, 0, 0, 0)'), fc.join(' / '));
  await fp.close();
}

await b.close();
cleanup();
process.exit(report('Carousel', R) ? 0 : 1);

// Slider: one thumb and a range, slider ARIA, the keyboard (arrows, Shift, Page, Home/End, right-to-left),
// pressing and dragging on the track, range thumbs not crossing, step and snapping, commit events, disabled,
// hidden inputs, sizes, contrast in every theme and tokens.
//   node tools/test/slider.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;width:420px;display:flex;flex-direction:column;gap:24px"></div>
<script>
var D = window.Diki, h = React.createElement;
window.calls = []; window.commits = [];
function Range() {
  var s = React.useState([20, 80]); window.range = s[0];
  return h(D.Slider, { id: 'rng', 'aria-label': 'Price', value: s[0], onValueChange: function (v) { s[1](v); }, onValueCommit: function (v) { window.commits.push(v.join('-')); }, formatValue: function (v) { return '$' + v; }, name: 'price' });
}
function App() {
  return h(React.Fragment, null,
    h('span', { id: 'vlab' }, 'Volume'),
    h(D.Slider, { id: 'one', 'aria-labelledby': 'vlab', defaultValue: 50, ref: window.sr = React.createRef(), className: 'extra', onValueChange: function (v) { window.calls.push(v); }, onValueCommit: function (v) { window.commits.push(v); } }),
    h(Range),
    h(D.Slider, { id: 'stp', 'aria-label': 'Step', defaultValue: 0.5, min: 0, max: 1, step: 0.1 }),
    h(D.Slider, { id: 'dis', 'aria-label': 'Dis', defaultValue: 30, disabled: true }),
    h(D.Slider, { id: 'sm', 'aria-label': 'Small', size: 'sm', defaultValue: 0 }),
    h('div', { dir: 'rtl' }, h(D.Slider, { id: 'rtl', 'aria-label': 'RTL', defaultValue: 25 })),
    h(D.Slider, { id: 'tok', 'aria-label': 'Tok', defaultValue: 40, style: { '--slider-fill': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 600, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('slider.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const now = (id, i = 0) => p.evaluate(([id, i]) => Number(document.querySelectorAll('#' + id + ' [role=slider]')[i].getAttribute('aria-valuenow')), [id, i]);
const geo = (id) => p.evaluate((id) => { const tr = document.querySelector('#' + id + ' .dk-slider__track').getBoundingClientRect(); return { l: tr.left, r: tr.right, y: tr.top + tr.height / 2, w: tr.width }; }, id);
const thumbCenter = (id, i = 0) => p.evaluate(([id, i]) => { const r = document.querySelectorAll('#' + id + ' [role=slider]')[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }, [id, i]);

const a = await p.evaluate(() => { const el = document.getElementById('one'), th = el.querySelector('[role=slider]'); return { n: el.querySelectorAll('[role=slider]').length, now: th.getAttribute('aria-valuenow'), min: th.getAttribute('aria-valuemin'), max: th.getAttribute('aria-valuemax'), lab: th.getAttribute('aria-labelledby'), tab: th.tabIndex, or: th.getAttribute('aria-orientation'), rootRole: el.getAttribute('role'), ref: window.sr.current === el, cls: el.className, comp: el.dataset.component, h: el.getBoundingClientRect().height }; });
t('one thumb: a role="slider" at 50 of 0..100, labelled by aria-labelledby, in the Tab order; ref and className reach the root; md is 20px tall', a.n === 1 && a.now === '50' && a.min === '0' && a.max === '100' && a.lab === 'vlab' && a.tab === 0 && a.or === 'horizontal' && a.rootRole === null && a.ref && /extra/.test(a.cls) && a.comp === 'slider' && a.h === 20, JSON.stringify(a));
const g = await geo('one'), c = await thumbCenter('one');
const fill = await p.evaluate(() => { const f = document.querySelector('#one .dk-slider__fill').getBoundingClientRect(), tr = document.querySelector('#one .dk-slider__track').getBoundingClientRect(); return Math.round(f.width / tr.width * 100); });
t('the thumb is centered on 50% of the track, vertically on the track; the fill covers half', Math.abs(c.x - (g.l + g.w / 2)) <= 1 && Math.abs(c.y - g.y) <= 1 && fill === 50, JSON.stringify({ c, g, fill }));
await p.focus('#one [role=slider]');
const seq = [];
for (const k of ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowDown', 'Shift+ArrowUp', 'PageDown', 'PageDown', 'End', 'ArrowRight', 'Home', 'ArrowLeft']) { await p.keyboard.press(k); seq.push(await now('one')); }
t('keys: Right/Up +1, Left/Down −1, Shift+arrow ±10, PageDown −10, End/Home to the ends, clamped', seq.join() === '51,52,51,50,49,59,49,39,100,100,0,0', seq.join());
const cm = await p.evaluate(() => window.commits.join());
t('onValueCommit fires once per key press that changed the value (not at the ends)', cm === '51,52,51,50,49,59,49,39,100,0', cm);
await p.evaluate(() => { window.calls = []; window.commits = []; });
await p.mouse.move(g.l + g.w * 0.3, g.y); await p.mouse.down();
const pressed = await now('one');
await p.mouse.move(g.l + g.w * 0.6, g.y, { steps: 5 }); const dragged = await now('one');
await p.mouse.move(Math.min(g.r + 80, 590), g.y, { steps: 3 }); const beyond = await now('one');   // past the end but inside the 600px viewport: Firefox mangles synthetic mouse events outside it
await p.mouse.up();
const dc = await p.evaluate(() => ({ commits: window.commits.join(), calls: window.calls.length, focus: document.activeElement === document.querySelector('#one [role=slider]') }));
t('pointer: a press on the track jumps there (30), dragging follows (60), past the end clamps (100); one commit at the end; the thumb takes focus', pressed === 30 && dragged === 60 && beyond === 100 && dc.commits === '100' && dc.calls >= 3 && dc.focus, JSON.stringify({ pressed, dragged, beyond, dc }));

const r = await p.evaluate(() => { const el = document.getElementById('rng'), th = el.querySelectorAll('[role=slider]'); return { role: el.getAttribute('role'), label: el.getAttribute('aria-label'), names: [...th].map((x) => x.getAttribute('aria-label')).join(), now: [...th].map((x) => x.getAttribute('aria-valuenow')).join(), lim: [...th].map((x) => x.getAttribute('aria-valuemin') + '..' + x.getAttribute('aria-valuemax')).join(), txt: [...th].map((x) => x.getAttribute('aria-valuetext')).join(), inputs: [...el.querySelectorAll('input[type=hidden]')].map((i) => i.name + '=' + i.value).join() }; });
t('range: a group named "Price" with thumbs "Minimum" (20, 0..80) and "Maximum" (80, 20..100), valuetext "$20"/"$80", and two hidden inputs', r.role === 'group' && r.label === 'Price' && r.names === 'Minimum,Maximum' && r.now === '20,80' && r.lim === '0..80,20..100' && r.txt === '$20,$80' && r.inputs === 'price=20,price=80', JSON.stringify(r));
const rg = await geo('rng');
await p.mouse.click(rg.l + rg.w * 0.9, rg.y);
const nearHi = [await now('rng', 0), await now('rng', 1)];
await p.mouse.click(rg.l + rg.w * 0.1, rg.y);
const nearLo = [await now('rng', 0), await now('rng', 1)];
t('range: a press moves the nearest thumb (90 → the high one, 10 → the low one)', nearHi.join() === '20,90' && nearLo.join() === '10,90', JSON.stringify([nearHi, nearLo]));
await p.focus('#rng [role=slider]:nth-of-type(1)');
await p.keyboard.press('End');
const met = [await now('rng', 0), await now('rng', 1)];
await p.keyboard.press('ArrowRight');
const crossed = [await now('rng', 0), await now('rng', 1)];
t('range: the low thumb\'s End goes up to the high thumb, and it can\'t pass it', met.join() === '90,90' && crossed.join() === '90,90', JSON.stringify([met, crossed]));
await p.focus('#stp [role=slider]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
t('step 0.1: 0.5 → 0.8 with no floating-point noise', (await now('stp')) === 0.8);
const sg = await geo('stp'); await p.mouse.click(sg.l + sg.w * 0.234, sg.y);
t('a press snaps to the nearest step (23.4% → 0.2)', (await now('stp')) === 0.2);
const dis = await p.evaluate(() => { const th = document.querySelector('#dis [role=slider]'); return { tab: th.tabIndex, ad: th.getAttribute('aria-disabled'), op: getComputedStyle(document.getElementById('dis')).opacity }; });
const dg = await geo('dis'); await p.mouse.click(dg.l + dg.w * 0.9, dg.y);
t('disabled: out of the Tab order, aria-disabled, faded, and presses do nothing', dis.tab === -1 && dis.ad === 'true' && dis.op === '0.5' && (await now('dis')) === 30, JSON.stringify(dis));
const sm = await p.evaluate(() => ({ h: document.getElementById('sm').getBoundingClientRect().height, t: document.querySelector('#sm .dk-slider__track').getBoundingClientRect().height }));
const smt = await thumbCenter('sm'), smg = await geo('sm');
t('sm: 16px thumb on a 4px track; at 0 the thumb is centered on the track\'s start and stays inside the slider', sm.h === 16 && sm.t === 4 && smt.w === 16 && Math.abs(smt.x - smg.l) <= 1 && smt.x - 8 >= 16 - 1, JSON.stringify({ sm, smt, smg }));
const rt = await thumbCenter('rtl'), rtg = await geo('rtl');
await p.focus('#rtl [role=slider]'); await p.keyboard.press('ArrowLeft');
const rtlKey = await now('rtl');
await p.mouse.click(rtg.l + rtg.w * 0.1, rtg.y);
t('right-to-left: 25 sits a quarter in from the right, ArrowLeft raises it, and a press near the left edge is near max', Math.abs(rt.x - (rtg.r - rtg.w * 0.25)) <= 1 && rtlKey === 26 && (await now('rtl')) === 90, JSON.stringify({ rt, rtg, rtlKey }));
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const page = rgb(getComputedStyle(document.body).backgroundColor);
    const parts = { track: getComputedStyle(document.querySelector('#one .dk-slider__track')).backgroundColor, fill: getComputedStyle(document.querySelector('#one .dk-slider__fill')).backgroundColor, thumb: getComputedStyle(document.querySelector('#one .dk-slider__thumb')).borderTopColor };
    for (const [k, c] of Object.entries(parts)) { const r = ratio(rgb(c), page); n++; if (r < 3) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the track, fill and thumb ring keep 3:1 on the page in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
t('--slider-fill overrides one slider', await p.evaluate(() => getComputedStyle(document.querySelector('#tok .dk-slider__fill')).backgroundColor === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Slider', R) ? 0 : 1);

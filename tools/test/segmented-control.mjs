// SegmentedControl: radio-group ARIA, one Tab stop, arrow keys (skipping disabled, wrapping, right-to-left),
// Home/End, clicks, the sliding selection, controlled and uncontrolled, icon-only segments, fullWidth, sizes,
// disabled, the hidden input, contrast in every theme and tokens.
//   node tools/test/segmented-control.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;width:480px;display:flex;flex-direction:column;gap:16px;align-items:flex-start"></div>
<script>
var D = window.Serupa, h = React.createElement, SC = D.SegmentedControl;
window.calls = [];
var PERIODS = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year', disabled: true }];
function Controlled() {
  var s = React.useState('list'); window.setView = s[1]; window.view = s[0];
  return h(SC, { id: 'ctl', 'aria-label': 'View', value: s[0], onValueChange: function (v) { window.calls.push(v); s[1](v); }, name: 'view',
    options: [{ value: 'list', icon: 'list', label: 'List' }, { value: 'board', icon: 'view_kanban', label: 'Board' }] });
}
function App() {
  return h(React.Fragment, null,
    h('button', { id: 'before' }, 'Before'),
    h(SC, { id: 'per', 'aria-label': 'Period', options: PERIODS, ref: window.sr = React.createRef(), className: 'extra' }),
    h('button', { id: 'after' }, 'After'),
    h(Controlled),
    h(SC, { id: 'ico', 'aria-label': 'Align', size: 'sm', defaultValue: 'c', options: [{ value: 'l', icon: 'format_align_left', 'aria-label': 'Left' }, { value: 'c', icon: 'format_align_center', 'aria-label': 'Center' }, { value: 'r', icon: 'format_align_right', 'aria-label': 'Right' }] }),
    h('div', { style: { width: 300 } }, h(SC, { id: 'full', 'aria-label': 'Full', fullWidth: true, options: PERIODS.slice(0, 3) })),
    h(SC, { id: 'dis', 'aria-label': 'Dis', disabled: true, options: PERIODS.slice(0, 2) }),
    h('div', { dir: 'rtl' }, h(SC, { id: 'rtl', 'aria-label': 'RTL', options: PERIODS.slice(0, 3) })),
    h(SC, { id: 'tok', 'aria-label': 'Tok', options: PERIODS.slice(0, 2), style: { '--segmented-control-bg': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 600, height: 600 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('segmented-control.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const checked = (id) => p.evaluate((id) => { const c = document.querySelector('#' + id + ' [aria-checked=true]'); return c ? c.dataset.value : null; }, id);
const ind = (id) => p.evaluate((id) => { const i = document.querySelector('#' + id + ' .dk-segmented__indicator').getBoundingClientRect(), c = document.querySelector('#' + id + ' [aria-checked=true]').getBoundingClientRect(); return { dx: Math.round(i.left - c.left), dw: Math.round(i.width - c.width) }; }, id);

const a = await p.evaluate(() => { const el = document.getElementById('per'), it = [...el.querySelectorAll('button')]; return { role: el.getAttribute('role'), label: el.getAttribute('aria-label'), roles: it.map((x) => x.getAttribute('role')).join(), checked: it.map((x) => x.getAttribute('aria-checked')).join(), tabs: it.map((x) => x.tabIndex).join(), dis: it[3].disabled, ref: window.sr.current === el, cls: el.className, comp: el.dataset.component, h: el.getBoundingClientRect().height }; });
t('a radiogroup of role="radio" buttons, the first checked by default and the only Tab stop; ref and className reach the root; md is 32px', a.role === 'radiogroup' && a.label === 'Period' && a.roles === 'radio,radio,radio,radio' && a.checked === 'true,false,false,false' && a.tabs === '0,-1,-1,-1' && a.dis && a.ref && /extra/.test(a.cls) && a.comp === 'segmented-control' && a.h === 32, JSON.stringify(a));
const i0 = await ind('per');
t('the selection sits exactly on the checked segment', i0.dx === 0 && i0.dw === 0, JSON.stringify(i0));
await p.focus('#before'); await p.keyboard.press('Tab');
const f1 = await p.evaluate(() => document.activeElement.dataset.value);
await p.keyboard.press('ArrowRight'); const k1 = [await checked('per'), await p.evaluate(() => document.activeElement.dataset.value)];
await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); const k2 = await checked('per');
await p.keyboard.press('ArrowLeft'); const k3 = await checked('per');
await p.keyboard.press('End'); const k4 = await checked('per');
await p.keyboard.press('Home'); const k5 = await checked('per');
t('keys: Tab lands on the checked segment; ArrowRight selects and focuses the next, skips disabled ones and wraps; ArrowLeft back; End and Home', f1 === 'day' && k1.join() === 'week,week' && k2 === 'day' && k3 === 'month' && k4 === 'month' && k5 === 'day', JSON.stringify([f1, k1, k2, k3, k4, k5]));
await p.keyboard.press('ArrowRight'); await p.keyboard.press('Tab');
t('one Tab stop: Tab leaves the group, from the newly checked segment', (await p.evaluate(() => document.activeElement.id)) === 'after' && await p.evaluate(() => [...document.querySelectorAll('#per button')].map((x) => x.tabIndex).join()) === '-1,0,-1,-1');
await p.click('#per [data-value="month"]');
const i1 = await ind('per');
t('a click selects, and the selection moves to it', (await checked('per')) === 'month' && i1.dx === 0 && i1.dw === 0, JSON.stringify(i1));
await p.click('#per [data-value="year"]', { force: true });
t('a disabled segment can\'t be chosen', (await checked('per')) === 'month');
await p.click('#ctl [data-value="board"]'); await p.click('#ctl [data-value="board"]');
const c = await p.evaluate(() => ({ calls: window.calls.join(), view: window.view, input: document.querySelector('#ctl input[type=hidden]').name + '=' + document.querySelector('#ctl input[type=hidden]').value, icon: document.querySelector('#ctl [data-value="board"] .dk-segmented__icon .dk-icon')?.dataset.icon }));
t('controlled: onValueChange once (not again for the same segment); the hidden input follows; icons show before labels', c.calls === 'board' && c.view === 'board' && c.input === 'view=board' && c.icon === 'view_kanban', JSON.stringify(c));
await p.evaluate(() => window.setView('list')); await p.waitForTimeout(50);
t('controlled: a new value from outside moves the selection', (await checked('ctl')) === 'list' && (await ind('ctl')).dx === 0);
const ic = await p.evaluate(() => { const el = document.getElementById('ico'), it = [...el.querySelectorAll('button')]; return { h: el.getBoundingClientRect().height, names: it.map((x) => x.getAttribute('aria-label')).join(), w: it.map((x) => Math.round(x.getBoundingClientRect().width)).join(), hh: Math.round(it[0].getBoundingClientRect().height), checked: el.querySelector('[aria-checked=true]').dataset.value }; });
t('icon-only, sm: 24px tall, square 18px segments named by aria-label, defaultValue chosen', ic.h === 24 && ic.names === 'Left,Center,Right' && ic.w === '18,18,18' && ic.hh === 18 && ic.checked === 'c', JSON.stringify(ic));
const full = await p.evaluate(() => { const el = document.getElementById('full'); return { w: el.getBoundingClientRect().width, seg: [...el.querySelectorAll('button')].map((x) => Math.round(x.getBoundingClientRect().width)) }; });
t('fullWidth: fills its container with equal segments', full.w === 300 && new Set(full.seg).size === 1, JSON.stringify(full));
const dis = await p.evaluate(() => { const el = document.getElementById('dis'); return { ad: el.getAttribute('aria-disabled'), all: [...el.querySelectorAll('button')].every((x) => x.disabled && x.tabIndex === -1), op: getComputedStyle(el).opacity }; });
t('disabled: every segment disabled and out of the Tab order, faded', dis.ad === 'true' && dis.all && dis.op === '0.5', JSON.stringify(dis));
await p.focus('#rtl [data-value="day"]'); await p.keyboard.press('ArrowLeft');
const rtl = await p.evaluate(() => { const d = document.querySelector('#rtl [data-value="day"]').getBoundingClientRect(), w = document.querySelector('#rtl [data-value="week"]').getBoundingClientRect(); return d.left > w.left; });
t('right-to-left: segments run right to left and ArrowLeft goes to the next one', rtl && (await checked('rtl')) === 'week' && (await ind('rtl')).dx === 0);
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const el = document.getElementById('per'), page = rgb(getComputedStyle(document.body).backgroundColor), bg = rgb(getComputedStyle(el).backgroundColor), indi = rgb(getComputedStyle(el.querySelector('.dk-segmented__indicator')).backgroundColor);
    const pairs = [['outline on page', getComputedStyle(el).borderTopColor, page, 3], ['label on bg', getComputedStyle(el.querySelector('[data-value="day"]')).color, bg, 4.5], ['selected label', getComputedStyle(el.querySelector('[aria-checked=true]')).color, indi, 4.5], ['selection outline on bg', getComputedStyle(el.querySelector('.dk-segmented__indicator')).borderTopColor, bg, 2]];
    for (const [k, c, on, min] of pairs) { const r = ratio(rgb(c), on); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the outline keeps 3:1 on the page, labels 4.5:1, in all six themes', contrast.low.length === 0 && contrast.n === 24, contrast.low.join('; '));
t('--segmented-control-bg overrides one control', await p.evaluate(() => getComputedStyle(document.getElementById('tok')).backgroundColor === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('SegmentedControl', R) ? 0 : 1);

// NumberInput: Input's box, spinbutton ARIA, typing, clamping and rounding on blur, the arrow, Page and Home/End
// keys, the − and + buttons (limits, focus), controlled and uncontrolled, steppers off, disabled, contrast in
// every theme and tokens.
//   node tools/test/number-input.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); }</style><div id="root" style="padding:16px;width:320px;display:flex;flex-direction:column;gap:12px"></div>
<script>
var D = window.Serupa, h = React.createElement, N = D.NumberInput;
window.calls = [];
function Controlled() {
  var s = React.useState(2); window.ctl = s[0]; window.setCtl = s[1];
  return h(N, { id: 'nctl', 'aria-label': 'Guests', value: s[0], min: 1, max: 4, onValueChange: function (v) { window.calls.push(v); s[1](v); } });
}
function App() {
  return h(React.Fragment, null,
    h('label', { htmlFor: 'qty' }, 'Quantity'),
    h(N, { id: 'qty', ref: window.nr = React.createRef(), className: 'extra', defaultValue: 5, min: 0, max: 100 }),
    h(Controlled),
    h(N, { id: 'dec', 'aria-label': 'Price', defaultValue: 1.5, step: 0.25 }),
    h(N, { id: 'bare', 'aria-label': 'Bare', steppers: false }),
    h(N, { id: 'dis', 'aria-label': 'Dis', disabled: true, defaultValue: 3 }),
    h(N, { id: 'lg', 'aria-label': 'Lg', size: 'lg', defaultValue: 1 }),
    h(N, { id: 'tok', 'aria-label': 'Tok', style: { '--number-input-stepper': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('number-input.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const val = (id) => p.evaluate((id) => document.getElementById(id).value, id);
const btn = (id, i) => `#${id} ~ .dk-number-input__steppers .dk-number-input__step:nth-child(${i})`;

const d = await p.evaluate(() => { const i = document.getElementById('qty'), box = i.parentElement, bs = box.querySelectorAll('.dk-number-input__step'); return { type: i.type, role: i.getAttribute('role'), now: i.getAttribute('aria-valuenow'), min: i.getAttribute('aria-valuemin'), max: i.getAttribute('aria-valuemax'), mode: i.inputMode, ref: window.nr.current === i, box: box.className, comp: box.dataset.component, h: box.getBoundingClientRect().height, label: i.labels[0].textContent, v: i.value, b: [...bs].map((x) => x.getAttribute('aria-label') + ':' + x.tabIndex + ':' + x.querySelector('.dk-icon')?.dataset.icon).join() }; });
t('NumberInput: Input\'s box (32px) around a spinbutton with valuenow 5, min 0, max 100, numeric keyboard; − and + buttons out of the Tab order; ref to the input, className to the box', d.type === 'text' && d.role === 'spinbutton' && d.now === '5' && d.min === '0' && d.max === '100' && d.mode === 'numeric' && d.ref && /dk-input dk-number-input dk-input--size-md/.test(d.box) && /extra/.test(d.box) && d.comp === 'number-input' && d.h === 32 && d.label === 'Quantity' && d.v === '5' && d.b === 'Decrease:-1:remove,Increase:-1:add', JSON.stringify(d));
await p.focus('#qty');
await p.keyboard.press('ArrowUp'); const up = await val('qty');
await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); const down = await val('qty');
await p.keyboard.press('PageUp'); const pgup = await val('qty');
await p.keyboard.press('Shift+ArrowDown'); const sh = await val('qty');
await p.keyboard.press('End'); const end = await val('qty');
await p.keyboard.press('ArrowUp'); const capped = await val('qty');
await p.keyboard.press('Home'); const home = await val('qty');
await p.keyboard.press('ArrowDown'); const floor = await val('qty');
t('keys: ArrowUp/Down ±1, PageUp +10, Shift+ArrowDown −10, End and Home go to max and min, and it stays within them', [up, down, pgup, sh, end, capped, home, floor].join() === '6,4,14,4,100,100,0,0', [up, down, pgup, sh, end, capped, home, floor].join());
const hb = await p.evaluate(() => [...document.querySelectorAll('#qty ~ .dk-number-input__steppers button')].map((b) => b.disabled).join());
t('at min, − is disabled and + isn\'t', hb === 'true,false', hb);
await p.fill('#qty', '250'); await p.locator('#qty').blur();
const clampHi = await val('qty');
await p.fill('#qty', ' 7 '); await p.locator('#qty').blur();
const trimmed = await val('qty');
await p.fill('#qty', 'abc'); await p.locator('#qty').blur();
const junk = await val('qty');
await p.fill('#qty', ''); await p.locator('#qty').blur();
const empty = await val('qty');
t('on blur: 250 is clamped to 100, " 7 " becomes 7, junk goes back to the last number, and empty stays empty', clampHi === '100' && trimmed === '7' && junk === '7' && empty === '', [clampHi, trimmed, junk, empty].join('|'));
await p.click(btn('qty', 2));
t('+ on an empty field starts from min + step… (0 → 1), and moves focus into the field', (await val('qty')) === '1' && (await p.evaluate(() => document.activeElement.id)) === 'qty');
await p.click(btn('nctl', 2)); await p.click(btn('nctl', 2)); await p.click(btn('nctl', 2), { force: true });
const c1 = await p.evaluate(() => ({ calls: window.calls.join(), v: document.getElementById('nctl').value, ctl: window.ctl, plus: document.querySelector('#nctl ~ .dk-number-input__steppers button:nth-child(2)').disabled }));
t('controlled: + calls onValueChange (3, 4) and stops at max, where + is disabled', c1.calls === '3,4' && c1.v === '4' && c1.ctl === 4 && c1.plus, JSON.stringify(c1));
await p.evaluate(() => { window.calls = []; window.setCtl(1); }); await p.waitForTimeout(50);
t('controlled: a new value from outside shows in the field', (await val('nctl')) === '1');
await p.fill('#nctl', '3');
const typed = await p.evaluate(() => window.calls.join());
await p.fill('#nctl', '9');
const over = await p.evaluate(() => window.calls.join());
await p.locator('#nctl').blur();
t('controlled: typing a number in range calls onValueChange at once; one out of range waits for blur, which clamps it', typed === '3' && over === '3' && (await p.evaluate(() => window.calls.join())) === '3,4' && (await val('nctl')) === '4', (await p.evaluate(() => window.calls.join())));
await p.focus('#dec'); await p.keyboard.press('ArrowUp'); const d1 = await val('dec');
await p.fill('#dec', '2.333'); await p.locator('#dec').blur(); const d2 = await val('dec');
t('step 0.25: ArrowUp 1.5 → 1.75, and 2.333 rounds to 2 decimals (2.33); decimal keyboard', d1 === '1.75' && d2 === '2.33' && await p.evaluate(() => document.getElementById('dec').inputMode === 'decimal'), [d1, d2].join());
t('steppers={false}: no buttons', await p.evaluate(() => !document.querySelector('#bare ~ .dk-number-input__steppers')));
await p.click(btn('dis', 2), { force: true });
t('disabled: both buttons disabled, the value doesn\'t change', (await val('dis')) === '3' && await p.evaluate(() => [...document.querySelectorAll('#dis ~ .dk-number-input__steppers button')].every((b) => b.disabled)));
const lg = await p.evaluate(() => { const box = document.getElementById('lg').parentElement; return { h: Math.round(box.getBoundingClientRect().height), icon: getComputedStyle(box.querySelector('.dk-number-input__step .dk-icon')).fontSize }; });
t('lg: 44px with 20px icons', lg.h === 44 && lg.icon === '20px', JSON.stringify(lg));
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const box = document.getElementById('lg').parentElement, bg = rgb(getComputedStyle(box).backgroundColor);
    for (const [sel, min] of [['.dk-number-input__step', 3], ['.dk-input__field', 4.5]]) { const r = ratio(rgb(getComputedStyle(box.querySelector(sel)).color), bg); n++; if (r < min) low.push(`${th} ${sel}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the − and + keep 3:1 and the number 4.5:1 on the field in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
await p.hover(btn('lg', 2));
t('a button is shaded on hover', await p.evaluate(() => getComputedStyle(document.querySelector('#lg ~ .dk-number-input__steppers button:nth-child(2)')).backgroundColor !== 'rgba(0, 0, 0, 0)'));
t('--number-input-stepper overrides one field', await p.evaluate(() => getComputedStyle(document.querySelector('#tok ~ .dk-number-input__steppers button')).color === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('NumberInput', R) ? 0 : 1);

// TimePicker: the combobox field and clock button, the list (every step minutes between min and max, in the
// locale's format, the chosen time checked), opening at the chosen or nearest time, keys (arrows, PageUp/Down,
// Ctrl+Home/End, Enter, Escape, Tab), clicking a time, typing ("2:30 pm", "1430", "2p", "14:30"), bad or
// out-of-range text put back, clearing, 24-hour locales, the hidden "HH:mm" input, controlled, disabled,
// contrast in every theme and tokens.
//   node tools/test/time-picker.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;display:flex;flex-direction:column;gap:24px;width:240px"></div>
<script>
var D = window.Diki, h = React.createElement;
window.changes = [];
function Ctl() {
  var s = React.useState('09:00'); window.setCtl = s[1];
  return h(D.TimePicker, { id: 'ctl', 'aria-label': 'Start', value: s[0], onValueChange: function (v) { window.changes.push(String(v)); s[1](v); }, min: '08:00', max: '18:00', step: 15, name: 'start', locale: 'en-US' });
}
function App() {
  return h(React.Fragment, null,
    h(D.Field, { label: 'Meeting' }, h(D.TimePicker, { id: 'tp', locale: 'en-US', className: 'extra', ref: window.tr = React.createRef() })),
    h(Ctl),
    h(D.TimePicker, { id: 'de', 'aria-label': 'Beginn', locale: 'de-DE', defaultValue: '14:30' }),
    h(D.TimePicker, { id: 'dis', 'aria-label': 'Off', disabled: true, defaultValue: '10:00' }),
    h(D.TimePicker, { id: 'tok', 'aria-label': 'Tok', style: { '--time-picker-option-bg-active': 'rgb(1, 2, 3)' } }),
    h(D.TimePicker, { id: 'mn', 'aria-label': 'From min', locale: 'en-US', min: '08:10', max: '10:00', onBlur: function () { window.blurs = (window.blurs || 0) + 1; } }),
    h(D.TimePicker, { id: 'tiny', 'aria-label': 'Tiny step', locale: 'en-US', step: 0.25 }),
    h(Loc));
}
function Loc() {
  var s = React.useState('en-US'); window.setLoc = s[1];
  return h(D.TimePicker, { id: 'loc', 'aria-label': 'Locale', locale: s[0], defaultValue: '14:30' });
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ locale: 'en-US' })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('time-picker.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (id) => p.evaluate((id) => { const i = document.getElementById(id), l = document.getElementById(i.getAttribute('aria-controls')), act = i.getAttribute('aria-activedescendant'); return { v: i.value, open: !l.hidden, exp: i.getAttribute('aria-expanded'), active: act ? document.getElementById(act).querySelector('.dk-time-picker__time').textContent : null, n: l.children.length, first: l.children[0]?.querySelector('.dk-time-picker__time').textContent, last: l.children[l.children.length - 1]?.querySelector('.dk-time-picker__time').textContent, hidden: [...l.querySelectorAll('.dk-icon')].every((x) => x.closest('[aria-hidden=true]')), sel: [...l.querySelectorAll('[aria-selected=true]')].map((o) => o.dataset.value).join() }; }, id);

const a2 = await p.evaluate(() => { const i = document.getElementById('tp'), btn = i.parentElement.querySelector('button'), l = document.getElementById(i.getAttribute('aria-controls')); return { ref: window.tr.current === i, cls: i.parentElement.className, role: i.getAttribute('role'), pop: i.getAttribute('aria-haspopup'), exp: i.getAttribute('aria-expanded'), ph: i.placeholder, lrole: l.getAttribute('role'), llabel: l.getAttribute('aria-label'), btn: btn.getAttribute('aria-label'), tab: btn.tabIndex, label: document.querySelector('label').htmlFor === 'tp' }; });
t('a role="combobox" field (aria-haspopup="listbox", collapsed) in a dk-input box, labelled by Field; a "Choose time" clock button out of the tab order; ref and className', a2.ref && /dk-input/.test(a2.cls) && /extra/.test(a2.cls) && a2.role === 'combobox' && a2.pop === 'listbox' && a2.exp === 'false' && a2.ph === 'hh:mm am' && a2.lrole === 'listbox' && a2.llabel === 'Choose time' && a2.btn === 'Choose time' && a2.tab === -1 && a2.label, JSON.stringify(a2));
await p.focus('#tp'); await p.keyboard.press('ArrowDown');
const o1 = await st('tp');
t('ArrowDown opens a list of every 30 minutes in the locale\'s format (12:00 AM … 11:30 PM)', o1.open && o1.exp === 'true' && o1.n === 48 && o1.first === '12:00 AM' && o1.last === '11:30 PM' && o1.active === '12:00 AM', JSON.stringify(o1));
await p.keyboard.press('ArrowDown'); await p.keyboard.press('PageDown'); await p.keyboard.press('ArrowUp');
t('arrows move one time, PageDown four', (await st('tp')).active === '2:00 AM', (await st('tp')).active);
await p.keyboard.press('Control+End'); const end = (await st('tp')).active; await p.keyboard.press('Control+Home');
t('Ctrl+End and Ctrl+Home go to the last and first times', end === '11:30 PM' && (await st('tp')).active === '12:00 AM');
await p.keyboard.press('PageDown'); await p.keyboard.press('PageDown'); await p.keyboard.press('Enter');
const picked = await st('tp');
t('Enter picks the highlighted time, closes the list and keeps focus in the field', picked.v === '4:00 AM' && !picked.open && (await p.evaluate(() => document.activeElement.id)) === 'tp', JSON.stringify(picked));
await p.keyboard.press('ArrowDown');
const re = await st('tp');
t('reopening highlights and checks the chosen time (the check is hidden from screen readers)', re.active === '4:00 AM' && re.sel === '04:00' && re.hidden && (await p.$$eval('#tp ~ ul .dk-time-picker__check', (x) => x.length)) === 1, JSON.stringify(re));
await p.keyboard.press('Escape');
t('Escape closes the list', !(await st('tp')).open);
await p.click('#tp ~ button');
await p.click('#tp ~ ul [data-value="13:30"]');
t('the clock button opens it; a click picks a time', (await st('tp')).v === '1:30 PM' && !(await st('tp')).open);
const typed2 = [];
for (const [s, want] of [['2:45 pm', '2:45 PM'], ['1430', '2:30 PM'], ['9p', '9:00 PM'], ['07:05', '7:05 AM'], ['18:20', '6:20 PM'], ['12am', '12:00 AM'], ['25:00', '12:00 AM'], ['nonsense', '12:00 AM']]) {
  await p.fill('#tp', s); await p.keyboard.press('Tab'); const v = await p.inputValue('#tp'); typed2.push(`${s}→${v}` + (v === want ? '' : ` WANT ${want}`));
}
t('typing is read on blur: "2:45 pm", "1430", "9p", "07:05", "18:20", "12am"; "25:00" and "nonsense" put back the last good time', !typed2.some((x) => x.includes('WANT')), typed2.join(', '));
await p.fill('#tp', '8:10'); await p.keyboard.press('ArrowDown');
t('opening after typing highlights the nearest time in the list', (await st('tp')).active === '8:00 AM', (await st('tp')).active);
await p.keyboard.press('Tab');
t('Tab closes the list and reads the text', !(await st('tp')).open && (await p.inputValue('#tp')) === '8:10 AM');
await p.fill('#tp', ''); await p.keyboard.press('Tab');
t('clearing the field clears the value', (await p.inputValue('#tp')) === '');

const c = await st('ctl');
await p.focus('#ctl'); await p.keyboard.press('ArrowDown');
const c2 = await st('ctl');
t('min, max and step: 8:00 AM to 6:00 PM every 15 minutes, opening at the value', c.v === '9:00 AM' && c2.n === 41 && c2.first === '8:00 AM' && c2.last === '6:00 PM' && c2.active === '9:00 AM', JSON.stringify(c2));
await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
const hid = () => p.$eval('input[type=hidden][name=start]', (i) => i.value);
t('controlled: onValueChange gets "HH:mm" and the hidden input follows', (await p.evaluate(() => window.changes.join())) === '09:15' && (await hid()) === '09:15');
await p.fill('#ctl', '7:30 pm'); await p.keyboard.press('Tab');
t('a typed time after max puts back the value', (await p.inputValue('#ctl')) === '9:15 AM' && (await p.evaluate(() => window.changes.length)) === 1);
await p.fill('#ctl', '10:07'); await p.keyboard.press('Tab');
t('a typed time off the step is kept', (await hid()) === '10:07');
await p.evaluate(() => window.setCtl('17:45')); await p.waitForTimeout(50);
t('controlled: a new value from outside rewrites the field', (await p.inputValue('#ctl')) === '5:45 PM');
await p.focus('#de'); await p.keyboard.press('ArrowDown');
const de = await st('de');
t('de-DE: 24-hour times (00:00 … 23:30) and placeholder "hh:mm"', de.v === '14:30' && de.first === '00:00' && de.last === '23:30' && (await p.$eval('#de', (i) => i.placeholder)) === 'hh:mm', JSON.stringify(de));
await p.keyboard.press('Escape');
const dis = await p.evaluate(() => { const i = document.getElementById('dis'); return i.disabled && i.parentElement.querySelector('button').disabled && getComputedStyle(i.parentElement).opacity === '0.5'; });
t('disabled: the field and button are disabled and faded', dis);
await p.focus('#ctl'); await p.keyboard.press('ArrowDown');
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const l = document.querySelector('#ctl ~ ul'), bg = getComputedStyle(l).backgroundColor, act = l.querySelector('.dk-time-picker__option--active'), opt = l.querySelector('.dk-time-picker__option:not(.dk-time-picker__option--active)'), chk = l.querySelector('.dk-time-picker__check'), btn = document.querySelector('#ctl ~ button');
    for (const [k, fg, b2, min] of [['time', getComputedStyle(opt).color, bg, 4.5], ['highlighted time', getComputedStyle(act).color, getComputedStyle(act).backgroundColor, 4.5], ['check', getComputedStyle(chk).color, getComputedStyle(chk.parentElement).backgroundColor === 'rgba(0, 0, 0, 0)' ? bg : getComputedStyle(chk.parentElement).backgroundColor, 3], ['clock icon', getComputedStyle(btn).color, getComputedStyle(btn.parentElement).backgroundColor, 3]]) { const x = ratio(rgb(fg), rgb(b2)); n++; if (x < min) low.push(`${th} ${k}: ${x.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: times 4.5:1 (also highlighted), the check and clock icon 3:1, in all six themes', contrast.low.length === 0 && contrast.n === 24, contrast.low.join('; '));
await p.keyboard.press('Escape');
await p.focus('#tok'); await p.keyboard.press('ArrowDown');
t('--time-picker-option-bg-active overrides one picker', await p.$eval('#tok ~ ul .dk-time-picker__option--active', (o) => getComputedStyle(o).backgroundColor === 'rgb(1, 2, 3)'));
await p.click('#tp'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown');
await p.keyboard.type('3:15 pm');
const ty = await st('tp');
await p.keyboard.press('Enter');
const te = await st('tp');
t('typing with the list open moves the highlight to the nearest time, and Enter keeps what was typed', ty.open && ty.active === '3:00 PM' && te.v === '3:15 PM' && !te.open, JSON.stringify([ty.active, te.v, te.open]));
await p.fill('#tp', ''); await p.keyboard.type('9a'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
t('after typing, moving with the arrows makes Enter pick the highlighted time again', (await p.inputValue('#tp')) === '9:30 AM', await p.inputValue('#tp'));
await p.click('#mn'); await p.keyboard.type('8:4');
const b0 = await p.evaluate(() => window.blurs || 0);
await p.click('#mn ~ button');
const mb = await p.evaluate(() => [window.blurs || 0, document.activeElement.id, document.getElementById('mn').value].join());
t('the clock button keeps focus in the field: no blur, and half-typed text is left alone', mb === b0 + ',mn,8:4', mb);
const mnl = await st('mn');
t('the list counts steps from min, like <input type="time">: 8:10, 8:40 … 9:40 AM', mnl.first === '8:10 AM' && mnl.last === '9:40 AM' && mnl.n === 4, JSON.stringify(mnl));
const wd = await p.evaluate(() => { const i = document.getElementById('mn'), l = document.getElementById(i.getAttribute('aria-controls')); return [Math.round(l.getBoundingClientRect().width), Math.round(i.parentElement.getBoundingClientRect().width)]; });
t('the list is at least as wide as the field', wd[0] >= wd[1], wd.join(' >= '));
await p.keyboard.press('Escape');
await p.click('#tiny'); await p.keyboard.press('ArrowDown');
const tn = await st('tiny');
t('a step under one minute falls back to 30', tn.open && tn.n === 48, JSON.stringify(tn));
await p.keyboard.press('Escape');
const l1 = await p.inputValue('#loc');
await p.evaluate(() => window.setLoc('de-DE')); await p.waitForTimeout(50);
t('a new locale rewrites the field in its format', l1 === '2:30 PM' && (await p.inputValue('#loc')) === '14:30', l1 + ' → ' + (await p.inputValue('#loc')));

t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('TimePicker', R) ? 0 : 1);

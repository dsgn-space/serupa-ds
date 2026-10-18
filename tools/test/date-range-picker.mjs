// DateRangePicker: the two fields (labels, placeholder, typing either end, yyyy-mm-dd, bad text put back, a start
// after the end clearing the end), the popup (two months with blank outside days, the outer buttons only,
// picking start then end, a day before the start moving it, the hover preview, closing on completion, Escape and
// an outside click, Alt+ArrowDown), one month, min/max, hidden ISO inputs, controlled, disabled, Field, the range
// fill's contrast in every theme and tokens.
//   node tools/test/date-range-picker.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;display:flex;flex-direction:column;gap:24px;width:700px"></div>
<script>
var D = window.Serupa, h = React.createElement;
window.changes = [];
var s = function (r) { return (r.start ? r.start.toDateString() : '-') + '..' + (r.end ? r.end.toDateString() : '-'); };
function Ctl() {
  var st = React.useState({ start: new Date(2025, 5, 2), end: new Date(2025, 5, 6) }); window.setCtl = st[1];
  return h(D.DateRangePicker, { 'data-testid': 'ctl', 'aria-label': 'Stay', value: st[0], onValueChange: function (r) { window.changes.push(s(r)); st[1](r); }, startName: 'from', endName: 'to', locale: 'en-US', weekStartsOn: 0, min: new Date(2025, 5, 1), max: new Date(2025, 7, 31) });
}
function App() {
  return h(React.Fragment, null,
    h(D.Field, { label: 'Trip', hint: 'mm/dd/yyyy' }, h(D.DateRangePicker, { 'data-testid': 'trip', locale: 'en-US', weekStartsOn: 0, className: 'extra', ref: window.tr = React.createRef(), defaultValue: { start: new Date(2025, 2, 10), end: new Date(2025, 2, 14) } })),
    h(Ctl),
    h(D.DateRangePicker, { 'data-testid': 'one', 'aria-label': 'One', months: 1, locale: 'en-US', weekStartsOn: 0 }),
    h(D.DateRangePicker, { 'data-testid': 'dis', 'aria-label': 'Off', disabled: true }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ locale: 'en-US', viewport: { width: 1000, height: 800 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('date-range-picker.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const trip = '[data-testid=trip]', ctl = '[data-testid=ctl]';
const vals = (sel) => p.$$eval(sel + ' .dk-date-range-picker__field', (f) => f.map((x) => x.value).join(' – '));
const pop = (sel) => sel + ' .dk-date-range-picker__popup';
const isOpen = (sel) => p.$eval(pop(sel), (d) => !d.hidden);
const inRange = (sel) => p.$$eval(pop(sel) + ' .dk-calendar__day--in-range', (x) => x.map((b) => b.dataset.date.slice(5)).join());
const focused = () => p.evaluate(() => document.activeElement.dataset.date || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName);

const a = await p.evaluate(() => { const el = document.querySelector('[data-testid=trip]'), f = el.querySelectorAll('input[type=text]'), label = document.querySelector('label'); return { ref: window.tr.current === el, cls: el.className, role: el.getAttribute('role'), l: [...f].map((x) => x.getAttribute('aria-label')).join(), ph: f[0].placeholder, labelFor: label.htmlFor === f[0].id && !!f[0].id, desc: !!f[0].getAttribute('aria-describedby') && f[0].getAttribute('aria-describedby') === f[1].getAttribute('aria-describedby'), btn: el.querySelector('button').getAttribute('aria-label') }; });
t('a role="group" dk-input box with "Start date" and "End date" fields, a "Choose dates" button; Field labels the start field and describes both; ref and className', a.ref && /dk-input/.test(a.cls) && /extra/.test(a.cls) && a.role === 'group' && a.l === 'Start date,End date' && a.ph === 'mm/dd/yyyy' && a.labelFor && a.desc && a.btn === 'Choose dates', JSON.stringify(a));
t('defaultValue fills both fields', (await vals(trip)) === '03/10/2025 – 03/14/2025');
await p.click(trip + ' button');
const o = await p.evaluate(() => { const d = document.querySelector('[data-testid=trip] .dk-date-range-picker__popup'), cals = d.querySelectorAll('.dk-calendar'); const vis = (sel) => [...d.querySelectorAll(sel)].map((x) => getComputedStyle(x).visibility).join(); return { role: d.getAttribute('role'), top: d.matches(':popover-open'), titles: [...cals].map((c) => c.querySelector('.dk-calendar__title').textContent).join(), blanks: d.querySelectorAll('.dk-calendar__blank').length > 0 && !d.querySelector('.dk-calendar__day--outside'), prev: vis('.dk-calendar__nav--prev'), next: vis('.dk-calendar__nav--next'), focus: document.activeElement.dataset.date, status: d.querySelector('.dk-date-range-picker__status').textContent, sel: [...d.querySelectorAll('[aria-selected=true] button')].map((x) => x.dataset.date).join() }; });
t('the button opens a dialog in the top layer with March and April 2025, other months\' days blank, only the outer month buttons, focus on the start', o.role === 'dialog' && o.top && o.titles === 'March 2025,April 2025' && o.blanks && o.prev === 'visible,hidden' && o.next === 'hidden,visible' && o.focus === '2025-03-10' && o.status === 'Choose the start date', JSON.stringify(o));
t('both ends are selected and the days between filled', o.sel === '2025-03-10,2025-03-14' && (await inRange(trip)) === '03-11,03-12,03-13', o.sel + ' ' + await inRange(trip));
await p.click(pop(trip) + ' [data-date="2025-03-20"]');
const half = { v: await vals(trip), status: await p.$eval(pop(trip) + ' .dk-date-range-picker__status', (x) => x.textContent), open: await isOpen(trip) };
t('the first pick sets the start and clears the end; the popup stays open asking for the end', half.v === '03/20/2025 – ' && half.status === 'Choose the end date' && half.open, JSON.stringify(half));
await p.hover(pop(trip) + ' [data-date="2025-04-02"]');
t('pointing at a later day previews the range, across both months', (await inRange(trip)) === '03-21,03-22,03-23,03-24,03-25,03-26,03-27,03-28,03-29,03-30,03-31,04-01', await inRange(trip));
await p.click(pop(trip) + ' [data-date="2025-03-18"]');
t('a day before the start moves the start instead', (await vals(trip)) === '03/18/2025 – ' && await isOpen(trip));
await p.click(pop(trip) + ' [data-date="2025-04-02"]');
const done = { v: await vals(trip), open: await isOpen(trip), f: await focused() };
t('the second pick sets the end, closes the popup and returns focus to the start field', done.v === '03/18/2025 – 04/02/2025' && !done.open && done.f === 'Start date', JSON.stringify(done));
await p.keyboard.press('Alt+ArrowDown');
const kb = await focused();
await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
t('Alt+ArrowDown opens it; the keyboard picks both ends', kb === '2025-03-18' && (await vals(trip)) === '03/19/2025 – 03/26/2025' && !(await isOpen(trip)), kb + ' ' + await vals(trip));
await p.keyboard.press('Alt+ArrowDown'); await p.keyboard.press('Escape');
t('Escape closes it and returns focus', !(await isOpen(trip)) && (await focused()) === 'Start date');
await p.click(trip + ' button'); await p.mouse.click(990, 790);
t('a click outside closes it', !(await isOpen(trip)));

const f = (sel, i) => `${sel} .dk-date-range-picker__field >> nth=${i}`;
await p.fill(f(trip, 1), '2025-04-30'); await p.keyboard.press('Tab');
t('typing the end (yyyy-mm-dd works anywhere) is read on blur', (await vals(trip)) === '03/19/2025 – 04/30/2025');
await p.fill(f(trip, 0), '99/99/2025'); await p.keyboard.press('Tab');
t('text that isn\'t a date puts back the last good one', (await vals(trip)) === '03/19/2025 – 04/30/2025');
await p.fill(f(trip, 0), '5/15/2025'); await p.press(f(trip, 0), 'Enter');
t('a start after the end clears the end', (await vals(trip)) === '05/15/2025 – ');

const hid = () => p.evaluate(() => ['from', 'to'].map((n) => document.querySelector(`input[type=hidden][name=${n}]`).value).join(' '));
t('startName and endName: hidden inputs send yyyy-mm-dd', (await hid()) === '2025-06-02 2025-06-06');
await p.fill(f(ctl, 1), '9/15/2025'); await p.keyboard.press('Tab');
t('max: a typed end after it puts back the value', (await vals(ctl)) === '06/02/2025 – 06/06/2025' && (await p.evaluate(() => window.changes.length)) === 0);
await p.click(ctl + ' button');
const lim = await p.evaluate(() => { const d = document.querySelector('[data-testid=ctl] .dk-date-range-picker__popup'); return { prev: d.querySelector('.dk-calendar__nav--prev').disabled, before: d.querySelector('[data-date="2025-05-31"]'), first: d.querySelector('[data-date="2025-06-01"]').getAttribute('aria-disabled') }; });
t('min: the first month\'s previous button is disabled', lim.prev && lim.before === null && lim.first === null, JSON.stringify(lim));
await p.click(pop(ctl) + ' [data-date="2025-06-10"]'); await p.click(pop(ctl) + ' [data-date="2025-07-04"]');
t('controlled: onValueChange gets each step, and the hidden inputs follow', (await p.evaluate(() => window.changes.join('|'))) === 'Tue Jun 10 2025..-|Tue Jun 10 2025..Fri Jul 04 2025' && (await hid()) === '2025-06-10 2025-07-04', await p.evaluate(() => window.changes.join('|')));
await p.evaluate(() => window.setCtl({ start: new Date(2025, 7, 1), end: null })); await p.waitForTimeout(50);
t('controlled: a new value from outside rewrites the fields', (await vals(ctl)) === '08/01/2025 – ');
await p.click('[data-testid=one] button');
t('months={1}: one month, with other months\' days shown', (await p.$$eval(pop('[data-testid=one]') + ' .dk-calendar', (c) => c.length)) === 1 && (await p.$$eval(pop('[data-testid=one]') + ' .dk-calendar__day--outside', (c) => c.length)) > 0);
await p.keyboard.press('Escape');
const dis = await p.evaluate(() => { const el = document.querySelector('[data-testid=dis]'); return [...el.querySelectorAll('input, button')].every((x) => x.disabled) && getComputedStyle(el).opacity === '0.5'; });
t('disabled: both fields and the button are disabled and faded', dis);

await p.click(trip + ' button');
await p.click(pop(trip) + ' [data-date="2025-05-20"]');
t('opening with only a start asks for the end: one pick completes it', (await vals(trip)) === '05/15/2025 – 05/20/2025' && !(await isOpen(trip)));
await p.click(trip + ' button');
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.querySelector('[data-testid=trip] .dk-date-range-picker__popup'), bg = getComputedStyle(d).backgroundColor;
    const r = getComputedStyle(d.querySelector('.dk-calendar__day--in-range')), st = getComputedStyle(d.querySelector('.dk-date-range-picker__status')), dash = getComputedStyle(document.querySelector('[data-testid=trip] .dk-date-range-picker__dash'));
    const field = getComputedStyle(document.querySelector('[data-testid=trip]')).backgroundColor;
    for (const [k, fg, b2, min] of [['day in range', r.color, r.backgroundColor, 4.5], ['status', st.color, bg, 4.5], ['dash', dash.color, field, 4.5]]) { const x = ratio(rgb(fg), rgb(b2)); n++; if (x < min) low.push(`${th} ${k}: ${x.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: days in the range, the status line and the dash keep 4.5:1 in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
await p.evaluate(() => document.querySelector('[data-testid=trip]').style.setProperty('--calendar-range-bg', 'rgb(1, 2, 3)'));
t('--calendar-range-bg overrides the fill', await p.$eval(pop(trip) + ' .dk-calendar__day--in-range', (x) => getComputedStyle(x).backgroundColor === 'rgb(1, 2, 3)'));
await p.keyboard.press('Escape');
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('DateRangePicker', R) ? 0 : 1);

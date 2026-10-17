// Calendar and DatePicker: the month grid (six weeks, weekday names, the locale's first day of the week),
// picking, keyboard navigation (arrows, Home/End, PageUp/PageDown with and without Shift, moving into the next
// month), min, max and isDateDisabled, today, controlled month and value; the DatePicker field (typing in the
// locale's order, yyyy-mm-dd, bad or out-of-range text put back on blur, clearing), the popover (opens on the
// button and Alt+ArrowDown with focus on the chosen day, closes on a pick, Escape or a click outside), the
// hidden ISO input, disabled, contrast in every theme and tokens.
//   node tools/test/date-picker.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;display:flex;flex-direction:column;gap:24px;width:360px"></div>
<script>
var D = window.Diki, h = React.createElement;
window.picks = []; window.months = []; window.dp = [];
function Ctl() {
  var s = React.useState(new Date(2025, 0, 15)); window.setCtl = s[1];
  return h(D.DatePicker, { id: 'ctl', 'aria-label': 'Due', value: s[0], onValueChange: function (d) { window.dp.push(d ? d.toDateString() : 'null'); s[1](d); }, name: 'due', locale: 'en-US', min: new Date(2025, 0, 1), max: new Date(2025, 11, 31) });
}
function App() {
  return h(React.Fragment, null,
    h(D.Calendar, { 'data-testid': 'cal', locale: 'en-US', weekStartsOn: 0, defaultMonth: new Date(2025, 2, 10), defaultValue: new Date(2025, 2, 10), className: 'extra', ref: window.cr = React.createRef(),
      min: new Date(2025, 1, 3), max: new Date(2025, 5, 20), isDateDisabled: function (d) { return d.getDay() === 0 && d.getMonth() === 2; },
      onValueChange: function (d) { window.picks.push(d.toDateString()); }, onMonthChange: function (m) { window.months.push(m.toDateString()); } }),
    h(D.Calendar, { 'data-testid': 'de', locale: 'de-DE', defaultMonth: new Date(2025, 2, 1) }),
    h(D.Calendar, { 'data-testid': 'today' }),
    h(D.DatePicker, { id: 'dp', 'aria-label': 'Start', locale: 'en-US', ref: window.dr = React.createRef() }),
    h(D.DatePicker, { id: 'dpde', 'aria-label': 'Beginn', locale: 'de-DE', defaultValue: new Date(2025, 10, 22) }),
    h(Ctl),
    h(D.DatePicker, { id: 'dis', 'aria-label': 'Off', disabled: true }),
    h(D.Calendar, { 'data-testid': 'tok', style: { '--calendar-selected-bg': 'rgb(1, 2, 3)' }, defaultValue: new Date(2025, 2, 10), weekStartsOn: 0 }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ locale: 'en-US' })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('date-picker.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const cal = '[data-testid=cal]';
const focused = () => p.evaluate(() => document.activeElement.dataset.date || document.activeElement.id || document.activeElement.tagName);
const title = (sel) => p.$eval(sel + ' .dk-calendar__title', (e) => e.textContent);

const g = await p.evaluate(() => { const el = document.querySelector('[data-testid=cal]'), grid = el.querySelector('[role=grid]'); return { ref: window.cr.current === el, cls: el.className, title: el.querySelector('.dk-calendar__title').textContent, live: el.querySelector('.dk-calendar__title').getAttribute('aria-live'), labelled: document.getElementById(grid.getAttribute('aria-labelledby')).textContent, rows: grid.querySelectorAll('tbody tr').length, cells: grid.querySelectorAll('tbody button').length, heads: [...grid.querySelectorAll('th')].map((x) => x.textContent).join(), abbr: grid.querySelector('th').getAttribute('abbr'), first: grid.querySelector('tbody button').dataset.date, tabs: [...grid.querySelectorAll('button[tabindex="0"]')].map((x) => x.dataset.date).join(), label: grid.querySelector('[data-date="2025-03-10"]').getAttribute('aria-label'), sel: grid.querySelector('[data-date="2025-03-10"]').parentElement.getAttribute('aria-selected'), prev: el.querySelector('.dk-calendar__nav--prev').getAttribute('aria-label'), outside: grid.querySelector('[data-date="2025-02-23"]').className }; });
t('a grid named by the "March 2025" title (aria-live), six weeks of 7 days from Sun Feb 23, weekday headers with full names, one Tab stop on the selected day; ref and className', g.ref && /extra/.test(g.cls) && g.title === 'March 2025' && g.live === 'polite' && g.labelled === 'March 2025' && g.rows === 6 && g.cells === 42 && g.heads === 'Sun,Mon,Tue,Wed,Thu,Fri,Sat' && g.abbr === 'Sunday' && g.first === '2025-02-23' && g.tabs === '2025-03-10' && /outside/.test(g.outside), JSON.stringify(g));
t('each day is named by its full date and the chosen one is aria-selected', g.label === 'Monday, March 10, 2025' && g.sel === 'true', g.label);
const de = await p.evaluate(() => [...document.querySelectorAll('[data-testid=de] th')].map((x) => x.textContent).join() + ' ' + document.querySelector('[data-testid=de] .dk-calendar__title').textContent);
t('de-DE: German names and weeks starting on Monday', /^Mo\.?,Di\.?,Mi\.?,Do\.?,Fr\.?,Sa\.?,So\.? März 2025$/.test(de), de);
// Without Intl.Locale week info (Firefox has none), the week start comes from the locale's region.
const nw = await (await b.newContext({ locale: 'en-US' })).newPage();
await nw.addInitScript(() => { delete Intl.Locale.prototype.getWeekInfo; delete Intl.Locale.prototype.weekInfo; });
await nw.goto(writePage('date-picker-noweek.html', `<div id="root"></div><script>var h = React.createElement, D = window.Diki;
ReactDOM.createRoot(document.getElementById('root')).render(h('div', null, ['en-US', 'de-DE', 'de', 'ar-EG', 'dv-MV', 'pt-BR'].map(function (l) { return h(D.Calendar, { key: l, 'data-l': l, locale: l, defaultMonth: new Date(2025, 2, 1) }); })));
</script>`, { react: true }));
await nw.waitForTimeout(300);
const starts = await nw.evaluate(() => [...document.querySelectorAll('[data-l]')].map((c) => c.dataset.l + ':' + c.querySelector('[role=grid] [data-date]').dataset.date).join());
t('without Intl.Locale week info: weeks start by region (US Sunday, DE Monday, EG Saturday, MV Friday, BR Sunday)', starts === 'en-US:2025-02-23,de-DE:2025-02-24,de:2025-02-24,ar-EG:2025-03-01,dv-MV:2025-02-28,pt-BR:2025-02-23', starts);
await nw.close();
const td = await p.evaluate(() => { const b = document.querySelector('[data-testid=today] [aria-current=date]'); const n = new Date(); return b && b.textContent === String(n.getDate()) && b.getAttribute('tabindex') === '0' && /today/.test(b.className); });
t('today is aria-current="date" and the Tab stop when nothing is chosen', td);

await p.focus(cal + ' [data-date="2025-03-10"]');
const keys = [];
for (const [k, want] of [['ArrowRight', '2025-03-11'], ['ArrowDown', '2025-03-18'], ['ArrowLeft', '2025-03-17'], ['ArrowUp', '2025-03-10'], ['End', '2025-03-15'], ['Home', '2025-03-09'], ['PageDown', '2025-04-09'], ['PageUp', '2025-03-09'], ['Shift+PageUp', '2024-03-09']]) {
  await p.keyboard.press(k); const f = await focused(); keys.push(k + '→' + f); if (f !== want) keys.push('WANT ' + want);
}
t('arrows move a day or week, Home/End to the week\'s ends, PageUp/PageDown a month, Shift+PageUp a year', !keys.some((x) => x.startsWith('WANT')), keys.join(' '));
await p.keyboard.press('Shift+PageDown'); await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp');
t('moving past the month shows the next one and keeps focus on the day', (await focused()) === '2025-02-23' && (await title(cal)) === 'February 2025', await focused());
await p.keyboard.press('PageDown'); await p.keyboard.press('PageDown');
t('onMonthChange gets the first of each month shown', (await p.evaluate(() => window.months.slice(-2).join('|'))) === 'Sat Mar 01 2025|Tue Apr 01 2025', await p.evaluate(() => window.months.join('|')));
await p.focus(cal + ' [data-date="2025-04-08"]'); await p.keyboard.press('Enter');
await p.click(cal + ' [data-date="2025-04-17"]');
const pk = await p.evaluate(() => ({ picks: window.picks.join('|'), sel: [...document.querySelectorAll('[data-testid=cal] [aria-selected=true] button')].map((b) => b.dataset.date).join() }));
t('Enter and a click pick a day: onValueChange, aria-selected moves', pk.picks === 'Tue Apr 08 2025|Thu Apr 17 2025' && pk.sel === '2025-04-17', JSON.stringify(pk));
await p.click(cal + ' .dk-calendar__nav--prev'); await p.click(cal + ' .dk-calendar__nav--prev');
const lim = await p.evaluate(() => { const el = document.querySelector('[data-testid=cal]'); return { title: el.querySelector('.dk-calendar__title').textContent, prev: el.querySelector('.dk-calendar__nav--prev').disabled, before: el.querySelector('[data-date="2025-02-02"]').getAttribute('aria-disabled'), ok: el.querySelector('[data-date="2025-02-03"]').getAttribute('aria-disabled') }; });
t('min: days before it are aria-disabled and the previous button stops at its month', lim.title === 'February 2025' && lim.prev && lim.before === 'true' && lim.ok === null, JSON.stringify(lim));
await p.click(cal + ' .dk-calendar__nav--next');
await p.click(cal + ' [data-date="2025-03-16"]', { force: true });
const sunday = await p.evaluate(() => ({ dis: document.querySelector('[data-testid=cal] [data-date="2025-03-16"]').getAttribute('aria-disabled'), picks: window.picks.length, op: getComputedStyle(document.querySelector('[data-testid=cal] [data-date="2025-03-16"]')).opacity }));
t('isDateDisabled: refused days are aria-disabled, faded and can\'t be picked', sunday.dis === 'true' && sunday.picks === 2 && sunday.op === '0.5', JSON.stringify(sunday));
for (let i = 0; i < 3; i++) await p.click(cal + ' .dk-calendar__nav--next');
t('max: the next button stops at its month', (await title(cal)) === 'June 2025' && (await p.$eval(cal + ' .dk-calendar__nav--next', (b) => b.disabled)));

// DatePicker
const dp0 = await p.evaluate(() => { const i = document.getElementById('dp'), btn = i.parentElement.querySelector('.dk-date-picker__button'); return { ref: window.dr.current === i, ph: i.placeholder, mode: i.inputMode, btn: btn.getAttribute('aria-label'), pop: btn.getAttribute('aria-haspopup'), exp: btn.getAttribute('aria-expanded'), box: i.parentElement.className, de: document.getElementById('dpde').value + ' ' + document.getElementById('dpde').placeholder }; });
t('a dk-input field with a "Choose date" button (aria-haspopup="dialog"); the placeholder shows the locale\'s pattern; ref goes to the field', dp0.ref && dp0.ph === 'mm/dd/yyyy' && dp0.mode === 'numeric' && dp0.btn === 'Choose date' && dp0.pop === 'dialog' && dp0.exp === 'false' && /dk-input/.test(dp0.box) && dp0.de === '22.11.2025 dd.mm.yyyy', JSON.stringify(dp0));
await p.fill('#dp', '3/7/25'); await p.keyboard.press('Tab');
t('typed text in the locale\'s order is read on blur and written back in full (3/7/25 → 03/07/2025)', (await p.inputValue('#dp')) === '03/07/2025');
await p.fill('#dp', '2024-12-31'); await p.press('#dp', 'Enter');
t('yyyy-mm-dd works in any locale, and Enter reads it', (await p.inputValue('#dp')) === '12/31/2024');
await p.fill('#dp', '13/45/2024'); await p.keyboard.press('Tab');
t('text that isn\'t a date puts back the last good one', (await p.inputValue('#dp')) === '12/31/2024');
await p.click('#dp ~ .dk-date-picker__button');
const op = await p.evaluate(() => { const d = document.querySelector('#dp ~ .dk-date-picker__popup'); return { open: !d.hidden, role: d.getAttribute('role'), label: d.getAttribute('aria-label'), focus: document.activeElement.dataset.date, exp: document.querySelector('#dp ~ .dk-date-picker__button').getAttribute('aria-expanded'), top: d.matches(':popover-open') }; });
t('the button opens a dialog in the top layer with focus on the chosen day', op.open && op.role === 'dialog' && op.label === 'Choose date' && op.focus === '2024-12-31' && op.exp === 'true' && op.top, JSON.stringify(op));
await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter');
const after = await p.evaluate(() => ({ v: document.getElementById('dp').value, open: !document.querySelector('#dp ~ .dk-date-picker__popup').hidden, focus: document.activeElement.id }));
t('picking a day fills the field, closes the popup and returns focus to the field', after.v === '01/01/2025' && !after.open && after.focus === 'dp', JSON.stringify(after));
await p.keyboard.press('Alt+ArrowDown');
const alt = await focused();
await p.keyboard.press('Escape');
t('Alt+ArrowDown opens it from the field; Escape closes it and returns focus', alt === '2025-01-01' && (await focused()) === 'dp' && (await p.$eval('#dp ~ .dk-date-picker__popup', (d) => d.hidden)), alt);
await p.click('#dp ~ .dk-date-picker__button'); await p.mouse.click(340, 5);
t('a click outside closes it', await p.$eval('#dp ~ .dk-date-picker__popup', (d) => d.hidden));
await p.fill('#dp', ''); await p.keyboard.press('Tab');
t('clearing the field clears the value', (await p.inputValue('#dp')) === '');

const hid = () => p.$eval('input[type=hidden][name=due]', (i) => i.value);
t('name: a hidden input sends yyyy-mm-dd', (await hid()) === '2025-01-15');
await p.fill('#ctl', '6/1/2026'); await p.keyboard.press('Tab');
t('controlled, with max: a typed day after max puts back the value', (await p.inputValue('#ctl')) === '01/15/2025' && (await p.evaluate(() => window.dp.length)) === 0);
await p.fill('#ctl', '2/14/2025'); await p.keyboard.press('Tab');
t('controlled: a good day calls onValueChange and the hidden input follows', (await p.evaluate(() => window.dp.join())) === 'Fri Feb 14 2025' && (await hid()) === '2025-02-14');
await p.evaluate(() => window.setCtl(new Date(2025, 6, 4))); await p.waitForTimeout(50);
t('controlled: a new value from outside rewrites the field', (await p.inputValue('#ctl')) === '07/04/2025');
const dis = await p.evaluate(() => { const i = document.getElementById('dis'); return { i: i.disabled, b: i.parentElement.querySelector('button').disabled, op: getComputedStyle(i.parentElement).opacity }; });
t('disabled: the field and button are disabled and faded', dis.i && dis.b && dis.op === '0.5', JSON.stringify(dis));

await p.click('#ctl ~ .dk-date-picker__button');
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const pop = document.querySelector('#ctl ~ .dk-date-picker__popup'), bg = getComputedStyle(pop).backgroundColor, cs = (sel) => getComputedStyle(pop.querySelector(sel));
    const day = pop.querySelector('.dk-calendar__day:not(.dk-calendar__day--outside):not(.dk-calendar__day--selected):not(.dk-calendar__day--today)');
    const sel = cs('.dk-calendar__day--selected');
    const pairs = [['title', cs('.dk-calendar__title').color, bg, 4.5], ['weekday', cs('th').color, bg, 4.5], ['day', getComputedStyle(day).color, bg, 4.5], ['outside day', cs('.dk-calendar__day--outside').color, bg, 4.5], ['selected day', sel.color, sel.backgroundColor, 4.5], ['selected day vs popup', sel.backgroundColor, bg, 3]];
    day.style.background = 'var(--calendar-day-bg-hover, var(--surface-muted))';
    pairs.push(['day on hover', getComputedStyle(day).color, getComputedStyle(day).backgroundColor, 4.5]);
    day.style.background = '';
    const tb = document.querySelector('[data-testid=today] .dk-calendar__day--today:not(.dk-calendar__day--selected)');
    if (tb) pairs.push(['today', getComputedStyle(tb).color, getComputedStyle(document.body).backgroundColor, 4.5]);
    const btn = document.querySelector('#ctl ~ .dk-date-picker__button'), field = getComputedStyle(btn.parentElement).backgroundColor;
    pairs.push(['calendar button', getComputedStyle(btn).color, field, 3]);
    for (const [k, fg, b2, min] of pairs) { const r = ratio(rgb(fg), rgb(b2)); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: day, weekday, outside, today, hover and selected text 4.5:1, the selected fill and calendar icon 3:1, in all six themes', contrast.low.length === 0 && contrast.n === 54, contrast.low.join('; ') + ' n=' + contrast.n);
await p.keyboard.press('Escape');
t('--calendar-selected-bg overrides one calendar', await p.$eval('[data-testid=tok] .dk-calendar__day--selected', (b) => getComputedStyle(b).backgroundColor === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Calendar and DatePicker', R) ? 0 : 1);

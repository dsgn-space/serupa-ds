// Combobox: the ARIA combobox pattern (role, expanded, controls, activedescendant, listbox, options), opening,
// filtering (case and accents), the keyboard (arrows skip disabled and wrap, Enter, Escape, Alt+ArrowDown),
// clicks, leaving the field (reverts, or clears when emptied), the chevron and clear buttons, controlled,
// filter={false} with onInputChange and loading, empty results, placement, contrast in every theme and tokens.
//   node tools/test/combobox.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;width:320px;display:flex;flex-direction:column;gap:12px"></div>
<script>
var D = window.Diki, h = React.createElement, C = D.Combobox;
window.calls = []; window.typed = [];
var COUNTRIES = ['Argentina', 'Brazil', 'Canada', { value: 'ci', label: 'Côte d’Ivoire', description: 'Africa' }, { value: 'dk', label: 'Denmark', disabled: true }, 'Egypt', 'France'];
function Controlled() {
  var s = React.useState('Canada'); window.setCtl = s[1]; window.ctl = s[0];
  return h(C, { id: 'ctl', 'aria-label': 'Country', options: COUNTRIES, value: s[0], clearable: true, name: 'country', onValueChange: function (v) { window.calls.push(String(v)); s[1](v); } });
}
function Async() {
  var q = React.useState(''), l = React.useState(false);
  var opts = ['Ada', 'Grace', 'Linus'].filter(function (n) { return n.toLowerCase().indexOf(q[0].toLowerCase()) === 0; });
  return h(C, { id: 'async', 'aria-label': 'Person', options: opts, filter: false, loading: l[0], loadingText: 'Finding people…', onInputChange: function (t) { window.typed.push(t); q[1](t); l[1](t === 'zz'); } });
}
function App() {
  return h(React.Fragment, null,
    h('button', { id: 'before' }, 'Before'),
    h('label', { htmlFor: 'cb' }, 'Country'),
    h(C, { id: 'cb', options: COUNTRIES, placeholder: 'Pick a country', ref: window.cr = React.createRef(), className: 'extra' }),
    h(Controlled),
    h(Async),
    h(C, { id: 'dis', 'aria-label': 'Dis', options: COUNTRIES, disabled: true }),
    h(C, { id: 'tok', 'aria-label': 'Tok', options: COUNTRIES, style: { '--combobox-chevron': 'rgb(1, 2, 3)' } }),
    h('div', { style: { height: 900 } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 600, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('combobox.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (id) => p.evaluate((id) => { const i = document.getElementById(id), list = document.getElementById(i.getAttribute('aria-controls')), pop = list.parentElement, ad = i.getAttribute('aria-activedescendant'); return { open: i.getAttribute('aria-expanded'), shown: !pop.hidden && pop.matches(':popover-open'), opts: [...list.querySelectorAll('[role=option]')].map((o) => o.querySelector('.dk-combobox__label').textContent), active: ad ? document.getElementById(ad).querySelector('.dk-combobox__label').textContent : null, text: i.value, focus: document.activeElement === i }; }, id);

const a = await p.evaluate(() => { const i = document.getElementById('cb'), list = document.getElementById(i.getAttribute('aria-controls')), box = i.parentElement; return { role: i.getAttribute('role'), exp: i.getAttribute('aria-expanded'), ac: i.getAttribute('aria-autocomplete'), hp: i.getAttribute('aria-haspopup'), lrole: list.getAttribute('role'), auto: i.autocomplete, label: i.labels[0].textContent, ref: window.cr.current === i, cls: box.className, comp: box.dataset.component, h: box.getBoundingClientRect().height, hidden: list.parentElement.hidden, toggle: box.querySelector('.dk-combobox__toggle').getAttribute('aria-label') + ':' + box.querySelector('.dk-combobox__toggle').tabIndex }; });
t('a role="combobox" field (aria-autocomplete list, collapsed) controlling a hidden role="listbox"; Input\'s 32px box; a chevron button out of the Tab order; ref and className', a.role === 'combobox' && a.exp === 'false' && a.ac === 'list' && a.hp === 'listbox' && a.lrole === 'listbox' && a.auto === 'off' && a.label === 'Country' && a.ref && /dk-input dk-combobox/.test(a.cls) && /extra/.test(a.cls) && a.comp === 'combobox' && a.h === 32 && a.hidden && a.toggle === 'Show options:-1', JSON.stringify(a));
await p.focus('#before'); await p.keyboard.press('Tab'); await p.keyboard.press('ArrowDown');
const s1 = await st('cb');
t('ArrowDown opens the list in the top layer with every option, the first highlighted, focus staying in the field', s1.open === 'true' && s1.shown && s1.opts.length === 7 && s1.active === 'Argentina' && s1.focus, JSON.stringify(s1));
await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); const k1 = (await st('cb')).active;
await p.keyboard.press('ArrowDown'); const k2 = (await st('cb')).active;
await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); const k3 = (await st('cb')).active;
await p.keyboard.press('ArrowUp'); const k4 = (await st('cb')).active;
t('arrows: down to Côte d’Ivoire, skip the disabled Denmark to Egypt, wrap past France to Argentina, ArrowUp wraps back to France', k1 === 'Côte d’Ivoire' && k2 === 'Egypt' && k3 === 'Argentina' && k4 === 'France', [k1, k2, k3, k4].join());
await p.keyboard.press('ArrowUp'); await p.keyboard.press('Enter');
const s2 = await st('cb');
t('Enter picks the highlighted option: the field shows it and the list closes', s2.text === 'Egypt' && s2.open === 'false' && !s2.shown && s2.focus, JSON.stringify(s2));
await p.keyboard.press('ArrowDown');
const s3 = await p.evaluate(() => { const sel = document.querySelector('#cb ~ .dk-combobox__popup [aria-selected=true]'); return { sel: sel && sel.textContent, check: !!(sel && sel.querySelector('.dk-combobox__check')) }; });
t('reopening highlights the picked option, marked aria-selected with a check', (await st('cb')).active === 'Egypt' && s3.sel.startsWith('Egypt') && s3.check, JSON.stringify(s3));
await p.keyboard.press('Escape');
await p.keyboard.press('Control+a'); await p.keyboard.type('cote');
const s4 = await st('cb');
t('typing filters, ignoring case and accents ("cote" finds Côte d’Ivoire) and highlights the first match', s4.open === 'true' && s4.opts.join() === 'Côte d’Ivoire' && s4.active === 'Côte d’Ivoire', JSON.stringify(s4));
await p.keyboard.type('xyz');
const empty = await p.evaluate(() => { const m = document.querySelector('#cb ~ .dk-combobox__popup .dk-combobox__message'); return m && m.textContent + ':' + m.getAttribute('role'); });
t('no match: "No results" in a status message', (await st('cb')).opts.length === 0 && empty === 'No results:status', empty);
await p.keyboard.press('Escape');
const s5 = await st('cb');
t('Escape closes and puts back the picked label', s5.open === 'false' && s5.text === 'Egypt', JSON.stringify(s5));
await p.keyboard.press('Control+a'); await p.keyboard.type('bra'); await p.focus('#before');
t('leaving the field with half-typed text puts back the picked label', (await p.evaluate(() => document.getElementById('cb').value)) === 'Egypt');
await p.click('#cb');
const s6 = await st('cb');
await p.click('#cb ~ .dk-combobox__popup [role=option]:nth-child(2)');
const s7 = await st('cb');
t('a click on the field opens it (all options); a click on an option picks it and keeps focus in the field', s6.open === 'true' && s6.opts.length === 7 && s7.text === 'Brazil' && s7.open === 'false' && s7.focus, JSON.stringify([s6.open, s7]));
await p.click('#cb ~ .dk-combobox__toggle');
const tg1 = await st('cb');
await p.click('#cb ~ .dk-combobox__popup [role=option]:nth-child(5)', { force: true });
const tg2 = await st('cb');
await p.click('#cb ~ .dk-combobox__toggle');
const tg3 = await st('cb');
t('the chevron opens and closes the list, focusing the field; a disabled option can\'t be picked', tg1.open === 'true' && tg1.focus && tg2.text === 'Brazil' && tg2.open === 'true' && tg3.open === 'false', JSON.stringify([tg1.open, tg2.text, tg3.open]));
const place = await p.evaluate(() => { const box = document.getElementById('cb').parentElement.getBoundingClientRect(); document.getElementById('cb').click(); return new Promise((ok) => setTimeout(() => { const pop = document.querySelector('#cb ~ .dk-combobox__popup').getBoundingClientRect(); ok({ gap: Math.round(pop.top - box.bottom), left: Math.round(pop.left - box.left), w: Math.round(pop.width - box.width), mh: Math.round(pop.height) }); }, 50)); });
t('the list sits 4px under the field, aligned and at least as wide, at most 240px tall', place.gap === 4 && place.left === 0 && place.w >= 0 && place.mh <= 240, JSON.stringify(place));
await p.keyboard.press('Escape');
await p.keyboard.press('Control+a'); await p.keyboard.press('Backspace'); await p.focus('#before');
t('emptying the field and leaving clears the selection', (await p.evaluate(() => document.getElementById('cb').value)) === '' && await p.evaluate(() => !document.querySelector('#cb ~ .dk-combobox__popup [aria-selected=true]')));

const c0 = await p.evaluate(() => ({ text: document.getElementById('ctl').value, input: document.querySelector('#ctl ~ input[type=hidden]').value, clear: document.querySelector('#ctl ~ .dk-combobox__clear').getAttribute('aria-label') }));
await p.click('#ctl'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
const c1 = await p.evaluate(() => ({ calls: window.calls.join(), ctl: window.ctl, text: document.getElementById('ctl').value, input: document.querySelector('#ctl ~ input[type=hidden]').value }));
t('controlled: shows the value\'s label; picking calls onValueChange; the hidden input follows', c0.text === 'Canada' && c0.input === 'Canada' && c0.clear === 'Clear' && c1.calls === 'ci' && c1.ctl === 'ci' && c1.text === 'Côte d’Ivoire' && c1.input === 'ci', JSON.stringify([c0, c1]));
await p.click('#ctl ~ .dk-combobox__clear');
const c2 = await p.evaluate(() => ({ calls: window.calls.join(), text: document.getElementById('ctl').value, focus: document.activeElement.id, clear: !!document.querySelector('#ctl ~ .dk-combobox__clear') }));
t('clearable: the × clears to null, empties the field, keeps focus and hides itself', c2.calls === 'ci,null' && c2.text === '' && c2.focus === 'ctl' && !c2.clear, JSON.stringify(c2));
await p.focus('#before'); await p.evaluate(() => window.setCtl('France')); await p.waitForTimeout(50);
t('controlled: a new value from outside shows its label', (await p.evaluate(() => document.getElementById('ctl').value)) === 'France');
await p.click('#async'); await p.keyboard.type('gr');
const as1 = await st('async');
await p.keyboard.press('Control+a'); await p.keyboard.type('zz');
const ld = await p.evaluate(() => { const m = document.querySelector('#async ~ .dk-combobox__popup .dk-combobox__message'); return m && m.textContent + ':' + m.getAttribute('role') + ':' + !!m.querySelector('[data-component=loader]'); });
t('filter={false}: the list shows what the app passes (from onInputChange); loading shows a status row with a loader', as1.opts.join() === 'Grace' && (await p.evaluate(() => window.typed.slice(0, 2).join())) === 'g,gr' && ld === 'Finding people…:status:true', JSON.stringify([as1.opts, ld]));
await p.keyboard.press('Escape');
await p.click('#dis', { force: true });
t('disabled: doesn\'t open, and the chevron is disabled', (await st('dis')).open === 'false' && await p.evaluate(() => document.querySelector('#dis ~ .dk-combobox__toggle').disabled));
await p.focus('#cb'); for (let i = 0; i < 4; i++) await p.keyboard.press('ArrowDown');
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const pop = document.querySelector('#cb ~ .dk-combobox__popup'), act = pop.querySelector('.dk-combobox__option--active'), bg = rgb(getComputedStyle(pop).backgroundColor), abg = rgb(getComputedStyle(act).backgroundColor), field = rgb(getComputedStyle(document.getElementById('cb').parentElement).backgroundColor);
    const pairs = [['label', getComputedStyle(pop.querySelector('.dk-combobox__label')).color, bg, 4.5], ['active label', getComputedStyle(act).color, abg, 4.5], ['description on active', getComputedStyle(act.querySelector('.dk-combobox__description')).color, abg, 4.5], ['chevron', getComputedStyle(document.querySelector('#cb ~ .dk-combobox__toggle')).color, field, 3]];
    for (const [k, c, on, min] of pairs) { const r = ratio(rgb(c), on); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: labels and descriptions keep 4.5:1, even highlighted, and the chevron 3:1, in all six themes', contrast.low.length === 0 && contrast.n === 24, contrast.low.join('; '));
await p.keyboard.press('Escape');
t('--combobox-chevron overrides one field', await p.evaluate(() => getComputedStyle(document.querySelector('#tok ~ .dk-combobox__toggle')).color === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Combobox', R) ? 0 : 1);

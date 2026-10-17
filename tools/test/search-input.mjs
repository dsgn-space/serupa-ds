// SearchInput: Input's box, type="search", the search icon, the clear button (shown once something is typed,
// clears, fires onChange, keeps focus), Escape and Enter, controlled and uncontrolled, loading, disabled,
// contrast in every theme and tokens.
//   node tools/test/search-input.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); }</style><div id="root" style="padding:16px;width:320px;display:flex;flex-direction:column;gap:12px"></div>
<script>
var D = window.Serupa, h = React.createElement, S = D.SearchInput;
window.calls = [];
function Controlled() {
  var s = React.useState('atlas'); window.ctl = s[0];
  return h(S, { id: 'sctl', 'aria-label': 'Ctl', value: s[0], onChange: function (e) { window.calls.push('change:' + e.target.value); s[1](e.target.value); }, onClear: function () { window.calls.push('clear'); } });
}
function App() {
  var l = React.useState(false); window.setLoading = l[1];
  return h(React.Fragment, null,
    h('label', { htmlFor: 'q' }, 'Search projects'),
    h(S, { id: 'q', ref: window.sr = React.createRef(), className: 'extra', placeholder: 'Search projects', loading: l[0], onSearch: function (v) { window.calls.push('search:' + v); } }),
    h(Controlled),
    h(S, { id: 'sdis', 'aria-label': 'Dis', disabled: true, defaultValue: 'x' }),
    h(S, { id: 'slg', 'aria-label': 'Lg', size: 'lg', defaultValue: 'big', clearLabel: 'Clear' }),
    h(S, { id: 'stok', 'aria-label': 'Tok', defaultValue: 'x', style: { '--search-input-clear': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('search-input.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const clearBtn = (id) => p.evaluate((id) => !!document.getElementById(id).parentElement.querySelector('.dk-search-input__clear'), id);

const d = await p.evaluate(() => { const i = document.getElementById('q'), box = i.parentElement, ic = box.querySelector('.dk-search-input__icon'); return { type: i.type, role: i.matches('[type=search]'), hint: i.getAttribute('enterkeyhint'), ref: window.sr.current === i, box: box.className, comp: box.dataset.component, h: box.getBoundingClientRect().height, label: i.labels[0].textContent, icon: ic.textContent, hidden: ic.getAttribute('aria-hidden'), clear: !!box.querySelector('.dk-search-input__clear') }; });
t('SearchInput: Input\'s box (32px) around a type="search" field with a search icon at the start and no clear button yet; ref to the input, className to the box', d.type === 'search' && d.hint === 'search' && d.ref && d.box === 'dk-input dk-search-input dk-input--size-md extra' && d.comp === 'search-input' && d.h === 32 && d.label === 'Search projects' && d.icon === 'search' && d.hidden === 'true' && !d.clear, JSON.stringify(d));
await p.click('#q'); await p.keyboard.type('road');
const c = await p.evaluate(() => { const btn = document.querySelector('#q ~ .dk-search-input__clear'); return btn && { label: btn.getAttribute('aria-label'), ctl: btn.getAttribute('aria-controls'), type: btn.type }; });
t('typing shows a × button named "Clear search", controlling the field', c && c.label === 'Clear search' && c.ctl === 'q' && c.type === 'button', JSON.stringify(c));
await p.keyboard.press('Enter');
t('Enter calls onSearch with the text', (await p.evaluate(() => window.calls.join())) === 'search:road');
await p.click('#q ~ .dk-search-input__clear');
t('the × clears the field, hides itself and keeps focus in the field', (await p.evaluate(() => document.getElementById('q').value)) === '' && !(await clearBtn('q')) && (await p.evaluate(() => document.activeElement.id)) === 'q');
await p.keyboard.type('ab'); await p.keyboard.press('Escape');
t('Escape clears the field (uncontrolled)', (await p.evaluate(() => document.getElementById('q').value)) === '' && !(await clearBtn('q')));
await p.evaluate(() => { window.calls = []; });
await p.click('#sctl ~ .dk-search-input__clear');
t('controlled: the × fires onChange with "" and then onClear, and the value follows', (await p.evaluate(() => window.calls.join())) === 'change:,clear' && (await p.evaluate(() => window.ctl)) === '' && !(await clearBtn('sctl')), await p.evaluate(() => window.calls.join()));
await p.keyboard.type('x'); await p.evaluate(() => { window.calls = []; });
const esc = await p.evaluate(() => { let outer = 0; const f = () => outer++; document.addEventListener('keydown', f); document.getElementById('sctl').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); document.removeEventListener('keydown', f); return outer; });
await p.waitForTimeout(50);
t('controlled: Escape clears it too, without reaching listeners outside (a dialog stays open)', (await p.evaluate(() => window.calls.join())) === 'change:,clear' && esc === 0, await p.evaluate(() => window.calls.join()) + ' outer=' + esc);
t('disabled: no clear button, even with text', !(await clearBtn('sdis')));
const lg = await p.evaluate(() => { const box = document.getElementById('slg').parentElement; return { h: Math.round(box.getBoundingClientRect().height), label: box.querySelector('.dk-search-input__clear').getAttribute('aria-label'), icon: getComputedStyle(box.querySelector('.dk-search-input__icon .dk-icon')).fontSize }; });
t('lg: 44px, a 20px icon; clearLabel names the ×', lg.h === 44 && lg.label === 'Clear' && lg.icon === '20px', JSON.stringify(lg));
await p.evaluate(() => window.setLoading(true)); await p.waitForTimeout(100);
const ld = await p.evaluate(() => { const ic = document.querySelector('#q').parentElement.querySelector('.dk-search-input__icon'), l = ic.querySelector('[data-component=loader]'); return l && { role: l.getAttribute('role'), label: l.getAttribute('aria-label'), w: Math.round(l.getBoundingClientRect().width), hidden: ic.getAttribute('aria-hidden') }; });
t('loading: a 16px loader named "Searching" in place of the icon', ld && ld.role === 'progressbar' && ld.label === 'Searching' && ld.w === 16 && ld.hidden === null, JSON.stringify(ld));
await p.evaluate(() => window.setLoading(false));
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const box = document.getElementById('slg').parentElement, bg = rgb(getComputedStyle(box).backgroundColor);
    for (const [sel, min] of [['.dk-search-input__icon', 3], ['.dk-search-input__clear', 3], ['.dk-input__field', 4.5]]) { const r = ratio(rgb(getComputedStyle(box.querySelector(sel)).color), bg); n++; if (r < min) low.push(`${th} ${sel}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the icon and × keep 3:1 and the text 4.5:1 on the field in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
await p.hover('#slg ~ .dk-search-input__clear');
const hv = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('#slg ~ .dk-search-input__clear')); return s.backgroundColor !== 'rgba(0, 0, 0, 0)'; });
t('the × is shaded on hover', hv);
t('--search-input-clear overrides one field', await p.evaluate(() => getComputedStyle(document.querySelector('#stok ~ .dk-search-input__clear')).color === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('SearchInput', R) ? 0 : 1);

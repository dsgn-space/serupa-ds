// Input: sizes, the native input (ref, attributes, value), icons, states (hover, focus, invalid, read-only,
// disabled), contrast in every theme, forced-colors outline.
//   node tools/test/input.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:grid;gap:8px;width:320px"></div>
<script>
var D = window.Diki, h = React.createElement; window.changes = [];
function App() {
  var s = React.useState(''), v = s[0];
  return h(React.Fragment, null,
    h('label', { htmlFor: 'md' }, 'Name'),
    h(D.Input, { id: 'md', ref: window.r = React.createRef(), placeholder: 'Dana', value: v, onChange: function (e) { window.changes.push(e.target.value); s[1](e.target.value); }, className: 'extra', 'data-x': 'y' }),
    h(D.Input, { id: 'sm', size: 'sm', 'aria-label': 'Small' }),
    h(D.Input, { id: 'lg', size: 'lg', 'aria-label': 'Large' }),
    h(D.Input, { id: 'bad', size: 'xl', 'aria-label': 'Bad' }),
    h(D.Input, { id: 'ic', leftIcon: 'search', rightIcon: 'mail', 'aria-label': 'Icons' }),
    h(D.Input, { id: 'inv', invalid: true, 'aria-label': 'Invalid' }),
    h(D.Input, { id: 'ro', readOnly: true, defaultValue: 'INV-1', 'aria-label': 'Read-only' }),
    h(D.Input, { id: 'dis', disabled: true, 'aria-label': 'Disabled' }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('input.html', APP, { react: true }));
await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const i = document.getElementById(id), w = i.parentElement, c = getComputedStyle(w); return { tag: i.tagName, type: i.type, wrap: w.className, h: c.height, fs: c.fontSize, pl: c.paddingLeft, bc: c.borderTopColor, bw: c.borderTopWidth, r: c.borderRadius, bs: c.boxShadow, bg: c.backgroundColor, op: c.opacity, size: w.dataset.size }; }, id);

const md = await box('md'), sm = await box('sm'), lg = await box('lg'), bad = await box('bad');
t('a native <input type="text"> in a .dk-input box (data-component="input"); md 32px text-sm 12px padding, 1px border, 6px corners', md.tag === 'INPUT' && md.type === 'text' && /dk-input dk-input--size-md/.test(md.wrap) && md.h === '32px' && md.fs === '14px' && md.pl === '12px' && md.bw === '1px' && md.r === '6px', JSON.stringify(md));
t('sizes: sm 24px text-xs 8px padding, lg 44px text-base 16px padding; unknown size falls back to md', sm.h === '24px' && sm.fs === '12px' && sm.pl === '8px' && lg.h === '44px' && lg.fs === '16px' && lg.pl === '16px' && bad.size === 'md', JSON.stringify([sm, lg, bad]));
const at = await p.evaluate(() => { const i = document.getElementById('md'); return { ref: window.r.current === i, cls: i.parentElement.classList.contains('extra'), data: i.dataset.x, label: i.labels[0] && i.labels[0].textContent, ph: i.placeholder }; });
t('ref and attributes go to the <input>, className to the box; the <label htmlFor> names it', at.ref && at.cls && at.data === 'y' && at.label === 'Name' && at.ph === 'Dana', JSON.stringify(at));
await p.click('#md'); await p.keyboard.type('Kim'); await p.waitForTimeout(250);
t('typing updates a controlled value through onChange', await p.evaluate(() => document.getElementById('md').value === 'Kim' && window.changes.join() === 'K,Ki,Kim'));
const foc = await p.evaluate(() => { const w = document.getElementById('md').parentElement, c = getComputedStyle(w), f = document.createElement('div'); f.style.color = 'var(--focus-ring)'; document.body.appendChild(f); const ring = getComputedStyle(f).color; f.remove(); return { bc: c.borderTopColor, bs: c.boxShadow, ring, oc: c.outlineColor, ow: c.outlineWidth }; });
t('focus: the border and a 1px ring take the focus color; a transparent outline for forced-colors mode', foc.bc === foc.ring && foc.bs.includes(foc.ring) && /0px 0px 0px 1px/.test(foc.bs) && foc.ow === '2px' && foc.oc === 'rgba(0, 0, 0, 0)', JSON.stringify(foc));
await p.mouse.move(0, 0); await p.locator('#sm').hover(); await p.waitForTimeout(250);
const hov = await box('sm'), rest = await box('lg');
t('hover: field-border-hover', hov.bc !== rest.bc, JSON.stringify([hov.bc, rest.bc]));
const inv = await p.evaluate(() => { const i = document.getElementById('inv'), c = getComputedStyle(i.parentElement), f = document.createElement('div'); f.style.color = 'var(--danger)'; document.body.appendChild(f); const d = getComputedStyle(f).color; f.remove(); return { aria: i.getAttribute('aria-invalid'), bc: c.borderTopColor, d }; });
await p.focus('#inv'); await p.waitForTimeout(250); const invf = await box('inv');
t('invalid: aria-invalid, a danger border and a danger focus ring', inv.aria === 'true' && inv.bc === inv.d && invf.bs.includes(inv.d), JSON.stringify([inv, invf.bs]));
const ro = await box('ro'), dis = await box('dis');
const ros = await p.evaluate(() => { const i = document.getElementById('ro'), d = document.getElementById('dis'); return { ro: i.readOnly, dis: d.disabled, cur: getComputedStyle(d).cursor }; });
t('read-only: surface-muted background, still focusable; disabled: native disabled, 50%, not-allowed', ro.bg !== md.bg && /readonly/.test(ro.wrap) && ros.ro && ros.dis && dis.op === '0.5' && /disabled/.test(dis.wrap) && ros.cur === 'not-allowed', JSON.stringify([ro, dis, ros]));
const ic = await p.evaluate(() => { const w = document.getElementById('ic').parentElement, l = w.querySelector('.dk-input__icon--left'), r = w.querySelector('.dk-input__icon--right'); return { order: [...w.children].map((c) => c.className.split(' ')[0] + (c.classList.contains('dk-input__icon--left') ? 'L' : c.classList.contains('dk-input__icon--right') ? 'R' : '')).join(), hidden: l.getAttribute('aria-hidden') + r.getAttribute('aria-hidden'), size: getComputedStyle(l.querySelector('.dk-icon')).fontSize, pe: getComputedStyle(l).pointerEvents }; });
t('icons: decorative, 16px at md, before and after the field, and they don\'t take clicks', ic.order === 'dk-input__iconL,dk-input__field,dk-input__iconR' && ic.hidden === 'truetrue' && ic.size === '16px' && ic.pe === 'none', JSON.stringify(ic));
const con = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = [];
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const field = col('var(--field)'), surf = col('var(--surface)');
    [['text', 'var(--text)', field, 4.5], ['placeholder', 'var(--placeholder)', field, 4.5], ['border', 'var(--field-border)', field, 3], ['border on page', 'var(--field-border)', surf, 3], ['focus', 'var(--focus-ring)', surf, 3], ['invalid', 'var(--danger)', field, 3]].forEach(([n, fg, bg, need]) => { const r = ratio(col(fg), bg); if (r < need) low.push(th + ' ' + n + ' ' + r.toFixed(2)); });
  }
  document.documentElement.removeAttribute('data-theme');
  return low;
});
t('contrast in all six themes: text and placeholder 4.5:1 on the field; border, focus ring and invalid border 3:1', con.length === 0, con.join('; '));
t('no page errors', errors.length === 0, errors.join(' | '));
await b.close();
cleanup();
process.exit(report('Input', R) ? 0 : 1);

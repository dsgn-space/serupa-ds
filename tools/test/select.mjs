// Select: a native select in its box, sizes, options (strings, objects, groups, children), the placeholder,
// a controlled value, the chevron and left icon (decorative, no clicks), states, Field, contrast in every theme.
//   node tools/test/select.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:grid;gap:8px;width:320px"></div>
<script>
var D = window.Serupa, h = React.createElement; window.changes = [];
function App() {
  var s = React.useState('b'), v = s[0];
  return h(React.Fragment, null,
    h('label', { htmlFor: 'md' }, 'Role'),
    h(D.Select, { id: 'md', ref: window.r = React.createRef(), value: v, onChange: function (e) { window.changes.push(e.target.value); s[1](e.target.value); }, options: ['a', { value: 'b', label: 'Bee' }, { value: 'c', label: 'Sea', disabled: true }], className: 'extra', 'data-x': 'y' }),
    h(D.Select, { id: 'sm', size: 'sm', options: ['x'], 'aria-label': 'Small' }),
    h(D.Select, { id: 'lg', size: 'lg', options: ['x'], 'aria-label': 'Large' }),
    h(D.Select, { id: 'bad', size: 'xl', multiple: true, options: ['x'], 'aria-label': 'Bad' }),
    h(D.Select, { id: 'ph', placeholder: 'Choose one', options: ['One', 'Two'], 'aria-label': 'Placeholder' }),
    h(D.Select, { id: 'grp', leftIcon: 'schedule', 'aria-label': 'Groups', options: [{ label: 'Europe', options: ['London', 'Paris'] }, 'Tokyo'] }, h('option', { value: 'kid' }, 'Child')),
    h(D.Select, { id: 'inv', invalid: true, options: ['x'], 'aria-label': 'Invalid' }),
    h(D.Select, { id: 'dis', disabled: true, options: ['x'], 'aria-label': 'Disabled' }),
    h(D.Field, { label: 'Country', error: 'Pick a country.' }, h(D.Select, { id: 'fld', placeholder: 'Choose', options: ['DK'] })));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [], warnings = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); if (m.type() === 'warning') warnings.push(m.text()); });
await p.goto(writePage('select.html', APP, { react: true }));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const i = document.getElementById(id), w = i.parentElement, c = getComputedStyle(w), f = getComputedStyle(i); return { tag: i.tagName, wrap: w.className, h: c.height, fs: f.fontSize, pl: f.paddingLeft, pr: f.paddingRight, app: f.appearance, bc: c.borderTopColor, bw: c.borderTopWidth, r: c.borderRadius, bs: c.boxShadow, bg: c.backgroundColor, op: c.opacity, size: w.dataset.size, comp: w.dataset.component, color: f.color, multiple: i.multiple, value: i.value }; }, id);

const md = await box('md'), sm = await box('sm'), lg = await box('lg'), bad = await box('bad');
t('a native <select> (no system arrow) in a .dk-select box (data-component="select"); md 32px text-sm, 12px start padding and room for the chevron at the end, 1px border, 6px corners', md.tag === 'SELECT' && md.comp === 'select' && md.app === 'none' && /dk-select dk-select--size-md/.test(md.wrap) && md.h === '32px' && md.fs === '14px' && md.pl === '12px' && md.pr === '36px' && md.bw === '1px' && md.r === '6px', JSON.stringify(md));
t('sizes: sm 24px text-xs, lg 44px text-base; an unknown size falls back to md; multiple is ignored with a warning', sm.h === '24px' && sm.fs === '12px' && sm.pl === '8px' && lg.h === '44px' && lg.fs === '16px' && lg.pl === '16px' && bad.size === 'md' && !bad.multiple && warnings.some((w) => /multiple/.test(w)), JSON.stringify([sm, lg, bad, warnings]));
const at = await p.evaluate(() => { const i = document.getElementById('md'); return { ref: window.r.current === i, cls: i.parentElement.classList.contains('extra'), data: i.dataset.x, label: i.labels[0] && i.labels[0].textContent, opts: [...i.options].map((o) => o.value + ':' + o.textContent + (o.disabled ? ':off' : '')).join() }; });
t('ref and attributes go to the <select>, className to the box; options from strings and { value, label, disabled }', at.ref && at.cls && at.data === 'y' && at.label === 'Role' && at.opts === 'a:a,b:Bee,c:Sea:off', JSON.stringify(at));
await p.selectOption('#md', 'a'); await p.waitForTimeout(100);
t('picking an option updates a controlled value through onChange', await p.evaluate(() => document.getElementById('md').value === 'a' && window.changes.join() === 'a'));
const ph = await box('ph');
const phOpt = await p.evaluate(() => { const o = document.getElementById('ph').options[0]; return { v: o.value, t: o.textContent, d: o.disabled }; });
await p.selectOption('#ph', 'Two'); await p.waitForTimeout(100);
const ph2 = await box('ph');
const cols = await p.evaluate(() => { const f = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }; return { ph: f('var(--placeholder)'), text: f('var(--text)') }; });
t('placeholder: a first empty option that can\'t be picked; an uncontrolled select starts on it in the placeholder color, then the text color once something is picked', phOpt.v === '' && phOpt.t === 'Choose one' && phOpt.d && ph.value === '' && /dk-select--empty/.test(ph.wrap) && ph.color === cols.ph && ph2.value === 'Two' && !/dk-select--empty/.test(ph2.wrap) && ph2.color === cols.text, JSON.stringify([phOpt, ph, ph2, cols]));
const grp = await p.evaluate(() => { const i = document.getElementById('grp'), w = i.parentElement; return { groups: [...i.querySelectorAll('optgroup')].map((g) => g.label + '=' + [...g.children].map((o) => o.value).join('/')).join(), all: [...i.options].map((o) => o.value).join(), icons: [...w.querySelectorAll('.dk-select__icon')].map((x) => x.getAttribute('aria-hidden') + ':' + getComputedStyle(x).pointerEvents + ':' + x.querySelector('.dk-icon')?.dataset.icon).join(), pl: getComputedStyle(i).paddingLeft }; });
t('groups, plain options and <option> children together; the left icon and chevron are decorative and don\'t take clicks; the text starts after the icon', grp.groups === 'Europe=London/Paris' && grp.all === 'London,Paris,Tokyo,kid' && grp.icons === 'true:none:schedule,true:none:expand_more' && grp.pl === '36px', JSON.stringify(grp));
const chev = await p.evaluate(() => { const i = document.getElementById('lg'), r = i.getBoundingClientRect(), c = i.parentElement.querySelector('.dk-select__icon--chevron').getBoundingClientRect(); const el = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2); return { hit: el === i, inside: c.right <= r.right && c.left >= r.left }; });
t('a click on the chevron lands on the <select>, so it opens', chev.hit && chev.inside, JSON.stringify(chev));
await p.focus('#md'); await p.waitForTimeout(250);
const foc = await p.evaluate(() => { const w = document.getElementById('md').parentElement, c = getComputedStyle(w), f = document.createElement('div'); f.style.color = 'var(--focus-ring)'; document.body.appendChild(f); const ring = getComputedStyle(f).color; f.remove(); return { bc: c.borderTopColor, bs: c.boxShadow, ring, oc: c.outlineColor, ow: c.outlineWidth }; });
t('focus: the border and a 1px ring take the focus color; a transparent outline for forced-colors mode', foc.bc === foc.ring && foc.bs.includes(foc.ring) && /0px 0px 0px 1px/.test(foc.bs) && foc.ow === '2px' && foc.oc === 'rgba(0, 0, 0, 0)', JSON.stringify(foc));
await p.mouse.move(0, 0); await p.locator('#sm').hover(); await p.waitForTimeout(250);
const hov = await box('sm'), rest = await box('lg');
t('hover: field-border-hover', hov.bc !== rest.bc, JSON.stringify([hov.bc, rest.bc]));
const inv = await p.evaluate(() => { const i = document.getElementById('inv'), c = getComputedStyle(i.parentElement), f = document.createElement('div'); f.style.color = 'var(--danger)'; document.body.appendChild(f); const d = getComputedStyle(f).color; f.remove(); return { aria: i.getAttribute('aria-invalid'), bc: c.borderTopColor, d }; });
const dis = await box('dis');
const disc = await p.evaluate(() => ({ d: document.getElementById('dis').disabled, cur: getComputedStyle(document.getElementById('dis')).cursor }));
t('invalid: aria-invalid and a danger border; disabled: native disabled, 50%, not-allowed', inv.aria === 'true' && inv.bc === inv.d && disc.d && dis.op === '0.5' && /disabled/.test(dis.wrap) && disc.cur === 'not-allowed', JSON.stringify([inv, dis, disc]));
const fld = await p.evaluate(() => { const i = document.getElementById('fld'); return { label: i.labels[0].textContent, inv: i.getAttribute('aria-invalid'), box: i.parentElement.className, desc: !!i.getAttribute('aria-describedby') }; });
t('in a Field: labelled, described and invalid with the error', fld.label === 'Country' && fld.inv === 'true' && /dk-select--invalid/.test(fld.box) && fld.desc, JSON.stringify(fld));
const con = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = [];
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const field = col('var(--field)'), surf = col('var(--surface)');
    [['text', 'var(--text)', field, 4.5], ['placeholder', 'var(--placeholder)', field, 4.5], ['chevron', 'var(--text-muted)', field, 3], ['border', 'var(--field-border)', field, 3], ['border on page', 'var(--field-border)', surf, 3], ['focus', 'var(--focus-ring)', surf, 3], ['invalid', 'var(--danger)', field, 3]].forEach(([n, fg, bg, need]) => { const r = ratio(col(fg), bg); if (r < need) low.push(th + ' ' + n + ' ' + r.toFixed(2)); });
  }
  document.documentElement.removeAttribute('data-theme');
  return low;
});
t('contrast in all six themes: text and placeholder 4.5:1 on the field; chevron, border, focus ring and invalid border 3:1', con.length === 0, con.join('; '));
t('no page errors', errors.length === 0, errors.join(' | '));
await b.close();
cleanup();
process.exit(report('Select', R) ? 0 : 1);

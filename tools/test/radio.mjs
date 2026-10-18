// Radio and RadioGroup: native radios in labels, the group's name, value (controlled and not), size, orientation,
// invalid, disabled and required, arrow keys, the description, focus, hover, Field group, contrast in every theme.
//   node tools/test/radio.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:grid;gap:16px;width:420px;justify-items:start"></div>
<script>
var D = window.Serupa, h = React.createElement; window.changes = [];
function App() {
  var s = React.useState('b'), v = s[0];
  return h(React.Fragment, null,
    h(D.RadioGroup, { id: 'ctl', ref: window.gr = React.createRef(), 'aria-label': 'Letters', value: v, onChange: function (val, e) { window.changes.push(val + ':' + e.type); s[1](val); }, className: 'extra', 'data-x': 'y' },
      h(D.Radio, { id: 'a', value: 'a', ref: window.r = React.createRef(), name: 'ignored', defaultChecked: true }, 'Alpha'),
      h(D.Radio, { id: 'b', value: 'b', description: 'The second letter.' }, 'Bravo'),
      h(D.Radio, { id: 'c', value: 'c', size: 'lg' }, 'Charlie')),
    h(D.RadioGroup, { id: 'unc', 'aria-label': 'Sizes', size: 'sm', orientation: 'horizontal', defaultValue: 2, name: 'num' },
      h(D.Radio, { id: 'n1', value: 1 }, 'One'), h(D.Radio, { id: 'n2', value: 2 }, 'Two'), h(D.Radio, { id: 'n3', value: 3 }, 'Three')),
    h(D.RadioGroup, { id: 'none', 'aria-label': 'Nothing picked', invalid: true, required: true },
      h(D.Radio, { id: 'x1', value: 'x' }, 'X'), h(D.Radio, { id: 'x2', value: 'y' }, 'Y')),
    h(D.RadioGroup, { id: 'dis', 'aria-label': 'Disabled', disabled: true, defaultValue: 'p' },
      h(D.Radio, { id: 'p', value: 'p' }, 'P'), h(D.Radio, { id: 'q', value: 'q' }, 'Q')),
    h('div', null, h(D.Radio, { id: 's1', name: 'solo', value: '1', defaultChecked: true }, 'Solo one'), h(D.Radio, { id: 's2', name: 'solo', value: '2', size: 'xl' }, 'Solo two'), h(D.Radio, { id: 'bare', name: 'bare', 'aria-label': 'Bare' })),
    h(D.Field, { group: true, label: 'Plan', hint: 'You can change it later.', error: 'Pick a plan.' },
      h(D.RadioGroup, { id: 'fg' }, h(D.Radio, { id: 'f1', value: 'free' }, 'Free'), h(D.Radio, { id: 'f2', value: 'pro' }, 'Pro'))),
    h(D.Field, { group: true, label: 'Off', disabled: true }, h(D.RadioGroup, null, h(D.Radio, { id: 'o1', value: 'o' }, 'O'))));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
await p.goto(writePage('radio.html', APP, { react: true }));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const i = document.getElementById(id), w = i.closest('.dk-radio'), c = getComputedStyle(i), lc = getComputedStyle(w), ir = i.getBoundingClientRect(), d = w.querySelector('.dk-radio__dot'), dr = d.getBoundingClientRect(), tx = w.querySelector('.dk-radio__label'), tr = tx && tx.getBoundingClientRect(); return { tag: i.tagName + ':' + i.type, root: w.tagName, wrap: w.className, w: c.width, app: c.appearance, bc: c.borderTopColor, bw: c.borderTopWidth, r: c.borderTopLeftRadius, bg: c.backgroundColor, bs: c.boxShadow, fs: lc.fontSize, op: lc.opacity, cur: lc.cursor, size: w.dataset.size, comp: w.dataset.component, name: i.name, checked: i.checked, disabled: i.matches(':disabled'), required: i.required, mid: tr ? Math.abs((ir.top + ir.height / 2) - (tr.top + Math.min(tr.height, parseFloat(lc.lineHeight)) / 2)) : 0, dot: getComputedStyle(d).visibility, dotW: dr.width, dotOff: Math.abs((dr.left + dr.width / 2) - (ir.left + ir.width / 2)) + Math.abs((dr.top + dr.height / 2) - (ir.top + ir.height / 2)) }; }, id);
const col = (v) => p.evaluate((v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);

const g = await p.evaluate(() => { const g = document.getElementById('ctl'); return { role: g.getAttribute('role'), ref: window.gr.current === g, cls: g.className, data: g.dataset.x, comp: g.dataset.component, o: g.dataset.orientation, dir: getComputedStyle(g).flexDirection, names: [...g.querySelectorAll('input')].map((i) => i.name) }; });
t('RadioGroup: a <div role="radiogroup"> (data-component="radio-group"), vertical by default; ref and attributes go to it; every radio gets one generated name (the group\'s wins over a radio\'s own)', g.role === 'radiogroup' && g.ref && /dk-radio-group dk-radio-group--vertical extra/.test(g.cls) && g.data === 'y' && g.comp === 'radio-group' && g.o === 'vertical' && g.dir === 'column' && new Set(g.names).size === 1 && g.names[0] && g.names[0] !== 'ignored', JSON.stringify(g));
const a = await box('a'), bb = await box('b'), c = await box('c');
t('Radio: a native radio (no system look) in a <label class="dk-radio"> (data-component="radio"); md: a 16px circle, 1px field border, text-sm, centered on the label\'s first line; ref goes to the <input>', a.tag === 'INPUT:radio' && a.root === 'LABEL' && a.comp === 'radio' && a.app === 'none' && a.w === '16px' && a.bw === '1px' && parseFloat(a.r) >= 8 && a.fs === '14px' && a.mid < 1 && a.bc === await col('var(--field-border)') && await p.evaluate(() => window.r.current === document.getElementById('a')), JSON.stringify(a));
const prim = await col('var(--primary)'), onp = await col('var(--on-primary)');
const dotBg = await p.evaluate(() => getComputedStyle(document.querySelector('#b + .dk-radio__dot')).backgroundColor);
t('controlled: the group\'s value checks its radio (a radio\'s defaultChecked is ignored); checked: a primary fill with a centered 6px dot in on-primary', !a.checked && bb.checked && bb.bg === prim && bb.bc === prim && bb.dot === 'visible' && a.dot === 'hidden' && bb.dotW === 6 && bb.dotOff < 0.5 && dotBg === onp, JSON.stringify([a, bb, dotBg]));
await p.click('#ctl label:first-child .dk-radio__label'); await p.waitForTimeout(150);
t('a click on a label calls onChange(value, event) and moves the check', (await box('a')).checked && !(await box('b')).checked && await p.evaluate(() => window.changes.join() === 'a:change'), await p.evaluate(() => window.changes.join()));
await p.focus('#a'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(150);
t('arrow keys move the choice, natively', (await box('b')).checked && await p.evaluate(() => document.activeElement.id === 'b' && window.changes.join() === 'a:change,b:change'), await p.evaluate(() => window.changes.join()));
t('a radio\'s own size wins over the group\'s: lg is a 20px circle with text-base, centered', c.w === '20px' && c.fs === '16px' && c.mid < 1 && c.size === 'lg', JSON.stringify(c));
const n1 = await box('n1'), n2 = await box('n2');
const unc = await p.evaluate(() => { const g = document.getElementById('unc'), r = [...g.querySelectorAll('.dk-radio')].map((x) => x.getBoundingClientRect().top); return { dir: getComputedStyle(g).flexDirection, gap: getComputedStyle(g).columnGap, sameRow: r.every((y) => Math.abs(y - r[0]) < 1) }; });
await p.click('#n3', { force: true }); await p.waitForTimeout(100);
t('uncontrolled: defaultValue (numbers too) and clicks; the group\'s name and size (sm: a 14px circle, text-xs); horizontal: a row with 16px gaps', n2.checked && !n1.checked && n1.name === 'num' && n1.w === '14px' && n1.fs === '12px' && n1.mid < 1 && unc.dir === 'row' && unc.gap === '16px' && unc.sameRow && (await box('n3')).checked && !(await box('n2')).checked, JSON.stringify([n1, n2, unc]));
const desc = await p.evaluate(() => { const i = document.getElementById('b'), d = i.closest('label').querySelector('.dk-radio__description'); return { by: i.getAttribute('aria-describedby'), id: d.id, color: getComputedStyle(d).color }; });
const named = { bravo: await p.getByRole('radio', { name: 'Bravo', exact: true }).count(), bare: await p.getByRole('radio', { name: 'Bare', exact: true }).count() };
t('description: a muted line in aria-describedby, kept out of the name; the label names the radio, or aria-label without one', desc.by === desc.id && desc.color === await col('var(--text-muted)') && named.bravo === 1 && named.bare === 1 && /dk-radio--bare/.test((await box('bare')).wrap), JSON.stringify([desc, named]));
const none = await p.evaluate(() => { const g = document.getElementById('none'); return { inv: g.getAttribute('aria-invalid'), req: g.getAttribute('aria-required'), cls: g.className }; });
const x1 = await box('x1'), dang = await col('var(--danger)');
t('invalid and required on the group: aria-invalid and aria-required on it, required on each radio, a danger border on each', none.inv === 'true' && none.req === 'true' && /dk-radio-group--invalid/.test(none.cls) && x1.required && x1.bc === dang && /dk-radio--invalid/.test(x1.wrap), JSON.stringify([none, x1]));
const dp = await box('p'), dq = await box('q');
await p.click('#q', { force: true }); await p.waitForTimeout(100);
t('disabled group: every radio disabled, 50%, not-allowed; the unchecked one on surface-muted; clicks do nothing', dp.disabled && dq.disabled && dq.op === '0.5' && dq.cur === 'not-allowed' && dq.bg === await col('var(--surface-muted)') && dp.checked && !(await box('q')).checked && await p.evaluate(() => document.getElementById('dis').getAttribute('aria-disabled') === 'true'), JSON.stringify([dp, dq]));
const s1 = await box('s1'), s2 = await box('s2');
await p.click('#s2'); await p.waitForTimeout(100);
t('on its own: name and defaultChecked as usual; an unknown size falls back to md', s1.checked && s1.name === 'solo' && s2.size === 'md' && (await box('s2')).checked && !(await box('s1')).checked, JSON.stringify([s1, s2]));
await p.mouse.move(0, 0); await p.locator('#x2').hover(); await p.waitForTimeout(250);
const hov = await box('x2'); await p.mouse.move(0, 0); await p.locator('#n1').hover(); await p.waitForTimeout(250);
const hov2 = await box('n1');
t('hover: field-border-hover; invalid keeps the danger border', hov.bc === dang && hov2.bc === await col('var(--field-border-hover)'), JSON.stringify([hov.bc, hov2.bc]));
await p.mouse.move(0, 0); await p.focus('#s1'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(250);
const foc = await box('s2'), fid = await p.evaluate(() => document.activeElement.id), ring = await col('var(--focus-ring)');
const oc = await p.evaluate(() => { const c = getComputedStyle(document.activeElement); return c.outlineColor + ' ' + c.outlineWidth + ' ' + c.outlineOffset; });
t('keyboard focus: a 2px focus-ring ring outside a 2px gap, like Button; a transparent outline for forced-colors mode', fid === 's2' && foc.bs.includes(ring) && /0px 0px 0px 4px/.test(foc.bs) && oc === 'rgba(0, 0, 0, 0) 2px 2px', JSON.stringify([fid, foc.bs, oc]));
const fg = await p.evaluate(() => { const g = document.getElementById('fg'), fs = g.closest('fieldset'); return { legend: fs.querySelector('legend').textContent, desc: fs.getAttribute('aria-describedby').split(' ').map((id) => document.getElementById(id).textContent).join('|'), inv: g.getAttribute('aria-invalid'), radio: document.getElementById('f1').closest('.dk-radio').className }; });
const o1 = await box('o1');
t('in a Field group: a fieldset and legend described by the hint and error; the error makes the RadioGroup invalid; a disabled Field group disables its radios', fg.legend === 'Plan' && fg.desc === 'You can change it later.|Pick a plan.' && fg.inv === 'true' && /dk-radio--invalid/.test(fg.radio) && o1.disabled && o1.op === '0.5', JSON.stringify([fg, o1]));
const con = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = [];
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const field = col('var(--field)'), surf = col('var(--surface)');
    [['label', 'var(--text)', surf, 4.5], ['description', 'var(--text-muted)', surf, 4.5], ['border', 'var(--field-border)', field, 3], ['border on page', 'var(--field-border)', surf, 3], ['checked fill', 'var(--primary)', surf, 3], ['dot on fill', 'var(--on-primary)', col('var(--primary)'), 3], ['dot on hover fill', 'var(--on-primary)', col('var(--primary-hover)'), 3], ['focus', 'var(--focus-ring)', surf, 3], ['invalid', 'var(--danger)', surf, 3]].forEach(([n, fg, bg, need]) => { const r = ratio(col(fg), bg); if (r < need) low.push(th + ' ' + n + ' ' + r.toFixed(2)); });
  }
  document.documentElement.removeAttribute('data-theme');
  return low;
});
t('contrast in all six themes: label and description 4.5:1; border, checked fill, dot, focus ring and invalid border 3:1', con.length === 0, con.join('; '));
t('no page errors or React warnings', errors.length === 0, errors.join(' | '));
await b.close();
cleanup();
process.exit(report('Radio', R) ? 0 : 1);

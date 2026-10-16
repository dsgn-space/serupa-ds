// Checkbox: a native checkbox in its label, sizes, checked and indeterminate, the description, keyboard,
// focus, hover, invalid, disabled (own and fieldset), Field, contrast in every theme.
//   node tools/test/checkbox.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:grid;gap:12px;width:360px;justify-items:start"></div>
<script>
var D = window.Diki, h = React.createElement; window.changes = [];
function App() {
  var s = React.useState(false), v = s[0];
  var m = React.useState(true), mixed = m[0];
  return h(React.Fragment, null,
    h(D.Checkbox, { id: 'md', ref: window.r = React.createRef(), checked: v, onChange: function (e) { window.changes.push(e.target.checked); s[1](e.target.checked); }, name: 'news', value: 'yes', className: 'extra', 'data-x': 'y', type: 'radio' }, 'Newsletter'),
    h(D.Checkbox, { id: 'sm', size: 'sm' }, 'Small'),
    h(D.Checkbox, { id: 'lg', size: 'lg' }, 'Large'),
    h(D.Checkbox, { id: 'bad', size: 'xl' }, 'Bad size'),
    h(D.Checkbox, { id: 'mix', indeterminate: mixed, onChange: function () { m[1](false); } }, 'Select all'),
    h(D.Checkbox, { id: 'desc', description: 'Get an email when someone mentions you.', 'aria-describedby': 'outside', defaultChecked: true }, 'Mentions'),
    h(D.Checkbox, { id: 'bare', 'aria-label': 'Select row' }),
    h(D.Checkbox, { id: 'inv', invalid: true }, 'Terms'),
    h(D.Checkbox, { id: 'dis', disabled: true }, 'Disabled'),
    h('span', { id: 'outside' }, 'Outside'),
    h(D.Field, { label: 'Agreement', error: 'Accept the terms to go on.' }, h(D.Checkbox, { id: 'fld' }, 'I accept the terms')),
    h(D.Field, { label: 'Notify me', group: true, disabled: true }, h(D.Checkbox, { id: 'g1' }, 'Email'), h(D.Checkbox, { id: 'g2' }, 'SMS')));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await p.goto(writePage('checkbox.html', APP, { react: true }));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const i = document.getElementById(id), w = i.closest('.dk-checkbox'), c = getComputedStyle(i), lc = getComputedStyle(w), ir = i.getBoundingClientRect(), tx = w.querySelector('.dk-checkbox__label'), tr = tx && tx.getBoundingClientRect(); return { tag: i.tagName + ':' + i.type, root: w.tagName, wrap: w.className, w: c.width, hh: c.height, app: c.appearance, bc: c.borderTopColor, bw: c.borderTopWidth, r: c.borderTopLeftRadius, bg: c.backgroundColor, bs: c.boxShadow, fs: lc.fontSize, op: lc.opacity, cur: lc.cursor, size: w.dataset.size, comp: w.dataset.component, checked: i.checked, mid: tr ? Math.abs((ir.top + ir.height / 2) - (tr.top + Math.min(tr.height, parseFloat(lc.lineHeight)) / 2)) : 0, icon: getComputedStyle(w.querySelector('.dk-checkbox__icon')).visibility }; }, id);
const col = (v) => p.evaluate((v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);

const md = await box('md'), sm = await box('sm'), lg = await box('lg'), bad = await box('bad');
t('a native checkbox (type can\'t be changed; no system look) in a <label class="dk-checkbox"> (data-component="checkbox"); md: a 16px box, 1px field border, 4px corners, text-sm, centered on the label\'s first line', md.tag === 'INPUT:checkbox' && md.root === 'LABEL' && md.comp === 'checkbox' && md.app === 'none' && /dk-checkbox dk-checkbox--size-md/.test(md.wrap) && md.w === '16px' && md.hh === '16px' && md.bw === '1px' && md.r === '4px' && md.fs === '14px' && md.mid < 1 && md.bc === await col('var(--field-border)'), JSON.stringify(md));
t('sizes: sm a 14px box with text-xs, lg 20px with text-base, each centered on the first line; an unknown size falls back to md', sm.w === '14px' && sm.fs === '12px' && sm.mid < 1 && lg.w === '20px' && lg.fs === '16px' && lg.mid < 1 && bad.size === 'md', JSON.stringify([sm, lg, bad]));
const at = await p.evaluate(() => { const i = document.getElementById('md'); return { ref: window.r.current === i, cls: i.closest('label').classList.contains('extra'), data: i.dataset.x, name: i.name, value: i.value }; });
at.label = await p.getByRole('checkbox', { name: 'Newsletter', exact: true }).count() === 1 ? 'Newsletter' : 'missing';
at.bare = await p.getByRole('checkbox', { name: 'Select row', exact: true }).count();
at.desc = await p.getByRole('checkbox', { name: 'Mentions', exact: true }).count();
t('ref, name, value and attributes go to the <input>, className to the label; its accessible name is just the label (not the hidden check icon or the description), or aria-label without one', at.ref && at.cls && at.data === 'y' && at.name === 'news' && at.value === 'yes' && at.label === 'Newsletter' && at.bare === 1 && at.desc === 1, JSON.stringify(at));
await p.click('label.extra .dk-checkbox__label'); await p.mouse.move(0, 0); await p.waitForTimeout(250);
const on = await box('md');
const prim = await col('var(--primary)'), onp = await col('var(--on-primary)');
const iconCol = await p.evaluate(() => getComputedStyle(document.querySelector('#md + .dk-checkbox__icon')).color);
t('a click on the label checks a controlled checkbox through onChange; checked: primary fill and border, the check (decorative) in on-primary', (on.checked && md.icon === 'hidden' && on.icon === 'visible' && on.bg === prim && on.bc === prim && iconCol === onp && (await p.evaluate(() => window.changes.join() === 'true' && document.querySelector('#md + .dk-checkbox__icon').getAttribute('aria-hidden') === 'true' && document.querySelector('#md + .dk-checkbox__icon').textContent === 'check'))), JSON.stringify([on, prim, onp, iconCol]));
await p.focus('#sm'); await p.keyboard.press('Space'); await p.waitForTimeout(150);
t('Space toggles it from the keyboard', (await box('sm')).checked);
const mix = await p.evaluate(() => { const i = document.getElementById('mix'); return { ind: i.indeterminate, icon: i.nextElementSibling.textContent, vis: getComputedStyle(i.nextElementSibling).visibility, bg: getComputedStyle(i).backgroundColor }; });
await p.click('#mix'); await p.waitForTimeout(150);
const mix2 = await p.evaluate(() => { const i = document.getElementById('mix'); return { ind: i.indeterminate, checked: i.checked, icon: i.nextElementSibling.textContent }; });
t('indeterminate: a dash on the primary fill (the native mixed state screen readers announce); it follows the prop after a click', mix.ind && mix.icon === 'remove' && mix.vis === 'visible' && mix.bg === prim && !mix2.ind && mix2.checked && mix2.icon === 'check', JSON.stringify([mix, mix2]));
const desc = await p.evaluate(() => { const i = document.getElementById('desc'), d = i.closest('label').querySelector('.dk-checkbox__description'); return { by: i.getAttribute('aria-describedby'), id: d.id, text: d.textContent, color: getComputedStyle(d).color, below: d.getBoundingClientRect().top >= i.closest('label').querySelector('.dk-checkbox__label').getBoundingClientRect().bottom - 1 }; });
t('description: a muted second line under the label, added to aria-describedby', desc.by === 'outside ' + desc.id && desc.text === 'Get an email when someone mentions you.' && desc.color === await col('var(--text-muted)') && desc.below, JSON.stringify(desc));
const bare = await box('bare');
t('without a label: just the box (16px tall), named by aria-label', /dk-checkbox--bare/.test(bare.wrap) && (await p.evaluate(() => document.getElementById('bare').closest('label').getBoundingClientRect().height)) === 16 && (await p.evaluate(() => !document.getElementById('bare').closest('label').querySelector('.dk-checkbox__text'))), JSON.stringify(bare));
await p.mouse.move(0, 0); await p.locator('#lg').hover(); await p.waitForTimeout(250);
const hov = await box('lg');
t('hover: field-border-hover', hov.bc === await col('var(--field-border-hover)'), hov.bc);
await p.mouse.move(0, 0); await p.focus('#bad'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(250);
const foc = await box('bad'), ring = await col('var(--focus-ring)');
const oc = await p.evaluate(() => { const c = getComputedStyle(document.getElementById('bad')); return c.outlineColor + ' ' + c.outlineWidth + ' ' + c.outlineOffset; });
t('keyboard focus: a 2px focus-ring ring outside a 2px gap, like Button; a transparent outline for forced-colors mode', foc.bs.includes(ring) && /0px 0px 0px 4px/.test(foc.bs) && oc === 'rgba(0, 0, 0, 0) 2px 2px', JSON.stringify([foc.bs, oc]));
const inv = await box('inv'), dang = await col('var(--danger)');
const invAria = await p.evaluate(() => document.getElementById('inv').getAttribute('aria-invalid'));
t('invalid: aria-invalid and a danger border', invAria === 'true' && inv.bc === dang && /dk-checkbox--invalid/.test(inv.wrap), JSON.stringify(inv));
const dis = await box('dis');
await p.click('#dis', { force: true }); await p.waitForTimeout(100);
t('disabled: native disabled, 50%, not-allowed, surface-muted box; clicks do nothing', dis.op === '0.5' && dis.cur === 'not-allowed' && dis.bg === await col('var(--surface-muted)') && !(await box('dis')).checked && /dk-checkbox--disabled/.test(dis.wrap), JSON.stringify(dis));
const fld = await p.evaluate(() => { const i = document.getElementById('fld'); return { labels: [...i.labels].map((l) => l.textContent).join('|'), inv: i.getAttribute('aria-invalid'), box: i.closest('.dk-checkbox').className, desc: !!i.getAttribute('aria-describedby') }; });
const grp = await box('g1');
t('in a Field: described and invalid with the error; in a disabled Field group the checkboxes are disabled and dimmed', /I accept the terms/.test(fld.labels) && fld.inv === 'true' && /dk-checkbox--invalid/.test(fld.box) && fld.desc && grp.op === '0.5' && (await p.evaluate(() => document.getElementById('g2').matches(':disabled'))), JSON.stringify([fld, grp]));
const con = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = [];
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const field = col('var(--field)'), surf = col('var(--surface)'), prim = col('var(--primary)');
    [['label', 'var(--text)', surf, 4.5], ['description', 'var(--text-muted)', surf, 4.5], ['border', 'var(--field-border)', field, 3], ['border on page', 'var(--field-border)', surf, 3], ['checked fill', 'var(--primary)', surf, 3], ['check on fill', 'var(--on-primary)', prim, 4.5], ['check on hover fill', 'var(--on-primary)', col('var(--primary-hover)'), 4.5], ['focus', 'var(--focus-ring)', surf, 3], ['invalid', 'var(--danger)', surf, 3]].forEach(([n, fg, bg, need]) => { const r = ratio(col(fg), bg); if (r < need) low.push(th + ' ' + n + ' ' + r.toFixed(2)); });
  }
  document.documentElement.removeAttribute('data-theme');
  return low;
});
t('contrast in all six themes: label and description 4.5:1; border, checked fill, focus ring and invalid border 3:1; the check 4.5:1 on its fill', con.length === 0, con.join('; '));
t('no page errors', errors.length === 0, errors.join(' | '));
await b.close();
cleanup();
process.exit(report('Checkbox', R) ? 0 : 1);

// Switch: a native checkbox with role="switch" in its label, the track and thumb at three sizes, on and off,
// keyboard, the description, label first, focus, hover, invalid, disabled, Field, RTL, reduced motion, contrast.
//   node tools/test/switch.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:grid;gap:12px;width:380px;justify-items:start"></div>
<script>
var D = window.Diki, h = React.createElement; window.changes = [];
function App() {
  var s = React.useState(false), v = s[0];
  return h(React.Fragment, null,
    h(D.Switch, { id: 'md', ref: window.r = React.createRef(), checked: v, onChange: function (e) { window.changes.push(e.target.checked); s[1](e.target.checked); }, name: 'wifi', className: 'extra', 'data-x': 'y', type: 'radio', role: 'button' }, 'Wi-Fi'),
    h(D.Switch, { id: 'sm', size: 'sm' }, 'Small'),
    h(D.Switch, { id: 'lg', size: 'lg', defaultChecked: true }, 'Large'),
    h(D.Switch, { id: 'bad', size: 'xl' }, 'Bad size'),
    h(D.Switch, { id: 'desc', description: 'Pause notifications at night.' }, 'Quiet hours'),
    h(D.Switch, { id: 'start', labelPosition: 'start' }, 'Autoplay'),
    h(D.Switch, { id: 'bare', 'aria-label': 'Enable row' }),
    h(D.Switch, { id: 'inv', invalid: true }, 'Two-step sign-in'),
    h(D.Switch, { id: 'dis', disabled: true }, 'Disabled'),
    h('div', { dir: 'rtl' }, h(D.Switch, { id: 'rtl', defaultChecked: true }, 'RTL')),
    h(D.Field, { label: 'Backups', hint: 'Every night at 2 am.' }, h(D.Switch, { id: 'fld' }, 'Back up automatically')));
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
await p.goto(writePage('switch.html', APP, { react: true, extraHead: '<style>.dk-switch *{transition:none!important}</style>' }));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const i = document.getElementById(id), w = i.closest('.dk-switch'), c = getComputedStyle(i), lc = getComputedStyle(w), ir = i.getBoundingClientRect(), th = w.querySelector('.dk-switch__thumb'), tr = th.getBoundingClientRect(), tx = w.querySelector('.dk-switch__label'), xr = tx && tx.getBoundingClientRect(); return { tag: i.tagName + ':' + i.type + ':' + i.getAttribute('role'), root: w.tagName, wrap: w.className, w: ir.width, hh: ir.height, app: c.appearance, bg: c.backgroundColor, r: c.borderTopLeftRadius, bs: c.boxShadow, fs: lc.fontSize, op: lc.opacity, cur: lc.cursor, size: w.dataset.size, comp: w.dataset.component, checked: i.checked, disabled: i.matches(':disabled'), thumb: tr.width, thumbBg: getComputedStyle(th).backgroundColor, startGap: Math.round((tr.left - ir.left) * 10) / 10, endGap: Math.round((ir.right - tr.right) * 10) / 10, vGap: Math.abs((tr.top + tr.height / 2) - (ir.top + ir.height / 2)), mid: xr ? Math.abs((ir.top + ir.height / 2) - (xr.top + Math.min(xr.height, parseFloat(lc.lineHeight)) / 2)) : 0, labelLeft: xr ? xr.left < ir.left : null }; }, id);
const col = (v) => p.evaluate((v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);

const md = await box('md'), sm = await box('sm'), lg = await box('lg'), bad = await box('bad');
const fb = await col('var(--field-border)'), fld = await col('var(--field)');
t('a native checkbox with role="switch" (type and role can\'t be changed; no system look) in a <label class="dk-switch"> (data-component="switch"); md: a 36 by 20px round track in field-border, a 16px thumb in field 2px from the start, centered on the label\'s first line', md.tag === 'INPUT:checkbox:switch' && md.root === 'LABEL' && md.comp === 'switch' && md.app === 'none' && md.w === 36 && md.hh === 20 && parseFloat(md.r) >= 10 && md.bg === fb && md.thumb === 16 && md.thumbBg === fld && md.startGap === 2 && md.vGap < 0.5 && md.fs === '14px' && md.mid < 1, JSON.stringify(md));
t('sizes: sm 28 by 16 with a 12px thumb and text-xs, lg 44 by 24 with a 20px thumb and text-base, each centered on the first line; an unknown size falls back to md', sm.w === 28 && sm.hh === 16 && sm.thumb === 12 && sm.fs === '12px' && sm.mid < 1 && lg.w === 44 && lg.hh === 24 && lg.thumb === 20 && lg.fs === '16px' && lg.mid < 1 && bad.size === 'md', JSON.stringify([sm, lg, bad]));
const at = await p.evaluate(() => { const i = document.getElementById('md'); return { ref: window.r.current === i, cls: i.closest('label').classList.contains('extra'), data: i.dataset.x, name: i.name }; });
at.named = await p.getByRole('switch', { name: 'Wi-Fi', exact: true }).count();
at.desc = await p.getByRole('switch', { name: 'Quiet hours', exact: true }).count();
at.bare = await p.getByRole('switch', { name: 'Enable row', exact: true }).count();
t('ref, name and attributes go to the <input>, className to the label; named by its label alone (not the description), or aria-label', at.ref && at.cls && at.data === 'y' && at.name === 'wifi' && at.named === 1 && at.desc === 1 && at.bare === 1, JSON.stringify(at));
await p.click('label.extra .dk-switch__label'); await p.mouse.move(0, 0); await p.waitForTimeout(150);
const on = await box('md'), prim = await col('var(--primary)'), onp = await col('var(--on-primary)');
t('a click on the label turns a controlled switch on through onChange; on: a primary track and the thumb at the end (2px in) in on-primary', on.checked && on.bg === prim && on.endGap === 2 && on.thumbBg === onp && await p.evaluate(() => window.changes.join() === 'true' && document.getElementById('md').checked), JSON.stringify(on));
const snap = await p.accessibility.snapshot({ root: await p.$('#md') }).catch(() => null);
await p.focus('#sm'); await p.keyboard.press('Space'); await p.waitForTimeout(100);
t('Space flips it from the keyboard; it is announced as a checked switch', (await box('sm')).checked && (!snap || (snap.role === 'switch' && snap.checked === true)), JSON.stringify(snap));
const desc = await p.evaluate(() => { const i = document.getElementById('desc'), d = i.closest('label').querySelector('.dk-switch__description'); return { by: i.getAttribute('aria-describedby'), id: d.id, color: getComputedStyle(d).color }; });
t('description: a muted second line in aria-describedby', desc.by === desc.id && desc.color === await col('var(--text-muted)'), JSON.stringify(desc));
const st = await box('start'), bare = await box('bare');
t('labelPosition="start" puts the label before the track; without a label, just the track (20px tall)', st.labelLeft === true && md.labelLeft === false && /dk-switch--label-start/.test(st.wrap) && /dk-switch--bare/.test(bare.wrap) && (await p.evaluate(() => document.getElementById('bare').closest('label').getBoundingClientRect().height)) === 20, JSON.stringify([st, bare]));
const rtl = await box('rtl');
t('right-to-left: the thumb starts on the right and ends on the left', await p.evaluate(() => { const i = document.getElementById('rtl'), t = i.nextElementSibling; return t.getBoundingClientRect().left - i.getBoundingClientRect().left; }) === 2 && rtl.checked, JSON.stringify(rtl));
await p.mouse.move(0, 0); await p.locator('#bad').hover(); await p.waitForTimeout(150);
const hov = await box('bad'); await p.mouse.move(0, 0); await p.locator('#lg').hover(); await p.waitForTimeout(150);
const hov2 = await box('lg'); await p.mouse.move(0, 0);
t('hover: field-border-hover while off, primary-hover while on', hov.bg === await col('var(--field-border-hover)') && hov2.bg === await col('var(--primary-hover)'), JSON.stringify([hov.bg, hov2.bg]));
await p.focus('#bad'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(150);
const foc = await box('bad'), ring = await col('var(--focus-ring)');
const oc = await p.evaluate(() => { const c = getComputedStyle(document.activeElement); return document.activeElement.id + ' ' + c.outlineColor + ' ' + c.outlineWidth + ' ' + c.outlineOffset; });
t('keyboard focus: a 2px focus-ring ring outside a 2px gap, like Button; a transparent outline for forced-colors mode', foc.bs.includes(ring) && /0px 0px 0px 4px/.test(foc.bs) && oc === 'bad rgba(0, 0, 0, 0) 2px 2px', JSON.stringify([foc.bs, oc]));
const inv = await box('inv');
t('invalid: aria-invalid and a danger track while off', inv.bg === await col('var(--danger)') && await p.evaluate(() => document.getElementById('inv').getAttribute('aria-invalid') === 'true'), JSON.stringify(inv));
await p.click('#dis', { force: true }); await p.waitForTimeout(100);
const dis = await box('dis');
t('disabled: native disabled, 50%, not-allowed; clicks do nothing', dis.disabled && dis.op === '0.5' && dis.cur === 'not-allowed' && !dis.checked, JSON.stringify(dis));
const f = await p.evaluate(() => { const i = document.getElementById('fld'); return { labels: [...i.labels].map((l) => l.textContent).join('|'), desc: document.getElementById(i.getAttribute('aria-describedby')).textContent }; });
t('in a Field: labelled and described by the hint', /Back up automatically/.test(f.labels) && f.desc === 'Every night at 2 am.', JSON.stringify(f));
const durs = async (motion) => { const ctx = await b.newContext({ reducedMotion: motion }); const q = await ctx.newPage(); await q.goto(writePage('switch-' + motion + '.html', APP, { react: true })); await q.waitForTimeout(300); const v = await q.evaluate(() => getComputedStyle(document.querySelector('.dk-switch__thumb')).transitionDuration + '|' + getComputedStyle(document.querySelector('.dk-switch__input')).transitionDuration); await ctx.close(); return v; };
const dur = await durs('no-preference'), rm = await durs('reduce');
t('the thumb slides in 150ms, and doesn\'t animate with reduced motion', dur === '0.15s, 0.15s|0.15s' && rm === '0s|0s', JSON.stringify([dur, rm]));
const con = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = [];
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const surf = col('var(--surface)');
    [['label', 'var(--text)', surf, 4.5], ['description', 'var(--text-muted)', surf, 4.5], ['off track', 'var(--field-border)', surf, 3], ['on track', 'var(--primary)', surf, 3], ['off thumb', 'var(--field)', col('var(--field-border)'), 3], ['off thumb, hover', 'var(--field)', col('var(--field-border-hover)'), 3], ['on thumb', 'var(--on-primary)', col('var(--primary)'), 3], ['on thumb, hover', 'var(--on-primary)', col('var(--primary-hover)'), 3], ['invalid track', 'var(--danger)', surf, 3], ['thumb on invalid track', 'var(--field)', col('var(--danger)'), 3], ['focus', 'var(--focus-ring)', surf, 3]].forEach(([n, fg, bg, need]) => { const r = ratio(col(fg), bg); if (r < need) low.push(th + ' ' + n + ' ' + r.toFixed(2)); });
  }
  document.documentElement.removeAttribute('data-theme');
  return low;
});
t('contrast in all six themes: label and description 4.5:1; tracks on the page, thumbs on their tracks (rest and hover) and the focus ring 3:1', con.length === 0, con.join('; '));
t('no page errors or React warnings', errors.length === 0, errors.join(' | '));
await b.close();
cleanup();
process.exit(report('Switch', R) ? 0 : 1);

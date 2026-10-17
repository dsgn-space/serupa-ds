// Textarea: sizes, rows, the native textarea (ref, attributes, value), resize, auto-resize, the character count,
// states (hover, focus, invalid, read-only, disabled), contrast in every theme.
//   node tools/test/textarea.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:grid;gap:8px;width:320px"></div>
<script>
var D = window.Diki, h = React.createElement; window.changes = [];
function App() {
  var s = React.useState(''), v = s[0], c = React.useState('abc'), cv = c[0];
  window.setCtrl = c[1];
  return h(React.Fragment, null,
    h('label', { htmlFor: 'md' }, 'Notes'),
    h(D.Textarea, { id: 'md', ref: window.r = React.createRef(), placeholder: 'Dana', value: v, onChange: function (e) { window.changes.push(e.target.value); s[1](e.target.value); }, className: 'extra', 'data-x': 'y' }),
    h(D.Textarea, { id: 'sm', size: 'sm', rows: 2, 'aria-label': 'Small' }),
    h(D.Textarea, { id: 'lg', size: 'lg', rows: 1, 'aria-label': 'Large' }),
    h(D.Textarea, { id: 'bad', size: 'xl', rows: -2, 'aria-label': 'Bad' }),
    h(D.Textarea, { id: 'fixed', resize: 'none', 'aria-label': 'Fixed' }),
    h(D.Textarea, { id: 'auto', autoResize: true, rows: 2, maxRows: 4, 'aria-label': 'Auto' }),
    h('div', { id: 'narrow', style: { width: '320px' } }, h(D.Textarea, { id: 'wrap', autoResize: true, rows: 1, defaultValue: 'one two three four five six seven eight nine ten eleven twelve', 'aria-label': 'Wrap' })),
    h(D.Textarea, { id: 'cnt', showCount: true, maxLength: 5, defaultValue: 'ab', 'aria-describedby': 'hint', 'aria-label': 'Count' }),
    h('p', { id: 'hint' }, 'Hint'),
    h(D.Textarea, { id: 'cnt2', showCount: true, value: cv, onChange: function (e) { c[1](e.target.value); }, 'aria-label': 'Count, no max' }),
    h(D.Textarea, { id: 'inv', invalid: true, 'aria-label': 'Invalid' }),
    h(D.Textarea, { id: 'ro', readOnly: true, defaultValue: 'Signed', 'aria-label': 'Read-only' }),
    h(D.Textarea, { id: 'dis', disabled: true, 'aria-label': 'Disabled' }));
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
await p.goto(writePage('textarea.html', APP, { react: true }));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const i = document.getElementById(id), w = i.parentElement, c = getComputedStyle(w), f = getComputedStyle(i); return { tag: i.tagName, rows: i.rows, wrap: w.className, h: w.getBoundingClientRect().height, fh: i.getBoundingClientRect().height, fs: f.fontSize, lh: f.lineHeight, pl: f.paddingLeft, pt: f.paddingTop, bc: c.borderTopColor, bw: c.borderTopWidth, r: c.borderRadius, bs: c.boxShadow, bg: c.backgroundColor, op: c.opacity, size: w.dataset.size, comp: w.dataset.component, resize: f.resize, oy: f.overflowY }; }, id);

const md = await box('md'), sm = await box('sm'), lg = await box('lg'), bad = await box('bad');
t('a native <textarea> in a .dk-textarea box (data-component="textarea"); md text-sm, 12px side and 6px top padding, 1px border, 6px corners, 3 rows by default', md.tag === 'TEXTAREA' && md.comp === 'textarea' && /dk-textarea dk-textarea--size-md/.test(md.wrap) && md.rows === 3 && md.fs === '14px' && md.pl === '12px' && md.pt === '6px' && md.bw === '1px' && md.r === '6px' && Math.round(md.fh) === 3 * 20 + 12, JSON.stringify(md));
t('sizes: sm text-xs 8px/4px padding, lg text-base 16px/10px padding; rows sets the height; unknown size falls back to md and a bad rows to 3', sm.fs === '12px' && sm.pl === '8px' && sm.pt === '4px' && Math.round(sm.fh) === 2 * 16 + 8 && lg.fs === '16px' && lg.pl === '16px' && lg.pt === '10px' && Math.round(lg.fh) === 24 + 20 && bad.size === 'md' && bad.rows === 3, JSON.stringify([sm, lg, bad]));
const at = await p.evaluate(() => { const i = document.getElementById('md'); return { ref: window.r.current === i, cls: i.parentElement.classList.contains('extra'), data: i.dataset.x, label: i.labels[0] && i.labels[0].textContent, ph: i.placeholder }; });
t('ref and attributes go to the <textarea>, className to the box; the <label htmlFor> names it', at.ref && at.cls && at.data === 'y' && at.label === 'Notes' && at.ph === 'Dana', JSON.stringify(at));
await p.click('#md'); await p.keyboard.type('Ki'); await p.keyboard.press('Enter'); await p.keyboard.type('m'); await p.waitForTimeout(250);
t('typing (with a new line) updates a controlled value through onChange', await p.evaluate(() => document.getElementById('md').value === 'Ki\nm' && window.changes.join('|') === 'K|Ki|Ki\n|Ki\nm'));
const foc = await p.evaluate(() => { const w = document.getElementById('md').parentElement, c = getComputedStyle(w), f = document.createElement('div'); f.style.color = 'var(--focus-ring)'; document.body.appendChild(f); const ring = getComputedStyle(f).color; f.remove(); return { bc: c.borderTopColor, bs: c.boxShadow, ring, oc: c.outlineColor, ow: c.outlineWidth }; });
t('focus: the border and a 1px ring take the focus color; a transparent outline for forced-colors mode', foc.bc === foc.ring && foc.bs.includes(foc.ring) && /0px 0px 0px 1px/.test(foc.bs) && foc.ow === '2px' && foc.oc === 'rgba(0, 0, 0, 0)', JSON.stringify(foc));
await p.mouse.move(0, 0); await p.locator('#sm').hover(); await p.waitForTimeout(250);
const hov = await box('sm'), rest = await box('lg');
t('hover: field-border-hover', hov.bc !== rest.bc, JSON.stringify([hov.bc, rest.bc]));
const fixed = await box('fixed');
t('resize: a vertical handle by default; resize="none" has none', md.resize === 'vertical' && fixed.resize === 'none' && /resize-none/.test(fixed.wrap), JSON.stringify([md.resize, fixed.resize]));

// auto-resize
const a0 = await box('auto');
await p.click('#auto'); await p.keyboard.type('1'); await p.keyboard.press('Enter'); await p.keyboard.type('2'); await p.keyboard.press('Enter'); await p.keyboard.type('3'); await p.waitForTimeout(150);
const a3 = await box('auto');
for (const k of ['Enter', '4', 'Enter', '5', 'Enter', '6']) await p.keyboard.press(k);
await p.waitForTimeout(150);
const a6 = await box('auto');
await p.keyboard.press('Control+a'); await p.keyboard.press('Backspace'); await p.waitForTimeout(150);
const ae = await box('auto');
t('autoResize: starts at rows (2 lines), grows a line at a time, stops at maxRows (4) and scrolls, shrinks back when emptied; no resize handle', Math.round(a0.fh) === 2 * 20 + 12 && Math.round(a3.fh) === 3 * 20 + 12 && a3.oy === 'hidden' && Math.round(a6.fh) === 4 * 20 + 12 && a6.oy === 'auto' && Math.round(ae.fh) === 2 * 20 + 12 && a0.resize === 'none', JSON.stringify([a0.fh, a3.fh, a6.fh, a6.oy, ae.fh, a0.resize]));
const w1 = (await box('wrap')).fh;
await p.evaluate(() => { document.getElementById('narrow').style.width = '160px'; }); await p.waitForTimeout(200);
const w2 = (await box('wrap')).fh;
t('autoResize: fits wrapped text, and refits when the width changes', w1 > 20 + 12 && w2 > w1, JSON.stringify([w1, w2]));

// count
const cnt = () => p.evaluate(() => { const i = document.getElementById('cnt'), c = i.parentElement.querySelector('.dk-textarea__count'), j = document.getElementById('cnt2'), c2 = j.parentElement.querySelector('.dk-textarea__count'); return { text: c.textContent, full: c.classList.contains('dk-textarea__count--full'), desc: i.getAttribute('aria-describedby'), id: c.id, col: getComputedStyle(c).color, text2: c2.textContent }; });
const c0 = await cnt();
await p.click('#cnt'); await p.keyboard.press('End'); await p.keyboard.type('cdefg'); await p.waitForTimeout(150);
const c1 = await cnt();
await p.evaluate(() => window.setCtrl('a longer value')); await p.waitForTimeout(150);
const c2 = await cnt();
t('showCount: "2 / 5" under the text, linked by aria-describedby after the field\'s own; counts typing, stops at maxLength and turns text-colored', c0.text === '2 / 5' && c0.desc === 'hint ' + c0.id && c1.text === '5 / 5' && c1.full && !c0.full && c1.col !== c0.col, JSON.stringify([c0, c1]));
t('showCount without maxLength: the plain count, following a controlled value', c0.text2 === '3' && c2.text2 === '14', JSON.stringify([c0.text2, c2.text2]));

const inv = await p.evaluate(() => { const i = document.getElementById('inv'), c = getComputedStyle(i.parentElement), f = document.createElement('div'); f.style.color = 'var(--danger)'; document.body.appendChild(f); const d = getComputedStyle(f).color; f.remove(); return { aria: i.getAttribute('aria-invalid'), bc: c.borderTopColor, d }; });
await p.focus('#inv'); await p.waitForTimeout(250); const invf = await box('inv');
t('invalid: aria-invalid, a danger border and a danger focus ring', inv.aria === 'true' && inv.bc === inv.d && invf.bs.includes(inv.d), JSON.stringify([inv, invf.bs]));
const ro = await box('ro'), dis = await box('dis');
const ros = await p.evaluate(() => { const i = document.getElementById('ro'), d = document.getElementById('dis'); return { ro: i.readOnly, dis: d.disabled, cur: getComputedStyle(d).cursor }; });
t('read-only: surface-muted background, no handle; disabled: native disabled, 50%, not-allowed, no handle', ro.bg !== md.bg && /readonly/.test(ro.wrap) && ro.resize === 'none' && ros.ro && ros.dis && dis.op === '0.5' && /disabled/.test(dis.wrap) && dis.resize === 'none' && ros.cur === 'not-allowed', JSON.stringify([ro, dis, ros]));
const con = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = [];
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const field = col('var(--field)'), surf = col('var(--surface)');
    [['text', 'var(--text)', field, 4.5], ['placeholder', 'var(--placeholder)', field, 4.5], ['count', 'var(--text-muted)', field, 4.5], ['border', 'var(--field-border)', field, 3], ['border on page', 'var(--field-border)', surf, 3], ['focus', 'var(--focus-ring)', surf, 3], ['invalid', 'var(--danger)', field, 3]].forEach(([n, fg, bg, need]) => { const r = ratio(col(fg), bg); if (r < need) low.push(th + ' ' + n + ' ' + r.toFixed(2)); });
  }
  document.documentElement.removeAttribute('data-theme');
  return low;
});
t('contrast in all six themes: text, placeholder and count 4.5:1 on the field; border, focus ring and invalid border 3:1', con.length === 0, con.join('; '));
t('no page errors', errors.length === 0, errors.join(' | '));
await b.close();
cleanup();
process.exit(report('Textarea', R) ? 0 : 1);

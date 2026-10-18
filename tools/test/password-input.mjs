// PasswordInput: Input's box, password type, autocomplete, the show/hide button (aria-pressed, keeps focus in the
// field, keyboard), controlled and uncontrolled, sizes, invalid, disabled, contrast in every theme, tokens.
//   node tools/test/password-input.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;width:320px;display:flex;flex-direction:column;gap:12px"></div>
<script>
var D = window.Serupa, h = React.createElement, P = D.PasswordInput;
window.calls = [];
function Controlled() {
  var s = React.useState(true);
  return h(P, { id: 'pctl', 'aria-label': 'Ctl', visible: s[0], onVisibleChange: function (v) { window.calls.push(v); s[1](v); } });
}
function App() {
  return h(React.Fragment, null,
    h('label', { htmlFor: 'pw' }, 'Password'),
    h(P, { id: 'pw', ref: window.pr = React.createRef(), className: 'extra', style: { marginTop: '2px' }, placeholder: 'Your password', leftIcon: 'lock' }),
    h(P, { id: 'pnew', 'aria-label': 'New', autoComplete: 'new-password', defaultVisible: true, size: 'lg', toggleLabel: 'Show the new password' }),
    h(Controlled),
    h(P, { id: 'pinv', 'aria-label': 'Inv', invalid: true, size: 'sm' }),
    h(P, { id: 'pdis', 'aria-label': 'Dis', disabled: true, size: 'huge' }),
    h(P, { id: 'ptok', 'aria-label': 'Tok', style: { '--password-input-toggle': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('password-input.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const tg = (id) => `#${id} + .dk-password-input__toggle`;

const d = await p.evaluate(() => { const i = document.getElementById('pw'), box = i.parentElement, btn = box.querySelector('button'); return { type: i.type, ac: i.getAttribute('autocomplete'), ref: window.pr.current === i, box: box.className, comp: box.dataset.component, mt: box.style.marginTop, h: box.getBoundingClientRect().height, ph: i.placeholder, label: i.labels[0] && i.labels[0].textContent, btn: btn.type, bl: btn.getAttribute('aria-label'), bp: btn.getAttribute('aria-pressed'), bc: btn.getAttribute('aria-controls'), icon: btn.querySelector('.dk-icon')?.dataset.icon, left: box.querySelector('.dk-input__icon--left .dk-icon')?.dataset.icon, spell: i.spellcheck }; });
t('PasswordInput: Input\'s box (32px, md) around a type="password" field, autocomplete current-password, no spellcheck; ref to the input, className and style to the box', d.type === 'password' && d.ac === 'current-password' && d.ref && d.box === 'dk-input dk-password-input dk-input--size-md extra' && d.comp === 'password-input' && d.mt === '2px' && d.h === 32 && d.ph === 'Your password' && d.label === 'Password' && d.left === 'lock' && d.spell === false, JSON.stringify(d));
t('the show/hide button: type button, "Show password", aria-pressed="false", controls the field, an eye icon', d.btn === 'button' && d.bl === 'Show password' && d.bp === 'false' && d.bc === 'pw' && d.icon === 'visibility', JSON.stringify(d));
await p.fill('#pw', 'hunter2');
await p.focus('#pw');
await p.click(tg('pw'));
const s1 = await p.evaluate(() => { const i = document.getElementById('pw'); return [i.type, i.value, i.nextElementSibling.getAttribute('aria-pressed'), i.nextElementSibling.querySelector('.dk-icon')?.dataset.icon, document.activeElement === i].join(); });
t('pressing it shows the text (type text, aria-pressed true, eye crossed out) and the field keeps focus', s1 === 'text,hunter2,true,visibility_off,true', s1);
await p.focus(tg('pw')); await p.keyboard.press('Enter');
const s2 = await p.evaluate(() => document.getElementById('pw').type);
await p.keyboard.press('Space');
const s3 = await p.evaluate(() => document.getElementById('pw').type);
t('keyboard: Enter and Space on the button toggle it', s2 === 'password' && s3 === 'text', [s2, s3].join());
const ring = await st(tg('pw'), ['outlineStyle', 'outlineWidth']);
t('the button shows a 2px focus ring', ring.outlineStyle === 'solid' && ring.outlineWidth === '2px', JSON.stringify(ring));
const nw = await p.evaluate(() => { const i = document.getElementById('pnew'); return [i.type, i.getAttribute('autocomplete'), i.nextElementSibling.getAttribute('aria-label'), Math.round(i.parentElement.getBoundingClientRect().height)].join(); });
t('defaultVisible starts shown; autoComplete and toggleLabel are yours; size lg is 44px', nw === 'text,new-password,Show the new password,44', nw);
await p.click(tg('pctl'));
t('controlled: onVisibleChange gets the new state, the parent sets it', (await p.evaluate(() => [document.getElementById('pctl').type, window.calls.join()].join('|'))) === 'password|false');
const inv = await p.evaluate(() => { const i = document.getElementById('pinv'); return [i.getAttribute('aria-invalid'), i.parentElement.className.includes('dk-input--invalid'), Math.round(i.parentElement.getBoundingClientRect().height)].join(); });
t('invalid: aria-invalid and the danger border; size sm is 24px', inv === 'true,true,24', inv);
const dis = await p.evaluate(() => { const i = document.getElementById('pdis'); return [i.disabled, i.nextElementSibling.disabled, i.parentElement.className.includes('dk-input--disabled'), i.parentElement.dataset.size].join(); });
t('disabled: the field and the button; an unknown size falls back to md', dis === 'true,true,true,md', dis);
const tk = await st(tg('ptok'), ['color']);
t('PasswordInput token --password-input-toggle overrides one field', tk.color === 'rgb(1, 2, 3)', JSON.stringify(tk));
const isz = await p.evaluate(() => ['pinv', 'pw', 'pnew'].map((id) => getComputedStyle(document.querySelector('#' + id + ' + button .dk-icon')).fontSize).join());
t('the eye icon follows the field\'s icon size: 14, 16, 20px', isz === '14px,16px,20px', isz);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const box = document.getElementById('pnew').parentElement, bg = rgb(getComputedStyle(box).backgroundColor);
    for (const [name, fg, min] of [['text', rgb(getComputedStyle(document.getElementById('pnew')).color), 4.5], ['eye icon', rgb(getComputedStyle(box.querySelector('button')).color), 3]]) {
      const r = ratio(fg, bg); n++;
      if (r < min) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the text 4.5:1 and the eye icon 3:1 on the field in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('PasswordInput', R) ? 0 : 1);

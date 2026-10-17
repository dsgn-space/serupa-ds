// Field: the label linked to the control, ids, hint and error in aria-describedby, invalid passed on, required and
// optional, disabled, group (fieldset and legend), colors and contrast in every theme.
//   node tools/test/field.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;width:360px"></div>
<script>
var D = window.Diki, h = React.createElement;
function App() {
  var e = React.useState('Enter an email address.'), err = e[0]; window.setErr = e[1];
  return h(React.Fragment, null,
    h(D.Field, { id: 'f-plain', label: 'Name', className: 'extra', 'data-x': 'y' }, h(D.Input, { ref: window.r = React.createRef() })),
    h(D.Field, { label: 'Email', hint: 'For receipts.', error: err, required: true }, h(D.Input, { id: 'mail', 'aria-describedby': 'own' })),
    h('p', { id: 'own' }, 'own'),
    h(D.Field, { label: 'Notes', optional: true }, h(D.Textarea, { id: 'notes' })),
    h(D.Field, { label: 'Code', optional: 'Leave blank if none' }, h('input', { id: 'native' })),
    h(D.Field, { label: 'Native bad', error: 'Bad' }, h('input', { id: 'native-bad' })),
    h(D.Field, { label: 'Locked', disabled: true }, h(D.Input, { id: 'locked' })),
    h(D.Field, { group: true, label: 'Plan', hint: 'Pick one.', error: 'Choose a plan.', id: 'grp' },
      h('label', null, h('input', { type: 'radio', name: 'p', id: 'r1' }), 'Free'),
      h('label', null, h('input', { type: 'radio', name: 'p', id: 'r2' }), 'Pro')),
    h(D.Field, { group: true, label: 'Off', disabled: true }, h('input', { type: 'checkbox', id: 'c1' })));
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
await p.goto(writePage('field.html', APP, { react: true }));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);

const plain = await p.evaluate(() => { const i = document.getElementById('f-plain'), f = i.closest('.dk-field'), l = f.querySelector('label'); return { ref: window.r.current === i, label: i.labels[0] && i.labels[0].textContent, cls: f.className, data: f.dataset.x, comp: f.dataset.component, order: [...f.children].map((c) => c.className.split(' ')[0]).join(), fw: getComputedStyle(l).fontWeight, desc: i.getAttribute('aria-describedby'), inv: i.getAttribute('aria-invalid') }; });
t('the label names the control (Field\'s id prop becomes the control\'s id); ref still reaches the input; className and attributes go to the outer element; label is font-medium', plain.ref && plain.label === 'Name' && /dk-field extra/.test(plain.cls) && plain.data === 'y' && plain.comp === 'field' && plain.fw === '500' && plain.desc === null && plain.inv === null, JSON.stringify(plain));
const mail = await p.evaluate(() => { const i = document.getElementById('mail'), f = i.closest('.dk-field'), ids = i.getAttribute('aria-describedby').split(' '); return { ids, hint: document.getElementById(ids[1]) && document.getElementById(ids[1]).textContent, err: document.getElementById(ids[2]) && document.getElementById(ids[2]).textContent, inv: i.getAttribute('aria-invalid'), req: i.getAttribute('aria-required'), star: f.querySelector('.dk-field__required').getAttribute('aria-hidden'), name: i.labels[0].textContent, order: [...f.children].map((c) => c.className.split(' ')[0]).join(), box: i.parentElement.className, icon: f.querySelector('.dk-field__error .dk-icon').textContent }; });
t('hint and error join the control\'s own aria-describedby; the error makes it invalid (Input gets invalid); required adds aria-required and a hidden *', mail.ids[0] === 'own' && mail.hint === 'For receipts.' && mail.err === 'Enter an email address.' && mail.inv === 'true' && /dk-input--invalid/.test(mail.box) && mail.req === 'true' && mail.star === 'true' && mail.order === 'dk-field__label,dk-field__hint,dk-field__control,dk-field__error' && mail.icon === 'error', JSON.stringify(mail));
await p.evaluate(() => window.setErr(null)); await p.waitForTimeout(100);
const cleared = await p.evaluate(() => { const i = document.getElementById('mail'); return { d: i.getAttribute('aria-describedby').split(' ').length, inv: i.getAttribute('aria-invalid'), err: !!i.closest('.dk-field').querySelector('.dk-field__error') }; });
t('clearing the error removes the message, its id and the invalid state', cleared.d === 2 && cleared.inv === null && !cleared.err, JSON.stringify(cleared));
const opt = await p.evaluate(() => [document.getElementById('notes').labels[0].textContent, document.getElementById('native').labels[0].textContent, document.getElementById('native-bad').getAttribute('aria-invalid'), document.getElementById('native-bad').hasAttribute('invalid')]);
t('optional adds "(optional)" or your words; a plain DOM control gets aria-invalid, never an unknown invalid attribute', opt[0] === 'Notes(optional)' && opt[1] === 'CodeLeave blank if none' && opt[2] === 'true' && !opt[3], JSON.stringify(opt));
const dis = await p.evaluate(() => { const i = document.getElementById('locked'), f = i.closest('.dk-field'); return { dis: i.disabled, op: getComputedStyle(f.querySelector('.dk-field__label')).opacity }; });
t('disabled disables the control and dims the label', dis.dis && dis.op === '0.5', JSON.stringify(dis));
const grp = await p.evaluate(() => { const r = document.getElementById('r1'), fs = r.closest('fieldset'), ids = fs.getAttribute('aria-describedby').split(' '), lg = fs.querySelector('legend'); const lr = lg.getBoundingClientRect(), hr = fs.querySelector('.dk-field__hint').getBoundingClientRect(); return { cls: fs.className, legend: lg.textContent, ids: ids.map((i) => document.getElementById(i).textContent), rInv: r.getAttribute('aria-invalid'), rId: r.id, border: getComputedStyle(fs).borderTopWidth, stacked: hr.top >= lr.bottom, c1: document.getElementById('c1').matches(':disabled') }; });
t('group: a <fieldset> with a <legend> laid out like a label, the hint and error describe the fieldset, controls keep their ids; group disabled disables every control', /dk-field--group/.test(grp.cls) && grp.legend === 'Plan' && grp.ids.join('|') === 'Pick one.|Choose a plan.' && grp.rId === 'r1' && grp.border === '0px' && grp.stacked && grp.c1, JSON.stringify(grp));
const con = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = [];
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const surf = col('var(--surface)'), muted = col('var(--surface-muted)');
    [['label', 'var(--text)', surf], ['hint', 'var(--text-muted)', surf], ['error', 'var(--danger-text)', surf], ['error on muted', 'var(--danger-text)', muted], ['required', 'var(--danger-text)', surf]].forEach(([n, fg, bg]) => { const r = ratio(col(fg), bg); if (r < 4.5) low.push(th + ' ' + n + ' ' + r.toFixed(2)); });
  }
  document.documentElement.removeAttribute('data-theme');
  return low;
});
t('contrast in all six themes: label, hint, error and * at 4.5:1 on surface (error on surface-muted too)', con.length === 0, con.join('; '));
t('no page errors or React warnings', errors.length === 0, errors.join(' | '));
await b.close();
cleanup();
process.exit(report('Field', R) ? 0 : 1);

// FileUpload: the drop area and button, choosing files through the input, dropping files, accept (types and
// extensions), maxSize, maxFiles, single vs multiple, duplicates, the file list (icon, name, size, remove and
// where focus goes), rejections (role="alert", onReject), controlled, disabled, keyboard, the native input following the
// list, formatFileSize, contrast in every theme and tokens.
//   node tools/test/file-upload.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;width:420px;display:flex;flex-direction:column;gap:24px"></div>
<script>
var D = window.Diki, h = React.createElement;
window.changes = []; window.rejects = [];
function Controlled() {
  var s = React.useState([]); window.ctlFiles = s[0]; window.setCtl = s[1];
  return h(D.FileUpload, { id: 'ctl', files: s[0], onFilesChange: function (f) { window.changes.push(f.map(function (x) { return x.name; }).join('|')); s[1](f); } });
}
function App() {
  return h(React.Fragment, null,
    h(D.FileUpload, { id: 'many', 'data-testid': 'many', multiple: true, accept: 'image/*,.pdf', maxSize: 1024 * 1024, maxFiles: 3, hint: 'Images or PDF, up to 1 MB', name: 'docs', ref: window.fr = React.createRef(), className: 'extra',
      onReject: function (r) { window.rejects.push(r.map(function (x) { return x.reason; }).join(',')); } }),
    h(Controlled),
    h(D.FileUpload, { id: 'dis', disabled: true }),
    h(D.FileUpload, { id: 'tok', style: { '--file-upload-zone-bg': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('file-upload.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const file = (name, type, size) => ({ name, mimeType: type, buffer: Buffer.alloc(size, 1) });
const root = (sel) => `[data-component=file-upload]:has(${sel})`;
const many = '[data-testid=many]';
const list = (sel) => p.evaluate((sel) => [...document.querySelectorAll(sel + ' .dk-file-upload__item')].map((li) => li.querySelector('.dk-file-upload__name').textContent + ' ' + li.querySelector('.dk-file-upload__size').textContent + ' ' + li.querySelector('.dk-file-upload__file-icon').textContent), sel);
const errs = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel + ' .dk-file-upload__errors'); return e ? e.getAttribute('role') + ': ' + [...e.querySelectorAll('.dk-file-upload__error')].map((x) => x.textContent.replace(/^error/, '')).join(' / ') : null; }, sel);

const a = await p.evaluate(() => { const el = document.querySelector('[data-testid=many]'), btn = el.querySelector('button'), inp = el.querySelector('input[type=file]'); return { ref: window.fr.current === el, cls: el.className, comp: el.dataset.component, title: el.querySelector('.dk-file-upload__title').textContent, btn: btn.textContent, desc: document.getElementById(btn.getAttribute('aria-describedby')).textContent, accept: inp.accept, multiple: inp.multiple, name: inp.name, id: inp.id, hidden: inp.getAttribute('aria-hidden'), tab: inp.tabIndex }; });
t('a drop area titled "Drag files here" with a "Choose files" button described by the hint; a hidden native input with accept, multiple, name and the given id; ref and className', a.ref && /extra/.test(a.cls) && a.comp === 'file-upload' && a.title === 'Drag files here' && a.btn === 'Choose files' && a.desc === 'Images or PDF, up to 1 MB' && a.accept === 'image/*,.pdf' && a.multiple && a.name === 'docs' && a.id === 'many' && a.hidden === 'true' && a.tab === -1, JSON.stringify(a));
const [chooser] = await Promise.all([p.waitForEvent('filechooser'), p.click(many + ' button')]);
t('the button opens the file picker', chooser.isMultiple());
await chooser.setFiles([file('photo.png', 'image/png', 2048), file('report.pdf', 'application/pdf', 1536 * 1024 / 2)]);
const l1 = await list(many);
t('chosen files are listed with a type icon, name and size (2 KB, 768 KB)', l1.join() === 'photo.png 2 KB image,report.pdf 768 KB picture_as_pdf', JSON.stringify(l1));
t('the native input holds the listed files, so a form sends them', await p.evaluate(() => [...document.querySelector('[data-testid=many] input[type=file]').files].map((f) => f.name).join()) === 'photo.png,report.pdf');
await p.setInputFiles(many + ' input[type=file]', [file('notes.txt', 'text/plain', 10), file('huge.png', 'image/png', 2 * 1024 * 1024), file('photo.png', 'image/png', 2048)]);
const e1 = await errs(many);
t('accept and maxSize: a .txt and a 2 MB image are refused in a role="alert" message; a duplicate is skipped quietly', (await list(many)).length === 2 && e1 === 'alert: notes.txt: this type of file isn\'t accepted. / huge.png is larger than 1 MB.' && (await p.evaluate(() => window.rejects.join(';'))) === 'type,size', e1);
await p.setInputFiles(many + ' input[type=file]', [file('a.jpg', 'image/jpeg', 100), file('b.jpg', 'image/jpeg', 100)]);
t('maxFiles=3: the fourth file isn\'t added, and says why', (await list(many)).length === 3 && (await errs(many)) === 'alert: b.jpg wasn\'t added: up to 3 files.', await errs(many));
await p.click(`${many} .dk-file-upload__item:first-child button`);
const afterRemove = await p.evaluate(() => ({ names: [...document.querySelectorAll('[data-testid=many] .dk-file-upload__name')].map((x) => x.textContent).join(), focus: document.activeElement.textContent, label: document.querySelector('[data-testid=many] .dk-file-upload__item button').getAttribute('aria-label'), errs: !!document.querySelector('[data-testid=many] .dk-file-upload__errors') }));
t('the remove button (named "Remove report.pdf") takes the file off the list, clears old messages and moves focus to Choose files', afterRemove.names === 'report.pdf,a.jpg' && afterRemove.focus === 'Choose files' && afterRemove.label === 'Remove report.pdf' && !afterRemove.errs, JSON.stringify(afterRemove));
await p.evaluate(() => {
  const zone = document.querySelector('[data-testid=many] .dk-file-upload__zone'), dt = new DataTransfer();
  dt.items.add(new File([new Uint8Array(300)], 'drop.gif', { type: 'image/gif' }));
  window.dt = dt;
  zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
});
await p.waitForTimeout(50);
await p.evaluate(() => {
  const zone = document.querySelector('[data-testid=many] .dk-file-upload__zone');
  window.overState = zone.className;
  zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: window.dt }));
});
await p.waitForTimeout(50);
const dropped = await p.evaluate(() => ({ over: window.overState, now: document.querySelector('[data-testid=many] .dk-file-upload__zone').className, names: [...document.querySelectorAll('[data-testid=many] .dk-file-upload__name')].map((x) => x.textContent).join() }));
t('dragging files over the area highlights it; dropping adds them and ends the highlight', /zone--over/.test(dropped.over) && !/zone--over/.test(dropped.now) && dropped.names === 'report.pdf,a.jpg,drop.gif', JSON.stringify(dropped));

const ctlRoot = root('#ctl');
const s = await p.evaluate(() => { const el = document.querySelector('[data-component=file-upload]:has(#ctl)'); return { title: el.querySelector('.dk-file-upload__title').textContent, btn: el.querySelector('button').textContent, multiple: el.querySelector('input').multiple }; });
await p.setInputFiles('#ctl', [file('one.png', 'image/png', 10)]);
await p.setInputFiles('#ctl', [file('two.png', 'image/png', 10)]);
t('single file (no multiple): "Drag a file here", "Choose a file"; a new file replaces the old one; onFilesChange gets the list', s.title === 'Drag a file here' && s.btn === 'Choose a file' && !s.multiple && (await p.evaluate(() => window.changes.join(';'))) === 'one.png;two.png' && (await list(ctlRoot)).length === 1, JSON.stringify(s));
await p.evaluate(() => window.setCtl([])); await p.waitForTimeout(50);
t('controlled: clearing the list from outside empties it', (await list(ctlRoot)).length === 0);
const dis = await p.evaluate(() => { const el = document.querySelector('[data-component=file-upload]:has(#dis)'); return { btn: el.querySelector('button').disabled, input: el.querySelector('input').disabled, op: getComputedStyle(el.querySelector('.dk-file-upload__zone')).opacity }; });
t('disabled: the button and input are disabled, the area faded', dis.btn && dis.input && dis.op === '0.5', JSON.stringify(dis));
const fmt = await p.evaluate(() => [0, 12, 1023, 1024, 1536, 10 * 1024 * 1024 + 1, 3.25 * 1024 ** 3].map(window.Diki.formatFileSize).join('|'));
t('formatFileSize: 0 B, 12 B, 1023 B, 1 KB, 1.5 KB, 10 MB, 3.3 GB', fmt === '0 B|12 B|1023 B|1 KB|1.5 KB|10 MB|3.3 GB', fmt);
await p.setInputFiles(many + ' input[type=file]', [file('x.txt', 'text/plain', 1)]);
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const el = document.querySelector('[data-testid=many]'), zone = el.querySelector('.dk-file-upload__zone'), zs = getComputedStyle(zone), page = getComputedStyle(document.body).backgroundColor, item = el.querySelector('.dk-file-upload__item'), ib = getComputedStyle(item).backgroundColor;
    const c = (sel) => getComputedStyle(el.querySelector(sel)).color;
    const pairs = [['title', c('.dk-file-upload__title'), zs.backgroundColor, 4.5], ['hint', c('.dk-file-upload__hint'), zs.backgroundColor, 4.5], ['icon', c('.dk-file-upload__icon'), zs.backgroundColor, 3], ['zone outline', zs.borderTopColor, page, 3], ['error', c('.dk-file-upload__error'), page, 4.5], ['file name', c('.dk-file-upload__name'), ib, 4.5], ['size', c('.dk-file-upload__size'), ib, 4.5]];
    zone.classList.add('dk-file-upload__zone--over');
    const zo = getComputedStyle(zone);
    pairs.push(['hint while dragging', c('.dk-file-upload__hint'), zo.backgroundColor, 4.5], ['title while dragging', c('.dk-file-upload__title'), zo.backgroundColor, 4.5]);
    zone.classList.remove('dk-file-upload__zone--over');
    for (const [k, fg, bg, min] of pairs) { const r = ratio(rgb(fg), rgb(bg)); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: text 4.5:1 (also while dragging), the icon and outline 3:1, in all six themes', contrast.low.length === 0 && contrast.n === 54, contrast.low.join('; '));
t('--file-upload-zone-bg overrides one upload', await p.evaluate(() => getComputedStyle(document.querySelector('#tok').closest('[data-component=file-upload]').querySelector('.dk-file-upload__zone')).backgroundColor === 'rgb(1, 2, 3)'));

// Keyboard, on a fresh page so Tab starts at the top: the choose button is the first stop, Enter and Space
// open the file picker, each chosen file's remove button follows, and removing one returns focus to the button.
// A standing listener set before the reload, so the picker is intercepted from the first key press
// (a waitForEvent started with the key press can lose that race).
let picked = null; p.on('filechooser', (fc) => { picked = fc; });
await p.reload(); await p.waitForSelector(`${many} .dk-btn`);
await p.keyboard.press('Tab');
const first = await p.evaluate((m) => document.activeElement === document.querySelector(m + ' .dk-btn'), many);
t('keyboard: Tab reaches the choose button first (the hidden input and the drop area are skipped)', first);
const opens = async (key) => { picked = null; await p.keyboard.press(key); for (let i = 0; i < 30 && !picked; i++) await p.waitForTimeout(100); return picked; };
const byEnter = await opens('Enter');
if (byEnter) await byEnter.setFiles([]);   // close it: one picker at a time
const bySpace = await opens('Space');
t('keyboard: Enter and Space on the choose button open the file picker', !!byEnter && !!bySpace, JSON.stringify({ enter: !!byEnter, space: !!bySpace }));
if (bySpace) await bySpace.setFiles([file('a.png', 'image/png', 10), file('b.pdf', 'application/pdf', 10)]);
await p.waitForFunction((m) => document.querySelectorAll(m + ' .dk-file-upload__item').length === 2, many);
const stops = [];
for (let i = 0; i < 2; i++) { await p.keyboard.press('Tab'); stops.push(await p.evaluate(() => document.activeElement.getAttribute('aria-label'))); }
t('keyboard: Tab then reaches each file\'s remove button, named after the file', stops.length === 2 && stops.every((x, i) => x && x.includes(['a.png', 'b.pdf'][i])), stops.join(' | '));
await p.keyboard.press('Enter');
await p.waitForFunction((m) => document.querySelectorAll(m + ' .dk-file-upload__item').length === 1, many);
const back = await p.evaluate((m) => document.activeElement === document.querySelector(m + ' .dk-btn'), many);
t('keyboard: Enter removes the file and focus goes back to the choose button', back);
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('FileUpload', R) ? 0 : 1);

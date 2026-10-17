// Dialog: opening as a modal (top layer, focus inside, page inert and not scrolling), naming, Escape, the × and
// the backdrop asking to close, focus going back, alert dialogs, sizes, contrast in every theme and tokens.
//   node tools/test/dialog.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;height:2000px"></div>
<script>
var D = window.Diki, h = React.createElement; window.asks = [];
function App() {
  var a = React.useState(false), al = React.useState(false), s = React.useState('md');
  window.setOpen = a[1]; window.setAlert = al[1]; window.setSize = s[1];
  var ask = function (k, set) { return function (v) { window.asks.push(k + ':' + v); set(v); }; };
  return h(React.Fragment, null,
    h(D.Button, { id: 'opener', onClick: function () { a[1](true); } }, 'Open'),
    h(D.Button, { id: 'aopener', onClick: function () { al[1](true); } }, 'Delete'),
    h('button', { id: 'behind' }, 'Behind'),
    h(D.Dialog, { id: 'dlg', open: a[0], onOpenChange: ask('dlg', a[1]), size: s[0], title: 'Invite people', description: 'They’ll get an email.', ref: window.r = React.createRef(), className: 'extra',
      footer: [h(D.Button, { key: 1, variant: 'secondary', onClick: function () { a[1](false); } }, 'Cancel'), h(D.Button, { key: 2, id: 'send' }, 'Send')] },
      h(D.Input, { id: 'email', 'aria-label': 'Email' })),
    h(D.Dialog, { id: 'alert', alert: true, open: al[0], onOpenChange: ask('alert', al[1]), title: 'Delete Atlas?', description: 'This can’t be undone.', size: 'sm',
      footer: [h(D.Button, { key: 1, id: 'keep', variant: 'secondary', onClick: function () { al[1](false); } }, 'Keep'), h(D.Button, { key: 2, destructive: true }, 'Delete')] }),
    h(D.Dialog, { id: 'tok', open: false, title: 'T', style: { '--dialog-bg': 'rgb(1, 2, 3)' } }, 'x'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('dialog.html', APP, { react: true }));
await p.waitForTimeout(300);
const isOpen = (id) => p.evaluate((id) => document.getElementById(id).open, id);

t('closed at first: not shown', !(await isOpen('dlg')) && await p.evaluate(() => getComputedStyle(document.getElementById('dlg')).display === 'none'));
await p.focus('#opener'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
const o = await p.evaluate(() => { const d = document.getElementById('dlg'), pn = d.querySelector('.dk-dialog__panel').getBoundingClientRect(); return { open: d.open, modal: d.matches(':modal'), tag: d.tagName, label: document.getElementById(d.getAttribute('aria-labelledby')).textContent, desc: document.getElementById(d.getAttribute('aria-describedby')).textContent, am: d.getAttribute('aria-modal'), role: d.getAttribute('role'), focus: d.contains(document.activeElement), w: Math.round(pn.width), cx: Math.round(pn.left + pn.width / 2), cy: Math.round(pn.top + pn.height / 2), ref: window.r.current === d, cls: d.className, comp: d.dataset.component, scroll: getComputedStyle(document.documentElement).overflow }; });
t('open: a modal <dialog> (top layer), named by the title and described by the description, focus inside; ref and className reach it', o.open && o.modal && o.tag === 'DIALOG' && o.label === 'Invite people' && o.desc === 'They’ll get an email.' && o.am === 'true' && o.role === null && o.focus && o.ref && /extra/.test(o.cls) && o.comp === 'dialog', JSON.stringify(o));
t('md: 512px wide, centered on the screen; the page behind doesn\'t scroll', o.w === 512 && o.cx === 500 && Math.abs(o.cy - 350) <= 1 && o.scroll === 'hidden', JSON.stringify(o));
const inert = await p.evaluate(() => { const r = document.getElementById('behind').getBoundingClientRect(); const e = document.elementFromPoint(r.left + 2, r.top + 2); return e && e.id; });
t('the page behind can\'t be clicked (the backdrop covers it)', inert !== 'behind', inert);
for (let i = 0; i < 8; i++) await p.keyboard.press('Tab');
t('Tab stays inside the dialog', await p.evaluate(() => document.getElementById('dlg').contains(document.activeElement) || document.activeElement === document.body));
await p.keyboard.press('Escape'); await p.waitForTimeout(100);
t('Escape asks to close (onOpenChange(false)), and focus goes back to the button that opened it', !(await isOpen('dlg')) && (await p.evaluate(() => window.asks.join())) === 'dlg:false' && (await p.evaluate(() => document.activeElement.id)) === 'opener', await p.evaluate(() => window.asks.join() + ' ' + document.activeElement.id));
await p.click('#opener'); await p.waitForTimeout(300);
await p.click('#dlg .dk-dialog__panel', { position: { x: 30, y: 120 } }); await p.waitForTimeout(50);
t('a click inside the panel doesn\'t close it', await isOpen('dlg'));
await p.mouse.click(20, 20); await p.waitForTimeout(100);
t('a click on the backdrop asks to close', !(await isOpen('dlg')) && (await p.evaluate(() => window.asks.join())) === 'dlg:false,dlg:false');
await p.click('#opener'); await p.waitForTimeout(300);
const x = await p.evaluate(() => { const c = document.querySelector('#dlg .dk-dialog__close'); return [c.getAttribute('aria-label'), c.tagName].join(); });
await p.click('#dlg .dk-dialog__close'); await p.waitForTimeout(100);
t('the × (a button named "Close") asks to close', x === 'Close,BUTTON' && !(await isOpen('dlg')), x);
// Measure once the opening animation has ended (it scales the panel from 95%): headless WebKit can start it late.
const settled = () => p.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))));
await p.evaluate(() => { window.setSize('lg'); window.setOpen(true); }); await p.waitForTimeout(300); await settled();
const lg = await p.evaluate(() => Math.round(document.querySelector('#dlg .dk-dialog__panel').getBoundingClientRect().width));
await p.evaluate(() => window.setOpen(false)); await p.waitForTimeout(100);
await p.setViewportSize({ width: 360, height: 300 });
await p.evaluate(() => { window.setSize('md'); window.setOpen(true); }); await p.waitForTimeout(300); await settled();
const small = await p.evaluate(() => { const r = document.querySelector('#dlg .dk-dialog__panel').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width), Math.round(r.top), Math.round(r.bottom)]; });
await p.evaluate(() => window.setOpen(false)); await p.waitForTimeout(100);
await p.setViewportSize({ width: 1000, height: 700 });
t('lg: 672px; on a small screen it keeps 16px from each edge and fits the height', lg === 672 && small[0] === 16 && small[1] === 328 && small[2] >= 16 && small[3] <= 284, JSON.stringify([lg, small]));

await p.click('#aopener'); await p.waitForTimeout(300);
const a = await p.evaluate(() => { const d = document.getElementById('alert'); return { role: d.getAttribute('role'), close: !!d.querySelector('.dk-dialog__close'), w: Math.round(d.querySelector('.dk-dialog__panel').getBoundingClientRect().width) }; });
await p.mouse.click(20, 20); await p.waitForTimeout(100);
const still = await isOpen('alert');
await p.keyboard.press('Escape'); await p.waitForTimeout(100);
t('alert: role="alertdialog", 384px (sm), no ×, the backdrop doesn\'t close it, Escape does', a.role === 'alertdialog' && !a.close && a.w === 384 && still && !(await isOpen('alert')), JSON.stringify(a));

await p.evaluate(() => window.setOpen(true)); await p.waitForTimeout(300);
const look = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('#dlg .dk-dialog__panel')), ti = getComputedStyle(document.querySelector('#dlg .dk-dialog__title')); return { pad: s.paddingTop, r: s.borderTopLeftRadius, sh: s.boxShadow, gap: s.rowGap, tfs: ti.fontSize, tfw: ti.fontWeight, foot: getComputedStyle(document.querySelector('#dlg .dk-dialog__footer')).justifyContent }; });
t('look: 24px padding, 12px corners, shadow-xl, 16px between parts, a text-lg semibold title, actions at the end', look.pad === '24px' && look.r === '12px' && /20px 25px -5px/.test(look.sh) && look.gap === '16px' && look.tfs === '18px' && look.tfw === '600' && look.foot === 'flex-end', JSON.stringify(look));
const contrast = await p.evaluate(() => {
  const still = document.createElement('style'); still.textContent = '* { transition: none !important; animation: none !important; }'; document.head.appendChild(still);
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const bg = rgb(getComputedStyle(document.querySelector('#dlg .dk-dialog__panel')).backgroundColor);
    for (const sel of ['.dk-dialog__title', '.dk-dialog__description']) { const r = ratio(rgb(getComputedStyle(document.querySelector('#dlg ' + sel)).color), bg); n++; if (r < 4.5) low.push(`${th} ${sel}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme'); still.remove();
  return { low, n };
});
t('contrast: title and description keep 4.5:1 on the panel in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
await p.evaluate(() => window.setOpen(false)); await p.waitForTimeout(100);
t('closed again: the page scrolls', await p.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'));
t('--dialog-bg overrides one dialog', await p.evaluate(() => { const d = document.getElementById('tok'); d.showModal(); const c = getComputedStyle(d.querySelector('.dk-dialog__panel')).backgroundColor; d.close(); return c === 'rgb(1, 2, 3)'; }));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Dialog', R) ? 0 : 1);

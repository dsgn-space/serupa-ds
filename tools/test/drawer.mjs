// Drawer: opening as a modal from each edge (top layer, focus inside, page not scrolling), naming, Escape, the ×
// and the backdrop asking to close, focus going back, widths, the scrolling body and footer, contrast in every
// theme and tokens.
//   node tools/test/drawer.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;height:2000px"></div>
<script>
var D = window.Serupa, h = React.createElement; window.asks = [];
function App() {
  var a = React.useState(false), s = React.useState('right'), z = React.useState('md'), bd = React.useState(true);
  window.setOpen = a[1]; window.setSide = s[1]; window.setSize = z[1]; window.setBd = bd[1];
  var rows = []; for (var i = 0; i < 60; i++) rows.push(h('p', { key: i }, 'Row ' + i));
  return h(React.Fragment, null,
    h(D.Button, { id: 'opener', onClick: function () { a[1](true); } }, 'Filters'),
    h('button', { id: 'behind' }, 'Behind'),
    h(D.Drawer, { id: 'drw', open: a[0], side: s[0], size: z[0], closeOnBackdrop: bd[0], onOpenChange: function (v) { window.asks.push(v); a[1](v); }, title: 'Filters', description: 'Narrow the list.', ref: window.r = React.createRef(), className: 'extra',
      footer: [h(D.Button, { key: 1, variant: 'secondary' }, 'Reset'), h(D.Button, { key: 2, id: 'apply' }, 'Apply')] },
      h(D.Input, { id: 'q', 'aria-label': 'Search' }), rows),
    h(D.Drawer, { id: 'tok', open: false, title: 'T', style: { '--drawer-bg': 'rgb(1, 2, 3)' } }, 'x'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('drawer.html', APP, { react: true }));
await p.waitForTimeout(300);
const isOpen = () => p.evaluate(() => document.getElementById('drw').open);
const box = () => p.evaluate(() => { const r = document.querySelector('#drw .dk-drawer__panel').getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); });
const reopen = async (fn) => { await p.evaluate(() => window.setOpen(false)); await p.waitForTimeout(50); await p.evaluate(fn); await p.evaluate(() => window.setOpen(true)); await p.waitForTimeout(400); };

t('closed at first: not shown', !(await isOpen()) && await p.evaluate(() => getComputedStyle(document.getElementById('drw')).display === 'none'));
await p.focus('#opener'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
const o = await p.evaluate(() => { const d = document.getElementById('drw'); return { open: d.open, modal: d.matches(':modal'), label: document.getElementById(d.getAttribute('aria-labelledby')).textContent, desc: document.getElementById(d.getAttribute('aria-describedby')).textContent, am: d.getAttribute('aria-modal'), focus: d.contains(document.activeElement), ref: window.r.current === d, cls: d.className, comp: d.dataset.component, side: d.dataset.side, scroll: getComputedStyle(document.documentElement).overflow }; });
t('open: a modal <dialog> named by the title and described by the description, focus inside; ref and className reach it', o.open && o.modal && o.label === 'Filters' && o.desc === 'Narrow the list.' && o.am === 'true' && o.focus && o.ref && /extra/.test(o.cls) && o.comp === 'drawer' && o.side === 'right', JSON.stringify(o));
const r1 = await box();
t('right, md (default): 384px wide, full height, against the right edge; the page behind doesn\'t scroll', r1[0] === 616 && r1[1] === 0 && r1[2] === 384 && r1[3] === 700 && o.scroll === 'hidden', JSON.stringify(r1));
const parts = await p.evaluate(() => { const bd = document.querySelector('#drw .dk-drawer__body'), f = document.querySelector('#drw .dk-drawer__footer').getBoundingClientRect(); return { scrolls: bd.scrollHeight > bd.clientHeight && getComputedStyle(bd).overflowY === 'auto', fb: Math.round(f.bottom), fl: Math.round(f.left), fr: Math.round(f.right), line: getComputedStyle(document.querySelector('#drw .dk-drawer__footer')).borderTopWidth }; });
t('long content scrolls in the body; the footer is pinned to the bottom, edge to edge, under a 1px line', parts.scrolls && parts.fb === 700 && parts.fl === 616 && parts.fr === 1000 && parts.line === '1px', JSON.stringify(parts));
const inert = await p.evaluate(() => { const r = document.getElementById('behind').getBoundingClientRect(); const e = document.elementFromPoint(r.left + 2, r.top + 2); return e && e.id; });
t('the page behind can\'t be clicked', inert !== 'behind', inert);
for (let i = 0; i < 8; i++) await p.keyboard.press('Tab');
t('Tab stays inside the drawer', await p.evaluate(() => document.getElementById('drw').contains(document.activeElement) || document.activeElement === document.body));
await p.keyboard.press('Escape'); await p.waitForTimeout(100);
t('Escape asks to close, and focus goes back to the button that opened it', !(await isOpen()) && (await p.evaluate(() => window.asks.join())) === 'false' && (await p.evaluate(() => document.activeElement.id)) === 'opener', await p.evaluate(() => window.asks.join() + ' ' + document.activeElement.id));
await p.click('#opener'); await p.waitForTimeout(400);
await p.click('#drw .dk-drawer__title'); await p.waitForTimeout(50);
t('a click inside the panel doesn\'t close it', await isOpen());
// Selecting text: the press starts on the panel and ends on the backdrop. That isn't a click on the backdrop.
{ const r = await p.evaluate(() => { const b = document.querySelector('#drw .dk-drawer__title').getBoundingClientRect(); return { x: b.left + 4, y: b.top + 4 }; });
  await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.mouse.move(20, 20, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(100); }
t('a press that starts on the panel and ends on the backdrop doesn\'t close it', await isOpen() && (await p.evaluate(() => window.asks.join())) === 'false');
await p.mouse.click(20, 20); await p.waitForTimeout(100);
t('a click on the backdrop asks to close', !(await isOpen()) && (await p.evaluate(() => window.asks.join())) === 'false,false');
await p.click('#opener'); await p.waitForTimeout(400);
const x = await p.evaluate(() => document.querySelector('#drw .dk-drawer__close').getAttribute('aria-label'));
await p.click('#drw .dk-drawer__close'); await p.waitForTimeout(100);
t('the × (a button named "Close") asks to close', x === 'Close' && !(await isOpen()), x);
// The browser can close the <dialog> on its own (dialog.close(), a form with method="dialog"): it asks to close
// then too, so open follows and the button opens it again.
await p.evaluate(() => { window.asks = []; });
await p.click('#opener'); await p.waitForTimeout(400);
await p.evaluate(() => document.getElementById('drw').close()); await p.waitForTimeout(100);
const byClose = await p.evaluate(() => window.asks.join());
await p.click('#opener'); await p.waitForTimeout(400);
const again = await isOpen();
await p.evaluate(() => { const f = document.createElement('form'); f.method = 'dialog'; f.id = 'fdrw'; f.innerHTML = '<button id="fsub">OK</button>'; document.querySelector('#drw .dk-drawer__body').prepend(f); });
await p.evaluate(() => document.getElementById('fsub').click()); await p.waitForTimeout(100);
const byForm = await p.evaluate(() => window.asks.join());
await p.evaluate(() => document.getElementById('fdrw').remove());
await p.click('#opener'); await p.waitForTimeout(400);
const again2 = await isOpen();
t('closed by the browser (dialog.close(), form method="dialog"): asks to close, and opens again next time', byClose === 'false' && again && byForm === 'false,false' && again2, JSON.stringify({ byClose, again, byForm, again2 }));
await p.evaluate(() => window.setOpen(false)); await p.waitForTimeout(100);
await reopen(() => window.setBd(false));
await p.mouse.click(20, 20); await p.waitForTimeout(100);
t('closeOnBackdrop={false}: a backdrop click leaves it open', await isOpen());
await reopen(() => { window.setBd(true); window.setSide('left'); window.setSize('sm'); });
const l = await box();
await reopen(() => { window.setSide('right'); window.setSize('lg'); });
const lg = await box();
t('left, sm: 320px against the left edge; lg: 512px', l[0] === 0 && l[2] === 320 && l[3] === 700 && lg[2] === 512 && lg[0] === 488, JSON.stringify([l, lg]));
await reopen(() => window.setSide('bottom'));
const bt = await p.evaluate(() => { const r = document.querySelector('#drw .dk-drawer__panel').getBoundingClientRect(), s = getComputedStyle(document.querySelector('#drw .dk-drawer__panel')); return { l: Math.round(r.left), w: Math.round(r.width), t: Math.round(r.top), b: Math.round(r.bottom), tl: s.borderTopLeftRadius, bl: s.borderBottomLeftRadius }; });
t('bottom: full width against the bottom, at most the screen less 64px, rounded only on top', bt.l === 0 && bt.w === 1000 && bt.b === 700 && bt.t === 64 && bt.tl === '12px' && bt.bl === '0px', JSON.stringify(bt));
await reopen(() => window.setSide('top'));
const tp = await p.evaluate(() => { const r = document.querySelector('#drw .dk-drawer__panel').getBoundingClientRect(), s = getComputedStyle(document.querySelector('#drw .dk-drawer__panel')); return { t: Math.round(r.top), b: Math.round(r.bottom), tl: s.borderTopLeftRadius, bl: s.borderBottomLeftRadius }; });
t('top: against the top, rounded only below', tp.t === 0 && tp.b === 636 && tp.tl === '0px' && tp.bl === '12px', JSON.stringify(tp));
await p.setViewportSize({ width: 300, height: 600 });
await reopen(() => window.setSide('right'));
const nar = await box();
t('on a screen narrower than the drawer it takes the full width', nar[0] === 0 && nar[2] === 300, JSON.stringify(nar));
await p.setViewportSize({ width: 1000, height: 700 });
await reopen(() => {});

const look = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('#drw .dk-drawer__panel')), ti = getComputedStyle(document.querySelector('#drw .dk-drawer__title')); return { pad: s.paddingTop, sh: s.boxShadow, gap: s.rowGap, tfs: ti.fontSize, tfw: ti.fontWeight, anim: s.animationDuration }; });
t('look: 24px padding, shadow-xl, 16px between parts, a text-lg semibold title, slides in over 300ms', look.pad === '24px' && /20px 25px -5px/.test(look.sh) && look.gap === '16px' && look.tfs === '18px' && look.tfw === '600' && look.anim === '0.3s', JSON.stringify(look));
const contrast = await p.evaluate(() => {
  const still = document.createElement('style'); still.textContent = '* { transition: none !important; animation: none !important; }'; document.head.appendChild(still);
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const bg = rgb(getComputedStyle(document.querySelector('#drw .dk-drawer__panel')).backgroundColor);
    for (const sel of ['.dk-drawer__title', '.dk-drawer__description', '.dk-drawer__body p']) { const r = ratio(rgb(getComputedStyle(document.querySelector('#drw ' + sel)).color), bg); n++; if (r < 4.5) low.push(`${th} ${sel}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme'); still.remove();
  return { low, n };
});
t('contrast: title, description and body text keep 4.5:1 on the panel in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
await p.evaluate(() => window.setOpen(false)); await p.waitForTimeout(100);
t('closed again: the page scrolls', await p.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'));
t('--drawer-bg overrides one drawer', await p.evaluate(() => { const d = document.getElementById('tok'); d.showModal(); const c = getComputedStyle(d.querySelector('.dk-drawer__panel')).backgroundColor; d.close(); return c === 'rgb(1, 2, 3)'; }));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Drawer', R) ? 0 : 1);

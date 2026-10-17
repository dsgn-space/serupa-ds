// Tooltip: wiring (describedby, labelledby), hover with a delay, keyboard focus, Escape, hovering the tooltip
// itself, placement and flipping, the top layer, controlled and disabled, contrast in every theme and tokens.
//   node tools/test/tooltip.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:120px 200px;display:flex;flex-wrap:wrap;gap:24px;align-items:center"></div>
<div style="height:200px;overflow:hidden;position:relative;width:200px" id="clip"></div>
<script>
var D = window.Diki, h = React.createElement; window.opens = [];
function App() {
  var c = React.useState(false); window.setCtl = c[1];
  return h(React.Fragment, null,
    h(D.Tooltip, { content: 'Edit the file' }, h(D.IconButton, { id: 'a', icon: 'edit', label: 'Edit', noTitle: true, 'aria-describedby': 'other' })),
    h(D.Tooltip, { content: 'Settings', role: 'label', placement: 'bottom', delay: 0 }, h('button', { id: 'b' }, h(D.Icon, { name: 'settings' }))),
    h(D.Tooltip, { content: 'On the right', placement: 'right-start' }, h('button', { id: 'c' }, 'Right')),
    h(D.Tooltip, { content: 'Controlled', open: c[0], onOpenChange: function (v) { window.opens.push(v); } }, h('button', { id: 'd' }, 'Controlled')),
    h(D.Tooltip, { content: 'Never', disabled: true, delay: 0 }, h('button', { id: 'e' }, 'Disabled')),
    h(D.Tooltip, { content: 'Tokens', delay: 0, style: { '--tooltip-bg': 'rgb(1, 2, 3)' } }, h('button', { id: 'f' }, 'Tokens')),
    h('div', { style: { position: 'fixed', top: '0px', left: '300px' } }, h(D.Tooltip, { content: 'Flipped', delay: 0 }, h('button', { id: 'g' }, 'Top edge'))),
    h('div', { style: { overflow: 'hidden', width: '60px', height: '30px', position: 'relative' } }, h(D.Tooltip, { content: 'Not clipped by overflow hidden', delay: 0 }, h('button', { id: 'h' }, 'Clip'))));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('tooltip.html', APP, { react: true }));
await p.waitForTimeout(300);
const tip = (sel) => p.evaluate((sel) => { const a = document.querySelector(sel), ids = (a.getAttribute('aria-describedby') || a.getAttribute('aria-labelledby') || '').split(' '); const tt = ids.map((i) => document.getElementById(i)).find((x) => x && x.getAttribute('role') === 'tooltip'); if (!tt) return null; const r = tt.getBoundingClientRect(), ar = a.getBoundingClientRect(); return { open: !tt.hidden && getComputedStyle(tt).display !== 'none', text: tt.textContent, side: tt.dataset.side, top: tt.matches(':popover-open'), gapBelow: Math.round(r.top - ar.bottom), gapAbove: Math.round(ar.top - r.bottom), gapRight: Math.round(r.left - ar.right), alignTop: r.top - ar.top, centered: Math.abs((r.left + r.width / 2) - (ar.left + ar.width / 2)) < 1, inView: r.top >= 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, w: r.width }; }, sel);

const w = await p.evaluate(() => { const a = document.getElementById('a'), b = document.getElementById('b'), ta = document.getElementById(a.getAttribute('aria-describedby').split(' ')[1]); return { desc: a.getAttribute('aria-describedby').split(' ')[0], role: ta.getAttribute('role'), comp: ta.dataset.component, lab: !!document.getElementById(b.getAttribute('aria-labelledby')), name: b.getAttribute('aria-describedby') }; });
t('wiring: the tooltip (role tooltip) describes its element, keeping an existing aria-describedby; role="label" names it instead', w.desc === 'other' && w.role === 'tooltip' && w.comp === 'tooltip' && w.lab && w.name === null, JSON.stringify(w));
t('closed at first', !(await tip('#a')).open);
await p.hover('#a'); await p.waitForTimeout(200);
const early = (await tip('#a')).open;
await p.waitForTimeout(350);
const hv = await tip('#a');
t('hover: shows after the 400ms delay, above and centered, 6px away, in the top layer', !early && hv.open && hv.side === 'top' && hv.centered && hv.gapAbove === 6 && hv.top, JSON.stringify(hv));
await p.mouse.move(500, 20); await p.waitForTimeout(80);
const stillOpen = (await tip('#a')).open;
await p.waitForTimeout(150);
t('leaving the element hides it after a short grace', stillOpen && !(await tip('#a')).open);
// hover the tooltip itself (WCAG 1.4.13: hoverable)
await p.hover('#a'); await p.waitForTimeout(500);
const tr = await p.evaluate(() => { const a = document.getElementById('a'); const tt = document.getElementById(a.getAttribute('aria-describedby').split(' ')[1]).getBoundingClientRect(); return [tt.left + tt.width / 2, tt.top + tt.height / 2]; });
await p.mouse.move(tr[0], tr[1] + 8, { steps: 4 }); await p.mouse.move(tr[0], tr[1], { steps: 2 }); await p.waitForTimeout(300);
t('the pointer can move onto the tooltip without it closing (hoverable)', (await tip('#a')).open);
await p.keyboard.press('Escape'); await p.waitForTimeout(50);
t('Escape hides it, even while hovered (dismissible)', !(await tip('#a')).open);
await p.mouse.move(0, 690);
await p.keyboard.press('Tab'); await p.waitForTimeout(50);
const kf = await p.evaluate(() => document.activeElement.id);
t('keyboard focus shows it at once', kf === 'a' && (await tip('#a')).open, kf);
await p.keyboard.press('Tab'); await p.waitForTimeout(50);
const bt = await tip('#b');
t('moving focus on hides the first; placement bottom puts it 6px below', !(await tip('#a')).open && bt.open && bt.side === 'bottom' && bt.gapBelow === 6, JSON.stringify(bt));
await p.keyboard.press('Tab'); await p.waitForTimeout(50);
const ct = await tip('#c');
t('placement right-start: to the right, aligned with the top', ct.open && ct.side === 'right' && ct.gapRight === 6 && Math.abs(ct.alignTop) <= 0.5, JSON.stringify(ct));   // place() rounds to whole pixels, so an anchor on a half pixel (Firefox and WebKit size the native button that way) is off by 0.5
await p.click('#c'); await p.waitForTimeout(50);
t('pressing the element hides it', !(await tip('#c')).open);
await p.hover('#d'); await p.waitForTimeout(500);
const c1 = (await tip('#d')).open, asked = await p.evaluate(() => window.opens.join());
await p.evaluate(() => window.setCtl(true)); await p.waitForTimeout(50);
t('controlled: hovering only asks (onOpenChange(true)); open decides', !c1 && asked === 'true' && (await tip('#d')).open, asked);
await p.evaluate(() => window.setCtl(false));
await p.hover('#e'); await p.waitForTimeout(100);
t('disabled: never shows', !(await tip('#e')).open);
await p.hover('#g'); await p.waitForTimeout(100);
const gt = await tip('#g');
t('no room above: it flips below and stays on screen', gt.open && gt.side === 'bottom' && gt.inView, JSON.stringify(gt));
await p.hover('#h'); await p.waitForTimeout(100);
const hh = await p.evaluate(() => { const a = document.getElementById('h'); const tt = document.getElementById(a.getAttribute('aria-describedby')); const r = tt.getBoundingClientRect(); return document.elementFromPoint(r.left + 4, r.top + r.height / 2) === tt || tt.contains(document.elementFromPoint(r.left + 4, r.top + r.height / 2)); });
t('an overflow: hidden parent can\'t clip it', hh);
await p.hover('#f'); await p.waitForTimeout(100);
const st = await p.evaluate(() => { const tt = document.getElementById(document.getElementById('f').getAttribute('aria-describedby')); const s = getComputedStyle(tt); return { bg: s.backgroundColor, fs: s.fontSize, r: s.borderTopLeftRadius, p: s.padding, mw: s.maxWidth }; });
t('look: text-xs, 6px corners, 4px 8px padding, 240px at most; --tooltip-bg overrides one', st.bg === 'rgb(1, 2, 3)' && st.fs === '12px' && st.r === '6px' && st.p === '4px 8px' && st.mw === '240px', JSON.stringify(st));

await p.hover('#b'); await p.waitForTimeout(100);
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const tt = document.getElementById(document.getElementById('b').getAttribute('aria-labelledby'));
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const s = getComputedStyle(tt); const r = ratio(rgb(s.color), rgb(s.backgroundColor)); n++;
    if (r < 4.5) low.push(`${th}: ${r.toFixed(2)}`);
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the text keeps 4.5:1 on the tooltip in all six themes', contrast.low.length === 0 && contrast.n === 6, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Tooltip', R) ? 0 : 1);

// Popover: trigger ARIA, role="dialog" named by its title, placement next to the trigger (and flipping), focus
// moving in and back, Escape, outside clicks, focus leaving, close() for buttons inside, controlled use,
// initialFocus, contrast in every theme and component tokens.
//   node tools/test/popover.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:40px"></div>
<script>
var D = window.Diki, h = React.createElement, P = D.Popover;
window.changes = [];
function Controlled() {
  var s = React.useState(false);
  return h(P, { open: s[0], onOpenChange: function (v) { window.changes.push(v); s[1](v); }, 'aria-label': 'Controlled', trigger: h(D.Button, { id: 'tctl' }, 'Ctl') }, h('p', null, 'c'));
}
function App() {
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' } },
    h(P, { title: 'Share', className: 'extra', style: { marginTop: '0px' }, trigger: h(D.Button, { id: 'tshare', variant: 'outline' }, 'Share') },
      function (close) { return h('div', null, h('input', { id: 'email', 'aria-label': 'Email' }), h('a', { href: '#x', id: 'plink' }, 'Settings'), h(D.Button, { id: 'done', onClick: close }, 'Done')); }),
    h(P, { 'aria-label': 'Info', placement: 'right-start', initialFocus: 'panel', trigger: h(D.Button, { id: 'tinfo' }, 'Info') }, h('p', { id: 'ptext' }, 'Plain text, nothing to focus.')),
    h(Controlled),
    h('button', { id: 'other' }, 'Other'),
    h('div', { style: { position: 'fixed', bottom: '8px', left: '40px' } }, h(P, { title: 'Low', trigger: h(D.Button, { id: 'tlow' }, 'Low') }, h('p', null, 'Flips up.'))),
    h(P, { title: 'Tok', style: { '--popover-width': '300px', '--popover-padding': '7px' }, trigger: h(D.Button, { id: 'ttok' }, 'Tok') }, h('p', null, 't')));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 900, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('popover.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const panelOf = (tid) => `#${tid} + .dk-popover`;
const isOpen = (tid) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.matches(':popover-open') && !e.hidden; }, panelOf(tid));
const active = () => p.evaluate(() => document.activeElement.id || document.activeElement.className);

const t0 = await p.evaluate(() => { const b = document.getElementById('tshare'), pn = b.nextElementSibling; return { hp: b.getAttribute('aria-haspopup'), exp: b.getAttribute('aria-expanded'), ctl: b.getAttribute('aria-controls'), role: pn.getAttribute('role'), hidden: pn.hidden, kids: pn.children.length }; });
t('closed: the trigger has aria-haspopup="dialog" and aria-expanded="false"; the panel is hidden and empty', t0.hp === 'dialog' && t0.exp === 'false' && t0.ctl === null && t0.role === 'dialog' && t0.hidden && t0.kids === 0, JSON.stringify(t0));
await p.click('#tshare'); await p.waitForTimeout(100);
const o = await p.evaluate(() => { const b = document.getElementById('tshare'), pn = b.nextElementSibling, br = b.getBoundingClientRect(), r = pn.getBoundingClientRect(), s = getComputedStyle(pn), ti = pn.querySelector('.dk-popover__title'); return { exp: b.getAttribute('aria-expanded'), ctl: b.getAttribute('aria-controls') === pn.id, lab: pn.getAttribute('aria-labelledby') === ti.id, title: ti.textContent, cls: pn.className, comp: pn.dataset.component, gap: Math.round(r.top - br.bottom), center: Math.round((r.left + r.right) / 2 - (br.left + br.right) / 2), w: r.width, pad: s.paddingTop, rad: s.borderTopLeftRadius, side: pn.dataset.side, tfw: getComputedStyle(ti).fontWeight }; });
t('opening: aria-expanded, aria-controls; a dialog named by its title in the top layer', (await isOpen('tshare')) && o.exp === 'true' && o.ctl && o.lab && o.title === 'Share' && o.cls === 'dk-popover extra' && o.comp === 'popover' && o.tfw === '600', JSON.stringify(o));
t('placement bottom (default): centered under the trigger, 8px away; 256px wide, 16px padding, 8px corners', o.side === 'bottom' && o.gap === 8 && Math.abs(o.center) <= 1 && o.w === 256 && o.pad === '16px' && o.rad === '8px', JSON.stringify(o));
t('focus moves to the first control inside', (await active()) === 'email');
await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
t('Tab moves through the content', (await active()) === 'done');
await p.keyboard.press('Escape'); await p.waitForTimeout(50);
t('Escape closes it and returns focus to the trigger', !(await isOpen('tshare')) && (await active()) === 'tshare' && (await p.evaluate(() => document.getElementById('tshare').getAttribute('aria-expanded'))) === 'false');
await p.keyboard.press('Enter'); await p.waitForTimeout(50);
await p.click('#done'); await p.waitForTimeout(50);
t('Enter on the trigger opens it; a close() button inside closes it and returns focus', !(await isOpen('tshare')) && (await active()) === 'tshare');
await p.click('#tshare'); await p.waitForTimeout(50);
await p.click('#tshare'); await p.waitForTimeout(50);
t('clicking the trigger again closes it', !(await isOpen('tshare')));
await p.click('#tshare'); await p.waitForTimeout(50);
await p.mouse.click(800, 650); await p.waitForTimeout(50);
t('a click outside closes it', !(await isOpen('tshare')));
await p.click('#tshare'); await p.waitForTimeout(50);
await p.focus('#plink'); await p.focus('#other'); await p.waitForTimeout(50);
t('focus moving elsewhere closes it', !(await isOpen('tshare')) && (await active()) === 'other');
await p.click('#tinfo'); await p.waitForTimeout(100);
const inf = await p.evaluate(() => { const b = document.getElementById('tinfo'), pn = b.nextElementSibling, br = b.getBoundingClientRect(), r = pn.getBoundingClientRect(); return { label: pn.getAttribute('aria-label'), side: pn.dataset.side, gap: Math.round(r.left - br.right), top: Math.round(r.top - br.top), focus: document.activeElement === pn }; });
t('aria-label names it without a title; right-start sits to the right, tops lined up; initialFocus="panel" focuses the panel', inf.label === 'Info' && inf.side === 'right' && inf.gap === 8 && inf.top === 0 && inf.focus, JSON.stringify(inf));
await p.keyboard.press('Escape');
await p.click('#tctl'); await p.waitForTimeout(50);
const c1 = [await isOpen('tctl'), await p.evaluate(() => window.changes.join())].join();
await p.keyboard.press('Escape'); await p.waitForTimeout(50);
t('controlled: onOpenChange gets each change, the parent sets it', c1 === 'true,true' && (await p.evaluate(() => window.changes.join())) === 'true,false' && !(await isOpen('tctl')), c1);
await p.click('#tlow'); await p.waitForTimeout(100);
const lo = await p.evaluate(() => { const b = document.getElementById('tlow'), pn = b.nextElementSibling; return [pn.dataset.side, pn.getBoundingClientRect().bottom <= b.getBoundingClientRect().top].join(); });
t('it flips to the top when there\'s no room below', lo === 'top,true', lo);
await p.keyboard.press('Escape');
await p.click('#ttok'); await p.waitForTimeout(100);
const tk = await p.evaluate(() => { const pn = document.getElementById('ttok').nextElementSibling; return [pn.getBoundingClientRect().width, getComputedStyle(pn).paddingTop].join(); });
t('Popover tokens (--popover-width, --popover-padding) override one popover', tk === '300,7px', tk);
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const pn = document.getElementById('ttok').nextElementSibling, s = getComputedStyle(pn), bg = rgb(s.backgroundColor);
    for (const [name, fg] of [['text', rgb(s.color)], ['title', rgb(getComputedStyle(pn.querySelector('.dk-popover__title')).color)]]) {
      const r = ratio(fg, bg); n++;
      if (r < 4.5) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: text and title keep 4.5:1 on the panel in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Popover', R) ? 0 : 1);

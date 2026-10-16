// Menu: the menu button wiring, opening from the mouse and the keys, moving (arrows, Home/End, letters), choosing,
// Escape and Tab, clicking outside, disabled and link items, groups, placement, contrast in every theme and tokens.
//   node tools/test/menu.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:40px;display:flex;gap:24px;align-items:flex-start"></div>
<script>
var D = window.Diki, h = React.createElement; window.chosen = []; window.opens = [];
function App() {
  var c = React.useState(false); window.setCtl = c[1];
  var pick = function (k) { return function () { window.chosen.push(k); }; };
  return h(React.Fragment, null,
    h(D.Menu, { trigger: h(D.Button, { id: 'mb', variant: 'secondary', rightIcon: 'expand_more' }, 'Actions') },
      h(D.MenuItem, { icon: 'edit', shortcut: '⌘E', onSelect: pick('edit') }, 'Edit'),
      h(D.MenuItem, { icon: 'content_copy', onSelect: pick('dup') }, 'Duplicate'),
      h(D.MenuItem, { disabled: true, onSelect: pick('arch') }, 'Archive'),
      h(D.MenuItem, { href: '#share', id: 'lnk', onSelect: pick('share') }, 'Share link'),
      h(D.MenuSeparator),
      h(D.MenuGroup, { label: 'Danger zone' }, h(D.MenuItem, { icon: 'delete', destructive: true, onSelect: pick('del') }, 'Delete'))),
    h(D.Menu, { trigger: h(D.IconButton, { id: 'ib', icon: 'more_vert', label: 'More' }), placement: 'bottom-end', 'aria-label': 'Row actions' },
      h(D.MenuItem, { onSelect: function (e) { e.preventDefault(); window.chosen.push('stay'); } }, 'Stay open'), h(D.MenuItem, null, 'Two')),
    h(D.Menu, { trigger: h('button', { id: 'cb' }, 'Controlled'), open: c[0], onOpenChange: function (v) { window.opens.push(v); }, style: { '--menu-bg': 'rgb(1, 2, 3)' } }, h(D.MenuItem, null, 'One')),
    h('button', { id: 'after' }, 'After'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 900, height: 600 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('menu.html', APP, { react: true }));
await p.waitForTimeout(300);
const menuOf = (btn) => `[role="menu"][aria-labelledby="${btn}"]`;
const st = () => p.evaluate(() => { const m = [...document.querySelectorAll('[role="menu"]')].find((x) => !x.hidden); const a = document.activeElement; return { open: !!m, focus: a.getAttribute('role') === 'menuitem' ? a.querySelector('.dk-menu__label').textContent : a.id, chosen: window.chosen.join() }; });

const w = await p.evaluate(() => { const b = document.getElementById('mb'), m = document.querySelector('[role="menu"]'); return { pop: b.getAttribute('aria-haspopup'), exp: b.getAttribute('aria-expanded'), ctl: b.getAttribute('aria-controls'), lab: m.getAttribute('aria-labelledby'), hidden: m.hidden, kids: m.children.length }; });
t('closed: the button has aria-haspopup="menu" and aria-expanded="false"; the menu is empty and hidden', w.pop === 'menu' && w.exp === 'false' && w.ctl === null && w.lab === 'mb' && w.hidden && w.kids === 0, JSON.stringify(w));
await p.click('#mb'); await p.waitForTimeout(300);
const o = await p.evaluate(() => { const b = document.getElementById('mb'), m = document.getElementById(b.getAttribute('aria-controls')); const r = m.getBoundingClientRect(), br = b.getBoundingClientRect(); return { exp: b.getAttribute('aria-expanded'), role: m && m.getAttribute('role'), top: m.matches(':popover-open'), gap: Math.round(r.top - br.bottom), left: Math.round(r.left - br.left), w: r.width, items: [...m.querySelectorAll('[role="menuitem"]')].map((x) => x.tabIndex).join(), group: m.querySelector('[role="group"]').getAttribute('aria-labelledby') && document.getElementById(m.querySelector('[role="group"]').getAttribute('aria-labelledby')).textContent, sep: !!m.querySelector('[role="separator"]'), dis: m.querySelectorAll('[aria-disabled="true"]').length, kbd: m.querySelector('kbd').textContent }; });
t('click opens it under the button (start-aligned, 4px away, at least 192px, top layer) on the first item; items have tabindex -1; groups are named', o.exp === 'true' && o.role === 'menu' && o.top && o.gap === 4 && o.left === 0 && o.w >= 192 && o.items === '-1,-1,-1,-1,-1' && o.group === 'Danger zone' && o.sep && o.dis === 1 && o.kbd === '⌘E' && (await st()).focus === 'Edit', JSON.stringify(o));
await p.keyboard.press('ArrowDown'); const k1 = (await st()).focus;
await p.keyboard.press('ArrowDown'); const k2 = (await st()).focus;
await p.keyboard.press('End'); const k3 = (await st()).focus;
await p.keyboard.press('ArrowDown'); const k4 = (await st()).focus;
await p.keyboard.press('ArrowUp'); const k5 = (await st()).focus;
await p.keyboard.press('Home'); const k6 = (await st()).focus;
await p.keyboard.press('s'); const k7 = (await st()).focus;
await p.keyboard.press('d'); const k8 = (await st()).focus;
await p.keyboard.press('d'); const k9 = (await st()).focus;
t('keys: ↓ ↑ move and wrap, disabled items are still reachable, Home and End jump, a letter goes to the next item starting with it', [k1, k2, k3, k4, k5, k6, k7, k8, k9].join() === 'Duplicate,Archive,Delete,Edit,Delete,Edit,Share link,Delete,Duplicate', [k1, k2, k3, k4, k5, k6, k7, k8, k9].join());
await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(50);
t('Enter on a disabled item does nothing', (await st()).open && (await st()).chosen === '');
await p.keyboard.press('ArrowUp'); await p.keyboard.press('Enter'); await p.waitForTimeout(50);
const ch = await st();
t('Enter chooses: onSelect runs, the menu closes and focus goes back to the button', !ch.open && ch.chosen === 'dup' && ch.focus === 'mb' && await p.evaluate(() => document.getElementById('mb').getAttribute('aria-expanded') === 'false'), JSON.stringify(ch));
await p.keyboard.press('ArrowUp'); await p.waitForTimeout(50);
const up = await st();
await p.keyboard.press('Escape'); await p.waitForTimeout(50);
const esc = await st();
t('↑ on the button opens it on the last item; Escape closes it and focus goes back to the button', up.open && up.focus === 'Delete' && !esc.open && esc.focus === 'mb', JSON.stringify([up, esc]));
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(50);
await p.keyboard.press(' '); await p.waitForTimeout(50);
t('↓ opens it on the first item; Space chooses', (await st()).chosen === 'dup,edit' && !(await st()).open);
await p.keyboard.press('Enter'); await p.waitForTimeout(50);
await p.keyboard.press('Tab'); await p.waitForTimeout(50);
t('Enter on the button opens it; Tab closes it and moves on', !(await st()).open && (await st()).focus !== 'mb');
await p.click('#mb'); await p.waitForTimeout(50);
await p.hover('[role="menu"] [role="menuitem"]:nth-child(2)'); await p.waitForTimeout(50);
const hov = (await st()).focus;
await p.mouse.click(800, 500); await p.waitForTimeout(50);
t('hover highlights (focuses) an item; a click outside closes it', hov === 'Duplicate' && !(await st()).open, hov);
await p.click('#mb'); await p.waitForTimeout(50);
await p.click('#lnk'); await p.waitForTimeout(50);
t('a link item is an <a> with href; following it runs onSelect and closes the menu', (await st()).chosen.endsWith('share') && !(await st()).open && await p.evaluate(() => location.hash === '#share'));
await p.click('#ib'); await p.waitForTimeout(100);
const ib = await p.evaluate(() => { const b = document.getElementById('ib'), m = document.getElementById(b.getAttribute('aria-controls')); const r = m.getBoundingClientRect(), br = b.getBoundingClientRect(); return { label: m.getAttribute('aria-label'), lab: m.getAttribute('aria-labelledby'), end: br.right - r.right }; });
await p.keyboard.press('Enter'); await p.waitForTimeout(50);
t('aria-label names the menu; bottom-end lines up the ends; onSelect with preventDefault keeps it open', ib.label === 'Row actions' && ib.lab === null && Math.abs(ib.end) <= 1 && (await st()).open && (await st()).chosen.endsWith('stay'), JSON.stringify(ib));
await p.keyboard.press('Escape');
await p.click('#cb'); await p.waitForTimeout(50);
const c1 = (await st()).open;
await p.evaluate(() => window.setCtl(true)); await p.waitForTimeout(100);
const c2 = await p.evaluate(() => getComputedStyle(document.getElementById(document.getElementById('cb').getAttribute('aria-controls'))).backgroundColor);
t('controlled: a click only asks; open decides; --menu-bg overrides one menu', !c1 && (await p.evaluate(() => window.opens.join())) === 'true' && c2 === 'rgb(1, 2, 3)', c2);
await p.evaluate(() => window.setCtl(false)); await p.waitForTimeout(50);

await p.click('#mb'); await p.waitForTimeout(300);
const look = await p.evaluate(() => { const m = document.querySelector('[role="menu"]:not([hidden])'), it = m.querySelector('[role="menuitem"]'), s = getComputedStyle(m), i = getComputedStyle(it); return { pad: s.paddingTop, r: s.borderTopLeftRadius, sh: s.boxShadow, h: it.getBoundingClientRect().height, fs: i.fontSize, ir: i.borderTopLeftRadius, icon: getComputedStyle(it.querySelector('.dk-icon')).fontSize }; });
t('look: 4px padding, 8px corners, shadow-lg; 32px items, text-sm, 6px corners, 16px icons', look.pad === '4px' && look.r === '8px' && /10px 15px -3px/.test(look.sh) && look.h === 32 && look.fs === '14px' && look.ir === '6px' && look.icon === '16px', JSON.stringify(look));
const contrast = await p.evaluate(() => {
  const still = document.createElement('style'); still.textContent = '* { transition: none !important; animation: none !important; }'; document.head.appendChild(still);
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const m = document.querySelector('[role="menu"]:not([hidden])'), items = m.querySelectorAll('[role="menuitem"]'), first = items[0], del = items[items.length - 1], second = items[1];
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const bg = rgb(getComputedStyle(m).backgroundColor);
    const checks = [];
    second.focus();
    checks.push(['label', rgb(getComputedStyle(first).color), bg, 4.5], ['shortcut', rgb(getComputedStyle(first.querySelector('kbd')).color), bg, 4.5], ['group label', rgb(getComputedStyle(m.querySelector('.dk-menu__group-label')).color), bg, 4.5], ['delete', rgb(getComputedStyle(del).color), bg, 4.5]);
    first.focus();
    checks.push(['highlighted label', rgb(getComputedStyle(first).color), rgb(getComputedStyle(first).backgroundColor), 4.5], ['highlighted shortcut', rgb(getComputedStyle(first.querySelector('kbd')).color), rgb(getComputedStyle(first).backgroundColor), 4.5], ['highlighted icon', rgb(getComputedStyle(first.querySelector('.dk-menu__icon')).color), rgb(getComputedStyle(first).backgroundColor), 3]);
    del.focus();
    checks.push(['highlighted delete', rgb(getComputedStyle(del).color), rgb(getComputedStyle(del).backgroundColor), 4.5]);
    for (const [k, a, c, min] of checks) { const r = ratio(a, c); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme'); still.remove();
  return { low, n };
});
t('contrast: labels, shortcuts and group labels 4.5:1 (also highlighted), icons 3:1, in all six themes', contrast.low.length === 0 && contrast.n === 48, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Menu', R) ? 0 : 1);

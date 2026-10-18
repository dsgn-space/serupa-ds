// Sidebar: nav landmark, header and footer, sections, items (icon, label, badge, current page), nested groups,
// router links, the collapsed icon rail (tooltips as names, groups as menus), contrast in every theme, tokens.
//   node tools/test/sidebar.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { margin: 0; }</style><div id="root"></div>
<script>
var D = window.Serupa, h = React.createElement, S = D.SidebarSection, I = D.SidebarItem;
var RouterLink = React.forwardRef(function (p, ref) { return h('a', Object.assign({}, p, { ref: ref, href: '#router' + p.to, 'data-router': '' })); });
function items() {
  return [
    h(S, { key: 'a' },
      h(I, { href: '#home', icon: 'home', label: 'Home', active: true, id: 'ihome', ref: window.ir = React.createRef() }),
      h(I, { href: '#inbox', icon: 'inbox', label: 'Inbox', badge: h(D.Badge, { count: 4 }), id: 'iinbox' })),
    h(S, { key: 'b', title: 'Workspace' },
      h(I, { icon: 'folder', label: 'Projects', id: 'gproj' },
        h(I, { href: '#web', label: 'Website', id: 'iweb' }),
        h(I, { href: '#app', label: 'Mobile app', active: false })),
      h(I, { icon: 'group', label: 'Team', id: 'gteam', defaultOpen: false },
        h(I, { href: '#members', label: 'Members', active: true, id: 'imembers' })),
      h(I, { as: RouterLink, to: '/reports', icon: 'bar_chart', label: 'Reports', id: 'irep' }))];
}
function App() {
  var s = React.useState(false);
  window.setCollapsed = s[1];
  return h('div', { style: { display: 'flex', height: '600px' } },
    h(D.Sidebar, { id: 'sb', ref: window.sr = React.createRef(), className: 'extra', 'data-x': 'y', collapsed: s[0],
      header: h('strong', { id: 'hdr' }, 'Acme'), footer: h('span', { id: 'ftr' }, 'Ada') }, items()),
    h(D.Sidebar, { id: 'sloose', 'aria-label': 'Docs' }, h(I, { href: '#x', label: 'Loose', icon: 'star' }), h(I, { href: '#y', label: 'Item' })),
    h(D.Sidebar, { id: 'stok', style: { '--sidebar-width': '200px', '--sidebar-item-text': 'rgb(1, 2, 3)' } }, h(I, { href: '#t', label: 'T' })));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('sidebar.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const box = (sel) => p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) }; }, sel);

const sd = await p.evaluate(() => { const n = document.getElementById('sb'); return { tag: n.tagName, label: n.getAttribute('aria-label'), cls: n.className, comp: n.dataset.component, ref: window.sr.current === n, x: n.dataset.x, iref: window.ir.current && window.ir.current.id, be: getComputedStyle(n).borderRightWidth }; });
const sb = await box('#sb');
t('Sidebar: a <nav aria-label="Main">, 256px wide, the parent\'s height, a 1px inner edge; refs and props reach it', sd.tag === 'NAV' && sd.label === 'Main' && sd.cls === 'dk-sidebar extra' && sd.comp === 'sidebar' && sd.ref && sd.x === 'y' && sd.iref === 'ihome' && sb.w === 256 && sb.h === 600 && sd.be === '1px', JSON.stringify([sd, sb]));
const ft = await box('#ftr'), hd = await box('#hdr');
t('header at the top, footer pinned to the bottom', hd.y < 30 && ft.b > 560, JSON.stringify([hd, ft]));
const it = await p.evaluate(() => { const a = document.getElementById('ihome'), s = getComputedStyle(a); return { tag: a.tagName, li: a.parentElement.tagName, cur: a.getAttribute('aria-current'), icon: a.querySelector('.dk-icon').textContent, isz: getComputedStyle(a.querySelector('.dk-icon')).fontSize, fs: s.fontSize, fw: s.fontWeight, pad: s.paddingTop + ' ' + s.paddingLeft }; });
t('items: links in list items, a 20px icon, text-sm font-medium, 8px by 12px padding; the current page has aria-current="page"', it.tag === 'A' && it.li === 'LI' && it.cur === 'page' && it.icon === 'home' && it.isz === '20px' && it.fs === '14px' && it.fw === '500' && it.pad === '8px 12px', JSON.stringify(it));
const cs = await st('#iinbox', ['color', 'backgroundColor']), ca = await st('#ihome', ['color', 'backgroundColor']);
await p.hover('#iinbox'); const ch = await st('#iinbox', ['color', 'backgroundColor']); await p.mouse.move(900, 600);
t('muted items, shaded and text-colored on hover; the current page the same', cs.backgroundColor === 'rgba(0, 0, 0, 0)' && ca.color !== cs.color && ch.color === ca.color && ch.backgroundColor === ca.backgroundColor, JSON.stringify([cs, ca, ch]));
const badge = await p.evaluate(() => { const b = document.querySelector('#iinbox .dk-sidebar__badge'), a = document.getElementById('iinbox').getBoundingClientRect(); return b && [b.textContent, Math.round(a.right - b.getBoundingClientRect().right)].join(); });
t('a badge sits at the end', badge === '4,12', badge);
const sec = await p.evaluate(() => { const s = document.querySelectorAll('#sb .dk-sidebar__section')[1], ti = s.querySelector('.dk-sidebar__section-title'), ul = s.querySelector('ul'); return { text: ti.textContent, fs: getComputedStyle(ti).fontSize, lab: ul.getAttribute('aria-labelledby') === ti.id }; });
t('a section title: muted text-xs, naming its list', sec.text === 'Workspace' && sec.fs === '12px' && sec.lab, JSON.stringify(sec));
const g0 = await p.evaluate(() => { const b = document.getElementById('gproj'), l = document.getElementById(b.getAttribute('aria-controls')); return { tag: b.tagName, exp: b.getAttribute('aria-expanded'), hidden: l.hidden }; });
t('a group is a button (aria-expanded, aria-controls), closed when no child is active', g0.tag === 'BUTTON' && g0.exp === 'false' && g0.hidden, JSON.stringify(g0));
await p.click('#gproj');
const g1 = await p.evaluate(() => { const b = document.getElementById('gproj'), w = document.getElementById('iweb'); return { exp: b.getAttribute('aria-expanded'), vis: w.getBoundingClientRect().height > 0, rot: getComputedStyle(b.querySelector('.dk-sidebar__chevron')).rotate }; });
const lab = await p.evaluate(() => Math.round(document.querySelector('#gproj .dk-sidebar__label').getBoundingClientRect().left - document.querySelector('#iweb .dk-sidebar__label').getBoundingClientRect().left));
t('pressing it shows the nested items, lined up with its label; the chevron turns', g1.exp === 'true' && g1.vis && g1.rot === '180deg' && lab === 0, JSON.stringify([g1, lab]));
const gt = await p.evaluate(() => { const b = document.getElementById('gteam'); return [b.getAttribute('aria-expanded'), b.classList.contains('dk-sidebar__item--active')].join(); });
t('defaultOpen={false} keeps a group with the active page closed; the group is still text-colored', gt === 'false,true', gt);
const rr = await p.evaluate(() => { const a = document.getElementById('irep'); return [a.hasAttribute('data-router'), a.getAttribute('href')].join(); });
t('as: renders a router link', rr === 'true,#router/reports', rr);
await p.focus('#ihome'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
const kf = await p.evaluate(() => [document.activeElement.id, getComputedStyle(document.activeElement).outlineStyle].join());
t('keyboard: Tab moves through items and groups, with a focus ring', kf === 'gproj,solid', kf);
const lo = await p.evaluate(() => { const n = document.getElementById('sloose'); return [n.getAttribute('aria-label'), n.querySelectorAll('ul > li').length, n.querySelector('.dk-sidebar__body > ul') !== null].join(); });
t('items placed directly in the Sidebar get a list; aria-label names it', lo === 'Docs,2,true', lo);
const tk = await p.evaluate(() => { const n = document.getElementById('stok'); return [Math.round(n.getBoundingClientRect().width), getComputedStyle(n.querySelector('a')).color].join(); });
t('Sidebar tokens (--sidebar-width, --sidebar-item-text) override one sidebar', tk === '200,rgb(1, 2, 3)', tk);

// collapsed
await p.evaluate(() => window.setCollapsed(true)); await p.waitForTimeout(100);
const c = await p.evaluate(() => { const n = document.getElementById('sb'), a = document.getElementById('ihome'), l = a.querySelector('.dk-sidebar__label'), r = a.getBoundingClientRect(), i = a.querySelector('.dk-icon').getBoundingClientRect(); return { w: Math.round(n.getBoundingClientRect().width), lw: l.getBoundingClientRect().width, center: Math.round((i.left + i.right) / 2 - (r.left + r.right) / 2), badge: !!document.querySelector('#iinbox .dk-sidebar__badge'), title: document.querySelector('#sb .dk-sidebar__section-title').getBoundingClientRect().width }; });
t('collapsed: a 64px rail of centered icons; labels and section titles hidden on screen; no badges', c.w === 64 && c.lw <= 1 && Math.abs(c.center) <= 1 && !c.badge && c.title <= 1, JSON.stringify(c));
await p.focus('#ihome'); await p.waitForTimeout(100);
const tip = await p.evaluate(() => { const a = document.getElementById('ihome'), id = a.getAttribute('aria-labelledby'), tp = id && document.getElementById(id); return { text: tp && tp.textContent, vis: tp && tp.matches(':popover-open'), left: tp && Math.round(tp.getBoundingClientRect().left - a.getBoundingClientRect().right) }; });
t('collapsed: focus shows the label as a tooltip to the right, and the tooltip names the link', tip.text === 'Home' && tip.vis && tip.left > 0, JSON.stringify(tip));
await p.click('#sb .dk-sidebar__section:nth-child(2) li:first-child button');
await p.waitForTimeout(200);
const menu = await p.evaluate(() => { const m = [...document.querySelectorAll('[role="menu"]')].find((x) => x.matches(':popover-open')); return m && [...m.querySelectorAll('[role="menuitem"]')].map((i) => [i.tagName, i.getAttribute('href'), i.textContent].join(':')).join(' | '); });
t('collapsed: a group opens its items in a menu', menu === 'A:#web:Website | A:#app:Mobile app', menu);
await p.keyboard.press('Escape');
await p.evaluate(() => window.setCollapsed(false)); await p.waitForTimeout(100);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const bg = rgb(getComputedStyle(document.getElementById('sb')).backgroundColor), cur = document.getElementById('ihome');
    for (const [name, fg, b2] of [['item', rgb(getComputedStyle(document.getElementById('iinbox')).color), bg], ['current page and hovered items', rgb(getComputedStyle(cur).color), rgb(getComputedStyle(cur).backgroundColor)], ['section title', rgb(getComputedStyle(document.querySelector('#sb .dk-sidebar__section-title')).color), bg]]) {
      const r = ratio(fg, b2); n++;
      if (r < 4.5) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: items, the current page and hovered items, and section titles keep 4.5:1 in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Sidebar', R) ? 0 : 1);

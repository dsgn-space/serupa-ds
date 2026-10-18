// Breadcrumb: nav landmark, ordered list, current page, separators (chevron, slash, mirrored in RTL), icons,
// router links, collapsing with maxItems and focus after expanding, contrast in every theme, component tokens.
//   node tools/test/breadcrumb.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;max-width:640px"></div>
<script>
var D = window.Serupa, h = React.createElement, B = D.Breadcrumb, I = D.BreadcrumbItem;
var RouterLink = React.forwardRef(function (p, ref) { return h('a', Object.assign({}, p, { ref: ref, href: '#router' + p.to, 'data-router': '' })); });
function App() {
  return h('div', null,
    h(B, { id: 'bdef', ref: window.br = React.createRef(), className: 'extra', 'data-x': 'y' },
      h(I, { href: '#home', icon: 'home' }, 'Home'), h(I, { href: '#projects' }, 'Projects'), h(I, { href: '#ignored' }, 'Website')),
    h(B, { id: 'bslash', separator: 'slash', 'aria-label': 'You are here' }, h(I, { href: '#a' }, 'A'), h(I, { as: RouterLink, to: '/b' }, 'B'), h(I, null, 'C')),
    h(B, { id: 'bmax', maxItems: 3, expandLabel: 'Show all' }, ['Home', 'Org', 'Team', 'Projects', 'Website', 'Settings'].map(function (l) { return h(I, { key: l, href: '#' + l }, l); })),
    h(B, { id: 'bbad', separator: 'arrow', maxItems: 1 }, h(I, { href: '#a' }, 'A'), h(I, { href: '#b' }, 'B'), h(I, { href: '#c' }, 'C')),
    h('div', { dir: 'rtl' }, h(B, { id: 'brtl' }, h(I, { href: '#a' }, 'A'), h(I, null, 'B'))),
    h(B, { id: 'btok', style: { '--breadcrumb-text': 'rgb(1, 2, 3)', '--breadcrumb-gap': '11px' } }, h(I, { href: '#a' }, 'A'), h(I, null, 'B')));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('breadcrumb.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const items = (sel) => p.evaluate((s) => [...document.querySelectorAll(s + ' li')].map((li) => li.classList.contains('dk-breadcrumb__separator') ? '>' : li.textContent), sel);

const bd = await p.evaluate(() => { const n = document.getElementById('bdef'), ol = n.firstElementChild; return { tag: n.tagName, label: n.getAttribute('aria-label'), cls: n.className, comp: n.dataset.component, ref: window.br.current === n, x: n.dataset.x, ol: ol.tagName, lis: ol.children.length }; });
t('Breadcrumb: a <nav aria-label="Breadcrumb"> holding an <ol>; ref, className and props reach the nav', bd.tag === 'NAV' && bd.label === 'Breadcrumb' && bd.cls === 'dk-breadcrumb extra' && bd.comp === 'breadcrumb' && bd.ref && bd.x === 'y' && bd.ol === 'OL' && bd.lis === 5, JSON.stringify(bd));
const cur = await p.evaluate(() => { const l = [...document.querySelectorAll('#bdef .dk-breadcrumb__item')]; return l.map((e) => [e.tagName, e.getAttribute('href'), e.getAttribute('aria-current')].join(' ')); });
t('items are links; the last is the current page: text with aria-current="page" and no href', cur.join('|') === 'A #home |A #projects |SPAN  page', cur.join('|'));
const sp = await p.evaluate(() => { const s = document.querySelector('#bdef .dk-breadcrumb__separator'), vis = [...s.querySelectorAll('.dk-icon')].filter((i) => getComputedStyle(i).display !== 'none'); return { hidden: s.getAttribute('aria-hidden'), icon: vis.map((i) => i.dataset.icon).join(), size: getComputedStyle(vis[0]).fontSize }; });
t('separators: a 16px chevron_right, hidden from screen readers', sp.hidden === 'true' && sp.icon === 'chevron_right' && sp.size === '16px', JSON.stringify(sp));
const ic = await p.evaluate(() => { const i = document.querySelector('#bdef .dk-breadcrumb__icon .dk-icon'); return i && [i.dataset.icon, getComputedStyle(i).fontSize].join(); });
t('an item can have a 16px icon', ic === 'home,16px', ic);
const muted = await p.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--text-muted)'; document.body.appendChild(d); const m = getComputedStyle(d).color; d.style.color = 'var(--text)'; const x = getComputedStyle(d).color; d.remove(); return [m, x]; });
const s0 = await st('#bdef a', ['color', 'textDecorationLine', 'fontSize']);
await p.hover('#bdef a');
const s1 = await st('#bdef a', ['color', 'textDecorationLine']);
await p.mouse.move(0, 500);
const sc = await st('#bdef [aria-current]', ['color', 'fontWeight']);
t('links are muted text-sm, text-colored and underlined on hover; the current page is text, font-medium', s0.color === muted[0] && s0.textDecorationLine === 'none' && s0.fontSize === '14px' && s1.color === muted[1] && s1.textDecorationLine === 'underline' && sc.color === muted[1] && sc.fontWeight === '500', JSON.stringify([s0, s1, sc]));
const sl = await p.evaluate(() => { const n = document.getElementById('bslash'); return { label: n.getAttribute('aria-label'), sep: n.querySelector('.dk-breadcrumb__separator').textContent, router: n.querySelector('[data-router]') && n.querySelector('[data-router]').getAttribute('href'), cls: n.querySelector('[data-router]') && n.querySelector('[data-router]').className }; });
t('separator="slash", a custom aria-label, and a router link through as', sl.label === 'You are here' && sl.sep === '/' && sl.router === '#router/b' && sl.cls === 'dk-breadcrumb__item dk-breadcrumb__link', JSON.stringify(sl));
const m0 = await items('#bmax');
t('maxItems={3}: the first, "…", then the last two', m0.join(' ') === 'Home > … > Website > Settings', m0.join(' '));
const more = await p.evaluate(() => { const b = document.querySelector('#bmax .dk-breadcrumb__more'); return { tag: b.tagName, type: b.type, label: b.getAttribute('aria-label') }; });
t('"…" is a button named by expandLabel', more.tag === 'BUTTON' && more.type === 'button' && more.label === 'Show all', JSON.stringify(more));
await p.focus('#bmax .dk-breadcrumb__more'); await p.keyboard.press('Enter'); await p.waitForTimeout(50);
const m1 = await items('#bmax');
const f = await p.evaluate(() => document.activeElement.textContent);
t('pressing "…" shows every item and moves focus to the first one it showed', m1.join(' ') === 'Home > Org > Team > Projects > Website > Settings' && f === 'Org', m1.join(' ') + ' focus=' + f);
const bb = await p.evaluate(() => { const n = document.getElementById('bbad'); return [n.querySelectorAll('.dk-breadcrumb__item').length, n.querySelector('.dk-breadcrumb__separator .dk-icon').dataset.icon].join(); });
t('unknown separator falls back to the chevron; maxItems below 2 is ignored', bb === '3,chevron_right', bb);
const rtl = await p.evaluate(() => [...document.querySelectorAll('#brtl .dk-breadcrumb__separator .dk-icon')].filter((i) => getComputedStyle(i).display !== 'none').map((i) => i.dataset.icon).join());
t('right to left: the chevron points left', rtl === 'chevron_left', rtl);
// The first link is the page's first focusable element: Shift+Tab from it leaves the page (Firefox doesn't Tab back in), so Tab away and back.
await p.focus('#bdef a'); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
const fr = { ...(await st('#bdef a', ['outlineStyle', 'outlineWidth'])), active: await p.evaluate(() => document.activeElement === document.querySelector('#bdef a')) };
t('keyboard focus: a 2px ring on the link', fr.active && fr.outlineStyle === 'solid' && fr.outlineWidth === '2px', JSON.stringify(fr));
const tk = await p.evaluate(() => { const n = document.getElementById('btok'); return [getComputedStyle(n.querySelector('a')).color, getComputedStyle(n.querySelector('ol')).columnGap].join(); });
t('Breadcrumb tokens (--breadcrumb-text, --breadcrumb-gap) override one breadcrumb', tk === 'rgb(1, 2, 3),11px', tk);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const bg = rgb(getComputedStyle(d).backgroundColor); d.remove();
    for (const sel of ['#bdef a', '#bdef [aria-current]', '#bslash .dk-breadcrumb__separator']) {
      const r = ratio(rgb(getComputedStyle(document.querySelector(sel)).color), bg); n++;
      if (r < 4.5) low.push(`${th} ${sel}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: links, the current page and separators keep 4.5:1 on surface in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Breadcrumb', R) ? 0 : 1);

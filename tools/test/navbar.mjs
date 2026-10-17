// Navbar: header and nav landmarks, brand, links and actions, the current page, the small-screen menu (toggle,
// Escape, closing on a link and when the screen grows), sticky, router links, contrast in every theme, tokens.
//   node tools/test/navbar.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { margin: 0; }</style><div id="root"></div>
<script>
var D = window.Diki, h = React.createElement, L = D.NavbarLink;
var RouterLink = React.forwardRef(function (p, ref) { return h('a', Object.assign({}, p, { ref: ref, href: '#router' + p.to, 'data-router': '' })); });
function App() {
  return h('div', null,
    h(D.Navbar, { id: 'nav', ref: window.nr = React.createRef(), className: 'extra', 'data-x': 'y', brand: h('a', { href: '#home', id: 'brand' }, 'Diki'),
      actions: h(D.Button, { size: 'sm', id: 'act' }, 'Sign in') },
      h(L, { href: '#dash', active: true, ref: window.lr = React.createRef() }, 'Dashboard'),
      h(L, { href: '#projects', id: 'lp' }, 'Projects'),
      h(L, { as: RouterLink, to: '/team', id: 'lr' }, 'Team')),
    h(D.Navbar, { id: 'nsticky', sticky: true, size: 'lg', 'aria-label': 'Docs', menuLabel: 'Open the menu', brand: 'Docs' }, h(L, { href: '#a' }, 'A')),
    h(D.Navbar, { id: 'nbare', brand: 'Only a brand', size: 'huge' }),
    h(D.Navbar, { id: 'ntok', style: { '--navbar-height': '48px', '--navbar-link-text': 'rgb(1, 2, 3)' } }, h(L, { href: '#t' }, 'T')),
    h('div', { style: { height: '2000px' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 1100, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('navbar.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const vis = (sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; }, sel);

const nd = await p.evaluate(() => { const n = document.getElementById('nav'), r = n.getBoundingClientRect(), nav = n.querySelector('nav'); return { tag: n.tagName, cls: n.className, comp: n.dataset.component, ref: window.nr.current === n, x: n.dataset.x, h: r.height, b: getComputedStyle(n).borderBottomWidth, label: nav.getAttribute('aria-label'), lis: nav.querySelectorAll('li').length, lref: window.lr.current && window.lr.current.tagName }; });
t('Navbar: a <header> with a <nav aria-label="Main"> list; 64px tall plus a 1px line; refs and props reach it', nd.tag === 'HEADER' && nd.cls === 'dk-navbar extra' && nd.comp === 'navbar' && nd.ref && nd.x === 'y' && nd.h === 65 && nd.b === '1px' && nd.label === 'Main' && nd.lis === 3 && nd.lref === 'A', JSON.stringify(nd));
const order = await p.evaluate(() => ['#brand', '#nav nav', '#act'].map((s) => Math.round(document.querySelector(s).getBoundingClientRect().left)));
const inner = await p.evaluate(() => { const i = document.querySelector('#nav .dk-navbar__inner'), r = i.getBoundingClientRect(); return [Math.round(r.width), getComputedStyle(i).paddingLeft].join(); });
t('wide screens: brand, links, then actions on the right, in a Container xl (1280px max, padded)', order[0] < order[1] && order[1] < order[2] && order[2] > 900 && inner === '1100,32px', JSON.stringify([order, inner]));
t('wide screens: no menu button', !(await vis('#nav .dk-navbar__toggle')));
const act = await p.evaluate(() => { const a = document.querySelector('#nav [aria-current]'); return [a.textContent, a.getAttribute('aria-current')].join(); });
const ls = await st('#lp', ['color', 'fontSize', 'fontWeight', 'backgroundColor']), la = await st('#nav [aria-current]', ['color', 'backgroundColor']);
await p.hover('#lp'); const lh = await st('#lp', ['color', 'backgroundColor']); await p.mouse.move(0, 600);
t('links: muted text-sm font-medium; hover and the current page (aria-current="page") are shaded and text-colored', act === 'Dashboard,page' && ls.fontSize === '14px' && ls.fontWeight === '500' && ls.backgroundColor === 'rgba(0, 0, 0, 0)' && la.backgroundColor !== ls.backgroundColor && lh.backgroundColor === la.backgroundColor && lh.color === la.color && ls.color !== la.color, JSON.stringify([ls, la, lh]));
const rl = await p.evaluate(() => { const a = document.getElementById('lr'); return [a.hasAttribute('data-router'), a.getAttribute('href'), a.className].join(); });
t('as: a router link with the link styles', rl === 'true,#router/team,dk-navbar__link', rl);
await p.focus('#brand'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
const f = await p.evaluate(() => [document.activeElement.id, getComputedStyle(document.activeElement).outlineStyle].join());
t('keyboard: Tab goes brand, links, actions; links show a focus ring', f === 'lp,solid', f);
const nb = await p.evaluate(() => { const n = document.getElementById('nbare'); return [n.querySelector('nav') === null, n.querySelector('.dk-navbar__toggle') === null, n.querySelector('.dk-navbar__inner').className].join('|'); });
t('a Navbar with no links has no nav and no menu button; an unknown size falls back to xl', nb === 'true|true|dk-navbar__inner dk-container dk-container--padded dk-container--xl', nb);
await p.evaluate(() => window.scrollTo(0, 600)); await p.waitForTimeout(50);
const sk = await p.evaluate(() => { const n = document.getElementById('nsticky'); return [Math.round(n.getBoundingClientRect().top), getComputedStyle(n).zIndex, n.querySelector('nav').getAttribute('aria-label'), getComputedStyle(n.querySelector('.dk-navbar__inner')).maxWidth].join(); });
await p.evaluate(() => window.scrollTo(0, 0));
t('sticky: stays at the top (z-40) while the page scrolls; aria-label names the nav; size lg', sk === '0,40,Docs,1024px', sk);
const tk = await p.evaluate(() => { const n = document.getElementById('ntok'); return [n.querySelector('.dk-navbar__inner').getBoundingClientRect().height, getComputedStyle(n.querySelector('.dk-navbar__link')).color].join(); });
t('Navbar tokens (--navbar-height, --navbar-link-text) override one navbar', tk === '48,rgb(1, 2, 3)', tk);

// small screens
await p.setViewportSize({ width: 500, height: 700 }); await p.waitForTimeout(100);
const tg = await p.evaluate(() => { const b = document.querySelector('#nav .dk-navbar__toggle'), nav = document.querySelector('#nav nav'); return { label: b.getAttribute('aria-label'), exp: b.getAttribute('aria-expanded'), ctl: b.getAttribute('aria-controls') === nav.id, icon: b.textContent, right: Math.round(b.getBoundingClientRect().right) }; });
t('below 768px: the links hide behind a menu button (aria-expanded, aria-controls), at the right', !(await vis('#nav nav')) && tg.label === 'Menu' && tg.exp === 'false' && tg.ctl && tg.icon === 'menu' && tg.right === 484, JSON.stringify(tg));
t('menuLabel names the button', (await p.evaluate(() => document.querySelector('#nsticky .dk-navbar__toggle').getAttribute('aria-label'))) === 'Open the menu');
await p.click('#nav .dk-navbar__toggle');
const op = await p.evaluate(() => { const n = document.getElementById('nav'), nav = n.querySelector('nav'), r = nav.getBoundingClientRect(), hr = n.getBoundingClientRect(), links = [...nav.querySelectorAll('a')].map((a) => Math.round(a.getBoundingClientRect().top)); return { exp: n.querySelector('.dk-navbar__toggle').getAttribute('aria-expanded'), icon: n.querySelector('.dk-navbar__toggle').textContent, top: Math.round(r.top - hr.bottom), w: Math.round(r.width), stacked: links[0] < links[1] && links[1] < links[2] }; });
t('pressing it opens the links in a full-width panel under the bar, one per line; the icon becomes close', (await vis('#nav nav')) && op.exp === 'true' && op.icon === 'close' && op.top <= 0 && op.top >= -1 && op.w === 500 && op.stacked, JSON.stringify(op));
await p.focus('#lp');
await p.keyboard.press('Escape');
const esc = await p.evaluate(() => [document.querySelector('#nav .dk-navbar__toggle').getAttribute('aria-expanded'), document.activeElement === document.querySelector('#nav .dk-navbar__toggle')].join());
t('Escape closes it and returns focus to the menu button', esc === 'false,true' && !(await vis('#nav nav')), esc);
await p.click('#nav .dk-navbar__toggle'); await p.click('#lp');
t('following a link closes it', !(await vis('#nav nav')) && (await p.evaluate(() => location.hash)) === '#projects');
await p.click('#nav .dk-navbar__toggle');
await p.setViewportSize({ width: 1000, height: 700 }); await p.waitForTimeout(100);
const grown = await p.evaluate(() => document.getElementById('nav').dataset.state);
await p.setViewportSize({ width: 500, height: 700 }); await p.waitForTimeout(100);
t('growing past 768px closes it, so it\'s closed when the screen shrinks again', grown === 'closed' && !(await vis('#nav nav')), grown);

await p.setViewportSize({ width: 1100, height: 700 }); await p.waitForTimeout(50);
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const bg = rgb(getComputedStyle(document.getElementById('nav')).backgroundColor);
    const link = document.getElementById('lp'), cur = document.querySelector('#nav [aria-current]');
    const curBg = rgb(getComputedStyle(cur).backgroundColor);
    for (const [name, fg, b2] of [['link', rgb(getComputedStyle(link).color), bg], ['current page and hovered links', rgb(getComputedStyle(cur).color), curBg]]) {
      const r = ratio(fg, b2); n++;
      if (r < 4.5) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: links, and the current page and hovered links (text on the shaded background), keep 4.5:1 in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Navbar', R) ? 0 : 1);

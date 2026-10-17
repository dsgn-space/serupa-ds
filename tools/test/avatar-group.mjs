// AvatarGroup: overlap per size, the surface ring, max and "+N", total, size over each avatar's own, the group's
// name, RTL, contrast in every theme, component tokens and forced colors.
//   node tools/test/avatar-group.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:flex;flex-direction:column;gap:12px;align-items:flex-start"></div>
<script>
var D = window.Diki, h = React.createElement;
var P = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Linus Torvalds'];
function av(n) { return P.slice(0, n).map(function (x) { return h(D.Avatar, { key: x, name: x, size: 'lg' }); }); }
function App() {
  return h(React.Fragment, null,
    h(D.AvatarGroup, { id: 'all', label: 'Assigned to', ref: window.r = React.createRef(), className: 'extra', 'data-x': 'y' }, av(3)),
    h(D.AvatarGroup, { id: 'max', max: 3 }, av(5)),
    h(D.AvatarGroup, { id: 'tot', total: 120, moreLabel: function (n) { return n + ' other members'; } }, av(4)),
    h(D.AvatarGroup, { id: 'zero', max: 0 }, av(2)),
    h(D.AvatarGroup, { id: 'neg', max: -2, total: 1, size: 'huge' }, av(2), 'text', null),
    ['xs', 'sm', 'md', 'lg', 'xl'].map(function (s) { return h(D.AvatarGroup, { key: s, 'data-s': s, size: s, max: 2 }, av(3)); }),
    h('div', { dir: 'rtl' }, h(D.AvatarGroup, { id: 'rtl' }, av(2))),
    h(D.AvatarGroup, { id: 'st' }, P.slice(0, 3).map(function (x) { return h(D.Avatar, { key: x, name: x, status: 'online' }); })),
    h(D.AvatarGroup, { id: 'wrap', size: 'sm' }, h(D.Tooltip, { content: 'Ada Lovelace' }, h(D.Avatar, { name: 'Ada Lovelace', tabIndex: 0 })), h('a', { href: '#g' }, h(D.Avatar, { name: 'Grace Hopper', size: 'xl' })), h(D.Avatar, { name: 'Alan Turing' })),
    h(D.AvatarGroup, { id: 'frag', max: 2 }, h(React.Fragment, null, av(4))),
    h(D.AvatarGroup, { id: 'big', size: 'xs', total: 120 }, av(4)),
    h(D.AvatarGroup, { id: 'tok', style: { '--avatar-group-overlap-md': '20px', '--avatar-group-ring': 'rgb(1, 2, 3)' } }, av(2)));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await p.goto(writePage('avatar-group.html', APP, { react: true }));
await p.waitForTimeout(500);

const all = await p.evaluate(() => { const g = document.getElementById('all'), a = [...g.children].map((i) => i.querySelector('.dk-avatar')); return { tag: g.tagName, role: g.getAttribute('role'), name: g.getAttribute('aria-label'), n: a.length, names: a.map((e) => e.getAttribute('aria-label')).join('|'), more: !!g.querySelector('.dk-avatar-group__more'), ref: window.r.current === g, cls: g.className, x: g.dataset.x, comp: g.dataset.component }; });
t('a role="group" <div> named by label, with each avatar keeping its own name; no "+N" when all fit; ref, className and props reach it', all.tag === 'DIV' && all.role === 'group' && all.name === 'Assigned to' && all.n === 3 && all.names === 'Ada Lovelace|Grace Hopper|Alan Turing' && !all.more && all.ref && /extra/.test(all.cls) && all.x === 'y' && all.comp === 'avatar-group', JSON.stringify(all));
const mx = await p.evaluate(() => { const g = document.getElementById('max'), m = g.querySelector('.dk-avatar-group__more'); return [g.querySelectorAll('.dk-avatar:not(.dk-avatar-group__more)').length, m && m.textContent, m && m.getAttribute('role'), m && m.getAttribute('aria-label'), m && m.querySelector('[aria-hidden="true"]') !== null, g.lastElementChild.contains(m)].join(); });
t('max={3} of 5: three avatars, then "+2" (role img, "2 more") at the end', mx === '3,+2,img,2 more,true,true', mx);
const tt = await p.evaluate(() => { const m = document.querySelector('#tot .dk-avatar-group__more'); return [m.textContent, m.getAttribute('aria-label')].join(); });
t('total={120} with 4 avatars: 116 more (written "99+"), and moreLabel names it', tt === '99+,116 other members', tt);
const z = await p.evaluate(() => { const g = document.getElementById('zero'); return [g.children.length, g.textContent].join(); });
t('max={0}: only "+2"', z === '1,+2', z);
const ng = await p.evaluate(() => { const g = document.getElementById('neg'); return [g.children.length, g.querySelector('.dk-avatar-group__more') === null, g.dataset.size, g.hasAttribute('aria-label')].join(); });
t('a negative max shows all, a total below the count is ignored, other children are dropped, and an unknown size is md', ng === '2,true,md,false', ng);

const geo = await p.evaluate(() => ['xs', 'sm', 'md', 'lg', 'xl'].map((s) => { const a = [...document.querySelector(`[data-s="${s}"]`).children].map((e) => e.getBoundingClientRect()); return { s, w: Math.round(a[0].width), lap: Math.round(a[0].right - a[1].left), lap2: Math.round(a[1].right - a[2].left), sizes: [...document.querySelector(`[data-s="${s}"]`).querySelectorAll('.dk-avatar')].map((e) => e.dataset.size).join('') }; }));
const want = { xs: [24, 8], sm: [32, 8], md: [40, 12], lg: [48, 12], xl: [64, 16] };
t('size wins over each avatar\'s own (lg) and sets the "+N" too; overlap is 8px at xs/sm, 12px at md/lg and 16px at xl', geo.every((g) => g.w === want[g.s][0] && g.lap === want[g.s][1] && g.lap2 === want[g.s][1] && g.sizes === g.s.repeat(3)), JSON.stringify(geo));
const ring = await p.evaluate(() => { const f = (e) => getComputedStyle(e.querySelector('.dk-avatar__frame')).boxShadow; const g = document.getElementById('max'); return [...g.children].map(f); });
const surface = await p.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--surface)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
t('every avatar, "+N" included, has a 2px surface ring', ring.every((r) => r.includes(surface) && /0px 0px 0px 2px/.test(r)), ring[0] + ' / ' + surface);
const z2 = await p.evaluate(() => { const a = [...document.getElementById('all').children], r = a[0].getBoundingClientRect(); const top = document.elementFromPoint(r.right - 3, r.top + r.height / 2); return a[0].contains(top); });
t('earlier avatars sit on top of the next one', z2);
const dots = await p.evaluate(() => [...document.querySelectorAll('#st .dk-avatar__status')].map((d) => { const r = d.getBoundingClientRect(); return d === document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); }).join());
t('every status dot shows, not only the last one', dots === 'true,true,true', dots);
const wr = await p.evaluate(() => { const g = document.getElementById('wrap'), a = [...g.querySelectorAll('.dk-avatar')], r = a.map((e) => e.getBoundingClientRect()); return { n: a.length, size: a.map((e) => e.dataset.size).join(), lap: Math.round(r[0].right - r[1].left), lap2: Math.round(r[1].right - r[2].left), ring: getComputedStyle(a[0].querySelector('.dk-avatar__frame')).boxShadow !== 'none', w: Math.round(r[0].width) }; });
t('avatars wrapped in a Tooltip or a link still overlap, get the ring and take the group size', wr.n === 3 && wr.size === 'sm,sm,sm' && wr.lap === 8 && wr.lap2 === 8 && wr.ring && wr.w === 32, JSON.stringify(wr));
await p.hover('#wrap .dk-avatar >> nth=0'); await p.waitForTimeout(600);
t('the Tooltip still opens on hover', await p.evaluate(() => !document.querySelector('#wrap [role="tooltip"]').hidden));
const fr = await p.evaluate(() => { const g = document.getElementById('frag'); return [g.querySelectorAll('.dk-avatar:not(.dk-avatar-group__more)').length, g.querySelector('.dk-avatar-group__more').textContent].join(); });
t('avatars in a fragment count one by one for max and "+N"', fr === '2,+2', fr);
const big = await p.evaluate(() => { const m = document.querySelector('#big .dk-avatar-group__more'), s = m.querySelector('.dk-avatar__initials'); return [s.textContent, m.getAttribute('aria-label'), s.getBoundingClientRect().width <= m.getBoundingClientRect().width].join(); });
t('past 99, "+N" reads "99+" so it fits even at xs, and its name keeps the exact count', big === '99+,116 more,true', big);
const rtl = await p.evaluate(() => { const a = [...document.getElementById('rtl').children].map((e) => e.getBoundingClientRect()); return [Math.round(a[1].right - a[0].left), a[1].left < a[0].left].join(); });
t('RTL: the row runs right to left with the same overlap', rtl === '12,true', rtl);
const tok = await p.evaluate(() => { const a = [...document.getElementById('tok').children]; return [Math.round(a[0].getBoundingClientRect().right - a[1].getBoundingClientRect().left), getComputedStyle(a[0].querySelector('.dk-avatar__frame')).boxShadow.includes('rgb(1, 2, 3)')].join(); });
t('component tokens (--avatar-group-overlap-md, --avatar-group-ring) override one group', tok === '20,true', tok);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const f = getComputedStyle(document.querySelector('#max .dk-avatar-group__more .dk-avatar__frame'));
    const r = ratio(rgb(f.color), rgb(f.backgroundColor)); n++;
    if (r < 4.5) low.push(`${th} +N: ${r.toFixed(2)}`);
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the "+N" text keeps 4.5:1 on its background in all six themes', contrast.low.length === 0 && contrast.n === 6, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

{
  const fp = await (await b.newContext({ forcedColors: 'active' })).newPage();
  await fp.goto(writePage('avatar-group-fc.html', APP, { react: true })); await fp.waitForTimeout(300);
  const fc = await fp.evaluate(() => { const f = document.querySelector('#max .dk-avatar__frame'), c = getComputedStyle(f); return [c.boxShadow, c.borderTopStyle].join(); });
  t('forced colors: no ring, each avatar keeps its border', fc === 'none,solid', fc);
  await fp.close();
}

await b.close();
cleanup();
process.exit(report('AvatarGroup', R) ? 0 : 1);

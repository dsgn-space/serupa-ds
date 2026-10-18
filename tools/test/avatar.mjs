// Avatar: picture, initials and icon fallbacks (and a picture that fails to load), names, sizes, shapes, status,
// contrast in every theme, component tokens and forced colors.
//   node tools/test/avatar.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

// A 10×10 red PNG rather than an SVG data URL: WebKit's loaded check failed on the SVG (no 10px natural width).
const IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAEklEQVR4nGM4w8CAB+GTG8HSAJNGT7H9UgyzAAAAAElFTkSuQmCC';
const APP = `<div id="root" style="padding:16px;display:flex;flex-wrap:wrap;gap:12px;align-items:center"></div>
<script>
var D = window.Serupa, h = React.createElement;
function App() {
  return h(React.Fragment, null,
    h(D.Avatar, { id: 'img', src: ${JSON.stringify(IMG)}, name: 'Ada Lovelace', ref: window.r = React.createRef(), className: 'extra', 'data-x': 'y' }),
    h(D.Avatar, { id: 'ini', name: 'grace brewster hopper' }),
    h(D.Avatar, { id: 'one', name: 'Linus' }),
    h(D.Avatar, { id: 'none' }),
    h(D.Avatar, { id: 'broken', src: '/nowhere.png', name: 'Alan Turing' }),
    h(D.Avatar, { id: 'alt', name: 'Ada Lovelace', alt: '' }),
    h(D.Avatar, { id: 'alt2', name: 'Atlas', alt: 'Atlas project', shape: 'square' }),
    ['xs', 'sm', 'md', 'lg', 'xl'].map(function (s) { return h(D.Avatar, { key: s, 'data-s': s, size: s, name: 'Ada Lovelace' }); }),
    ['xs', 'sm', 'md', 'lg', 'xl'].map(function (s) { return h(D.Avatar, { key: 'i' + s, 'data-is': s, size: s }); }),
    h(D.Avatar, { id: 'bad', size: 'huge', shape: 'blob', status: 'party', name: 'X Y' }),
    ['online', 'busy', 'away', 'offline'].map(function (s) { return h(D.Avatar, { key: s, 'data-st': s, status: s, name: 'Ada Lovelace' }); }),
    h(D.Avatar, { id: 'stl', status: 'busy', statusLabel: 'in a meeting', name: 'Ada Lovelace' }),
    h(D.Avatar, { id: 'tok', name: 'T K', style: { '--avatar-bg': 'rgb(1, 2, 3)', '--avatar-size-md': '50px' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('avatar.html', APP, { react: true }));
await p.waitForTimeout(500);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);

const im = await p.evaluate(() => { const e = document.getElementById('img'), i = e.querySelector('img'), r = e.getBoundingClientRect(); return { tag: e.tagName, role: e.getAttribute('role'), name: e.getAttribute('aria-label'), alt: i && i.getAttribute('alt'), loaded: i && i.naturalWidth === 10, fit: i && getComputedStyle(i).objectFit, size: [r.width, r.height], ref: window.r.current === e, cls: e.className, x: e.dataset.x, comp: e.dataset.component, radius: getComputedStyle(e.querySelector('.dk-avatar__frame')).borderTopLeftRadius }; });
t('picture: a 40px circle (role img, named by name), the <img> covers it and is decorative; ref, className and props reach it', im.tag === 'SPAN' && im.role === 'img' && im.name === 'Ada Lovelace' && im.alt === '' && im.loaded && im.fit === 'cover' && im.size.join() === '40,40' && im.ref && /extra/.test(im.cls) && im.x === 'y' && im.comp === 'avatar' && parseFloat(im.radius) >= 20, JSON.stringify(im));
const ini = await p.evaluate(() => ['ini', 'one', 'broken'].map((id) => { const e = document.getElementById(id), s = e.querySelector('.dk-avatar__initials'); return [s && s.textContent, s && s.getAttribute('aria-hidden'), !!e.querySelector('img')].join(':'); }));
t('initials: first and last words ("GH"), one word gives one letter, and a picture that fails to load falls back to initials', ini.join() === 'GH:true:false,L:true:false,AT:true:false', ini.join());
const nn = await p.evaluate(() => { const e = document.getElementById('none'); return [e.getAttribute('aria-hidden'), e.getAttribute('role'), e.querySelector('.dk-icon').dataset.icon].join(); });
t('no picture and no name: the person icon, hidden from screen readers', nn === 'true,,person', nn);
const al = await p.evaluate(() => [document.getElementById('alt').getAttribute('aria-hidden'), document.getElementById('alt').getAttribute('role'), document.getElementById('alt2').getAttribute('aria-label')].join());
t('alt="" hides it (the name is written beside it); alt replaces the name', al === 'true,,Atlas project', al);
const sz = await p.evaluate(() => ['xs', 'sm', 'md', 'lg', 'xl'].map((s) => { const e = document.querySelector(`[data-s="${s}"]`), r = e.getBoundingClientRect(); return Math.round(r.width) + '/' + getComputedStyle(e).fontSize; }));
t('sizes: 24/12, 32/12, 40/14, 48/16 and 64/20 (box/initials, px)', sz.join() === '24/12px,32/12px,40/14px,48/16px,64/20px', sz.join());
const isz = await p.evaluate(() => ['xs', 'sm', 'md', 'lg', 'xl'].map((s) => getComputedStyle(document.querySelector(`[data-is="${s}"] .dk-icon`)).fontSize));
t('the person icon scales with the size (14 to 40px)', isz.join() === '14px,20px,24px,28px,40px', isz.join());
const sq = await st('#alt2 .dk-avatar__frame', ['borderTopLeftRadius']);
t('shape square: 8px corners', sq.borderTopLeftRadius === '8px', sq.borderTopLeftRadius);
const bad = await p.evaluate(() => { const e = document.getElementById('bad'); return [e.dataset.size, e.dataset.shape, !!e.querySelector('.dk-avatar__status'), e.getAttribute('aria-label')].join(); });
t('unknown size, shape and status fall back to md, circle and none', bad === 'md,circle,false,X Y', bad);
const sts = await p.evaluate(() => ['online', 'busy', 'away', 'offline'].map((s) => { const e = document.querySelector(`[data-st="${s}"]`), d = e.querySelector('.dk-avatar__status'), r = d.getBoundingClientRect(), o = e.getBoundingClientRect(); return { name: e.getAttribute('aria-label'), w: r.width, end: Math.round(o.right - r.right), bottom: Math.round(o.bottom - r.bottom), ring: getComputedStyle(d).boxShadow, bg: getComputedStyle(d).backgroundColor, hidden: d.getAttribute('aria-hidden') }; }));
t('status: a 10px dot at the bottom end in a 2px surface ring, hidden itself but added to the name ("Ada Lovelace, online")', sts.every((s, i) => s.name === 'Ada Lovelace, ' + ['online', 'busy', 'away', 'offline'][i] && s.w === 10 && s.end === 0 && s.bottom === 0 && /0px 0px 0px 2px/.test(s.ring) && s.hidden === 'true') && new Set(sts.map((s) => s.bg)).size === 4, JSON.stringify(sts[0]));
t('statusLabel changes what the status says', await p.evaluate(() => document.getElementById('stl').getAttribute('aria-label') === 'Ada Lovelace, in a meeting'));
const tok = await p.evaluate(() => { const e = document.getElementById('tok'); return [getComputedStyle(e.querySelector('.dk-avatar__frame')).backgroundColor, e.getBoundingClientRect().width].join(); });
t('component tokens (--avatar-bg, --avatar-size-md) override one avatar', tok === 'rgb(1, 2, 3),50', tok);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const f = getComputedStyle(document.querySelector('#ini .dk-avatar__frame'));
    const r = ratio(rgb(f.color), rgb(f.backgroundColor)); n++;
    if (r < 4.5) low.push(`${th} initials: ${r.toFixed(2)}`);
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: initials and the icon keep 4.5:1 on their background in all six themes', contrast.low.length === 0 && contrast.n === 6, contrast.low.join('; '));
// The picture belongs to its src: an error that lands before React's effects (fast in WebKit) still falls back, and a new src tries again.
const sw = await (await b.newContext()).newPage();
await sw.goto(writePage('avatar-src.html', `<div id="root"></div><script>var h = React.createElement;
function App() { var s = React.useState('/nowhere.png'); window.setSrc = s[1]; return h(window.Serupa.Avatar, { id: 'sw', src: s[0], name: 'Alan Turing' }); }
ReactDOM.createRoot(document.getElementById('root')).render(h(App));</script>`, { react: true }));
const kind = () => sw.evaluate(() => { const e = document.getElementById('sw'); return e.querySelector('img') ? 'img' : e.textContent; });
await sw.waitForTimeout(300); const k1 = await kind();
await sw.evaluate((u) => window.setSrc(u), IMG); await sw.waitForTimeout(300); const k2 = await kind();
await sw.evaluate(() => window.setSrc('/elsewhere.png')); await sw.waitForTimeout(300); const k3 = await kind();
t('a failed src falls back to initials; a new src shows its picture; a new failing one falls back again', [k1, k2, k3].join() === 'AT,img,AT', [k1, k2, k3].join());
t('no errors on the page', errors.length === 0, errors.join('; '));

{
  const fp = await (await b.newContext({ forcedColors: 'active' })).newPage();
  await fp.goto(writePage('avatar-fc.html', APP, { react: true })); await fp.waitForTimeout(300);
  const fc = await fp.evaluate(() => getComputedStyle(document.querySelector('#ini .dk-avatar__frame')).borderTopStyle);
  t('forced colors: the frame gets a border', fc === 'solid', fc);
  await fp.close();
}

await b.close();
cleanup();
process.exit(report('Avatar', R) ? 0 : 1);

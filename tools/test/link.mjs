// Link and VisuallyHidden: the element, tones, underline, external links, router components, focus, contrast in
// every theme and component tokens; content hidden on screen but read, and shown on focus when focusable.
//   node tools/test/link.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;max-width:480px;font-size:16px"></div>
<script>
var D = window.Diki, h = React.createElement;
var RouterLink = React.forwardRef(function (p, ref) { return h('a', Object.assign({}, p, { ref: ref, href: '#router' + p.to, 'data-router': '' })); });
function App() {
  return h('div', null,
    h('p', { id: 'para', style: { color: 'rgb(9, 8, 7)' } }, 'Read ',
      h(D.Link, { id: 'ldef', href: '#a', ref: window.lr = React.createRef(), className: 'extra', 'data-x': 'y' }, 'the guide'), ' or ',
      h(D.Link, { id: 'lneu', href: '#b', tone: 'neutral' }, 'the notes'), '.'),
    h(D.Link, { id: 'lhov', href: '#c', underline: 'hover' }, 'Pricing'), ' ',
    h(D.Link, { id: 'lext', href: 'https://example.com', external: true, rel: 'me' }, 'Example'), ' ',
    h(D.Link, { id: 'lbad', href: '#d', tone: 'gold', underline: 'never' }, 'Bad'), ' ',
    h(D.Link, { id: 'lrouter', as: RouterLink, to: '/settings' }, 'Settings'), ' ',
    h(D.Link, { id: 'ltok', href: '#e', style: { '--link-color': 'rgb(1, 2, 3)', '--link-thickness': '3px', '--link-offset': '5px' } }, 'Tokens'),
    h('p', null, 'Unread ', h(D.VisuallyHidden, { id: 'vh', ref: window.vr = React.createRef(), className: 'extra' }, 'messages: '), '3'),
    h(D.VisuallyHidden, { id: 'vskip', as: 'div', focusable: true }, h('a', { id: 'skip', href: '#main' }, 'Skip to content')),
    h(D.VisuallyHidden, { id: 'vbad', as: 'table' }, 'x'),
    h('button', { id: 'after' }, 'after'),
    h(D.Link, { id: 'ltok2', href: '#f', style: { '--link-text': 'rgb(4, 5, 6)', '--link-color': 'rgb(1, 2, 3)' } }, 'New name'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('link.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const U = ['color', 'textDecorationLine', 'textDecorationThickness', 'textUnderlineOffset'];

const ld = await p.evaluate(() => { const e = document.getElementById('ldef'); return { tag: e.tagName, href: e.getAttribute('href'), cls: e.className, comp: e.dataset.component, ref: window.lr.current === e, x: e.dataset.x, target: e.target, display: getComputedStyle(e).display }; });
t('Link defaults: an inline <a>; ref, className and props reach it', ld.tag === 'A' && ld.href === '#a' && ld.cls === 'dk-link extra' && ld.comp === 'link' && ld.ref && ld.x === 'y' && ld.target === '' && ld.display === 'inline', JSON.stringify(ld));
const primary = await p.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--primary)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; });
const s0 = await st('#ldef', U);
t('Link: primary, underlined 1px, 2px below the text', s0.color === primary && s0.textDecorationLine === 'underline' && s0.textDecorationThickness === '1px' && s0.textUnderlineOffset === '2px', JSON.stringify(s0));
await p.hover('#ldef');
const s1 = await st('#ldef', U);
t('Link hover: primary-hover, and the underline thickens to 2px', s1.color !== primary && s1.textDecorationThickness === '2px', JSON.stringify(s1));
await p.mouse.move(0, 400);
const sn = await st('#lneu', U);
t('tone="neutral": the surrounding text\'s color, still underlined', sn.color === 'rgb(9, 8, 7)' && sn.textDecorationLine === 'underline', JSON.stringify(sn));
const h0 = (await st('#lhov', U)).textDecorationLine;
await p.hover('#lhov');
const h1 = (await st('#lhov', U)).textDecorationLine;
await p.mouse.move(0, 400);
t('underline="hover": no underline until hovered', h0 === 'none' && h1 === 'underline', [h0, h1].join());
const lb = await p.evaluate(() => document.getElementById('lbad').className);
t('Link: unknown tone and underline fall back to primary and always', lb === 'dk-link', lb);
const le = await p.evaluate(() => { const e = document.getElementById('lext'), i = e.querySelector('.dk-link__icon'), v = e.querySelector('.dk-visually-hidden'); return { target: e.target, rel: e.rel, icon: i && i.textContent, hidden: i && i.getAttribute('aria-hidden'), note: v && v.textContent, noteW: v && v.getBoundingClientRect().width, fs: i && getComputedStyle(i).fontSize }; });
t('external: target _blank, rel keeps yours and adds noopener noreferrer, a 1em hidden new-tab icon and "(opens in a new tab)" for screen readers', le.target === '_blank' && le.rel === 'me noopener noreferrer' && le.icon === 'open_in_new' && le.hidden === 'true' && le.note === ' (opens in a new tab)' && le.noteW <= 1 && le.fs === '16px', JSON.stringify(le));
const name = await p.locator('#lext').evaluate((e) => e.textContent);
t('external: the link\'s text reads "Example (opens in a new tab)" plus the hidden icon name', name.replace('open_in_new', '') === 'Example (opens in a new tab)', name);
const lr = await p.evaluate(() => { const e = document.getElementById('lrouter'); return { router: e.hasAttribute('data-router'), href: e.getAttribute('href'), cls: e.className }; });
t('as: renders your router link with className and the rest', lr.router && lr.href === '#router/settings' && lr.cls === 'dk-link', JSON.stringify(lr));
const lt = await st('#ltok', U);
t('Link tokens (--link-color, --link-thickness, --link-offset) override one link', lt.color === 'rgb(1, 2, 3)' && lt.textDecorationThickness === '3px' && lt.textUnderlineOffset === '5px', JSON.stringify(lt));
const lt2 = await st('#ltok2', U);
t('--link-text, the new name for --link-color, overrides it when both are set (the old name keeps working until 5.0.0)', lt2.color === 'rgb(4, 5, 6)', JSON.stringify(lt2));
// #ldef is the first focusable element: Shift+Tab from it leaves the page (Firefox doesn't Tab back in), so Tab away and back.
await p.focus('#ldef'); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
const f = { ...(await st('#ldef', ['outlineStyle', 'outlineWidth', 'outlineOffset'])), active: await p.evaluate(() => document.activeElement.id) };
t('keyboard focus: a 2px ring, 2px out', f.active === 'ldef' && f.outlineStyle === 'solid' && f.outlineWidth === '2px' && f.outlineOffset === '2px', JSON.stringify(f));

// VisuallyHidden
const vh = await p.evaluate(() => { const e = document.getElementById('vh'), r = e.getBoundingClientRect(), s = getComputedStyle(e); return { tag: e.tagName, cls: e.className, ref: window.vr.current === e, w: r.width, h: r.height, pos: s.position, ov: s.overflow, text: e.textContent, display: s.display, vis: s.visibility }; });
t('VisuallyHidden: a 1px clipped <span>, out of the layout, its text still there; ref and className reach it', vh.tag === 'SPAN' && vh.cls === 'dk-visually-hidden extra' && vh.ref && vh.w <= 1 && vh.h <= 1 && vh.pos === 'absolute' && vh.ov === 'hidden' && vh.text === 'messages: ' && vh.display !== 'none' && vh.vis === 'visible', JSON.stringify(vh));
const tree = await p.evaluate(() => document.getElementById('vh').parentElement.innerText);
t('VisuallyHidden stays in the page text that assistive tech reads', /messages/.test(await p.evaluate(() => document.getElementById('vh').parentElement.textContent)), tree);
const sk0 = await p.evaluate(() => document.getElementById('vskip').getBoundingClientRect().width);
await p.focus('#ltok'); await p.keyboard.press('Tab');
const foc = await p.evaluate(() => document.activeElement.id);
const sk1 = await p.evaluate(() => { const r = document.getElementById('vskip').getBoundingClientRect(); return { w: r.width, h: r.height, pos: getComputedStyle(document.getElementById('vskip')).position }; });
await p.keyboard.press('Tab');
const sk2 = await p.evaluate(() => document.getElementById('vskip').getBoundingClientRect().width);
t('focusable: a skip link shows while focused, and hides again after', sk0 <= 1 && foc === 'skip' && sk1.w > 50 && sk1.h > 10 && sk1.pos === 'static' && sk2 <= 1, JSON.stringify({ sk0, foc, sk1, sk2 }));
t('VisuallyHidden: an unknown as falls back to span', await p.evaluate(() => document.getElementById('vbad').tagName === 'SPAN'));

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const bg = col('var(--surface)');
    for (const [v, min] of [['var(--link-text, var(--link-color, var(--primary)))', 4.5], ['var(--link-text-hover, var(--link-color-hover, var(--primary-hover)))', 4.5], ['var(--link-focus-ring, var(--focus-ring))', 3]]) {
      const r = ratio(col(v), bg); n++;
      if (r < min) low.push(`${th} ${v}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: link text (4.5:1), on hover, and its focus ring (3:1) on surface in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Link and VisuallyHidden', R) ? 0 : 1);

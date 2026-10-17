// Stack, Grid, Container and Divider: elements, gaps from the spacing scale, alignment, columns, widths and
// padding, separators, divider contrast in every theme, and component tokens.
//   node tools/test/layout.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>.b { background: #ccc; }</style><div id="root" style="width:600px"></div>
<script>
var D = window.Diki, h = React.createElement;
function boxes(n, w) { var a = []; for (var i = 0; i < n; i++) a.push(h('div', { key: i, className: 'b', style: { width: w, height: (10 + i * 5) + 'px' } })); return a; }
function App() {
  return h('div', null,
    h(D.Stack, { id: 'sdef', ref: window.sr = React.createRef(), className: 'extra', 'data-x': 'y' }, boxes(3)),
    h(D.Stack, { id: 'sgap', gap: 1.5 }, boxes(2)),
    h(D.Stack, { id: 'srow', direction: 'row', gap: 2, justify: 'between' }, boxes(3, '20px')),
    h(D.Stack, { id: 'sbad', as: 'table', gap: 7.7, align: 'up', justify: 'around', direction: 'diag' }, boxes(2)),
    h(D.Stack, { id: 'sul', as: 'ul' }, h('li', null, 'a'), h('li', null, 'b')),
    h('div', { style: { width: '50px' } }, h(D.Stack, { id: 'swrap', direction: 'row', wrap: true, gap: 0 }, boxes(4, '20px'))),
    h(D.Stack, { id: 'stok', style: { '--stack-gap': '3px' } }, boxes(2)),
    h(D.Grid, { id: 'g3', columns: 3, gap: 2, ref: window.gr = React.createRef() }, boxes(5)),
    h(D.Grid, { id: 'gauto', minColumnWidth: '100px', gap: 0 }, boxes(7)),
    h(D.Grid, { id: 'gdef' }, boxes(3)),
    h(D.Grid, { id: 'gtok', minColumnWidth: 'container-3xs', columns: 99 }, boxes(3)),
    h('div', { style: { width: '120px' } }, h(D.Grid, { id: 'gnarrow' }, boxes(2))),
    h(D.Grid, { id: 'gul', as: 'ul', columns: 2 }, h('li', null, 'a'), h('li', null, 'b')),
    h(D.Container, { id: 'cdef', ref: window.cr = React.createRef(), className: 'extra' }, 'x'),
    h(D.Container, { id: 'cprose', size: 'prose', as: 'main' }, 'x'),
    h(D.Container, { id: 'cfull', size: 'full', padded: false }, 'x'),
    h(D.Container, { id: 'cbad', size: 'huge', as: 'table' }, 'x'),
    h(D.Divider, { id: 'dh', ref: window.dr = React.createRef(), className: 'extra' }),
    h(D.Divider, { id: 'dlabel', label: 'or' }),
    h(D.Divider, { id: 'ddeco', decorative: true }),
    h(D.Divider, { id: 'dtok', style: { '--divider-color': 'rgb(1, 2, 3)', '--divider-width': '3px' } }),
    h(D.Stack, { id: 'vrow', direction: 'row', align: 'stretch', style: { height: '40px' } }, 'a', h(D.Divider, { id: 'dv', orientation: 'vertical', label: 'ignored' }), 'b'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('layout.html', APP, { react: true }));
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const kids = (sel) => p.evaluate((s) => [...document.querySelector(s).children].map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }), sel);

// Stack
const sd = await p.evaluate(() => { const e = document.getElementById('sdef'); return { tag: e.tagName, cls: e.className, comp: e.dataset.component, ref: window.sr.current === e, x: e.dataset.x }; });
t('Stack defaults: a <div>; ref, className and props reach it', sd.tag === 'DIV' && sd.cls === 'dk-stack dk-stack--align-stretch extra' && sd.comp === 'stack' && sd.ref && sd.x === 'y', JSON.stringify(sd));
const ss = await st('#sdef', ['display', 'flexDirection', 'rowGap', 'alignItems']);
const sk = await kids('#sdef');
t('Stack: a column, 16px apart (spacing-4), children stretched', ss.display === 'flex' && ss.flexDirection === 'column' && ss.rowGap === '16px' && ss.alignItems === 'stretch' && sk[1].y - (sk[0].y + sk[0].h) === 16 && sk[0].w === 600, JSON.stringify([ss, sk]));
t('Stack gap={1.5}: 6px (spacing-1.5, the dot escaped)', (await st('#sgap', ['rowGap'])).rowGap === '6px');
const sr = await st('#srow', ['flexDirection', 'columnGap', 'alignItems', 'justifyContent']);
const rk = await kids('#srow');
t('Stack row: side by side, centered, justify between', sr.flexDirection === 'row' && sr.columnGap === '8px' && sr.alignItems === 'center' && sr.justifyContent === 'space-between' && rk[2].x + rk[2].w === 608 && rk[0].y > rk[2].y, JSON.stringify([sr, rk]));
const sb = await p.evaluate(() => { const e = document.getElementById('sbad'); return [e.tagName, e.className, getComputedStyle(e).rowGap].join(' '); });
t('Stack: unknown as, gap, align, justify and direction fall back', sb === 'DIV dk-stack dk-stack--align-stretch 16px', sb);
const su = await st('#sul', ['listStyleType', 'paddingLeft', 'marginTop']);
t('Stack as ul: no bullets, padding or margin', su.listStyleType === 'none' && su.paddingLeft === '0px' && su.marginTop === '0px', JSON.stringify(su));
const wk = await kids('#swrap');
t('Stack wrap: a row that wraps onto more lines', wk[2].y > wk[0].y, JSON.stringify(wk));
t('Stack token --stack-gap sets the default gap', (await st('#stok', ['rowGap'])).rowGap === '3px');

// Grid
const g3 = await kids('#g3');
t('Grid columns={3}: three equal columns 8px apart, wrapping onto a second row', g3[0].w === 195 && g3[1].x - g3[0].x === 203 && g3[3].x === g3[0].x && g3[3].y > g3[0].y && await p.evaluate(() => window.gr.current.dataset.component === 'grid'), JSON.stringify(g3));
const ga = await kids('#gauto');
t('Grid auto with minColumnWidth 100px: six columns of 100px in 600px', ga[5].x - ga[0].x === 500 && ga[6].x === ga[0].x && ga[0].w === 100, JSON.stringify(ga));
const gd = await kids('#gdef');
t('Grid defaults: auto columns of at least 256px (container-3xs), 16px apart: two across 600px', gd[0].w === 292 && gd[1].x - gd[0].x === 308 && gd[2].y > gd[0].y, JSON.stringify(gd));
const gt = await kids('#gtok');
t('Grid: a sizing token name works as minColumnWidth; columns out of 1–12 falls back to auto', gt[0].w === 292 && await p.evaluate(() => document.getElementById('gtok').className === 'dk-grid dk-grid--auto'), JSON.stringify(gt));
const gn = await kids('#gnarrow');
t('Grid: a column never gets wider than a narrow grid (120px)', gn[0].w === 120 && gn[1].y > gn[0].y, JSON.stringify(gn));
t('Grid as ul: no bullets or padding', (await st('#gul', ['listStyleType', 'paddingLeft'])).listStyleType === 'none');

// Container
const cd = await p.evaluate(() => { const e = document.getElementById('cdef'), r = e.getBoundingClientRect(), s = getComputedStyle(e); return { tag: e.tagName, cls: e.className, ref: window.cr.current === e, w: r.width, pl: s.paddingLeft, mw: s.maxWidth, size: e.dataset.size }; });
t('Container defaults: xl (1280px), padded, a <div>; ref and className reach it', cd.tag === 'DIV' && cd.cls === 'dk-container dk-container--xl dk-container--padded extra' && cd.ref && cd.mw === '1280px' && cd.size === 'xl' && cd.w === 600, JSON.stringify(cd));
const cp = await st('#cprose', ['maxWidth']);
t('Container prose: 672px (container-2xl), as main', cp.maxWidth === '672px' && await p.evaluate(() => document.getElementById('cprose').tagName === 'MAIN'), JSON.stringify(cp));
const cf = await st('#cfull', ['maxWidth', 'paddingLeft']);
t('Container full, padded={false}: no maximum, no padding', cf.maxWidth === 'none' && cf.paddingLeft === '0px', JSON.stringify(cf));
t('Container: unknown size and as fall back to xl and div', await p.evaluate(() => { const e = document.getElementById('cbad'); return e.tagName === 'DIV' && e.dataset.size === 'xl'; }));
const pad = [];
for (const w of [400, 800, 1100]) { await p.setViewportSize({ width: w, height: 800 }); pad.push((await st('#cdef', ['paddingLeft'])).paddingLeft); }
t('Container padding grows with the screen: 16px, 24px from 640px, 32px from 1024px', pad.join() === '16px,24px,32px', pad.join());
await p.setViewportSize({ width: 2000, height: 800 });
await p.evaluate(() => { document.getElementById('root').style.width = '1800px'; });
const cc = await p.evaluate(() => { const r = document.getElementById('cdef').getBoundingClientRect(), o = document.getElementById('root').getBoundingClientRect(); return [r.width, Math.round(r.left - o.left), Math.round(o.right - r.right)]; });
t('Container centers itself once the page is wider than its size', cc[0] === 1280 && cc[1] === cc[2] && cc[1] === 260, JSON.stringify(cc));
await p.evaluate(() => { document.getElementById('root').style.width = '600px'; });

// Divider
const dh = await p.evaluate(() => { const e = document.getElementById('dh'), s = getComputedStyle(e), r = e.getBoundingClientRect(); return { tag: e.tagName, role: e.getAttribute('role'), cls: e.className, ref: window.dr.current === e, bt: s.borderTopWidth + ' ' + s.borderTopStyle, h: r.height, w: r.width, m: s.marginTop }; });
t('Divider: an <hr> (a separator), a 1px line, full width, no margin; ref and className reach it', dh.tag === 'HR' && dh.role === null && dh.cls === 'dk-divider extra' && dh.ref && dh.bt === '1px solid' && dh.h === 1 && dh.w === 600 && dh.m === '0px', JSON.stringify(dh));
const dl = await p.evaluate(() => { const e = document.getElementById('dlabel'), l = e.querySelector('.dk-divider__label'), s = getComputedStyle(e), a = getComputedStyle(e, '::before'); return { tag: e.tagName, role: e.getAttribute('role'), text: e.textContent, fs: s.fontSize, before: a.borderTopWidth, lw: l.getBoundingClientRect().left - e.getBoundingClientRect().left }; });
t('Divider label: role separator with "or" between two lines, text-xs', dl.tag === 'DIV' && dl.role === 'separator' && dl.text === 'or' && dl.fs === '12px' && dl.before === '1px' && dl.lw > 250, JSON.stringify(dl));
const dd = await p.evaluate(() => { const e = document.getElementById('ddeco'); return [e.getAttribute('role'), e.getAttribute('aria-hidden')].join(); });
t('Divider decorative: role none and hidden', dd === 'none,true', dd);
const dt = await st('#dtok', ['borderTopColor', 'borderTopWidth']);
t('Divider tokens (--divider-color, --divider-width) override one divider', dt.borderTopColor === 'rgb(1, 2, 3)' && dt.borderTopWidth === '3px', JSON.stringify(dt));
const dv = await p.evaluate(() => { const e = document.getElementById('dv'), r = e.getBoundingClientRect(), s = getComputedStyle(e); return { role: e.getAttribute('role'), o: e.getAttribute('aria-orientation'), h: r.height, w: r.width, bl: s.borderLeftWidth, text: e.textContent }; });
t('Divider vertical: role separator, aria-orientation vertical, the row\'s height, 1px wide, no label', dv.role === 'separator' && dv.o === 'vertical' && dv.h === 40 && dv.w === 1 && dv.bl === '1px' && dv.text === '', JSON.stringify(dv));

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const bg = rgb(getComputedStyle(d).backgroundColor); d.remove();
    const r = ratio(rgb(getComputedStyle(document.getElementById('dlabel')).color), bg); n++;
    if (r < 4.5) low.push(`${th} label: ${r.toFixed(2)}`);
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: the divider label keeps 4.5:1 on surface in all six themes', contrast.low.length === 0 && contrast.n === 6, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Layout', R) ? 0 : 1);

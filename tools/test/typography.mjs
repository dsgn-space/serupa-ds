// Text and Heading: elements, the type scale, tones, weights, inheritance, truncate, contrast in every theme
// and component tokens.
//   node tools/test/typography.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;max-width:480px"></div>
<script>
var D = window.Serupa, h = React.createElement;
function App() {
  return h(React.Fragment, null,
    h(D.Heading, { id: 'hdef', ref: window.hr = React.createRef(), className: 'extra', 'data-x': 'y' }, 'Default'),
    [1, 2, 3, 4, 5, 6].map(function (l) { return h(D.Heading, { key: l, 'data-l': l, level: l }, 'Level ' + l); }),
    h(D.Heading, { id: 'hbad', level: 9, size: 'huge' }, 'Bad'),
    h(D.Heading, { id: 'hsize', level: 1, size: 'lg' }, 'Small h1'),
    h(D.Heading, { id: 'hbig', level: 4, size: '4xl' }, 'Big h4'),
    h(D.Heading, { id: 'htok', level: 3, style: { '--heading-size-3': '11px', '--heading-text': 'rgb(1, 2, 3)' } }, 'Tokens'),
    h(D.Text, { id: 'tdef', ref: window.tr = React.createRef(), className: 'extra' }, 'Default'),
    h('div', { id: 'parent', style: { fontSize: '13px', lineHeight: '17px', color: 'rgb(9, 8, 7)', fontWeight: 300 } }, h(D.Text, { as: 'span', id: 'tinh' }, 'Inherits')),
    ['xs', 'sm', 'base', 'lg', 'xl'].map(function (s) { return h(D.Text, { key: s, 'data-s': s, size: s }, s); }),
    ['default', 'muted', 'primary', 'danger'].map(function (t) { return h(D.Text, { key: t, 'data-t': t, tone: t }, t); }),
    ['normal', 'medium', 'semibold', 'bold'].map(function (w) { return h(D.Text, { key: w, 'data-w': w, weight: w }, w); }),
    h(D.Text, { id: 'tbad', as: 'section', size: 'huge', tone: 'gold', weight: 'heavy' }, 'Bad'),
    h(D.Text, { id: 'tlabel', as: 'label', htmlFor: 'x' }, 'Label'),
    h('div', { style: { width: '80px' } }, h(D.Text, { id: 'trunc', as: 'span', truncate: true }, 'A very long line of text that will not fit')),
    h(D.Text, { id: 'ttok', tone: 'muted', style: { '--text-color-muted': 'rgb(1, 2, 3)' } }, 'Tokens'),
    h(D.Text, { id: 'ttok2', tone: 'muted', style: { '--text-tone-muted': 'rgb(4, 5, 6)', '--text-color-muted': 'rgb(1, 2, 3)' } }, 'New name'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('typography.html', APP, { react: true }));
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);

const hd = await p.evaluate(() => { const e = document.getElementById('hdef'); return { tag: e.tagName, cls: e.className, comp: e.dataset.component, ref: window.hr.current === e, x: e.dataset.x }; });
t('Heading defaults: an <h2>; ref, className and props reach it', hd.tag === 'H2' && hd.cls === 'dk-heading dk-heading--2 extra' && hd.comp === 'heading' && hd.ref && hd.x === 'y', JSON.stringify(hd));
const lv = await p.evaluate(() => [1, 2, 3, 4, 5, 6].map((l) => { const e = document.querySelector(`[data-l="${l}"]`), s = getComputedStyle(e); return [e.tagName, s.fontSize, s.lineHeight, s.fontWeight, s.marginTop, s.letterSpacing].join(' '); }));
const want = ['H1 30px 36px 600 0px -0.75px', 'H2 24px 32px 600 0px -0.6px', 'H3 20px 28px 600 0px normal', 'H4 18px 28px 600 0px normal', 'H5 16px 24px 600 0px normal', 'H6 14px 20px 600 0px normal'];
t('Heading levels: h1 3xl to h6 sm with the scale\'s line heights, font-semibold, no margins, 2xl and up tracked tight', lv.join() === want.join(), lv.join(' | '));
const hb = await p.evaluate(() => { const e = document.getElementById('hbad'); return [e.tagName, e.className].join(' '); });
t('Heading: an unknown level falls back to h2, an unknown size is ignored', hb === 'H2 dk-heading dk-heading--2', hb);
const hs = await st('#hsize', ['fontSize', 'lineHeight', 'letterSpacing']), hg = await st('#hbig', ['fontSize', 'lineHeight', 'letterSpacing']);
t('Heading size: an h1 can look lg (and loses the tight tracking), an h4 can look 4xl', hs.fontSize === '18px' && hs.lineHeight === '28px' && hs.letterSpacing === 'normal' && hg.fontSize === '36px' && hg.lineHeight === '40px' && hg.letterSpacing === '-0.9px' && await p.evaluate(() => document.getElementById('hsize').tagName === 'H1'), JSON.stringify([hs, hg]));
const ht = await st('#htok', ['fontSize', 'color']);
t('Heading tokens (--heading-size-3, --heading-text) override one heading', ht.fontSize === '11px' && ht.color === 'rgb(1, 2, 3)', JSON.stringify(ht));

const td = await p.evaluate(() => { const e = document.getElementById('tdef'); return { tag: e.tagName, cls: e.className, ref: window.tr.current === e, m: getComputedStyle(e).marginTop }; });
t('Text defaults: a <p> with no margins; ref and className reach it', td.tag === 'P' && td.cls === 'dk-text extra' && td.ref && td.m === '0px', JSON.stringify(td));
const inh = await st('#tinh', ['fontSize', 'lineHeight', 'color', 'fontWeight']);
t('Text: size, tone and weight follow the parent when unset', inh.fontSize === '13px' && inh.lineHeight === '17px' && inh.color === 'rgb(9, 8, 7)' && inh.fontWeight === '300', JSON.stringify(inh));
const sz = await p.evaluate(() => ['xs', 'sm', 'base', 'lg', 'xl'].map((s) => { const c = getComputedStyle(document.querySelector(`[data-s="${s}"]`)); return c.fontSize + '/' + c.lineHeight; }));
t('Text sizes: xs to xl with their line heights', sz.join() === '12px/16px,14px/20px,16px/24px,18px/28px,20px/28px', sz.join());
const wt = await p.evaluate(() => ['normal', 'medium', 'semibold', 'bold'].map((w) => getComputedStyle(document.querySelector(`[data-w="${w}"]`)).fontWeight));
t('Text weights: 400, 500, 600, 700', wt.join() === '400,500,600,700', wt.join());
const tb = await p.evaluate(() => { const e = document.getElementById('tbad'); return [e.tagName, e.className].join(' '); });
t('Text: unknown as, size, tone and weight fall back to <p> and inherit', tb === 'P dk-text', tb);
t('Text as label passes htmlFor', await p.evaluate(() => { const e = document.getElementById('tlabel'); return e.tagName === 'LABEL' && e.htmlFor === 'x'; }));
const tr = await p.evaluate(() => { const e = document.getElementById('trunc'), s = getComputedStyle(e); return { d: s.display, ws: s.whiteSpace, to: s.textOverflow, cut: e.scrollWidth > e.clientWidth, w: e.clientWidth }; });
t('truncate: one line with an ellipsis, as a block even on a span', tr.d === 'block' && tr.ws === 'nowrap' && tr.to === 'ellipsis' && tr.cut && tr.w === 80, JSON.stringify(tr));
t('Text tokens (--text-color-muted) override one element', (await st('#ttok', ['color'])).color === 'rgb(1, 2, 3)');
t('--text-tone-muted, the new name for --text-color-muted, overrides it when both are set (the old name keeps working until 6.0.0)', (await st('#ttok2', ['color'])).color === 'rgb(4, 5, 6)');

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const bg = rgb(getComputedStyle(d).backgroundColor); d.remove();
    for (const sel of ['[data-t="default"]', '[data-t="muted"]', '[data-t="primary"]', '[data-t="danger"]', '[data-l="1"]']) {
      const r = ratio(rgb(getComputedStyle(document.querySelector(sel)).color), bg); n++;
      if (r < 4.5) low.push(`${th} ${sel}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: every Text tone and Heading keep 4.5:1 on surface in all six themes', contrast.low.length === 0 && contrast.n === 30, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Text and Heading', R) ? 0 : 1);

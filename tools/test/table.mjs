// Table: native markup, caption, sizes, alignment, row hover, stripes, selection, sortable headers, the
// scrolling frame (focusable only when it scrolls), sticky header, contrast in every theme, component tokens.
//   node tools/test/table.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;width:600px"></div>
<script>
var D = window.Diki, h = React.createElement;
var rows = [['Ada', 'Admin', 1200], ['Grace', 'Editor', 30], ['Linus', 'Viewer', 450]];
function Sortable() {
  var s = React.useState('none');
  var sorted = rows.slice().sort(function (a, b) { return s[0] === 'none' ? 0 : (s[0] === 'ascending' ? 1 : -1) * (a[2] - b[2]); });
  return h(D.Table, { id: 'tsort', caption: 'Usage', captionHidden: true },
    h(D.TableHead, null, h(D.TableRow, null, h(D.TableHeaderCell, null, 'Name'), h(D.TableHeaderCell, { id: 'hsort', align: 'end', sort: s[0], onSort: function () { s[1](s[0] === 'ascending' ? 'descending' : 'ascending'); } }, 'Calls'))),
    h(D.TableBody, null, sorted.map(function (r) { return h(D.TableRow, { key: r[0] }, h(D.TableCell, null, r[0]), h(D.TableCell, { align: 'end' }, r[2])); })));
}
function body(sel) { return h(D.TableBody, null, rows.map(function (r, i) { return h(D.TableRow, { key: r[0], selected: sel ? i === 1 : undefined, 'data-i': i }, h(D.TableCell, null, r[0]), h(D.TableCell, null, h(D.Text, { as: 'span', tone: 'muted' }, r[1])), h(D.TableCell, { align: 'end' }, r[2])); })); }
function head() { return h(D.TableHead, null, h(D.TableRow, null, h(D.TableHeaderCell, null, 'Name'), h(D.TableHeaderCell, null, 'Role'), h(D.TableHeaderCell, { align: 'end' }, 'Calls'))); }
function App() {
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    h(D.Table, { id: 'tdef', ref: window.tr = React.createRef(), className: 'extra', caption: 'Team members', containerProps: { 'data-frame': 'f' } }, head(), body(true),
      h(D.TableFoot, null, h(D.TableRow, null, h(D.TableCell, { colSpan: 2 }, 'Total'), h(D.TableCell, { align: 'end' }, 1680)))),
    h(D.Table, { id: 'tsm', size: 'sm', striped: true }, head(), body()),
    h(Sortable),
    h('div', { style: { width: '200px' } }, h(D.Table, { id: 'twide', caption: 'Wide', style: { minWidth: '500px' } }, head(), body())),
    h(D.Table, { id: 'tsticky', stickyHeader: true, containerProps: { style: { maxHeight: '120px' }, 'aria-label': 'Sticky' } }, head(), h(D.TableBody, null, [1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return h(D.TableRow, { key: i }, h(D.TableCell, null, 'Row ' + i), h(D.TableCell, null, 'x'), h(D.TableCell, null, i)); }))),
    h(D.Table, { id: 'tbad', size: 'xl' }, h(D.TableBody, null, h(D.TableRow, null, h(D.TableCell, { align: 'middle' }, 'x')))),
    h(D.Table, { id: 'ttok', style: {}, containerProps: { style: { '--table-header-bg': 'rgb(1, 2, 3)', '--table-padding-x': '20px' } } }, head(), body()));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('table.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(400);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const tok = (v, prop = 'backgroundColor') => p.evaluate(([v, prop]) => { const d = document.createElement('div'); d.style[prop === 'color' ? 'color' : 'background'] = v; document.body.appendChild(d); const c = getComputedStyle(d)[prop]; d.remove(); return c; }, [v, prop]);

const td = await p.evaluate(() => { const t = document.getElementById('tdef'), f = t.parentElement; return { tag: t.tagName, cls: t.className, ref: window.tr.current === t, frame: f.className, comp: f.dataset.component, fp: f.dataset.frame, cap: t.caption && t.caption.textContent, th: [...t.querySelectorAll('th')].map((x) => x.scope).join(), tabindex: f.getAttribute('tabindex'), role: f.getAttribute('role') }; });
t('Table: a native <table> in a frame; caption, scope="col" headers; ref and className on the table, containerProps on the frame', td.tag === 'TABLE' && td.cls === 'dk-table__table extra' && td.ref && td.frame === 'dk-table' && td.comp === 'table' && td.fp === 'f' && td.cap === 'Team members' && td.th === 'col,col,col', JSON.stringify(td));
t('a table that fits doesn\'t add a tab stop or a region', td.tabindex === null && td.role === null, JSON.stringify(td));
const fr = await st('#tdef', ['width']);
const frame = await p.evaluate(() => { const s = getComputedStyle(document.getElementById('tdef').parentElement); return [s.borderTopWidth, s.borderTopStyle, s.borderTopLeftRadius, s.overflowX].join(' '); });
t('the frame: a 1px border, 8px corners, scrolls on overflow; the table fills it', frame === '1px solid 8px auto' && fr.width === '598px', frame + ' ' + fr.width);
const cell = await st('#tdef td', ['paddingTop', 'paddingLeft', 'fontSize', 'borderBottomWidth']);
t('cells: 12px padding, text-sm, a 1px line below', cell.paddingTop === '12px' && cell.paddingLeft === '12px' && cell.fontSize === '14px' && cell.borderBottomWidth === '1px', JSON.stringify(cell));
const last = await p.evaluate(() => getComputedStyle(document.querySelector('#tdef tbody tr:last-child td')).borderBottomWidth);
t('no double line at the bottom of the body', last === '0px', last);
const hd = await st('#tdef th', ['backgroundColor', 'color', 'fontWeight']);
t('header: surface-muted, muted text, font-medium', hd.backgroundColor === await tok('var(--surface-muted)') && hd.color === await tok('var(--text-muted)', 'color') && hd.fontWeight === '500', JSON.stringify(hd));
const end = await st('#tdef td.dk-table__cell--end', ['textAlign', 'fontVariantNumeric']);
t('align="end": right-aligned, tabular digits', end.textAlign === 'end' && end.fontVariantNumeric === 'tabular-nums', JSON.stringify(end));
const sel = await p.evaluate(() => { const r = document.querySelector('#tdef [data-i="1"]'), o = document.querySelector('#tdef [data-i="0"]'); return { a: r.getAttribute('aria-selected'), o: o.getAttribute('aria-selected'), bg: getComputedStyle(r).backgroundColor, bar: getComputedStyle(r.firstElementChild).boxShadow }; });
t('selected: aria-selected, shaded, a 2px primary bar at its start; other rows aria-selected="false"', sel.a === 'true' && sel.o === 'false' && sel.bg === await tok('var(--surface-muted)') && sel.bar.endsWith('2px 0px 0px 0px inset') && sel.bar.includes(await tok('var(--primary)', 'color')), JSON.stringify(sel));
const h0 = await st('#tdef [data-i="2"]', ['backgroundColor']);
await p.hover('#tdef [data-i="2"] td');
const h1 = await st('#tdef [data-i="2"]', ['backgroundColor']);
await p.mouse.move(0, 0);
t('a body row shades on hover', h0.backgroundColor === 'rgba(0, 0, 0, 0)' && h1.backgroundColor === await tok('var(--surface-muted)'), JSON.stringify([h0, h1]));
const ft = await st('#tdef tfoot td', ['borderTopWidth', 'fontWeight']);
t('footer: a line above, font-medium', ft.borderTopWidth === '1px' && ft.fontWeight === '500', JSON.stringify(ft));
const sm = await p.evaluate(() => { const r = [...document.querySelectorAll('#tsm tbody tr')].map((x) => getComputedStyle(x).backgroundColor); return { pad: getComputedStyle(document.querySelector('#tsm td')).paddingTop, r, aria: document.querySelector('#tsm tbody tr').hasAttribute('aria-selected') }; });
t('size sm: 8px top and bottom; striped: every other row shaded; no aria-selected without selected', sm.pad === '8px' && sm.r[0] === 'rgba(0, 0, 0, 0)' && sm.r[1] === await tok('var(--surface-muted)') && sm.r[2] === 'rgba(0, 0, 0, 0)' && !sm.aria, JSON.stringify(sm));
await p.hover('#tsm tbody tr:first-child td');
t('striped rows don\'t change on hover', (await st('#tsm tbody tr', ['backgroundColor'])).backgroundColor === 'rgba(0, 0, 0, 0)');
const order = () => p.evaluate(() => [...document.querySelectorAll('#tsort tbody tr td:first-child')].map((x) => x.textContent).join());
const s0 = await p.evaluate(() => { const th = document.getElementById('hsort'), b = th.querySelector('button'); return { sort: th.getAttribute('aria-sort'), btn: b && b.type, name: b && b.textContent, cap: document.querySelector('#tsort caption').getBoundingClientRect().width }; });
t('sortable header: a button inside the th, no aria-sort until sorted; a hidden caption still names the table', s0.sort === null && s0.btn === 'button' && s0.name === 'Callsunfold_more' && s0.cap <= 1, JSON.stringify(s0));
await p.focus('#hsort button'); await p.keyboard.press('Enter');
const s1 = [await p.evaluate(() => document.getElementById('hsort').getAttribute('aria-sort')), await order(), await p.evaluate(() => document.querySelector('#hsort .dk-icon').textContent)];
await p.keyboard.press('Space');
const s2 = [await p.evaluate(() => document.getElementById('hsort').getAttribute('aria-sort')), await order(), await p.evaluate(() => document.querySelector('#hsort .dk-icon').textContent)];
t('pressing it calls onSort: aria-sort and the arrow follow the order', s1.join('|') === 'ascending|Grace,Linus,Ada|arrow_upward' && s2.join('|') === 'descending|Ada,Linus,Grace|arrow_downward', JSON.stringify([s1, s2]));
const sb = await p.evaluate(() => { const b = document.querySelector('#hsort button'), r = b.getBoundingClientRect(), th = b.parentElement.getBoundingClientRect(), s = getComputedStyle(b); return { full: Math.round(r.width) === Math.round(th.width), just: s.justifyContent, outline: s.outlineStyle }; });
t('the sort button fills the header, lines up with align="end", and shows a focus ring', sb.full && sb.just === 'flex-end' && sb.outline === 'solid', JSON.stringify(sb));
const wide = await p.evaluate(() => { const f = document.getElementById('twide').parentElement, c = document.querySelector('#twide caption'); return { tab: f.getAttribute('tabindex'), role: f.getAttribute('role'), lab: f.getAttribute('aria-labelledby') === c.id, scrolls: f.scrollWidth > f.clientWidth }; });
t('a table too wide for its frame scrolls, and the frame becomes a focusable region named by the caption', wide.tab === '0' && wide.role === 'region' && wide.lab && wide.scrolls, JSON.stringify(wide));
await p.evaluate(() => { const f = document.getElementById('tsticky').parentElement; f.scrollTop = 80; });
await p.waitForTimeout(50);
const sk = await p.evaluate(() => { const f = document.getElementById('tsticky').parentElement, th = f.querySelector('th'); return { d: Math.round(th.getBoundingClientRect().top - f.getBoundingClientRect().top), pos: getComputedStyle(th).position, label: f.getAttribute('aria-label'), tab: f.getAttribute('tabindex') }; });
t('stickyHeader: the header stays at the top while the frame scrolls; the region takes its name from containerProps', sk.pos === 'sticky' && sk.d <= 1 && sk.label === 'Sticky' && sk.tab === '0', JSON.stringify(sk));
const bad = await p.evaluate(() => [document.getElementById('tbad').parentElement.className, document.querySelector('#tbad td').className].join('|'));
t('unknown size and align fall back to md and start', bad === 'dk-table|dk-table__cell', bad);
const tk = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('#ttok th')); return [c.backgroundColor, c.paddingLeft].join(); });
t('Table tokens (--table-header-bg, --table-padding-x) override one table', tk === 'rgb(1, 2, 3),20px', tk);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (prop, v) => { const d = document.createElement('div'); d.style[prop] = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d)[prop === 'background' ? 'backgroundColor' : 'color']); d.remove(); return c; };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const surf = col('background', 'var(--surface)'), muted = col('background', 'var(--surface-muted)');
    const text = rgb(getComputedStyle(document.querySelector('#tdef td')).color), mt = rgb(getComputedStyle(document.querySelector('#tdef td .dk-text')).color), head = rgb(getComputedStyle(document.querySelector('#tdef th')).color);
    for (const [name, fg, bg] of [['text', text, surf], ['muted text', mt, surf], ['text on a shaded row', text, muted], ['muted text on a shaded row', mt, muted], ['header', head, muted]]) {
      const r = ratio(fg, bg); n++;
      if (r < 4.5) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
    const bar = ratio(col('color', 'var(--primary)'), muted); n++;
    if (bar < 3) low.push(`${th} selected bar: ${bar.toFixed(2)}`);
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: text and muted text on plain, hovered, striped and selected rows, and the header, keep 4.5:1; the selected bar 3:1; all six themes', contrast.low.length === 0 && contrast.n === 36, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Table', R) ? 0 : 1);

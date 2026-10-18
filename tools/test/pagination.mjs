// Pagination: the page range, nav landmark, current page, arrows at the ends, controlled and uncontrolled,
// links with getHref, keyboard, sizes, RTL, contrast in every theme and component tokens.
//   node tools/test/pagination.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px"></div>
<script>
var D = window.Serupa, h = React.createElement;
window.calls = [];
function Controlled() {
  var s = React.useState(5);
  return h(D.Pagination, { id: 'pc', count: 10, page: s[0], onPageChange: function (n) { window.calls.push(n); s[1](n); } });
}
function App() {
  return h('div', null,
    h(D.Pagination, { id: 'pdef', count: 10, ref: window.pr = React.createRef(), className: 'extra', 'data-x': 'y' }),
    h(Controlled),
    h(D.Pagination, { id: 'pfixed', count: 10, page: 3, onPageChange: function (n) { window.calls.push('fixed' + n); } }),
    h(D.Pagination, { id: 'plink', count: 20, defaultPage: 20, getHref: function (n) { return '#page-' + n; }, previousLabel: 'Newer', nextLabel: 'Older', pageLabel: function (n) { return 'Go to ' + n; }, 'aria-label': 'Results' }),
    h(D.Pagination, { id: 'psm', count: 3, size: 'sm' }),
    h(D.Pagination, { id: 'pbad', count: -4, defaultPage: 99, size: 'xl', siblings: -1 }),
    h('div', { dir: 'rtl' }, h(D.Pagination, { id: 'prtl', count: 3 })),
    h(D.Pagination, { id: 'ptok', count: 3, style: { '--pagination-current-bg': 'rgb(1, 2, 3)', '--pagination-size': '40px' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('pagination.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const shown = (sel) => p.evaluate((s) => [...document.querySelectorAll(s + ' li')].map((li) => { const e = li.firstElementChild; if (!e) return li.textContent; if (e.classList.contains('dk-pagination__arrow')) return e.disabled || e.getAttribute('aria-disabled') ? '(' + (li.previousElementSibling ? '>' : '<') + ')' : (li.previousElementSibling ? '>' : '<'); return e.getAttribute('aria-current') ? '[' + e.textContent + ']' : e.textContent; }).join(' '), sel);

const range = await p.evaluate(() => { const r = window.Serupa.paginationRange; const f = (a) => a.map((x) => typeof x === 'number' ? x : '…').join(' '); return [f(r(1, 10)), f(r(5, 10)), f(r(10, 10)), f(r(4, 10)), f(r(1, 5)), f(r(2, 1)), f(r(1, 0)), f(r(10, 20, 2, 2))]; });
t('paginationRange: boundaries, siblings and … keep seven slots; short ranges show every page', range.join(' | ') === '1 2 3 4 5 … 10 | 1 … 4 5 6 … 10 | 1 … 6 7 8 9 10 | 1 2 3 4 5 … 10 | 1 2 3 4 5 | 1 |  | 1 2 … 8 9 10 11 12 … 19 20', range.join(' | '));
const pd = await p.evaluate(() => { const n = document.getElementById('pdef'); return { tag: n.tagName, label: n.getAttribute('aria-label'), cls: n.className, comp: n.dataset.component, ref: window.pr.current === n, x: n.dataset.x, list: n.firstElementChild.tagName }; });
t('Pagination: a <nav aria-label="Pagination"> with a list; ref, className and props reach the nav', pd.tag === 'NAV' && pd.label === 'Pagination' && pd.cls === 'dk-pagination extra' && pd.comp === 'pagination' && pd.ref && pd.x === 'y' && pd.list === 'UL', JSON.stringify(pd));
t('uncontrolled: starts on page 1, previous disabled', (await shown('#pdef')) === '(<) [1] 2 3 4 5 … 10 >', await shown('#pdef'));
const names = await p.evaluate(() => [...document.querySelectorAll('#pdef button')].map((b) => b.getAttribute('aria-label')).join());
t('buttons are named: "Previous page", "Page 1"…, "Next page"; the ellipsis is hidden', names === 'Previous page,Page 1,Page 2,Page 3,Page 4,Page 5,Page 10,Next page' && await p.evaluate(() => document.querySelector('#pdef .dk-pagination__ellipsis').getAttribute('aria-hidden') === 'true'), names);
await p.click('#pdef [aria-label="Page 5"]');
t('clicking a page moves there', (await shown('#pdef')) === '< 1 … 4 [5] 6 … 10 >', await shown('#pdef'));
await p.click('#pdef [aria-label="Next page"]'); await p.click('#pdef [aria-label="Next page"]');
t('next moves one page on', (await shown('#pdef')) === '< 1 … 6 [7] 8 9 10 >', await shown('#pdef'));
await p.click('#pc [aria-label="Previous page"]');
t('controlled: onPageChange gets the page, the parent sets it', (await shown('#pc')) === '< 1 2 3 [4] 5 … 10 >' && (await p.evaluate(() => window.calls.join())) === '4', await p.evaluate(() => window.calls.join()));
await p.click('#pc [aria-current]');
t('clicking the current page does nothing', (await p.evaluate(() => window.calls.join())) === '4');
await p.click('#pfixed [aria-label="Page 4"]');
t('controlled without updating: it stays on its page', (await shown('#pfixed')) === '< 1 2 [3] 4 5 … 10 >' && (await p.evaluate(() => window.calls.join())) === '4,fixed4');
const pl = await p.evaluate(() => { const n = document.getElementById('plink'); return { label: n.getAttribute('aria-label'), links: [...n.querySelectorAll('a')].map((a) => [a.getAttribute('aria-label'), a.getAttribute('href'), a.getAttribute('aria-disabled'), a.getAttribute('rel')].join(':')).join(' ') }; });
t('getHref: pages are links; the next link at the end has no href and aria-disabled; rel prev/next; labels are yours', pl.label === 'Results' && pl.links === 'Newer:#page-19::prev Go to 1:#page-1:: Go to 16:#page-16:: Go to 17:#page-17:: Go to 18:#page-18:: Go to 19:#page-19:: Go to 20:#page-20:: Older::true:next', pl.links);
await p.click('#plink [aria-label="Go to 18"]');
t('a link click follows the link and moves the page', (await p.evaluate(() => location.hash)) === '#page-18' && (await shown('#plink')).includes('[18]'), await shown('#plink'));
await p.focus('#psm [aria-label="Page 1"]'); await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
t('keyboard: Tab to a page and Enter picks it', (await shown('#psm')) === '< 1 [2] 3 >', await shown('#psm'));
const fr = await st('#psm [aria-label="Page 3"]', ['outlineStyle']); await p.keyboard.press('Tab');
const fr2 = await st('#psm [aria-label="Page 3"]', ['outlineStyle', 'outlineWidth']);
t('keyboard focus: a 2px ring', fr.outlineStyle === 'none' && fr2.outlineStyle === 'solid' && fr2.outlineWidth === '2px', JSON.stringify(fr2));
const sz = await p.evaluate(() => ['#pdef', '#psm'].map((s) => { const r = document.querySelector(s + ' [aria-label="Page 1"]').getBoundingClientRect(); return r.width + 'x' + r.height; }).join());
t('size md is 32px square, sm 24px', sz === '32x32,24x24', sz);
const cur = await st('#pdef [aria-current]', ['backgroundColor', 'color', 'fontWeight']);
const want = await p.evaluate(() => { const d = document.createElement('div'); d.style.background = 'var(--primary)'; d.style.color = 'var(--on-primary)'; document.body.appendChild(d); const c = getComputedStyle(d); const o = [c.backgroundColor, c.color]; d.remove(); return o; });
t('the current page: primary, on-primary text, semibold', cur.backgroundColor === want[0] && cur.color === want[1] && cur.fontWeight === '600', JSON.stringify(cur));
const dis = await st('#pbad [aria-label="Previous page"]', ['opacity', 'cursor']);
t('arrows with nowhere to go fade to 50%', dis.opacity === '0.5' && dis.cursor === 'not-allowed', JSON.stringify(dis));
const bad = await shown('#pbad');
t('a bad count, page, size and siblings fall back: no pages, both arrows disabled', bad === '(<) (>)' && await p.evaluate(() => document.getElementById('pbad').className === 'dk-pagination'), bad);
const rtl = await p.evaluate(() => [...document.querySelectorAll('#prtl .dk-pagination__arrow')].map((a) => [...a.querySelectorAll('.dk-icon')].filter((i) => getComputedStyle(i).display !== 'none').map((i) => i.dataset.icon).join()).join());
t('right to left: the arrows point the other way', rtl === 'chevron_right,chevron_left', rtl);
const tk = await p.evaluate(() => { const e = document.querySelector('#ptok [aria-current]'), r = e.getBoundingClientRect(); return [getComputedStyle(e).backgroundColor, r.height].join(); });
t('Pagination tokens (--pagination-current-bg, --pagination-size) override one pagination', tk === 'rgb(1, 2, 3),40', tk);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const bg = rgb(getComputedStyle(d).backgroundColor);
    d.style.background = 'var(--secondary)'; const hov = rgb(getComputedStyle(d).backgroundColor); d.remove();
    const page = document.querySelector('#pdef [aria-label="Page 1"]'), cur = document.querySelector('#pdef [aria-current]'), ell = document.querySelector('#pdef .dk-pagination__ellipsis');
    for (const [name, fg, b2] of [['page', rgb(getComputedStyle(page).color), bg], ['page on hover', rgb(getComputedStyle(page).color), hov], ['current', rgb(getComputedStyle(cur).color), rgb(getComputedStyle(cur).backgroundColor)], ['ellipsis', rgb(getComputedStyle(ell).color), bg]]) {
      const r = ratio(fg, b2); n++;
      if (r < 4.5) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: pages (also on hover), the current page and the ellipsis keep 4.5:1 in all six themes', contrast.low.length === 0 && contrast.n === 24, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Pagination', R) ? 0 : 1);

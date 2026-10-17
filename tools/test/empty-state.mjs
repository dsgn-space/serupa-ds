// EmptyState: structure (icon hidden, heading, description, actions), centering, sizes, dashed frame, custom
// illustrations, heading levels, contrast in every theme and component tokens.
//   node tools/test/empty-state.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;width:600px;display:flex;flex-direction:column;gap:16px"></div>
<script>
var D = window.Serupa, h = React.createElement, E = D.EmptyState;
function App() {
  return h(React.Fragment, null,
    h(E, { id: 'edef', ref: window.er = React.createRef(), className: 'extra', 'data-x': 'y', icon: 'folder_open', title: 'No projects yet', description: 'Create a project to start tracking your work.', actions: [h(D.Button, { key: 'n', id: 'act' }, 'New project'), h(D.Button, { key: 'i', variant: 'outline' }, 'Import')] }),
    h(E, { id: 'esm', size: 'sm', variant: 'dashed', icon: 'search_off', title: 'No results', headingLevel: 4 }),
    h(E, { id: 'ecustom', icon: h('svg', { width: 80, height: 60, id: 'art' }), title: 'Custom art' }),
    h(E, { id: 'ebad', size: 'xl', variant: 'boxed', headingLevel: 9, title: 'Bad' }),
    h(E, { id: 'etok', title: 'T', icon: 'inbox', style: { '--empty-state-icon-box': '64px', '--empty-state-title-color': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('empty-state.html', APP, { react: true }));
await p.waitForTimeout(300);

const d = await p.evaluate(() => { const e = document.getElementById('edef'), i = e.querySelector('.dk-empty-state__icon'), ti = e.querySelector('.dk-empty-state__title'), de = e.querySelector('.dk-empty-state__description'), s = getComputedStyle(e), ir = i.getBoundingClientRect(), er = e.getBoundingClientRect(); return { cls: e.className, comp: e.dataset.component, ref: window.er.current === e, x: e.dataset.x, pad: s.paddingTop, ta: s.textAlign, ih: i.getAttribute('aria-hidden'), iw: ir.width + 'x' + ir.height, ir: getComputedStyle(i).borderRadius, isz: getComputedStyle(i.querySelector('.dk-icon')).fontSize, center: Math.round((ir.left + ir.right) / 2 - (er.left + er.right) / 2), h: ti.tagName, tfs: getComputedStyle(ti).fontSize, tfw: getComputedStyle(ti).fontWeight, dtag: de.tagName, dfs: getComputedStyle(de).fontSize, dmw: getComputedStyle(e.querySelector('.dk-empty-state__text')).maxWidth, acts: e.querySelectorAll('.dk-empty-state__actions button').length }; });
t('EmptyState: centered, 48px padding; ref, className and props reach it', d.cls === 'dk-empty-state extra' && d.comp === 'empty-state' && d.ref && d.x === 'y' && d.pad === '48px' && d.ta === 'center' && Math.abs(d.center) <= 1, JSON.stringify(d));
t('a 24px icon in a 48px circle, hidden from screen readers', d.ih === 'true' && d.iw === '48x48' && d.ir === '9999px' && d.isz === '24px', JSON.stringify(d));
t('an <h3> title (text-base, font-semibold), a <p> description (text-sm, at most 384px), then the actions', d.h === 'H3' && d.tfs === '16px' && d.tfw === '600' && d.dtag === 'P' && d.dfs === '14px' && d.dmw === '384px' && d.acts === 2, JSON.stringify(d));
const order = await p.evaluate(() => ['.dk-empty-state__icon', '.dk-empty-state__title', '.dk-empty-state__description', '.dk-empty-state__actions'].map((s) => Math.round(document.querySelector('#edef ' + s).getBoundingClientRect().top)));
t('icon, title, description and actions stack in that order, 16px apart', order[0] < order[1] && order[1] < order[2] && order[2] < order[3] && order[1] - (order[0] + 48) === 16, order.join());
const sm = await p.evaluate(() => { const e = document.getElementById('esm'), s = getComputedStyle(e), i = e.querySelector('.dk-empty-state__icon').getBoundingClientRect(); return { pad: s.paddingTop, bs: s.borderTopStyle, bw: s.borderTopWidth, r: s.borderTopLeftRadius, ib: i.width, h: e.querySelector('.dk-empty-state__title').tagName, tfs: getComputedStyle(e.querySelector('.dk-empty-state__title')).fontSize, desc: !!e.querySelector('.dk-empty-state__description'), acts: !!e.querySelector('.dk-empty-state__actions') }; });
t('size sm, dashed, headingLevel 4: 24px padding, a 40px circle, text-sm title, a 1px dashed frame with 8px corners; nothing for missing parts', sm.pad === '24px' && sm.ib === 40 && sm.tfs === '14px' && sm.bs === 'dashed' && sm.bw === '1px' && sm.r === '8px' && sm.h === 'H4' && !sm.desc && !sm.acts, JSON.stringify(sm));
const cu = await p.evaluate(() => { const i = document.querySelector('#ecustom .dk-empty-state__icon'), r = i.getBoundingClientRect(); return [r.width, r.height, getComputedStyle(i).backgroundColor].join(); });
t('an element as the icon (an illustration) shows at its own size, without the circle', cu === '80,60,rgba(0, 0, 0, 0)', cu);
const bad = await p.evaluate(() => { const e = document.getElementById('ebad'); return [e.className, e.querySelector('h3') !== null, e.querySelector('.dk-empty-state__icon') === null].join(); });
t('unknown size, variant and headingLevel fall back to md, plain and h3; no icon when none is given', bad === 'dk-empty-state,true,true', bad);
const tk = await p.evaluate(() => { const e = document.getElementById('etok'); return [e.querySelector('.dk-empty-state__icon').getBoundingClientRect().width, getComputedStyle(e.querySelector('.dk-empty-state__title')).color].join(); });
t('EmptyState tokens (--empty-state-icon-box, --empty-state-title-color) override one empty state', tk === '64,rgb(1, 2, 3)', tk);
await p.focus('#act');
t('the actions are reachable with the keyboard', (await p.evaluate(() => document.activeElement.id)) === 'act');

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const bg = rgb(getComputedStyle(d).backgroundColor); d.remove();
    const e = document.getElementById('edef'), i = e.querySelector('.dk-empty-state__icon');
    for (const [name, fg, b2, min] of [['title', rgb(getComputedStyle(e.querySelector('.dk-empty-state__title')).color), bg, 4.5], ['description', rgb(getComputedStyle(e.querySelector('.dk-empty-state__description')).color), bg, 4.5], ['icon on its circle', rgb(getComputedStyle(i).color), rgb(getComputedStyle(i).backgroundColor), 3]]) {
      const r = ratio(fg, b2); n++;
      if (r < min) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: title and description 4.5:1 on surface, the icon 3:1 on its circle, in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('EmptyState', R) ? 0 : 1);

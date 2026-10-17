// List: ul/ol, plain and card, dividers, item layout (leading, title, description, trailing), link and button
// items with actions kept outside, router links, selected and disabled, keyboard, contrast in every theme, tokens.
//   node tools/test/list.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;width:420px;display:flex;flex-direction:column;gap:16px"></div>
<script>
var D = window.Diki, h = React.createElement, I = D.ListItem;
window.clicks = [];
var RouterLink = React.forwardRef(function (p, ref) { return h('a', Object.assign({}, p, { ref: ref, href: '#router' + p.to, 'data-router': '' })); });
function App() {
  return h(React.Fragment, null,
    h(D.List, { id: 'ldef', ref: window.lr = React.createRef(), className: 'extra', 'aria-label': 'People' },
      h(I, { id: 'iada', ref: window.ir = React.createRef(), title: 'Ada Lovelace', description: 'ada@example.com', leading: h(D.Avatar, { name: 'Ada Lovelace', size: 'sm' }), trailing: h(D.Badge, null, 'Admin') }),
      h(I, { id: 'iicon', title: 'Report.pdf', description: '2 MB', leading: 'description' }),
      h(I, { id: 'ionly', title: 'Just a title' })),
    h(D.List, { id: 'lcard', variant: 'card', as: 'ol' },
      h(I, { id: 'ilink', href: '#files', title: 'Files', description: 'All your files', leading: 'folder', trailing: h(D.IconButton, { icon: 'more_horiz', label: 'More', id: 'more', onClick: function () { window.clicks.push('more'); } }) }),
      h(I, { id: 'ibtn', title: 'Open settings', onClick: function () { window.clicks.push('btn'); }, selected: false }),
      h(I, { id: 'isel', href: '#sel', title: 'Selected', selected: true }),
      h(I, { id: 'irouter', as: RouterLink, linkProps: { to: '/team' }, title: 'Team' }),
      h(I, { id: 'idis', href: '#dis', title: 'Disabled', disabled: true })),
    h(D.List, { id: 'lnodiv', divided: false, variant: 'boxed', as: 'table' }, h(I, { title: 'A' }), h(I, { title: 'B' })),
    h(D.List, { id: 'ltok', style: { '--list-padding-y': '5px', '--list-title': 'rgb(1, 2, 3)' } }, h(I, { title: 'T' })));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('list.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const tok = (v, prop = 'backgroundColor') => p.evaluate(([v, prop]) => { const d = document.createElement('div'); d.style[prop === 'color' ? 'color' : 'background'] = v; document.body.appendChild(d); const c = getComputedStyle(d)[prop]; d.remove(); return c; }, [v, prop]);

const ld = await p.evaluate(() => { const l = document.getElementById('ldef'); return { tag: l.tagName, cls: l.className, comp: l.dataset.component, ref: window.lr.current === l, iref: window.ir.current && window.ir.current.tagName, label: l.getAttribute('aria-label'), ls: getComputedStyle(l).listStyleType, pad: getComputedStyle(l).paddingLeft }; });
t('List: a <ul> without bullets or padding; ref, className and props reach it; ListItem is an <li>', ld.tag === 'UL' && ld.cls === 'dk-list dk-list--divided extra' && ld.comp === 'list' && ld.ref && ld.iref === 'LI' && ld.label === 'People' && ld.ls === 'none' && ld.pad === '0px', JSON.stringify(ld));
const it = await p.evaluate(() => { const li = document.getElementById('iada'), m = li.querySelector('.dk-list__main'), tt = li.querySelector('.dk-list__title'), d = li.querySelector('.dk-list__description'), tr = li.querySelector('.dk-list__trailing'), r = li.getBoundingClientRect(); return { main: m.tagName, pad: getComputedStyle(m).paddingTop + ' ' + getComputedStyle(m).paddingLeft, tfs: getComputedStyle(tt).fontSize, tfw: getComputedStyle(tt).fontWeight, dfs: getComputedStyle(d).fontSize, avatar: !!li.querySelector('.dk-list__leading .dk-avatar'), trEnd: Math.round(r.right - tr.getBoundingClientRect().right), order: [li.querySelector('.dk-list__leading'), tt, tr].map((e) => Math.round(e.getBoundingClientRect().left)) }; });
t('an item: leading avatar, a text-sm font-medium title over a text-sm description, trailing meta at the end; 12px padding', it.main === 'DIV' && it.pad === '12px 12px' && it.tfs === '14px' && it.tfw === '500' && it.dfs === '14px' && it.avatar && it.trEnd === 12 && it.order[0] < it.order[1] && it.order[1] < it.order[2], JSON.stringify(it));
const lines = await p.evaluate(() => [...document.querySelectorAll('#ldef > li')].map((li) => getComputedStyle(li).borderTopWidth).join());
t('divided: a 1px line between items, none above the first', lines === '0px,1px,1px', lines);
const ic = await p.evaluate(() => { const i = document.querySelector('#iicon .dk-list__leading .dk-icon'); return i && [i.textContent, getComputedStyle(i).fontSize].join(); });
t('an icon name as leading: a 20px muted icon', ic === 'description,20px', ic);
const card = await p.evaluate(() => { const l = document.getElementById('lcard'), s = getComputedStyle(l); return { tag: l.tagName, b: s.borderTopWidth, r: s.borderTopLeftRadius, pad: getComputedStyle(l.querySelector('.dk-list__main')).paddingLeft }; });
t('variant card, as ol: a bordered frame with 8px corners and 16px side padding', card.tag === 'OL' && card.b === '1px' && card.r === '8px' && card.pad === '16px', JSON.stringify(card));
const lk = await p.evaluate(() => { const li = document.getElementById('ilink'), m = li.querySelector('.dk-list__main'), more = document.getElementById('more'); return { tag: m.tagName, href: m.getAttribute('href'), moreInside: m.contains(more), title: m.textContent }; });
t('href: the main area is a link; trailing actions stay outside it (no nested controls)', lk.tag === 'A' && lk.href === '#files' && !lk.moreInside && lk.title === 'folderFilesAll your files', JSON.stringify(lk));
const h0 = await st('#ilink', ['backgroundColor']);
await p.hover('#ilink .dk-list__title'); const h1 = await st('#ilink', ['backgroundColor']);
await p.hover('#iada'); const h2 = await st('#iada', ['backgroundColor']);
t('link and button items shade on hover; static items don\'t', h0.backgroundColor === 'rgba(0, 0, 0, 0)' && h1.backgroundColor === await tok('var(--surface-muted)') && h2.backgroundColor === 'rgba(0, 0, 0, 0)', JSON.stringify([h0, h1, h2]));
await p.click('#more');
await p.click('#ilink .dk-list__title');
t('clicking the trailing action doesn\'t follow the link; clicking the row does', (await p.evaluate(() => [window.clicks.join(), location.hash].join('|'))) === 'more|#files');
const bt = await p.evaluate(() => { const m = document.querySelector('#ibtn .dk-list__main'); return [m.tagName, m.type, m.getAttribute('aria-pressed')].join(); });
await p.focus('#ibtn .dk-list__main'); await p.keyboard.press('Enter');
t('onClick: the main area is a button (aria-pressed with selected), and Enter presses it', bt === 'BUTTON,button,false' && (await p.evaluate(() => window.clicks.join())) === 'more,btn', bt);
// After the mouse clicks above, focus set by script isn't :focus-visible in Firefox and WebKit; arrive by Tab like a keyboard user.
await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
const fr = { ...(await st('#ibtn .dk-list__main', ['outlineStyle', 'outlineWidth'])), active: await p.evaluate(() => document.activeElement === document.querySelector('#ibtn .dk-list__main')) };
t('keyboard focus: a 2px ring inside the row', fr.active && fr.outlineStyle === 'solid' && fr.outlineWidth === '2px', JSON.stringify(fr));
const sel = await p.evaluate(() => { const li = document.getElementById('isel'), s = getComputedStyle(li); return { cur: li.querySelector('a').getAttribute('aria-current'), bg: s.backgroundColor, sh: s.boxShadow }; });
t('selected: aria-current, shaded, a 2px primary bar at the start', sel.cur === 'true' && sel.bg === await tok('var(--surface-muted)') && sel.sh.endsWith('2px 0px 0px 0px inset') && sel.sh.includes(await tok('var(--primary)', 'color')), JSON.stringify(sel));
const rt = await p.evaluate(() => { const a = document.querySelector('#irouter .dk-list__main'); return [a.hasAttribute('data-router'), a.getAttribute('href'), a.className].join(); });
t('as with linkProps: a router link', rt === 'true,#router/team,dk-list__main', rt);
const ds = await p.evaluate(() => { const a = document.querySelector('#idis .dk-list__main'); return [a.getAttribute('href'), a.getAttribute('aria-disabled'), a.tabIndex, getComputedStyle(a).opacity].join(); });
await p.click('#idis .dk-list__title');
t('disabled: no href, aria-disabled, out of the tab order, dimmed, clicks do nothing', ds === ',true,-1,0.5' && (await p.evaluate(() => location.hash)) === '#files', ds);
const nd = await p.evaluate(() => { const l = document.getElementById('lnodiv'); return [l.tagName, l.className, getComputedStyle(l.children[1]).borderTopWidth].join(); });
t('divided={false}: no lines; unknown variant and as fall back to plain and ul', nd === 'UL,dk-list,0px', nd);
const tk = await p.evaluate(() => { const li = document.querySelector('#ltok li'); return [getComputedStyle(li.querySelector('.dk-list__main')).paddingTop, getComputedStyle(li.querySelector('.dk-list__title')).color].join(); });
t('List tokens (--list-padding-y, --list-title) override one list', tk === '5px,rgb(1, 2, 3)', tk);

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const col = (v) => { const d = document.createElement('div'); d.style.background = v; document.body.appendChild(d); const c = rgb(getComputedStyle(d).backgroundColor); d.remove(); return c; };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const surf = col('var(--surface)'), sh = col('var(--surface-muted)');
    const title = rgb(getComputedStyle(document.querySelector('#iada .dk-list__title')).color), desc = rgb(getComputedStyle(document.querySelector('#iada .dk-list__description')).color);
    for (const [name, fg, bg, min] of [['title', title, surf, 4.5], ['description', desc, surf, 4.5], ['title on a shaded row', title, sh, 4.5], ['description on a shaded row', desc, sh, 4.5], ['selected bar', col('var(--primary)'), sh, 3]]) {
      const r = ratio(fg, bg); n++;
      if (r < min) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: titles and descriptions keep 4.5:1 on plain and shaded rows, the selected bar 3:1, in all six themes', contrast.low.length === 0 && contrast.n === 30, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('List', R) ? 0 : 1);

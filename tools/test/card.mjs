// Card: elements, variants, padding, parts, the linked card (hover, focus, rel), contrast in every theme,
// component tokens, forced colors and reduced motion.
//   node tools/test/card.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:flex;flex-direction:column;gap:16px;max-width:480px"></div>
<script>
var D = window.Diki, h = React.createElement;
function Parts(p) { return [h(D.CardHeader, { key: 'h', title: 'Team plan', description: 'Up to 10 members', action: h(D.Badge, null, 'Active') }), h(D.CardBody, { key: 'b' }, 'Body text'), h(D.CardFooter, { key: 'f' }, h(D.Button, null, 'Go'))]; }
function App() {
  return h(React.Fragment, null,
    h(D.Card, { id: 'def', ref: window.r = React.createRef(), className: 'extra', 'data-x': 'y' }, Parts()),
    h(D.Card, { id: 'el', variant: 'elevated' }, Parts()),
    h(D.Card, { id: 'fi', variant: 'filled' }, Parts()),
    h(D.Card, { id: 'bad', variant: 'glow', padding: 'xl', as: 'span' }, 'Bad'),
    h(D.Card, { id: 'sm', padding: 'sm' }, 'S'), h(D.Card, { id: 'lg', padding: 'lg' }, 'L'), h(D.Card, { id: 'none', padding: 'none' }, 'N'),
    h(D.Card, { id: 'art', as: 'article' }, h(D.CardHeader, { title: 'Level 2', headingLevel: 2 })),
    h('ul', { style: { listStyle: 'none', margin: 0, padding: 0 } }, h(D.Card, { id: 'li', as: 'li' }, 'Item')),
    h(D.Card, { id: 'lnk', href: '#here' }, h(D.CardHeader, { title: 'Atlas', description: 'Updated' })),
    h(D.Card, { id: 'blank', href: '#x', target: '_blank' }, 'Out'),
    h(D.Card, { id: 'bare' }, h(D.CardHeader, { title: 'Only a title', description: '' })),
    h(D.Card, { id: 'kids' }, h(D.CardHeader, { title: 'T' }, h('span', { id: 'extra' }, 'More'))),
    h(D.Card, { id: 'jst' }, h(D.CardFooter, { justify: 'start' }, 'a'), h(D.CardFooter, { justify: 'between' }, 'b'), h(D.CardFooter, { justify: 'up' }, 'c')),
    h(D.Card, { id: 'tok', style: { '--card-bg': 'rgb(1, 2, 3)', '--card-radius': '3px', '--card-padding-md': '7px' } }, 'Tokens'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('card.html', APP, { react: true }));
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);

const d = await p.evaluate(() => { const e = document.getElementById('def'); return { tag: e.tagName, cls: e.className, data: [e.dataset.component, e.dataset.variant].join(), ref: window.r.current === e, x: e.dataset.x, parts: [...e.children].map((c) => c.className).join(' | '), h: e.querySelector('.dk-card__title').tagName, desc: e.querySelector('.dk-card__description').tagName, action: !!e.querySelector('.dk-card__header > .dk-card__action .dk-badge') }; });
t('defaults: a <div> card (outline, padding md) with header, body and footer; ref, className and other props reach it', d.tag === 'DIV' && d.cls === 'dk-card extra' && d.data === 'card,outline' && d.ref && d.x === 'y' && d.parts === 'dk-card__header | dk-card__body | dk-card__footer' && d.h === 'H3' && d.desc === 'P' && d.action, JSON.stringify(d));
const bad = await p.evaluate(() => { const e = document.getElementById('bad'); return [e.tagName, e.className, e.dataset.variant]; });
t('unknown variant, padding and element fall back to outline, md and <div>', bad.join() === 'DIV,dk-card,outline', bad.join());
const tags = await p.evaluate(() => [document.getElementById('art').tagName, document.getElementById('li').tagName, document.querySelector('#art .dk-card__title').tagName]);
t('as article and li; headingLevel sets the title\'s heading', tags.join() === 'ARTICLE,LI,H2', tags.join());

const def = await st('#def', ['paddingTop', 'paddingLeft', 'borderTopWidth', 'borderTopStyle', 'borderTopLeftRadius', 'boxShadow', 'rowGap', 'fontSize', 'lineHeight', 'display', 'flexDirection']);
t('outline: 20px padding, a 1px border, 12px corners, a hairline shadow, parts 16px apart, text-sm', def.paddingTop === '20px' && def.paddingLeft === '20px' && def.borderTopWidth === '1px' && def.borderTopStyle === 'solid' && def.borderTopLeftRadius === '12px' && /1px 2px/.test(def.boxShadow) && def.rowGap === '16px' && def.fontSize === '14px' && def.lineHeight === '20px' && def.display === 'flex' && def.flexDirection === 'column', JSON.stringify(def));
const el = await st('#el', ['boxShadow', 'borderTopColor', 'borderTopWidth']);
t('elevated: a raised shadow and a transparent border that keeps the size', /4px 6px -1px/.test(el.boxShadow) && el.borderTopColor === 'rgba(0, 0, 0, 0)' && el.borderTopWidth === '1px', JSON.stringify(el));
const fi = await p.evaluate(() => { const d = document.createElement('div'); d.style.background = 'var(--surface-muted)'; document.body.appendChild(d); const m = getComputedStyle(d).backgroundColor; d.remove(); const s = getComputedStyle(document.getElementById('fi')); return { bg: s.backgroundColor, m, sh: s.boxShadow, bc: s.borderTopColor }; });
t('filled: surface-muted, no shadow, a transparent border', fi.bg === fi.m && (fi.sh === 'none' || /0px 0px 0px 0px/.test(fi.sh)) && fi.bc === 'rgba(0, 0, 0, 0)', JSON.stringify(fi));
const pads = await p.evaluate(() => ['sm', 'lg', 'none'].map((id) => getComputedStyle(document.getElementById(id)).paddingTop));
t('padding sm 12px, lg 24px, none 0', pads.join() === '12px,24px,0px', pads.join());
const hd = await p.evaluate(() => { const e = document.querySelector('#def .dk-card__title'), s = getComputedStyle(e), ds = getComputedStyle(document.querySelector('#def .dk-card__description')), hh = getComputedStyle(document.querySelector('#def .dk-card__heading')); return { fs: s.fontSize, lh: s.lineHeight, fw: s.fontWeight, m: s.marginTop + s.marginBottom, dm: ds.marginTop, gap: hh.rowGap }; });
t('title: text-base, font-semibold, no margins; description 4px under it', hd.fs === '16px' && hd.lh === '24px' && hd.fw === '600' && hd.m === '0px0px' && hd.dm === '0px' && hd.gap === '4px', JSON.stringify(hd));
const bare = await p.evaluate(() => ({ desc: !!document.querySelector('#bare .dk-card__description'), action: !!document.querySelector('#bare .dk-card__action'), extra: document.getElementById('extra').parentElement.className }));
t('an empty description and no action render nothing; header children go after the description', !bare.desc && !bare.action && bare.extra === 'dk-card__heading', JSON.stringify(bare));
const jst = await p.evaluate(() => [...document.querySelectorAll('#jst .dk-card__footer')].map((f) => getComputedStyle(f).justifyContent));
t('footer: justify end (default, and for unknown values), start, between', jst.join() === 'flex-start,space-between,flex-end' && (await st('#def .dk-card__footer', ['justifyContent'])).justifyContent === 'flex-end', jst.join());

// the linked card
const ln = await p.evaluate(() => { const e = document.getElementById('lnk'), b = document.getElementById('blank'); return { tag: e.tagName, href: e.getAttribute('href'), cls: e.className, td: getComputedStyle(e).textDecorationLine, cur: getComputedStyle(e).cursor, rel: b.getAttribute('rel'), name: e.textContent }; });
t('href: the whole card is an <a> (no underline, a pointer), named by its text; target _blank adds rel="noopener noreferrer"', ln.tag === 'A' && ln.href === '#here' && /dk-card--link/.test(ln.cls) && ln.td === 'none' && ln.cur === 'pointer' && ln.rel === 'noopener noreferrer' && ln.name === 'AtlasUpdated', JSON.stringify(ln));
const before = (await st('#lnk', ['borderTopColor'])).borderTopColor;
await p.hover('#lnk'); await p.waitForTimeout(250);
const hov = await p.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--border-strong)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return [getComputedStyle(document.getElementById('lnk')).borderTopColor, c]; });
t('hover: a border-strong border', hov[0] === hov[1] && hov[0] !== before, JSON.stringify([before, hov]));
await p.mouse.move(0, 0);
await p.keyboard.press('Tab'); for (let i = 0; i < 12 && !(await p.evaluate(() => document.activeElement.id === 'lnk')); i++) await p.keyboard.press('Tab');
const fr = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return { id: document.activeElement.id, w: s.outlineWidth, st: s.outlineStyle, off: s.outlineOffset }; });
t('focus from the keyboard: a 2px focus-ring outline 2px outside', fr.id === 'lnk' && fr.w === '2px' && fr.st === 'solid' && fr.off === '2px', JSON.stringify(fr));

// component tokens
const tok = await st('#tok', ['backgroundColor', 'borderTopLeftRadius', 'paddingTop']);
t('component tokens (--card-bg, --card-radius, --card-padding-md) override one card', tok.backgroundColor === 'rgb(1, 2, 3)' && tok.borderTopLeftRadius === '3px' && tok.paddingTop === '7px', JSON.stringify(tok));

// contrast: title, description and body on every variant, in every theme
const contrast = await p.evaluate(() => {
  const rgb = (c) => { const m = c.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; };
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const over = (fg, bg) => fg[3] >= 1 ? fg : fg.map((x, i) => i < 3 ? x * fg[3] + bg[i] * (1 - fg[3]) : 1);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    for (const id of ['def', 'el', 'fi']) {
      const card = document.getElementById(id), bg = rgb(getComputedStyle(card).backgroundColor);
      for (const sel of ['.dk-card__title', '.dk-card__description', '.dk-card__body']) {
        const r = ratio(over(rgb(getComputedStyle(card.querySelector(sel)).color), bg), bg); n++;
        if (r < 4.5) low.push(`${th} ${id} ${sel}: ${r.toFixed(2)}`);
      }
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: title, description and body keep 4.5:1 on all three variants in all six themes', contrast.low.length === 0 && contrast.n === 54, contrast.low.join('; '));

t('no errors on the page', errors.length === 0, errors.join('; '));

// forced colors: every card gets a visible border
{
  const fp = await (await b.newContext({ forcedColors: 'active' })).newPage();
  await fp.goto(writePage('card-fc.html', APP, { react: true })); await fp.waitForTimeout(300);
  const fc = await fp.evaluate(() => ['def', 'el', 'fi'].map((id) => { const s = getComputedStyle(document.getElementById(id)); return s.borderTopColor !== 'rgba(0, 0, 0, 0)' && s.borderTopWidth === '1px'; }));
  t('forced colors: outline, elevated and filled cards all show a border', fc.every(Boolean), JSON.stringify(fc));
  await fp.close();
}
// reduced motion: the hover border changes at once
{
  const rp = await (await b.newContext({ reducedMotion: 'reduce' })).newPage();
  await rp.goto(writePage('card-rm.html', APP, { react: true })); await rp.waitForTimeout(300);
  const tr = await rp.evaluate(() => getComputedStyle(document.getElementById('lnk')).transitionProperty + '/' + getComputedStyle(document.getElementById('lnk')).transitionDuration);
  t('reduced motion: no transition on a linked card', /^(all\/0s|none\/0s)$/.test(tr), tr);
  await rp.close();
}

await b.close();
cleanup();
process.exit(report('Card', R) ? 0 : 1);

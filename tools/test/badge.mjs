// Badge: variants, tones (status and palette), contrast in every theme, the one size, dot, icon, count, remove,
// accessibility, nested themes and attributes.
//   node tools/test/badge.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const TONES = ['neutral', 'primary', 'success', 'warning', 'danger', 'info', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const APP = `<div id="root" style="padding:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center"></div>
<script>
var D = window.Serupa, h = React.createElement; window.removed = []; window.clicks = 0; window.warns = [];
var cw = console.warn; console.warn = function (m) { window.warns.push(String(m)); cw.apply(console, arguments); };
var TONES = ${JSON.stringify(TONES)};
function App() {
  var s = React.useState(['Design', 'Research']), tags = s[0];
  var ls = React.useState(false); window.setLoading = ls[1];
  var cs = React.useState(0); window.setCount = cs[1];
  var hit = function () { window.clicks++; };
  return h(React.Fragment, null,
    h(D.Badge, { id: 'def' }, 'Default'),
    h(D.Badge, { id: 'bad', variant: 'glow', tone: 'gold', size: 'xl' }, 'Bad'),
    h(D.Badge, { id: 'sm', size: 'md' }, 'Old size'),
    TONES.map(function (t) { return ['subtle', 'solid', 'outline'].map(function (v) { return h(D.Badge, { key: t + v, 'data-t': t, 'data-v': v, tone: t, variant: v }, t); }); }),
    TONES.map(function (t) { return ['subtle', 'solid', 'outline'].map(function (v) { return h(D.Badge, { key: 'i' + t + v, 'data-it': t, 'data-v': v, tone: t, variant: v, onClick: hit }, t); }); }),
    h(D.Badge, { id: 'btn', tone: 'primary', onClick: hit }, 'Click'),
    h(D.Badge, { id: 'sbtn', variant: 'solid', tone: 'primary', onClick: hit }, 'Solid'),
    h(D.Badge, { id: 'lnk', tone: 'info', href: '#here', target: '_blank' }, 'Link'),
    h(D.Badge, { id: 'dis', onClick: hit, disabled: true }, 'Off'),
    h(D.Badge, { id: 'mi', tone: 'violet', onClick: hit, style: { width: '160px' } }, 'Press me'),
    h(D.Badge, { id: 'mioff', onClick: hit, style: { '--badge-ripple-opacity': '0', '--badge-press-scale': '100%' } }, 'Calm'),
    h(D.Badge, { id: 'mipd', onClick: hit, onPointerDown: function (e) { e.preventDefault(); } }, 'Mine'),
    h(D.Badge, { id: 'both', onClick: hit, onRemove: function () {} }, 'Both'),
    h(D.Badge, { id: 'ld', tone: 'success', leftIcon: 'check', onClick: hit, loading: ls[0] }, 'Approve request'),
    h(D.Badge, { id: 'ldspan', loading: true, loadingText: 'Syncing' }, 'Syncing'),
    h(D.Badge, { id: 'ldrm', loading: true, onRemove: function () { window.removed.push('ldrm'); } }, 'Tag'),
    h('div', { id: 'ob' },
      h(D.Badge, { key: 1 }, 'Status'),
      h(D.Badge, { key: 2, leftIcon: 'category' }, 'Status'),
      h(D.Badge, { key: 3, dot: true }, 'Status'),
      h(D.Badge, { key: 4, onRemove: function () {} }, 'Status'),
      h(D.Badge, { key: 5, leftIcon: 'category', onRemove: function () {} }, 'Status'),
      h(D.Badge, { key: 6, count: 5 }),
      h('span', { key: 7, dir: 'rtl' }, h(D.Badge, { leftIcon: 'category' }, 'Status'))),
    h(D.Badge, { id: 'pg', dot: true, ping: true, tone: 'danger', variant: 'solid' }, 'Live'),
    h(D.Badge, { id: 'pgind', dot: true, ping: true, tone: 'success' }),
    h(D.Badge, { id: 'pgabs', dot: true, ping: true, className: 'absolute', style: { top: '0px', left: '0px' } }),
    h(D.Badge, { id: 'pgnodot', ping: true }, 'No dot'),
    h(D.Badge, { id: 'pgicon', ping: true, dot: true, leftIcon: 'check' }, 'Icon'),
    h(D.Badge, { id: 'ind', dot: true, tone: 'danger' }),
    h(D.Badge, { id: 'indsm', dot: true, variant: 'outline' }),
    h(D.Badge, { id: 'indnamed', dot: true, tone: 'success', 'aria-label': 'Online' }),
    h(D.Badge, { id: 'indclick', dot: true, onClick: hit, onRemove: function () {} }),
    h(D.Badge, { id: 'dot', tone: 'success', dot: true }, 'Online'),
    h(D.Badge, { id: 'icon', tone: 'warning', leftIcon: 'schedule', dot: true }, 'Pending'),
    h(D.Badge, { id: 'c3', tone: 'danger', variant: 'solid', count: 3 }),
    h(D.Badge, { id: 'c120', count: 120 }),
    h(D.Badge, { id: 'c12m9', count: 12, max: 9 }),
    h('span', { id: 'zero' }, h(D.Badge, { count: 0 })),
    h('span', { id: 'grow' }, h(D.Badge, { count: cs[0] })),
    h(D.Badge, { id: 'zshow', count: 0, showZero: true }),
    h(D.Badge, { id: 'ref', ref: window.r = React.createRef(), className: 'extra', 'data-x': 'y', title: 'tip' }, 'Ref'),
    h('div', { id: 'tags' }, tags.map(function (t) { return h(D.Badge, { key: t, tone: 'violet', onRemove: function () { window.removed.push(t); s[1](tags.filter(function (x) { return x !== t; })); } }, t); })),
    h(D.Badge, { id: 'rmlabel', onRemove: function () {}, removeLabel: 'Clear filter' }, 'Status: open'),
    h('div', { id: 'nest', 'data-theme': 'blue-dark', style: { background: 'var(--surface)', padding: '4px' } },
      h(D.Badge, { id: 'indark', tone: 'violet' }, 'Dark'),
      h('div', { 'data-theme': 'blue-light' }, h(D.Badge, { id: 'inlight', tone: 'violet' }, 'Light'))));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('badge.html', APP, { react: true }));
await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }, id);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);

const d = await p.evaluate(() => { const e = document.getElementById('def'); return { tag: e.tagName, cls: e.className, data: [e.dataset.component, e.dataset.variant, e.dataset.tone].join(), sizeAttr: e.hasAttribute('data-size'), label: e.querySelector('.dk-badge__label').textContent }; });
t('defaults: a <span> badge, subtle, neutral, with no size attribute or class', d.tag === 'SPAN' && d.data === 'badge,subtle,neutral' && !d.sizeAttr && !/size/.test(d.cls) && d.label === 'Default', JSON.stringify(d));
const bad = await p.evaluate(() => { const e = document.getElementById('bad'); return { v: e.dataset.variant, t: e.dataset.tone, size: e.getAttribute('size'), ds: e.dataset.size }; });
t('unknown variant and tone fall back to subtle and neutral', bad.v === 'subtle' && bad.t === 'neutral', JSON.stringify(bad));
const md = await st('#def', ['height', 'fontSize', 'lineHeight', 'fontWeight', 'borderRadius', 'paddingLeft']), old = await p.evaluate(() => { const e = document.getElementById('sm'); return { h: getComputedStyle(e).height, attr: e.getAttribute('size'), cls: e.className, warn: window.warns.some((m) => /size was removed in 4\.0\.0/.test(m)) }; });
t('one size: 20px, text-xs, font-medium, 6px side padding and corners; the removed size prop is ignored (never reaches the DOM) with a warning', md.height === '20px' && md.fontSize === '12px' && md.lineHeight === '16px' && md.fontWeight === '500' && md.borderRadius === '6px' && md.paddingLeft === '6px' && old.h === '20px' && old.attr === null && !/size/.test(old.cls) && old.warn && bad.size === null && bad.ds === undefined, JSON.stringify([md, old, bad]));
const ol = await st('[data-t="success"][data-v="outline"]', ['borderTopWidth', 'borderTopStyle', 'backgroundColor']);
t('outline: a 1px border on a transparent background', ol.borderTopWidth === '1px' && ol.borderTopStyle === 'solid' && ol.backgroundColor === 'rgba(0, 0, 0, 0)', JSON.stringify(ol));

// contrast: every tone and variant, in every theme
const contrast = await p.evaluate((tones) => {
  const rgb = (c) => { const m = c.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; };
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const over = (fg, bg) => fg[3] >= 1 ? fg : fg.map((x, i) => i < 3 ? x * fg[3] + bg[i] * (1 - fg[3]) : 1);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = [], out = {};
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const sd = document.createElement('div'); sd.style.background = 'var(--surface)'; document.body.appendChild(sd); const surface = rgb(getComputedStyle(sd).backgroundColor); sd.remove();
    for (const t of tones) for (const v of ['subtle', 'solid', 'outline']) {
      const e = document.querySelector(`[data-t="${t}"][data-v="${v}"]`), s = getComputedStyle(e);
      const bg = v === 'outline' ? surface : over(rgb(s.backgroundColor), surface), fg = over(rgb(s.color), bg);
      const r = ratio(fg, bg); out[th + ' ' + t + ' ' + v] = Math.round(r * 100) / 100;
      if (r < 4.5) low.push(`${th} ${t} ${v}: ${r.toFixed(2)}`);
      if (v === 'outline') { const bd = ratio(over(rgb(s.borderTopColor), surface), surface); if (bd < 3 && t !== 'neutral') low.push(`${th} ${t} border: ${bd.toFixed(2)}`); }
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n: Object.keys(out).length };
}, TONES);
t(`contrast: all ${TONES.length} tones × 3 variants keep 4.5:1 text (and 3:1 outline borders) in all six themes`, contrast.low.length === 0 && contrast.n === TONES.length * 3 * 6, contrast.low.slice(0, 8).join('; '));
const pal = await p.evaluate(() => ['violet', 'teal', 'amber'].map((t) => ['subtle', 'solid', 'outline'].map((v) => { const s = getComputedStyle(document.querySelector(`[data-t="${t}"][data-v="${v}"]`)); return v === 'outline' ? s.borderTopColor : s.backgroundColor; })));
t('palette tones each have their own color, and the status tones map to green, amber, red and sky', [0, 1, 2].every((k) => new Set(pal.map((x) => x[k])).size === 3) && await p.evaluate(() => getComputedStyle(document.querySelector('[data-t="success"][data-v="solid"]')).backgroundColor === getComputedStyle(document.querySelector('[data-t="green"][data-v="solid"]')).backgroundColor && getComputedStyle(document.querySelector('[data-t="warning"][data-v="subtle"]')).color === getComputedStyle(document.querySelector('[data-t="amber"][data-v="subtle"]')).color), JSON.stringify(pal));
const nest = await p.evaluate(() => [getComputedStyle(document.getElementById('indark')).backgroundColor, getComputedStyle(document.getElementById('inlight')).backgroundColor, getComputedStyle(document.querySelector('[data-t="violet"][data-v="subtle"]')).backgroundColor]);
t('palette tones follow the nearest theme: dark steps inside a dark area, light steps in a light area nested in it', nest[0] !== nest[1] && nest[1] === nest[2], JSON.stringify(nest));
const pri = await p.evaluate(() => { const e = document.querySelector('[data-t="primary"][data-v="solid"]'); const d = document.createElement('div'); d.style.background = 'var(--primary)'; document.body.appendChild(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return [getComputedStyle(e).backgroundColor, c]; });
t('tone primary uses the theme\'s primary color', pri[0] === pri[1], JSON.stringify(pri));

// extras
const dot = await p.evaluate(() => { const e = document.getElementById('dot'), d = e.querySelector('.dk-badge__dot'), bx = d.parentElement, s = getComputedStyle(d), br = bx.getBoundingClientRect(), dr = d.getBoundingClientRect(); return { first: e.firstElementChild === bx && bx.classList.contains('dk-badge__icon--dot'), box: [br.width, br.height], centered: Math.abs((dr.left + dr.width / 2) - (br.left + br.width / 2)) < 0.5 && Math.abs((dr.top + dr.height / 2) - (br.top + br.height / 2)) < 0.5, w: s.width, h: s.height, r: s.borderRadius, bg: s.backgroundColor, color: getComputedStyle(e).color, hidden: bx.getAttribute('aria-hidden') }; });
t('dot: a 6px round dot centered in a 10×12px box (as tall as an icon, 2px narrower) before the label, in the text color, hidden from screen readers', dot.first && dot.box[0] === 10 && dot.box[1] === 12 && dot.centered && dot.w === '6px' && dot.h === '6px' && dot.bg === dot.color && dot.hidden === 'true' && parseFloat(dot.r) >= 3, JSON.stringify(dot));
const ic = await p.evaluate(() => { const e = document.getElementById('icon'); const i = e.querySelector('.dk-badge__icon'); return { dot: !!e.querySelector('.dk-badge__dot'), name: i && i.querySelector('.dk-icon').dataset.icon, hidden: i && i.getAttribute('aria-hidden'), size: i && getComputedStyle(i.querySelector('.dk-icon')).fontSize }; });
t('leftIcon: a Material Symbols icon before the label at 12px, decorative; it replaces the dot', ic.name === 'schedule' && ic.hidden === 'true' && ic.size === '12px' && !ic.dot, JSON.stringify(ic));
const cnt = await p.evaluate(() => ['c3', 'c120', 'c12m9', 'zshow'].map((id) => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return [e.textContent, Math.round(r.width), Math.round(r.height), getComputedStyle(e).borderRadius, getComputedStyle(e).fontVariantNumeric]; }));
t('count: a round pill (20px for one digit), "99+" past the default max, "max+" past a given max', cnt[0][0] === '3' && cnt[0][1] === 20 && cnt[0][2] === 20 && parseFloat(cnt[0][3]) >= 10 && cnt[0][4] === 'tabular-nums' && cnt[1][0] === '99+' && cnt[1][1] > 20 && cnt[2][0] === '9+', JSON.stringify(cnt));
t('count: nothing at 0, unless showZero', await p.evaluate(() => document.getElementById('zero').children.length === 0) && cnt[3][0] === '0');
const rm = await p.evaluate(() => { const b = document.querySelector('#tags .dk-badge__remove'); return { tag: b.tagName, type: b.type, name: b.getAttribute('aria-label'), icon: b.querySelector('.dk-icon')?.dataset.icon, other: document.querySelector('#rmlabel .dk-badge__remove').getAttribute('aria-label') }; });
t('removable: a real <button type="button"> named "Remove Design" (removeLabel changes the verb), with a close icon', rm.tag === 'BUTTON' && rm.type === 'button' && rm.name === 'Remove Design' && rm.icon === 'close' && rm.other === 'Clear filter Status: open', JSON.stringify(rm));
const sp = await p.evaluate(() => { const e = document.querySelector('#tags .dk-badge'), l = e.querySelector('.dk-badge__label').getBoundingClientRect(), btn = e.querySelector('.dk-badge__remove'), b = btn.getBoundingClientRect(), r = e.getBoundingClientRect(), cs = getComputedStyle(e);
  const hitL = document.elementFromPoint(b.left - 4, b.top + b.height / 2), hitR = document.elementFromPoint(b.right + 4, b.top + b.height / 2), ring = getComputedStyle(btn, '::after');
  return { box: [b.width, b.height], toBox: Math.round((b.left - l.right) * 10) / 10, boxToEdge: Math.round((r.right - b.right) * 10) / 10, padL: parseFloat(cs.paddingLeft), padR: parseFloat(cs.paddingRight), hit: hitL === btn && hitR === btn && document.elementFromPoint(b.left + b.width / 2, b.top - 1) === btn && document.elementFromPoint(b.left + b.width / 2, b.bottom + 1) === btn, hitW: [parseFloat(ring.left), parseFloat(ring.top), parseFloat(ring.width), parseFloat(ring.height)] };
});
t('removable: the × mirrors a leading icon (a 12px box, --badge-gap less 2px from the label, the badge padding at the end, less 2px; a × with no leading icon adds the 2px offset at the start), and keeps a 24×24 target', sp.box[0] === 12 && sp.box[1] === 20 && sp.toBox === 2 && sp.padR === 6 && sp.padL === 8 && sp.boxToEdge === 5 && sp.hit && sp.hitW.join() === '-6,-2,24,24', JSON.stringify(sp));
await p.focus('#tags .dk-badge__remove');
const rfr = await p.evaluate(() => { const b = document.activeElement, a = getComputedStyle(b, '::after'); return { w: a.outlineWidth, st: a.outlineStyle, own: getComputedStyle(b).outlineStyle }; });
t('removable: the focus ring goes round the whole 24×24 target', rfr.w === '2px' && rfr.st === 'solid' && rfr.own === 'none', JSON.stringify(rfr));
await p.click('#tags .dk-badge__remove');
await p.waitForTimeout(50);
await p.focus('#tags .dk-badge__remove'); await p.keyboard.press('Enter'); await p.waitForTimeout(50);
t('removable: click and keyboard (Enter) call onRemove', await p.evaluate(() => window.removed.join() === 'Design,Research' && document.querySelectorAll('#tags .dk-badge').length === 0), await p.evaluate(() => window.removed.join()));
const sb = await p.evaluate(() => {
  const nums = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const rgb = (c) => { const n = nums(c); return /^color\(srgb/.test(c) ? n.slice(0, 3).map((x) => Math.round(x * 255)) : n.slice(0, 3); };
  const alpha = (c) => { const n = nums(c); return n.length > 3 ? n[3] : 1; };
  const one = (t, v) => { const s = getComputedStyle(document.querySelector(`[data-t="${t}"][data-v="${v}"]`)); return { w: s.borderTopWidth, a: alpha(s.borderTopColor), same: rgb(s.borderTopColor).every((x, i) => Math.abs(x - rgb(s.color)[i]) <= 1) }; };
  const subtle = ['neutral', 'primary', 'success', 'danger', 'violet', 'teal'].map((t) => one(t, 'subtle'));
  const solid = one('success', 'solid');
  const el = document.querySelector('[data-t="violet"][data-v="subtle"]'); el.style.setProperty('--badge-subtle-border', '0%');
  const off = alpha(getComputedStyle(el).borderTopColor); el.style.removeProperty('--badge-subtle-border');
  return { subtle, solid, off };
});
t('subtle: a 1px outline in the text color at 20% (every tone), --badge-subtle-border: 0% removes it; solid stays borderless', sb.subtle.every((x) => x.w === '1px' && Math.abs(x.a - 0.2) < 0.01 && x.same) && sb.solid.a === 0 && sb.off === 0, JSON.stringify(sb));
// interactive: onClick renders a button, href a link; a plain badge stays a span
const it = await p.evaluate(() => { const b = document.getElementById('btn'), l = document.getElementById('lnk'), d = document.getElementById('def'); return { b: [b.tagName, b.type, b.classList.contains('dk-badge--interactive'), 'interactive' in b.dataset, getComputedStyle(b).cursor].join(), l: [l.tagName, l.getAttribute('href'), l.rel, l.classList.contains('dk-badge--interactive'), getComputedStyle(l).textDecorationLine].join(), d: [d.classList.contains('dk-badge--interactive'), getComputedStyle(d).cursor, getComputedStyle(d, '::before').content].join() }; });
t('interactive: onClick renders <button type="button">, href a link (rel noopener for new tabs); a plain badge stays a span with no states', it.b === 'BUTTON,button,true,true,pointer' && it.l === 'A,#here,noopener noreferrer,true,none' && it.d === 'false,auto,none', JSON.stringify(it));
await p.click('#btn'); await p.focus('#btn'); await p.keyboard.press('Enter'); await p.keyboard.press(' ');
t('interactive: click, Enter and Space call onClick', await p.evaluate(() => window.clicks) === 3, String(await p.evaluate(() => window.clicks)));
const layer = (sel) => p.evaluate((s) => { const c = getComputedStyle(document.querySelector(s), '::before'); return [c.opacity, c.backgroundColor].join('|'); }, sel);
// Wait out the layer's fade as well as the fixed pause: a slow runner (WebKit) can still be mid-transition after 250ms.
const settled = async () => { await p.waitForTimeout(250); await p.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {})))); };
await p.mouse.move(0, 0); await settled();
const rest = await layer('#btn');
await p.hover('#btn'); await settled(); const hov = await layer('#btn'); const htxt = (await st('#btn', ['color'])).color;
await p.mouse.down(); await settled(); const act = await layer('#btn'); await p.mouse.up();
await p.hover('#sbtn'); await settled(); const shov = await layer('#sbtn');
await p.hover('#dis'); await settled(); const dhov = await layer('#dis'); const dop = await st('#dis', ['opacity', 'cursor']);
await p.mouse.move(0, 0);
const txt = await st('#btn', ['color']);
t('hover and active: a layer in the text color, 10% on hover and 15% while pressed, with the text 30% darker (subtle and outline); solid uses black in light themes; disabled fades to 50% with no layer',
  rest.startsWith('0|') && hov.startsWith('0.1|') && act.startsWith('0.15|') && hov.endsWith('|' + htxt) && htxt !== txt.color && shov === '0.1|rgb(0, 0, 0)' && dhov.startsWith('0|') && dop.opacity === '0.5' && dop.cursor === 'not-allowed', JSON.stringify({ rest, hov, act, shov, dhov, dop, txt, htxt }));
await p.keyboard.press('Shift+Tab'); await p.focus('#btn'); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
const fr = await p.evaluate(() => { const e = document.activeElement, c = getComputedStyle(e); const fd = document.createElement('div'); fd.style.color = 'var(--focus-ring)'; document.body.appendChild(fd); const ring = getComputedStyle(fd).color; fd.remove(); return { id: e.id, bs: c.boxShadow, ring, ow: c.outlineWidth, oc: c.outlineColor }; });
t('focus: keyboard focus draws the focus ring (2px, outside a 2px surface gap) and a transparent outline for forced-colors mode', fr.id === 'btn' && fr.bs.includes(fr.ring) && /0px 0px 0px 4px/.test(fr.bs) && /0px 0px 0px 2px/.test(fr.bs) && fr.ow === '2px' && fr.oc === 'rgba(0, 0, 0, 0)', JSON.stringify(fr));
// contrast with the hover and pressed layers, every tone and style, every theme (real hover and press, transitions off)
const notr = await p.addStyleTag({ content: '.dk-badge, .dk-badge::before { transition: none !important; }' });
const sc = { low: [], n: 0, min: 99 };
const measure = (sel) => p.evaluate((sel) => {
  const rgb = (c) => { const m = c.match(/[\d.]+/g).map(Number); return /^color\(srgb/.test(c) ? [m[0] * 255, m[1] * 255, m[2] * 255, m.length > 3 ? m[3] : 1] : [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; };
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const over = (fg, bg) => fg[3] >= 1 ? fg : fg.map((x, i) => i < 3 ? x * fg[3] + bg[i] * (1 - fg[3]) : 1);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const sd = document.createElement('div'); sd.style.background = 'var(--surface)'; document.body.appendChild(sd); const surface = rgb(getComputedStyle(sd).backgroundColor); sd.remove();
  const e = document.querySelector(sel), s = getComputedStyle(e), b = getComputedStyle(e, '::before'), L = rgb(b.backgroundColor);
  const base = e.dataset.v === 'outline' ? surface : over(rgb(s.backgroundColor), surface);
  const bg = over([L[0], L[1], L[2], parseFloat(b.opacity)], base);
  return { r: ratio(over(rgb(s.color), bg), bg), op: parseFloat(b.opacity) };
}, sel);
for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
  await p.evaluate((th) => document.documentElement.setAttribute('data-theme', th), th);
  for (const tn of TONES) for (const v of ['subtle', 'solid', 'outline']) {
    const sel = `[data-it="${tn}"][data-v="${v}"]`;
    await p.hover(sel); const hv = await measure(sel);
    await p.mouse.down(); const ac = await measure(sel); await p.mouse.up();
    for (const [k, m] of [['hover', hv], ['pressed', ac]]) { sc.n++; sc.min = Math.min(sc.min, m.r); if (m.r < 4.5 || m.op < 0.05) sc.low.push(`${th} ${tn} ${v} ${k}: ${m.r.toFixed(2)} (layer ${m.op})`); }
  }
}
await p.evaluate(() => document.documentElement.removeAttribute('data-theme')); await p.mouse.move(0, 0); await notr.evaluate((n) => n.remove());
sc.min = Math.round(sc.min * 100) / 100;
t(`hover and pressed keep 4.5:1 text: ${TONES.length} tones × 3 styles × 2 states in all six themes`, sc.low.length === 0 && sc.n === TONES.length * 3 * 2 * 6, sc.low.slice(0, 10).join('; ') + ' min ' + sc.min);
const both = await p.evaluate(() => ({ tag: document.getElementById('both').tagName, rm: !!document.querySelector('#both .dk-badge__remove'), w: window.warns.some((m) => /onRemove is ignored/.test(m)) }));
t('onClick with onRemove: the badge is the button, no nested × button, and a warning', both.tag === 'BUTTON' && !both.rm && both.w, JSON.stringify(both));
// loading
const w0 = await box('ld');
await p.evaluate(() => { document.querySelector('[data-dk-announcer]').textContent = ''; window.setLoading(true); }); await p.waitForTimeout(250);
await p.focus('#ld'); const c0 = await p.evaluate(() => window.clicks);
await p.click('#ld', { force: true }); await p.keyboard.press('Enter');
// The cross-fade can start late on a busy runner, so wait for it to finish rather than for a fixed time.
await p.waitForFunction(() => { const e = document.getElementById('ld'), sp = e.querySelector('.dk-badge__loader');
  return !!sp && [sp, ...[...e.children].filter((c) => c !== sp && !c.classList.contains('dk-badge__ripples'))].every((el) => el.getAnimations().every((a) => a.playState === 'finished')); }, null, { timeout: 3000 });
const ld = await p.evaluate(() => { const e = document.getElementById('ld'), sp = e.querySelector('.dk-badge__loader'), art = sp && sp.querySelector('.dk-loader__art'), r = e.getBoundingClientRect(), a = art.getBoundingClientRect();
  return { busy: e.getAttribute('aria-busy'), dis: e.getAttribute('aria-disabled'), focus: document.activeElement === e, hid: [...e.children].filter((c) => c !== sp && !c.classList.contains('dk-badge__ripples')).map((c) => getComputedStyle(c).opacity).join(), sz: Math.round(a.width), cx: Math.abs((a.left + a.width / 2) - (r.left + r.width / 2)) < 1, cy: Math.abs((a.top + a.height / 2) - (r.top + r.height / 2)) < 1, ring: !!sp.querySelector('.dk-loader--ring'), ann: document.querySelector('[data-dk-announcer]').textContent, cur: getComputedStyle(e).cursor, name: e.textContent }; });
const w1 = await box('ld');
const xf = await p.evaluate(() => { const e = document.getElementById('ld'); return { lab: getComputedStyle(e.querySelector('.dk-badge__label')).transitionDuration, ldr: getComputedStyle(e.querySelector('.dk-badge__loader')).animationName, ldd: getComputedStyle(e.querySelector('.dk-badge__loader')).animationDuration }; });
t('loading cross-fade: the content fades in 150ms while the ring fades and grows in', /0\.15s/.test(xf.lab) && xf.ldr === 'dk-badge-loader-in' && xf.ldd === '0.15s', JSON.stringify(xf));
t('loading: a ring at the icon size (12px) centered over the hidden content, width kept, aria-busy, announced "Loading"', ld.ring && ld.sz === 12 && ld.cx && ld.cy && ld.hid === '0,0' && w0[0] === w1[0] && w0[1] === w1[1] && ld.busy === 'true' && ld.ann === 'Loading' && ld.cur === 'progress' && ld.name.endsWith('Approve request'), JSON.stringify({ ld, w0, w1 }));
t('loading, interactive: aria-disabled, clicks and Enter do nothing, focus stays', ld.dis === 'true' && ld.focus && await p.evaluate(() => window.clicks) === c0, JSON.stringify({ ld, c0 }));
const ls = await p.evaluate(() => { const e = document.getElementById('ldspan'), r = document.querySelector('#ldrm .dk-badge__remove'); return { tag: e.tagName, busy: e.getAttribute('aria-busy'), dis: e.getAttribute('aria-disabled'), rmDisabled: r.disabled, sm: null }; });
t('loading on a plain badge: aria-busy, stays a span, no aria-disabled; a remove button is disabled while it loads', ls.tag === 'SPAN' && ls.busy === 'true' && ls.dis === null && ls.rmDisabled, JSON.stringify(ls));
await p.evaluate(() => window.setLoading(false)); await p.waitForTimeout(400);
const after = await p.evaluate(() => { const e = document.getElementById('ld'); return { busy: e.getAttribute('aria-busy'), loader: !!e.querySelector('.dk-badge__loader'), op: getComputedStyle(e.querySelector('.dk-badge__label')).opacity }; });
t('loading off: the content is back and the badge works again', after.busy === null && !after.loader && after.op === '1', JSON.stringify(after));
// micro-interactions, as on Button
const mi = await p.evaluate(() => { const e = document.getElementById('mi'), d = document.getElementById('def'); return { first: e.firstElementChild.className, plain: !!d.querySelector('.dk-badge__ripples'), tr: getComputedStyle(e).transitionProperty, td: getComputedStyle(e).transitionDuration }; });
t('micro-interactions: a clickable badge has the ripple layer first (under the content), a plain badge none; scale moves in 100ms', mi.first === 'dk-badge__ripples' && !mi.plain && /scale/.test(mi.tr) && /0\.1s/.test(mi.td), JSON.stringify(mi));
const scl = (id) => p.evaluate((id) => getComputedStyle(document.getElementById(id)).scale, id);
const bb = await p.evaluate(() => { const r = document.getElementById('mi').getBoundingClientRect(); return { x: r.left + 12, y: r.top + 12, w: r.width, h: r.height }; });
await p.mouse.move(bb.x, bb.y); await p.mouse.down(); await p.waitForTimeout(200);
const held = await p.evaluate(() => { const e = document.getElementById('mi'), dots = e.querySelectorAll('.dk-badge__ripple'), d = dots[0]; if (!d) return null; const s = getComputedStyle(d), host = e.querySelector('.dk-badge__ripples').getBoundingClientRect(), lab = getComputedStyle(e.querySelector('.dk-badge__label')).position;
  return { n: dots.length, op: s.opacity, bg: s.backgroundColor, color: getComputedStyle(e).color, dia: parseFloat(d.style.width), host: [host.width, host.height], pe: s.pointerEvents, lab, anim: s.animationDuration }; });
const pressed = await scl('mi');
await p.mouse.up(); await p.waitForTimeout(200);
const released = await scl('mi');
await p.waitForTimeout(1200);
const gone = await p.evaluate(() => document.querySelectorAll('#mi .dk-badge__ripple').length);
const far = held && Math.hypot(held.host[0] - 12 + 1, held.host[1] - 12 + 1) * 2;
t('press: shrinks to 97% while held and comes back on release', pressed === '0.97' && (released === 'none' || released === '1'), JSON.stringify({ pressed, released }));
t('ripple: one circle from the press point, text color at 20%, wide enough to reach the far corner, under the label, 500ms; removed after release', held && held.n === 1 && held.op === '0.2' && held.bg === held.color && held.dia >= far - 2 && held.lab === 'relative' && held.anim === '0.5s' && gone === 0, JSON.stringify({ held, far, gone }));
await p.focus('#mi'); await p.keyboard.down('Enter'); await p.waitForTimeout(200); const ent = [await p.evaluate(() => document.getElementById('mi').hasAttribute('data-pressed')), await scl('mi')]; await p.keyboard.up('Enter');
const entUp = await p.evaluate(() => document.getElementById('mi').hasAttribute('data-pressed'));
t('Enter shows the press like Space (data-pressed while held)', ent[0] && ent[1] === '0.97' && !entUp, JSON.stringify({ ent, entUp }));
const tryPress = async (id) => { const r = await p.evaluate((id) => { const b = document.getElementById(id).getBoundingClientRect(); return [b.left + 6, b.top + 6]; }, id); await p.mouse.move(r[0], r[1]); await p.mouse.down(); await p.waitForTimeout(150); const o = { scale: await scl(id), dots: await p.evaluate((id) => document.querySelectorAll('#' + id + ' .dk-badge__ripple').length, id) }; await p.mouse.up(); await p.waitForTimeout(50); return o; };
const off = await tryPress('mioff'), pd = await tryPress('mipd'), dis = await tryPress('dis'), plain = await tryPress('def');
t('tokens turn each off (--badge-ripple-opacity: 0, --badge-press-scale: 100%); your onPointerDown preventing the default skips the ripple; no press or ripple on disabled or plain badges',
  off.dots === 0 && (off.scale === '1' || off.scale === 'none') && pd.dots === 0 && dis.dots === 0 && (dis.scale === 'none' || dis.scale === '1') && plain.dots === 0 && (plain.scale === 'none' || plain.scale === '1'), JSON.stringify({ off, pd, dis, plain }));
const ob = await p.evaluate(() => [...document.querySelectorAll('#ob .dk-badge')].map((e) => { const c = getComputedStyle(e); return parseFloat(c.paddingLeft) + '/' + parseFloat(c.paddingRight); }));
t('optical balance, like Button: an icon on one side only (leading icon or dot / the ×) gives the text side 2px more padding; both or neither stay even; mirrored in right-to-left',
  ob.join() === ['6/6', '6/8', '6/8', '8/6', '6/6', '4/4', '8/6'].join(), ob.join());
const ind = await p.evaluate(() => { const q = (id) => { const e = document.getElementById(id), c = getComputedStyle(e), sd = document.createElement('div'); sd.style.color = 'var(--surface)'; document.body.appendChild(sd); const surf = getComputedStyle(sd).color; sd.remove(); return { tag: e.tagName, kids: e.children.length, w: c.width, h: c.height, r: c.borderRadius, bg: c.backgroundColor, ring: c.boxShadow.includes(surf) && /0px 0px 0px 2px/.test(c.boxShadow), hidden: e.getAttribute('aria-hidden'), role: e.getAttribute('role'), v: e.dataset.variant }; };
  const solid = getComputedStyle(document.querySelector('[data-t="danger"][data-v="solid"]')).backgroundColor, nsolid = getComputedStyle(document.querySelector('[data-t="neutral"][data-v="solid"]')).backgroundColor;
  return { md: q('ind'), sm: q('indsm'), named: q('indnamed'), click: q('indclick'), solid, nsolid, warn: window.warns.some((m) => /dot indicator can't be clicked/.test(m)) }; });
t('indicator: dot with no label is a lone 8px dot in the tone\'s solid fill, any variant, with a 2px surface ring; decorative, or role="img" when named; never clickable or removable (warns)',
  ind.md.tag === 'SPAN' && ind.md.kids === 0 && ind.md.w === '8px' && ind.md.h === '8px' && parseFloat(ind.md.r) >= 4 && ind.md.bg === ind.solid && ind.md.ring && ind.md.hidden === 'true' && ind.md.v === 'indicator'
  && ind.sm.w === '8px' && ind.sm.h === '8px' && ind.sm.bg === ind.nsolid && ind.named.role === 'img' && ind.named.hidden === null && ind.click.tag === 'SPAN' && ind.click.kids === 0 && ind.warn, JSON.stringify(ind));
const pg = await p.evaluate(() => {
  const a = (el) => { const c = getComputedStyle(el, '::after'); return { name: c.animationName, dur: c.animationDuration, iter: c.animationIterationCount, bg: c.backgroundColor, pos: c.position, w: c.width }; };
  const dot = document.querySelector('#pg .dk-badge__dot'), ind = document.getElementById('pgind');
  return { dot: a(dot), dotBg: getComputedStyle(dot).backgroundColor, ind: a(ind), indBg: getComputedStyle(ind).backgroundColor, indPos: getComputedStyle(ind).position, abs: getComputedStyle(document.getElementById('pgabs')).position,
    off: getComputedStyle(document.querySelector('#dot .dk-badge__dot'), '::after').animationName, nodot: document.getElementById('pgnodot').classList.contains('dk-badge--ping'), icon: document.getElementById('pgicon').classList.contains('dk-badge--ping'), dotW: getComputedStyle(dot).width };
});
t('ping: off by default; with dot, a copy of the dot (its color, its size) runs the system\'s ping animation (1s, forever) on a dot in a label or the indicator; the dot stays 6px; ignored without a dot or with an icon; your absolute class still places the indicator',
  pg.off === 'none' && pg.dot.name === 'ping' && pg.dot.dur === '1s' && pg.dot.iter === 'infinite' && pg.dot.bg === pg.dotBg && pg.dot.pos === 'absolute' && pg.dotW === '6px'
  && pg.ind.name === 'ping' && pg.ind.bg === pg.indBg && pg.ind.w === '8px' && pg.indPos === 'relative' && pg.abs === 'absolute' && !pg.nodot && !pg.icon, JSON.stringify(pg));
const rf = await p.evaluate(() => { const e = window.r.current; return e && e.id === 'ref' && e.classList.contains('extra') && e.dataset.x === 'y' && e.title === 'tip'; });
t('ref, className and other attributes pass through', rf);
await p.evaluate(() => window.setCount(2)); await p.waitForTimeout(50);
const grown = await p.evaluate(() => document.querySelector('#grow .dk-badge') ? document.querySelector('#grow .dk-badge').textContent : null);
await p.evaluate(() => window.setCount(0)); await p.waitForTimeout(50);
const shrunk = await p.evaluate(() => document.getElementById('grow').children.length);
t('count: a badge whose count goes from 0 to 2 and back to 0 appears and disappears without an error (hooks run on every render)', grown === '2' && shrunk === 0, JSON.stringify({ grown, shrunk }));
t('no page errors', errors.length === 0, errors.join(' | '));

// reduced motion: no press, no ripple; loading only fades
{
  const rp = await (await b.newContext({ reducedMotion: 'reduce' })).newPage();
  await rp.goto(writePage('badge-rm.html', APP, { react: true })); await rp.waitForTimeout(300);
  const r = await rp.evaluate(() => { const b = document.getElementById('mi').getBoundingClientRect(); return [b.left + 6, b.top + 6]; });
  await rp.mouse.move(r[0], r[1]); await rp.mouse.down(); await rp.waitForTimeout(150);
  const o = await rp.evaluate(() => ({ ping: getComputedStyle(document.querySelector('#pg .dk-badge__dot'), '::after').animationName + '/' + getComputedStyle(document.getElementById('pgind'), '::after').display, scale: getComputedStyle(document.getElementById('mi')).scale, dots: document.querySelectorAll('#mi .dk-badge__ripple').length, host: getComputedStyle(document.querySelector('#mi .dk-badge__ripples')).display, from: getComputedStyle(document.getElementById('ldspan')).getPropertyValue('--dk-badge-loader-from').trim() }));
  await rp.mouse.up();
  t('reduced motion: no press, no ripple and no ping; the loading ring only fades (no growing)', /^none\/none$/.test(o.ping) && (o.scale === '1' || o.scale === 'none') && o.dots === 0 && o.host === 'none' && /100%/.test(o.from), JSON.stringify(o));
  await rp.close();
}

await b.close();
cleanup();
process.exit(report('Badge', R) ? 0 : 1);

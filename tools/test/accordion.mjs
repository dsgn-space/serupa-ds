// Accordion: headings and buttons, single and multiple, collapsible, controlled, disabled items, keyboard,
// hidden content when closed, the height animation, the card variant, contrast in every theme, tokens.
//   node tools/test/accordion.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;width:480px"></div>
<script>
var D = window.Diki, h = React.createElement, A = D.Accordion, I = D.AccordionItem;
window.calls = [];
function Controlled() {
  var s = React.useState(['b']);
  return h(A, { id: 'actl', type: 'multiple', value: s[0], onValueChange: function (v) { window.calls.push(v.join('+')); s[1](v); } },
    h(I, { value: 'a', title: 'A' }, 'a'), h(I, { value: 'b', title: 'B' }, 'b'));
}
function App() {
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
    h(A, { id: 'adef', ref: window.ar = React.createRef(), className: 'extra', 'data-x': 'y' },
      h(I, { title: 'Shipping', ref: window.ir = React.createRef() }, h('p', { style: { margin: 0 } }, 'We ship in 2 days. ', h('a', { href: '#x', id: 'inner' }, 'Rates'))),
      h(I, { title: 'Returns' }, 'Within 30 days.'),
      h(I, { title: 'Locked', disabled: true }, 'Never'),
      h(I, { title: 'Warranty' }, 'One year.')),
    h(A, { id: 'amulti', type: 'multiple', defaultValue: ['x', 'y'], headingLevel: 2, variant: 'card' }, h(I, { value: 'x', title: 'X' }, 'x'), h(I, { value: 'y', title: 'Y' }, 'y'), h(I, { value: 'z', title: 'Z' }, 'z')),
    h(A, { id: 'afixed', collapsible: false, defaultValue: ['p', 'q'] }, h(I, { value: 'p', title: 'P' }, 'p'), h(I, { value: 'q', title: 'Q' }, 'q')),
    h(Controlled),
    h(A, { id: 'abad', variant: 'boxed', headingLevel: 9 }, h(I, { title: 'Bad' }, 'b')),
    h(A, { id: 'atok', style: { '--accordion-title-color': 'rgb(1, 2, 3)', '--accordion-padding-y': '7px' } }, h(I, { title: 'T' }, 't')));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('accordion.html', APP, { react: true }));
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const state = (sel) => p.evaluate((s) => [...document.querySelectorAll(s + ' > .dk-accordion__item')].map((i) => i.dataset.state === 'open' ? 1 : 0).join(''), sel);
const btn = (sel, n) => `${sel} > .dk-accordion__item:nth-child(${n}) .dk-accordion__trigger`;

const ad = await p.evaluate(() => { const a = document.getElementById('adef'), i = a.firstElementChild, hd = i.firstElementChild, b = hd.firstElementChild, pn = i.lastElementChild; return { cls: a.className, comp: a.dataset.component, ref: window.ar.current === a, iref: window.ir.current === i, x: a.dataset.x, h: hd.tagName, btn: b.tagName, type: b.type, exp: b.getAttribute('aria-expanded'), ctl: b.getAttribute('aria-controls') === pn.id, role: pn.getAttribute('role'), lab: pn.getAttribute('aria-labelledby') === b.id }; });
t('structure: an <h3> holding a button (aria-expanded, aria-controls) and a region labelled by it; refs and props reach the wrapper and item', ad.cls === 'dk-accordion extra' && ad.comp === 'accordion' && ad.ref && ad.iref && ad.x === 'y' && ad.h === 'H3' && ad.btn === 'BUTTON' && ad.type === 'button' && ad.exp === 'false' && ad.ctl && ad.role === 'region' && ad.lab, JSON.stringify(ad));
t('uncontrolled with no defaultValue: everything closed', (await state('#adef')) === '0000');
const closed = await p.evaluate(() => { const pn = document.querySelector('#adef .dk-accordion__panel'); return { vis: getComputedStyle(pn).visibility, h: pn.getBoundingClientRect().height }; });
t('closed content is hidden (no height, visibility hidden, out of the tab order)', closed.vis === 'hidden' && closed.h === 0, JSON.stringify(closed));
await p.click(btn('#adef', 1));
await p.waitForTimeout(80);
const mid = await p.evaluate(() => document.querySelector('#adef .dk-accordion__panel').getBoundingClientRect().height);
await p.waitForTimeout(300);
const full = await p.evaluate(() => { const pn = document.querySelector('#adef .dk-accordion__panel'); return { h: pn.getBoundingClientRect().height, vis: getComputedStyle(pn).visibility, exp: document.querySelector('#adef .dk-accordion__trigger').getAttribute('aria-expanded'), rot: getComputedStyle(document.querySelector('#adef .dk-accordion__icon')).rotate }; });
t('opening animates the height (200ms), shows the content, sets aria-expanded and turns the chevron over', mid > 0 && mid < full.h && full.vis === 'visible' && full.exp === 'true' && full.rot === '180deg', JSON.stringify({ mid, full }));
await p.click(btn('#adef', 2)); await p.waitForTimeout(250);
t('type="single": opening one closes the other', (await state('#adef')) === '0100');
await p.click(btn('#adef', 2)); await p.waitForTimeout(250);
t('collapsible (default): the open one closes again', (await state('#adef')) === '0000');
await p.click(btn('#adef', 3), { force: true });
const dis = await p.evaluate(() => { const b = document.querySelector('#adef > :nth-child(3) .dk-accordion__trigger'); return [b.disabled, getComputedStyle(b).opacity].join(); });
t('a disabled item doesn\'t open, and fades to 50%', (await state('#adef')) === '0000' && dis === 'true,0.5', dis);
await p.focus(btn('#adef', 1));
await p.keyboard.press('ArrowDown'); const k1 = await p.evaluate(() => document.activeElement.textContent);
await p.keyboard.press('ArrowDown'); const k2 = await p.evaluate(() => document.activeElement.textContent);
await p.keyboard.press('ArrowDown'); const k3 = await p.evaluate(() => document.activeElement.textContent);
await p.keyboard.press('Home'); const k4 = await p.evaluate(() => document.activeElement.textContent);
await p.keyboard.press('End'); const k5 = await p.evaluate(() => document.activeElement.textContent);
await p.keyboard.press('ArrowUp'); const k6 = await p.evaluate(() => document.activeElement.textContent);
t('keyboard: Down and Up move between titles (skipping disabled, wrapping), Home and End go to the ends', [k1, k2, k3, k4, k5, k6].map((x) => x.replace('expand_more', '')).join() === 'Returns,Warranty,Shipping,Shipping,Warranty,Returns', [k1, k2, k3, k4, k5, k6].join());
await p.keyboard.press('Enter'); await p.waitForTimeout(250);
const ring = await st(btn('#adef', 2), ['outlineStyle', 'outlineWidth']);
t('Enter toggles the focused item; the focus ring is 2px', (await state('#adef')) === '0100' && ring.outlineStyle === 'solid' && ring.outlineWidth === '2px', JSON.stringify(ring));
await p.keyboard.press('Space'); await p.waitForTimeout(250);
t('Space toggles it too', (await state('#adef')) === '0000');
await p.click(btn('#adef', 1)); await p.waitForTimeout(250);
await p.focus(btn('#adef', 1)); await p.keyboard.press('Tab');
t('Tab goes into open content', (await p.evaluate(() => document.activeElement.id)) === 'inner');
const m = await p.evaluate(() => { const a = document.getElementById('amulti'), s = getComputedStyle(a); return { h: a.querySelector('.dk-accordion__heading').tagName, cls: a.className, b: s.borderTopWidth, r: s.borderTopLeftRadius, pad: getComputedStyle(a.querySelector('.dk-accordion__trigger')).paddingLeft, last: getComputedStyle(a.lastElementChild).borderBottomWidth }; });
t('type="multiple" with defaultValue, headingLevel 2, variant card (frame, 8px corners, 16px side padding, no double line)', (await state('#amulti')) === '110' && m.h === 'H2' && m.cls === 'dk-accordion dk-accordion--card' && m.b === '1px' && m.r === '8px' && m.pad === '16px' && m.last === '0px', JSON.stringify(m));
await p.click(btn('#amulti', 3)); await p.click(btn('#amulti', 1)); await p.waitForTimeout(250);
t('multiple: items open and close independently', (await state('#amulti')) === '011');
t('single with a two-item defaultValue opens only the first', (await state('#afixed')) === '10');
await p.click(btn('#afixed', 1), { force: true }); await p.waitForTimeout(250);
const lk = await p.evaluate(() => document.querySelector('#afixed .dk-accordion__trigger').getAttribute('aria-disabled'));
t('collapsible={false}: the open item stays open (aria-disabled), another can replace it', (await state('#afixed')) === '10' && lk === 'true', lk);
await p.click(btn('#afixed', 2)); await p.waitForTimeout(250);
t('…and opening another closes it', (await state('#afixed')) === '01');
await p.click(btn('#actl', 1));
t('controlled: onValueChange gets the open values, the parent sets them', (await state('#actl')) === '11' && (await p.evaluate(() => window.calls.join())) === 'b+a', await p.evaluate(() => window.calls.join()));
const bad = await p.evaluate(() => { const a = document.getElementById('abad'); return [a.className, a.querySelector('.dk-accordion__heading').tagName].join(); });
t('unknown variant and headingLevel fall back to plain and h3', bad === 'dk-accordion,H3', bad);
const tk = await st('#atok .dk-accordion__trigger', ['color', 'paddingTop']);
t('Accordion tokens (--accordion-title-color, --accordion-padding-y) override one accordion', tk.color === 'rgb(1, 2, 3)' && tk.paddingTop === '7px', JSON.stringify(tk));

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const bg = rgb(getComputedStyle(d).backgroundColor); d.remove();
    for (const [sel, min] of [['#adef .dk-accordion__trigger', 4.5], ['#adef .dk-accordion__content', 4.5], ['#adef .dk-accordion__icon', 3]]) {
      const r = ratio(rgb(getComputedStyle(document.querySelector(sel)).color), bg); n++;
      if (r < min) low.push(`${th} ${sel}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: titles and content keep 4.5:1, the chevron 3:1, on surface in all six themes', contrast.low.length === 0 && contrast.n === 18, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Accordion', R) ? 0 : 1);

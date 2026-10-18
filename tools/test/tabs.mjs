// Tabs: roles and ids, selection (uncontrolled, controlled, default), keyboard (arrows, Home/End, right-to-left,
// manual activation, disabled tabs skipped), panels, both variants, sizes, contrast in every theme, tokens.
//   node tools/test/tabs.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px;display:flex;flex-direction:column;gap:24px;max-width:560px"></div>
<script>
var D = window.Serupa, h = React.createElement; window.changes = [];
function Set3(p) {
  return [h(D.TabList, { key: 'l', 'aria-label': p.label || 'Sections' },
      h(D.Tab, { value: 'one', icon: p.icon ? 'home' : null }, 'One'), h(D.Tab, { value: 'two', disabled: p.dis }, 'Two'), h(D.Tab, { value: 'three x' }, 'Three')),
    h(D.TabPanel, { key: 'a', value: 'one' }, h('input', { 'aria-label': 'kept' })), h(D.TabPanel, { key: 'b', value: 'two' }, 'Panel two'), h(D.TabPanel, { key: 'c', value: 'three x', keepMounted: false }, 'Panel three')];
}
function App() {
  var c = React.useState('two'); window.setCtl = c[1];
  return h(React.Fragment, null,
    h(D.Tabs, { id: 'un', ref: window.r = React.createRef(), className: 'extra', onValueChange: function (v) { window.changes.push(v); } }, Set3({ icon: true })),
    h(D.Tabs, { id: 'dv', defaultValue: 'three x', variant: 'pill', size: 'sm' }, Set3({})),
    h(D.Tabs, { id: 'ctl', value: c[0], onValueChange: function (v) { window.changes.push('ctl:' + v); } }, Set3({})),
    h(D.Tabs, { id: 'dis', activation: 'manual' }, Set3({ dis: true })),
    h('div', { dir: 'rtl' }, h(D.Tabs, { id: 'rtl' }, Set3({}))),
    h(D.Tabs, { id: 'bad', variant: 'boxed', size: 'xl', style: { '--tabs-indicator': 'rgb(1, 2, 3)', '--tabs-height-md': '40px' } }, Set3({})));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('tabs.html', APP, { react: true }));
await p.waitForTimeout(300);
const state = (id) => p.evaluate((id) => { const r = document.getElementById(id); return [...r.querySelectorAll('[role="tab"]')].map((x) => (x.getAttribute('aria-selected') === 'true' ? '*' : '') + x.querySelector('.dk-tabs__label').textContent + (x.tabIndex === 0 ? '0' : '')).join(' ') + ' | ' + [...r.querySelectorAll('[role="tabpanel"]')].map((x) => (x.hidden ? '-' : '+') + (x.textContent || (x.querySelector('input') ? 'input' : ''))).join(' '); }, id);
const focused = () => p.evaluate(() => { const l = document.activeElement.querySelector('.dk-tabs__label'); return l ? l.textContent : document.activeElement.textContent; });

const aria = await p.evaluate(() => { const r = document.getElementById('un'), l = r.querySelector('[role="tablist"]'), tab = r.querySelector('[role="tab"]'), pn = document.getElementById(tab.getAttribute('aria-controls')); return { list: !!l && l.getAttribute('aria-label') === 'Sections', type: tab.type, panel: pn && pn.getAttribute('role'), back: pn && pn.getAttribute('aria-labelledby') === tab.id, ptab: pn && pn.tabIndex, ref: window.r.current === r, cls: r.className, comp: r.dataset.component, icon: tab.querySelector('.dk-tabs__icon').getAttribute('aria-hidden'), ids: new Set([...document.querySelectorAll('[role="tab"]')].map((x) => x.id)).size }; });
t('roles: a tablist of type="button" tabs, each controlling its tabpanel (labelled by the tab, focusable); unique ids; ref and className reach Tabs', aria.list && aria.type === 'button' && aria.panel === 'tabpanel' && aria.back && aria.ptab === 0 && aria.ref && /extra/.test(aria.cls) && aria.comp === 'tabs' && aria.icon === 'true' && aria.ids === 18, JSON.stringify(aria));
t('uncontrolled without defaultValue: the first tab is selected, the only one in the Tab order; other panels hidden', (await state('un')) === '*One0 Two Three | +input -Panel two -', await state('un'));
t('defaultValue selects that tab; keepMounted={false} renders the panel only while selected', (await state('dv')) === 'One *Three0 Two | -input -Panel two +Panel three'.replace('*Three0 Two', 'Two *Three0'), await state('dv'));
await p.click('#un [role="tab"]:nth-child(2)');
t('click selects and calls onValueChange', (await state('un')) === 'One *Two0 Three | -input +Panel two -' && (await p.evaluate(() => window.changes.join())) === 'two', await state('un'));
await p.focus('#un [role="tab"][aria-selected="true"]');
await p.keyboard.press('ArrowRight'); const a1 = [await focused(), await state('un')];
await p.keyboard.press('ArrowRight'); const a2 = await focused();
await p.keyboard.press('ArrowLeft'); const a3 = await focused();
await p.keyboard.press('End'); const a4 = await focused();
await p.keyboard.press('Home'); const a5 = [await focused(), await state('un')];
t('keys: arrows move and select (wrapping), Home and End jump to the ends', a1[0] === 'Three' && a1[1].startsWith('One Two *Three0') && a2 === 'One' && a3 === 'Three' && a4 === 'Three' && a5[0] === 'One' && a5[1].startsWith('*One0'), JSON.stringify([a1, a2, a3, a4, a5]));
await p.keyboard.press('Tab');
t('Tab from the tab list goes to the selected panel\'s content', await p.evaluate(() => document.activeElement.getAttribute('aria-label') === 'kept' || document.activeElement.getAttribute('role') === 'tabpanel'));
await p.click('#ctl [role="tab"]:nth-child(1)');
const c1 = await state('ctl');
await p.evaluate(() => window.setCtl('three x')); await p.waitForTimeout(50);
t('controlled: a click only asks (onValueChange); value decides', c1.startsWith('One *Two0') && (await p.evaluate(() => window.changes.includes('ctl:one'))) && (await state('ctl')).startsWith('One Two *Three0'), c1);
await p.focus('#dis [role="tab"][aria-selected="true"]');
await p.keyboard.press('ArrowRight'); const m1 = [await focused(), await state('dis')];
await p.keyboard.press('Enter'); const m2 = await state('dis');
t('manual activation: arrows only move (skipping a disabled tab), Enter selects', m1[0] === 'Three' && m1[1].startsWith('*One0') && m2.startsWith('One Two *Three0') && await p.evaluate(() => document.querySelector('#dis [role="tab"]:nth-child(2)').disabled), JSON.stringify([m1, m2]));
await p.focus('#rtl [role="tab"][aria-selected="true"]');
await p.keyboard.press('ArrowLeft');
t('right-to-left: ArrowLeft goes to the next tab', (await focused()) === 'Two');

const line = await p.evaluate(() => { const r = document.getElementById('un'), l = r.querySelector('[role="tablist"]'), sel = r.querySelector('[aria-selected="true"]'), other = r.querySelector('[aria-selected="false"]'); const a = getComputedStyle(sel, '::after'); const s = getComputedStyle(sel), o = getComputedStyle(other); return { border: getComputedStyle(l).borderBottomWidth, h: sel.getBoundingClientRect().height, ind: a.height + ' ' + a.backgroundColor, fs: s.fontSize, fw: s.fontWeight, sc: s.color, oc: o.color, px: s.paddingLeft, icon: getComputedStyle(sel.querySelector('.dk-icon')).fontSize }; });
const prim = await p.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--primary)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; });
t('line: a 1px border under the row, 36px tabs (text-sm, font-medium, 12px sides), a 2px primary line under the selected one, whose label is darker; 16px icons', line.border === '1px' && line.h === 36 && line.ind === '2px ' + prim && line.fs === '14px' && line.fw === '500' && line.sc !== line.oc && line.px === '12px' && line.icon === '16px', JSON.stringify(line));
const pill = await p.evaluate(() => { const r = document.getElementById('dv'), sel = r.querySelector('[aria-selected="true"]'), s = getComputedStyle(sel); return { h: sel.getBoundingClientRect().height, bg: s.backgroundColor, border: getComputedStyle(r.querySelector('[role="tablist"]')).borderBottomStyle, r: s.borderTopLeftRadius, after: getComputedStyle(sel, '::after').content }; });
t('pill, size sm: 32px tabs, the selected one filled in primary with 6px corners, no row border or line', pill.h === 32 && pill.bg === prim && pill.border === 'none' && pill.r === '6px' && pill.after === 'none', JSON.stringify(pill));
const bad = await p.evaluate(() => { const r = document.getElementById('bad'), sel = r.querySelector('[aria-selected="true"]'); return [r.dataset.variant, Math.round(sel.getBoundingClientRect().height), getComputedStyle(sel, '::after').backgroundColor].join(); });
t('unknown variant and size fall back to line and md; --tabs-indicator and --tabs-height-md override', bad === 'line,40,rgb(1, 2, 3)', bad);
// Arrive by Tab (to the panel and back) so focus counts as keyboard focus in every engine, then rove with the arrows.
await p.focus('#un [role="tab"][aria-selected="true"]'); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft');
const fr = await p.evaluate(() => (document.activeElement.getAttribute('role') === 'tab' && document.activeElement.closest('#un') ? '' : 'not a #un tab: ') + getComputedStyle(document.activeElement).boxShadow);
t('focus from the keyboard: a 2px focus-ring inside the tab', /0px 0px 0px 2px inset|inset 0px 0px 0px 2px/.test(fr), fr);

const contrast = await p.evaluate(() => {
  const still = document.createElement('style'); still.textContent = '* { transition: none !important; }'; document.head.appendChild(still);
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const bg = rgb(getComputedStyle(d).backgroundColor); d.remove();
    const un = document.querySelector('#un [aria-selected="false"]'), sel = document.querySelector('#un [aria-selected="true"]'), pill = document.querySelector('#dv [aria-selected="true"]');
    const checks = [['tab', rgb(getComputedStyle(un).color), bg, 4.5], ['selected', rgb(getComputedStyle(sel).color), bg, 4.5], ['line', rgb(getComputedStyle(sel, '::after').backgroundColor), bg, 3], ['pill', rgb(getComputedStyle(pill).color), rgb(getComputedStyle(pill).backgroundColor), 4.5], ['pill fill', rgb(getComputedStyle(pill).backgroundColor), bg, 3]];
    for (const [k, a, c, min] of checks) { const r = ratio(a, c); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: labels 4.5:1, the selected line and pill 3:1 against surface, in all six themes', contrast.low.length === 0 && contrast.n === 30, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Tabs', R) ? 0 : 1);

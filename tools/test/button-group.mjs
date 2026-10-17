// ButtonGroup and ToggleButton: group role and name, attached borders and corners, spacing, vertical, focus
// stacking; aria-pressed, controlled and uncontrolled, pressed colors, ghost, icons, contrast, component tokens.
//   node tools/test/button-group.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:16px"></div>
<script>
var D = window.Diki, h = React.createElement, B = D.Button, T = D.ToggleButton;
window.calls = [];
function Controlled() {
  var s = React.useState(true);
  return h(T, { id: 'tctl', pressed: s[0], onPressedChange: function (v) { window.calls.push(v); s[1](v); } }, 'Grid');
}
function App() {
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' } },
    h(D.ButtonGroup, { id: 'gatt', 'aria-label': 'View', ref: window.gr = React.createRef(), className: 'extra' },
      h(B, { variant: 'outline', id: 'b1' }, 'Day'), h(B, { variant: 'outline', id: 'b2' }, 'Week'), h(B, { variant: 'outline', id: 'b3' }, 'Month')),
    h(D.ButtonGroup, { id: 'gsp', attached: false }, h(B, { variant: 'outline' }, 'Cancel'), h(B, null, 'Save')),
    h(D.ButtonGroup, { id: 'gv', orientation: 'vertical' }, h(B, { variant: 'outline' }, 'Top'), h(B, { variant: 'outline' }, 'Bottom')),
    h(D.ButtonGroup, { id: 'gfmt', 'aria-label': 'Text formatting' },
      h(T, { id: 'tbold', icon: 'format_bold', 'aria-label': 'Bold', ref: window.tr = React.createRef(), className: 'extra' }),
      h(T, { id: 'titalic', icon: 'format_italic', 'aria-label': 'Italic', defaultPressed: true }),
      h(T, { id: 'tghost', icon: 'format_underlined', 'aria-label': 'Underline', variant: 'ghost', defaultPressed: true })),
    h(Controlled),
    h(T, { id: 'tprev', onClick: function (e) { e.preventDefault(); } }, 'Prevented'),
    h(T, { id: 'tdis', disabled: true }, 'Disabled'),
    h(T, { id: 'tbad', variant: 'primary' }, 'Bad'),
    h(D.ButtonGroup, { id: 'gtok', attached: false, style: { '--button-group-gap': '13px' } }, h(B, null, 'A'), h(B, null, 'B')),
    h(T, { id: 'ttok', defaultPressed: true, style: { '--toggle-button-bg-pressed': 'rgb(1, 2, 3)' } }, 'Tok'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('button-group.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const rects = (sel) => p.evaluate((s) => [...document.querySelector(s).children].map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; }), sel);
const tok = (v, prop = 'backgroundColor') => p.evaluate(([v, prop]) => { const d = document.createElement('div'); d.style[prop === 'color' ? 'color' : 'background'] = v; document.body.appendChild(d); const c = getComputedStyle(d)[prop]; d.remove(); return c; }, [v, prop]);

const g = await p.evaluate(() => { const e = document.getElementById('gatt'); return { role: e.getAttribute('role'), label: e.getAttribute('aria-label'), cls: e.className, comp: e.dataset.component, ref: window.gr.current === e }; });
t('ButtonGroup: role="group" named by aria-label; ref and className reach it', g.role === 'group' && g.label === 'View' && g.cls === 'dk-button-group dk-button-group--attached extra' && g.comp === 'button-group' && g.ref, JSON.stringify(g));
const ar = await rects('#gatt');
t('attached: buttons overlap by the 1px border, so the borders make one line', ar[1].l - ar[0].r === -1 && ar[2].l - ar[1].r === -1, JSON.stringify(ar));
const radii = await p.evaluate(() => ['b1', 'b2', 'b3'].map((id) => { const s = getComputedStyle(document.getElementById(id)); return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].join(' '); }));
t('attached: only the group\'s outer corners are rounded', radii[0] === '6px 0px 0px 6px' && radii[1] === '0px 0px 0px 0px' && radii[2] === '0px 6px 6px 0px', radii.join(' | '));
await p.hover('#b2');
const zi = await p.evaluate(() => ['b1', 'b2'].map((id) => getComputedStyle(document.getElementById(id)).zIndex).join());
t('a hovered button comes to the front, so its border shows whole', zi === 'auto,10', zi);
const sr = await rects('#gsp');
t('attached={false}: 8px apart, own corners', sr[1].l - sr[0].r === 8 && (await st('#gsp > :last-child', ['borderTopLeftRadius'])).borderTopLeftRadius === '6px', JSON.stringify(sr));
const vr = await rects('#gv');
const vr2 = await p.evaluate(() => { const e = document.getElementById('gv'), c = e.children; return [e.dataset.orientation, getComputedStyle(c[0]).borderBottomLeftRadius, getComputedStyle(c[1]).borderTopRightRadius, Math.round(c[0].getBoundingClientRect().width) === Math.round(c[1].getBoundingClientRect().width)].join(); });
t('vertical: stacked, overlapping by 1px, the same width, data-orientation="vertical"', vr[1].t - vr[0].b === -1 && vr[0].l === vr[1].l && vr2 === 'vertical,0px,0px,true', JSON.stringify([vr, vr2]));
const tg = await p.evaluate(() => { const e = document.getElementById('tbold'); return { tag: e.tagName, type: e.type, pressed: e.getAttribute('aria-pressed'), label: e.getAttribute('aria-label'), cls: e.className, comp: e.dataset.component, ref: window.tr.current === e, icon: e.textContent }; });
t('ToggleButton: a button with aria-pressed="false", outline by default, icon-only with aria-label; ref and className reach it', tg.tag === 'BUTTON' && tg.type === 'button' && tg.pressed === 'false' && tg.label === 'Bold' && /dk-btn--outline/.test(tg.cls) && /dk-toggle-button extra/.test(tg.cls) && tg.comp === 'button' && tg.ref && tg.icon === 'format_bold', JSON.stringify(tg));
await p.click('#tbold');
const on = await st('#tbold', ['backgroundColor', 'color', 'borderTopColor']);
t('pressing it turns it on: aria-pressed="true", primary-subtle with primary text and border', (await p.evaluate(() => document.getElementById('tbold').getAttribute('aria-pressed'))) === 'true' && on.backgroundColor === await tok('var(--primary-subtle)') && on.color === await tok('var(--primary)', 'color') && on.borderTopColor === on.color, JSON.stringify(on));
await p.hover('#tbold');
t('hover keeps the pressed colors', (await st('#tbold', ['backgroundColor'])).backgroundColor === on.backgroundColor);
await p.keyboard.press('Tab'); await p.focus('#tbold'); await p.keyboard.press('Space');
t('Space turns it off again', (await p.evaluate(() => document.getElementById('tbold').getAttribute('aria-pressed'))) === 'false');
const gh = await p.evaluate(() => { const e = document.getElementById('tghost'); return [e.getAttribute('aria-pressed'), /dk-btn--ghost/.test(e.className)].join(); });
t('defaultPressed starts on; variant="ghost"', gh === 'true,true' && (await p.evaluate(() => document.getElementById('titalic').getAttribute('aria-pressed'))) === 'true', gh);
await p.click('#tctl');
t('controlled: onPressedChange gets the new state, the parent sets it', (await p.evaluate(() => [document.getElementById('tctl').getAttribute('aria-pressed'), window.calls.join()].join('|'))) === 'false|false');
await p.click('#tprev');
t('onClick with preventDefault stops the toggle', (await p.evaluate(() => document.getElementById('tprev').getAttribute('aria-pressed'))) === 'false');
await p.click('#tdis', { force: true });
t('disabled: doesn\'t toggle', (await p.evaluate(() => document.getElementById('tdis').getAttribute('aria-pressed'))) === 'false');
t('ToggleButton: an unknown variant falls back to outline', await p.evaluate(() => /dk-btn--outline/.test(document.getElementById('tbad').className)));
const gt = await rects('#gtok');
t('tokens: --button-group-gap and --toggle-button-bg-pressed', gt[1].l - gt[0].r === 13 && (await st('#ttok', ['backgroundColor'])).backgroundColor === 'rgb(1, 2, 3)', JSON.stringify(gt));

const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const d = document.createElement('div'); d.style.background = 'var(--surface)'; document.body.appendChild(d); const surf = rgb(getComputedStyle(d).backgroundColor); d.remove();
    const e = document.getElementById('titalic'), s = getComputedStyle(e);
    for (const [name, a, c, min] of [['pressed text', rgb(s.color), rgb(s.backgroundColor), 4.5], ['pressed border on surface', rgb(s.borderTopColor), surf, 3]]) {
      const r = ratio(a, c); n++;
      if (r < min) low.push(`${th} ${name}: ${r.toFixed(2)}`);
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: pressed text 4.5:1 on its background, the pressed border 3:1 on surface, in all six themes', contrast.low.length === 0 && contrast.n === 12, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('ButtonGroup and ToggleButton', R) ? 0 : 1);

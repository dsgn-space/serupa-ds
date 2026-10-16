// Alert: tones, roles, parts, icon choices, dismiss, contrast in every theme, component tokens and forced colors.
//   node tools/test/alert.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const TONES = ['info', 'success', 'warning', 'danger', 'neutral'];
const APP = `<div id="root" style="padding:16px;display:flex;flex-direction:column;gap:12px;max-width:480px"></div>
<script>
var D = window.Diki, h = React.createElement; window.dismissed = 0;
var TONES = ${JSON.stringify(TONES)};
function App() {
  var s = React.useState(true);
  return h(React.Fragment, null,
    h(D.Alert, { id: 'def', ref: window.r = React.createRef(), className: 'extra', 'data-x': 'y' }, 'Plain message'),
    TONES.map(function (t) { return h(D.Alert, { key: t, 'data-t': t, tone: t, title: 'Title ' + t, actions: h(D.Button, { size: 'sm', variant: 'secondary' }, 'Act') }, 'Message ' + t); }),
    h(D.Alert, { id: 'bad', tone: 'gold' }, 'Bad'),
    h(D.Alert, { id: 'noicon', icon: false, title: 'No icon' }),
    h(D.Alert, { id: 'named', icon: 'bolt' }, 'Named icon'),
    h(D.Alert, { id: 'role', tone: 'danger', role: 'status' }, 'Quiet danger'),
    s[0] ? h(D.Alert, { id: 'dis', tone: 'success', onDismiss: function () { window.dismissed++; s[1](false); } }, 'Saved') : null,
    h(D.Alert, { id: 'dl', onDismiss: function () {}, dismissLabel: 'Close notice' }, 'Label'),
    h(D.Alert, { id: 'tok', style: { '--alert-bg-info': 'rgb(1, 2, 3)', '--alert-radius': '3px', '--alert-padding-x': '7px' } }, 'Tokens'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext()).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('alert.html', APP, { react: true }));
await p.waitForTimeout(300);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);
const varColor = (v) => p.evaluate((v) => { const d = document.createElement('div'); d.style.color = `var(--${v})`; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }, v);

const d = await p.evaluate(() => { const e = document.getElementById('def'); return { tag: e.tagName, cls: e.className, data: [e.dataset.component, e.dataset.tone].join(), role: e.getAttribute('role'), ref: window.r.current === e, x: e.dataset.x, icon: e.querySelector('.dk-alert__icon').textContent, hid: e.querySelector('.dk-alert__icon').getAttribute('aria-hidden'), title: !!e.querySelector('.dk-alert__title'), msg: e.querySelector('.dk-alert__message').textContent, close: !!e.querySelector('button') }; });
t('defaults: an info alert (role status) with the info icon, hidden from screen readers; no title or close button; ref, className and props reach it', d.tag === 'DIV' && d.cls === 'dk-alert dk-alert--info extra' && d.data === 'alert,info' && d.role === 'status' && d.ref && d.x === 'y' && d.icon === 'info' && d.hid === 'true' && !d.title && d.msg === 'Plain message' && !d.close, JSON.stringify(d));
const roles = await p.evaluate((tones) => tones.map((t) => { const e = document.querySelector(`[data-t="${t}"]`); return [e.getAttribute('role'), e.querySelector('.dk-alert__icon').textContent].join(':'); }), TONES);
t('tones: info and success and neutral are status, warning and danger are alert; each has its own icon', roles.join() === 'status:info,status:check_circle,alert:warning,alert:error,status:info', roles.join());
t('an unknown tone falls back to info; role can be overridden', await p.evaluate(() => document.getElementById('bad').dataset.tone === 'info' && document.getElementById('role').getAttribute('role') === 'status'));
const ic = await p.evaluate(() => ({ none: !document.querySelector('#noicon .dk-alert__icon'), named: document.querySelector('#named .dk-alert__icon').textContent, msg: !document.querySelector('#noicon .dk-alert__message') }));
t('icon={false} removes it, an icon name replaces it; no children means no message', ic.none && ic.named === 'bolt' && ic.msg, JSON.stringify(ic));

const box = await st('#def', ['paddingTop', 'paddingLeft', 'borderTopWidth', 'borderTopLeftRadius', 'columnGap', 'fontSize', 'lineHeight', 'display']);
t('layout: 12px by 16px padding, a 1px border, 8px corners, 12px between icon and content, text-sm', box.paddingTop === '12px' && box.paddingLeft === '16px' && box.borderTopWidth === '1px' && box.borderTopLeftRadius === '8px' && box.columnGap === '12px' && box.fontSize === '14px' && box.lineHeight === '20px' && box.display === 'flex', JSON.stringify(box));
const isz = await st('#def .dk-alert__icon .dk-icon', ['fontSize']);
t('the icon is 20px, as tall as the first line', isz.fontSize === '20px', isz.fontSize);
const ti = await st('[data-t="info"] .dk-alert__title', ['fontWeight', 'marginTop']);
t('title: font-semibold, no margin; actions in a row under the message', ti.fontWeight === '600' && ti.marginTop === '0px' && await p.evaluate(() => getComputedStyle(document.querySelector('[data-t="info"] .dk-alert__actions')).display === 'flex'), JSON.stringify(ti));
const tones = {};
for (const [tn, bg] of [['info', 'info-subtle'], ['success', 'success-subtle'], ['warning', 'warning-subtle'], ['danger', 'danger-subtle'], ['neutral', 'surface-muted']]) tones[tn] = [(await st(`[data-t="${tn}"]`, ['backgroundColor'])).backgroundColor, await varColor(bg)];
t('backgrounds: each tone\'s -subtle color (neutral: surface-muted)', Object.values(tones).every(([a, b2]) => a === b2), JSON.stringify(tones));

// dismiss
const dl = await p.evaluate(() => { const b = document.querySelector('#dis button'), r = b.getBoundingClientRect(); return { name: b.getAttribute('aria-label'), type: b.type, icon: b.textContent, size: [r.width, r.height], other: document.querySelector('#dl button').getAttribute('aria-label') }; });
t('dismiss: a 24×24 ghost button named "Dismiss" (dismissLabel changes it) with a close icon', dl.name === 'Dismiss' && dl.type === 'button' && dl.icon === 'close' && dl.size.join() === '24,24' && dl.other === 'Close notice', JSON.stringify(dl));
await p.focus('#dis button'); await p.keyboard.press('Enter'); await p.waitForTimeout(50);
t('dismiss: Enter calls onDismiss', await p.evaluate(() => window.dismissed === 1 && !document.getElementById('dis')));

const tok = await st('#tok', ['backgroundColor', 'borderTopLeftRadius', 'paddingLeft']);
t('component tokens (--alert-bg-info, --alert-radius, --alert-padding-x) override one alert', tok.backgroundColor === 'rgb(1, 2, 3)' && tok.borderTopLeftRadius === '3px' && tok.paddingLeft === '7px', JSON.stringify(tok));

// contrast: title and message 4.5:1, icon 3:1, on every tone in every theme
const contrast = await p.evaluate((tones) => {
  const rgb = (c) => { const m = c.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; };
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    for (const tn of tones) {
      const e = document.querySelector(`[data-t="${tn}"]`), bg = rgb(getComputedStyle(e).backgroundColor);
      for (const [sel, min] of [['.dk-alert__title', 4.5], ['.dk-alert__message', 4.5], ['.dk-alert__icon', 3]]) {
        const r = ratio(rgb(getComputedStyle(e.querySelector(sel)).color), bg); n++;
        if (r < min) low.push(`${th} ${tn} ${sel}: ${r.toFixed(2)}`);
      }
    }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
}, TONES);
t('contrast: title and message 4.5:1, icon 3:1, on all five tones in all six themes', contrast.low.length === 0 && contrast.n === 90, contrast.low.join('; '));
t('no errors on the page', errors.length === 0, errors.join('; '));

{
  const fp = await (await b.newContext({ forcedColors: 'active' })).newPage();
  await fp.goto(writePage('alert-fc.html', APP, { react: true })); await fp.waitForTimeout(300);
  const fc = await fp.evaluate(() => { const s = getComputedStyle(document.getElementById('def')); return s.borderTopColor !== 'rgba(0, 0, 0, 0)' && s.borderTopStyle === 'solid'; });
  t('forced colors: a visible border', fc);
  await fp.close();
}

await b.close();
cleanup();
process.exit(report('Alert', R) ? 0 : 1);

// Button and Icon behaviour: forms, loading, links (href, configure), native attributes, accessibility.
//   node tools/test/button.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<form id="other" action="about:blank"></form><div id="pop" popover>Popover</div><dialog id="dlg">Dialog</dialog><div id="root"></div>
<script>
var D = window.Diki, h = React.createElement; window.log = []; window.r1 = React.createRef(); window.r2 = React.createRef(); window.warnings = [];
var cw = console.warn; console.warn = function (m) { window.warnings.push(String(m)); cw.apply(console, arguments); };
// a router-style link component, as an app would register with Diki.configure({ link })
var RouterLink = React.forwardRef(function RouterLink(p, ref) { return h('a', Object.assign({}, p, { ref: ref, 'data-router': '', onClick: function (e) { if (p.onClick) p.onClick(e); if (!e.defaultPrevented) { e.preventDefault(); window.log.push('router:' + p.href); } } })); });
window.configured = Diki.configure({ link: RouterLink });
function App() {
  var s = React.useState(false), loading = s[0]; window.setL = s[1];
  return h('div', null,
    h('form', { id: 'f', onSubmit: function (e) { e.preventDefault(); log.push('submit'); } },
      h('input', { id: 'in' }),
      h(D.Button, { id: 'sub', type: 'submit', loading: loading, onClick: function () { log.push('subclick'); } }, 'Save')),
    h(D.Button, { id: 'plain', onClick: function () { log.push('plain'); } }, 'Plain'),
    h('form', { onSubmit: function (e) { e.preventDefault(); log.push('BAD-submit'); } }, h(D.Button, { id: 'deftype' }, 'NoType')),
    h(D.Button, { href: '#x', id: 'link', ref: r1, loading: loading, onClick: function () { log.push('btnclick'); } }, 'Link'),
    h(D.Button, { href: 'https://example.com/', id: 'ext', target: '_blank' }, 'External'),
    h(D.Button, { href: '#routed', id: 'routed', variant: 'secondary' }, 'Routed'),
    h(D.Button, { href: '#bad', id: 'dlink', disabled: true, onClick: function () { log.push('BAD-disabledlink'); } }, 'Off'),
    h(D.Button, { id: 'dis', disabled: true, variant: 'outline', size: 'lg', destructive: true, onClick: function () { log.push('BAD-dis'); } }, 'Dis'),
    h(D.Button, { id: 'icononly', icon: 'settings', 'aria-label': 'Settings', loading: loading }),
    h(D.Button, { id: 'left', leftIcon: 'save', loading: loading }, 'Save file'),
    h(D.Button, { id: 'attrs', type: 'submit', form: 'other', formAction: '/x', formMethod: 'post', formEncType: 'multipart/form-data', formNoValidate: true, formTarget: '_blank', name: 'intent', value: 'save' }, 'All'),
    h(D.Button, { id: 'pbtn', popoverTarget: 'pop', popoverTargetAction: 'toggle' }, 'Pop'),
    h(D.Button, { id: 'cbtn', commandfor: 'dlg', command: 'show-modal' }, 'Cmd'),
    h(D.Icon, { id: 'deco', name: 'home' }),
    h(D.Icon, { id: 'meaning', name: 'error', 'aria-label': 'Error' }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const ctx = await b.newContext();
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('button.html', APP, { react: true }));
await p.waitForTimeout(400);
const L = () => p.evaluate(() => { const l = window.log.slice(); window.log.length = 0; return l; });
const attrs = (id) => p.evaluate((id) => Object.fromEntries([...document.getElementById(id).attributes].map((a) => [a.name, a.value])), id);
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

await p.click('#sub'); t('type="submit" submits the form on click', JSON.stringify(await L()) === '["subclick","submit"]');
await p.focus('#in'); await p.keyboard.press('Enter'); t('Enter in a field submits through the submit button', (await L()).includes('submit'));
await p.click('#plain'); t('onClick runs', JSON.stringify(await L()) === '["plain"]');
await p.click('#deftype'); t('type defaults to "button" (never submits by accident)', (await L()).length === 0);
await p.click('#link'); let l = await L(); t('href renders a link through the configured component; onClick runs', JSON.stringify(l) === '["btnclick","router:#x"]', l.join());
const la = await attrs('link'); t('a Button with href is an <a> with the button classes, no type attribute', (await p.evaluate(() => document.getElementById('link').tagName)) === 'A' && /dk-btn/.test(la.class) && !('type' in la) && 'data-router' in la, JSON.stringify(la));
t('target="_blank" gets rel="noopener noreferrer"', (await attrs('ext')).rel === 'noopener noreferrer');
t('the ref reaches the link element', await p.evaluate(() => r1.current && r1.current.id === 'link' && r1.current.tagName === 'A'));
await p.evaluate(() => document.getElementById('dlink').click()); t('a disabled link ignores clicks', (await L()).length === 0 && !(await p.evaluate(() => location.hash)).includes('bad'));
const dl = await attrs('dlink'); t('a disabled link has no href (not focusable, not listed as a link), role="link", aria-disabled', !('href' in dl) && dl.role === 'link' && dl['aria-disabled'] === 'true' && !('disabled' in dl), JSON.stringify(dl));
t('a disabled link is skipped by Tab', await p.evaluate(() => { document.getElementById('dlink').focus(); return document.activeElement.id !== 'dlink'; }));
const da = await attrs('dis'); t('data attributes: component, variant, size, destructive, disabled', da['data-component'] === 'button' && da['data-variant'] === 'outline' && da['data-size'] === 'lg' && 'data-destructive' in da && 'data-disabled' in da);

const aa = await attrs('attrs');
t('native form attributes pass through', aa.form === 'other' && aa.formaction === '/x' && aa.formmethod === 'post' && aa.formenctype === 'multipart/form-data' && 'formnovalidate' in aa && aa.formtarget === '_blank' && aa.name === 'intent' && aa.value === 'save');
await p.click('#pbtn'); t('popoverTarget opens a popover', await p.evaluate(() => document.getElementById('pop').matches(':popover-open')));
await p.keyboard.press('Escape');
const cmdSupported = await p.evaluate(() => 'command' in HTMLButtonElement.prototype);
if (cmdSupported) { await p.click('#cbtn'); t('command="show-modal" opens a dialog', await p.evaluate(() => document.getElementById('dlg').open)); await p.keyboard.press('Escape'); }

t('decorative Icon is aria-hidden', (await attrs('deco'))['aria-hidden'] === 'true');
t('Icon with aria-label is role="img"', (await attrs('meaning')).role === 'img');
t('an announcer (role="status") exists before loading starts', await p.evaluate(() => { const a = document.querySelector('[data-dk-announcer]'); return a && a.getAttribute('role') === 'status' && a.textContent === ''; }));

await p.evaluate(() => window.setL(true)); await p.waitForTimeout(150);
await p.click('#sub', { force: true }); t('loading: clicks do nothing', (await L()).length === 0);
await p.focus('#in'); await p.keyboard.press('Enter'); t('loading: Enter in a field does not resubmit', (await L()).length === 0);
await p.focus('#sub'); await p.keyboard.press('Enter'); await p.keyboard.press('Space'); t('loading: Enter and Space on the button do nothing', (await L()).length === 0);
t('loading: the button keeps keyboard focus', await p.evaluate(() => document.activeElement.id === 'sub'));
const sa = await attrs('sub'); t('loading: aria-busy, aria-disabled, data-loading', sa['aria-busy'] === 'true' && sa['aria-disabled'] === 'true' && 'data-loading' in sa);
const h0 = await p.evaluate(() => location.hash); await p.click('#link', { force: true });
t('a loading link does not navigate', (await L()).length === 0 && (await p.evaluate(() => location.hash)) === h0);
t('loading: "Loading" is announced', await p.evaluate(() => document.querySelector('[data-dk-announcer]').textContent === 'Loading'));
const snap = await p.locator('#sub').ariaSnapshot().catch(async () => p.evaluate(() => document.getElementById('sub').textContent));
t('loading: the button keeps its accessible name', /Save/.test(snap), snap);
const geo = await p.evaluate(() => ['sub', 'left', 'icononly'].map((id) => { const b = document.getElementById(id).getBoundingClientRect(); const s = document.querySelectorAll('#' + id + ' .dk-btn__spinner'); const r = s[0].getBoundingClientRect(); return { n: s.length, dx: Math.round(r.left + r.width / 2 - (b.left + b.width / 2)), dy: Math.round(r.top + r.height / 2 - (b.top + b.height / 2)) }; }));
t('loading: one spinner, centered, on every kind of button', geo.every((g) => g.n === 1 && Math.abs(g.dx) <= 1 && Math.abs(g.dy) <= 1), JSON.stringify(geo));
t('loading: the spinner is the Loader component (ring: turning, its arc growing and shrinking)', await p.evaluate(() => { const s = document.querySelector('#sub .dk-btn__spinner'); return s.dataset.component === 'loader' && s.dataset.variant === 'ring' && getComputedStyle(s.querySelector('svg')).animationName === 'spin' && getComputedStyle(s.querySelector('.dk-loader__arc')).animationName === 'dk-loader-arc'; }));

await p.evaluate(() => window.setL(false)); await p.waitForTimeout(150);
await p.click('#sub'); t('after loading the button submits again', (await L()).includes('submit'));
const w = await p.evaluate(() => window.warnings);
t('no warnings for correct use', w.length === 0, w.join(' | '));
await p.evaluate(() => { const h = React.createElement, d = document.createElement('div'); document.body.appendChild(d); ReactDOM.createRoot(d).render(h('div', null, h(Diki.Button, { icon: 'close' }))); });
await p.waitForTimeout(150);
const w2 = await p.evaluate(() => window.warnings.join(' | '));
t('warns on an icon-only button without a label', /needs an aria-label/.test(w2), w2);
t('the API is Diki\'s own: buttonClass and configure, none of the 1.0 names', await p.evaluate(() => typeof Diki.buttonClass === 'function' && typeof Diki.configure === 'function' && !('buttonVariants' in Diki) && !('TailwindPalette' in window) && Diki.buttonClass() === 'dk-btn dk-btn--primary dk-btn--size-md'));
const um = await p.evaluate(() => new Promise((res) => { const d = document.createElement('div'); document.body.appendChild(d); const root = ReactDOM.createRoot(d); const h = React.createElement;
  root.render(h('div', null, h(Diki.Button, null, 'A'), h(Diki.Button, { loading: true }, 'B'), h(Diki.Loader, { delay: 0 }), h(Diki.Loader, {})));
  setTimeout(() => { try { root.unmount(); res('ok'); } catch (e) { res(e.message); } }, 100); }));
await p.waitForTimeout(100);
t('Buttons and Loaders can be removed from the page (unmounted) without errors', um === 'ok' && errors.length === 0, um + ' ' + errors.join(' | '));
t('no page errors', errors.length === 0, errors.join(' | '));

// component tokens: overrides on a container and on one button, and themes still work inside
await p.evaluate(() => { const h = React.createElement, d = document.createElement('div'); d.id = 'ctok'; document.body.appendChild(d);
  ReactDOM.createRoot(d).render(h('div', null,
    h('div', { id: 'pill', style: { '--button-radius': 'var(--rounded-full)', '--button-height-md': 'var(--control-height-lg)' } }, h(Diki.Button, { id: 'pb' }, 'Pill')),
    h(Diki.Button, { id: 'one', style: { '--button-primary-bg': 'var(--emerald-600)' } }, 'One'),
    h(Diki.Button, { id: 'plainb' }, 'Plain'),
    h('div', { 'data-theme': 'violet-dark' }, h(Diki.Button, { id: 'nested' }, 'Nested'), h(Diki.Button, { id: 'nested-d', destructive: true, variant: 'outline' }, 'Del')))); });
await p.waitForTimeout(150);
const ct = await p.evaluate(() => { const g = (id) => getComputedStyle(document.getElementById(id)); const probe = (theme, prop, v) => { const d = document.createElement('div'); if (theme) d.setAttribute('data-theme', theme); d.style[prop] = v; document.body.appendChild(d); const r = getComputedStyle(d)[prop]; d.remove(); return r; };
  return { pillRadius: g('pb').borderTopLeftRadius, pillH: g('pb').height, oneBg: g('one').backgroundColor, emerald: probe(null, 'backgroundColor', 'var(--emerald-600)'), plainBg: g('plainb').backgroundColor, primary: probe(null, 'backgroundColor', 'var(--primary)'),
    nestedBg: g('nested').backgroundColor, violetPrimary: probe('violet-dark', 'backgroundColor', 'var(--primary)'), nestedBorder: g('nested-d').borderTopColor, violetDangerBorder: probe('violet-dark', 'borderTopColor', 'var(--danger-border)') }; });
t('component tokens: --button-radius and --button-height-md on a container change the buttons inside', parseFloat(ct.pillRadius) > 1000 && ct.pillH === '44px', JSON.stringify(ct));
t('component tokens: --button-primary-bg on one button changes only that button', ct.oneBg === ct.emerald && ct.plainBg === ct.primary);
t('component tokens: inside a nested theme the defaults follow that theme', ct.nestedBg === ct.violetPrimary && ct.nestedBorder === ct.violetDangerBorder);

// reduced motion follows the foundation rule
const rm = await b.newContext({ reducedMotion: 'reduce' });
const q = await rm.newPage();
await q.goto(writePage('button.html', APP, { react: true })); await q.waitForTimeout(300);
await q.evaluate(() => window.setL(true)); await q.waitForTimeout(150);
const anim = await q.evaluate(() => { const s = getComputedStyle(document.querySelector('#sub .dk-btn__spinner svg')); return s.animationName + ' ' + s.animationDuration; });
t('reduced motion: spinner turns 3x slower (animate-spin-reduced)', anim === 'spin 3s', anim);

await b.close();
cleanup();
process.exit(report('Button', R) ? 0 : 1);

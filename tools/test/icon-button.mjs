// IconButton and Fab: the label as the name, the defaults, shapes, links, the FAB's size, shape, shadow, corner
// placement (and right-to-left), extended, keyboard (Tab, Enter, Space, the focus ring) and component tokens.
//   node tools/test/icon-button.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:120px 120px 16px;display:flex;flex-wrap:wrap;gap:12px;align-items:center"></div>
<script>
var D = window.Diki, h = React.createElement; window.clicks = 0; window.warns = [];
var cw = console.warn; console.warn = function (m) { window.warns.push(String(m)); cw.apply(console, arguments); };
function App() {
  var hit = function () { window.clicks++; };
  return h(React.Fragment, null,
    h(D.IconButton, { id: 'ib', icon: 'more_vert', label: 'More actions', onClick: hit, ref: window.r = React.createRef(), className: 'extra' }),
    h(D.IconButton, { id: 'ibr', icon: 'edit', label: 'Edit', shape: 'round', variant: 'secondary', size: 'lg' }),
    h(D.IconButton, { id: 'ibl', icon: 'open_in_new', label: 'Open', href: '#x' }),
    h(D.IconButton, { id: 'ibt', icon: 'close', label: 'Close', noTitle: true, destructive: true }),
    h(D.IconButton, { id: 'ibtitle', icon: 'close', label: 'Close', title: 'Close (Esc)' }),
    h(D.Fab, { id: 'fab', icon: 'add', label: 'New project', onClick: hit, ref: window.fr = React.createRef() }),
    h(D.Fab, { id: 'fbs', icon: 'add', label: 'Add', size: 'sm', position: 'top-start' }),
    h(D.Fab, { id: 'fext', icon: 'edit', label: 'Compose', extended: true, position: 'bottom-start' }),
    h(D.Fab, { id: 'fst', icon: 'add', label: 'Static', position: 'static' }),
    h(D.Fab, { id: 'fbad', icon: 'add', label: 'Bad', position: 'middle', style: { '--fab-size': '50px', '--fab-offset': '10px' } }),
    h('div', { dir: 'rtl' }, h(D.Fab, { id: 'frtl', icon: 'add', label: 'RTL', position: 'top-end' })));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('icon-button.html', APP, { react: true }));
await p.waitForTimeout(300);
const box = (id) => p.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); }, id);
const st = (sel, props) => p.evaluate(([s, ps]) => { const c = getComputedStyle(document.querySelector(s)); return Object.fromEntries(ps.map((k) => [k, c[k]])); }, [sel, props]);

const ib = await p.evaluate(() => { const e = document.getElementById('ib'); return { tag: e.tagName, type: e.type, name: e.getAttribute('aria-label'), title: e.title, v: e.dataset.variant, shape: e.dataset.shape, only: e.hasAttribute('data-icon-only'), cls: e.className, ref: window.r.current === e, icon: e.querySelector('.dk-icon').textContent }; });
t('IconButton: a ghost icon-only <button>, named by label (aria-label and title); ref and className reach it', ib.tag === 'BUTTON' && ib.type === 'button' && ib.name === 'More actions' && ib.title === 'More actions' && ib.v === 'ghost' && ib.shape === 'square' && ib.only && /dk-icon-btn/.test(ib.cls) && /extra/.test(ib.cls) && ib.ref && ib.icon === 'more_vert', JSON.stringify(ib));
const sq = await box('ib');
t('IconButton md: a 32px square', sq[2] === 32 && sq[3] === 32, sq.join());
const rd = await st('#ibr', ['borderTopLeftRadius', 'width', 'height']);
t('shape round: a circle; variant and size pass through to Button', parseFloat(rd.borderTopLeftRadius) >= 22 && rd.width === '44px' && rd.height === '44px' && await p.evaluate(() => document.getElementById('ibr').dataset.variant === 'secondary'), JSON.stringify(rd));
const ln = await p.evaluate(() => { const e = document.getElementById('ibl'); return [e.tagName, e.getAttribute('href'), e.getAttribute('aria-label')].join(); });
t('IconButton with href is a link', ln === 'A,#x,Open', ln);
const tt = await p.evaluate(() => [document.getElementById('ibt').hasAttribute('title'), document.getElementById('ibt').hasAttribute('data-destructive'), document.getElementById('ibtitle').title]);
t('noTitle leaves out the tooltip; a given title wins; destructive passes through', tt[0] === false && tt[1] === true && tt[2] === 'Close (Esc)', JSON.stringify(tt));
await p.click('#ib');
t('IconButton: click calls onClick', await p.evaluate(() => window.clicks === 1));

const fab = await p.evaluate(() => { const e = document.getElementById('fab'), s = getComputedStyle(e); return { name: e.getAttribute('aria-label'), title: e.title, v: e.dataset.variant, pos: s.position, ref: window.fr.current === e, z: s.zIndex, r: s.borderTopLeftRadius, sh: s.boxShadow, icon: getComputedStyle(e.querySelector('.dk-icon')).fontSize }; });
t('Fab: a primary <button> named by label, fixed, z-index 30, round, raised (shadow-lg), with a 24px icon', fab.name === 'New project' && fab.title === 'New project' && fab.v === 'primary' && fab.pos === 'fixed' && fab.z === '30' && parseFloat(fab.r) >= 28 && /10px 15px -3px/.test(fab.sh) && fab.ref && fab.icon === '24px', JSON.stringify(fab));
const fb = await box('fab');
t('Fab: 56×56, 24px from the bottom-end corner', fb[2] === 56 && fb[3] === 56 && fb[0] + 56 === 800 - 24 && fb[1] + 56 === 600 - 24, fb.join());
const fs = await box('fbs');
t('Fab size sm, top-start: 40×40, 24px from the top-left corner', fs.join() === '24,24,40,40', fs.join());
const fx = await p.evaluate(() => { const e = document.getElementById('fext'), r = e.getBoundingClientRect(); return { label: e.querySelector('.dk-btn__label').textContent, aria: e.getAttribute('aria-label'), w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), pl: getComputedStyle(e).paddingLeft }; });
t('Fab extended: the label shows next to the icon (no aria-label needed), 56px tall, wider than square, 20px side padding, bottom-start', fx.label === 'Compose' && fx.aria === null && fx.h === 56 && fx.w > 56 && fx.left === 24 && fx.pl === '20px', JSON.stringify(fx));
const fst = await st('#fst', ['position']);
t('Fab position static: stays in the flow', fst.position !== 'fixed', fst.position);
const fbad = await box('fbad');
t('Fab: an unknown position falls back to bottom-end; --fab-size and --fab-offset override one', fbad[2] === 50 && fbad[0] + 50 === 800 - 10 && fbad[1] + 50 === 600 - 10, fbad.join());
const rtl = await box('frtl');
t('Fab: the corner follows the text direction (top-end is top-left in right-to-left)', rtl[0] === 24 && rtl[1] === 24, rtl.join());
await p.hover('#fst'); await p.waitForTimeout(300);
t('Fab hover: a deeper shadow (shadow-xl)', /20px 25px -5px/.test((await st('#fst', ['boxShadow'])).boxShadow));
// Keyboard: Tab reaches the buttons in order, Enter and Space press them, and focus shows a ring.
await p.reload(); await p.waitForSelector('#ib');   // a fresh page, so Tab starts at the top
await p.keyboard.press('Tab');
t('keyboard: Tab reaches the first IconButton', await p.evaluate(() => document.activeElement.id === 'ib'));
await p.keyboard.press('Enter'); await p.keyboard.press('Space');
t('keyboard: Enter and Space press an IconButton', await p.evaluate(() => window.clicks === 2));
// The ring: focus-visible, the --dk-btn-ring color in the box-shadow, and the outline drawn in forced-colors mode.
const ring = (id) => p.evaluate(async (id) => {
  const e = document.getElementById(id);
  await Promise.all(e.getAnimations().map((a) => a.finished));   // the ring fades in
  const probe = document.createElement('span');
  probe.style.color = 'var(--dk-btn-ring)'; e.appendChild(probe); const c = getComputedStyle(probe).color; probe.remove();
  const s = getComputedStyle(e);
  return e.matches(':focus-visible') && s.boxShadow.includes(c) && s.outlineStyle === 'solid' && s.outlineWidth === '2px';
}, id);
t('keyboard: a focused IconButton shows its focus ring', await ring('ib'));
let order = [];
for (let i = 0; i < 12 && !order.includes('fab'); i++) { await p.keyboard.press('Tab'); order.push(await p.evaluate(() => document.activeElement.id)); }
t('keyboard: Tab reaches the Fab', order.includes('fab'), order.join());
await p.evaluate(() => { window.clicks = 0; });
await p.keyboard.press('Enter'); await p.keyboard.press('Space');
t('keyboard: Enter and Space press the Fab', await p.evaluate(() => window.clicks === 2));
t('keyboard: a focused Fab shows its focus ring', await ring('fab'));
t('no warnings about missing labels, no errors', !(await p.evaluate(() => window.warns.some((m) => /aria-label/.test(m)))) && errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('IconButton and Fab', R) ? 0 : 1);

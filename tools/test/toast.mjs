// Toast: toast() into the Toaster, the region, tones and icons, announcements, the action and close buttons,
// auto-dismiss with pause on hover and focus, replacing by id, positions, contrast in every theme and tokens.
//   node tools/test/toast.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root"></div>
<script>
var D = window.Diki, h = React.createElement; window.undos = 0;
function App() { var s = React.useState('bottom-end'); window.setPos = s[1]; return h(D.Toaster, { position: s[0], className: 'extra' }); }
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('toast.html', APP, { react: true }));
await p.waitForTimeout(300);
const list = () => p.evaluate(() => [...document.querySelectorAll('.dk-toast')].map((x) => x.querySelector('.dk-toast__title').textContent));

const reg = await p.evaluate(() => { const s = document.querySelector('.dk-toaster'); return { tag: s.tagName, label: s.getAttribute('aria-label'), list: s.firstElementChild.tagName, cls: s.className, ann: !!document.querySelector('[data-dk-announcer]') }; });
t('the Toaster is a <section> named "Notifications" holding a list, and the shared live region exists', reg.tag === 'SECTION' && reg.label === 'Notifications' && reg.list === 'OL' && /extra/.test(reg.cls) && reg.ann, JSON.stringify(reg));
const id = await p.evaluate(() => D.toast({ title: 'Changes saved', description: 'All files are up to date.', tone: 'success', duration: 0 }));
await p.waitForTimeout(350);
const one = await p.evaluate(() => { const x = document.querySelector('.dk-toast'), r = x.getBoundingClientRect(); return { lab: document.getElementById(x.getAttribute('aria-labelledby')).textContent, desc: document.getElementById(x.getAttribute('aria-describedby')).textContent, icon: x.querySelector('.dk-toast__icon').textContent, close: x.querySelector('.dk-toast__close').getAttribute('aria-label'), said: document.querySelector('[data-dk-announcer]').textContent, w: r.width, right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom) }; });
t('toast() shows it at the bottom end, 16px in, 384px wide: labelled by its title, described by its description, a tone icon, a Dismiss button; announced politely', typeof id === 'string' && one.lab === 'Changes saved' && one.desc === 'All files are up to date.' && one.icon === 'check_circle' && one.close === 'Dismiss' && one.said === 'Changes saved. All files are up to date.' && one.w === 384 && one.right === 16 && one.bottom === 16, JSON.stringify(one));
await p.evaluate(() => D.toast('Plain message'));
await p.waitForTimeout(100);
const two = await p.evaluate(() => [...document.querySelectorAll('.dk-toast')].map((x) => x.dataset.tone + ':' + !!x.querySelector('.dk-toast__icon')).join());
t('a string is a neutral toast with no icon; newest at the bottom for bottom positions', two === 'success:true,neutral:false', two);
await p.evaluate((id) => D.toast({ id: id, title: 'Saved again', tone: 'info', duration: 0 }), id);
await p.waitForTimeout(100);
t('the same id replaces a toast in place', (await list()).join() === 'Saved again,Plain message');
await p.click('.dk-toast:first-child .dk-toast__close'); await p.waitForTimeout(100);
t('the close button dismisses it', (await list()).join() === 'Plain message');
await p.evaluate(() => D.toast.dismiss());
await p.evaluate(() => D.toast({ title: 'Moved to trash', action: { label: 'Undo', onClick: function () { window.undos++; } }, duration: 0 }));
await p.waitForTimeout(100);
await p.click('.dk-toast__action'); await p.waitForTimeout(100);
t('the action runs and closes the toast', (await p.evaluate(() => window.undos)) === 1 && (await list()).length === 0);
await p.evaluate(() => D.toast({ title: 'Quick', duration: 400 }));
await p.waitForTimeout(250);
await p.hover('.dk-toast'); await p.waitForTimeout(500);
const held = (await list()).length;
await p.mouse.move(0, 0); await p.waitForTimeout(700);
t('it goes after its duration, and the time stops while it\'s hovered', held === 1 && (await list()).length === 0, held);
await p.evaluate(() => D.toast({ title: 'Focus me', duration: 300, action: { label: 'Open', onClick: function () {} } }));
await p.waitForTimeout(100); await p.focus('.dk-toast__action'); await p.waitForTimeout(500);
const fheld = (await list()).length;
await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(350);
t('and while something in it has focus', fheld === 1 && (await list()).length === 0, fheld);
await p.evaluate(() => { window.setPos('top-center'); D.toast({ title: 'First', duration: 0 }); D.toast({ title: 'Second', duration: 0 }); });
await p.waitForTimeout(150);
const top = await p.evaluate(() => { const s = document.querySelector('.dk-toaster').getBoundingClientRect(); return { top: Math.round(s.top), center: Math.round(s.left + s.width / 2), order: [...document.querySelectorAll('.dk-toast__title')].map((x) => x.textContent).join() }; });
t('top-center: 16px from the top, centered, newest on top', top.top === 16 && top.center === 500 && top.order === 'Second,First', JSON.stringify(top));
await p.evaluate(() => { D.toast.dismiss(); window.setPos('bottom-start'); ['info', 'success', 'warning', 'danger'].forEach(function (k) { D.toast({ title: k, description: 'Details', tone: k, duration: 0 }); }); });
await p.waitForTimeout(300);
const bs = await p.evaluate(() => Math.round(document.querySelector('.dk-toaster').getBoundingClientRect().left));
t('bottom-start: 16px from the start edge', bs === 16, bs);
const contrast = await p.evaluate(() => {
  const still = document.createElement('style'); still.textContent = '* { animation: none !important; }'; document.head.appendChild(still);
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    for (const x of document.querySelectorAll('.dk-toast')) {
      const bg = rgb(getComputedStyle(x).backgroundColor);
      for (const [sel, min] of [['.dk-toast__title', 4.5], ['.dk-toast__description', 4.5], ['.dk-toast__icon', 3]]) { const r = ratio(rgb(getComputedStyle(x.querySelector(sel)).color), bg); n++; if (r < min) low.push(`${th} ${x.dataset.tone} ${sel}: ${r.toFixed(2)}`); }
    }
  }
  document.documentElement.removeAttribute('data-theme'); still.remove();
  return { low, n };
});
t('contrast: title and description 4.5:1, icons 3:1, for every tone in all six themes', contrast.low.length === 0 && contrast.n === 72, contrast.low.join('; '));
const look = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('.dk-toast')); return { pad: s.paddingTop, r: s.borderTopLeftRadius, bw: s.borderTopWidth, sh: s.boxShadow }; });
t('look: 16px padding, 8px corners, a 1px border, shadow-lg', look.pad === '16px' && look.r === '8px' && look.bw === '1px' && /10px 15px -3px/.test(look.sh), JSON.stringify(look));
await p.evaluate(() => document.querySelector('.dk-toaster').style.setProperty('--toast-bg', 'rgb(1, 2, 3)'));
t('--toast-bg on the Toaster overrides every toast', await p.evaluate(() => getComputedStyle(document.querySelector('.dk-toast')).backgroundColor === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Toast', R) ? 0 : 1);

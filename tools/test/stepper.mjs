// Stepper: nav and list structure, step states (complete, current, upcoming, error), aria-current, hidden
// status words, clickable completed steps, horizontal lines level with the circles, vertical lines, sizes,
// right-to-left, contrast in every theme and tokens.
//   node tools/test/stepper.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); margin: 0; }</style><div id="root" style="padding:16px;width:640px;display:flex;flex-direction:column;gap:32px"></div>
<script>
var D = window.Serupa, h = React.createElement;
window.clicks = [];
var STEPS = [{ title: 'Account', description: 'Email and password' }, { title: 'Profile', optional: true }, { title: 'Billing' }, { title: 'Review' }];
function App() {
  var c = React.useState(2); window.setCur = c[1];
  return h(React.Fragment, null,
    h(D.Stepper, { id: 'st', steps: STEPS, current: c[0], ref: window.sr = React.createRef(), className: 'extra', onStepClick: function (i) { window.clicks.push(i); c[1](i); } }),
    h(D.Stepper, { id: 'err', steps: [{ title: 'Upload' }, { title: 'Check', status: 'error' }, { title: 'Done' }], current: 1, 'aria-label': 'Import', labels: { error: 'needs attention' } }),
    h(D.Stepper, { id: 'ver', orientation: 'vertical', steps: STEPS, current: 1 }),
    h(D.Stepper, { id: 'sm', size: 'sm', steps: STEPS, current: 4 }),
    h('div', { dir: 'rtl' }, h(D.Stepper, { id: 'rtl', steps: STEPS.slice(0, 3), current: 1 })),
    h(D.Stepper, { id: 'tok', steps: STEPS.slice(0, 2), current: 0, style: { '--stepper-active-bg': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 700, height: 900 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('stepper.html', APP, { react: true }));
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await p.waitForTimeout(300);
const steps = (id) => p.evaluate((id) => [...document.querySelectorAll('#' + id + ' li')].map((li) => ({ state: li.dataset.state, cur: li.getAttribute('aria-current'), ind: li.querySelector('.dk-stepper__indicator .dk-icon')?.dataset.icon || li.querySelector('.dk-stepper__indicator').textContent, text: li.querySelector('.dk-stepper__title').textContent, btn: !!li.querySelector('button') })), id);

const a = await p.evaluate(() => { const el = document.getElementById('st'); return { tag: el.tagName, label: el.getAttribute('aria-label'), list: el.firstElementChild.tagName, n: el.querySelectorAll('li').length, ref: window.sr.current === el, cls: el.className, comp: el.dataset.component, desc: el.querySelector('li .dk-stepper__description').textContent, opt: el.querySelectorAll('li')[1].querySelector('.dk-stepper__optional').textContent, lines: el.querySelectorAll('.dk-stepper__connector').length }; });
t('a <nav aria-label="Progress"> around an <ol> of 4 steps, 3 lines between them; description and "Optional"; ref and className reach the nav', a.tag === 'NAV' && a.label === 'Progress' && a.list === 'OL' && a.n === 4 && a.ref && /extra/.test(a.cls) && a.comp === 'stepper' && a.desc === 'Email and password' && a.opt === 'Optional' && a.lines === 3, JSON.stringify(a));
const s = await steps('st');
t('current=2: steps 1 and 2 complete with a check (read as "…, completed"), step 3 current with aria-current="step", step 4 upcoming with its number', s.map((x) => x.state).join() === 'complete,complete,current,upcoming' && s.map((x) => x.ind).join() === 'check,check,3,4' && s[0].text === 'Account, completed' && s[2].cur === 'step' && s.filter((x) => x.cur).length === 1, JSON.stringify(s));
t('with onStepClick, only completed steps are buttons', s.map((x) => x.btn).join() === 'true,true,false,false');
await p.click('#st li:first-child button');
t('clicking a completed step calls onStepClick with its index', (await p.evaluate(() => window.clicks.join())) === '0' && (await steps('st'))[0].state === 'current');
await p.evaluate(() => window.setCur(2)); await p.waitForTimeout(50);
await p.focus('#st li:nth-child(2) button'); await p.keyboard.press('Enter');
t('a completed step works from the keyboard', (await p.evaluate(() => window.clicks.join())) === '0,1');
await p.evaluate(() => window.setCur(2)); await p.waitForTimeout(50);
const geo = await p.evaluate(() => { const lis = [...document.querySelectorAll('#st li')]; return lis.slice(0, 3).map((li) => { const i = li.querySelector('.dk-stepper__indicator').getBoundingClientRect(), c = li.querySelector('.dk-stepper__connector').getBoundingClientRect(), nx = li.nextElementSibling.querySelector('.dk-stepper__indicator').getBoundingClientRect(), head = li.querySelector('.dk-stepper__head').getBoundingClientRect(); return { mid: Math.round((c.top + c.bottom) / 2 - (i.top + i.bottom) / 2), h: c.height, gapL: Math.round(c.left - head.right), gapR: Math.round(nx.left - c.right), w: Math.round(i.width) }; }); });
t('horizontal: 32px circles; each 2px line sits level with the circles\' middle, 8px from the text and the next circle', geo.every((g) => g.mid === 0 && g.h === 2 && g.gapL === 8 && g.gapR === 8 && g.w === 32), JSON.stringify(geo));
const col = await p.evaluate(() => { const lis = document.querySelectorAll('#st li'); const c = (li, sel) => getComputedStyle(li.querySelector(sel)); return { done: c(lis[0], '.dk-stepper__connector').backgroundColor, todo: c(lis[2], '.dk-stepper__connector').backgroundColor, ring: c(lis[2], '.dk-stepper__indicator').outlineStyle, ringDone: c(lis[0], '.dk-stepper__indicator').outlineStyle }; });
t('lines after completed steps are primary, others field-border; only the current circle has a ring', col.done !== col.todo && col.ring === 'solid' && col.ringDone === 'none', JSON.stringify(col));
const e = await steps('err');
t('status="error": danger circle with a mark, read as "…, needs attention" (labels)', e[1].state === 'error' && e[1].ind === 'priority_high' && e[1].text === 'Check, needs attention' && await p.evaluate(() => document.getElementById('err').getAttribute('aria-label') === 'Import'), JSON.stringify(e));
const v = await p.evaluate(() => { const lis = [...document.querySelectorAll('#ver li')]; return lis.slice(0, 3).map((li) => { const i = li.querySelector('.dk-stepper__indicator').getBoundingClientRect(), c = li.querySelector('.dk-stepper__connector').getBoundingClientRect(), nx = li.nextElementSibling.querySelector('.dk-stepper__indicator').getBoundingClientRect(); return { cx: Math.round((c.left + c.right) / 2 - (i.left + i.right) / 2), w: c.width, top: Math.round(c.top - i.bottom), bottom: Math.round(nx.top - c.bottom) }; }); });
t('vertical: a 2px line runs down the middle of each circle, 8px from it and from the next', v.every((g) => g.cx === 0 && g.w === 2 && g.top === 8 && g.bottom === 8), JSON.stringify(v));
const sm = await p.evaluate(() => ({ w: document.querySelector('#sm .dk-stepper__indicator').getBoundingClientRect().width, all: [...document.querySelectorAll('#sm li')].every((li) => li.dataset.state === 'complete'), cur: !!document.querySelector('#sm [aria-current]'), fs: getComputedStyle(document.querySelector('#sm .dk-stepper__title')).fontSize }));
t('sm: 24px circles, text-xs; current=steps.length marks every step complete, with no current step', sm.w === 24 && sm.all && !sm.cur && sm.fs === '12px', JSON.stringify(sm));
const rtl = await p.evaluate(() => { const lis = document.querySelectorAll('#rtl li'); return lis[0].getBoundingClientRect().left > lis[1].getBoundingClientRect().left; });
t('right-to-left: steps run from the right', rtl);
const contrast = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const page = getComputedStyle(document.body).backgroundColor, lis = document.querySelectorAll('#st li'), err = document.querySelectorAll('#err li')[1];
    const c = (el, sel) => getComputedStyle(el.querySelector(sel));
    const pairs = [
      ['upcoming number', c(lis[3], '.dk-stepper__indicator').color, c(lis[3], '.dk-stepper__indicator').backgroundColor, 4.5],
      ['upcoming ring', c(lis[3], '.dk-stepper__indicator').borderTopColor, page, 3],
      ['current number', c(lis[2], '.dk-stepper__indicator').color, c(lis[2], '.dk-stepper__indicator').backgroundColor, 4.5],
      ['complete circle', c(lis[0], '.dk-stepper__indicator').backgroundColor, page, 3],
      ['error mark', c(err, '.dk-stepper__indicator').color, c(err, '.dk-stepper__indicator').backgroundColor, 3],
      ['title', c(lis[0], '.dk-stepper__title').color, page, 4.5],
      ['description', c(lis[0], '.dk-stepper__description').color, page, 4.5]];
    for (const [k, fg, bg, min] of pairs) { const r = ratio(rgb(fg), rgb(bg)); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme');
  return { low, n };
});
t('contrast: numbers and text keep 4.5:1, circles, rings and marks 3:1, in all six themes', contrast.low.length === 0 && contrast.n === 42, contrast.low.join('; '));
t('--stepper-active-bg overrides one stepper', await p.evaluate(() => getComputedStyle(document.querySelector('#tok .dk-stepper__indicator')).backgroundColor === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Stepper', R) ? 0 : 1);

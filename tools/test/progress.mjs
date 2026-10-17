// Progress: the bar and the ring, values and their ARIA, clamping, max, formatValue, labels, indeterminate,
// sizes, tones, contrast (3:1 for the fill, 4.5:1 for text) in every theme and tokens.
//   node tools/test/progress.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<style>body { background: var(--surface); }</style><div id="root" style="padding:16px;width:400px"></div>
<script>
var D = window.Diki, h = React.createElement;
function App() {
  var v = React.useState(45); window.setV = v[1];
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
    h(D.Progress, { id: 'p1', value: v[0], label: 'Uploading', showValue: true, ref: window.r = React.createRef(), className: 'extra' }),
    h(D.Progress, { id: 'p2', value: 3, max: 8, 'aria-label': 'Steps', formatValue: function (v, m) { return v + ' of ' + m; }, showValue: true }),
    h(D.Progress, { id: 'p3', value: 150, 'aria-label': 'Over' }),
    h(D.Progress, { id: 'p4', value: -5, 'aria-label': 'Under' }),
    h(D.Progress, { id: 'ind', label: 'Preparing' }),
    h(D.Progress, { id: 'sm', value: 50, size: 'sm', 'aria-label': 's' }),
    h(D.Progress, { id: 'lg', value: 50, size: 'lg', 'aria-label': 'l' }),
    h('div', null,
      h(D.Progress, { id: 'c1', variant: 'circle', value: 30, showValue: true, 'aria-label': 'Storage' }),
      h(D.Progress, { id: 'csm', variant: 'circle', size: 'sm', value: 30, showValue: true, 'aria-label': 'sm' }),
      h(D.Progress, { id: 'clg', variant: 'circle', size: 'lg', value: 30, showValue: true, 'aria-label': 'lg' }),
      h(D.Progress, { id: 'cind', variant: 'circle', 'aria-label': 'Loading' })),
    ['primary', 'success', 'warning', 'danger'].map(function (t) { return h(D.Progress, { key: t, id: 'tone-' + t, className: 'tone', tone: t, value: 60, 'aria-label': t }); }),
    h(D.Progress, { id: 'tok', value: 60, 'aria-label': 'tok', style: { '--progress-fill': 'rgb(1, 2, 3)' } }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 800, height: 900 } })).newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('progress.html', APP, { react: true }));
await p.addStyleTag({ content: '* { transition: none !important; }' });
await p.waitForTimeout(300);
const bar = (id) => p.evaluate((id) => { const el = document.getElementById(id), pb = el.querySelector('[role=progressbar]') || el; const tr = el.querySelector('.dk-progress__track').getBoundingClientRect(), f = el.querySelector('.dk-progress__fill'); return { now: pb.getAttribute('aria-valuenow'), min: pb.getAttribute('aria-valuemin'), max: pb.getAttribute('aria-valuemax'), txt: pb.getAttribute('aria-valuetext'), share: f ? Math.round(f.getBoundingClientRect().width / tr.width * 100) : null, h: Math.round(tr.height), value: (el.querySelector('.dk-progress__value') || {}).textContent }; }, id);

const a = await bar('p1');
const name = await p.evaluate(() => { const pb = document.querySelector('#p1 [role=progressbar]'); return { label: document.getElementById(pb.getAttribute('aria-labelledby')).textContent, outerRole: document.getElementById('p1').getAttribute('role'), ref: window.r.current === document.getElementById('p1'), cls: document.getElementById('p1').className, comp: document.getElementById('p1').dataset.component }; });
t('bar: a progressbar with valuenow 45, min 0, max 100 and valuetext "45%", named by its label; ref and className reach the outer box', a.now === '45' && a.min === '0' && a.max === '100' && a.txt === '45%' && name.label === 'Uploading' && name.outerRole === null && name.ref && /extra/.test(name.cls) && name.comp === 'progress', JSON.stringify([a, name]));
t('the fill covers 45% of the track; showValue shows "45%" at the end of the label row; md is 8px thick', a.share === 45 && a.value === '45%' && a.h === 8, JSON.stringify(a));
await p.evaluate(() => window.setV(80)); await p.waitForTimeout(100);
const a2 = await bar('p1');
t('a new value moves the fill and the ARIA', a2.share === 80 && a2.now === '80' && a2.value === '80%', JSON.stringify(a2));
const s = await bar('p2');
t('max and formatValue: 3 of 8 is 38% of the track, and reads "3 of 8"', s.share === 38 && s.max === '8' && s.txt === '3 of 8' && s.value === '3 of 8' && await p.evaluate(() => document.querySelector('#p2 [role=progressbar]').getAttribute('aria-label') === 'Steps' && !document.getElementById('p2').hasAttribute('aria-label')), JSON.stringify(s));
const [o, u] = [await bar('p3'), await bar('p4')];
t('values are clamped to 0..max', o.share === 100 && o.now === '100' && u.share === 0 && u.now === '0', JSON.stringify([o, u]));
const ind = await p.evaluate(() => { const el = document.getElementById('ind'), pb = el.querySelector('[role=progressbar]'), f = getComputedStyle(el.querySelector('.dk-progress__fill')); return { now: pb.hasAttribute('aria-valuenow'), txt: pb.hasAttribute('aria-valuetext'), anim: f.animationName, state: el.dataset.state }; });
t('no value: indeterminate, without valuenow or valuetext, a sliding segment', !ind.now && !ind.txt && ind.anim === 'dk-progress-slide' && ind.state === 'indeterminate', JSON.stringify(ind));
t('sizes: sm 4px, lg 12px', (await bar('sm')).h === 4 && (await bar('lg')).h === 12);
const c = await p.evaluate(() => { const g = (id) => { const el = document.getElementById(id), r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), role: el.getAttribute('role'), now: el.getAttribute('aria-valuenow'), label: el.getAttribute('aria-label'), value: (el.querySelector('.dk-progress__value') || {}).textContent || null, dash: el.querySelector('.dk-progress__arc').getAttribute('stroke-dasharray') }; }; return { md: g('c1'), sm: g('csm'), lg: g('clg'), ind: g('cind'), anim: getComputedStyle(document.querySelector('#cind .dk-progress__ring')).animationName }; });
t('circle: a 40px progressbar ring (24, 64px for sm, lg), the arc 30% round, the value inside for md and lg only', c.md.w === 40 && c.md.h === 40 && c.sm.w === 24 && c.lg.w === 64 && c.md.role === 'progressbar' && c.md.now === '30' && c.md.label === 'Storage' && c.md.dash === '30 100' && c.md.value === '30%' && c.lg.value === '30%' && c.sm.value === null, JSON.stringify(c));
t('circle without a value: a quarter arc that turns', c.ind.now === null && c.ind.dash === '25 100' && c.anim === 'dk-progress-turn', JSON.stringify(c.ind));
const contrast = await p.evaluate(() => {
  const still = document.createElement('style'); still.textContent = '* { transition: none !important; animation: none !important; }'; document.head.appendChild(still);
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const low = []; let n = 0;
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    document.documentElement.setAttribute('data-theme', th);
    const page = rgb(getComputedStyle(document.body).backgroundColor);
    for (const tone of ['primary', 'success', 'warning', 'danger']) {
      const el = document.getElementById('tone-' + tone), fill = rgb(getComputedStyle(el.querySelector('.dk-progress__fill')).backgroundColor);
      const r = ratio(fill, page); n++; if (r < 3) low.push(`${th} ${tone} fill on the page: ${r.toFixed(2)}`);
    }
    for (const sel of ['#p1 .dk-progress__label', '#p1 .dk-progress__value', '#c1 .dk-progress__value']) { const r = ratio(rgb(getComputedStyle(document.querySelector(sel)).color), page); n++; if (r < 4.5) low.push(`${th} ${sel}: ${r.toFixed(2)}`); }
  }
  document.documentElement.removeAttribute('data-theme'); still.remove();
  return { low, n };
});
t('contrast: every tone\'s fill keeps 3:1 on the page, and the label and values 4.5:1, in all six themes', contrast.low.length === 0 && contrast.n === 42, contrast.low.join('; '));
t('--progress-fill overrides one bar', await p.evaluate(() => getComputedStyle(document.querySelector('#tok .dk-progress__fill')).backgroundColor === 'rgb(1, 2, 3)'));
t('no errors on the page', errors.length === 0, errors.join('; '));

await b.close();
cleanup();
process.exit(report('Progress', R) ? 0 : 1);

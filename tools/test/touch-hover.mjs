// Hover on touch screens: a phone keeps :hover on the last element tapped, so a hover color would stay on a tapped
// Button ("still selected"). On an emulated phone (touch, no hover) a tapped Button, Checkbox and Tab go back to their
// resting colors; with a mouse, hover still tints them.
//   node tools/test/touch-hover.mjs
import { writePage, browser, cleanup, report, done } from './lib.mjs';

const APP = `<div id="root"></div>
<script>
var D = window.Serupa, h = React.createElement;
ReactDOM.createRoot(document.getElementById('root')).render(h('div', { style: { display: 'flex', gap: '16px', padding: '16px' } },
  h(D.Button, { id: 'tap', variant: 'secondary' }, 'Tap'), h(D.Button, { id: 'rest', variant: 'secondary' }, 'Rest'),
  h(D.Button, { id: 'gtap', variant: 'ghost' }, 'Ghost'), h(D.Button, { id: 'grest', variant: 'ghost' }, 'Ghost')));
</script>`;

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const b = await browser();
const url = writePage('touch-hover.html', APP, { react: true });
const bg = (p, id) => p.evaluate((i) => getComputedStyle(document.getElementById(i)).backgroundColor, id);

for (const touch of [true, false]) {
  const ctx = await b.newContext(touch ? { hasTouch: true, isMobile: b.browserType().name() !== 'firefox' } : {});
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForSelector('#tap');
  const media = await p.evaluate(() => matchMedia('(hover: hover)').matches);
  const tapped = [];
  for (const [id, rest] of [['tap', 'rest'], ['gtap', 'grest']]) {
    if (touch) await p.tap('#' + id); else await p.hover('#' + id);
    await p.waitForTimeout(250);   // past the color transition
    tapped.push([id, await bg(p, id), await bg(p, rest), await p.evaluate((i) => document.getElementById(i).matches(':hover'), id)]);
  }
  if (touch) {
    if (media) t('touch emulation reports (hover: none)', false, 'this engine still reports (hover: hover) with touch on');
    else t('on a touch screen a tapped Button goes back to its resting color (secondary and ghost)', tapped.every(([, a, r]) => a === r), JSON.stringify(tapped));
  } else {
    t('with a mouse, hover still tints a Button (secondary and ghost)', media && tapped.every(([, a, r, hov]) => hov && a !== r), JSON.stringify(tapped));
  }
  await ctx.close();
}
await b.close();
cleanup();
done(report('Touch hover', R));

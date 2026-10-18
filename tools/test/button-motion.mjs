// Button micro-interactions: press feedback, right-icon nudge, loading cross-fade and ripple; their
// component tokens; reduced motion; and that none of it gets in the way of clicks, keys or your handlers.
//   node tools/test/button-motion.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:24px;display:flex;flex-wrap:wrap;gap:12px"></div>
<script>
var D = window.Serupa, h = React.createElement; window.log = [];
function App() {
  var s = React.useState(false), loading = s[0]; window.setL = s[1];
  return h(React.Fragment, null,
    h(D.Button, { id: 'press', variant: 'secondary', onClick: function () { log.push('click'); } }, 'Press me'),
    h('div', { style: { '--button-icon-nudge': 'var(--spacing-0\\\\.5)' } }, h(D.Button, { id: 'next', rightIcon: 'arrow_forward' }, 'Continue')),
    h(D.Button, { id: 'plainright', rightIcon: 'expand_more' }, 'Options'),
    h(D.Button, { id: 'back', leftIcon: 'arrow_back', variant: 'outline' }, 'Back'),
    h('div', { dir: 'rtl', style: { '--button-icon-nudge': 'var(--spacing-0\\\\.5)' } }, h(D.Button, { id: 'rtl', rightIcon: 'arrow_forward' }, 'RTL')),
    h(D.Button, { id: 'lnk', variant: 'link' }, 'Link style'),
    h(D.Button, { id: 'dis', disabled: true }, 'Disabled'),
    h(D.Button, { id: 'busy', loading: loading, leftIcon: 'save' }, 'Save'),
    h(D.Button, { id: 'big', size: 'lg', style: { width: '240px' } }, 'Wide'),
    h(D.Button, { id: 'noripple', style: { '--button-ripple-opacity': '0' } }, 'No ripple'),
    h(D.Button, { id: 'nopress', style: { '--button-press-scale': '1' } }, 'No press'),
    h('div', { style: { '--button-icon-nudge': 'var(--spacing-0\\\\.5)' } }, h('div', { style: { '--button-icon-nudge': '0px' } }, h(D.Button, { id: 'nonudge', rightIcon: 'arrow_forward' }, 'No nudge'))),
    h(D.Button, { id: 'mine', onPointerDown: function (e) { log.push('mine-down'); }, onKeyDown: function () { log.push('mine-key'); }, onKeyUp: function () { log.push('mine-up'); } }, 'Mine'),
    h(D.Button, { id: 'stop', onPointerDown: function (e) { e.preventDefault(); } }, 'Stops ripple'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];

async function open(ctxOpts = {}) {
  const ctx = await b.newContext(ctxOpts);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(writePage('button-motion.html', APP, { react: true }));
  await p.waitForTimeout(400);
  return p;
}
const center = async (p, sel) => { const r = await p.locator(sel).boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2, r]; };
const scale = (p, id) => p.evaluate((id) => getComputedStyle(document.getElementById(id)).scale, id);
const L = (p) => p.evaluate(() => { const l = window.log.slice(); window.log.length = 0; return l; });

const p = await open();

// press feedback
let [x, y] = await center(p, '#press');
await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(200);
const held = await scale(p, 'press');
await p.mouse.up(); await p.waitForTimeout(200);
t('press: held down, the button shrinks to 97% (scale-97)', held === '0.97', held);
t('press: released, it springs back and the click still fires', ['none', '1'].includes(await scale(p, 'press')) && JSON.stringify(await L(p)) === '["click"]');
t('press: animates scale only, at --button-press-duration (100ms), ease-out', await p.evaluate(() => {
  const s = getComputedStyle(document.getElementById('press')); const props = s.transitionProperty.split(', '), i = props.indexOf('scale');
  return i >= 0 && s.transitionDuration.split(', ')[i] === '0.1s' && /cubic-bezier\(0, 0, 0.2, 1\)/.test(s.transitionTimingFunction.split(/, (?=c|l|e)/)[i]) && !props.includes('all') && !props.includes('width');
}));
await p.focus('#press'); await p.keyboard.down('Enter'); await p.waitForTimeout(200);
// WebKit can still be easing the scale at 200ms: wait for the transition to end
await p.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))));
const enterHeld = [await scale(p, 'press'), await p.evaluate(() => document.getElementById('press').hasAttribute('data-pressed'))];
await p.keyboard.up('Enter'); await p.waitForTimeout(200);
t('press: Enter shows the press too (data-pressed while the key is down)', enterHeld[0] === '0.97' && enterHeld[1], JSON.stringify(enterHeld));
t('press: released Enter clears it; the click fired once', !(await p.evaluate(() => document.getElementById('press').hasAttribute('data-pressed'))) && JSON.stringify(await L(p)) === '["click"]');
await p.focus('#press'); await p.keyboard.down('Enter'); await p.evaluate(() => document.getElementById('next').focus()); await p.keyboard.up('Enter');
t('press: moving focus away mid-press clears it', !(await p.evaluate(() => document.getElementById('press').hasAttribute('data-pressed')))); await L(p);
for (const id of ['lnk', 'dis']) {
  [x, y] = await center(p, '#' + id); await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(150);
  const s = await scale(p, id); await p.mouse.up();
  t(`press: no press on ${id === 'lnk' ? 'the link variant (it reads as text)' : 'a disabled button'}`, ['none', '1'].includes(s), s);
}
[x, y] = await center(p, '#nopress'); await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(150);
const np = await scale(p, 'nopress'); await p.mouse.up();
t('press: --button-press-scale: 1 turns it off', ['1', 'none'].includes(np), np);

// icon nudge
const tr = (sel) => p.evaluate((sel) => getComputedStyle(document.querySelector(sel)).translate, sel);
await p.hover('#next'); await p.waitForTimeout(250);
const nx = await tr('#next .dk-btn__icon--right');
await p.hover('#back'); await p.waitForTimeout(250);
const bx = await tr('#back .dk-btn__icon--left');
await p.hover('#rtl'); await p.waitForTimeout(250);
const rx = await tr('#rtl .dk-btn__icon--right');
await p.hover('#plainright'); await p.waitForTimeout(250);
const dx = await tr('#plainright .dk-btn__icon--right');
await p.hover('#nonudge'); await p.waitForTimeout(250);
const zx = await tr('#nonudge .dk-btn__icon--right');
await p.mouse.move(1, 1); await p.waitForTimeout(250);
t('nudge: off by default (a right icon stays still on hover)', ['none', '0px'].includes(dx), dx);
t('nudge: turned on with --button-icon-nudge: var(--spacing-0.5), a right icon slides 2px forward', nx === '2px', nx);
t('nudge: left icons stay still', ['none', '0px'].includes(bx), bx);
t('nudge: in right-to-left text it slides the other way', rx === '-2px', rx);
t('nudge: --button-icon-nudge: 0 turns it off again inside an area that turned it on', ['none', '0px'].includes(zx), zx);
t('nudge: back in place after hover', ['none', '0px'].includes(await tr('#next .dk-btn__icon--right')));

// loading cross-fade
await p.evaluate(() => window.setL(true)); await p.waitForTimeout(40);
const mid = await p.evaluate(() => [parseFloat(getComputedStyle(document.querySelector('#busy .dk-btn__label')).opacity), getComputedStyle(document.querySelector('#busy .dk-btn__loader')).animationName]);
await p.waitForTimeout(300);
const end = await p.evaluate(() => [getComputedStyle(document.querySelector('#busy .dk-btn__label')).opacity, getComputedStyle(document.querySelector('#busy .dk-btn__icon')).opacity, getComputedStyle(document.querySelector('#busy .dk-btn__loader')).opacity]);
t('loading: the label fades out instead of vanishing', mid[0] > 0 && mid[0] < 1, String(mid[0]));
t('loading: the spinner fades and grows in (dk-btn-loader-in)', mid[1] === 'dk-btn-loader-in' && end[2] === '1', JSON.stringify([mid, end]));
t('loading: once faded, label and icon are hidden', end[0] === '0' && end[1] === '0', JSON.stringify(end));
await p.evaluate(() => window.setL(false)); await p.waitForTimeout(300);
t('loading: the content fades back when done', await p.evaluate(() => getComputedStyle(document.querySelector('#busy .dk-btn__label')).opacity === '1'));

// ripple
let box; [x, y, box] = await center(p, '#big');
await p.mouse.move(box.x + 20, box.y + 10); await p.mouse.down(); await p.waitForTimeout(250);
const rp = await p.evaluate(() => { const b = document.getElementById('big'), r = b.querySelector('.dk-btn__ripple'); if (!r) return null; const rr = r.getBoundingClientRect(), bb = b.getBoundingClientRect(), s = getComputedStyle(r);
  return { n: b.querySelectorAll('.dk-btn__ripple').length, cx: Math.round(rr.left + rr.width / 2 - bb.left), cy: Math.round(rr.top + rr.height / 2 - bb.top), d: r.offsetWidth, far: Math.hypot(bb.width - 20, bb.height - 10), bg: s.backgroundColor, color: getComputedStyle(b).color, opacity: s.opacity, pe: getComputedStyle(r.parentNode).pointerEvents, clip: getComputedStyle(r.parentNode).overflow, hidden: r.parentNode.getAttribute('aria-hidden'), first: b.firstElementChild === r.parentNode }; });
t('ripple: starts at the press point', rp && Math.abs(rp.cx - 20) <= 2 && Math.abs(rp.cy - 10) <= 2, JSON.stringify(rp));
t('ripple: grows to cover the farthest corner, clipped to the button', rp && rp.d >= rp.far * 2 - 1 && rp.clip === 'hidden', JSON.stringify(rp));
t('ripple: text color at 20% (opacity-20)', rp && rp.bg === rp.color && rp.opacity === '0.2', JSON.stringify(rp));
t('ripple: never blocks clicks and is hidden from assistive tech', rp && rp.pe === 'none' && rp.hidden === 'true');
t('ripple: drawn under the label (first layer)', rp && rp.first);
const wave = await p.evaluate(() => { const r = document.querySelector('#big .dk-btn__ripple'); const a = r.getAnimations().find((x) => x.animationName === 'dk-btn-ripple'); const d = a.effect.getTiming().duration; a.pause();
  const at = (f) => { a.currentTime = d * f; return parseFloat(getComputedStyle(r).scale); }; const v = [at(0.1), at(0.5), at(1)]; a.play(); return { d, v }; });
t('ripple: spreads over 500ms (duration-500), evenly (under 15% at a tenth of the time, so a click shows a growing wave, not a flash)', wave.d === 500 && wave.v[0] < 0.15 && wave.v[1] > 0.5 && wave.v[1] < 0.9 && wave.v[2] === 1, JSON.stringify(wave));
await p.mouse.up(); await p.waitForTimeout(800);
t('ripple: fades and is removed after release', await p.evaluate(() => document.querySelectorAll('#big .dk-btn__ripple').length === 0));
await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(400);
t('ripple: a quick click still shows the whole wave (no fade until it has spread all the way)', await p.evaluate(() => { const r = document.querySelector('#big .dk-btn__ripple'); return !!r && !r.classList.contains('dk-btn__ripple--out'); }));
await p.waitForTimeout(900);
for (const [id, why] of [['noripple', '--button-ripple-opacity: 0 turns it off'], ['lnk', 'not on the link variant'], ['dis', 'not on a disabled button'], ['stop', 'not when your onPointerDown prevents the default']]) {
  [x, y] = await center(p, '#' + id); await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(60);
  const n = await p.evaluate((id) => document.querySelectorAll('#' + id + ' .dk-btn__ripple').length, id); await p.mouse.up();
  t('ripple: ' + why, n === 0, String(n));
}
await p.evaluate(() => window.setL(true)); await p.waitForTimeout(200);
[x, y] = await center(p, '#busy'); await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(60);
const busyR = await p.evaluate(() => [document.querySelectorAll('#busy .dk-btn__ripple').length, getComputedStyle(document.getElementById('busy')).scale]); await p.mouse.up();
t('loading: no press and no ripple while busy', busyR[0] === 0 && ['none', '1'].includes(busyR[1]), JSON.stringify(busyR));
await p.evaluate(() => window.setL(false)); await p.waitForTimeout(200);
// your handlers still run (before the right-click below: WebKit's context menu takes its mouseup and leaves the
// right button down, so the next left press arrives as a pointermove with no pointerdown)
[x, y] = await center(p, '#mine'); await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.up();
await p.focus('#mine'); await p.keyboard.press('Enter');
const mine = await L(p);
t('your onPointerDown, onKeyDown and onKeyUp still run', mine.includes('mine-down') && mine.includes('mine-key') && mine.includes('mine-up'), mine.join());

[x, y] = await center(p, '#big'); await p.mouse.click(x, y, { button: 'right' }); await p.waitForTimeout(60);
t('ripple: not on a right-click', await p.evaluate(() => document.querySelectorAll('#big .dk-btn__ripple').length === 0));
await p.keyboard.press('Escape');

t('the link variant renders no ripple layer', await p.evaluate(() => !document.querySelector('#lnk .dk-btn__ripples')));
t('no page errors', errors.length === 0, errors.join(' | '));

// reduced motion: no press, no nudge, no ripple; loading only fades
const q = await open({ reducedMotion: 'reduce' });
[x, y] = await center(q, '#press'); await q.mouse.move(x, y); await q.mouse.down(); await q.waitForTimeout(150);
const rmPress = await scale(q, 'press');
const rmRipple = await q.evaluate(() => document.querySelectorAll('#press .dk-btn__ripple').length); await q.mouse.up();
await q.hover('#next'); await q.waitForTimeout(200);
const rmNudge = await q.evaluate(() => getComputedStyle(document.querySelector('#next .dk-btn__icon--right')).translate);
await q.evaluate(() => window.setL(true)); await q.waitForTimeout(30);
const rmLoader = await q.evaluate(() => getComputedStyle(document.querySelector('#busy .dk-btn__loader')).scale);
t('reduced motion: no press scale', ['none', '1'].includes(rmPress), rmPress);
t('reduced motion: no ripple', rmRipple === 0, String(rmRipple));
t('reduced motion: no icon nudge', ['none', '0px'].includes(rmNudge), rmNudge);
t('reduced motion: the spinner only fades in (no growing)', ['none', '1'].includes(rmLoader), rmLoader);

await b.close();
cleanup();
process.exit(report('Button micro-interactions', R) ? 0 : 1);

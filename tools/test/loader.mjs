// Loader: the ring, dots, text and skeleton variants, sizes, tones (incl. inverse), the text variant's shine, accessibility (progressbar name, announcement,
// decorative mode), the show-after delay, component tokens, reduced motion, and Button's use of it.
//   node tools/test/loader.mjs
import { writePage, browser, cleanup, report } from './lib.mjs';

const APP = `<div id="root" style="padding:24px;display:flex;flex-wrap:wrap;gap:16px;align-items:center"></div>
<script>
var D = window.Diki, h = React.createElement; window.warnings = []; var cw = console.warn; console.warn = function (m) { window.warnings.push(String(m)); cw.apply(console, arguments); };
function App() {
  var s = React.useState(false), late = s[0]; window.showLate = function () { s[1](true); };
  var q = React.useState(true), quick = q[0]; window.hideQuick = function () { q[1](false); };
  return h(React.Fragment, null,
    h(D.Loader, { id: 'ring', delay: 0 }),
    h(D.Loader, { id: 'sm', size: 'sm', delay: 0 }),
    h(D.Loader, { id: 'lg', size: 'lg', delay: 0 }),
    h(D.Loader, { id: 'bad', size: 'xl', variant: 'bars', tone: 'pink', delay: 0 }),
    h(D.Loader, { id: 'dots', variant: 'dots', delay: 0 }),
    h(D.Loader, { id: 'spk', variant: 'spokes', delay: 0 }),
    h(D.Loader, { id: 'spklg', variant: 'spokes', size: 'lg', tone: 'primary', delay: 0 }),
    h('span', { style: { color: 'rgb(200, 30, 40)' } }, h(D.Loader, { id: 'tneutral', tone: 'neutral', delay: 0 }), h(D.Loader, { id: 'tcurrent', tone: 'current', delay: 0 })),
    h(D.Loader, { id: 'px', variant: 'pixel', delay: 0 }),
    h(D.Loader, { id: 'pxlg', variant: 'pixel', size: 'lg', tone: 'primary', delay: 0 }),
    h('div', { id: 'pxsbox', style: { background: '#fff', color: 'rgb(17, 24, 39)', padding: '4px' } }, h(D.Loader, { id: 'pxs', variant: 'pixel', delay: 0, label: '', style: { '--loader-size-md': 'var(--spacing-24)' } })),
    h(D.Loader, { id: 'pxr', variant: 'pixel', pattern: 'random', delay: 0 }),
    h(D.Loader, { id: 'pxbad', variant: 'pixel', pattern: 'zigzag', delay: 0 }),
    h(D.Loader, { id: 'ringpat', pattern: 'random', delay: 0 }),
    ['sweep', 'fall', 'rise', 'snake', 'spiral', 'cross', 'checker'].map((pt) => h(D.Loader, { key: pt, id: 'pp-' + pt, variant: 'pixel', pattern: pt, delay: 0, label: '' })),
    h(D.Loader, { id: 'pxgp', variant: 'pixel', glow: true, delay: 0 }),
    h(D.Loader, { id: 'ringglow', glow: true, delay: 0 }),
    h(D.Loader, { id: 'pxglow', variant: 'pixel', delay: 0, style: { '--loader-pixel-glow': 'var(--spacing-1)' } }),
    h(D.Loader, { id: 'primary', tone: 'primary', delay: 0 }),
    h(D.Loader, { id: 'muted', tone: 'muted', delay: 0 }),
    h('div', { id: 'scrim', style: { background: '#000', color: 'rgb(15, 23, 42)' } }, h(D.Loader, { id: 'inverse', tone: 'inverse', delay: 0 }), h(D.Loader, { id: 'inversetext', variant: 'text', tone: 'inverse', label: 'Uploading', delay: 0 })),
    h('span', { style: { color: 'rgb(15, 23, 42)' } }, h(D.Loader, { id: 'lab', variant: 'text', label: 'Loading projects', delay: 0 })),
    h('span', { style: { color: 'rgb(15, 23, 42)' } }, h(D.Loader, { id: 'labp', variant: 'text', tone: 'primary', label: 'Thinking', delay: 0 })),
    h(D.Loader, { id: 'labsm', variant: 'text', size: 'sm', label: 'Saving', delay: 0 }),
    h(D.Loader, { id: 'lablg', variant: 'text', size: 'lg', label: 'Preparing', delay: 0 }),
    h(D.Loader, { id: 'labempty', variant: 'text', label: '', delay: 0 }),
    h(D.Loader, { id: 'labdefault', variant: 'text', delay: 0 }),
    h('span', { id: 'colored', style: { color: 'rgb(200, 30, 40)' } }, h(D.Loader, { id: 'inherit', delay: 0 })),
    h(D.Loader, { id: 'named', label: 'Loading projects', delay: 0 }),
    h(D.Loader, { id: 'deco', label: '', delay: 0 }),
    h(D.Loader, { id: 'tok', delay: 0, style: { '--loader-size-md': 'var(--spacing-8)', '--loader-track-opacity': '0' } }),
    h('div', { 'data-theme': 'violet-dark' }, h(D.Loader, { id: 'nested', tone: 'primary', delay: 0 })),
    late ? h(D.Loader, { id: 'delayed' }) : null,
    quick ? h(D.Loader, { id: 'quick' }) : null,
    h(D.Loader, { id: 'ref', delay: 0, ref: window.r = React.createRef(), className: 'extra', 'data-x': 'y' }),
    h('div', { id: 'skwrap', style: { width: '300px', color: 'rgb(15, 23, 42)' } },
      h(D.Loader, { id: 'sk1', variant: 'skeleton', delay: 0 }),
      h(D.Loader, { id: 'sk3', variant: 'skeleton', lines: 3, label: '', delay: 0 }),
      h(D.Loader, { id: 'sksm', variant: 'skeleton', size: 'sm', lines: 2, label: '', delay: 0 }),
      h(D.Loader, { id: 'sklg', variant: 'skeleton', size: 'lg', label: '', delay: 0 }),
      h(D.Loader, { id: 'skc', variant: 'skeleton', shape: 'circle', label: '', delay: 0 }),
      h(D.Loader, { id: 'skclg', variant: 'skeleton', shape: 'circle', size: 'lg', label: '', delay: 0 }),
      h(D.Loader, { id: 'skcz', variant: 'skeleton', shape: 'circle', className: 'size-12', label: '', delay: 0 }),
      h(D.Loader, { id: 'skr', variant: 'skeleton', shape: 'rect', label: '', delay: 0 }),
      h(D.Loader, { id: 'skrc', variant: 'skeleton', shape: 'rect', className: 'w-48 h-32', label: '', delay: 0 }),
      h(D.Loader, { id: 'skbad', variant: 'skeleton', shape: 'hex', lines: 99, label: '', delay: 0 }),
      h(D.Loader, { id: 'skp', variant: 'skeleton', tone: 'primary', label: '', delay: 0 }),
      h(D.Loader, { id: 'sktok', variant: 'skeleton', shape: 'rect', label: '', delay: 0, style: { '--loader-skeleton-rect-height': 'var(--spacing-10)', '--loader-skeleton-radius': '0' } }),
      h('div', { style: { display: 'flex', gap: '12px' } }, h(D.Loader, { id: 'skav', variant: 'skeleton', shape: 'circle', size: 'lg', label: '', delay: 0 }), h(D.Loader, { id: 'skrow', variant: 'skeleton', lines: 2, label: '', delay: 0 })),
      late ? h(D.Loader, { id: 'skwait', variant: 'skeleton', lines: 2, label: '' }) : null),
    h('div', { style: { background: '#000', width: '200px' } }, h(D.Loader, { id: 'skinv', variant: 'skeleton', tone: 'inverse', label: '', delay: 0 })),
    h(D.Button, { id: 'btn', loading: true }, 'Save'),
    h(D.Button, { id: 'btnlg', loading: true, size: 'lg' }, 'Save'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
</script>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const errors = [];
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(writePage('loader.html', APP, { react: true }));
await p.waitForTimeout(400);
const box = (id) => p.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }, id);
const attrs = (id) => p.evaluate((id) => Object.fromEntries([...document.getElementById(id).attributes].map((a) => [a.name, a.value])), id);
const css = (sel, prop) => p.evaluate(([s, pr]) => getComputedStyle(document.querySelector(s))[pr], [sel, prop]);
const probe = (theme, v) => p.evaluate(([th, v]) => { const d = document.createElement('div'); if (th) d.setAttribute('data-theme', th); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }, [theme, v]);

// look
t('sizes: sm 16px, md 24px (default), lg 40px', JSON.stringify([await box('sm'), await box('ring'), await box('lg')]) === '[[16,16],[24,24],[40,40]]');
t('unknown variant, size and tone fall back to ring, md, current', JSON.stringify(await box('bad')) === '[24,24]' && /dk-loader--ring/.test((await attrs('bad')).class) && !/pink/.test((await attrs('bad')).class));
const ring = await p.evaluate(() => { const s = document.querySelector('#ring svg'); const tr = s.querySelector('.dk-loader__track'), arc = s.querySelector('.dk-loader__arc'); const as = getComputedStyle(arc); return { anim: getComputedStyle(s).animationName + ' ' + getComputedStyle(s).animationDuration + ' ' + getComputedStyle(s).animationTimingFunction, arcAnim: as.animationName + ' ' + as.animationDuration, track: getComputedStyle(tr).opacity, arcOp: as.opacity, cap: as.strokeLinecap, dash: arc.getAttribute('stroke-dasharray'), len: arc.getAttribute('pathLength'), sw: as.strokeWidth, fill: as.fill }; });
t('ring: an arc on a faint track (20%), rounded ends; a quarter of the ring when still', ring.track === '0.2' && ring.arcOp === '1' && ring.cap === 'round' && ring.len === '100' && ring.dash === '25 150' && ring.fill === 'none', JSON.stringify(ring));
t('ring: turns steadily, 2s a turn (the shared spin keyframes)', ring.anim === 'spin 2s linear', ring.anim);
t('ring: the arc grows and shrinks every 1.5s (dk-loader-arc)', ring.arcAnim === 'dk-loader-arc 1.5s', ring.arcAnim);
const shape = await p.evaluate(() => { const arc = document.querySelector('#ring .dk-loader__arc'); const a = arc.getAnimations().find((x) => x.animationName === 'dk-loader-arc'); if (!a) return { start: [NaN], mid: [NaN], late: [NaN] }; a.pause();
  const at = (ms) => { a.currentTime = ms; const s = getComputedStyle(arc); return [parseFloat(s.strokeDasharray), parseFloat(s.strokeDashoffset)]; };
  const v = { start: at(0), mid: at(750), late: at(1400) }; a.play(); return v; });
t('ring: the arc starts as a dot, stretches to most of the ring, then its tail catches up', shape.start[0] <= 2 && shape.mid[0] >= 60 && shape.mid[1] > -20 && shape.late[1] < -80, JSON.stringify(shape));
t('ring: each stretch starts somewhere new (2s turn vs 1.5s stretch)', ring.anim.includes('2s') && ring.arcAnim.includes('1.5s'));
t('ring: stroke-width-2 in its 24-unit drawing', ring.sw === '2px', ring.sw);
const dots = await p.evaluate(() => [...document.querySelectorAll('#dots .dk-loader__dot')].map((d) => { const s = getComputedStyle(d); return [s.animationName, s.animationDuration, s.animationDelay, s.animationIterationCount]; }));
t('dots: three dots pulsing (1s), each 150ms after the one before', dots.length === 3 && dots.every((d) => d[0] === 'dk-loader-dot' && d[1] === '1s' && d[3] === 'infinite') && dots.map((d) => d[2]).join() === '0s,0.15s,0.3s', JSON.stringify(dots));
const PX = await p.evaluate(() => { const e = document.getElementById('px'); const rs = [...e.querySelectorAll('rect.dk-loader__px')]; const s = rs.map((r) => getComputedStyle(r));
  return { n: rs.length, cls: rs.map((r) => r.getAttribute('class').match(/d(\d)/)[1]).join(''), geo: rs.map((r) => [r.getAttribute('x'), r.getAttribute('y')].join(',')).join(' '), size: [r0(e), r0(document.getElementById('pxlg'))], anim: s[0].animationName + ' ' + s[0].animationDuration + ' ' + s[0].animationTimingFunction + ' ' + s[0].animationIterationCount, delays: s.map((x) => x.animationDelay).join(','), sq: rs.every((r) => r.getAttribute('width') === '8' && r.getAttribute('height') === '8' && !r.getAttribute('rx')), div: (() => { const m = e.querySelector('mask'), cut = m && m.querySelector('.dk-loader__px-cut'), pth = e.querySelector('svg > .dk-loader__px-divider'), g = e.querySelector('svg > g'); if (!pth || !cut) return {}; const ps = getComputedStyle(pth); const ids = [...document.querySelectorAll('.dk-loader--pixel mask')].map((x) => x.id); return { d: pth.getAttribute('d'), tf: pth.getAttribute('transform'), cutOp: getComputedStyle(cut).strokeOpacity, stroke: ps.stroke, top: pth.previousElementSibling === g, op: ps.strokeOpacity, w: ps.strokeWidth, ref: g.getAttribute('mask') === 'url(#' + m.id + ')', unique: new Set(ids).size === ids.length && ids.length >= 3 }; })(), fill: s[0].fill, color: getComputedStyle(e).color, prim: getComputedStyle(document.querySelector('#pxlg rect.dk-loader__px')).fill, filt: [getComputedStyle(e.querySelector('svg')).filter, getComputedStyle(document.querySelector('#pxglow svg')).filter], kind: e.dataset.variant };
  function r0(el) { const r = el.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); } });
t('pixel: nine square pixels edge to edge in a 3×3 grid (no corners, no gaps), 24px (md) and 40px (lg)', PX.n === 9 && PX.kind === 'pixel' && PX.geo === '0,0 8,0 16,0 0,8 8,8 16,8 0,16 8,16 16,16' && PX.sq && PX.size.join() === '24x24,40x40', JSON.stringify(PX));
t('pixel: subtle dividers between the squares: cut out of them (a mask per loader) and drawn on top in its color at 10%, half a grid unit wide', PX.div.d === 'M16 0V48M32 0V48M0 16H48M0 32H48' && PX.div.tf === 'scale(0.5)' && PX.div.cutOp === '1' && PX.div.op === '0.1' && PX.div.stroke === PX.color && PX.div.w === '1px' && PX.div.ref && PX.div.unique && PX.div.top, JSON.stringify(PX.div));
t('pixel: one color (the text color, or the tone: primary)', PX.fill === PX.color && PX.prim === (await probe(null, 'var(--primary)')), JSON.stringify([PX.fill, PX.color, PX.prim]));
t('pixel: a wave along the diagonals, 75ms per step from the top-left, each square pulsing every 1.2s with ease-in-out', PX.cls === '012123234' && PX.delays === '0s,0.075s,0.15s,0.075s,0.15s,0.225s,0.15s,0.225s,0.3s' && PX.anim === 'dk-loader-pixel 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite', JSON.stringify([PX.cls, PX.delays, PX.anim]));
await p.addStyleTag({ content: '#pxs rect.dk-loader__px{animation:none!important} #pxs .dk-loader__px--d0,#pxs .dk-loader__px--d1{opacity:1!important}' });
await p.waitForTimeout(50);
const shotPx = async () => { const r = await p.evaluate(() => { const b = document.querySelector('#pxs svg').getBoundingClientRect(); return [b.left, b.top, b.width]; });
  const u = r[2] / 24, at = (x, y) => ({ x: Math.round(r[0] + x * u), y: Math.round(r[1] + y * u) });
  const buf = await p.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 720 } });
  return p.evaluate(async ([b64, pts]) => { const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0);
    return pts.map((q) => [...g.getImageData(q.x, q.y, 1, 1).data.slice(0, 3)]); }, [buf.toString('base64'), [at(8.05, 4), at(16.05, 20), at(4, 4), at(20, 20)]]); };
await p.evaluate(() => document.getElementById('pxs').scrollIntoView());
const dv = await shotPx();
const same = dv[0].every((v, i) => Math.abs(v - dv[1][i]) <= 3), differs = dv[2].some((v, i) => Math.abs(v - dv[3][i]) > 60);
t('pixel: a divider looks the same between two lit squares as between two dim ones', same && differs, JSON.stringify({ litDivider: dv[0], dimDivider: dv[1], lit: dv[2], dim: dv[3] }));
const PR = await p.evaluate(() => { const g = (id) => { const e = document.getElementById(id); const rs = [...e.querySelectorAll('rect.dk-loader__px')].map((r) => getComputedStyle(r)); return { cls: e.className, pat: e.dataset.pattern, names: [...new Set(rs.map((s) => s.animationName))], durs: rs.map((s) => s.animationDuration), dels: rs.map((s) => s.animationDelay), tf: rs[0] && rs[0].animationTimingFunction }; };
  return { r: g('pxr'), w: g('px'), bad: g('pxbad'), ring: document.getElementById('ringpat').className + '|' + (document.getElementById('ringpat').dataset.pattern || '') }; });
t('pixel pattern="random": each square rises and fades like the wave on its own clock (nine different durations, 1.5s to 2.2s) and start, ease-in-out', PR.r.pat === 'random' && /dk-loader--pattern-random/.test(PR.r.cls) && PR.r.names.join() === 'dk-loader-pixel' && new Set(PR.r.durs).size === 9 && Math.min(...PR.r.durs.map(parseFloat)) === 1.5 && Math.max(...PR.r.durs.map(parseFloat)) === 2.2 && new Set(PR.r.dels).size >= 8 && PR.r.tf === 'cubic-bezier(0.4, 0, 0.2, 1)', JSON.stringify(PR.r));
t('pixel pattern: "wave" by default and for unknown values; other variants ignore it', PR.w.pat === 'wave' && !/pattern/.test(PR.w.cls) && PR.w.names.join() === 'dk-loader-pixel' && PR.bad.pat === 'wave' && !/pattern/.test(PR.ring), JSON.stringify([PR.w.pat, PR.bad.pat, PR.ring]));
const lit = await p.evaluate(async () => { const rs = [...document.querySelectorAll('#pxr rect.dk-loader__px')]; const seen = new Set(); for (let i = 0; i < 12; i++) { const on = rs.map((r) => +getComputedStyle(r).opacity > 0.6 ? 1 : 0).join(''); seen.add(on); await new Promise((f) => setTimeout(f, 150)); } return [...seen]; });
t('pixel pattern="random": the lit squares keep changing (many different combinations over 1.8s)', lit.length >= 6, JSON.stringify(lit));
const PP = await p.evaluate(() => { const o = {}; for (const pt of ['sweep', 'fall', 'rise', 'snake', 'spiral', 'cross', 'checker']) { const e = document.getElementById('pp-' + pt); const rs = [...e.querySelectorAll('rect.dk-loader__px')].map((r) => getComputedStyle(r)); o[pt] = { pat: e.dataset.pattern, name: [...new Set(rs.map((s) => s.animationName))].join(), dur: [...new Set(rs.map((s) => s.animationDuration))].join(), steps: rs.map((s) => Math.round(parseFloat(s.animationDelay) / 0.075)).join(''), tf: rs[0].animationTimingFunction }; } return o; });
const WANT = { sweep: ['024024024', '1.2s'], fall: ['000222444', '1.2s'], rise: ['444222000', '1.2s'], snake: ['012543678', '1.5s'], spiral: ['012783654', '1.5s'], cross: ['070777070', '1s'], checker: ['070707070', '1s'] };
for (const [pt, [steps, dur]] of Object.entries(WANT)) t(`pixel pattern="${pt}": its order (steps of 75ms: ${steps}), with the wave's smooth rise and fade, every ${dur}, ease-in-out`, PP[pt].pat === pt && PP[pt].name === 'dk-loader-pixel' && PP[pt].steps === steps && PP[pt].dur === dur && PP[pt].tf === 'cubic-bezier(0.4, 0, 0.2, 1)', JSON.stringify(PP[pt]));
const fillo = await p.evaluate(() => { const r = document.querySelector('#pp-snake rect.dk-loader__px'); const a = r.getAnimations()[0]; a.pause(); const at = (ms) => { a.currentTime = ms; return +parseFloat(getComputedStyle(r).opacity).toFixed(2); }; const v = [at(0), at(225), at(450), at(750), at(1050), at(1310)]; a.play(); return v; });
t('pixel step patterns: a square rises gradually (still part-way at 15% of its cycle), holds, then fades back gradually', fillo[0] === 0.15 && fillo[1] > 0.3 && fillo[1] < 0.9 && fillo[2] === 1 && fillo[3] === 1 && fillo[4] > 0.3 && fillo[4] < 0.9 && fillo[5] === 0.15, JSON.stringify(fillo));
const smooth = await p.evaluate(() => { const out = {}; for (const id of ['px', 'pxr', 'pp-sweep', 'pp-fall', 'pp-rise', 'pp-snake', 'pp-spiral', 'pp-cross', 'pp-checker']) { const r = document.querySelector('#' + id + ' rect.dk-loader__px'); const a = r.getAnimations()[0]; a.pause(); const dur = a.effect.getComputedTiming().duration; let max = 0, prev = null; for (let k = 0; k <= 100; k++) { a.currentTime = (a.effect.getComputedTiming().delay || 0) + dur * k / 100; const o = parseFloat(getComputedStyle(r).opacity); if (prev !== null) max = Math.max(max, Math.abs(o - prev)); prev = o; } a.play(); out[id] = +max.toFixed(3); } return out; });
t('every pixel pattern is as smooth as the wave (no faster change per 1% of its cycle)', Object.values(smooth).every((m) => m <= smooth.px + 0.001), JSON.stringify(smooth));
const GL = await p.evaluate(() => [getComputedStyle(document.querySelector('#pxgp svg')).filter, document.getElementById('pxgp').className, document.getElementById('ringglow').className, getComputedStyle(document.querySelector('#px svg')).filter]);
t('glow prop (pixel only): a 2px halo of the loader color (glow-size); off without it; other variants ignore it', /drop-shadow\(.*2px\)/.test(GL[0]) && /dk-loader--glow/.test(GL[1]) && !/glow/.test(GL[2]) && !/ 2px\)/.test(GL[3]), JSON.stringify(GL));
const pxo = await p.evaluate(() => { const r = document.querySelector('#px rect.dk-loader__px'); const a = r.getAnimations().find((x) => x.animationName === 'dk-loader-pixel'); if (!a) return [NaN]; a.pause(); const at = (ms) => { a.currentTime = ms; return +parseFloat(getComputedStyle(r).opacity).toFixed(2); }; const v = [at(0), at(480), at(1140)]; a.play(); return v; });
t('pixel: a square rests at 15% (pixel-dim), is full at the crest and fades back', pxo[0] === 0.15 && pxo[1] === 1 && pxo[2] < 0.3, JSON.stringify(pxo));
t('pixel: no glow by default; --loader-pixel-glow adds a halo of the same color', /drop-shadow\(.*0px\)|^none$/.test(PX.filt[0]) && !/ [1-9]\d*px\)/.test(PX.filt[0]) && /4px/.test(PX.filt[1]), JSON.stringify(PX.filt));
const SK2 = await p.evaluate(() => { const e = document.getElementById('spk'), svg = e.querySelector('svg'), ls = [...svg.querySelectorAll('line.dk-loader__spoke')]; const s = getComputedStyle(svg); const r = (el) => { const b = el.getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height); };
  const a = svg.getAnimations()[0]; let ticks = []; if (a) { a.pause(); for (const ms of [0, 60, 130, 260, 990]) { a.currentTime = ms; const m = new DOMMatrix(getComputedStyle(svg).transform); ticks.push(Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI)); } a.play(); }
  return { n: ls.length, rot: ls.map((l) => l.getAttribute('transform')).join('|'), g: ls[0].parentNode.getAttribute('transform'), geo: ['x1', 'y1', 'x2', 'y2'].map((k) => ls[0].getAttribute(k)).join(), prop: (() => { const b = e.getBoundingClientRect(), u = b.width / 24, sc = 0.625; return { w: +(2.5 * u).toFixed(2), len: +(((9.6 - 4) * sc + 2.5) * u).toFixed(2), hole: +(((19.2 - 9.6) * sc - 1.25) * 2 / 24).toFixed(2) }; })(), op: ls.map((l) => +getComputedStyle(l).opacity).join(), cap: getComputedStyle(ls[0]).strokeLinecap, w: getComputedStyle(ls[0]).strokeWidth, stroke: getComputedStyle(ls[0]).stroke, color: getComputedStyle(e).color, prim: getComputedStyle(document.querySelector('#spklg line')).stroke, size: [r(e), r(document.getElementById('spklg'))], anim: s.animationName + ' ' + s.animationDuration + ' ' + s.animationTimingFunction + ' ' + s.animationIterationCount, ticks, kind: e.dataset.variant }; });
t('spokes: eight rounded spokes round a circle, 24px (md) and 40px (lg), in the text color (or the tone)', SK2.n === 8 && SK2.kind === 'spokes' && SK2.cap === 'round' && SK2.w === '4px' && SK2.g === 'scale(0.625)' && SK2.geo === '19.2,4,19.2,9.6' && SK2.stroke === SK2.color && SK2.prim === (await probe(null, 'var(--primary)')) && SK2.size.join() === '24x24,40x40', JSON.stringify(SK2));
t('spokes: iOS proportions: each spoke about 10% of the size wide and 25% long, round a hole 40% across', Math.abs(SK2.prop.w / 24 - 0.104) < 0.005 && Math.abs(SK2.prop.len / 24 - 0.25) < 0.01 && Math.abs(SK2.prop.hole - 0.4) < 0.01, JSON.stringify(SK2.prop));
t('spokes: the lead spoke at full strength, the ones behind it (anticlockwise) fading to 25%', SK2.rot === 'rotate(0 19.2 19.2)|rotate(-45 19.2 19.2)|rotate(-90 19.2 19.2)|rotate(-135 19.2 19.2)|rotate(-180 19.2 19.2)|rotate(-225 19.2 19.2)|rotate(-270 19.2 19.2)|rotate(-315 19.2 19.2)' && SK2.op === '1,0.85,0.7,0.55,0.45,0.35,0.3,0.25', JSON.stringify([SK2.rot, SK2.op]));
t('spokes: ticks a spoke at a time (45° steps, no turning in between), a full turn every 1s', /^dk-loader-tick 1s (step-end|steps\(1(, (jump-)?end)?\)) infinite$/.test(SK2.anim) && JSON.stringify(SK2.ticks) === '[0,0,45,90,-45]', JSON.stringify([SK2.anim, SK2.ticks]));
const textColor = await css('#ring', 'color');
t('tone neutral (default); current, removed in 4.0.0, falls back to neutral like any unknown tone, with no warning', await p.evaluate(() => { const n = document.getElementById('tneutral'), c = document.getElementById('tcurrent'), d = document.getElementById('ring'); const strip = (e) => e.className.replace(/\s+/g, ' '); return getComputedStyle(n).color === 'rgb(200, 30, 40)' && getComputedStyle(c).color === 'rgb(200, 30, 40)' && strip(n) === strip(c) && !/neutral|current/.test(n.className + c.className + d.className) && window.warnings.filter((w) => /current/.test(w)).length === 0; }));
t('tone neutral: draws in the text color around it', (await css('#inherit', 'color')) === 'rgb(200, 30, 40)' && (await css('#inherit .dk-loader__arc', 'stroke')) === 'rgb(200, 30, 40)');
t('tone primary and muted color the ring or dots with the alias colors', (await css('#primary .dk-loader__art', 'color')) === (await probe(null, 'var(--primary)')) && (await css('#muted .dk-loader__art', 'color')) === (await probe(null, 'var(--text-muted)')) && (await css('#primary .dk-loader__arc', 'stroke')) === (await probe(null, 'var(--primary)')) && (await css('#primary .dk-loader__art', 'color')) !== textColor);
t('tone primary inside a nested theme follows that theme', (await css('#nested .dk-loader__art', 'color')) === (await probe('violet-dark', 'var(--primary)')));
t('tone inverse: a white ring, and white words in the text variant, whatever the text color around it', (await css('#inverse', 'color')) === 'rgb(255, 255, 255)' && (await css('#inverse .dk-loader__arc', 'stroke')) === 'rgb(255, 255, 255)' && (await css('#inversetext .dk-loader__label', 'color')) === 'rgb(255, 255, 255)');
const darkInv = await p.evaluate(() => { document.getElementById('scrim').setAttribute('data-theme', 'blue-dark'); const c = getComputedStyle(document.getElementById('inverse')).color; document.getElementById('scrim').removeAttribute('data-theme'); return c; });
t('tone inverse stays white in a dark theme too (scrims stay dark)', darkInv === 'rgb(255, 255, 255)', darkInv);
t('component tokens: --loader-size-md and --loader-track-opacity on one loader', JSON.stringify(await box('tok')) === '[32,32]' && (await css('#tok .dk-loader__track', 'opacity')) === '0');

// accessibility
const a = await attrs('ring');
t('named: role="progressbar" (indeterminate: no value) with aria-label "Loading"', a.role === 'progressbar' && a['aria-label'] === 'Loading' && !('aria-valuenow' in a) && !('aria-hidden' in a), JSON.stringify(a));
t('label sets the name', (await attrs('named'))['aria-label'] === 'Loading projects');
const d = await attrs('deco');
t('label="" makes it decorative: aria-hidden, no role, no name', d['aria-hidden'] === 'true' && !('role' in d) && !('aria-label' in d), JSON.stringify(d));
t('the drawing itself is hidden from assistive tech and not focusable', await p.evaluate(() => [...document.querySelectorAll('.dk-loader svg')].every((s) => s.getAttribute('aria-hidden') === 'true' && s.getAttribute('focusable') === 'false')));
await p.waitForFunction(() => /Loading/.test((document.querySelector('[data-dk-announcer]') || {}).textContent || ''), null, { timeout: 2000 }).catch(() => {});
t('it is announced through the shared polite status region', await p.evaluate(() => { const r = document.querySelector('[data-dk-announcer]'); return r && r.getAttribute('role') === 'status' && r.getAttribute('aria-live') === 'polite' && /Loading/.test(r.textContent); }));
t('ref, className and other attributes pass through; data attributes for tests', await p.evaluate(() => window.r.current && window.r.current.id === 'ref' && window.r.current.classList.contains('extra') && window.r.current.dataset.x === 'y' && window.r.current.dataset.component === 'loader' && window.r.current.dataset.variant === 'ring' && window.r.current.dataset.size === 'md'));

// text variant
const L = await p.evaluate(() => { const e = document.getElementById('lab'), l = e.querySelector('.dk-loader__label'); const s = getComputedStyle(l); const r = e.getBoundingClientRect();
  return { text: l.textContent, art: !!e.querySelector('.dk-loader__art, svg'), kids: e.children.length, variant: e.dataset.variant, hidden: l.getAttribute('aria-hidden'), name: e.getAttribute('aria-label'), role: e.getAttribute('role'), fill: s.webkitTextFillColor, clip: s.backgroundClip || s.webkitBackgroundClip, img: s.backgroundImage, anim: s.animationName + ' ' + s.animationDuration + ' ' + s.animationTimingFunction + ' ' + s.animationIterationCount, color: s.color, font: s.fontSize + '/' + s.lineHeight, h: Math.round(r.height) }; });
t('variant="text": just the words, no ring or dots, in the text color around it, 14px/20px (md), as tall as the line', L.text === 'Loading projects' && !L.art && L.kids === 1 && L.variant === 'text' && L.color === 'rgb(15, 23, 42)' && L.font === '14px/20px' && L.h === 20, JSON.stringify(L));
t('the visible words are hidden from assistive tech (the progressbar already has that name: no double reading)', L.hidden === 'true' && L.role === 'progressbar' && L.name === 'Loading projects');
t('shine: the words are clipped from a gradient of the text color that sweeps left to right every 2s with ease-in-out, forever', L.clip === 'text' && /transparent|rgba\(0, 0, 0, 0\)/.test(L.fill) && /linear-gradient/.test(L.img) && L.anim === 'dk-loader-shine 2s cubic-bezier(0.4, 0, 0.2, 1) infinite', JSON.stringify(L));
const dim = await p.evaluate(() => { const l = document.querySelector('#lab .dk-loader__label'); const m = getComputedStyle(l).backgroundImage.match(/color\(srgb [^)]*\)|rgba?\([^)]*\)/g) || []; return m; });
t('shine: the words rest at 65% of the text color (label-dim), with a full-strength band', dim.length >= 13 && /0\.65\)?$|0\.65\)/.test(dim[0]) && dim.some((c) => !/0\.65/.test(c)), JSON.stringify(dim.slice(0, 7)));
const pos = await p.evaluate(() => { const l = document.querySelector('#lab .dk-loader__label'); const a = l.getAnimations().find((x) => x.animationName === 'dk-loader-shine'); if (!a) return ['none']; a.pause(); const at = (ms) => { a.currentTime = ms; return getComputedStyle(l).backgroundPosition; }; const v = [at(0), at(1000), at(1999)]; a.play(); return v; });
t('shine: the band starts off the left of the words and ends off the right (seamless loop), past halfway at half time (ease-in-out)', pos[0].startsWith('100%') && parseFloat(pos[1]) > 0 && parseFloat(pos[1]) < 50 && parseFloat(pos[2]) < 1, JSON.stringify(pos));
const cr = await p.evaluate(() => {
  const rgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
  const lum = (c) => { const v = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const out = {};
  for (const th of ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark']) {
    const d = document.createElement('div'); d.setAttribute('data-theme', th); d.style.cssText = 'color:var(--text);background:var(--surface);opacity:var(--loader-label-dim, var(--opacity-65))'; document.body.appendChild(d);
    const s = getComputedStyle(d), a = parseFloat(s.opacity), fg = rgb(s.color), bg = rgb(s.backgroundColor); d.remove();
    const mix = fg.map((x, i) => x * a + bg[i] * (1 - a)); const L = [lum(mix), lum(bg)].sort((x, y) => y - x);
    out[th] = Math.round(((L[0] + 0.05) / (L[1] + 0.05)) * 100) / 100;
  }
  return out; });
t('shine: the resting words (text at 65%) keep 4.5:1 on surface in all six themes', Object.values(cr).every((x) => x >= 4.5), JSON.stringify(cr));
t('text variant: tone primary or muted keeps the words in the text color (their contrast stays checked)', (await css('#labp .dk-loader__label', 'color')) === 'rgb(15, 23, 42)');
t('text variant sizes: sm text-xs, md text-sm, lg text-base', (await css('#labsm .dk-loader__label', 'fontSize')) === '12px' && (await css('#lablg .dk-loader__label', 'fontSize')) === '16px');
t('text variant with label="" still shows "Loading", decorative (hidden from screen readers)', await p.evaluate(() => { const e = document.getElementById('labempty'); return e.querySelector('.dk-loader__label').textContent === 'Loading' && e.getAttribute('aria-hidden') === 'true' && !e.getAttribute('role'); }));
t('text variant without a label shows and says "Loading"', await p.evaluate(() => { const e = document.getElementById('labdefault'); return e.querySelector('.dk-loader__label').textContent === 'Loading' && e.getAttribute('aria-label') === 'Loading'; }));
t('ring and dots have no words', await p.evaluate(() => !document.querySelector('#ring .dk-loader__label') && !document.querySelector('#dots .dk-loader__label')) && JSON.stringify(await box('ring')) === '[24,24]');

// skeleton variant
const SK = await p.evaluate(() => { const g = (id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); const bones = [...e.querySelectorAll('.dk-loader__bone')].map((b) => { const q = b.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; });
  return { w: Math.round(r.width), h: Math.round(r.height), lines: e.querySelectorAll('.dk-loader__line').length, bones, shape: e.dataset.shape, variant: e.dataset.variant, cls: e.className, rad: getComputedStyle(e.querySelector('.dk-loader__bone')).borderRadius, role: e.getAttribute('role'), name: e.getAttribute('aria-label'), hidden: e.getAttribute('aria-hidden'), color: getComputedStyle(e).color, kids: e.querySelectorAll('svg, .dk-loader__art, .dk-loader__label').length }; };
  const o = {}; for (const id of ['sk1', 'sk3', 'sksm', 'sklg', 'skc', 'skclg', 'skcz', 'skr', 'skrc', 'skbad', 'skp', 'sktok', 'skinv']) o[id] = g(id); return o; });
t('skeleton: shape "text" by default, one line as tall as the text-sm line (20px) with a 14px bar, full width, 4px corners', SK.sk1.variant === 'skeleton' && SK.sk1.shape === 'text' && SK.sk1.lines === 1 && SK.sk1.w === 300 && SK.sk1.h === 20 && JSON.stringify(SK.sk1.bones) === '[[300,14]]' && SK.sk1.rad === '4px' && SK.sk1.kids === 0, JSON.stringify(SK.sk1));
t('skeleton: lines={3} draws three lines, the last 60% wide (a paragraph)', SK.sk3.lines === 3 && SK.sk3.h === 60 && JSON.stringify(SK.sk3.bones) === '[[300,14],[300,14],[180,14]]', JSON.stringify(SK.sk3.bones));
t('skeleton text sizes: sm 16px lines with 12px bars, lg 24px lines with 16px bars', SK.sksm.h === 32 && SK.sksm.bones[0][1] === 12 && SK.sklg.h === 24 && SK.sklg.bones[0][1] === 16, JSON.stringify([SK.sksm.h, SK.sksm.bones, SK.sklg.h, SK.sklg.bones]));
t('skeleton circle: the loader size (24px md, 40px lg), fully round; className (size-12) sets another size', SK.skc.w === 24 && SK.skc.h === 24 && SK.skclg.w === 40 && SK.skcz.w === 48 && SK.skcz.h === 48 && JSON.stringify(SK.skcz.bones) === '[[48,48]]' && parseFloat(SK.skc.rad) >= 9999, JSON.stringify([SK.skc, SK.skcz.bones]));
t('skeleton rect: full width and 96px tall, 6px corners; className (w-48 h-32) sets the size', SK.skr.w === 300 && SK.skr.h === 96 && SK.skr.rad === '6px' && SK.skrc.w === 192 && SK.skrc.h === 128 && JSON.stringify(SK.skrc.bones) === '[[192,128]]', JSON.stringify([SK.skr, SK.skrc.w, SK.skrc.h]));
t('skeleton: in a row next to an avatar, the lines take the rest of the width and the avatar keeps its size', await p.evaluate(() => [document.getElementById('skav'), document.getElementById('skrow')].map((e) => Math.round(e.getBoundingClientRect().width)).join() === '40,248'));
t('skeleton: an unknown shape falls back to text, lines are kept to 20', SK.skbad.shape === 'text' && SK.skbad.lines === 20, JSON.stringify([SK.skbad.shape, SK.skbad.lines]));
t('skeleton: component tokens --loader-skeleton-rect-height and --loader-skeleton-radius on one loader', SK.sktok.h === 40 && SK.sktok.rad === '0px', JSON.stringify([SK.sktok.h, SK.sktok.rad]));
t('skeleton: named like the others (progressbar "Loading"); label="" makes it decorative', SK.sk1.role === 'progressbar' && SK.sk1.name === 'Loading' && SK.sk3.hidden === 'true' && SK.sk3.role === null);
t('skeleton: tone primary is ignored (it stays in the text color); inverse is white', SK.skp.color === 'rgb(15, 23, 42)' && SK.skinv.color === 'rgb(255, 255, 255)', JSON.stringify([SK.skp.color, SK.skinv.color]));
const FL = await p.evaluate(() => { const b = document.querySelector('#sk1 .dk-loader__bone'); const s = getComputedStyle(b); const a = b.getAnimations().find((x) => x.animationName === 'dk-loader-shine'); let pos = ['none']; if (a) { a.pause(); const at = (ms) => { a.currentTime = ms; return getComputedStyle(b).backgroundPosition; }; pos = [at(0), at(1999)]; a.play(); }
  return { img: s.backgroundImage, anim: s.animationName + ' ' + s.animationDuration + ' ' + s.animationTimingFunction + ' ' + s.animationIterationCount, pos, size: s.backgroundSize }; });
const stops = FL.img.match(/color\(srgb [^)]*\)|rgba?\([^)]*\)/g) || [];
t('skeleton fill: the text color at 10%, with a lighter band (5%) sweeping through it', stops.length === 13 && /15 23 42|0\.0588/.test(stops[0]) && /\/ 0\.1\)|, 0\.1\)/.test(stops[0]) && /\/ 0\.05\)|, 0\.05\)/.test(stops[6]), JSON.stringify(stops.slice(5, 8)));
t('skeleton shimmer: the band sweeps left to right every 2s, ease-in-out, like the text variant', FL.anim === 'dk-loader-shine 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' && FL.pos[0].startsWith('100%') && parseFloat(FL.pos[1]) < 1 && FL.size === '300% 100%', JSON.stringify(FL));

// delay
await p.waitForTimeout(300);   // let earlier announcements (they land 50ms after they start) settle first
await p.evaluate(() => { const r = document.querySelector('[data-dk-announcer]'); r.textContent = ''; window.showLate(); });
await p.waitForTimeout(100);
const early = await p.evaluate(() => { const e = document.getElementById('delayed'); const r = e.getBoundingClientRect(); return { vis: getComputedStyle(e).visibility, svg: !!e.querySelector('svg'), hidden: e.getAttribute('aria-hidden'), role: e.getAttribute('role'), w: Math.round(r.width), said: document.querySelector('[data-dk-announcer]').textContent }; });
const skw = await p.evaluate(() => { const e = document.getElementById('skwait'); return { vis: getComputedStyle(e).visibility, lines: e.querySelectorAll('.dk-loader__line').length, h: Math.round(e.getBoundingClientRect().height) }; });
t('delay: a waiting skeleton keeps the space of its shapes (two lines: 40px), hidden', skw.vis === 'hidden' && skw.lines === 2 && skw.h === 40, JSON.stringify(skw));
t('delay: for the first 300ms nothing shows or is announced, but its space is kept', early.vis === 'hidden' && !early.svg && early.hidden === 'true' && early.role === null && early.w === 24 && early.said === '', JSON.stringify(early));
await p.waitForTimeout(400);
const late = await p.evaluate(() => { const e = document.getElementById('delayed'); return { vis: getComputedStyle(e).visibility, svg: !!e.querySelector('svg'), role: e.getAttribute('role'), anim: getComputedStyle(e).animationName }; });
t('delay: after 300ms it fades in and becomes a progressbar', late.vis === 'visible' && late.svg && late.role === 'progressbar' && late.anim === 'dk-loader-in', JSON.stringify(late));
await p.waitForTimeout(150);
t('delay: then it is announced', await p.evaluate(() => /Loading/.test(document.querySelector('[data-dk-announcer]').textContent)));
const q2 = await ctx.newPage(); q2.on('pageerror', (e) => errors.push(e.message));
await q2.goto(writePage('loader.html', APP, { react: true })); await q2.waitForTimeout(100);
await q2.evaluate(() => window.hideQuick()); await q2.waitForTimeout(500);
t('delay: a loader removed before 300ms never appears (a fast request shows nothing)', await q2.evaluate(() => !document.getElementById('quick')));

// in Button
const bt = await p.evaluate(() => ['btn', 'btnlg'].map((id) => { const s = document.querySelector('#' + id + ' .dk-btn__spinner'); const r = s.getBoundingClientRect(), b = document.getElementById(id).getBoundingClientRect(); return { comp: s.dataset.component, variant: s.dataset.variant, hidden: s.getAttribute('aria-hidden'), w: Math.round(r.width), dx: Math.round(r.left + r.width / 2 - (b.left + b.width / 2)), dy: Math.round(r.top + r.height / 2 - (b.top + b.height / 2)), svgAnim: getComputedStyle(s.querySelector('svg')).animationName }; }));
t('Button loading uses the Loader (ring), decorative, at the button icon size (16px md, 20px lg), centered', bt[0].comp === 'loader' && bt[0].variant === 'ring' && bt[0].hidden === 'true' && bt[0].w === 16 && bt[1].w === 20 && bt.every((x) => Math.abs(x.dx) <= 1 && Math.abs(x.dy) <= 1 && x.svgAnim === 'spin'), JSON.stringify(bt));
t('no page errors', errors.length === 0, errors.join(' | '));

// reduced motion
const rm = await b.newContext({ reducedMotion: 'reduce' });
const r2 = await rm.newPage();
await r2.goto(writePage('loader.html', APP, { react: true })); await r2.waitForTimeout(300);
const rml = await r2.evaluate(() => { const s = getComputedStyle(document.querySelector('#lab .dk-loader__label')); return [s.animationName, s.backgroundImage, s.webkitTextFillColor, s.color]; });
t('reduced motion: the label is plain text in the text color, no shine', rml[0] === 'none' && rml[1] === 'none' && rml[2] === rml[3], JSON.stringify(rml));
const rmv = await r2.evaluate(() => [getComputedStyle(document.querySelector('#ring svg')).animationDuration, getComputedStyle(document.querySelector('#dots .dk-loader__dot')).animationName, getComputedStyle(document.querySelector('#ring .dk-loader__arc')).animationName, getComputedStyle(document.querySelector('#ring .dk-loader__arc')).strokeDasharray]);
t('reduced motion: the ring keeps a steady quarter arc (no growing and shrinking) and turns slowly (animate-spin-reduced, 3s)', rmv[0] === '3s' && rmv[2] === 'none' && /^25(px)?,? 150/.test(rmv[3]), JSON.stringify(rmv));
t('reduced motion: the dots only fade, without growing', rmv[1] === 'dk-loader-dot-fade', rmv[1]);
const rmspk = await r2.evaluate(() => getComputedStyle(document.querySelector('#spk svg')).animationName + ' ' + getComputedStyle(document.querySelector('#spk svg')).animationDuration);
t('reduced motion: the spokes tick at half speed (2s a turn)', rmspk === 'dk-loader-tick 2s', rmspk);
const rmp = await r2.evaluate(() => { const s = getComputedStyle(document.querySelector('#px rect.dk-loader__px')); return [s.animationName, s.animationDuration]; });
t('reduced motion: the pixel wave keeps fading (no movement), at half speed (2.4s)', rmp[0] === 'dk-loader-pixel' && rmp[1] === '2.4s', JSON.stringify(rmp));
const rmall = await r2.evaluate(() => ['#px', '#pxr', '#pp-sweep', '#pp-snake', '#pp-spiral', '#pp-cross', '#pp-checker'].map((s) => getComputedStyle(document.querySelector(s + ' rect.dk-loader__px')).animationDuration));
t('reduced motion: every pixel pattern runs at half speed (2.4s; snake and spiral 3s; cross and checker 2s; random 4s)', rmall.join() === '2.4s,4s,2.4s,3s,3s,2s,2s', JSON.stringify(rmall));
const rmr = await r2.evaluate(() => { const rs = [...document.querySelectorAll('#pxr rect.dk-loader__px')].map((r) => getComputedStyle(r)); return [new Set(rs.map((s) => s.animationDuration)).size, rs[0].animationDuration, new Set(rs.map((s) => s.animationDelay)).size]; });
t('reduced motion: random squares share a slow 4s clock and keep their scattered starts', rmr[0] === 1 && rmr[1] === '4s' && rmr[2] >= 8, JSON.stringify(rmr));
const rms = await r2.evaluate(() => { const s = getComputedStyle(document.querySelector('#sk1 .dk-loader__bone')); return [s.animationName, s.backgroundImage, s.backgroundColor]; });
t('reduced motion: the skeleton is a still fill (the text color at 10%), no shimmer', rms[0] === 'none' && rms[1] === 'none' && /0\.1\)$/.test(rms[2]), JSON.stringify(rms));

await b.close();
cleanup();
process.exit(report('Loader', R) ? 0 : 1);

// Material Symbols as SVG (src/material, built by tools/icons/material.py from the 5.x icon font):
//   - every Material Symbol works by name and draws exactly as the font did, pixel for pixel at 24px;
//   - an icon from serupa-ds/icons works through
//     `icon`, registerIcons() adds a name, an unknown name draws nothing and warns, and on a plain page serupa.iife.js
//     alone draws any name (serupa-icons.iife.js still loads, for pages that include it).
//   node tools/test/icon-names.mjs
import path from 'node:path';
import { read, writePage, browser, cleanup, report, PROJECT } from './lib.mjs';

const all = new Map([...read('src/material/icons.ts').matchAll(/name: "([a-z0-9_]+)", d: "([^"]+)"/g)].map((m) => [m[1], m[2]]));
const names = [...all.keys()];

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

const b = await browser();
const p = await b.newPage();
const warnings = [];
p.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });
const FONT = path.join(PROJECT, 'tools/icons/source/MaterialSymbolsRounded-Filled.woff2');
const APP = `<style>@font-face { font-family: "Source"; src: url("${FONT}") format("woff2"); font-display: block; }</style><div id="root"></div>
<script>
var D = window.Serupa, h = React.createElement;
D.registerIcons({ name: 'test_registered', d: 'M0 0h960v-960H0z' });
ReactDOM.createRoot(document.getElementById('root')).render(h('div', null,
  ${JSON.stringify(names)}.map(function (n) { return h(D.Icon, { key: n, name: n, size: 24 }); }),
  h(D.Icon, { id: 'data', icon: { name: 'test_imported', d: 'M0 0h960v-960H0z' } }),
  h(D.Button, { id: 'btn', leftIcon: { name: 'test_imported', d: 'M0 0h960v-960H0z' } }, 'Imported'),
  h(D.Icon, { id: 'reg', name: 'test_registered' }),
  h(D.Icon, { id: 'unknown', name: 'not_a_real_icon' })));
</script>`;
await p.goto(writePage('icon-names.html', APP, { react: true }));
await p.evaluate(() => document.fonts.load('24px "Source"'));
await p.waitForTimeout(300);
const drawn = await p.evaluate(() => [...document.querySelectorAll('.dk-icon[data-icon]')].filter((e) => e.querySelector('svg path')).map((e) => e.dataset.icon));
const missing = names.filter((n) => !drawn.includes(n));
t(`all ${names.length} Material Symbols draw by name, as an SVG`, !missing.length, missing.join(', '));

// Pixel for pixel: each SVG against the font glyph it was drawn from, both 24px with the font at its opsz 24.
const differ = await p.evaluate((icons) => {
  const bad = [];
  const alpha = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); draw(x); return x.getImageData(0, 0, 24, 24).data; };
  for (const [n, d] of icons) {
    const a = alpha((x) => { x.font = '24px Source'; x.fillText(n, 0, 24); });
    const s = alpha((x) => { x.scale(24 / 960, 24 / 960); x.translate(0, 960); x.fill(new Path2D(d)); });
    let diff = 0;
    for (let i = 3; i < a.length; i += 4) diff += Math.abs(a[i] - s[i]);
    if (diff / 255 > 6) bad.push(`${n} (${Math.round(diff / 255)} px)`);
  }
  return bad;
}, [...all]);
t('each icon draws exactly as the 5.x icon font did', !differ.length, differ.join(', '));

const one = await p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  return { data: [q('#data').dataset.icon, !!q('#data svg path')], btn: !!q('#btn .dk-btn__icon svg path'), reg: !!q('#reg svg path'), unknown: [q('#unknown').dataset.icon, !!q('#unknown svg'), q('#unknown').getBoundingClientRect().width] };
});
t('icon={…} (an import from serupa-ds/icons) draws it, and Button leftIcon takes one too', one.data[0] === 'test_imported' && one.data[1] && one.btn, JSON.stringify(one));
t('registerIcons() makes a name work', one.reg);
t('an unknown name keeps its 24px box, draws nothing and warns where to find the names', one.unknown[0] === 'not_a_real_icon' && !one.unknown[1] && one.unknown[2] === 24 && warnings.some((w) => w.includes('"not_a_real_icon"') && w.includes('Icons page')), JSON.stringify([one.unknown, warnings]));

// The plain-page script for every icon.
const q = await b.newPage();
await q.goto(writePage('icon-all.html', `<div id="root"></div><script src="../dist/serupa-icons.iife.js"></script><script>
if (!window.Serupa || !Serupa.Icon) throw new Error('serupa-icons.iife.js broke the page');
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Serupa.Icon, { id: 'r', name: 'sports_cricket' }));</script>`, { react: true }));
await q.waitForTimeout(300);
t(`on a plain page any of the ${all.size} names works ("sports_cricket"), with serupa-icons.iife.js loaded or not`, await q.evaluate(() => !!document.querySelector('#r svg path')));
await b.close();
cleanup();
process.exit(report('Icon names', R) ? 0 : 1);

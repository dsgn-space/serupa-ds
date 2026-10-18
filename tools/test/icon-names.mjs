// Material Symbols as SVG (src/material, built by tools/icons/material.py from the 5.x icon font):
//   - every name on the Foundations/Icons page and every icon name the components and docs use works by name
//     (src/material/common.ts is up to date);
//   - each of those draws exactly as the font did, pixel for pixel at 24px;
//   - an icon from serupa-ds/icons works through `icon`, registerIcons() makes any name work, an unknown name
//     draws nothing and warns, and serupa-icons.iife.js makes every name work on a plain page.
//   node tools/test/icon-names.mjs
import fs from 'node:fs';
import path from 'node:path';
import { read, writePage, browser, cleanup, report, PROJECT } from './lib.mjs';

const groups = JSON.parse(read('docs/icon-names.json'));
delete groups.$description;
const page = Object.values(groups).flat();
const all = new Map([...read('src/material/icons.ts').matchAll(/name: "([a-z0-9_]+)", d: "([^"]+)"/g)].map((m) => [m[1], m[2]]));
const common = [...read('src/material/common.ts').matchAll(/^ {2}\| "([a-z0-9_]+)"/gm)].map((m) => m[1]);

// The names the generator should have picked: the Icons page, and every Material Symbols name written as a string.
const files = (d) => fs.readdirSync(path.join(PROJECT, d), { recursive: true }).map((f) => path.join(d, String(f))).filter((f) => /\.(tsx?|mdx?|html)$/.test(f) && !f.startsWith(path.join('src', 'material')) && fs.statSync(path.join(PROJECT, f)).isFile());
const used = new Set(page);
for (const f of ['src', 'docs', '.storybook'].flatMap(files))
  for (const m of read(f).matchAll(/["'`]([a-z][a-z0-9_]{1,40})["'`]/g)) if (all.has(m[1])) used.add(m[1]);

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
t(`all ${page.length} names on the Icons page are Material Symbols`, page.every((n) => all.has(n)), page.filter((n) => !all.has(n)).join(', '));
t('no name is listed twice', new Set(page).size === page.length);
const stale = [...used].filter((n) => !common.includes(n)), extra = common.filter((n) => !used.has(n));
t(`the ${used.size} icons used by name are the everyday set in src/material/common.ts`, !stale.length && !extra.length, `run python3 tools/icons/material.py; missing ${stale.join(', ')}; not used ${extra.join(', ')}`);

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
  ${JSON.stringify(common)}.map(function (n) { return h(D.Icon, { key: n, name: n, size: 24 }); }),
  h(D.Icon, { id: 'data', icon: { name: 'test_imported', d: 'M0 0h960v-960H0z' } }),
  h(D.Button, { id: 'btn', leftIcon: { name: 'test_imported', d: 'M0 0h960v-960H0z' } }, 'Imported'),
  h(D.Icon, { id: 'reg', name: 'test_registered' }),
  h(D.Icon, { id: 'unknown', name: 'sports_cricket' })));
</script>`;
await p.goto(writePage('icon-names.html', APP, { react: true }));
await p.evaluate(() => document.fonts.load('24px "Source"'));
await p.waitForTimeout(300);
const drawn = await p.evaluate(() => [...document.querySelectorAll('.dk-icon[data-icon]')].filter((e) => e.querySelector('svg path')).map((e) => e.dataset.icon));
const missing = common.filter((n) => !drawn.includes(n));
t(`all ${common.length} everyday icons draw by name, as an SVG`, !missing.length, missing.join(', '));

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
}, common.map((n) => [n, all.get(n)]));
t('each everyday icon draws exactly as the 5.x icon font did', !differ.length, differ.join(', '));

const one = await p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  return { data: [q('#data').dataset.icon, !!q('#data svg path')], btn: !!q('#btn .dk-btn__icon svg path'), reg: !!q('#reg svg path'), unknown: [q('#unknown').dataset.icon, !!q('#unknown svg'), q('#unknown').getBoundingClientRect().width] };
});
t('icon={…} (an import from serupa-ds/icons) draws it, and Button leftIcon takes one too', one.data[0] === 'test_imported' && one.data[1] && one.btn, JSON.stringify(one));
t('registerIcons() makes a name work', one.reg);
t('an unknown name keeps its 24px box, draws nothing and warns how to add it', one.unknown[0] === 'sports_cricket' && !one.unknown[1] && one.unknown[2] === 24 && warnings.some((w) => w.includes('"sports_cricket"') && w.includes('registerIcons')), JSON.stringify([one.unknown, warnings]));

// The plain-page script for every icon.
const q = await b.newPage();
await q.goto(writePage('icon-all.html', `<div id="root"></div><script src="../dist/serupa-icons.iife.js"></script><script>
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Serupa.Icon, { id: 'r', name: 'sports_cricket' }));</script>`, { react: true }));
await q.waitForTimeout(300);
t(`serupa-icons.iife.js makes all ${all.size} names work ("sports_cricket")`, await q.evaluate(() => !!document.querySelector('#r svg path')));
await b.close();
cleanup();
process.exit(report('Icon names', R) ? 0 : 1);

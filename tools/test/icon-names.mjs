// Icons: every name on the Foundations/Icons page (docs/icon-names.json) is a real Material Symbols icon in the
// shipped font: it draws as one square glyph, not as the name spelled out in letters.
//   node tools/test/icon-names.mjs
import { read, writePage, browser, cleanup, report } from './lib.mjs';

const groups = JSON.parse(read('docs/icon-names.json'));
delete groups.$description;
const names = Object.values(groups).flat();
// Measured in a plain span: the Icon component's box is fixed at 1em, which would hide a name drawn as letters.
const APP = `<style>.probe { font-family: var(--font-icon); font-size: 24px; line-height: 1; white-space: nowrap; font-feature-settings: "liga"; display: inline-block; }</style>
<div id="root" style="padding:16px">${names.map((n) => `<span class="probe" data-n="${n}">${n}</span>`).join(' ')}</div>`;

const b = await browser();
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const p = await b.newPage();
await p.goto(writePage('icon-names.html', APP));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const wide = await p.evaluate(() => [...document.querySelectorAll('[data-n]')].filter((e) => Math.round(e.getBoundingClientRect().width) > 26).map((e) => e.dataset.n));
t(`all ${names.length} names on the Icons page draw as single 24px glyphs`, wide.length === 0, 'not icons: ' + wide.join(', '));
t('no name is listed twice', new Set(names).size === names.length);
await b.close();
cleanup();
process.exit(report('Icon names', R) ? 0 : 1);

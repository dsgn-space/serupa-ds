// Size budget: what each file a project loads weighs, gzipped, against the budget below. Build first (npm run build).
//   node tools/test/size.mjs
// The JavaScript is measured as a project's bundler ships it (minified, React left out, the full icon set left to
// load on demand): everything, and Button or Dialog alone. Over budget fails. When a change is worth the bytes, raise
// its line here in the same pull request, so the growth is a decision someone reviews. The lines that grow with every
// component (a number and `per`) allow that much more for each component folder past the count they were set at, so
// a pull request that adds a typical component doesn't edit this file. CI writes the table to the run's summary page.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as esbuild from 'esbuild';
import { PROJECT, done, report } from './lib.mjs';

// KiB, gzipped. About 3 to 5% above the size when each line was last set. [KiB, KiB more per component past AT].
const AT = 66;
const RAW = {
  'All components (index.js)': [64, 2],   // 46.8 once each component imports only its own icons (R7); 52.2 with R21–R28, Meter and CopyButton; 58.7 with RelativeTime, FormattedNumber, InlineEdit, ColorPicker and PhoneInput; 61.9 with every country's calling code in PhoneInput (K2, 2.7 KiB); about 62.5 with Accordion's find-in-page and Button's disabledReason and success state
  'Button alone': 6.2,   // 6.0 with disabledReason, promise clicks and the success check; 5.1, without any icon data (R7); 5.5 once each component's words came from its own labels.ts
  'Dialog alone': 7.4,   // 7.1 with Button's disabledReason and success state; 6.2, with only its close icon (R7); 6.5 with every label the new components added
  'components.css': [43.5, 1],   // 38.2 after R11 put the hover rules in @media (hover: hover); 40.7 with InlineEdit, ColorPicker and PhoneInput; 42.7 with the long-word wrapping (R31)
  'utilities.css': 168,
  'bundle.css': [212, 1],   // 206.2 with InlineEdit, ColorPicker and PhoneInput
  'base.css': 1.85,   // 1.74 with the print styles (R12)
  'theme.js': 2,
  'serupa.iife.js': [610, 10],   // 601.5 with InlineEdit and ColorPicker; PhoneInput's country table adds a few KiB
};
const count = fs.readdirSync(path.join(PROJECT, 'src', 'components')).filter((n) => fs.statSync(path.join(PROJECT, 'src', 'components', n)).isDirectory()).length;
const BUDGET = Object.fromEntries(Object.entries(RAW).map(([k, v]) => [k, Array.isArray(v) ? +(v[0] + Math.max(0, count - AT) * v[1]).toFixed(1) : v]));

const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
// Icons drawn by name are a dynamic import(): a project loads them only when a page draws an icon by its name.
const lazy = { name: 'lazy', setup(b) { b.onResolve({ filter: /.*/ }, (a) => a.kind === 'dynamic-import' ? { path: a.path, external: true } : undefined); } };
const bundled = async (code) => gz((await esbuild.build({ stdin: { contents: code, resolveDir: PROJECT }, bundle: true, minify: true, write: false, format: 'esm', external: ['react', 'react-dom'], plugins: [lazy], logLevel: 'silent' })).outputFiles[0].contents);
const file = (f) => gz(fs.readFileSync(path.join(PROJECT, 'dist', f)));

const size = {
  'All components (index.js)': await bundled("export * from './dist/index.js';"),
  'Button alone': await bundled("export { Button } from './dist/index.js';"),
  'Dialog alone': await bundled("export { Dialog } from './dist/index.js';"),
};
for (const f of ['components.css', 'utilities.css', 'bundle.css', 'base.css', 'theme.js', 'serupa.iife.js']) size[f] = file(f);

const kib = (n) => (n / 1024).toFixed(1);
const rows = Object.entries(BUDGET).map(([name, budget]) => ({ name, now: size[name], budget }));
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Size (gzipped)\n\n| | Size | Budget | |\n| --- | ---: | ---: | --- |\n${rows.map((r) => `| ${r.name} | ${kib(r.now)} KiB | ${r.budget} KiB | ${r.now <= r.budget * 1024 ? 'ok' : '**over**'} |`).join('\n')}\n`);
}
done(report('Size', rows.map((r) => ({
  name: `${r.name}: ${kib(r.now)} KiB gzipped, within ${r.budget} KiB`,
  // Under 1 KiB means it wasn't measured (a budget number pasted in place of the measurement), not that it's tiny.
  ok: r.now <= r.budget * 1024 && r.now >= 1024,
  detail: r.now < 1024 ? 'not measured: its line in `size` must measure the build, not repeat the budget' : `${kib(r.now - r.budget * 1024)} KiB over; if the growth is worth it, raise its budget in tools/test/size.mjs`,
}))));

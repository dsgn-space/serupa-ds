// Size budget: what each file a project loads weighs, gzipped, against the budget below. Build first (npm run build).
//   node tools/test/size.mjs
// The JavaScript is measured as a project's bundler ships it (minified, React left out, the full icon set left to
// load on demand): everything, and Button or Dialog alone. Over budget fails. When a change is worth the bytes, raise
// its line here in the same pull request, so the growth is a decision someone reviews. CI writes the table to the
// run's summary page.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as esbuild from 'esbuild';
import { PROJECT, done, report } from './lib.mjs';

// KiB, gzipped. About 3 to 5% above the size when each line was last set.
const BUDGET = {
  'All components (index.js)': 52,   // NumberInput's locale parsing and formatting (internal/numbers.ts)
  'Button alone': 12,
  'Dialog alone': 13.5,   // 13.01 after the scroll lock gutter and the shared locale hook; most of it is the 73 built-in icons, which R7 drops
  'components.css': 38,
  'utilities.css': 168,
  'bundle.css': 206,
  'base.css': 1.85,   // 1.74 with the print styles (R12)
  'theme.js': 2,
  'serupa.iife.js': 600,
};

const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
// The full icon set is a dynamic import(): a project loads it only when a page draws a name outside the built-in icons.
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
  ok: r.now <= r.budget * 1024,
  detail: `${kib(r.now - r.budget * 1024)} KiB over; if the growth is worth it, raise its budget in tools/test/size.mjs`,
}))));

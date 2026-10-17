// Component contract: every folder in src/components/ ships what the project standard asks for, so a new
// component can't pass CI with something missing. No browser needed.
//   node tools/test/contract.mjs
// Each component needs: <Name>.tsx, <Name>.css, <name>.tokens.json, <Name>.stories.tsx, <Name>.mdx, README.md,
// preview.html, a test that exercises it, and a visual baseline in every theme. Every test file in
// tools/test/ must be listed in run.mjs, or it never runs.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, PROJECT, tokensCss, report } from './lib.mjs';

// Not components: Cover is the preview of the system's cover page.
const SKIP = ['Cover'];
// Parts a component doesn't need, and why. Keep the reason: an exemption without one is a gap.
const EXEMPT = {
  Icon: { tokens: 'draws in currentColor at 1em; no visual values of its own' },
  VisuallyHidden: { tokens: 'no visual values', preview: 'nothing to see', visual: 'nothing to see' },
};
// Known gaps, to be fixed. The check fails when one is fixed, so the entry gets removed and can't come back.
const GAPS = {
  Fab: { preview: 'no preview.html yet, so no visual baseline', visual: 'no preview.html yet' },
};

const COMP = path.join(PROJECT, 'src', 'components');
const comps = fs.readdirSync(COMP).filter((c) => fs.statSync(path.join(COMP, c)).isDirectory() && !SKIP.includes(c)).sort();
const kebab = (c) => c.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const tests = fs.readdirSync(HERE).filter((f) => f.endsWith('.mjs'));
const testSrc = tests.map((f) => fs.readFileSync(path.join(HERE, f), 'utf8')).join('\n');
const { themes } = tokensCss();
const baselines = new Set(fs.existsSync(path.join(HERE, 'baseline-visual')) ? fs.readdirSync(path.join(HERE, 'baseline-visual')) : []);

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

for (const c of comps) {
  const has = (f) => fs.existsSync(path.join(COMP, c, f));
  const parts = {
    code: has(`${c}.tsx`),
    css: has(`${c}.css`),
    tokens: fs.readdirSync(path.join(COMP, c)).some((f) => f.endsWith('.tokens.json')),
    stories: has(`${c}.stories.tsx`),
    docs: has(`${c}.mdx`),
    guide: has('README.md'),
    preview: has('preview.html'),
    // A test exercises the component when it renders it (D.Name / Diki.Name) or checks its classes (dk-name).
    test: new RegExp(`\\b(?:D|Diki)\\.${c}\\b|\\bdk-${kebab(c)}\\b`).test(testSrc),
    visual: themes.every((th) => baselines.has(`${c}-${th}-rest.png`)),
  };
  const missing = [], fixed = [];
  for (const [part, ok] of Object.entries(parts)) {
    if (EXEMPT[c]?.[part]) continue;
    if (GAPS[c]?.[part]) { if (ok) fixed.push(part); continue; }
    if (!ok) missing.push(part);
  }
  const what = { code: `${c}.tsx`, css: `${c}.css`, tokens: `${kebab(c)}.tokens.json`, stories: `${c}.stories.tsx`, docs: `${c}.mdx`, guide: 'README.md', preview: 'preview.html', test: 'a test in tools/test/ that renders it', visual: `a visual baseline in each of the ${themes.length} themes (add the "update-visual-baselines" label)` };
  t(`${c} has everything a component ships with`, !missing.length && !fixed.length,
    [missing.length && `missing: ${missing.map((p) => what[p]).join(', ')}`, fixed.length && `known gap now fixed, remove it from GAPS in contract.mjs: ${fixed.join(', ')}`].filter(Boolean).join('; '));
}

const run = fs.readFileSync(path.join(HERE, 'run.mjs'), 'utf8');
const HELPERS = ['lib.mjs', 'run.mjs', 'webdriver.mjs', 'compat.mjs'];   // compat.mjs runs with --compat
const unlisted = tests.filter((f) => !HELPERS.includes(f) && !run.includes(`'${f}'`));
t('every test file in tools/test/ is listed in run.mjs', !unlisted.length, `not listed: ${unlisted.join(', ')}`);

console.log(`(${comps.length} components)`);
process.exit(report('Contract', R) ? 0 : 1);

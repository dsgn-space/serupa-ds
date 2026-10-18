// Runs the whole suite: node tools/test/run.mjs   (add --update to accept new baselines, --list to see the steps)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { HERE, PROJECT } from './lib.mjs';

const update = process.argv.includes('--update') ? ['--update'] : [];
// --browser firefox|webkit runs the Playwright suites in that engine; --compat safari|firefox|webkitgtk adds the
// cross-browser comparison through WebDriver (see compat.mjs).
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
if (arg('--browser')) process.env.SERUPA_BROWSER = arg('--browser');
// The checks, visual and Storybook steps, by group. Every other script in tools/test/ is a component suite and
// runs in the components group, found by itself: a new suite needs no entry here.
const GROUPS = {
  checks: [
    ['Package', 'package.mjs'],
    ['Package lint', 'package-lint.mjs'],
    ['Component contract', 'contract.mjs'],
    ['Foundation audit', 'foundation.mjs', PROJECT],
    ['Design tokens export', 'design-tokens.mjs', PROJECT],
    ['Style Dictionary', 'style_dictionary.mjs'],
    ['Utility classes', 'utilities.mjs', ...update],
    ['Icon names', 'icon-names.mjs'],
    ['Icon builder', 'icon-builder.mjs', PROJECT],
    ['Custom icons', 'icons.mjs'],
    ['Page groundwork', 'page.mjs'],
    ['Usage guides', 'guides.mjs'],
    ['Public API', 'api.mjs', ...update],
  ],
  visual: [['Visual snapshots', 'visual.mjs', ...update]],
  storybook: [['Storybook', 'storybook.mjs']],
};
// Shared code and the WebDriver comparison (it runs with --compat), not suites.
const HELPERS = ['lib.mjs', 'run.mjs', 'webdriver.mjs', 'compat.mjs'];
const listed = Object.values(GROUPS).flat().map(([, f]) => f);
const suites = fs.readdirSync(HERE).filter((f) => f.endsWith('.mjs') && !HELPERS.includes(f) && !listed.includes(f)).sort()
  // named as the suite reports itself (report('Button', …)), or by its file
  .map((f) => [/report\('([^']+)'/.exec(fs.readFileSync(path.join(HERE, f), 'utf8'))?.[1] || f, f]);
const node = (g) => ([name, f, ...args]) => [name, 'node', [path.join(HERE, f), ...args], g];
const steps = [
  // The component tests next to each component (src/components/<Name>/<Name>.test.tsx), in Vitest.
  ['Component tests (Vitest)', process.execPath, [path.join(PROJECT, 'node_modules', 'vitest', 'vitest.mjs'), 'run'], 'components'],
  ...suites.map(node('components')),
  ...Object.entries(GROUPS).flatMap(([g, list]) => list.map(node(g))),
];
if (arg('--group')) {
  const g = arg('--group');
  if (![...Object.keys(GROUPS), 'components'].includes(g)) { console.error(`Unknown --group "${g}" (checks, components, visual or storybook)`); process.exit(2); }
  steps.splice(0, steps.length, ...steps.filter((step) => step[3] === g));
}
if (arg('--compat')) steps.push([`Cross-browser (${arg('--compat')})`, 'node', [path.join(HERE, 'compat.mjs'), '--engine', arg('--compat'), ...(arg('--driver') ? ['--driver', arg('--driver')] : [])]]);
// --list prints the steps (of the --group, if one is given) without running them.
if (process.argv.includes('--list')) { for (const [name, , args, g] of steps) console.log(`${g}\t${name}\t${path.basename(args[0])}`); process.exit(0); }
const summary = [];
for (const [name, cmd, args] of steps) {
  console.log(`\n━━ ${name} ━━`);
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: PROJECT, env: { ...process.env, SERUPA_PROJECT: PROJECT } });
  summary.push([name, r.status === 0, Date.now() - t0]);
}
console.log('\n━━ Summary ━━');
for (const [name, ok, ms] of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${(ms / 1000).toFixed(1)}s)`);
process.exit(summary.every(([, ok]) => ok) ? 0 : 1);

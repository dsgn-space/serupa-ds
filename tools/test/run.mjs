// Runs the whole suite: node tools/test/run.mjs   (add --update to accept new baselines, --list to see the steps)
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { HERE, PROJECT } from './lib.mjs';

const update = process.argv.includes('--update') ? ['--update'] : [];
// --browser firefox|webkit runs the Playwright suites in that engine; --compat safari|firefox|webkitgtk adds the
// cross-browser comparison through WebDriver (see compat.mjs).
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
if (arg('--browser')) process.env.SERUPA_BROWSER = arg('--browser');
// The visual and Storybook steps, by group. They drive a browser through every preview and story, sharded across
// CI jobs, so they stay scripts of their own.
const GROUPS = {
  visual: [['Visual snapshots', 'visual.mjs', ...update]],
  storybook: [['Storybook', 'storybook.mjs']],
};
const node = (g) => ([name, f, ...args]) => [name, 'node', [path.join(HERE, f), ...args], g];
const vitest = (name, project, g, ...args) => [name, process.execPath, [path.join(PROJECT, 'node_modules', 'vitest', 'vitest.mjs'), 'run', '--project', project, ...args], g];
const steps = [
  // The component tests next to each component (src/components/<Name>/<Name>.test.tsx), in a browser.
  vitest('Component tests (Vitest)', 'components', 'components', ...(process.env.SERUPA_COVERAGE ? ['--coverage'] : [])),
  // --update first accepts the current API and utility classes as the baselines the checks compare with.
  ...(update.length ? [['Public API', 'api.mjs', ...update], ['Utility classes', 'utilities.mjs', ...update]].map(node('checks')) : []),
  // Every other script in tools/test/ is a check (package, tokens, icons, guides, …), run by Vitest's checks project
  // (vitest.config.ts): a new one needs no entry here.
  vitest('Checks (Vitest)', 'checks', 'checks'),
  ...Object.entries(GROUPS).flatMap(([g, list]) => list.map(node(g))),
];
if (arg('--group')) {
  const g = arg('--group');
  if (!steps.some((step) => step[3] === g)) { console.error(`Unknown --group "${g}" (checks, components, visual or storybook)`); process.exit(2); }
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

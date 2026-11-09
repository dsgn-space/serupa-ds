// Runs the whole suite. Its options:
//   node tools/test/run.mjs                      everything
//   node tools/test/run.mjs --group <name>       one group: checks, components, visual or storybook
//   node tools/test/run.mjs --since <ref>        only the components changed since then and the ones that use them
//   node tools/test/run.mjs --update             accept new baselines
//   node tools/test/run.mjs --list               the steps it would run
//   node tools/test/run.mjs --browser <engine>   firefox or webkit instead of Chromium
//   node tools/test/run.mjs --locale <code>      the component tests with the browser in that language
//   node tools/test/run.mjs --compat <engine>    add the cross-browser comparison (safari, firefox, webkitgtk), with
//                                                --driver <path> for its WebDriver
// --help prints this; an unknown option or one missing its value stops it before any test runs (GR275).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { HERE, LOCALES, PROJECT, SHARED_TEST, affectedComponents, scopeFiles, folderOf, internalTestsFor, onlyComponents, withDependents } from './lib.mjs';

const update = process.argv.includes('--update') ? ['--update'] : [];
// --browser firefox|webkit runs the Playwright suites in that engine; --compat safari|firefox|webkitgtk adds the
// cross-browser comparison through WebDriver (see compat.mjs).
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
{
  const VALUED = ['--group', '--since', '--browser', '--locale', '--compat', '--driver'], FLAGS = ['--update', '--list'];
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   ') || l.startsWith('// --help')).map((l) => l.slice(3)).join('\n'));
    process.exit(0);
  }
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (VALUED.includes(a)) {
      if (process.argv[i + 1] === undefined || process.argv[i + 1].startsWith('--')) { console.error(`${a} needs a value (node tools/test/run.mjs --help)`); process.exit(2); }
      i++;
    } else if (!FLAGS.includes(a)) { console.error(`Unknown option: ${a} (node tools/test/run.mjs --help)`); process.exit(2); }
  }
}
if (arg('--browser')) process.env.SERUPA_BROWSER = arg('--browser');
// --locale ar runs the component tests with the browser in that language (SERUPA_LOCALE, vitest.config.ts).
if (arg('--locale')) process.env.SERUPA_LOCALE = arg('--locale');
// On CI the component tests run a second time in one of LOCALES (lib.mjs), picked by the commit.
// The visual and Storybook steps, by group. They drive a browser through every preview and story, sharded across
// CI jobs, so they stay scripts of their own.
const GROUPS = {
  visual: [['Visual snapshots', 'visual.mjs', ...update]],
  storybook: [['Storybook', 'storybook.mjs']],
};
// The tests that check every story against a baseline or a rule: a change to one component can break its line in them.
const STORY_WIDE = ['hydrateStories', 'hydrateStoriesCsp', 'serverHtml', 'ariaStories', 'tabWalk', 'leaks', 'mountTime', 'network', 'strictCsp', 'trustedTypes', 'activity', 'motion', 'listRole', 'digitsStories', 'layoutShift', 'propFuzz'].map((f) => `src/internal/${f}.test.tsx`);
// --since <ref> (CI on a pull request): when every changed file belongs to a component, block or pattern folder, the component tests,
// visual snapshots and Storybook checks cover only those components and the ones that use them (SERUPA_ONLY). The checks always run whole.
// The components the change itself touches (without the ones that use them), on a narrowed run.
let direct = null;
// The shared tests the change edits: they run on a narrowed run whatever components it covers.
let sharedTests = [];
if (arg('--since')) {
  // Lines only added to shared files (a new component's labels, icons and export) don't widen it (ADDITIVE in lib.mjs).
  const diff = spawnSync('git', ['diff', '--numstat', '--no-renames', arg('--since'), 'HEAD'], { cwd: PROJECT, encoding: 'utf8' });
  // A story-wide test (STORY_WIDE) goes through the covered components' stories, so a change to one tests everything.
  const storyWide = diff.stdout.split('\n').some((l) => STORY_WIDE.includes(l.split('\t')[2]));
  // It changes no picture and no Storybook page, though: Visual and Storybook stay narrowed to the changed components.
  const wide = storyWide && !['visual', 'storybook'].includes(arg('--group'));
  const changed = diff.status === 0 && !wide ? affectedComponents(scopeFiles(diff.stdout)) : null;
  sharedTests = diff.status === 0 ? diff.stdout.split('\n').map((l) => l.split('\t')[2]).filter((f) => f && SHARED_TEST.test(f) && fs.existsSync(path.join(PROJECT, f))) : [];
  const names = changed && withDependents(changed);
  // The docs' Upgrading page renders the pending changesets (docs/upgrades.ts, the next major's breaking entries), so
  // a changed changeset re-checks that page in Storybook (GR284). It is a page, not a component: no tests or pictures.
  if (names && diff.stdout.split('\n').some((l) => /^\.changeset\/[\w-]+\.md$/.test(l.split('\t')[2] || ''))) names.add('docs/Upgrading.mdx');
  direct = changed;
  if (names) process.env.SERUPA_ONLY = [...names].sort().join(',');
  console.log(names ? `Testing the changed components and the ones that use them: ${[...names].sort().join(', ') || 'none'} (main runs everything)` : 'Testing everything: the change reaches beyond the component folders');
}
const only = onlyComponents();
// They go through the covered components' stories, so with none to go through (ErrorBoundary alone: its stories are
// left out there, SKIP in vitest/stories.tsx) most would find no test at all and fail for it.
const storied = !!only && [...only].some((n) => n !== 'ErrorBoundary' && fs.existsSync(path.join(PROJECT, 'src', 'components', n, `${n}.stories.tsx`)));
// The components' own folders and the shared tests in src/internal/ that render one of them; with SERUPA_ONLY the
// component tests (in English and in the second language) cover these.
// A block or pattern brings its own folder (src/patterns/<Name>/); an Introduction page has none.
const covered = only ? [...new Set([...[...only].map(folderOf).filter(Boolean), ...internalTestsFor(only), ...sharedTests])] : [];
const node = (g) => ([name, f, ...args]) => [name, 'node', [path.join(HERE, f), ...args], g];
const vitest = (name, project, g, ...args) => [name, process.execPath, [path.join(PROJECT, 'node_modules', 'vitest', 'vitest.mjs'), 'run', '--project', project, ...args], g];
const steps = [
  // The component tests next to each component (src/components/<Name>/<Name>.test.tsx), in a browser. Coverage
  // only on a full run: the floors in vitest.config.ts are for all of src/, which a few components can't reach.
  // With SERUPA_ONLY, the tests that go through every story (STORY_WIDE) run too, on those components' stories.
  // SERUPA_SHARD=2/3 with --group components: every third test file (CI runs the shards side by side). A shard with
  // coverage also writes Vitest's blob report (.vitest/blob/ in Vitest 5), which CI's coverage job merges into one coverage
  // report and checks against the floors.
  vitest('Component tests (Vitest)', 'components', 'components', ...(process.env.SERUPA_COVERAGE && !only ? ['--coverage'] : []), ...(process.env.SERUPA_SHARD && arg('--group') === 'components' ? [`--shard=${process.env.SERUPA_SHARD}`, ...(process.env.SERUPA_COVERAGE && !only ? ['--reporter=default', '--reporter=blob'] : [])] : []), ...(only ? [...new Set([...covered, ...(storied ? STORY_WIDE : [])])] : [])),
  // The language the commit picks, over the same tests. On a narrowed pull request, also the other three over just the
  // changed components' own tests: main picks its language by its merge commit, which the pull request can't know.
  ...(process.env.CI && (!arg('--since') || !only || only.size) && !arg('--locale') ? (() => {
    const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: PROJECT, encoding: 'utf8' }).stdout.trim();
    const locale = LOCALES[parseInt(sha.slice(0, 8) || '0', 16) % LOCALES.length];
    const own = direct?.size ? [...[...direct].map(folderOf).filter(Boolean), ...internalTestsFor(direct)] : [];
    return [
      [...vitest(`Component tests in ${locale} (Vitest)`, 'components', 'components', ...covered), { SERUPA_LOCALE: locale }],
      ...(own.length ? LOCALES.filter((l) => l !== locale).map((l) => [...vitest(`Changed components' tests in ${l} (Vitest)`, 'components', 'components', ...own), { SERUPA_LOCALE: l, SERUPA_ONLY: [...direct].sort().join(',') }]) : []),
    ];
  })() : []),
  // --update first accepts the current API and utility classes as the baselines the checks compare with.
  ...(update.length ? [['Public API', 'api.mjs', ...update], ['Utility classes', 'utilities.mjs', ...update]].map(node('checks')) : []),
  // Every other script in tools/test/ is a check (package, tokens, icons, guides, …), run by Vitest's checks project
  // (vitest.config.ts): a new one needs no entry here.
  // SERUPA_SHARD=2/3 with --group checks: every third file (CI runs the shards in parallel).
  vitest('Checks (Vitest)', 'checks', 'checks', ...(process.env.SERUPA_SHARD && arg('--group') === 'checks' ? [`--shard=${process.env.SERUPA_SHARD}`] : [])),
  ...Object.entries(GROUPS).flatMap(([g, list]) => list.map(node(g))),
];
if (arg('--group')) {
  const g = arg('--group');
  if (!steps.some((step) => step[3] === g)) { console.error(`Unknown --group "${g}" (checks, components, visual or storybook)`); process.exit(2); }
  steps.splice(0, steps.length, ...steps.filter((step) => step[3] === g));
}
// SERUPA_PART splits the components group into two CI jobs that run side by side: "locale" keeps only the runs in
// another language (the steps with a SERUPA_LOCALE), "base" everything else. Run alone, either does half the work.
if (process.env.SERUPA_PART) {
  const part = process.env.SERUPA_PART;
  if (!['base', 'locale'].includes(part)) { console.error(`Unknown SERUPA_PART "${part}" (base or locale)`); process.exit(2); }
  steps.splice(0, steps.length, ...steps.filter((step) => Boolean(step[4]?.SERUPA_LOCALE) === (part === 'locale')));
}
// No component changed (a changeset alone): nothing for the component, visual or Storybook steps to cover.
// A changed shared test still runs, in the component steps, with nothing else there.
if (only && !only.size) steps.splice(0, steps.length, ...steps.filter((step) => step[3] === 'checks' || (sharedTests.length && step[3] === 'components')));
// Only an Introduction page changed: no folder of tests to run, and the component step with no paths would run them all.
if (only && only.size && !covered.length) steps.splice(0, steps.length, ...steps.filter((step) => step[3] !== 'components'));
if (arg('--compat')) steps.push([`Cross-browser (${arg('--compat')})`, 'node', [path.join(HERE, 'compat.mjs'), '--engine', arg('--compat'), ...(arg('--driver') ? ['--driver', arg('--driver')] : [])]]);
// --list prints the steps (of the --group, if one is given) without running them.
if (process.argv.includes('--list')) { for (const [name, , args, g] of steps) console.log(`${g}\t${name}\t${path.basename(args[0])}`); process.exit(0); }
const summary = [];
for (const [name, cmd, args, , env] of steps) {
  console.log(`\n━━ ${name} ━━`);
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: PROJECT, env: { ...process.env, SERUPA_PROJECT: PROJECT, ...env } });
  summary.push([name, r.status === 0, Date.now() - t0]);
}
console.log('\n━━ Summary ━━');
for (const [name, ok, ms] of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${(ms / 1000).toFixed(1)}s)`);
process.exit(summary.every(([, ok]) => ok) ? 0 : 1);

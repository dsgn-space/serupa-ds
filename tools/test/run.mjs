// Runs the whole suite. Its options:
//   node tools/test/run.mjs                      everything
//   node tools/test/run.mjs --group <name>       one group: checks, components, visual or storybook
//   node tools/test/run.mjs --since <ref>        only the components changed since then and the ones that use them
//   node tools/test/run.mjs --since <ref> --narrowed-only   pass without running when the change reaches beyond the component folders
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
import { HERE, LOCALES, PROJECT, SHARED_TEST, affectedComponents, visualScope, scopeFiles, folderOf, internalTestsFor, onlyComponents, withDependents, touchedComponents, builtUnchanged, BUILT_CHECKS } from './lib.mjs';

const update = process.argv.includes('--update') ? ['--update'] : [];
// --browser firefox|webkit runs the Playwright suites in that engine; --compat safari|firefox|webkitgtk adds the
// cross-browser comparison through WebDriver (see compat.mjs).
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
{
  const VALUED = ['--group', '--since', '--browser', '--locale', '--compat', '--driver'], FLAGS = ['--update', '--list', '--narrowed-only'];
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
  // No picture is committed (ADR-0016): Visual draws the commit this tree starts from, then this tree (below).
  visual: [['Visual snapshots', 'visual.mjs']],
  storybook: [['Storybook', 'storybook.mjs']],
};
// The tests that check every story against a baseline or a rule: a change to one component can break its line in them.
const STORY_WIDE = ['hydrateStories', 'hydrateStoriesCsp', 'serverHtml', 'ariaStories', 'tabWalk', 'leaks', 'mountTime', 'network', 'strictCsp', 'trustedTypes', 'activity', 'motion', 'listRole', 'digitsStories', 'layoutShift', 'propFuzz'].map((f) => `src/internal/${f}.test.tsx`);
// --since <ref> (CI on a pull request): when every changed file belongs to a component, block or pattern folder, the component tests,
// visual snapshots and Storybook checks cover only those components and the ones that use them (SERUPA_ONLY). The checks run whole,
// but for the built package's when the change builds the same package (BUILT_CHECKS in lib.mjs).
// The components the change itself touches (without the ones that use them), on a narrowed run.
let direct = null;
// The shared tests the change edits: they run on a narrowed run whatever components it covers.
let sharedTests = [];
// Every test file under src/ the change edits that still exists: each runs in all four languages (own, below).
let changedTests = [];
if (arg('--since')) {
  // Lines only added to shared files (a new component's labels, icons and export) don't widen it (ADDITIVE in lib.mjs).
  const diff = spawnSync('git', ['diff', '--numstat', '--no-renames', arg('--since'), 'HEAD'], { cwd: PROJECT, encoding: 'utf8' });
  // A story-wide test (STORY_WIDE) goes through the covered components' stories, so a change to one tests everything.
  const storyWide = diff.stdout.split('\n').some((l) => STORY_WIDE.includes(l.split('\t')[2]));
  // It changes no picture and no Storybook page, though: Visual and Storybook stay narrowed to the changed components.
  const wide = storyWide && !['visual', 'storybook'].includes(arg('--group'));
  // Visual leaves out what draws main's pictures and the branch's alike (visualScope in lib.mjs).
  const scope = diff.status === 0 ? (arg('--group') === 'visual' ? visualScope(scopeFiles(diff.stdout)) : scopeFiles(diff.stdout)) : null;
  const changed = scope && !wide ? affectedComponents(scope) : null;
  sharedTests = diff.status === 0 ? diff.stdout.split('\n').map((l) => l.split('\t')[2]).filter((f) => f && SHARED_TEST.test(f) && fs.existsSync(path.join(PROJECT, f))) : [];
  changedTests = diff.status === 0 ? diff.stdout.split('\n').map((l) => l.split('\t')[2]).filter((f) => f && /^src\/.+\.test\.tsx?$/.test(f) && !/^src\/(components|blocks|patterns)\//.test(f) && fs.existsSync(path.join(PROJECT, f))) : [];
  const names = changed && withDependents(changed);
  // The docs' Upgrading page renders the pending changesets (docs/upgrades.ts, the next major's breaking entries), so
  // a changed changeset re-checks that page in Storybook (GR284). It is a page, not a component: no tests or pictures.
  if (names && diff.stdout.split('\n').some((l) => /^\.changeset\/[\w-]+\.md$/.test(l.split('\t')[2] || ''))) names.add('docs/Upgrading.mdx');
  // A change that tests everything still runs the components it edits itself in every language (touchedComponents).
  direct = changed ?? (diff.status === 0 ? touchedComponents(scopeFiles(diff.stdout)) : null);
  // A change that builds main's package again leaves the built package's checks to the queue and main (BUILT_CHECKS).
  if (diff.status === 0 && builtUnchanged(diff.stdout.split('\n').map((l) => l.split('\t')[2]).filter(Boolean))) {
    process.env.SERUPA_BUILT_AS_BASE = '1';
    if (!arg('--group') || arg('--group') === 'checks') console.log(`Leaving out ${BUILT_CHECKS.join(', ')}: the change builds the same package as ${arg('--since')}`);
  }
  if (names) process.env.SERUPA_ONLY = [...names].sort().join(',');
  console.log(names ? `Testing the changed components and the ones that use them: ${[...names].sort().join(', ') || 'none'} (main runs everything)` : 'Testing everything: the change reaches beyond the component folders');
  // --narrowed-only (a pull request's cross-browser jobs): a change that reaches beyond the component folders (shared
  // code, tooling) would run the whole suite in Firefox and WebKit, 20 to 40 minutes that hold the merge; the nightly
  // run covers those, so the job passes with a note instead.
  if (!names && process.argv.includes('--narrowed-only')) {
    console.log('--narrowed-only: not narrowed, so this run is left to the nightly cross-browser run');
    process.exit(0);
  }
}
const only = onlyComponents();
// They go through the covered components' stories, so with none to go through (ErrorBoundary alone: its stories are
// left out there, SKIP in vitest/stories.tsx) most would find no test at all and fail for it.
const storied = !!only && [...only].some((n) => n !== 'ErrorBoundary' && fs.existsSync(path.join(PROJECT, 'src', 'components', n, `${n}.stories.tsx`)));
// A block or pattern with stories brings the hydration checks, which render those too (tools/test/vitest/stories.tsx).
const HYDRATION = ['hydrateStories', 'hydrateStoriesCsp', 'strictCsp'].map((f) => `src/internal/${f}.test.tsx`);
const partStoried = !!only && [...only].some((n) => /^src\/(blocks|patterns)\//.test(folderOf(n) || '') && fs.existsSync(path.join(PROJECT, folderOf(n), `${n}.stories.tsx`)));
// The components' own folders and the shared tests in src/internal/ that render one of them; with SERUPA_ONLY the
// component tests (in English and in the second language) cover these.
// A block or pattern brings its own folder (src/patterns/<Name>/); an Introduction page has none.
const covered = only ? [...new Set([...[...only].map(folderOf).filter(Boolean), ...internalTestsFor(only), ...sharedTests])] : [];
// .vitest/narrowed names what a narrowed run with coverage tested, for the coverage job; a whole run leaves none.
const narrowedMark = path.join(PROJECT, '.vitest', 'narrowed');
if (only && process.env.SERUPA_COVERAGE) { fs.mkdirSync(path.dirname(narrowedMark), { recursive: true }); fs.writeFileSync(narrowedMark, [...only].sort().join('\n') + '\n'); } else fs.rmSync(narrowedMark, { force: true });
const node = (g) => ([name, f, ...args]) => [name, 'node', [path.join(HERE, f), ...args], g];
const vitest = (name, project, g, ...args) => [name, process.execPath, [path.join(PROJECT, 'node_modules', 'vitest', 'vitest.mjs'), 'run', '--project', project, ...args], g];
const steps = [
  // The component tests next to each component (src/components/<Name>/<Name>.test.tsx), in a browser. With
  // SERUPA_COVERAGE (CI), on a narrowed run too: the coverage job then checks that every function the pull request
  // adds runs (tools/coverage-new-functions.mjs), and leaves the floors for all of src/ to full runs (.vitest/narrowed).
  // With SERUPA_ONLY, the tests that go through every story (STORY_WIDE) run too, on those components' stories.
  // SERUPA_SHARD=2/3 with --group components: a third of the test files by time (tools/test/vitest/shard.ts; CI runs
  // the shards side by side). A shard with
  // coverage also writes Vitest's blob report (.vitest/blob/ in Vitest 5), which CI's coverage job merges into one coverage
  // report and checks against the floors. A narrowed run may have fewer files than shards: a shard left with none passes
  // (without --passWithNoTests, Vitest stops on --shard=3/3 over one file).
  vitest('Component tests (Vitest)', 'components', 'components', ...(process.env.SERUPA_COVERAGE ? ['--coverage'] : []), ...(process.env.SERUPA_SHARD && arg('--group') === 'components' ? [`--shard=${process.env.SERUPA_SHARD}`, '--passWithNoTests', ...(process.env.SERUPA_COVERAGE ? ['--reporter=default', '--reporter=blob'] : [])] : []), ...(only ? [...new Set([...covered, ...(storied ? STORY_WIDE : []), ...(partStoried ? HYDRATION : [])])] : [])),
  // The language the commit picks, over the same tests. On a narrowed pull request, also the other three over just the
  // changed components' own tests: main picks its language by its merge commit, which the pull request can't know.
  ...(process.env.CI && (!arg('--since') || !only || only.size) && !arg('--locale') ? (() => {
    const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: PROJECT, encoding: 'utf8' }).stdout.trim();
    const locale = LOCALES[parseInt(sha.slice(0, 8) || '0', 16) % LOCALES.length];
    // A test file the change edits outside the component folders (src/styles/touchTargets.test.tsx, say) runs in every
    // language too: on 14 Nov one new test read Pagination's page numbers as 0 to 9, passed its pull request in English,
    // and failed in ar-EG in the queue, dropping three pull requests behind it.
    const own = [...new Set([...(direct?.size ? [...[...direct].map(folderOf).filter(Boolean), ...internalTestsFor(direct)] : []), ...changedTests])];
    // SERUPA_SHARD with SERUPA_PART=locale (CI): every third file of each, like the base shards (GR322: the whole run
    // in one language took 12 minutes in one job). A narrowed run may have fewer files than shards: a shard left
    // with none passes.
    // Each language's run turns the shard number by the language's place in LOCALES, so a file that is a shard on its
    // own lands on a different job in each language. Without the turn, every language put activity.test.tsx (about
    // 7.5 minutes) alone on shard 1, and a change that edits it ran it four times in one job, past the job's limit
    // (the srp rename, 21 Nov). The turn is a permutation, so the jobs together still run every shard in every language.
    const [shardIndex, shardCount] = (process.env.SERUPA_SHARD || '').split('/').map(Number);
    const shardIn = (l) => !(process.env.SERUPA_SHARD && arg('--group') === 'components') ? []
      : [`--shard=${((shardIndex - 1 + Math.max(0, LOCALES.indexOf(l))) % shardCount) + 1}/${shardCount}`, '--passWithNoTests'];
    const shard = shardIn(locale);
    const ownIn = (l, more) => [...vitest(`Changed components' tests in ${l} (Vitest)`, 'components', 'components', ...shardIn(l), ...own), { SERUPA_LOCALE: l, SERUPA_ONLY: [...(direct || [])].sort().join(','), ...more }];
    // A narrowed pull request runs no locale jobs, so its base jobs take the changed components' own tests in all four
    // languages: a test that failed only in one of them was found in the queue, where it drops every group behind it.
    // The queue does the same in seconds, so it costs about a minute (SERUPA_OWN keeps the steps in the base part).
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' && arg('--since') && only) return own.length ? LOCALES.map((l) => ownIn(l, { SERUPA_OWN: '1' })) : [];
    // A pull request that tests everything (a change past the component folders) has no locale jobs either, and its
    // own tests are then every component's: in all four languages that was five whole passes in each base job, and
    // ES1's (20 Nov) ran past the job's 30 minutes. It takes the commit's language over everything instead, and the
    // queue's locale jobs the other three.
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' && arg('--since')) return [[...vitest(`Component tests in ${locale} (Vitest)`, 'components', 'components', ...shard), { SERUPA_LOCALE: locale, SERUPA_OWN: '1' }]];
    return [
      [...vitest(`Component tests in ${locale} (Vitest)`, 'components', 'components', ...shard, ...covered), { SERUPA_LOCALE: locale }],
      ...(own.length ? LOCALES.filter((l) => l !== locale).map((l) => ownIn(l)) : []),
    ];
  })() : []),
  // --update first accepts the current API and utility classes as the baselines the checks compare with.
  ...(update.length ? [['Public API', 'api.mjs', ...update], ['Utility classes', 'utilities.mjs', ...update]].map(node('checks')) : []),
  // Every other script in tools/test/ is a check (package, tokens, icons, guides, …), run by Vitest's checks project
  // (vitest.config.ts): a new one needs no entry here.
  // SERUPA_SHARD=2/3 with --group checks: a third of the checks by time (tools/test/vitest/shard.ts; CI runs the
  // shards in parallel).
  vitest('Checks (Vitest)', 'checks', 'checks', ...(process.env.SERUPA_SHARD && arg('--group') === 'checks' ? [`--shard=${process.env.SERUPA_SHARD}`] : [])),
  ...Object.entries(GROUPS).flatMap(([g, list]) => list.map(node(g))),
];
// Visual (ADR-0016): no picture is committed. It draws the pictures of the commit this tree starts from, then this tree's,
// and reports what differs for review (the design-qa label signs it off): a picture is never a failure, a story that
// can't be drawn is. The commit is SERUPA_VISUAL_REF, else where this branch left main (visual-base.mjs builds its
// Storybook in a worktree beside this one). On main itself it draws this tree twice, and there a difference fails:
// a story that doesn't draw the same twice (the nightly flake hunt, Cross-browser in Firefox and WebKit).
// SERUPA_VISUAL_BASE=<a Storybook already built> skips the build and compares with it.
{
  const at = steps.findIndex((step) => step[3] === 'visual');
  if (at >= 0) {
    const { baseCommit, commitOf, STORYBOOK } = await import('./visual-base.mjs');
    const main = path.join(PROJECT, '.visual-main'), report = path.join(PROJECT, '.visual-review');
    const sha = process.env.SERUPA_VISUAL_BASE ? '' : baseCommit();
    const self = !process.env.SERUPA_VISUAL_BASE && sha === commitOf('HEAD');
    const sb = process.env.SERUPA_VISUAL_BASE || (self ? path.join(PROJECT, 'storybook-static') : STORYBOOK);
    if (!arg('--list')) {
      fs.rmSync(main, { recursive: true, force: true });
      fs.rmSync(report, { recursive: true, force: true });
    }
    steps.splice(at, 1,
      ...(sha && !self ? [[`Visual snapshots: build ${sha.slice(0, 9)}'s Storybook`, 'node', [path.join(HERE, 'visual-base.mjs'), sha], 'visual', {}]] : []),
      [self ? 'Visual snapshots: this tree, first pass' : "Visual snapshots: main's", 'node', [path.join(HERE, 'visual.mjs'), '--update'], 'visual', { SERUPA_STORYBOOK: sb, SERUPA_VISUAL_DIR: main }],
      [self ? 'Visual snapshots: this tree again, against the first pass' : 'Visual snapshots: this change against main', 'node', [path.join(HERE, 'visual.mjs')], 'visual', { SERUPA_VISUAL_DIR: main, ...(self ? {} : { SERUPA_VISUAL_REPORT: report }) }]);
  }
}
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
  steps.splice(0, steps.length, ...steps.filter((step) => Boolean(step[4]?.SERUPA_LOCALE && !step[4]?.SERUPA_OWN) === (part === 'locale')));
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

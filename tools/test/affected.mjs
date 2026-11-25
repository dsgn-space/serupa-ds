// Which components a pull request's CI covers (run.mjs --since): only changes inside component, block and pattern folders narrow it,
// and a component brings the ones that use it. No browser needed.
//   node tools/test/affected.mjs
import { affectedComponents, visualScope, touchedComponents, folderForKebab, folderOf, inParallelRetry, RETRY_UP_TO, internalTestsFor, kebab, scopeFiles, withDependents, inShard, sizeBudgets, sharedRaise, raiseTag, sitePageKey, builtUnchanged, siteUnchanged, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const list = (s) => (s ? [...s].sort().join(', ') : 'everything');

const raised = sizeBudgets([['Meter.json', { alone: 3.0, share: 0.5, css: 1.0 }], ['Meter.claude-a.json', { alone: 3.2 }], ['Meter.claude-b.json', { alone: 3.1, css: 1.2 }], ['notes.txt', {}]]);
t('a size budget is the highest of the component\'s file and its raise files', JSON.stringify(raised) === '{"Meter":{"alone":3.2,"share":0.5,"css":1.2}}', JSON.stringify(raised));
t('a raise file is named by its branch, and a detached checkout by "local"', raiseTag('claude/fix-x') === 'claude-fix-x' && raiseTag('HEAD') === 'local' && raiseTag('') === 'local', [raiseTag('claude/fix-x'), raiseTag('HEAD')].join(' '));
t('a change to workflows and tools alone builds the same package', builtUnchanged(['.github/workflows/ci.yml', 'tools/runner-watch.mjs', 'tools/test/site.mjs', 'tools/README.md']));
for (const f of ['src/components/Meter/Meter.tsx', 'tools/build/build.mjs', 'tools/utilities/template.mjs', 'tools/tokens/build.mjs', 'tools/typescript/api.mjs', 'tools/lint/a11y-components.mjs', '.github/actions/setup/action.yml', 'tools/test/tree-shake.mjs', 'tools/test/lib.mjs', 'tools/test/baseline-server/Meter.html', 'docs/Upgrading.mdx', 'package.json', '.changeset/x.md']) {
  t(`a change to ${f} runs the built package's checks`, !builtUnchanged(['.github/workflows/ci.yml', f]));
}
t('no change at all runs them', !builtUnchanged([]));
t('a change to workflows and tools the docs site doesn\'t read builds the same site', siteUnchanged(['.github/workflows/ci.yml', 'tools/runner-watch.mjs', 'tools/test/size.mjs', 'tools/build/build.mjs']));
for (const f of ['tools/test/site.mjs', 'tools/site/head.mjs', 'tools/health.mjs', 'tools/utilities/template.mjs', 'tools/build/registry.mjs', 'tools/test/lib.mjs', 'site/src/blocks.tsx', 'docs/Upgrading.mdx', 'src/components/Meter/Meter.mdx', '.github/actions/setup/action.yml']) {
  t(`a change to ${f} runs the site check`, !siteUnchanged(['.github/workflows/ci.yml', f]));
}
t('a site page answers to its folder\'s name, a docs page to its file', sitePageKey('src/patterns/StoreLocator/StoreLocator.mdx') === 'StoreLocator' && sitePageKey('docs/Upgrading.mdx') === 'docs/Upgrading.mdx', sitePageKey('src/patterns/StoreLocator/StoreLocator.mdx'));
t('a change to the site check itself opens every page', affectedComponents(['tools/test/site.mjs']) === null, list(affectedComponents(['tools/test/site.mjs'])));
t('the shared raise files add up, and a line no file names gets nothing', sharedRaise([{ STARTER: [0.1, 'a'] }, { STARTER: [0.2, 'b'], LABELS: [0.1, 'c'] }, {}], 'STARTER') === 0.3 && sharedRaise([{ STARTER: [0.1, 'a'] }], 'LABELS') === 0, String(sharedRaise([{ STARTER: [0.1, 'a'] }, { STARTER: [0.2, 'b'] }], 'STARTER')));
t('a shared size raise file covers no component', affectedComponents(['tools/test/baseline-size-shared/claude-fix-x.json'])?.size === 0, list(affectedComponents(['tools/test/baseline-size-shared/claude-fix-x.json'])));
const raiseFile = affectedComponents(['tools/test/baseline-size/Meter.claude-fix-x.json']);
t('a raise file covers its component', list(raiseFile) === 'Meter', list(raiseFile));

const one = affectedComponents(['src/components/Meter/Meter.tsx', 'src/components/Meter/Meter.css', 'tools/test/baseline-aria/Meter.yml', '.changeset/meter.md']);
t('a change inside one component folder (with its baselines and changeset) covers that component', list(one) === 'Meter', list(one));
const two = affectedComponents(['src/components/Tabs/Tabs.tsx', 'tools/test/baseline-api/Kbd.d.ts', 'tools/test/ssr/Kbd.mjs', 'tools/test/baseline-size/Meter.json']);
t('its API baseline, size budgets and server-render case count as the component\'s', list(two) === 'Kbd, Meter, Tabs', list(two));
for (const f of ['src/internal/labels.ts', 'tokens.json', 'src/styles/cascade.txt', 'tools/test/visual.mjs', '.storybook/preview.tsx', 'package.json', 'docs/Localization.mdx']) {
  t(`a change to ${f} tests everything`, affectedComponents(['src/components/Meter/Meter.tsx', f]) === null, list(affectedComponents([f])));
}
t('the docs\' Markdown no page shows (warnings, ADRs, RFCs) covers no component', affectedComponents(['docs/warnings.md', 'docs/adr/0015-upgrades.md', 'docs/rfcs/15.md'])?.size === 0);
t('docs/foundations.md, which the docs blocks show, tests everything', affectedComponents(['docs/foundations.md']) === null);
t('a changeset alone covers no component', affectedComponents(['.changeset/x.md'])?.size === 0);
const none = ['CONTRIBUTING.md', '.github/pull_request_template.md', 'tools/test/size.mjs', 'tools/publish.mjs', '.github/dependabot.yml', '.github/workflows/release.yml', 'tools/test/baseline-utilities.json', 'licenses/inter.txt',
  'tools/skill-eval/results/2026-11-06-agentic/with/sign-in.1/src/App.tsx', 'tools/ci.mjs', '.github/workflows/nightly.yml', '.github/workflows/screen-readers.yml', 'AGENTS.md', 'skills/serupa/references/forms.md'];
t('the release scripts, the Node checks and the other workflows cover no component', affectedComponents(none)?.size === 0, list(affectedComponents(none)));
for (const f of ['.github/workflows/ci.yml', 'tools/test/lib.mjs', 'tools/test/storybook.mjs', 'tools/test/vitest/setup.ts', 'CHANGELOG.md', 'README.md']) t(`a change to ${f} tests everything`, affectedComponents([f]) === null);
const touched = touchedComponents(['src/components/Kanban/Kanban.tsx', 'tools/test/baseline-size/Sidebar.json', 'docs/LoadingAndWaiting.mdx', 'src/internal/labels.ts']);
t('for Visual, a change to CI alone draws Button only (main and the branch are drawn alike)', list(affectedComponents(visualScope(['.github/workflows/ci.yml', '.github/actions/setup/action.yml', '.nvmrc']))) === 'Button');
t('for Visual, CI beside a component draws that component', list(affectedComponents(visualScope(['.github/workflows/ci.yml', 'src/components/Meter/Meter.css']))) === 'Meter');
t('for Visual, CI beside shared code still draws everything', affectedComponents(visualScope(['.github/workflows/ci.yml', 'src/internal/provider.tsx'])) === null);
t('for Visual, nothing changed is nothing to draw', visualScope([]).length === 0);
t('a change that tests everything still names the components it edits itself (Kanban, and Sidebar by its size budget)', list(touched) === 'Kanban, Sidebar' && affectedComponents(['src/components/Kanban/Kanban.tsx', 'docs/LoadingAndWaiting.mdx']) === null, list(touched));
t('a change to no component folder edits none', touchedComponents(['docs/LoadingAndWaiting.mdx', 'tokens.json']).size === 0);
const deps = withDependents(new Set(['Button']));
t('a component brings the ones that use it (Button: ToggleButton, and Dialog through IconButton)', deps.has('Button') && deps.has('ToggleButton') && deps.has('Dialog') && !deps.has('Meter'), list(deps));
t('a component its stories use counts too (Input: Field, whose stories show one)', withDependents(new Set(['Input'])).has('Field'), list(withDependents(new Set(['Input']))));
t('a component nothing uses brings only itself', list(withDependents(new Set(['SidebarLayout']))) === 'SidebarLayout', list(withDependents(new Set(['SidebarLayout']))));
t('a pattern that shows a component comes with it (Meter: Billing and Dashboard, and Chat whose stories show one)', ['Billing', 'Chat', 'Dashboard', 'Meter'].every((n) => withDependents(new Set(['Meter'])).has(n)), list(withDependents(new Set(['Meter']))));
const pattern = affectedComponents(['src/patterns/Checkout/Checkout.tsx', 'src/patterns/Introduction.mdx', 'tools/test/baseline-aria/Checkout.yml', 'src/blocks/StatsRow/StatsRow.tsx']);
t('a block or pattern folder covers that block or pattern, and its Introduction page that page', list(pattern) === 'Checkout, Introduction.mdx, StatsRow', list(pattern));
t('a pattern brings no component', list(withDependents(new Set(['Checkout']))) === 'Checkout', list(withDependents(new Set(['Checkout']))));
t('a block brings the patterns that show it (AuthCard: SignIn)', withDependents(new Set(['AuthCard'])).has('SignIn'), list(withDependents(new Set(['AuthCard']))));
t('a component brings the blocks and patterns that use it (Heading: Checkout, StatsRow)', ['Checkout', 'StatsRow'].every((n) => withDependents(new Set(['Heading'])).has(n)), list(withDependents(new Set(['Heading']))));
t('each name runs its own folder\'s tests, and an Introduction page none', folderOf('Checkout') === 'src/patterns/Checkout/' && folderOf('StatsRow') === 'src/blocks/StatsRow/' && folderOf('Meter') === 'src/components/Meter/' && folderOf('Introduction.mdx') === null);
const globbed = internalTestsFor(new Set(['ProductGrid']));
t('a block brings the shared tests that read every block through a glob (ProductGrid: labels)', globbed.includes('src/internal/labels.test.tsx'), globbed.join(', '));
const shared = internalTestsFor(new Set(['LoadMore']));
t('a component brings the shared src/internal tests that render it (LoadMore: announceContract), not the others', shared.includes('src/internal/announceContract.test.tsx') && !shared.includes('src/internal/typeahead.test.tsx'), shared.join(', '));

// A new component adds lines to shared files (its labels in every language, its icons, its export) and a case to a
// shared test: with nothing removed there, only its own folder decides what runs.
const added = scopeFiles(['3\t0\tsrc/labels/en.ts', '3\t0\tsrc/labels/id.ts', '4\t0\tsrc/material/named.ts', '1\t0\tsrc/index.ts', '3\t2\tsrc/internal/labels.test.tsx', '40\t0\tsrc/components/Attachment/Attachment.tsx', '12\t0\tdesign-tokens/components/attachment.tokens.json', '8\t0\ttools/test/baseline-aria/Attachment.yml', '9\t0\ttools/test/baseline-server/Attachment.html'].join('\n'));
t('a new component\'s added lines in shared files cover only it', list(affectedComponents(added)) === 'Attachment', `${added.join(', ')} -> ${list(affectedComponents(added))}`);
t('a component\'s tokens file is that component\'s (avatar-group is AvatarGroup)', list(affectedComponents(['design-tokens/components/avatar-group.tokens.json'])) === 'AvatarGroup');
const cases = { DatePicker: 'date-picker', AvatarGroup: 'avatar-group', OTPInput: 'otp-input', QRCode: 'qr-code', Heading2: 'heading2', Button: 'button' };
const wrong = Object.entries(cases).filter(([n, k]) => kebab(n) !== k).map(([n]) => `${n} -> ${kebab(n)}`);
t('one kebab case for every tool: a run of capitals stays one word (OTPInput is otp-input, R7)', !wrong.length, wrong.join(', '));
t('and back to its folder by the folders there are (date-picker is DatePicker; a name with none is null)', folderForKebab('date-picker') === 'DatePicker' && folderForKebab('no-such-thing') === null);
for (const row of ['2\t1\tsrc/labels/en.ts', '0\t3\tsrc/index.ts', '-\t-\tsrc/material/named.ts']) t(`a shared file with a line removed or changed (${row.replace(/\t/g, ' ')}) still tests everything`, affectedComponents(scopeFiles(row)) === null);

// GR192: a component that draws with another's classes counts as using it.
const input = withDependents(new Set(['Input'])), navbar = withDependents(new Set(['Navbar']));
t('Input brings DatePicker and DateRangePicker (they use .srp-input), and Navbar brings Fab (.srp-navbar--sticky)', input.has('DatePicker') && input.has('DateRangePicker') && navbar.has('Fab'), `${list(input)}; ${list(navbar)}`);

// A story that fails once is tried again on its own, and one that fails twice stays failed.
{
  const seen = new Map();
  const check = async (id) => { seen.set(id, (seen.get(id) || 0) + 1); return [{ name: id, ok: id === 'steady' || (id === 'flaky' && seen.get(id) > 1) }]; };
  const log = console.log; console.log = () => {};
  const out = await inParallelRetry(['steady', 'flaky', 'broken'], [0, 1], check, (x) => x).finally(() => { console.log = log; });
  t('a failed story is tried once more: a flake passes, a real failure stays', out.map((r) => r[0].ok).join() === 'true,true,false' && seen.get('steady') === 1 && seen.get('broken') === 2, JSON.stringify([...seen]));
}
// More failures than RETRY_UP_TO is a change: none of them is tried again.
{
  const items = Array.from({ length: RETRY_UP_TO + 1 }, (_, i) => `broken-${i}`);
  let calls = 0;
  const log = console.log; console.log = () => {};
  const out = await inParallelRetry(items, [0, 1], async (id) => { calls++; return [{ name: id, ok: false }]; }, (x) => x).finally(() => { console.log = log; });
  t(`more than ${RETRY_UP_TO} failures are not tried again, and stay failed`, calls === items.length && out.every((r) => !r[0].ok), `${calls} calls`);
}

// Visual's shards: a story stays in its shard when stories are added before it, each story is in exactly one shard, and
// the shards share the stories out about evenly.
{
  const ids = Array.from({ length: 400 }, (_, i) => `calendar--story-${i}`);
  const where = (list, n) => new Map(list.map((id) => [id, [1, 2, 3, 4, 5].slice(0, n).filter((s) => inShard(id, s, n))]));
  const before = where(ids, 5);
  const after = where(['calendar--aaa-new', 'button--new', ...ids], 5);
  t('a story added before others moves none of them to another shard', ids.every((id) => before.get(id).join() === after.get(id).join()));
  t('each story is in exactly one shard', [...after.values()].every((s) => s.length === 1));
  const sizes = [1, 2, 3, 4, 5].map((s) => ids.filter((id) => inShard(id, s, 5)).length);
  t('the shards share the stories out about evenly', Math.min(...sizes) >= 60, sizes.join());
  t('one shard holds every story', ids.every((id) => inShard(id, 1, 1)));
}

// Runner watch (tools/runner-watch.mjs): where x86 jobs go, and its reports with Issues off.
{
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const env = { ...process.env };
  const summary = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'runner-watch-')), 'summary.md');
  Object.assign(process.env, { GITHUB_REPOSITORY: 'o/r', GH_TOKEN: 'x', GITHUB_STEP_SUMMARY: summary });
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"message":"Issues are disabled for this repo"}', { status: 410 });
  const log = console.log;
  console.log = () => {};
  try {
    const { pickRunner, keepIssue } = await import('../runner-watch.mjs');
    const x86 = '["self-hosted","linux","x86"]';
    const now = Date.parse('2026-11-20T08:00:00Z');
    t('x86 jobs go to the machines while one started a job in the window', pickRunner({ x86, lastStart: now - 30 * 60_000, now }) === x86);
    t('x86 jobs go to GitHub\'s runners once the machines have started nothing for 100 minutes (the VM deleted itself)', pickRunner({ x86, lastStart: now - 101 * 60_000, now }) === '"ubuntu-24.04"');
    t('x86 jobs go to GitHub\'s runners when no self-hosted start is seen', pickRunner({ x86, lastStart: null, now }) === '"ubuntu-24.04"');
    const at = (hm) => Date.parse('2026-11-21T' + hm + ':00Z');
    t('x86 jobs go to GitHub\'s runners during the VM\'s upgrade window (05:30 to 07:05 UTC), when it may restart its runners', pickRunner({ x86, lastStart: at('05:29'), now: at('05:30') }) === '"ubuntu-24.04"' && pickRunner({ x86, lastStart: at('05:29'), now: at('07:04') }) === '"ubuntu-24.04"');
    t('after the upgrade window, the quiet time doesn\'t count against the machines', pickRunner({ x86, lastStart: at('05:20'), now: at('07:05') }) === x86 && pickRunner({ x86, lastStart: at('05:20'), now: at('08:40') }) === '"ubuntu-24.04"');
    t('a fork\'s jobs and an unset variable go to GitHub\'s runners', pickRunner({ x86, fork: true, lastStart: now, now }) === '"ubuntu-24.04"' && pickRunner({ x86: '', lastStart: now, now }) === '"ubuntu-24.04"');
    let said, err;
    try { said = await keepIssue('Jobs waiting for a runner', 'runner-watch', ['ci (CI, main) has waited 400 minutes'], 'One job waits.'); } catch (e) { err = e.message; }
    const text = fs.existsSync(summary) ? fs.readFileSync(summary, 'utf8') : '';
    t('with Issues off (410), the stuck jobs go to the run\'s summary instead of failing to report', !err && /summary/.test(said) && text.includes('has waited 400 minutes'), err || said);
  } finally {
    globalThis.fetch = realFetch;
    console.log = log;
    for (const k of ['GITHUB_REPOSITORY', 'GH_TOKEN', 'GITHUB_STEP_SUMMARY']) if (k in env) process.env[k] = env[k]; else delete process.env[k];
  }
}

done(report('Affected components', R));

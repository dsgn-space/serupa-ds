// Which components a pull request's CI covers (run.mjs --since): only changes inside component, block and pattern folders narrow it,
// and a component brings the ones that use it. No browser needed.
//   node tools/test/affected.mjs
import { affectedComponents, folderForKebab, folderOf, inParallelRetry, internalTestsFor, kebab, scopeFiles, withDependents, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const list = (s) => (s ? [...s].sort().join(', ') : 'everything');

const one = affectedComponents(['src/components/Meter/Meter.tsx', 'src/components/Meter/Meter.css', 'tools/test/baseline-visual/Meter/Default-blue-light-rest.png', '.changeset/meter.md']);
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
const deps = withDependents(new Set(['Button']));
t('a component brings the ones that use it (Button: ToggleButton, and Dialog through IconButton)', deps.has('Button') && deps.has('ToggleButton') && deps.has('Dialog') && !deps.has('Meter'), list(deps));
t('a component its stories use counts too (Input: Field, whose stories show one)', withDependents(new Set(['Input'])).has('Field'), list(withDependents(new Set(['Input']))));
t('a component nothing uses brings only itself', list(withDependents(new Set(['Carousel']))) === 'Carousel', list(withDependents(new Set(['Carousel']))));
t('a pattern that shows a component comes with it (Meter: Dashboard, and Chat whose stories show one)', list(withDependents(new Set(['Meter']))) === 'Chat, Dashboard, Meter', list(withDependents(new Set(['Meter']))));
const pattern = affectedComponents(['src/patterns/Checkout/Checkout.tsx', 'src/patterns/Introduction.mdx', 'tools/test/baseline-visual/Checkout/Default-blue-light-rest.png', 'src/blocks/StatsRow/StatsRow.tsx']);
t('a block or pattern folder covers that block or pattern, and its Introduction page that page', list(pattern) === 'Checkout, Introduction.mdx, StatsRow', list(pattern));
t('a pattern brings no component', list(withDependents(new Set(['Checkout']))) === 'Checkout', list(withDependents(new Set(['Checkout']))));
t('a block brings the patterns that show it (AuthCard: SignIn)', withDependents(new Set(['AuthCard'])).has('SignIn'), list(withDependents(new Set(['AuthCard']))));
t('a component brings the blocks and patterns that use it (Heading: Checkout, StatsRow)', ['Checkout', 'StatsRow'].every((n) => withDependents(new Set(['Heading'])).has(n)), list(withDependents(new Set(['Heading']))));
t('each name runs its own folder\'s tests, and an Introduction page none', folderOf('Checkout') === 'src/patterns/Checkout/' && folderOf('StatsRow') === 'src/blocks/StatsRow/' && folderOf('Meter') === 'src/components/Meter/' && folderOf('Introduction.mdx') === null);
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
t('Input brings DatePicker and DateRangePicker (they use .dk-input), and Navbar brings Fab (.dk-navbar--sticky)', input.has('DatePicker') && input.has('DateRangePicker') && navbar.has('Fab'), `${list(input)}; ${list(navbar)}`);

// A story that fails once is tried again on its own, and one that fails twice stays failed.
{
  const seen = new Map();
  const check = async (id) => { seen.set(id, (seen.get(id) || 0) + 1); return [{ name: id, ok: id === 'steady' || (id === 'flaky' && seen.get(id) > 1) }]; };
  const log = console.log; console.log = () => {};
  const out = await inParallelRetry(['steady', 'flaky', 'broken'], [0, 1], check, (x) => x).finally(() => { console.log = log; });
  t('a failed story is tried once more: a flake passes, a real failure stays', out.map((r) => r[0].ok).join() === 'true,true,false' && seen.get('steady') === 1 && seen.get('broken') === 2, JSON.stringify([...seen]));
}

done(report('Affected components', R));

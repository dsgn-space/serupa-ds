// Which components a pull request's CI covers (run.mjs --since): only changes inside component, block and pattern folders narrow it,
// and a component brings the ones that use it. No browser needed.
//   node tools/test/affected.mjs
import { affectedComponents, folderOf, internalTestsFor, withDependents, report, done } from './lib.mjs';

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
t('a changeset alone covers no component', affectedComponents(['.changeset/x.md'])?.size === 0);
const none = ['CONTRIBUTING.md', '.github/pull_request_template.md', 'tools/test/size.mjs', 'tools/publish.mjs', '.github/dependabot.yml', '.github/workflows/release.yml', 'tools/test/baseline-utilities.json', 'licenses/inter.txt'];
t('the release scripts, the Node checks and the other workflows cover no component', affectedComponents(none)?.size === 0, list(affectedComponents(none)));
for (const f of ['.github/workflows/ci.yml', 'tools/test/lib.mjs', 'tools/test/storybook.mjs', 'tools/test/vitest/setup.ts', 'CHANGELOG.md']) t(`a change to ${f} tests everything`, affectedComponents([f]) === null);
const deps = withDependents(new Set(['Button']));
t('a component brings the ones that use it (Button: ToggleButton, and Dialog through IconButton)', deps.has('Button') && deps.has('ToggleButton') && deps.has('Dialog') && !deps.has('Meter'), list(deps));
t('a component its stories use counts too (Input: Field, whose stories show one)', withDependents(new Set(['Input'])).has('Field'), list(withDependents(new Set(['Input']))));
t('a component nothing uses brings only itself', list(withDependents(new Set(['Carousel']))) === 'Carousel', list(withDependents(new Set(['Carousel']))));
t('a pattern that shows a component comes with it (Meter: Dashboard)', list(withDependents(new Set(['Meter']))) === 'Dashboard, Meter', list(withDependents(new Set(['Meter']))));
const pattern = affectedComponents(['src/patterns/Checkout/Checkout.tsx', 'src/patterns/Introduction.mdx', 'tools/test/baseline-visual/Checkout/Default-blue-light-rest.png', 'src/blocks/StatsRow/StatsRow.tsx']);
t('a block or pattern folder covers that block or pattern, and its Introduction page that page', list(pattern) === 'Checkout, Introduction.mdx, StatsRow', list(pattern));
t('a pattern brings no component', list(withDependents(new Set(['Checkout']))) === 'Checkout', list(withDependents(new Set(['Checkout']))));
t('a block brings the patterns that show it (AuthCard: SignIn)', withDependents(new Set(['AuthCard'])).has('SignIn'), list(withDependents(new Set(['AuthCard']))));
t('a component brings the blocks and patterns that use it (Heading: Checkout, StatsRow)', ['Checkout', 'StatsRow'].every((n) => withDependents(new Set(['Heading'])).has(n)), list(withDependents(new Set(['Heading']))));
t('each name runs its own folder\'s tests, and an Introduction page none', folderOf('Checkout') === 'src/patterns/Checkout/' && folderOf('StatsRow') === 'src/blocks/StatsRow/' && folderOf('Meter') === 'src/components/Meter/' && folderOf('Introduction.mdx') === null);
const shared = internalTestsFor(new Set(['LoadMore']));
t('a component brings the shared src/internal tests that render it (LoadMore: announceContract), not the others', shared.includes('src/internal/announceContract.test.tsx') && !shared.includes('src/internal/typeahead.test.tsx'), shared.join(', '));

done(report('Affected components', R));

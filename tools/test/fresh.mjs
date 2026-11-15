// tools/fresh.mjs: when a branch's pictures can't match main's. No network: the GitHub calls are the CLI's.
//   node tools/test/fresh.mjs
import { queueClashes, staleComponents } from '../fresh.mjs';
import { done, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const png = (n) => `tools/test/baseline-visual/${n}/Default-blue-light-rest.png`;
const alone = (s) => s;

t('both sides changed a component and the branch drew its pictures: stale',
  same(staleComponents(['src/components/Meter/Meter.css', png('Meter')], ['src/components/Meter/Meter.tsx'], alone), ['Meter']));
t('main drew a component\'s pictures again that the branch changes with no picture: fresh (its own Visual moved none)',
  same(staleComponents(['src/components/Meter/Meter.css'], [png('Meter')], alone), []));
t('both sides changed one component without any picture: fresh (the queue tests the code)',
  same(staleComponents(['src/components/Meter/Meter.css'], ['src/components/Meter/Meter.tsx'], alone), []));
t('different components: fresh', same(staleComponents([png('Meter'), 'src/components/Meter/Meter.css'], [png('Tabs'), 'src/components/Tabs/Tabs.tsx'], alone), []));
t('shared code on main leaves it to the after-main redraw: fresh',
  same(staleComponents([png('Meter')], ['tokens.json', 'src/internal/labels.ts', 'CHANGELOG.md'], alone), []));
const deps = (s) => new Set([...s, ...(s.has('Button') ? ['ToggleButton'] : [])]);
t('main redrew a component, and the branch redrew one that uses it: stale',
  same(staleComponents([png('ToggleButton')], [png('Button'), 'src/components/Button/Button.css'], deps), ['ToggleButton']));
t('the branch redrew a component, and main redrew one that uses it: fresh (the branch\'s Visual left that one as it was)',
  same(staleComponents([png('Button'), 'src/components/Button/Button.css'], [png('ToggleButton')], deps), []));
t('both sides drew one component\'s pictures: stale',
  same(staleComponents([png('Meter')], [png('Meter')], alone), ['Meter']));
t('main changed a component\'s code with no picture (labels), and the branch redrew one that uses it: fresh',
  same(staleComponents([png('ToggleButton')], ['src/components/Button/Button.tsx'], deps), []));
t('queue: a queued pull request that redraws a component this branch shows makes it wait',
  same(queueClashes([png('ToggleButton')], { 1990: [png('Button'), 'src/components/Button/Button.css'], 1991: [png('Tabs')] }, deps),
    [{ n: 1990, baselines: [], stale: ['ToggleButton'] }]));
t('queue: the same size baseline on both sides clashes, with no picture',
  same(queueClashes(['tools/test/baseline-size/Kanban.json'], { 1690: ['tools/test/baseline-size/Kanban.json'] }, alone),
    [{ n: 1690, baselines: ['tools/test/baseline-size/Kanban.json'], stale: [] }]));
t('queue: different components, or an empty queue, clash with nothing',
  same(queueClashes([png('Meter')], { 1990: [png('Tabs')] }, alone), []) && same(queueClashes([png('Meter')], {}, alone), []));
t('the real dependency walk: Button\'s pictures on main reach ToggleButton\'s on the branch',
  same(staleComponents([png('ToggleButton')], [png('Button')]), ['ToggleButton']));
t('a theme change on main (tokens.css) makes every picture the branch drew stale',
  same(staleComponents([png('Meter'), png('ApiKeys'), 'src/components/Meter/Meter.css'], ['tokens/serupa.tokens.json', 'tokens.json', 'tokens.css'], alone), ['ApiKeys', 'Meter']));
t('a theme change on main leaves a branch that drew no picture fresh',
  same(staleComponents(['src/components/Meter/Meter.css'], ['tokens.css', 'src/styles/base.css'], alone), []));
t('a pattern\'s pictures count as the pattern\'s', same(staleComponents([png('Checkout')], ['src/patterns/Checkout/Checkout.tsx'], alone), ['Checkout']));

done(report('Fresh against main', R));

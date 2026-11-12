// tools/fresh.mjs: when a branch's pictures can't match main's. No network: the GitHub calls are the CLI's.
//   node tools/test/fresh.mjs
import { staleComponents } from '../fresh.mjs';
import { done, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const png = (n) => `tools/test/baseline-visual/${n}/Default-blue-light-rest.png`;
const alone = (s) => s;

t('both sides changed a component and the branch drew its pictures: stale',
  same(staleComponents(['src/components/Meter/Meter.css', png('Meter')], ['src/components/Meter/Meter.tsx'], alone), ['Meter']));
t('main drew a component\'s pictures again that the branch changes: stale',
  same(staleComponents(['src/components/Meter/Meter.css'], [png('Meter')], alone), ['Meter']));
t('both sides changed one component without any picture: fresh (the queue tests the code)',
  same(staleComponents(['src/components/Meter/Meter.css'], ['src/components/Meter/Meter.tsx'], alone), []));
t('different components: fresh', same(staleComponents([png('Meter'), 'src/components/Meter/Meter.css'], [png('Tabs'), 'src/components/Tabs/Tabs.tsx'], alone), []));
t('shared code or tokens on main leave it to the after-main redraw: fresh',
  same(staleComponents([png('Meter')], ['tokens.json', 'src/internal/labels.ts', 'CHANGELOG.md'], alone), []));
t('a component main changed reaches the branch\'s through the ones that use it (Button: ToggleButton)',
  same(staleComponents([png('ToggleButton'), 'src/components/ToggleButton/ToggleButton.css'], ['src/components/Button/Button.css']), ['ToggleButton']));
t('a pattern\'s pictures count as the pattern\'s', same(staleComponents([png('Checkout')], ['src/patterns/Checkout/Checkout.tsx'], alone), ['Checkout']));

done(report('Fresh against main', R));

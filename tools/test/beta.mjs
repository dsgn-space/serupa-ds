// tools/beta.mjs: which betas can leave beta. No git: the log text is written out here.
//   node tools/test/beta.mjs
import { apiSince, verdict } from '../beta.mjs';
import { done, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const commit = (date, ...lines) => `\0${date}\n\ndiff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n${lines.join('\n')}\n`;
const log = (...commits) => commits.join('');

t('only additions: the API dates from the first commit',
  apiSince(log(commit('2026-11-10', '+    open?: boolean;'), commit('2026-11-01', '+interface P {'))) === '2026-11-01');
t('a removed prop dates the API from that commit',
  apiSince(log(commit('2026-11-12', '+    lines?: number;'), commit('2026-11-08', '-    busy?: boolean;', '+    loading?: boolean;'), commit('2026-11-01', '+interface P {'))) === '2026-11-08');
t('letting a prop take undefined isn\'t a change',
  apiSince(log(commit('2026-11-02', '-    size?: number;', '+    size?: number | undefined;'), commit('2026-11-01', '+    size?: number;'))) === '2026-11-01');
t('nor wrapping a function type for it',
  apiSince(log(commit('2026-11-02', '-    onOpen?: (open: boolean) => void;', '+    onOpen?: ((open: boolean) => void) | undefined;'), commit('2026-11-01', '+x'))) === '2026-11-01');
t('a changed type is a change',
  apiSince(log(commit('2026-11-05', '-    size?: number;', '+    size?: string;'), commit('2026-11-01', '+x'))) === '2026-11-05');
t('no baseline: no date', apiSince('') === undefined);

const now = new Date('2026-12-01T00:00:00Z');
t('shipped, and no change for four weeks: ready', verdict({ shipped: 'v14.3.0', since: '2026-11-03T00:00:00Z' }, now).ready);
t('a change 27 days ago: not yet', !verdict({ shipped: 'v14.3.0', since: '2026-11-04T00:00:00Z' }, now).ready);
t('never released: not ready, whatever its age', verdict({ shipped: undefined, since: '2026-01-01T00:00:00Z' }, now).why === 'not in a release yet');

done(report('Leaving beta', R));

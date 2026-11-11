// tools/test/run.mjs's options, before any test runs: --help prints them, and an unknown or mistyped option, or one
// missing its value, stops it with exit 2 (GR275), instead of a whole suite that ignored it. Only --help and --list run.
//   node tools/test/run-options.mjs
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { HERE, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const run = (...a) => spawnSync(process.execPath, [path.join(HERE, 'run.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, CI: '' } });

const help = run('--help');
t('--help prints the options and runs nothing', help.status === 0 && help.stdout.includes('--group <name>') && help.stdout.includes('--since <ref>'), help.stderr);
for (const bad of [['--grup', 'checks'], ['--updte'], ['checks']]) {
  const r = run(...bad);
  t(`an unknown option stops it (${bad.join(' ')})`, r.status === 2 && r.stderr.includes('Unknown option'), r.stderr);
}
const empty = run('--group');
t('an option without its value stops it (--group)', empty.status === 2 && empty.stderr.includes('needs a value'), empty.stderr);
const list = run('--group', 'checks', '--list');
t('known options still work (--group checks --list)', list.status === 0 && /^checks\t/m.test(list.stdout), list.stderr);

done(report('run.mjs options', R));

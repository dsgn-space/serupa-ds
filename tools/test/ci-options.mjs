// tools/ci.mjs's options, before anything runs: --help prints the usage, a mistyped or unknown option and an option
// missing its value stop it (GR275), and so does a set of options that leaves no step (R8), instead of an hour-long
// run that ignored them or a report that says "All passed" for nothing. Only --list and --help run here.
//   node tools/test/ci-options.mjs
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const ci = (...a) => spawnSync(process.execPath, [path.join(PROJECT, 'tools', 'ci.mjs'), ...a], { cwd: PROJECT, encoding: 'utf8' });

const help = ci('--help');
t('--help prints the usage and runs nothing', help.status === 0 && help.stdout.includes('--since main') && help.stdout.includes('--report <file>'), help.stderr);
for (const bad of [['--sinse', 'main'], ['--keepgoing'], ['main']]) {
  const r = ci(...bad);
  t(`an unknown option stops it (${bad.join(' ')})`, r.status === 2 && r.stderr.includes('Unknown option'), r.stderr);
}
const empty = ci('--since');
t('an option without its value stops it (--since)', empty.status === 2 && empty.stderr.includes('needs a value'), empty.stderr);
const list = ci('--since', 'HEAD', '--list');
t('--list with known options names the steps, the changeset step among them with --since', list.status === 0 && /^changeset\t/m.test(list.stdout) && /^frameworks\t/m.test(list.stdout), list.stderr);
const names = list.stdout.split('\n').filter(Boolean).map((l) => l.split('\t')[0]);
const none = ci('--since', 'HEAD', '--skip', names.join(','));
t('options that leave no step stop it, instead of reporting "All passed"', none.status === 2 && none.stderr.includes('No steps to run'), none.stderr);
const lone = ci('--only', 'changeset');
t('the changeset step without --since stops it', lone.status === 2 && lone.stderr.includes('--since'), lone.stderr);

done(report('ci.mjs options', R));

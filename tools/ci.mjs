// Every job CI requires, on this machine, in the order CI runs them: run it before pushing, so a pull request
// doesn't go red on a check nobody ran.
//   node tools/ci.mjs                  everything, as a push to main runs it (with all four second languages)
//   node tools/ci.mjs --since main     as a pull request against main runs it: the components it changes and the ones
//                                      that use them, in English and all four second languages, plus its changeset
//   node tools/ci.mjs --keep-going     run every step even after one fails (by default the first failure stops it,
//                                      as on a pull request)
//   node tools/ci.mjs --skip <names>   leave out steps, comma-separated by the name --list prints (frameworks,consumer)
//   node tools/ci.mjs --list           the steps it would run
// CI picks one second language per commit (LOCALES in test/lib.mjs, by the commit's hash), and a pull request's merge
// commit can't be known here, so this runs all of them: a test that only passes in English fails here, not on main.
// The changeset step is the Changeset workflow's (a pull request labelled no-changeset skips it: --skip changeset).
// Not here: npm audit signatures (the registry, on CI) and CodeQL.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES } from './test/lib.mjs';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const since = arg('--since');
const skip = new Set((arg('--skip') || '').split(',').filter(Boolean));
const keepGoing = process.argv.includes('--keep-going');
/** @type {(...args: string[]) => [string, string[]]} */
const node = (...args) => [process.execPath, args];
/** @type {(script: string) => [string, string[]]} */
const npm = (script) => [process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', '--silent', script]];
/** @type {(...args: string[]) => [string, string[]]} */
const suite = (...args) => node('tools/test/run.mjs', ...args, ...(since ? ['--since', since] : []));

/** @type {(name: string, job: string, run: [string, string[]]) => { name: string, job: string, cmd: string, args: string[] }} */
const step = (name, job, [cmd, args]) => ({ name, job, cmd, args });
const all = [
  step('tokens', 'build', node('tools/tokens/build.mjs', '--check')),
  step('build', 'build', npm('build')),
  step('storybook', 'build', npm('build-storybook')),
  step('version', 'types and lint', node('tools/release.mjs', '--check')),
  step('typecheck', 'types and lint', npm('typecheck')),
  step('lint', 'types and lint', npm('lint')),
  ...(since ? [step('changeset', 'changeset', node('tools/changeset-check.mjs', since))] : []),
  step('checks', 'suite (checks)', suite('--group', 'checks')),
  step('components', 'suite (components)', suite('--group', 'components')),
  ...LOCALES.map((l) => step(`components-${l}`, `suite (components), in ${l}`, suite('--group', 'components', '--locale', l))),
  step('visual', 'suite (visual)', suite('--group', 'visual')),
  step('storybook-check', 'suite (storybook)', suite('--group', 'storybook')),
  step('consumer', 'consumer', node('tools/test/consumer.mjs')),
  step('frameworks', 'frameworks', node('tools/test/frameworks.mjs')),
];
const unknown = [...skip].filter((s) => s !== 'changeset' && !all.some((st) => st.name === s));
if (unknown.length) { console.error(`Unknown step for --skip: ${unknown.join(', ')} (see --list)`); process.exit(2); }
const steps = all.filter((st) => !skip.has(st.name));
if (process.argv.includes('--list')) { for (const { name, job, cmd, args } of steps) console.log(`${name}\t${job}\t${path.basename(cmd)} ${args.join(' ')}`); process.exit(0); }

const summary = [];
for (const { name, job, cmd, args } of steps) {
  console.log(`\n━━ ${name} (${job}) ━━`);
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: PROJECT, env: { ...process.env, SERUPA_PROJECT: PROJECT } });
  summary.push([name, job, r.status === 0, Date.now() - t0]);
  if (r.status !== 0 && !keepGoing) break;
}
console.log('\n━━ Summary ━━');
for (const [name, job, ok, ms] of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} (${job})  ${(ms / 1000).toFixed(1)}s`);
const left = steps.length - summary.length;
if (left) console.log(`Stopped after the first failure: ${left} step${left === 1 ? '' : 's'} not run (--keep-going runs them).`);
process.exit(summary.every(([, , ok]) => ok) && !left ? 0 : 1);

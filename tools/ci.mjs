// Every job CI requires, on this machine, in the order CI runs them: run it before pushing, so a pull request
// doesn't go red on a check nobody ran.
//   node tools/ci.mjs                  everything, as a push to main runs it (with one second language, as CI picks it)
//   node tools/ci.mjs --since main     as a pull request against main runs it: the components it changes and the ones
//                                      that use them, in English and one second language, plus its changeset
//   node tools/ci.mjs --all-locales    the component tests in all four second languages, not just the commit's one
//   node tools/ci.mjs --keep-going     run every step even after one fails (by default the first failure stops it,
//                                      as on a pull request)
//   node tools/ci.mjs --skip <names>   leave out steps, comma-separated by the name --list prints (frameworks,consumer)
//   node tools/ci.mjs --from <name>    start at that step, after fixing what stopped a run (a failed run prints the
//                                      command); the steps before it are taken as passed, and dist/ as built
//   node tools/ci.mjs --only <names>   just those steps, comma-separated (--keep-going's failures, run again)
//   node tools/ci.mjs --list           the steps it would run
//   node tools/ci.mjs --resume         with --report: after a run was stopped (the machine restarted) or failed on a
//                                      flake, run again with the same options plus --resume. On the same commit, from a
//                                      clean tree, the test steps the report already passed are kept, not run again; the
//                                      build steps always run. The report says which steps came from the earlier run.
//   node tools/ci.mjs --clean          start from a clean install (npm ci --ignore-scripts), as CI does
//   node tools/ci.mjs --report <file>  also write the results as Markdown (commit, Node, each step's pass or fail
//                                      with its test counts), ready to paste under "Local checks" in a pull request
// npm run check -- <options> is the same. Run it before every push (GitLab CI runs the same jobs as the merge gate):
//   npm run check -- --clean --since origin/main --report local-checks.md
// Like CI, it runs the component tests in English and in the one second language the commit's hash picks (LOCALES in
// test/lib.mjs): each pass takes about 9 minutes on 4 cores. --all-locales runs all four, for a change to locale code.
// The changeset step is the Changeset workflow's (a pull request labelled no-changeset skips it: --skip changeset).
// Not here: npm audit signatures (the registry, on CI) and CodeQL.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
import { LOCALES } from './test/lib.mjs';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
// --help prints the usage above; an option it doesn't know (a typo like --sinse) stops before anything runs, since a
// whole run takes an hour and would quietly ignore it (GR275).
const VALUED = ['--since', '--skip', '--from', '--only', '--report'];
const FLAGS = ['--all-locales', '--keep-going', '--list', '--resume', '--clean'];
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  const usage = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   ') || l.startsWith('//  ')).map((l) => l.slice(3));
  console.log(usage.join('\n'));
  process.exit(0);
}
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (VALUED.includes(a)) {
    if (process.argv[i + 1] === undefined || process.argv[i + 1].startsWith('--')) { console.error(`${a} needs a value (node tools/ci.mjs --help)`); process.exit(2); }
    i++;
  } else if (!FLAGS.includes(a)) { console.error(`Unknown option: ${a} (node tools/ci.mjs --help)`); process.exit(2); }
}
const since = arg('--since');
const skip = new Set((arg('--skip') || '').split(',').filter(Boolean));
const keepGoing = process.argv.includes('--keep-going');
const clean = process.argv.includes('--clean');
const report = arg('--report');
/** @type {(...args: string[]) => [string, string[]]} */
const node = (...args) => [process.execPath, args];
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
/** @type {(script: string) => [string, string[]]} */
const npm = (script) => [NPM, ['run', '--silent', script]];
/** @type {(...args: string[]) => [string, string[]]} */
const suite = (...args) => node('tools/test/run.mjs', ...args, ...(since ? ['--since', since] : []));

/** @type {(name: string, job: string, run: [string, string[]]) => { name: string, job: string, cmd: string, args: string[] }} */
const step = (name, job, [cmd, args]) => ({ name, job, cmd, args });
// The second language CI's run.mjs picks for this commit (the same hash rule).
function commitLocale() {
  const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: PROJECT, encoding: 'utf8' }).stdout.trim();
  return LOCALES[parseInt(sha.slice(0, 8) || '0', 16) % LOCALES.length];
}
const all = [
  ...(clean ? [step('install', 'build', [NPM, ['ci', '--ignore-scripts', '--no-audit', '--no-fund']])] : []),
  step('tokens', 'build', node('tools/tokens/build.mjs', '--check')),
  step('build', 'build', npm('build')),
  step('storybook', 'build', npm('build-storybook')),
  step('version', 'types and lint', node('tools/release.mjs', '--check')),
  step('typecheck', 'types and lint', npm('typecheck')),
  step('lint', 'types and lint', npm('lint')),
  ...(since ? [step('changeset', 'changeset', node('tools/changeset-check.mjs', since))] : []),
  step('checks', 'suite (checks)', suite('--group', 'checks')),
  step('components', 'suite (components)', suite('--group', 'components')),
  ...(process.argv.includes('--all-locales') ? LOCALES : [commitLocale()]).map((l) => step(`components-${l}`, `suite (components), in ${l}`, suite('--group', 'components', '--locale', l))),
  step('visual', 'suite (visual)', suite('--group', 'visual')),
  step('storybook-check', 'suite (storybook)', suite('--group', 'storybook')),
  step('consumer', 'consumer', node('tools/test/consumer.mjs')),
  step('frameworks', 'frameworks', node('tools/test/frameworks.mjs')),
];
const from = arg('--from');
const only = arg('--only') ? new Set(arg('--only').split(',').filter(Boolean)) : null;
const unknown = [...skip, ...(from ? [from] : []), ...(only || [])].filter((s) => s !== 'changeset' && !all.some((st) => st.name === s));
if (unknown.length) { console.error(`Unknown step: ${unknown.join(', ')} (see --list)`); process.exit(2); }
// changeset is a step only with --since: naming it without one would silently run from the top (R8).
const asked = [...(from ? [from] : []), ...(only || [])].filter((st) => st === 'changeset');
if (asked.length && !since) { console.error('The changeset step runs only with --since <base> (as CI runs it against the pull request\'s base).'); process.exit(2); }
const start = from ? Math.max(0, all.findIndex((st) => st.name === from)) : 0;
const steps = all.slice(start).filter((st) => !skip.has(st.name) && (!only || only.has(st.name)));
// Nothing to run is not a pass: an empty summary would say "All passed" (R8).
if (!steps.length && !process.argv.includes('--list')) { console.error('No steps to run: --skip, --only and --from left none (see --list).'); process.exit(2); }
if (process.argv.includes('--list')) { for (const { name, job, cmd, args } of steps) console.log(`${name}\t${job}\t${path.basename(cmd)} ${args.join(' ')}`); process.exit(0); }

// The Node the repo asks for (devEngines in package.json): an older one fails npm ci and some steps in ways that
// don't say why, so say it up front.
const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
const wantNode = Number(/(\d+)/.exec(pkg.devEngines?.runtime?.version || '')?.[1] || 0);
if (Number(process.versions.node.split('.')[0]) < wantNode) {
  console.error(`This repo needs Node ${wantNode} or newer (devEngines in package.json), but this is Node ${process.versions.node}. node tools/setup.mjs fetches it.`);
  process.exit(2);
}

const git = (...a) => spawnSync('git', a, { cwd: PROJECT, encoding: 'utf8' }).stdout.trim();
const commit = git('rev-parse', 'HEAD');
// Results stand for a commit only when nothing else is in the tree; a report says so when something is.
const dirty = git('status', '--porcelain', '--untracked-files=no');

// What a step's output says it ran: vitest's "Tests" lines and the PASS/FAIL lines of tools/test/run.mjs's summary.
/** @type {(lines: string[]) => string} */
function counts(lines) {
  const tests = lines.map((l) => /^\s*Tests\s+(.+)$/.exec(l)?.[1]).filter(Boolean)
    .map((t) => String(t).replace(/\s*\(\d+\)\s*$/, '').replace(/\s+\|\s+/g, ', ')).filter((t) => /\d/.test(t));
  const parts = lines.filter((l) => /^(PASS|FAIL) {2}/.test(l));
  const failed = parts.filter((l) => l.startsWith('FAIL')).length;
  return [
    tests.length ? `tests: ${tests.join('; ')}` : '',
    parts.length ? `${parts.length - failed}/${parts.length} parts passed` : '',
  ].filter(Boolean).join(', ');
}
/** @type {(cmd: string, args: string[]) => Promise<{ status: number, lines: string[] }>} */
function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['inherit', 'pipe', 'pipe'], cwd: PROJECT, env: { ...process.env, SERUPA_PROJECT: PROJECT, ...(process.stdout.isTTY && !('FORCE_COLOR' in process.env) ? { FORCE_COLOR: '1' } : {}) } });
    const lines = [];
    let rest = '';
    /** @type {(out: NodeJS.WriteStream) => (chunk: Buffer) => void} */
    const tee = (out) => (chunk) => {
      out.write(chunk);
      const text = rest + stripVTControlCharacters(chunk.toString('utf8'));
      const all = text.split(/\r?\n/);
      rest = all.pop() || '';
      for (const l of all) if (/^\s*Tests\s|^(PASS|FAIL) {2}/.test(l)) lines.push(l);
    };
    child.stdout.on('data', tee(process.stdout));
    child.stderr.on('data', tee(process.stderr));
    child.on('close', (code) => resolve({ status: code ?? 1, lines }));
    child.on('error', () => resolve({ status: 1, lines }));
  });
}

// --resume: the passing test steps of the report's earlier run on this same commit, by name.
/** @type {Map<string, [string, string, boolean, number, string]>} */
const earlier = new Map();
if (process.argv.includes('--resume') && report && fs.existsSync(path.resolve(report)) && !dirty) {
  const old = fs.readFileSync(path.resolve(report), 'utf8');
  const head = /\*\*(?:All passed|FAILED|Running)\*\* on `([0-9a-f]{7,})`/.exec(old);
  const sameRun = /^Command: `(.*)`$/m.exec(old)?.[1].replace(/\s--resume\b/g, '') === `node tools/ci.mjs ${process.argv.slice(2).join(' ')}`.replace(/\s--resume\b/g, '');
  if (head && commit.startsWith(head[1]) && !/uncommitted changes/.test(old) && sameRun) {
    for (const m of old.matchAll(/^\| ([\w-]+) \| ([^|]+?) \| PASS \| (\d+)s \| ([^|]*?) \|$/gm)) earlier.set(m[1], [m[1], m[2], true, Number(m[3]) * 1000, m[4]]);
  }
  console.log(earlier.size ? `Resuming: ${[...earlier.keys()].filter((n) => all.find((st) => st.name === n)?.job !== 'build').join(', ')} passed earlier on this commit.` : 'Nothing to resume: the report is for another commit, another command or a changed tree.');
}
const kept = [];
/** @type {[string, string, boolean, number, string][]} */
const summary = [];
// The report, rewritten after every step while the run goes on ("Running", which the gate doesn't take), so a run the
// machine stopped halfway leaves the steps it finished for --resume.
/** @type {(running: boolean) => void} */
function writeReport(running) {
  if (!report) return;
  const left = steps.length - summary.length;
  const passed = summary.every(([, , ok]) => ok) && !left;
  const skipped = all.filter((st) => !steps.includes(st)).map((st) => st.name);
  const md = [
    '## Local checks',
    '',
    `**${running ? 'Running' : passed ? 'All passed' : 'FAILED'}** on \`${commit.slice(0, 9)}\`${dirty ? ' **with uncommitted changes** (these results don\'t stand for the commit)' : ''}, `
      + `Node ${process.versions.node}, ${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}.`,
    '',
    `Command: \`node tools/ci.mjs ${process.argv.slice(2).join(' ')}\``,
    '',
    '| Step | Job | Result | Time | What ran |',
    '| --- | --- | --- | --- | --- |',
    ...summary.map(([name, job, ok, ms, detail]) => `| ${name} | ${job} | ${ok ? 'PASS' : '**FAIL**'} | ${(ms / 1000).toFixed(0)}s | ${detail || ''} |`),
    ...(left ? [`| ${left} more | | not run | | ${running ? 'still to run' : 'stopped after the first failure'} |`] : []),
    ...(skipped.length ? ['', `Left out: ${skipped.join(', ')}.`] : []),
    ...(kept.length ? ['', `Resumed: ${kept.join(', ')} passed in the earlier run on this commit and weren't run again.`] : []),
    '',
  ].join('\n');
  fs.writeFileSync(path.resolve(report), md);
}
for (const { name, job, cmd, args } of steps) {
  if (job !== 'build' && earlier.has(name)) { summary.push(/** @type {[string, string, boolean, number, string]} */ (earlier.get(name))); kept.push(name); continue; }
  console.log(`\n━━ ${name} (${job}) ━━`);
  const t0 = Date.now();
  const r = await run(cmd, args);
  summary.push([name, job, r.status === 0, Date.now() - t0, counts(r.lines)]);
  writeReport(true);
  if (r.status !== 0 && !keepGoing) break;
}
console.log('\n━━ Summary ━━');
for (const [name, job, ok, ms, detail] of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} (${job})  ${(ms / 1000).toFixed(1)}s${detail ? `  ${detail}` : ''}`);
const left = steps.length - summary.length;
if (left) console.log(`Stopped after the first failure: ${left} step${left === 1 ? '' : 's'} not run (--keep-going runs them).`);
if (report) { writeReport(false); console.log(`Report: ${report}`); }
// The command that picks up where this run failed, with the same options: from the step that stopped it, or, after
// --keep-going, just the steps that failed.
const failed = summary.filter(([, , ok]) => !ok).map(([name]) => name);
if (failed.length) {
  const keep = [];
  for (let i = 2; i < process.argv.length; i++) {
    if (['--from', '--only'].includes(process.argv[i])) { i++; continue; }
    if (process.argv[i] === '--resume') continue;
    keep.push(process.argv[i]);
  }
  const again = left ? ['--from', failed[0]] : ['--only', failed.join(',')];
  console.log(`After the fix: node tools/ci.mjs ${[...keep.filter((a) => !(left && a === '--keep-going')), ...again].join(' ')}`);
}
process.exit(summary.every(([, , ok]) => ok) && !left ? 0 : 1);

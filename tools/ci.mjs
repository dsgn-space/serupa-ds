// Every job CI requires, on this machine, in the order CI runs them: run it before pushing, so a pull request
// doesn't go red on a check nobody ran.
//   node tools/ci.mjs                  everything, as a push to main runs it (with all four second languages)
//   node tools/ci.mjs --since main     as a pull request against main runs it: the components it changes and the ones
//                                      that use them, in English and all four second languages, plus its changeset
//   node tools/ci.mjs --keep-going     run every step even after one fails (by default the first failure stops it,
//                                      as on a pull request)
//   node tools/ci.mjs --skip <names>   leave out steps, comma-separated by the name --list prints (frameworks,consumer)
//   node tools/ci.mjs --from <name>    start at that step, after fixing what stopped a run (a failed run prints the
//                                      command); the steps before it are taken as passed, and dist/ as built
//   node tools/ci.mjs --only <names>   just those steps, comma-separated (--keep-going's failures, run again)
//   node tools/ci.mjs --list           the steps it would run
//   node tools/ci.mjs --clean          start from a clean install (npm ci --ignore-scripts), as CI does
//   node tools/ci.mjs --report <file>  also write the results as Markdown (commit, Node, each step's pass or fail
//                                      with its test counts), ready to paste under "Local checks" in a merge request
// npm run check -- <options> is the same. While the repo has no CI (the GitLab interim), this run is the merge gate:
//   npm run check -- --clean --since origin/main --report local-checks.md
// CI picks one second language per commit (LOCALES in test/lib.mjs, by the commit's hash), and a pull request's merge
// commit can't be known here, so this runs all of them: a test that only passes in English fails here, not on main.
// The changeset step is the Changeset workflow's (a pull request labelled no-changeset skips it: --skip changeset).
// Not here: npm audit signatures (the registry, on CI) and CodeQL.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES } from './test/lib.mjs';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
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
  ...LOCALES.map((l) => step(`components-${l}`, `suite (components), in ${l}`, suite('--group', 'components', '--locale', l))),
  step('visual', 'suite (visual)', suite('--group', 'visual')),
  step('storybook-check', 'suite (storybook)', suite('--group', 'storybook')),
  step('consumer', 'consumer', node('tools/test/consumer.mjs')),
  step('frameworks', 'frameworks', node('tools/test/frameworks.mjs')),
];
const from = arg('--from');
const only = arg('--only') ? new Set(arg('--only').split(',').filter(Boolean)) : null;
const unknown = [...skip, ...(from ? [from] : []), ...(only || [])].filter((s) => s !== 'changeset' && !all.some((st) => st.name === s));
if (unknown.length) { console.error(`Unknown step: ${unknown.join(', ')} (see --list)`); process.exit(2); }
const start = from ? Math.max(0, all.findIndex((st) => st.name === from)) : 0;
const steps = all.slice(start).filter((st) => !skip.has(st.name) && (!only || only.has(st.name)));
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
const ANSI = /\x1b\[[0-9;]*m/g;
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
    const child = spawn(cmd, args, { stdio: ['inherit', 'pipe', 'pipe'], cwd: PROJECT, env: { ...process.env, SERUPA_PROJECT: PROJECT, FORCE_COLOR: process.env.FORCE_COLOR ?? (process.stdout.isTTY ? '1' : '0') } });
    const lines = [];
    let rest = '';
    /** @type {(out: NodeJS.WriteStream) => (chunk: Buffer) => void} */
    const tee = (out) => (chunk) => {
      out.write(chunk);
      const text = rest + chunk.toString('utf8').replace(ANSI, '');
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

const summary = [];
for (const { name, job, cmd, args } of steps) {
  console.log(`\n━━ ${name} (${job}) ━━`);
  const t0 = Date.now();
  const r = await run(cmd, args);
  summary.push([name, job, r.status === 0, Date.now() - t0, counts(r.lines)]);
  if (r.status !== 0 && !keepGoing) break;
}
console.log('\n━━ Summary ━━');
for (const [name, job, ok, ms, detail] of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} (${job})  ${(ms / 1000).toFixed(1)}s${detail ? `  ${detail}` : ''}`);
const left = steps.length - summary.length;
if (left) console.log(`Stopped after the first failure: ${left} step${left === 1 ? '' : 's'} not run (--keep-going runs them).`);
if (report) {
  const passed = summary.every(([, , ok]) => ok) && !left;
  const skipped = all.filter((st) => !steps.includes(st)).map((st) => st.name);
  const md = [
    '## Local checks',
    '',
    `**${passed ? 'All passed' : 'FAILED'}** on \`${commit.slice(0, 9)}\`${dirty ? ' **with uncommitted changes** (these results don\'t stand for the commit)' : ''}, `
      + `Node ${process.versions.node}, ${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}.`,
    '',
    `Command: \`node tools/ci.mjs ${process.argv.slice(2).join(' ')}\``,
    '',
    '| Step | Job | Result | Time | What ran |',
    '| --- | --- | --- | --- | --- |',
    ...summary.map(([name, job, ok, ms, detail]) => `| ${name} | ${job} | ${ok ? 'PASS' : '**FAIL**'} | ${(ms / 1000).toFixed(0)}s | ${detail || ''} |`),
    ...(left ? [`| ${left} more | | not run | | stopped after the first failure |`] : []),
    ...(skipped.length ? ['', `Left out: ${skipped.join(', ')}.`] : []),
    '',
  ].join('\n');
  fs.writeFileSync(path.resolve(report), md);
  console.log(`Report: ${report}`);
}
// The command that picks up where this run failed, with the same options: from the step that stopped it, or, after
// --keep-going, just the steps that failed.
const failed = summary.filter(([, , ok]) => !ok).map(([name]) => name);
if (failed.length) {
  const keep = [];
  for (let i = 2; i < process.argv.length; i++) {
    if (['--from', '--only'].includes(process.argv[i])) { i++; continue; }
    keep.push(process.argv[i]);
  }
  const again = left ? ['--from', failed[0]] : ['--only', failed.join(',')];
  console.log(`After the fix: node tools/ci.mjs ${[...keep.filter((a) => !(left && a === '--keep-going')), ...again].join(' ')}`);
}
process.exit(summary.every(([, , ok]) => ok) && !left ? 0 : 1);

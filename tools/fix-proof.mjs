// A fix proves its test: for a pull request with a patch changeset that changes src/, the test files it changes
// must fail on the base commit's src/. A test that passes without the fix proves nothing about it.
//   node tools/fix-proof.mjs <base commit> [--needed]
// Copies the pull request's changed and new *.test.tsx files into a worktree of the base commit and runs them there
// with Vitest's components project. Passes when at least one of them fails there, and when the pull request isn't
// a patch to src/. Fails when it is one and changes no test, or when every changed test passes on the base.
// A fix only the screenshots can show has no unit test to fail: label the pull request "no-repro-test" and the
// workflow skips this step. --needed only says whether the pull request is a fix ("needed=true" or "needed=false",
// added to $GITHUB_OUTPUT on CI), so the workflow installs the browser only when there is something to prove.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { parseChangeset } from './changesets.mjs';

const P = path.resolve(import.meta.dirname, '..');
if (!process.argv[2]) { console.error('Usage: node tools/fix-proof.mjs <base commit>'); process.exit(2); }
const git = (...a) => execFileSync('git', a, { cwd: P, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const base = git('rev-parse', process.argv[2]).trim();

const changed = git('diff', '--name-status', '--no-renames', `${base}...HEAD`).trim().split('\n').filter(Boolean).map((l) => l.split('\t'));
const src = changed.filter(([s, f]) => s !== 'D' && /^src\//.test(f) && !/\.(test|stories)\.tsx?$/.test(f) && !/\.mdx?$/.test(f)).map(([, f]) => f);
const bumps = changed.filter(([s, f]) => s !== 'D' && /^\.changeset\/[^/]+\.md$/.test(f) && f !== '.changeset/README.md')
  .map(([, f]) => parseChangeset(fs.readFileSync(path.join(P, f), 'utf8'), 'serupa-ds').bump);
const fix = src.length > 0 && bumps.includes('patch') && !bumps.some((b) => b === 'minor' || b === 'major');
if (process.argv.includes('--needed')) {
  console.log(`needed=${fix}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `needed=${fix}\n`);
  process.exit(0);
}
if (!fix) {
  console.log('Not a fix (a patch changeset that changes src/): nothing to prove.');
  process.exit(0);
}
const tests = changed.filter(([s, f]) => s !== 'D' && /^src\/.*\.test\.tsx?$/.test(f)).map(([, f]) => f);
if (!tests.length) {
  console.error(`This patch changes ${src.join(', ')} but no test. Add a test that fails without the fix, or label the`
    + ' pull request "no-repro-test" when only the screenshots can show it.');
  process.exit(1);
}

// The base commit's src/, with this pull request's tests in it.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-proof-'));
git('worktree', 'add', '--detach', dir, base);
try {
  fs.symlinkSync(path.join(P, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
  for (const f of tests) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.copyFileSync(path.join(P, f), path.join(dir, f)); }
  const run = spawnSync(process.execPath, [path.join(P, 'node_modules', 'vitest', 'vitest.mjs'), 'run', '--project', 'components', ...tests],
    { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CI: '1' } });
  const out = run.stdout + run.stderr;
  // Vitest that never got to run the tests (a config or install problem) proves nothing either way.
  if (!/Test Files\s/.test(out)) { console.error(`Vitest didn't run the tests on ${base.slice(0, 8)}:\n${out.slice(-3000)}`); process.exit(2); }
  if (run.status === 0) {
    console.error(`Every changed test passes on ${base.slice(0, 8)} without the fix, so none of them shows the bug:\n  ${tests.join('\n  ')}\n`
      + 'Add a test that fails there (the bug as a user meets it), or label the pull request "no-repro-test" when only the screenshots can show it.');
    process.exit(1);
  }
  const failed = [...new Set([...out.matchAll(/(?:FAIL|×)\s+(?:\|[^|]*\|\s+)?(src\/\S+\.test\.tsx?)/g)].map((m) => m[1]))];
  console.log(`The fix proves its test: ${failed.length ? failed.join(', ') : 'the changed tests'} fail${failed.length === 1 ? 's' : ''} on ${base.slice(0, 8)} without it.`);
} finally {
  git('worktree', 'remove', '--force', dir);
}

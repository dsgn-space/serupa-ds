// Every function a pull request adds to src/ is run by the tests: the coverage job's check on a pull request, so a
// change can't take main under the function floor in vitest.config.ts after it merges.
//   node tools/coverage-new-functions.mjs <base commit> [coverage/coverage-final.json]
// Reads the merged coverage report the coverage job writes (Vitest's json reporter) and the lines the pull request
// adds (git diff <base>...HEAD). A function whose first line is an added line in a file under src/ and that no test
// ran fails the check, named with its file and line. Functions the pull request doesn't add are left to the floors
// on main's full run: a narrowed run tests only the changed components and the ones that use them, so what it leaves
// unrun elsewhere says nothing.
// Kept outside tools/test/ so the checks project doesn't run it as a check; tools/test/coverage-new-functions.mjs tests it.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The lines each file gains, from `git diff --unified=0` output.
 * @param {string} diff
 * @returns {Map<string, Set<number>>}
 */
export function addedLines(diff) {
  const out = new Map();
  let file = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) { file = line === '+++ /dev/null' ? null : line.slice(6); if (file) out.set(file, new Set()); continue; }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk && file) {
      const start = Number(hunk[1]), count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      for (let i = 0; i < count; i++) out.get(file)?.add(start + i);
    }
  }
  return out;
}

/**
 * The added functions no test ran.
 * @param {Record<string, {fnMap: Record<string, {name: string, loc: {start: {line: number}}}>, f: Record<string, number>}>} report Istanbul's coverage-final.json
 * @param {Map<string, Set<number>>} added the lines each file gains, by path from the project folder
 * @param {string} root the folder the report's paths start with
 * @returns {{file: string, line: number, name: string}[]}
 */
export function unrunAdded(report, added, root) {
  const out = [];
  for (const [abs, cov] of Object.entries(report)) {
    const file = path.relative(root, abs).split(path.sep).join('/');
    const lines = added.get(file);
    if (!lines) continue;
    for (const [id, fn] of Object.entries(cov.fnMap)) {
      if (lines.has(fn.loc.start.line) && !cov.f[id]) out.push({ file, line: fn.loc.start.line, name: fn.name || '(anonymous)' });
    }
  }
  return out.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [base, reportFile = path.join(PROJECT, 'coverage', 'coverage-final.json')] = process.argv.slice(2);
  if (!base || base.startsWith('-')) { console.error('usage: node tools/coverage-new-functions.mjs <base commit> [coverage/coverage-final.json]'); process.exit(2); }
  if (!fs.existsSync(reportFile)) { console.error(`No coverage report at ${path.relative(PROJECT, reportFile)}: run the component tests with coverage first.`); process.exit(2); }
  const diff = execFileSync('git', ['diff', '--unified=0', '--no-renames', '--no-color', `${base}...HEAD`, '--', 'src/'], { cwd: PROJECT, encoding: 'utf8', maxBuffer: 1 << 28 });
  const added = addedLines(diff);
  const unrun = unrunAdded(JSON.parse(fs.readFileSync(reportFile, 'utf8')), added, PROJECT);
  const files = [...added.values()].filter((s) => s.size).length;
  if (!unrun.length) { console.log(`Every function this pull request adds to src/ runs in the tests (${files} changed file${files === 1 ? '' : 's'}).`); process.exit(0); }
  console.log(`${unrun.length} function${unrun.length === 1 ? '' : 's'} this pull request adds ${unrun.length === 1 ? 'runs' : 'run'} in no test, which would take main's function coverage down (the floor in vitest.config.ts):`);
  for (const u of unrun) console.log(`  ${u.file}:${u.line}  ${u.name}`);
  console.log('Add a test in the component\'s own test file that makes each one run, or remove the ones nothing calls (an empty default handler, a placeholder).');
  process.exit(1);
}

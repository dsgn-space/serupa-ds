// The coverage job's check on a pull request (tools/coverage-new-functions.mjs): every function the pull request
// adds to src/ runs in a test. Reads the added lines from a diff, finds the added functions no test ran in a coverage
// report, and leaves alone the functions the pull request doesn't add; the coverage job runs it on pull requests.
//   node tools/test/coverage-new-functions.mjs
import fs from 'node:fs';
import path from 'node:path';
import { addedLines, unrunAdded } from '../coverage-new-functions.mjs';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

const diff = [
  'diff --git a/src/components/A/A.tsx b/src/components/A/A.tsx',
  '--- a/src/components/A/A.tsx',
  '+++ b/src/components/A/A.tsx',
  '@@ -10,0 +11,3 @@ export function A() {',
  '+  const onOpen = () => open();',
  '+  const onClose = () => close();',
  '+  const noop = () => {};',
  '@@ -40 +43 @@',
  '+  return <div onClick={onOpen} />;',
  'diff --git a/src/components/B/B.tsx b/src/components/B/B.tsx',
  'new file mode 100644',
  '--- /dev/null',
  '+++ b/src/components/B/B.tsx',
  '@@ -0,0 +1,2 @@',
  '+export const B = () => null;',
  '+export const unused = () => 1;',
  'diff --git a/src/components/C/C.tsx b/src/components/C/C.tsx',
  'deleted file mode 100644',
  '--- a/src/components/C/C.tsx',
  '+++ /dev/null',
  '@@ -1,2 +0,0 @@',
  '-export const C = () => null;',
].join('\n');
const added = addedLines(diff);
t('reads the lines each file gains, a one-line hunk and a new file included, and no deleted file',
  JSON.stringify([...added].map(([f, s]) => [f, [...s]])) === JSON.stringify([['src/components/A/A.tsx', [11, 12, 13, 43]], ['src/components/B/B.tsx', [1, 2]]]),
  JSON.stringify([...added].map(([f, s]) => [f, [...s]])));

const root = '/builds/serupa';
const fn = (name, line) => ({ name, loc: { start: { line, column: 2 }, end: { line, column: 30 } } });
const cov = {
  [`${root}/src/components/A/A.tsx`]: { fnMap: { 0: fn('A', 5), 1: fn('onOpen', 11), 2: fn('onClose', 12), 3: fn('', 13), 4: fn('old', 30) }, f: { 0: 4, 1: 2, 2: 0, 3: 0, 4: 0 } },
  [`${root}/src/components/B/B.tsx`]: { fnMap: { 0: fn('B', 1), 1: fn('unused', 2) }, f: { 0: 1, 1: 0 } },
  [`${root}/src/components/D/D.tsx`]: { fnMap: { 0: fn('D', 11) }, f: { 0: 0 } },
};
const unrun = unrunAdded(cov, added, root);
t('names each added function no test ran, with its file and line',
  JSON.stringify(unrun) === JSON.stringify([
    { file: 'src/components/A/A.tsx', line: 12, name: 'onClose' },
    { file: 'src/components/A/A.tsx', line: 13, name: '(anonymous)' },
    { file: 'src/components/B/B.tsx', line: 2, name: 'unused' },
  ]), JSON.stringify(unrun));
t('leaves alone a function the pull request doesn\'t add, and a file it doesn\'t change', !unrun.some((u) => u.name === 'old' || u.file.includes('/D/')));
t('passes when every added function ran', unrunAdded({ [`${root}/src/components/B/B.tsx`]: { fnMap: { 0: fn('B', 1), 1: fn('unused', 2) }, f: { 0: 1, 1: 3 } } }, added, root).length === 0);

// Wired: the coverage job runs on pull requests and runs the check there, with the floors off on a narrowed run.
const ci = fs.readFileSync(path.join(PROJECT, '.github', 'workflows', 'ci.yml'), 'utf8');
const job = /^ {2}coverage:\n([\s\S]*?)\n(?= {2}\S)/m.exec(ci)?.[1] ?? '';
t('the coverage job checks the added functions against the pull request\'s base, with the floors off on a narrowed run',
  job.includes('node tools/coverage-new-functions.mjs "$SINCE"') && job.includes('SINCE: ${{ needs.plan.outputs.since }}') && job.includes('SERUPA_NO_FLOORS=1'), job.slice(0, 600));
const config = fs.readFileSync(path.join(PROJECT, 'vitest.config.ts'), 'utf8');
t('the merged report includes coverage-final.json, and the floors can be set aside for a narrowed run', /reporter: \[[^\]]*'json'[^\]]*\]/.test(config) && config.includes('SERUPA_NO_FLOORS'));
done(report('Added functions run in a test', R));

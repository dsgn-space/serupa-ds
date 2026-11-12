// Index reads that may be undefined. With noUncheckedIndexedAccess, `list[i]` and `record[key]` are typed
// `T | undefined`, so a read past the end, or of a key a prop no longer has, has to be handled where it happens.
// The shipped code (src/, not tests or stories) is compiled with the setting on, and each file's count of such reads
// is held to a baseline that only goes down: a file that gains one fails (handle the undefined, or show TypeScript why
// it can't be), and a file that loses some fails until its line follows, so they can't come back. Once every count
// is 0, the setting moves into tsconfig.json and this check goes.
//   node tools/test/unchecked-index.mjs            check
//   node tools/test/unchecked-index.mjs --update   write today's counts as the baseline (only after fixing reads)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, done, report } from './lib.mjs';

const BASELINE = path.join(PROJECT, 'tools/test/baseline-unchecked-index.json');
const tsc = path.join(PROJECT, 'node_modules', 'typescript', 'bin', 'tsc');
const dir = fs.mkdtempSync(path.join(PROJECT, '.test-tmp-unchecked-'));
const found = {};
let out = '', status = null;
try {
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({
    extends: path.join(PROJECT, 'tsconfig.json'),
    compilerOptions: { noUncheckedIndexedAccess: true, types: ['node'] },
    include: [path.join(PROJECT, 'src')],
    exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'].map((g) => path.join(PROJECT, 'src', g)),
  }));
  const run = spawnSync(process.execPath, [tsc, '-p', dir, '--pretty', 'false'], { cwd: PROJECT, encoding: 'utf8' });
  out = run.stdout + run.stderr;
  status = run.status;
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
const other = [];
for (const line of out.split('\n')) {
  const m = /^(src\/[^(]+)\(\d+,\d+\): error (TS\d+)/.exec(line);
  // A name or module tsc can't find means the compile itself is set up wrong, not a read to count.
  if (!m || /^TS(2304|2307|2580|2591)$/.test(m[2])) { if (/error TS/.test(line)) other.push(line); continue; }
  found[m[1]] = (found[m[1]] || 0) + 1;
}
if (process.argv.includes('--update')) {
  const sorted = Object.fromEntries(Object.entries(found).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(BASELINE, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`Wrote ${Object.values(found).reduce((a, b) => a + b, 0)} reads in ${Object.keys(found).length} files to ${path.relative(PROJECT, BASELINE)}`);
  process.exit(0);
}
const known = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const total = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const R = [{
  name: `src/ compiled with noUncheckedIndexedAccess (${total(found)} unchecked index reads in ${Object.keys(found).length} files)`,
  ok: (status === 0 || Object.keys(found).length > 0) && !other.length,
  detail: other.length ? `tsc reported errors outside src/: ${other.slice(0, 3).join(' | ')}` : `tsc exited ${status} with nothing about src/: ${out.trim().split('\n').slice(0, 5).join(' | ')}`,
}];
for (const f of [...new Set([...Object.keys(known), ...Object.keys(found)])].sort()) {
  const now = found[f] || 0, was = known[f] || 0;
  R.push({
    name: `${f}: ${now} unchecked index ${now === 1 ? 'read' : 'reads'}, as known`,
    ok: now === was,
    detail: now > was
      ? `${now - was} new: compile with \`npx tsc -p . --noUncheckedIndexedAccess\` (tests and stories aside) to see where, and handle the undefined (a guard, a default, or a loop TypeScript can follow)`
      : `${was - now} fixed, well done: run node tools/test/unchecked-index.mjs --update so they can't come back`,
  });
}
done(report('Unchecked index reads', R));

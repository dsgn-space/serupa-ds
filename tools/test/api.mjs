// Public API: the types the package exports (dist/index.d.ts), compared with the saved baseline-api.d.ts, so a
// change to what projects can import or pass is never an accident. Build first (npm run build).
//   node tools/test/api.mjs            check
//   node tools/test/api.mjs --update   accept the current API as the new baseline (and add a changeset)
// Comments are left out, so editing a prop's description changes nothing here. A removed export is breaking
// (major); a new one is minor; any other change needs a look: narrowing a type breaks projects, widening doesn't.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { HERE, read, report } from './lib.mjs';

const BASE = path.join(HERE, 'baseline-api.d.ts');
const update = process.argv.includes('--update');

// The declarations as TypeScript prints them without comments: one stable text per release.
const src = ts.createSourceFile('index.d.ts', read('dist/index.d.ts'), ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
const now = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed }).printFile(src);

if (update || !fs.existsSync(BASE)) {
  fs.writeFileSync(BASE, now);
  console.log(`API baseline saved: ${path.relative(process.cwd(), BASE)}`);
  process.exit(0);
}
const base = fs.readFileSync(BASE, 'utf8');
// The names in the export { … } and export type { … } lists.
const names = (text) => new Set([...text.matchAll(/^export (?:type )?\{([^}]*)\}/gm)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop())).filter(Boolean));
const [was, is] = [names(base), names(now)];
const removed = [...was].filter((n) => !is.has(n)), added = [...is].filter((n) => !was.has(n));
// The declarations that differ, by the line they start on, for a short pointer to what changed.
const lines = (text) => new Set(text.split('\n'));
const [a, b] = [lines(base), lines(now)];
const changed = [...b].filter((l) => !a.has(l) && !/^export (type )?\{/.test(l)).slice(0, 8);

const fix = 'if intended, run node tools/test/api.mjs --update and add a changeset';
const R = [
  { name: 'no export was removed (that would be a breaking change: major)', ok: !removed.length, detail: `removed: ${removed.join(', ')}; ${fix}` },
  { name: 'no export was added without updating the baseline (minor)', ok: !added.length, detail: `added: ${added.join(', ')}; ${fix}` },
  { name: 'the exported types match baseline-api.d.ts', ok: base === now, detail: `${changed.length ? `changed lines (first ${changed.length}):\n        ${changed.map((l) => l.trim().slice(0, 160)).join('\n        ')}` : 'only the export lists differ'}\n      ${fix}` },
];
process.exit(report('Public API', R) ? 0 : 1);

// Optional props that take undefined (EO1). A project with exactOptionalPropertyTypes on (a strict tsconfig) can't
// pass undefined to an optional prop typed `size?: ButtonSize`, so `<Button disabled={busy || undefined}>` or passing
// through a prop it was given (`size={props.size}`) fails to compile there; `size?: ButtonSize | undefined` takes it,
// as React's own DOM props do. This compiles a probe against the built types with that setting and lists, for each
// component, the optional props that reject undefined. The list only goes down: a new prop needs `| undefined`, and a
// component whose props were fixed fails until its line follows. Build first.
//   node tools/test/optional-undefined.mjs            check
//   node tools/test/optional-undefined.mjs --update   write today's list as the baseline (only after fixing props)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, done, report } from './lib.mjs';

const BASELINE = path.join(PROJECT, 'tools/test/baseline-optional-undefined.json');
const tsc = path.join(PROJECT, 'node_modules', 'typescript', 'bin', 'tsc');
const built = fs.existsSync(path.join(PROJECT, 'dist', 'index.d.ts'));
const COMP = path.join(PROJECT, 'src', 'components');
// The folders whose name is an export (Toast's folder exports toast() and Toaster, not Toast).
const exported = built ? new Set(Object.keys(await import(path.join(PROJECT, 'dist', 'index.js')))) : new Set();
const names = fs.readdirSync(COMP).filter((n) => /^[A-Z]/.test(n) && fs.existsSync(path.join(COMP, n, 'index.ts')) && exported.has(n)).sort();

// The keys of P that are optional and whose type, once the optional marker is gone, doesn't include undefined. As a
// template literal type, so the error message spells the union out. ComponentProps of an overloaded component
// (Button) reads its last signature.
const probe = ['import * as React from "react";', 'import * as S from "serupa-ds";',
  'type Bad<P> = { [K in keyof P]-?: {} extends Pick<P, K> ? (undefined extends Required<P>[K] ? never : K) : never }[keyof P];',
  ...names.map((n) => `export const p_${n}: \`\${Bad<React.ComponentProps<typeof S.${n}>> & string}\` = "\\u0000";`)].join('\n') + '\n';
const found = {};
let ran = false;
let tscSaid = '';
if (built) {
  // Inside the project, so "serupa-ds" resolves to this package's own exports and React's types are found.
  const dir = fs.mkdtempSync(path.join(PROJECT, '.test-tmp-optional-'));
  try {
    fs.writeFileSync(path.join(dir, 'probe.tsx'), probe);
    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({ extends: path.join(PROJECT, 'tools/test/types/tsconfig.json'), compilerOptions: { exactOptionalPropertyTypes: true }, files: ['probe.tsx'] }));
    const run = spawnSync(process.execPath, [tsc, '-p', dir, '--noErrorTruncation', '--pretty', 'false'], { cwd: PROJECT, encoding: 'utf8' });
    const out = run.stdout + run.stderr;
    ran = /probe\.tsx\(/.test(out) || run.status === 0;
    // What tsc said instead, when it said nothing about the probe (a crash, a signal, an error in another file).
    if (!ran) tscSaid = `tsc exited ${run.status ?? run.signal}: ${out.trim().split('\n').slice(0, 8).join(' | ') || run.error?.message || 'no output'}`;
    const lines = probe.split('\n');
    for (const m of out.matchAll(/probe\.tsx\((\d+),\d+\): error TS\d+: ([^\n]*(?:\n(?!\S*probe\.tsx\()[^\n]*)*)/g)) {
      const n = /p_(\w+):/.exec(lines[Number(m[1]) - 1])?.[1];
      const target = m[2].split('to type ').pop() || '';
      // Names with hyphens too (aria-label, data-*): a name it can't read must not drop the error (GR197).
      const keys = [...target.matchAll(/"([A-Za-z][\w-]*)"/g)].map((k) => k[1]);
      // "… to type 'never'" is the probe's own error for a component with no such prop.
      if (n && !/to type 'never'\.?\s*$/.test(m[2])) found[n] = keys.length ? [...new Set([...(found[n] || []), ...keys])].sort() : [...(found[n] || []), `(unread: ${m[2].split('\n')[0].slice(0, 120)})`];
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
if (process.argv.includes('--update')) {
  fs.writeFileSync(BASELINE, JSON.stringify(found, null, 2) + '\n');
  console.log(`Wrote ${Object.values(found).flat().length} props in ${Object.keys(found).length} components to ${path.relative(PROJECT, BASELINE)}`);
  process.exit(0);
}
const known = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const count = (o) => Object.values(o).flat().length;
const R = [{ name: `the probe compiled against the built types (${names.length} components, ${count(found)} props that reject undefined)`, ok: built && ran, detail: built ? `tsc printed nothing about the probe (${tscSaid})` : 'dist/index.d.ts is missing: npm run build first' }];
for (const n of [...new Set([...Object.keys(known), ...Object.keys(found)])].sort()) {
  const now = found[n] || [], was = known[n] || [];
  const added = now.filter((k) => !was.includes(k)), fixed = was.filter((k) => !now.includes(k));
  R.push({
    name: `${n}: ${now.length} optional ${now.length === 1 ? 'prop rejects' : 'props reject'} undefined, as known`,
    ok: !added.length && !fixed.length,
    detail: added.length
      ? `new: ${added.join(', ')}. Type it \`${added[0]}?: T | undefined\`, so a project with exactOptionalPropertyTypes can pass undefined`
      : `fixed: ${fixed.join(', ')}, well done: run node tools/test/optional-undefined.mjs --update so they can't come back`,
  });
}
done(report('Optional props take undefined', R));

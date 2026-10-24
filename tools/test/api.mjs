// Public API: the types the package exports (dist/index.d.ts), compared with the saved baseline-api/, so a
// change to what projects can import or pass is never an accident. Build first (npm run build).
// The baseline is one file per component (baseline-api/<Name>.d.ts: what its folder declares, and the names it
// exports), plus _core.d.ts for the rest, so two pull requests that change different components never touch the same
// file.
//   node tools/test/api.mjs            check
//   node tools/test/api.mjs --update   accept the current API as the new baseline (and add a changeset)
// Comments are left out, so editing a prop's description changes nothing here. A removed export is breaking
// (major); a new one is minor; any other change needs a look: narrowing a type breaks projects, widening doesn't.
import fs from 'node:fs';
import path from 'node:path';
// TypeScript 7 has no compiler API yet, so this reads the types with TypeScript 6's (see tools/typescript/api.mjs).
import ts from '@typescript/typescript6';
import { HERE, PROJECT, read, report, done } from './lib.mjs';

const BASE = path.join(HERE, 'baseline-api');
const update = process.argv.includes('--update');

// The declarations as TypeScript prints them without comments: one stable text per release.
const src = ts.createSourceFile('index.d.ts', read('dist/index.d.ts'), ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
// A union's members come out in the order the compiler met them, which can change from one build to the next
// (HTMLButtonElement | HTMLAnchorElement, then the other way round): sorted, the same API prints the same.
const text = (n) => printer.printNode(ts.EmitHint.Unspecified, n, src);
const sortUnions = (ctx) => (root) => {
  const visit = (n) => {
    n = ts.visitEachChild(n, visit, ctx);
    if (!ts.isUnionTypeNode(n)) return n;
    const types = [...n.types].sort((x, y) => text(x).localeCompare(text(y), 'en'));
    return ctx.factory.updateUnionTypeNode(n, ctx.factory.createNodeArray(types));
  };
  return ts.visitNode(root, visit);
};
const file = ts.transform(src, [sortUnions]).transformed[0];

// Which component folder declares each name. A name declared in more than one folder (or none) belongs to _core.
const COMP = path.join(PROJECT, 'src', 'components');
const declaredIn = new Map();
for (const c of fs.readdirSync(COMP).filter((n) => fs.statSync(path.join(COMP, n)).isDirectory())) {
  for (const f of fs.readdirSync(path.join(COMP, c)).filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f))) {
    for (const m of fs.readFileSync(path.join(COMP, c, f), 'utf8').matchAll(/^(?:export )?(?:declare )?(?:interface|type|function|const|class|enum) (\w+)/gm)) {
      declaredIn.set(m[1], declaredIn.has(m[1]) && declaredIn.get(m[1]) !== c ? '_core' : c);
    }
  }
}
// The bundler renames a second declaration of a name to Name$1: it's still that name's.
const owner = (name) => declaredIn.get(name.replace(/\$\d+$/, '')) ?? '_core';
const nameOf = (st) => st.name?.text ?? (ts.isVariableStatement(st) && ts.isIdentifier(st.declarationList.declarations[0].name) ? st.declarationList.declarations[0].name.text : undefined);

// Built from the folders by tools/build/registry.mjs, so they'd list every component in _core: what they're made of
// (each <Name>Labels, each export) is already in the component's own file.
const GENERATED = ['ComponentGlobals', 'ComponentLabels'];
const groups = new Map();
const group = (g) => groups.get(g) ?? groups.set(g, { exports: [], decls: [] }).get(g);
for (const st of file.statements) {
  if (ts.isExportDeclaration(st)) {
    // The names in the export { … } and export type { … } lists, each in the file of the folder that declares it.
    for (const el of st.exportClause && ts.isNamedExports(st.exportClause) ? st.exportClause.elements : []) group(owner((el.propertyName ?? el.name).text)).exports.push((st.isTypeOnly ? 'type ' : '') + el.name.text);
  } else if (!GENERATED.includes(nameOf(st))) {
    group(nameOf(st) ? owner(nameOf(st)) : '_core').decls.push(printer.printNode(ts.EmitHint.Unspecified, st, file));
  }
}
const now = new Map([...groups].map(([g, { exports, decls }]) => [`${g}.d.ts`,
  `// exports: ${exports.sort((a, b) => a.replace('type ', '').localeCompare(b.replace('type ', ''), 'en')).join(', ')}\n${decls.join('\n')}\n`]));

if (update || !fs.existsSync(BASE)) {
  fs.mkdirSync(BASE, { recursive: true });
  for (const f of fs.readdirSync(BASE)) if (!now.has(f)) fs.rmSync(path.join(BASE, f));
  for (const [f, t] of now) if (!fs.existsSync(path.join(BASE, f)) || fs.readFileSync(path.join(BASE, f), 'utf8') !== t) fs.writeFileSync(path.join(BASE, f), t);
  console.log(`API baseline saved: ${path.relative(process.cwd(), BASE)}/ (${now.size} files)`);
  process.exit(0);
}
const base = new Map(fs.readdirSync(BASE).map((f) => [f, fs.readFileSync(path.join(BASE, f), 'utf8')]));
const names = (texts) => new Set([...texts].flatMap((t) => t.split('\n')[0].replace(/^\/\/ exports: ?/, '').split(', ').filter(Boolean).map((n) => n.replace(/^type /, ''))));
const [was, is] = [names(base.values()), names(now.values())];
const removed = [...was].filter((n) => !is.has(n)), added = [...is].filter((n) => !was.has(n));
// The files whose declarations differ, and the first lines that differ, for a short pointer to what changed.
const differ = [...new Set([...base.keys(), ...now.keys()])].sort().filter((f) => base.get(f) !== now.get(f));
const changed = differ.flatMap((f) => {
  const a = new Set((base.get(f) ?? '').split('\n'));
  return (now.get(f) ?? '').split('\n').filter((l) => !a.has(l) && !l.startsWith('// exports:')).map((l) => `${f}: ${l.trim()}`);
}).slice(0, 8);

const fix = 'if intended, run node tools/test/api.mjs --update and add a changeset';
const R = [
  { name: 'no export was removed (that would be a breaking change: major)', ok: !removed.length, detail: `removed: ${removed.join(', ')}; ${fix}` },
  { name: 'no export was added without updating the baseline (minor)', ok: !added.length, detail: `added: ${added.join(', ')}; ${fix}` },
  { name: 'the exported types match baseline-api/', ok: !differ.length, detail: `${differ.join(', ')} differ${changed.length ? `; changed lines (first ${changed.length}):\n        ${changed.map((l) => l.slice(0, 160)).join('\n        ')}` : ''}\n      ${fix}` },
];
done(report('Public API', R));

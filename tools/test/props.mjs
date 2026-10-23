// Own props stay off the DOM: every component hands the props it doesn't use itself to its DOM element through
// omit(props, { size: 1, … }). A prop the component declares, that isn't an HTML or ARIA attribute and isn't in
// that list, would land on the element as a stray attribute (size="lg" on a <div>, options="[object Object]").
// This reads every omit() call with the TypeScript checker and lists those props.
//   node tools/test/props.mjs
import path from 'node:path';
// TypeScript 7 has no compiler API yet, so this reads the types with TypeScript 6's (see tools/typescript/api.mjs).
import ts from '@typescript/typescript6';
import { PROJECT, done, report } from './lib.mjs';

const config = ts.getParsedCommandLineOfConfigFile(path.join(PROJECT, 'tsconfig.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const program = ts.createProgram(config.fileNames, config.options);
const checker = program.getTypeChecker();
const SRC = path.join(PROJECT, 'src') + path.sep;

// The names React passes to a DOM element as they are: every HTML and ARIA attribute and event handler, from
// React's own types (React.AllHTMLAttributes & React.SVGAttributes), plus ref, key and children.
const types = program.getSourceFiles().find((f) => /node_modules[\\/]@types[\\/]react[\\/]index\.d\.ts$/.test(f.fileName));
const react = types && types.statements.find((s) => ts.isModuleDeclaration(s) && s.name.getText() === 'React');
const DOM = new Set(['ref', 'key', 'children']);
const walk = (n) => {
  if (ts.isInterfaceDeclaration(n) && ['AllHTMLAttributes', 'SVGAttributes'].includes(n.name.text)) {
    for (const p of checker.getDeclaredTypeOfSymbol(checker.getSymbolAtLocation(n.name)).getProperties()) DOM.add(p.name);
  }
  ts.forEachChild(n, walk);
};
if (react) walk(react);
const isDom = (name) => DOM.has(name) || /^(aria|data)-/.test(name);

const R = [];
let calls = 0;
for (const file of program.getSourceFiles()) {
  if (!file.fileName.startsWith(SRC) || !/[\\/]components[\\/]/.test(file.fileName) || /\.(test|stories)\.tsx$/.test(file.fileName)) continue;
  const visit = (n) => {
    if (ts.isCallExpression(n) && n.expression.getText(file) === 'omit' && n.arguments.length === 2) {
      calls++;
      // The list is written in place or in a constant (const OWN = { … } as const); its type names the keys either way.
      const listed = new Set(checker.getTypeAtLocation(n.arguments[1]).getProperties().map((p) => p.name));
      const leaks = checker.getTypeAtLocation(n.arguments[0]).getProperties()
        // Declared in this system (not inherited from React's DOM types), not handed on by name, not a DOM attribute.
        .filter((p) => (p.declarations || []).some((d) => d.getSourceFile().fileName.startsWith(SRC)))
        .map((p) => p.name)
        .filter((name) => !listed.has(name) && !isDom(name));
      const at = `${path.relative(PROJECT, file.fileName)}:${file.getLineAndCharacterOfPosition(n.getStart(file)).line + 1}`;
      R.push({ name: `${at}: every own prop that isn't an HTML attribute is kept off the DOM`, ok: !leaks.length, detail: leaks.length ? `not in the omit() list: ${[...new Set(leaks)].join(', ')}` : '' });
    }
    ts.forEachChild(n, visit);
  };
  visit(file);
}
R.unshift({ name: `React's DOM attribute list was read (${DOM.size} names) and omit() calls were found (${calls})`, ok: DOM.size > 500 && calls > 40, detail: '' });
done(report('Props', R));

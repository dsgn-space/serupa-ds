// What the React Compiler skips (ADR-0017): every component and hook in a "use client" file ships memoized unless
// the compiler finds something it can't prove safe, and then it ships that function as written (panicThreshold
// 'none'). This runs the build's own compiler pass (tools/build/react-compiler.mjs) over src/ and lists the functions
// it skipped, with its reason and the line. The compiler is the judge here, not the lint rules: eslint's copy of them
// passes a ref handed to React.createElement inside an object, which the compiler skips the component for.
// baseline-compiler-skips.txt holds the ones still skipped, a line each, and only shrinks: a newly skipped function
// fails, and so does a listed one that now compiles (take it off the list in the same pull request).
//   node tools/test/compiler.mjs            check
//   node tools/test/compiler.mjs --update   write the list as it is now
import fs from 'node:fs';
import path from 'node:path';
import { compileReact, compiles } from '../build/react-compiler.mjs';
import { PROJECT, done, report } from './lib.mjs';

const LIST = path.join(PROJECT, 'tools', 'test', 'baseline-compiler-skips.txt');
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else files.push(p);
  }
})(path.join(PROJECT, 'src'));

const skipped = new Map();   // "src/… fnName" -> "line: reason"
let seen = 0, made = 0;
for (const file of files.sort()) {
  const code = fs.readFileSync(file, 'utf8');
  if (!compiles(file, code)) continue;
  seen++;
  const rel = path.relative(PROJECT, file).split(path.sep).join('/');
  const lines = code.split('\n');
  // The function's name from its first line (`function ButtonRender(`, `const useThing = (`): a line number would move
  // with every edit above it.
  const nameAt = (line) => /(?:function\s+|(?:const|let)\s+)([\w$]+)/.exec(lines[(line ?? 1) - 1] || '')?.[1] || `(line ${line})`;
  await compileReact(file, code, (e) => {
    if (e.kind === 'CompileSuccess') { made++; return; }
    if (e.kind !== 'CompileError' && e.kind !== 'CompileUnexpectedThrow' && e.kind !== 'PipelineError') return;
    const d = e.detail?.options ?? e.detail ?? {};
    const at = d.details?.find((x) => x.loc)?.loc ?? d.loc ?? e.fnLoc;
    const key = `${rel} ${e.fnName || nameAt(e.fnLoc?.start?.line)}`;
    if (!skipped.has(key)) skipped.set(key, `${at?.start?.line ?? '?'}: ${d.reason || e.kind}`);
  });
}
const now = [...skipped.keys()].sort();
if (process.argv.includes('--update')) {
  fs.writeFileSync(LIST, now.join('\n') + '\n');
  console.log(`${now.length} skipped functions written to ${path.relative(PROJECT, LIST)}`);
  process.exit(0);
}
const listed = new Set(fs.existsSync(LIST) ? fs.readFileSync(LIST, 'utf8').split('\n').filter(Boolean) : []);
const fresh = now.filter((k) => !listed.has(k));
const gone = [...listed].filter((k) => !skipped.has(k));
const R = [
  { name: `the compiler went over ${seen} client files and memoized ${made} functions`, ok: seen > 100 && made > 100, detail: `only ${seen} files and ${made} functions: is tools/build/react-compiler.mjs still finding them?` },
  { name: `no function newly skipped (${now.length} still are, in baseline-compiler-skips.txt)`, ok: !fresh.length,
    detail: fresh.map((k) => `${k} at line ${skipped.get(k)}`).join('\n      ') + '\n      Make it follow the rules (https://react.dev/reference/rules), or if it must stay as written, add the line to tools/test/baseline-compiler-skips.txt' },
  { name: 'every listed function is still skipped (one that compiles comes off the list)', ok: !gone.length,
    detail: `${gone.join(', ')}: now compiled; remove ${gone.length === 1 ? 'it' : 'them'} from tools/test/baseline-compiler-skips.txt (or run node tools/test/compiler.mjs --update)` },
];
done(report('React Compiler', R));

// Mutation testing (J1): line coverage says which code the tests ran, not what they would notice going wrong. This
// changes the code one small way at a time (a mutant: === to !==, < to <=, && to ||, a ! dropped, true to false),
// runs the tests that cover it, and counts the mutants they catch (killed) and the ones they don't (survived). Each
// file's score (killed / all) is kept in tools/test/baseline-mutation.json, and a score below it fails. The
// survivors it prints are a list of assertions to write.
// Stryker's Vitest runner doesn't run browser-mode tests, which all of ours are, so this drives Vitest itself: one
// instance for the whole run, the source file rewritten in place and invalidated for each mutant, about a second each.
//   node tools/test/mutation.mjs                      every src/internal file with its own test file
//   node tools/test/mutation.mjs --rotate             five components picked by the day, then that (the nightly run)
//   node tools/test/mutation.mjs src/internal/step.ts src/components/Rating/Rating.tsx
//   node tools/test/mutation.mjs … --update           write the scores of the files it ran into the baseline
//   node tools/test/mutation.mjs … --minutes 100      start no new file after 100 minutes
//   node tools/test/mutation.mjs … --json out.json    every file's mutants, kills and survivors, as JSON
// A file is always put back as it was, also on Ctrl+C. Run it in a checkout with no edits to the files it mutates.
import fs from 'node:fs';
import path from 'node:path';
// TypeScript 7 has no compiler API yet, so this reads the code with TypeScript 6's (see tools/typescript/api.mjs).
import ts from '@typescript/typescript6';
import { createVitest } from 'vitest/node';
import { PROJECT } from './lib.mjs';

const BASELINE = path.join(PROJECT, 'tools', 'test', 'baseline-mutation.json');
const args = process.argv.slice(2);
const update = args.includes('--update'), rotate = args.includes('--rotate');
const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : null);
const jsonAt = value('--json');
// --minutes N: start no new file after N minutes, so a job with a time limit ends with what it finished.
const minutes = Number(value('--minutes')) || Infinity;
const named = args.filter((a, i) => !a.startsWith('--') && !['--json', '--minutes'].includes(args[i - 1]));

// What to mutate, each with the test files that cover it.
function targets() {
  const internal = path.join(PROJECT, 'src', 'internal');
  const own = fs.readdirSync(internal).filter((f) => /^\w+\.ts$/.test(f) && fs.existsSync(path.join(internal, f.replace(/\.ts$/, '.test.tsx'))))
    .map((f) => ({ file: `src/internal/${f}`, tests: [`src/internal/${f.replace(/\.ts$/, '.test.tsx')}`] }));
  const comp = path.join(PROJECT, 'src', 'components');
  const component = (n) => ({ file: `src/components/${n}/${n}.tsx`, tests: [`src/components/${n}/${n}.test.tsx`] });
  if (named.length) return named.map((f) => {
    const m = f.match(/^src\/components\/(\w+)\/\1\.tsx$/);
    if (m) return component(m[1]);
    const t = own.find((o) => o.file === f);
    if (!t) throw new Error(`${f}: not a src/internal file with its own test file, or a component's main file`);
    return t;
  });
  if (!rotate) return own;
  // Five components a night, in turn, so each comes round every few weeks.
  const all = fs.readdirSync(comp).filter((n) => fs.existsSync(path.join(comp, n, `${n}.tsx`)) && fs.existsSync(path.join(comp, n, `${n}.test.tsx`))).sort();
  const day = Math.floor(Date.now() / 86_400_000);
  // The components first, then the internal files from a different one each night, so a run that --minutes cuts
  // short still reaches every file over a few nights.
  const from = day % own.length;
  return [...Array.from({ length: 5 }, (_, i) => component(all[(day * 5 + i) % all.length])), ...own.slice(from), ...own.slice(0, from)];
}

// The mutants of a file: where, what goes there, and a label "line:col from → to".
const SWAP = {
  '===': '!==', '!==': '===', '==': '!=', '!=': '==', '<': '<=', '<=': '<', '>': '>=', '>=': '>',
  '&&': '||', '||': '&&', '??': '&&', '+': '-', '-': '+', '*': '/', '/': '*', '%': '*',
};
function mutants(file, text) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out = [];
  const add = (start, end, to, from) => {
    const { line, character } = sf.getLineAndCharacterOfPosition(start);
    out.push({ start, end, to, label: `${line + 1}:${character + 1} ${from} → ${to || '(nothing)'}` });
  };
  // A string, or something that reads as one (a template), makes + a join, not a sum.
  const stringy = (n) => ts.isStringLiteral(n) || ts.isTemplateExpression(n) || ts.isNoSubstitutionTemplateLiteral(n);
  const visit = (n) => {
    // Types, imports and exports don't run; development-only branches only change what warns.
    if (ts.isTypeNode(n) || ts.isImportDeclaration(n) || ts.isExportDeclaration(n) || ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) return;
    if (/process\.env\.NODE_ENV|__DEV__/.test(n.getText(sf)) && (ts.isBinaryExpression(n) || ts.isIfStatement(n))) return;
    if (ts.isBinaryExpression(n)) {
      const op = n.operatorToken.getText(sf), to = SWAP[op];
      if (to && !((op === '+' || op === '-') && (stringy(n.left) || stringy(n.right)))) add(n.operatorToken.getStart(sf), n.operatorToken.getEnd(), to, op);
    }
    if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.ExclamationToken && !ts.isPrefixUnaryExpression(n.operand)) add(n.getStart(sf), n.operand.getStart(sf), '', '!');
    if (n.kind === ts.SyntaxKind.TrueKeyword) add(n.getStart(sf), n.getEnd(), 'false', 'true');
    if (n.kind === ts.SyntaxKind.FalseKeyword) add(n.getStart(sf), n.getEnd(), 'true', 'false');
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

// One Vitest for the whole run (its start, with every story drawn in Node, takes a few seconds), made again after a
// mutant that hangs.
let vitest = null;
const start = async () => { vitest = await createVitest('test', { project: ['components'], watch: false, reporters: [{}], silent: true }); };
const passes = async (specs, ms) => {
  let timer;
  const hang = new Promise((r) => { timer = setTimeout(() => r('timeout'), ms); });
  const result = await Promise.race([vitest.runTestSpecifications(specs), hang]);
  clearTimeout(timer);
  if (result === 'timeout') return 'timeout';
  // The result holds every file this Vitest has run so far; only this run's count.
  const ids = new Set(specs.map((s) => s.moduleId)), mine = result.testModules.filter((m) => ids.has(m.moduleId));
  return mine.length === ids.size && mine.every((m) => m.ok()) && !result.unhandledErrors.length;
};

const restore = new Map();
const putBack = () => { for (const [f, text] of restore) fs.writeFileSync(f, text); restore.clear(); };
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { putBack(); process.exit(130); });

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
const results = {};
function save() {
  if (jsonAt) fs.writeFileSync(jsonAt, JSON.stringify(results, null, 2) + '\n');
  if (!update) return;
  const next = { ...baseline };
  for (const [f, r] of Object.entries(results)) next[f] = { mutants: r.mutants, killed: r.killed, score: r.score };
  fs.writeFileSync(BASELINE, JSON.stringify(Object.fromEntries(Object.entries(next).sort()), null, 2) + '\n');
}
let failed = false;
await start();
try {
  const began = Date.now(), all = targets();
  for (const [i, { file, tests }] of all.entries()) {
    if (Date.now() - began > minutes * 60_000) { console.log(`STOP  ${minutes} minutes up: ${all.slice(i).map((t) => t.file).join(', ')} not run`); break; }
    const abs = path.join(PROJECT, file), text = fs.readFileSync(abs, 'utf8');
    const specs = await vitest.globTestSpecifications(tests.map((t) => path.join(PROJECT, t)));
    const t0 = Date.now();
    if ((await passes(specs, 300_000)) !== true) { console.log(`SKIP  ${file}: its tests fail without any mutant`); failed = true; continue; }
    const limit = Math.max(30_000, (Date.now() - t0) * 5);
    const list = mutants(file, text), survived = [];
    console.log(`…     ${file}: ${list.length} mutants`);
    let killed = 0;
    restore.set(abs, text);
    for (const m of list) {
      fs.writeFileSync(abs, text.slice(0, m.start) + m.to + text.slice(m.end));
      vitest.invalidateFile(abs);
      const ok = await passes(specs, limit);
      if (ok === 'timeout') { killed++; await vitest.close(); fs.writeFileSync(abs, text); await start(); continue; }
      if (ok) survived.push(m.label); else killed++;
    }
    fs.writeFileSync(abs, text);
    vitest.invalidateFile(abs);
    restore.delete(abs);
    const score = list.length ? killed / list.length : 1;
    results[file] = { mutants: list.length, killed, score: Math.round(score * 1000) / 1000 };
    const was = baseline[file]?.score;
    const drop = was !== undefined && results[file].score < was;
    if (drop) failed = true;
    console.log(`${drop ? 'FAIL' : 'PASS'}  ${file}: ${killed}/${list.length} killed (${(score * 100).toFixed(1)}%${was === undefined ? ', no baseline yet' : `, baseline ${(was * 100).toFixed(1)}%`})`);
    for (const s of survived.slice(0, drop ? 20 : 5)) console.log(`      survived ${s}`);
    if (survived.length > (drop ? 20 : 5)) console.log(`      … and ${survived.length - (drop ? 20 : 5)} more`);
    results[file].survived = survived;
    // Written after each file, so a run cut short (a job's time limit) keeps what it finished.
    save();
  }
} finally {
  putBack();
  await vitest?.close();
}

if (update) console.log(`Wrote ${Object.keys(results).length} scores to ${path.relative(PROJECT, BASELINE)}`);
const all = Object.values(results), k = all.reduce((s, r) => s + r.killed, 0), n = all.reduce((s, r) => s + r.mutants, 0);
console.log(`\nMutation score: ${k}/${n} killed (${n ? ((k / n) * 100).toFixed(1) : '100'}%) over ${all.length} files`);
process.exit(failed && !update ? 1 : 0);

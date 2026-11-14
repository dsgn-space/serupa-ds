// The exemption ledger: every entry in the checks' KNOWN, EXEMPT, ALLOW and GAPS lists in tools/test/, with its
// reason, so a shortcut taken "for now" can't quietly stay forever. An entry that is meant to go away says what
// it waits for with "until": a browser ("until Safari 26"), a pull request ("until #1234") or a work-queue item
// ("until GR123"). Fails when an entry gives no reason, and when what it waits for has happened: the browser floor
// in package.json's browserslist has reached that version, or that pull request is merged on this branch. A queue item's
// status lives outside the repository, so pass the queue to check those too:
//   node tools/test/exemptions.mjs [--queue path/to/work-queue.md] [--list]
// --list prints the whole ledger. eslint-suppressions.json is counted too; ESLint keeps no reason there, so each
// suppression's reason is the comment in the code it suppresses.
import fs from 'node:fs';
import path from 'node:path';
import { floor as browserFloor } from '../browser-floor.mjs';
import { execFileSync } from 'node:child_process';
import ts from '@typescript/typescript6';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const DIR = path.join(PROJECT, 'tools', 'test');
const LIST = /^(?:KNOWN|EXEMPT|ALLOW|GAPS)(?:_[A-Z]+)*$/;

/** Every string in an expression, joined: an entry's reason, however it's written. */
const strings = (n, out = []) => {
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) out.push(n.text);
  else if (!ts.isRegularExpressionLiteral(n)) ts.forEachChild(n, (c) => { strings(c, out); });
  return out;
};
const keyOf = (p, file) => p.name ? p.name.getText(file).replace(/^['"`]|['"`]$/g, '') : '';

/** The entries of one list: [key, reason]. An object's properties, or an array's items (a [pattern, reason] pair,
 *  or a string that is the whole entry). Object.fromEntries(Object.entries({…}).flatMap(…)) is read from its {…}. */
function entries(init, file) {
  let e = init;
  while (e && !ts.isObjectLiteralExpression(e) && !ts.isArrayLiteralExpression(e)) {
    // x.flatMap(…) or x.map(…) works on x; other calls (Object.fromEntries, new Set) on their first argument.
    if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && /^(?:flatMap|map|filter|concat)$/.test(e.expression.name.text)) e = e.expression.expression;
    else if (ts.isCallExpression(e) || ts.isNewExpression(e)) e = e.arguments?.[0];
    else if (ts.isPropertyAccessExpression(e)) e = e.expression;
    else if (ts.isAsExpression(e) || ts.isParenthesizedExpression(e)) e = e.expression;
    else return [];
  }
  if (!e) return [];
  if (ts.isObjectLiteralExpression(e)) {
    // A comment after the entry counts as its reason too, as in motion-tokens' Loader line.
    return e.properties.filter(ts.isPropertyAssignment).map((p) => {
      const tail = /^\s*,?\s*\/\/\s*(.*)$/.exec(file.text.slice(p.end, file.text.indexOf('\n', p.end)))?.[1].trim() ?? '';
      return [keyOf(p, file), [...strings(p.initializer), tail].filter(Boolean).join('; ')];
    });
  }
  return e.elements.map((x) => ts.isArrayLiteralExpression(x)
    ? [x.elements[0]?.getText(file) ?? '', strings(x).join('; ')]
    : [x.getText(file), ts.isStringLiteral(x) ? x.text : '']);
}

/** The exemptions declared in one script. */
function scan(f, text) {
  const out = [];
  const file = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true);
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && LIST.test(n.name.text) && n.initializer) {
      for (const [key, why] of entries(n.initializer, file)) out.push({ file: f, list: n.name.text, key, why });
    }
    ts.forEachChild(n, visit);
  };
  visit(file);
  return out;
}
const ledger = fs.readdirSync(DIR).filter((x) => x.endsWith('.mjs')).sort().flatMap((f) => scan(f, fs.readFileSync(path.join(DIR, f), 'utf8')));

// What a temporary entry waits for.
// The floor browser-baseline.mjs holds the package to: package.json's browserslist.
const floor = browserFloor();
const BROWSER = { chrome: 'chrome', edge: 'edge', safari: 'safari', firefox: 'firefox' };
const queueFile = arg('--queue');
const queue = queueFile ? fs.readFileSync(queueFile, 'utf8') : '';
let merged = null;
const isMerged = (pr) => {
  if (merged === null) {
    try { merged = execFileSync('git', ['log', '--format=%s', 'HEAD'], { cwd: PROJECT, encoding: 'utf8', maxBuffer: 64 << 20 }); }
    catch { merged = ''; }
  }
  return new RegExp(`^Merge pull request #${pr}\\b`, 'm').test(merged);
};

/** Fills in what an entry waits for (until) and whether that has happened (over). */
function judge(e) {
  const until = /\buntil\s+(?:(#\d+)|([A-Z]{1,4}\d+[a-z]?)\b|(Chrome|Edge|Safari|Firefox)\s+([\d.]+))/i.exec(e.why);
  e.until = until?.[0].replace(/^until\s+/i, '') ?? '';
  if (!until) return e;
  if (until[1]) e.over = isMerged(until[1].slice(1)) ? `${until[1]} is merged` : '';
  else if (until[3]) { const b = BROWSER[until[3].toLowerCase()]; e.over = floor[b] >= Number(until[4]) ? `the floor is ${until[3]} ${floor[b]} now` : ''; }
  else if (queue) e.over = new RegExp(`^- \\[x\\][^\\n]*?\\b${until[2]}\\b`, 'm').test(queue) ? `${until[2]} is done in the queue` : '';
  return e;
}
ledger.forEach(judge);

// The ledger reads the lists however they're written, and judges a made-up one as it should.
const FIXTURE = `const KNOWN = { a: 'lasting reason', b: '', c: 'waits (until Safari ${floor.safari - 1})', d: 'waits (until Safari ${floor.safari + 10})', e: 'until #1' };
const ALLOW_X = [[/re/, 'why'], 'whole entry'];
const EXEMPT = Object.fromEntries(Object.entries({
  Loader: ['x', 'y'],   // a comment for a reason
}).flatMap(([c, xs]) => xs.map((x) => [c + x, 'tag'])));`;
const fx = Object.fromEntries(scan('fixture.mjs', FIXTURE).map((e) => [e.key, judge(e)]));
t('The ledger reads objects, arrays, pairs and wrapped lists, comments included', fx.a?.why === 'lasting reason' && fx['/re/']?.why === 'why'
  && fx["'whole entry'"]?.why === 'whole entry' && /a comment for a reason/.test(fx.Loader?.why ?? ''), JSON.stringify(fx));
t('It flags a missing reason and a browser the floor has reached, and leaves the rest', fx.b?.why === '' && !!fx.c?.over && !fx.d?.over && !fx.a?.over,
  JSON.stringify({ b: fx.b, c: fx.c, d: fx.d }));

const where = (e) => `tools/test/${e.file} ${e.list} "${e.key}"`;
const bare = ledger.filter((e) => !e.why.trim());
t('Every exemption says why', !bare.length, bare.map(where).join('\n      ') + '\n      Add the reason: what happens without it, or why it is right.');
const over = ledger.filter((e) => e.over);
t('No exemption waits for something that has happened', !over.length, over.map((e) => `${where(e)}: until ${e.until}, and ${e.over}`).join('\n      ')
  + '\n      Take the entry out, or say why it stays with a new reason.');
t('The ledger found the lists', ledger.length > 0, 'no KNOWN, EXEMPT, ALLOW or GAPS lists found in tools/test/');

const sup = JSON.parse(fs.readFileSync(path.join(PROJECT, 'eslint-suppressions.json'), 'utf8'));
const supCount = Object.values(sup).flatMap((rules) => Object.values(rules)).reduce((s, r) => s + r.count, 0);
const temp = ledger.filter((e) => e.until);
console.log(`Exemptions: ${ledger.length} in ${new Set(ledger.map((e) => e.file)).size} files, ${temp.length} waiting for something`
  + `${temp.length ? ` (${temp.map((e) => `${e.file} "${e.key}" until ${e.until}`).join('; ')})` : ''}; ${supCount} ESLint suppressions in ${Object.keys(sup).length} files.`
  + (queueFile ? '' : ' Queue items not checked (no --queue).'));
if (process.argv.includes('--list')) for (const e of ledger) console.log(`  ${where(e)}: ${e.why || '(no reason)'}`);

done(report('Exemption ledger', R));

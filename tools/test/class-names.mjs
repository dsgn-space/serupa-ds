// Class names that nothing styles: a className in a block, a pattern or a story that no stylesheet defines does nothing,
// and nothing else says so. md:grid-cols-[1fr_2fr] and sm:min-w-64 read like utilities, but utilities.css has no
// arbitrary values and no min-w-64, so the Settings section and the Table toolbar lost their layout without a test
// noticing (#1493). This reads every class written in a className there and fails on one that neither the utilities
// (utilities.template.css expanded over tokens.json, extras included) nor any stylesheet under src/ defines.
//   node tools/test/class-names.mjs
// Only what's written out is read: className="a b", and the quoted parts of className={…} (a `${…}` piece is
// skipped, and so is a word glued to one). A story's own <style>{'…'}</style> counts for that story. A class that's only a hook for a script or a test, with no rule, goes in
// HOOKS with the reason.
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';
import { buildUtilities } from '../utilities/build.mjs';

/** Classes on purpose without a rule of their own: { class: why }. */
const HOOKS = {};

const unescape = (c) => c.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every class a stylesheet's selectors name (md:flex for .md\:flex, hover:bg-x for .hover\:bg-x:hover). */
export function classesIn(css) {
  const out = new Set();
  // Only selectors: the text before each {, so a value (url(a.png), 0.5rem) never counts.
  for (const [, sel] of strip(css).matchAll(/([^{};]+)\{/g)) {
    if (/^\s*@/.test(sel)) continue;
    for (const m of sel.matchAll(/\.((?:[A-Za-z0-9_-]|\\[0-9a-fA-F]{1,6} ?|\\.)+)/g)) out.add(unescape(m[1]));
  }
  return out;
}

/** The classes a file writes out in className attributes. */
export function classNamesIn(source) {
  const out = [];
  const add = (text) => { for (const c of text.split(/\s+/)) if (c) out.push(c); };
  for (const m of source.matchAll(/className=(?:"([^"]*)"|'([^']*)'|\{)/g)) {
    if (m[1] !== undefined || m[2] !== undefined) { add(m[1] ?? m[2]); continue; }
    // className={…}: up to its closing brace, then each string in it.
    let depth = 1, i = m.index + m[0].length;
    for (; i < source.length && depth; i++) { if (source[i] === '{') depth++; else if (source[i] === '}') depth--; }
    strings(source.slice(m.index + m[0].length, i - 1), add);
  }
  return out;
}

// Each string in an expression. A template literal gives what's around each ${…}, without a word glued to one
// (`p-${n}`), and the strings inside each ${…} (`${wrap ? ' wrap-anywhere' : ''}`).
function strings(expr, add) {
  for (const s of expr.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`((?:[^`$]|\$(?!\{)|\$\{[^}]*\})*)`/g)) {
    if (s[3] === undefined) { add(s[1] ?? s[2]); continue; }
    for (const [, inner] of s[3].matchAll(/\$\{([^}]*)\}/g)) strings(inner, add);
    add(s[3].replace(/\S*\$\{[^}]*\}\S*/g, ' '));
  }
}

/** The stylesheets a file writes inline, as <style>{'…'}</style>. */
const inlineCss = (source) => [...source.matchAll(/<style>\{\s*(['"`])([\s\S]*?)\1\s*\}<\/style>/g)].map((m) => m[2]).join('\n');

const list = (dir, test) => fs.readdirSync(path.join(PROJECT, dir), { recursive: true }).map((f) => `${dir}/${String(f).split(path.sep).join('/')}`).filter(test).sort();

const known = classesIn(buildUtilities(PROJECT));
const sheets = list('src', (f) => f.endsWith('.css') && f !== 'src/styles/utilities.css');
for (const f of sheets) for (const c of classesIn(fs.readFileSync(path.join(PROJECT, f), 'utf8'))) known.add(c);

const files = [...new Set([
  ...list('src/blocks', (f) => /\.(tsx|mdx)$/.test(f) && !f.endsWith('.test.tsx')),
  ...list('src/patterns', (f) => /\.(tsx|mdx)$/.test(f) && !f.endsWith('.test.tsx')),
  ...list('src', (f) => f.endsWith('.stories.tsx')),
])].sort();

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
// The check itself.
t(`the utilities and stylesheets were read (${known.size} classes from ${sheets.length} stylesheets and the utilities)`, known.has('flex') && known.has('md:grid-cols-2') && known.size > 10000, [...known].slice(0, 5).join(' '));
t(`the blocks, patterns and stories were found (${files.length} files)`, files.length > 50, files.slice(0, 3).join(', '));
const sample = classNamesIn('<div className="flex  gap-2" /><p className={`p-3 ${a ? \'wrap-anywhere\' : ""} m-${n} x${y}z`} /><i className={cx("a", { b: c })} />');
t('className="…" and the strings in className={…} are read, without a word glued to ${…}', JSON.stringify(sample.sort()) === JSON.stringify(['a', 'flex', 'gap-2', 'p-3', 'wrap-anywhere']), JSON.stringify(sample));
const sel = classesIn('.md\\:flex, .hover\\:bg-x:hover > .a{color:red}\n@media (min-width: 40rem){.\\32 xl\\:p-1{background:url(a.png)}}');
const inline = classesIn(inlineCss("<style>{'.page-shell__side { top: 0 }'}</style>"));
t('a story\'s own <style> counts for that story (page-shell__side in PageShell.stories.tsx)', inline.has('page-shell__side'), JSON.stringify([...inline]));
t('a stylesheet\'s classes are read from its selectors, escapes included', ['md:flex', 'hover:bg-x', 'a', '2xl:p-1'].every((c) => sel.has(c)) && !sel.has('png') && sel.size === 4, JSON.stringify([...sel]));

for (const f of files) {
  const source = fs.readFileSync(path.join(PROJECT, f), 'utf8'), own = classesIn(inlineCss(source));
  const unknown = [...new Set(classNamesIn(source))].filter((c) => !known.has(c) && !own.has(c) && !(c in HOOKS));
  if (!unknown.length) continue;
  t(`${f}: ${unknown.length} ${unknown.length === 1 ? 'class' : 'classes'} nothing defines`, false,
    `${unknown.join(' ')}: utilities.css has no such class (and no arbitrary values like grid-cols-[…]), and no stylesheet under src/ has a rule for it. Use a utility that exists, or give it a rule in the component's or pattern's CSS.`);
}
const unused = Object.keys(HOOKS).filter((c) => known.has(c));
t('every class in HOOKS still has no rule of its own', !unused.length, unused.join(' '));

done(report('Class names nothing defines', R));

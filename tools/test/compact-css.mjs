// The shipped CSS is compacted by whitespace only (tools/build/compact-css.mjs): read back through lightningcss, it
// is the same CSS as before compaction, rule for rule and value for value. Build first (npm run build).
//   node tools/test/compact-css.mjs
import fs from 'node:fs';
import path from 'node:path';
import { transform } from 'lightningcss';
import { compactCss } from '../build/compact-css.mjs';
import { withMotionAttribute } from '../build/motion-attribute.mjs';
import { buildUtilities } from '../utilities/build.mjs';
import { PROJECT, done, read, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
// lightningcss prints the CSS it parsed, one declaration per line. Where it keeps a value as written (one with var()),
// the only whitespace compaction drops is around commas, which no value's meaning depends on.
const printed = (css) => transform({ filename: 'x.css', code: Buffer.from(css), minify: false }).code.toString().replace(/\s*,\s*/g, ',').replace(/ +;/g, ';');
const firstDiff = (a, b) => { const x = a.split('\n'), y = b.split('\n'); const i = x.findIndex((l, k) => l !== y[k]); return i < 0 ? '' : `line ${i}: ${x[i]} | ${y[i]}`; };

// Tricky input: strings, escapes (a hex escape's ending space is part of it), comments, combinators, value lists.
const tricky = `/*! keep me */
.a  >  .b ,  .c:hover  .d { content: " ;  { } , > " ; font-family: "A B" , serif ; }
.\\31 0\\:p-2 { margin : 0 auto ; }
.sm\\:flex  .x { grid-template-areas: "a  b" "c d"; }
@media ( min-width : 40rem ) , print { .e { transition: opacity 1s , transform 2s ; } }
/* dropped by the build before this, kept here */ .f::after { content: '\\201C' ; }
`;
const out = compactCss(tricky);
t('strings, escapes and comments keep every character; only whitespace around { } ; : , > goes', printed(out) === printed(tricky), `${out}\n${firstDiff(printed(tricky), printed(out))}`);
t('a hex escape keeps the space that ends it (".\\31 0" is ".10")', out.includes('.\\31 0\\:p-2{'), out);
t('the /*! banner keeps its own line, and each rule ends its line', out.startsWith('/*! keep me */\n') && /\}\n\.\\31 0/.test(out), out);

// The files the package ships: each is the same CSS as its source, uncompacted, would be.
const src = (n) => read(`src/components/${n}/${n}.css`);
for (const [file, source] of [['base.css', withMotionAttribute(read('src/styles/base.css').replace(/\/\*(?!!)[\s\S]*?\*\//g, '').replaceAll('__VERSION__', JSON.parse(read('package.json')).version))]]) {
  const shipped = fs.readFileSync(path.join(PROJECT, 'dist', file), 'utf8');
  t(`dist/${file} is its source CSS, compacted (the same rules and values)`, printed(shipped) === printed(source), firstDiff(printed(source), printed(shipped)));
}
const strip = (css) => css.replace(/\/\*(?!!)[\s\S]*?\*\//g, '');
const names = fs.readdirSync(path.join(PROJECT, 'src', 'components')).filter((n) => fs.existsSync(path.join(PROJECT, 'src', 'components', n, `${n}.css`)));
const changed = names.filter((n) => printed(compactCss(strip(src(n)))) !== printed(strip(src(n))));
t(`every component's CSS (${names.length} files) is the same CSS once compacted`, names.length > 50 && !changed.length, changed.join(', '));
const utilities = strip(buildUtilities(PROJECT));
t('the utility classes are the same CSS once compacted', utilities.length > 100_000 && printed(compactCss(utilities)) === printed(utilities), firstDiff(printed(utilities), printed(compactCss(utilities))));
done(report('Compact CSS', R));

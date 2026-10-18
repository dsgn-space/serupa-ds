// npm run tokens: tokens.json → tokens.css. The design system page used to write tokens.css; this
// writes the same file from the repo, so a token change no longer needs the (frozen) page. npm run build
// runs it first. --check exits 1 if tokens.css isn't what tokens.json gives (CI and the tests use it).
//   node tools/tokens/build.mjs [--check] [project dir]
//
// tokens.css, in order:
//   :root, [data-theme="<first theme>"]   every themed token (the colors and the shadows) at its first theme's value
//   [data-theme="<theme>"]                each other theme: the tokens with a value per theme (the alias colors)
//   :root                                 every other token, the font families, and the type-* shorthands
//   .type-*                               one class per complete text style
//   @font-face                            the fonts in fonts/
// Everything but the @font-face rules sits in the dk.tokens cascade layer, the first of the system's layers.
import fs from 'node:fs';
import path from 'node:path';

const P = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..'));
const OUT = path.join(P, 'tokens.css');

export function buildTokensCss(t) {
  const themes = t.color.themes.map((x) => x.id);
  const themed = (x) => x.value && typeof x.value === 'object';
  const name = (n) => n.replace(/\./g, '\\.');
  const ref = (v) => String(v).replace(/\{([^}]+)\}/g, (_, n) => `var(--${name(n)})`);
  const line = (n, v, usage) => `  --${name(n)}: ${ref(v)};${usage ? ` /* ${usage} */` : ''}\n`;
  const groups = Object.values(t).filter((g) => g && Array.isArray(g.tokens));
  const all = groups.flatMap((g) => g.tokens);

  let css = '/* Serupa — generated from tokens.json */\n';
  css += '@layer dk.tokens, dk.base, dk.components, dk.utilities;\n@layer dk.tokens {\n';
  css += `:root, [data-theme="${themes[0]}"] {\n`;
  for (const x of all.filter(themed)) css += line(x.name, x.value[themes[0]], x.usage);
  css += '}\n';
  for (const th of themes.slice(1)) {
    css += `[data-theme="${th}"] {\n`;
    for (const x of all.filter((x) => themed(x) && Object.keys(x.value).length > 1 && x.value[th] != null)) css += line(x.name, x.value[th]);
    css += '}\n';
  }

  const styles = t.type.groups.flatMap((g) => g.styles.map((s) => ({ ...s, family: s.family || g.family })));
  css += ':root {\n';
  for (const x of all.filter((x) => !themed(x))) css += line(x.name, x.value, x.usage);
  for (const [k, v] of Object.entries(t.type.families)) css += `  --font-${k}: ${v};\n`;
  for (const s of styles) css += line(`text-${s.name}`, `${s.fontWeight} ${s.fontSize}/${s.lineHeight} var(--font-${s.family})`, s.usage);
  css += '}\n';
  for (const s of styles) {
    css += `.${s.name} {\n  font-family: var(--font-${s.family});\n  font-size: ${s.fontSize};\n  line-height: ${s.lineHeight};\n  font-weight: ${s.fontWeight};\n  letter-spacing: ${s.letterSpacing};\n`;
    if (s.fontStyle && s.fontStyle !== 'normal') css += `  font-style: ${s.fontStyle};\n`;
    if (s.opticalSize != null) css += `  font-variation-settings: "opsz" ${s.opticalSize};\n`;
    css += '}\n';
  }
  css += '}\n';
  for (const f of t.type.fonts || [])
    css += `@font-face {\n  font-family: "${f.family}";\n  src: url("${f.file}") format("woff2");\n  font-weight: ${f.weight};\n  font-style: ${f.style};\n  font-display: swap;\n}\n`;
  return css;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const css = buildTokensCss(JSON.parse(fs.readFileSync(path.join(P, 'tokens.json'), 'utf8')));
  const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  if (process.argv.includes('--check')) {
    if (now === css) { console.log('tokens.css is up to date with tokens.json'); process.exit(0); }
    console.error('tokens.css is out of date with tokens.json: run npm run tokens and commit it'); process.exit(1);
  }
  if (now !== css) fs.writeFileSync(OUT, css);
  console.log(now === css ? 'tokens.css unchanged' : 'Wrote tokens.css');
}

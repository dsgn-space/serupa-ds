// Style Dictionary (v5) config for design-tokens/: builds one CSS file per theme with the same variable
// names as tokens.css (--blue-600, --primary, --spacing-4…). Use it as a starting point for other
// platforms (iOS, Android, Sass…): add platforms below.
//
//   npm i -D style-dictionary@5
//   node tools/tokens/style-dictionary.config.mjs [out dir]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.join(HERE, '..', '..', 'design-tokens');
const OUT = process.argv[2] || 'build/tokens';
const THEMES = ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark'];

// The format's duration object ({ value: 150, unit: 'ms' }) isn't converted by Style Dictionary 5.6 yet.
StyleDictionary.registerTransform({
  name: 'serupa/duration', type: 'value', transitive: true,
  filter: (t) => (t.$type ?? t.type) === 'duration' && typeof (t.$value ?? t.value) === 'object',
  transform: (t) => { const v = t.$value ?? t.value; return `${v.value}${v.unit}`; },
});
// Use the system's own variable names, kept in $extensions["com.serupa"].cssVar.
StyleDictionary.registerTransform({
  name: 'serupa/name', type: 'name',
  transform: (t) => (t.$extensions?.['com.serupa']?.cssVar || '--' + t.path.join('-')).slice(2),
});

for (const theme of THEMES) {
  const sd = new StyleDictionary({
    source: [path.join(TOKENS, 'serupa.tokens.json'), path.join(TOKENS, 'themes', `${theme}.tokens.json`), path.join(TOKENS, 'components', '*.tokens.json')],
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      css: {
        transforms: [...StyleDictionary.hooks.transformGroups.css.filter((x) => x !== 'name/kebab'), 'serupa/duration', 'serupa/name'],
        buildPath: OUT.endsWith('/') ? OUT : OUT + '/',
        files: [{ destination: `${theme}.css`, format: 'css/variables', options: { selector: `[data-theme="${theme}"]`, outputReferences: false } }],
      },
    },
  });
  await sd.buildAllPlatforms();
}
console.log(`Built ${THEMES.length} theme files in ${OUT}`);

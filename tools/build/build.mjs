// npm run build: everything a project installs, into dist/ (never edited or committed).
//   index.js, index.d.ts   the components as ES modules, with types (React is a peer dependency)
//   diki.iife.js           the browser script: reads window.React, sets window.Diki (bundle.js is the same file)
//   components.css         the dk-* component styles, from src/components/<Name>/<Name>.css
//   utilities.css          the utility classes, from src/styles/utilities.css
//   bundle.css             both in one file, components first (what bundle.css has always been)
//   base.css, theme.js     page defaults and automatic dark mode, from src/
//   lib/                   React 18 for plain pages (react and react-dom UMD builds)
//   node tools/build/build.mjs [--css]     --css skips the JavaScript (tsup) step
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const P = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const D = path.join(P, 'dist');
const { version } = JSON.parse(fs.readFileSync(path.join(P, 'package.json'), 'utf8'));
const read = (f) => fs.readFileSync(path.join(P, f), 'utf8');

// The order the component styles cascade in. A component that styles another one (Loader inside Button)
// comes after it, so keep new components at the end unless they must win over an earlier one.
export const CSS_ORDER = ['Icon', 'Button', 'Loader', 'Badge', 'Input', 'Textarea', 'Field', 'Select', 'Checkbox', 'Radio', 'Switch'];

fs.mkdirSync(D, { recursive: true });
if (!process.argv.includes('--css')) {
  const r = spawnSync(process.execPath, [path.join(P, 'node_modules', 'tsup', 'dist', 'cli-default.js')], { cwd: P, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
  fs.copyFileSync(path.join(D, 'diki.iife.js'), path.join(D, 'bundle.js'));
}

const missing = fs.readdirSync(path.join(P, 'src', 'components')).filter((n) => fs.existsSync(path.join(P, 'src', 'components', n, n + '.css')) && !CSS_ORDER.includes(n));
if (missing.length) { console.error(`Add ${missing.join(', ')} to CSS_ORDER in tools/build/build.mjs`); process.exit(1); }
const components = CSS_ORDER.map((n) => read(`src/components/${n}/${n}.css`)).join('');
const utilities = read('src/styles/utilities.css');
const banner = (what) => `/*! Diki Design System v${version} · ${what} · CHANGELOG.md */\n`;
fs.writeFileSync(path.join(D, 'components.css'), banner('components') + components);
fs.writeFileSync(path.join(D, 'utilities.css'), banner('utilities') + utilities);
fs.writeFileSync(path.join(D, 'bundle.css'), banner('utilities and components') + components + utilities);
fs.copyFileSync(path.join(P, 'src', 'styles', 'base.css'), path.join(D, 'base.css'));
fs.copyFileSync(path.join(P, 'src', 'theme.js'), path.join(D, 'theme.js'));

const require = createRequire(import.meta.url);
fs.mkdirSync(path.join(D, 'lib'), { recursive: true });
for (const [pkg, file] of [['react', 'react.production.min.js'], ['react-dom', 'react-dom.production.min.js']])
  fs.copyFileSync(path.join(path.dirname(require.resolve(`${pkg}/package.json`)), 'umd', file), path.join(D, 'lib', file));
console.log(`Built dist/ (v${version})`);

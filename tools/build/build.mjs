// npm run build: everything a project installs, into dist/ (never edited or committed).
//   index.js, index.d.ts   the components as ES modules, with types (React is a peer dependency)
//   serupa.iife.js           the browser script: reads window.React, sets window.Serupa
//   components.css         the dk-* component styles, from src/components/<Name>/<Name>.css
//   utilities.css          the utility classes, from src/styles/utilities.template.css (tools/utilities/build.mjs)
//   bundle.css             both in one file, components first (what bundle.css has always been)
//   base.css, theme.js     page defaults and automatic dark mode, from src/
//   lib/                   React for plain pages: react.production.min.js sets window.React, and
//                          react-dom.production.min.js sets window.ReactDOM (react-dom and react-dom/client)
//   node tools/build/build.mjs [--css]     --css skips the JavaScript (tsup) step
// First it brings tokens.css (at the package root, committed) up to date with tokens.json: tools/tokens/build.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
import { buildUtilities } from '../utilities/build.mjs';

const P = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const D = path.join(P, 'dist');
const { version } = JSON.parse(fs.readFileSync(path.join(P, 'package.json'), 'utf8'));
const read = (f) => fs.readFileSync(path.join(P, f), 'utf8');

// The order the styles cascade in: the @import list in src/styles/index.css (Storybook loads that file).
const IMPORTS = [...read('src/styles/index.css').matchAll(/^@import "\.\.\/components\/(\w+)\/\1\.css";$/gm)].map((m) => m[1]);

const tokens = spawnSync(process.execPath, [path.join(P, 'tools', 'tokens', 'build.mjs')], { cwd: P, stdio: 'inherit' });
if (tokens.status !== 0) process.exit(tokens.status || 1);

fs.mkdirSync(D, { recursive: true });
if (!process.argv.includes('--css')) {
  // tsup reads tsconfig.json and bundles index.d.ts with TypeScript's compiler API: TypeScript 6's (tools/typescript/api.mjs).
  const r = spawnSync(process.execPath, ['--import', path.join(P, 'tools', 'typescript', 'api.mjs'), path.join(P, 'node_modules', 'tsup', 'dist', 'cli-default.js')], { cwd: P, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}

const missing = fs.readdirSync(path.join(P, 'src', 'components')).filter((n) => fs.existsSync(path.join(P, 'src', 'components', n, n + '.css')) && !IMPORTS.includes(n));
if (missing.length) { console.error(`Add ${missing.join(', ')} to the @import list in src/styles/index.css`); process.exit(1); }
const components = IMPORTS.map((n) => read(`src/components/${n}/${n}.css`)).join('');
const utilities = buildUtilities(P);
// Each file declares the system's cascade layers in one order (dk.tokens, dk.base, dk.components, dk.utilities),
// so page styles outside the layers win over them whatever loads first.
const banner = (what) => `/*! Serupa v${version} by Diki · ${what} · CHANGELOG.md */\n@layer dk.tokens, dk.base, dk.components, dk.utilities;\n`;
fs.writeFileSync(path.join(D, 'components.css'), banner('components') + components);
fs.writeFileSync(path.join(D, 'utilities.css'), banner('utilities') + utilities);
fs.writeFileSync(path.join(D, 'bundle.css'), banner('utilities and components') + components + utilities);
fs.copyFileSync(path.join(P, 'src', 'styles', 'base.css'), path.join(D, 'base.css'));
fs.copyFileSync(path.join(P, 'src', 'theme.js'), path.join(D, 'theme.js'));

// React 19 ships no browser builds (React 18's umd/ folder), so they're built here, under the names and globals
// React 18's had. react-dom takes React from window.React, so both use the one copy.
fs.mkdirSync(path.join(D, 'lib'), { recursive: true });
/** @type {import('esbuild').Plugin} */
const windowReact = { name: 'window-react', setup(b) {
  b.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'window-react' }));
  b.onLoad({ filter: /.*/, namespace: 'window-react' }, () => ({ contents: 'module.exports = window.React;', loader: 'js' }));
} };
const libs = [
  { file: 'react.production.min.js', contents: "window.React = require('react');", plugins: [] },
  { file: 'react-dom.production.min.js', contents: "window.ReactDOM = Object.assign({}, require('react-dom'), require('react-dom/client'));", plugins: [windowReact] },
];
for (const { file, contents, plugins } of libs) await build({
  stdin: { contents, resolveDir: P, loader: 'js' }, bundle: true, format: 'iife', platform: 'browser', target: 'es2022',
  minify: true, legalComments: 'inline', define: { 'process.env.NODE_ENV': '"production"' }, plugins, outfile: path.join(D, 'lib', file), logLevel: 'warning',
});
console.log(`Built dist/ (v${version})`);

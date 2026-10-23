// Builds the components (src/) into dist/: index.js (ESM, React as a peer dependency), index.d.ts and
// serupa.iife.js (the browser script that reads window.React and sets window.Serupa). The CSS and the other
// files come from tools/build/build.mjs, which runs this first: npm run build.
import fs from 'node:fs';
import { defineConfig } from 'tsup';

const { version } = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const define = { __VERSION__: JSON.stringify(version) };

// In the browser script, react comes from the page: window.React.
const windowReact = {
  name: 'window-react',
  setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'window-react' }));
    build.onLoad({ filter: /.*/, namespace: 'window-react' }, () => ({ contents: 'module.exports = window.React;', loader: 'js' }));
  },
};

// SERUPA_BUILD=iife builds the browser script only (the icon test builds a scratch copy that way).
const only = process.env.SERUPA_BUILD;

export default defineConfig([
  ...(only === 'iife' ? [] : [{
    entry: { index: 'src/index.ts', icons: 'src/material/index.ts' },
    // The full icon set is one chunk shared by icons.js and index.js, which loads it only when a page draws a
    // name outside the built-in icons.
    splitting: true,
    format: ['esm'],
    outExtension: () => ({ js: '.js' }),
    target: 'es2019',
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom'],
    define,
  }]),
  ...[['serupa.iife', 'src/browser.ts'], ['serupa-icons.iife', 'src/browser-icons.ts']].map(([name, file]) => ({
    entry: { [name]: file },
    format: ['iife'],
    outExtension: () => ({ js: '.js' }),
    target: 'es2019',
    platform: 'browser',
    clean: false,
    define,
    esbuildPlugins: [windowReact],
    minify: name !== 'serupa.iife',
    banner: {
      js: name === 'serupa.iife' ? `/*! Serupa v${version} by Diki · components (needs React 18 or 19) · CHANGELOG.md */` : `/*! Serupa v${version} · every Material Symbol by name (load after serupa.iife.js) · Apache 2.0 */`,
    },
  })),
]);

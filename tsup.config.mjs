// Builds the components (src/) into dist/: index.js (ESM, React as a peer dependency), index.d.ts and
// diki.iife.js (the browser script that reads window.React and sets window.Diki). The CSS and the other
// files come from tools/build/build.mjs, which runs this first: npm run build.
import fs from 'node:fs';
import { defineConfig } from 'tsup';

const { version } = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const define = { __VERSION__: JSON.stringify(version) };
const COMPONENTS = ['Alert', 'Avatar', 'Badge', 'Button', 'Card', 'CardBody', 'CardFooter', 'CardHeader', 'Checkbox', 'Dialog', 'Fab', 'Field', 'Heading', 'Icon', 'IconButton', 'Input', 'Loader', 'Menu', 'MenuGroup', 'MenuItem', 'MenuSeparator', 'Radio', 'RadioGroup', 'Select', 'Switch', 'Tab', 'TabList', 'TabPanel', 'Tabs', 'Text', 'Textarea', 'Toaster', 'Tooltip'];

// In the browser script, react comes from the page: window.React.
const windowReact = {
  name: 'window-react',
  setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'window-react' }));
    build.onLoad({ filter: /.*/, namespace: 'window-react' }, () => ({ contents: 'module.exports = window.React;', loader: 'js' }));
  },
};

// DIKI_BUILD=iife builds the browser script only (the icon test builds a scratch copy that way).
const only = process.env.DIKI_BUILD;

export default defineConfig([
  ...(only === 'iife' ? [] : [{
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    outExtension: () => ({ js: '.js' }),
    target: 'es2019',
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom'],
    define,
  }]),
  {
    entry: { 'diki.iife': 'src/browser.ts' },
    format: ['iife'],
    outExtension: () => ({ js: '.js' }),
    target: 'es2019',
    platform: 'browser',
    clean: false,
    define,
    esbuildPlugins: [windowReact],
    banner: {
      js: `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: 'Diki', components: COMPONENTS.map((name) => ({ name })) })} */\n`
        + `/*! Diki Design System v${version} · components (needs React 18+) · CHANGELOG.md */`,
    },
  },
]);

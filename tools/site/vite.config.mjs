// The docs site (site/): a second home for the pages Storybook shows, built from the same files with Serupa's own
// components. Nothing is written twice: each page is the .mdx Storybook reads, with Storybook's doc blocks swapped
// for the site's (site/src/blocks.tsx), each example is a story, and each props table comes from the types.
//   npm run site         on your computer, at http://localhost:6007
//   npm run build-site   into site-static/ (what tools/test/site.mjs opens)
// It isn't published anywhere: there is no deploy step.
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import { Features } from 'lightningcss';
import { buildUtilities } from '../utilities/build.mjs';
import { buildRegistry, components } from '../build/registry.mjs';
import { sitePages } from './pages.mjs';
import { componentProps } from './props.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const SITE = path.join(ROOT, 'site');
const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// src/styles/index.css imports the generated utilities.css, and the docs' blocks the lists in src/generated/ and
// docs/generated/: make them first, as Storybook does.
buildUtilities(ROOT);
buildRegistry(ROOT);

const PAGES = 'virtual:site-pages', PROPS = 'virtual:site-props';

/** The site's own data: its page list, each component's props, and the stories' names for the doc blocks. */
function site() {
  /** @type {Promise<Awaited<ReturnType<typeof componentProps>>> | null} */
  let props = null;
  return {
    name: 'serupa-site',
    resolveId: (id) => (id === PAGES || id === PROPS || id.startsWith(PROPS + '/') ? '\0' + id : null),
    async load(id) {
      if (id === '\0' + PAGES) return `export default ${JSON.stringify(sitePages(ROOT))};`;
      // One chunk per component, fetched with its page.
      if (id === '\0' + PROPS) return `export default {${components(ROOT).map((n) => `${JSON.stringify(n)}: () => import(${JSON.stringify(`${PROPS}/${n}`)})`).join(', ')}};`;
      if (id.startsWith('\0' + PROPS + '/')) {
        props ||= componentProps(components(ROOT), ROOT);
        return `export default ${JSON.stringify((await props)[id.slice(PROPS.length + 2)] ?? [])};`;
      }
      return null;
    },
    // A stories file tells the site what it holds as it loads, so a doc block handed one story (<Canvas of={…} />)
    // can find its file's meta, its name and its source.
    transform(code, id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.stories.tsx') || id.includes('?')) return null;
      const rel = path.relative(ROOT, file).split(path.sep).join('/');
      // Each story's export name, the story, and the doc comment above it (what Storybook shows under its name).
      const list = [...code.matchAll(/^export const (\w+)\b/gm)].map((m) => {
        const before = code.slice(0, m.index).trimEnd();
        const doc = before.endsWith('*/') ? before.slice(before.lastIndexOf('/**')) : '';
        const description = doc.replace(/^\/\*\*\s?|\s*\*\/$/g, '').replace(/^\s*\* ?/gm, '').replace(/\s*\n\s*/g, ' ').trim();
        // typeof: a line of sample code inside a story's string can look like an export.
        return `[${JSON.stringify(m[1])}, typeof ${m[1]} === 'undefined' ? undefined : ${m[1]}, ${JSON.stringify(description)}]`;
      });
      return {
        code: `${code}\nimport { registerStories as __siteRegister } from ${JSON.stringify(path.join(SITE, 'src', 'stories.tsx').split(path.sep).join('/'))};\n`
          + `__siteRegister(${JSON.stringify(rel)}, meta, [${list.join(', ')}]);\n`,
        map: null,
      };
    },
    // The types changed: read the props again on the next request.
    handleHotUpdate({ file }) { if (/src[\\/]components[\\/].*\.tsx?$/.test(file) && !/\.(stories|test)\.tsx$/.test(file)) props = null; },
    // theme.js runs in <head>, before the first paint, so a visitor with a dark system never sees a light page first.
    transformIndexHtml: (html) => html.replace('<!-- theme.js -->', () => `<script>${fs.readFileSync(path.join(ROOT, 'src', 'theme.js'), 'utf8').replaceAll('__VERSION__', version)}</script>`),
  };
}

export default defineConfig({
  root: SITE,
  // The folder the site is served from, for a host that doesn't serve it from its root.
  base: process.env.SERUPA_SITE_BASE || '/',
  publicDir: false,
  // Only .mdx is a page: a README.md is read as text (?raw), as Storybook reads it.
  plugins: [{ enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm], mdExtensions: [] }) }, site()],
  resolve: {
    alias: [
      // The pages import Storybook's doc blocks; here they get the site's, with the same names.
      { find: '@storybook/addon-docs/blocks', replacement: path.join(SITE, 'src', 'blocks.tsx') },
      // A stories file's icon control lists every icon, 3 MB the site has no controls to use for.
      { find: /^.*\/\.storybook\/icon-arg$/, replacement: path.join(SITE, 'src', 'icon-arg.ts') },
    ],
  },
  define: { __VERSION__: JSON.stringify(version) },
  // Keep :dir(rtl) as the package ships it (see .storybook/main.ts).
  css: { lightningcss: { exclude: Features.DirSelector } },
  build: {
    outDir: path.join(ROOT, 'site-static'), emptyOutDir: true, chunkSizeWarningLimit: 4000,
    // The components say "use client" for React Server Components; in one browser bundle the line means nothing.
    rolldownOptions: { onLog: (level, log, handler) => { if (log.code !== 'MODULE_LEVEL_DIRECTIVE') handler(level, log); } },
  },
  server: { port: 6007, fs: { allow: [ROOT] } },
  preview: { port: 6007 },
});

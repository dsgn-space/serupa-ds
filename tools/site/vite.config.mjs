// The docs site (site/): a second home for the pages Storybook shows, built from the same files with Serupa's own
// components. Nothing is written twice: each page is the .mdx Storybook reads, with Storybook's doc blocks swapped
// for the site's (site/src/blocks.tsx), each example is a story, and each props table comes from the types.
//   npm run site         on your computer, at http://localhost:6007
//   npm run build-site   into site-static/ (what tools/test/site.mjs opens), with what a host needs to serve it as a
//                        website (tools/site/host.mjs): a page per address, 404.html, _headers, the sitemap
// Cloudflare Pages can serve it (tools/README.md, "The docs site"): set SERUPA_SITE_URL there to the site's address.
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import { Features } from 'lightningcss';
import postcss from 'postcss';
import { buildUtilities } from '../utilities/build.mjs';
import { buildRegistry, components } from '../build/registry.mjs';
import { sitePages } from './pages.mjs';
import { describe, DEFAULT_DESCRIPTION } from './head.mjs';
import { componentProps } from './props.mjs';
import { siteFacts } from './facts.mjs';
import { writeHostFiles } from './host.mjs';
import { drawPages } from './prerender.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const SITE = path.join(ROOT, 'site');
const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// src/styles/index.css imports the generated utilities.css, and the docs' blocks the lists in src/generated/ and
// docs/generated/: make them first, as Storybook does.
buildUtilities(ROOT);
buildRegistry(ROOT);

// A value as JavaScript source for a module this file writes: JSON, with the characters that could end a script or a
// line written as escapes, so text from a page or a doc comment stays text whatever it holds.
const js = (value) => JSON.stringify(value).replace(/[<>\u2028\u2029]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

const PAGES = 'virtual:site-pages', PROPS = 'virtual:site-props', FACTS = 'virtual:site-facts';

// The utility classes the site's pages use, out of the 25,000 utilities.css has (1.8 MB, most of the site's stylesheet):
// a class is kept when its name is written anywhere the site draws from (the stories, the pages, the guides, the
// blocks, the components and the site's own files), as a word in the source, so nothing the pages show loses its look.
// Only for the build: `npm run site` keeps every class.
// What separates the words a class name could be: anything a class can't hold.
const WORD_GAP = /[^\w:./[\]%#!@-]+/;
const SCANNED = ['src', 'docs', 'site/src', '.storybook'].map((d) => path.join(ROOT, d));
function usedWords() {
  const words = new Set();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, e.name);
      if (e.isDirectory()) walk(file);
      else if (/\.(tsx?|mdx?|json)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) for (const w of fs.readFileSync(file, 'utf8').split(WORD_GAP)) words.add(w);
    }
  };
  for (const dir of SCANNED) walk(dir);
  for (const file of ['README.md', 'docs/foundations.md']) if (fs.existsSync(path.join(ROOT, file))) for (const w of fs.readFileSync(path.join(ROOT, file), 'utf8').split(WORD_GAP)) words.add(w);
  return words;
}
/** utilities.css with only the classes the site uses. */
export function usedUtilities(css, words = usedWords()) {
  const tree = postcss.parse(css);
  tree.walkRules((rule) => {
    const classes = [...rule.selector.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => m[1].replace(/\\(.)/g, '$1'));
    if (classes.length && !classes.some((c) => words.has(c))) rule.remove();
  });
  // An at-rule (a layer, a breakpoint) left with nothing in it goes too.
  tree.walkAtRules((at) => { if (at.nodes && !at.nodes.length) at.remove(); });
  tree.walkAtRules((at) => { if (at.nodes && !at.nodes.length) at.remove(); });
  return tree.toString();
}
function utilities() {
  // The stylesheets' @imports are joined without passing through plugins, so the classes go in where index.css
  // imports them, already cut down.
  const file = path.join(ROOT, 'src', 'styles', 'utilities.css');
  return {
    name: 'serupa-site-utilities',
    enforce: /** @type {const} */ ('pre'),
    apply: /** @type {const} */ ('build'),
    transform(code, id) {
      if (id.split('?')[0] !== path.join(ROOT, 'src', 'styles', 'index.css')) return null;
      const at = '@import "./utilities.css";';
      if (!code.includes(at)) throw new Error(`src/styles/index.css no longer has ${at}: tools/site/vite.config.mjs cuts it down for the site`);
      return { code: code.replace(at, usedUtilities(fs.readFileSync(file, 'utf8'))), map: null };
    },
  };
}

/** The site's own data: its page list, each component's props, and the stories' names for the doc blocks. */
function site() {
  /** @type {Promise<Awaited<ReturnType<typeof componentProps>>> | null} */
  let props = null;
  return {
    name: 'serupa-site',
    resolveId: (id) => (id === PAGES || id === FACTS || id === PROPS || id.startsWith(PROPS + '/') ? '\0' + id : null),
    async load(id) {
      // A page with no guide of its own (a pattern, a block, a foundation) shows on its index card what its <meta>
      // description says, so every card in a grid has its line.
      if (id === '\0' + PAGES) return `export default ${js(sitePages(ROOT).map((p) => ({ ...p, summary: p.summary || (describe(p, ROOT) === DEFAULT_DESCRIPTION ? '' : describe(p, ROOT)) })))};`;
      if (id === '\0' + FACTS) return `export default ${js(siteFacts(ROOT))};`;
      // One chunk per component, fetched with its page.
      if (id === '\0' + PROPS) return `export default {${components(ROOT).map((n) => `${js(n)}: () => import(${js(`${PROPS}/${n}`)})`).join(', ')}};`;
      if (id.startsWith('\0' + PROPS + '/')) {
        props ||= componentProps(components(ROOT), ROOT);
        return `export default ${js((await props)[id.slice(PROPS.length + 2)] ?? [])};`;
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
        return `[${js(m[1])}, typeof ${m[1]} === 'undefined' ? undefined : ${m[1]}, ${js(description)}]`;
      });
      return {
        code: `${code}\nimport { registerStories as __siteRegister } from ${js(path.join(SITE, 'src', 'stories.tsx').split(path.sep).join('/'))};\n`
          + `__siteRegister(${js(rel)}, meta, [${list.join(', ')}]);\n`,
        map: null,
      };
    },
    // The types changed: read the props again on the next request.
    handleHotUpdate({ file }) { if (/src[\\/]components[\\/].*\.tsx?$/.test(file) && !/\.(stories|test)\.tsx$/.test(file)) props = null; },
    // theme.js runs in <head>, before the first paint, so a visitor with a dark system never sees a light page first.
    transformIndexHtml: (html) => html.replace('<!-- theme.js -->', () => `<script>${fs.readFileSync(path.join(ROOT, 'src', 'theme.js'), 'utf8').replaceAll('__VERSION__', version)}</script>`),
  };
}

/** After the build: a page per address with its own head and the page drawn into it, 404.html, the host's headers and
 *  the sitemap. Not for the second build that draws the pages (prerender.mjs), which runs in Node. */
function host() {
  let base = '/', mode = 'production', ssr = false;
  return {
    name: 'serupa-site-host',
    apply: 'build',
    configResolved(config) { base = config.base; mode = config.mode; ssr = !!config.build.ssr; },
    async writeBundle(options) {
      if (ssr) return;
      writeHostFiles(/** @type {string} */ (options.dir), { base, siteUrl: process.env.SERUPA_SITE_URL || '', root: ROOT,
        draw: (paths) => drawPages(import.meta.filename, mode, paths) });
    },
  };
}

export default defineConfig({
  root: SITE,
  // The folder the site is served from, for a host that doesn't serve it from its root.
  base: process.env.SERUPA_SITE_BASE || '/',
  // The icons, the web manifest and the link-preview picture, copied as they are.
  publicDir: path.join(SITE, 'public'),
  // Only .mdx is a page: a README.md is read as text (?raw), as Storybook reads it.
  plugins: [{ enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm], mdExtensions: [] }) }, utilities(), site(), host()],
  resolve: {
    alias: [
      // The pages import Storybook's doc blocks; here they get the site's, with the same names.
      { find: '@storybook/addon-docs/blocks', replacement: path.join(SITE, 'src', 'blocks.tsx') },
      // A stories file's icon control lists every icon, 3 MB the site has no controls to use for.
      { find: /^.*\/\.storybook\/icon-arg$/, replacement: path.join(SITE, 'src', 'icon-arg.ts') },
    ],
  },
  define: { __VERSION__: js(version) },
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

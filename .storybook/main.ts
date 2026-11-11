// Before anything loads TypeScript: react-docgen-typescript (the props tables below) needs TypeScript 6's compiler API.
import '../tools/typescript/api.mjs';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';
import { buildUtilities } from '../tools/utilities/build.mjs';
import { buildRegistry } from '../tools/build/registry.mjs';

// src/styles/index.css imports the generated utilities.css; make it from the template and tokens first.
buildUtilities(fileURLToPath(new URL('..', import.meta.url)));
// …and the export, style and label lists from the component folders (src/generated/).
buildRegistry(fileURLToPath(new URL('..', import.meta.url)));

// Storybook is the system's documentation: npm run storybook (on your computer), npm run build-storybook (CI).
const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../docs/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.tsx'],
  // The docs pages write their tables in Markdown ("| Block | Use it for |"), which is GitHub's extension, not
  // CommonMark: without remark-gfm, MDX 3 printed them as raw text.
  addons: ['@storybook/addon-a11y', { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } }],
  core: { disableTelemetry: true },
  docs: { defaultName: 'Docs' },
  // The props tables (<Controls /> on each Docs page) come from the TypeScript types and their TSDoc, inherited and
  // imported props included. react-docgen, the default, reads only an interface in the same file, so most tables
  // were empty. React's own DOM attributes stay out: every component takes them, and they'd bury its own props.
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // The components only (tsconfig.json's project, src/): the docs' own blocks and Storybook's preview have no props
      // table, and outside that project the plugin skipped them with a warning each.
      include: ['src/**/*.tsx'],
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        // A tag in the TSDoc ("renders a <button>") is code here, not HTML the docs page should render.
        prop.description = prop.description.replace(/(?<!`)<\/?[a-z][\w-]*(?:\s[^<>]*)?>(?!`)/g, '`$&`');
        // Props typed only as undefined (href on the <button> form of Button) exist to rule a combination out, and
        // @internal ones (Calendar's plumbing for DateRangePicker) aren't in the package's public types.
        return prop.type.name !== 'undefined' && !('internal' in (prop.tags ?? {})) && (!prop.parent || !/node_modules/.test(prop.parent.fileName));
      },
    },
  },
  viteFinal: async (cfg) => {
    // The source reads the version from package.json at build time, as tsup does.
    const { readFileSync } = await import('node:fs');
    const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    cfg.define = { ...(cfg.define || {}), __VERSION__: JSON.stringify(version) };
    // Vite's CSS minifier (Lightning CSS) rewrites :dir(rtl) as a list of right-to-left :lang()s for older browsers,
    // so a page with dir="rtl" but no such lang wouldn't flip its chevrons and arrows. Keep :dir() as the package ships it.
    const { Features } = await import('lightningcss');
    cfg.css = { ...cfg.css, lightningcss: { ...cfg.css?.lightningcss, exclude: (cfg.css?.lightningcss?.exclude ?? 0) | Features.DirSelector } };
    return cfg;
  },
};
export default config;

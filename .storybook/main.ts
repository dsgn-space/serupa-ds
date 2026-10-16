import type { StorybookConfig } from '@storybook/react-vite';

// Storybook is the system's documentation: npm run storybook (on your computer), npm run build-storybook (CI).
const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../docs/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  docs: { defaultName: 'Docs' },
  viteFinal: async (cfg) => {
    // The source reads the version from package.json at build time, as tsup does.
    const { readFileSync } = await import('node:fs');
    const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    cfg.define = { ...(cfg.define || {}), __VERSION__: JSON.stringify(version) };
    return cfg;
  },
};
export default config;

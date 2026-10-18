// npm run test:unit (once) or npm run test:watch: the component tests next to each component
// (src/components/<Name>/<Name>.test.tsx), run in a real Chromium through Playwright so computed styles,
// focus and keyboard behave as they do for people.
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { buildUtilities } from './tools/utilities/build.mjs';

const { version } = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
// src/styles/index.css imports the generated utilities.css; make it from the template and tokens first.
buildUtilities(new URL('.', import.meta.url).pathname);

export default defineConfig({
  define: { __VERSION__: JSON.stringify(version) },
  test: {
    include: ['src/**/*.test.tsx'],
    setupFiles: ['./tools/test/vitest/setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      // SERUPA_BROWSER=firefox|webkit runs them in that engine, like the rest of the suite (run.mjs --browser).
      instances: [{ browser: (process.env.SERUPA_BROWSER as 'chromium' | 'firefox' | 'webkit') || 'chromium' }],
      viewport: { width: 900, height: 700 },
    },
  },
});

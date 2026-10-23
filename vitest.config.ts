// npm run test:unit (once) or npm run test:watch: the component tests next to each component
// (src/components/<Name>/<Name>.test.tsx), run in a real Chromium through Playwright so computed styles,
// focus and keyboard behave as they do for people.
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { buildUtilities } from './tools/utilities/build.mjs';
import { pointerDown, pointerDrag, pointerUp } from './tools/test/vitest/commands';

const { version } = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
// src/styles/index.css imports the generated utilities.css; make it from the template and tokens first.
buildUtilities(new URL('.', import.meta.url).pathname);

export default defineConfig({
  define: { __VERSION__: JSON.stringify(version) },
  // The modern JSX runtime, as apps build with. tsconfig's "jsx": "react" (classic, for the package build) would
  // make React 19 warn "outdated JSX transform" in dev, which the tests that fail on a console warning catch.
  oxc: { jsx: { runtime: 'automatic' } },
  // Bundled up front: found mid-run, Vite re-optimizes and reloads, failing the test files already loading.
  optimizeDeps: { include: ['react/jsx-dev-runtime', 'react/jsx-runtime'] },
  plugins: [{
    // /__slow-picture__.svg answers after a second, so a test can see a picture while it loads in every engine
    // (lazy loading below the fold can't do that: each engine starts lazy pictures at its own distance).
    name: 'slow-picture',
    configureServer(server) {
      server.middlewares.use('/__slow-picture__.svg', (_req, res) => setTimeout(() => {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-store');
        res.end('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#3b82f6"/></svg>');
      }, 1000));
    },
  }],
  test: {
    include: ['src/**/*.test.tsx'],
    setupFiles: ['./tools/test/vitest/setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      // In Firefox the test files run side by side in frames of one page, and so share its one mouse: a hover in
      // one file landed in the middle of a drag in another. One file at a time there.
      fileParallelism: process.env.SERUPA_BROWSER !== 'firefox',
      // SERUPA_BROWSER=firefox|webkit runs them in that engine, like the rest of the suite (run.mjs --browser).
      instances: [{ browser: (process.env.SERUPA_BROWSER as 'chromium' | 'firefox' | 'webkit') || 'chromium' }],
      viewport: { width: 900, height: 700 },
      commands: { pointerDrag, pointerDown, pointerUp },
    },
    // npm run test:coverage: which lines of src/ the component tests run (V8, in Chromium), written to coverage/
    // (index.html to browse, coverage-summary.json for CI). Only the components with a <Name>.test.tsx count yet.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.stories.tsx', 'src/material/**', 'src/**/*.d.ts'],
      reporter: ['text-summary', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
    },
  },
});

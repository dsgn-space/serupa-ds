// Two projects:
// - components (npm run test:unit, or npm run test:watch): the tests next to each component
//   (src/components/<Name>/<Name>.test.tsx), run in a real Chromium through Playwright so computed styles,
//   focus and keyboard behave as they do for people.
// - checks (npm run test:checks): the scripts in tools/test/ that check the package, tokens, icons, guides and
//   API in Node, each result a test. Build first (npm run build). Each still runs alone with node, too.
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { configDefaults, defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { buildUtilities } from './tools/utilities/build.mjs';
import { buildRegistry } from './tools/build/registry.mjs';
import { TOUCH } from './tools/test/vitest/touch.ts';
import { ariaMode, ariaSnapshot, coarsePointer, forcedColors, pointerDown, pointerDrag, pointerUp, printMedia, recordBench, writeAriaBaseline } from './tools/test/vitest/commands.ts';

const { version } = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
// src/styles/index.css imports the generated utilities.css; make it from the template and tokens first.
buildUtilities(fileURLToPath(new URL('.', import.meta.url)));
// …and the export, style and label lists from the component folders (src/generated/).
buildRegistry(fileURLToPath(new URL('.', import.meta.url)));

const BROWSER = (process.env.SERUPA_BROWSER as 'chromium' | 'firefox' | 'webkit') || 'chromium';

export default defineConfig({
  define: { __VERSION__: JSON.stringify(version) },
  // The modern JSX runtime, as apps build with. tsconfig's "jsx": "react" (classic, for the package build) would
  // make React 19 warn "outdated JSX transform" in dev, which the tests that fail on a console warning catch.
  oxc: { jsx: { runtime: 'automatic' } },
  // Bundled up front: found mid-run, Vite re-optimizes and reloads, failing the test files already loading.
  optimizeDeps: { include: ['react/jsx-dev-runtime', 'react/jsx-runtime', 'axe-core'] },
  // No file watcher in CI: a run never re-runs on a change, and the watcher walks the whole checkout, npm's cache
  // (.npm/) included. With 28 jobs on one runner it ran the host out of inotify handles: EMFILE on every file, 4 MB of
  // log, and a failed shard on main (pipeline 3053377020, 11 Nov 2026).
  server: { watch: process.env.CI ? null : { ignored: ['**/.npm/**'] } },
  plugins: [{
    // /__slow-picture__.svg answers after a second, so a test can see a picture while it loads in every engine
    // (lazy loading below the fold can't do that: each engine starts lazy pictures at its own distance). With
    // ?broken it answers with something that isn't a picture, so the picture fails a second late.
    name: 'slow-picture',
    configureServer(server) {
      server.middlewares.use('/__slow-picture__.svg', (req, res) => setTimeout(() => {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-store');
        if (req.url?.includes('broken')) { res.end('not a picture'); return; }
        res.end('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#3b82f6"/></svg>');
      }, 1000));
    },
  }],
  test: {
    projects: [{
      extends: true,
      test: {
        name: 'components',
        include: ['src/**/*.test.tsx'],
        // Files and the tests in each run in a random order (Vitest prints the seed; --sequence.seed=<n> repeats
        // one), so no test can lean on what the one before it left behind.
        sequence: { shuffle: true },
        setupFiles: ['./tools/test/vitest/setup.ts'],
        // Every story rendered to HTML in Node first, for the hydration check (src/internal/hydrateStories.test.tsx).
        globalSetup: ['./tools/test/vitest/serverStories.ts'],
        // SERUPA_ONLY (run.mjs --since): the story-wide tests go through only these components' stories (storiesToRun).
        // SERUPA_BENCH (the nightly Benchmarks run): mountTime.test.tsx mounts each story more times.
        // SERUPA_COVERAGE (CI's full runs): the code is instrumented, so the time budgets allow for it.
        provide: { only: process.env.SERUPA_ONLY ?? null, bench: !!process.env.SERUPA_BENCH, coverage: !!process.env.SERUPA_COVERAGE },
        // In Firefox the test files run side by side in frames of one page, and so share its one mouse: a hover in
        // one file landed in the middle of a drag in another. One file at a time there.
        fileParallelism: process.env.SERUPA_BROWSER !== 'firefox',
        // With coverage on (CI's full runs and the nightly), V8 collects for the whole shared page between tests, and on
        // a busy runner that can stall a test of 80 ms past the default limit (T6: CommandPalette's "limit caps the rows"
        // and Chat's six-theme contrast). Only the time limit moves; every assertion still holds.
        ...(process.env.SERUPA_COVERAGE ? { testTimeout: 60_000 } : {}),
        browser: {
          enabled: true,
          headless: true,
          // Headless Firefox finds no pointing device and reports (hover: none), so hover styles (all behind
          // @media (hover: hover)) would never apply. Give it a desktop's fine, hovering pointer, as lib.mjs does.
          provider: playwright({
            ...(process.env.SERUPA_BROWSER === 'firefox' ? { launchOptions: { firefoxUserPrefs: { 'ui.primaryPointerCapabilities': 6, 'ui.allPointerCapabilities': 6 } } } : {}),
            // SERUPA_LOCALE=ar runs them with the browser in that language (navigator.language and Intl's default
            // locale), so nothing reads the default and quietly expects English (run.mjs --locale).
            ...(process.env.SERUPA_LOCALE ? { contextOptions: { locale: process.env.SERUPA_LOCALE } } : {}),
          }),
          // SERUPA_BROWSER=firefox|webkit runs them in that engine, like the rest of the suite (run.mjs --browser).
          // Two instances of the one browser, so the files that make the page a touch screen get pages of their own.
          // Headless Chromium only has a hovering mouse because Playwright launches it with --blink-settings
          // (primaryHoverType and the rest), and turning DevTools touch emulation off puts back the device's own
          // values, not those: (hover: hover) stays false for the rest of that page. Every later file in it then
          // lost its :hover styles (Button and Table hover tests failing together in a long run).
          instances: [
            { browser: BROWSER, exclude: [...configDefaults.exclude, ...TOUCH] },
            { browser: BROWSER, name: `components (${BROWSER}, touch)`, include: TOUCH },
          ],
          viewport: { width: 900, height: 700 },
          commands: { pointerDrag, pointerDown, pointerUp, forcedColors, coarsePointer, printMedia, ariaSnapshot, ariaMode, writeAriaBaseline, recordBench },
        },
      },
    }, {
      test: {
        name: 'checks',
        include: ['tools/test/*.mjs'],
        // Shared code, the cross-browser comparison (npm run test:safari), the visual and Storybook steps, which
        // run.mjs shards across CI jobs, the install on older Node (consumer.mjs, its own CI job) and the framework
        // apps (frameworks.mjs, its own CI job; pack.mjs is shared by the two) and the mutation run (mutation.mjs,
        // nightly: it starts a components Vitest of its own), and the proof brand's leak report (proof-brand.mjs, a
        // report on demand, not a check).
        // In Firefox and WebKit (the nightly Cross-browser run), also the checks that are Chromium's by design (GR135):
        // scroll-lock.mjs needs Chromium's switch that shows classic scrollbars, and utilities.mjs compares each
        // class's computed styles with Chromium's baseline, which other engines write differently (538px for 539px);
        // tools/test/compat.mjs is the comparison between engines.
        exclude: ['tools/test/{lib,run,webdriver,compat,visual,storybook,consumer,frameworks,pack,screen-reader,mutation,proof-brand}.mjs', ...(BROWSER === 'chromium' ? [] : ['tools/test/{scroll-lock,utilities}.mjs'])],
        environment: 'node',
        // Several write their pages to the one .test-tmp/ folder and remove it when done: one file at a time.
        fileParallelism: false,
      },
    }],
    // npm run test:coverage: which lines of src/ the component tests run (V8, in Chromium), written to coverage/
    // (index.html to browse, coverage-summary.json for CI). Only the components with a <Name>.test.tsx count yet.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // src/browser*.ts are the plain-page scripts' entries (serupa.iife.js, serupa-icons.iife.js): nothing imports them
      // here, and tools/test/icon-names.mjs checks them as built, on a page. src/labels/ holds the language packs, which
      // no component imports: tools/test/label-packs.mjs builds each one and says every word of it.
      exclude: ['src/**/*.test.tsx', 'src/**/*.stories.tsx', 'src/material/**', 'src/**/*.d.ts', 'src/browser*.ts', 'src/labels/**'],
      // json (coverage-final.json): each function's line, for the coverage job's added-functions check on a pull request.
      reporter: ['text-summary', 'html', 'json-summary', 'json'],
      reportsDirectory: 'coverage',
      // Floors a little under the full run's figures on 25 Oct 2026 (96.2 / 88.6 / 98.9 / 99.6 %), so a change
      // that drops coverage fails. Raise them by hand when the figures climb; they never go down.
      // A CI shard (SERUPA_SHARD) runs a third of the files, so its own figures mean nothing: the floors are checked on
      // the shards' merged report (the coverage job, vitest --merge-reports).
      // SERUPA_NO_FLOORS: a narrowed pull request's report (the coverage job), which leaves most of src/ unrun on purpose.
      ...(process.env.SERUPA_SHARD || process.env.SERUPA_NO_FLOORS ? {} : { thresholds: { statements: 95.5, branches: 88, functions: 98.5, lines: 99.3 } }),
    },
  },
});

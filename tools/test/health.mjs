// The Health page's numbers (17): tools/health.mjs lists every component folder once with its status as the registry
// reads it, counts its tests and stories, takes its size budgets and the compiler's skip list, folds a coverage summary,
// the Storybook check's axe results and the measured sizes into each folder, reads the latest releases from
// CHANGELOG.md, and writes a Markdown row per component for the nightly's summary page. Its run inputs are made up
// here, so the check needs no run.
//   node tools/test/health.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';
import { collectHealth, healthMarkdown, releases } from '../health.mjs';
import { components, status } from '../build/registry.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-health-'));
const write = (f, o) => { fs.writeFileSync(path.join(tmp, f), JSON.stringify(o)); return path.join(tmp, f); };
const names = components(PROJECT).filter((n) => fs.existsSync(path.join(PROJECT, 'src', 'components', n, 'index.ts')));
const [a, b] = names;

const plain = collectHealth(PROJECT);
t(`every component folder once, A to Z, with its status as the registry reads it (${plain.components.length})`,
  plain.components.map((c) => c.name).join() === names.join() && plain.components.every((c) => c.status === status(c.name, PROJECT)));
const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
t('the repository-only file says so, has no date (it would change on every build) and carries the package version',
  plain.made.by === 'repository' && plain.made.at === null && plain.version === pkg.version);
const testless = plain.components.filter((c) => fs.existsSync(path.join(PROJECT, 'src', 'components', c.name, `${c.name}.test.tsx`)) && !c.tests);
t('each component with a test file has its tests counted, and the totals add up', !testless.length && plain.totals.tests === plain.components.reduce((s, c) => s + c.tests, 0) && plain.totals.tests > 1000,
  testless.map((c) => c.name).join(', '));
const skipList = fs.readFileSync(path.join(PROJECT, 'tools', 'test', 'baseline-compiler-skips.txt'), 'utf8').split('\n').filter((l) => /^src\/components\//.test(l));
t('every function on the compiler\'s skip list is on its component', plain.components.reduce((s, c) => s + c.compilerSkipped.length, 0) === skipList.length, `${skipList.length} on the list`);
const unbudgeted = plain.components.filter((c) => !c.size.budget);
t('each component has its size budget', !unbudgeted.length, unbudgeted.map((c) => c.name).join(', '));
const rb = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tools', 'test', 'render-budgets.json'), 'utf8'));
const phone = plain.components.find((c) => c.name === 'PhoneInput'), plainOne = plain.components.find((c) => !Object.keys(rb.ownMount).some((k) => k.startsWith(`${c.name}/`)));
t('each component has the render budgets its stories are held to, the highest of a story\'s own among them (PhoneInput\'s ByArea)',
  plain.components.every((c) => c.render.mount === rb.mount && c.render.update === rb.update) && phone?.render.mountMost === Math.max(...Object.values(rb.ownMount)) && plainOne?.render.mountMost === rb.mount,
  JSON.stringify(phone?.render));
t('no run results in a repository-only file', plain.totals.coverage === null && plain.totals.a11y === null && plain.issues === null && plain.components.every((c) => !c.coverage && !c.a11y && !c.size.measured));

// A run's results, made up: two files of the first component, one of the second, and stories of both.
const root = '/__w/serupa-ds/serupa-ds';
const cov = write('coverage.json', {
  total: { lines: { pct: 99.1 }, functions: { pct: 98.7 }, branches: { pct: 88.4 }, statements: { pct: 96 } },
  [`${root}/src/components/${a}/${a}.tsx`]: { lines: { total: 100, covered: 90 }, functions: { total: 10, covered: 10 }, branches: { total: 20, covered: 10 } },
  [`${root}/src/components/${a}/helpers.ts`]: { lines: { total: 100, covered: 100 }, functions: { total: 10, covered: 9 }, branches: { total: 20, covered: 20 } },
  [`${root}/src/components/${b}/${b}.tsx`]: { lines: { total: 50, covered: 25 }, functions: { total: 4, covered: 4 }, branches: { total: 0, covered: 0 } },
  [`${root}/src/internal/x.ts`]: { lines: { total: 10, covered: 0 }, functions: { total: 1, covered: 0 }, branches: { total: 0, covered: 0 } },
});
const ax = write('a11y.json', { runs: ['blue-light'], stories: [
  { name: 'one', ok: true, file: `src/components/${a}/${a}.stories.tsx` },
  { name: 'two', ok: false, detail: 'blue-dark: color-contrast (.x)', file: `src/components/${a}/${a}.stories.tsx` },
  { name: 'three', ok: true, file: `src/components/${b}/${b}.stories.tsx` },
], docs: [{ name: 'docs · Health · axe', ok: true }] });
const size = write('size.json', { totals: { 'index.js': 300000 }, starter: 20000, alone: { [a]: 4096 }, css: { [a]: 1024 } });
const run = collectHealth(PROJECT, { coverage: cov, size, a11y: ax, issues: { open: 2, url: 'https://github.com/x/y/issues', labels: { bug: 2 }, newest: [] } });
const ca = run.components.find((c) => c.name === a), cb = run.components.find((c) => c.name === b);
t('coverage is summed over each component\'s files (95% of lines from 90 of 100 and 100 of 100), and shared code stays out',
  ca.coverage?.lines === 95 && ca.coverage.functions === 95 && ca.coverage.branches === 75 && cb.coverage?.lines === 50 && cb.coverage.branches === null && run.totals.coverage?.lines === 99.1,
  JSON.stringify([ca.coverage, cb.coverage]));
t('the axe results are counted by component, with the failing story named', ca.a11y?.stories === 2 && ca.a11y.passed === 1 && /two: blue-dark: color-contrast/.test(ca.a11y.problems[0]) && cb.a11y?.passed === 1 && run.totals.a11y?.stories === 3 && run.totals.a11y.passed === 2 && run.totals.a11y.docsPassed === 1,
  JSON.stringify(ca.a11y));
t('the measured sizes join the budgets', ca.size.measured?.alone === 4096 && ca.size.measured.css === 1024 && cb.size.measured?.alone === null && run.totals.starter === 20000);
const md = healthMarkdown(run);
t('the summary page has the figures and a row per component', run.components.every((c) => md.includes(`\n| ${c.name} | ${c.status} |`)) && /lines 99\.1%/.test(md) && /2 of 3 stories/.test(md) && /\[2\]\(https:\/\/github\.com\/x\/y\/issues\)/.test(md));

// Releases, from CHANGELOG.md and from a made-up one
const log = '# Changelog\n\n## [Unreleased]\n\n## [2.0.0] - 2026-01-02\n\n### Removed\n\n- a\n- b\n\n### Fixed\n\n- c\n\n## [1.1.0] - 2026-01-01\n\n### Added\n\n- d\n';
const rs = releases(log);
t('the releases come newest first, with their dates, their entries by kind and whether they break',
  rs.length === 2 && rs[0].version === '2.0.0' && rs[0].date === '2026-01-02' && rs[0].breaking && rs[0].sections.Removed === 2 && rs[0].sections.Fixed === 1 && rs[1].sections.Added === 1 && !rs[1].breaking,
  JSON.stringify(rs));
const latest = /^## \[(\d[^\]]*)\]/m.exec(fs.readFileSync(path.join(PROJECT, 'CHANGELOG.md'), 'utf8'))?.[1];
t(`CHANGELOG.md's latest release leads (${latest})`, plain.releases[0]?.version === latest && plain.releases.length >= 3);

// The page draws each part
const page = fs.readFileSync(path.join(PROJECT, 'docs', 'Health.mdx'), 'utf8');
const blocks = fs.readFileSync(path.join(PROJECT, 'docs', 'health.tsx'), 'utf8');
const used = [...page.matchAll(/<(Health\w+) \/>/g)].map((m) => m[1]);
const missingBlocks = used.filter((n) => !new RegExp(`export function ${n}\\b`).test(blocks));
t('docs/Health.mdx draws each part from docs/health.tsx', used.length >= 4 && !missingBlocks.length, missingBlocks.join(', '));

fs.rmSync(tmp, { recursive: true, force: true });
done(report('Health', R));

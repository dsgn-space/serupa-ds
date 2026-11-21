// The design system's health (17), for the Health docs page (docs/Health.mdx) and the nightly run's summary: per
// component its tests, stories, size, test coverage, accessibility results and whether the React Compiler skips any of
// it, with the open issues and the latest releases. Writes docs/generated/health.json (not committed).
//
// What the repository holds is always there: the component folders, their tests and stories, the size budgets
// (tools/test/baseline-size/), the compiler's skip list (tools/test/baseline-compiler-skips.txt), the role and name
// baselines (tools/test/baseline-aria/), the conformance report (docs/acr.json) and CHANGELOG.md. A run's own results
// join it when they are given (the nightly's health job, .github/workflows/nightly.yml, gives them all):
//   --coverage coverage/coverage-summary.json   the component tests' coverage (npm run test:coverage), by folder
//   --size size.json                           the measured sizes (node tools/test/size.mjs --json size.json)
//   --a11y a11y.json                           the Storybook check's axe results, story by story
//                                              (SERUPA_A11Y_JSON=a11y.json node tools/test/storybook.mjs)
//   --issues                                   the open issues, from GitHub (GH_TOKEN, GITHUB_REPOSITORY)
//   --summary                                  also appends the health to the run's summary page ($GITHUB_STEP_SUMMARY)
//   --from-nightly                             fetches the last nightly's health.json instead (gh, signed in), so the
//                                              page on your computer shows the full numbers
//   node tools/health.mjs [--out file]
// Storybook and the docs site write the repository-only file as they start, unless one from a run is there.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { components as folders, status as statusOf } from './build/registry.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
export const HEALTH_FILE = path.join('docs', 'generated', 'health.json');
const RELEASES = 6;
const ISSUES = 10;

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const exists = (f) => !!f && fs.existsSync(f);
const pct = (covered, total) => (total ? Math.round((covered / total) * 1000) / 10 : null);

const count = (file, re) => (fs.existsSync(file) ? (fs.readFileSync(file, 'utf8').match(re) || []).length : 0);

/** Each component's budgets, the highest of its Name.json and raise files (tools/test/lib.mjs sizeBudgets). */
function budgets(root) {
  const dir = path.join(root, 'tools', 'test', 'baseline-size');
  const out = {};
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const m = /^([A-Z]\w*)(?:\.[\w-]+)?\.json$/.exec(f);
    if (!m) continue;
    const cur = (out[m[1]] ||= {});
    for (const [k, v] of Object.entries(readJson(path.join(dir, f)))) cur[k] = Math.max(cur[k] ?? -Infinity, v);
  }
  return out;
}

/** The compiler's skip list: each component's functions the React Compiler leaves as they are. */
function compilerSkips(root) {
  const f = path.join(root, 'tools', 'test', 'baseline-compiler-skips.txt');
  const out = {};
  for (const line of exists(f) ? fs.readFileSync(f, 'utf8').split('\n') : []) {
    const m = /^src\/components\/(\w+)\/\S+\s+(\w+)/.exec(line.trim());
    if (m) (out[m[1]] ||= []).push(m[2]);
  }
  return out;
}

/** Coverage by component folder, from coverage-summary.json (absolute or relative file paths). */
function coverageByFolder(summary) {
  const sums = {};
  for (const [file, c] of Object.entries(summary)) {
    const m = /src[\\/]components[\\/](\w+)[\\/]/.exec(file);
    if (!m || file === 'total') continue;
    const s = (sums[m[1]] ||= { lines: [0, 0], functions: [0, 0], branches: [0, 0] });
    for (const k of Object.keys(s)) { s[k][0] += c[k]?.covered || 0; s[k][1] += c[k]?.total || 0; }
  }
  return Object.fromEntries(Object.entries(sums).map(([n, s]) => [n, Object.fromEntries(Object.entries(s).map(([k, [a, b]]) => [k, pct(a, b)]))]));
}

/** axe results by component: the stories checked and those that passed, from the Storybook check's list. */
function a11yByFolder(list) {
  const out = {};
  for (const s of list.stories || []) {
    const m = /^src\/components\/(\w+)\//.exec(s.file || '');
    const n = m?.[1];
    if (!n) continue;
    const o = (out[n] ||= { stories: 0, passed: 0, problems: [] });
    o.stories++;
    if (s.ok) o.passed++;
    else if (o.problems.length < 3) o.problems.push(`${s.name}: ${String(s.detail || '').split('\n')[0].slice(0, 160)}`);
  }
  return out;
}

/** The newest releases in CHANGELOG.md: version, date and how many entries each section has. */
export function releases(changelog, n = RELEASES) {
  const out = [];
  const re = /^## \[(\d+\.\d+\.\d+[^\]]*)\](?: - (\d{4}-\d{2}-\d{2}))?\n([\s\S]*?)(?=^## |(?![\s\S]))/gm;
  for (const m of changelog.matchAll(re)) {
    const sections = {};
    for (const s of m[3].matchAll(/^### (\w[\w ]*)\n([\s\S]*?)(?=^### |(?![\s\S]))/gm)) sections[s[1].trim()] = (s[2].match(/^- /gm) || []).length;
    out.push({ version: m[1], date: m[2] || null, breaking: /^### (Removed|Breaking)|BREAKING/m.test(m[3]) || /^\d+\.0\.0$/.test(m[1]), sections });
    if (out.length >= n) break;
  }
  return out;
}

/** The open issues (not pull requests) from GitHub's API, by label, and the newest few. */
async function openIssues(repo, token) {
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const r = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&per_page=100&page=${page}`, { headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'serupa-health' } });
    if (!r.ok) throw new Error(`GitHub answered ${r.status} for the issues`);
    const list = await r.json();
    all.push(...list.filter((i) => !i.pull_request));
    if (list.length < 100) break;
  }
  const labels = {};
  for (const i of all) for (const l of i.labels.length ? i.labels.map((x) => x.name) : ['no label']) labels[l] = (labels[l] || 0) + 1;
  return {
    open: all.length, url: `https://github.com/${repo}/issues`, labels,
    newest: all.slice(0, ISSUES).map((i) => ({ number: i.number, title: i.title, url: i.html_url, labels: i.labels.map((x) => x.name), opened: i.created_at.slice(0, 10) })),
  };
}

/**
 * The health, from the repository and whatever run results are given.
 * @param {string} [root]
 * @param {{ coverage?: string, size?: string, a11y?: string, issues?: { open: number, url: string, labels: Record<string, number>, newest: object[] } | null, run?: string | null }} [inputs]
 */
export function collectHealth(root = ROOT, { coverage, size, a11y, issues = null, run = null } = {}) {
  const pkg = readJson(path.join(root, 'package.json'));
  const names = folders(root).filter((n) => fs.existsSync(path.join(root, 'src', 'components', n, 'index.ts')));
  const bud = budgets(root);
  const skips = compilerSkips(root);
  const cov = exists(coverage) ? readJson(coverage) : null;
  const covBy = cov ? coverageByFolder(cov) : {};
  const sizes = exists(size) ? readJson(size) : null;
  const ax = exists(a11y) ? readJson(a11y) : null;
  const axBy = ax ? a11yByFolder(ax) : {};
  const aria = path.join(root, 'tools', 'test', 'baseline-aria');
  const acr = readJson(path.join(root, 'docs', 'acr.json'));
  const components = names.map((n) => {
    const dir = path.join(root, 'src', 'components', n);
    return {
      name: n,
      status: statusOf(n, root),
      tests: count(path.join(dir, `${n}.test.tsx`), /^\s*(?:it|test)(?:\.each\([^)]*\))?\(\s*['"`]/gm),
      stories: count(path.join(dir, `${n}.stories.tsx`), /^export const \w+/gm),
      ariaBaseline: fs.existsSync(path.join(aria, `${n}.yml`)),
      size: { budget: bud[n] ? { alone: bud[n].alone ?? null, css: bud[n].css ?? null } : null,
        measured: sizes ? { alone: sizes.alone?.[n] ?? null, css: sizes.css?.[n] ?? null } : null },
      coverage: covBy[n] || null,
      a11y: axBy[n] || null,
      compilerSkipped: skips[n] || [],
    };
  });
  const total = cov?.total ? { lines: cov.total.lines?.pct ?? null, functions: cov.total.functions?.pct ?? null, branches: cov.total.branches?.pct ?? null, statements: cov.total.statements?.pct ?? null } : null;
  const a11yTotal = ax ? { stories: (ax.stories || []).length, passed: (ax.stories || []).filter((s) => s.ok).length, docs: (ax.docs || []).length, docsPassed: (ax.docs || []).filter((s) => s.ok).length, runs: ax.runs || null } : null;
  const conformance = {};
  for (const c of acr.criteria) conformance[c.conformance] = (conformance[c.conformance] || 0) + 1;
  return {
    version: pkg.version,
    // A file a run made (run: its address) says so; the repository-only one has no date, so it doesn't change on every build.
    made: run ? { by: 'ci', at: new Date().toISOString(), run } : { by: 'repository', at: null, run: null },
    totals: {
      components: components.length,
      byStatus: components.reduce((o, c) => ({ ...o, [c.status]: (o[c.status] || 0) + 1 }), {}),
      tests: components.reduce((s, c) => s + c.tests, 0),
      stories: components.reduce((s, c) => s + c.stories, 0),
      untested: components.filter((c) => !c.tests).map((c) => c.name),
      compilerSkipped: components.filter((c) => c.compilerSkipped.length).map((c) => c.name),
      ariaBaselines: components.filter((c) => c.ariaBaseline).length,
      coverage: total,
      a11y: a11yTotal,
      sizeTotals: sizes?.totals || null,
      starter: sizes?.starter ?? null,
    },
    conformance: { standard: acr.standard, reviewed: acr.reviewed, counts: conformance },
    components,
    issues,
    releases: releases(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8')),
  };
}

const kib = (b) => (b == null ? '–' : `${(b / 1024).toFixed(1)} KiB`);
const p = (v) => (v == null ? '–' : `${v}%`);

/** The health as Markdown, for a run's summary page. */
export function healthMarkdown(h) {
  const t = h.totals;
  const lines = [`## Design system health, ${h.version}`, ''];
  lines.push(`- **Components**: ${t.components} (${Object.entries(t.byStatus).map(([k, v]) => `${v} ${k}`).join(', ')}), ${t.tests} tests, ${t.stories} stories`);
  if (t.coverage) lines.push(`- **Test coverage**: lines ${p(t.coverage.lines)}, functions ${p(t.coverage.functions)}, branches ${p(t.coverage.branches)}`);
  if (t.a11y) lines.push(`- **Accessibility (axe, WCAG 2.2 AA)**: ${t.a11y.passed} of ${t.a11y.stories} stories pass in every theme, ${t.a11y.docsPassed} of ${t.a11y.docs} docs page checks`);
  lines.push(`- **Conformance report** (${h.conformance.standard}, reviewed for ${h.conformance.reviewed.version}): ${Object.entries(h.conformance.counts).map(([k, v]) => `${v} ${k}`).join(', ')}`);
  lines.push(`- **React Compiler**: ${t.components - t.compilerSkipped.length} of ${t.components} compile whole${t.compilerSkipped.length ? `; skipped in part: ${t.compilerSkipped.join(', ')}` : ''}`);
  if (h.issues) lines.push(`- **Open issues**: [${h.issues.open}](${h.issues.url})${Object.keys(h.issues.labels).length ? ` (${Object.entries(h.issues.labels).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`).join(', ')})` : ''}`);
  lines.push(`- **Latest releases**: ${h.releases.map((r) => `${r.version}${r.date ? ` (${r.date})` : ''}`).join(', ')}`);
  lines.push('', '| Component | Status | Tests | Stories | Coverage (lines) | axe | Imported alone | CSS | Compiler |', '| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |');
  for (const c of h.components) {
    const ax = c.a11y ? `${c.a11y.passed}/${c.a11y.stories}` : '–';
    const alone = c.size.measured?.alone != null ? kib(c.size.measured.alone) : c.size.budget?.alone != null ? `≤ ${c.size.budget.alone} KiB` : '–';
    const css = c.size.measured?.css != null ? kib(c.size.measured.css) : c.size.budget?.css != null ? `≤ ${c.size.budget.css} KiB` : '–';
    lines.push(`| ${c.name} | ${c.status} | ${c.tests} | ${c.stories} | ${p(c.coverage?.lines)} | ${ax} | ${alone} | ${css} | ${c.compilerSkipped.length ? `skips ${c.compilerSkipped.join(', ')}` : 'whole'} |`);
  }
  return lines.join('\n') + '\n';
}

/** The repository-only health file, unless a run's file is already there (the registry calls this). */
export function writeLocalHealth(root = ROOT) {
  const file = path.join(root, HEALTH_FILE);
  try { if (readJson(file).made?.by === 'ci') return; } catch { /* none yet, or unreadable: write it */ }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = JSON.stringify(collectHealth(root), null, 1) + '\n';
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) fs.writeFileSync(file, body);
}

/** The last nightly run's health.json, through gh. */
function fromNightly(root, out) {
  const runs = JSON.parse(execFileSync('gh', ['run', 'list', '--workflow', 'Nightly', '--branch', 'main', '--limit', '10', '--json', 'databaseId'], { cwd: root, encoding: 'utf8' }));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-health-'));
  for (const { databaseId } of runs) {
    try {
      execFileSync('gh', ['run', 'download', String(databaseId), '--name', 'health', '--dir', tmp], { cwd: root, stdio: 'ignore' });
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.copyFileSync(path.join(tmp, 'health.json'), out);
      return databaseId;
    } catch { /* that run has no health artifact: try the one before */ }
  }
  throw new Error('none of the last 10 nightly runs has a health artifact');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const out = path.resolve(arg('--out') || path.join(ROOT, HEALTH_FILE));
  if (process.argv.includes('--from-nightly')) {
    const id = fromNightly(ROOT, out);
    console.log(`${path.relative(ROOT, out)}: the health from nightly run ${id}`);
  } else {
    let issues = null;
    if (process.argv.includes('--issues')) {
      const repo = process.env.GITHUB_REPOSITORY, token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
      if (!repo || !token) console.error('No GITHUB_REPOSITORY and GH_TOKEN: the open issues are left out.');
      else try { issues = await openIssues(repo, token); } catch (e) { console.error(`The open issues are left out: ${e.message}`); }
    }
    const run = process.env.GITHUB_RUN_ID && process.env.GITHUB_REPOSITORY ? `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null;
    const h = collectHealth(ROOT, { coverage: arg('--coverage'), size: arg('--size'), a11y: arg('--a11y'), issues, run });
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(h, null, 1) + '\n');
    if (process.argv.includes('--summary') && process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, healthMarkdown(h));
    console.log(`${path.relative(ROOT, out)}: ${h.totals.components} components, ${h.totals.tests} tests${h.totals.coverage ? `, ${h.totals.coverage.lines}% of lines covered` : ''}${h.totals.a11y ? `, axe ${h.totals.a11y.passed}/${h.totals.a11y.stories}` : ''}${h.issues ? `, ${h.issues.open} open issues` : ''}`);
  }
}

// The Health page (17): how the design system is doing, from docs/generated/health.json, which tools/health.mjs
// writes. Storybook and the site write it from the repository as they start (components, tests, stories, size budgets,
// the compiler's skip list, the conformance report, releases); the nightly run adds coverage, the axe results, the
// measured sizes and the open issues, and node tools/health.mjs --from-nightly brings that file here.
import * as React from 'react';
import { Badge } from '../src/components/Badge/Badge';
import { DescriptionItem, DescriptionList } from '../src/components/DescriptionList/DescriptionList';
import { Meter } from '../src/components/Meter/Meter';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../src/components/Table/Table';
import { Text } from '../src/components/Text/Text';
import { componentDocs as docsId } from './generated/pages';

type Pct = number | null;
export interface Health {
  version: string;
  made: { by: 'ci' | 'repository'; at: string | null; run: string | null };
  totals: {
    components: number; byStatus: Record<string, number>; tests: number; stories: number; untested: string[];
    compilerSkipped: string[]; ariaBaselines: number;
    coverage: { lines: Pct; functions: Pct; branches: Pct; statements: Pct } | null;
    a11y: { stories: number; passed: number; docs: number; docsPassed: number; runs: string[] | null } | null;
    sizeTotals: Record<string, number> | null; starter: number | null;
  };
  conformance: { standard: string; reviewed: { version: string; date: string }; counts: Record<string, number> };
  components: {
    name: string; status: string; tests: number; stories: number; ariaBaseline: boolean;
    size: { budget: { alone: number | null; css: number | null } | null; measured: { alone: number | null; css: number | null } | null };
    coverage: { lines: Pct; functions: Pct; branches: Pct } | null;
    a11y: { stories: number; passed: number; problems: string[] } | null;
    compilerSkipped: string[];
  }[];
  issues: { open: number; url: string; labels: Record<string, number>; newest: { number: number; title: string; url: string; labels: string[]; opened: string }[] } | null;
  releases: { version: string; date: string | null; breaking: boolean; sections: Record<string, number> }[];
}

// Not imported directly: the file is made as Storybook and the site start, and a missing one shows a note, not an error.
const files = import.meta.glob<{ default: Health }>('./generated/health.json');
function useHealth(): Health | null | undefined {
  const [h, setH] = React.useState<Health | null | undefined>(undefined);
  React.useEffect(() => {
    const load = files['./generated/health.json'];
    let live = true;
    if (!load) { setH(null); return; }
    void load().then((m) => { if (live) setH(m.default); }, () => { if (live) setH(null); });
    return () => { live = false; };
  }, []);
  return h;
}

const kib = (b: number | null | undefined) => (b == null ? null : `${(b / 1024).toFixed(1)} KiB`);
const pct = (v: Pct | undefined) => (v == null ? '–' : `${v}%`);
const link = (name: string) => `?path=/docs/${docsId[name] || `components-${name.toLowerCase()}`}--docs`;
const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const STATUS_TONE: Record<string, 'neutral' | 'info' | 'warning' | 'danger'> = { stable: 'neutral', beta: 'info', alpha: 'warning', deprecated: 'danger' };
const nowrap: React.CSSProperties = { whiteSpace: 'nowrap' };
const NOT_RUN = 'Not in this file: the nightly run measures it.';

function Missing({ health }: { health: Health | null | undefined }) {
  if (health === undefined) return <Text tone="muted">Loading the health numbers…</Text>;
  return <Text tone="muted">No health file yet. Run <code>node tools/health.mjs</code> (or <code>--from-nightly</code> for the full numbers) and reload.</Text>;
}

/** Where the numbers come from, and the figures at a glance. */
export function HealthSummary() {
  const h = useHealth();
  if (!h) return <Missing health={h} />;
  const t = h.totals;
  const statuses = Object.entries(t.byStatus).map(([k, v]) => `${v} ${k}`).join(', ');
  const whole = t.components - t.compilerSkipped.length;
  const conf = h.conformance.counts;
  return <>
    <p>
      {h.made.by === 'ci' && h.made.at
        ? <>From the <a href={h.made.run ?? undefined} target="_top">nightly run</a> of {day(h.made.at)}, on version {h.version}.</>
        : <>From the repository, version {h.version}. Coverage, the axe results, measured sizes and open issues come from the nightly run: <code>node tools/health.mjs --from-nightly</code> brings them here.</>}
    </p>
    <DescriptionList layout="split" dividers>
      <DescriptionItem term="Components">{t.components} ({statuses})</DescriptionItem>
      <DescriptionItem term="Tests">{t.tests.toLocaleString('en')} in the components' own test files{t.untested.length ? `; none for ${t.untested.join(', ')}` : ', every component has some'}</DescriptionItem>
      <DescriptionItem term="Stories">{t.stories.toLocaleString('en')}</DescriptionItem>
      <DescriptionItem term="Test coverage">{t.coverage ? `${pct(t.coverage.lines)} of lines, ${pct(t.coverage.functions)} of functions, ${pct(t.coverage.branches)} of branches` : NOT_RUN}</DescriptionItem>
      <DescriptionItem term="Accessibility (axe, WCAG 2.2 AA)">{t.a11y ? `${t.a11y.passed} of ${t.a11y.stories} stories pass in every theme and with more contrast; ${t.a11y.docsPassed} of ${t.a11y.docs} docs page checks pass` : NOT_RUN}</DescriptionItem>
      <DescriptionItem term="Conformance report">{h.conformance.standard}, reviewed for {h.conformance.reviewed.version}: {conf['Supports'] ?? 0} supported, {conf['Partially Supports'] ?? 0} partly, {conf['Not Applicable'] ?? 0} the app's alone</DescriptionItem>
      <DescriptionItem term="Role and name baselines">{t.ariaBaselines} of {t.components} components</DescriptionItem>
      <DescriptionItem term="React Compiler">{whole} of {t.components} compile whole; {t.compilerSkipped.length} have a function it skips</DescriptionItem>
      <DescriptionItem term="Starter page">{t.starter != null ? `${kib(t.starter)} gzipped: a sign-in form's tokens, base styles, CSS and components` : NOT_RUN}</DescriptionItem>
      <DescriptionItem term="Open issues">{h.issues ? <a href={h.issues.url} target="_top">{h.issues.open}</a> : NOT_RUN}</DescriptionItem>
    </DescriptionList>
    {t.coverage && <div style={{ display: 'grid', gap: 'var(--spacing-3)', marginBlockStart: 'var(--spacing-6)', maxInlineSize: 'var(--container-md)' }}>
      {(['lines', 'functions', 'branches'] as const).map((k) => <Meter key={k} value={t.coverage?.[k] ?? 0} max={100} low={80} high={90} optimum={100} label={`Coverage: ${k}`} showValue formatValue={(v) => `${v}%`} />)}
    </div>}
  </>;
}

/** The components that need a look: axe failures, low coverage, compiler skips. */
export function HealthAttention() {
  const h = useHealth();
  if (!h) return <Missing health={h} />;
  const rows = h.components.flatMap((c) => [
    ...(c.a11y && c.a11y.passed < c.a11y.stories ? [{ c, what: `axe: ${c.a11y.stories - c.a11y.passed} of ${c.a11y.stories} stories fail`, more: c.a11y.problems.join('; ') }] : []),
    ...(c.coverage?.lines != null && c.coverage.lines < 80 ? [{ c, what: `coverage: ${c.coverage.lines}% of lines`, more: '' }] : []),
    ...(c.size.measured?.alone != null && c.size.budget?.alone != null && c.size.measured.alone > c.size.budget.alone * 1024 ? [{ c, what: `size: ${kib(c.size.measured.alone)}, over its ${c.size.budget.alone} KiB budget`, more: '' }] : []),
    ...(!c.tests ? [{ c, what: 'no tests', more: '' }] : []),
  ]);
  if (!rows.length) return <p>Nothing needs a look{h.totals.a11y && h.totals.coverage ? '' : ' in what this file holds'}: no axe failures, no component under 80% of lines covered, none over its size budget and none without tests.</p>;
  return <ul>{rows.map((r, i) => <li key={i}><a href={link(r.c.name)} target="_top">{r.c.name}</a>, {r.what}{r.more ? `: ${r.more}` : ''}</li>)}</ul>;
}

/** Every component's figures, one row each. */
export function HealthComponents() {
  const h = useHealth();
  if (!h) return <Missing health={h} />;
  const size = (m: number | null | undefined, b: number | null | undefined) => kib(m) ?? (b != null ? `up to ${b} KiB` : '–');
  return <Table size="sm" striped stickyHeader caption={`${h.components.length} components`} containerProps={{ style: { maxBlockSize: 'var(--container-2xl)' } }}>
    <TableHead><TableRow>
      <TableHeaderCell>Component</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
      <TableHeaderCell align="end">Tests</TableHeaderCell>
      <TableHeaderCell align="end">Stories</TableHeaderCell>
      <TableHeaderCell align="end">Lines covered</TableHeaderCell>
      <TableHeaderCell align="end">Stories passing axe</TableHeaderCell>
      <TableHeaderCell align="end">Imported alone</TableHeaderCell>
      <TableHeaderCell align="end">CSS</TableHeaderCell>
      <TableHeaderCell>React Compiler</TableHeaderCell>
    </TableRow></TableHead>
    <TableBody>{h.components.map((c) => <TableRow key={c.name}>
      <TableHeaderCell scope="row"><a href={link(c.name)} target="_top">{c.name}</a></TableHeaderCell>
      <TableCell><Badge tone={STATUS_TONE[c.status] ?? 'neutral'}>{c.status}</Badge></TableCell>
      <TableCell align="end">{c.tests}</TableCell>
      <TableCell align="end">{c.stories}</TableCell>
      <TableCell align="end">{pct(c.coverage?.lines)}</TableCell>
      <TableCell align="end">{c.a11y ? `${c.a11y.passed} of ${c.a11y.stories}` : '–'}</TableCell>
      <TableCell align="end" style={nowrap}>{size(c.size.measured?.alone, c.size.budget?.alone)}</TableCell>
      <TableCell align="end" style={nowrap}>{size(c.size.measured?.css, c.size.budget?.css)}</TableCell>
      <TableCell>{c.compilerSkipped.length ? `Skips ${c.compilerSkipped.join(', ')}` : 'Whole'}</TableCell>
    </TableRow>)}</TableBody>
  </Table>;
}

/** The newest releases and what each brought, from CHANGELOG.md. */
export function HealthReleases() {
  const h = useHealth();
  if (!h) return <Missing health={h} />;
  const KINDS = ['Added', 'Changed', 'Fixed', 'Removed'];
  return <Table size="sm" caption="The latest releases">
    <TableHead><TableRow>
      <TableHeaderCell>Version</TableHeaderCell>
      <TableHeaderCell>Date</TableHeaderCell>
      {KINDS.map((k) => <TableHeaderCell key={k} align="end">{k}</TableHeaderCell>)}
    </TableRow></TableHead>
    <TableBody>{h.releases.map((r) => <TableRow key={r.version}>
      <TableHeaderCell scope="row">{r.version}{r.breaking ? <> <Badge tone="warning">breaking</Badge></> : null}</TableHeaderCell>
      <TableCell>{r.date ? day(r.date) : '–'}</TableCell>
      {KINDS.map((k) => <TableCell key={k} align="end">{r.sections[k] ?? 0}</TableCell>)}
    </TableRow>)}</TableBody>
  </Table>;
}

/** The open issues by label, and the newest few. */
export function HealthIssues() {
  const h = useHealth();
  if (!h) return <Missing health={h} />;
  if (!h.issues) return <p>{NOT_RUN}</p>;
  const labels = Object.entries(h.issues.labels).sort((a, b) => b[1] - a[1]);
  return <>
    <p><a href={h.issues.url} target="_top">{h.issues.open} open</a>{labels.length ? `: ${labels.map(([k, v]) => `${v} ${k}`).join(', ')}.` : '.'}</p>
    {h.issues.newest.length > 0 && <ul>{h.issues.newest.map((i) => <li key={i.number}><a href={i.url} target="_top">#{i.number} {i.title}</a>, opened {day(i.opened)}</li>)}</ul>}
  </>;
}

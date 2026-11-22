'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { Select } from '../../components/Select/Select';
import { Table, TableHead, TableBody, TableFoot, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { Textarea } from '../../components/Textarea/Textarea';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { formatDate } from '../../components/FormattedDate/FormattedDate';
import { announce } from '../../internal/announce';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Loader } from '../../components/Loader/Loader';
import { Card } from '../../components/Card/Card';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Timesheet: a week's hours by project and day, the totals as you type, and sending it for approval. For an app to
   copy. What it carries (WCAG 2.2):
   - 1.3.1: the week is a table with a caption; the projects are row headers and the days column headers, and each
     hours field is named by both ("Website redesign, Monday 9 February").
   - 4.1.3: the week's total is said when it changes, and the foot sums each day and the week.
   - 3.3.2: it says how many hours a week are expected, and that a day holds at most 24.
   - 3.3.1, 2.4.3: sending with problems shows a summary at the top that takes focus, each problem a link to its day.
   - 3.3.4, 4.1.3: Send shows it's busy; a week that can't be sent says so and keeps every hour.
   - 2.4.3: adding a project moves focus to its first day; removing one moves it to the next row's Remove, or Add.
   - 2.4.3: once sent, the answer's heading takes focus, and says who approves it.
   Saving is the app's job: onSend gets the week; reject when it can't be sent. */

export interface Project { id: string; name: string }
/** Hours by project id, a number or null for each day of the week, Monday first. */
export type Week = Record<string, (number | null)[]>;

export interface TimesheetProps {
  /** The Monday the week starts on, as YYYY-MM-DD. Default: 9 February 2026. */
  weekStart?: string | undefined;
  /** Every project hours can go to. */
  projects?: Project[] | undefined;
  /** The week so far. Default: two projects, partly filled. */
  defaultHours?: Week | undefined;
  /** Last week's hours, for Copy last week. */
  lastWeek?: Week | undefined;
  /** Hours a week that are expected. Default: 40. */
  expected?: number | undefined;
  /** Who approves it. Default: "Maya Chen". */
  approver?: string | undefined;
  /** Sends the week. Reject when it can't be sent. */
  onSend?: ((week: Week, note: string) => unknown) | undefined;
  /** The week's hours are still loading: a placeholder in their place. Default: false. */
  loading?: boolean | undefined;
  /** The week failed to load: a "Couldn’t load your timesheet" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads them again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoProjects: Project[] = [
  { id: 'web', name: 'Website redesign' },
  { id: 'app', name: 'Mobile app' },
  { id: 'support', name: 'Customer support' },
  { id: 'admin', name: 'Admin and meetings' },
];
const demoHours: Week = { web: [6, 5, null, null, null, null, null], admin: [2, 3, null, null, null, null, null] };
const demoLast: Week = { web: [6, 6, 6, 4, 4, null, null], app: [null, null, null, 2, 3, null, null], admin: [2, 2, 2, 2, 1, null, null] };
const blankDays = () => Array<number | null>(7).fill(null);

/** Each day's total, Monday first, and the week's. */
export function weekTotals(week: Week) {
  const days = blankDays().map((_, i) => Object.values(week).reduce((sum, row) => sum + (row[i] ?? 0), 0));
  return { days, week: days.reduce((a, b) => a + b, 0) };
}

/** What's wrong with a week: a day over 24 hours, or no hours at all. Keyed by "day-<index>" or "empty". */
export function weekProblems(week: Week, dayNames: string[]): Record<string, string> {
  const { days, week: all } = weekTotals(week);
  const out: Record<string, string> = {};
  if (!Object.keys(week).length || !all) out.empty = 'Enter your hours for at least one day.';
  days.forEach((h, i) => { if (h > 24) out[`day-${i}`] = `Check ${dayNames[i]}: its hours add up to more than 24.`; });
  return out;
}

/** The timesheet page: a skip link, a header, then main with the h1, the week's table and Send, or the answer. */
export function Timesheet({ weekStart = '2026-02-09', projects = demoProjects, defaultHours = demoHours, lastWeek = demoLast,
  expected = 40, approver = 'Maya Chen', onSend, loading = false, loadFailed = false, onRetry, online }: TimesheetProps) {
  const locale = useLocale();
  const [hours, setHours] = React.useState<Week>(defaultHours);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) setHours(defaultHours); }
  const [note, setNote] = React.useState('');
  const [adding, setAdding] = React.useState('');
  const [problems, setProblems] = React.useState<Record<string, string>>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const dates = blankDays().map((_, i) => { const d = new Date(`${weekStart}T00:00`); d.setDate(d.getDate() + i); return d; });
  const dayLong = dates.map((d) => d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }));
  const ids = Object.keys(hours);
  const rows = ids.map((id) => projects.find((p) => p.id === id) ?? { id, name: id });
  const left = projects.filter((p) => !ids.includes(p.id));
  const totals = weekTotals(hours);
  const num = (n: number) => formatNumber(n, locale, { maximumFractionDigits: 2 });
  const hoursWords = (n: number) => (n === 1 ? '1 hour' : `${num(n)} hours`);
  const firstCell = (i: number) => (ids[0] ? `ts-${ids[0]}-${i}` : 'ts-add');
  const errors: ErrorSummaryItem[] = Object.entries(problems).map(([k, message]) => ({ field: k === 'empty' ? firstCell(0) : firstCell(Number(k.slice(4))), message }));
  const weekWords = hoursWords(totals.week);
  const lastTotal = React.useRef(totals.week);
  React.useEffect(() => {
    if (totals.week !== lastTotal.current) announce(`Week total ${weekWords}`);
    lastTotal.current = totals.week;
  }, [totals.week, weekWords]);

  const change = (next: Week) => { setHours(next); setFailed(false); };
  const set = (id: string, i: number, v: number | null) => change({ ...hours, [id]: hours[id]!.map((h, j) => (j === i ? v : h)) });
  const add = () => {
    if (!adding) return;
    change({ ...hours, [adding]: blankDays() });
    const id = adding;
    setAdding('');
    requestAnimationFrame(() => document.getElementById(`ts-${id}-0`)?.focus());
  };
  const remove = (id: string) => {
    const after = ids[ids.indexOf(id) + 1];
    const next = { ...hours };
    delete next[id];
    change(next);
    requestAnimationFrame(() => document.getElementById(after ? `ts-remove-${after}` : 'ts-add')?.focus());
  };
  const copy = () => {
    change({ ...Object.fromEntries(ids.map((id) => [id, blankDays()])), ...lastWeek });
    announce('Copied last week’s hours.');
  };
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = weekProblems(hours, dayLong);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    setBusy(true);
    void Promise.resolve().then(() => onSend?.(hours, note.trim())).then(() => setSent(true), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (sent) answer.current?.focus(); }, [sent]);
  // The week as one range, its shared month and year said once: "February 9 – 15, 2026", "9.–15. Februar 2026".
  const last = dates[6]!, lastDay = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  // The server's ICU puts thin spaces around the dash where Chromium's puts plain ones, and this text has no
  // FormattedDate to re-render it after hydrating, so both write plain spaces.
  const range = formatDate(weekStart, locale, { to: lastDay, dateStyle: 'long' }).replace(/[\u2009\u202f]/g, ' ');

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#timesheets">Timesheets</Link>
      </header>
      <Container as="main" size="xl" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your hours stay here. Sending the timesheet needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Timesheets', href: '#timesheets' }, { label: range }]} title={`Week of ${range}`}
            description={`${hoursWords(expected)} a week are expected. A day holds at most 24.`} />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load your timesheet" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading your timesheet" /></Card> : (<>
          {sent ? (
            <section aria-labelledby="ts-sent" className="flex flex-col items-start gap-3 pt-6">
              <h2 id="ts-sent" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Sent to {approver} for approval</h2>
              <p className="m-0">{hoursWords(totals.week)} on {rows.length === 1 ? '1 project' : `${num(rows.length)} projects`}. We’ll email you once it’s approved, or if anything needs a change.</p>
              <Link href="#timesheets">Back to your timesheets</Link>
            </section>
          ) : (
            <form onSubmit={send} noValidate aria-label="Timesheet" className="flex flex-col gap-4 pt-6">
              <ErrorSummary key={tries} errors={errors} />
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Add a project" className="min-w-56">
                  <Select id="ts-add" placeholder={left.length ? 'Choose one' : 'All added'} disabled={!left.length}
                    options={left.map((p) => ({ value: p.id, label: p.name }))} value={adding} onChange={(e) => setAdding(e.target.value)} />
                </Field>
                <Button variant="secondary" onClick={add} disabled={!adding}>Add</Button>
                <Button variant="ghost" onClick={copy}>Copy last week</Button>
              </div>
              <Table caption={`Hours by project and day, ${range}, with the totals`} hideCaption size="sm" pinStart>
                <TableHead><TableRow>
                  <TableHeaderCell>Project</TableHeaderCell>
                  {dates.map((d, i) => (
                    <TableHeaderCell key={i} align="end">
                      <abbr title={dayLong[i]} className="no-underline">{d.toLocaleDateString(locale, { weekday: 'short' })}</abbr>
                      <span className="block font-normal text-text-muted">{d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell align="end">Total</TableHeaderCell>
                  <TableHeaderCell><span className="sr-only">Remove</span></TableHeaderCell>
                </TableRow></TableHead>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableHeaderCell scope="row" className="wrap-break-word">{p.name}</TableHeaderCell>
                      {hours[p.id]!.map((h, i) => (
                        <TableCell key={i} align="end">
                          <NumberInput id={`ts-${p.id}-${i}`} aria-label={`${p.name}, ${dayLong[i]}`} size="sm" steppers={false} min={0} max={24} step={0.25}
                            invalid={!!problems[`day-${i}`]} value={h} onValueChange={(v) => set(p.id, i, v)} className="w-20" />
                        </TableCell>
                      ))}
                      <TableCell align="end" className="font-semibold">{num(hours[p.id]!.reduce<number>((a, b) => a + (b ?? 0), 0))}</TableCell>
                      <TableCell><Button id={`ts-remove-${p.id}`} size="sm" variant="ghost" onClick={() => remove(p.id)} aria-label={`Remove: ${p.name}`}>Remove</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFoot>
                  <TableRow>
                    <TableHeaderCell scope="row">Total</TableHeaderCell>
                    {totals.days.map((h, i) => <TableCell key={i} align="end" className="font-semibold">{num(h)}</TableCell>)}
                    <TableCell align="end" className="font-semibold">{num(totals.week)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFoot>
              </Table>
              <p className="m-0" id="ts-total">
                {hoursWords(totals.week)} this week{totals.week < expected ? `, ${hoursWords(expected - totals.week)} under the ${num(expected)} expected.` : '.'}
              </p>
              <Field label="Note for your approver" id="ts-note" hint="Anything they should know, like time off or overtime." optional>
                <Textarea rows={3} value={note} onChange={(e) => { setNote(e.target.value); setFailed(false); }} />
              </Field>
              <div className="flex flex-col items-start gap-3">
                {failed ? <Alert tone="danger">Couldn’t send your timesheet. Try again; every hour is still here.</Alert> : null}
                <Button type="submit" loading={busy}>Send for approval</Button>
              </div>
            </form>
          )}
          </>)}
        </Stack>
      </Container>
    </div>
  );
}

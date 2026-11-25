'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { SplitButton } from '../../components/SplitButton/SplitButton';
import { MenuItem } from '../../components/Menu/Menu';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { DateField } from '../../components/DateField/DateField';
import { Field } from '../../components/Field/Field';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { Input } from '../../components/Input/Input';
import { Link } from '../../components/Link/Link';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { Select } from '../../components/Select/Select';
import { Table, TableHead, TableBody, TableFoot, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Expense report: add what you spent, one expense at a time, see them in a table with the total, and send the report
   to be paid back. For an app to copy. What it carries (WCAG 2.2):
   - 3.3.2: each field says what it takes; the amount says its currency; the receipt says when it's needed (over a
     limit) and what files it takes.
   - 3.3.1, 2.4.3: adding with problems shows a summary that takes focus, each problem a link to its field, and each
     field says its own.
   - 4.1.3: an expense added or removed is said, with the new total.
   - 1.3.1, 1.4.1: the expenses are a table with a caption and the total in its footer; one with no receipt says
     "Receipt needed" in words in a badge, not by color.
   - 2.5.3, 2.4.3: each Remove names its expense ("Remove: Taxi"); removing moves focus to the next row's Remove,
     or the add form's first field when none are left.
   - 3.3.4: Send for approval is checked first: the report's problems (no expenses, receipts missing) are said
     next to the button before anything is sent; once sent, the answer's heading takes focus.
   Sending is the app's job: onSubmit gets the expenses; reject when it can't be sent. */

export interface Expense {
  id: string;
  /** When: "2026-02-03". */
  date: string;
  category: string;
  what: string;
  amount: number;
  /** The receipt's file name, if one was added. */
  receipt?: string | undefined;
}

export interface ExpenseReportProps {
  /** The report's name, for the h1. Default: "Trip to Bandung, February". */
  title?: string | undefined;
  /** Expenses already added. Default: two demo expenses. */
  expenses?: Expense[] | undefined;
  /** ISO 4217 currency. Default: "USD". */
  currency?: string | undefined;
  /** Amounts over this need a receipt. Default: 25. */
  receiptOver?: number | undefined;
  /** Today, as YYYY-MM-DD: the date a new expense starts with and the latest it can be. Default: today. */
  today?: string | undefined;
  /** Sends the report. Reject when it can't be sent. */
  onSubmit?: ((expenses: Expense[]) => unknown) | undefined;
  /** Keeps the report as a draft, from the menu beside Send for approval. Reject when it can't be saved. */
  onSaveDraft?: ((expenses: Expense[]) => unknown) | undefined;
  /** The expenses are still loading: a placeholder in their place. Default: false. */
  loading?: boolean | undefined;
  /** The expenses failed to load: a "Couldn’t load your expenses" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads them again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'meals', label: 'Meals' },
  { value: 'other', label: 'Something else' },
];
const demo: Expense[] = [
  { id: 'e1', date: '2026-02-03', category: 'travel', what: 'Train to Bandung', amount: 18 },
  { id: 'e2', date: '2026-02-03', category: 'hotel', what: 'Hotel, 2 nights', amount: 140, receipt: 'hotel-invoice.pdf' },
];
type Draft = { date: string; category: string; what: string; amount: number | null; receipt: File | null };
type Problems = Partial<Record<'date' | 'category' | 'what' | 'amount' | 'receipt', string>>;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** What's wrong with an expense, by field, in the order of the form, or {} when it can be added. */
export function expenseProblems(d: Draft, today: string, receiptOver: number): Problems {
  const out: Problems = {};
  if (!d.date) out.date = 'Enter the date you spent it.';
  else if (d.date > today) out.date = 'Enter a date that isn’t in the future.';
  if (!d.category) out.category = 'Choose what it was for.';
  if (!d.what.trim()) out.what = 'Say what it was, like “Taxi to the client”.';
  if (d.amount === null || !(d.amount > 0)) out.amount = 'Enter how much it cost.';
  else if (d.amount > receiptOver && !d.receipt) out.receipt = `Add the receipt: it’s needed over ${receiptOver}.`;
  return out;
}

/** The expenses that need a receipt and have none. */
export const missingReceipts = (expenses: readonly Expense[], receiptOver: number) => expenses.filter((e) => e.amount > receiptOver && !e.receipt);

/** The report's page: a skip link, a header, then main with the h1, the add form, the expenses and Send. */
/** The add form's parts, in the order they show. */
const PARTS = ['date', 'category', 'what', 'amount', 'receipt'] as const;

export function ExpenseReport({ title = 'Trip to Bandung, February', expenses = demo, currency = 'USD', receiptOver = 25, today = iso(new Date()), onSubmit, onSaveDraft, loading = false, loadFailed = false, onRetry, online }: ExpenseReportProps) {
  const locale = useLocale();
  const blank: Draft = { date: today, category: '', what: '', amount: null, receipt: null };
  const [list, setList] = React.useState(expenses);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setList(expenses); } }
  const [d, setD] = React.useState<Draft>(blank);
  const needsReceipt = d.amount !== null && d.amount > receiptOver;   // so the receipt is marked required, not optional, once the amount needs one
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [reportProblem, setReportProblem] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency });
  const total = list.reduce((s, e) => s + e.amount, 0);
  const label = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c;
  const edit = (patch: Partial<Draft>) => setD((now) => ({ ...now, ...patch }));

  const errors: ErrorSummaryItem[] = PARTS.filter((k) => problems[k]).map((k) => ({ field: `expense-${k}`, message: problems[k] }));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const found = expenseProblems(d, today, receiptOver);
    setProblems(found);
    setTries((t) => t + 1);
    if (PARTS.some((k) => found[k])) return;
    const added: Expense = { id: `n${Date.now()}`, date: d.date, category: d.category, what: d.what.trim(), amount: d.amount!, receipt: d.receipt?.name };
    const next = [...list, added];
    setList(next); setD(blank); setReportProblem(null);
    announce(`Added ${added.what}, ${money(added.amount)}. Total ${money(next.reduce((s, x) => s + x.amount, 0))}.`);
  };
  const remove = (x: Expense) => {
    const at = list.indexOf(x), after = list[at + 1] ?? list[at - 1];
    const next = list.filter((y) => y.id !== x.id);
    setList(next);
    announce(`Removed ${x.what}. Total ${money(next.reduce((s, y) => s + y.amount, 0))}.`);
    requestAnimationFrame(() => (after ? document.getElementById(`expense-remove-${after.id}`) : document.querySelector<HTMLElement>('#expense-date input, #expense-date select'))?.focus());
  };
  // Save as draft keeps the report as it is, sent nowhere yet; it's said once saved, or says it failed.
  const [draftFailed, setDraftFailed] = React.useState(false);
  const saveDraft = () => {
    setDraftFailed(false);
    void Promise.resolve().then(() => onSaveDraft?.(list)).then(() => announce('Draft saved'), () => setDraftFailed(true));
  };
  const send = () => {
    setFailed(false);
    const missing = missingReceipts(list, receiptOver);
    const found = !list.length ? 'Add at least one expense first.' : missing.length ? `Add the receipt for ${missing.map((m) => m.what).join(', ')}: receipts are needed over ${money(receiptOver)}.` : null;
    setReportProblem(found);
    if (found) return;
    setBusy(true);
    void Promise.resolve().then(() => onSubmit?.(list)).then(() => setSent(true), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (sent) answer.current?.focus(); }, [sent]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme expenses</p>
        <Link underline="hover" href="#reports">Your reports</Link>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your expenses stay here. Sending the report needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Your reports', href: '#reports' }, { label: title }]} title={title}
            description={`Add each thing you paid for, then send the report to your manager. Receipts are needed over ${money(receiptOver)}.`} />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load your expenses" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Skeleton shape="text" lines={6} label="Loading expenses" /></Card> : (<>
          <div className="flex flex-col gap-8 pt-6">
            {sent ? (
              <section aria-labelledby="report-sent" className="flex flex-col items-start gap-3">
                <h2 id="report-sent" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Sent for approval</h2>
                <p className="m-0">{list.length === 1 ? '1 expense' : `${formatNumber(list.length, locale)} expenses`}, {money(total)} in all. Once your manager approves it, it’s paid with your next salary; we’ll email you either way.</p>
                <Link href="#reports">Back to your reports</Link>
              </section>
            ) : (
              <>
                <Card data-print="hide">
                  <form onSubmit={add} noValidate aria-labelledby="add-expense" className="flex flex-col gap-4">
                    <h2 id="add-expense" className="m-0 text-lg font-semibold">Add an expense</h2>
                    <ErrorSummary key={tries} errors={errors} headingLevel={3} />
                    <p className="m-0 text-text-muted">Fields marked * are required.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Date" error={problems.date} required>
                        <DateField id="expense-date" value={d.date} max={today} onValueChange={(v) => edit({ date: v })} />
                      </Field>
                      <Field label="What for" id="expense-category" error={problems.category} required>
                        <Select placeholder="Choose one" options={CATEGORIES} value={d.category} onChange={(e) => edit({ category: e.target.value })} />
                      </Field>
                      <Field label="What it was" id="expense-what" hint="As it says on the receipt." error={problems.what} required>
                        <Input value={d.what} onChange={(e) => edit({ what: e.target.value })} />
                      </Field>
                      <Field label="Amount" id="expense-amount" hint={`In ${currency}.`} error={problems.amount} required>
                        <NumberInput currency={currency} min={0} value={d.amount} onValueChange={(n) => edit({ amount: n })} className="max-w-48" />
                      </Field>
                    </div>
                    <Field label="Receipt" error={problems.receipt} required={needsReceipt} optional={!needsReceipt}>
                      <FileUpload id="expense-receipt" accept="image/*,.pdf" maxSize={10 * 1024 * 1024} hint={`A photo or PDF. Needed over ${money(receiptOver)}.`}
                        files={d.receipt ? [d.receipt] : []} onFilesChange={(f) => edit({ receipt: f.at(-1) ?? null })} />
                    </Field>
                    <Button type="submit" variant="secondary" className="self-start">Add expense</Button>
                  </form>
                </Card>

                <section aria-labelledby="expenses" className="flex flex-col gap-4">
                  <h2 id="expenses" className="m-0 text-lg font-semibold">Expenses</h2>
                  {list.length ? (
                    <Table caption="Expenses in this report, with the total" hideCaption pinEnd>
                      <TableHead><TableRow>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>What</TableHeaderCell>
                        <TableHeaderCell align="end">Amount</TableHeaderCell>
                        <TableHeaderCell>Receipt</TableHeaderCell>
                        <TableHeaderCell data-print="hide"><span className="sr-only">Remove</span></TableHeaderCell>
                      </TableRow></TableHead>
                      <TableBody>
                        {list.map((x) => (
                          <TableRow key={x.id}>
                            <TableCell className="whitespace-nowrap"><FormattedDate value={x.date} /></TableCell>
                            <TableCell className="wrap-break-word">{x.what}<span className="block text-sm text-text-muted">{label(x.category)}</span></TableCell>
                            <TableCell className="text-end tabular-nums">{money(x.amount)}</TableCell>
                            <TableCell>{x.receipt ? <span className="wrap-anywhere">{x.receipt}</span> : x.amount > receiptOver ? <Badge tone="warning">Receipt needed</Badge> : <span className="text-text-muted">Not needed</span>}</TableCell>
                            <TableCell data-print="hide"><Button id={`expense-remove-${x.id}`} size="sm" variant="ghost" onClick={() => remove(x)} aria-label={`Remove: ${x.what}`}>Remove</Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFoot>
                        <TableRow>
                          <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                          <TableCell className="text-end font-semibold tabular-nums">{money(total)}</TableCell>
                          <TableCell /><TableCell data-print="hide" />
                        </TableRow>
                      </TableFoot>
                    </Table>
                  ) : <p className="m-0 text-text-muted">None yet. Each one you add shows here, with the total.</p>}
                </section>

                <div data-print="hide" className="flex flex-col items-start gap-3">
                  {reportProblem ? <Alert tone="danger">{reportProblem}</Alert> : null}
                  {failed ? <Alert tone="danger">Couldn’t send the report. Try again; nothing is lost.</Alert> : null}
                  {draftFailed ? <Alert tone="danger">Couldn’t save the draft. Try again; nothing is lost.</Alert> : null}
                  <SplitButton loading={busy} onClick={send} menuLabel="More ways to save the report"
                    menu={<MenuItem icon="draft" onSelect={saveDraft}>Save as draft</MenuItem>}>Send for approval</SplitButton>
                </div>
              </>
            )}
          </div>
          </>)}
        </Stack>
      </Container>
    </div>
  );
}

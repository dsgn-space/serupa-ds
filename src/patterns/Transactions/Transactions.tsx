'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { Select } from '../../components/Select/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { formatDate } from '../../components/FormattedDate/FormattedDate';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Transactions: an account's money in and out by month, found by what it was or its category, with the month's
   totals first. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the transactions are a table with a caption that names the month; each one's description is its row
     header, so every amount is read with it.
   - 1.4.1: money in and money out are their own columns, never a color or a sign alone; a pending one says
     "Pending" in a badge.
   - 1.3.1: the month's totals are a list of terms before the table: in, out, and the difference.
   - 4.1.3: searching or filtering says how many transactions show, of how many that month.
   - 3.3.2: the search and the filters are named by visible labels, and Clear filters puts them back.
   - 1.4.10: the table scrolls on its own at narrow widths; the page doesn't.
   Fetching the account's transactions is the app's job: pass them, and each one's date as YYYY-MM-DD. */

export interface Transaction { id: string; date: string; description: string; category: string; amount: number; pending?: boolean | undefined }

export interface TransactionsProps {
  transactions?: Transaction[] | undefined;
  /** The money it's in. Default: "USD". */
  currency?: string | undefined;
  /** The account's name, in the title. */
  account?: string | undefined;
  /** Still loading: a placeholder shows instead of the transactions. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load your transactions" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const T = (id: string, date: string, description: string, category: string, amount: number, pending?: boolean): Transaction => ({ id, date, description, category, amount, pending });
const demo: Transaction[] = [
  T('t12', '2026-11-14', 'Corner Café', 'Eating out', -6.4, true),
  T('t11', '2026-11-13', 'City Transit', 'Transport', -32),
  T('t10', '2026-11-12', 'Fresh Market', 'Groceries', -84.15),
  T('t9', '2026-11-10', 'Refund: Acme Shoes', 'Shopping', 59.99),
  T('t8', '2026-11-05', 'Rent for November', 'Home', -1250),
  T('t7', '2026-11-01', 'Salary, Acme Ltd', 'Income', 3420),
  T('t6', '2026-10-28', 'Fresh Market', 'Groceries', -71.3),
  T('t5', '2026-10-21', 'Power and water', 'Home', -96.8),
  T('t4', '2026-10-15', 'Noodle House', 'Eating out', -23.5),
  T('t3', '2026-10-05', 'Rent for October', 'Home', -1250),
  T('t2', '2026-10-01', 'Salary, Acme Ltd', 'Income', 3420),
];

/** The months that have transactions, as YYYY-MM, newest first. */
export function monthsOf(tx: Transaction[]) {
  return [...new Set(tx.map((t) => t.date.slice(0, 7)))].sort().reverse();
}

/** Money in and money out (as a positive number) of some transactions. */
export function totals(tx: Transaction[]) {
  const into = tx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const out = -tx.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  return { into: Math.round(into * 100) / 100, out: Math.round(out * 100) / 100 };
}

/** The transactions of a month whose description has the words searched for, in a category ('' for any). */
export function findTx(tx: Transaction[], month: string, query: string, category: string) {
  const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return tx.filter((t) => t.date.startsWith(month) && (!category || t.category === category) && words.every((w) => t.description.toLocaleLowerCase().includes(w)));
}

/** The page: a skip link, a header, then main with the h1, the month and its totals, the filters, and the table. */
export function Transactions({ transactions = demo, currency = 'USD', account = 'Everyday account', loading = false, loadFailed = false, onRetry, online }: TransactionsProps) {
  const locale = useLocale();
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency });
  const months = monthsOf(transactions);
  const monthName = (m: string) => formatDate(`${m}-15`, locale, { options: { month: 'long', year: 'numeric' } });
  const day = (iso: string) => formatDate(iso, locale, { options: { day: 'numeric', month: 'short' } });
  const [picked, setMonth] = React.useState(months[0] ?? '');
  // The month picked while it still has transactions, else the newest: they can arrive after the first render.
  const month = months.includes(picked) ? picked : months[0] ?? '';
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('');
  const ofMonth = findTx(transactions, month, '', '');
  const shown = findTx(transactions, month, query, category);
  const sum = totals(ofMonth);
  const categories = [...new Set(ofMonth.map((t) => t.category))].sort();
  const filtered = !!(query || category);
  const name = monthName(month);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Bank</p>
        <Link underline="hover" href="#accounts">Accounts</Link>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">These are the transactions loaded before you went offline. New ones show when you’re back.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Accounts', href: '#accounts' }, { label: account }]} title={`${account}: transactions`} />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load your transactions" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Skeleton shape="text" lines={6} label="Loading transactions" /></Card>
            : !transactions.length ? <div className="pt-6"><EmptyState icon="receipt_long" title="No transactions yet" headingLevel={2}
                description="Money in and out of this account shows here, by month, as soon as it moves." /></div> : (<>
          <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
            <Field label="Month" id="tx-month" className="justify-self-start">
              <Select value={month} onChange={(e) => { setMonth(e.target.value); setCategory(''); }} options={months.map((m) => ({ value: m, label: monthName(m) }))} />
            </Field>
            <Card padding="sm" variant="filled">
              <h2 className="m-0 pb-2 text-base font-semibold">{name}</h2>
              <DescriptionList layout="split">
                <DescriptionItem term="Money in">{money(sum.into)}</DescriptionItem>
                <DescriptionItem term="Money out">{money(sum.out)}</DescriptionItem>
                <DescriptionItem term={sum.into >= sum.out ? 'You kept' : 'You spent more by'} emphasis>{money(Math.abs(sum.into - sum.out))}</DescriptionItem>
              </DescriptionList>
            </Card>
          </div>
          <div role="search" aria-label="Transactions" data-print="hide" className="flex flex-wrap items-end gap-4 pt-6">
            <div className="min-w-0 flex-1 basis-64">
              <Field label="Search transactions" id="tx-search">
                <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
              </Field>
            </div>
            <Field label="Category" id="tx-category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: '', label: 'All categories' }, ...categories]} />
            </Field>
            {filtered ? <Button variant="outline" onClick={() => { setQuery(''); setCategory(''); }}>Clear filters</Button> : null}
          </div>
          <p role="status" id="tx-shown" className="m-0 pt-4 text-sm text-text-muted">
            {filtered ? `Showing ${formatNumber(shown.length, locale)} of ${formatNumber(ofMonth.length, locale)} transactions` : `${formatNumber(ofMonth.length, locale)} transactions`} in {name}
          </p>
          <div className="pt-3">
            {shown.length ? (
              <Table caption={`Transactions in ${name}`} hideCaption>
                <TableHead><TableRow>
                  {/* On a phone the date and the category go under each description rather than in columns of their own,
                     so the table fits a 390px screen in every language with money in and money out still in their own columns. */}
                  <TableHeaderCell className="hidden sm:table-cell">Date</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell className="hidden sm:table-cell">Category</TableHeaderCell>
                  <TableHeaderCell align="end">Money out</TableHeaderCell>
                  <TableHeaderCell align="end">Money in</TableHeaderCell>
                </TableRow></TableHead>
                <TableBody>
                  {shown.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="hidden whitespace-nowrap sm:table-cell">{day(t.date)}</TableCell>
                      <TableHeaderCell scope="row" className="font-normal">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="min-w-0 wrap-break-word">{t.description}</span>
                          {t.pending ? <Badge tone="warning">Pending</Badge> : null}
                        </span>
                        <span className="block text-sm text-text-muted sm:hidden">{day(t.date)} · {t.category}</span>
                      </TableHeaderCell>
                      <TableCell className="hidden sm:table-cell">{t.category}</TableCell>
                      <TableCell align="end">{t.amount < 0 ? money(-t.amount) : ''}</TableCell>
                      <TableCell align="end">{t.amount > 0 ? money(t.amount) : ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p className="m-0">No transactions in {name} match. Try other words, or clear the filters.</p>}
          </div>
          </>)}
        </Stack>
      </Container>
    </div>
  );
}

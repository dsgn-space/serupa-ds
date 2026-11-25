'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { VisuallyHidden } from '../../components/VisuallyHidden/VisuallyHidden';
import { Alert } from '../../components/Alert/Alert';
import { Badge, type BadgeTone } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Toaster, toast } from '../../components/Toast/Toast';
import { FormattedNumber } from '../../components/FormattedNumber/FormattedNumber';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Invoice: one bill, as the person paying it reads it: whether it's due, paid or overdue in words, who it's from and
   to, its lines as a table, the totals, and a way to pay or keep a copy. For an app to copy. What it carries (WCAG 2.2):
   - 1.4.1, 1.3.1: its state is a word in a badge and a sentence with the day ("Due on March 31, 2025", "Overdue by
     5 days"), never a color alone.
   - 1.3.1: the lines are a table with a caption and column headers, the amounts aligned at the end; the totals are a
     description list, with the amount due named so.
   - 2.4.4: Download names what it downloads ("Download PDF of invoice INV-2041"), starting with the words it shows (2.5.3).
   - 3.3.4, 4.1.3: Pay shows it's busy and marks the invoice paid only once the server says so; a payment that fails
     says so next to the button.
   - 2.4.3, 4.1.3: once paid, the Pay button is gone, so focus goes to the h1; the state says "Paid" and a toast says so.
   - 4.1.3, 3.3.1: while the invoice loads, a placeholder named once; a failed load says so, with Try again.
   Paying is the app's job: onPay is called with the amount due; reject its promise when the payment fails. */

export interface InvoiceLine {
  id: string;
  /** What it's for: "Design system workshop, 2 days". */
  description: string;
  quantity: number;
  /** The price of one, in the currency's main unit. */
  price: number;
}
export interface InvoiceInfo {
  /** What it's called: "INV-2041". */
  number: string;
  /** When it was issued and when it's due, as "yyyy-mm-dd". */
  issued: string;
  due: string;
  /** When it was paid, as "yyyy-mm-dd", or empty. */
  paid: string;
  /** Who it's from and to, a line each. */
  from: readonly string[];
  to: readonly string[];
  lines: readonly InvoiceLine[];
  /** The tax rate, as a fraction: 0.11 for 11%. */
  taxRate: number;
  /** Where the PDF is. */
  pdf: string;
}

export interface InvoiceProps {
  /** The invoice. Default: a demo invoice that's due. */
  invoice?: InvoiceInfo | undefined;
  /** An ISO 4217 code. Default: "USD". */
  currency?: string | undefined;
  /** Today, as "yyyy-mm-dd", to say whether it's overdue. Default: "2025-03-20", for the demo. */
  today?: string | undefined;
  /** Pays the amount due. Return its promise: a rejection says so. Without it there is no Pay button. */
  onPay?: ((amount: number) => unknown) | undefined;
  /** The invoice is on its way from the server: placeholders, named once ("Loading invoice"). Default: false. */
  loading?: boolean | undefined;
  /** The invoice failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the invoice again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: InvoiceInfo = {
  number: 'INV-2041', issued: '2025-03-01', due: '2025-03-31', paid: '',
  from: ['Acme Studio', 'Jl. Braga No. 12', 'Bandung 40111, Indonesia'],
  to: ['Lima & Co.', 'Jl. Sudirman 5', 'Jakarta 10220, Indonesia'],
  lines: [
    { id: 'l1', description: 'Design system workshop, 2 days', quantity: 2, price: 1200 },
    { id: 'l2', description: 'Component audit', quantity: 1, price: 800 },
    { id: 'l3', description: 'Travel, Jakarta and back', quantity: 1, price: 140 },
  ],
  taxRate: 0.11, pdf: '#inv-2041.pdf',
};

const DAY = 864e5;
const day = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y!, m! - 1, d); };

/** The invoice's sums, each in whole cents: before tax, the tax, and the total. */
export function invoiceTotals(lines: readonly InvoiceLine[], taxRate: number): { subtotal: number; tax: number; total: number } {
  // Rounded to cents, so 3 × 0.10 is 0.30 and not the arithmetic's 0.30000000000000004, which onPay would get.
  const cents = (n: number) => Math.round(n * 100) / 100;
  const subtotal = cents(lines.reduce((n, l) => n + l.quantity * l.price, 0));
  const tax = cents(subtotal * taxRate);
  return { subtotal, tax, total: cents(subtotal + tax) };
}

/** Where the invoice stands on a day: paid, due (with the days left), or overdue (with the days late). */
export function invoiceState(inv: Pick<InvoiceInfo, 'due' | 'paid'>, today: string): { state: 'paid' | 'due' | 'overdue'; days: number } {
  if (inv.paid) return { state: 'paid', days: 0 };
  const days = Math.round((day(inv.due).getTime() - day(today).getTime()) / DAY);
  return days < 0 ? { state: 'overdue', days: -days } : { state: 'due', days };
}

const BADGE: Record<'paid' | 'due' | 'overdue', { label: string; tone: BadgeTone }> = {
  paid: { label: 'Paid', tone: 'success' }, due: { label: 'Due', tone: 'warning' }, overdue: { label: 'Overdue', tone: 'danger' },
};

/** The invoice page: a skip link, a header, then main with the invoice's h1, where it stands, its lines and totals. */
export function Invoice({ invoice: start = demo, currency = 'USD', today = '2025-03-20', onPay, loading = false, loadFailed = false, onRetry, online }: InvoiceProps) {
  const locale = useLocale(undefined);
  const [inv, setInv] = React.useState(start);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setInv(start); } }
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const money = (n: number) => <FormattedNumber value={n} format="currency" currency={currency} />;
  const date = (s: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'long', calendar: 'gregory', numberingSystem: 'latn' }).format(day(s));
  const sums = invoiceTotals(inv.lines, inv.taxRate);
  const where = invoiceState(inv, today);
  const name = `Invoice ${inv.number}`;
  const sentence = where.state === 'paid' ? `Paid on ${date(inv.paid)}.`
    : where.state === 'overdue' ? `Overdue by ${where.days === 1 ? '1 day' : `${formatNumber(where.days, locale)} days`}. It was due on ${date(inv.due)}.`
    : `Due on ${date(inv.due)}${where.days === 0 ? ', today' : ''}.`;

  const pay = () => {
    setFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onPay?.(sums.total)).then(() => {
      setInv((i) => ({ ...i, paid: today }));
      toast({ title: `${name} is paid`, tone: 'success' });
    }, () => setFailed(true)).finally(() => setBusy(false));
  };
  // The Pay button goes once it's paid, so focus goes to the page's h1.
  const was = React.useRef(!!inv.paid);
  React.useEffect(() => { if (inv.paid && !was.current) heading.current?.focus(); was.current = !!inv.paid; }, [inv.paid]);

  const h2 = 'm-0 text-lg font-semibold';
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">This is the invoice as it was when the page loaded. Paying needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Invoices', href: '#invoices' }, { label: inv.number }]} title={name} headingRef={heading} />

          <div className="flex flex-col gap-8 pt-6">
            {loadFailed ? <EmptyLoadFailed title="Couldn’t load the invoice" onRetry={() => onRetry?.()} headingLevel={2} />
              : loading ? <Card><Skeleton shape="text" lines={6} label="Loading invoice" /></Card> : <>
                <section aria-labelledby="standing" className="flex flex-col items-start gap-3">
                  <h2 id="standing" className="m-0 flex flex-wrap items-center gap-3 text-2xl font-semibold">
                    {money(sums.total)} {inv.paid ? 'paid' : 'to pay'}
                    <Badge tone={BADGE[where.state].tone}>{BADGE[where.state].label}</Badge>
                  </h2>
                  <p className="m-0 text-text-muted">{sentence}</p>
                  <div data-print="hide" className="flex flex-wrap items-center gap-3">
                    {onPay && !inv.paid ? <Button loading={busy} onClick={pay}>Pay {money(sums.total)}</Button> : null}
                    <Link href={inv.pdf} download>Download PDF<VisuallyHidden> of invoice {inv.number}</VisuallyHidden></Link>
                  </div>
                  {failed ? <Alert tone="danger">The payment didn’t go through. Nothing was taken; try again, or use another card.</Alert> : null}
                </section>

                <div className="grid gap-6 md:grid-cols-3">
                  <section aria-labelledby="from">
                    <h2 id="from" className="m-0 text-sm font-semibold text-text-muted">From</h2>
                    <address className="not-italic">{inv.from.map((l) => <div key={l}>{l}</div>)}</address>
                  </section>
                  <section aria-labelledby="to">
                    <h2 id="to" className="m-0 text-sm font-semibold text-text-muted">To</h2>
                    <address className="not-italic">{inv.to.map((l) => <div key={l}>{l}</div>)}</address>
                  </section>
                  <section aria-labelledby="dates">
                    <h2 id="dates" className="m-0 text-sm font-semibold text-text-muted">Dates</h2>
                    <DescriptionList>
                      <DescriptionItem term="Issued"><time dateTime={inv.issued}>{date(inv.issued)}</time></DescriptionItem>
                      <DescriptionItem term="Due"><time dateTime={inv.due}>{date(inv.due)}</time></DescriptionItem>
                    </DescriptionList>
                  </section>
                </div>

                <section aria-labelledby="lines" className="flex flex-col gap-4">
                  <h2 id="lines" className={h2}>What it’s for</h2>
                  <Table caption={`Lines of invoice ${inv.number}`} hideCaption>
                    <TableHead><TableRow>
                      <TableHeaderCell>Description</TableHeaderCell>
                      <TableHeaderCell align="end">Quantity</TableHeaderCell>
                      <TableHeaderCell align="end">Price</TableHeaderCell>
                      <TableHeaderCell align="end">Amount</TableHeaderCell>
                    </TableRow></TableHead>
                    <TableBody>{inv.lines.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.description}</TableCell>
                        <TableCell align="end">{formatNumber(l.quantity, locale)}</TableCell>
                        <TableCell align="end">{money(l.price)}</TableCell>
                        <TableCell align="end">{money(l.price * l.quantity)}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                  {/* The totals are in the table's text size, and their figures end where the Amount column's do: in by
                      the table's cell padding (pe-3) and its 1px frame (me-px). Classes, not a style attribute, so a
                      strict CSP lays it out the same. */}
                  <div className="flex justify-end pe-3">
                    <DescriptionList layout="split" className="w-full max-w-sm me-px text-sm">
                      <DescriptionItem term="Subtotal">{money(sums.subtotal)}</DescriptionItem>
                      <DescriptionItem term={`Tax (${formatNumber(inv.taxRate, locale, { style: 'percent', maximumFractionDigits: 2 })})`}>{money(sums.tax)}</DescriptionItem>
                      <DescriptionItem term="Total">{money(sums.total)}</DescriptionItem>
                      <DescriptionItem term="Paid">{money(inv.paid ? sums.total : 0)}</DescriptionItem>
                      <DescriptionItem term="Amount due" emphasis>{money(inv.paid ? 0 : sums.total)}</DescriptionItem>
                    </DescriptionList>
                  </div>
                </section>
              </>}
          </div>
        </Stack>
      </Container>
      <Toaster />
    </div>
  );
}

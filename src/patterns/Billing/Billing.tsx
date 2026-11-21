'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Meter } from '../../components/Meter/Meter';
import { Dialog } from '../../components/Dialog/Dialog';
import { Alert } from '../../components/Alert/Alert';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { Toaster, toast } from '../../components/Toast/Toast';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { useLocale } from '../../internal/provider';
import { formatDate } from '../../components/FormattedDate/FormattedDate';

/* Billing: the plan with what it costs and when it renews, how much of it is used, how it's paid (a card, a direct
   debit or an e-wallet), past invoices, and cancelling. For an app to copy. What it carries (WCAG 2.2, and the Ethical design rules):
   - The plan says what it costs and the day it renews, in the reader's locale, before anyone looks for it.
   - Cancelling takes no more steps than signing up: one button, then a dialog that says what changes and when, with
     Keep my plan and Cancel plan side by side, the same size. Nothing is deleted, and a cancelled plan can be resumed.
   - 1.4.1: usage says how much in words ("4 of 10 seats"), and "almost full" in words too, not only in color.
   - 1.3.1: invoices are a table with a caption; each Download link names its invoice ("Download the invoice of
     1 October 2026").
   - 3.3.1: a card that runs out before the next payment says so, in words as well as a badge, and so does a plan
     with no way to pay yet, each with the way to fix it.
   - 3.3.1, 4.1.3: a failed payment says so at the top, with the way to fix it; a cancel that fails says so in the
     dialog, which stays open; cancelling and resuming are said in a toast.
   - 4.1.3: while billing loads, main is busy with one placeholder name ("Loading billing"); a failed load says so,
     with Try again.
   Taking payments and storing the plan are the app's job: onCancel and onResume get the choices. */

export interface BillingPlan {
  name: string;
  /** The price per interval, in the currency's main unit (24 for $24). */
  price: number;
  currency: string;
  interval: 'month' | 'year';
  /** The next renewal, or the last day when cancelled: "2026-12-01". */
  renews: string;
  /** Cancelled: it stays active until `renews`, then stops. */
  cancelled?: boolean | undefined;
}
export interface BillingUsage { seats: { used: number; limit: number }; storageGb: { used: number; limit: number } }
export interface BillingCard { brand: string; last4: string; expires: string }
/** How the plan is paid: a card, a direct debit from a bank account, or an e-wallet. */
export type BillingPaymentMethod =
  | ({ kind: 'card' } & BillingCard)
  | { kind: 'bank'; bank: string; last4: string }
  | { kind: 'ewallet'; provider: string; phoneLast4: string };
export interface BillingInvoice { id: string; date: string; amount: number; status: 'paid' | 'due' | 'failed'; href: string }

export interface BillingProps {
  /** The plan. Default: a demo Team plan. */
  plan?: BillingPlan | undefined;
  /** How much of the plan is used. Default: demo numbers. */
  usage?: BillingUsage | undefined;
  /** The card it's paid with. Pass `paymentMethod` instead for a bank account or an e-wallet. */
  card?: BillingCard | undefined;
  /** How it's paid: a card, a direct debit or an e-wallet; null when nothing is on file yet. Wins over `card`. */
  paymentMethod?: BillingPaymentMethod | null | undefined;
  /** Past invoices, newest first. */
  invoices?: readonly BillingInvoice[] | undefined;
  /** Cancel plan was confirmed. Return its promise: a rejection keeps the dialog open and says so. */
  onCancel?: (() => unknown) | undefined;
  /** Resume plan was pressed on a cancelled plan. */
  onResume?: (() => void) | undefined;
  /** Where Change plan leads. Default: "#plans". */
  changePlanHref?: string | undefined;
  /** Where Update card (or Change payment method, or Add payment method) leads. Default: "#card". */
  updateCardHref?: string | undefined;
  /** Billing is on its way: placeholder parts, named once ("Loading billing"). Default: false. */
  loading?: boolean | undefined;
  /** Billing failed to load: a "Couldn’t load billing" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demoPlan: BillingPlan = { name: 'Team', price: 24, currency: 'USD', interval: 'month', renews: '2026-12-01' };
const demoUsage: BillingUsage = { seats: { used: 4, limit: 10 }, storageGb: { used: 8.6, limit: 10 } };
const demoCard: BillingCard = { brand: 'Visa', last4: '4242', expires: '2028-04' };
const demoInvoices: BillingInvoice[] = [
  { id: 'in3', date: '2026-11-01', amount: 24, status: 'paid', href: '#invoice-in3' },
  { id: 'in2', date: '2026-10-01', amount: 24, status: 'paid', href: '#invoice-in2' },
  { id: 'in1', date: '2026-09-01', amount: 24, status: 'paid', href: '#invoice-in1' },
];

// "1 December 2026" in the reader's locale for "2026-12-01", read as that calendar day wherever the reader is; a
// month ("2028-04") as "April 2028"; anything else as it came.
export function billingDate(iso: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso);
  if (!m) return iso;
  return (m[3] ? formatDate(iso, locale, { dateStyle: 'long' }) : formatDate(`${iso}-01`, locale, { options: { month: 'long', year: 'numeric' } })) || iso;
}

/** An amount in the reader's locale: "$24.00". */
export function money(amount: number, currency: string, locale: string): string {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount); } catch { return `${amount} ${currency}`; }
}

/** The method in words: "Visa ending 4242", "Direct debit from BCA, account ending 7781", "GoPay, phone ending 4410". */
export function methodText(m: BillingPaymentMethod): string {
  return m.kind === 'card' ? `${m.brand} ending ${m.last4}`
    : m.kind === 'bank' ? `Direct debit from ${m.bank}, account ending ${m.last4}` : `${m.provider}, phone ending ${m.phoneLast4}`;
}

const STATUS = { paid: ['Paid', 'success'], due: ['Due', 'warning'], failed: ['Payment failed', 'danger'] } as const;

/** The billing page: a skip link, a header, then main with the h1, the plan, usage, the card and the invoices. */
export function Billing({ plan = demoPlan, usage = demoUsage, card = demoCard, paymentMethod, invoices = demoInvoices, onCancel, onResume,
  changePlanHref = '#plans', updateCardHref = '#card', loading = false, loadFailed = false, onRetry }: BillingProps) {
  const locale = useLocale();
  const [cancelled, setCancelled] = React.useState(!!plan.cancelled);
  const [asking, setAsking] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const date = (iso: string) => billingDate(iso, locale);
  const price = money(plan.price, plan.currency, locale);
  const unpaid = invoices.find((i) => i.status === 'failed');
  const method = paymentMethod === undefined ? { kind: 'card' as const, ...card } : paymentMethod;
  // The way to fix the method names what it is: a card is updated, anything else is changed, and nothing is added.
  const fix = !method ? 'Add payment method' : method.kind === 'card' ? 'Update card' : 'Change payment method';
  // A card that runs out before the next payment ("2026-11" before a renewal on "2026-12-01") fails on that day.
  const runsOut = !cancelled && method?.kind === 'card' && method.expires < plan.renews.slice(0, 7);

  const ask = (open: boolean) => { setAsking(open); if (!open) setFailed(false); };
  // A cancel that fails, by rejecting or by throwing, keeps the dialog open and says so. The promise goes back to
  // the button, which shows it's busy while it runs.
  const cancel = () => {
    setFailed(false);
    return Promise.resolve().then(() => onCancel?.()).then(() => {
      setCancelled(true);
      setAsking(false);
      toast({ title: `Cancelled. ${plan.name} stays active until ${date(plan.renews)}.` });
    }, () => setFailed(true));
  };
  const [busy, setBusy] = React.useState(false);
  const confirm = () => { setBusy(true); void cancel().finally(() => setBusy(false)); };
  const resume = () => { setCancelled(false); onResume?.(); toast({ title: `Resumed. ${plan.name} renews on ${date(plan.renews)}.`, tone: 'success' }); };

  const full = (used: number, limit: number) => (used >= limit * 0.8 ? ', almost full' : '');

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" aria-busy={loading && !loadFailed ? true : undefined} className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 outline-none">
        <PageHeader title="Billing" description="Your plan, what it costs, and what you’ve paid." />
        {loadFailed ? <EmptyLoadFailed title="Couldn’t load billing" onRetry={() => onRetry?.()} headingLevel={2} /> : loading ? (
          ['Plan', 'Usage', 'Invoices'].map((t, i) => (
            <section key={t} aria-labelledby={`billing-loading-${i}`} className="flex flex-col gap-4">
              <Heading level={2} size="lg" id={`billing-loading-${i}`}>{t}</Heading>
              <Card><Skeleton shape="text" lines={3} label={i === 0 ? 'Loading billing' : ''} /></Card>
            </section>
          ))
        ) : <>
          {unpaid ? (
            <Alert tone="danger" title={`The payment on ${date(unpaid.date)} failed`}
              actions={<Link href={updateCardHref}>{fix}</Link>}>
              {method?.kind === 'card' ? 'Update your card' : method ? 'Change your payment method' : 'Add a payment method'} to keep {plan.name}. We’ll try the payment again when you do.
            </Alert>
          ) : null}

          <section aria-labelledby="billing-plan" className="flex flex-col gap-4">
            <Heading level={2} size="lg" id="billing-plan">Plan</Heading>
            <Card className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="m-0 text-lg font-semibold">{plan.name}{cancelled ? <Badge tone="warning" className="ms-2">Cancelled</Badge> : null}</p>
                <p className="m-0">{price} a {plan.interval}</p>
                <p className="m-0 text-text-muted">
                  {cancelled ? `Active until ${date(plan.renews)}, then it stops. Nothing is deleted.` : `Renews on ${date(plan.renews)} for ${price}.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {cancelled ? <Button onClick={resume}>Resume plan</Button> : <>
                  <Button href={changePlanHref} variant="outline">Change plan</Button>
                  <Button variant="ghost" onClick={() => ask(true)}>Cancel plan</Button>
                </>}
              </div>
            </Card>
          </section>

          <section aria-labelledby="billing-usage" className="flex flex-col gap-4">
            <Heading level={2} size="lg" id="billing-usage">Usage</Heading>
            <Card className="flex flex-col gap-4">
              <Meter label="Seats" showValue value={usage.seats.used} max={usage.seats.limit} high={usage.seats.limit * 0.8} optimum={0}
                formatValue={(v, _, max) => `${v} of ${max} seats${full(v, max)}`} />
              <Meter label="Storage" showValue value={usage.storageGb.used} max={usage.storageGb.limit} high={usage.storageGb.limit * 0.8} optimum={0}
                formatValue={(v, _, max) => `${v} GB of ${max} GB${full(v, max)}`} />
            </Card>
          </section>

          <section aria-labelledby="billing-card" className="flex flex-col gap-4">
            <Heading level={2} size="lg" id="billing-card">Payment method</Heading>
            <Card className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                {method ? <p className="m-0">
                  {methodText(method)}{method.kind === 'card' ? `, expires ${date(method.expires)}` : ''}
                  {runsOut ? <Badge tone="warning" className="ms-2">Expires soon</Badge> : null}
                </p> : <p className="m-0">No payment method yet.</p>}
                {runsOut ? <p className="m-0 text-text-muted">It runs out before the next payment on {date(plan.renews)}. Update it to keep {plan.name}.</p>
                  : !method && !cancelled ? <p className="m-0 text-text-muted">Add one before {date(plan.renews)} to keep {plan.name}.</p> : null}
              </div>
              <Link href={updateCardHref}>{fix}</Link>
            </Card>
          </section>

          <section aria-labelledby="billing-invoices" className="flex flex-col gap-4">
            <Heading level={2} size="lg" id="billing-invoices">Invoices</Heading>
            {invoices.length ? (
              <Table caption="Invoices" hideCaption pinEnd>
                <TableHead><TableRow>
                  <TableHeaderCell>Date</TableHeaderCell><TableHeaderCell align="end">Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell><TableHeaderCell align="end"><span className="sr-only">Download</span></TableHeaderCell>
                </TableRow></TableHead>
                <TableBody>{invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="whitespace-nowrap"><time dateTime={i.date}>{date(i.date)}</time></TableCell>
                    <TableCell align="end">{money(i.amount, plan.currency, locale)}</TableCell>
                    <TableCell><Badge tone={STATUS[i.status][1]}>{STATUS[i.status][0]}</Badge></TableCell>
                    <TableCell align="end" className="whitespace-nowrap"><Link href={i.href} aria-label={`Download the invoice of ${date(i.date)}`}>Download</Link></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            ) : <p className="m-0 text-text-muted">No invoices yet. The first comes on {date(plan.renews)}.</p>}
          </section>
        </>}

        <Dialog alert open={asking} onOpenChange={ask} title={`Cancel ${plan.name}?`}
          description={`${plan.name} stays active until ${date(plan.renews)}, and you won’t be charged again. After that, the workspace moves to the Free plan. Nothing is deleted, and you can resume any time before then.`}>
          <div className="flex flex-col gap-4">
            {failed ? <Alert tone="danger">Couldn’t cancel {plan.name}. Try again.</Alert> : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => ask(false)}>Keep my plan</Button>
              <Button variant="outline" destructive loading={busy} onClick={confirm}>Cancel plan</Button>
            </div>
          </div>
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}

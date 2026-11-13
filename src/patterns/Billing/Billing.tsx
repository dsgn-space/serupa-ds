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
import { Loader } from '../../components/Loader/Loader';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { Toaster, toast } from '../../components/Toast/Toast';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { useLocale } from '../../internal/provider';

/* Billing: the plan with what it costs and when it renews, how much of it is used, the card it's paid with, past
   invoices, and cancelling. For an app to copy. What it carries (WCAG 2.2, and the Ethical design rules):
   - The plan says what it costs and the day it renews, in the reader's locale, before anyone looks for it.
   - Cancelling takes no more steps than signing up: one button, then a dialog that says what changes and when, with
     Keep my plan and Cancel plan side by side, the same size. Nothing is deleted, and a cancelled plan can be resumed.
   - 1.4.1: usage says how much in words ("4 of 10 seats"), and "almost full" in words too, not only in color.
   - 1.3.1: invoices are a table with a caption; each Download link names its invoice ("Download the invoice of
     1 October 2026").
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
export interface BillingInvoice { id: string; date: string; amount: number; status: 'paid' | 'due' | 'failed'; href: string }

export interface BillingProps {
  /** The plan. Default: a demo Team plan. */
  plan?: BillingPlan | undefined;
  /** How much of the plan is used. Default: demo numbers. */
  usage?: BillingUsage | undefined;
  /** The card it's paid with. */
  card?: BillingCard | undefined;
  /** Past invoices, newest first. */
  invoices?: readonly BillingInvoice[] | undefined;
  /** Cancel plan was confirmed. Return its promise: a rejection keeps the dialog open and says so. */
  onCancel?: (() => unknown) | undefined;
  /** Resume plan was pressed on a cancelled plan. */
  onResume?: (() => void) | undefined;
  /** Where Change plan leads. Default: "#plans". */
  changePlanHref?: string | undefined;
  /** Where Update card leads. Default: "#card". */
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
  const at = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3] ?? 1));
  try { return new Intl.DateTimeFormat(locale, m[3] ? { dateStyle: 'long' } : { month: 'long', year: 'numeric' }).format(at); } catch { return iso; }
}

/** An amount in the reader's locale: "$24.00". */
export function money(amount: number, currency: string, locale: string): string {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount); } catch { return `${amount} ${currency}`; }
}

const STATUS = { paid: ['Paid', 'success'], due: ['Due', 'warning'], failed: ['Payment failed', 'danger'] } as const;

/** The billing page: a skip link, a header, then main with the h1, the plan, usage, the card and the invoices. */
export function Billing({ plan = demoPlan, usage = demoUsage, card = demoCard, invoices = demoInvoices, onCancel, onResume,
  changePlanHref = '#plans', updateCardHref = '#card', loading = false, loadFailed = false, onRetry }: BillingProps) {
  const locale = useLocale();
  const [cancelled, setCancelled] = React.useState(!!plan.cancelled);
  const [asking, setAsking] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const date = (iso: string) => billingDate(iso, locale);
  const price = money(plan.price, plan.currency, locale);
  const unpaid = invoices.find((i) => i.status === 'failed');

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
            <section key={t} aria-labelledby={`billing-loading-${i}`} className="flex flex-col gap-3">
              <Heading level={2} size="lg" id={`billing-loading-${i}`}>{t}</Heading>
              <Card><Loader variant="skeleton" shape="text" lines={3} label={i === 0 ? 'Loading billing' : ''} /></Card>
            </section>
          ))
        ) : <>
          {unpaid ? (
            <Alert tone="danger" title={`The payment on ${date(unpaid.date)} failed`}
              actions={<Link href={updateCardHref}>Update card</Link>}>
              Update your card to keep {plan.name}. We’ll try the payment again when you do.
            </Alert>
          ) : null}

          <section aria-labelledby="billing-plan" className="flex flex-col gap-3">
            <Heading level={2} size="lg" id="billing-plan">Plan</Heading>
            <Card className="flex flex-wrap items-start justify-between gap-4">
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

          <section aria-labelledby="billing-usage" className="flex flex-col gap-3">
            <Heading level={2} size="lg" id="billing-usage">Usage</Heading>
            <Card className="flex flex-col gap-5">
              <Meter label="Seats" showValue value={usage.seats.used} max={usage.seats.limit} high={usage.seats.limit * 0.8} optimum={0}
                formatValue={(v, _, max) => `${v} of ${max} seats${full(v, max)}`} />
              <Meter label="Storage" showValue value={usage.storageGb.used} max={usage.storageGb.limit} high={usage.storageGb.limit * 0.8} optimum={0}
                formatValue={(v, _, max) => `${v} GB of ${max} GB${full(v, max)}`} />
            </Card>
          </section>

          <section aria-labelledby="billing-card" className="flex flex-col gap-3">
            <Heading level={2} size="lg" id="billing-card">Payment method</Heading>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <p className="m-0">{card.brand} ending {card.last4}, expires {date(card.expires)}</p>
              <Link href={updateCardHref}>Update card</Link>
            </Card>
          </section>

          <section aria-labelledby="billing-invoices" className="flex flex-col gap-3">
            <Heading level={2} size="lg" id="billing-invoices">Invoices</Heading>
            {invoices.length ? (
              <Table caption="Invoices" hideCaption>
                <TableHead><TableRow>
                  <TableHeaderCell>Date</TableHeaderCell><TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell><TableHeaderCell><span className="sr-only">Download</span></TableHeaderCell>
                </TableRow></TableHead>
                <TableBody>{invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell><time dateTime={i.date}>{date(i.date)}</time></TableCell>
                    <TableCell>{money(i.amount, plan.currency, locale)}</TableCell>
                    <TableCell><Badge tone={STATUS[i.status][1]}>{STATUS[i.status][0]}</Badge></TableCell>
                    <TableCell><Link href={i.href} aria-label={`Download the invoice of ${date(i.date)}`}>Download</Link></TableCell>
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

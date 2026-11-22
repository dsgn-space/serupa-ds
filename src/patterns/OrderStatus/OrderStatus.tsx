'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { Dialog } from '../../components/Dialog/Dialog';
import { Alert } from '../../components/Alert/Alert';
import { Card } from '../../components/Card/Card';
import { Stepper } from '../../components/Stepper/Stepper';
import { Timeline, TimelineItem } from '../../components/Timeline/Timeline';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Loader } from '../../components/Loader/Loader';
import { Toaster, toast } from '../../components/Toast/Toast';
import { FormattedNumber } from '../../components/FormattedNumber/FormattedNumber';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Order status: where an order is, after it's placed: its stage in words, the steps it goes through, what happened
   and when, what was bought, and a way to cancel while that's still possible. For an app to copy. What it carries
   (WCAG 2.2):
   - 1.4.1, 1.3.1: the stage is a sentence first ("On its way", "Arriving Tuesday, March 4"), so nobody has to read
     it off a row of dots. The Stepper under it says which steps are done and which is the current one in words.
   - 1.3.1: what happened is an ordered list, newest first, each event with a time a machine can read.
   - 4.1.3: a delay says so in a warning above the steps, with the reason and the new day.
   - 3.3.4, 3.3.6: cancelling asks first, in a dialog that names the order and says what happens to the money, and
     whose way out is "Keep order", not a second "Cancel". A cancel that fails says so in the dialog, which stays open.
   - 2.4.3, 4.1.3: after a cancel the button is gone, so focus goes to the h1, the stage says "Cancelled", and a
     toast says so too.
   - 3.2.4, 1.4.1: once the order has shipped there is no Cancel button, and a sentence says why and what to do.
   - 1.3.1: the items are a list, and the totals a description list, with the total in words ("Total").
   - 4.1.3, 3.3.1: while the order loads, placeholders named once; a failed load says so, with Try again.
   Cancelling is the app's job: onCancel is called once the shopper confirms; reject its promise when it fails. */

export type OrderStage = 'placed' | 'packed' | 'shipped' | 'delivered';
export interface OrderEvent {
  id: string;
  /** When it happened: an ISO date and time. */
  at: string;
  /** What happened: "Left the warehouse". */
  title: string;
  /** Where, or what's next: "Jakarta sorting center". */
  detail?: string | undefined;
}
export interface OrderItem {
  id: string;
  /** With the choices made: "Linen shirt, Sand, M". */
  name: string;
  quantity: number;
  /** The price of one, in the currency's main unit. */
  price: number;
}
export interface OrderInfo {
  /** What the shop calls it: "1042". */
  number: string;
  stage: OrderStage;
  /** It was cancelled: the steps give way to a line that says so. */
  cancelled?: boolean | undefined;
  /** The day it's due, in words: "Tuesday, March 4". */
  arriving?: string | undefined;
  /** Why it's late, as a sentence: "The courier is behind after the storm." */
  delay?: string | undefined;
  /** Who carries it, and its page for this parcel. */
  carrier?: { name: string; href: string } | undefined;
  /** What happened so far, newest first. */
  events: readonly OrderEvent[];
  items: readonly OrderItem[];
  /** What delivery cost. 0 says "Free". */
  delivery: number;
  /** Where it's going, a line each. */
  address: readonly string[];
}

export interface OrderStatusProps {
  /** The order. Default: a demo order on its way. */
  order?: OrderInfo | undefined;
  /** An ISO 4217 code. Default: "USD". */
  currency?: string | undefined;
  /** Cancels the order, once the shopper has confirmed. Return its promise: a rejection keeps the dialog open and
      says so. Without it there is no Cancel order button. */
  onCancel?: (() => unknown) | undefined;
  /** The order is on its way from the server: placeholders, named once ("Loading order"). Default: false. */
  loading?: boolean | undefined;
  /** The order failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the order again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: OrderInfo = {
  number: '1042', stage: 'shipped', arriving: 'Tuesday, March 4',
  carrier: { name: 'JNE', href: '#jne' },
  events: [
    { id: 'e4', at: '2025-03-02T08:15:00', title: 'Arrived at the sorting center', detail: 'Jakarta' },
    { id: 'e3', at: '2025-03-01T16:40:00', title: 'Left the warehouse', detail: 'Bandung' },
    { id: 'e2', at: '2025-03-01T11:05:00', title: 'Packed' },
    { id: 'e1', at: '2025-02-28T19:22:00', title: 'Order placed', detail: 'Paid by card ending 4242' },
  ],
  items: [
    { id: 'i1', name: 'Linen shirt, Sand, M', quantity: 2, price: 39 },
    { id: 'i2', name: 'Canvas tote', quantity: 1, price: 18 },
  ],
  delivery: 0,
  address: ['Ana Lima', 'Jl. Braga No. 12', 'Bandung 40111', 'Indonesia'],
};

const STAGES: readonly OrderStage[] = ['placed', 'packed', 'shipped', 'delivered'];
const STEPS = [{ title: 'Placed' }, { title: 'Packed' }, { title: 'Shipped' }, { title: 'Delivered' }];

/** The stage as a sentence, and what comes next: { title: "On its way", detail: "Arriving Tuesday, March 4." }. */
export function stageWords(order: Pick<OrderInfo, 'stage' | 'cancelled' | 'arriving'>): { title: string; detail: string } {
  if (order.cancelled) return { title: 'Cancelled', detail: 'Anything you paid goes back to you within 5 working days.' };
  if (order.stage === 'delivered') return { title: 'Delivered', detail: 'It’s been handed over at the address below.' };
  const due = order.arriving ? ` Arriving ${order.arriving}.` : '';
  if (order.stage === 'shipped') return { title: 'On its way', detail: `The courier has it.${due}` };
  if (order.stage === 'packed') return { title: 'Packed', detail: `It’s waiting for the courier.${due}` };
  return { title: 'Order placed', detail: `We’re getting it ready.${due}` };
}

/** Whether the order can still be cancelled: only before it has shipped. */
export const canCancel = (order: Pick<OrderInfo, 'stage' | 'cancelled'>): boolean => !order.cancelled && (order.stage === 'placed' || order.stage === 'packed');

/** What the items cost together, before delivery. */
export const subtotal = (items: readonly OrderItem[]): number => items.reduce((n, i) => n + i.price * i.quantity, 0);

/** The order's page: a skip link, a header, then main with the order's h1, its stage, what happened and what's in it. */
export function OrderStatus({ order: start = demo, currency = 'USD', onCancel, loading = false, loadFailed = false, onRetry, online }: OrderStatusProps) {
  const locale = useLocale(undefined);
  const [order, setOrder] = React.useState(start);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setOrder(start); } }
  const heading = React.useRef<HTMLHeadingElement>(null);
  const money = (n: number) => <FormattedNumber value={n} format="currency" currency={currency} />;
  const words = stageWords(order);
  const name = `Order ${order.number}`;
  const sum = subtotal(order.items);

  // Cancelling: asked first, and done only once the server says so.
  const [asking, setAsking] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const ask = (open: boolean) => { if (open) setFailed(false); setAsking(open); };
  const cancel = () => {
    setFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onCancel?.()).then(() => {
      setOrder((o) => ({ ...o, cancelled: true, delay: undefined, events: [{ id: 'cancelled', at: new Date().toISOString(), title: 'Order cancelled' }, ...o.events] }));
      setAsking(false);
      toast({ title: `${name} is cancelled`, tone: 'success' });
    }, () => setFailed(true)).finally(() => setBusy(false));
  };
  // The Cancel button goes with the order, so focus goes to the page's h1.
  const was = React.useRef(!!order.cancelled);
  React.useEffect(() => { if (order.cancelled && !was.current) heading.current?.focus(); was.current = !!order.cancelled; }, [order.cancelled]);

  const section = 'flex flex-col gap-4';
  const h2 = 'm-0 text-lg font-semibold';
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">This is where your order was when the page loaded. Cancelling needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Orders', href: '#orders' }, { label: name }]} title={name} headingRef={heading} />

        <div className="flex flex-col gap-8 pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load the order" onRetry={() => onRetry?.()} headingLevel={2} />
            : loading ? <Card><Loader variant="skeleton" shape="text" lines={5} label="Loading order" /></Card> : <>
              <section aria-labelledby="stage" className={section}>
                <h2 id="stage" className="m-0 text-2xl font-semibold">{words.title}</h2>
                <p className="m-0 text-text-muted">{words.detail}</p>
                {order.delay && !order.cancelled ? <Alert tone="warning" title="It’s running late">{order.delay}</Alert> : null}
                {order.cancelled ? null : <Stepper aria-label="Order progress" steps={STEPS} current={order.stage === 'delivered' ? STEPS.length : STAGES.indexOf(order.stage)} />}
                <div className="flex flex-wrap items-center gap-3">
                  {order.carrier && !order.cancelled && order.stage !== 'placed' && order.stage !== 'packed'
                    ? <Link href={order.carrier.href} external>Track the parcel with {order.carrier.name}</Link> : null}
                  {onCancel && canCancel(order) ? <Button variant="outline" destructive onClick={() => ask(true)} data-print="hide">Cancel order</Button> : null}
                </div>
                {!order.cancelled && !canCancel(order) && order.stage === 'shipped'
                  ? <p className="m-0 text-sm text-text-muted">It has shipped, so it can’t be cancelled. You can send it back once it arrives.</p> : null}
              </section>

              <section aria-labelledby="happened" className={section}>
                <h2 id="happened" className={h2}>What’s happened</h2>
                <Timeline aria-labelledby="happened">
                  {order.events.map((e, i) => (
                    <TimelineItem key={e.id} title={e.title} time={<FormattedDate value={e.at} timeStyle="short" />} tone={i === 0 ? (order.cancelled ? 'danger' : 'primary') : 'neutral'}>{e.detail}</TimelineItem>
                  ))}
                </Timeline>
              </section>

              <section aria-labelledby="items" className={section}>
                <h2 id="items" className={h2}>Items</h2>
                <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
                  {order.items.map((i) => (
                    <li key={i.id} className="flex flex-wrap justify-between gap-3 border-b border-border pb-2">
                      <span>{formatNumber(i.quantity, locale)} × {i.name}</span>
                      <span>{money(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <DescriptionList layout="split">
                  <DescriptionItem term="Subtotal">{money(sum)}</DescriptionItem>
                  <DescriptionItem term="Delivery">{order.delivery ? money(order.delivery) : 'Free'}</DescriptionItem>
                  <DescriptionItem term="Total" emphasis>{money(sum + order.delivery)}</DescriptionItem>
                </DescriptionList>
              </section>

              <section aria-labelledby="address" className={section}>
                <h2 id="address" className={h2}>Delivery address</h2>
                <address className="not-italic">{order.address.map((line) => <div key={line}>{line}</div>)}</address>
              </section>
            </>}
        </div>

        <Dialog open={asking} onOpenChange={ask} title={`Cancel ${name.toLowerCase()}?`}
          description="It won’t be sent, and anything you paid goes back to you within 5 working days.">
          <div className="flex flex-col gap-4">
            {failed ? <Alert tone="danger">Couldn’t cancel the order. Try again.</Alert> : null}
            <div className="flex flex-wrap gap-2">
              <Button destructive loading={busy} onClick={cancel}>Cancel order</Button>
              <Button variant="outline" onClick={() => ask(false)}>Keep order</Button>
            </div>
          </div>
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}

'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { Badge, type BadgeTone } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { Select } from '../../components/Select/Select';
import { LoadMore } from '../../components/LoadMore/LoadMore';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Toaster, toast } from '../../components/Toast/Toast';
import { FormattedNumber } from '../../components/FormattedNumber/FormattedNumber';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed, EmptyNoResults } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Order history: every order you've placed, newest first, found by what was in it or by where it's got to, each with a
   way to see it and buy it again. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the orders are a list, each headed by its number, with its date, total and items said in words.
   - 1.4.1: where an order has got to is a word in a badge ("On the way", "Delivered"), never a color alone.
   - 2.4.4, 2.4.6: each link and button names its order ("View order A-10432", "Buy again: order A-10432").
   - 4.1.3: how many orders match is a status, read out as the search or the filter changes.
   - 3.3.1: no match says so with the words searched for, and a way to clear the search and the filter.
   - 2.4.3: Show more adds the next orders and puts focus on the first new one, so nothing is read twice.
   - 4.1.3: Buy again shows it's busy, then a toast says what went into the cart, or that it couldn't.
   - 4.1.3, 3.3.1: while the orders load, a placeholder named once; a failed load says so, with Try again.
   The orders are the app's: pass them all, or page them with onLoadMore; onBuyAgain puts an order's items in the
   cart, and rejects when it can't. */

export type OrderState = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface PastOrder {
  /** "A-10432". */
  number: string;
  /** When it was placed: "2025-03-04". */
  placed: string;
  total: number;
  state: OrderState;
  /** What was in it, by name: ["Linen shirt", "Canvas tote"]. */
  items: string[];
  href?: string | undefined;
}

export interface OrderHistoryProps {
  /** The orders, newest first. Default: demo orders. */
  orders?: PastOrder[] | undefined;
  /** ISO 4217 currency. Default: "USD". */
  currency?: string | undefined;
  /** How many to show at first, and add with each Show more. Default: 5. */
  pageSize?: number | undefined;
  /** Puts an order's items in the cart again. Reject when it can't. */
  onBuyAgain?: ((order: string) => unknown) | undefined;
  /** The orders are on their way: placeholders, named once ("Loading orders"). Default: false. */
  loading?: boolean | undefined;
  /** They failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

export const STATES: Record<OrderState, { label: string; tone: BadgeTone }> = {
  processing: { label: 'Being packed', tone: 'neutral' },
  shipped: { label: 'On the way', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  returned: { label: 'Returned', tone: 'warning' },
};
const NAMES = ['Linen shirt', 'Canvas tote', 'Wool socks', 'Rain jacket', 'Clay mug', 'Desk lamp', 'Notebook', 'Tea towel'];
const KINDS: OrderState[] = ['shipped', 'processing', 'delivered', 'delivered', 'cancelled', 'delivered', 'returned', 'delivered'];
const demo: PastOrder[] = Array.from({ length: 12 }, (_, i) => ({
  number: `A-${10432 - i * 37}`,
  placed: `2025-${String(12 - Math.floor(i / 2)).padStart(2, '0')}-${String(20 - (i % 2) * 9).padStart(2, '0')}`,
  total: 24 + ((i * 29) % 140),
  state: KINDS[i % KINDS.length]!,
  items: [NAMES[i % NAMES.length]!, ...(i % 3 ? [NAMES[(i + 3) % NAMES.length]!] : []), ...(i % 4 === 0 ? [NAMES[(i + 5) % NAMES.length]!] : [])],
  href: `#order-A-${10432 - i * 37}`,
}));

/** The orders that match the words (in the number or an item's name) and the state, in their order. */
export function matchOrders(orders: readonly PastOrder[], q: string, state: OrderState | ''): PastOrder[] {
  const words = q.trim().toLowerCase();
  return orders.filter((o) => (!state || o.state === state)
    && (!words || o.number.toLowerCase().includes(words) || o.items.some((n) => n.toLowerCase().includes(words))));
}

/** "Linen shirt", "Linen shirt and Canvas tote", "Linen shirt, Canvas tote and 2 more". */
export function itemWords(items: readonly string[], more: (n: number) => string = (n) => `${n} more`): string {
  if (items.length <= 2) return items.join(' and ');
  return `${items[0]}, ${items[1]} and ${more(items.length - 2)}`;
}

/** The order history page: a skip link, a header, then main with the h1, the search and filter, and the orders. */
export function OrderHistory({ orders = demo, currency = 'USD', pageSize = 5, onBuyAgain, loading = false, loadFailed = false, onRetry, online }: OrderHistoryProps) {
  const locale = useLocale();
  const [q, setQ] = React.useState('');
  const [state, setState] = React.useState<OrderState | ''>('');
  const [shown, setShown] = React.useState(pageSize);
  const [buying, setBuying] = React.useState<string | null>(null);
  const found = matchOrders(orders, q, state);
  const page = found.slice(0, shown);
  const n = (x: number) => formatNumber(x, locale);
  const filter = (next: { q?: string; state?: OrderState | '' }) => {
    if (next.q !== undefined) setQ(next.q);
    if (next.state !== undefined) setState(next.state);
    setShown(pageSize);
  };
  const mainRef = React.useRef<HTMLElement>(null);
  const more = () => {
    const first = page.length;
    setShown((s) => s + pageSize);
    requestAnimationFrame(() => mainRef.current?.querySelectorAll<HTMLElement>('[data-order-heading]')[first]?.focus());
  };
  const buyAgain = (o: PastOrder) => {
    setBuying(o.number);
    void Promise.resolve().then(() => onBuyAgain?.(o.number)).then(
      () => toast({ title: `Added to your cart: ${itemWords(o.items, (k) => `${n(k)} more`)}`, tone: 'success' }),
      () => toast({ title: `Couldn’t add order ${o.number} to your cart. Try again.`, tone: 'danger' }),
    ).finally(() => setBuying(null));
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main ref={mainRef} id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">These are the orders loaded before you went offline. Buying again needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Account', href: '#account' }, { label: 'Orders' }]} title="Orders" description="Every order you’ve placed, newest first." />
        <div className="flex flex-col gap-5 pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load your orders" onRetry={() => onRetry?.()} headingLevel={2} />
            : loading ? <Card><Skeleton shape="text" lines={6} label="Loading orders" /></Card>
            : !orders.length ? <EmptyState icon="receipt_long" title="No orders yet" description="What you buy shows here, with where it’s got to." headingLevel={2}
                actions={<Link href="#shop">Start shopping</Link>} />
            : <>
              <div role="search" aria-label="Orders" className="flex flex-wrap items-end gap-3">
                <Field label="Search orders" hint="By order number or what was in it." className="min-w-0 flex-1">
                  <SearchInput value={q} onChange={(e) => filter({ q: e.target.value })} onClear={() => filter({ q: '' })} />
                </Field>
                <Field label="Show">
                  <Select value={state} onChange={(e) => filter({ state: e.target.value as OrderState | '' })}
                    options={[{ value: '', label: 'All orders' }, ...(Object.keys(STATES) as OrderState[]).map((k) => ({ value: k, label: STATES[k].label }))]} />
                </Field>
              </div>
              <p id="order-count" role="status" className="m-0 text-sm text-text-muted">
                {found.length === orders.length ? `${n(orders.length)} orders` : `${n(found.length)} of ${n(orders.length)} orders`}
              </p>
              {!found.length ? (
                <EmptyNoResults query={q.trim()} title={(text) => (text ? `No orders match “${text}”` : 'No orders match this filter')}
                  description="Check the spelling, or clear the search to see every order." headingLevel={2} onClearFilters={() => filter({ q: '', state: '' })} />
              ) : (
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {page.map((o) => (
                    <li key={o.number}>
                      <Card className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 data-order-heading tabIndex={-1} className="m-0 text-base font-semibold outline-none">Order {o.number}</h2>
                          <Badge tone={STATES[o.state].tone}>{STATES[o.state].label}</Badge>
                        </div>
                        <p className="m-0 text-sm text-text-muted">
                          Placed <FormattedDate value={o.placed} /> · <FormattedNumber value={o.total} format="currency" currency={currency} />
                        </p>
                        <p className="m-0 wrap-break-word">{itemWords(o.items, (k) => `${n(k)} more`)}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Link href={o.href ?? '#'} aria-label={`View order ${o.number}`}>View order</Link>
                          {o.state === 'cancelled' ? null : (
                            <Button size="sm" variant="outline" loading={buying === o.number} aria-label={`Buy again: order ${o.number}`} onClick={() => buyAgain(o)}>Buy again</Button>
                          )}
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
              {found.length ? <LoadMore onLoadMore={more} hasMore={page.length < found.length} count={page.length} total={found.length} label="Show more orders" /> : null}
            </>}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { Image } from '../../components/Image/Image';
import { Link } from '../../components/Link/Link';
import { Select } from '../../components/Select/Select';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Toaster, toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Loader } from '../../components/Loader/Loader';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Saved items: things kept for later, with what changed since (a lower price, few left, sold out), and a way to move
   each to the cart or let it go. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: each item is a list item named by its heading, a link to the product.
   - 1.4.1: what changed is said in words in a badge ("Price dropped", "Only 2 left", "Sold out"), and a lower price
     shows the old one struck through with "Was" in words.
   - 2.5.3, 2.4.6: each button's name starts with its visible words and ends with the item it acts on ("Move to cart:
     Linen shirt"), so a list of buttons read alone still says which is which.
   - 3.3.4: Remove acts at once and offers Undo in a toast, rather than "Are you sure?"; focus moves to the next
     item's button, or the heading when none is left (2.4.3).
   - 4.1.3: how many items, and the sort, are said in a status line as they change.
   Moving and removing are the app's: onMoveToCart and onRemove get the item's id; reject onMoveToCart when it can't. */

export interface SavedItem {
  id: string;
  name: string;
  href: string;
  image: string;
  /** The price now, and when it was saved. */
  price: number;
  savedPrice: number;
  /** How many are left: 0 is sold out. Leave out when there are plenty. */
  left?: number | undefined;
  /** When it was saved: "2026-02-03". */
  saved: string;
}

export type SavedSort = 'newest' | 'price-low' | 'price-high' | 'dropped';

export interface SavedItemsProps {
  /** The saved items. Default: demo items. */
  items?: SavedItem[] | undefined;
  /** ISO 4217 currency. Default: "USD". */
  currency?: string | undefined;
  /** Moves an item to the cart. Reject when it can't. */
  onMoveToCart?: ((id: string) => unknown) | undefined;
  /** Removes an item for good, once its toast closes without Undo. */
  onRemove?: ((id: string) => void) | undefined;
  /** Still loading: a placeholder shows instead of the saved items. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load your saved items" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

// A drawn thing in a colored square, so the demo loads nothing from another server.
const pic = (fill: string, bg: string, shape: string) => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><path d="${shape}" fill="${fill}"/></svg>`);
const SHIRT = 'M150 90 L110 110 L70 170 L115 195 L130 175 V320 H270 V175 L285 195 L330 170 L290 110 L250 90 Q200 130 150 90Z';
const BAG = 'M110 150 H290 L305 330 H95Z M160 150 Q160 90 200 90 Q240 90 240 150 H225 Q225 105 200 105 Q175 105 175 150Z';
const CUP = 'M120 150 H280 L265 300 Q260 320 240 320 H160 Q140 320 135 300Z M280 180 Q330 180 325 220 Q320 255 272 255 L275 235 Q305 235 305 218 Q305 200 278 200Z';
const HAT = 'M110 260 Q110 120 200 120 Q290 120 290 260Z M95 255 H305 V300 H95Z';
const demo: SavedItem[] = [
  { id: 's1', name: 'Linen shirt', href: '#linen-shirt', image: pic('#f5f0e6', '#d6cfc0', SHIRT), price: 39, savedPrice: 52, saved: '2026-02-12' },
  { id: 's2', name: 'Canvas tote bag', href: '#tote', image: pic('#c9b48a', '#eee6d6', BAG), price: 24, savedPrice: 24, left: 2, saved: '2026-02-08' },
  { id: 's3', name: 'Ceramic pour-over set', href: '#pour-over', image: pic('#e8e4dc', '#9fb3a8', CUP), price: 68, savedPrice: 68, left: 0, saved: '2026-01-30' },
  { id: 's4', name: 'Wool beanie', href: '#beanie', image: pic('#9b2c2c', '#e5dada', HAT), price: 18, savedPrice: 18, saved: '2026-01-21' },
];
const SORTS: { value: SavedSort; label: string }[] = [
  { value: 'newest', label: 'Newest saved first' },
  { value: 'price-low', label: 'Price, low to high' },
  { value: 'price-high', label: 'Price, high to low' },
  { value: 'dropped', label: 'Price dropped first' },
];

/** The items in the order asked for; ties keep the newest saved first. */
export function sortSaved(items: readonly SavedItem[], sort: SavedSort): SavedItem[] {
  const newest = [...items].sort((a, b) => b.saved.localeCompare(a.saved));
  if (sort === 'price-low') return newest.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') return newest.sort((a, b) => b.price - a.price);
  if (sort === 'dropped') return newest.sort((a, b) => Number(b.price < b.savedPrice) - Number(a.price < a.savedPrice));
  return newest;
}

/** What changed since it was saved, in words, or null. */
export function savedChange(item: SavedItem): { label: string; tone: 'success' | 'warning' | 'neutral' } | null {
  if (item.left === 0) return { label: 'Sold out', tone: 'neutral' };
  if (item.price < item.savedPrice) return { label: 'Price dropped', tone: 'success' };
  if (item.left !== undefined && item.left <= 5) return { label: `Only ${item.left} left`, tone: 'warning' };
  return null;
}

/** The saved items page: a skip link, a header, then main with the h1, the sort, and the items, or an empty state. */
export function SavedItems({ items = demo, currency = 'USD', onMoveToCart, onRemove, loading = false, loadFailed = false, onRetry, online }: SavedItemsProps) {
  const locale = useLocale();
  const [list, setList] = React.useState(items);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setList(items); } }
  const [gone, setGone] = React.useState<ReadonlySet<string>>(new Set());
  const [sort, setSort] = React.useState<SavedSort>('newest');
  const [busy, setBusy] = React.useState<string | null>(null);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency });
  const shown = sortSaved(list.filter((i) => !gone.has(i.id)), sort);
  const later = (f: () => void) => requestAnimationFrame(f);
  const focusAfter = (item: SavedItem) => {
    const at = shown.indexOf(item), next = shown[at + 1] ?? shown[at - 1];
    later(() => (next ? document.getElementById(`remove-${next.id}`) : heading.current)?.focus());
  };

  const remove = (item: SavedItem) => {
    focusAfter(item);
    setGone((g) => new Set(g).add(item.id));
    toast.undo({
      title: `Removed ${item.name}`,
      commit: () => onRemove?.(item.id),
      onUndo: () => { setGone((g) => { const n = new Set(g); n.delete(item.id); return n; }); later(() => document.getElementById(`remove-${item.id}`)?.focus()); },
    });
  };
  const move = (item: SavedItem) => {
    setBusy(item.id);
    void Promise.resolve().then(() => onMoveToCart?.(item.id)).then(() => {
      focusAfter(item);
      setList((l) => l.filter((i) => i.id !== item.id));
      toast({ title: `Moved ${item.name} to your cart`, tone: 'success' });
    }, () => toast({ title: `Couldn’t move ${item.name} to your cart. Try again.`, tone: 'danger' })).finally(() => setBusy(null));
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#cart">Cart</Link>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">These prices are from when the page loaded. Moving items to your bag needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Account', href: '#account' }, { label: 'Saved items' }]} title="Saved items"
            description="Kept for later. We’ll show here when a price drops or few are left." />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load your saved items" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading saved items" /></Card> : (<>
          <section aria-labelledby="saved-list" className="flex flex-col gap-4 pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="saved-list" ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold outline-none">Your list</h2>
              {shown.length > 1 ? (
                <Field label="Sort" id="saved-sort" orientation="horizontal">
                  <Select options={SORTS} value={sort} onChange={(e) => setSort(e.target.value as SavedSort)} />
                </Field>
              ) : null}
            </div>
            <p id="saved-count" role="status" className="m-0 text-sm text-text-muted">
              {shown.length === 1 ? '1 item' : `${formatNumber(shown.length, locale)} items`}{shown.length > 1 ? `, ${SORTS.find((s) => s.value === sort)!.label.toLowerCase()}` : ''}
            </p>
            {shown.length ? (
              <ul role="list" className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((item) => {
                  const change = savedChange(item);
                  const out = item.left === 0;
                  return (
                    <Card as="li" key={item.id} padding="md" aria-labelledby={`saved-${item.id}`} className="flex min-w-0 flex-col gap-3 wrap-anywhere">
                      <Image src={item.image} alt="" ratio="square" rounded />
                      <h3 id={`saved-${item.id}`} className="m-0 text-base font-semibold"><Link href={item.href}>{item.name}</Link></h3>
                      <p className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-lg font-semibold">{money(item.price)}</span>
                        {item.price < item.savedPrice ? <span className="text-sm text-text-muted">Was <del>{money(item.savedPrice)}</del></span> : null}
                        {change ? <Badge tone={change.tone}>{change.label}</Badge> : null}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        {out ? null : (
                          <Button variant="secondary" size="sm" loading={busy === item.id} onClick={() => move(item)} aria-label={`Move to cart: ${item.name}`}>Move to cart</Button>
                        )}
                        <Button id={`remove-${item.id}`} variant="ghost" size="sm" onClick={() => remove(item)} aria-label={`Remove: ${item.name}`}>Remove</Button>
                      </div>
                    </Card>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon="favorite" headingLevel={3} title="Nothing saved yet"
                description="Choose Save on any product to keep it here, with its price as it was."
                actions={<Link href="#shop">Browse the shop</Link>} />
            )}
          </section>
          </>)}
        </Stack>
      </Container>
      <Toaster />
    </div>
  );
}

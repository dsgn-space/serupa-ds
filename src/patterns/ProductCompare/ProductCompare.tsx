'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Image } from '../../components/Image/Image';
import { Link } from '../../components/Link/Link';
import { Switch } from '../../components/Switch/Switch';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Card } from '../../components/Card/Card';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Toaster, toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Product compare: two to four products side by side, a row for each thing they differ on, and a way to see only the
   differences. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: it's a table with a caption: each product heads a column, each feature heads a row, so a screen reader
     says both for every cell. The first column stays put while the rest scroll on a phone (1.4.10).
   - 1.4.1: yes and no are said in words, not by a tick or a cross alone; a missing value says "Not said".
   - 4.1.3: "Only what differs" says how many rows are shown in a status line.
   - 2.5.3, 2.4.3: each Remove button's name ends with its product ("Remove: Linen shirt"); removing one moves focus to
     the next product's Remove, or the heading once none are left, and the empty state links back to the shop.
   - Add to cart says what was added in a toast (4.1.3).
   What's compared is the app's: pass the products and the features to show. */

export type CompareValue = string | number | boolean | null;

export interface CompareProduct {
  id: string;
  name: string;
  href: string;
  image: string;
  price: number;
  /** The product's value for each feature, by the feature's key. */
  values: Record<string, CompareValue>;
}

export interface CompareFeature {
  key: string;
  label: string;
  /** Words after a number: "g", "hours". */
  unit?: string | undefined;
}

export interface ProductCompareProps {
  /** The products, two to four. Default: demo headphones. */
  products?: CompareProduct[] | undefined;
  /** The features, in the order of the rows. Default: the demo's. */
  features?: CompareFeature[] | undefined;
  /** ISO 4217 currency. Default: "USD". */
  currency?: string | undefined;
  /** Adds a product to the cart. Reject when it can't. */
  onAddToCart?: ((id: string) => unknown) | undefined;
  /** Told when a product leaves the comparison. */
  onRemove?: ((id: string) => void) | undefined;
  /** Still loading: a placeholder shows instead of the products. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load the products" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const pic = (band: string, cup: string, bg: string) => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/>` +
  `<path d="M100 230 Q100 90 200 90 Q300 90 300 230" fill="none" stroke="${band}" stroke-width="22"/><rect x="72" y="210" width="62" height="100" rx="24" fill="${cup}"/><rect x="266" y="210" width="62" height="100" rx="24" fill="${cup}"/></svg>`);
const demoFeatures: CompareFeature[] = [
  { key: 'battery', label: 'Battery', unit: 'hours' },
  { key: 'weight', label: 'Weight', unit: 'g' },
  { key: 'noise', label: 'Noise cancelling' },
  { key: 'wired', label: 'Works with a cable' },
  { key: 'fold', label: 'Folds flat' },
  { key: 'colors', label: 'Colors' },
];
const demo: CompareProduct[] = [
  { id: 'h1', name: 'Calm 300', href: '#calm-300', image: pic('#27272a', '#3f3f46', '#e4e4e7'), price: 199, values: { battery: 30, weight: 250, noise: true, wired: true, fold: true, colors: 'Black, sand' } },
  { id: 'h2', name: 'Calm 200', href: '#calm-200', image: pic('#52525b', '#71717a', '#f4f4f5'), price: 129, values: { battery: 24, weight: 262, noise: true, wired: true, fold: false, colors: 'Black' } },
  { id: 'h3', name: 'Street One', href: '#street-one', image: pic('#1e3a8a', '#2563eb', '#dbeafe'), price: 79, values: { battery: 40, weight: 190, noise: false, wired: true, fold: true, colors: null } },
];

/** The features whose values aren't all the same across the products. */
export function differingFeatures(products: readonly CompareProduct[], features: readonly CompareFeature[]): CompareFeature[] {
  return features.filter((f) => new Set(products.map((p) => JSON.stringify(p.values[f.key] ?? null))).size > 1);
}

/** A value in words: "Yes", "No", "30 hours", "Not said". */
export function valueWords(v: CompareValue | undefined, feature: CompareFeature, locale?: string): string {
  if (v === null || v === undefined || v === '') return 'Not said';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'number') return `${formatNumber(v, locale)}${feature.unit ? ` ${feature.unit}` : ''}`;
  return v;
}

/** The compare page: a skip link, a header, then main with the h1, the switch, and the table, or an empty state. */
export function ProductCompare({ products = demo, features = demoFeatures, currency = 'USD', onAddToCart, onRemove, loading = false, loadFailed = false, onRetry, online }: ProductCompareProps) {
  const locale = useLocale();
  const [list, setList] = React.useState(products);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) setList(products); }
  const [onlyDiff, setOnlyDiff] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency });
  const rows = onlyDiff ? differingFeatures(list, features) : features;

  const remove = (p: CompareProduct) => {
    const at = list.indexOf(p), next = list[at + 1] ?? list[at - 1];
    setList((l) => l.filter((x) => x.id !== p.id));
    onRemove?.(p.id);
    requestAnimationFrame(() => (next ? document.getElementById(`compare-remove-${next.id}`) : heading.current)?.focus());
  };
  const add = (p: CompareProduct) => {
    void Promise.resolve().then(() => onAddToCart?.(p.id)).then(
      () => toast({ title: `Added ${p.name} to your cart`, tone: 'success' }),
      () => toast({ title: `Couldn’t add ${p.name} to your cart. Try again.`, tone: 'danger' }));
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#cart">Cart</Link>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">These prices are from when the page loaded. Adding to your bag needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Headphones', href: '#shop' }, { label: 'Compare' }]} title="Compare headphones"
            description="Up to four side by side. Add more from any product page." />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the products" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Skeleton shape="text" lines={6} label="Loading the products" /></Card> : (
          <section aria-labelledby="compare-table" className="flex flex-col gap-4 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="compare-table" ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold outline-none">
                {list.length === 1 ? '1 product' : `${formatNumber(list.length, locale)} products`}
              </h2>
              {list.length > 1 ? <Switch checked={onlyDiff} onCheckedChange={setOnlyDiff}>Only what differs</Switch> : null}
            </div>
            {list.length ? (
              <>
                <p id="compare-rows" role="status" className="m-0 text-text-muted">
                  {onlyDiff ? `${formatNumber(rows.length, locale)} of ${formatNumber(features.length, locale)} features differ` : `All ${formatNumber(features.length, locale)} features`}
                </p>
                <Table caption="The products side by side, a feature in each row" hideCaption layout="fixed" pinStart>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell scope="col" width={160}>Feature</TableHeaderCell>
                      {list.map((p) => (
                        <TableHeaderCell key={p.id} scope="col" width={200}>
                          <span className="flex flex-col gap-2 font-normal">
                            <Image src={p.image} alt="" ratio="square" rounded />
                            <Link href={p.href} className="font-semibold">{p.name}</Link>
                            <span className="text-lg font-semibold">{money(p.price)}</span>
                          </span>
                        </TableHeaderCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((f) => (
                      <TableRow key={f.key}>
                        <TableHeaderCell scope="row">{f.label}</TableHeaderCell>
                        {list.map((p) => {
                          const v = p.values[f.key];
                          return <TableCell key={p.id} className={v === null || v === undefined ? 'text-text-muted' : undefined}>{valueWords(v, f, locale)}</TableCell>;
                        })}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableHeaderCell scope="row"><span className="sr-only">Actions</span></TableHeaderCell>
                      {list.map((p) => (
                        <TableCell key={p.id}>
                          <span className="flex flex-col items-start gap-2">
                            <Button size="sm" variant="secondary" onClick={() => add(p)} aria-label={`Add to cart: ${p.name}`}>Add to cart</Button>
                            <Button id={`compare-remove-${p.id}`} size="sm" variant="ghost" onClick={() => remove(p)} aria-label={`Remove: ${p.name}`}>Remove</Button>
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            ) : (
              <EmptyState icon="compare_arrows" headingLevel={3} title="Nothing to compare"
                description="Choose Compare on two or more products to see them side by side." actions={<Link href="#shop">Back to headphones</Link>} />
            )}
          </section>
          )}
        </Stack>
      </Container>
      <Toaster />
    </div>
  );
}

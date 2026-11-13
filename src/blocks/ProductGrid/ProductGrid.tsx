'use client';
import * as React from 'react';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Heading } from '../../components/Heading/Heading';
import { Image } from '../../components/Image/Image';
import { Link } from '../../components/Link/Link';
import { Rating } from '../../components/Rating/Rating';
import { toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';

/* Product grid (RU18): product cards in a responsive grid, for a shop's category or search page. What it carries
   (WCAG 2.2):
   - 1.3.1: the products are a list (role="list", since WebKit stops calling a list without bullets one), each card
     is a list item named by its product, and each name is a heading, so a screen reader can list and jump between them.
   - 2.4.4: the name is the one link to the product page; the picture beside it is decorative (alt=""), so a reader
     doesn't hear each product twice.
   - 1.4.1 / 1.3.1: a sale price says "Was" in words beside the old price, and the saving in a Badge: never a
     strike-through alone, which isn't read out and is easy to miss.
   - 1.1.1: the rating is one image named by its value ("Rating, 4.5 out of 5"), with the number of reviews in text.
   - 2.4.6 / 2.5.3: each Add to cart button starts with its visible words and ends with the product's name, so a list of
     buttons still makes sense out of context and voice control still finds "Add to cart".
   - 4.1.3: adding shows the button busy (loading), then a toast says what was added, or that it failed and why.
   - Sold out says so in words, in place of the button.
   - Prices are written the way the reader's locale writes money. Each word is a label, English by default. */

export interface Product {
  id: string;
  name: string;
  /** The product's page. */
  href: string;
  /** A picture of it. It's decorative beside the name, so it needs no alt text. */
  image: string;
  /** The price now. */
  price: number;
  /** The price before a sale, when it's on sale: higher than price. */
  was?: number | undefined;
  /** The average rating, out of 5. */
  rating?: number | undefined;
  /** How many reviews the rating comes from. */
  reviews?: number | undefined;
  soldOut?: boolean | undefined;
}

export interface ProductGridLabels {
  /** Before the old price of a product on sale. */
  was: string;
  /** The sale Badge: the saving as a whole percentage. */
  off: (percent: number) => string;
  /** The rating image's name, before its value. */
  rating: string;
  /** The number of reviews: count to pick the word, formatted to show (in the locale's digits). */
  reviews: (count: number, formatted: string) => string;
  addToCart: string;
  /** The toast once a product is in the cart. */
  added: (name: string) => string;
  /** The toast when adding failed. */
  notAdded: (name: string) => string;
  soldOut: string;
}

const english: ProductGridLabels = {
  was: 'Was',
  off: (percent) => `${percent}% off`,
  rating: 'Rating',
  reviews: (count, formatted) => `${formatted} ${count === 1 ? 'review' : 'reviews'}`,
  addToCart: 'Add to cart',
  added: (name) => `Added ${name} to your cart`,
  notAdded: (name) => `Couldn’t add ${name} to your cart. Try again.`,
  soldOut: 'Sold out',
};

export interface ProductGridProps {
  products: readonly Product[];
  /** An ISO 4217 code: "USD", "IDR", "EUR". */
  currency: string;
  /** Add to cart was pressed: the button stays busy until the promise settles, then a toast says how it went. */
  onAddToCart: (productId: string) => void | Promise<unknown>;
  /** Each product's name. Default: 3, under the page's h2. */
  headingLevel?: 2 | 3 | 4 | undefined;
  labels?: Partial<ProductGridLabels> | undefined;
}

/** One product: its picture, name as the link to its page, price, rating and Add to cart. */
export function ProductCard({ product: p, currency, onAddToCart, headingLevel = 3, labels }: Omit<ProductGridProps, 'products'> & { product: Product }) {
  const l = { ...english, ...labels };
  const locale = useLocale();
  const [busy, setBusy] = React.useState(false);
  const money = (value: number) => formatNumber(value, locale, { format: 'currency', currency, ...(Number.isInteger(value) && { minimumFractionDigits: 0, maximumFractionDigits: 0 }) });
  const sale = p.was !== undefined && p.was > p.price;
  const add = async () => {
    setBusy(true);
    try {
      await onAddToCart(p.id);
      toast({ title: l.added(p.name), tone: 'success' });
    } catch {
      toast({ title: l.notAdded(p.name), tone: 'danger' });
    } finally { setBusy(false); }
  };
  const nameId = `${React.useId()}-name`;   // its own on the page: two grids can hold the same product
  return (
    <Card as="li" padding="md" aria-labelledby={nameId} className="flex h-full min-w-0 flex-col gap-3 wrap-anywhere">
      <Image src={p.image} alt="" ratio="square" rounded />
      <Heading level={headingLevel} size="base" id={nameId}><Link href={p.href}>{p.name}</Link></Heading>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-lg font-semibold">{money(p.price)}</span>
        {sale && <span className="text-sm text-text-muted">{l.was} <del>{money(p.was!)}</del></span>}
        {sale && <Badge tone="danger">{l.off(Math.floor(Number(((1 - p.price / p.was!) * 100).toFixed(6))))}</Badge>}
      </p>
      {p.rating !== undefined && (
        // A <div>, since Rating is one: inside a <p>, server HTML would end the <p> there and hydrating wouldn't match.
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <Rating readOnly value={p.rating} size="sm" aria-label={l.rating} />
          {p.reviews !== undefined && <span>{l.reviews(p.reviews, formatNumber(p.reviews, locale))}</span>}
        </div>
      )}
      <div className="mt-auto">
        {p.soldOut
          ? <p className="text-sm font-semibold text-text-muted">{l.soldOut}</p>
          : <Button className="w-full" variant="secondary" loading={busy} onClick={add}
              aria-label={`${l.addToCart}, ${p.name}`}>{l.addToCart}</Button>}
      </div>
    </Card>
  );
}

/** Products in a grid that fits the screen: one column on a phone, up to four on a wide screen. */
export function ProductGrid({ products, ...card }: ProductGridProps) {
  return (
    <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} {...card} />)}
    </ul>
  );
}

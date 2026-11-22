'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Breadcrumb, BreadcrumbItem } from '../../components/Breadcrumb/Breadcrumb';
import { Carousel } from '../../components/Carousel/Carousel';
import { Image } from '../../components/Image/Image';
import { Rating } from '../../components/Rating/Rating';
import { Link } from '../../components/Link/Link';
import { Field } from '../../components/Field/Field';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { Alert } from '../../components/Alert/Alert';
import { Accordion, AccordionItem } from '../../components/Accordion/Accordion';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Loader } from '../../components/Loader/Loader';
import { RelativeTime } from '../../components/RelativeTime/RelativeTime';
import { Toaster, toast } from '../../components/Toast/Toast';
import { FormattedNumber } from '../../components/FormattedNumber/FormattedNumber';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Product page: one product in a shop, with its pictures, its price, the choices to make (color, size), how many,
   and Add to cart. For an app to copy. What it carries (WCAG 2.2):
   - 1.1.1: every picture has its own alt text, which says what that picture shows that the others don't. The
     pictures are a Carousel that never moves on its own, and each opens larger.
   - 1.3.1, 1.4.1: a sale price says "Was" in words beside the old price, with the saving in a Badge: never a
     strike-through alone. The rating is one image named by its value, with the number of reviews as a link to them.
   - 1.3.1, 4.1.2: each choice is a group of radios named by its legend ("Size"). A choice that's sold out stays in
     the group, can't be picked, and says "Sold out" in words.
   - 3.3.1, 3.3.3: Add to cart with a choice missing says which ("Choose a size.") next to that group, and focus
     goes to its first radio. Nothing is picked for the shopper.
   - 3.3.2, 3.3.4: the quantity is a NumberInput that keeps to what's in stock, and says how many are left when few.
   - 4.1.3: adding shows the button busy, then a toast says what was added, in full ("2 × Linen shirt, Sand, M"),
     and the cart link's name carries the new count. An add that fails says so above the button, and keeps every choice.
   - 2.4.6, 1.3.1: the product's name is the h1; Details, Delivery and Reviews are h2 sections.
   - 4.1.3, 3.3.1: while the product loads, placeholders named once; a failed load says so, with Try again.
   The cart is the app's job: onAddToCart gets the choices and the quantity; reject its promise when adding fails. */

export interface ProductPicture {
  src: string;
  /** What this picture shows that the others don't: "The back, with a box pleat". */
  alt: string;
}
export interface ProductChoice {
  value: string;
  /** "Sand", "M". */
  label: string;
  /** A CSS color for a color choice: a 16px dot before the name, so people can pick by eye. The name is what's read out. */
  swatch?: string | undefined;
  /** Out of stock: it stays in the group and says "Sold out", but can't be picked. */
  soldOut?: boolean | undefined;
}
export interface ProductOption {
  id: string;
  /** The group's name: "Color", "Size". */
  label: string;
  choices: readonly ProductChoice[];
}
export interface ProductReview {
  id: string;
  author: string;
  /** Out of 5. */
  rating: number;
  /** When it was written: an ISO date. */
  date: string;
  title: string;
  body: string;
}
export interface ProductInfo {
  name: string;
  /** One or two sentences under the price. */
  summary: string;
  /** The price of one now, in the currency's main unit (39.5 is $39.50). */
  price: number;
  /** The price before a sale, when it's on sale: higher than price. */
  was?: number | undefined;
  /** The average rating, out of 5. */
  rating?: number | undefined;
  pictures: readonly ProductPicture[];
  options: readonly ProductOption[];
  /** How many are in stock. 0 says "Sold out" in place of Add to cart; 5 or fewer says how many are left. */
  left?: number | undefined;
  /** Facts in pairs: "Fabric" and "100% linen". */
  details: readonly { term: string; value: string }[];
  /** Delivery and returns, in a sentence or two. */
  delivery: string;
  reviews: readonly ProductReview[];
}
/** What goes in the cart: the choice made for each option, by the option's id, and how many. */
export interface ProductCartLine {
  options: Record<string, string>;
  quantity: number;
}

export interface ProductPageProps {
  /** The product. Default: a demo shirt. */
  product?: ProductInfo | undefined;
  /** An ISO 4217 code. Default: "USD". */
  currency?: string | undefined;
  /** How many items the cart holds as the page opens. Default: 0. */
  cartCount?: number | undefined;
  /** Adds to the cart. Return its promise: a rejection says the add failed and keeps every choice. */
  onAddToCart?: ((line: ProductCartLine) => unknown) | undefined;
  /** The product is on its way: placeholders, named once ("Loading product"). Default: false. */
  loading?: boolean | undefined;
  /** The product failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the product again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

// A drawn shirt, so the demo loads nothing from another server.
const shirt = (fill: string, bg: string, extra = '') => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/>` +
  `<path d="M150 90 L110 110 L70 170 L115 195 L125 180 L125 320 L275 320 L275 180 L285 195 L330 170 L290 110 L250 90 Q200 125 150 90 Z" fill="${fill}" stroke="#00000033" stroke-width="2"/>${extra}</svg>`);
const demo: ProductInfo = {
  name: 'Linen shirt',
  summary: 'A loose shirt in washed linen that softens with every wash. Cut straight, with a box pleat at the back.',
  price: 39, was: 52, rating: 4.5, left: 4,
  pictures: [
    { src: shirt('#e9dfc8', '#d6cfc0', '<path d="M200 108 L200 320" stroke="#00000033" stroke-width="2"/>'), alt: 'The front of the shirt in Sand, with a button placket' },
    { src: shirt('#e9dfc8', '#cfc8b8', '<path d="M185 112 L185 160 M215 112 L215 160" stroke="#00000033" stroke-width="2"/>'), alt: 'The back, with a box pleat under the collar' },
    { src: shirt('#3c5a80', '#d9e0ea', '<path d="M200 108 L200 320" stroke="#00000033" stroke-width="2"/>'), alt: 'The front of the shirt in Navy' },
  ],
  options: [
    { id: 'color', label: 'Color', choices: [{ value: 'sand', label: 'Sand', swatch: '#e9dfc8' }, { value: 'navy', label: 'Navy', swatch: '#3c5a80' }] },
    { id: 'size', label: 'Size', choices: [{ value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }, { value: 'xl', label: 'XL', soldOut: true }] },
  ],
  details: [
    { term: 'Fabric', value: '100% linen, 160 g/m²' },
    { term: 'Fit', value: 'Loose. Take your usual size.' },
    { term: 'Care', value: 'Machine wash at 30 °C, dry on a line' },
    { term: 'Made in', value: 'Bandung, Indonesia' },
  ],
  delivery: 'Free delivery in 3 to 5 working days. Send it back within 30 days, unworn, and the return is free.',
  reviews: [
    { id: 'r1', author: 'Ana Lima', rating: 5, date: '2025-02-18', title: 'Soft from the first wear', body: 'Lighter than I expected and it doesn’t cling. The M fits like my other shirts.' },
    { id: 'r2', author: 'Chen Wei', rating: 4, date: '2025-01-30', title: 'Good shirt, creases fast', body: 'It’s linen, so it creases by lunch. The color is exactly as in the pictures.' },
  ],
};

/** The saving on a sale price as a whole percentage, or null when it isn't a sale: saving(39, 52) is 25. */
export const saving = (price: number, was?: number): number | null => (was != null && was > price ? Math.round((1 - price / was) * 100) : null);

/** The ids of the options with nothing picked yet, in the page's order. */
export const missingOptions = (options: readonly ProductOption[], picked: Record<string, string>): string[] =>
  options.filter((o) => !o.choices.some((c) => c.value === picked[o.id] && !c.soldOut)).map((o) => o.id);

/** What was added, in full: "2 × Linen shirt, Sand, M". `count` is the quantity as the reader's locale writes it. */
export function lineName(product: ProductInfo, line: ProductCartLine, count: string = String(line.quantity)): string {
  const chosen = product.options.map((o) => o.choices.find((c) => c.value === line.options[o.id])?.label).filter(Boolean);
  return `${count} × ${[product.name, ...chosen].join(', ')}`;
}

/** "1 item" or "3 items": English's rule, since the words are English; an app translating them uses its own. */
export const countItems = (n: number, formatted: string = String(n)): string => (n === 1 ? `${formatted} item` : `${formatted} items`);

/** The product page: a skip link, a header with the cart, then main with the pictures, the product's h1 and its form. */
export function ProductPage({ product = demo, currency = 'USD', cartCount = 0, onAddToCart, loading = false, loadFailed = false, onRetry, online }: ProductPageProps) {
  const locale = useLocale(undefined);
  const money = (n: number) => <FormattedNumber value={n} format="currency" currency={currency} />;
  const off = saving(product.price, product.was);
  const soldOut = product.left === 0;
  const max = product.left != null && product.left > 0 ? product.left : undefined;

  // A group with one choice in stock is already made; the others wait for the shopper.
  const [picked, setPicked] = React.useState<Record<string, string>>(() => {
    const only: Record<string, string> = {};
    for (const o of product.options) { const open = o.choices.filter((c) => !c.soldOut); if (open.length === 1) only[o.id] = open[0]!.value; }
    return only;
  });
  const [quantity, setQuantity] = React.useState<number | null>(1);
  const [missing, setMissing] = React.useState<readonly string[]>([]);
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [inCart, setInCart] = React.useState(cartCount);

  const pick = (id: string, value: string) => {
    setPicked({ ...picked, [id]: value });
    if (missing.includes(id)) setMissing(missing.filter((m) => m !== id));
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const gaps = missingOptions(product.options, picked);
    setMissing(gaps);
    if (gaps.length) { e.currentTarget.querySelector<HTMLInputElement>(`input[name="option-${gaps[0]}"]:not(:disabled)`)?.focus(); return; }
    const line: ProductCartLine = { options: picked, quantity: Math.min(Math.max(1, quantity ?? 1), max ?? Infinity) };
    setFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onAddToCart?.(line)).then(() => {
      setInCart((n) => n + line.quantity);
      toast({ title: 'Added to your cart', description: lineName(product, line, formatNumber(line.quantity, locale)), tone: 'success' });
    }, () => setFailed(true)).finally(() => setBusy(false));
  };

  // The name isn't known while it loads or after a failed load, so the h1 says only what the page is.
  const body = loadFailed ? <>
    <h1 className="sr-only">Product</h1>
    <EmptyLoadFailed title="Couldn’t load the product" onRetry={() => onRetry?.()} headingLevel={2} />
  </> : loading ? (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2" aria-busy="true">
      <h1 className="sr-only">Product</h1>
      <Loader variant="skeleton" shape="rect" label="Loading product" className="aspect-square h-auto" />
      <div className="flex flex-col gap-4" aria-hidden="true">
        <Loader variant="skeleton" shape="text" lines={2} label="" />
        <Loader variant="skeleton" shape="text" lines={5} label="" />
      </div>
    </div>
  ) : (<>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Carousel aria-label={`Pictures of ${product.name}`}>
        {product.pictures.map((p, i) => <Image key={p.src} src={p.src} alt={p.alt} ratio="square" viewable priority={i === 0} />)}
      </Carousel>

      <div className="flex flex-col gap-4">
        <h1 className="m-0 text-3xl font-semibold">{product.name}</h1>
        {product.rating != null ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Rating readOnly value={product.rating} size="sm" aria-label="Rating" />
            {product.reviews.length ? <Link href="#reviews">{countReviews(product.reviews.length, formatNumber(product.reviews.length, locale))}</Link> : null}
          </div>
        ) : null}
        <p className="m-0 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-semibold">{money(product.price)}</span>
          {off != null ? <>
            <span className="text-text-muted">Was {money(product.was!)}</span>
            <Badge tone="success">{off}% off</Badge>
          </> : null}
        </p>
        <p className="m-0 text-text-muted">{product.summary}</p>

        {soldOut ? <Alert tone="neutral" title="Sold out">None are left in any size or color.</Alert> : (
          <form onSubmit={add} noValidate className="flex flex-col gap-4">
            {product.options.map((o) => (
              <Field key={o.id} group label={o.label} required error={missing.includes(o.id) ? `Choose a ${o.label.toLowerCase()}.` : undefined}>
                <RadioGroup name={`option-${o.id}`} variant="card" orientation="horizontal" value={picked[o.id] ?? null} onValueChange={(v) => pick(o.id, String(v))}>
                  {o.choices.map((c) => <Radio key={c.value} value={c.value} disabled={!!c.soldOut} description={c.soldOut ? 'Sold out' : undefined}>
                    {c.swatch ? <span aria-hidden="true" className="inline-block size-4 me-2 align-text-bottom rounded-full border border-border-strong" style={{ backgroundColor: c.swatch }} /> : null}{c.label}
                  </Radio>)}
                </RadioGroup>
              </Field>
            ))}
            <Field label="Quantity" id="quantity" hint={max != null && max <= 5 ? `Only ${formatNumber(max, locale)} left.` : undefined} className="max-w-40">
              <NumberInput name="quantity" value={quantity} onValueChange={setQuantity} min={1} max={max} steppers />
            </Field>
            {failed ? <Alert tone="danger">Couldn’t add it to your cart. Try again.</Alert> : null}
            <div><Button type="submit" size="lg" startIcon="shopping_cart" loading={busy}>Add to cart</Button></div>
          </form>
        )}
      </div>
    </div>

    <section aria-labelledby="about" className="flex flex-col gap-4">
      <h2 id="about" className="m-0 text-xl font-semibold">About this product</h2>
      <Accordion selectionMode="multiple" defaultValue={['details']} headingLevel={3}>
        <AccordionItem value="details" title="Details">
          <DescriptionList layout="inline">
            {product.details.map((d) => <DescriptionItem key={d.term} term={d.term}>{d.value}</DescriptionItem>)}
          </DescriptionList>
        </AccordionItem>
        <AccordionItem value="delivery" title="Delivery and returns"><p className="m-0">{product.delivery}</p></AccordionItem>
      </Accordion>
    </section>

    <section aria-labelledby="reviews" className="flex flex-col gap-4">
      <h2 id="reviews" tabIndex={-1} className="m-0 text-xl font-semibold outline-none">Reviews</h2>
      {product.reviews.length ? (
        <ul className="m-0 flex list-none flex-col gap-4 p-0" role="list">
          {product.reviews.map((r) => (
            <li key={r.id} className="flex flex-col gap-1 border-b border-border pb-4">
              <Rating readOnly value={r.rating} size="sm" aria-label="Rating" />
              <h3 className="m-0 text-base font-semibold">{r.title}</h3>
              <p className="m-0">{r.body}</p>
              <p className="m-0 text-sm text-text-muted">{r.author}, <RelativeTime date={r.date} /></p>
            </li>
          ))}
        </ul>
      ) : <p className="m-0 text-text-muted">No reviews yet.</p>}
    </section>
  </>);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link href="#cart" tone="neutral">Cart, {countItems(inCart, formatNumber(inCart, locale))}</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline">This price and stock are from when the page loaded. Adding to your bag needs a connection.</OfflineBanner>
        <Breadcrumb>
          {/* The last item, the page itself, has no link. */}
          {[['Shop', '#shop'], ['Shirts', '#shirts'], [loading || loadFailed ? 'Product' : product.name, undefined]].map(([label, href]) => (
            <BreadcrumbItem key={label} href={href}>{label}</BreadcrumbItem>
          ))}
        </Breadcrumb>
        {body}
      </main>
      <Toaster />
    </div>
  );
}

/** "1 review" or "12 reviews". */
export const countReviews = (n: number, formatted: string = String(n)): string => (n === 1 ? `${formatted} review` : `${formatted} reviews`);

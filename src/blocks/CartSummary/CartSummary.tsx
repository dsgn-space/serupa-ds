'use client';
import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { DescriptionItem, DescriptionList } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { Heading } from '../../components/Heading/Heading';
import { Image } from '../../components/Image/Image';
import { Input, InputAction } from '../../components/Input/Input';
import { Link } from '../../components/Link/Link';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { announce } from '../../internal/announce';
import { useLocale } from '../../internal/provider';

/* Cart summary (RU19): what's in the cart, with quantities, a coupon and the total, for an app to copy. What it
   carries (WCAG 2.2):
   - 1.3.1: a region named by its heading; the items are a list (role="list", since WebKit stops calling a list without
     bullets one), and the sums are a description list, each amount after its term.
   - 2.4.6 / 2.5.3: each quantity field and Remove button is named after its item ("Quantity, Linen shirt", "Remove
     Linen shirt"), starting with the words people see, so a list of them still says which is which.
   - 3.3.4 / 2.4.3: Remove takes the item away at once with Undo in a toast, instead of "Are you sure?"; it's removed
     for good only when the toast goes. Focus moves to the next item's name, or to the heading when none is left.
   - 4.1.3: a new total is said politely once it settles ("Total $112.50"), so a change of quantity or coupon is heard
     without moving focus. A coupon that doesn't apply says why in the field's error.
   - Amounts are written the way the reader's locale writes money. Each word is a label, English by default. */

export interface CartItem {
  id: string;
  name: string;
  /** The product's page: the name links to it. */
  href?: string | undefined;
  /** A small picture of it. It's decorative beside the name, so it needs no alt text. */
  image?: string | undefined;
  /** The price of one. */
  price: number;
  quantity: number;
  /** The most one order can take: stock, or a limit per customer. */
  max?: number | undefined;
}

export interface CartSummaryLabels {
  title: string;
  /** The price of one, under the name. */
  each: (price: string) => string;
  quantity: (name: string) => string;
  remove: string;
  /** The toast after Remove, with Undo. */
  removed: (name: string) => string;
  coupon: string;
  apply: string;
  /** The discount's term, with the code that gave it. */
  discount: (code: string) => string;
  removeCoupon: string;
  subtotal: string;
  /** The tax's term, with its rate as a percentage. */
  tax: (rate: string) => string;
  total: string;
  /** Said when the total changes. */
  totalIs: (total: string) => string;
  checkout: string;
  empty: string;
  continueShopping: string;
}

const english: CartSummaryLabels = {
  title: 'Your cart',
  each: (price) => `${price} each`,
  quantity: (name) => `Quantity, ${name}`,
  remove: 'Remove',
  removed: (name) => `Removed ${name}`,
  coupon: 'Coupon code',
  apply: 'Apply',
  discount: (code) => `Discount (${code})`,
  removeCoupon: 'Remove coupon',
  subtotal: 'Subtotal',
  tax: (rate) => `Tax (${rate})`,
  total: 'Total',
  totalIs: (total) => `Total ${total}`,
  checkout: 'Check out',
  empty: 'Your cart is empty.',
  continueShopping: 'Continue shopping',
};

export interface CartSummaryProps {
  items: readonly CartItem[];
  /** An ISO 4217 code: "USD", "IDR", "EUR". */
  currency: string;
  /** A quantity changed: update the item. */
  onQuantityChange: (itemId: string, quantity: number) => void;
  /** An item is removed for good: the Undo toast went without Undo, or the page was left. */
  onRemove: (itemId: string) => void;
  /** A coupon was applied: resolve with the discount, or reject with an Error whose message says why it doesn't apply. */
  onApplyCoupon?: ((code: string) => Promise<number>) | undefined;
  /** The tax rate, such as 0.11 for 11%. Without it there's no tax line. */
  taxRate?: number | undefined;
  onCheckout: () => void | Promise<unknown>;
  /** Where "Continue shopping" goes from an empty cart. Default: "/". */
  continueHref?: string | undefined;
  /** The heading's level. Default: 2. */
  headingLevel?: 2 | 3 | undefined;
  labels?: Partial<CartSummaryLabels> | undefined;
}

/** The cart: each item with its quantity and Remove (with Undo), a coupon, and the sums down to the total. */
export function CartSummary({ items, currency, onQuantityChange, onRemove, onApplyCoupon, taxRate, onCheckout, continueHref = '/', headingLevel = 2, labels }: CartSummaryProps) {
  const l = { ...english, ...labels };
  const locale = useLocale();
  const base = React.useId();
  const heading = React.useRef<HTMLHeadingElement>(null);
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(() => new Set());
  const [code, setCode] = React.useState('');
  const [coupon, setCoupon] = React.useState<{ code: string; amount: number } | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [applying, setApplying] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const money = (value: number) => formatNumber(value, locale, { format: 'currency', currency });
  const shown = items.filter((i) => !hidden.has(i.id));
  const subtotal = shown.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = coupon ? Math.min(coupon.amount, subtotal) : 0;
  const tax = taxRate ? Math.round((subtotal - discount) * taxRate * 100) / 100 : 0;
  const total = subtotal - discount + tax;

  // A new total is said once it settles, not at first and not for each step of a quantity held down.
  const said = React.useRef(total), totalSaid = l.totalIs(money(total));
  React.useEffect(() => {
    if (total === said.current) return;
    const t = window.setTimeout(() => { said.current = total; announce(totalSaid); }, 500);
    return () => window.clearTimeout(t);
  }, [total, totalSaid]);

  const nameOf = (id: string) => document.getElementById(`${base}-${id}`);
  // The removals whose Undo is still up, by item: Check out removes them for good first, so the order leaves them out.
  const pending = React.useRef(new Map<string, string>());
  const latestCheckout = React.useRef(onCheckout);
  React.useEffect(() => { latestCheckout.current = onCheckout; });
  const remove = (item: CartItem) => {
    const at = shown.indexOf(item), next = shown[at + 1] || shown[at - 1];
    setHidden((h) => new Set(h).add(item.id));
    // After the list renders without it: the next item's name, or the heading when the cart is empty.
    requestAnimationFrame(() => { (next ? nameOf(next.id) : heading.current)?.focus(); });
    pending.current.set(item.id, toast.undo({
      title: l.removed(item.name),
      // Gone for good: the app drops it, so it's no longer hidden here, and the same product added again shows.
      commit: () => { pending.current.delete(item.id); onRemove(item.id); setHidden((h) => { const n = new Set(h); n.delete(item.id); return n; }); },
      onUndo: () => { pending.current.delete(item.id); setHidden((h) => { const n = new Set(h); n.delete(item.id); return n; }); requestAnimationFrame(() => nameOf(item.id)?.focus()); },
    }));
  };
  const apply = async () => {
    const typed = code.trim();
    if (!typed || !onApplyCoupon) return;
    setApplying(true); setCouponError(null);
    try {
      setCoupon({ code: typed, amount: await onApplyCoupon(typed) });
      setCode('');
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : String(e));
    } finally { setApplying(false); }
  };
  const checkout = async () => {
    setBusy(true);
    try {
      if (pending.current.size) {
        for (const id of [...pending.current.values()]) toast.dismiss(id);
        // Once the app has rendered without them, its onCheckout sees the cart as it now is.
        await new Promise((done) => setTimeout(done, 0));
      }
      await latestCheckout.current();
    } finally { setBusy(false); }
  };

  return (
    <section aria-labelledby={`${base}-title`} className="flex flex-col gap-4">
      <Heading level={headingLevel} size="lg" id={`${base}-title`} ref={heading} tabIndex={-1} className="outline-none">{l.title}</Heading>
      {shown.length ? <>
        <ul role="list" className="m-0 flex list-none flex-col p-0">
          {shown.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 border-b border-border py-3">
              {item.image ? <Image src={item.image} alt="" ratio="square" rounded frameProps={{ className: 'w-16 shrink-0' }} /> : null}
              <div className="flex min-w-0 flex-auto basis-40 flex-col gap-1 wrap-anywhere">
                {item.href
                  ? <Link href={item.href} id={`${base}-${item.id}`} className="font-semibold">{item.name}</Link>
                  : <span id={`${base}-${item.id}`} tabIndex={-1} className="font-semibold outline-none">{item.name}</span>}
                <span className="text-sm text-text-muted">{l.each(money(item.price))}</span>
              </div>
              <div className="flex items-center gap-2">
                <NumberInput className="w-32" size="sm" aria-label={l.quantity(item.name)} value={item.quantity} min={1} max={item.max}
                  onValueChange={(v) => { if (v != null && v >= 1 && v !== item.quantity) onQuantityChange(item.id, v); }} />
                <Button variant="ghost" size="sm" aria-label={`${l.remove} ${item.name}`} onClick={() => remove(item)}>{l.remove}</Button>
              </div>
              <span className="ms-auto font-semibold tabular-nums">{money(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        {onApplyCoupon ? (
          <form className="m-0" onSubmit={(e) => { e.preventDefault(); void apply(); }}>
            <Field label={l.coupon} error={couponError}>
              <Input value={code} onChange={(e) => { setCode(e.target.value); setCouponError(null); }} autoComplete="off" autoCapitalize="characters"
                actions={<InputAction type="submit" label={l.apply} disabled={applying || !code.trim()} />} />
            </Field>
          </form>
        ) : null}
        <DescriptionList layout="split" className="gap-1 border-t border-border pt-3 text-sm">
          <DescriptionItem term={l.subtotal}>{money(subtotal)}</DescriptionItem>
          {coupon ? (
            <DescriptionItem term={l.discount(coupon.code)}>
              <span className="flex flex-wrap items-center justify-end gap-2">
                −{money(discount)}
                <Button variant="link" size="sm" onClick={() => { setCoupon(null); requestAnimationFrame(() => document.getElementById(`${base}-title`)?.focus()); }}>{l.removeCoupon}</Button>
              </span>
            </DescriptionItem>
          ) : null}
          {taxRate ? <DescriptionItem term={l.tax(formatNumber(taxRate, locale, { format: 'percent', maximumFractionDigits: 2 }))}>{money(tax)}</DescriptionItem> : null}
          <DescriptionItem term={l.total} emphasis>{money(total)}</DescriptionItem>
        </DescriptionList>
        <Button className="w-full" loading={busy} onClick={() => void checkout()}>{l.checkout}</Button>
      </> : (
        <div className="flex flex-col items-start gap-2"><p className="m-0">{l.empty}</p><Link href={continueHref}>{l.continueShopping}</Link></div>
      )}
    </section>
  );
}

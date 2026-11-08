'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { FormattedNumber } from '../../components/FormattedNumber/FormattedNumber';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { announce } from '../../internal/announce';
import { minorDigits } from '../../internal/currency';

/* Checkout / payment details: delivery address, delivery speed, an optional tip and card details, the order
   summary beside them, a review step and a confirmation. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.5: every field about the person has its autocomplete token (name, address-line1, postal-code, country, email,
     tel, cc-number, cc-exp…), so the browser and password managers fill them and nobody types an address twice.
   - 3.3.1, 3.3.3: "Review your order" checks every field at once. An ErrorSummary takes focus and links to each
     field, and each field says what to write ("Enter the expiry date as MM/YY, like 08/27"), not just "invalid".
   - 3.3.4: the review step shows everything before the order is placed, each part with a "Change" button that goes
     back with every answer kept and focus on that part's first field (3.3.7: nothing is asked twice).
   - 2.4.3, 4.1.3: each new step's heading takes focus; placing the order says so, and a failure says what to do.
   - 1.3.1 in Safari: the summary's lines keep role="list", which WebKit drops from a list without bullets.
   - 1.4.10: long names, addresses and emails wrap inside their cards at 320 px, on every step.
   - The tip is a NumberInput in the order's currency, in its minor units like every amount here (cents, or whole
     yen for JPY: GR152), so 2.50 is never read as 250.
   Taking the payment (a payment provider's own fields, 3-D Secure, fraud checks) is the app's job; here
   onPlaceOrder decides. */

export interface OrderLine {
  id: string;
  name: string;
  quantity: number;
  /** The price of one, in the currency's minor units (cents for USD, yen for JPY). */
  price: number;
}

export interface CheckoutDetails {
  name: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
  delivery: 'standard' | 'express';
  /** In the currency's minor units. */
  tip: number | null;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCode: string;
}

export interface CheckoutOrder {
  details: CheckoutDetails;
  lines: readonly OrderLine[];
  /** The total, in the currency's minor units. */
  total: number;
}

export interface CheckoutProps {
  /** What's being bought. Default: two demo lines. */
  lines?: readonly OrderLine[] | undefined;
  /** An ISO 4217 code. Default: "USD". Every amount is in its minor units: cents for USD, yen for JPY, fils for KWD. */
  currency?: string | undefined;
  /** What express delivery costs, in minor units. Default: 900 ($9.00 in USD). */
  expressPrice?: number | undefined;
  /** Answers already known (a saved address), so they aren't typed again. */
  initial?: Partial<CheckoutDetails> | undefined;
  /** Starts on the review step, when every answer in `initial` is good. */
  startAtReview?: boolean | undefined;
  /** Places the order. A rejected promise keeps the review step and says the order wasn't placed. */
  onPlaceOrder?: ((order: CheckoutOrder) => void | Promise<unknown>) | undefined;
}

const demoLines: OrderLine[] = [
  { id: 'mug', name: 'Stoneware mug', quantity: 2, price: 1800 },
  { id: 'beans', name: 'Coffee beans, 1 kg', quantity: 1, price: 2450 },
];
const COUNTRIES = [
  { value: 'AU', label: 'Australia' }, { value: 'CA', label: 'Canada' }, { value: 'DE', label: 'Germany' },
  { value: 'ID', label: 'Indonesia' }, { value: 'GB', label: 'United Kingdom' }, { value: 'US', label: 'United States' },
];
const blank: CheckoutDetails = {
  name: '', line1: '', line2: '', city: '', postcode: '', country: '', email: '', phone: '', delivery: 'standard', tip: null,
  cardNumber: '', cardName: '', cardExpiry: '', cardCode: '',
};
type Text = Exclude<keyof CheckoutDetails, 'delivery' | 'tip'>;
const id = (k: keyof CheckoutDetails) => `checkout-${k}`;

/** What's wrong with each field, in the order the fields come, as the ErrorSummary lists them. */
function checkoutProblems(d: CheckoutDetails): ErrorSummaryItem[] {
  const digits = d.cardNumber.replace(/[\s-]/g, '');
  const rules: [Text, boolean, string][] = [
    ['name', !d.name.trim(), 'Enter your full name'],
    ['line1', !d.line1.trim(), 'Enter the first line of your address'],
    ['city', !d.city.trim(), 'Enter your town or city'],
    ['postcode', !d.postcode.trim(), 'Enter your postcode'],
    ['country', !d.country, 'Choose your country'],
    ['email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()), 'Enter an email address, like name@example.com'],
    ['cardNumber', !/^\d{13,19}$/.test(digits), 'Enter the long number on the front of the card: 13 to 19 digits'],
    ['cardName', !d.cardName.trim(), 'Enter the name as it’s written on the card'],
    ['cardExpiry', !/^(0[1-9]|1[0-2]) ?\/ ?\d{2}$/.test(d.cardExpiry.trim()), 'Enter the expiry date as MM/YY, like 08/27'],
    ['cardCode', !/^\d{3,4}$/.test(d.cardCode.trim()), 'Enter the 3 or 4 digit security code from the back of the card'],
  ];
  return rules.filter(([, bad]) => bad).map(([k, , message]) => ({ field: id(k), message }));
}

type Step = 'details' | 'review' | 'placed';
type Part = 'address' | 'delivery' | 'payment';
const FIRST: Record<Part, string> = { address: `#${id('name')}`, delivery: 'input[name="delivery"]:checked', payment: `#${id('cardNumber')}` };

/** The checkout page: a skip link, a header, then main with the form (or the review, or the confirmation) and the order summary. */
export function Checkout({ lines = demoLines, currency = 'USD', expressPrice = 900, initial, startAtReview, onPlaceOrder }: CheckoutProps) {
  const [d, setD] = React.useState<CheckoutDetails>(() => ({ ...blank, ...initial }));
  const [step, setStep] = React.useState<Step>(() => (startAtReview && !checkoutProblems({ ...blank, ...initial }).length ? 'review' : 'details'));
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
  const deliveryCost = d.delivery === 'express' ? expressPrice : 0;
  const total = subtotal + deliveryCost + (d.tip ?? 0);
  // Amounts are in the currency's minor units: 1800 is $18.00, but ￥1,800 and 1.800 KWD.
  const unit = 10 ** minorDigits(currency);
  const money = (minor: number) => <FormattedNumber value={minor / unit} format="currency" currency={currency} />;

  // After a step changes, focus goes to its heading, or to the field a "Change" button asked for (a CSS selector).
  const focusNext = React.useRef<string | null>(null);
  const stepHeading = React.useRef<HTMLHeadingElement | null>(null);
  React.useEffect(() => {
    const target = focusNext.current;
    if (target === null) return;
    focusNext.current = null;
    (target ? document.querySelector<HTMLElement>(target) : stepHeading.current)?.focus();
  }, [step]);
  const go = (next: Step, focus = '') => { focusNext.current = focus; setStep(next); };

  const set = (k: Text) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD({ ...d, [k]: e.target.value });
  const fieldError = (k: keyof CheckoutDetails) => errors.find((e) => e.field === id(k))?.message;
  const text = (k: Text, label: string, autoComplete: string, extra: Partial<React.ComponentProps<typeof Input>> = {}, hint?: string) => (
    <Field label={label} hint={hint} error={fieldError(k)} optional={k === 'line2' || k === 'phone'}>
      <Input id={id(k)} name={k} autoComplete={autoComplete} value={d[k]} onChange={set(k)} {...extra} />
    </Field>
  );

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    const found = checkoutProblems(d);
    setErrors(found);
    setTries((t) => t + 1);
    if (!found.length) { setFailed(false); go('review'); }
  };
  const place = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await onPlaceOrder?.({ details: d, lines, total });
      go('placed');
      announce('Order placed');
    } catch {
      setFailed(true);
      announce('Your order wasn’t placed. Nothing was charged. Try again.');
    } finally { setBusy(false); }
  };

  const steps: Record<Step, string> = { details: 'Step 1 of 2', review: 'Step 2 of 2', placed: 'Done' };
  const titles: Record<Step, string> = { details: 'Delivery and payment', review: 'Check your order', placed: 'Thank you, your order is placed' };
  const change = (part: Part, label: string) => (
    <Button variant="secondary" size="sm" onClick={() => go('details', FIRST[part])} aria-label={`Change ${label}`}>Change</Button>
  );
  const last4 = d.cardNumber.replace(/\D/g, '').slice(-4);
  const country = COUNTRIES.find((c) => c.value === d.country)?.label;

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 outline-none">
        <Heading level={1}>Checkout</Heading>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section aria-labelledby="checkout-step" className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <div className="flex flex-col gap-1">
              <p className="m-0 text-sm text-text-muted">{steps[step]}</p>
              <Heading level={2} id="checkout-step" ref={stepHeading} tabIndex={-1} className="outline-none">{titles[step]}</Heading>
            </div>

            {step === 'details' ? (
              <form noValidate onSubmit={review} className="flex flex-col gap-6">
                {errors.length ? <ErrorSummary key={tries} errors={errors} headingLevel={3} /> : null}
                <Card className="flex flex-col gap-4">
                  <Heading level={3}>Delivery address</Heading>
                  {text('name', 'Full name', 'shipping name')}
                  {text('line1', 'Address line 1', 'shipping address-line1')}
                  {text('line2', 'Address line 2', 'shipping address-line2')}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {text('city', 'Town or city', 'shipping address-level2')}
                    {text('postcode', 'Postcode', 'shipping postal-code', { className: 'max-w-48' })}
                  </div>
                  <Field label="Country" error={fieldError('country')}>
                    <Select id={id('country')} name="country" autoComplete="shipping country" value={d.country} onChange={set('country')}
                      placeholder="Choose a country" options={COUNTRIES} />
                  </Field>
                  {text('email', 'Email', 'email', { type: 'email', spellCheck: false, autoCapitalize: 'none' }, 'For the receipt and the delivery updates.')}
                  {text('phone', 'Phone', 'tel', { type: 'tel' }, 'Only for the courier, if they can’t find the address.')}
                </Card>

                <Card className="flex flex-col gap-4">
                  <Heading level={3}>Delivery</Heading>
                  <Field label="Delivery speed" group>
                    <RadioGroup name="delivery" value={d.delivery} onValueChange={(v) => setD({ ...d, delivery: v })}>
                      <Radio value="standard" description="3 to 5 working days">Standard: free</Radio>
                      <Radio value="express" description="Next working day, ordered before 2 pm">Express: {money(expressPrice)}</Radio>
                    </RadioGroup>
                  </Field>
                  <Field label="Tip for the courier" hint="Every cent goes to the courier." optional>
                    <NumberInput id={id('tip')} name="tip" currency={currency} minorUnits min={0} max={10000} step={50} value={d.tip}
                      onValueChange={(tip) => setD({ ...d, tip })} className="max-w-48" />
                  </Field>
                </Card>

                <Card className="flex flex-col gap-4">
                  <Heading level={3}>Payment</Heading>
                  {text('cardNumber', 'Card number', 'cc-number', { inputMode: 'numeric', spellCheck: false }, 'The long number on the front of the card.')}
                  {text('cardName', 'Name on card', 'cc-name')}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {text('cardExpiry', 'Expiry date', 'cc-exp', { inputMode: 'numeric', className: 'max-w-48' }, 'MM/YY, like 08/27')}
                    {text('cardCode', 'Security code', 'cc-csc', { inputMode: 'numeric', className: 'max-w-48' }, 'The last 3 digits on the back, or 4 on the front for Amex.')}
                  </div>
                </Card>
                <div><Button type="submit">Review your order</Button></div>
              </form>
            ) : step === 'review' ? (
              <div className="flex flex-col gap-4">
                {failed ? <p className="m-0 text-danger-text">Your order wasn’t placed. Nothing was charged. Try again, or use another card.</p> : null}
                <Card className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                    <Heading level={3}>Delivery address</Heading>
                    <p className="m-0 whitespace-pre-line text-sm">{[d.name, d.line1, d.line2, `${d.city} ${d.postcode}`, country].filter(Boolean).join('\n')}</p>
                    <p className="m-0 text-sm text-text-muted">{[d.email, d.phone].filter(Boolean).join(' · ')}</p>
                  </div>
                  {change('address', 'the delivery address')}
                </Card>
                <Card className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                    <Heading level={3}>Delivery</Heading>
                    <p className="m-0 text-sm">{d.delivery === 'express' ? 'Express, next working day' : 'Standard, 3 to 5 working days'}</p>
                    {d.tip ? <p className="m-0 text-sm">Tip for the courier: {money(d.tip)}</p> : null}
                  </div>
                  {change('delivery', 'the delivery')}
                </Card>
                <Card className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                    <Heading level={3}>Payment</Heading>
                    <p className="m-0 text-sm">Card ending in {last4}, expires {d.cardExpiry}</p>
                  </div>
                  {change('payment', 'the payment card')}
                </Card>
              </div>
            ) : (
              <p className="m-0 wrap-anywhere">We've sent the receipt to {d.email}. We'll email again when it's on its way.</p>
            )}
          </section>

          <aside aria-labelledby="checkout-summary" className="min-w-0 lg:col-span-1">
            <Card className="flex flex-col gap-3">
              <Heading level={2} id="checkout-summary" className="text-lg">Order summary</Heading>
              <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
                {lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 wrap-anywhere">{l.name} × {l.quantity}</span>{money(l.quantity * l.price)}
                  </li>
                ))}
              </ul>
              <dl className="m-0 flex flex-col gap-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between gap-3"><dt>Subtotal</dt><dd className="m-0">{money(subtotal)}</dd></div>
                <div className="flex justify-between gap-3"><dt>Delivery</dt><dd className="m-0">{deliveryCost ? money(deliveryCost) : 'Free'}</dd></div>
                {d.tip ? <div className="flex justify-between gap-3"><dt>Tip</dt><dd className="m-0">{money(d.tip)}</dd></div> : null}
                <div className="flex justify-between gap-3 text-base font-semibold"><dt>Total</dt><dd className="m-0">{money(total)}</dd></div>
              </dl>
            </Card>
          </aside>
          {/* After the summary, so on a phone every line of the total is read before the button that pays; from lg
              up the summary sits beside the review and this row under it. */}
          {step === 'review' ? (
            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <Button wrap loading={busy} loadingText="Placing your order" onClick={() => void place()}>Place order: pay {money(total)}</Button>
              <Button variant="ghost" onClick={() => go('details')}>Back</Button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

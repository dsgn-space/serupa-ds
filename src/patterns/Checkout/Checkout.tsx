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
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { announce } from '../../internal/announce';
import { minorDigits } from '../../internal/currency';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { Badge } from '../../components/Badge/Badge';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';
import {
  demoMethods, expired, formatExpiry, methodOf, methodSummary, MethodDetails, MethodList, PayNext,
  type PaymentAnswers, type PaymentInstructions, type PaymentMethod,
} from './payment';

export type { PaymentMethod, PaymentInstructions } from './payment';

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
   - The ways to pay are data (`methods`): radio cards with a generic icon each, the chosen one's questions under
     them. A card asks its expiry as one MM/YY field (cc-exp), the slash put in as it's typed. A bank transfer, an
     e-wallet or a QR code is paid after the order: the confirmation shows the account number (with a copy button),
     the app to approve in or the code, and the time left (a Countdown), and says when it has run out.
   - A promo code sits in the order summary, above the total, behind "Add promo code": applying it says so (or what's
     wrong) aloud, shows the code with a way to remove it, and adds a discount line.
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
  /** The chosen way to pay: a `PaymentMethod`'s id. */
  method: string;
  /** A saved card's id, or "new" for the card fields. */
  savedCard: string;
  /** The bank, for a bank transfer. */
  bank: string;
  /** The e-wallet, and the phone number it uses. */
  ewallet: string;
  walletPhone: string;
}

export interface CheckoutOrder {
  details: CheckoutDetails;
  lines: readonly OrderLine[];
  /** The total, in the currency's minor units, after any discount. */
  total: number;
  /** The promo code applied, and what it took off (minor units). */
  promo: AppliedPromo | null;
}

/** A promo code that applied: `discount` is in the currency's minor units, `label` says what it is ("10% off"). */
export interface AppliedPromo {
  code: string;
  discount: number;
  label?: string | undefined;
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
  /** Starts as after placing the order failed: the review step, saying the order wasn't placed. Needs every answer
      in `initial` to be good. */
  failed?: boolean | undefined;
  /** Starts on the confirmation, as after the order was placed. Needs every answer in `initial` to be good. */
  placed?: boolean | undefined;
  /** The ways to pay, in order. Default: card, Apple Pay, Google Pay, bank transfer, e-wallet and QRIS. List only
      what you take, and a device wallet only where the browser offers it. */
  methods?: readonly PaymentMethod[] | undefined;
  /** With `placed`: what the confirmation shows for a method paid after the order (account number, QR code, time). */
  instructions?: PaymentInstructions | undefined;
  /** Places the order. A rejected promise keeps the review step and says the order wasn't placed. For a bank
      transfer or a QR code, resolve with the account number or the code's image and when it has to be paid by. */
  onPlaceOrder?: ((order: CheckoutOrder) => void | Promise<unknown>) | undefined;
  /** A promo code already applied, as when the basket carried one over. */
  promo?: AppliedPromo | undefined;
  /** Checks a promo code against the order (subtotal in minor units). Resolve with what it takes off; reject with
      an Error whose message says why it doesn't apply ("This code has expired"). Default: WELCOME10 takes 10% off. */
  onApplyPromo?: ((code: string, subtotal: number) => Promise<AppliedPromo>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
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
  cardNumber: '', cardName: '', cardExpiry: '', cardCode: '', method: '', savedCard: '', bank: '', ewallet: '', walletPhone: '',
};
type Text = Exclude<keyof CheckoutDetails, 'delivery' | 'tip' | 'method' | 'savedCard' | 'bank' | 'ewallet'>;
const id = (k: keyof CheckoutDetails) => `checkout-${k}`;

/** What's wrong with each field, in the order the fields come, as the ErrorSummary lists them. Only the chosen way to
    pay is checked. */
function checkoutProblems(d: CheckoutDetails, methods: readonly PaymentMethod[]): ErrorSummaryItem[] {
  const digits = d.cardNumber.replace(/[\s-]/g, '');
  const m = methodOf(methods, d.method);
  const newCard = m?.kind === 'card' && (d.savedCard === 'new' || !m.savedCards?.length);
  // A saved card picked by id: one that has expired, or that's no longer in the list, can't pay.
  const pickedCard = m?.kind === 'card' && d.savedCard && d.savedCard !== 'new' ? m.savedCards?.find((c) => c.id === d.savedCard) : undefined;
  const expiryForm = /^(0[1-9]|1[0-2])\/\d{2}$/.test(d.cardExpiry.trim());
  const rules: [keyof CheckoutDetails, boolean, string][] = [
    ['name', !d.name.trim(), 'Enter your full name'],
    ['line1', !d.line1.trim(), 'Enter the first line of your address'],
    ['city', !d.city.trim(), 'Enter your town or city'],
    ['postcode', !d.postcode.trim(), 'Enter your postcode'],
    ['country', !d.country, 'Choose your country'],
    ['email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()), 'Enter an email address, like name@example.com'],
    ['method', !m || !!m.unavailable, 'Choose how you’d like to pay'],
    ['savedCard', m?.kind === 'card' && !!m.savedCards?.length && !d.savedCard, 'Choose a saved card, or a new card'],
    ['savedCard', !!pickedCard && expired(pickedCard.expiry), 'This card has expired: choose another card, or a new card'],
    ['savedCard', m?.kind === 'card' && !!m.savedCards?.length && !!d.savedCard && d.savedCard !== 'new' && !pickedCard, 'Choose a saved card, or a new card'],
    ['cardNumber', newCard && !/^\d{13,19}$/.test(digits), 'Enter the long number on the front of the card: 13 to 19 digits'],
    ['cardName', newCard && !d.cardName.trim(), 'Enter the name as it’s written on the card'],
    ['cardExpiry', newCard && !expiryForm, 'Enter the expiry date as MM/YY, like 08/27'],
    ['cardExpiry', newCard && expiryForm && expired(d.cardExpiry), 'This card has expired: check the date, or use another card'],
    ['cardCode', newCard && !/^\d{3,4}$/.test(d.cardCode.trim()), 'Enter the 3 or 4 digit security code from the back of the card'],
    ['bank', m?.kind === 'bank' && !d.bank, 'Choose the bank you’ll transfer from'],
    ['ewallet', m?.kind === 'ewallet' && !d.ewallet, 'Choose your e-wallet'],
    ['walletPhone', m?.kind === 'ewallet' && d.walletPhone.replace(/\D/g, '').length < 8, 'Enter the phone number your e-wallet uses'],
  ];
  return rules.filter(([, bad]) => bad).map(([k, , message]) => ({ field: id(k), message }));
}

/** The demo's promo codes: WELCOME10 takes 10% off. An app checks codes on its server. */
const demoPromo = (code: string, subtotal: number): Promise<AppliedPromo> => new Promise((resolve, reject) => {
  setTimeout(() => (code.toUpperCase() === 'WELCOME10'
    ? resolve({ code: 'WELCOME10', discount: Math.round(subtotal / 10), label: '10% off' })
    : reject(new Error('This code isn’t valid. Check it, or try another'))), 400);
});

type Step = 'details' | 'review' | 'placed';
type Part = 'address' | 'delivery' | 'payment';
const FIRST: Record<Part, string> = { address: `#${id('name')}`, delivery: 'input[name="delivery"]:checked', payment: 'input[name="method"]:checked' };
/** Methods paid once the order is placed: the confirmation says how, and how long is left. */
const later = (m: PaymentMethod | undefined) => m?.kind === 'bank' || m?.kind === 'ewallet' || m?.kind === 'qr';

/** The checkout page: a skip link, a header, then main with the form (or the review, or the confirmation) and the order summary. */
export function Checkout({
  lines = demoLines, currency = 'USD', expressPrice = 900, initial, startAtReview, failed: startFailed, placed, onPlaceOrder,
  methods = demoMethods, instructions: startInstructions, onApplyPromo = demoPromo, promo: startPromo, online }: CheckoutProps) {
  // The first method that can be used is chosen at first, and a saved card's first one that hasn't expired.
  const start = (): CheckoutDetails => {
    const s = { ...blank, ...initial };
    const m = methodOf(methods, s.method) ?? methods.find((x) => !x.unavailable);
    const saved = m?.kind === 'card' ? m.savedCards?.find((c) => !expired(c.expiry)) : undefined;
    return { ...s, method: m?.id ?? '', savedCard: s.savedCard || saved?.id || 'new', walletPhone: s.walletPhone || s.phone };
  };
  const [d, setD] = React.useState<CheckoutDetails>(start);
  const [good] = React.useState(() => !checkoutProblems(start(), methods).length);
  const [pay, setPay] = React.useState<PaymentInstructions>(() => startInstructions ?? {});
  const [timeUp, setTimeUp] = React.useState(false);
  const [promo, setPromo] = React.useState<AppliedPromo | null>(startPromo ?? null);
  const [step, setStep] = React.useState<Step>(() => (!good ? 'details' : placed ? 'placed' : startAtReview || startFailed ? 'review' : 'details'));
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(() => good && !placed && !!startFailed);

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
  const deliveryCost = d.delivery === 'express' ? expressPrice : 0;
  const discount = promo ? Math.min(promo.discount, subtotal) : 0;
  const total = subtotal - discount + deliveryCost + (d.tip ?? 0);
  const method = methodOf(methods, d.method);
  // Amounts are in the currency's minor units: 1800 is $18.00, but ￥1,800 and 1.800 KWD.
  const unit = 10 ** minorDigits(currency);
  const money = (minor: number) => <FormattedNumber value={minor / unit} format="currency" currency={currency} />;
  const locale = useLocale(undefined);
  const moneyText = (minor: number) => formatNumber(minor / unit, locale, { format: 'currency', currency });

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
  const optional = (k: Text) => k === 'line2' || k === 'phone';
  const text = (k: Text, label: string, autoComplete: string, extra: Partial<React.ComponentProps<typeof Input>> = {}, hint?: string) => (
    <Field label={label} hint={hint} error={fieldError(k)} required={!optional(k)} optional={optional(k)}>
      <Input id={id(k)} name={k} autoComplete={autoComplete} value={d[k]} onChange={set(k)} {...extra} />
    </Field>
  );

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    const found = checkoutProblems(d, methods);
    setErrors(found);
    setTries((t) => t + 1);
    if (!found.length) { setFailed(false); go('review'); }
  };
  const place = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const got = await (onPlaceOrder ?? demoPlace)({ details: d, lines, total, promo });
      setPay({ ...demoInstructions(method), ...(got && typeof got === 'object' ? got : {}) });
      setTimeUp(false);
      go('placed');
      announce(later(method) ? 'Order placed. Pay to finish it: the instructions are on the page.' : 'Order placed');
    } catch {
      setFailed(true);
      announce('Your order wasn’t placed. Nothing was charged. Try again.');
    } finally { setBusy(false); }
  };

  const steps: Record<Step, string> = { details: `Step ${formatNumber(1, locale)} of ${formatNumber(2, locale)}`, review: `Step ${formatNumber(2, locale)} of ${formatNumber(2, locale)}`, placed: 'Done' };
  const titles: Record<Step, string> = { details: 'Delivery and payment', review: 'Check your order', placed: later(method) ? 'Your order is placed: now pay for it' : 'Thank you, your order is placed' };
  const change = (part: Part, label: string) => (
    <Button variant="secondary" size="sm" onClick={() => go('details', FIRST[part])} aria-label={`Change ${label}`} disabled={busy} disabledReason={placing}>Change</Button>
  );
  // While the order is being placed, nothing in it can change: going back then would show "Thank you" with details
  // that were since changed, or edit an order already sent.
  const placing = busy ? 'Your order is being placed' : undefined;
  const last4 = d.cardNumber.replace(/\D/g, '').slice(-4);
  const answers: PaymentAnswers = d;
  const setPayment = (patch: Partial<PaymentAnswers>) => setD((x) => ({ ...x, ...patch }));
  const country = COUNTRIES.find((c) => c.value === d.country)?.label;

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={6}>
          <OfflineBanner online={online} placement="inline">Your details stay here. Placing the order needs a connection.</OfflineBanner>
          <PageHeader title="Checkout" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section aria-labelledby="checkout-step" className="flex min-w-0 flex-col gap-6 lg:col-span-2">
              <div className="flex flex-col gap-1">
                <p className="m-0 text-sm text-text-muted">{steps[step]}</p>
                <Heading level={2} size="lg" id="checkout-step" ref={stepHeading} tabIndex={-1} className="outline-none">{titles[step]}</Heading>
              </div>

              {step === 'details' ? (
                <form noValidate onSubmit={review} className="flex flex-col gap-6">
                  {errors.length ? <ErrorSummary key={tries} errors={errors} headingLevel={3} /> : null}
                  <p className="m-0 text-text-muted">Fields marked * are required.</p>
                  <Card className="flex flex-col gap-4">
                    <Heading level={3}>Delivery address</Heading>
                    {text('name', 'Full name', 'shipping name')}
                    {text('line1', 'Address line 1', 'shipping address-line1')}
                    {text('line2', 'Address line 2', 'shipping address-line2')}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {text('city', 'Town or city', 'shipping address-level2')}
                      {text('postcode', 'Postcode', 'shipping postal-code', { className: 'max-w-48' })}
                    </div>
                    <Field label="Country" error={fieldError('country')} required>
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
                    <MethodList methods={methods} value={d.method} onChange={(m) => setPayment({ method: m })} error={fieldError('method')} />
                    <MethodDetails method={method} a={answers} set={setPayment} error={(k) => fieldError(k)} card={(
                      <>
                        {text('cardNumber', 'Card number', 'cc-number', { inputMode: 'numeric', spellCheck: false }, 'The long number on the front of the card.')}
                        {text('cardName', 'Name on card', 'cc-name')}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Expiry date" hint="MM/YY, like 08/27" error={fieldError('cardExpiry')} required>
                            <Input id={id('cardExpiry')} name="cardExpiry" autoComplete="cc-exp" inputMode="numeric" maxLength={7} className="max-w-48"
                              value={d.cardExpiry} onChange={(e) => { const v = e.target.value; setD((x) => ({ ...x, cardExpiry: formatExpiry(v, x.cardExpiry) })); }} />
                          </Field>
                          {text('cardCode', 'Security code', 'cc-csc', { inputMode: 'numeric', className: 'max-w-48' }, '3 digits on the back, 4 on the front for Amex')}
                        </div>
                      </>
                    )} />
                  </Card>
                  <div><Button type="submit">Review your order</Button></div>
                </form>
              ) : step === 'review' ? (
                <div className="flex flex-col gap-4">
                  {failed ? <p className="m-0 text-text-danger">Your order wasn’t placed. Nothing was charged. Try again, or {method?.kind === 'card' ? 'use another card' : 'choose another way to pay'}.</p> : null}
                  <Card className="flex flex-row flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                      <Heading level={3}>Delivery address</Heading>
                      <p className="m-0 whitespace-pre-line text-sm">{[d.name, d.line1, d.line2, `${d.city} ${d.postcode}`, country].filter(Boolean).join('\n')}</p>
                      <p className="m-0 text-sm text-text-muted">{[d.email, d.phone].filter(Boolean).join(' · ')}</p>
                    </div>
                    {change('address', 'the delivery address')}
                  </Card>
                  <Card className="flex flex-row flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                      <Heading level={3}>Delivery</Heading>
                      <p className="m-0 text-sm">{d.delivery === 'express' ? 'Express, next working day' : 'Standard, 3 to 5 working days'}</p>
                      {d.tip ? <p className="m-0 text-sm">Tip for the courier: {money(d.tip)}</p> : null}
                    </div>
                    {change('delivery', 'the delivery')}
                  </Card>
                  <Card className="flex flex-row flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                      <Heading level={3}>Payment</Heading>
                      <p className="m-0 text-sm">{methodSummary(method, answers, { last4, expiry: d.cardExpiry })}</p>
                    </div>
                    {change('payment', 'how you pay')}
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {method && later(method) ? (
                    <Card>
                      <PayNext method={method} a={answers} total={money(total)} totalText={moneyText(total)} instructions={pay}
                        expiredNow={timeUp} onExpired={() => setTimeUp(true)} onChooseAnother={() => { setTimeUp(false); go('details', FIRST.payment); }} />
                    </Card>
                  ) : null}
                  <p className="m-0 wrap-anywhere">{later(method)
                    ? <>We’ve sent these instructions to {d.email}, and we’ll email the receipt once you’ve paid.</>
                    : <>We’ve sent the receipt to {d.email}. We’ll email again when it’s on its way.</>}</p>
                </div>
              )}
            </section>

            {/* From lg up the summary stays in view beside the long form, so the total is always on screen. */}
            <aside aria-labelledby="checkout-summary" className="top-6 min-w-0 lg:sticky lg:col-span-1 lg:self-start">
              <Card className="flex flex-col gap-3">
                <Heading level={2} size="lg" id="checkout-summary">Order summary</Heading>
                <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
                  {lines.map((l) => (
                    <li key={l.id} className="flex justify-between gap-3 text-sm">
                      <span className="min-w-0 wrap-anywhere">{l.name} × {formatNumber(l.quantity, locale)}</span>{money(l.quantity * l.price)}
                    </li>
                  ))}
                </ul>
                <DescriptionList layout="split" className="gap-1 border-t border-border pt-3 text-sm">
                  <DescriptionItem term="Subtotal">{money(subtotal)}</DescriptionItem>
                  {promo ? <DescriptionItem term={`Discount (${promo.code})`}>−{money(discount)}</DescriptionItem> : null}
                  <DescriptionItem term="Delivery">{deliveryCost ? money(deliveryCost) : 'Free'}</DescriptionItem>
                  {d.tip ? <DescriptionItem term="Tip">{money(d.tip)}</DescriptionItem> : null}
                  <DescriptionItem term="Total" emphasis>{money(total)}</DescriptionItem>
                </DescriptionList>
                {step === 'placed' ? null : <PromoCode applied={promo} locked={busy}
                  onApply={(code) => onApplyPromo(code, subtotal).then((p) => { setPromo(p); return p; })} onRemove={() => setPromo(null)} />}
              </Card>
            </aside>
            {/* After the summary, so on a phone every line of the total is read before the button that pays; from lg
                up the summary sits beside the review and this row under it. */}
            {step === 'review' ? (
              <div className="flex flex-wrap gap-3 lg:col-span-2">
                <Button wrap loading={busy} loadingLabel="Placing your order" onClick={() => void place()}>
                  {method?.kind === 'wallet' ? <>Pay {money(total)} with {method.label}</> : <>Place order: pay {money(total)}</>}
                </Button>
                <Button variant="ghost" onClick={() => go('details')} disabled={busy} disabledReason={placing}>Back</Button>
              </div>
            ) : null}
          </div>
        </Stack>
      </Container>
    </div>
  );
}


/** The demo places every order. */
const demoPlace = (): Promise<void> => new Promise((resolve) => { setTimeout(resolve, 600); });
/** What the demo shows after the order, for a method paid then: an account number, or a code, with a day, 5 minutes
    or 15 minutes to pay. An app's onPlaceOrder gives the real ones. */
function demoInstructions(m: PaymentMethod | undefined): PaymentInstructions {
  const mins = m?.kind === 'bank' ? 24 * 60 : m?.kind === 'ewallet' ? 5 : 15;
  return { accountNumber: '8808 1234 5678 9012', payBy: Date.now() + mins * 60_000 };
}

/** "Add promo code" in the order summary, above the total: a button that opens a field and Apply. While it checks,
    Apply is busy; a code that doesn't apply says why under the field; one that does shows as a badge with Remove,
    and the summary gets a discount line. Each change is said aloud. */
function PromoCode({ applied, locked, onApply, onRemove }: {
  applied: AppliedPromo | null; locked: boolean; onApply: (code: string) => Promise<AppliedPromo>; onRemove: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const field = React.useRef<HTMLInputElement | null>(null);
  const opener = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => { if (open && !applied) field.current?.focus(); }, [open, applied]);
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) { setError('Enter a promo code'); return; }
    setChecking(true);
    setError('');
    onApply(c).then((p) => {
      setCode('');
      setOpen(false);
      announce(`Promo code ${p.code} applied${p.label ? `: ${p.label}` : ''}. The total is updated.`);
    }, (err: unknown) => {
      const why = err instanceof Error && err.message ? err.message : 'This code isn’t valid';
      setError(why);
      announce(why);
    }).finally(() => setChecking(false));
  };
  if (applied) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
        <span>Promo code</span>
        <Badge>{applied.code}</Badge>
        {applied.label ? <span className="text-text-muted">{applied.label}</span> : null}
        <Button variant="ghost" size="sm" className="ms-auto" disabled={locked} disabledReason={locked ? 'Your order is being placed' : undefined}
          aria-label={`Remove promo code ${applied.code}`}
          onClick={() => { onRemove(); setOpen(true); announce(`Promo code ${applied.code} removed. The total is updated.`); }}>Remove</Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div>
        <Button ref={opener} variant="link" size="sm" aria-expanded={open} aria-controls="checkout-promo" disabled={locked}
          onClick={() => setOpen((o) => !o)}>Add promo code</Button>
      </div>
      {open ? (
        <form id="checkout-promo" noValidate onSubmit={apply} className="flex flex-col gap-2">
          <Field label="Promo code" error={error}>
            <Input id="checkout-promo-code" ref={field} name="promo" autoComplete="off" spellCheck={false} autoCapitalize="characters"
              value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} />
          </Field>
          <div><Button type="submit" variant="secondary" size="sm" loading={checking} loadingLabel="Checking the code">Apply</Button></div>
        </form>
      ) : null}
    </div>
  );
}

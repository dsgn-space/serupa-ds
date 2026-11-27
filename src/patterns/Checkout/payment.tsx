'use client';
import * as React from 'react';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Icon } from '../../components/Icon/Icon';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { Countdown } from '../../components/Countdown/Countdown';
import { Button } from '../../components/Button/Button';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { AccountBalance, AccountBalanceWallet, Contactless, CreditCard, QrCode2 } from '../../material/icons';
import type { IconData } from '../../material/types';

/* The ways to pay in Checkout: the methods are data, so an app lists only the ones it takes. Generic icons, never a
   brand's logo. The chosen method's own questions show under the list; methods paid after the order is placed (a
   bank transfer to a virtual account, an e-wallet, a QR code) show what to do next on the confirmation. */

/** A card saved with the payment provider: only what's safe to show. */
export interface SavedCard {
  id: string;
  /** The network, as words: "Visa", "Mastercard". */
  brand: string;
  last4: string;
  /** MM/YY. */
  expiry: string;
}

/** A bank or an e-wallet to pick. */
export interface PaymentProvider {
  id: string;
  name: string;
}

interface MethodBase {
  /** The method's value in the form, and in `CheckoutDetails.method`. */
  id: string;
  /** Its name in the list. */
  label: string;
  /** A short second line: the cards taken, or how it's confirmed. */
  description?: string | undefined;
  /** A generic icon in place of the method's own. */
  icon?: IconData | undefined;
  /** Shown in place of the description, and the method can't be picked: "Not for orders over Rp 10.000.000". */
  unavailable?: string | undefined;
}

/** A way to pay. `kind` decides what's asked for it and what happens after the order is placed. */
export type PaymentMethod =
  /** A card: the saved ones, then a new one (number, name, expiry as one MM/YY field, security code). */
  | (MethodBase & { kind: 'card'; savedCards?: readonly SavedCard[] | undefined })
  /** A wallet on the device (Apple Pay, Google Pay): confirmed in its own sheet. List it only where the browser
      offers it (PaymentRequest's canMakePayment, or the provider's own check). */
  | (MethodBase & { kind: 'wallet' })
  /** A bank transfer to a virtual account: pick the bank, and the account number comes after the order. */
  | (MethodBase & { kind: 'bank'; banks: readonly PaymentProvider[] })
  /** An e-wallet that asks its app to approve: pick it, and give the phone number it uses. */
  | (MethodBase & { kind: 'ewallet'; providers: readonly PaymentProvider[] })
  /** A QR code (QRIS) any banking or e-wallet app scans, shown after the order with the time left to pay. */
  | (MethodBase & { kind: 'qr' });

/** What to pay with, once the order is placed: the app's onPlaceOrder resolves with it. */
export interface PaymentInstructions {
  /** The virtual account's number, for a bank transfer. */
  accountNumber?: string | undefined;
  /** The QR code's image (a URL or a data URL) from the payment provider. */
  qrImage?: string | undefined;
  /** When the payment has to arrive by. */
  payBy?: Date | number | string | undefined;
  /** Or the seconds left, when the app keeps the clock (it doesn't tick then). */
  secondsLeft?: number | undefined;
}

export const ICONS: Record<PaymentMethod['kind'], IconData> = {
  card: CreditCard, wallet: Contactless, bank: AccountBalance, ewallet: AccountBalanceWallet, qr: QrCode2,
};

export const demoMethods: readonly PaymentMethod[] = [
  { kind: 'card', id: 'card', label: 'Card', description: 'Visa, Mastercard or American Express' },
  { kind: 'wallet', id: 'apple-pay', label: 'Apple Pay', description: 'Confirm with Face ID or Touch ID' },
  { kind: 'wallet', id: 'google-pay', label: 'Google Pay', description: 'Confirm on your phone' },
  {
    kind: 'bank', id: 'bank', label: 'Bank transfer', description: 'To a virtual account, from any bank’s app',
    banks: [{ id: 'bca', name: 'BCA' }, { id: 'mandiri', name: 'Mandiri' }, { id: 'bni', name: 'BNI' }, { id: 'bri', name: 'BRI' }, { id: 'permata', name: 'Permata' }],
  },
  {
    kind: 'ewallet', id: 'ewallet', label: 'E-wallet', description: 'GoPay, OVO, DANA or ShopeePay',
    providers: [{ id: 'gopay', name: 'GoPay' }, { id: 'ovo', name: 'OVO' }, { id: 'dana', name: 'DANA' }, { id: 'shopeepay', name: 'ShopeePay' }],
  },
  { kind: 'qr', id: 'qris', label: 'QRIS', description: 'Scan a code with any banking or e-wallet app' },
];

/** The answers about paying, as Checkout keeps them. */
export interface PaymentAnswers {
  method: string;
  /** A saved card's id, or "new". */
  savedCard: string;
  bank: string;
  ewallet: string;
  walletPhone: string;
}

/** "08/27" from what was typed or filled: digits get their slash, "8" becomes "08/", and "08/2027" becomes "08/27".
    Deleting is left alone, so the slash can be taken out. */
export function formatExpiry(next: string, prev: string): string {
  const full = /^\s*(\d{1,2})\s*[/-]\s*(\d{4}|\d{2})\s*$/.exec(next);
  if (full) return `${full[1]!.padStart(2, '0')}/${full[2]!.slice(-2)}`;
  if (next.length < prev.length) return next.replace(/[^\d/]/g, '').slice(0, 5);
  if (/^\s*\d\s*[/-]$/.test(next)) return `0${next.trim()[0]}/`;   // "1/": a slash typed after one digit ends the month
  const d = next.replace(/\D/g, '').slice(0, 4);
  if (d.length === 1 && d > '1') return `0${d}/`;
  return d.length >= 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/** Whether a well-formed MM/YY has gone: a card works to the end of its month. */
export function expired(expiry: string, now = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  return !!m && new Date(2000 + Number(m[2]), Number(m[1]), 1) <= now;
}

export const methodOf = (methods: readonly PaymentMethod[], id: string) => methods.find((m) => m.id === id);
export const providerName = (list: readonly PaymentProvider[], id: string) => list.find((p) => p.id === id)?.name ?? '';

/** The method in the review: "Visa ending in 4242, expires 08/27", "Bank transfer to a BCA virtual account". */
export function methodSummary(m: PaymentMethod | undefined, a: PaymentAnswers, card: { last4: string; expiry: string }): string {
  if (!m) return '';
  switch (m.kind) {
    case 'card': {
      const saved = m.savedCards?.find((c) => c.id === a.savedCard);
      return saved ? `${saved.brand} ending in ${saved.last4}, expires ${saved.expiry}` : `Card ending in ${card.last4}, expires ${card.expiry}`;
    }
    case 'bank': return `Bank transfer to a ${providerName(m.banks, a.bank)} virtual account`;
    case 'ewallet': return `${providerName(m.providers, a.ewallet)}, on ${a.walletPhone}`;
    case 'qr': return `${m.label}: a QR code to scan after you place the order`;
    default: return m.label;
  }
}

/** The list of methods, as radio cards with an icon each. */
export function MethodList({ methods, value, onChange, error }: {
  methods: readonly PaymentMethod[]; value: string; onChange: (id: string) => void; error?: React.ReactNode;
}) {
  return (
    <Field label="How would you like to pay?" group required error={error}>
      <RadioGroup id="checkout-method" name="method" variant="card" value={value} onValueChange={(v) => onChange(String(v))}>
        {methods.map((m) => (
          <Radio key={m.id} value={m.id} disabled={!!m.unavailable} description={m.unavailable ?? m.description}>
            <span className="inline-flex items-center gap-2"><Icon icon={m.icon ?? ICONS[m.kind]} size="sm" />{m.label}</span>
          </Radio>
        ))}
      </RadioGroup>
    </Field>
  );
}

/** What the chosen method asks, under the list. `card` draws the new card's fields, which Checkout owns. */
export function MethodDetails({ method, a, set, error, card }: {
  method: PaymentMethod | undefined; a: PaymentAnswers; set: (patch: Partial<PaymentAnswers>) => void;
  error: (k: keyof PaymentAnswers) => React.ReactNode; card: React.ReactNode;
}) {
  if (!method) return null;
  const note = (text: React.ReactNode) => <p className="m-0 text-sm text-text-muted">{text}</p>;
  switch (method.kind) {
    case 'card': {
      const saved = method.savedCards ?? [];
      if (!saved.length) return <>{card}</>;
      return (
        <>
          <Field label="Card" group required error={error('savedCard')}>
            <RadioGroup id="checkout-savedCard" name="savedCard" value={a.savedCard} onValueChange={(v) => set({ savedCard: String(v) })}>
              {saved.map((c) => {
                const gone = expired(c.expiry);
                return (
                  <Radio key={c.id} value={c.id} disabled={gone} description={gone ? `Expired ${c.expiry}` : `Expires ${c.expiry}`}>
                    {c.brand} ending in <bdi>{c.last4}</bdi>
                  </Radio>
                );
              })}
              <Radio value="new">A new card</Radio>
            </RadioGroup>
          </Field>
          {a.savedCard === 'new' ? card : null}
        </>
      );
    }
    case 'wallet':
      return note(`After “Place order”, ${method.label} opens for you to confirm the payment.`);
    case 'bank':
      return (
        <>
          <Field label="Your bank" required error={error('bank')} hint="You get a virtual account number at this bank once the order is placed.">
            <Select id="checkout-bank" name="bank" value={a.bank} onChange={(e) => set({ bank: e.target.value })}
              placeholder="Choose a bank" options={method.banks.map((b) => ({ value: b.id, label: b.name }))} className="max-w-64" />
          </Field>
        </>
      );
    case 'ewallet':
      return (
        <>
          <Field label="E-wallet" group required error={error('ewallet')}>
            <RadioGroup id="checkout-ewallet" name="ewallet" orientation="horizontal" value={a.ewallet} onValueChange={(v) => set({ ewallet: String(v) })}>
              {method.providers.map((p) => <Radio key={p.id} value={p.id}>{p.name}</Radio>)}
            </RadioGroup>
          </Field>
          <Field label="Phone number for the e-wallet" required error={error('walletPhone')} hint="Its app asks you to approve the payment.">
            <Input id="checkout-walletPhone" name="walletPhone" type="tel" autoComplete="tel" value={a.walletPhone}
              onChange={(e) => set({ walletPhone: e.target.value })} className="max-w-64" />
          </Field>
        </>
      );
    case 'qr':
      return note('After “Place order”, we show a QR code. Scan it with any banking or e-wallet app that takes QRIS, within 15 minutes.');
  }
}

/* A stand-in QR code for the demo, drawn from the order's total so it's the same on every render: a real one comes
   from the payment provider as `qrImage`. Dark on white in every theme, as scanners need. */
function DemoQr({ seed, label }: { seed: string; label: string }) {
  const n = 25;
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const finder = (x: number, y: number) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx! && x < fx! + 7 && y >= fy! && y < fy! + 7);
  const cells: string[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue;
      h = Math.imul(h ^ (x * 31 + y), 2654435761) >>> 0;
      if (h & 1) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const eyes = [[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y]) => `M${x} ${y}h7v7h-7zM${x! + 1} ${y! + 1}v5h5v-5zM${x! + 2} ${y! + 2}h3v3h-3z`).join('');
  return (
    <svg role="img" aria-label={label} viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="block size-48 max-w-full rounded-md bg-white text-black">
      <path d={eyes + cells.join('')} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** What to do after the order, for a method paid then: the account number, the app to approve in, or the QR code,
    with the time left. `onExpired` runs when the time is up. */
export function PayNext({ method, a, total, totalText, instructions, onExpired, expiredNow, onChooseAnother }: {
  method: PaymentMethod; a: PaymentAnswers; total: React.ReactNode; totalText: string; instructions: PaymentInstructions;
  onExpired: () => void; expiredNow: boolean; onChooseAnother: () => void;
}) {
  const clock = (label: string) => (
    <Countdown label={label} to={instructions.secondsLeft == null ? instructions.payBy : undefined} seconds={instructions.secondsLeft}
      endText="Time’s up" onEnd={onExpired} />
  );
  if (expiredNow) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="m-0 text-text-danger">The time to pay has run out, so the order is canceled. Nothing was charged.</p>
        <Button onClick={onChooseAnother}>Choose another way to pay</Button>
      </div>
    );
  }
  if (method.kind === 'bank') {
    const number = instructions.accountNumber ?? '';
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0">Transfer exactly {total} to this virtual account from your bank’s app. The order is confirmed as soon as it arrives.</p>
        <DescriptionList layout="split" className="gap-2 text-sm">
          <DescriptionItem term="Bank">{providerName(method.banks, a.bank)}</DescriptionItem>
          <DescriptionItem term="Virtual account number">
            <span className="inline-flex flex-wrap items-center gap-2">
              <span dir="ltr" className="font-mono text-base font-semibold tabular-nums">{number}</span>
              <CopyButton value={number.replace(/\s/g, '')} size="sm">Copy number</CopyButton>
            </span>
          </DescriptionItem>
          <DescriptionItem term="Amount">
            <span className="inline-flex flex-wrap items-center gap-2">{total}<CopyButton value={totalText} size="sm">Copy amount</CopyButton></span>
          </DescriptionItem>
          <DescriptionItem term="Pay within">{clock('Time left to pay')}</DescriptionItem>
        </DescriptionList>
      </div>
    );
  }
  if (method.kind === 'ewallet') {
    return (
      <div className="flex flex-col gap-2">
        <p className="m-0 wrap-anywhere">Open {providerName(method.providers, a.ewallet)} on your phone (<bdi>{a.walletPhone}</bdi>) and approve the payment of {total}.</p>
        <p className="m-0 text-sm">Approve within {clock('Time left to approve')}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="m-0">Scan this code with any banking or e-wallet app that takes {method.label}, and pay {total}.</p>
      {instructions.qrImage
        ? <img src={instructions.qrImage} alt={`QR code to pay ${totalText}`} className="block size-48 max-w-full rounded-md bg-white" />
        : <DemoQr seed={totalText} label={`QR code to pay ${totalText}`} />}
      <p className="m-0 text-sm">The code works for {clock('Time left to scan the code')}</p>
    </div>
  );
}

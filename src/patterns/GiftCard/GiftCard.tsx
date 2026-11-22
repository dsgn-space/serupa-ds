'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { DateField } from '../../components/DateField/DateField';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { Image } from '../../components/Image/Image';
import { Input } from '../../components/Input/Input';
import { Link } from '../../components/Link/Link';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Textarea } from '../../components/Textarea/Textarea';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { formatDate } from '../../components/FormattedDate/FormattedDate';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Gift card: choose an amount and a design, say who it's for and when to send it, see what they'll get, and add it to
   the bag. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the amounts and the designs are groups of radios named by their question; Another amount brings a number
     field right after it.
   - 3.3.2, 1.3.5: each field says what it's for and which are optional; the amounts say the lowest and highest; the
     email says it's where the card goes.
   - 1.3.1, 4.1.3: the preview is a named region that shows the card as they'll get it, in words as well as the picture.
   - 3.3.1, 2.4.3: adding with problems shows a summary at the top that takes focus, each problem a link to its field.
   - 3.3.4, 4.1.3: Add to bag shows it's busy; one that can't be added says so and keeps everything.
   - 2.4.3: once added, the answer's heading takes focus, with what was added and when it's sent.
   Paying and sending are the app's job: onAdd gets the gift; reject when it can't be added. */

export interface Gift {
  amount: number;
  design: string;
  to: string;
  email: string;
  message: string;
  /** When to send it, as YYYY-MM-DD. */
  send: string;
  from: string;
}

export interface GiftCardProps {
  /** The money it's in. Default: "USD". */
  currency?: string | undefined;
  /** The amounts to choose from. Default: 25, 50 and 100. */
  amounts?: number[] | undefined;
  /** The lowest and highest amount. Default: 10 and 500. */
  min?: number | undefined;
  max?: number | undefined;
  /** Today, as YYYY-MM-DD: the first day it can be sent. Default: today. */
  today?: string | undefined;
  /** Adds the gift card to the bag. Reject when it can't be added. */
  onAdd?: ((gift: Gift) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const art = (bg: string, fg: string, shape: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><rect width="480" height="300" fill="${bg}"/>${shape.replaceAll('F', fg)}</svg>`);
export const GIFT_DESIGNS = [
  { id: 'confetti', label: 'Confetti', image: art('#28305e', '#f2c14e', '<circle cx="60" cy="50" r="10" fill="F"/><circle cx="400" cy="80" r="14" fill="F"/><rect x="200" y="200" width="18" height="18" fill="F" transform="rotate(30 209 209)"/><circle cx="120" cy="230" r="8" fill="F"/><rect x="330" y="220" width="14" height="14" fill="F"/>') },
  { id: 'leaves', label: 'Leaves', image: art('#e5eedc', '#4c7a3d', '<path d="M60 260 Q120 140 240 120 Q180 240 60 260Z" fill="F"/><path d="M420 40 Q380 140 280 170 Q300 70 420 40Z" fill="F"/>') },
  { id: 'plain', label: 'Plain', image: art('#ece8e1', '#1f1f1f', '<rect x="24" y="24" width="432" height="252" fill="none" stroke="F" stroke-width="2"/>') },
];
const FIELDS = ['amount', 'other', 'to', 'email', 'message', 'send', 'from'] as const;
type Problems = Partial<Record<(typeof FIELDS)[number], string>>;
type Draft = Omit<Gift, 'amount'> & { amount: string; other: number | null };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MESSAGE = 200;

/** What's wrong with a gift card, by field, in the order of the form, or {} when it can be added. */
export function giftProblems(d: Draft, today: string, min: number, max: number, money: (n: number) => string = String): Problems {
  const out: Problems = {};
  if (!d.amount) out.amount = 'Choose an amount.';
  else if (d.amount === 'other' && (d.other === null || d.other < min || d.other > max)) out.other = `Enter an amount from ${money(min)} to ${money(max)}.`;
  if (!d.to.trim()) out.to = 'Enter who it’s for.';
  if (!d.email.trim()) out.email = 'Enter their email address: that’s where it’s sent.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) out.email = 'Enter an email address like name@example.com.';
  if (d.message.length > MESSAGE) out.message = `Shorten the message to ${MESSAGE} characters.`;
  const yearOn = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;
  if (!d.send) out.send = 'Enter the day to send it.';
  else if (d.send < today) out.send = 'Enter today or a day after it.';
  else if (d.send > yearOn) out.send = 'Enter a day within a year.';
  if (!d.from.trim()) out.from = 'Enter your name, so they know who it’s from.';
  return out;
}

/** The gift card page: a skip link, a header, then main with the h1, and the form and its preview or the answer. */
export function GiftCard({ currency = 'USD', amounts = [25, 50, 100], min = 10, max = 500, today = iso(new Date()), onAdd, online }: GiftCardProps) {
  const locale = useLocale();
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency, maximumFractionDigits: 0 });
  const day = (s: string) => formatDate(s, locale, { dateStyle: 'long' });
  const [d, setD] = React.useState<Draft>({ amount: '', other: null, design: 'confetti', to: '', email: '', message: '', send: today, from: '' });
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [added, setAdded] = React.useState<Gift | null>(null);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const edit = (patch: Partial<Draft>) => { setD((now) => ({ ...now, ...patch })); setFailed(false); };
  const amount = d.amount === 'other' ? d.other : d.amount ? Number(d.amount) : null;
  const design = GIFT_DESIGNS.find((g) => g.id === d.design) ?? GIFT_DESIGNS[0]!;
  const errors: ErrorSummaryItem[] = FIELDS.filter((f) => problems[f]).map((f) => ({ field: `gift-${f}`, message: problems[f] }));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = giftProblems(d, today, min, max, money);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    setBusy(true);
    const gift: Gift = { amount: amount!, design: d.design, to: d.to.trim(), email: d.email.trim(), message: d.message.trim(), send: d.send, from: d.from.trim() };
    void Promise.resolve().then(() => onAdd?.(gift)).then(() => setAdded(gift), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (added) answer.current?.focus(); }, [added]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#bag">Bag</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">Your choices stay here. Adding the card to your bag needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Shop', href: '#shop' }, { label: 'Gift cards' }]} title="Send a gift card"
          description="Sent by email on the day you choose. It never expires and works in our shops and online." />
        {added ? (
          <section aria-labelledby="gift-added" className="flex flex-col items-start gap-4 pt-6">
            <h2 id="gift-added" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Gift card added to your bag</h2>
            <DescriptionList layout="split" className="max-w-md">
              <DescriptionItem term="Amount">{money(added.amount)}</DescriptionItem>
              <DescriptionItem term="For">{added.to}, {added.email}</DescriptionItem>
              <DescriptionItem term="Sent on">{added.send === today ? 'Today, once you’ve paid' : day(added.send)}</DescriptionItem>
            </DescriptionList>
            <div className="flex flex-wrap gap-3">
              <Link href="#bag">Go to your bag</Link>
              <Link href="#shop">Keep shopping</Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-6 pt-6 md:grid-cols-2">
            <form onSubmit={add} noValidate aria-label="Gift card" className="flex flex-col gap-4">
              <ErrorSummary key={tries} errors={errors} />
              <Field label="Amount" hint={`From ${money(min)} to ${money(max)}.`} group error={problems.amount} required>
                <RadioGroup id="gift-amount" name="gift-amount" orientation="horizontal" value={d.amount} onValueChange={(v: string) => edit({ amount: v })}>
                  {amounts.map((a) => <Radio key={a} value={String(a)}>{money(a)}</Radio>)}
                  <Radio value="other">Another amount</Radio>
                </RadioGroup>
              </Field>
              {d.amount === 'other' ? (
                <Field label="Your amount" id="gift-other" error={problems.other} required>
                  <NumberInput currency={currency} min={min} max={max} value={d.other} onValueChange={(n) => edit({ other: n })} className="max-w-48" />
                </Field>
              ) : null}
              <Field label="Design" group>
                <RadioGroup name="gift-design" orientation="horizontal" value={d.design} onValueChange={(v: string) => edit({ design: v })}>
                  {GIFT_DESIGNS.map((g) => <Radio key={g.id} value={g.id}>{g.label}</Radio>)}
                </RadioGroup>
              </Field>
              <Field label="Who it’s for" id="gift-to" error={problems.to} required>
                <Input autoComplete="off" value={d.to} onChange={(e) => edit({ to: e.target.value })} />
              </Field>
              <Field label="Their email" id="gift-email" hint="We send the card here." error={problems.email} required>
                <Input type="email" autoComplete="off" value={d.email} onChange={(e) => edit({ email: e.target.value })} />
              </Field>
              <Field label="Message" id="gift-message" hint="Printed on the card." error={problems.message} optional>
                <Textarea rows={3} maxLength={MESSAGE} showCount value={d.message} onChange={(e) => edit({ message: e.target.value })} />
              </Field>
              <Field label="Send on" hint="Today, or any day within a year." error={problems.send} required>
                <DateField id="gift-send" value={d.send} min={today} onValueChange={(v) => edit({ send: v })} />
              </Field>
              <Field label="From" id="gift-from" error={problems.from} required>
                <Input autoComplete="name" value={d.from} onChange={(e) => edit({ from: e.target.value })} />
              </Field>
              <div className="flex flex-col items-start gap-3">
                {failed ? <Alert tone="danger">Couldn’t add it to your bag. Try again; everything is still here.</Alert> : null}
                <Button type="submit" loading={busy}>Add to bag</Button>
              </div>
            </form>
            <section aria-labelledby="gift-preview" className="flex flex-col gap-4 md:self-start">
              <h2 id="gift-preview" className="m-0 text-lg font-semibold">What they’ll get</h2>
              <Card padding="none" className="overflow-hidden">
                <Image src={design.image} alt={`The ${design.label} design`} ratio={1.6} />
                <div className="flex flex-col gap-1 p-4">
                  <p className="m-0 text-2xl font-semibold">{amount ? money(amount) : 'Choose an amount'}</p>
                  <p className="m-0">For {d.to.trim() || 'them'}, from {d.from.trim() || 'you'}</p>
                  {d.message.trim() ? <p className="m-0 text-text-muted wrap-break-word">{d.message.trim()}</p> : null}
                  <p className="m-0 text-sm text-text-muted">{d.send ? `Sent on ${day(d.send)}` : 'Choose a day to send it'}</p>
                </div>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

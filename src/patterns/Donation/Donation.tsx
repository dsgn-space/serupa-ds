'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Link } from '../../components/Link/Link';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Donation: give once or every month, choose an amount that says what it pays for, cover the card fee if you like, and
   see the total before you give. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: how often and how much are groups of radios named by their question; each amount says what it pays for, as
     its description, so it's read with it; Another amount brings a number field right after it.
   - 3.3.2: the lowest amount is said before you type; covering the fee says how much it adds.
   - 4.1.3, 3.3.4: the total says what you'll give and how often, and Give names it ("Give $52 a month").
   - 3.3.1, 2.4.3: giving with problems shows a summary at the top that takes focus, each problem a link to its field.
   - 3.3.4, 4.1.3: Give shows it's busy; a gift that can't be taken says so and keeps everything.
   - 2.4.3: once given, the thank-you's heading takes focus, says what was taken and how to stop a monthly gift.
   Paying is the app's job: onGive gets the gift; reject when it can't be taken. */

export interface Gift { amount: number; fee: number; monthly: boolean; name: string; email: string }

export interface DonationProps {
  /** The money it's in. Default: "USD". */
  currency?: string | undefined;
  /** The amounts to choose from, each with what it pays for. */
  amounts?: { amount: number; buys: string }[] | undefined;
  /** The lowest gift. Default: 2. */
  min?: number | undefined;
  /** The card fee as a share of the gift, and a fixed part. Default: 2.9% and 0.30. */
  fee?: { rate: number; fixed: number } | undefined;
  /** Takes the gift. Reject when it can't be taken. */
  onGive?: ((gift: Gift) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoAmounts = [
  { amount: 10, buys: 'A week of school meals for one child' },
  { amount: 25, buys: 'A set of schoolbooks for a year' },
  { amount: 50, buys: 'A month of a teacher’s training' },
  { amount: 100, buys: 'Desks for a classroom' },
];
const FIELDS = ['amount', 'other', 'name', 'email'] as const;
type Problems = Partial<Record<(typeof FIELDS)[number], string>>;

/** The fee that covers the card's cut of a gift, so the charity gets all of it, rounded up to the cent. */
export function coverFee(amount: number, fee: { rate: number; fixed: number }) {
  if (amount <= 0) return 0;
  return Math.ceil(((amount + fee.fixed) / (1 - fee.rate) - amount) * 100) / 100;
}

/** What's wrong with a gift, by field, in the order of the form, or {} when it can be given. */
export function giftProblems(d: { amount: string; other: number | null; name: string; email: string }, min: number, money: (n: number) => string = String): Problems {
  const out: Problems = {};
  if (!d.amount) out.amount = 'Choose an amount.';
  else if (d.amount === 'other' && (d.other === null || d.other < min)) out.other = `Enter an amount of ${money(min)} or more.`;
  if (!d.name.trim()) out.name = 'Enter your name, for the receipt.';
  if (!d.email.trim()) out.email = 'Enter your email address, for the receipt.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) out.email = 'Enter an email address like name@example.com.';
  return out;
}

/** The donation page: a skip link, a header, then main with the h1, and the form or the thank-you. */
export function Donation({ currency = 'USD', amounts = demoAmounts, min = 2, fee = { rate: 0.029, fixed: 0.3 }, onGive, online }: DonationProps) {
  const locale = useLocale();
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
  const [d, setD] = React.useState({ monthly: 'once', amount: '', other: null as number | null, cover: false, name: '', email: '' });
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [given, setGiven] = React.useState<Gift | null>(null);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const edit = (patch: Partial<typeof d>) => { setD((now) => ({ ...now, ...patch })); setFailed(false); };
  const amount = d.amount === 'other' ? d.other ?? 0 : Number(d.amount || 0);
  const added = d.cover ? coverFee(amount, fee) : 0;
  const monthly = d.monthly === 'monthly';
  const every = monthly ? ' a month' : '';
  const errors: ErrorSummaryItem[] = FIELDS.filter((f) => problems[f]).map((f) => ({ field: `donate-${f}`, message: problems[f] }));

  const give = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = giftProblems(d, min, money);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    setBusy(true);
    const gift: Gift = { amount, fee: added, monthly, name: d.name.trim(), email: d.email.trim() };
    void Promise.resolve().then(() => onGive?.(gift)).then(() => setGiven(gift), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (given) answer.current?.focus(); }, [given]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Schools</p>
        <Link underline="hover" href="#about">About us</Link>
      </header>
      <Container as="main" size="prose" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your choices stay here. Giving needs a connection.</OfflineBanner>
          <PageHeader title="Give to Acme Schools" description="Every gift goes to schools in the villages we work in. We’re a registered charity; your gift may be tax-deductible." />
          {given ? (
            <section aria-labelledby="donate-thanks" className="flex flex-col items-start gap-3 pt-6">
              <h2 id="donate-thanks" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Thank you, {given.name}</h2>
              <p className="m-0">
                We’ve taken {money(given.amount + given.fee)}{given.monthly ? ', and will take it on this day each month' : ''}. Your receipt is on its way to {given.email}.
              </p>
              {given.monthly ? <p className="m-0">You can change or stop your monthly gift at any time from the link in the receipt.</p> : null}
              <Link href="#about">See what your gift does</Link>
            </section>
          ) : (
            <form onSubmit={give} noValidate aria-label="Your gift" className="flex flex-col gap-4 pt-6">
              <ErrorSummary key={tries} errors={errors} />
              <p className="m-0 text-text-muted">Fields marked * are required.</p>
              <Field label="How often?" group>
                <RadioGroup name="donate-often" orientation="horizontal" value={d.monthly} onValueChange={(v: string) => edit({ monthly: v })}>
                  <Radio value="once">Once</Radio>
                  <Radio value="monthly">Every month</Radio>
                </RadioGroup>
              </Field>
              <Field label="How much?" group error={problems.amount} required>
                <RadioGroup id="donate-amount" name="donate-amount" value={d.amount} onValueChange={(v: string) => edit({ amount: v })}>
                  {amounts.map((a) => <Radio key={a.amount} value={String(a.amount)} description={a.buys}>{money(a.amount)}{every}</Radio>)}
                  <Radio value="other">Another amount</Radio>
                </RadioGroup>
              </Field>
              {d.amount === 'other' ? (
                <Field label={`Your amount${every}`} id="donate-other" hint={`${money(min)} or more.`} error={problems.other} required>
                  <NumberInput currency={currency} min={0} value={d.other} onValueChange={(n) => edit({ other: n })} className="max-w-48" />
                </Field>
              ) : null}
              <Checkbox checked={d.cover} onCheckedChange={(on) => edit({ cover: on })}
                description={amount ? `Adds ${money(coverFee(amount, fee))}${every}, so we get all of your gift.` : 'Adds a little, so we get all of your gift.'}>
                Cover the card fee
              </Checkbox>
              <Field label="Your name" id="donate-name" error={problems.name} required>
                <Input autoComplete="name" value={d.name} onChange={(e) => edit({ name: e.target.value })} />
              </Field>
              <Field label="Your email" id="donate-email" hint="For your receipt. We never share it." error={problems.email} required>
                <Input type="email" autoComplete="email" value={d.email} onChange={(e) => edit({ email: e.target.value })} />
              </Field>
              <Card padding="sm" variant="filled">
                <p className="m-0" aria-live="polite" id="donate-total">
                  {amount ? <>You’ll give <strong>{money(amount + added)}{every}</strong>{added ? `, ${money(added)} of it for the card fee` : ''}.</> : 'Choose an amount to see your total.'}
                </p>
              </Card>
              <div className="flex flex-col items-start gap-3">
                {failed ? <Alert tone="danger">Couldn’t take your gift, and nothing was charged. Try again; everything is still here.</Alert> : null}
                <Button type="submit" loading={busy}>{amount ? `Give ${money(amount + added)}${every}` : 'Give'}</Button>
              </div>
            </form>
          )}
        </Stack>
      </Container>
    </div>
  );
}

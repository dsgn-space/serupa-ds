'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
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

/* Send money: choose who, say how much, see what they'll get, check it all on a review step, then send. For an app to
   copy. What it carries (WCAG 2.2):
   - 1.3.1: who it's to is a group of radios named by the question, each with their bank as its description.
   - 3.3.2, 4.1.3: your balance is said before you type; what they'll get, the fee and the rate follow the amount.
   - 3.3.1, 2.4.3: continuing with problems shows a summary at the top that takes focus, each problem a link.
   - 3.3.4: money moves only after a review step that lists who, how much, the fee, what they get and when it
     arrives; Change goes back with everything kept.
   - 2.4.3: each step's heading takes focus: the review, back to the form on Change, and the answer once sent.
   - 3.3.4, 4.1.3: Send shows it's busy; a transfer that can't be sent says nothing moved and stays on the review.
   Moving the money is the app's job: onSend gets the transfer; reject when it can't be sent. */

export interface Recipient { id: string; name: string; bank: string; currency: string; rate: number; arrives: string }
export interface Transfer { to: string; amount: number; fee: number; receives: number; reference: string }

export interface SendMoneyProps {
  /** Your money: its currency and how much you have. Default: USD 1,240.50. */
  account?: { currency: string; balance: number } | undefined;
  /** The people you've sent to before. */
  recipients?: Recipient[] | undefined;
  /** The fee: a share of the amount and a smallest fee. Default: 0.5% and 1. */
  fee?: { rate: number; min: number } | undefined;
  /** Sends the money. Reject when it can't be sent. */
  onSend?: ((transfer: Transfer) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoRecipients: Recipient[] = [
  { id: 'dewi', name: 'Dewi Lestari', bank: 'Bank Mandiri, account ending 4821', currency: 'IDR', rate: 15890, arrives: 'Today, within an hour' },
  { id: 'chen', name: 'Chen Wei', bank: 'Bank of China, account ending 0037', currency: 'CNY', rate: 7.12, arrives: 'In 1 to 2 working days' },
  { id: 'lena', name: 'Lena Vogel', bank: 'Sparkasse, IBAN ending 3104', currency: 'EUR', rate: 0.92, arrives: 'Tomorrow' },
];
const FIELDS = ['to', 'amount'] as const;
type Problems = Partial<Record<(typeof FIELDS)[number], string>>;

/** The fee, what leaves your account and what arrives, for an amount at a rate. */
export function transferQuote(amount: number, rate: number, fee: { rate: number; min: number }) {
  const f = amount > 0 ? Math.max(fee.min, Math.round(amount * fee.rate * 100) / 100) : 0;
  return { fee: f, total: Math.round((amount + f) * 100) / 100, receives: Math.round(amount * rate * 100) / 100 };
}

/** What's wrong with a transfer, by field, or {} when it can go to review. */
export function transferProblems(to: string, amount: number | null, total: number, balance: number, money: (n: number) => string = String): Problems {
  const out: Problems = {};
  if (!to) out.to = 'Choose who to send it to.';
  if (!amount || amount <= 0) out.amount = 'Enter how much to send.';
  else if (total > balance) out.amount = `Enter a smaller amount: with the fee, it’s more than your ${money(balance)}.`;
  return out;
}

/** The send money page: a skip link, a header, then main with the h1, and the form, the review or the answer. */
export function SendMoney({ account = { currency: 'USD', balance: 1240.5 }, recipients = demoRecipients, fee = { rate: 0.005, min: 1 }, onSend, online }: SendMoneyProps) {
  const locale = useLocale();
  const money = (n: number, currency = account.currency) => formatNumber(n, locale, { style: 'currency', currency });
  const [to, setTo] = React.useState('');
  const [amount, setAmount] = React.useState<number | null>(null);
  const [reference, setReference] = React.useState('');
  const [step, setStep] = React.useState<'form' | 'review' | 'sent'>('form');
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const moved = React.useRef(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const who = recipients.find((r) => r.id === to);
  const q = transferQuote(amount ?? 0, who?.rate ?? 1, fee);
  const errors: ErrorSummaryItem[] = FIELDS.filter((f) => problems[f]).map((f) => ({ field: `send-${f}`, message: problems[f] }));
  const go = (next: typeof step) => { moved.current = true; setStep(next); };

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    const found = transferProblems(to, amount, q.total, account.balance, money);
    setProblems(found);
    setTries((t) => t + 1);
    if (!Object.keys(found).length) go('review');
  };
  const send = () => {
    setFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onSend?.({ to, amount: amount!, fee: q.fee, receives: q.receives, reference: reference.trim() }))
      .then(() => go('sent'), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (moved.current) heading.current?.focus(); }, [step]);
  const h2 = 'm-0 text-xl font-semibold outline-none';

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Bank</p>
        <Link underline="hover" href="#accounts">Accounts</Link>
      </header>
      <Container as="main" size="prose" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your transfer stays here. Sending it needs a connection, and the fee is checked again first.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Accounts', href: '#accounts' }, { label: 'Send money' }]} title="Send money"
            description={`You have ${money(account.balance)} in your account.`} />
          <div className="flex flex-col gap-5 pt-6">
            {step === 'form' ? (
              <form onSubmit={review} noValidate aria-labelledby="send-form" className="flex flex-col gap-4">
                <h2 id="send-form" ref={heading} tabIndex={-1} className={h2}>Who and how much</h2>
                <ErrorSummary key={tries} errors={errors} />
                <p className="m-0 text-text-muted">Fields marked * are required.</p>
                <Field label="Send to" group error={problems.to} required>
                  <RadioGroup id="send-to" name="send-to" variant="card" value={to} onValueChange={(v: string) => { setTo(v); setFailed(false); }}>
                    {recipients.map((r) => <Radio key={r.id} value={r.id} description={r.bank}>{r.name}</Radio>)}
                  </RadioGroup>
                </Field>
                <Field label={`Amount in ${account.currency}`} id="send-amount" hint={`Up to ${money(account.balance)}, with the fee.`} error={problems.amount} required>
                  <NumberInput currency={account.currency} min={0} value={amount} onValueChange={setAmount} className="max-w-56" />
                </Field>
                <Card padding="sm" variant="filled">
                  <p className="m-0" id="send-quote" aria-live="polite">
                    {who && amount ? <>{who.name} gets <strong>{money(q.receives, who.currency)}</strong>. Fee {money(q.fee)}; {money(q.total)} leaves your account. 1 {account.currency} = {formatNumber(who.rate, locale)} {who.currency}.</>
                      : 'Choose who and how much to see what they get.'}
                  </p>
                </Card>
                <Field label="Reference" id="send-reference" hint="They see this on their statement." optional>
                  <Input maxLength={35} value={reference} onChange={(e) => setReference(e.target.value)} />
                </Field>
                <div><Button type="submit">Review</Button></div>
              </form>
            ) : step === 'review' && who ? (
              <section aria-labelledby="send-review" className="flex flex-col items-start gap-4">
                <h2 id="send-review" ref={heading} tabIndex={-1} className={h2}>Check and send</h2>
                <p className="m-0">Nothing has moved yet. Once you send, it can’t be stopped.</p>
                <DescriptionList layout="split" className="w-full max-w-md">
                  <DescriptionItem term="To">{who.name}<span className="block text-sm text-text-muted">{who.bank}</span></DescriptionItem>
                  <DescriptionItem term="You send">{money(amount!)}</DescriptionItem>
                  <DescriptionItem term="Fee">{money(q.fee)}</DescriptionItem>
                  <DescriptionItem term="Leaves your account">{money(q.total)}</DescriptionItem>
                  <DescriptionItem term="They get">{money(q.receives, who.currency)}</DescriptionItem>
                  <DescriptionItem term="Arrives">{who.arrives}</DescriptionItem>
                  {reference.trim() ? <DescriptionItem term="Reference">{reference.trim()}</DescriptionItem> : null}
                </DescriptionList>
                {failed ? <Alert tone="danger">Couldn’t send it, and nothing has moved. Try again in a moment.</Alert> : null}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={send} loading={busy}>Send {money(q.total)}</Button>
                  <Button variant="secondary" onClick={() => { setFailed(false); go('form'); }} disabled={busy}>Change</Button>
                </div>
              </section>
            ) : (
              <section aria-labelledby="send-done" className="flex flex-col items-start gap-3">
                <h2 id="send-done" ref={heading} tabIndex={-1} className={h2}>Sent to {who?.name}</h2>
                <p className="m-0">{money(q.receives, who?.currency)} arrives {who?.arrives.toLowerCase()}. We’ve emailed you a receipt.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="#accounts">Back to accounts</Link>
                  <Link href="#send" onClick={(e) => { e.preventDefault(); setAmount(null); setReference(''); setTo(''); setProblems({}); go('form'); }}>Send more money</Link>
                </div>
              </section>
            )}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

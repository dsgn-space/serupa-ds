'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Link } from '../../components/Link/Link';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { Select } from '../../components/Select/Select';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { FormattedNumber } from '../../components/FormattedNumber/FormattedNumber';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Return request: sending back some of an order, with why, how it goes back and where the money goes, and what
   happens next. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the items are a named group of checkboxes; one that can't be returned is disabled and says why next to it.
   - 3.3.2: the reason is asked for only for an item you've chosen, and labelled with its name ("Why are you returning
     the Linen shirt?").
   - 3.3.1, 2.4.3: sending with nothing chosen, or a reason missing, shows a summary that takes focus, each problem a
     link to its item or reason, which says it too.
   - 1.3.1: how it goes back and where the money goes are named radio groups; a cost is said in the choice's words.
   - 4.1.3: the refund is worked out as you choose, in a summary that's read in order, with the cost taken off by name.
   - 3.3.4, 4.1.3: Send shows it's busy; one that fails says so next to the button and keeps every choice.
   - 2.4.3: once sent, the form gives way to the next steps, whose heading takes focus.
   Returns are the app's: onSend gets the items, reasons and choices; resolve with the return's number, reject when it
   can't be made. */

export interface ReturnItem {
  id: string;
  name: string;
  /** What was chosen: "Sand, M". */
  options?: string | undefined;
  price: number;
  /** Why it can't be returned, when it can't: "Worn items can't be returned." */
  notReturnable?: string | undefined;
}

export interface ReturnChoice {
  items: { id: string; reason: string }[];
  method: 'dropoff' | 'pickup';
  refund: 'original' | 'credit';
}

export interface ReturnRequestProps {
  /** The order's number. Default: "A-10432". */
  order?: string | undefined;
  /** What was in the order. Default: demo items. */
  items?: ReturnItem[] | undefined;
  /** ISO 4217 currency. Default: "USD". */
  currency?: string | undefined;
  /** What a pickup costs, taken off the refund. Default: 5. */
  pickupFee?: number | undefined;
  /** The last day to send it back, in words: "December 20". Default: "December 20". */
  until?: string | undefined;
  /** Makes the return. Resolve with its number ("R-2041"); reject when it can't be made. */
  onSend?: ((choice: ReturnChoice) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: ReturnItem[] = [
  { id: 'i1', name: 'Linen shirt', options: 'Sand, M', price: 48 },
  { id: 'i2', name: 'Canvas tote', options: 'Natural', price: 18 },
  { id: 'i3', name: 'Wool socks', options: 'Gray, 39–42', price: 12, notReturnable: 'Socks can’t be returned once opened.' },
];
const REASONS = [
  { value: 'size', label: 'It doesn’t fit' },
  { value: 'looks', label: 'It looks different from the pictures' },
  { value: 'damaged', label: 'It arrived damaged' },
  { value: 'wrong', label: 'I got the wrong item' },
  { value: 'mind', label: 'I changed my mind' },
];

/** What's missing from a return, by field id ("return-items", "reason-<item>"), in the order of the form. */
export function returnProblems(chosen: readonly string[], reasons: Readonly<Record<string, string>>): Record<string, string> {
  if (!chosen.length) return { 'return-items': 'Choose at least one item to return.' };
  const out: Record<string, string> = {};
  for (const id of chosen) if (!reasons[id]) out[`reason-${id}`] = 'Choose why you’re returning it.';
  return out;
}

/** What comes back: the items' prices, less the pickup fee, and never under nothing. A damaged or wrong item is
 *  picked up free. */
export function refundOf(items: readonly ReturnItem[], chosen: readonly string[], reasons: Readonly<Record<string, string>>, pickup: boolean, fee: number) {
  const value = items.filter((i) => chosen.includes(i.id)).reduce((n, i) => n + i.price, 0);
  const ours = chosen.some((id) => reasons[id] === 'damaged' || reasons[id] === 'wrong');
  const cost = pickup && !ours ? Math.min(fee, value) : 0;
  return { value, cost, refund: value - cost };
}

/** The return page: a skip link, a header, then main with the h1 and the form, or the next steps once sent. */
export function ReturnRequest({ order = 'A-10432', items = demo, currency = 'USD', pickupFee = 5, until = 'December 20', onSend, online }: ReturnRequestProps) {
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [reasons, setReasons] = React.useState<Record<string, string>>({});
  const [method, setMethod] = React.useState<ReturnChoice['method']>('dropoff');
  const [refundTo, setRefundTo] = React.useState<ReturnChoice['refund']>('original');
  const [problems, setProblems] = React.useState<Record<string, string>>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);
  const next = React.useRef<HTMLHeadingElement>(null);
  const money = (n: number) => <FormattedNumber value={n} format="currency" currency={currency} />;
  const sums = refundOf(items, chosen, reasons, method === 'pickup', pickupFee);
  const clear = (id: string) => setProblems((p) => { const n = { ...p }; delete n[id]; return n; });

  const toggle = (ids: string[]) => {
    // Keep the items in their order, whatever order they were ticked in.
    setChosen(items.filter((i) => ids.includes(i.id)).map((i) => i.id));
    setFailed(false);
    if (ids.length) clear('return-items');
  };
  const errors: ErrorSummaryItem[] = Object.entries(problems).map(([field, message]) => ({ field, message }));
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const found = returnProblems(chosen, reasons);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    setFailed(false);
    setBusy(true);
    const choice: ReturnChoice = { items: chosen.map((id) => ({ id, reason: reasons[id]! })), method, refund: refundTo };
    void Promise.resolve().then(() => onSend?.(choice)).then((n) => setSent(typeof n === 'string' ? n : ''), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (sent != null) next.current?.focus(); }, [sent]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <Container as="main" size="md" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your choices stay here. Sending the request needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Orders', href: '#orders' }, { label: `Order ${order}`, href: `#order-${order}` }, { label: 'Return' }]}
            title={`Return items from order ${order}`} description={`Send them back by ${until}. Choose what, why, and how.`} />
          <div className="pt-6">
            {sent != null ? (
              <section aria-labelledby="next" className="flex flex-col items-start gap-3">
                <h2 id="next" ref={next} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Return {sent ? `${sent} ` : ''}started</h2>
                <ol className="m-0 flex flex-col gap-2 ps-5">
                  <li>{method === 'pickup' ? 'A courier will email you to pick a day to collect it.' : 'Print the label from the email we’ve sent, or show its code at a drop-off point.'}</li>
                  <li>Pack the items with their tags, and send them by {until}.</li>
                  <li>Once they’re back, {money(sums.refund)} goes {refundTo === 'credit' ? 'to your store credit, the same day' : 'back to how you paid, in up to 5 working days'}.</li>
                </ol>
                <Link href={`#order-${order}`}>Back to order {order}</Link>
              </section>
            ) : (
              <form onSubmit={send} noValidate aria-label="Return" className="grid items-start gap-6 md:grid-cols-3">
                <ErrorSummary key={tries} errors={errors} className="md:col-span-3" />
                <div className="flex flex-col gap-6 md:col-span-2">
                  <p className="m-0 text-text-muted">Fields marked * are required.</p>
                  <Field label="What are you returning?" id="return-items" error={problems['return-items']} group required>
                    <div id="return-items" className="flex flex-col gap-4">
                      {items.map((i) => (
                        <div key={i.id} className="flex flex-col gap-2">
                          <Checkbox value={i.id} checked={chosen.includes(i.id)} disabled={!!i.notReturnable}
                            onCheckedChange={(on) => toggle(on ? [...chosen, i.id] : chosen.filter((x) => x !== i.id))}
                            description={i.notReturnable ?? i.options}>
                            {i.name} <span className="text-text-muted">· {money(i.price)}</span>
                          </Checkbox>
                          {chosen.includes(i.id) ? (
                            <Field label={`Why are you returning the ${i.name}?`} id={`reason-${i.id}`} error={problems[`reason-${i.id}`]} required className="ms-7">
                              <Select placeholder="Choose a reason" options={REASONS} value={reasons[i.id] ?? ''}
                                onChange={(e) => { setReasons((r) => ({ ...r, [i.id]: e.target.value })); clear(`reason-${i.id}`); setFailed(false); }} />
                            </Field>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Field>
                  <Field label="How will you send it back?" group>
                    <RadioGroup name="return-method" value={method} onValueChange={(v: string) => setMethod(v as ReturnChoice['method'])}>
                      <Radio value="dropoff" description="At any post office or parcel locker.">Drop it off, free</Radio>
                      <Radio value="pickup" description="Free when it arrived damaged or wasn’t what you ordered.">
                        Have it picked up, {money(pickupFee)} off the refund
                      </Radio>
                    </RadioGroup>
                  </Field>
                  <Field label="Where should the money go?" group>
                    <RadioGroup name="return-refund" value={refundTo} onValueChange={(v: string) => setRefundTo(v as ReturnChoice['refund'])}>
                      <Radio value="original" description="Up to 5 working days after it’s back.">Back to how you paid</Radio>
                      <Radio value="credit" description="The same day it’s back, to spend here.">Store credit</Radio>
                    </RadioGroup>
                  </Field>
                </div>
                <Card>
                  <section aria-labelledby="refund" className="flex flex-col gap-4">
                    <h2 id="refund" className="m-0 text-lg font-semibold">Your refund</h2>
                    {chosen.length ? (
                      <DescriptionList layout="split">
                        <DescriptionItem term="Items">{money(sums.value)}</DescriptionItem>
                        {sums.cost ? <DescriptionItem term="Pickup">−{money(sums.cost)}</DescriptionItem> : null}
                        <DescriptionItem term="Refund" emphasis>{money(sums.refund)}</DescriptionItem>
                      </DescriptionList>
                    ) : <p className="m-0 text-text-muted">Choose an item to see what comes back.</p>}
                    {failed ? <Alert tone="danger">Couldn’t start the return. Try again; your choices are still here.</Alert> : null}
                    <Button type="submit" loading={busy}>Start return</Button>
                  </section>
                </Card>
              </form>
            )}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { Alert } from '../../components/Alert/Alert';
import { Stepper } from '../../components/Stepper/Stepper';
import { useSteps } from '../../components/Stepper/useSteps';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';

/* Multi-step form: an application for a business account in three steps of questions and a step that shows every
   answer before it's sent, then what happens next. For an app to copy. What it carries (WCAG 2.2):
   - 3.3.7: every step stays rendered (useSteps), so Back, the Stepper and "Change" keep every answer. Where the
     cards go is the business address unless that's unticked, so nobody types the same address twice.
   - 3.2.6: "Need help?" is in the same place, after the step, on every step, the review and the confirmation.
   - 3.3.1, 3.3.3: Continue checks the step. An ErrorSummary takes focus and links to each field, each saying what
     to write. The Stepper marks a step with a problem in words.
   - 3.3.4: nothing is sent until "Send application", after every answer is shown with a way to change it. A change
     made from there comes back to the answers, checked again on the way.
   - Email addresses and phone numbers are isolated left to right, so a right-to-left page doesn't reverse them.
   - 2.4.3, 4.1.3: each new step puts focus on its heading, so the change is said and Tab goes on from there.
   Sending is the app's job: onSubmit stands in for it. */

export type BusinessType = 'sole' | 'company' | 'partnership';
export interface Application {
  business: string; type: BusinessType | ''; registration: string;
  line1: string; line2: string; city: string; postcode: string; country: string;
  name: string; role: string; email: string; phone: string;
  /** Post the cards to the business address. Unticked, the card address fields are asked for. */
  sameAddress: boolean;
  cardLine1: string; cardLine2: string; cardCity: string; cardPostcode: string; cardCountry: string;
  currency: string; payments: 'few' | 'some' | 'many' | ''; cards: number;
}

export interface MultiStepFormProps {
  /** Answers already known, such as a saved draft or the signed-in person's details. */
  initial?: Partial<Application> | undefined;
  /** The step it opens on, from 0; 3 is the review. Every step before it needs good answers in `initial`. */
  start?: number | undefined;
  /** Opens on the review saying the application wasn't sent. Needs every answer in `initial`. */
  failed?: boolean | undefined;
  /** Opens on the confirmation, as after sending. Needs every answer in `initial`. */
  sent?: boolean | undefined;
  /** Sends the application. A rejected promise keeps the review and says it wasn't sent. */
  onSubmit?: ((answers: Application) => unknown) | undefined;
}

const EMPTY: Application = {
  business: '', type: '', registration: '', line1: '', line2: '', city: '', postcode: '', country: '',
  name: '', role: '', email: '', phone: '', sameAddress: true,
  cardLine1: '', cardLine2: '', cardCity: '', cardPostcode: '', cardCountry: '',
  currency: 'IDR', payments: '', cards: 1,
};
const COUNTRIES = [
  { value: 'ID', label: 'Indonesia' }, { value: 'MY', label: 'Malaysia' }, { value: 'PH', label: 'Philippines' },
  { value: 'SG', label: 'Singapore' }, { value: 'TH', label: 'Thailand' }, { value: 'VN', label: 'Vietnam' },
];
const CURRENCIES = [{ value: 'IDR', label: 'Indonesian rupiah (IDR)' }, { value: 'SGD', label: 'Singapore dollar (SGD)' }, { value: 'USD', label: 'US dollar (USD)' }];
const TYPES: Record<BusinessType, string> = { sole: 'Sole trader', company: 'Limited company', partnership: 'Partnership' };
const PAYMENTS = { few: 'Fewer than 50 a month', some: '50 to 500 a month', many: 'More than 500 a month' } as const;
const STEPS = [{ title: 'Your business' }, { title: 'Contact person' }, { title: 'The account' }, { title: 'Check your answers' }];
const REVIEW = STEPS.length - 1;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const id = (k: keyof Application) => `apply-${k}`;
const need = (a: Application, k: keyof Application, message: string, out: ErrorSummaryItem[]) => { if (!String(a[k]).trim()) out.push({ field: id(k), message }); };

/** What's wrong with a step's answers, in the order of its fields. The review step has none of its own. */
export function stepProblems(step: number, a: Application): ErrorSummaryItem[] {
  const out: ErrorSummaryItem[] = [];
  if (step === 0) {
    need(a, 'business', 'Enter the business’s name, as it’s registered', out);
    if (!a.type) out.push({ field: 'apply-type-sole', message: 'Choose what kind of business it is' });
    if (a.type === 'company') {
      if (!a.registration.trim()) out.push({ field: id('registration'), message: 'Enter the company’s registration number' });
      else if (!/^[A-Z0-9-]{6,20}$/i.test(a.registration.replace(/\s/g, ''))) out.push({ field: id('registration'), message: 'Enter the registration number as it is on the certificate: 6 to 20 letters and numbers' });
    }
    need(a, 'line1', 'Enter the first line of the business address', out);
    need(a, 'city', 'Enter the town or city', out);
    need(a, 'postcode', 'Enter the postcode', out);
    need(a, 'country', 'Choose the country', out);
  } else if (step === 1) {
    need(a, 'name', 'Enter the contact person’s full name', out);
    if (!a.email.trim()) out.push({ field: id('email'), message: 'Enter an email address' });
    else if (!EMAIL.test(a.email.trim())) out.push({ field: id('email'), message: 'Enter an email address like name@example.com' });
    need(a, 'phone', 'Enter a phone number, for when we need to check something quickly', out);
    if (!a.sameAddress) {
      need(a, 'cardLine1', 'Enter the first line of the address for the cards', out);
      need(a, 'cardCity', 'Enter the town or city for the cards', out);
      need(a, 'cardPostcode', 'Enter the postcode for the cards', out);
      need(a, 'cardCountry', 'Choose the country for the cards', out);
    }
  } else if (step === 2) {
    if (!a.payments) out.push({ field: 'apply-payments-few', message: 'Choose about how many payments the business makes a month' });
    if (!(a.cards >= 1 && a.cards <= 20)) out.push({ field: id('cards'), message: 'Enter how many debit cards you need, from 1 to 20' });
  }
  return out;
}

type Part = { step: number; title: string; what: string; items: (readonly [term: string, value: React.ReactNode])[] };
const country = (v: string) => COUNTRIES.find((c) => c.value === v)?.label || v;
const address = (...parts: string[]) => parts.filter((p) => p.trim()).join('\n');

/** The application page: a skip link, then main with the Stepper, the step, and help in the same place on every step. */
export function MultiStepForm({ initial, start = 0, failed: startFailed, sent: startSent, onSubmit }: MultiStepFormProps) {
  const [a, setA] = React.useState<Application>(() => ({ ...EMPTY, ...initial }));
  const [errors, setErrors] = React.useState<Record<number, ErrorSummaryItem[]>>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(!!startFailed);
  const [sent, setSent] = React.useState(!!startSent);
  const done = React.useRef<HTMLHeadingElement>(null);
  const send = () => {
    setBusy(true);
    setFailed(false);
    Promise.resolve().then(() => onSubmit?.(a))
      .then(() => setSent(true), () => setFailed(true))
      .finally(() => setBusy(false));
  };
  const s = useSteps({
    steps: STEPS,
    defaultStep: startFailed ? REVIEW : start,
    validate: (i) => {
      const found = stepProblems(i, a);
      setErrors((e) => ({ ...e, [i]: found }));
      if (found.length) setTries((t) => t + 1);
      return !found.length;
    },
    onComplete: send,
  });
  // Once the answers have been shown, a step opened with "Change" goes back to them instead of on to the next step.
  const [reviewed, setReviewed] = React.useState(s.current === REVIEW);
  if (s.current === REVIEW && !reviewed) setReviewed(true);
  const first = React.useRef(true);
  React.useEffect(() => { if (sent && !first.current) done.current?.focus(); first.current = false; }, [sent]);

  const set = <K extends keyof Application>(k: K) => (v: Application[K]) => setA((o) => ({ ...o, [k]: v }));
  const fieldError = (step: number, k: string) => errors[step]?.find((e) => e.field === k)?.message;
  const text = (step: number, k: keyof Application, label: string, autoComplete: string, more: Partial<React.ComponentProps<typeof Input>> = {}, hint?: string, optional?: boolean) => (
    <Field label={label} hint={hint} optional={optional} error={fieldError(step, id(k))}>
      <Input id={id(k)} name={k} autoComplete={autoComplete} value={String(a[k])} onChange={(e) => set(k)(e.target.value)} {...more} />
    </Field>
  );
  const summary = (step: number) => (errors[step]?.length ? <ErrorSummary key={tries} errors={errors[step]} headingLevel={3} /> : null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (reviewed && s.current < REVIEW) void s.goTo(REVIEW); else void s.next();
  };
  const change = (step: number, what: string) => (
    <Button variant="secondary" size="sm" onClick={() => void s.goTo(step)} aria-label={`Change ${what}`} disabled={busy} disabledReason={busy ? 'Your application is being sent' : undefined}>Change</Button>
  );
  const nav = (
    <div className="flex flex-wrap gap-3">
      <Button type="submit" loading={busy} loadingText="Sending your application">
        {s.isLast ? (failed ? 'Try sending again' : 'Send application') : reviewed ? 'Save and go back to your answers' : 'Continue'}
      </Button>
      {s.isFirst ? null : <Button variant="ghost" onClick={s.back} disabled={busy}>Back</Button>}
    </div>
  );
  const h2 = (i: number) => <Heading level={2} size="xl" {...s.headingProps(i)} className="outline-none">{STEPS[i]?.title}</Heading>;

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <main id="main" className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 outline-none">
        <Heading level={1} size="2xl">Open a business account</Heading>
        <Stepper {...s.stepperProps} current={sent ? STEPS.length : s.current} onStepClick={sent || busy ? undefined : s.stepperProps.onStepClick} size="sm" aria-label="Application steps" />
        {sent ? (
          <Card className="flex flex-col gap-4">
            <Heading level={2} size="xl" ref={done} tabIndex={-1} className="outline-none">Application sent</Heading>
            <p className="m-0 wrap-anywhere">We’ve emailed a copy to <bdi dir="ltr">{a.email}</bdi>. Your reference is <strong>BA-20418</strong>.</p>
            <Heading level={3} size="base">What happens next</Heading>
            <ol className="m-0 flex list-decimal flex-col gap-1 ps-5">
              <li>We check the details, usually within 2 working days. We call {a.name || 'you'} if anything is missing.</li>
              <li>Once it’s open, we email the account number and how to sign in.</li>
              <li>The {a.cards === 1 ? 'card arrives' : 'cards arrive'} by post within 7 working days.</li>
            </ol>
            <Link href="#home">Go to the home page</Link>
          </Card>
        ) : (
          <form noValidate onSubmit={submit}>
            <Card className="flex flex-col gap-5">
              <section {...s.panelProps(0)} className="flex flex-col gap-4">
                {h2(0)}
                {summary(0)}
                {text(0, 'business', 'Business name', 'organization', {}, 'As it’s registered, or your own name for a sole trader.')}
                <Field label="Type of business" group error={fieldError(0, 'apply-type-sole')}>
                  <RadioGroup name="type" value={a.type} onValueChange={(v) => set('type')(v)} invalid={!!fieldError(0, 'apply-type-sole')}>
                    <Radio id="apply-type-sole" value="sole" description="One person runs it and is the business.">{TYPES.sole}</Radio>
                    <Radio value="company" description="Registered with its own registration number.">{TYPES.company}</Radio>
                    <Radio value="partnership" description="Two or more people run it together.">{TYPES.partnership}</Radio>
                  </RadioGroup>
                </Field>
                {a.type === 'company' ? text(0, 'registration', 'Company registration number', 'off', { spellCheck: false, autoCapitalize: 'characters', className: 'max-w-64' }, 'On the certificate of registration, like 8120001234567.') : null}
                <Heading level={3} size="base">Business address</Heading>
                {text(0, 'line1', 'Address line 1', 'address-line1')}
                {text(0, 'line2', 'Address line 2', 'address-line2', {}, undefined, true)}
                <div className="grid gap-4 sm:grid-cols-2">
                  {text(0, 'city', 'Town or city', 'address-level2')}
                  {text(0, 'postcode', 'Postcode', 'postal-code', { className: 'max-w-48' })}
                </div>
                <Field label="Country" error={fieldError(0, id('country'))}>
                  <Select id={id('country')} name="country" autoComplete="country" value={a.country} onChange={(e) => set('country')(e.target.value)} placeholder="Choose a country" options={COUNTRIES} />
                </Field>
              </section>

              <section {...s.panelProps(1)} className="flex flex-col gap-4">
                {h2(1)}
                {summary(1)}
                <p className="m-0">The person we contact about the account. They can sign in once it’s open.</p>
                {text(1, 'name', 'Full name', 'name')}
                {text(1, 'role', 'Role in the business', 'organization-title', {}, 'Such as owner, director or finance manager.', true)}
                {text(1, 'email', 'Email', 'email', { type: 'email', spellCheck: false, autoCapitalize: 'none' }, 'We send the account details here.')}
                {text(1, 'phone', 'Phone', 'tel', { type: 'tel', className: 'max-w-64' }, 'Only for when we need to check something quickly.')}
                <Heading level={3} size="base">Where to post the cards</Heading>
                <Checkbox id={id('sameAddress')} checked={a.sameAddress} onCheckedChange={set('sameAddress')}
                  description={a.line1 ? [a.line1, a.city].filter((p) => p.trim()).join(', ') : undefined}>
                  Post the cards to the business address
                </Checkbox>
                {a.sameAddress ? null : (
                  <>
                    {text(1, 'cardLine1', 'Address line 1', 'shipping address-line1')}
                    {text(1, 'cardLine2', 'Address line 2', 'shipping address-line2', {}, undefined, true)}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {text(1, 'cardCity', 'Town or city', 'shipping address-level2')}
                      {text(1, 'cardPostcode', 'Postcode', 'shipping postal-code', { className: 'max-w-48' })}
                    </div>
                    <Field label="Country" error={fieldError(1, id('cardCountry'))}>
                      <Select id={id('cardCountry')} name="cardCountry" autoComplete="shipping country" value={a.cardCountry} onChange={(e) => set('cardCountry')(e.target.value)} placeholder="Choose a country" options={COUNTRIES} />
                    </Field>
                  </>
                )}
              </section>

              <section {...s.panelProps(2)} className="flex flex-col gap-4">
                {h2(2)}
                {summary(2)}
                <Field label="Currency" hint="The account holds money in this currency. You can add others once it’s open.">
                  <Select id={id('currency')} name="currency" value={a.currency} onChange={(e) => set('currency')(e.target.value)} options={CURRENCIES} />
                </Field>
                <Field label="About how many payments will the business make?" group error={fieldError(2, 'apply-payments-few')}>
                  <RadioGroup name="payments" value={a.payments} onValueChange={(v) => set('payments')(v)} invalid={!!fieldError(2, 'apply-payments-few')}>
                    <Radio id="apply-payments-few" value="few">{PAYMENTS.few}</Radio>
                    <Radio value="some">{PAYMENTS.some}</Radio>
                    <Radio value="many">{PAYMENTS.many}</Radio>
                  </RadioGroup>
                </Field>
                <Field label="Debit cards" hint="One for each person who pays for things, up to 20." error={fieldError(2, id('cards'))}>
                  <NumberInput id={id('cards')} name="cards" min={1} max={20} value={a.cards} onValueChange={(v) => set('cards')(v ?? 0)} className="max-w-40" />
                </Field>
              </section>

              <section {...s.panelProps(REVIEW)} className="flex flex-col gap-4">
                {h2(REVIEW)}
                <p className="m-0">Nothing is sent until you send the application.</p>
                {failed ? <Alert tone="danger" title="Your application wasn’t sent">Nothing you entered is lost. Check your connection and send it again.</Alert> : null}
                {([
                  { step: 0, title: 'Your business', what: 'your business’s details', items: [
                    ['Business name', a.business], ['Type of business', a.type ? TYPES[a.type] : ''],
                    ...(a.type === 'company' ? [['Registration number', a.registration] as const] : []),
                    ['Address', address(a.line1, a.line2, a.city, a.postcode, country(a.country))],
                  ] },
                  { step: 1, title: 'Contact person', what: 'the contact person', items: [
                    ['Name', a.role ? `${a.name}, ${a.role}` : a.name], ['Email', <bdi dir="ltr">{a.email}</bdi>], ['Phone', <bdi dir="ltr" className="whitespace-nowrap">{a.phone}</bdi>],
                    ['Cards posted to', a.sameAddress ? 'The business address' : address(a.cardLine1, a.cardLine2, a.cardCity, a.cardPostcode, country(a.cardCountry))],
                  ] },
                  { step: 2, title: 'The account', what: 'the account', items: [
                    ['Currency', CURRENCIES.find((c) => c.value === a.currency)?.label || a.currency],
                    ['Payments', a.payments ? PAYMENTS[a.payments] : ''], ['Debit cards', String(a.cards)],
                  ] },
                ] satisfies Part[]).map((part) => (
                  <div key={part.step} className="flex flex-col gap-2 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Heading level={3} size="base">{part.title}</Heading>
                      {change(part.step, part.what)}
                    </div>
                    <DescriptionList className="text-sm">
                      {part.items.map(([term, value]) => <DescriptionItem key={term} term={term}><span className="whitespace-pre-line wrap-anywhere">{value}</span></DescriptionItem>)}
                    </DescriptionList>
                  </div>
                ))}
              </section>
              {nav}
            </Card>
          </form>
        )}
        {/* The same help, in the same place, on every step (3.2.6). */}
        <aside aria-labelledby="apply-help" className="flex flex-col gap-1 text-sm">
          <Heading level={2} id="apply-help" size="base">Need help?</Heading>
          <p className="m-0">Call <Link href="tel:+62215550100">+62 21 555 0100</Link>, Monday to Friday, 8 am to 6 pm, or <Link href="#chat">chat with us</Link>.</p>
        </aside>
      </main>
    </div>
  );
}

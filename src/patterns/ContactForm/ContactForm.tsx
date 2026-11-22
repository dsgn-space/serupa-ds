'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Link } from '../../components/Link/Link';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Textarea } from '../../components/Textarea/Textarea';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Contact form: a message to the people behind a product, with what they need to answer it, and an answer to say it
   arrived. For an app to copy. What it carries (WCAG 2.2):
   - 3.3.2, 1.3.5: each field says what it's for, which are optional, and its format; name and email say what they are
     for autofill. The order number is asked for only when the topic is an order.
   - 3.3.1, 2.4.3: sending with problems shows a summary at the top that takes focus, each problem a link to its
     field, and each field says its own problem too.
   - 3.3.4, 4.1.3: Send shows it's busy; a message that can't be sent says so next to the button and keeps every field.
   - 2.4.3, 4.1.3: once sent, the form gives way to an answer whose heading takes focus, with the reference and when
     to expect a reply.
   Sending is the app's job: onSend gets the message; resolve with its reference, or reject when it can't be sent. */

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  /** With the "order" topic: the order's number. */
  order: string;
  message: string;
  /** Send a copy to the email given. */
  copy: boolean;
}

export interface ContactFormProps {
  /** Sends the message. Resolve with its reference ("CF-2041"); reject when it can't be sent. */
  onSend?: ((message: ContactMessage) => unknown) | undefined;
  /** How soon you answer, for the answer page: "within 2 working days". Default: that. */
  replyTime?: string | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const TOPICS = [
  { value: 'order', label: 'An order' },
  { value: 'account', label: 'My account' },
  { value: 'product', label: 'A product question' },
  { value: 'other', label: 'Something else' },
];
const LIMIT = 1000;
const blank: ContactMessage = { name: '', email: '', topic: '', order: '', message: '', copy: false };
const FIELDS = ['name', 'email', 'topic', 'order', 'message'] as const;
type Problems = Partial<Record<(typeof FIELDS)[number], string>>;

/** What's wrong with the message, by field, in the order of the form, or {} when it can be sent. */
export function contactProblems(m: ContactMessage): Problems {
  const out: Problems = {};
  if (!m.name.trim()) out.name = 'Enter your name.';
  if (!m.email.trim()) out.email = 'Enter your email address, so we can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) out.email = 'Enter an email address like name@example.com.';
  if (!m.topic) out.topic = 'Choose what it’s about.';
  if (m.topic === 'order' && m.order.trim() && !/^[A-Z]-?\d{4,}$/i.test(m.order.trim())) out.order = 'Enter the order number as it is on your receipt, like A-10432.';
  if (m.message.trim().length < 10) out.message = m.message.trim() ? 'Tell us a little more: at least 10 characters.' : 'Enter your message.';
  else if (m.message.length > LIMIT) out.message = `Shorten your message to ${LIMIT} characters.`;
  return out;
}

/** The contact page: a skip link, a header, then main with the h1 and the form, or the answer once sent. */
export function ContactForm({ onSend, replyTime = 'within 2 working days', online }: ContactFormProps) {
  const [m, setM] = React.useState<ContactMessage>(blank);
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [sent, setSent] = React.useState<{ reference: string; email: string } | null>(null);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const edit = (patch: Partial<ContactMessage>) => { setM((now) => ({ ...now, ...patch })); setFailed(false); };
  const errors: ErrorSummaryItem[] = FIELDS.filter((f) => problems[f]).map((f) => ({ field: `contact-${f}`, message: problems[f] }));

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = contactProblems(m);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    const out: ContactMessage = { ...m, name: m.name.trim(), email: m.email.trim(), order: m.topic === 'order' ? m.order.trim().toUpperCase() : '', message: m.message.trim() };
    setBusy(true);
    void Promise.resolve().then(() => onSend?.(out)).then((ref) => setSent({ reference: typeof ref === 'string' ? ref : '', email: out.email }), () => setFailed(true))
      .finally(() => setBusy(false));
  };
  React.useEffect(() => { if (sent) answer.current?.focus(); }, [sent]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#help">Help center</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-2xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">Your message stays here. Sending it needs a connection.</OfflineBanner>
        <PageHeader title="Contact us" description={`We read every message and reply ${replyTime}. All fields are needed unless they say they’re optional.`} />
        <div className="pt-6">
          {sent ? (
            <section aria-labelledby="sent" className="flex flex-col items-start gap-3">
              <h2 id="sent" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Message sent</h2>
              <p className="m-0">We’ll reply to {sent.email} {replyTime}.{m.copy ? ' A copy of your message is on its way there too.' : ''}</p>
              {sent.reference ? <p className="m-0">Your reference is <strong>{sent.reference}</strong>. Give it if you write again about this.</p> : null}
              <Link href="#help">Back to the help center</Link>
            </section>
          ) : (
            <form onSubmit={send} noValidate aria-label="Contact us" className="flex flex-col gap-4">
              <ErrorSummary key={tries} errors={errors} />
              <Field label="Name" id="contact-name" error={problems.name} required>
                <Input autoComplete="name" value={m.name} onChange={(e) => edit({ name: e.target.value })} />
              </Field>
              <Field label="Email" id="contact-email" hint="We only use it to reply." error={problems.email} required>
                <Input type="email" autoComplete="email" value={m.email} onChange={(e) => edit({ email: e.target.value })} />
              </Field>
              <Field label="What’s it about?" id="contact-topic" error={problems.topic} required>
                <Select placeholder="Choose a topic" options={TOPICS} value={m.topic} onChange={(e) => edit({ topic: e.target.value })} />
              </Field>
              {m.topic === 'order' ? (
                <Field label="Order number" id="contact-order" hint="On your receipt and order email, like A-10432." error={problems.order} optional>
                  <Input autoComplete="off" spellCheck={false} value={m.order} onChange={(e) => edit({ order: e.target.value })} className="max-w-48" />
                </Field>
              ) : null}
              <Field label="Message" id="contact-message" hint={`Up to ${LIMIT} characters.`} error={problems.message} required>
                <Textarea rows={6} maxLength={LIMIT} showCount value={m.message} onChange={(e) => edit({ message: e.target.value })} />
              </Field>
              <Checkbox checked={m.copy} onCheckedChange={(on) => edit({ copy: on })}>Send me a copy</Checkbox>
              <div className="flex flex-col items-start gap-3">
                {failed ? <Alert tone="danger">Couldn’t send your message. Try again; everything you wrote is still here.</Alert> : null}
                <Button type="submit" loading={busy}>Send message</Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

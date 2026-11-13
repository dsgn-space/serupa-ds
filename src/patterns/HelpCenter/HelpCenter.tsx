'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Card, CardHeader } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Field } from '../../components/Field/Field';
import { Select } from '../../components/Select/Select';
import { Textarea } from '../../components/Textarea/Textarea';
import { Alert } from '../../components/Alert/Alert';
import { Faq, type FaqGroup } from '../../blocks/Faq/Faq';

/* Help center: the topics people come for, the common questions with a search, and a way to write to a person that
   says when they'll answer. For an app to copy. What it carries (WCAG 2.2):
   - 3.2.6: the way to reach a person is in the same place, last on the page, and every topic and the questions'
     "Still stuck?" lead to it.
   - 1.3.1, 2.4.4: each topic is a heading whose link is named by its title, with what it covers under it, and the
     whole card takes the click.
   - 4.1.3: the questions' search says how many match (the FAQ block); a sent message is said with what happens next.
   - 3.3.1, 3.3.2: the message form says what to write before it's sent, names a missing topic or message next to its
     field and moves focus to the first, and a send that fails says so and keeps every word.
   Sending the message is the app's job: onSend gets it. */

export interface HelpTopic { id: string; title: string; description: string; href: string }
export interface HelpMessage { topic: string; message: string }

export interface HelpCenterProps {
  /** The topics people come for, as links to their articles. Default: four demo topics. */
  topics?: readonly HelpTopic[] | undefined;
  /** The common questions, in groups. Default: demo questions. */
  questions?: readonly FaqGroup[] | undefined;
  /** Where replies go, shown with the form and after sending. Default: "ana@example.com". */
  email?: string | undefined;
  /** How soon a person answers, as the end of "We answer …". Default: "within one working day". */
  replyTime?: string | undefined;
  /** Send was pressed with a topic and a message. Return its promise: a rejection says it wasn't sent. */
  onSend?: ((message: HelpMessage) => unknown) | undefined;
}

const demoTopics: HelpTopic[] = [
  { id: 'start', title: 'Getting started', description: 'Set up a workspace, invite your team and make a first project.', href: '#help-start' },
  { id: 'account', title: 'Your account', description: 'Sign-in, two-step verification, and changing your email.', href: '#help-account' },
  { id: 'billing', title: 'Billing', description: 'Plans, invoices, refunds and cancelling.', href: '#help-billing' },
  { id: 'data', title: 'Your data', description: 'Exports, imports, and where your data is kept.', href: '#help-data' },
];
const demoQuestions: FaqGroup[] = [
  { id: 'q-account', title: 'Your account', questions: [
    { id: 'change-email', question: 'How do I change my email address?', answer: 'Go to Settings, then Account, and choose Change email. We send a link to the new address; the change takes effect once you open it.' },
    { id: 'two-step', question: 'How do I turn on two-step verification?', answer: 'Go to Settings, then Security, and choose Turn on. You need an authenticator app on your phone.', keywords: '2fa mfa authenticator' },
  ] },
  { id: 'q-billing', title: 'Billing', questions: [
    { id: 'cancel-plan', question: 'How do I cancel my plan?', answer: 'Go to Settings, then Billing, and choose Cancel plan. Your plan runs until the end of the period you paid for.', keywords: 'stop subscription' },
    { id: 'refund', question: 'Can I get a refund?', answer: 'Yes, within 14 days of a payment, for any reason. Write to us below and we refund it to the card you paid with.', keywords: 'money back' },
  ] },
];
const TOPICS = ['Your account', 'Billing', 'Your data', 'Something else'];

/** What's missing from a message, by field, in the order of the form. */
export function messageProblems(m: HelpMessage): { field: 'topic' | 'message'; text: string }[] {
  const found: { field: 'topic' | 'message'; text: string }[] = [];
  if (!m.topic) found.push({ field: 'topic', text: 'Choose what your message is about.' });
  if (!m.message.trim()) found.push({ field: 'message', text: 'Write what happened, or what you’re trying to do.' });
  return found;
}

/** The help page: a skip link, a header, then main with the h1, the topics, the questions and the message form. */
export function HelpCenter({ topics = demoTopics, questions = demoQuestions, email = 'ana@example.com', replyTime = 'within one working day', onSend }: HelpCenterProps) {
  const [value, setValue] = React.useState<HelpMessage>({ topic: '', message: '' });
  const [problems, setProblems] = React.useState<ReturnType<typeof messageProblems>>([]);
  const [state, setState] = React.useState<'editing' | 'sending' | 'sent' | 'failed'>('editing');
  const sentHeading = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => { if (state === 'sent') sentHeading.current?.focus(); }, [state]);
  const problem = (f: 'topic' | 'message') => problems.find((p) => p.field === f)?.text;
  const set = (patch: Partial<HelpMessage>) => {
    const next = { ...value, ...patch };
    setValue(next);
    // A problem goes as soon as it's fixed; new ones wait for Send.
    if (problems.length) setProblems(messageProblems(next).filter((p) => problems.some((q) => q.field === p.field)));
  };
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const found = messageProblems(value);
    setProblems(found);
    if (found[0]) { document.getElementById(`help-${found[0].field}`)?.focus(); return; }
    setState('sending');
    void Promise.resolve().then(() => onSend?.(value)).then(() => setState('sent'), () => setState('failed'));
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-8 outline-none">
        <div className="flex flex-col gap-2">
          <Heading level={1}>Help</Heading>
          <p className="m-0 text-text-muted">Find an answer, or <Link href="#contact">write to us</Link>. We answer {replyTime}.</p>
        </div>

        <section aria-labelledby="help-topics" className="flex flex-col gap-4">
          <Heading level={2} size="lg" id="help-topics">Topics</Heading>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
            {topics.map((t) => (
              <li key={t.id} className="flex">
                <Card href={t.href} className="w-full">
                  <CardHeader title={t.title} description={t.description} headingLevel={3} />
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <Faq groups={questions} headingLevel={2}
          contact={<p className="m-0"><Link href="#contact">Write to us</Link>. We answer {replyTime}.</p>} />

        <section id="contact" aria-labelledby="help-contact" className="flex flex-col gap-4">
          {state === 'sent' ? (
            <>
              <Heading level={2} size="lg" id="help-contact" ref={sentHeading} tabIndex={-1} className="outline-none">We got your message</Heading>
              <p className="m-0">We answer {replyTime}, by email to <strong>{email}</strong>. You don’t need to do anything else.</p>
            </>
          ) : (
            <>
              <Heading level={2} size="lg" id="help-contact">Write to us</Heading>
              <p className="m-0 text-text-muted">A person reads every message and answers {replyTime}, by email to {email}.</p>
              <form noValidate onSubmit={send} className="flex max-w-xl flex-col gap-4">
                {state === 'failed' ? <Alert tone="danger">Couldn’t send your message. Try again: your words are still here.</Alert> : null}
                <Field label="What is it about?" error={problem('topic')} required>
                  <Select id="help-topic" placeholder="Choose one" value={value.topic} options={TOPICS.map((t) => ({ value: t, label: t }))}
                    onChange={(e) => set({ topic: e.target.value })} />
                </Field>
                <Field label="Your message" hint="What happened, and what you expected. Add the page or project name if it helps." error={problem('message')} required>
                  <Textarea id="help-message" rows={5} value={value.message} onChange={(e) => set({ message: e.target.value })} />
                </Field>
                <Button type="submit" className="self-start" loading={state === 'sending'}>Send</Button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

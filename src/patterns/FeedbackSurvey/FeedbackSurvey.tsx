'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { Rating } from '../../components/Rating/Rating';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Checkbox, CheckboxGroup } from '../../components/Checkbox/Checkbox';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Feedback survey: a few questions after something happened (a visit, an order, a call): a rating, what you came to
   do, what could be better, your words, and whether we may write back. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 4.1.2: the rating is a named group of radios, one per star, each named with its number ("3 stars"), so
     it's chosen with the arrow keys and read as a choice, not a picture.
   - 3.3.2: the page says how many questions there are and which one is needed; each optional one says so.
   - 1.3.1: the choices are named groups, radios for one answer and checkboxes for several.
   - 3.3.1: a missing rating, or an email asked for and not given, is said next to its question when you send, and
     focus goes to the first; the email field shows only once you've said we may write back.
   - 1.3.5: the email field says what it's for autofill.
   - 3.3.4, 4.1.3: Send shows it's busy and thanks you only once the server says so; one that fails says so next to the
     button and keeps every answer.
   - 2.4.3, 4.1.3: once sent, the questions give way to a thank-you whose heading takes focus.
   Sending is the app's job: onSend gets the answers; reject its promise when they can't be sent. */

export interface SurveyAnswers {
  /** 1 to 5, or null when not chosen. */
  rating: number | null;
  /** What they came to do, one of the topic values, or empty. */
  reason: string;
  /** What could be better, any of the improvement values. */
  better: string[];
  comments: string;
  /** They said we may write back. */
  contact: boolean;
  /** Where to write, when contact is on. */
  email: string;
}

export interface FeedbackSurveyProps {
  /** What the survey is about, for the h1: "your visit". Default: "your visit". */
  about?: string | undefined;
  /** Sends the answers. Return its promise: a rejection keeps them and says so. */
  onSend?: ((answers: SurveyAnswers) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const REASONS = [
  { value: 'buy', label: 'To buy something' },
  { value: 'return', label: 'To return or change something' },
  { value: 'ask', label: 'To ask a question' },
  { value: 'browse', label: 'Just to look around' },
];
const BETTER = [
  { value: 'wait', label: 'Waiting time' },
  { value: 'staff', label: 'Help from staff' },
  { value: 'stock', label: 'What was in stock' },
  { value: 'price', label: 'Prices' },
];
const empty: SurveyAnswers = { rating: null, reason: '', better: [], comments: '', contact: false, email: '' };

/** What's missing from the answers, by question, or {} when they can be sent. */
export function surveyProblems(a: SurveyAnswers): Partial<Record<'rating' | 'email', string>> {
  const out: Partial<Record<'rating' | 'email', string>> = {};
  if (!a.rating) out.rating = 'Choose a rating from 1 to 5 stars.';
  if (a.contact) {
    if (!a.email.trim()) out.email = 'Enter your email address, or untick “You may write back to me”.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) out.email = 'Enter an email address like name@example.com.';
  }
  return out;
}

/** The survey page: a skip link, a header, then main with the h1 and the questions, or the thanks. */
export function FeedbackSurvey({ about = 'your visit', onSend, online }: FeedbackSurveyProps) {
  const [answers, setAnswers] = React.useState<SurveyAnswers>(empty);
  const [problems, setProblems] = React.useState<ReturnType<typeof surveyProblems>>({});
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const rating = React.useRef<HTMLDivElement>(null);
  const thanks = React.useRef<HTMLHeadingElement>(null);
  const edit = (patch: Partial<SurveyAnswers>) => { setAnswers((now) => ({ ...now, ...patch })); setFailed(false); };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = surveyProblems(answers);
    setProblems(found);
    if (found.rating) { rating.current?.querySelector<HTMLInputElement>('input')?.focus(); return; }
    if (found.email) { document.getElementById('survey-email')?.focus(); return; }
    const out: SurveyAnswers = { ...answers, comments: answers.comments.trim(), email: answers.contact ? answers.email.trim() : '' };
    setBusy(true);
    void Promise.resolve().then(() => onSend?.(out)).then(() => setSent(true), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (sent) thanks.current?.focus(); }, [sent]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <Container as="main" size="prose" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your answers stay here. Sending them needs a connection.</OfflineBanner>
          <PageHeader title={`How was ${about}?`} description="Four questions. Only the first is needed, and it takes a few seconds." />
          <div className="pt-6">
            {sent ? (
              <section aria-labelledby="thanks" className="flex flex-col items-start gap-3">
                <h2 id="thanks" ref={thanks} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Thank you</h2>
                <p className="m-0">We read every answer. {answers.contact ? 'If we write back, it’ll be to the address you gave.' : 'You won’t hear from us about this.'}</p>
              </section>
            ) : (
              <form onSubmit={send} noValidate aria-label="Survey" className="flex flex-col gap-6">
                <p className="m-0 text-text-muted">Fields marked * are required.</p>
                <Field label="How would you rate it?" error={problems.rating} required>
                  <Rating ref={rating} value={answers.rating} onValueChange={(v) => { edit({ rating: v }); setProblems((p) => ({ ...p, rating: undefined })); }} invalid={!!problems.rating} size="lg" />
                </Field>
                <Field label="What did you come to do?" optional group>
                  <RadioGroup name="survey-reason" value={answers.reason || null} onValueChange={(v: string) => edit({ reason: v })}>
                    {REASONS.map((r) => <Radio key={r.value} value={r.value}>{r.label}</Radio>)}
                  </RadioGroup>
                </Field>
                <Field label="What could be better?" hint="Choose any." optional group>
                  <CheckboxGroup name="survey-better" value={answers.better} onValueChange={(v: string[]) => edit({ better: v })}>
                    {BETTER.map((b) => <Checkbox key={b.value} value={b.value}>{b.label}</Checkbox>)}
                  </CheckboxGroup>
                </Field>
                <Field label="Anything else?" optional>
                  <Textarea rows={4} value={answers.comments} onChange={(e) => edit({ comments: e.target.value })} />
                </Field>
                <Checkbox checked={answers.contact} onCheckedChange={(on) => { edit({ contact: on }); if (!on) setProblems((p) => ({ ...p, email: undefined })); }}
                  description="Only about what you wrote here.">You may write back to me</Checkbox>
                {answers.contact ? (
                  <Field label="Email" id="survey-email" error={problems.email} required>
                    <Input type="email" autoComplete="email" value={answers.email} onChange={(e) => edit({ email: e.target.value })} />
                  </Field>
                ) : null}
                <div className="flex flex-col items-start gap-3">
                  {failed ? <Alert tone="danger">Couldn’t send your answers. Try again; they’re all still here.</Alert> : null}
                  <Button type="submit" loading={busy}>Send</Button>
                </div>
              </form>
            )}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

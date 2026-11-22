'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Link } from '../../components/Link/Link';
import { Card } from '../../components/Card/Card';
import { Loader } from '../../components/Loader/Loader';
import { Field } from '../../components/Field/Field';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { CheckboxGroup, Checkbox } from '../../components/Checkbox/Checkbox';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Quiz: a few questions to check what was learned, all on one page, then the score and, for each question, whether
   it was right and why. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 3.3.2: each question is a fieldset whose legend is the question; one with more than one answer says
     "Choose all that apply" in its legend, and uses checkboxes, not radios.
   - 4.1.3: how many are answered is said in a status line as answers are chosen.
   - 3.3.1, 2.4.3: checking with questions left shows a summary at the top that takes focus, each a link to its
     question's first answer.
   - 2.4.3, 1.4.1: once checked, the score's heading takes focus; each question says "Right" or "Not quite" in words,
     with the right answer and why, not by color alone. The answers can't be changed until Try again.
   - 2.2.1: there's no time limit.
   Saving the score is the app's job: onCheck gets the answers and the score. */

export interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
  /** The right answers: one for a radio question, more for "Choose all that apply". */
  answer: string[];
  /** Why that's the answer, shown once checked. */
  why: string;
}

export type QuizAnswers = Record<string, string[]>;

export interface QuizProps {
  /** The lesson's name, for the h1. Default: a demo lesson. */
  title?: string | undefined;
  /** The questions. Default: demo questions on accessible forms. */
  questions?: QuizQuestion[] | undefined;
  /** How many right to pass. Default: 4 of 5, or 80% of the questions rounded up. */
  pass?: number | undefined;
  /** Told the answers and the score once checked. */
  onCheck?: ((answers: QuizAnswers, score: number) => void) | undefined;
  /** Still loading: a placeholder shows instead of the questions. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load the quiz" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: QuizQuestion[] = [
  { id: 'q1', question: 'What should every form field have?', options: [{ value: 'label', label: 'A visible label' }, { value: 'placeholder', label: 'Placeholder text' }, { value: 'icon', label: 'An icon' }],
    answer: ['label'], why: 'A placeholder goes as soon as you type, and an icon can be read many ways. A label stays.' },
  { id: 'q2', question: 'Where should an error message be?', options: [{ value: 'field', label: 'Next to its field, and in a summary at the top' }, { value: 'toast', label: 'In a toast that disappears' }, { value: 'color', label: 'Only as a red border' }],
    answer: ['field'], why: 'Next to the field says what to fix where you fix it; the summary lets you find every problem at once.' },
  { id: 'q3', question: 'Which of these help people fill a form in faster?', options: [{ value: 'autocomplete', label: 'autocomplete on name, email and address fields' }, { value: 'types', label: 'The right input type, like email or tel' }, { value: 'captcha', label: 'A puzzle to prove you’re human' }],
    answer: ['autocomplete', 'types'], why: 'Autofill and the right keyboard save typing. A puzzle slows everyone down, and some can’t solve it at all.' },
  { id: 'q4', question: 'After a form is sent, where should focus go?', options: [{ value: 'answer', label: 'To the heading of what happened' }, { value: 'top', label: 'Back to the top of the page' }, { value: 'stay', label: 'Nowhere: leave it on the button' }],
    answer: ['answer'], why: 'The heading says what happened, and a screen reader reads it at once.' },
  { id: 'q5', question: 'How should a form mark which fields people must fill?', options: [{ value: 'both', label: 'A star on required fields and “(optional)” on the rest' }, { value: 'optional', label: 'Only “(optional)” on the optional ones' }, { value: 'star', label: 'Only a star on the required ones' }],
    answer: ['both'], why: 'People skip the note that explains a convention, so each field should say what it is. A sign-in form needs neither.' },
];

/** How many questions are answered right: every right option chosen and no other. */
export function scoreQuiz(questions: readonly QuizQuestion[], answers: QuizAnswers): number {
  return questions.filter((q) => {
    const a = answers[q.id] ?? [];
    return a.length === q.answer.length && q.answer.every((v) => a.includes(v));
  }).length;
}

/** The quiz page: a skip link, a header, then main with the h1, the questions, and the score once checked. */
export function Quiz({ title = 'Accessible forms: check what you learned', questions = demo, pass = Math.ceil(questions.length * 0.8), onCheck, loading = false, loadFailed = false, onRetry, online }: QuizProps) {
  const locale = useLocale();
  const [answers, setAnswers] = React.useState<QuizAnswers>({});
  const [missing, setMissing] = React.useState<string[]>([]);
  const [tries, setTries] = React.useState(0);
  const [score, setScore] = React.useState<number | null>(null);
  const result = React.useRef<HTMLHeadingElement>(null);
  const top = React.useRef<HTMLFormElement>(null);
  const answered = questions.filter((q) => answers[q.id]?.length).length;
  const n = (x: number) => formatNumber(x, locale);
  const choose = (id: string, v: string[]) => { setAnswers((a) => ({ ...a, [id]: v })); setMissing((m) => m.filter((x) => x !== id)); };
  const errors: ErrorSummaryItem[] = missing.map((id) => ({ field: `quiz-${id}`, message: `Answer question ${n(questions.findIndex((q) => q.id === id) + 1)}.` }));

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const left = questions.filter((q) => !answers[q.id]?.length).map((q) => q.id);
    setMissing(left);
    setTries((t) => t + 1);
    if (left.length) return;
    const s = scoreQuiz(questions, answers);
    setScore(s);
    onCheck?.(answers, s);
  };
  const again = () => { setAnswers({}); setScore(null); setMissing([]); requestAnimationFrame(() => top.current?.querySelector<HTMLInputElement>('input')?.focus()); };
  React.useEffect(() => { if (score !== null) result.current?.focus(); }, [score]);
  const checked = score !== null;

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme learning</p>
        <Link underline="hover" href="#course">Back to the course</Link>
      </header>
      <Container as="main" size="prose" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your answers stay here. Checking them needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Accessible forms', href: '#course' }, { label: 'Quiz' }]} title={title}
            description={loading || loadFailed ? undefined : `${n(questions.length)} questions, no time limit. Get ${n(pass)} right to pass; you can try as many times as you like. Questions marked * need an answer.`} />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the quiz" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading the quiz" /></Card> : (
          <div className="flex flex-col gap-6 pt-6">
            {checked ? (
              <section aria-labelledby="quiz-score" className="flex flex-col items-start gap-3">
                <h2 id="quiz-score" ref={result} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">
                  {score >= pass ? 'You passed' : 'Not passed yet'}: {n(score)} of {n(questions.length)} right
                </h2>
                <p className="m-0">{score >= pass ? 'The next lesson is open.' : `Get ${n(pass)} right to pass. Each question below says why its answer is right.`}</p>
                <div className="flex flex-wrap gap-2">
                  {score >= pass ? <Link href="#next">Go to the next lesson</Link> : null}
                  <Button variant={score >= pass ? 'secondary' : 'primary'} onClick={again}>Try again</Button>
                </div>
              </section>
            ) : (
              <p id="quiz-progress" role="status" className="m-0 text-sm text-text-muted">{n(answered)} of {n(questions.length)} answered</p>
            )}
            <form ref={top} onSubmit={check} noValidate aria-label="Quiz" className="flex flex-col gap-6">
              <ErrorSummary key={tries} errors={errors} />
              <ol className="m-0 flex list-none flex-col gap-6 p-0">
                {questions.map((q, i) => {
                  const many = q.answer.length > 1;
                  const mine = answers[q.id] ?? [];
                  const right = checked && scoreQuiz([q], answers) === 1;
                  const label = `${n(i + 1)}. ${q.question}${many ? ' Choose all that apply.' : ''}`;
                  const error = missing.includes(q.id) ? 'Choose an answer.' : undefined;
                  return (
                    <li key={q.id} className="flex flex-col gap-3">
                      <Field label={label} error={error} group required disabled={checked}>
                        {many ? (
                          <CheckboxGroup id={`quiz-${q.id}`} value={mine} onValueChange={(v: string[]) => choose(q.id, v)}>
                            {q.options.map((o) => <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>)}
                          </CheckboxGroup>
                        ) : (
                          <RadioGroup id={`quiz-${q.id}`} name={`quiz-${q.id}`} value={mine[0] ?? ''} onValueChange={(v: string) => choose(q.id, [v])}>
                            {q.options.map((o) => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
                          </RadioGroup>
                        )}
                      </Field>
                      {checked ? (
                        <Alert tone={right ? 'success' : 'warning'} title={right ? 'Right' : 'Not quite'}>
                          {right ? '' : `The answer: ${q.options.filter((o) => q.answer.includes(o.value)).map((o) => o.label).join(', and ')}. `}{q.why}
                        </Alert>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
              {checked ? null : <Button type="submit" className="self-start">Check answers</Button>}
            </form>
          </div>
          )}
        </Stack>
      </Container>
    </div>
  );
}

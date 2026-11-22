'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Link } from '../../components/Link/Link';
import { Card } from '../../components/Card/Card';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Job application: what the job is, then one short form to apply, and what happens next. For an app to copy. What it
   carries (WCAG 2.2):
   - 1.3.1: what the job is (team, place, hours, pay) is a list of named facts above the form, so it's read before
     applying.
   - 3.3.2, 1.3.5: each field says what it's for, which are optional, and its format; name, email and phone say what
     they are for autofill. The CV says the file types and size it takes.
   - 3.3.1, 2.4.3: applying with problems shows a summary at the top that takes focus, each problem a link to its
     field (the CV's link lands on its Choose button, the question's on its first answer), and each field says its own.
   - 3.3.4, 4.1.3: Apply shows it's busy; an application that can't be sent says so next to the button and keeps
     every field and the file.
   - 2.4.3: once sent, the form gives way to an answer whose heading takes focus, with what happens next, in order.
   Sending is the app's job: onApply gets the application; reject when it can't be sent. */

export interface JobApplicationAnswers {
  name: string;
  email: string;
  phone: string;
  /** The CV, one file. */
  cv: File | null;
  /** Why this job, optional. */
  letter: string;
  /** "yes" or "no": can work where the job is. */
  rightToWork: string;
  /** Agreed to how the application is kept. */
  consent: boolean;
}

export interface JobPosting {
  title: string;
  team: string;
  place: string;
  hours: string;
  pay: string;
}

export interface JobApplicationProps {
  /** The job. Default: a demo job. */
  job?: JobPosting | undefined;
  /** Sends the application. Reject when it can't be sent. */
  onApply?: ((answers: JobApplicationAnswers) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoJob: JobPosting = { title: 'Product designer', team: 'Payments', place: 'Jakarta or remote in UTC+7 to UTC+9', hours: 'Full time', pay: '$48,000 to $62,000 a year' };
const MB = 1024 * 1024;
const LETTER = 2000;
const FIELDS = ['name', 'email', 'phone', 'cv', 'letter', 'rightToWork', 'consent'] as const;
type Problems = Partial<Record<(typeof FIELDS)[number], string>>;
const blank: JobApplicationAnswers = { name: '', email: '', phone: '', cv: null, letter: '', rightToWork: '', consent: false };

/** What's wrong with the application, by field, in the order of the form, or {} when it can be sent. */
export function applicationProblems(a: JobApplicationAnswers): Problems {
  const out: Problems = {};
  if (!a.name.trim()) out.name = 'Enter your full name.';
  if (!a.email.trim()) out.email = 'Enter your email address, so we can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) out.email = 'Enter an email address like name@example.com.';
  if (a.phone.trim() && a.phone.replace(/\D/g, '').length < 7) out.phone = 'Enter a phone number with its area code, like +62 21 555 0142.';
  if (!a.cv) out.cv = 'Choose your CV.';
  if (a.letter.length > LETTER) out.letter = `Shorten this to ${LETTER} characters.`;
  if (!a.rightToWork) out.rightToWork = 'Say whether you can work where the job is.';
  if (!a.consent) out.consent = 'Agree to how we keep your application, so we can read it.';
  return out;
}

/** The job's page: a skip link, a header, then main with the h1, what the job is, and the form, or the answer once sent. */
export function JobApplication({ job = demoJob, onApply, online }: JobApplicationProps) {
  const [a, setA] = React.useState<JobApplicationAnswers>(blank);
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const edit = (patch: Partial<JobApplicationAnswers>) => { setA((now) => ({ ...now, ...patch })); setFailed(false); };
  const errors: ErrorSummaryItem[] = FIELDS.filter((f) => problems[f]).map((f) => ({ field: `job-${f}`, message: problems[f] }));

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = applicationProblems(a);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    const out = { ...a, name: a.name.trim(), email: a.email.trim(), phone: a.phone.trim(), letter: a.letter.trim() };
    setBusy(true);
    void Promise.resolve().then(() => onApply?.(out)).then(() => setSent(true), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (sent) answer.current?.focus(); }, [sent]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme careers</p>
        <Link underline="hover" href="#jobs">All jobs</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-2xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">Your answers stay here. Sending the application needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Jobs', href: '#jobs' }, { label: job.title }]} title={job.title}
          description="Applying takes about 5 minutes. All fields are needed unless they say they’re optional." />
        <div className="flex flex-col gap-8 pt-6">
          <Card>
            <section aria-labelledby="about-job" className="flex flex-col gap-4">
              <h2 id="about-job" className="m-0 text-lg font-semibold">About the job</h2>
              <DescriptionList>
                <DescriptionItem term="Team">{job.team}</DescriptionItem>
                <DescriptionItem term="Where">{job.place}</DescriptionItem>
                <DescriptionItem term="Hours">{job.hours}</DescriptionItem>
                <DescriptionItem term="Pay">{job.pay}</DescriptionItem>
              </DescriptionList>
            </section>
          </Card>
          {sent ? (
            <section aria-labelledby="applied" className="flex flex-col items-start gap-3">
              <h2 id="applied" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">Application sent</h2>
              <p className="m-0">Thank you, {a.name.trim()}. We’ve sent a copy to {a.email.trim()}. What happens next:</p>
              <ol className="m-0 flex flex-col gap-1 ps-6">
                <li>Someone from the {job.team} team reads it within 10 working days.</li>
                <li>If it’s a match, we email you to book a 30-minute call.</li>
                <li>If it isn’t, we email you too, so you’re never left waiting.</li>
              </ol>
              <Link href="#jobs">See other jobs</Link>
            </section>
          ) : (
            <form onSubmit={apply} noValidate aria-labelledby="apply" className="flex flex-col gap-4">
              <h2 id="apply" className="m-0 text-lg font-semibold">Apply</h2>
              <ErrorSummary key={tries} errors={errors} />
              <Field label="Full name" id="job-name" error={problems.name} required>
                <Input autoComplete="name" value={a.name} onChange={(e) => edit({ name: e.target.value })} />
              </Field>
              <Field label="Email" id="job-email" error={problems.email} required>
                <Input type="email" autoComplete="email" spellCheck={false} value={a.email} onChange={(e) => edit({ email: e.target.value })} />
              </Field>
              <Field label="Phone" id="job-phone" hint="Only to book a call, if email doesn’t reach you." error={problems.phone} optional>
                <Input type="tel" autoComplete="tel" value={a.phone} onChange={(e) => edit({ phone: e.target.value })} className="max-w-64" />
              </Field>
              <Field label="CV" error={problems.cv} required>
                <FileUpload id="job-cv" accept=".pdf,.doc,.docx,application/pdf" maxSize={5 * MB} hint="PDF or Word, up to 5 MB"
                  files={a.cv ? [a.cv] : []} onFilesChange={(f) => edit({ cv: f.at(-1) ?? null })} />
              </Field>
              <Field label="Why this job?" id="job-letter" hint={`A few lines are plenty. Up to ${LETTER} characters.`} error={problems.letter} optional>
                <Textarea rows={5} maxLength={LETTER} showCount value={a.letter} onChange={(e) => edit({ letter: e.target.value })} />
              </Field>
              <Field label="Are you allowed to work where the job is?" hint={job.place} error={problems.rightToWork} group required>
                <RadioGroup id="job-rightToWork" name="job-right-to-work" value={a.rightToWork} onValueChange={(v: string) => edit({ rightToWork: v })}>
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no" description="We can sometimes help with a visa: say so in “Why this job?”.">Not yet</Radio>
                </RadioGroup>
              </Field>
              <Field error={problems.consent}>
                <Checkbox id="job-consent" checked={a.consent} onCheckedChange={(on) => edit({ consent: on })} invalid={!!problems.consent}>
                  Keep my application for 6 months, as the <Link href="#privacy">privacy notice</Link> says
                </Checkbox>
              </Field>
              <div className="flex flex-col items-start gap-3">
                {failed ? <Alert tone="danger">Couldn’t send your application. Try again; everything, your CV too, is still here.</Alert> : null}
                <Button type="submit" loading={busy}>Send application</Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

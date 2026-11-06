import * as React from 'react';
import { Heading } from '../../components/Heading/Heading';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { PasswordInput } from '../../components/PasswordInput/PasswordInput';
import { PinInput } from '../../components/PinInput/PinInput';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { Alert } from '../../components/Alert/Alert';
import { announce } from '../../internal/announce';

/* Auth card (BL9): the sign-in card, email and password and then a one-time code, as a block an app places on its own
   page. The Sign-in pattern (src/patterns/SignIn) is this card on a page of its own. What it carries (WCAG 2.2):
   - 3.3.8 Accessible authentication: nothing to remember or work out beyond the password itself. The fields say
     autocomplete="username" and "current-password", so a password manager fills them; paste works in both; the
     password can be shown; the code field is autocomplete="one-time-code", so a phone fills a texted code; no puzzle.
   - 3.3.1 and 3.3.3: a failed try lists each problem in an ErrorSummary at the top, which takes focus, with the same
     words under each field, saying how to fix it.
   - 2.4.3 and 4.1.3: moving to the code step and to the end puts focus on the new step's heading, so a screen reader
     says where it is. "Send a new code" says on screen that the code went, in a status region a screen reader reads
     without moving focus off the button.
   - Each word is a label, English by default. The checks against a server are the app's: `check` and `verify`. */

export type AuthStep = 'password' | 'code' | 'done';

export interface AuthCardLabels {
  title: string;
  email: string;
  password: string;
  forgot: string;
  signIn: string;
  emailMissing: string;
  emailFormat: string;
  passwordMissing: string;
  /** A wrong email or password: one message, on the password, that doesn't say which was wrong. */
  wrong: string;
  codeTitle: string;
  codeSent: string;
  code: string;
  verify: string;
  codeShort: string;
  codeWrong: string;
  /** When check or verify rejects (the network, not the answer): shown under the button and said once. */
  failed: string;
  resend: string;
  resent: string;
  doneTitle: string;
  doneMessage: string;
  doneLink: string;
}

const english: AuthCardLabels = {
  title: 'Sign in',
  email: 'Email',
  password: 'Password',
  forgot: 'Forgot your password?',
  signIn: 'Sign in',
  emailMissing: 'Enter your email address',
  emailFormat: 'Enter an email address in the right format, like name@example.com',
  passwordMissing: 'Enter your password',
  wrong: 'The email or password is not right. Check them, or reset your password',
  codeTitle: 'Enter your sign-in code',
  codeSent: 'We sent a 6-digit code to the phone number on your account. It works for 10 minutes.',
  code: 'Code',
  verify: 'Verify',
  codeShort: 'Enter the 6-digit code',
  codeWrong: 'That code is not right. Check the latest message, or send a new code',
  failed: "Couldn't check that. Check your connection and try again.",
  resend: 'Send a new code',
  resent: 'We sent a new code to your phone. It works for 10 minutes.',
  doneTitle: "You're signed in",
  doneMessage: 'Welcome back. Taking you to your dashboard.',
  doneLink: 'Go to your dashboard',
};

type Check<A extends unknown[]> = (...args: A) => boolean | PromiseLike<boolean>;

export interface AuthCardProps {
  /** Your server's check of the email and password: true lets them on. */
  check: Check<[email: string, password: string]>;
  /** Your server's check of the one-time code. Without it there is no code step: a right password ends on done. */
  verify?: Check<[code: string]> | undefined;
  /** Sends a new code when "Send a new code" is pressed. */
  onResend?: (() => void) | undefined;
  /** Runs once the person is signed in, on the done step. */
  onSignedIn?: (() => void) | undefined;
  /** Where "Forgot your password?" goes. */
  forgotHref: string;
  /** Where "Go to your dashboard" goes, on the done step. Without it, the link isn't shown. */
  doneHref?: string | undefined;
  /** The start of each field's id, which the error summary's links point at. Default: one of React's own. */
  idPrefix?: string | undefined;
  /** The headings' level: 1 when the card is the page, as on a sign-in page. Default: 1. */
  headingLevel?: 1 | 2 | 3 | undefined;
  /** Which step it starts on. Default: 'password'. */
  start?: AuthStep | undefined;
  /** For docs and tests: start as after a failed try, 'empty' (nothing filled in) or 'wrong' (no such account). */
  failed?: 'empty' | 'wrong' | undefined;
  /** The email it starts with: one remembered from the last visit, say. */
  defaultEmail?: string | undefined;
  /** For docs and tests only, to show a failed try. Never prefill a real password. */
  defaultPassword?: string | undefined;
  labels?: Partial<AuthCardLabels> | undefined;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const thenable = (v: unknown): v is PromiseLike<unknown> => v != null && typeof (v as PromiseLike<unknown>).then === 'function';
/** Runs `then` with the answer: now when it's a boolean, so nothing waits a tick; when it settles when it's a promise. */
function answer(out: boolean | PromiseLike<boolean>, then: (ok: boolean) => void, busy: (on: boolean) => void, failed: () => void) {
  if (!thenable(out)) { then(out); return; }
  busy(true);
  out.then((ok) => { busy(false); then(ok); }, () => { busy(false); failed(); });
}

/** The sign-in card: email and password, then a one-time code, then signed in. */
export function AuthCard({ check, verify, onResend, onSignedIn, forgotHref, doneHref, idPrefix, headingLevel = 1, start = 'password', failed, defaultEmail = '', defaultPassword = '', labels }: AuthCardProps) {
  const l = { ...english, ...labels };
  const own = React.useId(), p = idPrefix ?? own;
  const ids = { title: `${p}-title`, email: `${p}-email`, password: `${p}-password`, code: `${p}-code` };
  const problems = (email: string, password: string): ErrorSummaryItem[] => {
    const out: ErrorSummaryItem[] = [];
    if (!email.trim()) out.push({ field: ids.email, message: l.emailMissing });
    else if (!EMAIL.test(email.trim())) out.push({ field: ids.email, message: l.emailFormat });
    if (!password) out.push({ field: ids.password, message: l.passwordMissing });
    return out;
  };
  const wrong: ErrorSummaryItem[] = [{ field: ids.password, message: l.wrong }];

  const [step, setStep] = React.useState<AuthStep>(start);
  const [email, setEmail] = React.useState(defaultEmail);
  const [password, setPassword] = React.useState(defaultPassword);
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>(() => (failed === 'empty' ? problems('', '') : failed === 'wrong' ? wrong : []));
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  // A check that couldn't run: its words under the button, until the next try.
  const [failure, setFailure] = React.useState(false);
  // Each failed try remounts the error summary, so it takes focus and is read again even when its errors are the
  // same as last time (a second wrong password).
  const [tries, setTries] = React.useState(0);
  const fail = () => { setFailure(true); announce(l.failed); };
  // How many times a new code was asked for. Each ask puts a new line in the status region below, so it is said every time.
  const [sent, setSent] = React.useState(0);
  // A new step puts focus on its heading (tabIndex -1), so the change is said and the next Tab goes on from there.
  const heading = React.useRef<HTMLHeadingElement | null>(null);
  const moved = React.useRef(false);
  React.useEffect(() => { if (moved.current && heading.current) heading.current.focus(); }, [step]);
  const go = (next: AuthStep) => { moved.current = true; setStep(next); if (next === 'done') onSignedIn?.(); };

  const fieldError = (id: string) => errors.find((e) => e.field === id)?.message;
  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFailure(false);
    const found = problems(email, password);
    if (found.length) { setErrors(found); setTries((n) => n + 1); return; }
    setErrors([]);
    answer(check(email.trim(), password), (ok) => {
      if (!ok) { setErrors(wrong); setTries((n) => n + 1); return; }
      go(verify ? 'code' : 'done');
    }, setBusy, fail);
  };
  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !verify) return;
    setFailure(false);
    if (code.length < 6) { setCodeError(l.codeShort); return; }
    setCodeError(null);
    answer(verify(code), (ok) => {
      if (!ok) { setCodeError(l.codeWrong); return; }
      go('done');
    }, setBusy, fail);
  };
  const title = (text: string) => <Heading level={headingLevel} id={ids.title} ref={heading} tabIndex={-1} className="outline-none">{text}</Heading>;
  const card = 'flex flex-col gap-6 rounded-lg border border-border bg-surface p-6';

  return step === 'password' ? (
    <section aria-labelledby={ids.title} className={card}>
      {title(l.title)}
      {errors.length ? <ErrorSummary key={tries} errors={errors} headingLevel={(headingLevel + 1) as 2 | 3 | 4} /> : null}
      <form noValidate onSubmit={signIn} className="flex flex-col gap-4" aria-labelledby={ids.title}>
        <Field label={l.email} error={fieldError(ids.email)}>
          <Input id={ids.email} name="email" type="email" autoComplete="username" spellCheck={false} autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={l.password} error={fieldError(ids.password)}>
          <PasswordInput id={ids.password} name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Link href={forgotHref} className="self-start text-sm">{l.forgot}</Link>
        <Button type="submit" loading={busy}>{l.signIn}</Button>
        {failure ? <p className="m-0 text-sm text-danger-text">{l.failed}</p> : null}
      </form>
    </section>
  ) : step === 'code' ? (
    <section aria-labelledby={ids.title} className={card}>
      {title(l.codeTitle)}
      <p className="m-0 text-sm text-text-muted">{l.codeSent}</p>
      <form noValidate onSubmit={confirm} className="flex flex-col gap-4" aria-labelledby={ids.title}>
        <Field label={l.code} error={codeError}>
          <PinInput id={ids.code} name="code" length={6} value={code} onValueChange={setCode} />
        </Field>
        <Button type="submit" loading={busy}>{l.verify}</Button>
        {failure ? <p className="m-0 text-sm text-danger-text">{l.failed}</p> : null}
        <div className="flex flex-col">
          <Button type="button" variant="ghost" onClick={() => { setCode(''); setCodeError(null); setSent((n) => n + 1); onResend?.(); }}>{l.resend}</Button>
          {/* Always there, so a reader is listening before the first ask; a new keyed line is added for each ask.
              Empty, it takes no room, so the step looks the same until a code is asked for. */}
          <div role="status" className="text-sm text-text-muted">
            {sent ? <p key={sent} className="m-0 mt-2">{l.resent}</p> : null}
          </div>
        </div>
      </form>
    </section>
  ) : (
    <section aria-labelledby={ids.title} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      {title(l.doneTitle)}
      <Alert tone="success">{l.doneMessage}</Alert>
      {doneHref ? <Link href={doneHref} className="self-start">{l.doneLink}</Link> : null}
    </section>
  );
}

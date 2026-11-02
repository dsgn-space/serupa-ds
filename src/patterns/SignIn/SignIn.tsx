import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { PasswordInput } from '../../components/PasswordInput/PasswordInput';
import { PinInput } from '../../components/PinInput/PinInput';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { Alert } from '../../components/Alert/Alert';

/* Sign-in (PT1): email and password, then a one-time code, built from the components only, for an app to copy.
   What it carries (WCAG 2.2):
   - 3.3.8 Accessible authentication: nothing to remember or work out beyond the password itself. The fields say
     autocomplete="username" and "current-password", so a password manager fills them; paste works in both; the
     password can be shown; the code field is autocomplete="one-time-code", so a phone fills a texted code; no puzzle.
   - 3.3.1 and 3.3.3: a failed try lists each problem in an ErrorSummary at the top, which takes focus, with the same
     words under each field, saying how to fix it.
   - 2.4.3 and 4.1.3: moving to the code step and to the end puts focus on the new step's heading, so a screen reader
     says where it is. "Send a new code" says on screen that the code went, in a status region a screen reader reads
     without moving focus off the button.
   The checks against a server are the app's job: here `check` and `verify` stand in for it. */

export type SignInStep = 'password' | 'code' | 'done';
export interface SignInProps {
  /** Which step it starts on. Default: 'password'. */
  start?: SignInStep;
  /** Starts as after a failed try: 'empty' (sent with nothing filled in) or 'wrong' (an unknown email or password). */
  failed?: 'empty' | 'wrong';
  /** The app's check of the email and password. Default: the demo account (ada@example.com, "correct horse"). */
  check?: (email: string, password: string) => boolean;
  /** The app's check of the one-time code. Default: "123456". */
  verify?: (code: string) => boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const demoCheck = (email: string, password: string) => email === 'ada@example.com' && password === 'correct horse';
const demoVerify = (code: string) => code === '123456';

function problems(email: string, password: string): ErrorSummaryItem[] {
  const out: ErrorSummaryItem[] = [];
  if (!email.trim()) out.push({ field: 'sign-in-email', message: 'Enter your email address' });
  else if (!EMAIL.test(email.trim())) out.push({ field: 'sign-in-email', message: 'Enter an email address in the right format, like name@example.com' });
  if (!password) out.push({ field: 'sign-in-password', message: 'Enter your password' });
  return out;
}
const WRONG: ErrorSummaryItem[] = [{ field: 'sign-in-password', message: 'The email or password is not right. Check them, or reset your password' }];

/** The sign-in page: a skip link, then main with the step's form. */
export function SignIn({ start = 'password', failed, check = demoCheck, verify = demoVerify }: SignInProps) {
  const [step, setStep] = React.useState<SignInStep>(start);
  const [email, setEmail] = React.useState(failed === 'wrong' ? 'ada@example.com' : '');
  const [password, setPassword] = React.useState(failed === 'wrong' ? 'correct hose' : '');
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>(failed === 'empty' ? problems('', '') : failed === 'wrong' ? WRONG : []);
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState<string | null>(null);
  // How many times a new code was asked for. Each ask puts a new line in the status region below, so it is said every time.
  const [sent, setSent] = React.useState(0);
  // A new step puts focus on its heading (tabIndex -1), so the change is said and the next Tab goes on from there.
  const heading = React.useRef<HTMLHeadingElement | null>(null);
  const moved = React.useRef(false);
  React.useEffect(() => { if (moved.current && heading.current) heading.current.focus(); }, [step]);
  const go = (next: SignInStep) => { moved.current = true; setStep(next); };

  const fieldError = (id: string) => errors.find((e) => e.field === id)?.message;
  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    const found = problems(email, password);
    if (found.length) { setErrors(found); return; }
    if (!check(email.trim(), password)) { setErrors(WRONG); return; }
    setErrors([]);
    go('code');
  };
  const confirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length < 6) { setCodeError('Enter the 6-digit code'); return; }
    if (!verify(code)) { setCodeError('That code is not right. Check the latest message, or send a new code'); return; }
    setCodeError(null);
    go('done');
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <main id="main" className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-12 outline-none">
        <p className="text-base font-semibold">Acme</p>
        {step === 'password' ? (
          <section aria-labelledby="sign-in-title" className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-6">
            <Heading level={1} id="sign-in-title" ref={heading} tabIndex={-1} className="outline-none">Sign in to Acme</Heading>
            {errors.length ? <ErrorSummary errors={errors} /> : null}
            <form noValidate onSubmit={signIn} className="flex flex-col gap-4" aria-labelledby="sign-in-title">
              <Field label="Email" error={fieldError('sign-in-email')}>
                <Input id="sign-in-email" name="email" type="email" autoComplete="username" spellCheck={false} autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Password" error={fieldError('sign-in-password')}>
                <PasswordInput id="sign-in-password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Link href="#forgot" className="self-start text-sm">Forgot your password?</Link>
              <Button type="submit">Sign in</Button>
            </form>
          </section>
        ) : step === 'code' ? (
          <section aria-labelledby="sign-in-title" className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-6">
            <Heading level={1} id="sign-in-title" ref={heading} tabIndex={-1} className="outline-none">Enter your sign-in code</Heading>
            <p className="m-0 text-sm text-text-muted">We sent a 6-digit code to the phone number on your account. It works for 10 minutes.</p>
            <form noValidate onSubmit={confirm} className="flex flex-col gap-4" aria-labelledby="sign-in-title">
              <Field label="Code" error={codeError}>
                <PinInput id="sign-in-code" name="code" length={6} value={code} onValueChange={setCode} />
              </Field>
              <Button type="submit">Verify</Button>
              <div className="flex flex-col">
                <Button type="button" variant="ghost" onClick={() => { setCode(''); setCodeError(null); setSent((n) => n + 1); }}>Send a new code</Button>
                {/* Always there, so a reader is listening before the first ask; a new keyed line is added for each ask.
                    Empty, it takes no room, so the step looks the same until a code is asked for. */}
                <div role="status" className="text-sm text-text-muted">
                  {sent ? <p key={sent} className="m-0 mt-2">We sent a new code to your phone. It works for 10 minutes.</p> : null}
                </div>
              </div>
            </form>
          </section>
        ) : (
          <section aria-labelledby="sign-in-title" className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
            <Heading level={1} id="sign-in-title" ref={heading} tabIndex={-1} className="outline-none">You're signed in</Heading>
            <Alert tone="success">Welcome back. Taking you to your dashboard.</Alert>
            <Link href="#dashboard" className="self-start">Go to your dashboard</Link>
          </section>
        )}
      </main>
    </div>
  );
}

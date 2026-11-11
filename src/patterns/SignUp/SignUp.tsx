'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { PasswordInput } from '../../components/PasswordInput/PasswordInput';
import { PhoneInput } from '../../components/PhoneInput/PhoneInput';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { PinInput } from '../../components/PinInput/PinInput';
import { Icon } from '../../components/Icon/Icon';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { Alert } from '../../components/Alert/Alert';

/* Sign-up: name, email, an optional phone, a password whose rules are shown before typing, and the terms; then a
   code sent by email; then done. For an app to copy. What it carries (WCAG 2.2):
   - 3.3.2: the password's rules are listed under it from the start, not only after a failed try, and each says
     whether it's met in words as well as by its mark.
   - 1.3.5: each field says what it holds (name, email, tel, new-password, one-time-code), so the browser, a phone
     and a password manager can fill it, and suggest a strong password.
   - 3.3.8: pasting works everywhere, the code can be filled from the email, and there's no puzzle to solve.
   - 3.3.1, 3.3.3: Create account with problems shows an ErrorSummary that takes focus and links to each field, and
     each field says what to do.
   - 3.3.7: "Change email" on the code step goes back with every answer kept, so nothing is typed twice.
   - 2.4.3, 4.1.3: each new step puts focus on its heading, so the change is said and Tab goes on from there.
   Creating the account and sending the code are the app's job: onSubmit and verify stand in for them. */

export interface SignUpValues { name: string; email: string; phone: string; password: string; terms: boolean }
export type SignUpStep = 'form' | 'code' | 'done';

export interface SignUpProps {
  /** The step it starts on. Default: 'form'. */
  start?: SignUpStep | undefined;
  /** The answers it starts with. */
  initial?: Partial<SignUpValues> | undefined;
  /** The form passed its checks: create the account and send the code. A rejected promise stays on the form. */
  onSubmit?: ((values: SignUpValues) => unknown) | undefined;
  /** Starts as after `onSubmit` was rejected: the form, with its answers, saying the account wasn't created. */
  failed?: boolean | undefined;
  /** The app's check of the code. Default: "123456". */
  verify?: ((code: string) => boolean) | undefined;
}

const MIN = 12;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The password's rules, each met or not for this password and email. */
export function passwordRules(password: string, email: string) {
  const local = email.split('@')[0]?.toLowerCase() || '';
  return [
    { text: `At least ${MIN} characters`, met: password.length >= MIN },
    { text: 'Not your email address or its name part', met: password.length > 0 && !(local.length > 2 && password.toLowerCase().includes(local)) },
  ];
}
/** What's wrong with the answers, in the order of the fields. */
export function signUpProblems(v: SignUpValues): ErrorSummaryItem[] {
  const out: ErrorSummaryItem[] = [];
  if (!v.name.trim()) out.push({ field: 'sign-up-name', message: 'Enter your name' });
  if (!v.email.trim()) out.push({ field: 'sign-up-email', message: 'Enter your email address' });
  else if (!EMAIL.test(v.email.trim())) out.push({ field: 'sign-up-email', message: 'Enter an email address in the right format, like name@example.com' });
  if (!passwordRules(v.password, v.email).every((r) => r.met)) out.push({ field: 'sign-up-password', message: `Choose a password that meets the rules under it` });
  if (!v.terms) out.push({ field: 'sign-up-terms', message: 'Agree to the terms to create an account' });
  return out;
}

const empty: SignUpValues = { name: '', email: '', phone: '', password: '', terms: false };

/** The sign-up page: a skip link, then main with the step's form. */
export function SignUp({ start = 'form', initial, onSubmit, failed: startFailed, verify = (c) => c === '123456' }: SignUpProps) {
  const [step, setStep] = React.useState<SignUpStep>(start);
  const [v, setV] = React.useState<SignUpValues>({ ...empty, ...initial });
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [tries, setTries] = React.useState(0);
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  // onSubmit rejected (the server refused, or the network failed): say so over the button, and keep what was typed.
  const [failed, setFailed] = React.useState(!!startFailed);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const moved = React.useRef(false);
  React.useEffect(() => { if (moved.current) heading.current?.focus(); }, [step]);
  const go = (s: SignUpStep) => { moved.current = true; setStep(s); };
  const set = <K extends keyof SignUpValues>(k: K) => (value: SignUpValues[K]) => setV((o) => ({ ...o, [k]: value }));
  const error = (field: string) => errors.find((e) => e.field === field)?.message;
  const rules = passwordRules(v.password, v.email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = signUpProblems(v);
    setErrors(found);
    setTries((t) => t + 1);
    if (found.length) return;
    setBusy(true);
    setFailed(false);
    Promise.resolve().then(() => onSubmit?.(v)).then(() => go('code'), () => setFailed(true)).finally(() => setBusy(false));
  };
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) setCodeError('Enter the 6-digit code from the email');
    else if (!verify(code)) setCodeError('That code isn’t right. Check the latest email, or send a new code');
    else { setCodeError(''); go('done'); }
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 outline-none">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Card className="flex flex-col gap-5">
          {step === 'form' ? (
            <>
              <Heading level={1} size="xl" ref={heading} tabIndex={-1} className="outline-none">Create your account</Heading>
              {errors.length ? <ErrorSummary key={tries} errors={errors} headingLevel={2} /> : null}
              <form noValidate onSubmit={submit} className="flex flex-col gap-4">
                <Field label="Name" error={error('sign-up-name')}>
                  <Input id="sign-up-name" name="name" autoComplete="name" value={v.name} onChange={(e) => set('name')(e.target.value)} />
                </Field>
                <Field label="Email" hint="We’ll send a code here to check it’s yours." error={error('sign-up-email')}>
                  <Input id="sign-up-email" name="email" type="email" autoComplete="email" spellCheck={false} autoCapitalize="none" value={v.email} onChange={(e) => set('email')(e.target.value)} />
                </Field>
                <Field label="Phone" optional hint="For signing in if you lose your password.">
                  <PhoneInput id="sign-up-phone" name="phone" autoComplete="tel" defaultCountry="ID" value={v.phone} onValueChange={(p) => set('phone')(p)} />
                </Field>
                <Field label="Password" error={error('sign-up-password')}
                  hint={
                    <ul aria-label="Your password needs" className="m-0 flex list-none flex-col gap-1 p-0">
                      {rules.map((r) => (
                        <li key={r.text} className={`flex items-center gap-2 ${r.met ? 'text-text' : 'text-text-muted'}`}>
                          <Icon name={r.met ? 'check_circle' : 'radio_button_unchecked'} size="sm" />
                          <span>{r.text}<span className="sr-only">{r.met ? ', done' : ', not yet'}</span></span>
                        </li>
                      ))}
                    </ul>
                  }>
                  <PasswordInput id="sign-up-password" name="password" autoComplete="new-password" value={v.password} onChange={(e) => set('password')(e.target.value)} />
                </Field>
                <Field error={error('sign-up-terms')}>
                  <Checkbox id="sign-up-terms" name="terms" checked={v.terms} onCheckedChange={set('terms')} invalid={!!error('sign-up-terms')}>
                    I agree to the <Link href="#terms">terms</Link> and the <Link href="#privacy">privacy notice</Link>
                  </Checkbox>
                </Field>
                {failed ? <Alert tone="danger">Couldn’t create your account. Check your connection and try again.</Alert> : null}
                <Button type="submit" loading={busy}>Create account</Button>
              </form>
              <p className="m-0 text-sm">Already have an account? <Link href="#sign-in">Sign in</Link></p>
            </>
          ) : step === 'code' ? (
            <>
              <Heading level={1} size="xl" ref={heading} tabIndex={-1} className="outline-none">Check your email</Heading>
              <p className="m-0">We sent a 6-digit code to <strong>{v.email || 'your email'}</strong>. It works for 10 minutes.</p>
              <form noValidate onSubmit={check} className="flex flex-col gap-4">
                <Field label="Code" error={codeError || undefined}>
                  <PinInput id="sign-up-code" name="code" length={6} autoComplete="one-time-code" value={code} onValueChange={setCode} invalid={!!codeError} />
                </Field>
                <Button type="submit">Verify email</Button>
              </form>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" onClick={() => { setCode(''); setCodeError(''); go('form'); }}>Change email</Button>
              </div>
            </>
          ) : (
            <>
              <Heading level={1} size="xl" ref={heading} tabIndex={-1} className="outline-none">Your account is ready</Heading>
              <p className="m-0">Welcome, {v.name.trim() || 'there'}. You can change your details later in Settings.</p>
              <Link href="#dashboard">Go to your dashboard</Link>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}

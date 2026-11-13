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
import { Icon } from '../../components/Icon/Icon';
import { Alert } from '../../components/Alert/Alert';

/* Password reset: asking for a link by email, then choosing a new password from it. For an app to copy. What it
   carries (WCAG 2.2):
   - 3.3.2: each step says what happens next, and the new password's rules are listed under it from the start, each
     saying in words whether it's met.
   - 1.3.5, 3.3.8: the email field says it holds an email, and the new-password step tells the password manager
     which account it's for (a username field it can read), so it can suggest a strong one and save it; pasting works.
   - 3.3.1, 3.3.3: a missing or malformed email, or a password that breaks a rule, is said next to its field, which
     gets focus; a request or change that fails says so, keeping what was typed.
   - 3.3.7: "Use a different email" and "Send a new link" go back with the email kept, so it isn't typed twice.
   - 4.1.3: sending the link again says, in a status region, that it went or couldn't, without moving focus.
   - 2.4.3: each new step puts focus on its heading, so the change is said and Tab goes on from there.
   - The sent step says the same whether or not an account uses the email, so the page doesn't tell a stranger who
     has an account.
   Sending the link, checking it and storing the password are the app's job: onRequest and onReset stand in. */

export type PasswordResetStep = 'request' | 'sent' | 'choose' | 'expired' | 'done';

export interface PasswordResetProps {
  /** The step it starts on: 'choose' when the page opens from the email's link, 'expired' when that link is too old or used. Default: 'request'. */
  start?: PasswordResetStep | undefined;
  /** The email it starts with: for 'choose', the account the link is for. Default: "". */
  email?: string | undefined;
  /** Send the link to this email. Return its promise: a rejection stays on the step and says the link didn't go. */
  onRequest?: ((email: string) => unknown) | undefined;
  /** Store the new password. Return its promise: a rejection stays on the step and says it wasn't changed. */
  onReset?: ((password: string) => unknown) | undefined;
  /** How long a link works, as the end of "It works for …". Default: "1 hour". */
  linkLife?: string | undefined;
  /** Where "Back to sign in" and "Sign in" go. Default: "#sign-in". */
  signInHref?: string | undefined;
}

const MIN = 12;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What's wrong with the email, in words, or null when a link can be sent to it. */
export function resetEmailProblem(email: string): string | null {
  const e = email.trim();
  if (!e) return 'Enter the email address you sign in with.';
  if (!EMAIL.test(e)) return 'Enter an email address in the right format, like name@example.com.';
  return null;
}

/** The new password's rules, each met or not for this password and the account's email. */
export function resetPasswordRules(password: string, email: string) {
  const local = email.split('@')[0]?.toLowerCase() || '';
  return [
    { text: `At least ${MIN} characters`, met: password.length >= MIN },
    { text: 'Not your email address or its name part', met: password.length > 0 && !(local.length > 2 && password.toLowerCase().includes(local)) },
  ];
}

/** The password reset page: a skip link, then main with the step's card. */
export function PasswordReset({ start = 'request', email: email0 = '', onRequest, onReset, linkLife = '1 hour', signInHref = '#sign-in' }: PasswordResetProps) {
  const [step, setStep] = React.useState<PasswordResetStep>(start);
  const [email, setEmail] = React.useState(email0);
  const [emailProblem, setEmailProblem] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState('');
  const [passwordProblem, setPasswordProblem] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  // Each answer to "Send it again" is a new keyed line in the status region, so it's said every time.
  const [resent, setResent] = React.useState<{ n: number; ok: boolean }>({ n: 0, ok: true });
  const heading = React.useRef<HTMLHeadingElement>(null);
  const moved = React.useRef(false);
  React.useEffect(() => { if (moved.current) heading.current?.focus(); }, [step]);
  const go = (s: PasswordResetStep) => { moved.current = true; setFailed(false); setResent({ n: 0, ok: true }); setStep(s); };
  const rules = resetPasswordRules(password, email);
  const run = (work: () => unknown, then: () => void) => {
    setBusy(true);
    setFailed(false);
    void Promise.resolve().then(work).then(then, () => setFailed(true)).finally(() => setBusy(false));
  };

  const request = (e: React.FormEvent) => {
    e.preventDefault();
    const found = resetEmailProblem(email);
    setEmailProblem(found);
    if (found) { document.getElementById('reset-email')?.focus(); return; }
    run(() => onRequest?.(email.trim()), () => go('sent'));
  };
  const resend = () => {
    if (busy) return;
    setBusy(true);
    const done = (ok: boolean) => { setBusy(false); setResent((s) => ({ n: s.n + 1, ok })); };
    void Promise.resolve().then(() => onRequest?.(email.trim())).then(() => done(true), () => done(false));
  };
  const choose = (e: React.FormEvent) => {
    e.preventDefault();
    const found = rules.every((r) => r.met) ? null : 'Choose a password that meets the rules under it.';
    setPasswordProblem(found);
    if (found) { document.getElementById('reset-password')?.focus(); return; }
    run(() => onReset?.(password), () => go('done'));
  };
  const title = (text: string) => <Heading level={1} size="xl" ref={heading} tabIndex={-1} className="outline-none">{text}</Heading>;
  const back = <p className="m-0 text-sm"><Link href={signInHref}>Back to sign in</Link></p>;

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 outline-none">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Card className="flex flex-col gap-5">
          {step === 'request' ? (
            <>
              {title('Reset your password')}
              <p className="m-0">Enter the email you sign in with. We’ll send a link to choose a new password.</p>
              <form noValidate onSubmit={request} className="flex flex-col gap-4">
                <Field label="Email" error={emailProblem ?? undefined}>
                  <Input id="reset-email" name="email" type="email" autoComplete="email" spellCheck={false} autoCapitalize="none" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailProblem) setEmailProblem(null); }} />
                </Field>
                {failed ? <Alert tone="danger">Couldn’t send the link. Check your connection and try again.</Alert> : null}
                <Button type="submit" loading={busy}>Send the link</Button>
              </form>
              {back}
            </>
          ) : step === 'sent' ? (
            <>
              {title('Check your email')}
              <p className="m-0">If an account uses <strong className="wrap-break-word">{email.trim()}</strong>, we sent it a link to choose a new password. It works for {linkLife}.</p>
              <p className="m-0 text-sm text-text-muted">Nothing there after a few minutes? Check your spam folder, or send it again.</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" loading={busy} onClick={resend}>Send it again</Button>
                <Button variant="ghost" onClick={() => go('request')}>Use a different email</Button>
              </div>
              {/* Always there, so a reader is listening before the first ask; empty, it takes no room. */}
              <div role="status" className="text-sm text-text-muted">
                {resent.n ? <p key={resent.n} className={resent.ok ? 'm-0' : 'm-0 text-danger-text'}>{resent.ok ? `We sent a new link. It works for ${linkLife}.` : 'Couldn’t send the link. Check your connection and try again.'}</p> : null}
              </div>
              {back}
            </>
          ) : step === 'choose' ? (
            <>
              {title('Choose a new password')}
              <form noValidate onSubmit={choose} className="flex flex-col gap-4">
                {/* Tells a password manager which account the new password is for. */}
                <Field label="Account">
                  <Input id="reset-username" name="username" autoComplete="username" value={email} readOnly />
                </Field>
                <Field label="New password" error={passwordProblem ?? undefined}
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
                  <PasswordInput id="reset-password" name="new-password" autoComplete="new-password" value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordProblem) setPasswordProblem(null); }} />
                </Field>
                {failed ? <Alert tone="danger">Couldn’t change your password. Check your connection and try again.</Alert> : null}
                <Button type="submit" loading={busy}>Change password</Button>
              </form>
            </>
          ) : step === 'expired' ? (
            <>
              {title('This link has expired')}
              <p className="m-0">A link works for {linkLife}, and only once. Send a new one to choose your password.</p>
              <Button className="self-start" onClick={() => go('request')}>Send a new link</Button>
              {back}
            </>
          ) : (
            <>
              {title('Your password is changed')}
              <p className="m-0">We signed you out on your other devices. Sign in with your new password.</p>
              <Button href={signInHref} className="self-start">Sign in</Button>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}

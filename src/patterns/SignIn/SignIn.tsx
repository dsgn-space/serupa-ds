import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { AuthCard, type AuthStep } from '../../blocks/AuthCard/AuthCard';

/* Sign-in: email and password, then a one-time code, as a page of its own, for an app to copy. The card is the
   Auth card block (src/blocks/AuthCard), which says what it carries for WCAG 2.2: 3.3.8 accessible authentication,
   an ErrorSummary that takes focus (3.3.1, 3.3.3), and focus on each new step's heading (2.4.3, 4.1.3). This page
   adds the skip link, main, the product's name and the one h1 (the card's heading).
   The checks against a server are the app's job: here `check` and `verify` stand in for it. */

export type SignInStep = AuthStep;
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

const demoCheck = (email: string, password: string) => email === 'ada@example.com' && password === 'correct horse';
const demoVerify = (code: string) => code === '123456';

/** The sign-in page: a skip link, then main with the step's form. */
export function SignIn({ start = 'password', failed, check = demoCheck, verify = demoVerify }: SignInProps) {
  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <main id="main" className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-12 outline-none">
        <p className="text-base font-semibold">Acme</p>
        <AuthCard idPrefix="sign-in" start={start} failed={failed} check={check} verify={verify} forgotHref="#forgot" doneHref="#dashboard"
          defaultEmail={failed === 'wrong' ? 'ada@example.com' : ''} defaultPassword={failed === 'wrong' ? 'correct hose' : ''}
          labels={{ title: 'Sign in to Acme' }} />
      </main>
    </div>
  );
}

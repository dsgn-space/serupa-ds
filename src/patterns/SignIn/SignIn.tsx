import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Center } from '../../components/Center/Center';
import { Stack } from '../../components/Stack/Stack';
import { Logo } from '../../components/Logo/Logo';
import { AuthCard, type AuthStep } from '../../blocks/AuthCard/AuthCard';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Sign-in: email and password, then a one-time code, as a page of its own, for an app to copy. The card is the
   Auth card block (src/blocks/AuthCard), which says what it carries for WCAG 2.2: 3.3.8 accessible authentication,
   an ErrorSummary that takes focus (3.3.1, 3.3.3), and focus on each new step's heading (2.4.3, 4.1.3). This page
   adds the skip link, main, the product's name and the one h1 (the card's heading).
   The checks against a server are the app's job: here `check` and `verify` stand in for it. */

// The made-up brand's logo, drawn for light and dark backgrounds: swap in your own files.
const drawn = (w: number, body: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="32" viewBox="0 0 ${w} 32">${body}</svg>`);
const mark = (bg: string, fg: string) => `<rect width="32" height="32" rx="8" fill="${bg}"/><path d="M9 23 16 8l7 15h-4l-3-7-3 7z" fill="${fg}"/>`;
const word = (fill: string) => `<text x="42" y="23" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="${fill}">Acme</text>`;

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
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoCheck = (email: string, password: string) => email === 'ada@example.com' && password === 'correct horse';
const demoVerify = (code: string) => code === '123456';

/** The sign-in page: a skip link, then main with the step's form, in the middle of the screen (Center). */
export function SignIn({ start = 'password', failed, check = demoCheck, verify = demoVerify, online }: SignInProps) {
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <Center as="main" id="main" vertical className="outline-none">
        <Stack gap={6}>
          <OfflineBanner online={online} placement="inline">Signing in needs a connection.</OfflineBanner>
        <Logo src={drawn(104, mark('#1d4ed8', '#fff') + word('#0f172a'))} darkSrc={drawn(104, mark('#60a5fa', '#0f172a') + word('#f8fafc'))} alt="Acme" />
        <AuthCard idPrefix="sign-in" start={start} failed={failed} check={check} verify={verify} forgotHref="#forgot" doneHref="#dashboard"
          defaultEmail={failed === 'wrong' ? 'ada@example.com' : ''} defaultPassword={failed === 'wrong' ? 'correct hose' : ''}
          labels={{ title: 'Sign in to Acme' }} />
        </Stack>
      </Center>
    </div>
  );
}

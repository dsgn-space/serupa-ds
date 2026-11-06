"use client";
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';

/* Error pages (PT7): not found, offline, server error and no access, built from the components only, for an app to copy.
   What they carry (WCAG 2.2):
   - 2.4.2 Page titled: the page's <title> says what happened ("Page not found – Acme"), so it's the first thing a
     screen reader reads and what a tab or the history shows. The old title comes back when the page goes.
   - 1.3.1 and 2.4.6: the h1 says what happened; the EmptyState under it (h2) says what to do about it.
   - 3.3.1 and 3.3.3: the words say what went wrong without blame, and how to get on.
   - 2.4.1 and 2.4.5: a skip link into main, a header link to the home page, and in main each page's way back
     (home, back, try again or sign in), so no one is left at a dead end.
   - 4.1.3: the offline page says "You're back online" in a status region when the connection returns, without moving
     focus and without reloading by itself, so nothing changes until the person asks (3.2.2).
   The server error page is also the fallback an ErrorBoundary shows, with its reset as "Try again". */

export type ErrorPageKind = 'not-found' | 'offline' | 'server' | 'no-access';
export interface ErrorPageProps {
  /** What happened. */
  kind: ErrorPageKind;
  /** What "Try again" does on the offline and server pages: reload, or an ErrorBoundary's reset. Default: reload the page. */
  onRetry?: () => void;
  /** Where "Go to the home page" goes. Default: "/". */
  home?: string;
  /** For the server page: a reference to give support, so they can find what failed. */
  reference?: string;
}

const SITE = 'Acme';
const TITLES: Record<ErrorPageKind, string> = {
  'not-found': 'Page not found',
  offline: "You're offline",
  server: 'Something went wrong on our side',
  'no-access': "You don't have access to this page",
};

/** One error page: a skip link, a header link home, then main with what happened, what to do, and a way back. */
export function ErrorPage({ kind, onRetry, home = '/', reference }: ErrorPageProps) {
  const title = TITLES[kind];
  // The tab's title says what happened; the one before comes back when this page goes.
  React.useEffect(() => {
    const before = document.title;
    document.title = `${title} – ${SITE}`;
    return () => { document.title = before; };
  }, [title]);
  // Offline: say so when the connection comes back, but leave reloading to the person.
  const [online, setOnline] = React.useState(false);
  React.useEffect(() => {
    if (kind !== 'offline') return;
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [kind]);
  const retry = onRetry || (() => window.location.reload());
  const toHome = <Button href={home} variant={kind === 'offline' || kind === 'server' ? 'secondary' : 'primary'}>Go to the home page</Button>;

  const body = {
    'not-found': {
      icon: 'search_off',
      what: 'Check the address, or start again from the home page',
      why: 'The page may have moved, or the link you followed may have a typo in it.',
      actions: <>{toHome}<Button variant="secondary" onClick={() => window.history.back()}>Go back</Button></>,
    },
    offline: {
      icon: 'wifi_off',
      what: 'Check your connection, then try again',
      why: 'This page needs the internet to load. Once you are back online, try again.',
      actions: <><Button onClick={retry}>Try again</Button>{toHome}</>,
    },
    server: {
      icon: 'error',
      what: 'Try again in a moment',
      why: <>It isn't something you did. If it keeps happening, contact support{reference ? <> and give them this reference: <span className="font-mono">{reference}</span></> : null}.</>,
      actions: <><Button onClick={retry}>Try again</Button>{toHome}</>,
    },
    'no-access': {
      icon: 'lock',
      what: 'Ask for access, or sign in with another account',
      why: "This page belongs to a team or a person you aren't signed in as. Whoever shared the link can give you access.",
      actions: <>{toHome}<Button href="#sign-in" variant="secondary">Sign in as someone else</Button></>,
    },
  }[kind];

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="mx-auto max-w-xl px-4 pt-6">
        <Link href={home} className="text-base font-semibold">{SITE}</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-12 outline-none">
        <Heading level={1} className="text-center">{title}</Heading>
        <EmptyState icon={body.icon} headingLevel={2} title={body.what} description={body.why} actions={body.actions} />
        {kind === 'offline' ? (
          // Always there, so a screen reader is listening before the connection comes back.
          <div role="status" className="text-center text-sm">{online ? "You're back online. Try again to load the page." : null}</div>
        ) : null}
      </main>
    </div>
  );
}

import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Link } from '../../components/Link/Link';
import { announce } from '../../internal/announce';

/* Empty states (BL5): the four empties most apps need, each with its next step, built from EmptyState only, for an app
   to copy. What they carry (WCAG 2.2):
   - 3.3.3 / 2.4.6: each says what happened in words and offers the way out as a real button or link, not only a
     picture.
   - 4.1.3: the ones that appear after something the person did (no results, failed to load) are said once,
     politely; the first-run and no-access ones are on the page when it arrives, so they aren't.
   - 2.2.1 / 3.2.2: nothing retries or requests on its own; the person presses the button.
   - Each takes its words as props, English by default, so a page in another language passes its own. */

export interface EmptyFirstRunProps {
  /** "No projects yet". */
  title?: string | undefined;
  /** What it's for, and what the first step is. */
  description?: string | undefined;
  /** The first step's button: "New project". */
  createLabel: string;
  onCreate: () => void;
  /** A guide for people who want to read first. */
  learnHref?: string | undefined;
  /** The guide link's words. Default: "How it works". */
  learnLabel?: string | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
}

/** The first visit: nothing made yet, and the one button that makes the first. */
export function EmptyFirstRun({ title = 'Nothing here yet', description, createLabel, onCreate, learnHref, learnLabel = 'How it works', headingLevel }: EmptyFirstRunProps) {
  return (
    <EmptyState icon="add_circle" title={title} description={description} headingLevel={headingLevel}
      actions={<><Button onClick={onCreate}>{createLabel}</Button>{learnHref ? <Link href={learnHref}>{learnLabel}</Link> : null}</>} />
  );
}

export interface EmptyNoResultsProps {
  /** What was searched for. Shown in the title: No results for “mars”. */
  query: string;
  /** The title, from the query. Default: No results for “query”. */
  title?: ((query: string) => string) | undefined;
  /** Default: "Check the spelling, or try fewer words." */
  description?: string | undefined;
  /** Other searches to try, such as a spelling fix. */
  suggestions?: string[] | undefined;
  onSuggestion?: ((suggestion: string) => void) | undefined;
  /** Adds Clear filters, the usual way out. */
  onClearFilters?: (() => void) | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
}

/** A search or filter that found nothing: the query in the title, searches to try, and Clear filters. Said once. */
export function EmptyNoResults({ query, title = (q) => `No results for “${q}”`, description = 'Check the spelling, or try fewer words.', suggestions, onSuggestion, onClearFilters, headingLevel }: EmptyNoResultsProps) {
  return (
    <EmptyState icon="search_off" announce title={title(query)} description={description} headingLevel={headingLevel}
      suggestions={suggestions} onSuggestion={onSuggestion} onClearFilters={onClearFilters} />
  );
}

export interface EmptyNoAccessProps {
  /** Default: "You don't have access". */
  title?: string | undefined;
  /** Who can give access, in a sentence: "Ana Putri owns this project. Ask them, or request access here." */
  description: string;
  /** Sends the request. Return a promise: the button then shows it's working, and requestedLabel once it's sent. */
  onRequest?: (() => Promise<unknown>) | undefined;
  /** Default: "Request access". */
  requestLabel?: string | undefined;
  /** Said and shown on the button once the request is sent. Default: "Request sent". */
  requestedLabel?: string | undefined;
  /** Said and shown under the description when onRequest rejects; the button can be pressed again.
      Default: "Couldn't send the request. Try again." */
  requestFailedLabel?: string | undefined;
  /** Where to go instead: the list this page belongs to. */
  backHref?: string | undefined;
  /** Default: "Go back". */
  backLabel?: string | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
}

/** A page the person can't see: who can let them in, Request access, and a way back. */
export function EmptyNoAccess({ title = "You don't have access", description, onRequest, requestLabel = 'Request access', requestedLabel = 'Request sent', requestFailedLabel = "Couldn't send the request. Try again.", backHref, backLabel = 'Go back', headingLevel }: EmptyNoAccessProps) {
  // Once sent, the button keeps saying so and does nothing more, so one person can't send the same request twice.
  // It stays focusable (aria-disabled, not disabled), so focus isn't lost from under the keyboard.
  // A request that fails says so, in words under the description and once to a screen reader, and the button stays
  // Request access, so it can be pressed again (GR136). Nothing is said as sent unless onRequest resolved.
  const [sent, setSent] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const request = onRequest ? async () => {
    if (sent) return;
    setFailed(false);
    try { await onRequest(); } catch { setFailed(true); announce(requestFailedLabel); return; }
    setSent(true);
    announce(requestedLabel);
  } : undefined;
  return (
    <EmptyState icon="lock" title={title} headingLevel={headingLevel}
      description={failed ? <>{description}<br /><span className="text-danger">{requestFailedLabel}</span></> : description}
      actions={<>{request ? <Button onClick={request} aria-disabled={sent || undefined}>{sent ? requestedLabel : requestLabel}</Button> : null}{backHref ? <Link href={backHref}>{backLabel}</Link> : null}</>} />
  );
}

export interface EmptyLoadFailedProps {
  /** Default: "Couldn't load this". */
  title?: string | undefined;
  /** What happened and what to do. Default: "Check your connection, then try again." */
  description?: string | undefined;
  /** Loads again. Return a promise: the button shows it's working until it settles. */
  onRetry: () => Promise<unknown> | void;
  /** Default: "Try again". */
  retryLabel?: string | undefined;
  /** A code to give support, shown under the description: "Reference: 7F3A-91". */
  reference?: string | undefined;
  /** The words before the code. Default: "Reference". */
  referenceLabel?: string | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
}

/** Loading failed: what to do, Try again, and a reference for support. Said once. */
export function EmptyLoadFailed({ title = "Couldn't load this", description = 'Check your connection, then try again.', onRetry, retryLabel = 'Try again', reference, referenceLabel = 'Reference', headingLevel }: EmptyLoadFailedProps) {
  return (
    <EmptyState icon="cloud_off" announce title={title} headingLevel={headingLevel}
      description={reference ? <>{description}<br />{referenceLabel}: <span className="font-mono">{reference}</span></> : description}
      actions={<Button onClick={onRetry}>{retryLabel}</Button>} />
  );
}

'use client';
import * as React from 'react';
import { flushSync } from 'react-dom';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { List, ListItem } from '../../components/List/List';
import { Splitter } from '../../components/Splitter/Splitter';
import { useLocale } from '../../internal/provider';
import { withViewTransition } from '../../internal/viewTransition';

/* List and detail: a list of messages beside the one that's open, in two panes on a wide screen and one at a time on
   a phone. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the list and the open message are regions named by their headings; the open item is aria-current.
   - 1.4.10: on a narrow screen the panes don't squeeze side by side: the list shows, choosing one shows it alone
     with "Back to messages", and nothing scrolls sideways.
   - 3.2.3: on a phone, the browser's or the system's Back from a message returns to the list, as "Back to messages"
     does, rather than leaving the page: opening a message adds a history entry (with no new address).
   - 2.4.3: on a phone, opening a message puts focus on its heading, and Back puts it on the message it came from,
     still marked as open, so the place in the list is never lost. On a wide screen focus stays in the list.
   - 2.1.1: the panes' divider is a Splitter, moved with the arrow keys as well as by dragging.
   Motion (the Motion foundation's "Layout changes"): on a phone, an opened message slides in from the end while its
   subject glides from its row up into the heading, and "Back to messages" plays it the other way, so the message
   is seen to come from its place in the list and go back to it. Under reduced motion the two views crossfade; where
   View Transitions are missing they swap at once. The browser's own Back swaps at once: it may animate on its own.
   Loading the messages is the app's job: pass them as `messages`, and onSelect hears which one is open. */

export interface Message { id: string; from: string; subject: string; date: string; body: string }

export interface ListDetailProps {
  /** The messages, newest first. Default: a demo inbox. */
  messages?: readonly Message[] | undefined;
  /** The message open at first. Default: the first on a wide screen, none on a phone. */
  defaultSelected?: string | undefined;
  /** A message was opened. */
  onSelect?: ((id: string) => void) | undefined;
}

const demo: Message[] = [
  { id: 'm1', from: 'Ana Lima', subject: 'Launch checklist', date: '2026-11-06', body: 'Three of five steps are done. The pricing page and the forms are still to check.' },
  { id: 'm2', from: 'Budi Santoso', subject: 'Invoice for October', date: '2026-11-05', body: 'The invoice is attached. It is due at the end of the month.' },
  { id: 'm3', from: 'Chen Wei', subject: 'New photos for the home page', date: '2026-11-04', body: 'Here are twelve photos from the shoot. Pick three for the home page.' },
  { id: 'm4', from: 'Dewi Lestari', subject: 'Help center: new articles', date: '2026-11-02', body: 'Four new articles are ready for review: billing, exports, teams and sign-in.' },
];

// "6 Nov 2026" (medium) or "6 November 2026" (long) in the reader's locale for "2026-11-06", read as that calendar
// day wherever the reader is; anything else as it came.
function day(iso: string, locale: string, style: 'medium' | 'long'): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  try { return new Intl.DateTimeFormat(locale, { dateStyle: style }).format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))); } catch { return iso; }
}

const WIDE = '(min-width: 48rem)';
const subscribe = (f: () => void) => { const m = matchMedia(WIDE); m.addEventListener('change', f); return () => m.removeEventListener('change', f); };
/** Whether the screen is wide enough for both panes. */
function useWide() { return React.useSyncExternalStore(subscribe, () => matchMedia(WIDE).matches, () => true); }

/** The list-and-detail page: a skip link, a header, then main with the list and the open message. */
export function ListDetail({ messages = demo, defaultSelected, onSelect }: ListDetailProps) {
  const locale = useLocale();
  const wide = useWide();
  const [picked, setPicked] = React.useState<string | undefined>(defaultSelected);
  const [showing, setShowing] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const focus = React.useRef<'detail' | string | null>(null);
  const open = messages.find((m) => m.id === picked) || (wide ? messages[0] : undefined);

  // every render: a focus asked for by a handler (focus) moves once the render it caused is on screen.
  React.useEffect(() => {
    const to = focus.current;
    focus.current = null;
    if (to === 'detail') heading.current?.focus();
    else if (to) document.getElementById(`message-${to}`)?.focus();
  });

  // On a phone, a message open on its own has a history entry of its own (pushed), so the browser's Back closes it.
  const pushed = React.useRef(false);
  const choose = (m: Message) => (e: React.MouseEvent) => {
    e.preventDefault();
    // On a phone the row is marked open first, so its subject is the named element in the picture taken before.
    if (wide) setPicked(m.id); else flushSync(() => setPicked(m.id));
    onSelect?.(m.id);
    if (!wide) {
      if (!pushed.current) { history.pushState(history.state, ''); pushed.current = true; }
      void withViewTransition(() => { setShowing(true); focus.current = 'detail'; }, { types: ['forward'] });
    }
  };
  const close = () => { setShowing(false); focus.current = open?.id ?? null; };
  // "Back to messages" closes it at once, and takes back the entry it added, which the listener below then ignores.
  const back = () => {
    void withViewTransition(close, { types: ['back'] });
    if (pushed.current) { pushed.current = false; history.back(); }
  };
  const closeRef = React.useRef(close);
  // every render: the popstate listener reads the latest close through this ref.
  React.useEffect(() => { closeRef.current = close; });
  React.useEffect(() => {
    const onPop = () => { if (pushed.current) { pushed.current = false; closeRef.current(); } };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // On a phone, the open message's subject is one element that travels between its row and the heading, and the pane
  // that holds the list or the message slides as a step (base.css).
  const subject = (id: string, text: string) => (!wide && open?.id === id ? <span style={{ viewTransitionName: 'list-detail-subject' }}>{text}</span> : text);
  const pane = wide ? undefined : ({ viewTransitionName: 'list-detail-pane', viewTransitionClass: 'step' } as React.CSSProperties);
  const list = (
    <section aria-labelledby="messages-title" className="flex h-full min-w-0 flex-col gap-3 p-4">
      <Heading level={2} size="lg" id="messages-title">Messages ({messages.length})</Heading>
      <List divided>
        {messages.map((m) => (
          <ListItem key={m.id} title={subject(m.id, m.subject)} description={<>{m.from} · <time dateTime={m.date}>{day(m.date, locale, 'medium')}</time></>} href={`#${m.id}`}
            linkProps={{ id: `message-${m.id}` }} selected={open?.id === m.id} onClick={choose(m)} />
        ))}
      </List>
    </section>
  );
  const detail = open ? (
    <section aria-labelledby="message-title" className="flex min-w-0 flex-col gap-3 p-4">
      {wide ? null : <div><Button variant="ghost" leftIcon="arrow_back" onClick={back}>Back to messages</Button></div>}
      <Heading level={2} size="lg" id="message-title" ref={heading} tabIndex={-1} className="outline-none">{subject(open.id, open.subject)}</Heading>
      <p className="m-0 text-sm text-text-muted">From {open.from}, <time dateTime={open.date}>{day(open.date, locale, 'long')}</time></p>
      <p className="m-0 max-w-prose">{open.body}</p>
    </section>
  ) : (
    <p className="m-0 p-4 text-text-muted">Choose a message to read it.</p>
  );

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 outline-none">
        <Heading level={1}>Inbox</Heading>
        <div className="min-w-0 rounded-lg border border-border bg-surface">
          {wide ? (
            <Splitter defaultSize={35} min={25} max={60} separatorLabel="Resize the message list" className="h-96">
              {list}{detail}
            </Splitter>
          ) : <div style={pane}>{showing && open ? detail : list}</div>}
        </div>
      </main>
    </div>
  );
}

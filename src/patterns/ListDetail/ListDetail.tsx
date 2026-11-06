"use client";
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { List, ListItem } from '../../components/List/List';
import { Splitter } from '../../components/Splitter/Splitter';

/* List and detail: a list of messages beside the one that's open, in two panes on a wide screen and one at a time on
   a phone. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the list and the open message are regions named by their headings; the open item is aria-current.
   - 1.4.10: on a narrow screen the panes don't squeeze side by side: the list shows, choosing one shows it alone
     with "Back to messages", and nothing scrolls sideways.
   - 2.4.3: on a phone, opening a message puts focus on its heading, and Back puts it on the message it came from,
     still marked as open, so the place in the list is never lost. On a wide screen focus stays in the list.
   - 2.1.1: the panes' divider is a Splitter, moved with the arrow keys as well as by dragging.
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

const WIDE = '(min-width: 48rem)';
const subscribe = (f: () => void) => { const m = matchMedia(WIDE); m.addEventListener('change', f); return () => m.removeEventListener('change', f); };
/** Whether the screen is wide enough for both panes. */
function useWide() { return React.useSyncExternalStore(subscribe, () => matchMedia(WIDE).matches, () => true); }

/** The list-and-detail page: a skip link, a header, then main with the list and the open message. */
export function ListDetail({ messages = demo, defaultSelected, onSelect }: ListDetailProps) {
  const wide = useWide();
  const [picked, setPicked] = React.useState<string | undefined>(defaultSelected);
  const [showing, setShowing] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const focus = React.useRef<'detail' | string | null>(null);
  const open = messages.find((m) => m.id === picked) || (wide ? messages[0] : undefined);

  React.useEffect(() => {
    const to = focus.current;
    focus.current = null;
    if (to === 'detail') heading.current?.focus();
    else if (to) document.getElementById(`message-${to}`)?.focus();
  });

  const choose = (m: Message) => (e: React.MouseEvent) => {
    e.preventDefault();
    setPicked(m.id);
    onSelect?.(m.id);
    if (!wide) { setShowing(true); focus.current = 'detail'; }
  };
  const back = () => { setShowing(false); focus.current = open?.id ?? null; };

  const list = (
    <section aria-labelledby="messages-title" className="flex h-full min-w-0 flex-col gap-3 p-4">
      <Heading level={2} size="lg" id="messages-title">Messages ({messages.length})</Heading>
      <List divided>
        {messages.map((m) => (
          <ListItem key={m.id} title={m.subject} description={`${m.from} · ${m.date}`} href={`#${m.id}`}
            linkProps={{ id: `message-${m.id}` }} selected={open?.id === m.id} onClick={choose(m)} />
        ))}
      </List>
    </section>
  );
  const detail = open ? (
    <section aria-labelledby="message-title" className="flex min-w-0 flex-col gap-3 p-4">
      {wide ? null : <div><Button variant="ghost" leftIcon="arrow_back" onClick={back}>Back to messages</Button></div>}
      <Heading level={2} size="lg" id="message-title" ref={heading} tabIndex={-1} className="outline-none">{open.subject}</Heading>
      <p className="m-0 text-sm text-text-muted">From {open.from}, <time dateTime={open.date}>{open.date}</time></p>
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
          ) : showing && open ? detail : list}
        </div>
      </main>
    </div>
  );
}

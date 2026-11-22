'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { List, ListItem } from '../../components/List/List';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loader } from '../../components/Loader/Loader';
import { Chat, ChatMessage, ChatComposer } from '../../components/Chat/Chat';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Messages: one-to-one conversations, the list beside the open one, with a field to write in. For an app to copy.
   What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: the conversations are a list under an h2, each named by the person, with how many are unread in
     words ("2 unread") and the last message; the open conversation is an h2 named by the person.
   - 2.4.3: opening a conversation moves focus to its heading; on a phone, where one pane shows at a time, "Back to
     conversations" returns focus to the row it came from.
   - 4.1.3: a message shows at once as "Sending…"; one that can't be sent says "Not sent" with Try again, keeps its
     text, and the page says so once. A new message from the other person is said too, with their name.
   - 3.3.2: the field is named "Message to Ana Lima", so it's clear who will read it; Enter sends, Shift+Enter starts a
     new line (ChatComposer).
   - 4.1.3, 3.3.1: while the conversations load, one placeholder named once; a failed load says so, with Try again.
   Sending is the app's job: onSend gets the conversation and the text; reject its promise when it can't be sent. */

export interface DirectMessage {
  id: string;
  /** Written by the person reading: true. */
  own?: boolean | undefined;
  text: string;
  /** When it was sent: an ISO date and time. */
  at: string;
  /** Your own message on its way, or one that couldn't be sent. Set by the pattern as it sends. */
  status?: 'sending' | 'failed' | undefined;
}
export interface Conversation {
  id: string;
  /** Who it's with: "Ana Lima". */
  name: string;
  /** Oldest first. */
  messages: readonly DirectMessage[];
  /** How many of their messages haven't been read. Opening the conversation reads them. */
  unread?: number | undefined;
}

export interface MessagesProps {
  /** The conversations, the latest first. Default: a demo of three. */
  conversations?: readonly Conversation[] | undefined;
  /** The conversation open at first, read as it opens. Default: none, so nothing is marked read before it's seen. */
  defaultOpen?: string | undefined;
  /** A conversation was opened, and its messages read. */
  onOpen?: ((id: string) => void) | undefined;
  /** Sends a message. Return its promise: a rejection marks the message "Not sent", with Try again. */
  onSend?: ((conversationId: string, text: string) => unknown) | undefined;
  /** The conversations are on their way: one placeholder, named once ("Loading conversations"). Default: false. */
  loading?: boolean | undefined;
  /** The conversations failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the conversations again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: Conversation[] = [
  { id: 'ana', name: 'Ana Lima', unread: 2, messages: [
    { id: 'a1', own: true, text: 'Is the launch checklist ready for review?', at: '2025-03-04T09:12:00' },
    { id: 'a2', text: 'Nearly. The pricing page and the forms are still to check.', at: '2025-03-04T09:20:00' },
    { id: 'a3', text: 'Could you look at the forms this afternoon?', at: '2025-03-04T09:21:00' },
  ] },
  { id: 'budi', name: 'Budi Santoso', messages: [
    { id: 'b1', text: 'The October invoice is in your inbox.', at: '2025-03-03T16:02:00' },
    { id: 'b2', own: true, text: 'Thanks, I’ll pay it this week.', at: '2025-03-03T16:30:00' },
  ] },
  { id: 'chen', name: 'Chen Wei', messages: [{ id: 'c1', text: 'Twelve photos from the shoot are in the shared folder.', at: '2025-03-01T11:45:00' }] },
];

/** "1 unread" or "3 unread" in the locale's digits; "" for none. */
export const unreadWords = (n: number | undefined, locale?: string): string => (n ? `${formatNumber(n, locale)} unread` : '');

/** What a row says under the name: the last message, "You: " first when it's yours. */
export const lastLine = (c: Conversation): string => {
  const m = c.messages[c.messages.length - 1];
  return m ? (m.own ? `You: ${m.text}` : m.text) : 'No messages yet';
};

const WIDE = '(min-width: 48rem)';
const subscribe = (f: () => void) => { const m = matchMedia(WIDE); m.addEventListener('change', f); return () => m.removeEventListener('change', f); };
function useWide() { return React.useSyncExternalStore(subscribe, () => matchMedia(WIDE).matches, () => true); }

/** The messages page: a skip link, a header, then main with the conversations beside the open one. */
export function Messages({ conversations: start = demo, defaultOpen, onOpen, onSend, loading = false, loadFailed = false, onRetry, online }: MessagesProps) {
  const locale = useLocale(undefined);
  const wide = useWide();
  const [list, setList] = React.useState<readonly Conversation[]>(() => (defaultOpen ? start.map((c) => (c.id === defaultOpen ? { ...c, unread: 0 } : c)) : start));
  const [picked, setPicked] = React.useState<string | undefined>(defaultOpen);
  const [showing, setShowing] = React.useState(!!defaultOpen);
  const open = list.find((c) => c.id === picked);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const focus = React.useRef<string | null>(null);
  const made = React.useRef(0);

  // every render: a focus asked for by a handler moves once the render it caused is on screen.
  React.useEffect(() => {
    const to = focus.current;
    focus.current = null;
    if (to === 'thread') heading.current?.focus();
    else if (to) document.getElementById(`conversation-${to}`)?.focus();
  });

  const choose = (c: Conversation) => (e: React.MouseEvent) => {
    e.preventDefault();
    setPicked(c.id);
    if (c.unread) setList((now) => now.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
    onOpen?.(c.id);
    setShowing(true);
    focus.current = 'thread';
  };
  const back = () => { setShowing(false); focus.current = open?.id ?? null; };

  const patch = (cid: string, mid: string, change: Partial<DirectMessage>) =>
    setList((now) => now.map((c) => (c.id === cid ? { ...c, messages: c.messages.map((m) => (m.id === mid ? { ...m, ...change } : m)) } : c)));
  const deliver = (cid: string, mid: string, text: string) => {
    patch(cid, mid, { status: 'sending' });
    void Promise.resolve().then(() => onSend?.(cid, text)).then(
      () => patch(cid, mid, { status: undefined }),
      () => { patch(cid, mid, { status: 'failed' }); announce('Your message wasn’t sent. Try again.', { assertive: true }); },
    );
  };
  const send = (text: string) => {
    if (!open || !text.trim()) return;
    const mid = `sent-${++made.current}`;
    const m: DirectMessage = { id: mid, own: true, text, at: new Date().toISOString(), status: 'sending' };
    setList((now) => now.map((c) => (c.id === open.id ? { ...c, messages: [...c.messages, m] } : c)));
    deliver(open.id, mid, text);
  };

  const rows = (
    <section aria-labelledby="conversations-title" className="flex min-w-0 flex-col gap-4">
      <Heading level={2} size="lg" id="conversations-title">Conversations</Heading>
      <List divided>
        {list.map((c) => {
          const unread = unreadWords(c.unread, locale);
          return (
            <ListItem key={c.id} href={`#${c.id}`} selected={open?.id === c.id} linkProps={{ id: `conversation-${c.id}`, onClick: choose(c) }}
              leading={<Avatar name={c.name} size="sm" />}
              title={unread ? <span className="flex flex-wrap items-center gap-2 font-semibold">{c.name}<Badge tone="primary" variant="solid">{unread}</Badge></span> : c.name}
              description={<span className="line-clamp-1">{lastLine(c)}</span>} />
          );
        })}
      </List>
    </section>
  );
  const thread = open ? (
    <section aria-labelledby="thread-title" className="flex min-h-0 min-w-0 flex-col gap-3 md:col-span-2">
      {/* Pulled back by a ghost button's padding, so its arrow lines up with the name under it. */}
      {wide ? null : <div className="-ms-3"><Button variant="ghost" startIcon="arrow_back" onClick={back}>Back to conversations</Button></div>}
      <Heading level={2} size="lg" id="thread-title" ref={heading} tabIndex={-1} className="outline-none">{open.name}</Heading>
      <Chat aria-labelledby="thread-title" className="min-h-64 flex-1">
        {open.messages.map((m) => (
          <ChatMessage key={m.id} own={m.own} author={m.own ? undefined : open.name} avatar={m.own ? undefined : <Avatar name={open.name} size="sm" />}
            time={m.at} status={m.status} onRetry={() => deliver(open.id, m.id, m.text)}>{m.text}</ChatMessage>
        ))}
      </Chat>
      <ChatComposer aria-label={`Message to ${open.name}`} onSend={send} />
    </section>
  ) : null;

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-6xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">These are the conversations loaded before you went offline. Sending needs a connection.</OfflineBanner>
        <PageHeader title="Messages" />
        <div className="pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load your messages" onRetry={() => onRetry?.()} headingLevel={2} />
            : loading ? <Loader variant="skeleton" shape="text" lines={6} label="Loading conversations" />
            : !list.length ? <EmptyState icon="chat" title="No messages yet" headingLevel={2} description="When someone writes to you, the conversation shows here." />
            : wide ? <div className="grid grid-cols-3 gap-6">{rows}{thread ?? (
              <div className="col-span-2"><EmptyState icon="forum" title="Choose a conversation" headingLevel={2} description="Its messages show here, with a field to reply in." /></div>
            )}</div>
            : showing && thread ? thread : rows}
        </div>
      </main>
    </div>
  );
}

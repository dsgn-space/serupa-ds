'use client';
import * as React from 'react';
import { cn, domId, omit, useMergedRef } from '../../internal/cn';
import { announce } from '../../internal/announce';
import { component } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { isComposing } from '../../internal/ime';
import { activeIn } from '../../internal/root';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Loader } from '../Loader/Loader';
import { Icon } from '../Icon/Icon';
import { RelativeTime } from '../RelativeTime/RelativeTime';
import { Textarea } from '../Textarea/Textarea';
import * as icons from '../../material/builtin';
import { en as ownWords } from './labels';

const words = /* @__PURE__ */ Object.assign({}, ownWords);

// A region that scrolls is a Tab stop, so keyboard people can scroll it (as Table and CodeBlock do).
const SCROLL_STOP = { tabIndex: 0 } as const;
// How close to the bottom, in px, still counts as "at the bottom": a line of rounding, not a design value.
const NEAR = 4;

export interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The messages, oldest first: ChatMessage and ChatDivider elements, each with a key. */
  children?: React.ReactNode;
  /** There are earlier messages to load: a "Load earlier messages" button at the top calls onLoadOlder. */
  hasOlder?: boolean | undefined;
  /** Called by the "Load earlier messages" button. Prepend the messages it brings: the reader stays where they were. */
  onLoadOlder?: (() => void) | undefined;
  /** Earlier messages are on their way: the button says so and is busy. Default: false. */
  loadingOlder?: boolean | undefined;
}

// Whether the log shows its newest message (within NEAR px), and scrolling it there.
const atBottom = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR;
const toEnd = (el: HTMLElement) => { el.scrollTop = el.scrollHeight; };

/* Chat: the conversation, as a log (role="log", so screen readers read each new message as it comes) that scrolls by
   itself. It sticks to the bottom only while the reader is there: scrolled up, new messages don't move the page, and
   a "3 new messages" button at the bottom jumps down. Earlier messages loaded at the top keep the reader's place. */
/** A conversation that stays at its newest message while the reader is there, with day dividers and earlier messages loaded on request.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Chat = /* @__PURE__ */ component<HTMLDivElement, ChatProps>('Chat', function Chat(props, ref) {
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { children: 1, hasOlder: 1, onLoadOlder: 1, loadingOlder: 1, className: 1, 'aria-label': 1, 'aria-labelledby': 1 } as const);
  const scroller = React.useRef<HTMLDivElement | null>(null);
  const items = React.Children.toArray(props.children).filter(React.isValidElement);
  const keys = items.map((c) => String(c.key));
  const messages = items.filter((c) => c.type === ChatMessage).length;
  // Where things were at the last render: whether the reader was at the bottom, the first and last keys, the height.
  const was = React.useRef<{ bottom: boolean; first: string; last: string; height: number; top: number; messages: number } | null>(null);
  const [unread, setUnread] = React.useState(0);
  const toBottom = () => { const el = scroller.current; if (el) toEnd(el); };
  const first = keys[0] || '', last = keys[keys.length - 1] || '', all = '\n' + keys.join('\n') + '\n';

  // When the messages change: where the reader was decides where they stay.
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const before = was.current;
    if (!before) toEnd(el);   // opens at the newest message
    else if (first !== before.first && last === before.last && all.includes('\n' + before.first + '\n')) {
      // earlier messages came in at the top: keep what the reader was looking at where it was
      el.scrollTop = before.top + (el.scrollHeight - before.height);
    } else if (last !== before.last) {
      if (before.bottom) toEnd(el);
      else if (messages > before.messages) setUnread((n) => n + messages - before.messages);
    }
    was.current = { bottom: atBottom(el), first, last, height: el.scrollHeight, top: el.scrollTop, messages };
  }, [all, first, last, messages]);
  // A load the reader asked for with "Load earlier messages": the first key when they pressed it.
  const asked = React.useRef<string | null>(null);
  const older = React.useRef<HTMLDivElement | null>(null);
  // When that load is done (earlier messages came in, or there are none left): if focus was on the button, it goes to
  // the conversation, which stays in view where the reader was. The button may be gone (no more to load), which would
  // drop focus to the page, or scrolled out of view above the messages that came in.
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (asked.current == null || !el || props.loadingOlder || (first === asked.current && props.hasOlder)) return;
    asked.current = null;
    const active = activeIn(el);
    if (!active || active === el.ownerDocument.body || (older.current && older.current.contains(active))) el.focus({ preventScroll: true });
  }, [first, props.hasOlder, props.loadingOlder]);
  // A message that grows (a streamed reply) or a picture that loads keeps the reader at the bottom if they were there.
  // One ResizeObserver for the log's life, told of each message as it comes and goes by a MutationObserver: rebuilt
  // every render, it was 2,001 observe() calls per streamed token at 2,000 messages (GR240).
  React.useEffect(() => {
    const el = scroller.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => { if (was.current && was.current.bottom) toBottom(); });
    for (const c of Array.from(el.children)) ro.observe(c);
    const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => { if (n.nodeType === 1) ro.observe(n as Element); });
        r.removedNodes.forEach((n) => { if (n.nodeType === 1) ro.unobserve(n as Element); });
      }
    });
    if (mo) mo.observe(el, { childList: true });
    return () => { ro.disconnect(); if (mo) mo.disconnect(); };
  }, []);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget, bottom = atBottom(el);
    if (was.current) was.current = { ...was.current, bottom, top: el.scrollTop, height: el.scrollHeight };
    if (bottom && unread) setUnread(0);
  };
  const jump = () => {
    const el = scroller.current;
    toBottom(); setUnread(0);
    // Focus goes to the conversation, so the next Tab or arrow reads on from the newest message.
    if (el) el.focus({ preventScroll: true });
  };
  return (
    <div {...rest} ref={ref} className={cn('dk-chat', props.className)} data-component="chat">
      {/* A region that scrolls is focusable, so keyboard people can scroll it; role="log" reads new messages politely. */}
      <div ref={scroller} className="dk-chat__log" role="log" {...SCROLL_STOP} aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby']} onScroll={onScroll}>
        {props.hasOlder ? (
          <div className="dk-chat__older" ref={older}>
            <Button variant="ghost" size="sm" loading={!!props.loadingOlder} onClick={() => { if (!props.loadingOlder && props.onLoadOlder) { asked.current = first; props.onLoadOlder(); } }}>
              {props.loadingOlder ? L.chatLoadingOlder : L.chatLoadOlder}
            </Button>
          </div>
        ) : null}
        {props.children}
      </div>
      {unread ? (
        <Button className="dk-chat__jump" variant="secondary" size="sm" rightIcon={<Icon icon={icons.ArrowDownward} />} onClick={jump}>
          {L.chatNewMessages(unread)}
        </Button>
      ) : null}
    </div>
  );
});

export interface ChatMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the message says. Text keeps its line breaks. */
  children?: React.ReactNode;
  /** Who wrote it, shown above the text: a name, or a node. */
  author?: React.ReactNode | undefined;
  /** A picture of the author, such as <Avatar size="sm" />, beside the message. Decorative: the name says who it is. */
  avatar?: React.ReactNode | undefined;
  /** When it was sent, shown as relative time ("5 minutes ago") with the full date on hover. */
  time?: Date | number | string | undefined;
  /** Written by the person reading: it sits at the end, in the primary tint, and is read as "You". Default: false. */
  own?: boolean | undefined;
  /** Leaves out the author and avatar, for the second and later messages in a row from the same person (the avatar's space stays). Default: false. */
  hideAuthor?: boolean | undefined;
  /** An own message on its way ('sending', "Sending…" under it) or one that didn't go ('failed', "Not sent" and a Retry button with onRetry). */
  status?: 'sending' | 'failed' | undefined;
  /** Called by the Retry button of a failed message. */
  onRetry?: (() => void) | undefined;
  /** Files sent with it, under the text: Attachment elements. */
  attachments?: React.ReactNode | undefined;
  /** The text is still arriving (a streamed reply): marked aria-busy, so screen readers wait for it whole. Default: false. */
  streaming?: boolean | undefined;
  /** A reply that hasn't started yet: "Thinking…" in place of the text, said once by screen readers. Its words replace it when they come. Default: false. */
  thinking?: boolean | undefined;
  /** How the reply was reached (an assistant's reasoning), in a section closed by default above the text. */
  reasoning?: React.ReactNode | undefined;
  /** How long the reasoning took, in seconds, for the section's toggle: "Thought for 12 seconds". Without it, "Reasoning". */
  reasoningTime?: number | undefined;
  /** Which version of a regenerated reply this is, from 1, with branches (how many) and onBranchChange: shows
   *  "2 / 3" between previous and next buttons under the text. */
  branch?: number | undefined;
  branches?: number | undefined;
  onBranchChange?: ((branch: number) => void) | undefined;
  /** The steps taken on the way to the reply (tools called, searches), above the text: a ChatSteps list. */
  steps?: readonly ChatStep[] | undefined;
}

/** One message in a Chat: author, avatar, time, text and attachments, with sending and failed states.
 *  @beta */
export const ChatMessage = /* @__PURE__ */ component<HTMLDivElement, ChatMessageProps>('ChatMessage', function ChatMessage(props, ref) {
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { children: 1, author: 1, avatar: 1, time: 1, own: 1, hideAuthor: 1, status: 1, onRetry: 1, attachments: 1, streaming: 1, thinking: 1, reasoning: 1, reasoningTime: 1, steps: 1, branch: 1, branches: 1, onBranchChange: 1, className: 1 } as const);
  const own = !!props.own, failed = props.status === 'failed';
  const hasText = props.children != null && props.children !== '';
  const time = Number(props.reasoningTime);
  const showAuthor = !props.hideAuthor && (props.author != null || own);
  const count = Math.floor(Number(props.branches)) || 0, at = Math.min(Math.max(Math.floor(Number(props.branch)) || 1, 1), count);
  const num = new Intl.NumberFormat(useLocale());
  const go = (to: number) => {
    if (to < 1 || to > count || !props.onBranchChange) return;
    props.onBranchChange(to);
    announce(L.chatResponseOf(to, count));   // the text changes in place, which the log doesn't read
  };
  return (
    <div {...rest} ref={ref} className={cn('dk-chat-message', own && 'dk-chat-message--own', failed && 'dk-chat-message--failed', props.hideAuthor && 'dk-chat-message--follow', props.className)}
      data-component="chat-message" aria-busy={props.streaming || undefined}>
      <span className="dk-chat-message__avatar" aria-hidden>{props.hideAuthor ? null : props.avatar}</span>
      <div className="dk-chat-message__main">
        {showAuthor || (props.time != null && !props.hideAuthor) ? (
          <div className="dk-chat-message__head">
            {showAuthor ? <span className="dk-chat-message__author">{own && props.author == null ? L.chatYou : props.author}</span> : null}
            {props.time != null ? <RelativeTime className="dk-chat-message__time" date={props.time} /> : null}
          </div>
        ) : props.hideAuthor ? <span className="dk-visually-hidden">{own ? L.chatYou : props.author}</span> : null}
        {props.reasoning != null ? (
          <details className="dk-chat-message__reasoning">
            <summary className="dk-chat-message__reasoning-toggle">
              <Icon icon={icons.ExpandMore} className="dk-chat-message__reasoning-icon" />
              {props.reasoningTime != null && isFinite(time) && time >= 0 ? L.chatThoughtFor(Math.round(time)) : L.chatReasoning}
            </summary>
            <div className="dk-chat-message__reasoning-text" dir="auto">{props.reasoning}</div>
          </details>
        ) : null}
        {props.steps && props.steps.length ? <ChatSteps steps={props.steps} /> : null}
        {hasText ? <div className="dk-chat-message__bubble" dir="auto">{props.children}</div> : null}
        {count > 1 ? (
          <div className="dk-chat-message__branches" role="group" aria-label={L.chatResponseOf(at, count)}>
            <IconButton icon={icons.ChevronLeft} label={L.chatPreviousResponse} size="sm" aria-disabled={at <= 1 || undefined} onClick={() => go(at - 1)} />
            <span className="dk-chat-message__branch" aria-hidden>{num.format(at) + ' / ' + num.format(count)}</span>
            <IconButton icon={icons.ChevronRight} label={L.chatNextResponse} size="sm" aria-disabled={at >= count || undefined} onClick={() => go(at + 1)} />
          </div>
        ) : null}
        {props.thinking && !hasText ? <Loader variant="text" size="sm" delay={0} label={L.chatThinking} className="dk-chat-message__thinking" /> : null}
        {props.attachments ? <div className="dk-chat-message__attachments">{props.attachments}</div> : null}
        {props.status === 'sending' ? <span className="dk-chat-message__status">{L.chatSending}</span> : null}
        {failed ? (
          <span className="dk-chat-message__status dk-chat-message__status--failed">
            <Icon icon={icons.Error} />{L.chatNotSent}
            {props.onRetry ? <Button variant="link" size="sm" onClick={props.onRetry}>{L.chatRetry}</Button> : null}
          </span>
        ) : null}
      </div>
    </div>
  );
});

export type ChatStepStatus = 'running' | 'done' | 'failed';
export interface ChatStep {
  /** Kept across renders, so a step keeps its place as the list grows. */
  id: string;
  /** What the step does, in words: "Searching the help centre". */
  label: React.ReactNode;
  status: ChatStepStatus;
  /** One line more, such as what it found or why it failed. */
  detail?: React.ReactNode | undefined;
}
export interface ChatStepsProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  /** The steps an assistant takes on its way to a reply (tool calls, searches), in order. */
  steps: readonly ChatStep[];
}

const STEP_ICON = { done: icons.CheckCircle, failed: icons.Error } as const;

/** An assistant's steps on its way to a reply, such as the tools it calls, each in progress, done or failed, in words
 *  as well as by its icon. Put it in a ChatMessage, above the text.
 *  @beta */
export const ChatSteps = /* @__PURE__ */ component<HTMLOListElement, ChatStepsProps>('ChatSteps', function ChatSteps(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { steps: 1, className: 1 } as const);
  const said = { running: L.chatStepRunning, done: L.chatStepDone, failed: L.chatStepFailed };
  return (
    <ol {...rest} ref={ref} className={cn('dk-chat-steps', props.className)} data-component="chat-steps">
      {(props.steps || []).map((step) => {
        const status: ChatStepStatus = step.status === 'done' || step.status === 'failed' ? step.status : 'running';
        return (
          <li key={step.id} className={cn('dk-chat-steps__step', 'dk-chat-steps__step--' + status)} data-status={status}>
            {status === 'running' ? <Loader size="sm" delay={0} label="" className="dk-chat-steps__icon" /> : <Icon icon={STEP_ICON[status]} className="dk-chat-steps__icon" />}
            <span className="dk-chat-steps__text">
              <span className="dk-chat-steps__label">{step.label}<span className="dk-visually-hidden">{', ' + said[status]}</span></span>
              {step.detail != null ? <span className="dk-chat-steps__detail">{step.detail}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
});

export type ChatApprovalStatus = 'pending' | 'approved' | 'denied';
export interface ChatApprovalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the assistant will do, in words: "Refund order 1042 ($24.00)". It names the card, and stays as its record. */
  children: React.ReactNode;
  /** More about it, such as the command it will run or the fields it will change. */
  detail?: React.ReactNode | undefined;
  /** 'pending' (default) asks; 'approved' and 'denied' leave a one-line record of the answer. */
  status?: ChatApprovalStatus | undefined;
  onApprove?: (() => void) | undefined;
  onDeny?: (() => void) | undefined;
}

/** An assistant asks before it acts: what it will do, in words, with Approve and Deny. Once answered (status), it
 *  becomes a one-line record, said to screen readers, and focus moves to it from the button that was pressed.
 *  @beta */
export const ChatApproval = /* @__PURE__ */ component<HTMLDivElement, ChatApprovalProps>('ChatApproval', function ChatApproval(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { children: 1, detail: 1, status: 1, onApprove: 1, onDeny: 1, className: 1 } as const);
  const status: ChatApprovalStatus = props.status === 'approved' || props.status === 'denied' ? props.status : 'pending';
  const titleId = domId('dk-chat-approval', React.useId());
  const node = React.useRef<HTMLDivElement | null>(null);
  const pressed = React.useRef(false), was = React.useRef(status);
  const own = useMergedRef(ref, (el: HTMLDivElement | null) => { node.current = el; });
  React.useEffect(function () {   // once answered: say the record, and keep focus there if a button here had it
    if (was.current === status) return;
    was.current = status;
    const el = node.current;
    if (status === 'pending' || !el) return;
    announce(el.textContent);
    if (pressed.current) el.focus();
    pressed.current = false;
  }, [status]);
  const answer = (fn: (() => void) | undefined) => () => { pressed.current = true; if (fn) fn(); };
  if (status !== 'pending') return (
    <div {...rest} ref={own} tabIndex={-1} className={cn('dk-chat-approval', 'dk-chat-approval--' + status, props.className)} data-component="chat-approval" data-status={status}>
      <Icon icon={status === 'approved' ? icons.CheckCircle : icons.Close} className="dk-chat-approval__icon" />
      <span>{(status === 'approved' ? L.chatApproved : L.chatDenied) + ': '}{props.children}</span>
    </div>
  );
  return (
    <div {...rest} ref={own} role="group" aria-labelledby={titleId} className={cn('dk-chat-approval', props.className)} data-component="chat-approval" data-status={status}>
      <div className="dk-chat-approval__title" id={titleId} dir="auto">{props.children}</div>
      {props.detail != null ? <div className="dk-chat-approval__detail" dir="auto">{props.detail}</div> : null}
      <div className="dk-chat-approval__actions">
        <Button size="sm" variant="primary" onClick={answer(props.onApprove)}>{L.chatApprove}</Button>
        <Button size="sm" variant="secondary" onClick={answer(props.onDeny)}>{L.chatDeny}</Button>
      </div>
    </div>
  );
});

export interface ChatCitationProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Where the source is. */
  href: string;
  /** Its number in the reply, from 1. */
  index: number;
  /** The source's name; its host ("docs.example.com") when left out. */
  children?: React.ReactNode;
}

/** A numbered source in an assistant's reply ("1 docs.example.com"), as a real link. Wrap it in a HoverCard for a
 *  preview of the page.
 *  @beta */
export const ChatCitation = /* @__PURE__ */ component<HTMLAnchorElement, ChatCitationProps>('ChatCitation', function ChatCitation(props, ref) {
  const rest = omit(props, { index: 1, children: 1, className: 1 } as const);
  const num = new Intl.NumberFormat(useLocale());
  let host = '';
  try { host = new URL(props.href, 'https://localhost').host.replace(/^www\./, ''); } catch { host = props.href; }
  return (
    <a {...rest} ref={ref} className={cn('dk-chat-citation', props.className)} data-component="chat-citation">
      <span className="dk-chat-citation__index">{num.format(props.index)}</span>
      <span className="dk-chat-citation__source" dir="auto">{props.children != null ? props.children : host}</span>
    </a>
  );
});

export interface ChatDividerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The day the messages after it were sent: "Today", "Yesterday", or the date in the locale's words. */
  date?: Date | number | string | undefined;
  /** Your own words in place of the date, such as "New messages". */
  children?: React.ReactNode;
}

const DAY = 86_400_000;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
/* Today, for "Today" and "Yesterday": the visitor's, never the server's (a UTC server and a visitor in Jakarta
   before 7am disagree on it), so the server render and hydration have none, and say the date in UTC on both sides.
   The visitor's words follow right after hydration. It moves on at the visitor's midnight, with no other render. */
const subscribeDay = (cb: () => void) => {
  let t: ReturnType<typeof setTimeout>;
  // The next midnight by the calendar, not today's start plus 24 hours, which a DST change makes 23 or 25 hours.
  const next = () => { const n = new Date(); t = setTimeout(() => { cb(); next(); }, new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime() + 1000 - n.getTime()); };
  next();
  return () => clearTimeout(t);
};
const getDay = () => dayStart(new Date()), getServerDay = () => null;

/** A line between messages that names the day they were sent, or says what follows.
 *  @beta */
export const ChatDivider = /* @__PURE__ */ component<HTMLDivElement, ChatDividerProps>('ChatDivider', function ChatDivider(props, ref) {
  const locale = useLocale();
  const rest = omit(props, { date: 1, children: 1, className: 1 } as const);
  const today = React.useSyncExternalStore(subscribeDay, getDay, getServerDay);
  let text: React.ReactNode = props.children;
  if (text == null && props.date != null) {
    const d = new Date(props.date), days = today == null ? NaN : Math.round((dayStart(d) - today) / DAY);
    if (!isFinite(d.getTime())) text = '';
    else if (today == null) text = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(d);
    else if (Math.abs(days) <= 1) {
      // "today", "yesterday", "tomorrow" in the locale's words, starting with a capital as a heading does
      const word = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
      text = word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
    } else text = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
  }
  return (
    <div {...rest} ref={ref} className={cn('dk-chat-divider', props.className)} data-component="chat-divider">
      <span className="dk-chat-divider__text">{text}</span>
    </div>
  );
});

export interface ChatComposerProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'defaultValue' | 'children'> {
  /** The text in the field (controlled). Use with onValueChange. */
  value?: string | undefined;
  /** The text it starts with (uncontrolled). */
  defaultValue?: string | undefined;
  /** Called as the text changes. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Called with the text when it's sent, by the send button or Enter (Shift+Enter starts a new line). Uncontrolled, the field then empties. */
  onSend?: ((text: string) => void) | undefined;
  /** A reply is streaming: the send button becomes a stop button that calls onStop. Typing stays possible. Default: false. */
  streaming?: boolean | undefined;
  /** Called by the stop button while streaming. */
  onStop?: (() => void) | undefined;
  /** The field's placeholder. Its name stays "Message" (or aria-label). */
  placeholder?: string | undefined;
  /** Turns the field and buttons off. Default: false. */
  disabled?: boolean | undefined;
  /** Above the field: the files about to be sent, as Attachment elements. */
  attachments?: React.ReactNode | undefined;
  /** Before the send button: more buttons, such as one that attaches a file. */
  actions?: React.ReactNode | undefined;
  /** The longest the field grows before it scrolls, in lines. Default: 6. */
  maxRows?: number | undefined;
}

/** The field and send button under a Chat: Enter sends, Shift+Enter starts a new line, and a stop button while a reply streams.
 *  @beta */
export const ChatComposer = /* @__PURE__ */ component<HTMLFormElement, ChatComposerProps>('ChatComposer', function ChatComposer(props, ref) {
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { value: 1, defaultValue: 1, onValueChange: 1, onSend: 1, streaming: 1, onStop: 1, placeholder: 1, disabled: 1, attachments: 1, actions: 1, maxRows: 1, className: 1, 'aria-label': 1 } as const);
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState(props.defaultValue || '');
  const value = controlled ? props.value! : own;
  const field = React.useRef<HTMLTextAreaElement | null>(null);
  const disabled = !!props.disabled;
  const set = (v: string) => { if (!controlled) setOwn(v); if (props.onValueChange) props.onValueChange(v); };
  const empty = !value.trim();
  const send = () => {
    if (disabled || empty || props.streaming) return;
    if (props.onSend) props.onSend(value);
    if (!controlled) setOwn('');
    if (field.current) field.current.focus();
  };
  return (
    <form {...rest} ref={ref} className={cn('dk-chat-composer', props.className)} data-component="chat-composer"
      onSubmit={(e) => { e.preventDefault(); send(); }}>
      {props.attachments ? <div className="dk-chat-composer__attachments">{props.attachments}</div> : null}
      <div className="dk-chat-composer__row">
        <Textarea ref={field} className="dk-chat-composer__field" rows={1} autoResize maxRows={props.maxRows ?? 6} resize="none"
          aria-label={props['aria-label'] || L.chatMessage} placeholder={props.placeholder} disabled={disabled} value={value}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && !isComposing(e)) { e.preventDefault(); send(); }
          }} />
        {props.actions}
        {props.streaming
          ? <IconButton icon={icons.Stop} label={L.chatStop} variant="secondary" disabled={disabled} onClick={() => { if (props.onStop) props.onStop(); }} />
          : <IconButton type="submit" icon={icons.Send} label={L.chatSend} variant="primary" disabled={disabled} aria-disabled={empty || undefined} />}
      </div>
    </form>
  );
});

'use client';
import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { Chat, ChatComposer, ChatMessage } from '../../components/Chat/Chat';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { Heading } from '../../components/Heading/Heading';
import { announce } from '../../internal/announce';

/* AI chat (RU20): a conversation with an assistant whose replies stream in, for an app to copy. It's Chat with what
   an assistant needs around it. What it carries (WCAG 2.2):
   - 1.3.1: a region named by its heading, holding the conversation (Chat's log) and the message box.
   - 4.1.3: a streaming reply is aria-busy in the log until it's whole, so a screen reader reads it once, when it's
     done, not word by word. A stopped reply and one that failed say so in words, under the text.
   - 2.4.3: a suggested prompt sends itself and the suggestions go, Stop turns back into Send, and Regenerate's reply
     is replaced: each time, focus moves to the message box rather than dropping to the page.
   - 2.5.3 / 2.4.6: Copy and Regenerate are named for what they act on ("Copy reply"), so a list of them is clear.
   - Copy and Regenerate are there from the start of a reply, turned off until it's whole, so finishing doesn't add
     buttons the log would read out.
   - Each word is a label, English by default. */

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** The reply is still arriving: it's read once, when this goes false. */
  streaming?: boolean | undefined;
  /** The reply was stopped before it was done: "Stopped" under what arrived. */
  stopped?: boolean | undefined;
  /** The reply couldn't be finished: the reason, under what arrived, with Try again (onRegenerate). */
  error?: string | undefined;
}

export interface AIChatLabels {
  title: string;
  assistant: string;
  /** Above the suggested prompts, while there are no messages yet. */
  intro: string;
  suggestions: string;
  copy: string;
  regenerate: string;
  stopped: string;
  /** Said when a reply is stopped. */
  stoppedSaid: string;
  tryAgain: string;
}

const english: AIChatLabels = {
  title: 'Assistant',
  assistant: 'Assistant',
  intro: 'Ask a question, or start with one of these.',
  suggestions: 'Suggestions',
  copy: 'Copy reply',
  regenerate: 'Regenerate',
  stopped: 'Stopped',
  stoppedSaid: 'Reply stopped',
  tryAgain: 'Try again',
};

export interface AIChatProps {
  /** The conversation, oldest first. The last one is the reply in progress while it streams. */
  messages: readonly AIChatMessage[];
  /** Prompts to start with, shown as buttons while there are no messages. */
  suggestions?: readonly string[] | undefined;
  /** Sends a message: from the box, or a suggestion pressed. */
  onSend: (text: string) => void;
  /** Stops the reply that's streaming. Mark what arrived `stopped`. */
  onStop?: (() => void) | undefined;
  /** Asks again for the last reply, which the app replaces. */
  onRegenerate?: (() => void) | undefined;
  /** The heading's level, to fit the page. Default: 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  labels?: Partial<AIChatLabels> | undefined;
  className?: string | undefined;
}

export function AIChat({ messages, suggestions = [], onSend, onStop, onRegenerate, headingLevel = 2, labels, className }: AIChatProps) {
  const l = { ...english, ...labels };
  const id = React.useId(), titleId = `${id}-title`;
  const box = React.useRef<HTMLFormElement | null>(null);
  const last = messages[messages.length - 1];
  const streaming = !!(last && last.role === 'assistant' && last.streaming);
  const field = () => box.current && box.current.querySelector('textarea');

  // Stop turns into Send, and a reply asked for again replaces the one its button was in: focus would drop to the
  // page, so it goes to the box.
  const toBox = () => { const f = field(); if (f) f.focus(); };
  const suggest = (text: string) => {
    onSend(text);
    toBox();   // the suggestions go with the first message: focus waits in the box for the next one
  };
  const stop = () => {
    if (!onStop) return;
    onStop();
    announce(l.stoppedSaid);
    toBox();
  };
  const again = () => {
    if (!onRegenerate) return;
    onRegenerate();
    toBox();
  };

  return (
    <section aria-labelledby={titleId} className={['flex min-h-0 flex-col gap-3', className].filter(Boolean).join(' ')}>
      <Heading level={headingLevel} size="lg" id={titleId}>{l.title}</Heading>
      {messages.length ? (
        <Chat aria-labelledby={titleId} className="min-h-0 flex-1">
          {messages.map((m, i) => {
            const own = m.role === 'user', whole = !m.streaming, newest = i === messages.length - 1;
            return (
              // What's under a reply (whether it stopped, Copy, Regenerate) sits in the message's attachments row,
              // below the text and its Thinking… line, rather than in the bubble.
              <ChatMessage key={m.id} own={own} author={own ? undefined : l.assistant} streaming={m.streaming}
                thinking={!!m.streaming && !m.text} attachments={own ? undefined : (
                  <span className="flex flex-col gap-1">
                    {m.stopped || m.error ? (
                      <span className="text-sm text-text-muted">
                        <span>{m.error || l.stopped}</span>
                        {m.error && newest && onRegenerate ? <> <Button variant="link" size="sm" onClick={again}>{l.tryAgain}</Button></> : null}
                      </span>
                    ) : null}
                    <span className="flex flex-wrap gap-1">
                      <CopyButton size="sm" variant="ghost" value={m.text} disabled={!whole || !m.text}>{l.copy}</CopyButton>
                      {newest && onRegenerate ? (
                        <Button size="sm" variant="ghost" leftIcon="refresh" disabled={!whole} onClick={again}>{l.regenerate}</Button>
                      ) : null}
                    </span>
                  </span>
                )}>
                {m.text ? <span className="whitespace-pre-wrap">{m.text}</span> : null}
              </ChatMessage>
            );
          })}
        </Chat>
      ) : suggestions.length ? (
        <div className="flex flex-col gap-3">
          <p className="text-text-muted">{l.intro}</p>
          <ul role="list" aria-label={l.suggestions} className="flex flex-wrap gap-2">
            {suggestions.map((s) => <li key={s}><Button variant="secondary" size="sm" onClick={() => suggest(s)}>{s}</Button></li>)}
          </ul>
        </div>
      ) : null}
      <ChatComposer ref={box} streaming={streaming} onStop={stop} onSend={onSend} />
    </section>
  );
}

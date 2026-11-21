'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge, type BadgeTone } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { Link } from '../../components/Link/Link';
import { Textarea } from '../../components/Textarea/Textarea';
import { Toaster, toast } from '../../components/Toast/Toast';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Support ticket: one request to a support team, as the person who asked sees it. Where it's got to, the
   conversation so far, and a reply box; or a way to reopen it once solved. For an app to copy. What it carries
   (WCAG 2.2):
   - 1.4.1, 1.3.1: where it's got to is a word in a badge ("Waiting on you"), with what that means in a sentence, not
     a color alone. The reference, opened and priority are named facts.
   - 1.3.1: the conversation is a list, oldest first; each message is an article named by who wrote it and when, and
     says "Support" or "You" in words, besides its picture.
   - 3.3.1, 3.3.2: the reply says what it takes; an empty one is named next to the box, which takes focus.
   - 4.1.3, 3.3.4: Send shows it's busy; a sent reply joins the list and a toast says so; one that can't be sent
     says so next to the button and keeps the words and the files.
   - 2.4.3: Mark as solved moves focus to the heading that says it's solved, with Reopen; Reopen brings the reply box
     back and focuses it.
   Sending and solving are the app's: onReply gets the words and files (reject when it can't send), onSolve and
   onReopen hear the rest. */

export type TicketState = 'open' | 'waiting' | 'solved';

export interface TicketMessage {
  id: string;
  /** "you" for the person who asked; otherwise the agent's name. */
  from: string;
  body: string;
  /** When: an ISO date and time. */
  at: string;
  /** Names of files sent with it. */
  files?: string[] | undefined;
}

export interface Ticket {
  reference: string;
  subject: string;
  state: TicketState;
  /** When it was opened: an ISO date and time. */
  opened: string;
  priority: string;
  messages: TicketMessage[];
}

export interface SupportTicketProps {
  /** The ticket. Default: a demo ticket waiting on you. */
  ticket?: Ticket | undefined;
  /** Sends a reply. Reject when it can't be sent. */
  onReply?: ((reply: { body: string; files: File[] }) => unknown) | undefined;
  /** Marks it solved. */
  onSolve?: (() => void) | undefined;
  /** Reopens it. */
  onReopen?: (() => void) | undefined;
}

const demo: Ticket = {
  reference: 'SR-30418', subject: 'Refund hasn’t arrived for order A-10432', state: 'waiting', opened: '2026-02-10T09:12:00Z', priority: 'Normal',
  messages: [
    { id: 'm1', from: 'you', body: 'I returned two items on 2 February and the tracking says they arrived, but I haven’t had the refund yet.', at: '2026-02-10T09:12:00Z' },
    { id: 'm2', from: 'Rina Wijaya', body: 'Thanks for writing. I can see the parcel arrived on 6 February. Could you send a photo of the bank statement where the refund should be, so I can check it with our payments team?', at: '2026-02-10T13:40:00Z' },
  ],
};
const STATE: Record<TicketState, { label: string; tone: BadgeTone; means: string }> = {
  open: { label: 'Open', tone: 'info', means: 'We’re looking into it, and will reply here.' },
  waiting: { label: 'Waiting on you', tone: 'warning', means: 'We’ve asked you something. Reply below, and we’ll pick it up again.' },
  solved: { label: 'Solved', tone: 'success', means: 'Closed. Reopen it within 30 days if it isn’t sorted.' },
};
const LIMIT = 4000;

/** What's wrong with a reply, in words, or null when it can be sent. */
export function replyProblem(body: string, files: readonly File[]): string | null {
  if (!body.trim() && !files.length) return 'Write a reply, or add a file.';
  if (body.length > LIMIT) return `Shorten your reply to ${LIMIT} characters.`;
  return null;
}

/** The ticket's page: a skip link, a header, then main with the h1, where it's got to, the conversation and the reply box. */
export function SupportTicket({ ticket = demo, onReply, onSolve, onReopen }: SupportTicketProps) {
  const [state, setState] = React.useState<TicketState>(ticket.state);
  const [messages, setMessages] = React.useState(ticket.messages);
  const [body, setBody] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [problem, setProblem] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const solvedHeading = React.useRef<HTMLHeadingElement>(null);
  const reply = React.useRef<HTMLTextAreaElement>(null);
  const focusNext = React.useRef<'solved' | 'reply' | null>(null);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = replyProblem(body, files);
    setProblem(found);
    if (found) { reply.current?.focus(); return; }
    setBusy(true);
    const out = { body: body.trim(), files };
    void Promise.resolve().then(() => onReply?.(out)).then(() => {
      setMessages((m) => [...m, { id: `r${m.length + 1}`, from: 'you', body: out.body, at: new Date().toISOString(), files: out.files.map((f) => f.name) }]);
      setBody(''); setFiles([]);
      if (state === 'waiting') setState('open');
      toast({ title: 'Reply sent', tone: 'success' });
    }, () => setFailed(true)).finally(() => setBusy(false));
  };
  const solve = () => { onSolve?.(); focusNext.current = 'solved'; setState('solved'); };
  const reopen = () => { onReopen?.(); focusNext.current = 'reply'; setState('open'); };
  React.useEffect(() => {
    if (focusNext.current === 'solved') solvedHeading.current?.focus();
    if (focusNext.current === 'reply') reply.current?.focus();
    focusNext.current = null;
  }, [state]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme help</p>
        <Link underline="hover" href="#tickets">Your requests</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Your requests', href: '#tickets' }, { label: ticket.reference }]} title={ticket.subject} />
        <div className="flex flex-col gap-8 pt-6">
          <Card>
            <section aria-labelledby="ticket-state" className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 id="ticket-state" className="m-0 text-lg font-semibold">Where it’s got to</h2>
                <Badge tone={STATE[state].tone}>{STATE[state].label}</Badge>
              </div>
              <p className="m-0">{STATE[state].means}</p>
              <DescriptionList>
                <DescriptionItem term="Reference">{ticket.reference}</DescriptionItem>
                <DescriptionItem term="Opened"><FormattedDate value={ticket.opened} timeStyle="short" /></DescriptionItem>
                <DescriptionItem term="Priority">{ticket.priority}</DescriptionItem>
              </DescriptionList>
            </section>
          </Card>

          <section aria-labelledby="conversation" className="flex flex-col gap-4">
            <h2 id="conversation" className="m-0 text-lg font-semibold">Conversation</h2>
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {messages.map((m) => {
                const mine = m.from === 'you';
                const who = mine ? 'You' : m.from;
                return (
                  <li key={m.id}>
                    <article aria-labelledby={`msg-${m.id}`} className="flex gap-3">
                      <Avatar name={mine ? 'You' : m.from} size="sm" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 id={`msg-${m.id}`} className="m-0 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
                          <span>{who}</span>
                          {/* Yours is named "You" already, so only the time follows; theirs says "Support" too. */}
                          <span className="font-normal text-text-muted">{mine ? null : 'Support, '}<FormattedDate value={m.at} timeStyle="short" /></span>
                        </h3>
                        <p className="m-0 whitespace-pre-line wrap-break-word">{m.body}</p>
                        {m.files?.length ? <p className="m-0 text-sm text-text-muted">Attached: {m.files.join(', ')}</p> : null}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>

          {state === 'solved' ? (
            <section aria-labelledby="solved" className="flex flex-col items-start gap-3">
              <h2 id="solved" ref={solvedHeading} tabIndex={-1} className="m-0 text-lg font-semibold outline-none">This request is solved</h2>
              <p className="m-0">If it isn’t sorted after all, reopen it and reply; it goes back to the same person.</p>
              <Button variant="secondary" onClick={reopen}>Reopen</Button>
            </section>
          ) : (
            <form onSubmit={send} noValidate aria-labelledby="reply-heading" className="flex flex-col gap-4">
              <h2 id="reply-heading" className="m-0 text-lg font-semibold">Reply</h2>
              <Field label="Your reply" id="ticket-reply" hint="We reply within 1 working day." error={problem ?? undefined}>
                <Textarea ref={reply} rows={5} maxLength={LIMIT} value={body} onChange={(e) => { setBody(e.target.value); setProblem(null); setFailed(false); }} />
              </Field>
              <Field label="Files" optional>
                <FileUpload id="ticket-files" multiple maxFiles={3} maxSize={10 * 1024 * 1024} accept="image/*,.pdf" hint="Photos or PDFs, up to 3, 10 MB each" files={files} onFilesChange={(f) => { setFiles(f); setProblem(null); }} />
              </Field>
              {failed ? <Alert tone="danger">Couldn’t send your reply. Try again; your words and files are still here.</Alert> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={busy}>Send reply</Button>
                <Button variant="ghost" disabled={busy} onClick={solve}>Mark as solved</Button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { Card } from '../../components/Card/Card';
import { announce } from '../../internal/announce';

/* Session time-out warning (PT14): warns well before a session ends, lets one action keep it, and loses nothing
   typed if it ends anyway. For an app to copy. What it carries (WCAG 2.2):
   - 2.2.1: a Dialog opens `warnBefore` seconds before the end (two minutes by default, well over the 20 seconds
     2.2.1 asks for). "Stay signed in", focused first, is the one action that extends it; Escape extends it too,
     since pressing anything means someone is there.
   - 4.1.3: the time left is said when the warning opens, then only at each whole minute and at 30 seconds, never
     every second. The countdown on screen updates every second, outside any live region.
   - 2.2.6, 3.3.7: what's typed is kept as it's typed (here in localStorage under `saveKey`), so if the session ends,
     signing in again brings it all back, and the page says so before and after.
   - 2.4.3: when the warning closes, focus goes back to where it was; when the session ends, to the "Signed out"
     heading.
   Keeping the session on the server (a request from `onExtend`), and signing in again, is the app's job. */

export interface SessionTimeoutProps {
  /** How long the session lasts with nothing done, in seconds. Default: 1200 (20 minutes). */
  duration?: number | undefined;
  /** How long before the end the warning opens, in seconds. Default: 120. */
  warnBefore?: number | undefined;
  /** "Stay signed in" was pressed: refresh the session on the server. A rejected promise lets the session run out. */
  onExtend?: (() => void | Promise<unknown>) | undefined;
  /** The session ended: sign out on the server. */
  onExpire?: (() => void) | undefined;
  /** Keeps what's typed in localStorage under this key, so it survives a sign-out or a reload. */
  saveKey?: string | undefined;
}

interface Draft { subject: string; message: string }
const TICK = 1000;

/** Words for a time left: "2 minutes", "1 minute 30 seconds", "45 seconds". */
export function timeLeft(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const unit = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
  return [m ? unit(m, 'minute') : '', s || !m ? unit(s, 'second') : ''].filter(Boolean).join(' ');
}
/** Whether the time left is worth saying: each whole minute, and 30 seconds. */
const worthSaying = (seconds: number) => seconds > 0 && (seconds % 60 === 0 || seconds === 30);

function load(key: string | undefined): Draft | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch { return null; }
}
function save(key: string | undefined, draft: Draft) {
  if (!key) return;
  try { window.localStorage.setItem(key, JSON.stringify(draft)); } catch { /* full or blocked: the draft stays in the page */ }
}

/** A page with a form, a warning Dialog before the session ends, and a signed-out page that keeps what was typed. */
export function SessionTimeout({ duration = 1200, warnBefore = 120, onExtend, onExpire, saveKey }: SessionTimeoutProps) {
  const [deadline, setDeadline] = React.useState(() => Date.now() + duration * 1000);
  const [left, setLeft] = React.useState(duration);
  const [draft, setDraft] = React.useState<Draft>(() => load(saveKey) ?? { subject: '', message: '' });
  const expired = left <= 0;
  const warning = !expired && left <= warnBefore;
  const signedOut = React.useRef<HTMLHeadingElement | null>(null);

  React.useEffect(() => {
    if (expired) return;
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setLeft(next);
      if (!next) onExpire?.();
    }, TICK);
    return () => window.clearInterval(id);
  }, [deadline, expired, onExpire]);

  // Say the time left when the warning opens, then only at sensible steps.
  const opened = React.useRef(false);
  React.useEffect(() => {
    if (!warning) { opened.current = false; return; }
    if (!opened.current) { opened.current = true; announce(`You'll be signed out in ${timeLeft(left)}.`); }
    else if (worthSaying(left)) announce(`${timeLeft(left)} left.`);
  }, [warning, left]);

  React.useEffect(() => { if (expired) signedOut.current?.focus(); }, [expired]);

  const signOut = () => { setLeft(0); onExpire?.(); };
  const restart = () => { setDeadline(Date.now() + duration * 1000); setLeft(duration); };
  const extend = async () => {
    try { await onExtend?.(); restart(); announce("You're still signed in."); } catch { /* the session runs out as warned */ }
  };
  const type = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...draft, [k]: e.target.value };
    setDraft(next);
    save(saveKey, next);
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 outline-none">
        {expired ? (
          <div className="flex flex-col gap-3">
            <Heading level={1} ref={signedOut} tabIndex={-1} className="outline-none">You've been signed out</Heading>
            <p className="m-0">We signed you out because nothing happened for {timeLeft(duration)}. What you typed is kept: sign in again to carry on where you left off.</p>
            <div><Button onClick={restart}>Sign in again</Button></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Heading level={1}>Contact support</Heading>
              <p className="m-0 text-text-muted">For your security, you're signed out after {timeLeft(duration)} with nothing happening. We'll warn you first, and keep what you've typed.</p>
            </div>
            <Card as="section" aria-labelledby="message-title" className="flex flex-col gap-4">
              <Heading level={2} id="message-title">Your message</Heading>
              <Field label="Subject">
                <Input name="subject" value={draft.subject} onChange={type('subject')} />
              </Field>
              <Field label="Message" hint="What happened, and what you expected.">
                <Textarea name="message" rows={6} value={draft.message} onChange={type('message')} />
              </Field>
              <div><Button>Send message</Button></div>
            </Card>
          </>
        )}
      </main>
      <Dialog open={warning} alert size="sm" title="You'll be signed out soon"
        onOpenChange={(open) => { if (!open) void extend(); }}
        footer={<>
          <Button variant="secondary" onClick={signOut}>Sign out</Button>
          <Button data-autofocus onClick={() => void extend()}>Stay signed in</Button>
        </>}>
        <p className="m-0">You'll be signed out in <strong>{timeLeft(left)}</strong> because nothing has happened for a while.</p>
        <p className="m-0 mt-2 text-sm text-text-muted">What you've typed is kept either way.</p>
      </Dialog>
    </div>
  );
}

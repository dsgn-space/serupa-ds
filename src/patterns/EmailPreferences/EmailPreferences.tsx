'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Card } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Switch } from '../../components/Switch/Switch';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Email preferences: the page an email's "Manage emails" or "Unsubscribe" link opens, with no sign-in. Which emails
   come, each one a switch that says what it is and how often, and one button to stop them all. For an app to copy.
   What it carries (WCAG 2.2):
   - 1.3.1, 3.3.2: the address it's about is said first; each kind of email is a switch named by what it is, with how
     often it comes as its description.
   - Ethical design: stopping every email is one button, beside Save, and asks no "Are you sure?"; it
     takes effect at once and the answer says how to undo it.
   - 4.1.3, 3.3.4: Save shows it's busy and says what changed once saved; one that fails says so next to the button
     and keeps the switches as set.
   - 2.4.3: after "Stop all emails", the answer's heading takes focus, with "Turn them back on".
   - The emails that can't be turned off (receipts, security) are named in a sentence, not as switches that can't be
     switched.
   Saving is the app's job: onSave gets every topic's choice; reject when it can't be saved. */

export interface EmailTopic {
  id: string;
  label: string;
  /** How often it comes, and what's in it: "Weekly: what's new in the shop". */
  about: string;
  on: boolean;
}

export interface EmailPreferencesProps {
  /** The address the link was sent to. Default: a demo address. */
  email?: string | undefined;
  /** The kinds of email. Default: demo topics. */
  topics?: EmailTopic[] | undefined;
  /** Saves the choices, by topic id. Reject when they can't be saved. */
  onSave?: ((choices: Record<string, boolean>) => unknown) | undefined;
}

const demo: EmailTopic[] = [
  { id: 'news', label: 'News and offers', about: 'Weekly: what’s new in the shop, and sales before anyone else.', on: true },
  { id: 'back', label: 'Back in stock', about: 'When something you saved can be bought again.', on: true },
  { id: 'tips', label: 'Tips for what you bought', about: 'Now and then: how to look after it, and what goes with it.', on: false },
  { id: 'survey', label: 'Surveys', about: 'A few times a year: tell us how we’re doing.', on: true },
];

/** What changed between two sets of choices, as the names turned on and off. */
export function emailChanges(topics: readonly EmailTopic[], before: Record<string, boolean>, after: Record<string, boolean>): { on: string[]; off: string[] } {
  return {
    on: topics.filter((t) => !before[t.id] && after[t.id]).map((t) => t.label),
    off: topics.filter((t) => before[t.id] && !after[t.id]).map((t) => t.label),
  };
}

/** Changes in words: "Turned on Surveys. Turned off News and offers.", or "Nothing changed." */
export function changeWords(c: { on: string[]; off: string[] }): string {
  const parts = [c.on.length ? `Turned on ${c.on.join(', ')}.` : '', c.off.length ? `Turned off ${c.off.join(', ')}.` : ''].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Nothing changed.';
}

const choicesOf = (topics: readonly EmailTopic[]) => Object.fromEntries(topics.map((t) => [t.id, t.on]));

/** The email preferences page: a skip link, a header, then main with the h1, the address, the switches, Save and Stop all. */
export function EmailPreferences({ email = 'ana@example.com', topics = demo, onSave }: EmailPreferencesProps) {
  const [saved, setSaved] = React.useState<Record<string, boolean>>(() => choicesOf(topics));
  const [choices, setChoices] = React.useState<Record<string, boolean>>(() => choicesOf(topics));
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [stopped, setStopped] = React.useState<Record<string, boolean> | null>(null);
  const [said, setSaid] = React.useState('');
  const answer = React.useRef<HTMLHeadingElement>(null);
  const focusFirst = React.useRef(false);
  const page = React.useRef<HTMLElement>(null);

  const save = (next: Record<string, boolean>) => Promise.resolve().then(() => onSave?.(next));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false); setBusy(true); setSaid('');
    const next = { ...choices };
    void save(next).then(() => {
      const words = changeWords(emailChanges(topics, saved, next));
      setSaved(next); setSaid(words);
    }, () => setFailed(true)).finally(() => setBusy(false));
  };
  const stopAll = () => {
    setFailed(false);
    const none = Object.fromEntries(topics.map((t) => [t.id, false]));
    setBusy(true);
    void save(none).then(() => { setStopped(saved); setSaved(none); setChoices(none); }, () => setFailed(true)).finally(() => setBusy(false));
  };
  const turnBack = () => {
    const back = stopped!;
    setBusy(true);
    void save(back).then(() => { focusFirst.current = true; setSaved(back); setChoices(back); setStopped(null); setSaid(''); }, () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => {
    if (stopped) answer.current?.focus();
    else if (focusFirst.current) { focusFirst.current = false; page.current?.querySelector<HTMLInputElement>('[role="switch"]')?.focus(); }
  }, [stopped]);

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#shop">Go to the shop</Link>
      </header>
      <main ref={page} id="main" className="mx-auto flex max-w-xl flex-col px-4 py-10 outline-none">
        <PageHeader title="Emails from Acme" description={`Choose what comes to ${email}. Changes take effect within a day.`} />
        <Card padding="lg" className="mt-6">
          {stopped ? (
            <section aria-labelledby="stopped" className="flex flex-col items-start gap-3">
              <h2 id="stopped" ref={answer} tabIndex={-1} className="m-0 text-xl font-semibold outline-none">You won’t get these emails any more</h2>
              <p className="m-0">We’ll still send receipts, delivery updates and security alerts, as they’re about orders and your account.</p>
              {failed ? <Alert tone="danger">Couldn’t turn them back on. Try again.</Alert> : null}
              <Button variant="secondary" loading={busy} onClick={turnBack}>Turn them back on</Button>
            </section>
          ) : (
            <form onSubmit={submit} aria-labelledby="choose" className="flex flex-col gap-4">
              <h2 id="choose" className="m-0 text-lg font-semibold">What we send</h2>
              <div className="flex flex-col gap-4">
                {topics.map((t) => (
                  <Switch key={t.id} checked={!!choices[t.id]} description={t.about}
                    onCheckedChange={(on) => { setChoices((c) => ({ ...c, [t.id]: on })); setSaid(''); setFailed(false); }}>
                    {t.label}
                  </Switch>
                ))}
              </div>
              <p className="m-0 text-sm text-text-muted">Receipts, delivery updates and security alerts always come, as they’re about your orders and your account.</p>
              {failed ? <Alert tone="danger">Couldn’t save your choices. Try again; they’re still set as you left them.</Alert> : null}
              <div className="flex flex-wrap gap-x-2 gap-y-3">
                <Button type="submit" loading={busy}>Save choices</Button>
                <Button variant="secondary" disabled={busy} onClick={stopAll}>Stop all emails</Button>
                <p id="email-saved" role="status" className="m-0 self-center">{said ? `Saved. ${said}` : ''}</p>
              </div>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}

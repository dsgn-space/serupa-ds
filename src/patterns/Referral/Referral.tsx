'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Badge, type BadgeTone } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { Toaster, toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { StatsRow } from '../../blocks/StatsRow/StatsRow';

/* Referral: invite friends with your own link or by email, and see who joined and what you've earned. For an app to
   copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: the link is a read-only field labelled "Your invite link", with a Copy button that names what it
     copies and says "Copied" when it has (4.1.3).
   - 3.3.2: the email box says how to separate addresses; 3.3.1: a bad one is named next to it, and one already
     invited is said so, before anything is sent.
   - 3.3.4, 4.1.3: Send shows it's busy, and a toast says how many were sent; a send that fails says so next to the
     button and keeps the addresses.
   - 1.3.1, 1.4.1: who you've invited is a table with a caption; where each is ("Invited", "Joined", "Earned you $10")
     is said in words in a badge, not by color alone.
   - The rules are said in a sentence before the link: what each of you gets, and when.
   The invites are the app's: onInvite gets the addresses; reject its promise when they can't be sent. */

export type ReferralState = 'invited' | 'joined' | 'rewarded';

export interface ReferralInvite {
  email: string;
  state: ReferralState;
  /** When they were invited: "2025-03-04". */
  invited: string;
}

export interface ReferralProps {
  /** Your invite link. Default: a demo link. */
  link?: string | undefined;
  /** What each of you gets, in the currency's units. Default: 10. */
  reward?: number | undefined;
  /** ISO 4217 currency. Default: "USD". */
  currency?: string | undefined;
  /** Who you've invited, newest first. Default: demo invites. */
  referrals?: ReferralInvite[] | undefined;
  /** Sends invites. Reject its promise when they can't be sent. */
  onInvite?: ((emails: string[]) => unknown) | undefined;
}

const demo: ReferralInvite[] = [
  { email: 'chen@example.com', state: 'rewarded', invited: '2025-02-11' },
  { email: 'dewi@example.com', state: 'joined', invited: '2025-02-26' },
  { email: 'eko@example.com', state: 'invited', invited: '2025-03-02' },
];
const STATE: Record<ReferralState, { label: string; tone: BadgeTone }> = {
  invited: { label: 'Invited', tone: 'neutral' },
  joined: { label: 'Joined', tone: 'info' },
  rewarded: { label: 'Earned you', tone: 'success' },
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The addresses in text, split at commas, semicolons, spaces and new lines, lowercased, once each. */
export const addressesIn = (text: string): string[] => [...new Set(text.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];

/** What's wrong with these addresses, in words, or null when they can all be invited. */
export function referralProblem(emails: readonly string[], invited: readonly string[]): string | null {
  if (!emails.length) return 'Enter at least one email address.';
  const bad = emails.filter((e) => !EMAIL.test(e));
  if (bad.length) return `${bad.length === 1 ? 'This isn’t an email address' : 'These aren’t email addresses'}: ${bad.join(', ')}.`;
  const again = emails.filter((e) => invited.includes(e));
  if (again.length) return `Already invited: ${again.join(', ')}.`;
  return null;
}

/** The referral page: a skip link, a header, then main with the h1, the totals, the link, the invite form and the invites. */
export function Referral({ link = 'https://acme.example/r/ana-7k2', reward = 10, currency = 'USD', referrals = demo, onInvite }: ReferralProps) {
  const locale = useLocale();
  const [list, setList] = React.useState(referrals);
  const focusing = React.useRef(false);   // the press that focuses the link field
  const [text, setText] = React.useState('');
  const [problem, setProblem] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency, maximumFractionDigits: 0 });
  const joined = list.filter((r) => r.state !== 'invited').length;
  const earned = list.filter((r) => r.state === 'rewarded').length * reward;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = addressesIn(text);
    const found = referralProblem(emails, list.map((r) => r.email));
    setProblem(found);
    setFailed(false);
    if (found) { document.getElementById('referral-emails')?.focus(); return; }
    setBusy(true);
    void Promise.resolve().then(() => onInvite?.(emails)).then(() => {
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setList((l) => [...emails.map((email) => ({ email, state: 'invited' as const, invited: iso })), ...l]);
      setText('');
      toast({ title: emails.length === 1 ? `Invite sent to ${emails[0]!}` : `${formatNumber(emails.length, locale)} invites sent`, tone: 'success' });
    }, () => setFailed(true)).finally(() => setBusy(false));
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Account', href: '#account' }, { label: 'Invite friends' }]} title="Invite friends"
          description={`Give ${money(reward)}, get ${money(reward)}. A friend gets ${money(reward)} off their first order, and you get ${money(reward)} in credit once it ships.`} />
        <div className="flex flex-col gap-8 pt-6">
          <StatsRow title="So far" stats={[
            { label: 'Invited', value: formatNumber(list.length, locale) },
            { label: 'Joined', value: formatNumber(joined, locale) },
            { label: 'Earned', value: money(earned) },
          ]} />

          <Card>
            <section aria-labelledby="share" className="flex flex-col gap-4">
              <h2 id="share" className="m-0 text-lg font-semibold">Share your link</h2>
              <div className="flex flex-wrap items-end gap-2">
                <Field label="Your invite link" id="referral-link" className="min-w-0 flex-1">
                  {/* Safari puts the caret where the click lands on the mouseup after focus, which undid the select-all: that
                      one mouseup is passed over. */}
                  <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()}
                    onMouseDown={(e) => { focusing.current = document.activeElement !== e.currentTarget; }}
                    onMouseUp={(e) => { if (focusing.current) e.preventDefault(); focusing.current = false; }} />
                </Field>
                <CopyButton value={link} copiedLabel="Copied" size="md">Copy link</CopyButton>
              </div>
              <form onSubmit={send} noValidate aria-label="Invite by email" className="flex flex-col items-start gap-3">
                <Field label="Or invite by email" id="referral-emails" hint="Separate addresses with commas or new lines." error={problem ?? undefined} className="w-full">
                  <Textarea rows={3} autoComplete="off" value={text} onChange={(e) => { setText(e.target.value); if (problem) setProblem(null); setFailed(false); }} />
                </Field>
                {failed ? <Alert tone="danger">Couldn’t send the invites. Try again; the addresses are still here.</Alert> : null}
                <Button type="submit" loading={busy}>Send invites</Button>
              </form>
            </section>
          </Card>

          <section aria-labelledby="invited" className="flex flex-col gap-4">
            <h2 id="invited" className="m-0 text-lg font-semibold">Who you’ve invited</h2>
            {list.length ? (
              <Table caption="Friends you’ve invited, newest first" hideCaption>
                <TableHead><TableRow>
                  <TableHeaderCell>Friend</TableHeaderCell>
                  <TableHeaderCell>Invited</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow></TableHead>
                <TableBody>{list.map((r) => (
                  <TableRow key={r.email}>
                    <TableCell className="wrap-break-word">{r.email}</TableCell>
                    <TableCell className="whitespace-nowrap"><FormattedDate value={r.invited} /></TableCell>
                    <TableCell><Badge tone={STATE[r.state].tone}>{r.state === 'rewarded' ? `${STATE.rewarded.label} ${money(reward)}` : STATE[r.state].label}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            ) : <p className="m-0 text-text-muted">Nobody yet. Friends you invite show here, with where they’ve got to.</p>}
          </section>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

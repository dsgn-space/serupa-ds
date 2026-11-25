'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { Meter } from '../../components/Meter/Meter';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { ErrorSummary } from '../../components/ErrorSummary/ErrorSummary';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { formatDate } from '../../components/FormattedDate/FormattedDate';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Poll: one question, a few answers, a vote, then the results so far, with yours marked, and a way to change it while
   it's open. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the answers are a group of radios named by the question; the results are a list, each answer a meter
     named by the answer, its value in words ("12 votes, 40%"), never the bar's length alone (1.4.1).
   - 3.3.2: it says when it closes and whether votes are anonymous, before you vote.
   - 3.3.1, 2.4.3: voting without an answer shows a summary that takes focus, its link landing on the first answer.
   - 3.3.4, 4.1.3: Vote shows it's busy; a vote that can't be sent says so and keeps your answer.
   - 2.4.3: once voted, the results' heading takes focus; Change your vote brings back the answers, yours chosen.
   Counting is the app's job: onVote gets the answer and resolves with the new counts. */

export interface PollOption { id: string; label: string }

export interface PollProps {
  question?: string | undefined;
  options?: PollOption[] | undefined;
  /** Votes so far, by option id. */
  counts?: Record<string, number> | undefined;
  /** The option you voted for, if you have. */
  defaultVote?: string | undefined;
  /** When it closes, as an ISO date. */
  closes?: string | undefined;
  /** Closed: results only. */
  closed?: boolean | undefined;
  /** Sends the vote; resolves with the new counts, or rejects when it can't be sent. Default: counts it here. */
  onVote?: ((id: string, previous: string | undefined) => Promise<Record<string, number>> | Record<string, number>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoOptions: PollOption[] = [
  { id: 'beach', label: 'A day at the beach' },
  { id: 'boat', label: 'A boat trip on the river' },
  { id: 'garden', label: 'Barbecue in the office garden' },
  { id: 'escape', label: 'Escape rooms, then dinner' },
];
const demoCounts = { beach: 9, boat: 14, garden: 5, escape: 2 };

/** Each option's votes and its share in whole percent, the shares adding up to 100 (largest remainders get the rest). */
export function pollResults(options: PollOption[], counts: Record<string, number>) {
  const votes = options.map((o) => counts[o.id] ?? 0);
  const total = votes.reduce((a, b) => a + b, 0);
  if (!total) return { total, rows: options.map((o) => ({ ...o, votes: 0, percent: 0 })) };
  const exact = votes.map((v) => (v * 100) / total);
  const percent = exact.map(Math.floor);
  const order = exact.map((e, i) => [e - Math.floor(e), i] as const).sort((a, b) => b[0] - a[0]);
  for (let left = 100 - percent.reduce((a, b) => a + b, 0), k = 0; left > 0; left--, k++) percent[order[k]![1]]! += 1;
  return { total, rows: options.map((o, i) => ({ ...o, votes: votes[i]!, percent: percent[i]! })) };
}

/** The counts after a vote for `id`, taken from `previous` when it's a change. */
export function recount(counts: Record<string, number>, id: string, previous?: string) {
  const next = { ...counts };
  if (previous === id) return next;
  next[id] = (next[id] ?? 0) + 1;
  if (previous) next[previous] = Math.max(0, (next[previous] ?? 0) - 1);
  return next;
}

/** The poll page: a skip link, a header, then main with the h1, and the answers or the results. */
export function Poll({ question = 'Where should the summer party be?', options = demoOptions, counts: startCounts = demoCounts,
  defaultVote, closes = '2026-06-20', closed = false, onVote, online }: PollProps) {
  const locale = useLocale();
  const [counts, setCounts] = React.useState(startCounts);
  const [vote, setVote] = React.useState(defaultVote);
  const [choice, setChoice] = React.useState(defaultVote ?? '');
  const [voting, setVoting] = React.useState(!defaultVote && !closed);
  const [tries, setTries] = React.useState(0);
  const [missing, setMissing] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const shown = React.useRef(false);
  const results = React.useRef<HTMLHeadingElement>(null);
  const { total, rows } = pollResults(options, counts);
  const closeDay = formatDate(closes, locale, { options: { day: 'numeric', month: 'long' } });
  const votesWords = (n: number) => (n === 1 ? '1 vote' : `${formatNumber(n, locale)} votes`);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    setTries((t) => t + 1);
    setMissing(!choice);
    if (!choice) return;
    setBusy(true);
    void Promise.resolve().then(() => onVote?.(choice, vote) ?? recount(counts, choice, vote)).then((next) => {
      setCounts(next); setVote(choice); setVoting(false); shown.current = true;
    }, () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (!voting && shown.current) results.current?.focus(); }, [voting]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#polls">Polls</Link>
      </header>
      <Container as="main" size="prose" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">These results are from when the page loaded. Voting needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Polls', href: '#polls' }, { label: question }]} title={question}
            description={closed ? 'This poll has closed.' : `Open until ${closeDay}. Others see the totals, not who voted for what.`} />
          <div className="flex flex-col gap-6 pt-6">
            {voting ? (
              <form onSubmit={send} noValidate aria-label="Your vote" className="flex flex-col gap-4">
                <ErrorSummary key={tries} errors={missing ? [{ field: 'poll-choice', message: 'Choose an answer.' }] : []} />
                <Field label="Your answer" group error={missing ? 'Choose an answer.' : undefined} required>
                  <RadioGroup id="poll-choice" name="poll-choice" value={choice} onValueChange={(v: string) => { setChoice(v); setMissing(false); setFailed(false); }}>
                    {options.map((o) => <Radio key={o.id} value={o.id}>{o.label}</Radio>)}
                  </RadioGroup>
                </Field>
                <div className="flex flex-col items-start gap-3">
                  {failed ? <Alert tone="danger">Couldn’t send your vote. Try again; your answer is still chosen.</Alert> : null}
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" loading={busy}>{vote ? 'Change vote' : 'Vote'}</Button>
                    {vote ? <Button variant="secondary" onClick={() => { setChoice(vote); setMissing(false); setFailed(false); shown.current = true; setVoting(false); }}>Keep my vote</Button> : null}
                  </div>
                </div>
              </form>
            ) : (
              <section aria-labelledby="poll-results" className="flex flex-col items-start gap-4">
                <h2 id="poll-results" ref={results} tabIndex={-1} className="m-0 text-lg font-semibold outline-none">
                  {closed ? 'Results' : 'Results so far'}
                </h2>
                <p className="m-0 text-text-muted">{votesWords(total)} in all.{vote ? ` You voted for “${options.find((o) => o.id === vote)?.label}”.` : ''}</p>
                <ul className="m-0 flex w-full list-none flex-col gap-4 p-0">
                  {rows.map((r) => (
                    <li key={r.id}>
                      <Card padding="sm" className="flex flex-col gap-2">
                        {r.id === vote ? <Badge tone="info" className="self-start">Your vote</Badge> : null}
                        <Meter label={r.label} showValue value={r.percent} max={100}
                          formatValue={() => `${votesWords(r.votes)}, ${formatNumber(r.percent / 100, locale, { style: 'percent' })}`} />
                      </Card>
                    </li>
                  ))}
                </ul>
                {!closed ? <Button variant="secondary" onClick={() => { setChoice(vote ?? ''); setVoting(true); }}>Change your vote</Button> : null}
              </section>
            )}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

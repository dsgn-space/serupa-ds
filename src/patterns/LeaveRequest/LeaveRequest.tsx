'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Badge, type BadgeTone } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Textarea } from '../../components/Textarea/Textarea';
import { RangeCalendar } from '../../components/RangeCalendar/RangeCalendar';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Loader } from '../../components/Loader/Loader';
import { Toaster, toast } from '../../components/Toast/Toast';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Leave request: time off asked for on a calendar, with the working days counted, weekends and holidays shown and
   left out of the count, and the balance that's left. For an app to copy. What it carries (WCAG 2.2):
   - 1.4.1, 1.3.1: weekends and holidays are struck through and can't start or end the leave; the holidays in view are
     also listed in words with their names, and the ones inside the leave are named next to the count.
   - 1.3.1: the balance is a description list in words: what's left, what's waiting for approval and what's left after.
   - 3.3.1, 4.1.3: annual leave longer than what's left is said at once in an alert the calendar points to, with the
     numbers and a way out (fewer days, or unpaid leave); Send with no dates says what to choose and puts focus on the
     calendar.
   - 3.3.4, 4.1.3: Send shows it's busy and adds the request only once the server says so; one that fails says so next
     to the button and keeps what was chosen.
   - 4.1.3, 2.4.3: a sent request goes to the top of "Your requests" as waiting for approval, a toast says so, and focus
     goes to it.
   - 1.4.1: each request's state is a word (Waiting, Approved, Declined), not only a color.
   - 4.1.3, 3.3.1: while the balance loads, a placeholder named once; a failed load says so, with Try again.
   Sending is the app's job: onSubmit gets the request; reject its promise when it can't be sent. */

export type LeaveKind = 'annual' | 'unpaid';
export interface LeaveHoliday {
  /** The day, as "yyyy-mm-dd". */
  date: string;
  /** Its name: "Eid al-Fitr". */
  name: string;
}
export interface LeaveRequestItem {
  id: string;
  kind: LeaveKind;
  /** The first and the last day away, as "yyyy-mm-dd". */
  start: string;
  end: string;
  /** The working days it takes. */
  days: number;
  status: 'waiting' | 'approved' | 'declined';
}
/** A request from the form, before it's sent. */
export interface LeaveDraft {
  kind: LeaveKind;
  start: string;
  end: string;
  days: number;
  /** A note for the approver. May be empty. */
  note: string;
}

export interface LeaveRequestProps {
  /** Days of annual leave left, before the requests still waiting. Default: 12. */
  balance?: number | undefined;
  /** Public holidays, which aren't counted. Default: the demo's. */
  holidays?: readonly LeaveHoliday[] | undefined;
  /** The days of the week that aren't worked, 0 Sunday … 6 Saturday. Default: [0, 6]. */
  weekend?: readonly number[] | undefined;
  /** Requests already made, newest first. Default: the demo's. */
  requests?: readonly LeaveRequestItem[] | undefined;
  /** The earliest day leave can start, as "yyyy-mm-dd". Pass today's. Default: "2025-03-10", for the demo. */
  today?: string | undefined;
  /** Sends the request. Return its promise: a rejection keeps the form and says the request wasn't sent. */
  onSubmit?: ((draft: LeaveDraft) => unknown) | undefined;
  /** The balance is on its way from the server: placeholders, named once ("Loading leave"). Default: false. */
  loading?: boolean | undefined;
  /** The balance failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the balance again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoHolidays: LeaveHoliday[] = [
  { date: '2025-03-31', name: 'Eid al-Fitr' }, { date: '2025-04-01', name: 'Eid al-Fitr, second day' }, { date: '2025-04-18', name: 'Good Friday' },
];
const demoRequests: LeaveRequestItem[] = [
  { id: 'r2', kind: 'annual', start: '2025-05-12', end: '2025-05-16', days: 5, status: 'waiting' },
  { id: 'r1', kind: 'annual', start: '2025-02-03', end: '2025-02-04', days: 2, status: 'approved' },
];
const KINDS: { value: LeaveKind; label: string; hint: string }[] = [
  { value: 'annual', label: 'Annual leave', hint: 'Paid, and taken from what you have left.' },
  { value: 'unpaid', label: 'Unpaid leave', hint: 'Not paid, and doesn’t touch what you have left.' },
];
const STATUS: Record<LeaveRequestItem['status'], { label: string; tone: BadgeTone }> = {
  waiting: { label: 'Waiting', tone: 'warning' }, approved: { label: 'Approved', tone: 'success' }, declined: { label: 'Declined', tone: 'danger' },
};

// A "yyyy-mm-dd" day at local midnight, the day n days on from d, and a day as "yyyy-mm-dd".
const day = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y!, m! - 1, d); };
const shift = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The working days from the first day to the last, both in, as "yyyy-mm-dd": weekends and holidays left out. */
export function workingDays(start: string, end: string, rest: { holidays?: readonly LeaveHoliday[] | undefined; weekend?: readonly number[] | undefined } = {}): string[] {
  const off = new Set((rest.holidays ?? []).map((h) => h.date)), weekend = rest.weekend ?? [0, 6];
  const out: string[] = [];
  for (let d = day(start), last = day(end); d <= last; d = shift(d, 1)) {
    if (!weekend.includes(d.getDay()) && !off.has(iso(d))) out.push(iso(d));
  }
  return out;
}

/** What's wrong with the request, as a sentence, or null when it can be sent. */
export function leaveProblem(range: { start: string; end: string } | null, kind: LeaveKind, days: number, left: number): string | null {
  if (!range) return 'Choose the first and the last day you’ll be away.';
  if (kind === 'annual' && days > left) return `That’s ${days} working days, and you have ${left} left. Choose fewer days, or ask for unpaid leave.`;
  return null;
}

const dayWords = (locale: string | undefined, a: string, b?: string, weekday = false) => {
  const f = new Intl.DateTimeFormat(locale, weekday ? { weekday: 'short', month: 'short', day: 'numeric', calendar: 'gregory', numberingSystem: 'latn' } : { dateStyle: 'medium', calendar: 'gregory', numberingSystem: 'latn' });
  return (b && b !== a ? f.formatRange(day(a), day(b)) : f.format(day(a))).replace(/[\u2009\u202f]/g, ' ');
};

/** The leave page: a skip link, a header, then main with the h1, the balance, the request form and the requests. */
export function LeaveRequest({ balance = 12, holidays = demoHolidays, weekend = [0, 6], requests: first = demoRequests, today = '2025-03-10', onSubmit, loading = false, loadFailed = false, onRetry, online }: LeaveRequestProps) {
  const locale = useLocale(undefined);
  const [requests, setRequests] = React.useState(first);
  // The kind radios' name is this form's own, so two leave requests on a page don't share one group.
  const kindName = React.useId();
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setRequests(first); } }
  const [kind, setKind] = React.useState<LeaveKind>('annual');
  const [range, setRange] = React.useState<{ start: string; end: string } | null>(null);
  const [note, setNote] = React.useState('');
  const [asked, setAsked] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const calendar = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const [month, setMonth] = React.useState(() => day(today));

  const off = React.useMemo(() => new Set(holidays.map((h) => h.date)), [holidays]);
  const closed = React.useCallback((d: Date) => weekend.includes(d.getDay()) || off.has(iso(d)), [weekend, off]);
  const waiting = requests.filter((r) => r.status === 'waiting' && r.kind === 'annual').reduce((n, r) => n + r.days, 0);
  const left = balance - waiting;
  const days = range ? workingDays(range.start, range.end, { holidays, weekend }).length : 0;
  const problem = leaveProblem(range, kind, days, left);
  const shownProblem = range || asked ? problem : null;
  const inside = range ? holidays.filter((h) => h.date >= range.start && h.date <= range.end) : [];
  // The holidays in the two months shown.
  const from = iso(new Date(month.getFullYear(), month.getMonth(), 1)), to = iso(new Date(month.getFullYear(), month.getMonth() + 2, 0));
  const inView = holidays.filter((h) => h.date >= from && h.date <= to);
  const count = (n: number) => `${formatNumber(n, locale)} ${n === 1 ? 'day' : 'days'}`;

  const send = () => {
    setFailed(false);
    if (problem || !range) {
      setAsked(true);
      calendar.current?.querySelector<HTMLElement>('.srp-calendar__day[tabindex="0"]')?.focus();
      return;
    }
    const draft: LeaveDraft = { kind, ...range, days, note: note.trim() };
    setBusy(true);
    void Promise.resolve().then(() => onSubmit?.(draft)).then(() => {
      setRequests((rs) => [{ id: `new-${draft.start}-${rs.length}`, kind, start: draft.start, end: draft.end, days, status: 'waiting' }, ...rs]);
      setRange(null);
      setNote('');
      setAsked(false);
      toast({ title: `Leave requested: ${dayWords(locale, draft.start, draft.end)}`, description: 'Your manager will approve or decline it.', tone: 'success' });
      // The form is cleared, so focus goes to the new request.
      requestAnimationFrame(() => list.current?.querySelector<HTMLElement>('li')?.focus());
    }, () => setFailed(true)).finally(() => setBusy(false));
  };

  const h2 = 'm-0 text-lg font-semibold';
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme People</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">Your request stays here. Sending it needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Time off', href: '#time-off' }, { label: 'Request leave' }]} title="Request leave" />

        <div className="pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load your leave" onRetry={() => onRetry?.()} headingLevel={2} />
            : loading ? <Card><Loader variant="skeleton" shape="text" lines={6} label="Loading leave" /></Card> : (
              <div className="grid items-start gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-8 md:col-span-2">
                  <Field label="Kind of leave" group>
                    <RadioGroup name={kindName} value={kind} onValueChange={(v: LeaveKind) => { setKind(v); setFailed(false); }}>
                      {KINDS.map((k) => <Radio key={k.value} value={k.value} description={k.hint}>{k.label}</Radio>)}
                    </RadioGroup>
                  </Field>
                  <section aria-labelledby="dates" className="flex flex-col gap-4">
                    <h2 id="dates" className={h2}>Dates</h2>
                    <p className="m-0 text-sm text-text-muted">Choose your first day away, then your last. Weekends and holidays are struck through and aren’t counted.</p>
                    <RangeCalendar ref={calendar} aria-labelledby="dates" aria-describedby={shownProblem ? 'leave-problem' : undefined} months={2}
                      month={month} onMonthChange={setMonth} min={today} isDateDisabled={closed} value={range}
                      onValueChange={(_, { iso }) => { setFailed(false); setRange(iso); }} />
                    {range ? (
                      <p className="m-0 font-semibold">
                        {formatNumber(days, locale)} working {days === 1 ? 'day' : 'days'}{inside.length ? <span className="font-normal">, without {inside.map((h) => `${h.name} (${dayWords(locale, h.date)})`).join(', ')}</span> : null}
                      </p>
                    ) : null}
                    {shownProblem ? <Alert id="leave-problem" tone="danger">{shownProblem}</Alert> : null}
                    {inView.length ? (
                      <div className="flex flex-col gap-1">
                        <h3 id="holidays" className="m-0 text-base font-semibold">Holidays</h3>
                        <ul aria-labelledby="holidays" className="m-0 flex flex-col gap-1 ps-5">
                          {inView.map((h) => <li key={h.date}><time dateTime={h.date}>{dayWords(locale, h.date, undefined, true)}</time>: {h.name}</li>)}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                  <Field label="Note for your manager" optional>
                    <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                  </Field>
                  <div className="flex flex-col items-start gap-3">
                    {failed ? <Alert tone="danger">Couldn’t send the request. Try again.</Alert> : null}
                    <Button loading={busy} onClick={send}>Send request</Button>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <Card>
                    <section aria-labelledby="balance" className="flex flex-col gap-4">
                      <h2 id="balance" className={h2}>Annual leave</h2>
                      <DescriptionList layout="split">
                        <DescriptionItem term="You have">{count(balance)}</DescriptionItem>
                        <DescriptionItem term="Waiting for approval">{count(waiting)}</DescriptionItem>
                        <DescriptionItem term="Left after those" emphasis>{count(left)}</DescriptionItem>
                      </DescriptionList>
                    </section>
                  </Card>
                  <section aria-labelledby="mine" className="flex flex-col gap-4">
                    <h2 id="mine" className={h2}>Your requests</h2>
                    {requests.length ? (
                      <ul ref={list} aria-labelledby="mine" className="m-0 flex list-none flex-col gap-2 p-0">
                        {requests.map((r) => (
                          <li key={r.id} tabIndex={-1} className="flex flex-col gap-1 rounded-md border border-border p-3">
                            <span className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-medium">{dayWords(locale, r.start, r.end)}</span>
                              <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                            </span>
                            <span className="text-sm text-text-muted">{KINDS.find((k) => k.value === r.kind)!.label}, {count(r.days)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="m-0 text-text-muted">No requests yet.</p>}
                  </section>
                </div>
              </div>
            )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

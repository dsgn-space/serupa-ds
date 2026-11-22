'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Link } from '../../components/Link/Link';
import { Card } from '../../components/Card/Card';
import { Meter } from '../../components/Meter/Meter';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { Textarea } from '../../components/Textarea/Textarea';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Event registration: what, when and where an event is, how many places are left, and a short form to get tickets,
   or to join the waiting list once it's full. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: when and where are named facts; the time says its time zone, so nobody turns up an hour out.
   - 1.4.1, 1.3.1: places left are a meter with its number in words beside it, not a bar alone.
   - 3.3.2, 1.3.5: each ticket type says its price and who it's for; how many tickets says its limit, and the total
     is worked out as you choose. Name and email say what they are for autofill. What would make it easier to come is
     asked for, optional.
   - 3.3.1, 2.4.3: registering with problems shows a summary at the top that takes focus, each problem a link to its
     field.
   - 3.3.4, 4.1.3: Register shows it's busy; a registration that can't be sent says so next to the button and keeps
     every field.
   - 2.4.3: once registered, the answer's heading takes focus, with the tickets, the total, and a link to add it to a
     calendar.
   Registering is the app's job: onRegister gets the registration; reject when it can't be sent. */

export interface EventDetails {
  title: string;
  /** Starts, as an ISO date and time with its offset: "2026-03-12T18:30:00+07:00". */
  start: string;
  /** Ends, the same way. */
  end: string;
  /** The event's IANA time zone, which its times are shown in: "Asia/Jakarta". */
  timeZone: string;
  /** That time zone's name for people: "Jakarta time (UTC+7)". */
  zone: string;
  place: string;
  /** Places in all, and places taken. */
  capacity: number;
  taken: number;
  tickets: { value: string; label: string; price: number; who: string }[];
}

export interface Registration {
  ticket: string;
  count: number;
  name: string;
  email: string;
  /** What would make it easier to come, optional. */
  needs: string;
  /** On the waiting list, not a ticket: the event was full. */
  waitlist: boolean;
}

export interface EventRegistrationProps {
  /** The event. Default: a demo event. */
  event?: EventDetails | undefined;
  /** ISO 4217 currency. Default: "USD". */
  currency?: string | undefined;
  /** Registers. Reject when it can't be sent. */
  onRegister?: ((registration: Registration) => unknown) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: EventDetails = {
  title: 'Design systems meetup', start: '2026-03-12T18:30:00+07:00', end: '2026-03-12T21:00:00+07:00', timeZone: 'Asia/Jakarta', zone: 'Jakarta time (UTC+7)',
  place: 'Acme office, 5th floor, Jl. Sudirman 21, Jakarta', capacity: 60, taken: 47,
  tickets: [
    { value: 'general', label: 'General', price: 12, who: 'Talks, dinner and drinks' },
    { value: 'student', label: 'Student', price: 5, who: 'The same, with a student card at the door' },
  ],
};
const MOST = 4;
type Problems = Partial<Record<'ticket' | 'count' | 'name' | 'email', string>>;

/** Places left, in words: "13 places left", "1 place left", "Full". */
export function placesWords(left: number, locale?: string): string {
  if (left <= 0) return 'Full';
  return `${formatNumber(left, locale)} ${left === 1 ? 'place' : 'places'} left`;
}

/** What's wrong with the registration, by field, in the order of the form, or {} when it can be sent. */
export function registrationProblems(r: Registration, left: number): Problems {
  const out: Problems = {};
  if (!r.waitlist) {
    if (!r.ticket) out.ticket = 'Choose a ticket.';
    const most = Math.min(MOST, left);
    if (!Number.isInteger(r.count) || r.count < 1 || r.count > most) out.count = `Choose from 1 to ${most} tickets.`;
  }
  if (!r.name.trim()) out.name = 'Enter your name, as it should be on the guest list.';
  if (!r.email.trim()) out.email = 'Enter your email address, for the tickets.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())) out.email = 'Enter an email address like name@example.com.';
  return out;
}

const icsTime = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`);
/** The event as an iCalendar file, for "Add to calendar". */
export function icsFor(e: EventDetails): string {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Acme//Events//EN', 'BEGIN:VEVENT', `UID:${icsTime(e.start)}-${e.title.length}@acme.example`,
    `DTSTAMP:${icsTime(e.start)}`, `DTSTART:${icsTime(e.start)}`, `DTEND:${icsTime(e.end)}`, `SUMMARY:${icsText(e.title)}`, `LOCATION:${icsText(e.place)}`,
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

/** The event's page: a skip link, a header, then main with the h1, when and where, places left, and the form, or the answer. */
export function EventRegistration({ event = demo, currency = 'USD', onRegister, online }: EventRegistrationProps) {
  const locale = useLocale();
  const left = Math.max(0, event.capacity - event.taken);
  const full = left === 0;
  const [r, setR] = React.useState<Registration>({ ticket: '', count: 1, name: '', email: '', needs: '', waitlist: full });
  const [problems, setProblems] = React.useState<Problems>({});
  const [tries, setTries] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [done, setDone] = React.useState<Registration | null>(null);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const edit = (patch: Partial<Registration>) => { setR((now) => ({ ...now, ...patch })); setFailed(false); };
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency });
  const ticket = event.tickets.find((t) => t.value === r.ticket);
  const time = (iso: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...opts, timeZone: event.timeZone }).format(new Date(iso));
  const when = `${time(event.start, { dateStyle: 'full' })}, ${time(event.start, { timeStyle: 'short' })} to ${time(event.end, { timeStyle: 'short' })}`;
  const errors: ErrorSummaryItem[] = (['ticket', 'count', 'name', 'email'] as const).filter((f) => problems[f]).map((f) => ({ field: `event-${f}`, message: problems[f] }));

  const register = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = registrationProblems(r, left);
    setProblems(found);
    setTries((t) => t + 1);
    if (Object.keys(found).length) return;
    const out: Registration = full ? { ...r, ticket: '', count: 0, name: r.name.trim(), email: r.email.trim(), needs: r.needs.trim() }
      : { ...r, name: r.name.trim(), email: r.email.trim(), needs: r.needs.trim() };
    setBusy(true);
    void Promise.resolve().then(() => onRegister?.(out)).then(() => setDone(out), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (done) answer.current?.focus(); }, [done]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme events</p>
        <Link underline="hover" href="#events">All events</Link>
      </header>
      <Container as="main" size="prose" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">Your details stay here. Registering needs a connection, and the places left may have changed.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Events', href: '#events' }, { label: event.title }]} title={event.title}
            description="An evening of short talks on design systems, then dinner. Talks are in English, with live captions on the screen." />
          <div className="flex flex-col gap-8 pt-6">
            <Card>
              <section aria-labelledby="event-facts" className="flex flex-col gap-4">
                <h2 id="event-facts" className="m-0 text-lg font-semibold">When and where</h2>
                <DescriptionList>
                  <DescriptionItem term="When"><time dateTime={event.start}>{when}</time>, {event.zone}</DescriptionItem>
                  <DescriptionItem term="Where">{event.place}</DescriptionItem>
                  <DescriptionItem term="Getting in">Step-free, with a lift to the 5th floor</DescriptionItem>
                </DescriptionList>
                <Meter label="Places" value={event.taken} max={event.capacity} high={event.capacity * 0.8} optimum={0}
                  formatValue={() => placesWords(left, locale)} showValue />
              </section>
            </Card>

            {done ? (
              <section aria-labelledby="registered" className="flex flex-col items-start gap-3">
                <h2 id="registered" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">{done.waitlist ? 'You’re on the waiting list' : 'You’re going'}</h2>
                {done.waitlist
                  ? <p className="m-0">We’ll email {done.email} as soon as a place comes free, and hold it for you for 24 hours.</p>
                  : <p className="m-0">{done.count === 1 ? `1 ${ticket!.label} ticket` : `${formatNumber(done.count, locale)} ${ticket!.label} tickets`}, {money(ticket!.price * done.count)} in all. The tickets are on their way to {done.email}; show them on your phone at the door.</p>}
                {done.waitlist ? null : <Link href={`data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(event))}`} download="event.ics">Add to your calendar</Link>}
              </section>
            ) : (
              <form onSubmit={register} noValidate aria-labelledby="register" className="flex flex-col gap-4">
                <h2 id="register" className="m-0 text-lg font-semibold">{full ? 'Join the waiting list' : 'Get tickets'}</h2>
                {full ? <p className="m-0">It’s full. Leave your name, and we’ll email you if a place comes free.</p> : null}
                <ErrorSummary key={tries} errors={errors} />
                <p className="m-0 text-text-muted">Fields marked * are required.</p>
                {full ? null : (
                  <>
                    <Field label="Ticket" error={problems.ticket} group required>
                      <RadioGroup id="event-ticket" name="event-ticket" variant="card" value={r.ticket} onValueChange={(v: string) => edit({ ticket: v })}>
                        {event.tickets.map((t) => <Radio key={t.value} value={t.value} description={t.who}>{t.label}: {money(t.price)}</Radio>)}
                      </RadioGroup>
                    </Field>
                    <Field label="How many tickets?" id="event-count" hint={`Up to ${formatNumber(Math.min(MOST, left), locale)}.`} error={problems.count} required>
                      <NumberInput min={1} max={Math.min(MOST, left)} value={r.count} onValueChange={(n) => edit({ count: n ?? 0 })} className="max-w-36" />
                    </Field>
                    <Card padding="sm" variant="filled">
                      <p id="event-total" className="m-0" aria-live="polite">{ticket && r.count > 0 ? <>Total: <strong>{money(ticket.price * r.count)}</strong></> : 'Choose a ticket to see your total.'}</p>
                    </Card>
                  </>
                )}
                <Field label="Your name" id="event-name" error={problems.name} required>
                  <Input autoComplete="name" value={r.name} onChange={(e) => edit({ name: e.target.value })} />
                </Field>
                <Field label="Email" id="event-email" error={problems.email} required>
                  <Input type="email" autoComplete="email" spellCheck={false} value={r.email} onChange={(e) => edit({ email: e.target.value })} />
                </Field>
                <Field label="Anything that would make it easier to come?" id="event-needs" hint="Seating, food, a quiet room, a sign language interpreter. We’ll be in touch." optional>
                  <Textarea rows={3} maxLength={500} value={r.needs} onChange={(e) => edit({ needs: e.target.value })} />
                </Field>
                <div className="flex flex-col items-start gap-3">
                  {failed ? <Alert tone="danger">Couldn’t register you. Try again; everything you entered is still here.</Alert> : null}
                  <Button type="submit" loading={busy}>{full ? 'Join the waiting list' : 'Register'}</Button>
                </div>
              </form>
            )}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

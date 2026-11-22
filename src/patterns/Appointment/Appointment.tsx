'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { Calendar } from '../../components/Calendar/Calendar';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Loader } from '../../components/Loader/Loader';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { EmptyState } from '../../components/EmptyState/EmptyState';

/* Appointment: a time with someone, picked by day and then by time, with your details and a confirmation. For an
   app to copy. What it carries (WCAG 2.2):
   - 1.4.1, 1.3.1: days with no free time are struck through and can't be picked; once a day is picked, its times are
     a named group of radios, and a taken time is still listed, disabled, with "taken" in its name, so the reader
     knows it exists and why it can't be chosen.
   - 4.1.3, 2.4.3: picking a day says how many times are free on it, and the times' heading names the day.
   - 3.3.1, 3.3.2: name and email are required and say so; what's missing is said next to its field, and focus goes to
     the first. Book with no time says what to choose and puts focus on the times or the calendar.
   - 1.3.5: the name and email fields say what they are for autofill.
   - 1.3.1: the appointment is summed up as a description list: what, with whom, when and where.
   - 3.3.4, 4.1.3: Book shows it's busy and books only once the server says so; one that fails says so next to the
     button and keeps everything; a time taken meanwhile can be marked taken by the app.
   - 2.4.3, 4.1.3: once booked, the form gives way to a confirmation whose heading takes focus and says when.
   - 4.1.3, 3.3.1: while the times load, a placeholder named once; a failed load says so, with Try again.
   Booking is the app's job: onBook gets the day, the time and the details; reject its promise when it fails. */

export interface AppointmentService {
  /** What it is: "Eye test". */
  name: string;
  /** How long it takes, in minutes. */
  minutes: number;
  /** Who it's with: "Dr. Sari Wijaya". */
  with: string;
  /** Where: "Jl. Riau 21, Bandung". */
  where: string;
}
/** A time on a day, as "HH:mm", and whether it's still free. */
export interface AppointmentSlot {
  time: string;
  free: boolean;
}
/** What's sent: the day as "yyyy-mm-dd", the time as "HH:mm", and the details. */
export interface AppointmentRequest {
  day: string;
  time: string;
  name: string;
  email: string;
  note: string;
}

export interface AppointmentProps {
  /** What's being booked. Default: a demo eye test. */
  service?: AppointmentService | undefined;
  /** The times on each day, by "yyyy-mm-dd". A day that isn't here has no times. Default: the demo's. */
  slots?: Readonly<Record<string, readonly AppointmentSlot[]>> | undefined;
  /** The earliest day, as "yyyy-mm-dd". Pass today's. Default: "2025-03-03", for the demo. */
  today?: string | undefined;
  /** Books the appointment. Return its promise: a rejection keeps the form and says so. */
  onBook?: ((request: AppointmentRequest) => unknown) | undefined;
  /** The times are on their way from the server: placeholders, named once ("Loading times"). Default: false. */
  loading?: boolean | undefined;
  /** The times failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the times again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoService: AppointmentService = { name: 'Eye test', minutes: 30, with: 'Dr. Sari Wijaya', where: 'Jl. Riau 21, Bandung' };
const times = (free: string[], taken: string[] = []): AppointmentSlot[] =>
  [...free.map((time) => ({ time, free: true })), ...taken.map((time) => ({ time, free: false }))].sort((a, b) => (a.time < b.time ? -1 : 1));
const demoSlots: Record<string, AppointmentSlot[]> = {
  '2025-03-04': times(['09:00', '10:30', '14:00'], ['09:30', '11:00']),
  '2025-03-05': times(['13:00', '13:30'], ['09:00']),
  '2025-03-06': times([], ['09:00', '09:30', '10:00']),
  '2025-03-07': times(['09:00', '09:30', '10:00', '15:30']),
  '2025-03-11': times(['10:00', '11:30']),
  '2025-03-12': times(['09:00'], ['10:00', '10:30']),
};

// A "yyyy-mm-dd" day at local midnight, and a day as "yyyy-mm-dd".
const day = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y!, m! - 1, d); };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The days that have at least one free time, as "yyyy-mm-dd", in order. */
export const freeDays = (slots: Readonly<Record<string, readonly AppointmentSlot[]>>): string[] =>
  Object.keys(slots).filter((d) => slots[d]!.some((s) => s.free)).sort();

/** A day and a time in words: "Tuesday, March 4 at 10:30 AM". */
export function slotWords(dayIso: string, time: string, locale?: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = day(dayIso);
  d.setHours(h!, m);
  const date = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', calendar: 'gregory', numberingSystem: 'latn' }).format(d);
  return `${date} at ${timeWords(time, locale)}`;
}
/** A time as the locale writes it: "10:30 AM", "10.30". */
export function timeWords(time: string, locale?: string): string {
  const [h, m] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', numberingSystem: 'latn' }).format(new Date(2000, 0, 1, h, m)).replace(/[\u2009\u202f]/g, ' ');
}

/** What's wrong with the details, by field, or {} when they can be sent. */
export function detailProblems(d: Pick<AppointmentRequest, 'name' | 'email'>): Partial<Record<'name' | 'email', string>> {
  const out: Partial<Record<'name' | 'email', string>> = {};
  if (!d.name.trim()) out.name = 'Enter your name.';
  if (!d.email.trim()) out.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) out.email = 'Enter an email address like name@example.com.';
  return out;
}

/** The booking page: a skip link, a header, then main with the service's h1, the day and time, your details and Book. */
export function Appointment({ service = demoService, slots = demoSlots, today = '2025-03-03', onBook, loading = false, loadFailed = false, onRetry, online }: AppointmentProps) {
  const locale = useLocale(undefined);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<string | null>(null);
  const [details, setDetails] = React.useState({ name: '', email: '', note: '' });
  const [problems, setProblems] = React.useState<ReturnType<typeof detailProblems>>({});
  const [pickProblem, setPickProblem] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [booked, setBooked] = React.useState<AppointmentRequest | null>(null);
  const calendar = React.useRef<HTMLDivElement>(null);
  const times = React.useRef<HTMLDivElement>(null);
  const done = React.useRef<HTMLHeadingElement>(null);
  const open = React.useMemo(() => new Set(freeDays(slots)), [slots]);
  const closed = React.useCallback((d: Date) => !open.has(iso(d)), [open]);
  const first = freeDays(slots)[0];
  const daySlots = picked ? slots[picked] ?? [] : [];
  const freeCount = daySlots.filter((s) => s.free).length;
  const dayName = (d: string) => new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', calendar: 'gregory', numberingSystem: 'latn' }).format(day(d));

  const pickDay = (_: Date, { iso: d }: { iso: string }) => { setPicked(d); setTime(null); setPickProblem(null); setFailed(false); };
  const edit = (patch: Partial<typeof details>) => {
    setDetails((now) => ({ ...now, ...patch }));
    setFailed(false);
  };
  const book = (e: React.FormEvent) => {
    e.preventDefault();
    setFailed(false);
    const found = detailProblems(details);
    setProblems(found);
    if (!picked || !time) {
      setPickProblem(picked ? 'Choose a time.' : 'Choose a day, then a time.');
      const target = picked ? times.current?.querySelector<HTMLElement>('input:not(:disabled)') : calendar.current?.querySelector<HTMLElement>('.srp-calendar__day[tabindex="0"]');
      target?.focus();
      return;
    }
    const firstProblem = (['name', 'email'] as const).find((k) => found[k]);
    if (firstProblem) { document.getElementById(`appointment-${firstProblem}`)?.focus(); return; }
    const request: AppointmentRequest = { day: picked, time, name: details.name.trim(), email: details.email.trim(), note: details.note.trim() };
    setBusy(true);
    void Promise.resolve().then(() => onBook?.(request)).then(() => setBooked(request), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (booked) done.current?.focus(); }, [booked]);

  const h2 = 'm-0 text-lg font-semibold';
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Clinic</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">These times are from when the page loaded and may have gone. Booking needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Services', href: '#services' }, { label: service.name }]} title={`Book an ${service.name.toLowerCase()}`}
          description={`${formatNumber(service.minutes, locale)} minutes with ${service.with}`} />

        <div className="pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load the times" onRetry={() => onRetry?.()} headingLevel={2} />
            : loading ? <Card><Loader variant="skeleton" shape="text" lines={6} label="Loading times" /></Card>
            : !first && !booked ? <EmptyState icon="event_busy" title="No free times" headingLevel={2}
                description={`${service.with} has no free times in the weeks ahead. New times open every Monday.`} />
            : booked ? (
              <section aria-labelledby="booked" className="flex flex-col items-start gap-3">
                <h2 id="booked" ref={done} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">You’re booked for {slotWords(booked.day, booked.time, locale)}</h2>
                <p className="m-0">We’ve sent the details to {booked.email}. To change the time, use the link in that email.</p>
                <Button variant="outline" onClick={() => { setBooked(null); setPicked(null); setTime(null); }}>Book another time</Button>
              </section>
            ) : (
              <form onSubmit={book} noValidate className="grid items-start gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-8 md:col-span-2">
                  <section aria-labelledby="day" className="flex flex-col gap-4">
                    <h2 id="day" className={h2}>Day</h2>
                    <p className="m-0 text-sm text-text-muted">Days with no free times are struck through.</p>
                    <Calendar ref={calendar} aria-labelledby="day" value={picked} onValueChange={pickDay} min={today}
                      defaultMonth={day(first ?? today)} isDateDisabled={closed} />
                    {picked ? <p id="free-times" className="m-0" role="status">{freeCount === 1 ? '1 time free' : `${formatNumber(freeCount, locale)} times free`} on {dayName(picked)}.</p> : null}
                  </section>
                  {picked ? (
                    <Field label={`Times on ${dayName(picked)}`} group required>
                      <RadioGroup ref={times} name="appointment-time" value={time} orientation="horizontal" variant="card"
                        onValueChange={(v: string) => { setTime(v); setPickProblem(null); setFailed(false); }}>
                        {daySlots.map((s) => (
                          <Radio key={s.time} value={s.time} disabled={!s.free} aria-label={s.free ? undefined : `${timeWords(s.time, locale)}, taken`}>
                            {s.free ? timeWords(s.time, locale) : <span className="line-through">{timeWords(s.time, locale)}</span>}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </Field>
                  ) : null}
                  {pickProblem ? <Alert tone="danger">{pickProblem}</Alert> : null}
                  <section aria-labelledby="you" className="flex flex-col gap-4">
                    <h2 id="you" className={h2}>Your details</h2>
                    <Field label="Name" id="appointment-name" error={problems.name} required>
                      <Input autoComplete="name" value={details.name} onChange={(e) => edit({ name: e.target.value })} />
                    </Field>
                    <Field label="Email" id="appointment-email" hint="We send the details and a reminder here." error={problems.email} required>
                      <Input type="email" autoComplete="email" value={details.email} onChange={(e) => edit({ email: e.target.value })} />
                    </Field>
                    <Field label="Anything we should know?" optional>
                      <Textarea rows={3} value={details.note} onChange={(e) => edit({ note: e.target.value })} />
                    </Field>
                  </section>
                </div>
                <Card>
                  <section aria-labelledby="summary" className="flex flex-col gap-4">
                    <h2 id="summary" className={h2}>Your appointment</h2>
                    <DescriptionList>
                      <DescriptionItem term="What">{service.name}, {formatNumber(service.minutes, locale)} minutes</DescriptionItem>
                      <DescriptionItem term="With">{service.with}</DescriptionItem>
                      <DescriptionItem term="When">{picked && time ? slotWords(picked, time, locale) : picked ? `${dayName(picked)}, time to choose` : 'Choose a day and a time'}</DescriptionItem>
                      <DescriptionItem term="Where">{service.where}</DescriptionItem>
                    </DescriptionList>
                    {failed ? <Alert tone="danger">Couldn’t book this time. Try again, or choose another.</Alert> : null}
                    <Button type="submit" loading={busy}>Book</Button>
                  </section>
                </Card>
              </form>
            )}
        </div>
      </main>
    </div>
  );
}

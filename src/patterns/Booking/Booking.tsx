'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { RangeCalendar } from '../../components/RangeCalendar/RangeCalendar';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { FormattedNumber } from '../../components/FormattedNumber/FormattedNumber';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Booking: a stay at one place, picked on two months side by side, with the nights counted, the nights already
   booked named, the price worked out and a way to reserve. For an app to copy. What it carries (WCAG 2.2):
   - 1.4.1, 1.3.1: the nights already booked are struck through on the calendar and also listed in words beside it,
     so nobody has to tell them apart by look, and the calendar names each picked day "start date" or "end date".
   - 3.3.1, 4.1.3: dates that take in a booked night, or fewer nights than the place lets, are said at once in an alert
     the calendar points to, naming the nights; Reserve with no dates says what to choose and puts focus on the calendar.
   - 3.3.2: the guests field says how many the place sleeps; the count can't go past it.
   - 1.3.1: the price is a description list: the nightly price times the nights, the cleaning fee and the total, in words.
   - 3.3.4, 4.1.3: Reserve shows it's busy and books only once the server says so; a booking that fails says so next to
     the button and keeps the dates.
   - 2.4.3, 4.1.3: once booked, the form gives way to a confirmation whose heading takes focus and says the dates.
   - 4.1.3, 3.3.1: while the place loads, a placeholder named once; a failed load says so, with Try again.
   Booking is the app's job: onReserve gets the stay; reject its promise when it can't be booked. */

export interface BookingPlace {
  /** What it's called: "Sea-view room". */
  name: string;
  /** Where it is: "Canggu, Bali". */
  where: string;
  /** The price of one night, in the currency's main unit. */
  price: number;
  /** A fee for each stay, whatever its length. 0 leaves it out. */
  cleaning: number;
  /** How many it sleeps. */
  maxGuests: number;
  /** The fewest nights a stay can be. */
  minNights: number;
  /** Nights already booked, each the "yyyy-mm-dd" of the day it starts. */
  taken: readonly string[];
}
/** A stay: the day the guests arrive and the day they leave, as "yyyy-mm-dd", and how many come. */
export interface BookingStay {
  start: string;
  end: string;
  guests: number;
}

export interface BookingProps {
  /** The place. Default: a demo room. */
  place?: BookingPlace | undefined;
  /** An ISO 4217 code. Default: "USD". */
  currency?: string | undefined;
  /** The earliest day a stay can start, as "yyyy-mm-dd". Pass today's. Default: "2026-11-05", for the demo. */
  today?: string | undefined;
  /** Books the stay. Return its promise: a rejection keeps the dates and says the booking failed. */
  onReserve?: ((stay: BookingStay) => unknown) | undefined;
  /** The place is on its way from the server: placeholders, named once ("Loading place"). Default: false. */
  loading?: boolean | undefined;
  /** The place failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the place again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: BookingPlace = {
  name: 'Sea-view room', where: 'Canggu, Bali', price: 120, cleaning: 40, maxGuests: 3, minNights: 2,
  taken: ['2026-11-12', '2026-11-13', '2026-11-14', '2026-11-26', '2026-11-27', '2026-12-24', '2026-12-25', '2026-12-26'],
};

// A "yyyy-mm-dd" day at local midnight, the day n days on from d, and a day as "yyyy-mm-dd".
const day = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y!, m! - 1, d); };
const shift = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const DAY = 864e5;
/** The nights between the day the guests arrive and the day they leave. */
export const nightsBetween = (start: string, end: string): number => Math.round((day(end).getTime() - day(start).getTime()) / DAY);

/** The booked nights a stay takes in, from the first night to the last (the day it ends is not a night of it). */
export function takenIn(stay: { start: string; end: string }, taken: readonly string[]): string[] {
  const end = day(stay.end);
  return [...taken].sort().filter((n) => n >= stay.start && day(n) < end);
}

/** Booked nights in runs, each written as the stay it is: the day it starts and the day after its last night. */
export function bookedStays(taken: readonly string[]): { start: string; end: string }[] {
  const out: { start: string; end: string }[] = [];
  for (const n of [...new Set(taken)].sort()) {
    const last = out[out.length - 1];
    const next = iso(shift(day(n), 1));
    if (last && last.end === n) last.end = next;
    else out.push({ start: n, end: next });
  }
  return out;
}

const words = (locale: string | undefined, a: string, b?: string) => {
  const f = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', calendar: 'gregory', numberingSystem: 'latn' });
  return (b && b !== a ? f.formatRange(day(a), day(b)) : f.format(day(a))).replace(/[\u2009\u202f]/g, ' ');
};

/** What's wrong with the dates, as a sentence, or null when they can be booked. */
export function stayProblem(stay: { start: string; end: string } | null, place: Pick<BookingPlace, 'taken' | 'minNights'>, locale?: string): string | null {
  if (!stay) return 'Choose the day you arrive and the day you leave.';
  const hit = takenIn(stay, place.taken);
  if (hit.length) return `${hit.length === 1 ? 'The night of' : 'The nights of'} ${words(locale, hit[0]!, hit[hit.length - 1])} ${hit.length === 1 ? 'is' : 'are'} already booked. Choose other dates.`;
  if (nightsBetween(stay.start, stay.end) < place.minNights) return `Stay at least ${place.minNights} nights.`;
  return null;
}

/** The booking page: a skip link, a header, then main with the place's h1, its dates, guests and price. */
export function Booking({ place = demo, currency = 'USD', today = '2026-11-05', onReserve, loading = false, loadFailed = false, onRetry, online }: BookingProps) {
  const locale = useLocale(undefined);
  const [stay, setStay] = React.useState<{ start: string; end: string } | null>(null);
  const [chosen, setGuests] = React.useState<number | null>(2);
  // Two to start, or fewer when the place sleeps fewer (which it can say only once it has loaded).
  const guests = chosen && Math.min(chosen, Math.max(1, place.maxGuests));
  const [asked, setAsked] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [booked, setBooked] = React.useState<BookingStay | null>(null);
  const calendar = React.useRef<HTMLDivElement>(null);
  const done = React.useRef<HTMLHeadingElement>(null);
  const taken = React.useMemo(() => new Set(place.taken), [place.taken]);
  // A day closes only when the night before it is booked too: the first day of a booked run can still end a stay,
  // and the day a booked run ends can still start one.
  const closed = React.useCallback((d: Date) => taken.has(iso(d)) && taken.has(iso(shift(d, -1))), [taken]);

  const problem = stayProblem(stay, place, locale);
  const shownProblem = stay || asked ? problem : null;
  const nights = stay ? nightsBetween(stay.start, stay.end) : 0;
  const money = (n: number) => <FormattedNumber value={n} format="currency" currency={currency} />;
  const nightWords = (n: number) => `${formatNumber(n, locale)} ${n === 1 ? 'night' : 'nights'}`;

  const reserve = () => {
    setFailed(false);
    if (problem || !stay || !guests) {
      setAsked(true);
      calendar.current?.querySelector<HTMLElement>('.srp-calendar__day[tabindex="0"]')?.focus();
      return;
    }
    const s: BookingStay = { ...stay, guests };
    setBusy(true);
    void Promise.resolve().then(() => onReserve?.(s)).then(() => setBooked(s), () => setFailed(true)).finally(() => setBusy(false));
  };
  React.useEffect(() => { if (booked) done.current?.focus(); }, [booked]);

  const h2 = 'm-0 text-lg font-semibold';
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Stays</p>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">These dates are from when the page loaded and may have gone. Reserving needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Stays', href: '#stays' }, { label: place.name }]} title={place.name}
            description={loading || loadFailed ? undefined : <>{place.where} · {money(place.price)} a night · Sleeps {formatNumber(place.maxGuests, locale)}</>} />

          <div className="pt-6">
            {loadFailed ? <EmptyLoadFailed title="Couldn’t load the place" onRetry={() => onRetry?.()} headingLevel={2} />
              : loading ? <Card><Skeleton shape="text" lines={6} label="Loading place" /></Card>
              : booked ? (
                <section aria-labelledby="booked" className="flex flex-col items-start gap-3">
                  <h2 id="booked" ref={done} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">You’re booked</h2>
                  <p className="m-0">{words(locale, booked.start, booked.end)}, {nightWords(nightsBetween(booked.start, booked.end))}, for {formatNumber(booked.guests, locale)} {booked.guests === 1 ? 'guest' : 'guests'}. We’ve sent the details to your email.</p>
                  <Button variant="outline" onClick={() => { setBooked(null); setStay(null); setAsked(false); }}>Book other dates</Button>
                </section>
              ) : (
                <div className="grid items-start gap-6 md:grid-cols-3">
                  <div className="flex flex-col gap-8 md:col-span-2">
                    <section aria-labelledby="dates" className="flex flex-col gap-4">
                      <h2 id="dates" className={h2}>Your dates</h2>
                      <p className="m-0 text-sm text-text-muted">Choose the day you arrive, then the day you leave. Stays are {formatNumber(place.minNights, locale)} nights at least.</p>
                      <RangeCalendar ref={calendar} aria-labelledby="dates" aria-describedby={shownProblem ? 'stay-problem' : undefined} months={2}
                        defaultMonth={day(today)} min={today} isDateDisabled={closed} value={stay}
                        onValueChange={(_, { iso }) => { setFailed(false); setStay(iso); }} />
                      {shownProblem ? <Alert id="stay-problem" tone="danger">{shownProblem}</Alert> : null}
                      {place.taken.length ? (
                        <div className="flex flex-col gap-1">
                          <h3 id="taken" className="m-0 text-base font-semibold">Already booked</h3>
                          <ul aria-labelledby="taken" className="m-0 flex flex-col gap-1 ps-5">
                            {bookedStays(place.taken).map((b) => <li key={b.start}>{words(locale, b.start, b.end)}</li>)}
                          </ul>
                          <p className="m-0 text-sm text-text-muted">A stay can end on the day one of these starts, and start on the day one ends.</p>
                        </div>
                      ) : null}
                    </section>
                    <section aria-labelledby="who" className="flex flex-col gap-4">
                      <h2 id="who" className={h2}>Who’s coming</h2>
                      <Field label="Guests" hint={`Up to ${formatNumber(place.maxGuests, locale)}.`} required>
                        <NumberInput value={guests} onValueChange={setGuests} min={1} max={place.maxGuests} />
                      </Field>
                    </section>
                  </div>
                  <Card>
                    <section aria-labelledby="price" className="flex flex-col gap-4">
                      <h2 id="price" className={h2}>Your stay</h2>
                      {stay && !problem ? (
                        <DescriptionList layout="split">
                          <DescriptionItem term="Arrive">{words(locale, stay.start)}</DescriptionItem>
                          <DescriptionItem term="Leave">{words(locale, stay.end)}</DescriptionItem>
                          <DescriptionItem term={<>{money(place.price)} × {nightWords(nights)}</>}>{money(place.price * nights)}</DescriptionItem>
                          {place.cleaning ? <DescriptionItem term="Cleaning">{money(place.cleaning)}</DescriptionItem> : null}
                          <DescriptionItem term="Total" emphasis>{money(place.price * nights + place.cleaning)}</DescriptionItem>
                        </DescriptionList>
                      ) : <p className="m-0 text-text-muted">Choose your dates to see the price.</p>}
                      {failed ? <Alert tone="danger">Couldn’t book these dates. Try again.</Alert> : null}
                      <Button loading={busy} onClick={reserve}>Reserve</Button>
                      <p className="m-0 text-sm text-text-muted">You won’t pay until the host confirms.</p>
                    </section>
                  </Card>
                </div>
              )}
          </div>
        </Stack>
      </Container>
    </div>
  );
}

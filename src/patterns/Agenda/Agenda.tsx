'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { Select } from '../../components/Select/Select';
import { Tabs, TabList, Tab, TabPanel } from '../../components/Tabs/Tabs';
import { ToggleButton } from '../../components/ToggleButton/ToggleButton';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { formatDate } from '../../components/FormattedDate/FormattedDate';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Conference agenda: the sessions of each day by time, filtered by track, saved to your own agenda, with clashes said.
   For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: each day is a tab; in it, each start time is a heading over the sessions that start then, and each
     session is an article named by its title, with who, where, and its track as a word.
   - 4.1.2, 4.1.3: Save is a toggle button named by its session, pressed or not; saving says how many you've saved.
   - 3.3.1: a saved session that overlaps another says which, in words, on both.
   - 4.1.3: the track filter says how many sessions it shows.
   Keeping the agenda is the app's job: pass the sessions; onSavedChange hears each change. */

export interface Session { id: string; day: string; start: string; end: string; title: string; speakers: string; room: string; track: string }

export interface AgendaProps {
  sessions?: Session[] | undefined;
  /** The ids saved already. */
  defaultSaved?: string[] | undefined;
  onSavedChange?: ((saved: string[]) => void) | undefined;
  /** Still loading: a placeholder shows instead of the sessions. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load the agenda" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const S = (id: string, day: string, start: string, end: string, title: string, speakers: string, room: string, track: string): Session => ({ id, day, start, end, title, speakers, room, track });
const demo: Session[] = [
  S('k1', '2026-05-14', '09:00', '09:45', 'Opening keynote: Design for the slow connection', 'Dewi Lestari', 'Main hall', 'Keynote'),
  S('a1', '2026-05-14', '10:00', '10:45', 'Forms that forgive', 'Chen Wei', 'Room A', 'Accessibility'),
  S('b1', '2026-05-14', '10:00', '11:00', 'Tokens across five brands', 'Sara Haddad', 'Room B', 'Design systems'),
  S('a2', '2026-05-14', '11:00', '11:45', 'Screen readers in the real world', 'Kofi Mensah, Lena Vogel', 'Room A', 'Accessibility'),
  S('b2', '2026-05-14', '11:15', '12:00', 'Shipping a component a week', 'Tomás Ruiz', 'Room B', 'Design systems'),
  S('k2', '2026-05-15', '09:00', '09:45', 'Keynote: What we got wrong', 'Ana Lima', 'Main hall', 'Keynote'),
  S('a3', '2026-05-15', '10:00', '10:45', 'Colour for everyone', 'Eko Prasetyo', 'Room A', 'Accessibility'),
  S('b3', '2026-05-15', '10:00', '10:45', 'Docs people read', 'Maya Chen', 'Room B', 'Design systems'),
];

/** For each saved session, the titles of the other saved sessions that overlap it on the same day. */
export function clashes(sessions: Session[], saved: string[]) {
  const mine = sessions.filter((s) => saved.includes(s.id));
  return Object.fromEntries(mine.map((s) => [s.id, mine.filter((o) => o.id !== s.id && o.day === s.day && o.start < s.end && s.start < o.end).map((o) => o.title)]));
}

/** Sessions grouped by start time, earliest first. */
export function byStart(sessions: Session[]) {
  const times = [...new Set(sessions.map((s) => s.start))].sort();
  return times.map((t) => ({ start: t, sessions: sessions.filter((s) => s.start === t) }));
}

/** The agenda page: a skip link, a header, then main with the h1, the track filter and a tab for each day and yours. */
export function Agenda({ sessions = demo, defaultSaved = [], onSavedChange, loading = false, loadFailed = false, onRetry, online }: AgendaProps) {
  const locale = useLocale();
  const num = (n: number) => formatNumber(n, locale);
  const [saved, setSaved] = React.useState(defaultSaved);
  const [track, setTrack] = React.useState('');
  const days = [...new Set(sessions.map((s) => s.day))].sort();
  const tracks = [...new Set(sessions.map((s) => s.track))];
  const shown = sessions.filter((s) => !track || s.track === track);
  const clash = clashes(sessions, saved);
  const time = (day: string, t: string) => new Date(`${day}T${t}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  const dayName = (d: string) => formatDate(d, locale, { options: { weekday: 'long', day: 'numeric', month: 'long' } });
  const sessionsWords = (n: number) => (n === 1 ? '1 session' : `${num(n)} sessions`);

  const toggle = (id: string, on: boolean) => {
    const next = on ? [...saved, id] : saved.filter((x) => x !== id);
    setSaved(next);
    onSavedChange?.(next);
    announce(`${on ? 'Saved' : 'Removed'}. ${sessionsWords(next.length)} in your agenda.`);
  };

  const list = (items: Session[], scope: string) => byStart(items).map((g) => (
    <section key={`${items[0]?.day}-${g.start}`} aria-labelledby={`${scope}-slot-${g.sessions[0]!.id}`} className="flex flex-col gap-3">
      <h3 id={`${scope}-slot-${g.sessions[0]!.id}`} className="m-0 text-base font-semibold text-text-muted"><time dateTime={`${g.sessions[0]!.day}T${g.start}`}>{time(g.sessions[0]!.day, g.start)}</time></h3>
      {g.sessions.map((s) => {
        const on = saved.includes(s.id);
        return (
          <Card key={s.id} padding="sm">
            <article aria-labelledby={`${scope}-session-${s.id}`} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <h4 id={`${scope}-session-${s.id}`} className="m-0 text-base font-semibold wrap-break-word">{s.title}</h4>
                  <p className="m-0 text-sm">{s.speakers}</p>
                  <p className="m-0 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                    <span>{time(s.day, s.start)} to {time(s.day, s.end)} · {s.room}</span><Badge>{s.track}</Badge>
                  </p>
                </div>
                <ToggleButton size="sm" pressed={on} onPressedChange={(v) => toggle(s.id, v)} aria-label={`Save: ${s.title}`}>Save</ToggleButton>
              </div>
              {clash[s.id]?.length ? <Alert tone="warning">Clashes with {clash[s.id]!.join(' and ')}.</Alert> : null}
            </article>
          </Card>
        );
      })}
    </section>
  ));

  const mine = sessions.filter((s) => saved.includes(s.id));
  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Design Days</p>
        <Link underline="hover" href="#tickets">Tickets</Link>
      </header>
      <Container as="main" size="md" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">This is the agenda as it was when the page loaded. Saving a session needs a connection.</OfflineBanner>
          <PageHeader title="Agenda" description="Two days of talks in Bandung. Save the sessions you want, and we’ll warn you about clashes." />
          {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the agenda" onRetry={() => onRetry?.()} headingLevel={2} /></div>
            : loading ? <Card className="mt-6"><Skeleton shape="text" lines={6} label="Loading the agenda" /></Card>
            : !sessions.length ? <div className="pt-6"><EmptyState icon="event" title="The agenda isn’t out yet" headingLevel={2}
                description="The sessions show here once the speakers are confirmed. Your ticket is all you need until then." /></div> : (<>
          <div className="flex flex-wrap items-end justify-between gap-3 pt-6">
            <Field label="Track">
              <Select value={track} onChange={(e) => setTrack(e.target.value)} options={[{ value: '', label: 'Every track' }, ...tracks.map((t) => ({ value: t, label: t }))]} />
            </Field>
            <p role="status" id="agenda-count" className="m-0 text-sm text-text-muted">{track ? `${sessionsWords(shown.length)} in ${track}` : `${sessionsWords(shown.length)} in all`}</p>
          </div>
          <Tabs defaultValue={days[0]} className="pt-4">
            <TabList aria-label="Days">
              {days.map((d, i) => <Tab key={d} value={d}>Day {num(i + 1)}</Tab>)}
              <Tab value="mine">Your agenda ({num(saved.length)})</Tab>
            </TabList>
            {days.map((d) => (
              <TabPanel key={d} value={d} className="flex flex-col gap-6 pt-4">
                <h2 className="m-0 text-lg font-semibold">{dayName(d)}</h2>
                {list(shown.filter((s) => s.day === d), 'day')}
                {!shown.some((s) => s.day === d) ? <p className="m-0 text-text-muted">No sessions in this track today.</p> : null}
              </TabPanel>
            ))}
            <TabPanel value="mine" className="flex flex-col gap-6 pt-4">
              <h2 className="m-0 text-lg font-semibold">Your agenda</h2>
              {mine.length ? days.filter((d) => mine.some((s) => s.day === d)).map((d) => (
                <div key={d} className="flex flex-col gap-4">
                  <p className="m-0 font-semibold">{dayName(d)}</p>
                  {list(mine.filter((s) => s.day === d), 'mine')}
                </div>
              )) : <p className="m-0 text-text-muted">Nothing saved yet. Press Save on a session to add it here.</p>}
            </TabPanel>
          </Tabs>
          </>)}
        </Stack>
      </Container>
    </div>
  );
}

'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { DatePicker } from '../../components/DatePicker/DatePicker';
import { TimePicker } from '../../components/TimePicker/TimePicker';
import { Switch } from '../../components/Switch/Switch';
import { Alert } from '../../components/Alert/Alert';
import { Card } from '../../components/Card/Card';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Toaster, toast } from '../../components/Toast/Toast';
import { EventCalendar, type CalendarEvent, type CalendarSlot } from '../../components/EventCalendar/EventCalendar';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Team calendar: a team's events by month, week, day or as a list, with a way to add one, open one, move one and
   delete one. For an app to copy. What it carries (WCAG 2.2):
   - 2.5.7, 2.1.1: EventCalendar moves an event by dragging, or with Shift and the arrow keys; New event and a press on
     an empty day or hour open the same form, so nothing needs a drag.
   - 4.1.3, 3.3.1: a move shows at once and is saved after; one that can't be saved goes back and says so, naming the
     event and when it is again.
   - 3.3.1, 3.3.2: a new event needs a title and a day; a missing one, or an end before the start, is said next to its
     field, and focus goes to the first. An add that fails says so in the dialog, which stays open with what was typed.
   - 2.4.3, 4.1.3: after an add, focus goes back to where the form was opened from, and a toast says the event and its day.
   - 3.3.4, 2.4.3: Delete is in the event's own dialog, named with the event; the event goes at once, a toast offers
     Undo, and focus goes back to the calendar.
   - 1.3.1: the event's dialog says when it is in words, the day and the times, not only where it sits on the grid.
   - 4.1.3, 3.3.1: while the events load, a placeholder named once; a failed load says so, with Try again.
   Saving is the app's job: onAdd, onMove and onDelete each get the change; reject their promises when saving fails. */

/** A new event, from the form: the day as "yyyy-mm-dd", and its times as "HH:mm" unless it's all day. */
export interface CalendarEventDraft {
  title: string;
  day: string;
  allDay: boolean;
  start: string;
  end: string;
}

export interface TeamCalendarProps {
  /** The calendar's name: the page's h1. Default: "Team calendar". */
  title?: string | undefined;
  /** The events. Default: a demo month. */
  events?: readonly CalendarEvent[] | undefined;
  /** The month shown at first. Default: March 2025, the demo's. */
  defaultMonth?: Date | undefined;
  /** An event was added. Return its id, or a promise of it: a rejection keeps the dialog open and says so. */
  onAdd?: ((draft: CalendarEventDraft) => unknown) | undefined;
  /** An event was moved to new times. Return its promise: a rejection puts it back and says so. */
  onMove?: ((event: CalendarEvent, to: CalendarSlot) => unknown) | undefined;
  /** An event was deleted and its Undo wasn't chosen. */
  onDelete?: ((event: CalendarEvent) => void) | undefined;
  /** The events are on their way: one placeholder, named once ("Loading events"). Default: false. */
  loading?: boolean | undefined;
  /** The events failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the events again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: CalendarEvent[] = [
  { id: 'standup-3', title: 'Team standup', start: '2025-03-03T09:30', end: '2025-03-03T09:45', repeating: true },
  { id: 'standup-10', title: 'Team standup', start: '2025-03-10T09:30', end: '2025-03-10T09:45', repeating: true },
  { id: 'review', title: 'Design review', start: '2025-03-04T14:00', end: '2025-03-04T15:00', tone: 'info' },
  { id: 'launch', title: 'Launch day', start: '2025-03-12', allDay: true, tone: 'success' },
  { id: 'offsite', title: 'Team offsite', start: '2025-03-18', end: '2025-03-20', allDay: true, tone: 'warning' },
  { id: 'demo', title: 'Customer demo', start: '2025-03-25T15:00', end: '2025-03-25T16:00', tone: 'info' },
];

const pad = (n: number) => String(n).padStart(2, '0');
/** A Date's day as "yyyy-mm-dd", in local time. */
export const dayOf = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** A Date's time as "HH:mm", in local time. */
export const timeOf = (d: Date): string => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const asDate = (v: Date | string): Date => (typeof v === 'string' ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v + 'T00:00' : v) : v);

/** The form's problems, by field: { title: "Enter a title.", end: "End after it starts." }. Empty when it's good. */
export function draftProblems(d: CalendarEventDraft): Partial<Record<'title' | 'day' | 'start' | 'end', string>> {
  const out: Partial<Record<'title' | 'day' | 'start' | 'end', string>> = {};
  if (!d.title.trim()) out.title = 'Enter a title for the event.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.day)) out.day = 'Choose a day.';
  if (!d.allDay) {
    if (!/^\d{2}:\d{2}$/.test(d.start)) out.start = 'Choose when it starts.';
    if (!/^\d{2}:\d{2}$/.test(d.end)) out.end = 'Choose when it ends.';
    else if (!out.start && d.end <= d.start) out.end = 'Choose an end after the start.';
  }
  return out;
}

/** The event a draft makes, with its id. */
export function eventFrom(draft: CalendarEventDraft, id: string): CalendarEvent {
  const title = draft.title.trim();
  return draft.allDay ? { id, title, start: draft.day, allDay: true } : { id, title, start: `${draft.day}T${draft.start}`, end: `${draft.day}T${draft.end}` };
}

/** When an event is, in words: "Tuesday, March 4, 2025, 2:00 PM to 3:00 PM", or "… , all day". */
export function whenWords(e: Pick<CalendarEvent, 'start' | 'end' | 'allDay'>, locale?: string): string {
  const from = asDate(e.start), to = e.end != null ? asDate(e.end) : from;
  const allDay = !!e.allDay || (typeof e.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.start));
  let day: Intl.DateTimeFormat, time: Intl.DateTimeFormat;
  try { day = new Intl.DateTimeFormat(locale, { dateStyle: 'full' }); time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }); }
  catch { day = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }); time = new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }); }
  if (allDay) return dayOf(from) === dayOf(to) ? `${day.format(from)}, all day` : `${day.format(from)} to ${day.format(to)}, all day`;
  if (dayOf(from) === dayOf(to)) return `${day.format(from)}, ${time.format(from)} to ${time.format(to)}`;
  return `${day.format(from)}, ${time.format(from)} to ${day.format(to)}, ${time.format(to)}`;
}

/** The team calendar: a skip link, a header, then main with the calendar's h1, New event and the calendar. */
export function TeamCalendar({ title = 'Team calendar', events: start = demo, defaultMonth = new Date(2025, 2, 1), onAdd, onMove, onDelete, loading = false, loadFailed = false, onRetry, online }: TeamCalendarProps) {
  const locale = useLocale(undefined);
  const [events, setEvents] = React.useState<readonly CalendarEvent[]>(start);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) setEvents(start); }
  const calendar = React.useRef<HTMLDivElement>(null);
  const newButton = React.useRef<HTMLElement | null>(null);
  // Back to the calendar after a dialog closes on something that's gone: its focused day, or the calendar.
  const toCalendar = () => requestAnimationFrame(() => {
    const box = calendar.current;
    (box?.querySelector<HTMLElement>('[tabindex="0"]') ?? box)?.focus();
  });

  // Moving: shown at once, saved after; one that can't be saved goes back, and says so.
  const move = (e: CalendarEvent, to: CalendarSlot) => {
    const moved: CalendarEvent = to.allDay ? { ...e, start: dayOf(to.start), end: dayOf(to.end), allDay: true } : { ...e, start: to.start, end: to.end, allDay: false };
    setEvents((now) => now.map((x) => (x.id === e.id ? moved : x)));
    void Promise.resolve().then(() => onMove?.(e, to)).catch(() => {
      setEvents((now) => now.map((x) => (x.id === e.id ? e : x)));
      toast({ title: `Couldn’t move “${e.title}”`, description: `It’s back on ${whenWords(e, locale)}. Try again.`, tone: 'danger' });
    });
  };

  // Adding: a form, opened by New event or by choosing an empty day or hour.
  const blank = (slot?: CalendarSlot): CalendarEventDraft => slot
    ? { title: '', day: dayOf(slot.start), allDay: slot.allDay, start: slot.allDay ? '09:00' : timeOf(slot.start), end: slot.allDay ? '10:00' : timeOf(slot.end) }
    : { title: '', day: dayOf(defaultMonth), allDay: false, start: '09:00', end: '10:00' };
  const [draft, setDraft] = React.useState<CalendarEventDraft | null>(null);
  const [problems, setProblems] = React.useState<ReturnType<typeof draftProblems>>({});
  const [addFailed, setAddFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const made = React.useRef(0);
  const ask = (slot?: CalendarSlot) => { setDraft(blank(slot)); setProblems({}); setAddFailed(false); };
  const edit = (patch: Partial<CalendarEventDraft>) => {
    if (!draft) return;
    setDraft({ ...draft, ...patch });
    const fixed = Object.keys(patch).concat(patch.start != null || patch.allDay != null ? ['end'] : []);
    if (fixed.some((k) => k in problems)) setProblems((p) => { const next = { ...p }; for (const k of fixed) delete next[k as keyof typeof p]; return next; });
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const found = draftProblems(draft);
    setProblems(found);
    const first = (['title', 'day', 'start', 'end'] as const).find((k) => found[k]);
    if (first) { document.getElementById(`event-${first}`)?.focus(); return; }
    const sent = { ...draft, title: draft.title.trim() };
    setAddFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onAdd?.(sent)).then((id) => {
      const made1 = eventFrom(sent, typeof id === 'string' && id ? id : `new-${++made.current}`);
      setEvents((now) => [...now, made1]);
      setDraft(null);
      toast({ title: `Added “${made1.title}”`, description: whenWords(made1, locale), tone: 'success' });
    }, () => setAddFailed(true)).finally(() => setBusy(false));
  };

  // An event's own dialog: when it is, and Delete.
  const [open, setOpen] = React.useState<CalendarEvent | null>(null);
  const remove = (e: CalendarEvent) => {
    setOpen(null);
    setEvents((now) => now.filter((x) => x.id !== e.id));
    toCalendar();
    toast.undo({
      title: `Deleted “${e.title}”`,
      commit: () => onDelete?.(e),
      onUndo: () => setEvents((now) => (now.some((x) => x.id === e.id) ? now : [...now, e])),
    });
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-6xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">This is the calendar as it was when the page loaded. Adding or moving events needs a connection.</OfflineBanner>
        <PageHeader title={title}
          primary={{ label: 'New event', icon: 'add', onSelect: () => { newButton.current = document.activeElement as HTMLElement | null; ask(); }, disabled: loading || loadFailed }} />
        <div className="pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load the events" onRetry={() => onRetry?.()} headingLevel={2} />
            : loading ? <Card><Skeleton shape="text" lines={6} label="Loading events" /></Card>
            : <EventCalendar ref={calendar} events={events} defaultMonth={defaultMonth} headingLevel={2}
                onSlotSelect={(slot) => { newButton.current = document.activeElement as HTMLElement | null; ask(slot); }}
                onEventClick={setOpen} onEventMove={move} />}
        </div>

        <Dialog open={draft != null} onOpenChange={(o) => { if (!o) setDraft(null); }} title="New event" finalFocus={newButton}>
          {draft ? (
            <form onSubmit={add} noValidate className="flex flex-col gap-4">
              {addFailed ? <Alert tone="danger">Couldn’t add the event. Try again.</Alert> : null}
              <Field label="Title" id="event-title" error={problems.title} required>
                <Input name="title" value={draft.title} autoComplete="off" onChange={(e) => edit({ title: e.target.value })} />
              </Field>
              <Field label="Day" id="event-day" error={problems.day} required>
                <DatePicker name="day" value={draft.day || null} onValueChange={(_, { iso }) => edit({ day: iso ?? '' })} />
              </Field>
              <Switch checked={draft.allDay} onCheckedChange={(on) => edit({ allDay: on })}>All day</Switch>
              {draft.allDay ? null : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Starts" id="event-start" error={problems.start} required>
                    <TimePicker name="start" value={draft.start || null} step={15} onValueChange={(v) => edit({ start: v ?? '' })} />
                  </Field>
                  <Field label="Ends" id="event-end" error={problems.end} required>
                    <TimePicker name="end" value={draft.end || null} step={15} onValueChange={(v) => edit({ end: v ?? '' })} />
                  </Field>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={busy}>Add event</Button>
                <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
              </div>
            </form>
          ) : null}
        </Dialog>

        <Dialog open={open != null} onOpenChange={(o) => { if (!o) setOpen(null); }} title={open?.title ?? ''}
          description={open ? whenWords(open, locale) + (open.repeating ? '. Repeats.' : '') : undefined}>
          {open ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" destructive startIcon="delete" onClick={() => remove(open)}>Delete event</Button>
            </div>
          ) : null}
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}

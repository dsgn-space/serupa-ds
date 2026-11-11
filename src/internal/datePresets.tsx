import * as React from 'react';
import { addDays, day, sameDay } from './dates';

// Preset shortcuts beside a calendar (RU11): "Today", "Last 7 days", "This month" or the app's own. Calendar and
// DatePicker take single days, DateRangePicker ranges; both draw the same list here. A preset whose day (or either
// end) can't be chosen is aria-disabled, and the one the value matches is pressed.

/** A preset as the list draws it: its name and the days it picks (end null for a single day). */
export interface PresetItem { label: string; start: Date | null; end: Date | null }

/** Today's day and the three days DatePicker and Calendar offer with presets={true}. */
export const dayPresets = (w: { today: string; tomorrow: string; inAWeek: string }): PresetItem[] => {
  const t = day(new Date());
  return [{ label: w.today, start: t, end: null }, { label: w.tomorrow, start: addDays(t, 1), end: null }, { label: w.inAWeek, start: addDays(t, 7), end: null }];
};

/** The ranges DateRangePicker offers with presets={true}: today, yesterday, the last 7 and 30 days up to today, and
    this and last calendar month, first day to last. With a max inside this month (a report up to today), "This month"
    ends at max, the month so far, so it can still be picked (GR287). */
export const rangePresets = (w: { today: string; yesterday: string; last7Days: string; last30Days: string; thisMonth: string; lastMonth: string }, max?: Date): PresetItem[] => {
  const t = day(new Date()), y = t.getFullYear(), m = t.getMonth(), first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
  return [
    { label: w.today, start: t, end: t },
    { label: w.yesterday, start: addDays(t, -1), end: addDays(t, -1) },
    { label: w.last7Days, start: addDays(t, -6), end: t },
    { label: w.last30Days, start: addDays(t, -29), end: t },
    { label: w.thisMonth, start: first, end: max && max >= first && max < last ? day(max) : last },
    { label: w.lastMonth, start: new Date(y, m - 1, 1), end: new Date(y, m, 0) },
  ];
};

/** The list: a group of buttons named by label, one per preset, after the days in reading order. */
// For useSyncExternalStore: false in the server render and in hydration, true after it and in a browser-only render.
const never = () => () => {}, yes = () => true, no = () => false;

export function PresetList(p: { label: string; items: PresetItem[]; allowed: (d: Date) => boolean; current: { start: Date | null; end: Date | null }; onPick: (item: PresetItem) => void }): React.ReactElement {
  // The built-in presets follow today, and the server's today can be another day than the visitor's (a UTC server, a
  // visitor in Jakarta before 7am): which one is pressed, or out of range, is only decided after hydration, as the
  // today mark is (GR210), so the server HTML and the first render agree and the visitor's day wins (GR286).
  const hydrated = React.useSyncExternalStore(never, yes, no);
  return (
    <div role="group" aria-label={p.label} className="dk-calendar__presets">
      {p.items.map((it, i) => {
        const off = !it.start || (hydrated && (!p.allowed(it.start) || (!!it.end && !p.allowed(it.end))));
        const on = hydrated && sameDay(it.start, p.current.start) && (it.end ? sameDay(it.end, p.current.end) : true);
        return (
          <button key={i} type="button" className="dk-calendar__preset" aria-pressed={on} aria-disabled={off || undefined} onClick={() => { if (!off) p.onPick(it); }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

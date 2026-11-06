import * as React from "react";
import { addDays, day, sameDay } from "./dates";

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
    this and last calendar month, first day to last. */
export const rangePresets = (w: { today: string; yesterday: string; last7Days: string; last30Days: string; thisMonth: string; lastMonth: string }): PresetItem[] => {
  const t = day(new Date()), y = t.getFullYear(), m = t.getMonth();
  return [
    { label: w.today, start: t, end: t },
    { label: w.yesterday, start: addDays(t, -1), end: addDays(t, -1) },
    { label: w.last7Days, start: addDays(t, -6), end: t },
    { label: w.last30Days, start: addDays(t, -29), end: t },
    { label: w.thisMonth, start: new Date(y, m, 1), end: new Date(y, m + 1, 0) },
    { label: w.lastMonth, start: new Date(y, m - 1, 1), end: new Date(y, m, 0) },
  ];
};

/** The list: a group of buttons named by label, one per preset, after the days in reading order. */
export function PresetList(p: { label: string; items: PresetItem[]; allowed: (d: Date) => boolean; current: { start: Date | null; end: Date | null }; onPick: (item: PresetItem) => void }): React.ReactElement {
  return (
    <div role="group" aria-label={p.label} className="dk-calendar__presets">
      {p.items.map((it, i) => {
        const off = !it.start || !p.allowed(it.start) || (!!it.end && !p.allowed(it.end));
        const on = sameDay(it.start, p.current.start) && (it.end ? sameDay(it.end, p.current.end) : true);
        return (
          <button key={i} type="button" className="dk-calendar__preset" aria-pressed={on} aria-disabled={off || undefined} onClick={() => { if (!off) p.onPick(it); }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

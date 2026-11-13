# EventCalendar

A month of events: meetings, deadlines, bookings. People see what's on each day, move through the month by keyboard, and open an event. A week or a day shows the hours, with each event at its time. On a phone, or by choice, the month shows as an agenda: a list of the days that have events.

**Also called:** scheduler, agenda.

```tsx
import { EventCalendar } from "serupa-ds";

<EventCalendar
  events={[
    { id: "1", title: "Team standup", start: "2025-03-03T09:30", end: "2025-03-03T09:45", repeating: true },
    { id: "2", title: "Launch day", start: "2025-03-12", allDay: true, tone: "success" },
  ]}
  onEventClick={(event) => openDetails(event.id)}
/>
```

## When to use

- A schedule people scan by date: team events, bookings, content going out, deadlines.
- When where an event falls in the month matters, not only what comes next.

## When not to use

- To pick a date or a range: use [DatePicker](../DatePicker/README.md), [DateRangePicker](../DateRangePicker/README.md) or [Calendar](../Calendar/README.md).
- For a few upcoming items with no need for the month around them: a list or a [Timeline](../Timeline/README.md) says it in less space.

## Anatomy

Drawn from the `Month` story.

1. **Toolbar** (`.dk-event-calendar__toolbar`): Today, Previous and Next, the title and the Month, Week, Day and Agenda switch.
2. **Title** (`.dk-event-calendar__heading`): the month, week or day shown, said when it changes.
3. **Grid** (`.dk-event-calendar__grid`): the weeks of the month, with the weekday names above.
4. **Day** (`.dk-event-calendar__day`): one date and its events; today's date is marked by colour and weight, and in the agenda by colour and an underline, so it never rests on colour alone.
5. **Event** (`.dk-event-calendar__event`): a button with the event's time and title, and a bar of its tone at its start.
6. **More** (`.dk-event-calendar__more`): "+N more", which opens the rest of the day's events.

## Usage

- Pass the events of the shown month (more is fine: the rest aren't drawn, and the days of the months before and after show only their dates). Use `onMonthChange` to load each month as people move.
- `start` and `end` take a Date or an ISO string. A plain `"2025-03-12"` is that whole day, wherever the browser is. An event that runs over several days shows on each of them.
- Repeating events are your app's to expand: pass each occurrence, with `repeating: true`, and it's said and marked as repeating.
- `tone` colors an event (`primary`, `info`, `success`, `warning`, `danger`). Say what it means in the title too: color alone doesn't reach everyone.
- Open details from `onEventClick`, in a [Dialog](../Dialog/README.md) or [Drawer](../Drawer/README.md), and give focus back to the event when it closes.
- `maxPerDay` (default 3) is the most a day shows. Past it, the last place shows "+N more", which opens all of the day's events in a Popover.
- The week and day views show the hours in a box that scrolls, opened at 8 AM or the first event if it's earlier. Each event sits at its time, as tall as it lasts (half an hour at least, so it's still a target with its title showing). Events that overlap share the day's width side by side. All-day events are in a row on top, which stays with the weekday names as the hours scroll. Today has a line at the time now, and the time zone shows over the hour scale.
- Previous and Next move a week or a day in those views. `onMonthChange` still gets the month whenever the shown week or day moves into another one, so pass the events of the weeks that cross into the next month too.
- Below 640px wide, the week shows as the agenda, as the month does: seven columns don't fit a phone. The day view stays. A day in the week is never narrower than 96px at the default text size and grows with larger text, so with large text the week scrolls sideways in its box rather than cutting off an event's time.
- Creating events by selecting a time, and moving or resizing them by drag, come in a later step.

### Do and don't

- **Do:** Say what a `tone` means in the title too ("Due: tax filing"). (`DoSayWhatToneMeans`)
- **Don't:** Rely on color alone: it doesn't reach everyone, and red can mean many things. (`DontToneAlone`)

## Accessibility

- **Role and name:** the month is a `role="grid"` named by its title ("March 2025"). The week and day views are a grid with a single row, named by their title ("March 2 – 8, 2025"). Each day in that row is a cell, so the names, keys and Tab stop work as in the month. The hour scale, the time zone and the line at the time now are hidden from screen readers, since each event already says its time. Each day is a cell that starts with its full date and how many events it has ("Tuesday, March 4, 2025, 1 event"), as hidden text so the name never hides the events. Today has `aria-current="date"`. Each event is a button named by what it shows (its time and title), then its day, its whole time and "Repeats" ("2:00 PM Design review, Tuesday, March 4, 2:00 PM to 3:00 PM").
- **Keyboard:** one Tab stop on the days. Arrow keys move a day or a week, Home and End go to the week's start and end, and PageUp and PageDown go a month (a week or a day in those views). Moving past the month shows the next one. Tab from a day goes to its events and "+N more", and Escape on an event goes back to its day. Previous, Next and Today are buttons before the grid.
- **Changes are said:** the month's title is a polite live region, so Previous, Next, Today and paging say the new month.
- **Reading order:** the agenda is an ordered list of days, each with a heading one level below the title, so a screen reader can jump by day.
- **Contrast:** dates, weekday names and event text read 4.5:1 in all six themes (`EventCalendar.test.tsx`).
- **What's still yours:** the event details, and returning focus to the event when they close.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | Into the grid at the focused day (one stop), then to that day's events and "+N more" |
| Arrow keys | A day left or right, a week up or down; past the month shows the next one |
| Home, End | The start or end of the week |
| PageUp, PageDown | The same day a month before or after; in the week and day views, a week or a day |
| Enter, Space (on an event) | Opens it (`onEventClick`) |
| Escape (on an event) | Back to its day |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `events` | `CalendarEvent[]` | required | `{ id, title, start, end?, allDay?, repeating?, tone? }`. |
| `onEventClick` | `(event) => void` | | An event is clicked, or pressed with Enter or Space. |
| `month` | `Date` | | The month shown (controlled), any day in it. Use with `onMonthChange`. |
| `defaultMonth` | `Date` | today's | The month shown at first, any day in it. The week and day views open on that day. |
| `onMonthChange` | `(month: Date) => void` | | The month's first day, when Previous, Next, Today or the keyboard changes it. |
| `view` | `'month' \| 'week' \| 'day' \| 'agenda'` | | The view (controlled). Use with `onViewChange`. |
| `defaultView` | `'month' \| 'week' \| 'day' \| 'agenda'` | `'month'` | Below 640px wide, the month and the week show as the agenda. |
| `onViewChange` | `(view) => void` | | The view switch changed the view. |
| `maxPerDay` | `number` | `3` | The most a day shows before "+N more". |
| `locale` | `string` | provider's | Month, weekday and time names, and the first day of the week. |
| `weekStartsOn` | `0`–`6` | the locale's | 0 is Sunday. |
| `headingLevel` | `2`–`6` | `2` | The title's level. The agenda's days are one below. |

`id`, `className`, `ref` and other props go to the outer `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one EventCalendar. The list lives in `src/components/EventCalendar/event-calendar.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from event-calendar.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--event-calendar-bg` | `surface` | The background. |
| `--event-calendar-text` | `text` | The month's title and the dates (4.5:1 on bg). |
| `--event-calendar-muted` | `text-muted` | Weekday names, the dates of other months, "+N more" and the empty agenda (4.5:1 on bg). |
| `--event-calendar-today` | `primary` | Today's date, in the month and the agenda. |
| `--event-calendar-border` | `border` | The lines between days. |
| `--event-calendar-focus-ring` | `focus-ring` | The focus ring on a day and an event. |
| `--event-calendar-event-bg` | `primary-subtle` | A primary event's fill (other tones use their own subtle color). |
| `--event-calendar-event-text` | `text` | An event's time and title (4.5:1 on each tone's fill). |
| `--event-calendar-event-tone` | `primary` | The bar at the start of an event with no tone. |
| `--event-calendar-info-tone` | `info` | The bar at the start of a tone="info" event. |
| `--event-calendar-info-bg` | `info-subtle` | The fill of a tone="info" event (its text stays event-text, 4.5:1 on it). |
| `--event-calendar-success-tone` | `success` | The bar at the start of a tone="success" event. |
| `--event-calendar-success-bg` | `success-subtle` | The fill of a tone="success" event (its text stays event-text, 4.5:1 on it). |
| `--event-calendar-warning-tone` | `warning` | The bar at the start of a tone="warning" event. |
| `--event-calendar-warning-bg` | `warning-subtle` | The fill of a tone="warning" event (its text stays event-text, 4.5:1 on it). |
| `--event-calendar-danger-tone` | `danger` | The bar at the start of a tone="danger" event. |
| `--event-calendar-danger-bg` | `danger-subtle` | The fill of a tone="danger" event (its text stays event-text, 4.5:1 on it). |
| `--event-calendar-more-bg-hover` | `surface-hover` | "+N more" under the pointer. |
| `--event-calendar-more-bg-pressed` | `pressed` | The "+N more" button's background while it's held down, one step past hover. |
| `--event-calendar-now` | `primary` | The line across today at the time now, in the week and day views. |

**Radius**

| Token | Default | Use |
| --- | --- | --- |
| `--event-calendar-event-radius` | `radius-inner` | An event's corners. |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--event-calendar-day-height` | `spacing-24` | A day's height in the month (96px): room for the date and three events. |
| `--event-calendar-hour-height` | `spacing-12` | An hour's height in the week and day views (48px): half an hour holds an event's time and title. |
| `--event-calendar-hours-max-height` | `container-xl` | How tall the week and day views' hours get before they scroll (576px, twelve hours). |
<!-- token-table:end -->

# RangeCalendar

A calendar on the page that picks a range of days: the check-in and check-out of a booking, a report's period, the first and last day of a leave request. The first day picked is one end and the second the other, with the days between shaded as the pointer or focus moves.

```tsx
import { RangeCalendar } from "serupa-ds";

<RangeCalendar months={2} value={stay} onValueChange={(r) => setStay(r)} min={new Date()} isDateDisabled={booked} />
```

## When to use

- A range picked on a page or panel where the calendar can stay open: a booking page, an analytics side panel, a request form with room for it.
- Days that some can't be picked from, shown as such (`isDateDisabled`): booked nights, holidays.

## When not to use

- A range in a form row or a filter, where two typed fields fit better and the calendar can wait in a popup: use [DateRangePicker](../DateRangePicker/README.md).
- One day: use [Calendar](../Calendar/README.md), or [DatePicker](../DatePicker/README.md) in a form.

## Anatomy

Drawn from the `Playground` story.

1. **Months** (`.dk-range-calendar__months`): one Calendar month, or two side by side.
2. **Ends** (`.dk-calendar__day--selected`): the start and end days, filled.
3. **Range** (`.dk-calendar__day--in-range`): the days between, shaded.
4. **Status** (`.dk-range-calendar__status`): what to pick next, or the range once it's picked.

## Usage

- Use `months={2}` where there's room: a range often runs into the next month. Two months stack on a narrow screen.
- The value changes only when both ends are picked, start first, whichever was picked first. Show what the range means beside it ("5 nights").
- Use `min`, `max` and `isDateDisabled` for days that can't be an end. A disabled day can sit inside a range; check the whole range yourself when it can't.
- Escape, or a press outside the days, leaves the value as it was; Escape drops a half-picked range.

## Accessibility

- **Role and name:** a group named "Choose dates" (or your `aria-label`), holding a grid per month named by its month. The ends are selected days named "…, start date" and "…, end date", and the days between "…, in the range", in words as well as the fill.
- **Keyboard:** each month is Calendar's grid (the table below).
- **Said aloud:** the line under the months says what to pick next ("Choose the end date") and, once both are picked, the range ("Selected range: Nov 3 – 8, 2026"), as a polite live region.
- **Contrast:** the ends, the days between and the status line read 4.5:1 in all six themes (`RangeCalendar.test.tsx`).
- **What's still yours:** what the range means (nights, working days), and whether a range over a disabled day is allowed.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the month buttons, then the day that holds the Tab stop in each month |
| Arrow keys | The day before or after, or the same day a week away; the range previews as focus moves once one end is picked |
| PageUp, PageDown | The same day a month before or after; with Shift, a year |
| Home / End | The first or last day of the week |
| Enter / Space | Picks the focused day: the first pick is one end, the second the other |
| Escape | Drops a half-picked range, keeping the value as it was |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the outer `<div>` |
| `value` | `{ start, end }` \| `null` | | The picked range (controlled); each end a `Date` or `"yyyy-mm-dd"` |
| `defaultValue` | `{ start, end }` | | The range at first (uncontrolled) |
| `onValueChange` | `(range, iso) => void` | | Called once both ends are picked, start first |
| `months` | `1` \| `2` | `1` | Months side by side |
| `month` / `defaultMonth` / `onMonthChange` | `Date` | the start's month | The first month shown |
| `min` / `max` | `Date` \| `string` | | The earliest and latest days that can be an end |
| `isDateDisabled` | `(date) => boolean` | | Days that can't be an end, struck through |
| `locale` | `string` | the provider's | Names and the first day of the week |
| `weekStartsOn` | `0`–`6` | the locale's | |
| `autoFocus` | `boolean` | `false` | Focus the start day (or today) when it appears |

`className`, `ref` and other props go to the outer `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one RangeCalendar. The list lives in `src/components/RangeCalendar/range-calendar.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from range-calendar.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--range-calendar-status-color` | `text-muted` | The line under the months that says what to pick next, and the range once it's picked (4.5:1 on the page). |
| `--range-calendar-months-gap` | `spacing-6` | The space between two months side by side, or stacked. |
<!-- token-table:end -->

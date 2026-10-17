# Calendar

A month of days to pick one from, with full keyboard navigation. DatePicker shows one in a popup; use Calendar on its own for an always-visible picker, such as in a booking page or a side panel.

```tsx
import { Calendar } from "@diki/design-system";

const [day, setDay] = React.useState<Date | null>(null);
<Calendar value={day} onValueChange={setDay} min={new Date()} />
<Calendar defaultValue={new Date(2025, 2, 10)} isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `Date \| null` | | The selected day, controlled or not. Times are ignored. |
| `onValueChange` | `(date: Date) => void` | | Called with the picked day (local midnight). |
| `month` / `defaultMonth` | `Date` | the selected day's month, or today's | The month shown: any day in it. |
| `onMonthChange` | `(month: Date) => void` | | Called with the first of the newly shown month. |
| `min`, `max` | `Date` | | Days outside can't be picked, and the month buttons stop there. |
| `isDateDisabled` | `(date: Date) => boolean` | | Days to refuse, such as weekends or holidays. |
| `locale` | `string` | the browser's | Month and weekday names, and the first day of the week. |
| `weekStartsOn` | `0`–`6` | the locale's | 0 is Sunday. |
| `autoFocus` | `boolean` | `false` | Focus the selected day (or today) when it appears. |
| `previousLabel`, `nextLabel` | `string` | `"Previous month"`, `"Next month"` | The month buttons' names. |

`className`, `ref` and other props go to the outer `<div>`.

## Behavior

- Always six weeks tall, so the layout doesn't jump between months. Days of the months before and after are muted and can be picked.
- Today is in primary and semibold. The selected day is filled in primary.

## Keyboard

| Key | Moves to |
| --- | --- |
| ← → | The day before or after (mirrored right to left). |
| ↑ ↓ | The same day a week before or after. |
| Home, End | The start or end of the week. |
| PageUp, PageDown | The same day a month before or after. With Shift, a year. |
| Enter, Space | Picks the focused day. |

Moving past the shown month shows the next one.

## Accessibility

- A `role="grid"` table named by the month title, which is `aria-live` so screen readers hear the new month. The days have one Tab stop.
- Each day is named by its full date ("Monday, March 10, 2025"). The selected cell is `aria-selected`, today is `aria-current="date"`, and refused days are `aria-disabled` (faded and struck through).
- Weekday headers show the short name and carry the full name in `abbr`.
- Text keeps 4.5:1 and the selected fill 3:1 in all six themes (`tools/test/date-picker.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one calendar. The list lives in `src/components/Calendar/calendar.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--calendar-title-color` | `text` | The month and year. |
| `--calendar-weekday-color` | `text-muted` | The weekday names (4.5:1 on surface). |
| `--calendar-day-color` | `text` | Days of the shown month. |
| `--calendar-outside-color` | `text-muted` | Days of the months before and after. |
| `--calendar-day-bg-hover` | `surface-muted` | A day under the pointer. |
| `--calendar-today-color` | `primary` | Today's number (4.5:1 on surface). |
| `--calendar-selected-bg` | `primary` | The selected day. |
| `--calendar-selected-color` | `on-primary` | Its number. |
| `--calendar-focus-ring` | `focus-ring` | A day's keyboard focus ring. |
| `--calendar-day-size` | `control-height-md` | Each day's square (32px). |
| `--calendar-day-radius` | `rounded-md` | A day's corners (6px). |
| `--calendar-gap` | `spacing-2` | Space between the header and the days (8px). |
| `--calendar-title-weight` | `font-semibold` | The month and year (600). |
| `--calendar-today-weight` | `font-semibold` | Today's number (600). |

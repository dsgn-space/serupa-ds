# DateRangePicker

Two date fields for the start and end of a range (a stay, a report period, a filter), with a popup of two months to pick both.

```tsx
import { DateRangePicker, Field, type DateRange } from "@diki/design-system";

const [stay, setStay] = React.useState<DateRange>({ start: null, end: null });
<Field label="Stay" hint="mm/dd/yyyy">
  <DateRangePicker value={stay} onValueChange={setStay} min={new Date()} startName="check_in" endName="check_out" />
</Field>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `{ start: Date \| null; end: Date \| null }` | | The range, controlled or not. |
| `onValueChange` | `(range: DateRange) => void` | | Called whenever either end changes, so also after the first pick (with `end: null`). |
| `min`, `max` | `Date` | | Days outside can't be either end. |
| `isDateDisabled` | `(date: Date) => boolean` | | Days that can't be an end. They can sit inside a range. |
| `months` | `1 \| 2` | `2` | Months side by side in the popup (stacked below 640px). |
| `locale`, `weekStartsOn` | | the browser's | As in DatePicker. |
| `size`, `invalid`, `disabled`, `readOnly` | | | Like Input. |
| `id` | `string` | | The start field's id, so Field or `<label htmlFor>` focuses it. |
| `startLabel`, `endLabel` | `string` | `"Start date"`, `"End date"` | The fields' names. |
| `startName`, `endName` | `string` | | Hidden inputs that send each end as `yyyy-mm-dd`. |
| `buttonLabel` | `string` | `"Choose dates"` | The calendar button's name, and the popup's. |

`className`, `ref`, `aria-label` and other props go to the box (`role="group"`); `aria-describedby` and `aria-required` (which Field passes) go to both fields.

## Behavior

- In the popup, the first pick is the start and the second the end; a day before the start moves the start instead. Pointing at days previews the range. The popup closes once both ends are set, and on Escape or a click outside.
- Opening it with only a start asks for the end.
- Each field reads typed text on blur and Enter, like DatePicker. Text that can't be used puts back the last good day, and a typed start after the end clears the end.
- Uses Input's box, DatePicker's button and popup (`--date-picker-*` tokens), and Calendar's days (`--calendar-*`, with `--calendar-range-bg` and `--calendar-range-color` for the days between).

## Accessibility

- The box is a `role="group"`; name it with `aria-label` when it has no Field. Each field has its own name.
- The popup is a `role="dialog"` holding one or two Calendars (see Calendar's keyboard table); a polite live line says which end to pick next.
- Days in a range, the status line and the dash keep 4.5:1 in all six themes (`tools/test/date-range-picker.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one picker. The list lives in `src/components/DateRangePicker/date-range-picker.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--date-range-picker-dash` | `text-muted` | The dash between the two fields. |
| `--date-range-picker-status-color` | `text-muted` | "Choose the start date" under the months (4.5:1 on surface). |
| `--date-range-picker-months-gap` | `spacing-6` | Space between the two months (24px). |
| `--date-range-picker-field-width` | `spacing-24` | Each field's width (96px), enough for a full date. |

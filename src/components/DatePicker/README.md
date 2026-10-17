# DatePicker

A date field: people type a date, or pick one from a calendar that opens under the field.

```tsx
import { DatePicker, Field } from "@diki/design-system";

const [due, setDue] = React.useState<Date | null>(null);
<Field label="Due date" hint="mm/dd/yyyy">
  <DatePicker value={due} onValueChange={setDue} min={new Date()} name="due" />
</Field>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `Date \| null` | | The chosen day, controlled or not. |
| `onValueChange` | `(date: Date \| null) => void` | | Called with the new day, or `null` when the field is cleared. |
| `min`, `max`, `isDateDisabled` | | | Days that can't be chosen, typed or picked. |
| `locale` | `string` | the browser's | The typed format and the calendar's names and first day. |
| `weekStartsOn` | `0`–`6` | the locale's | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Like Input. |
| `invalid` | `boolean` | `false` | Like Input. |
| `name` | `string` | | Adds a hidden input that sends `yyyy-mm-dd`. |
| `placeholder` | `string` | the locale's pattern, such as `mm/dd/yyyy` | |
| `buttonLabel` | `string` | `"Choose date"` | The calendar button's name, and the popup's. |

`disabled`, `readOnly`, `id`, `aria-*`, `onBlur`, `onKeyDown` and `ref` go to the text field; `className` and `style` to the box.

## Behavior

- People type in the locale's numeric order (11/22/2025 in en-US, 22.11.2025 in de-DE) or as `2025-11-22` anywhere. Two-digit years are read as 20xx.
- The text is read on blur and on Enter. A date that can't be read, or one that can't be chosen, puts back the last good value. An empty field clears it.
- The calendar opens from the button or Alt+↓ in the field, showing the typed or chosen month with focus on that day. Picking a day, Escape or a click outside closes it and returns focus to the field.
- Uses Input's box (the `dk-input` classes and `--input-*` tokens), so it lines up with other fields.

## Accessibility

- The button has `aria-haspopup="dialog"` and `aria-expanded`; the popup is a `role="dialog"` in the top layer holding a Calendar (see its keyboard table).
- Label the field with Field, `<label htmlFor>` or `aria-label`, and say the format in the hint for people who type.
- The calendar icon keeps 3:1 on the field in all six themes (`tools/test/date-picker.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one picker. The list lives in `src/components/DatePicker/date-picker.tokens.json` (also in `design-tokens/components/`). The calendar inside uses the `--calendar-*` tokens.

| Token | Default | Use |
| --- | --- | --- |
| `--date-picker-button` | `text-muted` | The calendar button's icon (3:1 on the field). |
| `--date-picker-popup-bg` | `surface` | The calendar panel's background. |
| `--date-picker-popup-border` | `border` | Its outline. |
| `--date-picker-popup-shadow` | `shadow-lg` | Its shadow. |
| `--date-picker-popup-radius` | `rounded-lg` | Its corners (8px). |
| `--date-picker-popup-padding` | `spacing-3` | Space inside it (12px). |
| `--date-picker-offset` | `spacing-1` | The gap between the field and the panel (4px). |
| `--date-picker-z-index` | `z-50` | The panel's stacking order, where the top layer isn't available. |

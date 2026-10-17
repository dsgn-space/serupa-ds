# TimePicker

A time-of-day field: people type a time, or pick one from a list.

```tsx
import { Field, TimePicker } from "@diki/design-system";

const [start, setStart] = React.useState<string | null>("09:00");
<Field label="Start time">
  <TimePicker value={start} onValueChange={setStart} min="08:00" max="18:00" step={15} name="start" />
</Field>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `string \| null` | | The time as `"HH:mm"` (24-hour), controlled or not. The same format as `<input type="time">`. |
| `onValueChange` | `(value: string \| null) => void` | | Called with `"HH:mm"`, or `null` when the field is cleared. |
| `min`, `max` | `string` | `"00:00"`, `"23:59"` | The earliest and latest times, typed or picked. |
| `step` | `number` | `30` | Minutes between the times in the list, counted from `min` (or midnight), like `<input type="time">`. Under 1, it's 30. Typed times don't have to fall on a step. |
| `locale` | `string` | the browser's | How times are written. |
| `hour12` | `boolean` | the locale's | 12-hour (2:30 PM) or 24-hour (14:30). |
| `size`, `invalid` | | `'md'`, `false` | Like Input. |
| `name` | `string` | | Adds a hidden input that sends `"HH:mm"`. |
| `placeholder` | `string` | `"hh:mm am"` or `"hh:mm"` | |
| `listLabel` | `string` | `"Choose time"` | The list's name, and the clock button's. |

`disabled`, `readOnly`, `id`, `aria-*`, `onBlur`, `onKeyDown` and `ref` go to the text field; `className` and `style` to the box.

## Behavior

- People type `2:30 pm`, `2:30p`, `2pm`, `14:30`, `1430` or `9`. Without AM or PM, 13–23 are afternoon and 0–11 morning. The text is read on blur and Enter; text that isn't a time, or a time outside `min`–`max`, puts back the last good value.
- The list opens on ↓ or ↑ in the field, or the clock button, with the chosen time (or the one nearest the typed text) highlighted and near the top.
- In the list: ↑ ↓ move one time, PageUp and PageDown four, Ctrl+Home and Ctrl+End to the ends, Enter picks, Escape closes, Tab closes and moves on. Typing while the list is open moves the highlight to the nearest time, and Enter then keeps what was typed. Focus stays in the field throughout, the clock button included.
- Uses Input's box, so it lines up with other fields.

## Accessibility

- The field is an ARIA combobox (`aria-haspopup="listbox"`, `aria-expanded`, `aria-activedescendant`) and the list a `role="listbox"` with `aria-selected` on the chosen time. The check is decorative.
- The clock button is out of the tab order, since ↓ in the field does the same.
- Times keep 4.5:1 (also highlighted), and the check and clock icon 3:1, in all six themes (`tools/test/time-picker.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one picker. The list lives in `src/components/TimePicker/time-picker.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--time-picker-button` | `text-muted` | The clock button's icon (3:1 on the field). |
| `--time-picker-list-bg` | `surface` | The list's background. |
| `--time-picker-list-border` | `border` | The list's outline. |
| `--time-picker-option-color` | `text` | A time in the list. |
| `--time-picker-option-bg-active` | `surface-muted` | The highlighted time (pointer or keyboard). |
| `--time-picker-check` | `primary` | The check by the chosen time (3:1 on surface). |
| `--time-picker-list-shadow` | `shadow-lg` | The list's shadow. |
| `--time-picker-list-radius` | `rounded-lg` | The list's corners (8px). |
| `--time-picker-list-max-height` | `spacing-60` | The list's tallest before it scrolls (240px). |
| `--time-picker-list-min-width` | `spacing-40` | The list's least width (160px). |
| `--time-picker-option-height` | `control-height-md` | Each time's height (32px). |
| `--time-picker-list-padding` | `spacing-1` | Space inside the list (4px). |
| `--time-picker-offset` | `spacing-1` | The gap between the field and the list (4px). |
| `--time-picker-z-index` | `z-50` | The list's stacking order, where the top layer isn't available. |

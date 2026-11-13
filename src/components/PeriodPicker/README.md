# PeriodPicker

A month, a quarter or a year, picked from a grid: for a report's month, a billing period or a dashboard's quarter. It looks like a [Select](../Select/README.md) and opens a popup with the year between two arrows over 12 months, 4 quarters or 12 years. The button shows the period in words ("November 2026", "Q4 2026", "2026") and a form gets it as `2026-11`, `2026-Q4` or `2026`.

```jsx
const { PeriodPicker, Field } = window.Serupa;

<Field label="Report month">
  <PeriodPicker name="month" value={month} onValueChange={(value, { start, end }) => setMonth(value)} />
</Field>

// a quarter, no earlier than the first one on record and no later than this one
<PeriodPicker aria-label="Quarter" unit="quarter" min="2023-Q1" max="2026-Q4" defaultValue="2026-Q4" />

// a fiscal year
<PeriodPicker aria-label="Fiscal year" unit="year" name="year" />
```

## When to use

- A whole month, quarter or year is the answer: a statement, an invoice period, a report, a target.
- Filters on a dashboard or a report page where the data is kept by month or quarter.

## When not to use

- A day: use a [DatePicker](../DatePicker/README.md), or a [DateField](../DateField/README.md) for one people know by heart.
- Any span of days, such as "the last 30 days" or a trip: use a [DateRangePicker](../DateRangePicker/README.md).
- A month and year people know by heart, far from now (a card's expiry date): two [Selects](../Select/README.md) or typed fields are quicker than paging.

## Anatomy

Drawn from the `Months` story.

1. **Button** (`.dk-period-picker__button`): the chosen period in words, or the placeholder, and a calendar icon at the end.
2. **Popup** (`.dk-period-picker__panel`): a dialog named "Choose a month" (or quarter, or year).
3. **Header** (`.dk-period-picker__header`): the year, or the twelve years shown, between the arrows to the page before and after.
4. **Period** (`.dk-period-picker__period`): one month, quarter or year in the grid. The chosen one is filled with `primary`, the current one is `primary` text in semibold, and ones outside `min` and `max` are faded and struck through.

## Usage

- Pick the `unit` the data is kept in. People can't choose half a quarter, so don't offer months when the report only exists by quarter.
- Set `min` and `max` to the periods that have data: no period before the account was opened, none in the future for a statement.
- `onValueChange` gets the value and the period's first and last days (local midnight), ready for a query: `{ start: 1 Nov 2026, end: 30 Nov 2026 }`.
- Months are named in the locale ("November 2026", "Dezember 2025", "Agustus 2025") and years in its digits. A quarter's short name comes from the labels: "Q4" in English, "K4" in Indonesian.
- Years page twelve at a time, from a year that divides by 12 (2016 to 2027, 2028 to 2039), so the same year is always in the same place.

## States

| State | Look |
| --- | --- |
| Rest | `field` background, 1px `field-border`, the icon in `text-muted` |
| Placeholder | "Choose a month" (or `placeholder`) in the `placeholder` color |
| Hover | `field-border-hover`; a period under the pointer is `surface-muted` |
| Focus | Like the other fields: the border and a 1px ring hugging it take the `focus-ring` color (danger when invalid), and stay while the popup is open; a period in the popup gets an outline |
| Open | The popup under the button (above it when there's no room), fading in |
| Invalid | `danger` border, and `aria-invalid` |
| Read-only | `field-readonly` background; it doesn't open |
| Disabled | `field-readonly` background at 50%, `not-allowed` cursor; it doesn't open |

## Accessibility

- **Role and name:** the button is a `combobox` with `aria-haspopup="dialog"` and `aria-expanded`, named by a Field, a `<label>` or `aria-label`, and it reads the chosen period in words. The popup is a `dialog`; its grid is named by the year over it, which is announced when it changes. Each period is a button named in full ("February 2025", "Q1 2025"), the chosen one's cell is `aria-selected`, the current one is `aria-current="date"`, and ones outside `min` and `max` are `aria-disabled`.
- **Keyboard:** see the table. Focus moves into the grid when it opens, onto the chosen period (else the current one), and back to the button when it closes. In right-to-left text the left and right arrows swap.
- **Contrast:** text and placeholder keep 4.5:1 on `field`, the icon 3:1; periods and the year 4.5:1 on the popup, the chosen one on `primary` and the current one in `primary`, in all six themes (`PeriodPicker.test.tsx`). The resting border is soft on purpose (`field-border`: about 1.5:1 in light, 1.9:1 to 2.6:1 in dark), under the 3:1 WCAG 1.4.11 asks of a control's edge: a deliberate design exception. The label above the field, its fill in dark, the accent border on hover and the 3:1 focus ring mark it, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border.
- **What's still yours:** a name for it (Field, `<label>` or `aria-label`), and the error text when a required period is missing.

### Keyboard

| Key | Does |
| --- | --- |
| Enter, Space, ↓, ↑ (on the button) | Opens the popup |
| ← → | The period before or after, onto the page before or after past its ends |
| ↑ ↓ | The same place a row up or down |
| Home, End | The row's first or last period |
| PageUp, PageDown | A year back or on (twelve years for years) |
| Enter, Space | Chooses the period and closes |
| Escape | Closes without a change |

Keys stop at `min` and `max`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `unit` | `'month'` \| `'quarter'` \| `'year'` | `'month'` | What is chosen |
| `value` | string \| null | | The chosen period (controlled): `"2026-11"`, `"2026-Q4"` or `"2026"` |
| `defaultValue` | string \| null | | The period it starts with (uncontrolled), written the same way |
| `onValueChange` | `(value, { start, end }) => void` | | Called with the picked period and its first and last days |
| `min`, `max` | string | | The earliest and latest periods that can be chosen, written as `value` is |
| `locale` | string | the provider's, else the browser's | Month names and digits |
| `placeholder` | string | "Choose a month" | Shown with nothing chosen |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24, 32 or 44px, like Select |
| `invalid` | boolean | `false` | A danger border and `aria-invalid`; set for you in a Field with an error |
| `name` | string | | A form gets the value under it, and a form reset brings back `defaultValue` |
| `defaultOpen` | boolean | `false` | Shows the popup open at first, without moving focus into it |
| `disabled` | boolean | `false` | It can't open, and the form doesn't get its value |
| `readOnly` | boolean | `false` | Shows the period but can't open: focusable and read out (`aria-readonly`), and the form still gets its value, unlike `disabled` |

`ref`, `id`, `aria-*` and other props go to the `<button>`; `className` and `style` go to the wrapper (`data-component="period-picker"`, `data-state`, `data-unit`), full width by default.

## Component tokens

Each is an optional override: set it on the page, a container or one PeriodPicker. The list lives in `src/components/PeriodPicker/period-picker.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from period-picker.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--period-picker-bg` | `field` | The button's background. |
| `--period-picker-text` | `text` | The chosen period on the button, and the popup's text (4.5:1 on both backgrounds). |
| `--period-picker-placeholder` | `placeholder` | The placeholder on the button. |
| `--period-picker-border` | `field-border` | The button's outline (3:1 on the page). |
| `--period-picker-border-hover` | `field-border-hover` | The button's outline on hover. |
| `--period-picker-invalid` | `field-border-invalid` | The outline and focus ring when invalid. |
| `--period-picker-bg-disabled` | `field-readonly` | The button's background when read-only or disabled. |
| `--period-picker-icon` | `text-muted` | The calendar icon on the button. |
| `--period-picker-focus-ring` | `focus-ring` | The focus ring, on the button and on a period. |
| `--period-picker-panel-bg` | `surface-overlay` | The popup's background. |
| `--period-picker-panel-border` | `border-overlay` | The popup's outline. |
| `--period-picker-period-bg-hover` | `surface-muted` | A period under the pointer. |
| `--period-picker-period-bg-pressed` | `pressed` | A period while pressed. |
| `--period-picker-current` | `primary` | This month, quarter or year (4.5:1 on panel-bg). |
| `--period-picker-bg-selected` | `primary` | The chosen period's fill. |
| `--period-picker-selected-bg` | `primary` | The old name of `--period-picker-bg-selected`, read when that isn't set. Removed in 15.0.0. |
| `--period-picker-text-selected` | `on-primary` | The chosen period's text (4.5:1 on selected-bg). |
| `--period-picker-selected-text` | `on-primary` | The old name of `--period-picker-text-selected`, read when that isn't set. Removed in 15.0.0. |

**Radius**

| Token | Default | Use |
| --- | --- | --- |
| `--period-picker-radius` | `radius-control` | The button's corners. |
| `--period-picker-panel-radius` | `radius-surface` | The popup's corners. |
| `--period-picker-period-radius` | `radius-control` | A period's corners. |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--period-picker-panel-shadow` | `elevation-overlay` | The popup's shadow. |
| `--period-picker-depth` | `depth-field` | The button's tactile inner shade, as Select's. None in the flat brands. |
| `--period-picker-panel-depth` | `depth-surface` | The panel's tactile hairline and, in dark mode, a faint top light, as DatePicker's popup. None in the flat brands. |
| `--period-picker-depth-selected` | `depth-part` | The chosen period in a tactile brand: raised like a part under the top light, as Calendar's selected day. None in the flat brands. |
| `--period-picker-selected-depth` | `depth-part` | The old name of `--period-picker-depth-selected`, read when that isn't set. Removed in 15.0.0. |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--period-picker-padding-x` | `spacing-3` | The button's side padding at md (12px). |
| `--period-picker-panel-padding` | `spacing-3` | Space inside the popup (12px). |
| `--period-picker-panel-width` | `spacing-64` | The popup's width (256px), at most the screen's less 16px a side. |
| `--period-picker-gap` | `spacing-1` | Space between the periods (4px). |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--period-picker-height-sm` | `control-height-sm` | The button's height at sm (24px). |
| `--period-picker-height-md` | `control-height-md` | The button's height at md (32px). |
| `--period-picker-height-lg` | `control-height-lg` | The button's height at lg (44px). |

**z-index**

| Token | Default | Use |
| --- | --- | --- |
| `--period-picker-z-index` | `z-popover` | The popup's stacking level. |
<!-- token-table:end -->

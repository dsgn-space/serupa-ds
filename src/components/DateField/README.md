# DateField

A date people know or copy from a document, such as a date of birth or a passport's expiry, typed as day, month and year in three labelled boxes, in the locale's order. The app gets `YYYY-MM-DD`, and is told what's wrong while it isn't a date, so it can word the error.

```tsx
import { DateField, Field } from "serupa-ds";

<Field label="Date of birth" hint="For example, 27 3 2007" error={error}>
  <DateField name="dob" autoComplete="bday" order="dmy" max={today} onValueChange={(value, { problem }) => setProblem(problem)} />
</Field>
```

## When to use

- A date of birth, or a date on a card, passport, ID or letter: one people type from memory or copy, often years from today.
- Forms filled in on a phone: the three boxes bring up the number keypad, and the browser can fill a date of birth.

## When not to use

- A date near today, or one picked by weekday ("next Tuesday", a booking, a deadline): use a [DatePicker](../DatePicker/README.md), whose calendar shows the days around it.
- A start and end date: use a [DateRangePicker](../DateRangePicker/README.md).
- A month and year only, such as a card's expiry: use an [Input](../Input/README.md) with `autoComplete="cc-exp"` and a hint ("MM/YY, like 08/27").

## Anatomy

Drawn from the `Playground` story.

1. **Group** (`.dk-date-field`): the three parts in a row, named by the Field's label. In a narrow column the parts wrap.
2. **Part** (`.dk-date-field__part`): a small label (`.dk-date-field__label`), Day, Month or Year, over its box.
3. **Box** (`.dk-date-field__input`): an [Input](../Input/README.md) sized for two digits, or four for the year.

## Usage

- Name it with a [Field](../Field/README.md) label ("Date of birth") or `aria-label`, and give an example in the hint, in the boxes' order ("For example, 27 3 2007" with `order="dmy"`, "3 27 2007" with `"mdy"`). Without `order` the boxes follow the locale, so set it whenever the hint is fixed text, and use a day over 12 so the example shows which box is which.
- Typing is free: nothing is blocked or moved on its own, so a mistake can be read and fixed. A `/`, `.`, `-` or space after a number moves to the next box, and a whole date pasted into any box ("17/08/1945", "1945-08-17", "17 Agustus 1945") fills all three.
- `onValueChange(value, details)` gives `YYYY-MM-DD`, or `""` until the boxes make a real date. `details.problem` says what's wrong: `"empty"`, `"missing-day"`, `"missing-month"`, `"missing-year"` (also a year under 4 digits), `"not-a-date"` (31 April, month 13), `"before-min"` or `"after-max"`; `details.parts` says in which boxes. Word the error from it, GOV.UK style: "Date of birth must include a month", "Date of birth must be in the past".
- `min` and `max` don't stop anything being typed; a date outside them still comes as its value, with its problem.
- With `invalid` (a Field with an error sets it), only the boxes the problem is in are marked, or all three when it's about the whole date.
- With `name`, a hidden input sends `YYYY-MM-DD` ("" while it isn't a date), and `form.reset()` goes back to `defaultValue`.
- Controlled, `value=""` empties the boxes only when they held a date, so a part typed so far stays.
- `autoComplete="bday"` for a date of birth lets the browser fill it.

## Accessibility

- **Role and name:** a `group` named by its Field label or `aria-label`, and described by the Field's hint and error. Each box is a text field named by its own label, Day, Month or Year; `inputmode="numeric"` brings up a number keypad without `type="number"`'s spin buttons, its dropped leading zeros or its "e". The boxes the problem is in carry `aria-invalid` (the group can't); the error is read with the group, as its description, when focus enters it.
- **Keyboard:** Tab moves through the three boxes. Focus never jumps by itself when a box is full, which would surprise people who look at the keyboard while typing and those who use a screen reader; a typed separator moves on instead. Clicking the Field's label focuses the first box.

| Key | Does |
| --- | --- |
| Tab, Shift+Tab | Moves between the Day, Month and Year boxes, and out. |
| `/` `.` `-` Space | After a number, moves to the next box. In an empty box or the last one, does nothing. |
| Ctrl+V, ⌘V | A whole date fills all three boxes; a number alone goes in the box. |

- **Contrast:** the labels read 4.5:1 on the surface in all six themes (`DateField.test.tsx`); the boxes are Inputs.
- **What's still yours:** the label and example, checking the date when the form is sent, and the error's words (`details.problem` says which).

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the root `<div role="group">`. A `<label htmlFor>` can't name a group; inside a Field, the Field's label names it through this id. |
| `value` | `string` | | The date (controlled), `YYYY-MM-DD`, or `""`. |
| `defaultValue` | `string` | | The date at first (uncontrolled), `YYYY-MM-DD`; `form.reset()` goes back to it. |
| `onValueChange` | `(value: string, details: DateFieldChangeDetails) => void` | | On every change. `details`: `{ day, month, year, problem, parts, reason }`, `reason` being `"type"`, `"paste"` or `"reset"`. |
| `min` | `string` | | The earliest right date, `YYYY-MM-DD`; earlier ones say `"before-min"`. |
| `max` | `string` | | The latest right date, `YYYY-MM-DD`; later ones say `"after-max"`. |
| `order` | `"dmy" \| "mdy" \| "ymd"` | the locale's | The boxes' order. |
| `autoComplete` | `"bday" \| "off"` | `"off"` | `"bday"` asks for `bday-day`, `bday-month` and `bday-year`. |
| `name` | `string` | | Sends `YYYY-MM-DD` with a form in a hidden input. |
| `form` | `string` | | The id of a form elsewhere on the page. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | The boxes' size, as Input's. |
| `disabled` | `boolean` | `false` | Turns the boxes off; nothing is sent. |
| `readOnly` | `boolean` | `false` | The boxes stay focusable and read out as read-only, and the date is still sent, unlike `disabled`; typing and a pasted date change nothing. |
| `invalid` | `boolean` | `false` | Marks the boxes the problem is in. Field sets it from its error. |

`className`, `ref` and other props go to the group's `<div>`; `ref.current.focus()` and `autoFocus` focus the first box.

## Component tokens

Each is an optional override: set it on the page, a container or one DateField. The list lives in `src/components/DateField/date-field.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from date-field.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--date-field-label` | `text` | The labels over the boxes (4.5:1 on the surface). |
| `--date-field-label-size` | `text-sm` | The labels' text (14px). |
| `--date-field-gap` | `spacing-4` | Space between the boxes (16px). |
| `--date-field-label-gap` | `spacing-1` | Space between a label and its box (4px). |
| `--date-field-short-width` | `spacing-16` | The day and month boxes' width, for two digits (64px). |
| `--date-field-year-width` | `spacing-24` | The year box's width, for four digits (96px). |
<!-- token-table:end -->

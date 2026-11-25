# DateField

A date people know or copy from a document, such as a date of birth or a passport's expiry, typed as day, month and year in three labeled boxes, in the locale's order. The app gets `YYYY-MM-DD`, and is told what's wrong while it isn't a date, so it can word the error.

**Also called:** date input, segmented date input.

```tsx
import { DateField, Field } from "@diki-stwn/serupa-ds";

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

1. **Group** (`.srp-date-field`): the three parts in a row, named by the Field's label. In a narrow column the parts wrap.
2. **Part** (`.srp-date-field__part`): a small label (`.srp-date-field__label`), Day, Month or Year, over its box.
3. **Box** (`.srp-date-field__input`): an [Input](../Input/README.md) sized for two digits, or four for the year.

## Usage

- Name it with a [Field](../Field/README.md) label ("Date of birth") or `aria-label`, and give an example in the hint, in the boxes' order ("For example, 27 3 2007" with `order="dmy"`, "3 27 2007" with `"mdy"`). Without `order` the boxes follow the locale, so set it whenever the hint is fixed text, and use a day over 12 so the example shows which box is which.
- The boxes take digits only, up to 2, 2 and 4: a letter typed or pasted is dropped, and digits in any script are read as 0–9. A wrong number isn't blocked or changed (a day of 55 stays), so a mistake can be read and fixed. A `/`, `.`, `-` or space after a number moves to the next box, and a whole date pasted into any box ("17/08/1945", "1945-08-17", "17 Agustus 1945") fills all three.
- `onValueChange(value, details)` gives `YYYY-MM-DD`, or `""` until the boxes make a real date. `details.problem` says what's wrong: `"empty"`, `"missing-day"`, `"missing-month"`, `"missing-year"` (also a year under 4 digits), `"not-a-date"` (31 April, month 13), `"before-min"` or `"after-max"`; `details.parts` says in which boxes. Word the error from it, GOV.UK style: "Date of birth must include a month", "Date of birth must be in the past".
- Once focus leaves the date, or the form is sent, it says what's wrong under the boxes and marks the box to fix: "Day must be between 1 and 31", "Month must be between 1 and 12", "Year must have 4 numbers", "Enter the month", "Enter a real date: February 2025 has 28 days", "Enter a date on or before 14 November 2026". It's about the first box that's wrong, and follows what's typed after that. A form isn't sent while the date is wrong: focus goes to the box instead. The message waits until a click that took focus away has landed, so it doesn't move the button from under the pointer. When the app marks it `invalid` (a Field with an error), the Field's words show instead, so nothing is said twice.
- `monthInput="select"` makes the month a menu of the locale's month names (Januari, Februari… in id-ID), for people who know the month by name. The value is the same.
- `min` and `max` don't stop anything being typed; a date outside them still comes as its value, with its problem, and its message names the date.
- With `invalid` (a Field with an error sets it), only the boxes the problem is in are marked, or all three when it's about the whole date.
- With `name`, a hidden input sends `YYYY-MM-DD` ("" while it isn't a date), and `form.reset()` goes back to `defaultValue`.
- Controlled, `value=""` empties the boxes only when they held a date, so a part typed so far stays.
- `autoComplete="bday"` for a date of birth lets the browser fill it.

### Do and don't

- **Do:** Give an example in the hint, in the boxes' order ("For example, 27 3 2007" with `order="dmy"`). (`DoExampleHint`)
- **Don't:** Leave out the example: people guess whether the day or the month comes first. (`DontNoExample`)

## Accessibility

- **Role and name:** a `group` named by its Field label or `aria-label`, and described by the Field's hint and error. Each box is a text field named by its own label, Day, Month or Year; `inputmode="numeric"` brings up a number keypad without `type="number"`'s spin buttons, its dropped leading zeros or its "e". The boxes the problem is in carry `aria-invalid` (the group can't); the error is read with the group, as its description, when focus enters it.
- **Keyboard:** Tab moves through the three boxes. Focus never jumps by itself when a box is full, which would surprise people who look at the keyboard while typing and those who use a screen reader; a typed separator moves on instead. Clicking the Field's label focuses the first box.

| Key | Does |
| --- | --- |
| Tab, Shift+Tab | Moves between the Day, Month and Year boxes, and out. |
| `/` `.` `-` Space | After a number, moves to the next box. In an empty box or the last one, does nothing. |
| Ctrl+V, ⌘V | A whole date fills all three boxes; a number alone goes in the box. |

- **Contrast:** the labels read 4.5:1 on the surface in every theme (`DateField.test.tsx`); the boxes are Inputs.
- **The message:** its line is the group's description and each marked box's, so it's read on entering the date and on the box to fix. It comes in all 20 languages, from the `dateFieldError` label.
- **What's still yours:** the label and example, and the error's words when you want your own (`details.problem` says which, and `invalid` on the DateField or an error on its Field takes the message's place).

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
| `monthInput` | `"number" \| "select"` | `"number"` | The month as a number box, or a menu of the locale's month names. The value is the same either way. |
| `disabled` | `boolean` | `false` | Turns the boxes off; nothing is sent. |
| `readOnly` | `boolean` | `false` | The boxes stay focusable and read out as read-only, and the date is still sent, unlike `disabled`; typing and a pasted date change nothing. |
| `invalid` | `boolean` | `false` | Marks the boxes the problem is in. Field sets it from its error. |
| `required` | `boolean` | `false` | A date must be given: `aria-required` on the boxes, and the form isn't sent while they're empty (they're marked and the first takes focus; the Field's error says why). A required Field sets only `aria-required`, as it does on an Input. |

`className`, `ref` and other props go to the group's `<div>`; `ref.current.focus()` and `autoFocus` focus the first box.

## Component tokens

Each is an optional override: set it on the page, a container or one DateField. The list lives in `src/components/DateField/date-field.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from date-field.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--date-field-label` | `text` | The labels over the boxes (4.5:1 on the surface). |
| `--date-field-text-disabled` | `disabled-text` | Disabled: the text, icon or mark, in place of fading it (3:1 or more on its background, more with more contrast). |
| `--date-field-label-size` | `text-sm` | The labels' text (14px). |
| `--date-field-gap` | `spacing-4` | Space between the boxes (16px). |
| `--date-field-label-gap` | `spacing-1` | Space between a label and its box (4px). |
| `--date-field-short-width` | `spacing-16` | The day and month boxes' width, for two digits (64px). |
| `--date-field-year-width` | `spacing-24` | The year box's width, for four digits (96px). |
| `--date-field-error-icon-size` | `spacing-4` | The error icon beside the 14px message (16px). |
<!-- token-table:end -->

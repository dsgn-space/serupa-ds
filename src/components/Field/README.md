# Field

A label, an optional hint and a message (an error, a warning or "checking…") around one form control, wired up for screen readers. The label names the control, the hint and error are added to its `aria-describedby`, and an error makes the control invalid. It works with Input, Textarea, Select and any native control, a plain `<select>` with its options included. With `group` it renders a `<fieldset>` and `<legend>` for a set of checkboxes or radios.

**Also called:** form field, form label, fieldset.

```jsx
import { Field, Input, Textarea } from '@diki-stwn/serupa-ds';

<Field label="Email" hint="We only use it for receipts." error={emailError} required>
  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>

<Field label="Company" optional><Input /></Field>
<Field label="Notes" hint="Anything the team should know."><Textarea rows={3} /></Field>

// a set of choices: a fieldset with a legend
<Field group label="Plan" hint="You can change it later." error={planError}>
  <RadioGroup name="plan" value={plan} onValueChange={setPlan}>
    <Radio value="free">Free</Radio>
    <Radio value="pro">Pro</Radio>
  </RadioGroup>
</Field>
```

## When to use

- Any form control that needs a visible label, with or without a hint or an error: an [Input](../Input/README.md), a [Select](../Select/README.md), a [Textarea](../Textarea/README.md) or a native control.
- A set of checkboxes or radios that answer one question, with `group`.

## When not to use

- A single [Checkbox](../Checkbox/README.md) or [Switch](../Switch/README.md): it carries its own label (its children), so use it on its own.
- A control with no visible label, such as a row checkbox in a table: give the control an `aria-label` instead.

## Anatomy

Drawn from the `Horizontal` story.

1. **Label** (`.srp-field__label`): names the control; clicking it focuses the control.
2. **Optional** (`.srp-field__optional`): says the field can be left empty, when most are required.
3. **Control** (`.srp-field__control`): the input, select or other control it wraps.
4. **Hint** (`.srp-field__hint`): help on what to enter, linked to the control for screen readers.
5. **Error** (`.srp-field__error`): what's wrong and how to fix it, with an icon, linked to the control too. A warning (`.srp-field__warning`) or "checking…" (`.srp-field__checking`) sits in the same place.

## Usage

- Keep labels short and specific ("Work email", not "Please enter your email address"). Put format help in the hint, never only in the placeholder.
- Show errors after someone leaves the field or submits, not on every keystroke, and on submit move focus to the first field with an error.
- Native constraints (`required`, `type="email"`, `minLength`, `pattern`, `min`…) speak for themselves: once people have changed the control and left it, or tried to send the form (`:user-invalid`), and it fails one, the error slot says which, in the provider's words (`invalidValue`; English keeps the browser's own message), with `aria-invalid` and the description. It goes as soon as the value is fine, and on the form's reset. An `error` you pass, or a FormErrors message, wins. So a red border is never the only sign.
- Mark both: `required` on every field that must be filled and `optional` on every one that can be left empty, and say once before the form what the `*` means ("Fields marked * are required."). The [Forms](?path=/docs/guides-forms--docs) guide says why. The `*` is hidden from screen readers, which say "required" from the control.
- Stack fields with `gap-5` or `gap-6` between them.
- For a dense settings page, use `orientation="horizontal"`: the labels line up in a column at the start and the controls beside them. Keep labels short enough for the 192px column (`--field-label-width`). Give fields a full-width parent: a horizontal field stacks again on its own once it's too narrow for both columns. A set of checkboxes or radios (`group`) stays stacked.

- Use `warning` for advice that doesn't stop the form: "A project with this name was archived last year", "This date is a public holiday". The control stays valid and the form sends. If the answer can't be sent, it's an `error`.
- Use `checking` while an answer is checked on the server (a username, an address, a coupon), with words that say what: "Checking the name…". Set it once the check takes longer than a moment, and replace it with an `error`, a `warning` or nothing when the answer comes. Field shows one message at a time: an error, then "checking…", then a warning.
- Don't confirm a right answer field by field. People expect it to be right; a green tick on each field is noise.

### Do and don't

- **Do:** Put format help in the hint, where it stays in view while people type. (`DoHintForFormat`)
- **Don't:** Put it only in the placeholder: it goes at the first keystroke, and its pale text is hard to read. (`DontPlaceholderFormat`)

### Errors from the server

When the server answers a submit with errors by field name, wrap the form in `FormErrors` and pass them all at once. Each Field finds its own message by its control's `name` (or the Field's own `name`, for a control that names itself differently), and shows it like `error`: `aria-invalid` on the control, the message in its description. Typing in the field, or changing it, takes its message away, since it was about the value that was sent. A new `errors` object (the next submit) shows every message again, and `null` clears them. A Field's own `error` wins over the server's.

```tsx
<form action={send}>
  <FormErrors errors={state.errors}>
    <ErrorSummary />
    <Field label="Email"><Input name="email" type="email" /></Field>
    <Field label="Username"><Input name="username" /></Field>
  </FormErrors>
</form>
```

### Layout

Label, control, hint and error stack with 6px between them (`--field-gap`): the hint sits under the box, and the error under the hint. With `orientation="horizontal"`, the label takes a 192px column (`--field-label-width`) 16px from the control (`--field-column-gap`). Its text sits on the control's first line (baselines aligned), and the hint and error go under the control. Once the control column would be narrower than 256px (`--field-control-min-width`), it wraps under the label, so the field is stacked again. The label is `text-sm` in `font-medium`; the hint and the message are a size smaller, `text-xs`. The message's 14px icon sits centered on its first line. A group's legend lays out exactly like a label.

## Accessibility

- Screen readers read the label as the control's name and the hint and error as its description, so a person hears "Email, required, invalid entry, We only use it for receipts. Enter an email address like name@example.com."
- Say what went wrong and how to fix it, not just "Invalid". The error icon is decorative; the words carry the meaning.
- With an error, the control also points at it with `aria-errormessage`, at any depth. The error stays in the description too, because not every screen reader reads `aria-errormessage` yet.
- Clicking the label focuses the control, as with an input, also for Slider, SegmentedControl and ColorPicker. Their root is a `<div>`, which a label can't focus by itself, so Field moves focus to their thumb or checked option.
- The `*` is hidden from screen readers, which hear `aria-required` instead. A fieldset can't carry `aria-required`, so with `group` the legend also says "Required" in words, hidden from sight (the `required` label, "Wajib diisi" in `idLabels`): the set is read as "Contact by, Required, group" whatever it holds.
- An error that appears or changes after the Field mounts (after a submit, for example) is announced politely, since focus is usually elsewhere and a description is only read on focus. An error already there on first render isn't announced, and neither are errors that appear as an ErrorSummary in the same form takes focus, since the summary reads them all.
- If nothing on the page has the control's id (a control Field can't reach, with no `id` passed), Field warns once in the console: the label would name nothing.
- For radios and checkboxes use `group`: screen readers announce the legend when focus enters the set.
- A warning and "checking…" join the control's description like an error, and are announced politely when they appear, but don't make the control invalid. While checking, the Field has `aria-busy`. The warning's icon and the spinner are decorative.
- Label, hint, error, warning and `*` keep 4.5:1 on `surface` in every theme (`Field.test.tsx`).
- **Keyboard:** nothing of its own. Tab goes to the control it wraps, and a click on the label focuses that control.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | text or element | | A `<label>` linked to the control; with `group`, the fieldset's `<legend>` |
| `hint` | text or element | | Help under the control (with `group`, under the choices), above the error, in `text-muted`; added to the control's `aria-describedby` |
| `warning` | text or element | | Advice under the control, in `warning-text` with an icon, that doesn't block sending: the control stays valid. Added to its `aria-describedby` and said politely. An error takes its place |
| `checking` | text or element | | While the answer is being checked: the words ("Checking the address…") with a small spinner, under the control; `aria-busy` on the Field. Added to the description and said politely. Takes a warning's place; an error takes its place |
| `error` | text or element | | A message under the control, in `danger-text` with an icon; makes the control invalid (`invalid` on Serupa components, `aria-invalid` on DOM elements) and is added to its `aria-describedby` |
| `required` | boolean | `false` | A `*` after the label (hidden from screen readers) and `aria-required` on the control; with `group`, "Required" in words in the legend for screen readers. Add the control's own `required` too if you want the browser's check |
| `optional` | boolean or text | `false` | "(optional)" after the label (the `fieldOptional` label, "(opsional)" in `idLabels`), or your own words. Ignored with `required` |
| `disabled` | boolean | `false` | Disables the control (with `group`, every control in the fieldset) and draws the label and hint in `disabled-text` |
| `group` | boolean | `false` | A `<fieldset>` and `<legend>` around a set of controls; the hint and error describe the fieldset |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | `'horizontal'`: the label in a column beside the control, the hint and error under the control. It stacks again when narrow. Not with `group` |
| `id` | string | | The control's id; by default the control's own `id`, or a generated one |
| `name` | string | | The name that picks this field's message from a surrounding `FormErrors`; by default the control's own `name` |

Field takes one control as its child (any number with `group`). The control keeps its own props, `ref` and `aria-describedby` (Field's ids are added after yours). `className`, `ref` and any other attribute go to the outer element (a `<fieldset>` with `group`, otherwise a `<div>`), which has `data-component="field"`: a ref lets an app scroll to or measure a field with an error.

### FormErrors

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `errors` | `Record<string, ReactNode>` \| null | | The form's errors by field name, as the server sent them. Each Field inside shows its own; a new object shows them all again, `null` clears them |
| `children` | element | | The form, or the part of it the errors are about |

## Component tokens

Each is an optional override: set it on the page, a container or one field. The list lives in `src/components/Field/field.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from field.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--field-text` | `text` | Text with no token of its own (the label, hint and error have theirs) |
| `--field-label-color` | `text` | Label |
| `--field-hint-color` | `text-muted` | Hint and "(optional)" |
| `--field-error-color` | `danger-text` | Error message and its icon |
| `--field-warning-color` | `warning-text` | A warning message and its icon |
| `--field-checking-color` | `text-muted` | The "checking…" message and its spinner |
| `--field-required-color` | `danger-text` | The `*` |
| `--field-text-disabled` | `disabled-text` | Disabled: the text, icon or mark, in place of fading it (3:1 or more on its background, more with more contrast). |
| `--field-label-weight` | `font-medium` | Label weight (500) |
| `--field-gap` | `spacing-1.5` | Space between label, hint, control and error (6px) |
| `--field-error-gap` | `spacing-1` | Error icon to text (4px) |
| `--field-column-gap` | `spacing-4` | `orientation="horizontal"`: label column to control (16px) |
| `--field-end-gap` | `spacing-4` | The least space between the hint or message and an item at the end of its row, such as Textarea's count (16px). |
| `--field-error-icon-size` | `spacing-3.5` | The icon of an error, a warning or "checking…" (14px), on the 12px message's first line |
| `--field-label-width` | `spacing-48` | `orientation="horizontal"`: the label column (192px) |
| `--field-control-min-width` | `container-3xs` | `orientation="horizontal"`: the narrowest control column before it wraps under the label (256px) |
<!-- token-table:end -->

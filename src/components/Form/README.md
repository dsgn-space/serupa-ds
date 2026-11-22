# Form

A `<form>` checked against one schema. The schema says what each answer must be and what to say when it isn't; the form shows that on each field at the right moment, lists every problem at the top when a submit fails, and hands `onSubmit` the checked values, typed. No field needs wiring: each Field finds its message by its control's `name`.

**Also called:** form validation, schema form, form wrapper.

```tsx
import * as z from "zod";
import { Form, Field, Input, Button } from "@diki-stwn/serupa-ds";

const SignUp = z.object({
  name: z.string().min(1, "Enter your full name"),
  email: z.email("Enter an email address like name@example.com"),
});

<Form aria-label="Create an account" schema={SignUp} onSubmit={async (values) => { await api.signUp(values); }}>
  <Field label="Full name"><Input name="name" autoComplete="name" /></Field>
  <Field label="Email"><Input name="email" type="email" autoComplete="email" /></Field>
  <Button type="submit">Create account</Button>
</Form>
```

## When to use

- Any form people submit: sign-up, checkout, settings, an application. One schema gives the rules, the messages and the types.
- A form in steps ([FormSteps](#steps)), one that keeps a draft, or one whose server can turn the answers down.

## When not to use

- A single control that saves itself as it changes, such as a [Switch](../Switch/README.md) in a settings list: no submit, so no form to check.
- Editing one value where it's shown: use [InlineEdit](../InlineEdit/README.md).
- A search box: use [SearchInput](../SearchInput/README.md) in a plain `<form role="search">`.

## Anatomy

Drawn from the `MultiStep` story. The parts are FormSteps'.

1. **Progress** (`.srp-form-steps__progress`): the Stepper above the steps, showing which one people are on.
2. **Step** (`.srp-form-steps__panel`): one step's fields; the steps not showing stay in the form, hidden.
3. **Step heading** (`.srp-form-steps__title`): the step's title; focus moves here when people move to the step.
4. **Buttons** (`.srp-form-steps__actions`): Next (or the last step's submit button), then Back.

## Usage

- **Any schema library.** Pass a Zod 4 (or 3.24 and later), Valibot 1, ArkType or other [Standard Schema](https://standardschema.dev). Serupa depends on none of them: use the one the project has. Without a schema, the controls' own constraints (`required`, `type="email"`, `maxLength`) are checked, in the provider's words.
- **Names are paths.** `name="address.city"` is `{ address: { city } }`, and a [FieldList](../FieldList/README.md)'s `people[1].email` is `{ people: [, { email }] }`. A schema issue at that path is that field's message.
- **Values come as the controls hold them**: text as strings, a lone checkbox as `true` or `false`, a set of checkboxes with one name as the values checked, radios as the one checked. Turn text into numbers or dates in the schema: `z.string().min(1, "Enter your age").transform(Number).pipe(z.number().min(18, "You must be 18 or over"))`.
- **When it checks** (the [Forms](?path=/docs/guides-forms--docs) rules): a field when it's left, never while it's typed in; once it has shown a message, again as it changes, so the message goes the moment the answer is right; everything on submit. A message that depends on another field ("The passwords don't match") updates as either changes.
- **The messages** are the schema's: say what's wrong and how to fix it, "Enter a date in the future", not "Invalid date". The same words show on the field and in the summary.
- **A failed submit** shows an [ErrorSummary](../ErrorSummary/README.md) at the top, listing the problems in the fields' order, each a link to its field; it takes focus, and the page's title starts with "Error:" while it shows. `summary={false}` leaves it out (place your own `<ErrorSummary />` inside the form, or focus moves to the first field with a problem).
- **The server's answer**: return `{ errors: { email: "That email already has an account" }, message }` from `onSubmit`, or pass `errors` and `message` (a form action's answer). Each shows on its field, and in the summary; `message` shows in an alert at the top. Editing a field takes its server message away.
- **Checks after the schema**, such as "That username is taken": `checks={{ username: async (value, { signal }) => … }}` runs once the field passes the schema, says "Checking…" under it meanwhile, cancels an older check when the value changes, and waits for a pause in typing. Submit waits for them.
- **Fields that depend on others**: `useFormValue("country")` inside the form gives a field's value as it changes. Render the dependent field only when it applies, and let the schema require it only then.
- **Drafts**: `draft="application"` keeps the answers in the browser as people type and fills them back in when they come back; passwords, card numbers and one-time codes are never kept. It's forgotten once the form is sent. `useForm()` gives `draftSavedAt` for a [SaveStatus](../SaveStatus/README.md), `draftRestored`, and `discardDraft()` for a "Start again" button.
- **Unsaved changes**: `warnUnsaved` asks before the page is closed or reloaded while there are changes that weren't sent. In a [Dialog](../Dialog/README.md), pass `onUnsavedChanges` to its `unsaved`, so closing it asks "Discard changes?" first.
- **Sending**: a submit [Button](../Button/README.md) inside shows loading while `onSubmit`'s promise runs, and a second submit does nothing until it settles. Keep what people typed when it fails.
- **`defaultValues`** fill the fields by name; a control's own `value` or `defaultValue` wins. Put the named control straight inside its Field for this; one wrapped deeper takes `defaultValue` itself.

### Steps

`FormSteps` splits one Form into steps with a [Stepper](../Stepper/README.md) above them. Next checks only the current step's fields and moves on when they pass; Back and the Stepper's done steps go back without checking. Moving to a step focuses its heading. The last step's button submits the whole form; a problem on an earlier step is in the summary, and its link opens that step. Steps not showing stay in the form (`hidden="until-found"`), so their answers are kept and sent.

```tsx
<Form aria-label="Open an account" schema={Business} onSubmit={open}>
  <FormSteps submitLabel="Open the account">
    <FormStep title="Business">…fields…</FormStep>
    <FormStep title="Address">…fields…</FormStep>
    <FormStep title="Plan">…fields…</FormStep>
  </FormSteps>
</Form>
```

## Accessibility

- **Role and name:** a `<form>`. Give it a name (`aria-label`, or `aria-labelledby` its heading) when the page has more than one, so it's a form landmark.
- **Messages:** each is on its field (the control is `aria-invalid` and described by it) and said politely when it appears, as Field does. A failed submit's summary takes focus and is read whole; each link moves focus to its field and shows the field's label.
- **Focus:** nothing moves while people type. A failed submit focuses the summary (or with `summary={false}`, the first field with a problem); FormSteps focuses the new step's heading.
- **Keyboard:** the form's own: Enter in a text field submits it. In FormSteps, Enter in a text field goes to the next step (checking it first), and submits on the last; Next (or the submit button) comes before Back in the Tab order.
- **Contrast:** it draws no text of its own; the fields, summary, alert and buttons each meet 4.5:1 in every theme.
- **What's still yours:** a label on every field ([Field](../Field/README.md)), messages that say how to fix the answer, and `autoComplete` on fields about the person.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `schema` | Standard Schema | none | Zod, Valibot, ArkType. Its messages are the fields' errors and `onSubmit` gets its output |
| `defaultValues` | object | none | The values the fields start with, by name |
| `onSubmit` | `(values, form) => void \| { errors, message } \| Promise` | | Called with the checked values. Answer `{ errors, message }` when the server turns them down |
| `checks` | `{ [name]: (value, { values, signal }) => message \| Promise }` | none | Checks once a field passes the schema |
| `errors` | `{ [name]: ReactNode } \| null` | none | Messages from a server, such as a form action's answer; a new object shows them again |
| `message` | `ReactNode` | none | A server message that isn't one field's, in an alert at the top |
| `draft` | `string` | none | Keeps a draft in the browser under this key |
| `warnUnsaved` | boolean | `false` | Asks before the page goes while there are changes |
| `summary` | boolean | `true` | The ErrorSummary at the top after a failed submit |
| `onUnsavedChanges` | `(unsaved) => void` | | When the form gets changes that weren't sent, and when it has none again |
| `onEdit` | `(values) => void` | | The unchecked values whenever a field changes |

`id`, `className`, `ref` and other props go to the `<form>`, which has `data-component="form"` and `noValidate`.

`useForm()` inside the form gives `values()`, `defaults`, `validate(names?)`, `setErrors(errors, message?)`, `submit()`, `reset()`, `discardDraft()`, `dirty`, `submitting`, `submitCount`, `draftSavedAt` and `draftRestored`. `useFormValue(name)` gives one field's value as it changes.

**FormSteps:** `children` (FormStep elements), `submitLabel` (the last step's button), `step` / `defaultStep` / `onStepChange` (from 0), `headingLevel` (2 to 6, default 2). **FormStep:** `title`, `description`, `optional`, `children`.

## Component tokens

Each is an optional override: set it on the page, a container or one Form. The list lives in `src/components/Form/form.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from form.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--form-focus-ring` | `focus-ring` | The ring around a step's heading when it has focus from the keyboard. |
| `--form-gap` | `spacing-6` | Space between the form's parts: the summary, each field, the buttons (24px). |
| `--form-actions-gap` | `spacing-3` | Space between FormSteps' Next (or submit) and Back buttons (12px). |
| `--form-steps-gap` | `spacing-8` | Space between FormSteps' progress bar, the step and its buttons (32px). |
| `--form-step-title-weight` | `font-semibold` | The weight of each step's heading. |
<!-- token-table:end -->

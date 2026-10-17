# PasswordInput

A password field with a button at the end that shows and hides what was typed, so people can check it before they submit. It's Input's box, so it has the same sizes, states and tokens.

## Usage

```jsx
const { PasswordInput, Field } = window.Diki;

<Field label="Password"><PasswordInput /></Field>

// Sign-up: let the password manager suggest one
<Field label="New password" hint="At least 12 characters"><PasswordInput autoComplete="new-password" /></Field>

<PasswordInput visible={shown} onVisibleChange={setShown} />
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `visible` | boolean | none | Shows the password as text (controlled) |
| `defaultVisible` | boolean | `false` | Shows it at first (uncontrolled) |
| `onVisibleChange` | `(visible) => void` | none | Called when the button is pressed |
| `toggleLabel` | string | `"Show password"` | The button's name |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24, 32 or 44px, like Input |
| `invalid` | boolean | `false` | A danger border and `aria-invalid` |
| `leftIcon` | an icon name or element | none | A decorative icon before the text |

`autoComplete` defaults to `"current-password"`; use `"new-password"` when creating one. `ref`, `value`, `onChange` and every other input attribute go to the `<input>`; `className` and `style` go to the box, which has `data-component="password-input"`.

## Accessibility

- The button is named "Show password" and has `aria-pressed`, so screen readers say whether the password is shown. Its `aria-controls` points at the field when the field has an `id` (Field gives it one).
- Clicking it keeps focus in the field, so typing carries on. It's also reachable with Tab, and Enter or Space press it.
- Spell check and auto-capitalization are off, so a shown password isn't underlined or changed.
- The text keeps 4.5:1 and the eye icon 3:1 on the field in all six themes (`tools/test/password-input.mjs`).

## Component tokens

The field uses Input's tokens. These style the show/hide button; each is an optional override. The list lives in `src/components/PasswordInput/password-input.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--password-input-toggle` | `text-muted` | The show/hide button's icon (3:1 on the field). |
| `--password-input-toggle-hover` | `text` | The icon on hover. |
| `--password-input-toggle-bg-hover` | `secondary` | The button's background on hover. |
| `--password-input-focus-ring` | `focus-ring` | The button's keyboard focus ring. |
| `--password-input-toggle-radius` | `rounded-sm` | The button's corners (4px). |
| `--password-input-toggle-padding` | `spacing-1` | Space around the button's icon (4px). |

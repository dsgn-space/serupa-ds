# Combobox

A text field with a list of options that narrows as you type: pick a country, an assignee, a project. Only listed options can be picked. For a short list (under about 10), a Select is simpler.

```tsx
import { Combobox } from "serupa-ds";

<Combobox aria-label="Country" placeholder="Pick a country" options={["Argentina", "Brazil", "Canada"]} />

const [owner, setOwner] = React.useState<string | null>(null);
<Combobox aria-label="Owner" value={owner} onValueChange={setOwner} clearable
  options={people.map((p) => ({ value: p.id, label: p.name, description: p.email }))} />

// options from a server: filter them yourself
<Combobox aria-label="Person" options={results} filter={false} loading={fetching} onInputChange={search} />
```

## When to use

- One choice from a long list people know the name of: a country, an assignee, a project.
- Options that come from a server as people type (`filter={false}`, `onInputChange` and `loading`).

## When not to use

- A short list (under about 10): use [Select](../Select/README.md).
- An answer that may not be in the list: use [Input](../Input/README.md), since only listed options can be picked.
- Picking more than one option: use [checkboxes](../Checkbox/README.md).

## Usage

- Label it with [Field](../Field/README.md), a `<label htmlFor>` or `aria-label`; the placeholder isn't a label.
- Add a `description` when options look alike, such as people with the same name (their email).
- Set `clearable` when no selection is a valid answer, so people can clear it in one click.
- Write an `emptyText` that says what to try next, and match the `size` to the fields beside it.

## Behavior

- Opening with a click, the chevron or an arrow shows every option; typing narrows them and highlights the first match.
- Leaving the field closes the list and puts back the picked label. Leaving it empty clears the selection.
- The list opens under the field in the top layer, at least as wide as the field and up to 240px tall, and flips above when there's no room.

## Accessibility

- The ARIA combobox pattern: `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` and `aria-activedescendant`, and a `role="listbox"` of `role="option"` items with `aria-selected`. Empty and loading messages are `role="status"`.
- Labels and descriptions keep 4.5:1, even on the highlighted option, and the chevron 3:1, in all six themes (`tools/test/combobox.mjs`).

### Keyboard

| Key | Does |
| --- | --- |
| ArrowDown, ArrowUp | Open the list, then move through it (skipping disabled options, wrapping) |
| Alt+ArrowDown | Open without moving |
| PageUp, PageDown | First and last option |
| Enter | Pick the highlighted option |
| Escape | Close and put back the picked label (and stop there, so a surrounding Dialog stays open) |

Focus stays in the field the whole time.

## Props

Every Input prop works (`size`, `invalid`, `leftIcon`, `placeholder`, `disabled`, `readOnly`…), except `type`, `value`, `defaultValue`, `rightIcon` and `onChange`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `string[]` or `{ value, label, description?, disabled? }[]` | | The label is what's typed to find an option and shown once it's picked. |
| `value` | `string \| null` | | Controlled. |
| `defaultValue` | `string \| null` | | Uncontrolled. |
| `onValueChange` | `(value: string \| null) => void` | | When an option is picked, or `null` when the field is emptied or cleared. |
| `onInputChange` | `(text: string) => void` | | The text as it's typed, for loading options. |
| `filter` | `false \| (option, text) => boolean` | contains, ignoring case and accents | `false` shows every option you pass. |
| `clearable` | `boolean` | `false` | A × that clears the selection. |
| `loading` | `boolean` | `false` | A loading row in the list. |
| `emptyText` | `ReactNode` | `'No results'` | |
| `loadingText` | `string` | `'Loading…'` | |
| `toggleLabel`, `clearLabel` | `string` | `'Show options'`, `'Clear'` | The buttons' names. |
| `name` | `string` | | Sends the value with a form, in a hidden input. |

`className` and `style` go to the box; `ref` and every other prop go to the `<input>`.

## Component tokens

Each is an optional override: set it on the page, a container or one combobox. The field uses Input's tokens. The list lives in `src/components/Combobox/combobox.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--combobox-chevron` | `text-muted` | The chevron button's icon (3:1 on the field). |
| `--combobox-chevron-hover` | `text` | The chevron and × buttons' icon on hover. |
| `--combobox-chevron-bg-hover` | `secondary` | The chevron and × buttons' background on hover. |
| `--combobox-listbox-bg` | `surface` | The list's background. |
| `--combobox-listbox-border` | `border` | The list's outline. |
| `--combobox-option-color` | `text` | An option's label. |
| `--combobox-option-bg-active` | `surface-muted` | The highlighted option (hover or arrow keys), so muted text keeps 4.5:1 on it. |
| `--combobox-description-color` | `text-muted` | An option's second line, and the empty and loading messages. |
| `--combobox-check` | `primary` | The check next to the selected option. |
| `--combobox-listbox-shadow` | `shadow-lg` | The list's shadow. |
| `--combobox-listbox-radius` | `rounded-lg` | The list's corners (8px). |
| `--combobox-option-radius` | `rounded-md` | An option's corners (6px). |
| `--combobox-listbox-max-height` | `spacing-60` | The list's height before it scrolls (240px). |
| `--combobox-option-height` | `control-height-md` | An option's least height (32px). |
| `--combobox-listbox-padding` | `spacing-1` | Space inside the list (4px). |
| `--combobox-option-padding-x` | `spacing-2` | Space on each side of an option (8px). |
| `--combobox-offset` | `spacing-1` | The gap between the field and the list (4px). |
| `--combobox-z-index` | `z-50` | The list's stacking order, where the top layer isn't available. |

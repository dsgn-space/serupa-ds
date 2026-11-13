# TransferList

Two lists, Available and Chosen, with Add and Remove between them, for picking a set out of many: the columns a table shows, the permissions a role has, the people on a team.

```tsx
import { TransferList } from "serupa-ds";

<Field label="Columns" hint="The table shows them in this order.">
  <TransferList name="columns" options={columns} defaultValue={["name", "email"]} />
</Field>
<TransferList aria-label="Permissions" options={permissions} value={granted} onValueChange={setGranted} />
```

## When to use

- Picking several from a long list (a dozen or more), where seeing what's chosen apart from what isn't helps: columns, permissions, members, fields to export.
- The order of the chosen ones matters: they're kept in the order they were added.

## When not to use

- A handful of choices: a [CheckboxGroup](../Checkbox/README.md) shows them all at once with one box each.
- Choosing from hundreds by typing: a multiple [Combobox](../Combobox/README.md) finds them faster.
- Reordering what's chosen: pair it with a [SortableList](../SortableList/README.md), or use that alone.

## Anatomy

Drawn from the `NothingChosen` story.

1. **List** (`.dk-transfer-list__side`): Available, then Chosen; each scrolls past its height.
2. **Title** (`.dk-transfer-list__title`): the list's name, with its **count** (`.dk-transfer-list__count`).
3. **Options** (`.dk-transfer-list__options`): a CheckboxGroup, with All first.
4. **Moves** (`.dk-transfer-list__moves`): Add and Remove, between the lists.
5. **Empty** (`.dk-transfer-list__empty`): "None", in a list with nothing in it.

## Usage

- `options` is everything there is, each `{ value, label, description?, disabled? }`, in the order Available shows them. A disabled option can't be checked, so it stays in whichever list it's in: use it for one that's always on.
- `value` and `onValueChange` (controlled) or `defaultValue` hold the chosen values. Add puts the checked ones at the end of Chosen; Remove puts them back in their place in Available.
- Name it with a [Field](../Field/README.md) label (`Field` names the group), or `aria-label`. `availableLabel` and `chosenLabel` rename the two lists ("Hidden" and "Shown", "Not on the team" and "On the team"); the default words follow `SerupaProvider` labels in all its languages.
- With `name`, each chosen value is a hidden input, so a form submits them in order (`formData.getAll(name)`), and resetting the form puts `defaultValue` back.
- A choice it requires is yours to check: say so in the label, and count the values on submit.

## Behavior

- Each list is a group of checkboxes with an All box first (with two or more in it), named by its title, which counts what's in it: "Available (12)".
- Add and Remove move the checked ones. Each move is said politely: "Name and Company moved to Chosen."
- With nothing checked, Add and Remove stay where they are and keep focus, saying why they do nothing ("Check the ones to add first"), so a move never drops focus.
- Each list scrolls past its height (`--transfer-list-side-max-height`). On a phone the lists stack, with the buttons in a row between them.
- `disabled`, or a disabled `<fieldset>` around it, turns off every box and both buttons, and submits nothing.

## Accessibility

- **Role and name:** a `role="group"` named by its Field label or `aria-label`, holding two groups of native checkboxes, each named by its title and count, and two buttons.
- **Keyboard:** Tab reaches each box, then Add and Remove; Space checks a box.
- **Contrast:** its text and counts read 4.5:1 on the lists' background in all six themes (`TransferList.test.tsx`).
- **What's still yours:** the label, telling people what the order means if it matters, and checking a required count on submit.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<div>`. |
| `options` | `TransferListOption[]` | | `{ value, label, description?, disabled? }`. |
| `value` | `string[]` | | The chosen values (controlled), in the order they were added. |
| `defaultValue` | `string[]` | `[]` | The chosen values at first (uncontrolled). |
| `onValueChange` | `(value: string[]) => void` | | Called after each move. |
| `name` | `string` | | Submits each chosen value as a hidden input. |
| `form` | `string` | | The id of a form elsewhere that the values belong to. |
| `disabled` | `boolean` | `false` | Turns off both lists and the buttons. |
| `invalid` | `boolean` | `false` | Marks every box invalid. Field sets it from its error. |
| `availableLabel` | `string` | "Available" | The first list's name. |
| `chosenLabel` | `string` | "Chosen" | The second list's name. |

`className`, `ref` and other props go to the root `<div>`, which has `data-component="transfer-list"`.

## Component tokens

Each is an optional override: set it on the page, a container or one TransferList. The list lives in `src/components/TransferList/transfer-list.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from transfer-list.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--transfer-list-side-bg` | `surface` | Each list's background. |
| `--transfer-list-side-border` | `border` | Each list's border. |
| `--transfer-list-muted-text` | `text-muted` | A list's count and its "None" (4.5:1 on side-bg). |
| `--transfer-list-side-radius` | `radius-surface` | Each list's corners (8px). |
| `--transfer-list-side-padding` | `spacing-3` | Space inside each list (12px). |
| `--transfer-list-side-max-height` | `spacing-60` | How tall a list grows before it scrolls (240px). |
| `--transfer-list-gap` | `spacing-3` | Space between the lists and the move buttons (12px). |
<!-- token-table:end -->

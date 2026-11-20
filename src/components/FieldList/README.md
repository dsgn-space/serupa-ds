# FieldList

Rows people add and remove in a form, such as phone numbers, emergency contacts or the lines of an invoice. Each row is a named group of a few fields with its own Remove button, and Add comes after the last row. Focus follows each change, and each change is announced.

**Also called:** repeater, dynamic fields, form list.

```tsx
import { FieldList, Field, Input } from "@diki-stwn/serupa-ds";

<FieldList
  label="Phone numbers"
  itemLabel={(i) => "Phone " + (i + 1)}
  addLabel="Add phone"
  name="phones"
  newItem={() => ({ number: "" })}
  defaultValue={[{ number: "" }]}
  min={1}
  max={5}
>
  {(row, { name, update }) => (
    <Field label="Number">
      <Input name={name("number")} type="tel" value={row.number} onChange={(e) => update({ number: e.target.value })} />
    </Field>
  )}
</FieldList>
```

## When to use

- A form that takes a few of the same thing, in a number people choose: phone numbers, addresses, guests, invoice lines.
- Rows of up to three short fields each, so a row stays one line on a laptop.

## When not to use

- Picking from a known set of things: use a [CheckboxGroup](../Checkbox/README.md), a multiple [Combobox](../Combobox/README.md) or a [TransferList](../TransferList/README.md).
- Short values that need no fields of their own, such as tags or email addresses: use a [TagGroup](../TagGroup/README.md) with an [Input](../Input/README.md).
- Rows with many fields, or rows people mostly read: use a [Table](../Table/README.md), with a [Dialog](../Dialog/README.md) to add or edit one.

## Anatomy

Drawn from the `Errors` story.

1. **Legend** (`.dk-field-list__label`): the list's name.
2. **Row** (`.dk-field-list__row`): one item, a group named by `itemLabel`.
3. **Fields** (`.dk-field-list__fields`): the row's fields, side by side, wrapping in a narrow column.
4. **Remove** (`.dk-field-list__remove`): takes the row away; hidden at `min`.
5. **Row error** (`.dk-field-list__row-error`): what's wrong with that row.
6. **List error** (`.dk-field-list__error`): what's wrong with the list as a whole.
7. **Add** (`.dk-field-list__add`): adds a row at the end; at `max`, the limit shows beside it.

## Usage

- Name the rows by what they are, with their place: `itemLabel={(i) => "Phone " + (i + 1)}`. Screen readers hear it as the row's name, and it's in each Remove button ("Remove Phone 2") and in what's announced ("Phone 3 added").
- Say what Add adds: "Add phone", not "Add" or "Add more".
- Set `min` when the form needs at least that many: the list starts with `min` empty rows, and Remove is hidden while it has no more. Set `max` when there is a limit: Add then says why it does nothing ("Limit reached: 5.").
- Give each row's fields a `Field` with a visible label. Rows can repeat the same labels: the row's name tells them apart for screen readers.
- Pass `name` for a plain form submit: `name("number")` in a row gives `phones[1].number`.
- Show an error by row with `errors` (the row's place to its message), and one for the whole list with `error` ("Add a mobile number"). A row's error reaches its fields as `error` in the render function, to mark them invalid.
- `reorderable` puts a handle on each row when the order matters, such as the stops of a trip. Leave it off otherwise.

## Accessibility

- **Role and name:** a `<fieldset>` named by its legend. Each row is a group (`role="group"`) named by `itemLabel`, and described by its error. The list's hint and error describe the fieldset.
- **Keyboard:** Tab moves through each row's fields and its Remove button, then Add. Add and Remove are buttons; at `max`, Add stays a Tab stop (`aria-disabled`) and its description says why it does nothing.
- **Focus:** Add moves focus to the new row's first field. Remove moves it to the row before, or to Add when the first row goes. A row keeps its own fields as the rows around it come and go, so nothing typed moves to another row.
- **Announcements:** adding or removing a row is said politely ("Phone 3 added", "Phone 2 removed").
- **Contrast:** its legend, hint, limit and errors read 4.5:1 on the surface in every theme (`FieldList.test.tsx`).
- **What's still yours:** a visible label on each field, and the words for the rows and Add.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the `<fieldset>` |
| `label` | `ReactNode` | | The legend: the list's name |
| `hint` | `ReactNode` | none | Under the legend |
| `itemLabel` | `(index) => string` | | Each row's name from its place, counted from 0 |
| `children` | `(row, { index, label, name, update, error }) => ReactNode` | | One row's fields. `name(field)` gives its native name, `update(next)` changes the row (a value, or a function of the current one), `error` is the row's error |
| `newItem` | `() => T` | | The value of a row people add |
| `addLabel` | `string` | | The Add button's words |
| `value` / `defaultValue` | `T[]` | `min` new rows | The rows, controlled or to start with |
| `onValueChange` | `(rows) => void` | | Called with the rows when one is added, removed, changed or moved |
| `min` | number | `0` | The fewest rows: Remove is hidden while it has this many |
| `max` | number | none | The most rows: Add then does nothing and says why |
| `name` | `string` | none | The start of each field's native name (`phones[0].number`) |
| `error` | `ReactNode` | none | An error for the whole list, under the rows |
| `errors` | `ReactNode[]` | none | An error for each row, by place |
| `reorderable` | boolean | `false` | A handle on each row puts the rows in order ([SortableList](../SortableList/README.md)) |
| `disabled` | boolean | `false` | Disables every field, Remove and Add |

`className`, `ref` and other props go to the `<fieldset>`, which has `data-component="field-list"`.

## Component tokens

Each is an optional override: set it on the page, a container or one FieldList. The list lives in `src/components/FieldList/field-list.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from field-list.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--field-list-label-color` | `text` | The legend, the list's name (4.5:1 on the surface). |
| `--field-list-hint-color` | `text-muted` | The hint under the legend and the note beside Add at the limit (4.5:1 on the surface). |
| `--field-list-error-color` | `danger-text` | A row's error and the list's error (4.5:1 on the surface). |
| `--field-list-label-weight` | `font-medium` | The legend's weight. |
| `--field-list-gap` | `spacing-3` | Space between the legend, the rows and Add (12px). |
| `--field-list-row-gap` | `spacing-3` | Space between the fields of a row, and before its Remove button (12px). |
| `--field-list-error-gap` | `spacing-1` | Space between an error's icon and its words (4px). |
| `--field-list-field-min-width` | `spacing-40` | The narrowest a field gets before a row's fields wrap onto more lines (160px). |
<!-- token-table:end -->

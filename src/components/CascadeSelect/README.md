# CascadeSelect

One choice made through a hierarchy, such as Provinsi › Kabupaten/Kota › Kecamatan or Category › Subcategory › Item. It looks like a [Select](../Select/README.md); it opens a panel of side-by-side columns, one per level, where picking in one shows its children in the next. The button shows the whole path, and a form gets the last value. Children can be loaded as an option is opened. On a phone it shows one column at a time, with a Back button.

```jsx
const { CascadeSelect, Field } = window.Serupa;

const regions = [
  { value: "jabar", label: "Jawa Barat", children: [
    { value: "bandung", label: "Kota Bandung", children: [{ value: "coblong", label: "Coblong" }, { value: "sukajadi", label: "Sukajadi" }] },
  ] },
  { value: "bali", label: "Bali", children: [/* … */] },
];

<Field label="Alamat">
  <CascadeSelect name="kecamatan" options={regions} levels={["Provinsi", "Kabupaten/Kota", "Kecamatan"]}
    value={path} onValueChange={(path, { options }) => setPath(path)} />
</Field>

// children loaded when an option is opened
<CascadeSelect aria-label="Kategori" options={topLevel} loadOptions={(path) => fetchChildren(path.at(-1)?.value)} />
```

## When to use

- One choice that only makes sense inside another: an area within a region, a subcategory within a category.
- A tree of options too big to show in one list, where people know the way down (they know their province before their district).

## When not to use

- A flat list: [Select](../Select/README.md), or a [Combobox](../Combobox/README.md) when people search it.
- People know the last step's name but not the path: a [Combobox](../Combobox/README.md) that searches every last step, showing the path as its description, is quicker.
- Choosing several items in a tree, or a tree people browse and edit: use a [TreeView](../TreeView/README.md).
- Two levels with a few options each: two Selects, the second filtered by the first, are simpler.

## Anatomy

Drawn from the `Open` story.

1. **Button** (`.dk-cascade-select__button`): the chosen path, joined with ›, or the placeholder; a chevron at the end.
2. **Panel** (`.dk-cascade-select__panel`): a dialog holding one column per level.
3. **Column** (`.dk-cascade-select__column`): its level's name (`levels`, or "Level 2") over a listbox of options, scrolling on its own past 288px.
4. **Option** (`.dk-cascade-select__option`): the highlighted one in each column is `primary-subtle`; one with children ends in a chevron, the chosen last step in a check.

## Usage

- Name each level with `levels`: it labels the columns, and people learn the order.
- Keep each column short enough to scan; sort options the way people look for them (alphabetically for places).
- `onValueChange` gets the path of values and the options themselves, so you have the labels without looking them up.
- Only a last step can be chosen unless `selectParents` is set; then Enter, or a second click, on a parent chooses it.
- With `loadOptions`, an option without `children` loads them when opened ("Loading…" meanwhile); a failure says so and how to try again: open that option again. Set `isLeaf` on options that have nothing under them, so they don't show a chevron or ask.
- A `value` or `defaultValue` with loaded levels (a saved one in an edit form) has its levels loaded right away, one at a time, so the button reads it in words without being opened. Until they arrive, or if a load fails, it shows the values themselves.

## States

| State | Look |
| --- | --- |
| Rest | `field` background, 1px `field-border`, the chevron in `text-muted` |
| Placeholder | "Choose…" (or `placeholder`) in the `placeholder` color |
| Hover | `field-border-hover` |
| Focus | Like the other fields: the border and a 1px ring hugging it take the `focus-ring` color (danger when invalid), and stay while the panel is open; inside the panel, an outline on the focused option or column |
| Open | The panel under the button (above it when there's no room), fading in |
| Invalid | `danger` border, and `aria-invalid` |
| Disabled | `field-readonly` background at 50%, `not-allowed` cursor; it doesn't open |
| Loading | "Loading…" in the next column |

### Do and don't

- **Do:** Name each column with `levels`: it labels the columns, and people learn the order. (`DoNameLevels`)
- **Don't:** Give every column the same name ("Pilih"): people have to guess what each one holds. (`DontGenericLevels`)

## Accessibility

- **Role and name:** the button is a `combobox` with `aria-haspopup="dialog"` and `aria-expanded`, named by a Field, a `<label>` or `aria-label`; the panel is a `dialog` named the same way. Each column is a `listbox` named by its level, and the highlighted option in each is `aria-selected`. An option with children is described as "More options: press Right arrow" (Left in right-to-left text).
- **Keyboard:** see the table. Focus moves into the panel when it opens, onto the chosen option, and back to the button when it closes.
- **Contrast:** text and placeholder keep 4.5:1 on `field`, the chevron and border 3:1; option text and level names 4.5:1 on the panel and the highlight; the check 3:1, in all six themes (`CascadeSelect.test.tsx`).
- **What's still yours:** a name for it (Field, `<label>` or `aria-label`), `levels` that say what each column is, and the error text when a required choice is missing.

### Keyboard

| Key | Does |
| --- | --- |
| Enter, Space, ↓, ↑ (on the button) | Opens the panel |
| ↓ ↑ | The next or previous option in the column, skipping disabled ones |
| Home, End | The first or last option |
| → (← right to left) | Into the highlighted option's children |
| ← (→ right to left) | Back to the column before |
| Enter, Space | Chooses a last step and closes; on an option with children, goes into them (with `selectParents`, chooses it) |
| A letter | The next option that starts with it |
| Escape | Closes without a change |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `CascadeOption[]` | | `{ value, label, children?, isLeaf?, disabled? }`: the first column, with the levels under it |
| `value` | `string[]` | | The chosen path, as values from the first column down (controlled) |
| `defaultValue` | `string[]` | `[]` | The path it starts with (uncontrolled) |
| `onValueChange` | `(value, { options }) => void` | | Called when a choice is made, with the path and its options |
| `loadOptions` | `(path: CascadeOption[]) => Promise<CascadeOption[]>` | | Loads the children of the path's last option when it has none |
| `levels` | `string[]` | "Level 1", "Level 2"… | Each column's name |
| `selectParents` | boolean | `false` | Lets an option with children be chosen too |
| `placeholder` | string | "Choose…" | Shown with nothing chosen |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24, 32 or 44px, like Select |
| `invalid` | boolean | `false` | A danger border and `aria-invalid`; set for you in a Field with an error |
| `name` | string | | A form gets the path's last value under it, and a form reset brings back `defaultValue` |
| `open`, `defaultOpen`, `onOpenChange` | | | The panel's open state, controlled or not; `onOpenChange(open, { reason })` says why: `'trigger'`, `'select'`, `'escape'`, `'outside'` or `'reset'` |
| `disabled` | boolean | `false` | It can't open, and the form doesn't get its value |
| `readOnly` | boolean | `false` | Shows the path but can't open: focusable and read out (`aria-readonly`), and the form still gets its value, unlike `disabled` |

`ref`, `id`, `aria-*` and other props go to the `<button>`; `className` and `style` go to the wrapper (`data-component="cascade-select"`, `data-state`), full width by default.

## Component tokens

Each is an optional override: set it on the page, a container or one CascadeSelect. The list lives in `src/components/CascadeSelect/cascade-select.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from cascade-select.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--cascade-select-bg` | `field` | The button's background. |
| `--cascade-select-text` | `text` | The chosen path and the options (4.5:1). |
| `--cascade-select-placeholder` | `placeholder` | The placeholder (4.5:1 on bg). |
| `--cascade-select-border` | `field-border` | The button's outline (3:1). |
| `--cascade-select-border-hover` | `field-border-hover` | Its outline under the pointer. |
| `--cascade-select-invalid` | `danger` | The outline when invalid. |
| `--cascade-select-bg-disabled` | `field-readonly` | The button's background when read-only or disabled. |
| `--cascade-select-icon` | `text-muted` | The chevron (3:1). |
| `--cascade-select-muted` | `text-muted` | Level names, notes and the children chevrons (4.5:1 on the panel). |
| `--cascade-select-check` | `primary` | The chosen last step's check (3:1). |
| `--cascade-select-focus-ring` | `focus-ring` | The ring around the focused button, column or option. |
| `--cascade-select-panel-bg` | `surface-overlay` | The panel's background. |
| `--cascade-select-panel-border` | `border-overlay` | The panel's outline. |
| `--cascade-select-divider` | `border` | The line between columns. |
| `--cascade-select-option-hover` | `highlight` | An option under the pointer, as Combobox's and Menu's. |
| `--cascade-select-option-on` | `primary-subtle` | The highlighted option in each column. |
| `--cascade-select-option-indicator` | `primary` | The 2px bar at the start of each option on the chosen path (3:1 on option-on). |

**Radius**

| Token | Default | Use |
| --- | --- | --- |
| `--cascade-select-radius` | `radius-control` | The button's corners (6px). |
| `--cascade-select-panel-radius` | `radius-surface` | The panel's corners (8px). |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--cascade-select-panel-shadow` | `elevation-overlay` | The panel's shadow. |
| `--cascade-select-panel-depth` | `depth-surface` | The panel's tactile layers, over its shadow: a light along the top edge and a shade along the bottom one. None in the flat brands. |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--cascade-select-padding-x` | `spacing-3` | Space at the button's sides at size md (12px). |
| `--cascade-select-column-width` | `spacing-56` | A column's width (224px). |
| `--cascade-select-column-height` | `spacing-72` | The tallest a column grows before it scrolls (288px). |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--cascade-select-height-sm` | `control-height-sm` | The button's height at size sm (24px). |
| `--cascade-select-height-md` | `control-height-md` | At size md (32px). |
| `--cascade-select-height-lg` | `control-height-lg` | At size lg (44px). |

**z-index**

| Token | Default | Use |
| --- | --- | --- |
| `--cascade-select-z-index` | `z-popover` | The panel's layer. |
<!-- token-table:end -->

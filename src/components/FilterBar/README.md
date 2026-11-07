# FilterBar

The filters on a list or a table, as a row of chips. "Add filter" opens a menu of the fields not yet in use; each chip says its filter in words ("Status is Open or Closed") and opens its editor in a popover; its × removes it, and "Clear all" removes every one. The value is plain data, so the app can keep it in the URL, and an optional results count is announced as it changes.

```tsx
import { FilterBar, type FilterField } from "serupa-ds";

const fields: FilterField[] = [
  { id: "status", label: "Status", type: "select", multiple: true, options: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }] },
  { id: "owner", label: "Owner", type: "select", options: ["Ana", "Budi"] },
  { id: "due", label: "Due", type: "date-range" },
  { id: "archived", label: "Archived", type: "boolean" },
  { id: "q", label: "Title", type: "text" },
];

// value: { status: ["open"], due: { start: "2026-11-02", end: "2026-11-08" } }
<FilterBar fields={fields} value={filters} onValueChange={setFilters} resultsCount={rows.length} />
```

## When to use

- A list, table or board people narrow by several fields, where the filters in use should stay visible.
- Filters people add a few at a time from a longer set of fields.

## When not to use

- One or two filters that are always there: put a [SearchInput](../SearchInput/README.md), [Select](../Select/README.md) or [SegmentedControl](../SegmentedControl/README.md) in a [Toolbar](../Toolbar/README.md).
- Many filters people set at once, as a form: put them in a [Drawer](../Drawer/README.md) with an Apply button.
- Switching between saved views: use [Tabs](../Tabs/README.md) or a Select.

## Anatomy

Drawn from the `Playground` story.

1. **Chip** (`.dk-filter-bar__chip`): one filter, outlined; dashed while nothing is chosen.
2. **Chip button** (`.dk-filter-bar__edit`): the filter in words; it opens the filter's editor.
3. **Remove** (`.dk-filter-bar__remove`): takes the filter away.
4. **Add filter** (`.dk-filter-bar__add`): a menu of the fields not in use.
5. **Clear all** (`.dk-filter-bar__clear`): takes every filter away.
6. **Count** (`.dk-filter-bar__count`): how many results are left, at the end.

## Usage

- Order `fields` as people think of them, most used first: the menu lists them in that order.
- Keep labels short ("Status", "Due"): they start each chip.
- Give `resultsCount` whenever you know it: it tells people what their filters did, and screen readers hear it change.
- The value has a key for each filter in use: `select` gives a string (or an array with `multiple`), `date-range` `{ start, end }` as "yyyy-mm-dd" (either may be null), `boolean` `true`, `text` a string. A filter whose editor closes with nothing chosen is taken out.
- A `boolean` filter is on as soon as it's added, with no editor to open first; its chip opens a switch to turn it off.
- Put a sort or a view switch in `actions`, so it sits with the filters and before the count.

## Accessibility

- **Role and name:** the bar is a `group` named "Filters" (or `aria-label`), with the chips in a list. Each chip is a button that says its filter in full, and opens a dialog named by the field; its × is "Remove filter: Status".
- **Keyboard:** see the table. After a chip is removed, focus moves to the next chip (or the one before, or "Add filter"); after "Clear all", to "Add filter"; closing an editor returns focus to its chip.
- **Announcements:** the count is a `status`, so a change is read out politely.
- **Contrast:** chip text reads 4.5:1 on the chip and its outline 3:1, the count 4.5:1 on the page, in all six themes (`FilterBar.test.tsx`).
- **What's still yours:** labels and option names that make sense read aloud in a sentence ("Owner is Ana").

### Keyboard

| Key | Does |
| --- | --- |
| Tab | Through each chip and its ×, then "Add filter", "Clear all" and any actions |
| Enter, Space (on a chip) | Opens its editor |
| Escape | Closes the editor (or the menu) |
| Enter (in a text filter) | Closes it and keeps the text |
| ↑ ↓ (in the menu) | Moves between fields |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `fields` | `FilterField[]` | | `{ id, label, type }`, `type` one of `'select'` (with `options` and `multiple`), `'date-range'`, `'boolean'`, `'text'` (with `placeholder`) |
| `value` | `FilterValues` | | The filters in use, by field id (controlled) |
| `defaultValue` | `FilterValues` | `{}` | The filters it starts with (uncontrolled) |
| `onValueChange` | `(value) => void` | | Called with every filter in use when one is added, changed, removed or cleared |
| `resultsCount` | `number` | | Shown at the end as "24 results" and announced when it changes |
| `actions` | `ReactNode` | | Before the count, such as a sort Select |
| `id` | `string` | | Goes to the root `<div>`. |

`className`, `ref` and other props go to the root `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one FilterBar. The list lives in `src/components/FilterBar/filter-bar.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from filter-bar.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--filter-bar-text` | `text` | Chip text (4.5:1 on chip-bg). |
| `--filter-bar-muted` | `text-muted` | The results count (4.5:1 on the page). |
| `--filter-bar-chip-bg` | `surface` | A chip's background. |
| `--filter-bar-chip-border` | `field-border` | A chip's outline (3:1 on the page). |
| `--filter-bar-chip-open` | `primary` | A chip's text while its editor is open (4.5:1 on chip-bg). |
| `--filter-bar-focus-ring` | `focus-ring` | The ring around a focused chip. |
| `--filter-bar-chip-radius` | `radius-control` | A chip's corners (6px). |
| `--filter-bar-gap` | `spacing-2` | Space between chips, buttons and the count (8px). |
| `--filter-bar-editor-width` | `spacing-56` | The narrowest an editor is (224px). |
<!-- token-table:end -->

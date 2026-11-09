# Table

A data table built on native table markup: a header row, body rows and an optional footer, in a bordered frame that scrolls sideways when the table is too wide. Rows shade on hover (or every other one with `striped`), can be selected with a checkbox column (`TableSelectCell`) or opened to show their details (`TableExpandCell`), and columns can be sorted, resized, pinned while the rest scroll, and shown or hidden (`TableColumnsMenu`).

```jsx
const { Table, TableHead, TableBody, TableFoot, TableRow, TableHeaderCell, TableCell, TableSelectCell } = window.Serupa;

<Table caption="Team members">
  <TableHead>
    <TableRow>
      <TableSelectCell header label="Select all rows" checked={all} indeterminate={some} onChange={toggleAll} />
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell>Role</TableHeaderCell>
      <TableHeaderCell align="end" sort={sort} onSort={() => setSort(sort === 'ascending' ? 'descending' : 'ascending')}>Calls</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {people.map((p) => (
      <TableRow key={p.id} selected={picked.has(p.id)}>
        <TableSelectCell label={'Select ' + p.name} checked={picked.has(p.id)} onChange={() => toggle(p.id)} />
        <TableCell>{p.name}</TableCell>
        <TableCell><Text as="span" tone="muted">{p.role}</Text></TableCell>
        <TableCell align="end">{p.calls}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

<Table size="sm" striped stickyHeader containerProps={{ style: { maxHeight: 400 } }}>…</Table>
```

## When to use

- Data with several values per row that people compare down the columns: members and their roles, orders and their totals.
- People need to sort by a column, or read numbers lined up under each other.

## When not to use

- Items with a line or two of text each, such as people or files: use [List](../List/README.md) instead.
- Items with pictures or a lot of content each: use [Card](../Card/README.md)s in a [Grid](../Grid/README.md).
- Laying out a page or a form in columns: use [Grid](../Grid/README.md) or [Stack](../Stack/README.md); a table is for data.

## Anatomy

Drawn from the `Sortable` story.

1. **Caption** (`.dk-table__caption`): names the table for everyone, screen readers too.
2. **Header row** (`.dk-table__head`): the column names.
3. **Sortable header** (`.dk-table__header--sortable`): a column you can sort by; the arrow says which way.
4. **Row** (`.dk-table__row`): one record.
5. **Cell** (`.dk-table__cell`): one value; numbers line up at the end.
6. **Footer** (`.dk-table__foot`): totals or a summary.

## Usage

Table only lays out what you give it: sorting, filtering and selection state stay in your code. Sort text columns with `useCollator().compare`, so names sort the way people in the page's locale expect ("Item 2" before "Item 10", "Äpfel" beside "Apfel" in German).

- Give every table a `caption`. When a heading on the page already says what it holds, add `hideCaption` so screen readers still hear it.
- Set `align="end"` on number columns, in the header and the cells, so the digits line up.
- A number given to `TableCell` as its child (`{p.calls}`) is written in the locale's digits, ungrouped as given: 1204 in en-US, ١٢٠٤ in ar-EG. For grouping, currency or units, put a `FormattedNumber` in the cell.
- When rows change under the user (sorting, filtering, paging), use `layout="fixed"` so the columns don't jump: set `width` on the header cells that need it (`"40%"`, `"8rem"`, or a number of pixels) and the others share what's left. Long text wraps in its cell. With the default `layout="auto"`, each column is as wide as its content on that page.
- Use `size="sm"` for dense data, and `striped` when long rows are hard to follow across.
- With selectable rows, put a `TableActionBar` just before the table: while rows are selected it shows "3 selected", your actions for them (Delete, Export) and "Clear selection" (`onClear`). Pass it the count; it's hidden at 0. It reads out each new count, including the first when you render it only while rows are selected, but keeping it mounted also moves focus to "Select all" when Clear empties the selection.
- To make each row open a page, give the `TableRow` an `href` (with `target` and `rel` as on a link). The row gets one real link, in its first `TableCell` (or the one you mark `link`), stretched over the whole row: a click anywhere on it follows the link, Ctrl/Cmd-click and middle-click open a new tab, and the keyboard tabs to it. Buttons, checkboxes and links in other cells sit above it and work on their own. Don't use `onClick` on a row for this: it reaches the mouse only, and warns in development.
- A button that removes its own row (Delete, Archive) takes focus away with the row, and focus then falls to the top of the page. Move it yourself once the row is gone: to the same button in the next row, else the one before, else the table's heading. With a confirmation Dialog, pass that element as its `finalFocus`.
- Let people widen a column whose content gets cut or wraps a lot: `resizable` on its `TableHeaderCell`, in a table with `layout="fixed"`, starting from a `width` in pixels. A handle at the header's end edge drags; with focus, the arrow keys move it 16px at a time and Home and End go to `minWidth` (48) and `maxWidth` (800); a double-click fits the column to its widest cell on one line. A click on the handle (or Enter or Space on it) opens Narrower, Wider and Fit to content, so a width never needs a drag (WCAG 2.5.7). Uncontrolled, the column keeps its own width; to remember widths, pass `width` and `onWidthChange` together and keep the number.
- When a table scrolls sideways, keep the column that names each row in view with `pinStart`, and a column of row actions with `pinEnd`. Pinned cells take their row's shading, and lift with a shadow while there's more to scroll to under them (where scroll-state container queries are supported). It's the first and the last cell of each row, so put a select or expand column after the name, or leave it unpinned.
- The column tools' parts: a resize handle (`.dk-table__resize`) at a resizable header's end edge; a pinned first or last column (`pinStart`, `pinEnd`) that stays in view; an expand button (`.dk-table__expand-button`) whose chevron turns down while the row's details (`.dk-table__detail`) show under it; and the Columns button (`TableColumnsMenu`).
- For tables with more columns than people need at once, put a `TableColumnsMenu` above the table with the same list you draw the columns from (`columns`, each `{ id, label, visible, required? }`), and draw the table from the list `onColumnsChange(columns, { id, visible })` gives back. Mark the column that names each row `required`; the last one shown can't be cleared either, so the table is never empty.
- For rows with more than fits in their cells (an order's note, a log entry's message), start each row with a `TableExpandCell` (`label`: the row's name, `expanded`, `onExpandedChange`, `controls`: the detail row's id) and follow it with a `TableDetailRow` (`id`, `open`, `colSpan` of every column). The header row gets a `TableExpandCell header`. `striped` counts only the rows of data, so open details don't swap the shading.
- With `stickyHeader`, give the frame a height through `containerProps`. The frame measures the header and keeps that much scroll padding at the top, so a focused link or button in a row scrolls into view below the header, not under it (WCAG 2.4.11).
- For thousands of rows, use `TableVirtualBody` in place of `TableBody`: it draws only the rows in view of the frame, plus a few either side, so 10,000 rows scroll as quickly as 20. Give the frame a height (`containerProps={{ style: { maxHeight: 480 } }}`, usually with `stickyHeader`), since without one every row is in view. Columns size to the rows drawn, so set widths (`table-layout: fixed` or a width per header cell) where a column mustn't shift while scrolling. Each drawn row gets `aria-rowindex` and the table `aria-rowcount`, a row with focus stays drawn when it scrolls away, and `striped` shades the same rows as a `TableBody` would. In print it draws every row, up to the first 5,000 (about 100 pages); for more, offer an export (CSV) instead of print. Sorting and filtering stay yours: sort the data, then draw row `index` from it.

## Accessibility

- It's a real `<table>`, so screen readers announce rows, columns and headers. Give it a `caption` (or `aria-label`) so people know what it holds.
- When it's too wide and scrolls, the frame becomes a focusable region named by the caption, so keyboard users can scroll it with the arrow keys. When it fits, it adds no tab stop.
- A sortable header is a button, and its `<th>` has `aria-sort` once sorted. After sorting, the button keeps focus, and the new order is read out politely ("Sorted by Amount, ascending.", the `tableSorted` label), because `aria-sort` alone is only heard when focus comes back to the header. Nothing is read on the first render.
- `TableActionBar` is a group named by its count ("2 selected"), and a new count is read out politely, since the bar appears away from the checkbox that was pressed. When it hides with focus in it (after "Clear selection", or an action that empties the selection), focus moves to the first checkbox of the table after it (the header's "Select all"), so it isn't dropped on the page. Its count reads 4.5:1 on the bar in all six themes.
- A row with `href` is one link, named by its link cell's text ("Ada"), so screen readers hear one link per row, not a clickable row they can't find. Focus on it rings the whole row.
- A resize handle is a focusable `separator` named for its column ("Resize Name column", the `tableResizeColumn` label), with `aria-valuenow`, `aria-valuemin` and `aria-valuemax` in pixels, so screen readers say the width as it changes. Before a width is set, its value is the column's drawn width. It's described as "Press Enter for width buttons" (the `tableResizeHint` label), since a separator can't say it opens anything. It's 12px wide; the arrow keys do what dragging does, and its popover's three buttons do the same for a pointer (Narrower and Wider move 16px; the `tableNarrower`, `tableWider` and `tableFitColumn` labels).
- A `TableExpandCell`'s button is named for its row ("Details, Order 1001", `tableRowDetails`), with `aria-expanded` and `aria-controls` pointing at the `TableDetailRow`, which stays in the page, hidden, while closed. The header's cell is named "Details" (`tableDetails`) for screen readers and shows nothing. In right-to-left pages the chevron points left.
- `TableColumnsMenu` is a [Popover](../Popover/README.md) titled "Columns" (`tableColumns`) of [Checkbox](../Checkbox/README.md)es named by the columns; a required column's box is checked and disabled.
- In print, the frame shows the whole table instead of its scrolled window, the header row repeats on every page, and a row isn't split across pages.
- Text and muted text keep 4.5:1 on plain, hovered, striped and selected rows, and the header text on its background; the selected bar keeps 3:1 (all six themes, `Table.test.tsx`). Selection isn't shown by color alone: the bar shows it, and a `TableSelectCell`'s checkbox ("Select Ada, checked") says it to screen readers. Browsers ignore `aria-selected` on a plain table's rows, so `selected` doesn't set it; give selectable rows a `TableSelectCell`. The checkbox outline keeps 3:1 on a shaded row.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To each sortable header's button, and to the frame when the table is too wide and scrolls |
| Enter / Space | On a sortable header, sorts by it; the new order is announced |
| Arrow keys | With focus on the scrolling frame, scroll the table; on a resize handle, narrow or widen the column 16px (mirrored right to left) |
| Home / End | On a resize handle, the column's narrowest and widest |

## Props

### Table

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the `<table>`, not the scrolling wrapper, so `aria-describedby` and links to it reach the table. |
| `size` | `'sm'` \| `'md'` | `'md'` | 12px cell padding, or 8px top and bottom for dense data |
| `layout` | `'auto'` \| `'fixed'` | `'auto'` | `'fixed'`: column widths come from the header cells' `width` and stay put as rows change; long text wraps |
| `striped` | boolean | `false` | Shades every other body row (rows then don't change on hover) |
| `stickyHeader` | boolean | `false` | Keeps the header in view; give the frame a height with `containerProps` |
| `caption` | node | none | The table's title, as its `<caption>` |
| `hideCaption` | boolean | `false` | Hides the caption on screen; screen readers still announce it. |
| `pinStart` | boolean | `false` | Keeps the first column in view while the table scrolls sideways |
| `pinEnd` | boolean | `false` | Keeps the last column in view while the table scrolls sideways |
| `containerProps` | div props | none | Go to the scrolling frame, which has `data-component="table"`. An `aria-label` or `aria-labelledby` here names the frame only while it scrolls (when it's a region); a caption takes precedence |

`className`, `ref` and everything else go to the `<table>`.

### The parts

| Part | Element | Props |
| --- | --- | --- |
| `TableHead`, `TableBody`, `TableFoot` | `<thead>`, `<tbody>`, `<tfoot>` | everything goes to the element |
| `TableRow` | `<tr>` | `selected`: shaded, with a primary bar at its start; `href` (with `target`, `rel`): the whole row is one link, from its link cell |
| `TableSelectCell` | `<td>`, or `<th scope="col">` with `header` | `label` (required, the checkbox's name: "Select Ada", "Select all rows"); `checked`, `defaultChecked`, `indeterminate`, `onChange`, `disabled`, `name`, `value` and `ref` go to the [Checkbox](../Checkbox/README.md); `cellProps` to the cell. A row whose checkbox is checked is shaded like a selected one |
| `TableHeaderCell` | `<th scope="col">` | `align` (`'start'` \| `'center'` \| `'end'`); `width`: the column's width with `layout="fixed"`; `sort` (`'ascending'` \| `'descending'` \| `'none'`) and `onSort` make it a sort button; `resizable` adds a resize handle, within `minWidth` (48) and `maxWidth` (800), with `onWidthChange(width)` (with a number `width`, it's controlled). Pass `scope="row"` for a row header |
| `TableActionBar` | `<div role="group">`, before the Table | `count` (required: the bar shows while it's above 0); `onClear` adds "Clear selection"; `clearLabel` renames it; children are the actions; `className`, `ref` and the rest go to the `<div>` |
| `TableCell` | `<td>` | `align`; `'end'` also gives tabular digits, for numbers; `link`: in a row with `href`, this cell holds the row's link (default: the first `TableCell`) |
| `TableExpandCell` | `<td>` with a button, or `<th scope="col">` with `header` | `label`: the row's name, for the button's; `expanded`, `onExpandedChange(expanded)`; `controls`: its `TableDetailRow`'s id; the rest goes to the cell |
| `TableDetailRow` | `<tr>` with one `<td>` across | `open` (required: hidden while false), `colSpan` (required: every column); `id`, `className`, `ref` and the rest go to the `<tr>` |
| `TableColumnsMenu` | a Button and a Popover | `columns` (required: `{ id, label, visible, required? }` in the table's order), `onColumnsChange(columns, { id, visible })` (required), `label` (default "Columns") |
| `TableVirtualBody` (beta) | `<tbody>` drawing only the rows in view | `count` (required); `renderRow(index)` (required) returns a `TableRow`; `itemKey(index)`: a stable key per row (default the index); `estimatedRowHeight`: a guess for rows not drawn yet (default 41, 36 at `size="sm"`); `overscan`: rows drawn beyond each edge (default 6); the rest goes to the `<tbody>` |

## Component tokens

Each is an optional override: set it on the page, a container or one table's frame. The list lives in `src/components/Table/table.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from table.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--table-bg` | `surface` | The table's background. |
| `--table-text` | `text` | Cell text. |
| `--table-border` | `border` | The frame and the lines between rows. |
| `--table-header-bg` | `surface-muted` | The header row's background. |
| `--table-header-text` | `text-muted` | Header text (4.5:1 on header-bg). |
| `--table-row-bg-hover` | `surface-muted` | A body row on hover, and every other row when striped (muted text keeps 4.5:1). |
| `--table-row-bg-selected` | `surface-muted` | A selected row's background. |
| `--table-row-indicator-selected` | `primary` | The bar at the start of a selected row. |
| `--table-focus-ring` | `focus-ring` | The keyboard focus ring (sort buttons, a scrolling table). |
| `--table-sort-bg-pressed` | `pressed` | A sortable header's fill while it's held down. |
| `--table-action-bar-bg` | `primary-subtle` | TableActionBar's background. |
| `--table-action-bar-text` | `text` | TableActionBar's count (4.5:1 on its background). |
| `--table-resize-active` | `primary` | A column's resize handle on hover, while dragged and on focus. |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--table-head-shadow-scrolled` | `elevation-part` | A sticky header's shadow once rows have scrolled under it (where scroll-state container queries are supported). |
| `--table-pin-shadow-scrolled` | `elevation-part` | A pinned column's shadow on its inner edge while there's more to scroll to under it (where scroll-state container queries are supported). |

**Type**

| Token | Default | Use |
| --- | --- | --- |
| `--table-font-size` | `text-sm` | Cell text (14px). |
| `--table-header-weight` | `font-medium` | Header text weight (500). |
| `--table-action-bar-weight` | `font-semibold` | TableActionBar's count. |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--table-padding-x` | `spacing-3` | A cell's side padding (12px). |
| `--table-padding-y` | `spacing-3` | A cell's top and bottom padding at size md (12px). |
| `--table-padding-y-sm` | `spacing-2` | At size sm (8px). |
| `--table-action-bar-padding` | `spacing-2` | Space inside TableActionBar (8px). |

**Border**

| Token | Default | Use |
| --- | --- | --- |
| `--table-border-width` | `border-width-1` | The frame and row lines (1px). |
| `--table-indicator-width` | `border-width-2` | The selected row's bar (2px). |

**Radius**

| Token | Default | Use |
| --- | --- | --- |
| `--table-radius` | `radius-surface` | The frame's corners (8px). |
<!-- token-table:end -->

## Related

- [Pagination](../Pagination/README.md): pages through a long table.

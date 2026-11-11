# DataGrid

A grid of cells people work on in place, like a spreadsheet: move with the arrow keys, edit a cell where it is, select a range, and copy or paste a block to and from a spreadsheet. The app keeps the rows; `onRowsChange` gives the new rows and which cells changed.

```tsx
import { DataGrid } from "serupa-ds";

<DataGrid
  aria-label="Stock"
  columns={[
    { key: "name", header: "Product", editable: true },
    { key: "stock", header: "In stock", editable: true, align: "end" },
  ]}
  rows={rows}
  onRowsChange={setRows}
/>
```

## When to use

- Data people change cell by cell or in bulk: a price list, a stock count, a timesheet, a budget.
- Data people move between the app and a spreadsheet: a block copied from one pastes into the other.

## When not to use

- Rows to read, sort, select and act on: use a [Table](../Table/README.md). Its rows and buttons work like the rest of the page; a grid's arrow keys are one more thing to learn.
- A form for one record: use [Field](../Field/README.md)s.
- Thousands of rows: use a [Table](../Table/README.md) with `TableVirtualBody`; DataGrid draws every row.

## Anatomy

Drawn from the `Playground` story.

1. **Frame** (`.dk-data-grid`): the bordered, rounded box; it scrolls sideways when the columns are wider.
2. **Header** (`.dk-data-grid__header`): a column's name, in the header row.
3. **Cell** (`.dk-data-grid__cell`): one value; the active cell has a focus ring inside it.

## Usage

- Name it with `aria-label` or `aria-labelledby`.
- `columns`: `key` (the row field), `header`, and optionally `editable`, `align` (`"end"` for numbers), `width`, and `format(row)` for the text shown, edited and copied (a price with separators). The grid writes a cell's text as it gets it: without `format`, a number shows in Latin digits whatever the locale, so a spreadsheet takes it back as a number.
- `rows`: objects with an id under `rowKey` (`"id"` by default).
- `onRowsChange(rows, { changes })` is called once per edit, paste or Delete over a range. `rows` is the new rows with each changed field set to the text typed or pasted; `changes` lists every cell that changed, `{ rowId, column, value }`. Set `rows` from it, or parse and check `changes` first (a number column gets text). A change you don't take leaves the old text. Without `onRowsChange`, nothing is editable.
- A pasted block fills from the active cell (or the top-left of the range), as far as the grid goes, skipping read-only columns; one value pasted over a range fills all of it.
- `size`: `sm` for a dense grid on a wide screen, `md` (the default) beside other medium controls, and `lg` on touch screens or where the grid is the page's main task: its rows are at least 44px tall, a comfortable target for a finger.

### Loading, empty and failed

The grid keeps its header row in every state, so the page doesn't move and people know what's coming.

- **Loading:** set `busy` with no `rows` yet. The grid draws `loadingRows` placeholder rows (3 by default; about as many as will come), each as tall as a real one at every `size`, so nothing jumps when the data arrives. Name the wait in `loadingLabel` ("Loading stock"): a screen reader hears it once, after the loader's delay, so a quick load says nothing. `busy` sets `aria-busy` on the grid while it lasts. To reload rows already shown, keep them and set `busy`.
- **Empty:** no `rows` and a `message` holding an `EmptyState size="sm"`: what's missing, and the action that adds the first one. It's one cell across every column.
- **Failed:** the same `message` with a danger `Alert`, which says what didn't load and offers Retry in `actions`. A danger Alert is `role="alert"`, so the failure is heard as it appears. On Retry, go back to loading.

```tsx
<DataGrid aria-label="Stock" columns={columns} rows={state === 'loaded' ? rows : []}
  busy={state === 'loading'} loadingRows={5} loadingLabel="Loading stock"
  message={state === 'failed'
    ? <Alert tone="danger" actions={<Button size="sm" onClick={load}>Retry</Button>}>Stock didn't load.</Alert>
    : <EmptyState size="sm" title="No products yet" />} />
```

### Do and don't

- **Do:** A DataGrid where people change values cell by cell, such as stock counts. (`DoEditable`)
- **Don't:** A DataGrid for data nobody edits: every cell becomes a keyboard stop, and a Table reads row by row with less work. (`DontReadOnly`)

## Accessibility

- **Role and name:** a `<table role="grid">` named by `aria-label`, with `aria-rowcount`, `aria-colcount` and `aria-multiselectable`; column headers and `gridcell`s with `aria-selected`; cells in a read-only column of an editable grid have `aria-readonly`. A hidden line describes how to edit. Copies and pastes are announced ("4 cells copied").
- **Keyboard:** one cell is the Tab stop, and the grid keeps it when focus comes back.

| Key | Does |
| --- | --- |
| Arrow keys | Move one cell (right and left swap in right-to-left text). The header row is part of the grid. |
| Home, End | The row's first or last cell; with Ctrl, the grid's first or last. |
| Page Up, Page Down | Ten rows up or down. |
| Shift + any of these, Shift+click | Select a range from where it started. |
| Ctrl+A | Select every cell. |
| Enter, F2, double click | Edit the cell, keeping its text. Typing a character starts an edit with it. |
| Enter, Tab (editing) | Save, and move down, or to the next cell (Shift+Tab: the one before). |
| Escape (editing) | Cancel the edit. |
| Delete, Backspace | Clear the range's editable cells. |
| Ctrl+C, Ctrl+V | Copy the range as tab-separated text; paste a block. |

- **Contrast:** cell text reads 4.5:1 on the cells, the header and the selected range, and the focus ring 3:1, in all six themes (`DataGrid.test.tsx`). In forced colors the selection is Highlight.
- **What's still yours:** checking values and saying what's wrong (in a message near the grid), and an undo where a paste can do damage.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the `<table>`. |
| `columns` | `DataGridColumn[]` | | `{ key, header, editable?, align?, width?, format? }`. |
| `rows` | `DataGridRow[]` | | The data, each with an id. |
| `rowKey` | `string` | `"id"` | The field that holds a row's id. |
| `onRowsChange` | `(rows: DataGridRow[], details: { changes: DataGridCellChange[] }) => void` | | The new rows, and `{ rowId, column, value }` for each cell changed. Without it, nothing edits. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | The cells' padding; `lg` also sets 16px text, for rows at least 44px tall. |
| `busy` | `boolean` | `false` | Rows are loading: sets `aria-busy`, and with no rows shows placeholders. |
| `loadingRows` | `number` | `3` | How many placeholder rows. |
| `loadingLabel` | `string` | `"Loading"` | Said once as the placeholders appear. |
| `message` | `ReactNode` | | Shown across every column when there are no rows and it isn't busy: an EmptyState or an Alert. |

`className` goes to the frame; `ref`, `aria-*` and other props go to the `<table>`.

## Component tokens

Each is an optional override: set it on the page, a container or one DataGrid. The list lives in `src/components/DataGrid/data-grid.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from data-grid.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--data-grid-bg` | `surface` | The cells' background. |
| `--data-grid-text` | `text` | The cells' text (4.5:1 on bg, header-bg and selected-bg). |
| `--data-grid-border` | `border` | The frame's border. |
| `--data-grid-line` | `border` | The lines between cells. |
| `--data-grid-header-bg` | `surface-muted` | The header row's background. |
| `--data-grid-header-text` | `text-muted` | The header row's text (4.5:1 on header-bg). |
| `--data-grid-selected-bg` | `primary-subtle` | The selected range's background. |
| `--data-grid-focus-ring` | `focus-ring` | The ring inside the active cell (3:1 on bg and selected-bg). |
| `--data-grid-input-bg` | `field` | A cell's background while it's edited. |
| `--data-grid-font-size` | `text-sm` | The cells' text (14px). |
| `--data-grid-header-weight` | `font-medium` | The header text's weight (500). |
| `--data-grid-font-size-lg` | `text-base` | The cells' text with size lg (16px). |
| `--data-grid-padding-x` | `spacing-3` | Space at a cell's sides (12px). |
| `--data-grid-padding-y` | `spacing-2` | Space above and below a cell's text (8px). |
| `--data-grid-padding-y-sm` | `spacing-1` | The same with size sm (4px). |
| `--data-grid-padding-x-lg` | `spacing-4` | A cell's inline padding with size lg (16px). |
| `--data-grid-padding-y-lg` | `spacing-2.5` | A cell's block padding with size lg (10px): with 16px text, a row at least 44px tall. |
| `--data-grid-message-padding` | `spacing-6` | Space around the message shown in place of rows (24px). |
| `--data-grid-border-width` | `border-width-1` | The frame's and lines' width (1px). |
| `--data-grid-radius` | `radius-surface` | The frame's corners. |
<!-- token-table:end -->

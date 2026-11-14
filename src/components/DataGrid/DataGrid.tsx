'use client';
import * as React from 'react';
import { cn, domId, oneOf, omit, setRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { displayNumber } from '../../internal/numbers';
import { announce } from '../../internal/announce';
import { isComposing } from '../../internal/ime';
import { SkeletonArt, useSkeletonShown } from '../../internal/loaderSkeleton';
import { en as words } from './labels';
import { useStickyHead } from '../../internal/stickyHead';
import { useClipboardHandOn } from '../../internal/clipboardHandOn';

/** A row of data: any object; its id is read from the `rowKey` field ("id" by default). */
export type DataGridRow = Record<string, unknown>;

/** One column of rows of type R: its key must be one of R's fields, and format gets an R. */
export interface DataGridColumn<R extends object = DataGridRow> {
  /** The row field it shows, and its id in a change. */
  key: Extract<keyof R, string>;
  /** The column's header text. */
  header: string;
  /** Whether its cells can be edited and pasted into. Default: false. */
  editable?: boolean | undefined;
  /** Where its text sits: "start" (the default), "center", or "end" for numbers (tabular figures). */
  align?: 'start' | 'center' | 'end' | undefined;
  /** Its width, as CSS (120, "8rem", "20%"). Default: as wide as its content needs. */
  width?: number | string | undefined;
  /** The cell's text from the row: what's shown, edited, copied and searched. Default: the field as a string. */
  format?: ((row: R) => string) | undefined;
}

/** One cell changed: by an edit, a paste, or Delete. `value` is the text typed or pasted; parse it yourself. */
export interface DataGridCellChange {
  rowId: string;
  column: string;
  value: string;
}

/** What onRowsChange says besides the new rows: each cell that changed. */
export interface DataGridRowsChangeDetails {
  changes: DataGridCellChange[];
}

/** Typed by its rows: `<DataGrid rows={people} columns={…} />` checks each column's key against a person's fields. */
export interface DataGridProps<R extends object = DataGridRow> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'rows'> {
  /** The columns, in order. */
  columns: DataGridColumn<R>[];
  /** The rows, in order. */
  rows: R[];
  /** The field that holds each row's id. Default: "id". */
  rowKey?: Extract<keyof R, string> | undefined;
  /** Called with the new rows after an edit, a paste or Delete over a range, each changed field set to the text
   *  typed or pasted, and every cell that changed in `details.changes`. Set rows from it, or parse the changes
   *  yourself; a change you don't take shows the old text again. Without it, nothing is editable. */
  onRowsChange?: ((rows: R[], details: DataGridRowsChangeDetails) => void) | undefined;
  /** The cells' size: "sm", "md" (the default) or "lg" (16px text, rows at least 44px, for touch). */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Keeps the header row in view while the grid scrolls inside a frame with a height (give it one with
   *  containerProps), so the column names stay in sight far down a long grid. The cell the keyboard moves to scrolls
   *  in below the header, not under it. Default: false. */
  stickyHeader?: boolean | undefined;
  /** Props for the scrolling frame around the grid, such as `style={{ maxHeight: 480 }}` for stickyHeader. */
  containerProps?: React.HTMLAttributes<HTMLDivElement> | undefined;
  /** Its rows are loading (or reloading): sets aria-busy, and while there are no rows yet, shows placeholder rows
   *  the height of real ones. Default: false. */
  loading?: boolean | undefined;
  /** How many placeholder rows show while loading with no rows: about as many as will load. Default: 3. */
  loadingRows?: number | undefined;
  /** Said once as the placeholders appear ("Loading timesheet"), after the loader's delay. Default: "Loading" (labels.loading). */
  loadingLabel?: string | undefined;
  /** Shown in one row across every column when there are no rows and it isn't loading: an EmptyState when there are
   *  none, or an Alert with Retry when they didn't load. */
  message?: React.ReactNode;
}

type Pos = { r: number; c: number };
const OWN = { columns: 1, rows: 1, rowKey: 1, onRowsChange: 1, size: 1, stickyHeader: 1, containerProps: 1, loading: 1, loadingRows: 1, loadingLabel: 1, message: 1, className: 1, onKeyDown: 1, onCopy: 1, onPaste: 1 } as const;
const textOf = (col: DataGridColumn, row: DataGridRow) => (col.format ? col.format(row) : row[col.key] == null ? '' : String(row[col.key]));
// Clipboard text as rows of cells: tab between cells, a line break between rows (what spreadsheets copy).
const parseTsv = (text: string) => text.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));

/* DataGrid: a spreadsheet-like grid of cells, for data people work on in place (a price list, a stock count, a
   timesheet): native table markup with role="grid" (WAI-ARIA grid pattern). One cell is a Tab stop; the arrow keys,
   Home and End (with Ctrl, the grid's ends) and Page Up and Page Down move it. Shift with them, or Shift+click,
   selects a range; Ctrl+A all. Enter or F2 edits an editable cell, typing starts an edit with that character,
   Enter or Tab saves (moving down or on), Escape cancels; Delete clears the range. Copy gives the range as
   tab-separated text; paste fills from the cell, so a block copied from a spreadsheet lands as a block. The app
   keeps the rows: onRowsChange gives the new ones and what changed. Column headers are part of the grid and say their name. */
/** A grid of cells to move through with the arrow keys, edit in place, select, copy and paste, like a spreadsheet.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const DataGrid = /* @__PURE__ */ component<HTMLTableElement, DataGridProps>('DataGrid', function DataGrid(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(words).labels, locale = useLocale();
  const base = domId('dk-dg', React.useId());
  const { columns, rows } = props;
  const key = props.rowKey || 'id';
  const size = oneOf(['sm', 'md', 'lg'] as const, props.size, 'md');
  const canEdit = !!props.onRowsChange;
  const lastRow = rows.length;   // row 0 is the header row
  const lastCol = columns.length - 1;
  const [at, setAt] = React.useState<Pos>({ r: rows.length ? 1 : 0, c: 0 });
  const [anchor, setAnchor] = React.useState<Pos | null>(null);
  const [edit, setEdit] = React.useState<{ text: string } | null>(null);
  const table = React.useRef<HTMLTableElement | null>(null);
  const focusCell = React.useRef(false);
  const cur = { r: Math.min(at.r, lastRow), c: Math.min(at.c, Math.max(lastCol, 0)) };

  // The range: from the anchor to the active cell, in body rows only. Rows or columns taken away since (a filter,
  // another user) take the anchor back inside the grid, as they do the active cell.
  const from = anchor && { r: Math.min(anchor.r, lastRow), c: Math.min(anchor.c, Math.max(lastCol, 0)) };
  const range = from ? { r1: Math.max(1, Math.min(from.r, cur.r)), r2: Math.max(from.r, cur.r), c1: Math.min(from.c, cur.c), c2: Math.max(from.c, cur.c) }
    : cur.r > 0 ? { r1: cur.r, r2: cur.r, c1: cur.c, c2: cur.c } : null;

  const cellEl = (p: Pos) => table.current && table.current.querySelector<HTMLElement>(`[data-cell="${p.r}-${p.c}"]`);
  // Focus follows the active cell once it moved by a key or a click (not on the first render, or when rows change).
  // every render: a move sets focusCell, and the cell to focus only exists once that render is on the page.
  React.useEffect(() => {
    if (!focusCell.current || edit) return;
    focusCell.current = false;
    cellEl(cur)?.focus();
  });

  const move = (p: Pos, extend: boolean) => {
    const next = { r: Math.max(0, Math.min(lastRow, p.r)), c: Math.max(0, Math.min(lastCol, p.c)) };
    setAnchor(extend ? anchor || cur : null);
    setAt(next);
    focusCell.current = true;
  };
  const editable = (p: Pos) => canEdit && p.r > 0 && !!columns[p.c]?.editable;
  // A body cell's row and column, when both are in the grid (r counts the header row as 0).
  const cellAt = (r: number, c: number) => { const row = rows[r - 1], col = columns[c]; return row && col ? { row, col } : null; };
  const cellText = (r: number, c: number) => { const at = cellAt(r, c); return at ? textOf(at.col, at.row) : ''; };
  const change = (changes: DataGridCellChange[]) => {
    if (!changes.length || !props.onRowsChange) return;
    const next = rows.map((row) => {
      const mine = changes.filter((x) => x.rowId === String(row[key]));
      if (!mine.length) return row;
      const copy: DataGridRow = { ...row };
      for (const x of mine) copy[x.column] = x.value;
      return copy;
    });
    props.onRowsChange(next, { changes });
  };
  const save = (text: string, then: Pos | null) => {
    const row = rows[cur.r - 1], col = columns[cur.c];
    if (row && col && text !== textOf(col, row)) change([{ rowId: String(row[key]), column: col.key, value: text }]);
    setEdit(null);
    focusCell.current = true;
    if (then) move(then, false);
  };

  const rtl = () => !!table.current && getComputedStyle(table.current).direction === 'rtl';
  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    props.onKeyDown?.(e);
    if (e.defaultPrevented || edit || isComposing(e)) return;
    const ctrl = e.ctrlKey || e.metaKey, shift = e.shiftKey, back = rtl() ? 1 : -1;
    const go = (p: Pos) => { e.preventDefault(); move(p, shift); };
    switch (e.key) {
      case 'ArrowDown': return go({ r: cur.r + 1, c: cur.c });
      case 'ArrowUp': return go({ r: cur.r - 1, c: cur.c });
      case 'ArrowRight': return go({ r: cur.r, c: ctrl ? (back < 0 ? lastCol : 0) : cur.c - back });
      case 'ArrowLeft': return go({ r: cur.r, c: ctrl ? (back < 0 ? 0 : lastCol) : cur.c + back });
      case 'Home': return go(ctrl ? { r: 1, c: 0 } : { r: cur.r, c: 0 });
      case 'End': return go(ctrl ? { r: lastRow, c: lastCol } : { r: cur.r, c: lastCol });
      case 'PageDown': return go({ r: cur.r + 10, c: cur.c });
      case 'PageUp': return go({ r: Math.max(1, cur.r - 10), c: cur.c });
    }
    if (ctrl && e.key.toLowerCase() === 'a') { e.preventDefault(); setAnchor({ r: 1, c: 0 }); setAt({ r: lastRow, c: lastCol }); return; }
    if (ctrl || e.altKey) return;
    if ((e.key === 'Enter' || e.key === 'F2') && editable(cur)) { e.preventDefault(); setEdit({ text: cellText(cur.r, cur.c) }); return; }
    if ((e.key === 'Delete' || e.key === 'Backspace') && range) {
      e.preventDefault();
      const list: DataGridCellChange[] = [];
      for (let r = range.r1; r <= range.r2; r++) for (let c = range.c1; c <= range.c2; c++) { const at = cellAt(r, c); if (at && editable({ r, c }) && textOf(at.col, at.row)) list.push({ rowId: String(at.row[key]), column: at.col.key, value: '' }); }
      change(list);
      return;
    }
    // A character typed on an editable cell starts an edit with it, as in a spreadsheet.
    if (e.key.length === 1 && e.key !== ' ' && editable(cur)) { e.preventDefault(); setEdit({ text: e.key }); }
  };

  const onCopy = (e: React.ClipboardEvent<HTMLTableElement>) => {
    props.onCopy?.(e);
    if (edit || !range || e.defaultPrevented) return;
    const lines: string[] = [];
    for (let r = range.r1; r <= range.r2; r++) { const row = rows[r - 1]; if (row) lines.push(columns.slice(range.c1, range.c2 + 1).map((col) => textOf(col, row)).join('\t')); }
    e.preventDefault();
    e.clipboardData.setData('text/plain', lines.join('\n'));
    const cells = (range.r2 - range.r1 + 1) * (range.c2 - range.c1 + 1);
    announce(L.dataGridCopied(cells, displayNumber(cells, locale)));
  };
  const onPaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    props.onPaste?.(e);
    if (edit || e.defaultPrevented || cur.r < 1) return;
    e.preventDefault();
    const block = parseTsv(e.clipboardData.getData('text/plain'));
    // One value pasted over a range fills the range; a block fills from the active cell, as far as the grid goes.
    const lone = block.length === 1 && block[0]?.length === 1 ? block[0][0] : undefined, one = lone !== undefined && range;
    const list: DataGridCellChange[] = [];
    const put = (r: number, c: number, v: string) => { const at = cellAt(r, c); if (at && editable({ r, c })) list.push({ rowId: String(at.row[key]), column: at.col.key, value: v }); };
    if (one) { for (let r = range.r1; r <= range.r2; r++) for (let c = range.c1; c <= range.c2; c++) put(r, c, lone); }
    else { const r0 = range ? range.r1 : cur.r, c0 = range ? range.c1 : cur.c; block.forEach((line, i) => line.forEach((v, j) => put(r0 + i, c0 + j, v))); }
    change(list);
    if (list.length) announce(L.dataGridPasted(list.length, displayNumber(list.length, locale)));
  };

  // Ctrl+C and Ctrl+V with no text selected reach the grid wherever focus is in it (Chrome before 125 sends them to the body).
  useClipboardHandOn(table);

  const pick = (p: Pos, e: React.MouseEvent) => { if (edit) return; move(p, e.shiftKey && p.r > 0); };
  const tabStop = (r: number, c: number) => (r === cur.r && c === cur.c ? 0 : -1);
  // With no rows: placeholders the height of real rows while loading (only the first says "Loading", once), otherwise
  // the app's message in one cell across every column. Neither is a cell the arrow keys reach.
  const frame = React.useRef<HTMLDivElement>(null);
  // A sticky header covers the top of the frame: measured, so the active cell scrolls in below it (the CSS reads --dk-data-grid-head).
  useStickyHead(frame, !!props.stickyHeader, 'thead', '--dk-data-grid-head');
  const loading = !!props.loading;
  const placeholders = !rows.length && loading ? Math.min(50, Math.max(1, Math.floor(Number(props.loadingRows)) || 3)) : 0;
  const message = !rows.length && !placeholders && props.message != null && props.message !== false ? props.message : null;
  // Stable handlers for the memoised rows, reading the latest state through a ref: an arrow key then redraws the two
  // rows it moves between, not every cell of the grid (GR397).
  const latest = React.useRef({ pick, save, editable, lastRow, edit });
  latest.current = { pick, save, editable, lastRow, edit };
  const api = React.useMemo<RowApi>(() => ({
    pick: (p, e) => latest.current.pick(p, e),
    begin: (p, text) => { if (latest.current.editable(p)) setEdit({ text }); },
    save: (text, then) => latest.current.save(text, then && { r: Math.min(then.r, latest.current.lastRow), c: Math.max(0, then.c) }),
    blur: (text) => { if (latest.current.edit) latest.current.save(text, null); },
    cancel: () => { setEdit(null); focusCell.current = true; },
  }), []);
  const cp = props.containerProps || {};
  return (
    <div {...cp} ref={frame} className={cn('dk-data-grid', size !== 'md' && 'dk-data-grid--' + size, props.stickyHeader && 'dk-data-grid--sticky', props.className, cp.className)} data-component="data-grid">
      <table {...rest} ref={(n) => { table.current = n; setRef(ref, n); }}
        role="grid" aria-busy={loading || undefined} aria-rowcount={placeholders ? -1 : rows.length + 1} aria-colcount={columns.length} aria-multiselectable="true" aria-describedby={cn(base + '-hint', props['aria-describedby']) || undefined}
        className="dk-data-grid__table" onKeyDown={onKeyDown} onCopy={onCopy} onPaste={onPaste}>
        <thead>
          <tr role="row" aria-rowindex={1}>
            {columns.map((col, c) => (
              <th key={col.key} role="columnheader" scope="col" aria-colindex={c + 1} tabIndex={tabStop(0, c)} data-cell={`0-${c}`}
                className={cn('dk-data-grid__header', col.align && col.align !== 'start' && 'dk-data-grid__cell--' + col.align)}
                style={col.width != null ? { width: col.width } : undefined} onClick={(e) => pick({ r: 0, c }, e)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const r = i + 1, inside = !!range && r >= range.r1 && r <= range.r2;
            return <GridRow key={String(row[key])} row={row} r={r} columns={columns} api={api} active={r === cur.r ? cur.c : -1} c1={inside ? range.c1 : -1} c2={inside ? range.c2 : -1}
              edit={r === cur.r ? edit : null} canEdit={canEdit} editLabel={L.dataGridEdit} />;
          })}
          {placeholders ? <LoadingRows rows={placeholders} columns={columns} label={props.loadingLabel == null ? L.loading : props.loadingLabel} /> : null}
          {message != null && (
            <tr role="row" aria-rowindex={2}>
              <td role="gridcell" colSpan={columns.length} aria-colspan={columns.length} className="dk-data-grid__cell dk-data-grid__message">{message}</td>
            </tr>
          )}
        </tbody>
      </table>
      <p hidden id={base + '-hint'}>{L.dataGridHint}</p>
    </div>
  );
}) as <R extends object = DataGridRow>(props: DataGridProps<R> & { ref?: React.Ref<HTMLTableElement> | undefined }) => React.ReactElement;

interface RowApi { pick: (p: Pos, e: React.MouseEvent) => void; begin: (p: Pos, text: string) => void; save: (text: string, then: Pos | null) => void; blur: (text: string) => void; cancel: () => void }
// One body row. Memoised on what it shows: its row, the active column when the active cell is here (else -1), the
// selected columns c1..c2 when the range crosses it (else -1), and the edit when it's here.
const GridRow = /* @__PURE__ */ React.memo(function GridRow(p: { row: DataGridRow; r: number; columns: DataGridColumn[]; api: RowApi; active: number; c1: number; c2: number; edit: { text: string } | null; canEdit: boolean; editLabel: (header: string) => string }) {
  const { row, r, api } = p;
  return (
    <tr role="row" aria-rowindex={r + 1}>
      {p.columns.map((col, c) => {
        const active = c === p.active, sel = c >= p.c1 && c <= p.c2 && p.c1 >= 0;
        const editing = active && p.edit;
        return (
          <td key={col.key} role="gridcell" aria-colindex={c + 1} tabIndex={active && !editing ? 0 : -1} data-cell={`${r}-${c}`}
            aria-selected={sel} aria-readonly={p.canEdit && !col.editable ? true : undefined}
            className={cn('dk-data-grid__cell', col.align && col.align !== 'start' && 'dk-data-grid__cell--' + col.align, sel && 'dk-data-grid__cell--selected', editing && 'dk-data-grid__cell--editing')}
            onClick={(e) => api.pick({ r, c }, e)} onDoubleClick={() => api.begin({ r, c }, textOf(col, row))}>
            {editing ? (
              <input className="dk-data-grid__input" aria-label={p.editLabel(col.header)} ref={(n) => { if (n && document.activeElement !== n) n.focus(); }} defaultValue={editing.text}
                onFocus={(e) => { const n = e.currentTarget.value.length; e.currentTarget.setSelectionRange(n, n); }}
                onBlur={(e) => api.blur(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (isComposing(e)) return;
                  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); api.cancel(); }
                  else if (e.key === 'Enter') { e.preventDefault(); api.save(e.currentTarget.value, { r: r + 1, c }); }
                  else if (e.key === 'Tab') { e.preventDefault(); api.save(e.currentTarget.value, { r, c: Math.min(p.columns.length - 1, c + (e.shiftKey ? -1 : 1)) }); }
                }} />
            ) : textOf(col, row)}
          </td>
        );
      })}
    </tr>
  );
});

/* The placeholder rows: decorative skeletons in Loader's classes (without Loader's weight), shown after the loader's
   delay, when the label is said once; the grid's aria-busy marks it as loading. */
function LoadingRows(props: { rows: number; columns: DataGridColumn[]; label: string }) {
  const waiting = !useSkeletonShown(props.label);
  return Array.from({ length: props.rows }, (_, r) => (
    <tr key={'loading-' + r} role="row" className="dk-data-grid__loading">
      {props.columns.map((col) => <td key={col.key} role="gridcell" className="dk-data-grid__cell"><SkeletonArt waiting={waiting} /></td>)}
    </tr>
  ));
}

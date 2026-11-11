'use client';
import * as React from 'react';
import { useScrolls } from '../../internal/useScrolls';
import { useStickyHead } from '../../internal/stickyHead';
import { flushSync } from 'react-dom';
import { announce } from '../../internal/announce';
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { Icon } from '../Icon/Icon';
import { Checkbox, type CheckboxProps } from '../Checkbox/Checkbox';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Popover } from '../Popover/Popover';
import { component } from '../../internal/component';
import { activeIn } from '../../internal/root';
import { warnOnce } from '../../internal/warn';
import { useLocale, useSettings } from '../../internal/provider';
import { displayNumber } from '../../internal/numbers';
import { useVirtual } from '../../internal/virtual';
import { useServerStyles } from '../../internal/serverStyles';
import { SkeletonArt, useSkeletonShown } from '../../internal/loaderSkeleton';
import * as icons from '../../material/builtin';
import type { IconData } from '../../material/types';
import { en as words } from './labels';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** 'md' (default): 12px cell padding. 'sm': 8px top and bottom, for dense data. */
  size?: 'sm' | 'md' | undefined;
  /** Shades every other body row. Rows then don't change on hover. Default: false. */
  striped?: boolean | undefined;
  /** 'auto' (default): each column is as wide as its content needs, so widths change with the data. 'fixed': widths
      come from the header cells' width (the rest share what's left) and stay put as rows are sorted, filtered or paged;
      long cell text wraps. */
  layout?: 'auto' | 'fixed' | undefined;
  /** Keeps the header row in view while the table scrolls inside a container with a height. Default: false. */
  stickyHeader?: boolean | undefined;
  /** A title for the table, rendered as its <caption> (announced with it, and names the scroll area). */
  caption?: React.ReactNode | undefined;
  /** Hides the caption on screen; screen readers still announce it. Default: false. */
  hideCaption?: boolean | undefined;
  /** Props for the scrolling frame around the table (style with a maxHeight for stickyHeader). */
  containerProps?: React.HTMLAttributes<HTMLDivElement> | undefined;
  /** Keeps the first column in view while the table scrolls sideways, such as the column that names each row. Default: false. */
  pinStart?: boolean | undefined;
  /** Keeps the last column in view while the table scrolls sideways, such as a column of row actions. Default: false. */
  pinEnd?: boolean | undefined;
  /** Its rows are loading (or reloading): sets aria-busy on the table. Pair it with TableLoadingRows. Default: false. */
  busy?: boolean | undefined;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Marks a row as selected: a shaded background and a primary bar at its start. Screen readers can't tell from
      the shading (and ignore aria-selected in a table), so give the row a TableSelectCell, whose checkbox says it. */
  selected?: boolean | undefined;
  /** Makes the whole row a link to this URL: a real <a> in one cell (the first TableCell, or the one marked link)
      whose area is stretched over the row. Buttons, checkboxes and links in other cells sit above it and work on
      their own. Ctrl/Cmd-click and middle-click open it in a new tab, as any link does. */
  href?: string | undefined;
  /** The row link's target. "_blank" adds rel="noopener noreferrer". */
  target?: string | undefined;
  /** The row link's rel. */
  rel?: string | undefined;
}

export interface TableSelectCellProps extends Omit<CheckboxProps, 'children' | 'description' | 'size' | 'variant'> {
  /** The checkbox's name for screen readers, such as "Select Alpha", or "Select all rows" in the header. */
  label: string;
  /** In the header row: renders a <th>, for a select-all checkbox (with indeterminate while some rows are). Default: false. */
  header?: boolean | undefined;
  /** Props for the cell around the checkbox. */
  cellProps?: React.TdHTMLAttributes<HTMLTableCellElement> | undefined;
}

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface TableHeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Lines the text up: 'start' (default), 'center' or 'end' (numbers). */
  align?: 'start' | 'center' | 'end' | undefined;
  /** Makes the column sortable: the header becomes a button, and this is the current order. */
  sort?: SortDirection | undefined;
  /** Called when the sort button is pressed (decide the next order yourself). */
  onSort?: (() => void) | undefined;
  /** The column's width, for a Table with layout="fixed": a CSS length ("12rem", "30%") or a number of pixels. With
      resizable and onWidthChange, a number of pixels is the controlled width; else it's where the column starts. */
  width?: string | number | undefined;
  /** Adds a handle at the header's end edge that changes the column's width: drag it, use the arrow keys on it, or
      double-click it to fit the column's content. Best in a Table with layout="fixed". Default: false. */
  resizable?: boolean | undefined;
  /** The narrowest a resizable column gets, in pixels. Default: 48. */
  minWidth?: number | undefined;
  /** The widest a resizable column gets, in pixels. Default: 800. */
  maxWidth?: number | undefined;
  /** Called with the new width in pixels as the column is resized: keep it to remember widths, or to control them. */
  onWidthChange?: ((width: number) => void) | undefined;
}

export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Lines the text up: 'start' (default), 'center' or 'end' (numbers, which also get tabular digits). */
  align?: 'start' | 'center' | 'end' | undefined;
  /** In a TableRow with href: this cell holds the row's link (its text is the link's name). Default: the row's
      first TableCell. Mark one when that cell isn't a direct child of the row, or isn't the one that names it. */
  link?: boolean | undefined;
}

export interface TableActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** How many rows are selected. The bar shows while it's more than 0, with "3 selected" at its start. */
  count: number;
  /** Called by its "Clear selection" button: clear the selection. Without it, there's no button. */
  onClear?: (() => void) | undefined;
  /** The clear button's text. Default: "Clear selection" (labels.clearSelection). */
  clearLabel?: string | undefined;
  /** The actions for the selected rows: Buttons such as Delete or Export. */
  children?: React.ReactNode | undefined;
}

const ALIGN = ['start', 'center', 'end'] as const;

/* Table: a native <table> in a frame that scrolls sideways when it's too wide (and then takes keyboard focus
   so it can be scrolled with the arrows). size, striped and stickyHeader style the rows; caption names it.
   className and every other prop go to the <table>; containerProps go to the frame. */
/** A data table: native table markup in a scrolling frame, with sizes, stripes, a sticky header and sortable columns. */
export const Table = /* @__PURE__ */ component<HTMLTableElement, TableProps>('Table', function Table(props, ref) {
  // Server HTML's style attributes (a header's width, the frame's own) under a strict CSP: applied again after
  // hydration, for the frame and everything in it.
  const restyle = useServerStyles<HTMLDivElement>();
  const sds = useSettings(words);
  const rest = omit(props, { size: 1, layout: 1, striped: 1, stickyHeader: 1, caption: 1, hideCaption: 1, containerProps: 1, pinStart: 1, pinEnd: 1, busy: 1, className: 1, children: 1 });
  const size = oneOf(['sm', 'md'] as const, props.size, 'md');
  const frame = React.useRef<HTMLDivElement>(null);
  const scrolls = useScrolls(frame);
  const cid = domId('dk-tc', React.useId());
  // A sticky header covers the top of the frame: measured, so focus scrolls in below it (the CSS reads --dk-table-head).
  useStickyHead(frame, !!props.stickyHeader, '.dk-table__head', '--dk-table-head');
  // A name on the frame belongs to its region role: a plain div that doesn't scroll can't carry one (axe aria-prohibited-attr).
  const { 'aria-label': frameLabel, 'aria-labelledby': frameLabelledBy, ...cp } = props.containerProps || {};
  const hasCaption = props.caption != null && props.caption !== false && props.caption !== '';
  const region = !scrolls ? {} : hasCaption ? { tabIndex: 0, role: 'region', 'aria-labelledby': cid }
    : { tabIndex: 0, role: 'region', 'aria-labelledby': frameLabelledBy, 'aria-label': frameLabelledBy ? undefined : frameLabel || sds.labels.table };
  return (
    <div {...cp} {...region} ref={(n) => { frame.current = n; restyle(n); }} data-component="table" className={cn('dk-table', size === 'sm' && 'dk-table--sm', oneOf(['auto', 'fixed'] as const, props.layout, 'auto') === 'fixed' && 'dk-table--fixed', props.striped && 'dk-table--striped', props.stickyHeader && 'dk-table--sticky', props.pinStart && 'dk-table--pin-start', props.pinEnd && 'dk-table--pin-end', cp.className)}>
      <table aria-busy={props.busy || undefined} {...rest} ref={ref} className={cn('dk-table__table', props.className)}>
        {hasCaption ? <caption id={cid} className={cn('dk-table__caption', props.hideCaption && 'dk-visually-hidden')}>{props.caption}</caption> : null}
        {props.children}
      </table>
    </div>
  );
});

export type TableHeadProps = React.HTMLAttributes<HTMLTableSectionElement>;
export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;
export type TableFootProps = React.HTMLAttributes<HTMLTableSectionElement>;

/** The header rows (<thead>). */
export const TableHead = /* @__PURE__ */ component<HTMLTableSectionElement, TableHeadProps>('TableHead', function TableHead(props, ref) {
  return <thead {...props} ref={ref} className={cn('dk-table__head', props.className)} />;
});

/** The body rows (<tbody>). */
export const TableBody = /* @__PURE__ */ component<HTMLTableSectionElement, TableBodyProps>('TableBody', function TableBody(props, ref) {
  return <tbody {...props} ref={ref} className={cn('dk-table__body', props.className)} />;
});

export interface TableVirtualBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Not used: renderRow draws the rows. */
  children?: never | undefined;
  /** How many rows there are. */
  count: number;
  /** Draws row `index`: a TableRow. */
  renderRow: (index: number) => React.ReactElement;
  /** A stable key for row `index` (its id), so a row keeps its state when rows are added or removed. Default: the index. */
  itemKey?: ((index: number) => React.Key) | undefined;
  /** A guess at a row's height in px, for rows not drawn yet. Rows are measured once drawn. Default: 41 (36 with size="sm"). */
  estimatedRowHeight?: number | undefined;
  /** Rows drawn beyond each edge of the view, so a fast scroll doesn't show a gap. Default: 6. */
  overscan?: number | undefined;
}

// The most rows TableVirtualBody draws for print: about 100 pages of one-line rows, drawn in a second or so.
const PRINT_ROWS = 5000;

/* TableVirtualBody: a <tbody> of any length that draws only the rows in view of the Table's frame, plus a few either
   side (useVirtual, as VirtualList and Combobox do). Give the frame a height (containerProps style maxHeight, or a
   stickyHeader table in a sized box) so it scrolls; without one every row is in view. An empty row above and below the
   drawn ones stands in for the rest, so the columns keep their widths from the drawn rows (use table-layout: fixed or
   column widths for columns that mustn't shift while scrolling). Each drawn row gets aria-rowindex, and the table
   aria-rowcount, so screen readers say "row 5,002 of 10,001". A row with focus stays drawn when it scrolls away. */
/** A table body of thousands of rows that draws only the ones in view of the Table's scrolling frame.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TableVirtualBody = /* @__PURE__ */ component<HTMLTableSectionElement, TableVirtualBodyProps>('TableVirtualBody', function TableVirtualBody(props, ref) {
  const rest = omit(props, { count: 1, renderRow: 1, itemKey: 1, estimatedRowHeight: 1, overscan: 1, className: 1, onFocus: 1, onBlur: 1 });
  const count = Math.max(0, Math.floor(props.count) || 0);
  const body = React.useRef<HTMLTableSectionElement | null>(null);
  const [small, setSmall] = React.useState(false);
  const estimate = props.estimatedRowHeight && props.estimatedRowHeight > 0 ? props.estimatedRowHeight : small ? 36 : 41;
  const r = useVirtual({
    count, estimate, overscan: props.overscan != null && props.overscan >= 0 ? props.overscan : 6,
    rows: () => body.current,
    // The rows start under the caption and the header: where this body starts in the frame's scrolling content.
    origin: () => {
      const b = body.current, f = b && b.closest<HTMLElement>('.dk-table');
      return b && f ? b.getBoundingClientRect().top - f.getBoundingClientRect().top - f.clientTop + f.scrollTop : 0;
    },
  });
  // The Table's frame is the scroller. The header rows count in aria-rowindex, and the table says how many rows there are.
  const attach = r.ref;
  const [head, setHead] = React.useState(0);
  useIsoLayoutEffect(() => {
    const b = body.current, f = b && b.closest<HTMLElement>('.dk-table'), t = b && b.closest('table');
    attach(f);
    setSmall(!!f && f.classList.contains('dk-table--sm'));
    // The rows of the head and foot, by their <tr>s (a DOM without HTMLTableSectionElement.rows, as happy-dom, has these).
    const rowsOf = (s: Element | null | undefined) => (s ? s.querySelectorAll(':scope > tr').length : 0);
    const h = t ? rowsOf(t.querySelector(':scope > thead')) : 0;
    setHead(h);
    if (!t) return;
    t.setAttribute('aria-rowcount', String(h + count + rowsOf(t.querySelector(':scope > tfoot'))));
    // Gone with the virtual body: a table that now draws every row has no hidden rows to count (GR270).
    return () => t.removeAttribute('aria-rowcount');
  }, [attach, count]);
  const [focused, setFocused] = React.useState<number | null>(null);
  // Print: every row (the first PRINT_ROWS), drawn from beforeprint to afterprint, so the printout is the whole table
  // as the Table's print styles promise, not the rows in view (GR103). flushSync, as the browser lays out the page for
  // print as soon as beforeprint returns. Not measured (no data-index): the view is put back as it was afterwards.
  const [printing, setPrinting] = React.useState(false);
  React.useEffect(() => {
    const on = () => flushSync(() => setPrinting(true)), off = () => setPrinting(false);
    window.addEventListener('beforeprint', on);
    window.addEventListener('afterprint', off);
    return () => { window.removeEventListener('beforeprint', on); window.removeEventListener('afterprint', off); };
  }, []);
  const { renderRow, itemKey } = props;
  const row = (i: number, out: boolean) => {
    const el = renderRow(i) as React.ReactElement<{ style?: React.CSSProperties }>;
    const style = out ? { ...el.props.style, position: 'absolute' as const, insetInline: 0, top: r.offsetOf(i) } : el.props.style;
    return React.cloneElement(el, { key: itemKey ? itemKey(i) : i, 'data-index': printing ? undefined : i, 'aria-rowindex': head + i + 1, style } as React.Attributes);
  };
  const rows: React.ReactElement[] = [];
  const keep = !printing && focused != null && focused < count && (focused < r.start || focused >= r.end) ? focused : null;
  const start = printing ? 0 : r.start, end = printing ? Math.min(count, PRINT_ROWS) : r.end;
  if (keep != null && keep < start) rows.push(row(keep, true));
  for (let i = start; i < end; i++) rows.push(row(i, false));
  if (keep != null && keep >= end) rows.push(row(keep, true));
  // Row i is the (i + 1)th child, as in a TableBody, so striped stays on the same rows while scrolling: an empty
  // spacer of no height evens out the count before the drawn rows when it's needed.
  const lead: number[] = [];
  if (!printing && r.before > 0) lead.push(r.before);
  if ((lead.length + (keep != null && keep < start ? 1 : 0)) % 2 !== start % 2) lead.push(0);
  const indexOf = (t: EventTarget | null, tb: Element) => {
    const tr = t instanceof HTMLElement ? t.closest<HTMLElement>('[data-index]') : null;
    return tr && tr.parentElement === tb ? Number(tr.dataset.index) : null;
  };
  const setNode = useMergedRef(ref, (n: HTMLTableSectionElement | null) => { body.current = n; });
  return (
    <tbody {...rest} ref={setNode} className={cn('dk-table__body', 'dk-table__body--virtual', props.className)}
      onFocus={(e) => { setFocused(indexOf(e.target, e.currentTarget)); if (props.onFocus) props.onFocus(e); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(null); if (props.onBlur) props.onBlur(e); }}>
      {lead.map((h, n) => <tr key={'lead' + n} aria-hidden="true" className="dk-table__spacer" style={{ height: h }} />)}
      {rows}
      {!printing && r.after > 0 ? <tr aria-hidden="true" className="dk-table__spacer" style={{ height: r.after }} /> : null}
    </tbody>
  );
});

/** Footer rows such as totals (<tfoot>). */
export const TableFoot = /* @__PURE__ */ component<HTMLTableSectionElement, TableFootProps>('TableFoot', function TableFoot(props, ref) {
  return <tfoot {...props} ref={ref} className={cn('dk-table__foot', props.className)} />;
});

type RowLink = { href: string; target?: string; rel?: string };
const RowLinkContext = /* @__PURE__ */ React.createContext<RowLink | null>(null);

/* With href, the row is one link: an <a> in its link cell (the TableCell marked link, or else the first direct
   TableCell child), whose ::after covers the row (Table.css). A real link, so Ctrl/Cmd and middle click, "Copy link"
   and the status bar work, with nothing re-dispatched. onClick on a row without href reaches the mouse only. */
/** A row (<tr>). selected shades it, with a bar at its start; a TableSelectCell in it says so to screen readers. With href, the whole row is a link. */
export const TableRow = /* @__PURE__ */ component<HTMLTableRowElement, TableRowProps>('TableRow', function TableRow(props, ref) {
  const rest = omit(props, { selected: 1, className: 1, href: 1, target: 1, rel: 1, children: 1 });
  const isLink = props.href != null;
  if (process.env.NODE_ENV !== 'production' && props.onClick && !isLink) warnOnce('table-row-click', "TableRow: onClick on a row reaches mouse users only: the keyboard and screen readers can't press a row. To open something, give the row an href (the whole row becomes a link); for an action, put a button in a cell.");
  const link = React.useMemo(function () {
    return isLink ? { href: props.href!, target: props.target, rel: props.target === '_blank' && props.rel == null ? 'noopener noreferrer' : props.rel } : null;
  }, [isLink, props.href, props.target, props.rel]);
  let children = props.children;
  if (isLink) {
    const kids = React.Children.toArray(children);
    const marked = kids.some(function (k) { return React.isValidElement(k) && k.type === TableCell && (k.props as TableCellProps).link; });
    if (!marked) {
      const first = kids.findIndex(function (k) { return React.isValidElement(k) && k.type === TableCell; });
      if (first >= 0) children = kids.map(function (k, i) { return i === first ? React.cloneElement(k as React.ReactElement<TableCellProps>, { link: true }) : k; });
    }
  }
  return <tr {...rest} ref={ref} className={cn('dk-table__row', props.selected && 'dk-table__row--selected', isLink && 'dk-table__row--link', props.className)}>
    {link ? <RowLinkContext.Provider value={link}>{children}</RowLinkContext.Provider> : children}
  </tr>;
});

/* TableSelectCell: a narrow cell holding a checkbox named by label, for picking rows ("Select Alpha") or, with
   header, all of them. checked, onChange, indeterminate, disabled, name, value and ref go to the checkbox, and
   cellProps to the cell. A row whose checkbox is checked is shaded like a selected row, so an uncontrolled one
   works too; set the row's selected as well when you keep the selection yourself. */
/** A cell with a checkbox for selecting its row (or, with header, every row); the checkbox carries the selected state for screen readers. */
export const TableSelectCell = /* @__PURE__ */ component<HTMLInputElement, TableSelectCellProps>('TableSelectCell', function TableSelectCell(props, ref) {
  const { label, header, cellProps, ...rest } = props;   // the rest is the Checkbox's
  const cp = cellProps || {};
  const box = <Checkbox {...rest} ref={ref} aria-label={label} />;
  const cls = cn('dk-table__cell dk-table__select', cp.className);
  return header ? <th scope="col" {...cp} className={cn(cls, 'dk-table__header')}>{box}</th> : <td {...cp} className={cls}>{box}</td>;
});

const NEXT_ICON: Record<SortDirection, IconData> = { ascending: icons.ArrowUpward, descending: icons.ArrowDownward, none: icons.UnfoldMore };

const STEP = 16;   // px per arrow key on a resize handle, and per Narrower or Wider


/** A header cell (<th>, scope="col" unless you say otherwise). With sort, its text is a button and aria-sort says the order. With resizable, a handle at its end changes the column's width. */
export const TableHeaderCell = /* @__PURE__ */ component<HTMLTableCellElement, TableHeaderCellProps>('TableHeaderCell', function TableHeaderCell(props, ref) {
  const rest = omit(props, { align: 1, sort: 1, onSort: 1, width: 1, resizable: 1, minWidth: 1, maxWidth: 1, onWidthChange: 1, style: 1, className: 1, children: 1 });
  const resizable = !!props.resizable;
  const min = props.minWidth != null && props.minWidth > 0 ? props.minWidth : 48;
  const max = Math.max(min, props.maxWidth != null && props.maxWidth > 0 ? props.maxWidth : 800);
  const controlled = resizable && typeof props.width === 'number' && !!props.onWidthChange;
  const [own, setOwn] = React.useState<number | null>(() => (typeof props.width === 'number' ? props.width : null));
  const current = controlled ? (props.width as number) : resizable ? own : null;
  const width = current != null ? current : props.width;
  const style = width != null ? { ...props.style, width: typeof width === 'number' ? width + 'px' : width } : props.style;
  const align = oneOf(ALIGN, props.align, 'start');
  const sort = props.sort !== undefined ? oneOf(['ascending', 'descending', 'none'] as const, props.sort, 'none') : null;
  // A new order is read out ("Sorted by Amount, ascending"): aria-sort alone is only heard when focus reaches the
  // header again, and the button keeps focus. Not on the first render.
  const labels = useSettings(words).labels;
  const button = React.useRef<HTMLButtonElement | null>(null);
  const was = React.useRef(sort);
  React.useEffect(function () {
    if (sort === was.current) return;
    was.current = sort;
    if ((sort === 'ascending' || sort === 'descending') && button.current) announce(labels.tableSorted((button.current.textContent || '').trim(), sort));
  }, [sort, labels]);
  const th = React.useRef<HTMLTableCellElement | null>(null);
  const setTh = useMergedRef(ref, (n: HTMLTableCellElement | null) => { th.current = n; });
  const handle = React.useRef<HTMLSpanElement | null>(null);
  // The handle's keys, drag and double-click, as native listeners: the newest width and callback through a ref.
  const live = React.useRef({ min, max, current, controlled, onWidthChange: props.onWidthChange });
  live.current = { min, max, current, controlled, onWidthChange: props.onWidthChange };
  // A click on the handle (not a drag) or Enter opens Narrower, Wider and Fit: the width without dragging (2.5.7).
  // A native popover (popover="auto": Escape and a press outside close it), so a Table without resizing, or a
  // Chart's data table, doesn't carry Popover's code.
  const panel = React.useRef<HTMLDivElement | null>(null);
  const act = React.useRef<{ set: (n: number) => void; now: () => number; fit: () => void } | null>(null);
  React.useEffect(() => {
    const h = handle.current, cell = th.current;
    if (!resizable || !h || !cell) return;
    const now = () => (live.current.current != null ? live.current.current : Math.round(cell.getBoundingClientRect().width));
    const set = (n: number) => {
      const l = live.current, w = Math.round(Math.min(l.max, Math.max(l.min, n)));
      if (!l.controlled) setOwn(w);
      if (l.onWidthChange) l.onWidthChange(w);
    };
    const rtl = () => getComputedStyle(cell).direction === 'rtl';
    const onKey = (e: KeyboardEvent) => {
      const grow = rtl() ? 'ArrowLeft' : 'ArrowRight', shrink = rtl() ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === grow) set(now() + STEP);
      else if (e.key === shrink) set(now() - STEP);
      else if (e.key === 'Home') set(live.current.min);
      else if (e.key === 'End') set(live.current.max);
      else if (e.key === 'Enter' || e.key === ' ') show();
      else return;
      e.preventDefault();
    };
    const p = panel.current;
    const isOpen = () => !!p && p.matches(':popover-open');
    const show = () => {
      if (!p || isOpen()) return;
      p.showPopover();
      const r = h.getBoundingClientRect(), b = p.getBoundingClientRect(), gap = 8;
      p.style.left = Math.round(Math.max(gap, Math.min(r.left + r.width / 2 - b.width / 2, innerWidth - b.width - gap))) + 'px';
      p.style.top = Math.round(r.bottom + b.height + gap <= innerHeight ? r.bottom + gap : Math.max(gap, r.top - b.height - gap)) + 'px';
      const first = p.querySelector<HTMLElement>('button:not(:disabled)');
      if (first) first.focus();
    };
    // Closed by Escape or a press outside: focus goes back to the handle, unless it went somewhere on purpose.
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState !== 'closed' || !p) return;
      const at = activeIn(h);
      if (!at || at === p.ownerDocument.body || p.contains(at)) h.focus({ preventScroll: true });
    };
    let moved = false, wasOpen = false;
    // A click opens it; the click that ends a drag, or that closed it a moment ago, doesn't.
    const onClick = () => { if (!moved && !wasOpen) show(); moved = false; wasOpen = false; };
    let from = 0, start = 0, id: number | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      from = e.clientX; start = now(); id = e.pointerId; moved = false; wasOpen = isOpen();
      try { h.setPointerCapture(id); } catch { /* a pointer that's already gone: the drag still follows moves over the handle */ }
      h.focus({ preventScroll: true });
    };
    const onMove = (e: PointerEvent) => {
      if (id !== e.pointerId) return;
      const d = rtl() ? from - e.clientX : e.clientX - from;
      if (Math.abs(d) > 2) moved = true;
      set(start + d);
    };
    const onUp = (e: PointerEvent) => { if (id !== e.pointerId) return; id = null; if (h.hasPointerCapture(e.pointerId)) h.releasePointerCapture(e.pointerId); };
    // Fit: the widest cell of the column on one line, measured with its text unwrapped for a moment.
    const onFit = () => {
      const table = cell.closest('table'), at = cell.cellIndex;
      if (!table || at < 0) return;
      let widest = 0;
      for (const row of Array.from(table.rows)) {
        const c = row.cells[at];
        if (!c || c.colSpan > 1 || row.hidden) continue;
        const was = c.style.whiteSpace, cs = getComputedStyle(c), range = document.createRange();
        c.style.whiteSpace = 'nowrap';
        range.selectNodeContents(c);
        if (p && p.parentNode === c) range.setEndBefore(p);   // the width popover is in the top layer, not the cell
        const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
        widest = Math.max(widest, Math.ceil(range.getBoundingClientRect().width + pad));
        c.style.whiteSpace = was;
      }
      if (widest) set(widest + 1);
    };
    act.current = { set, now, fit: onFit };
    if (p) p.addEventListener('toggle', onToggle);
    h.addEventListener('click', onClick);
    h.addEventListener('keydown', onKey);
    h.addEventListener('pointerdown', onDown);
    h.addEventListener('pointermove', onMove);
    h.addEventListener('pointerup', onUp);
    h.addEventListener('pointercancel', onUp);
    h.addEventListener('dblclick', onFit);
    return () => {
      h.removeEventListener('keydown', onKey);
      h.removeEventListener('pointerdown', onDown);
      h.removeEventListener('pointermove', onMove);
      h.removeEventListener('pointerup', onUp);
      h.removeEventListener('pointercancel', onUp);
      h.removeEventListener('dblclick', onFit);
      h.removeEventListener('click', onClick);
      if (p) p.removeEventListener('toggle', onToggle);
    };
  }, [resizable]);
  // The handle's name: the column's text, read once it's drawn. With no width set yet, its value is the drawn width.
  const [name, setName] = React.useState('');
  const [drawn, setDrawn] = React.useState<number | null>(null);
  const hint = domId('dk-th-hint', React.useId());
  // The header's text and drawn width can change with any child or the table's layout, and both are read from the
  // DOM; each sets state only when it differs, so it settles after one pass.
  // every render: what it reads isn't in props or state.
  useIsoLayoutEffect(() => {
    const cell = th.current;
    if (!resizable || !cell) return;
    const text = Array.from(cell.childNodes).filter((n) => !(n instanceof HTMLElement && (n.hidden || n.classList.contains('dk-table__resize') || n.classList.contains('dk-popover')))).map((n) => n.textContent || '').join('').trim();
    if (text !== name) setName(text);
    const w = current == null ? Math.round(cell.getBoundingClientRect().width) : null;
    if (w !== drawn) setDrawn(w);
  });
  const value = current != null ? current : drawn;
  const separator = resizable ? {
    role: 'separator', 'aria-orientation': 'vertical' as const, 'aria-label': labels.tableResizeColumn(name),
    'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': value != null ? value : undefined, tabIndex: 0,
    'aria-describedby': hint,   // that Enter opens the width buttons: a separator can't carry aria-haspopup
  } : null;
  const step = (by: number) => { const a = act.current; if (a) a.set(a.now() + by); };
  return (
    <th scope="col" {...rest} ref={setTh} style={style} aria-sort={sort && sort !== 'none' ? sort : undefined}
      className={cn('dk-table__cell dk-table__header', align !== 'start' && 'dk-table__cell--' + align, sort && 'dk-table__header--sortable', resizable && 'dk-table__header--resizable', props.className)}>
      {sort ? (
        <button type="button" ref={button} className="dk-table__sort" onClick={props.onSort}>
          <span>{props.children}</span>
          <Icon icon={NEXT_ICON[sort]} className={cn('dk-table__sort-icon', sort === 'none' && 'dk-table__sort-icon--idle')} />
        </button>
      ) : props.children}
      {separator ? <span {...separator} ref={handle} className="dk-table__resize" /> : null}
      {separator ? <span id={hint} hidden>{labels.tableResizeHint}</span> : null}
      {separator ? (
        <div ref={panel} {...{ popover: 'auto' }} role="dialog" aria-label={labels.tableResizeColumn(name)} tabIndex={-1} className="dk-popover dk-table-width">
          <Button variant="outline" size="sm" disabled={value != null && value <= min} onClick={() => step(-STEP)}>{labels.tableNarrower}</Button>
          <Button variant="outline" size="sm" disabled={value != null && value >= max} onClick={() => step(STEP)}>{labels.tableWider}</Button>
          <Button variant="outline" size="sm" onClick={() => { if (act.current) act.current.fit(); }}>{labels.tableFitColumn}</Button>
        </div>
      ) : null}
    </th>
  );
});

const PLAIN = { useGrouping: false } as const;
/** A data cell (<td>). align="end" for numbers. A number as its child is written in the locale's digits (ungrouped,
 *  as given: 1204 stays 1204 in en-US and is ١٢٠٤ in ar-EG); for grouping, currency or units, pass FormattedNumber. */
export const TableCell = /* @__PURE__ */ component<HTMLTableCellElement, TableCellProps>('TableCell', function TableCell(props, ref) {
  const rest = omit(props, { align: 1, className: 1, children: 1, link: 1 });
  const align = oneOf(ALIGN, props.align, 'start');
  const locale = useLocale();
  const row = React.useContext(RowLinkContext);
  const n = props.children;
  const content = typeof n === 'number' && Number.isFinite(n) ? displayNumber(n, locale, PLAIN) : n;
  return <td {...rest} ref={ref} className={cn('dk-table__cell', align !== 'start' && 'dk-table__cell--' + align, props.className)}>
    {row && props.link ? <a className="dk-table__row-link" href={row.href} target={row.target} rel={row.rel}>{content}</a> : content}
  </td>;
});

/* TableActionBar: the bar above a table with selectable rows. While rows are selected, it shows "3 selected", your
   actions and "Clear selection"; with none, it's hidden. It's a group named by the count, and a new count is read out
   politely. When it hides with focus in it (Clear, or an action that empties the selection), focus moves to the first
   checkbox of the table after it (the header's "Select all"), so it isn't lost: render it just before the Table. */
/** The bar of actions for a table's selected rows: "3 selected", your buttons, and "Clear selection". */
export const TableActionBar = /* @__PURE__ */ component<HTMLDivElement, TableActionBarProps>('TableActionBar', function TableActionBar(props, ref) {
  const labels = useSettings(words).labels, locale = useLocale();
  const rest = omit(props, { count: 1, onClear: 1, clearLabel: 1, className: 1, children: 1 });
  const count = Math.max(0, Math.floor(props.count) || 0);
  const self = React.useRef<HTMLDivElement | null>(null);
  const setRefs = useMergedRef(ref, (e: HTMLDivElement | null) => { self.current = e; });
  const id = domId('dk-tab', React.useId());
  const said = labels.tableSelected(count, new Intl.NumberFormat(locale).format(count));
  // Hidden (not removed) at 0, so focus is still in it here and can go to the table's "Select all" before it's lost.
  useIsoLayoutEffect(() => {
    const bar = self.current;
    if (count || !bar || !bar.contains(activeIn(bar))) return;   // its own root's focus, in a shadow root too (GR95)
    const box = bar.nextElementSibling && bar.nextElementSibling.querySelector<HTMLInputElement>('input[type="checkbox"]:not(:disabled)');
    if (box) box.focus();
  }, [count]);
  // From 0, not the mounted count: a bar rendered only while rows are selected ({n > 0 && <TableActionBar />}) says
  // its first count too (GR55).
  const was = React.useRef(0);
  React.useEffect(() => {
    if (count === was.current) return;
    was.current = count;
    if (count) announce(said);   // not 0: the hidden bar says nothing, and the checkbox that cleared it says its own state
  }, [count, said]);
  return (
    <div role="group" aria-labelledby={id} {...rest} ref={setRefs} hidden={!count || undefined} data-component="table-action-bar" className={cn('dk-table-action-bar', props.className)}>
      <span id={id} className="dk-table-action-bar__count">{said}</span>
      <div className="dk-table-action-bar__actions">{props.children}</div>
      {props.onClear ? <Button variant="ghost" size="sm" onClick={props.onClear}>{props.clearLabel || labels.clearSelection}</Button> : null}
    </div>
  );
});

export interface TableColumnOption {
  /** Your id for the column, passed back in onColumnsChange's details. */
  id: string;
  /** The column's name, as its header says it. */
  label: React.ReactNode;
  /** Shown now. */
  visible: boolean;
  /** Always shown, such as the column that names each row: its box is checked and can't be cleared. Default: false. */
  required?: boolean | undefined;
}

export interface TableColumnsMenuProps {
  /** Every column that can be shown, in the table's order. */
  columns: TableColumnOption[];
  /** Called when a column is checked or cleared, with the list as it now is (draw the table from it) and which
      column changed: { id, visible }. */
  onColumnsChange: (columns: TableColumnOption[], details: TableColumnsChangeDetails) => void;
  /** The button's text, and the panel's title. Default: "Columns" (labels.tableColumns). */
  label?: string | undefined;
}

/** onColumnsChange's details: the column that was checked or cleared, and whether it's shown now. */
export interface TableColumnsChangeDetails { id: string; visible: boolean }

/* TableColumnsMenu: a "Columns" button that opens a Popover of checkboxes, one per column, to show or hide them. The
   table is yours to draw from the same list. The last column shown can't be cleared, so the table is never empty. */
/** A "Columns" button with a checkbox for each of a table's columns, to show or hide them. */
export function TableColumnsMenu(props: TableColumnsMenuProps) {
  const labels = useSettings(words).labels;
  const label = props.label || labels.tableColumns;
  const shown = props.columns.filter((c) => c.visible).length;
  return (
    <Popover title={label} placement="bottom-end"
      trigger={<Button variant="outline" size="sm">{label}</Button>}>
      <div className="dk-table-columns">
        {props.columns.map((c) => (
          <Checkbox key={c.id} checked={c.visible || !!c.required} disabled={!!c.required || (c.visible && shown <= 1)}
            onChange={(e) => { const v = e.currentTarget.checked; props.onColumnsChange(props.columns.map((x) => (x.id === c.id ? { ...x, visible: v } : x)), { id: c.id, visible: v }); }}>{c.label}</Checkbox>
        ))}
      </div>
    </Popover>
  );
}

export interface TableExpandCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** The row's details are open. */
  expanded?: boolean | undefined;
  /** Called with the new state when the button is pressed. */
  onExpandedChange?: ((expanded: boolean) => void) | undefined;
  /** The row's name, for the button's: "Details, Order 1001" (labels.tableRowDetails). */
  label?: string | undefined;
  /** The id of the row's TableDetailRow, for aria-controls. */
  controls?: string | undefined;
  /** In the header row: a <th> named "Details" for screen readers, with nothing shown. Default: false. */
  header?: boolean | undefined;
}

/** A cell with a button that shows or hides its row's details (a TableDetailRow after it), or, with header, the heading of that column. */
export const TableExpandCell = /* @__PURE__ */ component<HTMLTableCellElement, TableExpandCellProps>('TableExpandCell', function TableExpandCell(props, ref) {
  const labels = useSettings(words).labels;
  const rest = omit(props, { expanded: 1, onExpandedChange: 1, label: 1, controls: 1, header: 1, className: 1, children: 1 });
  const cls = cn('dk-table__cell dk-table__expand', props.className);
  if (props.header) return <th scope="col" {...rest} ref={ref} className={cn(cls, 'dk-table__header')}><span className="dk-visually-hidden">{labels.tableDetails}</span></th>;
  const open = !!props.expanded;
  return (
    <td {...rest} ref={ref} className={cls}>
      <IconButton icon={<Icon icon={icons.ChevronRight} mirror />} label={props.label ? labels.tableRowDetails(props.label) : labels.tableDetails} variant="ghost" size="sm"
        className={cn('dk-table__expand-button', open && 'dk-table__expand-button--open')} aria-expanded={open} aria-controls={props.controls}
        onClick={() => { if (props.onExpandedChange) props.onExpandedChange(!open); }} />
    </td>
  );
});

export interface TableDetailRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Shown. Closed, the row stays in the page, hidden, so its id still answers the button's aria-controls. */
  open: boolean;
  /** How many columns it spans: all of the table's. */
  colSpan: number;
}

/** A full-width row under a TableRow with its details, shown while that row's TableExpandCell is expanded. */
export const TableDetailRow = /* @__PURE__ */ component<HTMLTableRowElement, TableDetailRowProps>('TableDetailRow', function TableDetailRow(props, ref) {
  const rest = omit(props, { open: 1, colSpan: 1, className: 1, children: 1 });
  return (
    <tr {...rest} ref={ref} hidden={!props.open} className={cn('dk-table__detail', props.className)}>
      <td colSpan={props.colSpan} className="dk-table__cell dk-table__detail-cell">{props.children}</td>
    </tr>
  );
});

export interface TableLoadingRowsProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** How many columns: all of the table's, so each row has a placeholder in every cell. */
  columns: number;
  /** How many placeholder rows: about as many as will load, up to a screenful. Default: 3. */
  rows?: number | undefined;
  /** Said once as the rows appear ("Loading projects"), after the loader's delay. Default: "Loading" (labels.loading). */
  label?: string | undefined;
}

/* TableLoadingRows: a <tbody> of placeholder rows, each cell a one-line skeleton in the table's own text size and
   padding, so the rows are as tall as the ones that replace them and nothing moves when they arrive. They're
   decorative: the label is said once, after the loader's delay, and the Table's busy marks it as loading. */
/** Placeholder rows (a <tbody> of skeletons) the height of real rows, while the table's rows load. Set the Table's busy too. */
export const TableLoadingRows = /* @__PURE__ */ component<HTMLTableSectionElement, TableLoadingRowsProps>('TableLoadingRows', function TableLoadingRows(props, ref) {
  const rest = omit(props, { columns: 1, rows: 1, label: 1, className: 1, children: 1 });
  const rows = Math.min(50, Math.max(1, Math.floor(Number(props.rows)) || 3));
  const columns = Math.min(100, Math.max(1, Math.floor(Number(props.columns)) || 1));
  const sds = useSettings(words);
  const waiting = !useSkeletonShown(props.label == null ? sds.labels.loading : props.label);
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const cells: React.ReactNode[] = [];
    for (let c = 0; c < columns; c++)
      cells.push(<td key={c} className="dk-table__cell"><SkeletonArt waiting={waiting} /></td>);
    out.push(<tr key={r} className="dk-table__loading-row">{cells}</tr>);
  }
  return <tbody {...rest} ref={ref} className={cn('dk-table__body dk-table__loading', props.className)}>{out}</tbody>;
});

export interface TableMessageRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** How many columns it spans: all of the table's. */
  colSpan: number;
}

/** One row across every column for a message in place of the rows: an EmptyState when there are none, or an Alert with Retry when they didn't load. */
export const TableMessageRow = /* @__PURE__ */ component<HTMLTableRowElement, TableMessageRowProps>('TableMessageRow', function TableMessageRow(props, ref) {
  const rest = omit(props, { colSpan: 1, className: 1, children: 1 });
  return (
    <tr {...rest} ref={ref} className={cn('dk-table__message', props.className)}>
      <td colSpan={props.colSpan} className="dk-table__cell dk-table__message-cell">{props.children}</td>
    </tr>
  );
});

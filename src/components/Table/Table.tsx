import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";
import { Icon } from "../Icon/Icon";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** 'md' (default): 12px cell padding. 'sm': 8px top and bottom, for dense data. */
  size?: 'sm' | 'md';
  /** Shades every other body row. Rows then don't change on hover. Default: false. */
  striped?: boolean;
  /** Keeps the header row in view while the table scrolls inside a container with a height. Default: false. */
  stickyHeader?: boolean;
  /** A title for the table, rendered as its <caption> (announced with it, and names the scroll area). */
  caption?: React.ReactNode;
  /** Hides the caption on screen; screen readers still announce it. Default: false. */
  captionHidden?: boolean;
  /** Props for the scrolling frame around the table (style with a maxHeight for stickyHeader). */
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Marks a row as selected: a shaded background, a primary bar at its start and aria-selected. */
  selected?: boolean;
}

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface TableHeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Lines the text up: 'start' (default), 'center' or 'end' (numbers). */
  align?: 'start' | 'center' | 'end';
  /** Makes the column sortable: the header becomes a button, and this is the current order. */
  sort?: SortDirection;
  /** Called when the sort button is pressed (decide the next order yourself). */
  onSort?: () => void;
}

export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Lines the text up: 'start' (default), 'center' or 'end' (numbers, which also get tabular digits). */
  align?: 'start' | 'center' | 'end';
}

const ALIGN = ["start", "center", "end"] as const;

/* Table: a native <table> in a frame that scrolls sideways when it's too wide (and then takes keyboard focus
   so it can be scrolled with the arrows). size, striped and stickyHeader style the rows; caption names it.
   className and every other prop go to the <table>; containerProps go to the frame. */
/** A data table: native table markup in a scrolling frame, with sizes, stripes, a sticky header and sortable columns. */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(props, ref) {
  const rest = omit(props, { size: 1, striped: 1, stickyHeader: 1, caption: 1, captionHidden: 1, containerProps: 1, className: 1, children: 1 });
  const size = oneOf(["sm", "md"] as const, props.size, "md");
  const frame = React.useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = React.useState(false);
  const cid = "dk-tc" + React.useId().replace(/:/g, "");
  React.useEffect(() => {
    const el = frame.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    check();
    return () => ro.disconnect();
  }, []);
  const cp = props.containerProps || {};
  const hasCaption = props.caption != null && props.caption !== false && props.caption !== "";
  const region = scrolls ? { tabIndex: 0, role: "region", "aria-labelledby": hasCaption ? cid : undefined, "aria-label": hasCaption ? undefined : (cp as any)["aria-label"] || "Table" } : {};
  return (
    <div {...cp} {...region} ref={frame} data-component="table" className={cn("dk-table", size === "sm" && "dk-table--sm", props.striped && "dk-table--striped", props.stickyHeader && "dk-table--sticky", cp.className)}>
      <table {...rest} ref={ref} className={cn("dk-table__table", props.className)}>
        {hasCaption ? <caption id={cid} className={cn("dk-table__caption", props.captionHidden && "dk-visually-hidden")}>{props.caption}</caption> : null}
        {props.children}
      </table>
    </div>
  );
});
Table.displayName = "Table";

/** The header rows (<thead>). */
export const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableHead(props, ref) {
  return <thead {...props} ref={ref} className={cn("dk-table__head", props.className)} />;
});
TableHead.displayName = "TableHead";

/** The body rows (<tbody>). */
export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableBody(props, ref) {
  return <tbody {...props} ref={ref} className={cn("dk-table__body", props.className)} />;
});
TableBody.displayName = "TableBody";

/** Footer rows such as totals (<tfoot>). */
export const TableFoot = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableFoot(props, ref) {
  return <tfoot {...props} ref={ref} className={cn("dk-table__foot", props.className)} />;
});
TableFoot.displayName = "TableFoot";

/** A row (<tr>). selected shades it and sets aria-selected. */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(props, ref) {
  const rest = omit(props, { selected: 1, className: 1 });
  return <tr {...rest} ref={ref} aria-selected={props.selected === undefined ? undefined : !!props.selected} className={cn("dk-table__row", props.selected && "dk-table__row--selected", props.className)} />;
});
TableRow.displayName = "TableRow";

const NEXT_ICON: Record<SortDirection, string> = { ascending: "arrow_upward", descending: "arrow_downward", none: "unfold_more" };

/** A header cell (<th>, scope="col" unless you say otherwise). With sort, its text is a button and aria-sort says the order. */
export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(function TableHeaderCell(props, ref) {
  const rest = omit(props, { align: 1, sort: 1, onSort: 1, className: 1, children: 1 });
  const align = oneOf(ALIGN, props.align, "start");
  const sort = props.sort !== undefined ? oneOf(["ascending", "descending", "none"] as const, props.sort, "none") : null;
  return (
    <th scope="col" {...rest} ref={ref} aria-sort={sort && sort !== "none" ? sort : undefined}
      className={cn("dk-table__cell dk-table__header", align !== "start" && "dk-table__cell--" + align, sort && "dk-table__header--sortable", props.className)}>
      {sort ? (
        <button type="button" className="dk-table__sort" onClick={props.onSort}>
          <span>{props.children}</span>
          <Icon name={NEXT_ICON[sort]} className={cn("dk-table__sort-icon", sort === "none" && "dk-table__sort-icon--idle")} />
        </button>
      ) : props.children}
    </th>
  );
});
TableHeaderCell.displayName = "TableHeaderCell";

/** A data cell (<td>). align="end" for numbers. */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(props, ref) {
  const rest = omit(props, { align: 1, className: 1 });
  const align = oneOf(ALIGN, props.align, "start");
  return <td {...rest} ref={ref} className={cn("dk-table__cell", align !== "start" && "dk-table__cell--" + align, props.className)} />;
});
TableCell.displayName = "TableCell";

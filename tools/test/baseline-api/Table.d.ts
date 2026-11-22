// exports: type SortDirection, Table, TableActionBar, type TableActionBarProps, TableBody, type TableBodyProps, TableCell, type TableCellProps, type TableColumnOption, type TableColumnsChangeDetails, TableColumnsMenu, type TableColumnsMenuProps, TableDetailRow, type TableDetailRowProps, TableExpandCell, type TableExpandCellProps, TableFoot, type TableFootProps, TableHead, TableHeaderCell, type TableHeaderCellProps, type TableHeadProps, TableLoadingRows, type TableLoadingRowsProps, TableMessageRow, type TableMessageRowProps, type TableProps, TableRow, type TableRowProps, TableSelectCell, type TableSelectCellProps, TableVirtualBody, type TableVirtualBodyProps
interface TableLabels {
    table: string;
    tableSorted: (column: string, direction: "ascending" | "descending") => string;
    tableSelected: (count: number, formatted: string) => string;
    clearSelection: string;
    tableSelectAll: (count: number, formatted: string) => string;
    tableAllSelected: (count: number, formatted: string) => string;
    tableResizeColumn: (column: string) => string;
    tableNarrower: string;
    tableWider: string;
    tableFitColumn: string;
    tableResizeHint: string;
    tableColumns: string;
    tableDetails: string;
    tableRowDetails: (row: string) => string;
}
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    size?: "md" | "sm" | undefined;
    striped?: boolean | undefined;
    layout?: "auto" | "fixed" | undefined;
    stickyHeader?: boolean | undefined;
    caption?: React.ReactNode | undefined;
    hideCaption?: boolean | undefined;
    containerProps?: React.HTMLAttributes<HTMLDivElement> | undefined;
    pinStart?: boolean | undefined;
    pinEnd?: boolean | undefined;
    loading?: boolean | undefined;
}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    selected?: boolean | undefined;
    href?: string | undefined;
    target?: string | undefined;
    rel?: string | undefined;
}
interface TableSelectCellProps extends Omit<CheckboxProps, "children" | "description" | "size" | "variant"> {
    label: string;
    inHeader?: boolean | undefined;
    cellProps?: React.TdHTMLAttributes<HTMLTableCellElement> | undefined;
}
type SortDirection = "ascending" | "descending" | "none";
interface TableHeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: "center" | "end" | "start" | undefined;
    sort?: SortDirection | undefined;
    onSort?: (() => void) | undefined;
    width?: number | string | undefined;
    resizable?: boolean | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    onWidthChange?: ((width: number) => void) | undefined;
}
interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: "center" | "end" | "start" | undefined;
    link?: boolean | undefined;
}
interface TableActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
    count: number;
    onClear?: (() => void) | undefined;
    clearLabel?: string | undefined;
    total?: number | undefined;
    onSelectAll?: (() => void) | undefined;
    sticky?: boolean | undefined;
    children?: React.ReactNode | undefined;
}
declare const Table: React.FC<TableProps & React.RefAttributes<HTMLTableElement>>;
type TableHeadProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TableFootProps = React.HTMLAttributes<HTMLTableSectionElement>;
declare const TableHead: React.FC<TableHeadProps & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableBody: React.FC<TableBodyProps & React.RefAttributes<HTMLTableSectionElement>>;
interface TableVirtualBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    children?: never | undefined;
    count: number;
    renderRow: (index: number) => React.ReactElement;
    itemKey?: ((index: number) => React.Key) | undefined;
    estimatedRowHeight?: number | undefined;
    overscan?: number | undefined;
}
declare const TableVirtualBody: React.FC<TableVirtualBodyProps & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableFoot: React.FC<TableFootProps & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableRow: React.FC<TableRowProps & React.RefAttributes<HTMLTableRowElement>>;
declare const TableSelectCell: React.FC<TableSelectCellProps & React.RefAttributes<HTMLInputElement>>;
declare const TableHeaderCell: React.FC<TableHeaderCellProps & React.RefAttributes<HTMLTableCellElement>>;
declare const TableCell: React.FC<TableCellProps & React.RefAttributes<HTMLTableCellElement>>;
declare const TableActionBar: React.FC<TableActionBarProps & React.RefAttributes<HTMLDivElement>>;
interface TableColumnOption {
    id: string;
    label: React.ReactNode;
    visible: boolean;
    required?: boolean | undefined;
}
interface TableColumnsMenuProps extends React.HTMLAttributes<HTMLButtonElement> {
    columns: TableColumnOption[];
    onColumnsChange: (columns: TableColumnOption[], details: TableColumnsChangeDetails) => void;
    label?: string | undefined;
}
interface TableColumnsChangeDetails {
    id: string;
    visible: boolean;
}
declare const TableColumnsMenu: React.FC<TableColumnsMenuProps & React.RefAttributes<HTMLButtonElement>>;
interface TableExpandCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    expanded?: boolean | undefined;
    onExpandedChange?: ((expanded: boolean) => void) | undefined;
    label?: string | undefined;
    controls?: string | undefined;
    inHeader?: boolean | undefined;
}
declare const TableExpandCell: React.FC<TableExpandCellProps & React.RefAttributes<HTMLTableCellElement>>;
interface TableDetailRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    open: boolean;
    colSpan: number;
}
declare const TableDetailRow: React.FC<TableDetailRowProps & React.RefAttributes<HTMLTableRowElement>>;
interface TableLoadingRowsProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    columns: number;
    rows?: number | undefined;
    label?: string | undefined;
}
declare const TableLoadingRows: React.FC<TableLoadingRowsProps & React.RefAttributes<HTMLTableSectionElement>>;
interface TableMessageRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    colSpan: number;
}
declare const TableMessageRow: React.FC<TableMessageRowProps & React.RefAttributes<HTMLTableRowElement>>;

// exports: DataGrid, type DataGridCellChange, type DataGridColumn, type DataGridProps, type DataGridRow, type DataGridRowsChangeDetails
interface DataGridLabels {
    dataGridEdit: (column: string) => string;
    dataGridCopied: (count: number) => string;
    dataGridPasted: (count: number) => string;
    dataGridHint: string;
}
type DataGridRow = Record<string, unknown>;
interface DataGridColumn<R extends object = DataGridRow> {
    key: Extract<keyof R, string>;
    header: string;
    editable?: boolean | undefined;
    align?: "center" | "end" | "start" | undefined;
    width?: number | string | undefined;
    format?: ((row: R) => string) | undefined;
}
interface DataGridCellChange {
    rowId: string;
    column: string;
    value: string;
}
interface DataGridRowsChangeDetails {
    changes: DataGridCellChange[];
}
interface DataGridProps<R extends object = DataGridRow> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "rows"> {
    columns: DataGridColumn<R>[];
    rows: R[];
    rowKey?: Extract<keyof R, string> | undefined;
    onRowsChange?: ((rows: R[], details: DataGridRowsChangeDetails) => void) | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    busy?: boolean | undefined;
    loadingRows?: number | undefined;
    loadingLabel?: string | undefined;
    message?: React.ReactNode;
}
declare const DataGrid: <R extends object = DataGridRow>(props: DataGridProps<R> & {
    ref?: React.Ref<HTMLTableElement> | undefined;
}) => React.ReactElement;

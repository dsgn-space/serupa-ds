// exports: DataGrid, type DataGridCellChange, type DataGridColumn, type DataGridProps, type DataGridRow, type DataGridRowsChangeDetails
interface DataGridLabels {
    dataGridEdit: (column: string) => string;
    dataGridCopied: (count: number) => string;
    dataGridPasted: (count: number) => string;
    dataGridHint: string;
}
type DataGridRow = Record<string, unknown>;
interface DataGridColumn {
    key: string;
    header: string;
    editable?: boolean | undefined;
    align?: "center" | "end" | "start" | undefined;
    width?: number | string | undefined;
    format?: ((row: DataGridRow) => string) | undefined;
}
interface DataGridCellChange {
    rowId: string;
    column: string;
    value: string;
}
interface DataGridRowsChangeDetails {
    changes: DataGridCellChange[];
}
interface DataGridProps extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "rows"> {
    columns: DataGridColumn[];
    rows: DataGridRow[];
    rowKey?: string | undefined;
    onRowsChange?: ((rows: DataGridRow[], details: DataGridRowsChangeDetails) => void) | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    busy?: boolean | undefined;
    loadingRows?: number | undefined;
    loadingLabel?: string | undefined;
    message?: React.ReactNode;
}
declare const DataGrid: React.ForwardRefExoticComponent<DataGridProps & React.RefAttributes<HTMLTableElement>>;

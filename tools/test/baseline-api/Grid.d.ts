// exports: Grid, type GridColumns, type GridProps
interface GridProps extends React.HTMLAttributes<HTMLElement> {
    columns?: "auto" | GridColumns | number | undefined;
    minColumnWidth?: string | undefined;
    fill?: boolean | undefined;
    gap?: ByWidth<Space> | Space | undefined;
    as?: "div" | "ol" | "section" | "ul" | undefined;
}
interface GridColumns {
    base?: number | undefined;
    sm?: number | undefined;
    md?: number | undefined;
    lg?: number | undefined;
}
declare const Grid: React.FC<GridProps & React.RefAttributes<HTMLElement>>;

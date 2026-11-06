// exports: Grid, type GridProps
interface GridProps extends React.HTMLAttributes<HTMLElement> {
    columns?: "auto" | number | undefined;
    minColumnWidth?: string | undefined;
    fill?: boolean | undefined;
    gap?: Space | undefined;
    as?: "div" | "ol" | "section" | "ul" | undefined;
}
declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLElement>>;

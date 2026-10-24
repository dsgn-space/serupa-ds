// exports: Grid, type GridProps
interface GridProps extends React.HTMLAttributes<HTMLElement> {
    columns?: "auto" | number;
    minColumnWidth?: string;
    gap?: Space;
    as?: "div" | "ol" | "section" | "ul";
}
declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLElement>>;

// exports: Toolbar, type ToolbarProps
interface ToolbarLabels {
    toolbarMore: string;
}
interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical" | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    "aria-label"?: string | undefined;
    overflow?: boolean | undefined;
    moreLabel?: string | undefined;
    children?: React.ReactNode | undefined;
}
declare const Toolbar: React.FC<ToolbarProps & React.RefAttributes<HTMLDivElement>>;

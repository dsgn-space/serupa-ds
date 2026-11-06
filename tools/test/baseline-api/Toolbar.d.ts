// exports: Toolbar, type ToolbarProps
interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical" | undefined;
    "aria-label"?: string | undefined;
    children?: React.ReactNode | undefined;
}
declare const Toolbar: React.ForwardRefExoticComponent<ToolbarProps & React.RefAttributes<HTMLDivElement>>;

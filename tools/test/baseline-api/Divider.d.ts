// exports: Divider, type DividerProps
interface DividerProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    orientation?: "horizontal" | "vertical" | undefined;
    label?: React.ReactNode | undefined;
    decorative?: boolean | undefined;
    surface?: "dark" | "light" | undefined;
}
declare const Divider: React.FC<DividerProps & React.RefAttributes<HTMLElement>>;

// exports: Divider, type DividerProps
interface DividerProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    orientation?: "horizontal" | "vertical" | undefined;
    label?: React.ReactNode | undefined;
    decorative?: boolean | undefined;
}
declare const Divider: React.ForwardRefExoticComponent<DividerProps & React.RefAttributes<HTMLElement>>;

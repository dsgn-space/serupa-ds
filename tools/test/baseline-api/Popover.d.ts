// exports: Popover, type PopoverProps
interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role" | "title"> {
    trigger: React.ReactElement;
    children: ((close: () => void) => React.ReactNode) | React.ReactNode;
    title?: React.ReactNode | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
    placement?: Placement | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    "aria-label"?: string | undefined;
    sheet?: "mobile" | boolean | undefined;
    initialFocus?: "first" | "panel" | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}
declare const Popover: React.ForwardRefExoticComponent<PopoverProps & React.RefAttributes<HTMLDivElement>>;

// exports: HoverCard, type HoverCardProps
interface HoverCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "content"> {
    trigger: React.ReactElement;
    children: React.ReactNode;
    placement?: Placement | undefined;
    openDelay?: number | undefined;
    closeDelay?: number | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    disabled?: boolean | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}
declare const HoverCard: React.ForwardRefExoticComponent<HoverCardProps & React.RefAttributes<HTMLDivElement>>;

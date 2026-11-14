// exports: Tooltip, type TooltipProps
interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
    placement?: Placement | undefined;
    openDelay?: number | undefined;
    role?: "description" | "label" | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    disabled?: boolean | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}
declare const Tooltip: ((props: TooltipProps) => React.ReactElement) & {
    displayName: string;
};

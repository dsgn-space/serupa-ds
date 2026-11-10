// exports: ContextualHelp, type ContextualHelpProps
interface ContextualHelpLabels {
    contextualHelp: string;
    contextualInfo: string;
}
interface ContextualHelpProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role" | "title"> {
    children: React.ReactNode;
    title?: React.ReactNode | undefined;
    headingLevel?: PopoverProps["headingLevel"];
    variant?: "help" | "info" | undefined;
    label?: string | undefined;
    placement?: PopoverProps["placement"];
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}
declare const ContextualHelp: React.ForwardRefExoticComponent<ContextualHelpProps & React.RefAttributes<HTMLDivElement>>;

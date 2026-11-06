// exports: Drawer, type DrawerProps
interface DrawerProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "title"> {
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    side?: "bottom" | "left" | "right" | "top" | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    title?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    footer?: React.ReactNode | undefined;
    closeButton?: boolean | undefined;
    closeLabel?: string | undefined;
    closeOnBackdrop?: boolean | undefined;
    modal?: boolean | undefined;
    swipeToClose?: boolean | undefined;
    initialFocus?: React.RefObject<HTMLElement | null> | undefined;
    finalFocus?: React.RefObject<HTMLElement | null> | undefined;
    unsaved?: boolean | undefined;
}
declare const Drawer: React.ForwardRefExoticComponent<DrawerProps & React.RefAttributes<HTMLDialogElement>>;

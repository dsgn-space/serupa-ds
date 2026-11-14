// exports: Drawer, type DrawerPlacement, type DrawerProps
interface DrawerLabels {
    drawerExpand: string;
    drawerCollapse: string;
}
type DrawerPlacement = "bottom" | "end" | "left" | "right" | "start" | "top";
interface DrawerProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "title"> {
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    placement?: DrawerPlacement | undefined;
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
    snapPoints?: readonly number[] | undefined;
    snap?: number | undefined;
    defaultSnap?: number | undefined;
    onSnapChange?: ((snap: number) => void) | undefined;
}
declare const Drawer: React.ForwardRefExoticComponent<DrawerProps & React.RefAttributes<HTMLDialogElement>>;

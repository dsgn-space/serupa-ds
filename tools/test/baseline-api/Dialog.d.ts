// exports: Dialog, type DialogProps, useUnsavedChanges
interface DialogLabels {
    discardTitle: string;
    discardDescription: string;
    discard: string;
    keepEditing: string;
}
interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "title"> {
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    title?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    footer?: React.ReactNode | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    alert?: boolean | undefined;
    closeButton?: boolean | undefined;
    closeLabel?: string | undefined;
    closeOnBackdrop?: boolean | undefined;
    fullScreen?: "mobile" | boolean | undefined;
    initialFocus?: React.RefObject<HTMLElement | null> | undefined;
    finalFocus?: React.RefObject<HTMLElement | null> | undefined;
    unsaved?: boolean | undefined;
}
declare const Dialog: React.ForwardRefExoticComponent<DialogProps & React.RefAttributes<HTMLDialogElement>>;
declare function useUnsavedChanges(unsaved: boolean): {
    confirm: () => Promise<boolean>;
    dialog: null | React.ReactElement;
};

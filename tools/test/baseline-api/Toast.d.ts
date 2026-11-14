// exports: toast, Toaster, type ToasterPosition, type ToasterProps, type ToastMessage, type ToastOptions, type ToastPromiseMessages, type ToastTone, type ToastUndoOptions
interface ToastLabels {
    notifications: string;
    toastShortcut: (key: string) => string;
    moreToasts: (count: number, formatted: string) => string;
    toastRepeated: (count: number, formatted: string) => string;
    undo: string;
}
type ToastTone = "danger" | "info" | "neutral" | "success" | "warning";
type ToasterPosition = "bottom-center" | "bottom-end" | "bottom-start" | "top-center" | "top-end" | "top-start";
interface ToastOptions {
    title: React.ReactNode;
    description?: React.ReactNode | undefined;
    tone?: ToastTone | undefined;
    action?: ({
        label: string;
        onClick: () => void;
    }) | undefined;
    duration?: number | undefined;
    autoDismiss?: boolean | undefined;
    announcement?: string | undefined;
    id?: string | undefined;
}
declare function show(options: string | ToastOptions): string;
declare function dismiss(id?: string): void;
type ToastMessage<A> = ((arg: A) => string | ToastOptions) | string | ToastOptions;
interface ToastPromiseMessages<T> {
    loading: string | ToastOptions;
    success: ToastMessage<T>;
    error: ToastMessage<unknown>;
}
declare function promise<T>(work: (() => Promise<T>) | Promise<T>, messages: ToastPromiseMessages<T>): Promise<T>;
interface ToastUndoOptions extends Omit<ToastOptions, "action"> {
    commit: () => void;
    onUndo?: (() => void) | undefined;
    undoLabel?: string | undefined;
}
declare function undo(options: ToastUndoOptions): string;
declare const toast: typeof show & {
    dismiss: typeof dismiss;
    promise: typeof promise;
    undo: typeof undo;
};
interface ToasterProps extends React.HTMLAttributes<HTMLElement> {
    placement?: ToasterPosition | undefined;
    label?: string | undefined;
    dismissLabel?: string | undefined;
    limit?: number | undefined;
    duration?: number | undefined;
    autoDismiss?: boolean | undefined;
}
declare const Toaster: ((props: ToasterProps) => React.ReactElement) & {
    displayName: string;
};

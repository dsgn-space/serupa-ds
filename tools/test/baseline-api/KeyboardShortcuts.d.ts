// exports: KeyboardShortcuts, type KeyboardShortcutsProps, type Shortcut, type ShortcutOptions, useShortcut
interface KeyboardShortcutsLabels {
    keyboardShortcuts: string;
    generalShortcuts: string;
    showShortcuts: string;
}
interface Shortcut {
    keys: string[];
    description: string;
    group?: string | undefined;
}
interface ShortcutOptions {
    description?: string | undefined;
    group?: string | undefined;
    enabled?: boolean | undefined;
    inInputs?: boolean | undefined;
}
interface KeyboardShortcutsProps extends Omit<DialogProps, "alert" | "children" | "closeButton" | "closeLabel" | "closeOnBackdrop" | "description" | "finalFocus" | "footer" | "fullScreen" | "initialFocus" | "size" | "title" | "unsaved"> {
    title?: React.ReactNode | undefined;
    shortcuts?: Shortcut[] | undefined;
    helpKeys?: false | string[] | undefined;
}
declare function useShortcut(keys: string | string[], handler: (event: KeyboardEvent) => void, options?: ShortcutOptions): void;
declare const KeyboardShortcuts: React.ForwardRefExoticComponent<KeyboardShortcutsProps & React.RefAttributes<HTMLDialogElement>>;

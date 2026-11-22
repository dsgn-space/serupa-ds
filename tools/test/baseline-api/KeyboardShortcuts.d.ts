// exports: KeyboardShortcuts, type KeyboardShortcutsProps, type Shortcut
interface KeyboardShortcutsLabels {
    keyboardShortcuts: string;
    generalShortcuts: string;
    showShortcuts: string;
    singleKeyShortcuts: string;
    singleKeyHint: string;
}
interface Shortcut {
    keys: string[];
    description: string;
    group?: string | undefined;
}
interface KeyboardShortcutsProps extends Omit<DialogProps, "alert" | "children" | "closeButton" | "closeLabel" | "closeOnBackdrop" | "description" | "finalFocus" | "footer" | "fullScreen" | "initialFocus" | "size" | "title" | "unsaved"> {
    title?: React.ReactNode | undefined;
    shortcuts?: Shortcut[] | undefined;
    helpKeys?: false | string[] | undefined;
}
declare const KeyboardShortcuts: React.FC<KeyboardShortcutsProps & React.RefAttributes<HTMLDialogElement>>;

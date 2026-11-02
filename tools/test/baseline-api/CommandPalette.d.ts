// exports: type Command, CommandPalette, type CommandPaletteProps
interface CommandPaletteLabels {
    commandPalette: string;
    searchCommands: string;
    noCommands: string;
    commandsCount: (count: number) => string;
    otherCommands: string;
}
interface Command {
    id: string;
    label: string;
    group?: string | undefined;
    keywords?: string[] | undefined;
    icon?: IconData | React.ReactNode | undefined;
    shortcut?: string[] | undefined;
    href?: string | undefined;
    disabled?: boolean | undefined;
    onSelect?: (() => void) | undefined;
}
interface CommandPaletteProps extends Omit<DialogProps, "alert" | "children" | "closeButton" | "closeLabel" | "description" | "footer" | "fullScreen" | "initialFocus" | "onSelect" | "size" | "title" | "unsaved"> {
    commands: Command[];
    onSelect?: ((command: Command) => void) | undefined;
    hotkey?: false | string[] | undefined;
    placeholder?: string | undefined;
    emptyText?: React.ReactNode | undefined;
    limit?: number | undefined;
}
declare const CommandPalette: React.ForwardRefExoticComponent<CommandPaletteProps & React.RefAttributes<HTMLDialogElement>>;

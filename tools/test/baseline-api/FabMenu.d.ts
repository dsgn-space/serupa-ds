// exports: FabMenu, type FabMenuAction, type FabMenuProps
interface FabMenuAction {
    label: string;
    icon?: IconSource | undefined;
    onSelect: () => void;
    disabled?: boolean | undefined;
    destructive?: boolean | undefined;
}
interface FabMenuProps extends Omit<FabProps, "onClick"> {
    actions: readonly FabMenuAction[];
    open?: boolean | undefined;
    onOpenChange?: ((open: boolean) => void) | undefined;
}
declare const FabMenu: React.ForwardRefExoticComponent<FabMenuProps & React.RefAttributes<HTMLButtonElement>>;

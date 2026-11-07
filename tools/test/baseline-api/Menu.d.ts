// exports: ContextMenu, type ContextMenuProps, Menu, MenuCheckboxItem, type MenuCheckboxItemProps, MenuGroup, type MenuGroupProps, MenuItem, type MenuItemOwnProps, type MenuItemProps, type MenuProps, MenuRadioGroup, type MenuRadioGroupProps, MenuRadioItem, type MenuRadioItemProps, MenuSeparator, type MenuSeparatorProps, MenuSub, type MenuSubProps
interface MenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role"> {
    trigger: React.ReactElement;
    children: React.ReactNode;
    placement?: Placement | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    "aria-label"?: string | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}
declare const Menu: React.ForwardRefExoticComponent<MenuProps & React.RefAttributes<HTMLDivElement>>;
interface ContextMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role"> {
    target: React.ReactElement;
    children: React.ReactNode;
    "aria-label": string;
    open?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    disabled?: boolean | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}
declare const ContextMenu: React.ForwardRefExoticComponent<ContextMenuProps & React.RefAttributes<HTMLDivElement>>;
interface MenuItemOwnProps {
    onSelect?: ((event: React.SyntheticEvent) => void) | undefined;
    icon?: IconSource | undefined;
    shortcut?: string | undefined;
    destructive?: boolean | undefined;
    disabled?: boolean | undefined;
}
interface MenuItemBaseProps extends MenuItemOwnProps, Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
    href?: string | undefined;
    as?: React.ElementType | undefined;
    target?: string | undefined;
    rel?: string | undefined;
}
declare const MenuItem: {
    <C extends React.ElementType = "a">(props: MenuItemProps<C> & {
        ref?: React.Ref<HTMLElement>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};
type MenuItemProps<C extends React.ElementType = "a"> = MenuItemOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof MenuItemOwnProps>;
type CheckableProps = Omit<MenuItemBaseProps, "aria-checked" | "as" | "destructive" | "href" | "rel" | "role" | "target">;
interface MenuCheckboxItemProps extends CheckableProps {
    checked: boolean;
    onCheckedChange?: ((checked: boolean) => void) | undefined;
}
declare const MenuCheckboxItem: React.ForwardRefExoticComponent<MenuCheckboxItemProps & React.RefAttributes<HTMLElement>>;
interface MenuRadioGroupProps extends Omit<MenuGroupProps, "defaultValue" | "onChange"> {
    value: string | undefined;
    onValueChange?: ((value: string) => void) | undefined;
}
declare const MenuRadioGroup: React.ForwardRefExoticComponent<MenuRadioGroupProps & React.RefAttributes<HTMLDivElement>>;
interface MenuRadioItemProps extends CheckableProps {
    value: string;
}
declare const MenuRadioItem: React.ForwardRefExoticComponent<MenuRadioItemProps & React.RefAttributes<HTMLElement>>;
interface MenuSubProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    label: React.ReactNode;
    children: React.ReactNode;
    icon?: IconSource | undefined;
    disabled?: boolean | undefined;
}
declare const MenuSub: React.ForwardRefExoticComponent<MenuSubProps & React.RefAttributes<HTMLElement>>;
interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: React.ReactNode | undefined;
}
declare const MenuGroup: React.ForwardRefExoticComponent<MenuGroupProps & React.RefAttributes<HTMLDivElement>>;
type MenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;
declare const MenuSeparator: React.ForwardRefExoticComponent<MenuSeparatorProps & React.RefAttributes<HTMLDivElement>>;

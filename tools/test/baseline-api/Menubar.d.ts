// exports: Menubar, MenubarMenu, type MenubarMenuProps, type MenubarProps
interface MenubarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
    "aria-label"?: string | undefined;
    children?: React.ReactNode;
}
interface MenubarMenuProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "children" | "role"> {
    label: React.ReactNode;
    children?: React.ReactNode;
    disabled?: boolean | undefined;
    defaultOpen?: boolean | undefined;
}
declare const Menubar: React.FC<MenubarProps & React.RefAttributes<HTMLDivElement>>;
declare const MenubarMenu: React.FC<MenubarMenuProps & React.RefAttributes<HTMLButtonElement>>;

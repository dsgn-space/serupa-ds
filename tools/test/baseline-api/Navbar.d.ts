// exports: Navbar, NavbarLink, type NavbarLinkOwnProps, type NavbarLinkProps, NavbarMenu, NavbarMenuGroup, type NavbarMenuGroupProps, NavbarMenuLink, type NavbarMenuLinkOwnProps, type NavbarMenuLinkProps, type NavbarMenuProps, type NavbarProps
interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    brand?: React.ReactNode | undefined;
    children?: React.ReactNode | undefined;
    actions?: React.ReactNode | undefined;
    sticky?: boolean | undefined;
    size?: ContainerSize | undefined;
    "aria-label"?: string | undefined;
    menuLabel?: string | undefined;
}
interface NavbarLinkOwnProps {
    active?: boolean | undefined;
}
type NavbarLinkProps<C extends React.ElementType = "a"> = NavbarLinkOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof NavbarLinkOwnProps>;
interface NavbarMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    label: React.ReactNode;
    children?: React.ReactNode | undefined;
    active?: boolean | undefined;
}
interface NavbarMenuGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title: React.ReactNode;
    children?: React.ReactNode | undefined;
}
interface NavbarMenuLinkOwnProps {
    active?: boolean | undefined;
    description?: React.ReactNode | undefined;
}
type NavbarMenuLinkProps<C extends React.ElementType = "a"> = NavbarMenuLinkOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof NavbarMenuLinkOwnProps>;
declare const Navbar: React.ForwardRefExoticComponent<NavbarProps & React.RefAttributes<HTMLElement>>;
declare const NavbarLink: {
    <C extends React.ElementType = "a">(props: NavbarLinkProps<C> & {
        ref?: React.Ref<React.ComponentRef<C>>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};
declare const NavbarMenu: React.ForwardRefExoticComponent<NavbarMenuProps & React.RefAttributes<HTMLDivElement>>;
declare const NavbarMenuGroup: React.ForwardRefExoticComponent<NavbarMenuGroupProps & React.RefAttributes<HTMLDivElement>>;
declare const NavbarMenuLink: {
    <C extends React.ElementType = "a">(props: NavbarMenuLinkProps<C> & {
        ref?: React.Ref<React.ComponentRef<C>>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};

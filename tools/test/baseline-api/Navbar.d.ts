// exports: Navbar, NavbarLink, type NavbarLinkOwnProps, type NavbarLinkProps, type NavbarProps
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
declare const Navbar: React.ForwardRefExoticComponent<NavbarProps & React.RefAttributes<HTMLElement>>;
declare const NavbarLink: {
    <C extends React.ElementType = "a">(props: NavbarLinkProps<C> & {
        ref?: React.Ref<React.ComponentRef<C>>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};

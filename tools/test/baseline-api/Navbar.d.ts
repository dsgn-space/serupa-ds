// exports: Navbar, NavbarLink, type NavbarLinkProps, type NavbarProps
interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    brand?: React.ReactNode;
    children?: React.ReactNode;
    actions?: React.ReactNode;
    sticky?: boolean;
    size?: ContainerSize;
    "aria-label"?: string;
    menuLabel?: string;
}
interface NavbarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
    as?: React.ElementType;
}
declare const Navbar: React.ForwardRefExoticComponent<NavbarProps & React.RefAttributes<HTMLElement>>;
declare const NavbarLink: React.ForwardRefExoticComponent<NavbarLinkProps & React.RefAttributes<HTMLAnchorElement>>;

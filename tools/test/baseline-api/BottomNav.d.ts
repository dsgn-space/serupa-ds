// exports: BottomNav, BottomNavLink, type BottomNavLinkOwnProps, type BottomNavLinkProps, type BottomNavProps
interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
    label: string;
    hideFrom?: "lg" | "md" | "sm" | false | undefined;
    children?: React.ReactNode;
}
declare const BottomNav: React.FC<BottomNavProps & React.RefAttributes<HTMLElement>>;
interface BottomNavLinkOwnProps {
    icon: IconSource;
    current?: boolean | undefined;
    children: React.ReactNode;
    badge?: React.ReactNode | undefined;
}
type BottomNavLinkProps<C extends React.ElementType = "a"> = BottomNavLinkOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof BottomNavLinkOwnProps>;
declare const BottomNavLink: {
    <C extends React.ElementType = "a">(props: BottomNavLinkProps<C> & React.RefAttributes<React.ComponentRef<C>>): null | React.ReactElement;
    displayName?: string | undefined;
};

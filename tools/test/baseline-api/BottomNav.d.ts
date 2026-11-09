// exports: BottomNav, BottomNavLink, type BottomNavLinkOwnProps, type BottomNavLinkProps, type BottomNavProps
interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
    label: string;
    hideFrom?: "lg" | "md" | "sm" | false | undefined;
    children?: React.ReactNode;
}
declare const BottomNav: React.ForwardRefExoticComponent<BottomNavProps & React.RefAttributes<HTMLElement>>;
interface BottomNavLinkOwnProps {
    icon: IconSource;
    active?: boolean | undefined;
    children: React.ReactNode;
}
type BottomNavLinkProps<C extends React.ElementType = "a"> = BottomNavLinkOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof BottomNavLinkOwnProps>;
declare const BottomNavLink: {
    <C extends React.ElementType = "a">(props: BottomNavLinkProps<C> & {
        ref?: React.Ref<React.ComponentRef<C>>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};

// exports: TabNav, TabNavLink, type TabNavLinkOwnProps, type TabNavLinkProps, type TabNavProps
interface TabNavProps extends React.HTMLAttributes<HTMLElement> {
    variant?: TabsVariant | undefined;
    size?: "lg" | "md" | "sm" | undefined;
}
declare const TabNav: React.ForwardRefExoticComponent<TabNavProps & React.RefAttributes<HTMLElement>>;
interface TabNavLinkOwnProps {
    current?: boolean | undefined;
    icon?: IconSource | undefined;
}
type TabNavLinkProps<C extends React.ElementType = "a"> = TabNavLinkOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof TabNavLinkOwnProps>;
declare const TabNavLink: {
    <C extends React.ElementType = "a">(props: TabNavLinkProps<C> & {
        ref?: React.Ref<React.ComponentRef<C>>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};

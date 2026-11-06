// exports: Sidebar, SidebarItem, type SidebarItemOwnProps, type SidebarItemProps, type SidebarProps, SidebarSection, type SidebarSectionProps
interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode | undefined;
    header?: React.ReactNode | undefined;
    footer?: React.ReactNode | undefined;
    collapsed?: boolean | undefined;
    "aria-label"?: string | undefined;
}
interface SidebarSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title?: React.ReactNode | undefined;
    children?: React.ReactNode | undefined;
}
interface SidebarItemOwnProps {
    label: React.ReactNode;
    icon?: IconSource | undefined;
    active?: boolean | undefined;
    badge?: React.ReactNode | undefined;
    children?: React.ReactNode | undefined;
    defaultOpen?: boolean | undefined;
    open?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}
type SidebarItemProps<C extends React.ElementType = "a"> = SidebarItemOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof SidebarItemOwnProps>;
declare const Sidebar: React.ForwardRefExoticComponent<SidebarProps & React.RefAttributes<HTMLElement>>;
declare const SidebarSection: React.ForwardRefExoticComponent<SidebarSectionProps & React.RefAttributes<HTMLDivElement>>;
declare const SidebarItem: {
    <C extends React.ElementType = "a">(props: SidebarItemProps<C> & {
        ref?: React.Ref<HTMLElement>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};

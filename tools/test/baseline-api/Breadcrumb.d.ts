// exports: Breadcrumb, BreadcrumbItem, type BreadcrumbItemOwnProps, type BreadcrumbItemProps, type BreadcrumbProps
interface BreadcrumbLabels {
    breadcrumb: string;
    showHiddenPages: string;
    morePages: string;
}
interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode | undefined;
    separator?: "chevron" | "slash" | undefined;
    maxItems?: number | undefined;
    collapse?: "inline" | "menu" | undefined;
    "aria-label"?: string | undefined;
    expandLabel?: string | undefined;
}
interface BreadcrumbItemOwnProps {
    href?: string | undefined;
    icon?: IconSource | undefined;
    current?: boolean | undefined;
}
type BreadcrumbItemProps<C extends React.ElementType = "a"> = BreadcrumbItemOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof BreadcrumbItemOwnProps>;
declare const BreadcrumbItem: {
    <C extends React.ElementType = "a">(props: BreadcrumbItemProps<C> & {
        ref?: React.Ref<React.ComponentRef<C>>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};
declare const Breadcrumb: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<HTMLElement>>;

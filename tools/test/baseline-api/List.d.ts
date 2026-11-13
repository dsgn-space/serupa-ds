// exports: List, ListItem, type ListItemOwnProps, type ListItemProps, ListLoadingItems, type ListLoadingItemsProps, type ListProps
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
    children?: React.ReactNode | undefined;
    variant?: "card" | "plain" | undefined;
    divided?: boolean | undefined;
    as?: "ol" | "ul" | undefined;
    loading?: boolean | undefined;
    busy?: boolean | undefined;
}
interface ListItemOwnProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "onClick" | "title"> {
    title: React.ReactNode;
    description?: React.ReactNode | undefined;
    leading?: IconSource | undefined;
    trailing?: React.ReactNode | undefined;
    href?: string | undefined;
    onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
    selected?: boolean | undefined;
    disabled?: boolean | undefined;
}
type ListItemProps<C extends React.ElementType = "a"> = ListItemOwnProps & {
    as?: C | undefined;
    linkProps?: (Partial<React.ComponentPropsWithoutRef<C>> & {
        [data: `data-${string}`]: boolean | number | string | undefined;
    }) | undefined;
};
declare const List: React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLUListElement>>;
declare const ListItem: {
    <C extends React.ElementType = "a">(props: ListItemProps<C> & {
        ref?: React.Ref<HTMLLIElement>;
    }): null | React.ReactElement;
    displayName?: string | undefined;
};
interface ListLoadingItemsProps {
    rows?: number | undefined;
    description?: boolean | undefined;
    leading?: "icon" | "lg" | "md" | "sm" | "xl" | "xs" | undefined;
    label?: string | undefined;
}
declare function ListLoadingItems(props: ListLoadingItemsProps): React.ReactElement;

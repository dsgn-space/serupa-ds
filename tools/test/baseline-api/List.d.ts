// exports: List, ListItem, type ListItemProps, type ListProps
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
    children?: React.ReactNode | undefined;
    variant?: "card" | "plain" | undefined;
    divided?: boolean | undefined;
    as?: "ol" | "ul" | undefined;
}
interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "onClick" | "title"> {
    title: React.ReactNode;
    description?: React.ReactNode | undefined;
    leading?: IconSource | undefined;
    trailing?: React.ReactNode | undefined;
    href?: string | undefined;
    onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
    as?: React.ElementType | undefined;
    linkProps?: Record<string, unknown> | undefined;
    selected?: boolean | undefined;
    disabled?: boolean | undefined;
}
declare const List: React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLUListElement>>;
declare const ListItem: React.ForwardRefExoticComponent<ListItemProps & React.RefAttributes<HTMLLIElement>>;

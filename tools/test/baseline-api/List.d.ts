// exports: List, ListItem, type ListItemProps, type ListProps
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
    children?: React.ReactNode;
    variant?: "card" | "plain";
    divided?: boolean;
    as?: "ol" | "ul";
}
interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "onClick" | "title"> {
    title: React.ReactNode;
    description?: React.ReactNode;
    leading?: IconSource;
    trailing?: React.ReactNode;
    href?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    as?: React.ElementType;
    linkProps?: Record<string, unknown>;
    selected?: boolean;
    disabled?: boolean;
}
declare const List: React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLUListElement>>;
declare const ListItem: React.ForwardRefExoticComponent<ListItemProps & React.RefAttributes<HTMLLIElement>>;

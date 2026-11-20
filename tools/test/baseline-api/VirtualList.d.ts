// exports: VirtualList, type VirtualListProps
interface VirtualListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
    count: number;
    renderItem: (index: number) => React.ReactElement;
    itemKey?: ((index: number) => React.Key) | undefined;
    estimatedItemHeight?: number | undefined;
    overscan?: number | undefined;
    variant?: "card" | "plain" | undefined;
    divided?: boolean | undefined;
    as?: "ol" | "ul" | undefined;
}
declare const VirtualList: React.FC<VirtualListProps & React.RefAttributes<HTMLUListElement>>;

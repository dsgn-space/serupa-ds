// exports: TagGroup, type TagGroupProps, type TagItem
interface TagGroupLabels {
    tagRemove: (name: string) => string;
}
interface TagItem {
    id: string;
    label: string;
    disabled?: boolean | undefined;
    icon?: IconSource | undefined;
    avatar?: React.ReactNode | undefined;
}
interface TagGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
    items: readonly TagItem[];
    label?: React.ReactNode;
    onRemove?: ((id: string) => void) | undefined;
    selectionMode?: "multiple" | "none" | "single" | undefined;
    selected?: readonly string[] | undefined;
    defaultSelected?: readonly string[] | undefined;
    onSelectedChange?: ((ids: string[]) => void) | undefined;
    max?: number | undefined;
    emptyText?: React.ReactNode;
    empty?: React.ReactNode;
}
declare const TagGroup: React.FC<TagGroupProps & React.RefAttributes<HTMLDivElement>>;

// exports: TreeView, type TreeViewItem, type TreeViewProps
interface TreeViewItem {
    id: string;
    label: React.ReactNode;
    textValue?: string | undefined;
    icon?: IconSource | undefined;
    children?: TreeViewItem[] | undefined;
    disabled?: boolean | undefined;
}
interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "defaultValue" | "onChange"> {
    items: TreeViewItem[];
    selectionMode?: "multiple" | "none" | "single" | undefined;
    value?: string[] | undefined;
    defaultValue?: string[] | undefined;
    onValueChange?: ((value: string[]) => void) | undefined;
    expanded?: string[] | undefined;
    defaultExpanded?: string[] | undefined;
    onExpandedChange?: ((expanded: string[]) => void) | undefined;
    "aria-label"?: string | undefined;
}
declare const TreeView: React.ForwardRefExoticComponent<TreeViewProps & React.RefAttributes<HTMLUListElement>>;

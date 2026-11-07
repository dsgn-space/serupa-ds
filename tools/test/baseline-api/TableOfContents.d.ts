// exports: TableOfContents, type TableOfContentsProps, type TocItem
interface TableOfContentsLabels {
    tocTitle: string;
}
interface TocItem {
    id: string;
    label: React.ReactNode;
    level?: number | undefined;
}
interface TableOfContentsProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
    items?: TocItem[] | undefined;
    container?: Element | null | string | undefined;
    headings?: string | undefined;
    title?: null | React.ReactNode | undefined;
    offset?: number | undefined;
}
declare const TableOfContents: React.ForwardRefExoticComponent<TableOfContentsProps & React.RefAttributes<HTMLElement>>;

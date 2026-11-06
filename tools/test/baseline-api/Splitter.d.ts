// exports: Splitter, type SplitterProps
interface SplitterLabels {
    resizePanes: string;
    splitterPlace: string;
}
interface SplitterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue"> {
    children: [
        React.ReactNode,
        React.ReactNode
    ];
    direction?: "horizontal" | "vertical" | undefined;
    size?: number | undefined;
    defaultSize?: number | undefined;
    onSizeChange?: ((size: number) => void) | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    collapsible?: boolean | undefined;
    storageKey?: string | undefined;
    separatorLabel?: string | undefined;
}
declare const Splitter: React.ForwardRefExoticComponent<SplitterProps & React.RefAttributes<HTMLDivElement>>;

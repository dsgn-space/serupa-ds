// exports: ScrollArea, type ScrollAreaProps
interface ScrollAreaLabels {
    scrollArea: string;
}
interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "both" | "horizontal" | "vertical" | undefined;
    fade?: boolean | undefined;
    "aria-label"?: string | undefined;
}
declare const ScrollArea: React.ForwardRefExoticComponent<ScrollAreaProps & React.RefAttributes<HTMLDivElement>>;

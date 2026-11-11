// exports: ShowMore, type ShowMoreProps
interface ShowMoreLabels {
    showMore: string;
    showLess: string;
}
interface ShowMoreProps extends React.HTMLAttributes<HTMLDivElement> {
    lines?: number | undefined;
    expanded?: boolean | undefined;
    defaultExpanded?: boolean | undefined;
    onExpandedChange?: ((expanded: boolean) => void) | undefined;
    children?: React.ReactNode;
}
declare const ShowMore: React.ForwardRefExoticComponent<ShowMoreProps & React.RefAttributes<HTMLDivElement>>;

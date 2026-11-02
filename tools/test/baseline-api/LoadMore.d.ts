// exports: LoadMore, type LoadMoreProps
interface LoadMoreLabels {
    loadMore: string;
    showingOf: (shown: string, total: string) => string;
    loadedMore: (added: string) => string;
    moreLoaded: string;
    allLoaded: string;
}
interface LoadMoreProps extends React.HTMLAttributes<HTMLDivElement> {
    onLoadMore: () => PromiseLike<unknown> | void;
    hasMore?: boolean | undefined;
    loading?: boolean | undefined;
    count?: number | undefined;
    total?: number | undefined;
    infinite?: boolean | undefined;
    label?: React.ReactNode | undefined;
    endText?: React.ReactNode | undefined;
}
declare const LoadMore: React.ForwardRefExoticComponent<LoadMoreProps & React.RefAttributes<HTMLDivElement>>;

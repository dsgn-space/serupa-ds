// exports: Pagination, type PaginationProps, paginationRange
interface PaginationLabels {
    pagination: string;
    previousPage: string;
    nextPage: string;
    itemsOf: (first: string, last: string, total: string) => string;
    perPage: string;
}
type Entry = "end-ellipsis" | "start-ellipsis" | number;
declare function paginationRange(page: number, count: number, siblings?: number, boundaries?: number): Entry[];
interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
    count: number;
    page?: number | undefined;
    defaultPage?: number | undefined;
    onPageChange?: ((page: number) => void) | undefined;
    getHref?: ((page: number) => string) | undefined;
    linkAs?: React.ElementType<{
        href: string;
    }> | undefined;
    siblings?: number | undefined;
    boundaries?: number | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    "aria-label"?: string | undefined;
    previousLabel?: string | undefined;
    nextLabel?: string | undefined;
    pageLabel?: ((page: number) => string) | undefined;
    total?: number | undefined;
    pageSize?: number | undefined;
    pageSizeOptions?: number[] | undefined;
    onPageSizeChange?: ((pageSize: number, page: number) => void) | undefined;
}
declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;

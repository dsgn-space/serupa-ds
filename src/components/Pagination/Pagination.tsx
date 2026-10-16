import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";
import { Icon } from "../Icon/Icon";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** How many pages there are. */
  count: number;
  /** The current page, from 1 (controlled). Use with onPageChange. */
  page?: number;
  /** The page it starts on when uncontrolled. Default: 1. */
  defaultPage?: number;
  /** Called with the new page when someone picks one. */
  onPageChange?: (page: number) => void;
  /** Makes every page a link to this URL instead of a button (it still calls onPageChange on click). */
  getHref?: (page: number) => string;
  /** Pages shown on each side of the current one. Default: 1. */
  siblings?: number;
  /** Pages always shown at the start and the end. Default: 1. */
  boundaries?: number;
  /** 'md' (default, 32px) or 'sm' (24px). */
  size?: 'sm' | 'md';
  /** The nav's accessible name. Default: "Pagination". */
  "aria-label"?: string;
  /** Default: "Previous page". */
  previousLabel?: string;
  /** Default: "Next page". */
  nextLabel?: string;
  /** A page's accessible name. Default: (n) => "Page " + n. */
  pageLabel?: (page: number) => string;
}

type Entry = number | "start-ellipsis" | "end-ellipsis";

/** The pages to show: the boundaries at each end, siblings around the current one, and … where pages are skipped. Always the same length, so the arrows don't move. */
export function paginationRange(page: number, count: number, siblings = 1, boundaries = 1): Entry[] {
  const r = (a: number, b: number) => { const o: number[] = []; for (let i = a; i <= b; i++) o.push(i); return o; };
  const start = r(1, Math.min(boundaries, count));
  const end = r(Math.max(count - boundaries + 1, boundaries + 1), count);
  const sibStart = Math.max(Math.min(page - siblings, count - boundaries - siblings * 2 - 1), boundaries + 2);
  const sibEnd = Math.min(Math.max(page + siblings, boundaries + siblings * 2 + 2), end.length > 0 ? end[0] - 2 : count - 1);
  const out: Entry[] = start.slice();
  if (sibStart > boundaries + 2) out.push("start-ellipsis"); else if (boundaries + 1 < count - boundaries) out.push(boundaries + 1);
  out.push(...r(sibStart, sibEnd));
  if (sibEnd < count - boundaries - 1) out.push("end-ellipsis"); else if (count - boundaries > boundaries) out.push(count - boundaries);
  out.push(...end);
  return out.filter((e, i) => out.indexOf(e) === i);
}

function int(v: unknown, min: number, fallback: number): number {
  return typeof v === "number" && isFinite(v) && v >= min ? Math.floor(v) : fallback;
}

/* Pagination: previous and next arrows around page numbers, with … where pages are skipped. Pages are buttons
   (onPageChange) or, with getHref, links. The current page has aria-current="page". className and every other
   prop go to the <nav>. */
/** Moves through pages of results: previous, next, and page numbers with … where pages are skipped. */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(props, ref) {
  const rest = omit(props, { count: 1, page: 1, defaultPage: 1, onPageChange: 1, getHref: 1, siblings: 1, boundaries: 1, size: 1, previousLabel: 1, nextLabel: 1, pageLabel: 1, className: 1 });
  const count = int(props.count, 0, 0);
  const [own, setOwn] = React.useState(() => int(props.defaultPage, 1, 1));
  const controlled = props.page !== undefined;
  const page = Math.min(Math.max(int(controlled ? props.page : own, 1, 1), 1), Math.max(count, 1));
  const size = oneOf(["sm", "md"] as const, props.size, "md");
  const label = props.pageLabel || ((n: number) => "Page " + n);
  const go = (n: number, e: React.MouseEvent) => {
    if (n < 1 || n > count || n === page) { if (!props.getHref || n === page) e.preventDefault(); return; }
    if (!controlled) setOwn(n);
    if (props.onPageChange) props.onPageChange(n);
  };
  const item = (n: number, content: React.ReactNode, aria: Record<string, any>, disabled: boolean, cls: string) => {
    const common = Object.assign({ className: cn("dk-pagination__item", cls), onClick: (e: React.MouseEvent) => go(n, e) }, aria);
    if (props.getHref) return disabled ? <a {...common} role="link" aria-disabled="true">{content}</a> : <a {...common} href={props.getHref(n)}>{content}</a>;
    return <button type="button" {...common} disabled={disabled}>{content}</button>;
  };
  const arrow = (dir: "prev" | "next") => {
    const n = dir === "prev" ? page - 1 : page + 1;
    const icons = dir === "prev"
      ? <><Icon name="chevron_left" className="dk-pagination__ltr" /><Icon name="chevron_right" className="dk-pagination__rtl" /></>
      : <><Icon name="chevron_right" className="dk-pagination__ltr" /><Icon name="chevron_left" className="dk-pagination__rtl" /></>;
    return <li key={dir}>{item(n, icons, { "aria-label": dir === "prev" ? props.previousLabel || "Previous page" : props.nextLabel || "Next page", rel: props.getHref ? dir : undefined }, n < 1 || n > count, "dk-pagination__arrow")}</li>;
  };
  return (
    <nav aria-label="Pagination" {...rest} ref={ref} data-component="pagination" className={cn("dk-pagination", size === "sm" && "dk-pagination--sm", props.className)}>
      <ul className="dk-pagination__list">
        {arrow("prev")}
        {paginationRange(page, count, int(props.siblings, 0, 1), int(props.boundaries, 0, 1)).map((e) => typeof e === "number"
          ? <li key={e}>{item(e, e, { "aria-label": label(e), "aria-current": e === page ? "page" : undefined }, false, e === page ? "dk-pagination__item--current" : "")}</li>
          : <li key={e} className="dk-pagination__ellipsis" aria-hidden="true">…</li>)}
        {arrow("next")}
      </ul>
    </nav>
  );
});
Pagination.displayName = "Pagination";

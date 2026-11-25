'use client';
import * as React from 'react';
import { cn, oneOf, omit, useIsoLayoutEffect } from '../../internal/cn';
import { config } from '../../internal/config';
import { onFontsLoaded } from '../../internal/fontsLoaded';
import { Icon } from '../Icon/Icon';
import { Select } from '../Select/Select';
import { announce } from '../../internal/announce';
import { leave } from '../../internal/leave';
import { named } from '../../internal/component';
import { useControlSize } from '../../internal/controlSize';
import { displayNumber } from '../../internal/numbers';
import { latinDigits } from '../../internal/digits';
import { isComposing } from '../../internal/ime';
import { useLocale, useSettings } from '../../internal/provider';
import { paginationRange } from './paginationRange';
import { useFocusHandover } from '../../internal/focus';
import * as icons from '../../material/builtin';
import { en as words } from './labels';
import { useControllable } from '../../internal/controllable';

export { paginationRange };

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** How many pages there are. */
  count: number;
  /** The current page, from 1 (controlled). Use with onPageChange. */
  page?: number | undefined;
  /** The page it starts on when uncontrolled. Default: 1. */
  defaultPage?: number | undefined;
  /** Called with the new page when someone picks one. */
  onPageChange?: ((page: number) => void) | undefined;
  /** Makes every page a link to this URL instead of a button (it still calls onPageChange on click). */
  getHref?: ((page: number) => string) | undefined;
  /** With getHref, what renders each page link: your router's link component, one that takes href (React Router's maps it to to). Default: the link set with configure({ link }), else 'a'. */
  linkAs?: React.ElementType<{ href: string }> | undefined;
  /** Pages shown on each side of the current one. Default: 1. Fewer show when the row wouldn't fit on one line. */
  siblings?: number | undefined;
  /** Pages always shown at the start and the end. Default: 1. Fewer show, after the siblings, when the row wouldn't fit. */
  boundaries?: number | undefined;
  /** 'md' (32px), 'sm' (24px) or 'lg' (44px with 16px text, the touch-target size, beside lg fields and buttons). Default: a SerupaProvider's size, else md. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** The nav's accessible name. Default: "Pagination". */
  'aria-label'?: string | undefined;
  /** Default: "Previous page". */
  previousLabel?: string | undefined;
  /** Default: "Next page". */
  nextLabel?: string | undefined;
  /** A page's accessible name. Default: (n) => "Page " + n. */
  pageLabel?: ((page: number) => string) | undefined;
  /** How many items there are in all. With pageSize, a summary before the pages says which ones show: "21–30 of 245". */
  total?: number | undefined;
  /** How many items a page holds. With total, shows the summary. */
  pageSize?: number | undefined;
  /** The page sizes to offer, as a select labelled "Items per page" after the summary: [10, 25, 50]. Needs pageSize (the one picked). */
  pageSizeOptions?: number[] | undefined;
  /** Called with the size picked in the select, and details (page: the page that keeps the first item shown in view (page 5 at 10 a page starts with item 41, which is on page 2 at 25 a page)). Set pageSize, and page when controlled; uncontrolled, the page moves by itself. */
  onPageSizeChange?: ((pageSize: number, details: { page: number }) => void) | undefined;
  /** A "Go to page" number field after the pages, for long lists where the numbers shown are no help: Enter goes to
   *  the page typed (one out of range goes to the nearest end), and the page is said. With getHref and no
   *  onPageChange, it follows the page's link. Default: false. */
  jump?: boolean | undefined;
}

function int(v: unknown, min: number, fallback: number): number {
  return typeof v === 'number' && isFinite(v) && v >= min ? Math.floor(v) : fallback;
}

function PaginationRender({ ref, ...props }: PaginationProps & React.RefAttributes<HTMLElement>) {
  const sds = useSettings(words);
  const locale = useLocale();
  const rest = omit(props, { count: 1, page: 1, defaultPage: 1, onPageChange: 1, getHref: 1, linkAs: 1, siblings: 1, boundaries: 1, size: 1, previousLabel: 1, nextLabel: 1, pageLabel: 1, total: 1, pageSize: 1, pageSizeOptions: 1, onPageSizeChange: 1, jump: 1, className: 1 });
  const count = int(props.count, 0, 0);
  const [held, setOwn, controlled] = useControllable<number>(props.page, int(props.defaultPage, 1, 1), 'Pagination', 'page');
  const page = Math.min(Math.max(int(held, 1, 1), 1), Math.max(count, 1));
  const size = oneOf(['sm', 'md', 'lg'] as const, useControlSize(props.size), 'md');   // a SerupaProvider's size too, as its controls are control-height
  const label = props.pageLabel || sds.labels.page;
  // The name says the number as the button shows it, "١٠" in ar-EG and "1,000" in en-US, so it holds the visible
  // text, as WCAG 2.5.3 asks: "Page ١٠", not "Page 10".
  const said = (n: number) => { const shown = displayNumber(n, locale), l = label(n); return shown === String(n) ? l : l.replace(new RegExp('(?<!\\d)' + n + '(?!\\d)', 'g'), shown); };
  // ET1: the row stays on one line. When it's wider than its box, siblings and then boundaries step down (cut) until
  // it fits, before paint; when the box grows they start over from what was asked.
  const siblings = int(props.siblings, 0, 1), boundaries = int(props.boundaries, 0, 1);
  const [cut, setCut] = React.useState(0);
  const most = siblings + boundaries, list = React.useRef<HTMLUListElement | null>(null);
  const over = () => { const l = list.current; return !!l && l.scrollWidth > l.clientWidth + 1; };
  // The box's width when the last cut was made: once it's wider than that, the cuts start over. A width is kept
  // rather than trusting each resize to be seen, since a shrink and a grow back can land in one frame.
  const cutAt = React.useRef(0);
  // A new page or count may need fewer cuts (60 → 9 is narrower): start over, and the next effect cuts again if needed.
  useIsoLayoutEffect(function () { setCut(0); }, [page, count]);
  // GR62: until this runs (server HTML before hydration, or with no JavaScript) nothing can cut the row, so it wraps
  // onto more lines rather than running off the page. From here on it stays on one line, and is cut to fit.
  useIsoLayoutEffect(function () { if (list.current) list.current.setAttribute('data-fit', ''); }, []);
  // every render: any change (page, count, labels, the locale's digits, the box) can change the room, so it is measured each time.
  useIsoLayoutEffect(function () {
    const l = list.current;
    if (!l) return;
    if (cut > 0 && l.clientWidth > cutAt.current + 1) setCut(0);
    else if (cut < most && over()) { cutAt.current = l.clientWidth; setCut(cut + 1); }
  });
  // A box that resizes without a render (a window or a panel) renders again, and the effect above measures.
  const [, remeasure] = React.useReducer((n: number) => n + 1, 0);
  useIsoLayoutEffect(function () {
    const l = list.current;
    if (!l || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(remeasure);
    ro.observe(l);
    return () => ro.disconnect();
  }, []);
  // GR66: a row first measured in a fallback font keeps its cuts when the web font (narrower or wider) arrives, since
  // the box doesn't change size. Once fonts load, the cuts start over and the row is measured again, as Stepper does.
  useIsoLayoutEffect(function () {
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (!fonts) return;
    let live = true;
    const again = () => { if (!live) return; setCut(0); remeasure(); };
    if (fonts.status !== 'loaded') fonts.ready.then(again, () => {});
    const off = onFontsLoaded(again);
    return () => { live = false; off(); };
  }, []);
  // An arrow that takes you to the first or last page turns disabled under focus (FJ1): focus goes to the other one.
  const handover = useFocusHandover();
  const go = (n: number, e: React.MouseEvent) => {
    if (n < 1 || n > count || n === page) { if (!props.getHref || n === page) e.preventDefault(); return; }
    const from = e.currentTarget as HTMLElement;
    if (from.classList.contains('srp-pagination__arrow')) handover(from, () => { const all = from.closest('nav')?.querySelectorAll<HTMLElement>('.srp-pagination__arrow'); return all && all[n < page ? all.length - 1 : 0]; });
    if (!controlled) setOwn(n);
    if (props.onPageChange) props.onPageChange(n);
  };
  const item = (n: number, content: React.ReactNode, aria: React.AriaAttributes & { rel?: string }, disabled: boolean, cls: string) => {
    const common = Object.assign({ className: cn('srp-pagination__item', cls), 'data-current': cls === 'srp-pagination__item--current' ? '' : undefined, onClick: (e: React.MouseEvent) => go(n, e) }, aria);
    if (props.getHref) return disabled ? <a {...common} role="link" aria-disabled="true">{content}</a> : React.createElement(props.linkAs || config.link, Object.assign(common, { href: props.getHref(n) }), content);
    return <button type="button" {...common} disabled={disabled}>{content}</button>;
  };
  const arrow = (dir: 'prev' | 'next') => {
    const n = dir === 'prev' ? page - 1 : page + 1;
    // The chevrons flip in right-to-left text by themselves (Icon's mirror).
    const arrows = <Icon icon={dir === 'prev' ? icons.ChevronLeft : icons.ChevronRight} />;
    return <li key={dir}>{item(n, arrows, { 'aria-label': dir === 'prev' ? props.previousLabel || sds.labels.previousPage : props.nextLabel || sds.labels.nextPage, rel: props.getHref ? dir : undefined }, n < 1 || n > count, 'srp-pagination__arrow')}</li>;
  };
  // O7: with total and pageSize, which items this page shows, in the locale's digits and grouping ("1,001–1,010 of 12,345").
  const total = int(props.total, 0, -1), per = int(props.pageSize, 1, 0);
  const summary = total >= 0 && per > 0 ? sds.labels.itemsOf(displayNumber(total ? Math.min((page - 1) * per + 1, total) : 0, locale), displayNumber(Math.min(page * per, total), locale), displayNumber(total, locale)) : null;
  // O7: the page-size select. A new size keeps the first item shown on the page it lands on.
  const sizeId = React.useId();
  const sizes = Array.isArray(props.pageSizeOptions) && props.pageSizeOptions.length && per > 0 ? props.pageSizeOptions.filter((n) => int(n, 1, 0) > 0) : null;
  const resize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = int(Number(e.currentTarget.value), 1, per), to = Math.floor(((page - 1) * per) / next) + 1;
    if (!controlled) setOwn(to);
    if (props.onPageSizeChange) props.onPageSizeChange(next, { page: to });
  };
  // The jump field: Enter goes to the page typed, clamped to the pages there are, and says where it went, since focus
  // stays in the field and nothing else would.
  const jumpId = React.useId();
  const [typed, setTyped] = React.useState('');
  const jumpTo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || isComposing(e)) return;
    e.preventDefault();
    // In the digits the pages are written in ("١٢" in ar-EG), or full width from an IME, with or without the marks
    // that group thousands ("1,200"); "2.5" is no page.
    const t = latinDigits(typed.normalize('NFKC')).trim().replace(/[\s,.'\u066c\u2019](?=\d{3}(?!\d))/g, '');
    if (!/^\d+$/.test(t) || count < 1) return;
    const n = Number(t);
    const to = Math.min(Math.max(n, 1), count);
    setTyped('');
    announce(said(to));
    if (to === page) return;
    if (!controlled) setOwn(to);
    if (props.onPageChange) props.onPageChange(to);
    else if (props.getHref && typeof window !== 'undefined') leave(props.getHref(to));   // a web page only: never a javascript: URL
  };
  const jump = props.jump && count > 1 ? <span className="srp-pagination__jump"><label htmlFor={jumpId}>{sds.labels.goToPage}</label>
    {/* Input's box and field classes, without Input's own code (its masks, count and actions) in Pagination's bundle. */}
    <span className={cn('srp-input', 'srp-input--size-' + size, 'srp-pagination__jump-field')}><input id={jumpId} className="srp-input__field" type="text" inputMode="numeric" autoComplete="off" enterKeyHint="go" value={typed} onChange={(e) => setTyped(e.currentTarget.value)} onKeyDown={jumpTo} /></span></span> : null;
  const bar = summary != null || sizes != null || jump != null;
  return (
    <nav aria-label={sds.labels.pagination} {...rest} ref={ref} data-component="pagination" className={cn('srp-pagination', size !== 'md' && 'srp-pagination--' + size, bar && 'srp-pagination--summary', props.className)}>
      {summary != null ? <p className="srp-pagination__summary">{summary}</p> : null}
      {sizes ? <span className="srp-pagination__page-size"><label htmlFor={sizeId}>{sds.labels.perPage}</label>
        <Select id={sizeId} size={size} value={String(per)} onChange={resize} options={(sizes.indexOf(per) < 0 ? sizes.concat(per).sort((a, b) => a - b) : sizes).map((n) => ({ value: String(n), label: displayNumber(n, locale) }))} /></span> : null}
      <ul className="srp-pagination__list" ref={list}>
        {arrow('prev')}
        {paginationRange(page, count, Math.max(siblings - cut, 0), Math.max(boundaries - Math.max(cut - siblings, 0), 0)).map((e) => typeof e === 'number'
          ? <li key={e}>{item(e, displayNumber(e, locale), { 'aria-label': said(e), 'aria-current': e === page ? 'page' : undefined }, false, e === page ? 'srp-pagination__item--current' : '')}</li>
          : <li key={e} className="srp-pagination__ellipsis" aria-hidden="true">…</li>)}
        {arrow('next')}
      </ul>
      {jump}
    </nav>
  );
}

/* Pagination: previous and next arrows around page numbers, with … where pages are skipped. Pages are buttons
   (onPageChange) or, with getHref, links. The current page has aria-current="page". className and every other
   prop go to the <nav>. */
/** Moves through pages of results: previous, next, and page numbers with … where pages are skipped. */
export const Pagination = /* @__PURE__ */ named('Pagination', PaginationRender);

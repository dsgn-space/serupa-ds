# Pagination

Moves through pages of results: previous and next arrows around the page numbers, with … where pages are skipped. It always shows the same number of slots, so the arrows stay put as the page changes. Pages are buttons, or links with `getHref` when each page has its own URL.

## Usage

```jsx
const { Pagination } = window.Diki;

const [page, setPage] = React.useState(1);
<Pagination count={totalPages} page={page} onPageChange={setPage} />

// Each page has a URL (server rendering, shareable links)
<Pagination count={20} page={page} getHref={(n) => `/orders?page=${n}`} />

<Pagination count={8} size="sm" siblings={0} />
```

`paginationRange(page, count, siblings, boundaries)` returns the same list of pages and ellipses, for building your own.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `count` | number | required | How many pages there are |
| `page` | number | none | The current page, from 1 (controlled) |
| `defaultPage` | number | `1` | The page it starts on when uncontrolled |
| `onPageChange` | `(page) => void` | none | Called with the new page |
| `getHref` | `(page) => string` | none | Makes every page a link. Clicks still call `onPageChange` |
| `siblings` | number | `1` | Pages on each side of the current one |
| `boundaries` | number | `1` | Pages always shown at each end |
| `size` | `'sm'` \| `'md'` | `'md'` | 24px or 32px squares |
| `aria-label` | string | `"Pagination"` | The nav's name |
| `previousLabel`, `nextLabel` | string | `"Previous page"`, `"Next page"` | The arrows' names |
| `pageLabel` | `(page) => string` | `"Page " + page` | A page's name |

`className`, `style`, `ref` and everything else go to the `<nav>`, which has `data-component="pagination"`.

## Accessibility

- It's a `<nav>` landmark named "Pagination" with a list. The current page has `aria-current="page"`; the ellipses are hidden from screen readers.
- At the first or last page the arrow is disabled (a link loses its `href` and gets `aria-disabled`).
- Pages, also on hover, the current page and the ellipsis keep 4.5:1 in all six themes (`tools/test/pagination.mjs`).
- The arrows point the other way in right-to-left pages.
- After a page change, move focus to the top of the new results (or announce them) so keyboard and screen reader users know the list changed.

## Component tokens

Each is an optional override: set it on the page, a container or one pagination. The list lives in `src/components/Pagination/pagination.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--pagination-text` | `text` | A page number and the arrows. |
| `--pagination-bg-hover` | `secondary` | A page or arrow on hover. |
| `--pagination-current-bg` | `primary` | The current page's background. |
| `--pagination-current-text` | `on-primary` | The current page's number (4.5:1 on current-bg). |
| `--pagination-ellipsis` | `text-muted` | The … between page ranges (4.5:1 on surface). |
| `--pagination-focus-ring` | `focus-ring` | The keyboard focus ring. |
| `--pagination-font-size` | `text-sm` | Page numbers (14px). |
| `--pagination-weight-current` | `font-semibold` | The current page's weight (600). |
| `--pagination-size` | `control-height-md` | A page's width and height at size md (32px). |
| `--pagination-size-sm` | `control-height-sm` | At size sm (24px). |
| `--pagination-gap` | `spacing-1` | Space between pages (4px). |
| `--pagination-padding-x` | `spacing-2` | Side padding inside a page, for wide numbers (8px). |
| `--pagination-radius` | `rounded-md` | A page's corners (6px). |
| `--pagination-disabled` | `opacity-50` | Previous or next when there's no page that way. |

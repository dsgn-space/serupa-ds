# Breadcrumb

Shows where the current page sits: links to the pages above it, from the top level down, with chevrons between them. The last item is the current page. On a deep trail, `maxItems` collapses the middle into a "…" button that shows it again.

## Usage

```jsx
const { Breadcrumb, BreadcrumbItem } = window.Diki;

<Breadcrumb>
  <BreadcrumbItem href="/" icon="home">Home</BreadcrumbItem>
  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem>Website redesign</BreadcrumbItem>
</Breadcrumb>

<Breadcrumb maxItems={3} separator="slash">…</Breadcrumb>

// With a router
<BreadcrumbItem as={RouterLink} to="/projects">Projects</BreadcrumbItem>
```

## Props

### Breadcrumb

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | BreadcrumbItems | none | From the top level to the current page |
| `separator` | `'chevron'` \| `'slash'` | `'chevron'` | What goes between items. The chevron points left in right-to-left pages |
| `maxItems` | number (2 or more) | no limit | Shows the first item, "…", then the last `maxItems - 1`. Pressing "…" shows them all and moves focus to the first one it showed |
| `aria-label` | string | `"Breadcrumb"` | The nav's name |
| `expandLabel` | string | `"Show the hidden pages"` | The "…" button's name |

`className`, `style`, `ref` and everything else go to the `<nav>`, which has `data-component="breadcrumb"`.

### BreadcrumbItem

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `href` | string | none | Where it goes |
| `icon` | an icon name or element | none | A 16px icon before the label |
| `as` | a component | `'a'` | Your router's link component |

The last item is the current page: text with `aria-current="page"`, not a link, even if it has an `href`. `className`, `ref` and everything else go to the link.

## Accessibility

- It's a `<nav>` landmark named "Breadcrumb" holding an ordered list, so screen readers say how many levels there are. Give it another name if the page has two.
- The current page has `aria-current="page"`. Separators are hidden from screen readers.
- Links, the current page and separators keep 4.5:1 on `surface` in all six themes (`tools/test/breadcrumb.mjs`).
- Links are underlined on hover only: their place in the trail and the chevrons already say they're links.

## Component tokens

Each is an optional override: set it on the page, a container or one breadcrumb. The list lives in `src/components/Breadcrumb/breadcrumb.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--breadcrumb-text` | `text-muted` | A link to a parent page (4.5:1 on surface). |
| `--breadcrumb-text-hover` | `text` | A link on hover. |
| `--breadcrumb-text-current` | `text` | The current page. |
| `--breadcrumb-separator` | `text-muted` | The chevron or slash between items. |
| `--breadcrumb-focus-ring` | `focus-ring` | The keyboard focus ring. |
| `--breadcrumb-font-size` | `text-sm` | The text (14px). |
| `--breadcrumb-weight-current` | `font-medium` | The current page's weight (500). |
| `--breadcrumb-gap` | `spacing-1_5` | Space between an item and a separator (6px). |
| `--breadcrumb-separator-size` | `spacing-4` | The chevron's size (16px). |
| `--breadcrumb-icon-size` | `spacing-4` | An item's icon (16px). |
| `--breadcrumb-focus-radius` | `rounded-sm` | The focus ring's corners (4px). |

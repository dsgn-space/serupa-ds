# SidebarLayout

Puts a narrow column beside a wide one, and stacks them once the space gets too narrow for both. It follows the space it's in rather than the screen, so filters beside results, a summary beside a form or a list beside its detail need no CSS of their own.

**Also called:** two-column layout, aside layout, split layout.

```tsx
import { SidebarLayout, Card } from "@diki-stwn/serupa-ds";

<SidebarLayout sidebar={<Card>…filters…</Card>}>
  …results…
</SidebarLayout>

<SidebarLayout sidebarPlacement="end" sidebarWidth="container-xs" sidebar={<Card>…order summary…</Card>}>
  …the form…
</SidebarLayout>
```

## When to use

- Filters beside a list of results, a page's sections beside its content, a summary beside a form, a list beside the detail of the item picked.
- Two columns that should stack on a phone without a breakpoint of your own, including inside a Dialog, a Drawer or a Card.

## When not to use

- The app's navigation beside every page: use [AppShell](../AppShell/README.md) with a [Sidebar](../Sidebar/README.md) instead.
- Columns of equal width: use [Grid](../Grid/README.md) instead.
- Two panes people resize by dragging: use [Splitter](../Splitter/README.md) instead.

## Anatomy

Drawn from the `Playground` story.

1. **Sidebar** (`.dk-sidebar-layout__side`): the narrow column, `sidebarWidth` wide while the two share a line.
2. **Content** (`.dk-sidebar-layout__content`): the wide column, which takes the rest.

## Usage

- Put what supports the content in the narrow column, and the content itself in `children`. On a phone the narrow column comes first (or last, with `sidebarPlacement="end"`), so keep it short.
- `sidebarWidth` takes a sizing token name: `container-3xs` (256px, the default) for filters, `container-xs` (320px) for a summary with prices.
- `contentMin` (50 by default) is how narrow the wide column may get, as a percentage of the whole, before the two stack. Raise it when the content needs more room, such as a table.
- `align="start"` keeps each column its own height, so a short side doesn't stretch down beside a long page. Leave it at `stretch` for two panels side by side.

### Do and don't

- **Do:** Put what helps people with the main content in the narrow column: filters, a summary, a page's sections. (`DoSupportingSide`)
- **Don't:** Put the page's main content in the narrow column: on a phone it comes first, and people scroll past it to find the rest. (`DontMainInSide`)

## Accessibility

- **Role and name:** none of its own: a layout box. Give each column the landmark or heading it needs, such as `<aside aria-label="Filters">` or a Card `as="section"` with `aria-labelledby`.
- **Keyboard:** none: a layout box, not focusable.
- **Reading order:** the HTML follows what people see: the narrow column first with `sidebarPlacement="start"`, last with `"end"`, side by side or stacked, so the Tab order matches the screen (WCAG 1.3.2, 2.4.3). Nothing is reordered with CSS.
- **Reflow:** at 320px, or at 400% zoom, the columns stack and nothing scrolls sideways (1.4.10).
- **What's still yours:** the headings and landmarks inside each column.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root element (`as`). |
| `sidebar` | ReactNode | required | The narrow column |
| `children` | ReactNode | none | The wide column |
| `sidebarPlacement` | `'start'` \| `'end'` | `'start'` | Which side the narrow column is on, in the HTML too |
| `sidebarWidth` | string | `'container-3xs'` (256px) | The narrow column's width side by side: a sizing token name or a CSS length |
| `contentMin` | number, 1 to 99 | `50` | The narrowest the wide column gets, as a percentage of the whole, before the two stack |
| `gap` | a spacing step: `0` to `24` | `6` (24px) | The space between the columns |
| `align` | `'stretch'` \| `'start'` | `'stretch'` | Both as tall as the taller, or each its own height |
| `as` | `'div'` \| `'section'` \| `'main'` \| `'article'` | `'div'` | The element |

A value that isn't on the list falls back to the default. `className`, `style`, `ref` and everything else go to the element, which has `data-component="sidebar-layout"`. Each column is a `<div>`: `.dk-sidebar-layout__side` and `.dk-sidebar-layout__content`.

## Component tokens

Each is an optional override: set it on the page, a container or one SidebarLayout. The list lives in `src/components/SidebarLayout/sidebar-layout.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from sidebar-layout.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--sidebar-layout-side-width` | `container-3xs` | The narrow column's width side by side, when sidebarWidth isn't given (256px). |
| `--sidebar-layout-gap` | `spacing-6` | The space between the columns when gap isn't given (24px). |
<!-- token-table:end -->

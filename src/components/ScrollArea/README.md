# ScrollArea

A box whose content scrolls inside it, such as a long activity list in a card or a row of chips in a narrow column. Its scrollbars are thin and in the theme's colors, and while its content overflows it's a Tab stop and a named region, so keyboard and screen reader users can reach and scroll it.

```tsx
import { ScrollArea } from "serupa-ds";

<ScrollArea aria-label="Recent activity" fade style={{ maxHeight: 240 }}>
  {activity.map((a) => <ActivityItem key={a.id} {...a} />)}
</ScrollArea>
```

## When to use

- A part of a page that holds more than its space: a feed in a dashboard card, a filter list in a sidebar, a row of tags that runs past its column.
- Anywhere you'd write `overflow: auto` on a div: ScrollArea adds what that div needs to be reachable by keyboard and named for screen readers, only while it scrolls.

## When not to use

- A data table: use [Table](../Table/README.md), whose frame already scrolls this way.
- Code: use [CodeBlock](../CodeBlock/README.md).
- A long list of thousands of rows: use [VirtualList](../VirtualList/README.md), which draws only the rows in view.
- The page itself: let the page scroll. A box that scrolls inside a page that scrolls is harder to use, above all on a phone.

## Usage

- Give it a size: a `maxHeight` (or `height`) for `orientation="vertical"`, the default; a width narrower than its content for `"horizontal"`; both for `"both"`.
- Name it with `aria-label` or `aria-labelledby` for what it holds ("Recent activity"). The name is used only while it scrolls; with none it's "Scrolling content".
- With `fade`, an edge with more past it fades out over 32px, a hint that there's more: use it where the scrollbar alone can go unnoticed (a phone, a row of chips). The faded edge isn't for reading, so keep padding at the edges.
- The scrollbar is the browser's own, so dragging, clicking the track, touch and screen readers work as they do everywhere; only its width and colors change.

## Accessibility

- **Role and name:** while its content overflows, `role="region"` named by `aria-label`, `aria-labelledby` or "Scrolling content"; when everything fits, a plain `<div>` with no role, no name and no Tab stop.
- **Keyboard:**

| Key | Does |
| --- | --- |
| Tab | Reaches it while it scrolls (WCAG 2.1.1), with a focus ring inside its edge. |
| Arrow keys | Scroll it a step. |
| Page Up, Page Down, Home, End | Scroll it a page, or to the start or end. |

- **Contrast:** the scrollbar thumb and the focus ring read 3:1 on the surface in all six themes (`ScrollArea.test.tsx`). In forced colors the scrollbar is the system's.
- **What's still yours:** its size and name, and keeping a box that scrolls out of another box that scrolls the same way.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the box. |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | Which way it scrolls. |
| `fade` | `boolean` | `false` | Fades an edge with more past it. |
| `aria-label` | `string` | `"Scrolling content"` | Its name while it scrolls. |
| `aria-labelledby` | `string` | | The id of what names it, such as a heading. |
| `children` | `ReactNode` | | What scrolls. |

`className`, `style`, `ref`, `onScroll` and other props go to the box.

## Component tokens

Each is an optional override: set it on the page, a container or one ScrollArea. The list lives in `src/components/ScrollArea/scroll-area.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from scroll-area.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--scroll-area-thumb` | `field-border` | The scrollbar's thumb (3:1 on the surface). |
| `--scroll-area-focus-ring` | `focus-ring` | The ring inside its edge while it has focus. |
| `--scroll-area-fade` | `spacing-8` | How far an edge with more past it fades, with fade (32px). |
<!-- token-table:end -->

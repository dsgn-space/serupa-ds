---
"@diki-stwn/serupa-ds": major
---

VirtualList is part of List, and Loader is a ring, dots or text.

- **What changes:**
  - VirtualList is removed. A List of thousands of rows takes `ListVirtualItems` inside it, as a Table takes `TableVirtualBody`: `<List aria-label="Members" variant="card"><ListVirtualItems count={people.length} renderItem={row} /></List>`. The List's own props (`variant`, `divided`, `as`, `aria-label`, `className`) stay on the List, and `count`, `renderItem`, `itemKey`, `estimatedItemHeight` and `overscan` go to ListVirtualItems. It draws, scrolls and reads as before. The list is `data-component="list"`, `--virtual-list-height` is `--list-virtual-height`, and its focus ring is `--list-focus-ring`.
  - Loader keeps `variant` `ring`, `dots` and `text`. `variant="skeleton"`, deprecated in 18.x, is gone: use `<Skeleton>`, with the same `shape`, `lines`, `size`, `label`, `delay` and `loading`. `spokes` and `pixel` are gone, with `pattern`, `glow`, `LoaderPattern`, `LoaderShape` and the `--loader-skeleton-*`, `--loader-pixel-*` and `--loader-spokes-*` tokens. A removed variant draws the ring.
- **Migration:** `serupa-migrate --from 18` rewrites a VirtualList as a List with ListVirtualItems inside, a skeleton Loader as a Skeleton, a spokes or pixel Loader as the ring, `LoaderShape` as `SkeletonShape`, and the renamed tokens. It lists a VirtualList with spread props, `VirtualListProps`, and the pixel and spokes tokens, to change by hand.

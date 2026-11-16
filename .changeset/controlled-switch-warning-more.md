---
"@diki-stwn/serupa-ds": patch
---

Dialog, Drawer, Menu, ContextMenu, Accordion, SegmentedControl, CommandPalette, Slider and Rating now warn once in development (`controlled-switch`) when a controlled prop (`open` or `value`) turns `undefined`, or the other way round, as HoverCard, Popover, ShowMore, ToggleGroup and Tour already do. Before, they quietly went back to their own, often stale, state. Otherwise they follow the prop as before.

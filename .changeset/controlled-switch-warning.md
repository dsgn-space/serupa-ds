---
"@diki-stwn/serupa-ds": patch
---

HoverCard, Popover, ShowMore, ToggleGroup and Tour warn once in development when a controlled prop (`open`, `expanded`, `value`, `step`) turns `undefined`, or the other way round. Before, the component quietly went back to its own, often old, state, and the screen disagreed with the app's with nothing in the console. They still follow the prop as before. The warning is `controlled-switch` in docs/warnings.md.

---
"serupa-ds": patch
---

ScrollArea `fade`: content that grows while the area already scrolls (rows added, or a line that wraps once a web font loads) fades the end edge again. Before, the fade was read only on scroll or when the area started or stopped scrolling, so a list scrolled to its end showed a hard edge over the new rows.

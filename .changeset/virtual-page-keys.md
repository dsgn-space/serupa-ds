---
"serupa-ds": patch
---

VirtualList (and the lists built on it): PageUp and PageDown move a screen at once. With rows of mixed heights, the browser's smooth scroll was thrown back by the rows it measured on the way, so the first PageUp after End moved one row instead of a screen.

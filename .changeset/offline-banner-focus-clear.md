---
"serupa-ds": patch
---

OfflineBanner: a field the keyboard moves to no longer hides under the fixed bar (WCAG 2.4.11). While the bar shows, the page's scroll padding on that edge follows the bar's height, so a focused field scrolls into view clear of it, and a bottom bar adds its height to the end of the page so the last field can scroll clear too. Everything is put back when the bar goes.

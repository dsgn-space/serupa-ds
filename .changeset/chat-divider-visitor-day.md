---
"serupa-ds": patch
---

ChatDivider: "Today" and "Yesterday" now follow the visitor's day, not the server's, and change at the visitor's midnight. Before, a UTC server could call a Jakarta visitor's message from this morning "Yesterday" and redraw it after hydration. Until the page hydrates, the divider shows the date.

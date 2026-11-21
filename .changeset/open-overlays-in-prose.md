---
"@diki-stwn/serupa-ds": patch
---

A Popover or Menu that is open from the start (`defaultOpen`) inside a paragraph now keeps the paragraph whole in the server's HTML. Its body, items, groups and separators are spans laid out as blocks, so the browser no longer ends the paragraph at them. A Menu item is now a `<span>`, not a `<div>`.

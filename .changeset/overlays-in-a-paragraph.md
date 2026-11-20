---
"@diki-stwn/serupa-ds": patch
---

A Tooltip, HoverCard, Popover or Menu inside a paragraph keeps the paragraph whole in server-rendered HTML, so the page hydrates without a mismatch. Their panel was a `<div>`, which ends a `<p>` when the browser reads the HTML, so the rest of the line fell out of the paragraph. The panel is now a `<span>`, and looks and behaves the same.

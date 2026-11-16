---
'@diki-stwn/serupa-ds': patch
---

Sidebar items and FilterBar chips cut with an ellipsis now show their full text in a tooltip on keyboard focus too, not only as a title on hover. Input, Textarea and Select fields the browser autofills now show it in more than colour: their border doubles inward until the field is focused.

A Tooltip's long text wraps inside it even when its trigger sits in a row that never wraps; before, it ran on past the tooltip's edge. TruncatedText now notices a web font that loads late in Safari too.

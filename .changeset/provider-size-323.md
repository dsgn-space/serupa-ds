---
"@diki-stwn/serupa-ds": patch
---

SplitButton and Pagination take the size around them: `<SerupaProvider size="sm">` (and, for SplitButton, a ButtonGroup's size) now makes them 24px like every other control in it, where they stayed 32px. Their own `size` still wins.

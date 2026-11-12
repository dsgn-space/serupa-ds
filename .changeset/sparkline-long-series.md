---
"serupa-ds": patch
---

Sparkline draws a long series instead of throwing: with about 150,000 points or more, finding the lowest and highest values overflowed the stack ("Maximum call stack size exceeded"), which took the page down.

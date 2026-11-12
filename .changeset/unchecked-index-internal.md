---
"serupa-ds": patch
---

Shared parsing and list code reads past the end of a list safely: a date, number or masked value missing a part, and a virtual list's row offsets, fall back to a default instead of passing `undefined` on.

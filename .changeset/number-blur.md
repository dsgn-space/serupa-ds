---
'serupa-ds': patch
---

NumberInput: a number typed with a decimal mark left at the end ("5." or "7,") is now read without it on blur or Enter, instead of being reported as unreadable. Tabbing through a field nobody typed in no longer clamps a controlled `value` outside `min` and `max`, so it doesn't call `onValueChange` or report a range error for a number nobody entered.

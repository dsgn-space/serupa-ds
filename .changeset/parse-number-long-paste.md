---
"serupa-ds": patch
---

NumberInput (and every field that reads a typed number) no longer freezes on a very long paste: text over 100 characters, spaces aside, is read as not a number at once, where a 64k-character paste used to take seconds per keystroke.

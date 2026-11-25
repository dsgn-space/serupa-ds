---
"@diki-stwn/serupa-ds": patch
---

Textarea's top and bottom padding now counts its 1px border, so one row is as tall as an Input or a Button of the same size: 24, 32 and 44px (it was 26, 34 and 46, the border sitting outside a control-height field). Every Textarea is 2px shorter. In ChatComposer, the one-line message field and Send are now the same 32px and share their top and bottom edges.

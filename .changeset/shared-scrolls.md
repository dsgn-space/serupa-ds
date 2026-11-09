---
"serupa-ds": patch
---

Table and CodeBlock now share Timeline's check for "this box scrolls", so each keeps its Tab stop, region role and name in step when its content is replaced, not only when it resizes. Table measures before paint, so a table that scrolls from the start is never shown, even for a frame, as a box you can't Tab to.

---
"serupa-ds": patch
---

Date presets: which preset is pressed, and which is out of range, is decided after hydration, so a server whose date isn't the visitor's no longer leaves the wrong one pressed ("Tomorrow" for "Today") or makes React log a mismatch (GR286).

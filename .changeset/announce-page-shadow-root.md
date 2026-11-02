---
"serupa-ds": patch
---

announcePage: given a heading inside a shadow root, it no longer says the title again when the focused heading already says it. It read `document.activeElement`, which is the shadow host there, so it took the heading as not focused (GR95).

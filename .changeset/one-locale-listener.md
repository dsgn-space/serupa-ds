---
"serupa-ds": patch
---

Components that follow the browser's locale now share one `languagechange` listener on the window instead of adding one each, so a 1,000-row table with dates no longer adds thousands of listeners. They still follow the browser when its language changes.

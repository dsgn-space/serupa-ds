---
"serupa-ds": minor
---

SessionTimeout keeps its draft in sessionStorage under `saveKey` instead of localStorage, so it lasts for the tab and not for later visits from the same computer. Only the subject and the message are kept. A new `onSend` prop sends the message, and the draft is cleared once it resolves. SECURITY.md now lists every key the package keeps in the browser, and `tools/test/storage.mjs` checks the list against the code.

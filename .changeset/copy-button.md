---
"serupa-ds": minor
---

- Added: CopyButton, a Button that copies `value` (text, or a function that returns it) to the clipboard. It then shows a check and "Copied" for two seconds without changing width, and says "Copied" to screen readers. If the browser refuses, it says "Couldn't copy…" and calls `onCopyError`. It has `iconOnly`, `copiedLabel`, `timeout` and `onCopy`, falls back to `execCommand("copy")` where the Clipboard API isn't available, and has the token `--copy-button-done-color`. New labels `copy`, `copied` and `copyFailed`, in English and Indonesian.

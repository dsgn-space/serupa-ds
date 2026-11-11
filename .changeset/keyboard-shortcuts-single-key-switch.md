---
"serupa-ds": minor
---

KeyboardShortcuts: the help dialog has a "Single-key shortcuts" switch whenever a shortcut is one character key ("?" itself, by default). Turned off, every shortcut that is one character key with no mod, ctrl, cmd or alt stops working, on every page of the app (kept in localStorage), so speech input or a stray key can't set one off; shortcuts with a modifier and named keys such as F2 keep working. This meets WCAG 2.1.4 (Character Key Shortcuts) with the default "?". New labels `singleKeyShortcuts` and `singleKeyHint`, in English, Indonesian and every language pack. The conformance report's 2.1.4 row now says what ships.

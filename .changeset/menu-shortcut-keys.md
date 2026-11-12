---
"serupa-ds": minor
---

MenuItem's `shortcut` takes keys as Kbd does: `shortcut={['mod', 'K']}` shows "⌘K" on a Mac and "Ctrl+K" elsewhere, with modifiers in each platform's order ("⇧⌘Z", "Ctrl+Shift+Z"), and `aria-keyshortcuts` says Meta or Control to match. Text still shows as written.

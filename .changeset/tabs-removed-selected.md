---
"serupa-ds": patch
---

- Fixed: Tabs: removing the selected tab in uncontrolled Tabs (a closable tab, say) left no tab selected and no panel showing. Every tab had `tabindex="-1"`, so the tab list couldn't be reached with the keyboard. The next enabled tab, or else the previous one, is now selected and `onValueChange` is called. Controlled Tabs warn in the console instead.
- Fixed: Tabs: a `defaultValue` that matches no tab now selects the first enabled tab.

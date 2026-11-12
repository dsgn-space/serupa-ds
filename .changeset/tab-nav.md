---
"serupa-ds": minor
---

Added: TabNav and TabNavLink, for moving between the sub-pages of one thing (a project's Overview, Activity and Settings) when each has its own URL. It looks like Tabs, with the same variants, sizes and tokens, but it's a nav of links with `aria-current="page"` on the current one, so people move with Tab and links work as links (open in a new tab, bookmark, share). `as` takes your router's link. PageHeader's `sections` now draw a TabNav, so the current section has the tab line under it instead of only a bolder weight.

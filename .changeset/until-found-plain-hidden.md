---
"@diki-stwn/serupa-ds": patch
---

Tabs, Accordion and Sidebar: in Safari (and Firefox before 139), which don't support `hidden="until-found"`, a kept tab panel, a closed item's content and a closed group are now plainly hidden. Before, a display utility on them could show them, and screen readers found their contents twice. Find-in-page still reaches them where the browser supports it.

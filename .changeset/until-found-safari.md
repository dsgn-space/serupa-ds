---
"@diki-stwn/serupa-ds": patch
---

Tabs, Accordion and the components built on them: in Safari, content kept hidden with `hidden="until-found"` stays hidden even when it has its own display class. Before this fix, a kept panel of another tab with a class like `flex` showed under the selected one, so every panel's content was on the page at once. WebKit doesn't know the `until-found` value, so the base styles now hide that content with `content-visibility: hidden`, as Chrome and Firefox already do.

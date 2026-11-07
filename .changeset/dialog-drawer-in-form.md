---
"serupa-ds": patch
---

- Fixed (Dialog): opened inside a page `<form>` while holding a form or a text field, it warns once in development (`overlay-in-form`), as Popover does, since Enter there submits the page's form or reloads the page. The README says to place it after the form.
- Fixed (Drawer): the same warning and README rule.

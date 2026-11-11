---
"serupa-ds": patch
---

Fixed (Popover): opened inside a page `<form>` with a form or a field in it, Popover warns in development (`overlay-in-form`). Its panel renders where it's placed, so there its own form nests in the page's form (Enter reloads the page) and Enter in its field submits the page's form. The README says to place it after the form.

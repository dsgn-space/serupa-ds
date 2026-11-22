---
"@diki-stwn/serupa-ds": minor
---

Popover takes the same focus props as Dialog and Drawer. `initialFocus` also takes a ref to an element inside, which gets focus when it opens. The new `finalFocus` is a ref to where focus goes when Escape or `close()` closes it, while that element is still on the page; otherwise focus goes back to the trigger. `'first'` and `'panel'` work as before.

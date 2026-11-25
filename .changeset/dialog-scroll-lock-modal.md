---
"@diki-stwn/serupa-ds": patch
---

Dialog and Drawer lock the page's scroll only while one is open as a modal. An open `<dialog class="srp-dialog">` drawn inside the page (as a picture or a static mock-up does, and as the docs' anatomy pictures of Image and Lightbox do) no longer stops the whole page scrolling.

---
'serupa-ds': patch
---

Navbar: a sticky bar leaves the page alone when something takes focus with `preventScroll`. It used to scroll the page to whatever took focus out of the window, which cut short a smooth scroll already on its way there: a TableOfContents link under a sticky Navbar jumped to its heading instead of gliding.

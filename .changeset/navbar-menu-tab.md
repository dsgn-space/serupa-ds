---
"serupa-ds": patch
---

- Fixed: Navbar: with the small-screen menu open, Tab goes from the menu button into the links. Before, the links came before the button in the DOM, so Tab went on into the page with the menu still open over it (WCAG 2.4.3). Focus leaving the bar now closes the menu.

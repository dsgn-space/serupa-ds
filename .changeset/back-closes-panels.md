---
"@diki-stwn/serupa-ds": patch
---

Back on a phone now closes the Navbar's small-screen menu and its open NavbarMenu panel (the panel first), and asks to close a non-modal Drawer, before it leaves the page. Before, only popups and modal dialogs got it. Escape on the page still leaves a non-modal Drawer open.

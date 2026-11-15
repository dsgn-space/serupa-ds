---
"@diki-stwn/serupa-ds": patch
---

Menus and tabs, smoother by keyboard and pointer:

- **Menu:** a diagonal move toward an open submenu keeps it open while the pointer crosses the items below or above on the way (the "safe triangle" of native menus). Resting on another item still closes it after 150ms.
- **Menu:** Space on a `MenuCheckboxItem` or `MenuRadioItem` changes it and keeps the menu open, so several settings take one trip. Enter and a click still choose and close.
- **Menubar:** pointing from one open menu to the next swaps them at once, with no fade out and in.
- **Tabs:** a `TabPanel` that starts with a link, button or field is no longer a Tab stop of its own, so Tab from the tab lands on that first. A panel that starts with text still takes focus.

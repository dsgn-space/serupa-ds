---
"serupa-ds": patch
---

- Fixed: Menu, Popover, Combobox, DatePicker, DateRangePicker, TimePicker and Tooltip: when neither side of the trigger has room (a short window, a phone held sideways, a trigger in a sticky header), the pop-up opens on the roomier side, gets as tall as the room it has and scrolls inside, so all of it stays on screen. Before, it kept its side and ran off the screen, and its last items couldn't be reached.

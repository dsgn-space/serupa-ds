---
"@diki-stwn/serupa-ds": minor
---

Accessibility: the keyboard's place in a list now shows by more than a fill, and remove buttons on badges and tags take a bigger press on touch screens.

- **Menus and list boxes show a bar.** The keyboard-highlighted item of Menu, Combobox, Select, TimePicker, MentionInput, PhoneInput and CommandPalette has a 2px bar at its start, 3:1 on the fill and on the list (`highlight-indicator` is zinc-500 in light, zinc-400 in dark).
- **Bigger touch targets.** On a touch screen, the × on a removable Badge takes a 44px press, and TagGroup's × a 44px-tall one.

To keep the old fill-only highlight, set `--highlight-indicator: var(--highlight)`.

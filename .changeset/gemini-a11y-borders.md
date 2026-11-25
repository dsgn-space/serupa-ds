---
"@diki-stwn/serupa-ds": minor
---

Accessibility: control edges and the keyboard's place in a list now meet WCAG 2.2 AA in every theme, without the more-contrast setting.

- **Field borders are 3:1.** `field-border` is zinc-500 in light and dark (was zinc-300 and zinc-700), 3:1 or more on the field and the page. It reaches Input, Textarea, Select, Combobox, the pickers, Checkbox, Radio, PinInput and SegmentedControl. `field-border-hover` and `field-border-pressed` move a step with it.
- **Outline buttons have a 3:1 edge.** `button-outline-border` is `border-control` (was `border-overlay`).
- **Menus and list boxes show a bar.** The keyboard-highlighted item of Menu, Combobox, Select, TimePicker, MentionInput, PhoneInput and CommandPalette has a 2px bar at its start, 3:1 on the fill and on the list (`highlight-indicator` is zinc-500 in light, zinc-400 in dark).
- **Bigger touch targets.** On a touch screen, the × on a removable Badge takes a 44px press, and TagGroup's × a 44px-tall one.
- **Docs fixes.** The accessibility conformance report now says 1.4.11 Supports.

To keep the old softer field line in your app, set `--field-border: var(--border-strong)` (under 3:1). To keep the old fill-only highlight, set `--highlight-indicator: var(--highlight)`.

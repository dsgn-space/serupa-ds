---
"serupa-ds": patch
---

- Fixed: every component's corners now follow the radius roles. Accordion, Calendar, Chart's tooltip, Chat, CodeBlock, ColorPicker, Combobox, CommandPalette, DatePicker, ErrorSummary, Loader's skeleton, OfflineBanner, Popover's sheet, Prose, Rating, Slider, SortableList, Stepper, Tabs, TimePicker, Tour and TreeView named a step of the rounded scale (`rounded-sm` … `rounded-xl`), so a brand that set `--radius-control` or `--radius-surface` left them behind. They now read `radius-inner`, `radius-control`, `radius-surface` or `radius-container`, at the same size as before, and their component radius tokens default to the role. Nothing looks different in the six themes.
- If your app made these components rounder by overriding `--rounded-md` and its neighbours, override the role (`--radius-control`) or the component's own token (`--code-block-radius`) instead.

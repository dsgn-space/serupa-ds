---
"serupa-ds": minor
---

Select draws its open list like Combobox's where the browser allows it (`appearance: base-select`, Chromium-based browsers today): an overlay surface with the shared shadow and corners, rows at control height, the grey highlight fill on the active option, and a tick on the chosen one. Other browsers keep their own list, and the API and the way it reads out don't change. In a styled list ArrowDown opens the list rather than picking the next option, as on macOS. New component tokens: `--select-picker-bg`, `--select-picker-border`, `--select-picker-radius`, `--select-picker-shadow`, `--select-picker-depth`, `--select-picker-max-height`, `--select-picker-padding`, `--select-option-height`, `--select-option-height-touch`, `--select-option-padding-x`, `--select-option-bg-active`, `--select-option-indicator`, `--select-check` and `--select-group-label`.

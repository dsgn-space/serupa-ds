---
"serupa-ds": patch
---

- Fixed (Combobox): an option held down fills one step past the highlight (`pressed`, `--combobox-option-bg-pressed`), as a Menu item and a CascadeSelect option do. Before, nothing showed until the list closed.
- Fixed (CommandPalette): an option held down fills one step past the highlight (`--command-palette-option-bg-pressed`). A disabled option stays as it is.
- Fixed (Calendar): a disabled month or year is drawn as a disabled day is, in `disabled-text` and struck through. It was the whole button faded by opacity.

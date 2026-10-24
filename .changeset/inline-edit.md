---
"serupa-ds": minor
---

- Added: InlineEdit, text that opens into a field in place. A click, Enter or Space opens it with the text selected; Enter or leaving the field saves, Escape cancels (without closing a surrounding Dialog), and keyboard saves and cancels put focus back. It has `value`/`defaultValue`/`onValueChange`, `validate` (a message keeps it open and describes the field), `placeholder`, `size`, `editing`/`onEditingChange`, `disabled`, `readOnly` and `inputProps`, with 8 `--inline-edit-*` tokens. Both modes share Input's height and padding, so opening it moves nothing.
- Added: the `edit` label ("Edit", "Ubah" in `idLabels`).

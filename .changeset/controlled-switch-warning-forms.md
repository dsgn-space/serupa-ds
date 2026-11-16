---
"@diki-stwn/serupa-ds": patch
---

CheckboxGroup, RadioGroup, NumberInput, SearchInput, PasswordInput (`visible`), PinInput, InlineEdit, ColorPicker, TagGroup and List (`selected`) now warn once in development (`controlled-switch`) when their controlled value turns `undefined`, or the other way round, which often happens while a form's state loads or resets. Before, the field quietly showed its own, often stale, value. Otherwise they follow the prop as before.

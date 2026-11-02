---
"serupa-ds": minor
---

Combobox: options can be grouped under headings with `{ label, options, disabled? }`, as Select's `optgroup`. Each group is a `role="group"` named after its heading, the arrows run through every group, typing hides a heading once none of its options match, and a disabled group turns off every option in it. Long grouped lists are still drawn only in view. New type `ComboboxOptionGroup`.

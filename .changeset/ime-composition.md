---
"serupa-ds": patch
---

- Fixed: typing with an input method (Japanese, Chinese, Korean) triggered actions. Enter confirms a composition and Escape cancels it, but the components acted on those keys:
  - Combobox picked the highlighted option while "Ja" was still being composed.
  - SearchInput cleared the field on Escape and searched with half-typed text on Enter.
  - TimePicker, DatePicker, DateRangePicker and NumberInput read the half-typed text.
  - Menu, Popover, Tooltip and Navbar closed on Escape.

  Key handlers now ignore keydowns that belong to a composition (`isComposing`, or keyCode 229).

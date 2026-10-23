---
"serupa-ds": patch
---

Combobox, DatePicker, DateRangePicker, TimePicker, Slider and SegmentedControl now go back to their defaultValue when their form is reset. That includes `form.reset()`, a reset button, and React 19 resetting a form after its action. Before this fix they kept submitting and showing the last choice. Controlled ones are left to the app, as with a native field.

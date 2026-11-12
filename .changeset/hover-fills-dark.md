---
"serupa-ds": patch
---

The pointer now shows on DatePicker's and DateRangePicker's calendar button, TimePicker's clock button, PhoneInput's country part, a day or preset in Calendar and a CascadeSelect option in the dark themes. Their hover fill was `surface-muted`, which in dark is the same colour as the field and the popup. The buttons in fields now take `secondary` on hover, as PasswordInput's and NumberInput's do. Calendar's days take `secondary` too, as Pagination's pages do, and a day of another month turns to full text under the pointer, so it keeps 4.5:1. CascadeSelect's options take `highlight`, as Combobox's and Menu's do. The component tokens (`--date-picker-button-bg-hover`, `--calendar-day-bg-hover` and the rest) still override each one, and Calendar has a new `--calendar-outside-color-hover`.

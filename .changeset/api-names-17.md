---
"@diki-stwn/serupa-ds": major
---

The same idea takes the same prop name and the same callback shape on every component.

- **What breaks:**
  - `leftIcon` and `rightIcon` are `startIcon` and `endIcon` (Badge, Button, Combobox, Input, NumberInput, PasswordInput, PhoneInput, Select, SplitButton), and their classes `--left`/`--right` are `--start`/`--end` (`srp-btn--icon-start`, `srp-input__icon--end`). Button's `iconPosition` takes `'start'` or `'end'`.
  - `active` on BottomNavLink, NavbarLink, NavbarMenu, NavbarMenuLink and SidebarItem is `current`.
  - Text's `tone="default"` is `tone="neutral"`, as on every other component.
  - Eleven callbacks that passed a bare second value pass a details object: Calendar and DatePicker `onValueChange(value, { iso })`, DateRangePicker and RangeCalendar `(value, { iso: { start, end } })`, PeriodPicker `(value, { range })`, Checkbox, Switch and TableSelectCell `onCheckedChange(checked, { event })`, CheckboxGroup and RadioGroup `onValueChange(value, { event })`, Pagination `onPageSizeChange(pageSize, { page })`.
- **Why:** the deep audit of 21 Nov 2026 found the same idea under two names (`active` and `current`, `leftIcon` and `startIcon`, `default` and `neutral`) and callbacks of two shapes. `start` and `end` follow the reading direction, so they are right in Arabic and Hebrew too. Button keeps `variant` and `destructive`, the one exception (Diki's choice).
- **Migration:** `serupa-migrate --from 16` renames the icon props, `active` and Text's tone (transforms `icon-start-end`, `nav-current`, `text-tone-neutral`), and lists each handler of the eleven callbacks that reads its second argument (`callback-details`): read `details.iso`, `details.event`, `details.range` or `details.page` there instead.

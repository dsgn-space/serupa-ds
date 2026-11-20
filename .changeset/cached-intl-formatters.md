---
"@diki-stwn/serupa-ds": patch
---

Formatting dates, numbers, relative times and lists reuses one formatter for each locale and set of options, instead of building one in every render. Building a formatter costs about as much as using it twenty times. On main, six re-renders of a Countdown, a RelativeTime and two Chat parts built 90 formatters; they now build none. This affects Countdown, RelativeTime, Chat, DateRangePicker, RangeCalendar, Table, StatusTracker, Stepper, Tour, FieldList, ErrorSummary, CommandPalette, FilterBar, DateField, ColorPicker and TransferList.

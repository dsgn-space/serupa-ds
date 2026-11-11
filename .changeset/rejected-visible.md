---
'serupa-ds': minor
---

DatePicker, DateRangePicker, TimePicker and NumberInput: when typed text is put back, why ("“soon” wasn’t accepted, so the previous value was kept.") now also shows under the field and is read with it (aria-describedby), until the text changes. Before, only screen readers heard it while the value jumped back on screen. New token `--input-rejected-color` (default `text-muted`).

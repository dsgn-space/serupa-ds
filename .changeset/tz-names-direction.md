---
"@diki-stwn/serupa-ds": patch
---

TimeZonePicker's zone names read in their own `locale`'s direction: with `locale="ar-EG"` in a left-to-right page, "UTC+07:00 · توقيت غرب إندونيسيا" reads right to left, as TimePicker's times and FormattedDate do.

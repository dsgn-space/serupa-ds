---
"@diki-stwn/serupa-ds": minor
---

Calendar, RangeCalendar, DatePicker and DateRangePicker take a `calendar` prop, so the grid can show the months people date things in: `'persian'`, `'islamic-umalqura'` (and `'islamic-civil'`, `'islamic-tbla'`), `'indian'`, `'buddhist'`, `'japanese'` or `'roc'`. Persian, Hijri and Indian months start and end on their own days; Buddhist, Japanese and ROC keep the Gregorian months and name the years their way. The title, day names, month and year grids and month menus follow it. Values stay `Date`s, digits stay Latin, and the pickers' typed dates stay Gregorian. Without the prop, nothing changes, also for a locale with a `-u-ca-` extension.

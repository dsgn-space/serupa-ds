---
"@diki-stwn/serupa-ds": patch
---

Patterns write their dates and durations with FormattedDate, `formatDate` and Duration, so they follow the reader's language and their own `locale`: "Preparation 10 min" reads "Persiapan 10 mnt" in Indonesian, a timesheet's week reads "9.–15. Februar 2026" in German, and a moment's `datetime` is a full ISO time.

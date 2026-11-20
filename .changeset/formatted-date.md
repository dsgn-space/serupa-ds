---
"@diki-stwn/serupa-ds": minor
---

Added: FormattedDate (beta), a date, a time or a range of dates written the way the reader's locale writes it ("Nov 20, 2026", "20 Nov 2026", "Nov 20 – 22, 2026"), as a `<time>` with a machine-readable `datetime`. A `"yyyy-mm-dd"` day is that day in every time zone; a moment is shown in the reader's zone, or in `timeZone`. `formatDate` gives the same text outside React.

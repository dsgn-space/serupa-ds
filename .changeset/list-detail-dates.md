---
"serupa-ds": patch
---

- Fixed (List and detail pattern): dates read in the reader's locale, such as "6 Nov 2026" in the list and "6 November 2026" on the open message, instead of "2026-11-06", and keep the ISO day in `dateTime`.

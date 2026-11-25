---
"@diki-stwn/serupa-ds": minor
---

- Added: `sm:table-cell` and the other breakpoint variants of `table-cell`, so a table column can hide on a phone (`hidden sm:table-cell`).
- Fixed (Table): on a phone (below 640px) each cell keeps 8px a side rather than 12px, so a table fits a 390px screen more often. `--table-padding-x` still sets it everywhere.
- Fixed (Transactions): on a phone the date and the category show under each description rather than in columns of their own, so the table fits a 390px screen in every language with money in and money out still in their own columns.
- Fixed (Invoice): on a phone each line's quantity and price show under its description ("2 × $1,200.00"), so the lines fit a 390px screen in every language.
- Fixed (List with search and filters): on a phone each project's owner shows under its name, so the table fits with the date still on one line.
- Fixed (FormattedDate): a date with a time wraps between the two, never inside either ("Nov 12, 2026," then "8:00 AM"), with the same words. Activity log's When column wraps this way on a phone.
- Fixed (Billing): an invoice's date reads in the locale's medium style, as in List search and Referral, and a failed payment's status says "Failed".
- Fixed (Referral): a long email breaks after its @ rather than pushing the table wider.
- Fixed (API keys, Data import): their tables pin the first column (API keys also the last) when they scroll sideways on a phone.

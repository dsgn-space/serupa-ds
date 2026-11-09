---
"serupa-ds": minor
---

Added: DescriptionList and DescriptionItem, a `<dl>` of terms and their details. Three layouts: `inline` (default; the term in a column a third wide beside its details, stacked when the list is under 480px wide, by a container query), `stacked`, and `split` (details at the end of the term's row in tabular figures, wrapping under it when both don't fit). `dividers` draws hairlines between items and `emphasis` makes a row such as a total larger and semibold. Long values wrap anywhere and every side is logical, so right-to-left mirrors. KeyboardShortcuts, and the DetailPage and Checkout patterns, now use it instead of their own lists.

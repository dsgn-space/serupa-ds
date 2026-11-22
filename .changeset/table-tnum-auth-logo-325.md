---
"@diki-stwn/serupa-ds": patch
---

Fixed (Table): only a cell with `align="end"` sets tabular figures, as the README says and as DataGrid does. A start cell keeps Inter's proportional figures. Inter's tabular hyphen is 9px wide where the proportional one is 6.5px, so in a start cell a word like "hotel-invoice.pdf" was spread apart.

Changed (Patterns):
- Sign up, Password reset and Accept invite show the same drawn logo as Sign in, instead of the name in bold text.
- Product page: the header's Cart link is link blue and underlined on hover, as on the other shop screens.
- Product compare: prices in the header row are in text color, not the header's muted color.
- Quiz, Saved items, Store locator and Product compare: the result count is 14px, as on the other screens.

Changed (Footer block): the content sits in a Container size "lg", the same width and side padding as a PageSection size "lg", so its links line up with the sections above it. On wide screens it used to start 16px further in.

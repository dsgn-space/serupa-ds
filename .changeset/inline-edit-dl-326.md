---
"@diki-stwn/serupa-ds": patch
---

Fixed (InlineEdit): as a value in a DescriptionList (not `layout="split"`), its text now starts where the plain values above and below it start, and its row is as tall as theirs. Before, its button's padding and height pushed the text 13px right and 6px down. Its hover background still shows the whole button.

Changed (Patterns): Appointment's calendar keeps its own width, as in Booking and Leave request, instead of stretching across the column with its days 96px apart.

---
"@diki-stwn/serupa-ds": patch
---

- Changed (Patterns): in Saved items, a sold-out item's Remove button is alone in its row, so its word now starts where the card's text starts instead of 9px in. Its padding and border sit past the edge, so the hover fill still shows the whole button.
- Fixed (Form): the `checks` prop's description held a whole example in one line of code, which made Form's props table 254px wider than the docs page at 1280px. It now says the same in words.

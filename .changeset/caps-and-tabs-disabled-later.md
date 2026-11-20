---
"@diki-stwn/serupa-ds": patch
---

- Rating draws at most 20 stars, and PinInput at most 32 boxes. A `max` or `length` from bad data, such as a total or an id, drew that many and could freeze the page.
- Tabs: when a tab is disabled after its panel was kept hidden, the panel is now plainly hidden. Before, find-in-page or an invalid field in a form could still show it.

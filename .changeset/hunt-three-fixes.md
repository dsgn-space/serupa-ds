---
"@diki-stwn/serupa-ds": patch
---

- Slider with `marks` on a long range (0 to 100,000) spreads its ticks over the whole track. Before, they stopped after 1,001, a tenth of the way along.
- StatusTracker draws when a day's date doesn't read as one, leaving that day unnamed. Before, it threw and the whole strip was lost.
- CommentThread keeps another comment's edit box open, with its draft, when an earlier save settles after it opened. Before, the save closed it and the draft was lost.

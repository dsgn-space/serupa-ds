---
"serupa-ds": patch
---

Kanban: big boards keep up. Each card redraws only when its item, its place or `renderCard` changes, so moving a card by keyboard on a board of 3 columns of 1,000 takes about 9 ms a step rather than 220 ms, and a drop about 30 ms rather than 270 ms. A pointer drag moves only the dragged card instead of checking every card. For this to hold, pass a `renderCard` that stays the same between renders.

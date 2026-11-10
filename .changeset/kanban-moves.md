---
"serupa-ds": patch
---

Kanban: a pointer drag re-renders the board only when the card's place changes. Moves within the same place, which are most of them, now just move the card under the pointer, so a board with many cards no longer redraws every card on every pointer move.

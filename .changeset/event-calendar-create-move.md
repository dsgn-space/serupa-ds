---
"serupa-ds": minor
---

EventCalendar: add and move events. `onSlotSelect` gets the time people choose for a new event. In the month, a press on a day's empty space chooses the whole day. In the hours, a press chooses an hour and a drag down a day chooses a span by quarter hours. Enter or Space on a day chooses the whole day too. `onEventMove` makes events movable: drag one to another day or time, drag its end to change its length, or press Shift and an arrow key. The new times come back to you to save, and each move is said in words. A new `eventChanged` label says the move, in every language pack.

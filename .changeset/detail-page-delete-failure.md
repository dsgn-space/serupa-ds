---
"serupa-ds": patch
---

- Fixed (DetailPage pattern): a delete that fails keeps the dialog open and says "Couldn't delete … Try again." in an alert, with focus kept on the button and no unhandled rejection (GR177).
- Fixed (DetailPage pattern): Undo toasts still open when the project is deleted close without calling `onRemoveTask` after `onDelete` (GR178).
- Fixed (DetailPage pattern): the delete dialog counts the tasks still there, says "1 task", and leaves tasks out when there are none (GR179).
- Fixed (DetailPage pattern): a saved name or description is trimmed (GR180).
- Fixed (DetailPage pattern): Created shows the date in the reader's locale, such as "14 September 2026", and keeps the ISO date in `dateTime` (GR181).

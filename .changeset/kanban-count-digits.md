---
"serupa-ds": minor
---

- Fixed: Kanban writes a column's count against its limit ("2 of 1") in the locale's digits, as it already did a count alone.
- Changed: the `kanbanCount` label gets both numbers as text already written in the locale's digits (`(count: string, limit: string)`), so a custom label pack joins them as they are.

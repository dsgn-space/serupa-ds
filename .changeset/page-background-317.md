---
"serupa-ds": patch
---

Changed (Patterns): design decision, following the page-background rule. The seven pages built from Cards (AddressBook, Agenda, Approvals, OrderHistory, SavedItems, StatusPage, StoreLocator) now sit on `bg-surface-muted` with a `bg-surface` header, so each Card stands off the page. TaskBoard keeps the plain page, since Kanban's columns are already muted wells; the rule in Build a page now says so.

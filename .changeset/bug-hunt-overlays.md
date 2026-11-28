---
"@diki-stwn/serupa-ds": patch
---

Fixes in overlays, feedback and navigation, from a bug hunt:

- **Toast**: two toasts with the same title and different descriptions made of elements stay two; an action that shows a new toast under the same id keeps it; a toast shown while the tab is hidden waits for the tab.
- **Tooltip**: disabled while open, then enabled again with the pointer gone, it stays closed; a hover while disabled doesn't show it later.
- **Controlled overlays** (DatePicker, DateRangePicker, TimePicker, PeriodPicker and the rest built on the shared open state): every press asks `onOpenChange` again when the app keeps it open, not only the first.
- **Tabs**: closing a focused tab next to the selected one moves focus to the selected tab, not the page.
- **DataGrid**: an edit left by clicking a field outside the grid is saved and focus stays on that field.
- **FilterBar**: turning a switch filter off in its editor keeps the editor open; the filter goes when it closes.
- **Chart**: a heatmap with no series draws its labels at real positions.
- **useSteps**: a start step that isn't whole opens a real step; with no steps, `next` and `goTo` do nothing.
- **TableOfContents**: on a page too short to scroll, the first section is current; headings in a `hidden` part aren't listed until it shows.
- **Virtual lists** with a header above the rows: past the height limit, ArrowDown moves down, not back up.

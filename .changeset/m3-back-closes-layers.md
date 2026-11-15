---
"@diki-stwn/serupa-ds": minor
---

The phone's Back gesture or button closes an open Menu, Popover, HoverCard, Tour step, or the list of a Combobox, CascadeSelect, PeriodPicker, DatePicker, DateRangePicker, TimePicker or MentionInput, before it leaves the page, the way Escape does: innermost first, with focus back on the trigger. Before, only Dialog and Drawer closed on Back, so on Android Back with a Menu open left the page. It uses the browser's close request (CloseWatcher, in Chromium browsers); elsewhere nothing changes. Escape pressed while focus is outside an open layer now closes it too. Tooltips are left alone.

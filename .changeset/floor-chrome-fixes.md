---
"serupa-ds": patch
---

Fixes found by running the tests in Chrome 123, the oldest supported Chrome:

- EventCalendar: times are written with a plain space before AM and PM in every browser. Chrome before 124 and older Safari wrote a narrow one, which didn't match the server's text, so a server-rendered EventCalendar was drawn again from scratch on load.
- DataGrid: Ctrl+C and Ctrl+V on the focused cells work when no text is selected, in Chrome before 125, which sends them to the page's body rather than to the cell.
- Link: `underline="hover"` keeps its underline inside a paragraph, where color alone can't tell a link from the text around it (WCAG 1.4.1). In a nav bar or a footer it still shows only on hover and focus.

---
"@diki-stwn/serupa-ds": patch
---

Faster scrolling and a smaller first script, from the Gemini review:

- **`dist/theme.js` is minified** (about 1.5 KB gzipped, down from 3.2 KB). It still carries its version banner and still works pasted into an inline `<script>`. Its notes stay in the guides.
- **Open menus, popovers and pickers follow a scroll once a frame**, from a passive listener, so scrolling the page never waits on them.
- **Virtualized lists and tables leave the wheel to the browser** unless they are past the 15-million-pixel limit, where they have to move the rows themselves. Scrolling a long Table or Combobox list no longer waits on a wheel listener.
- **A DataGrid paste or delete over many rows** reads the changes once, not once per row.

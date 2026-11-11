---
"serupa-ds": minor
---

- Added: `useBreakpoint(name)`, `useMediaQuery(query)` and `useReducedMotion()` for a project's own components. `useBreakpoint('md')` is true from 768px up, at the same widths as the `screen-*` tokens and the `md:` utilities, and follows the window as it resizes. Server HTML and hydration use `serverValue` (default `false`), so the first render never mismatches.
- Added: `useCopyToClipboard()`, CopyButton's copying for a control that isn't a CopyButton, such as a "Copy link" menu item. `copy(value)` resolves `true` once the text is on the clipboard and `false` when the browser refuses; `copied` stays true for `timeout` ms; it says "Copied", or why it couldn't, to screen readers unless `announce` is `false`, and works inside a modal Dialog and where the clipboard API is refused.

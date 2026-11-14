---
"serupa-ds": minor
---

Button's `icon` prop, which draws a button with only an icon, is deprecated and will be removed in 15.0.0. Use IconButton instead: it draws the same square button, and its `label` is required by the types, so an icon-only button can't ship without an accessible name. It also shows that label in a tooltip. Button's `icon` still works until then, and logs a deprecation warning once in development.

```jsx
// Before
<Button variant="ghost" icon="settings" aria-label="Settings" />
// After
<IconButton icon="settings" label="Settings" />
```

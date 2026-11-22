---
"@diki-stwn/serupa-ds": minor
---

Four leftover names take the shared ones. Each old name still works, warns once in development, and is removed in 19.0.0.

- **Added:** `surface` on Button, IconButton, Link, Divider and everything built on Button (CopyButton, ToggleButton, Fab, FabMenu). `surface="dark"` draws the control in white for dark media, and `surface="light"` draws it in black for light media.
- **Deprecated:** `onMedia`, which `surface` replaces with the same values. A prop named `on…` reads as an event handler, and lint rules and codemods treat it as one.
- **Added:** `emptyText` on TagGroup and NotificationCenter, the name Combobox and CommandPalette already use.
- **Deprecated:** `empty`, which `emptyText` replaces.
- **Added:** Toaster `placement="top"` and `placement="bottom"`, centered, the way a Placement names the middle.
- **Deprecated:** `placement="top-center"` and `placement="bottom-center"`. They still center the toasts.
- **Added:** the `ToasterPlacement` and `FabPlacement` types, named after the prop they type.
- **Deprecated:** `ToasterPosition` and `FabPosition`.

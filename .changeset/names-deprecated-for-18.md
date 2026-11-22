---
"@diki-stwn/serupa-ds": major
---

Four leftover names take the shared ones, and the old names are gone.

- **Added:** `surface` on Button, IconButton, Link, Divider and everything built on Button (CopyButton, ToggleButton, Fab, FabMenu). `surface="dark"` draws the control in white for dark media, and `surface="light"` draws it in black for light media.
- **Removed:** `onMedia`, which `surface` replaces with the same values. A prop named `on…` reads as an event handler, and lint rules and codemods treat it as one.
- **Added:** `emptyText` on TagGroup and NotificationCenter, the name Combobox and CommandPalette already use.
- **Removed:** `empty` on TagGroup and NotificationCenter, which `emptyText` replaces.
- **Added:** Toaster `placement="top"` and `placement="bottom"`, centered, the way a Placement names the middle.
- **Removed:** Toaster `placement="top-center"` and `placement="bottom-center"`. An unknown placement takes the default, `bottom-end`.
- **Added:** the `ToasterPlacement` and `FabPlacement` types, named after the prop they type.
- **Removed:** the `ToasterPosition` and `FabPosition` types.

- **What breaks:** `onMedia`, `empty`, `placement="top-center"`, `placement="bottom-center"`, `ToasterPosition` and `FabPosition` no longer exist. TypeScript names each, and at run time the old props do nothing.
- **Why:** one idea has one name in every component (CONTRIBUTING, API naming table). Diki asked for every held breaking change to go out in 18.0.0 rather than wait for another major.
- **Migration:** `npx serupa-migrate --from 17` renames all of them: `onMedia` to `surface`, `empty` to `emptyText` on TagGroup and NotificationCenter, `top-center` and `bottom-center` to `top` and `bottom` on Toaster, and the two types to `ToasterPlacement` and `FabPlacement`.

---
"serupa-ds": minor
---

Props follow the API naming table (CONTRIBUTING.md): one name for one idea, in every component.

- Tooltip: `openDelay`, as HoverCard names it. Deprecated (Tooltip): `delay`.
- Switch: `loading`, as Button names it. Deprecated (Switch): `pending`.
- Field: `orientation`. Deprecated (Field): `layout`.
- Splitter: `orientation`. Deprecated (Splitter): `direction`.
- Fab: `placement`. Deprecated (Fab): `position`.
- Toaster: `placement`. Deprecated (Toaster): `position`.

Each old name still works the same way as the new one, with a development warning, and is removed in 15.0.0, at least four weeks after this release. To move, rename the prop. Nothing else changes, including the `data-direction`, `data-position` and `data-layout` attributes.

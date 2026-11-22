---
"@diki-stwn/serupa-ds": major
---

Six more props take the name every other component uses for the same idea.

- **What breaks:**
  - Accordion and ToggleGroup: `type="single" | "multiple"` is `selectionMode`, as on List, TagGroup and TreeView.
  - BottomNav, Carousel, Toaster and AvatarGroup: `label` is `aria-label`, as on Navbar, Sidebar, Toolbar and the other landmarks and groups. BottomNav still needs one.
  - Switch: `labelPosition` is `labelPlacement`.
  - MentionInput: `trigger` (the character, "@") is `triggerChar`; `trigger` is the element that opens a Menu or Popover.
  - TableSelectCell and TableExpandCell: `header` (a boolean) is `inHeader`; `header` is content on Sidebar.
  - ListLoadingItems: `description` (a boolean) is `showDescription`; `description` is text everywhere else.
  - Drawer (and NotificationCenter's `placement`): `left` and `right` are gone. `start` and `end` follow the reading direction, and `end` is the default, the right in a left-to-right page as before.
- **Why:** the deep audit of 21 Nov 2026 found these said one idea with a second name, or used a name another component gives a different type. The naming table in CONTRIBUTING.md now has the selection, landmark-name and data-or-children rows, and `tools/test/props.mjs` holds a name that ends in `Position` or `Side` to `Placement`.
- **Migration:** `serupa-migrate --from 16` renames all of them on the tags (transforms `selection-mode`, `group-aria-label`, `switch-label-placement`, `mention-trigger-char`, `table-cell-in-header`, `list-loading-show-description`, `drawer-start-end`); a prop passed in a props object or a spread is yours to rename

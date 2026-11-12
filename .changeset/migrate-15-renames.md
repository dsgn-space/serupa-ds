---
"serupa-ds": patch
---

serupa-migrate: makes the seven prop renames that 15.0.0 will finish, so a project can move to the new names now, while both still work. Tooltip `delay` becomes `openDelay`, Switch `pending` becomes `loading`, Field `layout` and Splitter `direction` become `orientation`, Fab and Toaster `position` become `placement`, and OfflineBanner `onChange` becomes `onOnlineChange`. Run `npx serupa-migrate src --from 14` to see the changes, and add `--write` to make them.

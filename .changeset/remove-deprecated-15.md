---
"serupa-ds": major
---

- **Breaking.** Removed the names 14.x deprecated, so one prop means one thing everywhere (the API naming table). `npx serupa-migrate src --from 14 --write` makes every rename below; run it before upgrading, since the new names already work on 14.x.
  - Removed: Tooltip `delay` (use `openDelay`), Switch `pending` (use `loading`), Field `layout` and Splitter `direction` (use `orientation`), Fab and Toaster `position` (use `placement`), Drawer and NotificationCenter `side` (use `placement`), OfflineBanner `onChange` (use `onOnlineChange`), Table, DataGrid and List `busy` (use `loading`), and Button and Badge `loadingText` (use `loadingLabel`).
  - Removed: `variant="default"` on Checkbox, CheckboxGroup, Radio and RadioGroup (use `variant="plain"`).
  - Removed: Button's `icon`. An icon-only button is an IconButton, whose `label` is required by the types, so an icon-only button can't ship without a name. serupa-migrate lists each one to change by hand, since it can't write the label.
  - Removed: the 20 component tokens that put the state first, such as `--button-disabled-bg` (use `--button-bg-disabled`). The rest are in `.changeset/token-names-state-last.md` of 14.x and in the upgrade guide.
  - Removed: the `animate-bounce` utility, its `--animate-bounce` token and the `bounce` keyframes. It bounced without end (WCAG 2.2.2). Point down with a still icon, or let the content arrive once with `animate-enter`.

  **Migration:** run `npx serupa-migrate src --from 14 --write`, then fix what it lists by hand (each Button with `icon`, and any `animate-bounce`). The four-week wait between deprecating a name and removing it was waived for this release: some of these names were deprecated less than 28 days ago.
